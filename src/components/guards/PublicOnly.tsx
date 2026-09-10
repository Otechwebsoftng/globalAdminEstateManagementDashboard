import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { homePathFor } from "../../config/personas";

/** Keeps /login unreachable while signed in. */
export default function PublicOnly({ children }: { children: ReactNode }) {
  const { isAuthenticated, user } = useAuth();
  if (isAuthenticated) return <Navigate to={homePathFor(user?.persona)} replace />;
  return <>{children}</>;
}
