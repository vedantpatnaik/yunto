import { useState } from "react";
import type { ReactNode } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import type { LucideIcon } from "lucide-react";
import { useCreators, useAgencies, useCampaigns } from "@/api/hooks";
import type { Creator, Agency } from "@/api/hooks";
import {
  Search,
  ChevronDown,
  ChevronLeft,
  ArrowUpRight,
  X,
  Plus,
  Trash2,
  UserRoundPlus,
  Link2,
  FileSpreadsheet,
  Users,
  Eye,
  Heart,
  Star,
  Sparkles,
  MapPin,
  Check,
  Coins,
  LoaderCircle,
} from "lucide-react";

/**
 * Super Admin — Campaign detail creator list (Campaigns sub-flow).
 * Exact reconstruction of Figma frame 5806:31927 ("Super Admin- Campaigns detail - cr"), 1440×1024.
 * CLEAN build: the captured frame had the TopBar profile popup + dim scrim open — those
 * sibling nodes (5806:32828 popup/scrim, 5806:32681 overlay) are intentionally skipped.
 */

const CARDS: { x: number; y: number }[] = [
  { x: 275, y: 424 },
  { x: 556, y: 424 },
  { x: 837, y: 424 },
  { x: 1118, y: 424 },
  { x: 275, y: 633 },
  { x: 556, y: 633 },
  { x: 837, y: 633 },
  { x: 1118, y: 633 },
];

const FILTERS: { label: string; left: number; width: number; active?: boolean }[] = [
  { label: "Macro (250K–1M)", left: 275, width: 173, active: true },
  { label: "High Match %", left: 456, width: 148 },
  { label: "Best CPV", left: 612, width: 119 },
  { label: "4.5+ Rating", left: 739, width: 133 },
  { label: "City", left: 880, width: 83 },
];

const MANAGED_GRAD =
  "linear-gradient(90deg, rgba(104,1,254,0.06), rgba(217,217,217,0.06))";

