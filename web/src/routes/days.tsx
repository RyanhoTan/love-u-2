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
      placeholder: "纪念日",
      bodyClassName: body.days,
    } satisfies RouteHandle,
    Component: DaysPage,
  },
  {
    path: "days/new",
    handle: {
      navId: "days",
      placeholder: "添加纪念日",
      bodyClassName: body.nested,
    } satisfies RouteHandle,
    Component: DayNewPage,
  },
  {
    path: "days/:id",
    handle: {
      navId: "days",
      placeholder: "编辑纪念日",
      bodyClassName: body.nested,
    } satisfies RouteHandle,
    Component: DayEditPage,
  },
] satisfies RouteObject[];
