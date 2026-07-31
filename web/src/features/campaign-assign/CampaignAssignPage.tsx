import type { ReactNode } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowUpRight,
  Check,
  ChevronDown,
  Clock,
  Eye,
  Flag,
  Heart,
  Instagram,
  Mail,
  MapPin,
  Pencil,
  Phone,
  PieChart,
  Plus,
  Star,
  Users,
  X,
} from "lucide-react";
import whatsapp from "@/assets/icons/whatsapp.svg";
import {
  useCampaignFull,
  useCampaigns,
  useCreators,
  useNotes,
  useReminders,
  useUsers,
  type Agency,
  type Campaign,
  type CampaignFull,
  type User,
} from "@/api/hooks";

type CreatorRow = CampaignFull["creatorList"][number];

/**
 * Super Admin — Campaigns / Assign.
 * Exact reconstruction of Figma frame 3407:83867 ("Super Admin- Campaigns assign"),
 * 1440×1024. The screen is the "Assign" modal (frame 3647:5858) sitting on a
 * rgba(0,0,0,0.5) scrim over the dimmed "Nike's Diwali" campaign-detail page.
 */

/* --------------------------------------------------------------------- */
/* modal primitives                                                       */
/* --------------------------------------------------------------------- */
function CountBadge({ n, size }: { n: string; size: number }) {
  return (
    <span
      className="flex items-center justify-center rounded-full border border-[#E2E2E2] bg-white text-[11px] leading-none text-black"
      style={{ width: size, height: size }}
    >
      {n}
    </span>
  );
}

function FlagPill({ label }: { label: string }) {
  return (
    <div className="flex h-[23px] items-center gap-[3px] rounded-full border border-[#ECECEC] bg-white pl-[6px] pr-[8px]">
      <Flag className="h-[13px] w-[13px] text-black/70" strokeWidth={1.5} />
      <span className="font-inter text-[8px] font-medium text-[#222222]">{label}</span>
    </div>
  );
}

function ProgressPill({ color, n }: { color: string; n: string }) {
  return (
    <div className="flex h-[23px] items-center gap-[2px] rounded-full border border-[#ECECEC] bg-white px-[6px]">
      <PieChart style={{ color }} width={13} height={13} strokeWidth={2} />
      <span className="text-[8px] leading-none text-black/80">{n}</span>
    </div>
  );
}

type TagInfo = { name: string; status: string; statusColor: string };

function CampaignTag({ tag }: { tag: TagInfo }) {
  return (
    <div className="absolute left-[253px] top-[15px] h-[49px] w-[137px] rounded-[12px] border border-[#ECECEC] bg-white">
      <div className="absolute left-[6px] top-[7px] flex items-center gap-[4px]">
        <Mail className="h-[16px] w-[16px] text-black/70" strokeWidth={1.5} />
        <span className="whitespace-nowrap text-[12px] font-light text-black/80">{tag.name}</span>
      </div>
      <div className="absolute left-[29px] top-[26px] flex h-[16px] items-center gap-[3px] rounded-full border border-[#ECECEC] bg-white px-[5px]">
        <PieChart style={{ color: tag.statusColor }} width={10} height={10} strokeWidth={2} />
        <span className="whitespace-nowrap text-[6px] leading-none text-black/80">{tag.status}</span>
      </div>
    </div>
  );
}

/**
 * A card slot: geometry + palette only (Figma-fixed). Every text value on the card
 * is filled from a live record by withLive() — slots carry no record data.
 */
type Slot = {
  x: number;
  y: number;
  avatarBg?: string;
  initialColor?: string;
  /** PieChart tint of this slot's campaign tag; the tag's text comes from the campaign. */
  tagColor?: string;
  cancel?: boolean;
};

type Person = Slot & {
  name: string;
  initial?: string;
  avg: string;
  campaigns: string;
  n2: string;
  n4: string;
  n7: string;
  tag?: TagInfo;
  active?: boolean;
};

