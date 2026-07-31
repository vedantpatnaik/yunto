import { useMemo, useRef, useState } from "react";
import { PanResponder, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Abs, Screen, Txt } from "../../../src/ui/Frame";
import { gradients } from "../../../src/theme";

/**
 * Videographers — Figma frame 7778:17881 (375x876), traced 1:1.
 *
 * The add-on marketplace reached from a creator's Add-ons row. Four bands over
 * the flat #f8f5ef frame: the back / "Videographers" / date-pill header, a
 * horizontally scrolling emoji category strip (the chips overflow the 375pt
 * frame and run to x=447), a shuffled deck of talent cards, and the
 * SHOOT TYPE / CITY filter bar parked at the bottom.
 *
 * The deck is three stacked card frames, not a side-by-side rail: the file
 * draws a back card at 30.47,266.63 (content at 30% opacity), a middle card at
 * 29,246.1 (50%) and the fully-detailed front card at 35,222, each with a
 * fraction-of-a-degree rotation. Swiping horizontally rotates who occupies
 * which slot; the slot geometry never moves, exactly as drawn.
 *
 * Data — there is no Videographer model in prisma/schema.prisma and no
 * /videographers endpoint, so the roster below is the design's own catalogue
 * held as a static constant. It is copied verbatim from the frame and carries
 * only the fields the frame actually specifies: the file gives the front card
 * a role, an experience line and a city, while the two cards behind it are
 * drawn with a name and a rate alone. Rather than invent a role or a city for
 * Aman and Priya so their front-card state looks full, those lines simply do
 * not render for them — the card keeps its geometry and shows what is known.
 * Swap this constant for a hook the moment the model lands.
 *
 * The date pill reads "20 Jun" in the file — a sample value, like the day
 * strip on Add Reminder, so it is derived from the device clock here.
 *
 * The card photos are Figma image fills with no exportable asset, so each slot
 * paints the app's avatar gradient in the image box instead. expo-blur is not
 * a dependency, so the BACKGROUND_BLUR on the glass chrome renders as its
 * translucent fill alone — the substitution the other agency frames make.
 */

/* -------------------------------- geometry -------------------------------- */
const FRAME_W = 375;
const FRAME_H = 876;

/* --------------------------- spec colour tokens --------------------------- */
const PAGE = "#f8f5ef"; // frame fill
const INK = "#1d1d1f"; // names, rates, active chip
const MUTED = "#6e6e73"; // blurb, location pill, date pill
const LABEL = "#8a8a8e"; // SELECT … captions and their icons
const ON_DARK = "#faf7f2"; // chevron on the back button
const BACK_FILL = "#1f1a17"; // Button — 7778:17883
const CTA_FILL = "#312b28"; // Button — 7778:17990
const GLASS_65 = "rgba(255,255,255,0.65)";
const GLASS_LINE = "rgba(255,255,255,0.9)";
const CHIP_ON = "#d4dcff"; // Button — 7778:17993
const CHIP_OFF = "rgba(255,255,255,0.5)";
const CHIP_LINE = "rgba(255,255,255,0.8)";
const CARD_70 = "rgba(255,255,255,0.7)"; // the two cards behind
const CARD_85 = "rgba(255,255,255,0.85)"; // the front card
const LOC_FILL = "rgba(255,255,255,0.8)"; // Overlay+Shadow — 7778:17971

/** Rate pill fill — GRADIENT_LINEAR with the file's own handles. */
const RATE_GRAD = ["#f3ebff", "#eaf5ff"] as const;
const RATE_START = { x: 0.2, y: -0.96 };
const RATE_END = { x: 0.8, y: 1.96 };

/** Selected shoot-type tile — GRADIENT_LINEAR #1d1d1f -> #3a3a3c. */
const DARK_GRAD = ["#1d1d1f", "#3a3a3c"] as const;

