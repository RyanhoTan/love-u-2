import type { Request, Response } from "express";
import type { ResultSetHeader, RowDataPacket } from "mysql2";
import { getAuthenticatedUserId } from "../auth.js";
import db from "../db/index.js";
import { HttpError } from "../errors.js";
import { updateUserProfileSchema } from "../schema/user.js";
import { parseRequestBody } from "../validation.js";

interface UserInfoRow extends RowDataPacket {
  id: number;
  username: string;
  nickname: string | null;
  avatar: string | null;
  signature: string | null;
  birthday: Date | string | null;
  gender: string | null;
  createdAt: Date | string | null;
  updatedAt: Date | string | null;
}

interface CoupleRelationshipStatusRow extends RowDataPacket {
  status: string;
}

interface BoundCoupleRow extends RowDataPacket {
  id: number;
  user_a_id: number;
  user_b_id: number;
  anniversary_date: Date | string | null;
  status: string;
}

interface PartnerSummaryRow extends RowDataPacket {
  id: number;
  username: string;
  nickname: string | null;
  avatar: string | null;
}

interface ColumnNameRow extends RowDataPacket {
  COLUMN_NAME: string;
}

type CoupleSummary = {
  isBound: boolean;
  daysInLove: number | null;
  anniversaryDate: string | null;
  partner: {
    id: number;
    username: string;
    nickname: string | null;
    avatar: string | null;
  } | null;
};

let usersTableColumnsPromise: Promise<Set<string>> | null = null;

async function getUsersTableColumns() {
  usersTableColumnsPromise ??= db
    .query<ColumnNameRow[]>(
      `
        SELECT COLUMN_NAME
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = 'users'
      `
    )
    .then(([rows]) => new Set(rows.map((row) => row.COLUMN_NAME)));

  return usersTableColumnsPromise;
}

function selectOptionalColumn(
  columns: Set<string>,
  columnName: string,
  alias: string,
) {
  if (!columns.has(columnName)) {
    return `NULL AS \`${alias}\``;
  }

  return `\`${columnName}\` AS \`${alias}\``;
}

