import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { API_BASE_URL } from "@/app/shared/api-client";
import {
  getPartnerChatHistory,
  type PartnerChatHistoryMessageResponse,
} from "@/app/features/partner-chat/api";

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
  relationshipId?: number;
  serverMessageId?: string;
  text: string;
  messageType: PartnerChatMessageType;
  audioUrl?: string;
  audioDurationSeconds?: number;
  sentAt: string;
  isSelf: boolean;
  status?: "sending" | "sent" | "partner_offline" | "read" | "failed";
  retryable?: boolean;
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
  status: "sent" | "sending" | "partner_offline";
  clientMessageId?: string;
  serverMessageId?: string;
  sentAt?: string;
}

interface ServerReadyMessage {
  type: "ready";
  userId: number;
  partnerId: number;
  relationshipId: number;
  deliveryAckVersion?: 1;
}

interface ServerErrorMessage {
  type: "error";
  code: string;
  message: string;
  clientMessageId?: string;
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

  return `${wsBaseUrl}/partner-chat?token=${encodeURIComponent(token)}&deliveryAck=1`;
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
    (message.relationshipId === undefined ||
      (typeof message.relationshipId === "number" &&
        Number.isInteger(message.relationshipId) &&
        message.relationshipId > 0)) &&
    typeof message.text === "string" &&
    (message.messageType === "text" || message.messageType === "audio") &&
    (message.audioUrl === undefined || typeof message.audioUrl === "string") &&
    typeof message.sentAt === "string" &&
    typeof message.isSelf === "boolean" &&
    (message.retryable === undefined || typeof message.retryable === "boolean")
  );
}

