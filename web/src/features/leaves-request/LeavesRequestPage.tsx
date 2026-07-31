import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLeaves, useList, useMe, useUpdate, useUsers } from "@/api/hooks";
import {
  AlignJustify,
  ArrowUp,
  Calendar,
  ChevronDown,
  FileText,
  Home,
  Plus,
  Search,
  Sparkles,
  UserX,
  Users,
  X,
} from "lucide-react";

/**
 * Super Admin — People / Leaves Request.
 * Exact reconstruction of Figma frame 5464:10690
 * ("Super Admin - people (Leaves request)"), 1440×1024.
 *
 * The screen is the "Leave Request" review modal (frame 4865:18377) sitting on a
 * rgba(0,0,0,0.5) scrim (frame 1171276614) over the leaves-calendar page.
 * The clean-screen rule targets the TopBar *profile dropdown* — not present here —
 * so the underlying page is built at full opacity beneath the scrim + modal.
 */

/* --------------------------------------------------------------------- */
/* small primitives                                                       */
/* --------------------------------------------------------------------- */
function Ini({
  x,
  y,
  s,
  bg,
  color,
  letter,
  fs,
}: {
  x: number;
  y: number;
  s: number;
  bg: string;
  color: string;
  letter: string;
  fs: number;
}) {
  return (
    <span
      className="absolute flex items-center justify-center rounded-full leading-none"
      style={{ left: x, top: y, width: s, height: s, background: bg, color, fontSize: fs }}
    >
      {letter}
    </span>
  );
}

function TabButton({
  icon: Icon,
  label,
  x,
  w,
  active,
  to,
}: {
  icon: LucideIcon;
  label: string;
  x: number;
  w: number;
  active?: boolean;
  to: string;
}) {
  const navigate = useNavigate();
  return (
    <div
      onClick={() => navigate(to)}
      className={`absolute top-[233px] flex h-[45px] cursor-pointer items-center gap-[8px] rounded-[24px] px-[12px] ${
        active ? "bg-black" : "bg-white"
      }`}
      style={{ left: x, width: w }}
    >
      <Icon className={`h-[20px] w-[20px] ${active ? "text-white" : "text-black"}`} strokeWidth={1.6} />
      <span className={`text-[14px] font-light ${active ? "text-white" : "text-black"}`}>{label}</span>
    </div>
  );
}

function ActionPill({
  label,
  x,
  w,
  trailing,
  to,
}: {
  label: string;
  x: number;
  w: number;
  trailing: "plus" | "chevron";
  to?: string;
}) {
  const navigate = useNavigate();
  return (
    <div
      onClick={to ? () => navigate(to) : undefined}
      className={`absolute top-[233px] flex h-[45px] items-center justify-center gap-[10px] rounded-[28px] bg-white/90 ${
        to ? "cursor-pointer" : ""
      }`}
      style={{ left: x, width: w }}
    >
      <span className="whitespace-nowrap text-[14px] font-light text-black">{label}</span>
      {trailing === "plus" ? (
        <Plus className="h-[16px] w-[16px] text-black" strokeWidth={1.7} />
      ) : (
        <ChevronDown className="h-[16px] w-[16px] text-black" strokeWidth={1.8} />
      )}
    </div>
  );
}

function MonthPill({ x }: { x: number }) {
  return (
    <div
      className="absolute flex h-[28px] items-center gap-[6px] rounded-[28px] bg-white/90 px-[14px]"
      style={{ left: x, top: 0 }}
    >
      <span className="text-[14px] font-light text-black">October</span>
      <ChevronDown className="h-[14px] w-[14px] text-black" strokeWidth={1.8} />
    </div>
  );
}

