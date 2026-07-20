import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { Search, SlidersHorizontal, ArrowUpRight, ArrowUp, ArrowDown, Wallet, Activity, UserRound, Phone } from "lucide-react";
import { useNavigate } from "react-router-dom";
import whatsapp from "@/assets/icons/whatsapp.svg";
import { useLeads } from "@/api/hooks";

/**
 * Super Admin — Leads / Sales Workspace.
 * Exact reconstruction of Figma frame 5948:47008 ("yunto leads"), 1440×1024.
 */

type Lead = {
  id: string; agency: string; agencySub: string; person: string; personRole: string;
  money: string; er?: string; people: string; contact: string; date: string;
};

/* ------------------------------ primitives ----------------------------- */
function Chip({ icon: Icon, children }: { icon: LucideIcon; children: ReactNode }) {
  return (
    <span className="flex h-[24px] items-center gap-[3px] rounded-full bg-white px-[8px] text-[11px] text-ink">
      <Icon className="h-[13px] w-[13px] text-ink/70" strokeWidth={1.6} />
      {children}
    </span>
  );
}

function StatPill({ n, badge, dir, label }: { n: string; badge: string; dir: "up" | "down"; label: string }) {
  return (
    <div className="flex items-start">
      <span className="text-[48px] font-normal leading-[0.9] text-ink">{n}</span>
      <div className="ml-[3px] mt-[6px] flex flex-col gap-[11px]">
        <span className={`flex h-[15px] items-center gap-[2px] rounded-[9px] px-[3px] text-[12px] font-light text-ink ${dir === "up" ? "bg-[#DCFF68]" : "bg-[#FFB0B1]"}`}>
          {dir === "up" ? <ArrowUp className="h-[9px] w-[9px]" strokeWidth={2} /> : <ArrowDown className="h-[9px] w-[9px]" strokeWidth={2} />}
          {badge}
        </span>
        <span className="text-[12px] font-light leading-none text-ink/70">{label}</span>
      </div>
    </div>
  );
}

function CircleBtn({ children, dark, onClick }: { children: ReactNode; dark?: boolean; onClick?: () => void }) {
  return (
    <span onClick={onClick} className={`flex h-[45px] w-[47px] items-center justify-center rounded-[24px] ${onClick ? "cursor-pointer " : ""}${dark ? "bg-black text-white" : "bg-white text-ink"}`}>
      {children}
    </span>
  );
}

function LeadCard({ lead }: { lead: Lead }) {
  const navigate = useNavigate();
  return (
    <div
      onClick={() => navigate(`/leads/detail?id=${lead.id}`)}
      className="relative h-[193px] w-[266px] cursor-pointer rounded-[12px] bg-[#F5F5F5] transition-shadow hover:shadow-[0_6px_20px_rgba(0,0,0,0.10)]"
    >
      {/* arrow */}
      <span className="absolute right-[4px] top-[2px] flex h-[28px] w-[28px] items-center justify-center rounded-[16px] bg-white">
        <ArrowUpRight className="h-[15px] w-[15px] text-ink" strokeWidth={1.8} />
      </span>
      {/* date */}
      <span className="absolute right-[40px] top-[13px] text-[8px] leading-none text-ink/[0.47]">{lead.date}</span>

      {/* agency header */}
      <div className="absolute left-[8px] top-[6px] flex items-center gap-[5px]">
        <span className="h-[38px] w-[38px] shrink-0 rounded-full bg-[#1FB37A]" />
        <div>
          <div className="text-[12px] leading-[15px] text-ink/90">{lead.agency}</div>
          <div className="text-[8px] leading-[13px] text-ink/70">{lead.agencySub}</div>
        </div>
      </div>

      {/* lead person */}
      <div className="absolute left-[10px] top-[51px] flex items-center gap-[5px]">
        <span className="h-[38px] w-[38px] shrink-0 rounded-full bg-gradient-to-br from-[#C8E6FF] to-[#C8B3ED]" />
        <div>
          <div className="text-[12px] leading-[15px] text-ink/90">{lead.person}</div>
          <div className="text-[8px] leading-[13px] text-ink/70">{lead.personRole}</div>
        </div>
      </div>

      {/* chips */}
      <div className="absolute left-[10px] top-[96px] flex items-center gap-[6px]">
        <Chip icon={Wallet}>{lead.money}</Chip>
        {lead.er && <Chip icon={Activity}>{lead.er}</Chip>}
        <Chip icon={UserRound}>{lead.people}</Chip>
      </div>

      {/* contact person */}
      <span className="absolute left-[10px] top-[127px] text-[9.3px] leading-none text-ink/90">Contact Person</span>
      <div className="absolute left-[10px] top-[145px] flex h-[32px] w-[246px] items-center justify-between rounded-[18px] bg-white px-[9px]">
        <span className="flex items-center gap-[4px]">
          <span className="h-[14px] w-[14px] rounded-full bg-gradient-to-br from-[#FFD6E7] to-[#C8B3ED]" />
          <span className="text-[10.2px] text-ink/90">{lead.contact}</span>
        </span>
        <span className="flex items-center gap-[5px]">
          <span className="flex h-[22px] w-[22px] items-center justify-center rounded-full bg-white shadow-[0_1px_4px_rgba(0,0,0,0.12)]">
            <Phone className="h-[13px] w-[13px] text-ink" strokeWidth={1.6} />
          </span>
          <img src={whatsapp} alt="WhatsApp" className="h-[22px] w-[22px]" />
        </span>
      </div>
    </div>
  );
}

