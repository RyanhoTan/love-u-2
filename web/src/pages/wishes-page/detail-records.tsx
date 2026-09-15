import { useState } from "react";
import type { SchemaWishRecord } from "@/api/schemas";
import {
  MediaViewer,
  type MediaViewerItem,
} from "@/components/media/media-viewer";
import { QueryError } from "@/components/query-state";
import { cx } from "@/lib/cx";
import { formatBudget, isoToDotDate } from "./types";

export function WishDetailRecords({
  records,
  isPending,
  isError,
  onRetry,
}: {
  records: SchemaWishRecord[];
  isPending: boolean;
  isError: boolean;
  onRetry: () => void;
}) {
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);
  const viewerItems: MediaViewerItem[] = records.flatMap((record) =>
    record.media.map((item, mediaIndex) => ({
      id: `${record.id}-${mediaIndex}-${item.url}`,
      src: item.url,
      thumbnailSrc: item.thumbnailUrl || item.url,
      kind: item.mediaType,
      label: `${isoToDotDate(record.recordDate)} · ${item.mediaType === "video" ? "视频" : "图片"}`,
    })),
  );

  return (
    <section className="flex min-w-0 flex-col gap-4 lg:pr-2">
      <div className="flex items-center justify-between">
        <h2 className="text-[15px] font-semibold tracking-[-0.2px] text-fg">
          记录
        </h2>
        <span className="text-[13px] text-fg-muted">{records.length} 条</span>
      </div>

      {isPending ? (
        <p className="text-sm text-fg-muted">加载记录…</p>
      ) : isError ? (
        <QueryError className="items-start text-left" onRetry={onRetry} />
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
                        {record.media.map((item, mediaIndex) => {
                          const viewerItemId = `${record.id}-${mediaIndex}-${item.url}`;
                          const viewerIndex = viewerItems.findIndex(
                            (viewerItem) => viewerItem.id === viewerItemId,
                          );

                          return (
                            <button
                              key={viewerItemId}
                              type="button"
                              aria-label={`查看${item.mediaType === "video" ? "视频" : "图片"}`}
                              onClick={() => setPreviewIndex(viewerIndex)}
                              className="group size-12 cursor-zoom-in overflow-hidden rounded-[8px] border-0 bg-transparent p-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                            >
                              <img
                                src={item.thumbnailUrl || item.url}
                                alt=""
                                className="size-full object-cover transition-transform duration-150 group-hover:scale-105"
                              />
                            </button>
                          );
                        })}
                      </div>
                    ) : null}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {previewIndex !== null ? (
        <MediaViewer
          items={viewerItems}
          initialIndex={previewIndex}
          onClose={() => setPreviewIndex(null)}
        />
      ) : null}
    </section>
  );
}
