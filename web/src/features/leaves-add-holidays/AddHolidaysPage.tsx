import type { ReactNode } from "react";
import { useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  ArrowUp,
  ArrowDown,
  Users,
  UserX,
  House,
  Calendar,
  Search,
  Waves,
  AlignJustify,
  Plus,
  ChevronDown,
  X,
  Info,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCreate, useMe } from "@/api/hooks";

/**
 * Super Admin — People / Leaves · "Add Holidays".
 * Exact reconstruction of Figma frame 4870:73820
 * ("Super Admin- leaves (add holidays)"), 1440×1024.
 *
 * The Add-Holiday modal (with its own dim backdrop) is the subject of this
 * screen, so it is reproduced faithfully over the underlying Leaves calendar.
 * The generic profile dropdown is not present in this frame.
 */

/* ------------------------------ primitives ----------------------------- */
function Txt({
  l,
  t,
  s,
  lh,
  cls,
  children,
}: {
  l: number;
  t: number;
  s: number;
  lh: number;
  cls?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={`absolute whitespace-pre ${cls ?? ""}`}
      style={{ left: l, top: t, fontSize: s, lineHeight: `${lh}px` }}
    >
      {children}
    </div>
  );
}

function StatPill({
  numX,
  badgeX,
  labelX,
  num,
  badgeBg,
  dir,
  icon: Icon,
  badgeText,
  label,
}: {
  numX: number;
  badgeX: number;
  labelX: number;
  num: string;
  badgeBg: string;
  dir: "up" | "down";
  icon?: LucideIcon;
  badgeText?: string;
  label: string;
}) {
  return (
    <>
      <Txt l={numX} t={135} s={48} lh={43} cls="font-normal text-ink">
        {num}
      </Txt>
      <div
        className="absolute flex items-center justify-center gap-[1px] rounded-[9px]"
        style={{ left: badgeX, top: 142, width: 32, height: 15, background: badgeBg }}
      >
        {dir === "up" ? (
          <ArrowUp className="h-[9px] w-[8px] text-ink" strokeWidth={2} />
        ) : (
          <ArrowDown className="h-[9px] w-[8px] text-ink" strokeWidth={2} />
        )}
        {Icon ? (
          <Icon className="h-[11px] w-[13px] text-ink" strokeWidth={1.5} />
        ) : (
          <span className="text-[10px] font-light leading-none text-ink">{badgeText}</span>
        )}
      </div>
      <Txt l={labelX} t={170} s={12} lh={15} cls="font-light text-ink/70">
        {label}
      </Txt>
    </>
  );
}

