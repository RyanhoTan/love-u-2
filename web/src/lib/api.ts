export const API_BASE_URL =
  import.meta.env.VITE_API_URL ?? "http://localhost:3001";

export const AUTH_STORAGE_KEY = "love-u-auth-session";

export type CoupleSummaryPartner = {
  id: number;
  username: string;
  nickname: string | null;
  avatar: string | null;
};

export type CoupleSummary = {
  isBound: boolean;
  daysInLove: number | null;
  anniversaryDate: string | null;
  partner: CoupleSummaryPartner | null;
};

export type AuthUser = {
  id: number;
  username: string;
  nickname: string | null;
  avatar: string | null;
  signature: string | null;
  couple: CoupleSummary;
};

export type AuthSession = {
  token: string;
  user: AuthUser;
};

export function emptyCoupleSummary(): CoupleSummary {
  return {
    isBound: false,
    daysInLove: null,
    anniversaryDate: null,
    partner: null,
  };
}

function normalizeAuthUser(raw: unknown): AuthUser | null {
  if (!raw || typeof raw !== "object") {
    return null;
  }

  const user = raw as Partial<AuthUser> & {
    couple?: Partial<CoupleSummary> | null;
  };

  if (
    typeof user.id !== "number" ||
    typeof user.username !== "string" ||
    !user.username
  ) {
    return null;
  }

  const partner = user.couple?.partner;
  const normalizedPartner =
    partner &&
    typeof partner.id === "number" &&
    typeof partner.username === "string"
      ? {
          id: partner.id,
          username: partner.username,
          nickname:
            typeof partner.nickname === "string" ? partner.nickname : null,
          avatar: typeof partner.avatar === "string" ? partner.avatar : null,
        }
      : null;

  return {
    id: user.id,
    username: user.username,
    nickname: typeof user.nickname === "string" ? user.nickname : null,
    avatar: typeof user.avatar === "string" ? user.avatar : null,
    signature: typeof user.signature === "string" ? user.signature : null,
    couple: {
      isBound: Boolean(user.couple?.isBound),
      daysInLove:
        typeof user.couple?.daysInLove === "number"
          ? user.couple.daysInLove
          : null,
      anniversaryDate:
        typeof user.couple?.anniversaryDate === "string"
          ? user.couple.anniversaryDate
          : null,
      partner: user.couple?.isBound ? normalizedPartner : null,
    },
  };
}

export function readAuthSession(): AuthSession | null {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) {
      return null;
    }

    const session = JSON.parse(raw) as { token?: unknown; user?: unknown };
    if (typeof session?.token !== "string" || !session.token) {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      return null;
    }

    const user = normalizeAuthUser(session.user);
    if (!user) {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      return null;
    }

    return { token: session.token, user };
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
