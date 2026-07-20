import { useState } from "react";
import type { ReactNode } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import type { LucideIcon } from "lucide-react";
import {
  ChevronLeft,
  ChevronDown,
  Search,
  UserRoundPlus,
  Trash2,
  Plus,
  Check,
  Link2,
  FileSpreadsheet,
  ArrowUpRight,
  MapPin,
  Users,
  Eye,
  Heart,
  Star,
  Sparkles,
  LoaderCircle,
  Coins,
} from "lucide-react";
import { useAgencies, useCampaigns, useCreators } from "@/api/hooks";
import type { Creator } from "@/api/hooks";

/**
 * Super Admin — Share link / creator list (Campaign detail sub-flow).
 * Exact reconstruction of Figma frame 3193:61272 ("Super Admin- share link- creator l"), 1440×1024.
 * CLEAN build: the captured frame had the "Share Nike's Diwali" modal open over a 50% dim scrim
 * (sibling node 3193:61778). That popup + scrim are intentionally skipped — the underlying page is
 * rebuilt at full opacity from the node tree. TopBar + Sidebar are provided by AppShell.
 */

/** Card slots — x coordinates only; which variant a slot renders comes from the record. */
const CARD_X = [277, 558, 839, 1120];

const MANAGED_GRAD =
  "linear-gradient(90deg, rgba(104,1,254,0.06), rgba(217,217,217,0.06))";

function compact(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  if (n >= 1_000) return Math.round(n / 1_000) + "k";
  return String(n);
}

/** ₹ figure in the design's "₹65.5K" shape. */
function rupees(n: number): string {
  if (n >= 1_000) return "₹" + (n / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
  return "₹" + Math.round(n);
}

/** Deal price for one creator: avg. views at their cost-per-view. */
const priceOf = (c: Creator) => c.avgViews * c.cpv;

/** Managed-by block data resolved for a single creator. */
type Managed = { name: string; stars: number; discount: number } | null;

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

function InternalManaged({ price }: { price: number }) {
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
      <div className="absolute left-[170px] top-[140.9px] flex h-[22px] w-[69px] items-center justify-center rounded-[8px] bg-white">
        <span className="text-[12px] font-medium leading-none" style={{ color: "#571A9F" }}>
          {rupees(price)}
        </span>
      </div>
    </>
  );
}

function AgencyManaged({ managed, price }: { managed: NonNullable<Managed>; price: number }) {
  return (
    <>
      <span
        className="absolute left-[8px] top-[132px] h-[33px] w-[237px] rounded-[10.83px]"
        style={{ background: MANAGED_GRAD }}
      />
      {managed.discount > 0 && (
        <div
          className="absolute left-[106px] top-[126px] flex h-[12px] w-[47px] items-center justify-center rounded-[3px]"
          style={{ background: "linear-gradient(90deg,#A27CEE,#7F4BE7)" }}
        >
          <span className="whitespace-nowrap text-[9px] leading-none text-white">
            -{managed.discount}% OFF
          </span>
        </div>
      )}
      <span className="absolute left-[13px] top-[137px] h-[24px] w-[24px] rounded-full bg-gradient-to-br from-[#C8E6FF] to-[#C8B3ED]" />
      <span className="absolute left-[41px] top-[136.2px] text-[10.2px] leading-none text-ink/90">
        {managed.name}
      </span>
      <span className="absolute left-[41px] top-[147.8px] flex items-center gap-[4px]">
        <Star className="h-[12px] w-[12px]" strokeWidth={0} style={{ color: "#FFC107", fill: "#FFC107" }} />
        <span className="text-[8px] leading-none text-ink/60">{managed.stars.toFixed(1)} Stars</span>
      </span>
      <div
        className="absolute left-[163px] top-[136px] flex h-[25px] w-[75px] items-center justify-center gap-[3px] rounded-[8px]"
        style={{ background: "rgba(255,255,255,0.7)" }}
      >
        <Coins className="h-[13px] w-[13px]" strokeWidth={1.7} style={{ color: "#C29B3B" }} />
        <span className="text-[12px] font-medium leading-none" style={{ color: "#571A9F" }}>
          {rupees(price)}
        </span>
      </div>
    </>
  );
}

