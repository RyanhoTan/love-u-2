import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { API_BASE_URL } from "@/api/client";
import type {
  SchemaPartnerChatServerDelivery,
  SchemaPartnerChatServerError,
  SchemaPartnerChatServerMessage,
  SchemaPartnerChatServerReadReceipt,
  SchemaPartnerChatServerReady,
} from "@/api/schemas";
import { uploadMedia } from "@/api/upload";

export type PartnerChatStatus =
  | "idle"
  | "connecting"
  | "connected"
  | "closed"
  | "error";

export type PartnerChatMessageType = "text" | "audio";

export type PartnerChatMessage = {
  id: string;
  serverMessageId?: string;
  text: string;
  messageType: PartnerChatMessageType;
  audioUrl?: string;
  audioDurationSeconds?: number;
  sentAt: string;
  isSelf: boolean;
  status?: "sending" | "sent" | "partner_offline" | "read" | "failed";
};

type ServerMessage =
  | SchemaPartnerChatServerReady
  | SchemaPartnerChatServerMessage
  | SchemaPartnerChatServerDelivery
  | SchemaPartnerChatServerReadReceipt
  | SchemaPartnerChatServerError;

type PartnerChatOptions = {
  isVisible?: boolean;
};

const HISTORY_STORAGE_PREFIX = "partner-chat:history";
const MAX_LOCAL_HISTORY_MESSAGES = 3000;

function createPartnerChatUrl(token: string) {
  const baseUrl = API_BASE_URL.replace(/\/$/, "");
  const wsBaseUrl = baseUrl
    .replace(/^http:/, "ws:")
    .replace(/^https:/, "wss:");

  return `${wsBaseUrl}/partner-chat?token=${encodeURIComponent(token)}`;
}

function createClientMessageId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function createHistoryStorageKey(userId: number, relationshipId: number) {
  return `${HISTORY_STORAGE_PREFIX}:${relationshipId}:${userId}`;
}

function isPartnerChatMessage(value: unknown): value is PartnerChatMessage {
  if (!value || typeof value !== "object") {
    return false;
  }

  const message = value as Partial<PartnerChatMessage>;
  return (
    typeof message.id === "string" &&
    typeof message.text === "string" &&
    (message.messageType === "text" || message.messageType === "audio") &&
    (message.audioUrl === undefined || typeof message.audioUrl === "string") &&
    (message.audioDurationSeconds === undefined ||
      (typeof message.audioDurationSeconds === "number" &&
        Number.isFinite(message.audioDurationSeconds))) &&
    typeof message.sentAt === "string" &&
    typeof message.isSelf === "boolean"
  );
}

function normalizeStoredMessages(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter(isPartnerChatMessage).map((message) => ({
    ...message,
    status: message.status === "sending" ? "failed" : message.status,
  }));
}

function mergeMessages(
  storedMessages: PartnerChatMessage[],
  currentMessages: PartnerChatMessage[],
) {
  const messagesById = new Map<string, PartnerChatMessage>();

  for (const message of [...storedMessages, ...currentMessages]) {
    messagesById.set(message.id, message);
  }

  return [...messagesById.values()]
    .sort((left, right) => {
      const leftTime = new Date(left.sentAt).getTime();
      const rightTime = new Date(right.sentAt).getTime();

      if (Number.isNaN(leftTime) || Number.isNaN(rightTime)) {
        return 0;
      }

      return leftTime - rightTime;
    })
    .slice(-MAX_LOCAL_HISTORY_MESSAGES);
}

function parseServerMessage(data: string): ServerMessage | null {
  try {
    return JSON.parse(data) as ServerMessage;
  } catch {
    return null;
  }
}

function readHistory(storageKey: string) {
  try {
    const rawHistory = localStorage.getItem(storageKey);
    return normalizeStoredMessages(rawHistory ? JSON.parse(rawHistory) : []);
  } catch {
    return [];
  }
}

function writeHistory(storageKey: string, messages: PartnerChatMessage[]) {
  try {
    const persistable = messages.filter(
      (message) => !message.audioUrl?.startsWith("blob:"),
    );
    localStorage.setItem(
      storageKey,
      JSON.stringify(persistable.slice(-MAX_LOCAL_HISTORY_MESSAGES)),
    );
  } catch {
    // Ignore quota / private-mode failures; live chat still works.
  }
}

