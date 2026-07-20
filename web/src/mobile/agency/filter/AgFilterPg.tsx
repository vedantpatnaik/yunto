import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import {
  ChevronLeft,
  RotateCcw,
  Check,
  Instagram,
  Tag,
  Users,
  Activity,
  Handshake,
  MapPin,
  UserRound,
  Signal,
  Wifi,
  BatteryFull,
} from "lucide-react";

/**
 * Agency app — Filter (Figma frame 4100:64406, "filter", 375×931), rendered
 * inside the 390px MobileFrame. Self-contained: it carries its own status bar.
 * This is the FULL-SCREEN filter overlay for the Creators flow — its cached
 * siblings on the "Agency ui" canvas are the row that reads
 * creators (4100:62999) → filter (this) / Sort by (4100:64089) / the compact
 * sort sheet (4100:64806) / creators detail (4100:63861). Being a modal-style
 * refine screen it has no bottom tab nav; instead it pins a fixed footer with
 * the primary Apply action.
 *
 * REAL geometry pinned from the cached full-document tree for THIS node: the
 * frame is 375×931 at origin (14961, 16966) with a single flat solid fill of
 * #FFFFFF (pure white) and a 24px corner radius — used verbatim as the page
 * background below (the 28px MobileFrame already clips the corners).
 *
 * NOTE: For the entire build window the Figma REST geometry endpoints returned
 * HTTP 429 ("Rate limit exceeded") — the cost-based /nodes and /images
 * endpoints report x-figma-rate-limit-type=low with retry-after ≈ 386597s
 * (~4.5 days) on the Starter plan (the /me endpoint still 200s, so the token is
 * valid; only the geometry endpoints are throttled), and the Figma MCP bridge
 * returns the Starter tool-call paywall. The cached document dump is depth-2
 * only, so this frame resolves with its own box + fill but ZERO child geometry,
 * and no per-node render could be pulled. Child layout is therefore
 * reconstructed from the shared design system (tailwind.config.ts tokens) and
 * the verified sibling chrome:
 *   • AgencyAllCreatorsPg / AgencyCreatorsPage (creators flow) — the status bar,
 *     white circular back button, centered 18px title, and the pill Chip idiom
 *     (h-30 rounded-full, bg-ink/white active vs. line-bordered inactive).
 *   • AgAllRequestsPg — the fixed footer action-button treatment.
 * Re-run against node 4100:64406 to pin pixel-exact coordinates once the Figma
 * API budget resets.
 */

/* --------------------------------- data ---------------------------------- */
type Option = { label: string; active?: boolean };
type Section = { icon: LucideIcon; label: string; options: Option[] };

const SECTIONS: Section[] = [
  {
    icon: Instagram,
    label: "Platform",
    options: [{ label: "Instagram", active: true }, { label: "YouTube" }, { label: "TikTok" }],
  },
  {
    icon: Tag,
    label: "Category",
    options: [
      { label: "Fashion", active: true },
      { label: "Beauty" },
      { label: "Fitness" },
      { label: "Food" },
      { label: "Tech" },
      { label: "Travel" },
      { label: "Lifestyle" },
    ],
  },
  {
    icon: Users,
    label: "Followers",
    options: [
      { label: "Under 10k" },
      { label: "10k – 50k", active: true },
      { label: "50k – 100k" },
      { label: "100k – 500k" },
      { label: "500k+" },
    ],
  },
  {
    icon: Activity,
    label: "Engagement rate",
    options: [{ label: "1 – 3%" }, { label: "3 – 5%", active: true }, { label: "5 – 8%" }, { label: "Above 8%" }],
  },
  {
    icon: Handshake,
    label: "Collaboration",
    options: [{ label: "Barter" }, { label: "Paid", active: true }, { label: "Both" }],
  },
  {
    icon: MapPin,
    label: "Location",
    options: [{ label: "Mumbai", active: true }, { label: "Delhi" }, { label: "Bangalore" }, { label: "Pune" }],
  },
  {
    icon: UserRound,
    label: "Gender",
    options: [{ label: "Any", active: true }, { label: "Female" }, { label: "Male" }],
  },
];

