import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useFetch } from "../hooks/useFetch";
import { apiRequest } from "../api/Client";
import SellerSidebar from "../components/organisms/SellerSidebar";
import { Wallet, ShoppingBag, Star, Download, Plus, Pencil, Trash2, Package } from "lucide-react";

export default function SellerDashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { data, loading, error, setData } = useFetch("/products?status=all", []);

    // Ambil semua pesanan toko ini — per_page besar supaya statistiknya menyeluruh
    const { data: ordersRes, loading: loadingOrders } = useFetch("/seller/orders?per_page=100", []);

    const [deletingId, setDeletingId] = useState(null);

    const allProducts = Array.isArray(data) ? data : data?.data || [];
    const myProducts = allProducts.filter(
        (p) => String(p.seller?.id) === String(user?.id)
    );

    const orders = ordersRes?.data || [];

    // Pendapatan hanya dihitung dari pesanan yang benar-benar menghasilkan uang.
    // Pesanan pending belum dibayar, cancelled sudah dibatalkan — keduanya dikecualikan.
    const revenueStatuses = ["paid", "shipped", "completed"];
    const totalSales = orders
        .filter((o) => revenueStatuses.includes(o.status))
        .reduce((sum, o) => sum + Number(o.total_amount ?? 0), 0);

    const totalOrders = orders.filter((o) => o.status !== "cancelled").length;
    const pendingShipment = orders.filter((o) => o.status === "paid").length;

    const avgRating =
        myProducts.length > 0
            ? (
                  myProducts.reduce((sum, p) => sum + Number(p.rating ?? 0), 0) /
                  myProducts.length
              ).toFixed(1)
            : "0.0";

    const formatPrice = (value) =>
        new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(value ?? 0);

    const handleDelete = async (productId) => {
        const confirmDelete = window.confirm(
            "Are you sure you want to delete this product?"
        );
        if (!confirmDelete) return;

        setDeletingId(productId);
        try {
            await apiRequest(`/products/${productId}`, { method: "DELETE" });
            setData((prev) => {
                const source = Array.isArray(prev) ? prev : prev.data;
                const updated = source.filter((p) => p.id !== productId);
                return Array.isArray(prev) ? updated : { ...prev, data: updated };
            });
        } catch (err) {
            alert(err.message || "Failed to delete product");
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <>
            <SellerSidebar />
            <div className="min-h-screen bg-white text-darkblue pt-24 px-5 pb-12 md:pl-[280px] md:pr-10">
                <div className="max-w-6xl mx-auto">
                    {/* Header */}
                    <div className="mb-8 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-darkblue">Dashboard Overview</h1>
                            <p className="text-sm text-black/60 mt-1">Your store performance at a glance.</p>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => alert("Export feature coming soon")}
                                className="inline-flex items-center gap-2 border border-black/15 text-darkblue text-sm font-medium py-2 px-4 rounded-lg hover:bg-black/5 transition"
                            >
                                <Download size={16} />
                                Export Data
                            </button>
                            <Link
                                to="/seller/products/new"
                                className="inline-flex items-center gap-2 bg-pastel-blue hover:bg-pastel-cyan text-white text-sm font-semibold py-2 px-4 rounded-lg transition"
                            >
                                <Plus size={16} />
                                Add New Product
                            </Link>
                        </div>
                    </div>

                    {loading && <p className="text-black/60">Loading dashboard...</p>}

                    {!loading && error && <p className="text-red-500">Error: {error}</p>}

                    {!loading && !error && (
                        <>
                            {/* Metrics */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-8">
                                <MetricCard
                                    label="Total Sales"
                                    value={loadingOrders ? "..." : formatPrice(totalSales)}
                                    note="From paid orders onward"
                                    icon={Wallet}
                                    iconBg="bg-pastel-blue/15"
                                    iconColor="text-pastel-blue"
                                />
                                <MetricCard
                                    label="Total Orders"
                                    value={loadingOrders ? "..." : String(totalOrders)}
                                    note={`${orders.length - totalOrders} cancelled`}
                                    icon={ShoppingBag}
                                    iconBg="bg-emerald-100"
                                    iconColor="text-emerald-600"
                                />
                                <MetricCard
                                    label="To Ship"
                                    value={loadingOrders ? "..." : String(pendingShipment)}
                                    note={pendingShipment > 0 ? "Needs your action" : "All caught up"}
                                    icon={Package}
                                    iconBg="bg-indigo-100"
                                    iconColor="text-indigo-500"
                                />
                                <MetricCard
                                    label="Average Rating"
                                    value={`${avgRating} / 5.0`}
                                    note={`Across ${myProducts.length} product${myProducts.length !== 1 ? "s" : ""}`}
                                    icon={Star}
                                    iconBg="bg-amber-100"
                                    iconColor="text-amber-500"
                                />
                            </div>

                            {/* Pengingat kalau ada pesanan menunggu dikirim */}
                            {!loadingOrders && pendingShipment > 0 && (
                                <Link
                                    to="/seller/orders?status=paid"
                                    className="flex items-center justify-between gap-3 bg-indigo-50 border border-indigo-100 rounded-xl px-5 py-3 mb-8 hover:bg-indigo-100/50 transition"
                                >
                                    <p className="text-sm text-indigo-700">
                                        You have <strong>{pendingShipment}</strong> order
                                        {pendingShipment !== 1 ? "s" : ""} waiting to be shipped.
                                    </p>
                                    <span className="text-sm font-semibold text-indigo-600 shrink-0">
                                        View →
                                    </span>
                                </Link>
                            )}

                            {/* Products table */}
                            <div className="bg-white border border-black/10 rounded-xl overflow-hidden">
                                <div className="px-5 py-4 border-b border-black/10 flex items-center justify-between">
                                    <h2 className="text-lg font-bold text-darkblue">Your Products</h2>
                                    <span className="text-sm text-black/40">
                                        {myProducts.length} total
                                    </span>
                                </div>

                                {myProducts.length === 0 ? (
                                    <p className="text-center text-black/50 py-12 text-sm">
                                        You haven't listed any products yet.
                                    </p>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left text-sm">
                                            <thead className="bg-black/5 text-black/50 uppercase text-xs tracking-wide">
                                                <tr>
                                                    <th className="px-5 py-3 font-semibold">Product</th>
                                                    <th className="px-5 py-3 font-semibold">SKU</th>
                                                    <th className="px-5 py-3 font-semibold">Price</th>
                                                    <th className="px-5 py-3 font-semibold">Stock</th>
                                                    <th className="px-5 py-3 font-semibold text-right">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-black/10">
                                                {myProducts.map((product) => (
                                                    <tr
                                                        key={product.id}
                                                        className={`hover:bg-black/5 transition-opacity ${
                                                            deletingId === product.id ? "opacity-50" : "opacity-100"
                                                        }`}
                                                    >
                                                        <td className="px-5 py-3">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-10 h-10 rounded-lg bg-black/5 overflow-hidden shrink-0">
                                                                    {product.thumbnail ? (
                                                                        <img
                                                                            src={product.thumbnail}
                                                                            alt={product.title}
                                                                            className="w-full h-full object-cover"
                                                                        />
                                                                    ) : (
                                                                        <div className="w-full h-full flex items-center justify-center text-black/30 text-[10px]">
                                                                            No img
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <span className="font-medium text-darkblue">
                                                                    {product.title}
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className="px-5 py-3 text-black/50 font-mono text-xs">
                                                            PRD-{String(product.id).padStart(3, "0")}
                                                        </td>
                                                        <td className="px-5 py-3">{formatPrice(product.price)}</td>
                                                        <td className="px-5 py-3">
                                                            <StockBadge stock={product.stock} status={product.status} />
                                                        </td>
                                                        <td className="px-5 py-3 text-right">
                                                            <div className="flex items-center justify-end gap-3">
                                                                <button
                                                                    onClick={() => navigate(`/seller/products/${product.id}/edit`)}
                                                                    className="text-black/50 hover:text-pastel-blue transition"
                                                                    aria-label="Edit"
                                                                >
                                                                    <Pencil size={16} />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDelete(product.id)}
                                                                    disabled={deletingId === product.id}
                                                                    className="text-black/50 hover:text-red-500 transition disabled:opacity-40"
                                                                    aria-label="Delete"
                                                                >
                                                                    <Trash2 size={16} />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </>
    );
}

function MetricCard({ label, value, note, icon: Icon, iconBg, iconColor }) {
    return (
        <div className="bg-white border border-black/10 rounded-xl p-5 relative overflow-hidden">
            <div className={`absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center ${iconBg}`}>
                <Icon size={18} className={iconColor} />
            </div>
            <p className="text-xs font-semibold text-black/50 uppercase mb-2 pr-12">{label}</p>
            <h3 className="text-xl md:text-2xl font-bold text-darkblue mb-1">{value}</h3>
            <p className="text-xs text-black/40">{note}</p>
        </div>
    );
}

function StockBadge({ stock, status }) {
    if (status === "draft") {
        return (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-black/10 text-black/60">
                Draft
            </span>
        );
    }

    if (stock <= 5) {
        return (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-600">
                Low Stock ({stock ?? 0})
            </span>
        );
    }

    return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
            In Stock ({stock ?? 0})
        </span>
    );
}