function StatItem({
  n,
  label,
  badgeColor,
  icon: Icon,
  badgeText,
  numX,
  grpX,
}: {
  n: string;
  label: string;
  badgeColor: string;
  icon?: LucideIcon;
  badgeText?: string;
  numX: number;
  grpX: number;
}) {
  return (
    <>
      <span
        className="absolute top-[140px] text-[48px] font-normal leading-none text-black"
        style={{ left: numX }}
      >
        {n}
      </span>
      <span
        className="absolute top-[143px] flex h-[15px] items-center gap-[1px] rounded-[9px] px-[2px]"
        style={{ left: grpX, background: badgeColor }}
      >
        <ArrowUp className="h-[9px] w-[9px] text-black" strokeWidth={2.2} />
        {Icon ? (
          <Icon className="h-[11px] w-[11px] text-black" strokeWidth={1.5} />
        ) : (
          <span className="text-[11px] font-light leading-none text-black">{badgeText}</span>
        )}
      </span>
      <span
        className="absolute top-[170px] text-[12px] font-light leading-none text-black/70"
        style={{ left: grpX }}
      >
        {label}
      </span>
    </>
  );
}

function BalanceCard({
  x,
  digit,
  digitColor,
  label,
}: {
  x: number;
  digit: string;
  digitColor: string;
  label: string;
}) {
  return (
    <div
      className="absolute top-[342px] flex h-[62px] w-[153px] items-center gap-[8px] rounded-[32px] bg-white pl-[7px]"
      style={{ left: x }}
    >
      <span
        className="flex h-[42px] w-[42px] items-center justify-center rounded-full text-[14px] leading-none"
        style={{ background: "#C6A6DF", color: digitColor }}
      >
        {digit}
      </span>
      <span className="text-[14px] font-normal text-black/90">{label}</span>
    </div>
  );
}

function PdfButton({ x, y }: { x: number; y: number }) {
  return (
    <div
      className="absolute flex h-[23px] w-[87px] items-center gap-[3px] rounded-[7px] bg-white pl-[4px]"
      style={{ left: x, top: y }}
    >
      <FileText className="h-[13px] w-[13px] text-black/70" strokeWidth={1.6} />
      <span className="text-[10.3px] font-light text-black/70">Medical..pdf</span>
    </div>
  );
}

