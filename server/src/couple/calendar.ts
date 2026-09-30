export const DEFAULT_COUPLE_TIME_ZONE = "Asia/Shanghai";

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

function formatDateParts(year: number, month: number, day: number) {
  return `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
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

export function differenceInCalendarDays(start: string, end: string) {
  return Math.round(
    (Date.parse(`${end}T00:00:00.000Z`) - Date.parse(`${start}T00:00:00.000Z`)) /
      86_400_000,
  );
}

export function getDaysInLove(start: string | null, today: string) {
  if (!start) return null;
  return Math.max(0, differenceInCalendarDays(start, today) + 1);
}

function annualOccurrence(original: string, year: number) {
  const [, month, day] = original.split("-").map(Number);
  const isLeapYear = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  return formatDateParts(year, month, month === 2 && day === 29 && !isLeapYear ? 28 : day);
}

export function getAnniversaryCalendar(
  original: string,
  repeat: "none" | "yearly",
  today: string,
) {
  let nextOccurrenceDate = original;
  if (repeat === "yearly" && original <= today) {
    const year = Number(today.slice(0, 4));
    nextOccurrenceDate = annualOccurrence(original, year);
    if (nextOccurrenceDate < today) {
      nextOccurrenceDate = annualOccurrence(original, year + 1);
    }
  }
  return {
    nextOccurrenceDate,
    remainingDays: Math.max(0, differenceInCalendarDays(today, nextOccurrenceDate)),
  };
}
