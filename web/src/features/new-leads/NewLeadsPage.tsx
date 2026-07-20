import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import {
  ChevronLeft,
  ChevronDown,
  Search,
  UserRound,
  Trash2,
  Plus,
  Check,
  Link,
  FileSpreadsheet,
  ArrowUpRight,
  Users,
  Eye,
  Heart,
  Star,
  Sparkles,
  Wallet,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLeads, type Lead } from "@/api/hooks";

/** 1_200_000 -> "1.2M", 900_000 -> "900k", 45 -> "45". */
const compact = (n: number) =>
  n >= 1_000_000
    ? `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`
    : n >= 1_000
    ? `${Math.round(n / 1_000)}k`
    : String(n);

/**
 * Super Admin — New Leads (Leads sub-flow).
 * Exact reconstruction of Figma frame 5690:14724 ("Super Admin- new leads"), 1440×1024.
 * Built CLEAN — the profile-dropdown popup + dim scrim siblings are intentionally omitted.
 * The vertical scroll container (window y 314→979) is captured mid-scroll: the Mega header
 * and its first row are scrolled off-top, so the topmost visible row is the Mega second row.
 */

/* ------------------------------ primitives ----------------------------- */
function CircleBtn({ children, dark, pos, onClick }: { children: ReactNode; dark?: boolean; pos: string; onClick?: () => void }) {
  return (
    <span
      onClick={onClick}
      className={`absolute flex h-[45px] w-[45px] items-center justify-center rounded-full ${
        dark ? "bg-black text-white" : "bg-white text-ink"
      } ${onClick ? "cursor-pointer " : ""}${pos}`}
    >
      {children}
    </span>
  );
}

function StatChip({ icon: Icon, iconCls, label, pos }: { icon: LucideIcon; iconCls: string; label: string; pos: string }) {
  return (
    <div className={`absolute flex h-[24px] items-center gap-[3px] rounded-full bg-white px-[6px] ${pos}`}>
      <Icon className={`h-[13px] w-[13px] ${iconCls}`} strokeWidth={1.6} />
      <span className="text-[10px] leading-none text-ink/80">{label}</span>
    </div>
  );
}

/* ----------------------- managed-by (two variants) --------------------- */
function InternalManaged({ money }: { money: string }) {
  return (
    <>
      <div className="absolute left-[8px] top-[136px] h-[32px] w-[237px] rounded-[11px] bg-[rgba(104,1,254,0.06)]" />
      <span className="absolute left-[14px] top-[140px] h-[24px] w-[24px] rounded-full bg-gradient-to-br from-[#FFD6E7] to-[#C8B3ED]" />
      <div className="absolute left-[42px] top-[147px] text-[10.2px] leading-none text-ink/90">Socyio - Internal</div>
      <div className="absolute left-[170px] top-[141px] flex h-[22px] w-[69px] items-center gap-[3px] rounded-[8px] bg-white pl-[9px]">
        <Wallet className="h-[12px] w-[12px] text-[#AA8F4D]" strokeWidth={1.6} />
        <span className="text-[12px] font-medium leading-none text-[#571A9F]">₹ {money}</span>
      </div>
    </>
  );
}

function AgencyManaged({ money }: { money: string }) {
  return (
    <>
      <div className="absolute left-[8px] top-[132px] h-[33px] w-[237px] rounded-[11px] bg-[rgba(104,1,254,0.06)]" />
      <div className="absolute left-[106px] top-[126px] flex h-[12px] w-[47px] items-center justify-center rounded-[3px] bg-gradient-to-r from-[#A27CEE] to-[#7F4BE7]">
        <span className="text-[9px] leading-none text-white">-45% OFF</span>
      </div>
      <span className="absolute left-[13px] top-[137px] h-[24px] w-[24px] rounded-full bg-gradient-to-br from-[#FFD6E7] to-[#C8B3ED]" />
      <div className="absolute left-[41px] top-[137px] text-[10.2px] leading-none text-ink/90">Stellar Talents</div>
      <div className="absolute left-[41px] top-[149px] flex items-center gap-[3px]">
        <Star className="h-[11px] w-[11px] fill-[#FDD835] text-[#F4B400]" strokeWidth={1} />
        <span className="text-[8px] font-light leading-none text-ink/60">4.8 Stars</span>
      </div>
      <div className="absolute left-[163px] top-[136px] flex h-[25px] w-[75px] items-center gap-[3px] rounded-[8px] bg-white/70 pl-[6px]">
        <Wallet className="h-[13px] w-[13px] text-[#AA8F4D]" strokeWidth={1.6} />
        <span className="text-[12px] font-medium leading-none text-[#571A9F]">₹{money}</span>
      </div>
    </>
  );
}

