import { Check, ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState, type AnimationEvent, type ReactNode } from "react";
import type { AnniversaryRepeatType } from "@/app/days-api";
import { Button } from "@/components/ui/button";
import { cx } from "@/lib/cx";
import { DAY_REPEAT_OPTIONS } from "./types";

const WEEKDAYS = ["一", "二", "三", "四", "五", "六", "日"] as const;

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function SheetOverlay({
  children,
  onClose,
  labelledBy,
}: {
  children: (api: { requestClose: () => void; closing: boolean }) => ReactNode;
  onClose: () => void;
  labelledBy: string;
}) {
  const [closing, setClosing] = useState(false);

  function requestClose() {
    if (closing) {
      return;
    }
    if (prefersReducedMotion()) {
      onClose();
      return;
    }
    setClosing(true);
  }

  function handleScrimAnimationEnd(event: AnimationEvent<HTMLDivElement>) {
    if (event.target !== event.currentTarget) {
      return;
    }
    if (closing) {
      onClose();
    }
  }

  return (
    <div
      className={cx(
        "fixed inset-0 z-50 flex items-end justify-center bg-overlay px-6 pb-6 pt-6",
        "backdrop-blur-[16px]",
        closing
          ? "motion-safe:animate-[sheet-scrim-out_240ms_ease-in_forwards]"
          : "motion-safe:animate-[sheet-scrim-in_220ms_ease-out]",
        "motion-reduce:animate-none",
      )}
      onClick={requestClose}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          requestClose();
        }
      }}
      onAnimationEnd={handleScrimAnimationEnd}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        className={cx(
          "w-full max-w-[480px] origin-bottom rounded-[20px] bg-surface",
          "px-5 pb-5 pt-4 shadow-[0_-4px_24px_rgb(0_0_0_/_0.08)]",
          closing
            ? "motion-safe:animate-[sheet-fall_240ms_cubic-bezier(0.4,0,0.8,0.2)_forwards]"
            : "motion-safe:animate-[sheet-rise_320ms_cubic-bezier(0.2,0.8,0.2,1)]",
          "motion-reduce:animate-none",
        )}
        onClick={(event) => event.stopPropagation()}
        onKeyDown={(event) => event.stopPropagation()}
      >
        <div className="flex justify-center pb-1 pt-1">
          <div className="h-1.5 w-9 rounded-[3px] bg-border" />
        </div>
        {children({ requestClose, closing })}
      </div>
    </div>
  );
}

export function DatePickerSheet({
  value,
  onClose,
  onDone,
}: {
  value: string;
  onClose: () => void;
  onDone: (date: string) => void;
}) {
  const initial = parseDotDate(value) ?? new Date(2004, 9, 19);
  const [cursor, setCursor] = useState(
    () => new Date(initial.getFullYear(), initial.getMonth(), 1),
  );
  const [selected, setSelected] = useState(initial);

  const weeks = useMemo(() => buildMonthWeeks(cursor), [cursor]);

  return (
    <SheetOverlay onClose={onClose} labelledBy="day-date-title">
      {({ requestClose, closing }) => (
        <>
          <div className="flex items-center justify-between">
            <h2
              id="day-date-title"
              className="text-[17px] font-semibold tracking-[-0.2px] text-fg"
            >
              选择日期
            </h2>
            <Button
              variant="ghost"
              disabled={closing}
              onClick={() => {
                onDone(formatDotDate(selected));
                requestClose();
              }}
            >
              完成
            </Button>
          </div>
          <p className="mt-4 text-[13px] leading-[1.4] text-fg-secondary">
            选定后会在预览里显示倒数天数。可随时改。
          </p>

          <div className="mt-4 flex flex-col gap-3 rounded-surface bg-surface-soft px-2 py-3">
            <div className="flex items-center justify-between px-2">
              <button
                type="button"
                aria-label="上个月"
                disabled={closing}
                onClick={() =>
                  setCursor(
                    new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1),
                  )
                }
                className="inline-flex size-9 items-center justify-center rounded-control text-fg-secondary transition-transform duration-100 ease-out active:scale-[0.97] disabled:opacity-60"
              >
                <ChevronLeft className="size-[18px]" strokeWidth={2} />
              </button>
              <p className="text-[15px] font-semibold tracking-[-0.2px] text-fg">
                {cursor.getFullYear()}年 {cursor.getMonth() + 1}月
              </p>
              <button
                type="button"
                aria-label="下个月"
                disabled={closing}
                onClick={() =>
                  setCursor(
                    new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1),
                  )
                }
                className="inline-flex size-9 items-center justify-center rounded-control text-fg-secondary transition-transform duration-100 ease-out active:scale-[0.97] disabled:opacity-60"
              >
                <ChevronRight className="size-[18px]" strokeWidth={2} />
              </button>
            </div>

            <div className="grid grid-cols-7 px-1">
              {WEEKDAYS.map((day) => (
                <span
                  key={day}
                  className="py-1 text-center text-xs font-medium text-fg-muted"
                >
                  {day}
                </span>
              ))}
            </div>

            <div className="grid grid-cols-7 px-1">
              {weeks.flat().map((day, index) => {
                if (!day) {
                  return <span key={`empty-${index}`} className="size-10" />;
                }

                const isSelected = sameDay(day, selected);

                return (
                  <button
                    key={day.toISOString()}
                    type="button"
                    disabled={closing}
                    onClick={() => setSelected(day)}
                    className={cx(
                      "inline-flex size-10 items-center justify-center rounded-full text-sm",
                      "transition-[background-color,transform,color] duration-100 ease-out active:scale-[0.94]",
                      "disabled:opacity-60",
                      isSelected
                        ? "bg-accent font-semibold text-inverse"
                        : "font-medium text-fg hover:bg-surface",
                    )}
                  >
                    {day.getDate()}
                  </button>
                );
              })}
            </div>
          </div>

          <p className="mt-4 text-[13px] font-medium tracking-[-0.1px] text-fg-secondary">
            已选 {formatDotDate(selected)}
          </p>
        </>
      )}
    </SheetOverlay>
  );
}

