import { useState } from "react";
import { Link } from "react-router-dom";
import { useFetch } from "../hooks/useFetch";
import { apiRequest } from "../api/Client";
import { PackageCheck } from "lucide-react";

const CONFIRMATION_WINDOW_DAYS = 7;

const STATUS_TABS = [
    { value: "",          label: "All" },
    { value: "pending",   label: "Unpaid" },
    { value: "paid",      label: "Paid" },
    { value: "shipped",   label: "Shipped" },
    { value: "completed", label: "Completed" },
    { value: "cancelled", label: "Cancelled" },
];

const STATUS_STYLE = {
    pending:   "bg-warningSoft text-warning",
    paid:      "bg-accentSoft text-accent",
    shipped:   "bg-primarySoft text-primary",
    completed: "bg-successSoft text-success",
    cancelled: "bg-ink-100 text-textSecondary",
};

function daysUntilAutoComplete(shippedAt) {
    if (!shippedAt) return null;

    const deadline = new Date(shippedAt);
    deadline.setDate(deadline.getDate() + CONFIRMATION_WINDOW_DAYS);

    const days = Math.ceil((deadline - new Date()) / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
}

export default function MyOrders() {
    const [status, setStatus] = useState("");
    const query = status ? `/orders?status=${status}` : "/orders";
    const { data, loading, error, refetch } = useFetch(query, [status]);

    const [processingId, setProcessingId] = useState(null);
    const [actionError, setActionError] = useState("");

    const orders = data?.data || [];

    const formatPrice = (value) =>
        new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(value ?? 0);

    const formatDate = (iso) =>
        new Date(iso).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric",
        });

    const handlePay = async (orderId) => {
        if (processingId) return;
        setProcessingId(orderId);
        setActionError("");

        try {
            await apiRequest(`/orders/${orderId}/pay`, { method: "POST" });
            refetch();
        } catch (err) {
            setActionError(err.message || "Payment failed");
        } finally {
            setProcessingId(null);
        }
    };

    const handleCancel = async (orderId) => {
        if (processingId) return;
        if (!window.confirm("Cancel this order? Stock will be returned.")) return;

        setProcessingId(orderId);
        setActionError("");

        try {
            await apiRequest(`/orders/${orderId}/cancel`, { method: "POST" });
            refetch();
        } catch (err) {
            setActionError(err.message || "Cancellation failed");
        } finally {
            setProcessingId(null);
        }
    };

    // Confirming receipt is what releases the seller's payment, so the wording
    // says so plainly rather than hiding it behind "complete order".
    const handleConfirmReceipt = async (orderId) => {
        if (processingId) return;
        if (
            !window.confirm(
                "Confirm you've received this order? The seller gets paid, and it can't be undone."
            )
        ) {
            return;
        }

        setProcessingId(orderId);
        setActionError("");

        try {
            await apiRequest(`/orders/${orderId}/confirm`, { method: "POST" });
            refetch();
        } catch (err) {
            setActionError(err.message || "Couldn't confirm the order");
        } finally {
            setProcessingId(null);
        }
    };

    return (
        <div className="min-h-screen bg-background pt-24 px-5 pb-12 md:px-8">
            <div className="max-w-3xl mx-auto">

                <h1 className="text-2xl font-bold text-textPrimary mb-1">My Orders</h1>
                <p className="text-sm text-textSecondary mb-5">
                    Track and manage your purchases.
                </p>

                {/* Status tabs */}
                <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 mb-5">
                    {STATUS_TABS.map((tab) => (
                        <button
                            key={tab.value}
                            onClick={() => setStatus(tab.value)}
                            className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition ${
                                status === tab.value
                                    ? "bg-primary text-white"
                                    : "bg-surface border border-line text-textSecondary hover:bg-ink-100"
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {actionError && (
                    <div className="bg-dangerSoft border border-danger/30 text-danger text-sm rounded-xl px-4 py-3 mb-4">
                        {actionError}
                    </div>
                )}

                {/* Loading */}
                {loading && (
                    <div className="flex flex-col gap-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="bg-surface border border-line rounded-xl p-5">
                                <div className="h-4 bg-ink-100 rounded w-1/3 mb-3 animate-pulse" />
                                <div className="h-3 bg-ink-100 rounded w-1/2 animate-pulse" />
                            </div>
                        ))}
                    </div>
                )}

                {!loading && error && (
                    <p className="text-danger text-sm">Error: {error}</p>
                )}

                {/* Empty */}
                {!loading && !error && orders.length === 0 && (
                    <div className="bg-surface border border-line rounded-xl p-12 text-center">
                        <p className="text-textSecondary text-sm mb-3">No orders found.</p>
                        <Link to="/explore" className="text-primary text-sm font-semibold hover:underline">
                            Start shopping →
                        </Link>
                    </div>
                )}

                {/* Order list */}
                {!loading && orders.length > 0 && (
                    <div className="flex flex-col gap-4">
                        {orders.map((order) => {
                            const daysLeft = daysUntilAutoComplete(order.shipped_at);
                            const hasFooterAction =
                                order.status === "pending" ||
                                order.is_cancellable ||
                                order.status === "shipped";

                            return (
                                <div
                                    key={order.id}
                                    className={`bg-surface border border-line rounded-xl overflow-hidden transition-opacity ${
                                        processingId === order.id ? "opacity-50" : ""
                                    }`}
                                >
                                    {/* Header */}
                                    <div className="px-5 py-3 bg-surfaceAlt border-b border-line flex items-center justify-between gap-3">
                                        <div className="min-w-0">
                                            <p className="text-sm font-semibold text-textPrimary truncate">
                                                {order.seller_name}
                                            </p>
                                            <p className="text-xs text-textSecondary font-mono mt-0.5">
                                                {order.invoice_number}
                                            </p>
                                        </div>
                                        <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize shrink-0 ${
                                            STATUS_STYLE[order.status] || "bg-ink-100 text-textSecondary"
                                        }`}>
                                            {order.status}
                                        </span>
                                    </div>

                                    {/* Body */}
                                    <div className="px-5 py-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-xs text-textSecondary">
                                                {formatDate(order.created_at)} · {order.item_count} item
                                                {order.item_count !== 1 ? "s" : ""}
                                            </span>
                                            <span className="text-xs text-textSecondary capitalize">
                                                {order.payment?.method?.replace("_", " ")}
                                            </span>
                                        </div>

                                        <p className="text-lg font-bold text-textPrimary tabular">
                                            {formatPrice(order.total_amount)}
                                        </p>
                                    </div>

                                    {/* Shipped — nudge toward confirming */}
                                    {order.status === "shipped" && daysLeft !== null && (
                                        <p className="px-5 pb-3 text-xs text-textSecondary">
                                            {daysLeft === 0
                                                ? "This closes automatically today and the seller gets paid."
                                                : `If you don't confirm, this closes automatically in ${daysLeft} day${daysLeft === 1 ? "" : "s"}.`}
                                        </p>
                                    )}

                                    {/* Actions */}
                                    {hasFooterAction && (
                                        <div className="px-5 py-3 border-t border-line flex items-center justify-end gap-2">
                                            {order.is_cancellable && (
                                                <button
                                                    onClick={() => handleCancel(order.id)}
                                                    disabled={processingId === order.id}
                                                    className="px-4 py-2 text-sm font-medium text-danger hover:bg-dangerSoft rounded-lg transition disabled:opacity-40"
                                                >
                                                    Cancel
                                                </button>
                                            )}

                                            {order.status === "pending" && (
                                                <button
                                                    onClick={() => handlePay(order.id)}
                                                    disabled={processingId === order.id}
                                                    className="px-5 py-2 text-sm font-semibold text-white bg-primary hover:bg-primaryHover rounded-lg transition disabled:opacity-40"
                                                >
                                                    {processingId === order.id ? "Processing..." : "Pay Now"}
                                                </button>
                                            )}

                                            {order.status === "shipped" && (
                                                <button
                                                    onClick={() => handleConfirmReceipt(order.id)}
                                                    disabled={processingId === order.id}
                                                    className="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-primary hover:bg-primaryHover rounded-lg transition disabled:opacity-40"
                                                >
                                                    <PackageCheck size={15} />
                                                    {processingId === order.id ? "Processing..." : "Order received"}
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}