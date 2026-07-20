import type { ReactNode } from "react";
import { Outlet } from "react-router-dom";

/**
 * Mobile shell — the Agency & Influencer apps are 375px-wide mobile designs
 * (exact Figma frame width). Each screen is a self-contained 375px page (it
 * includes its own status bar / bottom nav from Figma), so the frame just
 * centers a 375px viewport on a neutral backdrop, like a device preview.
 */
export function MobileFrame({ children }: { children?: ReactNode }) {
  return (
    <div className="flex min-h-screen w-full justify-center bg-[#EDEAF6] py-6">
      <div data-mobile-frame className="relative w-[375px] shrink-0 overflow-hidden rounded-[28px] bg-white shadow-[0_20px_60px_rgba(0,0,0,0.18)]">
        {children ?? <Outlet />}
      </div>
    </div>
  );
}
