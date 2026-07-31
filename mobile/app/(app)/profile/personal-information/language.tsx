import { useState } from "react";
import type { ComponentProps } from "react";
import { Pressable, StyleSheet, TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Svg, {
  Defs,
  LinearGradient as SvgLinear,
  RadialGradient,
  Rect,
  Stop,
} from "react-native-svg";
import { Abs, Screen, Txt } from "../../../../src/ui/Frame";
import { useCreate, useList, useRemove, useUpdate } from "../../../../src/api/hooks";
import { fonts } from "../../../../src/theme";

/**
 * Personal Information — Language — Figma 7358:28127 "personal information".
 *
 * The Edit Profile accordion with the Language section expanded: a glass header
 * ("Personal Information"), the collapsed 335x74 section rows, and the 745pt
 * Language card holding the "Search languages..." field, the "Add Language"
 * button, the POPULAR quick-pick chips, the "Your Languages" cards (code
 * avatar, name, remove disc, five-segment PROFICIENCY meter) and the
 * "Save Changes" CTA.
 *
 * The Figma frame is 875pt but its "Main" frame clips 1271pt of stacked
 * accordion content, so the canvas is sized to the real content bottom (Bank
 * Details 1303+74, plus Main's 40pt bottom padding) and scrolls. All
 * coordinates below are raw frame coordinates from the spec.
 */

/* ------------------------------- geometry -------------------------------- */
const FRAME_W = 375;
/** Scroll canvas: Main's content bottom (1377) + its 40pt bottom padding. */
const CANVAS_H = 1417;

const ROW_X = 20;
const ROW_W = 335;
const ROW_H = 74;

/* Row-relative offsets (spec absolute minus the row's own x/y). */
const TILE_OFF = 13; // 33-20, 129-116
const TILE_SIZE = 48;
const LABEL_X = 77; // 97-20
const LABEL_Y = 27.5; // 143.5-116
const LABEL_W = 189;
const DISC_X = 282; // 302-20
const DISC_Y = 19; // 135-116
const DISC_SIZE = 36;

/** Expanded "Language" card. */
const EXP_Y = 202;
const EXP_H = 745;

/** "Your Languages" cards: 301x121, first at 579, 20pt gap. */
const CARD_X = 37;
const CARD_W = 301;
const CARD_H = 121;
const CARD_Y0 = 579;
const CARD_STEP = 141;
/** The expanded card clips at the Save CTA, so two cards fit its 262pt list. */
const MAX_CARDS = 2;
/** Proficiency meter: five 28x8 pills, 6pt apart, card-relative. */
const SEG_X = [116, 150, 184, 218, 252];
const SEG_Y = 91.5; // 670.5-579

/* --------------------------- spec colour tokens --------------------------- */
const LABEL_INK = "#111827";
const TITLE_INK = "#1D1D1F";
const BACK_INK = "#1C1C1E";
const CAPTION_INK = "#6B7280";
const CHIP_INK = "#4B5563";
const MUTED_INK = "#9CA3AF";
const ACCENT_INK = "#7C3AED";
const ACCENT_EDGE = "rgba(167,139,250,0.6)";
const GLASS_50 = "rgba(255,255,255,0.5)";
const GLASS_55 = "rgba(255,255,255,0.55)";
const GLASS_60 = "rgba(255,255,255,0.6)";
const GLASS_65 = "rgba(255,255,255,0.65)";
const GLASS_80 = "rgba(255,255,255,0.8)";
const HAIRLINE_60 = "rgba(255,255,255,0.6)";
const HAIRLINE_90 = "rgba(255,255,255,0.9)";
const EMPTY_SEG = "rgba(0,0,0,0.06)";
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
  /** Sections that already own a screen deep-link instead of collapsing back. */
  path?: string;
}

