import type { LucideIcon } from "lucide-react";
import {
  ArrowLeft,
  ChevronDown,
  ArrowUpRight,
  Bold,
  Italic,
  Strikethrough,
  Link as LinkIcon,
  ListOrdered,
  List,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCalendar, useCreators } from "@/api/hooks";

/**
 * Super Admin — Manage Calendar (my creator) · brand screen.
 * Exact reconstruction of Figma frame 3781:2786, 1440×1024.
 * Renders CLEAN page content only (TopBar + Sidebar come from AppShell).
 */

const DAYS: { h: string; hx: number; red?: string }[] = [
  { h: "Mon", hx: 313 },
  { h: "Tue", hx: 417.2 },
  { h: "Wed", hx: 514.9 },
  { h: "Thu", hx: 619.1 },
  { h: "Fri", hx: 725.2 },
  { h: "Sat", hx: 823.8, red: "#D85859" },
  { h: "Sun", hx: 924.3, red: "#D43131" },
];

const CELLS: { cx: number; num: string; nx?: number; hl?: boolean }[] = [
  { cx: 279, num: "22", nx: 293.1 },
  { cx: 380.4, num: "23", nx: 394.5 },
  { cx: 481.8, num: "24", nx: 495.9 },
  { cx: 583.2, num: "24", hl: true },
  { cx: 684.7, num: "26", nx: 698.7 },
  { cx: 786.1, num: "27", nx: 800.2 },
  { cx: 887.5, num: "28", nx: 901.6 },
];

const DESCRIPTION =
  "Brand:\nRadiance+ Skincare\n\nTitle: “The Summer Glow Challenge”\nOpening Scene:\n Camera pans across sunlit windows. The creator steps in with fresh, glowing skin and says —\n “Summer’s here, but dullness doesn’t have to be! Meet my glow secret — Radiance+ Vitamin C Serum.”\nMid-section:\n Creator shows application: “Just 3 drops every morning before sunscreen — lightweight, non-sticky, and perfect under makeup.”\nClosing CTA:\n “Join the #GlowWithRadiance Challenge and show your summer glow! Tap the link in bio to try it now.”\nEnd Screen:\n Brand logo + campaign hashtag overlay (#GlowWithRadiance)";

const REMARK =
  "Should we add a line about SPF compatibility? That’s a big USP for Radiance+.\nSuggest adding before “lightweight and non-sticky.”";

/* ------------------------------ primitives ----------------------------- */
function ToolBtn({ icon: Icon }: { icon: LucideIcon }) {
  return (
    <span className="flex h-[28px] w-[28px] items-center justify-center rounded-[4px]">
      <Icon className="h-[16px] w-[16px] text-[#1D1C1D]" strokeWidth={1.8} />
    </span>
  );
}

