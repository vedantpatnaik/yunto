import { useState, type ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { ArrowUpRight, Clock, Calendar, Wallet, Search, Download } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useList, useCampaigns, useAgencies, useCampaignFull, useUpdate, type Campaign } from "@/api/hooks";

/**
 * Super Admin — Invoices.
 * Exact reconstruction of Figma frame 5704:52161 ("Super Admin-invoices"), 1440×1024.
 * Clean underlying page (profile popup + dim scrim intentionally omitted).
 */

/* ------------------------------ data ----------------------------- */
/** Invoice as the API returns it (the crud router sends the whole Prisma row). */
type InvoiceRecord = {
  id: string;
  number: string;
  brandName: string;
  budget: number;
  agencyFee: number;
  payout: number;
  status: string;
  campaignId?: string | null;
  createdAt?: string;
};

/** ₹1.2L / 500k style compact numbers used across the stat block. */
function short(n: number): string {
  if (n >= 1e7) return `${(n / 1e7).toFixed(1).replace(/\.0$/, "")}Cr`;
  if (n >= 1e5) return `${(n / 1e5).toFixed(1).replace(/\.0$/, "")}L`;
  if (n >= 1e3) return `${Math.round(n / 1e3)}k`;
  return `${n}`;
}

const fmtDate = (iso?: string) => (iso ? new Date(iso).toLocaleDateString("en-GB") : "");

type Invoice = { id: string; inv: string; brand: string; amt: string; date: string; sel: boolean };

/* ---------------------------- primitives ---------------------------- */
function Ring({ pct }: { pct: number }) {
  const C = 2 * Math.PI * 11;
  return (
    <svg width={26} height={26} viewBox="0 0 26 26" className="block">
      <circle cx={13} cy={13} r={11} fill="#FFFFFF" />
      <circle
        cx={13}
        cy={13}
        r={11}
        fill="none"
        stroke="#40E66C"
        strokeWidth={3}
        strokeLinecap="round"
        strokeDasharray={`${(pct / 100) * C} ${C}`}
        transform="rotate(-90 13 13)"
      />
      <text x={13} y={16} textAnchor="middle" className="fill-black font-inter text-[7px]">
        {pct}%
      </text>
    </svg>
  );
}

function CampaignCard({ c, paid, source, onClick }: { c: Campaign; paid: boolean; source: string; onClick: () => void }) {
  const live = c.status === "ACTIVE";
  const person = c.contactPerson ?? c.brandName;
  return (
    <div onClick={onClick} className="relative h-[193px] w-[266px] shrink-0 cursor-pointer rounded-[12px] bg-[#F5F5F5]">
      {/* arrow */}
      <span className="absolute right-[4px] top-0 flex h-[28px] w-[28px] items-center justify-center rounded-full bg-white">
        <ArrowUpRight className="h-[15px] w-[15px] text-black" strokeWidth={1.8} />
      </span>
      {/* header */}
      <span className="absolute left-[10px] top-[8px] flex h-[34px] w-[34px] items-center justify-center rounded-full bg-[#F4C1C1] text-[15px] font-medium text-[#B93636]">
        {person.charAt(0).toUpperCase()}
      </span>
      <div className="absolute left-[51px] top-[10px] text-[12px] leading-[15px] text-black/90">{person}</div>
      <div className="absolute left-[51px] top-[26px] text-[8px] leading-[13px] text-black/70">Operation</div>

      {/* status pill */}
      <span
        className={`absolute right-[42px] top-[6px] flex h-[24px] items-center rounded-[12px] bg-white px-[6px] text-[10px] leading-[16px] ${
          live ? "font-medium text-[#38CE60]" : "text-black/80"
        }`}
      >
        {live ? "LIVE" : c.timeline ?? c.status}
      </span>

      {/* title */}
      <div className="absolute left-[10px] top-[56px] text-[16.9px] leading-[27px] text-black/90">{c.name}</div>

      {/* chips */}
      <div className="absolute left-[10px] top-[90px] flex items-center gap-[8px]">
        <span className="flex h-[24px] items-center rounded-full bg-white px-[8px] text-[11px] text-black">
          Budget ₹{short(c.budget)}
        </span>
        <span className="flex h-[24px] items-center rounded-full bg-white px-[8px] text-[11px] text-black">
          {paid ? "Paid" : "Unpaid"}
        </span>
      </div>

      {/* progress ring */}
      <span className="absolute right-[13px] top-[89px]">
        <Ring pct={c.progress} />
      </span>

      {/* source */}
      <span className="absolute left-[17px] top-[131px] text-[9.3px] text-black/90">Source</span>
      <div className="absolute left-[8px] top-[149px] flex h-[32px] w-[111px] items-center gap-[4px] rounded-[18px] bg-white px-[9px]">
        <span className="h-[14px] w-[14px] shrink-0 rounded-full bg-gradient-to-br from-[#C8E6FF] to-[#C8B3ED]" />
        <span className="truncate text-[10.2px] text-black/90">{source}</span>
      </div>

      {/* creators */}
      <span className="absolute left-[151px] top-[131px] text-[9.3px] text-black/90">Creators</span>
      <div className="absolute left-[139px] top-[149px] h-[32px] w-[96px] rounded-[18px] bg-white">
        <span className="absolute left-[3px] top-[3px] h-[25px] w-[25px] rounded-full bg-gradient-to-br from-[#FFD6E7] to-[#C8B3ED]" />
        <span className="absolute left-[16px] top-[3px] h-[25px] w-[25px] rounded-full bg-gradient-to-br from-[#C8E6FF] to-[#C8B3ED]" />
        <span className="absolute left-[29px] top-[3px] h-[25px] w-[25px] rounded-full bg-gradient-to-br from-[#F1FFC3] to-[#C8B3ED]" />
        <span className="absolute left-[42px] top-[3px] h-[25px] w-[25px] rounded-full bg-gradient-to-br from-[#D2C6E5] to-[#FEFEFE]" />
        <span className="absolute left-[59px] top-[3px] flex h-[25px] w-[25px] items-center justify-center rounded-full bg-[#E5E5E5] text-[8.3px] text-black">
          +{c.peopleCount ?? 0}
        </span>
      </div>
    </div>
  );
}

