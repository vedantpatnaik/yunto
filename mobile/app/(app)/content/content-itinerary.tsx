import { useMemo, useState } from "react";
import { Image, Pressable, ScrollView, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Svg, {
  Defs,
  LinearGradient as SvgLinear,
  RadialGradient,
  Rect,
  Stop,
} from "react-native-svg";
import { Abs, Screen, Txt } from "../../../src/ui/Frame";
import { gradients } from "../../../src/theme";
import { useCalendar, useCreators } from "../../../src/api/hooks";
import type { CalendarItem, Creator } from "../../../src/api/hooks";

/**
 * Content Itinerary — Figma 7358:23922 "content itenary" (375x875), traced 1:1.
 *
 * The generated week plan: a clipped calendar strip (Mo 16 - Sa 21, the pills
 * run past the right edge so the strip scrolls horizontally exactly as the
 * frame's clipsContent implies), the "Generate More Ideas" sparkle pill, and
 * the Idea Card Stack — a 343-wide glass panel with two collapsed idea cards
 * layered over two ghost sheets that give the stack its depth. A sticky-looking
 * overlay bar carries the two 161.5x51 actions.
 *
 * Every coordinate below is a raw frame coordinate from the spec; children of
 * pressable sub-frames are rebased by their parent's origin and nothing else.
 */

/* ------------------------------- geometry -------------------------------- */
const FRAME_W = 375;
const FRAME_H = 875;

/** Calendar Strip clips at 375 but its pills reach x=416. */
const STRIP = { x: 0, y: 111, w: 375, h: 93 } as const;
const STRIP_CONTENT_W = 436;

/** Idea Card Stack: first card top and the step between cards. */
const CARD_Y0 = 344;
const CARD_STEP = 176;
/** Panel runs 277..701; a third card would start at 696, so two rows fit. */
const MAX_CARDS = 2;

/* --------------------------- spec colour tokens --------------------------- */
const INK_HEADER = "#1a1a1c";
const INK_DOTS = "#000000";
const INK_TITLE = "#2b2240";
const INK_META = "#6b7280";
const INK_HOOK = "#121417";
const INK_CAPTION = "#6b7582";
const INK_GENERATE = "#4a3a6b";
const INK_DAY_IDLE = "#5e5e62";
const INK_DAYNUM_IDLE = "#1a1a1c";
const INK_AI_BTN = "#1f1a17";
const GLASS_70 = "rgba(255,255,255,0.7)";
const GLASS_80 = "rgba(255,255,255,0.8)";
const GLASS_90 = "rgba(255,255,255,0.9)";
const GLASS_62 = "rgba(255,255,255,0.62)";
const GLASS_60 = "rgba(255,255,255,0.6)";
const GLASS_55 = "rgba(255,255,255,0.55)";
const GLASS_50 = "rgba(255,255,255,0.5)";
const GLASS_30 = "rgba(255,255,255,0.3)";
const DAY_WHITE_80 = "rgba(255,255,255,0.8)";
const PANEL_EDGE = "rgba(43,34,64,0.06)";
const SHEET_EDGE_2 = "rgba(43,34,64,0.05)";
const SHEET_EDGE_1 = "rgba(43,34,64,0.04)";
const OVERLAY_BAR = "rgba(246,239,233,0.85)";
const DARK_BTN = "#312b28";
const IG_OUTLINE = "#e1306c";
const SPARKLE = "#a48aeb";

const DAY_GRADIENT = ["#a2b5f5", "#8dc49d"] as const;
const IG_GRADIENT = ["#ffdd55", "#ff543e", "#c837ab"] as const;
const GENERATE_GRADIENT = [
  "rgba(230,230,250,0.8)",
  "rgba(255,228,225,0.8)",
  "rgba(255,218,185,0.8)",
] as const;
/** Photo placeholder while a creator has no image on file. */
const PHOTO_FILL = [gradients.creators[0], gradients.creators[1]] as const;

/* -------------------------------- backdrop -------------------------------- */
/** Frame fill: warm vertical base plus four soft radial glows. */
function Backdrop() {
  return (
    <Svg width={FRAME_W} height={FRAME_H} style={styles.backdrop}>
      <Defs>
        <SvgLinear id="base" x1="187.5" y1="0" x2="187.5" y2={FRAME_H} gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#F7F0E4" />
          <Stop offset="1" stopColor="#F4EBDD" />
        </SvgLinear>
        <RadialGradient id="pink" cx="285" cy="542.5" rx="1027.5" ry="568.75" gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#F7B7DA" stopOpacity="0.34" />
          <Stop offset="0.26" stopColor="#F7B7DA" stopOpacity="0" />
        </RadialGradient>
        <RadialGradient id="blue" cx="90" cy="367.5" rx="967.5" ry="533.75" gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#BACDF4" stopOpacity="0.36" />
          <Stop offset="0.24" stopColor="#BACDF4" stopOpacity="0" />
        </RadialGradient>
        <RadialGradient id="gold" cx="292.5" cy="157.5" rx="1338.75" ry="735" gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#F6D64A" stopOpacity="0.22" />
          <Stop offset="0.2" stopColor="#F6D64A" stopOpacity="0" />
        </RadialGradient>
        <RadialGradient id="haze" cx="75" cy="87.5" rx="1466.25" ry="805" gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#FFFFFF" stopOpacity="0.72" />
          <Stop offset="0.24" stopColor="#FFFFFF" stopOpacity="0" />
        </RadialGradient>
      </Defs>
      <Rect width={FRAME_W} height={FRAME_H} fill="url(#base)" />
      <Rect width={FRAME_W} height={FRAME_H} fill="url(#pink)" />
      <Rect width={FRAME_W} height={FRAME_H} fill="url(#blue)" />
      <Rect width={FRAME_W} height={FRAME_H} fill="url(#gold)" />
      <Rect width={FRAME_W} height={FRAME_H} fill="url(#haze)" />
    </Svg>
  );
}

/* -------------------------------- calendar -------------------------------- */
/**
 * Pill geometry, dow label and per-pill text colours are the spec's, verbatim.
 * Only the day numbers are data — they follow the week the plan actually falls
 * in, and fall back to the frame's own 16..21 when nothing is scheduled yet.
 */
const DAYS = [
  { x: 20, w: 57.09, dow: "Mo", num: "16", dowColor: DAY_WHITE_80, numColor: "#ffffff" },
  { x: 88, w: 57.77, dow: "Tu", num: "17", dowColor: DAY_WHITE_80, numColor: "#ffffff" },
  { x: 156, w: 56, dow: "We", num: "18", dowColor: DAY_WHITE_80, numColor: "#ffffff" },
  { x: 224, w: 57.55, dow: "Th", num: "19", dowColor: DAY_WHITE_80, numColor: "#ffffff" },
  { x: 292, w: 56.52, dow: "Fr", num: "20", dowColor: DAY_WHITE_80, numColor: "#ffffff" },
  { x: 360, w: 56, dow: "Sa", num: "21", dowColor: INK_DAY_IDLE, numColor: INK_DAYNUM_IDLE },
] as const;

/** The frame highlights We (index 2) with the deep green glow. */
const SPEC_SELECTED = 2;

function DayPill({
  x, w, dow, num, dowColor, numColor, selected, onPress,
}: {
  x: number; w: number; dow: string; num: string;
  dowColor: string; numColor: string; selected: boolean; onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.pill,
        { left: x, width: w },
        selected ? styles.pillSelected : styles.pillIdle,
      ]}
    >
      <LinearGradient
        colors={DAY_GRADIENT}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={styles.pillFill}
      />
      <Txt font="inter" size={13} weight="semibold" color={dowColor} lineHeight={15.73}>
        {dow}
      </Txt>
      <Txt font="inter" size={18} weight="bold" color={numColor} lineHeight={21.78}>
        {num}
      </Txt>
    </Pressable>
  );
}

