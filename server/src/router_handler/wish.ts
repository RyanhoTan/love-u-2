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

interface CoupleRelationshipRow extends RowDataPacket {
  id: number;
}

interface TableNameRow extends RowDataPacket {
  TABLE_NAME: string;
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

function formatDateTime(value: Date | string) {
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
  };
}

function serializeWishRecord(row: WishRecordRow, mediaUrls: string[] = []) {
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
    mediaUrls,
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

function inferMediaType(url: string) {
  return /\.(mp4|mov|m4v|webm|avi|mkv)$/i.test(url) ? "video" : "image";
}

async function getWishRecordMedia(recordIds: number[]) {
  if (!recordIds.length || !(await hasTable("album_media"))) {
    return new Map<number, string[]>();
  }

  const [rows] = await db.query<WishRecordMediaRow[]>(
    `
      SELECT source_id, url
      FROM album_media
      WHERE source_type = 'wish_record'
        AND source_id IN (?)
      ORDER BY id ASC
    `,
    [recordIds]
  );

  const mediaByRecord = new Map<number, string[]>();
  for (const row of rows) {
    const media = mediaByRecord.get(row.source_id) ?? [];
    media.push(row.url);
    mediaByRecord.set(row.source_id, media);
  }

  return mediaByRecord;
}

async function createWishRecordMedia(
  wish: WishRow,
  recordId: number,
  userId: number,
  mediaUrls: string[]
) {
  if (!mediaUrls.length) {
    return;
  }

  if (!(await hasTable("album_media"))) {
    throw new HttpError(500, "album media table not found");
  }

  const values = mediaUrls.map((url) => [
    wish.relationship_id,
    userId,
    inferMediaType(url),
    "wish_record",
    recordId,
    url,
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

export async function getWishes(req: Request, res: Response) {
  const userId = getAuthenticatedUserId(req);

  const scope = await buildWishScope(userId);
  const [rows] = await db.query<WishRow[]>(
    `
      SELECT
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
        updated_at
      FROM wishes
      WHERE ${scope.sql}
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

  const scope = await buildWishScope(userId);
  const [rows] = await db.query<WishRow[]>(
    `
      SELECT
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
        updated_at
      FROM wishes
      WHERE id = ?
        AND ${scope.sql}
      LIMIT 1
    `,
    [wishId, ...scope.values]
  );

  const wish = rows[0];
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

  const scope = await buildWishScope(userId);
  const [wishRows] = await db.query<WishRow[]>(
    `
      SELECT
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
        updated_at
      FROM wishes
      WHERE id = ?
        AND ${scope.sql}
      LIMIT 1
    `,
    [wishId, ...scope.values]
  );

  const wish = wishRows[0];
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
        status
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'todo')
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
        updated_at
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
  const scope = await buildWishScope(userId);
  const [existingRows] = await db.query<WishRow[]>(
    `
      SELECT
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
        updated_at
      FROM wishes
      WHERE id = ?
        AND ${scope.sql}
      LIMIT 1
    `,
    [wishId, ...scope.values]
  );

  const existingWish = existingRows[0];
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
        updated_at
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
  const scope = await buildWishScope(userId);
  const [wishRows] = await db.query<WishRow[]>(
    `
      SELECT
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
        updated_at
      FROM wishes
      WHERE id = ?
        AND ${scope.sql}
      LIMIT 1
    `,
    [wishId, ...scope.values]
  );

  const wish = wishRows[0];
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
  await createWishRecordMedia(wish, result.insertId, userId, payload.mediaUrls);

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
    record: serializeWishRecord(record, payload.mediaUrls),
  });
}
