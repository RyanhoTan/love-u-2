import type { Request, Response } from "express";
import type { RowDataPacket } from "mysql2/promise";
import { getAuthenticatedUserId } from "../auth.js";
import { config } from "../config.js";
import db from "../db/index.js";
import { HttpError } from "../errors.js";
import { buildAlbumScope } from "./album.js";
import { createMediaReadUrl } from "./upload.js";

interface MediaAccessRow extends RowDataPacket {
  id: number;
  object_key: string | null;
  url: string;
}

function parseMediaId(value: string | string[] | undefined) {
  const rawValue = Array.isArray(value) ? value[0] : value;
  const id = Number(rawValue);

  if (!Number.isInteger(id) || id <= 0) {
    throw new HttpError(400, "invalid media id");
  }

  return id;
}

function getObjectKey(row: MediaAccessRow) {
  if (row.object_key?.trim()) {
    return row.object_key.trim();
  }

  // Support old rows while they are being migrated from a public URL to
  // object_key. New writes never use this fallback.
  if (!row.url?.trim()) {
    return null;
  }

  try {
    const legacyUrl = new URL(row.url);
    const configuredPublicUrl = new URL(config.r2PublicUrl);

    if (legacyUrl.origin !== configuredPublicUrl.origin) {
      return null;
    }

    const basePath = configuredPublicUrl.pathname.replace(/\/+$/, "");
    const objectPath = legacyUrl.pathname;

    if (basePath && basePath !== "/") {
      const prefix = `${basePath}/`;
      if (!objectPath.startsWith(prefix)) {
        return null;
      }

      return decodeURIComponent(objectPath.slice(prefix.length));
    }

    return decodeURIComponent(objectPath.replace(/^\/+/, ""));
  } catch {
    return null;
  }
}

export async function getMediaUrl(req: Request, res: Response) {
  const userId = getAuthenticatedUserId(req);
  const mediaId = parseMediaId(req.params.id);
  const scope = await buildAlbumScope(userId);

  const [rows] = await db.query<MediaAccessRow[]>(
    `
      SELECT id, object_key, url
      FROM album_media
      WHERE id = ?
        AND ${scope.sql}
      LIMIT 1
    `,
    [mediaId, ...scope.values],
  );

  const media = rows[0];
  if (!media) {
    throw new HttpError(404, "media not found");
  }

  const objectKey = getObjectKey(media);
  if (!objectKey) {
    throw new HttpError(404, "media object not found");
  }

  const expiresIn = 300;
  const url = await createMediaReadUrl(objectKey, expiresIn);

  res.setHeader("Cache-Control", "private, no-store");
  res.status(200).json({
    mediaId,
    url,
    expiresIn,
    expiresAt: new Date(Date.now() + expiresIn * 1000).toISOString(),
  });
}
