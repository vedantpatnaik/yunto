import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import {
  Search,
  Users,
  UserX,
  House,
  ArrowUp,
  ArrowDown,
  Calendar,
  Waves,
  AlignJustify,
  ChevronDown,
  FileText,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLeaves, useUsers } from "@/api/hooks";

/**
 * Super Admin — Leaves screen (People / HR).
 * Exact reconstruction of Figma frame 4992:25348 ("Super Admin- leaves"), 1440×1024.
 * Built CLEAN: the captured frame had the TopBar profile dropdown + dim scrim open
 * (nodes 4992:26424…); those sibling nodes are intentionally omitted so the
 * underlying page renders at full opacity.
 */

/* ------------------------------ primitives ----------------------------- */
function Txt({
  l,
  t,
  s,
  lh,
  w,
  cls,
  children,
}: {
  l: number;
  t: number;
  s: number;
  lh: number;
  w?: number;
  cls?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={`absolute ${w ? "" : "whitespace-pre"} ${cls ?? ""}`}
      style={{ left: l, top: t, fontSize: s, lineHeight: `${lh}px`, width: w }}
    >
      {children}
    </div>
  );
}

function Avatar({
  l,
  t,
  d,
  bg,
  color,
  letter,
  fs,
}: {
  l: number;
  t: number;
  d: number;
  bg: string;
  color?: string;
  letter?: string;
  fs?: number;
}) {
  return (
    <div
      className="absolute flex items-center justify-center rounded-full"
      style={{ left: l, top: t, width: d, height: d, background: bg }}
    >
      {letter ? (
        <span className="font-normal leading-none" style={{ fontSize: fs, color }}>
          {letter}
        </span>
      ) : null}
    </div>
  );
}

/* ------------------------------- top pills ------------------------------ */
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
      <Txt l={numX} t={133} s={48} lh={43} cls="font-normal text-ink">
        {num}
      </Txt>
      <div
        className="absolute flex items-center justify-center gap-[1px] rounded-[9px]"
        style={{ left: badgeX, top: 140, width: 32, height: 15, background: badgeBg }}
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
      <Txt l={labelX} t={168} s={12} lh={15} cls="font-light text-ink/70">
        {label}
      </Txt>
    </>
  );
}

/* --------------------------------- tabs --------------------------------- */
function Tab({
  x,
  w,
  active,
  icon: Icon,
  label,
  onClick,
}: {
  x: number;
  w: number;
  active?: boolean;
  icon: LucideIcon;
  label: string;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={`absolute flex cursor-pointer items-center gap-[8px] rounded-[24px] pl-[13px] ${
        active ? "bg-black text-white" : "bg-white text-ink"
      }`}
      style={{ left: x, top: 233, width: w, height: 45 }}
    >
      <Icon className="h-[15px] w-[16px]" strokeWidth={1.6} />
      <span className="text-[14px] font-light leading-none">{label}</span>
    </div>
  );
}

/* ---------------------------- top action pills -------------------------- */
/* Note: the Figma design places an unfilled (invisible) tabler:plus inside each
   of these pills, so the rendered reference shows centered text only. */
function ActionPill({
  x,
  w,
  label,
  onClick,
}: {
  x: number;
  w: number;
  label: string;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className="absolute flex cursor-pointer items-center justify-center rounded-full border border-[#D9D9D9] bg-white/90"
      style={{ left: x, top: 233, width: w, height: 45 }}
    >
      <span className="whitespace-nowrap text-[14px] font-light leading-none text-ink">
        {label}
      </span>
    </div>
  );
}

/* ---------------------------- card month pill --------------------------- */
function MonthPill({ x, y }: { x: number; y: number }) {
  return (
    <div
      className="absolute flex items-center justify-center gap-[8px] rounded-full border border-[#D9D9D9] bg-white/90"
      style={{ left: x, top: y, width: 101, height: 28 }}
    >
      <span className="text-[14px] font-light leading-none text-ink">October</span>
      <ChevronDown className="h-[13px] w-[13px] text-ink" strokeWidth={1.6} />
    </div>
  );
}

