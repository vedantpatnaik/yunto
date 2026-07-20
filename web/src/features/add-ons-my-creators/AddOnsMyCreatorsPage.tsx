import { useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Plus, Clock, Star, CalendarDays, Navigation } from "lucide-react";
import { useCreators } from "@/api/hooks";

/**
 * Super Admin — Add-Ons (My Creators).
 * Exact reconstruction of Figma frame 5063:59308
 * ("Super Admin- add - ons (my creator)"), 1440×1024.
 * Clean underlying page — the profile popup + dim scrim siblings are omitted.
 */

/* --------------------------------- data -------------------------------- */
type Creator = {
  left: number;
  top: number;
  bg: string;
  avatar: string;
  name: string;
  location: string;
  stars: number;
  role: string;
  rate: string;
};

/** Visual slots (position + palette) filled with real per-creator data. */
type Slot = { left: number; top: number; bg: string; avatar: string };

const VIDEOGRAPHER_SLOTS: Slot[] = [
  { left: 277, top: 369, bg: "rgba(249,255,246,0.6)", avatar: "from-[#C8E6FF] to-[#C8B3ED]" },
  { left: 694, top: 369, bg: "rgba(255,246,254,0.6)", avatar: "from-[#FFE0C8] to-[#C8B3ED]" },
];

const EDITOR_SLOTS: Slot[] = [
  { left: 277, top: 828, bg: "rgba(253,246,255,0.6)", avatar: "from-[#D8C8FF] to-[#FFD6E7]" },
  { left: 694, top: 828, bg: "rgba(255,239,239,0.6)", avatar: "from-[#FFD6C8] to-[#C8B3ED]" },
];

/* Role + rate describe the section (Videographers vs Editors), not a person. */
const VIDEOGRAPHER_ROLE = "Fashion & Lifestyle Videographer | 6 Yrs Exp.";
const VIDEOGRAPHER_RATE = "₹5000 / 2 Hrs";
const EDITOR_ROLE = "Fashion & Lifestyle Editor | 4 Yrs Exp.";
const EDITOR_RATE = "₹1500 - 3000";

const TIME_SLOTS = [
  { t: "09:00-11:00am", x: 38, w: 89 },
  { t: "01:00-03:00pm", x: 131, w: 90 },
  { t: "07:00-09:00pm", x: 225, w: 90 },
];
const EXPERTISE = [
  { t: "Reels", x: 82, w: 47 },
  { t: "BTS Shoots", x: 137, w: 70 },
  { t: "Brand Shoots", x: 215, w: 78 },
];
const PAST_CLIENT = [
  { t: "Nykaa", x: 82, w: 47 },
  { t: "Mama earth", x: 137, w: 70 },
  { t: "H&M", x: 215, w: 78 },
];

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

function InfoSection() {
  return (
    <div className="absolute left-[14px] top-[125px] h-[129px] w-[374px]">
      {/* Row 1 — time slots */}
      <div className="absolute left-0 top-0 h-[39px] w-[374px] rounded-[14px] border border-[#D9D9D9] bg-white">
        <span className="absolute left-[6px] top-[8px] flex h-[24px] w-[24px] items-center justify-center rounded-full border border-[#EAEAEA] bg-[#F1F1F1]">
          <Clock className="h-[14px] w-[14px] text-black" strokeWidth={1.6} />
        </span>
        {TIME_SLOTS.map((s) => (
          <Chip key={s.t} x={s.x} w={s.w}>{s.t}</Chip>
        ))}
      </div>
      {/* Row 2 — expertise */}
      <div className="absolute left-0 top-[45px] h-[39px] w-[374px] rounded-[14px] border border-[#D9D9D9] bg-white">
        <span className="absolute left-[7px] top-[10px] font-light text-[14px] leading-none text-black/70">Expertise</span>
        {EXPERTISE.map((s) => (
          <Chip key={s.t} x={s.x} w={s.w}>{s.t}</Chip>
        ))}
      </div>
      {/* Row 3 — past client */}
      <div className="absolute left-0 top-[90px] h-[39px] w-[374px] rounded-[14px] border border-[#D9D9D9] bg-white">
        <span className="absolute left-[7px] top-[10px] font-light text-[14px] leading-none text-black/70">Past Client</span>
        {PAST_CLIENT.map((s) => (
          <Chip key={s.t} x={s.x} w={s.w}>{s.t}</Chip>
        ))}
      </div>
    </div>
  );
}

function CreatorCard({ c }: { c: Creator }) {
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
        <span className="text-[12px] leading-none text-black">{c.stars.toFixed(1)}</span>
      </div>
      <span className="absolute left-[110px] top-[94px] text-[14px] leading-none text-[#6D706A]">Ratings</span>

      {/* rate */}
      <span className="absolute left-[197px] top-[73px] text-[12px] leading-none text-black">{c.rate}</span>
      <span className="absolute left-[197px] top-[94px] text-[14px] leading-none text-[#6D706A]">Rate</span>

      {/* info rows */}
      <InfoSection />

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

/* -------------------------------- page --------------------------------- */
export default function AddOnsMyCreatorsPage() {
  const navigate = useNavigate();
  const { data: creators = [] } = useCreators();

  // Distinct real creator per card, sliced to the design's card count (2 + 2).
  const videographers = creators.slice(0, VIDEOGRAPHER_SLOTS.length);
  const editors = creators.slice(
    VIDEOGRAPHER_SLOTS.length,
    VIDEOGRAPHER_SLOTS.length + EDITOR_SLOTS.length,
  );

  const videographerCards: Creator[] = VIDEOGRAPHER_SLOTS.map((s, i) => ({
    ...s,
    name: videographers[i]?.name ?? "",
    location: videographers[i]?.location ?? "",
    stars: videographers[i]?.stars ?? 0,
    role: VIDEOGRAPHER_ROLE,
    rate: VIDEOGRAPHER_RATE,
  }));

  const editorCards: Creator[] = EDITOR_SLOTS.map((s, i) => ({
    ...s,
    name: editors[i]?.name ?? "",
    location: editors[i]?.location ?? "",
    stars: editors[i]?.stars ?? 0,
    role: EDITOR_ROLE,
    rate: EDITOR_RATE,
  }));

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
