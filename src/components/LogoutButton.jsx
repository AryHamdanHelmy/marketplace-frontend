import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { apiRequest } from "../api/client";

export default function LogoutButton({ className = "", label = "Logout", onClick }) {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [logingOut, setLoggingOut] =useState(false);

  const handleLogout = async () => {
    if (logingOut) return;
    onClick?.();
    setLoggingOut(true);

    try {
      // Beri tahu backend supaya token dihapus/direvoke di server
      await apiRequest("/auth/logout", { method: "POST" });
    } catch (err) {
      // Tetap lanjut logout di sisi frontend walau request ke server gagal
      console.error("Gagal logout di server:", err.message);
    } finally {
      logout(); // hapus token & user dari state + localStorage
      navigate("/");
    }
  };

  return (
    <button
      onClick={handleLogout}
      className={
        className ||
        "text-sm text-gray-300 hover:text-white transition"
      }
    >
      {label}
    </button>
  );
}