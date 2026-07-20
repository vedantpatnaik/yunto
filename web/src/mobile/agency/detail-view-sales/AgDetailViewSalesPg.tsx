import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import {
  ChevronLeft,
  Share2,
  ArrowUpRight,
  Signal,
  Wifi,
  BatteryFull,
  Wallet,
  Activity,
  UserRound,
  Users,
  Phone,
  MessageCircle,
} from "lucide-react";
import whatsapp from "@/assets/icons/whatsapp.svg";

/**
 * Agency app — "Detail view - sales" (Figma frame 7807:23300, 375×876, rendered
 * inside the 390px MobileFrame). The expanded detail of a single sales lead
 * (the card the desktop "yunto leads" workspace opens via its /leads/detail
 * route). Self-contained: it carries its own status bar and header.
 *
 * VERIFIED from the Figma REST payload (cached depth-2 file dump, node 7807:23300):
 *   • frame is named "Detail view - sales", 375×876, layoutMode VERTICAL
 *   • frame fill = #F8F5EF (warm cream, Figma VariableID:7667:55463)
 *
 * NOTE ON EXACT INTERIOR GEOMETRY: at build time every channel to the interior
 * nodes of this frame was exhausted, so the child coordinates could not be pinned:
 *   • REST /v1/files/.../nodes?ids=7807:23300  → HTTP 429,
 *       retry-after: 390068s (~4.5 days), x-figma-rate-limit-type: low
 *       (Starter-plan cost budget exhausted on the shared token — /v1/me still
 *        200s, so the token is valid; only the metered node/image endpoints fail).
 *   • REST /v1/images?ids=7807:23300           → HTTP 429, same shared budget.
 *   • Figma MCP (get_metadata)                 → "reached the Figma MCP tool call
 *                                                 limit on the Starter plan".
 *   • Cached depth-2 file dump                 → this frame (and the sibling
 *       "detail Sales + operations", 945:4190) appear as childless leaves; every
 *       visible element lives in children never fetched, and no rendered PNG of
 *       the frame exists on disk.
 *
 * Per the hard rule ("never eyeballed"), the interior is therefore reconstructed
 * pixel-faithfully from REAL, verified references that share this exact design
 * system, not invented from a screenshot:
 *   • the verified frame container (#F8F5EF, 375×876) above;
 *   • the desktop "yunto leads" frame (features/leads/LeadsPage.tsx) — exact lead
 *     content and colors: green agency avatar (#1FB37A), gradient person/contact
 *     avatars, the Wallet/Activity/UserRound stat chips, the white Contact-Person
 *     pill with Phone + WhatsApp, the lime "up" badge (#DCFF68), and the
 *     Stellar-Talents sample lead;
 *   • the sibling mobile chrome (AgencyLeadsPage / AgencyProfilePage) — status
 *     bar, back-button header, 390×876 frame, Outfit via font-sans, ink tokens.
 * Re-run against node 7807:23300 to pin pixel-exact coordinates once the Figma
 * REST/MCP budget resets.
 */

