import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiRequest } from "../api/Client";
import { useFetch } from "../hooks/useFetch";
import { useCart } from "../context/CartContext";

export default function Cart() {
    const { data, loading, error, setData } = useFetch("/cart", []);
    const [updatingId, setUpdatingId] = useState(null);
    const [selectedIds, setSelectedIds] = useState([]);
    const navigate = useNavigate();
    const { refresh: refreshCartCount } = useCart();

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
            refreshCartCount(); // update cart count in navbar
        } catch (err) {
            alert(err.message || "Failed to remove item");
        } finally {
            setUpdatingId(null);
        }
    };

    return (
        <div className="min-h-screen bg-background text-textPrimary pt-14 md:pt-21 pb-44 md:pb-28">

            {/* Header sticky */}
            <div className="sticky top-14 md:top-21 z-10 bg-surface border-b border-line px-5 py-4 flex items-center gap-4">
                <Link to="/explore" className="text-primary">
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                </Link>
                <h1 className="text-title flex-1">Your Cart</h1>
                <span className="text-sm text-textSecondary">{items.length} items</span>
            </div>

            <div className="px-4 pt-4 md:max-w-2xl md:mx-auto">

                {/* Loading skeleton */}
                {loading && (
                    <div className="flex flex-col gap-4 mt-4">
                        {[1, 2].map((i) => (
                            <div key={i} className="bg-surface border border-line rounded-2xl p-4 animate-pulse">
                                <div className="h-4 bg-line/40 rounded w-1/3 mb-4" />
                                <div className="flex gap-3">
                                    <div className="w-20 h-20 bg-line/40 rounded-xl" />
                                    <div className="flex-1 space-y-2">
                                        <div className="h-3 bg-line/40 rounded w-3/4" />
                                        <div className="h-3 bg-line/40 rounded w-1/2" />
                                        <div className="h-5 bg-line/40 rounded w-1/3 mt-2" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Error */}
                {!loading && error && (
                    <p className="text-danger text-center mt-10 text-sm">Error: {error}</p>
                )}

                {/* Empty state */}
                {!loading && !error && items.length === 0 && (
                    <div className="text-center py-20">
                        <div className="text-5xl mb-4">🛒</div>
                        <p className="text-textSecondary mb-4 text-sm">Your cart is empty.</p>
                        <Link to="/explore" className="text-primary hover:underline text-sm">
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
                                    className={`bg-surface border border-line rounded-2xl overflow-hidden transition-opacity ${
                                        updatingId === item.id ? "opacity-40" : "opacity-100"
                                    }`}
                                >
                                    {/* Seller row */}
                                    <div className="flex items-center gap-2 px-4 pt-3 pb-2 border-b border-line">
                                        {/* Checkbox */}
                                        <button
                                            onClick={() => toggleItem(item.id)}
                                            className={`w-4 h-4 rounded flex items-center justify-center border transition shrink-0 ${
                                                isSelected
                                                    ? "bg-primary border-line"
                                                    : "border-line bg-transparent"
                                            }`}
                                        >
                                            {isSelected && (
                                                <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="3">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                </svg>
                                            )}
                                        </button>
                                        <span className="text-xs font-semibold text-textPrimary truncate">
                                            {item.product?.seller || "Rapaku Store"}
                                        </span>
                                    </div>

                                    {/* Product row */}
                                    <div className="flex gap-3 px-4 py-3">

                                        {/* Thumbnail */}
                                        <div className="w-20 h-20 rounded-xl bg-line/20 overflow-hidden shrink-0">
                                            {item.product.thumbnail ? (
                                                <img
                                                    src={item.product.thumbnail}
                                                    alt={item.product.title}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-textSecondary text-[10px]">
                                                    No image
                                                </div>
                                            )}
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0 flex flex-col gap-1">
                                            <p className="font-semibold text-sm truncate text-textPrimary">
                                                {item.product.title}
                                            </p>
                                            <p className="text-xs text-textSecondary">
                                                {formatPrice(item.product.price)} each
                                            </p>
                                            <p className="text-base font-bold text-textPrimary mt-1">
                                                {formatPrice(item.subtotal)}
                                            </p>

                                            {/* Remove + Quantity */}
                                            <div className="flex items-center justify-between mt-2">
                                                <button
                                                    onClick={() => removeItem(item.id)}
                                                    disabled={updatingId === item.id}
                                                    className="text-danger hover:opacity-80 text-xs font-semibold disabled:opacity-50 flex items-center gap-1 transition"
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
                                                        className="w-7 h-7 shrink-0 rounded-lg bg-line/30 hover:bg-line/50 disabled:opacity-40 transition flex items-center justify-center font-bold text-textPrimary"
                                                    >
                                                        −
                                                    </button>
                                                    <span className="w-6 text-center text-sm text-textPrimary">{item.quantity}</span>
                                                    <button
                                                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                        disabled={updatingId === item.id}
                                                        className="w-7 h-7 shrink-0 rounded-lg bg-line/30 hover:bg-line/50 disabled:opacity-40 transition flex items-center justify-center font-bold text-textPrimary"
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
                <div className="fixed bottom-(--tabbar-h) md:bottom-0 left-0 right-0 z-40 bg-surface/95 backdrop-blur-md border-t border-line px-5 py-4">
                    <div className="md:max-w-2xl md:mx-auto">
                        <div className="flex items-center justify-between mb-3">
                            {/* Select all */}
                            <button
                                onClick={toggleAll}
                                className="flex items-center gap-2 text-sm text-textPrimary"
                            >
                                <div className={`w-4 h-4 rounded border transition flex items-center justify-center shrink-0 ${
                                    allSelected
                                        ? "bg-primary border-primary"
                                        : "border-line bg-transparent"
                                }`}>
                                    {allSelected && (
                                        <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="3">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                        </svg>
                                    )}
                                </div>
                                Select all
                            </button>
                            <p className="text-lg font-bold text-textPrimary">
                                Total: {formatPrice(total)}
                            </p>
                        </div>
                        <button
                            disabled={selectedIds.length === 0}
                            onClick={() => navigate("/checkout", { state: {cartItemIds: selectedIds} })}
                            className="w-full bg-primary hover:bg-primaryHover text-white font-semibold rounded-full py-3 transition disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            Checkout ({selectedIds.length})
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}