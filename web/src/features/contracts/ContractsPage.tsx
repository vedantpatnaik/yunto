import type { LucideIcon } from "lucide-react";
import {
  Search,
  ArrowUpRight,
  Crown,
  Eye,
  Heart,
  Flame,
  Luggage,
  SprayCan,
  Shirt,
} from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useList, useCreators, useCampaigns, type Contract } from "@/api/hooks";

/**
 * Super Admin — Contracts.
 * Exact reconstruction of Figma frame 5704:54696 ("Super Admin-contracts"), 1440×1024.
 * Clean underlying page — profile popup + dim scrim (4992:21358) intentionally omitted.
 */

/* ------------------------------- data ---------------------------------- */
type TopCard = { title: string; sub: string; left: number; route: string };
const TOP_CARDS: TopCard[] = [
  { title: "Campaign Contract", sub: "An agreement that outlines terms and deliverables for a specific campaign.", left: 261, route: "/campaigns" },
  { title: "Creator Contract", sub: "Manage agreements with individual creators and performance terms.", left: 637, route: "/creators" },
  { title: "Create Contract", sub: "Quickly generate and activate new creator or campaign contracts.", left: 1013, route: "/contracts" },
];

type CampaignRow = {
  id: string;
  name: string;
  budget: string;
  status: string;
  timeline: string;
  extraPeople: number;
  icon: LucideIcon;
  top: number;
};
/* Icons + row positions are design constants, not data. */
const CAMPAIGN_ICONS: LucideIcon[] = [Luggage, SprayCan, Shirt];
const CAMPAIGN_TOPS = [478, 581, 684];
const CREATOR_TOPS = [473.5, 578.5, 683.5];

const AVATAR_GRADS = [
  "bg-gradient-to-br from-[#FFD6E7] to-[#C8B3ED]",
  "bg-gradient-to-br from-[#C8E6FF] to-[#C8B3ED]",
  "bg-gradient-to-br from-[#DCFF68] to-[#8FD694]",
  "bg-gradient-to-br from-[#FFE1B3] to-[#FF9C6D]",
];

/* --------------------------- formatters -------------------------------- */
const fmtCount = (n: number) =>
  n >= 1_000_000
    ? `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`
    : n >= 1_000
      ? `${Math.round(n / 1_000)}k`
      : `${n}`;
const fmtDate = (iso?: string) =>
  iso ? new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "____________________";
const fmtRupees = (n?: number) => (n != null ? n.toLocaleString("en-IN") : "[Amount]");
const titleCase = (s: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : "—");

type Section = { h: string; b: string };
const contractIntro = (kindLabel: string, date: string, brand: string, creator: string) =>
  `This ${kindLabel} (the "Agreement") is made and entered into on ${date} by and between [Client Name] ("Client") and [Agency Name] ("Contractor").\nBrand / Company: ${brand}\nCreator: ${creator}`;
const contractSections = (amount?: number): Section[] => [
  { h: "1. Scope of Work", b: "The Creator agrees to create and publish content as per the requirements defined by the Brand." },
  { h: "2. Deliverables", b: "The Creator will deliver:\n\n[e.g., 1 Instagram Reel]\n\n[e.g., 2 Instagram Stories]\n\n[e.g., 1 Static Post]\n\nAll content must follow brand guidelines and campaign instructions." },
  { h: "3. Timeline", b: "Content Submission Date: [Date]\n\nPublishing Date: [Date]" },
  { h: "4. Compensation", b: `Payment Amount: ₹${fmtRupees(amount)}\n\nPayment Terms: Payment will be made within [X] days after content is published and approved.\n\n5. Content Approval\nThe Brand has the right to review and request reasonable changes before publishing.` },
  { h: "7. Confidentiality", b: "The Creator agrees not to disclose contract terms or brand information." },
  { h: "8. Termination", b: "Either party may terminate this contract if agreed obligations are not fulfilled." },
  { h: "9. Acceptance", b: "By accepting this contract, both parties agree to the terms above.\n\nBrand Representative: ____________________\nCreator: ____________________\nDate: ____________________" },
];

