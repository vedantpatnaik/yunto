import type { CSSProperties, ReactNode } from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Hash,
  ChevronDown,
  ChevronRight,
  Plus,
  UserPlus,
  X,
  Link2,
  AtSign,
  Smile,
  Paperclip,
  BarChart2,
} from "lucide-react";
import { usePolls } from "@/api/hooks";

/**
 * Super Admin — General Poll (create-poll dialog over #skincare-campaign-poll chat).
 * Exact reconstruction of Figma frame 4756:12622 ("Super Admin- general poll"), 1440×1024.
 * CLEAN underlying page: the captured 50%-black dim scrim (node 4756:12985) is omitted so the
 * chat renders at full opacity; the "create general poll" modal (4817:12476) is the screen content.
 * TopBar (logo + right buttons) and the left icon rail live in AppShell and are NOT rendered here.
 */

const WHITE70 = "rgba(255,255,255,0.7)";

/* ------------------------------ primitive ------------------------------ */
function Abs({
  l,
  t,
  w,
  h,
  className,
  style,
  onClick,
  children,
}: {
  l: number;
  t: number;
  w?: number;
  h?: number;
  className?: string;
  style?: CSSProperties;
  onClick?: () => void;
  children?: ReactNode;
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
        <Abs l={242} t={top} w={247} h={28} className="rounded-[6px] cursor-pointer" style={{ background: "#656565" }} onClick={onClick} />
      )}
      <Abs l={254 + indent} t={top + 5} w={16} h={16} className="cursor-pointer" onClick={onClick}>
        <Hash className="h-[16px] w-[16px]" style={{ color }} strokeWidth={1.7} />
      </Abs>
      <Abs l={280 + indent} t={top + 6.5} className="text-[15px] leading-[15px] cursor-pointer" style={{ color }} onClick={onClick}>
        {label}
      </Abs>
    </>
  );
}

function SectionRow({
  top,
  label,
  dir,
  plus,
  userAdd,
  indent = 0,
  onClick,
}: {
  top: number;
  label: string;
  dir: "down" | "right";
  plus?: boolean;
  userAdd?: boolean;
  indent?: number;
  onClick?: () => void;
}) {
  const Caret = dir === "down" ? ChevronDown : ChevronRight;
  const clickable = onClick ? " cursor-pointer" : "";
  return (
    <>
      <Abs l={254 + indent} t={top + 7} w={14} h={14} className={onClick ? "cursor-pointer" : undefined} onClick={onClick}>
        <Caret className="h-[14px] w-[14px]" style={{ color: WHITE70 }} strokeWidth={2.2} />
      </Abs>
      <Abs l={281 + indent} t={top + 6.5} className={`text-[15px] font-medium leading-[15px]${clickable}`} style={{ color: WHITE70 }} onClick={onClick}>
        {label}
      </Abs>
      {plus && (
        <Abs l={473} t={top + 6} w={15} h={15}>
          <Plus className="h-[15px] w-[15px] text-[#BABABA]" strokeWidth={2} />
        </Abs>
      )}
      {userAdd && (
        <Abs l={473} t={top + 6} w={15} h={15}>
          <UserPlus className="h-[15px] w-[15px] text-[#BABABA]" strokeWidth={1.8} />
        </Abs>
      )}
    </>
  );
}

