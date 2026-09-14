import { createBrowserRouter, Navigate } from "react-router-dom";
import { AppShell } from "@/components/layout/app-shell";
import { RequireAuth } from "@/features/auth/context";
import { LoginPage } from "@/pages/login-page";
import { coupleOnlyRoutes } from "./couple-only";
import { daysRoutes } from "./days";
import { meRoutes } from "./me";
import { todayRoutes } from "./today";
import { wishesRoutes } from "./wishes";

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
          ...todayRoutes,
          ...coupleOnlyRoutes,
          ...wishesRoutes,
          ...daysRoutes,
          ...meRoutes,
          { path: "*", element: <Navigate to="/" replace /> },
        ],
      },
    ],
  },
]);
