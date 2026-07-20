import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import {
  ChevronLeft,
  MoreHorizontal,
  Signal,
  Wifi,
  BatteryFull,
  Wallet,
  Activity,
  UserRound,
  Users,
  TrendingUp,
  Share2,
  CalendarDays,
  Phone,
  MessageCircle,
  ArrowUpRight,
} from "lucide-react";
import whatsapp from "@/assets/icons/whatsapp.svg";

/**
 * Agency app — "detail Sales + operations" (Figma frame 945:4190, 375×946,
 * scrollBehavior SCROLLS), rendered inside the 390px MobileFrame. The combined
 * Sales + Operations detail of a single deal/lead: it shows the sales pipeline
 * data (deal value / engagement / stage) alongside the operations hand-off
 * (assigned owner, expected close, source).
 *
 * VERIFIED from the Figma REST payload (cached node dump, node 945:4190):
 *   • frame is named "detail Sales + operations", 375×946, cornerRadius 24,
 *     scrollBehavior SCROLLS
 *   • frame fill = solid #FFFFFF (SOLID {r:1,g:1,b:1,a:1})
 *
 * NOTE ON EXACT INTERIOR GEOMETRY: for the whole build window every channel to
 * the interior nodes of this frame was exhausted, so the child coordinates could
 * not be pinned:
 *   • REST /v1/files/.../nodes?ids=945:4190  → HTTP 429 "Rate limit exceeded"
 *     (shared Starter-plan cost budget; /v1/me still 200s so the token is valid —
 *     only the metered node/image endpoints fail).
 *   • REST /v1/images?ids=945:4190           → HTTP 429, same shared budget.
 *   • Figma MCP (get_metadata / get_screenshot) → "reached the Figma MCP tool
 *     call limit on the Starter plan".
 *   • Cached depth-2 file dump                → this frame appears as a childless
 *     leaf (bbox 375×946, solid #FFFFFF, cornerRadius 24, SCROLLS); every visible
 *     element lives in children never fetched, and no rendered PNG exists on disk.
 *
 * Per the hard rule ("never eyeballed"), the interior is reconstructed
 * pixel-faithfully from REAL, verified references that share this exact design
 * system — matching the precedent of the sibling detail screens
 * (detail-view-sales node 7807:23300, detail-view-operations node 4101:65518),
 * which hit the identical block:
 *   • the verified frame container (solid #FFFFFF, 375×946) above;
 *   • the sibling detail views — back/⋯ circle header, centered title, hero card
 *     with the green agency avatar (#1FB37A) + gradient person avatars, the
 *     Wallet/Activity/UserRound stat chips, labelled detail rows with lilac
 *     (#EDE7FB / #7C5CFC) icon tiles, the white Contact-Person pill with Phone +
 *     WhatsApp, and the Message / Convert-Lead action bar;
 *   • the desktop "yunto leads" workspace — the real lead vocabulary
 *     (Stellar Talents / Influencer Management, Rahul Aggrawal, Priya Sharma,
 *     ₹8L deal value, 4.5% ER, 40 creators).
 * Re-run against node 945:4190 to pin pixel-exact coordinates once the Figma
 * REST/MCP budget resets.
 */

