import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  ChevronDown,
  Link2,
  ArrowUpRight,
  Sparkles,
  ArrowUp,
  Calendar,
  Plus,
  MoreVertical,
} from "lucide-react";
import instagramIcon from "@/assets/icons/calendar-shift-instagram.svg";
import { useCalendar } from "@/api/hooks";

/** Format an ISO date as "29 July" for the note-card date chips. */
function fmtDay(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return `${d.getDate()} ${d.toLocaleDateString("en-US", { month: "long" })}`;
}

/**
 * Super Admin — Manage Calendar (shift-date content) screen.
 * Exact reconstruction of Figma frame 4870:45504
 * ("Super Admin- Manage Calendar (shift date content)"), 1440×1024.
 * Renders inside AppShell (TopBar + Sidebar provided). Keeps the intentional
 * "Date Occupied / Shift Date" modal + 50% dim scrim — the subject of this frame.
 */

/* ------------------------------ brand glyphs ---------------------------- */
function YoutubeGlyph({ w, h }: { w: number; h: number }) {
  return (
    <svg viewBox="0 0 28 20" width={w} height={h} fill="none" aria-hidden>
      <rect width="28" height="20" rx="5" fill="#FF0000" />
      <path d="M11.5 6.2v7.6l6.6-3.8z" fill="#fff" />
    </svg>
  );
}

function LinkedinGlyph({ s }: { s: number }) {
  return (
    <svg viewBox="0 0 24 24" width={s} height={s} fill="none" aria-hidden>
      <rect width="24" height="24" rx="5" fill="#0A66C2" />
      <circle cx="7" cy="6.8" r="1.9" fill="#fff" />
      <rect x="5.3" y="10" width="3.4" height="9" fill="#fff" />
      <path
        d="M11 10h3.2v1.3c.5-.9 1.6-1.7 3.1-1.7 2.4 0 3.9 1.5 3.9 4.3V19h-3.3v-4.6c0-1.2-.5-2-1.6-2-1.1 0-1.8.8-1.8 2V19H11z"
        fill="#fff"
      />
    </svg>
  );
}

/* ------------------------------ calendar grid --------------------------- */
const COLS = [295.5, 396.9, 498.3, 599.8, 701.2, 802.6, 904.0];
const ROWS = [428.3, 565.4, 702.5, 839.6, 976.7];
const DAYS = [
  [1, 2, 3, 4, 5, 6, 7],
  [8, 9, 10, 11, 12, 13, 14],
  [15, 16, 17, 18, 19, 20, 21],
  [22, 23, 24, 25, 26, 27, 28],
  [29, 30, 31, 1, 2, 3, 4],
];
const HILITE = new Set(["1-0", "2-1", "3-4"]); // days 8, 16, 26

const WEEKDAYS: { t: string; x: number; c: string }[] = [
  { t: "Mon", x: 325.6, c: "#000000" },
  { t: "Tue", x: 429.8, c: "#000000" },
  { t: "Wed", x: 527.4, c: "#000000" },
  { t: "Thu", x: 631.7, c: "#000000" },
  { t: "Fri", x: 737.8, c: "#000000" },
  { t: "Sat", x: 836.4, c: "#D85859" },
  { t: "Sun", x: 936.9, c: "#D43131" },
];

