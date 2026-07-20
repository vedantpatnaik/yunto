import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import {
  ArrowLeft, Plus, X, Phone, ArrowUpRight, Search, Download, UserRoundPlus,
  Trash2, UsersRound, Eye, Heart, Star, Sparkles, Video, Images, MapPin,
  Pencil, Instagram, Clock,
} from "lucide-react";
import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import whatsapp from "@/assets/icons/whatsapp.svg";
import { useCampaignFull, type CampaignFull } from "@/api/hooks";

type CreatorRow = CampaignFull["creatorList"][number];

/**
 * Super Admin — Campaign detail.
 * Exact reconstruction of Figma frame 5693:24079 ("Super Admin- Campaigns detail"), 1440×1024.
 * Every element is absolutely positioned at its frame-relative coordinate.
 * The profile dropdown + dim scrim siblings (5063:58197…) are intentionally skipped — clean page.
 */

/** budget is a raw integer (e.g. 120000) shown compactly in Indian units as "1.2L" / "2.5Cr". */
function formatBudget(n: number): string {
  if (n >= 10_000_000) return `${(n / 10_000_000).toFixed(1).replace(/\.0$/, "")}Cr`;
  if (n >= 100_000) return `${(n / 100_000).toFixed(1).replace(/\.0$/, "")}L`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}k`;
  return `${n}`;
}

/** compact follower/view counts: 1_200_000 -> "1.2M", 900_000 -> "900k". */
function compact(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}k`;
  return `${n}`;
}

/** full amount with Indian grouping: 250000 -> "2,50,000". */
function inr(n: number): string {
  return n.toLocaleString("en-IN");
}

/* ------------------------------ primitives ----------------------------- */
function RoundBtn({ left, top, size = 28, onClick, children }: { left: number; top: number; size?: number; onClick?: () => void; children: ReactNode }) {
  return (
    <span
      onClick={onClick}
      className={`absolute flex items-center justify-center rounded-full bg-white text-ink${onClick ? " cursor-pointer" : ""}`}
      style={{ left, top, width: size, height: size }}
    >
      {children}
    </span>
  );
}

function Avatar({ left, top, size, from, to }: { left: number; top: number; size: number; from: string; to: string }) {
  return (
    <span
      className="absolute shrink-0 rounded-full"
      style={{ left, top, width: size, height: size, backgroundImage: `linear-gradient(135deg, ${from}, ${to})` }}
    />
  );
}

/* half-filled progress ring (ri:progress-4-line ≈ 50%) */
function ProgressIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9.5" stroke="#79B282" strokeWidth="2" />
      <path d="M12 2.5 A9.5 9.5 0 0 1 12 21.5 Z" fill="#79B282" />
    </svg>
  );
}

/* small white stat pill inside a creator card (coords relative to card origin) */
function Metric({ left, top, width, icon: Icon, iconClass, text }: {
  left: number; top: number; width: number; icon: LucideIcon; iconClass: string; text: string;
}) {
  return (
    <div className="absolute flex h-[24px] items-center gap-[3px] rounded-[12px] bg-white pl-[5px]" style={{ left, top, width }}>
      <Icon className={`h-[15px] w-[15px] ${iconClass}`} strokeWidth={1.6} />
      <span className="text-[10px] leading-none text-ink/80">{text}</span>
    </div>
  );
}

/* plain filter chip (top row) */
function Chip({ label, width }: { label: string; width: number }) {
  return (
    <span
      className="flex h-[30px] items-center justify-center rounded-full bg-white text-[12px] font-light leading-none text-[#121212]"
      style={{ width }}
    >
      {label}
    </span>
  );
}

