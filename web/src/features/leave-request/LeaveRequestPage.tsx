import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useLeaves, useMe, useUpdate, useUsers, type User } from "@/api/hooks";
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

/* ------------------------------ date helpers ---------------------------- */
/** Local yyyy-mm-dd key, for whole-day comparisons that ignore clock time. */
function dayKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** true when today falls inside [from, to], inclusive. */
function coversToday(from: string, to: string): boolean {
  const a = new Date(from);
  const b = new Date(to);
  if (Number.isNaN(a.getTime()) || Number.isNaN(b.getTime())) return false;
  const t = dayKey(new Date());
  return dayKey(a) <= t && t <= dayKey(b);
}

/** dd/mm/yy from an ISO date string. */
function fmtDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return `${d.getDate()}/${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getFullYear()).slice(-2)}`;
}

/** dd/mm/yyyy, zero-padded — the Upcoming Events date format. */
function fmtLong(d: Date): string {
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
}

/** Human duration between two ISO dates, e.g. "One day" / "3 days". */
function spanLabel(from: string, to: string): string {
  const a = new Date(from);
  const b = new Date(to);
  if (Number.isNaN(a.getTime()) || Number.isNaN(b.getTime())) return "";
  const days = Math.max(1, Math.round((b.getTime() - a.getTime()) / 86_400_000));
  return days <= 1 ? "One day" : `${days} days`;
}

/** First letter of a name, for the circular avatar chips. */
function initial(name: string): string {
  return name.trim().charAt(0).toUpperCase();
}

