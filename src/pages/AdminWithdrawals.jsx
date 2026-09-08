import { useState, useEffect, useCallback } from "react";
import { apiRequest } from "../api/Client";
import {
  Wallet,
  Copy,
  Check,
  Eye,
  TriangleAlert,
  Clock,
  CircleCheck,
  CircleX,
} from "lucide-react";

const FILTERS = [
  { label: "Pending", value: "pending" },
  { label: "Processing", value: "processing" },
  { label: "Completed", value: "completed" },
  { label: "Rejected", value: "rejected" },
  { label: "All", value: "" },
];

const STATUS_STYLES = {
  pending: { className: "bg-warningSoft text-warning", icon: Clock },
  processing: { className: "bg-accentSoft text-accent", icon: Eye },
  completed: { className: "bg-successSoft text-success", icon: CircleCheck },
  rejected: { className: "bg-dangerSoft text-danger", icon: CircleX },
};

const rupiah = (value) =>
  "Rp " + Number(value).toLocaleString("id-ID", { maximumFractionDigits: 0 });

const dateTime = (value) =>
  new Date(value).toLocaleString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

export default function AdminWithdrawals() {
  const [filter, setFilter] = useState("pending");
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [banner, setBanner] = useState({ type: "", message: "" });

  // The withdrawal whose full account number has been revealed
  const [revealed, setRevealed] = useState(null);
  const [copied, setCopied] = useState(false);

  // { id, mode: "complete" | "reject" }
  const [dialog, setDialog] = useState(null);
  const [dialogInput, setDialogInput] = useState("");
  const [dialogError, setDialogError] = useState("");
  const [working, setWorking] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const query = filter ? `?status=${filter}` : "";
      const res = await apiRequest(`/admin/withdrawals${query}`);
      setItems(res.data || []);
      setMeta(res.meta || null);
    } catch (err) {
      setBanner({ type: "error", message: err.message || "Couldn't load withdrawals." });
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    load();
  }, [load]);

  const revealAccount = async (id) => {
    setCopied(false);
    try {
      const res = await apiRequest(`/admin/withdrawals/${id}`);
      setRevealed(res.data);
    } catch (err) {
      setBanner({ type: "error", message: err.message || "Couldn't load details." });
    }
  };

  const copyAccount = async () => {
    await navigator.clipboard.writeText(revealed.bank_account_number);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const claim = async (id) => {
    setWorking(true);
    try {
      await apiRequest(`/admin/withdrawals/${id}/processing`, { method: "PATCH" });
      setBanner({ type: "success", message: "Claimed. Make the transfer, then mark it complete." });
      load();
    } catch (err) {
      setBanner({ type: "error", message: err.message || "Couldn't claim." });
    } finally {
      setWorking(false);
    }
  };

  const submitDialog = async () => {
    setDialogError("");

    if (!dialogInput.trim()) {
      setDialogError(
        dialog.mode === "complete"
          ? "Enter the bank transfer reference"
          : "Give a reason — the seller sees this"
      );
      return;
    }

    setWorking(true);
    try {
      const body =
        dialog.mode === "complete"
          ? { transfer_reference: dialogInput }
          : { note: dialogInput };

      await apiRequest(`/admin/withdrawals/${dialog.id}/${dialog.mode}`, {
        method: "PATCH",
        body,
      });

      setBanner({
        type: "success",
        message:
          dialog.mode === "complete"
            ? "Marked as completed."
            : "Rejected. The balance has been refunded to the seller.",
      });

      setDialog(null);
      setDialogInput("");
      setRevealed(null);
      load();
    } catch (err) {
      setDialogError(err.message || "Something went wrong.");
    } finally {
      setWorking(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-textPrimary pt-24 px-5 pb-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-1">Withdrawals</h1>
        <p className="text-sm text-textSecondary mb-6">
          Sellers have already had these amounts deducted from their balance.
          Rejecting one refunds it.
        </p>

        {banner.message && (
          <div
            className={`text-sm rounded-lg px-4 py-3 mb-4 border ${
              banner.type === "success"
                ? "bg-successSoft border-success/30 text-success"
                : "bg-dangerSoft border-danger/30 text-danger"
            }`}
          >
            {banner.message}
          </div>
        )}

        {meta?.pending_count > 0 && (
          <div className="bg-surface border border-line rounded-xl p-4 mb-5 flex items-center gap-3">
            <span className="h-10 w-10 rounded-lg bg-primarySoft text-primary flex items-center justify-center shrink-0">
              <Wallet size={19} />
            </span>
            <div>
              <p className="font-bold tabular">{rupiah(meta.pending_amount)}</p>
              <p className="text-sm text-textSecondary">
                across {meta.pending_count} request
                {meta.pending_count === 1 ? "" : "s"} waiting to be transferred
              </p>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide mb-5">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`px-4 py-1.5 rounded-full text-sm whitespace-nowrap transition ${
                filter === f.value
                  ? "bg-textPrimary text-white font-semibold"
                  : "bg-ink-100 text-textSecondary hover:bg-ink-200"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="text-sm text-textSecondary">Loading...</p>
        ) : items.length === 0 ? (
          <div className="bg-surface border border-line rounded-xl p-8 text-center">
            <p className="text-sm text-textSecondary">Nothing here.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((w) => {
              const status = STATUS_STYLES[w.status] || STATUS_STYLES.pending;
              const StatusIcon = status.icon;
              const isOpen = w.status === "pending" || w.status === "processing";

              return (
                <div
                  key={w.id}
                  className="bg-surface border border-line rounded-xl p-5"
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <p className="font-mono text-xs text-textMuted">
                        {w.reference}
                      </p>
                      <p className="text-xl font-bold tabular mt-0.5">
                        {rupiah(w.amount)}
                      </p>
                    </div>
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold shrink-0 ${status.className}`}
                    >
                      <StatusIcon size={13} />
                      {w.status}
                    </span>
                  </div>

                  <div className="text-sm space-y-1 mb-4">
                    <p className="text-textSecondary">
                      {w.seller?.name} · {w.seller?.email}
                    </p>
                    <p className="text-textPrimary">
                      {w.bank_name} {w.masked_account_number} —{" "}
                      {w.bank_account_holder}
                    </p>
                    <p className="text-textMuted text-xs">
                      Requested {dateTime(w.created_at)}
                    </p>
                  </div>

                  {/* Revealed account number */}
                  {revealed?.id === w.id && (
                    <div className="bg-ink-100 rounded-lg p-3 mb-4">
                      <p className="text-xs text-textSecondary mb-1">
                        Full account number
                      </p>
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-base tabular">
                          {revealed.bank_account_number}
                        </span>
                        <button
                          type="button"
                          onClick={copyAccount}
                          className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline shrink-0"
                        >
                          {copied ? <Check size={15} /> : <Copy size={15} />}
                          {copied ? "Copied" : "Copy"}
                        </button>
                      </div>
                    </div>
                  )}

                  {w.transfer_reference && (
                    <p className="text-xs text-textSecondary mb-3">
                      Transfer reference:{" "}
                      <span className="font-mono">{w.transfer_reference}</span>
                    </p>
                  )}

                  {w.note && (
                    <p className="text-xs text-textSecondary mb-3">
                      Note: {w.note}
                    </p>
                  )}

                  {isOpen && (
                    <div className="flex flex-wrap gap-2 pt-3 border-t border-line">
                      {revealed?.id !== w.id && (
                        <button
                          type="button"
                          onClick={() => revealAccount(w.id)}
                          className="px-4 py-2 rounded-lg text-sm font-medium text-textSecondary hover:bg-ink-100 transition"
                        >
                          Show account
                        </button>
                      )}

                      {w.status === "pending" && (
                        <button
                          type="button"
                          onClick={() => claim(w.id)}
                          disabled={working}
                          className="px-4 py-2 rounded-lg text-sm font-medium text-accent hover:bg-accentSoft transition disabled:opacity-60"
                        >
                          Claim
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          setDialog({ id: w.id, mode: "reject" });
                          setDialogInput("");
                          setDialogError("");
                        }}
                        className="px-4 py-2 rounded-lg text-sm font-medium text-danger hover:bg-dangerSoft transition"
                      >
                        Reject
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setDialog({ id: w.id, mode: "complete" });
                          setDialogInput("");
                          setDialogError("");
                        }}
                        className="ml-auto px-5 py-2 rounded-lg text-sm font-semibold text-white bg-primary hover:bg-primaryHover transition"
                      >
                        Mark transferred
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Confirm dialog */}
      {dialog && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-primary/40 p-4">
          <div className="w-full max-w-md bg-surface rounded-2xl p-5">
            <h3 className="text-base font-bold mb-1">
              {dialog.mode === "complete"
                ? "Confirm the transfer"
                : "Reject this withdrawal"}
            </h3>
            <p className="text-sm text-textSecondary mb-4">
              {dialog.mode === "complete"
                ? "Only do this once the money has actually left the bank."
                : "The full amount goes straight back to the seller's balance."}
            </p>

            {dialog.mode === "reject" && (
              <div className="flex items-start gap-2 bg-warningSoft text-warning text-sm rounded-lg px-3 py-2 mb-4">
                <TriangleAlert size={15} className="mt-0.5 shrink-0" />
                <span>The seller will read this reason.</span>
              </div>
            )}

            <label className="block text-xs font-semibold text-textSecondary mb-1">
              {dialog.mode === "complete" ? "Bank transfer reference" : "Reason"}
            </label>
            {dialog.mode === "complete" ? (
              <input
                type="text"
                value={dialogInput}
                onChange={(e) => setDialogInput(e.target.value)}
                placeholder="e.g. TRF/20260908/00412"
                autoFocus
                className={`w-full bg-surface border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 ${
                  dialogError
                    ? "border-danger focus:ring-danger"
                    : "border-line focus:ring-primary"
                }`}
              />
            ) : (
              <textarea
                rows={3}
                value={dialogInput}
                onChange={(e) => setDialogInput(e.target.value)}
                placeholder="e.g. Account holder name doesn't match the bank records"
                autoFocus
                className={`w-full bg-surface border rounded-lg px-3 py-2 text-sm resize-y focus:outline-none focus:ring-2 ${
                  dialogError
                    ? "border-danger focus:ring-danger"
                    : "border-line focus:ring-primary"
                }`}
              />
            )}
            {dialogError && (
              <p className="text-danger text-xs mt-1">{dialogError}</p>
            )}

            <div className="flex gap-2 mt-5">
              <button
                type="button"
                onClick={() => setDialog(null)}
                className="flex-1 px-4 py-2.5 rounded-lg text-sm font-medium text-textSecondary hover:bg-ink-100 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={submitDialog}
                disabled={working}
                className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold text-white transition disabled:opacity-60 ${
                  dialog.mode === "complete"
                    ? "bg-primary hover:bg-primaryHover"
                    : "bg-danger hover:opacity-90"
                }`}
              >
                {working
                  ? "Working..."
                  : dialog.mode === "complete"
                    ? "Confirm"
                    : "Reject and refund"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}