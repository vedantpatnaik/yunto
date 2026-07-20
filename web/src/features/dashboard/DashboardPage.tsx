import type { ReactNode } from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { LucideIcon } from "lucide-react";
import { Clock3, Users, Eye, Tag, Wallet, Megaphone, ArrowUpRight, ChevronDown } from "lucide-react";
import { useDashboard, useMe } from "@/api/hooks";

/**
 * Super Admin — Dashboard.
 * Exact reconstruction of Figma frame 7917:13074 ("yunto dashboard"), 1440×1024.
 * Layout is pixel-traced to Figma; all numbers are LIVE from the backend
 * (/stats/dashboard) — falls back to representative values while loading.
 */

/* --------------------------- format helpers ---------------------------- */
const inr = (n: number) => n.toLocaleString("en-IN");
const compact = (n: number) =>
  n >= 1_000_000 ? `${(n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1)}M`
  : n >= 1_000 ? `${Math.round(n / 1_000)}k`
  : `${n}`;

const RINGS = ["from-[#F1FFC3] to-[#C8B3ED]", "from-[#FFD6E7] to-[#C8B3ED]", "from-[#C8E6FF] to-[#C8B3ED]"];
const AG_COLORS = ["bg-[#1FB37A]", "bg-[#8D8D8D]", "bg-[#7C5CFC]", "bg-black"];

// x positions of the 5 revenue bars (frame-exact); heights come from live data.
const REV_X = [116, 178, 239, 301, 363];
const BASELINE = 347;
const MAX_BAR = 144;

const GRID = [
  { label: "$200", y: 107 },
  { label: "$150", y: 179 },
  { label: "$100", y: 257 },
  { label: "$50", y: 337 },
];

/* ----------------------------- primitives ------------------------------ */
function MiniStat({ icon: Icon, children }: { icon: LucideIcon; children: ReactNode }) {
  return (
    <span className="flex items-center gap-[3px] whitespace-nowrap text-[12px] font-normal text-ink/80">
      <Icon className="h-[13px] w-[13px] shrink-0 text-ink/70" strokeWidth={1.6} />
      {children}
    </span>
  );
}

function ArrowBtn() {
  return (
    <span className="flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full bg-white/80">
      <ArrowUpRight className="h-[14px] w-[14px] text-ink" strokeWidth={1.8} />
    </span>
  );
}

function ProgressBars({ a, b, c }: { a: number; b: number; c: number }) {
  const total = 35;
  const na = Math.round((a / total) * 35);
  const seg = [
    ...Array(a).fill("bg-seg-new"),
    ...Array(b).fill("bg-seg-contacted"),
    ...Array(c).fill("bg-seg-converted"),
    ...Array(Math.max(0, 35 - a - b - c)).fill("bg-line"),
  ].slice(0, 35);
  void na;
  return (
    <div className="flex h-[26px] items-center gap-[3.5px]">
      {seg.map((cl, i) => (
        <span key={i} className={`h-[26px] w-[3px] rounded-full ${cl}`} />
      ))}
    </div>
  );
}

function ProgressCard({
  title, total, a, b, c, labels,
}: { title: string; total: number; a: number; b: number; c: number; labels: [string, string, string] }) {
  const pct = total ? Math.round((c / total) * 100) : 0;
  return (
    <div className="h-[132px] w-[306px] rounded-inner bg-white px-[12px] py-[13px] shadow-[0_4px_16px_rgba(0,0,0,0.03)]">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-normal text-ink/80">{title}</span>
        <span className="rounded-full bg-[#F1F1F1] px-[8px] py-[2px] text-[10px] text-ink">{total} Total</span>
        <span className="text-[10px] text-ink/70">{pct}% Converted</span>
      </div>
      <div className="mt-[16px]">
        <ProgressBars a={a} b={b} c={c} />
        <div className="mt-[6px] flex justify-between text-[10px] text-ink/80">
          <span>0</span><span>25</span><span>50</span><span>100</span>
        </div>
      </div>
      <div className="mt-[14px] flex items-center justify-between text-[10px] text-ink">
        <span className="flex items-center gap-[4px]"><i className="h-[8px] w-[8px] rounded-full bg-seg-new" />{labels[0]}</span>
        <span className="flex items-center gap-[4px]"><i className="h-[8px] w-[8px] rounded-full bg-seg-contacted" />{labels[1]}</span>
        <span className="flex items-center gap-[4px]"><i className="h-[8px] w-[8px] rounded-full bg-seg-converted" />{labels[2]}</span>
      </div>
    </div>
  );
}