/* -------------------------------- ig glyph -------------------------------- */
/** skill-icons:instagram — gradient tile with the white camera mark. */
function InstagramGlyph({ x, y }: { x: number; y: number }) {
  return (
    <Abs x={x} y={y} w={16} h={16} radius={5} center style={styles.clip}>
      <LinearGradient
        colors={IG_GRADIENT}
        locations={[0, 0.5, 1]}
        start={{ x: 0.27, y: 1 }}
        end={{ x: 1, y: 0.09 }}
        style={styles.glyphFill}
      />
      <Feather name="instagram" size={11} color="#ffffff" />
    </Abs>
  );
}

/* -------------------------------- idea card ------------------------------- */
/**
 * The two cards differ only in tint, photo box and text measure — everything
 * else repeats on a 176pt step, so each card keeps its spec preset and picks up
 * its y from the step.
 */
const CARD_PRESETS = [
  {
    tint: "#f5eefb",
    photo: { x: 199, y: 10, w: 95, h: 140 },
    hookW: 175,
    captionW: 180,
    format: "Instagram Reel",
    dow: "Mon",
    hook: "Discovering hidden gems in Ubud's rice paddies. \u{1F33F}\u{1F49A}",
    caption:
      "Wandering through the lush green terraces, I stumbled upon a serene spot perfect for meditation. #UbudAdventures #RicePaddyViews ",
  },
  {
    tint: "#f6fbee",
    photo: { x: 206, y: 14, w: 87, h: 127 },
    hookW: 176,
    captionW: 188,
    format: "Instagram Carousel",
    dow: "Tue",
    hook: "Sunset yoga session at Seminyak Beach. \u{1F64F}\u{1F3FC}\u{1F307}",
    caption:
      "Embracing the golden hour with a rejuvenating yoga flow by the ocean. #SeminyakSunset #BeachYoga #BaliVibes",
  },
] as const;

