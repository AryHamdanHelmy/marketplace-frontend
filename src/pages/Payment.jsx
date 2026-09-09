import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { apiRequest } from "../api/Client";
import {
  ArrowLeft, Copy, Check, Clock, CircleCheck, TriangleAlert,
  ShieldCheck, RefreshCw, Landmark,
} from "lucide-react";

const POLL_INTERVAL_MS = 15000;

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
              {channels.map((channel) => (
                <button
                  key={channel.code}
                  onClick={() => setSelected(channel.code)}
                  aria-pressed={selected === channel.code}
                  className={`flex w-full items-start gap-3 rounded-xl border p-4 text-left transition ${
                    selected === channel.code
                      ? "border-primary bg-primarySoft"
                      : "border-line bg-surface hover:border-lineStrong"
                  }`}
                >
                  <span
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                      selected === channel.code
                        ? "bg-primary text-white"
                        : "bg-ink-100 text-textSecondary"
                    }`}
                  >
                    <Landmark size={18} />
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
                      selected === channel.code
                        ? "border-primary bg-primary text-white"
                        : "border-lineStrong"
                    }`}
                  >
                    {selected === channel.code && <Check size={12} strokeWidth={3} />}
                  </span>
                </button>
              ))}
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

              {instructions?.type === "bank_transfer" && (
                <div className="space-y-3">
                  <Detail
                    label="Bank"
                    value={instructions.bank_name}
                  />
                  <Detail
                    label="Account number"
                    value={instructions.account_number}
                    onCopy={() => copy(instructions.account_number, "acc")}
                    copied={copied === "acc"}
                    mono
                  />
                  <Detail
                    label="Account holder"
                    value={instructions.account_holder}
                  />
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

              {/* Other channels — QR, virtual account, redirect — render here
                  once a real gateway driver is connected. */}
              {instructions && instructions.type !== "bank_transfer" && (
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