/* ---------------------------- primitives ------------------------------- */
function SearchBar({ left, top, placeholder, onClick }: { left: number; top: number; placeholder: string; onClick?: () => void }) {
  return (
    <div
      className="absolute flex h-[30px] w-[245px] cursor-pointer items-center rounded-[15.88px] border border-black/10 bg-white pl-[11px]"
      style={{ left, top }}
      onClick={onClick}
    >
      <span className="text-[7.9px] font-light text-black/70">{placeholder}</span>
      <span className="absolute right-[1.8px] top-[1.8px] flex h-[26.5px] w-[26.5px] items-center justify-center rounded-full bg-[#E4E4E4]">
        <Search className="h-[13px] w-[13px] text-ink" strokeWidth={1.8} />
      </span>
    </div>
  );
}

function ArrowBtn({ size, iconSize }: { size: number; iconSize: number }) {
  return (
    <span
      className="flex items-center justify-center rounded-full border border-black/10 bg-white"
      style={{ width: size, height: size }}
    >
      <ArrowUpRight className="text-ink" style={{ width: iconSize, height: iconSize }} strokeWidth={1.6} />
    </span>
  );
}

function StackAvatars({ extra }: { extra: number }) {
  const offsets = [2.5, 16.8, 31.1, 41.6, 55.7];
  return (
    <>
      {offsets.map((x, i) => {
        if (i === 4 && extra <= 0) return null;
        return (
          <span
            key={i}
            className={`absolute top-[2.6px] flex h-[21.8px] w-[21.1px] items-center justify-center rounded-full border border-white ${
              i === 4 ? "bg-[#E5E5E5] text-black" : AVATAR_GRADS[i % AVATAR_GRADS.length]
            }`}
            style={{ left: x }}
          >
            {i === 4 && <span className="text-[7px] leading-none">+{extra}</span>}
          </span>
        );
      })}
    </>
  );
}

/** Empty / loading state that occupies the first row slot — same geometry as a row. */
function RowPlaceholder({ left, top, width, text }: { left: number; top: number; width: number; text: string }) {
  return (
    <div
      className="absolute flex h-[95px] items-center justify-center rounded-[10.72px] border border-[#E5E7EB] bg-white text-[11px] font-light text-black/40"
      style={{ left, top, width }}
    >
      {text}
    </div>
  );
}

/* ---------------------------- top cards -------------------------------- */
function TopCardView({ card, onClick }: { card: TopCard; onClick?: () => void }) {
  return (
    <div
      className="absolute top-[229px] h-[120px] w-[352px] cursor-pointer rounded-[24px] border border-black/10 bg-white"
      style={{ left: card.left }}
      onClick={onClick}
    >
      <div className="absolute left-[17px] top-[19px] w-[268px] text-[28px] font-normal leading-[35px] text-ink">
        {card.title}
      </div>
      <div className="absolute left-[17px] top-[65px] w-[250px] text-[14px] font-light leading-[17.6px] text-black/60">
        {card.sub}
      </div>
      <span className="absolute left-[298px] top-[67px]">
        <ArrowBtn size={34} iconSize={18} />
      </span>
    </div>
  );
}

