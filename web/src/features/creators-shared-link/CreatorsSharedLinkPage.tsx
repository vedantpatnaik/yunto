import type { ReactNode } from "react";
import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useList, useAgencies, useCampaigns, useMe, type Creator } from "@/api/hooks";
import type { LucideIcon } from "lucide-react";
import {
  ArrowLeft,
  ArrowUpRight,
  Check,
  Link2,
  Users,
  Eye,
  Heart,
  Star,
  Sparkles,
  MapPin,
  Coins,
  Flame,
} from "lucide-react";

/**
 * Super Admin — Creators shared link (public creator-list share view).
 * Exact reconstruction of Figma frame 5055:54356 ("Super Admin- creators shared link"), 1440×1024.
 * CLEAN build: the captured frame had the TopBar profile popup + dim scrim open
 * (sibling nodes 5055:55881 scrim / 5055:55882 profile). Those are intentionally skipped —
 * this renders the full-opacity underlying page inside the AppShell (TopBar + Sidebar already present).
 */

const PANEL_FILL = "rgba(227,228,244,0.81)";
const CARD_TRANSLUCENT = "rgba(255,255,255,0.6)";
const MANAGED_GRAD =
  "linear-gradient(90deg, rgba(104,1,254,0.06), rgba(217,217,217,0.06))";

/** 1_200_000 -> "1.2M", 900_000 -> "900k" */
const compactN = (n: number) =>
  n >= 1_000_000 ? `${(n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1)}M`
  : n >= 1_000 ? `${Math.round(n / 1_000)}k` : `${n}`;

/** 65_500 -> "₹65.5K" (card pill), matching the compact money style of the frame. */
const compactMoney = (n: number) =>
  n >= 1_000 ? `₹${(n / 1_000).toFixed(1)}K` : `₹${Math.round(n)}`;