/* -------------------------------- page --------------------------------- */
export default function CalendarBrandPage() {
  const navigate = useNavigate();
  const { data: calendar } = useCalendar();
  const { data: creators } = useCreators();
  const items = calendar ?? [];
  const creatorList = creators ?? [];
  const item = items[0];
  const creatorName =
    creatorList.find((c) => c.id === item?.creatorId)?.name ?? creatorList[0]?.name ?? "";
  const fmtDay = (iso?: string) =>
    iso ? new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "long" }) : "";
  return (
    <>
      {/* back button — 235,153 */}
      <button
        onClick={() => navigate(-1)}
        className="absolute left-[235px] top-[153px] flex h-[45px] w-[45px] items-center justify-center rounded-full bg-black cursor-pointer"
      >
        <ArrowLeft className="h-[22px] w-[22px] text-white" strokeWidth={2} />
      </button>

      {/* main content panel outline (subtract stroke #D4D4D4, notch under title) */}
      <div className="absolute left-[261px] top-[301px] h-[955px] w-[749px] rounded-[10px] border border-[#D4D4D4]" />

      {/* title — Manage Calendar 261,232 Outfit 400 34px */}
      <h1 className="absolute left-[261px] top-[232px] text-[34px] font-normal leading-[42.8px] text-ink">
        Manage Calendar
      </h1>
      {/* title underline — frame 1171276816 bottom border, 261,281 273x1 */}
      <span className="absolute left-[261px] top-[281px] h-px w-[273px] bg-[#000000]/25" />

      {/* All Platforms dropdown pill — 609,246 170x45 */}
      <div
        onClick={() => navigate("/calendar/all")}
        className="absolute left-[609px] top-[246px] flex h-[45px] w-[170px] items-center justify-center gap-[8px] rounded-[28px] bg-ink/90 cursor-pointer"
      >
        <span className="text-[20px] font-light leading-[25.2px] text-white">All Platforms</span>
        <ChevronDown className="h-[18px] w-[18px] text-white" strokeWidth={2} />
      </div>

      {/* ===================== calendar column ===================== */}

      {/* October dropdown pill — 279,325 108x45 */}
      <div className="absolute left-[279px] top-[325px] flex h-[45px] w-[108px] items-center justify-center gap-[6px] rounded-[28px] bg-white/90">
        <span className="text-[14px] font-light leading-[17.6px] text-black">October</span>
        <ChevronDown className="h-[16px] w-[16px] text-black" strokeWidth={1.8} />
      </div>

      {/* Leena Sharma pill — 847,328 140x39 */}
      <div
        onClick={() => navigate("/creators/detail")}
        className="absolute left-[847px] top-[328px] flex h-[39px] w-[140px] items-center gap-[4px] rounded-[21px] border border-line bg-white pl-[7px] cursor-pointer"
      >
        <span className="h-[20px] w-[20px] shrink-0 rounded-full bg-gradient-to-br from-[#FFD6E7] to-[#C8B3ED]" />
        <span className="text-[14.6px] font-normal text-ink/90">{creatorName}</span>
      </div>

      {/* day headers — y 388 Outfit 300 16.9px */}
      {DAYS.map((d) => (
        <span
          key={d.h}
          className="absolute top-[388px] text-[16.9px] font-light leading-[22.5px]"
          style={{ left: d.hx, color: d.red ?? "#000000" }}
        >
          {d.h}
        </span>
      ))}

      {/* day cells — y 422 93.9x129.6 white r16.9 */}
      {CELLS.map((c) => (
        <div
          key={c.cx}
          className="absolute top-[422px] h-[129.6px] w-[93.9px] rounded-[16.9px] bg-white"
          style={{ left: c.cx }}
        />
      ))}

      {/* day numbers — Outfit 400 18.8px */}
      {CELLS.filter((c) => !c.hl).map((c) => (
        <span
          key={c.cx}
          className="absolute top-[437px] text-[18.8px] font-normal leading-[22.5px] text-black"
          style={{ left: c.nx }}
        >
          {c.num}
        </span>
      ))}

      {/* highlighted day (Thu 24) — blue circle 39x39 at 597,437 */}
      <div className="absolute left-[597px] top-[437px] flex h-[39px] w-[39px] items-center justify-center rounded-full bg-[#D4EBF9]">
        <span className="text-[17.1px] font-normal leading-[20.5px] text-black">24</span>
      </div>

      {/* ===================== description card — 279,571 702x416 ===================== */}
      <div className="absolute left-[279px] top-[571px] h-[416px] w-[702px] overflow-hidden rounded-[12px] bg-white">
        {/* Today pill */}
        <div className="absolute left-[10px] top-[15px] flex h-[25px] w-[50px] items-center justify-center rounded-[14px] border-[0.6px] border-[#D6D6D6] bg-white">
          <span className="font-inter text-[10.2px] leading-[16px] text-black">{fmtDay(item?.scheduledAt)}</span>
        </div>
        {/* Under Review pill */}
        <div className="absolute left-[68px] top-[15px] flex h-[25px] w-[105px] items-center justify-center gap-[2px] rounded-[14px] border-[0.6px] border-[#D6D6D6] bg-white">
          <span className="h-[8px] w-[8px] rounded-full bg-[#3B68D8]" />
          <span className="font-inter text-[12px] leading-[14.5px] text-black">{item?.status ?? ""}</span>
        </div>
        {/* title */}
        <span className="absolute left-[10px] top-[51px] text-[12px] font-normal leading-[16px] text-black">
          {item?.title ?? ""}
        </span>
        {/* description body */}
        <p className="absolute left-[10px] top-[80px] w-[662px] whitespace-pre-wrap text-[12px] font-normal leading-[16px] text-ink/60">
          {DESCRIPTION}
        </p>

        {/* formatting toolbar — F8F8F8 bar at bottom */}
        <div className="absolute bottom-0 left-0 flex h-[38px] w-full items-center gap-[4px] border-t border-line bg-[#F8F8F8] px-[5px]">
          <ToolBtn icon={Bold} />
          <ToolBtn icon={Italic} />
          <ToolBtn icon={Strikethrough} />
          <span className="mx-[4px] h-[20px] w-px bg-[#1D1C1D]/[0.13]" />
          <ToolBtn icon={LinkIcon} />
          <span className="mx-[4px] h-[20px] w-px bg-[#1D1C1D]/[0.13]" />
          <ToolBtn icon={ListOrdered} />
          <ToolBtn icon={List} />
        </div>
      </div>

      {/* ===================== Remarks panel — 1020,257 331x957 ===================== */}
      <div className="absolute left-[1020px] top-[257px] h-[957px] w-[331px] rounded-[12px] bg-white/50" />

      {/* Remarks heading */}
      <span className="absolute left-[1031px] top-[266px] text-[15px] font-normal leading-[24px] text-black">
        Remarks
      </span>
      {/* expand button */}
      <span className="absolute left-[1321px] top-[258px] flex h-[28px] w-[28px] items-center justify-center rounded-full bg-white">
        <ArrowUpRight className="h-[16px] w-[16px] text-black" strokeWidth={1.8} />
      </span>

      {/* Remarks inner card — 1031,296 312x447 */}
      <div className="absolute left-[1031px] top-[296px] h-[447px] w-[312px] rounded-[12px] bg-white">
        {/* Today pill */}
        <div className="absolute left-[9px] top-[12px] flex h-[25px] w-[50px] items-center justify-center rounded-[14px] border-[0.6px] border-[#D6D6D6] bg-white">
          <span className="font-inter text-[10.2px] leading-[16px] text-black">Today</span>
        </div>

        {/* Shiv comment — avatar + name + time + message */}
        <span className="absolute left-[9px] top-[51px] h-[32px] w-[32px] rounded-full bg-gradient-to-br from-[#C8E6FF] to-[#C8B3ED]" />
        <span className="absolute left-[49px] top-[51px] font-inter text-[13px] font-medium leading-[15.6px] text-[#1B1B1B]">
          Shiv
        </span>
        <span className="absolute left-[78px] top-[52.5px] font-inter text-[11px] font-medium leading-[13.2px] text-[#2E2E2E]">
          11:55
        </span>
        <p className="absolute left-[49px] top-[70px] w-[241px] whitespace-pre-wrap font-inter text-[13px] font-normal leading-[15.7px] text-[#131313]/70">
          {REMARK}
        </p>
      </div>

      {/* ===================== Activity — 1031,759 ===================== */}
      <span className="absolute left-[1031px] top-[759px] text-[15px] font-normal leading-[24px] text-black">
        Activity
      </span>
      <span className="absolute left-[1031px] top-[789px] text-[12px] font-normal leading-[16px] text-ink/70">
        Today
      </span>
      <span className="absolute left-[1072px] top-[798.5px] h-px w-[92px] bg-line" />

      <span className="absolute left-[1031px] top-[820.5px] text-[15px] font-normal leading-[16px] text-black">
        Shiv left a comment
      </span>
      {/* 02:00 pm pill */}
      <div className="absolute left-[1272px] top-[821px] flex h-[24px] w-[61px] items-center justify-center rounded-[18px] border border-line bg-white">
        <span className="font-inter text-[10.2px] leading-[16px] text-ink/60">02:00 pm</span>
      </div>
    </>
  );
}