/* ------------------------------ creator card --------------------------- */
function CreatorCard({ left, top, creator }: { left: number; top: number; creator: CreatorRow }) {
  const navigate = useNavigate();
  return (
    <div className="absolute h-[193px] w-[266px] rounded-[12px] bg-[#F5F5F5]" style={{ left, top }}>
      {/* open arrow */}
      <RoundBtn left={234} top={-1} onClick={() => navigate("/creators/detail")}>
        <ArrowUpRight className="h-[15px] w-[15px] text-ink" strokeWidth={1.8} />
      </RoundBtn>

      {/* avatar + name */}
      <Avatar left={8} top={6} size={38} from="#FFD9E8" to="#C8B3ED" />
      <div className="absolute left-[51px] top-[10px] text-[12px] leading-[15px] text-ink/90">{creator.name}</div>
      <div className="absolute left-[51px] top-[26px] text-[8px] leading-[13px] text-ink/70">{creator.handle}</div>

      {/* progress badge */}
      <span className="absolute left-[150px] top-[5px] flex h-[23px] w-[23px] items-center justify-center rounded-full bg-white">
        <ProgressIcon size={16} />
      </span>

      {/* location pill */}
      <div className="absolute left-[179px] top-[8px] flex h-[18px] w-[40px] items-center justify-center gap-[1px] rounded-[9px] bg-white">
        <MapPin className="h-[9px] w-[9px] text-[#E4572E]" strokeWidth={2} fill="#E4572E" />
        <span className="text-[7.6px] leading-none text-ink">{creator.location ?? ""}</span>
      </div>

      {/* stats row 1 */}
      <Metric left={10} top={51} width={68} icon={UsersRound} iconClass="text-ink" text={compact(creator.followers)} />
      <Metric left={69} top={51} width={110} icon={Eye} iconClass="text-[#2CC37F]" text={`${compact(creator.avgViews)} Avg. views`} />
      <Metric left={173} top={51} width={77} icon={Heart} iconClass="text-ink" text={`${creator.engagementRate.toFixed(1)}% ER`} />

      {/* stats row 2 */}
      <div className="absolute left-[10px] top-[82px] flex h-[24px] w-[87px] items-center gap-[3px] rounded-[12px] bg-white pl-[5px]">
        <Star className="h-[15px] w-[15px] text-[#FDD835]" fill="#FDD835" strokeWidth={0} />
        <span className="text-[10px] leading-none text-ink/80">{creator.stars.toFixed(1)} Stars</span>
      </div>
      <Metric left={87} top={82} width={91} icon={Eye} iconClass="text-[#2CC37F]" text={`${creator.cpv.toFixed(2)}p CPV`} />
      <Metric left={173} top={82} width={79} icon={Sparkles} iconClass="text-[#603CFF]" text="80% Match" />

      {/* managed by */}
      <span className="absolute left-[8px] top-[112px] text-[9.3px] leading-none text-ink/70">Managed by:</span>
      {/* discount badge (overlaps top of managed-by row) */}
      <span
        className="absolute left-[106px] top-[126px] flex h-[12px] w-[47px] items-center justify-center rounded-[3px] text-[9px] leading-none text-white"
        style={{ backgroundImage: "linear-gradient(90deg, #A27CEE, #7F4BE7)" }}
      >
        -45% OFF
      </span>
      <div className="absolute left-[8px] top-[132px] flex h-[33px] w-[237px] items-center rounded-[11px] border border-[#6801FE]/20 bg-[#6801FE]/[0.04] px-[8px]">
        <Avatar left={13} top={137} size={24} from="#C8E6FF" to="#C8B3ED" />
        <div className="ml-[32px]">
          <div className="text-[10.2px] leading-[12px] text-ink/90">Stellar Talents</div>
          <div className="mt-[1px] flex items-center gap-[3px]">
            <Star className="h-[9px] w-[9px] text-[#FDD835]" fill="#FDD835" strokeWidth={0} />
            <span className="text-[8px] font-light leading-none text-ink/60">4.8 Stars</span>
          </div>
        </div>
        <div className="absolute right-[6px] flex h-[25px] items-center gap-[3px] rounded-[8px] bg-white/70 px-[7px]">
          <span className="text-[12px] leading-none">💰</span>
          <span className="text-[12px] font-medium leading-none text-[#571A9F]">₹65.5K</span>
        </div>
      </div>

      {/* checkbox */}
      <span className="absolute left-[240px] top-[167px] h-[15px] w-[15px] rounded-[5px] border-[1.5px] border-black bg-white" />
    </div>
  );
}

