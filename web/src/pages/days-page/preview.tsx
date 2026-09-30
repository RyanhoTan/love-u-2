import {
  remindLabel,
  dotDateToIso,
  repeatLabel,
  typeLabel,
  type DayFormValues,
} from "./types";

export function DayPreview({
  values,
  remain,
  todayDate,
  timeZone,
}: {
  values: Partial<DayFormValues> | undefined;
  remain: number | null;
  todayDate: string | null;
  timeZone: string | null;
}) {
  const title = values?.title?.trim() ?? "";
  const date = values?.date?.trim() ?? "";
  const titled = title.length > 0;
  const dated = date.length > 0;
  const ready = titled || dated;
  const past = remain !== null && todayDate && values?.repeatType === "none" && dotDateToIso(date) < todayDate;

  return (
    <aside className="flex w-full max-w-[360px] shrink-0 flex-col gap-3 self-start pt-2">
      <p className="text-[13px] font-medium tracking-[0.2px] text-fg-muted">
        预览
      </p>

      <div className="flex flex-col gap-2.5 rounded-surface bg-surface px-7 pb-8 pt-7 shadow-[0_8px_24px_rgb(28_20_24_/_0.04)]">
        <p className="text-[13px] text-fg-secondary">{past ? "已过去的纪念日" : "下一次纪念日"}</p>
        <h2
          className={
            titled
              ? "text-[28px] font-semibold tracking-[-0.6px] text-fg"
              : "text-[28px] font-semibold tracking-[-0.6px] text-fg-muted"
          }
        >
          {titled ? title : "未命名纪念日"}
        </h2>
        <div className="flex items-end gap-2">
          <p
            className={
              remain != null
                ? "text-[56px] font-semibold leading-[0.95] tracking-[-1.5px] text-accent"
                : "text-[56px] font-semibold leading-[0.95] tracking-[-1.5px] text-fg-muted"
            }
          >
            {past ? "已过去" : remain != null ? remain : "—"}
          </p>
          <p
            className={
              remain != null
                ? "pb-1.5 text-base font-semibold text-accent"
                : "pb-1.5 text-base font-semibold text-fg-muted"
            }
          >
            {past ? "" : "天"}
          </p>
        </div>
        <p className="text-sm text-fg-muted">
          {dated ? date : "选择日期后显示倒数"}
        </p>
      </div>

      <div className="flex flex-col gap-2 px-1">
        <PreviewMeta
          label="共同时区"
          value={timeZone ?? "等待共同日历"}
        />
        <PreviewMeta
          label="参考日期"
          value={todayDate ?? "—"}
        />
        <PreviewMeta
          label="类型"
          value={ready && values?.type ? typeLabel(values.type) : "—"}
        />
        <PreviewMeta
          label="重复"
          value={
            ready && values?.repeatType
              ? repeatLabel(values.repeatType)
              : "—"
          }
        />
        <PreviewMeta
          label="提醒计划（未启用）"
          value={ready && values ? remindLabel(values) : "—"}
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