function StatMini({ icon: Icon, label, value, left }: { icon: LucideIcon; label: string; value: string; left: number }) {
  return (
    <div className="absolute top-[24px]" style={{ left }}>
      <div className="whitespace-nowrap text-[15.8px] leading-[27px] text-black/70">{label}</div>
      <div className="mt-[9px] flex items-center gap-[6px]">
        <span className="flex h-[28px] w-[28px] items-center justify-center rounded-full bg-white">
          <Icon className="h-[15px] w-[15px] text-black" strokeWidth={1.7} />
        </span>
        <span className="text-[24px] leading-[18px] text-black">{value}</span>
      </div>
    </div>
  );
}

function DetailField({ label, value, valueClass }: { label: string; value: ReactNode; valueClass?: string }) {
  return (
    <>
      <div className="text-[14px] font-light leading-[24px] text-white/90">{label}</div>
      <div className={valueClass ?? "text-[22px] leading-[24px] text-white"}>{value}</div>
    </>
  );
}

function InvoiceRow({ v, onClick }: { v: Invoice; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      className={`relative h-[62px] w-[401px] cursor-pointer rounded-[32px] ${v.sel ? "bg-[#95A3BA]" : "bg-white/[0.45]"}`}
    >
      <span className="absolute left-[7px] top-[10px] h-[42px] w-[42px] rounded-full bg-gradient-to-br from-[#C8E6FF] to-[#C8B3ED]" />
      <div className={`absolute left-[55px] top-[10px] text-[15px] leading-[18px] ${v.sel ? "text-white/90" : "text-black/90"}`}>
        {v.inv}
      </div>
      <div className={`absolute left-[55px] top-[31px] text-[11px] leading-[13px] ${v.sel ? "text-white/70" : "text-black/70"}`}>
        {v.brand}
      </div>
      <div className={`absolute right-[20px] top-[10px] text-[16px] font-medium leading-[22px] ${v.sel ? "text-white" : "text-black"}`}>
        {v.amt}
      </div>
      <div className={`absolute right-[20px] top-[36px] font-inter text-[10px] leading-[16px] ${v.sel ? "text-white/[0.69]" : "text-black/[0.47]"}`}>
        {v.date}
      </div>
    </div>
  );
}

