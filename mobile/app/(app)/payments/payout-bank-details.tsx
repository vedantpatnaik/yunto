import type { ComponentProps } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Svg, {
  Defs,
  LinearGradient as SvgLinear,
  RadialGradient,
  Rect,
  Stop,
} from "react-native-svg";
import { Abs, Screen, Txt } from "../../../src/ui/Frame";
import { useMe } from "../../../src/api/hooks";

/**
 * Bank Details (payout account) — Figma 7358:29381 "personal information".
 *
 * The influencer's payout account, rendered exactly as the Edit Profile
 * accordion: a glass header ("Personal Information"), six collapsed 335x74
 * section rows (Basics / Language / Address / Measurements / Commercials /
 * Barter Commercials) and the Bank Details row expanded to 739pt showing the
 * Verified Account badge, the four payout fields, the encryption reassurance
 * note and the "Save bank details" CTA.
 *
 * This is the canonical Bank Details surface — the payments flow deep-links
 * here rather than re-implementing the accordion.
 *
 * The Figma frame is 875pt but its "Main" frame clips 1218pt of stacked
 * accordion content, so the canvas is sized to the real content bottom
 * (save button 1279+55, plus Main's 40pt bottom padding) and scrolls.
 * All coordinates below are raw frame coordinates from the spec.
 */

/* ------------------------------- geometry -------------------------------- */
const FRAME_W = 375;
/** Spec frame height — drives the backdrop wash proportions. */
const FRAME_H = 875;
/** Scroll canvas: Main's content bottom (1334) + its 40pt bottom padding. */
const CANVAS_H = 1374;

const ROW_X = 20;
const ROW_W = 335;
const ROW_H = 74;
/** Collapsed rows sit at 116, 202, 288, 374, 460, 546 — 74pt row + 12pt gap. */
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

/** Expanded "Bank Details" card. */
const EXP_Y = 632;
const EXP_H = 739;

/* --------------------------- spec colour tokens --------------------------- */
const LABEL_INK = "#111827";
const TITLE_INK = "#1D1D1F";
const BACK_INK = "#1C1C1E";
const CHEV_INK = "#6B7280";
const GLASS_40 = "rgba(255,255,255,0.4)";
const GLASS_55 = "rgba(255,255,255,0.55)";
const GLASS_60 = "rgba(255,255,255,0.6)";
const GLASS_65 = "rgba(255,255,255,0.65)";
const GLASS_90 = "rgba(255,255,255,0.9)";
const HAIRLINE_60 = "rgba(255,255,255,0.6)";
const HAIRLINE_90 = "rgba(255,255,255,0.9)";
const FIELD_LABEL = "#8A8199";
const FIELD_VALUE = "#1A1525";
const NOTE_INK = "#6B627A";
const LOCK_INK = "#8A5A9A";
const VERIFIED_INK = "#2E8B57";
const VERIFIED_EDGE = "rgba(190,240,210,0.9)";
const CTA_BG = "#312B28";

/* -------------------------------- backdrop -------------------------------- */
/** Frame fill: the beige linear base stretched to the scroll canvas, plus the
 *  four radial tints. The radials stay anchored to the 875pt frame — stretching
 *  them to the canvas pushed the gold glow, the blue-grey band and the pink
 *  blush below the fold, so the first screenful lost the design's wash. */
