import type { ComponentProps } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import Svg, {
  Defs,
  LinearGradient as SvgLinear,
  RadialGradient,
  Rect,
  Stop,
} from "react-native-svg";
import { Abs, Screen, Txt } from "../../../src/ui/Frame";

/**
 * Personal Information — Figma 7358:27695 "personal information".
 *
 * The accordion index: the glass header ("Personal Information") over seven
 * collapsed 335x74 section rows — Basics, Language, Address, Measurements,
 * Commercials, Barter Commercials, Bank Details — each a 48x48 tinted icon
 * tile, a 16pt Inter/600 label and a 36x36 glass chevron disc.
 *
 * This is the default landing state, the only one of the eight accordion
 * frames whose content fits the 875pt frame; every other frame in the set is
 * this same list with one row expanded (see payments/payout-bank-details for
 * the Bank Details expansion, which owns that section's editor).
 *
 * All coordinates below are raw frame coordinates from the spec.
 */

/* ------------------------------- geometry -------------------------------- */
const FRAME_W = 375;
const FRAME_H = 875;

/** Row cards: 335x74 at x=20, first at y=116, 74pt row + 12pt Main gap. */
const ROW_X = 20;
const ROW_W = 335;
const ROW_H = 74;
const ROW_Y0 = 116;
const ROW_STEP = 86;

/* Row-relative offsets (spec absolute minus the row's own x/y). */
const TILE_OFF = 13; // 33-20, 129-116
const TILE_SIZE = 48;
const LABEL_X = 77; // 97-20
const LABEL_Y = 27.5; // 143.5-116
const LABEL_W = 189;
const DISC_X = 282; // 302-20
const DISC_Y = 19; // 135-116
const DISC_SIZE = 36;

/* --------------------------- spec colour tokens --------------------------- */
const LABEL_INK = "#111827";
const TITLE_INK = "#1D1D1F";
const BACK_INK = "#1C1C1E";
const CHEV_INK = "#6B7280";
const GLASS_55 = "rgba(255,255,255,0.55)";
const GLASS_60 = "rgba(255,255,255,0.6)";
const GLASS_65 = "rgba(255,255,255,0.65)";
const HAIRLINE_90 = "rgba(255,255,255,0.9)";

/* -------------------------------- backdrop -------------------------------- */
/** Frame fill: the beige linear base plus four radial tints. */
function Backdrop() {
  return (
    <Svg width={FRAME_W} height={FRAME_H} style={styles.backdrop}>
      <Defs>
        <SvgLinear
          id="base"
          x1="187.5"
          y1="0"
          x2="187.5"
          y2={FRAME_H}
          gradientUnits="userSpaceOnUse"
        >
          <Stop offset="0" stopColor="#F7F0E4" />
          <Stop offset="1" stopColor="#F4EBDD" />
        </SvgLinear>
        <RadialGradient
          id="pink"
          cx={0.76 * FRAME_W}
          cy={0.62 * FRAME_H}
          rx={2.74 * FRAME_W}
          ry={0.65 * FRAME_H}
          gradientUnits="userSpaceOnUse"
        >
          <Stop offset="0" stopColor="#F7B7DA" stopOpacity="0.34" />
          <Stop offset="0.26" stopColor="#F7B7DA" stopOpacity="0" />
        </RadialGradient>
        <RadialGradient
          id="blue"
          cx={0.24 * FRAME_W}
          cy={0.42 * FRAME_H}
          rx={2.58 * FRAME_W}
          ry={0.61 * FRAME_H}
          gradientUnits="userSpaceOnUse"
        >
          <Stop offset="0" stopColor="#BACDF4" stopOpacity="0.36" />
          <Stop offset="0.24" stopColor="#BACDF4" stopOpacity="0" />
        </RadialGradient>
        <RadialGradient
          id="gold"
          cx={0.78 * FRAME_W}
          cy={0.18 * FRAME_H}
          rx={3.57 * FRAME_W}
          ry={0.84 * FRAME_H}
          gradientUnits="userSpaceOnUse"
        >
          <Stop offset="0" stopColor="#F6D64A" stopOpacity="0.22" />
          <Stop offset="0.2" stopColor="#F6D64A" stopOpacity="0" />
        </RadialGradient>
        <RadialGradient
          id="haze"
          cx={0.2 * FRAME_W}
          cy={0.1 * FRAME_H}
          rx={3.91 * FRAME_W}
          ry={0.92 * FRAME_H}
          gradientUnits="userSpaceOnUse"
        >
          <Stop offset="0" stopColor="#FFFFFF" stopOpacity="0.72" />
          <Stop offset="0.24" stopColor="#FFFFFF" stopOpacity="0" />
        </RadialGradient>
      </Defs>
      <Rect width={FRAME_W} height={FRAME_H} fill="url(#base)" />
      <Rect width={FRAME_W} height={FRAME_H} fill="url(#pink)" />
      <Rect width={FRAME_W} height={FRAME_H} fill="url(#blue)" />
      <Rect width={FRAME_W} height={FRAME_H} fill="url(#gold)" />
      <Rect width={FRAME_W} height={FRAME_H} fill="url(#haze)" />
    </Svg>
  );
}

/* ------------------------------- sections -------------------------------- */
/**
 * Ionicons covers every tile glyph in the set except the ruler and the
 * classical bank, which have no Ionicons equivalent and come from Material
 * Community instead.
 */
type Glyph =
  | { ion: ComponentProps<typeof Ionicons>["name"] }
  | { mdi: ComponentProps<typeof MaterialCommunityIcons>["name"] };

