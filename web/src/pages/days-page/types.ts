import type {
  AnniversaryItem,
  AnniversaryPayload,
  AnniversaryRepeatType,
  AnniversaryType,
} from "@/app/days-api";

export const DAY_TYPE_OPTIONS: { value: AnniversaryType; label: string }[] = [
  { value: "birthday", label: "生日" },
  { value: "love", label: "恋爱" },
  { value: "holiday", label: "节日" },
  { value: "custom", label: "自定义" },
];

export const DAY_REPEAT_OPTIONS: {
  value: AnniversaryRepeatType;
  label: string;
  description: string;
}[] = [
  { value: "none", label: "不重复", description: "只提醒这一次" },
  { value: "yearly", label: "每年", description: "每年同一天倒数" },
];

export type DayFormValues = {
  title: string;
  type: AnniversaryType;
  date: string;
  repeatType: AnniversaryRepeatType;
  remind7: boolean;
  remindDay: boolean;
};

export function emptyDayForm(): DayFormValues {
  return {
    title: "",
    type: "birthday",
    date: "",
    repeatType: "yearly",
    remind7: true,
    remindDay: true,
  };
}

export function anniversaryToForm(item: AnniversaryItem): DayFormValues {
  return {
    title: item.title,
    type: item.type,
    date: isoToDotDate(item.originalDate),
    repeatType: item.repeatType,
    remind7: item.reminderDaysBefore >= 7,
    remindDay: item.reminderDaysBefore === 0 || item.reminderDaysBefore >= 7,
  };
}

export function formToPayload(values: DayFormValues): AnniversaryPayload {
  return {
    title: values.title.trim(),
    type: values.type,
    originalDate: dotDateToIso(values.date),
    repeatType: values.repeatType,
    reminderDaysBefore: values.remind7 ? 7 : 0,
  };
}

export function typeLabel(type: AnniversaryType): string {
  return DAY_TYPE_OPTIONS.find((option) => option.value === type)?.label ?? type;
}

export function repeatLabel(repeatType: AnniversaryRepeatType): string {
  return (
    DAY_REPEAT_OPTIONS.find((option) => option.value === repeatType)?.label ??
    repeatType
  );
}

export function remindLabel(values: DayFormValues): string {
  const parts: string[] = [];
  if (values.remind7) {
    parts.push("提前 7 天");
  }
  if (values.remindDay) {
    parts.push("当天");
  }
  return parts.length > 0 ? parts.join(" · ") : "—";
}

export function isoToDotDate(iso: string): string {
  if (!iso) {
    return "";
  }
  return iso.replaceAll("-", ".");
}

export function dotDateToIso(dot: string): string {
  if (!dot) {
    return "";
  }
  return dot.replaceAll(".", "-");
}

export function previewRemainingDays(values: DayFormValues): number | null {
  if (!values.date) {
    return null;
  }

  const originalDate = dotDateToIso(values.date);
  const next = getNextOccurrenceDate(originalDate, values.repeatType);
  return Math.max(0, differenceInDays(todayText(), next));
}

function todayText() {
  const now = new Date();
  return formatDateParts(now.getFullYear(), now.getMonth() + 1, now.getDate());
}

function formatDateParts(year: number, month: number, day: number) {
  return [
    String(year).padStart(4, "0"),
    String(month).padStart(2, "0"),
    String(day).padStart(2, "0"),
  ].join("-");
}

function parseDateOnly(value: string) {
  const [yearText, monthText, dayText] = value.split("-");
  return {
    year: Number(yearText),
    month: Number(monthText),
    day: Number(dayText),
  };
}

function isLeapYear(year: number) {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

function normalizeAnnualOccurrenceDate(dateText: string, targetYear: number) {
  const { month, day } = parseDateOnly(dateText);
  if (month === 2 && day === 29 && !isLeapYear(targetYear)) {
    return formatDateParts(targetYear, 2, 28);
  }
  return formatDateParts(targetYear, month, day);
}

function getNextOccurrenceDate(
  dateText: string,
  repeatType: AnniversaryRepeatType,
) {
  if (repeatType === "none") {
    return dateText;
  }

  const today = todayText();
  const { year } = parseDateOnly(today);
  const currentYearOccurrence = normalizeAnnualOccurrenceDate(dateText, year);
  if (currentYearOccurrence >= today) {
    return currentYearOccurrence;
  }
  return normalizeAnnualOccurrenceDate(dateText, year + 1);
}

function differenceInDays(startDateText: string, endDateText: string) {
  const start = parseDateOnly(startDateText);
  const end = parseDateOnly(endDateText);
  const startDate = new Date(start.year, start.month - 1, start.day);
  const endDate = new Date(end.year, end.month - 1, end.day);
  return Math.round(
    (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
  );
}
