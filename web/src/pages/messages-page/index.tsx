import { useEffect, useMemo, useRef } from "react";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/features/auth/context";
import {
  usePartnerChat,
  type PartnerChatMessage,
  type PartnerChatStatus,
} from "@/features/partner-chat/use-partner-chat";
import { displayName } from "@/lib/user";
import { Avatar } from "../../components/ui/avatar";
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

const MESSAGE_ENTRANCE_WINDOW_MS = 2000;

function shouldAnimateEntrance(message: PartnerChatMessage) {
  const sentAt = new Date(message.sentAt).getTime();
  if (Number.isNaN(sentAt)) {
    return false;
  }

  return Date.now() - sentAt < MESSAGE_ENTRANCE_WINDOW_MS;
}

export function MessagesPage() {
  const { user, token } = useAuth();
  const partner = user?.couple.partner ?? null;
  const partnerName = partner ? displayName(partner) : "";
  const selfName = user ? displayName(user) : "";
  const threadRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const stickToBottomRef = useRef(true);
  const chat = usePartnerChat(partner && token ? token : null);
  const threadItems = useMemo(
    () => buildThreadItems(chat.messages),
    [chat.messages],
  );
  const hint = connectionHint(chat.status, chat.errorMessage);

  useEffect(() => {
    const thread = threadRef.current;
    const content = contentRef.current;
    if (!thread || !content) {
      return;
    }

    function onScroll() {
      if (!thread) {
        return;
      }
      const distance =
        thread.scrollHeight - thread.scrollTop - thread.clientHeight;
      stickToBottomRef.current = distance < 24;
    }

    const observer = new ResizeObserver(() => {
      if (stickToBottomRef.current) {
        thread.scrollTop = thread.scrollHeight;
      }
    });

    thread.addEventListener("scroll", onScroll, { passive: true });
    observer.observe(content);
    thread.scrollTop = thread.scrollHeight;

    return () => {
      thread.removeEventListener("scroll", onScroll);
      observer.disconnect();
    };
  }, [partner, user]);

  useEffect(() => {
    const thread = threadRef.current;
    if (!thread || !stickToBottomRef.current) {
      return;
    }

    thread.scrollTop = thread.scrollHeight;
  }, [threadItems]);

  if (!partner || !user) {
    return null;
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      {hint ? (
        <p className="shrink-0 px-6 py-2 text-center text-[12px] text-fg-muted">
          {hint}
        </p>
      ) : null}

      <div
        ref={threadRef}
        className="flex min-h-0 flex-1 flex-col overflow-y-auto px-18 py-7"
      >
        <div ref={contentRef} className="mt-auto flex flex-col gap-4">
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
              const showSendingSpinner =
                !incoming && message.status === "sending";
              const animateEntrance = shouldAnimateEntrance(message);

              return (
                <div
                  key={item.key}
                  className={cx(
                    "flex items-end gap-2",
                    incoming ? "" : "justify-end",
                    animateEntrance &&
                      cx(
                        incoming ? "origin-bottom-left" : "origin-bottom-right",
                        "motion-safe:animate-[message-bubble-in_320ms_cubic-bezier(0.2,0.8,0.2,1)_both] motion-reduce:animate-none",
                      ),
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
                    <div className="flex items-center gap-2">
                      {showSendingSpinner ? (
                        <Loader2
                          className="size-4 shrink-0 animate-spin text-fg-muted motion-reduce:animate-none"
                          strokeWidth={2}
                          aria-label="发送中"
                        />
                      ) : null}
                      {message.messageType === "audio" && message.audioUrl ? (
                        <VoiceBubble
                          src={message.audioUrl}
                          incoming={incoming}
                          durationSeconds={message.audioDurationSeconds}
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
                    </div>
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
