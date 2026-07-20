import type { CSSProperties, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import type { LucideIcon } from "lucide-react";
import { useCampaigns, useChannels, useUsers } from "@/api/hooks";
import {
  Hash,
  ChevronDown,
  ChevronRight,
  Plus,
  UserPlus,
  MoreVertical,
  Link2,
  AtSign,
  Smile,
  Paperclip,
  BarChartHorizontal,
} from "lucide-react";

/**
 * Super Admin — Chat / Channel created.
 * Exact reconstruction of Figma frame 4883:86104 ("Super Admin-channel created"), 1440×1024.
 * CLEAN underlying page (no profile popup / no dim scrim).
 * TopBar (logo + right buttons) and the left icon rail live in AppShell and are NOT rendered here.
 */

const WHITE70 = "rgba(255,255,255,0.7)";
const WHITE50 = "rgba(255,255,255,0.5)";
const DOTS = "#BABABA";

/** first letter of a name as an uppercase avatar glyph */
const initial = (name?: string) => (name?.trim()?.[0] ?? "").toUpperCase();

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

/** three-dot vertical menu at the right edge of a sidebar row */
function Dots({ top }: { top: number }) {
  return (
    <Abs l={473} t={top + 6.5} w={15} h={15}>
      <MoreVertical className="h-[15px] w-[15px]" style={{ color: DOTS }} strokeWidth={2} />
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
      style={{ background: bg, color, fontSize: font, boxShadow: ring ? "0 0 0 1.5px #fff" : undefined }}
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

/* --------------------------- sidebar row kinds ------------------------- */
function SectionRow({
  top,
  label,
  dir,
  right,
  indent = 0,
  onClick,
}: {
  top: number;
  label: string;
  dir: "down" | "right";
  right?: "plus" | "userplus";
  indent?: number;
  onClick?: () => void;
}) {
  const Caret = dir === "down" ? ChevronDown : ChevronRight;
  const RightIcon: LucideIcon | undefined = right === "plus" ? Plus : right === "userplus" ? UserPlus : undefined;
  const clickable = onClick ? " cursor-pointer" : "";
  return (
    <>
      <Abs l={254 + indent} t={top + 7} w={14} h={14} className={onClick ? "cursor-pointer" : undefined} onClick={onClick}>
        <Caret className="h-[14px] w-[14px]" style={{ color: WHITE70 }} strokeWidth={2.2} />
      </Abs>
      <Abs l={281 + indent} t={top + 6.5} className={`text-[15px] font-medium leading-[15px]${clickable}`} style={{ color: WHITE70 }} onClick={onClick}>
        {label}
      </Abs>
      {RightIcon && (
        <Abs l={473} t={top + 6.5} w={15} h={15}>
          <RightIcon className="h-[15px] w-[15px]" style={{ color: DOTS }} strokeWidth={1.8} />
        </Abs>
      )}
    </>
  );
}

function ChannelRow({
  top,
  label,
  active,
  indent = 0,
  dots,
  onClick,
}: {
  top: number;
  label: string;
  active?: boolean;
  indent?: number;
  dots?: boolean;
  onClick?: () => void;
}) {
  const color = active ? "#FFFFFF" : WHITE70;
  return (
    <>
      {active && (
        <Abs l={242} t={top} w={247} h={28} className="rounded-[6px] cursor-pointer" style={{ background: "#656565" }} onClick={onClick} />
      )}
      <Abs l={254 + indent} t={top + 5} w={16} h={16} className="cursor-pointer" onClick={onClick}>
        <Hash className="h-[16px] w-[16px]" style={{ color: WHITE70 }} strokeWidth={1.7} />
      </Abs>
      <Abs l={280 + indent} t={top + 6.5} className="text-[15px] leading-[15px] cursor-pointer" style={{ color }} onClick={onClick}>
        {label}
      </Abs>
      {dots && <Dots top={top} />}
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

/* -------------------------------- data --------------------------------- */
/* structural section headers — these are labels, not data */
const SECTIONS: { top: number; label: string; dir: "down" | "right"; right?: "plus" | "userplus"; indent?: number }[] = [
  { top: 176, label: "Notifications", dir: "down", right: "plus" },
  { top: 288, label: "Groups", dir: "down", right: "userplus" },
  { top: 626, label: "Campaigns", dir: "down", right: "plus" },
];

/* campaign tree slots under the "Campaigns" header — labels come from live campaigns.
   "person" rows show the campaign's contact, the nested "name" row shows the campaign itself. */
const CAMPAIGN_ROWS: { top: number; dir: "down" | "right"; indent?: number; field: "person" | "name"; idx: number }[] = [
  { top: 654, dir: "down", field: "person", idx: 0 },
  { top: 682, dir: "down", indent: 21, field: "name", idx: 0 },
  { top: 794, dir: "right", field: "person", idx: 1 },
  { top: 822, dir: "right", field: "person", idx: 2 },
  { top: 850, dir: "right", field: "person", idx: 3 },
];

const CHANNELS: { top: number; label: string; active?: boolean; indent?: number; dots?: boolean }[] = [
  { top: 204, label: "Agency announcements", dots: true },
  { top: 232, label: "skincare-campaign-poll", active: true, dots: true },
  { top: 316, label: "Welcome", dots: true },
  { top: 344, label: "General", dots: true },
  { top: 372, label: "marketing", dots: true },
  { top: 400, label: "operations", dots: true },
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

const TOOLS: LucideIcon[] = [Link2, AtSign, Smile, Paperclip, BarChartHorizontal];

/* -------------------------------- page --------------------------------- */
export default function ChannelCreatedPage() {
  const navigate = useNavigate();
  const { data: channels = [] } = useChannels();
  const { data: users = [] } = useUsers();
  const { data: campaigns = [] } = useCampaigns();
  const activeSlot = CHANNELS.findIndex((c) => c.active);
  const activeChannelName = channels[activeSlot]?.name ?? "";
  return (
    <>
      {/* ================= page background (frame 4883:86104 fill) ================= */}
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
          onClick={s.label === "Campaigns" ? () => navigate("/campaigns") : undefined}
        />
      ))}

      {/* campaign tree — real campaigns mapped onto the design's row slots */}
      {CAMPAIGN_ROWS.map((r) => {
        const c = campaigns[r.idx];
        if (!c) return null;
        return (
          <SectionRow
            key={`camp-${r.top}`}
            top={r.top}
            label={r.field === "name" ? c.name : c.contactPerson ?? c.brandName}
            dir={r.dir}
            indent={r.indent}
            onClick={() => navigate(`/campaigns/detail?id=${c.id}`)}
          />
        );
      })}

      {/* channel rows — real channels mapped onto the design's row slots */}
      {channels.slice(0, CHANNELS.length).map((ch, i) => {
        const pos = CHANNELS[i];
        return (
          <ChannelRow
            key={ch.id}
            top={pos.top}
            label={ch.name}
            active={pos.active}
            indent={pos.indent}
            dots={pos.dots}
            onClick={() => navigate("/chat")}
          />
        );
      })}

      {/* add rows */}
      {ADDS.map((a) => (
        <AddRow key={`add-${a.top}`} {...a} onClick={() => navigate("/chat/create-channel")} />
      ))}

      {/* ---- Direct messages header + badge ---- */}
      <Abs l={254} t={493} w={14} h={14}>
        <ChevronRight className="h-[14px] w-[14px]" style={{ color: WHITE70 }} strokeWidth={2.2} />
      </Abs>
      <Abs l={281} t={492.5} className="text-[15px] font-medium leading-[15px]" style={{ color: WHITE70 }}>
        Direct messages
      </Abs>
      <Abs
        l={453}
        t={488}
        w={24}
        h={24}
        className="flex items-center justify-center rounded-full"
        style={{ background: "#E64E4E" }}
      >
        <span className="text-[10.3px] font-medium text-white">120</span>
      </Abs>

      {/* ---- DM rows ---- */}
      {/* Dev Singh (you) */}
      <Abs
        l={254}
        t={517}
        w={20}
        h={20}
        className="rounded-full"
        style={{ background: "linear-gradient(135deg,#C8E6FF,#C8B3ED)" }}
      />
      <StatusDot l={268} t={531.5} />
      <Abs l={283} t={520.5} className="text-[15px] leading-[15px]" style={{ color: WHITE70 }}>
        {users[0]?.name ?? ""}
      </Abs>
      <Abs l={358} t={520.5} className="text-[15px] leading-[15px]" style={{ color: WHITE50 }}>
        you
      </Abs>
      <Dots top={514} />

      {/* second member */}
      <LetterAvatar l={254} t={545.5} size={20} letter={initial(users[1]?.name)} bg="#FFF4AD" color="#B49C01" font={12} />
      <StatusDot l={268} t={559.5} />
      <Abs l={283} t={548.5} className="text-[15px] leading-[15px]" style={{ color: WHITE70 }}>
        {users[1]?.name ?? ""}
      </Abs>
      <Dots top={542} />

      {/* third member */}
      <LetterAvatar l={254} t={573.5} size={20} letter={initial(users[2]?.name)} bg="#BCD4FD" color="#1155C8" font={12} />
      <StatusDot l={268} t={587.5} />
      <Abs l={283} t={576.5} className="text-[15px] leading-[15px]" style={{ color: WHITE70 }}>
        {users[2]?.name ?? ""}
      </Abs>

      {/* ---- bottom user profile ---- */}
      <Abs
        l={254}
        t={948}
        w={38}
        h={38}
        className="rounded-full"
        style={{ background: "linear-gradient(135deg,#C8E6FF,#C8B3ED)" }}
      />
      <Abs l={297} t={952.5} className="text-[12px] leading-[15px] text-white">
        {users[0]?.name?.split(" ")[0] ?? ""}
      </Abs>
      <Abs l={297} t={968.5} className="text-[8px] leading-[13px]" style={{ color: WHITE70 }}>
        @{(users[0]?.name?.split(" ")[0] ?? "").toLowerCase()}
      </Abs>

      {/* ================= message header ================= */}
      <Abs l={511} t={134.5} className="text-[16px] font-medium leading-[20px] text-[#1B1B1B]">
        #{activeChannelName}
      </Abs>

      {/* member pill */}
      <Abs
        l={1176}
        t={128.5}
        w={170}
        h={32}
        className="rounded-[18px] bg-white"
        style={{ outline: "1px solid #ECECEC", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}
      />
      {/* rendered right-to-left so the leftmost avatar paints on top (matches Figma overlap) */}
      <LetterAvatar l={1245} t={132} size={24} letter={`+${Math.max(users.length - 4, 0)}`} bg="#E5E5E5" color="#000000" font={8.3} ring />
      <LetterAvatar l={1228} t={132} size={24} letter={initial(users[3]?.name)} bg="#EFBEFF" color="#8701B4" font={13} ring />
      <LetterAvatar l={1211} t={132} size={24} letter={initial(users[2]?.name)} bg="#BCD4FD" color="#1155C8" font={13} ring />
      <LetterAvatar l={1194} t={132} size={24} letter={initial(users[1]?.name)} bg="#FFF4AD" color="#B49C01" font={13} ring />
      <Abs
        l={1177}
        t={132}
        w={24}
        h={24}
        className="rounded-full"
        style={{ background: "linear-gradient(135deg,#FFE1B0,#E58BB0)", boxShadow: "0 0 0 1.5px #fff" }}
      />
      <Abs l={1274} t={137} className="text-[11px] font-medium leading-[13px] text-[#2E2E2E]">
        {users.length} Members
      </Abs>

      {/* header divider */}
      <Abs l={497} t={169} w={863} h={1} style={{ background: "#EDEDED" }} />

      {/* ================= chat body — channel-created notice ================= */}
      <Abs
        l={837}
        t={188}
        w={182}
        h={32}
        className="flex items-center justify-center rounded-[16px]"
        style={{ background: "rgba(255,255,255,0.95)", outline: "1px solid #EAEAEA", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
      >
        <span className="text-[12px] font-light leading-[15px]" style={{ color: "rgba(0,0,0,0.9)" }}>
          New Channel created just now
        </span>
      </Abs>

      {/* ================= message input ================= */}
      <Abs l={515} t={952} w={783} h={38} className="rounded-[4px] bg-white" style={{ outline: "1px solid #E3E3E3" }} />
      <Abs l={525} t={961} w={1} h={20} style={{ background: "#4C4C4C" }} />
      <Abs l={526} t={963} className="font-medium text-[13px] leading-[16px] text-[#2E2E2E]">
        Message #{activeChannelName}
      </Abs>
      {/* input tools */}
      {TOOLS.map((Icon, i) => (
        <Abs key={`tool-${i}`} l={1159 + i * 28} t={964} w={14} h={14}>
          <Icon className="h-[14px] w-[14px]" style={{ color: "#5F5F5F" }} strokeWidth={1.8} />
        </Abs>
      ))}
    </>
  );
}
