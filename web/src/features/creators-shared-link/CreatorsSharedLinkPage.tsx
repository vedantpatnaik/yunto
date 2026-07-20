import type { ReactNode } from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCreators, type Creator } from "@/api/hooks";
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

type Row = {
  y: number;
  cardBg: string;
  offer: boolean; // "Offer" + Ads + fire  (vs "Managed by:")
  checked: boolean;
};

const ROWS: Record<"recommended" | "shortlisted" | "all", Row> = {
  recommended: { y: 369, cardBg: CARD_TRANSLUCENT, offer: true, checked: false },
  shortlisted: { y: 650, cardBg: CARD_TRANSLUCENT, offer: true, checked: true },
  all: { y: 922, cardBg: "#F5F5F5", offer: false, checked: false },
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

/* Managed-by / Offer agency pill (Stellar Talents · ₹65.5K) — shared by every card */
function AgencyOffer() {
  return (
    <>
      <span
        className="absolute left-[8px] top-[135.9px] h-[32.2px] w-[237px] rounded-[10.83px]"
        style={{ background: MANAGED_GRAD, border: "0.8px solid rgba(103,60,255,0.35)" }}
      />
      <span className="absolute left-[14px] top-[140.9px] h-[24px] w-[24px] rounded-full bg-gradient-to-br from-[#C8E6FF] to-[#C8B3ED]" />
      <span className="absolute left-[42px] top-[140.2px] text-[10.2px] leading-none text-ink/90">
        Stellar Talents
      </span>
      <span className="absolute left-[42px] top-[151.7px] flex items-center gap-[4px]">
        <Star className="h-[12px] w-[12px]" strokeWidth={0} style={{ color: "#FFC107", fill: "#FFC107" }} />
        <span className="text-[8px] font-light leading-none text-ink/60">4.8 Stars</span>
      </span>
      <div
        className="absolute left-[164px] top-[139.9px] flex h-[25px] w-[75px] items-center justify-center gap-[3px] rounded-[8px]"
        style={{ background: "rgba(255,255,255,0.7)" }}
      >
        <Coins className="h-[13px] w-[13px]" strokeWidth={1.7} style={{ color: "#C29B3B" }} />
        <span className="text-[12px] font-medium leading-none" style={{ color: "#571A9F" }}>
          ₹65.5K
        </span>
      </div>
    </>
  );
}

function CreatorCard({ x, y, row, creator }: { x: number; y: number; row: Row; creator?: Creator }) {
  const navigate = useNavigate();
  const [checked, setChecked] = useState(row.checked);
  return (
    <div
      className="absolute h-[193px] w-[266px] rounded-[12px]"
      style={{ left: x, top: y, background: row.cardBg }}
    >
      {/* top-right arrow button */}
      <span
        onClick={() => navigate("/creators/detail")}
        className="absolute left-[234px] top-[-1px] flex h-[28px] w-[28px] cursor-pointer items-center justify-center rounded-[16px] bg-white"
      >
        <ArrowUpRight className="h-[16px] w-[16px] text-ink" strokeWidth={1.6} />
      </span>

      {/* avatar + name */}
      <span className="absolute left-[8px] top-[6px] h-[38px] w-[38px] rounded-full bg-gradient-to-br from-[#FFD8B0] to-[#EF9C9C]" />
      <div className="absolute left-[51px] top-[10px]">
        <div className="text-[12px] leading-[15px] text-ink/90">{creator?.name ?? ""}</div>
        <div className="text-[8px] leading-[13px] text-ink/70">{creator?.handle ?? ""}</div>
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
        <span className="text-[10px] leading-none text-ink">{creator?.location ?? ""}</span>
      </div>

      {/* metrics row 1 */}
      <Metric icon={Users} left={10} top={51} width={68}>{creator ? compactN(creator.followers) : ""}</Metric>
      <Metric icon={Eye} iconColor="#2CC37F" fill left={69} top={51} width={110}>
        {creator ? `${compactN(creator.avgViews)} Avg. views` : ""}
      </Metric>
      <Metric icon={Heart} iconColor="#F2777A" left={173} top={51} width={77}>
        {creator ? `${creator.engagementRate.toFixed(1)}% ER` : ""}
      </Metric>

      {/* metrics row 2 */}
      <Metric icon={Star} iconColor="#FFC107" fill left={10} top={82} width={87}>
        {creator ? `${creator.stars} Stars` : ""}
      </Metric>
      <Metric icon={Eye} iconColor="#2CC37F" fill left={87} top={82} width={91}>
        {creator ? `${creator.cpv.toFixed(2)}p CPV` : ""}
      </Metric>
      <Metric icon={Sparkles} iconColor="#603CFF" fill left={173} top={82} width={79}>
        {creator?.matchPct != null ? `${creator.matchPct}% Match` : ""}
      </Metric>

      {/* offer / managed-by */}
      <span className="absolute left-[8px] top-[112px] text-[9.3px] leading-none text-ink/70">
        {row.offer ? "Offer" : "Managed by:"}
      </span>
      <AgencyOffer />

      {/* selection checkbox */}
      {checked ? (
        <span
          onClick={() => setChecked((c) => !c)}
          className="absolute left-[240px] top-[167px] flex h-[15px] w-[15px] cursor-pointer items-center justify-center rounded-[5px] bg-white"
        >
          <Check className="h-[9px] w-[9px] text-ink" strokeWidth={2.5} />
        </span>
      ) : (
        <span
          onClick={() => setChecked((c) => !c)}
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
      <span className="ml-[4px] text-[12px] leading-none text-ink/90">{author}</span>
      <span className="ml-[9px] text-[10.2px] font-thin leading-none text-ink/70">{ago}</span>
    </div>
  );
}

/* -------------------------------- page --------------------------------- */
export default function CreatorsSharedLinkPage() {
  const navigate = useNavigate();
  const { data: creators } = useCreators();
  const cards = (creators ?? []).slice(0, ROWS_KEYS.length * CARD_X.length);
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
      <h1 className="absolute left-[261px] top-[228px] text-[34px] font-normal leading-[42px] text-ink">
        Nike’s Diwali Campaign
      </h1>

      {/* TAT estimate pill */}
      <div className="absolute left-[694px] top-[245px] flex h-[45px] w-[122px] flex-col justify-center gap-[3px] rounded-[10px] bg-white pl-[13px]">
        <span className="text-[10px] leading-none text-ink/70">TAT Estimate</span>
        <span className="text-[15px] font-medium leading-none text-ink">1 Day</span>
      </div>

      {/* Mark Done */}
      <div
        onClick={() => navigate("/campaigns/detail")}
        className="absolute left-[827px] top-[243px] flex h-[48px] w-[144px] cursor-pointer items-center justify-center rounded-[24px] bg-white"
      >
        <span className="text-[20px] font-extralight leading-none text-ink">Mark Done</span>
      </div>

      {/* selection count */}
      <div className="absolute left-[988px] top-[251px] flex h-[15px] items-center gap-[7px]">
        <span className="flex h-[15px] w-[15px] items-center justify-center rounded-[5px] bg-white">
          <Check className="h-[9px] w-[9px] text-ink" strokeWidth={2.5} />
        </span>
        <span className="text-[12px] font-light leading-none text-ink">4 selected</span>
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
      <SourceChip left={508} top={319} author="Dev" ago="Updated creators 2hrs ago" />

      {/* ── Shortlisted Creators ── */}
      <div className="absolute left-[277px] top-[600px] flex h-[32px] items-center text-[20px] font-normal leading-none text-ink">
        Shortlisted Creators
      </div>
      <SourceChip left={508} top={600} author="Stellar Agency" ago="Updated creators 1hrs ago" />
      <div className="absolute left-[799px] top-[600px] flex h-[32px] w-[239px] items-center gap-[6px] rounded-[18px] bg-white pl-[11px]">
        <span className="text-[18px] leading-none text-ink/70">₹ 50,000</span>
        <span className="text-[16px] font-light leading-none text-ink/70">Total Costing</span>
      </div>

      {/* ── All Creators ── */}
      <div className="absolute left-[277px] top-[869px] flex h-[32px] items-center text-[20px] font-normal leading-none text-ink">
        All Creators
      </div>
      <SourceChip left={508} top={869} author="Dev" ago="Updated creators 7hrs ago" />

      {/* creator cards */}
      {ROWS_KEYS.map((key, ri) =>
        CARD_X.map((x, ci) => (
          <CreatorCard
            key={`${key}-${x}`}
            x={x}
            y={ROWS[key].y}
            row={ROWS[key]}
            creator={cards[ri * CARD_X.length + ci]}
          />
        ))
      )}
    </>
  );
}
