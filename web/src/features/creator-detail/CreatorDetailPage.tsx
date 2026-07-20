import type { LucideIcon } from "lucide-react";
import {
  ArrowLeft,
  ChevronDown,
  Ban,
  Phone,
  MoreVertical,
  Users,
  Eye,
  Star,
  Heart,
  Link2,
  Pencil,
  Plus,
  Youtube,
  Instagram,
  Home,
  MessageCircle,
  Copy,
  ArrowRightToLine,
  TrendingUp,
} from "lucide-react";
import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useCreators, useUpdate } from "@/api/hooks";
import whatsapp from "@/assets/icons/whatsapp.svg";

const compactN = (n: number) =>
  n >= 1_000_000 ? `${(n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1)} M`
  : n >= 1_000 ? `${Math.round(n / 1_000)}k` : `${n}`;

/**
 * Super Admin — Creator profile detail ("yunto creator").
 * Exact reconstruction of Figma frame 5227:13823, 1440×1024.
 * Renders inside AppShell (TopBar + Sidebar already present); this is the
 * profile-dropdown-open state, so the whole canvas is dimmed by a scrim and
 * the bright profile popup floats on top.
 */

/* ------------------------------ primitives ----------------------------- */
function StatIconBtn({ icon: Icon, color, filled }: { icon: LucideIcon; color: string; filled?: boolean }) {
  return (
    <span className="flex h-[48px] w-[48px] items-center justify-center rounded-[24px] bg-white">
      <Icon className="h-[24px] w-[24px]" style={{ color }} fill={filled ? color : "none"} strokeWidth={1.6} />
    </span>
  );
}

function StatBlock({
  icon,
  color,
  filled,
  value,
  label,
  left,
  top,
}: {
  icon: LucideIcon;
  color: string;
  filled?: boolean;
  value: string;
  label: string;
  left: number;
  top: number;
}) {
  return (
    <div className="absolute flex w-[108px] flex-col" style={{ left, top }}>
      <StatIconBtn icon={icon} color={color} filled={filled} />
      <span className="mt-[8px] text-[12px] font-normal leading-[12px] text-[#A0AEC0]">{label}</span>
      <span className="mt-[2px] text-[15px] font-semibold leading-[21px] text-[#101010]">{value}</span>
    </div>
  );
}

function RateRow({
  boxLeft,
  boxTop,
  type,
  typeX,
  typeSize,
  creatorX,
  rate,
  taxX,
  marketX,
  market,
  increaseX,
}: {
  boxLeft: number;
  boxTop: number;
  type: string;
  typeX: number;
  typeSize: number;
  creatorX: number;
  rate: string;
  taxX: number;
  marketX: number;
  market: string;
  increaseX?: number;
}) {
  return (
    <>
      <div className="absolute h-[48px] w-[248px] rounded-[12px] bg-white" style={{ left: boxLeft, top: boxTop }} />
      <span
        className="absolute font-normal text-ink/90"
        style={{ left: typeX, top: boxTop + 6, fontSize: typeSize }}
      >
        {type}
      </span>
      {/* creator column */}
      <span className="absolute text-[10.2px] font-normal leading-none text-ink/90" style={{ left: creatorX, top: boxTop + 9 }}>
        Creator rate
      </span>
      <span className="absolute text-[13px] font-semibold leading-none text-[#3DBB6C]" style={{ left: creatorX, top: boxTop + 25 }}>
        {rate}
      </span>
      <span className="absolute text-[6px] font-medium leading-none text-black/50" style={{ left: taxX, top: boxTop + 27 }}>
        (tax inc.)
      </span>
      {/* market column */}
      <span className="absolute text-[10.2px] font-normal leading-none text-ink/90" style={{ left: marketX, top: boxTop + 9 }}>
        Market Rate
      </span>
      <span className="absolute text-[13px] font-semibold leading-none text-[#3DBB6C]" style={{ left: marketX, top: boxTop + 25 }}>
        {market}
      </span>
      {increaseX !== undefined && (
        <span className="absolute flex items-center gap-[2px]" style={{ left: increaseX, top: boxTop + 29 }}>
          <TrendingUp className="h-[8px] w-[8px] text-[#FD564B]" strokeWidth={2.2} />
          <span className="text-[6.7px] font-medium leading-none text-[#FD564B]">Increase</span>
        </span>
      )}
    </>
  );
}

