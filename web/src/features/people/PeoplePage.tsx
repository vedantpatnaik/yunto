import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import {
  ArrowUp,
  ArrowDown,
  ArrowUpRight,
  ChevronDown,
  Users,
  UserX,
  House,
  Calendar,
  Waves,
  AlignJustify,
  Plus,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useUsers, type User } from "@/api/hooks";

/**
 * Super Admin — People screen.
 * Exact reconstruction of Figma frame 4992:23048 ("Super Admin-people"), 1440×1024.
 * Built CLEAN: the captured frame had the TopBar profile dropdown + dim scrim open;
 * those sibling nodes are intentionally omitted so the underlying page renders at full opacity.
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
      className={`absolute flex items-center gap-[8px] rounded-[24px] pl-[13px] cursor-pointer ${
        active ? "bg-black text-white" : "bg-white text-ink"
      }`}
      style={{ left: x, top: 231, width: w, height: 45 }}
    >
      <Icon className="h-[15px] w-[16px]" strokeWidth={1.6} />
      <span className="text-[14px] font-light leading-none">{label}</span>
    </div>
  );
}

/* ------------------------------ stat cards ------------------------------ */
function StatCard({ x, w, label, value }: { x: number; w: number; label: string; value: string }) {
  return (
    <div
      className="absolute rounded-[24px] bg-white/[0.47]"
      style={{ left: x, top: 303, width: w, height: 98 }}
    >
      <Txt l={14} t={10} s={14} lh={23} cls="font-light text-ink/90">
        {label}
      </Txt>
      <Txt l={14} t={32} s={36} lh={43} cls="font-normal text-ink">
        {value}
      </Txt>
    </div>
  );
}

/* ---------------------------- teams & roles ----------------------------- */
function SectionHeader({
  dx,
  labelX,
  y,
  badgeX,
  count,
  divX,
  divW,
  chevX,
  label,
}: {
  dx: number;
  labelX: number;
  y: number;
  badgeX: number;
  count: string;
  divX: number;
  divW: number;
  chevX: number;
  label: string;
}) {
  return (
    <>
      <Txt l={labelX + dx} t={y} s={15} lh={22} cls="font-normal text-ink/70">
        {label}
      </Txt>
      <div
        className="absolute flex items-center justify-center rounded-full border border-black/5 bg-white"
        style={{ left: badgeX + dx, top: y, width: 22.4, height: 22.4 }}
      >
        <span className="text-[10.3px] leading-none text-ink">{count}</span>
      </div>
      <div
        className="absolute bg-black/[0.07]"
        style={{ left: divX + dx, top: y + 11, width: divW, height: 1 }}
      />
      <div
        className="absolute flex items-center"
        style={{ left: chevX + dx, top: y, height: 22 }}
      >
        <ChevronDown className="h-[15px] w-[15px] text-ink/50" strokeWidth={1.5} />
      </div>
    </>
  );
}

type Person = {
  cx: number;
  cy: number;
  cw: number;
  abg: string;
  letter: string;
  lcolor: string;
  name: string;
  sub: string;
};

function PersonRow({ dx, p }: { dx: number; p: Person }) {
  const tx = p.cx + p.cw - 105;
  return (
    <>
      <div
        className="absolute rounded-[30px] border border-black/[0.05] bg-white"
        style={{ left: p.cx + dx, top: p.cy, width: p.cw, height: 53 }}
      />
      <div
        className="absolute flex items-center justify-center rounded-full"
        style={{ left: p.cx + 5 + dx, top: p.cy + 5, width: 42, height: 42, background: p.abg }}
      >
        <span className="text-[14px] font-normal leading-none" style={{ color: p.lcolor }}>
          {p.letter}
        </span>
      </div>
      <Txt l={p.cx + 50 + dx} t={p.cy + 7} s={14} lh={18} cls="font-normal text-ink/90">
        {p.name}
      </Txt>
      <Txt l={p.cx + 50 + dx} t={p.cy + 29} s={10} lh={13} cls="font-light text-ink/70">
        {p.sub}
      </Txt>
      {/* target chip */}
      <div
        className="absolute flex items-center rounded-full border border-black/[0.05] bg-white"
        style={{ left: tx + dx, top: p.cy + 6, width: 99, height: 40 }}
      >
        <div
          className="ml-[6px] flex h-[28px] w-[28px] items-center justify-center rounded-full"
          style={{ background: "#DAFDB0" }}
        >
          <span className="text-[9.3px] font-normal leading-none text-ink">45%</span>
        </div>
        <div className="ml-[7px]">
          <div className="text-[8px] font-medium leading-[13px] text-ink">Target ₹5L</div>
          <div className="text-[7.7px] font-medium leading-[13px] text-ink/70">(2.25L)</div>
        </div>
      </div>
    </>
  );
}

