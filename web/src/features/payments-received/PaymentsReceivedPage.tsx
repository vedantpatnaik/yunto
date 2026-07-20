import type { LucideIcon } from "lucide-react";
import {
  ArrowLeft,
  ArrowUpRight,
  Pencil,
  ChevronDown,
  ChevronsUpDown,
  Phone,
  Plus,
  X,
  Check,
  Instagram,
  Film,
  Images,
  Calendar,
  Clock,
  Users,
  Eye,
  Heart,
  Star,
  Sparkles,
  Search,
  UserPlus,
  Trash2,
} from "lucide-react";
import whatsapp from "@/assets/icons/whatsapp.svg";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useInvoices } from "@/api/hooks";

/** 1_200_000 -> "1.2M", 900_000 -> "900k". */
const compact = (n: number) =>
  n >= 1_000_000
    ? `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`
    : n >= 1_000
      ? `${Math.round(n / 1_000)}k`
      : `${n}`;

/**
 * Super Admin — Payments (received).
 * Exact reconstruction of Figma frame 4902:9078 ("Super Admin-payments (recieved)"),
 * 1440×1024. Renders the "Contacted" lead-detail workspace at full opacity with the
 * "Received Payment" reminder popup — the defining feature of this screen. The shared
 * TopBar/Sidebar (AppShell) and the TopBar-occluded schedule strip are omitted.
 */

/* ------------------------------ primitives ----------------------------- */
function CircleIcon({
  icon: Icon,
  left,
  top,
  d,
  iconSize,
  dark,
  iconColor,
  bg,
  stroke = 1.7,
  onClick,
}: {
  icon: LucideIcon;
  left: number;
  top: number;
  d: number;
  iconSize: number;
  dark?: boolean;
  iconColor?: string;
  bg?: string;
  stroke?: number;
  onClick?: () => void;
}) {
  return (
    <span
      onClick={onClick}
      className={`absolute flex items-center justify-center rounded-full${onClick ? " cursor-pointer" : ""}`}
      style={{ left, top, width: d, height: d, background: bg ?? (dark ? "#000" : "#fff") }}
    >
      <Icon
        style={{ width: iconSize, height: iconSize, color: iconColor ?? (dark ? "#fff" : "#000") }}
        strokeWidth={stroke}
      />
    </span>
  );
}

function Pill({ label, left, width }: { label: string; left: number; width: number }) {
  return (
    <div
      className="absolute top-[314px] flex h-[30px] items-center justify-center rounded-full bg-white px-[9px] shadow-[0_1px_3px_rgba(0,0,0,0.05)]"
      style={{ left, width }}
    >
      <span className="whitespace-nowrap text-[12px] font-light text-[#121212]">{label}</span>
    </div>
  );
}

function StatChip({
  icon: Icon,
  label,
  left,
  top,
  width,
  color,
}: {
  icon: LucideIcon;
  label: string;
  left: number;
  top: number;
  width: number;
  color?: string;
}) {
  return (
    <div
      className="absolute flex h-[24px] items-center gap-[3px] rounded-[12px] bg-white px-[5px] shadow-[0_1px_3px_rgba(0,0,0,0.05)]"
      style={{ left, top, width }}
    >
      <Icon className="shrink-0" style={{ width: 13, height: 13, color: color ?? "rgba(0,0,0,0.7)" }} strokeWidth={1.6} />
      <span className="whitespace-nowrap text-[10px] text-ink/80">{label}</span>
    </div>
  );
}

