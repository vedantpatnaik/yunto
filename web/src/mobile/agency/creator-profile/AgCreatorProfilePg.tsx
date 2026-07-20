import type { LucideIcon } from "lucide-react";
import {
  ChevronLeft,
  MoreHorizontal,
  Signal,
  Wifi,
  BatteryFull,
  Flame,
  BadgeCheck,
  Users,
  Eye,
  Tag,
  Instagram,
  Youtube,
  MessageCircle,
  Phone,
  ChevronRight,
  ArrowUpRight,
} from "lucide-react";
import whatsapp from "@/assets/icons/whatsapp.svg";

/**
 * Agency app — Creator profile (Figma frame 7778:17093, "creator profile",
 * 375×876), rendered inside the 390px MobileFrame. Self-contained: it carries
 * its own status bar. This is the single-creator drill-down opened from the
 * Creators / All-creators roster (the ArrowUpRight "open" button on each row),
 * so — like its sibling drill-down All creators (7882:13945) — it has no bottom
 * nav.
 *
 * REAL geometry pinned from the cached full-document tree for THIS node: the
 * frame is 375×876 at origin (-7384, 4971) with a single flat solid fill of
 * #F8F5EF (warm off-white, bound to Figma color variable 7667:55463 — the same
 * token used by the All-creators frame). That fill is used verbatim as the page
 * background below.
 *
 * NOTE: The Figma REST + MCP geometry endpoints were hard rate-limited for the
 * entire build window — /nodes and /images return HTTP 429 with
 * retry-after ≈ 389922s (~4.5 days) on the Starter plan (the /me endpoint still
 * returns 200, so the token is valid; only the cost-based geometry endpoints are
 * throttled), and the Figma MCP bridge returns the Starter tool-call paywall.
 * The cached document dump is depth-2 only, so this frame resolves with its own
 * box + fill but ZERO child geometry, and no per-node render could be pulled.
 * Child layout is therefore reconstructed from the shared design system
 * (tailwind.config.ts tokens) and the geometry-exact creator idiom of the
 * siblings AgencyCreatorsPage / AgencyAllCreatorsPg (Figma node 4100:59321 —
 * avatar + fire badge, name + @handle, Users/Eye/Tag stats, arrow-up-right open
 * button, 20px side margins) and the profile-detail idiom of AgencyProfilePage
 * (7721:4248 — floating hero avatar, 3-up stat card, grouped white cards).
 * Re-run against node 7778:17093 to pin pixel-exact coordinates once the Figma
 * API budget resets.
 */

/* --------------------------------- data ---------------------------------- */
const STATS: { icon: LucideIcon; n: string; l: string }[] = [
  { icon: Users, n: "1.2M", l: "Followers" },
  { icon: Eye, n: "4.8%", l: "Engagement" },
  { icon: Tag, n: "489", l: "Leads" },
];

type Platform = {
  icon: LucideIcon;
  name: string;
  handle: string;
  stat: string;
  color: string;
  bg: string;
};
const PLATFORMS: Platform[] = [
  { icon: Instagram, name: "Instagram", handle: "@leenabliss", stat: "1.2M followers", color: "#E1306C", bg: "#FCE4EF" },
  { icon: Youtube, name: "YouTube", handle: "Leena Bliss", stat: "540k subscribers", color: "#FF0000", bg: "#FFE2E2" },
];

type Campaign = { brand: string; title: string; tag: string; grad: string };
const CAMPAIGNS: Campaign[] = [
  { brand: "Nykaa", title: "Summer Glow — Reel", tag: "Paid", grad: "from-[#FFD3E8] to-[#C8B3ED]" },
  { brand: "Myntra", title: "Festive Edit — Story", tag: "Barter", grad: "from-[#C8DBFF] to-[#B7A6EC]" },
];

