import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { apiRequest } from "../api/Client";

export default function UsersDetail() {
    const { id } = useParams();

    const [user, setUser] = useState(null);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let ignore = false;

        async function fetchUserAndProducts() {
            try {
                setLoading(true);
                setError(null);

                // Ambil detail user
                const userData = await apiRequest(`/users/${id}`);
                const userDetail = userData.data ?? userData;

                // Ambil semua produk, lalu filter yang seller_id-nya sama dengan user ini.
                // (Dipakai kalau backend belum punya endpoint khusus /products?seller_id=)
                let sellerProducts = [];
                try {
                    const productData = await apiRequest("/products");
                    const productList = Array.isArray(productData)
                        ? productData
                        : productData.data ?? [];
                    sellerProducts = productList.filter(
                        (p) => String(p.seller?.id) === String(id)
                    );
                } catch (productErr) {
                    // Kalau fetch produk gagal, jangan sampai gagalkan seluruh halaman.
                    // Detail user tetap tampil, cuma daftar produknya kosong.
                    console.error("Gagal memuat produk:", productErr.message);
                }

                if (!ignore) {
                    setUser(userDetail);
                    setProducts(sellerProducts);
                }
            } catch (err) {
                if (!ignore) {
                    setError(err.message || "Terjadi kesalahan saat memuat data");
                }
            } finally {
                if (!ignore) {
                    setLoading(false);
                }
            }
        }

        fetchUserAndProducts();
        return () => {
            ignore = true;
        };
    }, [id]);

    return (
        <div className="min-h-screen bg-background text-darkblue pt-24 px-6 py-12">
            <div className="max-w-lg mx-auto">
                <Link
                    to="/users"
                    className="text-sm text-pastel-blue hover:underline mb-6 inline-block"
                >
                    ← Back to user list
                </Link>
                <h1 className="text-2xl font-semibold mb-6">Detail User</h1>

                {loading && <p className="text-black">Load data...</p>}

                {!loading && error && (
                    <p className="text-red-400">Error: {error}</p>
                )}

                {!loading && !error && user && (
                    <>
                        <div className="rounded-lg border border-black bg-black/5 divide-y divide-black mb-8">
                            <DetailRow label="ID" value={user.id} />
                            <DetailRow label="Name" value={user.name} />
                            <DetailRow label="Email" value={user.email} />
                            <DetailRow label="Role" value={user.role} />
                        </div>

                        {/* Daftar produk cuma relevan buat seller */}
                        {user.role === "seller" && (
                            <div>
                                <h2 className="text-lg font-semibold mb-3">
                                    Produk Terdaftar ({products.length})
                                </h2>

                                {products.length === 0 ? (
                                    <p className="text-gray-400 text-sm">
                                        Belum ada produk terdaftar.
                                    </p>
                                ) : (
                                    <div className="rounded-lg border border-black/10 divide-y divide-black/10">
                                        {products.map((p) => (
                                            <div
                                                key={p.id}
                                                className="flex justify-between px-4 py-3 text-sm"
                                            >
                                                <span className="text-gray-100">{p.title}</span>
                                                <span className="text-gray-400">
                                                    {p.price ? `Rp${Number(p.price).toLocaleString("id-ID")}` : "-"}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

function DetailRow({ label, value }) {
    return (
        <div className="flex justify-between px-4 py-3 text-sm">
            <span className="text-black">{label}</span>
            <span className="text-black">{value ?? "-"}</span>
        </div>
    );
}