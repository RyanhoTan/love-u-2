import { Check } from "lucide-react";
import type { ReactNode } from "react";
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

export function MarkDoneDialog({
  title,
  pending = false,
  error,
  onCancel,
  onConfirm,
}: {
  title: string;
  pending?: boolean;
  error?: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <Overlay onDismiss={pending ? undefined : onCancel}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="mark-wish-done-title"
        className="overflow-hidden rounded-[20px] bg-surface shadow-[0_12px_40px_rgb(28_20_24_/_0.1)]"
      >
        <div className="flex flex-col items-center gap-2 px-6 pb-6 pt-7 text-center">
          <div className="mb-1 flex size-11 items-center justify-center rounded-full bg-accent-soft">
            <Check className="size-5 text-accent" strokeWidth={2.25} />
          </div>
          <h2
            id="mark-wish-done-title"
            className="text-lg font-semibold tracking-[-0.3px] text-fg"
          >
            标记为已完成？
          </h2>
          <p className="text-sm leading-[1.45] tracking-[-0.1px] text-fg-secondary">
            「{title}」会移到已完成。你们随时还能在列表里找到它。
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
            disabled={pending}
            onClick={onCancel}
            className={cx(
              "flex flex-1 items-center justify-center text-[15px] font-medium text-fg-secondary",
              "transition-transform duration-100 ease-out active:scale-[0.98] disabled:opacity-60",
            )}
          >
            取消
          </button>
          <div className="w-px self-stretch bg-border" />
          <button
            type="button"
            disabled={pending}
            onClick={onConfirm}
            className={cx(
              "flex flex-1 items-center justify-center text-[15px] font-semibold text-accent",
              "transition-transform duration-100 ease-out active:scale-[0.98] disabled:opacity-60",
            )}
          >
            {pending ? "…" : "完成"}
          </button>
        </div>
      </div>
    </Overlay>
  );
}
