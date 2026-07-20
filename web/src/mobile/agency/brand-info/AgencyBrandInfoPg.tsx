import type { LucideIcon } from "lucide-react";
import {
  ChevronLeft,
  MoreHorizontal,
  BadgeCheck,
  Phone,
  Globe,
  Briefcase,
  MapPin,
  Signal,
  Wifi,
  BatteryFull,
  LayoutGrid,
  Users,
  Megaphone,
  MessageCircle,
  UserRound,
} from "lucide-react";
import whatsapp from "@/assets/icons/whatsapp.svg";

/**
 * Agency app — Brand Info (Figma frame 7791:22768, "brand info", 375×876),
 * rendered inside the 390px MobileFrame. Self-contained: carries its own status
 * bar and bottom nav. Outfit family via font-sans; ink color tokens.
 *
 * NOTE: The Figma REST API (HTTP 429, retry-after ≈ 4.6 days on the shared
 * Starter-plan cost budget) and the Figma MCP endpoints (Starter-plan tool-call
 * cap) were both exhausted for the entire build window, so exact node geometry
 * for this frame could not be pulled. Only the frame envelope was recoverable
 * from an early cached page fetch — origin (-8050, 18176), 375×876. The screen
 * is therefore reconstructed from the shared design system and the sibling
 * Profile / Creators / Leads idioms (status bar, header, stat card, section
 * cards, contact row, bottom nav). Re-run against node 7791:22768 to pin
 * pixel-exact coordinates once the Figma API budget resets.
 */