function CreatorCard({
  x,
  creator,
  managed,
  selected,
  onToggle,
}: {
  x: number;
  creator: Creator;
  managed: Managed;
  selected: boolean;
  onToggle: () => void;
}) {
  const navigate = useNavigate();
  return (
    <div
      className="absolute h-[193px] w-[266px] rounded-[12px] bg-[#F5F5F5]"
      style={{ left: x, top: 369 }}
    >
      {/* top-right arrow button */}
      <span
        onClick={() => navigate(`/creators/detail?id=${creator.id}`)}
        className="absolute left-[234px] top-[-1px] flex h-[28px] w-[28px] cursor-pointer items-center justify-center rounded-[16px] bg-white"
      >
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
      {managed === null ? (
        <InternalManaged price={priceOf(creator)} />
      ) : (
        <AgencyManaged managed={managed} price={priceOf(creator)} />
      )}

      {/* selection checkbox */}
      {selected ? (
        <span
          onClick={onToggle}
          className="absolute left-[240px] top-[167px] flex h-[15px] w-[15px] cursor-pointer items-center justify-center rounded-[5px] bg-white"
        >
          <Check className="h-[9px] w-[9px] text-ink" strokeWidth={2.5} />
        </span>
      ) : (
        <span
          onClick={onToggle}
          className="absolute left-[240px] top-[167px] h-[15px] w-[15px] cursor-pointer rounded-[5px] bg-white"
        />
      )}
    </div>
  );
}

