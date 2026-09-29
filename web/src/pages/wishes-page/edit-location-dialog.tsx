import { useState } from "react";
import { Button } from "@/components/ui/button";

const MAX_LOCATION_NAME_LENGTH = 100;

export function EditLocationDialog({
  initialLocationName,
  pending,
  error,
  onCancel,
  onSave,
}: {
  initialLocationName: string;
  pending: boolean;
  error?: string;
  onCancel: () => void;
  onSave: (locationName: string) => void;
}) {
  const [locationName, setLocationName] = useState(initialLocationName);
  const normalizedLocationName = locationName.trim();

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-overlay px-6 py-6 backdrop-blur-[20px]"
      onClick={pending ? undefined : onCancel}
      role="presentation"
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="wish-location-heading"
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
            id="wish-location-heading"
            className="text-[17px] font-semibold tracking-[-0.2px] text-fg"
          >
            编辑地点名称
          </h2>
          <span className="text-xs text-fg-muted">
            {locationName.length}/{MAX_LOCATION_NAME_LENGTH}
          </span>
        </div>

        <input
          autoFocus
          value={locationName}
          maxLength={MAX_LOCATION_NAME_LENGTH}
          disabled={pending}
          aria-label="心愿地点名称"
          placeholder="例如：想去的餐厅或城市"
          className="h-12 w-full rounded-[12px] border border-border bg-surface-soft px-3.5 text-[15px] text-fg outline-none placeholder:text-fg-muted focus:border-accent focus:shadow-[0_0_0_3px_var(--color-accent-soft)] disabled:opacity-60"
          onChange={(event) => setLocationName(event.target.value)}
        />
        <p className="mt-2 text-xs leading-5 text-fg-muted">
          留空可清除名称；此操作只修改地点名称，不更改已保存的坐标。
        </p>

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
            disabled={pending || normalizedLocationName === initialLocationName}
            onClick={() => onSave(normalizedLocationName)}
          >
            {pending ? "保存中…" : "保存"}
          </Button>
        </div>
      </section>
    </div>
  );
}
