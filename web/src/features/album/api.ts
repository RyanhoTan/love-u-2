import { requestWithAuth } from "@/api/client";
import type {
  SchemaAlbumMedia,
  SchemaAlbumMediaListResponse,
} from "@/api/schemas";

export type AlbumMediaItem = SchemaAlbumMedia;

export function getAlbumMedia() {
  return requestWithAuth<SchemaAlbumMediaListResponse>("/album/media", {
    method: "GET",
  });
}
