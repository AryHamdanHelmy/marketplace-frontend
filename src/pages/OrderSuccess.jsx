import { useParams, Link } from "react-router-dom";
import { useFetch } from "../hooks/useFetch";
import { CheckCircle } from "lucide-react";

export default function OrderSuccess() {
    const { groupId } = useParams();
    const { data, loading, error } = useFetch(`/checkout/${groupId}`, [groupId]);

    const order = data?.data;
    const transactions = order?.transactions || [];

    const formatPrice = (value) =>
        new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(value ?? 0);

    return (
        <div className="min-h-screen bg-gray-50 pt-24 px-5 pb-12 md:px-8">
            <div className="max-w-3xl mx-auto">

                {loading && (
                    <div className="bg-white border border-gray-200 rounded-xl p-10">
                        <div className="h-6 bg-gray-100 rounded w-1/3 mx-auto mb-4 animate-pulse" />
                        <div className="h-24 bg-gray-100 rounded animate-pulse" />
                    </div>
                )}

                {!loading && error && (
                    <div className="bg-white border border-gray-200 rounded-xl p-10 text-center">
                        <p className="text-red-500 text-sm mb-3">Error: {error}</p>
                        <Link to="/orders" className="text-pastel-blue text-sm hover:underline">
                            View my orders →
                        </Link>
                    </div>
                )}

                {!loading && !error && order && (
                    <>
                        {/* Success header */}
                        <div className="bg-white border border-gray-200 rounded-xl p-8 text-center mb-6">
                            <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-4">
                                <CheckCircle size={28} className="text-emerald-500" />
                            </div>
                            <h1 className="text-xl font-bold text-darkblue mb-1">
                                Order Placed Successfully
                            </h1>
                            <p className="text-sm text-gray-400 mb-4">
                                {transactions.length > 1
                                    ? `Your order was split into ${transactions.length} separate orders, one per seller.`
                                    : "Your order has been received and is awaiting payment."}
                            </p>
                            <p className="text-2xl font-bold text-darkblue">
                                {formatPrice(order.grand_total)}
                            </p>
                        </div>

                        {/* Daftar transaksi */}
                        <div className="flex flex-col gap-4 mb-6">
                            {transactions.map((trx) => (
                                <div
                                    key={trx.id}
                                    className="bg-white border border-gray-200 rounded-xl overflow-hidden"
                                >
                                    {/* Header */}
                                    <div className="px-5 py-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between gap-3">
                                        <div className="min-w-0">
                                            <p className="text-sm font-semibold text-darkblue truncate">
                                                {trx.seller_name}
                                            </p>
                                            <p className="text-xs text-gray-400 font-mono mt-0.5">
                                                {trx.invoice_number}
                                            </p>
                                        </div>
                                        <span className="text-xs font-medium px-2 py-1 rounded-full bg-amber-100 text-amber-600 capitalize shrink-0">
                                            {trx.status}
                                        </span>
                                    </div>

                                    {/* Items */}
                                    <div className="divide-y divide-gray-50">
                                        {trx.items.map((item, i) => (
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
                                        <span className="text-xs text-gray-400 capitalize">
                                            {trx.payment?.method?.replace("_", " ")}
                                        </span>
                                        <span className="text-sm font-bold text-darkblue">
                                            {formatPrice(trx.total_amount)}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col md:flex-row gap-3">
                            <Link
                                to="/orders"
                                className="flex-1 text-center bg-pastel-blue hover:bg-pastel-cyan text-white font-semibold rounded-full py-3 transition"
                            >
                                View My Orders
                            </Link>
                            <Link
                                to="/explore"
                                className="flex-1 text-center border border-gray-200 text-darkblue font-semibold rounded-full py-3 hover:bg-gray-50 transition"
                            >
                                Continue Shopping
                            </Link>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}