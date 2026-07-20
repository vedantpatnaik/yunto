import type { LucideIcon } from "lucide-react";
import {
  Bell,
  Megaphone,
  Users,
  Tag,
  Wallet,
  ClipboardList,
  Phone,
  Eye,
  Flame,
  ArrowUpRight,
  Signal,
  Wifi,
  BatteryFull,
  LayoutGrid,
  MessageCircle,
  UserRound,
} from "lucide-react";

/**
 * Agency app — Operations Home (Figma frame 7756:13954, "Operation- Home",
 * 375×876), rendered inside the 390px MobileFrame. Self-contained: it carries its
 * own status bar and bottom nav, matching the sibling Creators / Leads / Profile
 * screens.
 *
 * NOTE: The Figma REST API (HTTP 429, multi-day retry-after — shared Starter-plan
 * cost budget) and the Figma MCP server ("reached the Figma MCP tool call limit on
 * the Starter plan") were BOTH exhausted for the entire build window, so exact node
 * geometry could not be pulled for this frame. It is reconstructed pixel-faithfully
 * from the REAL, verified references that WERE available and share this exact design
 * system:
 *   • The desktop Super-Admin dashboard (features/dashboard/DashboardPage.tsx, node
 *     7917:13074) — the canonical Overview stat idiom (Active Campaigns / Creators /
 *     Leads / Pending Pay-Outs), the Top-Creators row (avatar + fire badge, name +
 *     @handle, Users/Eye/Tag stats, arrow-up-right open button) and the sample
 *     roster (Leena Sharma, Aditya Singh…).
 *   • The sibling mobile chrome (AgencyCreatorsPage / AgencyLeadsPage / AgencyProfile
 *     Page) — status bar, header, 390×876 frame, #F4F2F8 field, #E7DFFA→#F4F2F8
 *     banner, Outfit via font-sans, and the five-tab bottom nav (Home active here).
 * Re-run against node 7756:13954 to pin pixel-exact coordinates once the Figma API
 * budget resets.
 */

/* --------------------------------- data ---------------------------------- */
type Stat = { label: string; value: string; icon: LucideIcon; chip: string; tint: string };

const STATS: Stat[] = [
  { label: "Active Campaigns", value: "32", icon: Megaphone, chip: "bg-[#EDE7FB]", tint: "text-[#7C5CFC]" },
  { label: "Active Creators", value: "128", icon: Users, chip: "bg-[#E4F3EC]", tint: "text-[#1FB37A]" },
  { label: "Active Leads", value: "40", icon: Tag, chip: "bg-[#E6F0FF]", tint: "text-[#4B7BEC]" },
  { label: "Pending Pay-Outs", value: "11", icon: Wallet, chip: "bg-[#FDF0E3]", tint: "text-[#E8975B]" },
];

type Reminder = { icon: LucideIcon; chip: string; tint: string; title: string; sub: string; time: string };

const REMINDERS: Reminder[] = [
  {
    icon: ClipboardList,
    chip: "bg-[#EDE7FB]",
    tint: "text-[#7C5CFC]",
    title: "Review Zostel Trip deliverables",
    sub: "Campaign · due today",
    time: "10:00 AM",
  },
  {
    icon: Phone,
    chip: "bg-[#E4F3EC]",
    tint: "text-[#1FB37A]",
    title: "Call Priya Sharma",
    sub: "Barter lead follow-up",
    time: "12:30 PM",
  },
];

type Creator = {
  name: string;
  handle: string;
  followers: string;
  views: string;
  leads: string;
  grad: string;
  top?: boolean;
};

const CREATORS: Creator[] = [
  { name: "Leena Sharma", handle: "@leenabliss", followers: "1.2M", views: "900k views", leads: "489 leads", grad: "from-[#F1FFC3] to-[#C8B3ED]", top: true },
  { name: "Aditya Singh", handle: "@adityasingh", followers: "1.5M", views: "850k views", leads: "498 leads", grad: "from-[#C8E6FF] to-[#C8B3ED]", top: true },
];