function Backdrop() {
  const h = CANVAS_H;
  const f = FRAME_H;
  return (
    <Svg width={FRAME_W} height={h} style={styles.backdrop}>
      <Defs>
        <SvgLinear id="base" x1="187.5" y1="0" x2="187.5" y2={h} gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#F7F0E4" />
          <Stop offset="1" stopColor="#F4EBDD" />
        </SvgLinear>
        <RadialGradient
          id="pink"
          cx={0.76 * FRAME_W}
          cy={0.62 * f}
          rx={2.74 * FRAME_W}
          ry={0.65 * f}
          gradientUnits="userSpaceOnUse"
        >
          <Stop offset="0" stopColor="#F7B7DA" stopOpacity="0.34" />
          <Stop offset="0.26" stopColor="#F7B7DA" stopOpacity="0" />
        </RadialGradient>
        <RadialGradient
          id="blue"
          cx={0.24 * FRAME_W}
          cy={0.42 * f}
          rx={2.58 * FRAME_W}
          ry={0.61 * f}
          gradientUnits="userSpaceOnUse"
        >
          <Stop offset="0" stopColor="#BACDF4" stopOpacity="0.36" />
          <Stop offset="0.24" stopColor="#BACDF4" stopOpacity="0" />
        </RadialGradient>
        <RadialGradient
          id="gold"
          cx={0.78 * FRAME_W}
          cy={0.18 * f}
          rx={3.57 * FRAME_W}
          ry={0.84 * f}
          gradientUnits="userSpaceOnUse"
        >
          <Stop offset="0" stopColor="#F6D64A" stopOpacity="0.22" />
          <Stop offset="0.2" stopColor="#F6D64A" stopOpacity="0" />
        </RadialGradient>
        <RadialGradient
          id="haze"
          cx={0.2 * FRAME_W}
          cy={0.1 * f}
          rx={3.91 * FRAME_W}
          ry={0.92 * f}
          gradientUnits="userSpaceOnUse"
        >
          <Stop offset="0" stopColor="#FFFFFF" stopOpacity="0.72" />
          <Stop offset="0.24" stopColor="#FFFFFF" stopOpacity="0" />
        </RadialGradient>
      </Defs>
      <Rect width={FRAME_W} height={h} fill="url(#base)" />
      <Rect width={FRAME_W} height={h} fill="url(#pink)" />
      <Rect width={FRAME_W} height={h} fill="url(#blue)" />
      <Rect width={FRAME_W} height={h} fill="url(#gold)" />
      <Rect width={FRAME_W} height={h} fill="url(#haze)" />
    </Svg>
  );
}

/* ----------------------------- accordion rows ----------------------------- */
/** Tile glyphs span two families: the spec's ruler (Measurements), single
 *  banknote (Commercials) and landmark (Bank Details) only exist in MDI. */
type Glyph =
  | { set: "ion"; name: ComponentProps<typeof Ionicons>["name"] }
  | { set: "mci"; name: ComponentProps<typeof MaterialCommunityIcons>["name"] };

function TileGlyph({ glyph, color }: { glyph: Glyph; color: string }) {
  return glyph.set === "mci" ? (
    <MaterialCommunityIcons name={glyph.name} size={24} color={color} />
  ) : (
    <Ionicons name={glyph.name} size={24} color={color} />
  );
}

interface SectionSpec {
  key: string;
  /** Frame-space top edge of the row card. */
  y: number;
  /** "Background+Shadow" tile fill. */
  tile: string;
  /** Tile glyph stroke colour. */
  ink: string;
  icon: Glyph;
  label: string;
}

/** The six collapsed sections, top to bottom. */
const SECTIONS: SectionSpec[] = [
  { key: "basics", y: ROW_Y0, tile: "#F3E8FF", ink: "#9333EA", icon: { set: "ion", name: "person-outline" }, label: "Basics" },
  { key: "language", y: ROW_Y0 + ROW_STEP, tile: "#DBEAFE", ink: "#2563EB", icon: { set: "ion", name: "language-outline" }, label: "Language" },
  { key: "address", y: ROW_Y0 + ROW_STEP * 2, tile: "#CCFBF1", ink: "#0D9488", icon: { set: "ion", name: "location-outline" }, label: "Address" },
  { key: "measurements", y: ROW_Y0 + ROW_STEP * 3, tile: "#FFEDD5", ink: "#EA580C", icon: { set: "mci", name: "ruler" }, label: "Measurements" },
  { key: "commercials", y: ROW_Y0 + ROW_STEP * 4, tile: "#D1FAE5", ink: "#059669", icon: { set: "mci", name: "cash" }, label: "Commercials" },
  { key: "barter", y: ROW_Y0 + ROW_STEP * 5, tile: "#FCE7F3", ink: "#DB2777", icon: { set: "ion", name: "gift-outline" }, label: "Barter Commercials" },
];

/** Header strip shared by the collapsed rows and the expanded card. */
function SectionHead({
  tile,
  ink,
  icon,
  label,
  expanded,
}: {
  tile: string;
  ink: string;
  icon: Glyph;
  label: string;
  expanded?: boolean;
}) {
  return (
    <>
      {/* Background+Shadow — 48x48 r20 icon tile. */}
      <Abs x={TILE_OFF} y={TILE_OFF} w={TILE_SIZE} h={TILE_SIZE} radius={20} bg={tile} center style={styles.tileShadow}>
        <TileGlyph glyph={icon} color={ink} />
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
        {label}
      </Txt>

      {/* Overlay+Shadow — 36x36 r18 glass disc holding the 10x5 chevron. */}
      <Abs x={DISC_X} y={DISC_Y} w={DISC_SIZE} h={DISC_SIZE} radius={18} bg={GLASS_60} center style={styles.discShadow}>
        <Ionicons name={expanded ? "chevron-up" : "chevron-down"} size={20} color={CHEV_INK} />
      </Abs>
    </>
  );
}

