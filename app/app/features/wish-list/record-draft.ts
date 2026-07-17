import AsyncStorage from "@react-native-async-storage/async-storage";
import type { ImageProps } from "expo-image";
import * as FileSystem from "expo-file-system/legacy";
import { createVideoPlayer } from "expo-video";
import type { PickedMediaItem } from "@/hooks/use-media-picker";

const RECORD_DRAFT_DIR = `${FileSystem.cacheDirectory}wish-record-drafts/`;
const RECORD_DRAFT_KEY_PREFIX = "wish-record-draft:";

type StoredMediaItem = {
  id: string;
  uri: string;
  type: "image" | "video";
  width: number;
  height: number;
  duration?: number | null;
  fileName?: string | null;
  mimeType?: string;
  assetId?: string | null;
  fileSize?: number;
};

type WishRecordDraft = {
  text: string;
  selectedStatus: string | null;
  selectedLocation: {
    name: string;
    latitude: number;
    longitude: number;
  } | null;
  date: string;
  budget: string;
  selectedMedia: StoredMediaItem[];
};

function getDraftStorageKey(wishId: number) {
  return `${RECORD_DRAFT_KEY_PREFIX}${wishId}`;
}

function getFileExtension(uri: string, fallback: string) {
  const cleanUri = uri.split("?")[0]?.split("#")[0] ?? "";
  return cleanUri.split(".").pop()?.toLowerCase() || fallback;
}

function getMediaFileName(media: PickedMediaItem) {
  const extension = getFileExtension(
    media.fileName || media.uri,
    media.type === "video" ? "mp4" : "jpg",
  );
  return `${media.id.replace(/[^a-zA-Z0-9_-]/g, "-")}.${extension}`;
}

async function ensureDraftDirectory(wishId: number) {
  const dir = `${RECORD_DRAFT_DIR}${wishId}/`;
  await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
  return dir;
}

async function generateThumbnailForVideo(
  media: StoredMediaItem,
): Promise<PickedMediaItem> {
  const player = createVideoPlayer(media.uri);

  try {
    const [thumbnail] = await player.generateThumbnailsAsync(0.01);
    return {
      id: media.id,
      uri: media.uri,
      type: media.type,
      thumbnailSource: thumbnail as ImageProps["source"],
      width: media.width,
      height: media.height,
      duration: media.duration,
      fileName: media.fileName,
      mimeType: media.mimeType,
      assetId: media.assetId,
      fileSize: media.fileSize,
    };
  } finally {
    player.release();
  }
}

async function toPickedMediaItem(media: StoredMediaItem): Promise<PickedMediaItem> {
  if (media.type === "video") {
    return generateThumbnailForVideo(media);
  }

  return {
    id: media.id,
    uri: media.uri,
    type: media.type,
    width: media.width,
    height: media.height,
    duration: media.duration,
    fileName: media.fileName,
    mimeType: media.mimeType,
    assetId: media.assetId,
    fileSize: media.fileSize,
  };
}

async function copyPickedMedia(
  wishId: number,
  media: PickedMediaItem,
): Promise<StoredMediaItem> {
  const draftDir = await ensureDraftDirectory(wishId);

  if (media.uri.startsWith(draftDir)) {
    return {
      id: media.id,
      uri: media.uri,
      type: media.type,
      width: media.width,
      height: media.height,
      duration: media.duration,
      fileName: media.fileName,
      mimeType: media.mimeType,
      assetId: media.assetId,
      fileSize: media.fileSize,
    };
  }

  const mediaUri = `${draftDir}${getMediaFileName(media)}`;
  await FileSystem.copyAsync({ from: media.uri, to: mediaUri });

  return {
    id: media.id,
    uri: mediaUri,
    type: media.type,
    width: media.width,
    height: media.height,
    duration: media.duration,
    fileName: media.fileName,
    mimeType: media.mimeType,
    assetId: media.assetId,
    fileSize: media.fileSize,
  };
}

export async function loadWishRecordDraft(wishId: number) {
  const raw = await AsyncStorage.getItem(getDraftStorageKey(wishId));

  if (!raw) {
    return null;
  }

  const draft = JSON.parse(raw) as WishRecordDraft;
  await AsyncStorage.setItem(
    getDraftStorageKey(wishId),
    JSON.stringify({
      ...draft,
      selectedMedia: draft.selectedMedia,
    } satisfies WishRecordDraft),
  );

  return {
    ...draft,
    selectedMedia: await Promise.all(draft.selectedMedia.map(toPickedMediaItem)),
  };
}

export async function saveWishRecordDraft(
  wishId: number,
  draft: Omit<WishRecordDraft, "selectedMedia"> & {
    selectedMedia: PickedMediaItem[];
  },
) {
  const storedMedia = await Promise.all(
    draft.selectedMedia.map((media) => copyPickedMedia(wishId, media)),
  );

  await AsyncStorage.setItem(
    getDraftStorageKey(wishId),
    JSON.stringify({
      ...draft,
      selectedMedia: storedMedia,
    } satisfies WishRecordDraft),
  );

  return Promise.all(storedMedia.map(toPickedMediaItem));
}

export async function clearWishRecordDraft(wishId: number) {
  await AsyncStorage.removeItem(getDraftStorageKey(wishId));
  await FileSystem.deleteAsync(`${RECORD_DRAFT_DIR}${wishId}`, {
    idempotent: true,
  });
}
