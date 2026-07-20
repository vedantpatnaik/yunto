import type { ReactNode } from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { LucideIcon } from "lucide-react";
import {
  Users, Eye, Tag, Wallet, Megaphone, ArrowUpRight, ChevronDown,
  TrendingUp, TrendingDown, Building2, UserRound, IndianRupee, Target,
  Rocket, Clock3, StickyNote, X, Plus, Trash2, Pin,
} from "lucide-react";
import {
  useDashboard, useMe, useNotes, useCreate, useUpdate, useRemove,
  type OverviewKey, type Note,
} from "@/api/hooks";

/**
 * Super Admin — Dashboard.
 * Layout is pixel-traced to Figma frame 7917:13074 (1440×1024). Every number,
 * label and series is LIVE from /stats/dashboard, and every surface is
 * interactive: the D/W/M toggle and revenue range refetch real aggregates,
 * each card drills into its list, and the notes panel persists to the DB.
 */

/* --------------------------- format helpers ---------------------------- */
const inr = (n: number) => n.toLocaleString("en-IN");
const compact = (n: number) =>
  n >= 1_000_000 ? `${(n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1)}M`
  : n >= 1_000 ? `${Math.round(n / 1_000)}k`
  : `${n}`;

/** Round an axis maximum up to a clean number so gridline labels read well. */
const niceMax = (v: number) => {
  if (v <= 0) return 100;
  const mag = Math.pow(10, Math.floor(Math.log10(v)));
  return Math.ceil(v / mag) * mag;
};

/** The revenue series is already denominated in ₹ thousands. */
const inrK = (k: number) =>
  k >= 1000 ? `₹${(k / 1000).toFixed(k % 1000 === 0 ? 0 : 1)}M` : `₹${Math.round(k)}k`;

const RINGS = ["from-[#F1FFC3] to-[#C8B3ED]", "from-[#FFD6E7] to-[#C8B3ED]", "from-[#C8E6FF] to-[#C8B3ED]"];
const AG_COLORS = ["bg-[#1FB37A]", "bg-[#8D8D8D]", "bg-[#7C5CFC]", "bg-black"];
const NOTE_COLORS: Record<string, string> = {
  yellow: "bg-[#FEF3C7] border-[#FCD34D]",
  pink: "bg-[#FCE7F3] border-[#F9A8D4]",
  blue: "bg-[#DBEAFE] border-[#93C5FD]",
  green: "bg-[#DCFCE7] border-[#86EFAC]",
};

// Revenue plot geometry (frame-exact); the value→pixel scale is derived from data.
const REV_X = [116, 178, 239, 301, 363];
const BASELINE = 347;
const PLOT_H = 240;

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
    <span className="flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full bg-white/80 transition group-hover:bg-white group-hover:shadow-sm">
      <ArrowUpRight className="h-[14px] w-[14px] text-ink transition group-hover:translate-x-[1px] group-hover:-translate-y-[1px]" strokeWidth={1.8} />
    </span>
  );
}

/** Signed change vs the previous window, coloured by direction. */
function TrendChip({ pct }: { pct: number }) {
  if (!Number.isFinite(pct) || pct === 0) {
    return <span className="text-[11px] font-normal text-muted">no change</span>;
  }
  const up = pct > 0;
  const Icon = up ? TrendingUp : TrendingDown;
  return (
    <span className={`flex items-center gap-[3px] text-[11px] font-medium ${up ? "text-[#1FB37A]" : "text-[#E8735B]"}`}>
      <Icon className="h-[12px] w-[12px]" strokeWidth={2} />
      {up ? "+" : ""}{pct}%
    </span>
  );
}

function ProgressBars({ a, b, c }: { a: number; b: number; c: number }) {
  const total = Math.max(1, a + b + c);
  const px = (n: number) => Math.round((n / total) * 35);
  const seg = [
    ...Array(px(a)).fill("bg-seg-new"),
    ...Array(px(b)).fill("bg-seg-contacted"),
    ...Array(px(c)).fill("bg-seg-converted"),
  ].slice(0, 35);
  while (seg.length < 35) seg.push("bg-line");
  return (
    <div className="flex h-[26px] items-center gap-[3.5px]">
      {seg.map((cl, i) => (
        <span key={i} className={`h-[26px] w-[3px] rounded-full ${cl} transition-all`} />
      ))}
    </div>
  );
}

