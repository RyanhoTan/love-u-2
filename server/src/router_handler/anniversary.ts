import type { Request, Response } from "express";
import type { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { getAuthenticatedUserId } from "../auth.js";
import db from "../db/index.js";
import { HttpError } from "../errors.js";
import { getAnniversaryCalendar, getCalendarDateText } from "../couple/calendar.js";
import {
  createAnniversarySchema,
  updateAnniversarySchema,
} from "../schema/anniversary.js";
import { parseRequestBody } from "../validation.js";


const ANNIVERSARIES_TABLE = "anniversaries";
const COUPLE_RELATIONSHIPS_TABLE = "couple_relationships";

interface TableNameRow extends RowDataPacket {
  TABLE_NAME: string;
}

interface CoupleRelationshipRow extends RowDataPacket {
  id: number;
  time_zone: string;
}

interface AnniversaryRow extends RowDataPacket {
  id: number;
  relationship_id: number;
  created_by_user_id: number | null;
  title: string;
  type: "love" | "birthday" | "holiday" | "custom";
  original_date: Date | string;
  repeat_type: "none" | "yearly";
  reminder_days_before: number;
  status: "active" | "deleted";
  created_at: Date | string;
  updated_at: Date | string;
  deleted_at: Date | string | null;
  time_zone: string;
}

const anniversarySelectFields = `
  a.id, a.relationship_id, a.created_by_user_id, a.title, a.type,
  DATE_FORMAT(a.original_date, '%Y-%m-%d') AS original_date,
  a.repeat_type, a.reminder_days_before, a.status,
  a.created_at, a.updated_at, a.deleted_at, relationship.time_zone
`;

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

function serializeAnniversary(
  row: AnniversaryRow,
  todayDate = getCalendarDateText(row.time_zone),
) {
  const originalDate = formatDateOnly(row.original_date);
  if (!originalDate) {
    throw new HttpError(500, "anniversary original date is invalid");
  }

  const { nextOccurrenceDate, remainingDays } = getAnniversaryCalendar(
    originalDate,
    row.repeat_type,
    todayDate,
  );

  return {
    id: row.id,
    relationshipId: row.relationship_id,
    createdByUserId: row.created_by_user_id,
    title: row.title,
    type: row.type,
    originalDate,
    repeatType: row.repeat_type,
    reminderDaysBefore: row.reminder_days_before,
    status: row.status,
    nextOccurrenceDate,
    remainingDays,
    createdAt: formatDateTime(row.created_at),
    updatedAt: formatDateTime(row.updated_at),
    deletedAt: formatDateTime(row.deleted_at),
  };
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

async function assertAnniversaryTablesReady() {
  const tableNames = await getExistingTableNames();
  const requiredTables = [ANNIVERSARIES_TABLE, COUPLE_RELATIONSHIPS_TABLE];
  const missingTables = requiredTables.filter((tableName) => !tableNames.has(tableName));

  if (missingTables.length > 0) {
    throw new HttpError(
      500,
      `anniversary tables are missing: ${missingTables.join(", ")}`
    );
  }
}

async function findActiveRelationshipByUserId(userId: number) {
  const [rows] = await db.query<CoupleRelationshipRow[]>(
    `
      SELECT id, time_zone
      FROM ${COUPLE_RELATIONSHIPS_TABLE}
      WHERE status = 'bound'
        AND (user_a_id = ? OR user_b_id = ?)
      LIMIT 1
    `,
    [userId, userId]
  );

  return rows[0] ?? null;
}

export async function getAnniversaries(req: Request, res: Response) {
  const userId = getAuthenticatedUserId(req);
  await assertAnniversaryTablesReady();

  const relationship = await findActiveRelationshipByUserId(userId);
  if (!relationship) {
    res.status(200).json({
      message: "get anniversaries success",
      anniversaries: [],
      timeZone: null,
      todayDate: null,
    });
    return;
  }

  const [rows] = await db.query<AnniversaryRow[]>(
    `
      SELECT ${anniversarySelectFields}
      FROM ${ANNIVERSARIES_TABLE} AS a
      INNER JOIN ${COUPLE_RELATIONSHIPS_TABLE} AS relationship
        ON relationship.id = a.relationship_id
        AND relationship.status = 'bound'
        AND (relationship.user_a_id = ? OR relationship.user_b_id = ?)
      WHERE a.relationship_id = ?
        AND a.status = 'active'
      ORDER BY a.original_date ASC, a.id ASC
    `,
    [userId, userId, relationship.id]
  );

  const timeZone = rows[0]?.time_zone ?? relationship.time_zone;
  const todayDate = getCalendarDateText(timeZone);
  const anniversaries = rows
    .map((row) => serializeAnniversary(row, todayDate))
    .sort((left, right) => {
      if (left.remainingDays !== right.remainingDays) {
        return left.remainingDays - right.remainingDays;
      }

      return left.nextOccurrenceDate.localeCompare(right.nextOccurrenceDate);
    });

  res.status(200).json({
    message: "get anniversaries success",
    anniversaries,
    timeZone,
    todayDate,
  });
}

export async function createAnniversary(req: Request, res: Response) {
  const userId = getAuthenticatedUserId(req);
  const payload = parseRequestBody(createAnniversarySchema, req.body);
  await assertAnniversaryTablesReady();

  const relationship = await findActiveRelationshipByUserId(userId);
  if (!relationship) {
    throw new HttpError(409, "bound couple relationship not found");
  }

  const [result] = await db.query<ResultSetHeader>(
    `
      INSERT INTO ${ANNIVERSARIES_TABLE} (
        relationship_id,
        created_by_user_id,
        title,
        type,
        original_date,
        repeat_type,
        reminder_days_before,
        status
      )
      SELECT
        authorized_relationship.id,
        ?, ?, ?, ?, ?, ?, 'active'
      FROM ${COUPLE_RELATIONSHIPS_TABLE} AS authorized_relationship
      WHERE authorized_relationship.id = ?
        AND authorized_relationship.status = 'bound'
        AND (
          authorized_relationship.user_a_id = ?
          OR authorized_relationship.user_b_id = ?
        )
      LIMIT 1
    `,
    [
      userId,
      payload.title,
      payload.type,
      payload.originalDate,
      payload.repeatType,
      payload.reminderDaysBefore,
      relationship.id,
      userId,
      userId,
    ]
  );
  if (result.affectedRows === 0) {
    throw new HttpError(409, "bound couple relationship not found");
  }

  const anniversary = await findActiveAnniversaryForUser(userId, result.insertId);
  if (!anniversary) {
    throw new HttpError(500, "failed to create anniversary");
  }

  res.status(201).json({
    message: "create anniversary success",
    anniversary: serializeAnniversary(anniversary),
  });
}

async function findActiveAnniversaryForUser(userId: number, anniversaryId: number) {
  const [rows] = await db.query<AnniversaryRow[]>(
    `
      SELECT ${anniversarySelectFields}
      FROM ${ANNIVERSARIES_TABLE} AS a
      INNER JOIN ${COUPLE_RELATIONSHIPS_TABLE} AS relationship
        ON relationship.id = a.relationship_id
        AND relationship.status = 'bound'
        AND (relationship.user_a_id = ? OR relationship.user_b_id = ?)
      WHERE a.id = ?
        AND a.status = 'active'
      LIMIT 1
    `,
    [userId, userId, anniversaryId]
  );

  return rows[0] ?? null;
}

function buildAnniversaryWriteAuthorization(
  relationshipId: number,
  userId: number
) {
  return {
    sql: `relationship_id = ?
      AND EXISTS (
        SELECT 1
        FROM couple_relationships AS authorized_relationship
        WHERE authorized_relationship.id = anniversaries.relationship_id
          AND authorized_relationship.status = 'bound'
          AND (
            authorized_relationship.user_a_id = ?
            OR authorized_relationship.user_b_id = ?
          )
      )`,
    values: [relationshipId, userId, userId],
  };
}

function parseAnniversaryId(raw: string) {
  const anniversaryId = Number(raw);
  if (!Number.isInteger(anniversaryId) || anniversaryId <= 0) {
    throw new HttpError(400, "anniversary id is invalid");
  }
  return anniversaryId;
}

export async function updateAnniversary(req: Request, res: Response) {
  const userId = getAuthenticatedUserId(req);
  const anniversaryId = parseAnniversaryId(String(req.params.id));
  const payload = parseRequestBody(updateAnniversarySchema, req.body);
  await assertAnniversaryTablesReady();

  const existing = await findActiveAnniversaryForUser(userId, anniversaryId);
  if (!existing) {
    throw new HttpError(404, "anniversary not found");
  }

  const authorization = buildAnniversaryWriteAuthorization(
    existing.relationship_id,
    userId
  );
  const [result] = await db.query<ResultSetHeader>(
    `
      UPDATE ${ANNIVERSARIES_TABLE}
      SET
        title = ?,
        type = ?,
        original_date = ?,
        repeat_type = ?,
        reminder_days_before = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
        AND ${authorization.sql}
        AND status = 'active'
      LIMIT 1
    `,
    [
      payload.title,
      payload.type,
      payload.originalDate,
      payload.repeatType,
      payload.reminderDaysBefore,
      anniversaryId,
      ...authorization.values,
    ]
  );

  if (result.affectedRows === 0) {
    throw new HttpError(404, "anniversary not found");
  }

  const updated = await findActiveAnniversaryForUser(userId, anniversaryId);
  if (!updated) {
    throw new HttpError(500, "failed to update anniversary");
  }

  res.status(200).json({
    message: "update anniversary success",
    anniversary: serializeAnniversary(updated),
  });
}

export async function deleteAnniversary(req: Request, res: Response) {
  const userId = getAuthenticatedUserId(req);
  const anniversaryId = parseAnniversaryId(String(req.params.id));
  await assertAnniversaryTablesReady();

  const existing = await findActiveAnniversaryForUser(userId, anniversaryId);
  if (!existing) {
    throw new HttpError(404, "anniversary not found");
  }

  const authorization = buildAnniversaryWriteAuthorization(
    existing.relationship_id,
    userId
  );
  const [result] = await db.query<ResultSetHeader>(
    `
      UPDATE ${ANNIVERSARIES_TABLE}
      SET
        status = 'deleted',
        deleted_at = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
        AND ${authorization.sql}
        AND status = 'active'
      LIMIT 1
    `,
    [anniversaryId, ...authorization.values]
  );

  if (result.affectedRows === 0) {
    throw new HttpError(404, "anniversary not found");
  }

  res.status(200).json({
    message: "delete anniversary success",
  });
}
