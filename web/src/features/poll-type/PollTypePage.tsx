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

/**
 * Super Admin — Choose Poll Type (create-poll dialog over #skincare-campaign-poll chat).
 * Exact reconstruction of Figma frame 4815:10879 ("Super Admin-poll type"), 1440×1024.
 * CLEAN underlying page: the captured 50%-black dim scrim (node 4815:11122) is omitted so the
 * chat renders at full opacity; the "Choose Poll Type" modal (4817:12253) — with Campaign Poll
 * selected and the full Campaign Details form — is the screen content.
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
}: {
  top: number;
  label: string;
  active?: boolean;
  indent?: number;
}) {
  const color = active ? "#FFFFFF" : WHITE70;
  return (
    <>
      {active && (
        <Abs l={242} t={top} w={247} h={28} className="rounded-[6px]" style={{ background: "#656565" }} />
      )}
      <Abs l={254 + indent} t={top + 5} w={16} h={16}>
        <Hash className="h-[16px] w-[16px]" style={{ color }} strokeWidth={1.7} />
      </Abs>
      <Abs l={280 + indent} t={top + 6.5} className="text-[15px] leading-[15px]" style={{ color }}>
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
}: {
  top: number;
  label: string;
  dir: "down" | "right";
  plus?: boolean;
  userAdd?: boolean;
  indent?: number;
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

function AddRow({ top, label, indent = 0 }: { top: number; label: string; indent?: number }) {
  return (
    <>
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

/** #FAFAFA rounded input box with a vertically-centered placeholder */
function Field({
  l,
  t,
  w,
  placeholder,
  color,
  size,
}: {
  l: number;
  t: number;
  w: number;
  placeholder: string;
  color: string;
  size: number;
}) {
  return (
    <Abs
      l={l}
      t={t}
      w={w}
      h={45.6}
      className="flex items-center rounded-[12px] pl-[15px]"
      style={{ background: "#FAFAFA" }}
    >
      <span className="font-light" style={{ color, fontSize: size, lineHeight: 1 }}>
        {placeholder}
      </span>
    </Abs>
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

/* -------------------------------- page --------------------------------- */
export default function PollTypePage() {
  const navigate = useNavigate();
  const [pollType, setPollType] = useState<"general" | "campaign">("campaign");
  const [payType, setPayType] = useState<"barter" | "paid" | "hybrid">("barter");
  return (
    <>
      {/* ================= page background (Figma frame 4815:10879 fill) ================= */}
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
        <SectionRow key={`sec-${s.top}`} {...s} />
      ))}

      {/* channel rows */}
      {CHANNELS.map((c) => (
        <ChannelRow key={`ch-${c.top}`} {...c} />
      ))}

      {/* add rows */}
      {ADDS.map((a) => (
        <AddRow key={`add-${a.top}`} {...a} />
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
      <Abs l={1250} t={128.5} w={96} h={32} className="rounded-[18px] bg-white" />
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

      {/* ================= Choose Poll Type modal (4817:12253) ================= */}
      <Abs
        l={310}
        t={103}
        w={821}
        h={818}
        className="rounded-[24px] bg-white"
        style={{ boxShadow: "0 24px 70px rgba(0,0,0,0.18)" }}
      />

      {/* --- modal header --- */}
      <Abs l={329} t={138} className="text-[24px] font-medium leading-none text-black">
        Choose Poll Type
      </Abs>
      {/* Create Poll button */}
      <Abs
        l={858}
        t={131}
        w={188}
        h={48}
        onClick={() => navigate("/chat")}
        className="flex cursor-pointer items-center justify-center rounded-[24px]"
        style={{ background: "rgba(0,0,0,0.95)" }}
      >
        <span className="text-[20px] font-medium text-white">Create Poll</span>
      </Abs>
      {/* Close button */}
      <Abs
        l={1061}
        t={131}
        w={48}
        h={48}
        onClick={() => navigate(-1)}
        className="flex cursor-pointer items-center justify-center rounded-full bg-white"
        style={{ outline: "1px solid #ECECEC" }}
      >
        <X className="h-[18px] w-[18px] text-black" strokeWidth={2} />
      </Abs>

      {/* --- poll type cards --- */}
      {/* General Poll (unselected) */}
      <Abs l={329} t={206} w={384} h={83} onClick={() => setPollType("general")} className="cursor-pointer rounded-[24px]" style={{ outline: pollType === "general" ? "1.5px solid #000000" : "1px solid #E4E4E4" }} />
      {pollType === "general" ? (
        <Abs l={343} t={238} w={20} h={20} onClick={() => setPollType("general")} className="flex cursor-pointer items-center justify-center rounded-full border-2 border-black">
          <span className="h-[10px] w-[10px] rounded-full bg-black" />
        </Abs>
      ) : (
        <Abs l={343} t={238} w={20} h={20} onClick={() => setPollType("general")} className="cursor-pointer rounded-full border-2" style={{ borderColor: "#79747E" }} />
      )}
      <Abs l={377} t={222} onClick={() => setPollType("general")} className="cursor-pointer text-[20px] font-medium leading-[24px] text-black">
        General Poll
      </Abs>
      <Abs l={377} t={250} w={310} onClick={() => setPollType("general")} className="cursor-pointer text-[12px] leading-[15px]" style={{ color: "rgba(0,0,0,0.7)" }}>
        Ask members simple questions or gather quick opinions.
      </Abs>

      {/* Campaign Poll (selected) */}
      <Abs l={725} t={206} w={384} h={83} onClick={() => setPollType("campaign")} className="cursor-pointer rounded-[24px]" style={{ outline: pollType === "campaign" ? "1.5px solid #000000" : "1px solid #E4E4E4" }} />
      {pollType === "campaign" ? (
        <Abs l={737} t={238} w={20} h={20} onClick={() => setPollType("campaign")} className="flex cursor-pointer items-center justify-center rounded-full border-2 border-black">
          <span className="h-[10px] w-[10px] rounded-full bg-black" />
        </Abs>
      ) : (
        <Abs l={737} t={238} w={20} h={20} onClick={() => setPollType("campaign")} className="cursor-pointer rounded-full border-2" style={{ borderColor: "#79747E" }} />
      )}
      <Abs l={771} t={222} onClick={() => setPollType("campaign")} className="cursor-pointer text-[20px] font-medium leading-[24px] text-black">
        Campaign Poll
      </Abs>
      <Abs l={771} t={250} w={348} onClick={() => setPollType("campaign")} className="cursor-pointer text-[12px] leading-[15px]" style={{ color: "rgba(0,0,0,0.7)" }}>
        Collect creator interest with  campaign expectations
      </Abs>

      {/* --- campaign details --- */}
      <Abs l={330} t={306} w={780} h={587} className="rounded-[12px]" style={{ outline: "1px solid #EAEAEA" }} />
      <Abs l={346} t={332} className="text-[24px] font-medium leading-[26px] text-black">
        Campaign Details
      </Abs>

      {/* segmented control Barter / Paid / Hybrid */}
      <Abs l={754} t={325} w={324} h={40} className="rounded-[28px]" style={{ background: "rgba(255,255,255,0.9)", outline: "1px solid #E7E7E7" }} />
      <Abs
        l={payType === "barter" ? 754 : payType === "paid" ? 868 : 973}
        t={325}
        w={payType === "barter" ? 114 : 105}
        h={40}
        className="rounded-[28px]"
        style={{ background: "#0F0E0E" }}
      />
      <Abs l={754} t={325} w={114} h={40} onClick={() => setPayType("barter")} className="flex cursor-pointer items-center justify-center rounded-[28px]">
        <span className={`text-[16px] leading-[20px] ${payType === "barter" ? "text-white" : "font-light text-black"}`}>Barter</span>
      </Abs>
      <Abs l={868} t={325} w={105} h={40} onClick={() => setPayType("paid")} className="flex cursor-pointer items-center justify-center">
        <span className={`text-[16px] leading-[20px] ${payType === "paid" ? "text-white" : "font-light text-black"}`}>Paid</span>
      </Abs>
      <Abs l={973} t={325} w={105} h={40} onClick={() => setPayType("hybrid")} className="flex cursor-pointer items-center justify-center">
        <span className={`text-[16px] leading-[20px] ${payType === "hybrid" ? "text-white" : "font-light text-black"}`}>Hybrid</span>
      </Abs>

      {/* row 1 — Barter Value / Deliverables Per Creator */}
      <Abs l={379} t={384} className="text-[20px] font-normal leading-none text-black">
        Barter Value
      </Abs>
      <Field l={379} t={421.4} w={333} placeholder="₹  e.g. 5000" color="#000000" size={16} />

      <Abs l={728} t={384} className="text-[20px] font-normal leading-none text-black">
        Deliverables Per Creator
      </Abs>
      <Field l={728} t={421.4} w={333} placeholder="e.g., 2 Reels, 1 Story" color="#000000" size={16} />
      <Abs l={1025} t={434} w={20} h={20} className="flex items-center justify-center rounded-full" style={{ background: "#181717" }}>
        <Plus className="h-[9px] w-[9px]" style={{ color: "rgba(255,255,255,0.9)" }} strokeWidth={2.4} />
      </Abs>

      {/* row 2 — Brand Name / Brand Website */}
      <Abs l={379} t={485} className="text-[20px] font-normal leading-none text-black">
        Brand Name
      </Abs>
      <Field l={379} t={522.4} w={333} placeholder="Enter brand name" color="rgba(0,0,0,0.7)" size={16} />

      <Abs l={728} t={485} className="text-[20px] font-normal leading-none text-black">
        Brand Website
      </Abs>
      <Field l={728} t={522.4} w={333} placeholder="www.brandname.com" color="#000000" size={16} />

      {/* Question */}
      <Abs l={379} t={586} className="text-[24px] font-normal leading-none text-black">
        Question
      </Abs>
      <Field l={379} t={623.4} w={682} placeholder="Ask a question" color="#000000" size={17.9} />

      {/* Options */}
      <Abs l={379} t={687} className="text-[20px] font-normal leading-none text-black">
        Options
      </Abs>
      <Field l={379} t={724.4} w={682} placeholder="Add" color="#000000" size={16} />
      <Field l={379} t={776.5} w={682} placeholder="Add" color="#000000" size={16} />
      <Field l={379} t={828} w={682} placeholder="Add" color="#000000" size={16} />
    </>
  );
}
