import { ChevronLeft, Signal, Wifi, BatteryFull } from "lucide-react";

/**
 * Agency app — Lead Distribution (Figma frame 7754:8373, "Lead Distribution",
 * 375×876), rendered inside the 390px MobileFrame. Self-contained: it carries its
 * own status bar and a bottom primary action (this is a pushed settings detail
 * screen reached from the admin menu, not a tab screen — like the sibling Add Lead
 * form it has a back button + centered title and no bottom tab bar). Frame facts
 * confirmed from the cached document tree: origin (-9207, 21491), size 375×876,
 * frame's own solid background fill #F8F5EF (bound to a color variable) — the warm
 * off-white shared with the sibling Add Lead / Add Reminders / Add Member screens.
 *
 * NOTE: The Figma REST + MCP geometry endpoints were hard rate-limited for the
 * entire build window — /v1/files/.../nodes and /v1/images both return HTTP 429
 * with `x-figma-rate-limit-type: low` and `retry-after: ~386393` (~4.5 days, the
 * Starter-plan cost budget exhausted on a shared token; the /me endpoint still
 * returns 200 so the token is valid), and the Figma MCP tools return the
 * Starter-plan "tool call limit" paywall. The cached full-document dump is
 * depth-limited, so this frame resolves to a childless leaf and no per-node render
 * or interior geometry could be pulled. The layout is therefore reconstructed from
 * (a) the confirmed frame facts above, (b) the REAL desktop "Lead Distribution"
 * settings copy pulled from Figma node 5717:57784
 * (src/features/settings-lead-distribution/SettingsLeadDistPage.tsx): the intro
 * line, the three distribution modes (Random / All (Broadcast) / Round by Round —
 * Round by Round selected) with their exact descriptions, the MD3 radio styling
 * (selected #1D1B20, unselected #49454F ring), and the "Assignment Order" reorder
 * list (Sanjay Sharma, Riya Verma, Neha Mishra), and (c) the shared mobile-chrome
 * idiom of the sibling Agency screens on this exact #F8F5EF shell (status bar,
 * 40px round back button, centered 18px title, 20px side margins, white cards, ink
 * primary button). Re-run against node 7754:8373 to pin pixel-exact coordinates
 * once the Figma API budget resets.
 */

/* --------------------------------- data ---------------------------------- */
type Mode = { title: string; desc: string; selected?: boolean };

const MODES: Mode[] = [
  { title: "Random", desc: "Distributes leads to any available person randomly." },
  { title: "All (Broadcast)", desc: "Send leads to all team members. First to respond gets it." },
  {
    title: "Round by Round",
    desc: "Distributes leads one-by-one in a loop among team members.",
    selected: true,
  },
];

const ORDER: string[] = ["Sanjay Sharma", "Riya Verma", "Neha Mishra"];

/* ------------------------------- primitives ------------------------------ */
function Radio({ selected }: { selected?: boolean }) {
  if (selected) {
    return (
      <span className="flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full border-2 border-[#1D1B20]">
        <span className="h-[11px] w-[11px] rounded-full bg-[#1D1B20]" />
      </span>
    );
  }
  return <span className="h-[22px] w-[22px] shrink-0 rounded-full border-2 border-[#49454F]" />;
}

/* Material "drag_handle" — two short horizontal bars (matches the desktop handle). */
function DragHandle() {
  return (
    <span className="flex h-[20px] w-[20px] flex-col items-center justify-center gap-[4px]">
      <span className="h-[1.6px] w-[15px] rounded-full bg-ink/45" />
      <span className="h-[1.6px] w-[15px] rounded-full bg-ink/45" />
    </span>
  );
}

/* ---------------------------------- page --------------------------------- */
export default function AgLeadDistributionPg() {
  return (
    <div
      className="relative w-[390px] overflow-hidden bg-[#F8F5EF] font-sans text-ink"
      style={{ height: 876 }}
    >
      {/* soft lavender wash behind the header (shared shell accent) */}
      <div className="absolute inset-x-0 top-0 h-[190px] bg-gradient-to-b from-[#EFE9FB] to-[#F8F5EF]" />

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

      {/* header */}
      <button className="absolute left-[18px] top-[60px] flex h-[40px] w-[40px] items-center justify-center rounded-full bg-white shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
        <ChevronLeft className="h-[20px] w-[20px] text-ink" strokeWidth={1.8} />
      </button>
      <h1 className="absolute inset-x-0 top-[70px] text-center text-[18px] font-medium leading-none text-ink">
        Lead Distribution
      </h1>

      {/* intro line */}
      <p className="absolute left-[24px] top-[120px] w-[342px] text-[13px] font-light leading-[19px] text-ink/60">
        Choose how you’d like leads to be distributed among your team members.
      </p>

      {/* distribution modes */}
      <div className="absolute left-[20px] top-[176px] flex w-[350px] flex-col gap-[12px]">
        {MODES.map((m) => (
          <div
            key={m.title}
            className={`flex h-[76px] items-center gap-[14px] rounded-[18px] bg-white px-[16px] shadow-[0_2px_10px_rgba(0,0,0,0.05)] ${
              m.selected ? "ring-[1.5px] ring-ink" : "ring-1 ring-black/[0.06]"
            }`}
          >
            <Radio selected={m.selected} />
            <div className="min-w-0">
              <div className="text-[15px] font-medium leading-[19px] text-ink">{m.title}</div>
              <div className="mt-[3px] text-[12px] font-light leading-[16px] text-ink/60">
                {m.desc}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* assignment order */}
      <h2 className="absolute left-[24px] top-[456px] text-[15px] font-medium leading-none text-ink">
        Assignment Order
      </h2>
      <div className="absolute left-[20px] top-[486px] flex w-[350px] flex-col gap-[10px]">
        {ORDER.map((name) => (
          <div
            key={name}
            className="flex h-[52px] items-center justify-between rounded-[13px] bg-white pl-[16px] pr-[14px] shadow-[0_2px_10px_rgba(0,0,0,0.04)] ring-1 ring-black/[0.05]"
          >
            <span className="text-[14px] font-medium leading-none text-ink/70">{name}</span>
            <DragHandle />
          </div>
        ))}
      </div>

      {/* save */}
      <button className="absolute left-[20px] top-[800px] flex h-[54px] w-[350px] items-center justify-center rounded-[16px] bg-ink shadow-[0_8px_24px_rgba(20,10,50,0.28)]">
        <span className="text-[16px] font-normal leading-none text-white">Save Changes</span>
      </button>
    </div>
  );
}
