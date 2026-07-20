import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCreators } from "@/api/hooks";
import type { ReactNode, CSSProperties } from "react";
import type { LucideIcon } from "lucide-react";
import {
  Search,
  Plus,
  Calendar,
  Users,
  UserX,
  House,
  ArrowUp,
  ArrowUpRight,
  ChevronDown,
  UserRound,
  Globe,
  Star,
  Sparkles,
  AlignJustify,
  X,
  Check,
} from "lucide-react";

/**
 * Super Admin — People / Assign Creators.
 * Exact reconstruction of Figma frame 6862:17345
 * ("Super Admin-people-assign creators"), 1440×1024.
 * Renders inside AppShell (TopBar + Sidebar supplied by the shell).
 */

/* --------------------------------- data -------------------------------- */
type CreatorVM = {
  id: string;
  name: string;
  handle: string;
  followers: string;
  location: string;
  stars: string;
  grad: string;
};

/* Per-row avatar gradients — visual only, cycled across the live rows. */
const GRADS = [
  "linear-gradient(135deg,#FBCFE8,#C4B5FD)",
  "linear-gradient(135deg,#BFDBFE,#A5B4FC)",
  "linear-gradient(135deg,#FED7AA,#FDBA74)",
  "linear-gradient(135deg,#BBF7D0,#86EFAC)",
];

