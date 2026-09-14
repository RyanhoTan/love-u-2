import { PlaceholderPage } from "@/pages/placeholder-page";
import type { RouteHandle } from "./types";

export const body = {
  today: "px-12 pt-7 pb-10",
  photos: "px-8 pt-5 pb-7",
  wishes: "px-8 pt-5 pb-8",
  days: "px-12 pt-7 pb-10",
  me: "items-center px-12 pt-9 pb-10",
  nested: "px-12 pt-7 pb-10",
  upload: "px-12 pt-6 pb-10",
} as const;

export function page(handle: RouteHandle) {
  return {
    handle,
    Component: PlaceholderPage,
  };
}
