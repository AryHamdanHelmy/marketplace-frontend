import { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useFetch } from "../hooks/useFetch";
import { apiRequest } from "../api/Client";
import { useCart } from "../context/CartContext";
import AreaPicker from "../components/AreaPicker";
import {
    MapPin, Package, CreditCard, ShieldCheck, Check, Plus,
    Landmark, ChevronDown, ChevronUp, X, Truck, Loader2,
} from "lucide-react";

const STEPS = ["Cart", "Address", "Payment", "Done"];
const CURRENT_STEP = 2;   // Address and payment both happen on this page
 
// The gateway speaks in channels; the legacy payments table speaks in methods.
// One mapping in one place, rather than the two vocabularies leaking into
// every component.
const METHOD_FOR_CHANNEL = {
    bank_transfer: "bank_transfer",
    qris: "ewallet",
    gopay: "ewallet",
    ovo: "ewallet",
    credit_card: "bank_transfer",
};
 
const rupiah = (value) =>
    "Rp " + Number(value ?? 0).toLocaleString("id-ID", { maximumFractionDigits: 0 });
 
export default function Checkout() {
    const navigate = useNavigate();
    const location = useLocation();
    const cartItemIds = location.state?.cartItemIds || null;
 
    useEffect(() => {
        if (!cartItemIds || cartItemIds.length === 0) {
            navigate("/cart", { replace: true });
        }
    }, [cartItemIds, navigate]);
 
    const { data, loading, error } = useFetch("/cart", []);
    const { refresh: refreshCartCount } = useCart();
 
    const [addresses, setAddresses] = useState([]);
    const [addressId, setAddressId] = useState(null);
    const [pickerOpen, setPickerOpen] = useState(false);
    const [formOpen, setFormOpen] = useState(false);
 
    const [channels, setChannels] = useState([]);
    const [channel, setChannel] = useState("");
 
    // Shipping quotes, keyed by seller id, plus the courier chosen for each.
    const [shipments, setShipments] = useState([]);
    const [courierBySeller, setCourierBySeller] = useState({});
    const [quoting, setQuoting] = useState(false);
    const [quoteError, setQuoteError] = useState("");
 
    const [notes, setNotes] = useState("");
    const [summaryOpen, setSummaryOpen] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [serverError, setServerError] = useState("");
    const [itemErrors, setItemErrors] = useState([]);
 
    // Created once when the page opens, not on each click. Clicking "Place
    // order" repeatedly reuses the same key, so the backend recognises it as
    // one attempt rather than several orders.
    const [idempotencyKey] = useState(() => crypto.randomUUID());
 
    useEffect(() => {
        (async () => {
            const [addressRes, channelRes] = await Promise.all([
                apiRequest("/addresses").catch(() => null),
                apiRequest("/payments/channels").catch(() => null),
            ]);
 
            const list = addressRes?.data || [];
            setAddresses(list);
            setAddressId(list.find((a) => a.is_default)?.id ?? list[0]?.id ?? null);
 
            const available = channelRes?.data || [];
            setChannels(available);
            setChannel(available[0]?.code || "");
        })();
    }, []);
 
    const allItems = data?.data || [];
    const items = cartItemIds
        ? allItems.filter((item) => cartItemIds.includes(item.id))
        : allItems;
    const itemsTotal = items.reduce((sum, item) => sum + Number(item.subtotal), 0);
 
    // Grouped by seller, mirroring how the backend splits the transactions.
    // Keyed by id rather than name so shipping quotes can be matched back —
    // two shops can share a display name, ids can't.
    const groupedBySeller = items.reduce((acc, item) => {
        const id = item.product.seller_id;
        if (!acc[id]) {
            acc[id] = { id, name: item.product.seller || "Unknown Seller", items: [] };
        }
        acc[id].items.push(item);
        return acc;
    }, {});
    const sellerGroups = Object.values(groupedBySeller);
 
    const selectedAddress = addresses.find((a) => a.id === addressId);
 
    // Re-quote whenever the destination changes. Each call can cost provider
    // quota, so it's tied to the address and the item set — not to every
    // render, and not to picking a courier.
    useEffect(() => {
        if (!addressId || !cartItemIds?.length) return;
 
        let cancelled = false;
 
        (async () => {
            setQuoting(true);
            setQuoteError("");
 
            try {
                const res = await apiRequest("/shipping/quote", {
                    method: "POST",
                    body: { address_id: addressId, cart_item_ids: cartItemIds },
                });
 
                if (cancelled) return;
 
                const list = res.data?.shipments || [];
                setShipments(list);
 
                // Preselect the cheapest per shop. The backend returns them
                // cheapest first, so this is just the head of each list.
                const preset = {};
                list.forEach((s) => {
                    if (s.rates?.length) preset[s.seller_id] = s.rates[0].key;
                });
                setCourierBySeller(preset);
            } catch (err) {
                if (cancelled) return;
 
                setShipments([]);
                setCourierBySeller({});
                setQuoteError(err.message || "Couldn't calculate shipping right now.");
            } finally {
                if (!cancelled) setQuoting(false);
            }
        })();
 
        return () => {
            cancelled = true;
        };
    }, [addressId, cartItemIds]);
 
    const shipmentFor = (sellerId) =>
        shipments.find((s) => String(s.seller_id) === String(sellerId));
 
    const rateFor = (sellerId) => {
        const shipment = shipmentFor(sellerId);
        const key = courierBySeller[sellerId];
        return shipment?.rates?.find((r) => r.key === key) || null;
    };
 
    const shippingTotal = sellerGroups.reduce(
        (sum, group) => sum + Number(rateFor(group.id)?.cost || 0),
        0
    );
 
    const grandTotal = itemsTotal + shippingTotal;
 
    // Every shop needs a courier before this can be ordered. Checked here so
    // the button explains itself, rather than the server rejecting it after
    // the buyer has already committed.
    const shippingReady =
        sellerGroups.length > 0 &&
        sellerGroups.every((group) => Boolean(rateFor(group.id)));
 
    const handleAddressSaved = (address) => {
        setAddresses((prev) => [address, ...prev.filter((a) => a.id !== address.id)]);
        setAddressId(address.id);
        setFormOpen(false);
        setPickerOpen(false);
    };
 
    const handleSubmit = async () => {
        if (submitting) return;
 
        if (!addressId) {
            setServerError("Choose where this should be delivered.");
            return;
        }
 
        if (!shippingReady) {
            setServerError("Pick a courier for every shop in your order.");
            return;
        }
 
        setServerError("");
        setItemErrors([]);
        setSubmitting(true);
 
        try {
            const res = await apiRequest("/checkout", {
                method: "POST",
                body: {
                    idempotency_key: idempotencyKey,
                    address_id: addressId,
                    payment_method: METHOD_FOR_CHANNEL[channel] || "bank_transfer",
                    notes: notes || null,
                    cart_item_ids: cartItemIds,
 
                    // Only the service key travels. The server re-prices it —
                    // a cost sent from here would be a cost anyone could edit.
                    shipping: courierBySeller,
                },
            });
 
            const groupId = res.data?.checkout_group_id;
            refreshCartCount();
 
            // Open the charge straight away so the buyer lands on payment
            // instructions rather than picking a method twice. If it fails the
            // payment page still works — it just shows the picker again.
            try {
                await apiRequest(`/payments/${groupId}/charge`, {
                    method: "POST",
                    body: { channel },
                });
            } catch {
                // Non-fatal: the order exists, payment can be started later
            }
 
            navigate(`/payment/${groupId}`);
        } catch (err) {
            if (err.errors && Array.isArray(err.errors)) {
                setItemErrors(err.errors);
            }
            setServerError(err.message || "Checkout failed, please try again");
            setSubmitting(false);
        }
    };
 
    return (
        <div className="min-h-screen bg-background pt-20 pb-44 px-4">
            <div className="max-w-2xl mx-auto">
 
                {/* Stepper */}
                <div className="bg-surface border border-line rounded-xl p-4 mb-4">
                    <div className="flex items-center">
                        {STEPS.map((label, index) => {
                            const done = index < CURRENT_STEP;
                            const active = index === CURRENT_STEP;
 
                            return (
                                <div key={label} className="flex items-center flex-1 last:flex-none">
                                    <div className="flex flex-col items-center gap-1.5">
                                        <span
                                            className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold ${
                                                active
                                                    ? "bg-primary text-white"
                                                    : done
                                                        ? "bg-primarySoft text-primary"
                                                        : "bg-ink-100 text-textMuted"
                                            }`}
                                        >
                                            {done ? <Check size={14} strokeWidth={3} /> : index + 1}
                                        </span>
                                        <span
                                            className={`text-[10px] ${
                                                active ? "text-textPrimary font-semibold" : "text-textMuted"
                                            }`}
                                        >
                                            {label}
                                        </span>
                                    </div>
                                    {index < STEPS.length - 1 && (
                                        <span
                                            className={`flex-1 h-0.5 mx-1 -mt-4 ${
                                                done ? "bg-primary" : "bg-ink-200"
                                            }`}
                                        />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
 
                {serverError && (
                    <div className="bg-dangerSoft border border-danger/30 text-danger text-sm rounded-lg px-4 py-3 mb-4">
                        {serverError}
                        {itemErrors.length > 0 && (
                            <ul className="mt-2 list-disc list-inside space-y-1">
                                {itemErrors.map((message, i) => (
                                    <li key={i}>{message}</li>
                                ))}
                            </ul>
                        )}
                    </div>
                )}
 
                {/* Address */}
                <section className="bg-surface border border-line rounded-xl p-4 mb-4">
                    <div className="flex items-center justify-between gap-3 mb-3">
                        <span className="inline-flex items-center gap-2 text-sm font-semibold text-textPrimary">
                            <MapPin size={16} className="text-primary" />
                            Delivery address
                        </span>
                        {addresses.length > 0 && (
                            <button
                                onClick={() => setPickerOpen(true)}
                                className="text-sm font-semibold text-primary hover:underline"
                            >
                                Change
                            </button>
                        )}
                    </div>
 
                    {selectedAddress ? (
                        <div>
                            <p className="text-sm font-semibold text-textPrimary">
                                {selectedAddress.recipient_name}
                                <span className="font-normal text-textSecondary">
                                    {"  "}({selectedAddress.phone})
                                </span>
                                {selectedAddress.is_default && (
                                    <span className="ml-2 text-[10px] uppercase tracking-wide bg-ink-100 text-textSecondary px-2 py-0.5 rounded-full">
                                        Default
                                    </span>
                                )}
                            </p>
                            <p className="text-sm text-textSecondary mt-1 leading-relaxed">
                                {selectedAddress.street}
                                {selectedAddress.district ? `, ${selectedAddress.district}` : ""}
                                <br />
                                {selectedAddress.city}, {selectedAddress.province}{" "}
                                {selectedAddress.postal_code}
                            </p>
                            {selectedAddress.courier_note && (
                                <p className="mt-2 text-xs text-textSecondary bg-ink-100 rounded-lg px-3 py-2">
                                    {selectedAddress.courier_note}
                                </p>
                            )}
 
                            {/* An address saved before the area picker existed
                                can't be quoted. Said here because this is where
                                the buyer can act on it. */}
                            {!selectedAddress.destination_area_id && (
                                <p className="mt-2 text-xs text-warning bg-warningSoft rounded-lg px-3 py-2">
                                    This address has no delivery area set, so shipping
                                    can't be calculated. Edit it from your account and
                                    pick your district.
                                </p>
                            )}
                        </div>
                    ) : (
                        <button
                            onClick={() => setFormOpen(true)}
                            className="w-full flex items-center justify-center gap-2 rounded-lg border-2 border-dashed border-lineStrong py-4 text-sm font-semibold text-primary hover:bg-primarySoft transition"
                        >
                            <Plus size={16} />
                            Add a delivery address
                        </button>
                    )}
                </section>
 
                {/* Order summary */}
                <section className="bg-surface border border-line rounded-xl mb-4 overflow-hidden">
                    <button
                        onClick={() => setSummaryOpen((v) => !v)}
                        className="w-full flex items-center justify-between gap-3 p-4"
                    >
                        <span className="inline-flex items-center gap-2 text-sm font-semibold text-textPrimary">
                            <Package size={16} className="text-primary" />
                            Order summary ({items.length} item{items.length === 1 ? "" : "s"})
                        </span>
                        <span className="inline-flex items-center gap-1 text-sm font-bold text-textPrimary tabular">
                            {rupiah(itemsTotal)}
                            {summaryOpen ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                        </span>
                    </button>
 
                    {summaryOpen && (
                        <div className="border-t border-line">
                            {loading && (
                                <p className="p-4 text-sm text-textSecondary">Loading...</p>
                            )}
                            {!loading && error && (
                                <p className="p-4 text-sm text-danger">Error: {error}</p>
                            )}
 
                            {sellerGroups.map((group) => (
                                <div key={group.id} className="border-b border-line last:border-0">
                                    <p className="px-4 pt-3 text-label uppercase text-textSecondary">
                                        {group.name}
                                    </p>
                                    {group.items.map((item) => (
                                        <div key={item.id} className="flex gap-3 px-4 py-3">
                                            <div className="w-14 h-14 rounded-lg bg-ink-100 overflow-hidden shrink-0">
                                                {item.product.thumbnail ? (
                                                    <img
                                                        src={item.product.thumbnail}
                                                        alt={item.product.title}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-textMuted text-[10px]">
                                                        No img
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm text-textPrimary line-clamp-2">
                                                    {item.product.title}
                                                </p>
                                                <p className="text-xs text-textSecondary mt-0.5">
                                                    {rupiah(item.product.price)} × {item.quantity}
                                                </p>
                                            </div>
                                            <p className="text-sm font-semibold text-primary tabular shrink-0">
                                                {rupiah(item.subtotal)}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            ))}
 
                            {sellerGroups.length > 1 && (
                                <p className="px-4 py-3 text-xs text-textSecondary bg-surfaceAlt">
                                    This splits into {sellerGroups.length} orders, one per shop.
                                    You still pay once, but each ships separately.
                                </p>
                            )}
                        </div>
                    )}
                </section>
 
                {/* Shipping — one courier choice per shop */}
                <section className="bg-surface border border-line rounded-xl p-4 mb-4">
                    <span className="inline-flex items-center gap-2 text-sm font-semibold text-textPrimary mb-3">
                        <Truck size={16} className="text-primary" />
                        Shipping
                    </span>
 
                    {quoting && (
                        <p className="inline-flex items-center gap-2 text-sm text-textSecondary">
                            <Loader2 size={14} className="animate-spin" />
                            Checking rates...
                        </p>
                    )}
 
                    {!quoting && quoteError && (
                        <p className="text-sm text-danger">{quoteError}</p>
                    )}
 
                    {!quoting && !quoteError && sellerGroups.map((group) => {
                        const shipment = shipmentFor(group.id);
                        const rates = shipment?.rates || [];
 
                        return (
                            <div key={group.id} className="mb-4 last:mb-0">
                                {sellerGroups.length > 1 && (
                                    <p className="mb-2 text-label uppercase text-textSecondary">
                                        {group.name}
                                    </p>
                                )}
 
                                {/* A shop that can't be quoted blocks only itself.
                                    The reason comes from the server, because only
                                    it knows whether the shop or the route is at
                                    fault. */}
                                {rates.length === 0 ? (
                                    <p className="rounded-lg bg-warningSoft px-3 py-2.5 text-sm text-warning">
                                        {shipment?.error || "No couriers available for this shop."}
                                    </p>
                                ) : (
                                    <div className="space-y-2">
                                        {rates.map((rate) => {
                                            const active = courierBySeller[group.id] === rate.key;
 
                                            return (
                                                <button
                                                    key={rate.key}
                                                    onClick={() =>
                                                        setCourierBySeller((prev) => ({
                                                            ...prev,
                                                            [group.id]: rate.key,
                                                        }))
                                                    }
                                                    aria-pressed={active}
                                                    className={`flex w-full items-center gap-3 rounded-lg border p-3 text-left transition ${
                                                        active
                                                            ? "border-primary bg-primarySoft"
                                                            : "border-line hover:border-lineStrong"
                                                    }`}
                                                >
                                                    <span className="flex-1 min-w-0">
                                                        <span className="block text-sm font-semibold text-textPrimary">
                                                            {rate.courier_name} {rate.service_name}
                                                        </span>
                                                        {rate.etd && (
                                                            <span className="block text-xs text-textSecondary mt-0.5">
                                                                Estimated {rate.etd}
                                                            </span>
                                                        )}
                                                    </span>
                                                    <span className="text-sm font-semibold text-textPrimary tabular shrink-0">
                                                        {rupiah(rate.cost)}
                                                    </span>
                                                    <span
                                                        className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
                                                            active
                                                                ? "border-primary bg-primary text-white"
                                                                : "border-lineStrong"
                                                        }`}
                                                    >
                                                        {active && <Check size={10} strokeWidth={3} />}
                                                    </span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </section>
 
                {/* Notes */}
                <section className="bg-surface border border-line rounded-xl p-4 mb-4">
                    <label
                        htmlFor="notes"
                        className="block text-sm font-semibold text-textPrimary mb-2"
                    >
                        Note for the seller
                        <span className="font-normal text-textSecondary"> (optional)</span>
                    </label>
                    <textarea
                        id="notes"
                        rows={2}
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        maxLength={500}
                        placeholder="Gift wrapping, colour preference, anything else."
                        className="w-full bg-surface border border-line rounded-lg px-3 py-2 text-base resize-y focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                </section>
 
                {/* Payment method */}
                <section className="bg-surface border border-line rounded-xl p-4 mb-4">
                    <span className="inline-flex items-center gap-2 text-sm font-semibold text-textPrimary mb-3">
                        <CreditCard size={16} className="text-primary" />
                        Payment method
                    </span>
 
                    <div className="space-y-2">
                        {channels.map((option) => (
                            <button
                                key={option.code}
                                onClick={() => setChannel(option.code)}
                                aria-pressed={channel === option.code}
                                className={`flex w-full items-start gap-3 rounded-lg border p-3 text-left transition ${
                                    channel === option.code
                                        ? "border-primary bg-primarySoft"
                                        : "border-line hover:border-lineStrong"
                                }`}
                            >
                                <span
                                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                                        channel === option.code
                                            ? "bg-primary text-white"
                                            : "bg-ink-100 text-textSecondary"
                                    }`}
                                >
                                    <Landmark size={16} />
                                </span>
                                <span className="flex-1 min-w-0">
                                    <span className="block text-sm font-semibold text-textPrimary">
                                        {option.label}
                                    </span>
                                    {option.description && (
                                        <span className="block text-xs text-textSecondary mt-0.5">
                                            {option.description}
                                        </span>
                                    )}
                                </span>
                                <span
                                    className={`mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
                                        channel === option.code
                                            ? "border-primary bg-primary text-white"
                                            : "border-lineStrong"
                                    }`}
                                >
                                    {channel === option.code && <Check size={10} strokeWidth={3} />}
                                </span>
                            </button>
                        ))}
                    </div>
                </section>
 
                {/* Escrow */}
                <div className="flex items-start gap-3 bg-primarySoft rounded-xl p-4">
                    <ShieldCheck size={18} className="text-primary mt-0.5 shrink-0" />
                    <p className="text-xs leading-relaxed text-primaryDark">
                        Your money is held by Rapaku, not sent to the seller. They are
                        paid only after you confirm the order arrived in good condition.
                    </p>
                </div>
            </div>
 
            {/* Sticky total */}
            <div className="fixed bottom-16 md:bottom-0 left-0 right-0 z-40 bg-surface border-t border-line px-4 py-3 pb-[env(safe-area-inset-bottom)]">
                <div className="max-w-2xl mx-auto flex items-center gap-4">
                    <div className="min-w-0 shrink-0">
                        {/* Shipping is shown on its own line rather than folded
                            into one number — a total that jumps when a courier
                            is picked, with no explanation, reads as a mistake. */}
                        <p className="text-label uppercase text-textSecondary">
                            Total
                            {shippingTotal > 0 && (
                                <span className="normal-case"> · incl. {rupiah(shippingTotal)} shipping</span>
                            )}
                        </p>
                        <p className="text-lg font-bold text-primary tabular whitespace-nowrap">
                            {rupiah(grandTotal)}
                        </p>
                    </div>
                    <button
                        onClick={handleSubmit}
                        disabled={
                            submitting ||
                            items.length === 0 ||
                            !addressId ||
                            quoting ||
                            !shippingReady
                        }
                        className="flex-1 rounded-full mb-3 bg-primary py-3 text-sm font-semibold text-white hover:bg-primaryHover transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {submitting
                            ? "Placing order..."
                            : quoting
                                ? "Checking rates..."
                                : "Place order"}
                    </button>
                </div>
            </div>
 
            {/* Address picker */}
            {pickerOpen && (
                <Sheet title="Delivery address" onClose={() => setPickerOpen(false)}>
                    <div className="space-y-2 mb-3">
                        {addresses.map((address) => (
                            <button
                                key={address.id}
                                onClick={() => {
                                    setAddressId(address.id);
                                    setPickerOpen(false);
                                }}
                                className={`w-full text-left rounded-lg border p-3 transition ${
                                    address.id === addressId
                                        ? "border-primary bg-primarySoft"
                                        : "border-line hover:border-lineStrong"
                                }`}
                            >
                                <p className="text-sm font-semibold text-textPrimary">
                                    {address.label || address.recipient_name}
                                </p>
                                <p className="text-xs text-textSecondary mt-0.5 line-clamp-2">
                                    {address.street}, {address.city}
                                </p>
                                {!address.destination_area_id && (
                                    <p className="mt-1 text-xs text-warning">
                                        No delivery area set
                                    </p>
                                )}
                            </button>
                        ))}
                    </div>
 
                    <button
                        onClick={() => {
                            setPickerOpen(false);
                            setFormOpen(true);
                        }}
                        className="w-full flex items-center justify-center gap-2 rounded-lg border-2 border-dashed border-lineStrong py-3 text-sm font-semibold text-primary hover:bg-primarySoft transition"
                    >
                        <Plus size={16} />
                        Add another address
                    </button>
                </Sheet>
            )}
 
            {/* Address form */}
            {formOpen && (
                <Sheet title="New address" onClose={() => setFormOpen(false)}>
                    <AddressForm onSaved={handleAddressSaved} />
                </Sheet>
            )}
        </div>
    );
}

function Sheet({ title, children, onClose }) {
    return (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-textPrimary/40">
            <div className="w-full max-w-md bg-surface rounded-t-2xl md:rounded-2xl p-5 max-h-[85vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base font-bold text-textPrimary">{title}</h3>
                    <button
                        onClick={onClose}
                        aria-label="Close"
                        className="p-1 text-textMuted hover:text-textPrimary transition"
                    >
                        <X size={20} />
                    </button>
                </div>
                {children}
            </div>
        </div>
    );
}

// Replaces the existing AddressForm function at the bottom of
// src/pages/Checkout.jsx. Everything above it stays as it is.
//
// Add to the imports at the top of Checkout.jsx:
//   import AreaPicker from "../components/AreaPicker";

function AddressForm({ onSaved }) {
    const [form, setForm] = useState({
        label: "",
        recipient_name: "",
        phone: "",
        street: "",
        district: "",
        city: "",
        province: "",
        postal_code: "",
        courier_note: "",
        destination_area_id: "",
        destination_area_label: "",
    });
    const [errors, setErrors] = useState({});
    const [saving, setSaving] = useState(false);

    const change = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        setErrors((prev) => ({ ...prev, [e.target.name]: "" }));
    };

    // The courier's label reads "Cibodas, Tangerang, Banten", so the three
    // fields below fill themselves from it. They stay editable: the official
    // courier spelling and the one people actually use don't always match.
    const pickArea = (area) => {
    setForm((prev) => ({
        ...prev,
        destination_area_id: area.id,
        destination_area_label: area.label,
        ...(area.id
            ? {
                  district: area.district || prev.district,
                  city: area.city || prev.city,
                  province: area.province || prev.province,
                  postal_code: area.postal_code || prev.postal_code,
              }
            : {}),
    }));

    setErrors((prev) => ({ ...prev, destination_area_id: "" }));
};

    const save = async (e) => {
        e.preventDefault();

        // Stopping here matters more in checkout than on the account page: an
        // address saved without an area gets picked as the delivery address
        // straight away, and the shipping step then has nothing to quote
        // against.
        if (!form.destination_area_id) {
            setErrors({ destination_area_id: "Pick your delivery area so shipping can be calculated." });
            return;
        }

        setSaving(true);
        setErrors({});

        try {
            const res = await apiRequest("/addresses", { method: "POST", body: form });
            onSaved(res.data);
        } catch (err) {
            if (err.errors) {
                const mapped = {};
                Object.entries(err.errors).forEach(([field, messages]) => {
                    mapped[field] = Array.isArray(messages) ? messages[0] : messages;
                });
                setErrors(mapped);
            } else {
                setErrors({ general: err.message || "Couldn't save the address." });
            }
            setSaving(false);
        }
    };

    return (
        <form onSubmit={save} noValidate>
            {errors.general && (
                <p className="text-sm text-danger mb-3">{errors.general}</p>
            )}

            <Field label="Label" error={errors.label}>
                <input
                    name="label"
                    value={form.label}
                    onChange={change}
                    placeholder="Home, Office"
                    className={input(errors.label)}
                />
            </Field>

            <Field label="Recipient name" error={errors.recipient_name}>
                <input
                    name="recipient_name"
                    value={form.recipient_name}
                    onChange={change}
                    placeholder="Who receives the parcel"
                    className={input(errors.recipient_name)}
                />
            </Field>

            <Field label="Phone" error={errors.phone}>
                <input
                    name="phone"
                    inputMode="tel"
                    value={form.phone}
                    onChange={change}
                    placeholder="08123456789"
                    className={input(errors.phone)}
                />
            </Field>

            {/* Above the street address so the city and province below arrive
                already filled. */}
            <Field label="Delivery area" error={errors.destination_area_id}>
                <AreaPicker
                    value={{ id: form.destination_area_id, label: form.destination_area_label }}
                    onChange={pickArea}
                />
            </Field>

            <Field label="Street address" error={errors.street}>
                <textarea
                    name="street"
                    rows={2}
                    value={form.street}
                    onChange={change}
                    placeholder="Street, number, RT/RW"
                    className={input(errors.street) + " resize-y"}
                />
            </Field>

            <div className="grid grid-cols-2 gap-3">
                <Field label="District" error={errors.district}>
                    <input
                        name="district"
                        value={form.district}
                        onChange={change}
                        placeholder="Kecamatan"
                        className={input(errors.district)}
                    />
                </Field>
                <Field label="City" error={errors.city}>
                    <input
                        name="city"
                        value={form.city}
                        onChange={change}
                        className={input(errors.city)}
                    />
                </Field>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <Field label="Province" error={errors.province}>
                    <input
                        name="province"
                        value={form.province}
                        onChange={change}
                        className={input(errors.province)}
                    />
                </Field>
                <Field label="Postal code" error={errors.postal_code}>
                    <input
                        name="postal_code"
                        inputMode="numeric"
                        value={form.postal_code}
                        onChange={change}
                        className={input(errors.postal_code)}
                    />
                </Field>
            </div>

            <Field label="Note for the courier" error={errors.courier_note}>
                <input
                    name="courier_note"
                    value={form.courier_note}
                    onChange={change}
                    placeholder="Leave with the security post"
                    className={input(errors.courier_note)}
                />
            </Field>

            <button
                type="submit"
                disabled={saving}
                className="w-full mt-2 rounded-full bg-primary py-3 text-sm font-semibold text-white hover:bg-primaryHover transition disabled:opacity-60"
            >
                {saving ? "Saving..." : "Save address"}
            </button>
        </form>
    );
}

function Field({ label, error, children }) {
    return (
        <div className="mb-3">
            <label className="block text-xs font-semibold text-textSecondary mb-1">
                {label}
            </label>
            {children}
            {error && <p className="text-danger text-xs mt-1">{error}</p>}
        </div>
    );
}

function input(hasError) {
    return `w-full bg-surface border rounded-lg px-3 py-2 text-base focus:outline-none focus:ring-2 transition ${
        hasError ? "border-danger focus:ring-danger" : "border-line focus:ring-primary"
    }`;
}