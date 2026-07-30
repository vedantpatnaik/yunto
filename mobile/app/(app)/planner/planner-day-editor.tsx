import { useMemo, useState } from "react";
import { Pressable, StyleSheet, TextInput, View } from "react-native";
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
import { useCalendar, useUpdate, type CalendarItem } from "../../../src/api/hooks";

/**
 * Day editor (default) — Figma 7348:20910 "add to calendar" (375x875).
 *
 * The compose view a calendar date opens into: a horizontal week strip whose
 * selected day is a 56x69 gradient pill, a 335x331 glass "Main Editor Card"
 * holding the editable post title and the caption field, and a 335x155 glass
 * card with the "Brand Collaboration" and "Shift content +1 day" switches, both
 * OFF. This state ships no Save CTA, so the title commits on blur.
 *
 * Coordinates are raw frame coordinates; <Screen> scales the 375pt canvas.
 * Figma BACKGROUND_BLUR and INNER_SHADOW have no React Native equivalent — the
 * glass surfaces keep their translucent fills and drop shadows without the
 * backdrop blur or the white inner highlight. Every other value — geometry,
 * colour, radius, size, weight, line-height, tracking — is verbatim.
 */

/* ------------------------------- geometry -------------------------------- */
const FRAME_W = 375;
const FRAME_H = 875;

/** Calendar Strip clips its trailing day card at x=375, exactly as designed. */
const STRIP_Y = 107;
const STRIP_H = 93;

/* --------------------------- spec colour tokens --------------------------- */
const INK = "#1a1a1c";
const MUTED = "#5e5e62";
const PLACEHOLDER = "#a0a0a5";
/** Title caret + Brand Collaboration glyph. */
const LILAC = "#c9a7ff";
/** Shift-content glyph. */
const PINK = "#ec4899";
const IG = "#e1306c";
const TRACK_OFF = "#cccccc";

const GLASS_50 = "rgba(255,255,255,0.5)";
const GLASS_60 = "rgba(255,255,255,0.6)";
const GLASS_65 = "rgba(255,255,255,0.65)";
const GLASS_70 = "rgba(255,255,255,0.7)";
const GLASS_80 = "rgba(255,255,255,0.8)";
const BORDER_90 = "rgba(255,255,255,0.9)";
const HAIRLINE = "rgba(0,0,0,0.04)";

const DAY_GRADIENT = ["#a2b5f5", "#8dc49d"] as const;

/* -------------------------------- backdrop -------------------------------- */
/** Frame fill: a warm vertical base plus four soft radial glows. */
function Backdrop() {
  return (
    <Svg width={FRAME_W} height={FRAME_H} style={styles.backdrop}>
      <Defs>
        <SvgLinear id="pde-base" x1="187.5" y1="0" x2="187.5" y2={FRAME_H} gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#F7F0E4" />
          <Stop offset="1" stopColor="#F4EBDD" />
        </SvgLinear>
        <RadialGradient id="pde-pink" cx="285" cy="542.5" rx="1027.5" ry="568.75" gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#F7B7DA" stopOpacity="0.34" />
          <Stop offset="0.26" stopColor="#F7B7DA" stopOpacity="0" />
        </RadialGradient>
        <RadialGradient id="pde-blue" cx="90" cy="367.5" rx="967.5" ry="533.75" gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#BACDF4" stopOpacity="0.36" />
          <Stop offset="0.24" stopColor="#BACDF4" stopOpacity="0" />
        </RadialGradient>
        <RadialGradient id="pde-gold" cx="292.5" cy="157.5" rx="1338.75" ry="735" gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#F6D64A" stopOpacity="0.22" />
          <Stop offset="0.2" stopColor="#F6D64A" stopOpacity="0" />
        </RadialGradient>
        <RadialGradient id="pde-haze" cx="75" cy="87.5" rx="1466.25" ry="805" gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#FFFFFF" stopOpacity="0.72" />
          <Stop offset="0.24" stopColor="#FFFFFF" stopOpacity="0" />
        </RadialGradient>
      </Defs>
      <Rect width={FRAME_W} height={FRAME_H} fill="url(#pde-base)" />
      <Rect width={FRAME_W} height={FRAME_H} fill="url(#pde-pink)" />
      <Rect width={FRAME_W} height={FRAME_H} fill="url(#pde-blue)" />
      <Rect width={FRAME_W} height={FRAME_H} fill="url(#pde-gold)" />
      <Rect width={FRAME_W} height={FRAME_H} fill="url(#pde-haze)" />
    </Svg>
  );
}

