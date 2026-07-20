import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAgencies, useCampaignFull, useCampaigns, useCreators, type Creator } from "@/api/hooks";
import {
  ChevronLeft,
  Search,
  UserRound,
  Trash2,
  Plus,
  Check,
  Link2,
  FileSpreadsheet,
  ArrowUpRight,
  Users,
  Eye,
  Heart,
  Star,
  Sparkles,
  X,
} from "lucide-react";

/**
 * Super Admin — Rating Creator (mark done campaign).
 * Exact reconstruction of Figma frame 4870:54886, 1440×1024.
 * The underlying "Nike's Diwali" creators page renders at full opacity; the
 * "Rate the creator" modal (this screen's purpose) sits over its own dim scrim.
 * Renders inside the AppShell (TopBar + Sidebar already present) — page content only.
 */

/** compact follower/view counts: 1_200_000 -> "1.2M", 900_000 -> "900k". */
function compact(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}k`;
  return `${n}`;
}

/* ------------------------------ primitives ----------------------------- */
function Stat({ icon: Icon, iconClass, children }: { icon: LucideIcon; iconClass: string; children: ReactNode }) {
  return (
    <span className="flex h-[24px] items-center gap-[3px] whitespace-nowrap rounded-[12px] bg-white px-[5px] text-[10px] text-ink/80">
      <Icon className={`h-[13px] w-[13px] ${iconClass}`} strokeWidth={1.7} />
      {children}
    </span>
  );
}

function CircleBtn({ icon: Icon }: { icon: LucideIcon }) {
  return (
    <span className="flex h-[45px] w-[45px] items-center justify-center rounded-full bg-white">
      <Icon className="h-[22px] w-[22px] text-ink" strokeWidth={1.7} />
    </span>
  );
}

/* ------------------------------- creator card -------------------------- */
function CreatorCard({
  x,
  c,
  agencyName,
  agencyStars,
}: {
  x: number;
  c: Creator;
  agencyName: string;
  agencyStars: number | null;
}) {
  return (
    <div
      className="absolute top-[369px] h-[193px] w-[266px] rounded-[12px] border border-[#D9D9D9] bg-[#F5F5F5]"
      style={{ left: x }}
    >
      {/* arrow */}
      <span className="absolute left-[234px] top-[-1px] flex h-[28px] w-[28px] items-center justify-center rounded-full bg-white">
        <ArrowUpRight className="h-[15px] w-[15px] text-ink" strokeWidth={1.8} />
      </span>

      {/* avatar */}
      <span className="absolute left-[8px] top-[6px] h-[38px] w-[38px] rounded-full bg-[linear-gradient(135deg,#F6C99A_0%,#B26AD6_100%)]" />
      <div className="absolute left-[51px] top-[10px] text-[12px] leading-[15px] text-ink/90">{c.name}</div>
      <div className="absolute left-[51px] top-[26px] text-[8px] leading-[13px] text-ink/70">{c.handle}</div>

      {/* Delhi pill */}
      <div className="absolute left-[179px] top-[8px] flex h-[18px] items-center gap-[2px] rounded-[9px] bg-white px-[4px]">
        <span className="text-[8px] leading-none">📍</span>
        <span className="text-[8px] text-ink">{c.location ?? ""}</span>
      </div>

      {/* stat row 1 */}
      <div className="absolute left-[10px] top-[51px] flex gap-[3px]">
        <Stat icon={Users} iconClass="text-ink">{compact(c.followers)}</Stat>
        <Stat icon={Eye} iconClass="text-[#2CC37F]">{`${compact(c.avgViews)} Avg. views`}</Stat>
        <Stat icon={Heart} iconClass="text-[#EC4899]">{`${c.engagementRate.toFixed(1)}% ER`}</Stat>
      </div>

      {/* stat row 2 */}
      <div className="absolute left-[10px] top-[82px] flex gap-[3px]">
        <Stat icon={Star} iconClass="fill-[#FDD835] text-[#FDD835]">{`${c.stars.toFixed(1)} Stars`}</Stat>
        <Stat icon={Eye} iconClass="text-[#2CC37F]">{`${c.cpv.toFixed(2)}p CPV`}</Stat>
        <Stat icon={Sparkles} iconClass="fill-[#603CFF] text-[#603CFF]">{`${c.matchPct ?? 0}% Match`}</Stat>
      </div>

      {/* managed by */}
      <span className="absolute left-[8px] top-[112px] text-[9.3px] text-ink/70">Managed by:</span>
      <div
        className="absolute left-[8px] top-[136px] flex h-[38px] w-[237px] items-center rounded-[11px] border border-[#603CFF]/10 px-[6px]"
        style={{ background: "linear-gradient(90deg, rgba(104,1,254,0.06) 0%, rgba(217,217,217,0.06) 100%)" }}
      >
        <span className="h-[24px] w-[24px] shrink-0 rounded-full bg-[linear-gradient(135deg,#C8E6FF,#C8B3ED)]" />
        <div className="ml-[4px]">
          <div className="text-[10.2px] leading-[12px] text-ink/90">{agencyName}</div>
          <div className="text-[8px] font-light leading-[12px] text-ink/60">
            {agencyStars === null ? "Unrated" : `${agencyStars.toFixed(1)} Stars`}
          </div>
        </div>
        <span className="ml-auto flex h-[25px] w-[81px] items-center justify-center gap-[4px] rounded-[8px] bg-white/70">
          <Star className="h-[13px] w-[13px] fill-[#E8E6E6] text-[#E8E6E6]" strokeWidth={1} />
          <span className="text-[12px] text-ink">Rate Now</span>
        </span>
      </div>
    </div>
  );
}

/* --------------------------------- modal ------------------------------- */
function StarRow({ top }: { top: number }) {
  return (
    <div className="absolute left-[28px] flex w-[243px] justify-between" style={{ top }}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star key={i} className="h-[36.8px] w-[36.8px] fill-[#E8E6E6] text-[#E8E6E6]" strokeWidth={1} />
      ))}
    </div>
  );
}

const QUESTIONS: { label: string; labelTop: number; starsTop: number }[] = [
  { label: "How would you rate this collaboration overall?", labelTop: 170, starsTop: 199 },
  { label: "How satisfied were you with the quality of the deliverables?", labelTop: 264, starsTop: 293 },
  { label: "How professional was the creator’s behaviour during collaboration?", labelTop: 358, starsTop: 389 },
  { label: "How effective was the creator’s communication throughout the campaign?", labelTop: 454, starsTop: 485 },
];

/* -------------------------------- page --------------------------------- */
export default function RatingCreatorPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const { data: campaigns } = useCampaigns();
  const campaignId = params.get("id") ?? campaigns?.[0]?.id ?? null;
  const { data: full } = useCampaignFull(campaignId);
  const { data: creators, isLoading } = useCreators();
  const { data: agencies } = useAgencies();

  const campaignName = full?.name ?? campaigns?.find((c) => c.id === campaignId)?.name ?? "";

  /* roster = the campaign's assigned creators, resolved against the full creator
     records (campaign/:id/full omits matchPct + agencyId). Falls back to all creators. */
  const allCreators = creators ?? [];
  const memberIds = new Set((full?.creatorList ?? []).map((c) => c.id));
  const roster = memberIds.size ? allCreators.filter((c) => memberIds.has(c.id)) : allCreators;
  const cards = roster.slice(0, 4);
  const cardX = [277, 558, 839, 1120];

  /* managing agency per creator + its star rating, averaged from that agency's
     creators (Agency has no stars column in the schema). */
  const agencyNameById = new Map((agencies ?? []).map((a) => [a.id, a.name]));
  const agencyStarsById = new Map<string, number>();
  const tally = new Map<string, { sum: number; n: number }>();
  for (const c of allCreators) {
    if (!c.agencyId) continue;
    const t = tally.get(c.agencyId) ?? { sum: 0, n: 0 };
    tally.set(c.agencyId, { sum: t.sum + c.stars, n: t.n + 1 });
  }
  for (const [id, t] of tally) agencyStarsById.set(id, t.sum / t.n);

  /* the creator this modal is rating — ?creator= or the first card. */
  const ratingTarget = allCreators.find((c) => c.id === params.get("creator")) ?? cards[0];
  const selectedCount = ratingTarget ? 1 : 0;
  return (
    <>
      {/* ===================== underlying creators page ===================== */}
      {/* content panel */}
      <div className="absolute left-[261px] top-[247px] h-[777px] w-[1150px] rounded-[24px] border border-[#D9D9D9]" />

      {/* back */}
      <button
        onClick={() => navigate(-1)}
        className="absolute left-[235px] top-[153px] flex h-[45px] w-[45px] items-center justify-center rounded-full bg-black"
      >
        <ChevronLeft className="h-[24px] w-[24px] text-white" strokeWidth={2} />
      </button>

      {/* campaign title */}
      <h1 className="absolute left-[268px] top-[230px] text-[34px] font-normal leading-none text-ink">{campaignName}</h1>

      {/* action buttons */}
      <div className="absolute left-[761px] top-[247px] flex gap-[8px]">
        <CircleBtn icon={Search} />
        <CircleBtn icon={UserRound} />
        <CircleBtn icon={Trash2} />
        <CircleBtn icon={Plus} />
      </div>

      {/* 1 selected */}
      <div className="absolute left-[1007px] top-[262px] flex h-[15px] items-center gap-[7px]">
        <span className="flex h-[15px] w-[15px] items-center justify-center rounded-[5px] bg-white">
          <Check className="h-[9px] w-[9px] text-ink" strokeWidth={2.6} />
        </span>
        <span className="text-[12px] font-light text-ink">{selectedCount} selected</span>
      </div>

      {/* share link */}
      <div className="absolute left-[1102px] top-[256px] flex h-[45px] w-[131px] items-center gap-[8px] rounded-[24px] bg-white px-[16px]">
        <Link2 className="h-[20px] w-[20px] text-ink" strokeWidth={1.8} />
        <span className="text-[14px] font-light text-ink">Share link</span>
      </div>

      {/* download */}
      <div className="absolute left-[1241px] top-[256px] flex h-[45px] w-[127px] items-center gap-[8px] rounded-[24px] bg-white px-[16px]">
        <FileSpreadsheet className="h-[20px] w-[20px] text-[#107C41]" strokeWidth={1.7} />
        <span className="text-[14px] font-light text-ink">Download</span>
      </div>

      {/* Creators heading */}
      <h2 className="absolute left-[276px] top-[309px] text-[24px] font-normal text-ink">Creators</h2>

      {/* creator cards */}
      {cards.map((c, i) => (
        <CreatorCard
          key={c.id}
          x={cardX[i]}
          c={c}
          agencyName={(c.agencyId && agencyNameById.get(c.agencyId)) || "Unmanaged"}
          agencyStars={c.agencyId ? agencyStarsById.get(c.agencyId) ?? null : null}
        />
      ))}
      {cards.length === 0 && (
        <div
          className="absolute top-[369px] flex h-[193px] w-[266px] items-center justify-center rounded-[12px] border border-[#D9D9D9] bg-[#F5F5F5] px-[10px] text-center text-[12px] text-ink/60"
          style={{ left: cardX[0] }}
        >
          {isLoading ? "Loading creators…" : "No creators on this campaign yet"}
        </div>
      )}

      {/* ============================== dim scrim ============================== */}
      {/* Figma frame 1171276614: rgba(0,0,0,0.5) over the full 1439×1024 frame.
          TopBar is z-10 and Sidebar z-20, so the scrim must clear them. */}
      <div className="absolute inset-0 z-30 bg-black/50" />

      {/* ======================= Rate the creator modal ======================= */}
      <div className="absolute left-[398.5px] top-[174px] z-40 h-[657px] w-[643px] rounded-[24px] bg-white">
        {/* title */}
        <h3 className="absolute left-[28px] top-[29px] text-[24px] font-medium leading-none text-ink">Rate the creator</h3>

        {/* close */}
        <button
          onClick={() => navigate(-1)}
          className="absolute left-[567px] top-[29px] flex h-[48px] w-[48px] items-center justify-center rounded-full border border-black/20 bg-white"
        >
          <X className="h-[15px] w-[15px] text-ink" strokeWidth={2} />
        </button>

        {/* subtitle */}
        <p className="absolute left-[28px] top-[94px] w-[593px] text-[15px] font-normal leading-[24px] text-ink/70">
          Your feedback helps us and the creator grow stronger together. Please take a moment to rate and review.
        </p>

        {/* questions + star rows */}
        {QUESTIONS.map((q) => (
          <div key={q.label} className="absolute left-[28px] w-[540px] text-[16px] font-normal leading-[16px] text-ink" style={{ top: q.labelTop }}>
            {q.label}
          </div>
        ))}
        {QUESTIONS.map((q) => (
          <StarRow key={q.starsTop} top={q.starsTop} />
        ))}

        {/* submit */}
        <button className="absolute left-[28px] top-[583px] flex h-[45px] w-[199px] items-center justify-center rounded-[24px] bg-black/95">
          <span className="text-[20px] font-normal leading-none text-white">Submit Rating</span>
        </button>
      </div>
    </>
  );
}
