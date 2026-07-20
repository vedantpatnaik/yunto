import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import {
  Search,
  ChevronLeft,
  ChevronDown,
  ArrowUpRight,
  Plus,
  Trash2,
  UserRound,
  Check,
  Users,
  Eye,
  Heart,
  Star,
  Sparkles,
  MapPin,
  Coins,
  LoaderCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCreators, useAgencies, type Creator, type Agency } from "@/api/hooks";

/**
 * Super Admin — New lead / creator list (New-lead sub-flow).
 * Reconstruction of Figma frame 5055:43110 ("New lead - creator list"), 1440×1024.
 *
 * The frame shares the "New Leads" toolbar with frame 5690:14724 (features/new-leads):
 * back button, "New Leads" heading (here with a field underline), Download dropdown,
 * four circular actions (search / add-to-list / delete / add) and a "1 selected" marker.
 * Below sits a subtle rounded panel titled "Creators" holding one row of four creator
 * cards. CLEAN build: the captured frame had the TopBar profile popup + 50%-opacity dim
 * scrim open — those sibling nodes are intentionally skipped and the page is rebuilt at
 * full opacity. TopBar + Sidebar are provided by AppShell, so this returns page content only.
 */

type Variant = "internal" | "agency";

/** Column x-offsets of the single card row (4 slots). */
const ROW_X = [282, 563, 844, 1125];

const MANAGED_GRAD =
  "linear-gradient(90deg, rgba(104,1,254,0.06), rgba(217,217,217,0.06))";

