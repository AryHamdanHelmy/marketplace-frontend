import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Mail,
  MailCheck,
  ShieldCheck,
  BadgeCheck,
} from "lucide-react";
import { apiRequest } from "../api/Client";
import Alert from "../components/molecules/Alert";
import logoFull from "../assets/rapaku.png";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const RESEND_SECONDS = 60;

export default function ForgotPassword() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [fieldError, setFieldError] = useState("");
  const [serverError, setServerError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  // Pre-fill from the "remember me" address so the person doesn't retype it
  useEffect(() => {
    const saved = localStorage.getItem("rapaku:remembered-email");
    if (saved) setEmail(saved);
  }, []);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const submit = async () => {
    setServerError("");

    if (!email.trim()) {
      setFieldError("Enter your email first");
      return;
    }
    if (!emailRegex.test(email)) {
      setFieldError("That doesn't look like a valid email");
      return;
    }

    setSubmitting(true);
    try {
      await apiRequest("/auth/forgot-password", {
        method: "POST",
        body: { email },
      });
      setSent(true);
      setCooldown(RESEND_SECONDS);
    } catch (err) {
      setServerError(err.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    submit();
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto w-full max-w-md px-4 pb-10">

        {/* Top bar */}
        <header className="flex items-center justify-between py-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            aria-label="Go back"
            className="p-2 -ml-2 rounded-lg text-textPrimary hover:bg-ink-100 transition"
          >
            <ArrowLeft size={20} />
          </button>
          <img src={logoFull} alt="Rapaku" className="h-6 w-auto" />
          <span className="w-9" aria-hidden="true" />
        </header>

        {/* Eyebrow badge */}
        <div className="flex justify-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-ink-100 px-4 py-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            <span className="text-label text-textSecondary uppercase">
              Account recovery
            </span>
            <span className="text-textMuted">·</span>
            <span className="text-xs text-textSecondary">ラパク</span>
          </span>
        </div>

        {sent ? (
          <>
            {/* Confirmation */}
            <div className="mt-8 text-center">
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primarySoft text-primary">
                <MailCheck size={26} />
              </span>
              <h1 className="mt-6 text-display text-textPrimary">Check your inbox.</h1>
              <p className="mt-3 text-sm leading-relaxed text-textSecondary">
                If <span className="font-semibold text-textPrimary">{email}</span> is
                registered with Rapaku, a reset link is on its way. It expires in
                60 minutes.
              </p>
            </div>

            <div className="mt-8 rounded-2xl border border-line bg-surface p-5">
              <Alert
                type="error"
                message={serverError}
                onClose={() => setServerError("")}
              />

              <p className="text-sm text-textSecondary">
                Nothing arrived? Check the spam folder first, then request
                another link.
              </p>

              <button
                type="button"
                onClick={submit}
                disabled={cooldown > 0 || submitting}
                className="mt-4 w-full rounded-full border border-lineStrong bg-surface px-4 py-3 font-semibold text-textPrimary transition hover:bg-ink-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting
                  ? "Sending..."
                  : cooldown > 0
                    ? `Resend in ${cooldown}s`
                    : "Resend link"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setSent(false);
                  setServerError("");
                }}
                className="mt-3 w-full text-sm font-semibold text-primary hover:text-primaryHover transition"
              >
                Use a different email
              </button>
            </div>
          </>
        ) : (
          <>
            {/* Form */}
            <div className="mt-8 text-center">
              <h1 className="mt-6 text-display text-textPrimary">
                Forgot your password?
              </h1>
              <p className="mt-3 text-sm leading-relaxed text-textSecondary">
                Enter the email you signed up with and we'll send you a link to
                set a new one.
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              noValidate
              className="mt-8 rounded-2xl border border-line bg-surface p-5"
            >
              <Alert
                type="error"
                message={serverError}
                onClose={() => setServerError("")}
              />

              <label htmlFor="email" className="block text-sm text-textPrimary mb-2">
                Email address
              </label>
              <div className="relative">
                <Mail
                  size={18}
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-textMuted"
                />
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  autoFocus
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setFieldError("");
                  }}
                  disabled={submitting}
                  placeholder="you@example.com"
                  aria-invalid={Boolean(fieldError)}
                  className={`w-full rounded-xl bg-ink-100 text-textPrimary text-base pl-11 pr-4 py-3 border transition placeholder:text-textMuted focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-60 ${
                    fieldError ? "border-danger" : "border-transparent"
                  }`}
                />
              </div>
              {fieldError && (
                <p className="mt-1.5 text-sm text-danger">{fieldError}</p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-primary px-4 py-3.5 font-semibold text-white transition hover:bg-primaryHover disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting ? "Sending..." : "Send reset link"}
                {!submitting && <ArrowRight size={18} />}
              </button>
            </form>
          </>
        )}

        {/* Back to sign in */}
        <div className="mt-4 rounded-2xl bg-ink-100 px-5 py-6 text-center">
          <p className="text-sm text-textSecondary">Remembered it after all?</p>
          <Link
            to="/"
            className="mt-1 inline-flex items-center gap-1 font-semibold text-primary hover:text-primaryHover transition"
          >
            Back to sign in
          </Link>
        </div>

        {/* Footer */}
        <footer className="mt-8 text-center">
          <div className="flex items-center justify-center gap-3 text-textMuted">
            <span className="inline-flex items-center gap-1.5 text-xs">
              <ShieldCheck size={13} />
              SSL encrypted
            </span>
            <span>·</span>
            <span className="inline-flex items-center gap-1.5 text-xs">
              <BadgeCheck size={13} />
              Verified artisan partners
            </span>
          </div>
          <p className="mt-3 text-xs text-textSecondary">
            Rapaku · Open your shop © {new Date().getFullYear()}
          </p>
        </footer>
      </div>
    </div>
  );
}