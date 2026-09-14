import type { RouteObject } from "react-router-dom";
import { RequireCouple } from "@/features/auth/context";
import { messagesRoutes } from "./messages";
import { photosRoutes } from "./photos";

export const coupleOnlyRoutes = [
  {
    Component: RequireCouple,
    children: [...messagesRoutes, ...photosRoutes],
  },
] satisfies RouteObject[];