/** compact follower/view counts: 1_200_000 -> "1.2M", 900_000 -> "900k". */
function compact(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}k`;
  return `${n}`;
}

/**
 * Indicative deal value for a creator, in rupees: CPV (paise per view) x avg views / 100.
 * Rendered without the currency symbol so each caller keeps its own "₹" spacing.
 */
function dealValue(c: Creator): string {
  const rupees = (c.cpv * c.avgViews) / 100;
  if (rupees >= 1000) return `${(rupees / 1000).toFixed(1).replace(/\.0$/, "")}K`;
  return `${Math.round(rupees)}`;
}

/* ------------------------------ primitives ----------------------------- */
function CircleBtn({ children, pos, onClick }: { children: ReactNode; pos: string; onClick?: () => void }) {
  return (
    <span
      onClick={onClick}
      className={`absolute flex h-[45px] w-[45px] items-center justify-center rounded-full bg-white text-ink ${onClick ? "cursor-pointer " : ""}${pos}`}
    >
      {children}
    </span>
  );
}

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

function InternalManaged({ creator }: { creator: Creator }) {
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
          ₹ {dealValue(creator)}
        </span>
      </div>
    </>
  );
}

function AgencyManaged({
  creator,
  agency,
  discount,
}: {
  creator: Creator;
  agency?: Agency;
  discount: number;
}) {
  return (
    <>
      <span
        className="absolute left-[8px] top-[132px] h-[33px] w-[237px] rounded-[10.83px]"
        style={{ background: MANAGED_GRAD }}
      />
      {discount > 0 ? (
        <div
          className="absolute left-[106px] top-[126px] flex h-[12px] w-[47px] items-center justify-center rounded-[3px]"
          style={{ background: "linear-gradient(90deg,#A27CEE,#7F4BE7)" }}
        >
          <span className="whitespace-nowrap text-[9px] leading-none text-white">-{discount}% OFF</span>
        </div>
      ) : null}
      <span className="absolute left-[13px] top-[137px] h-[24px] w-[24px] rounded-full bg-gradient-to-br from-[#C8E6FF] to-[#C8B3ED]" />
      <span className="absolute left-[41px] top-[136.2px] text-[10.2px] leading-none text-ink/90">
        {agency?.name ?? ""}
      </span>
      <span className="absolute left-[41px] top-[147.8px] flex items-center gap-[4px]">
        <Star className="h-[12px] w-[12px]" strokeWidth={0} style={{ color: "#FFC107", fill: "#FFC107" }} />
        <span className="text-[8px] leading-none text-ink/60">{creator.stars.toFixed(1)} Stars</span>
      </span>
      <div
        className="absolute left-[163px] top-[136px] flex h-[25px] w-[75px] items-center justify-center gap-[3px] rounded-[8px]"
        style={{ background: "rgba(255,255,255,0.7)" }}
      >
        <Coins className="h-[13px] w-[13px]" strokeWidth={1.7} style={{ color: "#C29B3B" }} />
        <span className="text-[12px] font-medium leading-none" style={{ color: "#571A9F" }}>
          ₹{dealValue(creator)}
        </span>
      </div>
    </>
  );
}

function CreatorCard({
  x,
  y,
  creator,
  agency,
  discount,
}: {
  x: number;
  y: number;
  creator: Creator;
  agency?: Agency;
  discount: number;
}) {
  const navigate = useNavigate();
  const variant: Variant = creator.agencyId ? "agency" : "internal";
  return (
    <div
      onClick={() => navigate(`/creators/detail?id=${creator.id}`)}
      className="absolute h-[193px] w-[266px] rounded-[12px] bg-[#F5F5F5] cursor-pointer"
      style={{ left: x, top: y }}
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
        {`${compact(creator.avgViews)} Avg. views`}
      </Metric>
      <Metric icon={Heart} iconColor="#F2777A" left={173} top={51} width={77}>
        {`${creator.engagementRate.toFixed(1)}% ER`}
      </Metric>

      {/* metrics row 2 */}
      <Metric icon={Star} iconColor="#FFC107" fill left={10} top={82} width={87}>
        {`${creator.stars.toFixed(1)} Stars`}
      </Metric>
      <Metric icon={Eye} iconColor="#2CC37F" left={87} top={82} width={91}>
        {`${creator.cpv.toFixed(2)}p CPV`}
      </Metric>
      <Metric icon={Sparkles} iconColor="#603CFF" left={173} top={82} width={79}>
        {`${creator.matchPct ?? 0}% Match`}
      </Metric>

      {/* managed by */}
      <span className="absolute left-[8px] top-[112px] text-[9.3px] leading-none text-ink/70">
        Managed by:
      </span>
      {variant === "internal" ? (
        <InternalManaged creator={creator} />
      ) : (
        <AgencyManaged creator={creator} agency={agency} discount={discount} />
      )}

      {/* selection checkbox */}
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
export default function NewLeadCreatorListPage() {
  const navigate = useNavigate();
  const { data: creators, isLoading } = useCreators();
  const { data: agencies } = useAgencies();
  const all = creators ?? [];
  const list = all.slice(0, ROW_X.length);
  const agencyById = new Map((agencies ?? []).map((a) => [a.id, a]));

  // "% OFF" has no schema equivalent — derive it as how far below the roster's
  // average CPV this creator prices, i.e. a real discount off the going rate.
  const avgCpv = all.length ? all.reduce((s, c) => s + c.cpv, 0) / all.length : 0;
  const discountOf = (c: Creator) =>
    avgCpv > 0 ? Math.max(0, Math.round((1 - c.cpv / avgCpv) * 100)) : 0;

  const selectedCount = list.filter((c) => c.listed).length;
  return (
    <>
      {/* back button — 235,153 · black circle */}
      <span
        onClick={() => navigate(-1)}
        className="absolute left-[235px] top-[153px] flex h-[45px] w-[45px] items-center justify-center rounded-full bg-black cursor-pointer"
      >
        <ChevronLeft className="h-[22px] w-[22px] text-white" strokeWidth={2} />
      </span>

      {/* heading + field underline */}
      <h1 className="absolute left-[271px] top-[236px] text-[34px] font-normal leading-none text-ink">
        New Leads
      </h1>
      <span className="absolute left-[261px] top-[279px] h-[1px] w-[259px] bg-[#CFCBDA]" />

      {/* toolbar — Download dropdown */}
      <div
        onClick={() => navigate("/leads/download")}
        className="absolute left-[610px] top-[247px] flex h-[45px] items-center gap-[8px] rounded-[28px] bg-white/90 pl-[21px] pr-[16px] cursor-pointer"
      >
        <span className="text-[14px] font-light leading-none text-ink">Download</span>
        <ChevronDown className="h-[16px] w-[16px] text-ink" strokeWidth={1.8} />
      </div>

      {/* toolbar — circular actions */}
      <CircleBtn pos="left-[761px] top-[247px]" onClick={() => navigate("/search")}>
        <Search className="h-[22px] w-[22px]" strokeWidth={1.7} />
      </CircleBtn>
      <CircleBtn pos="left-[814px] top-[247px]" onClick={() => navigate("/settings")}>
        <span className="relative flex h-[21px] w-[21px] items-center justify-center">
          <UserRound className="h-[21px] w-[21px]" strokeWidth={1.7} />
          <Star
            className="absolute -bottom-[1px] -right-[3px] h-[9px] w-[9px] fill-white text-ink"
            strokeWidth={1.6}
          />
        </span>
      </CircleBtn>
      <CircleBtn pos="left-[867px] top-[247px]">
        <Trash2 className="h-[20px] w-[20px]" strokeWidth={1.6} />
      </CircleBtn>
      <CircleBtn pos="left-[920px] top-[247px]" onClick={() => navigate("/leads/create-paid")}>
        <Plus className="h-[22px] w-[22px]" strokeWidth={1.8} />
      </CircleBtn>

      {/* toolbar — selection marker */}
      <span className="absolute left-[1007px] top-[262px] flex h-[15px] w-[15px] items-center justify-center rounded-[5px] bg-white">
        <Check className="h-[11px] w-[11px] text-ink" strokeWidth={2.5} />
      </span>
      <span className="absolute left-[1029px] top-[262px] text-[12px] font-light leading-[15px] text-ink">
        {selectedCount} selected
      </span>

      {/* content panel */}
      <div className="absolute left-[256px] top-[300px] h-[300px] w-[1150px] rounded-[24px] bg-white/25" />

      {/* section title */}
      <h2 className="absolute left-[280px] top-[321px] text-[24px] font-normal leading-none text-ink">
        Creators
      </h2>

      {/* creator cards — single row */}
      {ROW_X.map((x, i) =>
        list[i] ? (
          <CreatorCard
            key={list[i].id}
            x={x}
            y={371}
            creator={list[i]}
            agency={list[i].agencyId ? agencyById.get(list[i].agencyId as string) : undefined}
            discount={discountOf(list[i])}
          />
        ) : null,
      )}
      {list.length === 0 ? (
        <span className="absolute left-[282px] top-[371px] h-[193px] w-[266px] text-[12px] leading-[15px] text-ink/50">
          {isLoading ? "Loading creators…" : "No creators yet"}
        </span>
      ) : null}
    </>
  );
}