function PersonCard({ p }: { p: Person }) {
  const navigate = useNavigate();
  return (
    <div
      className="absolute rounded-[8px] border border-[#ECECEC] bg-white"
      style={{ left: p.x, top: p.y, width: 416, height: 81 }}
    >
      {/* avatar */}
      {p.avatarBg ? (
        <div
          className="absolute left-[5px] top-[7px] flex h-[30px] w-[30px] items-center justify-center rounded-full"
          style={{ background: p.avatarBg }}
        >
          <span className="text-[10.3px] leading-none" style={{ color: p.initialColor }}>
            {p.initial}
          </span>
        </div>
      ) : (
        <div className="absolute left-[5px] top-[7px] h-[30px] w-[30px] rounded-full bg-gradient-to-br from-[#C8E6FF] to-[#C8B3ED]" />
      )}

      <span className="absolute left-[42px] top-[7px] text-[11.9px] font-medium leading-none text-black/90">
        {p.name}
      </span>
      <span className="absolute left-[42px] top-[24px] font-inter text-[8.4px] leading-none text-black/70">
        {p.avg}
      </span>

      {p.active && (
        <span className="absolute left-[137px] top-[8px] flex h-[15px] items-center rounded-full border border-[#ECECEC] bg-white px-[7px] font-inter text-[8px] font-medium leading-none text-[#4CCC16]">
          Active
        </span>
      )}

      {/* stat row */}
      <div className="absolute left-[7px] top-[46px] flex items-center gap-[5px]">
        <FlagPill label={p.campaigns} />
        <ProgressPill color="#75A7C7" n={p.n2} />
        <ProgressPill color="#79B282" n={p.n4} />
        <ProgressPill color="#EBB363" n={p.n7} />
      </div>

      {p.tag && <CampaignTag tag={p.tag} />}
      {p.cancel && (
        <X
          onClick={() => navigate(-1)}
          className="absolute left-[394px] top-[6px] h-[16px] w-[16px] cursor-pointer text-black/70"
          strokeWidth={1.5}
        />
      )}
    </div>
  );
}

function AddButton({ x, y }: { x: number; y: number }) {
  const navigate = useNavigate();
  return (
    <div
      onClick={() => navigate("/settings/add-members")}
      className="absolute flex h-[26px] cursor-pointer items-center gap-[6px] rounded-full border border-[#ECECEC] bg-white pl-[11px] pr-[10px]"
      style={{ left: x, top: y }}
    >
      <span className="text-[12px] font-light leading-none text-black/90">Add</span>
      <Plus className="h-[11px] w-[11px] text-black" strokeWidth={1.8} />
    </div>
  );
}

function Divider({ x, y, w }: { x: number; y: number; w: number }) {
  return <div className="absolute bg-[#E9E9E9]" style={{ left: x, top: y, width: w, height: 1 }} />;
}

/** compact follower/view counts: 1_200_000 -> "1.2M", 900_000 -> "900k". */
function compact(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}k`;
  return `${n}`;
}

/** budget is a raw integer (e.g. 120000) shown compactly in Indian units as "1.2L" / "2.5Cr". */
function formatBudget(n: number): string {
  if (n >= 10_000_000) return `${(n / 10_000_000).toFixed(1).replace(/\.0$/, "")}Cr`;
  if (n >= 100_000) return `${(n / 100_000).toFixed(1).replace(/\.0$/, "")}L`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}k`;
  return `${n}`;
}

/** full amount with Indian grouping: 250000 -> "2,50,000". */
function inr(n: number): string {
  return n.toLocaleString("en-IN");
}

/** "2025-07-20T14:00:00Z" -> "20" / "Fri" / "02:00 pm" for the date chips + time pills. */
const dayNum = (iso: string) => String(new Date(iso).getDate());
const dayName = (iso: string) => new Date(iso).toLocaleDateString("en-US", { weekday: "short" });
const timeOfDay = (iso: string) =>
  new Date(iso).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true }).toLowerCase();

/** "SALES_MANAGER" -> "Sales Manager" for the person-card subtitle. */
function prettyRole(role: string): string {
  return role
    .split("_")
    .map((w) => w.charAt(0) + w.slice(1).toLowerCase())
    .join(" ");
}

/**
 * Fill a slot from a real user and the campaigns that user actually owns.
 * Campaign.contactPerson holds the owning user's name — the only user↔campaign link
 * the schema has — so the card's counts are that user's real campaign book:
 * the flag pill is the total, and the three pie pills are the CampaignStatus split
 * (ACTIVE / DONE / DRAFT) matching the three tints the frame uses.
 */
function withLive(s: Slot, u: User, own: Campaign[]): Person {
  const byStatus = (status: string) => String(own.filter((c) => c.status === status).length);
  const tagged = own[0];
  return {
    ...s,
    name: u.name,
    initial: s.avatarBg ? u.name.charAt(0) : undefined,
    avg: prettyRole(u.role),
    campaigns: `${own.length} Campaigns`,
    n2: byStatus("ACTIVE"),
    n4: byStatus("DONE"),
    n7: byStatus("DRAFT"),
    tag:
      s.tagColor && tagged
        ? { name: tagged.name, status: tagged.status, statusColor: s.tagColor }
        : undefined,
    active: own.some((c) => c.status === "ACTIVE"),
  };
}

/** Fill the fixed card slots with real records; slots past the end of the data render nothing. */
function fillSlots(slots: Slot[], users: (User | undefined)[], campaigns: Campaign[]): Person[] {
  return slots.reduce<Person[]>((acc, slot, i) => {
    const u = users[i];
    if (u) acc.push(withLive(slot, u, campaigns.filter((c) => c.contactPerson === u.name)));
    return acc;
  }, []);
}

