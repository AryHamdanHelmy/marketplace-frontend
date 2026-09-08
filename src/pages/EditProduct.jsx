import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiRequest } from "../api/Client";
import { useFetch } from "../hooks/useFetch";
import SellerSidebar from "../components/organisms/SellerSidebar";
import { useAuth } from "../context/AuthContext";
import { downscaleImage, formatSize, IMAGE_MAX_BYTES } from "../utils/image";

export default function EditProduct() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isAdmin } = useAuth();

    const { data: productRes, loading: loadingProduct, error: loadError } = useFetch(
        `/products/${id}`,
        [id]
    );
    const { data: categoriesRes } = useFetch("/categories?flat=1", []);
    const categories = Array.isArray(categoriesRes)
        ? categoriesRes
        : categoriesRes?.data || [];

    const [form, setForm] = useState(null);
    const [errors, setErrors] = useState({});
    const [serverError, setServerError] = useState("");
    const [success, setSuccess] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Image states
    const [existingThumbnail, setExistingThumbnail] = useState(null);
    const [newImage, setNewImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [imageNote, setImageNote] = useState("");
    const [preparingImage, setPreparingImage] = useState(false);
    const fileInputRef = useRef(null);

    useEffect(() => {
        const product = productRes?.data ?? productRes;
        if (product && !form) {
            setForm({
                category_id: product.category?.id ?? "",
                name: product.title ?? "",
                description: product.description ?? "",
                price: product.price ?? "",
                stock: product.stock ?? "",
                status: product.status ?? "draft",
            });
            setExistingThumbnail(product.thumbnail ?? null);
        }
    }, [productRes, form]);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        setErrors((prev) => ({ ...prev, [e.target.name]: "" }));
    };

    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setPreparingImage(true);
        setErrors((prev) => ({ ...prev, thumbnail: "" }));

        try {
            const prepared = await downscaleImage(file);

            if (prepared.size > IMAGE_MAX_BYTES) {
                setErrors((prev) => ({
                    ...prev,
                    thumbnail: `Still ${formatSize(prepared.size)} after resizing. Try a different image.`,
                }));
                return;
            }

            setNewImage(prepared);
            setImagePreview(URL.createObjectURL(prepared));
            setImageNote(
                prepared.size < file.size
                    ? `Resized from ${formatSize(file.size)} to ${formatSize(prepared.size)}`
                    : formatSize(prepared.size)
            );
        } catch {
            setErrors((prev) => ({
                ...prev,
                thumbnail: "Couldn't read that image. Try another file.",
            }));
        } finally {
            setPreparingImage(false);
        }
    };

    const handleRemoveImage = () => {
        setNewImage(null);
        setImagePreview(null);
        setExistingThumbnail(null);
        setImageNote("");
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
            if (newImage) {
                const formData = new FormData();
                formData.append("category_id", Number(form.category_id));
                formData.append("name", form.name);
                formData.append("description", form.description || "");
                formData.append("price", Number(form.price));
                formData.append("stock", form.stock === "" ? 0 : Number(form.stock));
                formData.append("status", form.status);
                formData.append("thumbnail", newImage);
                // PHP doesn't parse multipart bodies on PUT, so this goes out
                // as POST and Laravel translates it back.
                formData.append("_method", "PUT");

                await apiRequest(`/products/${id}`, {
                    method: "POST",
                    body: formData,
                });
            } else {
                await apiRequest(`/products/${id}`, {
                    method: "PUT",
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
            setTimeout(
                () => navigate(isAdmin ? "/admin/products" : "/seller/dashboard"),
                1000
            );
        } catch (err) {
            if (err.errors) {
                const mapped = {};
                Object.entries(err.errors).forEach(([field, messages]) => {
                    mapped[field] = Array.isArray(messages) ? messages[0] : messages;
                });
                setErrors(mapped);
                setServerError("Check the highlighted fields below.");
            } else {
                setServerError(err.message || "Failed to update product");
            }
            setSubmitting(false);
        }
    };

    // Gambar yang ditampilkan: preview baru > existing > kosong
    const displayImage = imagePreview || existingThumbnail;

    return (
        <>
            <SellerSidebar />
            <div className="min-h-screen bg-background text-textPrimary pt-24 px-5 pb-12 md:pl-70 md:pr-10">
                <div className="max-w-2xl mx-auto">
                    <h1 className="text-2xl font-bold text-textPrimary mb-1">Edit Product</h1>
                    <p className="text-sm text-textSecondary mb-6">
                        Update the details of your product below.
                    </p>

                    {loadingProduct && (
                        <p className="text-textSecondary">Loading product...</p>
                    )}

                    {!loadingProduct && loadError && (
                        <p className="text-danger">Error: {loadError}</p>
                    )}

                    {!loadingProduct && !loadError && form && (
                        <>
                            {serverError && (
                                <div className="bg-dangerSoft border border-danger/30 text-danger text-sm rounded-lg px-4 py-3 mb-4">
                                    {serverError}
                                </div>
                            )}

                            {success && (
                                <div className="bg-successSoft border border-success/30 text-success text-sm rounded-lg px-4 py-3 mb-4">
                                    Product updated! Redirecting...
                                </div>
                            )}

                            <form onSubmit={handleSubmit} noValidate className="space-y-5">

                                {/* Product Image */}
                                <Section title="Product Image">
                                    <div className="flex flex-col items-center gap-4">
                                        {displayImage ? (
                                            <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-line bg-ink-100">
                                                <img
                                                    src={displayImage}
                                                    alt="Preview"
                                                    className="w-full h-full object-contain"
                                                />
                                                {!imagePreview && existingThumbnail && (
                                                    <span className="absolute top-2 left-2 bg-textPrimary/70 text-white text-[10px] px-2 py-0.5 rounded-full">
                                                        Current image
                                                    </span>
                                                )}
                                                {imagePreview && (
                                                    <span className="absolute top-2 left-2 bg-primary text-white text-[10px] px-2 py-0.5 rounded-full">
                                                        New image
                                                    </span>
                                                )}
                                                <button
                                                    type="button"
                                                    onClick={handleRemoveImage}
                                                    aria-label="Remove image"
                                                    className="absolute top-2 right-2 bg-danger hover:opacity-90 text-white rounded-full w-7 h-7 flex items-center justify-center text-sm transition"
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        ) : (
                                            <div
                                                onClick={() => fileInputRef.current?.click()}
                                                className="w-full aspect-video rounded-xl border-2 border-dashed border-lineStrong flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-primary hover:bg-primarySoft transition"
                                            >
                                                <p className="text-sm text-textSecondary font-medium">
                                                    {preparingImage ? "Preparing image..." : "Tap to upload an image"}
                                                </p>
                                                <p className="text-xs text-textMuted">
                                                    PNG, JPG, WEBP — large photos are resized automatically
                                                </p>
                                            </div>
                                        )}

                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/png, image/jpeg, image/webp"
                                            onChange={handleImageChange}
                                            className="hidden"
                                        />

                                        {imageNote && !errors.thumbnail && (
                                            <p className="text-xs text-textMuted">{imageNote}</p>
                                        )}
                                        {errors.thumbnail && (
                                            <p className="text-sm text-danger">{errors.thumbnail}</p>
                                        )}

                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            disabled={preparingImage}
                                            className="text-sm text-primary font-medium hover:underline disabled:opacity-60"
                                        >
                                            {displayImage ? "Change image" : "Browse file"}
                                        </button>
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
                                            {Object.entries(
                                                categories.reduce((acc, cat) => {
                                                    const group = cat.parent_name || "Other";
                                                    (acc[group] ||= []).push(cat);
                                                    return acc;
                                                }, {})
                                            ).map(([groupName, items]) => (
                                                <optgroup key={groupName} label={groupName}>
                                                    {items.map((cat) => (
                                                        <option key={cat.id} value={cat.id}>
                                                            {cat.name}
                                                        </option>
                                                    ))}
                                                </optgroup>
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
                                    <Field label="Description" error={errors.description}>
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
                                    <Field label="Status" error={errors.status}>
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
                                        onClick={() => navigate(isAdmin ? "/admin/products" : "/seller/dashboard")}
                                        className="px-6 py-2 rounded-lg text-sm font-medium text-textSecondary hover:bg-ink-100 transition"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={submitting || success || preparingImage}
                                        className="px-6 py-2 rounded-lg text-sm font-semibold text-white bg-primary hover:bg-primaryHover transition disabled:opacity-60 disabled:cursor-not-allowed"
                                    >
                                        {success ? "Saved!" : submitting ? "Saving..." : "Save Changes"}
                                    </button>
                                </div>
                            </form>
                        </>
                    )}
                </div>
            </div>
        </>
    );
}

function Section({ title, children }) {
    return (
        <div className="bg-surface border border-line rounded-xl p-5">
            <h3 className="text-base font-bold text-textPrimary mb-4 border-b border-line pb-2">
                {title}
            </h3>
            <div className="space-y-4">{children}</div>
        </div>
    );
}

function Field({ label, error, children }) {
    return (
        <div>
            <label className="block text-xs font-semibold text-textSecondary mb-1">
                {label}
            </label>
            {children}
            {error && <p className="text-danger text-xs mt-1">{error}</p>}
        </div>
    );
}

function inputClass(hasError) {
    return `w-full bg-surface border rounded-lg px-3 py-2 text-sm text-textPrimary focus:outline-none focus:ring-2 transition ${
        hasError
            ? "border-danger focus:ring-danger"
            : "border-line focus:ring-primary"
    }`;
}