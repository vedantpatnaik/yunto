import { Fragment, useMemo, useState } from "react";
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
import { useNavigate, useSearchParams } from "react-router-dom";
import whatsapp from "@/assets/icons/whatsapp.svg";
import {
  useCalendar,
  useCampaignFull,
  useCampaigns,
  useContracts,
  useCreate,
  useCreators,
  type CalendarItem,
} from "@/api/hooks";

const compact = (n: number) =>
  n >= 1_000_000
    ? `${(n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1)} M`
    : n >= 1_000
      ? `${Math.round(n / 1_000)}k`
      : `${n}`;
const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;
const dayOf = (s: string) => `${new Date(s).getDate()}`;
const weekdayOf = (s: string) => new Date(s).toLocaleDateString("en-IN", { weekday: "short" });
const timeOf = (s: string) =>
  new Date(s).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true }).toLowerCase();
const dateLong = (s: string) =>
  new Date(s).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
/** Deliverable format derived from the calendar item's own title ("Beauty Reel — Nykaa" -> "Reel"). */
const contentKind = (title: string) => {
  const m = /reel|story|post/i.exec(title);
  return m ? m[0][0].toUpperCase() + m[0].slice(1).toLowerCase() : "Content";
};
/** CampaignStatus enum -> the label shown in the status dropdown. */
const STATUS_LABEL: Record<string, string> = {
  DRAFT: "Draft",
  ACTIVE: "Waiting for shoot",
  DONE: "Completed",
};

