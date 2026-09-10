import type { ReactNode } from "react";
import { useRouteHandle } from "@/routes/use-route-handle";
import { cx } from "../../lib/cx";

export function PageBody({
  children,
  className,
  scroll = true,
}: {
  children: ReactNode;
  className?: string;
  scroll?: boolean;
}) {
  const { bodyClassName } = useRouteHandle();

  return (
    <div
      className={cx(
        "flex min-h-0 flex-1 flex-col",
        scroll ? "overflow-y-auto" : "overflow-hidden",
        bodyClassName,
        className,
      )}
    >
      {children}
    </div>
  );
}
