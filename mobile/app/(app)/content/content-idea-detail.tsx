import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { Image, Pressable, ScrollView, StyleSheet, TextInput, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Feather, Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Svg, {
  Defs,
  LinearGradient as SvgLinear,
  RadialGradient,
  Rect,
  Stop,
} from "react-native-svg";
import { Abs, Screen, Txt } from "../../../src/ui/Frame";
import { fonts } from "../../../src/theme";
import {
  compact,
  useCalendar,
  useCreate,
  useCreators,
  type CalendarItem,
} from "../../../src/api/hooks";

/**
 * Idea Detail / AI Caption — Figma 7358:25339 "add to calendar" (375x875).
 *
 * Traced 1:1. Three scroll planes sit inside the frame, exactly as the design
 * clips them: the week strip (375x93 over 436pt of cells), the Idea Card Stack
 * (an 811pt card clipped into a 324pt viewport at y=277) and the two chip rails
 * (AI suggestions, prompt history). Everything else is absolutely positioned at
 * raw frame coordinates; <Screen> scales the 375pt canvas to the device.
 */

/* ------------------------------- geometry -------------------------------- */
const FRAME_W = 375;
const FRAME_H = 875;

/** Idea Card Stack: clipped viewport, then the full card height behind it. */
const STACK_Y = 277;
const STACK_VIEW_H = 324;
const STACK_H = 811.02;
/** Card-stack children are exported at frame coordinates; rebase them. */
const rel = (y: number) => y - STACK_Y;

/** Calendar Strip scrolls 436pt of cells through a 375pt window. */
const STRIP_Y = 111;
const STRIP_W = 436;

/* --------------------------- spec colour tokens --------------------------- */
const HEADER_INK = "#1a1a1c";
const EYEBROW_INK = "#6b627a";
const MUTED_INK = "#8a819c";
const HEADLINE_INK = "#2b2240";
const METRIC_INK = "#5b4e75";
const TREND_INK = "#853e4b";
const CAPTION_INK = "#4a3a6b";
const LABEL_INK = "#a098ae";
const ADDED_INK = "#575656";
const DAY_OFF_INK = "#5e5e62";
/** Icon strokes the spec colours away from their sibling text. */
const INSTAGRAM_INK = "#e1306c";
const SPARKLE_INK = "#a48aeb";
const SEND_INK = "#545454";

const GLASS_80 = "rgba(255,255,255,0.8)";
const GLASS_70 = "rgba(255,255,255,0.7)";
const GLASS_60 = "rgba(255,255,255,0.6)";
const GLASS_55 = "rgba(255,255,255,0.55)";
const GLASS_50 = "rgba(255,255,255,0.5)";
const GLASS_40 = "rgba(255,255,255,0.4)";
const GLASS_30 = "rgba(255,255,255,0.3)";
const DAY_LABEL_INK = "rgba(255,255,255,0.8)";
const LAVENDER_30 = "rgba(230,230,250,0.3)";
const BLUSH_60 = "rgba(255,240,245,0.6)";

const DAY_GRADIENT = ["#a2b5f5", "#8dc49d"] as const;
const CAPTION_GRADIENT = ["#ffffffb2", "#f5f0ff66"] as const;
const BADGE_GRADIENT = ["#b39ddb", "#dda0dd"] as const;
const GENERATE_GRADIENT = ["#e6e6facc", "#ffe4e1cc", "#ffdab9cc"] as const;
const SEND_GRADIENT = ["#ffe5a4d1", "#fff5e4eb", "#f4d3eee0", "#cad9ffc2"] as const;
const ADD_GRADIENT = ["#e6e6fa", "#ffe4e1"] as const;
const FADE_GRADIENT = ["#faf8fcf2", "#faf8fcf2", "#faf8fc00"] as const;

/* ------------------------------ spec copy --------------------------------- */
const EYEBROW_TEXT = "MON | INSTAGRAM REEL";
const HEADLINE_TEXT = "Discovering hidden gems in\nUbud’s rice paddies...";
const REACH_TEXT = "100K";
const ER_TEXT = "4% ER";
const TRENDING_TEXT = "Trending";
const AUDIO_TEXT = "Big Dawgs";
const ADDED_TEXT = "5 Added";
const HASHTAGS = ["#Travel", "#Ubud", "#RiceFields", "#Lifestyle"];
const CAPTION_TEXT =
  "Woke up to this dream 🌾✨ Ubud,\nyou have my heart. If you're looking\nfor the ultimate escape, save this\nspot for your next Bali trip! Let me\nknow in the comments where you're\nheading next 👇";
const AI_ACTIONS = [
  "Surprise Me",
  "Refine My Idea",
  "Friendly Post?",
  "High Conversion?",
  "Make It Viral",
  "Add CTA",
];
const SEED_HISTORY = ["Discovering Bali", "Luxury travel", "Fashion reel", "Aesthetic skincare"];

/** Week strip cells, with the per-cell label offsets the design ships. */
const DAY_CELLS = [
  { x: 20, w: 57.09, label: "Mo", num: "16", labelY: 124, numY: 146, ink: DAY_LABEL_INK, numInk: "#ffffff" },
  { x: 88, w: 57.77, label: "Tu", num: "17", labelY: 124, numY: 146, ink: DAY_LABEL_INK, numInk: "#ffffff" },
  { x: 156, w: 56, label: "We", num: "18", labelY: 123, numY: 145, ink: DAY_LABEL_INK, numInk: "#ffffff" },
  { x: 224, w: 57.55, label: "Th", num: "19", labelY: 124, numY: 146, ink: DAY_LABEL_INK, numInk: "#ffffff" },
  { x: 292, w: 56.52, label: "Fr", num: "20", labelY: 124, numY: 146, ink: DAY_LABEL_INK, numInk: "#ffffff" },
  { x: 360, w: 56, label: "Sa", num: "21", labelY: 124, numY: 146, ink: DAY_OFF_INK, numInk: HEADER_INK },
] as const;

/* ------------------------------ derivations ------------------------------- */
const DAY_NAMES = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
/** The formats the calendar titles carry; falls back to the design's own. */
const FORMATS = ["REEL", "STORY", "POST"];

function weekday(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "MON" : DAY_NAMES[d.getDay()];
}

function formatOf(title: string): string {
  const up = title.toUpperCase();
  return FORMATS.find((f) => up.includes(f)) ?? "REEL";
}

/** A calendar title ("Travel Reel — Nykaa") carries the idea's tag words. */
function hashtagsOf(title: string): string[] {
  const tags = title
    .split(/[^A-Za-z0-9]+/)
    .filter((w) => w.length > 2)
    .map((w) => `#${w}`);
  return tags.length > 0 ? tags : HASHTAGS;
}

/* -------------------------------- backdrop -------------------------------- */
/** The frame fill: a warm vertical base plus four soft radial glows. */
function Backdrop() {
  return (
    <Svg width={FRAME_W} height={FRAME_H} style={styles.backdrop}>
      <Defs>
        <SvgLinear id="idea-base" x1="187.5" y1="0" x2="187.5" y2={FRAME_H} gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#F7F0E4" />
          <Stop offset="1" stopColor="#F4EBDD" />
        </SvgLinear>
        <RadialGradient id="idea-pink" cx="285" cy="542.5" rx="1027.5" ry="568.75" gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#F7B7DA" stopOpacity="0.34" />
          <Stop offset="0.26" stopColor="#F7B7DA" stopOpacity="0" />
        </RadialGradient>
        <RadialGradient id="idea-blue" cx="90" cy="367.5" rx="967.5" ry="533.75" gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#BACDF4" stopOpacity="0.36" />
          <Stop offset="0.24" stopColor="#BACDF4" stopOpacity="0" />
        </RadialGradient>
        <RadialGradient id="idea-gold" cx="292.5" cy="157.5" rx="1338.75" ry="735" gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#F6D64A" stopOpacity="0.22" />
          <Stop offset="0.2" stopColor="#F6D64A" stopOpacity="0" />
        </RadialGradient>
        <RadialGradient id="idea-haze" cx="75" cy="87.5" rx="1466.25" ry="805" gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#FFFFFF" stopOpacity="0.72" />
          <Stop offset="0.24" stopColor="#FFFFFF" stopOpacity="0" />
        </RadialGradient>
      </Defs>
      <Rect width={FRAME_W} height={FRAME_H} fill="url(#idea-base)" />
      <Rect width={FRAME_W} height={FRAME_H} fill="url(#idea-pink)" />
      <Rect width={FRAME_W} height={FRAME_H} fill="url(#idea-blue)" />
      <Rect width={FRAME_W} height={FRAME_H} fill="url(#idea-gold)" />
      <Rect width={FRAME_W} height={FRAME_H} fill="url(#idea-haze)" />
    </Svg>
  );
}

/* --------------------------------- chips ---------------------------------- */
/**
 * Metrics / hashtag pill. The design pads these 13pt horizontally with a 4pt
 * icon gap inside a 29pt box, so flow layout reproduces the exported widths.
 */
function Pill({
  bg,
  icon,
  label,
  ink,
}: {
  bg: string;
  icon?: ReactNode;
  label: string;
  ink: string;
}) {
  return (
    <View style={[styles.pill, { backgroundColor: bg }]}>
      {icon}
      <Txt size={12} weight={icon ? "semibold" : "regular"} font="inter" color={ink} lineHeight={14.52}>
        {label}
      </Txt>
    </View>
  );
}

/** 38pt AI-suggestion chip and 34pt prompt-history chip share this shell. */
function RailChip({
  label,
  height,
  radius,
  bg,
  ink,
  onPress,
}: {
  label: string;
  height: number;
  radius: number;
  bg: string;
  ink: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.railChip,
        { height, borderRadius: radius, backgroundColor: bg },
        pressed && styles.pressed,
      ]}
    >
      <Txt size={13} weight="medium" font="inter" color={ink} lineHeight={15.73}>
        {label}
      </Txt>
    </Pressable>
  );
}

