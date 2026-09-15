import { ChevronLeft } from "lucide-react";
import { useEffect, type ReactNode } from "react";
import { Link, Navigate, useParams, useSearchParams } from "react-router-dom";
import { useAuth } from "@/features/auth/context";
import {
  errorMessage,
  useUpdateWishMutation,
  useWishQuery,
  useWishRecordsQuery,
} from "@/features/wish/queries";
import { PageBody } from "@/components/layout/page-body";
import { QueryError } from "@/components/query-state";
import { Button } from "@/components/ui/button";
import { WishDetailInfo } from "./detail-info";
import { WishDetailRecords } from "./detail-records";
import { MarkDoneDialog } from "./mark-done-dialog";
import { RecordSheet } from "./record-sheet";

export function WishDetailPage() {
  const { id = "" } = useParams();
  const wishId = Number(id);
  const [params, setParams] = useSearchParams();
  const { user } = useAuth();
  const wishQuery = useWishQuery(wishId);
  const recordsQuery = useWishRecordsQuery(wishId);
  const updateMutation = useUpdateWishMutation();

  const showDone = params.get("done") === "1";
  const showRecord = params.get("record") === "1";
  const wish = wishQuery.data?.wish;
  const isDone = wish?.status === "done";
  function closeQuery(key: "done" | "record") {
    const next = new URLSearchParams(params);
    next.delete(key);
    setParams(next, { replace: true });
  }

  function openQuery(key: "done" | "record") {
    const next = new URLSearchParams(params);
    next.set(key, "1");
    setParams(next, { replace: true });
  }

  useEffect(() => {
    if (!isDone || !showDone) {
      return;
    }
    setParams(
      (current) => {
        const next = new URLSearchParams(current);
        next.delete("done");
        return next;
      },
      { replace: true },
    );
  }, [isDone, showDone, setParams]);

  if (!Number.isInteger(wishId) || wishId <= 0) {
    return <Navigate to="/wishes" replace />;
  }



  let body: ReactNode;
  let bodyClassName = "gap-10 lg:flex-row lg:gap-12";

  if (wishQuery.isPending) {
    bodyClassName = "items-center justify-center";
    body = <p className="text-sm text-fg-muted">加载中…</p>;
  } else if (wishQuery.isError || !wish) {
    bodyClassName = "items-center justify-center gap-4";
    body = (
      <>
        <QueryError
          className="flex-none"
          onRetry={() => void wishQuery.refetch()}
        />
        <Button variant="ghost" to="/wishes">
          返回
        </Button>
      </>
    );
  } else {
    const creator =
      user && wish.createdByUserId === user.id
        ? user
        : user?.couple.partner &&
            wish.createdByUserId === user.couple.partner.id
          ? user.couple.partner
          : null;

    body = (
      <>
        <WishDetailInfo
          wish={wish}
          creator={creator}
          onMarkDone={() => openQuery("done")}
          onAddRecord={() => openQuery("record")}
        />
        <WishDetailRecords
          records={recordsQuery.data?.records ?? []}
          isPending={recordsQuery.isPending}
          isError={recordsQuery.isError}
          onRetry={() => void recordsQuery.refetch()}
        />

        {showDone && !isDone ? (
          <MarkDoneDialog
            title={wish.title}
            pending={updateMutation.isPending}
            error={
              updateMutation.isError
                ? errorMessage(updateMutation.error)
                : undefined
            }
            onCancel={() => {
              updateMutation.reset();
              closeQuery("done");
            }}
            onConfirm={() => {
              updateMutation.mutate(
                { id: wishId, payload: { status: "done" } },
                {
                  onSuccess: () => closeQuery("done"),
                },
              );
            }}
          />
        ) : null}

        {showRecord ? (
          <RecordSheet wishId={wishId} onClose={() => closeQuery("record")} />
        ) : null}
      </>
    );
  }

  return (
    <>
          <header className="flex shrink-0 items-center justify-between bg-surface-soft/80 px-8 pb-3 pt-7 backdrop-blur-[20px]">
      <div className="flex min-w-0 items-center gap-2">
        <Link
          to="/wishes"
          aria-label="返回"
          className="inline-flex size-9 shrink-0 items-center justify-center rounded-control text-fg transition-transform duration-100 ease-out active:scale-[0.97]"
        >
          <ChevronLeft className="size-4" strokeWidth={2} />
        </Link>
        <div className="flex min-w-0 flex-col gap-0.5">
          <h1 className="text-[22px] font-semibold leading-8 tracking-[-0.4px] text-fg">
            心愿详情
          </h1>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="ghost" to="?done=1">
          标记完成
        </Button>
        <Button variant="primary" to="?record=1">
          记一笔
        </Button>
      </div>
    </header>
      <PageBody className={bodyClassName}>{body}</PageBody>
    </>
  );
}
