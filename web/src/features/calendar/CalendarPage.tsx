import { useState } from "react";
import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import {
  ArrowLeft,
  ChevronDown,
  Sparkles,
  Calendar,
  Plus,
  Instagram,
  Star,
  Music,
  TrendingUp,
  Hash,
  ArrowUp,
  MoreVertical,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCalendar } from "@/api/hooks";

/**
 * Super Admin — Manage Calendar (my creator).
 * Exact reconstruction of Figma frame 5063:61409, 1440×1024.
 * Built CLEAN: the captured profile-dropdown popup + dim scrim are omitted.
 */

const WEEKDAYS: { label: string; color?: string; x: number; w: number }[] = [
  { label: "Mon", x: 313, w: 33 },
  { label: "Tue", x: 417.2, w: 27 },
  { label: "Wed", x: 514.9, w: 35 },
  { label: "Thu", x: 619.1, w: 29 },
  { label: "Fri", x: 725.2, w: 20 },
  { label: "Sat", x: 823.8, w: 26, color: "#D85859" },
  { label: "Sun", x: 924.3, w: 28, color: "#D43131" },
];

const DATES = [22, 23, 24, 25, 26, 27, 28];

const CAPTION = "Discovering hidden gems in Ubud's rice paddies. 🌿💚";

/* fixed layout slots (coords + tint) for the clipped content-card column */
const CARD_SLOTS: { left: number; top: number; tint: string }[] = [
  { left: 8, top: 316, tint: "#F5EEFB" },
  { left: 295, top: 315, tint: "#EEFBEF" },
  { left: 582, top: 315, tint: "#FBEEEE" },
];

/* --------------------------------- bits -------------------------------- */
function GreenBubble({ icon: Icon }: { icon: LucideIcon }) {
  return (
    <span className="flex h-[24px] w-[24px] shrink-0 items-center justify-center rounded-full bg-[#DDFFCA]">
      <Icon className="h-[14px] w-[14px] text-black" strokeWidth={1.6} />
    </span>
  );
}

function Toggle({ left, top }: { left: number; top: number }) {
  const [on, setOn] = useState(false);
  return (
    <span
      onClick={() => setOn((v) => !v)}
      className="absolute h-[28px] w-[64px] rounded-full bg-[rgba(120,120,120,0.2)] cursor-pointer"
      style={{ left, top }}
    >
      <span
        className={`absolute ${on ? "left-[23px]" : "left-[2px]"} top-[2px] h-[24px] w-[39px] rounded-full bg-white shadow-[0_1px_2px_rgba(0,0,0,0.14)]`}
      />
    </span>
  );
}

function DateChip({ children }: { children: ReactNode }) {
  return (
    <span className="flex h-[25px] w-[55px] shrink-0 items-center justify-center rounded-[14px] bg-white font-inter text-[10.2px] text-black shadow-[0_1px_2px_rgba(0,0,0,0.08)]">
      {children}
    </span>
  );
}

