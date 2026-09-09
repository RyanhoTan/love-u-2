import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cx } from "@/lib/cx";

function Overlay({
  children,
  onDismiss,
  align = "center",
}: {
  children: ReactNode;
  onDismiss?: () => void;
  align?: "center" | "end";
}) {
  return (
    <div
      className={cx(
        "fixed inset-0 z-50 flex bg-[#1C141899] px-6 backdrop-blur-[16px]",
        align === "center"
          ? "items-center justify-center py-6"
          : "items-end justify-center pb-6 pt-6",
      )}
      onClick={onDismiss}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          onDismiss?.();
        }
      }}
      role="presentation"
    >
      <div
        className="w-full max-w-[480px]"
        onClick={(event) => event.stopPropagation()}
        onKeyDown={(event) => event.stopPropagation()}
        role="presentation"
      >
        {children}
      </div>
    </div>
  );
}

export function UnbindDialog({
  onCancel,
  onConfirm,
}: {
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
        aria-labelledby="unbind-title"
        className="w-full max-w-[400px] rounded-surface bg-surface p-5 shadow-[0_8px_24px_rgb(0_0_0_/_0.08)]"
      >
        <h2
          id="unbind-title"
          className="text-lg font-semibold tracking-[-0.2px] text-fg"
        >
          解除绑定？
        </h2>
        <p className="mt-3 text-sm leading-[1.45] text-fg-secondary">
          你们将不再共享这个空间。相册、心愿和纪念日会保留，但对方看不到。此操作可重新绑定恢复。
        </p>
        {error ? (
          <p className="mt-3 text-[13px] font-medium text-danger" role="alert">
            {error}
          </p>
        ) : null}
        <div className="mt-5 flex justify-end gap-2">
          <Button
            variant="secondary"
            onClick={onCancel}
            disabled={submitting}
          >
            取消
          </Button>
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
              "inline-flex h-9 items-center justify-center rounded-control bg-danger px-4 text-[13px] font-semibold text-inverse",
              "transition-[background-color,transform] duration-100 ease-out active:scale-[0.97]",
              "disabled:opacity-60",
            )}
          >
            {submitting ? "解除中…" : "解除绑定"}
          </button>
        </div>
      </div>
    </Overlay>
  );
}

export function AnniversarySheet({
  initialDate,
  onClose,
  onSave,
}: {
  initialDate: string;
  onClose: () => void;
  onSave: (anniversaryDate: string | null) => Promise<void>;
}) {
  const [date, setDate] = useState(initialDate);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  return (
    <Overlay align="end" onDismiss={submitting ? undefined : onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="anniv-title"
        className="w-full max-w-[480px] rounded-[20px] bg-surface px-5 pb-5 pt-4 shadow-[0_-4px_24px_rgb(0_0_0_/_0.08)]"
      >
        <div className="flex justify-center pb-1 pt-1">
          <div className="h-1.5 w-9 rounded-[3px] bg-border" />
        </div>
        <div className="flex items-center justify-between">
          <h2
            id="anniv-title"
            className="text-[17px] font-semibold tracking-[-0.2px] text-fg"
          >
            恋爱纪念日
          </h2>
          <Button
            variant="ghost"
            disabled={submitting}
            onClick={() => {
              void (async () => {
                try {
                  setSubmitting(true);
                  setError("");
                  await onSave(date.trim() || null);
                } catch (caught) {
                  setError(
                    caught instanceof Error ? caught.message : "request failed",
                  );
                  setSubmitting(false);
                }
              })();
            }}
          >
            {submitting ? "保存中…" : "完成"}
          </Button>
        </div>
        <p className="mt-4 text-[13px] leading-[1.4] text-fg-secondary">
          从这一天起计算在一起的天数。可随时修改。
        </p>
        <label className="mt-4 flex flex-col gap-1.5">
          <span className="text-xs font-medium text-fg-muted">日期</span>
          <Input
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
          />
        </label>
        {error ? (
          <p className="mt-3 text-[13px] font-medium text-danger" role="alert">
            {error}
          </p>
        ) : null}
      </div>
    </Overlay>
  );
}
