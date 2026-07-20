import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { LucideIcon } from "lucide-react";
import { Loader, AlignJustify, Waypoints, Globe, Plus } from "lucide-react";

/**
 * Super Admin — Settings / Integration.
 * Exact reconstruction of Figma frame 5717:58057 ("Super Admin-setting(Integration)"),
 * 1440×1024. Same settings shell as its siblings Lead Distribution (5717:57784) and
 * Collabs (5717:58337): SETTINGS title, floating tab row, and the stepped content card
 * whose top-right corner rises to meet the tab strip. Built CLEAN — the captured frame
 * had the TopBar profile dropdown + dim scrim open; that popup/scrim is intentionally
 * omitted so this is the underlying page at full opacity.
 */

/* ------------------------------ tab row -------------------------------- */
type Tab = { icon: LucideIcon; label: string; left: number; width: number; to: string; active?: boolean };

const TABS: Tab[] = [
  { icon: Loader, label: "Team Management", left: 241, width: 180, to: "/settings" },
  { icon: AlignJustify, label: "Lead Distribution", left: 429, width: 165, to: "/settings/lead-distribution" },
  { icon: Waypoints, label: "Integration", left: 602, width: 139, to: "/settings/integration", active: true },
  { icon: Waypoints, label: "Collabs", left: 749, width: 114, to: "/settings/collab" },
];

/* stepped card outline: rounded rect with a notch cut for the tab row (top-left).
   Notch right edge = abs x=878 → 637 relative to the card's left edge (241). */
const CARD_PATH =
  "M 0 84 A 24 24 0 0 1 24 60 L 617 60 A 20 20 0 0 0 637 40 L 637 20 A 20 20 0 0 1 657 0 L 731 0 A 24 24 0 0 1 755 24 L 755 669 A 24 24 0 0 1 731 693 L 24 693 A 24 24 0 0 1 0 669 Z";

/* --------------------------- integrations ------------------------------ */
type Integration = {
  top: number;
  name: string;
  desc: string;
  connected: boolean;
  action: string;
  icon: "domain" | "wordpress" | "googleads" | "facebook";
};

const INTEGRATIONS: Integration[] = [
  {
    top: 340,
    icon: "domain",
    name: "Connect your domain",
    desc: "Connect your domain for branded lead capturing pages for your creators.",
    connected: false,
    action: "Connect",
  },
  {
    top: 493,
    icon: "wordpress",
    name: "Wordpress",
    desc: "Sync contact forms and lead pages",
    connected: false,
    action: "Connect",
  },
  {
    top: 607,
    icon: "googleads",
    name: "Google Ads",
    desc: "Track lead conversions from your campaigns",
    connected: true,
    action: "Configure",
  },
  {
    top: 721,
    icon: "facebook",
    name: "Facebook",
    desc: "Connect Meta Ads to capture leads into your system",
    connected: false,
    action: "Connect",
  },
];

/* --------------------------- brand glyphs ------------------------------ */
function BrandIcon({ kind }: { kind: Integration["icon"] }) {
  if (kind === "domain") {
    return <Globe className="h-[24px] w-[24px] text-black" strokeWidth={1} />;
  }
  if (kind === "wordpress") {
    return (
      <svg viewBox="0 0 24 24" className="h-[24px] w-[24px]">
        <circle cx="12" cy="12" r="12" fill="#0073AA" />
        <text
          x="12"
          y="16.6"
          textAnchor="middle"
          fontSize="13"
          fontWeight="700"
          fill="#fff"
          fontFamily="Georgia, 'Times New Roman', serif"
        >
          W
        </text>
      </svg>
    );
  }
  if (kind === "googleads") {
    return (
      <svg viewBox="0 0 24 24" className="h-[24px] w-[21.6px]">
        <rect x="8.5" y="1" width="7" height="17" rx="3.5" fill="#FBBC04" transform="rotate(-28 12 9.5)" />
        <rect x="8.5" y="6" width="7" height="17" rx="3.5" fill="#4285F4" transform="rotate(28 12 14.5)" />
        <circle cx="6.4" cy="18" r="3.5" fill="#34A853" />
      </svg>
    );
  }
  // facebook
  return (
    <svg viewBox="0 0 24 24" className="h-[24px] w-[24px]">
      <circle cx="12" cy="12" r="12" fill="#1877F2" />
      <path
        fill="#fff"
        d="M15.5 12.5l.42-2.72h-2.6V8.01c0-.75.36-1.47 1.53-1.47h1.19V4.23s-1.08-.18-2.11-.18c-2.15 0-3.56 1.31-3.56 3.67v2.06H8.02v2.72h2.35V19h2.9v-6.5h2.23z"
      />
    </svg>
  );
}