/* -------------------------------- page --------------------------------- */
export default function CreatorDetailPage() {
  const navigate = useNavigate();
  const [unlisted, setUnlisted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(true);
  const [sp] = useSearchParams();
  const id = sp.get("id");
  const { data } = useCreators();
  const updateCreator = useUpdate("creators");
  const item = (data ?? []).find((x) => x.id === id) ?? (data ?? [])[0];
  return (
    <>
      {/* faint outlined content panel (Figma Subtract, hairline) */}
      <div className="absolute left-[261px] top-[225px] h-[1014px] w-[1053px] rounded-[24px] border border-black/[0.06]" />

      {/* back button */}
      <div
        onClick={() => navigate(-1)}
        className="absolute left-[235px] top-[153px] flex h-[45px] w-[45px] cursor-pointer items-center justify-center rounded-full bg-black"
      >
        <ArrowLeft className="h-[22px] w-[22px] text-white" strokeWidth={2} />
      </div>

      {/* title */}
      <h1 onClick={() => navigate("/creators")} className="absolute left-[270px] top-[229px] cursor-pointer text-[34px] font-normal leading-none text-black">My Creators</h1>
      <ChevronDown onClick={() => navigate("/creators")} className="absolute left-[482px] top-[238px] h-[28px] w-[28px] cursor-pointer text-black" strokeWidth={2} />

      {/* ============================ TEAM CARD ============================ */}
      <div className="absolute left-[277px] top-[294px] h-[285px] w-[691px] rounded-[24px] bg-[#F3F3F3]/[0.13]" />

      {/* tags */}
      <div className="absolute left-[284px] top-[307px] flex h-[30px] items-center gap-[8px]">
        <span className="flex h-[30px] items-center rounded-[36px] bg-white px-[9px] text-[12px] font-light text-[#121212]">Beauty</span>
        <span className="flex h-[30px] items-center rounded-[36px] bg-white px-[9px] text-[12px] font-light text-[#121212]">Lifestyle</span>
        <span className="flex h-[30px] items-center gap-[2px] rounded-[36px] bg-white px-[7px] text-[10.2px] font-normal text-black">
          <span className="text-[10px]">📍</span>{item?.location ?? "Delhi"}
        </span>
      </div>

      {/* creator identity */}
      <div className="absolute left-[284px] top-[371px] h-[45px] w-[45px] rounded-full border border-black/10 bg-gradient-to-br from-[#C8E6FF] to-[#C8B3ED]" />
      <span className="absolute left-[341px] top-[372px] text-[17.4px] font-normal leading-none text-ink/90">{item?.name ?? ""}</span>
      <span className="absolute left-[341px] top-[396px] text-[11.6px] font-normal leading-none text-ink/70">{item?.handle ?? ""}</span>
      <span className="absolute left-[318px] top-[394px] text-[15px] leading-none">🔥</span>

      {/* whatsapp + call */}
      <img src={whatsapp} alt="WhatsApp" onClick={() => navigate("/chat")} className="absolute left-[860px] top-[379px] h-[28px] w-[28px] cursor-pointer" />
      <div className="absolute left-[897px] top-[379px] flex h-[28px] w-[28px] items-center justify-center rounded-full bg-white shadow-[0_1px_4px_rgba(0,0,0,0.12)]">
        <Phone className="h-[15px] w-[15px] text-black" strokeWidth={1.6} />
      </div>

      {/* Unlist / Calendar / dots */}
      <div
        onClick={() => {
          const next = !unlisted;
          setUnlisted(next);
          if (id) updateCreator.mutate({ id, data: { listed: !next } });
        }}
        className="absolute left-[651px] top-[299px] flex h-[45px] w-[124px] cursor-pointer items-center justify-between rounded-[19.5px] bg-white pl-[9px] pr-[10px]"
      >
        <span className="text-[16.2px] font-extralight text-black">Unlist</span>
        <span className={`relative h-[23px] w-[52px] rounded-full ${unlisted ? "bg-[#3DBB6C]" : "bg-[#787878]/20"}`}>
          <span className={`absolute top-[2px] h-[19px] w-[32px] rounded-full bg-white ${unlisted ? "left-[18px]" : "left-[2px]"}`} />
        </span>
      </div>
      <div onClick={() => navigate("/calendar")} className="absolute left-[783px] top-[299px] flex h-[45px] w-[124px] cursor-pointer items-center justify-center gap-[8px] rounded-[24px] bg-white">
        <Link2 className="h-[18px] w-[18px] text-black" strokeWidth={1.8} />
        <span className="text-[14px] font-light text-black">Calendar</span>
      </div>
      <div onClick={() => setMenuOpen((v) => !v)} className="absolute left-[915px] top-[299px] flex h-[45px] w-[45px] cursor-pointer items-center justify-center rounded-[23px] bg-white">
        <MoreVertical className="h-[20px] w-[20px] text-black" strokeWidth={2} />
      </div>

      {/* Take Action pill */}
      <div className="absolute left-[467px] top-[370px] flex h-[32px] w-[221px] items-center rounded-[12px] bg-white pl-[5px]">
        <Ban className="h-[13px] w-[13px] text-[#E76B6B]" strokeWidth={1.8} />
        <Ban className="ml-[9px] h-[13px] w-[13px] text-[#968B8B]" strokeWidth={1.8} />
        <Ban className="ml-[9px] h-[13px] w-[13px] text-[#968B8B]" strokeWidth={1.8} />
        <Ban className="ml-[9px] h-[13px] w-[13px] text-[#968B8B]" strokeWidth={1.8} />
        <Ban className="ml-[9px] h-[13px] w-[13px] text-[#968B8B]" strokeWidth={1.8} />
        <span className="ml-[19px] text-[16px] font-light text-[#EF3E3E]">Take Action</span>
      </div>

      {/* stat card */}
      <div className="absolute left-[299px] top-[434px] h-[115px] w-[640px] rounded-[24px] bg-white" />
      <StatBlock icon={Users} color="#4880D4" value={item ? compactN(item.followers) : ""} label="Followers" left={338} top={446} />
      <StatBlock icon={Eye} color="#2CC37F" value={item ? `${item.engagementRate.toFixed(1)} %` : ""} label="Engagement Rate" left={499} top={446} />
      <StatBlock icon={Star} color="#FDD835" value={item ? `${item.stars} Stars` : ""} label="Rating" left={660} top={446} />
      <StatBlock icon={Heart} color="#F8348C" value={item ? compactN(item.avgViews) : ""} label="Avg. Views" left={821} top={446} />

      {/* ===================== EDIT DELIVERABLES CARD ===================== */}
      <div className="absolute left-[988px] top-[236px] h-[260px] w-[298px] rounded-[12px] bg-white/60" />
      <span className="absolute left-[1001px] top-[248px] text-[14px] font-normal leading-none text-black">Edit deliverables</span>
      <div onClick={() => navigate("/creators/add-ons")} className="absolute left-[1258px] top-[236px] flex h-[28px] w-[28px] cursor-pointer items-center justify-center rounded-full bg-white">
        <Pencil className="h-[13px] w-[13px] text-black" strokeWidth={1.6} />
      </div>
      {/* instagram deliverable row */}
      <div onClick={() => navigate("/creators/add-ons")} className="absolute left-[1001px] top-[284px] h-[82px] w-[255px] cursor-pointer rounded-[12px] bg-white/90" />
      <Plus className="absolute left-[1083px] top-[298px] h-[16px] w-[16px] text-black/60" strokeWidth={1.6} />
      <span className="absolute left-[1009px] top-[295px] flex h-[24px] w-[24px] items-center justify-center rounded-full bg-[#F1F1F1]">
        <Instagram className="h-[15px] w-[15px] text-[#E1306C]" strokeWidth={1.6} />
      </span>
      <span className="absolute left-[1039px] top-[297px] text-[14px] font-light leading-none text-black">Instagram</span>
      <span className="absolute left-[1039px] top-[319px] text-[11px] font-normal leading-none text-[#443A4D]">1 Collab Reel</span>
      <span className="absolute left-[1039px] top-[340px] text-[11px] font-normal leading-none text-[#443A4D]">2 Stories</span>
      <span className="absolute left-[1185px] top-[297px] text-[15px] font-semibold leading-none text-[#3DBB6C]">₹80,000</span>
      {/* story / youtube buttons */}
      <div onClick={() => navigate("/creators/add-ons")} className="absolute left-[1001px] top-[450px] flex h-[28px] w-[70px] cursor-pointer items-center justify-center gap-[3px] rounded-[20px] bg-[#FEFCFF]">
        <Plus className="h-[14px] w-[14px] text-black" strokeWidth={1.8} />
        <span className="text-[12px] font-normal text-black/70">Story</span>
      </div>
      <div onClick={() => navigate("/creators/add-ons")} className="absolute left-[1082px] top-[450px] flex h-[28px] w-[103px] cursor-pointer items-center justify-center gap-[5px] rounded-[20px] bg-[#FEFCFF]">
        <span className="flex h-[24px] w-[24px] items-center justify-center rounded-full bg-white">
          <Youtube className="h-[15px] w-[15px] text-[#FF0000]" strokeWidth={1.8} />
        </span>
        <span className="text-[12px] font-light text-black/70">Youtube</span>
      </div>

      {/* ======================== COMMERCIALS ======================== */}
      <span className="absolute left-[278px] top-[605px] text-[24px] font-normal leading-none text-slate900">Commercials</span>

      {/* Instagram commercial card */}
      <div className="absolute left-[278px] top-[647px] h-[240px] w-[266px] rounded-[12px] bg-[#F5F5F5]" />
      <div onClick={() => navigate("/creators/add-ons")} className="absolute left-[512px] top-[647px] flex h-[28px] w-[28px] cursor-pointer items-center justify-center rounded-full bg-white">
        <Pencil className="h-[12px] w-[12px] text-black" strokeWidth={1.6} />
      </div>
      <span className="absolute left-[288px] top-[655px] flex h-[33.5px] w-[33.5px] items-center justify-center rounded-full border border-black/[0.14] bg-white">
        <Instagram className="h-[16px] w-[16px] text-[#E1306C]" strokeWidth={1.6} />
      </span>
      <span className="absolute left-[329px] top-[665px] text-[14px] font-normal leading-none text-ink/90">Instagram</span>
      <div className="absolute left-[402px] top-[666px] flex h-[16px] w-[91px] items-center justify-center gap-[3px] rounded-[13px] bg-white">
        <TrendingUp className="h-[8px] w-[8px] text-black" strokeWidth={2} />
        <span className="text-[8.2px] font-medium leading-none text-black">+35% above avg</span>
      </div>
      <span className="absolute left-[288px] top-[701px] text-[9.3px] font-normal leading-none text-ink/90">Commercials</span>
      <RateRow boxLeft={288} boxTop={717} type="Reel" typeX={303} typeSize={14} creatorX={370} rate="₹30,000" taxX={425} marketX={469} market="₹35,000" increaseX={299} />
      <RateRow boxLeft={288} boxTop={771} type="Post" typeX={303} typeSize={14} creatorX={370} rate="₹30,000" taxX={425} marketX={469} market="₹35,000" />
      <RateRow boxLeft={286} boxTop={825} type="Story" typeX={301} typeSize={14} creatorX={368} rate="₹30,000" taxX={423} marketX={467} market="₹35,000" increaseX={300} />

      {/* YouTube commercial card */}
      <div className="absolute left-[554px] top-[647px] h-[240px] w-[266px] rounded-[12px] bg-[#F5F5F5]" />
      <div onClick={() => navigate("/creators/add-ons")} className="absolute left-[788px] top-[647px] flex h-[28px] w-[28px] cursor-pointer items-center justify-center rounded-full bg-white">
        <Pencil className="h-[12px] w-[12px] text-black" strokeWidth={1.6} />
      </div>
      <span className="absolute left-[564px] top-[655px] flex h-[33.5px] w-[33.5px] items-center justify-center rounded-full border border-black/[0.14] bg-white">
        <Youtube className="h-[16px] w-[16px] text-[#FF0000]" strokeWidth={1.8} />
      </span>
      <span className="absolute left-[605px] top-[665px] text-[14px] font-normal leading-none text-ink/90">YouTube</span>
      <span className="absolute left-[564px] top-[701px] text-[9.3px] font-normal leading-none text-ink/90">Commercials</span>
      <RateRow boxLeft={564} boxTop={717} type="Integrated" typeX={572} typeSize={10.2} creatorX={653} rate="₹30,000" taxX={709} marketX={745} market="₹35,000" />
      <RateRow boxLeft={564} boxTop={773} type="Dedicated" typeX={572} typeSize={10.2} creatorX={655} rate="₹50,000" taxX={710} marketX={745} market="₹60,000" />
      <RateRow boxLeft={564} boxTop={829} type="Short" typeX={577} typeSize={10.2} creatorX={655} rate="₹25,000" taxX={710} marketX={745} market="₹30,000" increaseX={579} />

      {/* ========================== ADDRESS ========================== */}
      <span className="absolute left-[988px] top-[513px] text-[24px] font-normal leading-none text-slate900">Address</span>
      <div className="absolute left-[988px] top-[545px] h-[285px] w-[298px] rounded-[24px] bg-white" />
      <span className="absolute left-[1007px] top-[559px] flex h-[48px] w-[48px] items-center justify-center rounded-[24px] bg-white shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
        <Home className="h-[24px] w-[24px] text-[#3CBABA]" strokeWidth={1.6} />
      </span>
      <span className="absolute left-[1007px] top-[615px] text-[12px] font-normal leading-none text-[#A0AEC0]">Home Address</span>
      <p className="absolute left-[1007px] top-[637px] w-[189px] text-[14px] font-medium leading-[24px] text-black">
        D- 601
        <br />
        Anjara Apartments
        <br />
        Sector 78 , Noida
        <br />
        Uttara Pradesh
        <br />
        201305
      </p>
      <span className="absolute left-[1007px] top-[780px] text-[14px] font-medium leading-none text-black">+91 98888453309</span>

      {/* ====================== INSTAGRAM STATS ====================== */}
      <span className="absolute left-[277px] top-[913px] text-[24px] font-normal leading-none text-slate900">Instagram</span>
      <div className="absolute left-[277px] top-[953px] h-[115px] w-[659px] rounded-[24px] bg-white" />
      <StatBlock icon={Users} color="#4880D4" value={item ? compactN(item.followers) : ""} label="Followers" left={320} top={965} />
      <StatBlock icon={MessageCircle} color="#E1AE22" value="900" label="Avg. Comments" left={481} top={965} />
      <StatBlock icon={Eye} color="#2CC37F" value="3.5 %" label="Avg. Engagement" left={642} top={965} />
      <StatBlock icon={Heart} color="#F8348C" value="12k" label="Avg. Likes" left={803} top={965} />

      {/* ======================= YOUTUBE STATS ======================= */}
      <span className="absolute left-[277px] top-[1080px] text-[24px] font-normal leading-none text-slate900">Youtube</span>
      <div className="absolute left-[277px] top-[1122px] h-[115px] w-[659px] rounded-[24px] bg-white" />
      <StatBlock icon={Users} color="#4880D4" value="500k" label="Subscribers" left={320} top={1134} />
      <StatBlock icon={MessageCircle} color="#E1AE22" value="560" label="Avg. Comments" left={481} top={1134} />
      <StatBlock icon={Eye} color="#2CC37F" value="2.5 %" label="Avg. Engagement" left={642} top={1134} />
      <StatBlock icon={Heart} color="#F8348C" value="102k" label="Avg. Likes" left={803} top={1134} />

      {/* ==================== REMOVE CREATOR MENU ==================== */}
      {menuOpen && (
        <div className="absolute left-[787px] top-[177px] w-[169px] rounded-[10px] bg-white shadow-[0_8px_24px_rgba(0,0,0,0.12)]">
          <div onClick={() => { if (id) updateCreator.mutate({ id, data: { blacklisted: true } }); navigate("/creators"); }} className="flex h-[43px] cursor-pointer items-center border-b border-black/10 px-[13px] text-[15px] font-light text-black">Remove Creator</div>
          <div onClick={() => setMenuOpen(false)} className="flex h-[43px] cursor-pointer items-center px-[13px] text-[15px] font-light text-black">Option</div>
        </div>
      )}

      {/* ========================= SCRIM ========================= */}
      {/* z-20 lifts the scrim above the TopBar (z-10) so the whole canvas dims */}
      <div onClick={() => navigate(-1)} className="absolute inset-0 z-20 cursor-pointer bg-black/50" />

      {/* ====================== PROFILE POPUP ====================== */}
      <div className="absolute left-[1041px] top-[66px] z-30 h-[299px] w-[309px] rounded-[12px] bg-white shadow-[0_16px_48px_rgba(0,0,0,0.24)]">
        <div className="absolute left-[114px] top-[26px] h-[82px] w-[82px] rounded-full border border-black/10 bg-gradient-to-br from-[#FFE7B8] to-[#F6B9A0]" />
        <span className="absolute left-[146px] top-[31px] text-[17px] leading-none">👑</span>
        <div className="absolute left-[87px] top-[120px] w-[135px] text-center text-[20px] font-semibold leading-none text-slate900">Shubham Arya</div>
        <div className="absolute left-[87px] top-[145px] w-[135px] text-center text-[12px] font-normal leading-none text-[#6B7280]">Admin</div>
        <div className="absolute left-[83px] top-[168px] flex h-[28px] w-[144px] items-center justify-center gap-[4px] rounded-[24px] border border-black/5 bg-white/50 shadow-[0_1px_3px_rgba(0,0,0,0.08)]">
          <span className="text-[10px] font-normal text-black/80">Agency Code&nbsp;&nbsp;55678</span>
          <Copy className="h-[12px] w-[12px] text-black" strokeWidth={1.6} />
        </div>
        <div className="absolute left-[11px] top-[217px] flex h-[56px] w-[288px] items-center gap-[8px] rounded-[28px] bg-white pl-[16px]">
          <ArrowRightToLine className="h-[24px] w-[24px] text-black" strokeWidth={1.8} />
          <span className="text-[18px] font-normal text-black">Log Out</span>
        </div>
      </div>
    </>
  );
}
