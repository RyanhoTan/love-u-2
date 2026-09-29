import { requestWithAuth } from "@/api/client";
import type {
  SchemaUpdateUserProfileRequest,
  SchemaUser,
  SchemaUserInfoResponse,
} from "@/api/schemas";

export type UserProfile = SchemaUser;

export function getUserInfo() {
  return requestWithAuth<SchemaUserInfoResponse>("/userinfo", {
    method: "GET",
  });
}

export function updateUserInfo(payload: SchemaUpdateUserProfileRequest) {
  return requestWithAuth<SchemaUserInfoResponse>("/userinfo", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}
