import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useFetch } from "../hooks/useFetch";
import { apiRequest } from "../api/Client";

export default function Checkout() {
    const navigate = useNavigate();
    const { data, loading, error } = useFetch("/cart", []);

    const [paymentMethod, setPaymentMethod] = useState("bank_transfer");
    const [submitting, setSubmitting] = useState(false);
    const [serverError, setServerError] = useState("");
    const [itemErrors, setItemErrors] = useState([]);

    // Dibuat SEKALI saat halaman dibuka, bukan tiap klik.
    // Kalau user klik "Place Order" berkali-kali, key-nya tetap sama,
    // jadi backend mengenali itu sebagai percobaan yang sama — bukan pesanan baru.
    const [idempotencyKey] = useState(() => crypto.randomUUID());

    const items = data?.data || [];
    const total = data?.total || 0;

    const formatPrice = (value) =>
        new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(value ?? 0);

    // Kelompokkan per seller — mencerminkan bagaimana backend memecah transaksi
    const groupedBySeller = items.reduce((acc, item) => {
        const seller = item.product.seller || "Unknown Seller";
        if (!acc[seller]) acc[seller] = [];
        acc[seller].push(item);
        return acc;
    }, {});

    const sellerGroups = Object.entries(groupedBySeller);

    const handleSubmit = async () => {
        if (submitting) return;

        setServerError("");
        setItemErrors([]);
        setSubmitting(true);

        try {
            const res = await apiRequest("/checkout", {
                method: "POST",
                body: {
                    idempotency_key: idempotencyKey,
                    payment_method: paymentMethod,
                },
            });

            const groupId = res.data?.checkout_group_id;
            navigate(`/orders/success/${groupId}`);
        } catch (err) {
            // Backend mengirim daftar item bermasalah di field errors
            if (err.errors && Array.isArray(err.errors)) {
                setItemErrors(err.errors);
            }
            setServerError(err.message || "Checkout failed, please try again");
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pt-24 px-5 pb-32 md:px-8">
            <div className="max-w-3xl mx-auto">

                <h1 className="text-2xl font-bold text-darkblue mb-1">Checkout</h1>
                <p className="text-sm text-gray-400 mb-6">
                    Review your order before placing it.
                </p>

                {loading && (
                    <div className="flex flex-col gap-4">
                        {[1, 2].map((i) => (
                            <div key={i} className="bg-white border border-gray-200 rounded-xl p-5">
                                <div className="h-4 bg-gray-100 rounded w-1/3 mb-4 animate-pulse" />
                                <div className="h-16 bg-gray-100 rounded animate-pulse" />
                            </div>
                        ))}
                    </div>
                )}

                {!loading && error && (
                    <p className="text-red-500 text-sm">Error: {error}</p>
                )}

                {!loading && !error && items.length === 0 && (
                    <div className="bg-white border border-gray-200 rounded-xl p-10 text-center">
                        <p className="text-gray-400 text-sm mb-3">Your cart is empty.</p>
                        <Link to="/explore" className="text-pastel-blue text-sm hover:underline">
                            Browse products →
                        </Link>
                    </div>
                )}

                {!loading && items.length > 0 && (
                    <>
                        {/* Error dari server */}
                        {serverError && (
                            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4">
                                <p className="text-red-600 text-sm font-semibold">{serverError}</p>
                                {itemErrors.length > 0 && (
                                    <ul className="mt-2 flex flex-col gap-1">
                                        {itemErrors.map((msg, i) => (
                                            <li key={i} className="text-red-500 text-xs">• {msg}</li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        )}

                        {/* Info pemecahan pesanan */}
                        {sellerGroups.length > 1 && (
                            <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 mb-4">
                                <p className="text-xs text-blue-600">
                                    Your cart contains items from {sellerGroups.length} sellers.
                                    It will be split into {sellerGroups.length} separate orders.
                                </p>
                            </div>
                        )}

                        {/* Daftar item per seller */}
                        <div className="flex flex-col gap-4 mb-6">
                            {sellerGroups.map(([sellerName, sellerItems]) => {
                                const sellerSubtotal = sellerItems.reduce(
                                    (sum, item) => sum + Number(item.subtotal), 0
                                );

                                return (
                                    <div
                                        key={sellerName}
                                        className="bg-white border border-gray-200 rounded-xl overflow-hidden"
                                    >
                                        {/* Header seller */}
                                        <div className="px-5 py-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                                            <p className="text-sm font-semibold text-darkblue">{sellerName}</p>
                                            <span className="text-xs text-gray-400">
                                                {sellerItems.length} item{sellerItems.length !== 1 ? "s" : ""}
                                            </span>
                                        </div>

                                        {/* Items */}
                                        <div className="divide-y divide-gray-50">
                                            {sellerItems.map((item) => (
                                                <div key={item.id} className="flex gap-3 px-5 py-3">
                                                    <div className="w-14 h-14 rounded-lg bg-gray-100 overflow-hidden shrink-0">
                                                        {item.product.thumbnail ? (
                                                            <img
                                                                src={item.product.thumbnail}
                                                                alt={item.product.title}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-gray-300 text-[10px]">
                                                                No img
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium text-darkblue truncate">
                                                            {item.product.title}
                                                        </p>
                                                        <p className="text-xs text-gray-400 mt-0.5">
                                                            {formatPrice(item.product.price)} × {item.quantity}
                                                        </p>
                                                    </div>

                                                    <p className="text-sm font-semibold text-darkblue shrink-0">
                                                        {formatPrice(item.subtotal)}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Subtotal per seller */}
                                        <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                                            <span className="text-xs text-gray-400">Subtotal</span>
                                            <span className="text-sm font-bold text-darkblue">
                                                {formatPrice(sellerSubtotal)}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Metode pembayaran */}
                        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden mb-6">
                            <div className="px-5 py-3 bg-gray-50 border-b border-gray-100">
                                <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                                    Payment Method
                                </h2>
                            </div>

                            <div className="p-3 flex flex-col gap-2">
                                {[
                                    { value: "bank_transfer", label: "Bank Transfer", desc: "Manual transfer to our account" },
                                    { value: "ewallet",       label: "E-Wallet",      desc: "GoPay, OVO, DANA" },
                                    { value: "cod",           label: "Cash on Delivery", desc: "Pay when your order arrives" },
                                ].map((method) => (
                                    <button
                                        key={method.value}
                                        type="button"
                                        onClick={() => setPaymentMethod(method.value)}
                                        className={`flex items-center gap-3 px-4 py-3 rounded-lg border text-left transition ${
                                            paymentMethod === method.value
                                                ? "border-pastel-blue bg-blue-50"
                                                : "border-gray-200 hover:bg-gray-50"
                                        }`}
                                    >
                                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                                            paymentMethod === method.value
                                                ? "border-pastel-blue"
                                                : "border-gray-300"
                                        }`}>
                                            {paymentMethod === method.value && (
                                                <div className="w-2 h-2 rounded-full bg-pastel-blue" />
                                            )}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-medium text-darkblue">{method.label}</p>
                                            <p className="text-xs text-gray-400">{method.desc}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Bottom bar */}
            {!loading && items.length > 0 && (
                <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-5 py-4 shadow-lg">
                    <div className="max-w-3xl mx-auto">
                        <div className="flex items-center justify-between mb-3">
                            <div>
                                <p className="text-xs text-gray-400">
                                    {items.length} item{items.length !== 1 ? "s" : ""}
                                    {sellerGroups.length > 1 && ` · ${sellerGroups.length} orders`}
                                </p>
                                <p className="text-lg font-bold text-darkblue">{formatPrice(total)}</p>
                            </div>
                            <Link
                                to="/cart"
                                className="text-sm text-gray-400 hover:text-darkblue transition"
                            >
                                ← Back to cart
                            </Link>
                        </div>

                        <button
                            onClick={handleSubmit}
                            disabled={submitting}
                            className="w-full bg-pastel-blue hover:bg-pastel-cyan text-white font-semibold rounded-full py-3 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {submitting ? "Processing..." : "Place Order"}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}