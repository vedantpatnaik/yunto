import type { LucideIcon } from "lucide-react";
import {
  ArrowLeft,
  ChevronDown,
  Phone,
  Users,
  Eye,
  Star,
  Heart,
  Video,
  Image as ImageIcon,
  ArrowUpRight,
  Home,
  Calendar,
  Link as LinkIcon,
  Plus,
  Info,
  Clock,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import whatsapp from "@/assets/icons/whatsapp.svg";
import { useCreators } from "@/api/hooks";

const compact = (n: number) =>
  n >= 1_000_000 ? `${(n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1)} M`
  : n >= 1_000 ? `${Math.round(n / 1_000)}k` : `${n}`;

/**
 * Super Admin — Campaigns creator detail (my creator).
 * Exact reconstruction of Figma frame 5063:58293
 * ("Super Admin- Campaigns creator det…"), 1440×1024.
 * Built CLEAN: the profile dropdown popup + dim scrim siblings are omitted.
 */

/* ------------------------------ primitives ----------------------------- */
function ExpandBtn({ left, top, onClick }: { left: number; top: number; onClick?: () => void }) {
  return (
    <span
      onClick={onClick}
      className={`absolute flex h-[28px] w-[28px] items-center justify-center rounded-[16px] bg-white shadow-[0_1px_5px_rgba(0,0,0,0.08)]${onClick ? " cursor-pointer" : ""}`}
      style={{ left, top }}
    >
      <ArrowUpRight className="h-[15px] w-[15px] text-ink" strokeWidth={1.7} />
    </span>
  );
}

function CallBtn({ left, top, size = 28 }: { left: number; top: number; size?: number }) {
  return (
    <span
      className="absolute flex items-center justify-center rounded-full bg-white shadow-[0_1px_4px_rgba(0,0,0,0.1)]"
      style={{ left, top, width: size, height: size }}
    >
      <Phone className="text-ink" style={{ width: size * 0.42, height: size * 0.55 }} strokeWidth={1.6} />
    </span>
  );
}

function ProgressGlyph() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-[25px] w-[25px]">
      <circle cx="12" cy="12" r="9.5" stroke="#79B282" strokeWidth="1.8" />
      <path d="M12 2.5 A9.5 9.5 0 0 0 12 21.5 Z" fill="#79B282" />
    </svg>
  );
}

function StatCol({
  left,
  icon: Icon,
  iconColor,
  value,
  label,
}: {
  left: number;
  icon: LucideIcon;
  iconColor: string;
  value: string;
  label: string;
}) {
  return (
    <>
      <span
        className="absolute flex h-[48px] w-[48px] items-center justify-center rounded-[24px] bg-white shadow-[0_1px_6px_rgba(0,0,0,0.08)]"
        style={{ left, top: 463 }}
      >
        <Icon className="h-[24px] w-[24px]" style={{ color: iconColor }} strokeWidth={1.7} />
      </span>
      <span
        className="absolute text-[12px] font-normal leading-none text-[#A0AEC0]"
        style={{ left, top: 519 }}
      >
        {label}
      </span>
      <span
        className="absolute text-[15px] font-semibold leading-[21px] text-[#101010]"
        style={{ left, top: 533 }}
      >
        {value}
      </span>
    </>
  );
}

