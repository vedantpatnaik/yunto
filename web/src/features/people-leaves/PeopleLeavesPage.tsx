import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLeaves, useUsers } from "@/api/hooks";
import {
  Search,
  Users,
  UserX,
  House,
  Sparkles,
  AlignJustify,
  ChevronDown,
  ArrowUp,
  ArrowDown,
  Cake,
  Calendar,
  FileText,
} from "lucide-react";

/**
 * Super Admin — People / Leaves tab.
 * Exact reconstruction of Figma frame 5509:12727 ("Super Admin - people (Leaves)"),
 * 1440×1024. Built CLEAN — the captured profile popup + dim scrim are omitted.
 */

/* -------------------------------- calendar data ------------------------------ */
const COLS = [249, 357, 465, 573, 681, 789, 897];
const ROWS = [473, 571, 669, 767, 865];
const DAYS = [
  [1, 2, 3, 4, 5, 6, 7],
  [8, 9, 10, 11, 12, 13, 14],
  [15, 16, 17, 18, 19, 20, 21],
  [22, 23, 24, 25, 26, 27, 28],
  [29, 30, 31, 1, 2, 3, 4],
];

const WEEKDAYS: { label: string; left: number; color: string }[] = [
  { label: "Mon", left: 281, color: "#000000" },
  { label: "Tue", left: 392, color: "#000000" },
  { label: "Wed", left: 496, color: "#000000" },
  { label: "Thu", left: 607, color: "#000000" },
  { label: "Fri", left: 720, color: "#000000" },
  { label: "Sat", left: 825, color: "#D85859" },
  { label: "Sun", left: 932, color: "#D43131" },
];

/* -------------------------------- primitives -------------------------------- */
function LetterDot({ left, top, bg, color, letter }: {
  left: number; top: number; bg: string; color: string; letter: string;
}) {
  return (
    <span
      className="absolute flex items-center justify-center rounded-full"
      style={{ left, top, width: 24, height: 24, background: bg }}
    >
      <span className="text-[8px] font-normal leading-none" style={{ color }}>{letter}</span>
    </span>
  );
}

function StatItem({ numX, num, badgeX, dir, badgeColor, Icon, iconText, labelX, label }: {
  numX: number; num: string; badgeX: number; dir: "up" | "down"; badgeColor: string;
  Icon?: LucideIcon; iconText?: string; labelX: number; label: string;
}) {
  return (
    <>
      <span
        className="absolute text-[48px] font-normal leading-none text-black"
        style={{ left: numX, top: 133 }}
      >
        {num}
      </span>
      <span
        className="absolute flex h-[15px] w-[32px] items-center justify-center gap-[2px] rounded-[9px]"
        style={{ left: badgeX, top: 140, background: badgeColor }}
      >
        {dir === "up" ? (
          <ArrowUp className="h-[9px] w-[9px] text-black" strokeWidth={2} />
        ) : (
          <ArrowDown className="h-[9px] w-[9px] text-black" strokeWidth={2} />
        )}
        {Icon ? (
          <Icon className="h-[11px] w-[11px] text-black" strokeWidth={1.4} />
        ) : (
          <span className="text-[9px] font-normal leading-none text-black">{iconText}</span>
        )}
      </span>
      <span
        className="absolute text-[12px] font-light leading-none text-black/70"
        style={{ left: labelX, top: 168 }}
      >
        {label}
      </span>
    </>
  );
}

function TabButton({ x, w, active, Icon, label, onClick }: {
  x: number; w: number; active?: boolean; Icon: LucideIcon; label: string; onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={`absolute flex h-[45px] cursor-pointer items-center gap-[8px] rounded-[24px] px-[12px] ${active ? "bg-black" : "bg-white"}`}
      style={{ left: x, top: 228, width: w }}
    >
      <Icon className={`h-[20px] w-[20px] ${active ? "text-white" : "text-black"}`} strokeWidth={1.6} />
      <span className={`text-[14px] font-light leading-none ${active ? "text-white" : "text-black"}`}>{label}</span>
    </div>
  );
}

function ActionPill({ x, y, w, label, onClick }: {
  x: number; y: number; w: number; label: string; onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className="absolute flex h-[45px] cursor-pointer items-center justify-center rounded-[28px] px-[14px]"
      style={{ left: x, top: y, width: w, background: "rgba(255,255,255,0.9)" }}
    >
      <span className="whitespace-nowrap text-[14px] font-light leading-none text-black">{label}</span>
    </div>
  );
}

