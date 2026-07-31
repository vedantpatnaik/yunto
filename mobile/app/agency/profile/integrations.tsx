import { useMemo } from "react";
import type { ReactNode } from "react";
import { Pressable, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import Svg, {
  Circle,
  Defs,
  Ellipse,
  Path,
  RadialGradient,
  Rect,
  Stop,
} from "react-native-svg";
import { Abs, Screen, Txt } from "../../../src/ui/Frame";
import { useContacts, useLeads } from "../../../src/api/hooks";
import type { Contact, Lead } from "../../../src/api/hooks";

/**
 * Integrations — Figma 7756:8482 (375x876), traced 1:1.
 *
 * Lead-source connection settings, reached from Profile > Account. The warm
 * #f8f5ef page carries the 876-gen backdrop — a full-bleed rect washed with
 * three radial gradients, a fourth wash in the bottom-right corner box, and a
 * blurred lilac blob off the bottom-left edge — under a 36pt back disc and the
 * "Integrations" heading. One 335x457 frosted panel (16,104) holds three
 * 327x136 provider cards at a 152pt step.
 *
 * Every card is the same component driven by a single `connected` boolean: it
 * picks the chip copy ("Connected" / "Not Connected") and the action pill
 * ("Configure" 81pt wide / "Connect" 73pt), both of which the spec supplies.
 * This frame draws all three as Not Connected while Google Ads keeps the wider
 * "Configure" pill — a leftover from the legacy 946 frame, where Google Ads was
 * the connected one — so the boolean resolves that inconsistency and gives both
 * states from one definition.
 *
 * Data: Prisma has no Integration model and the server exposes no /integrations
 * routes, so a provider's status is derived from the records it would have
 * produced — a provider reads Connected when any live Lead or Contact carries a
 * matching `source`. Nothing is invented: with no such rows every card reads
 * Not Connected, which is exactly what the frame draws. The action pill is
 * inert for the same reason; there is no OAuth handoff to hand it to, and
 * posting to an endpoint that does not exist would fail silently.
 */

/* ------------------------------- geometry -------------------------------- */
const FRAME_W = 375;
const FRAME_H = 876;

/** HorizontalBorder — 7756:8793. */
const PANEL_X = 16;
const PANEL_Y = 104;
const PANEL_W = 335;
const PANEL_H = 457;

/** Cards sit inside the panel's 4pt side padding, below its 1pt top stroke. */
const CARD_X = 4;
const CARD_Y = 17;
const CARD_W = 327;
const CARD_H = 136;
const CARD_STEP = 152; // 121 -> 273 -> 425

/* Card interior, as offsets from the card origin (spec absolute minus 20/121).
   The three cards agree on all of these; only the logo boxes differ. */
const BODY_X = 66; // 86 - 20
const TITLE_Y = 17.5; // 138.5 - 121
const BLURB_Y = 44; // 165 - 121
const BTN_Y = 88; // 209 - 121
const BTN_H = 28;
const BTN_PAD = 12;
const CHIP_X = 152; // 172 - 20
const CHIP_Y = 90; // centres the 24pt line on the pill's own centre

/* --------------------------- spec colour tokens --------------------------- */
const BG = "#f8f5ef"; // frame fill
const BACK_FILL = "#1f1a17"; // Button — 7756:8487
const BACK_INK = "#faf7f2"; // Vector — 7756:8490
const TITLE_INK = "#141311"; // Heading 1 — 7756:8492
const PANEL_FILL = "rgba(255,255,255,0.52)";
const PANEL_LINE = "rgba(0,0,0,0.07)";
const CARD_FILL = "rgba(255,255,255,0.7)";
const CARD_LINE = "#ffffff";
const NAME_INK = "#111111";
const BLURB_INK = "#999999";
const PILL_FILL = "#111111";
const PILL_INK = "#f4f6f8";
const CHIP_INK = "rgba(0,0,0,0.7)";

/* -------------------------------- backdrop -------------------------------- */
/**
 * Gradient / Gradient / Overlay+Blur — 7756:8483, :8484, :8485.
 *
 * Figma expresses each wash as a radial paint over a rectangle, with the stop
 * positions running along the handle radius; they are re-stated here in user
 * space so the ellipse centres land on the same points. The blob carries a 55pt
 * layer blur, which React Native has no equivalent for, so it is drawn as a
 * radial falloff at the spec's centre with the blur folded into the radii.
 */
function Backdrop() {
  return (
    <Svg width={FRAME_W} height={FRAME_H} style={styles.backdrop}>
      <Defs>
        {/* 7756:8483 — #ffd7eb 38%, centre (1.08, 0.30) of the full frame */}
        <RadialGradient id="rose" cx={405} cy={262.8} rx={262.5} ry={438} gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#ffd7eb" stopOpacity={0.38} />
          <Stop offset="0.55" stopColor="#ffd7eb" stopOpacity={0} />
        </RadialGradient>
        {/* 7756:8483 — #ebd7ff 40%, centre (-0.05, 0.40) */}
        <RadialGradient id="lilac" cx={-18.75} cy={350.4} rx={300} ry={438} gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#ebd7ff" stopOpacity={0.4} />
          <Stop offset="0.55" stopColor="#ebd7ff" stopOpacity={0} />
        </RadialGradient>
        {/* 7756:8483 — #c3cdff 65%, centre (0.50, -0.06) */}
        <RadialGradient id="peri" cx={187.5} cy={-52.56} rx={450} ry={438} gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#c3cdff" stopOpacity={0.65} />
          <Stop offset="0.5" stopColor="#c3cdff" stopOpacity={0} />
        </RadialGradient>
        {/* 7756:8484 — #bee1ff 50%, centre at the 262.5x350.4 box's bottom-right */}
        <RadialGradient id="sky" cx={375} cy={876} rx={236.25} ry={262.8} gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#bee1ff" stopOpacity={0.5} />
          <Stop offset="0.65" stopColor="#bee1ff" stopOpacity={0} />
        </RadialGradient>
        {/* 7756:8485 — #dcd2ff at 30%, 55pt layer blur */}
        <RadialGradient id="blob" cx={46.875} cy={604.425} rx={139.375} ry={177.635} gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#dcd2ff" stopOpacity={0.3} />
          <Stop offset="0.45" stopColor="#dcd2ff" stopOpacity={0.18} />
          <Stop offset="1" stopColor="#dcd2ff" stopOpacity={0} />
        </RadialGradient>
      </Defs>
      <Rect x={0} y={0} width={FRAME_W} height={FRAME_H} fill="url(#rose)" />
      <Rect x={0} y={0} width={FRAME_W} height={FRAME_H} fill="url(#lilac)" />
      <Rect x={0} y={0} width={FRAME_W} height={FRAME_H} fill="url(#peri)" />
      <Rect x={112.5} y={525.6} width={262.5} height={350.4} fill="url(#sky)" />
      <Ellipse cx={46.875} cy={604.425} rx={139.375} ry={177.635} fill="url(#blob)" />
    </Svg>
  );
}

/* ------------------------------ provider marks ---------------------------- */
/**
 * The three logo frames. The export carries each brand vector's bounding box
 * but not its path data, so every mark is redrawn to land on exactly the boxes
 * the spec measures — the Facebook glyph at 75.5..185 / 50..256 of a 256 grid,
 * the Google Ads arms as 11.48pt round-capped bars, the WordPress ring inset
 * 3.72pt inside its disc.
 */

/** logos:facebook — 7756:8795, 34x34 at (16, 18) of the card. */
const FacebookMark = () => (
  <Abs x={16} y={18} w={34} h={34}>
    <Svg width={34} height={34} viewBox="0 0 256 256">
      {/* 7756:8796 */}
      <Circle cx={128} cy={128} r={128} fill="#1877f2" />
      {/* 7756:8797 */}
      <Path
        d="m177.825 165l5.675-37H148v-24.01C148 93.866 152.959 84 168.86 84H185V52.5S170.352 50 156.347 50C127.11 50 108 67.72 108 99.8V128H75.5v37H108v89.445A128.959 128.959 0 0 0 128 256a128.9 128.9 0 0 0 20-1.555V165z"
        fill="#ffffff"
      />
    </Svg>
  </Abs>
);

/** logos:google-ads — 7756:8810, 34.44x30.95 at (15, 26) of the card. */
const GoogleAdsMark = () => (
  <Abs x={15} y={26} w={34.44} h={30.95}>
    <Svg width={34.44} height={30.95} viewBox="0 0 34.44 30.95">
      {/* 7756:8811 */}
      <Path
        d="M6.37 22.72L16.45 8.56"
        stroke="#fbbc04"
        strokeWidth={11.48}
        strokeLinecap="round"
      />
      {/* 7756:8812 */}
      <Path
        d="M17.2 5.74L28.68 25.2"
        stroke="#4285f4"
        strokeWidth={11.48}
        strokeLinecap="round"
      />
      {/* 7756:8813 */}
      <Ellipse cx={5.74} cy={25.325} rx={5.74} ry={5.605} fill="#34a853" />
    </Svg>
  </Abs>
);

/** skill-icons:wordpress — 7756:8825, 34x34 at (15, 22) of the card. */
const WordPressMark = () => (
  <Abs x={15} y={22} w={34} h={34}>
    <Svg width={34} height={34} viewBox="0 0 34 34">
      {/* 7756:8827 */}
      <Circle cx={17} cy={17} r={17} fill="#0073aa" />
      {/* 7756:8830 — the inset ring, 26.56 across */}
      <Circle cx={17} cy={17} r={12.48} stroke="#ffffff" strokeWidth={1.6} fill="none" />
      {/* 7756:8828 / 7756:8829 — the two W strokes */}
      <Path
        d="M7.4 7.8L12.5 26.8L17 14.6L21.5 26.8L26.6 7.8"
        stroke="#ffffff"
        strokeWidth={2.4}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </Svg>
  </Abs>
);

/* ------------------------------- provider card ---------------------------- */
interface ProviderCardProps {
  /** Card top, relative to the panel. */
  y: number;
  name: string;
  blurb: string;
  connected: boolean;
  logo: ReactNode;
}

/**
 * Overlay+Border+Shadow+OverlayBlur — 7756:8794 / :8809 / :8824.
 *
 * 327x136 glass card: logo, name, blurb, then the action pill and the status
 * chip sharing a 28pt row. Both of those read off `connected`, so the connected
 * state ("Connected" + the 81pt "Configure" pill) needs no second definition.
 */
function ProviderCard({ y, name, blurb, connected, logo }: ProviderCardProps) {
  const label = connected ? "Configure" : "Connect";
  const btnW = connected ? 81 : 73;

  return (
    <Abs
      x={CARD_X}
      y={y}
      w={CARD_W}
      h={CARD_H}
      radius={24}
      bg={CARD_FILL}
      border={CARD_LINE}
      borderWidth={1}
      style={styles.cardShadow}
    >
      {logo}

      {/* Frame 2147223271 / Container — the name row */}
      <Txt
        x={BODY_X}
        y={TITLE_Y}
        w={178}
        size={15}
        weight="semibold"
        font="inter"
        color={NAME_INK}
        lineHeight={22.5}
        letterSpacing={-0.38}
        numberOfLines={1}
      >
        {name}
      </Txt>

      {/* Container — the 198x36 two-line blurb */}
      <Txt
        x={BODY_X}
        y={BLURB_Y}
        w={198}
        size={12}
        weight="medium"
        font="inter"
        color={BLURB_INK}
        lineHeight={18}
      >
        {blurb}
      </Txt>

      {/* Button — r9999 ink pill. Inert: the backend has no connect endpoint. */}
      <Abs
        x={BODY_X}
        y={BTN_Y}
        w={btnW}
        h={BTN_H}
        radius={BTN_H / 2}
        bg={PILL_FILL}
        style={styles.pillShadow}
      >
        <Txt
          x={BTN_PAD}
          y={6}
          w={btnW - BTN_PAD * 2}
          size={12}
          weight="medium"
          font="inter"
          color={PILL_INK}
          lineHeight={16}
          align="center"
        >
          {label}
        </Txt>
      </Abs>

      {/* Status chip — Geist 500 10 / 24, rendered in Inter */}
      <Txt
        x={CHIP_X}
        y={CHIP_Y}
        w={79}
        size={10}
        weight="medium"
        font="inter"
        color={CHIP_INK}
        lineHeight={24}
        numberOfLines={1}
      >
        {connected ? "Connected" : "Not Connected"}
      </Txt>
    </Abs>
  );
}

/* -------------------------------- providers ------------------------------- */
/**
 * The three providers the frame draws, each with the `source` spelling its
 * captured records would carry. Lead.source and Contact.source are free text
 * (the seed writes "Instagram DM", "Referral", "Website form", ...), so the
 * match is a loose one on the provider's own names.
 */
/**
 * Both models carry a `source` column (schema.prisma Lead:171, Contact:225) and
 * the generic CRUD route returns whole rows, so the field is on the wire even
 * though the shared `Lead` interface has not listed it yet — read defensively
 * rather than widening a type the rest of the app depends on.
 */
const sourceOf = (r: Lead | Contact): string | undefined =>
  "source" in r && typeof r.source === "string" ? r.source : undefined;

const PROVIDERS = [
  {
    key: "facebook",
    name: "Facebook",
    blurb: "Connect Meta Ads to capture leads into your system",
    match: /facebook|meta/i,
    logo: <FacebookMark />,
  },
  {
    key: "google-ads",
    name: "Google Ads",
    blurb: "Track lead conversions from your campaigns",
    match: /google/i,
    logo: <GoogleAdsMark />,
  },
  {
    key: "wordpress",
    name: "WordPress",
    blurb: "Sync contact forms and lead pages ",
    match: /wordpress/i,
    logo: <WordPressMark />,
  },
] as const;

/* --------------------------------- screen --------------------------------- */
export default function Integrations() {
  const router = useRouter();
  const { data: leads = [] } = useLeads();
  const { data: contacts = [] } = useContacts();

  // Every source string the workspace has captured. Leads cover the ad
  // platforms, contacts cover the form captures WordPress would push.
  const sources = useMemo(
    () =>
      [...leads, ...contacts]
        .map(sourceOf)
        .filter((s): s is string => !!s),
    [leads, contacts],
  );

  return (
    <Screen height={FRAME_H} background={BG} scroll>
      <Backdrop />

      {/* =============================== Header ============================== */}
      {/* Button — 7756:8487, 36pt disc with twin 1.8/2.7pt drop shadows */}
      <Pressable
        onPress={() => router.back()}
        style={({ pressed }) => [styles.back, pressed && styles.pressed]}
      >
        {/* iconify-icon -> SVG / Vector — 7756:8489 / :8490. Feather's arrow
            draws 9.45pt at a 16.2pt size with a 1.35pt stroke, which is the
            spec's vector exactly. */}
        <Feather name="arrow-left" size={16.2} color={BACK_INK} />
      </Pressable>

      {/* Heading 1 — 7756:8492, Geist 500 20 / 24 at -0.6 tracking. Geist is not
          one of the two faces registered in app/_layout.tsx, so it renders in
          Inter, the nearer of the two. */}
      <Txt
        x={72}
        y={28}
        w={222}
        size={20}
        weight="medium"
        font="inter"
        color={TITLE_INK}
        lineHeight={24}
        letterSpacing={-0.6}
      >
        Integrations
      </Txt>

      {/* ================================ Panel ============================== */}
      {/* HorizontalBorder — 7756:8793. The stroke is authored top-only. */}
      <Abs
        x={PANEL_X}
        y={PANEL_Y}
        w={PANEL_W}
        h={PANEL_H}
        radius={28}
        bg={PANEL_FILL}
        style={styles.panelBorder}
      >
        {PROVIDERS.map((p, i) => (
          <ProviderCard
            key={p.key}
            y={CARD_Y + i * CARD_STEP}
            name={p.name}
            blurb={p.blurb}
            connected={sources.some((s) => p.match.test(s))}
            logo={p.logo}
          />
        ))}
      </Abs>
    </Screen>
  );
}

const styles = StyleSheet.create({
  backdrop: { position: "absolute", left: 0, top: 0 },

  back: {
    position: "absolute",
    left: 16,
    top: 22,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: BACK_FILL,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000000",
    shadowOpacity: 0.1,
    shadowRadius: 2.7,
    shadowOffset: { width: 0, height: 0.9 },
    elevation: 2,
  },
  pressed: { opacity: 0.85 },

  panelBorder: {
    borderTopWidth: 1,
    borderTopColor: PANEL_LINE,
  },

  /* 0/4/20 at #000000 4% — the card's drop shadow. */
  cardShadow: {
    shadowColor: "#000000",
    shadowOpacity: 0.04,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },

  /* Button:shadow — 7756:8805 / :8820 / :8837, folded into the pill itself. */
  pillShadow: {
    shadowColor: "#000000",
    shadowOpacity: 0.1,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
});
