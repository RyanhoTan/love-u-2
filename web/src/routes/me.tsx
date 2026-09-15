import type { RouteObject } from "react-router-dom";
import { CouplePage } from "@/pages/couple-page";
import { MePage } from "@/pages/me-page";
import { body, page } from "./shared";
import type { RouteHandle } from "./types";

export const meRoutes = [
  {
    path: "me",
    handle: {
      navId: "me",
      placeholder: "我的",
      bodyClassName: body.me,
    } satisfies RouteHandle,
    Component: MePage,
  },
  {
    path: "me/profile",
    ...page({
      navId: "me",
      title: "个人资料",
      backTo: "/me",
      actions: [{ kind: "primary", label: "保存" }],
      placeholder: "个人资料",
      bodyClassName: body.nested,
    }),
  },
  {
    path: "me/couple",
    handle: {
      navId: "me",
      placeholder: "情侣空间",
      bodyClassName: body.nested,
    } satisfies RouteHandle,
    Component: CouplePage,
  },
  {
    path: "me/notify",
    ...page({
      navId: "me",
      title: "通知",
      backTo: "/me",
      actions: [{ kind: "primary", label: "保存" }],
      placeholder: "通知",
      bodyClassName: body.nested,
    }),
  },
  {
    path: "me/report",
    ...page({
      navId: "me",
      title: "恋爱报告",
      backTo: "/me",
      placeholder: "恋爱报告",
      bodyClassName: body.nested,
    }),
  },
  {
    path: "me/appearance",
    ...page({
      navId: "me",
      title: "外观",
      backTo: "/me",
      placeholder: "外观",
      bodyClassName: body.nested,
    }),
  },
] satisfies RouteObject[];
