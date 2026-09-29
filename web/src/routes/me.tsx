import type { RouteObject } from "react-router-dom";
import { CouplePage } from "@/pages/couple-page";
import { MePage } from "@/pages/me-page";
import { ProfilePage } from "@/pages/profile-page";
import { body } from "./shared";
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
    handle: {
      navId: "me",
      placeholder: "个人资料",
      bodyClassName: body.nested,
    } satisfies RouteHandle,
    Component: ProfilePage,
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
] satisfies RouteObject[];
