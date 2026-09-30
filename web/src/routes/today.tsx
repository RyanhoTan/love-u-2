import type { RouteObject } from "react-router-dom";
import { TodayPage } from "@/pages/today-page";
import { body } from "./shared";

export const todayRoutes = [
  {
    index: true,
    handle: {
      navId: "today",
      placeholder: "今天",
      bodyClassName: body.today,
    },
    Component: TodayPage,
  },
] satisfies RouteObject[];