/* -------------------------------- page --------------------------------- */
export default function CampaignDetailPage() {
  const navigate = useNavigate();
  const [sp] = useSearchParams();
  const id = sp.get("id");
  const { data: item } = useCampaignFull(id);
  const creators = item?.creatorList ?? [];
  const inv = item?.invoice ?? null;
  const [followUpDismissed, setFollowUpDismissed] = useState(false);
  return (
    <>
      {/* back button */}
      <span
        onClick={() => navigate(-1)}
        className="absolute left-[235px] top-[153px] flex h-[45px] w-[45px] cursor-pointer items-center justify-center rounded-full bg-black text-white"
      >
        <ArrowLeft className="h-[20px] w-[20px]" strokeWidth={2} />
      </span>

      {/* title + underline */}
      <h1 className="absolute left-[268px] top-[236px] text-[34px] font-normal leading-none text-ink">{item?.name ?? ""}</h1>
      <span className="absolute left-[261px] top-[280px] h-px w-[259px] bg-[#C9C9C9]" />

      {/* ============================ main container ======================= */}
      <div className="absolute left-[261px] top-[301px] h-[334px] w-[838px] rounded-[24px] bg-[#F3F3F3]/[0.13]" />

      {/* filter chips row */}
      <div className="absolute left-[270px] top-[314px] flex items-center gap-[8px]">
        <Chip label={item?.timeline ?? ""} width={98} />
        <Chip label={item?.brandName ?? ""} width={72} />
        <Chip label={item?.website ?? ""} width={148} />
        <Chip label={item ? `Budget ₹${formatBudget(item.budget)}` : "Budget ₹-"} width={89} />
        <Chip label={item?.status ?? "-"} width={72} />
      </div>

      {/* Reporting / Mark Closed pills */}
      <div className="absolute left-[829px] top-[307px] flex items-center gap-[8px]">
        <span onClick={() => navigate("/campaigns/rating")} className="flex h-[45px] w-[121px] cursor-pointer items-center justify-center rounded-[28px] bg-white/90">
          <span className="whitespace-nowrap text-[14px] font-light leading-none text-black/[0.99]">Reporting</span>
        </span>
        <span onClick={() => navigate("/campaigns")} className="flex h-[45px] w-[121px] cursor-pointer items-center justify-center rounded-[28px] bg-white/90">
          <span className="whitespace-nowrap text-[14px] font-light leading-none text-black/[0.99]">Mark Closed</span>
        </span>
      </div>

      {/* ---- Assigned to ---- */}
      <Avatar left={271} top={378} size={45} from="#C8E6FF" to="#C8B3ED" />
      <span className="absolute left-[293px] top-[378px] flex h-[45px] w-[45px] items-center justify-center rounded-full bg-[#F4C1C1] text-[15.4px] text-[#B93636]">{item?.contactPerson?.charAt(0) ?? ""}</span>
      <div className="absolute left-[346px] top-[380px] text-[12px] leading-none text-ink/70">Assigned to</div>
      <div className="absolute left-[346px] top-[399px] text-[24px] leading-none text-ink/90">{item?.contactPerson ?? ""}</div>
      <span onClick={() => navigate("/campaigns/assign")} className="absolute left-[496px] top-[392px] flex h-[21.5px] w-[43px] cursor-pointer items-center justify-center gap-[3px] rounded-[13px] bg-black/90 text-white">
        <span className="text-[6.8px] font-light leading-none">Add</span>
        <Plus className="h-[8px] w-[8px]" strokeWidth={2} />
      </span>

      {/* ---- Campaign Progress card ---- */}
      <div className="absolute left-[586px] top-[375px] h-[53px] w-[204px] rounded-[13px] bg-white" />
      <span className="absolute left-[591px] top-[383px] flex h-[38px] w-[38px] items-center justify-center">
        <ProgressIcon size={38} />
      </span>
      <div className="absolute left-[639px] top-[382px] text-[12px] leading-none text-ink/70">Campaign Progress</div>
      <div className="absolute left-[639px] top-[402px] text-[18px] leading-none text-ink/90">{item ? `${item.progress}%` : "-"}</div>

      {/* ---- Lead Source card ---- */}
      <div className="absolute left-[805px] top-[375px] h-[53px] w-[274px] rounded-[13px] bg-white" />
      <Avatar left={810} top={383} size={38} from="#C8E6FF" to="#C8B3ED" />
      <div className="absolute left-[858px] top-[383px] text-[12px] leading-none text-ink/70">Lead Source</div>
      <div className="absolute left-[858px] top-[401px] text-[18px] leading-none text-ink/90">Leena Sharma</div>
      <RoundBtn left={986} top={390} size={24} onClick={() => navigate("/leads/detail")}>
        <ArrowUpRight className="h-[13px] w-[13px] text-ink" strokeWidth={1.8} />
      </RoundBtn>
      <RoundBtn left={1015} top={390} size={24} onClick={() => navigate("/chat")}>
        <Phone className="h-[13px] w-[13px] text-ink" strokeWidth={1.6} />
      </RoundBtn>
      <img src={whatsapp} alt="WhatsApp" onClick={() => navigate("/chat")} className="absolute left-[1045px] top-[390px] h-[24px] w-[24px] cursor-pointer" />

      {/* ---- Message card ---- */}
      <div className="absolute left-[271px] top-[449px] h-[178px] w-[258px] rounded-[12px] bg-[#F5F5F5]" />
      <span className="absolute left-[283px] top-[457px] text-[12px] leading-none text-ink">Message</span>
      <RoundBtn left={495} top={457} size={24} onClick={() => navigate("/chat")}>
        <Plus className="h-[12px] w-[12px] text-ink" strokeWidth={1.6} />
      </RoundBtn>
      <div className="absolute left-[283px] top-[482px] h-[130px] w-[236px] rounded-[12px] bg-white" />
      <p className="absolute left-[289px] top-[488px] w-[219px] text-[12px] font-light leading-[20px] text-ink/60">
        We are launching a new skincare product and need a influencer in skincare promotion. Can we discuss the partnership opportunity
      </p>

      {/* ---- Deliverables card ---- */}
      <div className="absolute left-[545px] top-[449px] h-[178px] w-[258px] rounded-[12px] bg-[#F5F5F5]" />
      <span className="absolute left-[557px] top-[457px] text-[12px] leading-none text-ink">Deliverables</span>
      <RoundBtn left={769} top={457} size={24} onClick={() => navigate("/campaigns/assign")}>
        <Plus className="h-[12px] w-[12px] text-ink" strokeWidth={1.6} />
      </RoundBtn>
      <div className="absolute left-[557px] top-[487px] h-[127px] w-[236px] rounded-[12px] bg-white" />
      <div className="absolute left-[564px] top-[493px] h-[36px] w-[128px] rounded-[12px] bg-white">
        <Instagram className="absolute left-[0px] top-[2px] h-[16px] w-[16px] text-[#C837AB]" strokeWidth={1.6} />
        <div className="absolute left-[26px] top-[4px] flex items-center gap-[5px]">
          <Video className="h-[12px] w-[12px] text-ink/70" strokeWidth={1.6} />
          <span className="text-[12px] font-light leading-none text-ink/60">1 Collab Reel</span>
        </div>
        <div className="absolute left-[26px] top-[22px] flex items-center gap-[5px]">
          <Images className="h-[12px] w-[12px] text-ink/70" strokeWidth={1.6} />
          <span className="text-[12px] font-light leading-none text-ink/60">2 Stories</span>
        </div>
      </div>

      {/* ---- Add Notes card ---- */}
      <div className="absolute left-[819px] top-[449px] h-[178px] w-[258px] rounded-[12px] bg-[#F5F5F5]" />
      <span className="absolute left-[831px] top-[457px] text-[12px] leading-none text-ink">Add Notes</span>
      <RoundBtn left={1043} top={457} size={24} onClick={() => navigate("/reminders")}>
        <Plus className="h-[12px] w-[12px] text-ink" strokeWidth={1.6} />
      </RoundBtn>
      <div className="absolute left-[831px] top-[487px] h-[130px] w-[236px] rounded-[12px] bg-white" />
      <span className="absolute left-[837px] top-[494px] text-[12px] leading-none text-ink/70">Today</span>
      <span className="absolute left-[878px] top-[502px] h-px w-[92px] bg-ink/10" />
      <p className="absolute left-[837px] top-[514px] w-[226px] text-[12px] font-light leading-[20px] text-ink/60">here comes your note</p>

      {/* ============================ Follow Up ============================ */}
      <div className="absolute left-[1109px] top-[301px] h-[234px] w-[295px] rounded-[12px] bg-[#D68A8A]/30" />
      <span className="absolute left-[1119px] top-[310px] text-[12px] leading-none text-ink">Follow Up</span>
      <RoundBtn left={1376} top={301} onClick={() => navigate("/reminders")}>
        <Plus className="h-[15px] w-[15px] text-ink" strokeWidth={1.6} />
      </RoundBtn>
      <div className="absolute left-[1119px] top-[340px] h-[184px] w-[272px] rounded-[12px] bg-white" />
      <span className="absolute left-[1120px] top-[345px] text-[12px] leading-none text-ink/70">Today</span>
      <span className="absolute left-[1160px] top-[351px] h-px w-[92px] bg-ink/10" />
      {/* follow-up item */}
      {!followUpDismissed && (
        <>
          <div className="absolute left-[1122px] top-[371px] flex h-[52px] w-[38px] flex-col items-center justify-center rounded-[18px] bg-[#D8DDFF]">
            <span className="text-[15px] font-light leading-[16px] text-ink">20</span>
            <span className="text-[15px] font-light leading-[16px] text-ink">Fri</span>
          </div>
          <div className="absolute left-[1166px] top-[377px] text-[16px] leading-none text-ink">Follow - Up Scheduled</div>
          <div className="absolute left-[1166px] top-[405px] flex items-center gap-[4px]">
            <Avatar left={0} top={0} size={14} from="#FFD9E8" to="#C8B3ED" />
            <span className="ml-[18px] text-[10.2px] leading-none text-ink/90">Priya Sharma</span>
          </div>
          <span onClick={() => setFollowUpDismissed(true)} className="absolute left-[1372px] top-[377px] text-ink/70 cursor-pointer">
            <X className="h-[18px] w-[18px]" strokeWidth={1.6} />
          </span>
        </>
      )}

      {/* ============================ Payment Summary ===================== */}
      <div className="absolute left-[1109px] top-[553px] h-[437px] w-[295px] rounded-[12px] bg-[#F5F5F5]/60" />
      <span className="absolute left-[1119px] top-[562px] text-[12px] leading-none text-ink">Payment Summary</span>
      <RoundBtn left={1376} top={553} onClick={() => navigate("/invoices")}>
        <ArrowUpRight className="h-[15px] w-[15px] text-ink" strokeWidth={1.8} />
      </RoundBtn>

      {/* invoice card */}
      <div className="absolute left-[1119px] top-[596px] h-[375px] w-[270px] rounded-[12px] bg-white" />
      <div className="absolute left-[1119px] top-[616px] w-[270px] text-center text-[16px] font-medium leading-none text-ink">{inv?.brandName ?? "Brand Name"}</div>

      {/* Invoice token */}
      <div className="absolute left-[1139px] top-[655px] h-[45px] w-[230px] rounded-[10px] border border-dashed border-black/40" />
      <span className="absolute left-[1139px] top-[649px] w-[230px] text-center">
        <span className="bg-white px-[5px] font-mono text-[9px] font-medium tracking-[0.15em] text-ink">Invoice</span>
      </span>
      <div className="absolute left-[1139px] top-[672px] w-[230px] text-center font-mono text-[12.6px] font-bold tracking-[0.12em] text-ink">{inv?.number ?? ""}</div>

      {/* divider */}
      <span className="absolute left-[1131px] top-[715px] h-px w-[246px] bg-ink/10" />

      {/* Brand Budget */}
      <div className="absolute left-[1131px] top-[733px] flex w-[246px] items-center justify-between">
        <span className="text-[13px] font-medium leading-none text-ink">Brand Budget</span>
        <span className="text-[12px] font-medium leading-none text-ink/50">{inv ? `₹${inr(inv.budget)}` : ""}</span>
      </div>

      {/* Leena Sharma */}
      <div className="absolute left-[1131px] top-[757px] flex w-[246px] items-center justify-between">
        <span className="text-[12px] leading-none text-ink/50">{creators[0]?.name ?? ""}</span>
        <span className="flex items-center gap-[8px]">
          <span className="text-[12px] leading-none text-[#E44E26]">- ₹1,00,000</span>
          <span onClick={() => navigate("/payments/paid")} className="flex h-[16px] w-[16px] cursor-pointer items-center justify-center rounded-full bg-[#ECEAEA]">
            <Pencil className="h-[8px] w-[8px] text-ink" strokeWidth={1.8} />
          </span>
        </span>
      </div>

      {/* Riya Sharma */}
      <div className="absolute left-[1131px] top-[781px] flex w-[246px] items-center justify-between">
        <span className="text-[12px] leading-none text-ink/50">{creators[1]?.name ?? ""}</span>
        <span className="flex items-center gap-[8px]">
          <span className="flex items-baseline gap-[3px] text-[#E44E26]">
            <span className="text-[7.2px] leading-none line-through">₹1,20,000</span>
            <span className="text-[12px] leading-none">- ₹1,00,000</span>
          </span>
          <span onClick={() => navigate("/payments/paid")} className="flex h-[16px] w-[16px] cursor-pointer items-center justify-center rounded-full bg-[#ECEAEA]">
            <Pencil className="h-[8px] w-[8px] text-ink" strokeWidth={1.8} />
          </span>
        </span>
      </div>

      {/* Agency Fee token */}
      <div className="absolute left-[1139px] top-[808px] h-[44px] w-[230px] rounded-[10px] border border-dashed border-black/40" />
      <span className="absolute left-[1139px] top-[803px] w-[230px] text-center">
        <span className="bg-white px-[5px] font-mono text-[9px] font-medium tracking-[0.15em] text-ink">Agency Fee</span>
      </span>
      <div className="absolute left-[1146px] top-[822px] flex h-[22px] w-[117px] items-center gap-[6px] rounded-full border border-black/5 bg-white px-[4px]">
        <span className="flex h-[13px] w-[13px] items-center justify-center rounded-full bg-[#ECEAEA]">
          <Plus className="h-[7px] w-[7px] text-ink" strokeWidth={2} />
        </span>
        <span className="text-[12px] leading-none text-ink">Added</span>
        <span className="ml-auto flex items-center gap-[3px]">
          <span className="text-[12px] font-medium leading-none text-[#3DBB6C]">{inv ? `${Math.round((inv.agencyFee / inv.budget) * 100)}%` : ""}</span>
          <span onClick={() => navigate("/payments/paid")} className="flex h-[16px] w-[16px] cursor-pointer items-center justify-center rounded-full bg-[#ECEAEA]">
            <Pencil className="h-[8px] w-[8px] text-ink" strokeWidth={1.8} />
          </span>
        </span>
      </div>
      <span className="absolute left-[1311px] top-[826px] text-[12px] font-medium leading-none text-ink/50">{inv ? `₹${inr(inv.agencyFee)}` : ""}</span>

      {/* Received Payment */}
      <div className="absolute left-[1134px] top-[866px] flex h-[38px] w-[239px] items-center justify-between rounded-[13px] bg-white px-[9px]">
        <span className="text-[13px] font-medium leading-none text-ink">Received Payment</span>
        <span onClick={() => navigate("/payments/received")} className="text-[12px] leading-none text-[#200BD6] cursor-pointer">Add</span>
      </div>

      {/* divider */}
      <span className="absolute left-[1131px] top-[916px] h-px w-[246px] bg-ink/10" />

      {/* Estimate Payout */}
      <div className="absolute left-[1131px] top-[932px] flex w-[246px] items-center justify-between">
        <span className="text-[13px] font-medium leading-none text-ink">Estimate Payout</span>
        <span className="text-[15px] font-semibold leading-none text-[#3DBB6C]">{inv ? `₹${inr(inv.payout)}` : ""}</span>
      </div>

      {/* ============================ Creators ============================ */}
      <div className="absolute left-[261px] top-[655px] h-[274px] w-[590px] rounded-[12px] bg-[#F5F5F5]/60" />
      <span className="absolute left-[271px] top-[664px] text-[12px] leading-none text-ink">Creators</span>
      <RoundBtn left={631} top={662} onClick={() => navigate("/leads/download")}>
        <Download className="h-[15px] w-[15px] text-ink" strokeWidth={1.6} />
      </RoundBtn>
      <RoundBtn left={668} top={662} onClick={() => navigate("/search")}>
        <Search className="h-[14px] w-[14px] text-ink" strokeWidth={1.7} />
      </RoundBtn>
      <RoundBtn left={704} top={662} onClick={() => navigate("/leads/add-creator")}>
        <UserRoundPlus className="h-[15px] w-[15px] text-ink" strokeWidth={1.6} />
      </RoundBtn>
      <RoundBtn left={740} top={662} onClick={() => navigate("/campaigns/creator-list")}>
        <Trash2 className="h-[14px] w-[14px] text-ink" strokeWidth={1.6} />
      </RoundBtn>
      <RoundBtn left={778} top={662} onClick={() => navigate("/campaigns/assign")}>
        <Plus className="h-[13px] w-[13px] text-ink" strokeWidth={1.7} />
      </RoundBtn>
      <RoundBtn left={820} top={662} onClick={() => navigate("/campaigns/creator-list")}>
        <ArrowUpRight className="h-[15px] w-[15px] text-ink" strokeWidth={1.8} />
      </RoundBtn>

      {creators.slice(0, 2).map((cr, i) => (
        <CreatorCard key={cr.id} left={272 + i * 282} top={712} creator={cr} />
      ))}

      {/* ============================ Activity ============================ */}
      <div className="absolute left-[863px] top-[655px] h-[275px] w-[236px] rounded-[12px] bg-[#F9F9F9]/70" />
      <span className="absolute left-[875px] top-[664px] text-[12px] leading-none text-ink">Activity</span>
      <div className="absolute left-[875px] top-[693px] h-[225px] w-[212px] rounded-[12px] bg-white" />
      <span className="absolute left-[881px] top-[702px] text-[12px] leading-none text-ink/70">Today</span>
      <span className="absolute left-[922px] top-[710px] h-px w-[92px] bg-ink/10" />

      {/* activity — Follow up schedule */}
      <div className="absolute left-[881px] top-[726px] flex h-[52px] w-[36px] flex-col items-center justify-center rounded-[18px] bg-[#D8DDFF]">
        <span className="text-[13px] font-light leading-[16px] text-ink">20</span>
        <span className="text-[13px] font-light leading-[16px] text-ink">Fri</span>
      </div>
      <div className="absolute left-[923px] top-[730px] text-[16px] leading-none text-ink">Follow up schedule</div>
      <div className="absolute left-[923px] top-[752px] flex h-[24px] w-[74px] items-center gap-[4px] rounded-[18px] bg-white pl-[4px]">
        <Clock className="h-[14px] w-[14px] text-ink/60" strokeWidth={1.6} />
        <span className="text-[10.2px] leading-none text-ink/60">02:00 pm</span>
      </div>

      {/* activity — Yesterday */}
      <span className="absolute left-[881px] top-[789px] text-[12px] leading-none text-ink/70">Yesterday</span>
      <span className="absolute left-[947px] top-[797px] h-px w-[92px] bg-ink/10" />

      {/* activity — Call */}
      <div className="absolute left-[881px] top-[817px] flex h-[52px] w-[36px] flex-col items-center justify-center rounded-[18px] bg-[#EFEFF0]">
        <span className="text-[13px] font-light leading-[16px] text-ink">19</span>
        <span className="text-[13px] font-light leading-[16px] text-ink">Thu</span>
      </div>
      <div className="absolute left-[923px] top-[821px] text-[16px] leading-none text-ink">Call</div>
      <div className="absolute left-[923px] top-[843px] flex h-[24px] w-[74px] items-center gap-[4px] rounded-[18px] bg-white pl-[4px]">
        <Clock className="h-[14px] w-[14px] text-ink/60" strokeWidth={1.6} />
        <span className="text-[10.2px] leading-none text-ink/60">01:00 pm</span>
      </div>
    </>
  );
}
