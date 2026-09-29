import { useState } from "react";
import { Button } from "@/components/ui/button";

export function EditTargetDateDialog({
  initialTargetDate,
  pending,
  error,
  onCancel,
  onSave,
}: {
  initialTargetDate: string;
  pending: boolean;
  error?: string;
  onCancel: () => void;
  onSave: (targetDate: string) => void;
}) {
  const [targetDate, setTargetDate] = useState(initialTargetDate);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-overlay px-6 py-6 backdrop-blur-[20px]"
      onClick={pending ? undefined : onCancel}
      role="presentation"
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="wish-target-date-heading"
        className="w-full max-w-[480px] rounded-[20px] bg-surface p-5 shadow-[0_12px_40px_rgb(28_20_24_/_0.1)]"
        onClick={(event) => event.stopPropagation()}
        onKeyDown={(event) => {
          if (event.key === "Escape" && !pending) {
            onCancel();
          }
        }}
      >
        <h2
          id="wish-target-date-heading"
          className="mb-4 text-[17px] font-semibold tracking-[-0.2px] text-fg"
        >
          编辑心愿目标日
        </h2>

        <label
          htmlFor="wish-target-date"
          className="mb-2 block text-sm font-medium text-fg-secondary"
        >
          目标日期
        </label>
        <input
          autoFocus
          id="wish-target-date"
          type="date"
          min="1000-01-01"
          max="9999-12-31"
          value={targetDate}
          disabled={pending}
          aria-label="心愿目标日期"
          className="h-12 w-full rounded-[12px] border border-border bg-surface-soft px-3.5 text-[15px] text-fg outline-none focus:border-accent focus:shadow-[0_0_0_3px_var(--color-accent-soft)] disabled:opacity-60"
          onChange={(event) => setTargetDate(event.target.value)}
        />

        {error ? (
          <p className="mt-3 text-sm font-medium text-danger" role="alert">
            {error}
          </p>
        ) : null}

        <div className="mt-5 flex justify-end gap-2">
          <Button variant="secondary" disabled={pending} onClick={onCancel}>
            取消
          </Button>
          <Button
            disabled={pending || !targetDate || targetDate === initialTargetDate}
            onClick={() => onSave(targetDate)}
          >
            {pending ? "保存中…" : "保存"}
          </Button>
        </div>
      </section>
    </div>
  );
}
