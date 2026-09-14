import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { apiRequest } from "../api/Client";
import {
  ArrowLeft, Copy, Check, Clock, CircleCheck, TriangleAlert,
  ShieldCheck, RefreshCw, Landmark, QrCode, Smartphone, ExternalLink,
} from "lucide-react";

const POLL_INTERVAL_MS = 15000;

// Which icon sits next to each method in the picker. Falls back to Landmark,
// which is right for every virtual account and for manual transfer.
const CHANNEL_ICON = {
  qris: QrCode,
  gopay: Smartphone,
};

const rupiah = (value) =>
  "Rp " + Number(value ?? 0).toLocaleString("id-ID", { maximumFractionDigits: 0 });

export default function Payment() {
  const { groupId } = useParams();
  const navigate = useNavigate();

  const [channels, setChannels] = useState([]);
  const [payment, setPayment] = useState(null);
  const [selected, setSelected] = useState("");
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState("");
  const [remaining, setRemaining] = useState("");

  const pollRef = useRef(null);

  const load = useCallback(async () => {
    try {
      const [channelsRes, paymentRes] = await Promise.all([
        apiRequest("/payments/channels"),
        apiRequest(`/payments/${groupId}`).catch(() => null),
      ]);

      setChannels(channelsRes.data || []);
      setPayment(paymentRes?.data || null);

      if (!paymentRes?.data && channelsRes.data?.length) {
        setSelected(channelsRes.data[0].code);
      }
    } catch (err) {
      setError(err.message || "Couldn't load payment options.");
    } finally {
      setLoading(false);
    }
  }, [groupId]);

  useEffect(() => {
    load();
  }, [load]);

  // While a charge is open, the provider may confirm at any moment. Polling
  // covers the case where a webhook is delayed or never arrives.
  useEffect(() => {
    if (!payment || payment.status !== "awaiting_payment") {
      clearInterval(pollRef.current);
      return;
    }

    pollRef.current = setInterval(async () => {
      try {
        const res = await apiRequest(`/payments/${groupId}`);
        setPayment(res.data);
      } catch {
        // A failed poll isn't worth interrupting the buyer over
      }
    }, POLL_INTERVAL_MS);

    return () => clearInterval(pollRef.current);
  }, [payment, groupId]);

  // Countdown to expiry
  useEffect(() => {
    if (!payment?.expires_at || payment.status !== "awaiting_payment") {
      setRemaining("");
      return;
    }

    const tick = () => {
      const diff = new Date(payment.expires_at) - new Date();
      if (diff <= 0) {
        setRemaining("expired");
        return;
      }
      const hours = Math.floor(diff / 3600000);
      const minutes = Math.floor((diff % 3600000) / 60000);
      setRemaining(hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`);
    };

    tick();
    const timer = setInterval(tick, 60000);
    return () => clearInterval(timer);
  }, [payment]);

  const createCharge = async () => {
    if (!selected) return;

    setWorking(true);
    setError("");

    try {
      const res = await apiRequest(`/payments/${groupId}/charge`, {
        method: "POST",
        body: { channel: selected },
      });
      setPayment(res.data);
    } catch (err) {
      setError(err.message || "Couldn't start the payment.");
    } finally {
      setWorking(false);
    }
  };

  // Going back to the picker is a local state reset, not an API call. The old
  // charge stays open at the provider until it lapses — harmless, and picking
  // a method creates a fresh reference anyway.
  const changeMethod = () => {
    setSelected(payment?.channel || channels[0]?.code || "");
    setPayment(null);
    setError("");
  };

  const refresh = async () => {
    setWorking(true);
    setError("");

    try {
      const res = await apiRequest(`/payments/${groupId}/refresh`, {
        method: "POST",
      });
      setPayment(res.data);
    } catch (err) {
      setError(err.message || "Couldn't check the status.");
    } finally {
      setWorking(false);
    }
  };

  const copy = async (value, key) => {
    await navigator.clipboard.writeText(String(value));
    setCopied(key);
    setTimeout(() => setCopied(""), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background pt-20 px-4">
        <p className="text-sm text-textSecondary max-w-md mx-auto">Loading...</p>
      </div>
    );
  }

  const isPaid = payment?.status === "paid";
  const isDead = ["expired", "failed"].includes(payment?.status);
  const instructions = payment?.instructions;

  return (
    <div className="min-h-screen bg-background pt-20 pb-12 px-4">
      <div className="max-w-md mx-auto">

        <button
          type="button"
          onClick={() => navigate("/orders")}
          className="inline-flex items-center gap-1.5 text-sm text-textSecondary hover:text-textPrimary transition mb-4"
        >
          <ArrowLeft size={16} />
          My orders
        </button>

        {error && (
          <div className="bg-dangerSoft border border-danger/30 text-danger text-sm rounded-lg px-4 py-3 mb-4">
            {error}
          </div>
        )}

        {/* Paid */}
        {isPaid && (
          <div className="bg-surface border border-line rounded-xl p-6 text-center">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-successSoft text-success mb-4">
              <CircleCheck size={26} />
            </span>
            <h1 className="text-heading text-textPrimary">Payment received.</h1>
            <p className="mt-2 text-sm text-textSecondary">
              Your sellers have been notified and will start preparing your
              order.
            </p>
            <Link
              to="/orders"
              className="mt-5 inline-flex rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white hover:bg-primaryHover transition"
            >
              Track your order
            </Link>
          </div>
        )}

        {/* Expired or failed */}
        {isDead && (
          <div className="bg-surface border border-line rounded-xl p-6 text-center">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-dangerSoft text-danger mb-4">
              <TriangleAlert size={26} />
            </span>
            <h1 className="text-heading text-textPrimary">
              {payment.status === "expired"
                ? "This payment expired."
                : "This payment didn't go through."}
            </h1>
            <p className="mt-2 text-sm text-textSecondary">
              {payment.status === "expired"
                ? "The order was cancelled and the items went back into stock. Add them to your cart again to reorder."
                : "No money was taken. You can start a new order whenever you're ready."}
            </p>
            <Link
              to="/explore"
              className="mt-5 inline-flex rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white hover:bg-primaryHover transition"
            >
              Browse products
            </Link>
          </div>
        )}

        {/* Choose a method */}
        {!payment && !isPaid && (
          <>
            <h1 className="text-heading text-textPrimary mb-1">How would you like to pay?</h1>
            <p className="text-sm text-textSecondary mb-5">
              Your money is held until you confirm the order arrived.
            </p>

            <div className="space-y-3 mb-5">
              {channels.map((channel) => {
                const Icon = CHANNEL_ICON[channel.code] || Landmark;
                const active = selected === channel.code;

                return (
                  <button
                    key={channel.code}
                    onClick={() => setSelected(channel.code)}
                    aria-pressed={active}
                    className={`flex w-full items-start gap-3 rounded-xl border p-4 text-left transition ${
                      active
                        ? "border-primary bg-primarySoft"
                        : "border-line bg-surface hover:border-lineStrong"
                    }`}
                  >
                    <span
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                        active
                          ? "bg-primary text-white"
                          : "bg-ink-100 text-textSecondary"
                      }`}
                    >
                      <Icon size={18} />
                    </span>
                    <span className="flex-1 min-w-0">
                      <span className="block font-semibold text-textPrimary">
                        {channel.label}
                      </span>
                      {channel.description && (
                        <span className="mt-0.5 block text-sm text-textSecondary">
                          {channel.description}
                        </span>
                      )}
                    </span>
                    <span
                      className={`mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                        active
                          ? "border-primary bg-primary text-white"
                          : "border-lineStrong"
                      }`}
                    >
                      {active && <Check size={12} strokeWidth={3} />}
                    </span>
                  </button>
                );
              })}
            </div>

            <button
              onClick={createCharge}
              disabled={working || !selected}
              className="w-full rounded-full bg-primary py-3.5 text-sm font-semibold text-white hover:bg-primaryHover transition disabled:opacity-60"
            >
              {working ? "Starting..." : "Continue to payment"}
            </button>
          </>
        )}

        {/* Awaiting payment */}
        {payment && !isPaid && !isDead && (
          <>
            <div className="bg-surface border border-line rounded-xl p-5 mb-4">
              <div className="flex items-center justify-between gap-3 mb-4">
                <div>
                  <p className="text-label uppercase text-textSecondary">Total due</p>
                  <p className="text-2xl font-bold tabular text-textPrimary">
                    {rupiah(payment.amount)}
                  </p>
                </div>
                {remaining && remaining !== "expired" && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-warningSoft text-warning text-xs font-semibold shrink-0">
                    <Clock size={13} />
                    {remaining} left
                  </span>
                )}
              </div>

              {/* Manual bank transfer — no provider connected */}
              {instructions?.type === "bank_transfer" && (
                <div className="space-y-3">
                  <Detail label="Bank" value={instructions.bank_name} />
                  <Detail
                    label="Account number"
                    value={instructions.account_number}
                    onCopy={() => copy(instructions.account_number, "acc")}
                    copied={copied === "acc"}
                    mono
                  />
                  <Detail label="Account holder" value={instructions.account_holder} />
                  <Detail
                    label="Amount"
                    value={rupiah(instructions.amount)}
                    onCopy={() => copy(instructions.amount, "amt")}
                    copied={copied === "amt"}
                    mono
                  />

                  <div className="bg-warningSoft text-warning text-sm rounded-lg px-3 py-2.5">
                    {instructions.note}
                  </div>
                </div>
              )}

              {/* QRIS — one code, any Indonesian payment app */}
              {instructions?.type === "qris" && (
                <div>
                  <QrImage src={instructions.qr_url} alt="QRIS code for this payment" />

                  <p className="mt-4 text-sm text-textSecondary text-center leading-relaxed">
                    Open GoPay, OVO, DANA, ShopeePay, or your banking app, choose{" "}
                    <span className="font-semibold text-textPrimary">Scan QR</span>,
                    and point it at this code.
                  </p>

                  {/* Scanning fails on the same phone that's showing the code,
                      so the raw string is offered as a way out. */}
                  {instructions.qr_string && (
                    <button
                      onClick={() => copy(instructions.qr_string, "qr")}
                      className="mt-3 w-full inline-flex items-center justify-center gap-2 rounded-lg border border-line py-2.5 text-sm font-semibold text-textSecondary hover:bg-ink-100 transition"
                    >
                      {copied === "qr" ? <Check size={15} /> : <Copy size={15} />}
                      {copied === "qr" ? "QR code copied" : "Copy QR code instead"}
                    </button>
                  )}
                </div>
              )}

              {/* GoPay — deeplink on mobile, QR on desktop */}
              {instructions?.type === "gopay" && (
                <div>
                  {instructions.deeplink_url && (
                    <a
                      href={instructions.deeplink_url}
                      className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-primary py-3.5 text-sm font-semibold text-white hover:bg-primaryHover transition"
                    >
                      <ExternalLink size={16} />
                      Pay in the Gojek app
                    </a>
                  )}

                  {instructions.qr_url && (
                    <>
                      <div className="my-4 flex items-center gap-3">
                        <span className="h-px flex-1 bg-line" />
                        <span className="text-xs uppercase tracking-wide text-textMuted">
                          or scan
                        </span>
                        <span className="h-px flex-1 bg-line" />
                      </div>

                      <QrImage src={instructions.qr_url} alt="GoPay QR code" />
                    </>
                  )}

                  <p className="mt-4 text-sm text-textSecondary text-center">
                    Confirm the payment in Gojek. This page updates on its own.
                  </p>
                </div>
              )}

              {/* Virtual account */}
              {instructions?.type === "virtual_account" && (
                <div className="space-y-3">
                  <Detail label="Bank" value={instructions.bank} />
                  <Detail
                    label="Virtual account"
                    value={instructions.va_number}
                    onCopy={() => copy(instructions.va_number, "va")}
                    copied={copied === "va"}
                    mono
                  />
                  <Detail
                    label="Amount"
                    value={rupiah(payment.amount)}
                    onCopy={() => copy(Math.round(Number(payment.amount)), "amt")}
                    copied={copied === "amt"}
                    mono
                  />

                  <div className="bg-warningSoft text-warning text-sm rounded-lg px-3 py-2.5 leading-relaxed">
                    Transfer the exact amount to this number. It belongs to this
                    order only, so there's nothing to write in the description.
                  </div>
                </div>
              )}

              {/* A channel the backend offers but this page doesn't draw yet.
                  Better a readable fallback than a blank card. */}
              {instructions &&
                !["bank_transfer", "qris", "gopay", "virtual_account"].includes(
                  instructions.type
                ) && (
                  <pre className="text-xs text-textSecondary overflow-x-auto">
                    {JSON.stringify(instructions, null, 2)}
                  </pre>
                )}
            </div>

            <button
              onClick={refresh}
              disabled={working}
              className="w-full inline-flex items-center justify-center gap-2 rounded-full border border-lineStrong bg-surface py-3 text-sm font-semibold text-textPrimary hover:bg-ink-100 transition disabled:opacity-60"
            >
              <RefreshCw size={15} className={working ? "animate-spin" : ""} />
              {working ? "Checking..." : "I've paid, check now"}
            </button>

            <button
              onClick={changeMethod}
              className="mt-2 w-full py-2 text-sm font-semibold text-textSecondary hover:text-textPrimary transition"
            >
              Use a different method
            </button>

            <p className="mt-3 text-xs text-textMuted text-center">
              This page checks by itself every 15 seconds.
            </p>
          </>
        )}

        <p className="mt-6 text-xs text-textSecondary inline-flex items-start gap-1.5">
          <ShieldCheck size={14} className="text-primary mt-0.5 shrink-0" />
          Sellers are paid only after you confirm the order arrived.
        </p>
      </div>
    </div>
  );
}

/**
 * The provider serves the QR as a plain image URL, so there's no QR library
 * here. The white plate is deliberate and not themed — scanners struggle with
 * a code drawn on cream and fail outright on a dark one.
 */
function QrImage({ src, alt }) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div className="rounded-xl border border-line bg-ink-100 p-6 text-center text-sm text-textSecondary">
        The QR code didn't load. Tap "I've paid, check now" if you already paid,
        or pick another method.
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-white p-4 mx-auto w-fit">
      <img
        src={src}
        alt={alt}
        onError={() => setFailed(true)}
        className="h-56 w-56 object-contain"
      />
    </div>
  );
}

function Detail({ label, value, onCopy, copied, mono }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-sm text-textSecondary shrink-0">{label}</span>
      <span className="flex items-center gap-2 min-w-0">
        <span
          className={`text-sm font-semibold text-textPrimary truncate ${
            mono ? "font-mono tabular" : ""
          }`}
        >
          {value}
        </span>
        {onCopy && (
          <button
            onClick={onCopy}
            aria-label={`Copy ${label}`}
            className="text-primary hover:text-primaryHover transition shrink-0"
          >
            {copied ? <Check size={15} /> : <Copy size={15} />}
          </button>
        )}
      </span>
    </div>
  );
}