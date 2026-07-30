import type { ComponentProps } from "react";
import { Pressable, StyleSheet, View } from "react-native";
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
import { useMe, useUpdate, type User } from "../../../../src/api/hooks";

/**
 * Personal Information — Bank Details (expanded) — Figma 7358:29381.
 *
 * The Edit Profile accordion with the last section open: the glass header
 * ("Personal Information"), six collapsed 335x74 rows (Basics … Barter
 * Commercials) and the 335x739 "Bank Details" card holding the Verified
 * Account badge, the four read-only account fields, the IFSC/UPI pair, the
 * encryption reassurance strip and the "Save bank details" CTA.
 *
 * The Figma frame is 875pt but its "Main" frame stacks 1305pt of accordion
 * content behind a clip, so the canvas is sized to the real content bottom
 * (expanded card bottom 1371 + Main's 40pt bottom padding) and scrolls. Every
 * coordinate below is a raw frame coordinate from the spec.
 */

/* ------------------------------- geometry -------------------------------- */
const FRAME_W = 375;
/** Scroll canvas: the expanded card's bottom (1371) + Main's 40pt padding. */
const CANVAS_H = 1411;

const CARD_X = 20;
const CARD_W = 335;

/** Collapsed rows sit at 116, 202, 288, 374, 460, 546 — 74pt row + 12pt gap. */
const ROW_H = 74;
const ROW_Y0 = 116;
const ROW_STEP = 86;

/** Expanded "Bank Details" card — the seventh accordion slot. */
const EXP_Y = 632;
const EXP_H = 739;

/* Section-header offsets, relative to the card's own x/y (spec absolute minus
   the card origin). Identical for the expanded card and the collapsed rows. */
const TILE_OFF = 13; // 33-20, 645-632
const TILE_SIZE = 48;
const LABEL_X = 77; // 97-20
const LABEL_Y = 27.5; // 659.5-632
const LABEL_W = 189;
const DISC_X = 282; // 302-20
const DISC_Y = 19; // 651-632
const DISC_SIZE = 36;

/* Field-card interior. Spec text starts at 58 = 37 + 20pt padding + 1pt border,
   so a full-width 301pt card leaves 259pt and a 156pt half-card 114pt. */
const FIELD_X = 37;
const FIELD_TEXT_X = 58;
const FIELD_W_FULL = 301;
const INNER_W_FULL = 259;
const FIELD_W_HALF = 156;
const INNER_W_HALF = 114;
const FIELD_H = 72;
const HALF_H = 75;

/* --------------------------- spec colour tokens --------------------------- */
const LABEL_INK = "#111827";
const TITLE_INK = "#1D1D1F";
const BACK_INK = "#1C1C1E";
const CHEV_INK = "#6B7280";
const FIELD_LABEL_INK = "#8A8199";
const FIELD_VALUE_INK = "#1A1525";
const BADGE_INK = "#2E8B57";
const BADGE_LINE = "rgba(190,240,210,0.9)";
const NOTE_INK = "#6B627A";
const LOCK_INK = "#8A5A9A";
const GLASS_40 = "rgba(255,255,255,0.4)";
const GLASS_55 = "rgba(255,255,255,0.55)";
const GLASS_60 = "rgba(255,255,255,0.6)";
const GLASS_65 = "rgba(255,255,255,0.65)";
const GLASS_90 = "rgba(255,255,255,0.9)";
const HAIRLINE_60 = "rgba(255,255,255,0.6)";
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

/** The six sections that stay collapsed above the open Bank Details card. */
const SECTIONS: SectionSpec[] = [
  {
    key: "basics",
    y: ROW_Y0,
    tile: "#F3E8FF",
    ink: "#9333EA",
    icon: "person-outline",
    label: "Basics",
    href: "/profile/personal-information/basics",
  },
  { key: "language", y: ROW_Y0 + ROW_STEP, tile: "#DBEAFE", ink: "#2563EB", icon: "globe-outline", label: "Language" },
  { key: "address", y: ROW_Y0 + ROW_STEP * 2, tile: "#CCFBF1", ink: "#0D9488", icon: "location-outline", label: "Address" },
  { key: "measurements", y: ROW_Y0 + ROW_STEP * 3, tile: "#FFEDD5", ink: "#EA580C", icon: "resize-outline", label: "Measurements" },
  { key: "commercials", y: ROW_Y0 + ROW_STEP * 4, tile: "#D1FAE5", ink: "#059669", icon: "cash-outline", label: "Commercials" },
  { key: "barter", y: ROW_Y0 + ROW_STEP * 5, tile: "#FCE7F3", ink: "#DB2777", icon: "gift-outline", label: "Barter Commercials" },
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

/* ------------------------------ read-out cards ---------------------------- */
/**
 * One 301x72 glass card: an uppercase caption (Inter 700 12 / 14.52, +0.5) over
 * the value (Inter 500 14 / 16.94). `valueSpacing` carries the 2pt tracking the
 * masked account number is authored with.
 */
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
        x={FIELD_X}
        y={y}
        w={FIELD_W_FULL}
        h={FIELD_H}
        radius={20}
        bg={GLASS_60}
        border={HAIRLINE_90}
        borderWidth={1}
        style={styles.fieldShadow}
      />
      <Txt
        x={FIELD_TEXT_X}
        y={labelY}
        w={INNER_W_FULL}
        size={12}
        weight="bold"
        font="inter"
        color={FIELD_LABEL_INK}
        lineHeight={14.52}
        letterSpacing={0.5}
        numberOfLines={1}
      >
        {label}
      </Txt>
      <Txt
        x={FIELD_TEXT_X}
        y={valueY}
        w={INNER_W_FULL}
        size={14}
        weight="medium"
        font="inter"
        color={FIELD_VALUE_INK}
        lineHeight={16.94}
        letterSpacing={valueSpacing}
        numberOfLines={1}
      >
        {value}
      </Txt>
    </>
  );
}