/* ------------------------------- primitives ------------------------------ */
function StatCard({ s }: { s: Stat }) {
  const Icon = s.icon;
  return (
    <div className="flex h-[96px] w-[169px] flex-col justify-between rounded-[18px] bg-white p-[14px] shadow-[0_4px_16px_rgba(0,0,0,0.05)]">
      <span className={`flex h-[32px] w-[32px] items-center justify-center rounded-full ${s.chip}`}>
        <Icon className={`h-[16px] w-[16px] ${s.tint}`} strokeWidth={1.8} />
      </span>
      <div>
        <div className="text-[22px] font-medium leading-none text-ink">{s.value}</div>
        <div className="mt-[5px] text-[11.5px] font-light leading-none text-ink/55">{s.label}</div>
      </div>
    </div>
  );
}

function ReminderRow({ r }: { r: Reminder }) {
  const Icon = r.icon;
  return (
    <div className="flex h-[58px] items-center gap-[11px] px-[14px]">
      <span className={`flex h-[36px] w-[36px] shrink-0 items-center justify-center rounded-[11px] ${r.chip}`}>
        <Icon className={`h-[17px] w-[17px] ${r.tint}`} strokeWidth={1.7} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="truncate text-[13px] font-medium leading-[16px] text-ink/90">{r.title}</div>
        <div className="mt-[2px] text-[11px] font-light leading-none text-ink/50">{r.sub}</div>
      </div>
      <span className="shrink-0 text-[11px] font-normal leading-none text-ink/55">{r.time}</span>
    </div>
  );
}

function Mini({ icon: Icon, label }: { icon: LucideIcon; label: string }) {
  return (
    <div className="flex items-center gap-[3px]">
      <Icon className="h-[13px] w-[13px] text-ink/70" strokeWidth={1.7} />
      <span className="whitespace-nowrap text-[10px] font-normal text-ink/70">{label}</span>
    </div>
  );
}

function CreatorCard({ c }: { c: Creator }) {
  return (
    <div className="relative flex h-[80px] w-full items-center rounded-[16px] bg-white px-[12px] shadow-[0_4px_14px_rgba(0,0,0,0.05)]">
      <div className="relative shrink-0">
        <div className={`h-[46px] w-[46px] rounded-full border-[2px] border-[#fcfbd2] bg-gradient-to-br ${c.grad}`} />
        {c.top && (
          <span className="absolute -bottom-[2px] -right-[2px] flex h-[19px] w-[19px] items-center justify-center rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,0.15)]">
            <Flame className="h-[12px] w-[12px] text-[#FB8C00]" strokeWidth={1.7} fill="#FFE0B2" />
          </span>
        )}
      </div>
      <div className="ml-[12px] flex min-w-0 flex-1 flex-col gap-[6px]">
        <div className="flex items-baseline gap-[6px]">
          <span className="truncate text-[14.5px] font-medium leading-none text-ink/90">{c.name}</span>
          <span className="shrink-0 text-[10.5px] font-light leading-none text-ink/50">{c.handle}</span>
        </div>
        <div className="flex items-center gap-[12px]">
          <Mini icon={Users} label={c.followers} />
          <Mini icon={Eye} label={c.views} />
          <Mini icon={Tag} label={c.leads} />
        </div>
      </div>
      <button className="ml-[8px] flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full border border-[#eaeaea] bg-[#f2f1f3]">
        <ArrowUpRight className="h-[15px] w-[15px] text-ink/80" strokeWidth={1.9} />
      </button>
    </div>
  );
}

function SectionHead({ title, top }: { title: string; top: number }) {
  return (
    <div className="absolute left-[22px] right-[22px] flex items-center justify-between" style={{ top }}>
      <span className="text-[15px] font-medium leading-none text-ink">{title}</span>
      <span className="text-[12px] font-normal leading-none text-ink/50">See all</span>
    </div>
  );
}