/* --------------------------------------------------------------------- */
/* calendar                                                               */
/* --------------------------------------------------------------------- */
const WEEKS = [
  [1, 2, 3, 4, 5, 6, 7],
  [8, 9, 10, 11, 12, 13, 14],
  [15, 16, 17, 18, 19, 20, 21],
  [22, 23, 24, 25, 26, 27, 28],
  [29, 30, 31, 1, 2, 3, 4],
];
const COLX = [250, 358, 466, 574, 682, 790, 898];
const ROWY = [479, 577, 675, 773, 871];
/** Avatar-chip colourways from the Figma calendar, cycled per person. */
const CHIP_PALETTE = [
  { bg: "#C6A6DF", color: "#6000AA" },
  { bg: "#C4F1D2", color: "#007726" },
  { bg: "#D4CFFF", color: "#1A0C9A" },
  { bg: "#FFE3CF", color: "#DB6714" },
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

function Calendarium() {
  const { data: users } = useUsers();
  const { data: leaves } = useLeaves();

  // day-of-month -> initials of everyone on approved leave that day.
  const nameById = new Map((users ?? []).map((u) => [u.id, u.name] as const));
  const chips = new Map<number, string[]>();
  for (const l of leaves ?? []) {
    if (l.status !== "APPROVED") continue;
    const name = nameById.get(l.userId);
    if (!name) continue;
    for (const day of daysCovered(l.from, l.to)) {
      const bucket = chips.get(day) ?? [];
      bucket.push(initial(name));
      chips.set(day, bucket);
    }
  }

  return (
    <>
      {/* weekday header */}
      {WEEKDAYS.map((d) => (
        <span
          key={d.label}
          className="absolute top-[445px] text-[18px] font-light leading-[24px]"
          style={{ left: d.x, color: d.color }}
        >
          {d.label}
        </span>
      ))}

      {/* day cells */}
      {WEEKS.map((week, ri) =>
        week.map((day, ci) => {
          const sunday = ci === 6;
          const highlighted = day === 4 && ri === 0;
          return (
            <div
              key={`${ri}-${ci}`}
              className={`absolute h-[90px] w-[100px] rounded-[18px] ${sunday ? "" : "bg-white"}`}
              style={{ left: COLX[ci], top: ROWY[ri] }}
            >
              {highlighted ? (
                <div className="absolute left-[5px] top-[6px] flex h-[44px] w-[42px] items-center justify-center rounded-[20px] bg-[#D4EBF9] text-[20px] font-normal leading-none text-black">
                  4
                </div>
              ) : (
                <span className="absolute left-[15px] top-[15px] text-[20px] font-normal leading-[24px] text-black">
                  {day}
                </span>
              )}
            </div>
          );
        }),
      )}

      {/* people on approved leave, chipped onto their day cell (page-absolute coords) */}
      {WEEKS.map((week, ri) =>
        week.map((day, ci) => {
          if (ri === 4 && ci >= 3) return null; // trailing next-month cells
          return (chips.get(day) ?? []).slice(0, 3).map((letter, k) => {
            const pal = CHIP_PALETTE[(day + k) % CHIP_PALETTE.length];
            return (
              <Ini
                key={`chip-${ri}-${ci}-${k}`}
                x={COLX[ci] + 66 - k * 16}
                y={ROWY[ri] + 57}
                s={24}
                bg={pal.bg}
                color={pal.color}
                letter={letter}
                fs={8}
              />
            );
          });
        }),
      )}

      {/* decorations (page-absolute coords) */}
      <span className="absolute left-[430px] top-[691px] text-[13px] leading-none">🎂</span>
      <span className="absolute left-[322px] top-[789px] text-[13px] leading-none">🎂</span>
      {/* Holiday pill on day 24 */}
      <div className="absolute left-[478px] top-[818px] flex h-[26px] w-[76px] items-center gap-[3px] rounded-full bg-white pl-[8px]">
        <span className="h-[8px] w-[8px] rounded-full bg-[#88DFA9]" />
        <span className="text-[10px] text-black/80">Holiday</span>
      </div>
    </>
  );
}

/* --------------------------------------------------------------------- */
/* right-column cards                                                     */
/* --------------------------------------------------------------------- */
function RightCard({
  x,
  y,
  title,
  children,
}: {
  x: number;
  y: number;
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="absolute" style={{ left: x, top: y, width: 358, height: 241 }}>
      <div className="absolute h-[241px] w-[352px] rounded-[12px] bg-white/60" />
      <span className="absolute left-[10px] top-[8px] text-[12px] font-normal text-black">{title}</span>
      <MonthPill x={248} />
      <div className="absolute left-[10px] top-[39px] h-[188px] w-[327px] rounded-[12px] bg-white" />
      {children}
    </div>
  );
}

function FestiveBar({ x, y }: { x: number; y: number }) {
  return (
    <span
      className="absolute h-[10px] w-[150px] rounded-full opacity-80"
      style={{
        left: x,
        top: y,
        background:
          "repeating-linear-gradient(90deg,#F4A6C0 0 8px,#FFD36E 8px 16px,#8FD3F0 16px 24px,#A9E5B0 24px 32px)",
      }}
    />
  );
}

function EventRow({
  dy,
  bg,
  color,
  letter,
  caption,
  name,
  date,
}: {
  dy: number;
  bg: string;
  color: string;
  letter: string;
  caption: string;
  name: string;
  date: string;
}) {
  return (
    <>
      <span className="absolute text-[15px] leading-none" style={{ left: 22, top: 72 + dy }}>
        🎂
      </span>
      <span
        className="absolute text-[12px] font-light leading-none text-black/70"
        style={{ left: 56, top: 69 + dy }}
      >
        {caption}
      </span>
      <Ini x={56} y={87 + dy} s={16} bg={bg} color={color} letter={letter} fs={8} />
      <span
        className="absolute text-[14px] leading-none text-black"
        style={{ left: 77, top: 88 + dy }}
      >
        {name}
      </span>
      <FestiveBar x={152} y={57 + dy} />
      <span
        className="absolute text-[12px] font-light leading-none text-black/70"
        style={{ left: 254, top: 74 + dy }}
      >
        {date}
      </span>
    </>
  );
}

/** Colourways for the two Upcoming Events rows, in Figma order. */
const EVENT_PALETTE = [
  { bg: "#C6A6DF", color: "#6000AA" },
  { bg: "#DDF7FF", color: "#0F7D9E" },
];

function RightRail() {
  const { data: users } = useUsers();
  const { data: leaves } = useLeaves();
  const { data: reminders } = useList<{ id: string; title: string; dueAt: string; ownerId?: string }>(
    "reminders",
  );

  // Whoever is out right now; when nobody is out today, surface the next one up.
  const approved = (leaves ?? []).filter((l) => l.status === "APPROVED");
  const current =
    approved.find((l) => coversToday(l.from, l.to)) ??
    [...approved]
      .filter((l) => new Date(l.to).getTime() >= Date.now())
      .sort((a, b) => new Date(a.from).getTime() - new Date(b.from).getTime())[0];
  const person = (users ?? []).find((u) => u.id === current?.userId);
  // Reporting manager = the *_MANAGER sitting on the same team.
  const manager = (users ?? []).find(
    (u) => u.role.endsWith("MANAGER") && !!person?.team && u.team?.id === person.team.id,
  );

  // Upcoming Events = the next reminders falling due, credited to their owner.
  const nameById = new Map((users ?? []).map((u) => [u.id, u.name] as const));
  const startOfToday = new Date(new Date().toDateString()).getTime();
  const upcoming = (reminders ?? [])
    .filter((r) => {
      const t = new Date(r.dueAt).getTime();
      return !Number.isNaN(t) && t >= startOfToday;
    })
    .sort((a, b) => new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime())
    .slice(0, 2);

  return (
    <>
      {/* On leave */}
      <RightCard x={1015} y={224} title="On leave">
        <span className="absolute left-[10px] top-[39px] text-[12px] leading-none text-black/70">Today</span>
        <span className="absolute left-[51px] top-[48px] h-px w-[92px] bg-black/10" />
        {current && person ? (
          <>
            <Ini x={17} y={80} s={42} bg="#C6A6DF" color="#6000AA" letter={initial(person.name)} fs={14} />
            <span className="absolute left-[64px] top-[82px] text-[14px] leading-none text-black/90">
              {person.name}
            </span>
            <span className="absolute left-[166px] top-[85px] text-[10px] font-light leading-none text-black/70">
              {person.team?.name ?? person.role}
            </span>
            <span className="absolute left-[64px] top-[100px] w-[80px] text-[10px] font-light leading-[12px] text-black/70">
              Rep. Manager: {manager?.name ?? "—"}
            </span>
            <span className="absolute left-[152px] top-[108px] text-[10px] font-light leading-none text-black/70">
              {current.type}
            </span>
            <PdfButton x={216} y={102} />
          </>
        ) : (
          <span className="absolute left-[17px] top-[92px] text-[12px] font-light leading-none text-black/40">
            No one on leave
          </span>
        )}
      </RightCard>

      {/* Upcoming Events */}
      <RightCard x={1015} y={485} title="Upcoming Events">
        {upcoming.length === 0 ? (
          <span className="absolute left-[22px] top-[92px] text-[12px] font-light leading-none text-black/40">
            No upcoming events
          </span>
        ) : (
          upcoming.map((r, i) => {
            const owner = r.ownerId ? nameById.get(r.ownerId) : undefined;
            return (
              <EventRow
                key={r.id}
                dy={i * 74}
                bg={EVENT_PALETTE[i % EVENT_PALETTE.length].bg}
                color={EVENT_PALETTE[i % EVENT_PALETTE.length].color}
                letter={owner ? initial(owner) : "—"}
                caption={r.title}
                name={owner ?? "Unassigned"}
                date={fmtDateLong(r.dueAt)}
              />
            );
          })
        )}
      </RightCard>

      {/* Holidays — no Holiday model exists yet, so the card owns up to being empty. */}
      <RightCard x={1014} y={750} title="Holidays">
        <span className="absolute left-[10px] top-[39px] text-[12px] leading-none text-black/70">Upcoming</span>
        <span className="absolute left-[72px] top-[48px] h-px w-[92px] bg-black/10" />
        <span className="absolute left-[17px] top-[92px] text-[12px] font-light leading-none text-black/40">
          No holidays scheduled
        </span>
      </RightCard>
    </>
  );
}

/* --------------------------------------------------------------------- */
/* underlying leaves-calendar page                                        */
/* --------------------------------------------------------------------- */
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

/** Day-of-month numbers spanned by [from, to], capped at one grid's worth. */
function daysCovered(from: string, to: string): number[] {
  const a = new Date(from);
  const b = new Date(to);
  if (Number.isNaN(a.getTime()) || Number.isNaN(b.getTime())) return [];
  const cur = new Date(a.getFullYear(), a.getMonth(), a.getDate());
  const end = new Date(b.getFullYear(), b.getMonth(), b.getDate());
  const out: number[] = [];
  while (cur.getTime() <= end.getTime() && out.length < 31) {
    out.push(cur.getDate());
    cur.setDate(cur.getDate() + 1);
  }
  return out;
}

/** dd/mm/yyyy from an ISO date string, matching the Figma event rows. */
function fmtDateLong(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
}

/** First letter of a name, for the circular avatar chips. */
function initial(name: string): string {
  return name.trim().charAt(0).toUpperCase();
}

/** Zero-padded two-digit count, matching the Figma "02" / "01" balance chips. */
function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

function Background() {
  const navigate = useNavigate();
  const { data: users } = useUsers();
  const { data: leaves } = useLeaves();
  const { data: me } = useMe();

  const headcount = (users ?? []).length;
  const approved = (leaves ?? []).filter((l) => l.status === "APPROVED");
  const outToday = approved.filter((l) => coversToday(l.from, l.to));
  const absent = new Set(outToday.map((l) => l.userId)).size;
  const present = Math.max(0, headcount - absent);
  const wfh = outToday.filter((l) => /wfh|work from home/i.test(l.type)).length;
  const halfDay = outToday.filter((l) => /half/i.test(l.type)).length;

  // Leave balance = leaves the signed-in user has already taken, per type.
  const mine = approved.filter((l) => l.userId === me?.id);
  const takenOf = (re: RegExp) => pad2(mine.filter((l) => re.test(l.type)).length);

  return (
    <>
      {/* page title */}
      <h1 className="absolute left-[259px] top-[150px] text-[40px] font-normal text-black">PEOPLE</h1>

      {/* search + people-count filter (right of title) */}
      <span
        onClick={() => navigate("/search")}
        className="absolute left-[488px] top-[151.5px] flex h-[45px] w-[45px] cursor-pointer items-center justify-center rounded-full bg-white"
      >
        <Search className="h-[22px] w-[22px] text-black" strokeWidth={1.7} />
      </span>
      <div className="absolute left-[541px] top-[150px] flex h-[48px] w-[72px] items-center gap-[5px] rounded-[24px] bg-white pl-[11px]">
        <Users className="h-[22px] w-[22px] text-black" strokeWidth={1.5} />
        <span className="flex h-[14px] w-[14px] items-center justify-center rounded-full bg-[#20A271] text-[10px] leading-none text-white">
          {headcount}
        </span>
      </div>

      {/* attendance stat pills */}
      <StatItem n={String(present)} label="Present" badgeColor="#DCFF68" icon={Users} numX={810} grpX={855} />
      <StatItem n={String(absent)} label="Absent" badgeColor="#FFB0B1" icon={UserX} numX={938} grpX={983} />
      <StatItem n={String(wfh)} label="WFH" badgeColor="#DCFF68" icon={Home} numX={1066} grpX={1111} />
      <StatItem
        n={String(halfDay)}
        label="Half Day"
        badgeColor="#DCFF68"
        badgeText={String(halfDay)}
        numX={1194}
        grpX={1239}
      />

      {/* date pill */}
      <div className="absolute left-[1299px] top-[153px] flex h-[32px] w-[90px] items-center gap-[4px] rounded-[18px] bg-white pl-[3px]">
        <span className="flex h-[24px] w-[24px] items-center justify-center rounded-full bg-[#F1F1F1]">
          <Calendar className="h-[14px] w-[14px] text-black" strokeWidth={1.6} />
        </span>
        <span className="text-[12px] font-light text-black/90">{fmtDate(new Date().toISOString())}</span>
      </div>

      {/* tab / action row */}
      <TabButton icon={Sparkles} label="People" x={242} w={107} to="/people" />
      <TabButton icon={AlignJustify} label="Leaves" x={357} w={122} active to="/people/leaves" />
      <TabButton icon={AlignJustify} label="Assign Creators" x={482} w={156} to="/people/assign-creators" />
      <ActionPill label="Add Holiday" x={664} w={100} trailing="plus" to="/people/holidays" />
      <ActionPill label="Apply for leave" x={770} w={114} trailing="plus" to="/people/apply-leave" />
      <ActionPill label="October" x={890} w={108} trailing="chevron" />

      {/* leave balance */}
      <span className="absolute left-[257px] top-[306px] text-[18px] font-light text-black">Leave Balance</span>
      <BalanceCard x={257} digit={takenOf(/casual/i)} digitColor="#6000AA" label="Causal Leave" />
      <BalanceCard x={427} digit={takenOf(/sick/i)} digitColor="#6CA478" label="Sick Leave" />

      {/* calendar */}
      <Calendarium />

      {/* right rail cards */}
      <RightRail />
    </>
  );
}

/* --------------------------------------------------------------------- */
/* Leave Request modal                                                    */
/* --------------------------------------------------------------------- */
/** dd/mm/yy from an ISO date string. */
function fmtDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const day = d.getDate();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = String(d.getFullYear()).slice(-2);
  return `${day}/${month}/${year}`;
}

