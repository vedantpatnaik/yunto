import type { ReactNode } from "react";
import { ArrowLeft, Calendar, MapPin, Clock, Plus, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCreators } from "@/api/hooks";

/**
 * Super Admin — Add-Ons / Videographers & Editors directory.
 * Exact reconstruction of Figma frame 4870:44223 ("Super Admin- add-ons"), 1440×1024.
 * Built CLEAN: the profile/expanded-card popup + rgba(0,0,0,0.5) dim scrim
 * (node 4870:44625) is intentionally omitted; the underlying page is at full opacity.
 */

// Fixed visual slot (position/tint/gradient + static copy). name/location/rating
// are bound per-slot to a distinct real creator in the page component.
type Slot = {
  x: number;
  y: number;
  tint: string;
  grad: string;
  subtitle: string;
  rate: string;
};

type Person = Slot & {
  name: string;
  location: string;
  rating: string;
};

const VIDEOGRAPHER_SLOTS: Slot[] = [
  {
    x: 277, y: 369, tint: "rgba(249,255,246,0.6)",
    grad: "linear-gradient(135deg,#D6E8C8,#A9C48F)",
    subtitle: "Fashion & Lifestyle Videographer | 6 Yrs Exp.",
    rate: "₹5000 / 2 Hrs",
  },
  {
    x: 694, y: 369, tint: "rgba(255,246,254,0.6)",
    grad: "linear-gradient(135deg,#F3D6EC,#C89FC0)",
    subtitle: "Fashion & Lifestyle Videographer | 6 Yrs Exp.",
    rate: "₹5000 / 2 Hrs",
  },
];

const EDITOR_SLOTS: Slot[] = [
  {
    x: 277, y: 828, tint: "rgba(253,246,255,0.6)",
    grad: "linear-gradient(135deg,#E0D2F0,#B8A0D8)",
    subtitle: "Fashion & Lifestyle Editor | 4 Yrs Exp.",
    rate: "₹1500 - 3000",
  },
  {
    x: 694, y: 828, tint: "rgba(255,239,239,0.6)",
    grad: "linear-gradient(135deg,#F3D0D0,#D89898)",
    subtitle: "Fashion & Lifestyle Editor | 4 Yrs Exp.",
    rate: "₹1500 - 3000",
  },
];

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

function SectionOutline({ top }: { top: number }) {
  // Notched container from the Figma boolean-subtract (1px #D4D4D4 outline, no fill).
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
      className="absolute rounded-[18px]"
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
      <button className="absolute left-[364px] top-[6px] flex h-[32px] w-[32px] items-center justify-center rounded-full bg-white">
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
        <span className="absolute left-[6px] top-[8px] flex h-[24px] w-[24px] items-center justify-center rounded-full bg-[#F1F1F1]">
          <Clock className="h-[14px] w-[14px] text-black" strokeWidth={1.5} />
        </span>
        <div className="absolute left-[38px] top-[9px] flex gap-[4px]">
          <PillChip w={89}>09:00-11:00am</PillChip>
          <PillChip w={90}>01:00-03:00pm</PillChip>
          <PillChip w={90}>07:00-09:00pm</PillChip>
        </div>
      </div>

      {/* expertise bar */}
      <div className="absolute left-[11px] top-[170px] h-[39px] w-[374px] rounded-[14px] border-[0.5px] border-[#D9D9D9] bg-white">
        <span className="absolute left-[7px] top-[9px] text-[14px] font-light leading-none text-ink/70">Expertise</span>
        <div className="absolute left-[82px] top-[8px] flex gap-[8px]">
          <PillChip w={47}>Reels</PillChip>
          <PillChip w={70}>BTS Shoots</PillChip>
          <PillChip w={78}>Brand Shoots</PillChip>
        </div>
      </div>

      {/* past client bar */}
      <div className="absolute left-[11px] top-[215px] h-[39px] w-[374px] rounded-[14px] border-[0.5px] border-[#D9D9D9] bg-white">
        <span className="absolute left-[7px] top-[9px] text-[14px] font-light leading-none text-ink/70">Past Client</span>
        <div className="absolute left-[82px] top-[8px] flex gap-[8px]">
          <PillChip w={47}>Nykaa</PillChip>
          <PillChip w={70}>Mama earth</PillChip>
          <PillChip w={78}>H&M</PillChip>
        </div>
      </div>

      {/* see more */}
      <span className="absolute left-[179px] top-[263px] text-[10.2px] leading-none text-black underline">See more</span>
    </div>
  );
}

/* -------------------------------- page --------------------------------- */
export default function AddOnsVideographersPage() {
  const navigate = useNavigate();
  const { data: creators } = useCreators();
  const list = creators ?? [];

  const bind = (slot: Slot, creator: (typeof list)[number] | undefined): Person => ({
    ...slot,
    name: creator?.name ?? "",
    location: creator?.location ?? "",
    rating: creator ? creator.stars.toFixed(1) : "",
  });

  // Each slot draws a distinct real creator so no two cards repeat.
  const videographers: Person[] = VIDEOGRAPHER_SLOTS.map((slot, i) => bind(slot, list[i]));
  const editors: Person[] = EDITOR_SLOTS.map((slot, i) =>
    bind(slot, list[VIDEOGRAPHER_SLOTS.length + i]),
  );

  return (
    <>
      {/* frame background gradient — Figma frame 4870:44223 fill
          (#EAEAEA → #EDF9FF → rgba(201,218,227,0.9) → #A4C5D9).
          Screen-local, sits behind the AppShell chrome + page content. */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          zIndex: -10,
          background:
            "linear-gradient(135deg, #EAEAEA 0%, #EDF9FF 34%, rgba(201,218,227,0.9) 70%, #A4C5D9 100%)",
        }}
      />

      {/* back button — 235,153 */}
      <button
        onClick={() => navigate(-1)}
        className="absolute left-[235px] top-[153px] flex h-[45px] w-[45px] items-center justify-center rounded-full bg-black"
      >
        <ArrowLeft className="h-[22px] w-[22px] text-white" strokeWidth={2} />
      </button>

      {/* page title — 268,232 · Outfit 400 34px */}
      <h1 className="absolute left-[268px] top-[232px] text-[34px] font-normal leading-none text-ink">Add - Ons</h1>

      {/* ============ VIDEOGRAPHERS ============ */}
      <SectionOutline top={247} />
      <h2 className="absolute left-[277px] top-[320px] text-[24px] font-normal leading-none text-ink">Videographers</h2>
      <FilterRow top={247} />
      {videographers.map((p) => <PersonCard key={`${p.x}-${p.y}`} p={p} />)}

      {/* ============ EDITORS ============ */}
      <SectionOutline top={706} />
      <h2 className="absolute left-[277px] top-[779px] text-[24px] font-normal leading-none text-ink">Editors</h2>
      <FilterRow top={706} />
      {editors.map((p) => <PersonCard key={`${p.x}-${p.y}`} p={p} />)}
    </>
  );
}
