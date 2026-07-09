import type { Request, Response } from "express";
import type { PoolConnection, ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { getAuthenticatedUserId } from "../auth.js";
import db from "../db/index.js";
import { HttpError } from "../errors.js";
import { bindCoupleSchema, updateCoupleProfileSchema } from "../schema/couple.js";
import { parseRequestBody } from "../validation.js";

const COUPLE_INVITES_TABLE = "couple_invites";
const COUPLE_RELATIONSHIPS_TABLE = "couple_relationships";
const INVITE_CODE_LENGTH = 6;
const INVITE_EXPIRES_IN_MINUTES = 30;
const INVITE_CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

interface ColumnNameRow extends RowDataPacket {
  COLUMN_NAME: string;
}

interface TableNameRow extends RowDataPacket {
  TABLE_NAME: string;
}

interface CoupleInviteRow extends RowDataPacket {
  code: string;
  inviter_user_id: number;
  invitee_user_id: number | null;
  status: string;
  expires_at: Date | string;
  created_at: Date | string;
  updated_at: Date | string;
  used_at: Date | string | null;
}

interface CoupleRelationshipRow extends RowDataPacket {
  id: number;
  user_a_id: number;
  user_b_id: number;
  anniversary_date: Date | string | null;
  status: string;
  created_at: Date | string;
  updated_at: Date | string;
  unbound_at: Date | string | null;
}

interface UserSummaryRow extends RowDataPacket {
  id: number;
  username: string;
  nickname: string | null;
  avatar: string | null;
}

const tableColumnsPromiseCache = new Map<string, Promise<Set<string>>>();

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

async function getExistingTableNames() {
  const [rows] = await db.query<TableNameRow[]>(
    `
      SELECT TABLE_NAME
      FROM INFORMATION_SCHEMA.TABLES
      WHERE TABLE_SCHEMA = DATABASE()
    `
  );

  return new Set(rows.map((row) => row.TABLE_NAME));
}

async function getTableColumns(tableName: string) {
  const cached = tableColumnsPromiseCache.get(tableName);
  if (cached) {
    return cached;
  }

  const promise = db
    .query<ColumnNameRow[]>(
      `
        SELECT COLUMN_NAME
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = ?
      `,
      [tableName]
    )
    .then(([rows]) => new Set(rows.map((row) => row.COLUMN_NAME)));

  tableColumnsPromiseCache.set(tableName, promise);
  return promise;
}

async function assertCoupleSpaceTablesReady() {
  const tableNames = await getExistingTableNames();
  const requiredTables = [COUPLE_INVITES_TABLE, COUPLE_RELATIONSHIPS_TABLE];
  const missingTables = requiredTables.filter((tableName) => !tableNames.has(tableName));

  if (missingTables.length > 0) {
    throw new HttpError(
      500,
      `couple space tables are missing: ${missingTables.join(", ")}`
    );
  }
}

async function getUsersTableColumns() {
  return getTableColumns("users");
}

async function findActiveRelationshipByUserId(
  executor: typeof db | PoolConnection,
  userId: number,
) {
  const [rows] = await executor.query<CoupleRelationshipRow[]>(
    `
      SELECT
        id,
        user_a_id,
        user_b_id,
        anniversary_date,
        status,
        created_at,
        updated_at,
        unbound_at
      FROM ${COUPLE_RELATIONSHIPS_TABLE}
      WHERE status = 'active'
        AND (user_a_id = ? OR user_b_id = ?)
      LIMIT 1
    `,
    [userId, userId]
  );

  return rows[0] ?? null;
}

async function findUserSummaryById(
  executor: typeof db | PoolConnection,
  userId: number,
  userColumns: Set<string>,
) {
  const selectNickname = userColumns.has("nickname")
    ? "`nickname`"
    : "NULL AS `nickname`";
  const selectAvatar = userColumns.has("avatar") ? "`avatar`" : "NULL AS `avatar`";

  const [rows] = await executor.query<UserSummaryRow[]>(
    `
      SELECT
        id,
        username,
        ${selectNickname},
        ${selectAvatar}
      FROM users
      WHERE id = ?
      LIMIT 1
    `,
    [userId]
  );

  return rows[0] ?? null;
}

async function findActiveInviteByInviterId(
  executor: typeof db | PoolConnection,
  userId: number,
) {
  const [rows] = await executor.query<CoupleInviteRow[]>(
    `
      SELECT
        code,
        inviter_user_id,
        invitee_user_id,
        status,
        expires_at,
        created_at,
        updated_at,
        used_at
      FROM ${COUPLE_INVITES_TABLE}
      WHERE inviter_user_id = ?
        AND status = 'pending'
        AND expires_at > CURRENT_TIMESTAMP
      ORDER BY created_at DESC
      LIMIT 1
    `,
    [userId]
  );

  return rows[0] ?? null;
}

async function findInviteByCode(
  executor: typeof db | PoolConnection,
  inviteCode: string,
) {
  const [rows] = await executor.query<CoupleInviteRow[]>(
    `
      SELECT
        code,
        inviter_user_id,
        invitee_user_id,
        status,
        expires_at,
        created_at,
        updated_at,
        used_at
      FROM ${COUPLE_INVITES_TABLE}
      WHERE code = ?
      LIMIT 1
    `,
    [inviteCode]
  );

  return rows[0] ?? null;
}

function serializePartner(partner: UserSummaryRow | null) {
  if (!partner) {
    return null;
  }

  return {
    id: partner.id,
    username: partner.username,
    nickname: partner.nickname,
    avatar: partner.avatar,
  };
}

function serializeInvite(invite: CoupleInviteRow | null) {
  if (!invite) {
    return null;
  }

  return {
    code: invite.code,
    status: invite.status,
    expiresAt: formatDateTime(invite.expires_at),
    createdAt: formatDateTime(invite.created_at),
    updatedAt: formatDateTime(invite.updated_at),
    usedAt: formatDateTime(invite.used_at),
  };
}

function serializeRelationship(relationship: CoupleRelationshipRow | null) {
  if (!relationship) {
    return null;
  }

  return {
    id: relationship.id,
    status: relationship.status,
    anniversaryDate: formatDateOnly(relationship.anniversary_date),
    createdAt: formatDateTime(relationship.created_at),
    updatedAt: formatDateTime(relationship.updated_at),
    unboundAt: formatDateTime(relationship.unbound_at),
  };
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

async function syncUsersCoupleStatus(
  executor: typeof db | PoolConnection,
  userIds: number[],
  coupleStatus: string,
) {
  const userColumns = await getUsersTableColumns();

  if (!userColumns.has("couple_status")) {
    return;
  }

  const placeholders = userIds.map(() => "?").join(", ");
  await executor.query(
    `
      UPDATE users
      SET couple_status = ?
      WHERE id IN (${placeholders})
    `,
    [coupleStatus, ...userIds]
  );
}

function generateInviteCode() {
  let result = "";

  for (let index = 0; index < INVITE_CODE_LENGTH; index += 1) {
    const randomIndex = Math.floor(Math.random() * INVITE_CODE_ALPHABET.length);
    result += INVITE_CODE_ALPHABET[randomIndex];
  }

  return result;
}

async function createUniqueInviteCode(executor: PoolConnection) {
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const code = generateInviteCode();
    const existing = await findInviteByCode(executor, code);

    if (!existing) {
      return code;
    }
  }

  throw new HttpError(500, "failed to generate unique invite code");
}

async function buildCoupleSpaceResponse(userId: number) {
  await assertCoupleSpaceTablesReady();

  const userColumns = await getUsersTableColumns();
  const relationship = await findActiveRelationshipByUserId(db, userId);
  const activeInvite = await findActiveInviteByInviterId(db, userId);

  let partner: UserSummaryRow | null = null;
  if (relationship) {
    const partnerId =
      relationship.user_a_id === userId ? relationship.user_b_id : relationship.user_a_id;
    partner = await findUserSummaryById(db, partnerId, userColumns);
  }

  return {
    message: "get couple space success",
    coupleSpace: {
      isBound: Boolean(relationship),
      partner: serializePartner(partner),
      relationship: serializeRelationship(relationship),
      daysInLove: relationship ? getDaysInLove(relationship.anniversary_date) : null,
      activeInvite: serializeInvite(activeInvite),
    },
  };
}

export async function getCoupleSpace(req: Request, res: Response) {
  const userId = getAuthenticatedUserId(req);
  const payload = await buildCoupleSpaceResponse(userId);
  res.status(200).json(payload);
}

export async function createCoupleInvite(req: Request, res: Response) {
  const userId = getAuthenticatedUserId(req);
  await assertCoupleSpaceTablesReady();

  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const relationship = await findActiveRelationshipByUserId(connection, userId);
    if (relationship) {
      throw new HttpError(409, "you are already bound to a partner");
    }

    const existingInvite = await findActiveInviteByInviterId(connection, userId);
    if (existingInvite) {
      await connection.commit();
      res.status(200).json({
        message: "create couple invite success",
        invite: serializeInvite(existingInvite),
      });
      return;
    }

    const code = await createUniqueInviteCode(connection);
    await connection.query<ResultSetHeader>(
      `
        INSERT INTO ${COUPLE_INVITES_TABLE} (
          code,
          inviter_user_id,
          status,
          expires_at
        )
        VALUES (
          ?,
          ?,
          'pending',
          DATE_ADD(CURRENT_TIMESTAMP, INTERVAL ? MINUTE)
        )
      `,
      [code, userId, INVITE_EXPIRES_IN_MINUTES]
    );

    const invite = await findInviteByCode(connection, code);
    await connection.commit();

    res.status(201).json({
      message: "create couple invite success",
      invite: serializeInvite(invite),
    });
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

export async function bindCoupleSpace(req: Request, res: Response) {
  const userId = getAuthenticatedUserId(req);
  const payload = parseRequestBody(bindCoupleSchema, req.body);
  await assertCoupleSpaceTablesReady();

  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const selfRelationship = await findActiveRelationshipByUserId(connection, userId);
    if (selfRelationship) {
      throw new HttpError(409, "you are already bound to a partner");
    }

    const invite = await findInviteByCode(connection, payload.inviteCode);
    if (!invite || invite.status !== "pending") {
      throw new HttpError(404, "invite code not found");
    }

    const expiresAt = formatDateTime(invite.expires_at);
    if (!expiresAt || new Date(expiresAt).getTime() <= Date.now()) {
      throw new HttpError(410, "invite code has expired");
    }

    if (invite.inviter_user_id === userId) {
      throw new HttpError(400, "cannot bind with your own invite code");
    }

    const inviterRelationship = await findActiveRelationshipByUserId(
      connection,
      invite.inviter_user_id
    );
    if (inviterRelationship) {
      throw new HttpError(409, "the inviter is already bound to a partner");
    }

    await connection.query<ResultSetHeader>(
      `
        INSERT INTO ${COUPLE_RELATIONSHIPS_TABLE} (
          user_a_id,
          user_b_id,
          status
        )
        VALUES (?, ?, 'active')
      `,
      [invite.inviter_user_id, userId]
    );

    await connection.query<ResultSetHeader>(
      `
        UPDATE ${COUPLE_INVITES_TABLE}
        SET
          status = 'used',
          invitee_user_id = ?,
          used_at = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP
        WHERE code = ?
      `,
      [userId, invite.code]
    );

    await syncUsersCoupleStatus(connection, [invite.inviter_user_id, userId], "bound");
    await connection.commit();

    const response = await buildCoupleSpaceResponse(userId);
    res.status(200).json({
      message: "bind couple space success",
      coupleSpace: response.coupleSpace,
    });
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

export async function updateCoupleSpace(req: Request, res: Response) {
  const userId = getAuthenticatedUserId(req);
  const payload = parseRequestBody(updateCoupleProfileSchema, req.body);
  await assertCoupleSpaceTablesReady();

  const [result] = await db.query<ResultSetHeader>(
    `
      UPDATE ${COUPLE_RELATIONSHIPS_TABLE}
      SET
        anniversary_date = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE status = 'active'
        AND (user_a_id = ? OR user_b_id = ?)
    `,
    [payload.anniversaryDate, userId, userId]
  );

  if (result.affectedRows === 0) {
    throw new HttpError(404, "active couple relationship not found");
  }

  const response = await buildCoupleSpaceResponse(userId);
  res.status(200).json({
    message: "update couple space success",
    coupleSpace: response.coupleSpace,
  });
}

export async function unbindCoupleSpace(req: Request, res: Response) {
  const userId = getAuthenticatedUserId(req);
  await assertCoupleSpaceTablesReady();

  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const relationship = await findActiveRelationshipByUserId(connection, userId);
    if (!relationship) {
      throw new HttpError(404, "active couple relationship not found");
    }

    await connection.query<ResultSetHeader>(
      `
        UPDATE ${COUPLE_RELATIONSHIPS_TABLE}
        SET
          status = 'unbound',
          unbound_at = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `,
      [relationship.id]
    );

    await syncUsersCoupleStatus(
      connection,
      [relationship.user_a_id, relationship.user_b_id],
      "single"
    );

    await connection.commit();
    res.status(200).json({ message: "unbind couple space success" });
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}
