import type { CSSProperties, ReactNode } from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCreate } from "@/api/hooks";
import {
  Hash,
  ChevronDown,
  ChevronRight,
  Plus,
  Video,
  CheckSquare,
  FileText,
  Link2,
  AtSign,
  Smile,
  Paperclip,
  BarChart2,
  Search,
  X,
  Sparkles,
} from "lucide-react";

/**
 * Super Admin — Team / Create a Channel (chat).
 * Exact reconstruction of Figma frame 4744:8151 ("Super Admin-Team/create a channel"), 1440×1024.
 * CLEAN build: the full-canvas dim scrim (node 4744:8529, rgba(0,0,0,0.5)) is omitted — the
 * "Create a Channel" modal (4815:10729) floats at FULL opacity over the underlying chat page.
 * TopBar (logo + right buttons) and the left icon rail live in AppShell and are NOT rendered here.
 */

const WHITE70 = "rgba(255,255,255,0.7)";
const WHITE50 = "rgba(255,255,255,0.5)";

/* ------------------------------ primitive ------------------------------ */
function Abs({
  l,
  t,
  w,
  h,
  className,
  style,
  children,
  onClick,
}: {
  l: number;
  t: number;
  w?: number;
  h?: number;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
  onClick?: () => void;
}) {
  return (
    <div
      className={`absolute ${className ?? ""}`}
      style={{ left: l, top: t, width: w, height: h, ...style }}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

function LetterAvatar({
  l,
  t,
  size,
  letter,
  bg,
  color,
  font,
  ring,
}: {
  l: number;
  t: number;
  size: number;
  letter: string;
  bg: string;
  color: string;
  font: number;
  ring?: boolean;
}) {
  return (
    <Abs
      l={l}
      t={t}
      w={size}
      h={size}
      className="flex items-center justify-center rounded-full"
      style={{ background: bg, color, fontSize: font, boxShadow: ring ? "0 0 0 2px #fff" : undefined }}
    >
      {letter}
    </Abs>
  );
}

function StatusDot({ l, t }: { l: number; t: number }) {
  return (
    <>
      <Abs l={l - 1.4} t={t - 1.4} w={9.8} h={9.8} className="rounded-full" style={{ background: "#1B1B1B" }} />
      <Abs l={l} t={t} w={7} h={7} className="rounded-full" style={{ background: "#2EB67D" }} />
    </>
  );
}

/* ---------------------------- sidebar data ----------------------------- */
type Sec = { top: number; label: string; dir: "down" | "right"; caretL?: number; textL?: number };
const SECTIONS: Sec[] = [
  { top: 176, label: "Notifications", dir: "down" },
  { top: 260, label: "Groups", dir: "down" },
  { top: 600, label: "Campaigns", dir: "down" },
  { top: 628, label: "Vishal Sharma", dir: "down" },
  { top: 656, label: "Nike Diwali", dir: "down", caretL: 275, textL: 302 },
  { top: 768, label: "Ritika Verma", dir: "right" },
  { top: 796, label: "Neha", dir: "right" },
  { top: 824, label: "Ajay", dir: "right" },
];

type Ch = { top: number; label: string; active?: boolean; hashL?: number; textL?: number };
const CHANNELS: Ch[] = [
  { top: 204, label: "Agency announcements" },
  { top: 288, label: "Welcome" },
  { top: 316, label: "General", active: true },
  { top: 344, label: "marketing" },
  { top: 372, label: "operations" },
  { top: 400, label: "sales" },
  { top: 684, label: "Brand + Agencies", hashL: 275, textL: 301 },
  { top: 712, label: "Only Agencies", hashL: 274, textL: 300 },
];

type Add = { top: number; label: string; boxL?: number; textL?: number };
const ADDS: Add[] = [
  { top: 232, label: "Add channels" },
  { top: 428, label: "Add group" },
  { top: 572, label: "Add person" },
  { top: 740, label: "Add group", boxL: 272, textL: 300 },
];

/* ------------------------------ modal field ---------------------------- */
function Field({ l, t, label, value }: { l: number; t: number; label: string; value: string }) {
  return (
    <>
      <Abs l={l} t={t} className="text-[20px] font-normal leading-[39px] text-black">
        {label}
      </Abs>
      <Abs
        l={l}
        t={t + 37.5}
        w={333}
        h={45.6}
        className="flex items-center justify-between rounded-[12px] bg-[#FAFAFA] pl-[15px] pr-[16px]"
      >
        <span className="text-[16px] font-light text-black">{value}</span>
        <ChevronDown className="h-[16px] w-[16px] text-black" strokeWidth={2} />
      </Abs>
    </>
  );
}

function AgencyChip({
  l,
  label,
  bg,
  glyphColor,
  onRemove,
}: {
  l: number;
  label: string;
  bg: string;
  glyphColor: string;
  onRemove: () => void;
}) {
  return (
    <>
      <Abs l={l} t={452} w={170} h={40} className="rounded-[12px] bg-[#FAFAFA]" />
      <Abs l={l + 9.4} t={461.4} w={22} h={22} className="flex items-center justify-center rounded-full" style={{ background: bg }}>
        <Sparkles className="h-[11px] w-[11px]" style={{ color: glyphColor }} strokeWidth={2} />
      </Abs>
      <Abs l={l + 34.9} t={464} className="text-[14px] font-normal leading-[16px] text-black">
        {label}
      </Abs>
      <Abs onClick={onRemove} l={l + 139} t={460} w={24} h={24} className="flex items-center justify-center cursor-pointer">
        <X className="h-[13px] w-[13px]" style={{ color: "rgba(0,0,0,0.85)" }} strokeWidth={2.2} />
      </Abs>
    </>
  );
}

/* -------------------------------- page --------------------------------- */
export default function CreateChannelPage() {
  const navigate = useNavigate();
  const createChannel = useCreate("channels");
  const [name, setName] = useState("");
  const [globalChannel, setGlobalChannel] = useState(true);
  const handleCreate = async () => {
    await createChannel.mutateAsync({ name, kind: "TEAM" });
    navigate("/chat");
  };
  const [agencies, setAgencies] = useState([
    { id: "stellar", l: 379, label: "Stellar Talents", bg: "#1BA672", glyphColor: "#FFFFFF" },
    { id: "firefly", l: 569, label: "Firefly Creators", bg: "#111111", glyphColor: "#FFC94D" },
  ]);
  return (
    <>
      {/* ================= page background (frame 4744:8151 fill) ================= */}
      <Abs
        l={0}
        t={0}
        w={1440}
        h={1024}
        style={{
          background:
            "linear-gradient(135deg, #EAEAEA 0%, #EDF9FF 40%, rgba(201,218,227,0.9) 75%, #A4C5D9 100%)",
        }}
      />

      {/* ================= outer chat card ================= */}
      <Abs
        l={242}
        t={120}
        w={1118}
        h={883}
        className="rounded-[12px] bg-white"
        style={{ boxShadow: "0 10px 40px rgba(0,0,0,0.06)", outline: "1px solid #D9D9D9" }}
      />

      {/* ================= dark workspace sidebar ================= */}
      <Abs l={242} t={120} w={255} h={883} className="rounded-l-[12px]" style={{ background: "#1B1B1B" }} />

      {/* workspace header */}
      <Abs l={256} t={130} className="text-[18px] font-bold leading-[24px] text-white">
        Yunto
      </Abs>
      <Abs l={353} t={146} w={14} h={14}>
        <ChevronDown className="h-[14px] w-[14px]" style={{ color: WHITE70 }} strokeWidth={2.2} />
      </Abs>

      {/* section header rows */}
      {SECTIONS.map((s) => {
        const Caret = s.dir === "down" ? ChevronDown : ChevronRight;
        return (
          <div key={`sec-${s.top}`}>
            <Abs l={s.caretL ?? 254} t={s.top + 6} w={14} h={14}>
              <Caret className="h-[14px] w-[14px]" style={{ color: WHITE70 }} strokeWidth={2.2} />
            </Abs>
            <Abs l={s.textL ?? 281} t={s.top + 6.5} className="text-[15px] font-medium leading-[15px]" style={{ color: WHITE70 }}>
              {s.label}
            </Abs>
          </div>
        );
      })}

      {/* channel rows */}
      {CHANNELS.map((c) => {
        const color = c.active ? "#FFFFFF" : WHITE70;
        return (
          <div key={`ch-${c.top}`}>
            {c.active && (
              <Abs l={242} t={c.top} w={247} h={28} className="rounded-[6px]" style={{ background: "#656565" }} />
            )}
            <Abs l={c.hashL ?? 254} t={c.top + 5} w={16} h={16}>
              <Hash className="h-[16px] w-[16px]" style={{ color }} strokeWidth={1.7} />
            </Abs>
            <Abs l={c.textL ?? 280} t={c.top + 6.5} className="text-[15px] leading-[15px]" style={{ color }}>
              {c.label}
            </Abs>
          </div>
        );
      })}

      {/* add rows */}
      {ADDS.map((a) => (
        <div key={`add-${a.top}`}>
          <Abs
            l={a.boxL ?? 254}
            t={a.top + 4}
            w={20}
            h={20}
            className="flex items-center justify-center rounded-[4px]"
            style={{ background: "rgba(255,255,255,0.1)" }}
          >
            <Plus className="h-[12px] w-[12px]" style={{ color: WHITE70 }} strokeWidth={2} />
          </Abs>
          <Abs l={a.textL ?? 282} t={a.top + 6.5} className="text-[15px] leading-[15px]" style={{ color: WHITE70 }}>
            {a.label}
          </Abs>
        </div>
      ))}

      {/* ---- Direct messages header + badge ---- */}
      <Abs l={254} t={466} w={14} h={14}>
        <ChevronRight className="h-[14px] w-[14px]" style={{ color: WHITE70 }} strokeWidth={2.2} />
      </Abs>
      <Abs l={281} t={466.5} className="text-[15px] font-medium leading-[15px]" style={{ color: WHITE70 }}>
        Direct messages
      </Abs>
      <Abs l={457} t={462} w={24} h={24} className="flex items-center justify-center rounded-full" style={{ background: "#E64E4E" }}>
        <span className="text-[10.3px] font-medium text-white">120</span>
      </Abs>

      {/* ---- DM rows ---- */}
      {/* Dev Singh (you) */}
      <Abs l={254} t={491} w={20} h={20} className="rounded-full" style={{ background: "linear-gradient(135deg,#F4B0C4,#B58BE0)" }} />
      <StatusDot l={268} t={505.5} />
      <Abs l={283} t={494.5} className="text-[15px] leading-[15px]" style={{ color: WHITE70 }}>
        Dev Singh
      </Abs>
      <Abs l={358} t={494.5} className="text-[15px] leading-[15px]" style={{ color: WHITE50 }}>
        you
      </Abs>
      {/* Sanjay Sharma */}
      <LetterAvatar l={254} t={519.5} size={20} letter="S" bg="#FFF4AD" color="#B49C01" font={12} />
      <StatusDot l={268} t={533.5} />
      <Abs l={283} t={522.5} className="text-[15px] leading-[15px]" style={{ color: WHITE70 }}>
        Sanjay Sharma
      </Abs>
      {/* Pooja Singh */}
      <LetterAvatar l={254} t={547.5} size={20} letter="P" bg="#BCD4FD" color="#1155C8" font={12} />
      <StatusDot l={268} t={561.5} />
      <Abs l={283} t={550.5} className="text-[15px] leading-[15px]" style={{ color: WHITE70 }}>
        Pooja Singh
      </Abs>

      {/* ---- bottom user profile ---- */}
      <Abs l={254} t={948} w={38} h={38} className="rounded-full" style={{ background: "linear-gradient(135deg,#C8E6FF,#C8B3ED)" }} />
      <Abs l={297} t={952.5} className="text-[12px] leading-[15px] text-white">
        Dev
      </Abs>
      <Abs l={297} t={968.5} className="text-[8px] leading-[13px]" style={{ color: WHITE70 }}>
        @dev
      </Abs>

      {/* ================= message header ================= */}
      <Abs l={511} t={134.5} className="text-[16px] font-medium leading-[20px] text-[#1B1B1B]">
        #General
      </Abs>
      {/* member avatar stack (top-right of chat card) */}
      <Abs l={1254} t={132} w={25} h={25} className="rounded-full" style={{ background: "linear-gradient(135deg,#FFE1B0,#E58BB0)", boxShadow: "0 0 0 2px #fff" }} />
      <LetterAvatar l={1270.9} t={132} size={25} letter="S" bg="#FFF4AD" color="#B49C01" font={15} ring />
      <LetterAvatar l={1287.9} t={132} size={25} letter="P" bg="#BCD4FD" color="#1155C8" font={15} ring />
      <LetterAvatar l={1300.3} t={132} size={25} letter="R" bg="#EFBEFF" color="#8701B4" font={15} ring />
      <LetterAvatar l={1317} t={132} size={25} letter="+15" bg="#E5E5E5" color="#000000" font={8.3} ring />

      {/* dividers */}
      <Abs l={497} t={169} w={863} h={1} style={{ background: "#EDEDED" }} />
      <Abs l={497} t={199} w={863} h={1} style={{ background: "#EDEDED" }} />

      {/* ================= tab strip ================= */}
      <Abs l={513} t={177} w={17} h={14} className="flex items-center">
        <Video className="h-[13px] w-[16px] text-[#00897B]" strokeWidth={1.8} />
      </Abs>
      <Abs l={535} t={177} className="text-[12px] font-medium leading-[14px] text-[#2E2E2E]">
        Google Meet
      </Abs>
      <Abs l={626} t={176.5} w={15} h={15}>
        <CheckSquare className="h-[15px] w-[15px] text-[#3B6FE0]" strokeWidth={1.8} />
      </Abs>
      <Abs l={646} t={177} className="text-[12px] font-medium leading-[14px] text-[#2E2E2E]">
        To do
      </Abs>
      <Abs l={698} t={175} w={18} h={18}>
        <Plus className="h-[18px] w-[18px] text-[#8A8A8A]" strokeWidth={1.8} />
      </Abs>

      {/* ================= message 1 — Dev / 11:55 ================= */}
      <Abs l={511} t={238} w={32} h={32} className="rounded-full" style={{ background: "linear-gradient(135deg,#C8E6FF,#C8B3ED)" }} />
      <Abs l={551} t={238} className="text-[13px] font-extrabold leading-[16px] text-[#1B1B1B]">
        Dev
      </Abs>
      <Abs l={579} t={239.5} className="text-[11px] font-medium leading-[13px] text-[#2E2E2E]">
        11:55
      </Abs>
      <Abs l={551} t={257} w={720} className="font-inter text-[13px] leading-[16px] text-[#131313]" style={{ whiteSpace: "pre-line" }}>
        <span className="font-semibold">{"🎯 New Campaign Live: Nike’s Diwali 2025"}</span>
        {"\n\nGreat news, team — the Nike’s Diwali campaign has officially launched today!\nAssigned teams, please check your dashboards for creator lists, deliverables, and reporting schedules.\nLet’s deliver a stellar execution as always. ⚡"}
      </Abs>

      {/* ================= message 2 — Google Calendar / 12:45 ================= */}
      <Abs l={513} t={358} w={32} h={32} className="overflow-hidden rounded-[5px] bg-white" style={{ outline: "1px solid #E3E3E3" }}>
        <div className="h-[9px] w-full" style={{ background: "#E8483C" }} />
        <div className="flex h-[23px] items-center justify-center text-[13px] font-bold text-[#4285F4]">31</div>
      </Abs>
      <Abs l={553} t={358} className="text-[13px] font-extrabold leading-[16px] text-[#1B1B1B]">
        Google Calendar
      </Abs>
      <Abs l={654} t={359.5} w={26} h={13} className="flex items-center justify-center rounded-[3px]" style={{ background: "#DFDFDF" }}>
        <span className="text-[9px] font-medium text-[#2E2E2E]">APP</span>
      </Abs>
      <Abs l={684} t={359.5} className="text-[11px] font-medium leading-[13px] text-[#2E2E2E]">
        12:45
      </Abs>
      <Abs l={553} t={377} className="font-inter text-[13px] font-medium leading-[16px] text-[#131313]">
        Event starting in 15 minutes:
      </Abs>
      <Abs l={553} t={402} w={3} h={35} className="rounded-[10px]" style={{ background: "#209DD4" }} />
      <Abs l={568} t={402} className="text-[13px] font-bold leading-[16px] text-[#146199]">
        Team status meeting
      </Abs>
      <Abs l={700} t={403.5} className="text-[13px] leading-[16px]">
        📝
      </Abs>
      <Abs l={568} t={421} className="font-inter text-[13px] font-medium leading-[16px] text-[#131313]">
        Today from 13:00 to 13:30
      </Abs>

      {/* ================= message 3 — Dev / 12:58 ================= */}
      <Abs l={513} t={447} w={32} h={32} className="rounded-full" style={{ background: "linear-gradient(135deg,#C8E6FF,#C8B3ED)" }} />
      <Abs l={553} t={447} className="text-[13px] font-extrabold leading-[16px] text-[#1B1B1B]">
        Dev
      </Abs>
      <Abs l={581} t={448.5} className="text-[11px] font-medium leading-[13px] text-[#2E2E2E]">
        12:58
      </Abs>
      <Abs l={553} t={466} className="text-[13px] font-medium leading-[16px] text-[#131313]">
        Meeting notes from our sync with <span className="text-[#1264A3]">@PoojaSingh</span>
      </Abs>
      <Abs l={553} t={485} className="text-[11px] font-medium leading-[13px] text-[#2E2E2E]">
        Post
      </Abs>
      <Abs l={576} t={489} w={10} h={10}>
        <ChevronDown className="h-[10px] w-[10px] text-[#2E2E2E]" strokeWidth={2} />
      </Abs>
      <Abs l={553} t={501} w={640} h={54} className="rounded-[6px]" style={{ background: "#FBFBFB", outline: "1px solid #E8E8E8" }} />
      <Abs l={563} t={512} w={32} h={32} className="flex items-center justify-center">
        <FileText className="h-[26px] w-[26px] text-[#37A15E]" strokeWidth={1.5} />
      </Abs>
      <Abs l={604} t={511} className="text-[13px] font-extrabold leading-[16px] text-[#1B1B1B]">
        1/9 meeting notes
      </Abs>
      <Abs l={604} t={529} className="text-[13px] font-medium leading-[16px] text-[#2E2E2E]">
        Last edited just now
      </Abs>

      {/* ================= message input ================= */}
      <Abs l={515} t={952} w={783} h={38} className="rounded-[4px] bg-white" style={{ outline: "1px solid #E3E3E3" }} />
      <Abs l={525} t={961} w={1} h={20} style={{ background: "#4C4C4C" }} />
      <Abs l={533} t={963} className="text-[13px] font-medium leading-[16px] text-[#2E2E2E]">
        Message #skincare-campaign-poll
      </Abs>
      <Abs l={1159} t={964} w={14} h={14}>
        <Link2 className="h-[14px] w-[14px] text-[#5F5F5F]" strokeWidth={1.8} />
      </Abs>
      <Abs l={1187} t={964} w={14} h={14}>
        <AtSign className="h-[14px] w-[14px] text-[#5F5F5F]" strokeWidth={1.8} />
      </Abs>
      <Abs l={1215} t={964} w={14} h={14}>
        <Smile className="h-[14px] w-[14px] text-[#5F5F5F]" strokeWidth={1.8} />
      </Abs>
      <Abs l={1243} t={964} w={14} h={14}>
        <Paperclip className="h-[14px] w-[14px] text-[#5F5F5F]" strokeWidth={1.8} />
      </Abs>
      <Abs l={1271} t={964} w={14} h={14}>
        <BarChart2 className="h-[14px] w-[14px] text-[#5F5F5F]" strokeWidth={1.8} />
      </Abs>

      {/* ======================================================================= */}
      {/* ============== CREATE A CHANNEL MODAL (node 4815:10729) ================ */}
      {/* The modal is a full-canvas overlay (top at y=65, above the nav region), */}
      {/* so it sits above the AppShell TopBar (z-10) / Sidebar (z-20).           */}
      {/* ======================================================================= */}
      <div className="absolute inset-0 z-[60]">
      <Abs
        l={328}
        t={65}
        w={784}
        h={895}
        className="rounded-[24px] bg-white"
        style={{ boxShadow: "0 24px 70px rgba(0,0,0,0.22)" }}
      />

      {/* ---- header row ---- */}
      <Abs l={348} t={93} w={713} h={48} className="flex items-center justify-between">
        <span className="text-[24px] font-medium leading-none text-black">Create a Channel</span>
        <span className="flex items-center gap-[15px]">
          <span
            onClick={() => void handleCreate()}
            className="flex h-[48px] w-[188px] items-center justify-center rounded-[24px] text-[20px] font-medium text-white cursor-pointer"
            style={{ background: "rgba(0,0,0,0.95)" }}
          >
            Create Channel
          </span>
          <span
            onClick={() => navigate(-1)}
            className="flex h-[48px] w-[48px] items-center justify-center rounded-full bg-white cursor-pointer"
            style={{ boxShadow: "inset 0 0 0 1px #E4E4E4" }}
          >
            <X className="h-[16px] w-[16px] text-black" strokeWidth={2} />
          </span>
        </span>
      </Abs>

      {/* ---- Channel Name ---- */}
      <Abs l={379} t={163} className="text-[24px] font-normal leading-[39px] text-black">
        Channel Name
      </Abs>
      <Abs l={379} t={200.4} w={682} h={45.6} className="flex items-center rounded-[12px] bg-[#FAFAFA] pl-[14.6px]">
        <span className="text-[17.9px] font-light" style={{ color: "rgba(0,0,0,0.6)" }}>
          #
        </span>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. skincare-campaign-poll"
          className="ml-[9px] flex-1 bg-transparent text-[17.9px] font-light outline-none placeholder:text-[rgba(0,0,0,0.38)]"
          style={{ color: "rgba(0,0,0,0.6)" }}
        />
      </Abs>

      {/* ---- Global Channel ---- */}
      <Abs l={379} t={261} className="text-[24px] font-normal leading-[39px] text-black">
        Global Channel
      </Abs>
      <Abs l={379} t={296.9} className="text-[18px] font-normal leading-[39px]" style={{ color: "rgba(0,0,0,0.7)" }}>
        When enabled, this channel is accessible to all creators across all agencies
      </Abs>
      {/* toggle (enabled) */}
      <Abs
        onClick={() => setGlobalChannel((v) => !v)}
        l={992}
        t={264}
        w={64}
        h={28}
        className="rounded-full cursor-pointer"
        style={{ background: globalChannel ? "#34C759" : "#E5E5EA" }}
      />
      <Abs
        onClick={() => setGlobalChannel((v) => !v)}
        l={globalChannel ? 1015 : 994}
        t={266}
        w={39}
        h={24}
        className="rounded-full cursor-pointer"
        style={{ background: "rgba(255,255,255,0.9)" }}
      />

      {/* ---- Add Agencies ---- */}
      <Abs l={379} t={353.9} className="text-[24px] font-normal leading-[39px] text-black">
        Add Agencies
      </Abs>
      {/* estimated reach pill */}
      <Abs
        l={874}
        t={354}
        w={187}
        h={31}
        className="flex items-center justify-center gap-[4px] rounded-[16px]"
        style={{ background: "rgba(241,241,241,0.945)" }}
      >
        <span className="text-[12px] font-normal leading-none" style={{ color: "rgba(0,0,0,0.6)" }}>
          ESTIMATED REACH
        </span>
        <span className="text-[12px] font-medium leading-none text-[#4CCC16]">1,350</span>
      </Abs>
      {/* search input */}
      <Abs l={379} t={391.4} w={682} h={45.6} className="flex items-center rounded-[12px] bg-[#FAFAFA] pl-[9px]">
        <Search className="h-[16px] w-[16px]" style={{ color: "#000000" }} strokeWidth={1.8} />
        <span className="ml-[13px] text-[16px] font-light" style={{ color: "rgba(0,0,0,0.7)" }}>
          Search and add agencies
        </span>
      </Abs>
      {/* agency chips */}
      {agencies.map((a) => (
        <AgencyChip
          key={a.id}
          l={a.l}
          label={a.label}
          bg={a.bg}
          glyphColor={a.glyphColor}
          onRemove={() => setAgencies((prev) => prev.filter((x) => x.id !== a.id))}
        />
      ))}

      {/* ---- Target Creators ---- */}
      <Abs l={379} t={507} className="text-[24px] font-normal leading-[39px] text-black">
        Target Creators
      </Abs>

      <Field l={379} t={552.9} label="Platform" value="Instagram" />
      <Field l={728} t={552.9} label="Niche" value="Lifestyle" />
      <Field l={379} t={651.4} label="Location" value="Delhi ncr" />
      <Field l={728} t={651.4} label="Service" value="Barter" />
      <Field l={379} t={749.8} label="Gender" value="Female" />
      <Field l={728} t={749.8} label="Language" value="English, Hindi" />
      <Field l={379} t={848.2} label="Age" value="19-25" />
      <Field l={728} t={848.2} label="Follower Range" value="0-500k" />
      </div>
    </>
  );
}