/* -------------------------------- addon card --------------------------- */
function AddonCard({
  left,
  name,
  role,
  service,
  onExpand,
}: {
  left: number;
  name: string;
  role: string;
  service: string;
  onExpand?: () => void;
}) {
  return (
    <div className="absolute h-[190px] w-[266px]" style={{ left, top: 664 }}>
      {/* base */}
      <div className="absolute inset-0 rounded-[12px] bg-[#F5F5F5]" />
      {/* expand + call (offsets are relative to this card) */}
      <ExpandBtn left={234} top={-1} onClick={onExpand} />
      <CallBtn left={198} top={8} size={22} />
      {/* avatar + name */}
      <span className="absolute left-[10px] top-[8px] h-[33.5px] w-[33.5px] rounded-full bg-gradient-to-br from-[#C8E6FF] to-[#C8B3ED]" />
      <span className="absolute left-[51px] top-[10.5px] text-[12px] leading-[15px] text-ink/90">{name}</span>
      <span className="absolute left-[51px] top-[26.5px] text-[8px] leading-[13px] text-ink/70">{role}</span>
      {/* service */}
      <span className="absolute left-[19px] top-[52px] text-[9.3px] leading-[15px] text-ink/90">Service</span>
      <div className="absolute left-[10px] top-[70px] flex h-[48px] w-[224px] items-center gap-[4px] rounded-[12px] bg-white px-[6px]">
        <span className="h-[36px] w-[28px] rounded-[6px] bg-[#C4C4C4]" />
        <span className="text-[10.2px] leading-[24px] text-ink/90">{service}</span>
      </div>
      {/* shoot date */}
      <span className="absolute left-[10px] top-[127px] text-[9.3px] leading-[15px] text-ink/90">Shoot Date</span>
      <div className="absolute left-[10px] top-[144.9px] flex h-[32px] w-[117px] items-center gap-[6px] rounded-[18px] bg-white pl-[3px]">
        <span className="flex h-[24px] w-[24px] items-center justify-center rounded-full bg-[#F1F1F1]">
          <Calendar className="h-[14px] w-[14px] text-ink" strokeWidth={1.5} />
        </span>
        <span className="text-[12px] font-light text-ink/90">20 June 2025</span>
      </div>
      {/* deliver date */}
      <span className="absolute left-[139px] top-[127px] text-[9.3px] leading-[15px] text-ink/90">Deliver Date</span>
      <div className="absolute left-[139px] top-[144.9px] flex h-[32px] w-[117px] items-center gap-[6px] rounded-[18px] bg-white pl-[3px]">
        <span className="flex h-[24px] w-[24px] items-center justify-center rounded-full bg-[#F1F1F1]">
          <Calendar className="h-[14px] w-[14px] text-ink" strokeWidth={1.5} />
        </span>
        <span className="text-[12px] font-light text-ink/90">22 June 2025</span>
      </div>
    </div>
  );
}

/* ------------------------------ timeline ------------------------------- */
function DayLabel({ top, text }: { top: number; text: string }) {
  return (
    <div className="absolute left-[1004px] flex items-center gap-[8px]" style={{ top }}>
      <span className="text-[12px] leading-[16px] text-ink/70">{text}</span>
      <span className="h-px w-[92px] bg-line" />
    </div>
  );
}

function TimelineEvent({
  top,
  dnum,
  dday,
  title,
  time,
  active,
}: {
  top: number;
  dnum: string;
  dday: string;
  title: string;
  time: string;
  active?: boolean;
}) {
  return (
    <>
      <div
        className="absolute left-[1004px] flex h-[52px] w-[36px] flex-col items-center justify-center rounded-[18px]"
        style={{ top, background: active ? "#D8DDFF" : "#EFEFF0" }}
      >
        <span className="text-[13px] font-light leading-[16px] text-ink">{dnum}</span>
        <span className="text-[13px] font-light leading-[16px] text-ink">{dday}</span>
      </div>
      <span className="absolute left-[1046px] text-[16px] leading-[16px] text-ink" style={{ top: top + 1.5 }}>
        {title}
      </span>
      <div
        className="absolute left-[1046px] flex h-[24px] items-center gap-[4px] rounded-[18px] bg-white px-[6px]"
        style={{ top: top + 26 }}
      >
        <Clock className="h-[12px] w-[12px] text-ink/60" strokeWidth={1.6} />
        <span className="font-inter text-[10.2px] text-ink/60">{time}</span>
      </div>
    </>
  );
}

