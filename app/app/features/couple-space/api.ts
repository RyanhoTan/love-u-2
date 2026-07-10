import { requestWithAuth } from "@/app/shared/api-client";

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

export async function getCoupleSpace() {
  return requestWithAuth<CoupleSpaceResponse>("/couple-space", {
    method: "GET",
  });
}

export async function createCoupleInvite() {
  return requestWithAuth<CoupleInviteResponse>("/couple-space/invite", {
    method: "POST",
  });
}

export async function bindCoupleSpace(payload: BindCouplePayload) {
  return requestWithAuth<CoupleSpaceResponse>("/couple-space/bind", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateCoupleSpace(payload: UpdateCoupleSpacePayload) {
  return requestWithAuth<CoupleSpaceResponse>("/couple-space", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function unbindCoupleSpace() {
  return requestWithAuth<{ message: string }>("/couple-space/bind", {
    method: "DELETE",
  });
}
