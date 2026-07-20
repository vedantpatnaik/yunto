import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Settings, Users, LogOut } from "lucide-react";
import logo from "@/assets/logo.svg";
import btnSearch from "@/assets/icons/search-btn.svg";
import btnBell from "@/assets/icons/bell-btn.svg";
import btnProfile from "@/assets/icons/profile-btn.svg";
import { clearToken } from "@/api/client";

/**
 * Top navigation bar — Figma frame 7917:13608 (1440×131, nav gradient).
 * Logo left (frame @ 22,17). Three 48×48 white circle buttons right
 * (cluster @ x=1185.8, y=60, gap=5): Search, Bell, Profile (dropdown).
 */
export function TopBar() {
  const navigate = useNavigate();
  const [menu, setMenu] = useState(false);

  function logout() {
    clearToken();
    navigate("/login", { replace: true });
  }

  return (
    <header className="absolute left-0 top-0 z-10 flex h-[131px] w-[1440px] items-center bg-nav-grad">
      <img src={logo} alt="yunto" className="absolute left-[69px] top-[46px] h-[62px] w-auto" />
      <div className="absolute right-[22px] top-[60px] flex items-center gap-[5px]">
        <button type="button" aria-label="Search" onClick={() => navigate("/search")} className="h-[48px] w-[48px]">
          <img src={btnSearch} alt="" className="h-[48px] w-[48px]" />
        </button>
        <button type="button" aria-label="Notifications" onClick={() => navigate("/reminders")} className="h-[48px] w-[48px]">
          <img src={btnBell} alt="" className="h-[48px] w-[48px]" />
        </button>
        <div className="relative">
          <button type="button" aria-label="Profile" onClick={() => setMenu((m) => !m)} className="h-[48px] w-[48px]">
            <img src={btnProfile} alt="" className="h-[48px] w-[48px]" />
          </button>
          {menu && (
            <>
              <div className="fixed inset-0 z-20" onClick={() => setMenu(false)} />
              <div className="absolute right-0 top-[54px] z-30 w-[210px] overflow-hidden rounded-[16px] border border-black/5 bg-white shadow-[0_18px_50px_rgba(30,26,43,0.18)]">
                <div className="border-b border-black/5 px-[16px] py-[13px]">
                  <div className="text-[14px] font-medium text-ink">Shubham</div>
                  <div className="text-[12px] text-ink/55">Super Admin</div>
                </div>
                <button onClick={() => { setMenu(false); navigate("/people"); }} className="flex w-full items-center gap-[10px] px-[16px] py-[11px] text-left text-[14px] text-ink hover:bg-black/[0.03]">
                  <Users className="h-[16px] w-[16px] text-ink/70" /> People
                </button>
                <button onClick={() => { setMenu(false); navigate("/settings"); }} className="flex w-full items-center gap-[10px] px-[16px] py-[11px] text-left text-[14px] text-ink hover:bg-black/[0.03]">
                  <Settings className="h-[16px] w-[16px] text-ink/70" /> Settings
                </button>
                <button onClick={logout} className="flex w-full items-center gap-[10px] border-t border-black/5 px-[16px] py-[11px] text-left text-[14px] text-[#D64545] hover:bg-[#FDECEC]/60">
                  <LogOut className="h-[16px] w-[16px]" /> Log out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
