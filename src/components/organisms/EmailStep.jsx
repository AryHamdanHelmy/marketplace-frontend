import { useState } from "react";
import FormField from "../molecules/FormField";
import Button from "../atoms/Button";

export default function EmailStep({ onContinue, initialEmail = "" }) {
  const [email, setEmail] = useState(initialEmail);
  const [error, setError] = useState("");
  const [checking, setChecking] = useState(false);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Email is required");
      return;
    }
    if (!emailRegex.test(email)) {
      setError("Enter a valid email address");
      return;
    }

    setChecking(true);
    try {
      await onContinue(email);
    } finally {
      setChecking(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      <FormField
        label="Enter your email here"
        placeholder= "Your email"
        name="email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={error}
        autoFocus
        disabled={checking}
        autoComplete="email"
      />

      <Button type="submit" disabled={checking}>
        {checking ? "Checking..." : "Continue"}
      </Button>
    </form>
  );
}