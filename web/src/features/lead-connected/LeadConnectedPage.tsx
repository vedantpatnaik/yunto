import type { LucideIcon } from "lucide-react";
import {
  ChevronLeft,
  Search,
  UserRound,
  Trash2,
  Plus,
  Check,
  Link as LinkIcon,
  FileSpreadsheet,
  ArrowUpRight,
  Contrast,
  MapPin,
  Users,
  Eye,
  Heart,
  Star,
  Sparkles,
  Wallet,
} from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useLeads, type Lead } from "@/api/hooks";

/**
 * Super Admin — Lead Connected (Leads sub-flow).
 * Exact reconstruction of Figma frame 5652:9258 ("Super Admin- lead connected"), 1440×1024.
 * Clean build: the profile-dropdown popup + dim scrim siblings are intentionally omitted.
 */

const MANAGED_BOX_GRADIENT =
  "linear-gradient(90deg,rgba(104,1,254,0.06),rgba(217,217,217,0.06))";
const DISCOUNT_GRADIENT = "linear-gradient(90deg,#A27CEE,#7F4BE7)";

/** compact follower/people counts: 1_200_000 -> "1.2M", 900_000 -> "900k". */
function compact(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}k`;
  return String(n);
}

/* --------------------------------- chips -------------------------------- */
type ChipDef = {
  icon: LucideIcon;
  color: string;
  fill?: boolean;
  sw?: number;
  label: string;
  left: number;
  width: number;
};

function StatChip({ chip, top }: { chip: ChipDef; top: number }) {
  const { icon: Icon, color, fill, sw, label, left, width } = chip;
  return (
    <div
      className="absolute flex h-[24px] items-center gap-[3px] rounded-[12px] bg-white pl-[5px]"
      style={{ left, top, width }}
    >
      <Icon
        className="h-[14px] w-[14px] shrink-0"
        style={{ color, fill: fill ? color : "none" }}
        strokeWidth={sw ?? 1.7}
      />
      <span className="whitespace-nowrap text-[10px] leading-none text-ink/80">
        {label}
      </span>
    </div>
  );
}

const ROW_2: ChipDef[] = [
  { icon: Star, color: "#FFC107", fill: true, label: "4.8 Stars", left: 10, width: 87 },
  { icon: Eye, color: "#2CC37F", sw: 2.2, label: "0.23p CPV", left: 87, width: 91 },
  { icon: Sparkles, color: "#603CFF", fill: true, label: "80% Match", left: 173, width: 79 },
];

/* --------------------------------- card --------------------------------- */
function CreatorCard({
  left,
  top,
  variant,
  lead,
}: {
  left: number;
  top: number;
  variant: "socyio" | "stellar";
  lead?: Lead;
}) {
  const navigate = useNavigate();
  const row1: ChipDef[] = [
    { icon: Users, color: "#000000", label: compact(lead?.peopleCount ?? 0), left: 10, width: 68 },
    { icon: Eye, color: "#2CC37F", sw: 2.2, label: "900k Avg. views", left: 69, width: 110 },
    { icon: Heart, color: "#F8348C", label: lead?.engagementRate ?? "", left: 173, width: 77 },
  ];
  return (
    <div className="absolute h-[193px] w-[266px]" style={{ left, top }}>
      {/* base */}
      <div className="absolute inset-0 rounded-[12px] bg-[#F5F5F5]" />

      {/* open arrow */}
      <span
        className="absolute left-[234px] top-[-1px] flex h-[28px] w-[28px] cursor-pointer items-center justify-center rounded-[16px] bg-white"
        onClick={() => navigate("/creators/detail")}
      >
        <ArrowUpRight className="h-[15px] w-[15px] text-black" strokeWidth={1.7} />
      </span>

      {/* creator avatar + name */}
      <span className="absolute left-[8px] top-[6px] h-[38px] w-[38px] rounded-full bg-gradient-to-br from-[#C8E6FF] to-[#C8B3ED]" />
      <div className="absolute left-[51px] top-[10.5px] text-[12px] leading-[15px] text-ink/90">
        {lead?.contactPerson ?? ""}
      </div>
      <div className="absolute left-[51px] top-[26.5px] text-[8px] leading-[13px] text-ink/70">
        @leenabliss
      </div>

      {/* progress + location */}
      <span className="absolute left-[150px] top-[5px] flex h-[23px] w-[23px] items-center justify-center rounded-full bg-white">
        <Contrast className="h-[16px] w-[16px] text-[#79B282]" strokeWidth={1.6} />
      </span>
      <span className="absolute left-[179px] top-[8px] flex h-[18px] w-[40px] items-center justify-center gap-[2px] rounded-[9px] bg-white">
        <MapPin className="h-[9px] w-[9px] text-[#E53935]" fill="#E53935" strokeWidth={1.5} />
        <span className="text-[7.6px] leading-none text-black">Delhi</span>
      </span>

      {/* stat chips */}
      {row1.map((c) => (
        <StatChip key={c.label} chip={c} top={51} />
      ))}
      {ROW_2.map((c) => (
        <StatChip key={c.label} chip={c} top={82} />
      ))}

      {/* managed by */}
      <span className="absolute left-[8px] top-[112px] text-[9.3px] leading-none text-ink/70">
        Managed by:
      </span>

      {variant === "socyio" ? (
        <>
          <div
            className="absolute left-[8px] top-[135.9px] h-[32.2px] w-[237px] rounded-[10.83px] border border-[rgba(104,1,254,0.12)]"
            style={{ background: MANAGED_BOX_GRADIENT }}
          />
          <span className="absolute left-[14px] top-[139.9px] h-[24px] w-[24px] rounded-full bg-gradient-to-br from-[#FFD6E7] to-[#C8B3ED]" />
          <span className="absolute left-[42px] top-[146.2px] text-[10.2px] leading-none text-ink/90">
            Socyio - Internal
          </span>
          <span className="absolute left-[170px] top-[140.9px] flex h-[22px] w-[69px] items-center justify-center gap-[3px] rounded-[8px] bg-white">
            <Wallet className="h-[12px] w-[12px] text-black" strokeWidth={1.6} />
            <span className="text-[12px] font-medium leading-none text-[#571A9F]">₹ {lead?.money ?? ""}</span>
          </span>
        </>
      ) : (
        <>
          <div
            className="absolute left-[8px] top-[132px] h-[33px] w-[237px] rounded-[10.83px] border border-[rgba(104,1,254,0.12)]"
            style={{ background: MANAGED_BOX_GRADIENT }}
          />
          <span
            className="absolute left-[106px] top-[126px] flex h-[12px] w-[47px] items-center justify-center rounded-[3px] text-[9px] leading-none text-white"
            style={{ background: DISCOUNT_GRADIENT }}
          >
            -45% OFF
          </span>
          <span className="absolute left-[13px] top-[137px] h-[24px] w-[24px] rounded-full bg-gradient-to-br from-[#FFD6E7] to-[#C8B3ED]" />
          <span className="absolute left-[41px] top-[136.2px] text-[10.2px] leading-none text-ink/90">
            Stellar Talents
          </span>
          <span className="absolute left-[41px] top-[147.8px] flex items-center gap-[4px]">
            <Star className="h-[12px] w-[12px] text-[#FFC107]" fill="#FFC107" strokeWidth={1.5} />
            <span className="text-[8px] font-light leading-none text-ink/60">4.8 Stars</span>
          </span>
          <span className="absolute left-[163px] top-[136px] flex h-[25px] w-[75px] items-center justify-center gap-[3px] rounded-[8px] bg-white/70">
            <Wallet className="h-[12px] w-[12px] text-[#C9A227]" strokeWidth={1.6} />
            <span className="text-[12px] font-medium leading-none text-[#571A9F]">₹{lead?.money ?? ""}</span>
          </span>
        </>
      )}

      {/* select check */}
      <span className="absolute left-[240px] top-[167px] flex h-[15px] w-[15px] items-center justify-center rounded-[5px] bg-white">
        <Check className="h-[10px] w-[10px] text-black" strokeWidth={2} />
      </span>
    </div>
  );
}

function CardRow({ top, baseLeft, lead }: { top: number; baseLeft: number; lead?: Lead }) {
  const variants: Array<"socyio" | "stellar"> = ["socyio", "stellar", "stellar", "stellar"];
  return (
    <>
      {variants.map((v, i) => (
        <CreatorCard key={i} left={baseLeft + i * 281} top={top} variant={v} lead={lead} />
      ))}
    </>
  );
}

/* -------------------------- top action buttons -------------------------- */
function IconButton({
  left,
  icon: Icon,
  size,
  onClick,
}: {
  left: number;
  icon: LucideIcon;
  size: number;
  onClick?: () => void;
}) {
  return (
    <span
      className={`absolute top-[247px] flex h-[45px] w-[45px] items-center justify-center rounded-full bg-white${
        onClick ? " cursor-pointer" : ""
      }`}
      style={{ left }}
      onClick={onClick}
    >
      <Icon className="text-black" style={{ height: size, width: size }} strokeWidth={1.7} />
    </span>
  );
}

/* --------------------------------- page --------------------------------- */
export default function LeadConnectedPage() {
  const navigate = useNavigate();
  const [sp] = useSearchParams();
  const id = sp.get("id");
  const { data } = useLeads();
  const leads = data ?? [];
  const item =
    leads.find((l) => l.id === id) ??
    leads.find((l) => l.status === "CONNECTED" || l.status === "CONVERTED");
  return (
    <>
      {/* back button */}
      <span
        className="absolute left-[235px] top-[153px] flex h-[45px] w-[45px] cursor-pointer items-center justify-center rounded-full bg-black"
        onClick={() => navigate(-1)}
      >
        <ChevronLeft className="h-[22px] w-[22px] text-white" strokeWidth={2} />
      </span>

      {/* title */}
      <h1 className="absolute left-[268px] top-[232px] text-[34px] font-normal leading-[42.8px] text-black">
        {item?.brandName ?? ""}
      </h1>

      {/* content panel border (subtracted notch under the title) */}
      <svg
        className="pointer-events-none absolute left-[260px] top-[246px]"
        width={1152}
        height={994}
        viewBox="-1 -1 1152 994"
        fill="none"
      >
        <path
          d="M0 54 L716 54 L716 0 L1126 0 A24 24 0 0 1 1150 24 L1150 968 A24 24 0 0 1 1126 992 L24 992 A24 24 0 0 1 0 968 Z"
          stroke="#D4D4D4"
          strokeWidth={1}
        />
      </svg>

      {/* action buttons */}
      <IconButton left={761} icon={Search} size={22} onClick={() => navigate("/search")} />
      <IconButton left={814} icon={UserRound} size={22} onClick={() => navigate("/contacts")} />
      <IconButton left={867} icon={Trash2} size={20} />
      <IconButton
        left={920}
        icon={Plus}
        size={22}
        onClick={() => navigate("/leads/add-creator")}
      />

      {/* selection chip */}
      <span className="absolute left-[1007px] top-[262px] flex h-[15px] w-[15px] items-center justify-center rounded-[5px] bg-white">
        <Check className="h-[10px] w-[10px] text-black" strokeWidth={2} />
      </span>
      <span className="absolute left-[1029px] top-[262px] text-[12px] font-light leading-[15px] text-black">
        1 selected
      </span>

      {/* share link / download */}
      <span
        className="absolute left-[1102px] top-[256px] flex h-[45px] w-[131px] cursor-pointer items-center gap-[8px] rounded-[24px] bg-white pl-[16px]"
        onClick={() => navigate("/creators/share-link-list")}
      >
        <LinkIcon className="h-[20px] w-[20px] text-black" strokeWidth={1.6} />
        <span className="text-[14px] font-light text-black">Share link</span>
      </span>
      <span
        className="absolute left-[1241px] top-[256px] flex h-[45px] w-[127px] cursor-pointer items-center gap-[8px] rounded-[24px] bg-white pl-[17.5px]"
        onClick={() => navigate("/leads/download")}
      >
        <FileSpreadsheet className="h-[20px] w-[20px] text-[#21A366]" strokeWidth={1.6} />
        <span className="text-[14px] font-light text-black">Download</span>
      </span>

      {/* scrollable creator sections (clipped like the source scroll frame) */}
      <div className="absolute left-[245px] top-[308px] h-[665px] w-[1182px] overflow-hidden">
        {/* Mega / Celebrity row (second row of the section is the first visible) */}
        <CardRow top={16.5} baseLeft={36.5} lead={item} />

        {/* Macro Creators */}
        <h2 className="absolute left-[36px] top-[225.5px] text-[24px] font-normal leading-none text-black">
          Macro Creators (250K – 1M)
        </h2>
        <CardRow top={270.5} baseLeft={36} lead={item} />
        <CardRow top={479.5} baseLeft={36} lead={item} />
      </div>
    </>
  );
}
