import { requestWithAuth } from "@/lib/api";

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
