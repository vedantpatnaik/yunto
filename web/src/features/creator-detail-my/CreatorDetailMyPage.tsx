import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import {
  ArrowLeft,
  ChevronDown,
  Contrast,
  Users,
  Eye,
  Star,
  Heart,
  Phone,
  ArrowUpRight,
  Clock,
  Video,
  Image as ImageIcon,
  Calendar,
  Home,
  Plus,
  Link as LinkIcon,
  Info,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import whatsapp from "@/assets/icons/whatsapp.svg";

/**
 * Super Admin — Creator detail (my creator).
 * Exact reconstruction of Figma frame 5063:58845, 1440×1024.
 * Clean underlying page — the profile dropdown popup + dim scrim (node 5063:59726)
 * and the shared TopBar/Sidebar are intentionally omitted (rendered by AppShell).
 */

/* ------------------------------ primitives ----------------------------- */

function ExpandBtn({
  left,
  top,
  onClick,
}: {
  left: number;
  top: number;
  onClick?: () => void;
}) {
  return (
    <span
      onClick={onClick}
      className={`absolute flex items-center justify-center rounded-full bg-white${onClick ? " cursor-pointer" : ""}`}
      style={{ left, top, width: 28, height: 28 }}
    >
      <ArrowUpRight className="h-[15px] w-[15px] text-black" strokeWidth={1.7} />
    </span>
  );
}

function StatItem({
  x,
  icon: Icon,
  color,
  value,
  label,
}: {
  x: number;
  icon: LucideIcon;
  color: string;
  value: string;
  label: string;
}) {
  return (
    <>
      <span
        className="absolute flex items-center justify-center rounded-full border border-black/[0.06] bg-white"
        style={{ left: x, top: 463, width: 48, height: 48 }}
      >
        <Icon size={24} color={color} strokeWidth={1.7} />
      </span>
      <span
        className="absolute text-[12px] font-normal leading-none text-[#A0AEC0]"
        style={{ left: x, top: 519 }}
      >
        {label}
      </span>
      <span
        className="absolute text-[15px] font-semibold leading-none text-[#101010]"
        style={{ left: x, top: 534 }}
      >
        {value}
      </span>
    </>
  );
}

function DayLabel({ y, lineX, label }: { y: number; lineX: number; label: string }) {
  return (
    <>
      <span
        className="absolute text-[12px] font-normal leading-none text-black/70"
        style={{ left: 1004, top: y }}
      >
        {label}
      </span>
      <span
        className="absolute h-px bg-black/10"
        style={{ left: lineX, top: y + 8, width: 100 }}
      />
    </>
  );
}

function EventRow({
  y,
  dayNum,
  dayName,
  dateBg,
  title,
  time,
}: {
  y: number;
  dayNum: string;
  dayName: string;
  dateBg: string;
  title: string;
  time: string;
}) {
  return (
    <>
      <span
        className="absolute flex flex-col items-center justify-center rounded-[18px]"
        style={{ left: 1004, top: y, width: 36, height: 52, background: dateBg }}
      >
        <span className="text-[13px] font-light leading-[16px] text-black">{dayNum}</span>
        <span className="text-[13px] font-light leading-[16px] text-black">{dayName}</span>
      </span>
      <span
        className="absolute text-[16px] font-normal leading-none text-black"
        style={{ left: 1046, top: y + 4 }}
      >
        {title}
      </span>
      <span
        className="absolute flex items-center gap-[4px] rounded-[18px] bg-white px-[7px]"
        style={{ left: 1046, top: y + 26, height: 24 }}
      >
        <Clock className="h-[12px] w-[12px] text-black/60" strokeWidth={1.6} />
        <span className="font-inter text-[10px] leading-none text-black/60">{time}</span>
      </span>
    </>
  );
}

function AddOnItem({
  y,
  icon: Icon,
  title,
  sub,
  price,
}: {
  y: number;
  icon: LucideIcon;
  title: string;
  sub: string;
  price: string;
}) {
  return (
    <div
      className="absolute rounded-[12px] bg-white/90"
      style={{ left: 1007, top: y, width: 255, height: 61 }}
    >
      <span
        className="absolute flex items-center justify-center rounded-full bg-[#F1F1F1]"
        style={{ left: 8, top: 11, width: 24, height: 24 }}
      >
        <Icon className="h-[14px] w-[14px] text-black/80" strokeWidth={1.6} />
      </span>
      <span className="absolute text-[14px] font-light text-black" style={{ left: 38, top: 10 }}>
        {title}
      </span>
      <div className="absolute flex items-center gap-[4px]" style={{ left: 38, top: 33 }}>
        <span className="text-[11px] font-normal leading-none text-[#443A4D]">{sub}</span>
        <span className="text-[11px] leading-none text-[#443A4D]">•</span>
        <span className="font-inter text-[12px] font-semibold leading-none text-[#3DBB6C]">
          {price}
        </span>
      </div>
      <span
        className="absolute flex items-center justify-center rounded-full bg-white shadow-[0_1px_4px_rgba(0,0,0,0.12)]"
        style={{ left: 217, top: 17, width: 28, height: 28 }}
      >
        <Phone className="h-[15px] w-[15px] text-black" strokeWidth={1.5} />
      </span>
    </div>
  );
}

function BudgetRow({
  y,
  label,
  price,
  red,
  bold,
  tax = true,
}: {
  y: number;
  label: string;
  price: string;
  red?: boolean;
  bold?: boolean;
  tax?: boolean;
}) {
  return (
    <div
      className="absolute flex items-start justify-between"
      style={{ left: 1007, top: y, width: 246 }}
    >
      <span
        className={`text-[13px] leading-none ${bold ? "font-medium text-black" : "font-normal text-black/50"}`}
      >
        {label}
      </span>
      <span className="flex items-start gap-[2px]">
        <span
          className={`text-[12px] leading-none ${red ? "font-normal text-[#E44E26]" : "font-medium text-black/50"}`}
        >
          {price}
        </span>
        {tax && (
          <span className="mt-[1px] text-[5px] font-medium leading-none text-black/50">
            (tax inc.)
          </span>
        )}
      </span>
    </div>
  );
}

/* Small white pill used across chips / tags */
function TinyPill({
  left,
  top,
  width,
  children,
}: {
  left: number;
  top: number;
  width?: number;
  children: ReactNode;
}) {
  return (
    <span
      className="absolute flex items-center justify-center rounded-full bg-white"
      style={{ left, top, width, height: 30 }}
    >
      {children}
    </span>
  );
}

/* ------------------------------- page ---------------------------------- */
export default function CreatorDetailMyPage() {
  const navigate = useNavigate();
  return (
    <>
      {/* back button — 235,153 45x45 black */}
      <span
        onClick={() => navigate(-1)}
        className="absolute left-[235px] top-[153px] flex h-[45px] w-[45px] cursor-pointer items-center justify-center rounded-full bg-black"
      >
        <ArrowLeft className="h-[20px] w-[20px] text-white" strokeWidth={1.8} />
      </span>

      {/* title */}
      <h1 className="absolute left-[268px] top-[230px] text-[34px] font-normal leading-none text-black">
        Nike&rsquo;s Diwali
      </h1>

      {/* Manage Calendar / Mark Done */}
      <div className="absolute left-[609px] top-[246px] flex items-center gap-[8px]">
        <span
          onClick={() => navigate("/calendar")}
          className="flex h-[45px] w-[193px] cursor-pointer items-center justify-center rounded-[24px] bg-white text-[20px] font-extralight text-black"
        >
          Manage Calendar
        </span>
        <span
          onClick={() => navigate("/campaigns/detail")}
          className="flex h-[45px] w-[144px] cursor-pointer items-center justify-center rounded-[24px] bg-white text-[20px] font-extralight text-black"
        >
          Mark Done
        </span>
      </div>

      {/* divider under title (notch bottom of subtract) */}
      <span className="absolute left-[261px] top-[300px] h-px w-[701px] bg-[#D9D9D9]" />

      {/* ============================ TEAM CARD ============================ */}
      <div className="absolute left-[277px] top-[311px] h-[285px] w-[691px] rounded-[24px] bg-[#F3F3F3]/[0.13]" />

      {/* chips */}
      <TinyPill left={284} top={325} width={68}>
        <span className="text-[12px] font-light text-[#121212]">Beauty</span>
      </TinyPill>
      <TinyPill left={360} top={325} width={72}>
        <span className="text-[12px] font-light text-[#121212]">Lifestyle</span>
      </TinyPill>
      <TinyPill left={440} top={325} width={58}>
        <span className="flex items-center gap-[2px] text-[10.2px] font-normal text-black">
          <span className="text-[10px]">📍</span>Delhi
        </span>
      </TinyPill>

      {/* status dropdown */}
      <div className="absolute left-[748px] top-[321px] flex h-[45px] w-[185px] items-center rounded-[24px] bg-white pl-[9px] pr-[10px]">
        <Contrast className="h-[24px] w-[24px] text-[#79B282]" strokeWidth={1.6} />
        <span className="ml-[3px] text-[14px] font-light text-black">Waiting for shoot</span>
        <ChevronDown className="ml-auto h-[16px] w-[16px] text-black" strokeWidth={1.8} />
      </div>

      {/* creator avatar + fire badge */}
      <span className="absolute left-[284px] top-[388px] h-[45px] w-[45px] rounded-full bg-gradient-to-br from-[#F5C4A0] to-[#C88B6A]" />
      <span className="absolute left-[318px] top-[413px] text-[15px] leading-none">🔥</span>
      <div className="absolute left-[341px] top-[389px] leading-none">
        <div className="text-[17.4px] font-normal leading-[21.6px] text-black/90">Leena Sharma</div>
        <div className="text-[11.6px] font-normal leading-[18.8px] text-black/70">@leenabliss</div>
      </div>

      {/* whatsapp + call */}
      <img src={whatsapp} alt="WhatsApp" className="absolute left-[860px] top-[396px] h-[28px] w-[28px]" />
      <span className="absolute left-[897px] top-[396px] flex h-[28px] w-[28px] items-center justify-center rounded-full bg-white shadow-[0_1px_4px_rgba(0,0,0,0.12)]">
        <Phone className="h-[15px] w-[15px] text-black" strokeWidth={1.5} />
      </span>

      {/* stats card */}
      <div className="absolute left-[299px] top-[451px] h-[115px] w-[640px] rounded-[24px] bg-white" />
      <StatItem x={338} icon={Users} color="#4880D4" value="1.1 M" label="Followers" />
      <StatItem x={499} icon={Eye} color="#2CC37F" value="4.5 %" label="Engagement Rate" />
      <StatItem x={660} icon={Star} color="#FDD835" value="4.5 Stars" label="Rating" />
      <StatItem x={821} icon={Heart} color="#EE6C9A" value="900k" label="Avg. Views" />

      {/* ============================ ACTIVITY PANEL ======================= */}
      <div className="absolute left-[988px] top-[253px] h-[441px] w-[298px] rounded-[12px] bg-white/60" />
      <span className="absolute left-[998px] top-[261px] text-[14px] font-normal text-black">Activity</span>
      <ExpandBtn left={1258} top={253} onClick={() => navigate("/calendar")} />
      <div className="absolute left-[998px] top-[294px] h-[377px] w-[277px] rounded-[12px] bg-white" />

      <DayLabel y={300} lineX={1066} label="Day 1" />
      <EventRow y={325} dayNum="20" dayName="Fri" dateBg="#D8DDFF" title="Campaign Shared" time="02:00 pm" />
      <DayLabel y={387} lineX={1047} label="Day 2" />
      <EventRow y={416} dayNum="21" dayName="Sat" dateBg="#EFEFF0" title="Campaign briefed" time="01:00 pm" />
      <DayLabel y={478} lineX={1047} label="Day 3" />
      <EventRow y={507} dayNum="23" dayName="Sat" dateBg="#EFEFF0" title="Shoot completed" time="01:00 pm" />
      <DayLabel y={569} lineX={1047} label="Day 4" />
      <EventRow y={598} dayNum="25" dayName="Sat" dateBg="#EFEFF0" title="Expected editing delivery" time="01:00 pm" />

      {/* ============================ ADD-ONS PANEL ======================= */}
      <div className="absolute left-[988px] top-[701px] h-[506px] w-[298px] rounded-[12px] bg-white/60" />
      <span className="absolute left-[998px] top-[714px] text-[14px] font-normal text-black">Add -Ons</span>
      <ExpandBtn left={1262} top={703} onClick={() => navigate("/creators/add-ons")} />
      <div className="absolute left-[998px] top-[745px] h-[452px] w-[275px] rounded-[12px] bg-white" />

      <AddOnItem y={757} icon={Video} title="Videographer" sub="On-site shoot" price="₹5,000" />
      <AddOnItem y={829} icon={ImageIcon} title="Editor" sub="Minimal Style" price="₹2,000" />

      {/* deliverables ticket */}
      <div
        className="absolute rounded-[10px] border border-dashed border-black/25"
        style={{ left: 1007, top: 908, width: 254, height: 60 }}
      >
        <span className="absolute left-1/2 top-[-7px] -translate-x-1/2 bg-white px-[4px] font-mono text-[9px] font-medium tracking-wide text-black">
          Deliverables
        </span>
        <span className="absolute left-[14px] top-[15px] text-[12px] font-normal text-black">1 Reel</span>
        <span className="absolute right-[8px] top-[11px] flex items-start gap-[2px]">
          <span className="text-[12px] font-medium text-black/50">₹60,000</span>
          <span className="mt-[1px] text-[5px] font-medium text-black/50">(tax inc.)</span>
        </span>
        <span className="absolute left-[14px] top-[36px] text-[12px] font-normal text-black">1 Post</span>
        <span className="absolute right-[8px] top-[32px] flex items-start gap-[2px]">
          <span className="text-[12px] font-medium text-black/50">₹10,000</span>
          <span className="mt-[1px] text-[5px] font-medium text-black/50">(tax inc.)</span>
        </span>
      </div>

      {/* budget breakdown */}
      <BudgetRow y={982} label="Brand Budget" price="₹1,00,000" bold />
      <BudgetRow y={1010} label="Leena Sharma" price="₹70,000" red />
      <BudgetRow y={1038} label="Videographer" price="₹5,000" red />
      <BudgetRow y={1066} label="Editor" price="₹2,000" red />
      <BudgetRow y={1094} label="Creator&rsquo;s GST (18%)" price="₹12,600" red tax={false} />

      {/* ============================ ADDONS SECTION ====================== */}
      <h2 className="absolute left-[278px] top-[616px] text-[24px] font-normal leading-none text-slate900">
        Addons
      </h2>

      {/* Seema card */}
      <div className="absolute left-[278px] top-[664px] h-[190px] w-[266px] rounded-[12px] bg-[#F5F5F5]" />
      <span className="absolute left-[286px] top-[670px] h-[38px] w-[38px] rounded-full bg-gradient-to-br from-[#C8E6FF] to-[#C8B3ED]" />
      <div className="absolute left-[329px] top-[674px] leading-none">
        <div className="text-[12px] font-normal leading-[15px] text-black/90">Seema Sharma</div>
        <div className="text-[8px] font-normal leading-[13px] text-black/70">Videographer</div>
      </div>
      <span className="absolute left-[476px] top-[672px] flex h-[22px] w-[22px] items-center justify-center rounded-full bg-white">
        <Phone className="h-[13px] w-[13px] text-black" strokeWidth={1.5} />
      </span>
      <ExpandBtn left={512} top={663} onClick={() => navigate("/creators/detail")} />
      {/* Service */}
      <span className="absolute left-[297px] top-[716px] text-[9.3px] font-normal text-black/90">Service</span>
      <div className="absolute left-[288px] top-[734px] flex h-[48px] w-[224px] items-center gap-[4px] rounded-[12px] bg-white pl-[8px]">
        <span className="h-[36px] w-[28px] rounded-[6px] bg-[#C4C4C4]" />
        <span className="text-[10.2px] font-normal text-black/90">On - Site Shoot</span>
      </div>
      {/* Shoot Date */}
      <span className="absolute left-[288px] top-[791px] text-[9.3px] font-normal text-black/90">Shoot Date</span>
      <div className="absolute left-[288px] top-[809px] flex h-[32px] w-[117px] items-center gap-[7px] rounded-[18px] bg-white pl-[3px]">
        <span className="flex h-[24px] w-[24px] items-center justify-center rounded-full bg-[#F1F1F1]">
          <Calendar className="h-[13px] w-[13px] text-black" strokeWidth={1.6} />
        </span>
        <span className="text-[12px] font-light text-black/90">20 June 2025</span>
      </div>
      {/* Deliver Date */}
      <span className="absolute left-[417px] top-[791px] text-[9.3px] font-normal text-black/90">Deliver Date</span>
      <div className="absolute left-[417px] top-[809px] flex h-[32px] w-[117px] items-center gap-[7px] rounded-[18px] bg-white pl-[3px]">
        <span className="flex h-[24px] w-[24px] items-center justify-center rounded-full bg-[#F1F1F1]">
          <Calendar className="h-[13px] w-[13px] text-black" strokeWidth={1.6} />
        </span>
        <span className="text-[12px] font-light text-black/90">22 June 2025</span>
      </div>

      {/* Add Video Editor dashed card */}
      <div className="absolute left-[554px] top-[664px] h-[190px] w-[266px] rounded-[12px] border border-dashed border-black/25 bg-white/50" />
      <span className="absolute left-[568px] top-[676px] flex h-[32px] w-[32px] items-center justify-center rounded-full bg-[#F1F1F1]">
        <ImageIcon className="h-[17px] w-[17px] text-black/80" strokeWidth={1.6} />
      </span>
      <span className="absolute left-[608px] top-[682px] text-[14px] font-light text-black/[0.99]">Add Video Editor</span>
      <span
        onClick={() => navigate("/creators/add-ons")}
        className="absolute left-[663px] top-[735px] flex h-[48px] w-[48px] cursor-pointer items-center justify-center rounded-full bg-black"
      >
        <Plus className="h-[18px] w-[18px] text-white" strokeWidth={2} />
      </span>
      <span className="absolute left-[623px] top-[811px] text-[14px] font-normal text-black/70">Add another add-on</span>

      {/* ============================ DELIVERABLES ======================== */}
      <h2 className="absolute left-[277px] top-[874px] text-[24px] font-normal leading-none text-slate900">
        Deliverables
      </h2>
      <div className="absolute left-[277px] top-[922px] h-[285px] w-[395px] rounded-[24px] bg-white" />
      <span className="absolute left-[294px] top-[940px] text-[14px] font-normal text-black">
        Add links to submit your deliverables
      </span>

      {/* input row */}
      <div className="absolute left-[294px] top-[980px] flex h-[33px] w-[289px] items-center rounded-[12px] border border-black/[0.06] bg-white pl-[8px] pr-[6px]">
        <span className="text-[10.2px] font-light text-black/70">Add your link</span>
        <span className="ml-auto flex h-[23px] w-[23px] items-center justify-center rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,0.12)]">
          <Plus className="h-[13px] w-[13px] text-black" strokeWidth={1.8} />
        </span>
        <span className="ml-[4px] flex h-[23px] w-[52px] items-center justify-center rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,0.10)] text-[9.2px] font-light text-[#121212]">
          Submit
        </span>
      </div>

      {/* deliverable row 1 */}
      <div className="absolute left-[294px] top-[1023px] flex h-[48px] w-[289px] items-center rounded-[12px] border border-black/[0.06] bg-white pl-[6px] pr-[8px]">
        <span className="h-[36px] w-[28px] rounded-[6px] bg-[#C4C4C4]" />
        <span className="ml-[4px] text-[10.2px] font-normal text-black/90">Nike&rsquo;s Diwali Reel Shoot</span>
        <span className="ml-auto flex h-[23px] w-[52px] items-center justify-center rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,0.10)] text-[9.2px] font-light text-[#121212]">
          Reel
        </span>
        <span className="ml-[8px] flex h-[23px] w-[23px] items-center justify-center rounded-full bg-black">
          <LinkIcon className="h-[11px] w-[11px] text-white" strokeWidth={2} />
        </span>
      </div>
      <span className="absolute left-[596px] top-[1038px] flex h-[18px] w-[52px] items-center justify-center rounded-[9px] bg-white text-[7.6px] font-normal text-[#00C16A] shadow-[0_1px_3px_rgba(0,0,0,0.08)]">
        Approved
      </span>

      {/* deliverable row 2 */}
      <div className="absolute left-[294px] top-[1081px] flex h-[48px] w-[289px] items-center rounded-[12px] border border-black/[0.06] bg-white pl-[6px] pr-[8px]">
        <span className="h-[36px] w-[28px] rounded-[6px] bg-[#C4C4C4]" />
        <span className="ml-[4px] text-[10.2px] font-normal text-black/90">Nike&rsquo;s Diwali Reel Shoot</span>
        <span className="ml-auto flex h-[23px] w-[52px] items-center justify-center rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,0.10)] text-[9.2px] font-light text-[#121212]">
          Story
        </span>
        <span className="ml-[8px] flex h-[23px] w-[23px] items-center justify-center rounded-full bg-black">
          <LinkIcon className="h-[11px] w-[11px] text-white" strokeWidth={2} />
        </span>
      </div>
      <span className="absolute left-[596px] top-[1090px] flex h-[18px] w-[52px] items-center justify-center rounded-[9px] bg-white text-[7.6px] font-normal text-[#62748E] shadow-[0_1px_3px_rgba(0,0,0,0.08)]">
        Disapprove
      </span>
      <span className="absolute left-[590px] top-[1111px] flex items-center gap-[2px]">
        <Info className="h-[11px] w-[11px] text-black/70" strokeWidth={1.6} />
        <span className="text-[7.4px] font-light text-black/70">script not good</span>
      </span>

      {/* ============================ ADDRESS ============================= */}
      <h2 className="absolute left-[686px] top-[874px] text-[24px] font-normal leading-none text-slate900">
        Address
      </h2>
      <div className="absolute left-[686px] top-[919px] h-[285px] w-[280px] rounded-[24px] bg-white" />
      <span className="absolute left-[705px] top-[933px] flex h-[48px] w-[48px] items-center justify-center rounded-full bg-white shadow-[0_2px_6px_rgba(0,0,0,0.06)]">
        <Home className="h-[20px] w-[20px] text-black" strokeWidth={1.6} />
      </span>
      <span className="absolute left-[705px] top-[989px] text-[12px] font-normal leading-none text-[#A0AEC0]">
        Home Address
      </span>
      <p className="absolute left-[705px] top-[1015px] whitespace-pre-line text-[14px] font-medium leading-[24px] text-black">
        {"D- 601\nAnjara Apartments\nSector 78 , Noida"}
      </p>
      <div className="absolute left-[813px] top-[940px] flex h-[31px] w-[114px] items-center gap-[3px] rounded-[18px] bg-white pl-[6px] shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
        <span className="h-[17px] w-[17px] rounded-full bg-gradient-to-br from-[#F5C4A0] to-[#C88B6A]" />
        <span className="text-[12.4px] font-normal text-black/90">Leena Sharma</span>
      </div>
    </>
  );
}
