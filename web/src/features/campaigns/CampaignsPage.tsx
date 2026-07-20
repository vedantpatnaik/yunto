import { useState, type ReactNode } from "react";
import { ArrowUpRight, ArrowUp, Search, Phone } from "lucide-react";
import whatsapp from "@/assets/icons/whatsapp.svg";
import money from "@/assets/icons/campaigns-money.svg";
import graph from "@/assets/icons/campaigns-graph.svg";
import person from "@/assets/icons/campaigns-person.svg";
import progressStar from "@/assets/icons/campaigns-progress-star.svg";
import progress2 from "@/assets/icons/campaigns-progress2.svg";
import progress4 from "@/assets/icons/campaigns-progress4.svg";
import { useNavigate } from "react-router-dom";
import { useCampaigns, useAgencies } from "@/api/hooks";

/**
 * Super Admin — Campaigns Workspace.
 * Exact reconstruction of Figma frame 5953:48840 ("yunto campaigns"), 1440×1024.
 */

type CardData = {
  id: string;
  name: string;
  progress: string;
  budget: string;
  agencyName: string;
  agencyDescription: string;
  contactPerson: string;
  engagementRate: string;
  peopleCount: number;
};

/** budget is a raw integer (e.g. 800000) shown compactly as "800k" / "1.2M". */
function formatBudget(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}k`;
  return `${n}`;
}

/** The design uses discrete progress glyphs; map the 0-100 value onto them. */
function progressIcon(p: number): string {
  if (p >= 66) return progress4;
  if (p >= 33) return progress2;
  return progressStar;
}

/* ------------------------------ primitives ----------------------------- */
function StatChip({ icon, width, children }: { icon: string; width: string; children: ReactNode }) {
  return (
    <div className={`flex h-[24px] ${width} items-center gap-[3px] rounded-full bg-white pl-[8px] pr-[8px]`}>
      <img src={icon} alt="" className="h-[18px] w-[18px] shrink-0" />
      <span className="whitespace-nowrap text-[11px] leading-none text-black">{children}</span>
    </div>
  );
}

function CampaignCard({
  id,
  name,
  progress,
  budget,
  agencyName,
  agencyDescription,
  contactPerson,
  engagementRate,
  peopleCount,
}: CardData) {
  const navigate = useNavigate();
  return (
    <div className="relative h-[193px] w-[266px] rounded-[12px] bg-[#F5F5F5]">
      {/* arrow */}
      <span
        onClick={() => navigate(`/campaigns/detail?id=${id}`)}
        className="absolute right-[4px] top-[1px] flex h-[28px] w-[28px] items-center justify-center rounded-[16px] bg-white cursor-pointer"
      >
        <ArrowUpRight className="h-[15px] w-[15px] text-ink" strokeWidth={1.8} />
      </span>
      {/* date */}
      <span className="absolute left-[193px] top-[13px] text-[8px] leading-none text-ink/[0.47]">12 July</span>

      {/* agency header */}
      <div className="absolute left-[8px] top-[6px] flex items-center gap-[5px]">
        <span className="h-[38px] w-[38px] shrink-0 rounded-full bg-[#1C7245]" />
        <div>
          <div className="text-[12px] leading-[15px] text-ink/90">{agencyName}</div>
          <div className="text-[8px] leading-[13px] text-ink/70">{agencyDescription}</div>
        </div>
      </div>

      {/* campaign-name pill */}
      <div
        onClick={() => navigate(`/campaigns/detail?id=${id}`)}
        className="absolute left-[10px] top-[56px] flex h-[24px] w-[246px] items-center gap-[3px] rounded-full bg-white pl-[8px] pr-[8px]"
      >
        <span className="flex h-[18px] w-[18px] shrink-0 items-center justify-center">
          <span className="h-[7px] w-[7px] rounded-full bg-[#53AE4E]" />
        </span>
        <div className="flex flex-1 items-center justify-between">
          <span className="text-[11px] leading-none text-[#040404]">{name}</span>
          <img src={progress} alt="" className="h-[20px] w-[20px] shrink-0" />
        </div>
      </div>

      {/* metric chips */}
      <div className="absolute left-[10px] top-[87px] flex gap-[6px]">
        <StatChip icon={money} width="w-[74px]">{budget}</StatChip>
        <StatChip icon={graph} width="w-[74px]">{engagementRate} ER</StatChip>
        <StatChip icon={person} width="w-[60px]">{peopleCount}</StatChip>
      </div>

      {/* contact person */}
      <span className="absolute left-[10px] top-[127px] text-[9.3px] leading-none text-ink/90">Contact Person</span>
      <div className="absolute left-[10px] top-[145px] flex h-[32px] w-[246px] items-center justify-between rounded-[18px] bg-white px-[9px]">
        <span className="flex items-center gap-[4px]">
          <span className="h-[14px] w-[14px] rounded-full bg-gradient-to-br from-[#FFD6E7] to-[#C8B3ED]" />
          <span className="text-[10.2px] text-ink/90">{contactPerson}</span>
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
export default function CampaignsPage() {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState("25%");
  const { data } = useCampaigns();
  const { data: agencies } = useAgencies();
  const agencyMap = new Map((agencies ?? []).map((a) => [a.id, a]));
  const cards: CardData[] = (data ?? []).map((c) => {
    const agency = c.agencyId ? agencyMap.get(c.agencyId) : undefined;
    return {
      id: c.id,
      name: c.name,
      progress: progressIcon(c.progress),
      budget: formatBudget(c.budget),
      agencyName: agency?.name ?? "",
      agencyDescription: agency?.description ?? agency?.name ?? "",
      contactPerson: c.contactPerson ?? "",
      engagementRate: c.engagementRate ?? "",
      peopleCount: c.peopleCount ?? 0,
    };
  });
  const row1 = cards.slice(0, 4);
  const row2 = cards.slice(4, 8);

  return (
    <>
      {/* WORKSPACE — 254,158 · Outfit 400 40px */}
      <h1 className="absolute left-[254px] top-[158px] text-[40px] font-normal leading-none text-ink">WORKSPACE</h1>

      {/* top-right stats */}
      <span className="absolute left-[938px] top-[168px] text-[32px] font-normal leading-none text-ink">15min</span>
      <span className="absolute left-[1031px] top-[171px] w-[58px] text-[12px] font-light leading-[15px] text-ink/70">Response Time</span>

      <span className="absolute left-[1106px] top-[167px] text-[32px] font-normal leading-none text-ink">50%</span>
      <span className="absolute left-[1207px] top-[157px] flex h-[15px] items-center gap-[2px] rounded-[9px] bg-[#DCFF68] px-[3px] text-[12px] font-light leading-none text-ink">
        <ArrowUp className="h-[9px] w-[9px]" strokeWidth={2} />
        2%
      </span>
      <span className="absolute left-[1171px] top-[172px] w-[70px] text-[12px] font-light leading-[15px] text-ink/70">Conversion Rate</span>

      {/* search bar */}
      <div
        onClick={() => navigate("/search")}
        className="absolute left-[259px] top-[228px] flex h-[48px] w-[501px] items-center gap-[8px] rounded-[24px] bg-white px-[12px] cursor-pointer"
      >
        <Search className="h-[20px] w-[20px] text-ink" strokeWidth={1.8} />
        <span className="text-[15px] font-light text-ink/70">Search in Campaigns</span>
      </div>

      {/* filter pills */}
      <div className="absolute left-[768px] top-[230px] flex items-center gap-[8px]">
        <span
          onClick={() => setActiveFilter("All")}
          className={`flex h-[45px] w-[48px] items-center justify-center rounded-[24px] ${activeFilter === "All" ? "bg-black" : "bg-white"} text-[20px] font-extralight ${activeFilter === "All" ? "text-white" : "text-black"} cursor-pointer`}
        >
          All
        </span>
        <span
          onClick={() => setActiveFilter("25%")}
          className={`flex h-[45px] w-[78px] items-center justify-center rounded-[24px] ${activeFilter === "25%" ? "bg-black" : "bg-white"} text-[20px] font-extralight ${activeFilter === "25%" ? "text-white" : "text-black"} cursor-pointer`}
        >
          25%
        </span>
        <span
          onClick={() => setActiveFilter("50%")}
          className={`flex h-[45px] w-[78px] items-center justify-center rounded-[24px] ${activeFilter === "50%" ? "bg-black" : "bg-white"} text-[20px] font-extralight ${activeFilter === "50%" ? "text-white" : "text-black"} cursor-pointer`}
        >
          50%
        </span>
        <span
          onClick={() => setActiveFilter("100%")}
          className={`flex h-[45px] w-[78px] items-center justify-center rounded-[24px] ${activeFilter === "100%" ? "bg-black" : "bg-white"} text-[20px] font-extralight ${activeFilter === "100%" ? "text-white" : "text-black"} cursor-pointer`}
        >
          100%
        </span>
      </div>

      {/* first row of campaign cards */}
      <div className="absolute left-[259px] top-[304px] flex gap-[15px]">
        {row1.map((c) => (
          <CampaignCard
            key={c.id}
            id={c.id}
            name={c.name}
            progress={c.progress}
            budget={c.budget}
            agencyName={c.agencyName}
            agencyDescription={c.agencyDescription}
            contactPerson={c.contactPerson}
            engagementRate={c.engagementRate}
            peopleCount={c.peopleCount}
          />
        ))}
      </div>

      {/* section headings */}
      <h2 className="absolute left-[284px] top-[527px] text-[34px] font-normal leading-none text-ink">Campaigns</h2>
      <span className="absolute left-[277px] top-[575px] h-[1px] w-[259px] bg-[#D9D9D9]" />
      <span className="absolute left-[551px] top-[534px] text-[24px] font-normal leading-none text-ink underline decoration-1 underline-offset-[4px]">
        25% Progress
      </span>

      {/* second row of campaign cards */}
      <div className="absolute left-[260px] top-[601px] flex gap-[15px]">
        {row2.map((c) => (
          <CampaignCard
            key={c.id}
            id={c.id}
            name={c.name}
            progress={c.progress}
            budget={c.budget}
            agencyName={c.agencyName}
            agencyDescription={c.agencyDescription}
            contactPerson={c.contactPerson}
            engagementRate={c.engagementRate}
            peopleCount={c.peopleCount}
          />
        ))}
      </div>
    </>
  );
}
