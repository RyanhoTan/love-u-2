import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { fetchCurrentUser, login, type AuthUser } from "./api";

type AuthStatus = "loading" | "authenticated" | "unauthenticated";
const AUTH_TOKEN_STORAGE_KEY = "auth-token";

interface AuthContextValue {
  status: AuthStatus;
  token: string | null;
  user: AuthUser | null;
  isRestoring: boolean;
  isAuthenticated: boolean;
  signIn: (username: string, password: string) => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>("unauthenticated");
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isRestoring, setIsRestoring] = useState(true);

  useEffect(() => {
    let isActive = true;

    const restoreSession = async () => {
      try {
        const storedToken = await AsyncStorage.getItem(AUTH_TOKEN_STORAGE_KEY);

        if (!storedToken) {
          if (!isActive) {
            return;
          }

          setToken(null);
          setUser(null);
          setStatus("unauthenticated");
          return;
        }

        const me = await fetchCurrentUser(storedToken);

        if (!isActive) {
          return;
        }

        setToken(storedToken);
        setUser(me.user);
        setStatus("authenticated");
      } catch {
        await AsyncStorage.removeItem(AUTH_TOKEN_STORAGE_KEY).catch(
          () => undefined,
        );

        if (!isActive) {
          return;
        }

        setToken(null);
        setUser(null);
        setStatus("unauthenticated");
      } finally {
        if (isActive) {
          setIsRestoring(false);
        }
      }
    };

    void restoreSession();

    return () => {
      isActive = false;
    };
  }, []);

  const signIn = async (username: string, password: string) => {
    setStatus("loading");

    try {
      const auth = await login(username, password);
      const me = await fetchCurrentUser(auth.token);
      await AsyncStorage.setItem(AUTH_TOKEN_STORAGE_KEY, auth.token);

      setToken(auth.token);
      setUser(me.user);
      setStatus("authenticated");
    } catch (error) {
      await AsyncStorage.removeItem(AUTH_TOKEN_STORAGE_KEY).catch(
        () => undefined,
      );
      setToken(null);
      setUser(null);
      setStatus("unauthenticated");
      throw error;
    }
  };

  const signOut = () => {
    void AsyncStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
    setToken(null);
    setUser(null);
    setStatus("unauthenticated");
  };

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      token,
      user,
      isRestoring,
      isAuthenticated: status === "authenticated",
      signIn,
      signOut,
    }),
    [isRestoring, status, token, user],
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
