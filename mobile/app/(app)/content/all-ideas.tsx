import { useMemo } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Svg, {
  Defs,
  LinearGradient as SvgLinear,
  RadialGradient,
  Rect,
  Stop,
} from "react-native-svg";
import { Abs, Screen, Txt } from "../../../src/ui/Frame";
import { useNotes, type Note } from "../../../src/api/hooks";

/**
 * All Ideas — Content Studio home. Figma 7333:12731 "Content - notes" (375x875).
 *
 * Traced 1:1: warm gradient backdrop, glass back button + centred title, and a
 * clipped list of 335x72 glass idea cards (date chip, kind line, one-line
 * preview, chevron) stepping every 84pt, with the 64x64 write FAB at 267,745.
 * Coordinates are raw frame coordinates; <Screen> scales the 375pt canvas.
 */

/* ------------------------------- geometry -------------------------------- */
const FRAME_W = 375;
const FRAME_H = 875;

const MAIN_Y = 106; // "Main" frame origin — also the first card's y
const MAIN_H = 769;
const CARD_X = 20;
const CARD_W = 335;
const CARD_H = 72;
const CARD_STEP = 84; // 72 card + 12 stack gap
/** 106 + 6*84 + 72 = 682, the last row that clears the FAB band at y=745. */
const MAX_ROWS = 7;

/* --------------------------- spec colour tokens --------------------------- */
const TITLE_INK = "#1D1D1F";
const DATE_INK = "#6E6E73";
const KIND_INK = "#3E2723";
const GLASS_65 = "rgba(255,255,255,0.65)";
const BORDER_90 = "rgba(255,255,255,0.9)";

/** The two card paints the design ships; the list cycles them. */
const VARIANTS = [
  {
    from: "rgba(255,235,238,0.949)",
    to: "rgba(255,243,224,0.949)",
    start: { x: 0.19, y: -0.85 },
    end: { x: 0.81, y: 1.85 },
    glow: "#FF7043",
    glowOpacity: 0.078,
    accent: "#FF7043",
    preview: "rgba(0,0,0,0.5)",
  },
  {
    from: "rgba(255,235,238,0.949)",
    to: "rgba(253,237,236,0.949)",
    start: { x: 0.18, y: -0.67 },
    end: { x: 0.82, y: 1.67 },
    glow: "#E53935",
    glowOpacity: 0.059,
    accent: "#E53935",
    preview: "#7F7773",
  },
] as const;

/* ------------------------------ derivations ------------------------------- */
const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

/** "20 Jun" — the date-chip format in the design. */
function dateChip(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return `${d.getDate()} ${MONTHS[d.getMonth()]}`;
}

/**
 * A note body carries both lines the card shows: a short kind line and a
 * one-line preview. Split on the first newline, else on the first sentence
 * break, so single-paragraph notes still fill both rows.
 */
function splitBody(body: string): { kind: string; preview: string } {
  const nl = body.indexOf("\n");
  if (nl > 0) {
    return { kind: body.slice(0, nl).trim(), preview: body.slice(nl + 1).trim() };
  }
  const stop = body.search(/[.!?:]\s/);
  if (stop > 0) {
    // The label line reads as a heading, so drop the separator it split on.
    return { kind: body.slice(0, stop).trim(), preview: body.slice(stop + 2).trim() };
  }
  return { kind: body.trim(), preview: "" };
}

/* -------------------------------- backdrop -------------------------------- */
/** The frame fill: a warm vertical base plus four soft radial glows. */
function Backdrop() {
  return (
    <Svg width={FRAME_W} height={FRAME_H} style={styles.backdrop}>
      <Defs>
        <SvgLinear id="ai-base" x1="187.5" y1="0" x2="187.5" y2={FRAME_H} gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#F7F0E4" />
          <Stop offset="1" stopColor="#F4EBDD" />
        </SvgLinear>
        <RadialGradient id="ai-pink" cx="285" cy="542.5" rx="1027.5" ry="568.75" gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#F7B7DA" stopOpacity="0.34" />
          <Stop offset="0.26" stopColor="#F7B7DA" stopOpacity="0" />
        </RadialGradient>
        <RadialGradient id="ai-blue" cx="90" cy="367.5" rx="967.5" ry="533.75" gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#BACDF4" stopOpacity="0.36" />
          <Stop offset="0.24" stopColor="#BACDF4" stopOpacity="0" />
        </RadialGradient>
        <RadialGradient id="ai-gold" cx="292.5" cy="157.5" rx="1338.75" ry="735" gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#F6D64A" stopOpacity="0.22" />
          <Stop offset="0.2" stopColor="#F6D64A" stopOpacity="0" />
        </RadialGradient>
        <RadialGradient id="ai-haze" cx="75" cy="87.5" rx="1466.25" ry="805" gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#FFFFFF" stopOpacity="0.72" />
          <Stop offset="0.24" stopColor="#FFFFFF" stopOpacity="0" />
        </RadialGradient>
      </Defs>
      <Rect width={FRAME_W} height={FRAME_H} fill="url(#ai-base)" />
      <Rect width={FRAME_W} height={FRAME_H} fill="url(#ai-pink)" />
      <Rect width={FRAME_W} height={FRAME_H} fill="url(#ai-blue)" />
      <Rect width={FRAME_W} height={FRAME_H} fill="url(#ai-gold)" />
      <Rect width={FRAME_W} height={FRAME_H} fill="url(#ai-haze)" />
    </Svg>
  );
}

