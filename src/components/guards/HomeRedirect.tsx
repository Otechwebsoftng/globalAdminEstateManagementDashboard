import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { homePathFor } from "../../config/personas";

/** Persona-aware catch-all, replacing the hardcoded /admin/dashboard fallback. */
export default function HomeRedirect() {
  const { isAuthenticated, user } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <Navigate to={homePathFor(user?.persona)} replace />;
}
