import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import type { AnniversaryItem } from "@/app/days-api";
import {
  errorMessage,
  useAnniversariesQuery,
  useCreateAnniversaryMutation,
  useDeleteAnniversaryMutation,
  useUpdateAnniversaryMutation,
} from "@/app/days-queries";
import { PageBody } from "@/components/layout/page-body";
import { Button } from "@/components/ui/button";
import { DeleteDayDialog } from "./delete-dialog";
import { DayFormFields } from "./form-fields";
import { DayPreview } from "./preview";
import {
  anniversaryToForm,
  dayFormSchema,
  emptyDayForm,
  formToPayload,
  previewRemainingDays,
  type DayFormValues,
} from "./types";

const FORM_ID = "day-form";

export function DayNewPage() {
  const navigate = useNavigate();
  const createMutation = useCreateAnniversaryMutation();
  const form = useForm<DayFormValues>({
    resolver: zodResolver(dayFormSchema),
    defaultValues: emptyDayForm(),
    mode: "onSubmit",
  });
  const values = useWatch({ control: form.control });

  return (
    <PageBody>
      <FormProvider {...form}>
        <form
          id={FORM_ID}
          className="flex min-h-0 flex-1 flex-col justify-between gap-10 lg:flex-row"
          onSubmit={form.handleSubmit((data) => {
            createMutation.mutate(formToPayload(data), {
              onSuccess: () => navigate("/days"),
            });
          })}
        >
          <div className="flex w-full max-w-[560px] flex-col gap-4">
            <DayFormFields disabled={createMutation.isPending} />
            {createMutation.isError ? (
              <ErrorBlock
                message={errorMessage(createMutation.error)}
                unbound={errorMessage(createMutation.error).includes(
                  "bound couple",
                )}
              />
            ) : null}
          </div>
          <DayPreview
            values={values}
            remain={previewRemainingDays(values)}
          />
        </form>
      </FormProvider>
    </PageBody>
  );
}

export function DayEditPage() {
  const { id = "" } = useParams();
  const anniversaryId = Number(id);
  const query = useAnniversariesQuery();

  if (!Number.isInteger(anniversaryId) || anniversaryId <= 0) {
    return <Navigate to="/days" replace />;
  }

  if (query.isPending) {
    return (
      <PageBody className="items-center justify-center">
        <p className="text-sm text-fg-muted">加载中…</p>
      </PageBody>
    );
  }

  if (query.isError) {
    return (
      <PageBody className="items-center justify-center gap-4">
        <p className="text-sm font-medium text-danger" role="alert">
          {errorMessage(query.error)}
        </p>
        <Button variant="secondary" onClick={() => void query.refetch()}>
          重试
        </Button>
        <Button variant="ghost" to="/days">
          返回
        </Button>
      </PageBody>
    );
  }

  const item =
    query.data.anniversaries.find((day) => day.id === anniversaryId) ?? null;

  if (!item) {
    return <Navigate to="/days" replace />;
  }

  return <DayEditForm key={item.id} item={item} />;
}

function DayEditForm({ item }: { item: AnniversaryItem }) {
  const navigate = useNavigate();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const updateMutation = useUpdateAnniversaryMutation();
  const deleteMutation = useDeleteAnniversaryMutation();
  const form = useForm<DayFormValues>({
    resolver: zodResolver(dayFormSchema),
    defaultValues: anniversaryToForm(item),
    mode: "onSubmit",
  });
  const values = useWatch({ control: form.control });
  const pending = updateMutation.isPending || deleteMutation.isPending;

  return (
    <>
      <PageBody>
        <FormProvider {...form}>
          <form
            id={FORM_ID}
            className="flex min-h-0 flex-1 flex-col justify-between gap-10 lg:flex-row"
            onSubmit={form.handleSubmit((data) => {
              updateMutation.mutate(
                { id: item.id, payload: formToPayload(data) },
                { onSuccess: () => navigate("/days") },
              );
            })}
          >
            <div className="flex w-full max-w-[560px] flex-col gap-4">
              <DayFormFields
                disabled={pending}
                footer={
                  <div className="flex flex-col gap-2 pt-5">
                    <p className="text-[13px] text-fg-muted">
                      删除后无法恢复，相关提醒也会一并取消。
                    </p>
                    <button
                      type="button"
                      disabled={pending}
                      onClick={() => {
                        deleteMutation.reset();
                        setConfirmDelete(true);
                      }}
                      className="inline-flex h-9 w-full items-center justify-center rounded-control border border-border bg-surface px-4 text-[13px] font-semibold text-danger transition-[background-color,transform] duration-100 ease-out hover:bg-surface-soft active:scale-[0.97] disabled:opacity-60"
                    >
                      删除纪念日
                    </button>
                  </div>
                }
              />
              {updateMutation.isError ? (
                <ErrorBlock message={errorMessage(updateMutation.error)} />
              ) : null}
            </div>
            <DayPreview
              values={values}
              remain={previewRemainingDays(values)}
            />
          </form>
        </FormProvider>
      </PageBody>

      {confirmDelete ? (
        <DeleteDayDialog
          title={values.title?.trim() || item.title}
          pending={deleteMutation.isPending}
          error={
            deleteMutation.isError
              ? errorMessage(deleteMutation.error)
              : undefined
          }
          onCancel={() => {
            if (!deleteMutation.isPending) {
              setConfirmDelete(false);
            }
          }}
          onConfirm={() => {
            deleteMutation.mutate(item.id, {
              onSuccess: () => {
                setConfirmDelete(false);
                navigate("/days");
              },
            });
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