/* ----------------------------- content card ---------------------------- */
function ContentCard({ left, top, tint, day }: { left: number; top: number; tint: string; day: string }) {
  return (
    <div className="absolute rounded-[9.94px]" style={{ left, top, width: 275, height: 838, background: tint }}>
      {/* add button */}
      <span className="absolute left-[233px] top-[10px] flex h-[32.4px] w-[32.4px] items-center justify-center rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,0.10)]">
        <Plus className="h-[16px] w-[16px] text-black" strokeWidth={1.6} />
      </span>

      {/* header */}
      <div className="absolute left-[9.5px] top-[17.9px] flex items-center gap-[10px]">
        <span className="flex h-[16px] w-[16px] items-center justify-center rounded-[4px] bg-gradient-to-br from-[#FEDA75] via-[#D62976] to-[#4F5BD5]">
          <Instagram className="h-[10px] w-[10px] text-white" strokeWidth={2} />
        </span>
        <span className="font-inter text-[10px] text-[#1A1A1B]">{day}</span>
      </div>

      {/* photo */}
      <div className="absolute left-[9px] top-[54px] h-[132px] w-[256px] rounded-[8px] bg-gradient-to-b from-[#A7D8EF] via-[#7FB5CF] to-[#4A7A52]" />

      {/* caption */}
      <p className="absolute left-[9.4px] top-[191.2px] w-[246px] font-inter text-[14px] font-semibold leading-[23.2px] text-[#111827]">
        {CAPTION}
      </p>

      {/* chips */}
      <div className="absolute left-[9px] top-[246px] flex h-[33px] w-[130px] items-center gap-[5px] rounded-[12px] bg-white pl-[6px]">
        <GreenBubble icon={Star} />
        <span className="font-inter text-[11px] text-black">Avg Views: 100K</span>
      </div>
      <div className="absolute left-[147.4px] top-[246px] flex h-[33px] w-[119px] items-center gap-[5px] rounded-[12px] bg-white pl-[6px]">
        <GreenBubble icon={Music} />
        <span className="font-inter text-[11px] text-black">Big Dawgs</span>
      </div>

      <div className="absolute left-[9px] top-[284px] flex h-[33px] w-[122px] items-center gap-[6px] rounded-[12px] bg-white pl-[6px]">
        <span className="flex">
          <span className="h-[14px] w-[14px] rounded-full bg-gradient-to-br from-[#FFD6E7] to-[#C8B3ED] ring-1 ring-white" />
          <span className="-ml-[4px] h-[14px] w-[14px] rounded-full bg-gradient-to-br from-[#C8E6FF] to-[#C8B3ED] ring-1 ring-white" />
          <span className="-ml-[4px] h-[14px] w-[14px] rounded-full bg-gradient-to-br from-[#F1FFC3] to-[#8DBE7F] ring-1 ring-white" />
        </span>
        <span className="font-inter text-[11px] text-black">1.5K+&nbsp;&nbsp;ER: 4%</span>
      </div>
      <div className="absolute left-[139.4px] top-[284px] flex h-[33px] w-[127px] items-center gap-[6px] rounded-[12px] bg-white pl-[7px]">
        <GreenBubble icon={TrendingUp} />
        <span className="font-inter text-[11px] text-black">Trendy&nbsp;&nbsp;29 Dec</span>
      </div>

      <div className="absolute left-[9px] top-[322px] flex h-[36px] w-[257.4px] items-center gap-[5px] rounded-[12px] bg-white pl-[6px]">
        <GreenBubble icon={Hash} />
        <span className="font-inter text-[11px] text-black">#UbudAdventures #RicePaddyViews</span>
      </div>

      {/* AI-generated card */}
      <div className="absolute left-[9px] top-[374px] h-[209px] w-[255px] rounded-[8px] bg-white px-[9px] pt-[9px]">
        <p className="bg-gradient-to-r from-[#983EE1] to-[#E561B4] bg-clip-text font-inter text-[14px] font-medium leading-[24px] text-transparent">
          AI-generated: Holidays in Bali
        </p>
        <p className="mt-[2px] font-inter text-[12px] font-medium leading-[20px] text-[#121417]">{CAPTION}</p>
        <p className="mt-[8px] font-inter text-[12px] leading-[17px] text-[#6B7582]">
          Wandering through the lush green terraces, I stumbled upon a serene spot perfect for meditation.
          #UbudAdventures #RicePaddyViews #BaliBliss
        </p>
      </div>
    </div>
  );
}

