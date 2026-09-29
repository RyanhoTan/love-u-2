import { ApiError, API_BASE_URL } from "@/api/client";
import { invalidateAuthSession, readAuthSession } from "@/api/session";
import type { SchemaUploadMediaResponse } from "@/api/schemas";

export async function uploadMedia(file: File, folder = "album") {
  const token = readAuthSession()?.token;
  if (!token) {
    throw new Error("login required");
  }

  const response = await fetch(
    `${API_BASE_URL}/upload/media?folder=${encodeURIComponent(folder)}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": file.type || "application/octet-stream",
        "x-file-name": encodeURIComponent(file.name),
      },
      body: file,
    },
  );

  const data = (await response.json().catch(() => null)) as
    | SchemaUploadMediaResponse
    | { message?: string }
    | null;

  if (!response.ok) {
    const message =
      data && typeof data === "object" && "message" in data
        ? data.message
        : "upload failed";

    if (response.status === 401) {
      invalidateAuthSession(token);
    }

    throw new ApiError(message || "upload failed", response.status);
  }

  return data as SchemaUploadMediaResponse;
}
