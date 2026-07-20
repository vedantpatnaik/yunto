import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowUp,
  ArrowUpRight,
  Plus,
  X,
  Pencil,
  Clock,
  Search,
  UserRound,
  Trash2,
  Crown,
  Eye,
  Heart,
  Star,
  Sparkles,
  Wallet,
  Video,
  Images,
  Instagram,
  Phone,
  MapPin,
} from "lucide-react";
import whatsapp from "@/assets/icons/whatsapp.svg";
import { useLeads, useConvertLead } from "@/api/hooks";

/**
 * Super Admin — Detail of a contacted lead.
 * Exact reconstruction of Figma frame 6396:10914
 * ("Super Admin- detail contacted lead"), 1440×1024.
 * Clean underlying page — the "Edit Lead" modal + dim scrim (node 6396:10814)
 * are intentionally omitted, as are the TopBar/Sidebar (provided by AppShell).
 */

/* ------------------------------ primitives ----------------------------- */
function CircleBtn({
  left,
  top,
  size,
  onClick,
  children,
}: {
  left: number;
  top: number;
  size: number;
  onClick?: () => void;
  children: ReactNode;
}) {
  return (
    <div
      className={`absolute flex items-center justify-center rounded-full bg-white${
        onClick ? " cursor-pointer" : ""
      }`}
      onClick={onClick}
      style={{ left, top, width: size, height: size }}
    >
      {children}
    </div>
  );
}

function CChip({
  icon: Icon,
  color,
  left,
  top,
  w,
  children,
}: {
  icon: LucideIcon;
  color?: string;
  left: number;
  top: number;
  w: number;
  children: ReactNode;
}) {
  return (
    <div
      className="absolute flex h-[24px] items-center gap-[3px] rounded-[12px] bg-white px-[5px]"
      style={{ left, top, width: w }}
    >
      <Icon className="h-[12px] w-[12px] shrink-0" strokeWidth={1.7} style={{ color }} />
      <span className="whitespace-nowrap text-[10px] leading-none text-ink/80">{children}</span>
    </div>
  );
}

function DatePill({
  day,
  weekday,
  bg,
  size,
  left,
  top,
  w,
}: {
  day: string;
  weekday: string;
  bg: string;
  size: number;
  left: number;
  top: number;
  w: number;
}) {
  return (
    <div
      className="absolute flex flex-col items-center justify-center rounded-[18px]"
      style={{ left, top, width: w, height: 52, background: bg }}
    >
      <span className="font-light text-ink" style={{ fontSize: size, lineHeight: "16px" }}>
        {day}
      </span>
      <span className="font-light text-ink" style={{ fontSize: size, lineHeight: "16px" }}>
        {weekday}
      </span>
    </div>
  );
}

function TimePill({ time, left, top }: { time: string; left: number; top: number }) {
  return (
    <div
      className="absolute flex h-[24px] items-center gap-[4px] rounded-[18px] bg-white px-[5px]"
      style={{ left, top, width: 74 }}
    >
      <Clock className="h-[13px] w-[13px] shrink-0 text-ink/60" strokeWidth={1.8} />
      <span className="whitespace-nowrap font-inter text-[10.2px] leading-none text-ink/60">{time}</span>
    </div>
  );
}

function AvatarCircle({
  left,
  top,
  size,
  grad,
}: {
  left: number;
  top: number;
  size: number;
  grad: string;
}) {
  return (
    <span
      className={`absolute shrink-0 rounded-full ${grad}`}
      style={{ left, top, width: size, height: size }}
    />
  );
}

function EditGlyph({ left, top }: { left: number; top: number }) {
  return (
    <div
      className="absolute flex h-[16px] w-[16px] items-center justify-center rounded-full bg-[#ECEAEA]"
      style={{ left, top }}
    >
      <Pencil className="h-[8px] w-[8px] text-ink/70" strokeWidth={1.6} />
    </div>
  );
}

