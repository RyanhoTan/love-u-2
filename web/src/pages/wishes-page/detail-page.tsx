import { useEffect } from "react";
import { Navigate, useParams, useSearchParams } from "react-router-dom";
import { useAuth } from "@/features/auth/context";
import {
  errorMessage,
  useUpdateWishMutation,
  useWishQuery,
  useWishRecordsQuery,
} from "@/features/wish/queries";
import { PageBody } from "@/components/layout/page-body";
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

  if (wishQuery.isPending) {
    return (
      <PageBody className="items-center justify-center">
        <p className="text-sm text-fg-muted">加载中…</p>
      </PageBody>
    );
  }

  if (wishQuery.isError || !wish) {
    return (
      <PageBody className="items-center justify-center gap-4">
        <p className="text-sm font-medium text-danger" role="alert">
          {errorMessage(wishQuery.error)}
        </p>
        <Button variant="secondary" onClick={() => void wishQuery.refetch()}>
          重试
        </Button>
        <Button variant="ghost" to="/wishes">
          返回
        </Button>
      </PageBody>
    );
  }

  const creator =
    user && wish.createdByUserId === user.id
      ? user
      : user?.couple.partner &&
          wish.createdByUserId === user.couple.partner.id
        ? user.couple.partner
        : null;

  return (
    <PageBody className="gap-10 lg:flex-row lg:gap-12">
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
        error={recordsQuery.error}
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
    </PageBody>
  );
}
