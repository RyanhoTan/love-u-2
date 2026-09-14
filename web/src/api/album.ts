import { requestWithAuth } from "@/api/client";
import type {
  SchemaAlbumMediaItemResponse,
  SchemaAlbumMedia,
  SchemaAlbumMediaListResponse,
  SchemaCreateAlbumMediaRequest,
} from "@/api/schemas";

export type AlbumMediaItem = SchemaAlbumMedia;

export function getAlbumMedia() {
  return requestWithAuth<SchemaAlbumMediaListResponse>("/album/media", {
    method: "GET",
  });
}

export function createAlbumMedia(input: SchemaCreateAlbumMediaRequest) {
  return requestWithAuth<SchemaAlbumMediaItemResponse>("/album/media", {
    method: "POST",
    body: JSON.stringify(input),
  });
}
