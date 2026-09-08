import { useMatches } from "react-router-dom";
import type { RouteHandle } from "./types";

export function useRouteHandle() {
  const matches = useMatches();

  for (let index = matches.length - 1; index >= 0; index -= 1) {
    const handle = matches[index]?.handle;
    if (handle) {
      return handle as RouteHandle;
    }
  }

  throw new Error("Missing route handle");
}
