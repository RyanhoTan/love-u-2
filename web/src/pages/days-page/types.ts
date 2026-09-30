import { z } from "zod";
import { isCalendarDate } from "../../lib/couple-calendar";
export { previewRemainingDays } from "../../lib/couple-calendar";
import type {
  AnniversaryItem,
  AnniversaryPayload,
  AnniversaryRepeatType,
  AnniversaryType,
} from "@/api/anniversary";

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
  { value: "none", label: "不重复", description: "只记录这一次" },
  { value: "yearly", label: "每年", description: "每年同一天倒数" },
];

export const DAY_REMINDER_OPTIONS: {
  value: number;
  label: string;
  description: string;
}[] = [
  { value: 0, label: "当天", description: "记录当天的计划时间" },
  { value: 3, label: "提前 3 天", description: "记录提前三天的计划时间" },
  { value: 7, label: "提前 7 天", description: "记录提前一周的计划时间" },
];

export const dayFormSchema = z.object({
  title: z
    .string()
    .refine((value) => value.trim().length > 0, "请输入名称")
    .refine((value) => value.trim().length <= 100, "名称最多 100 个字"),
  type: z.enum(["love", "birthday", "holiday", "custom"]),
  date: z.string().regex(/^\d{4}\.\d{2}\.\d{2}$/, "请选择日期")
    .refine((value) => isCalendarDate(dotDateToIso(value)), "请选择有效的日历日期"),
  repeatType: z.enum(["none", "yearly"]),
  reminderDaysBefore: z.number().int().min(0).max(30),
});

export type DayFormValues = z.infer<typeof dayFormSchema>;

export function emptyDayForm(): DayFormValues {
  return {
    title: "",
    type: "birthday",
    date: "",
    repeatType: "yearly",
    reminderDaysBefore: 7,
  };
}

export function anniversaryToForm(item: AnniversaryItem): DayFormValues {
  return {
    title: item.title,
    type: item.type,
    date: isoToDotDate(item.originalDate),
    repeatType: item.repeatType,
    reminderDaysBefore: item.reminderDaysBefore,
  };
}

export function formToPayload(values: DayFormValues): AnniversaryPayload {
  return {
    title: values.title.trim(),
    type: values.type,
    originalDate: dotDateToIso(values.date),
    repeatType: values.repeatType,
    reminderDaysBefore: values.reminderDaysBefore,
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

export function remindLabel(values: Partial<DayFormValues>): string {
  const days = values.reminderDaysBefore;
  if (
    typeof days !== "number" ||
    !Number.isInteger(days) ||
    days < 0 ||
    days > 30
  ) {
    return "—";
  }
  return days === 0 ? "当天" : `提前 ${days} 天`;
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