function formatDateOnly(value: Date | string | null) {
  if (!value) {
    return null;
  }

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

function getDaysInLove(anniversaryDate: Date | string | null) {
  const dateText = formatDateOnly(anniversaryDate);
  if (!dateText) {
    return null;
  }

  const start = new Date(`${dateText}T00:00:00.000Z`);
  const now = new Date();
  const diffMs = now.getTime() - start.getTime();

  if (Number.isNaN(diffMs) || diffMs < 0) {
    return 0;
  }

  return Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1;
}

async function findUserById(userId: number, columns: Set<string>) {
  const selectFields = [
    "`id`",
    "`username`",
    selectOptionalColumn(columns, "nickname", "nickname"),
    selectOptionalColumn(columns, "avatar", "avatar"),
    selectOptionalColumn(columns, "signature", "signature"),
    selectOptionalColumn(columns, "birthday", "birthday"),
    selectOptionalColumn(columns, "gender", "gender"),
    selectOptionalColumn(columns, "created_at", "createdAt"),
    selectOptionalColumn(columns, "updated_at", "updatedAt"),
  ];

  const [rows] = await db.query<UserInfoRow[]>(
    `
      SELECT ${selectFields.join(", ")}
      FROM users
      WHERE id = ?
      LIMIT 1
    `,
    [userId]
  );

  return rows[0] ?? null;
}

async function findCurrentCoupleStatus(userId: number) {
  const [rows] = await db.query<CoupleRelationshipStatusRow[]>(
    `
      SELECT status
      FROM couple_relationships
      WHERE user_a_id = ? OR user_b_id = ?
      ORDER BY
        CASE WHEN status = 'bound' THEN 0 ELSE 1 END,
        updated_at DESC,
        id DESC
      LIMIT 1
    `,
    [userId, userId]
  );

  return rows[0]?.status ?? null;
}

async function findBoundRelationship(userId: number) {
  const [rows] = await db.query<BoundCoupleRow[]>(
    `
      SELECT
        id,
        user_a_id,
        user_b_id,
        anniversary_date,
        status
      FROM couple_relationships
      WHERE status = 'bound'
        AND (user_a_id = ? OR user_b_id = ?)
      LIMIT 1
    `,
    [userId, userId]
  );

  return rows[0] ?? null;
}

async function findPartnerSummary(
  partnerId: number,
  columns: Set<string>,
) {
  const [rows] = await db.query<PartnerSummaryRow[]>(
    `
      SELECT
        id,
        username,
        ${selectOptionalColumn(columns, "nickname", "nickname")},
        ${selectOptionalColumn(columns, "avatar", "avatar")}
      FROM users
      WHERE id = ?
      LIMIT 1
    `,
    [partnerId]
  );

  return rows[0] ?? null;
}

async function buildCoupleSummary(
  userId: number,
  columns: Set<string>,
): Promise<CoupleSummary> {
  const relationship = await findBoundRelationship(userId);

  if (!relationship) {
    return {
      isBound: false,
      daysInLove: null,
      anniversaryDate: null,
      partner: null,
    };
  }

  const partnerId =
    relationship.user_a_id === userId
      ? relationship.user_b_id
      : relationship.user_a_id;
  const partner = await findPartnerSummary(partnerId, columns);

  return {
    isBound: true,
    daysInLove: getDaysInLove(relationship.anniversary_date),
    anniversaryDate: formatDateOnly(relationship.anniversary_date),
    partner: partner
      ? {
          id: partner.id,
          username: partner.username,
          nickname: partner.nickname,
          avatar: partner.avatar,
        }
      : null,
  };
}

function serializeUser(
  user: UserInfoRow,
  coupleStatus: string | null,
  couple: CoupleSummary,
) {
  return {
    id: user.id,
    username: user.username,
    nickname: user.nickname,
    avatar: user.avatar,
    signature: user.signature,
    birthday: formatDateOnly(user.birthday),
    gender: user.gender,
    coupleStatus,
    couple,
    createdAt: formatDateTime(user.createdAt),
    updatedAt: formatDateTime(user.updatedAt),
  };
}

async function buildUserInfoPayload(userId: number) {
  const columns = await getUsersTableColumns();
  const user = await findUserById(userId, columns);

  if (!user) {
    throw new HttpError(404, "user not found");
  }

  const [coupleStatus, couple] = await Promise.all([
    findCurrentCoupleStatus(userId),
    buildCoupleSummary(userId, columns),
  ]);

  return serializeUser(user, coupleStatus, couple);
}

export async function getUserInfo(req: Request, res: Response) {
  const userId = getAuthenticatedUserId(req);
  const user = await buildUserInfoPayload(userId);

  res.status(200).json({
    message: "get user info success",
    user,
  });
}

export async function updateUserInfo(req: Request, res: Response) {
  const userId = getAuthenticatedUserId(req);

  const payload = parseRequestBody(updateUserProfileSchema, req.body);
  const columns = await getUsersTableColumns();
  const assignments: string[] = [];
  const values: (string | null | number)[] = [];

  if (columns.has("nickname")) {
    assignments.push("`nickname` = ?");
    values.push(payload.nickname || null);
  }

  if (columns.has("avatar")) {
    assignments.push("`avatar` = ?");
    values.push(payload.avatar || null);
  }

  if (columns.has("signature")) {
    assignments.push("`signature` = ?");
    values.push(payload.signature || null);
  }

  if (columns.has("birthday")) {
    assignments.push("`birthday` = ?");
    values.push(payload.birthday);
  }

  if (assignments.length === 0) {
    throw new HttpError(500, "users table does not support profile updates");
  }

  if (columns.has("updated_at")) {
    assignments.push("`updated_at` = CURRENT_TIMESTAMP");
  }

  values.push(userId);

  const [result] = await db.query<ResultSetHeader>(
    `
      UPDATE users
      SET ${assignments.join(", ")}
      WHERE id = ?
    `,
    values
  );

  if (result.affectedRows === 0) {
    throw new HttpError(404, "user not found");
  }

  const user = await buildUserInfoPayload(userId);

  res.status(200).json({
    message: "update user info success",
    user,
  });
}