/* ------------------------- calendar configuration ----------------------- */
const COLS = [250, 358, 466, 574, 682, 790, 898];
const ROWS = [479, 577, 675, 773, 871];
const DAYS = [
  [1, 2, 3, 4, 5, 6, 7],
  [8, 9, 10, 11, 12, 13, 14],
  [15, 16, 17, 18, 19, 20, 21],
  [22, 23, 24, 25, 26, 27, 28],
  [29, 30, 31, 1, 2, 3, 4],
];
const HEADERS: { x: number; label: string; color: string }[] = [
  { x: 282, label: "Mon", color: "#000000" },
  { x: 393, label: "Tue", color: "#000000" },
  { x: 497, label: "Wed", color: "#000000" },
  { x: 608, label: "Thu", color: "#000000" },
  { x: 721, label: "Fri", color: "#000000" },
  { x: 826, label: "Sat", color: "#D85859" },
  { x: 933, label: "Sun", color: "#D43131" },
];

/* ------------------------- on-leave row (live) -------------------------- */
type LeaveRowData = {
  id: string;
  name: string;
  initial: string;
  department: string;
  leaveType: string;
};

function LeaveRow({ row }: { row: LeaveRowData }) {
  return (
    <>
      <div
        className="absolute rounded-[32px] border border-[#D6D6D6] bg-white"
        style={{ left: 1025, top: 293, width: 318, height: 62 }}
      />
      <Avatar l={1032} t={303} d={42} bg="#C6A5DF" color="#6000AA" letter={row.initial} fs={14} />
      <Txt l={1079} t={304} s={14} lh={24} cls="font-normal text-ink/90">
        {row.name}
      </Txt>
      <Txt l={1181} t={306.5} s={10} lh={24} cls="font-light text-ink/70">
        {row.department}
      </Txt>
      <Txt l={1079} t={323} s={10} lh={12} w={77} cls="font-light text-ink/70">
        Rep. Manager: Vishal Sharma
      </Txt>
      <Txt l={1167} t={330} s={10} lh={24} cls="font-light text-ink/70">
        {row.leaveType}
      </Txt>
      <div
        className="absolute flex items-center gap-[3px] rounded-[7px] border border-[#D6D6D6] bg-white"
        style={{ left: 1231, top: 325, width: 87, height: 23, paddingLeft: 5 }}
      >
        <FileText className="h-[12px] w-[12px] text-ink/70" strokeWidth={1.5} />
        <span className="text-[10px] font-light leading-none text-ink/70">Medical..pdf</span>
      </div>
    </>
  );
}