/* -------------------------------- page --------------------------------- */
export default function InvoicesPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { data, isLoading } = useList<InvoiceRecord>("invoices");
  const { data: campaignData, isLoading: campaignsLoading } = useCampaigns();
  const { data: agencyData } = useAgencies();
  const markPaid = useUpdate("invoices");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"All" | "Paid" | "Unpaid">("All");

  const rows = data ?? [];
  const campaigns = campaignData ?? [];
  const agencies = agencyData ?? [];

  /* ---- stat block, derived from the invoice rows ---- */
  const sum = (list: InvoiceRecord[]) => list.reduce((t, r) => t + r.payout, 0);
  const overdue = sum(rows.filter((r) => r.status === "OVERDUE"));
  const dueNext = sum(rows.filter((r) => r.status === "UNPAID"));
  const collected = sum(rows.filter((r) => r.status === "PAID"));
  const billed = sum(rows);
  const collectedPct = billed ? Math.round((collected / billed) * 100) : 0;

  /* Avg. time to get paid — Invoice has no paidAt column, so this is the mean
     age (createdAt → today) of the invoices that have actually settled. */
  const settled = rows.filter((r) => r.status === "PAID" && r.createdAt);
  const avgDays = settled.length
    ? Math.round(
        settled.reduce((t, r) => t + (Date.now() - new Date(r.createdAt as string).getTime()), 0) /
          settled.length /
          86_400_000,
      )
    : 0;

  /* ---- tab counts + filtered list ---- */
  const paidCount = rows.filter((r) => r.status === "PAID").length;
  const unpaidCount = rows.length - paidCount;
  const filtered =
    activeTab === "Paid" ? rows.filter((r) => r.status === "PAID")
    : activeTab === "Unpaid" ? rows.filter((r) => r.status !== "PAID")
    : rows;
  const activeFilters = activeTab === "All" ? 0 : 1;

  /* ---- selected record: ?id= wins, else current selection, else first ---- */
  const sel = rows.find((r) => r.id === (selectedId ?? params.get("id"))) ?? filtered[0] ?? rows[0];
  const selCampaign = campaigns.find((c) => c.id === sel?.campaignId);
  const { data: selFull } = useCampaignFull(sel?.campaignId ?? null);

  const invoices: Invoice[] = filtered.slice(0, 4).map((row) => ({
    id: row.id,
    inv: row.number,
    brand: row.brandName,
    amt: `₹${row.budget.toLocaleString("en-IN")}`,
    date: fmtDate(row.createdAt),
    sel: row.id === sel?.id,
  }));

  return (
    <>
      {/* INVOICES title */}
      <h1 className="absolute left-[260px] top-[153px] text-[40px] font-normal leading-[50px] text-black">INVOICES</h1>

      {/* Campaigns container */}
      <div className="absolute left-[277px] top-[224px] h-[288px] w-[697px] rounded-[24px] border border-[#D4D4D4]">
        <span className="absolute left-[20px] top-[13px] text-[20px] leading-[24px] text-black">Campaigns</span>
        <div className="absolute left-[20px] top-[68px] flex w-[650px] gap-[15px] overflow-hidden">
          {campaignsLoading || campaigns.length === 0 ? (
            <span className="text-[13px] text-black/40">{campaignsLoading ? "Loading campaigns…" : "No campaigns yet"}</span>
          ) : (
            campaigns.slice(0, 6).map((c) => (
              <CampaignCard
                key={c.id}
                c={c}
                paid={rows.some((r) => r.campaignId === c.id && r.status === "PAID")}
                source={agencies.find((a) => a.id === c.agencyId)?.name ?? "—"}
                onClick={() => navigate("/campaigns/detail")}
              />
            ))
          )}
        </div>
      </div>

      {/* Overdue / stats container */}
      <div
        className="absolute left-[985px] top-[223px] h-[288px] w-[432px] rounded-[24px] border border-[#D4D4D4]"
        style={{ backgroundImage: "linear-gradient(143deg, rgba(255,255,255,0.46) 0%, #74A4F7 100%)" }}
      >
        <StatMini icon={Clock} label="Overdue" value={`₹${short(overdue)}`} left={9} />
        <StatMini icon={Calendar} label="Due next month" value={`₹${short(dueNext)}`} left={137} />
        <StatMini
          icon={Wallet}
          label="Avg. time to get paid"
          value={settled.length ? `${avgDays} days` : "—"}
          left={279}
        />

        <div className="absolute left-[17px] top-[142px] text-[28.1px] font-medium leading-[21px] text-[#111111]">
          {short(collected)}
        </div>
        <div className="absolute left-[17px] top-[167px] text-[12.3px] font-light leading-[19px] text-[#111111]">Total Collected</div>

        <div className="absolute left-[16px] top-[199px] h-[23px] w-[388px] rounded-[14px] bg-[#FFFBFB]">
          <div className="h-[23px] rounded-[14px] bg-[#889FC3]" style={{ width: (collectedPct / 100) * 388 }} />
        </div>
        <div className="absolute left-[21px] top-[231px] text-[12.3px] font-light leading-[19px] text-[#111111]">This Month</div>
        <div className="absolute left-[364px] top-[230px] text-[21.1px] leading-[21px] text-[rgba(17,17,17,0.7)]">{collectedPct}%</div>
      </div>

      {/* Active filters header */}
      <h2 className="absolute left-[277px] top-[537px] text-[24px] leading-[24px] text-black">Active filters</h2>
      <span className="absolute left-[424px] top-[540px] flex h-[25px] w-[25px] items-center justify-center rounded-full bg-[#111111] text-[12px] text-white">
        {activeFilters}
      </span>

      {/* Date picker */}
      <div className="absolute left-[513px] top-[530px] flex h-[45px] w-[203px] items-center rounded-[24px] bg-white">
        <span className="ml-[17px] text-[12px] font-light text-black/70">July 2025</span>
        <span className="absolute right-[3px] top-[2.5px] flex h-[40px] w-[40px] items-center justify-center rounded-[24px] bg-[#E4E4E4]">
          <Calendar className="h-[20px] w-[20px] text-black" strokeWidth={1.7} />
        </span>
      </div>

      {/* Invoice number search */}
      <div
        onClick={() => navigate("/search")}
        className="absolute left-[724px] top-[530px] flex h-[45px] w-[195px] cursor-pointer items-center rounded-[24px] bg-white"
      >
        <span className="ml-[15px] text-[12px] font-light text-black/70">Enter Invoice number</span>
        <span className="absolute right-[4px] top-[2.5px] flex h-[40px] w-[40px] items-center justify-center rounded-[24px] bg-[#E4E4E4]">
          <Search className="h-[19px] w-[19px] text-black" strokeWidth={1.9} />
        </span>
      </div>

      {/* Bottom panel — L-shaped (two same-colour pieces, top-left notch) */}
      <div className="absolute left-[602px] top-[598px] h-[70px] w-[822px] rounded-tr-[24px] bg-[rgba(227,228,244,0.81)]" />
      <div className="absolute left-[277px] top-[667px] h-[330px] w-[1147px] rounded-b-[24px] bg-[rgba(227,228,244,0.81)]" />

      {/* tabs */}
      <span
        onClick={() => setActiveTab("All")}
        className={`absolute left-[277px] top-[608px] flex h-[45px] w-[63px] cursor-pointer items-center justify-center rounded-[24px] text-[20px] font-extralight ${
          activeTab === "All" ? "bg-black text-white" : "bg-white text-black"
        }`}
      >
        All
      </span>
      <div
        onClick={() => setActiveTab("Paid")}
        className={`absolute left-[348px] top-[608px] flex h-[45px] w-[100px] cursor-pointer items-center gap-[4px] rounded-[24px] pl-[16px] ${
          activeTab === "Paid" ? "bg-black" : "bg-white"
        }`}
      >
        <span className={`text-[20px] font-extralight ${activeTab === "Paid" ? "text-white" : "text-black"}`}>Paid</span>
        <span className="flex h-[20px] w-[20px] items-center justify-center rounded-full bg-black/[0.06] text-[12px] text-black">
          {paidCount}
        </span>
      </div>
      <div
        onClick={() => setActiveTab("Unpaid")}
        className={`absolute left-[456px] top-[608px] flex h-[45px] w-[123px] cursor-pointer items-center gap-[4px] rounded-[24px] pl-[16px] ${
          activeTab === "Unpaid" ? "bg-black" : "bg-white"
        }`}
      >
        <span className={`text-[20px] font-extralight ${activeTab === "Unpaid" ? "text-white" : "text-black"}`}>Unpaid</span>
        <span className="flex h-[20px] w-[20px] items-center justify-center rounded-full bg-black/[0.06] text-[12px] text-black">
          {unpaidCount}
        </span>
      </div>

      {/* All Invoices heading */}
      <h3 className="absolute left-[619px] top-[605px] text-[20px] leading-[24px] text-black">All Invoices</h3>

      {/* invoice list */}
      <div className="absolute left-[294px] top-[705px] flex flex-col gap-[10px]">
        {isLoading || invoices.length === 0 ? (
          <span className="text-[13px] text-black/40">{isLoading ? "Loading invoices…" : "No invoices"}</span>
        ) : (
          invoices.map((v) => <InvoiceRow key={v.id} v={v} onClick={() => setSelectedId(v.id)} />)
        )}
      </div>

      {/* invoice detail card */}
      <div className="absolute left-[715px] top-[678px] h-[305px] w-[692px] rounded-[24px] border border-[#D4D4D4] bg-[rgba(146,161,185,0.96)]">
        <div className="absolute left-[22px] top-[20.5px]">
          <DetailField label="Invoices details" value={sel ? `#${sel.number}` : ""} />
        </div>
        <div className="absolute left-[282px] top-[21px]">
          <DetailField label="Brand Name" value={sel?.brandName ?? ""} />
        </div>
        <div className="absolute left-[480px] top-[20px] w-[190px]">
          <DetailField
            label="Address"
            value="—"
            valueClass="text-[12px] leading-[14px] text-white"
          />
        </div>

        {/* Campaign Name subcard */}
        <div className="absolute left-[22px] top-[97px] h-[98px] w-[200px] rounded-[24px] bg-white/[0.47]">
          <div className="absolute left-[14px] top-[10px] text-[14px] font-light leading-[24px] text-white/90">Campaign Name</div>
          <div className="absolute left-[14px] top-[36px] text-[12px] font-medium leading-[24px] text-white">
            {selCampaign?.name ?? ""}
          </div>
        </div>

        {/* Creator / Service subcard */}
        <div className="absolute left-[243px] top-[97px] h-[98px] w-[200px] rounded-[24px] bg-white/[0.47]">
          <div className="absolute left-[17px] top-[10px] text-[14px] font-light leading-[24px] text-white/90">Creator / Service</div>
          <span className="absolute left-[17px] top-[35px] h-[24px] w-[24px] rounded-full bg-gradient-to-br from-[#FFD6E7] to-[#C8B3ED]" />
          <div className="absolute left-[47px] top-[38px] text-[12px] font-medium leading-[24px] text-white">
            {selFull?.creatorList?.[0]?.name ?? ""}
          </div>
          <div className="absolute left-[47px] top-[62px] text-[12px] leading-[24px] text-white/90">
            {selFull?.creatorList?.[0]?.handle ?? ""}
          </div>
        </div>

        {/* Bank Details subcard */}
        <div className="absolute left-[464px] top-[97px] h-[98px] w-[200px] rounded-[24px] bg-white/[0.47]">
          <div className="absolute left-[27px] top-[7px] text-[14px] font-light leading-[24px] text-white/90">Bank Details</div>
          <div className="absolute left-[27px] top-[32px] whitespace-pre-line text-[12px] font-medium leading-[17px] text-white">
            —
          </div>
        </div>

        {/* bottom bar */}
        <div className="absolute left-[22px] top-[210px] h-[72px] w-[648px] rounded-[38px] bg-white/[0.47]">
          <div className="absolute left-[35px] top-[10px]">
            <DetailField label="Sub Total" value={sel ? `₹${sel.budget.toLocaleString("en-IN")}` : ""} />
          </div>
          <div className="absolute left-[167px] top-[10px]">
            <DetailField label="GST" value={sel ? `₹${sel.agencyFee.toLocaleString("en-IN")}` : ""} />
          </div>
          <div className="absolute left-[299px] top-[10px]">
            <DetailField label="Total Amount" value={sel ? `₹${sel.payout.toLocaleString("en-IN")}` : ""} />
          </div>
          <span className="absolute left-[457px] top-[14px] flex h-[40px] w-[40px] items-center justify-center rounded-full bg-white">
            <Download className="h-[19px] w-[19px] text-black" strokeWidth={1.7} />
          </span>
          <span
            onClick={() => {
              if (sel && sel.status !== "PAID") markPaid.mutate({ id: sel.id, data: { status: "PAID" } });
            }}
            className="absolute left-[511px] top-[11px] flex h-[45px] w-[119px] cursor-pointer items-center justify-center rounded-[24px] bg-white text-[14px] leading-[24px] text-black"
          >
            {sel?.status === "PAID" ? "Paid" : "Mark Paid"}
          </span>
        </div>
      </div>
    </>
  );
}