/* -------------------------------- page ---------------------------------- */
export default function CalendarShiftDatePage() {
  const navigate = useNavigate();
  const [platformOpen, setPlatformOpen] = useState(true);
  const [selectedPlatform, setSelectedPlatform] = useState("All Platforms");
  const [brandCollab, setBrandCollab] = useState(false);
  const [shiftExisting, setShiftExisting] = useState(false);
  const [menuOpen, setMenuOpen] = useState(true);
  const { data: calendarData } = useCalendar();
  const items = calendarData ?? [];
  const item0 = items[0];
  const item1 = items[1];
  return (
    <>
      {/* right-panel translucent surface */}
      <div className="absolute left-[1020px] top-[257px] h-[957px] w-[331px] rounded-[12px] bg-white/50" />

      {/* back button */}
      <div
        onClick={() => navigate(-1)}
        className="absolute left-[235px] top-[153px] flex h-[45px] w-[45px] items-center justify-center rounded-full bg-black cursor-pointer"
      >
        <ChevronLeft className="h-[22px] w-[22px] text-white" strokeWidth={2} />
      </div>

      {/* heading */}
      <h1 className="absolute left-[261px] top-[232px] text-[34px] font-normal leading-[43px] text-black">
        Manage Calenar
      </h1>

      {/* All Platforms selector */}
      <div
        onClick={() => setPlatformOpen((o) => !o)}
        className="absolute left-[609px] top-[246px] flex h-[45px] w-[170px] items-center justify-between rounded-full bg-black/90 pl-[12px] pr-[13px] cursor-pointer"
      >
        <span className="text-[20px] font-light text-white">{selectedPlatform}</span>
        <ChevronDown className="h-[16px] w-[16px] text-white" strokeWidth={1.6} />
      </div>

      {/* Calendar toggle button — painted above the scrim in the frame
          (node 6387:35862 sits after the scrim/modal), so it stays bright. */}
      <div
        onClick={() => navigate("/calendar")}
        className="absolute left-[875px] top-[246px] z-40 flex h-[45px] w-[124px] items-center gap-[8px] rounded-full bg-white pl-[12px] cursor-pointer"
      >
        <Link2 className="h-[20px] w-[20px] text-black" strokeWidth={1.7} />
        <span className="text-[14px] font-light text-black">Calendar</span>
      </div>

      {/* Platform dropdown (open) */}
      {platformOpen && (
        <div className="absolute left-[610px] top-[54px] z-20 w-[169px] overflow-hidden rounded-[10px] bg-white">
          {["Instagram", "YouTube", "LinkedIn", "X", "All Platforms"].map((p, i) => (
            <div
              key={p}
              onClick={() => {
                setSelectedPlatform(p);
                setPlatformOpen(false);
              }}
              className={`flex h-[35.6px] items-center pl-[13px] text-[15px] font-normal text-black cursor-pointer ${
                i < 4 ? "border-b border-[#ECECEC]" : ""
              }`}
            >
              {p}
            </div>
          ))}
        </div>
      )}

      {/* ---------------------------- calendar --------------------------- */}
      {/* month selector */}
      <div className="absolute left-[295.9px] top-[331px] flex h-[45px] w-[108px] items-center justify-between rounded-full border border-[#E2E2E2] bg-white/90 px-[14px]">
        <span className="text-[14px] font-light text-black">October</span>
        <ChevronDown className="h-[15px] w-[15px] text-black" strokeWidth={1.6} />
      </div>

      {/* assignee pill */}
      <div className="absolute left-[849.9px] top-[334px] flex h-[39px] w-[140px] items-center gap-[3.5px] rounded-full border border-[#D9D9D9] bg-white pl-[7px]">
        <span className="h-[20px] w-[20px] rounded-full bg-gradient-to-br from-[#F5C6D6] to-[#C8B3ED]" />
        <span className="text-[14.6px] font-normal text-black/90">Leena Sharma</span>
      </div>

      {/* weekday header */}
      {WEEKDAYS.map((d) => (
        <span
          key={d.t}
          className="absolute top-[396.4px] text-[16.9px] font-light leading-[22.5px]"
          style={{ left: d.x, color: d.c }}
        >
          {d.t}
        </span>
      ))}

      {/* day cells */}
      {ROWS.map((y, r) =>
        COLS.map((x, c) => {
          const day = DAYS[r][c];
          const hi = HILITE.has(`${r}-${c}`);
          const isCircle = r === 0 && c === 3; // day 4
          return (
            <div
              key={`${r}-${c}`}
              className={`absolute rounded-[16.9px] ${hi ? "bg-[#EAF2F6]" : "bg-white"}`}
              style={{ left: x, top: y, width: 93.9, height: 129.6 }}
            >
              {!isCircle && (
                <span className="absolute left-[14.1px] top-[15px] text-[18.8px] font-normal leading-[23px] text-black">
                  {day}
                </span>
              )}
            </div>
          );
        }),
      )}

      {/* day 4 — highlighted circle */}
      <div className="absolute left-[604.4px] top-[433.9px] flex h-[41.8px] w-[39.4px] items-center justify-center rounded-full bg-[#D4EBF9]">
        <span className="text-[18.8px] font-normal text-black">4</span>
      </div>

      {/* day 5 — Titan Reel chip */}
      <div className="absolute left-[704.9px] top-[521.2px] flex h-[23.5px] w-[86.4px] items-center gap-[2.8px] rounded-[7.5px] bg-[rgba(220,150,242,0.38)] pl-[5.7px]">
        <img src={instagramIcon} alt="" className="h-[11.3px] w-[11.3px]" />
        <span className="text-[11.6px] font-normal text-black/90">Titan Reel</span>
      </div>

      {/* day 8 — instagram */}
      <img src={instagramIcon} alt="" className="absolute left-[367.8px] top-[583.2px] h-[15px] w-[15px]" />

      {/* day 16 — youtube */}
      <span className="absolute left-[468.3px] top-[723px]">
        <YoutubeGlyph w={15} h={10.7} />
      </span>

      {/* day 17 — Add chip */}
      <div className="absolute left-[517.1px] top-[801.1px] flex h-[23.5px] w-[55.4px] items-center gap-[1px] rounded-[7.5px] border border-[#EAEAEA] bg-white pl-[6.6px]">
        <Plus className="h-[12.2px] w-[12.2px] text-black" strokeWidth={1.5} />
        <span className="text-[11.3px] font-normal text-black/70">Add</span>
      </div>

      {/* day 18 — Video chip */}
      <div className="absolute left-[603.5px] top-[794.5px] flex h-[23.5px] w-[86.4px] items-center gap-[2px] rounded-[7.5px] bg-[rgba(158,228,173,0.38)] pl-[5.4px]">
        <YoutubeGlyph w={18} h={12.4} />
        <span className="text-[11.6px] font-normal text-black/90">Video</span>
      </div>

      {/* day 26 — linkedin */}
      <span className="absolute left-[770.7px] top-[857.4px]">
        <LinkedinGlyph s={15} />
      </span>

      {/* ---------------------------- right panel ------------------------- */}
      <span className="absolute left-[1031px] top-[266px] text-[15px] font-normal text-black">Generate Content</span>
      <div className="absolute left-[1321px] top-[257px] flex h-[28px] w-[28px] items-center justify-center rounded-[16px] bg-white">
        <ArrowUpRight className="h-[15px] w-[15px] text-black" strokeWidth={1.8} />
      </div>

      {/* Generate Content card */}
      <div className="absolute left-[1031px] top-[296px] h-[537px] w-[312px] rounded-[12px] border border-[#B94E9C] bg-white">
        {/* date chip */}
        <div className="absolute left-[9px] top-[15px] flex h-[25px] items-center rounded-[14px] border border-[#D6D6D6] bg-white px-[10px]">
          <span className="font-inter text-[10.2px] text-black">29 July</span>
        </div>
        {/* title / description */}
        <span className="absolute left-[9px] top-[47px] text-[12px] font-normal text-black">Title</span>
        <span className="absolute left-[9px] top-[73px] text-[12px] font-normal text-black/60">write description</span>

        {/* AI input */}
        <div className="absolute left-[9px] top-[401px] flex h-[34px] w-[217px] items-center rounded-[20px] bg-[#FAFAFA] pl-[6px] pr-[3px]">
          <span className="flex h-[24px] w-[24px] items-center justify-center rounded-full bg-gradient-to-br from-[#FBFBFF] to-[#CACAFF]">
            <Sparkles className="h-[14px] w-[14px] text-[#603CFF]" strokeWidth={1.6} fill="#603CFF" />
          </span>
          <span className="ml-[9px] flex-1 text-[10px] font-light text-black">Type anything to ask AI</span>
          <span className="flex h-[24px] w-[24px] items-center justify-center rounded-full bg-gradient-to-br from-[#FBFBFF] to-[#CACAFF]">
            <ArrowUp className="h-[14px] w-[14px] text-black" strokeWidth={1.8} />
          </span>
          <span className="ml-[2px] flex h-[24px] w-[24px] items-center justify-center rounded-full border border-[#E4E4E4] bg-white">
            <Calendar className="h-[12px] w-[12px] text-black" strokeWidth={1.6} />
          </span>
        </div>
        {/* Add button */}
        <div className="absolute left-[234px] top-[403px] flex h-[30px] w-[62px] items-center justify-center rounded-[18px] bg-black">
          <span className="text-[12px] font-normal text-white">Add</span>
        </div>

        {/* Brand Collab toggle */}
        <span className="absolute left-[16px] top-[454.5px] text-[15px] font-light text-black">Brand Collab</span>
        <div
          onClick={() => setBrandCollab((v) => !v)}
          className={`absolute left-[228px] top-[450px] flex h-[28px] w-[64px] items-center rounded-full px-[2px] cursor-pointer ${
            brandCollab ? "justify-end bg-black" : "bg-[rgba(120,120,120,0.2)]"
          }`}
        >
          <span className="h-[24px] w-[39px] rounded-full bg-white" />
        </div>

        {/* Shift Existing Content toggle */}
        <span className="absolute left-[14px] top-[498px] text-[15px] font-light text-black">Shift Existing Content +1 Day</span>
        <div
          onClick={() => setShiftExisting((v) => !v)}
          className={`absolute left-[228px] top-[493px] flex h-[28px] w-[64px] items-center rounded-full px-[2px] cursor-pointer ${
            shiftExisting ? "justify-end bg-black" : "bg-[rgba(120,120,120,0.2)]"
          }`}
        >
          <span className="h-[24px] w-[39px] rounded-full bg-white" />
        </div>
      </div>

      {/* Notes */}
      <span className="absolute left-[1031px] top-[844px] text-[15px] font-normal text-black">Notes</span>

      {/* Today divider */}
      <span className="absolute left-[1031px] top-[874px] text-[12px] font-normal text-black/70">Today</span>
      <span className="absolute left-[1072px] top-[883px] h-px w-[92px] bg-[#D0D0D0]" />

      {/* note card 1 */}
      <div className="absolute left-[1031px] top-[908px] h-[97px] w-[312px] rounded-[20px] bg-[rgba(200,222,208,0.42)]">
        <div className="absolute left-[13px] top-[13px] flex h-[25px] items-center rounded-[14px] bg-white px-[10px]">
          <span className="font-inter text-[10.2px] text-black">{fmtDay(item0?.scheduledAt ?? "")}</span>
        </div>
        <span className="absolute left-[79px] top-[15px] text-[15px] font-medium text-black">{item0?.title ?? ""}</span>
        <div
          onClick={() => setMenuOpen((o) => !o)}
          className="absolute left-[270px] top-[13px] flex h-[25px] w-[26px] items-center justify-center rounded-[24px] bg-white cursor-pointer"
        >
          <MoreVertical className="h-[16px] w-[16px] text-black" strokeWidth={1.6} />
        </div>
        <span className="absolute left-[13px] top-[45px] w-[283px] text-[13px] font-normal leading-[20px] text-black">
          {item0?.status ?? ""}
        </span>
      </div>

      {/* Yesterday divider */}
      <span className="absolute left-[1031px] top-[1019px] text-[12px] font-normal text-black/70">Yesterday</span>
      <span className="absolute left-[1096px] top-[1028px] h-px w-[92px] bg-[#D0D0D0]" />

      {/* note card 2 */}
      <div className="absolute left-[1031px] top-[1052px] h-[97px] w-[312px] rounded-[24px] bg-[#D7DBF3]">
        <div className="absolute left-[13px] top-[13px] flex h-[25px] items-center rounded-[14px] bg-white px-[10px]">
          <span className="font-inter text-[10.2px] text-black">{fmtDay(item1?.scheduledAt ?? "")}</span>
        </div>
        <span className="absolute left-[79px] top-[15px] text-[15px] font-medium text-black">{item1?.title ?? ""}</span>
        <div
          onClick={() => setMenuOpen((o) => !o)}
          className="absolute left-[270px] top-[13px] flex h-[25px] w-[26px] items-center justify-center rounded-[24px] bg-white cursor-pointer"
        >
          <MoreVertical className="h-[16px] w-[16px] text-black" strokeWidth={1.6} />
        </div>
        <span className="absolute left-[13px] top-[45px] w-[283px] text-[13px] font-normal leading-[20px] text-black">
          {item1?.status ?? ""}
        </span>
      </div>

      {/* Delete / Move context menu */}
      {menuOpen && (
        <div className="absolute left-[1104px] top-[1096px] w-[231px] rounded-[10px] bg-white shadow-[0_8px_24px_rgba(0,0,0,0.12)]">
          <span
            onClick={() => setMenuOpen(false)}
            className="absolute left-[18px] top-[15px] text-[15px] font-normal text-black cursor-pointer"
          >
            Delete Post
          </span>
          <span className="absolute left-0 top-[56px] h-px w-full bg-[#ECECEC]" />
          <span
            onClick={() => setMenuOpen(false)}
            className="absolute left-[18px] top-[67px] text-[15px] font-normal text-black cursor-pointer"
          >
            Move Post
          </span>
          <div className="h-[111px] w-full" />
        </div>
      )}

      {/* --------------------- dim scrim + Date Occupied modal ------------ */}
      {/* z-30 lifts the scrim above the AppShell TopBar (z-10) and Sidebar
          (z-20) so the whole canvas dims uniformly, matching the frame. */}
      <div className="absolute inset-0 z-30 bg-black/50" />

      <div className="absolute left-[526px] top-[354px] z-40 h-[313px] w-[387px] rounded-[12px] bg-white">
        {/* avatar */}
        <span className="absolute left-[165px] top-[34px] h-[58px] w-[58px] rounded-full bg-[#D9D9D9]" />
        {/* title */}
        <div className="absolute left-0 top-[106px] w-full text-center text-[24px] font-normal text-black">
          Date Occupied
        </div>
        {/* body */}
        <div className="absolute left-[41px] top-[147px] w-[305px] text-center text-[16px] font-normal leading-[24px] text-black/50">
          Oops! There's already content set for this date. Please shift or delete the one.
        </div>
        {/* actions */}
        <div
          onClick={() => navigate("/calendar")}
          className="absolute left-[55px] top-[233px] flex h-[47px] w-[140px] items-center justify-center rounded-[24px] bg-black/95 cursor-pointer"
        >
          <span className="text-[20px] font-normal text-white">Shift Date</span>
        </div>
        <div
          onClick={() => navigate("/calendar")}
          className="absolute left-[206px] top-[233.5px] flex h-[47px] w-[140px] items-center justify-center rounded-[24px] border border-[#D6D6D6] bg-white/95 cursor-pointer"
        >
          <span className="text-[20px] font-normal text-black">Delete</span>
        </div>
      </div>
    </>
  );
}
