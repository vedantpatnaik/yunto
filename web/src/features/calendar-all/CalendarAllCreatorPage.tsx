import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronDown, Link as LinkIcon, Eye, ArrowUpRight, Youtube } from "lucide-react";
import instagram from "@/assets/icons/calendar-all_instagram.svg";
import { useCalendar, useCreators } from "@/api/hooks";

/**
 * Super Admin — Manage Calendar (all creator).
 * Exact reconstruction of Figma frame 5063:61180, 1440×1024.
 * Renders inside AppShell (TopBar + Sidebar already present).
 * Clean page: the profile dropdown popup + dim scrim siblings are intentionally omitted.
 */

const COLS = [281.5, 382.9, 484.3, 585.8, 687.2, 788.6, 890.0];
const ROWS = [428.3, 565.4, 702.5, 839.6, 976.7];
const GRID: number[][] = [
  [1, 2, 3, 4, 5, 6, 7],
  [8, 9, 10, 11, 12, 13, 14],
  [15, 16, 17, 18, 19, 20, 21],
  [22, 23, 24, 25, 26, 27, 28],
  [29, 30, 31, 1, 2, 3, 4],
];

const PLATFORMS = ["Instagram", "YouTube", "LinkedIn", "X", "All Platforms"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const WEEKDAYS: { label: string; x: number; color: string }[] = [
  { label: "Mon", x: 311.6, color: "#000000" },
  { label: "Tue", x: 415.8, color: "#000000" },
  { label: "Wed", x: 513.4, color: "#000000" },
  { label: "Thu", x: 617.7, color: "#000000" },
  { label: "Fri", x: 723.8, color: "#000000" },
  { label: "Sat", x: 822.4, color: "#D85859" },
  { label: "Sun", x: 922.9, color: "#D43131" },
];

export default function CalendarAllCreatorPage() {
  const navigate = useNavigate();
  const { data: calendar } = useCalendar();
  const { data: creators } = useCreators();
  const [platform, setPlatform] = useState("All Platforms");
  const [platformOpen, setPlatformOpen] = useState(false);
  const [month, setMonth] = useState<string | null>(null);
  const [monthOpen, setMonthOpen] = useState(false);
  const items = calendar ?? [];
  const creatorList = creators ?? [];
  // Default month follows the first scheduled item (live data), Figma fallback otherwise.
  const activeMonth = month ?? (items[0] ? MONTHS[new Date(items[0].scheduledAt).getMonth()] : "October");
  const monthItems = items.filter((it) => MONTHS[new Date(it.scheduledAt).getMonth()] === activeMonth);
  const showInstagram = platform === "All Platforms" || platform === "Instagram";
  const showYoutube = platform === "All Platforms" || platform === "YouTube";
  const fmtDay = (iso?: string) =>
    iso ? new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "long" }) : "";

  return (
    <>
      {/* back button — 235,153 · 45×45 black circle */}
      <button
        onClick={() => navigate(-1)}
        className="absolute left-[235px] top-[153px] flex h-[45px] w-[45px] items-center justify-center rounded-full bg-black"
      >
        <ArrowLeft className="h-[20px] w-[20px] text-white" strokeWidth={1.8} />
      </button>

      {/* title — 261,232 · Outfit 400 34px */}
      <h1 className="absolute left-[261px] top-[232px] text-[34px] font-normal leading-[43px] text-black">
        Manage Calenar
      </h1>

      {/* All Platforms pill — 609,246 · 170×45 · bg rgba(0,0,0,0.9) r=28 */}
      <div
        onClick={() => {
          setPlatformOpen((o) => !o);
          setMonthOpen(false);
        }}
        className="absolute left-[609px] top-[246px] h-[45px] w-[170px] rounded-[28px] bg-black/90 cursor-pointer"
      >
        <span className="absolute left-[12px] top-[10px] text-[20px] font-light leading-[25px] text-white">
          {platform}
        </span>
        <ChevronDown className="absolute left-[134px] top-[14px] h-[16px] w-[16px] text-white" strokeWidth={2} />
      </div>

      {/* platform dropdown (opens under the pill) */}
      {platformOpen && (
        <div className="absolute left-[609px] top-[295px] z-50 w-[170px] overflow-hidden rounded-[10px] border border-[#ECECEC] bg-white shadow-[0_8px_24px_rgba(0,0,0,0.12)]">
          {PLATFORMS.map((p, i) => (
            <div
              key={p}
              onClick={() => {
                setPlatform(p);
                setPlatformOpen(false);
              }}
              className={`flex h-[35.6px] cursor-pointer items-center pl-[13px] text-[15px] font-normal text-black hover:bg-black/5 ${
                i < PLATFORMS.length - 1 ? "border-b border-[#ECECEC]" : ""
              }`}
            >
              {p}
            </div>
          ))}
        </div>
      )}

      {/* Calendar pill — 875,246 · 124×45 · white r=24 border */}
      <div
        onClick={() => navigate("/calendar")}
        className="absolute left-[875px] top-[246px] h-[45px] w-[124px] rounded-[24px] border-[0.5px] border-[#CCCCCC] bg-white cursor-pointer"
      >
        <LinkIcon className="absolute left-[12px] top-[13px] h-[19px] w-[19px] text-black" strokeWidth={1.7} />
        <span className="absolute left-[40px] top-[12px] text-[14px] font-light leading-[24px] text-black">Calendar</span>
      </div>

      {/* calendar container card — 268.9,315 · 715.2×872 r=10 */}
      <div className="absolute left-[268.9px] top-[315px] h-[872px] w-[715.2px] rounded-[10px] border border-[#D9D9D9]" />

      {/* October pill — 281.9,331 · 108×45 · white/90 r=28 */}
      <div
        onClick={() => {
          setMonthOpen((o) => !o);
          setPlatformOpen(false);
        }}
        className="absolute left-[281.9px] top-[331px] h-[45px] w-[108px] rounded-[28px] border border-[#D9D9D9] bg-white/90 cursor-pointer"
      >
        <span className="absolute left-[14px] top-[13px] text-[14px] font-light leading-[18px] text-black">{activeMonth}</span>
        <ChevronDown className="absolute left-[77px] top-[14px] h-[15px] w-[15px] text-black" strokeWidth={2} />
      </div>

      {/* month dropdown (opens under the pill) */}
      {monthOpen && (
        <div className="absolute left-[281.9px] top-[380px] z-50 max-h-[321px] w-[108px] overflow-y-auto rounded-[10px] border border-[#ECECEC] bg-white shadow-[0_8px_24px_rgba(0,0,0,0.12)]">
          {MONTHS.map((m, i) => (
            <div
              key={m}
              onClick={() => {
                setMonth(m);
                setMonthOpen(false);
              }}
              className={`flex h-[35.6px] cursor-pointer items-center pl-[13px] text-[14px] font-normal text-black hover:bg-black/5 ${
                i < MONTHS.length - 1 ? "border-b border-[#ECECEC]" : ""
              }`}
            >
              {m}
            </div>
          ))}
        </div>
      )}

      {/* Neha Kapoor viewer chip — 749,334 · 227×39 · white r=21 */}
      <div
        onClick={() =>
          navigate(creatorList[0] ? `/creators/detail?id=${creatorList[0].id}` : "/creators")
        }
        className="absolute left-[749px] top-[334px] h-[39px] w-[227px] rounded-[21px] border-[0.6px] border-[#D9D9D9] bg-white cursor-pointer"
      >
        <span className="absolute left-[7px] top-[8px] h-[20px] w-[20px] rounded-full bg-gradient-to-br from-[#C8E6FF] to-[#C8B3ED]" />
        <span className="absolute left-[30px] top-[9px] text-[14.6px] font-normal leading-[20px] text-black/90">
          {creatorList[0]?.name ?? ""}
        </span>
        <span className="absolute left-[149px] top-[10px] text-[10px] font-normal leading-[16px] text-black/70">
          View Only
        </span>
        <Eye className="absolute left-[200px] top-[13px] h-[12px] w-[12px] text-black/70" strokeWidth={1.6} />
      </div>

      {/* weekday headers — y 396.4 · Outfit 300 16.9px */}
      {WEEKDAYS.map((w) => (
        <span
          key={w.label}
          className="absolute top-[396px] text-[16.9px] font-light leading-[22.5px]"
          style={{ left: w.x, color: w.color }}
        >
          {w.label}
        </span>
      ))}

      {/* day grid */}
      {GRID.map((week, ri) =>
        week.map((day, ci) => {
          const x = COLS[ci];
          const y = ROWS[ri];
          const isHighlight = ri === 0 && ci === 3; // 4
          const isTitan = ri === 0 && ci === 4; // 5
          const isVideo = ri === 2 && ci === 3; // 18
          return (
            <div
              key={`${ri}-${ci}`}
              className="absolute rounded-[16.9px] bg-white"
              style={{ left: x, top: y, width: 93.9, height: 129.6 }}
            >
              {isHighlight ? (
                <span className="absolute left-[4.6px] top-[5.6px] flex h-[41.8px] w-[39.4px] items-center justify-center rounded-full bg-[#D4EBF9] text-[18.8px] font-normal text-black">
                  {day}
                </span>
              ) : (
                <span className="absolute left-[14.1px] top-[15px] text-[18.8px] font-normal leading-[22.5px] text-black">
                  {day}
                </span>
              )}

              {isTitan && showInstagram && monthItems[0] && (
                <span
                  onClick={() => navigate("/calendar/shift")}
                  className="absolute left-[3.7px] top-[92.9px] flex h-[23.5px] w-[86.4px] items-center gap-[3px] rounded-[7.5px] bg-[#DC96F2]/[0.38] px-[6px] cursor-pointer"
                >
                  <img src={instagram} alt="" className="h-[11.3px] w-[11.3px]" />
                  <span className="text-[11.6px] font-normal leading-none text-black/90">{monthItems[0]?.title ?? ""}</span>
                </span>
              )}

              {isVideo && showYoutube && monthItems[1] && (
                <span
                  onClick={() => navigate("/calendar/shift")}
                  className="absolute left-[3.7px] top-[92px] flex h-[23.5px] w-[86.4px] items-center gap-[3px] rounded-[7.5px] bg-[#9EE4AD]/[0.38] px-[6px] cursor-pointer"
                >
                  <Youtube className="h-[14px] w-[14px] text-[#FF0000]" strokeWidth={1.6} />
                  <span className="text-[11.6px] font-normal leading-none text-black/90">{monthItems[1]?.title ?? ""}</span>
                </span>
              )}
            </div>
          );
        }),
      )}

      {/* ---------------- Generate Content card — 1020,257 · 331×594 ---------------- */}
      <div className="absolute left-[1020px] top-[257px] h-[594px] w-[331px] rounded-[12px] border border-[#D68A8A] bg-white/50" />

      <span className="absolute left-[1031px] top-[266px] text-[15px] font-normal leading-[24px] text-black">
        Generate Content
      </span>

      <button
        onClick={() => navigate("/calendar/shift")}
        className="absolute left-[1321px] top-[257px] flex h-[28px] w-[28px] items-center justify-center rounded-[16px] bg-white"
      >
        <ArrowUpRight className="h-[15px] w-[15px] text-black" strokeWidth={1.7} />
      </button>

      {/* inner white content card — 1031,296 · 312×546 */}
      <div className="absolute left-[1031px] top-[296px] h-[546px] w-[312px] rounded-[12px] border border-[#EAEAEA] bg-white">
        {/* 05 July chip */}
        <span className="absolute left-[9px] top-[9px] flex h-[25px] w-[56px] items-center justify-center rounded-[14px] border-[0.6px] border-[#D6D6D6] bg-white font-inter text-[10.2px] text-black">
          {fmtDay(monthItems[2]?.scheduledAt)}
        </span>
        {/* V1 chip */}
        <span className="absolute left-[152px] top-[9px] flex h-[25px] w-[35px] items-center justify-center rounded-[14px] border-[0.6px] border-[#D6D6D6] bg-[#EEFACB] font-inter text-[10.2px] text-black">
          V1
        </span>
        {/* Nike Post chip */}
        <span className="absolute left-[9px] top-[41px] flex h-[25px] w-[92px] items-center gap-[3px] rounded-[8px] bg-[#E0E49E]/[0.38] px-[6px]">
          <img src={instagram} alt="" className="h-[12px] w-[12px]" />
          <span className="text-[12.4px] font-normal leading-none text-black/90">{monthItems[2]?.title ?? ""}</span>
        </span>
        {/* body */}
        <p className="absolute left-[10px] top-[80px] w-[285px] whitespace-pre-line text-[12px] font-normal leading-[16px] text-black/60">
          {"“Born from speed. Raised by streets. Feared by gravity.”\nBecause these aren’t just sneakers. They’re a statement your feet won’t shut up about."}
        </p>
        {/* hashtags */}
        <p className="absolute left-[8px] top-[197px] w-[283px] text-[12px] font-normal leading-[16px] text-black/70">
          #Nike #JustDoIt #SneakerDrop #StreetwearCulture #KickGameStrong #Sneakerhead #RunTheStreets #AthleteMindset #HypeBeast #BuiltDifferent #AirMaxVibes #UrbanLegends #GravityWho #UnstoppableMoves #LegendInLaces
        </p>
      </div>
    </>
  );
}
