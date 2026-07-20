import { Hash, Plus, MoreVertical, MessageSquare, Phone } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useChannels, useMessages } from "@/api/hooks";

/**
 * Influencer Chat Room — Super Admin / Creator message view.
 * Exact reconstruction of Figma frame 3563:6138 ("Influencer Chat Room"), 1440×1024.
 * Renders inside AppShell (TopBar + left icon rail supplied by the shell).
 */

/* ------------------------------ primitives ----------------------------- */
function StatusDot({ left, top }: { left: number; top: number }) {
  return (
    <span
      className="absolute h-[7px] w-[7px] rounded-full bg-[#2EB67D] ring-[1.5px] ring-[#1B1B1B]"
      style={{ left, top }}
    />
  );
}

/** Solid filled caret (matches Figma caret-down / caret-right vectors). */
function Caret({
  left,
  top,
  dir = "down",
  color = "rgba(255,255,255,0.7)",
}: {
  left: number;
  top: number;
  dir?: "down" | "right";
  color?: string;
}) {
  const style =
    dir === "down"
      ? { left, top, borderLeft: "4px solid transparent", borderRight: "4px solid transparent", borderTop: `5px solid ${color}` }
      : { left, top, borderTop: "4px solid transparent", borderBottom: "4px solid transparent", borderLeft: `5px solid ${color}` };
  return <span className="absolute h-0 w-0" style={style} />;
}

