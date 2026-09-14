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
      title: "心愿",
      meta: "你们的心愿",
      actions: [{ kind: "primary", label: "添加心愿", to: "/wishes/new" }],
      placeholder: "心愿",
      bodyClassName: body.wishes,
    } satisfies RouteHandle,
    Component: WishesPage,
  },
  {
    path: "wishes/new",
    handle: {
      navId: "wishes",
      title: "添加心愿",
      backTo: "/wishes",
      actions: [
        { kind: "primary", label: "保存", form: "wish-new-form" },
      ],
      placeholder: "添加心愿",
      bodyClassName: body.nested,
    } satisfies RouteHandle,
    Component: WishNewPage,
  },
  {
    path: "wishes/:id",
    handle: {
      navId: "wishes",
      title: "心愿详情",
      backTo: "/wishes",
      actions: [
        { kind: "ghost", label: "标记完成", to: "?done=1" },
        { kind: "primary", label: "记一笔", to: "?record=1" },
      ],
      placeholder: "心愿详情",
      bodyClassName: body.nested,
    } satisfies RouteHandle,
    Component: WishDetailPage,
  },
] satisfies RouteObject[];