type Preset = (typeof CARD_PRESETS)[number];

function IdeaCard({
  preset, y, meta, hook, caption, photoUri, onPress,
}: {
  preset: Preset; y: number; meta: string; hook: string; caption: string;
  photoUri?: string; onPress: () => void;
}) {
  const { photo } = preset;
  return (
    <Pressable onPress={onPress} style={[styles.card, { top: y, backgroundColor: preset.tint }]}>
      <Abs
        x={photo.x}
        y={photo.y}
        w={photo.w}
        h={photo.h}
        radius={8}
        style={styles.clip}
      >
        {photoUri ? (
          <Image source={{ uri: photoUri }} style={{ width: photo.w, height: photo.h }} />
        ) : (
          <LinearGradient
            colors={PHOTO_FILL}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ width: photo.w, height: photo.h }}
          />
        )}
      </Abs>

      <InstagramGlyph x={10.5} y={14} />
      <Txt
        x={31.5}
        y={14}
        w={123}
        font="inter"
        size={10}
        weight="regular"
        color={INK_META}
        lineHeight={16}
        numberOfLines={1}
      >
        {meta}
      </Txt>

      <Txt
        x={12}
        y={34}
        w={preset.hookW}
        font="inter"
        size={12}
        weight="medium"
        color={INK_HOOK}
        lineHeight={20}
        numberOfLines={2}
      >
        {hook}
      </Txt>

      <Txt
        x={11}
        y={79}
        w={preset.captionW}
        font="inter"
        size={10}
        weight="regular"
        color={INK_CAPTION}
        lineHeight={18}
        numberOfLines={4}
      >
        {caption}
      </Txt>
    </Pressable>
  );
}

/* ------------------------------- date helpers ----------------------------- */
const DOW3 = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

/** Monday of the week `d` falls in — the strip always starts on Mo. */
function mondayOf(d: Date): Date {
  const x = new Date(d.getTime());
  x.setDate(x.getDate() - ((x.getDay() + 6) % 7));
  return x;
}