/** Fixed Figma geometry for the four Activity rows — coordinates/palette stay literal. */
const ACTIVITY_ROWS = [
  { dayY: 300, lineX: 1066, evY: 325, bg: "#D8DDFF" },
  { dayY: 387, lineX: 1047, evY: 416, bg: "#EFEFF0" },
  { dayY: 478, lineX: 1047, evY: 507, bg: "#EFEFF0" },
  { dayY: 569, lineX: 1047, evY: 598, bg: "#EFEFF0" },
];

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
  const [sp] = useSearchParams();
  const [link, setLink] = useState("");

  const { data: campaigns = [] } = useCampaigns();
  const campaign = campaigns.find((c) => c.id === sp.get("id")) ?? campaigns[0];
  const { data: full } = useCampaignFull(campaign?.id ?? null);
  const { data: calendar = [], isLoading: calendarLoading } = useCalendar();
  const { data: contracts = [] } = useContracts();
  const { data: creators = [] } = useCreators();
  const addLink = useCreate<CalendarItem>("calendar");

  const creator = full?.creatorList[0];
  /* full Creator row (creatorList is a slim projection without niche) */
  const creatorRecord = creators.find((c) => c.id === creator?.id);
  /* second creator on the campaign = the add-on person shown in the Addons card */
  const helper = full?.creatorList[1];

  const events = useMemo(
    () =>
      calendar
        .filter((e) => e.creatorId === creator?.id)
        .sort((a, b) => +new Date(a.scheduledAt) - +new Date(b.scheduledAt)),
    [calendar, creator?.id],
  );
  const shootDate = events[0]?.scheduledAt;
  const deliverDate = events.length > 1 ? events[events.length - 1].scheduledAt : undefined;
  const [d0, d1] = events;

  /* add-on line items = contracts attached to this campaign */
  const addOns = contracts.filter((c) => c.campaignId === campaign?.id);
  const addOnPrice = (i: number) => {
    const amount = addOns[i]?.amount;
    return amount == null ? "" : inr(amount);
  };

  const budget = full?.invoice?.budget ?? campaign?.budget ?? 0;
  const payout = full?.invoice?.payout ?? 0;
  const gst = Math.round(payout * 0.18);
  /* no per-deliverable amount exists in the schema — split the creator payout across them */
  const perDeliverable = events.length ? Math.round(payout / events.length) : 0;

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
        {campaign?.name ?? ""}
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
        <span className="text-[12px] font-light text-[#121212]">{creatorRecord?.niche ?? ""}</span>
      </TinyPill>
      <TinyPill left={360} top={325} width={72}>
        <span className="text-[12px] font-light text-[#121212]">{campaign?.brandName ?? ""}</span>
      </TinyPill>
      <TinyPill left={440} top={325} width={58}>
        <span className="flex items-center gap-[2px] text-[10.2px] font-normal text-black">
          <span className="text-[10px]">📍</span>{creator?.location ?? ""}
        </span>
      </TinyPill>

      {/* status dropdown */}
      <div className="absolute left-[748px] top-[321px] flex h-[45px] w-[185px] items-center rounded-[24px] bg-white pl-[9px] pr-[10px]">
        <Contrast className="h-[24px] w-[24px] text-[#79B282]" strokeWidth={1.6} />
        <span className="ml-[3px] text-[14px] font-light text-black">
          {campaign ? (STATUS_LABEL[campaign.status] ?? campaign.status) : ""}
        </span>
        <ChevronDown className="ml-auto h-[16px] w-[16px] text-black" strokeWidth={1.8} />
      </div>

      {/* creator avatar + fire badge */}
      <span className="absolute left-[284px] top-[388px] h-[45px] w-[45px] rounded-full bg-gradient-to-br from-[#F5C4A0] to-[#C88B6A]" />
      <span className="absolute left-[318px] top-[413px] text-[15px] leading-none">🔥</span>
      <div className="absolute left-[341px] top-[389px] leading-none">
        <div className="text-[17.4px] font-normal leading-[21.6px] text-black/90">{creator?.name ?? ""}</div>
        <div className="text-[11.6px] font-normal leading-[18.8px] text-black/70">{creator?.handle ?? ""}</div>
      </div>

      {/* whatsapp + call */}
      <img src={whatsapp} alt="WhatsApp" className="absolute left-[860px] top-[396px] h-[28px] w-[28px]" />
      <span className="absolute left-[897px] top-[396px] flex h-[28px] w-[28px] items-center justify-center rounded-full bg-white shadow-[0_1px_4px_rgba(0,0,0,0.12)]">
        <Phone className="h-[15px] w-[15px] text-black" strokeWidth={1.5} />
      </span>

      {/* stats card */}
      <div className="absolute left-[299px] top-[451px] h-[115px] w-[640px] rounded-[24px] bg-white" />
      <StatItem x={338} icon={Users} color="#4880D4" value={creator ? compact(creator.followers) : ""} label="Followers" />
      <StatItem x={499} icon={Eye} color="#2CC37F" value={creator ? `${creator.engagementRate.toFixed(1)} %` : ""} label="Engagement Rate" />
      <StatItem x={660} icon={Star} color="#FDD835" value={creator ? `${creator.stars.toFixed(1)} Stars` : ""} label="Rating" />
      <StatItem x={821} icon={Heart} color="#EE6C9A" value={creator ? compact(creator.avgViews) : ""} label="Avg. Views" />

      {/* ============================ ACTIVITY PANEL ======================= */}
      <div className="absolute left-[988px] top-[253px] h-[441px] w-[298px] rounded-[12px] bg-white/60" />
      <span className="absolute left-[998px] top-[261px] text-[14px] font-normal text-black">Activity</span>
      <ExpandBtn left={1258} top={253} onClick={() => navigate("/calendar")} />
      <div className="absolute left-[998px] top-[294px] h-[377px] w-[277px] rounded-[12px] bg-white" />

      {events.slice(0, ACTIVITY_ROWS.length).map((e, i) => (
        <Fragment key={e.id}>
          <DayLabel y={ACTIVITY_ROWS[i].dayY} lineX={ACTIVITY_ROWS[i].lineX} label={`Day ${i + 1}`} />
          <EventRow
            y={ACTIVITY_ROWS[i].evY}
            dayNum={dayOf(e.scheduledAt)}
            dayName={weekdayOf(e.scheduledAt)}
            dateBg={ACTIVITY_ROWS[i].bg}
            title={e.title}
            time={timeOf(e.scheduledAt)}
          />
        </Fragment>
      ))}
      {events.length === 0 && (
        <span className="absolute left-[1010px] top-[306px] text-[12px] font-normal leading-none text-black/40">
          {calendarLoading ? "Loading…" : "No activity yet"}
        </span>
      )}

      {/* ============================ ADD-ONS PANEL ======================= */}
      <div className="absolute left-[988px] top-[701px] h-[506px] w-[298px] rounded-[12px] bg-white/60" />
      <span className="absolute left-[998px] top-[714px] text-[14px] font-normal text-black">Add -Ons</span>
      <ExpandBtn left={1262} top={703} onClick={() => navigate("/creators/add-ons")} />
      <div className="absolute left-[998px] top-[745px] h-[452px] w-[275px] rounded-[12px] bg-white" />

      {addOns.slice(0, 2).map((c, i) => (
        <AddOnItem
          key={c.id}
          y={757 + i * 72}
          icon={i === 0 ? Video : ImageIcon}
          title={c.title}
          sub={c.status}
          price={addOnPrice(i)}
        />
      ))}
      {addOns.length === 0 && (
        <span className="absolute left-[1017px] top-[767px] text-[12px] font-normal leading-none text-black/40">
          No add-ons yet
        </span>
      )}

      {/* deliverables ticket */}
      <div
        className="absolute rounded-[10px] border border-dashed border-black/25"
        style={{ left: 1007, top: 908, width: 254, height: 60 }}
      >
        <span className="absolute left-1/2 top-[-7px] -translate-x-1/2 bg-white px-[4px] font-mono text-[9px] font-medium tracking-wide text-black">
          Deliverables
        </span>
        {d0 && (
          <>
            <span className="absolute left-[14px] top-[15px] text-[12px] font-normal text-black">
              {contentKind(d0.title)}
            </span>
            <span className="absolute right-[8px] top-[11px] flex items-start gap-[2px]">
              <span className="text-[12px] font-medium text-black/50">{inr(perDeliverable)}</span>
              <span className="mt-[1px] text-[5px] font-medium text-black/50">(tax inc.)</span>
            </span>
          </>
        )}
        {d1 && (
          <>
            <span className="absolute left-[14px] top-[36px] text-[12px] font-normal text-black">
              {contentKind(d1.title)}
            </span>
            <span className="absolute right-[8px] top-[32px] flex items-start gap-[2px]">
              <span className="text-[12px] font-medium text-black/50">{inr(perDeliverable)}</span>
              <span className="mt-[1px] text-[5px] font-medium text-black/50">(tax inc.)</span>
            </span>
          </>
        )}
      </div>

      {/* budget breakdown */}
      <BudgetRow y={982} label="Brand Budget" price={inr(budget)} bold />
      <BudgetRow y={1010} label={creator?.name ?? ""} price={inr(payout)} red />
      {addOns.slice(0, 2).map((c, i) => (
        <BudgetRow key={c.id} y={1038 + i * 28} label={c.title} price={addOnPrice(i)} red />
      ))}
      <BudgetRow y={1094} label="Creator&rsquo;s GST (18%)" price={inr(gst)} red tax={false} />

      {/* ============================ ADDONS SECTION ====================== */}
      <h2 className="absolute left-[278px] top-[616px] text-[24px] font-normal leading-none text-slate900">
        Addons
      </h2>

      {/* Seema card */}
      <div className="absolute left-[278px] top-[664px] h-[190px] w-[266px] rounded-[12px] bg-[#F5F5F5]" />
      <span className="absolute left-[286px] top-[670px] h-[38px] w-[38px] rounded-full bg-gradient-to-br from-[#C8E6FF] to-[#C8B3ED]" />
      <div className="absolute left-[329px] top-[674px] leading-none">
        <div className="text-[12px] font-normal leading-[15px] text-black/90">{helper?.name ?? ""}</div>
        <div className="text-[8px] font-normal leading-[13px] text-black/70">{helper?.handle ?? ""}</div>
      </div>
      <span className="absolute left-[476px] top-[672px] flex h-[22px] w-[22px] items-center justify-center rounded-full bg-white">
        <Phone className="h-[13px] w-[13px] text-black" strokeWidth={1.5} />
      </span>
      <ExpandBtn left={512} top={663} onClick={() => navigate("/creators/detail")} />
      {/* Service */}
      <span className="absolute left-[297px] top-[716px] text-[9.3px] font-normal text-black/90">Service</span>
      <div className="absolute left-[288px] top-[734px] flex h-[48px] w-[224px] items-center gap-[4px] rounded-[12px] bg-white pl-[8px]">
        <span className="h-[36px] w-[28px] rounded-[6px] bg-[#C4C4C4]" />
        <span className="text-[10.2px] font-normal text-black/90">{addOns[0]?.title ?? ""}</span>
      </div>
      {/* Shoot Date */}
      <span className="absolute left-[288px] top-[791px] text-[9.3px] font-normal text-black/90">Shoot Date</span>
      <div className="absolute left-[288px] top-[809px] flex h-[32px] w-[117px] items-center gap-[7px] rounded-[18px] bg-white pl-[3px]">
        <span className="flex h-[24px] w-[24px] items-center justify-center rounded-full bg-[#F1F1F1]">
          <Calendar className="h-[13px] w-[13px] text-black" strokeWidth={1.6} />
        </span>
        <span className="text-[12px] font-light text-black/90">{shootDate ? dateLong(shootDate) : ""}</span>
      </div>
      {/* Deliver Date */}
      <span className="absolute left-[417px] top-[791px] text-[9.3px] font-normal text-black/90">Deliver Date</span>
      <div className="absolute left-[417px] top-[809px] flex h-[32px] w-[117px] items-center gap-[7px] rounded-[18px] bg-white pl-[3px]">
        <span className="flex h-[24px] w-[24px] items-center justify-center rounded-full bg-[#F1F1F1]">
          <Calendar className="h-[13px] w-[13px] text-black" strokeWidth={1.6} />
        </span>
        <span className="text-[12px] font-light text-black/90">{deliverDate ? dateLong(deliverDate) : ""}</span>
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
        <input
          value={link}
          onChange={(e) => setLink(e.target.value)}
          placeholder="Add your link"
          className="min-w-0 flex-1 bg-transparent text-[10.2px] font-light text-black/70 outline-none placeholder:text-black/70"
        />
        <span className="ml-auto flex h-[23px] w-[23px] items-center justify-center rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,0.12)]">
          <Plus className="h-[13px] w-[13px] text-black" strokeWidth={1.8} />
        </span>
        <span
          onClick={() => {
            if (!link.trim() || !creator) return;
            addLink.mutate({
              creatorId: creator.id,
              title: link.trim(),
              scheduledAt: new Date().toISOString(),
              status: "submitted",
            });
            setLink("");
          }}
          className="ml-[4px] flex h-[23px] w-[52px] cursor-pointer items-center justify-center rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,0.10)] text-[9.2px] font-light text-[#121212]"
        >
          Submit
        </span>
      </div>

      {/* deliverable row 1 */}
      {d0 && (
        <>
          <div className="absolute left-[294px] top-[1023px] flex h-[48px] w-[289px] items-center rounded-[12px] border border-black/[0.06] bg-white pl-[6px] pr-[8px]">
            <span className="h-[36px] w-[28px] rounded-[6px] bg-[#C4C4C4]" />
            <span className="ml-[4px] text-[10.2px] font-normal text-black/90">{d0.title}</span>
            <span className="ml-auto flex h-[23px] w-[52px] items-center justify-center rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,0.10)] text-[9.2px] font-light text-[#121212]">
              {contentKind(d0.title)}
            </span>
            <span className="ml-[8px] flex h-[23px] w-[23px] items-center justify-center rounded-full bg-black">
              <LinkIcon className="h-[11px] w-[11px] text-white" strokeWidth={2} />
            </span>
          </div>
          <span
            className={`absolute left-[596px] top-[1038px] flex h-[18px] w-[52px] items-center justify-center rounded-[9px] bg-white text-[7.6px] font-normal shadow-[0_1px_3px_rgba(0,0,0,0.08)] ${d0.status === "approved" ? "text-[#00C16A]" : "text-[#62748E]"}`}
          >
            {d0.status === "approved" ? "Approved" : "Disapprove"}
          </span>
        </>
      )}

      {/* deliverable row 2 */}
      {d1 && (
        <>
          <div className="absolute left-[294px] top-[1081px] flex h-[48px] w-[289px] items-center rounded-[12px] border border-black/[0.06] bg-white pl-[6px] pr-[8px]">
            <span className="h-[36px] w-[28px] rounded-[6px] bg-[#C4C4C4]" />
            <span className="ml-[4px] text-[10.2px] font-normal text-black/90">{d1.title}</span>
            <span className="ml-auto flex h-[23px] w-[52px] items-center justify-center rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,0.10)] text-[9.2px] font-light text-[#121212]">
              {contentKind(d1.title)}
            </span>
            <span className="ml-[8px] flex h-[23px] w-[23px] items-center justify-center rounded-full bg-black">
              <LinkIcon className="h-[11px] w-[11px] text-white" strokeWidth={2} />
            </span>
          </div>
          <span
            className={`absolute left-[596px] top-[1090px] flex h-[18px] w-[52px] items-center justify-center rounded-[9px] bg-white text-[7.6px] font-normal shadow-[0_1px_3px_rgba(0,0,0,0.08)] ${d1.status === "approved" ? "text-[#00C16A]" : "text-[#62748E]"}`}
          >
            {d1.status === "approved" ? "Approved" : "Disapprove"}
          </span>
          {d1.status !== "approved" && (
            <span className="absolute left-[590px] top-[1111px] flex items-center gap-[2px]">
              <Info className="h-[11px] w-[11px] text-black/70" strokeWidth={1.6} />
              <span className="text-[7.4px] font-light text-black/70">{d1.status}</span>
            </span>
          )}
        </>
      )}
      {events.length === 0 && (
        <span className="absolute left-[294px] top-[1030px] text-[10.2px] font-light leading-none text-black/40">
          {calendarLoading ? "Loading…" : "No deliverables submitted yet"}
        </span>
      )}

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
        {creatorRecord?.location ?? creator?.location ?? ""}
      </p>
      <div className="absolute left-[813px] top-[940px] flex h-[31px] w-[114px] items-center gap-[3px] rounded-[18px] bg-white pl-[6px] shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
        <span className="h-[17px] w-[17px] rounded-full bg-gradient-to-br from-[#F5C4A0] to-[#C88B6A]" />
        <span className="text-[12.4px] font-normal text-black/90">{creator?.name ?? ""}</span>
      </div>
    </>
  );
}
