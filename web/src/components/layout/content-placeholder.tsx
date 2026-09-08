import { useRouteHandle } from "../../app/use-route-handle";
import { cx } from "../../lib/cx";

export function ContentPlaceholder({ label }: { label?: string }) {
  const handle = useRouteHandle();

  return (
    <div
      className={cx(
        "flex min-h-0 flex-1 items-center justify-center rounded-surface border border-dashed border-border bg-surface/70",
        "text-[13px] text-fg-muted",
      )}
    >
      {label ?? `${handle.placeholder}内容区`}
    </div>
  );
}
