import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import SessionExpiredGate from "./components/SessionExpiredGate";
import ErrorBoundary from "./components/ErrorBoundary";
import EstateLogin from "./components/estate/EstateLogin";
import GlobalDashboard from "./components/estate/GlobalDashboard";

function AppRoutes() {
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [isAuthenticated]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-bold text-gray-400">Loading secure portal...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={<EstateLogin />} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    );
  }

  return (
    <SessionExpiredGate>
      <ErrorBoundary>
        <Routes>
          <Route path="/admin/*" element={<GlobalDashboard />} />
          <Route path="*" element={<Navigate to="/admin/dashboard" />} />
        </Routes>
      </ErrorBoundary>
    </SessionExpiredGate>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