/** The collapsed sections — Basics above the expanded card, the rest below. */
const SECTIONS: SectionSpec[] = [
  { key: "basics", y: 116, tile: "#F3E8FF", ink: "#9333EA", icon: "person-outline", label: "Basics" },
  { key: "address", y: 959, tile: "#CCFBF1", ink: "#0D9488", icon: "location-outline", label: "Address" },
  { key: "measurements", y: 1045, tile: "#FFEDD5", ink: "#EA580C", icon: "resize-outline", label: "Measurements" },
  { key: "commercials", y: 1131, tile: "#D1FAE5", ink: "#059669", icon: "cash-outline", label: "Commercials" },
  { key: "barter", y: 1217, tile: "#FCE7F3", ink: "#DB2777", icon: "gift-outline", label: "Barter Commercials" },
  {
    key: "bank",
    y: 1303,
    tile: "#E0E7FF",
    ink: "#4F46E5",
    icon: "business-outline",
    label: "Bank Details",
    path: "/payments/payout-bank-details",
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
      <Abs x={TILE_OFF} y={TILE_OFF} w={TILE_SIZE} h={TILE_SIZE} radius={20} bg={tile} center style={styles.tileShadow}>
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
      <Abs x={DISC_X} y={DISC_Y} w={DISC_SIZE} h={DISC_SIZE} radius={18} bg={GLASS_60} center style={styles.discShadow}>
        <Ionicons name={expanded ? "chevron-up" : "chevron-down"} size={20} color={CAPTION_INK} />
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

/* ------------------------------ popular chips ----------------------------- */
interface ChipSpec {
  name: string;
  x: number;
  y: number;
  w: number;
  /** Label width; the chip text sits 17/9 inside every pill. */
  tw: number;
}

/** POPULAR quick-picks — two rows of 34pt pills. */
const POPULAR: ChipSpec[] = [
  { name: "Hindi", x: 37, y: 435, w: 66.58, tw: 32.58 },
  { name: "English", x: 111.58, y: 435, w: 79.88, tw: 45.88 },
  { name: "Bengali", x: 199.45, y: 435, w: 80.63, tw: 46.63 },
  { name: "Tamil", x: 37, y: 477, w: 67.61, tw: 33.61 },
];

/* ---------------------------- language records ---------------------------- */
interface ProfileLanguage {
  id: string;
  name: string;
  /** Two-letter code shown in the card avatar ("EN"). */
  code?: string;
  /** 1–5 — the number of filled proficiency segments. */
  proficiency?: number;
}

interface CardTheme {
  tile: string;
  ink: string;
  bar: readonly [string, string];
}

/** Card 0 is the spec's blue "English Card", card 1 the pink "Hindi Card". */
const CARD_THEMES: CardTheme[] = [
  { tile: "rgba(219,234,254,0.6)", ink: "#2563EB", bar: ["#60A5FA", "#3B82F6"] },
  { tile: "rgba(252,231,243,0.6)", ink: "#DB2777", bar: ["#F472B6", "#EC4899"] },
];

/** Stands in while /languages is loading or before the resource exists. */
const SPEC_LANGUAGES: ProfileLanguage[] = [
  { id: "spec-en", name: "English", code: "EN", proficiency: 5 },
  { id: "spec-hi", name: "Hindi", code: "HI", proficiency: 4 },
];

/** Rows added in this session have no server id yet. */
const isLocal = (id: string) => id.startsWith("spec-") || id.startsWith("local-");

const codeOf = (lang: ProfileLanguage) =>
  (lang.code ?? lang.name.slice(0, 2)).toUpperCase();

/** One 301x121 glass card: code avatar, name, remove disc, proficiency meter. */
function LanguageCard({
  y,
  theme,
  code,
  name,
  level,
  onRemove,
  onLevel,
}: {
  y: number;
  theme: CardTheme;
  code: string;
  name: string;
  level: number;
  onRemove: () => void;
  onLevel: (next: number) => void;
}) {
  return (
    <Abs
      x={CARD_X}
      y={y}
      w={CARD_W}
      h={CARD_H}
      radius={24}
      bg={GLASS_60}
      border={HAIRLINE_90}
      borderWidth={1}
      style={styles.cardShadow}
    >
      {/* Overlay+Border — 48x48 r16 code avatar. */}
      <Abs x={21} y={21} w={48} h={48} radius={16} bg={theme.tile} border={GLASS_80} borderWidth={1} center>
        <Txt size={18} weight="bold" font="inter" color={theme.ink} lineHeight={21.78}>
          {code}
        </Txt>
      </Abs>

      {/* Name — bounded by the remove disc at 285 (248 card-relative). */}
      <Txt
        x={85}
        y={35}
        w={163}
        size={16}
        weight="semibold"
        font="inter"
        color={LABEL_INK}
        lineHeight={19.36}
        numberOfLines={1}
      >
        {name}
      </Txt>

      {/* 32x32 r16 remove disc. */}
      <Pressable onPress={onRemove} style={({ pressed }) => [styles.cardRemove, pressed && styles.pressed]}>
        <Ionicons name="close-outline" size={16} color={MUTED_INK} />
      </Pressable>

      <Txt x={21} y={85} w={81.13} size={12} weight="semibold" font="inter" color={CAPTION_INK} lineHeight={14.52}>
        PROFICIENCY
      </Txt>

      {SEG_X.map((sx, i) => (
        <Pressable
          key={sx}
          onPress={() => onLevel(i + 1)}
          hitSlop={10}
          style={{ position: "absolute", left: sx, top: SEG_Y, width: 28, height: 8 }}
        >
          {i < level ? (
            <LinearGradient
              colors={theme.bar}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={styles.seg}
            />
          ) : (
            <View style={[styles.seg, styles.segEmpty]} />
          )}
        </Pressable>
      ))}
    </Abs>
  );
}

/* --------------------------------- screen --------------------------------- */
export default function PersonalInformationLanguage() {
  const router = useRouter();

  /* The languages resource is not modelled server-side yet, so the spec's
     English/Hindi pair stands in until /languages returns rows. */
  const { data } = useList<ProfileLanguage>("languages");
  const create = useCreate<ProfileLanguage>("languages");
  const update = useUpdate<ProfileLanguage>("languages");
  const remove = useRemove("languages");

  /* Edits stay local as well as going to the API, so the meter and the cards
     respond immediately whether or not the resource is live. */
  const [draft, setDraft] = useState<ProfileLanguage[] | null>(null);
  const languages = draft ?? (data && data.length > 0 ? data : SPEC_LANGUAGES);

  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();

  const addLanguage = (name: string) => {
    const clean = name.trim();
    if (!clean) return;
    if (languages.some((l) => l.name.toLowerCase() === clean.toLowerCase())) return;
    const code = clean.slice(0, 2).toUpperCase();
    setDraft([...languages, { id: `local-${Date.now()}`, name: clean, code, proficiency: 3 }]);
    setQuery("");
    create.mutate({ name: clean, code, proficiency: 3 });
  };

  const setProficiency = (id: string, level: number) => {
    setDraft(languages.map((l) => (l.id === id ? { ...l, proficiency: level } : l)));
    if (!isLocal(id)) update.mutate({ id, data: { proficiency: level } });
  };

  const removeLanguage = (id: string) => {
    setDraft(languages.filter((l) => l.id !== id));
    if (!isLocal(id)) remove.mutate(id);
  };

  const chips = POPULAR.filter((c) => !q || c.name.toLowerCase().includes(q));

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

      {/* ======================= Main — collapsed sections ==================== */}
      {SECTIONS.map((section) => (
        <CollapsedRow
          key={section.key}
          section={section}
          onPress={() => (section.path ? router.push(section.path) : router.back())}
        />
      ))}

      {/* ====================== Language (expanded, 745pt) ==================== */}
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
        <SectionHead tile="#DBEAFE" ink="#2563EB" icon="language-outline" label="Language" expanded />
      </Pressable>

      {/* HorizontalBorder — 1pt white hairline above the section body. */}
      <Abs x={33} y={267} w={309} h={1} bg={HAIRLINE_60} />

      {/* ------------------------------ search ------------------------------ */}
      <Abs
        x={37}
        y={284}
        w={301}
        h={47}
        radius={20}
        bg={GLASS_80}
        border={HAIRLINE_90}
        borderWidth={1}
        style={styles.inputShadow}
      >
        <Abs x={16} y={14.5} w={18} h={18} center>
          <Ionicons name="search-outline" size={18} color={MUTED_INK} />
        </Abs>
        <TextInput
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={() => addLanguage(query)}
          placeholder="Search languages..."
          placeholderTextColor={MUTED_INK}
          returnKeyType="done"
          autoCorrect={false}
          style={styles.search}
        />
      </Abs>

      {/* ---------------------------- Add Language --------------------------- */}
      <Pressable
        onPress={() => addLanguage(query)}
        style={({ pressed }) => [styles.addButton, pressed && styles.pressed]}
      >
        <Abs x={85.05} y={15.5} w={18} h={18} center>
          <Ionicons name="add-outline" size={18} color={ACCENT_INK} />
        </Abs>
        <Txt
          x={111.05}
          y={15}
          w={104.89}
          size={15}
          weight="semibold"
          font="inter"
          color={ACCENT_INK}
          lineHeight={18.15}
          align="center"
        >
          Add Language
        </Txt>
      </Pressable>

      {/* ------------------------------ POPULAR ------------------------------ */}
      <Txt x={37} y={412} w={301} size={12} weight="semibold" font="inter" color={CAPTION_INK} lineHeight={14.52}>
        POPULAR
      </Txt>
      {chips.map((chip) => (
        <Pressable
          key={chip.name}
          onPress={() => addLanguage(chip.name)}
          style={({ pressed }) => [
            styles.chip,
            { left: chip.x, top: chip.y, width: chip.w },
            pressed && styles.pressed,
          ]}
        >
          <Txt
            x={17}
            y={9}
            w={chip.tw}
            size={13}
            weight="semibold"
            font="inter"
            color={CHIP_INK}
            lineHeight={15.73}
            align="center"
          >
            {chip.name}
          </Txt>
        </Pressable>
      ))}

      {/* --------------------------- Your Languages -------------------------- */}
      <Txt x={41} y={531} w={297} size={16} weight="semibold" font="inter" color={LABEL_INK} lineHeight={19.36}>
        Your Languages
      </Txt>

      {languages.slice(0, MAX_CARDS).map((lang, i) => (
        <LanguageCard
          key={lang.id}
          y={CARD_Y0 + i * CARD_STEP}
          theme={CARD_THEMES[i % CARD_THEMES.length]}
          code={codeOf(lang)}
          name={lang.name}
          level={lang.proficiency ?? 0}
          onRemove={() => removeLanguage(lang.id)}
          onLevel={(next) => setProficiency(lang.id, next)}
        />
      ))}

      {/* ------------------------------- CTA -------------------------------- */}
      <Pressable
        onPress={() => router.back()}
        style={({ pressed }) => [styles.cta, pressed && styles.pressed]}
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

  inputShadow: {
    shadowColor: "#000000",
    shadowOpacity: 0.02,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 1,
  },
  /* Placeholder sits at 82/299 in frame space — 45/15 inside the field. */
  search: {
    position: "absolute",
    left: 45,
    top: 14,
    width: 239,
    height: 19,
    padding: 0,
    fontFamily: fonts.interMedium,
    fontSize: 15,
    color: LABEL_INK,
  },

  addButton: {
    position: "absolute",
    left: 37,
    top: 347,
    width: 301,
    height: 49,
    borderRadius: 20,
    backgroundColor: GLASS_60,
    borderWidth: 1,
    borderColor: ACCENT_EDGE,
    borderStyle: "dashed",
  },

  chip: {
    position: "absolute",
    height: 34,
    borderRadius: 100,
    backgroundColor: GLASS_50,
    borderWidth: 1,
    borderColor: GLASS_80,
    shadowColor: "#000000",
    shadowOpacity: 0.02,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 1,
  },

  cardShadow: {
    shadowColor: "#000000",
    shadowOpacity: 0.04,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
    elevation: 2,
  },
  cardRemove: {
    position: "absolute",
    left: 248,
    top: 21,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: GLASS_50,
    borderWidth: 1,
    borderColor: GLASS_80,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000000",
    shadowOpacity: 0.02,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 1,
  },
  seg: { flex: 1, borderRadius: 4 },
  segEmpty: { backgroundColor: EMPTY_SEG },

  cta: {
    position: "absolute",
    left: 37,
    top: 870,
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