/* --------------------------------- screen --------------------------------- */
export default function ContentIdeaDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();

  const { data: calendar = [], isLoading } = useCalendar();
  const { data: creators = [] } = useCreators();
  const addToCalendar = useCreate<CalendarItem>("calendar");

  const [draft, setDraft] = useState("");
  const [history, setHistory] = useState<string[]>(SEED_HISTORY);
  /** The design highlights the third cell; selection moves that glow. */
  const [selectedDay, setSelectedDay] = useState(2);

  const idea = useMemo(() => calendar.find((c) => c.id === id) ?? calendar[0], [calendar, id]);
  const creator = useMemo(
    () => creators.find((c) => c.id === idea?.creatorId) ?? creators[0],
    [creators, idea],
  );

  const eyebrow = idea ? `${weekday(idea.scheduledAt)} | INSTAGRAM ${formatOf(idea.title)}` : EYEBROW_TEXT;
  const headline = idea?.title ?? HEADLINE_TEXT;
  const tags = useMemo(() => (idea ? hashtagsOf(idea.title) : HASHTAGS), [idea]);
  const reach = creator ? compact(creator.avgViews).toUpperCase() : REACH_TEXT;
  const engagement = creator ? `${Math.round(creator.engagementRate)}% ER` : ER_TEXT;
  const added = isLoading ? ADDED_TEXT : `${calendar.length} Added`;

  const onAdd = () => {
    if (!idea) return;
    addToCalendar.mutate({
      creatorId: idea.creatorId,
      title: idea.title,
      scheduledAt: idea.scheduledAt,
    });
  };

  const onSend = () => {
    const q = draft.trim();
    if (!q) return;
    setHistory((h) => [q, ...h.filter((p) => p !== q)]);
    setDraft("");
  };

  return (
    <Screen height={FRAME_H} background="#F7F0E4" scroll>
      <Backdrop />

      {/* ------------------------------ Header ------------------------------ */}
      <Pressable
        onPress={() => router.back()}
        style={({ pressed }) => [styles.iconButton, { left: 15 }, pressed && styles.pressed]}
      >
        <Feather name="arrow-left" size={20} color={HEADER_INK} />
      </Pressable>

      <Abs x={115} y={21.5} w={128.88} h={37} radius={20} bg={GLASS_80} style={styles.softShadow}>
        <Abs x={13} y={9.5} w={18} h={18} center>
          <Feather name="instagram" size={18} color={INSTAGRAM_INK} />
        </Abs>
        <Txt x={39} y={9} w={72.88} size={15} weight="semibold" font="inter" color={HEADER_INK} lineHeight={18.15} align="center">
          Instagram
        </Txt>
      </Abs>

      <Abs x={303.88} y={20} w={40} h={40} radius={20} bg={GLASS_70} center style={styles.softShadow}>
        <Feather name="more-vertical" size={20} color="#000000" />
      </Abs>

      {/* ------------------------- Calendar Strip --------------------------- */}
      <Abs x={0} y={STRIP_Y} w={FRAME_W} h={93} style={styles.clip}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.stripContent}
        >
          {DAY_CELLS.map((d, i) => (
            <Pressable
              key={d.label}
              onPress={() => setSelectedDay(i)}
              style={({ pressed }) => [
                styles.dayCell,
                { left: d.x, width: d.w },
                i === selectedDay ? styles.daySelected : styles.dayIdle,
                pressed && styles.pressed,
              ]}
            >
              <LinearGradient
                colors={DAY_GRADIENT}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={styles.dayFill}
              />
              <Txt
                x={0}
                y={d.labelY - STRIP_Y}
                w={d.w}
                size={13}
                weight="semibold"
                font="inter"
                color={d.ink}
                lineHeight={15.73}
                align="center"
              >
                {d.label}
              </Txt>
              <Txt
                x={0}
                y={d.numY - STRIP_Y}
                w={d.w}
                size={18}
                weight="bold"
                font="inter"
                color={d.numInk}
                lineHeight={21.78}
                align="center"
              >
                {d.num}
              </Txt>
            </Pressable>
          ))}
        </ScrollView>
      </Abs>

      {/* ------------------------ Generate More Ideas ----------------------- */}
      <Pressable
        onPress={() => router.push("/content/all-ideas" as never)}
        style={({ pressed }) => [styles.generate, pressed && styles.pressed]}
      >
        <LinearGradient
          colors={GENERATE_GRADIENT}
          start={{ x: 0.21, y: -1.16 }}
          end={{ x: 0.79, y: 2.16 }}
          style={styles.generateFill}
        />
        <Abs x={29} y={13.5} w={16} h={16} center>
          <Ionicons name="sparkles-outline" size={16} color={SPARKLE_INK} />
        </Abs>
        {/* Spec width 156.88 is this string's natural width; left it unbounded
            so the emoji cannot force a wrap when the system face measures wider. */}
        <Txt
          x={53}
          y={13}
          size={14}
          weight="bold"
          font="inter"
          color={CAPTION_INK}
          lineHeight={16.94}
          numberOfLines={1}
        >
          {"✨ Generate More Ideas"}
        </Txt>
      </Pressable>

      {/* --------------------- Idea Card Stack (clipped) -------------------- */}
      <Abs x={0} y={STACK_Y} w={FRAME_W} h={STACK_VIEW_H} style={styles.clip}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          style={styles.stackScroll}
          contentContainerStyle={styles.stackContent}
        >
          {/* The two cards peeking out behind the front face. */}
          <Abs x={26.8} y={rel(334.91)} w={321.39} h={735.19} radius={24} bg={GLASS_30} />
          <Abs x={17.87} y={rel(304.49)} w={339.25} h={776.03} radius={24} bg={GLASS_50} style={styles.cardShadow} />

          {/* Front card. */}
          <Abs x={16} y={0} w={343} h={STACK_H} radius={24} bg={GLASS_55} style={styles.frontShadow} />

          {/* Header Row */}
          <Abs x={37} y={rel(298)} w={16} h={16} center>
            <Feather name="instagram" size={16} color={INSTAGRAM_INK} />
          </Abs>
          <Txt
            x={59}
            y={rel(298.5)}
            size={12}
            weight="semibold"
            font="inter"
            color={EYEBROW_INK}
            lineHeight={14.52}
            letterSpacing={0.5}
            numberOfLines={1}
          >
            {eyebrow}
          </Txt>
          <Pressable
            onPress={onAdd}
            style={({ pressed }) => [styles.addChip, pressed && styles.pressed]}
          >
            <Txt size={11} weight="semibold" font="inter" color={MUTED_INK} lineHeight={13.31}>
              Add
            </Txt>
          </Pressable>

          {/* Preview Image */}
          <Abs x={37} y={rel(330)} w={301} h={219.64} radius={16} bg={GLASS_30} style={styles.preview}>
            {creator?.avatarUrl ? (
              <Image source={{ uri: creator.avatarUrl }} style={styles.previewImage} />
            ) : null}
          </Abs>

          {/* Headline */}
          <Txt
            x={37}
            y={rel(568.49)}
            w={301}
            size={22}
            weight="bold"
            font="inter"
            color={HEADLINE_INK}
            lineHeight={29.7}
            letterSpacing={-0.5}
            numberOfLines={2}
          >
            {headline}
          </Txt>

          {/* Metrics + trending audio */}
          <Abs x={37} y={rel(645.02)} w={301} h={66} style={styles.flow8}>
            <Pill
              bg={GLASS_60}
              ink={METRIC_INK}
              label={reach}
              icon={<Feather name="eye" size={14} color={METRIC_INK} />}
            />
            <Pill
              bg={GLASS_60}
              ink={METRIC_INK}
              label={engagement}
              icon={<Feather name="heart" size={14} color={METRIC_INK} />}
            />
            <Pill
              bg={BLUSH_60}
              ink={TREND_INK}
              label={TRENDING_TEXT}
              icon={<Feather name="trending-up" size={14} color={TREND_INK} />}
            />
            <Pill
              bg={GLASS_60}
              ink={METRIC_INK}
              label={AUDIO_TEXT}
              icon={<Feather name="music" size={14} color={METRIC_INK} />}
            />
          </Abs>

          {/* Hashtags */}
          <Abs x={37} y={rel(727.02)} w={301} h={64} style={styles.flow6}>
            {tags.map((t) => (
              <Pill key={t} bg={LAVENDER_30} ink={EYEBROW_INK} label={t} />
            ))}
          </Abs>

          {/* AI Generated Caption */}
          <Abs x={37} y={rel(807.02)} w={301} h={194} radius={18} style={styles.captionCard}>
            <LinearGradient
              colors={CAPTION_GRADIENT}
              start={{ x: 0.19, y: -0.21 }}
              end={{ x: 0.81, y: 1.21 }}
              style={styles.captionFill}
            />
            <Txt
              x={21}
              y={29}
              w={259}
              size={15}
              weight="regular"
              font="inter"
              color={CAPTION_INK}
              lineHeight={24}
            >
              {CAPTION_TEXT}
            </Txt>
          </Abs>
          <Abs x={54} y={rel(802.02)} w={99.53} h={20} radius={10} style={styles.badge}>
            <LinearGradient
              colors={BADGE_GRADIENT}
              start={{ x: 0.2, y: -0.99 }}
              end={{ x: 0.8, y: 1.99 }}
              style={styles.badgeFill}
            />
            <Abs x={10} y={4} w={12} h={12} center>
              <Ionicons name="sparkles-outline" size={12} color="#ffffff" />
            </Abs>
            <Txt x={26} y={4} w={63.53} size={10} weight="bold" font="inter" color="#ffffff" lineHeight={12.1} letterSpacing={0.5}>
              AI CAPTION
            </Txt>
          </Abs>

          {/* AI Suggestion Buttons */}
          <Abs x={33} y={rel(1017.02)} w={309} h={50} style={styles.clip}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.actionRail}>
              {AI_ACTIONS.map((a) => (
                <RailChip
                  key={a}
                  label={a}
                  height={38}
                  radius={16}
                  bg={GLASS_60}
                  ink={METRIC_INK}
                  onPress={() => setDraft(a)}
                />
              ))}
            </ScrollView>
          </Abs>
        </ScrollView>
      </Abs>

      {/* --------------------------- Prompt History ------------------------- */}
      <Txt x={16} y={615} w={343} size={11} weight="bold" font="inter" color={LABEL_INK} lineHeight={13.31} letterSpacing={0.8}>
        PROMPT HISTORY
      </Txt>
      <Abs x={12} y={640} w={351} h={42} style={styles.clip}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.historyRail}>
          {history.map((p) => (
            <RailChip
              key={p}
              label={p}
              height={34}
              radius={12}
              bg={GLASS_40}
              ink={EYEBROW_INK}
              onPress={() => setDraft(p)}
            />
          ))}
        </ScrollView>
      </Abs>

      {/* ------------------------ Bottom Sticky Actions --------------------- */}
      <Abs x={0} y={687} w={FRAME_W} h={190}>
        <LinearGradient
          colors={FADE_GRADIENT}
          locations={[0, 0.6, 1]}
          start={{ x: 0.5, y: 1 }}
          end={{ x: 0.5, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
      </Abs>

      {/* Chat Input */}
      <Abs x={20} y={707} w={335} h={58} radius={24} bg={GLASS_55} style={styles.chatShadow}>
        <TextInput
          value={draft}
          onChangeText={setDraft}
          onSubmitEditing={onSend}
          returnKeyType="send"
          placeholder="Ask me anything..."
          placeholderTextColor={MUTED_INK}
          style={styles.chatInput}
        />
        <Pressable onPress={onSend} style={({ pressed }) => [styles.sendButton, pressed && styles.pressed]}>
          <LinearGradient
            colors={SEND_GRADIENT}
            locations={[0, 0.35, 0.72, 1]}
            start={{ x: 0.11, y: -0.21 }}
            end={{ x: 0.89, y: 1.21 }}
            style={styles.sendFill}
          />
          <Feather name="arrow-up" size={20} color={SEND_INK} />
        </Pressable>
      </Abs>

      {/* FAB Row */}
      <Pressable
        onPress={() => router.back()}
        style={({ pressed }) => [styles.reject, pressed && styles.pressed]}
      >
        <Feather name="x" size={24} color={LABEL_INK} />
      </Pressable>
      <Pressable onPress={onAdd} style={({ pressed }) => [styles.addPill, pressed && styles.pressed]}>
        <LinearGradient
          colors={ADD_GRADIENT}
          start={{ x: 0.24, y: -5.45 }}
          end={{ x: 0.76, y: 6.45 }}
          style={styles.addPillFill}
        />
        <Abs x={53} y={20} w={19.67} h={19.67} center>
          <Feather name="plus" size={20} color={CAPTION_INK} />
        </Abs>
        <Txt x={90.67} y={20.33} size={16} weight="semibold" font="inter" color={ADDED_INK} lineHeight={19.36} numberOfLines={1}>
          {added}
        </Txt>
      </Pressable>
    </Screen>
  );
}

