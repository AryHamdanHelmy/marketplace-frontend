import { useState } from "react";
import { useFetch } from "../hooks/useFetch";
import { apiRequest } from "../api/Client";
import SellerSidebar from "../components/organisms/SellerSidebar";
import { Package, Truck, CircleCheck, Clock, MapPin } from "lucide-react";

const CONFIRMATION_WINDOW_DAYS = 7;

const STATUS_TABS = [
    { value: "",          label: "All" },
    { value: "pending",   label: "Awaiting Payment" },
    { value: "paid",      label: "To Ship" },
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

// Days left before the order closes itself and the balance is credited.
function daysUntilAutoComplete(shippedAt) {
    if (!shippedAt) return null;

    const deadline = new Date(shippedAt);
    deadline.setDate(deadline.getDate() + CONFIRMATION_WINDOW_DAYS);

    const days = Math.ceil((deadline - new Date()) / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
}

export default function SellerOrders() {
    const [status, setStatus] = useState("");
    const query = status ? `/seller/orders?status=${status}` : "/seller/orders";
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

    const handleMarkShipped = async (orderId) => {
        if (processingId) return;
        if (!window.confirm("Mark this order as shipped?")) return;

        setProcessingId(orderId);
        setActionError("");

        try {
            await apiRequest(`/seller/orders/${orderId}/status`, {
                method: "PUT",
                body: { status: "shipped" },
            });
            refetch();
        } catch (err) {
            setActionError(err.message || "Failed to update order status");
        } finally {
            setProcessingId(null);
        }
    };

    // Ringkasan untuk kartu statistik
    const countBy = (s) => orders.filter((o) => o.status === s).length;

    return (
        <>
            <SellerSidebar />
            <div className="min-h-screen bg-background pt-24 px-5 pb-12 md:pl-70 md:pr-10">
                <div className="max-w-4xl mx-auto">

                    <h1 className="text-2xl font-bold text-textPrimary mb-1">Incoming Orders</h1>
                    <p className="text-sm text-textSecondary mb-5">
                        Ship your orders. Buyers confirm receipt, which releases your payment.
                    </p>

                    {/* Ringkasan */}
                    <div className="grid grid-cols-3 gap-3 mb-5">
                        <StatCard
                            icon={Package}
                            label="To Ship"
                            value={countBy("paid")}
                            color="text-accent"
                            bg="bg-accentSoft"
                        />
                        <StatCard
                            icon={Truck}
                            label="Shipped"
                            value={countBy("shipped")}
                            color="text-primary"
                            bg="bg-primarySoft"
                        />
                        <StatCard
                            icon={CircleCheck}
                            label="Completed"
                            value={countBy("completed")}
                            color="text-success"
                            bg="bg-successSoft"
                        />
                    </div>

                    {/* Filter tabs */}
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

                    {!loading && !error && orders.length === 0 && (
                        <div className="bg-surface border border-line rounded-xl p-12 text-center">
                            <p className="text-textSecondary text-sm">No orders found.</p>
                        </div>
                    )}

                    {/* Daftar pesanan */}
                    {!loading && orders.length > 0 && (
                        <div className="flex flex-col gap-4">
                            {orders.map((order) => {
                                const daysLeft = daysUntilAutoComplete(order.shipped_at);
                                const address = order.shipping_address;

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
                                                    {order.buyer?.name || "Unknown Buyer"}
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

                                        {/* Items */}
                                        <div className="divide-y divide-line">
                                            {order.items?.map((item, i) => (
                                                <div key={i} className="flex gap-3 px-5 py-3">
                                                    <div className="w-12 h-12 rounded-lg bg-ink-100 overflow-hidden shrink-0">
                                                        {item.thumbnail ? (
                                                            <img
                                                                src={item.thumbnail}
                                                                alt={item.product_name}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-textMuted text-[10px]">
                                                                No img
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm text-textPrimary truncate">
                                                            {item.product_name}
                                                        </p>
                                                        <p className="text-xs text-textSecondary mt-0.5">
                                                            {formatPrice(item.price)} × {item.quantity}
                                                        </p>
                                                    </div>
                                                    <p className="text-sm font-semibold text-textPrimary shrink-0 tabular">
                                                        {formatPrice(item.subtotal)}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Where it goes. Frozen onto the order at checkout, so
                                            a buyer editing their address book later can't change
                                            where a shipped parcel was sent. Orders placed before
                                            addresses existed have none. */}
                                        {address && (
                                            <div className="px-5 py-3 border-t border-line">
                                                <p className="inline-flex items-center gap-1.5 text-label uppercase text-textSecondary mb-1.5">
                                                    <MapPin size={12} className="text-primary" />
                                                    Deliver to
                                                </p>
                                                <p className="text-sm text-textPrimary">
                                                    {address.recipient_name}
                                                    <span className="text-textSecondary">
                                                        {" · "}{address.phone}
                                                    </span>
                                                </p>
                                                <p className="text-sm text-textSecondary mt-0.5 leading-relaxed">
                                                    {address.street}
                                                    {address.district ? `, ${address.district}` : ""}
                                                    <br />
                                                    {address.city}, {address.province}{" "}
                                                    {address.postal_code}
                                                </p>
                                                {address.courier_note && (
                                                    <p className="mt-2 text-xs text-textSecondary bg-ink-100 rounded-lg px-3 py-2">
                                                        {address.courier_note}
                                                    </p>
                                                )}
                                            </div>
                                        )}

                                        {/* Footer */}
                                        <div className="px-5 py-3 bg-surfaceAlt border-t border-line flex items-center justify-between">
                                            <span className="text-xs text-textSecondary">
                                                {formatDate(order.created_at)}
                                            </span>
                                            <span className="text-base font-bold text-textPrimary tabular">
                                                {formatPrice(order.total_amount)}
                                            </span>
                                        </div>

                                        {/* Ship action */}
                                        {order.status === "paid" && (
                                            <div className="px-5 py-3 border-t border-line flex justify-end">
                                                <button
                                                    onClick={() => handleMarkShipped(order.id)}
                                                    disabled={processingId === order.id}
                                                    className="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-primary hover:bg-primaryHover rounded-lg transition disabled:opacity-40"
                                                >
                                                    <Truck size={15} />
                                                    {processingId === order.id ? "Processing..." : "Mark as Shipped"}
                                                </button>
                                            </div>
                                        )}

                                        {/* Waiting on the buyer — completion is theirs to give,
                                            or the 7-day window closes it automatically. */}
                                        {order.status === "shipped" && (
                                            <div className="px-5 py-3 border-t border-line flex items-start gap-2 bg-surfaceAlt">
                                                <Clock size={15} className="text-textMuted mt-0.5 shrink-0" />
                                                <p className="text-xs text-textSecondary">
                                                    Waiting for the buyer to confirm receipt.
                                                    {daysLeft !== null && (
                                                        <>
                                                            {" "}
                                                            {daysLeft === 0
                                                                ? "It closes automatically today, and your payment is released."
                                                                : `It closes automatically in ${daysLeft} day${daysLeft === 1 ? "" : "s"}, and your payment is released then.`}
                                                        </>
                                                    )}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

function StatCard({ icon: Icon, label, value, color, bg }) {
    return (
        <div className="bg-surface border border-line rounded-xl p-4">
            <div className={`w-9 h-9 rounded-lg ${bg} flex items-center justify-center mb-2`}>
                <Icon size={17} className={color} />
            </div>
            <p className="text-xl font-bold text-textPrimary tabular">{value}</p>
            <p className="text-xs text-textSecondary mt-0.5">{label}</p>
        </div>
    );
}