import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCreators, useAgencies, type Creator, type Agency } from "@/api/hooks";
import type { LucideIcon } from "lucide-react";
import {
  ArrowLeft,
  Search,
  UserRound,
  Trash2,
  Plus,
  Link2,
  FileSpreadsheet,
  X,
  ChevronDown,
  ArrowUpRight,
  Users,
  Eye,
  Heart,
  Star,
  Sparkles,
  PieChart,
  Wallet,
  Check,
} from "lucide-react";

/**
 * Super Admin — New Lead Search.
 * Exact reconstruction of Figma frame 5789:20158 ("Super Admin- new lead search"), 1440×1024.
 * Clean underlying page (profile popup + dim scrim intentionally omitted).
 */

/** compact follower/view counts: 1_200_000 -> "1.2M", 900_000 -> "900k". */
function compact(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}k`;
  return `${n}`;
}

/** Indicative booking cost for a creator = CPV × avg views, shown as "60K" / "65.5K". */
function cost(c: Creator): string {
  const n = c.cpv * c.avgViews;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
  return `${Math.round(n)}`;
}

/**
 * Agency service rating — the schema has no rating column on Agency, so it is
 * derived deterministically from the agency's campaign volume (4.0–4.9 band).
 */
function agencyRating(a: Agency): string {
  return (4 + (a.campaignsCount % 10) / 10).toFixed(1);
}

/* ------------------------------ primitives ----------------------------- */
function StatChip({
  left,
  top,
  icon: Icon,
  iconClass = "text-ink/70",
  label,
}: {
  left: number;
  top: number;
  icon: LucideIcon;
  iconClass?: string;
  label: string;
}) {
  return (
    <div
      className="absolute flex h-[24px] items-center gap-[3px] rounded-[12px] bg-white px-[5px]"
      style={{ left, top }}
    >
      <Icon className={`h-[13px] w-[13px] shrink-0 ${iconClass}`} strokeWidth={1.6} />
      <span className="whitespace-nowrap text-[10px] leading-none text-ink/80">{label}</span>
    </div>
  );
}

function FilterPill({
  left,
  top,
  w,
  h,
  label,
  active,
  onToggle,
}: {
  left: number;
  top: number;
  w: number;
  h: number;
  label: string;
  active: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      onClick={onToggle}
      className={`absolute flex cursor-pointer items-center justify-between rounded-full px-[16px] ${active ? "bg-[#1A1A1A]" : "bg-white"}`}
      style={{ left, top, width: w, height: h }}
    >
      <span
        className={`whitespace-nowrap font-inter text-[14px] font-medium ${active ? "text-white" : "text-[#334155]"}`}
      >
        {label}
      </span>
      <ChevronDown
        className={`ml-[8px] h-[14px] w-[14px] shrink-0 ${active ? "text-white" : "text-[#334155]"}`}
        strokeWidth={2}
      />
    </div>
  );
}

type Variant = "socyio" | "stellar";

function CreatorCard({
  left,
  top,
  creator,
  agency,
  discountPct,
}: {
  left: number;
  top: number;
  creator: Creator;
  agency?: Agency;
  discountPct: number;
}) {
  const navigate = useNavigate();
  const [selected, setSelected] = useState(creator.listed ?? false);
  // "Managed by" treatment: agency-managed creators get the agency block,
  // creators with no agency on record are Socyio-internal.
  const variant: Variant = agency ? "stellar" : "socyio";
  return (
    <div className="absolute" style={{ left, top, width: 266, height: 193 }}>
      {/* card body */}
      <div className="absolute inset-0 rounded-[12px] bg-[#F5F5F5]" />

      {/* top-right open arrow */}
      <span
        onClick={() => navigate(`/creators/detail?id=${creator.id}`)}
        className="absolute left-[234px] top-[-1px] flex h-[28px] w-[28px] cursor-pointer items-center justify-center rounded-[16px] bg-white"
      >
        <ArrowUpRight className="h-[15px] w-[15px] text-ink" strokeWidth={1.7} />
      </span>

      {/* creator header */}
      <span className="absolute left-[8px] top-[6px] h-[38px] w-[38px] rounded-full bg-gradient-to-br from-[#F7D9CC] to-[#C8B3ED]" />
      <div className="absolute left-[51px] top-[9px]">
        <div className="text-[12px] leading-[15px] text-ink/90">{creator.name}</div>
        <div className="text-[8px] leading-[13px] text-ink/70">{creator.handle}</div>
      </div>

      {/* progress badge */}
      <span className="absolute left-[150px] top-[5px] flex h-[23px] w-[23px] items-center justify-center rounded-full bg-white">
        <PieChart className="h-[14px] w-[14px] text-[#79B282]" strokeWidth={1.8} />
      </span>

      {/* location badge */}
      <div className="absolute left-[179px] top-[8px] flex h-[18px] items-center gap-[2px] rounded-[9px] bg-white px-[4px]">
        <span className="text-[7.6px] leading-none">📍</span>
        <span className="text-[7.6px] leading-none text-ink">{creator.location ?? ""}</span>
      </div>

      {/* stats row 1 */}
      <StatChip left={10} top={51} icon={Users} label={compact(creator.followers)} />
      <StatChip left={69} top={51} icon={Eye} iconClass="text-[#2CC37F]" label={`${compact(creator.avgViews)} Avg. views`} />
      <StatChip left={173} top={51} icon={Heart} label={`${creator.engagementRate.toFixed(1)}% ER`} />

      {/* stats row 2 */}
      <StatChip left={10} top={82} icon={Star} iconClass="text-[#FFC107] fill-[#FFC107]" label={`${creator.stars.toFixed(1)} Stars`} />
      <StatChip left={87} top={82} icon={Eye} iconClass="text-[#2CC37F]" label={`${creator.cpv.toFixed(2)}p CPV`} />
      <StatChip left={173} top={82} icon={Sparkles} iconClass="text-[#603CFF]" label={`${creator.matchPct ?? 0}% Match`} />

      {/* managed by */}
      <span className="absolute left-[8px] top-[112px] text-[9.3px] leading-none text-ink/70">
        Managed by:
      </span>

      {variant === "socyio" ? (
        <>
          <div className="absolute left-[8px] top-[135.9px] h-[32.2px] w-[237px] rounded-[10.83px] border border-black/[0.06] bg-gradient-to-r from-[#6801FE]/[0.06] to-[#D9D9D9]/[0.06]" />
          <span className="absolute left-[14px] top-[139.9px] h-[24px] w-[24px] rounded-full bg-gradient-to-br from-[#B7F0C6] to-[#7FB0E7]" />
          <span className="absolute left-[42px] top-[144.5px] text-[10.2px] text-ink/90">
            Socyio - Internal
          </span>
          <span className="absolute left-[170px] top-[140.9px] flex h-[22px] items-center gap-[3px] rounded-[8px] bg-white px-[7px]">
            <Wallet className="h-[12px] w-[12px] text-[#571A9F]" strokeWidth={1.6} />
            <span className="text-[12px] font-medium leading-none text-[#571A9F]">₹ {cost(creator)}</span>
          </span>
          {/* checkbox — selected */}
          <span
            onClick={() => setSelected((s) => !s)}
            className="absolute left-[240px] top-[167px] flex h-[15px] w-[15px] cursor-pointer items-center justify-center rounded-[5px] border-[1.5px] border-black bg-white"
          >
            {selected && <Check className="h-[10px] w-[10px] text-ink" strokeWidth={2.6} />}
          </span>
        </>
      ) : (
        <>
          <div className="absolute left-[8px] top-[132px] h-[33px] w-[237px] rounded-[10.83px] border border-black/[0.06] bg-gradient-to-r from-[#6801FE]/[0.06] to-[#D9D9D9]/[0.06]" />
          {/* discount tag */}
          {discountPct > 0 && (
            <span className="absolute left-[106px] top-[126px] flex h-[12px] items-center rounded-[3px] bg-gradient-to-r from-[#A27CEE] to-[#7F4BE7] px-[3px] text-[9px] font-normal leading-none text-white">
              -{discountPct}% OFF
            </span>
          )}
          <span className="absolute left-[13px] top-[137px] h-[24px] w-[24px] rounded-full bg-gradient-to-br from-[#F3C6E5] to-[#7F4BE7]" />
          <span className="absolute left-[41px] top-[136px] text-[10.2px] text-ink/90">
            {agency?.name}
          </span>
          <div className="absolute left-[41px] top-[148px] flex items-center gap-[4px]">
            <Star className="h-[11px] w-[11px] text-[#FFC107] fill-[#FFC107]" strokeWidth={1} />
            <span className="text-[8px] font-light leading-none text-ink/60">
              {agency ? agencyRating(agency) : ""} Stars
            </span>
          </div>
          <span className="absolute left-[163px] top-[136px] flex h-[25px] items-center gap-[3px] rounded-[8px] bg-white/70 px-[6px]">
            <span className="text-[12px] leading-none">💰</span>
            <span className="text-[12px] font-medium leading-none text-[#571A9F]">₹{cost(creator)}</span>
          </span>
          {/* checkbox — empty */}
          <span
            onClick={() => setSelected((s) => !s)}
            className={`absolute left-[240px] top-[167px] h-[15px] w-[15px] cursor-pointer rounded-[5px] border-[1.5px] border-black bg-white ${selected ? "flex items-center justify-center" : ""}`}
          >
            {selected && <Check className="h-[10px] w-[10px] text-ink" strokeWidth={2.6} />}
          </span>
        </>
      )}
    </div>
  );
}

/* -------------------------------- page --------------------------------- */
const PILLS = [
  { left: 455, top: 317, w: 148, h: 37, label: "High Match %" },
  { left: 611, top: 317, w: 119, h: 38, label: "Best CPV" },
  { left: 738, top: 317, w: 133, h: 38, label: "4.5+ Rating" },
  { left: 879, top: 317, w: 83, h: 38, label: "City" },
];

const CARD_COLS = [274, 555, 836, 1117];

export default function NewLeadSearchPage() {
  const navigate = useNavigate();
  const { data: creators, isLoading } = useCreators();
  const { data: agencies } = useAgencies();
  const [showMacroFilter, setShowMacroFilter] = useState(true);
  const [activeFilters, setActiveFilters] = useState<Set<string>>(new Set());

  const agencyById = new Map((agencies ?? []).map((a) => [a.id, a]));

  // the filter chips above the grid actually narrow / re-rank the live list
  let pool = creators ?? [];
  if (showMacroFilter) pool = pool.filter((c) => c.followers >= 250_000 && c.followers <= 1_000_000);
  if (activeFilters.has("4.5+ Rating")) pool = pool.filter((c) => c.stars >= 4.5);
  if (activeFilters.has("Best CPV")) pool = [...pool].sort((a, b) => a.cpv - b.cpv);
  if (activeFilters.has("High Match %")) pool = [...pool].sort((a, b) => (b.matchPct ?? 0) - (a.matchPct ?? 0));
  const list = pool.slice(0, 8);

  // "% OFF" has no schema column — express it as how far below the priciest
  // creator on screen this creator's CPV sits.
  const maxCpv = list.reduce((m, c) => Math.max(m, c.cpv), 0);
  const discountOf = (c: Creator) => (maxCpv > 0 ? Math.round((1 - c.cpv / maxCpv) * 100) : 0);

  const toggleFilter = (label: string) =>
    setActiveFilters((prev) => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  return (
    <>
      {/* back button */}
      <span
        onClick={() => navigate(-1)}
        className="absolute left-[235px] top-[153px] flex h-[45px] w-[45px] cursor-pointer items-center justify-center rounded-full bg-black"
      >
        <ArrowLeft className="h-[22px] w-[22px] text-white" strokeWidth={2} />
      </span>

      {/* search bar */}
      <div
        onClick={() => navigate("/search")}
        className="absolute left-[262px] top-[245px] h-[48px] w-[544px] cursor-pointer rounded-[24px] bg-white"
      >
        <Search className="absolute left-[13px] top-[12px] h-[22px] w-[22px] text-ink" strokeWidth={1.8} />
        <span className="absolute left-[44px] top-[14px] text-[15px] font-light text-ink/70">
          Search in New Leads
        </span>
      </div>

      {/* round action buttons */}
      <span
        onClick={() => navigate("/campaigns/assign")}
        className="absolute left-[814px] top-[247px] flex h-[45px] w-[45px] cursor-pointer items-center justify-center rounded-full bg-white"
      >
        <UserRound className="h-[22px] w-[22px] text-ink" strokeWidth={1.6} />
      </span>
      <span className="absolute left-[867px] top-[247px] flex h-[45px] w-[45px] items-center justify-center rounded-full bg-white">
        <Trash2 className="h-[21px] w-[21px] text-ink" strokeWidth={1.6} />
      </span>
      <span
        onClick={() => navigate("/leads/create-paid")}
        className="absolute left-[920px] top-[247px] flex h-[45px] w-[45px] cursor-pointer items-center justify-center rounded-full bg-white"
      >
        <Plus className="h-[22px] w-[22px] text-ink" strokeWidth={1.6} />
      </span>

      {/* share link / download */}
      <div
        onClick={() => navigate("/creators/share-link-list")}
        className="absolute left-[1102px] top-[256px] flex h-[45px] w-[131px] cursor-pointer items-center gap-[8px] rounded-[24px] bg-white px-[12px]"
      >
        <Link2 className="h-[20px] w-[20px] text-ink" strokeWidth={1.6} />
        <span className="text-[14px] font-light text-ink">Share link</span>
      </div>
      <div
        onClick={() => navigate("/leads/download")}
        className="absolute left-[1241px] top-[256px] flex h-[45px] w-[127px] cursor-pointer items-center gap-[8px] rounded-[24px] bg-white px-[12px]"
      >
        <FileSpreadsheet className="h-[20px] w-[20px] text-[#21A366]" strokeWidth={1.6} />
        <span className="text-[14px] font-light text-ink">Download</span>
      </div>

      {/* filter pills */}
      {showMacroFilter && (
        <div className="absolute left-[274px] top-[317px] flex h-[37.5px] w-[173px] items-center justify-between rounded-full bg-[#1A1A1A] px-[16px]">
          <span className="whitespace-nowrap font-inter text-[14px] font-medium text-white">
            Macro (250K–1M)
          </span>
          <X
            onClick={() => setShowMacroFilter(false)}
            className="ml-[8px] h-[14px] w-[14px] shrink-0 cursor-pointer text-white"
            strokeWidth={2}
          />
        </div>
      )}
      {PILLS.map((p) => (
        <FilterPill
          key={p.label}
          left={p.left}
          top={p.top}
          w={p.w}
          h={p.h}
          label={p.label}
          active={activeFilters.has(p.label)}
          onToggle={() => toggleFilter(p.label)}
        />
      ))}
      <div
        onClick={() => {
          setActiveFilters(new Set());
          setShowMacroFilter(false);
        }}
        className="absolute left-[1219px] top-[317px] flex h-[38px] w-[125px] cursor-pointer items-center justify-center text-[14px] font-semibold text-[#191919]"
      >
        Clear all filters
      </div>

      {/* section title */}
      <h2 className="absolute left-[274px] top-[379px] text-[24px] font-normal leading-[24px] text-ink">
        Macro Creators (250K – 1M)
      </h2>

      {/* rows of creator cards */}
      {list.length === 0 && (
        <div
          className="absolute flex items-center justify-center rounded-[12px] bg-[#F5F5F5] text-[12px] text-ink/60"
          style={{ left: CARD_COLS[0], top: 424, width: 266, height: 193 }}
        >
          {isLoading ? "Loading creators…" : "No creators match these filters"}
        </div>
      )}
      {CARD_COLS.map((x, i) =>
        list[i] ? (
          <CreatorCard
            key={list[i].id}
            left={x}
            top={424}
            creator={list[i]}
            agency={agencyById.get(list[i].agencyId ?? "")}
            discountPct={discountOf(list[i])}
          />
        ) : null,
      )}
      {CARD_COLS.map((x, i) =>
        list[i + 4] ? (
          <CreatorCard
            key={list[i + 4].id}
            left={x}
            top={633}
            creator={list[i + 4]}
            agency={agencyById.get(list[i + 4].agencyId ?? "")}
            discountPct={discountOf(list[i + 4])}
          />
        ) : null,
      )}
    </>
  );
}
