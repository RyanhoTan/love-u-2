import type { SchemaCoupleSummary, SchemaUser } from "@/api/schemas";

export const AUTH_STORAGE_KEY = "love-u-auth-session";

export type AuthUser = SchemaUser;
export type CoupleSummary = SchemaCoupleSummary;

export type AuthSession = {
  token: string;
  user: AuthUser;
};

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
    birthday: typeof user.birthday === "string" ? user.birthday : null,
    gender: typeof user.gender === "string" ? user.gender : null,
    coupleStatus:
      typeof user.coupleStatus === "string" ? user.coupleStatus : null,
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
    createdAt: typeof user.createdAt === "string" ? user.createdAt : null,
    updatedAt: typeof user.updatedAt === "string" ? user.updatedAt : null,
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
