import { Platform } from "react-native";
import {
  getStoredAuthToken,
  notifyAuthInvalidation,
  removeStoredAuthSessionIfTokenMatches,
} from "./auth-session";

const envApiUrl = process.env.EXPO_PUBLIC_API_URL;

export const API_BASE_URL =
  envApiUrl ||
  Platform.select({
    android: "http://10.0.2.2:3001",
    default: "http://localhost:3001",
  });

export class ApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

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
    throw new ApiError(message || "request failed", response.status);
  }

  return data as T;
}

export async function getAuthToken() {
  return getStoredAuthToken();
}

async function invalidateRejectedToken(token: string) {
  try {
    await removeStoredAuthSessionIfTokenMatches(token);
  } catch {
    // The provider still clears matching in-memory auth; restore validates storage later.
  }
  notifyAuthInvalidation(token);
}

export async function fetchWithAuth(
  path: string,
  init?: RequestInit,
  tokenOverride?: string,
) {
  const token = tokenOverride ?? (await getStoredAuthToken());

  if (!token) {
    throw new Error("login required");
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      ...init?.headers,
    },
  });

  if (response.status === 401) {
    await invalidateRejectedToken(token);
  }

  return response;
}

export async function requestWithAuth<T>(
  path: string,
  init?: RequestInit,
  tokenOverride?: string,
) {
  const token = tokenOverride ?? (await getStoredAuthToken());

  if (!token) {
    throw new Error("login required");
  }

  try {
    return await request<T>(path, {
      ...init,
      headers: {
        Authorization: `Bearer ${token}`,
        ...init?.headers,
      },
    });
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      await invalidateRejectedToken(token);
    }

    throw error;
  }
}
