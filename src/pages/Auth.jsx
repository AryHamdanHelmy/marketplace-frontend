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
  ShieldCheck,
  Store,
  Truck,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { apiRequest } from "../api/Client";
import Alert from "../components/molecules/Alert";
import logoFull from "../assets/rapaku.png";
import panelImage from "../assets/panel.jpg"

const REMEMBER_KEY = "rapaku:remembered-email";
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const API_BASE = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";
const OAUTH_ENABLED = import.meta.env.VITE_OAUTH_ENABLED === "true";

const PROMISES = [
  {
    icon: ShieldCheck,
    title: "Your money waits with us",
    body: "Sellers are paid only once you confirm the parcel arrived.",
  },
  {
    icon: Store,
    title: "Makers, not resellers",
    body: "Every shop belongs to the person who made what's inside it.",
  },
  {
    icon: Truck,
    title: "One cart, many shops",
    body: "Buy from three studios at once and pay a single time.",
  },
];

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

  const [shops, setShops] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem(REMEMBER_KEY);
    if (saved) {
      setEmail(saved);
      setRemember(true);
    }
  }, []);

  // Real shops for the side panel. Fails quietly — a sign-in page must never
  // depend on a decorative request succeeding.
  useEffect(() => {
    (async () => {
      try {
        const res = await apiRequest("/shops?per_page=3");
        setShops(res.data || []);
      } catch {
        // No shops, no strip. Nothing else changes.
      }
    })();
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

  const handleSocial = (provider) => {
    if (!OAUTH_ENABLED) {
      setServerError(
        `${provider === "google" ? "Google" : "Apple"} sign-in isn't switched on yet. Use your email for now.`
      );
      return;
    }
    window.location.href = `${API_BASE}/auth/redirect/${provider}`;
  };

  // 16px on phones is deliberate — anything smaller makes Safari zoom on
  // focus. Desktop is free of that rule, so the fields shrink there.
  const inputBase =
    "w-full rounded-xl md:rounded-lg bg-ink-100 text-textPrimary text-base md:text-sm pl-11 md:pl-9 pr-11 md:pr-9 py-3 md:py-2 border transition placeholder:text-textMuted focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-60";

  return (
    // From md up this is exactly one screen tall. Each column scrolls on its
    // own, so a short laptop never hides the sign-in button but the layout
    // still reads as a single, uncut view.
    <div className="min-h-screen bg-background md:h-screen md:overflow-hidden md:grid md:grid-cols-2">

      {/* Form */}
      <div className="md:h-screen md:bg-surface md:overflow-y-auto scrollbar-hide md:flex md:flex-col md:justify-center">
        <div className="mx-auto w-full max-w-md px-4 pb-10 md:px-8 lg:px-12 md:py-8">

          {/* Top bar — mobile only */}
          <header className="flex items-center justify-between py-4 md:hidden">
            <button
              type="button"
              onClick={() => navigate(-1)}
              aria-label="Go back"
              className="p-2 -ml-2 rounded-lg text-textPrimary hover:bg-ink-100 transition"
            >
              <ArrowLeft size={20} />
            </button>
            <img src={logoFull} alt="Rapaku" className="h-5 w-auto" />
            <Link
              to="/explore"
              className="text-sm text-textSecondary hover:text-textPrimary transition"
            >
              Help
            </Link>
          </header>

          {/* Desktop wordmark */}
          <div className="hidden md:flex items-center gap-3 mb-6">
            <img src={logoFull} alt="Rapaku" className="h-6 w-auto" />
            <span className="text-xs text-textSecondary border-l border-line pl-3">
              ラパク
            </span>
          </div>

          {/* Eyebrow badge */}
          <div className="flex justify-center md:justify-start">
            <span className="inline-flex items-center gap-2 rounded-full bg-ink-100 px-4 py-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              <span className="text-label uppercase text-textSecondary">
                Curated ecosystem access
              </span>
            </span>
          </div>

          {/* Heading */}
          <div className="mt-6 md:mt-4 text-center md:text-left">
            <img
              src={logoFull}
              alt=""
              className="mx-auto h-12 w-auto rounded-xl bg-background p-2 md:hidden"
            />
            <h1 className="mt-6 md:mt-0 text-display text-textPrimary">
              Welcome back.
            </h1>
            <p className="mt-3 md:mt-2 text-label leading-relaxed text-textSecondary md:max-w-sm">
              Sign in to reach your saved collections and active orders.
            </p>
          </div>

          {/* Form card. Borderless on desktop — the split already separates it
              from the panel, so a box inside a box reads busy. */}
          <form
            onSubmit={handleSubmit}
            noValidate
            className="mt-8 md:mt-5 rounded-2xl border border-line bg-surface p-5 md:border-0 md:bg-transparent md:p-0"
          >
            <Alert type="error" message={serverError} onClose={() => setServerError("")} />
            <Alert
              type="success"
              message={success ? "Signed in. Taking you through..." : ""}
            />

            <div>
              <label
                htmlFor="email"
                className="block text-sm md:text-label text-textPrimary mb-2 md:mb-1.5"
              >
                Email address
              </label>
              <div className="relative">
                <Mail
                  size={18}
                  className="pointer-events-none absolute left-3.5 md:left-2.5 top-1/2 -translate-y-1/2 text-textMuted md:w-4 md:h-4"
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

            <div className="mt-4 md:mt-3">
              <label
                htmlFor="password"
                className="block text-sm md:text-label text-textPrimary mb-2 md:mb-1.5"
              >
                Password
              </label>
              <div className="relative">
                <Lock
                  size={18}
                  className="pointer-events-none absolute left-3.5 md:left-2.5 top-1/2 -translate-y-1/2 text-textMuted md:w-4 md:h-4"
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
                  className="absolute right-3 md:right-2 top-1/2 -translate-y-1/2 p-1 text-textMuted hover:text-textPrimary transition"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="mt-1.5 text-sm text-danger">{fieldErrors.password}</p>
              )}
            </div>

            <div className="mt-4 md:mt-3 flex items-center justify-between">
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
              className="mt-5 md:mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-primary px-4 py-3.5 md:py-3 font-semibold text-white transition hover:bg-primaryHover disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? "Signing in..." : "Sign in now"}
              {!submitting && <ArrowRight size={18} />}
            </button>

            <div className="my-5 md:my-3.5 flex items-center gap-3">
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
                className="flex items-center justify-center gap-2 rounded-xl md:rounded-lg bg-ink-100 py-3 md:py-2 text-sm font-medium text-textPrimary transition hover:bg-ink-200 md:bg-background md:border md:border-line md:hover:bg-ink-100"
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
                className="flex items-center justify-center gap-2 rounded-xl md:rounded-lg bg-ink-100 py-3 md:py-2 text-sm font-medium text-textPrimary transition hover:bg-ink-200 md:bg-background md:border md:border-line md:hover:bg-ink-100"
              >
                <svg viewBox="0 0 24 24" width="17" height="17" fill="currentColor" aria-hidden="true">
                  <path d="M16.36 12.78c.02 2.6 2.28 3.47 2.3 3.48-.02.06-.36 1.24-1.19 2.45-.72 1.05-1.47 2.1-2.65 2.12-1.16.02-1.53-.69-2.85-.69-1.32 0-1.73.67-2.83.71-1.14.04-2-1.13-2.73-2.18-1.48-2.15-2.62-6.08-1.1-8.73a4.24 4.24 0 0 1 3.58-2.18c1.11-.02 2.17.75 2.85.75.68 0 1.96-.93 3.3-.79.57.02 2.16.23 3.18 1.73-.08.05-1.9 1.11-1.86 3.33ZM14.2 4.6c.6-.73 1.01-1.75.9-2.76-.87.03-1.92.58-2.55 1.31-.56.64-1.05 1.68-.92 2.67.97.07 1.96-.49 2.57-1.22Z" />
                </svg>
                Apple ID
              </button>
            </div>
          </form>

          {/* Register */}
          <div className="mt-4 rounded-2xl bg-ink-100 px-5 py-6 text-center md:bg-transparent md:px-0 md:py-0 md:mt-4 md:text-left">
            <p className="text-label text-textSecondary md:inline">
              Don't have a Rapaku account yet?{" "}
            </p>
            <Link
              to="/register"
              className="mt-1 md:mt-0 inline-flex items-center gap-1 font-semibold text-primary hover:text-primaryHover transition"
            >
              Create an account
              <ArrowUpRight size={16} />
            </Link>
          </div>

          {/* Footer — mobile only. The panel already carries these promises on
              desktop, and repeating them costs vertical space the form needs. */}
          <footer className="mt-8 md:hidden text-center">
            <div className="flex items-center justify-center gap-3 text-textMuted">
              <span className="inline-flex items-center gap-1.5 text-xs">
                <ShieldCheck size={13} />
                SSL encrypted
              </span>
              <span>·</span>
              <span className="inline-flex items-center gap-1.5 text-xs">
                <Truck size={13} />
                Ships nationwide
              </span>
            </div>
            <p className="mt-2 text-xs text-textSecondary">
              Rapaku · Open your shop © {new Date().getFullYear()}
            </p>
          </footer>
        </div>
      </div>

      {/* Brand panel — nothing here is decoration pretending to be data. The
          promises describe what the system does, and the shops are live. */}
      <aside className="relative hidden md:flex md:h-screen md:overflow-y-auto scrollbar-hide flex-col justify-center bg-background border-l border-line overflow-hidden">
        <img
          src={panelImage}
          alt=""
          aria-hidden="true"
          className="absolute insert-0 h-full w-full object-cover"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-background/50"
        />
        <div className="relative max-w-md px-8 lg:px-12 py-8">
          <p className="text-label uppercase tex-text">
            Rapaku · ラパク
          </p>

          <h2 className="mt-3 text-heading lg:text-display text-textPrimary">
            One gate. Every shop.
          </h2>

          <p className="mt-3 text-sm leading-relaxed text-shadow-textPrimary">
            The name comes from <em>lapakku</em> — "my stall" — said with a
            Japanese accent. Every seller here gets a proper shopfront, however
            small their workshop.
          </p>

          <div className="mt-7 lg:mt-9 space-y-5">
            {PROMISES.map(({ icon: Icon, title, body }) => (
              <div key={title} className="flex gap-3.5">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primarySoft">
                  <Icon size={17} />
                </span>
                <div>
                  <p className="text-sm font-semibold text-textPrimary">{title}</p>
                  <p className="mt-0.5 text-sm text-shadow-textPrimary leading-relaxed">
                    {body}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {shops.length > 0 && (
            <div className="mt-7 lg:mt-9 pt-5 border-t border-line">
              <p className="text-label uppercase text-textSecondary mb-2.5">
                Shops on Rapaku
              </p>
              <div className="flex flex-wrap gap-2">
                {shops.map((shop) => (
                  <span
                    key={shop.slug}
                    className="inline-flex items-center gap-2 rounded-full bg-surface border border-line pl-1.5 pr-3 py-1.5"
                  >
                    <span className="h-6 w-6 rounded-full bg-ink-100 overflow-hidden flex items-center justify-center shrink-0">
                      {shop.logo_url ? (
                        <img
                          src={shop.logo_url}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <Store size={12} className="text-textMuted" />
                      )}
                    </span>
                    <span className="text-xs text-textSecondary">
                      {shop.name}
                      {shop.city && (
                        <span className="text-textMuted"> · {shop.city}</span>
                      )}
                    </span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}