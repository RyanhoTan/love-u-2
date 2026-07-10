import type { Request, Response } from "express";
import type { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { getAuthenticatedUserId } from "../auth.js";
import db from "../db/index.js";
import { HttpError } from "../errors.js";
import { createWishSchema, type WishStatus } from "../schema/wish.js";
import { parseRequestBody } from "../validation.js";

interface CoupleRelationshipRow extends RowDataPacket {
  id: number;
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