const CURRENT: Slot[] = [
  { x: 20, y: 163, avatarBg: "#F4C1C1", initialColor: "#B93636", tagColor: "#79B282", cancel: true },
  { x: 20, y: 256, tagColor: "#75A7C7", cancel: true },
];

const PEOPLE: Slot[] = [
  { x: 18, y: 465, avatarBg: "#DAFCFF", initialColor: "#007E89", tagColor: "#EBB363" },
  { x: 18, y: 600, avatarBg: "#FFDBF6", initialColor: "#BB389A" },
  { x: 19, y: 739, avatarBg: "#EDEEFF", initialColor: "#3845BB" },
];

/* --------------------------------------------------------------------- */
/* the Assign modal                                                       */
/* --------------------------------------------------------------------- */
function AssignModal() {
  const navigate = useNavigate();
  const users = useUsers().data ?? [];
  const campaigns = useCampaigns().data ?? [];

  // People are bucketed by their Prisma Role into the three sub-sections the frame shows.
  const managers = users.filter((u) => u.role.endsWith("_MANAGER"));
  const leads = users.filter((u) => u.role === "SUPER_ADMIN");
  const employees = users.filter((u) => u.role.endsWith("_EMPLOYEE"));

  const current = fillSlots(CURRENT, users, campaigns);
  const people = fillSlots(PEOPLE, [managers[0], leads[0], employees[0]], campaigns);
  return (
    <div className="absolute left-[493px] top-[87px] h-[851px] w-[550px] rounded-[24px] bg-white shadow-[0_24px_70px_rgba(0,0,0,0.28)]">
      {/* header */}
      <h2 className="absolute left-[20px] top-[24px] text-[24px] font-medium leading-none text-black">Assign</h2>
      <span
        onClick={() => navigate("/campaigns/detail")}
        className="absolute left-[433px] top-[20px] flex h-[45px] w-[45px] cursor-pointer items-center justify-center rounded-full bg-black"
      >
        <Check className="h-[20px] w-[20px] text-white" strokeWidth={2.4} />
      </span>
      <span
        onClick={() => navigate(-1)}
        className="absolute left-[487px] top-[20px] flex h-[45px] w-[45px] cursor-pointer items-center justify-center rounded-full border border-black/10 bg-white"
      >
        <X className="h-[18px] w-[18px] text-black" strokeWidth={1.8} />
      </span>

      {/* Current Assigned section */}
      <span className="absolute left-[18px] top-[76px] text-[20px] leading-none text-black/70">Current Assigned</span>
      <div className="absolute left-[191px] top-[82px]">
        <CountBadge n={String(current.length)} size={24} />
      </div>
      <Divider x={225} y={94.5} w={157} />

      {/* Team Lead sub-header */}
      <span className="absolute left-[18px] top-[125px] text-[15px] leading-none text-black/70">Team Lead</span>
      <div className="absolute left-[157px] top-[125px]">
        <CountBadge n={String(current.length)} size={22.4} />
      </div>
      <Divider x={191} y={136} w={160} />

      {current.map((p) => (
        <PersonCard key={`${p.x}-${p.y}`} p={p} />
      ))}

      {/* big separator */}
      <Divider x={18} y={358} w={417} />

      {/* People section */}
      <span className="absolute left-[18px] top-[378px] text-[20px] leading-none text-black/70">People</span>
      <div className="absolute left-[157px] top-[384.5px]">
        <CountBadge n={String(users.length)} size={24} />
      </div>
      <Divider x={191} y={396.5} w={157} />

      {/* Manager sub-header */}
      <span className="absolute left-[18px] top-[427px] text-[15px] leading-none text-black/70">Manager</span>
      <div className="absolute left-[157px] top-[427px]">
        <CountBadge n={String(managers.length)} size={22.4} />
      </div>
      <Divider x={191} y={438} w={160} />
      <ChevronDown className="absolute left-[363px] top-[430px] h-[16px] w-[16px] text-black" strokeWidth={1.8} />

      {/* Team Lead sub-header (people) */}
      <span className="absolute left-[69px] top-[562px] text-[15px] leading-none text-black/70">Team Lead</span>
      <div className="absolute left-[208px] top-[562px]">
        <CountBadge n={String(leads.length)} size={22.4} />
      </div>
      <Divider x={242} y={573} w={160} />
      <ChevronDown className="absolute left-[414px] top-[565px] h-[16px] w-[16px] text-black" strokeWidth={1.8} />

      {/* Employees sub-header */}
      <span className="absolute left-[70px] top-[701px] text-[15px] leading-none text-black/70">Employees</span>
      <div className="absolute left-[209px] top-[701px]">
        <CountBadge n={String(employees.length)} size={22.4} />
      </div>
      <Divider x={243} y={712} w={160} />
      <ChevronDown className="absolute left-[415px] top-[704px] h-[16px] w-[16px] text-black" strokeWidth={1.8} />

      {people.map((p) => (
        <PersonCard key={`${p.x}-${p.y}`} p={p} />
      ))}
      <AddButton x={478} y={496} />
      <AddButton x={478} y={625} />
      <AddButton x={478} y={764} />
    </div>
  );
}

