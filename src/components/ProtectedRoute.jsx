import {Navigate} from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children, allowedRoles }) {
    const {isLoggedIn, user, loading} = useAuth();
    if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-hitam">
        <p className="text-gray-400">Memuat...</p>
      </div>
    );
  }
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-hitam">
        <p className="text-red-400">Kamu tidak punya akses ke halaman ini.</p>
      </div>
    );
  }
  return children;
}