import type { CSSProperties, ReactNode } from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUsers, type User } from "@/api/hooks";
import type { LucideIcon } from "lucide-react";
import {
  X,
  ArrowUp,
  Users,
  Sparkles,
  Package,
  Mail,
  MailWarning,
  MailCheck,
  Flag,
} from "lucide-react";

/**
 * Super Admin — Set Target dashboard (Figma frame 4937:11303, 1440×1024).
 *
 * The frame stacks: dashboard → dark scrim + "Set your targets" panel →
 * dark scrim + "Change Team Targets" modal. The modal is this screen's real
 * content (not a profile popup), so it is reproduced faithfully. The AppShell
 * TopBar (z-10) / Sidebar (z-20) render behind this z-30 layer and are dimmed
 * by Scrim A, exactly as in the source. The far-back dashboard is fully
 * obscured by the opaque panel / double scrim and is intentionally omitted.
 */

const SCRIM: CSSProperties = { background: "rgba(79,79,79,0.76)" };

/* ------------------------------ primitives ----------------------------- */

function ChipPill({
  icon: Icon,
  iconClass,
  children,
  w,
}: {
  icon: LucideIcon;
  iconClass?: string;
  children: ReactNode;
  w?: number;
}) {
  return (
    <span
      className="flex h-[20px] items-center gap-[2px] rounded-full border border-black/[0.05] bg-white px-[5px]"
      style={w ? { width: w } : undefined}
    >
      <Icon className={`h-[11px] w-[11px] ${iconClass ?? "text-black/70"}`} strokeWidth={1.7} />
      <span className="font-inter text-[7px] font-medium text-[#222]">{children}</span>
    </span>
  );
}

function ProgressChip({ color, n }: { color: string; n: string }) {
  return (
    <span className="flex h-[20px] w-[40px] items-center justify-center gap-[3px] rounded-full border border-black/[0.05] bg-white">
      <span className="h-[10px] w-[10px] rounded-full border-2" style={{ borderColor: color }} />
      <span className="text-[7px] text-black/80">{n}</span>
    </span>
  );
}

function LeadChips() {
  return (
    <div className="flex items-center gap-[3.5px]">
      <ChipPill icon={Mail} iconClass="text-black/70">2 Leads</ChipPill>
      <ChipPill icon={MailWarning} iconClass="text-black/70">4 Leads</ChipPill>
      <ChipPill icon={MailCheck} iconClass="text-black/70">7 Leads</ChipPill>
    </div>
  );
}

function CampaignChips() {
  return (
    <div className="flex items-center gap-[4.3px]">
      <ChipPill icon={Flag} iconClass="text-black/80">7 Campaigns</ChipPill>
      <ProgressChip color="#75A7C7" n="4" />
      <ProgressChip color="#79B282" n="1" />
      <ProgressChip color="#EBB363" n="2" />
    </div>
  );
}

function PersonRow({
  left,
  top,
  bg,
  tc,
  initial,
  name,
  target,
  sub,
  variant,
  onOpen,
}: {
  left: number;
  top: number;
  bg: string;
  tc: string;
  initial: string;
  name: string;
  target: string;
  sub: string;
  variant: "leads" | "campaigns";
  onOpen?: () => void;
}) {
  return (
    <div className="absolute h-[53px] w-[435px] rounded-[30px] bg-white" style={{ left, top }}>
      {/* avatar */}
      <div
        className="absolute left-[5px] top-[5px] flex h-[42px] w-[42px] items-center justify-center rounded-full text-[14px]"
        style={{ background: bg, color: tc }}
      >
        {initial}
      </div>
      {/* name */}
      <span className="absolute left-[52px] top-[8px] text-[14px] text-black/90">{name}</span>
      {/* 45% badge */}
      <span className="absolute left-[299px] top-[12px] flex h-[28px] w-[28px] items-center justify-center rounded-full bg-[#DAFDB0] text-[9.3px] text-black">
        45%
      </span>
      {/* target label */}
      <span className="absolute left-[335px] top-[13px] flex flex-col leading-[13px]">
        <span className="text-[8px] font-medium text-black">{target}</span>
        <span className="text-[7.7px] font-medium text-black/70">{sub}</span>
      </span>
      {/* arrow button */}
      <span
        onClick={onOpen}
        className="absolute left-[403px] top-[17px] flex h-[20px] w-[20px] cursor-pointer items-center justify-center rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,0.08)]"
      >
        <ArrowUp className="h-[10px] w-[10px] text-black" strokeWidth={1.8} />
      </span>
      {/* chips */}
      <div className="absolute left-[52px] top-[27px]">
        {variant === "leads" ? <LeadChips /> : <CampaignChips />}
      </div>
    </div>
  );
}