export function RepeatPickerSheet({
  value,
  onClose,
  onDone,
}: {
  value: AnniversaryRepeatType;
  onClose: () => void;
  onDone: (repeat: AnniversaryRepeatType) => void;
}) {
  const [selected, setSelected] = useState(value);

  return (
    <SheetOverlay onClose={onClose} labelledBy="day-repeat-title">
      {({ requestClose, closing }) => (
        <>
          <div className="flex items-center justify-between">
            <h2
              id="day-repeat-title"
              className="text-[17px] font-semibold tracking-[-0.2px] text-fg"
            >
              重复
            </h2>
            <Button
              variant="ghost"
              disabled={closing}
              onClick={() => {
                onDone(selected);
                requestClose();
              }}
            >
              完成
            </Button>
          </div>
          <p className="mt-4 text-[13px] leading-[1.4] text-fg-secondary">
            每年重复适合生日与纪念日；不重复适合一次性节点。
          </p>

          <div className="mt-4 overflow-hidden rounded-surface bg-surface-soft">
            {DAY_REPEAT_OPTIONS.map((option, index) => {
              const active = option.value === selected;

              return (
                <div key={option.value}>
                  {index > 0 ? <div className="h-px bg-border" /> : null}
                  <button
                    type="button"
                    disabled={closing}
                    onClick={() => setSelected(option.value)}
                    className={cx(
                      "flex h-14 w-full items-center gap-3 px-4 text-left",
                      "transition-[background-color,transform] duration-100 ease-out active:scale-[0.99]",
                      "disabled:opacity-60",
                      active ? "bg-accent-soft" : "hover:bg-surface",
                    )}
                  >
                    <span className="min-w-0 flex-1">
                      <span
                        className={cx(
                          "block text-[15px] tracking-[-0.1px]",
                          active
                            ? "font-semibold text-accent"
                            : "font-medium text-fg",
                        )}
                      >
                        {option.label}
                      </span>
                      <span className="block text-xs text-fg-muted">
                        {option.description}
                      </span>
                    </span>
                    {active ? (
                      <Check
                        className="size-[18px] text-accent"
                        strokeWidth={2.5}
                      />
                    ) : null}
                  </button>
                </div>
              );
            })}
          </div>
        </>
      )}
    </SheetOverlay>
  );
}

function parseDotDate(value: string): Date | null {
  if (!value) {
    return null;
  }
  const [year, month, day] = value.split(".").map(Number);
  if (!year || !month || !day) {
    return null;
  }
  return new Date(year, month - 1, day);
}

function formatDotDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}.${month}.${day}`;
}

function sameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function buildMonthWeeks(cursor: Date): Array<Array<Date | null>> {
  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const first = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const mondayIndex = (first.getDay() + 6) % 7;

  const cells: Array<Date | null> = [];
  for (let i = 0; i < mondayIndex; i += 1) {
    cells.push(null);
  }
  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push(new Date(year, month, day));
  }
  while (cells.length % 7 !== 0) {
    cells.push(null);
  }

  const weeks: Array<Array<Date | null>> = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }
  return weeks;
}
