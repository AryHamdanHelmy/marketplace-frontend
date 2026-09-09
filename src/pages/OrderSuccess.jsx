import { useParams, Link } from "react-router-dom";
import { useFetch } from "../hooks/useFetch";
import { CircleCheck, ArrowRight } from "lucide-react";

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
        <div className="min-h-screen bg-background pt-24 px-5 pb-12 md:px-8">
            <div className="max-w-3xl mx-auto">

                {loading && (
                    <div className="bg-surface border border-line rounded-xl p-10">
                        <div className="h-6 bg-ink-100 rounded w-1/3 mx-auto mb-4 animate-pulse" />
                        <div className="h-24 bg-ink-100 rounded animate-pulse" />
                    </div>
                )}

                {!loading && error && (
                    <div className="bg-surface border border-line rounded-xl p-10 text-center">
                        <p className="text-danger text-sm mb-3">Error: {error}</p>
                        <Link to="/orders" className="text-primary text-sm font-semibold hover:underline">
                            View my orders →
                        </Link>
                    </div>
                )}

                {!loading && !error && order && (
                    <>
                        {/* Success header */}
                        <div className="bg-surface border border-line rounded-xl p-8 text-center mb-4">
                            <div className="w-14 h-14 rounded-2xl bg-successSoft flex items-center justify-center mx-auto mb-4">
                                <CircleCheck size={28} className="text-success" />
                            </div>
                            <h1 className="text-xl font-bold text-textPrimary mb-1">
                                Order placed
                            </h1>
                            <p className="text-sm text-textSecondary mb-4">
                                {transactions.length > 1
                                    ? `Split into ${transactions.length} orders, one per seller. You pay once for all of them.`
                                    : "Your order is waiting for payment."}
                            </p>
                            <p className="text-2xl font-bold text-textPrimary tabular">
                                {formatPrice(order.grand_total)}
                            </p>
                        </div>

                        {/* Payment is the next step, so it leads. Leaving the
                            buyer on "view my orders" strands them here with an
                            unpaid order and no obvious way forward. */}
                        <Link
                            to={`/payment/${groupId}`}
                            className="flex items-center justify-center gap-2 w-full bg-primary hover:bg-primaryHover text-white font-semibold rounded-full py-3.5 mb-6 transition"
                        >
                            Pay now
                            <ArrowRight size={18} />
                        </Link>

                        {/* Daftar transaksi */}
                        <div className="flex flex-col gap-4 mb-6">
                            {transactions.map((trx) => (
                                <div
                                    key={trx.id}
                                    className="bg-surface border border-line rounded-xl overflow-hidden"
                                >
                                    {/* Header */}
                                    <div className="px-5 py-3 bg-surfaceAlt border-b border-line flex items-center justify-between gap-3">
                                        <div className="min-w-0">
                                            <p className="text-sm font-semibold text-textPrimary truncate">
                                                {trx.seller_name}
                                            </p>
                                            <p className="text-xs text-textSecondary font-mono mt-0.5">
                                                {trx.invoice_number}
                                            </p>
                                        </div>
                                        <span className="text-xs font-medium px-2 py-1 rounded-full bg-warningSoft text-warning capitalize shrink-0">
                                            {trx.status}
                                        </span>
                                    </div>

                                    {/* Items */}
                                    <div className="divide-y divide-line">
                                        {trx.items.map((item, i) => (
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

                                    {/* Footer */}
                                    <div className="px-5 py-3 bg-surfaceAlt border-t border-line flex items-center justify-between">
                                        <span className="text-xs text-textSecondary capitalize">
                                            {trx.payment?.method?.replace("_", " ")}
                                        </span>
                                        <span className="text-sm font-bold text-textPrimary tabular">
                                            {formatPrice(trx.total_amount)}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Secondary actions */}
                        <div className="flex flex-col md:flex-row gap-3">
                            <Link
                                to="/orders"
                                className="flex-1 text-center border border-lineStrong text-textPrimary font-semibold rounded-full py-3 hover:bg-ink-100 transition"
                            >
                                View my orders
                            </Link>
                            <Link
                                to="/explore"
                                className="flex-1 text-center border border-lineStrong text-textPrimary font-semibold rounded-full py-3 hover:bg-ink-100 transition"
                            >
                                Continue shopping
                            </Link>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}