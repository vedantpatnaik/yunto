import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import {
  ChevronLeft,
  Plus,
  Search,
  SlidersHorizontal,
  ArrowUpRight,
  Wallet,
  Activity,
  UserRound,
  Phone,
  Signal,
  Wifi,
  BatteryFull,
  LayoutGrid,
  Users,
  Megaphone,
  MessageCircle,
} from "lucide-react";
import whatsapp from "@/assets/icons/whatsapp.svg";

/**
 * Agency app — Lead (Figma frame 6123:17385, "Lead", 375×946), rendered inside
 * the 390px MobileFrame. Self-contained: it carries its own status bar and bottom
 * nav. This is the leads workspace list (its sibling frame 6123:17533,
 * "Lead expanded", is the drill-down state of a single card).
 *
 * REAL geometry pinned from the cached full-document tree for THIS node: the
 * frame is 375×946 at origin (827, 6974) with a single flat solid fill of
 * #FFFFFF (white) — used verbatim as the page background below.
 *
 * NOTE: For the entire build window the Figma REST geometry endpoints returned
 * HTTP 429 ("Rate limit exceeded", multi-day retry-after on the Starter plan —
 * /me still 200s, so the token is valid; only the cost-based /nodes and /images
 * endpoints are throttled) and the Figma MCP bridge returned "reached the Figma
 * MCP tool call limit on the Starter plan". The cached document dump is depth-2
 * only, so this frame resolves with its own box + fill but ZERO child geometry.
 * Child layout is therefore reconstructed from the shared design system
 * (tailwind.config.ts tokens) and the verified sibling idioms:
 *   • The desktop "yunto leads" frame (features/leads/LeadsPage.tsx) — exact
 *     lead-card content and colors: green agency avatar (#1FB37A), gradient
 *     person/contact avatars, Wallet/Activity/UserRound chips, the white
 *     Contact-Person pill with Phone + WhatsApp, and the Stellar-Talents roster.
 *   • The sibling mobile chrome (AgencyLeadsPage, node 7775:16235) — status bar,
 *     back/title/+ header, New-Leads/Contacted segmented control, search + filter
 *     row, 20px side margins, and the 5-tab bottom nav.
 * Re-run against node 6123:17385 to pin pixel-exact coordinates once the Figma
 * API budget resets.
 */

/* --------------------------------- data ---------------------------------- */
type Lead = {
  agency: string;
  agencySub: string;
  person: string;
  role: string;
  money: string;
  er?: string;
  people: string;
  contact: string;
  date: string;
  grad: string;
};

const LEADS: Lead[] = [
  {
    agency: "Stellar Talents",
    agencySub: "Influencer Management",
    person: "Rahul Aggrawal",
    role: "sales",
    money: "800k",
    er: "4.5% ER",
    people: "40",
    contact: "Priya Sharma",
    date: "12 July",
    grad: "from-[#C8E6FF] to-[#C8B3ED]",
  },
  {
    agency: "Stellar Talents",
    agencySub: "Influencer Management",
    person: "Rahul Aggrawal",
    role: "sales",
    money: "600k",
    er: "2.5% ER",
    people: "40",
    contact: "Priya Sharma",
    date: "12 July",
    grad: "from-[#FFD6E7] to-[#C8B3ED]",
  },
  {
    agency: "Stellar Talents",
    agencySub: "Influencer Management",
    person: "Rahul Aggrawal",
    role: "sales",
    money: "600k",
    er: "2.5% ER",
    people: "40",
    contact: "Priya Sharma",
    date: "12 July",
    grad: "from-[#C8F5E4] to-[#9FB8F0]",
  },
];

/* ------------------------------- primitives ------------------------------ */
function Chip({ icon: Icon, children }: { icon: LucideIcon; children: ReactNode }) {
  return (
    <span className="flex h-[24px] items-center gap-[4px] rounded-full bg-[#F4F2F8] px-[9px] text-[11.5px] font-normal leading-none text-ink/90">
      <Icon className="h-[13px] w-[13px] text-ink/60" strokeWidth={1.6} />
      {children}
    </span>
  );
}

