import { createBrowserRouter, Navigate } from "react-router-dom";
import type { RouteHandle } from "./types";
import { RequireAuth } from "@/features/auth/context";
import { AppShell } from "@/components/layout/app-shell";
import { TodayPage } from "@/pages/today-page";
import { LoginPage } from "@/pages/login-page";
import { MessagesPage } from "@/pages/messages-page";
import { PhotosEditPage, PhotosPage } from "@/pages/photos-page";
import { UploadPage } from "@/pages/upload-page";
import { WishesPage } from "@/pages/wishes-page";
import { WishNewPage } from "@/pages/wishes-page/new-page";
import { WishDetailPage } from "@/pages/wishes-page/detail-page";
import { DaysPage } from "@/pages/days-page";
import { DayEditPage, DayNewPage } from "@/pages/days-page/form-page";
import { MePage } from "@/pages/me-page";
import { CouplePage } from "@/pages/couple-page";
import { PlaceholderPage } from "@/pages/placeholder-page";

const body = {
  today: "px-12 pt-7 pb-10",
  photos: "px-8 pt-5 pb-7",
  wishes: "px-8 pt-5 pb-8",
  days: "px-12 pt-7 pb-10",
  me: "items-center px-12 pt-9 pb-10",
  nested: "px-12 pt-7 pb-10",
  upload: "px-12 pt-6 pb-10",
} as const;

function page(handle: RouteHandle) {
  return {
    handle,
    Component: PlaceholderPage,
  };
}

export const router = createBrowserRouter([
  {
    path: "/login",
    Component: LoginPage,
  },
  {
    path: "/",
    Component: RequireAuth,
    children: [
      {
        Component: AppShell,
        children: [
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
          {
            path: "messages",
            handle: {
              navId: "messages",
              peer: true,
              actions: [{ kind: "info" }],
              placeholder: "对话",
              bodyClassName: "",
            } satisfies RouteHandle,
            Component: MessagesPage,
          },
          {
            path: "photos",
            handle: {
              navId: "photos",
              title: "相册",
              meta: "共同相册",
              actions: [
                { kind: "search" },
                { kind: "ghost", label: "编辑", to: "/photos/edit" },
                { kind: "primary", label: "上传", to: "/photos/upload" },
              ],
              placeholder: "相册",
              bodyClassName: body.photos,
            } satisfies RouteHandle,
            Component: PhotosPage,
          },
          {
            path: "photos/edit",
            handle: {
              navId: "photos",
              title: "编辑照片",
              meta: "已选择 2 张",
              backTo: "/photos",
              actions: [
                { kind: "ghost", label: "全选" },
                { kind: "danger", label: "删除 2 张" },
              ],
              placeholder: "编辑照片",
              bodyClassName: body.photos,
            } satisfies RouteHandle,
            Component: PhotosEditPage,
          },
          {
            path: "photos/upload",
            handle: {
              navId: "photos",
              title: "上传",
              backTo: "/photos",
              actions: [{ kind: "primary", label: "上传", form: "upload-form" }],
              placeholder: "上传",
              bodyClassName: body.upload,
            } satisfies RouteHandle,
            Component: UploadPage,
          },
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
          {
            path: "me",
            handle: {
              navId: "me",
              title: "我的",
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
              title: "情侣空间",
              backTo: "/me",
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
          { path: "*", element: <Navigate to="/" replace /> },
        ],
      },
    ],
  },
]);
