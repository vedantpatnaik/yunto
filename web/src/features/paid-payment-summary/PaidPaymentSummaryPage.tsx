import { ChevronLeft, Pencil, TrendingDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCreators, useInvoices, type Creator } from "@/api/hooks";

/**
 * Super Admin — Paid Payment Summary.
 * Exact reconstruction of Figma frame 5063:60642 ("Super Admin- paid payment summary"), 1440×1024.
 * Clean underlying page: the profile dropdown + dim scrim siblings (5063:61126) are intentionally skipped.
 * Renders inside AppShell (TopBar + Sidebar already present).
 */

/* ------------------------------ primitives ----------------------------- */
function EditBtn({ size }: { size: "row" | "budget" | "mini" }) {
  const box = size === "budget" ? "h-[35px] w-[35px]" : size === "mini" ? "h-[20px] w-[20px]" : "h-[28px] w-[28px]";
  const ic = size === "budget" ? "h-[15px] w-[15px]" : size === "mini" ? "h-[10px] w-[10px]" : "h-[13px] w-[13px]";
  return (
    <span className={`flex items-center justify-center rounded-full bg-white/50 ${box}`}>
      <Pencil className={`text-ink/60 ${ic}`} strokeWidth={1.3} />
    </span>
  );
}

/** ₹ symbol (16px, muted) + large digits — matches the per-character size overrides in the Figma text. */
function Amount({ digits, big }: { digits: string; big: string }) {
  return (
    <span className="inline-flex items-baseline">
      <span className="text-[16px] font-normal text-ink/70">₹</span>
      <span className={`ml-[3px] font-normal text-ink ${big}`}>{digits}</span>
    </span>
  );
}

/** Left-card creator row: avatar · name/handle · amount · edit. */
function CreatorRow({ top, name, handle, amount, grad, onClick }: { top: number; name: string; handle: string; amount: string; grad: string; onClick?: () => void }) {
  return (
    <div onClick={onClick} className="absolute left-[283px] h-[37px] w-[344px] cursor-pointer" style={{ top }}>
      <span className={`absolute left-0 top-[2px] h-[32.6px] w-[32.6px] rounded-full bg-gradient-to-br ${grad}`} />
      <div className="absolute left-[37.6px] top-0">
        <div className="text-[13.2px] font-medium leading-[19.3px] text-ink/90">{name}</div>
        <div className="font-inter text-[8.8px] font-normal leading-[17.4px] text-ink/70">{handle}</div>
      </div>
      <span className="absolute left-[199.9px] top-[8.7px] text-[13.2px] font-normal text-ink/60">{amount}</span>
      <div className="absolute left-[315.9px] top-[4.4px]">
        <EditBtn size="row" />
      </div>
    </div>
  );
}

/** Left-card agency (group) header: avatar · name. */
function AgencyHeader({ top, name, grad, size }: { top: number; name: string; grad: string; size: number }) {
  return (
    <div className="absolute left-[283px] h-[28px] w-[300px]" style={{ top }}>
      <span className={`absolute left-[1.5px] top-[1.5px] rounded-full bg-gradient-to-br ${grad}`} style={{ width: size, height: size }} />
      <span className="absolute left-[33px] top-[6.5px] text-[14px] font-normal text-ink/70">{name}</span>
    </div>
  );
}

/** Grey creator sub-row inside the right-card cost tables. */
function CostRow({ top, name, amount }: { top: number; name: string; amount: string }) {
  return (
    <div className="absolute left-[712px] h-[20px] w-[572px]" style={{ top }}>
      <span className="absolute left-0 top-0 text-[12px] font-normal leading-[20px] text-ink/50">{name}</span>
      <span className="absolute right-[26px] top-[4px] text-[12px] font-normal leading-[20px] text-[#E44E26]">{amount}</span>
      <div className="absolute right-0 top-[2px]">
        <EditBtn size="mini" />
      </div>
    </div>
  );
}