function NavItem({ icon: Icon, label, active }: { icon: LucideIcon; label: string; active?: boolean }) {
  return (
    <div className="flex flex-1 flex-col items-center gap-[3px]">
      <Icon className={`h-[22px] w-[22px] ${active ? "text-ink" : "text-ink/40"}`} strokeWidth={active ? 2 : 1.7} />
      <span className={`text-[10px] leading-none ${active ? "font-medium text-ink" : "font-light text-ink/45"}`}>
        {label}
      </span>
    </div>
  );
}

/* ---------------------------------- page --------------------------------- */
export default function OperationHomePage() {
  return (
    <div className="relative w-[390px] overflow-hidden bg-[#F4F2F8] font-sans text-ink" style={{ height: 876 }}>
      {/* soft brand banner behind the header */}
      <div className="absolute inset-x-0 top-0 h-[210px] bg-gradient-to-b from-[#E7DFFA] to-[#F4F2F8]" />

      {/* status bar */}
      <div className="absolute inset-x-0 top-0 h-[54px]">
        <span className="absolute left-[26px] top-[17px] text-[15px] font-medium leading-none text-ink">9:41</span>
        <div className="absolute right-[22px] top-[18px] flex items-center gap-[6px]">
          <Signal className="h-[16px] w-[16px] text-ink" strokeWidth={2} />
          <Wifi className="h-[16px] w-[16px] text-ink" strokeWidth={2} />
          <BatteryFull className="h-[18px] w-[18px] text-ink" strokeWidth={1.6} />
        </div>
      </div>

      {/* greeting header */}
      <div className="absolute left-[20px] top-[62px] flex items-center gap-[12px]">
        <span className="h-[48px] w-[48px] shrink-0 rounded-full bg-gradient-to-br from-[#C8E6FF] to-[#C8B3ED] ring-[2px] ring-white shadow-[0_3px_10px_rgba(90,60,160,0.18)]" />
        <div>
          <div className="text-[12px] font-light leading-none text-ink/55">Good Morning 👋</div>
          <div className="mt-[6px] text-[18px] font-medium leading-none text-ink">Rahul Aggrawal</div>
        </div>
      </div>
      <button className="absolute right-[20px] top-[62px] flex h-[44px] w-[44px] items-center justify-center rounded-full bg-white shadow-[0_2px_10px_rgba(0,0,0,0.06)]">
        <Bell className="h-[20px] w-[20px] text-ink" strokeWidth={1.7} />
        <span className="absolute right-[11px] top-[11px] h-[8px] w-[8px] rounded-full border-[1.5px] border-white bg-[#F04438]" />
      </button>

      {/* Overview */}
      <span className="absolute left-[22px] top-[128px] text-[13px] font-medium leading-none text-ink/45">Overview</span>
      <div className="absolute left-[20px] top-[150px] flex w-[350px] flex-wrap gap-[12px]">
        {STATS.map((s) => (
          <StatCard key={s.label} s={s} />
        ))}
      </div>

      {/* Reminders */}
      <SectionHead title="Reminders" top={380} />
      <div className="absolute left-[20px] top-[408px] w-[350px] divide-y divide-line/60 rounded-[20px] bg-white shadow-[0_4px_16px_rgba(0,0,0,0.05)]">
        {REMINDERS.map((r) => (
          <ReminderRow key={r.title} r={r} />
        ))}
      </div>

      {/* Top Creators */}
      <SectionHead title="Top Creators" top={556} />
      <div className="absolute left-[20px] top-[584px] flex w-[350px] flex-col gap-[12px]">
        {CREATORS.map((c) => (
          <CreatorCard key={c.handle} c={c} />
        ))}
      </div>

      {/* bottom nav */}
      <div className="absolute inset-x-0 bottom-0 flex h-[74px] items-center bg-white px-[14px] pb-[6px] shadow-[0_-2px_16px_rgba(0,0,0,0.06)]">
        <NavItem icon={LayoutGrid} label="Home" active />
        <NavItem icon={Users} label="Creators" />
        <NavItem icon={Megaphone} label="Campaigns" />
        <NavItem icon={MessageCircle} label="Chat" />
        <NavItem icon={UserRound} label="Profile" />
      </div>
    </div>
  );
}
