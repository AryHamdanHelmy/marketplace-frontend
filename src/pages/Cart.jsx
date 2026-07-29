import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiRequest } from "../api/Client";
import { useFetch } from "../hooks/useFetch";

export default function Cart() {
    const { data, loading, error, setData } = useFetch("/cart", []);
    const [updatingId, setUpdatingId] = useState(null);
    const [selectedIds, setSelectedIds] = useState([]);
    const navigate = useNavigate();

    const items = data?.data || [];

    // Total only from selected items
    const total = items
        .filter((item) => selectedIds.includes(item.id))
        .reduce((sum, item) => sum + item.subtotal, 0);

    const allSelected = items.length > 0 && selectedIds.length === items.length;

    const toggleItem = (id) => {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
        );
    };

    const toggleAll = () => {
        setSelectedIds(allSelected ? [] : items.map((i) => i.id));
    };

    const formatPrice = (value) =>
        new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(value ?? 0);

    const updateQuantity = async (itemId, newQuantity) => {
        if (newQuantity < 1) return;
        setUpdatingId(itemId);
        try {
            await apiRequest(`/cart/${itemId}`, {
                method: "PUT",
                body: { quantity: newQuantity },
            });
            setData((prev) => {
                const updatedItems = prev.data.map((item) =>
                    item.id === itemId
                        ? {
                              ...item,
                              quantity: newQuantity,
                              subtotal: newQuantity * item.product.price,
                          }
                        : item
                );
                return {
                    ...prev,
                    data: updatedItems,
                    total: updatedItems.reduce((sum, i) => sum + i.subtotal, 0),
                };
            });
        } catch (err) {
            alert(err.message || "Failed to update quantity");
        } finally {
            setUpdatingId(null);
        }
    };

    const removeItem = async (itemId) => {
        const confirmRemove = window.confirm("Remove this item from your cart?");
        if (!confirmRemove) return;

        setUpdatingId(itemId);
        try {
            await apiRequest(`/cart/${itemId}`, { method: "DELETE" });
            setData((prev) => {
                const updatedItems = prev.data.filter((item) => item.id !== itemId);
                return {
                    ...prev,
                    data: updatedItems,
                    total: updatedItems.reduce((sum, i) => sum + i.subtotal, 0),
                };
            });
            setSelectedIds((prev) => prev.filter((id) => id !== itemId));
        } catch (err) {
            alert(err.message || "Failed to remove item");
        } finally {
            setUpdatingId(null);
        }
    };

    return (
        <div className="min-h-screen bg-hitam text-pastel-blue pb-28">

            {/* Header sticky */}
            <div className="sticky top-0 z-10 bg-hitam border-b border-white/10 px-5 py-4 flex items-center gap-4">
                <Link to="/explore" className="text-pastel-blue">
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                </Link>
                <h1 className="text-lg font-semibold flex-1">Your Cart</h1>
                <span className="text-sm text-darkblue">{items.length} items</span>
            </div>

            <div className="px-4 pt-4 md:max-w-2xl md:mx-auto">

                {/* Loading skeleton */}
                {loading && (
                    <div className="flex flex-col gap-4 mt-4">
                        {[1, 2].map((i) => (
                            <div key={i} className="bg-white/5 rounded-2xl p-4 animate-pulse">
                                <div className="h-4 bg-white/10 rounded w-1/3 mb-4" />
                                <div className="flex gap-3">
                                    <div className="w-20 h-20 bg-white/10 rounded-xl" />
                                    <div className="flex-1 space-y-2">
                                        <div className="h-3 bg-white/10 rounded w-3/4" />
                                        <div className="h-3 bg-white/10 rounded w-1/2" />
                                        <div className="h-5 bg-white/10 rounded w-1/3 mt-2" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Error */}
                {!loading && error && (
                    <p className="text-red-400 text-center mt-10 text-sm">Error: {error}</p>
                )}

                {/* Empty state */}
                {!loading && !error && items.length === 0 && (
                    <div className="text-center py-20">
                        <div className="text-5xl mb-4">🛒</div>
                        <p className="text-darkblue mb-4 text-sm">Your cart is empty.</p>
                        <Link to="/explore" className="text-pastel-blue hover:underline text-sm">
                            Browse products →
                        </Link>
                    </div>
                )}

                {/* Item list */}
                {items.length > 0 && (
                    <div className="flex flex-col gap-3">
                        {items.map((item) => {
                            const isSelected = selectedIds.includes(item.id);
                            return (
                                <div
                                    key={item.id}
                                    className={`bg-white/5 rounded-2xl overflow-hidden transition-opacity ${
                                        updatingId === item.id ? "opacity-40" : "opacity-100"
                                    }`}
                                >
                                    {/* Seller row */}
                                    <div className="flex items-center gap-2 px-4 pt-3 pb-2 border-b border-white/5">
                                        {/* Checkbox */}
                                        <button
                                            onClick={() => toggleItem(item.id)}
                                            className={`w-4 h-4 rounded flex items-center justify-center border transition shrink-0 ${
                                                isSelected
                                                    ? "bg-pastel-blue border-pastel-blue"
                                                    : "border-black/30 bg-transparent"
                                            }`}
                                        >
                                            {isSelected && (
                                                <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="3">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                </svg>
                                            )}
                                        </button>
                                        <span className="text-xs font-semibold text-darkblue truncate">
                                            {item.product?.seller || "DibiTech Store"}
                                        </span>
                                    </div>

                                    {/* Product row */}
                                    <div className="flex gap-3 px-4 py-3">

                                        {/* Thumbnail */}
                                        <div className="w-20 h-20 rounded-xl bg-white/5 overflow-hidden shrink-0">
                                            {item.product.thumbnail ? (
                                                <img
                                                    src={item.product.thumbnail}
                                                    alt={item.product.title}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-darkblue text-[10px]">
                                                    No image
                                                </div>
                                            )}
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0 flex flex-col gap-1">
                                            <p className="font-semibold text-sm truncate">
                                                {item.product.title}
                                            </p>
                                            <p className="text-xs text-black">
                                                {formatPrice(item.product.price)} each
                                            </p>
                                            <p className="text-base font-bold text-pastel-blue mt-1">
                                                {formatPrice(item.subtotal)}
                                            </p>

                                            {/* Remove + Quantity */}
                                            <div className="flex items-center justify-between mt-2">
                                                <button
                                                    onClick={() => removeItem(item.id)}
                                                    disabled={updatingId === item.id}
                                                    className="text-red-400 hover:text-red-300 text-xs font-semibold disabled:opacity-50 flex items-center gap-1 transition"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                    Remove
                                                </button>

                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                        disabled={updatingId === item.id || item.quantity <= 1}
                                                        className="w-7 h-7 shrink-0 rounded-lg bg-black/10 hover:bg-black/20 disabled:opacity-40 transition flex items-center justify-center font-bold"
                                                    >
                                                        −
                                                    </button>
                                                    <span className="w-6 text-center text-sm">{item.quantity}</span>
                                                    <button
                                                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                        disabled={updatingId === item.id}
                                                        className="w-7 h-7 shrink-0 rounded-lg bg-black/10 hover:bg-black/20 disabled:opacity-40 transition flex items-center justify-center font-bold"
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Sticky bottom bar */}
            {items.length > 0 && (
                <div className="fixed bottom-0 left-0 right-0 bg-hitam/95 backdrop-blur-md border-t border-white/10 px-5 py-4">
                    <div className="md:max-w-2xl md:mx-auto">
                        <div className="flex items-center justify-between mb-3">
                            {/* Select all */}
                            <button
                                onClick={toggleAll}
                                className="flex items-center gap-2 text-sm text-black"
                            >
                                <div className={`w-4 h-4 rounded border transition flex items-center justify-center shrink-0 ${
                                    allSelected
                                        ? "bg-pastel-blue border-pastel-blue"
                                        : "border-black/30 bg-transparent"
                                }`}>
                                    {allSelected && (
                                        <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="3">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                        </svg>
                                    )}
                                </div>
                                Select all
                            </button>
                            <p className="text-lg font-bold">
                                Total: {formatPrice(total)}
                            </p>
                        </div>
                        <button
                            disabled={selectedIds.length === 0}
                            onClick={() => navigate("/checkout")}
                            className="w-full bg-pastel-blue hover:bg-pastel-green text-white hover:text-black font-semibold rounded-full py-3 transition disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            Checkout ({selectedIds.length})
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}