import { requestWithAuth } from "@/api/client";
import type { SchemaUser, SchemaUserInfoResponse } from "@/api/schemas";

export type UserProfile = SchemaUser;

export function getUserInfo() {
  return requestWithAuth<SchemaUserInfoResponse>("/userinfo", {
    method: "GET",
  });
}