/* --------------------------- format helpers ---------------------------- */
function compact(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}k`;
  return String(n);
}

/* ------------------------------ primitives ----------------------------- */
function StatChip({ icon: Icon, color, children }: { icon: LucideIcon; color: string; children: ReactNode }) {
  return (
    <span className="inline-flex h-[24px] items-center gap-[3px] rounded-[12px] bg-white px-[6px] text-[10px] leading-none text-ink/80">
      <Icon className="h-[14px] w-[14px]" style={{ color }} strokeWidth={1.6} />
      {children}
    </span>
  );
}

function CreatorRow({ x, y, w, c, control, onClick }: { x: number; y: number; w: number; c: CreatorVM; control: ReactNode; onClick?: () => void }) {
  return (
    <div onClick={onClick} className={`absolute rounded-[32px] bg-white/[0.45]${onClick ? " cursor-pointer" : ""}`} style={{ left: x, top: y, width: w, height: 62 }}>
      <span className="absolute rounded-full" style={{ left: 7, top: 10, width: 42, height: 42, background: c.grad }} />
      <div className="absolute flex items-baseline gap-[8px]" style={{ left: 52, top: 12 }}>
        <span className="text-[14px] leading-none text-ink/90">{c.name}</span>
        <span className="text-[10px] font-light leading-none text-ink/70">{c.handle}</span>
      </div>
      <div className="absolute flex items-center gap-[3px]" style={{ left: 52, top: 31 }}>
        <StatChip icon={UserRound} color="#AD56E3">{c.followers}</StatChip>
        <StatChip icon={Globe} color="#2CC37F">{c.location}</StatChip>
        <StatChip icon={Star} color="#E8CE11">{c.stars}</StatChip>
      </div>
      {control}
    </div>
  );
}

function MemberRow({ x, y, w, avatarBg, initial, initialColor, name, creators }: {
  x: number; y: number; w: number; avatarBg: string; initial: string; initialColor: string; name: string; creators: string;
}) {
  return (
    <div className="absolute rounded-[30px] border border-[#D6D6D6] bg-white" style={{ left: x, top: y, width: w, height: 53 }}>
      <span className="absolute flex items-center justify-center rounded-full border" style={{ left: 5, top: 5, width: 42, height: 42, background: avatarBg, borderColor: "#4CCC16" }}>
        <span className="text-[14px] leading-none" style={{ color: initialColor }}>{initial}</span>
      </span>
      <div className="absolute flex items-center gap-[8px]" style={{ left: 50, top: 9 }}>
        <span className="text-[14px] leading-none text-ink/90">{name}</span>
        <span className="flex h-[15px] items-center rounded-[24px] bg-white px-[6px] font-inter text-[8px] font-medium leading-none text-[#4CCC16]">Active</span>
      </div>
      <span className="absolute text-[10px] font-light leading-none text-ink/70" style={{ left: 50, top: 31 }}>{creators}</span>
    </div>
  );
}

function SectionHeader({ labelX, y, label, badgeX, count, divX, divW, chevX }: {
  labelX: number; y: number; label: string; badgeX: number; count: string; divX: number; divW: number; chevX: number;
}) {
  return (
    <>
      <span className="absolute text-[15px] leading-none text-ink/70" style={{ left: labelX, top: y + 4 }}>{label}</span>
      <span className="absolute flex items-center justify-center rounded-full border border-[#E6E6E6] bg-white" style={{ left: badgeX, top: y, width: 22, height: 22 }}>
        <span className="text-[10px] leading-none text-ink">{count}</span>
      </span>
      <span className="absolute" style={{ left: divX, top: y + 11, width: divW, height: 1, background: "rgba(0,0,0,0.12)" }} />
      <ChevronDown className="absolute h-[16px] w-[16px] text-ink" style={{ left: chevX, top: y + 3 }} strokeWidth={1.8} />
    </>
  );
}

function AttendanceStat({ x, value, badgeColor, glyph, label }: {
  x: number; value: string; badgeColor: string; glyph: ReactNode; label: string;
}) {
  return (
    <div className="absolute" style={{ left: x, top: 140, width: 93, height: 43 }}>
      <span className="absolute text-[48px] leading-none text-ink" style={{ left: 0, top: -6 }}>{value}</span>
      <span className="absolute flex h-[15px] w-[32px] items-center justify-center gap-[1px] rounded-[9px]" style={{ left: 61, top: 0, background: badgeColor }}>
        <ArrowUp className="h-[9px] w-[9px] text-ink" strokeWidth={2.2} />
        {glyph}
      </span>
      <span className="absolute text-[12px] font-light leading-none text-ink/70" style={{ left: 45, top: 28 }}>{label}</span>
    </div>
  );
}

function StatCard({ x, w, label, value }: { x: number; w: number; label: string; value: string }) {
  return (
    <div className="absolute rounded-[24px] border border-[#D4D4D4] bg-white/[0.47]" style={{ left: x, top: 303, width: w, height: 98 }}>
      <span className="absolute left-[14px] top-[10px] text-[14px] font-light leading-none text-ink/90">{label}</span>
      <span className="absolute left-[14px] top-[34px] text-[36px] leading-none text-ink">{value}</span>
    </div>
  );
}

function Tab({ x, w, icon: Icon, label, active, onClick }: { x: number; w: number; icon: LucideIcon; label: string; active?: boolean; onClick?: () => void }) {
  return (
    <div
      onClick={onClick}
      className={`absolute flex h-[45px] cursor-pointer items-center gap-[8px] rounded-[24px] border px-[12px] ${active ? "border-black bg-black text-white" : "border-[#CCCCCC] bg-white text-ink"}`}
      style={{ left: x, top: 228, width: w }}
    >
      <Icon className="h-[20px] w-[20px]" strokeWidth={1.7} />
      <span className="text-[14px] font-light leading-none">{label}</span>
    </div>
  );
}

/* pill: "• N Creators" style tag */
function DotPill({ x, y, w, text, textColor }: { x: number; y: number; w: number; text: string; textColor: string }) {
  return (
    <span className="absolute flex h-[20px] items-center gap-[6px] whitespace-nowrap rounded-[24px] border border-[#EAEAEA] bg-white px-[8px]" style={{ left: x, top: y, minWidth: w }}>
      <span className="h-[7px] w-[7px] rounded-full bg-[#737572]" />
      <span className="text-[10px] font-light leading-none" style={{ color: textColor }}>{text}</span>
    </span>
  );
}

const profileGrad: CSSProperties = {
  background: "linear-gradient(180deg, rgba(255,255,255,0.46) 0%, #74A4F7 100%)",
};

/* -------------------------------- page --------------------------------- */
export default function AssignCreatorsPage() {
  const navigate = useNavigate();
  const { data } = useCreators();
  // Live creators, sliced to the four cards the design renders.
  const creators = useMemo<CreatorVM[]>(
    () =>
      (data ?? []).slice(0, 4).map((cr, i) => ({
        id: cr.id,
        name: cr.name,
        handle: cr.handle,
        followers: compact(cr.followers),
        location: cr.location ?? "",
        stars: `${cr.stars.toFixed(1)} stars`,
        grad: GRADS[i % GRADS.length],
      })),
    [data],
  );

  const [selected, setSelected] = useState<Set<number>>(() => new Set([0]));
  const [removed, setRemoved] = useState<Set<string>>(() => new Set());
  const assigned = creators.filter((c) => !removed.has(c.id));
  const allSelected = creators.length > 0 && creators.every((_, i) => selected.has(i));
  const toggleSelected = (i: number) =>
    setSelected((s) => {
      const next = new Set(s);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  const toggleSelectAll = () =>
    setSelected(allSelected ? new Set<number>() : new Set(creators.map((_, i) => i)));
  const removeAssigned = (id: string) => setRemoved((r) => new Set(r).add(id));

  return (
    <>
      {/* Page background — Figma frame fill (gray → light cyan → blue-gray).
         Sits behind the shell chrome so this page shows its own neutral gradient
         instead of the global lavender body gradient. */}
      <div
        className="absolute inset-0 -z-10"
        style={{ background: "linear-gradient(135deg, #EAEAEA 0%, #EDF9FF 42%, rgba(201,218,227,0.9) 72%, #A4C5D9 100%)" }}
      />

      {/* Title */}
      <h1 className="absolute left-[259px] top-[150px] text-[40px] font-normal leading-none text-ink">PEOPLE</h1>

      {/* People-count button */}
      <div onClick={() => navigate("/people")} className="absolute left-[552px] top-[150px] h-[48px] w-[72px] cursor-pointer rounded-[24px] border border-[#CCCCCC] bg-white">
        <Users className="absolute h-[18px] w-[24px] text-ink" style={{ left: 12, top: 15 }} strokeWidth={1.6} />
        <span className="absolute flex items-center justify-center rounded-full bg-[#20A271] text-[8px] leading-none text-white" style={{ left: 46, top: 17, width: 14, height: 14 }}>4</span>
      </div>

      {/* Attendance stats */}
      <AttendanceStat x={810} value="18" badgeColor="#DCFF68" label="Present" glyph={<Users className="h-[11px] w-[11px] text-ink" strokeWidth={1.6} />} />
      <AttendanceStat x={938} value="2" badgeColor="#FFB0B1" label="Absent" glyph={<UserX className="h-[11px] w-[11px] text-ink" strokeWidth={1.6} />} />
      <AttendanceStat x={1066} value="0" badgeColor="#DCFF68" label="WFH" glyph={<House className="h-[11px] w-[11px] text-ink" strokeWidth={1.6} />} />
      <AttendanceStat x={1194} value="1" badgeColor="#DCFF68" label="Half Day" glyph={<span className="text-[10px] leading-none text-ink">1</span>} />

      {/* Date pill */}
      <div onClick={() => navigate("/calendar")} className="absolute left-[1299px] top-[151px] h-[32px] w-[90px] cursor-pointer rounded-[18px] bg-white">
        <span className="absolute flex items-center justify-center rounded-full bg-[#F1F1F1]" style={{ left: 3, top: 4, width: 24, height: 24 }}>
          <Calendar className="h-[14px] w-[14px] text-ink" strokeWidth={1.6} />
        </span>
        <span className="absolute left-[30px] top-[9px] text-[12px] font-light leading-none text-ink/90">30/09/25</span>
      </div>

      {/* ---------------- Outer / panel backgrounds ---------------- */}
      <div className="absolute rounded-[24px] border border-[#D4D4D4]" style={{ left: 241, top: 282, width: 755, height: 698 }} />
      <div className="absolute rounded-[12px] bg-[#F5F5F5]" style={{ left: 259, top: 418, width: 723, height: 553 }} />
      <div className="absolute rounded-[12px] bg-white" style={{ left: 271, top: 451, width: 690, height: 515 }} />
      <div className="absolute rounded-[12px] bg-[#F5F5F5]" style={{ left: 279, top: 465, width: 333, height: 487 }} />
      <div className="absolute rounded-[12px] bg-white/[0.6]" style={{ left: 623, top: 465, width: 338, height: 501 }} />

      {/* Tabs */}
      <Tab x={241} w={107} icon={Sparkles} label="People" onClick={() => navigate("/people")} />
      <Tab x={356} w={122} icon={AlignJustify} label="Leaves" onClick={() => navigate("/people/leaves")} />
      <Tab x={486} w={156} icon={AlignJustify} label="Assign Creators" active onClick={() => navigate("/people/assign-creators")} />

      {/* Stat cards */}
      <StatCard x={259} w={161} label="Total Creators" value="90" />
      <StatCard x={438} w={161} label="Assigned Creators" value="70" />
      <StatCard x={617} w={161} label="Unassigned Creators" value="20" />
      <StatCard x={796} w={175} label="Pending Approval" value="5" />

      {/* Teams & Roles header */}
      <span className="absolute left-[271px] top-[428px] text-[12px] leading-none text-ink">Teams &amp; Roles</span>
      <span onClick={() => navigate("/settings/add-members")} className="absolute flex cursor-pointer items-center justify-center rounded-full border border-[#D6D6D6] bg-white" style={{ left: 483, top: 426, width: 24, height: 24 }}>
        <Plus className="h-[12px] w-[12px] text-ink" strokeWidth={1.8} />
      </span>

      {/* ---------------- Operations card ---------------- */}
      <span className="absolute flex items-center justify-center rounded-full" style={{ left: 286, top: 474, width: 34, height: 34, background: "#ECC5F5" }}>
        <Users className="h-[18px] w-[18px] text-ink" strokeWidth={1.6} />
      </span>
      <span className="absolute left-[325px] top-[478px] text-[20px] leading-none text-ink/90">Operations</span>
      <div className="absolute left-[325px] top-[500px] flex items-center gap-[4px]">
        <Users className="h-[11px] w-[11px]" style={{ color: "#B56CC5" }} strokeWidth={1.8} />
        <span className="text-[10px] font-light leading-none text-ink/70">12 Members</span>
      </div>
      <DotPill x={453} y={476} w={113} text="15 Assigned Creators" textColor="#222222" />
      <span onClick={() => navigate("/people")} className="absolute flex cursor-pointer items-center justify-center rounded-full border border-[#D6D6D6] bg-white" style={{ left: 584, top: 466, width: 23, height: 23 }}>
        <ArrowUpRight className="h-[13px] w-[13px] text-ink" strokeWidth={1.8} />
      </span>

      {/* Manager section */}
      <SectionHeader labelX={286} y={535} label="Manager" badgeX={391} count="1" divX={423} divW={146} chevX={578} />
      <MemberRow x={285} y={569} w={318} avatarBg="#FFD9E2" initial="R" initialColor="#BE2146" name="Ronak" creators="7 Creators" />

      {/* Team Lead section */}
      <SectionHeader labelX={320} y={632} label="Team Lead" badgeX={425} count="1" divX={457} divW={114} chevX={580} />
      <MemberRow x={290} y={666} w={310} avatarBg="#E5DFFF" initial="N" initialColor="#3F19E2" name="Neeraj" creators="3 Creators" />

      {/* Employees section */}
      <SectionHeader labelX={319} y={730} label="Employees" badgeX={424} count="10" divX={456} divW={114} chevX={579} />
      <MemberRow x={289} y={764} w={318} avatarBg="#FFE2DD" initial="N" initialColor="#BE3A19" name="Neha" creators="2 Creators" />
      <MemberRow x={287} y={828} w={318} avatarBg="#FFD3F4" initial="A" initialColor="#AA0069" name="Ajay" creators="2 Creators" />

      {/* ---------------- Unassigned Creators ---------------- */}
      <span className="absolute left-[629px] top-[479px] text-[20px] leading-none text-ink/90">Unassigned Creators</span>
      <DotPill x={872} y={479} w={76} text="20 Creators" textColor="#222222" />

      {/* search */}
      <div onClick={() => navigate("/search")} className="absolute cursor-pointer rounded-[16px] border border-[#E6E6E6] bg-white" style={{ left: 629, top: 517, width: 325, height: 30 }}>
        <span className="absolute left-[11px] top-[8px] text-[12px] font-light leading-none text-ink/70">Search Creators</span>
        <span className="absolute flex items-center justify-center rounded-full bg-[#E4E4E4]" style={{ right: 2, top: 2, width: 26, height: 26 }}>
          <Search className="h-[15px] w-[15px] text-ink" strokeWidth={1.8} />
        </span>
      </div>

      {/* select-all row */}
      {allSelected ? (
        <span onClick={toggleSelectAll} className="absolute flex cursor-pointer items-center justify-center rounded-[3px] bg-[#6750A4]" style={{ left: 765, top: 564, width: 18, height: 18 }}>
          <Check className="h-[12px] w-[12px] text-white" strokeWidth={3} />
        </span>
      ) : (
        <span onClick={toggleSelectAll} className="absolute cursor-pointer rounded-[3px] border-2 border-[#C4C4CC]" style={{ left: 765, top: 564, width: 18, height: 18 }} />
      )}
      <span className="absolute left-[798px] top-[565px] font-inter text-[13px] leading-none text-[#6B7280]">Select All</span>
      <span className="absolute flex h-[20px] items-center rounded-full bg-white/[0.4] px-[8px] font-inter text-[13px] leading-none text-[#6B7280]" style={{ left: 875, top: 563 }}>2 selected</span>

      {/* unassigned rows */}
      {creators.map((c, i) => (
        <CreatorRow
          key={`u-${c.id}`}
          x={629}
          y={602 + i * 72}
          w={318}
          c={c}
          onClick={() => toggleSelected(i)}
          control={
            selected.has(i) ? (
              <span className="absolute flex items-center justify-center rounded-[3px] bg-[#6750A4]" style={{ left: 282, top: 18, width: 18, height: 18 }}>
                <Check className="h-[12px] w-[12px] text-white" strokeWidth={3} />
              </span>
            ) : (
              <span className="absolute rounded-[3px] border-2 border-[#C4C4CC]" style={{ left: 282, top: 18, width: 18, height: 18 }} />
            )
          }
        />
      ))}

      {/* ---------------- Right profile panel ---------------- */}
      <div className="absolute rounded-[24px] border border-[#D4D4D4]" style={{ left: 1013, top: 222, width: 369, height: 754, ...profileGrad }} />

      {/* avatar */}
      <span className="absolute flex items-center justify-center rounded-full border border-black/[0.14]" style={{ left: 1157, top: 242, width: 82, height: 82, background: "#D0C6FB" }}>
        <span className="text-[20px] leading-none" style={{ color: "#3F19E2" }}>N</span>
      </span>
      <span className="absolute flex h-[15px] items-center rounded-[24px] bg-white px-[6px] font-inter text-[8px] font-medium leading-none text-[#4CCC16]" style={{ left: 1262, top: 340 }}>Active</span>

      {/* name + role, centered in panel */}
      <span className="absolute top-[336px] text-center text-[20px] font-semibold leading-none text-[#111827]" style={{ left: 1013, width: 369 }}>Neeraj</span>
      <span className="absolute top-[361px] text-center text-[12px] leading-none text-[#6B7280]" style={{ left: 1013, width: 369 }}>Operations | Team Lead</span>

      {/* employee code */}
      <div className="absolute flex items-center justify-center rounded-[24px] bg-white/[0.5]" style={{ left: 1126, top: 384, width: 144, height: 28 }}>
        <span className="text-[10px] leading-none text-ink/80">Employee Code&nbsp;&nbsp;55678</span>
      </div>

      {/* assigned creators header */}
      <div className="absolute left-[1032px] top-[431px] flex items-baseline gap-[6px]">
        <span className="text-[14px] font-medium leading-none text-ink">Assigned Creators</span>
        <span className="text-[14px] font-light leading-none text-ink/70">({String(assigned.length).padStart(2, "0")})</span>
      </div>

      {/* assigned rows */}
      {assigned.map((c, i) => (
        <CreatorRow
          key={`a-${c.id}`}
          x={1032}
          y={468 + i * 72}
          w={337}
          c={c}
          onClick={() => navigate("/creators/detail")}
          control={
            <span onClick={(e) => { e.stopPropagation(); removeAssigned(c.id); }} className="absolute flex cursor-pointer items-center justify-center rounded-full bg-white" style={{ left: 300, top: 18, width: 25, height: 25 }}>
              <X className="h-[13px] w-[13px] text-ink" strokeWidth={1.8} />
            </span>
          }
        />
      ))}
    </>
  );
}