function TeamColumn({
  dx,
  iconBg,
  teamName,
  membersIconColor,
  greenCount,
  percent,
  persons,
  onExpand,
}: {
  dx: number;
  iconBg: string;
  teamName: string;
  membersIconColor: string;
  greenCount: number;
  percent: string;
  persons: Person[];
  onExpand?: () => void;
}) {
  return (
    <>
      {/* card bg */}
      <div
        className="absolute rounded-[12px] bg-[#F5F5F5]"
        style={{ left: 277 + dx, top: 466, width: 333, height: 487 }}
      />
      {/* team avatar icon */}
      <div
        className="absolute flex items-center justify-center rounded-full"
        style={{ left: 284 + dx, top: 475, width: 34, height: 34, background: iconBg }}
      >
        <Users className="h-[16px] w-[16px] text-ink" strokeWidth={1.6} />
      </div>
      <Txt l={323 + dx} t={477} s={20} lh={24} cls="font-normal text-ink/90">
        {teamName}
      </Txt>
      {/* members */}
      <div className="absolute" style={{ left: 323 + dx, top: 502 }}>
        <Users className="h-[10px] w-[11px]" strokeWidth={1.8} style={{ color: membersIconColor }} />
      </div>
      <Txt l={337 + dx} t={499} s={10} lh={16} cls="font-light text-ink/70">
        12 Members
      </Txt>
      {/* expand arrow */}
      <div
        onClick={onExpand}
        className="absolute flex items-center justify-center rounded-full bg-white cursor-pointer"
        style={{ left: 582 + dx, top: 467, width: 23, height: 23 }}
      >
        <ArrowUpRight className="h-[13px] w-[13px] text-ink" strokeWidth={1.7} />
      </div>
      {/* active / absent chips */}
      <div
        className="absolute flex items-center gap-[4px] rounded-[24px] bg-white pl-[6px] pr-[6px]"
        style={{ left: 448 + dx, top: 477, height: 20 }}
      >
        <span className="h-[7px] w-[7px] rounded-full" style={{ background: "#4CCC16" }} />
        <span className="text-[10px] font-light leading-none text-[#222]">10 Active</span>
      </div>
      <div
        className="absolute flex items-center gap-[4px] rounded-[24px] bg-white pl-[6px] pr-[6px]"
        style={{ left: 510 + dx, top: 477, height: 20 }}
      >
        <span className="h-[7px] w-[7px] rounded-full" style={{ background: "#737572" }} />
        <span className="text-[10px] font-light leading-none text-[#222]">2 Absent</span>
      </div>
      {/* progress bar */}
      <div
        className="absolute rounded-[18.46px] bg-white"
        style={{ left: 284 + dx, top: 526, width: 307, height: 36 }}
      />
      <Txt l={299 + dx} t={536} s={12.3} lh={16} cls="font-medium text-ink">
        ₹15L
      </Txt>
      {Array.from({ length: 26 }).map((_, i) => (
        <div
          key={i}
          className="absolute rounded-[3.5px]"
          style={{
            left: 334 + dx + i * 8,
            top: 532,
            width: 5,
            height: 20,
            background: i < greenCount ? "#C0E644" : "#4E4E4E",
          }}
        />
      ))}
      <Txt l={552.7 + dx} t={536} s={10.3} lh={17} cls="font-inter font-normal text-[rgba(31,31,31,0.8)]">
        {percent}
      </Txt>
      {/* sections */}
      <SectionHeader dx={dx} labelX={284} y={586} badgeX={389} count="1" divX={421} divW={146} chevX={577} label="Manager" />
      <PersonRow dx={dx} p={persons[0]} />
      <SectionHeader dx={dx} labelX={318} y={683} badgeX={423} count="1" divX={455} divW={114} chevX={578} label="Team Lead" />
      <PersonRow dx={dx} p={persons[1]} />
      <SectionHeader dx={dx} labelX={317} y={781} badgeX={422} count="10" divX={454} divW={114} chevX={577} label="Employees" />
      <PersonRow dx={dx} p={persons[2]} />
      <PersonRow dx={dx} p={persons[3]} />
    </>
  );
}

type PersonSlot = Omit<Person, "letter" | "name" | "sub">;

/* Fixed visual slots (positions + avatar colors) for each team column.
   Live user name / email / initial are filled into these slots at render time,
   so the layout, coordinates and colors stay pixel-identical to the design. */
