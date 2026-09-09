import { useEffect, useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import {
  createAnniversary,
  deleteAnniversary,
  getAnniversaries,
  updateAnniversary,
  type AnniversaryItem,
} from "@/app/days-api";
import { PageBody } from "@/components/layout/page-body";
import { Button } from "@/components/ui/button";
import { DeleteDayDialog } from "./delete-dialog";
import { DayFormFields } from "./form-fields";
import { DayPreview } from "./preview";
import {
  anniversaryToForm,
  emptyDayForm,
  formToPayload,
  previewRemainingDays,
  type DayFormValues,
} from "./types";

const FORM_ID = "day-form";

export function DayNewPage() {
  const navigate = useNavigate();
  const [values, setValues] = useState<DayFormValues>(emptyDayForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  return (
    <PageBody>
      <form
        id={FORM_ID}
        className="flex min-h-0 flex-1 flex-col justify-between gap-10 lg:flex-row"
        onSubmit={(event) => {
          event.preventDefault();
          void (async () => {
            if (!values.title.trim()) {
              setError("title is required");
              return;
            }
            if (!values.date) {
              setError("originalDate must be in YYYY-MM-DD format");
              return;
            }

            try {
              setSubmitting(true);
              setError("");
              await createAnniversary(formToPayload(values));
              navigate("/days");
            } catch (caught) {
              setError(
                caught instanceof Error ? caught.message : "request failed",
              );
              setSubmitting(false);
            }
          })();
        }}
      >
        <div className="flex w-full max-w-[560px] flex-col gap-4">
          <DayFormFields
            values={values}
            onChange={setValues}
            disabled={submitting}
          />
          {error ? (
            <ErrorBlock
              message={error}
              unbound={error.includes("bound couple")}
            />
          ) : null}
        </div>
        <DayPreview values={values} remain={previewRemainingDays(values)} />
      </form>
    </PageBody>
  );
}

export function DayEditPage() {
  const { id = "" } = useParams();
  const anniversaryId = Number(id);
  const navigate = useNavigate();
  const [item, setItem] = useState<AnniversaryItem | null>(null);
  const [values, setValues] = useState<DayFormValues | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    let active = true;

    void (async () => {
      if (!Number.isInteger(anniversaryId) || anniversaryId <= 0) {
        if (active) {
          setLoading(false);
          setLoadError("anniversary not found");
        }
        return;
      }

      try {
        setLoading(true);
        setLoadError("");
        const response = await getAnniversaries();
        if (!active) {
          return;
        }
        const found =
          response.anniversaries.find((day) => day.id === anniversaryId) ?? null;
        if (!found) {
          setLoadError("anniversary not found");
          setItem(null);
          setValues(null);
          return;
        }
        setItem(found);
        setValues(anniversaryToForm(found));
      } catch (caught) {
        if (!active) {
          return;
        }
        setLoadError(
          caught instanceof Error ? caught.message : "request failed",
        );
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    })();

    return () => {
      active = false;
    };
  }, [anniversaryId]);

  if (loading) {
    return (
      <PageBody className="items-center justify-center">
        <p className="text-sm text-fg-muted">加载中…</p>
      </PageBody>
    );
  }

  if (loadError === "anniversary not found") {
    return <Navigate to="/days" replace />;
  }

  if (loadError || !item || !values) {
    return (
      <PageBody className="items-center justify-center gap-4">
        <p className="text-sm font-medium text-danger" role="alert">
          {loadError || "request failed"}
        </p>
        <Button variant="secondary" to="/days">
          返回
        </Button>
      </PageBody>
    );
  }

  return (
    <>
      <PageBody>
        <form
          id={FORM_ID}
          className="flex min-h-0 flex-1 flex-col justify-between gap-10 lg:flex-row"
          onSubmit={(event) => {
            event.preventDefault();
            void (async () => {
              if (!values.title.trim()) {
                setError("title is required");
                return;
              }
              if (!values.date) {
                setError("originalDate must be in YYYY-MM-DD format");
                return;
              }

              try {
                setSubmitting(true);
                setError("");
                await updateAnniversary(item.id, formToPayload(values));
                navigate("/days");
              } catch (caught) {
                setError(
                  caught instanceof Error ? caught.message : "request failed",
                );
                setSubmitting(false);
              }
            })();
          }}
        >
          <div className="flex w-full max-w-[560px] flex-col gap-4">
            <DayFormFields
              values={values}
              onChange={setValues}
              disabled={submitting}
              footer={
                <div className="flex flex-col gap-2 pt-5">
                  <p className="text-[13px] text-fg-muted">
                    删除后无法恢复，相关提醒也会一并取消。
                  </p>
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={() => setConfirmDelete(true)}
                    className="inline-flex h-9 w-full items-center justify-center rounded-control border border-border bg-surface px-4 text-[13px] font-semibold text-danger transition-[background-color,transform] duration-100 ease-out hover:bg-surface-soft active:scale-[0.97] disabled:opacity-60"
                  >
                    删除纪念日
                  </button>
                </div>
              }
            />
            {error ? <ErrorBlock message={error} /> : null}
          </div>
          <DayPreview values={values} remain={previewRemainingDays(values)} />
        </form>
      </PageBody>

      {confirmDelete ? (
        <DeleteDayDialog
          title={values.title.trim() || item.title}
          onCancel={() => setConfirmDelete(false)}
          onConfirm={async () => {
            await deleteAnniversary(item.id);
            setConfirmDelete(false);
            navigate("/days");
          }}
        />
      ) : null}
    </>
  );
}

function ErrorBlock({
  message,
  unbound = false,
}: {
  message: string;
  unbound?: boolean;
}) {
  return (
    <div className="flex flex-col gap-2" role="alert">
      <p className="text-[13px] font-medium text-danger">{message}</p>
      {unbound ? (
        <Link
          to="/me/couple"
          className="text-[13px] font-medium text-accent hover:underline"
        >
          去绑定情侣空间
        </Link>
      ) : null}
    </div>
  );
}

export { FORM_ID as DAY_FORM_ID };
