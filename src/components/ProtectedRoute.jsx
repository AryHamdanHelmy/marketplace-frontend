import {Navigate} from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children, allowedRoles }) {
    const {isLoggedIn, user, loading} = useAuth();
    if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-textSecondary">Loading...</p>
      </div>
    );
  }
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-danger">You don't have access to this page.</p>
      </div>
    );
  }
  return children;
}