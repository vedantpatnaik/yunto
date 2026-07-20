import type { LucideIcon } from "lucide-react";
import {
  ChevronLeft,
  Settings,
  Camera,
  User,
  Bell,
  ShieldCheck,
  HelpCircle,
  FileText,
  LogOut,
  ChevronRight,
  Signal,
  Wifi,
  BatteryFull,
  LayoutGrid,
  Users,
  Megaphone,
  MessageCircle,
  UserRound,
} from "lucide-react";

/**
 * Agency app — Profile (Figma frame 7721:4248, 375×876, rendered inside the
 * 390px MobileFrame). Self-contained: includes its own status bar and bottom
 * nav. Outfit family via font-sans; ink color tokens.
 *
 * NOTE: The Figma REST + MCP APIs were rate-limited (429) for the entire build
 * window, so this screen is reconstructed from the shared design system and the
 * LeadsPage idiom rather than exact node geometry. Re-run against the node when
 * the Figma API recovers to pin pixel-exact coordinates.
 */

/* ------------------------------- primitives ------------------------------ */
function MenuRow({
  icon: Icon,
  label,
  danger,
}: {
  icon: LucideIcon;
  label: string;
  danger?: boolean;
}) {
  return (
    <div className="flex h-[52px] items-center gap-[12px] px-[14px]">
      <span
        className={`flex h-[36px] w-[36px] shrink-0 items-center justify-center rounded-[11px] ${
          danger ? "bg-[#FDE7E7]" : "bg-[#F1EEF9]"
        }`}
      >
        <Icon
          className={`h-[18px] w-[18px] ${danger ? "text-[#E0575A]" : "text-ink/75"}`}
          strokeWidth={1.7}
        />
      </span>
      <span
        className={`flex-1 text-[14px] font-normal ${
          danger ? "text-[#E0575A]" : "text-ink/85"
        }`}
      >
        {label}
      </span>
      {!danger && (
        <ChevronRight className="h-[18px] w-[18px] text-ink/30" strokeWidth={1.7} />
      )}
    </div>
  );
}

function NavItem({
  icon: Icon,
  label,
  active,
}: {
  icon: LucideIcon;
  label: string;
  active?: boolean;
}) {
  return (
    <div className="flex flex-1 flex-col items-center gap-[3px]">
      <Icon
        className={`h-[22px] w-[22px] ${active ? "text-ink" : "text-ink/40"}`}
        strokeWidth={active ? 2 : 1.7}
      />
      <span
        className={`text-[10px] leading-none ${
          active ? "font-medium text-ink" : "font-light text-ink/45"
        }`}
      >
        {label}
      </span>
    </div>
  );
}

