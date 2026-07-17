import { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { apiRequest } from "../api/Client";
import FormField from "../components/molecules/FormField";
import Alert from "../components/molecules/Alert";
import Button from "../components/atoms/Button";

export default function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [searchParams] = useSearchParams();

  // Kalau datang dari Auth.jsx (email belum terdaftar), email sudah keisi otomatis
  const prefilledEmail = searchParams.get("email") || "";

  const [form, setForm] = useState({
    name: "",
    email: prefilledEmail,
    password: "",
    password_confirmation: "",
    role: "buyer",
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRoleSelect = (role) => {
    setForm({ ...form, role });
  };

  const validate = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!form.name.trim()) newErrors.name = "Name is required";

    if (!form.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(form.email)) {
      newErrors.email = "Enter a valid email address";
    }

    if (!form.password) {
      newErrors.password = "Password is required";
    } else if (form.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    if (form.password !== form.password_confirmation) {
      newErrors.password_confirmation = "Passwords do not match";
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");

    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setSubmitting(true);
    try {
      const data = await apiRequest("/auth/register", {
        method: "POST",
        body: form,
      });

      login(data.token, data.user);
      setSuccess(true);

      setTimeout(() => {
        navigate("/");
      }, 1000);
    } catch (err) {
      setServerError(err.message || "Registration failed");
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-hitam pt-10 flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white border-2 rounded-2xl p-8">
        <h2 className="text-2xl font-bold text-darkblue mb-6 text-center">
          Register
        </h2>

        {prefilledEmail && (
          <p className="text-sm text-darkblue mb-4 text-center">
            The email <span className="text-emerald-800 font-bold">{prefilledEmail}</span> isn't
            registered yet. Fill in the details below to create a new account.
          </p>
        )}

        <Alert
          type="error"
          message={serverError}
          onClose={() => setServerError("")}
        />
        <Alert
          type="success"
          message={success ? "Register done redirection..." : ""}
        />

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <FormField
            label="Name"
            name="name"
            value={form.name}
            onChange={handleChange}
            error={errors.name}
            autoComplete="name"
          />

          <FormField
            label="Email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            error={errors.email}
            autoComplete="email"
          />

          <FormField
            label="Password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            error={errors.password}
            autoComplete="new-password"
          />

          <FormField
            label="Password Confirmation"
            name="password_confirmation"
            type="password"
            value={form.password_confirmation}
            onChange={handleChange}
            error={errors.password_confirmation}
            autoComplete="new-password"
          />

          <div>
            <label className="block text-sm text-black mb-2">
              Register as
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleRoleSelect("buyer")}
                className={`rounded-lg py-2 text-sm font-semibold transition border ${
                  form.role === "buyer"
                    ? "bg-pastel-blue border-pastel-blue text-white"
                    : "bg-black/10 border-black/10 text-black hover:bg-black/20"
                }`}
              >
                Buyer
              </button>
              <button
                type="button"
                onClick={() => handleRoleSelect("seller")}
                className={`rounded-lg py-2 text-sm font-semibold transition border ${
                  form.role === "seller"
                    ? "bg-pastel-blue border-pastel-blue text-white"
                    : "bg-black/10 border-black/10 text-black hover:bg-black/20"
                }`}
              >
                Seller
              </button>
            </div>
          </div>

          <Button type="submit" disabled={submitting || success}>
            {success ? "Success!" : submitting ? "Proccesing..." : "Register"}
          </Button>
        </form>

        <p className="text-center text-sm text-black mt-4">
          Have an Account?{" "}
          <Link to="/login" className="text-emerald-800 hover:underline font-bold">
            Login Here
          </Link>
        </p>
      </div>
    </div>
  );
}