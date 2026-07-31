import { ChevronLeft, Pencil } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCreators, useInvoices } from "@/api/hooks";

/**
 * Super Admin — Barter Payment Summary.
 * Exact reconstruction of Figma frame 5055:46747, 1440×1024.
 * Renders inside AppShell (TopBar + Sidebar already present).
 * The captured frame had the profile dropdown + dim scrim open — omitted here.
 */

/* ------------------------------ data ----------------------------- */
/* Avatar gradients are part of the visual design, kept per-row index. */
const INTERNAL_GRADS = [
  "from-[#C8E6FF] to-[#C8B3ED]",
  "from-[#FFD6E7] to-[#C8B3ED]",
  "from-[#F1FFC3] to-[#C8B3ED]",
];
const EXTERNAL_GRADS = [
  "from-[#C8E6FF] to-[#1FB37A]",
  "from-[#FFE0B3] to-[#FF9C6D]",
  "from-[#D2C6E5] to-[#C8E6FF]",
];

/* ----------------------------- primitives ---------------------------- */
function EditBtn({ left, top, onClick }: { left: number; top: number; onClick?: () => void }) {
  return (
    <span
      onClick={onClick}
      className={`absolute flex h-[20px] w-[20px] items-center justify-center rounded-[10px] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.10)]${onClick ? " cursor-pointer" : ""}`}
      style={{ left, top }}
    >
      <Pencil className="h-[10px] w-[10px] text-ink/60" strokeWidth={1.6} />
    </span>
  );
}

function LeftRow({ nameTop, name, handle, grad, onClick }: { nameTop: number; name: string; handle: string; grad: string; onClick?: () => void }) {
  return (
    <>
      <span onClick={onClick} className={`absolute h-[31px] w-[31px] cursor-pointer rounded-full bg-gradient-to-br ${grad}`} style={{ left: 283, top: nameTop + 2 }} />
      <span onClick={onClick} className="absolute cursor-pointer text-[13.2px] font-medium leading-none text-ink/90" style={{ left: 320.6, top: nameTop + 3 }}>{name}</span>
      <span onClick={onClick} className="absolute cursor-pointer font-inter text-[8.8px] font-normal leading-none text-ink/70" style={{ left: 320.6, top: nameTop + 23 }}>{handle}</span>
      <span onClick={onClick} className="absolute cursor-pointer text-[13.2px] font-normal leading-none text-ink/60" style={{ left: 482.9, top: nameTop + 12 }}>1 Reel , 1 Story</span>
    </>
  );
}

function TableRow({ nameLeft, top, name, delRight, editLeft, onClick }: { nameLeft: number; top: number; name: string; delRight: number; editLeft: number; onClick?: () => void }) {
  return (
    <>
      <span onClick={onClick} className="absolute cursor-pointer text-[12px] font-normal leading-none text-ink/50" style={{ left: nameLeft, top: top + 5 }}>{name}</span>
      <span onClick={onClick} className="absolute cursor-pointer text-right text-[12px] font-normal leading-none text-[#E44E26]" style={{ right: delRight, top: top + 8 }}>1 Reel , 1 Story</span>
      <EditBtn left={editLeft} top={top + 3} onClick={onClick} />
    </>
  );
}

function AgencyFeeRow({ labelLeft, top, pillLeft, addedLeft, green, amountRight, onEdit }: { labelLeft: number; top: number; pillLeft: number; addedLeft: number; green: string; amountRight: number; onEdit?: () => void }) {
  return (
    <>
      <span className="absolute text-[13px] font-normal uppercase leading-none text-ink/80" style={{ left: labelLeft, top: top + 6 }}>Agency Fee</span>
      {/* Added pill */}
      <div onClick={onEdit} className="absolute h-[22px] cursor-pointer rounded-[24px] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.08)]" style={{ left: pillLeft, top: top + 1, width: 117 }} />
      <span onClick={onEdit} className="absolute cursor-pointer text-[12px] font-normal leading-none text-black" style={{ left: addedLeft, top: top + 6 }}>Added</span>
      <span onClick={onEdit} className="absolute cursor-pointer text-[12px] font-medium leading-none text-[#3DBB6C] underline" style={{ left: addedLeft + 41, top: top + 6 }}>{green}</span>
      <EditBtn left={pillLeft + 109} top={top + 2} onClick={onEdit} />
      {/* amount */}
      <span className="absolute text-right text-[13.2px] font-normal leading-none text-black" style={{ right: amountRight, top: top + 6 }}>₹ 3,000</span>
    </>
  );
}

