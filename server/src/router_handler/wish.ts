import { execFile } from "node:child_process";
import { randomUUID } from "node:crypto";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import type { Request, Response } from "express";
import type { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { getAuthenticatedUserId } from "../auth.js";
import db from "../db/index.js";
import { HttpError } from "../errors.js";
import {
  createWishRecordSchema,
  createWishSchema,
  updateWishSchema,
  type WishStatus,
} from "../schema/wish.js";
import { parseRequestBody } from "../validation.js";
import { uploadMediaBuffer } from "./upload.js";

const WISH_RETENTION_DAYS = 30;
const WISH_CLEANUP_INTERVAL_MS = 24 * 60 * 60 * 1000;
const execFileAsync = promisify(execFile);
const require = createRequire(import.meta.url);
const ffmpegPath = require("ffmpeg-static") as string | null;

type WishRecordMediaPayload = {
  url: string;
  mediaType: "image" | "video";
  thumbnailUrl: string;
};

interface CoupleRelationshipRow extends RowDataPacket {
  id: number;
}

interface TableNameRow extends RowDataPacket {
  TABLE_NAME: string;
}

interface ColumnNameRow extends RowDataPacket {
  COLUMN_NAME: string;
}

interface WishRow extends RowDataPacket {
  id: number;
  relationship_id: number | null;
  created_by_user_id: number;
  title: string;
  description: string | null;
  cover: string | null;
  target_date: Date | string;
  location_name: string | null;
  latitude: number | string | null;
  longitude: number | string | null;
  budget_amount: number | null;
  status: WishStatus;
  created_at: Date | string;
  updated_at: Date | string;
  deleted_at: Date | string | null;
  delete_expires_at: Date | string | null;
}

interface WishRecordRow extends RowDataPacket {
  id: number;
  wish_id: number;
  created_by_user_id: number;
  content: string | null;
  record_date: Date | string;
  mood: string | null;
  location_name: string | null;
  latitude: number | string | null;
  longitude: number | string | null;
  budget_amount: number | null;
  created_at: Date | string;
  updated_at: Date | string;
}

interface WishRecordMediaRow extends RowDataPacket {
  source_id: number;
  url: string;
  media_type: "image" | "video";
  thumbnail_url: string | null;
}

function formatDateOnly(value: Date | string) {
  if (typeof value === "string") {
    return value.slice(0, 10);
  }

  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDateTime(value: Date | string | null) {
  if (!value) {
    return null;
  }

  if (typeof value === "string") {
    return new Date(value).toISOString();
  }

  return value.toISOString();
}

function serializeWish(row: WishRow) {
  return {
    id: row.id,
    relationshipId: row.relationship_id,
    createdByUserId: row.created_by_user_id,
    title: row.title,
    description: row.description || "",
    cover: row.cover || "",
    targetDate: formatDateOnly(row.target_date),
    locationName: row.location_name || "",
    latitude: row.latitude === null ? null : Number(row.latitude),
    longitude: row.longitude === null ? null : Number(row.longitude),
    budgetAmount: row.budget_amount,
    status: row.status,
    createdAt: formatDateTime(row.created_at),
    updatedAt: formatDateTime(row.updated_at),
    deletedAt: formatDateTime(row.deleted_at),
    deleteExpiresAt: formatDateTime(row.delete_expires_at),
    isDeleted: row.deleted_at !== null,
  };
}

function serializeWishRecord(
  row: WishRecordRow,
  media: { url: string; mediaType: "image" | "video"; thumbnailUrl: string }[] = [],
) {
  return {
    id: row.id,
    wishId: row.wish_id,
    createdByUserId: row.created_by_user_id,
    content: row.content || "",
    recordDate: formatDateOnly(row.record_date),
    mood: row.mood || "",
    locationName: row.location_name || "",
    latitude: row.latitude === null ? null : Number(row.latitude),
    longitude: row.longitude === null ? null : Number(row.longitude),
    budgetAmount: row.budget_amount,
    media,
    createdAt: formatDateTime(row.created_at),
    updatedAt: formatDateTime(row.updated_at),
  };
}

async function findActiveRelationshipByUserId(userId: number) {
  const [rows] = await db.query<CoupleRelationshipRow[]>(
    `
      SELECT id
      FROM couple_relationships
      WHERE status = 'bound'
        AND (user_a_id = ? OR user_b_id = ?)
      LIMIT 1
    `,
    [userId, userId]
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
    [tableName]
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
    [tableName, columnName]
  );

  return rows.length > 0;
}

async function assertWishSoftDeleteColumnsReady() {
  if (!(await hasTable("wishes"))) {
    throw new HttpError(500, "wishes table not found");
  }

  const hasDeletedAt = await hasColumn("wishes", "deleted_at");
  const hasDeleteExpiresAt = await hasColumn("wishes", "delete_expires_at");

  if (!hasDeletedAt || !hasDeleteExpiresAt) {
    throw new HttpError(
      500,
      "wish soft delete columns are missing: deleted_at, delete_expires_at"
    );
  }
}

async function getWishRecordMedia(recordIds: number[]) {
  if (!recordIds.length || !(await hasTable("album_media"))) {
    return new Map<number, { url: string; mediaType: "image" | "video"; thumbnailUrl: string }[]>();
  }

  const [rows] = await db.query<WishRecordMediaRow[]>(
    `
      SELECT source_id, url, media_type, thumbnail_url
      FROM album_media
      WHERE source_type = 'wish_record'
        AND source_id IN (?)
      ORDER BY id ASC
    `,
    [recordIds]
  );

  const mediaByRecord = new Map<
    number,
    { url: string; mediaType: "image" | "video"; thumbnailUrl: string }[]
  >();
  for (const row of rows) {
    const media = mediaByRecord.get(row.source_id) ?? [];
    media.push({
      url: row.url,
      mediaType: row.media_type,
      thumbnailUrl: row.thumbnail_url || "",
    });
    mediaByRecord.set(row.source_id, media);
  }

  return mediaByRecord;
}

async function createWishRecordMedia(
  wish: WishRow,
  recordId: number,
  userId: number,
  media: WishRecordMediaPayload[]
) {
  if (!media.length) {
    return;
  }

  if (!(await hasTable("album_media"))) {
    throw new HttpError(500, "album media table not found");
  }

  const values = media.map((item) => [
    wish.relationship_id,
    userId,
    item.mediaType,
    "wish_record",
    recordId,
    item.url,
    item.thumbnailUrl || null,
    formatDateOnly(wish.target_date),
    wish.location_name,
    wish.latitude,
    wish.longitude,
  ]);

  await db.query<ResultSetHeader>(
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
      VALUES ?
    `,
    [values]
  );
}

async function generateVideoThumbnailUrl(userId: number, videoUrl: string) {
  if (!ffmpegPath) {
    throw new HttpError(500, "ffmpeg is not available");
  }

  const dir = await mkdtemp(path.join(tmpdir(), "wish-thumbnail-"));
  const thumbnailPath = path.join(dir, `${randomUUID()}.jpg`);

  try {
    await execFileAsync(ffmpegPath, [
      "-y",
      "-ss",
      "0",
      "-i",
      videoUrl,
      "-frames:v",
      "1",
      "-q:v",
      "2",
      thumbnailPath,
    ]);
    const thumbnail = await readFile(thumbnailPath);
    const result = await uploadMediaBuffer(
      userId,
      `${randomUUID()}-thumbnail.jpg`,
      "image/jpeg",
      thumbnail,
    );
    return result.url;
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

async function createWishRecordThumbnails(
  userId: number,
  media: WishRecordMediaPayload[],
) {
  const result: WishRecordMediaPayload[] = [];

  for (const item of media) {
    result.push(
      item.mediaType === "video"
        ? {
            ...item,
            thumbnailUrl: await generateVideoThumbnailUrl(userId, item.url),
          }
        : item,
    );
  }

  return result;
}

async function buildWishScope(userId: number) {
  const relationship = await findActiveRelationshipByUserId(userId);

  if (relationship) {
    return {
      sql: "(relationship_id = ?)",
      values: [relationship.id],
      relationshipId: relationship.id,
    };
  }

  return {
    sql: "(created_by_user_id = ?)",
    values: [userId],
    relationshipId: null,
  };
}

const wishSelectFields = `
  id,
  relationship_id,
  created_by_user_id,
  title,
  description,
  cover,
  target_date,
  location_name,
  latitude,
  longitude,
  budget_amount,
  status,
  created_at,
  updated_at,
  deleted_at,
  delete_expires_at
`;

async function findWishById(
  userId: number,
  wishId: number,
  options?: { includeDeleted?: boolean }
) {
  await assertWishSoftDeleteColumnsReady();

  const scope = await buildWishScope(userId);
  const deletedClause = options?.includeDeleted
    ? ""
    : "AND deleted_at IS NULL";

  const [rows] = await db.query<WishRow[]>(
    `
      SELECT
        ${wishSelectFields}
      FROM wishes
      WHERE id = ?
        AND ${scope.sql}
        ${deletedClause}
      LIMIT 1
    `,
    [wishId, ...scope.values]
  );

  return rows[0] ?? null;
}

export async function getWishes(req: Request, res: Response) {
  const userId = getAuthenticatedUserId(req);

  await assertWishSoftDeleteColumnsReady();
  const scope = await buildWishScope(userId);
  const [rows] = await db.query<WishRow[]>(
    `
      SELECT
        ${wishSelectFields}
      FROM wishes
      WHERE ${scope.sql}
        AND deleted_at IS NULL
      ORDER BY
        FIELD(status, 'todo', 'doing', 'done'),
        target_date ASC,
        id ASC
    `,
    scope.values
  );

  res.status(200).json({
    message: "get wishes success",
    wishes: rows.map(serializeWish),
  });
}

export async function getWishById(req: Request, res: Response) {
  const userId = getAuthenticatedUserId(req);

  const wishId = Number(req.params.id);
  if (!Number.isInteger(wishId) || wishId <= 0) {
    throw new HttpError(400, "wish id is invalid");
  }

  const wish = await findWishById(userId, wishId);
  if (!wish) {
    throw new HttpError(404, "wish not found");
  }

  res.status(200).json({
    message: "get wish success",
    wish: serializeWish(wish),
  });
}

export async function getWishRecords(req: Request, res: Response) {
  const userId = getAuthenticatedUserId(req);
  const wishId = Number(req.params.id);

  if (!Number.isInteger(wishId) || wishId <= 0) {
    throw new HttpError(400, "wish id is invalid");
  }

  const wish = await findWishById(userId, wishId);
  if (!wish) {
    throw new HttpError(404, "wish not found");
  }

  if (!(await hasTable("wish_records"))) {
    res.status(200).json({
      message: "get wish records success",
      wish: serializeWish(wish),
      records: [],
    });
    return;
  }

  const [rows] = await db.query<WishRecordRow[]>(
    `
      SELECT
        id,
        wish_id,
        created_by_user_id,
        content,
        record_date,
        mood,
        location_name,
        latitude,
        longitude,
        budget_amount,
        created_at,
        updated_at
      FROM wish_records
      WHERE wish_id = ?
      ORDER BY record_date ASC, id ASC
    `,
    [wishId]
  );
  const mediaByRecord = await getWishRecordMedia(rows.map((row) => row.id));

  res.status(200).json({
    message: "get wish records success",
    wish: serializeWish(wish),
    records: rows.map((row) =>
      serializeWishRecord(row, mediaByRecord.get(row.id))
    ),
  });
}

export async function createWish(req: Request, res: Response) {
  const userId = getAuthenticatedUserId(req);
  const payload = parseRequestBody(createWishSchema, req.body);

  await assertWishSoftDeleteColumnsReady();
  const relationship = await findActiveRelationshipByUserId(userId);
  const [result] = await db.query<ResultSetHeader>(
    `
      INSERT INTO wishes (
        relationship_id,
        created_by_user_id,
        title,
        description,
        cover,
        target_date,
        location_name,
        latitude,
        longitude,
        budget_amount,
        status,
        deleted_at,
        delete_expires_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'todo', NULL, NULL)
    `,
    [
      relationship?.id ?? null,
      userId,
      payload.title,
      payload.description || null,
      payload.cover || null,
      payload.targetDate,
      payload.locationName || null,
      payload.latitude,
      payload.longitude,
      payload.budgetAmount,
    ]
  );

  const [rows] = await db.query<WishRow[]>(
    `
      SELECT
        ${wishSelectFields}
      FROM wishes
      WHERE id = ?
      LIMIT 1
    `,
    [result.insertId]
  );

  const wish = rows[0];
  if (!wish) {
    throw new HttpError(500, "failed to create wish");
  }

  res.status(201).json({
    message: "create wish success",
    wish: serializeWish(wish),
  });
}

export async function updateWish(req: Request, res: Response) {
  const userId = getAuthenticatedUserId(req);
  const wishId = Number(req.params.id);

  if (!Number.isInteger(wishId) || wishId <= 0) {
    throw new HttpError(400, "wish id is invalid");
  }

  const payload = parseRequestBody(updateWishSchema, req.body);
  const existingWish = await findWishById(userId, wishId);
  if (!existingWish) {
    throw new HttpError(404, "wish not found");
  }

  await db.query<ResultSetHeader>(
    `
      UPDATE wishes
      SET
        status = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
      LIMIT 1
    `,
    [payload.status, wishId]
  );

  const [rows] = await db.query<WishRow[]>(
    `
      SELECT
        ${wishSelectFields}
      FROM wishes
      WHERE id = ?
      LIMIT 1
    `,
    [existingWish.id]
  );

  const wish = rows[0];
  if (!wish) {
    throw new HttpError(500, "failed to update wish");
  }

  res.status(200).json({
    message: "update wish success",
    wish: serializeWish(wish),
  });
}

export async function createWishRecord(req: Request, res: Response) {
  const userId = getAuthenticatedUserId(req);
  const wishId = Number(req.params.id);

  if (!Number.isInteger(wishId) || wishId <= 0) {
    throw new HttpError(400, "wish id is invalid");
  }

  const payload = parseRequestBody(createWishRecordSchema, req.body);
  const wish = await findWishById(userId, wishId);
  if (!wish) {
    throw new HttpError(404, "wish not found");
  }

  if (!(await hasTable("wish_records"))) {
    throw new HttpError(500, "wish records table not found");
  }

  const insertValues = [
    wishId,
    userId,
    payload.content || null,
    payload.recordDate,
    payload.mood || null,
    payload.locationName || null,
    payload.latitude,
    payload.longitude,
    payload.budgetAmount,
  ];

  const [result] = await db.query<ResultSetHeader>(
    `
      INSERT INTO wish_records (
        wish_id,
        created_by_user_id,
        content,
        record_date,
        mood,
        location_name,
        latitude,
        longitude,
        budget_amount
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    insertValues
  );
  const media = await createWishRecordThumbnails(userId, payload.media);
  await createWishRecordMedia(wish, result.insertId, userId, media);

  const [recordRows] = await db.query<WishRecordRow[]>(
    `
      SELECT
        id,
        wish_id,
        created_by_user_id,
        content,
        record_date,
        mood,
        location_name,
        latitude,
        longitude,
        budget_amount,
        created_at,
        updated_at
      FROM wish_records
      WHERE id = ?
      LIMIT 1
    `,
    [result.insertId]
  );

  const record = recordRows[0];
  if (!record) {
    throw new HttpError(500, "failed to create wish record");
  }

  res.status(201).json({
    message: "create wish record success",
    wish: serializeWish(wish),
    record: serializeWishRecord(record, media),
  });
}

export async function getDeletedWishes(req: Request, res: Response) {
  const userId = getAuthenticatedUserId(req);

  await assertWishSoftDeleteColumnsReady();
  const scope = await buildWishScope(userId);
  const [rows] = await db.query<WishRow[]>(
    `
      SELECT
        ${wishSelectFields}
      FROM wishes
      WHERE ${scope.sql}
        AND deleted_at IS NOT NULL
      ORDER BY deleted_at DESC, id DESC
    `,
    scope.values
  );

  res.status(200).json({
    message: "get deleted wishes success",
    wishes: rows.map(serializeWish),
  });
}

export async function deleteWish(req: Request, res: Response) {
  const userId = getAuthenticatedUserId(req);
  const wishId = Number(req.params.id);

  if (!Number.isInteger(wishId) || wishId <= 0) {
    throw new HttpError(400, "wish id is invalid");
  }

  const wish = await findWishById(userId, wishId);
  if (!wish) {
    throw new HttpError(404, "wish not found");
  }

  await db.query<ResultSetHeader>(
    `
      UPDATE wishes
      SET
        deleted_at = CURRENT_TIMESTAMP,
        delete_expires_at = DATE_ADD(CURRENT_TIMESTAMP, INTERVAL ? DAY),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
        AND deleted_at IS NULL
      LIMIT 1
    `,
    [WISH_RETENTION_DAYS, wishId]
  );

  const deletedWish = await findWishById(userId, wishId, { includeDeleted: true });
  if (!deletedWish) {
    throw new HttpError(500, "failed to delete wish");
  }

  res.status(200).json({
    message: "delete wish success",
    wish: serializeWish(deletedWish),
  });
}

export async function restoreWish(req: Request, res: Response) {
  const userId = getAuthenticatedUserId(req);
  const wishId = Number(req.params.id);

  if (!Number.isInteger(wishId) || wishId <= 0) {
    throw new HttpError(400, "wish id is invalid");
  }

  const wish = await findWishById(userId, wishId, { includeDeleted: true });
  if (!wish || wish.deleted_at === null) {
    throw new HttpError(404, "deleted wish not found");
  }

  await db.query<ResultSetHeader>(
    `
      UPDATE wishes
      SET
        deleted_at = NULL,
        delete_expires_at = NULL,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
        AND deleted_at IS NOT NULL
      LIMIT 1
    `,
    [wishId]
  );

  const restoredWish = await findWishById(userId, wishId);
  if (!restoredWish) {
    throw new HttpError(500, "failed to restore wish");
  }

  res.status(200).json({
    message: "restore wish success",
    wish: serializeWish(restoredWish),
  });
}

export async function permanentlyDeleteWish(req: Request, res: Response) {
  const userId = getAuthenticatedUserId(req);
  const wishId = Number(req.params.id);

  if (!Number.isInteger(wishId) || wishId <= 0) {
    throw new HttpError(400, "wish id is invalid");
  }

  const wish = await findWishById(userId, wishId, { includeDeleted: true });
  if (!wish || wish.deleted_at === null) {
    throw new HttpError(404, "deleted wish not found");
  }

  await db.query<ResultSetHeader>(
    `
      DELETE FROM wishes
      WHERE id = ?
        AND deleted_at IS NOT NULL
      LIMIT 1
    `,
    [wishId]
  );

  res.status(200).json({
    message: "permanently delete wish success",
  });
}

export async function cleanupExpiredDeletedWishes() {
  if (!(await hasTable("wishes"))) {
    return;
  }

  const hasDeletedAt = await hasColumn("wishes", "deleted_at");
  const hasDeleteExpiresAt = await hasColumn("wishes", "delete_expires_at");
  if (!hasDeletedAt || !hasDeleteExpiresAt) {
    return;
  }

  const [result] = await db.query<ResultSetHeader>(
    `
      DELETE FROM wishes
      WHERE deleted_at IS NOT NULL
        AND delete_expires_at IS NOT NULL
        AND delete_expires_at <= CURRENT_TIMESTAMP
    `
  );

  if (result.affectedRows > 0) {
    console.log(`Cleaned up ${result.affectedRows} expired wishes`);
  }
}

export function setupWishCleanup() {
  void cleanupExpiredDeletedWishes().catch((error) => {
    console.error("Initial wish cleanup failed", error);
  });

  return setInterval(() => {
    void cleanupExpiredDeletedWishes().catch((error) => {
      console.error("Scheduled wish cleanup failed", error);
    });
  }, WISH_CLEANUP_INTERVAL_MS);
}