function GroupHeader({
  left,
  top,
  label,
  count,
  dividerLeft,
  dividerWidth,
  arrowLeft,
}: {
  left: number;
  top: number;
  label: string;
  count: string;
  dividerLeft: number;
  dividerWidth: number;
  arrowLeft: number;
}) {
  return (
    <>
      <span className="absolute text-[15px] text-black/70" style={{ left, top: top + 3 }}>
        {label}
      </span>
      <span
        className="absolute flex h-[22px] w-[22px] items-center justify-center rounded-full bg-white text-[10.3px] text-black"
        style={{ left: dividerLeft - 32, top }}
      >
        {count}
      </span>
      <span
        className="absolute h-px bg-black/10"
        style={{ left: dividerLeft, top: top + 11, width: dividerWidth }}
      />
      <span
        className="absolute flex h-[16px] w-[16px] items-center justify-center"
        style={{ left: arrowLeft, top: top + 3 }}
      >
        <ArrowUp className="h-[11px] w-[11px] text-black" strokeWidth={1.7} />
      </span>
    </>
  );
}

/* --------------------------- team card (panel) ------------------------- */

type Slot = { dx: number; y: number; bg: string; tc: string };
type PersonData = Slot & {
  initial: string;
  name: string;
  target: string;
  sub: string;
};

function TeamCard({
  baseX,
  avatarBg,
  name,
  memberCount,
  statCard,
  people,
  variant,
  onOpen,
  onPersonOpen,
}: {
  baseX: number;
  avatarBg: string;
  name: string;
  memberCount: number;
  statCard: ReactNode;
  people: PersonData[];
  variant: "leads" | "campaigns";
  onOpen?: () => void;
  onPersonOpen?: () => void;
}) {
  const groups = [
    { label: "Manager", count: "1", labelDx: 54, dividerDx: 191, dividerW: 146, arrowDx: 346.7, y: 545 },
    { label: "Team Lead", count: "1", labelDx: 47, dividerDx: 184, dividerW: 147, arrowDx: 340.3, y: 646 },
    { label: "Employees", count: "10", labelDx: 47, dividerDx: 184, dividerW: 114, arrowDx: 307.3, y: 751 },
  ];
  return (
    <>
      {/* card body */}
      <div
        className="absolute h-[598px] w-[523px] rounded-[12px] border border-[#DEDEDE] bg-[#F5F5F5]"
        style={{ left: baseX, top: 331 }}
      />
      {/* open arrow (top-right) */}
      <span
        onClick={onOpen}
        className="absolute flex h-[32px] w-[32px] cursor-pointer items-center justify-center rounded-full bg-white shadow-[0_1px_4px_rgba(0,0,0,0.08)]"
        style={{ left: baseX + 490, top: 333 }}
      >
        <ArrowUp className="h-[15px] w-[15px] text-black" strokeWidth={1.7} />
      </span>
      {/* team header */}
      <div
        className="absolute flex h-[42px] w-[42px] items-center justify-center rounded-full"
        style={{ left: baseX + 12, top: 351, background: avatarBg }}
      >
        <Users className="h-[20px] w-[20px] text-black" strokeWidth={1.7} />
      </div>
      <span className="absolute text-[24px] text-[#111827]" style={{ left: baseX + 62, top: 351 }}>
        {name}
      </span>
      <div className="absolute flex items-center gap-[5px]" style={{ left: baseX + 62, top: 377 }}>
        <Users className="h-[14px] w-[14px] text-[#8b93d6]" strokeWidth={1.8} />
        <span className="text-[12px] text-black/70">{memberCount} Members</span>
      </div>
      {/* stat card */}
      {statCard}
      {/* People header */}
      <span className="absolute text-[20px] text-black/70" style={{ left: baseX + 20, top: 508 }}>
        People
      </span>
      <span
        className="absolute flex h-[24px] w-[24px] items-center justify-center rounded-full bg-white text-[11px] text-black"
        style={{ left: baseX + 159, top: 506 }}
      >
        {memberCount}
      </span>
      <span className="absolute h-px bg-black/10" style={{ left: baseX + 193, top: 518, width: 268 }} />
      {/* groups */}
      {groups.map((g) => (
        <GroupHeader
          key={g.label}
          left={baseX + g.labelDx}
          top={g.y}
          label={g.label}
          count={g.count}
          dividerLeft={baseX + g.dividerDx}
          dividerWidth={g.dividerW}
          arrowLeft={baseX + g.arrowDx}
        />
      ))}
      {/* people rows */}
      {people.map((p) => (
        <PersonRow
          key={p.name}
          left={baseX + p.dx}
          top={p.y}
          bg={p.bg}
          tc={p.tc}
          initial={p.initial}
          name={p.name}
          target={p.target}
          sub={p.sub}
          variant={variant}
          onOpen={onPersonOpen}
        />
      ))}
    </>
  );
}

