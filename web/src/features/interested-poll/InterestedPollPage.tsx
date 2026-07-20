import type { CSSProperties, ReactNode } from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePolls, useCreators } from "@/api/hooks";
import type { LucideIcon } from "lucide-react";
import {
  Hash,
  ChevronDown,
  ChevronRight,
  Plus,
  UserPlus,
  Info,
  RotateCw,
  BarChartHorizontal,
  Link2,
  AtSign,
  Smile,
  Paperclip,
} from "lucide-react";

/**
 * Super Admin — Interested Poll Creator.
 * Exact reconstruction of Figma frame 5077:69796 ("Super Admin-interested poll creator"), 1440×1024.
 * CLEAN underlying page: the captured profile popup + dim scrim (nodes 5077:70293…70336) are omitted.
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
    <>
      {active && (
        <Abs
          l={242}
          t={top}
          w={247}
          h={28}
          className="cursor-pointer rounded-[6px]"
          style={{ background: "#1164A3" }}
          onClick={onClick}
        />
      )}
      <Abs l={254 + indent} t={top + 5} w={16} h={16} className="cursor-pointer" onClick={onClick}>
        <Hash className="h-[16px] w-[16px]" style={{ color }} strokeWidth={1.7} />
      </Abs>
      <Abs
        l={280 + indent}
        t={top + 6.5}
        className="cursor-pointer text-[15px] leading-[15px]"
        style={{ color }}
        onClick={onClick}
      >
        {label}
      </Abs>
    </>
  );
}

function SectionRow({
  top,
  label,
  dir,
  indent = 0,
  rightIcon: RightIcon,
  onRightIconClick,
}: {
  top: number;
  label: string;
  dir: "down" | "right";
  indent?: number;
  rightIcon?: LucideIcon;
  onRightIconClick?: () => void;
}) {
  const Caret = dir === "down" ? ChevronDown : ChevronRight;
  return (
    <>
      <Abs l={254 + indent} t={top + 7} w={14} h={14}>
        <Caret className="h-[14px] w-[14px]" style={{ color: WHITE70 }} strokeWidth={2.2} />
      </Abs>
      <Abs l={281 + indent} t={top + 6.5} className="text-[15px] font-medium leading-[15px]" style={{ color: WHITE70 }}>
        {label}
      </Abs>
      {RightIcon && (
        <Abs l={473} t={top + 6} w={15} h={15} className="cursor-pointer" onClick={onRightIconClick}>
          <RightIcon className="h-[15px] w-[15px] text-[#BABABA]" strokeWidth={2} />
        </Abs>
      )}
    </>
  );
}

function AddRow({
  top,
  label,
  indent = 0,
  onClick,
}: {
  top: number;
  label: string;
  indent?: number;
  onClick?: () => void;
}) {
  return (
    <>
      <Abs
        l={254 + indent}
        t={top + 5}
        w={20}
        h={20}
        className="flex cursor-pointer items-center justify-center rounded-[4px]"
        style={{ background: "rgba(255,255,255,0.1)" }}
        onClick={onClick}
      >
        <Plus className="h-[12px] w-[12px]" style={{ color: WHITE70 }} strokeWidth={2} />
      </Abs>
      <Abs
        l={280 + indent}
        t={top + 6.5}
        className="cursor-pointer text-[15px] leading-[15px]"
        style={{ color: WHITE70 }}
        onClick={onClick}
      >
        {label}
      </Abs>
    </>
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
        style={{ borderColor: "#9E9E9E" }}
      >
        <span className="h-[10px] w-[10px] rounded-full" style={{ background: "#9E9E9E" }} />
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
  onClick,
}: {
  l: number;
  t: number;
  w: number;
  label: string;
  selected?: boolean;
  onClick?: () => void;
}) {
  return (
    <Abs
      l={l}
      t={t}
      w={w}
      h={42}
      className="flex cursor-pointer items-center gap-[15px] rounded-[12px] bg-white px-[15px]"
      style={{ outline: "1px solid rgba(0,0,0,0.05)" }}
      onClick={onClick}
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
      className="flex cursor-pointer items-center justify-center rounded-[24px]"
      style={{ background: "rgba(255,255,255,0.95)", outline: "1px solid rgba(0,0,0,0.08)" }}
      onClick={onClick}
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
      style={{ background: "rgba(255,255,255,0.945)" }}
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
      className="flex cursor-pointer items-center justify-center gap-[4px] rounded-[16px]"
      style={{ background: "rgba(255,255,255,0.945)" }}
      onClick={onClick}
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
  letters = ["S", "P", "R"],
  onClick,
}: {
  l: number;
  t: number;
  plus?: string;
  count: string;
  letters?: [string, string, string];
  onClick?: () => void;
}) {
  return (
    <Abs l={l} t={t} w={170} h={32} className="cursor-pointer rounded-[18px] bg-white" style={{ outline: "1px solid rgba(0,0,0,0.04)" }} onClick={onClick}>
      {/* overlapping avatar stack — even ~17px offsets so each glyph stays readable */}
      <Abs l={4} t={3.5} w={25} h={25} className="rounded-full" style={{ background: "linear-gradient(135deg,#C8E6FF,#C8B3ED)", boxShadow: "0 0 0 2px #fff" }} />
      <LetterAvatar l={21} t={3.5} size={25} letter={letters[0]} bg="#FFF4AD" color="#B49C01" font={15} ring />
      <LetterAvatar l={38} t={3.5} size={25} letter={letters[1]} bg="#BCD4FD" color="#1155C8" font={15} ring />
      <LetterAvatar l={55} t={3.5} size={25} letter={letters[2]} bg="#EFBEFF" color="#8701B4" font={15} ring />
      <LetterAvatar l={72} t={3.5} size={25} letter={plus ?? ""} bg="#E5E5E5" color="#000000" font={8.3} ring />
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
  { top: 288, label: "Groups", dir: "down", rightIcon: UserPlus },
  { top: 626, label: "Campaigns", dir: "down", rightIcon: Plus },
  { top: 654, label: "Vishal Sharma", dir: "down" },
  { top: 682, label: "Nike Diwali", dir: "down", indent: 21 },
  { top: 794, label: "Ritika Verma", dir: "right" },
  { top: 822, label: "Neha", dir: "right" },
  { top: 850, label: "Ajay", dir: "right" },
];

