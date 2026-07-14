import type { IncomingMessage, Server as HttpServer } from "node:http";
import type { Duplex } from "node:stream";
import type { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import type { RawData } from "ws";
import { WebSocket, WebSocketServer } from "ws";
import { z } from "zod";
import { verifyAuthToken } from "../auth.js";
import db from "../db/index.js";

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
  text: string;
  client_message_id: string | null;
  sent_at: Date | string;
}

interface PartnerChatMessageRow extends PartnerChatMessage, RowDataPacket {}

interface ColumnExistsRow extends RowDataPacket {
  column_exists: number;
}

interface ReadReceiptRow extends RowDataPacket {
  id: number;
  read_at: Date | string;
}

interface PartnerChatConnection {
  socket: WebSocket;
  userId: number;
  partnerId: number;
  relationshipId: number;
  isAlive: boolean;
}

const incomingPayloadSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("message"),
    text: z.string().trim().min(1).max(MAX_MESSAGE_LENGTH),
    clientMessageId: z.string().trim().max(100).optional(),
  }),
  z.object({
    type: z.literal("read"),
  }),
]);

const connectionsByUserId = new Map<number, Set<PartnerChatConnection>>();
let schemaReadyPromise: Promise<void> | null = null;

function ensurePartnerChatSchema() {
  schemaReadyPromise ??= db
    .execute(
      `
        CREATE TABLE IF NOT EXISTS partner_chat_messages (
          id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
          relationship_id BIGINT UNSIGNED NOT NULL,
          sender_id BIGINT UNSIGNED NOT NULL,
          receiver_id BIGINT UNSIGNED NOT NULL,
          text VARCHAR(${MAX_MESSAGE_LENGTH}) NOT NULL,
          client_message_id VARCHAR(100) NULL,
          sent_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
          delivered_at DATETIME(3) NULL,
          read_at DATETIME(3) NULL,
          PRIMARY KEY (id),
          INDEX idx_partner_chat_receiver_pending (receiver_id, relationship_id, delivered_at, id),
          INDEX idx_partner_chat_receiver_unread (receiver_id, relationship_id, read_at, id),
          INDEX idx_partner_chat_relationship_sent (relationship_id, id),
          UNIQUE KEY uniq_partner_chat_client_message (sender_id, client_message_id)
        )
      `
    )
    .then(async () => {
      const [rows] = await db.query<ColumnExistsRow[]>(
        `
          SELECT COUNT(*) AS column_exists
          FROM information_schema.COLUMNS
          WHERE TABLE_SCHEMA = DATABASE()
            AND TABLE_NAME = 'partner_chat_messages'
            AND COLUMN_NAME = 'read_at'
        `
      );

      if ((rows[0]?.column_exists ?? 0) === 0) {
        await db.execute(
          `
            ALTER TABLE partner_chat_messages
            ADD COLUMN read_at DATETIME(3) NULL,
            ADD INDEX idx_partner_chat_receiver_unread (receiver_id, relationship_id, read_at, id)
          `
        );
      }
    })
    .then(() => undefined);

  return schemaReadyPromise;
}

function sendJson(socket: WebSocket, payload: unknown) {
  if (socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(payload));
  }
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
  return {
    type: "message",
    id: String(message.id),
    fromUserId: message.sender_id,
    relationshipId: message.relationship_id,
    text: message.text,
    clientMessageId: message.client_message_id ?? undefined,
    sentAt: toIsoString(message.sent_at),
  };
}

async function saveMessage(connection: PartnerChatConnection, text: string, clientMessageId?: string) {
  await ensurePartnerChatSchema();

  const sentAt = new Date();
  const [result] = await db.execute<ResultSetHeader>(
    `
      INSERT INTO partner_chat_messages (
        relationship_id,
        sender_id,
        receiver_id,
        text,
        client_message_id,
        sent_at
      )
      VALUES (?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE id = LAST_INSERT_ID(id)
    `,
    [
      connection.relationshipId,
      connection.userId,
      connection.partnerId,
      text,
      clientMessageId ?? null,
      sentAt,
    ]
  );

  const [rows] = await db.query<PartnerChatMessageRow[]>(
    `
      SELECT
        id,
        relationship_id,
        sender_id,
        receiver_id,
        text,
        client_message_id,
        sent_at
      FROM partner_chat_messages
      WHERE id = ?
      LIMIT 1
    `,
    [result.insertId]
  );

  const savedMessage = rows[0];
  if (!savedMessage) {
    throw new Error("saved partner chat message could not be loaded");
  }

  return savedMessage;
}

async function markMessagesDelivered(messageIds: number[]) {
  if (messageIds.length === 0) {
    return;
  }

  await db.query(
    `
      UPDATE partner_chat_messages
      SET delivered_at = COALESCE(delivered_at, CURRENT_TIMESTAMP(3))
      WHERE id IN (?)
    `,
    [messageIds]
  );
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
        client_message_id,
        sent_at
      FROM partner_chat_messages
      WHERE receiver_id = ?
        AND relationship_id = ?
        AND delivered_at IS NULL
      ORDER BY id ASC
    `,
    [connection.userId, connection.relationshipId]
  );

  for (const message of messages) {
    sendJson(connection.socket, createMessagePayload(message));
  }

  await markMessagesDelivered(messages.map((message) => message.id));
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
      ORDER BY id ASC
    `,
    [connection.userId, connection.relationshipId]
  );

  if (messages.length === 0) {
    return null;
  }

  const readAt = new Date();
  const messageIds = messages.map((message) => message.id);

  await db.query(
    `
      UPDATE partner_chat_messages
      SET
        delivered_at = COALESCE(delivered_at, ?),
        read_at = COALESCE(read_at, ?)
      WHERE id IN (?)
    `,
    [readAt, readAt, messageIds]
  );

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

async function handleIncomingPayload(connection: PartnerChatConnection, rawData: RawData) {
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

  let message: PartnerChatMessage;
  try {
    message = await saveMessage(
      connection,
      parsed.data.text,
      parsed.data.clientMessageId
    );
  } catch (error) {
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

  for (const partnerConnection of partnerConnections) {
    sendJson(partnerConnection.socket, createMessagePayload(message));
  }

  if (partnerConnections.length > 0) {
    try {
      await markMessagesDelivered([message.id]);
    } catch (error) {
      console.error("failed to mark partner chat message delivered", error);
    }
  }

  sendJson(connection.socket, {
    type: "delivery",
    status: "sent",
    clientMessageId: parsed.data.clientMessageId,
    serverMessageId: String(message.id),
    sentAt: toIsoString(message.sent_at),
  });
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

      wss.handleUpgrade(request, socket, head, (ws) => {
        const connection: PartnerChatConnection = {
          socket: ws,
          userId,
          partnerId,
          relationshipId: relationship.id,
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

  const heartbeat = setInterval(() => {
    for (const connections of connectionsByUserId.values()) {
      for (const connection of connections) {
        if (!connection.isAlive) {
          connection.socket.terminate();
          removeConnection(connection);
          continue;
        }

        connection.isAlive = false;
        connection.socket.ping();
      }
    }
  }, HEARTBEAT_INTERVAL_MS);

  wss.on("close", () => {
    clearInterval(heartbeat);
  });

  return wss;
}