function GreenTarget({ left }: { left: number }) {
  return (
    <div
      className="absolute flex h-[64px] w-[119px] flex-col items-center justify-center rounded-[12px] bg-[#DAFDB0]"
      style={{ left, top: 421 }}
    >
      <span className="text-[20px] font-medium text-black">₹5L of ₹20L</span>
      <span className="text-[10px] font-light text-black/90">TARGET</span>
    </div>
  );
}

function StatNum({ left, n, label }: { left: number; n: string; label: string }) {
  return (
    <div className="absolute flex flex-col items-center" style={{ left, top: 431 }}>
      <span className="text-[14px] font-medium leading-[20px] text-black">{n}</span>
      <span className="text-[10px] text-black">{label}</span>
    </div>
  );
}

/* ------------------------------ modal bits ----------------------------- */

function Radio({
  top,
  selected,
  onSelect,
}: {
  top: number;
  selected?: boolean;
  onSelect?: () => void;
}) {
  return (
    <span
      onClick={onSelect}
      className="absolute left-[71px] flex h-[24px] w-[24px] cursor-pointer items-center justify-center"
      style={{ top }}
    >
      <span className="h-[20px] w-[20px] rounded-full border-2 border-[#79747E]" />
      {selected && (
        <span className="absolute left-[7px] top-[7px] h-[10px] w-[10px] rounded-full bg-[#79747E]" />
      )}
    </span>
  );
}

/* -------------------------------- page --------------------------------- */

const compact = (n: number) =>
  n >= 1e6
    ? `${(n / 1e6).toFixed(1).replace(/\.0$/, "")}M`
    : n >= 1e3
      ? `${Math.round(n / 1e3)}k`
      : `${n}`;
const lakhs = (n: number) => `₹${(n / 1e5).toFixed(1)}L`;

/* fixed avatar/coordinate slots — real members are mapped onto these in order */
const SALES_SLOTS: Slot[] = [
  { dx: 52, y: 579, bg: "#C6A6DF", tc: "#6000AA" },
  { dx: 45, y: 683, bg: "#FFFEDF", tc: "#C4C11A" },
  { dx: 45, y: 788, bg: "#FFE2DD", tc: "#BE3A19" },
  { dx: 45, y: 856, bg: "#FFD3F4", tc: "#AA0069" },
];
const OPS_SLOTS: Slot[] = [
  { dx: 52, y: 579, bg: "#FFD9E2", tc: "#BE2146" },
  { dx: 45, y: 683, bg: "#E5DFFF", tc: "#3F19E2" },
  { dx: 45, y: 788, bg: "#CEEFFF", tc: "#0074AA" },
  { dx: 45, y: 856, bg: "#D5FFE3", tc: "#006E25" },
];

function toPeople(list: User[], slots: Slot[]): PersonData[] {
  return list.slice(0, slots.length).map((u, i) => ({
    ...slots[i],
    initial: (u.name || "?").charAt(0),
    name: u.name,
    target: `₹${compact(u.targetMonthly ?? 0)}`,
    sub: `(${lakhs(u.targetYearly ?? 0)})`,
  }));
}

