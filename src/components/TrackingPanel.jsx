import { useState } from "react";
import { Copy, Check, Truck, PackageCheck, TriangleAlert, ChevronDown, ChevronUp } from "lucide-react";

/**
 * Shows where a parcel is, from data already stored on the order.
 *
 * Nothing here calls a courier. The backend's shipping:poll command refreshes
 * transactions.tracking_snapshot on a schedule, and this renders whatever it
 * last wrote — so a buyer refreshing the page costs nothing and never waits on
 * a courier's server.
 */

const STATUS_STYLE = {
    pending:    { label: "Awaiting pickup", icon: Truck,        cls: "bg-warningSoft text-warning" },
    picked_up:  { label: "Picked up",       icon: Truck,        cls: "bg-primarySoft text-primary" },
    in_transit: { label: "On the way",      icon: Truck,        cls: "bg-primarySoft text-primary" },
    delivered:  { label: "Delivered",       icon: PackageCheck, cls: "bg-successSoft text-success" },
    problem:    { label: "Needs attention", icon: TriangleAlert, cls: "bg-dangerSoft text-danger" },
};

export default function TrackingPanel({ order }) {
    const [copied, setCopied] = useState(false);
    const [open, setOpen] = useState(false);

    // Nothing to show until the seller has actually handed it over.
    if (!order.tracking_number) return null;

    const tracking = order.tracking;
    const state = STATUS_STYLE[tracking?.status] || STATUS_STYLE.pending;
    const Icon = state.icon;
    const history = tracking?.history || [];

    const copy = async () => {
        await navigator.clipboard.writeText(order.tracking_number);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="mt-3 rounded-lg border border-line bg-surfaceAlt p-3">
            <div className="flex items-center gap-2 flex-wrap">
                <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${state.cls}`}>
                    <Icon size={13} />
                    {state.label}
                </span>

                {order.courier && (
                    <span className="text-xs text-textSecondary">{order.courier}</span>
                )}
            </div>

            <div className="mt-2 flex items-center gap-2">
                <span className="font-mono text-sm text-textPrimary tabular">
                    {order.tracking_number}
                </span>
                <button
                    onClick={copy}
                    aria-label="Copy tracking number"
                    className="text-primary transition hover:text-primaryHover"
                >
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                </button>
            </div>

            {tracking?.status_text && (
                <p className="mt-2 text-sm text-textSecondary">{tracking.status_text}</p>
            )}

            {tracking?.received_by && (
                <p className="mt-1 text-xs text-textSecondary">
                    Signed for by {tracking.received_by}
                </p>
            )}

            {/* Before the courier's first scan there is genuinely nothing to
                show. Saying so beats an empty box that looks broken. */}
            {!tracking && (
                <p className="mt-2 text-xs text-textMuted">
                    The courier hasn't scanned this yet. Updates usually appear
                    within a few hours of pickup.
                </p>
            )}

            {history.length > 0 && (
                <>
                    <button
                        onClick={() => setOpen((v) => !v)}
                        className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                    >
                        {open ? "Hide" : "Show"} history
                        {open ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                    </button>

                    {open && (
                        <ol className="mt-2 space-y-2 border-l border-line pl-3">
                            {history.map((entry, i) => (
                                <li key={i} className="text-xs">
                                    <p className="text-textPrimary">
                                        {entry.description || entry.desc || "Update"}
                                    </p>
                                    <p className="text-textMuted">
                                        {[entry.date, entry.location]
                                            .filter(Boolean)
                                            .join(" · ")}
                                    </p>
                                </li>
                            ))}
                        </ol>
                    )}
                </>
            )}

            {/* Delivered is the courier's word, not the buyer's. Escrow still
                waits for the confirm button on the order card above. */}
            {tracking?.status === "delivered" && order.status === "shipped" && (
                <p className="mt-2 text-xs text-textSecondary">
                    Received it? Confirm above so the seller gets paid.
                </p>
            )}
        </div>
    );
}