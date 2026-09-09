import type { DayCategory, DayItem, DayRepeat } from "@/app/mock";

export type DayFormValues = {
  title: string;
  category: DayCategory;
  date: string;
  repeat: DayRepeat;
  remind7: boolean;
  remindDay: boolean;
};

export function emptyDayForm(): DayFormValues {
  return {
    title: "",
    category: "生日",
    date: "",
    repeat: "每年",
    remind7: true,
    remindDay: true,
  };
}

export function dayToForm(day: DayItem): DayFormValues {
  return {
    title: day.title,
    category: day.category,
    date: day.date,
    repeat: day.repeat,
    remind7: day.remind7,
    remindDay: day.remindDay,
  };
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