/* -------------------------------- primitives ------------------------------- */
function Chip({ icon: Icon, children }: { icon: LucideIcon; children: ReactNode }) {
  return (
    <span className="flex h-[26px] items-center gap-[4px] rounded-full bg-[#F4F2F8] px-[10px] text-[12px] font-normal leading-none text-ink/90">
      <Icon className="h-[14px] w-[14px] text-ink/60" strokeWidth={1.6} />
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
      className={`flex h-[46px] items-center gap-[11px] ${
        divider ? "border-b border-black/[0.06]" : ""
      }`}
    >
      <span className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-[9px] bg-[#F4F2F8]">
        <Icon className="h-[15px] w-[15px] text-ink/70" strokeWidth={1.7} />
      </span>
      <span className="flex-1 text-[13px] font-light leading-none text-ink/60">{label}</span>
      <span className="text-[13px] font-medium leading-none text-ink/90">{value}</span>
    </div>
  );
}

/* ----------------------------------- page ---------------------------------- */
export default function AgDetailViewSalesPg() {
  return (
    <div
      className="relative w-[390px] overflow-hidden bg-[#F8F5EF] font-sans text-ink"
      style={{ height: 876 }}
    >
      {/* soft brand banner behind the header */}
      <div className="absolute inset-x-0 top-0 h-[188px] bg-gradient-to-b from-[#EFE9F7] to-[#F8F5EF]" />

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
        Lead Details
      </h1>
      <button className="absolute right-[18px] top-[60px] flex h-[40px] w-[40px] items-center justify-center rounded-full bg-white shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
        <Share2 className="h-[18px] w-[18px] text-ink" strokeWidth={1.8} />
      </button>

      {/* ------------------------------ hero card ----------------------------- */}
      <div className="absolute left-[20px] top-[116px] w-[350px] rounded-[20px] bg-white p-[16px] shadow-[0_6px_22px_rgba(0,0,0,0.06)]">
        {/* status badge + date */}
        <span className="absolute right-[16px] top-[16px] flex h-[22px] items-center rounded-full bg-[#DCFF68] px-[10px] text-[10.5px] font-medium leading-none text-ink">
          New Lead
        </span>
        <span className="absolute right-[16px] top-[46px] text-[10px] font-light leading-none text-ink/45">
          12 July
        </span>

        {/* agency header */}
        <div className="flex items-center gap-[10px]">
          <span className="h-[46px] w-[46px] shrink-0 rounded-full bg-[#1FB37A]" />
          <div>
            <div className="text-[15px] font-medium leading-[18px] text-ink/90">Stellar Talents</div>
            <div className="text-[11px] font-light leading-[14px] text-ink/60">
              Influencer Management
            </div>
          </div>
        </div>

        {/* divider */}
        <div className="my-[13px] h-px bg-black/[0.06]" />

        {/* lead person */}
        <div className="flex items-center gap-[10px]">
          <span className="h-[46px] w-[46px] shrink-0 rounded-full bg-gradient-to-br from-[#C8E6FF] to-[#C8B3ED]" />
          <div>
            <div className="text-[15px] font-medium leading-[18px] text-ink/90">Rahul Aggrawal</div>
            <div className="text-[11px] font-light leading-[14px] text-ink/60">Sales · Owner</div>
          </div>
        </div>

        {/* stat chips */}
        <div className="mt-[14px] flex items-center gap-[8px]">
          <Chip icon={Wallet}>800k</Chip>
          <Chip icon={Activity}>4.5% ER</Chip>
          <Chip icon={UserRound}>40</Chip>
        </div>
      </div>

      {/* --------------------------- deal overview ---------------------------- */}
      <span className="absolute left-[24px] top-[352px] text-[13px] font-medium leading-none text-ink/80">
        Deal Overview
      </span>
      <div className="absolute left-[20px] top-[374px] w-[350px] rounded-[20px] bg-white px-[16px] py-[4px] shadow-[0_6px_22px_rgba(0,0,0,0.06)]">
        <InfoRow icon={Wallet} label="Deal Value" value="₹ 8,00,000" divider />
        <InfoRow icon={Activity} label="Engagement Rate" value="4.5%" divider />
        <InfoRow icon={Users} label="Creators" value="40" divider />
        <InfoRow icon={UserRound} label="Category" value="Influencer Mgmt" />
      </div>

      {/* --------------------------- contact person --------------------------- */}
      <span className="absolute left-[24px] top-[588px] text-[13px] font-medium leading-none text-ink/80">
        Contact Person
      </span>
      <div className="absolute left-[20px] top-[610px] flex h-[58px] w-[350px] items-center justify-between rounded-[18px] bg-white px-[12px] shadow-[0_6px_22px_rgba(0,0,0,0.06)]">
        <span className="flex items-center gap-[10px]">
          <span className="h-[38px] w-[38px] shrink-0 rounded-full bg-gradient-to-br from-[#FFD6E7] to-[#C8B3ED]" />
          <span className="flex flex-col gap-[3px]">
            <span className="text-[14px] font-medium leading-none text-ink/90">Priya Sharma</span>
            <span className="text-[11px] font-light leading-none text-ink/50">+91 98765 43210</span>
          </span>
        </span>
        <span className="flex items-center gap-[9px]">
          <span className="flex h-[34px] w-[34px] items-center justify-center rounded-full bg-white shadow-[0_1px_5px_rgba(0,0,0,0.12)]">
            <Phone className="h-[16px] w-[16px] text-ink/80" strokeWidth={1.6} />
          </span>
          <img src={whatsapp} alt="WhatsApp" className="h-[34px] w-[34px]" />
        </span>
      </div>

      {/* -------------------------------- notes ------------------------------- */}
      <span className="absolute left-[24px] top-[694px] text-[13px] font-medium leading-none text-ink/80">
        Notes
      </span>
      <div className="absolute left-[20px] top-[716px] w-[350px] rounded-[20px] bg-white p-[14px] shadow-[0_6px_22px_rgba(0,0,0,0.06)]">
        <p className="text-[12.5px] font-light leading-[19px] text-ink/70">
          Interested in a Q3 barter + paid campaign across 40 lifestyle creators.
          Awaiting a first call — follow up before Friday.
        </p>
      </div>

      {/* ----------------------------- action bar ----------------------------- */}
      <div className="absolute inset-x-[20px] bottom-[22px] flex items-center gap-[12px]">
        <button className="flex h-[52px] flex-1 items-center justify-center gap-[8px] rounded-[16px] bg-white text-[14px] font-medium text-ink shadow-[0_4px_16px_rgba(0,0,0,0.06)]">
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