/* --------------------------------------------------------------------- */
/* background (dimmed) campaign-detail page                               */
/* --------------------------------------------------------------------- */
function BgChip({ children }: { children: ReactNode }) {
  return (
    <span className="flex h-[30px] items-center whitespace-nowrap rounded-full bg-white px-[9px] text-[12px] font-light text-[#121212]">
      {children}
    </span>
  );
}

function CreatorCard({
  x,
  c,
  matchPct,
  agency,
  agencyStars,
}: {
  x: number;
  c: CreatorRow;
  matchPct?: number;
  agency?: Agency;
  agencyStars: number | null;
}) {
  const navigate = useNavigate();
  return (
    <div
      onClick={() => navigate("/creators/detail")}
      className="absolute top-[712px] h-[193px] w-[266px] cursor-pointer rounded-[12px] bg-[#F5F5F5]"
      style={{ left: x }}
    >
      <span className="absolute right-[4px] top-[-1px] flex h-[28px] w-[28px] items-center justify-center rounded-full bg-white">
        <ArrowUpRight className="h-[15px] w-[15px] text-black" strokeWidth={1.7} />
      </span>
      {/* creator identity */}
      <div className="absolute left-[8px] top-[6px] flex items-center gap-[5px]">
        <span className="h-[38px] w-[38px] rounded-full bg-gradient-to-br from-[#FFD6E7] to-[#C8B3ED]" />
        <div>
          <div className="text-[12px] leading-[15px] text-black/90">{c.name}</div>
          <div className="text-[8px] leading-[13px] text-black/70">{c.handle}</div>
        </div>
      </div>
      <span className="absolute right-[38px] top-[10px] flex h-[18px] items-center gap-[3px] rounded-[9px] bg-white px-[4px] text-[7.6px] text-black">
        <MapPin className="h-[9px] w-[9px]" strokeWidth={1.6} /> {c.location ?? ""}
      </span>
      {/* stat rows */}
      <div className="absolute left-[10px] top-[51px] flex gap-[4px]">
        <span className="flex h-[24px] items-center gap-[2px] rounded-[12px] bg-white px-[5px] text-[10px] text-black/80">
          <Users className="h-[12px] w-[12px]" strokeWidth={1.6} />{compact(c.followers)}
        </span>
        <span className="flex h-[24px] items-center gap-[2px] rounded-[12px] bg-white px-[5px] text-[10px] text-black/80">
          <Eye className="h-[12px] w-[12px] text-[#2CC37F]" strokeWidth={1.6} />{compact(c.avgViews)} Avg. views
        </span>
        <span className="flex h-[24px] items-center gap-[2px] rounded-[12px] bg-white px-[5px] text-[10px] text-black/80">
          <Heart className="h-[12px] w-[12px]" strokeWidth={1.6} />{c.engagementRate.toFixed(1)}% ER
        </span>
      </div>
      <div className="absolute left-[10px] top-[82px] flex gap-[4px]">
        <span className="flex h-[24px] items-center gap-[2px] rounded-[12px] bg-white px-[5px] text-[10px] text-black/80">
          <Star className="h-[12px] w-[12px] text-[#FFC107]" strokeWidth={1.6} fill="#FDD835" />{c.stars.toFixed(1)} Stars
        </span>
        <span className="flex h-[24px] items-center gap-[2px] rounded-[12px] bg-white px-[5px] text-[10px] text-black/80">
          <Eye className="h-[12px] w-[12px] text-[#2CC37F]" strokeWidth={1.6} />{c.cpv.toFixed(2)}p CPV
        </span>
        <span className="flex h-[24px] items-center gap-[2px] rounded-[12px] bg-white px-[5px] text-[10px] text-black/80">
          {matchPct != null ? `${matchPct}% Match` : ""}
        </span>
      </div>
      {/* managed by */}
      <span className="absolute left-[19px] top-[113px] text-[9.3px] text-black/70">Managed by:</span>
      <div className="absolute left-[19px] top-[132px] flex h-[33px] w-[226px] items-center justify-between rounded-[11px] bg-gradient-to-r from-[#6801FE]/[0.06] to-[#D9D9D9]/[0.06] px-[6px]">
        <span className="flex items-center gap-[6px]">
          <span className="h-[24px] w-[24px] rounded-full bg-[#1FB37A]" />
          <span className="flex flex-col">
            <span className="text-[10.2px] text-black/90">{agency?.name ?? ""}</span>
            <span className="flex items-center gap-[3px] text-[8px] text-black/60">
              <Star className="h-[10px] w-[10px] text-[#FFC107]" strokeWidth={1.6} fill="#FDD835" />
              {agencyStars != null ? `${agencyStars.toFixed(1)} Stars` : ""}
            </span>
          </span>
        </span>
        <span className="flex h-[25px] items-center gap-[3px] rounded-[8px] bg-white/70 px-[6px] text-[12px] font-medium text-[#571A9F]">
          {agency ? `₹${formatBudget(agency.earnings)}` : ""}
        </span>
      </div>
    </div>
  );
}