/* ------------------------------- primitives ------------------------------ */
function DetailRow({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="flex h-[46px] items-center gap-[12px] px-[14px]">
      <span className="flex h-[32px] w-[32px] shrink-0 items-center justify-center rounded-[10px] bg-[#F1EEF9]">
        <Icon className="h-[16px] w-[16px] text-ink/70" strokeWidth={1.7} />
      </span>
      <span className="text-[12px] font-light leading-none text-ink/45">{label}</span>
      <span className="ml-auto max-w-[190px] truncate text-[13px] font-normal leading-none text-ink/85">
        {value}
      </span>
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
export default function AgencyBrandInfoPg() {
  return (
    <div
      className="relative w-[390px] bg-[#F4F2F8] font-sans text-ink"
      style={{ height: 876 }}
    >
      {/* soft brand banner behind the hero */}
      <div className="absolute inset-x-0 top-0 h-[240px] bg-gradient-to-b from-[#E7DFFA] to-[#F4F2F8]" />

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
        Brand Info
      </h1>
      <button className="absolute right-[18px] top-[60px] flex h-[40px] w-[40px] items-center justify-center rounded-full bg-white shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
        <MoreHorizontal className="h-[20px] w-[20px] text-ink" strokeWidth={1.8} />
      </button>

      {/* brand logo + verified badge */}
      <div className="absolute left-1/2 top-[104px] -translate-x-1/2">
        <div className="h-[92px] w-[92px] rounded-[26px] bg-gradient-to-br from-[#FBE7A1] to-[#E7A6C8] ring-[4px] ring-white shadow-[0_6px_20px_rgba(90,60,160,0.20)]" />
        <span className="absolute -bottom-[2px] -right-[2px] flex h-[26px] w-[26px] items-center justify-center rounded-full bg-white ring-[3px] ring-[#F4F2F8]">
          <BadgeCheck className="h-[18px] w-[18px] text-[#2F80ED]" strokeWidth={1.9} />
        </span>
      </div>

      {/* brand name + category */}
      <h2 className="absolute inset-x-0 top-[204px] text-center text-[22px] font-medium leading-none text-ink">
        Glow Cosmetics
      </h2>
      <p className="absolute inset-x-0 top-[234px] text-center text-[13px] font-light leading-none text-ink/55">
        Beauty &amp; Personal Care
      </p>

      {/* status pill */}
      <span className="absolute left-1/2 top-[262px] flex h-[26px] -translate-x-1/2 items-center gap-[6px] rounded-full border border-line/60 bg-white px-[12px] text-[11px] font-normal leading-none text-ink/70">
        <span className="h-[7px] w-[7px] rounded-full bg-[#1FB37A]" />
        Active Client
      </span>

      {/* stats card */}
      <div className="absolute left-[20px] top-[300px] flex h-[82px] w-[350px] items-center rounded-[20px] bg-white shadow-[0_4px_16px_rgba(0,0,0,0.05)]">
        {[
          { n: "12", l: "Campaigns" },
          { n: "₹4.2M", l: "Total Spend" },
          { n: "28", l: "Creators" },
        ].map((s, i) => (
          <div key={s.l} className="relative flex flex-1 flex-col items-center gap-[6px]">
            {i > 0 && (
              <span className="absolute left-0 top-1/2 h-[36px] w-px -translate-y-1/2 bg-line/70" />
            )}
            <span className="text-[20px] font-medium leading-none text-ink">{s.n}</span>
            <span className="text-[11px] font-light leading-none text-ink/50">{s.l}</span>
          </div>
        ))}
      </div>

      {/* contact person */}
      <span className="absolute left-[28px] top-[400px] text-[13px] font-medium leading-none text-ink/45">
        Contact Person
      </span>
      <div className="absolute left-[20px] top-[420px] flex h-[62px] w-[350px] items-center rounded-[18px] bg-white px-[12px] shadow-[0_4px_16px_rgba(0,0,0,0.05)]">
        <span className="h-[40px] w-[40px] shrink-0 rounded-full bg-gradient-to-br from-[#FFD6E7] to-[#C8B3ED]" />
        <div className="ml-[10px] flex min-w-0 flex-col gap-[4px]">
          <span className="truncate text-[14px] font-medium leading-none text-ink/90">
            Priya Sharma
          </span>
          <span className="truncate text-[11px] font-light leading-none text-ink/50">
            Marketing Manager
          </span>
        </div>
        <div className="ml-auto flex items-center gap-[8px]">
          <span className="flex h-[34px] w-[34px] items-center justify-center rounded-full bg-white shadow-[0_1px_5px_rgba(0,0,0,0.12)]">
            <Phone className="h-[16px] w-[16px] text-ink" strokeWidth={1.6} />
          </span>
          <img src={whatsapp} alt="WhatsApp" className="h-[34px] w-[34px]" />
        </div>
      </div>

      {/* about */}
      <span className="absolute left-[28px] top-[500px] text-[13px] font-medium leading-none text-ink/45">
        About
      </span>
      <div className="absolute left-[20px] top-[520px] w-[350px] rounded-[18px] bg-white px-[16px] py-[14px] shadow-[0_4px_16px_rgba(0,0,0,0.05)]">
        <p className="text-[12.5px] font-light leading-[19px] text-ink/70">
          Glow Cosmetics is a homegrown clean-beauty label crafting cruelty-free
          skincare and makeup for Gen-Z audiences across India.
        </p>
      </div>

      {/* details */}
      <span className="absolute left-[28px] top-[622px] text-[13px] font-medium leading-none text-ink/45">
        Details
      </span>
      <div className="absolute left-[20px] top-[642px] w-[350px] divide-y divide-line/60 rounded-[18px] bg-white shadow-[0_4px_16px_rgba(0,0,0,0.05)]">
        <DetailRow icon={Globe} label="Website" value="glowcosmetics.com" />
        <DetailRow icon={Briefcase} label="Industry" value="Beauty & Personal Care" />
        <DetailRow icon={MapPin} label="Location" value="Mumbai, India" />
      </div>

      {/* bottom nav */}
      <div className="absolute inset-x-0 bottom-0 flex h-[74px] items-center bg-white px-[14px] pb-[6px] shadow-[0_-2px_16px_rgba(0,0,0,0.06)]">
        <NavItem icon={LayoutGrid} label="Home" />
        <NavItem icon={Users} label="Sales" active />
        <NavItem icon={Megaphone} label="Campaigns" />
        <NavItem icon={MessageCircle} label="Chat" />
        <NavItem icon={UserRound} label="Profile" />
      </div>
    </div>
  );
}
