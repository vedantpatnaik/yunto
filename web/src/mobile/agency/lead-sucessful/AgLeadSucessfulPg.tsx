import {
  Check,
  ChevronLeft,
  Signal,
  Wifi,
  BatteryFull,
  ArrowRight,
  Plus,
} from "lucide-react";

/**
 * Agency app — Lead Successful (Figma frame 4100:60788, "lead sucessful",
 * 375×938), rendered inside the 390px MobileFrame. This is the success
 * confirmation shown at the end of the "Add Lead" flow (siblings addlead
 * 7695:8012 and add-lead-barter 4100:60575) — a full-screen celebratory
 * confirmation, not a tab screen, so it carries its own status bar and a
 * back control but NO bottom nav.
 *
 * NOTE: The Figma REST geometry endpoints (`/nodes`, `/images`) were hard
 * rate-limited for the entire build window — they return HTTP 429
 * ("Rate limit exceeded") with a multi-day retry-after because the day's
 * plan-level API cost budget was already spent by the sibling screens
 * (the `/me` endpoint still returns 200, so the token is valid; only the
 * cost-based geometry endpoints are throttled), and the Figma MCP tools hit
 * the Starter-plan "tool call limit" paywall. The cached full-document dump
 * (figma_depth2.json) resolves this frame to a childless leaf at (13954,
 * 13457) 375×938, so no per-node geometry or render could be pulled. The
 * layout is therefore reconstructed pixel-faithfully from the verified
 * references that share this exact design system:
 *   • the sibling mobile chrome (AgencyLeadsPage / AgencyAddleadPg / the
 *     4100-batch AgDetailViewOperationsPg) — status bar, lavender wash header,
 *     40px round white back button, white cards with soft shadow, ink primary
 *     button, Outfit via font-sans, 20px side margins / 350px content width;
 *   • the verified created-lead content (features/leads + the Lead-Details
 *     sibling) — Stellar Talents / Influencer Management, the green agency
 *     avatar #1FB37A, and the ₹8L / 4.5% ER / 40-creators stat trio.
 * Re-run against node 4100:60788 to pin pixel-exact coordinates once the
 * Figma API budget resets.
 */
export default function AgLeadSucessfulPg() {
  return (
    <div
      className="relative w-[390px] overflow-hidden bg-[#F5F3FA] font-sans text-ink"
      style={{ height: 938 }}
    >
      {/* soft brand wash behind the header / emblem */}
      <div className="absolute inset-x-0 top-0 h-[430px] bg-gradient-to-b from-[#E9E1FA] to-[#F5F3FA]" />

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

      {/* celebratory confetti dots around the emblem */}
      <span className="absolute left-[74px] top-[176px] h-[8px] w-[8px] rotate-12 rounded-[2px] bg-[#DCFF68]" />
      <span className="absolute right-[70px] top-[168px] h-[7px] w-[7px] rounded-full bg-[#C8B3ED]" />
      <span className="absolute left-[58px] top-[300px] h-[6px] w-[6px] rounded-full bg-[#FFB0B1]" />
      <span className="absolute right-[62px] top-[318px] h-[9px] w-[9px] -rotate-12 rounded-[2px] bg-[#A9CEE6]" />
      <span className="absolute right-[104px] top-[132px] h-[5px] w-[5px] rounded-full bg-[#1FB37A]" />
      <span className="absolute left-[112px] top-[128px] h-[6px] w-[6px] rounded-[2px] bg-[#C8B3ED]" />

      {/* success emblem — concentric halos + green core with a check */}
      <div className="absolute inset-x-0 top-[152px] flex justify-center">
        <div className="relative h-[192px] w-[192px]">
          <span className="absolute inset-0 rounded-full bg-[#2FB871]/[0.08]" />
          <span className="absolute inset-[24px] rounded-full bg-[#2FB871]/[0.14]" />
          <span className="absolute inset-[46px] flex items-center justify-center rounded-full bg-gradient-to-br from-[#3ED17E] to-[#17A96E] shadow-[0_14px_34px_rgba(23,169,110,0.40)]">
            <Check className="h-[52px] w-[52px] text-white" strokeWidth={3} />
          </span>
        </div>
      </div>

      {/* headline */}
      <h1 className="absolute inset-x-0 top-[392px] text-center text-[26px] font-medium leading-none text-ink">
        Lead Added Successfully!
      </h1>

      {/* subtext */}
      <p className="absolute inset-x-[45px] top-[430px] text-center text-[14px] font-light leading-[21px] text-ink/55">
        Your new lead has been created and added to your sales pipeline.
      </p>

      {/* created-lead summary card */}
      <div className="absolute left-[20px] top-[512px] w-[350px] rounded-[20px] bg-white p-[16px] shadow-[0_6px_22px_rgba(0,0,0,0.06)]">
        {/* agency header */}
        <div className="flex items-center gap-[11px]">
          <span className="flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-full bg-[#1FB37A]">
            <Check className="h-[22px] w-[22px] text-white" strokeWidth={2.4} />
          </span>
          <div>
            <div className="text-[15px] font-medium leading-[18px] text-ink/90">
              Stellar Talents
            </div>
            <div className="text-[11px] font-light leading-[14px] text-ink/55">
              Influencer Management
            </div>
          </div>
        </div>

        {/* divider */}
        <div className="mt-[15px] h-px w-full bg-line/70" />

        {/* stat trio */}
        <div className="mt-[15px] flex items-stretch">
          <div className="flex flex-1 flex-col items-center gap-[3px]">
            <span className="text-[18px] font-medium leading-none text-ink">₹8L</span>
            <span className="text-[11px] font-light leading-none text-ink/50">
              Deal Value
            </span>
          </div>
          <div className="w-px bg-line/70" />
          <div className="flex flex-1 flex-col items-center gap-[3px]">
            <span className="text-[18px] font-medium leading-none text-ink">4.5%</span>
            <span className="text-[11px] font-light leading-none text-ink/50">
              Engagement
            </span>
          </div>
          <div className="w-px bg-line/70" />
          <div className="flex flex-1 flex-col items-center gap-[3px]">
            <span className="text-[18px] font-medium leading-none text-ink">40</span>
            <span className="text-[11px] font-light leading-none text-ink/50">
              Creators
            </span>
          </div>
        </div>
      </div>

      {/* primary — view the created lead */}
      <button className="absolute left-[20px] top-[798px] flex h-[56px] w-[350px] items-center justify-center gap-[9px] rounded-[16px] bg-ink shadow-[0_10px_26px_rgba(20,10,50,0.28)]">
        <span className="text-[16px] font-normal leading-none text-white">
          View Lead
        </span>
        <ArrowRight className="h-[18px] w-[18px] text-white" strokeWidth={2} />
      </button>

      {/* secondary — add another */}
      <button className="absolute left-[20px] top-[866px] flex h-[56px] w-[350px] items-center justify-center gap-[8px] rounded-[16px] border border-line/70 bg-white">
        <Plus className="h-[18px] w-[18px] text-ink" strokeWidth={1.9} />
        <span className="text-[15px] font-normal leading-none text-ink">
          Add Another Lead
        </span>
      </button>
    </div>
  );
}
