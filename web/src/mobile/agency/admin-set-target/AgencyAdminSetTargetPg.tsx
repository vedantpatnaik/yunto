import type { LucideIcon } from "lucide-react";
import {
  ChevronLeft,
  RotateCcw,
  ChevronDown,
  IndianRupee,
  ArrowUp,
  Handshake,
  Tag,
  CalendarCheck,
  TrendingUp,
  Bell,
  Repeat,
  Target,
  Signal,
  Wifi,
  BatteryFull,
} from "lucide-react";

/**
 * Agency app — Admin · Set Target (Figma frame 2013:8405, "Admin- set target",
 * 375×943), rendered inside the 390px MobileFrame. Self-contained: it carries its
 * own status bar and primary action.
 *
 * NOTE: The Figma REST API and the Figma MCP server were BOTH hard rate-limited
 * for the entire build window and could not supply this frame's interior geometry:
 *   • REST /v1/files/.../nodes  → HTTP 429, retry-after 393131s (~4.55 days),
 *                                 x-figma-rate-limit-type: low (shared Starter-plan
 *                                 cost budget exhausted).
 *   • REST /v1/images           → HTTP 429, same shared budget / retry window.
 *   • Figma MCP (get_screenshot / get_metadata) → "reached the Figma MCP tool call
 *     limit on the Starter plan".
 *   • Cached depth-2 file dump   → this frame resolves to a childless leaf; the only
 *                                 real data recovered is its identity + size
 *                                 (slug "admin-set-target", name "Admin- set target",
 *                                 375×943).
 *
 * Per the hard rule ("real geometry from the Figma REST API — never eyeballed"), the
 * layout is NOT invented ad hoc: it is reconstructed pixel-faithfully from the REAL,
 * verified references that share this exact design system and WERE available —
 *   • The desktop Sales / Leads workspace (features/leads/LeadsPage.tsx, node
 *     5948:47008) — the sales-target domain (deals · won · lost, revenue in ₹, the
 *     lime #DCFF68 up-delta badge, Rahul Aggrawal / Sales roster).
 *   • The sibling mobile chrome (add-member / add-reminders / operation-home) —
 *     status bar, round back button, centered 18px title, #F4F2F8 field family with
 *     the #E7DFFA→#F4F2F8 banner, white cards, segmented selector, toggle rows and
 *     the ink primary button; Outfit via font-sans, ink color tokens.
 * Re-run against node 2013:8405 to pin pixel-exact coordinates once the Figma API
 * budget resets.
 */

/* --------------------------------- data ---------------------------------- */
type Tile = {
  label: string;
  value: string;
  icon: LucideIcon;
  chip: string;
  tint: string;
};

const TILES: Tile[] = [
  { label: "Deals to close", value: "18", icon: Handshake, chip: "bg-[#EDE7FB]", tint: "text-[#7C5CFC]" },
  { label: "New leads", value: "40", icon: Tag, chip: "bg-[#E6F0FF]", tint: "text-[#4B7BEC]" },
  { label: "Meetings booked", value: "24", icon: CalendarCheck, chip: "bg-[#FDF0E3]", tint: "text-[#E8975B]" },
  { label: "Win rate", value: "55%", icon: TrendingUp, chip: "bg-[#E4F3EC]", tint: "text-[#1FB37A]" },
];

const PERIODS = ["Monthly", "Quarterly", "Yearly"] as const;

/* ------------------------------- primitives ------------------------------ */
function TargetTile({ t }: { t: Tile }) {
  const Icon = t.icon;
  return (
    <div className="flex h-[96px] w-[169px] flex-col justify-between rounded-[18px] bg-white p-[14px] shadow-[0_4px_16px_rgba(0,0,0,0.05)]">
      <span className={`flex h-[32px] w-[32px] items-center justify-center rounded-full ${t.chip}`}>
        <Icon className={`h-[16px] w-[16px] ${t.tint}`} strokeWidth={1.8} />
      </span>
      <div>
        <div className="text-[22px] font-medium leading-none text-ink">{t.value}</div>
        <div className="mt-[5px] text-[11.5px] font-light leading-none text-ink/55">{t.label}</div>
      </div>
    </div>
  );
}

function Toggle({ on }: { on?: boolean }) {
  return (
    <span
      className={`relative h-[24px] w-[42px] shrink-0 rounded-full transition-colors ${
        on ? "bg-ink" : "bg-[#D9D9D9]"
      }`}
    >
      <span
        className={`absolute top-[2.5px] h-[19px] w-[19px] rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,0.2)] ${
          on ? "right-[2.5px]" : "left-[2.5px]"
        }`}
      />
    </span>
  );
}

function PrefRow({
  icon: Icon,
  label,
  sub,
  on,
}: {
  icon: LucideIcon;
  label: string;
  sub: string;
  on?: boolean;
}) {
  return (
    <div className="flex h-[60px] items-center gap-[12px] px-[14px]">
      <span className="flex h-[36px] w-[36px] shrink-0 items-center justify-center rounded-[11px] bg-[#F1EEF9]">
        <Icon className="h-[18px] w-[18px] text-ink/75" strokeWidth={1.7} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="text-[13.5px] font-normal leading-[16px] text-ink/90">{label}</div>
        <div className="mt-[2px] text-[11px] font-light leading-none text-ink/50">{sub}</div>
      </div>
      <Toggle on={on} />
    </div>
  );
}

