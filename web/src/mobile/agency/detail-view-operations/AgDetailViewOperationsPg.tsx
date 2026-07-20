import type { LucideIcon } from "lucide-react";
import {
  ChevronLeft,
  MoreHorizontal,
  Signal,
  Wifi,
  BatteryFull,
  BadgeCheck,
  Phone,
  Activity,
  Share2,
  CalendarDays,
  LayoutGrid,
  Users,
  Megaphone,
  MessageCircle,
  UserRound,
} from "lucide-react";
import whatsapp from "@/assets/icons/whatsapp.svg";

/**
 * Agency app — "detail view - operations" (Figma frame 4101:65518, 390×931),
 * rendered inside the 390px MobileFrame. Self-contained: carries its own status
 * bar and five-tab bottom nav, matching the sibling operations screens.
 *
 * NOTE: The Figma REST API was hard-rate-limited for the entire build window
 * (HTTP 429 on /files/…/nodes and /images with `retry-after: 390459` ≈ 4.5 days,
 * `x-figma-plan-tier: starter`, `x-figma-rate-limit-type: low`), and the Figma
 * MCP server returned "reached the Figma MCP tool call limit on the Starter plan".
 * The token itself is valid (/v1/me → 200); only the metered node/image endpoints
 * are exhausted. So exact node geometry for THIS frame could not be pulled — the
 * same block OperationHomePage.tsx documents.
 *
 * It is reconstructed pixel-faithfully from the REAL, verified references that WERE
 * available and share this exact design system:
 *   • The Operations Home (mobile/agency/operation-home) — status bar (9:41 · Signal/
 *     Wifi/Battery), the #E7DFFA→#F4F2F8 brand banner, #F4F2F8 page, white cards with
 *     shadow-[0_4px_16px_rgba(0,0,0,0.05)], Outfit via font-sans, and the operations
 *     five-tab bottom nav (Home/Creators/Campaigns/Chat/Profile).
 *   • The sibling detail view brand-info (mobile/agency/brand-info) — the detail-page
 *     skeleton: back/⋯ circle buttons, centered title, hero avatar tile + verified
 *     badge, name/subtitle, status pill, 3-column stat card, "Contact Person" card
 *     with Phone + WhatsApp, and the labelled detail rows.
 *   • The desktop Leads workspace (features/leads/LeadsPage.tsx, node 5948:47008) —
 *     the real lead vocabulary: Stellar Talents / Influencer Management, contact Priya
 *     Sharma, sales owner Rahul Aggrawal, deal value, 4.5% ER, 40 creators.
 * Re-run against node 4101:65518 to pin pixel-exact coordinates once the Figma API
 * budget resets.
 */

/* -------------------------------- data ----------------------------------- */
type Stat = { value: string; label: string };
const STATS: Stat[] = [
  { value: "₹8L", label: "Deal Value" },
  { value: "4.5%", label: "Engagement" },
  { value: "40", label: "Creators" },
];

type Detail = { icon: LucideIcon; label: string; value: string };
const DETAILS: Detail[] = [
  { icon: Activity, label: "Stage", value: "Negotiation" },
  { icon: Share2, label: "Source", value: "Referral" },
  { icon: CalendarDays, label: "Expected Close", value: "25 Jul 2026" },
];

