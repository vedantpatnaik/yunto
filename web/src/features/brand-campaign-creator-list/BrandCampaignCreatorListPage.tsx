import type { ReactNode } from "react";
import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import type { LucideIcon } from "lucide-react";
import {
  useCreators,
  useAgencies,
  useCampaigns,
  useCampaignFull,
  type Creator,
} from "@/api/hooks";
import {
  ChevronLeft,
  ChevronDown,
  ArrowUpRight,
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
 * Brand — Campaign detail creator list (Campaigns sub-flow).
 * Reconstruction of Figma frame 5055:49920 ("brand- Campaigns detail - creator list"), 1440×1024.
 *
 * Layout: back button, "Nike's Diwali" heading (underlined), a floating tab dropdown
 * (Client Details / Creators / Script), a "Download ▾" pill, a rounded "Creators" panel
 * holding one row of four creator cards, and a bottom bulk-action bar
 * ("1 of 4 selected · Mark Shortlisted · Mark Done · Delete").
 *
 * The exact REST geometry for this node could not be fetched (the socyio Figma
 * account is rate-limit capped), so per-node positions were measured from the
 * 2× reference render (scratchpad/screens2/brand-campaign-creator-list.png).
 * CLEAN build: the captured frame's dim profile-popup + scrim overlay are skipped.
 */

/** Column origins for the single row of creator cards (4 slots wide). */
const CARD_X = [275, 559, 843, 1127];

const CARD_Y = 360;

const MANAGED_GRAD =
  "linear-gradient(90deg, rgba(104,1,254,0.06), rgba(217,217,217,0.06))";

const TABS = ["Client Details", "Creators", "Script"];

/* ---------------------------- format helpers --------------------------- */
const compact = (n: number): string => {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  if (n >= 1_000) return Math.round(n / 1_000) + "k";
  return String(n);
};

/** Rupee amounts as they read on the fee pills: 60K, 65.5K, 1.2L. */
const money = (n: number): string => {
  if (n >= 100_000) return (n / 100_000).toFixed(1).replace(/\.0$/, "") + "L";
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
  return String(Math.round(n));
};

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
      className="absolute flex h-[26px] items-center gap-[3px] rounded-[13px] bg-white px-[6px]"
      style={{ left, top, width }}
    >
      <Icon
        className="h-[17px] w-[17px] shrink-0"
        strokeWidth={1.7}
        style={{ color: iconColor ?? "#000000", fill: fill ? iconColor : "none" }}
      />
      <span className="whitespace-nowrap text-[11px] leading-none text-ink/80">
        {children}
      </span>
    </div>
  );
}

function InternalManaged({ fee }: { fee: number }) {
  return (
    <>
      <span
        className="absolute left-[6px] top-[142px] h-[32px] w-[251px] rounded-[11px] border border-[#6801FE]/25"
        style={{ background: MANAGED_GRAD }}
      />
      <span className="absolute left-[13px] top-[147px] h-[24px] w-[24px] rounded-full bg-gradient-to-br from-[#FF9EC4] to-[#C8B3ED]" />
      <span className="absolute left-[43px] top-[152px] text-[11px] leading-none text-ink/90">
        Socyio - Internal
      </span>
      <div className="absolute left-[178px] top-[147px] flex h-[23px] w-[72px] items-center justify-center gap-[3px] rounded-[8px] bg-white">
        <Coins className="h-[14px] w-[14px]" strokeWidth={1.7} style={{ color: "#C29B3B" }} />
        <span className="text-[12.5px] font-medium leading-none" style={{ color: "#571A9F" }}>
          ₹ {money(fee)}
        </span>
      </div>
    </>
  );
}

