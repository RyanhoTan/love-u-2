import type { SchemaWishRecord } from "@/api/schemas";
import { Button } from "@/components/ui/button";
import { cx } from "@/lib/cx";
import { errorMessage } from "@/features/wish/queries";
import { formatBudget, isoToDotDate } from "./types";

export function WishDetailRecords({
  records,
  isPending,
  isError,
  error,
  onRetry,
}: {
  records: SchemaWishRecord[];
  isPending: boolean;
  isError: boolean;
  error: unknown;
  onRetry: () => void;
}) {
  return (
    <section className="flex min-w-0 flex-1 flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-[15px] font-semibold tracking-[-0.2px] text-fg">
          记录
        </h2>
        <span className="text-[13px] text-fg-muted">{records.length} 条</span>
      </div>

      {isPending ? (
        <p className="text-sm text-fg-muted">加载记录…</p>
      ) : isError ? (
        <div className="flex flex-col items-start gap-2">
          <p className="text-sm text-danger" role="alert">
            {errorMessage(error)}
          </p>
          <Button variant="ghost" onClick={onRetry}>
            重试
          </Button>
        </div>
      ) : records.length === 0 ? (
        <div className="rounded-[12px] bg-surface px-4 py-8 text-sm text-fg-secondary">
          还没有记录。点「记一笔」留下这一路的痕迹。
        </div>
      ) : (
        <div className="overflow-hidden rounded-[12px] bg-surface">
          {records.map((record, index) => {
            const bits = [
              record.mood,
              record.locationName,
              record.budgetAmount != null
                ? formatBudget(record.budgetAmount)
                : "",
            ].filter(Boolean);

            return (
              <article
                key={record.id}
                className={cx(
                  "flex flex-col gap-2 px-4 py-3.5",
                  index < records.length - 1 ? "border-b border-border" : "",
                )}
              >
                <div className="flex gap-3">
                  <p className="w-11 shrink-0 text-[13px] font-medium text-fg-muted">
                    {isoToDotDate(record.recordDate).slice(5) || "—"}
                  </p>
                  <div className="min-w-0 flex-1">
                    <p className="text-[15px] font-medium tracking-[-0.1px] text-fg">
                      {record.content || "（无文字）"}
                    </p>
                    {bits.length > 0 ? (
                      <p className="mt-1.5 text-xs text-fg-secondary">
                        {bits.join(" · ")}
                      </p>
                    ) : null}
                    {record.media.length > 0 ? (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {record.media.map((item) => (
                          <img
                            key={`${record.id}-${item.url}`}
                            src={item.thumbnailUrl || item.url}
                            alt=""
                            className="size-12 rounded-[8px] object-cover"
                          />
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