/* --------------------------- add-ons subrow ---------------------------- */
function AddonRow({
  top,
  icon: Icon,
  title,
  sub,
  price,
}: {
  top: number;
  icon: LucideIcon;
  title: string;
  sub: string;
  price: string;
}) {
  return (
    <div
      className="absolute left-[1007px] h-[61px] w-[255px] rounded-[12px] bg-white/90 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.07)]"
      style={{ top }}
    >
      <span className="absolute left-[8px] top-[11px] flex h-[24px] w-[24px] items-center justify-center rounded-full bg-[#F1F1F1]">
        <Icon className="h-[15px] w-[15px] text-ink" strokeWidth={1.6} />
      </span>
      <span className="absolute left-[38px] top-[11px] text-[14px] font-light leading-[18px] text-ink">{title}</span>
      <div className="absolute left-[38px] top-[34px] flex items-center gap-[4px] leading-[16px]">
        <span className="text-[11px] text-[#443A4D]">{sub}</span>
        <span className="font-inter text-[10.2px] text-[#443A4D]">•</span>
        <span className="font-inter text-[12px] font-semibold text-[#3DBB6C]">{price}</span>
      </div>
      <CallBtn left={217} top={17} size={28} />
    </div>
  );
}

/* ------------------------- budget line item ---------------------------- */
function BudgetRow({
  top,
  label,
  amount,
  amountColor,
  bold,
}: {
  top: number;
  label: string;
  amount: string;
  amountColor: string;
  bold?: boolean;
}) {
  return (
    <>
      <span
        className={`absolute left-[1007px] leading-[20px] ${bold ? "font-medium text-ink" : "font-normal"}`}
        style={{ top, fontSize: bold ? 13 : 12, color: bold ? undefined : "rgba(0,0,0,0.5)" }}
      >
        {label}
      </span>
      <span
        className="absolute text-[12px] font-normal leading-[20px]"
        style={{ top, right: 33, color: amountColor }}
      >
        {amount}
      </span>
      <span className="absolute text-[4.2px] font-medium leading-[7px] text-ink/50" style={{ top: top + 9, right: 14 }}>
        (tax inc.)
      </span>
    </>
  );
}

