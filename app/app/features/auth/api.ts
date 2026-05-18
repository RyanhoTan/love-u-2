import { Platform } from "react-native";

export interface AuthUser {
  id: number;
  username: string;
}

interface LoginResponse {
  token: string;
  user: AuthUser;
}

interface MeResponse {
  user: AuthUser;
}

const API_BASE_URL = Platform.select({
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

export async function login(username: string, password: string) {
  return request<LoginResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
}

export async function fetchCurrentUser(token: string) {
  return request<MeResponse>("/api/auth/me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}
