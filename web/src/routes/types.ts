export type NavId = "today" | "messages" | "photos" | "wishes" | "days" | "me";

export type ToolbarAction =
  | { kind: "search" }
  | { kind: "notify" }
  | { kind: "info" }
  | { kind: "primary"; label: string; to?: string; form?: string }
  | { kind: "ghost"; label: string; to?: string; form?: string };

export type RouteHandle = {
  navId: NavId;
  title?: string;
  meta?: string | "today-date";
  backTo?: string;
  /** Show partner in the toolbar from couple space. */
  peer?: boolean;
  actions?: ToolbarAction[];
  placeholder: string;
  bodyClassName: string;
};
