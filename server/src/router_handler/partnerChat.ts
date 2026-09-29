import type { Request, Response } from "express";
import type { RowDataPacket } from "mysql2/promise";
import { getAuthenticatedUserId } from "../auth.js";
import db from "../db/index.js";
import { ensureDatabaseSchema } from "../db/schema.js";
import { HttpError } from "../errors.js";
import { createMediaReadUrl } from "./upload.js";

interface PartnerChatAudioRow extends RowDataPacket {
  id: number;
  audio_object_key: string | null;
  audio_url: string | null;
}

interface CoupleRelationshipMembershipRow extends RowDataPacket {
  id: number;
  user_a_id: number;
  user_b_id: number;
}

interface PartnerChatHistoryRow extends RowDataPacket {
  id: number;
  relationship_id: number;
  sender_id: number;
  receiver_id: number;
  text: string | null;
  message_type: "text" | "audio";
  audio_url: string | null;
  audio_object_key: string | null;
  audio_duration_seconds: number | null;
  client_message_id: string | null;
  sent_at: Date | string;
  delivered_at: Date | string | null;
  read_at: Date | string | null;
}

const DEFAULT_HISTORY_PAGE_SIZE = 50;
const MAX_HISTORY_PAGE_SIZE = 100;

export function parsePartnerChatHistoryInteger(value: unknown, label: string) {
  if (typeof value !== "string" || !/^[1-9]\d*$/.test(value)) {
    throw new HttpError(400, `invalid ${label}`);
  }

  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed) || parsed <= 0) {
    throw new HttpError(400, `invalid ${label}`);
  }

  return parsed;
}

export function serializePartnerChatHistoryMessage(
  message: PartnerChatHistoryRow,
  userId: number,
) {
  const sentAt =
    message.sent_at instanceof Date
      ? message.sent_at.toISOString()
      : new Date(message.sent_at).toISOString();

  return {
    id: String(message.id),
    fromUserId: message.sender_id,
    relationshipId: message.relationship_id,
    text: message.text ?? "",
    messageType: message.message_type,
    ...(message.audio_object_key == null && message.audio_url
      ? { audioUrl: message.audio_url }
      : {}),
    ...(message.audio_duration_seconds != null &&
    Number.isFinite(message.audio_duration_seconds) &&
    message.audio_duration_seconds > 0
      ? { audioDurationSeconds: message.audio_duration_seconds }
      : {}),
    ...(message.client_message_id
      ? { clientMessageId: message.client_message_id }
      : {}),
    sentAt,
    deliveryStatus:
      message.sender_id !== userId
        ? "sent"
        : message.read_at != null
          ? "read"
          : message.delivered_at != null
            ? "sent"
            : "partner_offline",
  };
}

function parseMessageId(value: string | string[] | undefined) {
  const rawValue = Array.isArray(value) ? value[0] : value;
  if (!rawValue || !/^[1-9]\d*$/.test(rawValue)) {
    throw new HttpError(400, "invalid message id");
  }

  const messageId = Number(rawValue);

  if (!Number.isSafeInteger(messageId) || messageId <= 0) {
    throw new HttpError(400, "invalid message id");
  }

  return messageId;
}

