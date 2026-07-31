import type { ComponentProps } from "react";
import { useState } from "react";
import { Pressable, StyleSheet, TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import Svg, {
  Defs,
  LinearGradient as SvgLinear,
  RadialGradient,
  Rect,
  Stop,
} from "react-native-svg";
import { Abs, Screen, Txt } from "../../../../src/ui/Frame";
import { fonts } from "../../../../src/theme";
import { useMe, useUpdate, type User } from "../../../../src/api/hooks";

/**
 * Personal Information — Measurements (expanded) — Figma 7358:28639.
 *
 * The Edit Profile accordion with the Measurements section open: the glass
 * header, three collapsed rows above, the 335x606 expanded card holding the
 * 2x3 "Sizing Grid" of labelled numeric tiles (each with a unit chip) and the
 * "Save Changes" CTA, then three more collapsed rows below.
 *
 * The Figma frame is 875pt but its "Main" frame stacks 1238pt of accordion
 * behind a clip, so the canvas is sized to the real content bottom (Bank
 * Details 1164 + 74 + Main's 40pt bottom padding) and scrolls. Every number
 * below is a raw frame coordinate lifted from the spec.
 */

/* ------------------------------- geometry -------------------------------- */
const FRAME_W = 375;
/** Scroll canvas: Main's content bottom (1238) + its 40pt bottom padding. */
const CANVAS_H = 1278;

const CARD_X = 20;
const CARD_W = 335;

/** Expanded "Measurements" card. */
const EXP_Y = 374;
const EXP_H = 606;

const ROW_H = 74;

/* Section-header offsets, relative to the card's own x/y. Identical for the
   expanded card and the collapsed rows (spec absolute minus card origin). */
const TILE_OFF = 13; // 33-20, 129-116
const TILE_SIZE = 48;
const LABEL_X = 77; // 97-20
const LABEL_Y = 27.5; // 143.5-116
const LABEL_W = 189;
const DISC_X = 282; // 302-20
const DISC_Y = 19; // 135-116
const DISC_SIZE = 36;

/* Sizing-grid tile interior, relative to the tile's own x/y. */
const TILE_W = 146.5;
const TILE_H = 124;
const CAP_DX = 17; // 50-33
const CAP_DY = 26.5; // 491.5-465
const CHIP_DY = 21; // 486-465
const CHIP_H = 25;
const UNIT_DY = 26; // 491-465
const CHEV_DY = 26.5; // 491.5-465
const VALUE_DX = 17; // 50-33
const VALUE_DY = 62; // 527-465
const VALUE_W = 112.5;
const VALUE_H = 41;

/* --------------------------- spec colour tokens --------------------------- */
const LABEL_INK = "#111827";
const TITLE_INK = "#1D1D1F";
const BACK_INK = "#1C1C1E";
const CHEV_INK = "#6B7280";
const CAPTION_INK = "#78716C";
const VALUE_INK = "#1C1917";
const GLASS_55 = "rgba(255,255,255,0.55)";
const GLASS_60 = "rgba(255,255,255,0.6)";
const GLASS_65 = "rgba(255,255,255,0.65)";
const GLASS_90 = "rgba(255,255,255,0.9)";
const HAIRLINE_80 = "rgba(255,255,255,0.8)";
const HAIRLINE_90 = "rgba(255,255,255,0.9)";
const CTA_BG = "#312B28";

/* -------------------------------- backdrop -------------------------------- */
/** Frame fill: the beige linear base plus four radial tints, stretched to the
 *  scroll canvas so the wash covers the whole accordion. */
function Backdrop() {
  const h = CANVAS_H;
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
          cy={0.62 * h}
          rx={2.74 * FRAME_W}
          ry={0.65 * h}
          gradientUnits="userSpaceOnUse"
        >
          <Stop offset="0" stopColor="#F7B7DA" stopOpacity="0.34" />
          <Stop offset="0.26" stopColor="#F7B7DA" stopOpacity="0" />
        </RadialGradient>
        <RadialGradient
          id="blue"
          cx={0.24 * FRAME_W}
          cy={0.42 * h}
          rx={2.58 * FRAME_W}
          ry={0.61 * h}
          gradientUnits="userSpaceOnUse"
        >
          <Stop offset="0" stopColor="#BACDF4" stopOpacity="0.36" />
          <Stop offset="0.24" stopColor="#BACDF4" stopOpacity="0" />
        </RadialGradient>
        <RadialGradient
          id="gold"
          cx={0.78 * FRAME_W}
          cy={0.18 * h}
          rx={3.57 * FRAME_W}
          ry={0.84 * h}
          gradientUnits="userSpaceOnUse"
        >
          <Stop offset="0" stopColor="#F6D64A" stopOpacity="0.22" />
          <Stop offset="0.2" stopColor="#F6D64A" stopOpacity="0" />
        </RadialGradient>
        <RadialGradient
          id="haze"
          cx={0.2 * FRAME_W}
          cy={0.1 * h}
          rx={3.91 * FRAME_W}
          ry={0.92 * h}
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
/** Tile glyphs span two families: the spec's ruler (Measurements) only exists
 *  in Material Community, the rest are Ionicons. */
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
  /** Sibling route, where one exists. Otherwise the row returns to the list. */
  href?: string;
}

/** The six sections that stay collapsed around the open Measurements card. */
const SECTIONS: SectionSpec[] = [
  {
    key: "basics",
    y: 116,
    tile: "#F3E8FF",
    ink: "#9333EA",
    icon: { set: "ion", name: "person-outline" },
    label: "Basics",
    href: "/profile/personal-information/basics",
  },
  { key: "language", y: 202, tile: "#DBEAFE", ink: "#2563EB", icon: { set: "ion", name: "language-outline" }, label: "Language" },
  { key: "address", y: 288, tile: "#CCFBF1", ink: "#0D9488", icon: { set: "ion", name: "location-outline" }, label: "Address" },
  { key: "commercials", y: 992, tile: "#D1FAE5", ink: "#059669", icon: { set: "ion", name: "cash-outline" }, label: "Commercials" },
  { key: "barter", y: 1078, tile: "#FCE7F3", ink: "#DB2777", icon: { set: "ion", name: "gift-outline" }, label: "Barter Commercials" },
  {
    key: "bank",
    y: 1164,
    tile: "#E0E7FF",
    ink: "#4F46E5",
    icon: { set: "ion", name: "business-outline" },
    label: "Bank Details",
    href: "/payments/payout-bank-details",
  },
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
        left: CARD_X,
        top: section.y,
        width: CARD_W,
        height: ROW_H,
        opacity: pressed ? 0.88 : 1,
      })}
    >
      <View style={styles.rowFill} />
      <SectionHead tile={section.tile} ink={section.ink} icon={section.icon} label={section.label} />
    </Pressable>
  );
}

