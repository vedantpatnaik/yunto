import type { ReactNode } from "react";
import { ChevronLeft, Calendar, MapPin, Clock, Plus, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  useList,
  useCampaigns,
  useCalendar,
  type Creator,
  type Campaign,
  type CalendarItem,
} from "@/api/hooks";

/**
 * Super Admin — Add-Ons / Editors directory.
 * Exact reconstruction of Figma frame 4870:44691 ("Super Admin- add - ons - editors"), 1440×1024.
 * Built CLEAN: the editor-detail popup card + rgba(0,0,0,0.5) dim scrim (node 4870:45093)
 * is intentionally omitted; the underlying page is rendered at full opacity.
 */

// Fixed visual slot (position/tint/gradient + role label). name/location/rating/
// subtitle/rate are bound per-slot to a distinct real creator in the page component.
type Slot = {
  x: number;
  y: number;
  tint: string;
  grad: string;
  role: string;
};

type Person = Slot & {
  name: string;
  location: string;
  rating: string;
  subtitle: string;
  rate: string;
  slots: string[];      // availability windows — from the creator's scheduled content
  expertise: string[];  // niche / platform / reach
  clients: string[];    // brands their agency has run campaigns for
};

/** /creators returns the full Prisma row, so `platform` + `blacklisted` ride along. */
type DirectoryCreator = Creator & { platform?: string; blacklisted?: boolean };

const VIDEOGRAPHER_SLOTS: Slot[] = [
  {
    x: 277, y: 369, tint: "rgba(249,255,246,0.6)",
    grad: "linear-gradient(135deg,#D6E8C8,#A9C48F)",
    role: "Videographer",
  },
  {
    x: 694, y: 369, tint: "rgba(255,246,254,0.6)",
    grad: "linear-gradient(135deg,#F3D6EC,#C89FC0)",
    role: "Videographer",
  },
];

const EDITOR_SLOTS: Slot[] = [
  {
    x: 277, y: 828, tint: "rgba(253,246,255,0.6)",
    grad: "linear-gradient(135deg,#E0D2F0,#B8A0D8)",
    role: "Editor",
  },
  {
    x: 694, y: 828, tint: "rgba(255,239,239,0.6)",
    grad: "linear-gradient(135deg,#F3D0D0,#D89898)",
    role: "Editor",
  },
];

/* --------------------------- derivation helpers ------------------------- */
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** A scheduled shoot rendered as the 2-hour booking window the card shows. */
function slotLabel(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  const h = d.getHours();
  const h12 = (n: number) => (n % 12 === 0 ? 12 : n % 12);
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${h12(h)}-${h12((h + 2) % 24)}${h < 12 ? "am" : "pm"}`;
}

function compactViews(n: number): string {
  return n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M views` : `${Math.round(n / 1_000)}K views`;
}

/** INSTAGRAM -> Instagram */
function titleCase(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

/** Keep derived text inside the fixed-width Figma chips. */
function clip(s: string, max: number): string {
  return s.length > max ? `${s.slice(0, max - 1)}…` : s;
}

// Merge a fixed visual slot with a distinct real creator so every card differs.
function bindPerson(
  slot: Slot,
  c: DirectoryCreator | undefined,
  campaigns: Campaign[],
  calendar: CalendarItem[],
  loading: boolean
): Person {
  if (!c) {
    return {
      ...slot,
      name: loading ? "…" : "—",
      location: "",
      rating: loading ? "…" : "—",
      subtitle: loading ? "Loading creators…" : `No ${slot.role.toLowerCase()}s listed`,
      rate: loading ? "…" : "—",
      slots: [],
      expertise: [],
      clients: [],
    };
  }
  return {
    ...slot,
    name: c.name,
    location: c.location ?? "",
    rating: c.stars.toFixed(1),
    subtitle: `${c.niche ?? ""} ${slot.role} | ${c.engagementRate.toFixed(1)}% ER`,
    rate: `₹${c.cpv.toFixed(2)} / view`,
    slots: calendar
      .filter((k) => k.creatorId === c.id)
      .sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt))
      .slice(0, 3)
      .map((k) => slotLabel(k.scheduledAt)),
    expertise: [
      clip(c.niche ?? "General", 9),
      clip(c.platform ? titleCase(c.platform) : "Creator", 11),
      compactViews(c.avgViews),
    ],
    clients: campaigns
      .filter((x) => !!c.agencyId && x.agencyId === c.agencyId)
      .slice(0, 3)
      .map((x) => clip(x.brandName, 12)),
  };
}

/* ------------------------------ primitives ----------------------------- */
function PillChip({ w, children }: { w: number; children: ReactNode }) {
  return (
    <span
      style={{ width: w }}
      className="flex h-[22px] shrink-0 items-center justify-center rounded-[14px] border-[0.6px] border-[#D6D6D6] bg-white font-inter text-[10.2px] leading-none text-black"
    >
      {children}
    </span>
  );
}

