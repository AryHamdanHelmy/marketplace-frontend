import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Lock,
  Eye,
  EyeOff,
  CircleCheck,
  TriangleAlert,
  ShieldCheck,
  BadgeCheck,
} from "lucide-react";
import { apiRequest } from "../api/Client";
import Alert from "../components/molecules/Alert";
import logoFull from "../assets/rapaku.png";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const token = searchParams.get("token") || "";
  const email = searchParams.get("email") || "";

  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [fieldErrors, setFieldErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const linkIsValid = Boolean(token && email);

  // Send the person back to sign in shortly after a successful reset
  useEffect(() => {
    if (!done) return;
    const timer = setTimeout(() => navigate("/"), 3000);
    return () => clearTimeout(timer);
  }, [done, navigate]);

  const validate = () => {
    const errors = {};
    if (!password) errors.password = "Choose a new password";
    else if (password.length < 8) errors.password = "Use at least 8 characters";
    if (!confirmation) errors.confirmation = "Type the password again";
    else if (password !== confirmation) errors.confirmation = "These don't match";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");
    if (!validate()) return;

    setSubmitting(true);
    try {
      await apiRequest("/auth/reset-password", {
        method: "POST",
        body: {
          token,
          email,
          password,
          password_confirmation: confirmation,
        },
      });
      setDone(true);
    } catch (err) {
      // Laravel returns per-field messages under `errors`; an expired or used
      // token comes back as a plain message instead.
      if (err.errors) {
        setFieldErrors({
          password: err.errors.password?.[0] || "",
          confirmation: err.errors.password_confirmation?.[0] || "",
        });
        if (err.errors.token || err.errors.email) {
          setServerError("This reset link is no longer valid. Request a new one.");
        }
      } else {
        setServerError(err.message || "Something went wrong. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
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
            onClick={() => navigate("/")}
            aria-label="Go to sign in"
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

        {!linkIsValid ? (
          /* The link was truncated or opened without its query string */
          <>
            <div className="mt-8 text-center">
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-dangerSoft text-danger">
                <TriangleAlert size={26} />
              </span>
              <h1 className="mt-6 text-display text-textPrimary">
                This link looks incomplete.
              </h1>
              <p className="mt-3 text-sm leading-relaxed text-textSecondary">
                Some email apps cut long links in half. Request a fresh one and
                open it straight from your inbox.
              </p>
            </div>

            <div className="mt-8 rounded-2xl border border-line bg-surface p-5">
              <Link
                to="/forgot-password"
                className="flex w-full items-center justify-center gap-2 rounded-full bg-primary px-4 py-3.5 font-semibold text-white transition hover:bg-primaryHover"
              >
                Request a new link
                <ArrowRight size={18} />
              </Link>
            </div>
          </>
        ) : done ? (
          /* Reset succeeded */
          <>
            <div className="mt-8 text-center">
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-successSoft text-success">
                <CircleCheck size={26} />
              </span>
              <h1 className="mt-6 text-display text-textPrimary">
                Password updated.
              </h1>
              <p className="mt-3 text-sm leading-relaxed text-textSecondary">
                Every device that was signed in has been signed out. Taking you
                back to sign in...
              </p>
            </div>

            <div className="mt-8 rounded-2xl border border-line bg-surface p-5">
              <Link
                to="/"
                className="flex w-full items-center justify-center gap-2 rounded-full bg-primary px-4 py-3.5 font-semibold text-white transition hover:bg-primaryHover"
              >
                Sign in now
                <ArrowRight size={18} />
              </Link>
            </div>
          </>
        ) : (
          /* The form */
          <>
            <div className="mt-8 text-center">
              <h1 className="mt-6 text-display text-textPrimary">
                Set a new password.
              </h1>
              <p className="mt-3 text-sm leading-relaxed text-textSecondary">
                Resetting the password for{" "}
                <span className="font-semibold text-textPrimary">{email}</span>.
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

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm text-textPrimary mb-2"
                >
                  New password
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
                    autoComplete="new-password"
                    autoFocus
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setFieldErrors((p) => ({ ...p, password: "" }));
                    }}
                    disabled={submitting}
                    placeholder="At least 8 characters"
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

              <div className="mt-4">
                <label
                  htmlFor="password_confirmation"
                  className="block text-sm text-textPrimary mb-2"
                >
                  Confirm password
                </label>
                <div className="relative">
                  <Lock
                    size={18}
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-textMuted"
                  />
                  <input
                    id="password_confirmation"
                    name="password_confirmation"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    value={confirmation}
                    onChange={(e) => {
                      setConfirmation(e.target.value);
                      setFieldErrors((p) => ({ ...p, confirmation: "" }));
                    }}
                    disabled={submitting}
                    placeholder="Type it again"
                    aria-invalid={Boolean(fieldErrors.confirmation)}
                    className={`${inputBase} ${
                      fieldErrors.confirmation
                        ? "border-danger"
                        : "border-transparent"
                    }`}
                  />
                </div>
                {fieldErrors.confirmation && (
                  <p className="mt-1.5 text-sm text-danger">
                    {fieldErrors.confirmation}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-primary px-4 py-3.5 font-semibold text-white transition hover:bg-primaryHover disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting ? "Updating..." : "Update password"}
                {!submitting && <ArrowRight size={18} />}
              </button>

              <p className="mt-4 text-xs leading-relaxed text-textMuted">
                Updating your password signs you out everywhere else.
              </p>
            </form>
          </>
        )}

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