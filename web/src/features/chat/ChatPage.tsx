import type { CSSProperties, ReactNode } from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Hash,
  ChevronDown,
  ChevronRight,
  Plus,
  Video,
  CheckSquare,
  Link2,
  AtSign,
  Smile,
  Paperclip,
  BarChart2,
} from "lucide-react";
import { useChannels, useMessages } from "@/api/hooks";

/**
 * Super Admin — Team / Influencer Chat Room.
 * Exact reconstruction of Figma frame 5077:69008 ("Super Admin-Team/ Influencer Chat"), 1440×1024.
 * CLEAN underlying page: the captured profile popup + dim scrim (nodes 5077:68962…69005) are omitted.
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
  textLeft,
  chevron,
  onClick,
}: {
  top: number;
  label: string;
  active?: boolean;
  indent?: number;
  textLeft?: number;
  chevron?: boolean;
  onClick?: () => void;
}) {
  const color = active ? "#FFFFFF" : WHITE70;
  const tx = textLeft ?? 280 + indent;
  return (
    <>
      {active && (
        <Abs l={242} t={top} w={247} h={28} className="cursor-pointer rounded-[6px]" style={{ background: "#656565" }} onClick={onClick} />
      )}
      <Abs l={254 + indent} t={top + 5} w={16} h={16} className="cursor-pointer" onClick={onClick}>
        <Hash className="h-[16px] w-[16px]" style={{ color }} strokeWidth={1.7} />
      </Abs>
      <Abs l={tx} t={top + 6.5} className="cursor-pointer text-[15px] leading-[15px]" style={{ color }} onClick={onClick}>
        {label}
      </Abs>
      {chevron && (
        <Abs l={437} t={top + 6} w={14} h={14}>
          <ChevronDown className="h-[14px] w-[14px]" style={{ color: WHITE50 }} strokeWidth={2} />
        </Abs>
      )}
    </>
  );
}

function SectionRow({
  top,
  label,
  dir,
  plus,
  indent = 0,
  onPlus,
}: {
  top: number;
  label: string;
  dir: "down" | "right";
  plus?: boolean;
  indent?: number;
  onPlus?: () => void;
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
        <Abs l={473} t={top + 6} w={15} h={15} className="cursor-pointer" onClick={onPlus}>
          <Plus className="h-[15px] w-[15px] text-[#BABABA]" strokeWidth={2} />
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
      <Abs l={280 + indent} t={top + 6.5} className="cursor-pointer text-[15px] leading-[15px]" style={{ color: WHITE70 }} onClick={onClick}>
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

/** A single message row — reuses the Figma "message 1" markup (avatar + author + body). */
function MessageRow({ top, authorName, body }: { top: number; authorName: string; body: string }) {
  return (
    <>
      <Abs l={511} t={top} w={32} h={32} className="rounded-full" style={{ background: "linear-gradient(135deg,#C8E6FF,#C8B3ED)" }} />
      <Abs l={551} t={top} className="text-[13px] font-extrabold leading-[16px] text-[#1B1B1B]">
        {authorName}
      </Abs>
      <Abs l={551} t={top + 19} w={745} className="font-inter text-[13px] leading-[16px] text-[#131313]" style={{ whiteSpace: "pre-line" }}>
        {body}
      </Abs>
    </>
  );
}

/* -------------------------------- data --------------------------------- */
const SECTIONS: { top: number; label: string; dir: "down" | "right"; plus?: boolean; indent?: number }[] = [
  { top: 176, label: "Notifications", dir: "down", plus: true },
  { top: 260, label: "Groups", dir: "down" },
  { top: 604, label: "Campaigns", dir: "down", plus: true },
  { top: 632, label: "Vishal Sharma", dir: "down" },
  { top: 660, label: "Nike Diwali", dir: "down", indent: 21 },
  { top: 772, label: "Ritika Verma", dir: "right" },
  { top: 800, label: "Neha", dir: "right" },
  { top: 828, label: "Ajay", dir: "right" },
];

const CHANNELS: { top: number; label: string; active?: boolean; indent?: number; textLeft?: number; chevron?: boolean }[] = [
  { top: 204, label: "Agency announcements", textLeft: 285, chevron: true },
  { top: 288, label: "Welcome" },
  { top: 316, label: "General", active: true },
  { top: 344, label: "Marketing" },
  { top: 372, label: "Operations" },
  { top: 400, label: "Sales" },
  { top: 688, label: "Brand + Agencies", indent: 21 },
  { top: 716, label: "Only Agencies", indent: 20 },
];

const ADDS: { top: number; label: string; indent?: number }[] = [
  { top: 232, label: "Add Channel" },
  { top: 428, label: "Add group" },
  { top: 576, label: "Add person" },
  { top: 744, label: "Add group", indent: 20 },
];

