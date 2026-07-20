import type { CSSProperties, ReactNode } from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePolls, useChannels } from "@/api/hooks";
import type { LucideIcon } from "lucide-react";
import {
  Hash,
  ChevronDown,
  ChevronRight,
  Plus,
  Info,
  RotateCw,
  MoreHorizontal,
  BarChartHorizontal,
  Link2,
  AtSign,
  Smile,
  Paperclip,
} from "lucide-react";

/**
 * Super Admin — Poll in chat.
 * Exact reconstruction of Figma frame 5077:69402 ("Super Admin-poll  in chat"), 1440×1024.
 * CLEAN underlying page: the captured profile popup + dim scrim (nodes 5077:70247…70290) are omitted.
 * TopBar (logo + right buttons) and the left icon rail live in AppShell and are NOT rendered here.
 */

const WHITE70 = "rgba(255,255,255,0.7)";
const WHITE50 = "rgba(255,255,255,0.5)";
const GOLD = "#FFD44D";
const GOLD_RADIO = "#D9A800";

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

/* --------------------------- sidebar row kinds ------------------------- */
function ChannelRow({
  top,
  label,
  active,
  indent = 0,
  onClick,
}: {
  top: number;
  label: string;
  active?: boolean;
  indent?: number;
  onClick?: () => void;
}) {
  const color = active ? "#FFFFFF" : WHITE70;
  return (
    <div className="contents cursor-pointer" onClick={onClick}>
      {active && (
        <Abs l={242} t={top} w={247} h={28} className="rounded-[6px]" style={{ background: "#656565" }} />
      )}
      <Abs l={254 + indent} t={top + 5} w={16} h={16}>
        <Hash className="h-[16px] w-[16px]" style={{ color }} strokeWidth={1.7} />
      </Abs>
      <Abs l={280 + indent} t={top + 6.5} className="text-[15px] leading-[15px]" style={{ color }}>
        {label}
      </Abs>
    </div>
  );
}

function SectionRow({
  top,
  label,
  dir,
  indent = 0,
  rightIcon: RightIcon,
  onClick,
}: {
  top: number;
  label: string;
  dir: "down" | "right";
  indent?: number;
  rightIcon?: LucideIcon;
  onClick?: () => void;
}) {
  const Caret = dir === "down" ? ChevronDown : ChevronRight;
  return (
    <div className="contents cursor-pointer" onClick={onClick}>
      <Abs l={254 + indent} t={top + 7} w={14} h={14}>
        <Caret className="h-[14px] w-[14px]" style={{ color: WHITE70 }} strokeWidth={2.2} />
      </Abs>
      <Abs l={281 + indent} t={top + 6.5} className="text-[15px] font-medium leading-[15px]" style={{ color: WHITE70 }}>
        {label}
      </Abs>
      {RightIcon && (
        <Abs l={473} t={top + 6} w={15} h={15}>
          <RightIcon className="h-[15px] w-[15px] text-[#BABABA]" strokeWidth={2} />
        </Abs>
      )}
    </div>
  );
}

function AddRow({ top, label, indent = 0, onClick }: { top: number; label: string; indent?: number; onClick?: () => void }) {
  return (
    <div className="contents cursor-pointer" onClick={onClick}>
      <Abs
        l={254 + indent}
        t={top + 5}
        w={20}
        h={20}
        className="flex items-center justify-center rounded-[4px]"
        style={{ background: "rgba(255,255,255,0.1)" }}
      >
        <Plus className="h-[12px] w-[12px]" style={{ color: WHITE70 }} strokeWidth={2} />
      </Abs>
      <Abs l={280 + indent} t={top + 6.5} className="text-[15px] leading-[15px]" style={{ color: WHITE70 }}>
        {label}
      </Abs>
    </div>
  );
}

