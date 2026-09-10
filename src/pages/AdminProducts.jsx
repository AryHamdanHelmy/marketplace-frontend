import { useState, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { apiRequest } from "../api/Client";
import { Pencil, Trash2, Search, ChevronLeft, ChevronRight } from "lucide-react";

const PER_PAGE = 20;

const STATUS_STYLE = {
    active:   "bg-successSoft text-success",
    draft:    "bg-ink-100 text-textSecondary",
    inactive: "bg-dangerSoft text-danger",
};

const rupiah = (value) =>
    "Rp " + Number(value ?? 0).toLocaleString("id-ID", { maximumFractionDigits: 0 });

export default function AdminProducts() {
    const navigate = useNavigate();

    const [products, setProducts] = useState([]);
    const [meta, setMeta] = useState(null);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [deletingId, setDeletingId] = useState(null);

    // Typing shouldn't fire a request per keystroke
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
            setPage(1);
        }, 400);

        return () => clearTimeout(timer);
    }, [search]);

    const load = useCallback(async () => {
        setLoading(true);
        setError("");

        const params = new URLSearchParams({
            status: statusFilter,
            page,
            per_page: PER_PAGE,
        });

        if (debouncedSearch) params.set("search", debouncedSearch);

        try {
            const res = await apiRequest(`/products?${params}`);
            setProducts(res.data || []);
            setMeta(res.meta || null);
        } catch (err) {
            setError(err.message || "Couldn't load products.");
        } finally {
            setLoading(false);
        }
    }, [statusFilter, page, debouncedSearch]);

    useEffect(() => {
        load();
    }, [load]);

    const handleDelete = async (product) => {
        if (!window.confirm(`Delete "${product.title}"? This can't be undone.`)) return;

        setDeletingId(product.id);
        setError("");

        try {
            await apiRequest(`/products/${product.id}`, { method: "DELETE" });
            setProducts((prev) => prev.filter((p) => p.id !== product.id));
            setMeta((prev) => (prev ? { ...prev, total: prev.total - 1 } : prev));
        } catch (err) {
            setError(err.message || "Couldn't delete that product.");
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div className="min-h-screen bg-background pt-24 px-4 pb-12">
            <div className="max-w-5xl mx-auto">

                <h1 className="text-2xl font-bold text-textPrimary mb-1">Products</h1>
                <p className="text-sm text-textSecondary mb-5">
                    Every product across every shop.
                </p>

                {error && (
                    <div className="bg-dangerSoft border border-danger/30 text-danger text-sm rounded-lg px-4 py-3 mb-4">
                        {error}
                    </div>
                )}

                {/* Search and filter. Both run on the server, so the counts and
                    results cover the whole catalogue rather than one page. */}
                <div className="flex flex-col sm:flex-row gap-2 mb-4">
                    <div className="flex items-center gap-2 flex-1 bg-surface border border-line rounded-lg px-3">
                        <Search size={15} className="text-textMuted shrink-0" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search products"
                            className="flex-1 bg-transparent py-2.5 text-base text-textPrimary outline-none placeholder:text-textMuted"
                        />
                    </div>

                    <select
                        value={statusFilter}
                        onChange={(e) => {
                            setStatusFilter(e.target.value);
                            setPage(1);
                        }}
                        className="bg-surface border border-line rounded-lg px-3 py-2.5 text-base text-textPrimary focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                        <option value="all">All status</option>
                        <option value="active">Active</option>
                        <option value="draft">Draft</option>
                        <option value="inactive">Inactive</option>
                    </select>
                </div>

                <p className="text-xs text-textSecondary mb-3">
                    {meta ? (
                        <>
                            <span className="tabular">{meta.total}</span> product
                            {meta.total === 1 ? "" : "s"}
                        </>
                    ) : (
                        "\u00A0"
                    )}
                </p>

                {loading ? (
                    <div className="space-y-3">
                        {[1, 2, 3, 4].map((i) => (
                            <div
                                key={i}
                                className="h-16 bg-surface border border-line rounded-xl animate-pulse"
                            />
                        ))}
                    </div>
                ) : products.length === 0 ? (
                    <div className="bg-surface border border-line rounded-xl p-12 text-center">
                        <p className="text-sm text-textSecondary">
                            Nothing matches that.
                        </p>
                    </div>
                ) : (
                    <>
                        {/* Mobile: cards. A seven-column table on a phone means
                            scrolling sideways to reach the actions. */}
                        <div className="space-y-3 md:hidden">
                            {products.map((product) => (
                                <div
                                    key={product.id}
                                    className={`bg-surface border border-line rounded-xl p-4 transition-opacity ${
                                        deletingId === product.id ? "opacity-50" : ""
                                    }`}
                                >
                                    <div className="flex gap-3">
                                        <Thumb product={product} />

                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-textPrimary line-clamp-2">
                                                {product.title}
                                            </p>
                                            <p className="text-xs text-textSecondary mt-0.5 truncate">
                                                {product.seller?.shop?.name || product.seller?.name || "—"}
                                            </p>
                                            <p className="text-sm font-bold text-primary tabular mt-1">
                                                {rupiah(product.price)}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-3 pt-3 border-t border-line flex items-center gap-2">
                                        <StatusBadge status={product.status} />
                                        <StockBadge stock={product.stock} />

                                        <div className="ml-auto flex gap-1">
                                            <button
                                                onClick={() => navigate(`/seller/products/${product.id}/edit`)}
                                                aria-label={`Edit ${product.title}`}
                                                className="p-2 rounded-lg text-textSecondary hover:text-primary hover:bg-ink-100 transition"
                                            >
                                                <Pencil size={15} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(product)}
                                                disabled={deletingId === product.id}
                                                aria-label={`Delete ${product.title}`}
                                                className="p-2 rounded-lg text-textSecondary hover:text-danger hover:bg-dangerSoft transition disabled:opacity-40"
                                            >
                                                <Trash2 size={15} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Desktop: table */}
                        <div className="hidden md:block bg-surface border border-line rounded-xl overflow-hidden">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-surfaceAlt border-b border-line">
                                    <tr>
                                        <th className="px-4 py-3 text-label uppercase text-textSecondary">Product</th>
                                        <th className="px-4 py-3 text-label uppercase text-textSecondary">Shop</th>
                                        <th className="px-4 py-3 text-label uppercase text-textSecondary">Price</th>
                                        <th className="px-4 py-3 text-label uppercase text-textSecondary">Stock</th>
                                        <th className="px-4 py-3 text-label uppercase text-textSecondary">Status</th>
                                        <th className="px-4 py-3 text-label uppercase text-textSecondary text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-line">
                                    {products.map((product) => (
                                        <tr
                                            key={product.id}
                                            className={`hover:bg-surfaceAlt transition ${
                                                deletingId === product.id ? "opacity-40" : ""
                                            }`}
                                        >
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-3">
                                                    <Thumb product={product} small />
                                                    <div className="min-w-0">
                                                        <Link
                                                            to={`/products/${product.id}`}
                                                            className="font-medium text-textPrimary hover:text-primary transition line-clamp-1"
                                                        >
                                                            {product.title}
                                                        </Link>
                                                        <p className="text-xs text-textMuted font-mono">
                                                            PRD-{String(product.id).padStart(3, "0")}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-textSecondary">
                                                {product.seller?.shop?.name || product.seller?.name || "—"}
                                            </td>
                                            <td className="px-4 py-3 font-semibold text-textPrimary tabular">
                                                {rupiah(product.price)}
                                            </td>
                                            <td className="px-4 py-3">
                                                <StockBadge stock={product.stock} />
                                            </td>
                                            <td className="px-4 py-3">
                                                <StatusBadge status={product.status} />
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center justify-end gap-1">
                                                    <button
                                                        onClick={() => navigate(`/seller/products/${product.id}/edit`)}
                                                        aria-label={`Edit ${product.title}`}
                                                        className="p-2 rounded-lg text-textSecondary hover:text-primary hover:bg-ink-100 transition"
                                                    >
                                                        <Pencil size={15} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(product)}
                                                        disabled={deletingId === product.id}
                                                        aria-label={`Delete ${product.title}`}
                                                        className="p-2 rounded-lg text-textSecondary hover:text-danger hover:bg-dangerSoft transition disabled:opacity-40"
                                                    >
                                                        <Trash2 size={15} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {meta && meta.last_page > 1 && (
                            <div className="flex items-center justify-between gap-3 mt-5">
                                <p className="text-xs text-textSecondary">
                                    Page {meta.current_page} of {meta.last_page}
                                </p>
                                <div className="flex gap-1.5">
                                    <PageButton
                                        onClick={() => setPage((p) => p - 1)}
                                        disabled={meta.current_page <= 1}
                                        label="Previous page"
                                    >
                                        <ChevronLeft size={16} />
                                    </PageButton>
                                    <PageButton
                                        onClick={() => setPage((p) => p + 1)}
                                        disabled={meta.current_page >= meta.last_page}
                                        label="Next page"
                                    >
                                        <ChevronRight size={16} />
                                    </PageButton>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

function Thumb({ product, small }) {
    const size = small ? "w-10 h-10" : "w-16 h-16";

    return (
        <div className={`${size} rounded-lg bg-ink-100 overflow-hidden shrink-0`}>
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
    );
}

function StockBadge({ stock }) {
    const value = stock ?? 0;

    if (value <= 0) {
        return (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-dangerSoft text-danger">
                Out of stock
            </span>
        );
    }

    if (value <= 5) {
        return (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-warningSoft text-warning tabular">
                {value} left
            </span>
        );
    }

    return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-successSoft text-success tabular">
            {value}
        </span>
    );
}

function StatusBadge({ status }) {
    return (
        <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
                STATUS_STYLE[status] || "bg-ink-100 text-textSecondary"
            }`}
        >
            {status}
        </span>
    );
}

function PageButton({ children, onClick, disabled, label }) {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            aria-label={label}
            className="h-9 w-9 flex items-center justify-center rounded-lg bg-surface border border-line text-textSecondary hover:bg-ink-100 hover:text-textPrimary transition disabled:opacity-40 disabled:cursor-not-allowed"
        >
            {children}
        </button>
    );
}