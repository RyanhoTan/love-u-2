import { requestWithAuth } from "@/app/shared/api-client";

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
  isSeed: boolean;
  createdAt: string;
  updatedAt: string;
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
  mediaUrls: string[];
  createdAt: string;
  updatedAt: string;
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

interface CreateWishRecordResponse {
  message: string;
  wish: WishItem;
  record: WishRecordItem;
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

export interface CreateWishRecordPayload {
  content: string;
  recordDate: string;
  mood: string;
  locationName: string;
  latitude: number | null;
  longitude: number | null;
  budgetAmount: number | null;
  mediaUrls: string[];
}

export async function getWishes() {
  return requestWithAuth<GetWishesResponse>("/wishes", {
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
