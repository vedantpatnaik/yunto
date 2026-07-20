import type { ReactNode } from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  useCreate,
  useUsers,
  useList,
  useCampaigns,
  useMe,
  useAgencies,
  useLeaves,
  type Lead,
  type User as TeamUser,
} from "@/api/hooks";
import type { LucideIcon } from "lucide-react";
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
  ChevronDown,
  User,
  ClipboardList,
  Cake,
  Phone,
  Globe,
  Pencil,
  Copy,
  X,
} from "lucide-react";

/**
 * Super Admin — Settings / Add Members.
 * Exact reconstruction of Figma frame 4870:65804 ("Super Admin-Settings - add members"),
 * 1440×1024. The frame captures the "Add Member" modal open over the Team Management
 * settings page. Built CLEAN: the underlying page renders at FULL opacity (the 50% dim
 * scrim node is intentionally omitted); the Add Member modal — the purpose of this screen —
 * is reproduced exactly on top. TopBar + Sidebar come from AppShell and are not rendered.
 */

/* ------------------------------ primitives ----------------------------- */
function Tab({
  icon: Icon,
  label,
  left,
  width,
  active,
  onClick,
}: {
  icon: LucideIcon;
  label: string;
  left: number;
  width: number;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <div
      className={`absolute top-[233px] flex h-[45px] cursor-pointer items-center gap-[8px] rounded-[24px] px-[12px] ${
        active ? "bg-black" : "border-[0.5px] border-[#CCCCCC] bg-white"
      }`}
      style={{ left, width }}
      onClick={onClick}
    >
      <Icon
        className={`h-[20px] w-[20px] shrink-0 ${active ? "text-white" : "text-black"}`}
        strokeWidth={1.6}
      />
      <span
        className={`whitespace-nowrap text-[14px] font-light leading-[24px] ${
          active ? "text-white" : "text-black"
        }`}
      >
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
  border,
}: {
  left: number;
  top: number;
  width: number;
  active: boolean;
  label: string;
  border: string;
}) {
  const Icon = active ? Smile : Meh;
  return (
    <span
      className="absolute flex h-[30px] items-center gap-[4px] rounded-[36px] bg-white px-[9px]"
      style={{ left, top, width, borderWidth: 1.5, borderColor: border }}
    >
      <Icon
        className="h-[18px] w-[18px] shrink-0"
        style={{ color: active ? "#4CCC16" : "#6D6D6D" }}
        strokeWidth={1.7}
      />
      <span
        className="whitespace-nowrap text-[12px] font-normal"
        style={{ color: active ? "#121212" : "#222222" }}
      >
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
      className="absolute top-[9px] flex h-[20px] items-center gap-[3px] rounded-[24px] border border-black bg-white px-[6px]"
      style={{ left, width }}
    >
      <span
        className="h-[7.7px] w-[7.7px] shrink-0 rounded-full"
        style={{ background: active ? "#4CCC16" : "#737572" }}
      />
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
  activeLeft,
  absentLeft,
  arrowLeft,
  onClick,
}: {
  left: number;
  iconBg: string;
  membersIconColor: string;
  title: string;
  members: string;
  active: number;
  absent: number;
  activeLeft: number;
  absentLeft: number;
  arrowLeft: number;
  onClick?: () => void;
}) {
  return (
    <div
      className="absolute top-[452px] h-[66px] w-[326px] cursor-pointer rounded-[12px] bg-[#F5F5F5]"
      style={{ left }}
      onClick={onClick}
    >
      <span
        className="absolute left-[5px] top-[5px] flex h-[34px] w-[34px] items-center justify-center rounded-full border border-[#373636]"
        style={{ background: iconBg }}
      >
        <Users className="h-[16px] w-[16px] text-black" strokeWidth={1.6} />
      </span>
      <span className="absolute left-[44px] top-[7px] text-[20px] leading-[24px] text-black/90">{title}</span>
      <div className="absolute left-[44px] top-[30px] flex items-center gap-[4px]">
        <Users className="h-[10px] w-[10px]" style={{ color: membersIconColor }} strokeWidth={2.5} />
        <span className="text-[10px] font-light text-black/70">{members}</span>
      </div>
      <DotPill left={activeLeft} active label={`${active} Active`} width={68} />
      <DotPill left={absentLeft} active={false} label={`${absent} Absent`} width={66} />
      <span
        className="absolute top-[0px] flex h-[23px] w-[23px] items-center justify-center rounded-[11.5px] bg-white"
        style={{ left: arrowLeft }}
      >
        <ArrowUpRight className="h-[13px] w-[13px] text-black" strokeWidth={1.6} />
      </span>
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

function LeadChip({
  left,
  icon: Icon,
  label,
  dark,
  border,
  text,
}: {
  left: number;
  icon: LucideIcon;
  label: string;
  dark?: boolean;
  border: string;
  text: string;
}) {
  return (
    <span
      className="absolute top-[0px] flex h-[23px] w-[70px] items-center justify-center gap-[3px] rounded-[24px]"
      style={{ left, background: dark ? "#000000" : "#FFFFFF", borderWidth: 1, borderColor: border }}
    >
      <Icon className="h-[13px] w-[13px]" style={{ color: dark ? "#ECECEC" : border }} strokeWidth={1.5} />
      <span className="font-inter text-[8px] font-medium" style={{ color: text }}>
        {label}
      </span>
    </span>
  );
}

function MemberRow({
  top,
  name,
  initial,
  avatarBg,
  avatarText,
  campaign,
  newLeads,
  contactedLeads,
  convertedLeads,
  status,
  responseTime,
  pager,
  onClick,
}: {
  top: number;
  name: string;
  initial: string;
  avatarBg: string;
  avatarText: string;
  campaign: string;
  newLeads: number;
  contactedLeads: number;
  convertedLeads: number;
  status: string;
  responseTime: string;
  pager: string;
  onClick?: () => void;
}) {
  return (
    <div
      className="absolute left-[348px] h-[71px] w-[511px] cursor-pointer rounded-[8px] border border-[#E5E7EB] bg-white"
      style={{ top }}
      onClick={onClick}
    >
      {/* avatar */}
      <span
        className="absolute left-[7px] top-[5px] flex h-[21px] w-[21px] items-center justify-center rounded-full border-2"
        style={{ background: avatarBg, borderColor: "#4CCC16" }}
      >
        <span className="text-[9px] font-medium" style={{ color: avatarText }}>
          {initial}
        </span>
      </span>
      {/* name + active badge */}
      <span className="absolute left-[35px] top-[5px] text-[10px] font-medium leading-[15.7px] text-black/90">
        {name}
      </span>
      <span className="absolute left-[117px] top-[5px] flex h-[15px] w-[35px] items-center justify-center rounded-[24px] border border-black bg-white">
        <span className="font-inter text-[8px] font-medium text-[#4CCC16]">{status}</span>
      </span>
      {/* response time */}
      <span className="absolute left-[35px] top-[18px] font-inter text-[7px] font-normal leading-[15.7px] text-black/70">
        {responseTime ? `Response Time: ${responseTime}` : ""}
      </span>
      {/* lead chips */}
      <div className="absolute left-[7px] top-[37px] h-[23px] w-[218px]">
        <LeadChip left={0} icon={Mail} label={`${newLeads} Leads`} dark border="#2F2E2E" text="#FAFAFA" />
        <LeadChip left={74} icon={MailWarning} label={`${contactedLeads} Leads`} border="#F59E0B" text="#222222" />
        <LeadChip left={148} icon={MailCheck} label={`${convertedLeads} Leads`} border="#10B981" text="#222222" />
      </div>
      {/* campaign card */}
      <div className="absolute left-[313px] top-[11px] h-[49px] w-[137px] rounded-[12px] border border-[#D6D6D6] bg-white">
        <div className="absolute left-[6px] top-[6px] flex items-center gap-[4px]">
          <Mail className="h-[15px] w-[15px] text-[#5C9AFF]" strokeWidth={1.4} />
          <span className="text-[12px] font-light text-black/80">{campaign}</span>
        </div>
        <div className="absolute left-[29px] top-[27px] flex h-[16.4px] items-center gap-[2px] rounded-[9px] border border-[#D9D9D9] bg-white px-[5px]">
          {["#FD9591", "#F9A56F", "#FCDD66", "#B0FE69", "#A09C9C"].map((c) => (
            <span key={c} className="h-[10px] w-[7px] rounded-[4px]" style={{ background: c }} />
          ))}
        </div>
      </div>
      {/* pager */}
      <div className="absolute left-[456px] top-[46px] flex items-center gap-[3px]">
        <span className="text-[10px] font-light text-black">{pager}</span>
        <ArrowUpRight className="h-[10px] w-[10px] text-black" strokeWidth={1.8} />
      </div>
    </div>
  );
}

function ModalField({ label, top, children }: { label: string; top: number; children: ReactNode }) {
  return (
    <>
      <span
        className="absolute left-[442px] text-[18px] font-light leading-none text-black/70"
        style={{ top }}
      >
        {label}
      </span>
      <div
        className="absolute left-[442px] flex h-[47px] w-[540px] items-center rounded-full border border-[#D6D6D6] bg-[#FEFCFF] px-[16px]"
        style={{ top: top + 37 }}
      >
        {children}
      </div>
    </>
  );
}

/* -------------------------------- page --------------------------------- */
export default function SettingsAddMembersPage() {
  const navigate = useNavigate();
  const create = useCreate("users");
  const [membersActive, setMembersActive] = useState(true);

  // ---- live data ----
  const { data: users = [] } = useUsers();
  const { data: leads = [] } = useList<
    Lead & { ownerId?: string; createdAt?: string; updatedAt?: string }
  >("leads");
  const { data: campaigns = [] } = useCampaigns();
  const { data: agencies = [] } = useAgencies();
  const { data: leaves = [] } = useLeaves();
  const { data: me } = useMe();

  const salesMembers = users.filter((u) => u.team?.name === "Sales");
  const opsMembers = users.filter((u) => u.team?.name === "Operations");
  const agency = agencies[0];
  const meWithCode = me as (TeamUser & { agencyCode?: string | null }) | undefined;

  const roleLabel = (role?: string) =>
    role ? role.split("_").map((w) => w.charAt(0) + w.slice(1).toLowerCase()).join(" ") : "";

  const leadsByStatus = (ownerId: string, status: string) =>
    leads.filter((l) => l.ownerId === ownerId && l.status === status).length;

  /**
   * Presence. There is no /attendance endpoint (the Attendance model exists in Prisma but is
   * not exposed in server/src/routes/index.ts), so "absent" is derived from the approved
   * leave records that span today — the only honest presence signal the API serves.
   */
  const today = Date.now();
  const onLeave = new Set(
    leaves
      .filter(
        (lv) =>
          lv.status === "APPROVED" && Date.parse(lv.from) <= today && Date.parse(lv.to) >= today,
      )
      .map((lv) => lv.userId),
  );
  const absentIn = (list: TeamUser[]) => list.filter((u) => onLeave.has(u.id)).length;

  /** Mean time from lead creation to its first status change, for one owner. */
  const responseTimeOf = (ownerId: string) => {
    const worked = leads.filter(
      (l) => l.ownerId === ownerId && l.status !== "NEW" && l.createdAt && l.updatedAt,
    );
    if (worked.length === 0) return "";
    const avgMin =
      worked.reduce((s, l) => s + (Date.parse(l.updatedAt!) - Date.parse(l.createdAt!)), 0) /
      worked.length /
      60_000;
    if (avgMin < 60) return `${Math.max(1, Math.round(avgMin))} Min.`;
    if (avgMin < 1440) return `${Math.round(avgMin / 60)} Hr.`;
    return `${Math.round(avgMin / 1440)} Days`;
  };

  /** initials for the avatar stack / member rows */
  const initialOf = (n?: string) => (n ? n.trim().charAt(0).toUpperCase() : "");

  // Add Member form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("SALES_EMPLOYEE");

  async function handleSendInvite() {
    try {
      await create.mutateAsync({
        name,
        email,
        phone,
        role: role ?? "SALES_EMPLOYEE",
      });
      navigate("/settings");
    } catch {
      /* swallow so the button never hangs */
    }
  }

  return (
    <>
      {/* ===================== BACKDROP: Settings page (full opacity) ===================== */}
      {/* SETTINGS title — 260,153 · Outfit 400 40px */}
      <h1 className="absolute left-[260px] top-[153px] text-[40px] font-normal leading-[50.4px] text-ink">
        SETTINGS
      </h1>

      {/* Team Management panel background */}
      <div className="absolute left-[277px] top-[284px] h-[276px] w-[755px] rounded-[24px] border border-[#D4D4D4] bg-white/15" />

      {/* tabs */}
      <Tab
        icon={Sparkles}
        label="Team Management"
        active
        left={277}
        width={180}
        onClick={() => navigate("/settings")}
      />
      <Tab
        icon={AlignJustify}
        label="Lead Distribution"
        left={464}
        width={165}
        onClick={() => navigate("/settings/lead-distribution")}
      />
      <Tab
        icon={GitBranch}
        label="Integration"
        left={637}
        width={139}
        onClick={() => navigate("/settings/integration")}
      />
      <Tab
        icon={GitBranch}
        label="Collabs"
        left={784}
        width={114}
        onClick={() => navigate("/settings/collab")}
      />

      {/* Teams header row */}
      <span className="absolute left-[294px] top-[309px] text-[20px] leading-[24px] text-black">Teams</span>
      <div
        className="absolute left-[397px] top-[306px] flex h-[30px] w-[132px] cursor-pointer items-center justify-between rounded-[28px] border-2 border-black bg-black/90 pl-[12px] pr-[10px]"
        onClick={() => navigate("/people")}
      >
        <span className="text-[14px] font-light text-white">Create Team</span>
        <Plus className="h-[16px] w-[16px] text-white" strokeWidth={2} />
      </div>
      <div
        className="absolute left-[539px] top-[306px] flex h-[30px] w-[89px] cursor-pointer items-center justify-center gap-[4px] rounded-[23px] border-[1.6px] border-black bg-black/90"
        onClick={() => navigate("/settings/add-members")}
      >
        <span className="text-[11.6px] font-light text-white">Member</span>
        <UserPlus className="h-[15px] w-[15px] text-white" strokeWidth={1.4} />
      </div>
      <SmilePill
        left={664}
        top={306}
        width={91.5}
        active
        label={`${users.length - absentIn(users)} Active`}
        border="#3A3A3A"
      />
      <SmilePill
        left={764.5}
        top={306}
        width={93}
        active={false}
        label={`${absentIn(users)} Absent`}
        border="#3A3A3A"
      />

      {/* Team Glance */}
      <span className="absolute left-[292px] top-[380px] flex h-[42px] w-[42px] items-center justify-center rounded-full border border-[#E8E8E8] bg-white">
        <Sparkles className="h-[22px] w-[22px] text-black" strokeWidth={1.6} />
      </span>
      <span className="absolute left-[342px] top-[380px] text-[24px] leading-[24px] text-[#111827]">Team Glance</span>
      <div className="absolute left-[342px] top-[405px] flex items-center gap-[5px]">
        <Users className="h-[16px] w-[16px] text-[#747FE2]" strokeWidth={2.2} />
        <span className="text-[12px] text-black/70">{users.length} Members</span>
      </div>

      {/* Team Glance cards */}
      <GlanceCard
        left={292}
        iconBg="#FDFFBC"
        membersIconColor="#D3D918"
        title="Sales"
        members={`${salesMembers.length} Members`}
        active={salesMembers.length - absentIn(salesMembers)}
        absent={absentIn(salesMembers)}
        activeLeft={159}
        absentLeft={221}
        arrowLeft={301}
        onClick={() => navigate("/people")}
      />
      <GlanceCard
        left={641}
        iconBg="#ECC5F5"
        membersIconColor="#B56CC5"
        title="Operation"
        members={`${opsMembers.length} Members`}
        active={opsMembers.length - absentIn(opsMembers)}
        absent={absentIn(opsMembers)}
        activeLeft={159}
        absentLeft={221}
        arrowLeft={301}
        onClick={() => navigate("/people")}
      />

      {/* ===================== Manage Teams ===================== */}
      <span className="absolute left-[279px] top-[580px] text-[20px] leading-[24px] text-black">Manage Teams</span>
      <div className="absolute left-[279px] top-[632px] h-[570px] w-[754px] rounded-[24px] border border-[#D4D4D4] bg-[#E3E4F4]/80" />

      {/* Sales manage card */}
      <div className="absolute left-[296px] top-[709px] h-[483px] w-[628px] rounded-[12px] bg-[#F5F5F5]">
        {/* header */}
        <span className="absolute left-[10px] top-[10px] flex h-[36px] w-[36px] items-center justify-center rounded-full border border-[#373636] bg-[#FDFFBC]">
          <Users className="h-[18px] w-[18px] text-black" strokeWidth={1.6} />
        </span>
        <span className="absolute left-[54px] top-[10px] text-[20px] leading-[24px] text-black/90">Sales</span>
        <div className="absolute left-[54px] top-[36px] flex items-center gap-[4px]">
          <Users className="h-[10px] w-[10px] text-[#D3D918]" strokeWidth={2.5} />
          <span className="text-[10px] font-light text-black/70">{salesMembers.length} Members</span>
        </div>
        <span
          className="absolute left-[596px] top-[1px] flex h-[30px] w-[30px] cursor-pointer items-center justify-center rounded-[15px] bg-white"
          onClick={() => navigate("/people")}
        >
          <ArrowUpRight className="h-[15px] w-[15px] text-black" strokeWidth={1.6} />
        </span>

        {/* leads bar */}
        <div className="absolute left-[18px] top-[71px] h-[52px] w-[590px] rounded-[12px] border-[0.6px] border-[#D2D2D2] bg-white">
          <div className="absolute left-[6px] top-[6px] flex h-[37px] w-[155px] items-center rounded-[8px] border border-black bg-[#FDFFFB] pl-[5px]">
            <span className="flex h-[25px] w-[25px] items-center justify-center rounded-full bg-[#DAFDB0]">
              <Package className="h-[15px] w-[15px] text-black" strokeWidth={1.4} />
            </span>
            <span className="ml-[6px] text-[14px] text-[#242220]">Leads</span>
            <span className="ml-[9px] text-[16px] text-black">{leads.length}&nbsp;&nbsp;All</span>
          </div>
          <div className="absolute left-[208px] top-[13px] flex items-center gap-[6px]">
            <Mail className="h-[22px] w-[22px] text-[#5C9AFF]" strokeWidth={1.5} />
            <span className="text-[15px] font-light text-black/80">
              {leads.filter((l) => l.status === "NEW").length} Leads
            </span>
          </div>
          <div className="absolute left-[328px] top-[13px] flex items-center gap-[5px]">
            <MailCheck className="h-[22px] w-[22px] text-[#52B594]" strokeWidth={1.5} />
            <span className="text-[15px] font-light text-black/80">
              {leads.filter((l) => l.status === "CONVERTED").length} Leads
            </span>
          </div>
          <div
            className="absolute left-[492px] top-[8px] flex h-[35px] w-[88px] cursor-pointer items-center gap-[8px] rounded-[24px] border-[0.5px] border-[#CCCCCC] bg-white px-[8px]"
            onClick={() => navigate("/campaigns/assign")}
          >
            <span className="flex h-[20px] w-[20px] items-center justify-center rounded-full bg-[#FF2B2B] text-[10.3px] text-white">
              {leads.filter((l) => !l.ownerId).length}
            </span>
            <span className="text-[14px] font-light text-black">Assign</span>
          </div>
        </div>

        {/* members bar */}
        <div className="absolute left-[18px] top-[135px] h-[329px] w-[590px] rounded-[12px] border-[0.6px] border-[#D2D2D2] bg-white">
          <span className="absolute left-[10px] top-[11px] text-[20px] leading-[25px] text-black">Members</span>
          {/* avatar stack */}
          {[
            { l: 142, bg: "#F4C1C1", fg: "#B93636", t: initialOf(salesMembers[0]?.name) },
            { l: 162.7, bg: "#C2E9CF", fg: "#2A9A4F", t: initialOf(salesMembers[1]?.name) },
            { l: 184.1, bg: "#A1BAE6", fg: "#2158BA", t: initialOf(salesMembers[2]?.name) },
            {
              l: 199.1,
              bg: "#EFF5FF",
              fg: "#000000",
              t: salesMembers.length > 3 ? `+${salesMembers.length - 3}` : "",
            },
          ]
            .filter((a) => a.t)
            .map((a) => (
            <span
              key={a.l}
              className="absolute top-[12px] flex h-[30px] w-[30px] items-center justify-center rounded-full border border-[#373636] text-[10.7px] font-medium"
              style={{ left: a.l, background: a.bg, color: a.fg }}
            >
              {a.t}
            </span>
          ))}
          {/* toggle */}
          <div
            className="absolute left-[415px] top-[10px] flex h-[27px] w-[74px] cursor-pointer items-center gap-[6px] rounded-[14px] border-[0.6px] border-black bg-white px-[6px]"
            onClick={() => setMembersActive((v) => !v)}
          >
            <Smile className="h-[18px] w-[18px] text-[#4CCC16]" strokeWidth={1.6} />
            <div
              className={`relative h-[18.9px] w-[34.3px] rounded-full ${
                membersActive ? "bg-black" : "bg-[#D9D9D9]"
              }`}
            >
              <span
                className={`absolute top-[1.7px] h-[15.4px] w-[15.4px] rounded-full bg-white ${
                  membersActive ? "right-[1.4px]" : "left-[1.4px]"
                }`}
              />
            </div>
          </div>
          <ChevronDown className="absolute left-[505px] top-[16px] h-[16px] w-[16px] text-black" strokeWidth={1.8} />

          {/* member rows */}
          {salesMembers.length === 0 ? (
            <span className="absolute left-[10px] top-[67px] text-[12px] font-light text-black/40">
              No members yet
            </span>
          ) : (
            salesMembers.slice(0, 2).map((m, i) => (
              <MemberRow
                key={m.id}
                top={i === 0 ? 67 : 144}
                name={m.name}
                initial={initialOf(m.name)}
                avatarBg={i === 0 ? "#DFF7D8" : "#F6FF86"}
                avatarText={i === 0 ? "#2A9A4F" : "#939D0F"}
                campaign={campaigns[i]?.name ?? ""}
                newLeads={leadsByStatus(m.id, "NEW")}
                contactedLeads={leadsByStatus(m.id, "CONTACTED")}
                convertedLeads={leadsByStatus(m.id, "CONVERTED")}
                status={onLeave.has(m.id) ? "Absent" : "Active"}
                responseTime={responseTimeOf(m.id)}
                pager={campaigns.length > 0 ? `${i + 1}/${campaigns.length}` : ""}
                onClick={() => navigate("/people")}
              />
            ))
          )}
        </div>
      </div>

      {/* ===================== Right profile / agency panel ===================== */}
      <div className="absolute left-[1049px] top-[224px] h-[816px] w-[369px] rounded-[24px] border border-[#D4D4D4] bg-gradient-to-br from-white/[0.46] to-[#74A4F7] shadow-[0_1px_2px_rgba(0,0,0,0.05)]" />

      {/* avatar + edit */}
      <div className="absolute left-[1193px] top-[244px] flex h-[82px] w-[82px] items-center justify-center rounded-full border border-black bg-gradient-to-br from-[#F1FFC3] to-[#C8B3ED] text-[26px]">
        👑
      </div>
      <span className="absolute left-[1261px] top-[309px] flex h-[20px] w-[20px] items-center justify-center rounded-[12px] bg-white">
        <Pencil className="h-[9px] w-[9px] text-black" strokeWidth={1.6} />
      </span>

      <span className="absolute left-[1171px] top-[338px] w-[125px] text-center text-[20px] font-semibold leading-[24px] text-[#111827]">
        {me?.name ?? ""}
      </span>
      <span className="absolute left-[1171px] top-[361px] w-[125px] text-center text-[12px] font-normal leading-[16px] text-[#6B7280]">
        {roleLabel(me?.role)}
      </span>

      {/* agency code pill */}
      <div className="absolute left-[1162px] top-[386px] flex h-[28px] w-[144px] items-center justify-center gap-[4px] rounded-[24px] border-[0.5px] border-[#D9D9D9] bg-white/50">
        <span className="text-[10px] font-normal text-black/80">
          Agency Code&nbsp;&nbsp;{meWithCode?.agencyCode ?? ""}
        </span>
        <Copy className="h-[12px] w-[12px] text-black" strokeWidth={1.4} />
      </div>

      {/* Detailed Information */}
      <span className="absolute left-[1062px] top-[433px] text-[14px] font-medium leading-[24px] text-black">
        Detailed Information
      </span>
      <InfoRow top={469} icon={User} label="Full Name" value={me?.name ?? ""} />
      <InfoRow top={515} icon={Mail} label="Email Address" value={me?.email ?? ""} />
      <InfoRow top={561} icon={ClipboardList} label="Assign as" value={roleLabel(me?.role)} />
      {/* Birth Date has no column on User in the Prisma schema — render empty rather than invent one. */}
      <InfoRow top={607} icon={Cake} label="Birth Date" value="" />

      {/* Agency Information */}
      <span className="absolute left-[1062px] top-[677px] text-[14px] font-medium leading-[24px] text-black">
        Agency Information
      </span>
      <div className="absolute left-[1193px] top-[713px] h-[82px] w-[82px] rounded-full border border-black bg-[#ECEAEA]" />
      <span className="absolute left-[1255px] top-[775px] flex h-[20px] w-[20px] items-center justify-center rounded-[12px] bg-white">
        <Pencil className="h-[9px] w-[9px] text-black" strokeWidth={1.6} />
      </span>
      <InfoRow top={810} icon={User} label="Agency Name" value={agency?.name ?? ""} />
      <InfoRow top={856} icon={Mail} label="Email Address" value={me?.email ?? ""} />
      <InfoRow top={902} icon={Phone} label="Contact Number" value={me?.phone ?? ""} />
      {/* Agency has no website column in the Prisma schema — render empty rather than invent one. */}
      <InfoRow top={948} icon={Globe} label="Agency Website" value="" />

      {/* ===================== Add Member modal (on top) ===================== */}
      <div className="absolute left-[413px] top-[107px] h-[579px] w-[614px] rounded-[24px] bg-white shadow-[0_20px_60px_rgba(0,0,0,0.18)]">
        {/* header */}
        <span className="absolute left-[29px] top-[42px] text-[24px] font-medium leading-none text-black">
          Add Member
        </span>
        <div
          className="absolute left-[363px] top-[30.5px] flex h-[47px] w-[140px] cursor-pointer items-center justify-center rounded-[24px] bg-black/95"
          onClick={handleSendInvite}
        >
          <span className="text-[20px] font-normal leading-none text-white">Send Invite</span>
        </div>
        <span
          className="absolute left-[523px] top-[30px] flex h-[48px] w-[48px] cursor-pointer items-center justify-center rounded-[24px] border border-black bg-white"
          onClick={() => navigate(-1)}
        >
          <X className="h-[16px] w-[16px] text-black" strokeWidth={1.5} />
        </span>
      </div>

      {/* modal fields (positioned in canvas coords, over the modal) */}
      <ModalField label="Name" top={201}>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter name"
          className="w-full bg-transparent text-[18px] font-normal text-black outline-none placeholder:text-black/70"
        />
      </ModalField>
      <ModalField label="Email Address" top={303}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter email address"
          className="w-full bg-transparent text-[18px] font-normal text-black outline-none placeholder:text-black/70"
        />
      </ModalField>
      <ModalField label="Contact Number" top={405}>
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Enter Contact number"
          className="w-full bg-transparent text-[18px] font-normal text-black outline-none placeholder:text-black/70"
        />
      </ModalField>
      <ModalField label="Permission" top={507}>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="flex-1 appearance-none bg-transparent text-[18px] font-normal text-black/70 outline-none"
        >
          <option value="SALES_EMPLOYEE">Sales</option>
          <option value="SALES_MANAGER">Sales Manager</option>
          <option value="OPERATION_EMPLOYEE">Operations</option>
          <option value="OPERATION_MANAGER">Operations Manager</option>
          <option value="SUPER_ADMIN">Super Admin</option>
        </select>
        <ChevronDown className="h-[20px] w-[20px] text-black" strokeWidth={1.8} />
      </ModalField>
      <div className="absolute left-[442px] top-[609px] flex h-[47px] w-[540px] items-center rounded-full border border-[#D6D6D6] bg-[#FEFCFF] px-[16px]">
        <span className="flex-1 text-[18px] font-normal text-black/70">Advance Setting</span>
        <ChevronDown className="h-[20px] w-[20px] text-black" strokeWidth={1.8} />
      </div>
    </>
  );
}
