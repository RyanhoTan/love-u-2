import { ArchiveRestore, ChevronLeft, Gift } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import type { WishItem } from "@/api/wish";
import { PageBody } from "@/components/layout/page-body";
import { QueryError } from "@/components/query-state";
import { Button } from "@/components/ui/button";
import {
  errorMessage,
  useDeletedWishesQuery,
  useRestoreWishMutation,
} from "@/features/wish/queries";

const DAY_IN_MILLISECONDS = 24 * 60 * 60 * 1000;

function formatTimestamp(value: string | null) {
  if (!value) {
    return "暂不可用";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "日期暂不可用";
  }

  return new Intl.DateTimeFormat("zh-CN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function getRemainingTime(value: string | null) {
  if (!value) {
    return "清理期限暂不可用";
  }

  const expiresAt = new Date(value).getTime();
  if (Number.isNaN(expiresAt)) {
    return "清理期限暂不可用";
  }

  const remainingMilliseconds = expiresAt - Date.now();
  if (remainingMilliseconds <= 0) {
    return "已到清理时间";
  }

  const remainingDays = Math.floor(remainingMilliseconds / DAY_IN_MILLISECONDS);
  return remainingDays === 0 ? "剩余不足 1 天" : `约剩余 ${remainingDays} 天`;
}

export function WishRecyclePage() {
  const query = useDeletedWishesQuery();
  const restoreMutation = useRestoreWishMutation();
  const [pendingWishId, setPendingWishId] = useState<number | null>(null);
  const [actionError, setActionError] = useState("");
  const [statusMessage, setStatusMessage] = useState("");

  async function handleRestore(wish: WishItem) {
    if (
      pendingWishId !== null ||
      !window.confirm(`恢复“${wish.title}”到心愿列表？`)
    ) {
      return;
    }

    setPendingWishId(wish.id);
    setActionError("");
    setStatusMessage("");
    restoreMutation.reset();

    try {
      await restoreMutation.mutateAsync(wish.id);
      setStatusMessage(`已恢复“${wish.title}”`);
    } catch (error) {
      setActionError(errorMessage(error, "恢复失败，请重试"));
    } finally {
      setPendingWishId(null);
    }
  }

  return (
    <>
      <header className="flex shrink-0 items-center justify-between bg-surface-soft/80 px-8 pb-3 pt-7 backdrop-blur-[20px]">
        <div className="flex min-w-0 items-center gap-2">
          <Link
            to="/wishes"
            aria-label="返回心愿"
            className="inline-flex size-9 shrink-0 items-center justify-center rounded-control text-fg transition-transform duration-100 ease-out active:scale-[0.97]"
          >
            <ChevronLeft className="size-4" strokeWidth={2} />
          </Link>
          <div className="flex min-w-0 flex-col gap-0.5">
            <h1 className="text-[22px] font-semibold leading-8 tracking-[-0.4px] text-fg">
              心愿回收站
            </h1>
            <p className="text-xs text-fg-muted">
              可在服务端清理截止时间前恢复
            </p>
          </div>
        </div>
        <Button variant="secondary" to="/wishes">
          返回心愿
        </Button>
      </header>

      <PageBody className="gap-5 px-8 py-6">
        {actionError ? (
          <p className="text-sm text-danger" role="alert">
            {actionError}
          </p>
        ) : null}
        {statusMessage ? (
          <p className="text-sm text-accent" role="status">
            {statusMessage}
          </p>
        ) : null}
        {query.isPending ? (
          <div
            className="flex min-h-48 items-center justify-center text-sm text-fg-muted"
            role="status"
          >
            正在加载回收站…
          </div>
        ) : query.isError ? (
          <QueryError onRetry={() => void query.refetch()} />
        ) : query.data.wishes.length === 0 ? (
          <div className="flex min-h-64 flex-col items-center justify-center gap-3 text-center">
            <div className="flex size-14 items-center justify-center rounded-[16px] bg-accent-soft">
              <Gift className="size-[26px] text-accent" strokeWidth={2} />
            </div>
            <h2 className="text-[17px] font-semibold tracking-[-0.2px] text-fg">
              回收站还是空的
            </h2>
            <p className="text-sm text-fg-secondary">
              移入回收站的心愿会显示在这里，可在截止时间前恢复。
            </p>
          </div>
        ) : (
          <>
            <p className="text-sm text-fg-secondary">
              截止时间由服务端提供；网页端提供恢复操作，不提供永久删除。
            </p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {query.data.wishes.map((wish) => {
                const isPending = pendingWishId === wish.id;

                return (
                  <article
                    key={wish.id}
                    className="overflow-hidden rounded-surface bg-surface shadow-[0_1px_3px_rgba(0,0,0,0.03),0_4px_12px_rgba(0,0,0,0.04)]"
                  >
                    {wish.cover ? (
                      <img
                        src={wish.cover}
                        alt={wish.title}
                        className="h-44 w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-44 items-center justify-center bg-border text-sm text-fg-muted">
                        无封面
                      </div>
                    )}
                    <div className="flex flex-col gap-3 p-4">
                      <h2 className="truncate text-base font-semibold text-fg">
                        {wish.title}
                      </h2>
                      <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5 text-xs">
                        <dt className="text-fg-muted">删除时间</dt>
                        <dd className="text-right text-fg-secondary">
                          {formatTimestamp(wish.deletedAt)}
                        </dd>
                        <dt className="text-fg-muted">清理截止</dt>
                        <dd className="text-right text-fg-secondary">
                          {formatTimestamp(wish.deleteExpiresAt)}
                        </dd>
                      </dl>
                      <p className="text-xs font-medium text-accent">
                        {getRemainingTime(wish.deleteExpiresAt)}
                      </p>
                      <Button
                        variant="secondary"
                        disabled={pendingWishId !== null}
                        onClick={() => void handleRestore(wish)}
                      >
                        <ArchiveRestore className="size-4" aria-hidden="true" />
                        {isPending ? "恢复中…" : "恢复心愿"}
                      </Button>
                    </div>
                  </article>
                );
              })}
            </div>
          </>
        )}
      </PageBody>
    </>
  );
}