/* -------------------------------- screen ---------------------------------- */
export default function ContentItinerary() {
  const router = useRouter();
  const { data: calendar } = useCalendar();
  const { data: creators } = useCreators();

  /** The plan, earliest first — the card stack renders what fits the panel. */
  const items = useMemo<CalendarItem[]>(
    () =>
      [...(calendar ?? [])].sort(
        (a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime(),
      ),
    [calendar],
  );

  const avatarOf = useMemo(() => {
    const byId = new Map<string, Creator>();
    for (const c of creators ?? []) byId.set(c.id, c);
    return (creatorId: string) => byId.get(creatorId)?.avatarUrl;
  }, [creators]);

  /** Day numbers for the Mo..Sa strip, taken from the week the plan sits in. */
  const dayNums = useMemo(() => {
    const first = items[0];
    if (!first) return DAYS.map((d) => d.num);
    const monday = mondayOf(new Date(first.scheduledAt));
    return DAYS.map((_, i) => {
      const d = new Date(monday.getTime());
      d.setDate(d.getDate() + i);
      return String(d.getDate());
    });
  }, [items]);

  const [selected, setSelected] = useState(SPEC_SELECTED);

  /** "Let AI set Date" — jump the strip to the day the plan already schedules. */
  const letAiSetDate = () => {
    const first = items[0];
    if (!first) return;
    const i = (new Date(first.scheduledAt).getDay() + 6) % 7;
    setSelected(Math.min(i, DAYS.length - 1));
  };

  const rows = items.slice(0, MAX_CARDS);
  const cards = CARD_PRESETS.map((preset, i) => {
    const row = rows[i];
    const dow = row ? DOW3[new Date(row.scheduledAt).getDay()] : preset.dow;
    return {
      key: row ? row.id : `spec-${i}`,
      preset,
      meta: `${dow} | ${preset.format}`,
      hook: row ? row.title : preset.hook,
      caption: preset.caption,
      photoUri: row ? avatarOf(row.creatorId) : undefined,
      target: row ? `/content/content-idea-detail?id=${row.id}` : "/content/content-idea-detail",
    };
  });

  return (
    <Screen height={FRAME_H} background="#F7F0E4" scroll>
      <Backdrop />

      {/* ------------------------------ Header ------------------------------ */}
      <Pressable onPress={() => router.back()} style={[styles.headerButton, { left: 15 }]}>
        <Feather name="chevron-left" size={20} color={INK_HEADER} style={styles.headerIcon} />
      </Pressable>

      <Abs x={115} y={21.5} w={128.88} h={37} radius={20} bg={GLASS_80} border={GLASS_90} style={styles.softShadow}>
        <Feather name="instagram" size={15} color={IG_OUTLINE} style={styles.igOutline} />
        <Txt
          x={39}
          y={9}
          w={72.88}
          font="inter"
          size={15}
          weight="semibold"
          color={INK_HEADER}
          lineHeight={18.15}
          align="center"
        >
          Instagram
        </Txt>
      </Abs>

      <Pressable style={[styles.headerButton, { left: 303.88 }]}>
        <Feather name="more-vertical" size={20} color={INK_DOTS} style={styles.headerIcon} />
      </Pressable>

      {/* --------------------------- Calendar Strip ------------------------- */}
      <Abs x={STRIP.x} y={STRIP.y} w={STRIP.w} h={STRIP.h} style={styles.clip}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.strip}
          contentContainerStyle={styles.stripContent}
        >
          {DAYS.map((d, i) => (
            <DayPill
              key={d.dow}
              x={d.x}
              w={d.w}
              dow={d.dow}
              num={dayNums[i]}
              dowColor={d.dowColor}
              numColor={d.numColor}
              selected={i === selected}
              onPress={() => setSelected(i)}
            />
          ))}
        </ScrollView>
      </Abs>

      {/* --------------------------- Generate Button ------------------------ */}
      <Pressable style={styles.generate}>
        <LinearGradient
          colors={GENERATE_GRADIENT}
          locations={[0, 0.5, 1]}
          start={{ x: 0.21, y: 0 }}
          end={{ x: 0.79, y: 1 }}
          style={styles.generateFill}
        />
        <MaterialCommunityIcons
          name="star-four-points-outline"
          size={13.34}
          color={SPARKLE}
          style={styles.sparkleBig}
        />
        <MaterialCommunityIcons
          name="star-four-points-outline"
          size={4}
          color={SPARKLE}
          style={styles.sparkleSmall}
        />
        <Txt
          x={53}
          y={13}
          w={156.88}
          font="inter"
          size={14}
          weight="bold"
          color={INK_GENERATE}
          lineHeight={16.94}
        >
          {"✨ Generate More Ideas"}
        </Txt>
      </Pressable>

      {/* --------------------------- Idea Card Stack ------------------------ */}
      <Abs
        x={26.8}
        y={334.91}
        w={321.39}
        h={348.19}
        radius={24}
        bg={GLASS_30}
        border={SHEET_EDGE_1}
      />
      <Abs
        x={17.87}
        y={304.49}
        w={339.25}
        h={389.03}
        radius={24}
        bg={GLASS_50}
        border={SHEET_EDGE_2}
        style={styles.sheetShadow}
      />
      <Abs
        x={16}
        y={277}
        w={343}
        h={424}
        radius={24}
        bg={GLASS_55}
        border={PANEL_EDGE}
        style={styles.panelShadow}
      >
        <Txt
          x={21}
          y={21}
          w={301}
          font="inter"
          size={20}
          weight="semibold"
          color={INK_TITLE}
          lineHeight={29.7}
          letterSpacing={-0.5}
        >
          Your Content
        </Txt>
      </Abs>

      {cards.map((c, i) => (
        <IdeaCard
          key={c.key}
          preset={c.preset}
          y={CARD_Y0 + i * CARD_STEP}
          meta={c.meta}
          hook={c.hook}
          caption={c.caption}
          photoUri={c.photoUri}
          onPress={() => router.push(c.target as never)}
        />
      ))}

      {/* ---------------------------- Bottom bar ---------------------------- */}
      <Abs x={0} y={776} w={375} h={99} bg={OVERLAY_BAR} />

      <Pressable
        onPress={letAiSetDate}
        style={[styles.actionButton, { left: 20, backgroundColor: GLASS_60, borderWidth: 1, borderColor: GLASS_62 }]}
      >
        <Txt
          x={31.75}
          y={17}
          w={99}
          font="inter"
          size={14}
          weight="medium"
          color={INK_AI_BTN}
          lineHeight={16.94}
          align="center"
        >
          Let AI set Date
        </Txt>
      </Pressable>

      <Pressable
        onPress={() => router.push("/content/content-itinerary-set-date" as never)}
        style={[styles.actionButton, { left: 193.5, backgroundColor: DARK_BTN }]}
      >
        <Txt
          x={25.25}
          y={17}
          w={112}
          font="inter"
          size={14}
          weight="medium"
          color="#ffffff"
          lineHeight={16.94}
          align="center"
        >
          Set content date
        </Txt>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  backdrop: { position: "absolute", left: 0, top: 0 },
  clip: { overflow: "hidden" },

  /* header */
  headerButton: {
    position: "absolute",
    top: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: GLASS_70,
    borderWidth: 1,
    borderColor: GLASS_90,
    shadowColor: "#000000",
    shadowOpacity: 0.03,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  headerIcon: { position: "absolute", left: 10, top: 10 },
  igOutline: { position: "absolute", left: 14.5, top: 11 },
  softShadow: {
    shadowColor: "#000000",
    shadowOpacity: 0.04,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },

  /* calendar strip */
  strip: { width: STRIP.w, height: STRIP.h },
  stripContent: { width: STRIP_CONTENT_W, height: STRIP.h },
  pill: {
    position: "absolute",
    top: 0,
    height: 69,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  pillFill: { position: "absolute", left: 0, top: 0, right: 0, bottom: 0, borderRadius: 20 },
  pillIdle: {
    borderWidth: 1,
    borderColor: GLASS_90,
    shadowColor: "#000000",
    shadowOpacity: 0.02,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  pillSelected: {
    shadowColor: "#90c1ab",
    shadowOpacity: 0.25,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },

  /* generate button */
  generate: {
    position: "absolute",
    left: 68.06,
    top: 215,
    width: 238.88,
    height: 44,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: "rgba(43,34,64,0.05)",
    shadowColor: "#e6c8dc",
    shadowOpacity: 0.4,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 12 },
  },
  generateFill: { position: "absolute", left: 0, top: 0, right: 0, bottom: 0, borderRadius: 30 },
  sparkleBig: { position: "absolute", left: 30.33, top: 14.83 },
  sparkleSmall: { position: "absolute", left: 30.33, top: 25.5 },

  /* card stack */
  sheetShadow: {
    shadowColor: "#000000",
    shadowOpacity: 0.02,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
  },
  panelShadow: {
    shadowColor: "#1e1432",
    shadowOpacity: 0.06,
    shadowRadius: 40,
    shadowOffset: { width: 0, height: 16 },
  },
  card: {
    position: "absolute",
    left: 37,
    width: 301,
    height: 160,
    borderRadius: 8,
    overflow: "hidden",
  },
  glyphFill: { position: "absolute", left: 0, top: 0, right: 0, bottom: 0 },

  /* bottom bar */
  actionButton: {
    position: "absolute",
    top: 792,
    width: 161.5,
    height: 51,
    borderRadius: 24,
    shadowColor: "#000000",
    shadowOpacity: 0.1,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
  },
});