/* ------------------------------- catalogue -------------------------------- */
interface Videographer {
  id: string;
  name: string;
  /** Rate pill copy, e.g. "₹5000 | 2 Hrs Shoot". */
  rate: string;
  /** Front-card blurb, line 1. Only the file's front card specifies one. */
  role?: string;
  /** Front-card blurb, line 2 — years of experience and brands worked with. */
  exp?: string;
  /** Location pill on the front card. */
  city?: string;
  /** Stand-in paint for the card's image fill. */
  tint: readonly [string, string];
}

const VIDEOGRAPHERS: Videographer[] = [
  {
    id: "sarthak",
    name: "Sarthak",
    role: "Fashion & Lifestyle Videographer",
    exp: "5 yrs exp. • Works with Nykaa, H&M",
    city: "Delhi",
    rate: "₹5000 | 2 Hrs Shoot",
    tint: gradients.avatarA,
  },
  { id: "priya", name: "Priya", rate: "₹6000 | 2 Hrs Shoot", tint: gradients.avatarB },
  { id: "aman", name: "Aman", rate: "₹7000 | 4 Hrs Shoot", tint: gradients.avatarC },
];

/* --------------------------- category chip strip -------------------------- */
/** Frame 7778:17992 — a 375x56 clip box the four chips overflow to x=447.08. */
const CHIPS = [
  { label: "✨ Fashion", x: 20, w: 106.08, tw: 68.08 },
  { label: "✈️ Travel", x: 138.08, w: 94.2, tw: 56.2 },
  { label: "🎉 Event", x: 244.28, w: 90.64, tw: 52.64 },
  { label: "💄 Beauty", x: 346.92, w: 100.16, tw: 62.16 },
] as const;
const CHIP_STRIP_W = 447.08;

/** Shoot-type tiles — 44x44 at y=799, the middle one selected in the file. */
const SHOOT_X = [20, 72, 124] as const;

/* --------------------------------- dates ---------------------------------- */
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
/** "20 Jun" — the date pill format. */
const dayMonth = (d: Date) => `${d.getDate()} ${MONTHS[d.getMonth()]}`;

/* ------------------------------- deck slots ------------------------------- */
interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface PeekSlot {
  card: Box;
  /** Figma rotation, in degrees. */
  rot: string;
  img: Box;
  imgRadius: number;
  name: { x: number; y: number; w: number };
  pill: Box;
  rate: { x: number; y: number; w: number };
  /** The opacity the file puts on this slot's content groups. */
  dim: number;
}

/** Overlay+Border+Shadow+OverlayBlur 7778:17944 — the card at the back. */
const BACK_SLOT: PeekSlot = {
  card: { x: 30.47, y: 266.63, w: 314.02, h: 436.74 },
  rot: "0.09deg",
  img: { x: 64.77, y: 283.2, w: 263.15, h: 200.97 },
  imgRadius: 20,
  name: { x: 60.77, y: 480.45, w: 68.72 },
  pill: { x: 47.01, y: 635.09, w: 143.09, h: 42.76 },
  rate: { x: 61.16, y: 644.33, w: 114.78 },
  dim: 0.3,
};

/** Overlay+Border+Shadow+OverlayBlur 7778:17954 — the middle card. */
const MID_SLOT: PeekSlot = {
  card: { x: 29, y: 246.1, w: 316.97, h: 451.81 },
  rot: "-0.05deg",
  img: { x: 45.97, y: 263.07, w: 271.78, h: 203.46 },
  imgRadius: 20,
  name: { x: 56.91, y: 482.33, w: 62.12 },
  pill: { x: 65.46, y: 640.86, w: 150.74, h: 40.07 },
  rate: { x: 80.14, y: 650.15, w: 121.39 },
  dim: 0.5,
};

/**
 * A card behind the front one. The file hides everything but the name and the
 * rate on these, and dims what is left, so that is all this draws.
 */