/* ------------------------------- primitives ------------------------------ */
function PlatformRow({ p }: { p: Platform }) {
  const Icon = p.icon;
  return (
    <div className="flex h-[62px] items-center gap-[12px] px-[14px]">
      <span
        className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-[11px]"
        style={{ backgroundColor: p.bg }}
      >
        <Icon className="h-[19px] w-[19px]" strokeWidth={1.7} style={{ color: p.color }} />
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-[3px]">
        <span className="text-[13.5px] font-medium leading-none text-ink/90">{p.name}</span>
        <span className="text-[11px] font-light leading-none text-ink/50">{p.handle}</span>
      </div>
      <span className="mr-[4px] text-[11.5px] font-normal leading-none text-ink/70">{p.stat}</span>
      <ChevronRight className="h-[17px] w-[17px] shrink-0 text-ink/30" strokeWidth={1.7} />
    </div>
  );
}

function CampaignRow({ c }: { c: Campaign }) {
  return (
    <div className="flex h-[70px] w-full items-center rounded-[16px] bg-white px-[12px] shadow-[0_4px_14px_rgba(0,0,0,0.05)]">
      <div className={`h-[42px] w-[42px] shrink-0 rounded-[13px] bg-gradient-to-br ${c.grad}`} />
      <div className="ml-[12px] flex min-w-0 flex-1 flex-col gap-[5px]">
        <span className="truncate text-[13.5px] font-medium leading-none text-ink/90">{c.title}</span>
        <div className="flex items-center gap-[7px]">
          <span className="text-[11px] font-light leading-none text-ink/55">{c.brand}</span>
          <span className="flex h-[16px] items-center rounded-full bg-[#F1EEF9] px-[7px] text-[9.5px] font-normal leading-none text-ink/60">
            {c.tag}
          </span>
        </div>
      </div>
      <button className="ml-[8px] flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full border border-[#eaeaea] bg-[#f2f1f3]">
        <ArrowUpRight className="h-[15px] w-[15px] text-ink/80" strokeWidth={1.9} />
      </button>
    </div>
  );
}