function AddRow({ top, label, indent = 0, onClick }: { top: number; label: string; indent?: number; onClick?: () => void }) {
  return (
    <>
      <Abs
        l={254 + indent}
        t={top + 5}
        w={20}
        h={20}
        className="flex items-center justify-center rounded-[4px] cursor-pointer"
        style={{ background: "rgba(255,255,255,0.1)" }}
        onClick={onClick}
      >
        <Plus className="h-[12px] w-[12px]" style={{ color: WHITE70 }} strokeWidth={2} />
      </Abs>
      <Abs l={280 + indent} t={top + 6.5} className="text-[15px] leading-[15px] cursor-pointer" style={{ color: WHITE70 }} onClick={onClick}>
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

/* -------------------------------- data --------------------------------- */
const SECTIONS: {
  top: number;
  label: string;
  dir: "down" | "right";
  plus?: boolean;
  userAdd?: boolean;
  indent?: number;
}[] = [
  { top: 176, label: "Notifications", dir: "down", plus: true },
  { top: 288, label: "Groups", dir: "down", userAdd: true },
  { top: 626, label: "Campaigns", dir: "down", plus: true },
  { top: 654, label: "Vishal Sharma", dir: "down" },
  { top: 682, label: "Nike Diwali", dir: "down", indent: 21 },
  { top: 794, label: "Ritika Verma", dir: "right" },
  { top: 822, label: "Neha", dir: "right" },
  { top: 850, label: "Ajay", dir: "right" },
];

const CHANNELS: { top: number; label: string; active?: boolean; indent?: number }[] = [
  { top: 204, label: "Agency announcements" },
  { top: 232, label: "skincare-campaign-poll" },
  { top: 316, label: "Welcome" },
  { top: 344, label: "General", active: true },
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
  { top: 766, label: "Add group", indent: 18 },
];

/* section-header rows that map to a real destination (headers with no target stay inert) */
const SECTION_ROUTES: Record<string, string> = {
  Campaigns: "/campaigns",
  "Vishal Sharma": "/campaigns/detail",
  "Nike Diwali": "/campaigns/detail",
  "Ritika Verma": "/chat",
  Neha: "/chat",
  Ajay: "/chat",
};

/** one poll option input row (gray field + label) — repeated markup, now data-driven */
function OptionRow({ top, label }: { top: number; label: string }) {
  return (
    <>
      <Abs l={378} t={top} w={682} h={46} className="rounded-[12px]" style={{ background: "#FAFAFA" }} />
      <Abs l={393} t={top + 9} className="text-[16px] font-light leading-[26px] text-black">
        {label}
      </Abs>
    </>
  );
}

/* fixed option-field positions the design shows (three rows) */
const OPTION_TOPS = [616, 668, 720];

/* -------------------------------- page --------------------------------- */
export default function GeneralPollPage() {
  const navigate = useNavigate();
  const [pollType, setPollType] = useState<"general" | "campaign">("general");
  const { data } = usePolls();
  // General-poll modal binds to the general poll (fallback: first poll available).
  const poll = (data ?? []).find((p) => p.kind === "general") ?? (data ?? [])[0];
  const question = poll?.question ?? "Ask a question";
  const optionRows = OPTION_TOPS.map((top, i) => ({ top, label: poll?.options[i] ?? "Add" }));
  return (
    <>
      {/* ================= page background (Figma frame 4756:12622 fill) ================= */}
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
      {SECTIONS.map((s) => {
        const route = SECTION_ROUTES[s.label];
        return <SectionRow key={`sec-${s.top}`} {...s} onClick={route ? () => navigate(route) : undefined} />;
      })}

      {/* channel rows */}
      {CHANNELS.map((c) => (
        <ChannelRow key={`ch-${c.top}`} {...c} onClick={() => navigate("/chat")} />
      ))}

      {/* add rows */}
      {ADDS.map((a) => (
        <AddRow key={`add-${a.top}`} {...a} onClick={() => navigate("/chat/create-channel")} />
      ))}

      {/* ---- Direct messages header + badge ---- */}
      <Abs l={254} t={491} w={14} h={14}>
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
      <Abs l={254} t={517.5} w={20} h={20} className="rounded-full" style={{ background: "linear-gradient(135deg,#F4B0C4,#B58BE0)" }} />
      <StatusDot l={268} t={531.5} />
      <Abs l={283} t={520.5} className="text-[15px] leading-[15px]" style={{ color: WHITE70 }}>
        Dev Singh
      </Abs>
      <Abs l={358} t={520.5} className="text-[15px] leading-[15px]" style={{ color: WHITE70 }}>
        you
      </Abs>

      {/* Sanjay Sharma */}
      <LetterAvatar l={254} t={545.5} size={20} letter="S" bg="#FFF4AD" color="#B49C01" font={12} />
      <StatusDot l={268} t={559.5} />
      <Abs l={283} t={548.5} className="text-[15px] leading-[15px]" style={{ color: WHITE70 }}>
        Sanjay Sharma
      </Abs>
      <Abs l={390} t={548.5} className="text-[15px] leading-[15px]" style={{ color: WHITE70 }}>
        you
      </Abs>

      {/* Pooja Singh */}
      <LetterAvatar l={254} t={573.5} size={20} letter="P" bg="#BCD4FD" color="#1155C8" font={12} />
      <StatusDot l={268} t={587.5} />
      <Abs l={283} t={576.5} className="text-[15px] leading-[15px]" style={{ color: WHITE70 }}>
        Pooja Singh
      </Abs>
      <Abs l={390} t={576.5} className="text-[15px] leading-[15px]" style={{ color: WHITE70 }}>
        you
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

      {/* member avatar stack (white pill) */}
      <Abs
        l={1250}
        t={128.5}
        w={96}
        h={32}
        className="rounded-[18px] bg-white"
        style={{ boxShadow: "inset 0 0 0 1px #EDEDED, 0 1px 3px rgba(0,0,0,0.06)" }}
      />
      <Abs l={1254} t={132} w={25} h={25} className="rounded-full" style={{ background: "linear-gradient(135deg,#FFE1B0,#E58BB0)", boxShadow: "0 0 0 2px #fff" }} />
      <LetterAvatar l={1270.9} t={132} size={25} letter="S" bg="#FFF4AD" color="#B49C01" font={15} ring />
      <LetterAvatar l={1287.9} t={132} size={25} letter="P" bg="#BCD4FD" color="#1155C8" font={15} ring />
      <LetterAvatar l={1300.3} t={132} size={25} letter="R" bg="#EFBEFF" color="#8701B4" font={15} ring />
      <LetterAvatar l={1317} t={132} size={25} letter="+15" bg="#E5E5E5" color="#000000" font={8.3} ring />

      {/* header divider */}
      <Abs l={497} t={169} w={863} h={1} style={{ background: "#EDEDED" }} />

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
      <Abs l={1271} t={964} w={14} h={14}>
        <BarChart2 className="h-[14px] w-[14px] text-[#5F5F5F]" strokeWidth={1.8} />
      </Abs>

      {/* ================= create general poll modal (4817:12476) ================= */}
      <Abs
        l={309}
        t={204}
        w={821}
        h={616}
        className="rounded-[24px] bg-white"
        style={{ boxShadow: "0 24px 70px rgba(0,0,0,0.18)" }}
      />

      {/* --- modal header --- */}
      <Abs l={328} t={238} className="text-[24px] font-medium leading-none text-black">
        Choose Poll Type
      </Abs>
      {/* Create Poll button */}
      <Abs
        l={857}
        t={232}
        w={188}
        h={48}
        className="flex items-center justify-center rounded-[24px] cursor-pointer"
        style={{ background: "rgba(0,0,0,0.95)" }}
        onClick={() => navigate("/polls/result")}
      >
        <span className="text-[20px] font-medium text-white">Create Poll</span>
      </Abs>
      {/* Close button */}
      <Abs
        l={1060}
        t={232}
        w={48}
        h={48}
        className="flex items-center justify-center rounded-full bg-white cursor-pointer"
        style={{ outline: "1px solid #ECECEC" }}
        onClick={() => navigate(-1)}
      >
        <X className="h-[18px] w-[18px] text-black" strokeWidth={2} />
      </Abs>

      {/* --- poll type cards --- */}
      {/* General Poll */}
      <Abs l={328} t={307} w={384} h={83} className="rounded-[24px] cursor-pointer" style={{ outline: pollType === "general" ? "1.5px solid #000000" : "1px solid #E4E4E4" }} onClick={() => setPollType("general")} />
      {pollType === "general" ? (
        <Abs l={344} t={339} w={20} h={20} className="flex items-center justify-center rounded-full border-2 border-black cursor-pointer" onClick={() => setPollType("general")}>
          <span className="h-[10px] w-[10px] rounded-full bg-black" />
        </Abs>
      ) : (
        <Abs l={344} t={339} w={20} h={20} className="rounded-full border-2 cursor-pointer" style={{ borderColor: "#79747E" }} onClick={() => setPollType("general")} />
      )}
      <Abs l={376} t={323} className="text-[20px] font-medium leading-[24px] text-black cursor-pointer" onClick={() => setPollType("general")}>
        General Poll
      </Abs>
      <Abs l={376} t={351} w={310} className="text-[12px] leading-[15px] cursor-pointer" style={{ color: "rgba(0,0,0,0.7)" }} onClick={() => setPollType("general")}>
        Ask members simple questions or gather quick opinions.
      </Abs>

      {/* Campaign Poll */}
      <Abs l={724} t={307} w={384} h={83} className="rounded-[24px] cursor-pointer" style={{ outline: pollType === "campaign" ? "1.5px solid #000000" : "1px solid #E4E4E4" }} onClick={() => setPollType("campaign")} />
      {pollType === "campaign" ? (
        <Abs l={738} t={339} w={20} h={20} className="flex items-center justify-center rounded-full border-2 border-black cursor-pointer" onClick={() => setPollType("campaign")}>
          <span className="h-[10px] w-[10px] rounded-full bg-black" />
        </Abs>
      ) : (
        <Abs l={738} t={339} w={20} h={20} className="rounded-full border-2 cursor-pointer" style={{ borderColor: "#79747E" }} onClick={() => setPollType("campaign")} />
      )}
      <Abs l={770} t={323} className="text-[20px] font-medium leading-[24px] text-black cursor-pointer" onClick={() => setPollType("campaign")}>
        Campaign Poll
      </Abs>
      <Abs l={770} t={351} w={348} className="text-[12px] leading-[15px] cursor-pointer" style={{ color: "rgba(0,0,0,0.7)" }} onClick={() => setPollType("campaign")}>
        Collect creator interest with campaign expectations
      </Abs>

      {/* --- poll details --- */}
      <Abs l={329} t={407} w={780} h={385} className="rounded-[12px]" style={{ outline: "1px solid #EAEAEA" }} />
      <Abs l={345} t={433} className="text-[24px] font-medium leading-[26px] text-black">
        Poll Details
      </Abs>

      {/* Question */}
      <Abs l={378} t={478} className="text-[24px] font-normal leading-[31px] text-black">
        Question
      </Abs>
      <Abs l={378} t={515} w={682} h={46} className="rounded-[12px]" style={{ background: "#FAFAFA" }} />
      <Abs l={393} t={524} className="text-[18px] font-light leading-[26px] text-black">
        {question}
      </Abs>

      {/* Options */}
      <Abs l={378} t={579} className="text-[20px] font-normal leading-[31px] text-black">
        Options
      </Abs>
      {optionRows.map((r) => (
        <OptionRow key={r.top} {...r} />
      ))}
    </>
  );
}
