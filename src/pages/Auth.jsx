import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Check,
  BadgeCheck,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { apiRequest } from "../api/Client";
import Alert from "../components/molecules/Alert";
import logoFull from "../assets/rapaku.png";

const REMEMBER_KEY = "rapaku:remembered-email";
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const API_BASE = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";
const OAUTH_ENABLED = import.meta.env.VITE_OAUTH_ENABLED === "true";

export default function Auth() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [fieldErrors, setFieldErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Restore the email from a previous "remember me" session
  useEffect(() => {
    const saved = localStorage.getItem(REMEMBER_KEY);
    if (saved) {
      setEmail(saved);
      setRemember(true);
    }
  }, []);

  const validate = () => {
    const errors = {};
    if (!email.trim()) errors.email = "Enter your email first";
    else if (!emailRegex.test(email)) errors.email = "That doesn't look like a valid email";
    if (!password) errors.password = "Enter your password";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");
    if (!validate()) return;

    setSubmitting(true);
    try {
      // Unregistered emails get sent to Register with the address pre-filled
      const check = await apiRequest("/auth/check-email", {
        method: "POST",
        body: { email },
      });

      if (!check.exists) {
        navigate(`/register?email=${encodeURIComponent(email)}`);
        return;
      }

      const data = await apiRequest("/auth/login", {
        method: "POST",
        body: { email, password },
      });

      if (remember) localStorage.setItem(REMEMBER_KEY, email);
      else localStorage.removeItem(REMEMBER_KEY);

      login(data.token, data.user);
      setSuccess(true);

      const role = data.user?.role;
      const destination =
        role === "seller" ? "/seller/dashboard" :
        role === "admin"  ? "/users" :
        "/explore";

      setTimeout(() => navigate(destination), 900);
    } catch (err) {
      setServerError(err.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Full-page redirect — the backend owns the provider handshake and sends
  // the browser back to /auth/callback with a token.
  const handleSocial = (provider) => {
    if (!OAUTH_ENABLED) {
      setServerError(
        `${provider} sign-in isn't switched on yet. Use your email for now.`
      );
      return;
    }
    window.location.href = `${API_BASE}/auth/redirect/${provider}`;
  };

  const inputBase =
    "w-full rounded-xl bg-ink-100 text-textPrimary text-base pl-11 pr-11 py-3 border transition placeholder:text-textMuted focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-60";

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
          <Link
            to="/"
            className="text-sm text-textSecondary hover:text-textPrimary transition"
          >
            Home
          </Link>
        </header>

        {/* Eyebrow badge */}
        <div className="flex justify-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-ink-100 px-4 py-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            <span className="text-label text-textSecondary uppercase">
              Curated ecosystem access
            </span>
            <span className="text-textMuted">·</span>
            <span className="text-xs text-textSecondary">ラパク</span>
          </span>
        </div>

        {/* Heading */}
        <div className="text-center">
          <h1 className="mt-6 text-display text-textPrimary">Welcome back.</h1>
          <p className="mt-3 text-sm leading-relaxed text-textSecondary">
            Sign in to reach your saved collections, active orders, and this
            week's artisan curation.
          </p>
        </div>

        {/* Form card */}
        <form
          onSubmit={handleSubmit}
          noValidate
          className="mt-8 rounded-2xl border border-line bg-surface p-5"
        >
          <Alert type="error" message={serverError} onClose={() => setServerError("")} />
          <Alert
            type="success"
            message={success ? "Signed in. Taking you through..." : ""}
          />

          <div>
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
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setFieldErrors((p) => ({ ...p, email: "" }));
                }}
                disabled={submitting}
                placeholder="you@example.com"
                aria-invalid={Boolean(fieldErrors.email)}
                className={`${inputBase} ${
                  fieldErrors.email ? "border-danger" : "border-transparent"
                }`}
              />
            </div>
            {fieldErrors.email && (
              <p className="mt-1.5 text-sm text-danger">{fieldErrors.email}</p>
            )}
          </div>

          <div className="mt-4">
            <label htmlFor="password" className="block text-sm text-textPrimary mb-2">
              Password
            </label>
            <div className="relative">
              <Lock
                size={18}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-textMuted"
              />
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setFieldErrors((p) => ({ ...p, password: "" }));
                }}
                disabled={submitting}
                placeholder="Your password"
                aria-invalid={Boolean(fieldErrors.password)}
                className={`${inputBase} ${
                  fieldErrors.password ? "border-danger" : "border-transparent"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-textMuted hover:text-textPrimary transition"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {fieldErrors.password && (
              <p className="mt-1.5 text-sm text-danger">{fieldErrors.password}</p>
            )}
          </div>

          <div className="mt-4 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setRemember((v) => !v)}
              aria-pressed={remember}
              className="flex items-center gap-2 text-sm text-textPrimary"
            >
              <span
                className={`flex h-5 w-5 items-center justify-center rounded-md border transition ${
                  remember
                    ? "border-primary bg-primary text-white"
                    : "border-lineStrong bg-surface"
                }`}
              >
                {remember && <Check size={13} strokeWidth={3} />}
              </span>
              Remember me
            </button>
            <Link
              to="/forgot-password"
              className="text-sm font-semibold text-primary hover:text-primaryHover transition"
            >
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-primary px-4 py-3.5 font-semibold text-white transition hover:bg-primaryHover disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting ? "Signing in..." : "Sign in now"}
            {!submitting && <ArrowRight size={18} />}
          </button>

          <div className="my-5 flex items-center gap-3">
            <span className="h-px flex-1 bg-line" />
            <span className="text-label uppercase text-textMuted">
              Or continue with
            </span>
            <span className="h-px flex-1 bg-line" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleSocial("google")}
              className="flex items-center justify-center gap-2 rounded-xl bg-ink-100 py-3 text-sm font-medium text-textPrimary transition hover:bg-ink-200"
            >
              <svg viewBox="0 0 24 24" width="17" height="17" aria-hidden="true">
                <path fill="#4285F4" d="M21.6 12.23c0-.71-.06-1.4-.18-2.05H12v3.88h5.38a4.6 4.6 0 0 1-2 3.02v2.5h3.24c1.89-1.74 2.98-4.3 2.98-7.35Z" />
                <path fill="#34A853" d="M12 22c2.7 0 4.96-.9 6.62-2.42l-3.24-2.5c-.9.6-2.04.95-3.38.95-2.6 0-4.8-1.75-5.59-4.1H3.07v2.58A10 10 0 0 0 12 22Z" />
                <path fill="#FBBC05" d="M6.41 13.93a6 6 0 0 1 0-3.86V7.49H3.07a10 10 0 0 0 0 9.02l3.34-2.58Z" />
                <path fill="#EA4335" d="M12 5.98c1.47 0 2.79.5 3.83 1.5l2.87-2.87C16.95 2.99 14.7 2 12 2a10 10 0 0 0-8.93 5.49l3.34 2.58C7.2 7.72 9.4 5.98 12 5.98Z" />
              </svg>
              Google
            </button>
            <button
              type="button"
              onClick={() => handleSocial("apple")}
              className="flex items-center justify-center gap-2 rounded-xl bg-ink-100 py-3 text-sm font-medium text-textPrimary transition hover:bg-ink-200"
            >
              <svg viewBox="0 0 24 24" width="17" height="17" fill="currentColor" aria-hidden="true">
                <path d="M16.36 12.78c.02 2.6 2.28 3.47 2.3 3.48-.02.06-.36 1.24-1.19 2.45-.72 1.05-1.47 2.1-2.65 2.12-1.16.02-1.53-.69-2.85-.69-1.32 0-1.73.67-2.83.71-1.14.04-2-1.13-2.73-2.18-1.48-2.15-2.62-6.08-1.1-8.73a4.24 4.24 0 0 1 3.58-2.18c1.11-.02 2.17.75 2.85.75.68 0 1.96-.93 3.3-.79.57.02 2.16.23 3.18 1.73-.08.05-1.9 1.11-1.86 3.33ZM14.2 4.6c.6-.73 1.01-1.75.9-2.76-.87.03-1.92.58-2.55 1.31-.56.64-1.05 1.68-.92 2.67.97.07 1.96-.49 2.57-1.22Z" />
              </svg>
              Apple ID
            </button>
          </div>
        </form>

        {/* Register */}
        <div className="mt-4 rounded-2xl bg-ink-100 px-5 py-6 text-center">
          <p className="text-sm text-textSecondary">
            Don't have a Rapaku account yet?
          </p>
          <Link
            to="/register"
            className="mt-1 inline-flex items-center gap-1 font-semibold text-primary hover:text-primaryHover transition"
          >
            Create an account
            <ArrowUpRight size={16} />
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