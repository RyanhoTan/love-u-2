import { requestWithAuth } from "@/api/client";
import type {
  SchemaBindCoupleRequest,
  SchemaCoupleInviteResponse,
  SchemaCoupleSpaceResponse,
  SchemaCreateCoupleInviteRequest,
  SchemaMessageOnlyResponse,
  SchemaUpdateCoupleSpaceRequest,
} from "@/api/schemas";

export type {
  SchemaCoupleInvite as CoupleInvite,
  SchemaCoupleSpace as CoupleSpace,
  SchemaCoupleRelationship as CoupleRelationship,
  SchemaPartnerSummary as CouplePartner,
} from "@/api/schemas";

export function getCoupleSpace() {
  return requestWithAuth<SchemaCoupleSpaceResponse>("/couple-space", {
    method: "GET",
  });
}

export function createCoupleInvite(options?: SchemaCreateCoupleInviteRequest) {
  const body: SchemaCreateCoupleInviteRequest = {
    regenerate: Boolean(options?.regenerate),
  };
  return requestWithAuth<SchemaCoupleInviteResponse>("/couple-space/invite", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function bindCoupleSpace(payload: SchemaBindCoupleRequest) {
  return requestWithAuth<SchemaCoupleSpaceResponse>("/couple-space/bind", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateCoupleSpace(payload: SchemaUpdateCoupleSpaceRequest) {
  return requestWithAuth<SchemaCoupleSpaceResponse>("/couple-space", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function unbindCoupleSpace() {
  return requestWithAuth<SchemaMessageOnlyResponse>("/couple-space/bind", {
    method: "DELETE",
  });
}
