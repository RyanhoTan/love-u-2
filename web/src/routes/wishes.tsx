import type { RouteObject } from "react-router-dom";
import { WishesPage } from "@/pages/wishes-page";
import { WishNewPage } from "@/pages/wishes-page/new-page";
import { WishDetailPage } from "@/pages/wishes-page/detail-page";
import { body } from "./shared";
import type { RouteHandle } from "./types";

export const wishesRoutes = [
  {
    path: "wishes",
    handle: {
      navId: "wishes",
      placeholder: "心愿",
      bodyClassName: body.wishes,
    } satisfies RouteHandle,
    Component: WishesPage,
  },
  {
    path: "wishes/new",
    handle: {
      navId: "wishes",
      placeholder: "添加心愿",
      bodyClassName: body.nested,
    } satisfies RouteHandle,
    Component: WishNewPage,
  },
  {
    path: "wishes/:id",
    handle: {
      navId: "wishes",
      placeholder: "心愿详情",
      bodyClassName: body.nested,
    } satisfies RouteHandle,
    Component: WishDetailPage,
  },
] satisfies RouteObject[];
