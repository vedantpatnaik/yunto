import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  useUsers,
  useLeads,
  useCampaigns,
  useLeaves,
  useAgencies,
  useMe,
  type User as TeamUser,
} from "@/api/hooks";
import {
  Sparkles,
  AlignJustify,
  GitBranch,
  Plus,
  UserPlus,
  Smile,
  Meh,
  Users,
  ArrowUpRight,
  Mail,
  MailCheck,
  MailWarning,
  Package,
  PieChart,
  ChevronDown,
  Settings,
  Copy,
  Pencil,
  User,
  ClipboardList,
  Cake,
  Phone,
  Globe,
} from "lucide-react";

/**
 * Super Admin — Settings / Team Management.
 * Exact reconstruction of Figma frame 4992:21452 ("Super Admin-SETTINGS"), 1440×1024.
 * The captured frame had the TopBar profile dropdown + dim scrim open (node 4992:21406);
 * that popup/scrim is intentionally omitted — this is the CLEAN page at full opacity.
 */

/* ------------------------------ helpers -------------------------------- */
/** First initial of a user's name (empty while data is loading). */
const initial = (u?: TeamUser) => (u?.name ?? "").trim().charAt(0).toUpperCase();

/** SUPER_ADMIN -> "Super Admin". */
const titleCase = (s: string) =>
  s
    .toLowerCase()
    .split("_")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

/** /auth/me returns the whole sanitized User row, which carries agencyCode. */
type MeUser = TeamUser & { agencyCode?: string | null };

/* ------------------------------ primitives ----------------------------- */
function TabPill({
  icon: Icon,
  label,
  active,
  left,
  width,
  onClick,
}: {
  icon: LucideIcon;
  label: string;
  active?: boolean;
  left: number;
  width: number;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={`absolute top-[233px] flex h-[45px] cursor-pointer items-center gap-[8px] rounded-[24px] px-[12px] ${
        active ? "bg-black" : "bg-white"
      }`}
      style={{ left, width }}
    >
      <Icon
        className={`h-[20px] w-[20px] ${active ? "text-white" : "text-black"}`}
        strokeWidth={1.6}
      />
      <span className={`text-[14px] font-light ${active ? "text-white" : "text-black"}`}>
        {label}
      </span>
    </div>
  );
}

function SmilePill({
  left,
  top,
  width,
  active,
  label,
}: {
  left: number;
  top: number;
  width: number;
  active: boolean;
  label: string;
}) {
  const Icon = active ? Smile : Meh;
  return (
    <span
      className="absolute flex h-[30px] items-center gap-[3px] rounded-[36px] bg-white px-[9px]"
      style={{ left, top, width }}
    >
      <Icon className="h-[18px] w-[18px]" style={{ color: active ? "#4CCC16" : "#6D6D6D" }} strokeWidth={1.7} />
      <span className="text-[12px] font-normal" style={{ color: active ? "#121212" : "#222222" }}>
        {label}
      </span>
    </span>
  );
}

function DotPill({
  left,
  active,
  label,
  width,
}: {
  left: number;
  active: boolean;
  label: string;
  width: number;
}) {
  return (
    <span
      className="absolute top-[9px] flex h-[20px] items-center gap-[2px] rounded-[24px] bg-white px-[6px]"
      style={{ left, width }}
    >
      <span className="flex h-[12px] w-[12px] shrink-0 items-center justify-center">
        <span className="h-[7.5px] w-[7.5px] rounded-full" style={{ background: active ? "#4CCC16" : "#737572" }} />
      </span>
      <span className="whitespace-nowrap text-[10px] font-light text-[#222222]">{label}</span>
    </span>
  );
}