/** Human duration between two ISO dates, e.g. "One day" / "3 days". */
function spanLabel(from: string, to: string): string {
  const a = new Date(from);
  const b = new Date(to);
  if (Number.isNaN(a.getTime()) || Number.isNaN(b.getTime())) return "";
  const days = Math.max(1, Math.round((b.getTime() - a.getTime()) / 86_400_000));
  return days <= 1 ? "One day" : `${days} days`;
}

function RequestRow({
  dy,
  name,
  role,
  email,
  date,
  type,
  onApprove,
  onReject,
}: {
  dy: number;
  name: string;
  role: string;
  email: string;
  date: string;
  type: string;
  onApprove: () => void;
  onReject: () => void;
}) {
  return (
    <>
      {/* person info container */}
      <div
        className="absolute left-[19px] h-[62px] w-[470px] rounded-[32px] bg-white/90"
        style={{ top: 79 + dy }}
      />
      <span
        className="absolute h-[42px] w-[42px] rounded-full bg-gradient-to-br from-[#C8E6FF] to-[#C8B3ED]"
        style={{ left: 26, top: 89 + dy }}
      />
      <span
        className="absolute text-[14px] leading-none text-black/90"
        style={{ left: 74, top: 89 + dy }}
      >
        {name}
      </span>
      <span
        className="absolute text-[10px] font-light leading-none text-black/70"
        style={{ left: 176, top: 91.5 + dy }}
      >
        {role}
      </span>
      <span
        className="absolute text-[10px] font-light leading-none text-black/70"
        style={{ left: 76, top: 107 + dy }}
      >
        {email}
      </span>
      <span
        className="absolute text-[10px] leading-none text-[#0D732D]/70"
        style={{ left: 76, top: 123 + dy }}
      >
        {date}
      </span>

      {/* divider + reason */}
      <span className="absolute w-px bg-black/10" style={{ left: 287, top: 86 + dy, height: 47 }} />
      <span
        className="absolute text-[12px] leading-none text-black/90"
        style={{ left: 303, top: 86 + dy }}
      >
        Reason for leave
      </span>
      <span
        className="absolute text-[10px] font-light leading-none text-black/70"
        style={{ left: 303, top: 110 + dy }}
      >
        {type}
      </span>
      <PdfButton x={367} y={107 + dy} />

      {/* actions */}
      <div
        onClick={onApprove}
        className="absolute flex h-[40px] w-[82px] cursor-pointer items-center justify-center rounded-[24px] border border-black/[0.05] bg-white shadow-[0_1px_5px_rgba(0,0,0,0.10)]"
        style={{ left: 505, top: 90 + dy }}
      >
        <span className="text-[13px] text-[#4150F7]">Approve</span>
      </div>
      <div
        onClick={onReject}
        className="absolute flex h-[40px] w-[76px] cursor-pointer items-center justify-center rounded-[24px] border border-black/[0.05] bg-white shadow-[0_1px_5px_rgba(0,0,0,0.10)]"
        style={{ left: 598, top: 90 + dy }}
      >
        <span className="text-[13px] text-black">Reject</span>
      </div>
    </>
  );
}

