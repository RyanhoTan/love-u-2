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

interface GetAlbumMediaResponse {
  message: string;
  media: AlbumMediaItem[];
}

export async function getAlbumMedia() {
  return requestWithAuth<GetAlbumMediaResponse>("/album/media", {
    method: "GET",
  });
}