/* -------------------------- campaign row ------------------------------- */
function CampaignRowView({ row, onClick }: { row: CampaignRow; onClick?: () => void }) {
  const Icon = row.icon;
  return (
    <div
      className="absolute left-[288px] h-[95px] w-[321px] cursor-pointer rounded-[10.72px] border border-[#E5E7EB] bg-white"
      style={{ top: row.top }}
      onClick={onClick}
    >
      {/* thumbnail */}
      <span className="absolute left-[9.4px] top-[8px] flex h-[31px] w-[31px] items-center justify-center rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,0.08)]">
        <Icon className="h-[18px] w-[18px] text-ink" strokeWidth={1.6} />
      </span>
      <div className="absolute left-[46.9px] top-[6.7px] truncate pr-[60px] text-[13.2px] font-medium leading-[21px] text-black/90">{row.name}</div>
      <div className="absolute left-[46.9px] top-[24.1px] font-inter text-[8.8px] font-normal leading-[13px] text-black/70">{row.budget}</div>

      {/* chips */}
      <span className="absolute left-[9.4px] top-[56.7px] flex h-[26.2px] w-[51.3px] items-center justify-center rounded-full border border-[#D9D9D9] bg-white text-[12px] leading-none text-ink">
        {row.status}
      </span>
      <span className="absolute left-[65.4px] top-[56.4px] flex h-[26.8px] w-[84.9px] items-center justify-center rounded-[13.4px] border border-[#D9D9D9] bg-white text-[11.2px] leading-none text-black/80">
        {row.timeline}
      </span>
      <span className="absolute left-[155.1px] top-[56.3px] h-[27px] w-[81.1px] rounded-[15.2px] border border-[#D9D9D9] bg-white">
        <StackAvatars extra={row.extraPeople} />
      </span>

      <span className="absolute left-[284px] top-[58px]">
        <ArrowBtn size={24} iconSize={13} />
      </span>
    </div>
  );
}

/* ---------------------------- stat pill -------------------------------- */
function StatPill({
  icon: Icon,
  iconColor,
  label,
  left,
  width,
  translucent,
}: {
  icon: LucideIcon;
  iconColor?: string;
  label: string;
  left: number;
  width: number;
  translucent?: boolean;
}) {
  return (
    <span
      className={`absolute top-[56px] flex h-[23px] items-center gap-[3px] rounded-[11.33px] border border-[#D9D9D9] px-[4.7px] ${
        translucent ? "bg-white/60" : "bg-white"
      }`}
      style={{ left, width }}
    >
      <Icon className="h-[12px] w-[12px] shrink-0" strokeWidth={1.6} style={{ color: iconColor ?? "rgba(0,0,0,0.8)" }} />
      <span className="truncate text-[9.4px] leading-none text-black/80">{label}</span>
    </span>
  );
}

/* --------------------------- creator row ------------------------------- */
type CreatorRow = {
  id: string;
  name: string;
  handle: string;
  followers: number;
  avgViews: number;
  engagementRate: number;
  location: string;
  top: number;
};

function CreatorRowView({ row, onClick }: { row: CreatorRow; onClick?: () => void }) {
  return (
    <div
      className="absolute left-[676px] h-[95px] w-[307px] cursor-pointer rounded-[10.72px] border border-[#E5E7EB] bg-white"
      style={{ top: row.top }}
      onClick={onClick}
    >
      {/* avatar + fire */}
      <span className="absolute left-[9.4px] top-[8px] h-[32.6px] w-[32.6px]">
        <span className="absolute left-0 top-[1px] h-[31px] w-[31px] rounded-full bg-gradient-to-br from-[#FFD6E7] to-[#C8B3ED]" />
        <Flame className="absolute left-[21px] top-[17px] h-[14px] w-[14px]" fill="#FF7A45" color="#FF4D2E" strokeWidth={1} />
      </span>
      <div className="absolute left-[46.9px] top-[6.7px] truncate pr-[80px] text-[13.2px] font-medium leading-[21px] text-black/90">{row.name}</div>
      <div className="absolute left-[46.9px] top-[24.1px] font-inter text-[8.8px] font-normal leading-[13px] text-black/70">{row.handle}</div>

      {/* stats */}
      <StatPill icon={Crown} label={fmtCount(row.followers)} left={9} width={55} translucent />
      <StatPill icon={Eye} iconColor="#2CC37F" label={`${fmtCount(row.avgViews)} Avg. views`} left={68} width={98} />
      <StatPill icon={Heart} label={`${row.engagementRate}% ER`} left={170} width={66} translucent />

      {/* location */}
      <span className="absolute left-[243px] top-[9px] flex h-[20px] w-[55px] items-center justify-center gap-[2px] rounded-[12px] border border-[#D9D9D9] bg-white/60">
        <span className="text-[10px] leading-none">📍</span>
        <span className="truncate text-[10.2px] leading-none text-ink">{row.location}</span>
      </span>
    </div>
  );
}