/** RN 0.86 no longer types absoluteFillObject; the same box, inline. */
const FILL = { position: "absolute", left: 0, top: 0, right: 0, bottom: 0 } as const;

const styles = StyleSheet.create({
  backdrop: { position: "absolute", left: 0, top: 0 },
  clip: { overflow: "hidden" },
  pressed: { opacity: 0.85 },

  /* header */
  iconButton: {
    position: "absolute",
    top: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: GLASS_70,
    shadowColor: "#000000",
    shadowOpacity: 0.03,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 1,
  },
  softShadow: {
    shadowColor: "#000000",
    shadowOpacity: 0.04,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 1,
  },

  /* calendar strip */
  stripContent: { width: STRIP_W, height: 93 },
  dayCell: { position: "absolute", top: 0, height: 69, borderRadius: 20 },
  dayFill: { ...FILL, borderRadius: 20 },
  dayIdle: {
    shadowColor: "#000000",
    shadowOpacity: 0.02,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 1,
  },
  daySelected: {
    shadowColor: "#90c1ab",
    shadowOpacity: 0.25,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },

  /* generate button */
  generate: {
    position: "absolute",
    left: 68.06,
    top: 215,
    width: 238.88,
    height: 44,
    borderRadius: 30,
    shadowColor: "#e6c8dc",
    shadowOpacity: 0.4,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 12 },
    elevation: 3,
  },
  generateFill: { ...FILL, borderRadius: 30 },

  /* idea card stack */
  stackScroll: { flex: 1 },
  stackContent: { width: FRAME_W, height: STACK_H },
  cardShadow: {
    shadowColor: "#000000",
    shadowOpacity: 0.02,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
  },
  frontShadow: {
    shadowColor: "#1e1432",
    shadowOpacity: 0.06,
    shadowRadius: 40,
    shadowOffset: { width: 0, height: 16 },
    elevation: 2,
  },
  addChip: {
    position: "absolute",
    left: 289.72,
    top: 17,
    width: 44,
    height: 23,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: GLASS_70,
  },
  preview: {
    overflow: "hidden",
    shadowColor: "#000000",
    shadowOpacity: 0.06,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
  },
  previewImage: { width: 301, height: 219.64 },

  /* flow rows — reproduce the exported chip widths via padding, not fixed w */
  flow8: { flexDirection: "row", flexWrap: "wrap", columnGap: 8, rowGap: 8 },
  flow6: { flexDirection: "row", flexWrap: "wrap", columnGap: 6, rowGap: 6 },
  pill: {
    height: 29,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 13,
    columnGap: 4,
  },

  /* caption */
  captionCard: {
    shadowColor: "#b4a0ff",
    shadowOpacity: 0.1,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
    elevation: 2,
  },
  captionFill: { ...FILL, borderRadius: 18 },
  badge: {
    shadowColor: "#b496dc",
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  badgeFill: { ...FILL, borderRadius: 10 },

  /* chip rails */
  actionRail: { alignItems: "center", paddingHorizontal: 4, paddingVertical: 4, columnGap: 8 },
  historyRail: { alignItems: "flex-start", paddingHorizontal: 4, columnGap: 10 },
  railChip: {
    justifyContent: "center",
    paddingHorizontal: 17,
    shadowColor: "#000000",
    shadowOpacity: 0.02,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 1,
  },

  /* chat input */
  chatShadow: {
    shadowColor: "#1e1432",
    shadowOpacity: 0.04,
    shadowRadius: 32,
    shadowOffset: { width: 0, height: 12 },
    elevation: 3,
  },
  chatInput: {
    position: "absolute",
    left: 21,
    top: 20,
    width: 265,
    height: 18,
    padding: 0,
    fontFamily: fonts.inter,
    fontSize: 15,
    lineHeight: 18.15,
    color: CAPTION_INK,
  },
  sendButton: {
    position: "absolute",
    left: 286,
    top: 9,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#b496dc",
    shadowOpacity: 0.4,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  sendFill: { ...FILL, borderRadius: 20 },

  /* FAB row */
  reject: {
    position: "absolute",
    left: 20,
    top: 785,
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: GLASS_60,
    shadowColor: "#1e1432",
    shadowOpacity: 0.04,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
    elevation: 2,
  },
  addPill: {
    position: "absolute",
    left: 96,
    top: 785,
    width: 259,
    height: 60,
    borderRadius: 30,
    shadowColor: "#e6c8dc",
    shadowOpacity: 0.5,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 12 },
    elevation: 4,
  },
  addPillFill: { ...FILL, borderRadius: 30 },
});
