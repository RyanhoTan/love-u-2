import type { WishItem, WishStatus } from "@/api/wish";

export const WISH_TABS = [
  { value: "todo", label: "想去" },
  { value: "doing", label: "进行中" },
  { value: "done", label: "已完成" },
] as const;

export type WishTab = (typeof WISH_TABS)[number]["value"];

export const WISH_STATUS_LABEL: Record<WishStatus, string> = {
  todo: "想去",
  doing: "进行中",
  done: "已完成",
};

export const WISH_MOODS = [
  "期待",
  "开心",
  "心动",
  "平静",
  "感动",
  "疲惫",
] as const;

export function isoToDotDate(iso: string) {
  if (!iso) {
    return "";
  }
  return iso.replaceAll("-", ".");
}

export function dotDateToIso(dot: string) {
  if (!dot) {
    return "";
  }
  return dot.replaceAll(".", "-");
}

export function todayIso() {
  const now = new Date();
  return [
    String(now.getFullYear()).padStart(4, "0"),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("-");
}

export function formatBudget(amount: number | null) {
  if (amount == null) {
    return "未定";
  }
  return `¥ ${amount.toLocaleString("zh-CN")}`;
}

export function formatCreatedAt(iso: string | null) {
  if (!iso) {
    return "";
  }
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, "0")}.${String(date.getDate()).padStart(2, "0")}`;
}

export function filterWishes(wishes: WishItem[], tab: WishTab) {
  return wishes.filter((wish) => wish.status === tab);
}
