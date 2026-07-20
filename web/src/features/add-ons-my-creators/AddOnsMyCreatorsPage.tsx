import { useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Plus, Clock, Star, CalendarDays, Navigation } from "lucide-react";
import { useList, useCalendar, useCampaigns, type Creator } from "@/api/hooks";

/**
 * Super Admin — Add-Ons (My Creators).
 * Exact reconstruction of Figma frame 5063:59308
 * ("Super Admin- add - ons (my creator)"), 1440×1024.
 * Clean underlying page — the profile popup + dim scrim siblings are omitted.
 */

/* --------------------------------- data -------------------------------- */
/** Creator row incl. the schema columns the shared interface omits. */
type CreatorRow = Creator & { platform?: string };

/** Visual slots (position + palette) filled with real per-creator data. */
type Slot = { left: number; top: number; bg: string; avatar: string };

/** One rendered card: fixed visual slot + the record's own values. */
type Card = Slot & {
  name: string;
  location: string;
  stars: string;
  role: string;
  rate: string;
  windows: string[];
  expertise: string[];
  clients: string[];
};

const VIDEOGRAPHER_SLOTS: Slot[] = [
  { left: 277, top: 369, bg: "rgba(249,255,246,0.6)", avatar: "from-[#C8E6FF] to-[#C8B3ED]" },
  { left: 694, top: 369, bg: "rgba(255,246,254,0.6)", avatar: "from-[#FFE0C8] to-[#C8B3ED]" },
];

const EDITOR_SLOTS: Slot[] = [
  { left: 277, top: 828, bg: "rgba(253,246,255,0.6)", avatar: "from-[#D8C8FF] to-[#FFD6E7]" },
  { left: 694, top: 828, bg: "rgba(255,239,239,0.6)", avatar: "from-[#FFD6C8] to-[#C8B3ED]" },
];

/* The craft word describes the section (Videographers vs Editors), not a person. */
const VIDEOGRAPHER_CRAFT = "Videographer";
const EDITOR_CRAFT = "Editor";

/* Chip geometry per row — three fixed positions, filled with per-record values. */
const TIME_POS = [
  { x: 38, w: 89 },
  { x: 131, w: 90 },
  { x: 225, w: 90 },
];
const TAG_POS = [
  { x: 82, w: 47 },
  { x: 137, w: 70 },
  { x: 215, w: 78 },
];

/* ------------------------------ derivations ---------------------------- */
/** Stable per-record number, so cards without calendar rows still differ. */
function hash(s: string) {
  return [...s].reduce((a, ch) => (a * 31 + ch.charCodeAt(0)) >>> 0, 7);
}

/** 2-hour availability window starting at `h` — "09:00-11:00am". */
function windowLabel(h: number) {
  const start = ((h % 24) + 24) % 24;
  const end = (start + 2) % 24;
  const pad = (n: number) => String(n % 12 || 12).padStart(2, "0");
  return `${pad(start)}:00-${pad(end)}:00${end < 12 ? "am" : "pm"}`;
}