function GlanceCard({
  left,
  iconBg,
  membersIconColor,
  title,
  members,
  active,
  absent,
  onClick,
}: {
  left: number;
  iconBg: string;
  membersIconColor: string;
  title: string;
  members: string;
  active: string;
  absent: string;
  onClick?: () => void;
}) {
  return (
    <div onClick={onClick} className="absolute h-[66px] w-[326px] cursor-pointer rounded-[12px] bg-[#F5F5F5]" style={{ left, top: 452 }}>
      <span
        className="absolute left-[5px] top-[5px] flex h-[34px] w-[34px] items-center justify-center rounded-full"
        style={{ background: iconBg }}
      >
        <Users className="h-[20px] w-[20px] text-black" strokeWidth={1.5} />
      </span>
      <span className="absolute left-[44px] top-[6px] text-[20px] leading-[24px] text-black/90">{title}</span>
      <div className="absolute left-[44px] top-[30px] flex items-center gap-[4px]">
        <Users className="h-[10px] w-[10px]" style={{ color: membersIconColor }} strokeWidth={2.5} />
        <span className="text-[10px] font-light text-black/70">{members}</span>
      </div>
      <DotPill left={159} active label={active} width={68} />
      <DotPill left={221} active={false} label={absent} width={66} />
      <span className="absolute left-[301px] top-0 flex h-[23px] w-[23px] items-center justify-center rounded-[11.5px] bg-white">
        <ArrowUpRight className="h-[13px] w-[13px] text-black" strokeWidth={1.8} />
      </span>
    </div>
  );
}

function Avatar({ left, bg, fg, label }: { left: number; bg: string; fg: string; label: string }) {
  return (
    <span
      className="absolute top-[12px] flex h-[30px] w-[30px] items-center justify-center rounded-full border-[1.5px] border-white text-[10.7px] font-medium"
      style={{ left, background: bg, color: fg }}
    >
      {label}
    </span>
  );
}

function AssignButton({ left, count, onClick }: { left: number; count: number; onClick?: () => void }) {
  return (
    <div
      onClick={onClick}
      className="absolute top-[8px] flex h-[35px] w-[88px] cursor-pointer items-center gap-[8px] rounded-[24px] bg-white px-[12px] shadow-[0_1px_3px_rgba(0,0,0,0.08)]"
      style={{ left }}
    >
      <span className="flex h-[20px] w-[20px] items-center justify-center rounded-full bg-[#FF2B2B] text-[10.3px] font-normal text-white">
        {count}
      </span>
      <span className="text-[14px] font-light text-black">Assign</span>
    </div>
  );
}

function CountChip({
  left,
  width,
  label,
  count,
  onClick,
}: {
  left: number;
  width: number;
  label: string;
  count: string;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className="absolute top-[6px] flex h-[37px] cursor-pointer items-center rounded-[8px] bg-[#FDFFFB] pl-[5px]"
      style={{ left, width }}
    >
      <span className="flex h-[25px] w-[25px] items-center justify-center rounded-full bg-[#DAFDB0]">
        <Package className="h-[15px] w-[15px] text-[#3C7A1C]" strokeWidth={1.6} />
      </span>
      <span className="ml-[6px] text-[14px] text-[#242220]">{label}</span>
      <span className="ml-[10px] text-[16px] text-black underline underline-offset-2">{count}</span>
    </div>
  );
}

function StatItem({
  left,
  icon: Icon,
  iconColor,
  text,
}: {
  left: number;
  icon: LucideIcon;
  iconColor: string;
  text: string;
}) {
  return (
    <div className="absolute top-[14px] flex items-center gap-[4px]" style={{ left }}>
      <Icon className="h-[22px] w-[22px]" style={{ color: iconColor }} strokeWidth={1.6} />
      <span className="text-[15px] font-light text-black/80">{text}</span>
    </div>
  );
}

