import { isCalendarDate } from "./couple-calendar";

const WEEKDAYS = [
  "星期日",
  "星期一",
  "星期二",
  "星期三",
  "星期四",
  "星期五",
  "星期六",
];

export function formatSharedTodayDate(dateText: string | null | undefined) {
  if (!dateText || !isCalendarDate(dateText)) return "共同日期待更新";
  const date = new Date(`${dateText}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return "共同日期待更新";
  return `${date.getUTCMonth() + 1}月${date.getUTCDate()}日 ${WEEKDAYS[date.getUTCDay()]}`;
}

export function formatTodayDate(date = new Date()) {
  return `${date.getMonth() + 1}月${date.getDate()}日 ${WEEKDAYS[date.getDay()]}`;
}
