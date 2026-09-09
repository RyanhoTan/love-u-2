import { useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { getDayById } from "@/app/mock";
import { PageBody } from "@/components/layout/page-body";
import { DeleteDayDialog } from "./delete-dialog";
import { DayFormFields } from "./form-fields";
import { DayPreview } from "./preview";
import { dayToForm, emptyDayForm, type DayFormValues } from "./types";

export function DayNewPage() {
  const [values, setValues] = useState<DayFormValues>(emptyDayForm);

  return (
    <PageBody className="justify-between gap-10 lg:flex-row">
      <DayFormFields values={values} onChange={setValues} />
      <DayPreview values={values} remain={null} />
    </PageBody>
  );
}

export function DayEditPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const day = getDayById(id);
  const [values, setValues] = useState<DayFormValues | null>(
    day ? dayToForm(day) : null,
  );
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (!day || !values) {
    return <Navigate to="/days" replace />;
  }

  return (
    <>
      <PageBody className="justify-between gap-10 lg:flex-row">
        <DayFormFields
          values={values}
          onChange={setValues}
          footer={
            <div className="flex flex-col gap-2 pt-5">
              <p className="text-[13px] text-fg-muted">
                删除后无法恢复，相关提醒也会一并取消。
              </p>
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="inline-flex h-9 w-full items-center justify-center rounded-control border border-border bg-surface px-4 text-[13px] font-semibold text-danger transition-[background-color,transform] duration-100 ease-out hover:bg-surface-soft active:scale-[0.97]"
              >
                删除纪念日
              </button>
            </div>
          }
        />
        <DayPreview values={values} remain={values.date ? day.remain : null} />
      </PageBody>

      {confirmDelete ? (
        <DeleteDayDialog
          title={values.title.trim() || day.title}
          onCancel={() => setConfirmDelete(false)}
          onConfirm={() => {
            setConfirmDelete(false);
            navigate("/days");
          }}
        />
      ) : null}
    </>
  );
}
