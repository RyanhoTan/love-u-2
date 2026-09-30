import { ChevronLeft, Trash2 } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import {
  Link,
  Navigate,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import { uploadWishMedia } from "@/api/wish";
import { useAuth } from "@/features/auth/context";
import {
  errorMessage,
  useDeleteWishMutation,
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
import { EditDescriptionDialog } from "./edit-description-dialog";
import { EditTitleDialog } from "./edit-title-dialog";
import { EditTargetDateDialog } from "./edit-target-date-dialog";
import { EditBudgetDialog } from "./edit-budget-dialog";
import { EditLocationDialog } from "./edit-location-dialog";

export function WishDetailPage() {
  const { id = "" } = useParams();
  const wishId = Number(id);
  const [params, setParams] = useSearchParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const wishQuery = useWishQuery(wishId);
  const recordsQuery = useWishRecordsQuery(wishId);
  const deleteMutation = useDeleteWishMutation();
  const updateMutation = useUpdateWishMutation();
  const [showTitleEditor, setShowTitleEditor] = useState(false);
  const [showDescriptionEditor, setShowDescriptionEditor] = useState(false);
  const [showTargetDateEditor, setShowTargetDateEditor] = useState(false);
  const [showBudgetEditor, setShowBudgetEditor] = useState(false);
  const [showLocationEditor, setShowLocationEditor] = useState(false);
  const [coverPending, setCoverPending] = useState(false);
  const [coverError, setCoverError] = useState("");
  const [statusActionError, setStatusActionError] = useState("");

  const showDone = params.get("done") === "1";
  const showRecord = params.get("record") === "1";
  const wish = wishQuery.data?.wish;
  const canShowCompletion = wish?.status === "doing";
  const statusActionLabel =
    wish?.status === "todo" ? "开始计划" : "标记完成";

  async function handleReplaceCover(file: File) {
    setCoverPending(true);
    setCoverError("");
    updateMutation.reset();
    try {
      const uploaded = await uploadWishMedia(file);
      await updateMutation.mutateAsync({
        id: wishId,
        payload: { coverObjectKey: uploaded.key },
      });
    } catch (error) {
      setCoverError(errorMessage(error, "封面保存失败"));
    } finally {
      setCoverPending(false);
    }
  }

  async function handleClearCover() {
    if (!window.confirm("清除这个心愿的封面？")) return;
    setCoverPending(true);
    setCoverError("");
    updateMutation.reset();
    try {
      await updateMutation.mutateAsync({
        id: wishId,
        payload: { coverObjectKey: null },
      });
    } catch (error) {
      setCoverError(errorMessage(error, "封面清除失败"));
    } finally {
      setCoverPending(false);
    }
  }

  function handleSoftDelete() {
    if (
      !wish ||
      deleteMutation.isPending ||
      !window.confirm(
        `将“${wish.title}”移入回收站。清理截止前可以在回收站恢复。`,
      )
    ) {
      return;
    }

    deleteMutation.mutate(wishId, {
      onSuccess: () => navigate("/wishes"),
    });
  }

  function handleAdvanceStatus() {
    if (!wish || updateMutation.isPending) {
      return;
    }

    setStatusActionError("");
    updateMutation.reset();

    if (wish.status === "todo") {
      updateMutation.mutate(
        { id: wishId, payload: { status: "doing" } },
        {
          onError: (error) => {
            setStatusActionError(
              errorMessage(error, "开始计划失败，请重试"),
            );
          },
        },
      );
      return;
    }

    if (wish.status === "doing") {
      openQuery("done");
    }
  }

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
    if (!showDone || wishQuery.isPending || canShowCompletion) {
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
  }, [canShowCompletion, showDone, wishQuery.isPending, setParams]);

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
          onAdvanceStatus={handleAdvanceStatus}
          statusActionLabel={statusActionLabel}
          statusActionDisabled={updateMutation.isPending}
          onAddRecord={() => openQuery("record")}
          onEditTitle={() => {
            updateMutation.reset();
            setShowTitleEditor(true);
          }}
          onEditDescription={() => {
            updateMutation.reset();
            setShowDescriptionEditor(true);
          }}
          onEditTargetDate={() => {
            updateMutation.reset();
            setShowTargetDateEditor(true);
          }}
          onEditBudget={() => {
            updateMutation.reset();
            setShowBudgetEditor(true);
          }}
          onEditLocation={() => {
            updateMutation.reset();
            setShowLocationEditor(true);
          }}
          onReplaceCover={(file) => void handleReplaceCover(file)}
          onClearCover={() => void handleClearCover()}
          coverPending={coverPending || updateMutation.isPending}
          coverError={coverError}
        />
        <div className="min-h-0 min-w-0 flex-1 overflow-y-auto lg:h-full">
          <WishDetailRecords
            records={recordsQuery.data?.records ?? []}
            isPending={recordsQuery.isPending}
            isError={recordsQuery.isError}
            onRetry={() => void recordsQuery.refetch()}
          />
        </div>

        {showDone && wish.status === "doing" ? (
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

        {showDescriptionEditor ? (
          <EditDescriptionDialog
            initialDescription={wish.description}
            pending={updateMutation.isPending}
            error={
              updateMutation.isError
                ? errorMessage(updateMutation.error, "描述保存失败")
                : undefined
            }
            onCancel={() => {
              updateMutation.reset();
              setShowDescriptionEditor(false);
            }}
            onSave={(description) => {
              updateMutation.mutate(
                { id: wishId, payload: { description } },
                {
                  onSuccess: () => setShowDescriptionEditor(false),
                },
              );
            }}
          />
        ) : null}

        {showTitleEditor ? (
          <EditTitleDialog
            initialTitle={wish.title}
            pending={updateMutation.isPending}
            error={
              updateMutation.isError
                ? errorMessage(updateMutation.error, "标题保存失败")
                : undefined
            }
            onCancel={() => {
              updateMutation.reset();
              setShowTitleEditor(false);
            }}
            onSave={(title) => {
              updateMutation.mutate(
                { id: wishId, payload: { title } },
                {
                  onSuccess: () => setShowTitleEditor(false),
                },
              );
            }}
          />
        ) : null}

        {showTargetDateEditor ? (
          <EditTargetDateDialog
            initialTargetDate={wish.targetDate}
            pending={updateMutation.isPending}
            error={
              updateMutation.isError
                ? errorMessage(updateMutation.error, "目标日期保存失败")
                : undefined
            }
            onCancel={() => {
              updateMutation.reset();
              setShowTargetDateEditor(false);
            }}
            onSave={(targetDate) => {
              updateMutation.mutate(
                { id: wishId, payload: { targetDate } },
                {
                  onSuccess: () => setShowTargetDateEditor(false),
                },
              );
            }}
          />
        ) : null}

        {showBudgetEditor ? (
          <EditBudgetDialog
            initialBudgetAmount={wish.budgetAmount}
            pending={updateMutation.isPending}
            error={
              updateMutation.isError
                ? errorMessage(updateMutation.error, "预算保存失败")
                : undefined
            }
            onCancel={() => {
              updateMutation.reset();
              setShowBudgetEditor(false);
            }}
            onSave={(budgetAmount) => {
              updateMutation.mutate(
                { id: wishId, payload: { budgetAmount } },
                {
                  onSuccess: () => setShowBudgetEditor(false),
                },
              );
            }}
          />
        ) : null}

        {showLocationEditor ? (
          <EditLocationDialog
            initialLocationName={wish.locationName}
            pending={updateMutation.isPending}
            error={
              updateMutation.isError
                ? errorMessage(updateMutation.error, "地点名称保存失败")
                : undefined
            }
            onCancel={() => {
              updateMutation.reset();
              setShowLocationEditor(false);
            }}
            onSave={(locationName) => {
              updateMutation.mutate(
                { id: wishId, payload: { locationName } },
                {
                  onSuccess: () => setShowLocationEditor(false),
                },
              );
            }}
          />
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
        <Button
          variant="ghost"
          disabled={!wish || deleteMutation.isPending}
          onClick={handleSoftDelete}
          className="text-danger hover:bg-danger/8"
        >
          <Trash2 className="size-4" aria-hidden="true" />
          {deleteMutation.isPending ? "移入中…" : "移入回收站"}
        </Button>
        {wish?.status === "todo" || wish?.status === "doing" ? (
          <Button
            variant={wish.status === "todo" ? "secondary" : "ghost"}
            disabled={updateMutation.isPending}
            onClick={handleAdvanceStatus}
          >
            {updateMutation.isPending && wish.status === "todo"
              ? "开始中…"
              : statusActionLabel}
          </Button>
        ) : null}
        <Button variant="primary" to="?record=1">
          记一笔
        </Button>
      </div>
    </header>
      {deleteMutation.isError ? (
        <p className="px-8 pt-3 text-sm text-danger" role="alert">
          {errorMessage(deleteMutation.error, "移入回收站失败，请重试")}
        </p>
      ) : null}
      {statusActionError ? (
        <p className="px-8 pt-3 text-sm text-danger" role="alert">
          {statusActionError}
        </p>
      ) : null}
      <PageBody scroll={false} className={`${bodyClassName} max-lg:overflow-y-auto`}>
        {body}
      </PageBody>
    </>
  );
}
