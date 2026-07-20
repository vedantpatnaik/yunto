import { TrendingUp, ArrowUpRight, ArrowRightToLine, Paperclip, Copy, ChevronUp, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import agencyLine from "@/assets/icons/revenue-agency-line.svg";
import yuntoLine from "@/assets/icons/revenue-yunto-line.svg";
import { clearToken } from "@/api/client";
import { useAgencies, useDashboard, type Agency } from "@/api/hooks";

/** 1_200_000 -> "1.2M", 900_000 -> "900k", 950 -> "950" */
const compact = (n: number): string =>
  n >= 1_000_000
    ? (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M"
    : n >= 1_000
      ? Math.round(n / 1_000) + "k"
      : String(n);

/* decorative per-row avatar classes (kept exactly as designed) */
const AVATARS = [
  "bg-gradient-to-br from-[#34C77E] to-[#1E8F5A]",
  "bg-[#1A1A1A]",
  "bg-gradient-to-br from-[#E7DEFF] to-[#B9A4EA]",
];

/**
 * Super Admin — Revenue.
 * Exact reconstruction of Figma frame 5227:14922 ("yunto revenue"), 1440×1024,
 * shown with the profile / Log-Out overlay open (rgba(0,0,0,0.5) scrim on top).
 * Renders inside AppShell (TopBar + Sidebar already provided); the scrim dims them too.
 */

/* ------------------------------ primitives ----------------------------- */
function Pct({ left, top, val, color }: { left: number; top: number; val: string; color: string }) {
  return (
    <span className="absolute flex items-center gap-[1px]" style={{ left, top }}>
      <TrendingUp className="h-[12px] w-[14px]" style={{ color }} strokeWidth={2.4} />
      <span className="text-[12px] font-bold" style={{ color }}>{val}</span>
    </span>
  );
}

function CardArrow({ left, top, light, onClick }: { left: number; top: number; light?: boolean; onClick?: () => void }) {
  return (
    <span onClick={onClick} className={`absolute flex h-[24px] w-[24px] items-center justify-center${onClick ? " cursor-pointer" : ""}`} style={{ left, top }}>
      <ArrowUpRight className={`h-[16px] w-[16px] ${light ? "text-white" : "text-[#0D141C]"}`} strokeWidth={2} />
    </span>
  );
}

/* metric cell reused inside every table row (positions relative to the row) */
function Metric({ baseX, big, pct, sub }: { baseX: number; big: string; pct: string; sub: string }) {
  return (
    <>
      <span className="absolute top-[16px] text-[14px] text-[#0D141C]" style={{ left: baseX }}>{big}</span>
      <span className="absolute top-[14px] flex items-center gap-[1px]" style={{ left: baseX + 38 }}>
        <TrendingUp className="h-[12px] w-[14px] text-[#04910C]" strokeWidth={2.4} />
        <span className="text-[12px] font-bold text-[#04910C]">{pct}</span>
      </span>
      <span className="absolute top-[33px] text-[12px] text-[#737373]" style={{ left: baseX - 2 }}>{sub}</span>
    </>
  );
}

function RevRow({ top, agency, avatar }: { top: number; agency: Agency; avatar: string }) {
  const navigate = useNavigate();
  return (
    <div className="absolute left-[282px] h-[67px] w-[1075px] rounded-[12px] border border-[#D6D6D6] bg-[#F9F9F9]" style={{ top }}>
      {/* agency */}
      <span className={`absolute left-[12px] top-[13px] h-[28px] w-[28px] rounded-full ${avatar}`} />
      <span className="absolute left-[45px] top-[17px] text-[14px] text-black/90">{agency.name}</span>
      <span className="absolute left-[45px] top-[35px] text-[12px] font-light text-black/70">{`${agency.creatorsCount} Creators`}</span>

      {/* subscription */}
      <span className="absolute left-[190px] top-[16px] h-[38px] w-[8px] rounded-[10px] bg-[#BE5BAB]" />
      <span className="absolute left-[202px] top-[14px] w-[175px] whitespace-pre-line text-[14px] leading-[21px] text-[#0D141C]">
        {"LITE - 12/01/2025\n$60/Yearly"}
      </span>

      {/* revenue metrics */}
      <Metric baseX={407} big={`₹${compact(agency.earnings)}`} pct="1.5%" sub="Latest" />
      <Metric baseX={588} big={String(agency.campaignsCount)} pct="1.5%" sub="From last month" />
      <Metric baseX={769} big="50k" pct="1.5%" sub="From last week" />

      {/* invoice */}
      <div onClick={() => navigate("/invoices")} className="absolute left-[925px] top-[15px] flex h-[37px] w-[133px] items-center gap-[6px] rounded-[12px] border border-[#D6D6D6] pl-[8px] cursor-pointer">
        <Paperclip className="h-[15px] w-[13px] text-black" strokeWidth={1.6} />
        <span className="text-[14px] text-black/50">INV-2025-045</span>
      </div>
    </div>
  );
}

/* -------------------------------- page --------------------------------- */
export default function RevenuePage() {
  const navigate = useNavigate();
  const { data: agencyData } = useAgencies();
  const { data: dash } = useDashboard();
  const agencies = [...(agencyData ?? [])].sort((a, b) => b.earnings - a.earnings);
  const top3 = agencies.slice(0, 3);
  const totalEarnings = agencies.reduce((s, a) => s + a.earnings, 0);
  return (
    <>
      {/* ─── page heading ─── */}
      <h1 className="absolute left-[254px] top-[158px] text-[40px] font-normal leading-none text-ink">REVENUE</h1>

      {/* ─── Total Agencies Revenue card ─── */}
      <div className="absolute left-[254px] top-[242px] h-[151px] w-[267px] rounded-[20px] bg-white" />
      <span className="absolute left-[274px] top-[262px] text-[16px] font-semibold text-[#454545]">Total Agencies Revenue</span>
      <CardArrow left={477} top={262} />
      <span className="absolute left-[274px] top-[297px] text-[28px] font-semibold leading-none text-[#6F5ED1]">{agencies.length ? compact(totalEarnings) : ""}</span>
      <Pct left={436} top={296} val="10.6%" color="#09DE13" />
      <span className="absolute left-[401px] top-[316px] text-[12px] text-[#737373]">Agency Revenue</span>
      <span className="absolute left-[274px] top-[340px] text-[28px] font-semibold leading-none text-[#AAE215]">500k</span>
      <Pct left={443} top={339} val="7.6%" color="#09DE13" />
      <span className="absolute left-[411px] top-[359px] text-[12px] text-[#737373]">Yunto Revenue</span>

      {/* ─── Yunto ARR card ─── */}
      <div className="absolute left-[540px] top-[242px] h-[151px] w-[272px] rounded-[20px] bg-white" />
      <span className="absolute left-[560px] top-[263px] text-[16px] font-semibold text-[#454545]">Yunto ARR</span>
      <CardArrow left={768} top={262} />
      <span className="absolute left-[560px] top-[337px] text-[28px] font-semibold leading-none text-[#6F5ED1]">105.2Cr</span>
      <Pct left={738} top={336} val="3.6%" color="#04910C" />
      <span className="absolute left-[707px] top-[356px] text-[12px] text-[#737373]">From last week</span>

      {/* ─── This Month Revenue card (purple) ─── */}
      <div className="absolute left-[254px] top-[403px] h-[151px] w-[267px] rounded-[20px] bg-[#998ED8]" />
      <span className="absolute left-[270px] top-[420px] text-[16px] font-semibold text-white">This Month Revenue</span>
      <CardArrow left={481} top={419} light />
      <span className="absolute left-[270px] top-[460px] text-[28px] font-semibold leading-none text-white">{dash ? compact(dash.overview.monthlyRevenue) : ""}</span>
      <Pct left={445} top={459} val="10.6%" color="#09DE13" />
      <span className="absolute left-[410px] top-[479px] text-[12px] text-[#F6F6F6]">Agency Revenue</span>
      <span className="absolute left-[270px] top-[504px] text-[28px] font-semibold leading-none text-white">90k</span>
      <Pct left={445} top={503} val="10.6%" color="#09DE13" />
      <span className="absolute left-[420px] top-[523px] text-[12px] text-[#F6F6F6]">Yunto Revenue</span>

      {/* ─── Creator Revenue card ─── */}
      <div className="absolute left-[540px] top-[403px] h-[151px] w-[272px] rounded-[20px] bg-white" />
      <span className="absolute left-[560px] top-[424px] text-[16px] font-semibold text-[#454545]">Creator Revenue</span>
      <CardArrow left={768} top={423} onClick={() => navigate("/creators")} />
      <span className="absolute left-[560px] top-[460px] text-[28px] font-semibold leading-none text-[#6F5ED1]">100k</span>
      <Pct left={738} top={459} val="3.6%" color="#04910C" />
      <span className="absolute left-[707px] top-[479px] text-[12px] text-[#737373]">From last week</span>
      <span className="absolute left-[560px] top-[504px] text-[28px] font-semibold leading-none text-[#AAE215]">50k</span>
      <Pct left={740} top={503} val="1.5%" color="#04910C" />
      <span className="absolute left-[707px] top-[523px] text-[12px] text-[#737373]">Yunto Revenue</span>

      {/* ─── Sales Overview chart card ─── */}
      <div className="absolute left-[823px] top-[242px] h-[312px] w-[558px] rounded-[24px] bg-white" />
      <span className="absolute left-[843px] top-[262px] text-[16px] font-semibold text-[#454545]">Sales Overview</span>
      {/* Yearly selector */}
      <div className="absolute left-[1263px] top-[262px] flex h-[32px] w-[98px] items-center gap-[6px] rounded-[28px] border border-[#D9D9D9] bg-white/90 pl-[16px]">
        <span className="text-[14px] font-light text-black">Yearly</span>
        <ChevronUp className="h-[13px] w-[13px] text-black" strokeWidth={2} />
        <Plus className="h-[13px] w-[13px] text-black" strokeWidth={2} />
      </div>
      {/* legend */}
      <span className="absolute left-[844px] top-[290px] h-[14px] w-[14px] rounded-[2px] bg-[#BCF328]" />
      <span className="absolute left-[862px] top-[289px] text-[12px] text-[#737373]">Agency Revenue</span>
      <span className="absolute left-[973px] top-[290px] h-[14px] w-[14px] rounded-[2px] bg-[#7D6FCB]" />
      <span className="absolute left-[991px] top-[289px] text-[12px] text-[#737373]">Yunto Revenue</span>
      {/* plotted lines */}
      <img src={agencyLine} alt="" className="absolute left-[843px] top-[364px] w-[533px]" />
      <img src={yuntoLine} alt="" className="absolute left-[843px] top-[373px] w-[541px]" />
      {/* current-period divider */}
      <span className="absolute left-[1109px] top-[347px] h-[229px] w-[3px] rounded-[1px] bg-gradient-to-b from-[#7D6FCB] to-[#BCF328]" />
      {/* tooltip cards */}
      <div className="absolute left-[1009px] top-[347px] h-[54px] w-[94px] rounded-[12px] border border-dashed border-[#7D6FCB] px-[8px] pt-[8px]">
        <div className="text-[10px] text-[#888888]">Yunto Revenue</div>
        <div className="text-[14px] font-bold text-[#454545]">₹1.3Cr</div>
      </div>
      <div className="absolute left-[1118px] top-[347px] h-[54px] w-[89px] rounded-[12px] bg-[#BCF328] px-[8px] pt-[8px]">
        <div className="text-[10px] text-[#888888]">Agency Revenue</div>
        <div className="text-[14px] font-bold text-[#454545]">₹170Cr</div>
      </div>
      {/* month axis */}
      <div className="absolute left-0 top-[504px] text-[14px] text-[#737373]">
        <span className="absolute left-[858px]">Jan</span>
        <span className="absolute left-[904px]">Feb</span>
        <span className="absolute left-[956px]">Mar</span>
        <span className="absolute left-[1004px]">Apr</span>
        <span className="absolute left-[1051px]">Jun</span>
        <span className="absolute left-[1099px]">Jul</span>
        <span className="absolute left-[1140px]">Aug</span>
        <span className="absolute left-[1184px]">Sep</span>
        <span className="absolute left-[1230px]">Oct</span>
        <span className="absolute left-[1276px]">Nov</span>
        <span className="absolute left-[1321px]">Dec</span>
      </div>

      {/* ─── Agency Overview table card ─── */}
      <div className="absolute left-[254px] top-[571px] h-[402px] w-[1127px] rounded-[24px] bg-white" />
      <span className="absolute left-[282px] top-[591px] text-[24px] font-medium leading-none text-black">Agency Overview</span>

      {/* filter chips */}
      <span className="absolute left-[598px] top-[602px] text-[14px] text-[#0D141C]/70">{`ALL (${agencies.length})`}</span>
      <div className="absolute left-[696px] top-[597px] flex h-[31px] w-[102px] items-center gap-[5px] rounded-[6px] bg-white pl-[5px]">
        <span className="h-[8px] w-[20px] rounded-full bg-[#BE5BAB]" />
        <span className="text-[14px] text-black">LITE (150)</span>
      </div>
      <span className="absolute left-[828px] top-[609px] h-[8px] w-[20px] rounded-full bg-[#824C97]" />
      <span className="absolute left-[853px] top-[602px] text-[14px] text-[#0D141C]">PRO (200)</span>
      <span className="absolute left-[956px] top-[609px] h-[8px] w-[20px] rounded-full bg-[#393C83]" />
      <span className="absolute left-[981px] top-[602px] text-[14px] text-[#0D141C]">ULTIMATE (180)</span>
      <span className="absolute left-[1114px] top-[609px] h-[8px] w-[20px] rounded-full bg-[#ED743F]" />
      <span className="absolute left-[1139px] top-[602px] text-[14px] text-[#0D141C]">CUSTOM (70)</span>
      <span className="absolute left-[1259px] top-[609px] h-[8px] w-[20px] rounded-full bg-[#EE58BA]" />
      <span className="absolute left-[1284px] top-[602px] text-[14px] text-[#0D141C]">FREE (200)</span>

      {/* table header */}
      <div className="absolute left-[282px] top-[647px] h-[42px] w-[1075px] rounded-[12px] border border-[#7D6FCB] bg-[#F3F1FF]" />
      <span className="absolute left-[318px] top-[657px] text-[16px] text-[#624DD9]">Agency</span>
      <span className="absolute left-[495px] top-[657px] text-[16px] text-[#624DD9]">Subscription</span>
      <span className="absolute left-[688px] top-[657px] text-[16px] text-[#624DD9]">Total Revenue</span>
      <span className="absolute left-[868px] top-[657px] text-[16px] text-[#624DD9]">This Month</span>
      <span className="absolute left-[1050px] top-[657px] text-[16px] text-[#624DD9]">Yunto Revenue</span>
      <span className="absolute left-[1231px] top-[657px] text-[16px] text-[#624DD9]">Invoices</span>

      {/* table rows */}
      {top3.map((a, i) => (
        <RevRow key={a.id} top={700 + i * 77} agency={a} avatar={AVATARS[i % AVATARS.length]} />
      ))}

      {/* ─── overlay: scrim + profile / Log Out popup ─── */}
      {/* scrim sits above the TopBar (z-10) so the whole 1440×1024 frame dims */}
      <div onClick={() => navigate(-1)} className="absolute inset-0 z-20 bg-black/50 cursor-pointer" />
      <div className="absolute left-[1041px] top-[66px] z-30 h-[299px] w-[309px] rounded-[12px] border border-[#D2D2D2] bg-white shadow-[0_12px_40px_rgba(0,0,0,0.12)]">
        {/* avatar */}
        <span className="absolute left-[114px] top-[26px] h-[82px] w-[82px] rounded-full border border-black/10 bg-gradient-to-br from-[#EAD9FF] to-[#C3A9F0]" />
        <span className="absolute left-[146px] top-[31px] text-[17px] leading-none">👑</span>
        {/* name / role */}
        <span className="absolute left-[87px] top-[120px] w-[135px] text-center text-[20px] font-semibold text-[#111827]">Shubham Arya</span>
        <span className="absolute left-[87px] top-[143px] w-[135px] text-center text-[12px] text-[#6B7280]">Admin</span>
        {/* agency code pill */}
        <div className="absolute left-[83px] top-[168px] flex h-[28px] w-[144px] items-center justify-center gap-[6px] rounded-full border border-black/10 bg-white/60">
          <span className="text-[10px]">
            <span className="text-black/50">Agency Code </span>
            <span className="text-black/85">55678</span>
          </span>
          <Copy onClick={() => navigator.clipboard.writeText("55678")} className="h-[13px] w-[13px] text-black cursor-pointer" strokeWidth={1.7} />
        </div>
        {/* log out */}
        <ArrowRightToLine onClick={() => { clearToken(); navigate("/login"); }} className="absolute left-[27px] top-[231px] h-[22px] w-[22px] text-black cursor-pointer" strokeWidth={1.8} />
        <span onClick={() => { clearToken(); navigate("/login"); }} className="absolute left-[69px] top-[229px] text-[18px] text-black cursor-pointer">Log Out</span>
      </div>
    </>
  );
}