export default function SetTargetPage() {
  const navigate = useNavigate();
  const [effective, setEffective] = useState<"next" | "this" | null>(null);
  const { data } = useUsers();
  const users = data ?? [];
  const salesUsers = users.filter((u) => u.team?.kind === "SALES");
  const opsUsers = users.filter((u) => u.team?.kind === "OPERATIONS");
  const salesPeople = toPeople(salesUsers, SALES_SLOTS);
  const opsPeople = toPeople(opsUsers, OPS_SLOTS);

  return (
    <div className="absolute inset-0 z-30">
      {/* ==================== Scrim A ==================== */}
      <div className="absolute inset-0" style={SCRIM} />

      {/* ==================== SET YOUR TARGETS PANEL ==================== */}
      <div className="absolute left-[129px] top-[68px] h-[890px] w-[1182px] rounded-[24px] bg-white" />

      {/* header */}
      <span className="absolute left-[159px] top-[97px] text-[24px] font-medium text-black">
        Set your targets
      </span>
      {/* Save (panel) */}
      <div
        onClick={() => navigate(-1)}
        className="absolute left-[1096px] top-[100px] flex h-[42px] w-[118px] cursor-pointer items-center justify-center rounded-[24px] bg-black/95"
      >
        <span className="text-[20px] font-medium text-white">Save</span>
      </div>
      {/* close (panel) */}
      <span
        onClick={() => navigate(-1)}
        className="absolute left-[1234px] top-[97px] flex h-[48px] w-[48px] cursor-pointer items-center justify-center rounded-full bg-white"
      >
        <X className="h-[20px] w-[20px] text-black" strokeWidth={1.8} />
      </span>

      {/* summary bar */}
      <div className="absolute left-[188px] top-[179px] h-[137px] w-[1063px] rounded-[18px] bg-[#F7F7F7]" />
      <div className="absolute left-[200px] top-[198px] flex h-[52px] w-[52px] items-center justify-center rounded-full bg-white">
        <Sparkles className="h-[24px] w-[24px] text-black" strokeWidth={1.5} />
      </div>
      <span className="absolute left-[262px] top-[200px] text-[28px] text-[#111827]">Team Target</span>
      <div className="absolute left-[262px] top-[231px] flex items-center gap-[6px]">
        <Users className="h-[18px] w-[18px] text-[#8b93d6]" strokeWidth={1.8} />
        <span className="text-[15px] text-black/70">{salesUsers.length + opsUsers.length} Members</span>
      </div>
      {/* dividers */}
      <span className="absolute left-[512px] top-[198px] h-[62px] w-px bg-black/10" />
      <span className="absolute left-[765px] top-[198px] h-[62px] w-px bg-black/10" />
      {/* monthly / yearly current */}
      <span className="absolute left-[544px] top-[198px] text-[20px] font-light text-[#8D8D8D]">Monthly Target</span>
      <span className="absolute left-[544px] top-[228px] text-[32px] font-medium text-black">₹5L</span>
      <span className="absolute left-[793px] top-[198px] text-[20px] font-light text-[#8D8D8D]">Yearly Target</span>
      <span className="absolute left-[793px] top-[228px] text-[32px] font-medium text-black">₹50L</span>
      {/* Change Target */}
      <div className="absolute left-[1065px] top-[198px] flex h-[47px] w-[163px] items-center justify-center rounded-[40px] bg-white">
        <span className="text-[20px] font-light text-black">Change Target</span>
      </div>

      {/* left column — Sales */}
      <TeamCard
        baseX={188}
        avatarBg="#FDFFBC"
        name="Sales"
        memberCount={salesUsers.length}
        variant="leads"
        people={salesPeople}
        onOpen={() => navigate("/people")}
        onPersonOpen={() => navigate("/people")}
        statCard={
          <>
            <div className="absolute left-[207px] top-[421px] h-[64px] w-[484px] rounded-[12px] bg-[#FCFCFC]" />
            {/* Leads sub-box */}
            <div className="absolute left-[224px] top-[425px] h-[55px] w-[52px] rounded-[8px] bg-[#FDFFFB]" />
            <span className="absolute left-[237px] top-[431px] flex h-[25px] w-[25px] items-center justify-center rounded-full bg-[#DAFDB0]">
              <Package className="h-[14px] w-[14px] text-[#3a7d2c]" strokeWidth={1.7} />
            </span>
            <span className="absolute left-[231px] top-[457px] text-[14px] font-medium text-[#242220]">Leads</span>
            <StatNum left={292} n="10" label="All" />
            <StatNum left={349} n="4" label="Unattended" />
            <StatNum left={422} n="4" label="Contacted" />
            <StatNum left={500} n="2" label="Converted" />
            <GreenTarget left={572} />
          </>
        }
      />

      {/* right column — Operation */}
      <TeamCard
        baseX={724}
        avatarBg="#ECC5F5"
        name="Operation"
        memberCount={opsUsers.length}
        variant="campaigns"
        people={opsPeople}
        onOpen={() => navigate("/people")}
        onPersonOpen={() => navigate("/people")}
        statCard={
          <>
            <div className="absolute left-[743px] top-[421px] h-[64px] w-[484px] rounded-[12px] bg-[#FCFCFC]" />
            <span className="absolute left-[783px] top-[430px] flex h-[25px] w-[25px] items-center justify-center rounded-full bg-[#DAFDB0]">
              <Package className="h-[14px] w-[14px] text-[#3a7d2c]" strokeWidth={1.7} />
            </span>
            <span className="absolute left-[760px] top-[456px] text-[14px] font-medium text-[#242220]">Campaigns</span>
            <StatNum left={860} n="10" label="All" />
            <StatNum left={914} n="4" label="20%" />
            <StatNum left={979} n="4" label="50%" />
            <StatNum left={1044} n="4" label="100%" />
            <GreenTarget left={1108} />
          </>
        }
      />

      {/* ==================== Scrim B ==================== */}
      <div className="absolute inset-0" style={SCRIM} />

      {/* ==================== CHANGE TEAM TARGETS MODAL ==================== */}
      <div className="absolute left-[328px] top-[177px] h-[670px] w-[784px] rounded-[24px] bg-white">
        {/* header */}
        <span className="absolute left-[20px] top-[40px] text-[24px] font-medium text-black">
          Change Team Targets
        </span>
        <div
          onClick={() => navigate(-1)}
          className="absolute left-[482px] top-[28px] flex h-[48px] w-[188px] cursor-pointer items-center justify-center rounded-[24px] bg-black/95"
        >
          <span className="text-[20px] font-medium text-white">Save Targets</span>
        </div>
        <span
          onClick={() => navigate(-1)}
          className="absolute left-[685px] top-[28px] flex h-[48px] w-[48px] cursor-pointer items-center justify-center rounded-full border border-black/10 bg-white"
        >
          <X className="h-[20px] w-[20px] text-black" strokeWidth={1.8} />
        </span>

        {/* CURRENT TARGETS box */}
        <div className="absolute left-[51px] top-[98px] h-[134px] w-[682px] rounded-[12px] bg-[#F1F1F1]" />
        <span className="absolute left-[65px] top-[113px] text-[16px] font-medium tracking-wide text-black/70">
          CURRENT TARGETS
        </span>
        <span className="absolute left-[80px] top-[150px] text-[20px] font-medium text-[#8D8D8D]">Monthly Target</span>
        <span className="absolute left-[80px] top-[182px] text-[32px] font-medium text-black">₹5L</span>
        <span className="absolute left-[300px] top-[150px] h-[63px] w-px bg-black/10" />
        <span className="absolute left-[329px] top-[150px] text-[20px] font-medium text-[#8D8D8D]">Yearly Target</span>
        <span className="absolute left-[329px] top-[182px] text-[32px] font-medium text-black">₹50L</span>

        {/* Monthly / Yearly inputs */}
        <span className="absolute left-[51px] top-[259px] text-[24px] text-black">Monthly Target</span>
        <div className="absolute left-[51px] top-[292px] flex h-[46px] w-[332px] items-center rounded-[12px] border border-black/[0.06] bg-[#FAFAFA] px-[13px]">
          <span className="text-[16px] font-light text-black/70">₹ Enter amount</span>
        </div>
        <span className="absolute left-[398px] top-[259px] text-[24px] text-black">Yearly Target</span>
        <div className="absolute left-[398px] top-[292px] flex h-[46px] w-[335px] items-center rounded-[12px] border border-black/[0.06] bg-[#FAFAFA] px-[13px]">
          <span className="text-[16px] font-light text-black/70">₹ Enter amount</span>
        </div>

        {/* Effective Form */}
        <span className="absolute left-[51px] top-[359px] text-[20px] font-medium text-black">Effective Form</span>
        <span className="absolute left-[51px] top-[388px] text-[14px] text-black/70">
          Past Performance will not be recalculated
        </span>

        {/* option 1 */}
        <div
          onClick={() => setEffective("next")}
          className="absolute left-[51px] top-[429px] h-[98px] w-[682px] cursor-pointer rounded-[24px] border border-black/10"
        />
        <Radio top={466} selected={effective === "next"} onSelect={() => setEffective("next")} />
        <span className="absolute left-[105px] top-[453px] text-[20px] font-medium text-black">Next Month</span>
        <span className="absolute left-[105px] top-[479px] text-[14px] text-black/70">
          Starting from the next month on this day
        </span>

        {/* option 2 */}
        <div
          onClick={() => setEffective("this")}
          className="absolute left-[51px] top-[544px] h-[98px] w-[682px] cursor-pointer rounded-[24px] border border-black/10"
        />
        <Radio top={581} selected={effective === "this"} onSelect={() => setEffective("this")} />
        <span className="absolute left-[105px] top-[568px] text-[20px] font-medium text-black">This Month</span>
        <span className="absolute left-[105px] top-[594px] text-[14px] text-black/70">
          Effective immediately for the current period
        </span>
      </div>
    </div>
  );
}
