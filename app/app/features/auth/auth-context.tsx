import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { AuthUser } from "./api";

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

const AUTH_STORAGE_KEY = "love-u-auth-session";

interface AuthSession {
  token: string;
  user: AuthUser;
}

interface AuthContextValue {
  status: AuthStatus;
  user: AuthUser | null;
  token: string | null;
  isRestoring: boolean;
  isAuthenticated: boolean;
  setUserSession: (session: AuthSession | null) => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isRestoring, setIsRestoring] = useState(true);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const status: AuthStatus = isRestoring
    ? "loading"
    : user
      ? "authenticated"
      : "unauthenticated";

  useEffect(() => {
    async function restoreSession() {
      try {
        const storedSession = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
        if (!storedSession) {
          return;
        }

        const session = JSON.parse(storedSession) as AuthSession;
        if (!session?.token || !session?.user) {
          await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
          return;
        }

        setToken(session.token);
        setUser(session.user);
      } catch {
        await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
      } finally {
        setIsRestoring(false);
      }
    }

    void restoreSession();
  }, []);

  const setUserSession = async (session: AuthSession | null) => {
    if (!session) {
      setToken(null);
      setUser(null);
      await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
      return;
    }

    setToken(session.token);
    setUser(session.user);
    await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
  };

  const value: AuthContextValue = {
    status,
    user,
    token,
    isRestoring,
    isAuthenticated: Boolean(user),
    setUserSession,
    signOut: () => {
      void setUserSession(null);
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