/* ---------------------------------- page --------------------------------- */
export default function AgencyProfilePage() {
  return (
    <div className="relative w-[390px] bg-[#F4F2F8] font-sans text-ink" style={{ height: 876 }}>
      {/* soft brand banner behind the hero */}
      <div className="absolute inset-x-0 top-0 h-[300px] bg-gradient-to-b from-[#E7DFFA] to-[#F4F2F8]" />

      {/* status bar */}
      <div className="absolute inset-x-0 top-0 h-[54px]">
        <span className="absolute left-[26px] top-[17px] text-[15px] font-medium leading-none text-ink">
          9:41
        </span>
        <div className="absolute right-[22px] top-[18px] flex items-center gap-[6px]">
          <Signal className="h-[16px] w-[16px] text-ink" strokeWidth={2} />
          <Wifi className="h-[16px] w-[16px] text-ink" strokeWidth={2} />
          <BatteryFull className="h-[18px] w-[18px] text-ink" strokeWidth={1.6} />
        </div>
      </div>

      {/* header bar */}
      <button className="absolute left-[18px] top-[60px] flex h-[40px] w-[40px] items-center justify-center rounded-full bg-white shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
        <ChevronLeft className="h-[20px] w-[20px] text-ink" strokeWidth={1.8} />
      </button>
      <h1 className="absolute inset-x-0 top-[70px] text-center text-[18px] font-medium leading-none text-ink">
        Profile
      </h1>
      <button className="absolute right-[18px] top-[60px] flex h-[40px] w-[40px] items-center justify-center rounded-full bg-white shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
        <Settings className="h-[19px] w-[19px] text-ink" strokeWidth={1.7} />
      </button>

      {/* avatar */}
      <div className="absolute left-1/2 top-[120px] -translate-x-1/2">
        <div className="h-[104px] w-[104px] rounded-full bg-gradient-to-br from-[#C8E6FF] to-[#C8B3ED] ring-[4px] ring-white shadow-[0_6px_20px_rgba(90,60,160,0.20)]" />
        <span className="absolute bottom-[2px] right-[2px] flex h-[30px] w-[30px] items-center justify-center rounded-full bg-ink ring-[3px] ring-[#F4F2F8]">
          <Camera className="h-[15px] w-[15px] text-white" strokeWidth={1.7} />
        </span>
      </div>

      {/* name + role */}
      <h2 className="absolute inset-x-0 top-[240px] text-center text-[22px] font-medium leading-none text-ink">
        Rahul Aggrawal
      </h2>
      <p className="absolute inset-x-0 top-[272px] text-center text-[13px] font-light leading-none text-ink/55">
        Sales Manager · Stellar Talents
      </p>

      {/* stats card */}
      <div className="absolute left-[20px] top-[308px] flex h-[84px] w-[350px] items-center rounded-[20px] bg-white shadow-[0_4px_16px_rgba(0,0,0,0.05)]">
        {[
          { n: "18", l: "Deals" },
          { n: "11", l: "Won" },
          { n: "4", l: "Lost" },
        ].map((s, i) => (
          <div key={s.l} className="relative flex flex-1 flex-col items-center gap-[5px]">
            {i > 0 && (
              <span className="absolute left-0 top-1/2 h-[36px] w-px -translate-y-1/2 bg-line/70" />
            )}
            <span className="text-[22px] font-medium leading-none text-ink">{s.n}</span>
            <span className="text-[12px] font-light leading-none text-ink/50">{s.l}</span>
          </div>
        ))}
      </div>

      {/* General group */}
      <span className="absolute left-[28px] top-[412px] text-[13px] font-medium leading-none text-ink/45">
        General
      </span>
      <div className="absolute left-[20px] top-[434px] w-[350px] divide-y divide-line/60 rounded-[20px] bg-white shadow-[0_4px_16px_rgba(0,0,0,0.05)]">
        <MenuRow icon={User} label="Personal Information" />
        <MenuRow icon={Bell} label="Notifications" />
        <MenuRow icon={ShieldCheck} label="Privacy & Security" />
      </div>

      {/* Support group */}
      <span className="absolute left-[28px] top-[608px] text-[13px] font-medium leading-none text-ink/45">
        Support
      </span>
      <div className="absolute left-[20px] top-[630px] w-[350px] divide-y divide-line/60 rounded-[20px] bg-white shadow-[0_4px_16px_rgba(0,0,0,0.05)]">
        <MenuRow icon={HelpCircle} label="Help Center" />
        <MenuRow icon={FileText} label="Terms & Policies" />
        <MenuRow icon={LogOut} label="Log Out" danger />
      </div>

      {/* bottom nav */}
      <div className="absolute inset-x-0 bottom-0 flex h-[74px] items-center bg-white px-[14px] pb-[6px] shadow-[0_-2px_16px_rgba(0,0,0,0.06)]">
        <NavItem icon={LayoutGrid} label="Home" />
        <NavItem icon={Users} label="Sales" />
        <NavItem icon={Megaphone} label="Campaigns" />
        <NavItem icon={MessageCircle} label="Chat" />
        <NavItem icon={UserRound} label="Profile" active />
      </div>
    </div>
  );
}