/* -------------------------------- page --------------------------------- */
export default function LeadsPage() {
  const navigate = useNavigate();
  const { data } = useLeads();
  const leads = data ?? [];
  const newLeads: Lead[] = leads
    .filter((l) => l.status === "NEW")
    .slice(0, 4)
    .map((l) => ({
      id: l.id,
      agency: l.brandName,
      agencySub: "Influencer Management",
      person: l.contactPerson ?? "",
      personRole: l.personRole ?? "",
      money: l.money ?? "",
      people: String(l.peopleCount),
      contact: l.contactPerson ?? "",
      date: "12 July",
    }));
  const contacted: Lead[] = leads
    .filter((l) => l.status === "CONTACTED")
    .slice(0, 4)
    .map((l) => ({
      id: l.id,
      agency: l.brandName,
      agencySub: "Influencer Management",
      person: l.contactPerson ?? "",
      personRole: l.personRole ?? "",
      money: l.money ?? "",
      er: l.engagementRate,
      people: String(l.peopleCount),
      contact: l.contactPerson ?? "",
      date: "12 July",
    }));
  return (
    <>
      {/* WORKSPACE — 254,158 · Outfit 400 40px */}
      <h1 className="absolute left-[254px] top-[150px] text-[40px] font-normal text-ink">WORKSPACE</h1>

      {/* stat pills — 938,157 gap 35 */}
      <div className="absolute left-[938px] top-[150px] flex items-start gap-[35px]">
        <StatPill n="18" badge="10" dir="up" label="Deals" />
        <StatPill n="11" badge="5" dir="down" label="won" />
        <StatPill n="11" badge="1" dir="down" label="lost" />
      </div>

      {/* New Leads tab header */}
      <h2 className="absolute left-[284px] top-[228px] text-[34px] font-normal leading-none text-ink">New Leads</h2>
      <span className="absolute left-[554px] top-[237px] text-[24px] font-normal leading-none text-ink underline decoration-1 underline-offset-4">15 Leads</span>
      <div className="absolute left-[663px] top-[229px] flex items-center gap-[8px]">
        <CircleBtn onClick={() => navigate("/search")}><Search className="h-[22px] w-[22px]" strokeWidth={1.7} /></CircleBtn>
        <span onClick={() => navigate("/leads/new")} className="flex h-[45px] w-[48px] cursor-pointer items-center justify-center rounded-[24px] bg-white text-ink">
          <SlidersHorizontal className="h-[22px] w-[22px]" strokeWidth={1.7} />
        </span>
        <CircleBtn dark onClick={() => navigate("/leads/new")}><span className="text-[20px] font-extralight">All</span></CircleBtn>
      </div>

      {/* New Leads cards */}
      <div className="absolute left-[260px] top-[309px] flex gap-[15px]">
        {newLeads.map((l, i) => <LeadCard key={i} lead={l} />)}
      </div>

      {/* Contacted Leads search bar */}
      <div onClick={() => navigate("/search")} className="absolute left-[260px] top-[526px] flex h-[48px] w-[441px] cursor-pointer items-center gap-[8px] rounded-[24px] bg-white px-[12px]">
        <Search className="h-[22px] w-[22px] text-ink" strokeWidth={1.7} />
        <span className="text-[15px] font-light text-ink/70">Search in Contacted Leads</span>
      </div>
      <div className="absolute left-[709px] top-[527px] flex items-center gap-[8px]">
        <span onClick={() => navigate("/leads/contacted")} className="flex h-[45px] w-[48px] cursor-pointer items-center justify-center rounded-[24px] bg-white text-ink">
          <SlidersHorizontal className="h-[22px] w-[22px]" strokeWidth={1.7} />
        </span>
        <CircleBtn dark onClick={() => navigate("/leads/contacted")}><span className="text-[20px] font-extralight">All</span></CircleBtn>
      </div>

      {/* Contacted Leads cards */}
      <div className="absolute left-[260px] top-[607px] flex gap-[15px]">
        {contacted.map((l, i) => <LeadCard key={i} lead={l} />)}
      </div>
    </>
  );
}
