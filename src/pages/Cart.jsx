import { useState } from "react";
import { Link } from "react-router-dom";
import { apiRequest } from "../api/Client";
import { useFetch } from "../hooks/useFetch";

export default function Cart() {
    const { data, loading, error, setData } = useFetch("/cart", []);
    const [updatingId, setUpdatingId] = useState(null);

    const items = data?.data || [];
    const total = data?.total || 0;

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
        } catch (err) {
            alert(err.message || "Failed to remove item");
        } finally {
            setUpdatingId(null);
        }
    };

    return (
        <div className="min-h-screen bg-hitam text-pastel-blue pt-24 px-5 pb-12 md:px-25">
            <div className="max-w-3xl mx-auto">
                <h1 className="text-2xl font-semibold mb-6">Your Cart</h1>

                {loading && <p className="text-darkblue">Loading cart...</p>}

                {!loading && error && (
                    <p className="text-red-400">Error: {error}</p>
                )}

                {!loading && !error && items.length === 0 && (
                    <div className="text-center py-16">
                        <p className="text-darkblue mb-4">Your cart is empty.</p>
                        <Link
                            to="/explore"
                            className="text-pastel-blue hover:underline text-sm"
                        >
                            Browse products →
                        </Link>
                    </div>
                )}

                {items.length > 0 && (
                    <>
                        <div className="rounded-lg border border-black/10 divide-y divide-black/10">
                            {items.map((item) => (
                                <div
                                    key={item.id}
                                    className={`flex flex-col md:flex-row md:items-center gap-3 md:gap-4 p-4 transition-opacity ${
                                        updatingId === item.id ? "opacity-50" : "opacity-100"
                                    }`}
                                >
                                    <div className="flex items-center gap-3 md:contents">
                                        <div className="w-16 h-16 rounded-lg bg-white/5 overflow-hidden shrink-0">
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

                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-sm truncate">
                                                {item.product.title}
                                            </p>
                                            <p className="text-xs text-black">
                                                {formatPrice(item.product.price)} each
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between md:justify-end gap-3 md:gap-4">
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                disabled={updatingId === item.id || item.quantity <= 1}
                                                className="w-7 h-7 shrink-0 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-40 transition"
                                            >
                                                −
                                            </button>
                                            <span className="w-6 text-center text-sm">{item.quantity}</span>
                                            <button
                                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                disabled={updatingId === item.id}
                                                className="w-7 h-7 shrink-0 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-40 transition"
                                            >
                                                +
                                            </button>
                                        </div>

                                        <p className="text-sm font-semibold md:w-24 text-right shrink-0">
                                            {formatPrice(item.subtotal)}
                                        </p>

                                        <button
                                            onClick={() => removeItem(item.id)}
                                            disabled={updatingId === item.id}
                                            className="text-red-400 hover:text-red-300 text-xs font-semibold disabled:opacity-50 shrink-0"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="flex items-center justify-between mt-6 px-2">
                            <p className="text-black text-sm">
                                {items.length} item{items.length !== 1 ? "s" : ""}
                            </p>
                            <p className="text-lg font-bold">Total: {formatPrice(total)}</p>
                        </div>

                        <button
                            className="w-full mt-4 bg-pastel-blue hover:bg-pastel-green text-white hover:text-black font-semibold rounded-full py-3 transition"
                            onClick={() => alert("Checkout belum tersedia")}
                        >
                            Checkout
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}