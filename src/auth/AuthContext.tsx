import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { authApi, type MeResponse } from "../api/auth";

interface Session {
  token: string;
  user: MeResponse;
}

interface AuthContextValue {
  session: Session | null;
  loading: boolean;
  setSession: (token: string, user: MeResponse) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);
const STORAGE_KEY = "coon-meeting-dashboard.token";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSessionState] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem(STORAGE_KEY);
    if (!token) {
      setLoading(false);
      return;
    }

    authApi
      .me(token)
      .then((user) => setSessionState({ token, user }))
      .catch(() => localStorage.removeItem(STORAGE_KEY))
      .finally(() => setLoading(false));
  }, []);

  const setSession = (token: string, user: MeResponse) => {
    localStorage.setItem(STORAGE_KEY, token);
    setSessionState({ token, user });
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setSessionState(null);
  };

  return <AuthContext.Provider value={{ session, loading, setSession, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
