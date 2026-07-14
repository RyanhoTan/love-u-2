import type { IncomingMessage, Server as HttpServer } from "node:http";
import type { Duplex } from "node:stream";
import type { RowDataPacket } from "mysql2/promise";
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

interface PartnerChatConnection {
  socket: WebSocket;
  userId: number;
  partnerId: number;
  relationshipId: number;
  isAlive: boolean;
}

const incomingMessageSchema = z.object({
  type: z.literal("message"),
  text: z.string().trim().min(1).max(MAX_MESSAGE_LENGTH),
  clientMessageId: z.string().trim().max(100).optional(),
});

const connectionsByUserId = new Map<number, Set<PartnerChatConnection>>();

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

function handleMessage(connection: PartnerChatConnection, rawData: RawData) {
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

  const parsed = incomingMessageSchema.safeParse(payload);
  if (!parsed.success) {
    sendJson(connection.socket, {
      type: "error",
      code: "invalid_message",
      message: parsed.error.issues[0]?.message ?? "invalid message payload",
    });
    return;
  }

  const message = {
    type: "message",
    fromUserId: connection.userId,
    relationshipId: connection.relationshipId,
    text: parsed.data.text,
    clientMessageId: parsed.data.clientMessageId,
    sentAt: new Date().toISOString(),
  };

  const partnerConnections = getPartnerConnections(
    connection.partnerId,
    connection.relationshipId
  );

  if (partnerConnections.length === 0) {
    sendJson(connection.socket, {
      type: "delivery",
      status: "partner_offline",
      clientMessageId: parsed.data.clientMessageId,
    });
    return;
  }

  for (const partnerConnection of partnerConnections) {
    sendJson(partnerConnection.socket, message);
  }

  sendJson(connection.socket, {
    type: "delivery",
    status: "sent",
    clientMessageId: parsed.data.clientMessageId,
    sentAt: message.sentAt,
  });
}

export function setupPartnerChat(server: HttpServer) {
  const wss = new WebSocketServer({ noServer: true });

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
        handleMessage(connection, rawData);
      });

      socket.on("close", () => {
        removeConnection(connection);
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
