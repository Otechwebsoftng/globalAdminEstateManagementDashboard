import { useEffect } from "react";
import { Routes, Route, Outlet, useLocation } from "react-router-dom";
import SessionExpiredGate from "./components/SessionExpiredGate";
import ErrorBoundary from "./components/ErrorBoundary";
import RequireAuth from "./components/guards/RequireAuth";
import RequireRole from "./components/guards/RequireRole";
import PublicOnly from "./components/guards/PublicOnly";
import HomeRedirect from "./components/guards/HomeRedirect";
import EstateLogin from "./components/estate/EstateLogin";
import GlobalDashboard from "./components/estate/GlobalDashboard";
import EstateAdminPortal from "./features/shared/EstateAdminPortal";

/** Wraps the authenticated tree in the session-expiry gate and error boundary. */
function AuthenticatedShell() {
  return (
    <SessionExpiredGate>
      <ErrorBoundary>
        <Outlet />
      </ErrorBoundary>
    </SessionExpiredGate>
  );
}

export default function AppRoutes() {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [location.pathname]);

  return (
    <Routes>
      <Route
        path="/login"
        element={
          <PublicOnly>
            <EstateLogin />
          </PublicOnly>
        }
      />

      <Route element={<RequireAuth />}>
        <Route element={<AuthenticatedShell />}>
          {/*
            Still a single catch-all rendering GlobalDashboard, which derives its
            own section from the URL. Phase 0 step 9 carves this into real child
            routes one page at a time.
          */}
          <Route
            path="/admin/*"
            element={
              <RequireRole allow={["GLOBAL_ADMIN"]}>
                <GlobalDashboard />
              </RequireRole>
            }
          />

          {/* Estate-admin tree. Boards 1, 2 and 4 land here. */}
          <Route
            path="/estate/*"
            element={
              <RequireRole allow={["ESTATE_ADMIN"]}>
                <EstateAdminPortal />
              </RequireRole>
            }
          />
        </Route>
      </Route>

      <Route path="*" element={<HomeRedirect />} />
    </Routes>
  );
}