function AgencyManaged({
  name,
  stars,
  fee,
  discount,
}: {
  name: string;
  stars: number;
  fee: number;
  discount: number;
}) {
  return (
    <>
      <span
        className="absolute left-[6px] top-[140px] h-[33px] w-[251px] rounded-[11px] border border-[#6801FE]/15"
        style={{ background: MANAGED_GRAD }}
      />
      {discount > 0 && (
        <div
          className="absolute left-[104px] top-[133px] flex h-[13px] w-[49px] items-center justify-center rounded-[3px]"
          style={{ background: "linear-gradient(90deg,#A27CEE,#7F4BE7)" }}
        >
          <span className="whitespace-nowrap text-[9px] leading-none text-white">
            -{discount}% OFF
          </span>
        </div>
      )}
      <span className="absolute left-[12px] top-[145px] h-[24px] w-[24px] rounded-full bg-gradient-to-br from-[#C8E6FF] to-[#C8B3ED]" />
      <span className="absolute left-[42px] top-[144px] max-w-[124px] truncate text-[11px] leading-none text-ink/90">
        {name}
      </span>
      <span className="absolute left-[42px] top-[157px] flex items-center gap-[4px]">
        <Star className="h-[12px] w-[12px]" strokeWidth={0} style={{ color: "#FFC107", fill: "#FFC107" }} />
        <span className="text-[8.5px] leading-none text-ink/60">{stars.toFixed(1)} Stars</span>
      </span>
      <div
        className="absolute left-[170px] top-[144px] flex h-[26px] w-[78px] items-center justify-center gap-[3px] rounded-[8px]"
        style={{ background: "rgba(255,255,255,0.7)" }}
      >
        <Coins className="h-[14px] w-[14px]" strokeWidth={1.7} style={{ color: "#C29B3B" }} />
        <span className="text-[12.5px] font-medium leading-none" style={{ color: "#571A9F" }}>
          ₹{money(fee)}
        </span>
      </div>
    </>
  );
}

function CreatorCard({
  x,
  y,
  creator,
  agencyName,
  agencyStars,
  fee,
  discount,
  selected,
  onToggle,
  onOpen,
}: {
  x: number;
  y: number;
  creator: Creator;
  agencyName: string | null;
  agencyStars: number;
  fee: number;
  discount: number;
  selected: boolean;
  onToggle: () => void;
  onOpen: () => void;
}) {
  return (
    <div
      className="absolute h-[208px] w-[265px] cursor-pointer rounded-[12px] bg-[#F4F4F4]"
      style={{ left: x, top: y }}
      onClick={onOpen}
    >
      {/* top-right arrow button */}
      <span className="absolute left-[233px] top-[-4px] flex h-[30px] w-[30px] items-center justify-center rounded-full bg-white">
        <ArrowUpRight className="h-[17px] w-[17px] text-ink" strokeWidth={1.6} />
      </span>

      {/* avatar + name */}
      <span className="absolute left-[11px] top-[14px] h-[36px] w-[36px] rounded-full bg-gradient-to-br from-[#FFD8B0] to-[#EF9C9C]" />
      <div className="absolute left-[53px] top-[16px]">
        <div className="text-[13px] leading-[16px] text-ink/90">{creator.name}</div>
        <div className="text-[9.5px] leading-[12px] text-ink/60">{creator.handle}</div>
      </div>

      {/* progress ring */}
      <span className="absolute left-[150px] top-[15px] flex h-[24px] w-[24px] items-center justify-center rounded-full bg-white">
        <LoaderCircle className="h-[16px] w-[16px]" strokeWidth={2} style={{ color: "#79B282" }} />
      </span>

      {/* location pill */}
      <span className="absolute left-[178px] top-[17px] flex h-[20px] w-[46px] items-center justify-center gap-[2px] rounded-[10px] bg-white">
        <MapPin className="h-[9px] w-[9px]" strokeWidth={2} style={{ color: "#EA4C3B" }} />
        <span className="text-[8.5px] leading-none text-ink">{creator.location ?? ""}</span>
      </span>

      {/* metrics row 1 */}
      <Metric icon={Users} left={8} top={60} width={62}>{compact(creator.followers)}</Metric>
      <Metric icon={Eye} iconColor="#2CC37F" left={72} top={60} width={118}>
        {compact(creator.avgViews)} Avg. views
      </Metric>
      <Metric icon={Heart} iconColor="#F2777A" left={192} top={60} width={70}>
        {creator.engagementRate.toFixed(1)}% ER
      </Metric>

      {/* metrics row 2 */}
      <Metric icon={Star} iconColor="#FFC107" fill left={8} top={94} width={90}>
        {creator.stars.toFixed(1)} Stars
      </Metric>
      <Metric icon={Eye} iconColor="#2CC37F" left={100} top={94} width={94}>
        {creator.cpv.toFixed(2)}p CPV
      </Metric>
      <Metric icon={Sparkles} iconColor="#603CFF" left={196} top={94} width={66}>
        {creator.matchPct ?? 0}% Match
      </Metric>

      {/* managed by */}
      <span className="absolute left-[8px] top-[126px] text-[9.5px] leading-none text-ink/60">
        Managed by:
      </span>
      {agencyName === null ? (
        <InternalManaged fee={fee} />
      ) : (
        <AgencyManaged name={agencyName} stars={agencyStars} fee={fee} discount={discount} />
      )}

      {/* checkbox */}
      {selected ? (
        <span
          className="absolute left-[232px] top-[178px] flex h-[22px] w-[22px] items-center justify-center rounded-[6px] border border-black/25 bg-white"
          onClick={(e) => {
            e.stopPropagation();
            onToggle();
          }}
        >
          <Check className="h-[13px] w-[13px] text-ink" strokeWidth={2.5} />
        </span>
      ) : (
        <span
          className="absolute left-[232px] top-[178px] h-[22px] w-[22px] rounded-[6px] border border-black/15 bg-white"
          onClick={(e) => {
            e.stopPropagation();
            onToggle();
          }}
        />
      )}
    </div>
  );
}

