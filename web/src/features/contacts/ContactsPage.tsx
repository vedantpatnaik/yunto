import type { LucideIcon } from "lucide-react";
import { Search, ArrowUpRight, Mail, Phone, Sandwich, Shirt, Luggage, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import whatsapp from "@/assets/icons/whatsapp.svg";
import { useContacts } from "@/api/hooks";

/**
 * Super Admin — Contacts (yunto contacts).
 * Exact reconstruction of Figma frame 5953:53687 ("yunto contacts"), 1440×1024.
 * A folder-tab panel clips a 4×6 grid of client contact cards.
 */

type Cell = { id: string; brand: string; budget: string; source: string; icon: LucideIcon; role: string; avatar: string; email?: string; phone?: string };

// Decorative icon palette for the brand badge — the live Contact record carries no
// logo, so brand-style icons are cycled by index to preserve the design's variety.
// Real data (company, budget, source, contact role/channels) comes from useContacts().
const ICONS: LucideIcon[] = [Sandwich, Shirt, Sparkles, Luggage];

// Budget label: ₹1.2L for lakh-scale figures, ₹90k for smaller ones.
const fmtBudget = (n: number) =>
  n >= 100_000 ? `₹${(n / 100_000).toFixed(1)}L` : `₹${Math.round(n / 1000)}k`;

// card origins relative to the clip frame (frame origin 264,326)
const COL_X = [13.5, 294.5, 575.5, 856.5];
const ROW_Y = [-64, 69, 202, 335, 468, 601];

// placeholder avatar gradients (avatars are dynamic user data)
const AVATAR_GRADIENTS = [
  "from-[#C8E6FF] to-[#C8B3ED]",
  "from-[#FFE0B3] to-[#C8B3ED]",
  "from-[#FFD6E7] to-[#C8B3ED]",
  "from-[#D8F5C8] to-[#C8B3ED]",
  "from-[#B3E5D1] to-[#9FC8F0]",
  "from-[#FFD6E7] to-[#FFE0B3]",
];

function ContactCard({ cell, onOpen }: { cell: Cell; onOpen: () => void }) {
  const Icon = cell.icon;
  return (
    <div className="relative h-[117px] w-[266px] rounded-[12px] bg-[#F5F5F5]">
      {/* arrow */}
      <span
        onClick={onOpen}
        className="absolute left-[238px] top-0 flex h-[28px] w-[28px] cursor-pointer items-center justify-center rounded-full bg-white"
      >
        <ArrowUpRight className="h-[15px] w-[15px] text-black" strokeWidth={1.8} />
      </span>
      {/* date */}
      <span className="absolute left-[193px] top-[13px] whitespace-nowrap text-[8px] leading-none text-black/[0.47]">
        12 July
      </span>

      {/* brand badge */}
      <span className="absolute left-[8px] top-[6px] flex h-[38px] w-[38px] items-center justify-center">
        <span className="flex h-[34px] w-[34px] items-center justify-center rounded-full bg-white">
          <Icon className="h-[18px] w-[18px] text-black/80" strokeWidth={1.6} />
        </span>
      </span>
      {/* brand name + budget */}
      <span className="absolute left-[51px] top-[10.5px] whitespace-nowrap text-[12px] leading-[15px] text-black/90">
        {cell.brand}
      </span>
      <span className="absolute left-[51px] top-[26.5px] whitespace-nowrap text-[8px] leading-none text-black/70">
        {cell.budget}
      </span>

      {/* source */}
      <span className="absolute left-[17px] top-[50px] text-[9.3px] leading-none text-black/90">{cell.source}</span>

      {/* contact person pill */}
      <div className="absolute left-[8px] top-[68px] flex h-[32px] w-[127px] items-center gap-[5px] rounded-[18px] bg-white pl-[6px]">
        <span className={`h-[17px] w-[17px] shrink-0 rounded-full bg-gradient-to-br ${cell.avatar}`} />
        <span className="whitespace-nowrap text-[12.4px] leading-none text-black/90">{cell.role}</span>
      </div>

      {/* contact channels */}
      <span
        onClick={() => {
          if (cell.email) window.location.href = `mailto:${cell.email}`;
        }}
        className="absolute left-[162px] top-[71px] flex h-[25px] w-[25px] cursor-pointer items-center justify-center rounded-full bg-white"
      >
        <Mail className="h-[14px] w-[14px] text-black" strokeWidth={1.6} />
      </span>
      <span
        onClick={() => {
          if (cell.phone) window.location.href = `tel:${cell.phone}`;
        }}
        className="absolute left-[193px] top-[71px] flex h-[25px] w-[25px] cursor-pointer items-center justify-center rounded-full bg-white"
      >
        <Phone className="h-[15px] w-[15px] text-black" strokeWidth={1.6} />
      </span>
      <img
        src={whatsapp}
        alt="WhatsApp"
        onClick={() => {
          if (cell.phone) window.open(`https://wa.me/${cell.phone.replace(/[^\d]/g, "")}`, "_blank");
        }}
        className="absolute left-[224px] top-[71px] h-[25px] w-[25px] cursor-pointer"
      />
    </div>
  );
}

export default function ContactsPage() {
  const navigate = useNavigate();
  const { data } = useContacts();
  // Live contacts → card cells, laid out into the same 4-column / 6-row grid.
  const cells: Cell[] = (data ?? []).slice(0, 24).map((c, i) => ({
    id: c.id,
    brand: c.company ?? c.name,
    budget: c.budget != null ? `Budget ${fmtBudget(c.budget)}` : "",
    source: c.source ?? "",
    icon: ICONS[i % ICONS.length],
    role: c.role ?? "",
    avatar: AVATAR_GRADIENTS[i % AVATAR_GRADIENTS.length],
    email: c.email,
    phone: c.phone,
  }));
  const rows: Cell[][] = [];
  for (let i = 0; i < cells.length; i += 4) rows.push(cells.slice(i, i + 4));

  return (
    <>
      {/* CONTACTS — 254,158 · Outfit 400 40px */}
      <h1 className="absolute left-[254px] top-[150px] text-[40px] font-normal leading-none text-black">CONTACTS</h1>

      {/* search bar — 260,228 · 495×48 */}
      <div
        onClick={() => navigate("/search")}
        className="absolute left-[260px] top-[228px] h-[48px] w-[495px] cursor-pointer rounded-[24px] bg-white"
      >
        <span className="absolute left-[12px] top-[12px] flex h-[24px] w-[24px] items-center justify-center">
          <Search className="h-[19px] w-[19px] text-black" strokeWidth={1.7} />
        </span>
        <span className="absolute left-[44px] top-[14px] text-[15px] font-light text-black/70">
          Search in Clients Contacts
        </span>
      </div>

      {/* All 20 pill — 763,228 · 120×48 */}
      <div className="absolute left-[763px] top-[228px] flex h-[48px] w-[120px] items-center justify-center rounded-[24px] bg-black">
        <span className="text-[20px] font-extralight leading-none text-white">All {(data ?? []).length}</span>
      </div>

      {/* folder-tab panel outline */}
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full"
        viewBox="0 0 1440 1024"
        fill="none"
        preserveAspectRatio="none"
      >
        <path
          d="M284 301 L1118.4 301 Q1140.4 301 1140.4 279 L1140.4 275 Q1140.4 253 1162.4 253 L1374 253 Q1398 253 1398 277 L1398 941 Q1398 965 1374 965 L284 965 Q260 965 260 941 L260 325 Q260 301 284 301 Z"
          stroke="#D4D4D4"
          strokeWidth={1}
        />
      </svg>

      {/* card grid — clipped by the panel (264,326 · 1136×654) */}
      <div className="absolute left-[264px] top-[326px] h-[654px] w-[1136px] overflow-hidden">
        {rows.map((row, r) =>
          row.map((cell, c) => (
            <div key={`${r}-${c}`} className="absolute" style={{ left: COL_X[c], top: ROW_Y[r] }}>
              <ContactCard cell={cell} onOpen={() => navigate(`/leads/detail?id=${cell.id}`)} />
            </div>
          )),
        )}
      </div>
    </>
  );
}