/** "Added  15% ✎" agency-fee pill. */
function AgencyFeePill({ left, top }: { left: number; top: number }) {
  return (
    <div className="absolute flex h-[22px] w-[117px] items-center rounded-[24px] bg-white pl-[11px] shadow-[0_1px_3px_rgba(0,0,0,0.06)]" style={{ left, top }}>
      <span className="text-[12px] font-normal text-ink">Added</span>
      <span className="ml-[9px] flex h-[22px] w-[57px] items-center gap-[3px] rounded-[24px] bg-white pl-[8px] shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
        <span className="text-[12px] font-medium text-[#3DBB6C]">15%</span>
        <span className="flex h-[20px] w-[20px] items-center justify-center rounded-full bg-white">
          <Pencil className="h-[10px] w-[10px] text-ink/60" strokeWidth={1.3} />
        </span>
      </span>
    </div>
  );
}

/* -------------------------------- page --------------------------------- */
export default function PaidPaymentSummaryPage() {
  const navigate = useNavigate();
  const { data: invoices } = useInvoices();
  const { data: creators } = useCreators();

  const inr = (n: number) => n.toLocaleString("en-IN");
  const paid = (invoices ?? []).find((i) => i.status === "PAID");
  const rows = (creators ?? []).slice(0, 8);
  const totalFollowers = rows.reduce((s, c) => s + c.followers, 0) || 1;
  // Per-creator payout = share of the paid invoice's total payout, weighted by followers.
  const payoutOf = (c: Creator) => Math.round(((paid?.payout ?? 0) * c.followers) / totalFollowers);
  const nameOf = (c?: Creator) => c?.name ?? "";
  const handleOf = (c?: Creator) => c?.handle ?? "";
  const amountOf = (c?: Creator, sign = "") => (c ? `${sign}₹${inr(payoutOf(c))}` : "");

  return (
    <>
      {/* Back button — 235,153 · 45×45 black circle */}
      <div onClick={() => navigate(-1)} className="absolute left-[235px] top-[153px] flex h-[45px] w-[45px] cursor-pointer items-center justify-center rounded-full bg-black">
        <ChevronLeft className="h-[18px] w-[18px] text-white" strokeWidth={2.2} />
      </div>

      {/* Title */}
      <h1 className="absolute left-[270px] top-[228px] text-[34px] font-normal leading-[43px] text-ink">Payment Summary</h1>
      <span className="absolute left-[261px] top-[273px] h-px w-[303px] bg-[#C9C9C9]" />
      <span onClick={() => navigate("/invoices")} className="absolute left-[600px] top-[235px] cursor-pointer text-[24px] font-normal leading-[30px] text-ink underline decoration-1 underline-offset-[3px]">
        {paid?.number ?? ""}
      </span>

      {/* ============================ LEFT CARD ============================ */}
      <div className="absolute left-[261px] top-[301px] h-[682px] w-[410px] rounded-[20px] bg-white/[0.81]" />

      <span className="absolute left-[284px] top-[312px] text-[16px] font-normal leading-[24px] text-ink">Your Creators</span>
      <div className="absolute left-[521px] top-[315px] flex h-[24px] w-[106px] items-center justify-center rounded-[12px] bg-white">
        <span className="text-[12px] font-normal text-ink/80">Total Creators - {rows.length}</span>
      </div>

      {/* Section 1 — own creators */}
      <CreatorRow top={352} name={nameOf(rows[0])} handle={handleOf(rows[0])} amount={amountOf(rows[0])} grad="from-[#FFD9A8] to-[#C8B3ED]" onClick={() => navigate("/creators/detail")} />
      <CreatorRow top={399} name={nameOf(rows[1])} handle={handleOf(rows[1])} amount={amountOf(rows[1])} grad="from-[#C8E6FF] to-[#C8B3ED]" onClick={() => navigate("/creators/detail")} />
      <CreatorRow top={446} name={nameOf(rows[2])} handle={handleOf(rows[2])} amount={amountOf(rows[2])} grad="from-[#FFD6E7] to-[#C8B3ED]" onClick={() => navigate("/creators/detail")} />
      <span className="absolute left-[294px] top-[506px] h-px w-[344px] bg-[#E2E2E2]" />

      {/* Section 2 — Stellar Talents */}
      <AgencyHeader top={516} name="Stellar Talents" grad="from-[#2FB37A] to-[#1E8F5E]" size={24.7} />
      <div className="absolute left-[569px] top-[518px] flex h-[24px] w-[58px] items-center justify-center rounded-[12px] bg-[#F1F1F1]">
        <span className="text-[12px] font-light text-ink/60">External</span>
      </div>
      <CreatorRow top={557} name={nameOf(rows[3])} handle={handleOf(rows[3])} amount={amountOf(rows[3])} grad="from-[#C8FFE0] to-[#B3C8ED]" onClick={() => navigate("/creators/detail")} />
      <CreatorRow top={606.7} name={nameOf(rows[4])} handle={handleOf(rows[4])} amount={amountOf(rows[4])} grad="from-[#F1FFC3] to-[#C8B3ED]" onClick={() => navigate("/creators/detail")} />
      <CreatorRow top={656.4} name={nameOf(rows[5])} handle={handleOf(rows[5])} amount={amountOf(rows[5])} grad="from-[#FFC8D6] to-[#C8B3ED]" onClick={() => navigate("/creators/detail")} />
      <span className="absolute left-[283px] top-[706px] h-px w-[366px] bg-[#E2E2E2]" />

      {/* Section 3 — Firefly Creators */}
      <AgencyHeader top={719} name="Firefly Creators" grad="from-[#3A3A3A] to-[#111111]" size={24} />
      <div className="absolute left-[569px] top-[721px] flex h-[24px] w-[58px] items-center justify-center rounded-[12px] bg-[#F1F1F1]">
        <span className="text-[12px] font-light text-ink/60">External</span>
      </div>
      <CreatorRow top={757} name={nameOf(rows[6])} handle={handleOf(rows[6])} amount={amountOf(rows[6])} grad="from-[#D6C8FF] to-[#C8E6FF]" onClick={() => navigate("/creators/detail")} />
      <CreatorRow top={803.7} name={nameOf(rows[7])} handle={handleOf(rows[7])} amount={amountOf(rows[7])} grad="from-[#FFE3C8] to-[#C8B3ED]" onClick={() => navigate("/creators/detail")} />

      {/* =========================== RIGHT CARD =========================== */}
      <div className="absolute left-[682px] top-[301px] h-[682px] w-[647px] rounded-[20px] bg-white/[0.81]" />

      <span className="absolute left-[696px] top-[317px] text-[20px] font-normal leading-[24px] text-ink">Campaign Budget</span>
      <div className="absolute left-[1217px] top-[320px] flex h-[24px] w-[88px] items-center justify-center gap-[6px] rounded-[12px] border border-[#D9D9D9] bg-white">
        <span className="text-[12px] font-light text-ink/60">Status</span>
        <span className="text-[12px] font-medium text-[#4CCC16]">Active</span>
      </div>

      {/* Budget cards */}
      <div className="absolute left-[696px] top-[360px] h-[91px] w-[300px] overflow-hidden rounded-[10.5px] border border-[#E6E3A0] bg-white/70">
        <div className="absolute inset-0 bg-[rgba(255,252,210,0.36)]" />
      </div>
      <span className="absolute left-[703px] top-[367px] text-[15.7px] font-normal text-ink/70">Brand Budget</span>
      <div className="absolute left-[947px] top-[367px]">
        <EditBtn size="budget" />
      </div>
      <div className="absolute left-[703px] top-[393px]">
        <Amount digits="1,00,000" big="text-[20px]" />
      </div>

      <div className="absolute left-[1004px] top-[360px] h-[91px] w-[300px] overflow-hidden rounded-[10.5px] border border-[#B8C7F0] bg-white/70">
        <div className="absolute inset-0 bg-[rgba(210,224,255,0.36)]" />
      </div>
      <span className="absolute left-[1011px] top-[367px] text-[15.7px] font-normal text-ink/70">Estimate Spend</span>
      <div className="absolute left-[1255px] top-[367px]">
        <EditBtn size="budget" />
      </div>
      <div className="absolute left-[1011px] top-[393px]">
        <Amount digits="50,000" big="text-[20px]" />
      </div>
      <div className="absolute left-[1011px] top-[421px] flex h-[20px] w-[115px] items-center gap-[4px] rounded-[5px] bg-white px-[5px]">
        <TrendingDown className="h-[13px] w-[13px] text-[#8D8D8D]" strokeWidth={1.6} />
        <span className="text-[12px] font-light text-[#8D8D8D]">Under Budget</span>
      </div>

      {/* Your Agency Costs table */}
      <div className="absolute left-[696px] top-[464px] h-[210px] w-[609px] rounded-[10px] border border-[#D9D9D9] bg-white" />
      <div className="absolute left-[696px] top-[464px] h-[34px] w-[609px] rounded-t-[10px] border-b border-[#D9D9D9] bg-[#F9F9F9]" />
      <span className="absolute left-[703px] top-[470px] text-[15px] font-normal leading-[23px] text-ink/70">YOUR AGENCY COSTS</span>

      <span className="absolute left-[712px] top-[504px] text-[13px] font-normal leading-[23px] text-ink/80">Creator Payouts (Internal)</span>
      <div className="absolute right-[156px] top-[505px]">
        <Amount digits="24,000" big="text-[18px]" />
      </div>
      <CostRow top={536} name={nameOf(rows[0])} amount={amountOf(rows[0], "- ")} />
      <CostRow top={569} name={nameOf(rows[1])} amount={amountOf(rows[1], "- ")} />
      <span className="absolute left-[1160px] top-[578px] text-[7.2px] font-normal text-[#E44E26] line-through">₹9,000</span>
      <CostRow top={602} name={nameOf(rows[2])} amount={amountOf(rows[2], "- ")} />
      <span className="absolute left-[711px] top-[636px] text-[13px] font-normal leading-[23px] text-ink/80">AGENCY FEE</span>
      <AgencyFeePill left={804} top={637} />
      <div className="absolute right-[156px] top-[637px]">
        <Amount digits="30,000" big="text-[18px]" />
      </div>

      {/* Stellar Talents table */}
      <div className="absolute left-[697px] top-[687px] h-[289px] w-[608px] rounded-[10px] border border-[#D9D9D9] bg-white" />
      <div className="absolute left-[697px] top-[687px] h-[34px] w-[608px] rounded-t-[10px] border-b border-[#D9D9D9] bg-[#F9F9F9]" />
      <span className="absolute left-[704px] top-[693px] text-[15px] font-normal leading-[23px] text-ink/70">STELLAR TALENTS</span>

      <span className="absolute left-[712px] top-[727px] text-[13px] font-normal leading-[23px] text-ink/80">Creator Payouts (External)</span>
      <div className="absolute right-[156px] top-[728px]">
        <Amount digits="21,000" big="text-[18px]" />
      </div>
      <CostRow top={759} name={nameOf(rows[3])} amount={amountOf(rows[3], "- ")} />
      <CostRow top={792} name={nameOf(rows[4])} amount={amountOf(rows[4], "- ")} />
      <CostRow top={825} name={nameOf(rows[5])} amount={amountOf(rows[5], "- ")} />
      <span className="absolute left-[712px] top-[859px] text-[13px] font-normal leading-[23px] text-ink/80">AGENCY FEE</span>
      <AgencyFeePill left={805} top={860} />
      <div className="absolute right-[156px] top-[860px]">
        <Amount digits="30,000" big="text-[18px]" />
      </div>
      <span className="absolute left-[715px] top-[896px] h-px w-[572px] bg-[#E2E2E2]" />

      {/* Advance payment bar (mostly covered by the footer, top edge peeks) */}
      <div className="absolute left-[709px] top-[906px] h-[57px] w-[584px] rounded-[10px] border border-[#52D482] bg-[#F2FFF6]" />
      <span className="absolute left-[724px] top-[923px] text-[15px] font-medium leading-[24px] text-ink">ADVANCE PAYMENT</span>
      <div className="absolute right-[158px] top-[924px]">
        <Amount digits="20,000" big="text-[18px]" />
      </div>

      {/* Footer bar */}
      <div className="absolute left-[682px] top-[916px] h-[67px] w-[647px] rounded-b-[20px] border-t border-[#D9D9D9] bg-[#F9F9F9]" />
      <div onClick={() => navigate("/leads/download")} className="absolute left-[710px] top-[931px] flex h-[38.5px] w-[136px] cursor-pointer items-center justify-center rounded-[20.5px] bg-white">
        <span className="text-[15.4px] font-normal text-ink/60">Download PDF</span>
      </div>
      <span className="absolute right-[140px] top-[921px] text-[14px] font-normal leading-[24px] text-ink/70">ESTIMATE PAYOUT</span>
      <span className="absolute right-[140px] top-[947px] text-[24px] font-semibold leading-[20px] text-[#3DBB6C]">₹2,50,000</span>
    </>
  );
}
