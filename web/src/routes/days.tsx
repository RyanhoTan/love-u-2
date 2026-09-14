import type { RouteObject } from "react-router-dom";
import { DaysPage } from "@/pages/days-page";
import { DayEditPage, DayNewPage } from "@/pages/days-page/form-page";
import { body } from "./shared";
import type { RouteHandle } from "./types";

export const daysRoutes = [
  {
    path: "days",
    handle: {
      navId: "days",
      title: "纪念日",
      actions: [{ kind: "primary", label: "添加", to: "/days/new" }],
      placeholder: "纪念日",
      bodyClassName: body.days,
    } satisfies RouteHandle,
    Component: DaysPage,
  },
  {
    path: "days/new",
    handle: {
      navId: "days",
      title: "添加纪念日",
      backTo: "/days",
      actions: [{ kind: "primary", label: "添加", form: "day-form" }],
      placeholder: "添加纪念日",
      bodyClassName: body.nested,
    } satisfies RouteHandle,
    Component: DayNewPage,
  },
  {
    path: "days/:id",
    handle: {
      navId: "days",
      title: "编辑纪念日",
      backTo: "/days",
      actions: [{ kind: "primary", label: "保存", form: "day-form" }],
      placeholder: "编辑纪念日",
      bodyClassName: body.nested,
    } satisfies RouteHandle,
    Component: DayEditPage,
  },
] satisfies RouteObject[];
