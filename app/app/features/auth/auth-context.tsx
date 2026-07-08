import {
  createContext,
  ReactNode,
  useContext,
  useMemo,
  useState,
} from "react";
import type { AuthUser } from "./api";

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

interface AuthContextValue {
  status: AuthStatus;
  user: AuthUser | null;
  isRestoring: boolean;
  isAuthenticated: boolean;
  setUserSession: (user: AuthUser | null) => void;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const status: AuthStatus = user ? "authenticated" : "unauthenticated";

  const signOut = () => {
    setUser(null);
  };

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      user,
      isRestoring: false,
      isAuthenticated: Boolean(user),
      setUserSession: setUser,
      signOut,
    }),
    [status, user],
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
