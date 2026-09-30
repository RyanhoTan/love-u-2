// Keep these pure rules aligned with server/src/couple/calendar.ts via contract tests.
export function isSupportedTimeZone(value: string) {
  if (value !== "UTC" && !/^[A-Za-z_]+(?:\/[A-Za-z0-9_+-]+)+$/.test(value)) {
    return false;
  }
  try {
    new Intl.DateTimeFormat("en", { timeZone: value }).format(0);
    return true;
  } catch {
    return false;
  }
}

export function isCalendarDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || Number(value.slice(0, 4)) < 1000) {
    return false;
  }
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

export function getCalendarDateText(timeZone: string, now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    calendar: "gregory",
    numberingSystem: "latn",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const values = new Map(parts.map((part) => [part.type, part.value]));
  return `${values.get("year")}-${values.get("month")}-${values.get("day")}`;
}

export function getAnniversaryCalendar(
  original: string,
  repeat: "none" | "yearly",
  today: string,
) {
  let nextOccurrenceDate = original;
  if (repeat === "yearly" && original <= today) {
    const occurrence = (year: number) => {
      const leap = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
      const monthDay = original.slice(5) === "02-29" && !leap
        ? "02-28"
        : original.slice(5);
      return `${String(year).padStart(4, "0")}-${monthDay}`;
    };
    const year = Number(today.slice(0, 4));
    nextOccurrenceDate = occurrence(year);
    if (nextOccurrenceDate < today) nextOccurrenceDate = occurrence(year + 1);
  }
  return {
    nextOccurrenceDate,
    remainingDays: Math.max(
      0,
      Math.round(
        (Date.parse(`${nextOccurrenceDate}T00:00:00Z`) - Date.parse(`${today}T00:00:00Z`)) /
          86_400_000,
      ),
    ),
  };
}

export function previewRemainingDays(
  values: { date?: string; repeatType?: "none" | "yearly" } | undefined,
  today: string | null | undefined,
): number | null {
  if (!values?.date || !values.repeatType || !today || !isCalendarDate(today)) {
    return null;
  }
  const originalDate = values.date.replaceAll(".", "-");
  if (!isCalendarDate(originalDate)) return null;
  return getAnniversaryCalendar(originalDate, values.repeatType, today).remainingDays;
}

export function sharedCalendarsMatch(
  left: { timeZone?: string | null; todayDate?: string | null } | undefined,
  right: { timeZone?: string | null; todayDate?: string | null },
) {
  return Boolean(
    left?.timeZone && left.todayDate && isCalendarDate(left.todayDate) &&
    left.timeZone === right.timeZone && left.todayDate === right.todayDate,
  );
}

export function getUpcomingAnniversaries<T extends { id: number; nextOccurrenceDate: string }>(
  items: T[],
  today: string | null | undefined,
): T[] {
  if (!today || !isCalendarDate(today)) return [];
  return items
    .filter((item) => item.nextOccurrenceDate >= today)
    .sort((a, b) => a.nextOccurrenceDate.localeCompare(b.nextOccurrenceDate) || a.id - b.id);
}

export function millisecondsUntilNextCalendarDay(timeZone: string, now = new Date()) {
  // Search for the next calendar boundary, not a fixed 24h delay: DST days can be 23/25h.
  const start = now.getTime();
  const today = getCalendarDateText(timeZone, now);
  let low = start;
  let high = start + 48 * 60 * 60 * 1000;
  while (high - low > 1) {
    const middle = Math.floor((low + high) / 2);
    if (getCalendarDateText(timeZone, new Date(middle)) === today) low = middle;
    else high = middle;
  }
  return high - start + 25;
}

export function startCalendarRefresh(options: {
  timeZone: string;
  referenceDate: string | null | undefined;
  now: () => Date;
  schedule: (callback: () => void, delay: number) => number;
  cancel: (timer: number) => void;
  isVisible: () => boolean;
  refresh: () => void;
}) {
  let active = true;
  let timer: number | null = null;
  const refresh = () => {
    if (active && options.isVisible()) options.refresh();
  };
  const schedule = () => {
    if (!active) return;
    timer = options.schedule(() => {
      timer = null;
      refresh();
      schedule();
    }, millisecondsUntilNextCalendarDay(options.timeZone, options.now()));
  };
  const resume = () => {
    if (!active) return;
    if (timer !== null) options.cancel(timer);
    refresh();
    schedule();
  };
  if (
    options.referenceDate &&
    options.referenceDate !== getCalendarDateText(options.timeZone, options.now())
  ) {
    refresh();
  }
  schedule();
  return {
    resume,
    dispose: () => {
      active = false;
      if (timer !== null) options.cancel(timer);
    },
  };
}
