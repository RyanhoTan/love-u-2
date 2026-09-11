import { useEffect, useMemo, useRef } from "react";
import { useAuth } from "@/features/auth/context";
import {
  usePartnerChat,
  type PartnerChatMessage,
  type PartnerChatStatus,
} from "@/features/partner-chat/use-partner-chat";
import { displayName } from "@/lib/user";
import { Avatar } from "../../components/ui/avatar";
import { Button } from "../../components/ui/button";
import { cx } from "../../lib/cx";
import { MessagesComposer } from "./composer";
import { VoiceBubble } from "./voice-bubble";

type ThreadItem =
  | { kind: "stamp"; key: string; text: string }
  | { kind: "message"; key: string; message: PartnerChatMessage };

function formatMessageTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return `${String(date.getHours()).padStart(2, "0")}:${String(
    date.getMinutes(),
  ).padStart(2, "0")}`;
}

function formatDayStamp(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const now = new Date();
  const sameDay =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();

  const time = formatMessageTime(value);

  if (sameDay) {
    return `今天 ${time}`;
  }

  if (date.getFullYear() === now.getFullYear()) {
    return `${date.getMonth() + 1}月${date.getDate()}日 ${time}`;
  }

  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日 ${time}`;
}

function dayKey(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

function buildThreadItems(messages: PartnerChatMessage[]): ThreadItem[] {
  const items: ThreadItem[] = [];
  let lastDay: string | null = null;

  for (const message of messages) {
    const nextDay = dayKey(message.sentAt);
    if (nextDay !== lastDay) {
      const stamp = formatDayStamp(message.sentAt);
      if (stamp) {
        items.push({
          kind: "stamp",
          key: `stamp:${message.id}`,
          text: stamp,
        });
      }
      lastDay = nextDay;
    }

    items.push({
      kind: "message",
      key: message.id,
      message,
    });
  }

  return items;
}

function statusLabel(status: PartnerChatMessage["status"]) {
  if (status === "read") return "已读";
  if (status === "sending") return "发送中";
  if (status === "partner_offline") return "对方离线";
  if (status === "failed") return "发送失败";
  return "";
}

function connectionHint(status: PartnerChatStatus, errorMessage: string | null) {
  if (errorMessage) {
    return errorMessage;
  }

  if (status === "connecting") {
    return "连接中…";
  }

  if (status === "closed" || status === "error") {
    return "连接断开，正在重试…";
  }

  return null;
}

export function MessagesPage() {
  const { user, token } = useAuth();
  const partner = user?.couple.isBound ? user.couple.partner : null;
  const partnerName = partner ? displayName(partner) : "";
  const selfName = user ? displayName(user) : "";
  const threadRef = useRef<HTMLDivElement>(null);
  const chat = usePartnerChat(partner && token ? token : null);
  const threadItems = useMemo(
    () => buildThreadItems(chat.messages),
    [chat.messages],
  );
  const hint = connectionHint(chat.status, chat.errorMessage);

  useEffect(() => {
    const thread = threadRef.current;
    if (!thread) {
      return;
    }

    const stickToBottom = { current: true };

    function onScroll() {
      if (!thread) {
        return;
      }
      const distance =
        thread.scrollHeight - thread.scrollTop - thread.clientHeight;
      stickToBottom.current = distance < 24;
    }

    const observer = new ResizeObserver(() => {
      if (stickToBottom.current) {
        thread.scrollTop = thread.scrollHeight;
      }
    });

    thread.addEventListener("scroll", onScroll, { passive: true });
    observer.observe(thread);
    thread.scrollTop = thread.scrollHeight;

    return () => {
      thread.removeEventListener("scroll", onScroll);
      observer.disconnect();
    };
  }, [partner, user]);

  useEffect(() => {
    const thread = threadRef.current;
    if (!thread) {
      return;
    }

    const distance =
      thread.scrollHeight - thread.scrollTop - thread.clientHeight;
    if (distance < 120) {
      thread.scrollTop = thread.scrollHeight;
    }
  }, [threadItems]);

  if (!partner || !user) {
    return (
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-4 px-8">
        <p className="text-sm text-fg-secondary">绑定情侣后即可开始对话</p>
        <Button to="/me/couple">去绑定</Button>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {hint ? (
        <p className="shrink-0 px-6 py-2 text-center text-[12px] text-fg-muted">
          {hint}
        </p>
      ) : null}

      <div
        ref={threadRef}
        className="flex min-h-0 flex-1 flex-col overflow-y-auto px-18 py-7"
      >
        <div className="flex min-h-full flex-col justify-end gap-4">
          {threadItems.length === 0 ? (
            <p className="py-16 text-center text-sm text-fg-muted">
              还没有消息，打个招呼吧
            </p>
          ) : (
            threadItems.map((item) => {
              if (item.kind === "stamp") {
                return (
                  <p
                    key={item.key}
                    className="text-center text-[11px] text-fg-muted"
                  >
                    {item.text}
                  </p>
                );
              }

              const { message } = item;
              const incoming = !message.isSelf;

              return (
                <div
                  key={item.key}
                  className={cx(
                    "flex items-end gap-2",
                    incoming ? "" : "justify-end",
                  )}
                >
                  {incoming ? (
                    <Avatar
                      src={partner.avatar ?? undefined}
                      alt={partnerName}
                      size={28}
                    />
                  ) : null}
                  <div
                    className={cx(
                      "flex max-w-105 flex-col gap-1",
                      incoming ? "" : "items-end",
                    )}
                  >
                    {message.messageType === "audio" && message.audioUrl ? (
                      <VoiceBubble
                        src={message.audioUrl}
                        incoming={incoming}
                      />
                    ) : (
                      <p
                        className={cx(
                          "px-3.5 py-2.5 text-[15px] leading-[1.35]",
                          incoming
                            ? "rounded-[18px] rounded-bl-md bg-bubble text-fg"
                            : "rounded-[18px] rounded-br-md bg-accent text-inverse",
                        )}
                      >
                        {message.text}
                      </p>
                    )}
                    <p className="text-[11px] text-fg-muted">
                      {[
                        formatMessageTime(message.sentAt),
                        message.isSelf ? statusLabel(message.status) : "",
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  </div>
                  {incoming ? null : (
                    <Avatar
                      src={user.avatar ?? undefined}
                      alt={selfName}
                      size={28}
                    />
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
      <MessagesComposer
        disabled={!chat.isConnected}
        onSendText={chat.sendMessage}
        onSendAudio={chat.sendAudioMessage}
      />
    </div>
  );
}