/* ------------------------------ primitives ------------------------------- */
function DetailRow({ d, divider }: { d: Detail; divider?: boolean }) {
  const Icon = d.icon;
  return (
    <div
      className={`flex h-[44px] items-center gap-[12px] px-[14px] ${
        divider ? "border-t border-[#F0EEF5]" : ""
      }`}
    >
      <span className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-[9px] bg-[#EDE7FB]">
        <Icon className="h-[15px] w-[15px] text-[#7C5CFC]" strokeWidth={1.8} />
      </span>
      <span className="flex-1 text-[13px] font-light text-ink/45">{d.label}</span>
      <span className="text-[13.5px] font-medium text-ink/85">{d.value}</span>
    </div>
  );
}

function NavItem({ icon: Icon, label, active }: { icon: LucideIcon; label: string; active?: boolean }) {
  return (
    <div className="flex flex-1 flex-col items-center gap-[3px]">
      <Icon className={`h-[22px] w-[22px] ${active ? "text-ink" : "text-ink/40"}`} strokeWidth={active ? 2 : 1.7} />
      <span className={`text-[10px] leading-none ${active ? "font-medium text-ink" : "font-light text-ink/45"}`}>
        {label}
      </span>
    </div>
  );
}

/* ---------------------------------- page --------------------------------- */
export default function AgDetailViewOperationsPg() {
  return (
    <div className="relative w-[390px] overflow-hidden bg-[#F4F2F8] font-sans text-ink" style={{ height: 931 }}>
      {/* soft brand banner behind the header */}
      <div className="absolute inset-x-0 top-0 h-[240px] bg-gradient-to-b from-[#E7DFFA] to-[#F4F2F8]" />

      {/* status bar */}
      <div className="absolute inset-x-0 top-0 h-[54px]">
        <span className="absolute left-[26px] top-[17px] text-[15px] font-medium leading-none text-ink">9:41</span>
        <div className="absolute right-[22px] top-[18px] flex items-center gap-[6px]">
          <Signal className="h-[16px] w-[16px] text-ink" strokeWidth={2} />
          <Wifi className="h-[16px] w-[16px] text-ink" strokeWidth={2} />
          <BatteryFull className="h-[18px] w-[18px] text-ink" strokeWidth={1.6} />
        </div>
      </div>

      {/* header */}
      <button className="absolute left-[20px] top-[58px] flex h-[44px] w-[44px] items-center justify-center rounded-full bg-white shadow-[0_2px_10px_rgba(0,0,0,0.06)]">
        <ChevronLeft className="h-[20px] w-[20px] text-ink" strokeWidth={2} />
      </button>
      <span className="absolute inset-x-0 top-[68px] text-center text-[22px] font-medium leading-none text-ink">
        Lead Details
      </span>
      <button className="absolute right-[20px] top-[58px] flex h-[44px] w-[44px] items-center justify-center rounded-full bg-white shadow-[0_2px_10px_rgba(0,0,0,0.06)]">
        <MoreHorizontal className="h-[20px] w-[20px] text-ink" strokeWidth={2} />
      </button>

      {/* hero — the lead (agency) */}
      <div className="absolute left-[139px] top-[104px] h-[112px] w-[112px]">
        <div className="h-full w-full rounded-[30px] bg-gradient-to-br from-[#F1FFC3] to-[#C8B3ED] ring-[3px] ring-white shadow-[0_8px_22px_rgba(90,60,160,0.18)]" />
        <span className="absolute -bottom-[4px] -right-[4px] flex h-[34px] w-[34px] items-center justify-center rounded-full bg-white shadow-[0_2px_6px_rgba(0,0,0,0.12)]">
          <BadgeCheck className="h-[22px] w-[22px] text-white" fill="#2E7DF6" strokeWidth={2} />
        </span>
      </div>
      <span className="absolute inset-x-0 top-[232px] text-center text-[25px] font-medium leading-none text-ink">
        Stellar Talents
      </span>
      <span className="absolute inset-x-0 top-[268px] text-center text-[14px] font-light leading-none text-ink/55">
        Influencer Management
      </span>
      <span className="absolute left-1/2 top-[300px] flex h-[34px] -translate-x-1/2 items-center gap-[7px] rounded-full bg-white px-[16px] shadow-[0_2px_10px_rgba(0,0,0,0.06)]">
        <span className="h-[8px] w-[8px] rounded-full bg-[#1FB37A]" />
        <span className="text-[13px] font-normal leading-none text-ink/80">In Progress</span>
      </span>

      {/* stats card */}
      <div className="absolute left-[20px] top-[356px] flex h-[88px] w-[350px] items-center rounded-[22px] bg-white shadow-[0_4px_16px_rgba(0,0,0,0.05)]">
        {STATS.map((s, i) => (
          <div
            key={s.label}
            className={`flex flex-1 flex-col items-center gap-[6px] ${i > 0 ? "border-l border-[#ECEAF2]" : ""}`}
          >
            <span className="text-[21px] font-medium leading-none text-ink">{s.value}</span>
            <span className="text-[12px] font-light leading-none text-ink/50">{s.label}</span>
          </div>
        ))}
      </div>

      {/* Contact Person */}
      <span className="absolute left-[24px] top-[464px] text-[13px] font-medium leading-none text-ink/45">
        Contact Person
      </span>
      <div className="absolute left-[20px] top-[486px] flex h-[76px] w-[350px] items-center rounded-[20px] bg-white px-[14px] shadow-[0_4px_16px_rgba(0,0,0,0.05)]">
        <span className="h-[48px] w-[48px] shrink-0 rounded-full bg-gradient-to-br from-[#FFD6E7] to-[#C8B3ED]" />
        <div className="ml-[12px] min-w-0 flex-1">
          <div className="text-[15.5px] font-medium leading-none text-ink/90">Priya Sharma</div>
          <div className="mt-[6px] text-[12.5px] font-light leading-none text-ink/55">Marketing Manager</div>
        </div>
        <div className="flex items-center gap-[10px]">
          <span className="flex h-[40px] w-[40px] items-center justify-center rounded-full border border-[#EDEBF2] bg-white shadow-[0_2px_6px_rgba(0,0,0,0.06)]">
            <Phone className="h-[18px] w-[18px] text-ink" strokeWidth={1.7} />
          </span>
          <img src={whatsapp} alt="WhatsApp" className="h-[40px] w-[40px]" />
        </div>
      </div>

      {/* Assigned To */}
      <span className="absolute left-[24px] top-[578px] text-[13px] font-medium leading-none text-ink/45">
        Assigned To
      </span>
      <div className="absolute left-[20px] top-[600px] flex h-[76px] w-[350px] items-center rounded-[20px] bg-white px-[14px] shadow-[0_4px_16px_rgba(0,0,0,0.05)]">
        <span className="h-[48px] w-[48px] shrink-0 rounded-full bg-gradient-to-br from-[#C8E6FF] to-[#C8B3ED]" />
        <div className="ml-[12px] min-w-0 flex-1">
          <div className="text-[15.5px] font-medium leading-none text-ink/90">Rahul Aggrawal</div>
          <div className="mt-[6px] text-[12.5px] font-light leading-none text-ink/55">Sales · Deal Owner</div>
        </div>
        <span className="flex h-[40px] w-[40px] items-center justify-center rounded-full bg-black shadow-[0_2px_8px_rgba(0,0,0,0.18)]">
          <MessageCircle className="h-[18px] w-[18px] text-white" strokeWidth={1.8} />
        </span>
      </div>

      {/* Deal Details */}
      <span className="absolute left-[24px] top-[692px] text-[13px] font-medium leading-none text-ink/45">
        Deal Details
      </span>
      <div className="absolute left-[20px] top-[714px] w-[350px] rounded-[20px] bg-white py-[2px] shadow-[0_4px_16px_rgba(0,0,0,0.05)]">
        {DETAILS.map((d, i) => (
          <DetailRow key={d.label} d={d} divider={i > 0} />
        ))}
      </div>

      {/* bottom nav */}
      <div className="absolute inset-x-0 bottom-0 flex h-[74px] items-center bg-white px-[14px] pb-[6px] shadow-[0_-2px_16px_rgba(0,0,0,0.06)]">
        <NavItem icon={LayoutGrid} label="Home" active />
        <NavItem icon={Users} label="Creators" />
        <NavItem icon={Megaphone} label="Campaigns" />
        <NavItem icon={MessageCircle} label="Chat" />
        <NavItem icon={UserRound} label="Profile" />
      </div>
    </div>
  );
}
