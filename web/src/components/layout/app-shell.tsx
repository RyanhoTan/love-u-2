import { Outlet } from "react-router-dom";
import { Sidebar } from "./sidebar";
import { Toolbar } from "./toolbar";

export function AppShell() {
  return (
    <div className="flex h-full min-h-0 bg-app">
      <Sidebar />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col bg-surface-soft">
        <Toolbar />
        <Outlet />
      </div>
    </div>
  );
}