/** The 334x70 white radial highlight bleeding out of each card's top-left. */
function Sheen({ id }: { id: string }) {
  return (
    <Svg width={334} height={70} style={styles.sheen}>
      <Defs>
        <RadialGradient id={id} cx="0" cy="0" rx="344" ry="314" gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#FFFFFF" stopOpacity="0.6" />
          <Stop offset="0.6" stopColor="#FFFFFF" stopOpacity="0" />
        </RadialGradient>
      </Defs>
      <Rect width={334} height={70} fill={`url(#${id})`} />
    </Svg>
  );
}

/* --------------------------------- card ----------------------------------- */
interface CardProps {
  index: number;
  top: number;
  date: string;
  kind: string;
  preview: string;
  onPress: () => void;
}

/**
 * 335x72 glass idea card. Child offsets are card-relative and already account
 * for the 16pt padding box the design lays them out in.
 */
function IdeaCard({ index, top, date, kind, preview, onPress }: CardProps) {
  const v = VARIANTS[index % VARIANTS.length];
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        { top, shadowColor: v.glow, shadowOpacity: v.glowOpacity },
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.cardFill}>
        <LinearGradient
          colors={[v.from, v.to]}
          start={v.start}
          end={v.end}
          style={StyleSheet.absoluteFill}
        />
        <Sheen id={`ai-sheen-${index}`} />
      </View>

      {/* Date chip */}
      <Abs x={17} y={17} w={75} h={38} radius={24} bg={GLASS_65} border={BORDER_90} borderWidth={1} />
      <Txt
        x={32}
        y={28}
        size={13}
        weight="semibold"
        font="inter"
        color={DATE_INK}
        lineHeight={15.73}
        numberOfLines={1}
      >
        {date}
      </Txt>

      {/* Kind + preview */}
      <Txt
        x={106}
        y={17}
        w={178}
        size={15}
        weight="bold"
        font="inter"
        color={KIND_INK}
        lineHeight={18.15}
        numberOfLines={1}
      >
        {kind}
      </Txt>
      <Txt
        x={106}
        y={39}
        w={178}
        size={13}
        weight="medium"
        font="inter"
        color={v.preview}
        lineHeight={15.73}
        numberOfLines={1}
      >
        {preview}
      </Txt>

      {/* Chevron */}
      <Abs x={298} y={26} w={20} h={20} center>
        <Feather name="chevron-right" size={20} color={v.accent} />
      </Abs>
    </Pressable>
  );
}

/* --------------------------------- screen --------------------------------- */
export default function AllIdeas() {
  const router = useRouter();
  const { data = [], isLoading } = useNotes();

  const rows = useMemo(() => {
    const sorted: Note[] = [...data].sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    return sorted.slice(0, MAX_ROWS).map((n) => ({ id: n.id, date: dateChip(n.createdAt), ...splitBody(n.body) }));
  }, [data]);

  return (
    <Screen height={FRAME_H} background="#F7F0E4" scroll>
      <Backdrop />

      {/* Header */}
      <Pressable
        onPress={() => router.back()}
        style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
      >
        <Feather name="arrow-left" size={20} color="#1C1C1E" />
      </Pressable>
      <Txt
        x={100}
        y={30}
        w={154}
        size={16}
        weight="bold"
        font="inter"
        color={TITLE_INK}
        lineHeight={19.36}
        align="center"
      >
        All Ideas
      </Txt>

      {/* Main — the idea list, clipped to the frame exactly as designed. */}
      <Abs x={0} y={MAIN_Y} w={FRAME_W} h={MAIN_H} style={styles.clip}>
        {rows.map((r, i) => (
          <IdeaCard
            key={r.id}
            index={i}
            top={i * CARD_STEP}
            date={r.date}
            kind={r.kind}
            preview={r.preview}
            onPress={() => router.push(`/content/content-editor?id=${r.id}` as never)}
          />
        ))}
        {!isLoading && rows.length === 0 ? (
          <Txt x={36} y={28} w={303} size={13} weight="medium" font="inter" color={DATE_INK} lineHeight={15.73}>
            No ideas yet
          </Txt>
        ) : null}
      </Abs>

      {/* Floating CTA */}
      <Pressable
        onPress={() => router.push("/content/content-editor" as never)}
        style={({ pressed }) => [styles.fab, pressed && styles.pressed]}
      >
        <Feather name="edit-3" size={24} color="#F2F0F0" />
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  backdrop: { position: "absolute", left: 0, top: 0 },
  clip: { overflow: "hidden" },
  pressed: { opacity: 0.9 },

  backButton: {
    position: "absolute",
    left: 15,
    top: 18,
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: GLASS_65,
    borderWidth: 1,
    borderColor: BORDER_90,
    shadowColor: "#000000",
    shadowOpacity: 0.03,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
  },

  card: {
    position: "absolute",
    left: CARD_X,
    width: CARD_W,
    height: CARD_H,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: BORDER_90,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 2,
  },
  cardFill: {
    position: "absolute",
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
    borderRadius: 20,
    overflow: "hidden",
  },
  sheen: { position: "absolute", left: 0, top: 0 },

  fab: {
    position: "absolute",
    left: 267,
    top: 745,
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#312B28",
    shadowColor: "#312B28",
    shadowOpacity: 0.25,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
});
