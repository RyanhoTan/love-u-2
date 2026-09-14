import type { RouteObject } from "react-router-dom";
import { MessagesPage } from "@/pages/messages-page";
import type { RouteHandle } from "./types";

export const messagesRoutes = [
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
] satisfies RouteObject[];
