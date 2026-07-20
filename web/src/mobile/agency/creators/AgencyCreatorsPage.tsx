import type { LucideIcon } from "lucide-react";
import {
  ChevronLeft,
  Plus,
  Search,
  SlidersHorizontal,
  Users,
  Eye,
  Tag,
  Flame,
  ArrowUpRight,
  Signal,
  Wifi,
  BatteryFull,
  LayoutGrid,
  Megaphone,
  MessageCircle,
  UserRound,
} from "lucide-react";

/**
 * Agency app — Creators (Figma frame 7786:21624, "creators", 375×876), rendered
 * inside the 390px MobileFrame. Self-contained: it carries its own status bar and
 * bottom nav, matching the sibling Profile screen.
 *
 * NOTE: The Figma REST + MCP endpoints were rate-limited (HTTP 429, retry-after
 * ≈ 4.6 days, Starter-plan cost budget) for the whole build window, so exact node
 * geometry could not be pulled for this frame. It is reconstructed from the shared
 * design system and from the only two REAL creator-row references that WERE
 * available:
 *   • AgencyCampaignPage's "Creators" section — exact node geometry for the
 *     creator-row idiom (avatar + fire badge, name + @handle, Users/Eye/Tag stats,
 *     engagement bar) from Figma node 4100:59321.
 *   • The desktop dashboard "Top Creators" card — same rows with the arrow-up-right
 *     open button and the sample roster (Leena Sharma, Diya Sharma, Aditya Singh…).
 * Re-run against node 7786:21624 to pin pixel-exact coordinates once the Figma API
 * budget resets.
 */

/* --------------------------------- data ---------------------------------- */
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
  { name: "Aditya Singh", handle: "@adityasingh", followers: "1.5M", views: "850k views", leads: "498 leads", grad: "from-[#C8DBFF] to-[#B7A6EC]", top: true },
  { name: "Diya Sharma", handle: "@diya444", followers: "1.1M", views: "800k views", leads: "450 leads", grad: "from-[#FFD3E8] to-[#C8B3ED]" },
  { name: "Rahul Verma", handle: "@rahulv", followers: "1.3M", views: "1.1M views", leads: "410 leads", grad: "from-[#C8F5E4] to-[#9FB8F0]", top: true },
  { name: "Priya Nair", handle: "@priyaglow", followers: "980k", views: "700k views", leads: "320 leads", grad: "from-[#FFE3C0] to-[#D8B3ED]" },
  { name: "Sneha Kapoor", handle: "@snehak", followers: "760k", views: "540k views", leads: "260 leads", grad: "from-[#D5E7FF] to-[#C8B3ED]" },
];

/* ------------------------------- primitives ------------------------------ */
function Stat({ icon: Icon, label }: { icon: LucideIcon; label: string }) {
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
      {/* avatar + fire badge */}
      <div className="relative shrink-0">
        <div className={`h-[46px] w-[46px] rounded-full border-[2px] border-[#fcfbd2] bg-gradient-to-br ${c.grad}`} />
        {c.top && (
          <span className="absolute -bottom-[2px] -right-[2px] flex h-[19px] w-[19px] items-center justify-center rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,0.15)]">
            <Flame className="h-[12px] w-[12px] text-[#FB8C00]" strokeWidth={1.7} fill="#FFE0B2" />
          </span>
        )}
      </div>

      {/* name + handle + stats */}
      <div className="ml-[12px] flex min-w-0 flex-1 flex-col gap-[6px]">
        <div className="flex items-baseline gap-[6px]">
          <span className="truncate text-[14.5px] font-medium leading-none text-ink/90">{c.name}</span>
          <span className="shrink-0 text-[10.5px] font-light leading-none text-ink/50">{c.handle}</span>
        </div>
        <div className="flex items-center gap-[12px]">
          <Stat icon={Users} label={c.followers} />
          <Stat icon={Eye} label={c.views} />
          <Stat icon={Tag} label={c.leads} />
        </div>
      </div>

      {/* open button */}
      <button className="ml-[8px] flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full border border-[#eaeaea] bg-[#f2f1f3]">
        <ArrowUpRight className="h-[15px] w-[15px] text-ink/80" strokeWidth={1.9} />
      </button>
    </div>
  );
}

function Chip({ label, active }: { label: string; active?: boolean }) {
  return (
    <span
      className={`flex h-[30px] shrink-0 items-center rounded-full px-[16px] text-[12.5px] leading-none ${
        active
          ? "bg-ink font-medium text-white"
          : "border border-line/70 bg-white font-normal text-ink/70"
      }`}
    >
      {label}
    </span>
  );
}

