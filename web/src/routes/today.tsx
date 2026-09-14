import type { RouteObject } from "react-router-dom";
import { TodayPage } from "@/pages/today-page";
import { body, page } from "./shared";
import type { RouteHandle } from "./types";

export const todayRoutes = [
  {
    index: true,
    handle: {
      navId: "today",
      title: "今天",
      meta: "today-date",
      actions: [{ kind: "search" }, { kind: "notify" }],
      placeholder: "今天",
      bodyClassName: body.today,
    } satisfies RouteHandle,
    Component: TodayPage,
  },
  {
    path: "status",
    ...page({
      navId: "today",
      title: "状态",
      backTo: "/",
      actions: [{ kind: "ghost", label: "完成" }],
      placeholder: "状态",
      bodyClassName: body.nested,
    }),
  },
  {
    path: "sentence",
    ...page({
      navId: "today",
      title: "一句话",
      backTo: "/",
      actions: [{ kind: "primary", label: "留下" }],
      placeholder: "一句话",
      bodyClassName: body.nested,
    }),
  },
] satisfies RouteObject[];
