import type { ComponentProps } from "react";
import { useState } from "react";
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
import { useMe, useUpdate, type User } from "../../../../src/api/hooks";

/**
 * Personal Information — Basics (expanded) — Figma 7358:27969.
 *
 * The Edit Profile accordion with the first section open: a glass header
 * ("Personal Information"), the 335x602 "Basics (Expanded)" card holding the
 * First/Last Name pair, the multiline Bio, Email, Phone and the "Save Changes"
 * CTA, then the remaining six sections collapsed to 335x74 rows below.
 *
 * The Figma frame is 875pt but its "Main" frame stacks 1234pt of accordion
 * content behind a clip, so the canvas is sized to the real content bottom
 * (Bank Details row 1234 + Main's 40pt bottom padding) and scrolls. Every
 * coordinate below is a raw frame coordinate from the spec.
 */

/* ------------------------------- geometry -------------------------------- */
const FRAME_W = 375;
/** Scroll canvas: Main's content bottom (1234) + its 40pt bottom padding. */
const CANVAS_H = 1274;

const CARD_X = 20;
const CARD_W = 335;

/** Expanded "Basics" card. */
const EXP_Y = 116;
const EXP_H = 602;

/** Collapsed rows sit at 730, 816, 902, 988, 1074, 1160 — 74pt row + 12pt gap. */
const ROW_H = 74;
const ROW_Y0 = 730;
const ROW_STEP = 86;

/* Section-header offsets, relative to the card's own x/y (spec absolute minus
   the card origin). Identical for the expanded card and the collapsed rows. */
const TILE_OFF = 13; // 33-20, 743-730
const TILE_SIZE = 48;
const LABEL_X = 77; // 97-20
const LABEL_Y = 27.5; // 757.5-730
const LABEL_W = 189;
const DISC_X = 282; // 302-20
const DISC_Y = 19; // 749-730
const DISC_SIZE = 36;

/* Field-card interior. Spec text starts at 58 = 37 + 20pt padding + 1pt border,
   so a full-width 301pt card leaves 259pt and a 144.5pt half-card 102.5pt. */
const FIELD_TEXT_X = 58;
const FIELD_W_FULL = 301;
const FIELD_W_HALF = 144.5;
const INNER_W_FULL = 259;
const INNER_W_HALF = 102.5;
const PILL_H = 53;

/* --------------------------- spec colour tokens --------------------------- */
const LABEL_INK = "#111827";
const TITLE_INK = "#1D1D1F";
const BACK_INK = "#1C1C1E";
const CHEV_INK = "#6B7280";
const CAPTION_INK = "#6B7280";
const GLASS_55 = "rgba(255,255,255,0.55)";
const GLASS_60 = "rgba(255,255,255,0.6)";
const GLASS_65 = "rgba(255,255,255,0.65)";
const GLASS_80 = "rgba(255,255,255,0.8)";
const HAIRLINE_60 = "rgba(255,255,255,0.6)";
const HAIRLINE_90 = "rgba(255,255,255,0.9)";
const CTA_BG = "#312B28";

/** The four prefilled Bio lines, exactly as authored in the spec. */
const BIO_SPEC =
  "Creative storyteller & lifestyle\ncontent creator. Sharing my journey\nthrough fashion, travel, and\neveryday moments. ✨";

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