function CreatorCard({ left, onClick }: { left: number; onClick?: () => void }) {
  return (
    <div
      onClick={onClick}
      className={`absolute h-[193px] w-[266px] rounded-[12px] bg-[#F5F5F5]${onClick ? " cursor-pointer" : ""}`}
      style={{ left, top: 711 }}
    >
      <span className="absolute left-[234px] top-[-1px] flex h-[28px] w-[28px] items-center justify-center rounded-full bg-white">
        <ArrowUpRight className="h-[15px] w-[15px] text-ink" strokeWidth={1.7} />
      </span>

      {/* avatar + name */}
      <span className="absolute left-[8px] top-[6px] h-[38px] w-[38px] rounded-full bg-gradient-to-br from-[#FFD6E7] to-[#C8B3ED]" />
      <div className="absolute left-[51px] top-[10px] text-[12px] text-ink/90">Leena Sharma</div>
      <div className="absolute left-[51px] top-[26px] text-[8px] text-ink/70">@leenabliss</div>

      {/* location chip */}
      <div className="absolute left-[163px] top-[8px] flex h-[24px] w-[55px] items-center justify-center gap-[2px] rounded-[12px] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
        <span className="text-[9px] leading-none">📍</span>
        <span className="text-[10.2px] text-black">Delhi</span>
      </div>

      {/* stats */}
      <StatChip icon={Users} label="1.2M" left={10} top={51} width={68} />
      <StatChip icon={Eye} label="900k Avg. views" left={69} top={51} width={110} color="#2CC37F" />
      <StatChip icon={Heart} label="4.5% ER" left={173} top={51} width={77} color="#F97F8E" />
      <StatChip icon={Star} label="4.8 Stars" left={10} top={82} width={87} color="#F4B400" />
      <StatChip icon={Eye} label="0.23p CPV" left={87} top={82} width={91} color="#2CC37F" />
      <StatChip icon={Sparkles} label="80% Match" left={173} top={82} width={79} color="#603CFF" />

      {/* managed by */}
      <div className="absolute left-[8px] top-[112px] text-[9.3px] text-ink/70">Managed by:</div>
      <div className="absolute left-[8px] top-[132px] flex h-[33px] w-[237px] items-center rounded-[11px] bg-gradient-to-r from-[#6801FE]/[0.06] to-[#D9D9D9]/[0.06] px-[6px]">
        <span className="h-[24px] w-[24px] shrink-0 rounded-full bg-gradient-to-br from-[#C8E6FF] to-[#C8B3ED]" />
        <div className="ml-[6px] flex-1">
          <div className="text-[10.2px] leading-[12px] text-ink/90">Stellar Talents</div>
          <div className="text-[8px] text-ink/60">4.8 Stars</div>
        </div>
        <div className="flex h-[25px] items-center gap-[2px] rounded-[8px] bg-white/70 px-[6px]">
          <span className="text-[11px] leading-none">💰</span>
          <span className="text-[12px] font-medium text-[#571A9F]">₹65.5K</span>
        </div>
      </div>

      <span className="absolute left-[240px] top-[167px] h-[15px] w-[15px] rounded-[5px] bg-white" />
    </div>
  );
}

function Checkbox({
  checked,
  left,
  top,
  onClick,
}: {
  checked?: boolean;
  left: number;
  top: number;
  onClick?: () => void;
}) {
  return checked ? (
    <span
      onClick={onClick}
      className={`absolute flex h-[16px] w-[16px] items-center justify-center rounded-[4px] border border-black${onClick ? " cursor-pointer" : ""}`}
      style={{ left, top }}
    >
      <Check className="h-[11px] w-[11px] text-black" strokeWidth={2.5} />
    </span>
  ) : (
    <span
      onClick={onClick}
      className={`absolute h-[16px] w-[16px] rounded-[4px] border border-black/40${onClick ? " cursor-pointer" : ""}`}
      style={{ left, top }}
    />
  );
}

function Field({ left, top, value, icon: Icon }: { left: number; top: number; value: string; icon: LucideIcon }) {
  return (
    <div
      className="absolute flex h-[28px] w-[244px] items-center justify-between rounded-full bg-[#FAFAFA] px-[9px]"
      style={{ left, top }}
    >
      <span className="text-[11px] font-light text-black">{value}</span>
      <Icon className="h-[13px] w-[13px] text-black/70" strokeWidth={1.7} />
    </div>
  );
}

