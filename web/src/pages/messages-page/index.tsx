import { useEffect, useRef } from "react";
import { useAuth } from "@/features/auth/context";
import { displayName } from "@/lib/user";
import { MESSAGES } from "@/mocks";
import { Avatar } from "../../components/ui/avatar";
import { Button } from "../../components/ui/button";
import { cx } from "../../lib/cx";
import { MessagesComposer } from "./composer";

export function MessagesPage() {
  const { user } = useAuth();
  const partner = user?.couple.isBound ? user.couple.partner : null;
  const partnerName = partner ? displayName(partner) : "";
  const selfName = user ? displayName(user) : "";
  const threadRef = useRef<HTMLDivElement>(null);

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
    return () => {
      thread.removeEventListener("scroll", onScroll);
      observer.disconnect();
    };
  }, [partner, user]);

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
      <div
        ref={threadRef}
        className="flex min-h-0 flex-1 flex-col overflow-y-auto px-18 py-7"
      >
        <div className="flex min-h-full flex-col justify-end gap-4">
          {MESSAGES.map((message, index) => {
            if (message.kind === "stamp") {
              return (
                <p
                  key={index}
                  className="text-center text-[11px] text-fg-muted"
                >
                  {message.text}
                </p>
              );
            }

            if (message.kind === "photo") {
              return (
                <div key={index} className="flex items-end gap-2">
                  <Avatar
                    src={partner.avatar ?? undefined}
                    alt={partnerName}
                    size={28}
                  />
                  <img
                    src={message.src}
                    alt={message.alt}
                    className="h-37 w-55 rounded-surface object-cover"
                  />
                </div>
              );
            }

            const incoming = message.kind === "in";

            return (
              <div
                key={index}
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
                  <p className="text-[11px] text-fg-muted">{message.time}</p>
                </div>
                {/* TODO: 头像应该也存在本地 */}
                {incoming ? null : (
                  <Avatar
                    src={user.avatar ?? undefined}
                    alt={selfName}
                    size={28}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
      <MessagesComposer />
    </div>
  );
}
