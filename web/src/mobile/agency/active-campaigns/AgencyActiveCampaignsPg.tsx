import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import {
  ChevronLeft,
  Plus,
  Search,
  SlidersHorizontal,
  ArrowUpRight,
  Wallet,
  Users,
  CalendarDays,
  Signal,
  Wifi,
  BatteryFull,
  LayoutGrid,
  Megaphone,
  MessageCircle,
  UserRound,
} from "lucide-react";

/**
 * Agency app — Active Campaigns (Figma frame 7696:11291, "Active Campaigns",
 * 390×876), rendered inside the 390px MobileFrame. Self-contained: it carries its
 * own status bar and bottom nav, matching the sibling Leads / Creators screens.
 *
 * NOTE: For the entire build window the Figma REST API returned HTTP 429
 * ("Rate limit exceeded", multi-day retry-after) and the Figma MCP server was over
 * its Starter-plan tool-call budget, so exact node geometry could not be pulled for
 * THIS frame. It is reconstructed pixel-faithfully from the REAL, verified
 * references that share this exact design system:
 *   • The mobile chrome (AgencyLeadsPage / AgencyCreatorsPage, nodes 7775:16235 /
 *     7786:21624) — 390×876 frame, #F4F2F8 field, #E7DFFA→#F4F2F8 banner, status
 *     bar, white circular back button, black + button, search + filter row, the
 *     5-tab bottom nav (Home / Creators / Campaigns / Chat / Profile), Outfit via
 *     font-sans.
 *   • AgencyCampaignPage (node 4100:59321) — the campaign idiom: brand/campaign
 *     name, Barter/Paid + status tags, budget/payout, creators count, and the
 *     deliverables progress bar.
 * Re-run against node 7696:11291 to pin pixel-exact coordinates once the Figma API
 * budget resets.
 */

/* --------------------------------- data ---------------------------------- */
type Campaign = {
  campaign: string;
  brand: string;
  type: "Barter" | "Paid";
  budget: string;
  creators: string;
  window: string;
  done: number;
  total: number;
  date: string;
  grad: string;
};

const CAMPAIGNS: Campaign[] = [
  {
    campaign: "Summer Glow",
    brand: "Bobbi Brown",
    type: "Barter",
    budget: "₹1.2L",
    creators: "12",
    window: "Jul – Aug",
    done: 8,
    total: 12,
    date: "12 July",
    grad: "from-[#F1FFC3] to-[#C8B3ED]",
  },
  {
    campaign: "Zostel Trip",
    brand: "Zostel",
    type: "Paid",
    budget: "₹85k",
    creators: "8",
    window: "Jul – Sep",
    done: 5,
    total: 8,
    date: "10 July",
    grad: "from-[#C8DBFF] to-[#B7A6EC]",
  },
  {
    campaign: "Festive Edit",
    brand: "Nykaa",
    type: "Barter",
    budget: "₹2.4L",
    creators: "20",
    window: "Aug – Oct",
    done: 14,
    total: 20,
    date: "08 July",
    grad: "from-[#FFD3E8] to-[#C8B3ED]",
  },
];

/* ------------------------------- primitives ------------------------------ */
function Chip({ icon: Icon, children }: { icon: LucideIcon; children: ReactNode }) {
  return (
    <span className="flex h-[26px] items-center gap-[5px] rounded-full bg-[#F4F2F8] px-[10px] text-[12px] font-normal leading-none text-ink/90">
      <Icon className="h-[14px] w-[14px] text-ink/60" strokeWidth={1.6} />
      {children}
    </span>
  );
}

