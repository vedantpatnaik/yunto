import { useMemo } from "react";
import type { ComponentProps } from "react";
import { Pressable, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { Feather, Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Svg, {
  Defs,
  LinearGradient as SvgLinear,
  RadialGradient,
  Rect,
  Stop,
} from "react-native-svg";
import { Abs, Screen, Txt } from "../../../src/ui/Frame";
import { inr, useInvoices } from "../../../src/api/hooks";

/**
 * Invoice History — Figma 7358:29938 (375x875).
 *
 * "Main Content" (y=106, h=730, clipsContent) holds a section header row and a
 * vertical stack of 327x163 glass invoice cards on a 20pt gap. The design ships
 * four cards, the last of which ends at y=874 — past the clip — so the frame is
 * authored as a scrolling list. The canvas therefore grows with the real row
 * count and <Screen scroll> carries it, exactly as the Leads frame does.
 *
 * Coordinates below are raw frame coordinates from the spec; <Screen> scales the
 * 375pt canvas to the device.
 */

/* ------------------------------- geometry -------------------------------- */
const FRAME_W = 375;
const FRAME_H = 875;

/** First card top, and the 163 + 20 gap step between cards. */
const CARD_Y = 162;
const CARD_X = 24;
const CARD_W = 327;
const CARD_H = 163;
const CARD_STEP = 183;
/** "Main Content" closes with 40pt of bottom padding. */
const LIST_PAD_BOTTOM = 40;

/** Card-relative offsets — every card repeats this internal layout. */
const PAD_L = 25; // 49 - 24
const CONTENT_W = 277; // 49 -> 326
const ROW1_Y = 25; // 187 - 162
const NUMBER_Y = 30.5; // 192.5 - 162
const DIVIDER_Y = 70; // (187 + 45) - 162
const TILE_Y = 90; // 252 - 162
const TEXT_X = 89; // 113 - 24
const NAME_Y = 94; // 256 - 162
const DATE_Y = 118; // 280 - 162
const AMOUNT_Y = 103.5; // 265.5 - 162
/** Left group tops out at 146.61 wide; keep names clear of the amount. */
const NAME_W = 118;

/* --------------------------- spec colour tokens --------------------------- */
const TITLE_INK = "#1D1D1F";
const HEADING_INK = "#71717A";
const NUMBER_INK = "#A1A1AA";
const NAME_INK = "#27272A";
const DATE_INK = "#71717A";
const ICON_INK = "#27272A";
const GLASS_WHITE_90 = "rgba(255,255,255,0.9)";
const GLASS_WHITE_80 = "rgba(255,255,255,0.8)";
const GLASS_WHITE_60 = "rgba(255,255,255,0.6)";
const HAIRLINE = "rgba(0,0,0,0.04)";

/** Card fill: #FFFFFFF2 -> #FEF6E499 on the spec's 0.22/-0.31 -> 0.78/1.31 axis. */
const CARD_FILL = ["rgba(255,255,255,0.95)", "rgba(254,246,228,0.6)"] as const;

/* ------------------------------ status pills ------------------------------ */
/**
 * The three pill treatments the frame ships. Widths are the spec's own — the
 * pill is right-anchored to the card's 326pt content edge, so x is derived.
 */
const PILLS = {
  OVERDUE: { w: 82.66, bg: "rgba(254,202,202,0.8)", ink: "#B91C1C" },
  PENDING: { w: 79.59, bg: "rgba(254,240,138,0.8)", ink: "#A16207" },
  PAID: { w: 53.78, bg: "rgba(204,251,241,0.8)", ink: "#047857" },
} as const;

type PillKey = keyof typeof PILLS;

/** PaymentStatus is PAID | UNPAID | OVERDUE; the frame labels UNPAID "PENDING". */
const pillFor = (status: string): PillKey =>
  status === "PAID" ? "PAID" : status === "OVERDUE" ? "OVERDUE" : "PENDING";

/* ------------------------------- brand tiles ------------------------------ */
/**
 * The 48x48 icon tile cycles four tints down the stack (red, orange, purple,
 * teal) independently of status — the spec's two PAID cards carry different
 * tiles. Vector paths are not in the spec, but each glyph's stroke bounds pin
 * the source icon exactly (all four are lucide, drawn at 20/24 scale):
 *   18x20 + 17.8x8   -> shopping-bag   (Feather draws the same paths)
 *   20x20 + 4x4      -> sparkles
 *   20x19.07         -> star
 *   20x16            -> wind
 * Feather is lucide's ancestor and matches three of them path-for-path; only
 * the sparkle has no Feather glyph, so that one comes from Ionicons.
 */
type TileIcon =
  | { set: "feather"; name: ComponentProps<typeof Feather>["name"] }
  | { set: "ion"; name: ComponentProps<typeof Ionicons>["name"] };

const TILES: {
  fill: readonly [string, string];
  ink: string;
  icon: TileIcon;
}[] = [
  {
    fill: ["rgba(254,202,202,0.6)", "rgba(254,202,202,0.2)"],
    ink: "#B91C1C",
    icon: { set: "feather", name: "shopping-bag" },
  },
  {
    fill: ["rgba(255,237,213,0.8)", "rgba(255,237,213,0.3)"],
    ink: "#C2410C",
    icon: { set: "ion", name: "sparkles-outline" },
  },
  {
    fill: ["rgba(243,232,255,0.8)", "rgba(243,232,255,0.3)"],
    ink: "#7E22CE",
    icon: { set: "feather", name: "star" },
  },
  {
    fill: ["rgba(204,251,241,0.8)", "rgba(204,251,241,0.3)"],
    ink: "#047857",
    icon: { set: "feather", name: "wind" },
  },
];

/* --------------------------------- helpers -------------------------------- */
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** "28 May 2025" / "05 Jun 2025" — the card's date line. */
function dayMonthYear(iso?: string): string {
  const t = iso ? new Date(iso) : null;
  if (!t || Number.isNaN(t.getTime())) return "";
  return `${String(t.getDate()).padStart(2, "0")} ${MONTHS[t.getMonth()]} ${t.getFullYear()}`;
}

/* -------------------------------- backdrop -------------------------------- */
/** Frame fill: a cream linear base plus four soft radial tints. */
function Backdrop({ height }: { height: number }) {
  return (
    <Svg width={FRAME_W} height={height} style={styles.backdrop}>
      <Defs>
        <SvgLinear id="base" x1="187.5" y1="0" x2="187.5" y2={height} gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#F7F0E4" />
          <Stop offset="1" stopColor="#F4EBDD" />
        </SvgLinear>
        <RadialGradient
          id="pink" cx="285" cy={0.62 * height} rx="1027.5" ry={0.65 * height}
          gradientUnits="userSpaceOnUse"
        >
          <Stop offset="0" stopColor="#F7B7DA" stopOpacity="0.34" />
          <Stop offset="0.26" stopColor="#F7B7DA" stopOpacity="0" />
        </RadialGradient>
        <RadialGradient
          id="blue" cx="90" cy={0.42 * height} rx="967.5" ry={0.61 * height}
          gradientUnits="userSpaceOnUse"
        >
          <Stop offset="0" stopColor="#BACDF4" stopOpacity="0.36" />
          <Stop offset="0.24" stopColor="#BACDF4" stopOpacity="0" />
        </RadialGradient>
        <RadialGradient
          id="gold" cx="292.5" cy={0.18 * height} rx="1338.75" ry={0.84 * height}
          gradientUnits="userSpaceOnUse"
        >
          <Stop offset="0" stopColor="#F6D64A" stopOpacity="0.22" />
          <Stop offset="0.2" stopColor="#F6D64A" stopOpacity="0" />
        </RadialGradient>
        <RadialGradient
          id="haze" cx="75" cy={0.1 * height} rx="1466.25" ry={0.92 * height}
          gradientUnits="userSpaceOnUse"
        >
          <Stop offset="0" stopColor="#FFFFFF" stopOpacity="0.72" />
          <Stop offset="0.24" stopColor="#FFFFFF" stopOpacity="0" />
        </RadialGradient>
      </Defs>
      <Rect width={FRAME_W} height={height} fill="url(#base)" />
      <Rect width={FRAME_W} height={height} fill="url(#pink)" />
      <Rect width={FRAME_W} height={height} fill="url(#blue)" />
      <Rect width={FRAME_W} height={height} fill="url(#gold)" />
      <Rect width={FRAME_W} height={height} fill="url(#haze)" />
    </Svg>
  );
}

/* ------------------------------ invoice card ------------------------------ */
interface Row {
  id: string;
  number: string;
  brandName: string;
  date: string;
  amount: string;
  pill: PillKey;
}

function InvoiceCard({ row, top, tone }: { row: Row; top: number; tone: number }) {
  const pill = PILLS[row.pill];
  const tile = TILES[tone];

  return (
    <Abs x={CARD_X} y={top} w={CARD_W} h={CARD_H} radius={24} style={styles.cardShadow}>
      <LinearGradient
        colors={CARD_FILL}
        start={{ x: 0.22, y: -0.31 }}
        end={{ x: 0.78, y: 1.31 }}
        style={styles.cardFill}
      />

      {/* ------------------------ top row + hairline ----------------------- */}
      <Txt
        x={PAD_L} y={NUMBER_Y} size={14} weight="bold" font="inter"
        color={NUMBER_INK} lineHeight={16.94} letterSpacing={0.5} numberOfLines={1}
      >
        {`#${row.number}`}
      </Txt>
      <Abs
        x={PAD_L + CONTENT_W - pill.w} y={ROW1_Y} w={pill.w} h={28} radius={100}
        bg={pill.bg} border={GLASS_WHITE_60} borderWidth={1} center
      >
        <Txt size={11} weight="bold" font="inter" color={pill.ink} lineHeight={13.31} letterSpacing={0.5}>
          {row.pill}
        </Txt>
      </Abs>
      <Abs x={PAD_L} y={DIVIDER_Y} w={CONTENT_W} h={1} bg={HAIRLINE} />

      {/* -------------------------- bottom row ----------------------------- */}
      <Abs x={PAD_L} y={TILE_Y} w={48} h={48} radius={16} style={styles.tileShadow}>
        <LinearGradient
          colors={tile.fill}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.tileFill}
        />
        <Abs x={0} y={0} w={48} h={48} center>
          {tile.icon.set === "feather" ? (
            <Feather name={tile.icon.name} size={20} color={tile.ink} />
          ) : (
            <Ionicons name={tile.icon.name} size={20} color={tile.ink} />
          )}
        </Abs>
      </Abs>

      <Txt
        x={TEXT_X} y={NAME_Y} w={NAME_W} size={17} weight="bold" font="inter"
        color={NAME_INK} lineHeight={20.57} letterSpacing={-0.3} numberOfLines={1}
      >
        {row.brandName}
      </Txt>
      <Txt
        x={TEXT_X} y={DATE_Y} w={NAME_W} size={13} weight="semibold" font="inter"
        color={DATE_INK} lineHeight={15.73} numberOfLines={1}
      >
        {row.date}
      </Txt>

      <Txt
        x={PAD_L} y={AMOUNT_Y} w={CONTENT_W} align="right"
        size={18} weight="bold" font="inter"
        color={NAME_INK} lineHeight={21.78} letterSpacing={-0.5} numberOfLines={1}
      >
        {row.amount}
      </Txt>
    </Abs>
  );
}

/* --------------------------------- screen --------------------------------- */
export default function InvoiceHistory() {
  const router = useRouter();
  const { data: invoices = [], isLoading } = useInvoices();

  const rows = useMemo<Row[]>(
    () =>
      invoices.map((inv) => ({
        id: inv.id,
        number: inv.number,
        brandName: inv.brandName,
        date: dayMonthYear(inv.createdAt),
        amount: `₹${inr(inv.payout)}`,
        pill: pillFor(inv.status),
      })),
    [invoices],
  );

  // The stack overflows the 730pt clip by design, so the canvas grows with it.
  const canvasH = Math.max(FRAME_H, CARD_Y + rows.length * CARD_STEP + LIST_PAD_BOTTOM - 20);

  return (
    <Screen height={canvasH} background="#F7F0E4" scroll>
      <Backdrop height={canvasH} />

      {/* =============================== Header ============================== */}
      <Pressable
        onPress={() => router.back()}
        style={({ pressed }) => [styles.back, pressed && styles.pressed]}
      >
        {/* Spec: 11.67x11.67 stroke in a 20pt box — a full arrow, not a chevron. */}
        <Feather name="arrow-left" size={20} color="#1C1C1E" />
      </Pressable>
      <Txt
        x={79.5} y={30} w={236} align="center"
        size={16} weight="bold" font="inter" color={TITLE_INK} lineHeight={19.36}
      >
        Invoice History
      </Txt>

      {/* ============================ Section header ========================= */}
      <Txt
        x={28} y={116} w={133.8} size={13} weight="bold" font="inter"
        color={HEADING_INK} lineHeight={15.73} letterSpacing={1}
      >
        RECENT INVOICES
      </Txt>
      <Pressable
        onPress={() => router.push("/payments/invoice-create")}
        style={({ pressed }) => [styles.action, pressed && styles.pressed]}
      >
        {/* Spec: 12x12 stroke in a 16pt box — the sliders glyph, not a plus. */}
        <Ionicons name="options-outline" size={16} color={ICON_INK} />
      </Pressable>

      {/* ============================ Invoice cards ========================== */}
      {rows.map((row, i) => (
        <InvoiceCard key={row.id} row={row} top={CARD_Y + i * CARD_STEP} tone={i % TILES.length} />
      ))}

      {rows.length === 0 ? (
        <Txt
          x={49} y={CARD_Y + NUMBER_Y} w={CONTENT_W}
          size={13} weight="semibold" font="inter" color={DATE_INK} lineHeight={15.73}
        >
          {isLoading ? "Loading…" : "No invoices yet"}
        </Txt>
      ) : null}
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
    backgroundColor: "rgba(255,255,255,0.65)",
    borderWidth: 1,
    borderColor: GLASS_WHITE_90,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000000",
    shadowOpacity: 0.03,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 1,
  },
  action: {
    position: "absolute",
    left: 311,
    top: 106,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: GLASS_WHITE_60,
    borderWidth: 1,
    borderColor: GLASS_WHITE_80,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000000",
    shadowOpacity: 0.02,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },

  // Two drop shadows in the spec (r12 #00000008, r40 #E6DCF580); RN takes one,
  // so the wider lilac ambient wins — it is what reads on screen.
  cardShadow: {
    shadowColor: "#E6DCF5",
    shadowOpacity: 0.5,
    shadowRadius: 40,
    shadowOffset: { width: 0, height: 16 },
    elevation: 3,
  },
  cardFill: {
    position: "absolute",
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: GLASS_WHITE_90,
  },
  tileShadow: {
    shadowColor: "#000000",
    shadowOpacity: 0.02,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  tileFill: {
    position: "absolute",
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: GLASS_WHITE_90,
  },
});
