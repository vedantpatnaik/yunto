import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useLeaves, useUpdate } from "@/api/hooks";
import {
  Search,
  Users,
  UserX,
  House,
  ArrowUp,
  ArrowDown,
  Calendar,
  ChevronDown,
  Plus,
  Waves,
  AlignJustify,
  FileText,
  X,
} from "lucide-react";

/**
 * Super Admin — People / Leave Request screen.
 * Exact reconstruction of Figma frame 4870:73295 ("Super Admin-people (leave request)"), 1440×1024.
 *
 * The screen's defining content is the "Leave Request" modal (approve/reject leave
 * applications) opened over its own 50%-black backdrop — that modal + backdrop are
 * reproduced. The CLEAN rule's "profile dropdown" popup (Rohit Kumar / Super Admin /
 * Agency Code menu) is NOT present in this frame, so nothing is skipped there.
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
      className={`absolute flex items-center gap-[8px] rounded-[24px] pl-[13px] ${
        onClick ? "cursor-pointer " : ""
      }${active ? "bg-black text-white" : "bg-white text-ink"}`}
      style={{ left: x, top: 233, width: w, height: 45 }}
    >
      <Icon className="h-[15px] w-[16px]" strokeWidth={1.6} />
      <span className="text-[14px] font-light leading-none">{label}</span>
    </div>
  );
}

/* ----------------------- header action / dropdown pills ----------------- */
function ActionPill({
  x,
  w,
  label,
  chevron,
  onClick,
}: {
  x: number;
  w: number;
  label: string;
  chevron?: boolean;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={`absolute flex items-center justify-between overflow-hidden rounded-[28px] bg-white/90 pl-[10px] pr-[9px]${
        onClick ? " cursor-pointer" : ""
      }`}
      style={{ left: x, top: 233, width: w, height: 45 }}
    >
      <span className="whitespace-nowrap text-[14px] font-light leading-none text-black/[0.99]">{label}</span>
      {chevron ? (
        <ChevronDown className="h-[15px] w-[15px] shrink-0 text-ink" strokeWidth={1.7} />
      ) : (
        <Plus className="h-[12px] w-[12px] shrink-0 text-ink" strokeWidth={1.8} />
      )}
    </div>
  );
}

/* -------------------------- right-column October pill ------------------- */
function MonthPill({ x, y }: { x: number; y: number }) {
  return (
    <div
      className="absolute flex items-center gap-[6px] rounded-[28px] bg-white/90 pl-[16px] pr-[12px]"
      style={{ left: x, top: y, width: 101, height: 28 }}
    >
      <span className="whitespace-nowrap text-[14px] font-light leading-none text-black/[0.99]">October</span>
      <ChevronDown className="h-[13px] w-[13px] shrink-0 text-ink" strokeWidth={1.7} />
    </div>
  );
}

/* ------------------------------ party bunting --------------------------- */
function Bunting({ x, y }: { x: number; y: number }) {
  const colors = ["#F4ABBA", "#F5C84B", "#7FD1E8", "#B7A3E0"];
  const n = 11;
  const w = 154 / n;
  const fw = w - 3; // flag width, leaving a gap
  return (
    <svg
      className="absolute"
      style={{ left: x, top: y }}
      width={154}
      height={15}
      viewBox="0 0 154 15"
      fill="none"
    >
      <path d="M0 4 Q77 8 154 4" stroke="#C9B368" strokeWidth={0.9} fill="none" />
      {Array.from({ length: n }).map((_, i) => {
        const lx = i * w + 1.5;
        return (
          <path
            key={i}
            d={`M${lx} 4 L${lx + fw} 4 L${lx + fw / 2} 11 Z`}
            fill={colors[i % colors.length]}
          />
        );
      })}
    </svg>
  );
}

