import { Calendar, ChevronRight, RefreshCw } from "lucide-react";
import { useState, type ReactNode } from "react";
import { DAY_CATEGORIES } from "@/app/mock";
import { Input } from "@/components/ui/input";
import { cx } from "@/lib/cx";
import { DatePickerSheet, RepeatPickerSheet } from "./pickers";
import type { DayFormValues } from "./types";

type Picker = "none" | "date" | "repeat";

export function DayFormFields({
  values,
  onChange,
  footer,
}: {
  values: DayFormValues;
  onChange: (next: DayFormValues) => void;
  footer?: ReactNode;
}) {
  const [picker, setPicker] = useState<Picker>("none");

  return (
    <>
      <div className="flex w-full max-w-[560px] flex-col gap-5">
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-fg-muted">名称</span>
          <Input
            value={values.title}
            placeholder="例如：她的生日"
            onChange={(event) =>
              onChange({ ...values, title: event.target.value })
            }
          />
        </label>

        <div className="flex flex-col gap-2">
          <p className="text-xs font-medium text-fg-muted">类型</p>
          <div className="flex flex-wrap gap-2">
            {DAY_CATEGORIES.map((category) => {
              const active = values.category === category;
              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => onChange({ ...values, category })}
                  className={cx(
                    "inline-flex h-9 items-center justify-center rounded-full px-3.5 text-[13px]",
                    "transition-[background-color,transform,color] duration-100 ease-out active:scale-[0.97]",
                    active
                      ? "bg-accent-soft font-semibold text-accent"
                      : "border border-border bg-surface font-medium text-fg",
                  )}
                >
                  {category}
                </button>
              );
            })}
          </div>
        </div>

        <div className="overflow-hidden rounded-control bg-surface">
          <FieldRow
            icon={Calendar}
            label={values.date || "选择日期"}
            muted={!values.date}
            active={picker === "date"}
            onClick={() => setPicker("date")}
          />
          <div className="h-px bg-border" />
          <FieldRow
            icon={RefreshCw}
            label={values.repeat}
            active={picker === "repeat"}
            onClick={() => setPicker("repeat")}
          />
        </div>

        <div className="overflow-hidden rounded-control bg-surface">
          <SwitchRow
            title="提前 7 天提醒"
            description="到日子前一周轻轻提醒双方"
            checked={values.remind7}
            onChange={(remind7) => onChange({ ...values, remind7 })}
          />
          {/* <div className="h-px bg-border" /> */}
          {/* <SwitchRow
            title="当天提醒"
            description="当天早上出现在首页"
            checked={values.remindDay}
            onChange={(remindDay) => onChange({ ...values, remindDay })}
          /> */}
        </div>

        {footer}
      </div>

      {picker === "date" ? (
        <DatePickerSheet
          value={values.date}
          onClose={() => setPicker("none")}
          onDone={(date) => onChange({ ...values, date })}
        />
      ) : null}

      {picker === "repeat" ? (
        <RepeatPickerSheet
          value={values.repeat}
          onClose={() => setPicker("none")}
          onDone={(repeat) => onChange({ ...values, repeat })}
        />
      ) : null}
    </>
  );
}

function FieldRow({
  icon: Icon,
  label,
  muted,
  active,
  onClick,
}: {
  icon: typeof Calendar;
  label: string;
  muted?: boolean;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cx(
        "relative flex h-11 w-full items-center gap-3 px-3.5 text-left",
        "transition-[background-color,transform] duration-100 ease-out",
        "active:scale-[0.99]",
        active ? "bg-accent-soft" : "hover:bg-surface-soft",
      )}
    >
      <Icon
        className={cx(
          "size-[18px]",
          active ? "text-accent" : "text-fg-secondary",
        )}
        strokeWidth={2}
      />
      <span
        className={cx(
          "min-w-0 flex-1 text-[15px] font-medium",
          muted ? "text-fg-muted" : active ? "text-accent" : "text-fg",
        )}
      >
        {label}
      </span>
      <ChevronRight className="size-4 text-fg-muted" strokeWidth={2} />
    </button>
  );
}

function SwitchRow({
  title,
  description,
  checked,
  onChange,
}: {
  title: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-center gap-4 px-4 py-2">
      <div className="min-w-0 flex-1">
        <p className="text-[15px] font-medium text-fg">{title}</p>
        <p className="text-xs text-fg-muted">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cx(
          "relative h-[26px] w-11 shrink-0 rounded-full p-0.5 transition-colors duration-150 ease-out",
          checked ? "bg-accent" : "bg-track",
        )}
      >
        <span
          className={cx(
            "block size-[22px] rounded-full bg-inverse shadow-sm transition-transform duration-150 ease-out",
            checked ? "translate-x-[18px]" : "translate-x-0",
          )}
        />
      </button>
    </div>
  );
}