/* ----------------------------- calendar strip ----------------------------- */
interface DaySlot {
  /** Card x; every card is 56x69 at strip-relative y=0. */
  x: number;
  labelX: number;
  labelW: number;
  dateX: number;
  dateW: number;
  /** Fallback copy for the loading/empty state. */
  label: string;
  date: string;
}

/** Six day cards on a 68pt step; text offsets are the design's own centring. */
const DAY_SLOTS: DaySlot[] = [
  { x: 20, labelX: 38.05, labelW: 19.91, dateX: 38.28, dateW: 19.45, label: "Mo", date: "16" },
  { x: 88, labelX: 108.2, labelW: 15.59, dateX: 106.88, dateW: 18.23, label: "Tu", date: "17" },
  { x: 156, labelX: 173.84, labelW: 20.3, dateX: 174.25, dateW: 19.48, label: "We", date: "18" },
  { x: 224, labelX: 243.72, labelW: 16.55, dateX: 242.27, dateW: 19.45, label: "Th", date: "19" },
  { x: 292, labelX: 313.73, labelW: 12.52, dateX: 308.25, dateW: 23.48, label: "Fr", date: "20" },
  { x: 360, labelX: 380.04, labelW: 15.92, dateX: 378.44, dateW: 19.11, label: "Sa", date: "21" },
];

/** Mo..Sa, indexed the way the strip runs. */
const WEEKDAY_TWO = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

/** Monday of the week containing `d`, then the six weekdays the strip shows. */
function weekFrom(d: Date): Date[] {
  const monday = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
  return DAY_SLOTS.map((_, i) => {
    const day = new Date(monday.getTime());
    day.setDate(day.getDate() + i);
    return day;
  });
}

function sameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/* -------------------------------- switches -------------------------------- */
/**
 * Background+Shadow — the 44x24 track with its 20x20 knob. The frame ships both
 * switches OFF (#cccccc, knob inset 3); ON reuses the row's own glyph colour.
 */
function Switch({
  x, y, on, onColor, onPress,
}: { x: number; y: number; on: boolean; onColor: string; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.track,
        { left: x, top: y, backgroundColor: on ? onColor : TRACK_OFF },
        pressed && styles.pressed,
      ]}
    >
      <View style={[styles.knob, { left: on ? 21 : 3 }]} />
    </Pressable>
  );
}

