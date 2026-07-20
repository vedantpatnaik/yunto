import { useMemo, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { User, Box, Filter, X, Plus, ArrowUpRight, Phone } from "lucide-react";
import whatsapp from "@/assets/icons/whatsapp.svg";
import { useCreators, useLeads, useCampaigns } from "@/api/hooks";

/**
 * Super Admin — Global Search.
 * Exact reconstruction of Figma frame 5047:38058 ("Super Admin-search"), 1440×1024.
 * Clean underlying page — profile popup / dim scrim intentionally omitted.
 * TopBar + Sidebar are provided by AppShell and are NOT rendered here.
 */

type CardData = { name: string; role: string; leadName: string; source: string; intent: string };

/** Fixed layout coordinates for the three visible result cards (Figma). */
const SLOTS = [
  { left: 244, top: 335 },
  { left: 525, top: 334 },
  { left: 806, top: 334 },
];

/** "HIGH" -> "High", "CONTACTED" -> "Contacted". */
const titleCase = (s: string) => (s ? s.charAt(0) + s.slice(1).toLowerCase() : s);

/* ------------------------------ primitives ----------------------------- */
/** Phosphor "FunnelSimple" — three horizontal lines decreasing in width. */
function FunnelSimple({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className={className}>
      <line x1="3" y1="8" x2="21" y2="8" strokeWidth="2" strokeLinecap="round" />
      <line x1="6" y1="12" x2="18" y2="12" strokeWidth="2" strokeLinecap="round" />
      <line x1="9" y1="16" x2="15" y2="16" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function TagChip({ children }: { children: ReactNode }) {
  return (
    <span className="flex h-[24px] items-center rounded-full bg-white px-[8px] text-[11px] text-black">
      {children}
    </span>
  );
}

function LeadCard({ data, left, top }: { data: CardData; left: number; top: number }) {
  const navigate = useNavigate();
  return (
    <div
      className="absolute h-[193px] w-[266px] cursor-pointer rounded-[12px] bg-[#F5F5F5]"
      style={{ left, top }}
      onClick={() => navigate("/leads/detail")}
    >
      {/* open-in arrow (sits in top-right notch) */}
      <span className="absolute right-[4px] top-[-1px] flex h-[28px] w-[28px] items-center justify-center rounded-[16px] bg-white">
        <ArrowUpRight className="h-[15px] w-[15px] text-ink" strokeWidth={1.8} />
      </span>
      {/* date */}
      <span className="absolute left-[193px] top-[13px] text-[8px] leading-none text-ink/[0.47]">12 July</span>

      {/* assignee header */}
      <div className="absolute left-[8px] top-[6px] flex items-center gap-[5px]">
        <span className="h-[38px] w-[38px] shrink-0 rounded-full bg-gradient-to-br from-[#C8E6FF] to-[#C8B3ED]" />
        <div>
          <div className="text-[12px] leading-[15px] text-ink/90">{data.name}</div>
          <div className="text-[8px] leading-[13px] text-ink/70">{data.role}</div>
        </div>
      </div>

      {/* lead name */}
      <span className="absolute left-[17px] top-[60px] text-[17px] font-normal leading-[27px] text-ink/90">{data.leadName}</span>

      {/* contact actions */}
      <div className="absolute left-[133px] top-[64px] flex items-center gap-[5px]">
        <span className="flex h-[22px] w-[22px] items-center justify-center rounded-full bg-white">
          <Phone className="h-[13px] w-[13px] text-black" strokeWidth={1.6} />
        </span>
        <img src={whatsapp} alt="WhatsApp" className="h-[22px] w-[22px]" />
      </div>

      {/* tags */}
      <div className="absolute left-[11px] top-[95px] flex items-center gap-[8px]">
        <TagChip>Zostel Trip</TagChip>
        <TagChip>Budget ₹1.2L</TagChip>
        <TagChip>Paid</TagChip>
      </div>

      {/* source */}
      <span className="absolute left-[17px] top-[131px] text-[9.3px] leading-none text-ink/90">Source</span>
      <div className="absolute left-[8px] top-[149px] flex h-[32px] w-[111px] items-center gap-[4px] rounded-[18px] border-[0.5px] border-[#D9D9D9] bg-white px-[9px]">
        <span className="h-[14px] w-[14px] shrink-0 rounded-full bg-gradient-to-br from-[#FFD6E7] to-[#C8B3ED]" />
        <span className="text-[10.2px] text-ink/90">{data.source}</span>
      </div>

      {/* intent meter */}
      <span className="absolute left-[151px] top-[131px] text-[9.3px] leading-none text-ink/90">{data.intent}</span>
      <div className="absolute left-[139px] top-[149px] flex h-[32px] w-[111px] items-center rounded-[18px] border-[0.5px] border-[#D9D9D9] bg-white px-[12px]">
        <div className="flex gap-[4px]">
          {[0, 1, 2, 3, 4].map((i) => (
            <span key={i} className="h-[20px] w-[14px] rounded-[8px] bg-[#EAEAEA]" />
          ))}
        </div>
      </div>
    </div>
  );
}

/* -------------------------------- page --------------------------------- */
export default function SearchPage() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState("Leads");
  const [hiddenFilters, setHiddenFilters] = useState<string[]>([]);

  const { data: creators = [] } = useCreators();
  const { data: leads = [] } = useLeads();
  const { data: campaigns = [] } = useCampaigns();

  // Real, per-category results — a few rows each, mapped so every card varies.
  const results = useMemo<CardData[]>(() => {
    if (activeCategory === "Creators")
      return creators.slice(0, 3).map((c) => ({
        name: c.handle,
        role: c.niche ?? "Creator",
        leadName: c.name,
        source: c.location ?? "",
        intent: `${c.matchPct ?? Math.round(c.stars * 20)}% Match`,
      }));
    if (activeCategory === "Campaigns")
      return campaigns.slice(0, 3).map((c) => ({
        name: c.contactPerson ?? "",
        role: titleCase(c.status),
        leadName: c.brandName,
        source: c.name,
        intent: titleCase(c.status),
      }));
    return leads.slice(0, 3).map((l) => ({
      name: l.contactPerson ?? "",
      role: l.personRole ?? "sales",
      leadName: l.brandName,
      source: titleCase(l.status),
      intent: `${titleCase(l.intent)} Intent`,
    }));
  }, [activeCategory, creators, campaigns, leads]);

  return (
    <>
      {/* category tabs */}
      <div
        onClick={() => setActiveCategory("All Results")}
        className={`absolute left-[241px] top-[139px] flex h-[45px] w-[160px] cursor-pointer items-center justify-center rounded-[24px] ${
          activeCategory === "All Results" ? "bg-black/95" : "bg-white/95"
        }`}
      >
        <span className={`text-[20px] font-light ${activeCategory === "All Results" ? "text-white" : "text-ink/70"}`}>All Results</span>
      </div>
      <div
        onClick={() => setActiveCategory("Creators")}
        className={`absolute left-[411px] top-[139px] flex h-[45px] w-[160px] cursor-pointer items-center justify-center gap-[4px] rounded-[24px] ${
          activeCategory === "Creators" ? "bg-black/95" : "bg-white/95"
        }`}
      >
        <User className={`h-[22px] w-[22px] ${activeCategory === "Creators" ? "text-white" : "text-ink/60"}`} strokeWidth={1.6} />
        <span className={`text-[20px] font-light ${activeCategory === "Creators" ? "text-white" : "text-ink/70"}`}>Creators</span>
      </div>
      <div
        onClick={() => setActiveCategory("Campaigns")}
        className={`absolute left-[581px] top-[139px] flex h-[45px] w-[160px] cursor-pointer items-center justify-center gap-[4px] rounded-[24px] ${
          activeCategory === "Campaigns" ? "bg-black/95" : "bg-white/95"
        }`}
      >
        <Box className={`h-[22px] w-[22px] ${activeCategory === "Campaigns" ? "text-white" : "text-ink/60"}`} strokeWidth={1.6} />
        <span className={`text-[20px] font-light ${activeCategory === "Campaigns" ? "text-white" : "text-ink/70"}`}>Campaigns</span>
      </div>
      <div
        onClick={() => setActiveCategory("Leads")}
        className={`absolute left-[751px] top-[139px] flex h-[45px] w-[160px] cursor-pointer items-center justify-center gap-[4px] rounded-[24px] ${
          activeCategory === "Leads" ? "bg-black/95" : "bg-white/95"
        }`}
      >
        <FunnelSimple className={`h-[20px] w-[20px] ${activeCategory === "Leads" ? "text-white" : "text-ink/60"}`} />
        <span className={`text-[20px] font-light ${activeCategory === "Leads" ? "text-white" : "text-ink/70"}`}>Leads</span>
      </div>

      {/* subtle divider */}
      <div className="absolute left-[242px] top-[195px] h-px w-[1198px] bg-[#F9F9F9]" />

      {/* sort / filter bar */}
      <div className="absolute left-[249px] top-[215px] h-[48px] w-[823px] rounded-[24px] bg-white" />
      <div className="absolute left-[266px] top-[231px] flex items-center gap-[8px]">
        <Filter className="h-[12px] w-[12px] text-[#0F0F14]/70" strokeWidth={1.7} />
        <span className="font-inter text-[10px] font-semibold tracking-[0.4px] text-[#0F0F14]/70">SORT BY:</span>
      </div>

      {/* filter chips */}
      {!hiddenFilters.includes("assignee") && (
        <div className="absolute left-[353px] top-[224px] flex h-[30px] w-[164px] items-center gap-[8px] rounded-[16px] border border-[#D1D1D1] px-[12px]">
          <span className="font-inter text-[10px] font-medium text-[#959595]">Assignee:</span>
          <span className="font-inter text-[12px] font-medium text-ink/70">Operations</span>
          <X
            onClick={() => setHiddenFilters((prev) => [...prev, "assignee"])}
            className="ml-auto h-[10px] w-[10px] cursor-pointer text-ink/40"
            strokeWidth={2}
          />
        </div>
      )}
      {!hiddenFilters.includes("status") && (
        <div className="absolute left-[524px] top-[224px] flex h-[30px] w-[111px] items-center gap-[8px] rounded-[16px] border border-[#D1D1D1] px-[12px]">
          <span className="font-inter text-[10px] font-medium text-[#959595]">Status</span>
          <span className="font-inter text-[12px] font-medium text-ink/70">New</span>
          <X
            onClick={() => setHiddenFilters((prev) => [...prev, "status"])}
            className="ml-auto h-[10px] w-[10px] cursor-pointer text-ink/40"
            strokeWidth={2}
          />
        </div>
      )}
      {!hiddenFilters.includes("created") && (
        <div className="absolute left-[642px] top-[224px] flex h-[30px] w-[152px] items-center gap-[8px] rounded-[16px] border border-[#D1D1D1] px-[12px]">
          <span className="font-inter text-[10px] font-medium text-[#959595]">Created:</span>
          <span className="font-inter text-[12px] font-medium text-ink/70">This week</span>
          <X
            onClick={() => setHiddenFilters((prev) => [...prev, "created"])}
            className="ml-auto h-[10px] w-[10px] cursor-pointer text-ink/40"
            strokeWidth={2}
          />
        </div>
      )}
      <div
        onClick={() => setHiddenFilters([])}
        className="absolute left-[856px] top-[224px] flex h-[30px] w-[93px] cursor-pointer items-center gap-[8px] rounded-[16px] border border-[#D1D1D1] px-[12px]"
      >
        <Plus className="h-[12px] w-[12px] text-[#959595]" strokeWidth={2} />
        <span className="font-inter text-[10px] font-medium text-[#959595]">Add Filter</span>
      </div>
      <span
        onClick={() => setHiddenFilters(["assignee", "status", "created"])}
        className="absolute left-[980px] top-[231px] cursor-pointer font-inter text-[10px] font-semibold uppercase tracking-[0.4px] text-[#6366F1]"
      >
        Clear All
      </span>

      {/* section header */}
      <span className="absolute left-[244px] top-[288px] text-[20px] font-light uppercase text-ink/70">New Leads</span>
      <span
        onClick={() => navigate("/leads")}
        className="absolute left-[1006px] top-[292px] cursor-pointer text-[15px] font-light text-ink/70"
      >
        View All
      </span>

      {/* result cards */}
      {results.map((data, i) => (
        <LeadCard key={i} data={data} left={SLOTS[i].left} top={SLOTS[i].top} />
      ))}
    </>
  );
}
