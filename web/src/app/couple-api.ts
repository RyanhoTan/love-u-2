import { requestWithAuth } from "../lib/api";

export type CouplePartner = {
  id: number;
  username: string;
  nickname: string | null;
  avatar: string | null;
};

export type CoupleInvite = {
  code: string;
  status: string;
  expiresAt: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  usedAt: string | null;
};

export type CoupleRelationship = {
  id: number;
  status: string;
  anniversaryDate: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  unboundAt: string | null;
};

export type CoupleSpace = {
  isBound: boolean;
  partner: CouplePartner | null;
  relationship: CoupleRelationship | null;
  daysInLove: number | null;
  activeInvite: CoupleInvite | null;
};

type CoupleSpaceResponse = {
  message: string;
  coupleSpace: CoupleSpace;
};

type CoupleInviteResponse = {
  message: string;
  invite: CoupleInvite | null;
};

export type BindCouplePayload = {
  inviteCode: string;
};

export type UpdateCoupleSpacePayload = {
  anniversaryDate: string | null;
};

export type UserProfile = {
  id: number;
  username: string;
  nickname: string | null;
  avatar: string | null;
  signature: string | null;
};

type UserInfoResponse = {
  message: string;
  user: UserProfile;
};

export function getCoupleSpace() {
  return requestWithAuth<CoupleSpaceResponse>("/couple-space", {
    method: "GET",
  });
}

export function createCoupleInvite(options?: { regenerate?: boolean }) {
  return requestWithAuth<CoupleInviteResponse>("/couple-space/invite", {
    method: "POST",
    body: JSON.stringify({ regenerate: Boolean(options?.regenerate) }),
  });
}

export function bindCoupleSpace(payload: BindCouplePayload) {
  return requestWithAuth<CoupleSpaceResponse>("/couple-space/bind", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateCoupleSpace(payload: UpdateCoupleSpacePayload) {
  return requestWithAuth<CoupleSpaceResponse>("/couple-space", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function unbindCoupleSpace() {
  return requestWithAuth<{ message: string }>("/couple-space/bind", {
    method: "DELETE",
  });
}

export function getUserInfo() {
  return requestWithAuth<UserInfoResponse>("/userinfo", {
    method: "GET",
  });
}

export function displayName(user: {
  username: string;
  nickname: string | null;
}) {
  return user.nickname?.trim() || user.username;
}

export function formatAnniversaryDot(date: string | null | undefined) {
  if (!date) {
    return null;
  }

  return date.replace(/-/g, ".");
}

export function formatInviteExpiry(expiresAt: string | null) {
  if (!expiresAt) {
    return "邀请码有效";
  }

  const remainingMs = new Date(expiresAt).getTime() - Date.now();
  if (remainingMs <= 0) {
    return "已过期，请重新生成";
  }

  const minutes = Math.ceil(remainingMs / (1000 * 60));
  if (minutes < 60) {
    return `${minutes} 分钟内有效`;
  }

  const hours = Math.ceil(minutes / 60);
  return `${hours} 小时内有效`;
}

export function normalizeInviteCode(value: string) {
  return value.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
}
