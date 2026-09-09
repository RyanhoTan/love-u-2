import { Trash2 } from "lucide-react";
import { useState, type ReactNode } from "react";
import { cx } from "@/lib/cx";

function Overlay({
  children,
  onDismiss,
}: {
  children: ReactNode;
  onDismiss?: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-overlay px-6 py-6 backdrop-blur-[16px]"
      onClick={onDismiss}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          onDismiss?.();
        }
      }}
      role="presentation"
    >
      <div
        className="w-full max-w-[400px]"
        onClick={(event) => event.stopPropagation()}
        onKeyDown={(event) => event.stopPropagation()}
        role="presentation"
      >
        {children}
      </div>
    </div>
  );
}

export function DeleteDayDialog({
  title,
  onCancel,
  onConfirm,
}: {
  title: string;
  onCancel: () => void;
  onConfirm: () => Promise<void>;
}) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  return (
    <Overlay onDismiss={submitting ? undefined : onCancel}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-day-title"
        className="overflow-hidden rounded-[20px] bg-surface shadow-[0_12px_40px_rgb(28_20_24_/_0.1)]"
      >
        <div className="flex flex-col items-center gap-2 px-6 pb-6 pt-7 text-center">
          <div className="mb-1 flex size-11 items-center justify-center rounded-full bg-danger/8">
            <Trash2 className="size-5 text-danger" strokeWidth={2} />
          </div>
          <h2
            id="delete-day-title"
            className="text-lg font-semibold tracking-[-0.3px] text-fg"
          >
            删除这个纪念日？
          </h2>
          <p className="text-sm leading-[1.45] tracking-[-0.1px] text-fg-secondary">
            「{title}」将被永久删除，相关提醒也会一并取消。此操作无法撤销。
          </p>
          {error ? (
            <p className="mt-1 text-[13px] font-medium text-danger" role="alert">
              {error}
            </p>
          ) : null}
        </div>

        <div className="h-px bg-border" />

        <div className="flex h-[52px] items-stretch">
          <button
            type="button"
            disabled={submitting}
            onClick={onCancel}
            className="flex flex-1 items-center justify-center text-base font-medium tracking-[-0.2px] text-fg transition-colors duration-100 ease-out hover:bg-surface-soft active:scale-[0.99] disabled:opacity-60"
          >
            取消
          </button>
          <div className="w-px bg-border" />
          <button
            type="button"
            disabled={submitting}
            onClick={() => {
              void (async () => {
                try {
                  setSubmitting(true);
                  setError("");
                  await onConfirm();
                } catch (caught) {
                  setError(
                    caught instanceof Error ? caught.message : "request failed",
                  );
                  setSubmitting(false);
                }
              })();
            }}
            className={cx(
              "flex flex-1 items-center justify-center text-base font-semibold tracking-[-0.2px] text-danger",
              "transition-colors duration-100 ease-out hover:bg-surface-soft active:scale-[0.99]",
              "disabled:opacity-60",
            )}
          >
            {submitting ? "删除中…" : "删除"}
          </button>
        </div>
      </div>
    </Overlay>
  );
}