function normalizeStoredMessages(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter(isPartnerChatMessage).map((message) => {
    const wasSending = message.status === "sending";
    return {
      ...message,
      status: wasSending ? "failed" : message.status,
      retryable:
        wasSending && message.messageType === "text"
          ? true
          : message.retryable,
    };
  });
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
    messagesById.set(message.id, {
      ...existing,
      ...message,
      status,
      retryable:
        status === "failed"
          ? (message.retryable ?? existing.retryable)
          : false,
    });
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

function mergeDeliveryStatus(
  current: PartnerChatMessage["status"],
  incoming: "sent" | "sending" | "partner_offline",
) {
  const rank = (status: PartnerChatMessage["status"]) => {
    switch (status) {
      case "read":
        return 4;
      case "sent":
        return 3;
      case "partner_offline":
        return 1;
      case "sending":
        return 2;
      default:
        return 0;
    }
  };

  return rank(current) > rank(incoming) ? current ?? incoming : incoming;
}

function mapHistoryMessage(
  userId: number,
  message: PartnerChatHistoryMessageResponse,
): PartnerChatMessage {
  const isSelf = message.fromUserId === userId;
  return {
    id: isSelf ? (message.clientMessageId ?? message.id) : message.id,
    relationshipId: message.relationshipId,
    serverMessageId: message.id,
    text: message.text,
    messageType: message.messageType,
    audioUrl: message.audioUrl,
    audioDurationSeconds: message.audioDurationSeconds,
    sentAt: message.sentAt,
    isSelf,
    status: isSelf ? message.deliveryStatus : "sent",
    retryable: false,
  };
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
  const isReadyRef = useRef(false);
  const deliveryAckRef = useRef(false);
  const relationshipRevokedRef = useRef(false);
  const historyRelationshipIdRef = useRef<number | null>(null);
  const historyCursorRef = useRef<string | null>(null);
  const historyPageInProgressRef = useRef(false);
  const hasLoadedOlderPageRef = useRef(false);
  const userIdRef = useRef<number | null>(null);
  const historyStorageKeyRef = useRef<string | null>(null);
  const hasLoadedHistoryRef = useRef(false);
  const isVisibleRef = useRef(isVisible);
  const [status, setStatus] = useState<PartnerChatStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [messages, setMessages] = useState<PartnerChatMessage[]>([]);
  const [hasOlderMessages, setHasOlderMessages] = useState(false);
  const [isLoadingOlderMessages, setIsLoadingOlderMessages] = useState(false);
  const [historyLoadFailed, setHistoryLoadFailed] = useState(false);

  const clearReconnectTimer = useCallback(() => {
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
  }, []);

  const loadHistory = useCallback(
    async (storageKey: string, relationshipId: number) => {
      try {
        const rawHistory = await AsyncStorage.getItem(storageKey);
        if (historyStorageKeyRef.current !== storageKey) {
          return;
        }
        const storedMessages = normalizeStoredMessages(
          rawHistory ? JSON.parse(rawHistory) : [],
        ).map((message) => ({ ...message, relationshipId }));

        setMessages((current) =>
          mergeMessages(
            storedMessages,
            current.filter(
              (message) => message.relationshipId === relationshipId,
            ),
          ),
        );
      } catch {
        // Ignore damaged local history so realtime chat can continue.
      } finally {
        if (historyStorageKeyRef.current === storageKey) {
          hasLoadedHistoryRef.current = true;
        }
      }
    },
    [],
  );

  const sendReadEvent = useCallback(() => {
    const socket = socketRef.current;
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      return;
    }

    socket.send(JSON.stringify({ type: "read" }));
  }, []);

  const sendDeliveryAcknowledgement = useCallback((messageId: string) => {
    const socket = socketRef.current;
    if (
      !deliveryAckRef.current ||
      !socket ||
      socket.readyState !== WebSocket.OPEN
    ) {
      return;
    }

    socket.send(JSON.stringify({ type: "delivered", messageId }));
  }, []);

  useEffect(() => {
    isVisibleRef.current = isVisible;
  }, [isVisible]);

  const loadServerHistory = useCallback(
    async (
      userId: number,
      relationshipId: number,
      beforeId?: string,
    ) => {
      if (!token) {
        return;
      }
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
        const page = await getPartnerChatHistory(
          relationshipId,
          token,
          beforeId,
        );
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
        setMessages((current) =>
          mergeMessages(
            current.filter(
              (message) => message.relationshipId === relationshipId,
            ),
            serverMessages,
          ),
        );
      } catch {
        if (historyStorageKeyRef.current !== storageKey) {
          return;
        }
        if (!beforeId) {
          setHistoryLoadFailed(true);
        }
        setErrorMessage("聊天历史暂时无法加载，请稍后重试");
      } finally {
        if (beforeId && historyStorageKeyRef.current === storageKey) {
          historyPageInProgressRef.current = false;
          setIsLoadingOlderMessages(false);
        }
      }
    },
    [token],
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
    isReadyRef.current = false;
    deliveryAckRef.current = false;
    setStatus("connecting");
    setErrorMessage(null);

    const socket = new WebSocket(createPartnerChatUrl(token));
    socketRef.current = socket;

    socket.onopen = () => {
      relationshipRevokedRef.current = false;
    };

    socket.onmessage = (event) => {
      if (socketRef.current !== socket) {
        return;
      }
      const payload = parseServerMessage(String(event.data));
      if (!payload) {
        return;
      }

      if (payload.type === "ready") {
        isReadyRef.current = true;
        deliveryAckRef.current = payload.deliveryAckVersion === 1;
        setStatus("connected");
        setErrorMessage(null);
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
          setIsLoadingOlderMessages(false);
          setHistoryLoadFailed(false);
          hasLoadedHistoryRef.current = false;
          void loadHistory(storageKey, payload.relationshipId);
        }

        void loadServerHistory(payload.userId, payload.relationshipId);

        if (isVisibleRef.current) {
          sendReadEvent();
        }
        return;
      }

      if (payload.type === "message") {
        if (historyRelationshipIdRef.current !== payload.relationshipId) {
          return;
        }
        sendDeliveryAcknowledgement(payload.id);
        setMessages((current) =>
          mergeMessages(current, [
            {
              id: payload.id,
              relationshipId: payload.relationshipId,
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

      if (
        payload.type === "delivery" &&
        (payload.clientMessageId || payload.serverMessageId)
      ) {
        setMessages((current) =>
          current.map((message) => {
            const matchesMessage =
              (payload.clientMessageId &&
                message.id === payload.clientMessageId) ||
              (payload.serverMessageId &&
                (message.serverMessageId === payload.serverMessageId ||
                  message.id === payload.serverMessageId));
            if (
              !message.isSelf ||
              !matchesMessage ||
              message.relationshipId !== historyRelationshipIdRef.current
            ) {
              return message;
            }

            return {
              ...message,
              audioUrl:
                message.messageType === "audio"
                  ? undefined
                  : message.audioUrl,
              serverMessageId:
                payload.serverMessageId ?? message.serverMessageId,
              status: mergeDeliveryStatus(message.status, payload.status),
              retryable: false,
              sentAt: payload.sentAt ?? message.sentAt,
            };
          }),
        );
        return;
      }

      if (payload.type === "read_receipt") {
        if (historyRelationshipIdRef.current !== payload.relationshipId) {
          return;
        }
        const readMessageIds = new Set(payload.messageIds);
        setMessages((current) =>
          current.map((message) =>
            message.isSelf &&
            message.relationshipId === payload.relationshipId &&
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
              message.id === payload.clientMessageId &&
              message.relationshipId === historyRelationshipIdRef.current
                ? { ...message, status: "failed", retryable: false }
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
      if (socketRef.current !== socket) {
        return;
      }
      setStatus("error");
      setErrorMessage("聊天连接异常");
    };

    socket.onclose = (event) => {
      if (socketRef.current !== socket) {
        return;
      }
      socketRef.current = null;
      isReadyRef.current = false;
      deliveryAckRef.current = false;

      const relationshipRevoked = event.code === 4003;
      const failedReentry = relationshipRevokedRef.current && !relationshipRevoked;
      if (relationshipRevoked) {
        relationshipRevokedRef.current = true;
        shouldReconnectRef.current = false;
        setErrorMessage("情侣关系已解除，聊天连接已关闭");
        historyRelationshipIdRef.current = null;
        historyStorageKeyRef.current = null;
        historyCursorRef.current = null;
        historyPageInProgressRef.current = false;
        hasLoadedOlderPageRef.current = false;
        hasLoadedHistoryRef.current = false;
        setHasOlderMessages(false);
        setIsLoadingOlderMessages(false);
        setMessages([]);
      } else if (failedReentry) {
        shouldReconnectRef.current = false;
        setErrorMessage("当前没有有效的情侣关系，聊天尚未连接");
      }

      setStatus("closed");
      setMessages((current) =>
        current.map((message) =>
          message.status === "sending" &&
          message.relationshipId === historyRelationshipIdRef.current
            ? {
                ...message,
                status: "failed",
                retryable: message.messageType === "text",
              }
            : message,
        ),
      );

      if (
        shouldReconnectRef.current &&
        !relationshipRevoked &&
        !failedReentry
      ) {
        reconnectTimerRef.current = setTimeout(connect, 2000);
      }
    };
  }, [
    clearReconnectTimer,
    loadHistory,
    loadServerHistory,
    sendDeliveryAcknowledgement,
    sendReadEvent,
    token,
  ]);

  useEffect(() => {
    if (!isVisible) {
      return;
    }

    if (relationshipRevokedRef.current && token) {
      shouldReconnectRef.current = true;
      connect();
    } else {
      sendReadEvent();
    }
  }, [connect, isVisible, sendReadEvent, token]);

  useEffect(() => {
    shouldReconnectRef.current = Boolean(token);

    if (!token) {
      relationshipRevokedRef.current = false;
      userIdRef.current = null;
      historyRelationshipIdRef.current = null;
      historyCursorRef.current = null;
      historyPageInProgressRef.current = false;
      hasLoadedOlderPageRef.current = false;
      socketRef.current?.close();
      socketRef.current = null;
      clearReconnectTimer();
      historyStorageKeyRef.current = null;
      hasLoadedHistoryRef.current = false;
      isReadyRef.current = false;
      deliveryAckRef.current = false;
      setMessages([]);
      setHasOlderMessages(false);
      setHistoryLoadFailed(false);
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

    const persistableMessages = messages
      .filter(
        (message) =>
          message.relationshipId === historyRelationshipIdRef.current,
      )
      .map((message) =>
        message.audioUrl && /^(file|content|ph|blob):/i.test(message.audioUrl)
          ? { ...message, audioUrl: undefined }
          : message,
      );

    void AsyncStorage.setItem(
      storageKey,
      JSON.stringify(persistableMessages.slice(-MAX_LOCAL_HISTORY_MESSAGES)),
    );
  }, [messages]);

  const sendTextMessage = useCallback((text: string) => {
    const trimmedText = text.trim();
    const relationshipId = historyRelationshipIdRef.current;
    if (!trimmedText || !isReadyRef.current || relationshipId === null) {
      return false;
    }

    const clientMessageId = createClientMessageId();
    const nextMessage: PartnerChatMessage = {
      id: clientMessageId,
      relationshipId,
      text: trimmedText,
      messageType: "text",
      sentAt: new Date().toISOString(),
      isSelf: true,
      status: "sending",
      retryable: false,
    };

    setMessages((current) => [...current, nextMessage]);

    const socket = socketRef.current;
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      setMessages((current) =>
        current.map((message) =>
          message.id === clientMessageId
            ? { ...message, status: "failed", retryable: true }
            : message,
        ),
      );
      return true;
    }

    try {
      socket.send(
        JSON.stringify({
          type: "message",
          messageType: "text",
          text: trimmedText,
          clientMessageId,
        }),
      );
    } catch {
      setMessages((current) =>
        current.map((message) =>
          message.id === clientMessageId
            ? { ...message, status: "failed", retryable: true }
            : message,
        ),
      );
    }
    return true;
  }, []);

  const retryTextMessage = useCallback(
    (messageId: string) => {
      const message = messages.find((candidate) => candidate.id === messageId);
      const relationshipId = historyRelationshipIdRef.current;
      const socket = socketRef.current;
      if (
        !message ||
        !message.isSelf ||
        message.messageType !== "text" ||
        message.status !== "failed" ||
        message.retryable !== true ||
        relationshipId === null ||
        message.relationshipId !== relationshipId ||
        !isReadyRef.current ||
        !socket ||
        socket.readyState !== WebSocket.OPEN
      ) {
        return false;
      }

      setMessages((current) =>
        current.map((item) =>
          item.id === messageId
            ? { ...item, status: "sending", retryable: false }
            : item,
        ),
      );
      try {
        socket.send(
          JSON.stringify({
            type: "message",
            messageType: "text",
            text: message.text,
            clientMessageId: message.id,
          }),
        );
      } catch {
        setMessages((current) =>
          current.map((item) =>
            item.id === messageId
              ? { ...item, status: "failed", retryable: true }
              : item,
          ),
        );
        return false;
      }
      return true;
    },
    [messages],
  );

  const sendAudioMessage = useCallback(
    (audioObjectKey: string, audioPreviewUri: string) => {
      const trimmedObjectKey = audioObjectKey.trim();
      const relationshipId = historyRelationshipIdRef.current;
      if (!trimmedObjectKey || !isReadyRef.current || relationshipId === null) {
        return false;
      }

      const clientMessageId = createClientMessageId();
      const nextMessage: PartnerChatMessage = {
        id: clientMessageId,
        relationshipId,
        text: "",
        messageType: "audio",
        audioUrl: audioPreviewUri,
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
          audioObjectKey: trimmedObjectKey,
          clientMessageId,
        }),
      );
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
      retryTextMessage,
      sendAudioMessage,
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
      retryTextMessage,
      sendAudioMessage,
      sendReadEvent,
      sendTextMessage,
      status,
    ],
  );
}
