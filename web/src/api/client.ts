import { invalidateAuthSession, readAuthSession } from "@/api/session";

export const API_BASE_URL =
  import.meta.env.VITE_API_URL ?? "http://localhost:3001";

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

export async function requestWithAuth<T>(path: string, init?: RequestInit) {
  const token = readAuthSession()?.token;

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
      invalidateAuthSession(token);
    }

    throw error;
  }
}
