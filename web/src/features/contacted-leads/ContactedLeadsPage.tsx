import type { LucideIcon } from "lucide-react";
import {
  Search,
  Plus,
  Download,
  ArrowUp,
  ArrowDown,
  Wallet,
  Zap,
  Calendar,
  Users,
  ChevronDown,
  Phone,
} from "lucide-react";
import whatsapp from "@/assets/icons/whatsapp.svg";
import cosmeticIcon from "@/assets/icons/contacted-leads-cosmetic.svg";
import hangerIcon from "@/assets/icons/contacted-leads-hanger.svg";
import luggageIcon from "@/assets/icons/contacted-leads-luggage.svg";
import filterIcon from "@/assets/icons/contacted-leads-filter.svg";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLeads } from "@/api/hooks";

/**
 * Super Admin — Contacted Leads (Leads sub-flow).
 * Exact reconstruction of Figma frame 5740:73258, 1440×1024.
 * Built CLEAN — the profile popup + dim scrim siblings are intentionally omitted.
 */

/* ------------------------------ primitives ----------------------------- */
function StatPill({ n, badge, dir, label }: { n: string; badge: string; dir: "up" | "down"; label: string }) {
  return (
    <div className="flex items-start">
      <span className="text-[48px] font-normal leading-[0.9] text-ink">{n}</span>
      <div className="ml-[3px] mt-[6px] flex flex-col gap-[11px]">
        <span
          className={`flex h-[15px] items-center gap-[2px] rounded-[9px] px-[3px] text-[12px] font-light text-ink ${
            dir === "up" ? "bg-[#DCFF68]" : "bg-[#FFB0B1]"
          }`}
        >
          {dir === "up" ? (
            <ArrowUp className="h-[9px] w-[9px]" strokeWidth={2} />
          ) : (
            <ArrowDown className="h-[9px] w-[9px]" strokeWidth={2} />
          )}
          {badge}
        </span>
        <span className="text-[12px] font-light leading-none text-ink/70">{label}</span>
      </div>
    </div>
  );
}

function DropChip({ icon: Icon, label, left, w }: { icon: LucideIcon; label: string; left: number; w: number }) {
  return (
    <div
      className="absolute flex h-[32px] items-center gap-[6px] rounded-[16px] bg-white px-[12px]"
      style={{ left, top: 361, width: w }}
    >
      <Icon className="h-[14px] w-[14px] text-[#64748B]" strokeWidth={1.8} />
      <span className="font-inter text-[12px] font-semibold leading-none text-[#334155]">{label}</span>
      <ChevronDown className="h-[14px] w-[14px] text-[#94A3B8]" strokeWidth={2} />
    </div>
  );
}

type CardData = {
  id: string;
  top: number;
  icon: string;
  title: string;
  badge: string;
  badgeBg: string;
  badgeColor: string;
  subtitle: string;
  budget: string;
};

function LeadCard({ data, onClick }: { data: CardData; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      className="absolute left-[258px] h-[92px] w-[1104px] cursor-pointer rounded-[24px] border border-[#E2E8F0] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.05)]"
      style={{ top: data.top }}
    >
      {/* brand icon circle */}
      <span className="absolute left-[23px] top-[25px] flex h-[42px] w-[42px] items-center justify-center rounded-full border border-black/10 bg-white">
        <img src={data.icon} alt="" className="h-[26px] w-[26px]" />
      </span>

      {/* title + intent badge */}
      <div className="absolute left-[91px] top-[21px] flex h-[28px] items-center gap-[8px]">
        <span className="font-inter text-[18px] font-bold leading-[28px] text-[#0F172A]">{data.title}</span>
        <span
          className="flex h-[19px] items-center rounded-[8px] px-[8px] font-inter text-[10px] font-bold uppercase leading-[15px]"
          style={{ backgroundColor: data.badgeBg, color: data.badgeColor }}
        >
          {data.badge}
        </span>
      </div>

      {/* subtitle */}
      <span className="absolute left-[91px] top-[51px] font-inter text-[14px] font-normal leading-[20px] text-[#64748B]">
        {data.subtitle}
      </span>

      {/* budget block with side dividers */}
      <div className="absolute left-[856px] top-[22px] flex h-[48px] w-[96px] flex-col justify-center gap-[4px] border-x border-[#F0EDFF] px-[24px]">
        <span className="font-inter text-[12px] font-medium leading-[16px] text-[#94A3B8]">Budget</span>
        <span className="font-inter text-[18px] font-bold leading-[28px] text-[#0F172A]">{data.budget}</span>
      </div>

      {/* call button */}
      <span className="absolute left-[976px] top-[22px] flex h-[48px] w-[48px] items-center justify-center rounded-full border border-[#D2D2D2] bg-white">
        <Phone className="h-[22px] w-[22px] text-black" strokeWidth={1.6} />
      </span>

      {/* whatsapp */}
      <img src={whatsapp} alt="WhatsApp" className="absolute left-[1035px] top-[22px] h-[48px] w-[48px]" />
    </div>
  );
}