function NavItem({
  icon: Icon,
  label,
  active,
}: {
  icon: LucideIcon;
  label: string;
  active?: boolean;
}) {
  return (
    <div className="flex flex-1 flex-col items-center gap-[3px]">
      <Icon
        className={`h-[22px] w-[22px] ${active ? "text-ink" : "text-ink/40"}`}
        strokeWidth={active ? 2 : 1.7}
      />
      <span
        className={`text-[10px] leading-none ${
          active ? "font-medium text-ink" : "font-light text-ink/45"
        }`}
      >
        {label}
      </span>
    </div>
  );
}

/* ---------------------------------- page --------------------------------- */
export default function AgencyCreatorsPage() {
  return (
    <div className="relative w-[390px] overflow-hidden bg-[#F4F2F8] font-sans text-ink" style={{ height: 876 }}>
      {/* soft brand banner behind the header */}
      <div className="absolute inset-x-0 top-0 h-[220px] bg-gradient-to-b from-[#E7DFFA] to-[#F4F2F8]" />

      {/* status bar */}
      <div className="absolute inset-x-0 top-0 h-[54px]">
        <span className="absolute left-[26px] top-[17px] text-[15px] font-medium leading-none text-ink">
          9:41
        </span>
        <div className="absolute right-[22px] top-[18px] flex items-center gap-[6px]">
          <Signal className="h-[16px] w-[16px] text-ink" strokeWidth={2} />
          <Wifi className="h-[16px] w-[16px] text-ink" strokeWidth={2} />
          <BatteryFull className="h-[18px] w-[18px] text-ink" strokeWidth={1.6} />
        </div>
      </div>

      {/* header bar */}
      <button className="absolute left-[18px] top-[60px] flex h-[40px] w-[40px] items-center justify-center rounded-full bg-white shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
        <ChevronLeft className="h-[20px] w-[20px] text-ink" strokeWidth={1.8} />
      </button>
      <h1 className="absolute inset-x-0 top-[70px] text-center text-[18px] font-medium leading-none text-ink">
        Creators
      </h1>
      <button className="absolute right-[18px] top-[60px] flex h-[40px] w-[40px] items-center justify-center rounded-full bg-ink shadow-[0_4px_12px_rgba(90,60,160,0.28)]">
        <Plus className="h-[20px] w-[20px] text-white" strokeWidth={2} />
      </button>

      {/* search + filter */}
      <div className="absolute left-[20px] top-[116px] flex h-[46px] w-[280px] items-center gap-[10px] rounded-[14px] bg-white px-[14px] shadow-[0_2px_10px_rgba(0,0,0,0.05)]">
        <Search className="h-[18px] w-[18px] text-ink/40" strokeWidth={1.8} />
        <span className="text-[13px] font-light text-ink/40">Search creators</span>
      </div>
      <button className="absolute right-[20px] top-[116px] flex h-[46px] w-[46px] items-center justify-center rounded-[14px] bg-white shadow-[0_2px_10px_rgba(0,0,0,0.05)]">
        <SlidersHorizontal className="h-[19px] w-[19px] text-ink/70" strokeWidth={1.8} />
      </button>

      {/* filter chips */}
      <div className="absolute left-[20px] top-[178px] flex w-[350px] items-center gap-[8px] overflow-hidden">
        <Chip label="All" active />
        <Chip label="Top" />
        <Chip label="New" />
        <Chip label="Barter" />
        <Chip label="Active" />
      </div>

      {/* creator list */}
      <div className="absolute left-[20px] top-[224px] flex w-[350px] flex-col gap-[12px]">
        {CREATORS.map((c) => (
          <CreatorCard key={c.handle} c={c} />
        ))}
      </div>

      {/* bottom nav */}
      <div className="absolute inset-x-0 bottom-0 flex h-[74px] items-center bg-white px-[14px] pb-[6px] shadow-[0_-2px_16px_rgba(0,0,0,0.06)]">
        <NavItem icon={LayoutGrid} label="Home" />
        <NavItem icon={Users} label="Creators" active />
        <NavItem icon={Megaphone} label="Campaigns" />
        <NavItem icon={MessageCircle} label="Chat" />
        <NavItem icon={UserRound} label="Profile" />
      </div>
    </div>
  );
}
