import { useQuery } from "@tanstack/react-query";
import { getAlbumMedia } from "@/api/album";

export const albumKeys = {
  media: ["album", "media"] as const,
};

export function useAlbumMediaQuery() {
  return useQuery({
    queryKey: albumKeys.media,
    queryFn: getAlbumMedia,
  });
}

export function errorMessage(error: unknown, fallback = "request failed") {
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return fallback;
}