function LeaveBalancePill({ x, num, numColor, borderColor, label }: {
  x: number; num: string; numColor: string; borderColor: string; label: string;
}) {
  return (
    <div
      className="absolute flex h-[62px] items-center gap-[7px] rounded-[32px] border border-black bg-white pl-[7px] pr-[16px]"
      style={{ left: x, top: 336, width: 153 }}
    >
      <span
        className="flex h-[42px] w-[42px] items-center justify-center rounded-full border"
        style={{ borderColor }}
      >
        <span className="text-[14px] font-normal leading-none" style={{ color: numColor }}>{num}</span>
      </span>
      <span className="text-[14px] font-normal leading-none text-black/90">{label}</span>
    </div>
  );
}

/** Shell for the three translucent side cards: bg + white panel + title + October pill. */
function RightCardShell({ cx, cy, px, py, title, titleX, titleY, octX, octY }: {
  cx: number; cy: number; px: number; py: number;
  title: string; titleX: number; titleY: number; octX: number; octY: number;
}) {
  return (
    <>
      <div
        className="absolute rounded-[12px]"
        style={{ left: cx, top: cy, width: 352, height: 241, background: "rgba(255,255,255,0.6)" }}
      />
      <div className="absolute rounded-[12px] bg-white" style={{ left: px, top: py, width: 327, height: 188 }} />
      <span className="absolute text-[12px] font-normal leading-none text-black" style={{ left: titleX, top: titleY }}>
        {title}
      </span>
      <div
        className="absolute flex h-[28px] items-center gap-[6px] rounded-[28px] px-[14px]"
        style={{ left: octX, top: octY, width: 101, background: "rgba(255,255,255,0.9)" }}
      >
        <span className="text-[14px] font-light leading-none text-black">October</span>
        <ChevronDown className="h-[14px] w-[14px] text-black" strokeWidth={1.5} />
      </div>
    </>
  );
}

/** White content row shared by leave / birthday / holiday entries. */
function ContentRow({ x, y, w, children }: { x: number; y: number; w: number; children: ReactNode }) {
  return (
    <div
      className="absolute rounded-[32px] border border-[#D6D6D6] bg-white"
      style={{ left: x, top: y, width: w, height: 62 }}
    >
      {children}
    </div>
  );
}

