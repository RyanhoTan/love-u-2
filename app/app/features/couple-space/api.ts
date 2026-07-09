import { Platform } from "react-native";

export interface CouplePartner {
  id: number;
  username: string;
  nickname: string | null;
  avatar: string | null;
}

export interface CoupleInvite {
  code: string;
  status: string;
  expiresAt: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  usedAt: string | null;
}

export interface CoupleRelationship {
  id: number;
  status: string;
  anniversaryDate: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  unboundAt: string | null;
}

export interface CoupleSpace {
  isBound: boolean;
  partner: CouplePartner | null;
  relationship: CoupleRelationship | null;
  daysInLove: number | null;
  activeInvite: CoupleInvite | null;
}

interface CoupleSpaceResponse {
  message: string;
  coupleSpace: CoupleSpace;
}

interface CoupleInviteResponse {
  message: string;
  invite: CoupleInvite | null;
}

export interface BindCouplePayload {
  inviteCode: string;
}

export interface UpdateCoupleSpacePayload {
  anniversaryDate: string | null;
}

const envApiUrl = process.env.EXPO_PUBLIC_API_URL;

const API_BASE_URL =
  envApiUrl ||
  Platform.select({
    android: "http://10.0.2.2:3001",
    default: "http://localhost:3001",
  });

async function request<T>(path: string, init?: RequestInit) {
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

export async function getCoupleSpace(token: string) {
  return request<CoupleSpaceResponse>("/couple-space", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function createCoupleInvite(token: string) {
  return request<CoupleInviteResponse>("/couple-space/invite", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function bindCoupleSpace(
  token: string,
  payload: BindCouplePayload,
) {
  return request<CoupleSpaceResponse>("/couple-space/bind", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
}

export async function updateCoupleSpace(
  token: string,
  payload: UpdateCoupleSpacePayload,
) {
  return request<CoupleSpaceResponse>("/couple-space", {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
}

export async function unbindCoupleSpace(token: string) {
  return request<{ message: string }>("/couple-space/bind", {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}
