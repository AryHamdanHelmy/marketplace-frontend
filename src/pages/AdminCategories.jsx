import { useState } from "react";
import { useFetch } from "../hooks/useFetch";
import { apiRequest } from "../api/Client";
import { ChevronRight, Plus } from "lucide-react";

export default function AdminCategories() {
    // Ambil bertingkat untuk daftar, datar untuk dropdown induk
    const { data, loading, error, refetch } = useFetch("/categories", []);
    const categories = data?.data || [];

    const [form, setForm] = useState({
        name: "",
        description: "",
        icon: "",
        parent_id: "",
        image_url:"",
    });
    const [editingId, setEditingId] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [deletingId, setDeletingId] = useState(null);
    const [serverError, setServerError] = useState("");
    const [success, setSuccess] = useState("");
    const [expanded, setExpanded] = useState({});

    const resetForm = () => {
        setForm({ name: "", description: "", icon: "", parent_id: "", image_url: "", });
        setEditingId(null);
        setServerError("");
    };

    const handleEdit = (cat, parentId = "") => {
        setEditingId(cat.id);
        setForm({
            name: cat.name || "",
            description: cat.description || "",
            icon: cat.icon || "",
            image_url: cat.image_url || "",
            parent_id: parentId ? String(parentId) : "",
        });
        setServerError("");
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleAddChild = (parentId) => {
        resetForm();
        setForm((f) => ({ ...f, parent_id: String(parentId) }));
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const toggleExpand = (id) => {
        setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setServerError("");

        if (!form.name.trim()) {
            setServerError("Category name is required");
            return;
        }

        setSubmitting(true);

        const payload = {
            name: form.name,
            description: form.description || null,
            icon: form.icon || null,
            image_url: form.image_url || null,
            parent_id: form.parent_id ? Number(form.parent_id) : null,
        };

        try {
            if (editingId) {
                await apiRequest(`/categories/${editingId}`, {
                    method: "PUT",
                    body: payload,
                });
                setSuccess("Category updated successfully");
            } else {
                await apiRequest("/categories", {
                    method: "POST",
                    body: payload,
                });
                setSuccess("Category added successfully");
            }
            resetForm();
            refetch();
            setTimeout(() => setSuccess(""), 2000);
        } catch (err) {
            setServerError(err.message || "Something went wrong");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this category?")) return;
        setDeletingId(id);
        setServerError("");

        try {
            await apiRequest(`/categories/${id}`, { method: "DELETE" });
            refetch();
        } catch (err) {
            setServerError(err.message || "Failed to delete category");
        } finally {
            setDeletingId(null);
        }
    };

    const totalSub = categories.reduce((sum, c) => sum + (c.children?.length || 0), 0);

    return (
        <div className="min-h-screen bg-background pt-24 px-5 pb-12 md:px-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-2xl font-bold text-textPrimary mb-1">Category Management</h1>
                <p className="text-sm text-textSecondary mb-6">
                    {categories.length} main categories · {totalSub} subcategories
                </p>

                {/* Form */}
                <div className="bg-white border border-line rounded-xl p-5 shadow-sm mb-6">
                    <h2 className="text-sm font-bold text-textPrimary mb-4 pb-2 border-b border-line">
                        {editingId ? "Edit Category" : "Add New Category"}
                    </h2>

                    {serverError && (
                        <div className="bg-surface border border-dangerSoft text-danger text-sm rounded-lg px-4 py-2.5 mb-4">
                            {serverError}
                        </div>
                    )}
                    {success && (
                        <div className="bg-surface border border-successSoft text-success text-sm rounded-lg px-4 py-2.5 mb-4">
                            {success}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                        {/* Induk */}
                        <div>
                            <label className="text-xs font-semibold text-textMuted mb-1 block">
                                Parent Category
                            </label>
                            <select
                                value={form.parent_id}
                                onChange={(e) => setForm({ ...form, parent_id: e.target.value })}
                                className="w-full border border-line rounded-lg px-3 py-2 text-sm text-textPrimary focus:outline-none focus:ring-2 focus:ring-primary transition"
                            >
                                <option value="">— Main category (no parent) —</option>
                                {categories
                                    .filter((c) => c.id !== editingId)
                                    .map((c) => (
                                        <option key={c.id} value={c.id}>
                                            {c.name}
                                        </option>
                                    ))}
                            </select>
                            <p className="text-[11px] text-textSecondary mt-1">
                                Leave empty to create a main category. Products can only be assigned to subcategories.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                            <div>
                                <label className="text-xs font-semibold text-textMuted mb-1 block">Name *</label>
                                <input
                                    type="text"
                                    value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    placeholder="e.g. Monitor"
                                    className="w-full border border-line rounded-lg px-3 py-2 text-sm text-textPrimary focus:outline-none focus:ring-2 focus:ring-primary transition"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-textMuted mb-1 block">
                                    Icon {!form.parent_id && <span className="text-textMuted">(main only)</span>}
                                </label>
                                <input
                                    type="text"
                                    value={form.icon}
                                    onChange={(e) => setForm({ ...form, icon: e.target.value })}
                                    placeholder="laptop, smartphone, shirt..."
                                    className="w-full border border-line rounded-lg px-3 py-2 text-sm text-textPrimary focus:outline-none focus:ring-2 focus:ring-primary transition"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-textMuted mb-1 block">Image URL</label>
                                <input
                                    type="text"
                                    value={form.image_url}
                                    onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                                    placeholder="http://res.cloudinary.com/..."
                                    className="w-full border border-line rounded-lg px-3 py-2 text-sm text-textPrimary focus:outline-none focus:ring-2 focus:ring-primary transition"
                                />  
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-textMuted mb-1 block">Description</label>
                                <input
                                    type="text"
                                    value={form.description}
                                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                                    placeholder="Short description..."
                                    className="w-full border border-line rounded-lg px-3 py-2 text-sm text-textPrimary focus:outline-none focus:ring-2 focus:ring-primary transition"
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-2 justify-end">
                            {editingId && (
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="px-4 py-2 text-sm text-textMuted hover:bg-surface rounded-lg transition"
                                >
                                    Cancel
                                </button>
                            )}
                            <button
                                type="submit"
                                disabled={submitting}
                                className="px-5 py-2 bg-primary hover:bg-primaryHover text-white text-sm font-semibold rounded-lg transition disabled:opacity-60"
                            >
                                {submitting ? "Saving..." : editingId ? "Update Category" : "Add Category"}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Daftar bertingkat */}
                <div className="bg-surface border border-line rounded-xl shadow-sm overflow-hidden">
                    <div className="px-5 py-3 border-b border-line bg-surface">
                        <h2 className="text-xs font-bold text-textSecondary uppercase tracking-widest">
                            All Categories
                        </h2>
                    </div>

                    {loading && (
                        <div className="flex flex-col gap-3 p-5">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="h-12 bg-surface rounded-lg animate-pulse" />
                            ))}
                        </div>
                    )}

                    {!loading && error && (
                        <p className="text-danger text-sm p-5">Error: {error}</p>
                    )}

                    {!loading && !error && categories.length === 0 && (
                        <p className="text-textSecondary text-sm p-5 text-center">No categories yet.</p>
                    )}

                    {!loading && categories.length > 0 && (
                        <div className="divide-y divide-line">
                            {categories.map((parent) => {
                                const isOpen = expanded[parent.id];
                                const childCount = parent.children?.length || 0;

                                return (
                                    <div key={parent.id}>
                                        {/* Baris induk */}
                                        <div
                                            className={`flex items-center justify-between gap-3 px-5 py-3.5 hover:bg-surface transition ${
                                                editingId === parent.id ? "bg-blue-50" : ""
                                            }`}
                                        >
                                            <button
                                                onClick={() => toggleExpand(parent.id)}
                                                className="flex items-center gap-3 min-w-0 flex-1 text-left"
                                            >
                                                <ChevronRight
                                                    size={16}
                                                    className={`text-textSecondary shrink-0 transition-transform ${
                                                        isOpen ? "rotate-90" : ""
                                                    }`}
                                                />
                                                <div className="min-w-0">
                                                    <p className="text-sm font-semibold text-textPrimary truncate">
                                                        {parent.name}
                                                    </p>
                                                    <p className="text-xs text-textSecondary">
                                                        {childCount} subcategor{childCount !== 1 ? "ies" : "y"}
                                                        {parent.icon && ` · ${parent.icon}`}
                                                    </p>
                                                </div>
                                            </button>

                                            <div className="flex items-center gap-2 shrink-0">
                                                <button
                                                    onClick={() => handleAddChild(parent.id)}
                                                    className="text-xs font-medium text-textSecondary hover:text-primary transition inline-flex items-center gap-1"
                                                >
                                                    <Plus size={13} /> Sub
                                                </button>
                                                <span className="text-gray-200">|</span>
                                                <button
                                                    onClick={() => handleEdit(parent)}
                                                    className="text-xs font-medium text-primary hover:underline transition"
                                                >
                                                    Edit
                                                </button>
                                                <span className="text-gray-200">|</span>
                                                <button
                                                    onClick={() => handleDelete(parent.id)}
                                                    disabled={deletingId === parent.id}
                                                    className="text-xs font-medium text-danger hover:text-primaryHover disabled:opacity-40 transition"
                                                >
                                                    {deletingId === parent.id ? "..." : "Delete"}
                                                </button>
                                            </div>
                                        </div>

                                        {/* Sub-kategori */}
                                        {isOpen && childCount > 0 && (
                                            <div className="bg-surface divide-y divide-line">
                                                {parent.children.map((child) => (
                                                    <div
                                                        key={child.id}
                                                        className={`flex items-center justify-between gap-3 pl-14 pr-5 py-2.5 hover:bg-surface transition ${
                                                            editingId === child.id ? "bg-primarySoft" : ""
                                                        }`}
                                                    >
                                                        <p className="text-sm text-textSecondary truncate min-w-0">
                                                            {child.name}
                                                        </p>

                                                        <div className="flex items-center gap-2 shrink-0">
                                                            <button
                                                                onClick={() => handleEdit(child, parent.id)}
                                                                className="text-xs font-medium text-primary hover:underline transition"
                                                            >
                                                                Edit
                                                            </button>
                                                            <span className="text-gray-200">|</span>
                                                            <button
                                                                onClick={() => handleDelete(child.id)}
                                                                disabled={deletingId === child.id}
                                                                className="text-xs font-medium text-danger hover:text-primaryHover disabled:opacity-40 transition"
                                                            >
                                                                {deletingId === child.id ? "..." : "Delete"}
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {isOpen && childCount === 0 && (
                                            <p className="pl-14 pr-5 py-3 text-xs text-textSecondary bg-gray-50/50">
                                                No subcategories yet.
                                            </p>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}