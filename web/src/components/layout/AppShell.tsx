import { Outlet } from "react-router-dom";
import { TopBar } from "./TopBar";
import { Sidebar } from "./Sidebar";

/**
 * Fixed 1440×1024 canvas matching the Figma frame exactly.
 * The page gradient lives on <body>; the canvas is centered within the viewport.
 */
export function AppShell() {
  return (
    <div className="flex min-h-screen w-full justify-center">
      <div className="relative h-[1024px] w-[1440px] shrink-0 overflow-hidden">
        <TopBar />
        <Sidebar />
        <main className="absolute inset-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