/** A collapsed 335x74 glass row. */
function CollapsedRow({ section, onPress }: { section: SectionSpec; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        position: "absolute",
        left: ROW_X,
        top: section.y,
        width: ROW_W,
        height: ROW_H,
        opacity: pressed ? 0.88 : 1,
      })}
    >
      <View style={styles.rowFill} />
      <SectionHead tile={section.tile} ink={section.ink} icon={section.icon} label={section.label} />
    </Pressable>
  );
}

/* ------------------------------ field cards ------------------------------- */
/** One 301x72 glass field card: uppercase caption over its value. */
function Field({
  y,
  labelY,
  valueY,
  label,
  value,
  valueSpacing,
}: {
  y: number;
  labelY: number;
  valueY: number;
  label: string;
  value: string;
  valueSpacing?: number;
}) {
  return (
    <>
      <Abs
        x={37}
        y={y}
        w={301}
        h={72}
        radius={20}
        bg={GLASS_60}
        border={HAIRLINE_90}
        borderWidth={1}
        style={styles.fieldShadow}
      />
      <Txt
        x={58}
        y={labelY}
        w={259}
        size={12}
        weight="bold"
        font="inter"
        color={FIELD_LABEL}
        lineHeight={14.52}
        letterSpacing={0.5}
      >
        {label}
      </Txt>
      <Txt
        x={58}
        y={valueY}
        w={259}
        size={14}
        weight="medium"
        font="inter"
        color={FIELD_VALUE}
        lineHeight={16.94}
        letterSpacing={valueSpacing}
        numberOfLines={1}
      >
        {value}
      </Txt>
    </>
  );
}

/** One 156x75 half-width glass field card (IFSC CODE | UPI ID). */
function HalfField({
  x,
  textX,
  label,
  value,
}: {
  x: number;
  textX: number;
  label: string;
  value: string;
}) {
  return (
    <>
      <Abs
        x={x}
        y={1069}
        w={156}
        h={75}
        radius={20}
        bg={GLASS_60}
        border={HAIRLINE_90}
        borderWidth={1}
        style={styles.fieldShadow}
      />
      <Txt
        x={textX}
        y={1086}
        w={114}
        size={12}
        weight="bold"
        font="inter"
        color={FIELD_LABEL}
        lineHeight={14.52}
        letterSpacing={0.5}
      >
        {label}
      </Txt>
      <Txt
        x={textX}
        y={1107}
        w={114}
        size={14}
        weight="medium"
        font="inter"
        color={FIELD_VALUE}
        lineHeight={16.94}
        numberOfLines={1}
      >
        {value}
      </Txt>
    </>
  );
}