function PeekCard({ person, slot }: { person: Videographer; slot: PeekSlot }) {
  return (
    <>
      <Abs
        x={slot.card.x}
        y={slot.card.y}
        w={slot.card.w}
        h={slot.card.h}
        radius={32}
        bg={CARD_70}
        border={GLASS_LINE}
        borderWidth={1}
        style={[styles.cardShadow, { transform: [{ rotate: slot.rot }] }]}
      />
      {/* Both dimmed groups — 7778:17945 and 7778:17948. */}
      <Abs w={FRAME_W} h={FRAME_H} opacity={slot.dim}>
        <LinearGradient
          colors={person.tint}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            position: "absolute",
            left: slot.img.x,
            top: slot.img.y,
            width: slot.img.w,
            height: slot.img.h,
            borderRadius: slot.imgRadius,
          }}
        />
        <Txt
          x={slot.name.x}
          y={slot.name.y}
          w={slot.name.w}
          size={26}
          weight="bold"
          font="inter"
          color={INK}
          lineHeight={31.46}
          letterSpacing={-0.5}
          numberOfLines={1}
        >
          {person.name}
        </Txt>
        <RatePill
          x={slot.pill.x}
          y={slot.pill.y}
          w={slot.pill.w}
          h={slot.pill.h}
          textX={slot.rate.x}
          textY={slot.rate.y}
          textW={slot.rate.w}
          label={person.rate}
        />
      </Abs>
    </>
  );
}

/**
 * "₹5000 | 2 Hrs Shoot" — a 16pt gradient pill. The front card leads it with a
 * 14pt camera glyph; the dimmed cards behind draw the label alone.
 */
function RatePill({
  x, y, w, h, textX, textY, textW, label, icon,
}: {
  x: number; y: number; w: number; h: number;
  textX: number; textY: number; textW: number;
  label: string; icon?: { x: number; y: number };
}) {
  return (
    <>
      <LinearGradient
        colors={RATE_GRAD}
        start={RATE_START}
        end={RATE_END}
        style={[styles.ratePill, { left: x, top: y, width: w, height: h }]}
      />
      {icon ? (
        <Abs x={icon.x} y={icon.y} w={14} h={14} center>
          <Feather name="camera" size={14} color={INK} />
        </Abs>
      ) : null}
      <Txt
        x={textX} y={textY} w={textW} numberOfLines={1}
        size={13} weight="bold" font="inter" color={INK} lineHeight={15.73}
      >
        {label}
      </Txt>
    </>
  );
}