/** One 156x75 half-width glass card — the IFSC CODE | UPI ID pair at y=1069. */
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
        w={FIELD_W_HALF}
        h={HALF_H}
        radius={20}
        bg={GLASS_60}
        border={HAIRLINE_90}
        borderWidth={1}
        style={styles.fieldShadow}
      />
      <Txt
        x={textX}
        y={1086}
        w={INNER_W_HALF}
        size={12}
        weight="bold"
        font="inter"
        color={FIELD_LABEL_INK}
        lineHeight={14.52}
        letterSpacing={0.5}
        numberOfLines={1}
      >
        {label}
      </Txt>
      <Txt
        x={textX}
        y={1107}
        w={INNER_W_HALF}
        size={14}
        weight="medium"
        font="inter"
        color={FIELD_VALUE_INK}
        lineHeight={16.94}
        numberOfLines={1}
      >
        {value}
      </Txt>
    </>
  );
}

/* --------------------------------- screen --------------------------------- */
export default function PersonalInformationBankDetails() {
  const router = useRouter();
  const { data: me } = useMe();
  const saveBankDetails = useUpdate<User>("users");

  /* The account holder is the signed-in creator, so it reads off /auth/me and
     falls back to the spec value while the request is in flight — no effect,
     and the geometry never moves. The remaining fields (bank, masked account,
     IFSC, UPI) have no column on the API yet and stay at their spec values. */
  const holderName = me?.name ?? "Sophia Roy";
  const bankName = "HDFC Bank";
  const accountNumberMasked = "•••• •••• •••• 4589";
  const ifsc = "HDFC0001234";
  const upiId = "sohpia@okhdfc";

  const onSave = () => {
    if (!me) {
      router.back();
      return;
    }
    saveBankDetails.mutate(
      { id: me.id, data: { name: holderName } },
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

      {/* ================== Main — the six collapsed rows ==================== */}
      {SECTIONS.map((section) => (
        <CollapsedRow
          key={section.key}
          section={section}
          onPress={() => (section.href ? router.push(section.href) : router.back())}
        />
      ))}

      {/* ==================== Bank Details (expanded, 739pt) ================= */}
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
        <SectionHead tile="#E0E7FF" ink="#4F46E5" icon="business-outline" label="Bank Details" expanded />
      </Pressable>

      {/* ------------------------ Verified Account badge -------------------- */}
      <LinearGradient
        colors={["rgba(230,250,240,0.9)", "rgba(210,245,225,0.8)"]}
        start={{ x: 0.2, y: 0 }}
        end={{ x: 0.8, y: 1 }}
        style={styles.badge}
      />
      <Abs x={116} y={744} w={18} h={18} center>
        <Ionicons name="shield-checkmark-outline" size={18} color={BADGE_INK} />
      </Abs>
      <Txt
        x={142}
        y={744.5}
        w={117}
        size={14}
        weight="semibold"
        font="inter"
        color={BADGE_INK}
        lineHeight={16.94}
        letterSpacing={0.2}
        numberOfLines={1}
      >
        Verified Account
      </Txt>

      {/* --------------------------- account read-out ----------------------- */}
      <Field y={805} labelY={822} valueY={843} label="ACCOUNT HOLDER NAME" value={holderName} />
      <Field y={893} labelY={910} valueY={931} label="BANK NAME" value={bankName} />
      <Field
        y={981}
        labelY={998}
        valueY={1019}
        label="ACCOUNT NUMBER"
        value={accountNumberMasked}
        valueSpacing={2}
      />

      {/* The IFSC | UPI pair — both 156x75, at x=37 and x=201 per the spec. */}
      <HalfField x={37} textX={58} label="IFSC CODE" value={ifsc} />
      <HalfField x={201} textX={222} label="UPI ID" value={upiId} />

      {/* ------------------------ encryption reassurance -------------------- */}
      <Abs
        x={FIELD_X}
        y={1168}
        w={FIELD_W_FULL}
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
        onPress={onSave}
        disabled={saveBankDetails.isPending}
        style={({ pressed }) => [styles.cta, (pressed || saveBankDetails.isPending) && styles.pressed]}
      >
        <Txt
          x={81.5}
          y={18}
          w={138}
          size={16}
          weight="bold"
          font="inter"
          color="#FFFFFF"
          lineHeight={19.36}
          align="center"
        >
          Save bank details
        </Txt>
      </Pressable>
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

  /* Background+Border+Shadow — 185x40 r24 mint badge, centred in the 301pt
     content column (37 + (301-185)/2 = 95). */
  badge: {
    position: "absolute",
    left: 95,
    top: 733,
    width: 185,
    height: 40,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: BADGE_LINE,
  },

  /* Overlay+Border+Shadow+OverlayBlur — the field card's drop shadow plus the
     2pt white inner shadow, approximated with one soft shadow. */
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

  /* Button — 301x55 r100 #312B28. */
  cta: {
    position: "absolute",
    left: 37,
    top: 1279,
    width: FIELD_W_FULL,
    height: 55,
    borderRadius: 100,
    backgroundColor: CTA_BG,
    shadowColor: "#000000",
    shadowOpacity: 0.12,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
});