/** Renders up to 3 derived chips into the Figma-fixed chip widths; a single
 *  placeholder chip keeps the bar's geometry when a record has nothing to show. */
function ChipSet({ items, widths }: { items: string[]; widths: [number, number, number] }) {
  if (items.length === 0) return <PillChip w={widths[0]}>—</PillChip>;
  return (
    <>
      {items.slice(0, 3).map((t, i) => (
        <PillChip key={`${t}-${i}`} w={widths[i]}>
          {t}
        </PillChip>
      ))}
    </>
  );
}

function SectionOutline({ top }: { top: number }) {
  // Notched panel from the Figma boolean-subtract (1px #D4D4D4 outline, no fill):
  // the top-left strip is cut away, leaving a short raised tab on the right.
  return (
    <svg
      className="pointer-events-none absolute left-[261px]"
      style={{ top }}
      width={1151}
      height={440}
      viewBox="0 0 1151 440"
      fill="none"
    >
      <path
        d="M0.5 51.5 L1027.2 51.5 L1027.2 0.5 L1150.5 0.5 L1150.5 439.5 L0.5 439.5 Z"
        stroke="#D4D4D4"
        strokeWidth={1}
      />
    </svg>
  );
}

function FilterRow({ top }: { top: number }) {
  return (
    <div className="absolute left-[610px] flex gap-[8px] text-black" style={{ top }}>
      {/* Date */}
      <button className="flex h-[45px] w-[118px] items-center gap-[5.5px] rounded-[24px] border border-black/20 bg-white pl-[6.5px]">
        <span className="flex h-[30px] w-[30px] items-center justify-center rounded-full bg-[#F1F1F1]">
          <Calendar className="h-[17px] w-[17px]" strokeWidth={1.5} />
        </span>
        <span className="text-[20px] font-extralight">Date</span>
      </button>
      {/* City */}
      <button className="flex h-[45px] w-[118px] items-center gap-[5.5px] rounded-[24px] border border-black/20 bg-white pl-[6.5px]">
        <span className="flex h-[30px] w-[30px] items-center justify-center rounded-full bg-[#F1F1F1]">
          <MapPin className="h-[16px] w-[16px]" strokeWidth={1.5} />
        </span>
        <span className="text-[20px] font-extralight">City</span>
      </button>
      {/* Normal */}
      <button className="flex h-[45px] w-[128px] items-center justify-center gap-[4px] rounded-[24px] border border-black/20 bg-white">
        <span className="text-[22px] leading-none">🔥</span>
        <span className="text-[20px] font-extralight">Normal</span>
      </button>
      {/* Medium */}
      <button className="flex h-[45px] w-[128px] items-center justify-center gap-[4px] rounded-[24px] border border-black/20 bg-white">
        <span className="text-[22px] leading-none">🔥</span>
        <span className="text-[20px] font-extralight">Medium</span>
      </button>
      {/* High-end */}
      <button className="flex h-[45px] w-[144px] items-center justify-center gap-[4px] rounded-[24px] border border-black/20 bg-white">
        <span className="text-[22px] leading-none">🔥</span>
        <span className="text-[20px] font-extralight">High-end</span>
      </button>
    </div>
  );
}

