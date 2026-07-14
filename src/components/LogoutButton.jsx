import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { apiRequest } from "../api/client";

export default function LogoutButton({ className }) {
    const navigate = useNavigate();
    const { logout } = useAuth();

    const handleLogout = async () => {
        try {
            // Beri tahu server supaya token ini di-revoke (sesuai AuthController::logout)
            await apiRequest("/auth/logout", { method: "POST" });
        } catch (err) {
            // Kalaupun request ke server gagal (misal token sudah expired duluan),
            // tetap lanjutkan proses logout di sisi client supaya user tidak "kejebak".
            console.error("Logout API gagal:", err.message);
        } finally {
            logout(); // hapus token & user dari localStorage + state
            navigate("/login");
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
            Logout
        </button>
    );
}