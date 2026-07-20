import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import icDashboard from "@/assets/icons/dashboard.svg";
import icSales from "@/assets/icons/sales.svg";
import icProduct from "@/assets/icons/product.svg";
import icCustomers from "@/assets/icons/customers.svg";
import icKanban from "@/assets/icons/kanban.svg";
import icChat from "@/assets/icons/chat.svg";
import icContacts from "@/assets/icons/contacts.svg";

/**
 * Collapsed icon rail — Figma frame 7917:13569 (x=39, y=143, w=177).
 * Active item is an expanded 177×56 pill (#181819); others are 56×56 white circles.
 * Vertical gap = 24px between items (56px pitch → 80px between tops).
 */
const NAV = [
  { to: "/dashboard", label: "Dashboard", icon: icDashboard, activeIcon: icDashboard },
  { to: "/leads", label: "Leads", icon: icSales, activeIcon: icSales },
  { to: "/campaigns", label: "Campaign", icon: icProduct },
  { to: "/creators", label: "Creators", icon: icCustomers },
  { to: "/kanban", label: "Kanban", icon: icKanban },
  { to: "/chat", label: "Chat", icon: icChat },
  { to: "/contacts", label: "Contacts", icon: icContacts },
];

export function Sidebar() {
  return (
    <nav className="absolute left-[39px] top-[143px] z-20 flex w-[177px] flex-col gap-[24px]">
      {NAV.map((item) => (
        <NavLink key={item.to} to={item.to} className="block">
          {({ isActive }) =>
            isActive ? (
              <div className="flex h-[56px] w-[177px] items-center gap-[8px] rounded-pill bg-navpill p-[6px]">
                <span className="flex h-[44px] w-[44px] items-center justify-center rounded-full">
                  {/* active icon is white in the exported SVG */}
                  <img src={item.activeIcon ?? item.icon} alt="" className="h-[24px] w-[24px] brightness-0 invert" />
                </span>
                <span className="font-sans text-[20px] font-normal leading-none text-white">
                  {item.label}
                </span>
              </div>
            ) : (
              <div
                className={cn(
                  "flex h-[56px] w-[56px] items-center justify-center rounded-pill bg-white",
                  "shadow-[0_2px_8px_rgba(0,0,0,0.04)]"
                )}
                title={item.label}
              >
                {/* normalize every icon to solid black when inactive (some SVGs export white) */}
                <img src={item.icon} alt={item.label} className="h-[24px] w-[24px] brightness-0" />
              </div>
            )
          }
        </NavLink>
      ))}
    </nav>
  );
}