/* -------------------------------- page --------------------------------- */
export default function PaymentsReceivedPage() {
  const navigate = useNavigate();
  const [followUpVisible, setFollowUpVisible] = useState(true);
  const [afterCompletion, setAfterCompletion] = useState(true);
  const [onDueDate, setOnDueDate] = useState(false);

  const invoices = useInvoices().data ?? [];
  const inv = invoices[0];
  const invBrand = inv?.brandName ?? "";
  const invNumber = inv?.number ?? "";
  const invStatus = inv?.status ?? "";
  const invAmount = inv ? `₹${compact(inv.payout)}` : "";
  return (
    <>
      {/* faint container behind lead detail */}
      <div className="absolute left-[261px] top-[301px] h-[334px] w-[838px] rounded-[24px] bg-[#F3F3F3]/[0.13]" />

      {/* ===== Payment Summary card (mostly behind popup) ===== */}
      <div className="absolute left-[1109px] top-[553px] h-[437px] w-[295px] rounded-[12px] bg-[#F5F5F5]/60" />
      <CircleIcon icon={ArrowUpRight} left={1376} top={553} d={28} iconSize={16} onClick={() => navigate("/invoices")} />
      <span className="absolute left-[1119px] top-[561px] text-[12px] text-ink">Payment Summary</span>

      {/* ===== Follow Up card ===== */}
      <div className="absolute left-[1109px] top-[301px] h-[234px] w-[295px] rounded-[12px] bg-white/60" />
      <CircleIcon icon={Plus} left={1376} top={301} d={28} iconSize={14} onClick={() => navigate("/reminders")} />
      <span className="absolute left-[1119px] top-[309px] text-[12px] text-ink">Follow Up</span>
      {followUpVisible && (
        <div className="absolute left-[1119px] top-[340px] h-[184px] w-[272px] rounded-[12px] bg-white">
          <span className="absolute left-[12px] top-[8px] text-[12px] text-ink/70">Today</span>
          <span className="absolute left-[52px] top-[17px] h-px w-[92px] bg-line" />
          {/* date badge */}
          <div className="absolute left-[3px] top-[31px] flex h-[52px] w-[38px] flex-col items-center justify-center rounded-[18px] bg-[#D8DDFF] text-[15px] font-light leading-[16px] text-black">
            <span>20</span>
            <span>Fri</span>
          </div>
          <div className="absolute left-[47px] top-[36px] text-[16px] text-ink">Follow - Up Scheduled</div>
          <div className="absolute left-[47px] top-[64px] flex items-center gap-[4px]">
            <span className="h-[14px] w-[14px] rounded-full bg-gradient-to-br from-[#FFD6E7] to-[#C8B3ED]" />
            <span className="text-[10.2px] text-ink/90">Priya Sharma</span>
          </div>
          <X
            onClick={() => setFollowUpVisible(false)}
            className="absolute left-[244px] top-[36px] h-[20px] w-[20px] cursor-pointer text-black/60"
            strokeWidth={1.6}
          />
        </div>
      )}

      {/* ===== Header ===== */}
      <CircleIcon icon={ArrowLeft} left={235} top={153} d={45} iconSize={20} dark stroke={1.6} onClick={() => navigate(-1)} />
      <h1 className="absolute left-[270px] top-[228px] text-[34px] font-normal leading-none text-ink">Contacted</h1>
      <span className="absolute left-[538px] top-[235px] text-[24px] font-normal leading-none text-ink underline decoration-1 underline-offset-4">
        7 Leads
      </span>

      {/* ===== chips row ===== */}
      <Pill label="12 July" left={278} width={72} />
      <Pill label="Zostel Trip" left={359} width={72} />
      <Pill label="www.yourwebsite.com" left={440} width={148} />
      <Pill label="Budget ₹1.2L" left={597} width={89} />
      <Pill label={invStatus} left={695} width={72} />

      {/* colour swatches */}
      <div className="absolute left-[777px] top-[314px] flex h-[30px] w-[111px] items-center justify-center gap-[4px] rounded-full bg-white">
        {["#FD9591", "#F9A56F", "#FCDD66", "#B0FE69", "#A09C9C"].map((c) => (
          <span key={c} className="h-[20px] w-[14px] rounded-[8px]" style={{ background: c }} />
        ))}
      </div>

      {/* edit + Converted */}
      <CircleIcon icon={Pencil} left={911} top={312.5} d={32} iconSize={15} dark stroke={1.6} onClick={() => navigate("/leads/detail")} />
      <div className="absolute left-[949px] top-[306px] flex h-[45px] w-[133px] items-center justify-between rounded-[28px] bg-white/90 px-[18px]">
        <span className="text-[14px] font-light text-black">Converted</span>
        <ChevronDown className="h-[17px] w-[17px] text-black" strokeWidth={1.8} />
      </div>

      {/* ===== Assigned to ===== */}
      <span className="absolute left-[279px] top-[378px] h-[45px] w-[45px] rounded-full bg-gradient-to-br from-[#C8E6FF] to-[#C8B3ED]" />
      <span className="absolute left-[332px] top-[379px] text-[12px] text-ink/70">Assigned to</span>
      <span className="absolute left-[332px] top-[396px] text-[20px] text-ink/90">Rahul Aggrawal</span>
      <span className="absolute left-[502px] top-[401px] text-[12px] font-light text-ink/70">Sales</span>

      {/* ===== Client Detail card ===== */}
      <div className="absolute left-[555px] top-[374px] h-[53px] w-[239px] rounded-[13px] bg-white">
        <span className="absolute left-[5px] top-[10px] h-[38px] w-[38px] rounded-full bg-gradient-to-br from-[#FFD6E7] to-[#C8B3ED]" />
        <span className="absolute left-[53px] top-[8px] text-[12px] text-ink/70">Client Detail</span>
        <span className="absolute left-[53px] top-[26px] text-[18px] text-ink/90">Priya Sharma</span>
      </div>
      <CircleIcon icon={Phone} left={733} top={391} d={24} iconSize={13} stroke={1.6} />
      <img src={whatsapp} alt="WhatsApp" className="absolute left-[762px] top-[391px] h-[24px] w-[24px]" />

      {/* ===== Lead Source card ===== */}
      <div className="absolute left-[808px] top-[374px] h-[53px] w-[274px] rounded-[13px] bg-white">
        <span className="absolute left-[5px] top-[10px] h-[38px] w-[38px] rounded-full bg-gradient-to-br from-[#C8E6FF] to-[#C8B3ED]" />
        <span className="absolute left-[53px] top-[8px] text-[12px] text-ink/70">Lead Source</span>
        <span className="absolute left-[53px] top-[26px] text-[18px] text-ink/90">Leena Sharma</span>
      </div>
      <CircleIcon icon={ArrowUpRight} left={989} top={391} d={24} iconSize={13} stroke={1.6} onClick={() => navigate("/creators/detail")} />
      <CircleIcon icon={Phone} left={1018.5} top={391} d={24} iconSize={13} stroke={1.6} />
      <img src={whatsapp} alt="WhatsApp" className="absolute left-[1048px] top-[391px] h-[24px] w-[24px]" />

      {/* ===== Message card ===== */}
      <div className="absolute left-[278px] top-[447px] h-[178px] w-[258px] rounded-[12px] bg-[#F5F5F5]" />
      <span className="absolute left-[290px] top-[455px] text-[12px] text-ink">Message</span>
      <CircleIcon icon={Plus} left={502} top={455} d={24} iconSize={12} bg="#FEFCFF" stroke={1.6} />
      <div className="absolute left-[290px] top-[480px] h-[130px] w-[236px] rounded-[12px] bg-white">
        <p className="absolute left-[6px] top-[6px] w-[219px] text-[12px] font-light leading-[20px] text-ink/60">
          We are launching a new skincare product and need a influencer in skincare promotion. Can we discuss the
          partnership opportunity
        </p>
      </div>

      {/* ===== Deliverables card ===== */}
      <div className="absolute left-[551px] top-[447px] h-[178px] w-[258px] rounded-[12px] bg-[#F5F5F5]" />
      <span className="absolute left-[563px] top-[455px] text-[12px] text-ink">Deliverables</span>
      <CircleIcon icon={Plus} left={775} top={455} d={24} iconSize={12} bg="#FEFCFF" stroke={1.6} />
      <div className="absolute left-[563px] top-[485px] h-[127px] w-[236px] rounded-[12px] bg-white">
        <div className="absolute left-[7px] top-[6px] flex h-[36px] w-[128px] items-center gap-[10px] rounded-[12px] bg-white px-[7px] shadow-[0_1px_4px_rgba(0,0,0,0.08)]">
          <Instagram className="h-[16px] w-[16px] text-[#C837AB]" strokeWidth={1.6} />
          <div className="flex flex-col gap-[3px]">
            <span className="flex items-center gap-[5px] text-[12px] font-light text-ink/60">
              <Film className="h-[12px] w-[12px] text-ink/70" strokeWidth={1.6} />1 Collab Reel
            </span>
            <span className="flex items-center gap-[5px] text-[12px] font-light text-ink/60">
              <Images className="h-[12px] w-[12px] text-ink/70" strokeWidth={1.6} />2 Stories
            </span>
          </div>
        </div>
      </div>

      {/* ===== Add Notes card ===== */}
      <div className="absolute left-[824px] top-[447px] h-[178px] w-[258px] rounded-[12px] bg-[#F5F5F5]" />
      <span className="absolute left-[836px] top-[455px] text-[12px] text-ink">Add Notes</span>
      <CircleIcon icon={Plus} left={1048} top={455} d={24} iconSize={12} bg="#FEFCFF" stroke={1.6} />
      <div className="absolute left-[836px] top-[485px] h-[130px] w-[236px] rounded-[12px] bg-white">
        <div className="absolute left-[6px] top-[6px] flex items-center gap-[5px]">
          <span className="text-[12px] text-ink/70">Today</span>
          <span className="h-px w-[92px] bg-line" />
        </div>
        <span className="absolute left-[6px] top-[27px] text-[12px] font-light text-ink/60">here comes your note</span>
      </div>

      {/* ===== Creators card ===== */}
      <div className="absolute left-[261px] top-[655px] h-[274px] w-[590px] rounded-[12px] bg-[#F5F5F5]/60" />
      <span className="absolute left-[277px] top-[663px] text-[12px] text-ink">Creators</span>
      <CircleIcon icon={Search} left={660} top={662} d={28} iconSize={14} stroke={1.7} onClick={() => navigate("/search")} />
      <CircleIcon icon={UserPlus} left={696} top={662} d={28} iconSize={14} stroke={1.7} onClick={() => navigate("/leads/add-creator")} />
      <CircleIcon icon={Trash2} left={732} top={662} d={28} iconSize={14} stroke={1.7} />
      <CircleIcon icon={Plus} left={769} top={662} d={28} iconSize={13} stroke={1.7} onClick={() => navigate("/creators/find")} />
      <CircleIcon icon={ArrowUpRight} left={820} top={662} d={28} iconSize={15} stroke={1.7} onClick={() => navigate("/creators")} />
      <CreatorCard left={278} onClick={() => navigate("/creators/detail")} />
      <CreatorCard left={559} onClick={() => navigate("/creators/detail")} />

      {/* ===== Activity card ===== */}
      <div className="absolute left-[863px] top-[656px] h-[275px] w-[236px] rounded-[12px] bg-[#F9F9F9]/70" />
      <span className="absolute left-[873px] top-[664px] text-[12px] text-ink">Activity</span>
      <div className="absolute left-[873px] top-[694px] h-[225px] w-[212px] rounded-[12px] bg-white">
        {/* Today */}
        <div className="absolute left-[6px] top-[8px] flex items-center gap-[5px]">
          <span className="text-[12px] text-ink/70">Today</span>
          <span className="h-px w-[92px] bg-line" />
        </div>
        <div className="absolute left-[6px] top-[33px] flex h-[52px] w-[36px] flex-col items-center justify-center rounded-[18px] bg-[#D8DDFF] text-[13px] font-light leading-[16px] text-black">
          <span>20</span>
          <span>Fri</span>
        </div>
        <div className="absolute left-[48px] top-[34px] text-[16px] text-ink">Follow up schedule</div>
        <div className="absolute left-[48px] top-[59px] flex h-[24px] w-[74px] items-center gap-[4px] rounded-[18px] bg-white px-[6px] shadow-[0_1px_4px_rgba(0,0,0,0.08)]">
          <Clock className="h-[13px] w-[13px] text-ink/60" strokeWidth={1.6} />
          <span className="text-[10.2px] text-ink/60">02:00 pm</span>
        </div>
        {/* Yesterday */}
        <div className="absolute left-[6px] top-[95px] flex items-center gap-[5px]">
          <span className="text-[12px] text-ink/70">Yesterday</span>
          <span className="h-px w-[92px] bg-line" />
        </div>
        <div className="absolute left-[6px] top-[124px] flex h-[52px] w-[36px] flex-col items-center justify-center rounded-[18px] bg-[#EFEFF0] text-[13px] font-light leading-[16px] text-black">
          <span>19</span>
          <span>Thu</span>
        </div>
        <div className="absolute left-[48px] top-[125px] text-[16px] text-ink">Call</div>
        <div className="absolute left-[48px] top-[150px] flex h-[24px] w-[74px] items-center gap-[4px] rounded-[18px] bg-white px-[6px] shadow-[0_1px_4px_rgba(0,0,0,0.08)]">
          <Clock className="h-[13px] w-[13px] text-ink/60" strokeWidth={1.6} />
          <span className="text-[10.2px] text-ink/60">01:00 pm</span>
        </div>
      </div>

      {/* ===== Received Payment popup ===== */}
      <div className="absolute left-[1120px] top-[577px] h-[424px] w-[270px] rounded-[12px] bg-white shadow-[0_20px_60px_rgba(0,0,0,0.18)]">
        {/* header */}
        <span className="absolute left-[14px] top-[12px] text-[14px] font-medium text-black">Received Payment</span>
        <span
          onClick={() => navigate(-1)}
          className="absolute left-[238px] top-[12px] flex h-[20px] w-[20px] cursor-pointer items-center justify-center rounded-full bg-white shadow-[0_1px_4px_rgba(0,0,0,0.15)]"
        >
          <X className="h-[11px] w-[11px] text-black" strokeWidth={2} />
        </span>

        {/* brand card */}
        <div className="absolute left-[14px] top-[45px] h-[44px] w-[244px] rounded-[13px] bg-white shadow-[0_1px_6px_rgba(0,0,0,0.06)]">
          <span className="absolute left-[6px] top-[5px] h-[34px] w-[34px] rounded-full bg-black" />
          <span className="absolute left-[46px] top-[9px] text-[13px] font-medium text-black">{invBrand}</span>
          <span className="absolute left-[46px] top-[24px] text-[11px] text-ink/70">{invNumber}</span>
        </div>

        {/* amount */}
        <span className="absolute left-[14px] top-[99px] text-[12px] text-ink/70">Amount Received</span>
        <Field left={14} top={122} value={invAmount} icon={Pencil} />

        {/* reminder default */}
        <span className="absolute left-[14px] top-[160px] text-[12px] text-ink/70">Reminder default to</span>
        <Checkbox checked={afterCompletion} left={14} top={187} onClick={() => setAfterCompletion((v) => !v)} />
        <span className="absolute left-[32px] top-[187px] text-[12px] text-black">After Completion of Campaign</span>

        {/* select days */}
        <span className="absolute left-[14px] top-[215px] text-[12px] text-ink/70">Select Days</span>
        <Field left={14} top={238} value="3 Days" icon={ChevronsUpDown} />

        {/* on due date */}
        <Checkbox checked={onDueDate} left={14} top={276} onClick={() => setOnDueDate((v) => !v)} />
        <span className="absolute left-[32px] top-[276px] text-[12px] font-light text-ink/70">On Due Date</span>

        {/* select days (date) */}
        <span className="absolute left-[14px] top-[297px] text-[12px] text-ink/70">Select Days</span>
        <Field left={14} top={320} value="Date" icon={Calendar} />

        {/* save */}
        <button
          type="button"
          onClick={() => navigate("/payments/received")}
          className="absolute left-[14px] top-[363px] flex h-[38px] w-[118px] items-center justify-center rounded-[24px] border border-black/10 bg-[#FFFEFE] text-[14px] font-light text-black"
        >
          Save Reminder
        </button>
      </div>
    </>
  );
}