/* --------------------------------- screen --------------------------------- */
export default function PayoutBankDetails() {
  const router = useRouter();
  const { data: me } = useMe();

  /* Account holder is the only payout field the API models today; the rest of
     the account stays at its spec values until /me/bank-details lands. */
  const accountHolder = me?.name ?? "Sophia Roy";

  return (
    <Screen height={CANVAS_H} background="#F7F0E4" scroll>
      <Backdrop />

      {/* =============================== Header ============================== */}
      <Pressable
        onPress={() => router.back()}
        style={({ pressed }) => [styles.back, pressed && styles.pressed]}
      >
        {/* Spec's back vector is 11.67x11.67 — a full left arrow, not a chevron. */}
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

      {/* ======================= Main — collapsed sections ==================== */}
      {/* Tapping another section returns to the accordion, which owns it. */}
      {SECTIONS.map((section) => (
        <CollapsedRow key={section.key} section={section} onPress={() => router.back()} />
      ))}

      {/* ==================== Bank Details (expanded, 739pt) ================= */}
      <Abs
        x={ROW_X}
        y={EXP_Y}
        w={ROW_W}
        h={EXP_H}
        radius={28}
        bg={GLASS_60}
        border={HAIRLINE_90}
        borderWidth={1}
        style={styles.expandedShadow}
      />
      <Pressable
        onPress={() => router.back()}
        style={({ pressed }) => [styles.expandedHead, pressed && styles.pressed]}
      >
        <SectionHead
          tile="#E0E7FF"
          ink="#4F46E5"
          icon={{ set: "mci", name: "bank-outline" }}
          label="Bank Details"
          expanded
        />
      </Pressable>

      {/* Verified Account badge — 185x40 mint gradient pill, centred at x=95. */}
      <LinearGradient
        colors={["rgba(230,250,240,0.9)", "rgba(210,245,225,0.8)"]}
        start={{ x: 0.2, y: 0 }}
        end={{ x: 0.8, y: 1 }}
        style={styles.verified}
      >
        <Ionicons name="shield-checkmark-outline" size={18} color={VERIFIED_INK} />
      </LinearGradient>
      <Txt
        x={142}
        y={744.5}
        w={117}
        size={14}
        weight="semibold"
        font="inter"
        color={VERIFIED_INK}
        lineHeight={16.94}
        letterSpacing={0.2}
      >
        Verified Account
      </Txt>

      {/* --------------------------- payout fields -------------------------- */}
      <Field y={805} labelY={822} valueY={843} label="ACCOUNT HOLDER NAME" value={accountHolder} />
      <Field y={893} labelY={910} valueY={931} label="BANK NAME" value="HDFC Bank" />
      <Field
        y={981}
        labelY={998}
        valueY={1019}
        label="ACCOUNT NUMBER"
        value="•••• •••• •••• 4589"
        valueSpacing={2}
      />

      {/* IFSC | UPI pair. The spec places these at x=37 and x=201, both 156
          wide, so the right card runs 2pt past the 355pt card edge. */}
      <HalfField x={37} textX={58} label="IFSC CODE" value="HDFC0001234" />
      <HalfField x={201} textX={222} label="UPI ID" value="sohpia@okhdfc" />

      {/* ----------------------- encryption reassurance --------------------- */}
      <Abs
        x={37}
        y={1168}
        w={301}
        h={71}
        radius={20}
        bg={GLASS_40}
        border={HAIRLINE_60}
        borderWidth={1}
        style={styles.noteShadow}
      />
      <Abs x={58} y={1185.5} w={36} h={36} radius={18} bg={GLASS_90} center style={styles.lockShadow}>
        <Ionicons name="lock-closed-outline" size={16} color={LOCK_INK} />
      </Abs>
      <Txt x={110} y={1185} w={191} size={13} weight="medium" font="inter" color={NOTE_INK} lineHeight={18.2}>
        {"Your details are encrypted and\nsecurely stored."}
      </Txt>

      {/* ------------------------------- CTA -------------------------------- */}
      <Pressable
        onPress={() => router.back()}
        style={({ pressed }) => [styles.cta, pressed && styles.pressed]}
      >
        <Txt x={81.5} y={18} w={138} size={16} weight="bold" font="inter" color="#FFFFFF" lineHeight={19.36} align="center">
          Save bank details
        </Txt>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  backdrop: { position: "absolute", left: 0, top: 0 },
  pressed: { opacity: 0.88 },

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

  /* Collapsed row card — #FFFFFF @55%, 1pt #FFFFFF @90% hairline, r28. */
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

  expandedShadow: {
    shadowColor: "#000000",
    shadowOpacity: 0.08,
    shadowRadius: 40,
    shadowOffset: { width: 0, height: 16 },
    elevation: 3,
  },
  /* Tap target over the expanded card's own 309x48 header container. */
  expandedHead: {
    position: "absolute",
    left: ROW_X,
    top: EXP_Y,
    width: ROW_W,
    height: ROW_H,
  },

  verified: {
    position: "absolute",
    left: 95,
    top: 733,
    width: 185,
    height: 40,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: VERIFIED_EDGE,
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 21,
  },

  fieldShadow: {
    shadowColor: "#1E1432",
    shadowOpacity: 0.03,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
    elevation: 1,
  },
  noteShadow: {
    shadowColor: "#000000",
    shadowOpacity: 0.02,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 1,
  },
  lockShadow: {
    shadowColor: "#8A5A9A",
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 1,
  },

  cta: {
    position: "absolute",
    left: 37,
    top: 1279,
    width: 301,
    height: 55,
    borderRadius: 100,
    backgroundColor: CTA_BG,
  },
});
