import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getUserInfo, type AuthSessionUser, type AuthUser } from "./api";

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

const AUTH_STORAGE_KEY = "love-u-auth-session";

interface AuthSession {
  token: string;
  user: AuthSessionUser;
}

interface AuthContextValue {
  status: AuthStatus;
  user: AuthUser | null;
  token: string | null;
  isRestoring: boolean;
  isAuthenticated: boolean;
  refreshUser: () => Promise<AuthUser | null>;
  updateStoredUser: (nextUser: AuthUser | null) => Promise<void>;
  setUserSession: (session: AuthSession | null) => Promise<void>;
  signOut: () => void;
}

function isAuthUser(user: AuthSessionUser): user is AuthUser {
  return "nickname" in user;
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

  const persistSession = async (nextToken: string, nextUser: AuthUser) => {
    const nextSession: AuthSession = {
      token: nextToken,
      user: nextUser,
    };

    setToken(nextToken);
    setUser(nextUser);
    await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(nextSession));
  };

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

        const userInfo = await getUserInfo(session.token);
        await persistSession(session.token, userInfo.user);
      } catch {
        await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
        setToken(null);
        setUser(null);
      } finally {
        setIsRestoring(false);
      }
    }

    void restoreSession();
  }, []);

  const updateStoredUser = async (nextUser: AuthUser | null) => {
    if (!token || !nextUser) {
      setToken(null);
      setUser(null);
      await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
      return;
    }

    await persistSession(token, nextUser);
  };

  const refreshUser = async () => {
    if (!token) {
      return null;
    }

    const userInfo = await getUserInfo(token);
    await persistSession(token, userInfo.user);
    return userInfo.user;
  };

  const setUserSession = async (session: AuthSession | null) => {
    if (!session) {
      setToken(null);
      setUser(null);
      await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
      return;
    }

    const nextUser = isAuthUser(session.user)
      ? session.user
      : (await getUserInfo(session.token)).user;

    await persistSession(session.token, nextUser);
  };

  const value: AuthContextValue = {
    status,
    user,
    token,
    isRestoring,
    isAuthenticated: Boolean(user),
    refreshUser,
    updateStoredUser,
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
