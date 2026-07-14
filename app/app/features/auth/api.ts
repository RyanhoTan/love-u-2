import { request, requestWithAuth } from "@/app/shared/api-client";

export interface AuthUser {
  id: number;
  username: string;
  nickname: string | null;
  avatar: string | null;
  signature: string | null;
  birthday: string | null;
  gender: string | null;
  coupleStatus: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

interface RegisterResponse {
  message: string;
}

export interface LoginResponse {
  message: string;
  token: string;
  user: AuthSessionUser;
}

interface UserInfoResponse {
  message: string;
  user: AuthUser;
}

interface UpdateUserProfileResponse {
  message: string;
  user: AuthUser;
}

export type AuthSessionUser = Pick<AuthUser, "id" | "username"> | AuthUser;

export interface UpdateUserProfilePayload {
  nickname: string;
  avatar: string | null;
  signature: string;
  birthday: string;
}

export async function register(username: string, password: string) {
  return request<RegisterResponse>("/user/register", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
}

export async function login(username: string, password: string) {
  return request<LoginResponse>("/user/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
}

export async function getUserInfo(token?: string) {
  return requestWithAuth<UserInfoResponse>(
    "/userinfo",
    {
      method: "GET",
    },
    token,
  );
}

export async function updateUserProfile(
  payload: UpdateUserProfilePayload,
  token?: string,
) {
  return requestWithAuth<UpdateUserProfileResponse>(
    "/userinfo",
    {
      method: "PUT",
      body: JSON.stringify(payload),
    },
    token,
  );
}
