import type { DayFormValues } from "./types";
import { remindLabel } from "./types";

export function DayPreview({ values, remain }: { values: DayFormValues; remain: number | null }) {
  const titled = values.title.trim().length > 0;
  const dated = values.date.trim().length > 0;

  return (
    <aside className="flex w-full max-w-[360px] shrink-0 flex-col gap-3 self-start pt-2">
      <p className="text-[13px] font-medium tracking-[0.2px] text-fg-muted">
        预览
      </p>

      <div className="flex flex-col gap-2.5 rounded-surface bg-surface px-7 pb-8 pt-7 shadow-[0_8px_24px_rgb(28_20_24_/_0.04)]">
        <p className="text-[13px] text-fg-secondary">下一个纪念日</p>
        <h2
          className={
            titled
              ? "text-[28px] font-semibold tracking-[-0.6px] text-fg"
              : "text-[28px] font-semibold tracking-[-0.6px] text-fg-muted"
          }
        >
          {titled ? values.title.trim() : "未命名纪念日"}
        </h2>
        <div className="flex items-end gap-2">
          <p
            className={
              remain != null
                ? "text-[56px] font-semibold leading-[0.95] tracking-[-1.5px] text-accent"
                : "text-[56px] font-semibold leading-[0.95] tracking-[-1.5px] text-fg-muted"
            }
          >
            {remain != null ? remain : "—"}
          </p>
          <p
            className={
              remain != null
                ? "pb-1.5 text-base font-semibold text-accent"
                : "pb-1.5 text-base font-semibold text-fg-muted"
            }
          >
            天
          </p>
        </div>
        <p className="text-sm text-fg-muted">
          {dated ? values.date : "选择日期后显示倒数"}
        </p>
      </div>

      <div className="flex flex-col gap-2 px-1">
        <PreviewMeta
          label="类型"
          value={titled || dated ? values.category : "—"}
        />
        <PreviewMeta
          label="重复"
          value={titled || dated ? values.repeat : "—"}
        />
        <PreviewMeta
          label="提醒"
          value={titled || dated ? remindLabel(values) : "—"}
        />
      </div>
    </aside>
  );
}

function PreviewMeta({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[13px] text-fg-muted">{label}</span>
      <span className="text-[13px] font-medium text-fg-secondary">{value}</span>
    </div>
  );
}
