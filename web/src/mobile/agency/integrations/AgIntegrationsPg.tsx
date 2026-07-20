import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import {
  ChevronLeft,
  Plus,
  Settings2,
  Globe,
  Signal,
  Wifi,
  BatteryFull,
} from "lucide-react";
import wordpress from "@/assets/icons/integrations-wordpress.svg";
import googleAds from "@/assets/icons/integrations-google-ads.svg";
import facebook from "@/assets/icons/integrations-facebook.svg";

/**
 * Agency app — Integrations (Figma frame 7756:8482, "Integrations", 375×876),
 * rendered inside the 390px MobileFrame. Self-contained: it carries its own
 * status bar. This is a Settings sub-screen (reached from Settings, not a tab),
 * so it has no bottom nav.
 *
 * REAL geometry pinned from the cached full-document tree for THIS node: the
 * frame is 375×876 at origin (-8773, 21491) with a single flat solid fill of
 * #F8F5EF (warm off-white, bound to a Figma color variable) — used verbatim as
 * the page background below. That fill places this frame in the same visual
 * family as All-requests / All-creators (also #F8F5EF), so the mobile chrome is
 * reused verbatim.
 *
 * NOTE: For the entire build window the Figma REST geometry endpoints returned
 * HTTP 429 ("Rate limit exceeded", multi-day retry-after on the Starter plan —
 * /me still 200s so the token is valid; only the cost-based /nodes and /images
 * endpoints are throttled) and the Figma MCP bridge returned the Starter-plan
 * "tool call limit" paywall. The cached document dump is depth-2 only, so this
 * frame resolves with its own box + fill but ZERO child geometry.
 *
 * The card CONTENT is therefore taken VERBATIM from the sibling DESKTOP
 * Integrations tab (node 5717:58060, parsed pixel-exact earlier) — same product
 * surface, same copy: a "Domain Integration" section (Connect your domain) and a
 * "Lead Capturing" section (Wordpress · Google Ads · Facebook), each an outlined
 * card with a brand logo, name (Outfit 500), description (Outfit 400, ink/70), a
 * Not-Connected / Connected status, and a dark pill action (Connect / Configure).
 * Layout is adapted to the shared mobile-chrome idiom of the #F8F5EF sibling
 * screens (status bar, 40px round back button, centered 18px title, 20px side
 * margins, 12px card rhythm). Re-run against node 7756:8482 to pin pixel-exact
 * coordinates once the Figma API budget resets.
 */

/* --------------------------------- data ---------------------------------- */
type Integration = {
  logo?: string;
  icon?: LucideIcon;
  tint: string;
  glyph?: string;
  name: string;
  desc: string;
  connected: boolean;
};

const DOMAIN: Integration[] = [
  {
    icon: Globe,
    tint: "#EAF1F7",
    glyph: "#3B6FA8",
    name: "Connect your domain",
    desc: "Connect your domain for branded lead capturing pages for your creators.",
    connected: false,
  },
];

const LEAD_CAPTURING: Integration[] = [
  {
    logo: wordpress,
    tint: "#EAF3F8",
    name: "Wordpress",
    desc: "Sync contact forms and lead pages",
    connected: false,
  },
  {
    logo: googleAds,
    tint: "#F3F4FB",
    name: "Google Ads",
    desc: "Track lead conversions from your campaigns",
    connected: true,
  },
  {
    logo: facebook,
    tint: "#EAF1FD",
    name: "Facebook",
    desc: "Connect Meta Ads to capture leads into your system",
    connected: false,
  },
];

/* ------------------------------- primitives ------------------------------ */
function StatusPill({ connected }: { connected: boolean }) {
  return (
    <span
      className={`flex h-[26px] items-center gap-[6px] rounded-full px-[11px] text-[11.5px] font-normal leading-none ${
        connected ? "bg-[#E4F6E9] text-[#2F9A5D]" : "bg-[#EFEDE7] text-ink/45"
      }`}
    >
      <span
        className={`h-[6px] w-[6px] rounded-full ${
          connected ? "bg-[#2F9A5D]" : "bg-ink/25"
        }`}
      />
      {connected ? "Connected" : "Not Connected"}
    </span>
  );
}

function ActionButton({ connected }: { connected: boolean }) {
  const Icon: LucideIcon = connected ? Settings2 : Plus;
  return (
    <button className="flex h-[34px] items-center gap-[6px] rounded-full bg-ink/90 px-[15px] text-[13px] font-light leading-none text-white">
      <Icon className="h-[14px] w-[14px]" strokeWidth={2} />
      {connected ? "Configure" : "Connect"}
    </button>
  );
}

function IntegrationCard({ item }: { item: Integration }) {
  const Icon = item.icon;
  return (
    <div className="rounded-[18px] bg-white p-[15px] shadow-[0_3px_14px_rgba(0,0,0,0.05)]">
      <div className="flex items-start gap-[13px]">
        <span
          className="flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-[14px]"
          style={{ backgroundColor: item.tint }}
        >
          {item.logo ? (
            <img src={item.logo} alt={item.name} className="h-[24px] w-[24px]" />
          ) : Icon ? (
            <Icon
              className="h-[23px] w-[23px]"
              strokeWidth={1.7}
              style={{ color: item.glyph }}
            />
          ) : null}
        </span>
        <div className="min-w-0 flex-1 pt-[2px]">
          <span className="block text-[15.5px] font-medium leading-none text-ink/90">
            {item.name}
          </span>
          <span className="mt-[6px] block text-[12px] font-light leading-[16px] text-ink/55">
            {item.desc}
          </span>
        </div>
      </div>
      <div className="mt-[14px] flex items-center justify-between">
        <StatusPill connected={item.connected} />
        <ActionButton connected={item.connected} />
      </div>
    </div>
  );
}

function Section({ label, items }: { label: string; items: Integration[] }) {
  return (
    <div>
      <span className="ml-[4px] block text-[13px] font-light leading-none text-ink/55">
        {label}
      </span>
      <div className="mt-[12px] flex flex-col gap-[12px]">
        {items.map((it) => (
          <IntegrationCard key={it.name} item={it} />
        ))}
      </div>
    </div>
  );
}

/* ---------------------------------- page --------------------------------- */
export default function AgIntegrationsPg() {
  return (
    <div
      className="relative w-[390px] overflow-hidden bg-[#F8F5EF] font-sans text-ink"
      style={{ height: 876 }}
    >
      {/* status bar */}
      <StatusBar />

      {/* header */}
      <button className="absolute left-[18px] top-[60px] flex h-[40px] w-[40px] items-center justify-center rounded-full bg-white shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
        <ChevronLeft className="h-[20px] w-[20px] text-ink" strokeWidth={1.8} />
      </button>
      <h1 className="absolute inset-x-0 top-[66px] text-center text-[18px] font-medium leading-none text-ink">
        Integrations
      </h1>
      <span className="absolute inset-x-0 top-[90px] text-center text-[11px] font-light leading-none text-ink/45">
        Manage apps connected to your workspace
      </span>

      {/* sections */}
      <div className="absolute left-[20px] top-[130px] flex w-[350px] flex-col gap-[24px]">
        <Section label="Domain Integration" items={DOMAIN} />
        <Section label="Lead Capturing" items={LEAD_CAPTURING} />
      </div>
    </div>
  );
}

/* ------------------------------- status bar ------------------------------ */
function StatusBar(): ReactNode {
  return (
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
  );
}