function LeadCard({ lead }: { lead: Lead }) {
  return (
    <div className="relative w-[350px] rounded-[18px] bg-white p-[13px] shadow-[0_4px_16px_rgba(0,0,0,0.06)]">
      {/* open arrow */}
      <span className="absolute right-[11px] top-[11px] flex h-[28px] w-[28px] items-center justify-center rounded-full bg-[#F4F2F8]">
        <ArrowUpRight className="h-[15px] w-[15px] text-ink/80" strokeWidth={1.8} />
      </span>
      {/* date */}
      <span className="absolute right-[48px] top-[17px] text-[10px] font-light leading-none text-ink/[0.47]">
        {lead.date}
      </span>

      {/* agency header */}
      <div className="flex items-center gap-[9px]">
        <span className="h-[40px] w-[40px] shrink-0 rounded-full bg-[#1FB37A]" />
        <div>
          <div className="text-[13.5px] font-medium leading-[16px] text-ink/90">{lead.agency}</div>
          <div className="text-[10px] font-light leading-[13px] text-ink/60">{lead.agencySub}</div>
        </div>
      </div>

      {/* lead person */}
      <div className="mt-[9px] flex items-center gap-[9px]">
        <span className={`h-[40px] w-[40px] shrink-0 rounded-full bg-gradient-to-br ${lead.grad}`} />
        <div>
          <div className="text-[13.5px] font-medium leading-[16px] text-ink/90">{lead.person}</div>
          <div className="text-[10px] font-light leading-[13px] text-ink/60">{lead.role}</div>
        </div>
      </div>

      {/* stat chips */}
      <div className="mt-[10px] flex items-center gap-[7px]">
        <Chip icon={Wallet}>{lead.money}</Chip>
        {lead.er && <Chip icon={Activity}>{lead.er}</Chip>}
        <Chip icon={UserRound}>{lead.people}</Chip>
      </div>

      {/* contact person */}
      <div className="mt-[11px] text-[11px] font-light leading-none text-ink/80">Contact Person</div>
      <div className="mt-[6px] flex h-[40px] items-center justify-between rounded-[20px] bg-[#F4F2F8] px-[10px]">
        <span className="flex items-center gap-[8px]">
          <span className="h-[24px] w-[24px] shrink-0 rounded-full bg-gradient-to-br from-[#FFD6E7] to-[#C8B3ED]" />
          <span className="text-[12.5px] font-normal leading-none text-ink/90">{lead.contact}</span>
        </span>
        <span className="flex items-center gap-[8px]">
          <span className="flex h-[28px] w-[28px] items-center justify-center rounded-full bg-white shadow-[0_1px_4px_rgba(0,0,0,0.12)]">
            <Phone className="h-[14px] w-[14px] text-ink/80" strokeWidth={1.6} />
          </span>
          <img src={whatsapp} alt="WhatsApp" className="h-[28px] w-[28px]" />
        </span>
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
export default function AgLeadPg() {
  return (
    <div className="relative w-[390px] overflow-hidden bg-white font-sans text-ink" style={{ height: 946 }}>
      {/* soft brand banner behind the header */}
      <div className="absolute inset-x-0 top-0 h-[196px] bg-gradient-to-b from-[#EFE9FB] to-white" />

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
        Leads
      </h1>
      <button className="absolute right-[18px] top-[60px] flex h-[40px] w-[40px] items-center justify-center rounded-full bg-ink shadow-[0_4px_12px_rgba(90,60,160,0.28)]">
        <Plus className="h-[20px] w-[20px] text-white" strokeWidth={2} />
      </button>

      {/* New Leads / Contacted segmented control */}
      <div className="absolute left-[20px] top-[116px] flex h-[38px] w-[228px] items-center rounded-full bg-[#F4F2F8] p-[3px]">
        <span className="flex h-full flex-1 items-center justify-center rounded-full bg-ink text-[12.5px] font-medium leading-none text-white">
          New Leads
        </span>
        <span className="flex h-full flex-1 items-center justify-center rounded-full text-[12.5px] font-normal leading-none text-ink/60">
          Contacted
        </span>
      </div>
      <span className="absolute right-[20px] top-[127px] text-[13px] font-light leading-none text-ink/60">
        <span className="font-medium text-ink">15</span> Leads
      </span>

      {/* search + filter */}
      <div className="absolute left-[20px] top-[168px] flex h-[46px] w-[292px] items-center gap-[10px] rounded-[14px] bg-[#F4F2F8] px-[14px]">
        <Search className="h-[18px] w-[18px] text-ink/40" strokeWidth={1.8} />
        <span className="text-[13px] font-light text-ink/40">Search leads</span>
      </div>
      <button className="absolute right-[20px] top-[168px] flex h-[46px] w-[46px] items-center justify-center rounded-[14px] bg-ink">
        <SlidersHorizontal className="h-[19px] w-[19px] text-white" strokeWidth={1.8} />
      </button>

      {/* lead cards */}
      <div className="absolute left-[20px] top-[230px] flex w-[350px] flex-col gap-[14px]">
        {LEADS.map((lead, i) => (
          <LeadCard key={i} lead={lead} />
        ))}
      </div>

      {/* bottom nav */}
      <div className="absolute inset-x-0 bottom-0 flex h-[74px] items-center bg-white px-[14px] pb-[6px] shadow-[0_-2px_16px_rgba(0,0,0,0.06)]">
        <NavItem icon={LayoutGrid} label="Home" />
        <NavItem icon={Users} label="Sales" active />
        <NavItem icon={Megaphone} label="Campaigns" />
        <NavItem icon={MessageCircle} label="Chat" />
        <NavItem icon={UserRound} label="Profile" />
      </div>
    </div>
  );
}
