import type { IncomingMessage, Server as HttpServer } from "node:http";
import type { Duplex } from "node:stream";
import type { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import type { RawData } from "ws";
import { WebSocket, WebSocketServer } from "ws";
import { z } from "zod";
import { verifyAuthToken } from "../auth.js";
import db from "../db/index.js";
import { ensureDatabaseSchema } from "../db/schema.js";
import {
  isInteractObjectKeyOwnedByUser,
  partnerChatAudioMessageSchema,
  partnerChatDeliveryAckSchema,
} from "../schema/partnerChat.js";
import { getPartnerChatDeliveryStatus } from "./delivery-state.js";

const CHAT_PATH = "/partner-chat";
const HEARTBEAT_INTERVAL_MS = 30_000;
const MAX_MESSAGE_LENGTH = 2_000;

interface CoupleRelationshipRow extends RowDataPacket {
  id: number;
  user_a_id: number;
  user_b_id: number;
}

interface PartnerChatMessage {
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
  delivery_attempted_at: Date | string | null;
  delivered_at: Date | string | null;
  read_at: Date | string | null;
}

interface PartnerChatMessageRow extends PartnerChatMessage, RowDataPacket {}

type PartnerChatWritePayload =
  | { messageType: "text"; text: string; clientMessageId?: string }
  | {
      messageType: "audio";
      audioObjectKey?: string;
      audioUrl?: string;
      audioDurationSeconds?: number;
      clientMessageId?: string;
    };

class PartnerChatIdempotencyConflictError extends Error {
  constructor() {
    super("client message id conflicts with a previously saved message");
    this.name = "PartnerChatIdempotencyConflictError";
  }
}

interface ReadReceiptRow extends RowDataPacket {
  id: number;
  read_at: Date | string;
}

interface ActiveRelationshipIdRow extends RowDataPacket {
  id: number;
}

interface PartnerChatConnection {
  socket: WebSocket;
  userId: number;
  partnerId: number;
  relationshipId: number;
  supportsDeliveryAcknowledgement: boolean;
  isAlive: boolean;
}

export const incomingPayloadSchema = z.union([
  z
    .object({
      type: z.literal("message"),
      messageType: z.literal("text"),
      text: z.string().trim().min(1).max(MAX_MESSAGE_LENGTH),
      clientMessageId: z.string().trim().min(1).max(100).optional(),
    })
    .strict(),
  partnerChatAudioMessageSchema,
  partnerChatDeliveryAckSchema,
  z.object({
    type: z.literal("read"),
  }).strict(),
]);

const connectionsByUserId = new Map<number, Set<PartnerChatConnection>>();

function ensurePartnerChatSchema() {
  return ensureDatabaseSchema();
}

function sendJson(socket: WebSocket, payload: unknown) {
  if (socket.readyState !== WebSocket.OPEN) {
    return false;
  }

  try {
    socket.send(JSON.stringify(payload));
    return true;
  } catch {
    return false;
  }
}

export function isSamePartnerChatMessagePayload(
  savedMessage: Pick<
    PartnerChatMessage,
    | "message_type"
    | "text"
    | "audio_url"
    | "audio_object_key"
    | "audio_duration_seconds"
  >,
  payload: PartnerChatWritePayload,
) {
  if (payload.messageType === "text") {
    return (
      savedMessage.message_type === "text" &&
      savedMessage.text === payload.text &&
      savedMessage.audio_url === null &&
      savedMessage.audio_object_key === null &&
      savedMessage.audio_duration_seconds === null
    );
  }

  return (
    savedMessage.message_type === "audio" &&
    savedMessage.text === null &&
    savedMessage.audio_url === (payload.audioUrl ?? null) &&
    savedMessage.audio_object_key === (payload.audioObjectKey ?? null) &&
    savedMessage.audio_duration_seconds ===
      (payload.audioDurationSeconds ?? null)
  );
}

function getClientMessageId(payload: unknown) {
  if (!payload || typeof payload !== "object") {
    return undefined;
  }

  const candidate = (payload as { clientMessageId?: unknown }).clientMessageId;
  const parsed = z.string().trim().min(1).max(100).safeParse(candidate);
  return parsed.success ? parsed.data : undefined;
}

function rejectUpgrade(socket: Duplex, statusCode: number, message: string) {
  socket.write(
    `HTTP/1.1 ${statusCode} ${message}\r\nConnection: close\r\nContent-Type: text/plain\r\nContent-Length: ${message.length}\r\n\r\n${message}`
  );
  socket.destroy();
}

function getTokenFromRequest(request: IncomingMessage) {
  const url = new URL(request.url ?? "", "http://localhost");
  const queryToken = url.searchParams.get("token")?.trim();
  if (queryToken) {
    return queryToken;
  }

  const authorization = request.headers.authorization;
  if (!authorization) {
    return null;
  }

  const [scheme, token] = authorization.split(" ");
  return scheme === "Bearer" && token ? token : null;
}

async function findActiveRelationshipByUserId(userId: number) {
  const [rows] = await db.query<CoupleRelationshipRow[]>(
    `
      SELECT
        id,
        user_a_id,
        user_b_id
      FROM couple_relationships
      WHERE status = 'bound'
        AND (user_a_id = ? OR user_b_id = ?)
      LIMIT 1
    `,
    [userId, userId]
  );

  return rows[0] ?? null;
}

function addConnection(connection: PartnerChatConnection) {
  const existing = connectionsByUserId.get(connection.userId) ?? new Set();
  existing.add(connection);
  connectionsByUserId.set(connection.userId, existing);
}

function removeConnection(connection: PartnerChatConnection) {
  const existing = connectionsByUserId.get(connection.userId);
  if (!existing) {
    return;
  }

  existing.delete(connection);
  if (existing.size === 0) {
    connectionsByUserId.delete(connection.userId);
  }
}

function closeRelationshipConnections(
  relationshipId: number,
  code: number,
  reason: string,
) {
  const connections = [...connectionsByUserId.values()].flatMap((items) =>
    [...items].filter((connection) => connection.relationshipId === relationshipId),
  );

  for (const connection of connections) {
    removeConnection(connection);
    if (connection.socket.readyState === WebSocket.OPEN) {
      connection.socket.close(code, reason);
    } else if (connection.socket.readyState === WebSocket.CONNECTING) {
      connection.socket.terminate();
    }
  }
}

export function closePartnerChatConnectionsForRelationship(relationshipId: number) {
  closeRelationshipConnections(relationshipId, 4003, "relationship_unbound");
}

async function isConnectionRelationshipCurrent(connection: PartnerChatConnection) {
  const [rows] = await db.query<ActiveRelationshipIdRow[]>(
    `
      SELECT id
      FROM couple_relationships
      WHERE id = ?
        AND status = 'bound'
        AND (
          (user_a_id = ? AND user_b_id = ?)
          OR
          (user_a_id = ? AND user_b_id = ?)
        )
      LIMIT 1
    `,
    [
      connection.relationshipId,
      connection.userId,
      connection.partnerId,
      connection.partnerId,
      connection.userId,
    ],
  );

  return rows.length > 0;
}

function getPartnerConnections(partnerId: number, relationshipId: number) {
  const partnerConnections = connectionsByUserId.get(partnerId);
  if (!partnerConnections) {
    return [];
  }

  return [...partnerConnections].filter(
    (connection) => connection.relationshipId === relationshipId
  );
}

function toIsoString(value: Date | string) {
  if (value instanceof Date) {
    return value.toISOString();
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
}

function createMessagePayload(message: PartnerChatMessage) {
  const audioDurationSeconds =
    message.message_type === "audio" &&
    message.audio_duration_seconds != null &&
    Number.isFinite(message.audio_duration_seconds) &&
    message.audio_duration_seconds > 0
      ? message.audio_duration_seconds
      : undefined;

  return {
    type: "message",
    id: String(message.id),
    fromUserId: message.sender_id,
    relationshipId: message.relationship_id,
    text: message.text ?? "",
    messageType: message.message_type,
    audioUrl:
      message.audio_object_key == null
        ? message.audio_url ?? undefined
        : undefined,
    audioDurationSeconds,
    clientMessageId: message.client_message_id ?? undefined,
    sentAt: toIsoString(message.sent_at),
  };
}

function createDeliveryPayload(
  message: PartnerChatMessage,
  status: "sent" | "sending" | "partner_offline",
) {
  return {
    type: "delivery",
    status,
    clientMessageId: message.client_message_id ?? undefined,
    serverMessageId: String(message.id),
    sentAt: toIsoString(message.sent_at),
  };
}

async function saveMessage(
  connection: PartnerChatConnection,
  payload: PartnerChatWritePayload
) {
  await ensurePartnerChatSchema();

  const sentAt = new Date();
  const databaseConnection = await db.getConnection();
  let transactionStarted = false;

  try {
    await databaseConnection.beginTransaction();
    transactionStarted = true;

    const [relationships] = await databaseConnection.query<ActiveRelationshipIdRow[]>(
      `
        SELECT id
        FROM couple_relationships
        WHERE id = ?
          AND status = 'bound'
          AND (
            (user_a_id = ? AND user_b_id = ?)
            OR
            (user_a_id = ? AND user_b_id = ?)
          )
        LIMIT 1
        FOR UPDATE
      `,
      [
        connection.relationshipId,
        connection.userId,
        connection.partnerId,
        connection.partnerId,
        connection.userId,
      ],
    );

    if (relationships.length === 0) {
      throw new Error("partner chat relationship is no longer active");
    }

    const [result] = await databaseConnection.execute<ResultSetHeader>(
      `
        INSERT INTO partner_chat_messages (
          relationship_id,
          sender_id,
          receiver_id,
          text,
          message_type,
          audio_url,
          audio_object_key,
          audio_duration_seconds,
          client_message_id,
          sent_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE id = LAST_INSERT_ID(id)
      `,
      [
        connection.relationshipId,
        connection.userId,
        connection.partnerId,
        payload.messageType === "text" ? payload.text : null,
        payload.messageType,
        payload.messageType === "audio" ? (payload.audioUrl ?? null) : null,
        payload.messageType === "audio"
          ? (payload.audioObjectKey ?? null)
          : null,
        payload.messageType === "audio"
          ? (payload.audioDurationSeconds ?? null)
          : null,
        payload.clientMessageId ?? null,
        sentAt,
      ],
    );

    const [rows] = await databaseConnection.query<PartnerChatMessageRow[]>(
      `
        SELECT
          id,
          relationship_id,
          sender_id,
          receiver_id,
          text,
          message_type,
          audio_url,
          audio_object_key,
          audio_duration_seconds,
          client_message_id,
          sent_at,
          delivery_attempted_at,
          delivered_at,
          read_at
        FROM partner_chat_messages
        WHERE id = ?
        LIMIT 1
      `,
      [result.insertId],
    );

    const savedMessage = rows[0];
    if (!savedMessage) {
      throw new Error("saved partner chat message could not be loaded");
    }

    if (
      payload.clientMessageId !== undefined &&
      savedMessage.client_message_id === payload.clientMessageId &&
      (savedMessage.relationship_id !== connection.relationshipId ||
        savedMessage.sender_id !== connection.userId ||
        savedMessage.receiver_id !== connection.partnerId ||
        !isSamePartnerChatMessagePayload(savedMessage, payload))
    ) {
      throw new PartnerChatIdempotencyConflictError();
    }

    if (
      savedMessage.relationship_id !== connection.relationshipId ||
      savedMessage.sender_id !== connection.userId ||
      savedMessage.receiver_id !== connection.partnerId
    ) {
      throw new Error("saved partner chat message could not be loaded");
    }

    if (
      payload.clientMessageId !== undefined &&
      !isSamePartnerChatMessagePayload(savedMessage, payload)
    ) {
      throw new PartnerChatIdempotencyConflictError();
    }

    await databaseConnection.commit();
    transactionStarted = false;
    return savedMessage;
  } catch (error) {
    if (transactionStarted) {
      try {
        await databaseConnection.rollback();
      } catch {
        // Preserve the original error; the connection will be released below.
      }
    }
    throw error;
  } finally {
    databaseConnection.release();
  }
}

async function updateMessageDeliveryState(
  messageIds: number[],
  senderId: number,
  receiverId: number,
  relationshipId: number,
  acknowledge: boolean,
) {
  if (messageIds.length === 0) {
    return [];
  }

  const updates = [
    "delivery_attempted_at = COALESCE(delivery_attempted_at, CURRENT_TIMESTAMP(3))",
  ];
  if (acknowledge) {
    updates.push(
      "delivered_at = COALESCE(delivered_at, CURRENT_TIMESTAMP(3))",
    );
  }

  await db.query<ResultSetHeader>(
    `
      UPDATE partner_chat_messages
      SET ${updates.join(", ")}
      WHERE id IN (?)
        AND sender_id = ?
        AND receiver_id = ?
        AND relationship_id = ?
        ${acknowledge ? "" : "AND delivered_at IS NULL"}
        AND EXISTS (
          SELECT 1
          FROM couple_relationships AS relationship
          WHERE relationship.id = partner_chat_messages.relationship_id
            AND relationship.status = 'bound'
            AND (
              (relationship.user_a_id = ? AND relationship.user_b_id = ?)
              OR
              (relationship.user_b_id = ? AND relationship.user_a_id = ?)
            )
        )
    `,
    [
      messageIds,
      senderId,
      receiverId,
      relationshipId,
      receiverId,
      senderId,
      receiverId,
      senderId,
    ],
  );

  const [rows] = await db.query<PartnerChatMessageRow[]>(
    `
      SELECT
        id,
        relationship_id,
        sender_id,
        receiver_id,
        text,
        message_type,
        audio_url,
        audio_object_key,
        audio_duration_seconds,
        client_message_id,
        sent_at,
        delivery_attempted_at,
        delivered_at,
        read_at
      FROM partner_chat_messages
      WHERE id IN (?)
        AND sender_id = ?
        AND receiver_id = ?
        AND relationship_id = ?
        AND EXISTS (
          SELECT 1
          FROM couple_relationships AS relationship
          WHERE relationship.id = partner_chat_messages.relationship_id
            AND relationship.status = 'bound'
            AND (
              (relationship.user_a_id = ? AND relationship.user_b_id = ?)
              OR
              (relationship.user_b_id = ? AND relationship.user_a_id = ?)
            )
        )
    `,
    [
      messageIds,
      senderId,
      receiverId,
      relationshipId,
      receiverId,
      senderId,
      receiverId,
      senderId,
    ],
  );
  return rows;
}

async function deliverPendingMessages(connection: PartnerChatConnection) {
  await ensurePartnerChatSchema();

  const [messages] = await db.query<PartnerChatMessageRow[]>(
    `
      SELECT
        id,
        relationship_id,
        sender_id,
        receiver_id,
        text,
        message_type,
        audio_url,
        audio_object_key,
        audio_duration_seconds,
        client_message_id,
        sent_at,
        delivery_attempted_at,
        delivered_at,
        read_at
      FROM partner_chat_messages
      WHERE receiver_id = ?
        AND relationship_id = ?
        AND delivered_at IS NULL
        AND EXISTS (
          SELECT 1
          FROM couple_relationships AS relationship
          WHERE relationship.id = partner_chat_messages.relationship_id
            AND relationship.status = 'bound'
            AND (
              (relationship.user_a_id = partner_chat_messages.sender_id
                AND relationship.user_b_id = partner_chat_messages.receiver_id)
              OR
              (relationship.user_b_id = partner_chat_messages.sender_id
                AND relationship.user_a_id = partner_chat_messages.receiver_id)
            )
        )
      ORDER BY id ASC
    `,
    [connection.userId, connection.relationshipId]
  );

  const deliveredMessages: PartnerChatMessage[] = [];
  for (const message of messages) {
    if (sendJson(connection.socket, createMessagePayload(message))) {
      deliveredMessages.push(message);
    }
  }

  const attemptedMessages = await updateMessageDeliveryState(
    deliveredMessages.map((message) => message.id),
    connection.partnerId,
    connection.userId,
    connection.relationshipId,
    !connection.supportsDeliveryAcknowledgement,
  );
  for (const message of attemptedMessages) {
    for (const senderConnection of getPartnerConnections(
      message.sender_id,
      message.relationship_id,
    )) {
      sendJson(
        senderConnection.socket,
        createDeliveryPayload(
          message,
          getPartnerChatDeliveryStatus(message, true),
        ),
      );
    }
  }
}

function sendReadReceipt(
  socket: WebSocket,
  relationshipId: number,
  messageIds: number[],
  readAt: Date | string
) {
  sendJson(socket, {
    type: "read_receipt",
    relationshipId,
    messageIds: messageIds.map(String),
    readAt: toIsoString(readAt),
  });
}

async function markIncomingMessagesRead(connection: PartnerChatConnection) {
  await ensurePartnerChatSchema();

  const [messages] = await db.query<ReadReceiptRow[]>(
    `
      SELECT id, COALESCE(read_at, CURRENT_TIMESTAMP(3)) AS read_at
      FROM partner_chat_messages
      WHERE receiver_id = ?
        AND relationship_id = ?
        AND read_at IS NULL
        AND EXISTS (
          SELECT 1
          FROM couple_relationships AS relationship
          WHERE relationship.id = partner_chat_messages.relationship_id
            AND relationship.status = 'bound'
        )
      ORDER BY id ASC
    `,
    [connection.userId, connection.relationshipId]
  );

  if (messages.length === 0) {
    return null;
  }

  const readAt = new Date();
  const messageIds = messages.map((message) => message.id);

  const [updateResult] = await db.query<ResultSetHeader>(
    `
    UPDATE partner_chat_messages
    SET
      delivery_attempted_at = COALESCE(delivery_attempted_at, ?),
      delivered_at = COALESCE(delivered_at, ?),
      read_at = COALESCE(read_at, ?)
      WHERE id IN (?)
        AND EXISTS (
          SELECT 1
          FROM couple_relationships AS relationship
          WHERE relationship.id = partner_chat_messages.relationship_id
            AND relationship.status = 'bound'
        )
    `,
    [readAt, readAt, readAt, messageIds]
  );

  if (updateResult.affectedRows === 0) {
    return null;
  }

  return { messageIds, readAt };
}

async function sendExistingReadReceipts(connection: PartnerChatConnection) {
  await ensurePartnerChatSchema();

  const [messages] = await db.query<ReadReceiptRow[]>(
    `
      SELECT id, read_at
      FROM partner_chat_messages
      WHERE sender_id = ?
        AND relationship_id = ?
        AND read_at IS NOT NULL
        AND EXISTS (
          SELECT 1
          FROM couple_relationships AS relationship
          WHERE relationship.id = partner_chat_messages.relationship_id
            AND relationship.status = 'bound'
        )
      ORDER BY id DESC
      LIMIT 300
    `,
    [connection.userId, connection.relationshipId]
  );

  if (messages.length === 0) {
    return;
  }

  sendReadReceipt(
    connection.socket,
    connection.relationshipId,
    messages.map((message) => message.id),
    messages[0].read_at
  );
}

async function handleRead(connection: PartnerChatConnection) {
  const receipt = await markIncomingMessagesRead(connection);
  if (!receipt) {
    return;
  }

  for (const partnerConnection of getPartnerConnections(
    connection.partnerId,
    connection.relationshipId
  )) {
    sendReadReceipt(
      partnerConnection.socket,
      connection.relationshipId,
      receipt.messageIds,
      receipt.readAt
    );
  }
}

async function handleDeliveryAcknowledgement(
  connection: PartnerChatConnection,
  messageId: number,
) {
  if (!connection.supportsDeliveryAcknowledgement) {
    return;
  }

  await ensurePartnerChatSchema();
  const [message] = await updateMessageDeliveryState(
    [messageId],
    connection.partnerId,
    connection.userId,
    connection.relationshipId,
    true,
  );
  if (!message || message.delivered_at == null) {
    return;
  }

  for (const senderConnection of getPartnerConnections(
    message.sender_id,
    message.relationship_id,
  )) {
    sendJson(senderConnection.socket, createDeliveryPayload(message, "sent"));
  }
}

async function handleIncomingPayload(connection: PartnerChatConnection, rawData: RawData) {
  try {
    if (!(await isConnectionRelationshipCurrent(connection))) {
      closePartnerChatConnectionsForRelationship(connection.relationshipId);
      return;
    }
  } catch {
    console.error("failed to validate partner chat relationship");
    closeRelationshipConnections(
      connection.relationshipId,
      1011,
      "relationship_check_failed",
    );
    return;
  }

  let payload: unknown;

  try {
    payload = JSON.parse(rawData.toString());
  } catch {
    sendJson(connection.socket, {
      type: "error",
      code: "invalid_json",
      message: "invalid json payload",
    });
    return;
  }

  const parsed = incomingPayloadSchema.safeParse(payload);
  if (!parsed.success) {
    sendJson(connection.socket, {
      type: "error",
      code: "invalid_message",
      message: parsed.error.issues[0]?.message ?? "invalid message payload",
      clientMessageId: getClientMessageId(payload),
    });
    return;
  }

  if (parsed.data.type === "read") {
    try {
      await handleRead(connection);
    } catch (error) {
      console.error("failed to mark partner chat messages read", error);
      sendJson(connection.socket, {
        type: "error",
        code: "read_failed",
        message: "failed to mark messages read",
      });
    }
    return;
  }

  if (parsed.data.type === "delivered") {
    try {
      await handleDeliveryAcknowledgement(
        connection,
        Number(parsed.data.messageId),
      );
    } catch (error) {
      console.error("failed to persist partner chat delivery acknowledgement", error);
      sendJson(connection.socket, {
        type: "error",
        code: "delivery_ack_failed",
        message: "failed to acknowledge message delivery",
      });
    }
    return;
  }

  if (
    parsed.data.messageType === "audio" &&
    parsed.data.audioObjectKey !== undefined &&
    !isInteractObjectKeyOwnedByUser(
      connection.userId,
      parsed.data.audioObjectKey,
    )
  ) {
    sendJson(connection.socket, {
      type: "error",
      code: "invalid_audio_object_key",
      message: "audio object key is invalid",
      clientMessageId: parsed.data.clientMessageId,
    });
    return;
  }

  let message: PartnerChatMessage;
  try {
    message = await saveMessage(
      connection,
      parsed.data.messageType === "text"
        ? {
            messageType: "text",
            text: parsed.data.text,
            clientMessageId: parsed.data.clientMessageId,
          }
        : {
            messageType: "audio",
            audioObjectKey: parsed.data.audioObjectKey,
            audioUrl: parsed.data.audioUrl,
            audioDurationSeconds: parsed.data.audioDurationSeconds,
            clientMessageId: parsed.data.clientMessageId,
          }
    );
  } catch (error) {
    if (error instanceof PartnerChatIdempotencyConflictError) {
      sendJson(connection.socket, {
        type: "error",
        code: "client_message_id_conflict",
        message: "message id was already used for a different message",
        clientMessageId: parsed.data.clientMessageId,
      });
      return;
    }

    console.error("failed to save partner chat message", error);
    sendJson(connection.socket, {
      type: "error",
      code: "message_save_failed",
      message: "failed to save message",
      clientMessageId: parsed.data.clientMessageId,
    });
    return;
  }

  const partnerConnections = getPartnerConnections(
    connection.partnerId,
    connection.relationshipId
  );

  let acceptedByOpenRecipient = false;
  let acceptedByLegacyRecipient = false;
  for (const partnerConnection of partnerConnections) {
    if (sendJson(partnerConnection.socket, createMessagePayload(message))) {
      acceptedByOpenRecipient = true;
      if (!partnerConnection.supportsDeliveryAcknowledgement) {
        acceptedByLegacyRecipient = true;
      }
    }
  }

  let deliveryState = message;
  if (acceptedByOpenRecipient) {
    try {
      const [updatedMessage] = await updateMessageDeliveryState(
        [message.id],
        connection.userId,
        connection.partnerId,
        connection.relationshipId,
        acceptedByLegacyRecipient,
      );
      deliveryState = updatedMessage ?? message;
    } catch (error) {
      console.error("failed to record partner chat delivery attempt", error);
    }
  }

  sendJson(
    connection.socket,
    createDeliveryPayload(
      deliveryState,
      getPartnerChatDeliveryStatus(deliveryState, acceptedByOpenRecipient),
    ),
  );
}

export function setupPartnerChat(server: HttpServer) {
  const wss = new WebSocketServer({ noServer: true });
  void ensurePartnerChatSchema().catch((error) => {
    console.error("failed to initialize partner chat schema", error);
  });

  server.on("upgrade", async (request, socket, head) => {
    const url = new URL(request.url ?? "", "http://localhost");
    if (url.pathname !== CHAT_PATH) {
      return;
    }

    try {
      const token = getTokenFromRequest(request);
      if (!token) {
        rejectUpgrade(socket, 401, "Unauthorized");
        return;
      }

      const auth = verifyAuthToken(token);
      const userId = Number(auth.sub);
      if (!Number.isInteger(userId) || userId <= 0) {
        rejectUpgrade(socket, 401, "Unauthorized");
        return;
      }

      const relationship = await findActiveRelationshipByUserId(userId);
      if (!relationship) {
        rejectUpgrade(socket, 403, "No bound partner");
        return;
      }

      const partnerId =
        relationship.user_a_id === userId
          ? relationship.user_b_id
          : relationship.user_a_id;
      const supportsDeliveryAcknowledgement =
        url.searchParams.get("deliveryAck") === "1";

      wss.handleUpgrade(request, socket, head, (ws) => {
        const connection: PartnerChatConnection = {
          socket: ws,
          userId,
          partnerId,
          relationshipId: relationship.id,
          supportsDeliveryAcknowledgement,
          isAlive: true,
        };

        addConnection(connection);
        wss.emit("connection", ws, request, connection);
      });
    } catch (error) {
      console.error("partner chat upgrade failed", error);
      rejectUpgrade(socket, 401, "Unauthorized");
    }
  });

  wss.on(
    "connection",
    (socket: WebSocket, _request: IncomingMessage, connection: PartnerChatConnection) => {
      sendJson(socket, {
        type: "ready",
        userId: connection.userId,
        partnerId: connection.partnerId,
        relationshipId: connection.relationshipId,
        ...(connection.supportsDeliveryAcknowledgement
          ? { deliveryAckVersion: 1 }
          : {}),
      });

      socket.on("pong", () => {
        connection.isAlive = true;
      });

      socket.on("message", (rawData) => {
        void handleIncomingPayload(connection, rawData);
      });

      socket.on("close", () => {
        removeConnection(connection);
      });

      void deliverPendingMessages(connection).catch((error) => {
        console.error("failed to deliver pending partner chat messages", error);
      });

      void sendExistingReadReceipts(connection).catch((error) => {
        console.error("failed to send partner chat read receipts", error);
      });
    }
  );

  let heartbeatCheckInProgress = false;
  const heartbeat = setInterval(() => {
    if (heartbeatCheckInProgress) {
      return;
    }

    heartbeatCheckInProgress = true;
    void (async () => {
      try {
        const connections = [...connectionsByUserId.values()].flatMap((items) => [
          ...items,
        ]);
        const representativeByRelationship = new Map<number, PartnerChatConnection>();

        for (const connection of connections) {
          representativeByRelationship.set(connection.relationshipId, connection);
        }

        for (const [relationshipId, connection] of representativeByRelationship) {
          try {
            if (!(await isConnectionRelationshipCurrent(connection))) {
              closePartnerChatConnectionsForRelationship(relationshipId);
            }
          } catch {
            console.error("failed to validate partner chat relationship");
            closeRelationshipConnections(
              relationshipId,
              1011,
              "relationship_check_failed",
            );
          }
        }

        for (const connection of connections) {
          if (
            connection.socket.readyState !== WebSocket.OPEN ||
            !connectionsByUserId.get(connection.userId)?.has(connection)
          ) {
            continue;
          }

          if (!connection.isAlive) {
            connection.socket.terminate();
            removeConnection(connection);
            continue;
          }

          connection.isAlive = false;
          connection.socket.ping();
        }
      } finally {
        heartbeatCheckInProgress = false;
      }
    })().catch(() => {
      heartbeatCheckInProgress = false;
      console.error("failed to check partner chat connections");
    });
  }, HEARTBEAT_INTERVAL_MS);

  wss.on("close", () => {
    clearInterval(heartbeat);
  });

  return wss;
}