export async function getPartnerChatHistory(req: Request, res: Response) {
  const userId = getAuthenticatedUserId(req);
  const relationshipId = parsePartnerChatHistoryInteger(
    req.query.relationshipId,
    "relationship id",
  );
  const beforeId =
    req.query.beforeId === undefined
      ? null
      : parsePartnerChatHistoryInteger(req.query.beforeId, "message cursor");
  const limit =
    req.query.limit === undefined
      ? DEFAULT_HISTORY_PAGE_SIZE
      : parsePartnerChatHistoryInteger(req.query.limit, "page size");

  if (limit > MAX_HISTORY_PAGE_SIZE) {
    throw new HttpError(400, "page size is too large");
  }

  await ensureDatabaseSchema();

  const [relationshipRows] = await db.query<CoupleRelationshipMembershipRow[]>(
    `
      SELECT id, user_a_id, user_b_id
      FROM couple_relationships
      WHERE id = ?
        AND status = 'bound'
        AND (user_a_id = ? OR user_b_id = ?)
      LIMIT 1
    `,
    [relationshipId, userId, userId],
  );
  const relationship = relationshipRows[0];
  if (!relationship) {
    throw new HttpError(404, "chat history not found");
  }

  const cursorClause = beforeId === null ? "" : "AND chat_message.id < ?";
  const parameters: number[] = [
    relationship.id,
    relationship.user_a_id,
    relationship.user_b_id,
    relationship.id,
    relationship.user_a_id,
    relationship.user_b_id,
    relationship.user_b_id,
    relationship.user_a_id,
  ];
  if (beforeId !== null) {
    parameters.push(beforeId);
  }
  parameters.push(limit + 1);

  const [rows] = await db.query<PartnerChatHistoryRow[]>(
    `
      SELECT
        chat_message.id,
        chat_message.relationship_id,
        chat_message.sender_id,
        chat_message.receiver_id,
        chat_message.text,
        chat_message.message_type,
        chat_message.audio_url,
        chat_message.audio_object_key,
        chat_message.audio_duration_seconds,
        chat_message.client_message_id,
        chat_message.sent_at,
        chat_message.delivered_at,
        chat_message.read_at
      FROM partner_chat_messages AS chat_message
      INNER JOIN couple_relationships AS active_relationship
        ON active_relationship.id = chat_message.relationship_id
       AND active_relationship.id = ?
       AND active_relationship.status = 'bound'
       AND active_relationship.user_a_id = ?
       AND active_relationship.user_b_id = ?
      WHERE chat_message.relationship_id = ?
        AND (
          (chat_message.sender_id = ? AND chat_message.receiver_id = ?)
          OR
          (chat_message.sender_id = ? AND chat_message.receiver_id = ?)
        )
        ${cursorClause}
      ORDER BY chat_message.id DESC
      LIMIT ?
    `,
    parameters,
  );

  const hasMore = rows.length > limit;
  const pageRows = rows.slice(0, limit).reverse();
  const messages = pageRows.map((message) =>
    serializePartnerChatHistoryMessage(message, userId),
  );

  res.setHeader("Cache-Control", "private, no-store");
  res.status(200).json({
    relationshipId: relationship.id,
    messages,
    hasMore,
    nextBeforeId: hasMore ? String(pageRows[0]?.id) : null,
  });
}

export async function getPartnerChatAudioUrl(req: Request, res: Response) {
  const userId = getAuthenticatedUserId(req);
  const messageId = parseMessageId(req.params.id);

  await ensureDatabaseSchema();

  const [rows] = await db.query<PartnerChatAudioRow[]>(
    `
      SELECT
        chat_message.id,
        chat_message.audio_object_key,
        chat_message.audio_url
      FROM partner_chat_messages AS chat_message
      INNER JOIN couple_relationships AS relationship
        ON relationship.id = chat_message.relationship_id
       AND relationship.status = 'bound'
      WHERE chat_message.id = ?
        AND chat_message.message_type = 'audio'
        AND (
          (chat_message.sender_id = relationship.user_a_id
            AND chat_message.receiver_id = relationship.user_b_id)
          OR
          (chat_message.sender_id = relationship.user_b_id
            AND chat_message.receiver_id = relationship.user_a_id)
        )
        AND (chat_message.sender_id = ? OR chat_message.receiver_id = ?)
      LIMIT 1
    `,
    [messageId, userId, userId],
  );

  const message = rows[0];
  if (!message) {
    throw new HttpError(404, "audio message not found");
  }

  const objectKey = message.audio_object_key?.trim();
  let url: string;
  let expiresIn: number | undefined;

  if (objectKey) {
    expiresIn = 300;
    try {
      url = await createMediaReadUrl(objectKey, expiresIn);
    } catch {
      throw new HttpError(503, "audio URL temporarily unavailable");
    }
  } else if (message.audio_url?.trim()) {
    url = message.audio_url.trim();
  } else {
    throw new HttpError(404, "audio media not found");
  }

  res.setHeader("Cache-Control", "private, no-store");
  res.status(200).json({
    messageId: String(message.id),
    url,
    ...(expiresIn ? { expiresIn } : {}),
  });
}
