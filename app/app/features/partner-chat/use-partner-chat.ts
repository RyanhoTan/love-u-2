import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { API_BASE_URL } from "@/app/shared/api-client";

type PartnerChatStatus =
  | "idle"
  | "connecting"
  | "connected"
  | "closed"
  | "error";

interface PartnerChatOptions {
  isVisible?: boolean;
}

export type PartnerChatMessageType = "text" | "audio";

export interface PartnerChatMessage {
  id: string;
  serverMessageId?: string;
  text: string;
  messageType: PartnerChatMessageType;
  audioUrl?: string;
  sentAt: string;
  isSelf: boolean;
  status?: "sending" | "sent" | "partner_offline" | "read" | "failed";
}

interface ServerChatMessage {
  type: "message";
  id: string;
  fromUserId: number;
  relationshipId: number;
  text: string;
  messageType: PartnerChatMessageType;
  audioUrl?: string;
  clientMessageId?: string;
  sentAt: string;
}

interface ServerDeliveryMessage {
  type: "delivery";
  status: "sent" | "partner_offline";
  clientMessageId?: string;
  serverMessageId?: string;
  sentAt?: string;
}

interface ServerReadyMessage {
  type: "ready";
  userId: number;
  partnerId: number;
  relationshipId: number;
}

interface ServerErrorMessage {
  type: "error";
  code: string;
  message: string;
}

interface ServerReadReceiptMessage {
  type: "read_receipt";
  relationshipId: number;
  messageIds: string[];
  readAt: string;
}

type ServerMessage =
  | ServerChatMessage
  | ServerDeliveryMessage
  | ServerReadyMessage
  | ServerErrorMessage
  | ServerReadReceiptMessage;

const HISTORY_STORAGE_PREFIX = "partner-chat:history";
const MAX_LOCAL_HISTORY_MESSAGES = 3000;

function createPartnerChatUrl(token: string) {
  const baseUrl = API_BASE_URL.replace(/\/$/, "");
  const wsBaseUrl = baseUrl.replace(/^http:/, "ws:").replace(/^https:/, "wss:");

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

function parseServerMessage(data: string) {
  try {
    return JSON.parse(data) as ServerMessage;
  } catch {
    return null;
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
  const [status, setStatus] = useState<PartnerChatStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [messages, setMessages] = useState<PartnerChatMessage[]>([]);

  const clearReconnectTimer = useCallback(() => {
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
  }, []);

  const loadHistory = useCallback(async (storageKey: string) => {
    try {
      const rawHistory = await AsyncStorage.getItem(storageKey);
      const storedMessages = normalizeStoredMessages(
        rawHistory ? JSON.parse(rawHistory) : [],
      );

      setMessages((current) => mergeMessages(storedMessages, current));
    } catch {
      // Ignore damaged local history so realtime chat can continue.
    } finally {
      hasLoadedHistoryRef.current = true;
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
        const storageKey = createHistoryStorageKey(
          payload.userId,
          payload.relationshipId,
        );

        if (historyStorageKeyRef.current !== storageKey) {
          historyStorageKeyRef.current = storageKey;
          hasLoadedHistoryRef.current = false;
          void loadHistory(storageKey);
        }

        if (isVisibleRef.current) {
          sendReadEvent();
        }
        return;
      }

      if (payload.type === "message") {
        setMessages((current) =>
          mergeMessages(current, [
            {
              id: payload.id,
              serverMessageId: payload.id,
              text: payload.text,
              messageType: payload.messageType,
              audioUrl: payload.audioUrl,
              sentAt: payload.sentAt,
              isSelf: false,
              status: "sent",
            },
          ]),
        );
        if (isVisibleRef.current) {
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
  }, [clearReconnectTimer, loadHistory, sendReadEvent, token]);

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

    void AsyncStorage.setItem(
      storageKey,
      JSON.stringify(messages.slice(-MAX_LOCAL_HISTORY_MESSAGES)),
    );
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

  const sendAudioMessage = useCallback((audioUrl: string) => {
    const trimmedAudioUrl = audioUrl.trim();
    if (!trimmedAudioUrl) {
      return false;
    }

    const clientMessageId = createClientMessageId();
    const nextMessage: PartnerChatMessage = {
      id: clientMessageId,
      text: "",
      messageType: "audio",
      audioUrl: trimmedAudioUrl,
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
        messageType: "audio",
        audioUrl: trimmedAudioUrl,
        clientMessageId,
      }),
    );
    return true;
  }, []);

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
    [errorMessage, isConnected, messages, sendAudioMessage, sendReadEvent, sendTextMessage, status],
  );
}
