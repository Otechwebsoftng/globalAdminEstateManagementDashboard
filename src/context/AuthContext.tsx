import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { setAuthToken, getAuthToken } from "../services/api";
import type { Persona } from "../config/personas";

export interface User {
  id: string;
  name: string;
  /** Human-readable role name for display only — never gate on this. */
  role: string;
  email: string;
  /** Routing discriminator. Chosen at login; see the trust note below. */
  persona: Persona;
  roleId?: string;
  /** Permission slugs, for future permission-level gating. */
  permissions?: string[];
  /** Estate admins only — scopes every /estate/* query. */
  estateId?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  mfaToken: string | null;
  login: (user: User, token: string) => void;
  setMfaToken: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const STORAGE_KEY = "global_estates_user";
const TOKEN_KEY = "global_estates_token";
const MFA_KEY = "global_estates_mfa_token";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [mfaToken, setMfaTokenState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem(STORAGE_KEY);
      const storedToken = localStorage.getItem(TOKEN_KEY);
      const storedMfa = localStorage.getItem(MFA_KEY);

      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        if (parsed && parsed.id && parsed.name) {
          // Sessions created before personas existed have no `persona` field.
          // Default them to GLOBAL_ADMIN — the only login path that existed —
          // rather than rejecting the record, which would sign everyone out.
          if (!parsed.persona) parsed.persona = "GLOBAL_ADMIN";
          setUser(parsed);
        }
      }
      if (storedToken) {
        setToken(storedToken);
        setAuthToken(storedToken);
      }
      if (storedMfa) {
        setMfaTokenState(storedMfa);
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(MFA_KEY);
    }
    setIsLoading(false);
  }, []);

  const login = (userData: User, jwt: string) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
    localStorage.setItem(TOKEN_KEY, jwt);
    setAuthToken(jwt);
    setUser(userData);
    setToken(jwt);
  };

  const setMfaToken = (mfa: string) => {
    localStorage.setItem(MFA_KEY, mfa);
    setMfaTokenState(mfa);
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(MFA_KEY);
    setAuthToken(null);
    setUser(null);
    setToken(null);
    setMfaTokenState(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        isLoading,
        mfaToken,
        login,
        setMfaToken,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