/* per-card brand icon rotation + intent → badge styling (from the Figma cards) */
const CARD_ICONS = [cosmeticIcon, hangerIcon, luggageIcon];

const INTENT_STYLE: Record<string, { badge: string; badgeBg: string; badgeColor: string }> = {
  HIGH: { badge: "High intent", badgeBg: "#D1FAE5", badgeColor: "#059669" },
  MEDIUM: { badge: "Medium intent", badgeBg: "#F0EDFF", badgeColor: "#64748B" },
  LOW: { badge: "Low Intent", badgeBg: "#F0EDE8", badgeColor: "#2563EB" },
};

/* -------------------------------- page --------------------------------- */
export default function ContactedLeadsPage() {
  const navigate = useNavigate();
  const [intentFilter, setIntentFilter] = useState("All");
  const [categoryTab, setCategoryTab] = useState("All");
  const { data } = useLeads();
  const cards: CardData[] = (data ?? [])
    .filter((l) => l.status === "CONTACTED")
    .slice(0, 3)
    .map((l, i) => {
      const style = INTENT_STYLE[l.intent] ?? INTENT_STYLE.MEDIUM;
      return {
        id: l.id,
        top: 457 + i * 108,
        icon: CARD_ICONS[i % CARD_ICONS.length],
        title: l.brandName,
        badge: style.badge,
        badgeBg: style.badgeBg,
        badgeColor: style.badgeColor,
        subtitle: [l.contactPerson, l.engagementRate].filter(Boolean).join(" • "),
        budget: l.money ? `₹${l.money}` : "",
      };
    });

  return (
    <>
      {/* WORKSPACE */}
      <h1 className="absolute left-[258px] top-[150px] text-[40px] font-normal text-ink">WORKSPACE</h1>

      {/* New lead + Leads header buttons */}
      <button
        onClick={() => navigate("/leads/create-paid")}
        className="absolute left-[529px] top-[148px] flex h-[45px] w-[115px] cursor-pointer items-center justify-center gap-[10px] rounded-[28px] bg-[rgba(0,0,0,0.9)] text-white"
      >
        <span className="text-[14px] font-light">New lead</span>
        <Plus className="h-[18px] w-[18px]" strokeWidth={2} />
      </button>
      <button
        onClick={() => navigate("/leads/download")}
        className="absolute left-[650px] top-[148px] flex h-[45px] w-[106px] cursor-pointer items-center justify-center gap-[8px] rounded-[24px] bg-[#181819] text-white"
      >
        <span className="text-[14px] font-light">Leads</span>
        <Download className="h-[18px] w-[18px]" strokeWidth={1.8} />
      </button>

      {/* stat pills */}
      <div className="absolute left-[938px] top-[150px] flex items-start gap-[35px]">
        <StatPill n="18" badge="10" dir="up" label="Deals" />
        <StatPill n="11" badge="5" dir="down" label="won" />
        <StatPill n="11" badge="1" dir="down" label="lost" />
      </div>

      {/* search bar */}
      <div
        onClick={() => navigate("/search")}
        className="absolute left-[259px] top-[228px] flex h-[48px] w-[442px] cursor-pointer items-center gap-[8px] rounded-[24px] border border-[#E6E6E6] bg-white px-[12px]"
      >
        <Search className="h-[22px] w-[22px] text-black" strokeWidth={1.7} />
        <span className="text-[15px] font-light text-ink/70">Search in Contacted leads</span>
      </div>

      {/* filter icon button */}
      <span className="absolute left-[709px] top-[229px] flex h-[45px] w-[48px] items-center justify-center rounded-[24px] border border-[#E6E6E6] bg-white">
        <img src={filterIcon} alt="Filter" className="h-[24px] w-[24px]" />
      </span>

      {/* intent toggle chips */}
      <span
        onClick={() => setIntentFilter("All")}
        className={`absolute left-[765px] top-[229px] flex h-[45px] w-[47px] cursor-pointer items-center justify-center rounded-[24px] text-[20px] font-extralight ${intentFilter === "All" ? "bg-black text-white" : "border border-black bg-white text-black"}`}
      >
        All
      </span>
      <span
        onClick={() => setIntentFilter("High Intent")}
        className={`absolute left-[820px] top-[229px] flex h-[45px] w-[124px] cursor-pointer items-center justify-center rounded-[24px] text-[20px] font-extralight ${intentFilter === "High Intent" ? "bg-black text-white" : "border border-black bg-white text-black"}`}
      >
        High Intent
      </span>
      <span
        onClick={() => setIntentFilter("Low Intent")}
        className={`absolute left-[952px] top-[229px] flex h-[45px] w-[124px] cursor-pointer items-center justify-center rounded-[24px] text-[20px] font-extralight ${intentFilter === "Low Intent" ? "bg-black text-white" : "border border-black bg-white text-black"}`}
      >
        Low Intent
      </span>
      <span
        onClick={() => setIntentFilter("Medium Intent")}
        className={`absolute left-[1084px] top-[229px] flex h-[45px] w-[154px] cursor-pointer items-center justify-center rounded-[24px] text-[20px] font-extralight ${intentFilter === "Medium Intent" ? "bg-black text-white" : "border border-black bg-white text-black"}`}
      >
        Medium Intent
      </span>
      <span
        onClick={() => setIntentFilter("Dead")}
        className={`absolute left-[1246px] top-[229px] flex h-[45px] w-[124px] cursor-pointer items-center justify-center rounded-[24px] text-[20px] font-extralight ${intentFilter === "Dead" ? "bg-black text-white" : "border border-black bg-white text-black"}`}
      >
        Dead
      </span>

      {/* category tab pills */}
      <span
        onClick={() => setCategoryTab("All")}
        className={`absolute left-[259px] top-[300px] flex h-[38px] w-[59px] cursor-pointer items-center justify-center rounded-full text-[14px] ${categoryTab === "All" ? "border border-[#E2E8F0] bg-[#0F0F0F] font-medium text-[#F9F9F9]" : "border border-[#DDDDDD] bg-white font-normal text-[#0F172A]"}`}
      >
        All
      </span>
      <span
        onClick={() => setCategoryTab("Leads")}
        className={`absolute left-[326px] top-[300px] flex h-[38px] w-[80px] cursor-pointer items-center justify-center rounded-full text-[14px] ${categoryTab === "Leads" ? "border border-[#E2E8F0] bg-[#0F0F0F] font-medium text-[#F9F9F9]" : "border border-[#DDDDDD] bg-white font-normal text-[#0F172A]"}`}
      >
        Leads
      </span>
      <span
        onClick={() => setCategoryTab("Sales Team")}
        className={`absolute left-[414px] top-[300px] flex h-[38px] w-[112px] cursor-pointer items-center justify-center rounded-full text-[14px] ${categoryTab === "Sales Team" ? "border border-[#E2E8F0] bg-[#0F0F0F] font-medium text-[#F9F9F9]" : "border border-[#DDDDDD] bg-white font-normal text-[#0F172A]"}`}
      >
        Sales Team
      </span>
      <span
        onClick={() => setCategoryTab("Follow-ups")}
        className={`absolute left-[534px] top-[300px] flex h-[38px] w-[110px] cursor-pointer items-center justify-center rounded-full text-[14px] ${categoryTab === "Follow-ups" ? "border border-[#E2E8F0] bg-[#0F0F0F] font-medium text-[#F9F9F9]" : "border border-[#DDDDDD] bg-white font-normal text-[#0F172A]"}`}
      >
        Follow-ups
      </span>
      <span
        onClick={() => setCategoryTab("Dead Leads")}
        className={`absolute left-[652px] top-[300px] flex h-[38px] w-[117px] cursor-pointer items-center justify-center rounded-full text-[14px] ${categoryTab === "Dead Leads" ? "border border-[#E2E8F0] bg-[#0F0F0F] font-medium text-[#F9F9F9]" : "border border-[#DDDDDD] bg-white font-normal text-[#0F172A]"}`}
      >
        Dead Leads
      </span>

      {/* secondary dropdown filters */}
      <DropChip icon={Wallet} label="Budget" left={259} w={106} />
      <DropChip icon={Zap} label="Intent" left={381} w={99} />
      <DropChip icon={Calendar} label="Date" left={496} w={92} />
      <DropChip icon={Users} label="Assigned To" left={604} w={136} />

      {/* clear all filters */}
      <span
        onClick={() => {
          setIntentFilter("All");
          setCategoryTab("All");
        }}
        className="absolute left-[798px] top-[353px] flex h-[44px] w-[156px] cursor-pointer items-center justify-center rounded-[24px] border border-[#4F5457] text-[14px] font-normal text-[#191919]"
      >
        Clear All Filters
      </span>

      {/* results header */}
      <span className="absolute left-[266px] top-[421px] font-inter text-[14px] font-bold uppercase tracking-[0.04em] leading-[20px] text-[#64748B]">
        Showing 3 results
      </span>
      <div className="absolute left-[1173px] top-[421px] flex items-center gap-[8px]">
        <span className="font-inter text-[14px] font-normal leading-[20px] text-[#94A3B8]">Sort by:</span>
        <span className="flex items-center gap-[4px]">
          <span className="font-inter text-[14px] font-medium leading-[20px] text-[#0F172A]">Recent Activity</span>
          <ChevronDown className="h-[14px] w-[14px] text-[#0F172A]" strokeWidth={2} />
        </span>
      </div>

      {/* contacted lead cards */}
      {cards.map((c) => (
        <LeadCard key={c.top} data={c} onClick={() => navigate(`/leads/detail?id=${c.id}`)} />
      ))}
    </>
  );
}