export function usePartnerChat(
  token: string | null,
  options: PartnerChatOptions = {},
) {
  const isVisible = options.isVisible ?? true;
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const shouldReconnectRef = useRef(false);
  const historyStorageKeyRef = useRef<string | null>(null);
  const hasLoadedHistoryRef = useRef(false);
  const isVisibleRef = useRef(isVisible);
  const userIdRef = useRef<number | null>(null);
  const [status, setStatus] = useState<PartnerChatStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [messages, setMessages] = useState<PartnerChatMessage[]>([]);

  const clearReconnectTimer = useCallback(() => {
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
  }, []);

  const sendReadEvent = useCallback(() => {
    const socket = socketRef.current;
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      return;
    }

    socket.send(JSON.stringify({ type: "read" }));
  }, []);

  useEffect(() => {
    isVisibleRef.current = isVisible;
  }, [isVisible]);

  const connect = useCallback(() => {
    if (!token) {
      setStatus("idle");
      return;
    }

    clearReconnectTimer();
    setStatus("connecting");
    setErrorMessage(null);

    const socket = new WebSocket(createPartnerChatUrl(token));
    socketRef.current = socket;

    socket.onopen = () => {
      setStatus("connected");
      setErrorMessage(null);
    };

    socket.onmessage = (event) => {
      const payload = parseServerMessage(String(event.data));
      if (!payload) {
        return;
      }

      if (payload.type === "ready") {
        userIdRef.current = payload.userId;
        const storageKey = createHistoryStorageKey(
          payload.userId,
          payload.relationshipId,
        );

        if (historyStorageKeyRef.current !== storageKey) {
          historyStorageKeyRef.current = storageKey;
          hasLoadedHistoryRef.current = false;
          setMessages((current) =>
            mergeMessages(readHistory(storageKey), current),
          );
          hasLoadedHistoryRef.current = true;
        }

        if (isVisibleRef.current) {
          sendReadEvent();
        }
        return;
      }

      if (payload.type === "message") {
        const isSelf =
          userIdRef.current !== null &&
          payload.fromUserId === userIdRef.current;
        const nextId = isSelf
          ? (payload.clientMessageId ?? payload.id)
          : payload.id;

        setMessages((current) => {
          const existing = current.find((message) => message.id === nextId);
          const audioDurationSeconds =
            typeof payload.audioDurationSeconds === "number" &&
            Number.isFinite(payload.audioDurationSeconds) &&
            payload.audioDurationSeconds > 0
              ? payload.audioDurationSeconds
              : existing?.audioDurationSeconds;

          return mergeMessages(current, [
            {
              id: nextId,
              serverMessageId: payload.id,
              text: payload.text,
              messageType: payload.messageType,
              audioUrl: payload.audioUrl,
              audioDurationSeconds,
              sentAt: payload.sentAt,
              isSelf,
              status: "sent",
            },
          ]);
        });

        if (isVisibleRef.current && !isSelf) {
          sendReadEvent();
        }
        return;
      }

      if (payload.type === "delivery" && payload.clientMessageId) {
        setMessages((current) =>
          current.map((message) =>
            message.id === payload.clientMessageId
              ? {
                  ...message,
                  serverMessageId:
                    payload.serverMessageId ?? message.serverMessageId,
                  status:
                    message.status === "read" ? "read" : payload.status,
                  sentAt: payload.sentAt ?? message.sentAt,
                }
              : message,
          ),
        );
        return;
      }

      if (payload.type === "read_receipt") {
        const readMessageIds = new Set(payload.messageIds);
        setMessages((current) =>
          current.map((message) =>
            message.isSelf &&
            (readMessageIds.has(message.serverMessageId ?? "") ||
              readMessageIds.has(message.id))
              ? { ...message, status: "read" }
              : message,
          ),
        );
        return;
      }

      if (payload.type === "error") {
        setErrorMessage(payload.message);
      }
    };

    socket.onerror = () => {
      setStatus("error");
      setErrorMessage("聊天连接异常");
    };

    socket.onclose = () => {
      if (socketRef.current === socket) {
        socketRef.current = null;
      }

      setStatus("closed");
      setMessages((current) =>
        current.map((message) =>
          message.status === "sending"
            ? { ...message, status: "failed" }
            : message,
        ),
      );

      if (shouldReconnectRef.current) {
        reconnectTimerRef.current = setTimeout(connect, 2000);
      }
    };
  }, [clearReconnectTimer, sendReadEvent, token]);

  useEffect(() => {
    if (isVisible) {
      sendReadEvent();
    }
  }, [isVisible, sendReadEvent]);

  useEffect(() => {
    shouldReconnectRef.current = Boolean(token);

    if (!token) {
      socketRef.current?.close();
      socketRef.current = null;
      clearReconnectTimer();
      historyStorageKeyRef.current = null;
      hasLoadedHistoryRef.current = false;
      userIdRef.current = null;
      setMessages([]);
      setStatus("idle");
      return;
    }

    connect();

    return () => {
      shouldReconnectRef.current = false;
      clearReconnectTimer();
      socketRef.current?.close();
      socketRef.current = null;
    };
  }, [clearReconnectTimer, connect, token]);

  useEffect(() => {
    const storageKey = historyStorageKeyRef.current;
    if (!storageKey || !hasLoadedHistoryRef.current) {
      return;
    }

    writeHistory(storageKey, messages);
  }, [messages]);

  const sendTextMessage = useCallback((text: string) => {
    const trimmedText = text.trim();
    if (!trimmedText) {
      return false;
    }

    const clientMessageId = createClientMessageId();
    const nextMessage: PartnerChatMessage = {
      id: clientMessageId,
      text: trimmedText,
      messageType: "text",
      sentAt: new Date().toISOString(),
      isSelf: true,
      status: "sending",
    };

    setMessages((current) => [...current, nextMessage]);

    const socket = socketRef.current;
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      setMessages((current) =>
        current.map((message) =>
          message.id === clientMessageId
            ? { ...message, status: "failed" }
            : message,
        ),
      );
      return false;
    }

    socket.send(
      JSON.stringify({
        type: "message",
        messageType: "text",
        text: trimmedText,
        clientMessageId,
      }),
    );
    return true;
  }, []);

  const sendAudioMessage = useCallback(
    (file: File, durationSeconds: number) => {
      if (file.size <= 0) {
        return false;
      }

      const clientMessageId = createClientMessageId();
      const localUrl = URL.createObjectURL(file);
      const audioDurationSeconds =
        Number.isFinite(durationSeconds) && durationSeconds > 0
          ? durationSeconds
          : undefined;
      const nextMessage: PartnerChatMessage = {
        id: clientMessageId,
        text: "",
        messageType: "audio",
        audioUrl: localUrl,
        audioDurationSeconds,
        sentAt: new Date().toISOString(),
        isSelf: true,
        status: "sending",
      };

      setMessages((current) => [...current, nextMessage]);

      void (async () => {
        try {
          const uploaded = await uploadMedia(file, "interact");
          const remoteUrl = uploaded.url.trim();
          if (!remoteUrl) {
            throw new Error("upload failed");
          }

          setMessages((current) =>
            current.map((message) =>
              message.id === clientMessageId
                ? { ...message, audioUrl: remoteUrl }
                : message,
            ),
          );
          queueMicrotask(() => URL.revokeObjectURL(localUrl));

          const socket = socketRef.current;
          if (!socket || socket.readyState !== WebSocket.OPEN) {
            setMessages((current) =>
              current.map((message) =>
                message.id === clientMessageId
                  ? { ...message, status: "failed" }
                  : message,
              ),
            );
            return;
          }

          socket.send(
            JSON.stringify({
              type: "message",
              messageType: "audio",
              audioUrl: remoteUrl,
              audioDurationSeconds,
              clientMessageId,
            }),
          );
        } catch {
          setMessages((current) =>
            current.map((message) =>
              message.id === clientMessageId
                ? { ...message, status: "failed" }
                : message,
            ),
          );
        }
      })();

      return true;
    },
    [],
  );

  const isConnected = status === "connected";

  return useMemo(
    () => ({
      messages,
      status,
      errorMessage,
      isConnected,
      markAsRead: sendReadEvent,
      sendMessage: sendTextMessage,
      sendAudioMessage,
    }),
    [
      errorMessage,
      isConnected,
      messages,
      sendAudioMessage,
      sendReadEvent,
      sendTextMessage,
      status,
    ],
  );
}