/* -------------------------------- page --------------------------------- */
export default function CalendarPage() {
  const navigate = useNavigate();
  const { data } = useCalendar();
  const cards = (data ?? []).slice(0, CARD_SLOTS.length).map((item, i) => ({
    id: item.id,
    left: CARD_SLOTS[i].left,
    top: CARD_SLOTS[i].top,
    tint: CARD_SLOTS[i].tint,
    day: `${new Date(item.scheduledAt).toLocaleDateString("en-US", { weekday: "short" })} | ${item.title}`,
  }));

  return (
    <>
      {/* back button */}
      <span
        onClick={() => navigate(-1)}
        className="absolute left-[235px] top-[153px] flex h-[45px] w-[45px] items-center justify-center rounded-full bg-black cursor-pointer"
      >
        <ArrowLeft className="h-[19px] w-[19px] text-white" strokeWidth={2} />
      </span>

      {/* title */}
      <h1 className="absolute left-[261px] top-[232px] text-[34px] font-normal leading-[42.8px] text-black">Manage Calenar</h1>
      <span className="absolute left-[261px] top-[280px] h-[1.5px] w-[258px] bg-black/45" />

      {/* All Platforms dropdown */}
      <div
        onClick={() => navigate("/calendar/all")}
        className="absolute left-[609px] top-[246px] flex h-[45px] w-[170px] items-center justify-between rounded-[28px] bg-black/90 pl-[12px] pr-[10px] cursor-pointer"
      >
        <span className="text-[20px] font-light text-white/[0.99]">All Platforms</span>
        <ChevronDown className="h-[18px] w-[18px] text-white" strokeWidth={2} />
      </div>

      {/* October month picker */}
      <div className="absolute left-[279px] top-[325px] flex h-[45px] w-[108px] items-center justify-between rounded-[28px] bg-white/90 pl-[14px] pr-[12px]">
        <span className="text-[14px] font-light text-black/[0.99]">October</span>
        <ChevronDown className="h-[15px] w-[15px] text-black" strokeWidth={2} />
      </div>

      {/* Leena Sharma pill */}
      <div
        onClick={() => navigate("/creators/detail")}
        className="absolute left-[847px] top-[328px] flex h-[39px] w-[140px] items-center gap-[4px] rounded-[21px] bg-white pl-[7px] cursor-pointer"
      >
        <span className="h-[20px] w-[20px] shrink-0 rounded-full bg-gradient-to-br from-[#FFD6E7] to-[#C8B3ED]" />
        <span className="text-[14.6px] font-normal text-black/90">Leena Sharma</span>
      </div>

      {/* weekday headers */}
      {WEEKDAYS.map((d) => (
        <span
          key={d.label}
          className="absolute top-[388px] text-[16.9px] font-light leading-[22.5px]"
          style={{ left: d.x, width: d.w, color: d.color ?? "#000000" }}
        >
          {d.label}
        </span>
      ))}

      {/* date cells */}
      {DATES.map((n, i) => (
        <div
          key={n}
          className="absolute top-[422px] h-[129.6px] w-[93.9px] rounded-[16.9px] bg-white"
          style={{ left: 279 + i * 101.44 }}
        >
          <span className="absolute left-[14px] top-[15px] text-[18.8px] font-normal leading-[22.5px] text-black">{n}</span>
        </div>
      ))}

      {/* Generate more ideas */}
      <div className="absolute left-[278px] top-[566.2px] flex h-[48px] w-[247px] items-center gap-[4px] rounded-[24px] bg-[#FFFEFE] pl-[16px] shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
        <Sparkles className="h-[18px] w-[18px] text-[#603CFF]" strokeWidth={1.6} />
        <span className="ml-[4px] text-[20px] font-light text-black">Generate more ideas</span>
      </div>

      {/* Schedule Content */}
      <div className="absolute left-[813px] top-[572px] flex h-[37px] w-[175px] items-center gap-[6px] rounded-[24px] bg-[#FFFEFE] pl-[10px] shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
        <span className="flex h-[24px] w-[24px] items-center justify-center rounded-full bg-white shadow-[0_1px_2px_rgba(0,0,0,0.10)]">
          <Calendar className="h-[12px] w-[12px] text-black" strokeWidth={1.6} />
        </span>
        <span className="text-[16px] font-light text-black">Schedule Content</span>
      </div>

      {/* clipped column of content cards */}
      <div className="absolute left-[271px] top-[315px] h-[1222px] w-[739px] overflow-hidden rounded-[10.5px]">
        {cards.map((c) => (
          <ContentCard key={c.id} left={c.left} top={c.top} tint={c.tint} day={c.day} />
        ))}
      </div>

      {/* ============================ right panel ============================ */}
      <div className="absolute left-[1020px] top-[257px] h-[957px] w-[331px] rounded-[12px] bg-white/50" />

      {/* collapse handle */}
      <span className="absolute left-[1321px] top-[257px] flex h-[28px] w-[28px] items-center justify-center rounded-[16px] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.10)]">
        <ArrowUp className="h-[13px] w-[13px] text-black" strokeWidth={2} />
      </span>

      <span className="absolute left-[1031px] top-[266px] text-[15px] font-normal text-black">Generate Content</span>

      {/* generate card */}
      <div className="absolute left-[1031px] top-[296px] h-[537px] w-[312px] rounded-[12px] bg-white shadow-[0_2px_12px_rgba(0,0,0,0.05)]" />
      <span className="absolute left-[1040px] top-[311px]">
        <DateChip>29 July</DateChip>
      </span>
      <span className="absolute left-[1040px] top-[343px] text-[12px] font-normal text-black">Title</span>
      <span className="absolute left-[1040px] top-[369px] text-[12px] font-normal text-black/60">write description</span>

      {/* AI input bar */}
      <div className="absolute left-[1040px] top-[697px] h-[34px] w-[217px] rounded-[20px] bg-[#FAFAFA]" />
      <span className="absolute left-[1046px] top-[702px] flex h-[24px] w-[24px] items-center justify-center rounded-full bg-gradient-to-br from-[#FBFBFF] to-[#CACAFF]">
        <Sparkles className="h-[14px] w-[14px] text-[#603CFF]" strokeWidth={1.6} />
      </span>
      <span className="absolute left-[1079px] top-[706px] text-[10px] font-light leading-[16px] text-black">Type anything to ask AI</span>
      <span className="absolute left-[1202px] top-[702px] flex h-[24px] w-[24px] items-center justify-center rounded-full bg-gradient-to-br from-[#FBFBFF] to-[#CACAFF]">
        <ArrowUp className="h-[13px] w-[13px] text-black" strokeWidth={2} />
      </span>
      <span className="absolute left-[1228px] top-[702px] flex h-[24px] w-[24px] items-center justify-center rounded-full bg-white shadow-[0_1px_2px_rgba(0,0,0,0.10)]">
        <Calendar className="h-[12px] w-[12px] text-black" strokeWidth={1.6} />
      </span>
      <span className="absolute left-[1265px] top-[699px] flex h-[30px] w-[62px] items-center justify-center rounded-[18px] bg-black text-[12px] font-normal text-white">Add</span>

      {/* toggle rows */}
      <div className="absolute left-[1040px] top-[742px] h-[35px] w-[287px] rounded-[24px] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.05)]" />
      <span className="absolute left-[1047px] top-[750px] text-[15px] font-light text-black">Brand Collab</span>
      <Toggle left={1259} top={746} />

      <div className="absolute left-[1040px] top-[785px] h-[35px] w-[287px] rounded-[24px] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.05)]" />
      <span className="absolute left-[1045px] top-[794px] text-[15px] font-light text-black">Shift Existing Content +1 Day</span>
      <Toggle left={1259} top={789} />

      {/* ============================== notes ============================== */}
      <span className="absolute left-[1031px] top-[844px] text-[15px] font-normal text-black">Notes</span>
      <span className="absolute left-[1031px] top-[874px] text-[12px] font-normal text-black/70">Today</span>
      <span className="absolute left-[1072px] top-[883px] h-px w-[92px] bg-black/10" />

      {/* note card — today */}
      <div className="absolute left-[1031px] top-[908px] h-[97px] w-[312px] rounded-[20px] bg-[rgba(200,222,208,0.42)]" />
      <span className="absolute left-[1044px] top-[921px]">
        <DateChip>29 July</DateChip>
      </span>
      <span className="absolute left-[1110px] top-[924px] text-[15px] font-medium text-black">Instagram Post Idea</span>
      <span className="absolute left-[1301px] top-[921px] flex h-[25px] w-[26px] items-center justify-center rounded-full bg-white">
        <MoreVertical className="h-[16px] w-[16px] text-black" strokeWidth={2} />
      </span>
      <p className="absolute left-[1044px] top-[953px] w-[283px] text-[13px] font-normal leading-[20px] text-black">
        Instagram Post: "Behind the Scenes of Our Latest Campaign".
      </p>

      {/* note card — yesterday */}
      <span className="absolute left-[1031px] top-[1019px] text-[12px] font-normal text-black/70">Yesterday</span>
      <span className="absolute left-[1096px] top-[1028px] h-px w-[92px] bg-black/10" />
      <div className="absolute left-[1031px] top-[1052px] h-[97px] w-[312px] rounded-[24px] bg-[#D7DBF3]" />
      <span className="absolute left-[1044px] top-[1065px]">
        <DateChip>28 July</DateChip>
      </span>
      <span className="absolute left-[1110px] top-[1068px] text-[15px] font-medium text-black">Reel Idea</span>
      <span className="absolute left-[1301px] top-[1065px] flex h-[25px] w-[26px] items-center justify-center rounded-full bg-white">
        <MoreVertical className="h-[16px] w-[16px] text-black" strokeWidth={2} />
      </span>
      <p className="absolute left-[1044px] top-[1097px] w-[283px] text-[13px] font-normal leading-[20px] text-black">
        Reels ideas on healthcare, and 1 post on healthcare products.
      </p>
    </>
  );
}