/* ------------------------------ row ------------------------------------ */
function IntegrationRow({ item, onToggle }: { item: Integration; onToggle: () => void }) {
  return (
    <div
      className="absolute left-[258px] h-[104px] w-[640px] rounded-[24px] border border-[#D4D4D4]"
      style={{ top: item.top }}
    >
      {/* bare brand glyph */}
      <span className="absolute left-[21px] top-[16px] flex h-[24px] w-[24px] items-center justify-center">
        <BrandIcon kind={item.icon} />
      </span>

      {/* title */}
      <span className="absolute left-[55px] top-[17px] whitespace-nowrap text-[20px] font-medium leading-[24px] text-black">
        {item.name}
      </span>
      {/* description */}
      <span className="absolute left-[55px] top-[40px] whitespace-nowrap text-[12px] font-normal leading-[24px] text-black/70">
        {item.desc}
      </span>
      {/* connection status */}
      {item.connected ? (
        <span className="absolute left-[55px] top-[65px] text-[12px] font-medium leading-[24px] text-black">
          Connected
        </span>
      ) : (
        <span className="absolute left-[55px] top-[65px] text-[12px] font-normal leading-[24px] text-black/70">
          Not Connected
        </span>
      )}

      {/* action pill */}
      <div
        onClick={onToggle}
        className="absolute left-[529px] top-[31px] flex h-[39px] w-[88px] cursor-pointer items-center justify-center gap-[5px] rounded-full border-2 border-black bg-black/90"
      >
        <span className="whitespace-nowrap text-[14px] font-light leading-none text-white">
          {item.action}
        </span>
        <Plus className="h-[12px] w-[12px] shrink-0 text-white" strokeWidth={1.6} />
      </div>
    </div>
  );
}

/* -------------------------------- page --------------------------------- */
export default function SettingsIntegrationPage() {
  const navigate = useNavigate();
  const [integrations, setIntegrations] = useState(INTEGRATIONS);

  const toggleConnected = (name: string) =>
    setIntegrations((prev) =>
      prev.map((it) => (it.name === name ? { ...it, connected: !it.connected } : it)),
    );

  return (
    <>
      {/* SETTINGS — 261,158 · Outfit 400 40px */}
      <h1 className="absolute left-[261px] top-[158px] text-[40px] font-normal leading-[50.4px] text-ink">
        SETTINGS
      </h1>

      {/* stepped content-card outline */}
      <svg
        className="absolute left-[241px] top-[222px]"
        width={755}
        height={693}
        viewBox="0 0 755 693"
        fill="none"
      >
        <path d={CARD_PATH} stroke="#D4D4D4" strokeWidth={1} />
      </svg>

      {/* tabs */}
      {TABS.map((t) => (
        <div
          key={t.label}
          onClick={() => navigate(t.to)}
          style={{ left: t.left, width: t.width }}
          className={`absolute top-[225px] flex h-[48px] cursor-pointer items-center justify-center gap-[8px] rounded-[24px] ${
            t.active ? "bg-black" : "border-[0.5px] border-[#CCCCCC] bg-white"
          }`}
        >
          <t.icon
            className={`h-[20px] w-[20px] shrink-0 ${t.active ? "text-white" : "text-black"}`}
            strokeWidth={1.6}
          />
          <span
            className={`whitespace-nowrap text-[14px] font-light leading-[24px] ${
              t.active ? "text-white" : "text-black"
            }`}
          >
            {t.label}
          </span>
        </div>
      ))}

      {/* section labels */}
      <span className="absolute left-[258px] top-[306px] text-[14px] font-light leading-[24px] text-black">
        Domain Integration
      </span>
      <span className="absolute left-[258px] top-[459px] text-[14px] font-light leading-[24px] text-black">
        Lead Capturing
      </span>

      {/* integration rows */}
      {integrations.map((item) => (
        <IntegrationRow key={item.name} item={item} onToggle={() => toggleConnected(item.name)} />
      ))}
    </>
  );
}
