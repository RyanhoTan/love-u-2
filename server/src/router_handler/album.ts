import type { Request, Response } from "express";
import type { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { getAuthenticatedUserId } from "../auth.js";
import db from "../db/index.js";
import { createAlbumMediaSchema } from "../schema/album.js";
import { parseRequestBody } from "../validation.js";

interface CoupleRelationshipRow extends RowDataPacket {
  id: number;
  user_a_id: number;
  user_b_id: number;
}

interface TableNameRow extends RowDataPacket {
  TABLE_NAME: string;
}

interface ColumnNameRow extends RowDataPacket {
  COLUMN_NAME: string;
}

interface AlbumMediaRow extends RowDataPacket {
  id: number;
  relationship_id: number | null;
  created_by_user_id: number;
  media_type: "image" | "video";
  source_type: "wish_record" | "story" | "upload";
  source_id: number | null;
  url: string;
  thumbnail_url: string | null;
  taken_at: Date | string | null;
  location_name: string | null;
  latitude: number | string | null;
  longitude: number | string | null;
  created_at: Date | string;
}

interface LegacyWishRecordMediaRow extends RowDataPacket {
  id: number;
  relationship_id: number | null;
  created_by_user_id: number;
  media_urls: string[] | string | null;
  record_date: Date | string;
  created_at: Date | string;
}

interface SerializedAlbumMedia {
  id: number;
  relationshipId: number | null;
  createdByUserId: number;
  mediaType: "image" | "video";
  sourceType: "wish_record" | "story" | "upload";
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

function formatDateOnly(value: Date | string | null) {
  if (!value) {
    return "";
  }

  if (typeof value === "string") {
    return value.slice(0, 10);
  }

  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDateTime(value: Date | string) {
  if (typeof value === "string") {
    return new Date(value).toISOString();
  }

  return value.toISOString();
}

function serializeAlbumMedia(row: AlbumMediaRow): SerializedAlbumMedia {
  return {
    id: row.id,
    relationshipId: row.relationship_id,
    createdByUserId: row.created_by_user_id,
    mediaType: row.media_type,
    sourceType: row.source_type,
    sourceId: row.source_id,
    url: row.url,
    thumbnailUrl: row.thumbnail_url || "",
    takenAt: formatDateOnly(row.taken_at),
    locationName: row.location_name || "",
    latitude: row.latitude === null ? null : Number(row.latitude),
    longitude: row.longitude === null ? null : Number(row.longitude),
    uploadedAt: formatDateTime(row.created_at),
    createdAt: formatDateTime(row.created_at),
  };
}

function parseLegacyMediaUrls(row: LegacyWishRecordMediaRow) {
  if (!row.media_urls) {
    return [];
  }

  if (Array.isArray(row.media_urls)) {
    return row.media_urls.filter(
      (item): item is string => typeof item === "string",
    );
  }

  try {
    const parsed = JSON.parse(row.media_urls) as unknown;
    if (Array.isArray(parsed)) {
      return parsed.filter((item): item is string => typeof item === "string");
    }
  } catch {
    return [];
  }

  return [];
}

function inferMediaType(url: string): "image" | "video" {
  return /\.(mp4|mov|m4v|webm|avi|mkv)$/i.test(url) ? "video" : "image";
}

async function findActiveRelationshipByUserId(userId: number) {
  const [rows] = await db.query<CoupleRelationshipRow[]>(
    `
      SELECT id
        , user_a_id
        , user_b_id
      FROM couple_relationships
      WHERE status = 'bound'
        AND (user_a_id = ? OR user_b_id = ?)
      LIMIT 1
    `,
    [userId, userId],
  );

  return rows[0] ?? null;
}

async function hasTable(tableName: string) {
  const [rows] = await db.query<TableNameRow[]>(
    `
      SELECT TABLE_NAME
      FROM INFORMATION_SCHEMA.TABLES
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = ?
      LIMIT 1
    `,
    [tableName],
  );

  return rows.length > 0;
}

async function hasColumn(tableName: string, columnName: string) {
  const [rows] = await db.query<ColumnNameRow[]>(
    `
      SELECT COLUMN_NAME
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = ?
        AND COLUMN_NAME = ?
      LIMIT 1
    `,
    [tableName, columnName],
  );

  return rows.length > 0;
}

async function buildAlbumScope(userId: number) {
  const relationship = await findActiveRelationshipByUserId(userId);

  if (relationship) {
    return {
      sql: "(relationship_id = ? OR created_by_user_id IN (?, ?))",
      values: [relationship.id, relationship.user_a_id, relationship.user_b_id],
      relationshipId: relationship.id,
    };
  }

  return {
    sql: "(created_by_user_id = ?)",
    values: [userId],
    relationshipId: null,
  };
}

export async function getAlbumMedia(req: Request, res: Response) {
  const userId = getAuthenticatedUserId(req);
  const scope = await buildAlbumScope(userId);
  const media: SerializedAlbumMedia[] = [];

  if (await hasTable("album_media")) {
    const [rows] = await db.query<AlbumMediaRow[]>(
      `
        SELECT
          id,
          relationship_id,
          created_by_user_id,
          media_type,
          source_type,
          source_id,
          url,
          thumbnail_url,
          taken_at,
          location_name,
          latitude,
          longitude,
          created_at
        FROM album_media
        WHERE ${scope.sql}
      `,
      scope.values,
    );

    media.push(...rows.map(serializeAlbumMedia));
  }

  if (
    (await hasTable("wish_records")) &&
    (await hasColumn("wish_records", "media_urls"))
  ) {
    const [legacyRows] = await db.query<LegacyWishRecordMediaRow[]>(
      `
        SELECT
          wr.id,
          w.relationship_id,
          wr.created_by_user_id,
          wr.media_urls,
          wr.record_date,
          wr.created_at
        FROM wish_records wr
        INNER JOIN wishes w ON w.id = wr.wish_id
        WHERE ${scope.sql.replaceAll("relationship_id", "w.relationship_id").replaceAll("created_by_user_id", "wr.created_by_user_id")}
          AND wr.media_urls IS NOT NULL
      `,
      scope.values,
    );

    const existingLegacyMedia = new Set(
      media
        .filter((item) => item.sourceType === "wish_record")
        .map((item) => `${item.sourceId}:${item.url}`),
    );

    for (const row of legacyRows) {
      parseLegacyMediaUrls(row).forEach((url, index) => {
        const key = `${row.id}:${url}`;

        if (existingLegacyMedia.has(key)) {
          return;
        }

        media.push({
          id: -(row.id * 1000 + index + 1),
          relationshipId: row.relationship_id,
          createdByUserId: row.created_by_user_id,
          mediaType: inferMediaType(url),
          sourceType: "wish_record",
          sourceId: row.id,
          url,
          thumbnailUrl: "",
          takenAt: formatDateOnly(row.record_date),
          locationName: "",
          latitude: null,
          longitude: null,
          uploadedAt: formatDateTime(row.created_at),
          createdAt: formatDateTime(row.created_at),
        });
      });
    }
  }

  media.sort((first, second) => {
    const byUploadedAt =
      new Date(second.uploadedAt).getTime() - new Date(first.uploadedAt).getTime();

    if (byUploadedAt !== 0) {
      return byUploadedAt;
    }

    return second.id - first.id;
  });

  res.status(200).json({
    message: "get album media success",
    media,
  });
}

export async function createAlbumMedia(req: Request, res: Response) {
  const userId = getAuthenticatedUserId(req);
  const payload = parseRequestBody(createAlbumMediaSchema, req.body);
  const scope = await buildAlbumScope(userId);

  const [result] = await db.query<ResultSetHeader>(
    `
      INSERT INTO album_media (
        relationship_id,
        created_by_user_id,
        media_type,
        source_type,
        source_id,
        url,
        thumbnail_url,
        taken_at,
        location_name,
        latitude,
        longitude
      )
      VALUES (?, ?, ?, 'upload', NULL, ?, ?, ?, ?, ?, ?)
    `,
    [
      scope.relationshipId,
      userId,
      payload.mediaType,
      payload.url,
      payload.thumbnailUrl || null,
      payload.takenAt || null,
      payload.locationName || null,
      payload.latitude,
      payload.longitude,
    ],
  );

  const [rows] = await db.query<AlbumMediaRow[]>(
    `
      SELECT
        id,
        relationship_id,
        created_by_user_id,
        media_type,
        source_type,
        source_id,
        url,
        thumbnail_url,
        taken_at,
        location_name,
        latitude,
        longitude,
        created_at
      FROM album_media
      WHERE id = ?
      LIMIT 1
    `,
    [result.insertId],
  );

  res.status(201).json({
    message: "create album media success",
    media: serializeAlbumMedia(rows[0]),
  });
}
