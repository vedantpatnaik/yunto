import { useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import type { LucideIcon } from "lucide-react";
import { useCreate, useMe } from "@/api/hooks";
import {
  Search,
  Users,
  UserX,
  House,
  Calendar,
  ChevronDown,
  ArrowUp,
  ArrowDown,
  Cake,
  FileText,
  Plus,
  Waves,
  AlignJustify,
  X,
  Paperclip,
  Info,
} from "lucide-react";

/**
 * Super Admin — People / Leaves · "Apply For Leave".
 * Exact reconstruction of Figma frame 5464:11674
 * ("Super Admin - people (apply for Leave)"), 1440×1024.
 *
 * The Apply-For-Leave modal (node 4865:21414) with its own dim backdrop
 * (node 4865:21413, rgba(0,0,0,0.5)) is the subject of this screen, so it is
 * reproduced over the underlying People/Leaves calendar. No profile dropdown
 * is present in this frame.
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

function TabButton({
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
      className={`absolute flex h-[45px] items-center gap-[8px] rounded-[24px] px-[12px] ${active ? "bg-black" : "bg-white"}${onClick ? " cursor-pointer" : ""}`}
      style={{ left: x, top: 233, width: w }}
    >
      <Icon className={`h-[18px] w-[18px] ${active ? "text-white" : "text-ink"}`} strokeWidth={1.6} />
      <span className={`text-[14px] font-light leading-none ${active ? "text-white" : "text-ink"}`}>{label}</span>
    </div>
  );
}

/** Translucent action pill (Add Holiday / Apply for leave / October). */
function ActionPill({ x, w, onClick, children }: { x: number; w: number; onClick?: () => void; children: ReactNode }) {
  return (
    <div
      onClick={onClick}
      className={`absolute rounded-[28px]${onClick ? " cursor-pointer" : ""}`}
      style={{ left: x, top: 233, width: w, height: 45, background: "rgba(255,255,255,0.9)" }}
    >
      {children}
    </div>
  );
}

/** Small 101×28 "October" pill anchored to the top-right of each side card. */
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

/** Shell for a translucent side card: bg + white inner panel + title + month pill. */
function SideCard({
  cx,
  cy,
  px,
  py,
  title,
  octX,
}: {
  cx: number;
  cy: number;
  px: number;
  py: number;
  title: string;
  octX: number;
}) {
  return (
    <>
      <div
        className="absolute rounded-[12px]"
        style={{ left: cx, top: cy, width: 352, height: 241, background: "rgba(255,255,255,0.6)" }}
      />
      <Txt l={px} t={cy + 8} s={12} lh={24} cls="font-normal text-ink">
        {title}
      </Txt>
      <MonthPill x={octX} y={cy} />
      <div className="absolute rounded-[12px] bg-white" style={{ left: px, top: py, width: 327, height: 188 }} />
    </>
  );
}

/** White content row (leave / birthday / holiday). */
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

function LetterDot({
  left,
  top,
  bg,
  color,
  letter,
}: {
  left: number;
  top: number;
  bg: string;
  color: string;
  letter: string;
}) {
  return (
    <span
      className="absolute flex items-center justify-center rounded-full"
      style={{ left, top, width: 24, height: 24, background: bg }}
    >
      <span className="text-[8px] font-normal leading-none" style={{ color }}>
        {letter}
      </span>
    </span>
  );
}

/** Colorful party-bunting garland (approximation of the `kjuh 1` image). */
function Bunting({ left, top }: { left: number; top: number }) {
  const colors = ["#F7C948", "#4FB0E8", "#F58FB0", "#7FCF7F", "#B79CE0"];
  const flags = Array.from({ length: 9 }, (_, i) => {
    const x = 3 + i * 16.5;
    return (
      <polygon
        key={i}
        points={`${x},3 ${x + 13},3 ${x + 6.5},13.5`}
        fill={colors[i % colors.length]}
      />
    );
  });
  return (
    <svg
      className="absolute"
      style={{ left, top }}
      width={154}
      height={15}
      viewBox="0 0 154 15"
      fill="none"
    >
      <path d="M2 3 C 50 6, 104 6, 152 3" stroke="#C4C4C4" strokeWidth={0.8} />
      {flags}
    </svg>
  );
}

/* --------------------------------- modal field --------------------------------- */
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
  children,
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
  children?: ReactNode;
}) {
  return (
    <>
      <Txt l={486} t={labelY} s={18} lh={24} cls="font-light text-ink/70">
        {label}
      </Txt>
      <div
        className="absolute border border-[#D6D6D6]"
        style={{ left: 486, top: y, width: 455, height: h, background: "#FEFCFF", borderRadius: 33.57 }}
      />
      {children ?? (
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

/* --------------------------------- calendar data --------------------------------- */
const COLS = [250, 358, 466, 574, 682, 790, 898];
const ROWS = [479, 577, 675, 773, 871];
const DAYS: number[][] = [
  [1, 2, 3, 4, 5, 6, 7],
  [8, 9, 10, 11, 12, 13, 14],
  [15, 16, 17, 18, 19, 20, 21],
  [22, 23, 24, 25, 26, 27, 28],
  [29, 30, 31, 1, 2, 3, 4],
];
const WEEKDAYS: { label: string; left: number; color: string }[] = [
  { label: "Mon", left: 282, color: "#000000" },
  { label: "Tue", left: 393, color: "#000000" },
  { label: "Wed", left: 497, color: "#000000" },
  { label: "Thu", left: 608, color: "#000000" },
  { label: "Fri", left: 721, color: "#000000" },
  { label: "Sat", left: 826, color: "#D85859" },
  { label: "Sun", left: 933, color: "#D43131" },
];

/* -------------------------------- page --------------------------------- */
export default function ApplyLeavesPage() {
  const navigate = useNavigate();
  const create = useCreate("leaves");
  const { data: me } = useMe();
  const today = new Date().toISOString().slice(0, 10);
  const [type, setType] = useState("");
  const [reason, setReason] = useState("");
  const [from, setFrom] = useState(today);
  const [to, setTo] = useState(today);

  async function handleSubmit() {
    try {
      await create.mutateAsync({
        userId: me?.id,
        type: type || "Casual Leave",
        from: new Date(from).toISOString(),
        to: new Date(to).toISOString(),
        reason,
      });
    } catch {
      /* swallow — never hang the modal if the backend is offline */
    } finally {
      navigate("/people/leaves");
    }
  }

  return (
    <>
      {/* ===== page background gradient (frame fill) ===== */}
      <div
        className="absolute inset-0 -z-10"
        style={{
          backgroundColor: "#FFFFFF",
          backgroundImage:
            "linear-gradient(135deg, #EAEAEA 0%, #EDF9FF 40%, rgba(201,218,227,0.9) 72%, #A4C5D9 100%)",
        }}
      />

      {/* ===== PEOPLE title ===== */}
      <Txt l={259} t={158} s={40} lh={45} cls="font-normal text-ink">
        PEOPLE
      </Txt>

      {/* ===== People search + people-count controls ===== */}
      <div
        onClick={() => navigate("/search")}
        className="absolute flex items-center justify-center rounded-full bg-white cursor-pointer"
        style={{ left: 488, top: 151, width: 45, height: 45 }}
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

      {/* ===== main calendar panel outline (transparent, #D4D4D4 border, notched top-left) ===== */}
      <svg className="absolute" style={{ left: 241, top: 227 }} width={766} height={771} viewBox="0 0 766 771" fill="none">
        <path
          d="M 25,64 L 414.8,64 L 414.8,1 L 741,1 A 24,24 0 0 1 765,25 L 765,746 A 24,24 0 0 1 741,770 L 25,770 A 24,24 0 0 1 1,746 L 1,88 A 24,24 0 0 1 25,64 Z"
          stroke="#D4D4D4"
          strokeWidth={1}
        />
      </svg>

      {/* ===== tabs + action row ===== */}
      <TabButton x={242} w={107} icon={Waves} label="People" onClick={() => navigate("/people")} />
      <TabButton x={357} w={122} active icon={AlignJustify} label="Leaves" onClick={() => navigate("/people/leaves")} />
      <TabButton x={482} w={156} icon={AlignJustify} label="Assign Creators" onClick={() => navigate("/people/assign-creators")} />
      <ActionPill x={664} w={100} onClick={() => navigate("/people/holidays")}>
        <span className="absolute text-[14px] font-light leading-none text-ink/90" style={{ left: 12, top: 15 }}>
          Add Holiday
        </span>
        <Plus className="absolute h-[11px] w-[11px] text-ink" style={{ left: 82, top: 17 }} strokeWidth={1.8} />
      </ActionPill>
      <ActionPill x={770} w={114} onClick={() => navigate("/people/apply-leave")}>
        <span className="absolute text-[14px] font-light leading-none text-ink/90" style={{ left: 9.5, top: 15 }}>
          Apply for leave
        </span>
        <Plus className="absolute h-[11px] w-[11px] text-ink" style={{ left: 88, top: 17 }} strokeWidth={1.8} />
      </ActionPill>
      <ActionPill x={890} w={108}>
        <span className="absolute text-[14px] font-light leading-none text-ink/90" style={{ left: 14, top: 15 }}>
          October
        </span>
        <ChevronDown className="absolute h-[11px] w-[12px] text-ink" style={{ left: 68, top: 17 }} strokeWidth={1.8} />
        <Plus className="absolute h-[10px] w-[10px] text-ink" style={{ left: 84, top: 17.5 }} strokeWidth={1.8} />
      </ActionPill>

      {/* ===== Leave Balance ===== */}
      <Txt l={257} t={306} s={18} lh={24} cls="font-light text-ink">
        Leave Balance
      </Txt>
      {/* Causal Leave pill */}
      <div className="absolute rounded-[32px] bg-white" style={{ left: 257, top: 342, width: 153, height: 62 }}>
        <div
          className="absolute flex items-center justify-center rounded-full border"
          style={{ left: 7, top: 10, width: 42, height: 42, borderColor: "#731FB4" }}
        >
          <span className="text-[14px] font-normal leading-none text-[#6000AA]">02</span>
        </div>
        <span className="absolute text-[14px] font-normal leading-none text-ink/90" style={{ left: 54, top: 24 }}>
          Causal Leave
        </span>
      </div>
      {/* Sick Leave pill */}
      <div className="absolute rounded-[32px] bg-white" style={{ left: 427, top: 342, width: 153, height: 62 }}>
        <div
          className="absolute flex items-center justify-center rounded-full border"
          style={{ left: 7, top: 10, width: 42, height: 42, borderColor: "#6CA478" }}
        >
          <span className="text-[14px] font-normal leading-none text-[#6CA478]">01</span>
        </div>
        <span className="absolute text-[14px] font-normal leading-none text-ink/90" style={{ left: 54, top: 24 }}>
          Sick Leave
        </span>
      </div>

      {/* ===== weekday headers ===== */}
      {WEEKDAYS.map((w) => (
        <Txt key={w.label} l={w.left} t={445} s={18} lh={24} cls="font-light">
          <span style={{ color: w.color }}>{w.label}</span>
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
                {DAYS[r][c]}
              </div>
            </div>
          );
        }),
      )}
      {/* grid markers */}
      <LetterDot left={640} top={535} bg="#C6A6DF" color="#6000AA" letter="T" />
      <LetterDot left={750} top={637} bg="#C4F1D2" color="#007726" letter="S" />
      <Cake className="absolute h-[16px] w-[16px] text-[#DD2E44]" style={{ left: 430, top: 691 }} strokeWidth={1.4} />
      <Cake className="absolute h-[16px] w-[16px] text-[#DD2E44]" style={{ left: 322, top: 789 }} strokeWidth={1.4} />
      {/* Holiday pill on day 24 */}
      <div
        className="absolute flex items-center gap-[3px] rounded-full bg-white pl-[5px]"
        style={{ left: 478, top: 818, width: 76, height: 26 }}
      >
        <span className="h-[8px] w-[8px] rounded-full" style={{ background: "#88DFA9" }} />
        <span className="text-[10px] font-normal leading-none text-ink/80">Holiday</span>
      </div>
      <LetterDot left={624} top={830} bg="#FFE3CF" color="#DB6714" letter="P" />
      <LetterDot left={640} top={830} bg="#D4CFFF" color="#1A0C9A" letter="K" />

      {/* ================= right column ================= */}
      {/* --- On leave --- */}
      <SideCard cx={1015} cy={224} px={1025} py={263} title="On leave" octX={1263} />
      <Txt l={1025} t={264} s={12} lh={16} cls="font-normal text-ink/70">
        Today
      </Txt>
      <div className="absolute bg-black/10" style={{ left: 1066, top: 272, width: 92, height: 1 }} />
      <ContentRow x={1025} y={294} w={318}>
        <span
          className="absolute flex items-center justify-center rounded-full"
          style={{ left: 7, top: 10, width: 42, height: 42, background: "#C6A6DF" }}
        >
          <span className="text-[14px] font-normal leading-none text-[#6000AA]">T</span>
        </span>
        <span className="absolute left-[54px] top-[11px] text-[14px] font-normal leading-none text-ink/90">Tanvi Sharma</span>
        <span className="absolute left-[156px] top-[13px] text-[10px] font-light leading-none text-ink/70">Operations</span>
        <span className="absolute left-[54px] top-[30px] w-[77px] text-[10px] font-light leading-[12px] text-ink/70">
          Rep. Manager: Vishal Sharma
        </span>
        <span className="absolute left-[142px] top-[37px] text-[10px] font-light leading-none text-ink/70">Sick Leave</span>
        <div className="absolute left-[206px] top-[32px] flex h-[23px] w-[87px] items-center justify-center gap-[3px] rounded-[7px] border border-[#D6D6D6] bg-white">
          <span className="text-[10px] font-light leading-none text-ink/70">Medical..pdf</span>
          <FileText className="h-[13px] w-[13px] text-ink" strokeWidth={1.4} />
        </div>
      </ContentRow>

      {/* --- Upcoming Events --- */}
      <SideCard cx={1015} cy={485} px={1025} py={524} title="Upcoming Events" octX={1263} />
      <ContentRow x={1025} y={540} w={326}>
        <Cake className="absolute left-[12px] top-[16px] h-[24px] w-[24px] text-[#DD2E44]" strokeWidth={1.3} />
        <span className="absolute left-[46px] top-[14px] text-[12px] font-light leading-none text-ink/70">Happy birthday</span>
        <span className="absolute left-[46px] top-[33px] flex h-[16px] w-[16px] items-center justify-center rounded-full bg-[#C6A6DF]">
          <span className="text-[8px] font-normal leading-none text-[#6000AA]">T</span>
        </span>
        <span className="absolute left-[67px] top-[32px] text-[14px] font-normal leading-none text-ink">Tanvi Sharma</span>
        <Bunting left={142} top={2} />
        <span className="absolute left-[244px] top-[19px] text-[12px] font-light leading-none text-ink/70">16/09/2025</span>
      </ContentRow>
      <ContentRow x={1025} y={614} w={326}>
        <Cake className="absolute left-[12px] top-[16px] h-[24px] w-[24px] text-[#DD2E44]" strokeWidth={1.3} />
        <span className="absolute left-[46px] top-[14px] text-[12px] font-light leading-none text-ink/70">Happy birthday</span>
        <span className="absolute left-[46px] top-[33px] flex h-[16px] w-[16px] items-center justify-center rounded-full bg-[#DDF7FF]">
          <span className="text-[8px] font-normal leading-none text-[#0F7D9E]">P</span>
        </span>
        <span className="absolute left-[67px] top-[32px] text-[14px] font-normal leading-none text-ink">Pooja Sharma</span>
        <Bunting left={142} top={2} />
        <span className="absolute left-[244px] top-[19px] text-[12px] font-light leading-none text-ink/70">22/09/2025</span>
      </ContentRow>

      {/* --- Holidays --- */}
      <SideCard cx={1014} cy={750} px={1024} py={789} title="Holidays" octX={1262} />
      <Txt l={1024} t={790} s={12} lh={16} cls="font-normal text-ink/70">
        24/09/25
      </Txt>
      <div className="absolute bg-black/10" style={{ left: 1086, top: 798, width: 92, height: 1 }} />
      <ContentRow x={1024} y={820} w={318}>
        <span className="absolute left-[7px] top-[10px] h-[42px] w-[42px] rounded-full" style={{ background: "#88DFA9" }} />
        <span className="absolute left-[55px] top-[22px] text-[14px] font-normal leading-none text-ink/90">Holiday</span>
      </ContentRow>

      {/* ================= dim scrim + modal ================= */}
      <div className="absolute inset-0 z-50" style={{ background: "rgba(0,0,0,0.5)" }} />
      <div
        className="absolute z-50 rounded-[24px] bg-white shadow-[0_24px_70px_rgba(0,0,0,0.28)]"
        style={{ left: 469, top: 213, width: 502, height: 598 }}
      />
      <div className="absolute inset-0 z-50">
        {/* title */}
        <Txt l={488} t={238} s={24} lh={30} cls="font-medium text-ink">
          Apply For Leave
        </Txt>
        {/* Send Request */}
        <div
          onClick={handleSubmit}
          className="absolute flex items-center justify-center rounded-[24px] cursor-pointer"
          style={{ left: 719, top: 234, width: 146, height: 45, background: "rgba(0,0,0,0.95)" }}
        >
          <span className="text-[20px] font-normal leading-none text-white">Send Request</span>
        </div>
        {/* close */}
        <div
          onClick={() => navigate(-1)}
          className="absolute flex items-center justify-center rounded-full border border-black/80 bg-white cursor-pointer"
          style={{ left: 888, top: 234, width: 45, height: 45 }}
        >
          <X className="h-[20px] w-[20px] text-ink" strokeWidth={1.8} />
        </div>

        {/* Leave Type */}
        <Field
          y={342}
          h={47}
          label="Leave Type"
          labelY={305}
          placeholder="Select leave type"
          phX={504}
          phY={347}
          icon={
            <ChevronDown className="absolute h-[14px] w-[15px] text-ink" style={{ left: 904, top: 359 }} strokeWidth={1.8} />
          }
        >
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className={`absolute appearance-none bg-transparent text-[18px] font-normal outline-none ${type ? "text-ink" : "text-ink/70"}`}
            style={{ left: 504, top: 342, width: 400, height: 47, lineHeight: "40px" }}
          >
            <option value="" disabled>
              Select leave type
            </option>
            <option value="Casual Leave">Casual Leave</option>
            <option value="Sick Leave">Sick Leave</option>
            <option value="Earned Leave">Earned Leave</option>
            <option value="Unpaid Leave">Unpaid Leave</option>
          </select>
        </Field>
        {/* Reason */}
        <Field y={436} h={109} label="Reason" labelY={399} placeholder="Enter your reason for leave" phX={507} phY={444} top>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Enter your reason for leave"
            className="absolute resize-none bg-transparent text-[18px] font-normal text-ink outline-none placeholder:text-ink/70"
            style={{ left: 507, top: 444, width: 413, height: 93 }}
          />
        </Field>
        {/* Date Range */}
        <Field
          y={592}
          h={47}
          label="Date Range"
          labelY={555}
          placeholder="Select Dates"
          phX={504}
          phY={597}
          icon={<Calendar className="absolute h-[20px] w-[20px] text-ink" style={{ left: 901, top: 605 }} strokeWidth={1.6} />}
        >
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="absolute bg-transparent text-[18px] font-normal text-ink outline-none"
            style={{ left: 504, top: 592, width: 175, height: 47 }}
          />
          <span
            className="absolute text-[18px] font-normal text-ink/70"
            style={{ left: 683, top: 597, lineHeight: "40px" }}
          >
            –
          </span>
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="absolute bg-transparent text-[18px] font-normal text-ink outline-none"
            style={{ left: 702, top: 592, width: 175, height: 47 }}
          />
        </Field>
        {/* Attach Document */}
        <Field
          y={686}
          h={47}
          label="Attach Document"
          labelY={649}
          placeholder="Upload medical docs , etc."
          phX={504}
          phY={691}
          icon={<Paperclip className="absolute h-[18px] w-[16px] text-ink" style={{ left: 902, top: 701 }} strokeWidth={1.6} />}
        />
        {/* footer */}
        <Info className="absolute h-[16px] w-[16px] text-ink/70" style={{ left: 488, top: 761 }} strokeWidth={1.6} />
        <div className="absolute whitespace-pre text-[14px] font-light text-ink/70" style={{ left: 512, top: 762, lineHeight: "16px" }}>
          Casual Leaves Left: <span className="font-normal text-ink">2</span>
          {"           "}Sick Leaves Left: <span className="font-normal text-ink">2</span>
        </div>
      </div>
    </>
  );
}
