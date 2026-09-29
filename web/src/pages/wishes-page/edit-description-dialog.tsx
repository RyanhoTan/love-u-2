import { useState } from "react";
import { Button } from "@/components/ui/button";

const MAX_DESCRIPTION_LENGTH = 1000;

export function EditDescriptionDialog({
  initialDescription,
  pending,
  error,
  onCancel,
  onSave,
}: {
  initialDescription: string;
  pending: boolean;
  error?: string;
  onCancel: () => void;
  onSave: (description: string) => void;
}) {
  const [description, setDescription] = useState(initialDescription);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-overlay px-6 py-6 backdrop-blur-[20px]"
      onClick={pending ? undefined : onCancel}
      role="presentation"
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="wish-description-title"
        className="w-full max-w-[480px] rounded-[20px] bg-surface p-5 shadow-[0_12px_40px_rgb(28_20_24_/_0.1)]"
        onClick={(event) => event.stopPropagation()}
        onKeyDown={(event) => {
          if (event.key === "Escape" && !pending) {
            onCancel();
          }
        }}
      >
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2
            id="wish-description-title"
            className="text-[17px] font-semibold tracking-[-0.2px] text-fg"
          >
            编辑心愿描述
          </h2>
          <span className="text-xs text-fg-muted">
            {description.length}/{MAX_DESCRIPTION_LENGTH}
          </span>
        </div>

        <textarea
          autoFocus
          value={description}
          maxLength={MAX_DESCRIPTION_LENGTH}
          disabled={pending}
          aria-label="心愿描述"
          placeholder="补充你们想一起做这件事的理由"
          className="min-h-36 w-full resize-y rounded-[12px] border border-border bg-surface-soft px-3.5 py-3.5 text-[15px] leading-[1.45] text-fg outline-none placeholder:text-fg-muted focus:border-accent focus:shadow-[0_0_0_3px_var(--color-accent-soft)] disabled:opacity-60"
          onChange={(event) => setDescription(event.target.value)}
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
          <Button disabled={pending} onClick={() => onSave(description.trim())}>
            {pending ? "保存中…" : "保存"}
          </Button>
        </div>
      </section>
    </div>
  );
}
