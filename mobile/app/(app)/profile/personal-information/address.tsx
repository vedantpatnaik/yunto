import type { ComponentProps } from "react";
import { useState } from "react";
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
import { fonts } from "../../../../src/theme";
import { useCreators, useMe, useUpdate, type User } from "../../../../src/api/hooks";

/**
 * Personal Information — Address (expanded) — Figma 7358:28382.
 *
 * The Edit Profile accordion with the third section open: the glass header,
 * the "Basics" and "Language" rows collapsed above, the 335pt "Address" card
 * holding City, State, the Country/Pincode pair and the map preview, then the
 * remaining four sections collapsed below.
 *
 * The Figma frame is 875pt but its "Main" frame stacks the whole accordion
 * behind a clip, so — as on the sibling Basics route — the canvas is sized to
 * the real content bottom plus Main's 40pt bottom padding and scrolls.
 *
 * The 875 frame stops the Address card at 836 with no CTA inside it: the
 * "Frame 2147223246" that wraps the map is a 20pt-gap vertical stack whose
 * second child (the shared "Save Changes" button) is collapsed in this
 * variant. It is restored here with the sibling's exact geometry — a 301x56
 * r100 #312B28 pill, 8pt below the map's margin — which grows the card by
 * 74pt (548 -> 622) and pushes the four rows below it from 848/934/1020/1106
 * to 922/1008/1094/1180. Every other coordinate is raw from the spec.
 */

/* ------------------------------- geometry -------------------------------- */
const FRAME_W = 375;

const CARD_X = 20;
const CARD_W = 335;

/** Expanded "Address" card — spec 288x548, +74 for the restored CTA. */
const EXP_Y = 288;
const EXP_H = 622;

/** Collapsed rows: 74pt card + 12pt gap. */
const ROW_H = 74;
const ROW_STEP = 86;
/** First row below the expanded card — spec 848 + the card's 74pt growth. */
const ROW_BELOW_Y0 = 922;

/** Scroll canvas: last row bottom (1180+74) + Main's 40pt bottom padding. */
const CANVAS_H = 1294;

/* Section-header offsets, relative to the card's own x/y (spec absolute minus
   the card origin). Identical for the expanded card and the collapsed rows. */
const TILE_OFF = 13; // 33-20, 129-116
const TILE_SIZE = 48;
const LABEL_X = 77; // 97-20
const LABEL_Y = 27.5; // 143.5-116
const LABEL_W = 189;
const DISC_X = 282; // 302-20
const DISC_Y = 19; // 135-116
const DISC_SIZE = 36;

/* Field interior. Spec text starts at 58 = 37 + 20pt padding + 1pt border, so
   a field card leaves its width less 42pt for the value. */
const FIELD_TEXT_X = 58;
const FIELD_W_FULL = 301;
const FIELD_W_HALF = 142.5;
const FIELD_H = 52;
const FIELD_R = 20;

/* --------------------------- spec colour tokens --------------------------- */
const LABEL_INK = "#111827";
const TITLE_INK = "#1D1D1F";
const BACK_INK = "#1C1C1E";
const CHEV_INK = "#6B7280";
const CAPTION_INK = "#6B7280";
const PIN_INK = "#EC4899";
const GLASS_55 = "rgba(255,255,255,0.55)";
const GLASS_60 = "rgba(255,255,255,0.6)";
const GLASS_65 = "rgba(255,255,255,0.65)";
const GLASS_80 = "rgba(255,255,255,0.8)";
const GLASS_90 = "rgba(255,255,255,0.9)";
const HAIRLINE_60 = "rgba(255,255,255,0.6)";
const HAIRLINE_90 = "rgba(255,255,255,0.9)";
const CTA_BG = "#312B28";

/** Map Preview fill — #DBEAFE80 -> #D1FAE580 on the diagonal. */
const MAP_A = "rgba(219,234,254,0.5)";
const MAP_B = "rgba(209,250,229,0.5)";
/** The 5%-stop white edge bands painted over it, at 60% node opacity. */
const EDGE_ON = "rgba(255,255,255,0.6)";
const EDGE_OFF = "rgba(255,255,255,0)";

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

