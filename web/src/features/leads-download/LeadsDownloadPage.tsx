import type { ReactNode } from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLeads } from "@/api/hooks";
import type { LucideIcon } from "lucide-react";
import {
  Search,
  SlidersHorizontal,
  ChevronDown,
  Check,
  Plus,
  Download,
  Calendar,
  Info,
  X,
  ArrowUp,
  ArrowDown,
  Phone,
} from "lucide-react";

/**
 * Super Admin — Leads · "Download Leads" export modal.
 * Figma frame 4868:27135 (family "Super Admin-" leads-download).
 *
 * The screen is the Leads WORKSPACE with the "Download Leads" export dialog open:
 * a centered white modal (date range · fields to export · file format) over a
 * dimmed workspace scrim. Geometry measured from the 2× Figma reference render.
 * The modal itself is full-opacity; only the workspace behind it is scrimmed —
 * that scrim is the modal's own backdrop, intrinsic to this design.
 */

/* ------------------------------ primitives ----------------------------- */
function StatPill({ n, badge, dir, label }: { n: string; badge: string; dir: "up" | "down"; label: string }) {
  return (
    <div className="flex items-start">
      <span className="text-[46px] font-normal leading-[0.9] text-ink">{n}</span>
      <div className="ml-[4px] mt-[6px] flex flex-col gap-[10px]">
        <span className={`flex h-[15px] items-center gap-[2px] rounded-[9px] px-[3px] text-[12px] font-light text-ink ${dir === "up" ? "bg-[#DCFF68]" : "bg-[#FFB0B1]"}`}>
          {dir === "up" ? <ArrowUp className="h-[9px] w-[9px]" strokeWidth={2} /> : <ArrowDown className="h-[9px] w-[9px]" strokeWidth={2} />}
          {badge}
        </span>
        <span className="text-[12px] font-light leading-none text-ink/70">{label}</span>
      </div>
    </div>
  );
}

function FilterChip({ children, active, onClick }: { children: ReactNode; active?: boolean; onClick?: () => void }) {
  return (
    <span onClick={onClick} className={`flex h-[42px] items-center justify-center rounded-full px-[22px] text-[17px] font-light cursor-pointer ${active ? "bg-black text-white" : "bg-white/90 text-ink"}`}>
      {children}
    </span>
  );
}

/* ---- background lead card (dimmed silhouette behind the modal) ---- */
function BgCard({ title, budget, deliver, when, contact, status, left, top }: {
  title: string; budget: string; deliver: string; when: string; contact: string; status: string; left: number; top: number;
}) {
  return (
    <div className="absolute h-[240px] w-[266px] rounded-[16px] bg-white p-[14px]" style={{ left, top }}>
      <div className="flex items-center gap-[8px]">
        <span className="h-[34px] w-[34px] rounded-full bg-[#EEE]" />
        <span className="text-[15px] text-ink">{title}</span>
        <span className="ml-auto text-[10px] text-ink/50">12 July</span>
      </div>
      <div className="mt-[6px] pl-[42px] text-[11px] text-ink/60">Budget {budget}</div>
      <div className="mt-[16px] flex items-center gap-[8px]">
        <Phone className="h-[16px] w-[16px] text-ink/70" strokeWidth={1.6} />
        <div>
          <div className="text-[13px] text-ink">{deliver}</div>
          <div className="text-[10px] text-ink/50">{when}</div>
        </div>
      </div>
      <div className="mt-[16px] text-[11px] text-ink/50">Status</div>
      <div className="mt-[6px] flex items-center gap-[8px]">
        <span className="h-[26px] w-[26px] rounded-full bg-[#E7DFF3]" />
        <div>
          <div className="text-[12px] text-ink">{contact}</div>
          <div className="text-[9px] text-ink/50">{status}</div>
        </div>
      </div>
    </div>
  );
}