/* --------------------------------- screen --------------------------------- */
export default function PlannerDayEditor() {
  const router = useRouter();
  const { data = [], isLoading } = useCalendar();
  const update = useUpdate<CalendarItem>("calendar");

  const [pickedIso, setPickedIso] = useState<string | null>(null);
  const [title, setTitle] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [editingTitle, setEditingTitle] = useState(false);
  const [brandCollab, setBrandCollab] = useState(false);
  const [shiftDay, setShiftDay] = useState(false);

  /** Entries in schedule order; the first is the day the editor opens on. */
  const entries = useMemo(
    () =>
      data
        .filter((e) => !Number.isNaN(new Date(e.scheduledAt).getTime()))
        .sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt)),
    [data],
  );

  const anchor = useMemo(() => {
    if (pickedIso) return new Date(pickedIso);
    return entries.length ? new Date(entries[0].scheduledAt) : null;
  }, [pickedIso, entries]);

  /** Mo..Sa of the anchor's week; null until the calendar resolves. */
  const week = useMemo(() => (anchor ? weekFrom(anchor) : null), [anchor]);

  /** The GET /calendar entry that falls on the selected date. */
  const entry = useMemo(
    () =>
      anchor
        ? (entries.find((e) => sameDay(new Date(e.scheduledAt), anchor)) ?? null)
        : null,
    [entries, anchor],
  );

  const titleValue = title ?? entry?.title ?? "Instagram Post: Behind the\nScenes...";

  /** No Save CTA in this state, so the title commits when the field blurs. */
  const commitTitle = () => {
    setEditingTitle(false);
    if (entry && title !== null && title !== entry.title) {
      update.mutate({ id: entry.id, data: { title } });
    }
  };

  const activeIndex = week && anchor ? week.findIndex((d) => sameDay(d, anchor)) : 2;

  return (
    <Screen height={FRAME_H} background="#F7F0E4" scroll>
      <Backdrop />

      {/* ================================ Header ============================ */}
      {/* Button — back */}
      <Pressable
        onPress={() => router.back()}
        style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
      >
        <Feather name="arrow-left" size={20} color={INK} />
      </Pressable>

      {/* Button — platform */}
      <Abs
        x={121}
        y={21.5}
        w={152.88}
        h={37}
        radius={20}
        bg={GLASS_80}
        border={BORDER_90}
        borderWidth={1}
        style={styles.softShadow}
      >
        {/* Container / iconify-icon */}
        <Abs x={13} y={9.5} w={18} h={18} center>
          <Feather name="instagram" size={18} color={IG} />
        </Abs>
        <Txt
          x={39}
          y={9}
          w={72.88}
          size={15}
          weight="semibold"
          font="inter"
          color={INK}
          lineHeight={18.15}
          align="center"
        >
          Instagram
        </Txt>
        {/* iconify-icon — chevron */}
        <Abs x={119.88} y={10.5} w={16} h={16} center>
          <Feather name="chevron-down" size={16} color={MUTED} />
        </Abs>
      </Abs>

      {/* ============================ Calendar Strip ======================== */}
      <Abs x={0} y={STRIP_Y} w={FRAME_W} h={STRIP_H} style={styles.clip}>
        {DAY_SLOTS.map((slot, i) => {
          const active = i === activeIndex;
          const day = week ? week[i] : null;
          const label = day ? WEEKDAY_TWO[day.getDay()] : slot.label;
          const date = day ? String(day.getDate()) : slot.date;
          return (
            <Pressable
              key={slot.x}
              onPress={() => day && setPickedIso(day.toISOString())}
              style={({ pressed }) => [
                styles.day,
                { left: slot.x },
                active ? styles.dayActiveShadow : styles.dayShadow,
                !active && styles.dayIdle,
                pressed && styles.pressed,
              ]}
            >
              {active ? (
                <LinearGradient
                  colors={[DAY_GRADIENT[0], DAY_GRADIENT[1]]}
                  start={{ x: 0, y: 0.5 }}
                  end={{ x: 1, y: 0.5 }}
                  style={StyleSheet.absoluteFill}
                />
              ) : null}
            </Pressable>
          );
        })}

        {DAY_SLOTS.map((slot, i) => {
          const active = i === activeIndex;
          const day = week ? week[i] : null;
          return (
            <Txt
              key={`l-${slot.x}`}
              x={slot.labelX}
              y={active ? 12 : 13}
              w={slot.labelW}
              size={13}
              weight="semibold"
              font="inter"
              color={active ? GLASS_80 : MUTED}
              lineHeight={15.73}
            >
              {day ? WEEKDAY_TWO[day.getDay()] : slot.label}
            </Txt>
          );
        })}

        {DAY_SLOTS.map((slot, i) => {
          const active = i === activeIndex;
          const day = week ? week[i] : null;
          return (
            <Txt
              key={`d-${slot.x}`}
              x={slot.dateX}
              y={active ? 34 : 35}
              w={slot.dateW}
              size={18}
              weight="bold"
              font="inter"
              color={active ? "#ffffff" : INK}
              lineHeight={21.78}
            >
              {day ? String(day.getDate()) : slot.date}
            </Txt>
          );
        })}
      </Abs>

      {/* =========================== Main Editor Card ======================= */}
      <Abs
        x={20}
        y={200}
        w={335}
        h={331}
        radius={24}
        bg={GLASS_65}
        border={BORDER_90}
        borderWidth={1}
        style={styles.cardShadow}
      />

      {/* Container / Text — the entry title, editable */}
      <TextInput
        value={titleValue}
        onChangeText={setTitle}
        onFocus={() => setEditingTitle(true)}
        onBlur={commitTitle}
        multiline
        editable={!isLoading}
        selectionColor={LILAC}
        style={styles.titleInput}
      />
      {/* Vertical Divider — the design's caret, parked after "Scenes..." */}
      {editingTitle ? null : (
        <Abs x={145.03} y={261.8} w={2} h={22} bg={LILAC} />
      )}

      {/* Container / caption field */}
      <TextInput
        value={caption}
        onChangeText={setCaption}
        placeholder={"Write your caption here or let AI draft\nit for you."}
        placeholderTextColor={PLACEHOLDER}
        multiline
        selectionColor={LILAC}
        style={styles.captionInput}
      />

      {/* ============================ Extra Controls ======================== */}
      <Abs
        x={20}
        y={571}
        w={335}
        h={155}
        radius={24}
        bg={GLASS_60}
        border={BORDER_90}
        borderWidth={1}
        style={styles.controlsShadow}
      />

      {/* Toggle 1 — Brand Collaboration (bottom hairline) */}
      <Abs x={41} y={648} w={293} h={1} bg={HAIRLINE} />
      <Abs x={41} y={596} w={36} h={36} radius={12} bg={GLASS_80} center>
        <Feather name="briefcase" size={18} color={LILAC} />
      </Abs>
      <Txt
        x={89}
        y={604.5}
        w={143.75}
        size={15}
        weight="semibold"
        font="inter"
        color={INK}
        lineHeight={18.15}
      >
        Brand Collaboration
      </Txt>
      <Switch
        x={290}
        y={602}
        on={brandCollab}
        onColor={LILAC}
        onPress={() => setBrandCollab((v) => !v)}
      />

      {/* Toggle 2 — Shift content +1 day */}
      <Abs x={41} y={665} w={36} h={36} radius={12} bg={GLASS_80} center>
        <MaterialCommunityIcons name="calendar-clock-outline" size={18} color={PINK} />
      </Abs>
      <Txt
        x={89}
        y={673.5}
        w={143.3}
        size={15}
        weight="semibold"
        font="inter"
        color={INK}
        lineHeight={18.15}
      >
        Shift content +1 day
      </Txt>
      <Switch
        x={290}
        y={671}
        on={shiftDay}
        onColor={PINK}
        onPress={() => setShiftDay((v) => !v)}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  backdrop: { position: "absolute", left: 0, top: 0 },
  clip: { overflow: "hidden" },
  pressed: { opacity: 0.9 },

  /* Header / Button — 40x40 glass disc, DROP_SHADOW 0/4 r12 #000 @3%. */
  backButton: {
    position: "absolute",
    left: 15,
    top: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: GLASS_70,
    borderWidth: 1,
    borderColor: BORDER_90,
    shadowColor: "#000000",
    shadowOpacity: 0.03,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  /* Header / Button — DROP_SHADOW 0/4 r12 #000 @4%. */
  softShadow: {
    shadowColor: "#000000",
    shadowOpacity: 0.04,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },

  /* Calendar Strip — 56x69 day card, strip-relative y=0. */
  day: {
    position: "absolute",
    top: 0,
    width: 56,
    height: 69,
    borderRadius: 20,
    overflow: "hidden",
  },
  dayIdle: {
    backgroundColor: GLASS_50,
    borderWidth: 1,
    borderColor: BORDER_90,
  },
  /* DROP_SHADOW 0/4 r12 #000 @2%. */
  dayShadow: {
    shadowColor: "#000000",
    shadowOpacity: 0.02,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  /* DROP_SHADOW 0/8 r20 #90c1ab @25%. */
  dayActiveShadow: {
    shadowColor: "#90c1ab",
    shadowOpacity: 0.25,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },

  /* Main Editor Card — DROP_SHADOW 0/12 r32 #000 @3%. */
  cardShadow: {
    shadowColor: "#000000",
    shadowOpacity: 0.03,
    shadowRadius: 32,
    shadowOffset: { width: 0, height: 12 },
    elevation: 2,
  },
  titleInput: {
    position: "absolute",
    left: 45,
    top: 224.4,
    width: 278.86,
    height: 62,
    padding: 0,
    textAlignVertical: "top",
    fontFamily: "Inter_500Medium",
    fontSize: 22,
    lineHeight: 30.8,
    letterSpacing: -0.4,
    color: INK,
  },
  captionInput: {
    position: "absolute",
    left: 45,
    top: 298.59,
    width: 285,
    height: 48,
    padding: 0,
    textAlignVertical: "top",
    fontFamily: "Inter_500Medium",
    fontSize: 16,
    lineHeight: 24,
    color: INK,
  },

  /* Extra Controls — DROP_SHADOW 0/8 r24 #000 @2%. */
  controlsShadow: {
    shadowColor: "#000000",
    shadowOpacity: 0.02,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
    elevation: 1,
  },

  /* Background+Shadow — 44x24 track, 20x20 knob at inset 3. */
  track: {
    position: "absolute",
    width: 44,
    height: 24,
    borderRadius: 12,
  },
  knob: {
    position: "absolute",
    top: 2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#ffffff",
    shadowColor: "#000000",
    shadowOpacity: 0.2,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
});
