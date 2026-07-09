import { Platform } from "react-native";

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

export async function getUserInfo(token: string) {
  return request<UserInfoResponse>("/userinfo", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function updateUserProfile(
  token: string,
  payload: UpdateUserProfilePayload,
) {
  return request<UpdateUserProfileResponse>("/userinfo", {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
}