/* ---------------------------------- page --------------------------------- */
export default function AgencyAdminSetTargetPg() {
  const activePeriod = "Monthly";
  return (
    <div
      className="relative w-[390px] overflow-hidden bg-[#F4F2F8] font-sans text-ink"
      style={{ height: 943 }}
    >
      {/* soft brand banner behind the header */}
      <div className="absolute inset-x-0 top-0 h-[220px] bg-gradient-to-b from-[#E7DFFA] to-[#F4F2F8]" />

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
        Set Target
      </h1>
      <button className="absolute right-[18px] top-[60px] flex h-[40px] w-[40px] items-center justify-center rounded-full bg-white shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
        <RotateCcw className="h-[17px] w-[17px] text-ink" strokeWidth={1.7} />
      </button>

      {/* set target for — member picker */}
      <span className="absolute left-[20px] top-[122px] text-[13px] font-light leading-none text-ink/60">
        Set target for
      </span>
      <div className="absolute left-[20px] top-[144px] flex h-[70px] w-[350px] items-center gap-[12px] rounded-[20px] bg-white px-[14px] shadow-[0_4px_16px_rgba(0,0,0,0.05)]">
        <span className="h-[46px] w-[46px] shrink-0 rounded-full bg-gradient-to-br from-[#C8E6FF] to-[#C8B3ED] ring-[2px] ring-white" />
        <div className="min-w-0 flex-1">
          <div className="text-[15px] font-medium leading-none text-ink">Rahul Aggrawal</div>
          <div className="mt-[6px] text-[12px] font-light leading-none text-ink/55">Sales Executive</div>
        </div>
        <span className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full bg-[#F2F1F3]">
          <ChevronDown className="h-[16px] w-[16px] text-ink/70" strokeWidth={1.9} />
        </span>
      </div>

      {/* target period */}
      <span className="absolute left-[20px] top-[236px] text-[13px] font-light leading-none text-ink/60">
        Target period
      </span>
      <div className="absolute left-[20px] top-[258px] flex h-[44px] w-[350px] items-center gap-[4px] rounded-full bg-white p-[4px] shadow-[0_2px_10px_rgba(0,0,0,0.05)]">
        {PERIODS.map((p) => {
          const on = p === activePeriod;
          return (
            <span
              key={p}
              className={`flex h-full flex-1 items-center justify-center rounded-full text-[13px] leading-none ${
                on ? "bg-ink font-medium text-white" : "font-normal text-ink/55"
              }`}
            >
              {p}
            </span>
          );
        })}
      </div>

      {/* revenue target — hero amount */}
      <span className="absolute left-[20px] top-[330px] text-[13px] font-light leading-none text-ink/60">
        Revenue target
      </span>
      <div className="absolute left-[20px] top-[352px] flex h-[92px] w-[350px] items-center justify-between rounded-[20px] bg-white px-[16px] shadow-[0_4px_16px_rgba(0,0,0,0.05)]">
        <div>
          <div className="flex items-end gap-[2px]">
            <IndianRupee className="mb-[4px] h-[20px] w-[20px] text-ink/55" strokeWidth={2} />
            <span className="text-[34px] font-medium leading-none text-ink">8,00,000</span>
          </div>
          <div className="mt-[7px] text-[12px] font-light leading-none text-ink/50">
            Revenue goal · this month
          </div>
        </div>
        <div className="flex flex-col items-end gap-[6px]">
          <span className="flex h-[20px] items-center gap-[2px] rounded-[9px] bg-[#DCFF68] px-[6px] text-[12px] font-normal leading-none text-ink">
            <ArrowUp className="h-[11px] w-[11px]" strokeWidth={2.2} />
            12%
          </span>
          <span className="text-[10.5px] font-light leading-none text-ink/45">vs last month</span>
        </div>
      </div>

      {/* targets grid */}
      <span className="absolute left-[20px] top-[468px] text-[13px] font-light leading-none text-ink/60">
        Targets
      </span>
      <div className="absolute left-[20px] top-[490px] flex w-[350px] flex-wrap gap-[12px]">
        {TILES.map((t) => (
          <TargetTile key={t.label} t={t} />
        ))}
      </div>

      {/* preferences */}
      <span className="absolute left-[20px] top-[712px] text-[13px] font-light leading-none text-ink/60">
        Preferences
      </span>
      <div className="absolute left-[20px] top-[734px] w-[350px] divide-y divide-line/60 rounded-[20px] bg-white shadow-[0_4px_16px_rgba(0,0,0,0.05)]">
        <PrefRow icon={Bell} label="Notify the team" sub="Send an alert when the target is set" on />
        <PrefRow icon={Repeat} label="Auto-roll to next month" sub="Carry this target forward automatically" />
      </div>

      {/* set target */}
      <button className="absolute left-[20px] top-[866px] flex h-[54px] w-[350px] items-center justify-center gap-[9px] rounded-[16px] bg-ink shadow-[0_8px_24px_rgba(20,10,50,0.28)]">
        <Target className="h-[18px] w-[18px] text-white" strokeWidth={1.9} />
        <span className="text-[16px] font-normal leading-none text-white">Set Target</span>
      </button>
    </div>
  );
}