/* -------------------------------- page --------------------------------- */
export default function InfluencerChatRoomPage() {
  const navigate = useNavigate();
  const { data: channels = [] } = useChannels();
  const firstChannelId = channels[0]?.id ?? null;
  const { data: messages = [] } = useMessages(firstChannelId);
  const firstMessage = messages[0];
  return (
    <>
      {/* ============================ CARD SHELL ============================ */}
      {/* white rounded card 242,120 · 1118×883 */}
      <div className="absolute left-[242px] top-[120px] h-[883px] w-[1118px] rounded-[12px] bg-white shadow-[0_10px_40px_rgba(0,0,0,0.07)]" />

      {/* dark channels sidebar 242,120 · 255×883 */}
      <div className="absolute left-[242px] top-[120px] h-[883px] w-[255px] rounded-l-[12px] bg-[#1B1B1B]" />

      {/* chat header bar 497,120 · 863×49 */}
      <div className="absolute left-[497px] top-[120px] h-[49px] w-[863px] rounded-tr-[12px] border-b border-black/10 bg-white" />

      {/* =========================== DARK SIDEBAR =========================== */}
      {/* workspace switcher */}
      <span className="absolute left-[256px] top-[130px] font-sans text-[18px] font-bold leading-[24px] text-white">Yunto</span>
      <Caret left={358} top={150} color="#1B1B1B" />

      {/* Notifications header */}
      <Caret left={259} top={188} />
      <span className="absolute left-[281px] top-[182.5px] font-sans text-[15px] font-medium leading-[15px] text-white/70">Notifications</span>

      {/* agency announcements */}
      <Hash className="absolute left-[254px] top-[210px] h-[16px] w-[16px] text-white/70" strokeWidth={2} />
      <span onClick={() => navigate("/chat")} className="absolute left-[280px] top-[210.5px] cursor-pointer font-sans text-[15px] font-normal leading-[15px] text-white/70">{channels[4]?.name ?? ""}</span>
      <MoreVertical className="absolute left-[475px] top-[211px] h-[14px] w-[14px] text-[#BABABA]" strokeWidth={2} />

      {/* Direct messages header */}
      <Caret left={260.5} top={242.5} dir="right" />
      <span className="absolute left-[281px] top-[238.5px] font-sans text-[15px] font-medium leading-[15px] text-white/70">Direct messages</span>
      <span className="absolute left-[457px] top-[234px] flex h-[24px] w-[24px] items-center justify-center rounded-full bg-[#E64E4E] text-[10px] font-medium leading-none text-white">{channels.length}</span>

      {/* Dev Singh DM */}
      <span className="absolute left-[254px] top-[263px] h-[20px] w-[20px] rounded-full bg-gradient-to-br from-[#C8E6FF] to-[#C8B3ED]" />
      <StatusDot left={268} top={277.5} />
      <div onClick={() => navigate("/chat")} className="absolute left-[283px] top-[266.5px] flex cursor-pointer items-center gap-[8px] font-sans text-[15px] font-normal leading-[15px]">
        <span className="text-white/70">{channels[2]?.name ?? ""}</span>
        <span className="text-white/[0.49]">{channels[2]?.kind ?? ""}</span>
      </div>
      <MoreVertical className="absolute left-[475px] top-[266px] h-[14px] w-[14px] text-[#BABABA]" strokeWidth={2} />

      {/* Sanjay Sharma DM */}
      <span className="absolute left-[254px] top-[291.5px] flex h-[20px] w-[20px] items-center justify-center rounded-full bg-[#FFF4AD] text-[12px] font-normal leading-none text-[#B49C01]">{channels[3]?.name?.[0]?.toUpperCase() ?? "S"}</span>
      <StatusDot left={268} top={305.5} />
      <div onClick={() => navigate("/chat")} className="absolute left-[283px] top-[294.5px] flex cursor-pointer items-center gap-[8px] font-sans text-[15px] font-normal leading-[15px]">
        <span className="text-white/70">{channels[3]?.name ?? ""}</span>
        <span className="text-white/[0.49]">{channels[3]?.kind ?? ""}</span>
      </div>
      <MoreVertical className="absolute left-[475px] top-[294px] h-[14px] w-[14px] text-[#BABABA]" strokeWidth={2} />

      {/* Add person */}
      <span className="absolute left-[254px] top-[320px] flex h-[20px] w-[20px] items-center justify-center rounded-[4px] bg-white/10">
        <Plus className="h-[12px] w-[12px] text-white/70" strokeWidth={2.4} />
      </span>
      <span onClick={() => navigate("/chat/create-channel")} className="absolute left-[282px] top-[322.5px] cursor-pointer font-sans text-[15px] font-normal leading-[15px] text-white/70">Add person</span>

      {/* Campaigns header */}
      <Caret left={259} top={356} />
      <span className="absolute left-[281px] top-[350.5px] font-sans text-[15px] font-medium leading-[15px] text-white/70">Campaigns</span>

      {/* Baseskincare channel (selected) */}
      <div className="absolute left-[242px] top-[372px] h-[28px] w-[247px] rounded-[6px] bg-[#656565]" />
      <Hash className="absolute left-[254px] top-[378px] h-[16px] w-[16px] text-white/70" strokeWidth={2} />
      <span onClick={() => navigate("/chat")} className="absolute left-[280px] top-[378.5px] cursor-pointer font-sans text-[15px] font-normal leading-[15px] text-white">{channels[0]?.name ?? ""}</span>

      {/* Nike Diwali channel */}
      <Hash className="absolute left-[254px] top-[406px] h-[16px] w-[16px] text-white/70" strokeWidth={2} />
      <span onClick={() => navigate("/chat")} className="absolute left-[280px] top-[406.5px] cursor-pointer font-sans text-[15px] font-normal leading-[15px] text-white/70">{channels[1]?.name ?? ""}</span>

      {/* current user footer */}
      <span className="absolute left-[256px] top-[948px] h-[38px] w-[38px] rounded-full bg-gradient-to-br from-[#F5D6C6] to-[#8B6B5A]" />
      <span className="absolute left-[299px] top-[952.5px] font-sans text-[12px] font-normal leading-[15px] text-white">Leena Sharma</span>
      <span className="absolute left-[299px] top-[968.5px] font-sans text-[8px] font-normal leading-[13px] text-white/70">@socyio</span>

      {/* =========================== CHAT HEADER =========================== */}
      <span className="absolute left-[511px] top-[134.5px] font-sans text-[16px] font-medium leading-[20px] text-[#1B1B1B]">#{channels[0]?.name ?? ""}</span>

      {/* Talk to Manager button */}
      <div onClick={() => navigate("/chat")} className="absolute left-[1051px] top-[129px] flex h-[32px] w-[189px] cursor-pointer items-center gap-[8px] rounded-[24px] border border-[#D9D9D9] bg-white px-[12px]">
        <span className="font-sans text-[15px] font-light leading-[19px] text-[#7B7B7B]">Talk to Manager</span>
        <MessageSquare className="h-[15px] w-[15px] text-[#7B7B7B]" strokeWidth={1.6} />
        <Phone className="h-[15px] w-[15px] text-[#7B7B7B]" strokeWidth={1.6} />
      </div>

      {/* participant avatar stack */}
      <div onClick={() => navigate("/campaigns/creator-list")} className="absolute left-[1250px] top-[128.5px] h-[32px] w-[96px] cursor-pointer rounded-[18px] border border-[#D9D9D9] bg-white">
        <span className="absolute left-[4px] top-[3.5px] h-[25px] w-[25px] rounded-full border-2 border-white bg-gradient-to-br from-[#C8E6FF] to-[#C8B3ED]" />
        <span className="absolute left-[21px] top-[3.5px] flex h-[25px] w-[25px] items-center justify-center rounded-full border-2 border-white bg-[#FFF4AD] text-[13px] font-normal leading-none text-[#B49C01]">S</span>
        <span className="absolute left-[38px] top-[3.5px] flex h-[25px] w-[25px] items-center justify-center rounded-full border-2 border-white bg-[#BCD4FD] text-[13px] font-normal leading-none text-[#1155C8]">P</span>
        <span className="absolute left-[50px] top-[3.5px] flex h-[25px] w-[25px] items-center justify-center rounded-full border-2 border-white bg-[#EFBEFF] text-[13px] font-normal leading-none text-[#8701B4]">R</span>
        <span className="absolute left-[67px] top-[3.5px] flex h-[25px] w-[25px] items-center justify-center rounded-full border-2 border-white bg-[#E5E5E5] text-[8px] font-normal leading-none text-black">+15</span>
      </div>

      {/* ============================= MESSAGE ============================= */}
      <span className="absolute left-[511px] top-[197px] h-[32px] w-[32px] rounded-full bg-gradient-to-br from-[#BFD8C6] to-[#4E6B78]" />
      <span className="absolute left-[551px] top-[197px] font-sans text-[13px] font-bold leading-[16px] text-[#1B1B1B]">{firstMessage?.authorName ?? ""}</span>
      <span className="absolute left-[583px] top-[198.5px] font-sans text-[11px] font-medium leading-[13px] text-[#2E2E2E]">{firstMessage ? new Date(firstMessage.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false }) : ""}</span>
      <p className="absolute left-[551px] top-[216px] w-[720px] whitespace-pre-wrap font-inter text-[13px] font-medium leading-[15.7px] text-[#131313]">
        {firstMessage?.body ?? ""}
      </p>

      {/* =========================== MESSAGE INPUT ========================= */}
      <div className="absolute left-[515px] top-[952px] flex h-[34px] w-[783px] items-center rounded-[4px] border border-[#555555] bg-white px-[10px]">
        <span className="font-inter text-[13px] font-normal leading-[16px] text-[#2E2E2E]">you do not have permission to send message here.</span>
      </div>
    </>
  );
}
