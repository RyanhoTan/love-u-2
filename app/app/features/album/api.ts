import {
  API_BASE_URL,
  getAuthToken,
  requestWithAuth,
} from "@/app/shared/api-client";

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
  isFavorite: boolean;
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

interface GetFavoriteAlbumStoriesResponse {
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

interface UploadMediaResponse {
  key: string;
  url: string;
}

interface UpdateAlbumStoryFavoriteResponse {
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

export async function getFavoriteAlbumStories() {
  return requestWithAuth<GetFavoriteAlbumStoriesResponse>(
    "/album/stories/favorites",
    {
      method: "GET",
    },
  );
}

export async function getFavoriteAlbumMedia() {
  const [storyResponse, mediaResponse] = await Promise.all([
    getFavoriteAlbumStories(),
    getAlbumMedia(),
  ]);
  const favoriteStoryIds = new Set(
    storyResponse.stories.map((story) => story.id),
  );

  return mediaResponse.media.filter(
    (media) =>
      media.sourceType === "story" &&
      media.sourceId !== null &&
      favoriteStoryIds.has(media.sourceId),
  );
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

export async function uploadAlbumFile(
  uri: string,
  fileName: string,
  contentType: string,
  folder: string,
) {
  const token = await getAuthToken();

  if (!token) {
    throw new Error("login required");
  }

  const fileResponse = await fetch(uri);
  const fileBlob = await fileResponse.blob();
  const response = await fetch(
    `${API_BASE_URL}/upload/media?folder=${encodeURIComponent(folder)}`,
    {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": contentType,
      "x-file-name": fileName,
    },
    body: fileBlob,
    },
  );

  const data = (await response.json()) as UploadMediaResponse;

  if (!response.ok) {
    throw new Error("upload failed");
  }

  return data;
}

export async function updateAlbumStoryFavorite(
  id: number,
  isFavorite: boolean,
) {
  return requestWithAuth<UpdateAlbumStoryFavoriteResponse>(
    `/album/stories/${id}/favorite`,
    {
      method: "POST",
      body: JSON.stringify({ isFavorite }),
    },
  );
}
