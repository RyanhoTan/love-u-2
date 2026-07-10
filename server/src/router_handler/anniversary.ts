import type { Request, Response } from "express";
import type { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { getAuthenticatedUserId } from "../auth.js";
import db from "../db/index.js";
import { HttpError } from "../errors.js";
import { createAnniversarySchema } from "../schema/anniversary.js";
import { parseRequestBody } from "../validation.js";

const ANNIVERSARIES_TABLE = "anniversaries";
const COUPLE_RELATIONSHIPS_TABLE = "couple_relationships";

interface TableNameRow extends RowDataPacket {
  TABLE_NAME: string;
}

interface CoupleRelationshipRow extends RowDataPacket {
  id: number;
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

function formatDateParts(year: number, month: number, day: number) {
  return [
    String(year).padStart(4, "0"),
    String(month).padStart(2, "0"),
    String(day).padStart(2, "0"),
  ].join("-");
}

function parseDateOnly(value: string) {
  const [yearText, monthText, dayText] = value.split("-");

  return {
    year: Number(yearText),
    month: Number(monthText),
    day: Number(dayText),
  };
}

function getTodayDateText() {
  const now = new Date();
  return formatDateParts(now.getFullYear(), now.getMonth() + 1, now.getDate());
}

function isLeapYear(year: number) {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

function normalizeAnnualOccurrenceDate(dateText: string, targetYear: number) {
  const { month, day } = parseDateOnly(dateText);

  if (month === 2 && day === 29 && !isLeapYear(targetYear)) {
    return formatDateParts(targetYear, 2, 28);
  }

  return formatDateParts(targetYear, month, day);
}

function getNextOccurrenceDate(dateText: string, repeatType: "none" | "yearly") {
  if (repeatType === "none") {
    return dateText;
  }

  const todayText = getTodayDateText();
  const { year } = parseDateOnly(todayText);
  const currentYearOccurrence = normalizeAnnualOccurrenceDate(dateText, year);

  if (currentYearOccurrence >= todayText) {
    return currentYearOccurrence;
  }

  return normalizeAnnualOccurrenceDate(dateText, year + 1);
}

function differenceInDays(startDateText: string, endDateText: string) {
  const start = parseDateOnly(startDateText);
  const end = parseDateOnly(endDateText);
  const startDate = new Date(start.year, start.month - 1, start.day);
  const endDate = new Date(end.year, end.month - 1, end.day);

  return Math.round(
    (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
  );
}

function serializeAnniversary(row: AnniversaryRow) {
  const originalDate = formatDateOnly(row.original_date);
  if (!originalDate) {
    throw new HttpError(500, "anniversary original date is invalid");
  }

  const nextOccurrenceDate = getNextOccurrenceDate(originalDate, row.repeat_type);
  const remainingDays = Math.max(
    0,
    differenceInDays(getTodayDateText(), nextOccurrenceDate)
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
      SELECT id
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
    });
    return;
  }

  const [rows] = await db.query<AnniversaryRow[]>(
    `
      SELECT
        id,
        relationship_id,
        created_by_user_id,
        title,
        type,
        original_date,
        repeat_type,
        reminder_days_before,
        status,
        created_at,
        updated_at,
        deleted_at
      FROM ${ANNIVERSARIES_TABLE}
      WHERE relationship_id = ?
        AND status = 'active'
      ORDER BY original_date ASC, id ASC
    `,
    [relationship.id]
  );

  const anniversaries = rows
    .map(serializeAnniversary)
    .sort((left, right) => {
      if (left.remainingDays !== right.remainingDays) {
        return left.remainingDays - right.remainingDays;
      }

      return left.nextOccurrenceDate.localeCompare(right.nextOccurrenceDate);
    });

  res.status(200).json({
    message: "get anniversaries success",
    anniversaries,
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
      VALUES (?, ?, ?, ?, ?, ?, ?, 'active')
    `,
    [
      relationship.id,
      userId,
      payload.title,
      payload.type,
      payload.originalDate,
      payload.repeatType,
      payload.reminderDaysBefore,
    ]
  );

  const [rows] = await db.query<AnniversaryRow[]>(
    `
      SELECT
        id,
        relationship_id,
        created_by_user_id,
        title,
        type,
        original_date,
        repeat_type,
        reminder_days_before,
        status,
        created_at,
        updated_at,
        deleted_at
      FROM ${ANNIVERSARIES_TABLE}
      WHERE id = ?
      LIMIT 1
    `,
    [result.insertId]
  );

  const anniversary = rows[0];
  if (!anniversary) {
    throw new HttpError(500, "failed to create anniversary");
  }

  res.status(201).json({
    message: "create anniversary success",
    anniversary: serializeAnniversary(anniversary),
  });
}
