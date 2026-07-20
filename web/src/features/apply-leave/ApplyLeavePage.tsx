import type { ReactNode } from "react";
import { useState } from "react";
import type { LucideIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useMe, useCreate, useLeaves, useUsers } from "@/api/hooks";
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
  Paperclip,
  Info,
} from "lucide-react";

/**
 * Super Admin — People / Leaves · "Apply For Leave".
 * Exact reconstruction of Figma frame 4870:76332
 * ("Super Admin - leaves(apply for leave)"), 1440×1024.
 *
 * The Apply-For-Leave modal (with its own dim backdrop) is the subject of this
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
function MonthPill({ x, y, label }: { x: number; y: number; label: string }) {
  return (
    <div
      className="absolute flex items-center gap-[6px] rounded-[28px] px-[12px]"
      style={{ left: x, top: y, width: 101, height: 28, background: "rgba(255,255,255,0.9)" }}
    >
      <span className="text-[14px] font-light leading-none text-ink/90">{label}</span>
      <ChevronDown className="h-[11px] w-[11px] text-ink" strokeWidth={1.8} />
    </div>
  );
}

/* --------------------------------- data --------------------------------- */
const COLS = [250, 358, 466, 574, 682, 790, 898];
const ROWS = [479, 577, 675, 773, 871];
/** Chip palette for per-day leave markers (colour only — the letter is live). */
const CHIP_COLORS = [
  { bg: "#C6A6DF", color: "#6000AA" },
  { bg: "#C4F1D2", color: "#007726" },
  { bg: "#FFE3CF", color: "#DB6714" },
  { bg: "#D4CFFF", color: "#1A0C9A" },
];

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
  control,
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
  control?: ReactNode;
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
      {control ?? (
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
export default function ApplyLeavePage() {
  const navigate = useNavigate();
  const { data: me } = useMe();
  const { data: leaves = [] } = useLeaves();
  const { data: users = [] } = useUsers();
  const create = useCreate("leaves");
  const [selectedType, setSelectedType] = useState("");
  const [reason, setReason] = useState("");
  // Date Range in the design is a single picker visual ("Select Dates"), not
  // plain date inputs — so keep the visual and default from=today, to=tomorrow.
  const today = new Date();
  const fromISO = today.toISOString();
  const toISO = new Date(today.getTime() + 86_400_000).toISOString();

  /* ---- live derivations (no literals restated) ---- */
  const dayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  const dayEnd = dayStart + 86_400_000;
  const activeLeaves = leaves.filter((l) => l.status !== "REJECTED");
  const todayLeaves = activeLeaves.filter(
    (l) => new Date(l.from).getTime() < dayEnd && new Date(l.to).getTime() >= dayStart,
  );
  const wfhCount = todayLeaves.filter((l) => /wfh|home/i.test(l.type)).length;
  const halfDayCount = todayLeaves.filter((l) => /half/i.test(l.type)).length;
  const absentCount = Math.max(todayLeaves.length - wfhCount - halfDayCount, 0);
  const presentCount = Math.max(users.length - absentCount, 0);

  const userById = new Map(users.map((u) => [u.id, u]));
  const onLeaveCards = (
    todayLeaves.length
      ? todayLeaves
      : [...activeLeaves].sort((a, b) => +new Date(b.from) - +new Date(a.from))
  ).slice(0, 2);

  const myLeaves = me?.id ? leaves.filter((l) => l.userId === me.id) : [];
  const casualTaken = myLeaves.filter((l) => /ca(su|us)al/i.test(l.type)).length;
  const sickTaken = myLeaves.filter((l) => /sick/i.test(l.type)).length;

  const pad = (n: number) => String(n).padStart(2, "0");
  const dmy = (d: Date) => `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${String(d.getFullYear()).slice(2)}`;

  /* ---- live calendar scaffold for the real current month ---- */
  const year = today.getFullYear();
  const month = today.getMonth();
  const monthLabel = today.toLocaleString("en-US", { month: "long" });
  const firstDow = (new Date(year, month, 1).getDay() + 6) % 7; // Monday-first
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrev = new Date(year, month, 0).getDate();
  const cells = Array.from({ length: ROWS.length * COLS.length }, (_, i) => {
    const n = i - firstDow + 1;
    const inMonth = n >= 1 && n <= daysInMonth;
    return {
      label: inMonth ? n : n < 1 ? daysInPrev + n : n - daysInMonth,
      inMonth,
      isToday: inMonth && n === today.getDate(),
      start: inMonth ? new Date(year, month, n).getTime() : 0,
    };
  });
  /** People on leave per in-month day, keyed by day number — real Leave records. */
  const chipsByDay = new Map<number, { id: string; letter: string }[]>();
  for (const lv of activeLeaves) {
    const from = new Date(lv.from);
    const to = new Date(lv.to);
    const letter = (userById.get(lv.userId)?.name ?? "?").charAt(0).toUpperCase();
    for (const cell of cells) {
      if (!cell.inMonth) continue;
      if (from.getTime() >= cell.start + 86_400_000 || to.getTime() < cell.start) continue;
      const list = chipsByDay.get(cell.label) ?? [];
      if (list.length < 2) list.push({ id: lv.id, letter });
      chipsByDay.set(cell.label, list);
    }
  }

  async function handleSubmit() {
    if (!me?.id) return;
    try {
      await create.mutateAsync({
        userId: me.id,
        type: selectedType,
        from: fromISO,
        to: toISO,
        reason,
      });
      navigate("/people/leaves");
    } catch {
      /* swallow so the request never hangs */
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
          {users.length}
        </span>
      </div>

      {/* ===== top-right stat pills ===== */}
      <StatPill numX={810} badgeX={871} labelX={855} num={String(presentCount)} badgeBg="#DCFF68" dir="up" icon={Users} label="Present" />
      <StatPill numX={938} badgeX={999} labelX={983} num={String(absentCount)} badgeBg="#FFB0B1" dir="down" icon={UserX} label="Absent" />
      <StatPill numX={1066} badgeX={1127} labelX={1111} num={String(wfhCount)} badgeBg="#DCFF68" dir="up" icon={House} label="WFH" />
      <StatPill numX={1194} badgeX={1255} labelX={1239} num={String(halfDayCount)} badgeBg="#DCFF68" dir="up" badgeText={String(halfDayCount)} label="Half Day" />

      {/* ===== date pill ===== */}
      <div className="absolute rounded-[18px] bg-white" style={{ left: 1299, top: 153, width: 90, height: 32 }}>
        <div
          className="absolute flex items-center justify-center rounded-full"
          style={{ left: 3, top: 4, width: 24, height: 24, background: "#F1F1F1" }}
        >
          <Calendar className="h-[14px] w-[14px] text-ink" strokeWidth={1.6} />
        </div>
        <span className="absolute text-[12px] font-light leading-none text-ink/90" style={{ left: 30, top: 10 }}>
          {dmy(today)}
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
          {monthLabel}
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
          className="absolute flex items-center justify-center rounded-full"
          style={{ left: 7, top: 10, width: 42, height: 42, background: "#C6A6DF" }}
        >
          <span className="text-[14px] font-normal leading-none text-[#6000AA]">{pad(casualTaken)}</span>
        </div>
        <span className="absolute text-[14px] font-normal leading-none text-ink/90" style={{ left: 54, top: 24 }}>
          Causal Leave
        </span>
      </div>
      {/* Sick Leave pill */}
      <div className="absolute rounded-[32px] border border-black/10 bg-white" style={{ left: 427, top: 342, width: 153, height: 62 }}>
        <div
          className="absolute flex items-center justify-center rounded-full"
          style={{ left: 7, top: 10, width: 42, height: 42, background: "#C6A6DF" }}
        >
          <span className="text-[14px] font-normal leading-none text-[#6CA478]">{pad(sickTaken)}</span>
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
          const cell = cells[r * COLS.length + c];
          const marked = cell.isToday;
          const chips = cell.inMonth ? chipsByDay.get(cell.label) ?? [] : [];
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
              {marked && (
                <div
                  className="absolute"
                  style={{ left: cx + 5, top: ry + 6, width: 42, height: 44, borderRadius: 22, background: "#D4EBF9" }}
                />
              )}
              <div
                className={`absolute text-[20px] font-normal ${cell.inMonth ? "text-ink" : "text-ink/35"}`}
                style={{ left: cx + (marked ? 18 : 15), top: ry + 16, lineHeight: "24px" }}
              >
                {cell.label}
              </div>
              {/* per-day leave markers — initials of real users on leave that day */}
              {chips.map((chip, ci) => {
                const tone = CHIP_COLORS[(cell.label + ci) % CHIP_COLORS.length];
                return (
                  <DayChip
                    key={chip.id}
                    x={cx + 15 + ci * 26}
                    y={ry + 56}
                    bg={tone.bg}
                    letter={chip.letter}
                    color={tone.color}
                  />
                );
              })}
            </div>
          );
        }),
      )}

      {/* ================= right panels ================= */}
      {/* --- On leave --- */}
      <div
        className="absolute rounded-[12px] border border-white/50"
        style={{ left: 1015, top: 223, width: 352, height: 241, background: "rgba(255,255,255,0.55)" }}
      />
      <Txt l={1025} t={231} s={12} lh={24} cls="font-normal text-ink">On leave</Txt>
      <MonthPill x={1263} y={223} label={monthLabel} />
      <div className="absolute rounded-[12px] bg-white" style={{ left: 1025, top: 262, width: 327, height: 188 }} />
      {/* Today divider */}
      <Txt l={1025} t={262} s={12} lh={16} cls="font-normal text-ink/70">Today</Txt>
      <div className="absolute bg-black/10" style={{ left: 1066, top: 271, width: 92, height: 1 }} />
      {/* leave cards — live */}
      {onLeaveCards.length === 0 ? (
        <Txt l={1079} t={315} s={12} lh={16} cls="font-light text-ink/50">
          No one is on leave
        </Txt>
      ) : (
        onLeaveCards.map((lv, i) => {
          const u = userById.get(lv.userId);
          const name = u?.name ?? "Unknown";
          const T = 293 + i * 74;
          return (
            <div key={lv.id}>
              <div className="absolute rounded-[32px] bg-white" style={{ left: 1025, top: T, width: 318, height: 62 }} />
              <div
                className="absolute flex items-center justify-center rounded-full"
                style={{ left: 1032, top: T + 10, width: 42, height: 42, background: "#C6A6DF" }}
              >
                <span className="text-[14px] font-normal leading-none text-[#6000AA]">
                  {name.charAt(0).toUpperCase()}
                </span>
              </div>
              <Txt l={1079} t={T + 11} s={14} lh={18} cls="font-normal text-ink/90">{name}</Txt>
              {u?.team?.name ? (
                <Txt l={1181} t={T + 13} s={10} lh={13} cls="font-light text-ink/70">{u.team.name}</Txt>
              ) : null}
              <Txt l={1079} t={T + 32} s={10} lh={12} cls="font-light text-ink/70">
                {`${dmy(new Date(lv.from))} – ${dmy(new Date(lv.to))}`}
              </Txt>
              <Txt l={1167} t={T + 38} s={10} lh={13} cls="font-light text-ink/70">{lv.type}</Txt>
              {lv.reason ? (
                <div
                  className="absolute flex items-center gap-[4px] overflow-hidden rounded-[7px] bg-white pl-[6px]"
                  style={{ left: 1231, top: T + 32, width: 87, height: 23 }}
                >
                  <span className="shrink-0 text-[10px] leading-none text-red-600">📄</span>
                  <span className="min-w-0 truncate pr-[6px] text-[10px] font-light leading-none text-ink/70">{lv.reason}</span>
                </div>
              ) : null}
            </div>
          );
        })
      )}

      {/* --- Upcoming Events --- */}
      <div
        className="absolute rounded-[12px] border border-white/50"
        style={{ left: 1015, top: 476, width: 352, height: 241, background: "rgba(255,255,255,0.55)" }}
      />
      <Txt l={1025} t={484} s={12} lh={24} cls="font-normal text-ink">Upcoming Events</Txt>
      <MonthPill x={1263} y={476} label={monthLabel} />
      <div className="absolute rounded-[12px] bg-white" style={{ left: 1025, top: 515, width: 327, height: 188 }} />
      {/* No birthday/event source exists in the schema — empty state, never invented people. */}
      <Txt l={1071} t={568} s={12} lh={16} cls="font-light text-ink/50">
        No upcoming events
      </Txt>

      {/* --- Holidays --- */}
      <div
        className="absolute rounded-[12px] border border-white/50"
        style={{ left: 1014, top: 731, width: 352, height: 241, background: "rgba(255,255,255,0.55)" }}
      />
      <Txt l={1024} t={739} s={12} lh={24} cls="font-normal text-ink">Holidays</Txt>
      <MonthPill x={1262} y={731} label={monthLabel} />
      <div className="absolute rounded-[12px] bg-white" style={{ left: 1024, top: 770, width: 327, height: 188 }} />
      {/* No Holiday model exists in the schema — empty state, never a fabricated date row. */}
      <Txt l={1078} t={823} s={12} lh={16} cls="font-light text-ink/50">
        No holidays this month
      </Txt>

      {/* ================= dim scrim + modal ================= */}
      <div className="absolute inset-0 z-50" style={{ background: "rgba(0,0,0,0.5)" }} />
      <div
        className="absolute z-50 rounded-[24px] bg-white shadow-[0_24px_70px_rgba(0,0,0,0.28)]"
        style={{ left: 469, top: 213, width: 502, height: 598 }}
      >
        {/* modal content is positioned in frame coords via the wrapper below */}
      </div>
      <div className="absolute inset-0 z-50">
        {/* title */}
        <Txt l={488} t={238} s={24} lh={30} cls="font-medium text-ink">
          Apply For Leave
        </Txt>
        {/* Send Request */}
        <div
          className="absolute flex items-center justify-center rounded-[24px] cursor-pointer"
          style={{ left: 719, top: 234, width: 146, height: 45, background: "rgba(0,0,0,0.95)" }}
          onClick={handleSubmit}
        >
          <span className="text-[20px] font-normal leading-none text-white">Send Request</span>
        </div>
        {/* close */}
        <div
          className="absolute flex items-center justify-center rounded-full border border-black/80 bg-white cursor-pointer"
          style={{ left: 888, top: 234, width: 45, height: 45 }}
          onClick={() => navigate(-1)}
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
          control={
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className={`absolute appearance-none bg-transparent text-[18px] font-normal outline-none ${
                selectedType ? "text-ink" : "text-ink/70"
              }`}
              style={{ left: 486, top: 342, width: 455, height: 47, paddingLeft: 18, paddingRight: 40 }}
            >
              <option value="" disabled>
                Select leave type
              </option>
              <option value="Casual">Casual</option>
              <option value="Sick">Sick</option>
              <option value="Earned">Earned</option>
            </select>
          }
          icon={
            <ChevronDown
              className="absolute h-[14px] w-[15px] text-ink"
              style={{ left: 904, top: 359 }}
              strokeWidth={1.8}
            />
          }
        />
        {/* Reason */}
        <Field
          y={436}
          h={109}
          label="Reason"
          labelY={399}
          placeholder="Enter your reason for leave"
          phX={507}
          phY={444}
          top
          control={
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Enter your reason for leave"
              className="absolute resize-none bg-transparent text-[18px] font-normal text-ink outline-none placeholder:text-ink/70"
              style={{ left: 486, top: 436, width: 455, height: 109, paddingLeft: 21, paddingTop: 8, paddingRight: 21, lineHeight: "40px" }}
            />
          }
        />
        {/* Date Range */}
        <Field
          y={592}
          h={47}
          label="Date Range"
          labelY={555}
          placeholder="Select Dates"
          phX={504}
          phY={597}
          icon={
            <Calendar
              className="absolute h-[20px] w-[20px] text-ink"
              style={{ left: 901, top: 605 }}
              strokeWidth={1.6}
            />
          }
        />
        {/* Attach Document */}
        <Field
          y={686}
          h={47}
          label="Attach Document"
          labelY={649}
          placeholder="Upload medical docs , etc."
          phX={504}
          phY={691}
          icon={
            <Paperclip
              className="absolute h-[18px] w-[16px] text-ink"
              style={{ left: 902, top: 701 }}
              strokeWidth={1.6}
            />
          }
        />
        {/* footer */}
        <Info className="absolute h-[16px] w-[16px] text-ink/70" style={{ left: 488, top: 761 }} strokeWidth={1.6} />
        <div className="absolute whitespace-pre text-[14px] font-light text-ink/70" style={{ left: 512, top: 762, lineHeight: "16px" }}>
          {/* No per-user leave quota exists in the schema, so "remaining" is not
              computable — show what IS real: leaves taken, counted from my records. */}
          Casual Leaves Taken: <span className="font-normal text-ink">{casualTaken}</span>
          {"           "}Sick Leaves Taken: <span className="font-normal text-ink">{sickTaken}</span>
        </div>
      </div>
    </>
  );
}