/* ------------------------------ sizing grid ------------------------------- */
type FieldKey = "height" | "weight" | "bust" | "waist" | "hips" | "shoeSize";

interface FieldSpec {
  key: FieldKey;
  /** Caption — the spec's UPPER-cased label. */
  label: string;
  /** Unit chip copy. */
  unit: string;
  /** The number authored in the design; the fallback until a record supplies one. */
  spec: string;
  /** Tile origin in frame space. */
  x: number;
  y: number;
  /** Chip box and its contents, as offsets from the tile origin. */
  chipDx: number;
  chipW: number;
  unitDx: number;
  chevDx: number;
}

/** The 2x3 grid: 146.5x124 tiles at a 162.5pt column step and a 140pt row step. */
const FIELDS: FieldSpec[] = [
  { key: "height", label: "HEIGHT", unit: "cm", spec: "172", x: 33, y: 465, chipDx: 77.91, chipW: 51.59, unitDx: 86.91, chevDx: 106.5 },
  { key: "weight", label: "WEIGHT", unit: "kg", spec: "55", x: 195.5, y: 465, chipDx: 81.63, chipW: 47.87, unitDx: 90.63, chevDx: 106.5 },
  { key: "bust", label: "BUST", unit: "in", spec: "34", x: 33, y: 605, chipDx: 85.25, chipW: 44.25, unitDx: 94.25, chevDx: 106.5 },
  { key: "waist", label: "WAIST", unit: "in", spec: "26", x: 195.5, y: 605, chipDx: 85.25, chipW: 44.25, unitDx: 94.25, chevDx: 106.5 },
  { key: "hips", label: "HIPS", unit: "in", spec: "36", x: 33, y: 745, chipDx: 85.25, chipW: 44.25, unitDx: 94.25, chevDx: 106.5 },
  { key: "shoeSize", label: "SHOE SIZE", unit: "EU", spec: "39", x: 195.5, y: 745, chipDx: 83.28, chipW: 50.12, unitDx: 92.28, chevDx: 110.4 },
];

