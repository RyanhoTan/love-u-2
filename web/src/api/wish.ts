import { API_BASE_URL, requestWithAuth } from "@/api/client";
import { readAuthSession } from "@/api/session";
import type {
  SchemaCreateWishRecordRequest,
  SchemaCreateWishRecordResponse,
  SchemaCreateWishRequest,
  SchemaUpdateWishRequest,
  SchemaUploadMediaResponse,
  SchemaWish,
  SchemaWishItemResponse,
  SchemaWishListResponse,
  SchemaWishRecordsResponse,
  SchemaWishStatus,
} from "@/api/schemas";

export type WishStatus = SchemaWishStatus;
export type WishItem = SchemaWish;
export type CreateWishPayload = SchemaCreateWishRequest;
export type UpdateWishPayload = SchemaUpdateWishRequest;
export type CreateWishRecordPayload = SchemaCreateWishRecordRequest;

export function getWishes() {
  return requestWithAuth<SchemaWishListResponse>("/wishes", {
    method: "GET",
  });
}

export function getWishById(id: number) {
  return requestWithAuth<SchemaWishItemResponse>(`/wishes/${id}`, {
    method: "GET",
  });
}

export function createWish(payload: CreateWishPayload) {
  return requestWithAuth<SchemaWishItemResponse>("/wishes", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateWish(id: number, payload: UpdateWishPayload) {
  return requestWithAuth<SchemaWishItemResponse>(`/wishes/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function getWishRecords(id: number) {
  return requestWithAuth<SchemaWishRecordsResponse>(`/wishes/${id}/records`, {
    method: "GET",
  });
}

export function createWishRecord(id: number, payload: CreateWishRecordPayload) {
  return requestWithAuth<SchemaCreateWishRecordResponse>(
    `/wishes/${id}/records`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}

export async function uploadWishMedia(file: File, folder = "album") {
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
        "x-file-name": file.name,
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
    throw new Error(message || "upload failed");
  }

  return data as SchemaUploadMediaResponse;
}
