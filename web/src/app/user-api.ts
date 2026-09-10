import { requestWithAuth } from "@/lib/api";
import type { SchemaUser, SchemaUserInfoResponse } from "@/api/schemas";

export type UserProfile = SchemaUser;

export function getUserInfo() {
  return requestWithAuth<SchemaUserInfoResponse>("/userinfo", {
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
