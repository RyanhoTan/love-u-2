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
import {
  getPartnerChatAudioUrl,
  getPartnerChatHistory,
  type PartnerChatHistoryMessageResponse,
} from "@/features/partner-chat/api";

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
    const existing = messagesById.get(message.id);
    if (!existing) {
      messagesById.set(message.id, message);
      continue;
    }

    const statusRank = (status: PartnerChatMessage["status"]) => {
      switch (status) {
        case "read":
          return 4;
        case "sent":
          return 3;
        case "partner_offline":
          return 2;
        case "sending":
          return 1;
        default:
          return 0;
      }
    };
    const status =
      statusRank(message.status) >= statusRank(existing.status)
        ? message.status
        : existing.status;
    messagesById.set(message.id, { ...existing, ...message, status });
  }

  return [...messagesById.values()]
    .sort((left, right) => {
      const leftServerId = left.serverMessageId;
      const rightServerId = right.serverMessageId;
      if (
        leftServerId &&
        rightServerId &&
        /^\d+$/.test(leftServerId) &&
        /^\d+$/.test(rightServerId)
      ) {
        return (
          leftServerId.length - rightServerId.length ||
          leftServerId.localeCompare(rightServerId)
        );
      }

      const leftTime = new Date(left.sentAt).getTime();
      const rightTime = new Date(right.sentAt).getTime();

      if (Number.isNaN(leftTime) || Number.isNaN(rightTime)) {
        return 0;
      }

      if (leftTime !== rightTime) {
        return leftTime - rightTime;
      }

      const leftId = left.serverMessageId ?? left.id;
      const rightId = right.serverMessageId ?? right.id;
      if (/^\d+$/.test(leftId) && /^\d+$/.test(rightId)) {
        return leftId.length - rightId.length || leftId.localeCompare(rightId);
      }
      return leftId.localeCompare(rightId);
    })
    .slice(-MAX_LOCAL_HISTORY_MESSAGES);
}

