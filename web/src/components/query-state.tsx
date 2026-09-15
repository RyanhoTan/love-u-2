import type { ReactNode } from "react";
import type { UseQueryResult } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { cx } from "@/lib/cx";

type QueryStateProps<T> = {
  query: UseQueryResult<T>;
  children: (data: T) => ReactNode;
};

type QueryErrorProps = {
  onRetry: () => void;
  className?: string;
};

export function QueryError({ onRetry, className }: QueryErrorProps) {
  return (
    <div
      className={cx(
        "flex min-h-0 flex-1 flex-col items-center justify-center gap-3 text-center",
        className,
      )}
      role="alert"
    >
      <p className="text-[13px] text-fg-secondary">加载失败</p>
      <Button variant="secondary" onClick={onRetry}>
        点击重试
      </Button>
    </div>
  );
}

export function QueryState<T>({ query, children }: QueryStateProps<T>) {
  if (query.isPending) {
    return (
      <div className="flex min-h-0 flex-1 items-center justify-center text-[13px] text-fg-muted">
        加载中...
      </div>
    );
  }

  if (query.isError) {
    return <QueryError onRetry={() => void query.refetch()} />;
  }

  if (query.isSuccess) {
    return children(query.data);
  }

  return null;
}