function LeaveRequestModal() {
  const navigate = useNavigate();
  const { data: leaves } = useLeaves();
  const { data: users } = useUsers();
  const upd = useUpdate("leaves");
  const userById = new Map((users ?? []).map((u) => [u.id, u] as const));
  const pending = (leaves ?? []).filter((l) => l.status === "PENDING").slice(0, 2);
  const decide = (id: string, status: "APPROVED" | "REJECTED") => {
    try {
      upd.mutate({ id, data: { status } });
    } catch {
      /* mutation errors are surfaced via React Query state; never hang the click */
    }
  };
  return (
    <div className="absolute left-[372px] top-[390.5px] h-[243px] w-[697px] rounded-[24px] bg-white shadow-[0_24px_70px_rgba(0,0,0,0.28)]">
      <h2 className="absolute left-[19px] top-[24px] text-[24px] font-medium leading-none text-black">
        Leave Request
      </h2>
      <span
        onClick={() => navigate(-1)}
        className="absolute left-[626px] top-[20px] flex h-[45px] w-[45px] cursor-pointer items-center justify-center rounded-full border border-black/10 bg-white"
      >
        <X className="h-[18px] w-[18px] text-black" strokeWidth={1.8} />
      </span>

      {pending.length === 0 && (
        <span className="absolute left-[19px] top-[92px] text-[13px] font-light leading-none text-black/40">
          No pending leave requests
        </span>
      )}

      {pending.map((leave, i) => {
        const user = userById.get(leave.userId);
        return (
          <RequestRow
            key={leave.id}
            dy={i * 72}
            name={user?.name ?? ""}
            role={user?.role ?? ""}
            email={user?.email ?? ""}
            date={`Date: ${fmtDate(leave.from)} (${spanLabel(leave.from, leave.to)})`}
            type={leave.type}
            onApprove={() => decide(leave.id, "APPROVED")}
            onReject={() => decide(leave.id, "REJECTED")}
          />
        );
      })}
    </div>
  );
}

/* --------------------------------------------------------------------- */
/* page                                                                   */
/* --------------------------------------------------------------------- */
export default function LeavesRequestPage() {
  const navigate = useNavigate();
  return (
    <>
      <Background />
      {/*
       * The Leave Request modal (Figma frame 1171276614 → 4865:18377) sits on a
       * rgba(0,0,0,0.5) scrim that dims the ENTIRE canvas — including the AppShell
       * TopBar (z-10) and Sidebar (z-20). Lift scrim + modal above that chrome.
       */}
      <div className="absolute inset-0 z-30">
        <div onClick={() => navigate(-1)} className="absolute inset-0 bg-black/50" />
        <LeaveRequestModal />
      </div>
    </>
  );
}