/* ---------------------------------- page --------------------------------- */
export default function AgCreatorProfilePg() {
  return (
    <div className="relative w-[390px] overflow-hidden bg-[#F8F5EF] font-sans text-ink" style={{ height: 876 }}>
      {/* soft brand banner behind the hero */}
      <div className="absolute inset-x-0 top-0 h-[250px] bg-gradient-to-b from-[#ECE3FB] to-[#F8F5EF]" />

      {/* status bar */}
      <div className="absolute inset-x-0 top-0 h-[54px]">
        <span className="absolute left-[26px] top-[17px] text-[15px] font-medium leading-none text-ink">
          9:41
        </span>
        <div className="absolute right-[22px] top-[18px] flex items-center gap-[6px]">
          <Signal className="h-[16px] w-[16px] text-ink" strokeWidth={2} />
          <Wifi className="h-[16px] w-[16px] text-ink" strokeWidth={2} />
          <BatteryFull className="h-[18px] w-[18px] text-ink" strokeWidth={1.6} />
        </div>
      </div>

      {/* header bar */}
      <button className="absolute left-[18px] top-[60px] flex h-[40px] w-[40px] items-center justify-center rounded-full bg-white shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
        <ChevronLeft className="h-[20px] w-[20px] text-ink" strokeWidth={1.8} />
      </button>
      <h1 className="absolute inset-x-0 top-[70px] text-center text-[18px] font-medium leading-none text-ink">
        Creator profile
      </h1>
      <button className="absolute right-[18px] top-[60px] flex h-[40px] w-[40px] items-center justify-center rounded-full bg-white shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
        <MoreHorizontal className="h-[20px] w-[20px] text-ink" strokeWidth={1.8} />
      </button>

      {/* hero avatar + fire badge */}
      <div className="absolute left-1/2 top-[110px] -translate-x-1/2">
        <div className="h-[100px] w-[100px] rounded-full bg-gradient-to-br from-[#F1FFC3] to-[#C8B3ED] ring-[4px] ring-white shadow-[0_6px_20px_rgba(90,60,160,0.20)]" />
        <span className="absolute bottom-[2px] right-[2px] flex h-[28px] w-[28px] items-center justify-center rounded-full bg-white shadow-[0_2px_6px_rgba(0,0,0,0.15)]">
          <Flame className="h-[16px] w-[16px] text-[#FB8C00]" strokeWidth={1.7} fill="#FFE0B2" />
        </span>
      </div>

      {/* name + verified */}
      <div className="absolute inset-x-0 top-[222px] flex items-center justify-center gap-[6px]">
        <span className="text-[22px] font-medium leading-none text-ink">Leena Sharma</span>
        <BadgeCheck className="h-[19px] w-[19px] text-[#7C5CE0]" strokeWidth={1.8} />
      </div>
      <p className="absolute inset-x-0 top-[252px] text-center text-[13px] font-light leading-none text-ink/55">
        @leenabliss · Fashion &amp; Lifestyle
      </p>

      {/* top-creator pill */}
      <div className="absolute inset-x-0 top-[278px] flex justify-center">
        <span className="flex h-[24px] items-center gap-[5px] rounded-full bg-[#DCFF68] px-[11px] text-[11.5px] font-normal leading-none text-ink">
          <Flame className="h-[12px] w-[12px] text-[#FB8C00]" strokeWidth={2} fill="#FFE0B2" />
          Top creator
        </span>
      </div>

      {/* stat card */}
      <div className="absolute left-[20px] top-[318px] flex h-[86px] w-[350px] items-center rounded-[20px] bg-white shadow-[0_4px_16px_rgba(0,0,0,0.05)]">
        {STATS.map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={s.l} className="relative flex flex-1 flex-col items-center gap-[6px]">
              {i > 0 && (
                <span className="absolute left-0 top-1/2 h-[38px] w-px -translate-y-1/2 bg-line/70" />
              )}
              <div className="flex items-center gap-[5px]">
                <Icon className="h-[14px] w-[14px] text-ink/45" strokeWidth={1.8} />
                <span className="text-[20px] font-medium leading-none text-ink">{s.n}</span>
              </div>
              <span className="text-[11.5px] font-light leading-none text-ink/50">{s.l}</span>
            </div>
          );
        })}
      </div>

      {/* action buttons */}
      <div className="absolute left-[20px] top-[424px] flex w-[350px] items-center gap-[10px]">
        <button className="flex h-[48px] flex-1 items-center justify-center gap-[8px] rounded-[14px] bg-ink text-white shadow-[0_4px_12px_rgba(0,0,0,0.18)]">
          <MessageCircle className="h-[18px] w-[18px]" strokeWidth={1.8} />
          <span className="text-[14px] font-medium leading-none">Message</span>
        </button>
        <button className="flex h-[48px] w-[48px] shrink-0 items-center justify-center rounded-[14px] bg-white shadow-[0_2px_10px_rgba(0,0,0,0.05)]">
          <Phone className="h-[19px] w-[19px] text-ink" strokeWidth={1.7} />
        </button>
        <button className="flex h-[48px] w-[48px] shrink-0 items-center justify-center rounded-[14px] bg-white shadow-[0_2px_10px_rgba(0,0,0,0.05)]">
          <img src={whatsapp} alt="WhatsApp" className="h-[24px] w-[24px]" />
        </button>
      </div>

      {/* platforms */}
      <span className="absolute left-[28px] top-[494px] text-[13px] font-medium leading-none text-ink/45">
        Platforms
      </span>
      <div className="absolute left-[20px] top-[516px] w-[350px] divide-y divide-line/60 rounded-[20px] bg-white shadow-[0_4px_16px_rgba(0,0,0,0.05)]">
        {PLATFORMS.map((p) => (
          <PlatformRow key={p.name} p={p} />
        ))}
      </div>

      {/* recent campaigns */}
      <span className="absolute left-[28px] top-[664px] text-[13px] font-medium leading-none text-ink/45">
        Recent campaigns
      </span>
      <div className="absolute left-[20px] top-[686px] flex w-[350px] flex-col gap-[12px]">
        {CAMPAIGNS.map((c) => (
          <CampaignRow key={c.title} c={c} />
        ))}
      </div>
    </div>
  );
}