/* -------------------------------- page --------------------------------- */
export default function BrandCampaignCreatorListPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [activeTab, setActiveTab] = useState(1);
  const [picked, setPicked] = useState<string[] | null>(null);

  const { data: campaigns = [] } = useCampaigns();
  const campaignId = params.get("id") ?? campaigns[0]?.id ?? null;
  const { data: campaign } = useCampaignFull(campaignId);
  const { data: allCreators = [], isLoading } = useCreators();
  const { data: agencies = [] } = useAgencies();

  // Roster = the creators actually linked to this campaign; before a campaign is
  // resolved (or if none are linked yet) fall back to the full creator list.
  const linkedIds = campaign?.creatorList.map((c) => c.id) ?? [];
  const roster = linkedIds.length
    ? allCreators.filter((c) => linkedIds.includes(c.id))
    : allCreators;
  const creators = roster.slice(0, CARD_X.length);

  const agencyById = new Map(agencies.map((a) => [a.id, a]));
  /** An agency's star rating = mean stars of the creators on its books. */
  const starsFor = (agencyId: string): number => {
    const books = allCreators.filter((c) => c.agencyId === agencyId);
    return books.length
      ? books.reduce((s, c) => s + c.stars, 0) / books.length
      : 0;
  };

  // Fee pill: this campaign's budget split across its creators by share of
  // reach; the OFF badge is that fee measured against the creator's own
  // rate card (CPV × avg. views), so a cheaper-than-list buy reads as a discount.
  const budget = campaign?.budget ?? 0;
  const reach = creators.reduce((s, c) => s + c.avgViews, 0);
  const listRate = (c: Creator) => (c.cpv * c.avgViews) / 100;
  const feeFor = (c: Creator) =>
    budget > 0 && reach > 0 ? (budget * c.avgViews) / reach : listRate(c);
  const discountFor = (c: Creator) => {
    const list = listRate(c);
    if (list <= 0) return 0;
    return Math.max(0, Math.round((1 - feeFor(c) / list) * 100));
  };

  const selected = picked ?? creators.slice(0, 1).map((c) => c.id);
  const toggle = (id: string) =>
    setPicked(
      selected.includes(id) ? selected.filter((s) => s !== id) : [...selected, id]
    );

  return (
    <>
      {/* back button */}
      <span
        className="absolute left-[235px] top-[152px] flex h-[45px] w-[45px] cursor-pointer items-center justify-center rounded-full bg-black"
        onClick={() => navigate(-1)}
      >
        <ChevronLeft className="h-[24px] w-[24px] text-white" strokeWidth={2} />
      </span>

      {/* campaign title + underline */}
      <h1 className="absolute left-[266px] top-[236px] max-w-[380px] truncate text-[35px] font-normal leading-none text-[#1A1A1A]">
        {campaign?.name ?? ""}
      </h1>
      <span className="absolute left-[262px] top-[280px] h-px w-[258px] bg-[#D0D0D0]" />

      {/* Download pill */}
      <button
        className="absolute left-[651px] top-[242px] flex h-[52px] w-[130px] cursor-pointer items-center justify-center gap-[10px] rounded-[26px] bg-white"
        onClick={() => navigate("/leads/download")}
      >
        <span className="text-[18px] font-normal text-[#1A1A1A]">Download</span>
        <ChevronDown className="h-[18px] w-[18px] text-[#1A1A1A]" strokeWidth={2} />
      </button>

      {/* tab dropdown (floats above the top nav) */}
      <div className="absolute left-[590px] top-[107px] z-30 w-[170px] overflow-hidden rounded-[12px] border border-black/10 bg-white shadow-[0_8px_24px_rgba(0,0,0,0.08)]">
        {TABS.map((t, i) => (
          <div
            key={t}
            onClick={() => setActiveTab(i)}
            className={`flex h-[42px] cursor-pointer items-center px-[16px] text-[22px] text-[#1A1A1A] ${
              i > 0 ? "border-t border-black/[0.07]" : ""
            } ${i === activeTab ? "bg-black/[0.03]" : ""}`}
          >
            {t}
          </div>
        ))}
      </div>

      {/* Creators panel */}
      <div className="absolute left-[262px] top-[297px] h-[300px] w-[1156px] rounded-[20px] border border-black/[0.06] bg-white/25" />
      <h2 className="absolute left-[275px] top-[324px] text-[24px] font-normal leading-none text-[#1A1A1A]">
        Creators
      </h2>

      {/* creator cards */}
      {creators.map((creator, i) => {
        const agency = creator.agencyId ? agencyById.get(creator.agencyId) : undefined;
        return (
          <CreatorCard
            key={creator.id}
            x={CARD_X[i]}
            y={CARD_Y}
            creator={creator}
            agencyName={agency?.name ?? null}
            agencyStars={agency ? starsFor(agency.id) : 0}
            fee={feeFor(creator)}
            discount={discountFor(creator)}
            selected={selected.includes(creator.id)}
            onToggle={() => toggle(creator.id)}
            onOpen={() => navigate(`/creators/detail?id=${creator.id}`)}
          />
        );
      })}
      {creators.length === 0 && (
        <span
          className="absolute text-[13px] leading-[16px] text-ink/40"
          style={{ left: CARD_X[0], top: CARD_Y + 16 }}
        >
          {isLoading ? "Loading creators…" : "No creators on this campaign yet"}
        </span>
      )}

      {/* bottom bulk-action bar */}
      <div className="absolute left-[414px] top-[887px] flex h-[65px] w-[612px] items-center rounded-[33px] bg-black pl-[27px]">
        <span className="flex h-[25px] w-[25px] items-center justify-center rounded-[7px] bg-white">
          <Check className="h-[15px] w-[15px] text-ink/70" strokeWidth={2.5} />
        </span>
        <span className="ml-[13px] whitespace-nowrap text-[16px] leading-none">
          <span className="font-semibold text-white">{selected.length}</span>
          <span className="text-white/55"> of {creators.length} selected</span>
        </span>
        <span
          className="ml-[52px] cursor-pointer whitespace-nowrap text-[20px] font-light leading-none text-white"
          onClick={() => navigate("/campaigns/detail")}
        >
          Mark Shortlisted
        </span>
        <span
          className="ml-[26px] cursor-pointer whitespace-nowrap text-[20px] font-light leading-none text-white"
          onClick={() => navigate("/campaigns/detail")}
        >
          Mark Done
        </span>
        <span
          className="ml-[26px] cursor-pointer whitespace-nowrap text-[20px] font-light leading-none text-white"
          onClick={() => navigate("/campaigns/detail")}
        >
          Delete
        </span>
      </div>
    </>
  );
}