const SALES_SLOTS: PersonSlot[] = [
  { cx: 283, cy: 620, cw: 318, abg: "#C6A6DF", lcolor: "#6000AA" },
  { cx: 288, cy: 717, cw: 310, abg: "#FFFEDF", lcolor: "#C4C11A" },
  { cx: 287, cy: 815, cw: 318, abg: "#FFE2DD", lcolor: "#BE3A19" },
  { cx: 285, cy: 879, cw: 318, abg: "#FFD3F4", lcolor: "#AA0069" },
];

const OPS_SLOTS: PersonSlot[] = [
  { cx: 283, cy: 620, cw: 318, abg: "#FFD9E2", lcolor: "#BE2146" },
  { cx: 288, cy: 717, cw: 310, abg: "#E5DFFF", lcolor: "#3F19E2" },
  { cx: 287, cy: 815, cw: 318, abg: "#CEEFFF", lcolor: "#0074AA" },
  { cx: 285, cy: 879, cw: 318, abg: "#D5FFE3", lcolor: "#006E25" },
];

/** Fill the fixed visual slots with live users, keeping the design's exact
 *  card count. Empty slots (no user yet / still loading) render blank rather
 *  than crashing, since the slot supplies every positional/colour field. */
function buildPersons(users: User[], slots: PersonSlot[]): Person[] {
  return slots.map((slot, i) => {
    const u = users[i];
    return {
      ...slot,
      letter: u?.name.charAt(0).toUpperCase() ?? "",
      name: u?.name ?? "",
      sub: u?.email ?? "",
    };
  });
}

/* --------------------------- people highlights -------------------------- */
function EventCard({
  top,
  kind,
  title,
  avatarBg,
  letter,
  lcolor,
  name,
  date,
}: {
  top: number;
  kind: "cake" | "anniv";
  title: string;
  avatarBg: string;
  letter: string;
  lcolor: string;
  name: string;
  date: string;
}) {
  const titleLeft = kind === "cake" ? 1079 : 1081;
  const nameLeft = kind === "cake" ? 1100 : 1102;
  return (
    <div
      className="absolute rounded-[32px] bg-white"
      style={{ left: 1033, top, width: 326, height: 62 }}
    >
      {kind === "cake" ? (
        <div
          className="absolute flex items-center justify-center text-[20px] leading-none"
          style={{ left: 12, top: 18, width: 24, height: 24 }}
        >
          🎂
        </div>
      ) : (
        <div
          className="absolute flex items-center justify-center rounded-[6.5px] bg-gradient-to-br from-[#F1FFC3] to-[#C8B3ED] text-[13px] leading-none"
          style={{ left: 12, top: 18, width: 26, height: 26 }}
        >
          🎉
        </div>
      )}
      <div className="absolute text-[12px] font-light leading-none text-ink/70" style={{ left: titleLeft - 1033, top: 14 }}>
        {title}
      </div>
      <div
        className="absolute flex items-center justify-center rounded-full"
        style={{ left: titleLeft - 1033, top: 32, width: 16, height: 16, background: avatarBg }}
      >
        <span className="text-[8px] font-normal leading-none" style={{ color: lcolor }}>
          {letter}
        </span>
      </div>
      <div className="absolute text-[14px] font-normal leading-none text-ink" style={{ left: nameLeft - 1033, top: 32 }}>
        {name}
      </div>
      <div className="absolute text-[12px] font-light leading-none text-ink/70" style={{ left: 1277 - 1033, top: 20 }}>
        {date}
      </div>
    </div>
  );
}