/** The six sections that stay collapsed around the open Address card. */
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
  { key: "language", y: 202, tile: "#DBEAFE", ink: "#2563EB", icon: "language-outline", label: "Language" },
  {
    key: "measurements",
    y: ROW_BELOW_Y0,
    tile: "#FFEDD5",
    ink: "#EA580C",
    icon: "resize-outline",
    label: "Measurements",
  },
  {
    key: "commercials",
    y: ROW_BELOW_Y0 + ROW_STEP,
    tile: "#D1FAE5",
    ink: "#059669",
    icon: "cash-outline",
    label: "Commercials",
  },
  {
    key: "barter",
    y: ROW_BELOW_Y0 + ROW_STEP * 2,
    tile: "#FCE7F3",
    ink: "#DB2777",
    icon: "gift-outline",
    label: "Barter Commercials",
  },
  {
    key: "bank",
    y: ROW_BELOW_Y0 + ROW_STEP * 3,
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

/* -------------------------------- record ---------------------------------- */
/**
 * The account row carries the single-line `address` the settings screens write
 * (User.address in the Prisma schema); the shared `User` type predates it, so
 * it is widened here rather than in the shared data layer.
 */
type Account = User & { address?: string };

/* ------------------------------ form fields ------------------------------- */
/** The caption above a field — Inter 600 13 / 15.73, indented 4pt in its row. */
function Caption({ x, y, w, children }: { x: number; y: number; w: number; children: string }) {
  return (
    <Txt x={x} y={y} w={w} size={13} weight="semibold" font="inter" color={CAPTION_INK} lineHeight={15.73}>
      {children}
    </Txt>
  );
}

/** A 52pt r20 glass card wrapping a single-line value. */
function Field({
  x,
  y,
  w,
  textX,
  value,
  onChange,
  keyboard,
}: {
  x: number;
  y: number;
  w: number;
  textX: number;
  value: string;
  onChange: (next: string) => void;
  keyboard?: "number-pad";
}) {
  return (
    <>
      <Abs
        x={x}
        y={y}
        w={w}
        h={FIELD_H}
        radius={FIELD_R}
        bg={GLASS_80}
        border={HAIRLINE_90}
        borderWidth={1}
        style={styles.fieldShadow}
      />
      <TextInput
        value={value}
        onChangeText={onChange}
        keyboardType={keyboard}
        autoCapitalize={keyboard ? "none" : "words"}
        selectionColor={LABEL_INK}
        style={[styles.input, { left: textX, top: y + 1, width: w - 42, height: FIELD_H - 2 }]}
      />
    </>
  );
}

/* --------------------------------- screen --------------------------------- */
export default function PersonalInformationAddress() {
  const router = useRouter();
  const { data: me } = useMe() as { data: Account | undefined };
  const { data: creators = [] } = useCreators();
  const save = useUpdate<Account>("users");

  /* The account carries the address as one line, so it is split on commas —
     the same "City, State, Country, Pincode" order the fields are authored in
     — and re-joined on save. The creator record's own `location` backs the
     city when the account line is still empty. */
  const parts = (me?.address ?? "").split(",").map((p) => p.trim());
  const creator = creators.find((c) => c.name === me?.name) ?? creators[0];

  /* Edits are held as overrides so the fields show the spec values while the
     record is in flight and adopt it the moment it lands, without an effect
     and without the geometry ever moving. */
  const [draft, setDraft] = useState<{
    city?: string;
    state?: string;
    country?: string;
    pincode?: string;
  }>({});

  const city = draft.city ?? (parts[0] || creator?.location) ?? "Mumbai";
  const state = draft.state ?? parts[1] ?? "Maharashtra";
  const country = draft.country ?? parts[2] ?? "India";
  const pincode = draft.pincode ?? parts[3] ?? "400050";

  const onSave = () => {
    if (!me) {
      router.back();
      return;
    }
    save.mutate(
      { id: me.id, data: { address: [city, state, country, pincode].join(", ") } },
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

      {/* ====================== Address (expanded, 622pt) ==================== */}
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
        <SectionHead tile="#CCFBF1" ink="#0D9488" icon="location-outline" label="Address" expanded />
      </Pressable>

      {/* HorizontalBorder — 1pt #FFFFFF @60% rule under the section header. */}
      <Abs x={33} y={353} w={309} h={1} bg={HAIRLINE_60} />

      {/* ------------------------------- City ------------------------------- */}
      <Caption x={41} y={370} w={297}>
        City
      </Caption>
      <Field
        x={37}
        y={394}
        w={FIELD_W_FULL}
        textX={FIELD_TEXT_X}
        value={city}
        onChange={(v) => setDraft((d) => ({ ...d, city: v }))}
      />

      {/* ------------------------------- State ------------------------------ */}
      <Caption x={41} y={462} w={297}>
        State
      </Caption>
      <Field
        x={37}
        y={486}
        w={FIELD_W_FULL}
        textX={FIELD_TEXT_X}
        value={state}
        onChange={(v) => setDraft((d) => ({ ...d, state: v }))}
      />

      {/* -------------------------- Country / Pincode ----------------------- */}
      <Caption x={41} y={554} w={138.5}>
        Country
      </Caption>
      <Field
        x={37}
        y={578}
        w={FIELD_W_HALF}
        textX={FIELD_TEXT_X}
        value={country}
        onChange={(v) => setDraft((d) => ({ ...d, country: v }))}
      />

      <Caption x={199.5} y={554} w={138.5}>
        Pincode
      </Caption>
      <Field
        x={195.5}
        y={578}
        w={FIELD_W_HALF}
        textX={216.5}
        value={pincode}
        onChange={(v) => setDraft((d) => ({ ...d, pincode: v }))}
        keyboard="number-pad"
      />

      {/* --------------------------- Map Preview ---------------------------- */}
      <Abs
        x={37}
        y={673}
        w={FIELD_W_FULL}
        h={140}
        radius={20}
        border={HAIRLINE_90}
        borderWidth={1}
        style={styles.clip}
      >
        <LinearGradient
          colors={[MAP_A, MAP_B]}
          start={{ x: 0.13, y: 0 }}
          end={{ x: 0.87, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        {/* Gradient — the 5%-stop white bands down the left and across the top. */}
        <Abs x={0} y={0} w={299} h={138} opacity={0.6}>
          <LinearGradient
            colors={[EDGE_ON, EDGE_OFF]}
            locations={[0.05, 0.05]}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={StyleSheet.absoluteFill}
          />
          <LinearGradient
            colors={[EDGE_ON, EDGE_OFF]}
            locations={[0.05, 0.05]}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
        </Abs>
      </Abs>

      {/* Overlay+Shadow+OverlayBlur — the 48x48 r24 pin puck, centred on the map. */}
      <Abs x={163.5} y={719} w={48} h={48} radius={24} bg={GLASS_90} center style={styles.pinShadow}>
        <Ionicons name="location-outline" size={24} color={PIN_INK} />
      </Abs>

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

      {/* =================== Main — the six collapsed rows =================== */}
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
  clip: { overflow: "hidden" },

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

  /* Overlay+Border+Shadow — the drop shadow plus the 2pt inner shadow the
     spec paints inside each field, approximated with a single soft shadow. */
  fieldShadow: {
    shadowColor: "#000000",
    shadowOpacity: 0.02,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 1,
  },

  /* Field value — Inter 500 15, #111827. Absolute so the input sits exactly
     where the spec's TEXT node does. */
  input: {
    position: "absolute",
    padding: 0,
    fontFamily: fonts.interMedium,
    fontSize: 15,
    color: LABEL_INK,
    textAlignVertical: "center",
    includeFontPadding: false,
  },

  pinShadow: {
    shadowColor: "#000000",
    shadowOpacity: 0.1,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },

  cta: {
    position: "absolute",
    left: 37,
    top: 841,
    width: FIELD_W_FULL,
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