/* -------------------------------- card --------------------------------- */
function CreatorCard({ lead, internal }: { lead: Lead; internal?: boolean }) {
  const navigate = useNavigate();
  return (
    <div
      onClick={() => navigate(`/leads/detail?id=${lead.id}`)}
      className="relative h-[193px] w-[266px] shrink-0 cursor-pointer rounded-[12px] bg-[#F5F5F5] transition-shadow hover:shadow-[0_6px_20px_rgba(0,0,0,0.10)]"
    >
      {/* top-right open arrow */}
      <span className="absolute left-[234px] top-[-1px] flex h-[28px] w-[28px] items-center justify-center rounded-full bg-white">
        <ArrowUpRight className="h-[15px] w-[15px] text-ink" strokeWidth={1.8} />
      </span>
      {/* progress ring (half-filled pie) */}
      <span className="absolute left-[150px] top-[5px] flex h-[23px] w-[23px] items-center justify-center rounded-full bg-white">
        <span className="relative h-[15px] w-[15px] rounded-full border border-[#79B282]">
          <span
            className="absolute inset-[1.5px] rounded-full"
            style={{ background: "conic-gradient(#79B282 0 50%, transparent 50% 100%)" }}
          />
        </span>
      </span>
      {/* location */}
      <span className="absolute left-[179px] top-[8px] flex h-[18px] items-center gap-[1px] rounded-[9px] bg-white px-[5px]">
        <span className="text-[8px] leading-none">📍</span>
        <span className="text-[8px] leading-none text-ink">Delhi</span>
      </span>

      {/* creator header */}
      <span className="absolute left-[8px] top-[6px] h-[38px] w-[38px] rounded-full bg-gradient-to-br from-[#C8E6FF] to-[#C8B3ED]" />
      <div className="absolute left-[51px] top-[10px] text-[12px] leading-none text-ink/90">{lead.brandName}</div>
      <div className="absolute left-[51px] top-[26px] text-[8px] leading-none text-ink/70">{lead.contactPerson ?? ""}</div>

      {/* stat row 1 */}
      <StatChip icon={Users} iconCls="text-ink/80" label={compact(lead.peopleCount)} pos="left-[10px] top-[51px]" />
      <StatChip icon={Eye} iconCls="text-[#2CC37F]" label="900k Avg. views" pos="left-[69px] top-[51px]" />
      <StatChip icon={Heart} iconCls="text-ink/70" label={lead.engagementRate ?? ""} pos="left-[173px] top-[51px]" />
      {/* stat row 2 */}
      <StatChip icon={Star} iconCls="fill-[#FDD835] text-[#F4B400]" label="4.8 Stars" pos="left-[10px] top-[82px]" />
      <StatChip icon={Eye} iconCls="text-[#2CC37F]" label="0.23p CPV" pos="left-[87px] top-[82px]" />
      <StatChip icon={Sparkles} iconCls="text-[#603CFF]" label={lead.intent} pos="left-[173px] top-[82px]" />

      {/* managed by */}
      <div className="absolute left-[8px] top-[112px] text-[9.3px] leading-none text-ink/70">Managed by:</div>
      {internal ? <InternalManaged money={lead.money ?? ""} /> : <AgencyManaged money={lead.money ?? ""} />}

      {/* selection checkbox */}
      <span className="absolute left-[240px] top-[167px] flex h-[15px] w-[15px] items-center justify-center rounded-[5px] border border-black/10 bg-white">
        {internal && <Check className="h-[10px] w-[10px] text-ink" strokeWidth={2.5} />}
      </span>
    </div>
  );
}

function CardRow({ pos, leads }: { pos: string; leads: Lead[] }) {
  return (
    <div className={`absolute flex gap-[15px] ${pos}`}>
      {leads.map((lead, i) => (
        <CreatorCard key={lead.id} lead={lead} internal={i === 0} />
      ))}
    </div>
  );
}

/* -------------------------------- page --------------------------------- */
export default function NewLeadsPage() {
  const navigate = useNavigate();
  const { data } = useLeads();
  const newLeads = (data ?? []).filter((l) => l.status === "NEW").slice(0, 12);
  return (
    <>
      {/* back button */}
      <CircleBtn dark pos="left-[235px] top-[153px]" onClick={() => navigate(-1)}>
        <ChevronLeft className="h-[22px] w-[22px]" strokeWidth={2} />
      </CircleBtn>

      {/* heading */}
      <h1 className="absolute left-[284px] top-[237px] text-[34px] font-normal leading-none text-ink">New Leads</h1>

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

      {/* toolbar — selection count */}
      <span className="absolute left-[1007px] top-[262px] flex h-[15px] w-[15px] items-center justify-center rounded-[5px] bg-white">
        <Check className="h-[11px] w-[11px] text-ink" strokeWidth={2.5} />
      </span>
      <span className="absolute left-[1029px] top-[262px] text-[12px] font-light leading-[15px] text-ink">1 selected</span>

      {/* toolbar — Share link */}
      <div
        onClick={() => navigate("/creators/share-link-list")}
        className="absolute left-[1102px] top-[256px] flex h-[45px] items-center gap-[8px] rounded-[24px] bg-white pl-[16px] cursor-pointer"
      >
        <Link className="h-[20px] w-[20px] text-ink" strokeWidth={1.7} />
        <span className="text-[14px] font-light leading-none text-ink">Share link</span>
      </div>

      {/* toolbar — Download (excel) */}
      <div
        onClick={() => navigate("/leads/download")}
        className="absolute left-[1241px] top-[256px] flex h-[45px] items-center gap-[8px] rounded-[24px] bg-white pl-[16px] cursor-pointer"
      >
        <FileSpreadsheet className="h-[20px] w-[20px] text-[#21A366]" strokeWidth={1.7} />
        <span className="text-[14px] font-light leading-none text-ink">Download</span>
      </div>

      {/* Mega / Celebrity Creators — 2nd row (topmost visible, header scrolled off) */}
      <CardRow pos="left-[277px] top-[330px]" leads={newLeads.slice(0, 4)} />

      {/* Macro Creators section */}
      <h2 className="absolute left-[277px] top-[542px] text-[24px] font-normal leading-none text-ink">
        Macro Creators (250K – 1M)
      </h2>
      <CardRow pos="left-[277px] top-[584px]" leads={newLeads.slice(4, 8)} />
      <CardRow pos="left-[277px] top-[793px]" leads={newLeads.slice(8, 12)} />
    </>
  );
}