/* -------------------------------- page --------------------------------- */
export default function BarterPaymentSummaryPage() {
  const navigate = useNavigate();
  const creators = useCreators().data ?? [];
  const invoices = useInvoices().data ?? [];
  const barterInvoice = invoices.find((i) => (i as { dealType?: string }).dealType === "BARTER");
  const internal = creators.slice(0, 3);
  const external = creators.slice(3, 6);
  /* Creator detail + invoices both read ?id= from the URL. */
  const openCreator = (id?: string) => navigate(id ? `/creators/detail?id=${id}` : "/creators/detail");
  const openInvoice = () => navigate(barterInvoice ? `/invoices?id=${barterInvoice.id}` : "/invoices");
  return (
    <>
      {/* Back button */}
      <span onClick={() => navigate(-1)} className="absolute flex h-[45px] w-[45px] cursor-pointer items-center justify-center rounded-full bg-black" style={{ left: 235, top: 153 }}>
        <ChevronLeft className="h-[22px] w-[22px] text-white" strokeWidth={2} />
      </span>

      {/* Title */}
      <div className="absolute border-b border-[#C9C9C9]" style={{ left: 261, top: 218, width: 302, height: 63 }} />
      <h1 className="absolute text-[34px] font-normal leading-none text-black" style={{ left: 270, top: 234 }}>Payment Summary</h1>
      <span onClick={openInvoice} className="absolute cursor-pointer text-[24px] font-normal leading-none text-black underline underline-offset-4" style={{ left: 600, top: 240 }}>{barterInvoice?.number ?? ""}</span>

      {/* ============================ LEFT CARD ============================ */}
      <div className="absolute rounded-[20px] bg-[rgba(255,255,255,0.81)]" style={{ left: 261, top: 301, width: 410, height: 682 }} />

      {/* header */}
      <span className="absolute text-[16px] font-normal leading-none text-black" style={{ left: 284, top: 319 }}>Your Creators</span>
      <div className="absolute flex h-[24px] items-center justify-center rounded-[12px] bg-white" style={{ left: 521, top: 315, width: 106 }}>
        <span className="text-[12px] font-normal leading-none text-ink/80">Total Creators - {internal.length + external.length}</span>
      </div>

      {/* internal creators */}
      {internal.map((c, i) => (
        <LeftRow key={c.id} nameTop={352 + i * 47} name={c.name} handle={c.handle} grad={INTERNAL_GRADS[i]} onClick={() => openCreator(c.id)} />
      ))}

      {/* divider */}
      <div className="absolute h-px bg-[#E2E2E2]" style={{ left: 294, top: 506, width: 344 }} />

      {/* external agency header */}
      <span className="absolute h-[25px] w-[25px] rounded-full bg-gradient-to-br from-[#1FB37A] to-[#146C4C]" style={{ left: 284, top: 517 }} />
      <span className="absolute text-[14px] font-normal leading-none text-ink/70" style={{ left: 316, top: 523 }}>Stellar Talents</span>
      <div className="absolute flex h-[24px] items-center justify-center rounded-[12px] bg-[#F1F1F1]" style={{ left: 569, top: 518, width: 58 }}>
        <span className="text-[12px] font-light leading-none text-ink/60">External</span>
      </div>

      {/* external creators */}
      <LeftRow nameTop={557} name={external[0]?.name ?? ""} handle={external[0]?.handle ?? ""} grad={EXTERNAL_GRADS[0]} onClick={() => openCreator(external[0]?.id)} />
      <LeftRow nameTop={606.7} name={external[1]?.name ?? ""} handle={external[1]?.handle ?? ""} grad={EXTERNAL_GRADS[1]} onClick={() => openCreator(external[1]?.id)} />
      <LeftRow nameTop={656.4} name={external[2]?.name ?? ""} handle={external[2]?.handle ?? ""} grad={EXTERNAL_GRADS[2]} onClick={() => openCreator(external[2]?.id)} />

      <div className="absolute h-px bg-[#E2E2E2]" style={{ left: 283, top: 706, width: 366 }} />

      {/* ============================ RIGHT CARD ============================ */}
      <div className="absolute rounded-[20px] bg-[rgba(255,255,255,0.81)]" style={{ left: 682, top: 301, width: 647, height: 682 }} />

      {/* header */}
      <span className="absolute text-[20px] font-normal leading-none text-black" style={{ left: 696, top: 322 }}>Campaign Budget</span>
      <div className="absolute flex h-[24px] items-center justify-between rounded-[12px] bg-white px-[5px]" style={{ left: 1217, top: 320, width: 88 }}>
        <span className="text-[12px] font-light leading-none text-ink/60">Status</span>
        <span className="text-[12px] font-medium leading-none text-[#4CCC16]">Active</span>
      </div>

      {/* Brand Budget card */}
      <div className="absolute rounded-[10.47px] border border-[rgba(0,0,0,0.05)] bg-[rgba(255,252,210,0.5)]" style={{ left: 696, top: 360, width: 300, height: 91 }} />
      <span className="absolute text-[15.7px] font-normal leading-none text-ink/70" style={{ left: 703, top: 372 }}>Brand Budget</span>
      <span onClick={openInvoice} className="absolute flex h-[35px] w-[35px] cursor-pointer items-center justify-center rounded-full bg-white/50" style={{ left: 947, top: 367 }}>
        <Pencil className="h-[14px] w-[14px] text-ink/70" strokeWidth={1.4} />
      </span>
      <div className="absolute flex items-baseline" style={{ left: 703, top: 391 }}>
        <span className="text-[16px] font-normal leading-none text-ink/70">₹</span>
        <span className="text-[20px] font-normal leading-none text-black">&nbsp;50,000</span>
      </div>

      {/* Your Agency Costs table */}
      <div className="absolute rounded-[10px] border border-[rgba(0,0,0,0.06)] bg-white" style={{ left: 696, top: 464, width: 609, height: 210 }} />
      <div className="absolute rounded-t-[10px] bg-[#F9F9F9]" style={{ left: 696, top: 464, width: 609, height: 34 }} />
      <span className="absolute text-[15px] font-normal uppercase leading-none text-ink/70" style={{ left: 703, top: 476 }}>Your Agency Costs</span>
      <span className="absolute text-[13px] font-normal leading-none text-ink/80" style={{ left: 712, top: 511 }}>Creator (internal)</span>
      <span className="absolute text-right text-[13.2px] font-normal leading-none text-black" style={{ right: 156, top: 511 }}>{internal.length} Creators</span>
      <TableRow nameLeft={711} top={536} name={internal[0]?.name ?? ""} delRight={182} editLeft={1263} onClick={() => openCreator(internal[0]?.id)} />
      <TableRow nameLeft={711} top={569} name={internal[1]?.name ?? ""} delRight={182} editLeft={1263} onClick={() => openCreator(internal[1]?.id)} />
      <TableRow nameLeft={711} top={602} name={internal[2]?.name ?? ""} delRight={182} editLeft={1263} onClick={() => openCreator(internal[2]?.id)} />
      <AgencyFeeRow labelLeft={711} top={636} pillLeft={804} addedLeft={826} green="₹1000" amountRight={157} onEdit={openInvoice} />

      {/* Stellar Talents table */}
      <div className="absolute rounded-[10px] border border-[rgba(0,0,0,0.06)] bg-white" style={{ left: 697, top: 687, width: 608, height: 208 }} />
      <div className="absolute rounded-t-[10px] bg-[#F9F9F9]" style={{ left: 697, top: 687, width: 608, height: 34 }} />
      <span className="absolute text-[15px] font-normal uppercase leading-none text-ink/70" style={{ left: 704, top: 699 }}>Stellar Talents</span>
      <span className="absolute text-[13px] font-normal leading-none text-ink/80" style={{ left: 712, top: 734 }}>Creator (External)</span>
      <span className="absolute text-right text-[16px] font-normal leading-none text-black" style={{ right: 156, top: 732 }}>{external.length} Creators</span>
      <TableRow nameLeft={712} top={759} name={external[0]?.name ?? ""} delRight={181} editLeft={1264} onClick={() => openCreator(external[0]?.id)} />
      <TableRow nameLeft={712} top={792} name={external[1]?.name ?? ""} delRight={182} editLeft={1264} onClick={() => openCreator(external[1]?.id)} />
      <TableRow nameLeft={712} top={825} name={external[2]?.name ?? ""} delRight={182} editLeft={1264} onClick={() => openCreator(external[2]?.id)} />
      <AgencyFeeRow labelLeft={712} top={859} pillLeft={805} addedLeft={827} green="₹2000" amountRight={156} onEdit={openInvoice} />

      {/* ============================ BOTTOM BAR ============================ */}
      <div className="absolute rounded-b-[20px] bg-[#F9F9F9]" style={{ left: 682, top: 916, width: 647, height: 67 }} />
      <div onClick={() => navigate("/leads/download")} className="absolute flex h-[38.5px] cursor-pointer items-center justify-center rounded-[20.5px] bg-white shadow-[0_1px_4px_rgba(0,0,0,0.08)]" style={{ left: 710, top: 931, width: 136 }}>
        <span className="text-[15.4px] font-normal leading-none text-ink/60">Download PDF</span>
      </div>
      <span className="absolute text-right text-[14px] font-normal uppercase leading-none text-ink/70" style={{ right: 140, top: 926 }}>Estimate Payout</span>
      <span className="absolute text-right text-[24px] font-semibold leading-none text-[#3DBB6C]" style={{ right: 140, top: 949 }}>₹3,000</span>
    </>
  );
}
