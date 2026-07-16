import { requestWithAuth } from "@/app/shared/api-client";

export type AlbumMediaType = "image" | "video";
export type AlbumMediaSourceType = "wish_record" | "story" | "upload";

export interface AlbumMediaItem {
  id: number;
  relationshipId: number | null;
  createdByUserId: number;
  mediaType: AlbumMediaType;
  sourceType: AlbumMediaSourceType;
  sourceId: number | null;
  url: string;
  thumbnailUrl: string;
  takenAt: string;
  locationName: string;
  latitude: number | null;
  longitude: number | null;
  uploadedAt: string;
  createdAt: string;
}

export interface AlbumStory {
  id: number;
  relationshipId: number | null;
  createdByUserId: number;
  title: string;
  description: string;
  coverMediaId: number | null;
  coverUrl: string;
  coverThumbnailUrl: string;
  photos: number;
  videos: number;
  createdAt: string;
  updatedAt: string;
}

interface GetAlbumMediaResponse {
  message: string;
  media: AlbumMediaItem[];
}

interface GetAlbumStoriesResponse {
  message: string;
  stories: AlbumStory[];
}

interface GetAlbumStoryResponse {
  message: string;
  story: AlbumStory;
  media: AlbumMediaItem[];
}

export interface CreateAlbumMediaPayload {
  mediaType: AlbumMediaType;
  url: string;
  thumbnailUrl?: string;
  takenAt?: string;
  locationName?: string;
  latitude?: number | null;
  longitude?: number | null;
}

export interface CreateAlbumStoryPayload {
  title: string;
  description?: string;
  media: CreateAlbumMediaPayload[];
}

interface CreateAlbumMediaResponse {
  message: string;
  media: AlbumMediaItem;
}

interface CreateAlbumStoryResponse {
  message: string;
  story: AlbumStory;
}

export async function getAlbumMedia() {
  return requestWithAuth<GetAlbumMediaResponse>("/album/media", {
    method: "GET",
  });
}

export async function createAlbumMedia(payload: CreateAlbumMediaPayload) {
  return requestWithAuth<CreateAlbumMediaResponse>("/album/media", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getAlbumStories() {
  return requestWithAuth<GetAlbumStoriesResponse>("/album/stories", {
    method: "GET",
  });
}

export async function getAlbumStory(id: number) {
  return requestWithAuth<GetAlbumStoryResponse>(`/album/stories/${id}`, {
    method: "GET",
  });
}

export async function createAlbumStory(payload: CreateAlbumStoryPayload) {
  return requestWithAuth<CreateAlbumStoryResponse>("/album/stories", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
