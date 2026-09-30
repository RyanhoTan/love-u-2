import { Calendar, ChevronRight, RefreshCw } from "lucide-react";
import { useState, type ReactNode } from "react";
import { Controller, useFormContext, useWatch } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { cx } from "@/lib/cx";
import { DatePickerSheet, RepeatPickerSheet } from "./pickers";
import {
  DAY_REMINDER_OPTIONS,
  DAY_TYPE_OPTIONS,
  repeatLabel,
  type DayFormValues,
} from "./types";

type Picker = "none" | "date" | "repeat";

export function DayFormFields({
  footer,
  disabled = false,
}: {
  footer?: ReactNode;
  disabled?: boolean;
}) {
  const {
    control,
    register,
    setValue,
    formState: { errors },
  } = useFormContext<DayFormValues>();
  const values = useWatch({ control });
  const [picker, setPicker] = useState<Picker>("none");
  const reminderOptions = [...DAY_REMINDER_OPTIONS];
  const existingReminderDays = values.reminderDaysBefore;
  if (
    typeof existingReminderDays === "number" &&
    Number.isInteger(existingReminderDays) &&
    existingReminderDays >= 0 &&
    existingReminderDays <= 30 &&
    !reminderOptions.some((option) => option.value === existingReminderDays)
  ) {
    reminderOptions.push({
      value: existingReminderDays,
      label: `提前 ${existingReminderDays} 天（当前）`,
      description: "保留当前已保存的计划时间",
    });
  }

  return (
    <>
      <div className="flex w-full max-w-[560px] flex-col gap-5">
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-fg-muted">名称</span>
          <Input
            placeholder="例如：她的生日"
            disabled={disabled}
            aria-invalid={Boolean(errors.title)}
            {...register("title")}
          />
          {errors.title ? (
            <FieldError message={errors.title.message} />
          ) : null}
        </label>

        <div className="flex flex-col gap-2">
          <p className="text-xs font-medium text-fg-muted">类型</p>
          <Controller
            name="type"
            control={control}
            render={({ field }) => (
              <div className="flex flex-wrap gap-2">
                {DAY_TYPE_OPTIONS.map((option) => {
                  const active = field.value === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      disabled={disabled}
                      onClick={() => field.onChange(option.value)}
                      className={cx(
                        "inline-flex h-9 items-center justify-center rounded-full px-3.5 text-[13px]",
                        "transition-[background-color,transform,color] duration-100 ease-out active:scale-[0.97]",
                        "disabled:opacity-60",
                        active
                          ? "bg-accent-soft font-semibold text-accent"
                          : "border border-border bg-surface font-medium text-fg",
                      )}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
            )}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="overflow-hidden rounded-control bg-surface">
            <FieldRow
              icon={Calendar}
              label={values.date || "选择日期"}
              muted={!values.date}
              active={picker === "date"}
              disabled={disabled}
              onClick={() => setPicker("date")}
            />
            <div className="h-px bg-border" />
            <FieldRow
              icon={RefreshCw}
              label={repeatLabel(values.repeatType ?? "yearly")}
              active={picker === "repeat"}
              disabled={disabled}
              onClick={() => setPicker("repeat")}
            />
          </div>
          {errors.date ? <FieldError message={errors.date.message} /> : null}
        </div>

        <p className="text-xs leading-[1.5] text-fg-muted">
          每个纪念日只保存一个计划时间；通知功能尚未上线，当前不会发送通知。
        </p>
        <div className="overflow-hidden rounded-control bg-surface">
          <Controller
            name="reminderDaysBefore"
            control={control}
            render={({ field }) => (
              <div role="radiogroup" aria-label="提醒时间计划">
                {reminderOptions.map((option, index) => (
                  <div key={option.value}>
                    <label
                      className={cx(
                        "flex cursor-pointer items-center gap-3 px-4 py-3",
                        disabled && "cursor-not-allowed opacity-60",
                      )}
                    >
                      <input
                        type="radio"
                        name={field.name}
                        value={option.value}
                        checked={field.value === option.value}
                        disabled={disabled}
                        onChange={() => field.onChange(option.value)}
                        className="size-4 shrink-0 accent-accent"
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block text-[15px] font-medium text-fg">
                          {option.label}
                        </span>
                        <span className="block text-xs text-fg-muted">
                          {option.description}
                        </span>
                      </span>
                    </label>
                    {index < reminderOptions.length - 1 ? (
                      <div className="h-px bg-border" />
                    ) : null}
                  </div>
                ))}
              </div>
            )}
          />
        </div>

        {footer}
      </div>

      {picker === "date" ? (
        <DatePickerSheet
          value={values.date ?? ""}
          onClose={() => setPicker("none")}
          onDone={(date) => {
            setValue("date", date, { shouldDirty: true, shouldValidate: true });
          }}
        />
      ) : null}

      {picker === "repeat" ? (
        <RepeatPickerSheet
          value={values.repeatType ?? "yearly"}
          onClose={() => setPicker("none")}
          onDone={(repeatType) => {
            setValue("repeatType", repeatType, {
              shouldDirty: true,
              shouldValidate: true,
            });
          }}
        />
      ) : null}
    </>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return (
    <p className="text-[13px] font-medium text-danger" role="alert">
      {message}
    </p>
  );
}

function FieldRow({
  icon: Icon,
  label,
  muted,
  active,
  disabled,
  onClick,
}: {
  icon: typeof Calendar;
  label: string;
  muted?: boolean;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cx(
        "relative flex h-11 w-full items-center gap-3 px-3.5 text-left",
        "transition-[background-color,transform] duration-100 ease-out",
        "active:scale-[0.99] disabled:opacity-60",
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
