export type NavId = "today" | "messages" | "photos" | "wishes" | "days" | "me";

export type RouteAction =
  | { kind: "primary"; label: string; to?: string; form?: string }
  | { kind: "danger"; label: string; to?: string; form?: string }
  | { kind: "ghost"; label: string; to?: string; form?: string };

export type RouteHandle = {
  navId: NavId;
  title?: string;
  backTo?: string;
  actions?: RouteAction[];
  placeholder: string;
  bodyClassName: string;
};
