import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import {
  ArrowLeft, ChevronDown, Send, Phone, ArrowUpRight, Plus, X, Search,
  UserRoundPlus, Trash2, UsersRound, Eye, Heart, Star, Sparkles, Video,
  Images, MapPin, Pencil, Instagram,
} from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import whatsapp from "@/assets/icons/whatsapp.svg";
import { useLeads } from "@/api/hooks";

/**
 * Super Admin — Contacted Lead detail.
 * Exact reconstruction of Figma frame 4314:6734 ("yunto leads"), 1440×1024.
 * Every element is absolutely positioned at its frame-relative coordinate.
 */

/* ------------------------------ primitives ----------------------------- */
function RoundBtn({ left, top, size = 28, children, onClick }: { left: number; top: number; size?: number; children: ReactNode; onClick?: () => void }) {
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

/* small white stat pill inside a creator card (coords relative to card origin) */
function Metric({ left, top, width, icon: Icon, iconClass, text }: {
  left: number; top: number; width: number; icon: LucideIcon; iconClass: string; text: string;
}) {
  return (
    <div
      className="absolute flex h-[24px] items-center gap-[3px] rounded-[12px] bg-white pl-[5px]"
      style={{ left, top, width }}
    >
      <Icon className={`h-[15px] w-[15px] ${iconClass}`} strokeWidth={1.6} />
      <span className="text-[10px] leading-none text-ink/80">{text}</span>
    </div>
  );
}

/* ------------------------------ creator card --------------------------- */
function CreatorCard({ left, top, onClick }: { left: number; top: number; onClick?: () => void }) {
  return (
    <div onClick={onClick} className="absolute h-[193px] w-[266px] cursor-pointer rounded-[12px] bg-[#F5F5F5]" style={{ left, top }}>
      {/* open arrow */}
      <RoundBtn left={234} top={-1}>
        <ArrowUpRight className="h-[15px] w-[15px] text-ink" strokeWidth={1.8} />
      </RoundBtn>

      {/* avatar + name */}
      <Avatar left={8} top={6} size={38} from="#FFD9E8" to="#C8B3ED" />
      <div className="absolute left-[51px] top-[9px] text-[12px] leading-[15px] text-ink/90">Leena Sharma</div>
      <div className="absolute left-[51px] top-[26px] text-[8px] leading-[13px] text-ink/70">@leenabliss</div>

      {/* location pill */}
      <div className="absolute left-[163px] top-[8px] flex h-[24px] items-center gap-[2px] rounded-[12px] bg-white px-[6px]">
        <MapPin className="h-[11px] w-[11px] text-[#E4572E]" strokeWidth={2} fill="#E4572E" />
        <span className="text-[10.2px] leading-none text-ink">Delhi</span>
      </div>

      {/* stats row 1 */}
      <Metric left={10} top={51} width={68} icon={UsersRound} iconClass="text-ink" text="1.2M" />
      <Metric left={69} top={51} width={110} icon={Eye} iconClass="text-[#2CC37F]" text="900k Avg. views" />
      <Metric left={173} top={51} width={77} icon={Heart} iconClass="text-ink" text="4.5% ER" />

      {/* stats row 2 */}
      <div className="absolute left-[10px] top-[82px] flex h-[24px] items-center gap-[3px] rounded-[12px] bg-white pl-[5px]" style={{ width: 87 }}>
        <Star className="h-[15px] w-[15px] text-[#FDD835]" fill="#FDD835" strokeWidth={0} />
        <span className="text-[10px] leading-none text-ink/80">4.8 Stars</span>
      </div>
      <Metric left={87} top={82} width={91} icon={Eye} iconClass="text-[#2CC37F]" text="0.23p CPV" />
      <Metric left={173} top={82} width={79} icon={Sparkles} iconClass="text-[#603CFF]" text="80% Match" />

      {/* managed by */}
      <span className="absolute left-[8px] top-[112px] text-[9.3px] leading-none text-ink/70">Managed by:</span>
      <div className="absolute left-[8px] top-[132px] flex h-[33px] w-[237px] items-center rounded-[11px] border border-[#6801FE]/20 bg-[#6801FE]/[0.04] px-[8px]">
        <Avatar left={13} top={137} size={24} from="#C8E6FF" to="#C8B3ED" />
        <div className="ml-[32px]">
          <div className="text-[10.2px] leading-[12px] text-ink/90">Stellar Talents</div>
          <div className="mt-[1px] text-[8px] font-light leading-none text-ink/60">4.8 Stars</div>
        </div>
        <div className="absolute right-[6px] flex h-[25px] items-center gap-[3px] rounded-[8px] bg-white/70 px-[7px]">
          <span className="text-[12px] leading-none">💰</span>
          <span className="text-[12px] font-medium leading-none text-[#571A9F]">₹65.5K</span>
        </div>
      </div>

      {/* notch handle */}
      <span className="absolute left-[240px] top-[167px] h-[15px] w-[15px] rounded-[5px] bg-[#1D1D1D]" />
    </div>
  );
}

/* ------------------- filter chip (label + optional value) --------------- */
function Chip({ label, value, width }: { label: string; value?: string; width: number }) {
  return (
    <span
      className="flex h-[30px] items-center justify-center rounded-full bg-white text-[12px] font-light leading-none"
      style={{ width }}
    >
      <span className={value ? "text-[#121212]/55" : "text-[#121212]"}>{label}</span>
      {value && <span className="ml-[3px] text-[#121212]">{value}</span>}
    </span>
  );
}

/* --------------------------- follow-up item ---------------------------- */
function FollowItem({ top, day, wday, title }: { top: number; day: string; wday: string; title: string }) {
  return (
    <>
      <div
        className="absolute left-[1124px] flex h-[52px] w-[38px] flex-col items-center justify-center rounded-[18px] bg-[#D8DDFF]"
        style={{ top }}
      >
        <span className="text-[15px] font-light leading-[16px] text-ink">{day}</span>
        <span className="text-[15px] font-light leading-[16px] text-ink">{wday}</span>
      </div>
      <div className="absolute left-[1168px] text-[16px] leading-none text-ink" style={{ top: top + 5 }}>{title}</div>
      <div className="absolute left-[1168px] flex items-center gap-[4px]" style={{ top: top + 33 }}>
        <Avatar left={0} top={0} size={14} from="#FFD9E8" to="#C8B3ED" />
        <span className="ml-[18px] text-[10.2px] leading-none text-ink/90">Priya Sharma</span>
      </div>
      <span className="absolute left-[1366px] text-ink/70" style={{ top: top + 5 }}>
        <X className="h-[17px] w-[17px]" strokeWidth={1.6} />
      </span>
    </>
  );
}

/* -------------------------------- page --------------------------------- */
export default function LeadDetailPage() {
  const navigate = useNavigate();
  const [sp] = useSearchParams();
  const id = sp.get("id");
  const { data } = useLeads();
  const item = (data ?? []).find((x) => x.id === id) ?? (data ?? [])[0];
  return (
    <>
      {/* back button */}
      <span
        onClick={() => navigate(-1)}
        className="absolute left-[235px] top-[153px] flex h-[45px] w-[45px] cursor-pointer items-center justify-center rounded-full bg-black text-white"
      >
        <ArrowLeft className="h-[20px] w-[20px]" strokeWidth={2} />
      </span>

      {/* title */}
      <h1 className="absolute left-[261px] top-[236px] text-[34px] font-normal leading-none text-ink">Contacted Leads</h1>
      <span className="absolute left-[538px] top-[240px] text-[24px] font-normal leading-none text-ink underline decoration-1 underline-offset-[5px]">5 Leads</span>

      {/* ============================ main container ======================= */}
      <div className="absolute left-[261px] top-[301px] h-[334px] w-[838px] rounded-[24px] bg-[#F3F3F3]/[0.13]" />

      {/* filter chips row */}
      <div className="absolute left-[278px] top-[314px] flex items-center gap-[9px]">
        <Chip label="12 July" width={72} />
        <Chip label="Zostel Trip" width={72} />
        <Chip label="Lead Source:" value="Website" width={134} />
        <Chip label="Avg. Response time:" value="3hrs" width={154} />
        <Chip label="Channel:" value="Instagram" width={120} />
      </div>

      {/* Mark Status dropdown */}
      <div className="absolute left-[945px] top-[306px] flex h-[45px] w-[133px] items-center justify-between rounded-[28px] bg-white/90 px-[18px]">
        <span className="text-[14px] font-light leading-none text-black/[0.99]">Mark Status</span>
        <ChevronDown className="h-[16px] w-[16px] text-ink" strokeWidth={1.8} />
      </div>

      {/* Stellar Talents header */}
      <span className="absolute left-[279px] top-[378px] flex h-[45px] w-[45px] items-center justify-center rounded-full bg-[#1CA974] text-white">
        <Send className="h-[20px] w-[20px]" strokeWidth={1.8} />
      </span>
      <div className="absolute left-[332px] top-[375px] text-[24px] leading-[27px] text-ink/90">{item?.brandName ?? ""}</div>
      <div className="absolute left-[332px] top-[406px] text-[12px] leading-none text-ink/70">Influencer Management</div>

      {/* Client Detail card */}
      <div className="absolute left-[555px] top-[374px] h-[53px] w-[239px] rounded-[13px] bg-white" />
      <Avatar left={560} top={384} size={38} from="#FFD9E8" to="#C8B3ED" />
      <div className="absolute left-[608px] top-[383px] text-[12px] leading-none text-ink/70">Client Detail</div>
      <div className="absolute left-[608px] top-[401px] text-[18px] leading-none text-ink/90">{item?.contactPerson ?? ""}</div>
      <RoundBtn left={733} top={391} size={24}>
        <Phone className="h-[13px] w-[13px] text-ink" strokeWidth={1.6} />
      </RoundBtn>
      <img src={whatsapp} alt="WhatsApp" className="absolute left-[762px] top-[391px] h-[24px] w-[24px]" />

      {/* Lead Source card */}
      <div className="absolute left-[808px] top-[374px] h-[53px] w-[274px] rounded-[13px] bg-white" />
      <Avatar left={813} top={384} size={38} from="#C8E6FF" to="#C8B3ED" />
      <div className="absolute left-[861px] top-[383px] text-[12px] leading-none text-ink/70">Lead Source</div>
      <div className="absolute left-[861px] top-[401px] text-[18px] leading-none text-ink/90">Leena Sharma</div>
      <RoundBtn left={989} top={391} size={24} onClick={() => navigate("/creators/detail")}>
        <ArrowUpRight className="h-[13px] w-[13px] text-ink" strokeWidth={1.8} />
      </RoundBtn>
      <RoundBtn left={1018} top={391} size={24}>
        <Phone className="h-[13px] w-[13px] text-ink" strokeWidth={1.6} />
      </RoundBtn>
      <img src={whatsapp} alt="WhatsApp" className="absolute left-[1048px] top-[391px] h-[24px] w-[24px]" />

      {/* ---- Message card ---- */}
      <div className="absolute left-[278px] top-[447px] h-[178px] w-[258px] rounded-[12px] bg-[#F5F5F5]" />
      <span className="absolute left-[290px] top-[457px] text-[12px] leading-none text-ink">Message</span>
      <RoundBtn left={502} top={455} size={24}>
        <Plus className="h-[12px] w-[12px] text-ink" strokeWidth={1.6} />
      </RoundBtn>
      <div className="absolute left-[290px] top-[480px] h-[130px] w-[236px] rounded-[12px] bg-white" />
      <p className="absolute left-[296px] top-[486px] w-[219px] text-[12px] font-light leading-[20px] text-ink/60">
        We are launching a new skincare product and need a influencer in skincare promotion. Can we discuss the partnership opportunity
      </p>

      {/* ---- Deliverables card ---- */}
      <div className="absolute left-[551px] top-[447px] h-[178px] w-[258px] rounded-[12px] bg-[#F5F5F5]" />
      <span className="absolute left-[563px] top-[457px] text-[12px] leading-none text-ink">Deliverables</span>
      <RoundBtn left={775} top={455} size={24}>
        <Plus className="h-[12px] w-[12px] text-ink" strokeWidth={1.6} />
      </RoundBtn>
      <div className="absolute left-[563px] top-[485px] h-[127px] w-[236px] rounded-[12px] bg-white" />
      <div className="absolute left-[570px] top-[491px] h-[36px] w-[128px] rounded-[12px] bg-white">
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
      <div className="absolute left-[824px] top-[447px] h-[178px] w-[258px] rounded-[12px] bg-[#F5F5F5]" />
      <span className="absolute left-[836px] top-[457px] text-[12px] leading-none text-ink">Add Notes</span>
      <RoundBtn left={1048} top={455} size={24}>
        <Plus className="h-[12px] w-[12px] text-ink" strokeWidth={1.6} />
      </RoundBtn>
      <div className="absolute left-[836px] top-[485px] h-[130px] w-[236px] rounded-[12px] bg-white" />
      <span className="absolute left-[842px] top-[493px] text-[12px] leading-none text-ink/70">Today</span>
      <span className="absolute left-[882px] top-[500px] h-px w-[92px] bg-ink/10" />
      <p className="absolute left-[842px] top-[512px] w-[226px] text-[12px] font-light leading-[20px] text-ink/60">here comes your note</p>

      {/* ============================ Follow Up ============================ */}
      <div className="absolute left-[1109px] top-[301px] h-[234px] w-[295px] rounded-[12px] bg-white/60" />
      <span className="absolute left-[1119px] top-[311px] text-[12px] leading-none text-ink">Follow Up</span>
      <RoundBtn left={1376} top={301} onClick={() => navigate("/reminders")}>
        <Plus className="h-[15px] w-[15px] text-ink" strokeWidth={1.6} />
      </RoundBtn>
      <div className="absolute left-[1119px] top-[340px] h-[184px] w-[272px] rounded-[12px] bg-white" />
      <span className="absolute left-[1120px] top-[344px] text-[12px] leading-none text-ink/70">Today</span>
      <span className="absolute left-[1160px] top-[350px] h-px w-[92px] bg-ink/10" />
      <FollowItem top={373} day="21" wday="Sat" title="Agency google meet" />
      <FollowItem top={441} day="20" wday="Fri" title="Follow - Up mail" />

      {/* ============================ Payment Summary ===================== */}
      <div className="absolute left-[1109px] top-[559px] h-[397px] w-[295px] rounded-[12px] bg-[#F5F5F5]/60" />
      <span className="absolute left-[1119px] top-[569px] text-[12px] leading-none text-ink">Payment Summary</span>
      <RoundBtn left={1376} top={559} onClick={() => navigate("/invoices")}>
        <ArrowUpRight className="h-[15px] w-[15px] text-ink" strokeWidth={1.8} />
      </RoundBtn>

      {/* invoice card */}
      <div className="absolute left-[1119px] top-[601px] h-[342px] w-[270px] rounded-[12px] bg-white" />
      <div className="absolute left-[1119px] top-[621px] w-[270px] text-center text-[16px] font-medium leading-none text-ink">{item?.brandName ?? "Brand Name"}</div>

      {/* Invoice token */}
      <div className="absolute left-[1139px] top-[654px] h-[52px] w-[230px] rounded-[12px] border border-dashed border-black/40" />
      <span className="absolute left-[1139px] top-[649px] w-[230px] text-center">
        <span className="bg-white px-[5px] font-mono text-[9px] font-medium tracking-[0.15em] text-ink">Invoice</span>
      </span>
      <div className="absolute left-[1139px] top-[673px] w-[230px] text-center font-mono text-[12.6px] font-bold tracking-[0.12em] text-ink">INV-2025-045</div>

      {/* divider */}
      <span className="absolute left-[1131px] top-[720px] h-px w-[246px] bg-ink/10" />

      {/* Brand Budget */}
      <div className="absolute left-[1131px] top-[734px] flex w-[246px] items-center justify-between">
        <span className="text-[13px] font-medium leading-none text-ink">Brand Budget</span>
        <span className="text-[12px] font-medium leading-none text-ink/50">₹{item?.money ?? "-"}</span>
      </div>

      {/* Leena Sharma */}
      <div className="absolute left-[1131px] top-[759px] flex w-[246px] items-center justify-between">
        <span className="text-[12px] leading-none text-ink/50">Leena Sharma</span>
        <span className="flex items-center gap-[8px]">
          <span className="text-[12px] leading-none text-[#E44E26]">- ₹1,00,000</span>
          <span className="flex h-[16px] w-[16px] items-center justify-center rounded-full bg-[#ECEAEA]">
            <Pencil className="h-[8px] w-[8px] text-ink" strokeWidth={1.8} />
          </span>
        </span>
      </div>

      {/* Riya Sharma */}
      <div className="absolute left-[1131px] top-[783px] flex w-[246px] items-center justify-between">
        <span className="text-[12px] leading-none text-ink/50">Riya Sharma</span>
        <span className="flex items-center gap-[8px]">
          <span className="flex items-baseline gap-[3px] text-[#E44E26]">
            <span className="text-[6px] leading-none line-through">₹1,20,000</span>
            <span className="text-[12px] leading-none">- ₹1,00,000</span>
          </span>
          <span className="flex h-[16px] w-[16px] items-center justify-center rounded-full bg-[#ECEAEA]">
            <Pencil className="h-[8px] w-[8px] text-ink" strokeWidth={1.8} />
          </span>
        </span>
      </div>

      {/* Agency Fee token */}
      <div className="absolute left-[1139px] top-[808px] h-[51px] w-[230px] rounded-[12px] border border-dashed border-black/40" />
      <span className="absolute left-[1139px] top-[803px] w-[230px] text-center">
        <span className="bg-white px-[5px] font-mono text-[9px] font-medium tracking-[0.15em] text-ink">Agency Fee</span>
      </span>
      <div className="absolute left-[1146px] top-[827px] flex h-[22px] w-[117px] items-center gap-[6px] rounded-full border border-black/5 bg-white px-[4px]">
        <span className="flex h-[13px] w-[13px] items-center justify-center rounded-full bg-[#ECEAEA]">
          <Plus className="h-[7px] w-[7px] text-ink" strokeWidth={2} />
        </span>
        <span className="text-[12px] leading-none text-ink">Added</span>
        <span className="ml-auto flex items-center gap-[3px]">
          <span className="text-[12px] font-medium leading-none text-[#3DBB6C]">15%</span>
          <span className="flex h-[16px] w-[16px] items-center justify-center rounded-full bg-[#ECEAEA]">
            <Pencil className="h-[8px] w-[8px] text-ink" strokeWidth={1.8} />
          </span>
        </span>
      </div>
      <span className="absolute left-[1311px] top-[830px] text-[12px] font-medium leading-none text-ink/50">₹30,000</span>

      {/* divider */}
      <span className="absolute left-[1131px] top-[878px] h-px w-[246px] bg-ink/10" />

      {/* Estimate Payout */}
      <div className="absolute left-[1131px] top-[894px] flex w-[246px] items-center justify-between">
        <span className="text-[13px] font-medium leading-none text-ink">Estimate Payout</span>
        <span className="text-[15px] font-semibold leading-none text-[#3DBB6C]">₹2,50,000</span>
      </div>

      {/* ============================ Creators ============================ */}
      <div className="absolute left-[261px] top-[657px] h-[274px] w-[590px] rounded-[12px] bg-[#F5F5F5]/60" />
      <span className="absolute left-[277px] top-[667px] text-[12px] leading-none text-ink">Creators</span>
      <RoundBtn left={660} top={664} onClick={() => navigate("/search")}>
        <Search className="h-[14px] w-[14px] text-ink" strokeWidth={1.7} />
      </RoundBtn>
      <RoundBtn left={696} top={664} onClick={() => navigate("/leads/add-creator")}>
        <UserRoundPlus className="h-[15px] w-[15px] text-ink" strokeWidth={1.6} />
      </RoundBtn>
      <RoundBtn left={732} top={664}>
        <Trash2 className="h-[14px] w-[14px] text-ink" strokeWidth={1.6} />
      </RoundBtn>
      <RoundBtn left={769} top={664} onClick={() => navigate("/creators/find")}>
        <Plus className="h-[13px] w-[13px] text-ink" strokeWidth={1.7} />
      </RoundBtn>
      <RoundBtn left={820} top={664} onClick={() => navigate("/leads/creator-list")}>
        <ArrowUpRight className="h-[15px] w-[15px] text-ink" strokeWidth={1.8} />
      </RoundBtn>

      <CreatorCard left={278} top={713} onClick={() => navigate("/creators/detail")} />
      <CreatorCard left={559} top={713} onClick={() => navigate("/creators/detail")} />

      {/* ============================ Activity ============================ */}
      <div className="absolute left-[863px] top-[664px] h-[275px] w-[236px] rounded-[12px] bg-[#F9F9F9]/70" />
      <span className="absolute left-[873px] top-[674px] text-[12px] leading-none text-ink">Activity</span>
      <div className="absolute left-[873px] top-[702px] h-[225px] w-[212px] rounded-[12px] bg-white" />
      <span className="absolute left-[879px] top-[712px] text-[12px] leading-none text-ink/70">Today</span>
      <span className="absolute left-[919px] top-[719px] h-px w-[92px] bg-ink/10" />
    </>
  );
}