/* --------------------------------- screen --------------------------------- */
export default function VideographersList() {
  const router = useRouter();

  // Frozen at mount so the pill cannot renumber itself mid-browse.
  const today = useMemo(() => new Date(), []);

  const [index, setIndex] = useState(0);
  const [category, setCategory] = useState(0);
  const [shootType, setShootType] = useState(1);

  /**
   * Swipe rotates the deck. onStart stays false so a tap still reaches the
   * card's own controls; only a decisive horizontal drag claims the gesture.
   */
  const pan = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_e, g) =>
        Math.abs(g.dx) > 12 && Math.abs(g.dx) > Math.abs(g.dy),
      onPanResponderRelease: (_e, g) => {
        if (g.dx < -40) setIndex((i) => i + 1);
        else if (g.dx > 40) setIndex((i) => i - 1);
      },
    }),
  ).current;

  const n = VIDEOGRAPHERS.length;
  const at = (k: number) => VIDEOGRAPHERS[(((index + k) % n) + n) % n];
  const front = at(0);
  const mid = at(1);
  const back = at(2);

  return (
    <Screen height={FRAME_H} background={PAGE} scroll>
      {/* ------------------------------- The deck ---------------------------- */}
      {/* Drawn first so the header, chips and filter bar keep their taps; the
          three card frames all sit inside 222..703 and never overlap them. */}
      <View style={styles.deck} {...pan.panHandlers}>
        <PeekCard person={back} slot={BACK_SLOT} />
        <PeekCard person={mid} slot={MID_SLOT} />

        {/* Front card — Overlay+Border+Shadow+OverlayBlur 7778:17964 */}
        <Abs
          x={35} y={222} w={310} h={460} radius={32}
          bg={CARD_85} border={GLASS_LINE} borderWidth={1}
          style={[styles.cardShadow, styles.frontRot]}
        />
        <LinearGradient
          colors={front.tint}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.frontImage}
        />

        <Txt
          x={52} y={459} w={97.69} numberOfLines={1}
          size={26} weight="bold" font="inter" color={INK}
          lineHeight={31.46} letterSpacing={-0.5}
        >
          {front.name}
        </Txt>

        {/* Location pill — only the front card in the file carries one, and
            only for a videographer whose city is known. */}
        {front.city ? (
          <Abs x={260.2} y={459} w={67.8} h={27} radius={12} bg={LOC_FILL} style={styles.locShadow}>
            <Abs x={10} y={6.5} w={14} h={14} center>
              <Feather name="map-pin" size={14} color={MUTED} />
            </Abs>
            <Txt
              x={28} y={6} w={29.8} numberOfLines={1}
              size={12} weight="bold" font="inter" color={MUTED} lineHeight={14.52}
            >
              {front.city}
            </Txt>
          </Abs>
        ) : null}

        {/* Two-line blurb — 7778:17980 */}
        {front.role ? (
          <Txt
            x={52} y={498} w={276}
            size={14} weight="medium" font="inter" color={MUTED} lineHeight={21}
          >
            {front.exp ? `${front.role}\n${front.exp}` : front.role}
          </Txt>
        ) : null}

        <RatePill
          x={52} y={557} w={176.75} h={34}
          icon={{ x: 67, y: 567 }}
          textX={87} textY={566} textW={126.75}
          label={front.rate}
        />

        {/* View profile — 7778:17990. There is no videographer-profile route in
            the app yet, so the CTA renders without a destination rather than
            pushing a path that would fail silently. */}
        <Abs x={52} y={613} w={276} h={52} radius={24} bg={CTA_FILL} style={styles.ctaShadow}>
          <Txt
            x={86.5} y={16} w={103} align="center"
            size={16} weight="bold" font="inter" color="#ffffff" lineHeight={19.36}
          >
            View profile
          </Txt>
        </Abs>
      </View>

      {/* ------------------------------- Header ------------------------------ */}
      <Pressable
        onPress={() => router.back()}
        style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
      >
        <Feather name="chevron-left" size={16} color={ON_DARK} />
      </Pressable>

      {/* Title pill — 7778:17887. Its chevron is the add-on type picker; no
          sheet for it exists, so it is drawn inert. */}
      <Abs x={72} y={19.5} w={174} h={41} radius={24} bg={GLASS_65} border={GLASS_LINE} borderWidth={1}>
        <Txt
          x={19} y={11} w={112} align="center"
          size={15} weight="bold" font="inter" color={INK} lineHeight={18.15}
        >
          Videographers
        </Txt>
        <Abs x={137} y={11.5} w={18} h={18} center>
          <Feather name="chevron-down" size={18} color={LABEL} />
        </Abs>
      </Abs>

      {/* Date pill — 7778:17892 */}
      <Abs x={266} y={21} w={73.41} h={38} radius={24} bg={GLASS_65} border={GLASS_LINE} borderWidth={1}>
        <Txt
          x={15} y={11} w={43.41} numberOfLines={1}
          size={13} weight="semibold" font="inter" color={MUTED} lineHeight={15.73}
        >
          {dayMonth(today)}
        </Txt>
      </Abs>

      {/* --------------------------- Category chips -------------------------- */}
      {/* The chips run past the frame's right edge, so the clip box scrolls. */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.chipStrip}
        contentContainerStyle={{ width: CHIP_STRIP_W, height: 56 }}
      >
        {CHIPS.map((c, i) => {
          const on = category === i;
          return (
            <Pressable
              key={c.label}
              onPress={() => setCategory(i)}
              style={({ pressed }) => [
                styles.chip,
                { left: c.x, width: c.w, backgroundColor: on ? CHIP_ON : CHIP_OFF },
                pressed && styles.pressed,
              ]}
            >
              <Txt
                x={19} y={11} w={c.tw} align="center" numberOfLines={1}
                size={14} weight="semibold" font="inter"
                color={on ? INK : MUTED} lineHeight={16.94}
              >
                {c.label}
              </Txt>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* ----------------------------- Filter bar ---------------------------- */}
      <Txt
        x={24} y={765} w={144}
        size={11} weight="bold" font="inter" color={LABEL}
        lineHeight={13.31} letterSpacing={0.5}
      >
        SELECT YOUR SHOOT TYPE
      </Txt>
      {SHOOT_X.map((x, i) =>
        shootType === i ? (
          <Pressable key={x} onPress={() => setShootType(i)} style={[styles.shootTile, { left: x }]}>
            <LinearGradient
              colors={DARK_GRAD}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.fill}
            />
            <Txt x={0} y={12} w={44} align="center" size={20} lineHeight={20} font="inter">
              🔥
            </Txt>
          </Pressable>
        ) : (
          <Pressable
            key={x}
            onPress={() => setShootType(i)}
            style={({ pressed }) => [
              styles.shootTile,
              styles.shootTileOff,
              { left: x },
              pressed && styles.pressed,
            ]}
          >
            <Txt x={0} y={12} w={44} align="center" size={20} lineHeight={20} font="inter">
              🔥
            </Txt>
          </Pressable>
        ),
      )}

      <Txt
        x={236} y={777} w={77.08}
        size={11} weight="bold" font="inter" color={LABEL}
        lineHeight={13.31} letterSpacing={0.5}
      >
        SELECT CITY
      </Txt>
      {/* City picker — 7778:17933. No city sheet exists, so it shows the frame's
          selection and stays inert. */}
      <Abs
        x={232.23} y={799} w={122.77} h={44} radius={16}
        bg={GLASS_65} border={GLASS_LINE} borderWidth={1}
      >
        <Abs x={19} y={14} w={16} h={16} center>
          <Feather name="map-pin" size={16} color={LABEL} />
        </Abs>
        <Txt
          x={43} y={13.5} w={34.77} numberOfLines={1}
          size={14} weight="bold" font="inter" color={INK} lineHeight={16.94}
        >
          Delhi
        </Txt>
        <Abs x={85.77} y={13} w={18} h={18} center>
          <Feather name="chevron-down" size={18} color={LABEL} />
        </Abs>
      </Abs>
    </Screen>
  );
}

