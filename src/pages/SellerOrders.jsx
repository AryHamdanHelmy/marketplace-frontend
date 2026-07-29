import { useState } from "react";
import { useFetch } from "../hooks/useFetch";
import { apiRequest } from "../api/Client";
import SellerSidebar from "../components/organisms/SellerSidebar";
import { Package, Truck, CheckCircle } from "lucide-react";

const STATUS_TABS = [
    { value: "",          label: "All" },
    { value: "pending",   label: "Awaiting Payment" },
    { value: "paid",      label: "To Ship" },
    { value: "shipped",   label: "Shipped" },
    { value: "completed", label: "Completed" },
    { value: "cancelled", label: "Cancelled" },
];

const STATUS_STYLE = {
    pending:   "bg-amber-100 text-amber-600",
    paid:      "bg-blue-100 text-blue-600",
    shipped:   "bg-indigo-100 text-indigo-600",
    completed: "bg-emerald-100 text-emerald-700",
    cancelled: "bg-red-100 text-red-500",
};

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

    const handleUpdateStatus = async (orderId, newStatus) => {
        if (processingId) return;

        const label = newStatus === "shipped" ? "shipped" : "completed";
        if (!window.confirm(`Mark this order as ${label}?`)) return;

        setProcessingId(orderId);
        setActionError("");

        try {
            await apiRequest(`/seller/orders/${orderId}/status`, {
                method: "PUT",
                body: { status: newStatus },
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
            <div className="min-h-screen bg-gray-50 pt-24 px-5 pb-12 md:pl-[280px] md:pr-10">
                <div className="max-w-4xl mx-auto">

                    <h1 className="text-2xl font-bold text-darkblue mb-1">Incoming Orders</h1>
                    <p className="text-sm text-gray-400 mb-5">
                        Manage and fulfill orders from your customers.
                    </p>

                    {/* Ringkasan */}
                    <div className="grid grid-cols-3 gap-3 mb-5">
                        <StatCard
                            icon={Package}
                            label="To Ship"
                            value={countBy("paid")}
                            color="text-blue-500"
                            bg="bg-blue-50"
                        />
                        <StatCard
                            icon={Truck}
                            label="Shipped"
                            value={countBy("shipped")}
                            color="text-indigo-500"
                            bg="bg-indigo-50"
                        />
                        <StatCard
                            icon={CheckCircle}
                            label="Completed"
                            value={countBy("completed")}
                            color="text-emerald-500"
                            bg="bg-emerald-50"
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
                                        ? "bg-pastel-blue text-white"
                                        : "bg-white border border-gray-200 text-gray-500 hover:bg-gray-50"
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {actionError && (
                        <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 mb-4">
                            {actionError}
                        </div>
                    )}

                    {loading && (
                        <div className="flex flex-col gap-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="bg-white border border-gray-200 rounded-xl p-5">
                                    <div className="h-4 bg-gray-100 rounded w-1/3 mb-3 animate-pulse" />
                                    <div className="h-3 bg-gray-100 rounded w-1/2 animate-pulse" />
                                </div>
                            ))}
                        </div>
                    )}

                    {!loading && error && (
                        <p className="text-red-500 text-sm">Error: {error}</p>
                    )}

                    {!loading && !error && orders.length === 0 && (
                        <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
                            <div className="text-4xl mb-3">📭</div>
                            <p className="text-gray-400 text-sm">No orders found.</p>
                        </div>
                    )}

                    {/* Daftar pesanan */}
                    {!loading && orders.length > 0 && (
                        <div className="flex flex-col gap-4">
                            {orders.map((order) => (
                                <div
                                    key={order.id}
                                    className={`bg-white border border-gray-200 rounded-xl overflow-hidden transition-opacity ${
                                        processingId === order.id ? "opacity-50" : ""
                                    }`}
                                >
                                    {/* Header */}
                                    <div className="px-5 py-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between gap-3">
                                        <div className="min-w-0">
                                            <p className="text-sm font-semibold text-darkblue truncate">
                                                {order.buyer?.name || "Unknown Buyer"}
                                            </p>
                                            <p className="text-xs text-gray-400 font-mono mt-0.5">
                                                {order.invoice_number}
                                            </p>
                                        </div>
                                        <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize shrink-0 ${
                                            STATUS_STYLE[order.status] || "bg-gray-100 text-gray-500"
                                        }`}>
                                            {order.status}
                                        </span>
                                    </div>

                                    {/* Items */}
                                    <div className="divide-y divide-gray-50">
                                        {order.items?.map((item, i) => (
                                            <div key={i} className="flex gap-3 px-5 py-3">
                                                <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden shrink-0">
                                                    {item.thumbnail ? (
                                                        <img
                                                            src={item.thumbnail}
                                                            alt={item.product_name}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-gray-300 text-[10px]">
                                                            No img
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm text-darkblue truncate">
                                                        {item.product_name}
                                                    </p>
                                                    <p className="text-xs text-gray-400 mt-0.5">
                                                        {formatPrice(item.price)} × {item.quantity}
                                                    </p>
                                                </div>
                                                <p className="text-sm font-semibold text-darkblue shrink-0">
                                                    {formatPrice(item.subtotal)}
                                                </p>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Footer */}
                                    <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                                        <span className="text-xs text-gray-400">
                                            {formatDate(order.created_at)}
                                        </span>
                                        <span className="text-base font-bold text-darkblue">
                                            {formatPrice(order.total_amount)}
                                        </span>
                                    </div>

                                    {/* Actions — hanya muncul untuk status yang bisa dilanjutkan */}
                                    {(order.status === "paid" || order.status === "shipped") && (
                                        <div className="px-5 py-3 border-t border-gray-100 flex justify-end">
                                            {order.status === "paid" && (
                                                <button
                                                    onClick={() => handleUpdateStatus(order.id, "shipped")}
                                                    disabled={processingId === order.id}
                                                    className="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-pastel-blue hover:bg-pastel-cyan rounded-lg transition disabled:opacity-40"
                                                >
                                                    <Truck size={15} />
                                                    {processingId === order.id ? "Processing..." : "Mark as Shipped"}
                                                </button>
                                            )}
                                            {order.status === "shipped" && (
                                                <button
                                                    onClick={() => handleUpdateStatus(order.id, "completed")}
                                                    disabled={processingId === order.id}
                                                    className="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-emerald-500 hover:bg-emerald-600 rounded-lg transition disabled:opacity-40"
                                                >
                                                    <CheckCircle size={15} />
                                                    {processingId === order.id ? "Processing..." : "Mark as Completed"}
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

function StatCard({ icon: Icon, label, value, color, bg }) {
    return (
        <div className="bg-white border border-gray-200 rounded-xl p-4">
            <div className={`w-9 h-9 rounded-lg ${bg} flex items-center justify-center mb-2`}>
                <Icon size={17} className={color} />
            </div>
            <p className="text-xl font-bold text-darkblue">{value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{label}</p>
        </div>
    );
}