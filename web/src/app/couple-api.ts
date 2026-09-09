import { requestWithAuth } from "@/lib/api";
import type { CoupleInvite, CoupleSpace } from "@/pages/couple-page/types";

type CoupleSpaceResponse = {
  message: string;
  coupleSpace: CoupleSpace;
};

type CoupleInviteResponse = {
  message: string;
  invite: CoupleInvite | null;
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

export function bindCoupleSpace(payload: { inviteCode: string }) {
  return requestWithAuth<CoupleSpaceResponse>("/couple-space/bind", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateCoupleSpace(payload: { anniversaryDate: string | null }) {
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
