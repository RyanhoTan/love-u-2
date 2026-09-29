import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getUserInfo, type AuthSessionUser, type AuthUser } from "./api";
import {
  AUTH_STORAGE_KEY,
  LEGACY_AUTH_STORAGE_KEY,
  persistStoredAuthSession,
  removeStoredAuthSession,
  subscribeToAuthInvalidation,
} from "@/app/shared/auth-session";

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

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
  const tokenRef = useRef<string | null>(null);
  const status: AuthStatus = isRestoring
    ? "loading"
    : user
      ? "authenticated"
      : "unauthenticated";

  const persistSession = async (nextToken: string, nextUser: AuthUser) => {
    tokenRef.current = nextToken;
    setToken(nextToken);
    setUser(nextUser);
    await persistStoredAuthSession(nextToken, nextUser);
  };

  const removeStoredSession = () => removeStoredAuthSession();

  useEffect(
    () =>
      subscribeToAuthInvalidation((rejectedToken) => {
        if (tokenRef.current !== rejectedToken) {
          return;
        }

        tokenRef.current = null;
        setToken(null);
        setUser(null);
        setIsRestoring(false);
      }),
    [],
  );

  useEffect(() => {
    async function restoreSession() {
      try {
        const storedSession =
          (await AsyncStorage.getItem(AUTH_STORAGE_KEY)) ??
          (await AsyncStorage.getItem(LEGACY_AUTH_STORAGE_KEY));
        if (!storedSession) {
          return;
        }

        const session = JSON.parse(storedSession) as AuthSession;
        if (!session?.token || !session?.user) {
          await removeStoredSession();
          return;
        }

        const userInfo = await getUserInfo(session.token);
        await persistSession(session.token, userInfo.user);
      } catch {
        await removeStoredSession();
        tokenRef.current = null;
        setToken(null);
        setUser(null);
      } finally {
        setIsRestoring(false);
      }
    }

    void restoreSession();
  }, []);

  const updateStoredUser = async (nextUser: AuthUser | null) => {
    const activeToken = tokenRef.current;
    if (!activeToken || !nextUser) {
      tokenRef.current = null;
      setToken(null);
      setUser(null);
      await removeStoredSession();
      return;
    }

    await persistSession(activeToken, nextUser);
  };

  const refreshUser = async () => {
    const activeToken = tokenRef.current;
    if (!activeToken) {
      return null;
    }

    const userInfo = await getUserInfo(activeToken);
    if (tokenRef.current !== activeToken) {
      return null;
    }
    await persistSession(activeToken, userInfo.user);
    return userInfo.user;
  };

  const setUserSession = async (session: AuthSession | null) => {
    if (!session) {
      tokenRef.current = null;
      setToken(null);
      setUser(null);
      await removeStoredSession();
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