function ManageCard({
  top,
  iconBg,
  membersIconColor,
  title,
  members,
  active,
  absent,
  leadsBar,
  onArrowClick,
}: {
  top: number;
  iconBg: string;
  membersIconColor: string;
  title: string;
  members: TeamUser[];
  active: string;
  absent: string;
  leadsBar: ReactNode;
  onArrowClick?: () => void;
}) {
  return (
    <div className="absolute h-[207px] w-[628px] rounded-[12px] border border-black/[0.04] bg-[#F5F5F5]" style={{ left: 296, top }}>
      <span
        className="absolute left-[10px] top-[10px] flex h-[36px] w-[36px] items-center justify-center rounded-full"
        style={{ background: iconBg }}
      >
        <Users className="h-[21px] w-[21px] text-black" strokeWidth={1.5} />
      </span>
      <span className="absolute left-[54px] top-[10px] text-[20px] leading-[24px] text-black/90">{title}</span>
      <div className="absolute left-[54px] top-[36px] flex items-center gap-[4px]">
        <Users className="h-[10px] w-[10px]" style={{ color: membersIconColor }} strokeWidth={2.5} />
        <span className="text-[10px] font-light text-black/70">{members.length} Members</span>
      </div>
      <SmilePill left={387} top={10} width={91.5} active label={active} />
      <SmilePill left={487.5} top={10} width={93} active={false} label={absent} />
      <span
        onClick={onArrowClick}
        className="absolute left-[596px] top-[1px] flex h-[30px] w-[30px] cursor-pointer items-center justify-center rounded-[15px] bg-white"
      >
        <ArrowUpRight className="h-[15px] w-[15px] text-black" strokeWidth={1.7} />
      </span>

      {/* leads / campaign bar */}
      <div className="absolute left-[18px] top-[71px] h-[52px] w-[590px] rounded-[12px] border border-black/[0.05] bg-white">
        {leadsBar}
      </div>

      {/* members bar */}
      <div className="absolute left-[18px] top-[135px] h-[52px] w-[541px] rounded-[12px] border border-black/[0.05] bg-white">
        <span className="absolute left-[10px] top-[11px] text-[20px] leading-[25px] text-black">Members</span>
        <Avatar left={118} bg="#F4C1C1" fg="#B93636" label={initial(members[0])} />
        <Avatar left={138.7} bg="#C2E9CF" fg="#2A9A4F" label={initial(members[1])} />
        <Avatar left={160.1} bg="#A1BAE6" fg="#2158BA" label={initial(members[2])} />
        <Avatar left={175.1} bg="#EFF5FF" fg="#000000" label={`+${Math.max(members.length - 3, 0)}`} />
        <div className="absolute left-[415px] top-[8px] flex h-[27px] w-[71px] items-center rounded-[14px] border border-black/5 bg-white">
          <Settings className="ml-[6px] h-[16px] w-[16px] text-black" strokeWidth={1.6} />
          <div className="relative ml-[8px] h-[18px] w-[36px] rounded-full bg-[#E6E6E6]">
            <span className="absolute left-[1.5px] top-[1.3px] h-[15px] w-[16px] rounded-full bg-white shadow-[0_1px_2px_rgba(0,0,0,0.15)]" />
          </div>
        </div>
        <ChevronDown className="absolute left-[505px] top-[18px] h-[16px] w-[16px] text-black" strokeWidth={1.8} />
      </div>
    </div>
  );
}

function InfoRow({
  top,
  icon: Icon,
  label,
  value,
}: {
  top: number;
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <>
      <div className="absolute left-[1062px] flex items-start gap-[10px]" style={{ top }}>
        <span className="flex h-[24px] w-[24px] items-center justify-center">
          <Icon className="h-[18px] w-[18px] text-black" strokeWidth={1.4} />
        </span>
        <div className="flex flex-col">
          <span className="text-[12px] font-light leading-[16px] text-black/70">{label}</span>
          <span className="mt-[2px] text-[14px] font-medium leading-[16px] text-black">{value}</span>
        </div>
      </div>
      <span
        className="absolute left-[1371px] flex h-[34px] w-[34px] items-center justify-center rounded-[17px] bg-white/50"
        style={{ top }}
      >
        <Pencil className="h-[13px] w-[13px] text-black" strokeWidth={1.4} />
      </span>
    </>
  );
}

