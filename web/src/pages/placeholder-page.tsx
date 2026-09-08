import { useRouteHandle } from "../app/use-route-handle";
import { ContentPlaceholder } from "../components/layout/content-placeholder";
import { cx } from "../lib/cx";

export function PlaceholderPage() {
  const { bodyClassName } = useRouteHandle();

  return (
    <div className={cx("flex min-h-0 flex-1 flex-col", bodyClassName)}>
      <ContentPlaceholder />
    </div>
  );
}
