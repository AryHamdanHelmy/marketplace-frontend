import { useState } from "react";
import FormField from "../molecules/FormField";
import Button from "../atoms/Button";

export default function PasswordStep({ email, onBack, onSubmit }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!password) {
      setError("Password is required");
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit(password);
    } catch (err) {
      setError(err.message || "Sign-in failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      {/* Amazon-style: locked email + "Change" link */}
      <div>
        <p className="text-sm text-black font-bold mb-1">Email</p>
        <div className="flex items-center justify-between rounded-lg outline-1 bg-pastelgreen px-3 py-2">
          <span className="text-black text-xs truncate">{email}</span>
          <button
            type="button"
            onClick={onBack}
            className="text-emerald-700 hover:underline text-xs shrink-0 ml-2"
          >
            Change
          </button>
        </div>
      </div>

      <FormField
        label="Enter password"
        name="password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        error={error}
        autoFocus
        disabled={submitting}
        autoComplete="current-password"
      />

      <Button type="submit" disabled={submitting}>
        {submitting ? "Signing in..." : "Sign in"}
      </Button>
    </form>
  );
}