/** ISO timestamp -> "Updated creators 2hrs ago" */
const updatedAgo = (iso?: string) => {
  if (!iso) return "";
  const mins = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60_000));
  if (mins < 60) return `Updated creators ${mins}min ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `Updated creators ${hrs}hrs ago`;
  return `Updated creators ${Math.round(hrs / 24)}d ago`;
};

/** The generic creator payload carries the row's createdAt alongside the typed fields. */
type CreatorRow = Creator & { createdAt?: string };

type Row = {
  y: number;
  cardBg: string;
  offer: boolean; // "Offer" + Ads + fire  (vs "Managed by:")
};

const ROWS: Record<"recommended" | "shortlisted" | "all", Row> = {
  recommended: { y: 369, cardBg: CARD_TRANSLUCENT, offer: true },
  shortlisted: { y: 650, cardBg: CARD_TRANSLUCENT, offer: true },
  all: { y: 922, cardBg: "#F5F5F5", offer: false },
};

const CARD_X = [277, 558, 839, 1120];
const ROWS_KEYS = ["recommended", "shortlisted", "all"] as const;

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

/* Managed-by / Offer agency pill (agency · rating · this creator's fee) */
function AgencyOffer({
  agencyName,
  agencyStars,
  fee,
}: {
  agencyName: string;
  agencyStars: number;
  fee: number;
}) {
  return (
    <>
      <span
        className="absolute left-[8px] top-[135.9px] h-[32.2px] w-[237px] rounded-[10.83px]"
        style={{ background: MANAGED_GRAD, border: "0.8px solid rgba(103,60,255,0.35)" }}
      />
      <span className="absolute left-[14px] top-[140.9px] h-[24px] w-[24px] rounded-full bg-gradient-to-br from-[#C8E6FF] to-[#C8B3ED]" />
      <span className="absolute left-[42px] top-[140.2px] max-w-[115px] truncate text-[10.2px] leading-none text-ink/90">
        {agencyName}
      </span>
      <span className="absolute left-[42px] top-[151.7px] flex items-center gap-[4px]">
        <Star className="h-[12px] w-[12px]" strokeWidth={0} style={{ color: "#FFC107", fill: "#FFC107" }} />
        <span className="text-[8px] font-light leading-none text-ink/60">
          {agencyStars > 0 ? `${agencyStars.toFixed(1)} Stars` : ""}
        </span>
      </span>
      <div
        className="absolute left-[164px] top-[139.9px] flex h-[25px] w-[75px] items-center justify-center gap-[3px] rounded-[8px]"
        style={{ background: "rgba(255,255,255,0.7)" }}
      >
        <Coins className="h-[13px] w-[13px]" strokeWidth={1.7} style={{ color: "#C29B3B" }} />
        <span className="text-[12px] font-medium leading-none" style={{ color: "#571A9F" }}>
          {compactMoney(fee)}
        </span>
      </div>
    </>
  );
}

function CreatorCard({
  x,
  y,
  row,
  creator,
  agencyName,
  agencyStars,
  fee,
  checked,
  onToggle,
}: {
  x: number;
  y: number;
  row: Row;
  creator: CreatorRow;
  agencyName: string;
  agencyStars: number;
  fee: number;
  checked: boolean;
  onToggle: () => void;
}) {
  const navigate = useNavigate();
  return (
    <div
      className="absolute h-[193px] w-[266px] rounded-[12px]"
      style={{ left: x, top: y, background: row.cardBg }}
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
      <div className="absolute left-[51px] top-[10px] w-[75px]">
        <div className="truncate text-[12px] leading-[15px] text-ink/90">{creator.name}</div>
        <div className="truncate text-[8px] leading-[13px] text-ink/70">{creator.handle}</div>
      </div>

      {/* recommended / shortlisted extras: Ads label + fire badge */}
      {row.offer && (
        <>
          <span className="absolute left-[132px] top-[14px] text-[8px] leading-none text-ink/70">Ads</span>
          <Flame className="absolute left-[33px] top-[28px] h-[14px] w-[14px]" strokeWidth={0} style={{ color: "#FF6A3D", fill: "#FF6A3D" }} />
        </>
      )}

      {/* location pill */}
      <div className="absolute left-[163px] top-[8px] flex h-[24px] w-[55px] items-center gap-[2px] rounded-[12px] bg-white pl-[8px]">
        <MapPin className="h-[10px] w-[10px] shrink-0" strokeWidth={2} style={{ color: "#EA4C3B" }} />
        <span className="truncate text-[10px] leading-none text-ink">{creator.location ?? ""}</span>
      </div>

      {/* metrics row 1 */}
      <Metric icon={Users} left={10} top={51} width={68}>{compactN(creator.followers)}</Metric>
      <Metric icon={Eye} iconColor="#2CC37F" fill left={69} top={51} width={110}>
        {`${compactN(creator.avgViews)} Avg. views`}
      </Metric>
      <Metric icon={Heart} iconColor="#F2777A" left={173} top={51} width={77}>
        {`${creator.engagementRate.toFixed(1)}% ER`}
      </Metric>

      {/* metrics row 2 */}
      <Metric icon={Star} iconColor="#FFC107" fill left={10} top={82} width={87}>
        {`${creator.stars} Stars`}
      </Metric>
      <Metric icon={Eye} iconColor="#2CC37F" fill left={87} top={82} width={91}>
        {`${creator.cpv.toFixed(2)}p CPV`}
      </Metric>
      <Metric icon={Sparkles} iconColor="#603CFF" fill left={173} top={82} width={79}>
        {creator.matchPct != null ? `${creator.matchPct}% Match` : ""}
      </Metric>

      {/* offer / managed-by */}
      <span className="absolute left-[8px] top-[112px] text-[9.3px] leading-none text-ink/70">
        {row.offer ? "Offer" : "Managed by:"}
      </span>
      <AgencyOffer agencyName={agencyName} agencyStars={agencyStars} fee={fee} />

      {/* selection checkbox */}
      {checked ? (
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

/* Section source chip — avatar + author + "Updated creators …" */
function SourceChip({ left, top, author, ago }: { left: number; top: number; author: string; ago: string }) {
  return (
    <div
      className="absolute flex h-[32px] w-[258px] items-center rounded-[18px] bg-white pl-[5px]"
      style={{ left, top }}
    >
      <span className="h-[20px] w-[20px] shrink-0 rounded-full bg-gradient-to-br from-[#C8E6FF] to-[#C8B3ED]" />
      <span className="ml-[4px] max-w-[95px] truncate text-[12px] leading-none text-ink/90">{author}</span>
      <span className="ml-[9px] whitespace-nowrap text-[10.2px] font-thin leading-none text-ink/70">{ago}</span>
    </div>
  );
}

/* -------------------------------- page --------------------------------- */
export default function CreatorsSharedLinkPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { data: creators = [], isLoading } = useList<CreatorRow>("creators");
  const { data: agencies = [] } = useAgencies();
  const { data: campaigns = [] } = useCampaigns();
  const { data: me } = useMe();
  const [picked, setPicked] = useState<string[] | null>(null);

  // The campaign this share link belongs to (?id=…), else the newest one.
  const campaign = campaigns.find((c) => c.id === params.get("id")) ?? campaigns[0];

  // Buckets: shortlisted = creators flagged `listed`; recommended = the best
  // remaining matches; all = whatever is left over. Every card is a distinct record.
  const shortlisted = creators.filter((c) => c.listed).slice(0, CARD_X.length);
  const shortIds = new Set(shortlisted.map((c) => c.id));
  const recommended = creators
    .filter((c) => !shortIds.has(c.id))
    .sort((a, b) => (b.matchPct ?? 0) - (a.matchPct ?? 0))
    .slice(0, CARD_X.length);
  const usedIds = new Set([...shortIds, ...recommended.map((c) => c.id)]);
  const rest = creators.filter((c) => !usedIds.has(c.id)).slice(0, CARD_X.length);

  const BUCKETS: Record<(typeof ROWS_KEYS)[number], CreatorRow[]> = {
    recommended,
    shortlisted,
    all: rest,
  };
  const shown = [...recommended, ...shortlisted, ...rest];

  const agencyById = new Map(agencies.map((a) => [a.id, a]));
  /** An agency's star rating = mean stars of the creators on its books. */
  const starsFor = (agencyId: string): number => {
    const books = creators.filter((c) => c.agencyId === agencyId);
    return books.length ? books.reduce((s, c) => s + c.stars, 0) / books.length : 0;
  };

  // Offer pill: this campaign's budget split across the shared creators by share
  // of reach; with no campaign resolved it falls back to the creator's own rate
  // card (CPV in paise × avg. views).
  const budget = campaign?.budget ?? 0;
  const reach = shown.reduce((s, c) => s + c.avgViews, 0);
  const feeFor = (c: CreatorRow) =>
    budget > 0 && reach > 0 ? (budget * c.avgViews) / reach : (c.cpv * c.avgViews) / 100;

  const selected = picked ?? shortlisted.map((c) => c.id);
  const toggle = (id: string) =>
    setPicked(selected.includes(id) ? selected.filter((s) => s !== id) : [...selected, id]);

  // Total costing = the fees of everything currently ticked.
  const totalCosting = shown
    .filter((c) => selected.includes(c.id))
    .reduce((s, c) => s + feeFor(c), 0);

  // TAT estimate = the span of the campaign's timeline ("12 Jul - 21 Jul").
  const [tatFrom, tatTo] = (campaign?.timeline ?? "")
    .split("-")
    .map((part) => parseInt(part.trim(), 10));
  const tatDays =
    Number.isFinite(tatFrom) && Number.isFinite(tatTo) ? Math.max(1, tatTo - tatFrom) : 0;
  const tat = tatDays ? `${tatDays} Day${tatDays > 1 ? "s" : ""}` : "—";

  const newestIn = (list: CreatorRow[]) =>
    list.map((c) => c.createdAt).filter(Boolean).sort().at(-1);
  const shortlistAgency = shortlisted[0]?.agencyId
    ? agencyById.get(shortlisted[0].agencyId)?.name ?? ""
    : "";

  return (
    <>
      {/* frosted content panel — rounded rect with a 717×63 top-left notch */}
      <div className="absolute left-[260px] top-[236px] h-[803px] w-[1133px] overflow-hidden rounded-[24px]">
        <div
          className="absolute inset-0"
          style={{
            background: PANEL_FILL,
            clipPath: "polygon(717px 0, 1133px 0, 1133px 803px, 0px 803px, 0px 63px, 717px 63px)",
          }}
        />
      </div>

      {/* back button */}
      <span
        onClick={() => navigate(-1)}
        className="absolute left-[235px] top-[153px] flex h-[45px] w-[45px] cursor-pointer items-center justify-center rounded-full bg-black"
      >
        <ArrowLeft className="h-[24px] w-[24px] text-white" strokeWidth={2} />
      </span>

      {/* campaign title */}
      <h1 className="absolute left-[261px] top-[228px] max-w-[420px] truncate text-[34px] font-normal leading-[42px] text-ink">
        {campaign?.name ?? ""}
      </h1>

      {/* TAT estimate pill */}
      <div className="absolute left-[694px] top-[245px] flex h-[45px] w-[122px] flex-col justify-center gap-[3px] rounded-[10px] bg-white pl-[13px]">
        <span className="text-[10px] leading-none text-ink/70">TAT Estimate</span>
        <span className="text-[15px] font-medium leading-none text-ink">{tat}</span>
      </div>

      {/* Mark Done */}
      <div
        onClick={() => navigate(campaign ? `/campaigns/detail?id=${campaign.id}` : "/campaigns/detail")}
        className="absolute left-[827px] top-[243px] flex h-[48px] w-[144px] cursor-pointer items-center justify-center rounded-[24px] bg-white"
      >
        <span className="text-[20px] font-extralight leading-none text-ink">Mark Done</span>
      </div>

      {/* selection count */}
      <div className="absolute left-[988px] top-[251px] flex h-[15px] items-center gap-[7px]">
        <span className="flex h-[15px] w-[15px] items-center justify-center rounded-[5px] bg-white">
          <Check className="h-[9px] w-[9px] text-ink" strokeWidth={2.5} />
        </span>
        <span className="text-[12px] font-light leading-none text-ink">{selected.length} selected</span>
      </div>

      {/* Share link */}
      <div
        onClick={() => navigate("/creators/share-link-list")}
        className="absolute left-[1101px] top-[245px] flex h-[45px] w-[131px] cursor-pointer items-center gap-[8px] rounded-[24px] bg-white pl-[16px]"
      >
        <Link2 className="h-[20px] w-[20px] text-ink" strokeWidth={1.6} />
        <span className="text-[14px] font-light text-ink">Share link</span>
      </div>

      {/* Request Creators */}
      <div
        onClick={() => navigate("/creators/find")}
        className="absolute left-[1240px] top-[245px] flex h-[45px] w-[139px] cursor-pointer items-center justify-center rounded-[24px] bg-white"
      >
        <span className="text-[14px] font-light text-ink">Request Creators</span>
      </div>

      {/* ── Recommended Creators ── */}
      <div className="absolute left-[277px] top-[319px] flex h-[32px] items-center text-[20px] font-normal leading-none text-ink">
        Recommended Creators
      </div>
      <SourceChip left={508} top={319} author={me?.name ?? ""} ago={updatedAgo(newestIn(recommended))} />

      {/* ── Shortlisted Creators ── */}
      <div className="absolute left-[277px] top-[600px] flex h-[32px] items-center text-[20px] font-normal leading-none text-ink">
        Shortlisted Creators
      </div>
      <SourceChip left={508} top={600} author={shortlistAgency} ago={updatedAgo(newestIn(shortlisted))} />
      <div className="absolute left-[799px] top-[600px] flex h-[32px] w-[239px] items-center gap-[6px] rounded-[18px] bg-white pl-[11px]">
        <span className="text-[18px] leading-none text-ink/70">
          ₹ {Math.round(totalCosting).toLocaleString("en-IN")}
        </span>
        <span className="text-[16px] font-light leading-none text-ink/70">Total Costing</span>
      </div>

      {/* ── All Creators ── */}
      <div className="absolute left-[277px] top-[869px] flex h-[32px] items-center text-[20px] font-normal leading-none text-ink">
        All Creators
      </div>
      <SourceChip left={508} top={869} author={me?.name ?? ""} ago={updatedAgo(newestIn(rest))} />

      {/* creator cards */}
      {ROWS_KEYS.map((key) =>
        BUCKETS[key].map((creator, ci) => (
          <CreatorCard
            key={`${key}-${creator.id}`}
            x={CARD_X[ci]}
            y={ROWS[key].y}
            row={ROWS[key]}
            creator={creator}
            agencyName={(creator.agencyId ? agencyById.get(creator.agencyId)?.name : "") ?? ""}
            agencyStars={creator.agencyId ? starsFor(creator.agencyId) : 0}
            fee={feeFor(creator)}
            checked={selected.includes(creator.id)}
            onToggle={() => toggle(creator.id)}
          />
        ))
      )}

      {/* empty / loading — inside the same rows, geometry untouched */}
      {ROWS_KEYS.filter((key) => BUCKETS[key].length === 0).map((key) => (
        <span
          key={`empty-${key}`}
          className="absolute text-[13px] leading-[16px] text-ink/40"
          style={{ left: CARD_X[0], top: ROWS[key].y + 16 }}
        >
          {isLoading ? "Loading creators…" : "No creators yet"}
        </span>
      ))}
    </>
  );
}