function ProgressCard({
  title, total, a, b, c, labels, onClick,
}: {
  title: string; total: number; a: number; b: number; c: number;
  labels: [string, string, string]; onClick: () => void;
}) {
  const pct = total ? Math.round((c / total) * 100) : 0;
  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onClick()}
      className="h-[132px] w-[306px] cursor-pointer rounded-inner bg-white px-[12px] py-[13px] shadow-[0_4px_16px_rgba(0,0,0,0.03)] transition hover:-translate-y-[2px] hover:shadow-[0_10px_28px_rgba(0,0,0,0.10)]"
    >
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

/* ------------------------------ notes panel ----------------------------- */
function NotesPanel({ onClose }: { onClose: () => void }) {
  const { data: notes = [], isLoading } = useNotes();
  const create = useCreate<Note>("notes");
  const update = useUpdate<Note>("notes");
  const remove = useRemove("notes");
  const [draft, setDraft] = useState("");
  const [color, setColor] = useState("yellow");

  const add = async () => {
    const body = draft.trim();
    if (!body) return;
    setDraft("");
    try {
      await create.mutateAsync({ body, color });
    } catch {
      setDraft(body); // put the text back so nothing is silently lost
    }
  };

  const sorted = [...notes].sort((a, b) => Number(b.pinned) - Number(a.pinned));

  return (
    <div className="absolute inset-0 z-40 flex justify-end bg-black/20 backdrop-blur-[2px]" onClick={onClose}>
      <aside
        onClick={(e) => e.stopPropagation()}
        className="flex h-full w-[380px] flex-col bg-white shadow-[-8px_0_32px_rgba(0,0,0,0.12)]"
      >
        <header className="flex items-center justify-between border-b border-line px-[20px] py-[16px]">
          <h3 className="flex items-center gap-[8px] text-[18px] text-ink">
            <StickyNote className="h-[18px] w-[18px]" strokeWidth={1.7} />
            Notes
            <span className="rounded-full bg-[#F1F1F1] px-[8px] py-[1px] text-[12px]">{notes.length}</span>
          </h3>
          <button onClick={onClose} aria-label="Close notes" className="rounded-full p-[6px] transition hover:bg-[#F1F1F1]">
            <X className="h-[16px] w-[16px]" strokeWidth={1.8} />
          </button>
        </header>

        <div className="border-b border-line px-[20px] py-[14px]">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) add(); }}
            placeholder="Write a note… (⌘↵ to save)"
            className="h-[70px] w-full resize-none rounded-[10px] border border-line bg-[#FAFAFA] p-[10px] text-[13px] text-ink outline-none focus:border-[#7C5CFC]"
          />
          <div className="mt-[10px] flex items-center justify-between">
            <div className="flex gap-[6px]">
              {Object.keys(NOTE_COLORS).map((c) => (
                <button
                  key={c}
                  aria-label={`${c} note`}
                  onClick={() => setColor(c)}
                  className={`h-[20px] w-[20px] rounded-full border-2 ${NOTE_COLORS[c]} ${color === c ? "ring-2 ring-ink/40 ring-offset-1" : ""}`}
                />
              ))}
            </div>
            <button
              onClick={add}
              disabled={!draft.trim() || create.isPending}
              className="flex items-center gap-[5px] rounded-full bg-ink px-[14px] py-[7px] text-[12px] text-white transition hover:opacity-85 disabled:opacity-40"
            >
              <Plus className="h-[13px] w-[13px]" strokeWidth={2} />
              {create.isPending ? "Adding…" : "Add note"}
            </button>
          </div>
        </div>

        <div className="flex-1 space-y-[10px] overflow-y-auto px-[20px] py-[16px]">
          {isLoading && <p className="text-[13px] text-muted">Loading…</p>}
          {!isLoading && !notes.length && (
            <p className="text-[13px] text-muted">No notes yet — add your first above.</p>
          )}
          {sorted.map((n) => (
            <div key={n.id} className={`rounded-[12px] border p-[12px] ${NOTE_COLORS[n.color] ?? NOTE_COLORS.yellow}`}>
              <textarea
                defaultValue={n.body}
                onBlur={(e) => {
                  const body = e.target.value.trim();
                  if (body && body !== n.body) update.mutate({ id: n.id, data: { body } });
                }}
                className="w-full resize-none bg-transparent text-[13px] leading-[1.45] text-ink outline-none"
                rows={Math.max(2, Math.ceil(n.body.length / 38))}
              />
              <div className="mt-[6px] flex items-center justify-between">
                <span className="text-[10px] text-ink/50">
                  {new Date(n.updatedAt ?? n.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                </span>
                <div className="flex gap-[4px]">
                  <button
                    aria-label={n.pinned ? "Unpin note" : "Pin note"}
                    onClick={() => update.mutate({ id: n.id, data: { pinned: !n.pinned } })}
                    className={`rounded-full p-[5px] transition hover:bg-white/60 ${n.pinned ? "text-ink" : "text-ink/40"}`}
                  >
                    <Pin className="h-[13px] w-[13px]" strokeWidth={1.8} />
                  </button>
                  <button
                    aria-label="Delete note"
                    onClick={() => remove.mutate(n.id)}
                    className="rounded-full p-[5px] text-ink/40 transition hover:bg-white/60 hover:text-[#E8735B]"
                  >
                    <Trash2 className="h-[13px] w-[13px]" strokeWidth={1.8} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
}

/* ------------------------------- page ---------------------------------- */
const STAT_META: { key: OverviewKey; label: string; icon: LucideIcon; to: string; fmt: (n: number) => string }[] = [
  { key: "activeAgencies", label: "Active Agencies", icon: Building2, to: "/revenue", fmt: inr },
  { key: "activeCreators", label: "Active Creators", icon: UserRound, to: "/creators", fmt: inr },
  { key: "monthlyRevenue", label: "Monthly Revenue", icon: IndianRupee, to: "/revenue", fmt: compact },
  { key: "activeLeads", label: "Active Leads", icon: Target, to: "/leads", fmt: inr },
  { key: "activeCampaigns", label: "Active Campaigns", icon: Rocket, to: "/campaigns", fmt: inr },
  { key: "pendingPayouts", label: "Pending Pay-Outs", icon: Clock3, to: "/invoices", fmt: inr },
];

export default function DashboardPage() {
  const [period, setPeriod] = useState<"D" | "W" | "M">("M");
  const [months, setMonths] = useState(5);
  const [rangeOpen, setRangeOpen] = useState(false);
  const [hoverBar, setHoverBar] = useState<number | null>(null);
  const [notesOpen, setNotesOpen] = useState(false);

  const { data, isFetching } = useDashboard(period, months);
  const { data: me } = useMe();
  const navigate = useNavigate();

  const ov = data?.overview;
  const tr = data?.trends;

  const CREATORS = (data?.topCreators ?? []).map((c, i) => ({
    id: c.id, name: c.name, handle: c.handle, followers: compact(c.followers),
    views: `${compact(c.avgViews)} views`, leads: `${c.leadsCount} leads`, ring: RINGS[i % 3],
  }));
  const AGENCIES = (data?.topAgencies ?? []).map((a, i) => ({
    id: a.id, name: a.name, sub: a.description, creators: String(a.creatorsCount),
    earn: compact(a.earnings), campaigns: `${a.campaignsCount} Campaigns`, color: AG_COLORS[i % 4],
  }));

  // Bars and gridlines share one data-derived scale, so the chart reads true.
  const series = data?.revenue ?? [];
  const axisMax = niceMax(Math.max(1, ...series.map((r) => r.value)));
  const REVENUE = series.map((r, i) => {
    const h = Math.max(6, Math.round((r.value / axisMax) * PLOT_H));
    return { m: r.month, v: r.value, x: REV_X[i] ?? 116 + i * 62, top: BASELINE - h, h };
  });
  const GRID = [1, 0.75, 0.5, 0.25].map((f) => ({
    label: inrK(axisMax * f),
    y: BASELINE - f * PLOT_H,
  }));

  const lp = data?.leadProgress;
  const cp = data?.campaignProgress;
  const topPerf = (data?.topPerforming ?? []).map((t, i) => ({
    id: t.id, n: t.name, c: ["#7427FF", "#945CF8", "#B289FA"][i % 3], v: `₹${compact(t.earnings)}`,
  }));

  return (
    <>
      <h1 className="absolute left-[254px] top-[150px] font-sans text-[40px] font-normal text-ink">
        Hello, {me?.name ?? "there"}
      </h1>

      {/* Notes launcher — opens the persisted sticky-note panel */}
      <button
        onClick={() => setNotesOpen(true)}
        className="absolute left-[1270px] top-[160px] z-10 flex items-center gap-[7px] rounded-full bg-white px-[16px] py-[9px] text-[13px] text-ink shadow-[0_4px_16px_rgba(0,0,0,0.08)] transition hover:-translate-y-[1px] hover:shadow-[0_8px_22px_rgba(0,0,0,0.14)]"
      >
        <StickyNote className="h-[15px] w-[15px]" strokeWidth={1.7} />
        Notes
      </button>

      {/* ============================ Overview ============================ */}
      <section className="absolute left-[242px] top-[230px] h-[289px] w-[802px] rounded-card border border-white/40 bg-white/40 backdrop-blur-md">
        <h2 className="absolute left-[40px] top-[25px] text-[28px] font-normal leading-none text-ink">Overview</h2>
        {isFetching && (
          <span className="absolute right-[40px] top-[32px] text-[11px] text-muted">updating…</span>
        )}
        {STAT_META.map((s, i) => {
          const col = i % 3;
          const row = Math.floor(i / 3);
          const Icon = s.icon;
          return (
            <div
              key={s.key}
              onClick={() => navigate(s.to)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && navigate(s.to)}
              title={`View ${s.label}`}
              className="absolute cursor-pointer rounded-[14px] px-[10px] py-[8px] transition hover:bg-white/70"
              style={{ left: 31 + col * 260 - 10, top: 96 + row * 107 - 8, width: 240 }}
            >
              <div className="text-[20px] font-light leading-none text-muted">{s.label}</div>
              <div className="mt-[16px] flex items-center gap-[8px]">
                <span className="flex h-[22px] w-[22px] items-center justify-center rounded-full bg-[#FDECEC]">
                  <Icon className="h-[13px] w-[13px] text-[#E8735B]" strokeWidth={1.8} />
                </span>
                <span className="text-[32px] font-medium leading-none text-ink">
                  {ov ? s.fmt(ov[s.key]) : "—"}
                </span>
                {tr && <TrendChip pct={tr[s.key]} />}
              </div>
            </div>
          );
        })}
      </section>

      {/* ========================== Top Creators ========================= */}
      <section className="absolute left-[1067px] top-[223px] h-[323px] w-[343px] rounded-card bg-creators-grad">
        <h2 className="absolute left-[20px] top-[15px] text-[24px] font-normal leading-none text-slate900">Top Creators</h2>
        <div className="absolute right-[20px] top-[16px] flex items-center gap-[6px] rounded-full bg-white/60 px-[6px] py-[4px] text-[12px] text-ink">
          {(["D", "W", "M"] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              title={p === "D" ? "Today" : p === "W" ? "This week" : "This month"}
              className={
                period === p
                  ? "flex h-[20px] w-[20px] items-center justify-center rounded-full bg-white font-medium shadow-sm"
                  : "flex h-[20px] w-[20px] items-center justify-center rounded-full transition hover:bg-white/60"
              }
            >
              {p}
            </button>
          ))}
        </div>
        {!CREATORS.length && (
          <p className="absolute left-[20px] top-[80px] text-[13px] text-ink/60">No creators yet.</p>
        )}
        {CREATORS.map((c, i) => (
          <div
            key={c.id}
            onClick={() => navigate(`/creators/detail?id=${c.id}`)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && navigate(`/creators/detail?id=${c.id}`)}
            className="group absolute flex h-[62px] w-[318px] cursor-pointer items-center gap-[10px] rounded-[16px] bg-white/45 px-[11px] transition hover:bg-white/80 hover:shadow-[0_6px_18px_rgba(0,0,0,0.08)]"
            style={{ left: 13, top: 67 + i * 72 }}
          >
            <span className={`h-[40px] w-[40px] shrink-0 rounded-full bg-gradient-to-br ${c.ring}`} />
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline gap-[6px]">
                <span className="truncate text-[14px] font-medium text-ink/90">{c.name}</span>
                <span className="truncate text-[11px] text-ink/70">{c.handle}</span>
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
          <span className="flex h-[22px] min-w-[22px] items-center justify-center rounded-full bg-white/80 px-[6px] text-[13px] text-ink">
            {data?.agenciesTotal ?? ""}
          </span>
        </div>
        {AGENCIES.map((a, i) => (
          <div
            key={a.id}
            onClick={() => navigate("/revenue")}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && navigate("/revenue")}
            className="group absolute flex h-[74px] w-[318px] cursor-pointer items-center gap-[10px] rounded-[16px] bg-white/45 px-[11px] transition hover:bg-white/80 hover:shadow-[0_6px_18px_rgba(0,0,0,0.08)]"
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
          onClick={() => navigate("/leads")}
        />
      </div>
      <h2 className="absolute left-[617px] top-[766px] text-[24px] font-normal leading-none text-slate900">Campaigns</h2>
      <div className="absolute left-[618px] top-[816px]">
        <ProgressCard
          title="Campaign Progress"
          total={cp?.total ?? 0}
          a={cp?.active ?? 0} b={cp?.completed ?? 0} c={cp?.draft ?? 0}
          labels={[`${cp?.active ?? 0} Active`, `${cp?.completed ?? 0} Done`, `${cp?.draft ?? 0} Draft`]}
          onClick={() => navigate("/campaigns")}
        />
      </div>

      {/* ============================ Revenue ============================ */}
      <section className="absolute left-[953px] top-[566px] h-[428px] w-[455px] rounded-card bg-chip">
        <h2 className="absolute left-[20px] top-[21px] text-[24px] font-normal leading-none text-[#1F1F1F]">Revenue</h2>

        <div className="absolute right-[18px] top-[24px]">
          <button
            onClick={() => setRangeOpen((o) => !o)}
            className="flex cursor-pointer items-center gap-[6px] rounded-full bg-white/90 px-[14px] py-[8px] text-[14px] font-light text-ink transition hover:bg-white"
          >
            Last {months} Months
            <ChevronDown className={`h-[14px] w-[14px] transition ${rangeOpen ? "rotate-180" : ""}`} strokeWidth={1.6} />
          </button>
          {rangeOpen && (
            <div className="absolute right-0 top-[42px] z-20 w-[150px] overflow-hidden rounded-[12px] bg-white py-[4px] shadow-[0_10px_30px_rgba(0,0,0,0.15)]">
              {[3, 5, 6, 12].map((m) => (
                <button
                  key={m}
                  onClick={() => { setMonths(m); setRangeOpen(false); }}
                  className={`block w-full px-[14px] py-[8px] text-left text-[13px] transition hover:bg-[#F5F5F5] ${m === months ? "font-medium text-ink" : "text-ink/70"}`}
                >
                  Last {m} Months
                </button>
              ))}
              <button
                onClick={() => { setRangeOpen(false); navigate("/revenue"); }}
                className="block w-full border-t border-line px-[14px] py-[8px] text-left text-[13px] text-[#7C5CFC] transition hover:bg-[#F5F5F5]"
              >
                Full report →
              </button>
            </div>
          )}
        </div>

        {/* y grid — labels derived from the live series. Keyed by index: the
            labels themselves collide (all "₹1k") before data lands, and
            duplicate keys leave orphaned nodes behind on re-render. */}
        {GRID.map((g, i) => (
          <div key={i} className="absolute left-[20px] right-[15px] flex items-center" style={{ top: g.y }}>
            <span className="w-[46px] text-[13px] leading-none text-ink">{g.label}</span>
            <span className="ml-[6px] flex-1 border-t border-dashed border-line" />
          </div>
        ))}

        {/* bars — hover reveals the exact figure */}
        {REVENUE.map((b, i) => (
          <span
            key={b.m}
            onMouseEnter={() => setHoverBar(i)}
            onMouseLeave={() => setHoverBar(null)}
            onClick={() => navigate("/revenue")}
            className={`absolute w-[12px] cursor-pointer rounded-full transition-all duration-200 ${hoverBar === i ? "bg-ink" : "bg-revenue-bar"}`}
            style={{ left: b.x, top: b.top, height: b.h }}
          />
        ))}
        {REVENUE.map((b, i) => (
          <span
            key={`l-${b.m}`}
            className={`absolute w-[30px] text-center text-[14px] capitalize leading-none transition ${hoverBar === i ? "font-medium text-ink" : "text-ink"}`}
            style={{ left: b.x - 9, top: 365 }}
          >
            {b.m}
          </span>
        ))}
        {hoverBar !== null && REVENUE[hoverBar] && (
          <div
            className="pointer-events-none absolute z-10 -translate-x-1/2 whitespace-nowrap rounded-[8px] bg-ink px-[10px] py-[6px] text-[11px] text-white shadow-lg"
            style={{ left: REVENUE[hoverBar].x + 6, top: Math.max(6, REVENUE[hoverBar].top - 34) }}
          >
            <span className="capitalize">{REVENUE[hoverBar].m}</span> · {inrK(REVENUE[hoverBar].v)}
          </div>
        )}

        {/* top performers — each row drills through */}
        <div className="absolute left-[255px] top-[152px] w-[152px] rounded-[12px] bg-white px-[12px] py-[10px] shadow-[0_8px_24px_rgba(0,0,0,0.10)]">
          <div className="text-[11px] font-medium text-ink">Top performing agencies</div>
          <div className="mt-[8px] space-y-[6px]">
            {topPerf.map((t) => (
              <button
                key={t.id}
                onClick={() => navigate("/revenue")}
                className="flex w-full items-center justify-between rounded-[6px] px-[2px] py-[1px] transition hover:bg-[#F5F5F5]"
              >
                <span className="flex items-center gap-[5px] truncate text-[9px] text-ink/90">
                  <i className="h-[8px] w-[8px] shrink-0 rounded-full" style={{ background: t.c }} />
                  {t.n}
                </span>
                <span className="shrink-0 text-[11px]" style={{ color: t.c }}>{t.v}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {notesOpen && <NotesPanel onClose={() => setNotesOpen(false)} />}
    </>
  );
}
