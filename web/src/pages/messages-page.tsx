import { MESSAGES } from "../app/mock";
import { COUPLE } from "../app/couple";
import { Composer } from "../components/layout/composer";
import { Avatar } from "../components/ui/avatar";
import { cx } from "../lib/cx";

export function MessagesPage() {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-18 py-7">
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
                  <Avatar src={COUPLE.lin.src} alt={COUPLE.lin.name} size={28} />
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
                  "flex gap-2",
                  incoming ? "items-end" : "justify-end",
                )}
              >
                {incoming ? (
                  <Avatar src={COUPLE.lin.src} alt={COUPLE.lin.name} size={28} />
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
              </div>
            );
          })}
        </div>
      </div>
      <Composer />
    </div>
  );
}
