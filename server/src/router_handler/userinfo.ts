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

interface ColumnNameRow extends RowDataPacket {
  COLUMN_NAME: string;
}

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

function serializeUser(user: UserInfoRow, coupleStatus: string | null) {
  return {
    id: user.id,
    username: user.username,
    nickname: user.nickname,
    avatar: user.avatar,
    signature: user.signature,
    birthday: formatDateOnly(user.birthday),
    gender: user.gender,
    coupleStatus,
    createdAt: formatDateTime(user.createdAt),
    updatedAt: formatDateTime(user.updatedAt),
  };
}

export async function getUserInfo(req: Request, res: Response) {
  const userId = getAuthenticatedUserId(req);

  const columns = await getUsersTableColumns();
  const user = await findUserById(userId, columns);
  const coupleStatus = await findCurrentCoupleStatus(userId);

  if (!user) {
    throw new HttpError(404, "user not found");
  }

  res.status(200).json({
    message: "get user info success",
    user: serializeUser(user, coupleStatus),
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

  const nextUser = await findUserById(userId, columns);
  const coupleStatus = await findCurrentCoupleStatus(userId);
  if (!nextUser) {
    throw new HttpError(404, "user not found");
  }

  res.status(200).json({
    message: "update user info success",
    user: serializeUser(nextUser, coupleStatus),
  });
}
