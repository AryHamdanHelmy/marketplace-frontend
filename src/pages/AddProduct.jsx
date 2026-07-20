import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../api/Client";
import { useFetch } from "../hooks/useFetch";
import SellerSidebar from "../components/organisms/SellerSidebar";

export default function AddProduct() {
    const navigate = useNavigate();
    const { data: categoriesRes } = useFetch("/categories", []);
    const categories = Array.isArray(categoriesRes)
        ? categoriesRes
        : categoriesRes?.data || [];

    const [form, setForm] = useState({
        category_id: "",
        name: "",
        description: "",
        price: "",
        stock: "",
        status: "draft",
    });
    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [errors, setErrors] = useState({});
    const [serverError, setServerError] = useState("");
    const [success, setSuccess] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const fileInputRef = useRef(null);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setImage(file);
        setImagePreview(URL.createObjectURL(file));
    };

    const handleRemoveImage = () => {
        setImage(null);
        setImagePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const validate = () => {
        const newErrors = {};
        if (!form.category_id) newErrors.category_id = "Category is required";
        if (!form.name.trim()) newErrors.name = "Product name is required";
        if (!form.price || Number(form.price) < 0)
            newErrors.price = "Enter a valid price";
        if (form.stock !== "" && Number(form.stock) < 0)
            newErrors.stock = "Stock cannot be negative";
        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setServerError("");

        const validationErrors = validate();
        setErrors(validationErrors);
        if (Object.keys(validationErrors).length > 0) return;

        setSubmitting(true);
        try {
            // Pakai FormData kalau ada image, json biasa kalau tidak
            if (image) {
                const formData = new FormData();
                formData.append("category_id", Number(form.category_id));
                formData.append("name", form.name);
                formData.append("description", form.description || "");
                formData.append("price", Number(form.price));
                formData.append("stock", form.stock === "" ? 0 : Number(form.stock));
                formData.append("status", form.status);
                formData.append("thumbnail", image);

                await apiRequest("/products", {
                    method: "POST",
                    body: formData,
                    isFormData: true,
                });
            } else {
                await apiRequest("/products", {
                    method: "POST",
                    body: {
                        category_id: Number(form.category_id),
                        name: form.name,
                        description: form.description || null,
                        price: Number(form.price),
                        stock: form.stock === "" ? 0 : Number(form.stock),
                        status: form.status,
                    },
                });
            }

            setSuccess(true);
            setTimeout(() => navigate("/seller/dashboard"), 1000);
        } catch (err) {
            setServerError(err.message || "Failed to create product");
            setSubmitting(false);
        }
    };

    return (
        <>
            <SellerSidebar />
            <div className="min-h-screen bg-white text-darkblue pt-24 px-5 pb-12 md:pl-[280px] md:pr-10">
                <div className="max-w-2xl mx-auto">
                    <h1 className="text-2xl font-bold text-darkblue mb-1">Add New Product</h1>
                    <p className="text-sm text-black/60 mb-6">
                        Fill in the details below to add a product to your catalog.
                    </p>

                    {serverError && (
                        <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3 mb-4">
                            {serverError}
                        </div>
                    )}

                    {success && (
                        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm rounded-lg px-4 py-3 mb-4">
                            Product created! Redirecting to your dashboard...
                        </div>
                    )}

                    <form onSubmit={handleSubmit} noValidate className="space-y-5">

                        {/* Product Image */}
                        <Section title="Product Image">
                            <div className="flex flex-col items-center gap-4">
                                {/* Preview */}
                                {imagePreview ? (
                                    <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-black/10 bg-black/5">
                                        <img
                                            src={imagePreview}
                                            alt="Preview"
                                            className="w-full h-full object-contain"
                                        />
                                        <button
                                            type="button"
                                            onClick={handleRemoveImage}
                                            className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-7 h-7 flex items-center justify-center text-sm transition"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ) : (
                                    <div
                                        onClick={() => fileInputRef.current?.click()}
                                        className="w-full aspect-video rounded-xl border-2 border-dashed border-black/15 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-pastel-blue hover:bg-blue-50/30 transition"
                                    >
                                        <div className="text-3xl">🖼️</div>
                                        <p className="text-sm text-black/50 font-medium">Click to upload image</p>
                                        <p className="text-xs text-black/30">PNG, JPG, WEBP — max 2MB</p>
                                    </div>
                                )}

                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/png, image/jpeg, image/webp"
                                    onChange={handleImageChange}
                                    className="hidden"
                                />

                                {!imagePreview && (
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="text-sm text-pastel-blue font-medium hover:underline"
                                    >
                                        Browse file
                                    </button>
                                )}
                            </div>
                        </Section>

                        {/* Basic Info */}
                        <Section title="Basic Information">
                            <Field label="Product Name" error={errors.name}>
                                <input
                                    type="text"
                                    name="name"
                                    value={form.name}
                                    onChange={handleChange}
                                    placeholder="e.g. AI Writing Assistant"
                                    className={inputClass(errors.name)}
                                />
                            </Field>

                            <Field label="Category" error={errors.category_id}>
                                <select
                                    name="category_id"
                                    value={form.category_id}
                                    onChange={handleChange}
                                    className={inputClass(errors.category_id)}
                                >
                                    <option value="">Select category</option>
                                    {categories.map((cat) => (
                                        <option key={cat.id} value={cat.id}>
                                            {cat.name}
                                        </option>
                                    ))}
                                </select>
                            </Field>
                        </Section>

                        {/* Price & Stock */}
                        <Section title="Pricing & Stock">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Field label="Price (Rp)" error={errors.price}>
                                    <input
                                        type="number"
                                        name="price"
                                        value={form.price}
                                        onChange={handleChange}
                                        placeholder="0"
                                        min="0"
                                        className={inputClass(errors.price)}
                                    />
                                </Field>

                                <Field label="Stock" error={errors.stock}>
                                    <input
                                        type="number"
                                        name="stock"
                                        value={form.stock}
                                        onChange={handleChange}
                                        placeholder="0"
                                        min="0"
                                        className={inputClass(errors.stock)}
                                    />
                                </Field>
                            </div>
                        </Section>

                        {/* Description */}
                        <Section title="Description">
                            <Field label="Description">
                                <textarea
                                    name="description"
                                    value={form.description}
                                    onChange={handleChange}
                                    placeholder="Describe your product..."
                                    rows={5}
                                    className={inputClass(false) + " resize-y"}
                                />
                            </Field>
                        </Section>

                        {/* Status */}
                        <Section title="Visibility">
                            <Field label="Status">
                                <select
                                    name="status"
                                    value={form.status}
                                    onChange={handleChange}
                                    className={inputClass(false)}
                                >
                                    <option value="draft">Draft (not visible to buyers)</option>
                                    <option value="active">Active (visible to buyers)</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                            </Field>
                        </Section>

                        {/* Actions */}
                        <div className="flex items-center justify-end gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => navigate("/seller/dashboard")}
                                className="px-6 py-2 rounded-lg text-sm font-medium text-pastel-blue hover:bg-black/5 transition"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={submitting || success}
                                className="px-6 py-2 rounded-lg text-sm font-semibold text-white bg-pastel-blue hover:bg-pastel-cyan transition disabled:opacity-60"
                            >
                                {success ? "Saved!" : submitting ? "Saving..." : "Save Product"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}

function Section({ title, children }) {
    return (
        <div className="bg-white border border-black/10 rounded-xl p-5 shadow-sm">
            <h3 className="text-base font-bold text-darkblue mb-4 border-b border-black/10 pb-2">
                {title}
            </h3>
            <div className="space-y-4">{children}</div>
        </div>
    );
}

function Field({ label, error, children }) {
    return (
        <div>
            <label className="block text-xs font-semibold text-black/70 mb-1">
                {label}
            </label>
            {children}
            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
        </div>
    );
}

function inputClass(hasError) {
    return `w-full bg-white border rounded-lg px-3 py-2 text-sm text-darkblue focus:outline-none focus:ring-2 transition ${
        hasError
            ? "border-red-300 focus:ring-red-300"
            : "border-black/15 focus:ring-pastel-blue"
    }`;
}