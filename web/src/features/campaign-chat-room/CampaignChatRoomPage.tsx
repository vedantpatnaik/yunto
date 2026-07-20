import type { CSSProperties, ReactNode } from "react";
import { Fragment, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useChannels, useMessages } from "@/api/hooks";
import {
  ChevronDown,
  Hash,
  EllipsisVertical,
  Link2,
  AtSign,
  Smile,
  Paperclip,
  AlignLeft,
} from "lucide-react";

/**
 * Campaign Level — Chat Room (Brand chat room).
 * Exact reconstruction of Figma frame 3563:6496 ("Campaign Level_Chat Room Brand chat"), 1440×1024.
 * CLEAN underlying page — no profile popup / dim scrim was present on this frame.
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

/* stacked member avatar (25px circle with white ring) */
function StackAvatar({
  l,
  bg,
  children,
}: {
  l: number;
  bg: string;
  children?: ReactNode;
}) {
  return (
    <Abs
      l={l}
      t={131.6}
      w={25}
      h={25}
      className="flex items-center justify-center rounded-full"
      style={{ background: bg, boxShadow: "0 0 0 1.5px #fff" }}
    >
      {children}
    </Abs>
  );
}

/* -------------------------------- page --------------------------------- */
export default function CampaignChatRoomPage() {
  const navigate = useNavigate();
  const [groupsExpanded, setGroupsExpanded] = useState(true);

  // ---- live data ----
  const channels = useChannels().data ?? [];
  const [selectedChannelId, setSelectedChannelId] = useState<string | null>(null);
  const activeChannelId = selectedChannelId ?? channels[0]?.id ?? null;
  const activeChannel = channels.find((c) => c.id === activeChannelId);
  const messages = useMessages(activeChannelId).data ?? [];
  const fmtTime = (iso: string) =>
    new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });

  return (
    <>
      {/* ================= page background (frame 3563:6496 fill) ================= */}
      <Abs
        l={0}
        t={0}
        w={1440}
        h={1024}
        style={{
          background:
            "linear-gradient(135deg, #EAEAEA 0%, #EDF9FF 25%, rgba(201,218,227,0.9) 74%, #A4C5D9 100%)",
        }}
      />

      {/* ================= outer card ================= */}
      <Abs l={242} t={120} w={1118} h={883} className="rounded-[12px] bg-white" />

      {/* ================= dark workspace sidebar ================= */}
      <Abs l={242} t={120} w={255} h={883} className="rounded-l-[12px]" style={{ background: "#1B1B1B" }} />

      {/* workspace header */}
      <Abs
        l={256}
        t={130}
        className="text-[18px] font-bold leading-[24px] text-white cursor-pointer"
        onClick={() => navigate("/campaigns/detail")}
      >
        Nike Diwali
      </Abs>
      {/* header chevron — API fill #000000 (invisible on the dark panel), kept for structure */}
      <Abs l={353} t={146} w={14} h={14}>
        <ChevronDown className="h-[14px] w-[14px] text-[#1B1B1B]" strokeWidth={2.2} />
      </Abs>

      {/* Groups section header */}
      <Abs
        l={254}
        t={182}
        w={14}
        h={14}
        className="cursor-pointer"
        onClick={() => setGroupsExpanded((v) => !v)}
      >
        <ChevronDown className="h-[14px] w-[14px]" style={{ color: WHITE70 }} strokeWidth={2.4} />
      </Abs>
      <Abs
        l={281}
        t={182.5}
        className="text-[15px] font-medium leading-[15px] cursor-pointer"
        style={{ color: WHITE70 }}
        onClick={() => setGroupsExpanded((v) => !v)}
      >
        Groups
      </Abs>

      {/* channel rows (live channel names) */}
      {groupsExpanded &&
        channels.map((ch, i) => (
          <Fragment key={ch.id}>
            <Abs
              l={255}
              t={210 + i * 28}
              w={16}
              h={16}
              className="cursor-pointer"
              onClick={() => setSelectedChannelId(ch.id)}
            >
              <Hash className="h-[16px] w-[16px]" style={{ color: WHITE70 }} strokeWidth={1.8} />
            </Abs>
            <Abs
              l={280}
              t={210.5 + i * 28}
              className="text-[15px] leading-[15px] cursor-pointer"
              style={{ color: ch.id === activeChannelId ? "#fff" : WHITE70 }}
              onClick={() => setSelectedChannelId(ch.id)}
            >
              {ch.name}
            </Abs>
            <Abs l={473} t={211 + i * 28} w={15} h={15}>
              <EllipsisVertical className="h-[15px] w-[15px] text-[#BABABA]" strokeWidth={2.2} />
            </Abs>
          </Fragment>
        ))}

      {/* bottom user profile */}
      <Abs
        l={254}
        t={948}
        w={38}
        h={38}
        className="rounded-full cursor-pointer"
        style={{ background: "linear-gradient(135deg,#FCA5A5,#C084FC)" }}
        onClick={() => navigate("/settings")}
      />
      <Abs
        l={297}
        t={952.5}
        className="text-[12px] leading-[15px] text-white cursor-pointer"
        onClick={() => navigate("/settings")}
      >
        Nitin Yadav
      </Abs>
      <Abs
        l={297}
        t={968.5}
        className="text-[8px] leading-[13px] cursor-pointer"
        style={{ color: WHITE70 }}
        onClick={() => navigate("/settings")}
      >
        @nitin
      </Abs>

      {/* ================= message header ================= */}
      <Abs l={511} t={134.5} className="text-[16px] font-medium leading-[20px] text-[#1B1B1B]">
        {`#${activeChannel?.name ?? ""}`}
      </Abs>

      {/* member avatar stack (white pill) */}
      <Abs
        l={1253}
        t={128.5}
        w={93}
        h={32}
        className="rounded-[18px] bg-white"
        style={{ outline: "0.6px solid #E2E2E2" }}
      />
      <StackAvatar l={1256} bg="linear-gradient(135deg,#F9C5D1,#9795EF)" />
      <StackAvatar l={1272.9} bg="linear-gradient(135deg,#C8E6FF,#C8B3ED)" />
      <StackAvatar l={1289.9} bg="linear-gradient(135deg,#FFE0B2,#FF9A9E)" />
      <StackAvatar l={1302.3} bg="linear-gradient(135deg,#B7F8DB,#50A7C2)" />
      <StackAvatar l={1319} bg="#E5E5E5">
        <span className="text-[8.3px] leading-[13px] text-black">+8</span>
      </StackAvatar>

      {/* header divider */}
      <Abs l={497} t={169} w={863} h={1} style={{ background: "#D9D9D9" }} />

      {/* ================= messages (live authorName + body per message) ================= */}
      {messages.map((m, i) => (
        <Fragment key={m.id}>
          <Abs
            l={511}
            t={198 + i * 64}
            w={32}
            h={32}
            className="rounded-full"
            style={{ background: "linear-gradient(135deg,#FFD6A5,#C08457)" }}
          />
          <Abs l={551} t={198 + i * 64} className="text-[13px] font-bold leading-[16px] text-[#1B1B1B]">
            {m.authorName ?? ""}
          </Abs>
          <Abs l={579} t={199.5 + i * 64} className="text-[11px] font-medium leading-[13px] text-[#2E2E2E]">
            {fmtTime(m.createdAt)}
          </Abs>
          <Abs
            l={551}
            t={217 + i * 64}
            w={720}
            className="text-[13px] font-medium leading-[15.6px] text-[#131313]"
            style={{ whiteSpace: "pre-line" }}
          >
            {m.body}
          </Abs>
        </Fragment>
      ))}

      {/* ================= message input ================= */}
      <Abs
        l={515}
        t={952}
        w={783}
        h={38}
        className="rounded-[4px] bg-white"
        style={{ outline: "1px solid #555555" }}
      />
      <Abs l={525} t={961} w={1} h={20} style={{ background: "#4C4C4C" }} />
      <Abs l={531} t={963} className="text-[13px] font-medium leading-[16px] text-[#2E2E2E]">
        #announcement
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
        <AlignLeft className="h-[14px] w-[14px] text-[#5F5F5F]" strokeWidth={1.8} />
      </Abs>
    </>
  );
}