/* -------------------------------- page --------------------------------- */
export default function PeoplePage() {
  const navigate = useNavigate();
  const { data } = useUsers();
  const users = data ?? [];
  const managerFirst = (a: User, b: User) =>
    (a.role.includes("MANAGER") ? 0 : 1) - (b.role.includes("MANAGER") ? 0 : 1);
  const SALES = buildPersons(
    users.filter((u) => u.role.startsWith("SALES")).sort(managerFirst),
    SALES_SLOTS,
  );
  const OPS = buildPersons(
    users.filter((u) => u.role.startsWith("OPS")).sort(managerFirst),
    OPS_SLOTS,
  );

  return (
    <>
      {/* ===== page background (People frame fill 4992:23048) ===== */}
      {/* Sits behind the sidebar/topbar chrome via negative z-index so it
          overrides the global body gradient only for this screen. */}
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

      {/* ===== top-right stat pills ===== */}
      <StatPill numX={811} badgeX={872} labelX={856} num="18" badgeBg="#DCFF68" dir="up" icon={Users} label="Present" />
      <StatPill numX={939} badgeX={1000} labelX={984} num="2" badgeBg="#FFB0B1" dir="down" icon={UserX} label="Absent" />
      <StatPill numX={1067} badgeX={1128} labelX={1112} num="0" badgeBg="#DCFF68" dir="up" icon={House} label="WFH" />
      <StatPill numX={1195} badgeX={1256} labelX={1240} num="1" badgeBg="#DCFF68" dir="up" badgeText="1" label="Half Day" />

      {/* ===== date pill ===== */}
      <div onClick={() => navigate("/calendar")} className="absolute rounded-[18px] bg-white cursor-pointer" style={{ left: 1300, top: 151, width: 90, height: 32 }}>
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

      {/* ===== main panel (notched) ===== */}
      <div
        className="absolute"
        style={{
          left: 241,
          top: 222,
          width: 755,
          height: 987,
          background: "rgba(227,228,244,0.81)",
          clipPath: "polygon(414px 0, 755px 0, 755px 987px, 0 987px, 0 60px, 414px 60px)",
        }}
      />

      {/* tabs */}
      <Tab x={241} w={107} active icon={Waves} label="People" onClick={() => navigate("/people")} />
      <Tab x={356} w={122} icon={AlignJustify} label="Leaves" onClick={() => navigate("/people/leaves")} />
      <Tab x={482} w={156} icon={AlignJustify} label="Assign Creators" onClick={() => navigate("/people/assign-creators")} />

      {/* stat cards */}
      <StatCard x={257} w={161} label="Total Employee" value="22" />
      <StatCard x={436} w={161} label="Total Teams" value="2" />
      <StatCard x={615} w={161} label="Attendance Rate" value="92%" />
      <StatCard x={794} w={175} label="Avg. Login Time" value="10:15 am" />

      {/* ===== Teams & Roles ===== */}
      <div className="absolute rounded-[12px] bg-[#F5F5F5]" style={{ left: 257, top: 418, width: 723, height: 768 }} />
      <Txt l={269} t={426} s={12} lh={24} cls="font-normal text-ink">
        Teams &amp; Roles
      </Txt>
      <div
        onClick={() => navigate("/settings/add-members")}
        className="absolute flex items-center justify-center rounded-full bg-[#FEFCFF] cursor-pointer"
        style={{ left: 481, top: 426, width: 24, height: 24 }}
      >
        <Plus className="h-[11px] w-[11px] text-ink" strokeWidth={1.5} />
      </div>
      {/* white container */}
      <div className="absolute rounded-[12px] bg-white" style={{ left: 269, top: 451, width: 690, height: 723 }} />

      <TeamColumn
        dx={0}
        iconBg="#FDFFBC"
        teamName="Sales"
        membersIconColor="#D3D918"
        greenCount={15}
        percent="45%"
        persons={SALES}
        onExpand={() => navigate("/set-target")}
      />
      <TeamColumn
        dx={344}
        iconBg="#ECC5F5"
        teamName="Operations"
        membersIconColor="#B56CC5"
        greenCount={16}
        percent="55%"
        persons={OPS}
        onExpand={() => navigate("/set-target")}
      />

      {/* ===== People Highlights panel ===== */}
      <div
        className="absolute rounded-[24px] border border-[#D4D4D4]"
        style={{
          left: 1013,
          top: 222,
          width: 369,
          height: 791,
          background: "linear-gradient(160deg, rgba(255,255,255,0.46) 0%, #74A4F7 100%)",
        }}
      />
      <div
        className="absolute rounded-[8px] border border-white/40 bg-white/50"
        style={{ left: 1026, top: 275, width: 343, height: 724 }}
      />
      <Txt l={1026} t={238} s={20} lh={27} cls="font-medium text-ink">
        People Highlights
      </Txt>
      <Txt l={1033} t={286} s={14} lh={24} cls="font-light text-ink/70">
        Upcoming Events
      </Txt>
      <EventCard top={321} kind="cake" title="Happy birthday" avatarBg="#C6A6DF" letter="T" lcolor="#6000AA" name="Tanvi Sharma" date="16/09/2025" />
      <EventCard top={395} kind="cake" title="Happy birthday" avatarBg="#DDF7FF" letter="P" lcolor="#0F7D9E" name="Pooja Sharma" date="22/09/2025" />
      <EventCard top={469} kind="anniv" title="Work Anniversary" avatarBg="#C6A6DF" letter="H" lcolor="#6000AA" name="Hardik Singh" date="28/09/2025" />
    </>
  );
}
