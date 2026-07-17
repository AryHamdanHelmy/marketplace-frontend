import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { apiRequest } from "../api/client";
import EmailStep from "../components/organisms/EmailStep";
import PasswordStep from "../components/organisms/PasswordStep";
import Alert from "../components/molecules/Alert";

export default function Auth() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [step, setStep] = useState("email"); // "email" | "password"
  const [email, setEmail] = useState("");
  const [serverError, setServerError] = useState("");
  const [success, setSuccess] = useState(false);

  // Called after EmailStep passes format validation.
  // Job: ask the backend whether this email is already registered.
  const handleEmailContinue = async (submittedEmail) => {
    setServerError("");
    try {
      const res = await apiRequest("/auth/check-email", {
        method: "POST",
        body: { email: submittedEmail },
      });

      setEmail(submittedEmail);

      if (res.exists) {
        // Already registered -> move to the password step
        setStep("password");
      } else {
        // Not registered yet -> send to Register, email pre-filled
        navigate(`/register?email=${encodeURIComponent(submittedEmail)}`);
      }
    } catch (err) {
      setServerError(err.message || "Something went wrong, please try again");
    }
  };

  const handlePasswordSubmit = async (password) => {
    const data = await apiRequest("/auth/login", {
      method: "POST",
      body: { email, password },
    });

    login(data.token, data.user);
    setSuccess(true);

    const destination = data.user.role === "seller" ? "/users" : "/";

    setTimeout(() => {
      navigate(destination);
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white border-2 rounded-lg p-8">
        <h2 className="text-xl font-bold text-darkblue mb-6 text-center">
          {step === "email" ? "Sign in or create account" : "Enter your password"}
        </h2>
        <Alert
          type="error"
          message={serverError}
          onClose={() => setServerError("")}
        />
        <Alert
          type="success"
          message={success ? "Signed in successfully! Redirecting..." : ""}
        />

        {step === "email" && (
          <EmailStep onContinue={handleEmailContinue} initialEmail={email} />
        )}

        {step === "password" && (
          <PasswordStep
            email={email}
            onBack={() => setStep("email")}
            onSubmit={handlePasswordSubmit}
          />
        )}
      </div>
    </div>
  );
}