/* -------------------------- contract preview --------------------------- */
function ContractPreview({ kindLabel, intro, sections }: { kindLabel: string; intro: string; sections: Section[] }) {
  return (
    <>
      {/* outer device panel */}
      <div className="absolute left-[1039px] top-[473.5px] h-[469px] w-[299px] rounded-[11px] bg-[rgba(232,238,255,0.55)]" />
      <div className="absolute left-[1049.5px] top-[486.4px] text-[15.7px] font-normal leading-[28.8px] text-ink">{kindLabel}</div>

      {/* Edit pill */}
      <span className="absolute left-[1250.2px] top-[483.8px] flex h-[33.5px] w-[77.3px] items-center justify-center rounded-full border border-black/5 bg-white text-[15.5px] font-light text-[#121212] shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
        Edit
      </span>

      {/* white screen */}
      <div className="absolute left-[1051.9px] top-[523.7px] h-[400.4px] w-[275.5px] rounded-[10.5px] bg-white" />
      {/* contract paper */}
      <div className="absolute left-[1062.2px] top-[544.3px] h-[361.2px] w-[255.2px] overflow-hidden rounded-[15.45px] border border-[#A9CEE6] bg-white" />

      {/* paper content */}
      <div className="absolute left-[1162.1px] top-[570.9px] text-[6.9px] font-bold leading-[8.6px] text-[#0A2540]">{kindLabel}</div>
      <div className="absolute left-[1096.5px] top-[588.5px] w-[186.6px] whitespace-pre-line text-[4.3px] font-normal leading-[5.4px] text-[#0A2540]">
        {intro}
      </div>
      <div className="absolute left-[1096.5px] top-[618.1px] flex w-[186.6px] flex-col gap-[8.58px]">
        {sections.map((s) => (
          <div key={s.h} className="flex flex-col gap-[4.29px]">
            <div className="text-[5.1px] font-bold leading-[6.5px] text-[#0A2540]">{s.h}</div>
            <div className="whitespace-pre-line text-[4.3px] font-normal leading-[5.4px] text-[#0A2540]">{s.b}</div>
          </div>
        ))}
      </div>

      {/* Preview pill */}
      <span className="absolute left-[1229px] top-[871px] flex h-[25px] w-[80.3px] items-center justify-center gap-[3.8px] rounded-full border border-black/5 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
        <Eye className="h-[15px] w-[15px] text-[#121212]" strokeWidth={1.6} />
        <span className="text-[11.7px] font-light text-[#121212]">Preview</span>
      </span>
    </>
  );
}