function Ticket({
  left,
  top,
  w,
  h,
  label,
  children,
}: {
  left: number;
  top: number;
  w: number;
  h: number;
  label: string;
  children?: ReactNode;
}) {
  return (
    <div
      className="absolute rounded-[10px] border border-dashed border-black/20 bg-white"
      style={{ left, top, width: w, height: h }}
    >
      <span className="absolute -top-[7px] left-1/2 -translate-x-1/2 whitespace-nowrap bg-white px-[4px] font-['Roboto_Mono',monospace] text-[9px] font-medium text-ink">
        {label}
      </span>
      {children}
    </div>
  );
}

/* ----------------------------- creator card ---------------------------- */
function CreatorCard({ left }: { left: number }) {
  const navigate = useNavigate();
  return (
    <div
      className="absolute h-[193px] w-[266px] rounded-[12px] bg-[#F5F5F5]"
      style={{ left, top: 711 }}
    >
      {/* corner arrow */}
      <CircleBtn left={234} top={-1} size={28} onClick={() => navigate("/creators/detail")}>
        <ArrowUpRight className="h-[15px] w-[15px] text-ink" strokeWidth={1.8} />
      </CircleBtn>

      {/* header */}
      <AvatarCircle left={8} top={6} size={38} grad="bg-gradient-to-br from-[#C8E6FF] to-[#C8B3ED]" />
      <div className="absolute left-[51px] top-[10.5px] text-[12px] leading-[15px] text-ink/90">
        Leena Sharma
      </div>
      <div className="absolute left-[51px] top-[26.5px] text-[8px] leading-none text-ink/70">
        @leenabliss
      </div>

      {/* location */}
      <div className="absolute left-[163px] top-[8px] flex h-[24px] w-[55px] items-center gap-[2px] rounded-[12px] bg-white px-[5px]">
        <MapPin className="h-[11px] w-[11px] text-ink" strokeWidth={1.7} />
        <span className="text-[10.2px] leading-none text-ink">Delhi</span>
      </div>

      {/* stats row 1 */}
      <CChip icon={Crown} color="#000000" left={10} top={51} w={68}>
        1.2M
      </CChip>
      <CChip icon={Eye} color="#2CC37F" left={69} top={51} w={110}>
        900k Avg. views
      </CChip>
      <CChip icon={Heart} color="#000000" left={173} top={51} w={77}>
        4.5% ER
      </CChip>

      {/* stats row 2 */}
      <CChip icon={Star} color="#FDD835" left={10} top={82} w={87}>
        4.8 Stars
      </CChip>
      <CChip icon={Eye} color="#2CC37F" left={87} top={82} w={91}>
        0.23p CPV
      </CChip>
      <CChip icon={Sparkles} color="#603CFF" left={173} top={82} w={79}>
        80% Match
      </CChip>

      {/* managed by */}
      <span className="absolute left-[8px] top-[112px] text-[9.3px] leading-none text-ink/70">
        Managed by:
      </span>
      <div className="absolute left-[8px] top-[132px] h-[33px] w-[237px] rounded-[10.83px] border border-[#6801FE]/10 bg-gradient-to-r from-[#6801FE]/[0.06] to-[#D9D9D9]/[0.06]" />
      <AvatarCircle
        left={13}
        top={137}
        size={24}
        grad="bg-gradient-to-br from-[#B0FE69] to-[#1FB37A]"
      />
      <div className="absolute left-[41px] top-[136.2px] text-[10.2px] leading-none text-ink/90">
        Stellar Talents
      </div>
      <div className="absolute left-[41px] top-[149.8px] text-[8px] leading-none text-ink/60">
        4.8 Stars
      </div>
      <div className="absolute left-[163px] top-[136px] flex h-[25px] w-[75px] items-center justify-center gap-[3px] rounded-[8px] bg-white/70">
        <Wallet className="h-[12px] w-[12px] text-[#EDCE83]" strokeWidth={1.8} />
        <span className="text-[12px] font-medium text-[#571A9F]">₹65.5K</span>
      </div>

      {/* corner deco */}
      <span className="absolute left-[240px] top-[167px] h-[15px] w-[15px] rounded-[5px] bg-white" />
    </div>
  );
}

