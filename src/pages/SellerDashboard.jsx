import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiRequest } from "../api/Client";
import SellerSidebar from "../components/organisms/SellerSidebar";
import {
    Wallet, ShoppingBag, Star, Plus, Pencil, Trash2,
    TrendingUp, TrendingDown, Package, TriangleAlert, ArrowRight,
} from "lucide-react";

const RANGES = [
    { value: 1,  label: "Today" },
    { value: 7,  label: "7 days" },
    { value: 30, label: "30 days" },
];

const HEALTH_LABELS = {
    on_time_processing: "Shipped within 48h",
    order_fulfilment: "Orders not cancelled",
    buyer_rating: "Buyer rating",
    stock_availability: "Active products in stock",
};

const rupiah = (value) =>
    "Rp " + Number(value ?? 0).toLocaleString("id-ID", { maximumFractionDigits: 0 });

const compactRupiah = (value) => {
    const n = Number(value ?? 0);
    if (n >= 1_000_000) return `Rp ${(n / 1_000_000).toFixed(1)}jt`;
    if (n >= 1_000) return `Rp ${Math.round(n / 1_000)}rb`;
    return rupiah(n);
};

export default function SellerDashboard() {
    const navigate = useNavigate();

    const [range, setRange] = useState(30);
    const [stats, setStats] = useState(null);
    const [balance, setBalance] = useState(null);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [deletingId, setDeletingId] = useState(null);

    const loadStats = useCallback(async () => {
        try {
            const res = await apiRequest(`/seller/stats?range=${range}`);
            setStats(res.data);
        } catch (err) {
            setError(err.message || "Couldn't load your statistics.");
        }
    }, [range]);

    useEffect(() => {
        loadStats();
    }, [loadStats]);

    useEffect(() => {
        (async () => {
            try {
                const [balanceRes, productsRes] = await Promise.all([
                    apiRequest("/seller/balance"),
                    apiRequest("/seller/products?status=all&per_page=100&mine=1"),
                ]);
                setBalance(balanceRes.data);
                setProducts(productsRes.data || []);
            } catch (err) {
                setError(err.message || "Couldn't load your shop.");
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const handleDelete = async (productId) => {
        if (!window.confirm("Delete this product? This can't be undone.")) return;

        setDeletingId(productId);
        try {
            await apiRequest(`/products/${productId}`, { method: "DELETE" });
            setProducts((prev) => prev.filter((p) => p.id !== productId));
        } catch (err) {
            setError(err.message || "Failed to delete product");
        } finally {
            setDeletingId(null);
        }
    };

    const alerts = stats?.alerts;
    const health = stats?.store_health;

    return (
        <>
            <SellerSidebar />
            <div className="min-h-screen bg-background text-textPrimary pt-24 px-5 pb-12 md:pl-70 md:pr-10">
                <div className="max-w-5xl mx-auto">

                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-6">
                        <div>
                            <h1 className="text-2xl font-bold">Dashboard</h1>
                            <p className="text-sm text-textSecondary mt-0.5">
                                How your shop is doing.
                            </p>
                        </div>
                        <Link
                            to="/seller/products/new"
                            className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primaryHover text-white text-sm font-semibold py-2 px-4 rounded-lg transition"
                        >
                            <Plus size={16} />
                            Add Product
                        </Link>
                    </div>

                    {error && (
                        <div className="bg-dangerSoft border border-danger/30 text-danger text-sm rounded-lg px-4 py-3 mb-4">
                            {error}
                        </div>
                    )}

                    {/* Balance */}
                    <Link
                        to="/seller/balance"
                        className="block bg-surface border border-line rounded-xl p-5 mb-4 hover:border-lineStrong transition"
                    >
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <div className="flex items-center gap-2 text-textSecondary mb-1">
                                    <Wallet size={15} className="text-primary" />
                                    <span className="text-label uppercase">Available balance</span>
                                </div>
                                <p className="text-2xl font-bold tabular">
                                    {rupiah(balance?.balance)}
                                </p>
                            </div>
                            <ArrowRight size={18} className="text-textMuted shrink-0" />
                        </div>
                        {!balance?.payout_account && (
                            <p className="text-xs text-warning mt-3 pt-3 border-t border-line">
                                Add a payout account before you can withdraw.
                            </p>
                        )}
                    </Link>

                    {/* Range */}
                    <div className="flex gap-2 mb-4">
                        {RANGES.map((r) => (
                            <button
                                key={r.value}
                                onClick={() => setRange(r.value)}
                                className={`px-4 py-1.5 rounded-full text-sm transition ${
                                    range === r.value
                                        ? "bg-textPrimary text-white font-semibold"
                                        : "bg-ink-100 text-textSecondary hover:bg-ink-200"
                                }`}
                            >
                                {r.label}
                            </button>
                        ))}
                    </div>

                    {/* Metrics */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                        <MetricCard
                            label="Sales"
                            value={compactRupiah(stats?.sales?.total)}
                            change={stats?.sales?.change_percent}
                            icon={Wallet}
                        />
                        <MetricCard
                            label="Orders"
                            value={stats?.orders?.total ?? 0}
                            change={stats?.orders?.change_percent}
                            icon={ShoppingBag}
                        />
                        <MetricCard
                            label="Rating"
                            value={
                                stats?.rating?.average
                                    ? `${stats.rating.average} / 5`
                                    : "—"
                            }
                            note={
                                stats?.rating?.review_count
                                    ? `${stats.rating.review_count} review${stats.rating.review_count === 1 ? "" : "s"}`
                                    : "No reviews yet"
                            }
                            icon={Star}
                        />
                        <MetricCard
                            label="Shop health"
                            value={health?.score !== null && health?.score !== undefined ? `${health.score}%` : "—"}
                            note={health?.score === null ? "Not enough data yet" : undefined}
                            icon={TrendingUp}
                        />
                    </div>

                    {/* Revenue trend */}
                    {stats?.trend?.length > 1 && (
                        <div className="bg-surface border border-line rounded-xl p-5 mb-4">
                            <p className="text-label uppercase text-textSecondary mb-3">
                                Revenue, last {stats.range_days} days
                            </p>
                            <Sparkline data={stats.trend} />
                        </div>
                    )}

                    {/* Shop health breakdown — a score is only useful if you can
                        see which part is dragging it down. */}
                    {health?.breakdown && health.score !== null && (
                        <div className="bg-surface border border-line rounded-xl p-5 mb-4">
                            <p className="text-label uppercase text-textSecondary mb-3">
                                What makes up your score
                            </p>
                            <div className="space-y-3">
                                {Object.entries(health.breakdown).map(([key, value]) => (
                                    <div key={key}>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="text-textSecondary">
                                                {HEALTH_LABELS[key] || key}
                                            </span>
                                            <span className="font-semibold tabular">
                                                {value === null ? "No data" : `${value}%`}
                                            </span>
                                        </div>
                                        {value !== null && (
                                            <div className="h-1.5 rounded-full bg-ink-200 overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full ${
                                                        value >= 80
                                                            ? "bg-success"
                                                            : value >= 50
                                                                ? "bg-warning"
                                                                : "bg-danger"
                                                    }`}
                                                    style={{ width: `${value}%` }}
                                                />
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Needs attention */}
                    {(alerts?.awaiting_processing > 0 || alerts?.low_stock_count > 0) && (
                        <div className="mb-4">
                            <p className="text-label uppercase text-textSecondary mb-2">
                                Needs attention
                            </p>
                            <div className="space-y-3">
                                {alerts.awaiting_processing > 0 && (
                                    <Link
                                        to="/seller/orders?status=paid"
                                        className="flex items-center gap-3 bg-surface border border-line rounded-xl p-4 hover:border-primary transition"
                                    >
                                        <span className="h-10 w-10 rounded-lg bg-primarySoft text-primary flex items-center justify-center shrink-0">
                                            <Package size={18} />
                                        </span>
                                        <p className="flex-1 text-sm text-textPrimary">
                                            <strong>{alerts.awaiting_processing}</strong> order
                                            {alerts.awaiting_processing === 1 ? "" : "s"} waiting to be shipped
                                        </p>
                                        <ArrowRight size={16} className="text-textMuted shrink-0" />
                                    </Link>
                                )}

                                {alerts.low_stock_count > 0 && (
                                    <div className="bg-surface border border-line rounded-xl p-4">
                                        <div className="flex items-center gap-3 mb-3">
                                            <span className="h-10 w-10 rounded-lg bg-warningSoft text-warning flex items-center justify-center shrink-0">
                                                <TriangleAlert size={18} />
                                            </span>
                                            <p className="text-sm text-textPrimary">
                                                <strong>{alerts.low_stock_count}</strong> product
                                                {alerts.low_stock_count === 1 ? "" : "s"} running low
                                            </p>
                                        </div>
                                        <div className="space-y-2">
                                            {alerts.low_stock_products?.map((p) => (
                                                <div
                                                    key={p.id}
                                                    className="flex items-center justify-between gap-3 text-sm"
                                                >
                                                    <span className="text-textSecondary truncate">
                                                        {p.name}
                                                    </span>
                                                    <button
                                                        onClick={() => navigate(`/seller/products/${p.id}/edit`)}
                                                        className="text-xs font-semibold text-primary hover:underline shrink-0"
                                                    >
                                                        {p.stock} left — restock
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Products */}
                    <div className="bg-surface border border-line rounded-xl overflow-hidden">
                        <div className="px-5 py-4 border-b border-line flex items-center justify-between">
                            <h2 className="text-base font-bold">Your Products</h2>
                            <span className="text-sm text-textSecondary tabular">
                                {products.length} total
                            </span>
                        </div>

                        {loading ? (
                            <p className="text-center text-textSecondary py-12 text-sm">
                                Loading...
                            </p>
                        ) : products.length === 0 ? (
                            <div className="py-12 text-center">
                                <p className="text-textSecondary text-sm mb-3">
                                    You haven't listed any products yet.
                                </p>
                                <Link
                                    to="/seller/products/new"
                                    className="text-primary text-sm font-semibold hover:underline"
                                >
                                    Add your first one →
                                </Link>
                            </div>
                        ) : (
                            <div className="divide-y divide-line">
                                {products.map((product) => (
                                    <div
                                        key={product.id}
                                        className={`flex items-center gap-3 px-5 py-3 transition-opacity ${
                                            deletingId === product.id ? "opacity-50" : ""
                                        }`}
                                    >
                                        <div className="w-11 h-11 rounded-lg bg-ink-100 overflow-hidden shrink-0">
                                            {product.thumbnail ? (
                                                <img
                                                    src={product.thumbnail}
                                                    alt={product.title}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-textMuted text-[10px]">
                                                    No img
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium truncate">
                                                {product.title}
                                            </p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-sm text-textSecondary tabular">
                                                    {rupiah(product.price)}
                                                </span>
                                                <StockBadge stock={product.stock} status={product.status} />
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-1 shrink-0">
                                            <button
                                                onClick={() => navigate(`/seller/products/${product.id}/edit`)}
                                                className="p-2 rounded-lg text-textSecondary hover:text-primary hover:bg-ink-100 transition"
                                                aria-label={`Edit ${product.title}`}
                                            >
                                                <Pencil size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(product.id)}
                                                disabled={deletingId === product.id}
                                                className="p-2 rounded-lg text-textSecondary hover:text-danger hover:bg-dangerSoft transition disabled:opacity-40"
                                                aria-label={`Delete ${product.title}`}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

function MetricCard({ label, value, change, note, icon: Icon }) {
    // A null change means there was no baseline to compare against. Printing
    // "+100%" against zero would be meaningless, so the badge is hidden.
    const hasChange = change !== null && change !== undefined;
    const rising = hasChange && change >= 0;

    return (
        <div className="bg-surface border border-line rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
                <Icon size={14} className="text-textMuted" />
                <p className="text-label uppercase text-textSecondary">{label}</p>
            </div>
            <p className="text-xl font-bold tabular">{value}</p>

            {hasChange ? (
                <p
                    className={`inline-flex items-center gap-1 text-xs font-semibold mt-1 ${
                        rising ? "text-success" : "text-danger"
                    }`}
                >
                    {rising ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                    {rising ? "+" : ""}
                    {change}%
                </p>
            ) : note ? (
                <p className="text-xs text-textMuted mt-1">{note}</p>
            ) : null}
        </div>
    );
}

function Sparkline({ data }) {
    const values = data.map((d) => Number(d.revenue));
    const max = Math.max(...values, 1);
    const width = 300;
    const height = 60;

    const points = values
        .map((v, i) => {
            const x = (i / (values.length - 1)) * width;
            const y = height - (v / max) * height;
            return `${x.toFixed(1)},${y.toFixed(1)}`;
        })
        .join(" ");

    return (
        <>
            <svg
                viewBox={`0 0 ${width} ${height}`}
                className="w-full h-16"
                preserveAspectRatio="none"
                role="img"
                aria-label="Daily revenue trend"
            >
                <polyline
                    points={points}
                    fill="none"
                    stroke="var(--color-primary)"
                    strokeWidth="2"
                    vectorEffect="non-scaling-stroke"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                />
            </svg>
            <div className="flex justify-between text-xs text-textMuted mt-2">
                <span>{data[0]?.date}</span>
                <span className="tabular">Peak {rupiah(max)}</span>
                <span>{data[data.length - 1]?.date}</span>
            </div>
        </>
    );
}

function StockBadge({ stock, status }) {
    if (status === "draft") {
        return (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-ink-100 text-textSecondary">
                Draft
            </span>
        );
    }

    if ((stock ?? 0) <= 5) {
        return (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-warningSoft text-warning">
                {stock ?? 0} left
            </span>
        );
    }

    return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-successSoft text-success">
            {stock} in stock
        </span>
    );
}