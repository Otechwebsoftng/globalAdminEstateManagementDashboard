import { useState, useEffect, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { setOnSessionExpired, setAuthToken } from "../services/api";
import { useAuth } from "../context/AuthContext";
import SessionExpiredModal from "./SessionExpiredModal";

export default function SessionExpiredGate({ children }: { children: ReactNode }) {
  const [isExpired, setIsExpired] = useState(false);
  const navigate = useNavigate();
  const auth = useAuth();

  useEffect(() => {
    setOnSessionExpired(() => {
      setIsExpired(true);
    });
    return () => setOnSessionExpired(null);
  }, []);

  const handleLogin = () => {
    auth.logout();
    setAuthToken(null);
    setIsExpired(false);
    navigate("/login");
  };

  return (
    <>
      <SessionExpiredModal isOpen={isExpired} onLogin={handleLogin} />
      {children}
    </>
  );
}
