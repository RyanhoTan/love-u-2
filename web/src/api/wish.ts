import { requestWithAuth } from "@/api/client";
import { uploadMedia } from "@/api/upload";
import type {
  SchemaCreateWishRecordRequest,
  SchemaCreateWishRecordResponse,
  SchemaCreateWishRequest,
  SchemaUpdateWishRequest,
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

export function uploadWishMedia(file: File, folder = "album") {
  return uploadMedia(file, folder);
}
