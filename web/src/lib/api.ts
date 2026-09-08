export const API_BASE_URL =
  import.meta.env.VITE_API_URL ?? "http://localhost:3001";

export const AUTH_STORAGE_KEY = "love-u-auth-session";

export type AuthUser = {
  id: number;
  username: string;
};

export type AuthSession = {
  token: string;
  user: AuthUser;
};

export function readAuthSession(): AuthSession | null {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) {
      return null;
    }

    const session = JSON.parse(raw) as AuthSession;
    if (
      typeof session?.token !== "string" ||
      !session.token ||
      typeof session.user?.id !== "number" ||
      typeof session.user.username !== "string" ||
      !session.user.username
    ) {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      return null;
    }

    return session;
  } catch {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    return null;
  }
}

export function writeAuthSession(session: AuthSession | null) {
  if (!session) {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    return;
  }

  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
}

export async function request<T>(path: string, init?: RequestInit) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  const data = (await response.json().catch(() => null)) as
    | { message?: string }
    | T
    | null;

  if (!response.ok) {
    const message =
      data && typeof data === "object" && "message" in data
        ? data.message
        : "request failed";
    throw new Error(message || "request failed");
  }

  return data as T;
}

export async function requestWithAuth<T>(path: string, init?: RequestInit) {
  const token = readAuthSession()?.token;

  if (!token) {
    throw new Error("login required");
  }

  return request<T>(path, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      ...init?.headers,
    },
  });
}
