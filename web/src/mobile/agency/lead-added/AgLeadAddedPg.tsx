import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import {
  ChevronLeft,
  Signal,
  Wifi,
  BatteryFull,
  Check,
  Wallet,
  Tag,
  Users,
  Phone,
  ArrowRight,
  Plus,
} from "lucide-react";
import whatsapp from "@/assets/icons/whatsapp.svg";

/**
 * Agency app — "Lead Added" success confirmation (Figma frame 7700:12163,
 * "lead added", 375×876), rendered inside the 390px MobileFrame. This is the
 * full-screen success state the Add-Lead form (frame 7695:8012, "addlead")
 * transitions to after the user taps "Add Lead" — a checkmark hero, a summary
 * of the lead that was just created, and the follow-up actions (go to Leads /
 * add another). Frame facts confirmed from the cached document tree:
 * origin (-8839, 8301), size 375×876, sibling of "addlead" at (-9298, 8301)
 * on the same y row and sharing the warm off-white #F8F5EF shell.
 *
 * NOTE ON GEOMETRY SOURCE: The Figma REST geometry endpoints were hard
 * rate-limited for the entire build window — `/v1/images` and `/v1/nodes`
 * return HTTP 429 with `retry-after: 386645` (~4.5 days) on the Starter plan
 * (the `/v1/me` endpoint still returns 200, so the token is valid; only the
 * cost-based geometry endpoints are throttled), and every Figma MCP geometry
 * tool (get_metadata / get_design_context / get_screenshot) returns the
 * Starter-plan "tool call limit" paywall. The cached full-document dump is
 * depth-limited, so this frame resolves to a childless leaf and no per-node
 * render or child coordinates could be pulled. The layout is therefore
 * reconstructed to spec from (a) the confirmed frame facts above, (b) the
 * shared mobile-chrome idiom of the sibling Agency screens that use this exact
 * #F8F5EF shell (Add Lead / Add Reminders / Add Member — status bar, 40px
 * round back button, lavender header wash, white cards, ink primary button,
 * 20px side margins, lime #DCFF68 accent) and (c) the real lead data model
 * from the Leads workspace (src/features/leads/LeadsPage.tsx — Stellar Talents /
 * Influencer Management, budget + niche chips, contact-person call/WhatsApp
 * row). Re-run against node 7700:12163 to pin pixel-exact coordinates once the
 * Figma API budget resets.
 */

/* ------------------------------- primitives ------------------------------ */
function Chip({ icon: Icon, children }: { icon: LucideIcon; children: ReactNode }) {
  return (
    <span className="flex h-[28px] items-center gap-[5px] rounded-full bg-[#F4F5F5] px-[11px] text-[12px] font-normal leading-none text-ink/80">
      <Icon className="h-[14px] w-[14px] text-ink/45" strokeWidth={1.7} />
      {children}
    </span>
  );
}

/* ---------------------------------- page --------------------------------- */
export default function AgLeadAddedPg() {
  return (
    <div
      className="relative w-[390px] overflow-hidden bg-[#F8F5EF] font-sans text-ink"
      style={{ height: 876 }}
    >
      {/* soft lavender wash behind the header/hero */}
      <div className="absolute inset-x-0 top-0 h-[360px] bg-gradient-to-b from-[#EFE9FB] to-[#F8F5EF]" />

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

      {/* back button */}
      <button className="absolute left-[18px] top-[60px] flex h-[40px] w-[40px] items-center justify-center rounded-full bg-white shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
        <ChevronLeft className="h-[20px] w-[20px] text-ink" strokeWidth={1.8} />
      </button>

      {/* success hero */}
      <div className="absolute left-1/2 top-[132px] flex h-[148px] w-[148px] -translate-x-1/2 items-center justify-center rounded-full bg-white/70 shadow-[0_16px_40px_rgba(120,90,200,0.18)]">
        <span className="flex h-[108px] w-[108px] items-center justify-center rounded-full bg-ink">
          <Check className="h-[56px] w-[56px] text-[#DCFF68]" strokeWidth={2.4} />
        </span>
      </div>

      {/* headline */}
      <h1 className="absolute inset-x-0 top-[308px] text-center text-[26px] font-medium leading-none text-ink">
        Lead Added
      </h1>
      <p className="absolute inset-x-[45px] top-[346px] text-center text-[14px] font-light leading-[20px] text-ink/55">
        Your new lead has been created and added to your Leads workspace.
      </p>

      {/* summary card */}
      <div className="absolute left-[20px] top-[424px] w-[350px] rounded-[20px] bg-white p-[16px] shadow-[0_8px_28px_rgba(20,10,50,0.06)]">
        {/* brand row */}
        <div className="flex items-center gap-[10px]">
          <span className="h-[44px] w-[44px] shrink-0 rounded-full bg-[#1FB37A]" />
          <div className="min-w-0 flex-1">
            <div className="text-[15px] font-medium leading-[18px] text-ink">
              Stellar Talents
            </div>
            <div className="text-[12px] font-light leading-[15px] text-ink/55">
              Influencer Management
            </div>
          </div>
          <span className="flex h-[24px] items-center rounded-full bg-[#DCFF68] px-[10px] text-[11px] font-medium leading-none text-ink">
            New
          </span>
        </div>

        {/* chips */}
        <div className="mt-[14px] flex items-center gap-[7px]">
          <Chip icon={Wallet}>₹8,00,000</Chip>
          <Chip icon={Tag}>Fashion</Chip>
          <Chip icon={Users}>40</Chip>
        </div>

        {/* divider */}
        <div className="my-[14px] h-px w-full bg-line/60" />

        {/* contact person */}
        <span className="mb-[9px] block text-[12px] font-light leading-none text-ink/55">
          Contact Person
        </span>
        <div className="flex h-[46px] items-center justify-between rounded-[14px] bg-[#F8F5EF] px-[12px]">
          <span className="flex items-center gap-[9px]">
            <span className="h-[26px] w-[26px] rounded-full bg-gradient-to-br from-[#FFD6E7] to-[#C8B3ED]" />
            <span className="text-[13.5px] font-normal text-ink/90">Priya Sharma</span>
          </span>
          <span className="flex items-center gap-[8px]">
            <span className="flex h-[30px] w-[30px] items-center justify-center rounded-full bg-white shadow-[0_1px_5px_rgba(0,0,0,0.10)]">
              <Phone className="h-[15px] w-[15px] text-ink" strokeWidth={1.7} />
            </span>
            <img src={whatsapp} alt="WhatsApp" className="h-[30px] w-[30px]" />
          </span>
        </div>
      </div>

      {/* primary — go to leads */}
      <button className="absolute left-[20px] top-[726px] flex h-[54px] w-[350px] items-center justify-center gap-[8px] rounded-[16px] bg-ink shadow-[0_8px_24px_rgba(20,10,50,0.28)]">
        <span className="text-[16px] font-normal leading-none text-white">Go to Leads</span>
        <ArrowRight className="h-[18px] w-[18px] text-white" strokeWidth={1.9} />
      </button>

      {/* secondary — add another lead */}
      <button className="absolute left-[20px] top-[792px] flex h-[54px] w-[350px] items-center justify-center gap-[8px] rounded-[16px] border border-line/70 bg-white">
        <Plus className="h-[18px] w-[18px] text-ink" strokeWidth={1.9} />
        <span className="text-[16px] font-normal leading-none text-ink">Add Another Lead</span>
      </button>

      {/* home indicator */}
      <div className="absolute bottom-[9px] left-1/2 h-[5px] w-[134px] -translate-x-1/2 rounded-full bg-ink/25" />
    </div>
  );
}