/* -------------------------------- page --------------------------------- */
export default function SettingsPage() {
  const navigate = useNavigate();
  const { data: users = [] } = useUsers();
  const { data: leads = [] } = useLeads();
  const { data: campaigns = [] } = useCampaigns();
  const { data: leaves = [] } = useLeaves();
  const { data: agencies = [] } = useAgencies();
  const { data: meRaw } = useMe();

  const salesMembers = users.filter((u) => u.team?.name === "Sales");
  const opsMembers = users.filter((u) => u.team?.name === "Operations");
  const bothMembers = [...salesMembers, ...opsMembers];

  /* attendance — a member is "absent" while an approved leave spans today */
  const now = Date.now();
  const onLeave = new Set(
    leaves
      .filter(
        (l) =>
          l.status === "APPROVED" &&
          new Date(l.from).getTime() <= now &&
          new Date(l.to).getTime() >= now
      )
      .map((l) => l.userId)
  );
  const absentIn = (m: TeamUser[]) => m.filter((u) => onLeave.has(u.id)).length;
  const activeIn = (m: TeamUser[]) => m.length - absentIn(m);

  /* pipeline breakdowns */
  const leadsBy = (status: string) => leads.filter((l) => l.status === status).length;
  const campaignsBy = (status: string) => campaigns.filter((c) => c.status === status).length;
  const unassignedLeads = leadsBy("NEW");
  const draftCampaigns = campaignsBy("DRAFT");

  /* signed-in super admin + their agency */
  const me = meRaw as MeUser | undefined;
  const myTeam = users.find((u) => u.id === me?.id)?.team?.name;
  const agency = agencies[0];

  return (
    <>
      {/* SETTINGS title — 260,153 · Outfit 400 40px */}
      <h1 className="absolute left-[260px] top-[153px] text-[40px] font-normal text-ink">SETTINGS</h1>

      {/* ==================== Team Management panel ==================== */}
      {/* panel background */}
      <div className="absolute left-[277px] top-[255px] h-[305px] w-[755px] rounded-[24px] border border-black/[0.05] bg-white/15" />

      {/* tabs */}
      <TabPill icon={Sparkles} label="Team Management" active left={277} width={180} onClick={() => navigate("/settings")} />
      <TabPill icon={AlignJustify} label="Lead Distribution" left={464} width={165} onClick={() => navigate("/settings/lead-distribution")} />
      <TabPill icon={GitBranch} label="Integration" left={637} width={139} onClick={() => navigate("/settings/integration")} />
      <TabPill icon={GitBranch} label="Collabs" left={784} width={114} onClick={() => navigate("/settings/collab")} />

      {/* Teams header row */}
      <span className="absolute left-[294px] top-[302px] text-[20px] leading-[24px] text-black">Teams</span>
      <div
        onClick={() => navigate("/settings/add-members")}
        className="absolute left-[397px] top-[306px] flex h-[30px] w-[132px] cursor-pointer items-center justify-between rounded-[28px] bg-black/90 pl-[16px] pr-[14px]"
      >
        <span className="text-[14px] font-light text-white">Create Team</span>
        <Plus className="h-[16px] w-[16px] text-white" strokeWidth={2} />
      </div>
      <div
        onClick={() => navigate("/settings/add-members")}
        className="absolute left-[539px] top-[306px] flex h-[30px] w-[89px] cursor-pointer items-center justify-center gap-[4px] rounded-[23px] bg-black/90"
      >
        <span className="text-[11.6px] font-light text-white">Member</span>
        <UserPlus className="h-[15px] w-[15px] text-white" strokeWidth={1.4} />
      </div>
      <SmilePill left={664} top={306} width={91.5} active label={`${activeIn(users)} Active`} />
      <SmilePill left={764.5} top={306} width={93} active={false} label={`${absentIn(users)} Absent`} />

      {/* Team Glance */}
      <span className="absolute left-[292px] top-[380px] flex h-[42px] w-[42px] items-center justify-center rounded-full bg-white">
        <Sparkles className="h-[22px] w-[22px] text-black" strokeWidth={1.4} />
      </span>
      <span className="absolute left-[342px] top-[380px] text-[24px] leading-[24px] text-[#111827]">Team Glance</span>
      <div className="absolute left-[342px] top-[404px] flex items-center gap-[5px]">
        <Users className="h-[16px] w-[16px] text-[#747FE2]" strokeWidth={2.2} />
        <span className="text-[12px] text-black/70">{users.length} Members</span>
      </div>

      {/* Team Glance cards */}
      <GlanceCard left={292} iconBg="#FDFFBC" membersIconColor="#D3D918" title="Sales" members={`${salesMembers.length} Members`} active={`${activeIn(salesMembers)} Active`} absent={`${absentIn(salesMembers)} Absent`} onClick={() => navigate("/people")} />
      <GlanceCard left={641} iconBg="#ECC5F5" membersIconColor="#B56CC5" title="Operation" members={`${opsMembers.length} Members`} active={`${activeIn(opsMembers)} Active`} absent={`${absentIn(opsMembers)} Absent`} onClick={() => navigate("/people")} />

      {/* ==================== Manage Teams ==================== */}
      <span className="absolute left-[279px] top-[580px] text-[20px] leading-[24px] text-black">Manage Teams</span>
      {/* panel background */}
      <div className="absolute left-[279px] top-[608px] h-[802px] w-[754px] rounded-[24px] border border-black/[0.05] bg-[rgba(227,228,244,0.7)]" />

      {/* Sales */}
      <ManageCard
        top={709}
        iconBg="#FDFFBC"
        membersIconColor="#D3D918"
        title="Sales"
        members={salesMembers}
        active={`${activeIn(salesMembers)} Active`}
        absent={`${absentIn(salesMembers)} Absent`}
        onArrowClick={() => navigate("/people")}
        leadsBar={
          <>
            <CountChip left={6} width={155} label="Leads" count={`${leads.length}  All`} onClick={() => navigate("/leads")} />
            <StatItem left={208} icon={Mail} iconColor="#6E8FBF" text={`${leadsBy("NEW")} Leads`} />
            <StatItem left={328} icon={MailCheck} iconColor="#5FA06E" text={`${leadsBy("CONVERTED")} Leads`} />
            <AssignButton left={492} count={unassignedLeads} onClick={() => navigate("/campaigns/assign")} />
          </>
        }
      />

      {/* Operations */}
      <ManageCard
        top={932}
        iconBg="#ECC5F5"
        membersIconColor="#B56CC5"
        title="Operations"
        members={opsMembers}
        active={`${activeIn(opsMembers)} Active`}
        absent={`${absentIn(opsMembers)} Absent`}
        onArrowClick={() => navigate("/people")}
        leadsBar={
          <>
            <CountChip left={6} width={162} label="Campaign" count={`${campaigns.length}  All`} onClick={() => navigate("/campaigns")} />
            <StatItem left={188} icon={PieChart} iconColor="#75A7C7" text={`${campaignsBy("ACTIVE")} Camp`} />
            <StatItem left={285} icon={PieChart} iconColor="#79B282" text={`${campaignsBy("DONE")} Camp`} />
            <StatItem left={372} icon={PieChart} iconColor="#EBB363" text={`${draftCampaigns} Camp`} />
            <AssignButton left={492} count={draftCampaigns} onClick={() => navigate("/campaigns/assign")} />
          </>
        }
      />

      {/* Sales + Operations */}
      <ManageCard
        top={1171}
        iconBg="#BCCFFF"
        membersIconColor="#5378D4"
        title="Sales + Operations"
        members={bothMembers}
        active={`${activeIn(bothMembers)} Active`}
        absent={`${absentIn(bothMembers)} Absent`}
        onArrowClick={() => navigate("/people")}
        leadsBar={
          <>
            <CountChip left={6} width={171} label="Campaign" count={`${campaigns.length}  All`} onClick={() => navigate("/campaigns")} />
            <StatItem left={189} icon={MailWarning} iconColor="#C98A8A" text={`${leadsBy("CONTACTED")} Leads`} />
            <StatItem left={290.6} icon={MailCheck} iconColor="#5FA06E" text={`${leadsBy("CONVERTED")} Leads`} />
            <span className="absolute left-[392px] top-[16px] text-[15px] text-black">{leads.length}  All Leads</span>
            <AssignButton left={492} count={unassignedLeads} onClick={() => navigate("/campaigns/assign")} />
          </>
        }
      />

      {/* ==================== Right profile / agency panel ==================== */}
      <div className="absolute left-[1049px] top-[224px] h-[816px] w-[369px] rounded-[24px] border border-black/[0.05] bg-gradient-to-br from-white/[0.46] to-[#74A4F7] shadow-[0_1px_2px_rgba(0,0,0,0.05)]" />

      {/* avatar + edit */}
      <div className="absolute left-[1193px] top-[244px] flex h-[81px] w-[81px] items-center justify-center rounded-full bg-gradient-to-br from-[#F1FFC3] to-[#C8B3ED] text-[26px]">
        👑
      </div>
      <span className="absolute left-[1261px] top-[309px] flex h-[20px] w-[20px] items-center justify-center rounded-[12px] bg-white">
        <Pencil className="h-[9px] w-[9px] text-black" strokeWidth={1.6} />
      </span>

      <span className="absolute left-[1171px] top-[338px] w-[125px] text-center text-[20px] font-semibold leading-[24px] text-[#111827]">
        {me?.name ?? ""}
      </span>
      <span className="absolute left-[1171px] top-[361px] w-[125px] text-center text-[12px] font-normal leading-[16px] text-[#6B7280]">
        {me ? titleCase(me.role) : ""}
      </span>

      {/* agency code pill */}
      <div
        onClick={() => me?.agencyCode && navigator.clipboard?.writeText(me.agencyCode)}
        className="absolute left-[1162px] top-[386px] flex h-[28px] w-[144px] cursor-pointer items-center justify-center gap-[4px] rounded-[24px] bg-white/50"
      >
        <span className="text-[10px] font-normal text-black/80">
          Agency Code&nbsp;&nbsp;{me?.agencyCode ?? "—"}
        </span>
        <Copy className="h-[12px] w-[12px] text-black" strokeWidth={1.4} />
      </div>

      {/* Detailed Information */}
      <span className="absolute left-[1062px] top-[433px] text-[14px] font-medium leading-[24px] text-black">
        Detailed Information
      </span>
      <InfoRow top={469} icon={User} label="Full Name" value={me?.name ?? "—"} />
      <InfoRow top={515} icon={Mail} label="Email Address" value={me?.email ?? "—"} />
      <InfoRow
        top={561}
        icon={ClipboardList}
        label="Assign as"
        value={myTeam ?? (me ? titleCase(me.role) : "—")}
      />
      {/* Birth Date has no column on the Prisma User model and cannot be derived — falls back to the em-dash. */}
      <InfoRow top={607} icon={Cake} label="Birth Date" value="—" />

      {/* Agency Information */}
      <span className="absolute left-[1062px] top-[677px] text-[14px] font-medium leading-[24px] text-black">
        Agency Information
      </span>
      <div className="absolute left-[1193px] top-[713px] h-[81px] w-[81px] rounded-full bg-[#ECEAEA]" />
      <span className="absolute left-[1255px] top-[775px] flex h-[20px] w-[20px] items-center justify-center rounded-[12px] bg-white">
        <Pencil className="h-[9px] w-[9px] text-black" strokeWidth={1.6} />
      </span>
      <InfoRow top={810} icon={User} label="Agency Name" value={agency?.name ?? "—"} />
      <InfoRow top={856} icon={Mail} label="Email Address" value={me?.email ?? "—"} />
      <InfoRow top={902} icon={Phone} label="Contact Number" value={me?.phone ?? "—"} />
      {/* Agency has no website column on the Prisma model and cannot be derived — falls back to the em-dash. */}
      <InfoRow top={948} icon={Globe} label="Agency Website" value="—" />
    </>
  );
}