/** The six sections that stay collapsed below the open Basics card. */
const SECTIONS: SectionSpec[] = [
  { key: "language", y: ROW_Y0, tile: "#DBEAFE", ink: "#2563EB", icon: "globe-outline", label: "Language" },
  { key: "address", y: ROW_Y0 + ROW_STEP, tile: "#CCFBF1", ink: "#0D9488", icon: "location-outline", label: "Address" },
  { key: "measurements", y: ROW_Y0 + ROW_STEP * 2, tile: "#FFEDD5", ink: "#EA580C", icon: "resize-outline", label: "Measurements" },
  { key: "commercials", y: ROW_Y0 + ROW_STEP * 3, tile: "#D1FAE5", ink: "#059669", icon: "cash-outline", label: "Commercials" },
  { key: "barter", y: ROW_Y0 + ROW_STEP * 4, tile: "#FCE7F3", ink: "#DB2777", icon: "gift-outline", label: "Barter Commercials" },
  {
    key: "bank",
    y: ROW_Y0 + ROW_STEP * 5,
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

/* ------------------------------ form fields ------------------------------- */
/** The caption above a field — Inter 600 13 / 15.73, indented 16pt. */
function Caption({ x, y, w, children }: { x: number; y: number; w: number; children: string }) {
  return (
    <Txt x={x} y={y} w={w} size={13} weight="semibold" font="inter" color={CAPTION_INK} lineHeight={15.73}>
      {children}
    </Txt>
  );
}

/** A 53pt r100 glass pill wrapping a single-line value. */
function PillField({
  x,
  y,
  w,
  textX,
  innerW,
  value,
  onChange,
  keyboard,
}: {
  x: number;
  y: number;
  w: number;
  textX: number;
  innerW: number;
  value: string;
  onChange: (next: string) => void;
  keyboard?: "email-address" | "phone-pad";
}) {
  return (
    <>
      <Abs
        x={x}
        y={y}
        w={w}
        h={PILL_H}
        radius={100}
        bg={GLASS_80}
        border={HAIRLINE_90}
        borderWidth={1}
        style={styles.fieldShadow}
      />
      <TextInput
        value={value}
        onChangeText={onChange}
        keyboardType={keyboard}
        autoCapitalize={keyboard === "email-address" ? "none" : "words"}
        selectionColor={LABEL_INK}
        style={[styles.input, { left: textX, top: y + 1, width: innerW, height: PILL_H - 2 }]}
      />
    </>
  );
}

/* --------------------------------- screen --------------------------------- */
export default function PersonalInformationBasics() {
  const router = useRouter();
  const { data: me } = useMe();
  const save = useUpdate<User>("users");

  /* The API models the account as one `name`, so the first token is the first
     name and the remainder the last — the same split the web profile uses. */
  const parts = (me?.name ?? "").trim().split(/\s+/).filter(Boolean);
  const liveFirst = parts[0] ?? "Sophia";
  const liveLast = parts.slice(1).join(" ") || "Roy";

  /* Edits are held as overrides so the fields fall back to the spec values
     while /auth/me is in flight and adopt the live record the moment it lands,
     without an effect and without the geometry ever moving. */
  const [draft, setDraft] = useState<{
    firstName?: string;
    lastName?: string;
    bio?: string;
    email?: string;
    phone?: string;
  }>({});

  const firstName = draft.firstName ?? liveFirst;
  const lastName = draft.lastName ?? liveLast;
  const bio = draft.bio ?? BIO_SPEC;
  const email = draft.email ?? me?.email ?? "sophia@socyio.com";
  const phone = draft.phone ?? me?.phone ?? "+91 98765 43210";

  const onSave = () => {
    if (!me) {
      router.back();
      return;
    }
    save.mutate(
      { id: me.id, data: { name: `${firstName} ${lastName}`.trim(), email, phone } },
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

      {/* ======================= Basics (expanded, 602pt) ==================== */}
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
        <SectionHead tile="#F3E8FF" ink="#9333EA" icon="person-outline" label="Basics" expanded />
      </Pressable>

      {/* HorizontalBorder — 1pt #FFFFFF @60% rule under the section header. */}
      <Abs x={33} y={181} w={309} h={1} bg={HAIRLINE_60} />

      {/* ------------------------ First / Last Name ------------------------- */}
      <Caption x={53} y={198} w={128.5}>
        First Name
      </Caption>
      <PillField
        x={37}
        y={222}
        w={FIELD_W_HALF}
        textX={FIELD_TEXT_X}
        innerW={INNER_W_HALF}
        value={firstName}
        onChange={(v) => setDraft((d) => ({ ...d, firstName: v }))}
      />

      <Caption x={209.5} y={198} w={128.5}>
        Last Name
      </Caption>
      <PillField
        x={193.5}
        y={222}
        w={FIELD_W_HALF}
        textX={214.5}
        innerW={INNER_W_HALF}
        value={lastName}
        onChange={(v) => setDraft((d) => ({ ...d, lastName: v }))}
      />

      {/* ------------------------------- Bio -------------------------------- */}
      <Caption x={53} y={291} w={285}>
        Bio
      </Caption>
      <Abs
        x={37}
        y={315}
        w={FIELD_W_FULL}
        h={124}
        radius={20}
        bg={GLASS_80}
        border={HAIRLINE_90}
        borderWidth={1}
        style={styles.fieldShadow}
      />
      <TextInput
        value={bio}
        onChangeText={(v) => setDraft((d) => ({ ...d, bio: v }))}
        multiline
        selectionColor={LABEL_INK}
        style={[styles.input, styles.bio]}
      />

      {/* ------------------------------ Email ------------------------------- */}
      <Caption x={53} y={455} w={285}>
        Email
      </Caption>
      <PillField
        x={37}
        y={479}
        w={FIELD_W_FULL}
        textX={FIELD_TEXT_X}
        innerW={INNER_W_FULL}
        value={email}
        onChange={(v) => setDraft((d) => ({ ...d, email: v }))}
        keyboard="email-address"
      />

      {/* ------------------------------ Phone ------------------------------- */}
      <Caption x={53} y={548} w={285}>
        Phone
      </Caption>
      <PillField
        x={37}
        y={572}
        w={FIELD_W_FULL}
        textX={FIELD_TEXT_X}
        innerW={INNER_W_FULL}
        value={phone}
        onChange={(v) => setDraft((d) => ({ ...d, phone: v }))}
        keyboard="phone-pad"
      />

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
  /* Bio — 256.56x90 of Inter 500 15 / 22.5, top-aligned in its 124pt card. */
  bio: {
    left: FIELD_TEXT_X,
    top: 332,
    width: INNER_W_FULL,
    height: 90,
    lineHeight: 22.5,
    textAlignVertical: "top",
  },

  cta: {
    position: "absolute",
    left: 37,
    top: 649,
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