/* ------------------------------- page ---------------------------------- */
export default function DashboardPage() {
  const { data } = useDashboard();
  const { data: me } = useMe();
  const navigate = useNavigate();
  const [period, setPeriod] = useState<"D" | "W" | "M">("D");
  const ov = data?.overview;
  const STATS = [
    { label: "Active Agencies", value: ov ? inr(ov.activeAgencies) : "—" },
    { label: "Active Creators", value: ov ? inr(ov.activeCreators) : "—" },
    { label: "Monthly Revenue", value: ov ? compact(ov.monthlyRevenue) : "—" },
    { label: "Active Leads", value: ov ? inr(ov.activeLeads) : "—" },
    { label: "Active Campaigns", value: ov ? inr(ov.activeCampaigns) : "—" },
    { label: "Pending Pay-Outs", value: ov ? inr(ov.pendingPayouts) : "—" },
  ];
  const CREATORS = (data?.topCreators ?? []).map((c, i) => ({
    name: c.name, handle: c.handle, followers: compact(c.followers),
    views: `${compact(c.avgViews)} views`, leads: `${c.leadsCount} leads`, ring: RINGS[i % 3],
  }));
  const AGENCIES = (data?.topAgencies ?? []).map((a, i) => ({
    name: a.name, sub: a.description, creators: String(a.creatorsCount),
    earn: compact(a.earnings), campaigns: `${a.campaignsCount} Campaigns`, color: AG_COLORS[i % 4],
  }));
  const revMax = Math.max(1, ...(data?.revenue ?? []).map((r) => r.value));
  const REVENUE = (data?.revenue ?? []).map((r, i) => {
    const h = Math.max(10, Math.round((r.value / revMax) * MAX_BAR));
    return { m: r.month, x: REV_X[i], top: BASELINE - h, h };
  });
  const lp = data?.leadProgress;
  const cp = data?.campaignProgress;
  const topPerf = (data?.topPerforming ?? []).map((t, i) => ({
    n: t.name, c: ["#7427FF", "#945CF8", "#B289FA"][i % 3], v: `₹${compact(t.earnings)}`,
  }));

  return (
    <>
      {/* Hello, Shubham — 254,158 · Outfit 400 40px */}
      <h1 className="absolute left-[254px] top-[150px] font-sans text-[40px] font-normal text-ink">
        Hello, {me?.name ?? "there"}
      </h1>

      {/* ============================ Overview ============================ */}
      <section className="absolute left-[242px] top-[230px] h-[289px] w-[802px] rounded-card border border-white/40 bg-white/40 backdrop-blur-md">
        <h2 className="absolute left-[40px] top-[25px] text-[28px] font-normal leading-none text-ink">Overview</h2>
        {STATS.map((s, i) => {
          const col = i % 3;
          const row = Math.floor(i / 3);
          const x = 31 + col * 260;
          const labelY = 96 + row * 107;
          return (
            <div key={s.label} className="absolute" style={{ left: x, top: labelY, width: 230 }}>
              <div className="text-[20px] font-light leading-none text-muted">{s.label}</div>
              <div className="mt-[16px] flex items-center gap-[8px]">
                <span className="flex h-[22px] w-[22px] items-center justify-center rounded-full bg-[#FDECEC]">
                  <Clock3 className="h-[13px] w-[13px] text-[#E8735B]" strokeWidth={1.8} />
                </span>
                <span className="text-[32px] font-medium leading-none text-ink">{s.value}</span>
              </div>
            </div>
          );
        })}
      </section>

      {/* ========================== Top Creators ========================= */}
      <section className="absolute left-[1067px] top-[223px] h-[323px] w-[343px] rounded-card bg-creators-grad">
        <h2 className="absolute left-[20px] top-[15px] text-[24px] font-normal leading-none text-slate900">Top Creators</h2>
        <div className="absolute right-[20px] top-[16px] flex items-center gap-[6px] rounded-full bg-white/60 px-[6px] py-[4px] text-[12px] text-ink">
          <span onClick={() => setPeriod("D")} className={period === "D" ? "flex h-[20px] w-[20px] cursor-pointer items-center justify-center rounded-full bg-white" : "cursor-pointer"}>D</span>
          <span onClick={() => setPeriod("W")} className={period === "W" ? "flex h-[20px] w-[20px] cursor-pointer items-center justify-center rounded-full bg-white" : "cursor-pointer"}>W</span>
          <span onClick={() => setPeriod("M")} className={period === "M" ? "flex h-[20px] w-[20px] cursor-pointer items-center justify-center rounded-full bg-white" : "cursor-pointer pr-[2px]"}>M</span>
        </div>
        {CREATORS.map((c, i) => (
          <div
            key={c.name}
            onClick={() => navigate("/creators/detail")}
            className="absolute flex h-[62px] w-[318px] cursor-pointer items-center gap-[10px] rounded-[16px] bg-white/45 px-[11px]"
            style={{ left: 13, top: 67 + i * 72 }}
          >
            <span className={`h-[40px] w-[40px] shrink-0 rounded-full bg-gradient-to-br ${c.ring}`} />
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline gap-[6px]">
                <span className="text-[14px] font-medium text-ink/90">{c.name}</span>
                <span className="text-[11px] text-ink/70">{c.handle}</span>
              </div>
              <div className="mt-[5px] flex items-center gap-[9px]">
                <MiniStat icon={Users}>{c.followers}</MiniStat>
                <MiniStat icon={Eye}>{c.views}</MiniStat>
                <MiniStat icon={Tag}>{c.leads}</MiniStat>
              </div>
            </div>
            <ArrowBtn />
          </div>
        ))}
      </section>

      {/* ========================== Top Agencies ========================= */}
      <section className="absolute left-[242px] top-[566px] h-[428px] w-[343px] rounded-card bg-agencies-grad">
        <div className="absolute left-[20px] top-[15px] flex items-center gap-[10px]">
          <h2 className="text-[24px] font-normal leading-none text-slate900">Top Agencies</h2>
          <span className="flex h-[22px] min-w-[22px] items-center justify-center rounded-full bg-white/80 px-[6px] text-[13px] text-ink">{data?.agenciesTotal ?? ""}</span>
        </div>
        {AGENCIES.map((a, i) => (
          <div
            key={a.name}
            className="absolute flex h-[74px] w-[318px] items-center gap-[10px] rounded-[16px] bg-white/45 px-[11px]"
            style={{ left: 13, top: 67 + i * 84 }}
          >
            <span className={`flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-full ${a.color}`} />
            <div className="min-w-0 flex-1">
              <div className="truncate text-[12px] font-medium text-ink/90">{a.name}</div>
              <div className="truncate text-[11px] text-ink/70">{a.sub}</div>
              <div className="mt-[5px] flex items-center gap-[9px]">
                <MiniStat icon={Users}>{a.creators}</MiniStat>
                <MiniStat icon={Wallet}>{a.earn}</MiniStat>
                <MiniStat icon={Megaphone}>{a.campaigns}</MiniStat>
              </div>
            </div>
            <ArrowBtn />
          </div>
        ))}
      </section>

      {/* ======================= Leads + Campaigns ======================= */}
      <h2 className="absolute left-[618px] top-[572px] text-[24px] font-normal leading-none text-slate900">Leads</h2>
      <div className="absolute left-[618px] top-[622px]">
        <ProgressCard
          title="Leads Progress"
          total={lp?.total ?? 0}
          a={lp?.new ?? 0} b={lp?.contacted ?? 0} c={lp?.converted ?? 0}
          labels={[`${lp?.new ?? 0} New`, `${lp?.contacted ?? 0} Contacted`, `${lp?.converted ?? 0} Converted`]}
        />
      </div>
      <h2 className="absolute left-[617px] top-[766px] text-[24px] font-normal leading-none text-slate900">Campaigns</h2>
      <div className="absolute left-[618px] top-[816px]">
        <ProgressCard
          title="Campaign Progress"
          total={cp?.total ?? 0}
          a={cp?.active ?? 0} b={cp?.completed ?? 0} c={cp?.draft ?? 0}
          labels={[`${cp?.active ?? 0} Active`, `${cp?.completed ?? 0} Done`, `${cp?.draft ?? 0} Draft`]}
        />
      </div>

      {/* ============================ Revenue ============================ */}
      <section className="absolute left-[953px] top-[566px] h-[428px] w-[455px] rounded-card bg-chip">
        <h2 className="absolute left-[20px] top-[21px] text-[24px] font-normal leading-none text-[#1F1F1F]">Revenue</h2>
        <button onClick={() => navigate("/revenue")} className="absolute right-[18px] top-[24px] flex cursor-pointer items-center gap-[6px] rounded-full bg-white/90 px-[14px] py-[8px] text-[14px] font-light text-ink">
          Last 5 Months
          <ChevronDown className="h-[14px] w-[14px]" strokeWidth={1.6} />
        </button>

        {/* y grid + labels */}
        {GRID.map((g) => (
          <div key={g.label} className="absolute left-[20px] right-[15px] flex items-center" style={{ top: g.y }}>
            <span className="w-[40px] text-[14px] leading-none text-ink">{g.label}</span>
            <span className="ml-[6px] flex-1 border-t border-dashed border-line" />
          </div>
        ))}

        {/* bars */}
        {REVENUE.map((b) => (
          <span
            key={b.m}
            className="absolute w-[12px] rounded-full bg-revenue-bar"
            style={{ left: b.x, top: b.top, height: b.h }}
          />
        ))}
        {/* month labels */}
        {REVENUE.map((b) => (
          <span key={b.m} className="absolute w-[30px] text-center text-[14px] leading-none text-ink" style={{ left: b.x - 9, top: 365 }}>
            {b.m}
          </span>
        ))}

        {/* tooltip card */}
        <div className="absolute left-[255px] top-[152px] w-[152px] rounded-[12px] bg-white px-[12px] py-[10px] shadow-[0_8px_24px_rgba(0,0,0,0.10)]">
          <div className="text-[11px] font-medium text-ink">Top performing agencies</div>
          <div className="mt-[8px] space-y-[6px]">
            {topPerf.map((t) => (
              <div key={t.n} className="flex items-center justify-between">
                <span className="flex items-center gap-[5px] text-[9px] text-ink/90">
                  <i className="h-[8px] w-[8px] rounded-full" style={{ background: t.c }} />
                  {t.n}
                </span>
                <span className="text-[11px]" style={{ color: t.c }}>{t.v}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
