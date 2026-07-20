import type { CSSProperties, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import {
  Hash,
  ChevronDown,
  ChevronRight,
  Plus,
  UserPlus,
  X,
  Search,
  ArrowUpRight,
} from "lucide-react";
import icLuggage from "@/assets/icons/contacted-leads-luggage.svg";
import icCosmetic from "@/assets/icons/contacted-leads-cosmetic.svg";
import icHanger from "@/assets/icons/contacted-leads-hanger.svg";
import { useCampaigns, usePolls } from "@/api/hooks";

/**
 * Super Admin — Connect lead (poll) / Select Campaign modal.
 * Exact reconstruction of Figma frame 6999:9838 ("Super Admin-connect lead(poll)"), 1440×1024.
 *
 * The underlying page is a Slack-style channel workspace showing a POLL message; on top of it
 * sits the real "Select Campaign" modal (this screen's purpose) over a 50% dim scrim.
 * The captured profile popup is NOT present on this frame, so nothing is skipped there.
 * TopBar (logo + right buttons) and the left icon rail live in AppShell and are NOT rendered here;
 * the scrim/modal use a high z-index so they dim that AppShell chrome too, matching the frame.
 */

const W70 = "rgba(255,255,255,0.7)";
const W50 = "rgba(255,255,255,0.5)";
const AVATAR = "linear-gradient(135deg,#C8E6FF,#C8B3ED)";

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
function SectionRow({
  top,
  label,
  dir,
  indent = 0,
}: {
  top: number;
  label: string;
  dir: "down" | "right";
  indent?: number;
}) {
  const Caret = dir === "down" ? ChevronDown : ChevronRight;
  return (
    <>
      <Abs l={254 + indent} t={top + 7} w={14} h={14}>
        <Caret className="h-[14px] w-[14px]" style={{ color: W70 }} strokeWidth={2.2} />
      </Abs>
      <Abs l={281 + indent} t={top + 6.5} className="text-[15px] font-medium leading-[15px]" style={{ color: W70 }}>
        {label}
      </Abs>
      <Abs l={344 + indent} t={top + 7} w={14} h={14}>
        <ChevronDown className="h-[14px] w-[14px]" style={{ color: W50 }} strokeWidth={2.2} />
      </Abs>
    </>
  );
}

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
  const color = active ? "#FFFFFF" : W70;
  return (
    <>
      {active && <Abs l={242} t={top} w={247} h={28} className="rounded-[6px]" style={{ background: "#656565" }} />}
      <Abs l={254 + indent} t={top + 5} w={16} h={16}>
        <Hash className="h-[16px] w-[16px]" style={{ color }} strokeWidth={1.7} />
      </Abs>
      <Abs l={280 + indent} t={top + 6.5} className="text-[15px] leading-[15px]" style={{ color }}>
        {label}
      </Abs>
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
        <Plus className="h-[12px] w-[12px]" style={{ color: W70 }} strokeWidth={2} />
      </Abs>
      <Abs l={280 + indent} t={top + 6.5} className="text-[15px] leading-[15px]" style={{ color: W70 }}>
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

/** green presence dot with a dark ring, bottom-right of a sidebar avatar */
function StatusDot({ l, t }: { l: number; t: number }) {
  return (
    <>
      <Abs l={l - 1.4} t={t - 1.4} w={9.8} h={9.8} className="rounded-full" style={{ background: "#1B1B1B" }} />
      <Abs l={l} t={t} w={7} h={7} className="rounded-full" style={{ background: "#2EB67D" }} />
    </>
  );
}

/* ------------------------------- modal card ---------------------------- */
function CampaignCard({
  top,
  icon,
  title,
  budget,
  creators,
  live,
  timeline,
  addTop,
  onCard,
  onArrow,
  onAdd,
}: {
  top: number;
  icon: string;
  title: string;
  budget: string;
  creators: string;
  live?: boolean;
  timeline: string;
  addTop: number;
  onCard: () => void;
  onArrow: () => void;
  onAdd: () => void;
}) {
  return (
    <>
      {/* card body */}
      <Abs
        l={467}
        t={top}
        w={394.9}
        h={116.9}
        className="rounded-[13.2px] bg-white cursor-pointer"
        style={{ outline: "1px solid #EFEFEF", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}
        onClick={onCard}
      />
      {/* icon */}
      <Abs
        l={478.5}
        t={top + 9.9}
        w={38.2}
        h={38.2}
        className="flex items-center justify-center rounded-full bg-white"
        style={{ outline: "1px solid #EFEFEF", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
      >
        <img src={icon} alt="" className="h-[24px] w-[24px]" />
      </Abs>
      {/* title */}
      <Abs l={524.7} t={top + 8.2} className="text-[16.2px] font-medium leading-[20px]" style={{ color: "rgba(0,0,0,0.9)" }}>
        {title}
      </Abs>
      {/* live badge */}
      {live && (
        <Abs
          l={616}
          t={top + 8.3}
          h={21}
          className="flex items-center gap-[6px] rounded-full px-[8px]"
          style={{ background: "#F0FDF4" }}
        >
          <span className="h-[6px] w-[6px] rounded-full" style={{ background: "#22C55E" }} />
          <span className="font-inter text-[10px] font-bold leading-[15px]" style={{ color: "#15803D" }}>
            Live
          </span>
        </Abs>
      )}
      {/* budget */}
      <Abs l={524.7} t={top + 31} className="font-inter text-[10.8px] leading-[15px]" style={{ color: "rgba(0,0,0,0.7)" }}>
        {budget}
      </Abs>
      {/* Paid chip */}
      <Abs
        l={478.5}
        t={top + 69.6}
        w={63.1}
        h={32.2}
        className="flex items-center justify-center rounded-full bg-white text-[14.8px] text-black"
        style={{ outline: "1px solid #EFEFEF" }}
      >
        Paid
      </Abs>
      {/* date chip */}
      <Abs
        l={547.5}
        t={top + 69.2}
        w={104.4}
        h={33}
        className="flex items-center justify-center rounded-full bg-white text-[13.7px]"
        style={{ outline: "1px solid #EFEFEF", color: "rgba(0,0,0,0.8)" }}
      >
        {timeline}
      </Abs>
      {/* avatar stack pill */}
      <Abs
        l={750}
        t={top + 8.3}
        w={96}
        h={32}
        className="rounded-[18px] bg-white"
        style={{ outline: "1px solid #EFEFEF" }}
      >
        <div className="absolute left-[3px] top-[3px] h-[25px] w-[25px] rounded-full" style={{ background: "linear-gradient(135deg,#FFE1B0,#E58BB0)", boxShadow: "0 0 0 2px #fff" }} />
        <div className="absolute left-[19.9px] top-[3px] h-[25px] w-[25px] rounded-full" style={{ background: "linear-gradient(135deg,#C8E6FF,#C8B3ED)", boxShadow: "0 0 0 2px #fff" }} />
        <div className="absolute left-[36.9px] top-[3px] h-[25px] w-[25px] rounded-full" style={{ background: "linear-gradient(135deg,#D6F5C8,#8BD0E0)", boxShadow: "0 0 0 2px #fff" }} />
        <div className="absolute left-[49.3px] top-[3px] h-[25px] w-[25px] rounded-full" style={{ background: "linear-gradient(135deg,#EFBEFF,#B58BE0)", boxShadow: "0 0 0 2px #fff" }} />
        <div className="absolute left-[66px] top-[3px] flex h-[25px] w-[25px] items-center justify-center rounded-full text-[8.3px] text-black" style={{ background: "#E5E5E5", boxShadow: "0 0 0 2px #fff" }}>
          +5
        </div>
      </Abs>
      {/* up-right button */}
      <Abs
        l={816.4}
        t={top + 71.4}
        w={29.5}
        h={29.5}
        className="flex items-center justify-center rounded-full bg-white cursor-pointer"
        style={{ outline: "1px solid #EFEFEF", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
        onClick={onArrow}
      >
        <ArrowUpRight className="h-[15px] w-[15px] text-black" strokeWidth={1.8} />
      </Abs>
      {/* creators count */}
      <Abs l={750} t={top + 82.3} className="font-inter text-[10px] font-medium leading-[15px]" style={{ color: "#94A3B8" }}>
        {creators}
      </Abs>
      {/* Add button */}
      <Abs
        l={870}
        t={addTop}
        w={108}
        h={48}
        className="flex items-center justify-center rounded-[24px] text-[20px] text-black cursor-pointer"
        style={{ background: "rgba(255,255,255,0.95)", outline: "1px solid #E7E7E7", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}
        onClick={onAdd}
      >
        Add
      </Abs>
    </>
  );
}

/* -------------------------------- data --------------------------------- */
const SECTIONS: { top: number; label: string; dir: "down" | "right"; indent?: number }[] = [
  { top: 176, label: "Notifications", dir: "down" },
  { top: 288, label: "Groups", dir: "down" },
  { top: 486, label: "Direct messages", dir: "right" },
  { top: 626, label: "Campaigns", dir: "down" },
  { top: 654, label: "Vishal Sharma", dir: "down" },
  { top: 682, label: "Nike Diwali", dir: "down", indent: 21 },
  { top: 794, label: "Ritika Verma", dir: "right" },
  { top: 822, label: "Neha", dir: "right" },
  { top: 850, label: "Ajay", dir: "right" },
];

const CHANNELS: { top: number; label: string; active?: boolean; indent?: number }[] = [
  { top: 204, label: "Agency announcemets" },
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
  { top: 766, label: "Add group", indent: 20 },
];

const DMS: { top: number; name: string; letter?: string; bg?: string; color?: string; nameW: number }[] = [
  { top: 514, name: "Dev Singh", nameW: 75 },
  { top: 542, name: "Sanjay Sharma", letter: "S", bg: "#FFF4AD", color: "#B49C01", nameW: 107 },
  { top: 570, name: "Pooja Singh", letter: "P", bg: "#BCD4FD", color: "#1155C8", nameW: 107 },
];

/** Fixed positions/icons for the 3 campaign cards the design shows (data fills the rest). */
const CARD_SLOTS: { top: number; addTop: number; icon: string }[] = [
  { top: 324.7, addTop: 359, icon: icLuggage },
  { top: 451.4, addTop: 479, icon: icCosmetic },
  { top: 578.1, addTop: 605, icon: icHanger },
];

function RightPlus({ top }: { top: number }) {
  return (
    <Abs l={473} t={top} w={15} h={15}>
      <Plus className="h-[15px] w-[15px] text-[#BABABA]" strokeWidth={2} />
    </Abs>
  );
}

/* -------------------------------- page --------------------------------- */
export default function ConnectLeadPollPage() {
  const navigate = useNavigate();
  const lakhs = (n: number) => "₹" + (n / 1e5).toFixed(1) + "L";

  const { data: campaignData } = useCampaigns();
  const { data: pollData } = usePolls();
  const campaigns = (campaignData ?? []).slice(0, CARD_SLOTS.length);
  const poll = (pollData ?? [])[0];
  const pollOptions = poll?.options ?? [];
  const pollVotes = (poll?.results ?? []).reduce((a, b) => a + b, 0);

  return (
    <>
      {/* ================= frame background gradient ================= */}
      <Abs
        l={0}
        t={0}
        w={1440}
        h={1024}
        style={{
          background:
            "linear-gradient(135deg, #EAEAEA 0%, #EDF9FF 38%, rgba(201,218,227,0.9) 74%, #A4C5D9 100%)",
        }}
      />

      {/* ================= outer content card ================= */}
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
        <ChevronDown className="h-[14px] w-[14px]" style={{ color: W70 }} strokeWidth={2.2} />
      </Abs>

      {/* section headers + channels + adds */}
      {SECTIONS.map((s) => (
        <SectionRow key={`sec-${s.top}`} {...s} />
      ))}
      {CHANNELS.map((c) => (
        <ChannelRow key={`ch-${c.top}`} {...c} />
      ))}
      {ADDS.map((a) => (
        <AddRow key={`add-${a.top}`} {...a} />
      ))}

      {/* section right-side affordances */}
      <RightPlus top={182.5} />
      <RightPlus top={632.5} />
      <Abs l={473} t={294.5} w={15} h={15}>
        <UserPlus className="h-[15px] w-[15px] text-[#BABABA]" strokeWidth={1.6} />
      </Abs>

      {/* Direct messages unread badge */}
      <Abs l={453} t={488} w={24} h={24} className="flex items-center justify-center rounded-full" style={{ background: "#E64E4E" }}>
        <span className="text-[10.3px] font-medium text-white">120</span>
      </Abs>

      {/* ---- DM rows ---- */}
      {DMS.map((d) => (
        <div key={`dm-${d.top}`}>
          {d.letter ? (
            <LetterAvatar l={254} t={d.top + 3.5} size={20} letter={d.letter} bg={d.bg!} color={d.color!} font={12} />
          ) : (
            <Abs l={254} t={d.top + 3.5} w={20} h={20} className="rounded-full" style={{ background: "linear-gradient(135deg,#F4B0C4,#B58BE0)" }} />
          )}
          <StatusDot l={268} t={d.top + 17.5} />
          <Abs l={283} t={d.top + 6.5} className="text-[15px] leading-[15px]" style={{ color: W70 }}>
            {d.name}
          </Abs>
          <Abs l={283 + d.nameW} t={d.top + 6.5} className="text-[15px] leading-[15px]" style={{ color: W70 }}>
            you
          </Abs>
          <Abs l={430} t={d.top + 4} w={20} h={20}>
            <X className="h-[16px] w-[16px]" style={{ color: W70 }} strokeWidth={2} />
          </Abs>
        </div>
      ))}

      {/* ---- bottom user profile ---- */}
      <Abs l={254} t={948} w={38} h={38} className="rounded-full" style={{ background: AVATAR }} />
      <Abs l={297} t={952.5} className="text-[12px] leading-[15px] text-white">
        Dev
      </Abs>
      <Abs l={297} t={968.5} className="text-[8px] leading-[13px]" style={{ color: W70 }}>
        @dev
      </Abs>

      {/* ================= message header ================= */}
      <Abs l={511} t={134.5} className="text-[16px] font-medium leading-[20px] text-[#1B1B1B]">
        #skincare-campaign-poll
      </Abs>
      {/* member avatar pill (top-right of header) */}
      <Abs l={1250} t={128.5} w={96} h={32} className="rounded-[18px] bg-white" style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }} />
      <Abs l={1254} t={132} w={25} h={25} className="rounded-full" style={{ background: "linear-gradient(135deg,#FFE1B0,#E58BB0)", boxShadow: "0 0 0 2px #fff" }} />
      <LetterAvatar l={1270.9} t={132} size={25} letter="S" bg="#FFF4AD" color="#B49C01" font={15} ring />
      <LetterAvatar l={1287.9} t={132} size={25} letter="P" bg="#BCD4FD" color="#1155C8" font={15} ring />
      <LetterAvatar l={1300.3} t={132} size={25} letter="R" bg="#EFBEFF" color="#8701B4" font={15} ring />
      <LetterAvatar l={1317} t={132} size={25} letter="+15" bg="#E5E5E5" color="#000000" font={8.3} ring />
      {/* header divider */}
      <Abs l={497} t={169} w={863} h={1} style={{ background: "#EDEDED" }} />

      {/* ================= poll message ================= */}
      {/* author avatar */}
      <Abs l={511} t={194} w={32} h={32} className="rounded-full" style={{ background: AVATAR }} />
      <Abs l={551} t={194} className="text-[13px] font-extrabold leading-[16px] text-[#1B1B1B]">
        Dev
      </Abs>
      <Abs l={579} t={195.5} className="text-[11px] font-medium leading-[13px] text-[#2E2E2E]">
        11:55
      </Abs>
      {/* POLL tag */}
      <Abs l={614} t={196} w={30} h={13} className="flex items-center justify-center rounded-[3px]" style={{ background: "#DFDFDF" }}>
        <span className="text-[9px] font-medium text-[#2E2E2E]">POLL</span>
      </Abs>

      {/* poll body */}
      <Abs l={551} t={213} w={747} h={341} className="rounded-[6px]" style={{ background: "rgba(255,212,77,0.11)" }} />
      <Abs l={551} t={213} w={3} h={341} className="rounded-full" style={{ background: "#FFD44D" }} />
      {/* question */}
      <Abs
        l={566}
        t={227}
        w={704}
        className="font-inter text-[13px] font-medium leading-[15.7px] text-[#131313]"
        style={{ whiteSpace: "pre-line" }}
      >
        {poll?.question ?? ""}
      </Abs>

      {/* option 1 — Yes (selected, gold highlight border) */}
      <Abs l={566} t={382} w={682} h={42} className="rounded-[12px] bg-white" style={{ outline: "1.5px solid #FFD44D", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }} />
      <Abs
        l={582.2}
        t={391}
        w={24}
        h={24}
        className="flex items-center justify-center rounded-full"
        style={{ border: "2px solid #FFD44D" }}
      >
        <span className="h-[12px] w-[12px] rounded-full" style={{ background: "#FFD44D" }} />
      </Abs>
      <Abs l={621.2} t={391} className="text-[18px] leading-[24px]" style={{ color: "rgba(13,20,28,0.9)" }}>
        {pollOptions[0] ?? ""}
      </Abs>

      {/* option 2 — No (unselected) */}
      <Abs l={566} t={434} w={682} h={42} className="rounded-[12px] bg-white" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }} />
      <Abs l={584.2} t={445} w={20} h={20} className="rounded-full" style={{ border: "2px solid #49454F" }} />
      <Abs l={621.2} t={443} className="text-[18px] leading-[24px]" style={{ color: "rgba(13,20,28,0.9)" }}>
        {pollOptions[1] ?? ""}
      </Abs>

      {/* votes / results / vote */}
      <Abs l={569} t={503} className="text-[16px] leading-[20px]" style={{ color: "rgba(27,27,27,0.8)" }}>
        {pollVotes} votes
      </Abs>
      <Abs l={1026} t={505} className="text-[16px] leading-[20px] underline underline-offset-2" style={{ color: "rgba(27,27,27,0.8)" }}>
        Show Results
      </Abs>
      <Abs
        l={1149}
        t={492}
        w={99}
        h={42}
        className="flex items-center justify-center rounded-[24px] text-[20px] font-medium text-[#121212]"
        style={{ background: "rgba(255,255,255,0.95)", outline: "1px solid #E7E7E7", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}
      >
        Vote
      </Abs>

      {/* ================= message input (disabled) ================= */}
      <Abs l={515} t={952} w={783} h={34} className="flex items-center rounded-[4px] bg-white px-[10px]" style={{ outline: "1px solid #E3E3E3" }}>
        <span className="font-inter text-[13px] leading-[16px] text-[#2E2E2E]">
          you do not have permission to send message here.
        </span>
      </Abs>

      {/* ================= dim scrim ================= */}
      <Abs l={0} t={0} w={1440} h={1024} className="z-[60]" style={{ background: "rgba(0,0,0,0.5)" }} />

      {/* ================= Select Campaign modal ================= */}
      <Abs
        l={433}
        t={123}
        w={574}
        h={659}
        className="z-[70] rounded-[24px] bg-white"
        style={{ boxShadow: "0 24px 70px rgba(0,0,0,0.28)" }}
      >
        {/* title + subtitle (coords are frame-relative: subtract 433 / 123) */}
        <div className="absolute left-[20px] top-[31px] text-[24px] font-medium leading-[28px] text-black">
          Select Campaign
        </div>
        <div className="absolute left-[20px] top-[68px] font-inter text-[11px] font-medium leading-[16px]" style={{ color: "#64748B" }}>
          Add 3 creators to a campaign
        </div>

        {/* Done button */}
        <div
          className="absolute left-[363px] top-[28px] flex h-[48px] w-[128px] items-center justify-center rounded-[24px] text-[20px] font-medium text-white cursor-pointer"
          style={{ background: "rgba(0,0,0,0.95)" }}
          onClick={() => navigate("/campaigns")}
        >
          Done
        </div>
        {/* close button */}
        <div
          className="absolute left-[506px] top-[28px] flex h-[48px] w-[48px] items-center justify-center rounded-full bg-white cursor-pointer"
          style={{ outline: "1px solid #E7E7E7" }}
          onClick={() => navigate(-1)}
        >
          <X className="h-[20px] w-[20px] text-black" strokeWidth={2} />
        </div>

        {/* Campaigns heading */}
        <div className="absolute left-[20px] top-[98px] text-[24px] leading-[29.5px] text-black">Campaigns</div>
      </Abs>

      {/* campaigns list container (frame coords) */}
      <Abs l={453} t={263} w={534} h={493} className="z-[70] rounded-[12px]" style={{ outline: "1px solid #EAEAEA" }} />
      {/* search bar */}
      <Abs l={467} t={282} w={395} h={30} className="z-[70] flex items-center rounded-[16px] bg-white px-[11px] cursor-pointer" style={{ outline: "1px solid #EAEAEA" }} onClick={() => navigate("/search")}>
        <span className="font-light text-[12px]" style={{ color: "rgba(0,0,0,0.7)" }}>
          Search campaigns
        </span>
      </Abs>
      <Abs l={833.9} t={283.8} w={26.5} h={26.5} className="z-[70] flex items-center justify-center rounded-full cursor-pointer" style={{ background: "#E4E4E4" }} onClick={() => navigate("/search")}>
        <Search className="h-[14px] w-[14px] text-black" strokeWidth={1.8} />
      </Abs>

      {/* campaign cards */}
      <div className="absolute inset-0 z-[70]">
        {campaigns.map((c, i) => {
          const slot = CARD_SLOTS[i];
          return (
            <CampaignCard
              key={c.id}
              top={slot.top}
              icon={slot.icon}
              title={c.name}
              budget={`Budget ${lakhs(c.budget)}`}
              creators={`${c.peopleCount ?? 0} Creators`}
              live={c.status === "ACTIVE"}
              timeline={c.timeline ?? ""}
              addTop={slot.addTop}
              onCard={() => navigate("/campaigns/detail")}
              onArrow={() => navigate("/campaigns/creator-list")}
              onAdd={() => navigate("/campaigns/assign")}
            />
          );
        })}
      </div>
    </>
  );
}
