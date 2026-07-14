import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { API_BASE_URL } from "@/app/shared/api-client";

type PartnerChatStatus =
  | "idle"
  | "connecting"
  | "connected"
  | "closed"
  | "error";

export interface PartnerChatMessage {
  id: string;
  text: string;
  sentAt: string;
  isSelf: boolean;
  status?: "sending" | "sent" | "partner_offline" | "failed";
}

interface ServerChatMessage {
  type: "message";
  fromUserId: number;
  relationshipId: number;
  text: string;
  clientMessageId?: string;
  sentAt: string;
}

interface ServerDeliveryMessage {
  type: "delivery";
  status: "sent" | "partner_offline";
  clientMessageId?: string;
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

type ServerMessage =
  | ServerChatMessage
  | ServerDeliveryMessage
  | ServerReadyMessage
  | ServerErrorMessage;

function createPartnerChatUrl(token: string) {
  const baseUrl = API_BASE_URL.replace(/\/$/, "");
  const wsBaseUrl = baseUrl.replace(/^http:/, "ws:").replace(/^https:/, "wss:");

  return `${wsBaseUrl}/partner-chat?token=${encodeURIComponent(token)}`;
}

function createClientMessageId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function parseServerMessage(data: string) {
  try {
    return JSON.parse(data) as ServerMessage;
  } catch {
    return null;
  }
}

export function usePartnerChat(token: string | null) {
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const shouldReconnectRef = useRef(false);
  const [status, setStatus] = useState<PartnerChatStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [messages, setMessages] = useState<PartnerChatMessage[]>([]);

  const clearReconnectTimer = useCallback(() => {
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
  }, []);

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

      if (payload.type === "message") {
        setMessages((current) => [
          ...current,
          {
            id: payload.clientMessageId ?? createClientMessageId(),
            text: payload.text,
            sentAt: payload.sentAt,
            isSelf: false,
            status: "sent",
          },
        ]);
        return;
      }

      if (payload.type === "delivery" && payload.clientMessageId) {
        setMessages((current) =>
          current.map((message) =>
            message.id === payload.clientMessageId
              ? {
                  ...message,
                  status: payload.status,
                  sentAt: payload.sentAt ?? message.sentAt,
                }
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
          message.status === "sending" ? { ...message, status: "failed" } : message,
        ),
      );

      if (shouldReconnectRef.current) {
        reconnectTimerRef.current = setTimeout(connect, 2000);
      }
    };
  }, [clearReconnectTimer, token]);

  useEffect(() => {
    shouldReconnectRef.current = Boolean(token);

    if (!token) {
      socketRef.current?.close();
      socketRef.current = null;
      clearReconnectTimer();
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

  const sendMessage = useCallback((text: string) => {
    const trimmedText = text.trim();
    if (!trimmedText) {
      return false;
    }

    const clientMessageId = createClientMessageId();
    const nextMessage: PartnerChatMessage = {
      id: clientMessageId,
      text: trimmedText,
      sentAt: new Date().toISOString(),
      isSelf: true,
      status: "sending",
    };

    setMessages((current) => [...current, nextMessage]);

    const socket = socketRef.current;
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      setMessages((current) =>
        current.map((message) =>
          message.id === clientMessageId ? { ...message, status: "failed" } : message,
        ),
      );
      return false;
    }

    socket.send(
      JSON.stringify({
        type: "message",
        text: trimmedText,
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
      sendMessage,
    }),
    [errorMessage, isConnected, messages, sendMessage, status],
  );
}