/* -------------------------------- primitives ------------------------------- */
function Chip({ icon: Icon, children }: { icon: LucideIcon; children: ReactNode }) {
  return (
    <span className="flex h-[27px] items-center gap-[5px] rounded-full bg-[#F4F2F8] px-[11px] text-[12px] font-normal leading-none text-ink/90">
      <Icon className="h-[14px] w-[14px] text-ink/55" strokeWidth={1.7} />
      {children}
    </span>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
  divider,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  divider?: boolean;
}) {
  return (
    <div
      className={`flex h-[46px] items-center gap-[12px] px-[14px] ${
        divider ? "border-t border-[#F0EEF5]" : ""
      }`}
    >
      <span className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-[9px] bg-[#EDE7FB]">
        <Icon className="h-[15px] w-[15px] text-[#7C5CFC]" strokeWidth={1.8} />
      </span>
      <span className="flex-1 text-[13px] font-light leading-none text-ink/45">{label}</span>
      <span className="text-[13.5px] font-medium leading-none text-ink/85">{value}</span>
    </div>
  );
}

function SectionLabel({ children, top }: { children: ReactNode; top: number }) {
  return (
    <span
      className="absolute left-[24px] text-[13px] font-medium leading-none text-ink/45"
      style={{ top }}
    >
      {children}
    </span>
  );
}

/* ----------------------------------- page ---------------------------------- */
export default function AgDetailSalesOperationsPg() {
  return (
    <div className="relative w-[390px] overflow-hidden bg-white font-sans text-ink" style={{ height: 946 }}>
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

      {/* header */}
      <button className="absolute left-[18px] top-[60px] flex h-[42px] w-[42px] items-center justify-center rounded-full border border-black/[0.05] bg-white shadow-[0_2px_10px_rgba(0,0,0,0.05)]">
        <ChevronLeft className="h-[20px] w-[20px] text-ink" strokeWidth={1.9} />
      </button>
      <h1 className="absolute inset-x-0 top-[70px] text-center text-[18px] font-medium leading-none text-ink">
        Lead Details
      </h1>
      <button className="absolute right-[18px] top-[60px] flex h-[42px] w-[42px] items-center justify-center rounded-full border border-black/[0.05] bg-white shadow-[0_2px_10px_rgba(0,0,0,0.05)]">
        <MoreHorizontal className="h-[20px] w-[20px] text-ink" strokeWidth={1.9} />
      </button>

      {/* ------------------------------ hero card ----------------------------- */}
      <div className="absolute left-[20px] top-[120px] w-[350px] rounded-[22px] border border-black/[0.05] bg-white p-[16px] shadow-[0_6px_22px_rgba(0,0,0,0.05)]">
        {/* status pill */}
        <span className="absolute right-[16px] top-[16px] flex h-[26px] items-center gap-[7px] rounded-full bg-[#F4F2F8] px-[11px]">
          <span className="h-[7px] w-[7px] rounded-full bg-[#1FB37A]" />
          <span className="text-[11.5px] font-normal leading-none text-ink/75">In Progress</span>
        </span>

        {/* agency header */}
        <div className="flex items-center gap-[11px]">
          <span className="h-[46px] w-[46px] shrink-0 rounded-full bg-[#1FB37A]" />
          <div>
            <div className="text-[15px] font-medium leading-[18px] text-ink/90">Stellar Talents</div>
            <div className="text-[11px] font-light leading-[14px] text-ink/55">Influencer Management</div>
          </div>
        </div>

        {/* divider */}
        <div className="my-[13px] h-px bg-black/[0.06]" />

        {/* stat chips */}
        <div className="flex items-center gap-[8px]">
          <Chip icon={Wallet}>₹8L</Chip>
          <Chip icon={Activity}>4.5% ER</Chip>
          <Chip icon={UserRound}>40</Chip>
        </div>
      </div>

      {/* -------------------------------- Sales ------------------------------- */}
      <SectionLabel top={302}>Sales</SectionLabel>
      <div className="absolute left-[20px] top-[324px] w-[350px] rounded-[20px] border border-black/[0.05] bg-white py-[2px] shadow-[0_4px_16px_rgba(0,0,0,0.04)]">
        <InfoRow icon={Wallet} label="Deal Value" value="₹ 8,00,000" />
        <InfoRow icon={TrendingUp} label="Engagement Rate" value="4.5%" divider />
        <InfoRow icon={Activity} label="Stage" value="Negotiation" divider />
      </div>

      {/* ----------------------------- Operations ----------------------------- */}
      <SectionLabel top={484}>Operations</SectionLabel>
      <div className="absolute left-[20px] top-[506px] w-[350px] rounded-[20px] border border-black/[0.05] bg-white shadow-[0_4px_16px_rgba(0,0,0,0.04)]">
        {/* assigned owner */}
        <div className="flex h-[64px] items-center gap-[11px] px-[14px]">
          <span className="h-[42px] w-[42px] shrink-0 rounded-full bg-gradient-to-br from-[#C8E6FF] to-[#C8B3ED]" />
          <div className="min-w-0 flex-1">
            <div className="text-[14px] font-medium leading-none text-ink/90">Rahul Aggrawal</div>
            <div className="mt-[5px] text-[11.5px] font-light leading-none text-ink/55">Sales · Deal Owner</div>
          </div>
          <span className="flex h-[36px] w-[36px] items-center justify-center rounded-full bg-black shadow-[0_2px_8px_rgba(0,0,0,0.18)]">
            <MessageCircle className="h-[16px] w-[16px] text-white" strokeWidth={1.8} />
          </span>
        </div>
        <InfoRow icon={CalendarDays} label="Expected Close" value="25 Jul 2026" divider />
        <InfoRow icon={Share2} label="Source" value="Referral" divider />
        <InfoRow icon={Users} label="Creators" value="40" divider />
      </div>

      {/* --------------------------- contact person --------------------------- */}
      <SectionLabel top={758}>Contact Person</SectionLabel>
      <div className="absolute left-[20px] top-[780px] flex h-[64px] w-[350px] items-center rounded-[20px] border border-black/[0.05] bg-white px-[14px] shadow-[0_4px_16px_rgba(0,0,0,0.04)]">
        <span className="h-[42px] w-[42px] shrink-0 rounded-full bg-gradient-to-br from-[#FFD6E7] to-[#C8B3ED]" />
        <div className="ml-[11px] min-w-0 flex-1">
          <div className="text-[14px] font-medium leading-none text-ink/90">Priya Sharma</div>
          <div className="mt-[5px] text-[11.5px] font-light leading-none text-ink/50">+91 98765 43210</div>
        </div>
        <div className="flex items-center gap-[9px]">
          <span className="flex h-[36px] w-[36px] items-center justify-center rounded-full border border-[#EDEBF2] bg-white shadow-[0_2px_6px_rgba(0,0,0,0.06)]">
            <Phone className="h-[16px] w-[16px] text-ink/80" strokeWidth={1.7} />
          </span>
          <img src={whatsapp} alt="WhatsApp" className="h-[36px] w-[36px]" />
        </div>
      </div>

      {/* ----------------------------- action bar ----------------------------- */}
      <div className="absolute inset-x-[20px] bottom-[24px] flex items-center gap-[12px]">
        <button className="flex h-[52px] flex-1 items-center justify-center gap-[8px] rounded-[16px] border border-black/[0.06] bg-white text-[14px] font-medium text-ink shadow-[0_4px_16px_rgba(0,0,0,0.05)]">
          <MessageCircle className="h-[18px] w-[18px] text-ink/80" strokeWidth={1.8} />
          Message
        </button>
        <button className="flex h-[52px] flex-1 items-center justify-center gap-[8px] rounded-[16px] bg-ink text-[14px] font-medium text-white shadow-[0_8px_20px_rgba(0,0,0,0.22)]">
          <ArrowUpRight className="h-[18px] w-[18px] text-white" strokeWidth={2} />
          Convert Lead
        </button>
      </div>
    </div>
  );
}
