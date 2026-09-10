import type { AuthUser, CoupleSummary } from "@/api/session";

export function emptyCoupleSummary(): CoupleSummary {
  return {
    isBound: false,
    daysInLove: null,
    anniversaryDate: null,
    partner: null,
  };
}

export function emptyAuthUser(partial: {
  id: number;
  username: string;
}): AuthUser {
  return {
    id: partial.id,
    username: partial.username,
    nickname: null,
    avatar: null,
    signature: null,
    birthday: null,
    gender: null,
    coupleStatus: null,
    couple: emptyCoupleSummary(),
    createdAt: null,
    updatedAt: null,
  };
}