function mapHistoryMessage(
  userId: number,
  message: PartnerChatHistoryMessageResponse,
): PartnerChatMessage {
  const isSelf = message.fromUserId === userId;
  return {
    id: isSelf ? (message.clientMessageId ?? message.id) : message.id,
    serverMessageId: message.id,
    text: message.text,
    messageType: message.messageType,
    audioUrl: message.audioUrl,
    audioDurationSeconds: message.audioDurationSeconds,
    sentAt: message.sentAt,
    isSelf,
    status: isSelf ? message.deliveryStatus : "sent",
  };
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
  const audioPreviewUrlsRef = useRef(new Map<string, string>());
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const shouldReconnectRef = useRef(false);
  const historyRelationshipIdRef = useRef<number | null>(null);
  const historyCursorRef = useRef<string | null>(null);
  const historyPageInProgressRef = useRef(false);
  const hasLoadedOlderPageRef = useRef(false);
  const historyStorageKeyRef = useRef<string | null>(null);
  const hasLoadedHistoryRef = useRef(false);
  const isVisibleRef = useRef(isVisible);
  const userIdRef = useRef<number | null>(null);
  const [status, setStatus] = useState<PartnerChatStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [messages, setMessages] = useState<PartnerChatMessage[]>([]);
  const [hasOlderMessages, setHasOlderMessages] = useState(false);
  const [isLoadingOlderMessages, setIsLoadingOlderMessages] = useState(false);
  const [historyLoadFailed, setHistoryLoadFailed] = useState(false);

  useEffect(
    () => () => {
      for (const url of audioPreviewUrlsRef.current.values()) {
        URL.revokeObjectURL(url);
      }
      audioPreviewUrlsRef.current.clear();
    },
    [],
  );

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

  const loadServerHistory = useCallback(
    async (userId: number, relationshipId: number, beforeId?: string) => {
      if (beforeId && historyPageInProgressRef.current) {
        return;
      }
      if (beforeId) {
        historyPageInProgressRef.current = true;
        setIsLoadingOlderMessages(true);
      }

      const storageKey = createHistoryStorageKey(userId, relationshipId);
      if (!beforeId) {
        setHistoryLoadFailed(false);
      }
      try {
        const page = await getPartnerChatHistory(relationshipId, beforeId);
        if (
          historyStorageKeyRef.current !== storageKey ||
          page.relationshipId !== relationshipId
        ) {
          return;
        }

        const shouldUpdateCursor =
          Boolean(beforeId) ||
          (!hasLoadedOlderPageRef.current &&
            !historyPageInProgressRef.current);
        if (shouldUpdateCursor) {
          historyCursorRef.current = page.nextBeforeId;
          setHasOlderMessages(page.hasMore);
          if (beforeId) {
            hasLoadedOlderPageRef.current = true;
          }
        }
        setHistoryLoadFailed(false);
        setErrorMessage((current) =>
          current === "聊天历史暂时无法加载，请稍后重试" ? null : current,
        );
        const serverMessages = page.messages.map((message) =>
          mapHistoryMessage(userId, message),
        );
        setMessages((current) => mergeMessages(current, serverMessages));
      } catch {
        if (!beforeId) {
          setHistoryLoadFailed(true);
        }
        setErrorMessage("聊天历史暂时无法加载，请稍后重试");
      } finally {
        if (beforeId) {
          historyPageInProgressRef.current = false;
          setIsLoadingOlderMessages(false);
        }
      }
    },
    [],
  );

  const loadOlderMessages = useCallback(() => {
    const userId = userIdRef.current;
    const relationshipId = historyRelationshipIdRef.current;
    const beforeId = historyCursorRef.current;
    if (!userId || !relationshipId) {
      return;
    }
    if (!beforeId) {
      if (historyLoadFailed) {
        void loadServerHistory(userId, relationshipId);
      }
      return;
    }
    void loadServerHistory(userId, relationshipId, beforeId);
  }, [historyLoadFailed, loadServerHistory]);

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
          historyRelationshipIdRef.current = payload.relationshipId;
          historyCursorRef.current = null;
          historyPageInProgressRef.current = false;
          hasLoadedOlderPageRef.current = false;
          setHasOlderMessages(false);
          setHistoryLoadFailed(false);
          hasLoadedHistoryRef.current = false;
          setMessages((current) =>
            mergeMessages(readHistory(storageKey), current),
          );
          hasLoadedHistoryRef.current = true;
        }

        void loadServerHistory(payload.userId, payload.relationshipId);

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
        const previewUrl = audioPreviewUrlsRef.current.get(
          payload.clientMessageId,
        );
        if (previewUrl) {
          URL.revokeObjectURL(previewUrl);
          audioPreviewUrlsRef.current.delete(payload.clientMessageId);
        }

        setMessages((current) =>
          current.map((message) => {
            if (message.id !== payload.clientMessageId) {
              return message;
            }

            return {
              ...message,
              audioUrl: message.audioUrl?.startsWith("blob:")
                ? undefined
                : message.audioUrl,
              serverMessageId:
                payload.serverMessageId ?? message.serverMessageId,
              status: message.status === "read" ? "read" : payload.status,
              sentAt: payload.sentAt ?? message.sentAt,
            };
          }),
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
        if (payload.clientMessageId) {
          setMessages((current) =>
            current.map((message) =>
              message.id === payload.clientMessageId
                ? { ...message, status: "failed" }
                : message,
            ),
          );
        }
        setErrorMessage(
          payload.code === "client_message_id_conflict"
            ? "消息标识冲突，请重新发送"
            : payload.message,
        );
      }
    };

    socket.onerror = () => {
      setStatus("error");
      setErrorMessage("聊天连接异常");
    };

    socket.onclose = (event) => {
      if (socketRef.current === socket) {
        socketRef.current = null;
      }

      const relationshipRevoked = event.code === 4003;
      if (relationshipRevoked) {
        shouldReconnectRef.current = false;
        setErrorMessage("情侣关系已解除，聊天连接已关闭");
      }

      setStatus("closed");
      setMessages((current) =>
        current.map((message) =>
          message.status === "sending"
            ? { ...message, status: "failed" }
            : message,
        ),
      );

      if (shouldReconnectRef.current && !relationshipRevoked) {
        reconnectTimerRef.current = setTimeout(connect, 2000);
      }
    };
  }, [clearReconnectTimer, loadServerHistory, sendReadEvent, token]);

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
      historyRelationshipIdRef.current = null;
      historyCursorRef.current = null;
      historyPageInProgressRef.current = false;
      hasLoadedOlderPageRef.current = false;
      historyStorageKeyRef.current = null;
      hasLoadedHistoryRef.current = false;
      userIdRef.current = null;
      setHasOlderMessages(false);
      setHistoryLoadFailed(false);
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
      audioPreviewUrlsRef.current.set(clientMessageId, localUrl);
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
          const audioObjectKey = uploaded.key.trim();
          if (!audioObjectKey) {
            throw new Error("upload failed");
          }

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
              audioObjectKey,
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
      hasOlderMessages,
      historyLoadFailed,
      isLoadingOlderMessages,
      isConnected,
      markAsRead: sendReadEvent,
      sendMessage: sendTextMessage,
      sendAudioMessage,
      getAudioUrl: getPartnerChatAudioUrl,
      loadOlderMessages,
    }),
    [
      errorMessage,
      hasOlderMessages,
      historyLoadFailed,
      isConnected,
      isLoadingOlderMessages,
      loadOlderMessages,
      messages,
      sendAudioMessage,
      sendReadEvent,
      sendTextMessage,
      status,
    ],
  );
}