/* ---- modal date-range pill ---- */
function DatePill({ label, selected, icon: Icon, w, onClick }: { label: string; selected?: boolean; icon?: LucideIcon; w: number; onClick?: () => void }) {
  return (
    <div
      onClick={onClick}
      className={`flex h-[46px] items-center justify-center gap-[12px] rounded-full text-[18px] font-normal cursor-pointer ${selected ? "bg-[#111112] text-white" : "border border-[#E9E7EE] bg-[#FBFAFD] text-[#2B2B2B]"}`}
      style={{ width: w }}
    >
      <span>{label}</span>
      {Icon && <Icon className="h-[18px] w-[18px]" strokeWidth={1.7} />}
    </div>
  );
}

/* ---- modal checkbox pill (fields / file-format) ---- */
function CheckPill({ label, checked, w, onClick }: { label: string; checked?: boolean; w: number; onClick?: () => void }) {
  return (
    <div onClick={onClick} className="flex h-[46px] items-center gap-[10px] rounded-full border border-[#E6E6E6] pl-[14px] cursor-pointer" style={{ width: w }}>
      <span className={`flex h-[21px] w-[21px] shrink-0 items-center justify-center rounded-[6px] ${checked ? "bg-black text-white" : "border border-[#D6D6D6] bg-white text-transparent"}`}>
        <Check className="h-[13px] w-[13px]" strokeWidth={2.6} />
      </span>
      <span className="whitespace-nowrap text-[16px] font-normal text-[#2B2B2B]">{label}</span>
    </div>
  );
}

