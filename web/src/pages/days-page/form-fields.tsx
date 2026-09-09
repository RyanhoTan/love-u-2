import { Calendar, ChevronRight, RefreshCw } from "lucide-react";
import { useState, type ReactNode } from "react";
import { Controller, useFormContext, useWatch } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { cx } from "@/lib/cx";
import { DatePickerSheet, RepeatPickerSheet } from "./pickers";
import {
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

        <div className="overflow-hidden rounded-control bg-surface">
          <Controller
            name="remind7"
            control={control}
            render={({ field }) => (
              <SwitchRow
                title="提前 7 天提醒"
                description="到日子前一周轻轻提醒双方"
                checked={field.value}
                disabled={disabled}
                onChange={field.onChange}
              />
            )}
          />
          <div className="h-px bg-border" />
          <Controller
            name="remindDay"
            control={control}
            render={({ field }) => (
              <SwitchRow
                title="当天提醒"
                description="当天早上出现在首页"
                checked={field.value}
                disabled={disabled}
                onChange={field.onChange}
              />
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

function SwitchRow({
  title,
  description,
  checked,
  disabled,
  onChange,
}: {
  title: string;
  description: string;
  checked: boolean;
  disabled?: boolean;
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
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cx(
          "relative h-[26px] w-11 shrink-0 rounded-full p-0.5 transition-colors duration-150 ease-out",
          "disabled:opacity-60",
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