function CampaignCard({ c }: { c: Campaign }) {
  const pct = Math.round((c.done / c.total) * 100);
  return (
    <div className="relative w-[350px] rounded-[20px] bg-white p-[14px] shadow-[0_4px_18px_rgba(0,0,0,0.05)]">
      {/* open arrow */}
      <span className="absolute right-[12px] top-[12px] flex h-[30px] w-[30px] items-center justify-center rounded-full bg-[#F4F2F8]">
        <ArrowUpRight className="h-[16px] w-[16px] text-ink/80" strokeWidth={1.8} />
      </span>
      {/* date */}
      <span className="absolute right-[52px] top-[19px] text-[10px] font-light leading-none text-ink/[0.47]">
        {c.date}
      </span>

      {/* brand header */}
      <div className="flex items-center gap-[10px]">
        <span className={`h-[42px] w-[42px] shrink-0 rounded-full bg-gradient-to-br ${c.grad}`} />
        <div>
          <div className="text-[14.5px] font-medium leading-[17px] text-ink/90">{c.campaign}</div>
          <div className="text-[10.5px] font-light leading-[13px] text-ink/60">{c.brand}</div>
        </div>
      </div>

      {/* type + status tags */}
      <div className="mt-[12px] flex items-center gap-[8px]">
        <span className="flex h-[24px] items-center rounded-full bg-[#EFEBF9] px-[11px] text-[11.5px] font-medium leading-none text-ink/80">
          {c.type}
        </span>
        <span className="flex h-[24px] items-center gap-[5px] rounded-full bg-[#E4F6E9] px-[11px] text-[11.5px] font-medium leading-none text-[#2F9A5D]">
          <span className="h-[6px] w-[6px] rounded-full bg-[#2F9A5D]" />
          Active
        </span>
      </div>

      {/* stat chips */}
      <div className="mt-[10px] flex items-center gap-[8px]">
        <Chip icon={Wallet}>{c.budget}</Chip>
        <Chip icon={Users}>{c.creators}</Chip>
        <Chip icon={CalendarDays}>{c.window}</Chip>
      </div>

      {/* deliverables progress */}
      <div className="mt-[14px]">
        <div className="flex items-center justify-between text-[11px] leading-none">
          <span className="font-light text-ink/70">Deliverables</span>
          <span className="font-medium text-ink/90">
            {c.done}/{c.total}
          </span>
        </div>
        <div className="mt-[7px] h-[6px] w-full overflow-hidden rounded-full bg-[#ECEAF1]">
          <div className="h-full rounded-full bg-ink" style={{ width: `${pct}%` }} />
        </div>
      </div>
    </div>
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
export default function AgencyActiveCampaignsPg() {
  return (
    <div className="relative w-[390px] overflow-hidden bg-[#F4F2F8] font-sans text-ink" style={{ height: 876 }}>
      {/* soft brand banner behind the header */}
      <div className="absolute inset-x-0 top-0 h-[210px] bg-gradient-to-b from-[#E7DFFA] to-[#F4F2F8]" />

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
        Active Campaigns
      </h1>
      <button className="absolute right-[18px] top-[60px] flex h-[40px] w-[40px] items-center justify-center rounded-full bg-ink shadow-[0_4px_12px_rgba(90,60,160,0.28)]">
        <Plus className="h-[20px] w-[20px] text-white" strokeWidth={2} />
      </button>

      {/* Active / Completed segmented control */}
      <div className="absolute left-[20px] top-[116px] flex h-[38px] w-[228px] items-center rounded-full bg-white p-[3px] shadow-[0_2px_10px_rgba(0,0,0,0.05)]">
        <span className="flex h-full flex-1 items-center justify-center rounded-full bg-ink text-[12.5px] font-medium leading-none text-white">
          Active
        </span>
        <span className="flex h-full flex-1 items-center justify-center rounded-full text-[12.5px] font-normal leading-none text-ink/60">
          Completed
        </span>
      </div>
      <span className="absolute right-[20px] top-[127px] text-[13px] font-light leading-none text-ink/60">
        <span className="font-medium text-ink">12</span> Campaigns
      </span>

      {/* search + filter */}
      <div className="absolute left-[20px] top-[168px] flex h-[46px] w-[292px] items-center gap-[10px] rounded-[14px] bg-white px-[14px] shadow-[0_2px_10px_rgba(0,0,0,0.05)]">
        <Search className="h-[18px] w-[18px] text-ink/40" strokeWidth={1.8} />
        <span className="text-[13px] font-light text-ink/40">Search campaigns</span>
      </div>
      <button className="absolute right-[20px] top-[168px] flex h-[46px] w-[46px] items-center justify-center rounded-[14px] bg-white shadow-[0_2px_10px_rgba(0,0,0,0.05)]">
        <SlidersHorizontal className="h-[19px] w-[19px] text-ink/70" strokeWidth={1.8} />
      </button>

      {/* campaign cards */}
      <div className="absolute left-[20px] top-[228px] flex w-[350px] flex-col gap-[16px]">
        {CAMPAIGNS.map((c) => (
          <CampaignCard key={c.campaign} c={c} />
        ))}
      </div>

      {/* bottom nav */}
      <div className="absolute inset-x-0 bottom-0 flex h-[74px] items-center bg-white px-[14px] pb-[6px] shadow-[0_-2px_16px_rgba(0,0,0,0.06)]">
        <NavItem icon={LayoutGrid} label="Home" />
        <NavItem icon={Users} label="Creators" />
        <NavItem icon={Megaphone} label="Campaigns" active />
        <NavItem icon={MessageCircle} label="Chat" />
        <NavItem icon={UserRound} label="Profile" />
      </div>
    </div>
  );
}