/* ------------------------------- action pill ---------------------------- */
function ActionPill({
  x,
  w,
  bg,
  radius,
  onClick,
  children,
}: {
  x: number;
  w: number;
  bg: string;
  radius: number;
  onClick?: () => void;
  children: ReactNode;
}) {
  return (
    <div
      className={`absolute${onClick ? " cursor-pointer" : ""}`}
      style={{ left: x, top: 233, width: w, height: 45, background: bg, borderRadius: radius }}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

/* --------------------------- panel month pill --------------------------- */
function MonthPill({ x, y }: { x: number; y: number }) {
  return (
    <div
      className="absolute flex items-center gap-[6px] rounded-[28px] px-[12px]"
      style={{ left: x, top: y, width: 101, height: 28, background: "rgba(255,255,255,0.9)" }}
    >
      <span className="text-[14px] font-light leading-none text-ink/90">October</span>
      <ChevronDown className="h-[11px] w-[11px] text-ink" strokeWidth={1.8} />
    </div>
  );
}

/* ----------------------------- party bunting ---------------------------- */
function Bunting({ x, y }: { x: number; y: number }) {
  const cols = ["#F6A5C0", "#8FD3E8", "#F7D154", "#8FD3E8", "#C6A6DF", "#F6A5C0", "#F7D154", "#8FD3E8"];
  return (
    <svg
      className="absolute"
      style={{ left: x, top: y }}
      width="154"
      height="16"
      viewBox="0 0 154 16"
      fill="none"
    >
      <path d="M1 2 Q77 9 153 2" stroke="rgba(0,0,0,0.15)" strokeWidth="1" />
      {cols.map((c, i) => {
        const px = 4 + i * 19;
        return <polygon key={i} points={`${px},3 ${px + 13},3 ${px + 6.5},14`} fill={c} />;
      })}
    </svg>
  );
}

/* --------------------------------- data --------------------------------- */
const COLS = [250, 358, 466, 574, 682, 790, 898];
const ROWS = [479, 577, 675, 773, 871];
const DAYS: number[][] = [
  [1, 2, 3, 4, 5, 6, 7],
  [8, 9, 10, 11, 12, 13, 14],
  [15, 16, 17, 18, 19, 20, 21],
  [22, 23, 24, 25, 26, 27, 28],
  [29, 30, 31, 1, 2, 3, 4],
];

function Cake({ x, y }: { x: number; y: number }) {
  return (
    <div
      className="absolute flex items-center justify-center text-[13px] leading-none"
      style={{ left: x, top: y, width: 16, height: 16 }}
    >
      🎂
    </div>
  );
}

function DayChip({ x, y, bg, letter, color }: { x: number; y: number; bg: string; letter: string; color: string }) {
  return (
    <div
      className="absolute flex items-center justify-center rounded-full"
      style={{ left: x, top: y, width: 24, height: 24, background: bg }}
    >
      <span className="text-[8px] font-normal leading-none" style={{ color }}>
        {letter}
      </span>
    </div>
  );
}

/* --------------------------------- modal -------------------------------- */
function Field({
  y,
  h,
  label,
  labelY,
  placeholder,
  phX,
  phY,
  top,
  icon,
  value,
  onChange,
  inputW,
}: {
  y: number;
  h: number;
  label: string;
  labelY: number;
  placeholder: string;
  phX: number;
  phY: number;
  top?: boolean;
  icon?: ReactNode;
  value?: string;
  onChange?: (v: string) => void;
  inputW?: number;
}) {
  const editable = value !== undefined && onChange !== undefined;
  return (
    <>
      <Txt l={486} t={labelY} s={18} lh={24} cls="font-light text-ink/70">
        {label}
      </Txt>
      <div
        className="absolute border border-[#D6D6D6]"
        style={{ left: 486, top: y, width: 455, height: h, background: "#FEFCFF", borderRadius: 33.57 }}
      />
      {editable ? (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="absolute bg-transparent text-[18px] font-normal text-ink/70 outline-none placeholder:text-ink/70"
          style={{ left: phX, top: phY, width: inputW ?? 417, lineHeight: "40px" }}
        />
      ) : (
        <div
          className={`absolute text-[18px] font-normal text-ink/70 ${top ? "" : "whitespace-pre"}`}
          style={{ left: phX, top: phY, lineHeight: "40px" }}
        >
          {placeholder}
        </div>
      )}
      {icon}
    </>
  );
}

/* -------------------------------- page --------------------------------- */
export default function AddHolidaysPage() {
  const navigate = useNavigate();
  const create = useCreate("reminders");
  const { data: me } = useMe();
  const [holidayName, setHolidayName] = useState("");
  const [date, setDate] = useState("");

  async function handleSave() {
    const parsed = date ? new Date(date) : null;
    const dateISO =
      parsed && !isNaN(parsed.getTime()) ? parsed.toISOString() : new Date().toISOString();
    try {
      await create.mutateAsync({ title: holidayName, dueAt: dateISO, ownerId: me?.id });
    } catch {
      /* swallow — never hang the modal */
    } finally {
      navigate("/people/holidays");
    }
  }

  return (
    <>
      {/* ===== page background gradient (frame fill) ===== */}
      <div
        className="absolute inset-0"
        style={{
          backgroundColor: "#FFFFFF",
          backgroundImage:
            "linear-gradient(135deg, #EAEAEA 0%, #EDF9FF 40%, rgba(201,218,227,0.9) 72%, #A4C5D9 100%)",
        }}
      />

      {/* ===== PEOPLE title ===== */}
      <Txt l={259} t={155} s={40} lh={45} cls="font-normal text-ink">
        PEOPLE
      </Txt>

      {/* ===== People search + people-count controls ===== */}
      <div
        className="absolute flex items-center justify-center rounded-full bg-white cursor-pointer"
        style={{ left: 488, top: 151, width: 45, height: 45 }}
        onClick={() => navigate("/search")}
      >
        <Search className="h-[22px] w-[22px] text-ink" strokeWidth={1.7} />
      </div>
      <div
        className="absolute flex items-center rounded-[24px] bg-white pl-[12px]"
        style={{ left: 541, top: 150, width: 72, height: 48 }}
      >
        <Users className="h-[16px] w-[26px] text-ink" strokeWidth={1.6} />
        <span
          className="absolute flex items-center justify-center rounded-full text-[10px] font-normal text-white"
          style={{ left: 46, top: 17, width: 14, height: 14, background: "#20A271" }}
        >
          4
        </span>
      </div>

      {/* ===== top-right stat pills ===== */}
      <StatPill numX={810} badgeX={871} labelX={855} num="18" badgeBg="#DCFF68" dir="up" icon={Users} label="Present" />
      <StatPill numX={938} badgeX={999} labelX={983} num="2" badgeBg="#FFB0B1" dir="down" icon={UserX} label="Absent" />
      <StatPill numX={1066} badgeX={1127} labelX={1111} num="0" badgeBg="#DCFF68" dir="up" icon={House} label="WFH" />
      <StatPill numX={1194} badgeX={1255} labelX={1239} num="1" badgeBg="#DCFF68" dir="up" badgeText="1" label="Half Day" />

      {/* ===== date pill ===== */}
      <div className="absolute rounded-[18px] bg-white" style={{ left: 1299, top: 153, width: 90, height: 32 }}>
        <div
          className="absolute flex items-center justify-center rounded-full"
          style={{ left: 3, top: 4, width: 24, height: 24, background: "#F1F1F1" }}
        >
          <Calendar className="h-[14px] w-[14px] text-ink" strokeWidth={1.6} />
        </div>
        <span className="absolute text-[12px] font-light leading-none text-ink/90" style={{ left: 30, top: 10 }}>
          30/09/25
        </span>
      </div>

      {/* ===== main calendar panel (notched top-left for tabs) ===== */}
      <div
        className="absolute border border-[#D4D4D4]"
        style={{
          left: 242,
          top: 224,
          width: 764,
          height: 769,
          background: "rgba(227,228,244,0.81)",
          clipPath: "polygon(414px 0, 764px 0, 764px 769px, 0 769px, 0 63px, 414px 63px)",
        }}
      />

      {/* --- tabs / action buttons row --- */}
      <ActionPill x={242} w={107} bg="#FFFFFF" radius={24} onClick={() => navigate("/people")}>
        <Waves className="absolute h-[15px] w-[16px] text-ink" style={{ left: 13, top: 15 }} strokeWidth={1.6} />
        <span className="absolute text-[14px] font-light leading-none text-ink" style={{ left: 41, top: 15 }}>
          People
        </span>
      </ActionPill>
      <ActionPill x={357} w={122} bg="#000000" radius={24} onClick={() => navigate("/people/leaves")}>
        <AlignJustify className="absolute h-[14px] w-[16px] text-white" style={{ left: 22, top: 15 }} strokeWidth={1.6} />
        <span className="absolute text-[14px] font-light leading-none text-white" style={{ left: 50, top: 15 }}>
          Leaves
        </span>
      </ActionPill>
      <ActionPill x={482} w={156} bg="#FFFFFF" radius={24} onClick={() => navigate("/people/assign-creators")}>
        <AlignJustify className="absolute h-[14px] w-[16px] text-ink" style={{ left: 14, top: 15 }} strokeWidth={1.6} />
        <span className="absolute text-[14px] font-light leading-none text-ink" style={{ left: 42, top: 15 }}>
          Assign Creators
        </span>
      </ActionPill>
      <ActionPill x={664} w={100} bg="rgba(255,255,255,0.9)" radius={28} onClick={() => navigate("/people/holidays")}>
        <span className="absolute text-[14px] font-light leading-none text-ink/90" style={{ left: 12, top: 15 }}>
          Add Holiday
        </span>
        <Plus className="absolute h-[11px] w-[11px] text-ink" style={{ left: 82, top: 17 }} strokeWidth={1.8} />
      </ActionPill>
      <ActionPill x={770} w={114} bg="rgba(255,255,255,0.9)" radius={28} onClick={() => navigate("/people/apply-leave")}>
        <span className="absolute text-[14px] font-light leading-none text-ink/90" style={{ left: 9.5, top: 15 }}>
          Apply for leave
        </span>
        <Plus className="absolute h-[11px] w-[11px] text-ink" style={{ left: 88, top: 17 }} strokeWidth={1.8} />
      </ActionPill>
      <ActionPill x={890} w={108} bg="rgba(255,255,255,0.9)" radius={28}>
        <span className="absolute text-[14px] font-light leading-none text-ink/90" style={{ left: 14, top: 15 }}>
          October
        </span>
        <ChevronDown className="absolute h-[11px] w-[12px] text-ink" style={{ left: 68, top: 17 }} strokeWidth={1.8} />
        <Plus className="absolute h-[10px] w-[10px] text-ink" style={{ left: 84, top: 17.5 }} strokeWidth={1.8} />
      </ActionPill>

      {/* --- Leave Balance --- */}
      <Txt l={257} t={306} s={18} lh={24} cls="font-light text-ink">
        Leave Balance
      </Txt>
      {/* Causal Leave pill */}
      <div className="absolute rounded-[32px] border border-black/10 bg-white" style={{ left: 257, top: 342, width: 153, height: 62 }}>
        <div
          className="absolute flex items-center justify-center rounded-full border border-[#731FB4]"
          style={{ left: 7, top: 10, width: 42, height: 42 }}
        >
          <span className="text-[14px] font-normal leading-none text-[#6000AA]">02</span>
        </div>
        <span className="absolute text-[14px] font-normal leading-none text-ink/90" style={{ left: 54, top: 24 }}>
          Causal Leave
        </span>
      </div>
      {/* Sick Leave pill */}
      <div className="absolute rounded-[32px] border border-black/10 bg-white" style={{ left: 427, top: 342, width: 153, height: 62 }}>
        <div
          className="absolute flex items-center justify-center rounded-full border border-[#6CA478]"
          style={{ left: 7, top: 10, width: 42, height: 42 }}
        >
          <span className="text-[14px] font-normal leading-none text-[#6CA478]">01</span>
        </div>
        <span className="absolute text-[14px] font-normal leading-none text-ink/90" style={{ left: 54, top: 24 }}>
          Sick Leave
        </span>
      </div>

      {/* --- weekday headers --- */}
      <Txt l={282} t={445} s={18} lh={24} cls="font-light text-ink">Mon</Txt>
      <Txt l={393} t={445} s={18} lh={24} cls="font-light text-ink">Tue</Txt>
      <Txt l={497} t={445} s={18} lh={24} cls="font-light text-ink">Wed</Txt>
      <Txt l={608} t={445} s={18} lh={24} cls="font-light text-ink">Thu</Txt>
      <Txt l={721} t={445} s={18} lh={24} cls="font-light text-ink">Fri</Txt>
      <Txt l={826} t={445} s={18} lh={24} cls="font-light text-[#D85859]">Sat</Txt>
      <Txt l={933} t={445} s={18} lh={24} cls="font-light text-[#D43131]">Sun</Txt>

      {/* --- calendar grid --- */}
      {ROWS.map((ry, r) =>
        COLS.map((cx, c) => {
          const isSun = c === 6;
          const day = DAYS[r][c];
          const isDay4 = r === 0 && c === 3;
          return (
            <div key={`${r}-${c}`}>
              <div
                className="absolute"
                style={{
                  left: cx,
                  top: ry,
                  width: 100,
                  height: 90,
                  borderRadius: 18,
                  background: isSun ? "transparent" : "#FFFFFF",
                }}
              />
              {isDay4 && (
                <div
                  className="absolute"
                  style={{ left: cx + 5, top: ry + 6, width: 42, height: 44, borderRadius: 22, background: "#D4EBF9" }}
                />
              )}
              <div
                className="absolute text-[20px] font-normal text-ink"
                style={{ left: cx + (isDay4 ? 18 : 15), top: ry + 16, lineHeight: "24px" }}
              >
                {day}
              </div>
            </div>
          );
        }),
      )}
      {/* grid decorations */}
      <DayChip x={640} y={535} bg="#C6A6DF" letter="T" color="#6000AA" />
      <DayChip x={750} y={637} bg="#C4F1D2" letter="S" color="#007726" />
      <Cake x={430} y={691} />
      <Cake x={322} y={789} />
      {/* Holiday pill on day 24 */}
      <div
        className="absolute flex items-center gap-[3px] rounded-full bg-white pl-[5px]"
        style={{ left: 478, top: 818, width: 76, height: 26 }}
      >
        <span className="h-[8px] w-[8px] rounded-full" style={{ background: "#88DFA9" }} />
        <span className="text-[10px] font-normal leading-none text-ink/80">Holiday</span>
      </div>
      <DayChip x={624} y={830} bg="#FFE3CF" letter="P" color="#DB6714" />
      <DayChip x={640} y={830} bg="#D4CFFF" letter="K" color="#1A0C9A" />

      {/* ================= right panels ================= */}
      {/* --- On leave --- */}
      <div
        className="absolute rounded-[12px] border border-white/50"
        style={{ left: 1015, top: 223, width: 352, height: 241, background: "rgba(255,255,255,0.55)" }}
      />
      <Txt l={1025} t={231} s={12} lh={24} cls="font-normal text-ink">On leave</Txt>
      <MonthPill x={1263} y={223} />
      <div className="absolute rounded-[12px] bg-white" style={{ left: 1025, top: 262, width: 327, height: 188 }} />
      {/* Today divider */}
      <Txt l={1025} t={262} s={12} lh={16} cls="font-normal text-ink/70">Today</Txt>
      <div className="absolute bg-black/10" style={{ left: 1066, top: 271, width: 92, height: 1 }} />
      {/* Tanvi Sharma leave card */}
      <div className="absolute rounded-[32px] bg-white" style={{ left: 1025, top: 293, width: 318, height: 62 }} />
      <div
        className="absolute flex items-center justify-center rounded-full"
        style={{ left: 1032, top: 303, width: 42, height: 42, background: "#C6A6DF" }}
      >
        <span className="text-[14px] font-normal leading-none text-[#6000AA]">T</span>
      </div>
      <Txt l={1079} t={304} s={14} lh={18} cls="font-normal text-ink/90">Tanvi Sharma</Txt>
      <Txt l={1181} t={306} s={10} lh={13} cls="font-light text-ink/70">Operations</Txt>
      <Txt l={1079} t={325} s={10} lh={12} cls="font-light text-ink/70">Rep. Manager: Vishal Sharma</Txt>
      <Txt l={1167} t={331} s={10} lh={13} cls="font-light text-ink/70">Sick Leave</Txt>
      <div
        className="absolute flex items-center gap-[4px] rounded-[7px] bg-white pl-[6px]"
        style={{ left: 1231, top: 325, width: 87, height: 23 }}
      >
        <span className="text-[10px] leading-none text-red-600">📄</span>
        <span className="text-[10px] font-light leading-none text-ink/70">Medical..pdf</span>
      </div>

      {/* --- Upcoming Events --- */}
      <div
        className="absolute rounded-[12px] border border-white/50"
        style={{ left: 1015, top: 476, width: 352, height: 241, background: "rgba(255,255,255,0.55)" }}
      />
      <Txt l={1025} t={484} s={12} lh={24} cls="font-normal text-ink">Upcoming Events</Txt>
      <MonthPill x={1263} y={476} />
      <div className="absolute rounded-[12px] bg-white" style={{ left: 1025, top: 515, width: 327, height: 188 }} />
      {/* birthday card 1 */}
      <div className="absolute rounded-[32px] bg-white" style={{ left: 1025, top: 531, width: 326, height: 62 }} />
      <div className="absolute flex items-center justify-center text-[20px] leading-none" style={{ left: 1037, top: 550, width: 24, height: 24 }}>🎂</div>
      <Txt l={1071} t={545} s={12} lh={16} cls="font-light text-ink/70">Happy birthday</Txt>
      <div
        className="absolute flex items-center justify-center rounded-full"
        style={{ left: 1071, top: 563, width: 16, height: 16, background: "#C6A6DF" }}
      >
        <span className="text-[8px] font-normal leading-none text-[#6000AA]">T</span>
      </div>
      <Txt l={1092} t={563} s={14} lh={16} cls="font-normal text-ink">Tanvi Sharma</Txt>
      <Bunting x={1167} y={532} />
      <Txt l={1269} t={550} s={12} lh={16} cls="font-light text-ink/70">16/09/2025</Txt>
      {/* birthday card 2 */}
      <div className="absolute rounded-[32px] bg-white" style={{ left: 1025, top: 605, width: 326, height: 62 }} />
      <div className="absolute flex items-center justify-center text-[20px] leading-none" style={{ left: 1037, top: 624, width: 24, height: 24 }}>🎂</div>
      <Txt l={1071} t={619} s={12} lh={16} cls="font-light text-ink/70">Happy birthday</Txt>
      <div
        className="absolute flex items-center justify-center rounded-full"
        style={{ left: 1071, top: 637, width: 16, height: 16, background: "#DDF7FF" }}
      >
        <span className="text-[8px] font-normal leading-none text-[#0F7D9E]">P</span>
      </div>
      <Txt l={1092} t={637} s={14} lh={16} cls="font-normal text-ink">Pooja Sharma</Txt>
      <Bunting x={1167} y={606} />
      <Txt l={1269} t={624} s={12} lh={16} cls="font-light text-ink/70">22/09/2025</Txt>

      {/* --- Holidays --- */}
      <div
        className="absolute rounded-[12px] border border-white/50"
        style={{ left: 1014, top: 731, width: 352, height: 241, background: "rgba(255,255,255,0.55)" }}
      />
      <Txt l={1024} t={739} s={12} lh={24} cls="font-normal text-ink">Holidays</Txt>
      <MonthPill x={1262} y={731} />
      <div className="absolute rounded-[12px] bg-white" style={{ left: 1024, top: 770, width: 327, height: 188 }} />
      <Txt l={1024} t={770} s={12} lh={16} cls="font-normal text-ink/70">24/09/25</Txt>
      <div className="absolute bg-black/10" style={{ left: 1086, top: 779, width: 92, height: 1 }} />
      <div className="absolute rounded-[32px] bg-white" style={{ left: 1024, top: 801, width: 318, height: 62 }} />
      <div className="absolute rounded-full" style={{ left: 1031, top: 811, width: 42, height: 42, background: "#88DFA9" }} />
      <Txt l={1079} t={823} s={14} lh={24} cls="font-normal text-ink/90">Holiday</Txt>

      {/* ================= dim scrim + modal ================= */}
      <div className="absolute inset-0 z-50" style={{ background: "rgba(0,0,0,0.5)" }} />
      <div
        className="absolute z-50 rounded-[24px] bg-white shadow-[0_24px_70px_rgba(0,0,0,0.28)]"
        style={{ left: 469, top: 213, width: 502, height: 598 }}
      />
      <div className="absolute inset-0 z-50">
        {/* title */}
        <Txt l={488} t={238} s={24} lh={30} cls="font-medium text-ink">
          Add Holiday
        </Txt>
        {/* Save Holiday */}
        <div
          className="absolute flex items-center justify-center rounded-[24px] cursor-pointer"
          style={{ left: 719, top: 234, width: 146, height: 45, background: "rgba(0,0,0,0.95)" }}
          onClick={handleSave}
        >
          <span className="text-[20px] font-normal leading-none text-white">Save Holiday</span>
        </div>
        {/* close */}
        <div
          className="absolute flex items-center justify-center rounded-full bg-white cursor-pointer"
          style={{ left: 888, top: 234, width: 45, height: 45 }}
          onClick={() => navigate(-1)}
        >
          <X className="h-[20px] w-[20px] text-ink" strokeWidth={1.8} />
        </div>

        {/* Holiday Name */}
        <Field
          y={332}
          h={47}
          label="Holiday Name"
          labelY={295}
          placeholder="Enter Holiday Name"
          phX={504}
          phY={337}
          value={holidayName}
          onChange={setHolidayName}
          inputW={417}
        />
        {/* Date Range */}
        <Field
          y={426}
          h={47}
          label="Date Range"
          labelY={389}
          placeholder="Select Dates"
          phX={504}
          phY={431}
          value={date}
          onChange={setDate}
          inputW={385}
          icon={
            <Calendar
              className="absolute h-[20px] w-[20px] text-ink"
              style={{ left: 901, top: 439 }}
              strokeWidth={1.6}
            />
          }
        />
        {/* Holiday Type */}
        <Field
          y={520}
          h={47}
          label="Holiday Type"
          labelY={483}
          placeholder="Select Holiday Type"
          phX={504}
          phY={525}
          icon={
            <ChevronDown
              className="absolute h-[14px] w-[15px] text-ink"
              style={{ left: 904, top: 537 }}
              strokeWidth={1.8}
            />
          }
        />
        {/* Notes & Description */}
        <Field
          y={614}
          h={109}
          label="Notes & Description"
          labelY={577}
          placeholder="Enter your notes..."
          phX={507}
          phY={622}
          top
        />

        {/* footer */}
        <Info className="absolute h-[16px] w-[16px] text-ink/70" style={{ left: 487, top: 753 }} strokeWidth={1.6} />
        <div
          className="absolute text-[14px] font-light text-ink/70"
          style={{ left: 512, top: 746, width: 439, lineHeight: "16px" }}
        >
          Holidays will automatically appear on the Attendance &amp; Leave calendar for all employees.
        </div>
      </div>
    </>
  );
}