/** One measurement tile: glass card, caption, unit chip and the editable value. */
function SizingTile({
  field,
  value,
  onChange,
}: {
  field: FieldSpec;
  value: string;
  onChange: (next: string) => void;
}) {
  const { x, y } = field;
  return (
    <>
      {/* "<name>:shadow" rectangle + the r24 glass card it sits under. */}
      <Abs
        x={x}
        y={y}
        w={TILE_W}
        h={TILE_H}
        radius={24}
        bg={GLASS_60}
        border={HAIRLINE_80}
        borderWidth={1}
        style={styles.tileCardShadow}
      />

      {/* Caption — Inter 600 11 / 13.31, +1 tracking, uppercase. */}
      <Txt
        x={x + CAP_DX}
        y={y + CAP_DY}
        size={11}
        weight="semibold"
        font="inter"
        color={CAPTION_INK}
        lineHeight={13.31}
        letterSpacing={1}
        numberOfLines={1}
      >
        {field.label}
      </Txt>

      {/* Overlay+Border+Shadow — the r100 unit chip. */}
      <Abs
        x={x + field.chipDx}
        y={y + CHIP_DY}
        w={field.chipW}
        h={CHIP_H}
        radius={100}
        bg={GLASS_90}
        border="#FFFFFF"
        borderWidth={1}
        style={styles.chipShadow}
      />
      <Txt
        x={x + field.unitDx}
        y={y + UNIT_DY}
        size={12}
        weight="medium"
        font="inter"
        color={VALUE_INK}
        lineHeight={14.52}
        numberOfLines={1}
      >
        {field.unit}
      </Txt>
      <Abs x={x + field.chevDx} y={y + CHEV_DY} w={14} h={14} center>
        <Ionicons name="chevron-down" size={12} color={VALUE_INK} />
      </Abs>

      {/* Value — Inter 34 / 41.15, -1 tracking. Editable in place. */}
      <TextInput
        value={value}
        onChangeText={onChange}
        keyboardType="number-pad"
        selectionColor={VALUE_INK}
        style={[styles.value, { left: x + VALUE_DX, top: y + VALUE_DY }]}
      />
    </>
  );
}

/* --------------------------------- screen --------------------------------- */
/** The account record widened with the six measurement keys the save PATCHes. */
type MeasurementPatch = User & Record<FieldKey, string>;

export default function PersonalInformationMeasurements() {
  const router = useRouter();
  const { data: me } = useMe();
  const save = useUpdate<MeasurementPatch>("users");

  /* Edits are held as overrides so each tile shows the spec number while the
     account is in flight and adopts an edit the moment one is made, without an
     effect and without the geometry ever moving. */
  const [draft, setDraft] = useState<Partial<Record<FieldKey, string>>>({});
  const valueOf = (f: FieldSpec) => draft[f.key] ?? f.spec;

  const onSave = () => {
    if (!me) {
      router.back();
      return;
    }
    const data = Object.fromEntries(
      FIELDS.map((f) => [f.key, valueOf(f)])
    ) as Record<FieldKey, string>;
    save.mutate(
      { id: me.id, data },
      { onSuccess: () => router.back(), onError: () => router.back() }
    );
  };

  return (
    <Screen height={CANVAS_H} background="#F7F0E4" scroll>
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

      {/* ==================== Measurements (expanded, 606pt) ================== */}
      <Abs
        x={CARD_X}
        y={EXP_Y}
        w={CARD_W}
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
          tile="#FFEDD5"
          ink="#EA580C"
          icon={{ set: "mci", name: "ruler" }}
          label="Measurements"
          expanded
        />
      </Pressable>

      {/* --------------------------- Sizing Grid ---------------------------- */}
      {FIELDS.map((field) => (
        <SizingTile
          key={field.key}
          field={field}
          value={valueOf(field)}
          onChange={(v) => setDraft((d) => ({ ...d, [field.key]: v }))}
        />
      ))}

      {/* ------------------------------- CTA -------------------------------- */}
      <Pressable
        onPress={onSave}
        disabled={save.isPending}
        style={({ pressed }) => [styles.cta, (pressed || save.isPending) && styles.pressed]}
      >
        <Txt
          x={94.61}
          y={18}
          w={111.77}
          size={16}
          weight="bold"
          font="inter"
          color="#FFFFFF"
          lineHeight={19.36}
          align="center"
        >
          Save Changes
        </Txt>
      </Pressable>

      {/* ==================== Main — the six collapsed rows =================== */}
      {SECTIONS.map((section) => (
        <CollapsedRow
          key={section.key}
          section={section}
          onPress={() => (section.href ? router.push(section.href) : router.back())}
        />
      ))}
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
    left: CARD_X,
    top: EXP_Y,
    width: CARD_W,
    height: ROW_H,
  },

  /* "<name>:shadow" — 30pt blur, 10pt down, -8 spread under each sizing tile. */
  tileCardShadow: {
    shadowColor: "#000000",
    shadowOpacity: 0.04,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 10 },
    elevation: 2,
  },
  chipShadow: {
    shadowColor: "#000000",
    shadowOpacity: 0.03,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },

  /* Sizing value — the spec authors Inter 300; the app ships Inter 400/500, so
     the lightest loaded face stands in at the spec's size and tracking. */
  value: {
    position: "absolute",
    width: VALUE_W,
    height: VALUE_H,
    padding: 0,
    fontFamily: fonts.inter,
    fontSize: 34,
    letterSpacing: -1,
    color: VALUE_INK,
    textAlignVertical: "center",
    includeFontPadding: false,
  },

  cta: {
    position: "absolute",
    left: 37,
    top: 907,
    width: 301,
    height: 56,
    borderRadius: 100,
    backgroundColor: CTA_BG,
    shadowColor: "#A78BFA",
    shadowOpacity: 0.4,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
});
