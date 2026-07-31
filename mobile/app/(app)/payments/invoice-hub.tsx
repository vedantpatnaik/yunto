import type { ReactNode } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import Svg, {
  Defs,
  LinearGradient as SvgLinear,
  RadialGradient,
  Rect,
  Stop,
} from "react-native-svg";
import { Abs, Screen, Txt } from "../../../src/ui/Frame";

/**
 * Invoice — Figma 7358:29665 (375x875).
 *
 * Landing menu for the invoicing module: a glass header with a back arrow and
 * a centred "Invoice" title, then the "Main" frame (y=106, h=296, 12pt vertical
 * gap) holding three identical 335x74 glass rows — Create Invoice, Invoice
 * History, Your Details. Pushed stack screen, so no bottom tab bar.
 *
 * Coordinates below are raw frame coordinates from the spec; <Screen> scales the
 * 375pt canvas to the device.
 */

/* ------------------------------- geometry -------------------------------- */
const FRAME_W = 375;
const FRAME_H = 875;

const ROW_X = 20;
const ROW_W = 335;
const ROW_H = 74;
/** Rows sit at y = 116, 202, 288 — the Main frame's 74pt row + 12pt gap. */
const ROW_STEP = 86;

/* Row-relative offsets (spec absolute minus the row's own x/y). */
const TILE_OFF = 13; // 33-20, 129-116
const TILE_SIZE = 48;
const LABEL_X = 77; // 97-20
const LABEL_Y = 27.5; // 143.5-116
const LABEL_W = 193;
const CHEV_X = 286; // 306-20
const CHEV_Y = 21; // 137-116
const CHEV_SIZE = 36;

/* --------------------------- spec colour tokens --------------------------- */
const LABEL_INK = "#111827";
const TITLE_INK = "#1D1D1F";
const BACK_INK = "#1C1C1E";
const CHEV_INK = "#6B7280";
const GLASS_55 = "rgba(255,255,255,0.55)";
const GLASS_60 = "rgba(255,255,255,0.6)";
const GLASS_65 = "rgba(255,255,255,0.65)";
const HAIRLINE = "rgba(255,255,255,0.9)";

/* -------------------------------- backdrop -------------------------------- */
/** Frame fill: the beige linear base plus four radial tints. */
function Backdrop() {
  return (
    <Svg width={FRAME_W} height={FRAME_H} style={styles.backdrop}>
      <Defs>
        <SvgLinear id="base" x1="187.5" y1="0" x2="187.5" y2={FRAME_H} gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#F7F0E4" />
          <Stop offset="1" stopColor="#F4EBDD" />
        </SvgLinear>
        <RadialGradient id="pink" cx="285" cy="542.5" rx="1027.5" ry="568.75" gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#F7B7DA" stopOpacity="0.34" />
          <Stop offset="0.26" stopColor="#F7B7DA" stopOpacity="0" />
        </RadialGradient>
        <RadialGradient id="blue" cx="90" cy="367.5" rx="967.5" ry="533.75" gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#BACDF4" stopOpacity="0.36" />
          <Stop offset="0.24" stopColor="#BACDF4" stopOpacity="0" />
        </RadialGradient>
        <RadialGradient id="gold" cx="292.5" cy="157.5" rx="1338.75" ry="735" gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#F6D64A" stopOpacity="0.22" />
          <Stop offset="0.2" stopColor="#F6D64A" stopOpacity="0" />
        </RadialGradient>
        <RadialGradient id="haze" cx="75" cy="87.5" rx="1466.25" ry="805" gradientUnits="userSpaceOnUse">
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

/* ------------------------------- menu rows -------------------------------- */
interface RowSpec {
  key: string;
  /** Frame-space top edge of the 335x74 card. */
  y: number;
  /** "Background+Shadow" tile fill. */
  tile: string;
  /** Tile glyph — size/colour baked in to match the spec's per-row vectors. */
  icon: ReactNode;
  label: string;
  href: string;
}

const ROWS: RowSpec[] = [
  {
    key: "create",
    y: 116,
    tile: "#E1EDFF",
    // 24x24 iconify frame, 18x18 pen-line vector.
    icon: <Feather name="edit-3" size={24} color="#4A7299" />,
    label: "Create Invoice",
    href: "/payments/create-invoice",
  },
  {
    key: "history",
    y: 116 + ROW_STEP,
    tile: "#FFEBF1",
    // Document with a folded corner and three body rules.
    icon: <Ionicons name="document-text-outline" size={24} color="#A35A74" />,
    label: "Invoice History",
    href: "/payments/invoice-history",
  },
  {
    key: "details",
    y: 116 + ROW_STEP * 2,
    tile: "#EEE5FF",
    // 26x26 iconify frame — a receipt with a torn edge.
    icon: <MaterialCommunityIcons name="receipt-text-outline" size={26} color="#76609E" />,
    label: "Your Details",
    href: "/payments/your-details",
  },
];

function MenuRow({ row, onPress }: { row: RowSpec; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        position: "absolute",
        left: ROW_X,
        top: row.y,
        width: ROW_W,
        height: ROW_H,
        opacity: pressed ? 0.88 : 1,
      })}
    >
      {/* Card — #FFFFFF @55%, 1pt #FFFFFF @90% hairline, r28, soft drop shadow. */}
      <View style={styles.rowFill} />

      {/* Background+Shadow — 48x48 r20 icon tile. */}
      <Abs
        x={TILE_OFF}
        y={TILE_OFF}
        w={TILE_SIZE}
        h={TILE_SIZE}
        radius={20}
        bg={row.tile}
        center
        style={styles.tileShadow}
      >
        {row.icon}
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
        {row.label}
      </Txt>

      {/* Overlay+Shadow — 36x36 r18 glass disc holding the forward chevron. */}
      <Abs
        x={CHEV_X}
        y={CHEV_Y}
        w={CHEV_SIZE}
        h={CHEV_SIZE}
        radius={18}
        bg={GLASS_60}
        center
        style={styles.discShadow}
      >
        {/* 5x10 vector, 1.67 stroke — Feather's weight matches, Ionicons' is heavier. */}
        <Feather name="chevron-right" size={20} color={CHEV_INK} />
      </Abs>
    </Pressable>
  );
}

/* --------------------------------- screen --------------------------------- */
export default function InvoiceHub() {
  const router = useRouter();

  return (
    <Screen height={FRAME_H} background="#F7F0E4" scroll>
      <Backdrop />

      {/* =============================== Header ============================== */}
      <Pressable
        onPress={() => router.back()}
        style={({ pressed }) => [styles.back, pressed && styles.pressed]}
      >
        {/* 20x20 SVG, 11.67x11.67 vector — an arrow, not a chevron. */}
        <Feather name="arrow-left" size={20} color={BACK_INK} />
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
        Invoice
      </Txt>

      {/* ================================ Main =============================== */}
      {/* Main is y=106 h=296; the last row ends at 362, so nothing is clipped
          and the rows can sit straight on the frame at their spec coordinates. */}
      {ROWS.map((row) => (
        <MenuRow key={row.key} row={row} onPress={() => router.push(row.href as never)} />
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  backdrop: { position: "absolute", left: 0, top: 0 },
  pressed: { opacity: 0.85 },

  back: {
    position: "absolute",
    left: 15,
    top: 18,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: GLASS_65,
    borderWidth: 1,
    borderColor: HAIRLINE,
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
    borderColor: HAIRLINE,
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