/* -------------------------------- page --------------------------------- */
export default function LeadsDownloadPage() {
  const navigate = useNavigate();
  const { data: leadsData } = useLeads();
  const leads = leadsData ?? [];
  const [dateRange, setDateRange] = useState("Last 30 Days");
  const [intentFilter, setIntentFilter] = useState("All");
  const [fileFormat, setFileFormat] = useState(".XLSX");
  const [fields, setFields] = useState<Record<string, boolean>>({
    "Select All": true,
    "Campaign Name": false,
    "Contact Info": false,
    "Source (sale)": false,
    "Intent level": false,
    "Lead Owner": false,
  });
  const toggleField = (label: string) =>
    setFields((prev) => ({ ...prev, [label]: !prev[label] }));

  return (
    <>
      {/* ================= DIMMED WORKSPACE (behind the modal) ================= */}
      {/* WORKSPACE header row */}
      <h1 className="absolute left-[258px] top-[158px] text-[40px] font-normal text-ink">WORKSPACE</h1>
      <button onClick={() => navigate("/leads/create-paid")} className="absolute left-[529px] top-[156px] flex h-[45px] w-[115px] items-center justify-center gap-[10px] rounded-[28px] bg-[rgba(0,0,0,0.9)] text-white">
        <span className="text-[14px] font-light">New lead</span>
        <Plus className="h-[18px] w-[18px]" strokeWidth={2} />
      </button>
      <button onClick={() => navigate("/leads/download")} className="absolute left-[650px] top-[156px] flex h-[45px] w-[106px] items-center justify-center gap-[8px] rounded-[24px] bg-[#181819] text-white">
        <span className="text-[14px] font-light">Leads</span>
        <Download className="h-[18px] w-[18px]" strokeWidth={1.8} />
      </button>
      <div className="absolute left-[900px] top-[158px] flex items-start gap-[34px]">
        <StatPill n="18" badge="10" dir="up" label="Deals" />
        <StatPill n="11" badge="5" dir="down" label="won" />
        <StatPill n="11" badge="1" dir="down" label="lost" />
      </div>

      {/* New Leads section header + filters */}
      <h2 className="absolute left-[284px] top-[243px] flex items-center gap-[10px] text-[34px] font-normal leading-none text-ink">
        New Leads
        <ChevronDown className="h-[26px] w-[26px]" strokeWidth={1.6} />
      </h2>
      <span className="absolute left-[560px] top-[254px] text-[22px] font-light text-ink/70">{leads.length} Leads</span>
      <span onClick={() => navigate("/search")} className="absolute left-[655px] top-[247px] flex h-[45px] w-[45px] items-center justify-center rounded-full bg-white text-ink cursor-pointer">
        <Search className="h-[22px] w-[22px]" strokeWidth={1.7} />
      </span>
      <span className="absolute left-[708px] top-[247px] flex h-[45px] w-[45px] items-center justify-center rounded-full bg-white text-ink">
        <SlidersHorizontal className="h-[22px] w-[22px]" strokeWidth={1.7} />
      </span>
      <div className="absolute left-[762px] top-[248px] flex items-center gap-[16px]">
        <FilterChip active={intentFilter === "All"} onClick={() => setIntentFilter("All")}>All</FilterChip>
        <FilterChip active={intentFilter === "High Intent"} onClick={() => setIntentFilter("High Intent")}>High Intent</FilterChip>
        <FilterChip active={intentFilter === "Low Intent"} onClick={() => setIntentFilter("Low Intent")}>Low Intent</FilterChip>
        <FilterChip active={intentFilter === "Medium Intent"} onClick={() => setIntentFilter("Medium Intent")}>Medium Intent</FilterChip>
        <FilterChip active={intentFilter === "Dead"} onClick={() => setIntentFilter("Dead")}>Dead</FilterChip>
      </div>

      {/* bottom lead-card row (only card tops peek below the modal) */}
      <BgCard left={886} top={762} title={leads[0]?.brandName ?? ""} budget={`₹${leads[0]?.money ?? ""}`} deliver="Deliverables Discuss" when="14 July 2025 at 1pm" contact={leads[0]?.contactPerson ?? ""} status={leads[0]?.status ?? ""} />
      <BgCard left={1166} top={762} title={leads[1]?.brandName ?? ""} budget={`₹${leads[1]?.money ?? ""}`} deliver="Deliverables Discuss" when="19 July 2025 at 5pm" contact={leads[1]?.contactPerson ?? ""} status={leads[1]?.status ?? ""} />

      {/* mid list card (Pooja Singh / Lisa Rai) */}
      <div className="absolute left-[565px] top-[762px] h-[240px] w-[300px] rounded-[16px] bg-white p-[16px]">
        {[
          { i: "P", n: "Pooja Singh" },
          { i: "L", n: "Lisa Rai" },
        ].map((p, k) => (
          <div key={k} className={k ? "mt-[26px]" : ""}>
            <div className="flex items-center gap-[8px]">
              <span className="flex h-[30px] w-[30px] items-center justify-center rounded-full bg-[#EEE] text-[12px] text-ink/70">{p.i}</span>
              <div>
                <div className="text-[13px] text-ink">{p.n}</div>
                <div className="text-[9px] text-ink/50">Response Time 10 Min.</div>
              </div>
            </div>
            <div className="mt-[8px] flex gap-[6px]">
              {["2 Leads", "4 Leads", "7 Leads"].map((t) => (
                <span key={t} className="rounded-[6px] border border-black/10 px-[6px] py-[3px] text-[9px] text-ink/70">{t}</span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* left summary card (Converted / Contacted) */}
      <div className="absolute left-[256px] top-[760px] h-[240px] w-[292px] rounded-[16px] bg-[#EAF3EC] p-[16px]">
        <div className="flex items-start justify-between">
          <span className="flex h-[34px] w-[34px] items-center justify-center rounded-full bg-white/60 text-[#1FB37A]">✈</span>
          <div className="text-right">
            <span className="text-[26px] font-light text-ink">06</span>
            <span className="ml-[6px] text-[12px] text-ink/60">Converted</span>
          </div>
        </div>
        <div className="mt-[10px] text-[26px] font-light text-ink">16<span className="ml-[6px] text-[12px] text-ink/60">Contacted</span></div>
        {["Base Skincare", "Nike Skincare"].map((t) => (
          <div key={t} className="mt-[12px] flex items-center gap-[8px] rounded-[10px] bg-white/60 px-[8px] py-[6px]">
            <span className="h-[20px] w-[20px] rounded-full bg-white" />
            <div>
              <div className="text-[8px] text-ink/40">10mins ago</div>
              <div className="text-[11px] text-ink">{t}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ================= SCRIM ================= */}
      <div onClick={() => navigate(-1)} className="absolute inset-0 z-30 bg-black/[0.52]" />

      {/* ================= DOWNLOAD LEADS MODAL ================= */}
      <div className="absolute left-[129px] top-[261px] z-40 h-[502px] w-[1182px] rounded-[22px] bg-white shadow-[0_24px_60px_rgba(0,0,0,0.22)]">
        {/* header */}
        <h3 className="absolute left-[32px] top-[42px] text-[24px] font-semibold leading-none text-[#141416]">Download Leads</h3>
        <p className="absolute left-[32px] top-[84px] text-[17px] font-light text-[#6E6E70]">
          Choose time, format and what info you'd like to export.
        </p>

        {/* header actions */}
        <button onClick={() => navigate("/leads")} className="absolute left-[945px] top-[30px] flex h-[46px] w-[148px] items-center justify-center rounded-full bg-black text-[18px] font-normal text-white">
          Download
        </button>
        <button onClick={() => navigate(-1)} className="absolute left-[1105px] top-[29px] flex h-[48px] w-[48px] items-center justify-center rounded-full border border-[#1A1A1A] text-[#1A1A1A]">
          <X className="h-[20px] w-[20px]" strokeWidth={1.8} />
        </button>

        {/* Select Date Range */}
        <span className="absolute left-[32px] top-[130px] text-[18px] font-normal text-[#42424A]">Select Date Range</span>
        <div className="absolute left-[31px] top-[162px] flex items-center gap-[26px]">
          <DatePill label="Today" w={188} selected={dateRange === "Today"} onClick={() => setDateRange("Today")} />
          <DatePill label="Last 7 Days" w={198} selected={dateRange === "Last 7 Days"} onClick={() => setDateRange("Last 7 Days")} />
          <DatePill label="Last 30 Days" selected={dateRange === "Last 30 Days"} w={184} onClick={() => setDateRange("Last 30 Days")} />
          <DatePill label="Choose Date" icon={Calendar} w={200} selected={dateRange === "Choose Date"} onClick={() => setDateRange("Choose Date")} />
        </div>

        {/* Select Fields to export */}
        <span className="absolute left-[32px] top-[231px] text-[18px] font-normal text-[#42424A]">Select Fields to export</span>
        <div className="absolute left-[31px] top-[261px] flex items-center gap-[21px]">
          <CheckPill label="Select All" checked={fields["Select All"]} w={171} onClick={() => toggleField("Select All")} />
          <CheckPill label="Campaign Name" checked={fields["Campaign Name"]} w={169} onClick={() => toggleField("Campaign Name")} />
          <CheckPill label="Contact Info" checked={fields["Contact Info"]} w={169} onClick={() => toggleField("Contact Info")} />
          <CheckPill label="Source (sale)" checked={fields["Source (sale)"]} w={171} onClick={() => toggleField("Source (sale)")} />
          <CheckPill label="Intent level" checked={fields["Intent level"]} w={169} onClick={() => toggleField("Intent level")} />
          <CheckPill label="Lead Owner" checked={fields["Lead Owner"]} w={172} onClick={() => toggleField("Lead Owner")} />
        </div>

        {/* Select File Format */}
        <span className="absolute left-[32px] top-[333px] text-[18px] font-normal text-[#42424A]">Select File Format</span>
        <div className="absolute left-[31px] top-[363px] flex items-center gap-[21px]">
          <CheckPill label=".XLSX" checked={fileFormat === ".XLSX"} w={171} onClick={() => setFileFormat(".XLSX")} />
          <CheckPill label=".CSV" checked={fileFormat === ".CSV"} w={169} onClick={() => setFileFormat(".CSV")} />
          <CheckPill label=".PDF" checked={fileFormat === ".PDF"} w={169} onClick={() => setFileFormat(".PDF")} />
        </div>

        {/* footer note */}
        <div className="absolute left-[32px] top-[446px] flex items-center gap-[9px] text-[16px] font-light text-[#6E6E70]">
          <Info className="h-[18px] w-[18px] text-[#9A9A9C]" strokeWidth={1.7} />
          <span>
            You're about to download <span className="font-medium text-[#141416]">{leads.length} leads</span> from last 30 days
          </span>
        </div>
      </div>
    </>
  );
}
