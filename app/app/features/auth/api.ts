import { Platform } from "react-native";

export interface AuthUser {
  id: number;
  username: string;
}

interface RegisterResponse {
  message: string;
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
  return request<RegisterResponse>("/login/register", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
}