const styles = StyleSheet.create({
  fill: { position: "absolute", left: 0, top: 0, right: 0, bottom: 0, borderRadius: 16 },
  pressed: { opacity: 0.85 },

  /* Deck */
  deck: { position: "absolute", left: 0, top: 0, width: FRAME_W, height: FRAME_H },
  cardShadow: {
    shadowColor: "#000000",
    shadowOpacity: 0.06,
    shadowRadius: 40,
    shadowOffset: { width: 0, height: 20 },
    elevation: 4,
  },
  frontRot: { transform: [{ rotate: "0.05deg" }] },
  frontImage: {
    position: "absolute",
    left: 52,
    top: 237.5,
    width: 276,
    height: 203,
    borderRadius: 6.63,
  },
  ratePill: { position: "absolute", borderRadius: 16, borderWidth: 1, borderColor: "#ffffff" },
  locShadow: {
    shadowColor: "#000000",
    shadowOpacity: 0.02,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  ctaShadow: {
    shadowColor: "#000000",
    shadowOpacity: 0.15,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },

  /* Header */
  backButton: {
    position: "absolute",
    left: 16,
    top: 22,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: BACK_FILL,
    shadowColor: "#000000",
    shadowOpacity: 0.1,
    shadowRadius: 2.7,
    shadowOffset: { width: 0, height: 0.9 },
    elevation: 2,
  },

  /* Category chips */
  chipStrip: { position: "absolute", left: 0, top: 106, width: FRAME_W, height: 56 },
  chip: {
    position: "absolute",
    top: 0,
    height: 40,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: CHIP_LINE,
    shadowColor: "#000000",
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 1,
  },

  /* Filter bar */
  shootTile: {
    position: "absolute",
    top: 799,
    width: 44,
    height: 44,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000000",
    shadowOpacity: 0.15,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  shootTileOff: {
    backgroundColor: GLASS_65,
    borderWidth: 1,
    borderColor: GLASS_LINE,
    shadowOpacity: 0.03,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 1,
  },
});