/** Zero-padded two-digit count, matching the Figma "02" / "01" balance chips. */
function pad2(n: number): string {
  return String(n).padStart(2, "0");
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

/* -------------------------- right-column month pill --------------------- */
function MonthPill({ x, y, label }: { x: number; y: number; label: string }) {
  return (
    <div
      className="absolute flex items-center gap-[6px] rounded-[28px] bg-white/90 pl-[16px] pr-[12px]"
      style={{ left: x, top: y, width: 101, height: 28 }}
    >
      <span className="whitespace-nowrap text-[14px] font-light leading-none text-black/[0.99]">{label}</span>
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
  reason,
  onApprove,
  onReject,
}: {
  top: number;
  avatarGrad: string;
  name: string;
  role: string;
  email: string;
  date: string;
  reason: string;
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
        {reason}
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
/** Avatar tones for the per-day "who's out" chips, cycled by employee order. */
const BADGE_TONES = [
  { bg: "#C6A6DF", color: "#6000AA" },
  { bg: "#C4F1D2", color: "#007726" },
  { bg: "#D4CFFF", color: "#1A0C9A" },
  { bg: "#FFE3CF", color: "#DB6714" },
];
/** Avatar tones for the two Upcoming Events rows. */
const EVENT_TONES = [
  { bg: "#C6A6DF", color: "#6000AA" },
  { bg: "#DDF7FF", color: "#0F7D9E" },
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
  const { data: users } = useUsers();
  const { data: me } = useMe();
  const upd = useUpdate("leaves");

  const userById = new Map((users ?? []).map((u) => [u.id, u] as const));

  /* ---- attendance stats (top pills) ---- */
  const headcount = (users ?? []).length;
  const approved = (leaves ?? []).filter((l) => l.status === "APPROVED");
  const outToday = approved.filter((l) => coversToday(l.from, l.to));
  const absent = new Set(outToday.map((l) => l.userId)).size;
  const present = Math.max(0, headcount - absent);
  const wfh = outToday.filter((l) => /wfh|work from home/i.test(l.type)).length;
  const halfDay = outToday.filter((l) => /half/i.test(l.type)).length;

  /* ---- leave balance = leaves the signed-in user has already taken, per type ---- */
  const mine = approved.filter((l) => l.userId === me?.id);
  const takenOf = (re: RegExp) => pad2(mine.filter((l) => re.test(l.type)).length);

  /* ---- "On leave / Today" card: whoever is out now, else the next one up ---- */
  const current =
    outToday[0] ??
    [...approved]
      .filter((l) => new Date(l.to).getTime() >= Date.now())
      .sort((a, b) => new Date(a.from).getTime() - new Date(b.from).getTime())[0];
  const person = current ? userById.get(current.userId) : undefined;
  // Reporting manager = the *_MANAGER sitting on the same team.
  const manager = (users ?? []).find(
    (u) => u.role.endsWith("MANAGER") && !!person?.team && u.team?.id === person.team.id,
  );

  /* ---- calendar: the live current month, laid out Mon-first in the Figma's 5x7 grid ---- */
  const today = new Date();
  const monthLabel = today.toLocaleDateString("en-US", { month: "long" });
  const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const lead = (firstOfMonth.getDay() + 6) % 7; // Monday-first offset
  const cellDate = (r: number, c: number) =>
    new Date(today.getFullYear(), today.getMonth(), 1 - lead + r * 7 + c);

  /* ---- who is out on a given day, for the calendar avatar chips ---- */
  const outOn = (d: Date): User[] => {
    const k = dayKey(d);
    const seen = new Map<string, User>();
    for (const l of approved) {
      const a = new Date(l.from);
      const b = new Date(l.to);
      if (Number.isNaN(a.getTime()) || Number.isNaN(b.getTime())) continue;
      if (dayKey(a) > k || k > dayKey(b)) continue;
      const u = userById.get(l.userId);
      if (u) seen.set(u.id, u); // one chip per person, even with overlapping leaves
    }
    return [...seen.values()];
  };
  const toneOf = (id: string) => {
    const i = (users ?? []).findIndex((u) => u.id === id);
    return BADGE_TONES[(i < 0 ? 0 : i) % BADGE_TONES.length];
  };

  /* ---- Upcoming Events: work anniversaries derived from each employee's join date.
         The schema has no birthday/dob column, so User.createdAt (returned by
         GET /users) is the only real per-person yearly date to celebrate. ---- */
  const joinedMs = (u: User): number => {
    const raw = (u as User & { createdAt?: string }).createdAt;
    return raw ? new Date(raw).getTime() : NaN;
  };
  const anniversaries = (users ?? [])
    .map((u) => ({ user: u, joined: joinedMs(u) }))
    .filter((x) => Number.isFinite(x.joined))
    .map(({ user, joined }) => {
      const j = new Date(joined);
      const on = new Date(today.getFullYear(), j.getMonth(), j.getDate());
      if (dayKey(on) < dayKey(today)) on.setFullYear(on.getFullYear() + 1);
      return { user, on };
    })
    .sort((a, b) => a.on.getTime() - b.on.getTime());
  const anniversaryDays = new Set(anniversaries.map((a) => dayKey(a.on)));
  const upcoming = anniversaries.slice(0, 2);

  /* ---- modal rows: the ?id= request first, then the rest of the pending queue ---- */
  const pending = (leaves ?? []).filter((l) => l.status === "PENDING");
  const focused = idParam ? (leaves ?? []).find((l) => l.id === idParam) : undefined;
  const rows = (focused ? [focused, ...pending.filter((l) => l.id !== focused.id)] : pending).slice(0, 2);
  const ROW_GRADS = [
    "linear-gradient(135deg, #FCE0C8 0%, #E39A63 100%)",
    "linear-gradient(135deg, #F6C9DA 0%, #C07CA0 100%)",
  ];

  const decide = (id: string, status: "APPROVED" | "REJECTED") => {
    try {
      upd.mutate({ id, data: { status } });
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
          {headcount}
        </span>
      </div>

      {/* ===== top-right stat pills ===== */}
      <StatPill numX={811} badgeX={872} labelX={856} num={String(present)} badgeBg="#DCFF68" dir="up" icon={Users} label="Present" />
      <StatPill numX={939} badgeX={1000} labelX={984} num={String(absent)} badgeBg="#FFB0B1" dir="down" icon={UserX} label="Absent" />
      <StatPill numX={1067} badgeX={1128} labelX={1112} num={String(wfh)} badgeBg="#DCFF68" dir="up" icon={House} label="WFH" />
      <StatPill numX={1195} badgeX={1256} labelX={1240} num={String(halfDay)} badgeBg="#DCFF68" dir="up" badgeText={String(halfDay)} label="Half Day" />

      {/* ===== date pill ===== */}
      <div className="absolute rounded-[18px] bg-white" style={{ left: 1300, top: 151, width: 90, height: 32 }}>
        <div
          className="absolute flex items-center justify-center rounded-full"
          style={{ left: 3, top: 4, width: 24, height: 24, background: "#F1F1F1" }}
        >
          <Calendar className="h-[14px] w-[14px] text-ink" strokeWidth={1.6} />
        </div>
        <span className="absolute text-[12px] font-light leading-none text-ink/90" style={{ left: 30, top: 10 }}>
          {fmtDate(today.toISOString())}
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
      <ActionPill x={890} w={108} label={monthLabel} chevron />

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
        <span className="text-[14px] font-normal leading-none text-[#6000AA]">{takenOf(/casual/i)}</span>
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
        <span className="text-[14px] font-normal leading-none text-[#6CA478]">{takenOf(/sick/i)}</span>
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
          const d = cellDate(r, c);
          const day = d.getDate();
          const isSun = c === 6;
          const isToday = dayKey(d) === dayKey(today);
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

      {/* ===== day decorations (over cells) — cakes = work anniversaries, ===== */}
      {/* ===== avatar chips = whoever is on approved leave that day        ===== */}
      {ROWS.flatMap((ry, r) =>
        COLS.flatMap((cx, c) => {
          const d = cellDate(r, c);
          const marks: ReactNode[] = [];
          if (anniversaryDays.has(dayKey(d))) {
            marks.push(
              <div
                key={`cake-${r}-${c}`}
                className="absolute text-[13px] leading-none"
                style={{ left: cx + 72, top: ry + 15 }}
              >
                🎂
              </div>,
            );
          }
          outOn(d)
            .slice(0, 3)
            .forEach((u, i) => {
              const tone = toneOf(u.id);
              marks.push(
                <DayBadge
                  key={`out-${r}-${c}-${u.id}`}
                  x={cx + 66 - i * 16}
                  y={ry + 56}
                  bg={tone.bg}
                  color={tone.color}
                  letter={initial(u.name)}
                />,
              );
            });
          return marks;
        }),
      )}

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
      <MonthPill x={1263} y={223} label={monthLabel} />
      <div className="absolute rounded-[12px] bg-white" style={{ left: 1025, top: 262, width: 327, height: 188 }} />
      <Txt l={1025} t={264} s={12} lh={16} cls="font-normal text-black/70">
        Today
      </Txt>
      <div className="absolute bg-black/10" style={{ left: 1066, top: 271.5, width: 92, height: 1 }} />
      {/* on-leave entry */}
      {current && person ? (
        <>
          <div
            className="absolute rounded-[32px] border border-[#D6D6D6] bg-white"
            style={{ left: 1025, top: 293, width: 318, height: 62 }}
          />
          <div
            className="absolute flex items-center justify-center rounded-full"
            style={{ left: 1032, top: 303, width: 42, height: 42, background: "#C6A6DF" }}
          >
            <span className="text-[14px] font-normal leading-none text-[#6000AA]">{initial(person.name)}</span>
          </div>
          <Txt l={1079} t={304} s={14} lh={18} cls="font-normal text-black/90">
            {person.name}
          </Txt>
          <Txt l={1181} t={306.5} s={10} lh={13} cls="font-light text-black/70">
            {person.team?.name ?? person.role}
          </Txt>
          <Txt l={1079} t={323} s={10} lh={12} w={90} cls="font-light text-black/70">
            Rep. Manager: {manager?.name ?? "—"}
          </Txt>
          <Txt l={1181} t={330} s={10} lh={13} cls="font-light text-black/70">
            {current.type}
          </Txt>
          <div
            className="absolute flex items-center gap-[3px] rounded-[7px] border border-black/10 bg-white pl-[5px] pr-[6px]"
            style={{ left: 1245, top: 325, height: 23 }}
          >
            <FileText className="h-[13px] w-[13px] text-[#D14343]" strokeWidth={1.6} />
            <span className="text-[10.3px] font-light leading-none text-black/70">Medical..pdf</span>
          </div>
        </>
      ) : (
        <Txt l={1032} t={315} s={12} lh={16} cls="font-light text-black/40">
          No one on leave
        </Txt>
      )}

      {/* ---- Upcoming Events ---- */}
      <div
        className="absolute rounded-[12px]"
        style={{ left: 1015, top: 476, width: 352, height: 241, background: "rgba(255,255,255,0.6)" }}
      />
      <Txt l={1025} t={484} s={12} lh={24} cls="font-normal text-ink">
        Upcoming Events
      </Txt>
      <MonthPill x={1263} y={476} label={monthLabel} />
      <div className="absolute rounded-[12px] bg-white" style={{ left: 1025, top: 515, width: 327, height: 188 }} />
      {upcoming.length === 0 ? (
        <Txt l={1037} t={553} s={12} lh={16} cls="font-light text-black/40">
          No upcoming events
        </Txt>
      ) : (
        upcoming.map(({ user, on }, i) => {
          const tone = EVENT_TONES[i % EVENT_TONES.length];
          const dy = i * 74;
          return (
            <div key={user.id}>
              <div
                className="absolute rounded-[32px] bg-white"
                style={{ left: 1025, top: 531 + dy, width: 326, height: 62 }}
              />
              <div className="absolute text-[18px] leading-none" style={{ left: 1037, top: 549 + dy }}>
                🎂
              </div>
              <Txt l={1071} t={545 + dy} s={12} lh={16} cls="font-light text-black/70">
                Work anniversary
              </Txt>
              <div
                className="absolute flex items-center justify-center rounded-full"
                style={{ left: 1071, top: 563 + dy, width: 16, height: 16, background: tone.bg }}
              >
                <span className="text-[8px] font-normal leading-none" style={{ color: tone.color }}>
                  {initial(user.name)}
                </span>
              </div>
              <Txt l={1092} t={563 + dy} s={14} lh={16} cls="font-normal text-ink">
                {user.name}
              </Txt>
              <Bunting x={1167} y={533 + dy} />
              <Txt l={1269} t={550 + dy} s={12} lh={24} cls="font-light text-black/70">
                {fmtLong(on)}
              </Txt>
            </div>
          );
        })
      )}

      {/* ---- Holidays ---- */}
      <div
        className="absolute rounded-[12px]"
        style={{ left: 1014, top: 731, width: 352, height: 241, background: "rgba(255,255,255,0.6)" }}
      />
      <Txt l={1024} t={739} s={12} lh={24} cls="font-normal text-ink">
        Holidays
      </Txt>
      <MonthPill x={1262} y={731} label={monthLabel} />
      <div className="absolute rounded-[12px] bg-white" style={{ left: 1024, top: 770, width: 327, height: 188 }} />
      <Txt l={1024} t={772} s={12} lh={16} cls="font-normal text-black/70">
        {fmtDate(today.toISOString())}
      </Txt>
      <div className="absolute bg-black/10" style={{ left: 1086, top: 779.5, width: 92, height: 1 }} />
      {/* No Holiday model exists in the Prisma schema, so there is nothing to list here. */}
      <Txt l={1031} t={823} s={12} lh={16} cls="font-light text-black/40">
        No holidays scheduled
      </Txt>

      {/* =============================================================== */}
      {/* ===== dim backdrop + Leave Request modal =====                  */}
      {/* =============================================================== */}
      <div onClick={() => navigate(-1)} className="absolute inset-0" style={{ background: "rgba(0,0,0,0.5)" }} />

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
      {rows.length === 0 && (
        <Txt l={391} t={469.5} s={13} lh={18} cls="font-light text-black/40">
          No pending leave requests
        </Txt>
      )}
      {rows.map((l, i) => {
        const u = userById.get(l.userId);
        return (
          <LeaveRow
            key={l.id}
            top={469.5 + i * 72}
            avatarGrad={ROW_GRADS[i % ROW_GRADS.length]}
            name={u?.name ?? ""}
            role={u?.team?.name ?? u?.role ?? ""}
            email={u?.email ?? ""}
            date={`Date: ${fmtDate(l.from)} (${spanLabel(l.from, l.to)})`}
            reason={l.reason ?? l.type}
            onApprove={() => decide(l.id, "APPROVED")}
            onReject={() => decide(l.id, "REJECTED")}
          />
        );
      })}
    </>
  );
}
