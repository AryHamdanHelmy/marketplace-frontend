import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { apiRequest } from "../api/Client";
import {
    ArrowLeft, Shield, Store, ShoppingBag, Package, MapPin,
} from "lucide-react";

const ROLE_STYLE = {
    admin:  { className: "bg-accentSoft text-accent",     icon: Shield },
    seller: { className: "bg-primarySoft text-primary",   icon: Store },
    buyer:  { className: "bg-ink-100 text-textSecondary", icon: ShoppingBag },
};

const rupiah = (value) =>
    "Rp " + Number(value ?? 0).toLocaleString("id-ID", { maximumFractionDigits: 0 });

export default function UserDetails() {
    const { id } = useParams();

    const [user, setUser] = useState(null);
    const [products, setProducts] = useState([]);
    const [productMeta, setProductMeta] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let ignore = false;

        (async () => {
            setLoading(true);
            setError(null);

            try {
                const userRes = await apiRequest(`/users/${id}`);
                const detail = userRes.data ?? userRes;

                if (ignore) return;
                setUser(detail);

                // Filtered by the database, not by the browser. Fetching every
                // product and filtering here only ever saw the first page.
                if (detail.role === "seller") {
                    try {
                        const productRes = await apiRequest(
                            `/products?seller_id=${id}&status=all&per_page=50`
                        );
                        if (!ignore) {
                            setProducts(productRes.data || []);
                            setProductMeta(productRes.meta || null);
                        }
                    } catch {
                        // The product list is supporting detail. Losing it
                        // shouldn't take down the profile above it.
                    }
                }
            } catch (err) {
                if (!ignore) setError(err.message || "Couldn't load this user.");
            } finally {
                if (!ignore) setLoading(false);
            }
        })();

        return () => {
            ignore = true;
        };
    }, [id]);

    const roleStyle = ROLE_STYLE[user?.role] || ROLE_STYLE.buyer;
    const RoleIcon = roleStyle.icon;

    return (
        <div className="min-h-screen bg-background text-textPrimary pt-24 px-4 pb-12">
            <div className="max-w-2xl mx-auto">

                <Link
                    to="/users"
                    className="inline-flex items-center gap-1.5 text-sm text-textSecondary hover:text-textPrimary transition mb-4"
                >
                    <ArrowLeft size={16} />
                    All users
                </Link>

                {loading && <p className="text-sm text-textSecondary">Loading...</p>}

                {!loading && error && (
                    <div className="bg-dangerSoft border border-danger/30 text-danger text-sm rounded-lg px-4 py-3">
                        {error}
                    </div>
                )}

                {!loading && !error && user && (
                    <>
                        {/* Identity */}
                        <div className="bg-surface border border-line rounded-xl p-5 mb-4">
                            <div className="flex items-start gap-4">
                                <span className="h-14 w-14 rounded-full bg-ink-100 text-textSecondary flex items-center justify-center shrink-0 text-xl font-semibold">
                                    {user.name?.charAt(0)?.toUpperCase() || "?"}
                                </span>
                                <div className="min-w-0 flex-1">
                                    <h1 className="text-heading text-textPrimary truncate">
                                        {user.name}
                                    </h1>
                                    <p className="text-sm text-textSecondary truncate">
                                        {user.email}
                                    </p>
                                    <span
                                        className={`mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium capitalize ${roleStyle.className}`}
                                    >
                                        <RoleIcon size={12} />
                                        {user.role}
                                    </span>
                                </div>
                            </div>

                            <div className="mt-4 pt-4 border-t border-line grid grid-cols-2 gap-3 text-sm">
                                <div>
                                    <p className="text-label uppercase text-textSecondary">
                                        User ID
                                    </p>
                                    <p className="text-textPrimary tabular mt-0.5">{user.id}</p>
                                </div>
                                {user.role === "seller" && (
                                    <div>
                                        <p className="text-label uppercase text-textSecondary">
                                            Products
                                        </p>
                                        <p className="text-textPrimary tabular mt-0.5">
                                            {productMeta?.total ?? products.length}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Shop */}
                        {user.role === "seller" && products[0]?.seller?.shop && (
                            <div className="bg-surface border border-line rounded-xl p-5 mb-4">
                                <p className="text-label uppercase text-textSecondary mb-2">
                                    Shop
                                </p>
                                <p className="text-sm font-semibold text-textPrimary">
                                    {products[0].seller.shop.name}
                                </p>
                                {products[0].seller.shop.city && (
                                    <p className="text-xs text-textSecondary inline-flex items-center gap-1 mt-1">
                                        <MapPin size={11} />
                                        {products[0].seller.shop.city}
                                        {products[0].seller.shop.province
                                            ? `, ${products[0].seller.shop.province}`
                                            : ""}
                                    </p>
                                )}
                                {products[0].seller.shop.is_open === false && (
                                    <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-ink-100 text-textSecondary">
                                        Closed
                                    </span>
                                )}
                            </div>
                        )}

                        {/* Their catalogue */}
                        {user.role === "seller" && (
                            <div className="bg-surface border border-line rounded-xl overflow-hidden">
                                <div className="px-5 py-4 border-b border-line flex items-center justify-between">
                                    <h2 className="inline-flex items-center gap-2 text-base font-bold text-textPrimary">
                                        <Package size={16} className="text-primary" />
                                        Products
                                    </h2>
                                    <span className="text-sm text-textSecondary tabular">
                                        {productMeta?.total ?? products.length}
                                    </span>
                                </div>

                                {products.length === 0 ? (
                                    <p className="p-8 text-center text-sm text-textSecondary">
                                        This seller hasn't listed anything yet.
                                    </p>
                                ) : (
                                    <div className="divide-y divide-line">
                                        {products.map((product) => (
                                            <Link
                                                key={product.id}
                                                to={`/products/${product.id}`}
                                                className="flex items-center gap-3 px-5 py-3 hover:bg-surfaceAlt transition"
                                            >
                                                <div className="w-11 h-11 rounded-lg bg-ink-100 overflow-hidden shrink-0">
                                                    {product.thumbnail ? (
                                                        <img
                                                            src={product.thumbnail}
                                                            alt={product.title}
                                                            loading="lazy"
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-textMuted text-[10px]">
                                                            No img
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm text-textPrimary truncate">
                                                        {product.title}
                                                    </p>
                                                    <p className="text-xs text-textSecondary mt-0.5 capitalize">
                                                        {product.status} · {product.stock ?? 0} in stock
                                                    </p>
                                                </div>

                                                <p className="text-sm font-semibold text-primary tabular shrink-0">
                                                    {rupiah(product.price)}
                                                </p>
                                            </Link>
                                        ))}
                                    </div>
                                )}

                                {productMeta && productMeta.total > products.length && (
                                    <p className="px-5 py-3 text-xs text-textSecondary bg-surfaceAlt border-t border-line">
                                        Showing {products.length} of {productMeta.total}.
                                    </p>
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}