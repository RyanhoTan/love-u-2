import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { Navigate, Outlet } from "react-router-dom";
import { login } from "@/api/auth";
import { getUserInfo } from "@/api/user";
import { emptyAuthUser } from "./session-user";
import {
  readAuthSession,
  writeAuthSession,
  type AuthSession,
  type AuthUser,
} from "@/api/session";

type AuthContextValue = {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  profileStatus: "idle" | "loading" | "ready" | "error";
  profileError: string;
  signIn: (username: string, password: string) => Promise<void>;
  signOut: () => void;
  refreshProfile: () => Promise<AuthUser>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(readAuthSession);
  const [profileStatus, setProfileStatus] = useState<
    "idle" | "loading" | "ready" | "error"
  >(session ? "loading" : "idle");
  const [profileError, setProfileError] = useState("");

  const applySession = useCallback((next: AuthSession | null) => {
    writeAuthSession(next);
    setSession(next);
  }, []);

  const refreshProfile = useCallback(async () => {
    const token = readAuthSession()?.token;
    if (!token) {
      throw new Error("login required");
    }

    const response = await getUserInfo();
    const user = response.user;
    applySession({ token, user });
    setProfileError("");
    setProfileStatus("ready");
    return user;
  }, [applySession]);

  useEffect(() => {
    if (!session?.token) {
      setProfileStatus("idle");
      setProfileError("");
      return;
    }

    let active = true;
    setProfileStatus("loading");
    setProfileError("");

    void refreshProfile().catch((caught) => {
      if (!active) {
        return;
      }
      setProfileError(
        caught instanceof Error ? caught.message : "request failed",
      );
      setProfileStatus("error");
    });

    return () => {
      active = false;
    };
  }, [session?.token, refreshProfile]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user: session?.user ?? null,
      token: session?.token ?? null,
      isAuthenticated: Boolean(session),
      profileStatus,
      profileError,
      signIn: async (username: string, password: string) => {
        const response = await login(username, password);
        applySession({
          token: response.token,
          user: emptyAuthUser(response.user),
        });
      },
      signOut: () => {
        applySession(null);
        setProfileStatus("idle");
        setProfileError("");
      },
      refreshProfile,
    }),
    [session, profileStatus, profileError, applySession, refreshProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Context modules export both the provider and the consumer hook.
// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}

export function RequireAuth() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