/* -------------------------------- page --------------------------------- */
export default function ShareLinkListPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { data: creatorData, isLoading } = useCreators();
  const { data: agencyData } = useAgencies();
  const { data: campaignData } = useCampaigns();

  const all = creatorData ?? [];
  const creators = all.slice(0, CARD_X.length);

  // campaign this share link belongs to — ?id=… , else the first campaign
  const campaigns = campaignData ?? [];
  const campaign = campaigns.find((c) => c.id === params.get("id")) ?? campaigns[0];

  // top of the rate card across the roster — what a creator is discounted against
  const topCpv = all.reduce((m, c) => Math.max(m, c.cpv), 0);
  const agencies = agencyData ?? [];

  const managedFor = (c: Creator): Managed => {
    const agency = c.agencyId ? agencies.find((a) => a.id === c.agencyId) : undefined;
    if (!agency) return null;
    const roster = all.filter((r) => r.agencyId === agency.id);
    const stars = roster.length
      ? roster.reduce((s, r) => s + r.stars, 0) / roster.length
      : c.stars;
    return {
      name: agency.name,
      stars,
      discount: topCpv > 0 ? Math.round((1 - c.cpv / topCpv) * 100) : 0,
    };
  };

  // selection defaults to the creators already shortlisted (listed) on the record
  const [picked, setPicked] = useState<Record<string, boolean>>({});
  const isPicked = (c: Creator) => picked[c.id] ?? c.listed ?? false;
  const selectedCount = creators.filter(isPicked).length;

  return (
    <>
      {/* content-panel border (notched top around the toolbar) — stroke #D4D4D4 */}
      <svg
        className="pointer-events-none absolute left-0 top-0 h-[1024px] w-[1440px]"
        viewBox="0 0 1440 1024"
        fill="none"
      >
        <path
          d="M1411 1024 L1411 247 L977 247 L977 301 L261 301 L261 1024"
          stroke="#D4D4D4"
          strokeWidth="1"
        />
      </svg>

      {/* back button — 235,153 */}
      <span
        onClick={() => navigate(-1)}
        className="absolute left-[235px] top-[153px] flex h-[45px] w-[45px] cursor-pointer items-center justify-center rounded-full bg-black"
      >
        <ChevronLeft className="h-[24px] w-[24px] text-white" strokeWidth={2} />
      </span>

      {/* campaign title — 268,232 · Outfit 400 34px */}
      <h1 className="absolute left-[268px] top-[230px] text-[34px] font-normal leading-none text-ink">
        {campaign?.name ?? ""}
      </h1>

      {/* tab dropdown menu — 594,106 · 169×127 (z-30 so it clears the TopBar band) */}
      <div className="absolute left-[594px] top-[106px] z-30 h-[127px] w-[169px] rounded-[10px] border border-[#CCCCCC] bg-white">
        <span className="absolute left-[13px] top-[9px] text-[15px] font-light leading-none text-ink">
          Client Details
        </span>
        <span className="absolute left-0 top-[43px] h-px w-full bg-[#CCCCCC]" />
        <span className="absolute left-[13px] top-[49px] text-[15px] font-light leading-none text-ink">
          Creators
        </span>
        <span className="absolute left-0 top-[83px] h-px w-full bg-[#CCCCCC]" />
        <span className="absolute left-[13px] top-[89px] text-[15px] font-light leading-none text-ink">
          Script
        </span>
        <span className="absolute left-0 top-[123px] h-px w-full bg-[#CCCCCC]" />
      </div>

      {/* Download dropdown pill — 610,247 · 133×45 */}
      <div
        onClick={() => navigate("/leads/download")}
        className="absolute left-[610px] top-[247px] flex h-[45px] w-[133px] cursor-pointer items-center justify-center gap-[8px] rounded-[28px] border border-[#D9D9D9] bg-white/90"
      >
        <span className="text-[14px] font-light leading-none text-ink">Download</span>
        <ChevronDown className="h-[16px] w-[16px] text-ink" strokeWidth={1.8} />
      </div>

      {/* toolbar action buttons */}
      <span
        onClick={() => navigate("/search")}
        className="absolute left-[761px] top-[247px] flex h-[45px] w-[45px] cursor-pointer items-center justify-center rounded-full bg-white"
      >
        <Search className="h-[22px] w-[22px] text-ink" strokeWidth={1.7} />
      </span>
      <span
        onClick={() => navigate("/leads/add-creator")}
        className="absolute left-[814px] top-[247px] flex h-[45px] w-[45px] cursor-pointer items-center justify-center rounded-full bg-white"
      >
        <UserRoundPlus className="h-[24px] w-[24px] text-ink" strokeWidth={1.6} />
      </span>
      <span className="absolute left-[867px] top-[247px] flex h-[45px] w-[45px] items-center justify-center rounded-full bg-white">
        <Trash2 className="h-[22px] w-[22px] text-ink" strokeWidth={1.6} />
      </span>
      <span
        onClick={() => navigate("/campaigns/assign")}
        className="absolute left-[920px] top-[247px] flex h-[45px] w-[45px] cursor-pointer items-center justify-center rounded-full bg-white"
      >
        <Plus className="h-[24px] w-[24px] text-ink" strokeWidth={1.6} />
      </span>

      {/* selection count — 1007,262 */}
      <div className="absolute left-[1007px] top-[262px] flex h-[15px] items-center gap-[7px]">
        <span className="flex h-[15px] w-[15px] items-center justify-center rounded-[5px] border border-[#2B2B2B] bg-white">
          <Check className="h-[9px] w-[9px] text-ink" strokeWidth={2.5} />
        </span>
        <span className="whitespace-nowrap text-[12px] font-light leading-none text-ink">
          {selectedCount} selected
        </span>
      </div>

      {/* share link + download — 1102 / 1241, 256 */}
      <div className="absolute left-[1102px] top-[256px] flex h-[45px] w-[131px] items-center gap-[8px] rounded-[24px] border border-[#CCCCCC] bg-white px-[12px]">
        <Link2 className="h-[20px] w-[20px] text-ink" strokeWidth={1.6} />
        <span className="text-[14px] font-light text-ink">Share link</span>
      </div>
      <div
        onClick={() => navigate("/leads/download")}
        className="absolute left-[1241px] top-[256px] flex h-[45px] w-[127px] cursor-pointer items-center gap-[8px] rounded-[24px] border border-[#CCCCCC] bg-white px-[12px]"
      >
        <FileSpreadsheet className="h-[20px] w-[20px]" strokeWidth={1.6} style={{ color: "#21A366" }} />
        <span className="text-[14px] font-light text-ink">Download</span>
      </div>

      {/* section title — 276,309 · Outfit 400 24px */}
      <h2 className="absolute left-[276px] top-[309px] text-[24px] font-normal leading-none text-ink">
        Creators
      </h2>

      {/* creator cards */}
      {creators.map((creator, i) => (
        <CreatorCard
          key={creator.id}
          x={CARD_X[i]}
          creator={creator}
          managed={managedFor(creator)}
          selected={isPicked(creator)}
          onToggle={() =>
            setPicked((p) => ({ ...p, [creator.id]: !isPicked(creator) }))
          }
        />
      ))}
      {creators.length === 0 && (
        <div
          className="absolute h-[193px] w-[266px] rounded-[12px] bg-[#F5F5F5]"
          style={{ left: CARD_X[0], top: 369 }}
        >
          <span className="absolute left-[8px] top-[92px] w-[250px] text-center text-[12px] leading-none text-ink/60">
            {isLoading ? "Loading creators…" : "No creators yet"}
          </span>
        </div>
      )}
    </>
  );
}