/* -------------------------------- page --------------------------------- */
export default function ContractsPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { data: contractData, isLoading: contractsLoading } = useList<Contract & { createdAt: string }>("contracts");
  const { data: creatorData, isLoading: creatorsLoading } = useCreators();
  const { data: campaignData } = useCampaigns();

  const contracts = contractData ?? [];
  const creators = creatorData ?? [];
  const campaigns = campaignData ?? [];

  const campaignRows: CampaignRow[] = contracts
    .filter((c) => c.kind === "CAMPAIGN")
    .slice(0, 3)
    .map((c, i) => {
      const campaign = campaigns.find((cp) => cp.id === c.campaignId);
      return {
        id: c.campaignId ?? c.id,
        name: c.title,
        budget: c.amount != null ? `Budget ₹${(c.amount / 100_000).toFixed(1)}L` : "Budget",
        status: titleCase(c.status),
        timeline: campaign?.timeline ?? "—",
        extraPeople: Math.max((campaign?.peopleCount ?? 0) - 4, 0),
        icon: CAMPAIGN_ICONS[i % CAMPAIGN_ICONS.length],
        top: CAMPAIGN_TOPS[i],
      };
    });

  /* Contract has no creator relation in the schema, so the "Creators Contract"
     list is driven by real Creator records — name, handle and every stat pill
     therefore come from one and the same record. */
  const creatorRows: CreatorRow[] = creators.slice(0, 3).map((c, i) => ({
    id: c.id,
    name: c.name,
    handle: c.handle,
    followers: c.followers,
    avgViews: c.avgViews,
    engagementRate: c.engagementRate,
    location: c.location ?? "—",
    top: CREATOR_TOPS[i],
  }));

  /* Selected contract drives the document preview (?id=… → first contract). */
  const selected = contracts.find((c) => c.id === params.get("id")) ?? contracts[0];
  const kindLabel = selected?.kind === "CAMPAIGN" ? "Campaign Contract" : "Creator Contract";
  const selectedCampaign = campaigns.find((cp) => cp.id === selected?.campaignId);
  const intro = contractIntro(
    kindLabel,
    fmtDate(selected?.createdAt),
    selectedCampaign?.brandName ?? "[Brand Name]",
    /* Contract has no creator relation — stays a template blank rather than a wrong name. */
    "[Creator Name]",
  );

  return (
    <>
      {/* CONTRACTS heading */}
      <h1 className="absolute left-[260px] top-[153px] text-[40px] font-normal leading-none text-ink">CONTRACTS</h1>

      {/* top three cards */}
      {TOP_CARDS.map((c) => (
        <TopCardView key={c.title} card={c} onClick={() => navigate(c.route)} />
      ))}

      {/* Campaigns Contract card */}
      <div className="absolute left-[264px] top-[374px] h-[589px] w-[369px] rounded-[24px] border border-[#D4D4D4] bg-white/[0.81] shadow-[0_10px_40px_rgba(0,0,0,0.04)]" />
      <div className="absolute left-[305px] top-[398px] text-[20px] font-normal leading-[24px] text-ink">Campaigns Contract</div>
      <SearchBar left={288} top={438} placeholder="Search creators, campaigns" onClick={() => navigate("/search")} />
      {campaignRows.length === 0 ? (
        <RowPlaceholder
          left={288}
          top={CAMPAIGN_TOPS[0]}
          width={321}
          text={contractsLoading ? "Loading contracts…" : "No campaign contracts yet"}
        />
      ) : (
        campaignRows.map((r) => (
          <CampaignRowView key={r.id} row={r} onClick={() => navigate(`/campaigns/detail?id=${r.id}`)} />
        ))
      )}

      {/* Creators Contract card */}
      <div className="absolute left-[654px] top-[375.5px] h-[589px] w-[711px] rounded-[24px] border border-[#D4D4D4] bg-white/[0.81] shadow-[0_10px_40px_rgba(0,0,0,0.04)]" />
      <div className="absolute left-[702px] top-[394.5px] text-[20px] font-normal leading-[24px] text-ink">Creators Contract</div>
      <div className="absolute left-[1132px] top-[394.5px] text-[20px] font-normal leading-[24px] text-ink">Contract</div>
      <SearchBar left={676} top={434.5} placeholder="Search creators" onClick={() => navigate("/search")} />
      {/* vertical divider */}
      <div className="absolute left-[1007px] top-[448.5px] h-[444px] w-px bg-[#E2E2E2]" />
      {creatorRows.length === 0 ? (
        <RowPlaceholder
          left={676}
          top={CREATOR_TOPS[0]}
          width={307}
          text={creatorsLoading ? "Loading creators…" : "No creators yet"}
        />
      ) : (
        creatorRows.map((r) => (
          <CreatorRowView key={r.id} row={r} onClick={() => navigate(`/creators/detail?id=${r.id}`)} />
        ))
      )}

      <ContractPreview kindLabel={kindLabel} intro={intro} sections={contractSections(selected?.amount)} />
    </>
  );
}
