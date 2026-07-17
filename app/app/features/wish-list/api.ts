import {
  API_BASE_URL,
  getAuthToken,
  requestWithAuth,
} from "@/app/shared/api-client";

export type WishStatus = "todo" | "doing" | "done";

export interface WishItem {
  id: number;
  relationshipId: number | null;
  createdByUserId: number;
  title: string;
  description: string;
  cover: string;
  targetDate: string;
  locationName: string;
  latitude: number | null;
  longitude: number | null;
  budgetAmount: number | null;
  status: WishStatus;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  deleteExpiresAt: string | null;
  isDeleted: boolean;
}

export interface WishRecordItem {
  id: number;
  wishId: number;
  createdByUserId: number;
  content: string;
  recordDate: string;
  mood: string;
  locationName: string;
  latitude: number | null;
  longitude: number | null;
  budgetAmount: number | null;
  media: WishRecordMediaItem[];
  mediaUrls: string[];
  createdAt: string;
  updatedAt: string;
}

export interface WishRecordMediaItem {
  url: string;
  mediaType: "image" | "video";
  thumbnailUrl: string;
}

interface GetWishesResponse {
  message: string;
  wishes: WishItem[];
}

interface GetWishResponse {
  message: string;
  wish: WishItem;
}

interface CreateWishResponse {
  message: string;
  wish: WishItem;
}

interface UpdateWishResponse {
  message: string;
  wish: WishItem;
}

interface CreateWishRecordResponse {
  message: string;
  wish: WishItem;
  record: WishRecordItem;
}

interface UploadMediaResponse {
  key: string;
  url: string;
}

interface GetWishRecordsResponse {
  message: string;
  wish: WishItem;
  records: WishRecordItem[];
}

export interface CreateWishPayload {
  title: string;
  description: string;
  cover: string;
  targetDate: string;
  locationName: string;
  latitude: number | null;
  longitude: number | null;
  budgetAmount: number | null;
}

export interface UpdateWishPayload {
  status: WishStatus;
}

export interface CreateWishRecordPayload {
  content: string;
  recordDate: string;
  mood: string;
  locationName: string;
  latitude: number | null;
  longitude: number | null;
  budgetAmount: number | null;
  media: WishRecordMediaItem[];
}

export async function getWishes() {
  return requestWithAuth<GetWishesResponse>("/wishes", {
    method: "GET",
  });
}

export async function getDeletedWishes() {
  return requestWithAuth<GetWishesResponse>("/wishes/recycle", {
    method: "GET",
  });
}

export async function getWishById(id: number) {
  return requestWithAuth<GetWishResponse>(`/wishes/${id}`, {
    method: "GET",
  });
}

export async function createWish(payload: CreateWishPayload) {
  return requestWithAuth<CreateWishResponse>("/wishes", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateWish(id: number, payload: UpdateWishPayload) {
  return requestWithAuth<UpdateWishResponse>(`/wishes/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function deleteWish(id: number) {
  return requestWithAuth<UpdateWishResponse>(`/wishes/${id}`, {
    method: "DELETE",
  });
}

export async function restoreWish(id: number) {
  return requestWithAuth<UpdateWishResponse>(`/wishes/${id}/restore`, {
    method: "POST",
  });
}

export async function permanentlyDeleteWish(id: number) {
  return requestWithAuth<{ message: string }>(`/wishes/${id}/permanent`, {
    method: "DELETE",
  });
}

export async function getWishRecords(id: number) {
  return requestWithAuth<GetWishRecordsResponse>(`/wishes/${id}/records`, {
    method: "GET",
  });
}

export async function createWishRecord(
  id: number,
  payload: CreateWishRecordPayload,
) {
  return requestWithAuth<CreateWishRecordResponse>(`/wishes/${id}/records`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function uploadWishFile(
  uri: string,
  fileName: string,
  contentType: string,
) {
  const token = await getAuthToken();

  if (!token) {
    throw new Error("login required");
  }

  const fileResponse = await fetch(uri);
  const fileBlob = await fileResponse.blob();
  const response = await fetch(`${API_BASE_URL}/upload/media`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": contentType,
      "x-file-name": fileName,
    },
    body: fileBlob,
  });

  const data = (await response.json()) as UploadMediaResponse;

  if (!response.ok) {
    throw new Error("upload failed");
  }

  return data;
}