/* -------------------------------- page --------------------------------- */
export default function LeavesPage() {
  const navigate = useNavigate();
  const { data: leaves } = useLeaves();
  const { data: users } = useUsers();
  const userById = new Map((users ?? []).map((u) => [u.id, u]));
  const onLeave: LeaveRowData[] = (leaves ?? []).slice(0, 1).map((lv) => {
    const u = userById.get(lv.userId);
    const name = u?.name ?? "";
    return {
      id: lv.id,
      name,
      initial: name.charAt(0) || "?",
      department: u?.team?.name ?? "",
      leaveType: `${lv.type} Leave`,
    };
  });
  return (
    <>
      {/* ===== page background (Leaves frame fill 4992:25348) ===== */}
      <div
        className="absolute inset-0 -z-10"
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

      {/* ===== header search + attendance count ===== */}
      <div
        onClick={() => navigate("/search")}
        className="absolute flex cursor-pointer items-center justify-center rounded-full bg-white"
        style={{ left: 488, top: 151.5, width: 45, height: 45 }}
      >
        <Search className="h-[22px] w-[22px] text-ink" strokeWidth={1.7} />
      </div>
      <div
        className="absolute rounded-[24px] bg-white"
        style={{ left: 541, top: 150, width: 72, height: 48 }}
      >
        <Users className="absolute h-[16px] w-[26px] text-ink" style={{ left: 12, top: 16 }} strokeWidth={1.6} />
        <div
          className="absolute flex items-center justify-center rounded-full"
          style={{ left: 46, top: 17, width: 14, height: 14, background: "#20A271" }}
        >
          <span className="text-[10px] font-normal leading-none text-white">4</span>
        </div>
      </div>

      {/* ===== top-right stat pills ===== */}
      <StatPill numX={811} badgeX={872} labelX={856} num="18" badgeBg="#DCFF68" dir="up" icon={Users} label="Present" />
      <StatPill numX={939} badgeX={1000} labelX={984} num="2" badgeBg="#FFB0B1" dir="down" icon={UserX} label="Absent" />
      <StatPill numX={1067} badgeX={1128} labelX={1112} num="0" badgeBg="#DCFF68" dir="up" icon={House} label="WFH" />
      <StatPill numX={1195} badgeX={1256} labelX={1240} num="1" badgeBg="#DCFF68" dir="up" badgeText="1" label="Half Day" />

      {/* ===== date pill ===== */}
      <div className="absolute rounded-[18px] bg-white" style={{ left: 1300, top: 151, width: 90, height: 32 }}>
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

      {/* ===== main panel (notched for tabs) ===== */}
      <div
        className="absolute"
        style={{
          left: 242,
          top: 224,
          width: 764,
          height: 769,
          background: "rgba(226,228,244,0.81)",
          clipPath: "polygon(414px 0, 764px 0, 764px 769px, 0 769px, 0 63px, 414px 63px)",
        }}
      />

      {/* tabs */}
      <Tab x={242} w={107} icon={Waves} label="People" onClick={() => navigate("/people")} />
      <Tab x={357} w={122} active icon={AlignJustify} label="Leaves" onClick={() => navigate("/people/leaves")} />
      <Tab x={482} w={156} icon={AlignJustify} label="Assign Creators" onClick={() => navigate("/people/assign-creators")} />

      {/* top action pills */}
      <ActionPill x={664} w={100} label="Add Holiday" onClick={() => navigate("/people/holidays")} />
      <ActionPill x={770} w={114} label="Apply for leave" onClick={() => navigate("/people/apply-leave")} />
      <div
        className="absolute flex items-center justify-center gap-[8px] rounded-full border border-[#D9D9D9] bg-white/90"
        style={{ left: 890, top: 233, width: 108, height: 45 }}
      >
        <span className="text-[14px] font-light leading-none text-ink">October</span>
        <ChevronDown className="h-[14px] w-[14px] text-ink" strokeWidth={1.6} />
      </div>

      {/* ===== Leave Balance ===== */}
      <Txt l={257} t={306} s={18} lh={24} cls="font-light text-ink">
        Leave Balance
      </Txt>
      {/* Causal Leave */}
      <div
        className="absolute rounded-[32px] border border-black/[0.06] bg-white"
        style={{ left: 257, top: 342, width: 153, height: 62 }}
      />
      <div
        className="absolute flex items-center justify-center rounded-full border"
        style={{ left: 264, top: 352, width: 42, height: 42, borderColor: "#731FB4" }}
      >
        <span className="text-[14px] font-normal leading-none" style={{ color: "#6000AA" }}>
          02
        </span>
      </div>
      <Txt l={311} t={364} s={14} lh={24} cls="font-normal text-ink/90">
        Causal Leave
      </Txt>
      {/* Sick Leave */}
      <div
        className="absolute rounded-[32px] border border-black/[0.06] bg-white"
        style={{ left: 427, top: 342, width: 153, height: 62 }}
      />
      <div
        className="absolute flex items-center justify-center rounded-full border"
        style={{ left: 434, top: 352, width: 42, height: 42, borderColor: "#6CA478" }}
      >
        <span className="text-[14px] font-normal leading-none" style={{ color: "#6CA478" }}>
          01
        </span>
      </div>
      <Txt l={481} t={364} s={14} lh={24} cls="font-normal text-ink/90">
        Sick Leave
      </Txt>

      {/* ===== calendar day headers ===== */}
      {HEADERS.map((h) => (
        <Txt key={h.label} l={h.x} t={445} s={18} lh={24} cls="font-light" >
          <span style={{ color: h.color }}>{h.label}</span>
        </Txt>
      ))}

      {/* ===== calendar grid ===== */}
      {ROWS.map((ry, r) =>
        COLS.map((cx, c) => {
          const isSun = c === 6;
          const isDay4 = r === 0 && c === 3;
          return (
            <div key={`${r}-${c}`}>
              <div
                className="absolute rounded-[18px]"
                style={{ left: cx, top: ry, width: 100, height: 90, background: isSun ? "transparent" : "#FFFFFF" }}
              />
              {!isDay4 && (
                <Txt l={cx + 15} t={ry + 16} s={20} lh={24} cls="font-normal text-ink">
                  {DAYS[r][c]}
                </Txt>
              )}
            </div>
          );
        })
      )}

      {/* --- day 4 (Thu) : highlighted + Tanvi --- */}
      <div
        className="absolute rounded-[22px]"
        style={{ left: 579, top: 485, width: 42, height: 44, background: "#D4EBF9" }}
      />
      <Txt l={592} t={495} s={20} lh={24} cls="font-normal text-ink">
        4
      </Txt>
      <Avatar l={640} t={535} d={24} bg="#C6A5DF" color="#6000AA" letter="T" fs={8} />

      {/* --- day 12 (Fri) : Sameer --- */}
      <Avatar l={750} t={637} d={24} bg="#C3F1D2" color="#007726" letter="S" fs={8} />

      {/* --- day 16 & 22 : birthdays --- */}
      <div className="absolute flex items-center justify-center text-[13px] leading-none" style={{ left: 430, top: 691, width: 16, height: 16 }}>
        🎂
      </div>
      <div className="absolute flex items-center justify-center text-[13px] leading-none" style={{ left: 322, top: 789, width: 16, height: 16 }}>
        🎂
      </div>

      {/* --- day 24 (Wed) : Holiday chip --- */}
      <div
        className="absolute flex items-center gap-[3px] rounded-full border border-[#CCCCCC] bg-white"
        style={{ left: 478, top: 818, width: 76, height: 26, paddingLeft: 9 }}
      >
        <span className="h-[8px] w-[8px] rounded-full" style={{ background: "#87DFA9" }} />
        <span className="text-[10px] font-normal leading-none text-ink/80">Holiday</span>
      </div>

      {/* --- day 25 (Thu) : Karan + Priya --- */}
      <Avatar l={640} t={830} d={24} bg="#D3CFFF" color="#1A0C9A" letter="K" fs={8} />
      <Avatar l={624} t={830} d={24} bg="#FFE3CF" color="#DB6714" letter="P" fs={8} />

      {/* ==================== RIGHT COLUMN CARDS ==================== */}

      {/* ---------- Card 1 : On leave ---------- */}
      <div
        className="absolute rounded-[12px]"
        style={{ left: 1015, top: 223, width: 352, height: 241, background: "rgba(255,255,255,0.6)" }}
      />
      <div className="absolute rounded-[12px] bg-white" style={{ left: 1025, top: 262, width: 327, height: 188 }} />
      <Txt l={1025} t={231} s={12} lh={24} cls="font-normal text-ink">
        On leave
      </Txt>
      <MonthPill x={1263} y={223} />
      {/* Today label + divider */}
      <Txt l={1025} t={262} s={12} lh={16} cls="font-normal text-ink/70">
        Today
      </Txt>
      <div className="absolute" style={{ left: 1066, top: 271.5, width: 92, height: 1, background: "#D0D0D0" }} />
      {/* On-leave row(s) — live from useLeaves (design shows one) */}
      {onLeave.map((row) => (
        <LeaveRow key={row.id} row={row} />
      ))}

      {/* ---------- Card 2 : Upcoming Events ---------- */}
      <div
        className="absolute rounded-[12px]"
        style={{ left: 1015, top: 476, width: 352, height: 241, background: "rgba(255,255,255,0.6)" }}
      />
      <div className="absolute rounded-[12px] bg-white" style={{ left: 1025, top: 515, width: 327, height: 188 }} />
      <Txt l={1025} t={484} s={12} lh={24} cls="font-normal text-ink">
        Upcoming Events
      </Txt>
      <MonthPill x={1263} y={476} />
      {/* birthday 1 — Tanvi */}
      <div
        className="absolute rounded-[32px] border border-[#D6D6D6] bg-white"
        style={{ left: 1025, top: 531, width: 326, height: 62 }}
      />
      <div className="absolute flex items-center justify-center text-[20px] leading-none" style={{ left: 1037, top: 550, width: 24, height: 24 }}>
        🎂
      </div>
      <Txt l={1071} t={545} s={12} lh={24} cls="font-light text-ink/70">
        Happy birthday
      </Txt>
      <Avatar l={1071} t={563} d={16} bg="#C6A5DF" color="#6000AA" letter="T" fs={8} />
      <Txt l={1092} t={563} s={14} lh={24} cls="font-normal text-ink">
        Tanvi Sharma
      </Txt>
      <div className="absolute text-[16px] leading-none" style={{ left: 1188, top: 533 }}>
        🎉
      </div>
      <Txt l={1269} t={550} s={12} lh={24} cls="font-light text-ink/70">
        16/09/2025
      </Txt>
      {/* birthday 2 — Pooja */}
      <div
        className="absolute rounded-[32px] border border-[#D6D6D6] bg-white"
        style={{ left: 1025, top: 605, width: 326, height: 62 }}
      />
      <div className="absolute flex items-center justify-center text-[20px] leading-none" style={{ left: 1037, top: 624, width: 24, height: 24 }}>
        🎂
      </div>
      <Txt l={1071} t={619} s={12} lh={24} cls="font-light text-ink/70">
        Happy birthday
      </Txt>
      <Avatar l={1071} t={637} d={16} bg="#DDF7FF" color="#0F7D9E" letter="P" fs={8} />
      <Txt l={1092} t={637} s={14} lh={24} cls="font-normal text-ink">
        Pooja Sharma
      </Txt>
      <div className="absolute text-[16px] leading-none" style={{ left: 1188, top: 607 }}>
        🎉
      </div>
      <Txt l={1269} t={624} s={12} lh={24} cls="font-light text-ink/70">
        22/09/2025
      </Txt>

      {/* ---------- Card 3 : Holidays ---------- */}
      <div
        className="absolute rounded-[12px]"
        style={{ left: 1014, top: 731, width: 352, height: 241, background: "rgba(255,255,255,0.6)" }}
      />
      <div className="absolute rounded-[12px] bg-white" style={{ left: 1024, top: 770, width: 327, height: 188 }} />
      <Txt l={1024} t={739} s={12} lh={24} cls="font-normal text-ink">
        Holidays
      </Txt>
      <MonthPill x={1262} y={731} />
      {/* date label + divider */}
      <Txt l={1024} t={770} s={12} lh={16} cls="font-normal text-ink/70">
        24/09/25
      </Txt>
      <div className="absolute" style={{ left: 1086, top: 779.5, width: 92, height: 1, background: "#D0D0D0" }} />
      {/* Holiday row */}
      <div
        className="absolute rounded-[32px] border border-[#D6D6D6] bg-white"
        style={{ left: 1024, top: 801, width: 318, height: 62 }}
      />
      <Avatar l={1031} t={811} d={42} bg="#87DFA9" />
      <Txt l={1079} t={823} s={14} lh={24} cls="font-normal text-ink/90">
        Holiday
      </Txt>
    </>
  );
}