const CHANNELS: { top: number; label: string; active?: boolean; indent?: number }[] = [
  { top: 204, label: "Agency announcements" },
  { top: 232, label: "skincare-campaign-poll", active: true },
  { top: 316, label: "Welcome" },
  { top: 344, label: "General" },
  { top: 372, label: "marketing" },
  { top: 400, label: "operations" },
  { top: 428, label: "sales" },
  { top: 710, label: "Brand + Agencies", indent: 21 },
  { top: 738, label: "Only Agencies", indent: 20 },
];

const ADDS: { top: number; label: string; indent?: number }[] = [
  { top: 260, label: "Add channels" },
  { top: 456, label: "Add group" },
  { top: 598, label: "Add person" },
  { top: 766, label: "Add group", indent: 20 },
];

/* -------------------------------- page --------------------------------- */
export default function InterestedPollPage() {
  const navigate = useNavigate();
  const { data: pollsData } = usePolls();
  const { data: creatorsData } = useCreators();
  const polls = pollsData ?? [];
  const creators = creatorsData ?? [];
  const poll1 = polls[0];
  const poll2 = polls[1];
  const poll1Votes = (poll1?.results ?? []).reduce((a, b) => a + b, 0);
  const initial = (name?: string) => (name ? name.charAt(0).toUpperCase() : "");
  const creatorLetters: [string, string, string] = [
    initial(creators[0]?.name),
    initial(creators[1]?.name),
    initial(creators[2]?.name),
  ];
  const [activeChannel, setActiveChannel] = useState("skincare-campaign-poll");
  const [poll1Choice, setPoll1Choice] = useState(0);
  const [poll2Choice, setPoll2Choice] = useState<number | null>(null);
  return (
    <>
      {/* ================= page background (Figma frame 5077:69796 fill) ================= */}
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
      <Abs l={353} t={146} w={14} h={14}>
        <ChevronDown className="h-[14px] w-[14px]" style={{ color: WHITE70 }} strokeWidth={2.2} />
      </Abs>

      {/* section headers */}
      {SECTIONS.map((s) => (
        <SectionRow
          key={`sec-${s.top}`}
          {...s}
          onRightIconClick={
            s.rightIcon
              ? () =>
                  navigate(
                    s.label === "Groups"
                      ? "/settings/add-members"
                      : s.label === "Campaigns"
                        ? "/campaigns"
                        : "/chat/create-channel",
                  )
              : undefined
          }
        />
      ))}

      {/* channel rows */}
      {CHANNELS.map((c) => (
        <ChannelRow
          key={`ch-${c.top}`}
          {...c}
          active={activeChannel === c.label}
          onClick={() => setActiveChannel(c.label)}
        />
      ))}

      {/* add rows */}
      {ADDS.map((a) => (
        <AddRow
          key={`add-${a.top}`}
          {...a}
          onClick={() =>
            navigate(a.label === "Add person" ? "/settings/add-members" : "/chat/create-channel")
          }
        />
      ))}

      {/* ---- Direct messages header + badge ---- */}
      <Abs l={254} t={493} w={14} h={14}>
        <ChevronRight className="h-[14px] w-[14px]" style={{ color: WHITE70 }} strokeWidth={2.2} />
      </Abs>
      <Abs l={281} t={492.5} className="text-[15px] font-medium leading-[15px]" style={{ color: WHITE70 }}>
        Direct messages
      </Abs>
      <Abs l={453} t={488} w={24} h={24} className="flex items-center justify-center rounded-full" style={{ background: "#E64E4E" }}>
        <span className="text-[10.3px] font-medium text-white">120</span>
      </Abs>

      {/* ---- DM rows ---- */}
      {/* Dev Singh (you) */}
      <Abs l={254} t={517} w={20} h={20} className="rounded-full" style={{ background: "linear-gradient(135deg,#F4B0C4,#B58BE0)" }} />
      <StatusDot l={268} t={531.5} />
      <Abs l={283} t={520.5} className="text-[15px] leading-[15px]" style={{ color: WHITE70 }}>
        Dev Singh
      </Abs>
      <Abs l={358} t={520.5} className="text-[15px] leading-[15px]" style={{ color: WHITE50 }}>
        you
      </Abs>

      {/* Sanjay Sharma */}
      <LetterAvatar l={254} t={545.5} size={20} letter="S" bg="#FFF4AD" color="#B49C01" font={12} />
      <StatusDot l={268} t={559.5} />
      <Abs l={283} t={548.5} className="text-[15px] leading-[15px]" style={{ color: WHITE70 }}>
        Sanjay Sharma
      </Abs>

      {/* Pooja Singh */}
      <LetterAvatar l={254} t={573.5} size={20} letter="P" bg="#BCD4FD" color="#1155C8" font={12} />
      <StatusDot l={268} t={587.5} />
      <Abs l={283} t={576.5} className="text-[15px] leading-[15px]" style={{ color: WHITE70 }}>
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
      <IconPill l={978} w={93} icon={Info} label="Poll info" strokeW={1.6} onClick={() => navigate("/polls/result")} />
      <IconPill l={1078} w={87} icon={RotateCw} label="Refresh" onClick={() => navigate(0)} />
      <MembersChip l={1176} t={128.5} count="10 Members" onClick={() => navigate("/people")} />

      {/* header divider */}
      <Abs l={497} t={169} w={863} h={1} style={{ background: "#EDEDED" }} />

      {/* ================= message 1 — Dev / 11:55 (PRIMARY POLL) ================= */}
      <TimelinePill l={816} t={188} label="Campaign Poll created 2hr ago" />

      <Abs l={511} t={229} w={32} h={32} className="rounded-full" style={{ background: "linear-gradient(135deg,#C8E6FF,#C8B3ED)" }} />
      <Abs l={551} t={229} className="text-[13px] font-extrabold leading-[16px] text-[#1B1B1B]">
        Dev
      </Abs>
      <Abs l={579} t={230.5} className="text-[11px] font-medium leading-[13px] text-[#2E2E2E]">
        11:55
      </Abs>
      <Abs l={612} t={231} w={30} h={13} className="flex items-center justify-center rounded-[3px]" style={{ background: "#DFDFDF" }}>
        <span className="text-[9px] font-medium text-[#2E2E2E]">POLL</span>
      </Abs>

      {/* poll card */}
      <Abs l={551} t={248} w={747} h={341} className="rounded-[4px]" style={{ background: "rgba(140,140,140,0.11)" }} />
      <Abs l={551} t={248} w={3} h={341} className="rounded-full" style={{ background: "#9E9E9E" }} />
      <Abs l={566} t={256} className="text-[12px] font-bold leading-[15px] text-[#2E2E2E]">
        PRIMARY POLL
      </Abs>
      <Abs
        l={566}
        t={279}
        w={704}
        className="text-[13px] font-medium leading-[15.7px] text-[#131313]"
        style={{ whiteSpace: "pre-line", fontFamily: "Inter, Outfit, sans-serif" }}
      >
        <span className="text-[20px] leading-[25px]" style={{ fontFamily: "Outfit, sans-serif" }}>
          {poll1?.question ?? ""}
        </span>
        {"\n\n📣 Campaign Opportunity — Paid Collaboration\n\nBrand: Lenskart\nPlatform: Instagram\nDeliverable: 1 Tagged Reel\nWebsite: https://www.lenskart.com/"}
      </Abs>

      <PollOption
        l={566}
        t={427}
        w={682}
        label={poll1?.options[0] ?? ""}
        selected={poll1Choice === 0}
        onClick={() => setPoll1Choice(0)}
      />
      <PollOption
        l={566}
        t={479}
        w={682}
        label={poll1?.options[1] ?? ""}
        selected={poll1Choice === 1}
        onClick={() => setPoll1Choice(1)}
      />

      <Abs l={569} t={548} className="text-[16px] leading-[20px]" style={{ color: "rgba(27,27,27,0.8)" }}>
        {poll1Votes} votes
      </Abs>
      <Abs l={1026} t={550} className="cursor-pointer text-[16px] leading-[20px] underline underline-offset-2" style={{ color: "rgba(27,27,27,0.8)" }} onClick={() => navigate("/polls/result")}>
        Show Results
      </Abs>
      <VoteBtn l={1149} t={537} onClick={() => navigate("/polls/result")} />

      {/* ================= message 2 — Dev / 11:55 (SEGMENTED POLL) ================= */}
      <TimelinePill l={816} t={606} label="Campaign Poll created just now" />

      <Abs l={510} t={636} w={32} h={32} className="rounded-full" style={{ background: "linear-gradient(135deg,#C8E6FF,#C8B3ED)" }} />
      <Abs l={550} t={636} className="text-[13px] font-extrabold leading-[16px] text-[#1B1B1B]">
        Dev
      </Abs>
      <Abs l={578} t={637.5} className="text-[11px] font-medium leading-[13px] text-[#2E2E2E]">
        11:55
      </Abs>
      <Abs l={611} t={638} w={30} h={13} className="flex items-center justify-center rounded-[3px]" style={{ background: "#DFDFDF" }}>
        <span className="text-[9px] font-medium text-[#2E2E2E]">POLL</span>
      </Abs>

      {/* poll card (cream) */}
      <Abs l={550} t={655} w={676} h={283} className="rounded-[4px]" style={{ background: "#FFFAEB" }} />
      <Abs l={550} t={655} w={3} h={283} className="rounded-full" style={{ background: "#FFD44D" }} />
      <Abs l={565} t={663} className="text-[12px] font-semibold leading-[15px]" style={{ color: "rgba(0,0,0,0.7)" }}>
        SEGMENTED : INTERESTED CREATORS
      </Abs>
      <MembersChip
        l={1048}
        t={659}
        plus={creators.length > 3 ? `+${creators.length - 3}` : ""}
        count={`${creators.length} Members`}
        letters={creatorLetters}
        onClick={() => navigate("/people")}
      />

      <Abs l={565} t={697} className="whitespace-nowrap text-[20px] font-medium leading-[25px] text-[#131313]">
        {poll2?.question ?? ""}
      </Abs>

      <PollOption
        l={565}
        t={741}
        w={460}
        label={poll2?.options[0] ?? ""}
        selected={poll2Choice === 0}
        onClick={() => setPoll2Choice(0)}
      />
      <PollOption
        l={565}
        t={793}
        w={460}
        label={poll2?.options[1] ?? ""}
        selected={poll2Choice === 1}
        onClick={() => setPoll2Choice(1)}
      />
      <PollOption
        l={565}
        t={845}
        w={460}
        label={poll2?.options[2] ?? ""}
        selected={poll2Choice === 2}
        onClick={() => setPoll2Choice(2)}
      />

      <Abs l={974} t={895} className="cursor-pointer text-[16px] leading-[20px] underline underline-offset-2" style={{ color: "rgba(27,27,27,0.8)" }} onClick={() => navigate("/polls/result")}>
        Show Results
      </Abs>
      <VoteBtn l={1097} t={882} onClick={() => navigate("/polls/result")} />

      {/* ================= message input ================= */}
      <Abs l={515} t={952} w={783} h={38} className="rounded-[4px] bg-white" style={{ outline: "1px solid #E3E3E3" }} />
      <Abs l={525} t={961} w={1} h={20} style={{ background: "#4C4C4C" }} />
      <Abs l={526} t={963} className="text-[13px] font-medium leading-[16px] text-[#2E2E2E]">
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
      <Abs l={1271} t={964} w={14} h={14} className="cursor-pointer" onClick={() => navigate("/polls/type")}>
        <BarChartHorizontal className="h-[14px] w-[14px] text-[#5F5F5F]" strokeWidth={1.8} />
      </Abs>
    </>
  );
}
