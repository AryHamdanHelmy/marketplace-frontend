import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { apiRequest } from "../api/client";

export default function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({
    name: "",
    email: "",
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

    if (!form.name.trim()) newErrors.name = "Nama wajib diisi";

    if (!form.email.trim()) {
      newErrors.email = "Email wajib diisi";
    } else if (!emailRegex.test(form.email)) {
      newErrors.email = "Format email tidak valid";
    }

    if (!form.password) {
      newErrors.password = "Password wajib diisi";
    } else if (form.password.length < 8) {
      newErrors.password = "Password minimal 8 karakter";
    }

    if (form.password !== form.password_confirmation) {
      newErrors.password_confirmation = "Konfirmasi password tidak cocok";
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
      setServerError(err.message || "Registrasi gagal");
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-hitam flex items-center justify-center pt-24 px-4">
      <div className="w-full max-w-sm bg-white/5 rounded-2xl p-8">
        <h2 className="text-2xl font-bold text-white mb-6 text-center">
          Register
        </h2>

        {serverError && (
          <div className="bg-red-500/10 text-red-400 text-sm rounded-lg px-4 py-2 mb-4">
            {serverError}
          </div>
        )}

        {success && (
          <div className="bg-green-500/10 text-green-400 text-sm rounded-lg px-4 py-2 mb-4">
            Register done redirection...
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <div>
            <label className="block text-sm text-gray-300 mb-1">Name</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              className="w-full rounded-lg bg-white/10 text-white px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {errors.name && (
              <p className="text-red-400 text-xs mt-1">{errors.name}</p>
            )}
          </div>

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

          <div>
            <label className="block text-sm text-gray-300 mb-1">
              Password Confirmation
            </label>
            <input
              type="password"
              name="password_confirmation"
              value={form.password_confirmation}
              onChange={handleChange}
              className="w-full rounded-lg bg-white/10 text-white px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {errors.password_confirmation && (
              <p className="text-red-400 text-xs mt-1">
                {errors.password_confirmation}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-2">
              Register as
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleRoleSelect("buyer")}
                className={`rounded-lg py-2 text-sm font-semibold transition border ${
                  form.role === "buyer"
                    ? "bg-indigo-600 border-indigo-600 text-white"
                    : "bg-white/10 border-white/10 text-gray-300 hover:bg-white/20"
                }`}
              >
                Buyer
              </button>
              <button
                type="button"
                onClick={() => handleRoleSelect("seller")}
                className={`rounded-lg py-2 text-sm font-semibold transition border ${
                  form.role === "seller"
                    ? "bg-indigo-600 border-indigo-600 text-white"
                    : "bg-white/10 border-white/10 text-gray-300 hover:bg-white/20"
                }`}
              >
                Seller
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting || success}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-full py-2 transition disabled:opacity-60"
          >
            {success ? "Success!" : submitting ? "Proccesing..." : "Register"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-400 mt-4">
          Have an Account?{" "}
          <Link to="/login" className="text-indigo-400 hover:underline">
            Login Here
          </Link>
        </p>
      </div>
    </div>
  );
}