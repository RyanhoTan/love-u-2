import type { Request, Response } from "express";
import type { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { getAuthenticatedUserId } from "../auth.js";
import db from "../db/index.js";
import { HttpError } from "../errors.js";
import {
  createWishRecordSchema,
  createWishSchema,
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
  is_seed: number;
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
  media_urls: string[] | string | null;
  created_at: Date | string;
  updated_at: Date | string;
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
    isSeed: Boolean(row.is_seed),
    createdAt: formatDateTime(row.created_at),
    updatedAt: formatDateTime(row.updated_at),
  };
}

function serializeWishRecord(row: WishRecordRow) {
  let mediaUrls: string[] = [];

  if (row.media_urls) {
    if (Array.isArray(row.media_urls)) {
      mediaUrls = row.media_urls.filter(
        (item): item is string => typeof item === "string"
      );
    } else {
      try {
        const parsed = JSON.parse(row.media_urls) as unknown;
        if (Array.isArray(parsed)) {
          mediaUrls = parsed.filter(
            (item): item is string => typeof item === "string"
          );
        }
      } catch {
        mediaUrls = [];
      }
    }
  }

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

async function buildWishScope(userId: number) {
  const relationship = await findActiveRelationshipByUserId(userId);

  if (relationship) {
    return {
      sql: "(relationship_id = ? OR is_seed = 1)",
      values: [relationship.id],
      relationshipId: relationship.id,
    };
  }

  return {
    sql: "(created_by_user_id = ? OR is_seed = 1)",
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
        is_seed,
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
        is_seed,
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
        is_seed,
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
        media_urls,
        created_at,
        updated_at
      FROM wish_records
      WHERE wish_id = ?
      ORDER BY record_date ASC, id ASC
    `,
    [wishId]
  );

  res.status(200).json({
    message: "get wish records success",
    wish: serializeWish(wish),
    records: rows.map(serializeWishRecord),
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
        status,
        is_seed
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'todo', 0)
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
        is_seed,
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
        is_seed,
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
        budget_amount,
        media_urls
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      wishId,
      userId,
      payload.content || null,
      payload.recordDate,
      payload.mood || null,
      payload.locationName || null,
      payload.latitude,
      payload.longitude,
      payload.budgetAmount,
      JSON.stringify(payload.mediaUrls),
    ]
  );

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
        media_urls,
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
    record: serializeWishRecord(record),
  });
}
