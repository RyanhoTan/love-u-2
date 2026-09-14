import { Outlet } from "react-router-dom";
import { PhotoEditProvider } from "@/features/album/photo-edit-context";
import { Sidebar } from "./sidebar";
import { Toolbar } from "./toolbar";

export function AppShell() {
  return (
    <PhotoEditProvider>
      <div className="flex h-full min-h-0 bg-app">
        <Sidebar />
        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-surface-soft">
          <Toolbar />
          <Outlet />
        </div>
      </div>
    </PhotoEditProvider>
  );
}