/* -------------------------------- page --------------------------------- */
export default function CampCreatorDetailMyPage() {
  const navigate = useNavigate();
  const { data: creators = [] } = useCreators();
  const primary = creators[0];
  const addons = creators.slice(1, 3);
  return (
    <>
      {/* back button */}
      <span
        onClick={() => navigate(-1)}
        className="absolute left-[235px] top-[153px] flex h-[45px] w-[45px] cursor-pointer items-center justify-center rounded-[22.5px] bg-black"
      >
        <ArrowLeft className="h-[20px] w-[20px] text-white" strokeWidth={2} />
      </span>

      {/* title + underline */}
      <h1 className="absolute left-[268px] top-[229px] text-[34px] font-normal leading-[43px] text-ink">
        Nike&rsquo;s Diwali
      </h1>
      <span className="absolute left-[261px] top-[289px] h-px w-[259px] bg-line" />

      {/* header buttons */}
      <span
        onClick={() => navigate("/calendar")}
        className="absolute left-[609px] top-[246px] flex h-[45px] w-[193px] cursor-pointer items-center justify-center rounded-[24px] bg-white text-[20px] font-extralight text-ink"
      >
        Manage Calendar
      </span>
      <span
        onClick={() => navigate("/campaigns/detail")}
        className="absolute left-[810px] top-[246px] flex h-[45px] w-[144px] cursor-pointer items-center justify-center rounded-[24px] bg-white text-[20px] font-extralight text-ink"
      >
        Mark Done
      </span>

      {/* ============================ main creator card ============================ */}
      <div className="absolute left-[277px] top-[311px] h-[285px] w-[691px] rounded-[24px] bg-[#F3F3F3]/[0.13]" />

      {/* tags */}
      <span className="absolute left-[284px] top-[325px] flex h-[30px] items-center rounded-[36px] bg-white px-[9px] text-[12px] font-light text-[#121212]">
        Beauty
      </span>
      <span className="absolute left-[360px] top-[325px] flex h-[30px] items-center rounded-[36px] bg-white px-[9px] text-[12px] font-light text-[#121212]">
        Lifestyle
      </span>
      <span className="absolute left-[440px] top-[325px] flex h-[30px] items-center gap-[2px] rounded-[36px] bg-white px-[9px] text-[10.2px] text-[#121212]">
        <span className="text-[10px]">📍</span>{primary?.location ?? ""}
      </span>

      {/* status pill */}
      <div className="absolute left-[754px] top-[321px] flex h-[45px] w-[185px] items-center gap-[8px] rounded-[24px] bg-white pl-[9px]">
        <ProgressGlyph />
        <span className="text-[14px] font-light text-ink">Waiting for shoot</span>
        <ChevronDown className="h-[15px] w-[15px] text-ink" strokeWidth={2} />
      </div>

      {/* creator identity */}
      <span className="absolute left-[284px] top-[388px] h-[45px] w-[45px] rounded-full bg-gradient-to-br from-[#FFD6E7] to-[#C8B3ED]" />
      <span className="absolute left-[318px] top-[413px] text-[15px] leading-none">🔥</span>
      <span className="absolute left-[341px] top-[389px] text-[17.4px] leading-[21.6px] text-ink/90">{primary?.name ?? ""}</span>
      <span className="absolute left-[341px] top-[412px] text-[11.6px] leading-[18.8px] text-ink/70">{primary?.handle ?? ""}</span>

      {/* whatsapp + call */}
      <img src={whatsapp} alt="WhatsApp" className="absolute left-[860px] top-[396px] h-[28px] w-[28px]" />
      <CallBtn left={897} top={396} size={28} />

      {/* stats card */}
      <div className="absolute left-[299px] top-[451px] h-[115px] w-[640px] rounded-[24px] bg-white" />
      <StatCol left={338} icon={Users} iconColor="#4880D4" value={primary ? compact(primary.followers) : ""} label="Followers" />
      <StatCol left={499} icon={Eye} iconColor="#2CC37F" value={primary ? `${primary.engagementRate.toFixed(1)} %` : ""} label="Engagement Rate" />
      <StatCol left={660} icon={Star} iconColor="#FDD835" value={primary ? `${primary.stars.toFixed(1)} Stars` : ""} label="Rating" />
      <StatCol left={821} icon={Heart} iconColor="#ED5C74" value={primary ? compact(primary.avgViews) : ""} label="Avg. Views" />

      {/* ============================ addons ============================ */}
      <h2 className="absolute left-[278px] top-[616px] text-[24px] font-normal leading-none text-[#111827]">Addons</h2>
      <AddonCard left={278} name={addons[0]?.name ?? ""} role="Videographer" service="On - Site Shoot" onExpand={() => navigate("/creators/detail")} />
      <AddonCard left={554} name={addons[1]?.name ?? ""} role="Editor" service="Minimal -Style Editor Pack" onExpand={() => navigate("/creators/detail")} />

      {/* ============================ deliverables ============================ */}
      <h2 className="absolute left-[277px] top-[874px] text-[24px] font-normal leading-none text-[#111827]">Deliverables</h2>
      <div className="absolute left-[277px] top-[922px] h-[285px] w-[395px] rounded-[24px] bg-white">
        <span className="absolute left-[17px] top-[18px] text-[14px] leading-[24px] text-ink">
          Add links to submit your deliverables
        </span>

        {/* add-link input */}
        <div className="absolute left-[17px] top-[58px] flex h-[33px] w-[289px] items-center rounded-[12px] bg-white shadow-[inset_0_0_0_1px_rgba(0,0,0,0.06)]">
          <span className="absolute left-[8px] text-[10.2px] font-light leading-[24px] text-ink/70">Add your link</span>
          <span className="absolute left-[221px] flex h-[23px] w-[23px] items-center justify-center rounded-full bg-white shadow-[0_1px_4px_rgba(0,0,0,0.15)]">
            <Plus className="h-[14px] w-[14px] text-ink" strokeWidth={1.6} />
          </span>
          <span className="absolute left-[248px] flex h-[23px] w-[52px] items-center justify-center rounded-[27.6px] bg-white text-[9.2px] font-light text-[#121212] shadow-[inset_0_0_0_1px_rgba(0,0,0,0.08)]">
            Submit
          </span>
        </div>

        {/* submitted row 1 */}
        <div className="absolute left-[17px] top-[101px] flex h-[48px] w-[289px] items-center rounded-[12px] bg-white shadow-[inset_0_0_0_1px_rgba(0,0,0,0.06)]">
          <span className="absolute left-[6px] h-[36px] w-[28px] rounded-[6px] bg-[#EDEDED]" />
          <span className="absolute left-[38px] text-[10.2px] leading-[24px] text-ink/90">Nike&rsquo;s Diwali Reel Shoot</span>
          <span className="absolute left-[166px] flex h-[23px] w-[52px] items-center justify-center rounded-[27.6px] bg-white text-[9.2px] font-light text-[#121212] shadow-[inset_0_0_0_1px_rgba(0,0,0,0.08)]">
            Reel
          </span>
          <span className="absolute left-[247px] flex h-[23px] w-[23px] items-center justify-center rounded-full bg-black">
            <LinkIcon className="h-[12px] w-[12px] text-white" strokeWidth={1.8} />
          </span>
          <span className="absolute left-[302px] flex h-[18px] w-[52px] items-center justify-center rounded-[9px] bg-white text-[7.6px] text-[#00C16A] shadow-[inset_0_0_0_1px_rgba(0,0,0,0.06)]">
            Approved
          </span>
        </div>

        {/* submitted row 2 */}
        <div className="absolute left-[17px] top-[159px] flex h-[48px] w-[289px] items-center rounded-[12px] bg-white shadow-[inset_0_0_0_1px_rgba(0,0,0,0.06)]">
          <span className="absolute left-[6px] h-[36px] w-[28px] rounded-[6px] bg-[#EDEDED]" />
          <span className="absolute left-[38px] text-[10.2px] leading-[24px] text-ink/90">Nike&rsquo;s Diwali Reel Shoot</span>
          <span className="absolute left-[166px] flex h-[23px] w-[52px] items-center justify-center rounded-[27.6px] bg-white text-[9.2px] font-light text-[#121212] shadow-[inset_0_0_0_1px_rgba(0,0,0,0.08)]">
            Story
          </span>
          <span className="absolute left-[247px] flex h-[23px] w-[23px] items-center justify-center rounded-full bg-black">
            <LinkIcon className="h-[12px] w-[12px] text-white" strokeWidth={1.8} />
          </span>
          <span className="absolute left-[302px] flex h-[18px] w-[52px] items-center justify-center rounded-[9px] bg-white text-[7.6px] text-[#62748E] shadow-[inset_0_0_0_1px_rgba(0,0,0,0.06)]">
            Disapprove
          </span>
          <span className="absolute left-[296px] top-[41px] flex items-center gap-[2px]">
            <Info className="h-[10px] w-[10px] text-ink/70" strokeWidth={1.6} />
            <span className="text-[7.4px] font-light leading-[13px] text-ink/70">script not good</span>
          </span>
        </div>
      </div>

      {/* ============================ address ============================ */}
      <h2 className="absolute left-[686px] top-[874px] text-[24px] font-normal leading-none text-[#111827]">Address</h2>
      <div className="absolute left-[686px] top-[919px] h-[285px] w-[280px] rounded-[24px] bg-white">
        <span className="absolute left-[19px] top-[14px] flex h-[48px] w-[48px] items-center justify-center rounded-[24px] bg-white shadow-[0_1px_6px_rgba(0,0,0,0.08)]">
          <Home className="h-[22px] w-[22px] text-[#2CC37F]" strokeWidth={1.6} />
        </span>
        <span className="absolute left-[19px] top-[70px] text-[12px] leading-none text-[#A0AEC0]">Home Address</span>
        <span className="absolute left-[19px] top-[98px] whitespace-pre-line text-[14px] font-medium leading-[24px] text-ink">
          {"D- 601\nAnjara Apartments\nSector 78 , Noida"}
        </span>
        {/* creator chip */}
        <div className="absolute left-[127px] top-[21px] flex h-[31px] items-center gap-[3px] rounded-[18px] bg-white px-[6px] shadow-[inset_0_0_0_1px_rgba(0,0,0,0.05)]">
          <span className="h-[17px] w-[17px] rounded-full bg-gradient-to-br from-[#FFD6E7] to-[#C8B3ED]" />
          <span className="text-[12.4px] text-ink/90">{primary?.name ?? ""}</span>
        </div>
      </div>

      {/* ============================ activity card ============================ */}
      <div className="absolute left-[988px] top-[253px] h-[441px] w-[298px] rounded-[12px] bg-white/60" />
      <span className="absolute left-[998px] top-[261px] text-[14px] leading-[24px] text-ink">Activity</span>
      <ExpandBtn left={1258} top={253} />
      <div className="absolute left-[998px] top-[294px] h-[377px] w-[277px] rounded-[12px] bg-white" />

      <DayLabel top={300} text="Day 1" />
      <TimelineEvent top={325} dnum="20" dday="Fri" title="Campaign Shared" time="02:00 pm" active />
      <DayLabel top={387} text="Day 2" />
      <TimelineEvent top={416} dnum="21" dday="Sat" title="Campaign briefed" time="01:00 pm" />
      <DayLabel top={478} text="Day 3" />
      <TimelineEvent top={507} dnum="23" dday="Sat" title="Shoot completed" time="01:00 pm" />
      <DayLabel top={569} text="Day 4" />
      <TimelineEvent top={598} dnum="25" dday="Sat" title="Expected editing delivery" time="01:00 pm" />

      {/* ============================ add-ons card ============================ */}
      <div className="absolute left-[988px] top-[701px] h-[492px] w-[298px] rounded-[12px] bg-white/60" />
      <span className="absolute left-[998px] top-[714px] text-[14px] leading-[24px] text-ink">Add -Ons</span>
      <ExpandBtn left={1262} top={703} onClick={() => navigate("/creators/add-ons")} />
      <div className="absolute left-[998px] top-[745px] h-[452px] w-[275px] rounded-[12px] bg-white" />

      <AddonRow top={757} icon={Video} title="Videographer" sub="On-site shoot" price="₹5,000" />
      <AddonRow top={829} icon={ImageIcon} title="Editor" sub="Minimal Style" price="₹2,000" />

      {/* deliverables token */}
      <div className="absolute left-[1007px] top-[908px] h-[59px] w-[255px] rounded-[10px] border border-dashed border-black/40" />
      <span className="absolute left-[1095px] top-[900px] bg-white px-[4px] font-mono text-[9px] font-medium leading-[12px] text-ink">
        Deliverables
      </span>
      <span className="absolute left-[1021px] top-[924px] text-[12px] leading-[13px] text-ink">1 Reel</span>
      <span className="absolute left-[1185px] top-[920px] text-[12px] font-medium leading-[20px] text-ink/50">₹60,000</span>
      <span className="absolute left-[1235px] top-[928px] text-[4.2px] font-medium leading-[7px] text-ink/50">(tax inc.)</span>
      <span className="absolute left-[1021px] top-[945px] text-[12px] leading-[13px] text-ink">1 Post</span>
      <span className="absolute left-[1187px] top-[941px] text-[12px] font-medium leading-[20px] text-ink/50">₹10,000</span>
      <span className="absolute left-[1235px] top-[950px] text-[4.2px] font-medium leading-[7px] text-ink/50">(tax inc.)</span>

      {/* brand budget breakdown */}
      <BudgetRow top={982} label="Brand Budget" amount="₹1,00,000" amountColor="rgba(0,0,0,0.5)" bold />
      <BudgetRow top={1010} label={primary?.name ?? ""} amount="₹70,000" amountColor="#E44E26" />
      <BudgetRow top={1038} label="Videographer" amount="₹5,000" amountColor="#E44E26" />
      <BudgetRow top={1066} label="Editor" amount="₹2,000" amountColor="#E44E26" />
      <BudgetRow top={1094} label={"Creator’s GST (18%)"} amount="₹12,600" amountColor="#E44E26" />
    </>
  );
}
