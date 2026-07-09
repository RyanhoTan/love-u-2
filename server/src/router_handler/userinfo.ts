import type { Request, Response } from "express";
import jwt from "jsonwebtoken";
import type { RowDataPacket } from "mysql2";
import { config } from "../config.js";
import db from "../db/index.js";
import { HttpError } from "../errors.js";

interface AuthTokenPayload extends jwt.JwtPayload {
  sub: string;
  username?: string;
}

interface UserInfoRow extends RowDataPacket {
  id: number;
  username: string;
  nickname: string | null;
  avatar: string | null;
  signature: string | null;
  birthday: Date | string | null;
  gender: string | null;
  coupleStatus: string | null;
  createdAt: Date | string | null;
  updatedAt: Date | string | null;
}

interface ColumnNameRow extends RowDataPacket {
  COLUMN_NAME: string;
}

let usersTableColumnsPromise: Promise<Set<string>> | null = null;

function getBearerToken(req: Request) {
  const authorization = req.header("Authorization");

  if (!authorization) {
    throw new HttpError(401, "invalid or expired token");
  }

  const [scheme, token] = authorization.split(" ");
  if (scheme !== "Bearer" || !token) {
    throw new HttpError(401, "invalid or expired token");
  }

  return token;
}

function getAuthTokenPayload(req: Request): AuthTokenPayload {
  const token = getBearerToken(req);

  try {
    const payload = jwt.verify(token, config.jwtSecret);
    if (
      !payload ||
      typeof payload !== "object" ||
      typeof payload.sub !== "string" ||
      payload.sub.trim() === ""
    ) {
      throw new HttpError(401, "invalid or expired token");
    }

    return payload as AuthTokenPayload;
  } catch (error) {
    if (error instanceof HttpError) {
      throw error;
    }

    throw new HttpError(401, "invalid or expired token");
  }
}

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

  return value.toISOString().slice(0, 10);
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

export async function getUserInfo(req: Request, res: Response) {
  const auth = getAuthTokenPayload(req);
  const userId = Number(auth.sub);

  if (!Number.isInteger(userId) || userId <= 0) {
    throw new HttpError(401, "invalid or expired token");
  }

  const columns = await getUsersTableColumns();
  const selectFields = [
    "`id`",
    "`username`",
    selectOptionalColumn(columns, "nickname", "nickname"),
    selectOptionalColumn(columns, "avatar", "avatar"),
    selectOptionalColumn(columns, "signature", "signature"),
    selectOptionalColumn(columns, "birthday", "birthday"),
    selectOptionalColumn(columns, "gender", "gender"),
    selectOptionalColumn(columns, "couple_status", "coupleStatus"),
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

  const user = rows[0];
  if (!user) {
    throw new HttpError(404, "user not found");
  }

  res.status(200).json({
    message: "get user info success",
    user: {
      id: user.id,
      username: user.username,
      nickname: user.nickname,
      avatar: user.avatar,
      signature: user.signature,
      birthday: formatDateOnly(user.birthday),
      gender: user.gender,
      coupleStatus: user.coupleStatus,
      createdAt: formatDateTime(user.createdAt),
      updatedAt: formatDateTime(user.updatedAt),
    }
  });
}