/* --------------------------- small day badge glyph ---------------------- */
function DayBadge({
  x,
  y,
  bg,
  color,
  letter,
}: {
  x: number;
  y: number;
  bg: string;
  color: string;
  letter: string;
}) {
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

/* ------------------------------ leave row (modal) ----------------------- */
function LeaveRow({
  top,
  avatarGrad,
  name,
  role,
  email,
  date,
  onApprove,
  onReject,
}: {
  top: number;
  avatarGrad: string;
  name: string;
  role: string;
  email: string;
  date: string;
  onApprove?: () => void;
  onReject?: () => void;
}) {
  return (
    <>
      {/* person + reason container */}
      <div
        className="absolute rounded-[32px] border border-[#D9D9D9] bg-white/90"
        style={{ left: 391, top, width: 470, height: 62 }}
      />
      <div
        className="absolute rounded-full"
        style={{ left: 398, top: top + 10, width: 42, height: 42, background: avatarGrad }}
      />
      <Txt l={446} t={top + 10} s={14} lh={18} cls="font-normal text-black/90">
        {name}
      </Txt>
      <Txt l={548} t={top + 12.5} s={10} lh={13} cls="font-light text-black/70">
        {role}
      </Txt>
      <Txt l={448} t={top + 28} s={10} lh={13} cls="font-light text-black/70">
        {email}
      </Txt>
      <Txt l={448} t={top + 44} s={10} lh={13} cls="font-normal" >
        <span style={{ color: "rgba(13,115,45,0.7)" }}>{date}</span>
      </Txt>
      {/* divider */}
      <div
        className="absolute bg-black/10"
        style={{ left: 659, top: top + 7, width: 1, height: 47 }}
      />
      {/* reason */}
      <Txt l={675} t={top + 7} s={12} lh={16} cls="font-normal text-black/90">
        Reason for leave
      </Txt>
      <Txt l={675} t={top + 31} s={10} lh={13} cls="font-light text-black/70">
        Sick Leave
      </Txt>
      {/* pdf chip */}
      <div
        className="absolute flex items-center gap-[3px] rounded-[7px] border border-black/10 bg-white pl-[5px] pr-[6px]"
        style={{ left: 739, top: top + 28, height: 23 }}
      >
        <FileText className="h-[13px] w-[13px] text-[#D14343]" strokeWidth={1.6} />
        <span className="text-[10.3px] font-light leading-none text-black/70">Medical..pdf</span>
      </div>
      {/* approve / reject */}
      <div
        onClick={onApprove}
        className="absolute flex cursor-pointer items-center justify-center rounded-[24px] border-[0.5px] border-[#4150F7] bg-white"
        style={{ left: 878, top: top + 11, width: 82, height: 40 }}
      >
        <span className="text-[13px] font-normal leading-none text-[#4150F7]">Approve</span>
      </div>
      <div
        onClick={onReject}
        className="absolute flex cursor-pointer items-center justify-center rounded-[24px] border-[0.5px] border-[#D6D6D6] bg-white"
        style={{ left: 970, top: top + 11, width: 76, height: 40 }}
      >
        <span className="text-[13px] font-normal leading-none text-ink">Reject</span>
      </div>
    </>
  );
}

/* ------------------------------ calendar data --------------------------- */
const COLS = [250, 358, 466, 574, 682, 790, 898];
const ROWS = [479, 577, 675, 773, 871];
const GRID: number[][] = [
  [1, 2, 3, 4, 5, 6, 7],
  [8, 9, 10, 11, 12, 13, 14],
  [15, 16, 17, 18, 19, 20, 21],
  [22, 23, 24, 25, 26, 27, 28],
  [29, 30, 31, 1, 2, 3, 4],
];
const WEEKDAYS: { label: string; x: number; color: string }[] = [
  { label: "Mon", x: 282, color: "#000000" },
  { label: "Tue", x: 393, color: "#000000" },
  { label: "Wed", x: 497, color: "#000000" },
  { label: "Thu", x: 608, color: "#000000" },
  { label: "Fri", x: 721, color: "#000000" },
  { label: "Sat", x: 826, color: "#D85859" },
  { label: "Sun", x: 933, color: "#D43131" },
];

/* -------------------------------- page --------------------------------- */
export default function LeaveRequestPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const idParam = params.get("id");
  const { data: leaves } = useLeaves();
  const leave = idParam
    ? leaves?.find((l) => l.id === idParam)
    : leaves?.find((l) => l.status === "PENDING") ?? leaves?.[0];
  const upd = useUpdate("leaves");

  const decide = (status: "APPROVED" | "REJECTED") => {
    try {
      if (leave?.id) {
        upd.mutate({ id: leave.id, data: { status } });
      }
      navigate("/people/leaves");
    } catch {
      navigate("/people/leaves");
    }
  };
  return (
    <>
      {/* ===== page background (frame fill) ===== */}
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

      {/* ===== search + filter group next to title ===== */}
      <div
        onClick={() => navigate("/search")}
        className="absolute flex cursor-pointer items-center justify-center rounded-full bg-white"
        style={{ left: 488, top: 151.5, width: 45, height: 45 }}
      >
        <Search className="h-[22px] w-[22px] text-ink" strokeWidth={1.7} />
      </div>
      <div
        className="absolute flex items-center rounded-[24px] bg-white pl-[12px]"
        style={{ left: 541, top: 150, width: 72, height: 48 }}
      >
        <Users className="h-[16px] w-[22px] text-ink" strokeWidth={1.6} />
        <span
          className="absolute flex items-center justify-center rounded-full text-[10px] font-normal text-white"
          style={{ left: 46, top: 17, width: 14, height: 14, background: "#20A271" }}
        >
          4
        </span>
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

      {/* ===== calendar panel outline (notched, border only) ===== */}
      <div
        className="absolute"
        style={{
          left: 242,
          top: 224,
          width: 764,
          height: 769,
          border: "1px solid #D4D4D4",
          borderRadius: 24,
          clipPath:
            "polygon(414px 0, 764px 0, 764px 769px, 0 769px, 0 63px, 414px 63px)",
        }}
      />

      {/* ===== tabs ===== */}
      <Tab x={242} w={107} icon={Waves} label="People" onClick={() => navigate("/people")} />
      <Tab x={357} w={122} active icon={AlignJustify} label="Leaves" onClick={() => navigate("/people/leaves")} />
      <Tab x={482} w={156} icon={AlignJustify} label="Assign Creators" onClick={() => navigate("/people/assign-creators")} />

      {/* ===== header action pills ===== */}
      <ActionPill x={664} w={100} label="Add Holiday" onClick={() => navigate("/people/holidays")} />
      <ActionPill x={770} w={114} label="Apply for leave" onClick={() => navigate("/people/apply-leave")} />
      <ActionPill x={890} w={108} label="October" chevron />

      {/* ===== Leave Balance ===== */}
      <Txt l={257} t={306} s={18} lh={24} cls="font-light text-ink">
        Leave Balance
      </Txt>
      {/* Causal Leave */}
      <div
        className="absolute rounded-[32px] border border-black/10 bg-white"
        style={{ left: 257, top: 342, width: 153, height: 62 }}
      />
      <div
        className="absolute flex items-center justify-center rounded-full border"
        style={{ left: 264, top: 352, width: 42, height: 42, borderColor: "#731FB4" }}
      >
        <span className="text-[14px] font-normal leading-none text-[#6000AA]">02</span>
      </div>
      <Txt l={311} t={364} s={14} lh={24} cls="font-normal text-black/90">
        Causal Leave
      </Txt>
      {/* Sick Leave */}
      <div
        className="absolute rounded-[32px] border border-black/10 bg-white"
        style={{ left: 427, top: 342, width: 153, height: 62 }}
      />
      <div
        className="absolute flex items-center justify-center rounded-full border"
        style={{ left: 434, top: 352, width: 42, height: 42, borderColor: "#6CA478" }}
      >
        <span className="text-[14px] font-normal leading-none text-[#6CA478]">01</span>
      </div>
      <Txt l={481} t={364} s={14} lh={24} cls="font-normal text-black/90">
        Sick Leave
      </Txt>

      {/* ===== weekday headers ===== */}
      {WEEKDAYS.map((d) => (
        <Txt key={d.label} l={d.x} t={445} s={18} lh={24} cls="font-light" >
          <span style={{ color: d.color }}>{d.label}</span>
        </Txt>
      ))}

      {/* ===== calendar grid cells ===== */}
      {ROWS.map((ry, r) =>
        COLS.map((cx, c) => {
          const day = GRID[r][c];
          const isSun = c === 6;
          const isToday = r === 0 && c === 3; // the 4th
          return (
            <div
              key={`cell-${r}-${c}`}
              className="absolute rounded-[18px]"
              style={{
                left: cx,
                top: ry,
                width: 100,
                height: 90,
                background: isSun ? "rgba(255,255,255,0.5)" : "#FFFFFF",
              }}
            >
              {isToday ? (
                <div
                  className="absolute flex items-center justify-center rounded-[22px]"
                  style={{ left: 5, top: 6, width: 42, height: 44, background: "#D4EBF9" }}
                >
                  <span className="text-[20px] font-normal leading-[24px] text-ink">{day}</span>
                </div>
              ) : (
                <span
                  className="absolute text-[20px] font-normal leading-[24px] text-ink"
                  style={{ left: 15, top: 16 }}
                >
                  {day}
                </span>
              )}
            </div>
          );
        })
      )}

      {/* ===== day decorations (over cells) ===== */}
      {/* 4th — today */}
      <DayBadge x={640} y={535} bg="#C6A6DF" color="#6000AA" letter="T" />
      {/* 12th */}
      <DayBadge x={750} y={637} bg="#C4F1D2" color="#007726" letter="S" />
      {/* 16th cake */}
      <div className="absolute text-[13px] leading-none" style={{ left: 430, top: 690 }}>
        🎂
      </div>
      {/* 22nd cake */}
      <div className="absolute text-[13px] leading-none" style={{ left: 322, top: 788 }}>
        🎂
      </div>
      {/* 24th holiday chip */}
      <div
        className="absolute flex items-center gap-[3px] rounded-full bg-white pl-[5px] pr-[6px]"
        style={{ left: 478, top: 818, height: 26, border: "0.6px solid #E4E4E4" }}
      >
        <span className="h-[8px] w-[8px] rounded-full" style={{ background: "#88DFA9" }} />
        <span className="text-[10px] font-normal leading-none text-black/80">Holiday</span>
      </div>
      {/* 25th — overlapping K + P */}
      <DayBadge x={640} y={830} bg="#D4CFFF" color="#1A0C9A" letter="K" />
      <DayBadge x={624} y={830} bg="#FFE3CF" color="#DB6714" letter="P" />

      {/* =============================================================== */}
      {/* ===== right column cards =====                                  */}
      {/* =============================================================== */}

      {/* ---- On leave ---- */}
      <div
        className="absolute rounded-[12px]"
        style={{ left: 1015, top: 223, width: 352, height: 241, background: "rgba(255,255,255,0.6)" }}
      />
      <Txt l={1025} t={231} s={12} lh={24} cls="font-normal text-ink">
        On leave
      </Txt>
      <MonthPill x={1263} y={223} />
      <div className="absolute rounded-[12px] bg-white" style={{ left: 1025, top: 262, width: 327, height: 188 }} />
      <Txt l={1025} t={264} s={12} lh={16} cls="font-normal text-black/70">
        Today
      </Txt>
      <div className="absolute bg-black/10" style={{ left: 1066, top: 271.5, width: 92, height: 1 }} />
      {/* Tanvi leave entry */}
      <div
        className="absolute rounded-[32px] border border-[#D6D6D6] bg-white"
        style={{ left: 1025, top: 293, width: 318, height: 62 }}
      />
      <div
        className="absolute flex items-center justify-center rounded-full"
        style={{ left: 1032, top: 303, width: 42, height: 42, background: "#C6A6DF" }}
      >
        <span className="text-[14px] font-normal leading-none text-[#6000AA]">T</span>
      </div>
      <Txt l={1079} t={304} s={14} lh={18} cls="font-normal text-black/90">
        Tanvi Sharma
      </Txt>
      <Txt l={1181} t={306.5} s={10} lh={13} cls="font-light text-black/70">
        Operations
      </Txt>
      <Txt l={1079} t={323} s={10} lh={12} w={90} cls="font-light text-black/70">
        Rep. Manager: Vishal Sharma
      </Txt>
      <Txt l={1181} t={330} s={10} lh={13} cls="font-light text-black/70">
        Sick Leave
      </Txt>
      <div
        className="absolute flex items-center gap-[3px] rounded-[7px] border border-black/10 bg-white pl-[5px] pr-[6px]"
        style={{ left: 1245, top: 325, height: 23 }}
      >
        <FileText className="h-[13px] w-[13px] text-[#D14343]" strokeWidth={1.6} />
        <span className="text-[10.3px] font-light leading-none text-black/70">Medical..pdf</span>
      </div>

      {/* ---- Upcoming Events ---- */}
      <div
        className="absolute rounded-[12px]"
        style={{ left: 1015, top: 476, width: 352, height: 241, background: "rgba(255,255,255,0.6)" }}
      />
      <Txt l={1025} t={484} s={12} lh={24} cls="font-normal text-ink">
        Upcoming Events
      </Txt>
      <MonthPill x={1263} y={476} />
      <div className="absolute rounded-[12px] bg-white" style={{ left: 1025, top: 515, width: 327, height: 188 }} />
      {/* birthday row 1 */}
      <div className="absolute rounded-[32px] bg-white" style={{ left: 1025, top: 531, width: 326, height: 62 }} />
      <div className="absolute text-[18px] leading-none" style={{ left: 1037, top: 549 }}>
        🎂
      </div>
      <Txt l={1071} t={545} s={12} lh={16} cls="font-light text-black/70">
        Happy birthday
      </Txt>
      <div
        className="absolute flex items-center justify-center rounded-full"
        style={{ left: 1071, top: 563, width: 16, height: 16, background: "#C6A6DF" }}
      >
        <span className="text-[8px] font-normal leading-none text-[#6000AA]">T</span>
      </div>
      <Txt l={1092} t={563} s={14} lh={16} cls="font-normal text-ink">
        Tanvi Sharma
      </Txt>
      <Bunting x={1167} y={533} />
      <Txt l={1269} t={550} s={12} lh={24} cls="font-light text-black/70">
        16/09/2025
      </Txt>
      {/* birthday row 2 */}
      <div className="absolute rounded-[32px] bg-white" style={{ left: 1025, top: 605, width: 326, height: 62 }} />
      <div className="absolute text-[18px] leading-none" style={{ left: 1037, top: 623 }}>
        🎂
      </div>
      <Txt l={1071} t={619} s={12} lh={16} cls="font-light text-black/70">
        Happy birthday
      </Txt>
      <div
        className="absolute flex items-center justify-center rounded-full"
        style={{ left: 1071, top: 637, width: 16, height: 16, background: "#DDF7FF" }}
      >
        <span className="text-[8px] font-normal leading-none text-[#0F7D9E]">P</span>
      </div>
      <Txt l={1092} t={637} s={14} lh={16} cls="font-normal text-ink">
        Pooja Sharma
      </Txt>
      <Bunting x={1167} y={607} />
      <Txt l={1269} t={624} s={12} lh={24} cls="font-light text-black/70">
        22/09/2025
      </Txt>

      {/* ---- Holidays ---- */}
      <div
        className="absolute rounded-[12px]"
        style={{ left: 1014, top: 731, width: 352, height: 241, background: "rgba(255,255,255,0.6)" }}
      />
      <Txt l={1024} t={739} s={12} lh={24} cls="font-normal text-ink">
        Holidays
      </Txt>
      <MonthPill x={1262} y={731} />
      <div className="absolute rounded-[12px] bg-white" style={{ left: 1024, top: 770, width: 327, height: 188 }} />
      <Txt l={1024} t={772} s={12} lh={16} cls="font-normal text-black/70">
        24/09/25
      </Txt>
      <div className="absolute bg-black/10" style={{ left: 1086, top: 779.5, width: 92, height: 1 }} />
      <div
        className="absolute rounded-[32px] border border-[#D6D6D6] bg-white"
        style={{ left: 1024, top: 801, width: 318, height: 62 }}
      />
      <div
        className="absolute rounded-full"
        style={{ left: 1031, top: 811, width: 42, height: 42, background: "#88DFA9" }}
      />
      <Txt l={1079} t={823} s={14} lh={24} cls="font-normal text-black/90">
        Holiday
      </Txt>

      {/* =============================================================== */}
      {/* ===== dim backdrop + Leave Request modal =====                  */}
      {/* =============================================================== */}
      <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.5)" }} />

      <div
        className="absolute rounded-[24px] bg-white"
        style={{ left: 372, top: 390.5, width: 697, height: 243 }}
      />
      {/* header */}
      <Txt l={391} t={410.5} s={24} lh={32} cls="font-medium text-ink">
        Leave Request
      </Txt>
      <div
        onClick={() => navigate(-1)}
        className="absolute flex cursor-pointer items-center justify-center rounded-full border border-black bg-white"
        style={{ left: 998, top: 410.5, width: 45, height: 45 }}
      >
        <X className="h-[18px] w-[18px] text-ink" strokeWidth={1.8} />
      </div>

      {/* rows */}
      <LeaveRow
        top={469.5}
        avatarGrad="linear-gradient(135deg, #FCE0C8 0%, #E39A63 100%)"
        name="Harsh Negi"
        role="Social media intern"
        email="harshnegi@gmail.com"
        date="Date: 9/09/25 (One day)"
        onApprove={() => decide("APPROVED")}
        onReject={() => decide("REJECTED")}
      />
      <LeaveRow
        top={541.5}
        avatarGrad="linear-gradient(135deg, #F6C9DA 0%, #C07CA0 100%)"
        name="Tanya Sharma"
        role="Graphic Design"
        email="tanvi1@gmail.com"
        date="Date: 5/09/25 (One day)"
        onApprove={() => decide("APPROVED")}
        onReject={() => decide("REJECTED")}
      />
    </>
  );
}
