import type { RouteObject } from "react-router-dom";
import { PhotosEditPage, PhotosPage } from "@/pages/photos-page";
import { UploadPage } from "@/pages/upload-page";
import { body } from "./shared";
import type { RouteHandle } from "./types";

export const photosRoutes = [
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
    children: [
      {
        index: true,
        Component: PhotosPage,
      },
      {
        path: "edit",
        handle: {
          navId: "photos",
          title: "编辑照片",
          meta: "已选择 0 张",
          backTo: "/photos",
          actions: [],
          placeholder: "编辑照片",
          bodyClassName: body.photos,
        } satisfies RouteHandle,
        Component: PhotosEditPage,
      },
      {
        path: "upload",
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
    ],
  },
] satisfies RouteObject[];
