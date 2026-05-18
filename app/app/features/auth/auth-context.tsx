import { createContext, ReactNode, useContext, useMemo, useState } from "react";
import { fetchCurrentUser, login, type AuthUser } from "./api";

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

interface AuthContextValue {
  status: AuthStatus;
  token: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  signIn: (username: string, password: string) => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>("unauthenticated");
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);

  const signIn = async (username: string, password: string) => {
    setStatus("loading");

    try {
      const auth = await login(username, password);
      const me = await fetchCurrentUser(auth.token);

      setToken(auth.token);
      setUser(me.user);
      setStatus("authenticated");
    } catch (error) {
      setToken(null);
      setUser(null);
      setStatus("unauthenticated");
      throw error;
    }
  };

  const signOut = () => {
    setToken(null);
    setUser(null);
    setStatus("unauthenticated");
  };

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      token,
      user,
      isAuthenticated: status === "authenticated",
      signIn,
      signOut,
    }),
    [status, token, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