/* -------------------------------- page --------------------------------- */
export default function ChatPage() {
  const navigate = useNavigate();
  const { data: channels = [] } = useChannels();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selectedChannelId = selectedId ?? channels[0]?.id ?? null;
  const { data: messages = [] } = useMessages(selectedChannelId);
  const selectedChannel = channels.find((c) => c.id === selectedChannelId);
  return (
    <>
      {/* ================= page background (Figma frame 5077:69008 fill) ================= */}
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
        <SectionRow key={`sec-${s.top}`} {...s} onPlus={() => navigate("/chat/create-channel")} />
      ))}

      {/* channel rows — real channels mapped onto the design's row slots */}
      {channels.slice(0, CHANNELS.length).map((ch, i) => {
        const pos = CHANNELS[i];
        return (
          <ChannelRow
            key={ch.id}
            top={pos.top}
            indent={pos.indent}
            textLeft={pos.textLeft}
            chevron={pos.chevron}
            label={ch.name}
            active={ch.id === selectedChannelId}
            onClick={() => setSelectedId(ch.id)}
          />
        );
      })}

      {/* add rows */}
      {ADDS.map((a) => (
        <AddRow key={`add-${a.top}`} {...a} onClick={() => navigate("/chat/create-channel")} />
      ))}

      {/* ---- Direct messages header + badge ---- */}
      <Abs l={254} t={471} w={14} h={14}>
        <ChevronRight className="h-[14px] w-[14px]" style={{ color: WHITE70 }} strokeWidth={2.2} />
      </Abs>
      <Abs l={281} t={470.5} className="text-[15px] font-medium leading-[15px]" style={{ color: WHITE70 }}>
        Direct messages
      </Abs>
      <Abs l={453} t={466} w={24} h={24} className="flex items-center justify-center rounded-full" style={{ background: "#E64E4E" }}>
        <span className="text-[10.3px] font-medium text-white">120</span>
      </Abs>

      {/* ---- DM rows ---- */}
      {/* Dev Singh (you) */}
      <Abs l={254} t={495} w={20} h={20} className="rounded-full" style={{ background: "linear-gradient(135deg,#F4B0C4,#B58BE0)" }} />
      <StatusDot l={268} t={509.5} />
      <Abs l={283} t={498.5} className="text-[15px] leading-[15px]" style={{ color: WHITE70 }}>
        Dev Singh
      </Abs>
      <Abs l={358} t={498.5} className="text-[15px] leading-[15px]" style={{ color: WHITE50 }}>
        you
      </Abs>

      {/* Sanjay Sharma */}
      <LetterAvatar l={254} t={523.5} size={20} letter="S" bg="#FFF4AD" color="#B49C01" font={12} />
      <StatusDot l={268} t={537.5} />
      <Abs l={283} t={526.5} className="text-[15px] leading-[15px]" style={{ color: WHITE70 }}>
        Sanjay Sharma
      </Abs>

      {/* Pooja Singh */}
      <LetterAvatar l={254} t={551.5} size={20} letter="P" bg="#BCD4FD" color="#1155C8" font={12} />
      <StatusDot l={268} t={565.5} />
      <Abs l={283} t={554.5} className="text-[15px] leading-[15px]" style={{ color: WHITE70 }}>
        Pooja Singh
      </Abs>

      {/* ---- bottom user profile ---- */}
      <Abs l={254} t={948} w={38} h={38} className="cursor-pointer rounded-full" style={{ background: "linear-gradient(135deg,#C8E6FF,#C8B3ED)" }} onClick={() => navigate("/settings")} />
      <Abs l={297} t={952.5} className="text-[12px] leading-[15px] text-white">
        Dev
      </Abs>
      <Abs l={297} t={968.5} className="text-[8px] leading-[13px]" style={{ color: WHITE70 }}>
        @dev
      </Abs>

      {/* ================= message header ================= */}
      <Abs l={511} t={134.5} className="text-[16px] font-medium leading-[20px] text-[#1B1B1B]">
        #{selectedChannel?.name ?? ""}
      </Abs>

      {/* member avatar stack */}
      <Abs l={1254} t={132} w={25} h={25} className="rounded-full" style={{ background: "linear-gradient(135deg,#FFE1B0,#E58BB0)", boxShadow: "0 0 0 2px #fff" }} />
      <LetterAvatar l={1270.9} t={132} size={25} letter="S" bg="#FFF4AD" color="#B49C01" font={15} ring />
      <LetterAvatar l={1287.9} t={132} size={25} letter="P" bg="#BCD4FD" color="#1155C8" font={15} ring />
      <LetterAvatar l={1300.3} t={132} size={25} letter="R" bg="#EFBEFF" color="#8701B4" font={15} ring />
      <LetterAvatar l={1317} t={132} size={25} letter="+15" bg="#E5E5E5" color="#000000" font={8.3} ring />

      {/* header divider */}
      <Abs l={497} t={169} w={863} h={1} style={{ background: "#EDEDED" }} />

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

      {/* tab-strip divider */}
      <Abs l={497} t={199} w={863} h={1} style={{ background: "#EDEDED" }} />

      {/* ================= messages (live per selected channel) ================= */}
      {messages.map((m, i) => (
        <MessageRow key={m.id} top={238 + i * 80} authorName={m.authorName ?? "Member"} body={m.body} />
      ))}

      {/* ================= message input ================= */}
      <Abs l={515} t={952} w={783} h={38} className="rounded-[4px] bg-white" style={{ outline: "1px solid #E3E3E3" }} />
      <Abs l={525} t={961} w={1} h={20} style={{ background: "#4C4C4C" }} />
      <Abs l={533} t={963} className="text-[13px] font-medium leading-[16px] text-[#2E2E2E]">
        Message #{selectedChannel?.name ?? ""}
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
        <BarChart2 className="h-[14px] w-[14px] text-[#5F5F5F]" strokeWidth={1.8} />
      </Abs>
    </>
  );
}