function PersonCard({ p }: { p: Person }) {
  return (
    <div
      className="absolute rounded-[18px] shadow-[0_0.83px_1.66px_rgba(0,0,0,0.05)]"
      style={{ left: p.x, top: p.y, width: 402, height: 295, background: p.tint }}
    >
      {/* avatar */}
      <div className="absolute left-[11px] top-[15px] h-[92px] w-[92px] rounded-full" style={{ background: p.grad }} />

      {/* name + location */}
      <div className="absolute left-[110px] top-[15px] flex items-center">
        <span className="text-[20px] font-medium leading-[28px] text-[#141313]">{p.name}</span>
        <span className="ml-[8px] text-[10px] leading-none">📍</span>
        <span className="ml-[3px] text-[12px] text-[#141313]">{p.location}</span>
      </div>
      {/* subtitle */}
      <div className="absolute left-[110px] top-[41px] w-[262px] text-[13px] font-medium leading-none text-[rgba(58,57,57,0.7)]">
        {p.subtitle}
      </div>

      {/* add button */}
      <button className="absolute left-[364px] top-[6px] flex h-[32px] w-[32px] items-center justify-center rounded-full border-[0.47px] border-[#D6D6D6] bg-white">
        <Plus className="h-[15px] w-[15px] text-black" strokeWidth={1.5} />
      </button>

      {/* ratings */}
      <div className="absolute left-[110px] top-[71px]">
        <div className="flex h-[20px] items-center gap-[4px]">
          <Star className="h-[18px] w-[18px]" fill="#FDD835" stroke="#F4B400" strokeWidth={1} />
          <span className="text-[12px] text-black">{p.rating}</span>
        </div>
        <div className="mt-[3px] text-[14px] leading-none text-[#6D706A]">Ratings</div>
      </div>
      {/* rate */}
      <div className="absolute left-[197px] top-[71px]">
        <div className="flex h-[20px] items-center text-[12px] text-black">{p.rate}</div>
        <div className="mt-[3px] text-[14px] leading-none text-[#6D706A]">Rate</div>
      </div>

      {/* time bar */}
      <div className="absolute left-[11px] top-[125px] h-[39px] w-[374px] rounded-[14px] border-[0.5px] border-[#D9D9D9] bg-white">
        <span className="absolute left-[6px] top-[8px] flex h-[24px] w-[24px] items-center justify-center rounded-full border-[1.5px] border-[#EAEAEA] bg-[#F1F1F1]">
          <Clock className="h-[14px] w-[14px] text-black" strokeWidth={1.5} />
        </span>
        <div className="absolute left-[38px] top-[9px] flex gap-[4px]">
          <ChipSet items={p.slots} widths={[89, 90, 90]} />
        </div>
      </div>

      {/* expertise bar */}
      <div className="absolute left-[11px] top-[170px] h-[39px] w-[374px] rounded-[14px] border-[0.5px] border-[#D9D9D9] bg-white">
        <span className="absolute left-[7px] top-[9px] text-[14px] font-light leading-none text-ink/70">Expertise</span>
        <div className="absolute left-[82px] top-[8px] flex gap-[8px]">
          <ChipSet items={p.expertise} widths={[47, 70, 78]} />
        </div>
      </div>

      {/* past client bar */}
      <div className="absolute left-[11px] top-[215px] h-[39px] w-[374px] rounded-[14px] border-[0.5px] border-[#D9D9D9] bg-white">
        <span className="absolute left-[7px] top-[9px] text-[14px] font-light leading-none text-ink/70">Past Client</span>
        <div className="absolute left-[82px] top-[8px] flex gap-[8px]">
          <ChipSet items={p.clients} widths={[47, 70, 78]} />
        </div>
      </div>

      {/* see more */}
      <span className="absolute left-[179px] top-[263px] text-[10.2px] leading-none text-black underline">See more</span>
    </div>
  );
}

/* -------------------------------- page --------------------------------- */
export default function AddOnsEditorsPage() {
  const navigate = useNavigate();
  const { data: creatorData, isLoading } = useList<DirectoryCreator>("creators");
  const campaigns = useCampaigns().data ?? [];
  const calendar = useCalendar().data ?? [];

  // An add-ons directory only offers creators that are listed and not blacklisted;
  // fall back to the full roster if nothing is flagged listed.
  const all = creatorData ?? [];
  const bookable = all.filter((c) => c.listed && !c.blacklisted);
  const pool = bookable.length > 0 ? bookable : all;

  const videographers = VIDEOGRAPHER_SLOTS.map((s, i) =>
    bindPerson(s, pool[i], campaigns, calendar, isLoading)
  );
  const editors = EDITOR_SLOTS.map((s, i) =>
    bindPerson(s, pool[VIDEOGRAPHER_SLOTS.length + i], campaigns, calendar, isLoading)
  );
  return (
    <>
      {/* full-bleed frame gradient (paints behind AppShell sidebar/topbar) —
          Figma frame 4870:44691 fill: #EAEAEA / #EDF9FF / #C9DAE3 / #A4C5D9 */}
      <div
        className="absolute inset-0 -z-10"
        style={{
          background:
            "linear-gradient(135deg, #EAEAEA 0%, #EDF9FF 36%, rgba(201,218,227,0.9) 70%, #A4C5D9 100%)",
        }}
      />

      {/* back button — 235,153 */}
      <button
        onClick={() => navigate(-1)}
        className="absolute left-[235px] top-[153px] flex h-[45px] w-[45px] items-center justify-center rounded-full bg-black"
      >
        <ChevronLeft className="h-[22px] w-[22px] text-white" strokeWidth={1.8} />
      </button>

      {/* page title — 268,232 · Outfit 400 34px */}
      <h1 className="absolute left-[268px] top-[232px] text-[34px] font-normal leading-none text-ink">Add - Ons</h1>

      {/* ============ VIDEOGRAPHERS ============ */}
      <SectionOutline top={247} />
      <h2 className="absolute left-[277px] top-[320px] text-[24px] font-normal leading-none text-ink">Videographers</h2>
      <FilterRow top={247} />
      {videographers.map((p) => <PersonCard key={p.x} p={p} />)}

      {/* ============ EDITORS ============ */}
      <SectionOutline top={706} />
      <h2 className="absolute left-[277px] top-[779px] text-[24px] font-normal leading-none text-ink">Editors</h2>
      <FilterRow top={706} />
      {editors.map((p) => <PersonCard key={p.x} p={p} />)}
    </>
  );
}
