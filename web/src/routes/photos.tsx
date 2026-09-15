import type { RouteObject } from "react-router-dom";
import { PhotosPage } from "@/pages/photos-page";
import { UploadPage } from "@/pages/upload-page";
import { body } from "./shared";
import type { RouteHandle } from "./types";

export const photosRoutes = [
  {
    path: "photos",
    handle: {
      navId: "photos",
      placeholder: "相册",
      bodyClassName: body.photos,
    } satisfies RouteHandle,
    children: [
      {
        index: true,
        Component: PhotosPage,
      },
      {
        path: "upload",
        handle: {
          navId: "photos",
          placeholder: "上传",
          bodyClassName: body.upload,
        } satisfies RouteHandle,
        Component: UploadPage,
      },
    ],
  },
] satisfies RouteObject[];