interface SectionSpec {
  key: string;
  /** "Background+Shadow" tile fill. */
  tile: string;
  /** Tile glyph stroke colour. */
  ink: string;
  icon: Glyph;
  label: string;
  /**
   * Expanded editor for this section, where one already exists. Bank Details
   * is served by the payments flow; the remaining editors are separate frames
   * in the same set and land on their own routes.
   */
  href?: string;
}

/** The seven sections, top to bottom — row i sits at ROW_Y0 + i*ROW_STEP. */
const SECTIONS: SectionSpec[] = [
  { key: "basics", tile: "#F3E8FF", ink: "#9333EA", icon: { ion: "person-outline" }, label: "Basics" },
  { key: "language", tile: "#DBEAFE", ink: "#2563EB", icon: { ion: "language-outline" }, label: "Language" },
  { key: "address", tile: "#CCFBF1", ink: "#0D9488", icon: { ion: "location-outline" }, label: "Address" },
  { key: "measurements", tile: "#FFEDD5", ink: "#EA580C", icon: { mdi: "ruler" }, label: "Measurements" },
  { key: "commercials", tile: "#D1FAE5", ink: "#059669", icon: { ion: "cash-outline" }, label: "Commercials" },
  { key: "barter", tile: "#FCE7F3", ink: "#DB2777", icon: { ion: "gift-outline" }, label: "Barter Commercials" },
  {
    key: "bank",
    tile: "#E0E7FF",
    ink: "#4F46E5",
    icon: { mdi: "bank-outline" },
    label: "Bank Details",
    href: "/payments/payout-bank-details",
  },
];

/** A collapsed 335x74 glass row: icon tile, label, chevron disc. */
function SectionRow({
  section,
  y,
  onPress,
}: {
  section: SectionSpec;
  y: number;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        position: "absolute",
        left: ROW_X,
        top: y,
        width: ROW_W,
        height: ROW_H,
        opacity: pressed ? 0.88 : 1,
      })}
    >
      {/* Card — #FFFFFF @55%, 1pt #FFFFFF @90% hairline, r28. */}
      <View style={styles.rowFill} />

      {/* Background+Shadow — 48x48 r20 icon tile. */}
      <Abs
        x={TILE_OFF}
        y={TILE_OFF}
        w={TILE_SIZE}
        h={TILE_SIZE}
        radius={20}
        bg={section.tile}
        center
        style={styles.tileShadow}
      >
        {"ion" in section.icon ? (
          <Ionicons name={section.icon.ion} size={24} color={section.ink} />
        ) : (
          <MaterialCommunityIcons name={section.icon.mdi} size={24} color={section.ink} />
        )}
      </Abs>

      {/* Label — Inter 600 16 / 19.36. */}
      <Txt
        x={LABEL_X}
        y={LABEL_Y}
        w={LABEL_W}
        size={16}
        weight="semibold"
        font="inter"
        color={LABEL_INK}
        lineHeight={19.36}
        numberOfLines={1}
      >
        {section.label}
      </Txt>

      {/* Overlay+Shadow — 36x36 r18 glass disc holding the 10x5 chevron. */}
      <Abs
        x={DISC_X}
        y={DISC_Y}
        w={DISC_SIZE}
        h={DISC_SIZE}
        radius={18}
        bg={GLASS_60}
        center
        style={styles.discShadow}
      >
        <Ionicons name="chevron-down" size={20} color={CHEV_INK} />
      </Abs>
    </Pressable>
  );
}

/* --------------------------------- screen --------------------------------- */
export default function PersonalInformation() {
  const router = useRouter();

  return (
    <Screen height={FRAME_H} background="#F7F0E4" scroll>
      <Backdrop />

      {/* =============================== Header ============================== */}
      <Pressable
        onPress={() => router.back()}
        style={({ pressed }) => [styles.back, pressed && styles.pressed]}
      >
        <Ionicons name="arrow-back" size={20} color={BACK_INK} />
      </Pressable>
      <Txt
        x={79.5}
        y={30}
        w={236}
        size={16}
        weight="bold"
        font="inter"
        color={TITLE_INK}
        lineHeight={19.36}
        align="center"
      >
        Personal Information
      </Txt>

      {/* ================== Main — the seven collapsed rows =================== */}
      {SECTIONS.map((section, i) => (
        <SectionRow
          key={section.key}
          section={section}
          y={ROW_Y0 + i * ROW_STEP}
          onPress={() => {
            if (section.href) router.push(section.href);
          }}
        />
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  backdrop: { position: "absolute", left: 0, top: 0 },
  pressed: { opacity: 0.88 },

  /* Overlay+Border+Shadow+OverlayBlur — 44x44 r22 glass back button. */
  back: {
    position: "absolute",
    left: 15,
    top: 18,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: GLASS_65,
    borderWidth: 1,
    borderColor: HAIRLINE_90,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000000",
    shadowOpacity: 0.03,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 1,
  },

  rowFill: {
    position: "absolute",
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
    borderRadius: 28,
    backgroundColor: GLASS_55,
    borderWidth: 1,
    borderColor: HAIRLINE_90,
    shadowColor: "#000000",
    shadowOpacity: 0.04,
    shadowRadius: 32,
    shadowOffset: { width: 0, height: 12 },
    elevation: 2,
  },
  tileShadow: {
    shadowColor: "#000000",
    shadowOpacity: 0.03,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 1,
  },
  discShadow: {
    shadowColor: "#000000",
    shadowOpacity: 0.03,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
});
