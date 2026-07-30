import type { ComponentProps } from "react";
import { Fragment, useState } from "react";
import { Pressable, StyleSheet, TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Svg, {
  Defs,
  LinearGradient as SvgLinear,
  RadialGradient,
  Rect,
  Stop,
} from "react-native-svg";
import { Abs, Screen, Txt } from "../../../../src/ui/Frame";
import { fonts } from "../../../../src/theme";
import { inr, useCreators, useMe, useUpdate, type Creator } from "../../../../src/api/hooks";

/**
 * Personal Information — Commercials (expanded) — Figma 7358:28895.
 *
 * The Edit Profile accordion with the paid rate card open: four collapsed
 * sections, then the 335x805 expanded card holding one group per platform —
 * Instagram (Reels / Story / Post / Collab) and YouTube (Integrated Video) —
 * every deliverable a rupee field, closing on "Save Changes"; Barter
 * Commercials and Bank Details stay collapsed underneath.
 *
 * The Figma frame is 875pt but "Main" stacks 1437pt of accordion behind a clip,
 * so the canvas is sized to the real content bottom (Bank Details 1437 + Main's
 * 40pt bottom padding) and scrolls. Every number below is a raw frame
 * coordinate from the spec.
 */

/* ------------------------------- geometry -------------------------------- */
const FRAME_W = 375;
/** Scroll canvas: Main's content bottom (1437) + its 40pt bottom padding. */
const CANVAS_H = 1477;

const CARD_X = 20;
const CARD_W = 335;
const ROW_H = 74;

/** Expanded "Commercials" card. */
const EXP_Y = 460;
const EXP_H = 805;

/* Section-header offsets, relative to the card's own x/y (spec absolute minus
   the card origin). Identical for the expanded card and the collapsed rows. */
const TILE_OFF = 13; // 33-20, 473-460
const TILE_SIZE = 48;
const LABEL_X = 77; // 97-20
const LABEL_Y = 27.5; // 487.5-460
const LABEL_W = 189;
const DISC_X = 282; // 302-20
const DISC_Y = 19; // 479-460
const DISC_SIZE = 36;

/* Rate-card field. The 301pt card sits at x=35 with 20pt padding and a 1pt
   border, so its text node starts at 56 and the writable run is 259pt. */
const FIELD_X = 35;
const FIELD_W = 301;
const FIELD_H = 52;
const FIELD_TEXT_X = 56;
const FIELD_TEXT_DY = 17; // 654-637
const FIELD_INNER_W = 259;
const CAPTION_X = 39;
const CAPTION_W = 297;

/* Platform header — 44x44 r14 glass tile at x=35 with the glyph centred. */
const GLYPH_X = 46;
const GLYPH_W = 22;
const PLATFORM_NAME_X = 95;

/* --------------------------- spec colour tokens --------------------------- */
const LABEL_INK = "#111827";
const TITLE_INK = "#1D1D1F";
const BACK_INK = "#1C1C1E";
const CHEV_INK = "#6B7280";
const CAPTION_INK = "#6B7280";
const PLATFORM_INK = "#1F1F1F";
const GLYPH_INK = "#222222";
const GLASS_55 = "rgba(255,255,255,0.55)";
const GLASS_60 = "rgba(255,255,255,0.6)";
const GLASS_65 = "rgba(255,255,255,0.65)";
const GLASS_80 = "rgba(255,255,255,0.8)";
const GLASS_85 = "rgba(255,255,255,0.85)";
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
type IconName = ComponentProps<typeof Ionicons>["name"];

interface SectionSpec {
  key: string;
  /** Frame-space top edge of the row card. */
  y: number;
  /** "Background+Shadow" tile fill. */
  tile: string;
  /** Tile glyph stroke colour. */
  ink: string;
  icon: IconName;
  label: string;
  /** Sibling route, where one exists. Otherwise the row returns to the list. */
  href?: string;
}

/** The six sections that stay collapsed around the open Commercials card. */
const SECTIONS: SectionSpec[] = [
  {
    key: "basics",
    y: 116,
    tile: "#F3E8FF",
    ink: "#9333EA",
    icon: "person-outline",
    label: "Basics",
    href: "/profile/personal-information/basics",
  },
  { key: "language", y: 202, tile: "#DBEAFE", ink: "#2563EB", icon: "globe-outline", label: "Language" },
  { key: "address", y: 288, tile: "#CCFBF1", ink: "#0D9488", icon: "location-outline", label: "Address" },
  { key: "measurements", y: 374, tile: "#FFEDD5", ink: "#EA580C", icon: "resize-outline", label: "Measurements" },
  { key: "barter", y: 1277, tile: "#FCE7F3", ink: "#DB2777", icon: "gift-outline", label: "Barter Commercials" },
  {
    key: "bank",
    y: 1363,
    tile: "#E0E7FF",
    ink: "#4F46E5",
    icon: "business-outline",
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
  icon: IconName;
  label: string;
  expanded?: boolean;
}) {
  return (
    <>
      {/* Background+Shadow — 48x48 r20 icon tile. */}
      <Abs
        x={TILE_OFF}
        y={TILE_OFF}
        w={TILE_SIZE}
        h={TILE_SIZE}
        radius={20}
        bg={tile}
        center
        style={styles.tileShadow}
      >
        <Ionicons name={icon} size={24} color={ink} />
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

/* ------------------------------- rate card -------------------------------- */
interface Deliverable {
  key: string;
  /** Spec caption above the field. */
  label: string;
  /** Frame-space top edge of the caption and of the 52pt field. */
  labelY: number;
  fieldY: number;
  /** Share of the creator's base rate this format carries — see `priceFor`. */
  weight: number;
}

interface PlatformGroup {
  key: string;
  /** Spec text of the group heading and of its 44x44 tile glyph. */
  name: string;
  glyph: string;
  tileY: number;
  glyphY: number;
  nameY: number;
  nameW: number;
  deliverables: Deliverable[];
}

/** The two per-platform groups, at the coordinates the spec authors them. */
const PLATFORMS: PlatformGroup[] = [
  {
    key: "instagram",
    name: "Instagram",
    glyph: "\u{1F4F7}",
    tileY: 551,
    glyphY: 561.5,
    nameY: 561,
    nameW: 96,
    deliverables: [
      { key: "reels", label: "Reels", labelY: 613, fieldY: 637, weight: 1 },
      { key: "story", label: "Story", labelY: 707, fieldY: 731, weight: 0.4 },
      { key: "post", label: "Post", labelY: 801, fieldY: 825, weight: 0.7 },
      { key: "collab", label: "Collab", labelY: 895, fieldY: 919, weight: 1 },
    ],
  },
  {
    key: "youtube",
    name: "YouTube",
    glyph: "\u{1F4F7}",
    tileY: 1009,
    glyphY: 1019.5,
    nameY: 1019,
    nameW: 83,
    deliverables: [
      { key: "integrated", label: "Integrated Video", labelY: 1071, fieldY: 1095, weight: 1 },
    ],
  },
];

/** Placeholder authored on every field — two spaces after the rupee sign. */
const PRICE_HINT = "₹  e.g. 5000";

const digitsOf = (s: string) => s.replace(/[^0-9]/g, "");

/* --------------------------------- screen --------------------------------- */
export default function PersonalInformationCommercials() {
  const router = useRouter();
  const { data: me } = useMe();
  const { data: creators } = useCreators();
  const save = useUpdate<Creator>("creators");

  /* Creator carries no rate-card columns, so the paid rates are derived from
     the record's real economics (cpv x avg views) weighted per format — the
     same derivation the web creator-detail page uses, so the two never drift. */
  const roster = creators ?? [];
  const creator = roster.find((c) => c.name === me?.name) ?? roster[0];
  const base = creator ? creator.cpv * creator.avgViews : 0;
  const priceFor = (weight: number) =>
    base > 0 ? Math.max(0, Math.round((base * weight) / 500) * 500) : 0;

  /* Edits are held as overrides so each field shows the live rate the moment
     /creators lands and falls back to the spec placeholder until then —
     no effect, and the geometry never moves. */
  const [draft, setDraft] = useState<Record<string, string>>({});

  const priceOf = (d: Deliverable) => {
    const override = draft[d.key];
    if (override !== undefined) return override;
    const live = priceFor(d.weight);
    return live > 0 ? inr(live) : "";
  };

  const setPrice = (key: string, next: string) => {
    const digits = digitsOf(next);
    setDraft((d) => ({ ...d, [key]: digits ? inr(Number(digits)) : "" }));
  };

  /* Reels is the headline paid rate (weight 1), so saving inverts the base
     derivation and writes the creator's cost-per-view back. */
  const onSave = () => {
    const reels = PLATFORMS[0].deliverables[0];
    const rate = Number(digitsOf(priceOf(reels)));
    if (!creator || !creator.avgViews || !rate) {
      router.back();
      return;
    }
    save.mutate(
      { id: creator.id, data: { cpv: rate / creator.avgViews } },
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
        <Ionicons name="chevron-back" size={20} color={BACK_INK} />
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

      {/* ==================== Commercials (expanded, 805pt) =================== */}
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
        <SectionHead tile="#D1FAE5" ink="#059669" icon="cash-outline" label="Commercials" expanded />
      </Pressable>

      {/* ------------------------ per-platform groups ----------------------- */}
      {PLATFORMS.map((platform) => (
        <Fragment key={platform.key}>
          {/* Overlay+Shadow — 44x44 r14 glass tile carrying the platform glyph. */}
          <Abs
            x={FIELD_X}
            y={platform.tileY}
            w={44}
            h={44}
            radius={14}
            bg={GLASS_85}
            style={styles.platformTileShadow}
          />
          <Txt
            x={GLYPH_X}
            y={platform.glyphY}
            w={GLYPH_W}
            size={22}
            font="inter"
            color={GLYPH_INK}
            lineHeight={26.62}
            align="center"
          >
            {platform.glyph}
          </Txt>
          <Txt
            x={PLATFORM_NAME_X}
            y={platform.nameY}
            w={platform.nameW}
            size={20}
            weight="medium"
            font="inter"
            color={PLATFORM_INK}
            lineHeight={24.2}
            numberOfLines={1}
          >
            {platform.name}
          </Txt>

          {platform.deliverables.map((d) => (
            <Fragment key={d.key}>
              {/* Label — Inter 600 13 / 15.73, indented 4pt inside the group. */}
              <Txt
                x={CAPTION_X}
                y={d.labelY}
                w={CAPTION_W}
                size={13}
                weight="semibold"
                font="inter"
                color={CAPTION_INK}
                lineHeight={15.73}
                numberOfLines={1}
              >
                {d.label}
              </Txt>

              {/* Overlay+Border+Shadow — 301x52 r20 rupee field. */}
              <Abs
                x={FIELD_X}
                y={d.fieldY}
                w={FIELD_W}
                h={FIELD_H}
                radius={20}
                bg={GLASS_80}
                border={HAIRLINE_90}
                borderWidth={1}
                style={styles.fieldShadow}
              />
              <TextInput
                value={priceOf(d)}
                onChangeText={(v) => setPrice(d.key, v)}
                placeholder={PRICE_HINT}
                placeholderTextColor={LABEL_INK}
                keyboardType="number-pad"
                selectionColor={LABEL_INK}
                style={[
                  styles.input,
                  { left: FIELD_TEXT_X, top: d.fieldY + FIELD_TEXT_DY, width: FIELD_INNER_W },
                ]}
              />
            </Fragment>
          ))}
        </Fragment>
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

  /* Platform tile — #FFFFFF @85% with a 14pt shadow at 0,6. */
  platformTileShadow: {
    shadowColor: "#000000",
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },

  /* Overlay+Border+Shadow — the drop shadow plus the 2pt inner shadow the
     spec paints inside each field, approximated with a single soft shadow. */
  fieldShadow: {
    shadowColor: "#000000",
    shadowOpacity: 0.02,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 1,
  },

  /* Field value — Inter 500 15 / 18.15, #111827, on the spec's 18pt text box. */
  input: {
    position: "absolute",
    height: 18,
    padding: 0,
    fontFamily: fonts.interMedium,
    fontSize: 15,
    color: LABEL_INK,
    textAlignVertical: "center",
    includeFontPadding: false,
  },

  cta: {
    position: "absolute",
    left: 37,
    top: 1181,
    width: FIELD_W,
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
