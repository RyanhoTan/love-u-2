import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

const envApiUrl = process.env.EXPO_PUBLIC_API_URL;
const AUTH_STORAGE_KEY = "love-u-auth-session";

export const API_BASE_URL =
  envApiUrl ||
  Platform.select({
    android: "http://10.0.2.2:3001",
    default: "http://localhost:3001",
  });

export async function request<T>(path: string, init?: RequestInit) {
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

async function getStoredToken() {
  const storedSession = await AsyncStorage.getItem(AUTH_STORAGE_KEY);

  if (!storedSession) {
    return null;
  }

  try {
    const session = JSON.parse(storedSession) as { token?: unknown };
    return typeof session.token === "string" && session.token
      ? session.token
      : null;
  } catch {
    return null;
  }
}

export async function requestWithAuth<T>(
  path: string,
  init?: RequestInit,
  tokenOverride?: string,
) {
  const token = tokenOverride ?? (await getStoredToken());

  if (!token) {
    throw new Error("login required");
  }

  return request<T>(path, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      ...init?.headers,
    },
  });
}
