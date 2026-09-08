export type NavId = "today" | "messages" | "photos" | "wishes" | "days" | "me";

export type ToolbarAction =
  | { kind: "search" }
  | { kind: "notify" }
  | { kind: "info" }
  | { kind: "primary"; label: string; to?: string }
  | { kind: "ghost"; label: string; to?: string };

export type RouteHandle = {
  navId: NavId;
  title?: string;
  meta?: string | "today-date";
  backTo?: string;
  peer?: {
    name: string;
    status: string;
    src?: string;
  };
  actions?: ToolbarAction[];
  placeholder: string;
  bodyClassName: string;
};