/* -------------------------------- page --------------------------------- */
export default function ContactedLeadDetailPage() {
  const navigate = useNavigate();
  const [sp] = useSearchParams();
  const id = sp.get("id");
  const { data } = useLeads();
  const convert = useConvertLead();
  const item =
    (data ?? []).find((x) => x.id === id) ??
    (data ?? []).find((x) => x.status === "CONTACTED");
  return (
    <>
      {/* ---------- back + heading ---------- */}
      <div
        className="absolute left-[235px] top-[153px] flex h-[45px] w-[45px] items-center justify-center rounded-full bg-black cursor-pointer"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft className="h-[22px] w-[22px] text-white" strokeWidth={2} />
      </div>
      <h1 className="absolute left-[270px] top-[225px] text-[34px] font-normal leading-none text-ink">
        Contacted
      </h1>
      <span className="absolute left-[538px] top-[236px] text-[24px] font-normal leading-none text-ink">
        {item?.peopleCount ?? 0} Leads
      </span>

      {/* ===================== LEAD INFO CONTAINER ===================== */}
      <div className="absolute left-[261px] top-[301px] h-[334px] w-[838px] rounded-[24px] bg-[rgba(243,243,243,0.13)]" />

      {/* assigned to */}
      <AvatarCircle
        left={279}
        top={378}
        size={45}
        grad="bg-gradient-to-br from-[#C8E6FF] to-[#C8B3ED]"
      />
      <span className="absolute left-[332px] top-[379.5px] text-[12px] leading-none text-ink/70">
        Assigned to
      </span>
      <span className="absolute left-[332px] top-[397.5px] text-[20px] leading-none text-ink/90">
        Rahul Aggrawal
      </span>
      <span className="absolute left-[502px] top-[401px] text-[12px] font-light leading-none text-ink/70">
        Sales
      </span>

      {/* segment bar */}
      <div className="absolute left-[777px] top-[314px] flex h-[30px] w-[111px] items-center gap-[4px] rounded-[18px] bg-white px-[12px]">
        <span className="h-[20px] w-[14px] rounded-[8px] bg-[#FD9591]" />
        <span className="h-[20px] w-[14px] rounded-[8px] bg-[#F9A56F]" />
        <span className="h-[20px] w-[14px] rounded-[8px] bg-[#FCDD66]" />
        <span className="h-[20px] w-[14px] rounded-[8px] bg-[#B0FE69]" />
        <span className="h-[20px] w-[14px] rounded-[8px] bg-[#A09C9C]" />
      </div>

      {/* info chips */}
      {[
        { text: "12 July", left: 278, w: 72 },
        { text: "Zostel Trip", left: 359, w: 72 },
        { text: "www.yourwebsite.com", left: 440, w: 148 },
        { text: item?.engagementRate ?? "", left: 597, w: 89 },
        { text: "Paid", left: 695, w: 72 },
      ].map((c) => (
        <div
          key={c.text}
          className="absolute flex h-[30px] items-center justify-center rounded-full bg-white"
          style={{ left: c.left, top: 314, width: c.w }}
        >
          <span className="text-[12px] font-light leading-none text-[#121212]">{c.text}</span>
        </div>
      ))}

      {/* client detail card */}
      <div className="absolute left-[555px] top-[374px] h-[53px] w-[239px] rounded-[13px] bg-white" />
      <AvatarCircle left={560} top={384} size={38} grad="bg-gradient-to-br from-[#FFD6E7] to-[#C8B3ED]" />
      <span className="absolute left-[608px] top-[382px] text-[12px] leading-none text-ink/70">
        Client Detail
      </span>
      <span className="absolute left-[608px] top-[400px] text-[18px] leading-none text-ink/90">
        {item?.contactPerson ?? ""}
      </span>
      <CircleBtn left={733} top={391} size={23.9}>
        <Phone className="h-[14px] w-[14px] text-ink" strokeWidth={1.7} />
      </CircleBtn>
      <img src={whatsapp} alt="WhatsApp" className="absolute left-[762.5px] top-[391px] h-[24px] w-[23.8px]" />

      {/* lead source card */}
      <div className="absolute left-[808px] top-[374px] h-[53px] w-[274px] rounded-[13px] bg-white" />
      <AvatarCircle left={813} top={384} size={38} grad="bg-gradient-to-br from-[#C8E6FF] to-[#B0FE69]" />
      <span className="absolute left-[861px] top-[382px] text-[12px] leading-none text-ink/70">
        Lead Source
      </span>
      <span className="absolute left-[861px] top-[400px] text-[18px] leading-none text-ink/90">
        Leena Sharma
      </span>
      <CircleBtn left={989} top={391} size={23.9} onClick={() => navigate("/creators/detail")}>
        <ArrowUpRight className="h-[14px] w-[14px] text-ink" strokeWidth={1.8} />
      </CircleBtn>
      <CircleBtn left={1018.5} top={391} size={23.9}>
        <Phone className="h-[14px] w-[14px] text-ink" strokeWidth={1.7} />
      </CircleBtn>
      <img src={whatsapp} alt="WhatsApp" className="absolute left-[1048px] top-[391px] h-[24px] w-[23.8px]" />

      {/* converted pill */}
      <div
        className="absolute left-[901px] top-[308px] flex h-[45px] w-[133px] items-center rounded-[28px] bg-white/90 pl-[20px] cursor-pointer"
        onClick={() => {
          if (item?.id) convert.mutate(item.id);
          navigate("/leads/connected");
        }}
      >
        <span className="text-[14px] font-light text-ink">Converted</span>
        <Plus className="absolute left-[82.5px] h-[15px] w-[15px] text-ink" strokeWidth={1.8} />
        <ArrowUp className="absolute left-[96px] h-[14px] w-[14px] text-ink" strokeWidth={2} />
      </div>

      {/* edit button */}
      <div className="absolute left-[1040px] top-[308px] flex h-[45px] w-[45px] items-center justify-center rounded-[24px] bg-white">
        <Pencil className="h-[21px] w-[21px] text-ink" strokeWidth={1.6} />
      </div>

      {/* ---- Message card ---- */}
      <div className="absolute left-[278px] top-[447px] h-[178px] w-[258px] rounded-[12px] bg-[#F5F5F5]" />
      <span className="absolute left-[290px] top-[455px] text-[12px] leading-[24px] text-ink">Message</span>
      <div className="absolute left-[502px] top-[455px] flex h-[24px] w-[24px] items-center justify-center rounded-full bg-[#FEFCFF]">
        <Plus className="h-[12px] w-[12px] text-ink" strokeWidth={1.8} />
      </div>
      <div className="absolute left-[290px] top-[480px] h-[130px] w-[236px] rounded-[12px] bg-white" />
      <p className="absolute left-[296px] top-[486px] w-[219px] text-[12px] font-light leading-[20px] text-ink/60">
        We are launching a new skincare product
      </p>

      {/* ---- Deliverables card ---- */}
      <div className="absolute left-[551px] top-[447px] h-[178px] w-[258px] rounded-[12px] bg-[#F5F5F5]" />
      <span className="absolute left-[563px] top-[455px] text-[12px] leading-[24px] text-ink">Deliverables</span>
      <div className="absolute left-[775px] top-[455px] flex h-[24px] w-[24px] items-center justify-center rounded-full bg-[#FEFCFF]">
        <Plus className="h-[12px] w-[12px] text-ink" strokeWidth={1.8} />
      </div>
      <div className="absolute left-[563px] top-[485px] h-[127px] w-[236px] rounded-[12px] bg-white" />
      <div className="absolute left-[570px] top-[491px] h-[36px] w-[128px] rounded-[12px] bg-white shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
        <span className="absolute left-[0px] top-[2px] flex h-[16px] w-[16px] items-center justify-center rounded-[4px] bg-gradient-to-br from-[#FFDD55] via-[#FF543E] to-[#C837AB]">
          <Instagram className="h-[10px] w-[10px] text-white" strokeWidth={2} />
        </span>
        <div className="absolute left-[26px] top-[4px] flex items-center gap-[5px]">
          <Video className="h-[11px] w-[11px] text-ink/70" strokeWidth={1.7} />
          <span className="text-[12px] font-light leading-none text-ink/60">1 Collab Reel</span>
        </div>
        <div className="absolute left-[26px] top-[22px] flex items-center gap-[5px]">
          <Images className="h-[11px] w-[11px] text-ink/70" strokeWidth={1.7} />
          <span className="text-[12px] font-light leading-none text-ink/60">2 Stories</span>
        </div>
      </div>

      {/* ---- Add Notes card ---- */}
      <div className="absolute left-[824px] top-[447px] h-[178px] w-[258px] rounded-[12px] bg-[#F5F5F5]" />
      <span className="absolute left-[836px] top-[455px] text-[12px] leading-[24px] text-ink">Add Notes</span>
      <div className="absolute left-[1048px] top-[455px] flex h-[24px] w-[24px] items-center justify-center rounded-full bg-[#FEFCFF]">
        <Plus className="h-[12px] w-[12px] text-ink" strokeWidth={1.8} />
      </div>
      <div className="absolute left-[836px] top-[485px] h-[130px] w-[236px] rounded-[12px] bg-white" />
      <span className="absolute left-[842px] top-[491px] text-[12px] leading-none text-ink/70">Today</span>
      <span className="absolute left-[883px] top-[500.5px] h-px w-[92px] bg-black/10" />
      <p className="absolute left-[842px] top-[512px] w-[226px] text-[12px] font-light leading-[20px] text-ink/60">
        here comes your note
      </p>

      {/* ===================== FOLLOW UP CARD ===================== */}
      <div className="absolute left-[1109px] top-[301px] h-[234px] w-[295px] rounded-[12px] bg-white/60" />
      <span className="absolute left-[1119px] top-[309px] text-[12px] leading-[24px] text-ink">Follow Up</span>
      <div className="absolute left-[1376px] top-[301px] flex h-[28px] w-[28px] items-center justify-center rounded-full bg-white">
        <Plus className="h-[14px] w-[14px] text-ink" strokeWidth={2} />
      </div>
      <div className="absolute left-[1119px] top-[340px] h-[184px] w-[272px] rounded-[12px] bg-white" />
      <span className="absolute left-[1126px] top-[347px] text-[12px] leading-none text-ink/70">Today</span>
      <span className="absolute left-[1167px] top-[356.5px] h-px w-[92px] bg-black/10" />
      <DatePill day="20" weekday="Fri" bg="#D8DDFF" size={15} left={1126} top={375} w={38} />
      <span className="absolute left-[1170px] top-[380px] text-[16px] leading-none text-ink">
        Follow - Up Scheduled
      </span>
      <div className="absolute left-[1170px] top-[408px] flex items-center gap-[4px]">
        <span className="h-[14px] w-[14px] rounded-full bg-gradient-to-br from-[#FFD6E7] to-[#C8B3ED]" />
        <span className="text-[10.2px] leading-none text-ink/90">Priya Sharma</span>
      </div>
      <X className="absolute left-[1370px] top-[383px] h-[14px] w-[14px] text-ink" strokeWidth={1.8} />

      {/* ===================== CREATORS CARD ===================== */}
      <div className="absolute left-[261px] top-[655px] h-[274px] w-[590px] rounded-[12px] bg-[rgba(245,245,245,0.6)]" />
      <span className="absolute left-[277px] top-[663px] text-[12px] leading-[24px] text-ink">Creators</span>
      {/* action buttons */}
      <CircleBtn left={660} top={662} size={28} onClick={() => navigate("/search")}>
        <Search className="h-[14px] w-[14px] text-ink" strokeWidth={1.8} />
      </CircleBtn>
      <CircleBtn left={696} top={662} size={28} onClick={() => navigate("/campaigns/assign")}>
        <UserRound className="h-[15px] w-[15px] text-ink" strokeWidth={1.7} />
      </CircleBtn>
      <CircleBtn left={732} top={662} size={28}>
        <Trash2 className="h-[14px] w-[14px] text-ink" strokeWidth={1.7} />
      </CircleBtn>
      <CircleBtn left={769} top={662} size={28} onClick={() => navigate("/leads/add-creator")}>
        <Plus className="h-[14px] w-[14px] text-ink" strokeWidth={2} />
      </CircleBtn>
      <CircleBtn left={820} top={662} size={28} onClick={() => navigate("/leads/creator-list")}>
        <ArrowUpRight className="h-[15px] w-[15px] text-ink" strokeWidth={1.8} />
      </CircleBtn>
      {/* creator cards */}
      <CreatorCard left={278} />
      <CreatorCard left={559} />

      {/* ===================== ACTIVITY CARD ===================== */}
      <div className="absolute left-[863px] top-[656px] h-[275px] w-[236px] rounded-[12px] bg-[rgba(249,249,249,0.7)]" />
      <span className="absolute left-[873px] top-[664px] text-[12px] leading-[24px] text-ink">Activity</span>
      <div className="absolute left-[873px] top-[694px] h-[225px] w-[212px] rounded-[12px] bg-white" />
      {/* today */}
      <span className="absolute left-[879px] top-[702px] text-[12px] leading-none text-ink/70">Today</span>
      <span className="absolute left-[920px] top-[711.5px] h-px w-[92px] bg-black/10" />
      <DatePill day="20" weekday="Fri" bg="#D8DDFF" size={13} left={879} top={727} w={36} />
      <span className="absolute left-[921px] top-[728.5px] text-[16px] leading-none text-ink">
        Follow up schedule
      </span>
      <TimePill time="02:00 pm" left={921} top={753} />
      {/* yesterday */}
      <span className="absolute left-[879px] top-[789px] text-[12px] leading-none text-ink/70">Yesterday</span>
      <span className="absolute left-[945px] top-[798.5px] h-px w-[92px] bg-black/10" />
      <DatePill day="19" weekday="Thu" bg="#EFEFF0" size={13} left={879} top={818} w={36} />
      <span className="absolute left-[921px] top-[819.5px] text-[16px] leading-none text-ink">Call</span>
      <TimePill time="01:00 pm" left={921} top={844} />

      {/* ===================== PAYMENT SUMMARY CARD ===================== */}
      <div className="absolute left-[1109px] top-[553px] h-[437px] w-[295px] rounded-[12px] bg-[rgba(245,245,245,0.6)]" />
      <span className="absolute left-[1119px] top-[561px] text-[12px] leading-[24px] text-ink">Payment Summary</span>
      <div
        className="absolute left-[1376px] top-[553px] flex h-[28px] w-[28px] items-center justify-center rounded-full bg-white cursor-pointer"
        onClick={() => navigate("/payments/paid")}
      >
        <ArrowUpRight className="h-[15px] w-[15px] text-ink" strokeWidth={1.8} />
      </div>
      <div className="absolute left-[1119px] top-[595.8px] h-[375.5px] w-[270px] rounded-[12px] bg-white" />
      <span className="absolute left-[1189px] top-[611.8px] w-[131px] text-center text-[16px] font-medium leading-none text-ink">
        {item?.brandName ?? "Brand Name"}
      </span>

      {/* invoice ticket */}
      <Ticket left={1139} top={648.8} w={230} h={52} label="Invoice">
        <span className="absolute left-1/2 top-[24px] -translate-x-1/2 whitespace-nowrap font-['Roboto_Mono',monospace] text-[12.6px] font-bold text-ink">
          INV-2025-045
        </span>
      </Ticket>

      {/* divider */}
      <span className="absolute left-[1131px] top-[714.8px] h-px w-[246px] bg-black/10" />

      {/* brand budget rows */}
      <span className="absolute left-[1131px] top-[728.8px] text-[13px] font-medium leading-[20px] text-ink">Brand Budget</span>
      <span className="absolute left-[1317px] top-[728.8px] w-[60px] text-right text-[12px] font-medium leading-[20px] text-ink/50">
        ₹{item?.money ?? ""}
      </span>

      <span className="absolute left-[1131px] top-[752.8px] text-[12px] leading-[20px] text-ink/50">Leena Sharma</span>
      <span className="absolute left-[1293px] top-[752.8px] text-[12px] leading-[20px] text-[#E44E26]">- ₹1,00,000</span>
      <EditGlyph left={1363} top={752.8} />

      <span className="absolute left-[1131px] top-[776.8px] text-[12px] leading-[20px] text-ink/50">Riya Sharma</span>
      <span className="absolute left-[1256px] top-[780.8px] text-[7.2px] leading-none text-[#E44E26] line-through">₹1,20,000</span>
      <span className="absolute left-[1294px] top-[776.8px] text-[12px] leading-[20px] text-[#E44E26]">- ₹1,00,000</span>
      <EditGlyph left={1363} top={776.8} />

      {/* agency fee ticket */}
      <Ticket left={1139} top={802.8} w={230} h={51} label="Agency Fee">
        <span className="absolute left-[172px] top-[20px] text-[12px] font-medium leading-[20px] text-ink/50">₹30,000</span>
        {/* Added pill */}
        <div className="absolute left-[7px] top-[19px] flex h-[22px] w-[117px] items-center rounded-[24px] bg-white pl-[7px]">
          <span className="flex h-[13px] w-[13px] items-center justify-center rounded-[7.4px] bg-[#ECEAEA]">
            <Plus className="h-[7px] w-[7px] text-ink" strokeWidth={2} />
          </span>
          <span className="ml-[6px] text-[12px] leading-none text-ink">Added</span>
          <div className="absolute left-[67px] flex h-[22px] w-[57px] items-center rounded-[24px] bg-white pl-[7px]">
            <span className="text-[12px] font-medium leading-none text-[#3DBB6C]">15%</span>
            <span className="absolute left-[38px] flex h-[16px] w-[16px] items-center justify-center rounded-full bg-[#ECEAEA]">
              <Pencil className="h-[8px] w-[8px] text-ink/70" strokeWidth={1.6} />
            </span>
          </div>
        </div>
      </Ticket>

      {/* received payment */}
      <div className="absolute left-[1134px] top-[866px] flex h-[38px] w-[239px] items-center justify-between rounded-[13px] bg-white px-[9px]">
        <span className="text-[13px] font-medium leading-[20px] text-ink">Received Payment</span>
        <span
          className="text-[12px] leading-[15px] text-[rgba(32,11,214,0.99)] underline cursor-pointer"
          onClick={() => navigate("/payments/received")}
        >
          Set Now
        </span>
      </div>

      {/* divider */}
      <span className="absolute left-[1131px] top-[915.8px] h-px w-[246px] bg-black/10" />

      {/* estimate payout */}
      <span className="absolute left-[1131px] top-[931.8px] text-[13px] font-medium leading-[20px] text-ink">Estimate Payout</span>
      <span className="absolute left-[1304px] top-[931.8px] text-[15px] font-semibold leading-[20px] text-[#3DBB6C]">₹2,50,000</span>
    </>
  );
}
