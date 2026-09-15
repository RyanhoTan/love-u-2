import { Outlet } from "react-router-dom";
import { Sidebar } from "./sidebar";

export function AppShell() {
  return (
    <div className="flex h-full min-h-0 bg-app">
      <Sidebar />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-surface-soft">
        <Outlet />
      </div>
    </div>
  );
}