/* ------------------------------- primitives ------------------------------ */
function Chip({ label, active }: Option) {
  return (
    <span
      className={`flex h-[32px] shrink-0 items-center rounded-full text-[12.5px] leading-none ${
        active
          ? "bg-ink pl-[11px] pr-[14px] font-medium text-white"
          : "border border-line/70 bg-white px-[15px] font-normal text-ink/70"
      }`}
    >
      {active && <Check className="mr-[5px] h-[13px] w-[13px]" strokeWidth={2.4} />}
      {label}
    </span>
  );
}

function FilterSection({ icon: Icon, label, options }: Section) {
  return (
    <div>
      <div className="mb-[13px] flex items-center gap-[7px]">
        <Icon className="h-[15px] w-[15px] text-ink/55" strokeWidth={1.8} />
        <span className="text-[13.5px] font-medium leading-none text-ink/90">{label}</span>
      </div>
      <div className="flex flex-wrap gap-[8px]">
        {options.map((o) => (
          <Chip key={o.label} label={o.label} active={o.active} />
        ))}
      </div>
    </div>
  );
}

function StatusBar(): ReactNode {
  return (
    <div className="absolute inset-x-0 top-0 h-[54px]">
      <span className="absolute left-[26px] top-[17px] text-[15px] font-medium leading-none text-ink">9:41</span>
      <div className="absolute right-[22px] top-[18px] flex items-center gap-[6px]">
        <Signal className="h-[16px] w-[16px] text-ink" strokeWidth={2} />
        <Wifi className="h-[16px] w-[16px] text-ink" strokeWidth={2} />
        <BatteryFull className="h-[18px] w-[18px] text-ink" strokeWidth={1.6} />
      </div>
    </div>
  );
}

/* ---------------------------------- page --------------------------------- */
export default function AgFilterPg() {
  return (
    <div className="relative w-[390px] overflow-hidden bg-white font-sans text-ink" style={{ height: 931 }}>
      <StatusBar />

      {/* header */}
      <button className="absolute left-[20px] top-[56px] flex h-[40px] w-[40px] items-center justify-center rounded-full border border-[#ECECEC] bg-[#F4F5F5]">
        <ChevronLeft className="h-[20px] w-[20px] text-ink" strokeWidth={1.8} />
      </button>
      <h1 className="absolute inset-x-0 top-[60px] text-center text-[18px] font-medium leading-none text-ink">
        Filter
      </h1>
      <span className="absolute inset-x-0 top-[84px] text-center text-[11px] font-light leading-none text-ink/45">
        Refine your creator search
      </span>
      <button className="absolute right-[20px] top-[62px] flex items-center gap-[5px] text-[13px] font-normal leading-none text-ink/50">
        <RotateCcw className="h-[13px] w-[13px]" strokeWidth={1.9} />
        Reset
      </button>

      {/* header divider */}
      <div className="absolute inset-x-0 top-[116px] h-[1px] bg-[#F0F0F0]" />

      {/* filter sections */}
      <div className="absolute left-[20px] top-[134px] flex w-[350px] flex-col gap-[22px]">
        {SECTIONS.map((s) => (
          <FilterSection key={s.label} icon={s.icon} label={s.label} options={s.options} />
        ))}
      </div>

      {/* fixed footer */}
      <div className="absolute inset-x-0 bottom-0 h-[104px] bg-white shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
        <div className="flex items-center gap-[10px] px-[20px] pt-[16px]">
          <button className="flex h-[52px] w-[112px] items-center justify-center gap-[7px] rounded-[16px] border border-line/80 bg-white text-[14px] font-medium leading-none text-ink/70">
            <RotateCcw className="h-[16px] w-[16px]" strokeWidth={1.9} />
            Clear
          </button>
          <button className="h-[52px] flex-1 rounded-[16px] bg-ink text-[14.5px] font-medium leading-none text-white">
            Apply Filters
          </button>
        </div>
        <div className="mx-auto mt-[12px] h-[5px] w-[134px] rounded-full bg-black/80" />
      </div>
    </div>
  );
}
