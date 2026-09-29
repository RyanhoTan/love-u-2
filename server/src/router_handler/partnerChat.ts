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
