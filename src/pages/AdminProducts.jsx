import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useFetch } from "../hooks/useFetch";
import { apiRequest } from "../api/Client";
import { Pencil, Trash2, Search, Filter } from "lucide-react";

export default function AdminProducts() {
    const navigate = useNavigate();
    const { data, loading, error, setData } = useFetch("/products?status=all", []);
    const [deletingId, setDeletingId] = useState(null);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    const allProducts = Array.isArray(data) ? data : data?.data || [];

    // Filter by search & status
    const filtered = allProducts.filter((p) => {
        const matchSearch =
            p.title?.toLowerCase().includes(search.toLowerCase()) ||
            p.seller?.name?.toLowerCase().includes(search.toLowerCase());
        const matchStatus =
            statusFilter === "all" || p.status === statusFilter;
        return matchSearch && matchStatus;
    });

    const formatPrice = (value) =>
        new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(value ?? 0);

    const handleDelete = async (productId) => {
        if (!window.confirm("Delete this product? This action cannot be undone.")) return;
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

    // Stats
    const totalProducts = allProducts.length;
    const activeProducts = allProducts.filter((p) => p.status === "active").length;
    const draftProducts = allProducts.filter((p) => p.status === "draft").length;

    return (
        <div className="min-h-screen bg-gray-50 pt-24 px-5 pb-12 md:px-8">
            <div className="max-w-6xl mx-auto">

                {/* Header */}
                <div className="mb-6 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-darkblue">Product Management</h1>
                        <p className="text-sm text-gray-400 mt-0.5">Manage all products across all sellers.</p>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                        <p className="text-xs text-gray-400 uppercase font-semibold tracking-wide mb-1">Total</p>
                        <p className="text-2xl font-bold text-darkblue">{totalProducts}</p>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                        <p className="text-xs text-gray-400 uppercase font-semibold tracking-wide mb-1">Active</p>
                        <p className="text-2xl font-bold text-emerald-600">{activeProducts}</p>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                        <p className="text-xs text-gray-400 uppercase font-semibold tracking-wide mb-1">Draft</p>
                        <p className="text-2xl font-bold text-gray-400">{draftProducts}</p>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                    <div className="flex flex-col md:flex-row gap-3 px-5 py-4 border-b border-gray-100">
                        {/* Search */}
                        <div className="flex items-center gap-2 flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
                            <Search size={14} className="text-gray-400 shrink-0" />
                            <input
                                type="text"
                                placeholder="Search by product name or seller..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="bg-transparent text-sm text-darkblue outline-none flex-1 placeholder-gray-400"
                            />
                        </div>

                        {/* Status filter */}
                        <div className="flex items-center gap-2">
                            <Filter size={14} className="text-gray-400 shrink-0" />
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="text-sm text-darkblue border border-gray-200 rounded-lg px-3 py-2 bg-gray-50 outline-none focus:ring-2 focus:ring-pastel-blue transition"
                            >
                                <option value="all">All Status</option>
                                <option value="active">Active</option>
                                <option value="draft">Draft</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>
                    </div>

                    {/* Table header */}
                    <div className="px-5 py-2.5 bg-gray-50 border-b border-gray-100">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                            {filtered.length} product{filtered.length !== 1 ? "s" : ""} found
                        </p>
                    </div>

                    {/* Loading */}
                    {loading && (
                        <div className="flex flex-col gap-3 p-5">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="h-14 bg-gray-100 rounded-lg animate-pulse" />
                            ))}
                        </div>
                    )}

                    {/* Error */}
                    {!loading && error && (
                        <p className="text-red-400 text-sm p-5">Error: {error}</p>
                    )}

                    {/* Empty */}
                    {!loading && !error && filtered.length === 0 && (
                        <p className="text-gray-400 text-sm p-8 text-center">No products found.</p>
                    )}

                    {/* Table */}
                    {!loading && !error && filtered.length > 0 && (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-gray-50 text-gray-400 uppercase text-xs tracking-wide border-b border-gray-100">
                                    <tr>
                                        <th className="px-5 py-3 font-semibold">Product</th>
                                        <th className="px-5 py-3 font-semibold">Seller</th>
                                        <th className="px-5 py-3 font-semibold">Category</th>
                                        <th className="px-5 py-3 font-semibold">Price</th>
                                        <th className="px-5 py-3 font-semibold">Stock</th>
                                        <th className="px-5 py-3 font-semibold">Status</th>
                                        <th className="px-5 py-3 font-semibold text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {filtered.map((product) => (
                                        <tr
                                            key={product.id}
                                            className={`hover:bg-gray-50 transition-opacity ${
                                                deletingId === product.id ? "opacity-40" : "opacity-100"
                                            }`}
                                        >
                                            {/* Product */}
                                            <td className="px-5 py-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden shrink-0">
                                                        {product.thumbnail ? (
                                                            <img
                                                                src={product.thumbnail}
                                                                alt={product.title}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-gray-300 text-[10px]">
                                                                No img
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="font-semibold text-darkblue truncate max-w-[180px]">
                                                            {product.title}
                                                        </p>
                                                        <p className="text-xs text-gray-400 font-mono">
                                                            PRD-{String(product.id).padStart(3, "0")}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Seller */}
                                            <td className="px-5 py-3">
                                                <p className="text-sm text-darkblue">{product.seller?.name || "-"}</p>
                                            </td>

                                            {/* Category */}
                                            <td className="px-5 py-3">
                                                <p className="text-sm text-gray-500">{product.category?.name || "-"}</p>
                                            </td>

                                            {/* Price */}
                                            <td className="px-5 py-3">
                                                <p className="text-sm font-semibold text-darkblue">
                                                    {formatPrice(product.price)}
                                                </p>
                                            </td>

                                            {/* Stock */}
                                            <td className="px-5 py-3">
                                                <StockBadge stock={product.stock} />
                                            </td>

                                            {/* Status */}
                                            <td className="px-5 py-3">
                                                <StatusBadge status={product.status} />
                                            </td>

                                            {/* Actions */}
                                            <td className="px-5 py-3 text-right">
                                                <div className="flex items-center justify-end gap-3">
                                                    <button
                                                        onClick={() => navigate(`/seller/products/${product.id}/edit`)}
                                                        className="text-gray-400 hover:text-pastel-blue transition"
                                                        aria-label="Edit"
                                                        title="Edit product"
                                                    >
                                                        <Pencil size={15} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(product.id)}
                                                        disabled={deletingId === product.id}
                                                        className="text-gray-400 hover:text-red-500 transition disabled:opacity-40"
                                                        aria-label="Delete"
                                                        title="Delete product"
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
                    )}
                </div>
            </div>
        </div>
    );
}

function StockBadge({ stock }) {
    if (stock <= 0) {
        return (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-600">
                Out ({stock ?? 0})
            </span>
        );
    }
    if (stock <= 5) {
        return (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-600">
                Low ({stock})
            </span>
        );
    }
    return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
            {stock}
        </span>
    );
}

function StatusBadge({ status }) {
    const map = {
        active:   "bg-emerald-100 text-emerald-700",
        draft:    "bg-gray-100 text-gray-500",
        inactive: "bg-red-100 text-red-500",
    };
    return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize ${map[status] || "bg-gray-100 text-gray-400"}`}>
            {status}
        </span>
    );
}