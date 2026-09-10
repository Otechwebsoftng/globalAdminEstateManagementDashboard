import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { homePathFor, type Persona } from "../../config/personas";

/**
 * Keeps each persona inside its own route tree.
 *
 * This is a UX affordance, NOT a security boundary — the persona is decided
 * client-side at login and only drives routing. The backend must still reject
 * cross-tenant calls on the JWT.
 */
export default function RequireRole({
  allow,
  children,
}: {
  allow: Persona[];
  children: ReactNode;
}) {
  const { user } = useAuth();
  const persona = user?.persona ?? "GLOBAL_ADMIN";

  if (!allow.includes(persona)) {
    return <Navigate to={homePathFor(persona)} replace />;
  }
  return <>{children}</>;
}
