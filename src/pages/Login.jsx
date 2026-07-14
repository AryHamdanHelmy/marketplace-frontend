import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { apiRequest } from "../api/client";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validate = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!form.email.trim()) {
      newErrors.email = "Email wajib diisi";
    } else if (!emailRegex.test(form.email)) {
      newErrors.email = "Format email tidak valid";
    }

    if (!form.password) newErrors.password = "Password wajib diisi";

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
      const data = await apiRequest("/auth/login", {
        method: "POST",
        body: { email: form.email, password: form.password },
      });

      login(data.token, data.user);
      setSuccess(true);

      const destination = data.user.role === "seller" ? "/users" : "/";

      // Kasih jeda sebentar biar user lihat pesan sukses sebelum pindah halaman
      setTimeout(() => {
        navigate(destination);
      }, 1000);
    } catch (err) {
      setServerError(err.message || "Login gagal");
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-hitam flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white/5 rounded-2xl p-8">
        <h2 className="text-2xl font-bold text-white mb-6 text-center">Login</h2>

        {serverError && (
          <div className="bg-red-500/10 text-red-400 text-sm rounded-lg px-4 py-2 mb-4">
            {serverError}
          </div>
        )}

        {success && (
          <div className="bg-green-500/10 text-green-400 text-sm rounded-lg px-4 py-2 mb-4">
            Login success! processing...
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <div>
            <label className="block text-sm text-gray-300 mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="w-full rounded-lg bg-white/10 text-white px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {errors.email && (
              <p className="text-red-400 text-xs mt-1">{errors.email}</p>
            )}
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1">Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              className="w-full rounded-lg bg-white/10 text-white px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {errors.password && (
              <p className="text-red-400 text-xs mt-1">{errors.password}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={submitting || success}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-full py-2 transition disabled:opacity-60"
          >
            {success ? "Success!" : submitting ? "Processing..." : "Login"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-400 mt-4">
          Don't Have Account?{" "}
          <Link to="/register" className="text-indigo-400 hover:underline">
            Register Here
          </Link>
        </p>
      </div>
    </div>
  );
}