function Background() {
  const navigate = useNavigate();
  const [sp] = useSearchParams();
  const campaigns = useCampaigns().data ?? [];
  const id = sp.get("id") ?? campaigns[0]?.id ?? null;
  const { data: item } = useCampaignFull(id);
  const creators = item?.creatorList ?? [];
  const inv = item?.invoice ?? null;
  const agency = item?.agency;
  const users = useUsers().data ?? [];
  const notes = useNotes().data ?? [];
  const reminders = useReminders().data ?? [];
  const [followUp, prevActivity] = reminders;

  // creatorList is a trimmed projection (no matchPct) — read it off the full Creator record.
  const allCreators = useCreators().data ?? [];
  const matchById = new Map(allCreators.map((c) => [c.id, c.matchPct]));
  // Agency has no rating column; its star score is the mean of the creators it manages.
  const roster = agency ? allCreators.filter((c) => c.agencyId === agency.id) : [];
  const agencyStars = roster.length ? roster.reduce((s, c) => s + c.stars, 0) / roster.length : null;

  /**
   * Per-creator line items on the invoice. There is no per-creator amount column, so the
   * creator pool (invoice budget − agency fee) is split by each creator's share of the
   * campaign's total avg. views; the struck price is that same share of the gross budget.
   */
  const totalViews = creators.reduce((s, c) => s + c.avgViews, 0);
  const share = (i: number, pot: number) =>
    creators[i] && totalViews ? Math.round((creators[i].avgViews / totalViews) * pot) : 0;
  const pool = inv ? Math.max(inv.budget - inv.agencyFee, 0) : 0;
  return (
    <>
      {/* back button */}
      <span
        onClick={() => navigate(-1)}
        className="absolute left-[235px] top-[153px] flex h-[45px] w-[45px] cursor-pointer items-center justify-center rounded-full bg-black"
      >
        <ArrowLeft className="h-[20px] w-[20px] text-white" strokeWidth={2} />
      </span>

      {/* title */}
      <h1 className="absolute left-[268px] top-[230px] text-[34px] font-normal leading-none text-black">
        {item?.name ?? ""}
      </h1>

      {/* team container */}
      <div className="absolute left-[261px] top-[301px] h-[334px] w-[838px] rounded-[24px] bg-[#F3F3F3]/[0.13]" />

      {/* chips row */}
      <div className="absolute left-[270px] top-[314px] flex gap-[8px]">
        <BgChip>{item?.timeline ?? ""}</BgChip>
        <BgChip>{item?.brandName ?? ""}</BgChip>
        <BgChip>{item?.website ?? ""}</BgChip>
        <BgChip>{item ? `Budget ₹${formatBudget(item.budget)}` : ""}</BgChip>
        <BgChip>{item?.status ?? ""}</BgChip>
      </div>

      {/* assigned to */}
      <div className="absolute left-[271px] top-[378px] flex items-center">
        <span className="h-[45px] w-[45px] rounded-full bg-gradient-to-br from-[#C8E6FF] to-[#C8B3ED]" />
        <span className="-ml-[23px] flex h-[45px] w-[45px] items-center justify-center rounded-full bg-[#F4C1C1] text-[15px] text-[#B93636]">
          {users[0]?.name.charAt(0) ?? ""}
        </span>
        <div className="ml-[8px]">
          <div className="text-[12px] leading-none text-black/70">Assigned to</div>
          <div className="mt-[4px] text-[16px] leading-none text-black/90">
            {users.slice(0, CURRENT.length).map((u) => u.name.split(" ")[0]).join(", ")}
          </div>
        </div>
      </div>

      {/* campaign progress card */}
      <div className="absolute left-[586px] top-[375px] flex h-[53px] w-[204px] items-center gap-[10px] rounded-[13px] bg-white px-[5px]">
        <PieChart className="h-[32px] w-[32px] text-[#79B282]" strokeWidth={2} />
        <div>
          <div className="text-[12px] leading-none text-black/70">Campaign Progress</div>
          <div className="mt-[6px] text-[18px] leading-none text-black/90">{item ? `${item.progress}%` : ""}</div>
        </div>
      </div>

      {/* lead source card */}
      <div className="absolute left-[805px] top-[375px] flex h-[53px] w-[274px] items-center rounded-[13px] bg-white px-[5px]">
        <span className="h-[38px] w-[38px] rounded-full bg-gradient-to-br from-[#FFD6E7] to-[#C8B3ED]" />
        <div className="ml-[10px]">
          <div className="text-[12px] leading-none text-black/70">Lead Source</div>
          <div className="mt-[6px] text-[18px] leading-none text-black/90">{item?.contactPerson ?? ""}</div>
        </div>
        <div className="ml-auto flex items-center gap-[5px]">
          <span
            onClick={() => navigate("/creators/detail")}
            className="flex h-[24px] w-[24px] cursor-pointer items-center justify-center rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,0.12)]"
          >
            <ArrowUpRight className="h-[12px] w-[12px] text-black" strokeWidth={1.7} />
          </span>
          <span className="flex h-[24px] w-[24px] items-center justify-center rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,0.12)]">
            <Phone className="h-[12px] w-[12px] text-black" strokeWidth={1.6} />
          </span>
          <img src={whatsapp} alt="WhatsApp" className="h-[24px] w-[24px]" />
        </div>
      </div>

      {/* message / deliverables / notes cards */}
      <div className="absolute left-[271px] top-[449px] h-[178px] w-[258px] rounded-[12px] bg-[#F5F5F5]">
        <span className="absolute left-[12px] top-[8px] text-[12px] text-black">Message</span>
        <span className="absolute right-[10px] top-[8px] flex h-[24px] w-[24px] items-center justify-center rounded-full bg-[#FEFCFF]">
          <Plus className="h-[10px] w-[10px] text-black" strokeWidth={1.8} />
        </span>
        {/* Campaign has no brief/message column and no campaign→message relation — copy stays static. */}
        <div className="absolute left-[12px] top-[33px] h-[130px] w-[236px] rounded-[12px] bg-white p-[6px] text-[12px] font-light leading-[20px] text-black/60">
          We are launching a new skincare product
        </div>
      </div>

      <div className="absolute left-[545px] top-[449px] h-[178px] w-[258px] rounded-[12px] bg-[#F5F5F5]">
        <span className="absolute left-[12px] top-[8px] text-[12px] text-black">Deliverables</span>
        <span className="absolute right-[10px] top-[8px] flex h-[24px] w-[24px] items-center justify-center rounded-full bg-[#FEFCFF]">
          <Plus className="h-[10px] w-[10px] text-black" strokeWidth={1.8} />
        </span>
        <div className="absolute left-[12px] top-[38px] flex h-[36px] w-[128px] items-center gap-[6px] rounded-[12px] bg-white px-[5px]">
          <Instagram className="h-[16px] w-[16px] text-[#C837AB]" strokeWidth={1.6} />
          {/* No Deliverable model / no deliverable column on Campaign — counts stay static. */}
          <div className="flex flex-col gap-[3px] text-[12px] font-light text-black/60">
            <span className="text-[8px]">1 Collab Reel</span>
            <span className="text-[8px]">2 Stories</span>
          </div>
        </div>
      </div>

      <div className="absolute left-[819px] top-[449px] h-[178px] w-[258px] rounded-[12px] bg-[#F5F5F5]">
        <span className="absolute left-[12px] top-[8px] text-[12px] text-black">Add Notes</span>
        <span className="absolute right-[10px] top-[8px] flex h-[24px] w-[24px] items-center justify-center rounded-full bg-[#FEFCFF]">
          <Plus className="h-[10px] w-[10px] text-black" strokeWidth={1.8} />
        </span>
        <div className="absolute left-[12px] top-[38px] h-[130px] w-[236px] rounded-[12px] bg-white p-[6px]">
          <span className="text-[12px] text-black/70">Today</span>
          <div className="mt-[8px] text-[12px] font-light text-black/60">{notes[0]?.body ?? ""}</div>
        </div>
      </div>

      {/* creators card */}
      <div className="absolute left-[261px] top-[655px] h-[274px] w-[586px] rounded-[12px] bg-[#F5F5F5]/60">
        <span className="absolute left-[10px] top-[8px] text-[12px] text-black">Creators</span>
      </div>
      {creators.slice(0, 2).map((c, i) => (
        <CreatorCard
          key={c.id}
          x={i === 0 ? 272 : 554}
          c={c}
          matchPct={matchById.get(c.id)}
          agency={agency}
          agencyStars={agencyStars}
        />
      ))}

      {/* Follow Up card */}
      <div className="absolute left-[1109px] top-[301px] h-[234px] w-[295px] rounded-[12px] bg-white/60">
        <span className="absolute left-[10px] top-[8px] text-[12px] text-black">Follow Up</span>
        <span className="absolute right-[0px] top-[0px] flex h-[28px] w-[28px] items-center justify-center rounded-full bg-white">
          <Plus className="h-[14px] w-[14px] text-black" strokeWidth={1.8} />
        </span>
        <div className="absolute left-[10px] top-[39px] h-[184px] w-[272px] rounded-[12px] bg-white">
          <span className="absolute left-[0px] top-[0px] text-[12px] text-black/70">Today</span>
          {followUp && (
            <>
              <div className="absolute left-[13px] top-[70px] flex items-center gap-[6px]">
                <span className="flex h-[52px] w-[38px] flex-col items-center justify-center rounded-[18px] bg-[#D8DDFF] text-[15px] font-light leading-[16px] text-black">
                  <span>{dayNum(followUp.dueAt)}</span>
                  <span>{dayName(followUp.dueAt)}</span>
                </span>
                <div>
                  <div className="text-[16px] leading-none text-black">{followUp.title}</div>
                  <div className="mt-[8px] flex items-center gap-[4px]">
                    <span className="h-[14px] w-[14px] rounded-full bg-gradient-to-br from-[#FFD6E7] to-[#C8B3ED]" />
                    <span className="text-[10.2px] text-black/90">{item?.contactPerson ?? ""}</span>
                  </div>
                </div>
              </div>
              <X className="absolute right-[8px] top-[36px] h-[16px] w-[16px] text-black/70" strokeWidth={1.6} />
            </>
          )}
        </div>
      </div>

      {/* Payment Summary card */}
      <div className="absolute left-[1109px] top-[553px] h-[437px] w-[295px] rounded-[12px] bg-[#F5F5F5]/60">
        <span className="absolute left-[10px] top-[8px] text-[12px] text-black">Payment Summary</span>
        <span className="absolute right-[0px] top-[0px] flex h-[28px] w-[28px] items-center justify-center rounded-full bg-white">
          <ArrowUpRight className="h-[14px] w-[14px] text-black" strokeWidth={1.7} />
        </span>
        <div className="absolute left-[10px] top-[43px] h-[375px] w-[270px] rounded-[12px] bg-white">
          <div className="mt-[16px] text-center text-[16px] font-medium leading-none text-black">{inv?.brandName ?? "Brand Name"}</div>
          {/* invoice token */}
          <div className="mx-[30px] mt-[16px] flex flex-col items-center rounded-[6px] border border-dashed border-black/30 py-[3px]">
            <span className="font-mono text-[9px] font-medium text-black">Invoice</span>
            <span className="font-mono text-[12px] font-bold tracking-tight text-black">{inv?.number ?? ""}</span>
          </div>
          <div className="mx-[22px] mt-[18px] h-px bg-[#E9E9E9]" />
          {/* rows */}
          <div className="mx-[22px] mt-[13px] flex items-center justify-between text-[13px] font-medium text-black">
            <span>Brand Budget</span>
            <span className="text-[12px] text-black/50">{inv ? `₹${inr(inv.budget)}` : ""}</span>
          </div>
          <div className="mx-[22px] mt-[4px] flex items-center justify-between text-[12px] text-black/50">
            <span>{creators[0]?.name ?? ""}</span>
            <span className="flex items-center gap-[4px]">
              <span className="text-[#E44E26]">{inv && creators[0] ? `- ₹${inr(share(0, pool))}` : ""}</span>
              <span className="flex h-[16px] w-[16px] items-center justify-center rounded-full bg-[#ECEAEA]">
                <Pencil className="h-[8px] w-[8px] text-black/70" strokeWidth={1.6} />
              </span>
            </span>
          </div>
          <div className="mx-[22px] mt-[4px] flex items-center justify-between text-[12px] text-black/50">
            <span>{creators[1]?.name ?? ""}</span>
            <span className="flex items-center gap-[4px]">
              <span className="text-[7.2px] text-[#E44E26] line-through">
                {inv && creators[1] ? `₹${inr(share(1, inv.budget))}` : ""}
              </span>
              <span className="text-[#E44E26]">{inv && creators[1] ? `- ₹${inr(share(1, pool))}` : ""}</span>
              <span className="flex h-[16px] w-[16px] items-center justify-center rounded-full bg-[#ECEAEA]">
                <Pencil className="h-[8px] w-[8px] text-black/70" strokeWidth={1.6} />
              </span>
            </span>
          </div>
          {/* agency fee token */}
          <div className="mx-[30px] mt-[10px] rounded-[6px] border border-dashed border-black/30 px-[7px] py-[4px]">
            <div className="text-center font-mono text-[9px] font-medium text-black">Agency Fee</div>
            <div className="mt-[3px] flex items-center justify-between">
              <span className="flex items-center gap-[4px] rounded-full bg-white px-[6px] py-[3px] text-[12px] text-black">
                <span className="flex h-[13px] w-[13px] items-center justify-center rounded-[7px] bg-[#ECEAEA]">
                  <Plus className="h-[7px] w-[7px] text-black" strokeWidth={1.8} />
                </span>
                Added
              </span>
              <span className="flex items-center gap-[4px]">
                <span className="rounded-full bg-white px-[6px] py-[3px] text-[12px] font-medium text-[#3DBB6C]">
                  {inv && inv.budget ? `${Math.round((inv.agencyFee / inv.budget) * 100)}%` : ""}
                </span>
                <span className="text-[12px] text-black/50">{inv ? `₹${inr(inv.agencyFee)}` : ""}</span>
              </span>
            </div>
          </div>
          {/* received payment */}
          <div className="mx-[15px] mt-[13px] flex h-[38px] items-center justify-between rounded-[13px] bg-white px-[9px]">
            <span className="text-[13px] font-medium text-black">Received Payment</span>
            <span className="text-[12px] text-[#200BD6] underline">Set Now</span>
          </div>
          <div className="mx-[12px] mt-[12px] h-px bg-[#E9E9E9]" />
          {/* estimate */}
          <div className="mx-[12px] mt-[13px] flex items-center justify-between">
            <span className="text-[13px] font-medium text-black">Estimate Payout</span>
            <span className="text-[15px] font-semibold text-[#3DBB6C]">{inv ? `₹${inr(inv.payout)}` : ""}</span>
          </div>
        </div>
      </div>

      {/* Activity card */}
      <div className="absolute left-[863px] top-[655px] h-[275px] w-[236px] rounded-[12px] bg-[#F9F9F9]/70">
        <span className="absolute left-[12px] top-[8px] text-[12px] text-black">Activity</span>
        <div className="absolute left-[12px] top-[38px] h-[225px] w-[212px] rounded-[12px] bg-white p-[6px]">
          <span className="text-[12px] text-black/70">Today</span>
          {followUp && (
            <div className="mt-[19px] flex items-center gap-[6px]">
              <span className="flex h-[52px] w-[36px] flex-col items-center justify-center rounded-[18px] bg-[#D8DDFF] text-[13px] font-light leading-[16px] text-black">
                <span>{dayNum(followUp.dueAt)}</span>
                <span>{dayName(followUp.dueAt)}</span>
              </span>
              <div>
                <div className="text-[16px] leading-none text-black">{followUp.title}</div>
                <span className="mt-[6px] flex h-[24px] w-[74px] items-center gap-[4px] rounded-full bg-white px-[6px] text-[10.2px] text-black/60 shadow-[0_1px_3px_rgba(0,0,0,0.08)]">
                  <Clock className="h-[12px] w-[12px]" strokeWidth={1.6} />{timeOfDay(followUp.dueAt)}
                </span>
              </div>
            </div>
          )}
          <span className="mt-[16px] block text-[12px] text-black/70">Yesterday</span>
          {prevActivity && (
            <div className="mt-[10px] flex items-center gap-[6px]">
              <span className="flex h-[52px] w-[36px] flex-col items-center justify-center rounded-[18px] bg-[#EFEFF0] text-[13px] font-light leading-[16px] text-black">
                <span>{dayNum(prevActivity.dueAt)}</span>
                <span>{dayName(prevActivity.dueAt)}</span>
              </span>
              <div>
                <div className="text-[16px] leading-none text-black">{prevActivity.title}</div>
                <span className="mt-[6px] flex h-[24px] w-[74px] items-center gap-[4px] rounded-full bg-white px-[6px] text-[10.2px] text-black/60 shadow-[0_1px_3px_rgba(0,0,0,0.08)]">
                  <Clock className="h-[12px] w-[12px]" strokeWidth={1.6} />{timeOfDay(prevActivity.dueAt)}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

/* --------------------------------------------------------------------- */
/* page                                                                   */
/* --------------------------------------------------------------------- */
export default function CampaignAssignPage() {
  const navigate = useNavigate();
  return (
    <>
      <Background />
      {/*
       * The Assign modal (Figma frame 1171276614 → 3647:5858) sits on a
       * rgba(0,0,0,0.5) scrim that dims the ENTIRE canvas — including the
       * AppShell TopBar (z-10) and Sidebar (z-20). Lift the scrim + modal
       * above that chrome so nothing is clipped and the whole page is dimmed.
       */}
      <div className="absolute inset-0 z-30">
        {/* scrim (Figma frame 1171276614, rgba(0,0,0,0.5)) */}
        <div onClick={() => navigate(-1)} className="absolute inset-0 bg-black/50" />
        <AssignModal />
      </div>
    </>
  );
}