/** hover "more options" 3-dot affordance sitting at the right of a dark-sidebar row */
function MenuDots({ top }: { top: number }) {
  return (
    <Abs l={473} t={top} w={15} h={15}>
      <MoreHorizontal className="h-[15px] w-[15px]" style={{ color: "rgba(255,255,255,0.4)" }} strokeWidth={2.4} />
    </Abs>
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

/** small green presence dot with a dark ring, bottom-right of a sidebar avatar */
function StatusDot({ l, t }: { l: number; t: number }) {
  return (
    <>
      <Abs l={l - 1.4} t={t - 1.4} w={9.8} h={9.8} className="rounded-full" style={{ background: "#1B1B1B" }} />
      <Abs l={l} t={t} w={7} h={7} className="rounded-full" style={{ background: "#2EB67D" }} />
    </>
  );
}

/* ------------------------------ poll pieces ---------------------------- */
function Radio({ selected }: { selected?: boolean }) {
  if (selected) {
    return (
      <span
        className="flex h-[20px] w-[20px] items-center justify-center rounded-full border-2"
        style={{ borderColor: GOLD_RADIO }}
      >
        <span className="h-[10px] w-[10px] rounded-full" style={{ background: GOLD_RADIO }} />
      </span>
    );
  }
  return <span className="h-[20px] w-[20px] rounded-full border-2" style={{ borderColor: "rgba(73,69,79,0.55)" }} />;
}

function PollOption({
  l,
  t,
  w,
  label,
  selected,
  borderColor,
  onClick,
}: {
  l: number;
  t: number;
  w: number;
  label: string;
  selected?: boolean;
  borderColor: string;
  onClick?: () => void;
}) {
  return (
    <Abs
      l={l}
      t={t}
      w={w}
      h={42}
      onClick={onClick}
      className="flex cursor-pointer items-center gap-[15px] rounded-[12px] bg-white px-[15px]"
      style={{ border: `1.23px solid ${borderColor}` }}
    >
      <span className="flex h-[24px] w-[24px] items-center justify-center">
        <Radio selected={selected} />
      </span>
      <span className="text-[18px] leading-none" style={{ color: "rgba(13,20,28,0.9)" }}>
        {label}
      </span>
    </Abs>
  );
}

function VoteBtn({ l, t, onClick }: { l: number; t: number; onClick?: () => void }) {
  return (
    <Abs
      l={l}
      t={t}
      w={99}
      h={42}
      onClick={onClick}
      className="flex cursor-pointer items-center justify-center rounded-[24px]"
      style={{ background: "rgba(255,255,255,0.95)", outline: "1px solid #D9D9D9" }}
    >
      <span className="text-[20px] font-medium leading-none text-[#121212]">Vote</span>
    </Abs>
  );
}

function TimelinePill({ l, t, label }: { l: number; t: number; label: string }) {
  return (
    <Abs
      l={l}
      t={t}
      w={224}
      h={32}
      className="flex items-center justify-center gap-[4px] rounded-[16px]"
      style={{ background: "rgba(255,255,255,0.945)", outline: "0.5px solid #D9D9D9" }}
    >
      <BarChartHorizontal className="h-[16px] w-[16px] text-[#5F5F5F]" strokeWidth={1.8} />
      <span className="text-[12px] font-light" style={{ color: "rgba(0,0,0,0.9)" }}>
        {label}
      </span>
    </Abs>
  );
}

function IconPill({
  l,
  w,
  icon: Icon,
  label,
  strokeW = 1.8,
  onClick,
}: {
  l: number;
  w: number;
  icon: LucideIcon;
  label: string;
  strokeW?: number;
  onClick?: () => void;
}) {
  return (
    <Abs
      l={l}
      t={129}
      w={w}
      h={32}
      onClick={onClick}
      className="flex cursor-pointer items-center justify-center gap-[4px] rounded-[16px]"
      style={{ background: "rgba(255,255,255,0.945)", outline: "0.5px solid #D9D9D9" }}
    >
      <Icon className="h-[16px] w-[16px]" style={{ color: "rgba(0,0,0,0.7)" }} strokeWidth={strokeW} />
      <span className="text-[12px] font-light" style={{ color: "rgba(0,0,0,0.9)" }}>
        {label}
      </span>
    </Abs>
  );
}

function MembersChip({
  l,
  t,
  plus,
  count,
  onClick,
}: {
  l: number;
  t: number;
  plus: string;
  count: string;
  onClick?: () => void;
}) {
  return (
    <Abs l={l} t={t} w={170} h={32} onClick={onClick} className="cursor-pointer rounded-[18px] bg-white" style={{ outline: "0.5px solid #D9D9D9" }}>
      {/* overlapping avatar stack — even ~17px offsets so each glyph stays readable */}
      <Abs l={4} t={3.5} w={25} h={25} className="rounded-full" style={{ background: "linear-gradient(135deg,#C8E6FF,#C8B3ED)", boxShadow: "0 0 0 2px #fff" }} />
      <LetterAvatar l={21} t={3.5} size={25} letter="S" bg="#FFF4AD" color="#B49C01" font={15} ring />
      <LetterAvatar l={38} t={3.5} size={25} letter="P" bg="#BCD4FD" color="#1155C8" font={15} ring />
      <LetterAvatar l={55} t={3.5} size={25} letter="R" bg="#EFBEFF" color="#8701B4" font={15} ring />
      <LetterAvatar l={72} t={3.5} size={25} letter={plus} bg="#E5E5E5" color="#000000" font={8.3} ring />
      <Abs l={101} t={8.5} className="text-[11px] font-medium leading-[13px] text-[#2E2E2E]">
        {count}
      </Abs>
    </Abs>
  );
}

/* -------------------------------- data --------------------------------- */
const SECTIONS: {
  top: number;
  label: string;
  dir: "down" | "right";
  indent?: number;
  rightIcon?: LucideIcon;
}[] = [
  { top: 176, label: "Notifications", dir: "down", rightIcon: Plus },
  { top: 288, label: "Groups", dir: "down" },
  { top: 626, label: "Campaigns", dir: "down", rightIcon: Plus },
  { top: 654, label: "Vishal Sharma", dir: "down" },
  { top: 682, label: "Nike Diwali", dir: "down", indent: 21 },
  { top: 794, label: "Ritika Verma", dir: "right" },
  { top: 822, label: "Neha", dir: "right" },
  { top: 850, label: "Ajay", dir: "right" },
];

/* channel-row layout slots; labels bind to live useChannels() data (positional) */
const CHANNELS: { top: number; active?: boolean; indent?: number }[] = [
  { top: 204 },
  { top: 232, active: true },
  { top: 316 },
  { top: 344 },
  { top: 372 },
  { top: 400 },
  { top: 428 },
  { top: 710, indent: 21 },
  { top: 738, indent: 20 },
];

const ADDS: { top: number; label: string; indent?: number }[] = [
  { top: 260, label: "Add channel" },
  { top: 456, label: "Add group" },
  { top: 598, label: "Add person" },
  { top: 766, label: "Add group", indent: 20 },
];

/* ⋯ "more options" affordances captured on the right edge of many sidebar rows */
const MENU_DOTS = [211, 239, 294, 323, 352, 381, 408, 434, 523, 551];

/* section-header labels that map to a dedicated route; everything else opens chat */
const SECTION_ROUTES: Record<string, string> = {
  Campaigns: "/campaigns",
  "Nike Diwali": "/campaigns/detail",
};

/* -------------------------------- page --------------------------------- */
export default function PollInChatPage() {
  const navigate = useNavigate();
  const [selectedOption, setSelectedOption] = useState(0);
  const poll = (usePolls().data ?? [])[0];
  const pollOptions = poll?.options ?? [];
  const totalVotes = (poll?.results ?? []).reduce((sum, n) => sum + n, 0);
  const channels = useChannels().data ?? [];
  return (
    <>
      {/* ================= page background (Figma frame 5077:69402 fill) ================= */}
      <Abs
        l={0}
        t={0}
        w={1440}
        h={1024}
        style={{
          background:
            "linear-gradient(125.6deg, #EAEAEA 0.14%, #EDF9FF 24.95%, rgba(201,218,227,0.9) 73.36%, #A4C5D9 99.33%)",
        }}
      />

      {/* ================= outer card ================= */}
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
      <Abs l={242} t={168} w={255} h={1} style={{ background: "rgba(108,108,108,0.6)" }} />

      {/* section headers */}
      {SECTIONS.map((s) => (
        <SectionRow
          key={`sec-${s.top}`}
          {...s}
          onClick={() => navigate(SECTION_ROUTES[s.label] ?? "/chat")}
        />
      ))}

      {/* channel rows */}
      {CHANNELS.map((c, i) => (
        <ChannelRow key={`ch-${c.top}`} {...c} label={channels[i]?.name ?? ""} onClick={() => navigate("/chat")} />
      ))}

      {/* add rows */}
      {ADDS.map((a) => (
        <AddRow key={`add-${a.top}`} {...a} onClick={() => navigate("/chat/create-channel")} />
      ))}

      {/* ⋯ row affordances */}
      {MENU_DOTS.map((t) => (
        <MenuDots key={`dots-${t}`} top={t} />
      ))}

      {/* ---- Direct messages header + badge ---- */}
      <Abs l={254} t={493} w={14} h={14}>
        <ChevronRight className="h-[14px] w-[14px]" style={{ color: WHITE70 }} strokeWidth={2.2} />
      </Abs>
      <Abs l={281} t={492.5} onClick={() => navigate("/chat")} className="cursor-pointer text-[15px] font-medium leading-[15px]" style={{ color: WHITE70 }}>
        Direct messages
      </Abs>
      <Abs l={453} t={488} w={24} h={24} className="flex items-center justify-center rounded-full" style={{ background: "#E64E4E" }}>
        <span className="text-[10.3px] font-medium text-white">120</span>
      </Abs>

      {/* ---- DM rows ---- */}
      {/* Dev Singh (you) */}
      <Abs l={254} t={517} w={20} h={20} className="rounded-full" style={{ background: "linear-gradient(135deg,#F4B0C4,#B58BE0)" }} />
      <StatusDot l={268} t={531.5} />
      <Abs l={283} t={520.5} onClick={() => navigate("/chat")} className="cursor-pointer text-[15px] leading-[15px]" style={{ color: WHITE70 }}>
        Dev Singh
      </Abs>
      <Abs l={358} t={520.5} className="text-[15px] leading-[15px]" style={{ color: WHITE50 }}>
        you
      </Abs>

      {/* Sanjay Sharma */}
      <LetterAvatar l={254} t={545.5} size={20} letter="S" bg="#FFF4AD" color="#B49C01" font={12} />
      <StatusDot l={268} t={559.5} />
      <Abs l={283} t={548.5} onClick={() => navigate("/chat")} className="cursor-pointer text-[15px] leading-[15px]" style={{ color: WHITE70 }}>
        Sanjay Sharma
      </Abs>

      {/* Pooja Singh */}
      <LetterAvatar l={254} t={573.5} size={20} letter="P" bg="#BCD4FD" color="#1155C8" font={12} />
      <StatusDot l={268} t={587.5} />
      <Abs l={283} t={576.5} onClick={() => navigate("/chat")} className="cursor-pointer text-[15px] leading-[15px]" style={{ color: WHITE70 }}>
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
        #skincare-campaign-poll
      </Abs>
      <IconPill l={978} w={93} icon={Info} label="Poll info" strokeW={1.6} onClick={() => navigate("/polls/general")} />
      <IconPill l={1078} w={87} icon={RotateCw} label="Refresh" onClick={() => navigate(0)} />
      <MembersChip l={1176} t={128.5} plus="+15" count="20 Members" onClick={() => navigate("/people")} />

      {/* header divider */}
      <Abs l={497} t={169} w={863} h={1} style={{ background: "rgba(0,0,0,0.12)" }} />

      {/* ================= message — Dev / 11:55 (POLL) ================= */}
      <TimelinePill l={816} t={188} label="Campaign Poll created just now" />

      <Abs l={511} t={235} w={32} h={32} className="rounded-full" style={{ background: "linear-gradient(135deg,#C8E6FF,#C8B3ED)" }} />
      <Abs l={551} t={235} className="text-[13px] font-extrabold leading-[16px] text-[#1B1B1B]">
        Dev
      </Abs>
      <Abs l={581} t={236.5} className="text-[11px] font-medium leading-[13px] text-[#2E2E2E]">
        11:55
      </Abs>
      <Abs l={612} t={237} w={30} h={13} className="flex items-center justify-center rounded-[3px]" style={{ background: "#DFDFDF" }}>
        <span className="text-[9px] font-medium text-[#2E2E2E]">POLL</span>
      </Abs>

      {/* poll card (cream / gold accent) */}
      <Abs l={551} t={254} w={747} h={341} className="rounded-[4px]" style={{ background: "rgba(255,212,77,0.11)" }} />
      <Abs l={551} t={254} w={3} h={341} className="rounded-full" style={{ background: GOLD }} />
      <Abs
        l={566}
        t={268}
        w={704}
        className="text-[13px] font-medium leading-[15.7px]"
        style={{ color: "#131313", whiteSpace: "pre-line", fontFamily: "Inter, Outfit, sans-serif" }}
      >
        <span className="text-[20px] font-medium leading-[25px]" style={{ fontFamily: "Outfit, sans-serif" }}>
          {poll?.question ?? ""}
        </span>
        {"\n\n📣 Campaign Opportunity — Paid Collaboration\n\nBrand: Lenskart\nPlatform: Instagram\nDeliverable: 1 Tagged Reel\nWebsite: https://www.lenskart.com/"}
      </Abs>

      <PollOption
        l={566}
        t={423}
        w={682}
        label={pollOptions[0] ?? ""}
        selected={selectedOption === 0}
        borderColor={selectedOption === 0 ? GOLD : "#DEDEDE"}
        onClick={() => setSelectedOption(0)}
      />
      <PollOption
        l={566}
        t={475}
        w={682}
        label={pollOptions[1] ?? ""}
        selected={selectedOption === 1}
        borderColor={selectedOption === 1 ? GOLD : "#DEDEDE"}
        onClick={() => setSelectedOption(1)}
      />

      <Abs l={569} t={544} className="text-[16px] leading-[20px]" style={{ color: "rgba(27,27,27,0.8)" }}>
        {totalVotes} votes
      </Abs>
      <Abs l={1026} t={546} onClick={() => navigate("/polls/result")} className="cursor-pointer text-[16px] leading-[20px] underline underline-offset-2" style={{ color: "rgba(27,27,27,0.8)" }}>
        Show Results
      </Abs>
      <VoteBtn l={1149} t={533} onClick={() => navigate("/polls/result")} />

      {/* ================= message input ================= */}
      <Abs l={515} t={952} w={783} h={38} className="rounded-[4px] bg-white" style={{ outline: "1px solid #555555" }} />
      <Abs l={525} t={961} w={1} h={20} style={{ background: "#4C4C4C" }} />
      <Abs l={526} t={963} className="text-[13px] font-medium leading-[16px]" style={{ color: "rgba(46,46,46,0.7)" }}>
        Message #skincare-campaign-poll
      </Abs>
      {/* input tools */}
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
      <Abs l={1271} t={964} w={14} h={14} onClick={() => navigate("/polls/type")} className="cursor-pointer">
        <BarChartHorizontal className="h-[14px] w-[14px] text-[#5F5F5F]" strokeWidth={1.8} />
      </Abs>
    </>
  );
}