/* ---------------------------- format helpers --------------------------- */
function compact(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}k`;
  return String(n);
}

/** Money in the ₹60K / ₹65.5K shape used by the "Managed by" pill. */
function money(n: number): string {
  if (n >= 10_000_000) return `${(n / 10_000_000).toFixed(1).replace(/\.0$/, "")}Cr`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
  return String(Math.round(n));
}

/** Deal value for one creator = cost-per-view × average views. */
const dealValue = (c: Creator) => Math.round(c.cpv * c.avgViews);

/** Agency volume discount — larger rosters negotiate deeper rate cards. */
const agencyOff = (a: Agency) => Math.min(50, Math.max(5, Math.round(a.creatorsCount / 5)));

/* ------------------------------ primitives ----------------------------- */
function Metric({
  icon: Icon,
  iconColor,
  fill,
  children,
  left,
  top,
  width,
}: {
  icon: LucideIcon;
  iconColor?: string;
  fill?: boolean;
  children: ReactNode;
  left: number;
  top: number;
  width: number;
}) {
  return (
    <div
      className="absolute flex h-[24px] items-center gap-[3px] rounded-[12px] bg-white px-[5px]"
      style={{ left, top, width }}
    >
      <Icon
        className="h-[16px] w-[16px] shrink-0"
        strokeWidth={1.7}
        style={{ color: iconColor ?? "#000000", fill: fill ? iconColor : "none" }}
      />
      <span className="whitespace-nowrap text-[10px] leading-none text-ink/80">
        {children}
      </span>
    </div>
  );
}

function InternalManaged({ value }: { value: number }) {
  return (
    <>
      <span
        className="absolute left-[8px] top-[135.9px] h-[32.2px] w-[237px] rounded-[10.83px]"
        style={{ background: MANAGED_GRAD }}
      />
      <span className="absolute left-[14px] top-[139.9px] h-[24px] w-[24px] rounded-full bg-gradient-to-br from-[#FF9EC4] to-[#C8B3ED]" />
      <span className="absolute left-[42px] top-[145px] text-[10.2px] leading-none text-ink/90">
        Socyio - Internal
      </span>
      <div className="absolute left-[170px] top-[140.9px] flex h-[22px] w-[69px] items-center justify-center gap-[3px] rounded-[8px] bg-white">
        <Coins className="h-[13px] w-[13px]" strokeWidth={1.7} style={{ color: "#C29B3B" }} />
        <span className="text-[12px] font-medium leading-none" style={{ color: "#571A9F" }}>
          ₹ {money(value)}
        </span>
      </div>
    </>
  );
}

function AgencyManaged({
  agency,
  stars,
  value,
}: {
  agency: Agency;
  stars: number;
  value: number;
}) {
  return (
    <>
      <span
        className="absolute left-[8px] top-[132px] h-[33px] w-[237px] rounded-[10.83px]"
        style={{ background: MANAGED_GRAD }}
      />
      <div
        className="absolute left-[106px] top-[126px] flex h-[12px] w-[47px] items-center justify-center rounded-[3px]"
        style={{ background: "linear-gradient(90deg,#A27CEE,#7F4BE7)" }}
      >
        <span className="whitespace-nowrap text-[9px] leading-none text-white">
          -{agencyOff(agency)}% OFF
        </span>
      </div>
      <span className="absolute left-[13px] top-[137px] h-[24px] w-[24px] rounded-full bg-gradient-to-br from-[#C8E6FF] to-[#C8B3ED]" />
      <span className="absolute left-[41px] top-[136.2px] text-[10.2px] leading-none text-ink/90">
        {agency.name}
      </span>
      <span className="absolute left-[41px] top-[147.8px] flex items-center gap-[4px]">
        <Star className="h-[12px] w-[12px]" strokeWidth={0} style={{ color: "#FFC107", fill: "#FFC107" }} />
        <span className="text-[8px] leading-none text-ink/60">{stars.toFixed(1)} Stars</span>
      </span>
      <div
        className="absolute left-[163px] top-[136px] flex h-[25px] w-[75px] items-center justify-center gap-[3px] rounded-[8px]"
        style={{ background: "rgba(255,255,255,0.7)" }}
      >
        <Coins className="h-[13px] w-[13px]" strokeWidth={1.7} style={{ color: "#C29B3B" }} />
        <span className="text-[12px] font-medium leading-none" style={{ color: "#571A9F" }}>
          ₹{money(value)}
        </span>
      </div>
    </>
  );
}

function CreatorCard({
  x,
  y,
  agency,
  creator,
  onClick,
}: {
  x: number;
  y: number;
  agency?: Agency;
  creator: Creator;
  onClick: () => void;
}) {
  const value = dealValue(creator);
  return (
    <div
      className="absolute h-[193px] w-[266px] cursor-pointer rounded-[12px] bg-[#F5F5F5]"
      style={{ left: x, top: y }}
      onClick={onClick}
    >
      {/* top-right arrow button */}
      <span className="absolute left-[234px] top-[-1px] flex h-[28px] w-[28px] items-center justify-center rounded-[16px] bg-white">
        <ArrowUpRight className="h-[16px] w-[16px] text-ink" strokeWidth={1.6} />
      </span>

      {/* avatar + name */}
      <span className="absolute left-[8px] top-[6px] h-[38px] w-[38px] rounded-full bg-gradient-to-br from-[#FFD8B0] to-[#EF9C9C]" />
      <div className="absolute left-[51px] top-[10px]">
        <div className="text-[12px] leading-[15px] text-ink/90">{creator.name}</div>
        <div className="text-[8px] leading-[13px] text-ink/70">{creator.handle}</div>
      </div>

      {/* progress ring */}
      <span className="absolute left-[150px] top-[5px] flex h-[23px] w-[23px] items-center justify-center rounded-full bg-white">
        <LoaderCircle className="h-[15px] w-[15px]" strokeWidth={2} style={{ color: "#79B282" }} />
      </span>

      {/* location pill */}
      <span className="absolute left-[179px] top-[8px] flex h-[18px] w-[40px] items-center justify-center gap-[1.5px] rounded-[9px] bg-white">
        <MapPin className="h-[8px] w-[8px]" strokeWidth={2} style={{ color: "#EA4C3B" }} />
        <span className="text-[7.6px] leading-none text-ink">{creator.location ?? ""}</span>
      </span>

      {/* metrics row 1 */}
      <Metric icon={Users} left={10} top={51} width={68}>{compact(creator.followers)}</Metric>
      <Metric icon={Eye} iconColor="#2CC37F" left={69} top={51} width={110}>
        {compact(creator.avgViews)} Avg. views
      </Metric>
      <Metric icon={Heart} iconColor="#F2777A" left={173} top={51} width={77}>
        {creator.engagementRate.toFixed(1)}% ER
      </Metric>

      {/* metrics row 2 */}
      <Metric icon={Star} iconColor="#FFC107" fill left={10} top={82} width={87}>
        {creator.stars.toFixed(1)} Stars
      </Metric>
      <Metric icon={Eye} iconColor="#2CC37F" left={87} top={82} width={91}>
        {creator.cpv.toFixed(2)}p CPV
      </Metric>
      <Metric icon={Sparkles} iconColor="#603CFF" left={173} top={82} width={79}>
        {creator.matchPct ?? 0}% Match
      </Metric>

      {/* managed by */}
      <span className="absolute left-[8px] top-[112px] text-[9.3px] leading-none text-ink/70">
        Managed by:
      </span>
      {agency ? (
        <AgencyManaged agency={agency} stars={creator.stars} value={value} />
      ) : (
        <InternalManaged value={value} />
      )}

      {/* checkbox */}
      {creator.listed ? (
        <span className="absolute left-[240px] top-[167px] flex h-[15px] w-[15px] items-center justify-center rounded-[5px] bg-white">
          <Check className="h-[9px] w-[9px] text-ink" strokeWidth={2.5} />
        </span>
      ) : (
        <span className="absolute left-[240px] top-[167px] h-[15px] w-[15px] rounded-[5px] bg-white" />
      )}
    </div>
  );
}

/* -------------------------------- page --------------------------------- */
export default function CampaignCreatorListPage() {
  const navigate = useNavigate();
  const [sp] = useSearchParams();
  const { data: creatorData, isLoading } = useCreators();
  const agencies = useAgencies().data ?? [];
  const campaigns = useCampaigns().data ?? [];
  const [activeFilter, setActiveFilter] = useState<string | null>(
    FILTERS.find((f) => f.active)?.label ?? null,
  );

  const campaign = campaigns.find((c) => c.id === sp.get("id")) ?? campaigns[0];

  const all = creatorData ?? [];
  let pool = all;
  if (activeFilter === "Macro (250K–1M)")
    pool = pool.filter((c) => c.followers >= 250_000 && c.followers <= 1_000_000);
  else if (activeFilter === "4.5+ Rating") pool = pool.filter((c) => c.stars >= 4.5);
  else if (activeFilter === "High Match %")
    pool = [...pool].sort((a, b) => (b.matchPct ?? 0) - (a.matchPct ?? 0));
  else if (activeFilter === "Best CPV") pool = [...pool].sort((a, b) => a.cpv - b.cpv);
  else if (activeFilter === "City")
    pool = [...pool].sort((a, b) => (a.location ?? "").localeCompare(b.location ?? ""));
  const shown = pool.slice(0, CARDS.length);

  return (
    <>
      {/* back button — 235,154 · black circle */}
      <span
        className="absolute left-[235px] top-[154px] flex h-[45px] w-[45px] cursor-pointer items-center justify-center rounded-full bg-black"
        onClick={() => navigate(-1)}
      >
        <ChevronLeft className="h-[24px] w-[24px] text-white" strokeWidth={2} />
      </span>

      {/* search bar — 262,246 · 544×48 */}
      <div
        className="absolute left-[262px] top-[246px] flex h-[48px] w-[544px] cursor-pointer items-center gap-[8px] rounded-[24px] bg-white px-[12px]"
        onClick={() => navigate("/search")}
      >
        <Search className="h-[24px] w-[24px] text-ink" strokeWidth={1.7} />
        <span className="text-[15px] font-light text-ink/70">
          Search in {campaign?.name ?? "campaigns"}
        </span>
      </div>

      {/* header action buttons */}
      <span
        className="absolute left-[814px] top-[247px] flex h-[45px] w-[45px] cursor-pointer items-center justify-center rounded-full bg-white"
        onClick={() => navigate("/leads/add-creator")}
      >
        <UserRoundPlus className="h-[24px] w-[24px] text-ink" strokeWidth={1.6} />
      </span>
      <span className="absolute left-[867px] top-[247px] flex h-[45px] w-[45px] items-center justify-center rounded-full bg-white">
        <Trash2 className="h-[22px] w-[22px] text-ink" strokeWidth={1.6} />
      </span>
      <span
        className="absolute left-[920px] top-[247px] flex h-[45px] w-[45px] cursor-pointer items-center justify-center rounded-full bg-white"
        onClick={() => navigate("/campaigns/assign")}
      >
        <Plus className="h-[24px] w-[24px] text-ink" strokeWidth={1.6} />
      </span>

      {/* share link + download */}
      <div
        className="absolute left-[1102px] top-[256px] flex h-[45px] w-[131px] cursor-pointer items-center gap-[8px] rounded-[24px] bg-white px-[12px]"
        onClick={() => navigate("/creators/share-link-list")}
      >
        <Link2 className="h-[20px] w-[20px] text-ink" strokeWidth={1.6} />
        <span className="text-[14px] font-light text-ink">Share link</span>
      </div>
      <div
        className="absolute left-[1241px] top-[256px] flex h-[45px] w-[127px] cursor-pointer items-center gap-[8px] rounded-[24px] bg-white px-[12px]"
        onClick={() => navigate("/leads/download")}
      >
        <FileSpreadsheet className="h-[20px] w-[20px]" strokeWidth={1.6} style={{ color: "#21A366" }} />
        <span className="text-[14px] font-light text-ink">Download</span>
      </div>

      {/* filter pills */}
      {FILTERS.map((f) => {
        const isActive = activeFilter === f.label;
        return (
          <div
            key={f.label}
            onClick={() =>
              setActiveFilter((prev) => (prev === f.label ? null : f.label))
            }
            className={`absolute top-[317px] flex h-[38px] cursor-pointer items-center justify-between rounded-full px-[16px] ${
              isActive ? "bg-[#1A1A1A]" : "bg-white"
            }`}
            style={{ left: f.left, width: f.width }}
          >
            <span
              className={`whitespace-nowrap font-inter text-[14px] font-medium leading-none ${
                isActive ? "text-white" : "text-[#334155]"
              }`}
            >
              {f.label}
            </span>
            {isActive ? (
              <X className="h-[13px] w-[13px] text-white" strokeWidth={2.2} />
            ) : (
              <ChevronDown className="h-[14px] w-[14px] text-[#334155]" strokeWidth={2} />
            )}
          </div>
        );
      })}

      {/* clear all filters */}
      <button
        className="absolute left-[1220px] top-[317px] flex h-[38px] w-[125px] cursor-pointer items-center justify-center rounded-full"
        onClick={() => setActiveFilter(null)}
      >
        <span className="text-[14px] font-semibold text-[#191919]">Clear all filters</span>
      </button>

      {/* section title */}
      <h2 className="absolute left-[275px] top-[379px] text-[24px] font-normal leading-none text-ink">
        Macro Creators (250K – 1M)
      </h2>

      {/* creator cards */}
      {shown.map((creator, i) => (
        <CreatorCard
          key={creator.id}
          x={CARDS[i].x}
          y={CARDS[i].y}
          agency={agencies.find((a) => a.id === creator.agencyId)}
          creator={creator}
          onClick={() => navigate(`/creators/detail?id=${creator.id}`)}
        />
      ))}
      {shown.length === 0 && (
        <div
          className="absolute h-[193px] w-[266px] rounded-[12px] bg-[#F5F5F5]"
          style={{ left: CARDS[0].x, top: CARDS[0].y }}
        >
          <span className="absolute left-[12px] top-[88px] text-[12px] leading-none text-ink/60">
            {isLoading ? "Loading creators…" : "No creators match these filters"}
          </span>
        </div>
      )}
    </>
  );
}