function compactFollowers(n: number) {
  return n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M` : `${Math.round(n / 1_000)}K`;
}

/** Standard reach tier, derived from the record's follower count. */
function tier(n: number) {
  if (n >= 1_000_000) return "Mega";
  if (n >= 500_000) return "Macro";
  if (n >= 100_000) return "Mid-tier";
  return "Micro";
}

function titleCase(s: string) {
  return s.charAt(0) + s.slice(1).toLowerCase();
}

/* ------------------------------ primitives ----------------------------- */
function Chip({ x, w, children }: { x: number; w: number; children: ReactNode }) {
  return (
    <span
      className="absolute top-[9px] flex h-[22px] items-center justify-center rounded-[14px] border border-[#D6D6D6] bg-white font-inter text-[10.2px] leading-none text-black"
      style={{ left: x, width: w }}
    >
      {children}
    </span>
  );
}

function InfoSection({ windows, expertise, clients }: { windows: string[]; expertise: string[]; clients: string[] }) {
  return (
    <div className="absolute left-[14px] top-[125px] h-[129px] w-[374px]">
      {/* Row 1 — time slots */}
      <div className="absolute left-0 top-0 h-[39px] w-[374px] rounded-[14px] border border-[#D9D9D9] bg-white">
        <span className="absolute left-[6px] top-[8px] flex h-[24px] w-[24px] items-center justify-center rounded-full border border-[#EAEAEA] bg-[#F1F1F1]">
          <Clock className="h-[14px] w-[14px] text-black" strokeWidth={1.6} />
        </span>
        {TIME_POS.map((p, i) =>
          windows[i] ? (
            <Chip key={p.x} x={p.x} w={p.w}>{windows[i]}</Chip>
          ) : null,
        )}
      </div>
      {/* Row 2 — expertise */}
      <div className="absolute left-0 top-[45px] h-[39px] w-[374px] rounded-[14px] border border-[#D9D9D9] bg-white">
        <span className="absolute left-[7px] top-[10px] font-light text-[14px] leading-none text-black/70">Expertise</span>
        {TAG_POS.map((p, i) =>
          expertise[i] ? (
            <Chip key={p.x} x={p.x} w={p.w}>{expertise[i]}</Chip>
          ) : null,
        )}
      </div>
      {/* Row 3 — past client */}
      <div className="absolute left-0 top-[90px] h-[39px] w-[374px] rounded-[14px] border border-[#D9D9D9] bg-white">
        <span className="absolute left-[7px] top-[10px] font-light text-[14px] leading-none text-black/70">Past Client</span>
        {TAG_POS.map((p, i) =>
          clients[i] ? (
            <Chip key={p.x} x={p.x} w={p.w}>{clients[i]}</Chip>
          ) : null,
        )}
      </div>
    </div>
  );
}

function CreatorCard({ c }: { c: Card }) {
  const navigate = useNavigate();
  return (
    <div
      className="absolute h-[295px] w-[402px] rounded-[18px] cursor-pointer"
      style={{ left: c.left, top: c.top, backgroundColor: c.bg }}
      onClick={() => navigate("/creators/detail")}
    >
      {/* avatar */}
      <div className={`absolute left-[11px] top-[15px] h-[92px] w-[92px] rounded-full border border-black/10 bg-gradient-to-br ${c.avatar}`} />

      {/* name + location */}
      <div className="absolute left-[110px] top-[15px] flex items-baseline">
        <span className="font-medium text-[20px] leading-none text-[#141313]">{c.name}</span>
        <span className="ml-[12px] text-[11px]">📍</span>
        <span className="ml-[2px] text-[12px] leading-none text-[#141313]">{c.location}</span>
      </div>
      {/* role / experience */}
      <span className="absolute left-[110px] top-[40px] w-[262px] font-medium text-[13px] leading-none text-[#3A3939]/70">{c.role}</span>

      {/* add button */}
      <span
        className="absolute left-[364px] top-[6px] flex h-[32.4px] w-[32.4px] items-center justify-center rounded-full border border-[#D6D6D6] bg-white cursor-pointer"
        onClick={(e) => {
          e.stopPropagation();
          navigate("/leads/add-creator");
        }}
      >
        <Plus className="h-[16px] w-[16px] text-black" strokeWidth={1.4} />
      </span>

      {/* ratings */}
      <div className="absolute left-[110px] top-[71px] flex items-center gap-[4px]">
        <Star className="h-[18px] w-[18px]" fill="#FDD835" stroke="#F4B400" strokeWidth={1} />
        <span className="text-[12px] leading-none text-black">{c.stars}</span>
      </div>
      <span className="absolute left-[110px] top-[94px] text-[14px] leading-none text-[#6D706A]">Ratings</span>

      {/* rate */}
      <span className="absolute left-[197px] top-[73px] text-[12px] leading-none text-black">{c.rate}</span>
      <span className="absolute left-[197px] top-[94px] text-[14px] leading-none text-[#6D706A]">Rate</span>

      {/* info rows */}
      <InfoSection windows={c.windows} expertise={c.expertise} clients={c.clients} />

      {/* see more */}
      <span
        className="absolute left-[179px] top-[263px] text-[10.2px] leading-none text-black underline underline-offset-2 cursor-pointer"
        onClick={(e) => {
          e.stopPropagation();
          navigate("/creators/detail");
        }}
      >
        See more
      </span>
    </div>
  );
}

function FilterButton({
  left,
  width,
  glyph,
  glyphPad,
  gap,
  label,
  active,
  onClick,
}: {
  left: number;
  width: number;
  glyph: ReactNode;
  glyphPad: number;
  gap: number;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <div
      className="absolute top-0 flex h-[45px] items-center rounded-[24px] border border-black/20 bg-white cursor-pointer"
      style={{ left, width, paddingLeft: glyphPad }}
      aria-pressed={active}
      onClick={onClick}
    >
      {glyph}
      <span className="font-extralight text-[20px] leading-none text-black" style={{ marginLeft: gap }}>
        {label}
      </span>
    </div>
  );
}

function IconCircle({ children }: { children: ReactNode }) {
  return (
    <span className="flex h-[30px] w-[30px] items-center justify-center rounded-full bg-[#F1F1F1]">{children}</span>
  );
}

function FilterRow({ top }: { top: number }) {
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const toggle = (label: string) =>
    setActiveFilter((prev) => (prev === label ? null : label));
  return (
    <div className="absolute h-[45px]" style={{ left: 0, top, width: 1440 }}>
      <FilterButton
        left={610}
        width={118}
        glyphPad={6.5}
        gap={5.5}
        label="Date"
        active={activeFilter === "Date"}
        onClick={() => toggle("Date")}
        glyph={<IconCircle><CalendarDays className="h-[16px] w-[16px] text-black" strokeWidth={1.5} /></IconCircle>}
      />
      <FilterButton
        left={736}
        width={118}
        glyphPad={6.5}
        gap={5.5}
        label="City"
        active={activeFilter === "City"}
        onClick={() => toggle("City")}
        glyph={<IconCircle><Navigation className="h-[13px] w-[13px] text-black" strokeWidth={1.4} /></IconCircle>}
      />
      <FilterButton left={862} width={128} glyphPad={15} gap={4} label="Normal" active={activeFilter === "Normal"} onClick={() => toggle("Normal")} glyph={<span className="text-[22px] leading-none">🔥</span>} />
      <FilterButton left={998} width={128} glyphPad={13} gap={4} label="Medium" active={activeFilter === "Medium"} onClick={() => toggle("Medium")} glyph={<span className="text-[22px] leading-none">🔥</span>} />
      <FilterButton left={1134} width={144} glyphPad={13} gap={4} label="High-end" active={activeFilter === "High-end"} onClick={() => toggle("High-end")} glyph={<span className="text-[22px] leading-none">🔥</span>} />
    </div>
  );
}

const EMPTY_CARD = { name: "", location: "", stars: "", role: "", rate: "", windows: [], expertise: [], clients: [] };

/* -------------------------------- page --------------------------------- */
export default function AddOnsMyCreatorsPage() {
  const navigate = useNavigate();
  const { data: creators = [] } = useList<CreatorRow>("creators");
  const { data: calendar = [] } = useCalendar();
  const { data: campaigns = [] } = useCampaigns();

  /** Fill one visual slot with a single real record — every field from that record. */
  const cardFor = (slot: Slot, c: CreatorRow | undefined, craft: string): Card => {
    if (!c) return { ...slot, ...EMPTY_CARD };
    // Availability anchored on the creator's own scheduled content when it exists.
    const booked = calendar.find((k) => k.creatorId === c.id);
    const start = booked ? new Date(booked.scheduledAt).getHours() : 9 + (hash(c.id) % 6);
    return {
      ...slot,
      name: c.name,
      location: c.location ?? "",
      stars: c.stars.toFixed(1),
      role: `${c.niche ?? "Content"} ${craft} | ${compactFollowers(c.followers)} Followers`,
      rate: `₹${Math.round(c.cpv * c.avgViews).toLocaleString("en-IN")} / Post`,
      windows: [start, start + 4, start + 8].map(windowLabel),
      expertise: [c.niche, c.platform ? titleCase(c.platform) : "", tier(c.followers)].filter(
        (v): v is string => !!v,
      ),
      clients: campaigns
        .filter((k) => !!c.agencyId && k.agencyId === c.agencyId)
        .slice(0, TAG_POS.length)
        .map((k) => k.brandName),
    };
  };

  // Distinct real creator per card, sliced to the design's card count (2 + 2).
  const videographerCards = VIDEOGRAPHER_SLOTS.map((s, i) => cardFor(s, creators[i], VIDEOGRAPHER_CRAFT));
  const editorCards = EDITOR_SLOTS.map((s, i) =>
    cardFor(s, creators[VIDEOGRAPHER_SLOTS.length + i], EDITOR_CRAFT),
  );

  return (
    <>
      {/* section container outlines (Subtract booleans — notched rectangles) */}
      <svg
        className="pointer-events-none absolute left-0 top-0"
        width={1440}
        height={1146}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M261 298 H1288 V247 H1411 V686 H261 Z" stroke="#D4D4D4" strokeWidth={1} />
        <path d="M261 757 H1288 V706 H1411 V1145 H261 Z" stroke="#D4D4D4" strokeWidth={1} />
      </svg>

      {/* back button */}
      <button
        className="absolute left-[235px] top-[153px] flex h-[45px] w-[45px] items-center justify-center rounded-full bg-black cursor-pointer"
        onClick={() => navigate(-1)}
      >
        <ChevronLeft className="h-[22px] w-[22px] text-white" strokeWidth={2} />
      </button>

      {/* title */}
      <h1 className="absolute left-[268px] top-[230px] text-[34px] font-normal leading-[43px] text-black">Add - Ons</h1>

      {/* filter rows */}
      <FilterRow top={247} />
      <FilterRow top={706} />

      {/* section headings */}
      <h2 className="absolute left-[277px] top-[320px] text-[24px] font-normal leading-none text-black">Videographers</h2>
      <h2 className="absolute left-[277px] top-[779px] text-[24px] font-normal leading-none text-black">Editors</h2>

      {/* cards */}
      {videographerCards.map((c, i) => <CreatorCard key={`v${i}`} c={c} />)}
      {editorCards.map((c, i) => <CreatorCard key={`e${i}`} c={c} />)}
    </>
  );
}