/* ---------------------------------- page ------------------------------------ */
export default function PeopleLeavesPage() {
  const navigate = useNavigate();
  const { data: leaves } = useLeaves();
  const { data: users } = useUsers();
  const userById = new Map((users ?? []).map((u) => [u.id, u] as const));
  // "On leave" card — design shows a single row; each is a distinct real leave.
  const onLeave = (leaves ?? []).slice(0, 1).map((lv) => {
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
      {/* PEOPLE title */}
      <h1 className="absolute left-[259px] top-[158px] text-[40px] font-normal leading-[50px] text-black">PEOPLE</h1>

      {/* search + contacts */}
      <div
        onClick={() => navigate("/search")}
        className="absolute left-[488px] top-[151px] flex h-[45px] w-[45px] cursor-pointer items-center justify-center rounded-[23px] bg-white"
      >
        <Search className="h-[18px] w-[18px] text-black" strokeWidth={1.7} />
      </div>
      <div
        onClick={() => navigate("/contacts")}
        className="absolute left-[541px] top-[150px] h-[48px] w-[72px] cursor-pointer rounded-[24px] bg-white"
      >
        <Users className="absolute left-[23px] top-[16px] h-[16px] w-[26px] text-black" strokeWidth={1.6} />
        <span className="absolute left-[46px] top-[17px] flex h-[14px] w-[14px] items-center justify-center rounded-full bg-[#20A271]">
          <span className="text-[9px] font-normal leading-none text-white">4</span>
        </span>
      </div>

      {/* attendance stats */}
      <StatItem numX={810} num="18" badgeX={871} dir="up" badgeColor="#DCFF68" Icon={Users} labelX={855} label="Present" />
      <StatItem numX={938} num="2" badgeX={999} dir="down" badgeColor="#FFB0B1" Icon={UserX} labelX={983} label="Absent" />
      <StatItem numX={1066} num="0" badgeX={1127} dir="up" badgeColor="#DCFF68" Icon={House} labelX={1111} label="WFH" />
      <StatItem numX={1194} num="1" badgeX={1255} dir="up" badgeColor="#DCFF68" iconText="1" labelX={1239} label="Half Day" />

      {/* date pill (top-right) */}
      <div
        onClick={() => navigate("/calendar")}
        className="absolute left-[1299px] top-[151px] flex h-[32px] cursor-pointer items-center gap-[3px] rounded-[18px] border-[0.5px] border-[#D9D9D9] bg-white pl-[3px] pr-[9px]"
      >
        <span className="flex h-[24px] w-[24px] items-center justify-center rounded-full bg-[#F1F1F1]">
          <Calendar className="h-[14px] w-[14px] text-black" strokeWidth={1.4} />
        </span>
        <span className="text-[12px] font-light leading-none text-black/90">30/09/25</span>
      </div>

      {/* tabs */}
      <TabButton x={241} w={107} Icon={Sparkles} label="People" onClick={() => navigate("/people")} />
      <TabButton x={356} w={122} active Icon={AlignJustify} label="Leaves" onClick={() => navigate("/people/leaves")} />
      <TabButton x={486} w={156} Icon={AlignJustify} label="Assign Creators" onClick={() => navigate("/people/assign-creators")} />

      {/* action pills */}
      <ActionPill x={664} y={233} w={100} label="Add Holiday" onClick={() => navigate("/people/holidays")} />
      <ActionPill x={769} y={227} w={114} label="Apply for leave" onClick={() => navigate("/people/apply-leave")} />
      <div
        className="absolute flex h-[45px] items-center gap-[8px] rounded-[28px] px-[16px]"
        style={{ left: 889, top: 227, width: 108, background: "rgba(255,255,255,0.9)" }}
      >
        <span className="text-[14px] font-light leading-none text-black">October</span>
        <ChevronDown className="h-[16px] w-[16px] text-black" strokeWidth={1.6} />
      </div>

      {/* calendar card outline (rounded rect with top-left notch for the tabs) */}
      <svg
        className="absolute"
        style={{ left: 240, top: 221 }}
        width={766}
        height={771}
        viewBox="0 0 766 771"
        fill="none"
      >
        <path
          d="M 25,61 L 414.8,61 L 414.8,1 L 741,1 A 24,24 0 0 1 765,25 L 765,746 A 24,24 0 0 1 741,770 L 25,770 A 24,24 0 0 1 1,746 L 1,85 A 24,24 0 0 1 25,61 Z"
          stroke="#D4D4D4"
          strokeWidth={1}
        />
      </svg>

      {/* Leave Balance */}
      <span className="absolute left-[258px] top-[300px] text-[18px] font-light leading-none text-black">Leave Balance</span>
      <LeaveBalancePill x={259} num="02" numColor="#6000AA" borderColor="#7420B4" label="Causal Leave" />
      <LeaveBalancePill x={420} num="01" numColor="#6CA478" borderColor="#6CA478" label="Sick Leave" />

      {/* weekday headers */}
      {WEEKDAYS.map((w) => (
        <span
          key={w.label}
          className="absolute text-[18px] font-light leading-[24px]"
          style={{ left: w.left, top: 439, color: w.color }}
        >
          {w.label}
        </span>
      ))}

      {/* day cells */}
      {ROWS.map((ry, r) =>
        COLS.map((cx, c) => {
          const isSun = c === 6;
          const isToday = r === 0 && c === 3;
          return (
            <div
              key={`cell-${r}-${c}`}
              className={`absolute rounded-[18px] ${isSun ? "" : "bg-white"} ${isToday ? "border border-[#3981AB]" : ""}`}
              style={{ left: cx, top: ry, width: 100, height: 90 }}
            />
          );
        }),
      )}

      {/* day numbers (today rendered separately inside its blue chip) */}
      {ROWS.map((ry, r) =>
        COLS.map((cx, c) =>
          r === 0 && c === 3 ? null : (
            <span
              key={`num-${r}-${c}`}
              className="absolute text-[20px] font-normal leading-[24px] text-black"
              style={{ left: cx + 15, top: ry + 16 }}
            >
              {DAYS[r][c]}
            </span>
          ),
        ),
      )}

      {/* today (4) — blue chip */}
      <div
        className="absolute flex items-center justify-center rounded-[80px] bg-[#D4EBF9]"
        style={{ left: 578, top: 479, width: 42, height: 44 }}
      >
        <span className="text-[20px] font-normal leading-[24px] text-black">4</span>
      </div>

      {/* leave / event markers */}
      <LetterDot left={639} top={529} bg="#C6A6DF" color="#6000AA" letter="T" />
      <LetterDot left={749} top={631} bg="#C4F1D2" color="#007726" letter="S" />
      <LetterDot left={623} top={824} bg="#FFE3CF" color="#DB6714" letter="P" />
      <LetterDot left={639} top={824} bg="#D4CFFF" color="#1A0C9A" letter="K" />

      {/* birthday cakes */}
      <Cake className="absolute h-[16px] w-[16px] text-[#DD2E44]" style={{ left: 429, top: 685 }} strokeWidth={1.4} />
      <Cake className="absolute h-[16px] w-[16px] text-[#DD2E44]" style={{ left: 321, top: 783 }} strokeWidth={1.4} />

      {/* holiday pill on day 24 */}
      <div
        className="absolute flex h-[26px] items-center gap-[4px] rounded-full bg-white px-[6px]"
        style={{ left: 477, top: 812 }}
      >
        <span className="h-[8px] w-[8px] rounded-full bg-[#88DFA9]" />
        <span className="text-[10px] font-normal leading-none text-black/80">Holiday</span>
      </div>

      {/* ===================== RIGHT COLUMN — On leave ===================== */}
      <RightCardShell cx={1015} cy={222} px={1025} py={261} title="On leave" titleX={1025} titleY={234} octX={1263} octY={222} />
      <span className="absolute left-[1025px] top-[265px] text-[12px] font-normal leading-none text-black/70">Today</span>
      <div className="absolute left-[1066px] top-[270px] h-px w-[92px] bg-[#D0D0D0]" />
      {onLeave.map((row) => (
        <ContentRow key={row.id} x={1025} y={292} w={318}>
          <span className="absolute left-[7px] top-[10px] flex h-[42px] w-[42px] items-center justify-center rounded-full bg-[#C6A6DF]">
            <span className="text-[14px] font-normal leading-none text-[#6000AA]">{row.initial}</span>
          </span>
          <span className="absolute left-[54px] top-[11px] text-[14px] font-normal leading-none text-black/90">{row.name}</span>
          <span className="absolute left-[156px] top-[13px] text-[10px] font-light leading-none text-black/70">{row.department}</span>
          <span className="absolute left-[54px] top-[30px] w-[95px] text-[10px] font-light leading-[12px] text-black/70">Rep. Manager: Vishal Sharma</span>
          <span className="absolute left-[142px] top-[37px] text-[10px] font-light leading-none text-black/70">{row.leaveType}</span>
          <div className="absolute left-[206px] top-[32px] flex h-[23px] w-[87px] items-center justify-center gap-[3px] rounded-[7px] border-[0.5px] border-[#D6D6D6] bg-white">
            <span className="text-[10px] font-light leading-none text-black/70">Medical..pdf</span>
            <FileText className="h-[13px] w-[13px] text-black" strokeWidth={1.4} />
          </div>
        </ContentRow>
      ))}

      {/* ===================== RIGHT COLUMN — Upcoming Events ===================== */}
      <RightCardShell cx={1015} cy={483} px={1025} py={522} title="Upcoming Events" titleX={1025} titleY={495} octX={1263} octY={483} />
      {/* birthday row 1 */}
      <ContentRow x={1025} y={538} w={326}>
        <Cake className="absolute left-[12px] top-[16px] h-[24px] w-[24px] text-[#DD2E44]" strokeWidth={1.3} />
        <span className="absolute left-[46px] top-[14px] text-[12px] font-light leading-none text-black/70">Happy birthday</span>
        <span className="absolute left-[46px] top-[33px] flex h-[16px] w-[16px] items-center justify-center rounded-full bg-[#C6A6DF]">
          <span className="text-[8px] font-normal leading-none text-[#6000AA]">T</span>
        </span>
        <span className="absolute left-[67px] top-[32px] text-[14px] font-normal leading-none text-black">Tanvi Sharma</span>
        <span className="absolute left-[244px] top-[20px] text-[12px] font-light leading-none text-black/70">16/09/2025</span>
      </ContentRow>
      {/* birthday row 2 */}
      <ContentRow x={1025} y={612} w={326}>
        <Cake className="absolute left-[12px] top-[16px] h-[24px] w-[24px] text-[#DD2E44]" strokeWidth={1.3} />
        <span className="absolute left-[46px] top-[14px] text-[12px] font-light leading-none text-black/70">Happy birthday</span>
        <span className="absolute left-[46px] top-[33px] flex h-[16px] w-[16px] items-center justify-center rounded-full bg-[#DDF7FF]">
          <span className="text-[8px] font-normal leading-none text-[#0F7D9E]">P</span>
        </span>
        <span className="absolute left-[67px] top-[32px] text-[14px] font-normal leading-none text-black">Pooja Sharma</span>
        <span className="absolute left-[244px] top-[20px] text-[12px] font-light leading-none text-black/70">22/09/2025</span>
      </ContentRow>

      {/* ===================== RIGHT COLUMN — Holidays ===================== */}
      <RightCardShell cx={1014} cy={750} px={1024} py={789} title="Holidays" titleX={1024} titleY={762} octX={1262} octY={750} />
      <span className="absolute left-[1024px] top-[793px] text-[12px] font-normal leading-none text-black/70">24/09/25</span>
      <div className="absolute left-[1086px] top-[798px] h-px w-[92px] bg-[#D0D0D0]" />
      <ContentRow x={1024} y={820} w={318}>
        <span className="absolute left-[7px] top-[10px] h-[42px] w-[42px] rounded-full bg-[#88DFA9]" />
        <span className="absolute left-[55px] top-[22px] text-[14px] font-normal leading-none text-black/90">Holiday</span>
      </ContentRow>
    </>
  );
}
