import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { apiRequest } from "../api/Client";
import SellerSidebar from "../components/organisms/SellerSidebar";
import {
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  TriangleAlert,
  Clock,
  CircleCheck,
  CircleX,
  Eye,
} from "lucide-react";

const WITHDRAWAL_STATUS = {
  pending:    { label: "Waiting",    className: "bg-warningSoft text-warning",  icon: Clock },
  processing: { label: "In progress", className: "bg-accentSoft text-accent",   icon: Eye },
  completed:  { label: "Transferred", className: "bg-successSoft text-success", icon: CircleCheck },
  rejected:   { label: "Rejected",   className: "bg-dangerSoft text-danger",    icon: CircleX },
};

const rupiah = (value) =>
  "Rp " + Number(value ?? 0).toLocaleString("id-ID", { maximumFractionDigits: 0 });

const dateTime = (value) =>
  new Date(value).toLocaleString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

export default function SellerBalance() {
  const [balance, setBalance] = useState(null);
  const [ledger, setLedger] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [tab, setTab] = useState("withdrawals");

  const [loading, setLoading] = useState(true);
  const [banner, setBanner] = useState({ type: "", message: "" });

  const [amount, setAmount] = useState("");
  const [amountError, setAmountError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    try {
      const [balanceRes, ledgerRes, withdrawalsRes] = await Promise.all([
        apiRequest("/seller/balance"),
        apiRequest("/seller/balance/history?per_page=20"),
        apiRequest("/seller/withdrawals?per_page=20"),
      ]);

      setBalance(balanceRes.data);
      setLedger(ledgerRes.data || []);
      setWithdrawals(withdrawalsRes.data || []);
    } catch (err) {
      setBanner({ type: "error", message: err.message || "Couldn't load your balance." });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const hasPayoutAccount = Boolean(balance?.payout_account);
  const minimum = balance?.minimum_withdrawal ?? 50000;
  const available = Number(balance?.balance ?? 0);

  const requestWithdrawal = async (e) => {
    e.preventDefault();
    setAmountError("");
    setBanner({ type: "", message: "" });

    const value = Number(amount);

    if (!amount || Number.isNaN(value)) {
      setAmountError("Enter an amount");
      return;
    }
    if (value < minimum) {
      setAmountError(`The minimum withdrawal is ${rupiah(minimum)}`);
      return;
    }
    if (value > available) {
      setAmountError(`You only have ${rupiah(available)} available`);
      return;
    }

    setSubmitting(true);
    try {
      await apiRequest("/seller/withdrawals", {
        method: "POST",
        body: { amount: value },
      });

      setAmount("");
      setBanner({
        type: "success",
        message: "Withdrawal requested. The amount has been held from your balance.",
      });
      setTab("withdrawals");
      load();
    } catch (err) {
      setBanner({ type: "error", message: err.message || "Couldn't request the withdrawal." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <SellerSidebar />
      <div className="min-h-screen bg-background text-textPrimary pt-24 px-5 pb-12 md:pl-70 md:pr-10">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold mb-1">Balance</h1>
          <p className="text-sm text-textSecondary mb-6">
            Money lands here once a buyer confirms their order.
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

          {loading ? (
            <p className="text-sm text-textSecondary">Loading...</p>
          ) : (
            <>
              {/* Balance */}
              <div className="bg-surface border border-line rounded-xl p-5 mb-4">
                <div className="flex items-center gap-2 text-textSecondary mb-1">
                  <Wallet size={16} className="text-primary" />
                  <span className="text-label uppercase">Available</span>
                </div>
                <p className="text-3xl font-bold tabular">{rupiah(available)}</p>

                {Number(balance?.pending_withdrawals) > 0 && (
                  <p className="text-sm text-textSecondary mt-2">
                    {rupiah(balance.pending_withdrawals)} is being transferred and
                    is no longer part of this figure.
                  </p>
                )}

                <div className="mt-4 pt-4 border-t border-line">
                  {hasPayoutAccount ? (
                    <p className="text-sm text-textSecondary">
                      Paying out to{" "}
                      <span className="font-semibold text-textPrimary">
                        {balance.payout_account.bank_name}{" "}
                        {balance.payout_account.masked_account_number}
                      </span>{" "}
                      — {balance.payout_account.account_holder}
                    </p>
                  ) : (
                    <div className="flex items-start gap-2 text-sm text-warning">
                      <TriangleAlert size={16} className="mt-0.5 shrink-0" />
                      <span>
                        Add a payout account before you can withdraw.{" "}
                        <Link
                          to="/seller/store"
                          className="font-semibold text-primary hover:underline"
                        >
                          Shop Settings →
                        </Link>
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Withdraw */}
              {hasPayoutAccount && (
                <form
                  onSubmit={requestWithdrawal}
                  className="bg-surface border border-line rounded-xl p-5 mb-5"
                >
                  <h3 className="text-base font-bold mb-3">Withdraw</h3>

                  <label className="block text-xs font-semibold text-textSecondary mb-1">
                    Amount
                  </label>
                  <input
                    type="number"
                    inputMode="numeric"
                    value={amount}
                    onChange={(e) => {
                      setAmount(e.target.value);
                      setAmountError("");
                    }}
                    placeholder={String(minimum)}
                    min={minimum}
                    disabled={available < minimum}
                    className={`w-full bg-surface border rounded-lg px-3 py-2 text-sm tabular focus:outline-none focus:ring-2 transition disabled:opacity-60 ${
                      amountError
                        ? "border-danger focus:ring-danger"
                        : "border-line focus:ring-primary"
                    }`}
                  />
                  {amountError && (
                    <p className="text-danger text-xs mt-1">{amountError}</p>
                  )}

                  <div className="flex items-center justify-between mt-2 mb-4">
                    <span className="text-xs text-textMuted">
                      Minimum {rupiah(minimum)}
                    </span>
                    {available >= minimum && (
                      <button
                        type="button"
                        onClick={() => setAmount(String(Math.floor(available)))}
                        className="text-xs font-semibold text-primary hover:underline"
                      >
                        Withdraw everything
                      </button>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={submitting || available < minimum}
                    className="w-full px-6 py-2.5 rounded-lg text-sm font-semibold text-white bg-primary hover:bg-primaryHover transition disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {submitting
                      ? "Requesting..."
                      : available < minimum
                        ? `You need at least ${rupiah(minimum)}`
                        : "Request withdrawal"}
                  </button>

                  <p className="text-xs text-textMuted mt-3">
                    The amount leaves your balance straight away and is returned
                    if the request is rejected. Transfers usually clear within
                    one business day.
                  </p>
                </form>
              )}

              {/* History tabs */}
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => setTab("withdrawals")}
                  className={`px-4 py-1.5 rounded-full text-sm transition ${
                    tab === "withdrawals"
                      ? "bg-textPrimary text-white font-semibold"
                      : "bg-ink-100 text-textSecondary hover:bg-ink-200"
                  }`}
                >
                  Withdrawals
                </button>
                <button
                  onClick={() => setTab("ledger")}
                  className={`px-4 py-1.5 rounded-full text-sm transition ${
                    tab === "ledger"
                      ? "bg-textPrimary text-white font-semibold"
                      : "bg-ink-100 text-textSecondary hover:bg-ink-200"
                  }`}
                >
                  All activity
                </button>
              </div>

              {tab === "withdrawals" ? (
                withdrawals.length === 0 ? (
                  <EmptyState text="No withdrawals yet." />
                ) : (
                  <div className="space-y-3">
                    {withdrawals.map((w) => {
                      const status = WITHDRAWAL_STATUS[w.status] || WITHDRAWAL_STATUS.pending;
                      const StatusIcon = status.icon;

                      return (
                        <div
                          key={w.id}
                          className="bg-surface border border-line rounded-xl p-4"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="font-mono text-xs text-textMuted">
                                {w.reference}
                              </p>
                              <p className="text-lg font-bold tabular mt-0.5">
                                {rupiah(w.amount)}
                              </p>
                              <p className="text-xs text-textSecondary mt-1">
                                {dateTime(w.created_at)}
                              </p>
                            </div>
                            <span
                              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold shrink-0 ${status.className}`}
                            >
                              <StatusIcon size={13} />
                              {status.label}
                            </span>
                          </div>

                          {w.note && (
                            <p
                              className={`text-xs mt-3 pt-3 border-t border-line ${
                                w.status === "rejected" ? "text-danger" : "text-textSecondary"
                              }`}
                            >
                              {w.status === "rejected" && "Reason: "}
                              {w.note}
                            </p>
                          )}

                          {w.transfer_reference && (
                            <p className="text-xs text-textSecondary mt-2">
                              Bank reference:{" "}
                              <span className="font-mono">{w.transfer_reference}</span>
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )
              ) : ledger.length === 0 ? (
                <EmptyState text="Nothing here yet. Your first completed order will show up." />
              ) : (
                <div className="bg-surface border border-line rounded-xl divide-y divide-line">
                  {ledger.map((entry) => {
                    const isCredit = entry.type === "credit";

                    return (
                      <div key={entry.id} className="flex items-start gap-3 p-4">
                        <span
                          className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${
                            isCredit
                              ? "bg-successSoft text-success"
                              : "bg-ink-100 text-textSecondary"
                          }`}
                        >
                          {isCredit ? (
                            <ArrowDownLeft size={17} />
                          ) : (
                            <ArrowUpRight size={17} />
                          )}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-textPrimary">{entry.note}</p>
                          <p className="text-xs text-textMuted mt-0.5">
                            {dateTime(entry.created_at)}
                          </p>
                        </div>
                        <p
                          className={`text-sm font-semibold tabular shrink-0 ${
                            isCredit ? "text-success" : "text-textPrimary"
                          }`}
                        >
                          {isCredit ? "+" : "−"}
                          {rupiah(entry.amount)}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}

function EmptyState({ text }) {
  return (
    <div className="bg-surface border border-line rounded-xl p-8 text-center">
      <p className="text-sm text-textSecondary">{text}</p>
    </div>
  );
}