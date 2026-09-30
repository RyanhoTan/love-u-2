import { HttpError } from "../errors.js";

export const MAX_MEDIA_UPLOAD_BYTES = 100 * 1024 * 1024;

const albumExtensions: Record<string, string> = {
  "image/avif": "avif",
  "image/bmp": "bmp",
  "image/gif": "gif",
  "image/heic": "heic",
  "image/heif": "heif",
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "video/3gpp": "3gp",
  "video/3gpp2": "3g2",
  "video/mp4": "mp4",
  "video/quicktime": "mov",
  "video/webm": "webm",
  "video/x-m4v": "m4v",
};

const audioExtensions: Record<string, string> = {
  "audio/aac": "aac",
  "audio/mp4": "m4a",
  "audio/mpeg": "mp3",
  "audio/ogg": "ogg",
  "audio/wav": "wav",
  "audio/webm": "webm",
  "audio/wave": "wav",
  "audio/x-aac": "aac",
  "audio/x-m4a": "m4a",
  "audio/x-wav": "wav",
};

export interface MediaUploadPolicy {
  folder: "album" | "interact";
  contentType: string;
  extension: string;
}

/**
 * Validate the caller-declared upload metadata. This does not inspect file
 * signatures; a later content-sniffing phase may be needed for that guarantee.
 */
export function getMediaUploadPolicy(
  folder: string,
  declaredContentType: string,
  byteLength: number,
): MediaUploadPolicy {
  if (folder !== "album" && folder !== "interact") {
    throw new HttpError(400, "unsupported media folder");
  }

  if (!Number.isSafeInteger(byteLength) || byteLength <= 0) {
    throw new HttpError(400, "media upload body is empty or invalid");
  }

  if (byteLength > MAX_MEDIA_UPLOAD_BYTES) {
    throw new HttpError(413, "media upload exceeds 100 MiB limit");
  }

  const contentType = declaredContentType
    .split(";", 1)[0]
    .trim()
    .toLowerCase();
  const extensions = folder === "album" ? albumExtensions : audioExtensions;
  const extension = extensions[contentType];

  if (!extension) {
    throw new HttpError(415, "unsupported media type for folder");
  }

  return { folder, contentType, extension };
}
