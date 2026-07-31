import { useMemo, useState } from "react";
import { Pressable, StyleSheet, TextInput, View } from "react-native";
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
import { useCalendar, useUpdate, type CalendarItem } from "../../../src/api/hooks";

/**
 * Set Content Date — Figma 7358:25812 "Set content date" (375x875).
 *
 * The modal state of the content itinerary: the calendar strip, the "Generate
 * More Ideas" pill and the idea-card stack stay on the base layer behind a
 * #b5b4b9 scrim, and a 375x373 sheet rises from y=502 with three date presets,
 * an mm/dd/yyyy field and the 301x55 "Add" button. While the sheet is open the
 * base footer collapses to the single centred "Set content date" pill.
 *
 * Coordinates are raw frame coordinates; <Screen> scales the 375pt canvas.
 */

/* ------------------------------- geometry -------------------------------- */
const FRAME_W = 375;
const FRAME_H = 875;

/** Calendar strip clips the trailing day card at x=375, exactly as designed. */
const STRIP_Y = 111;
const STRIP_H = 93;

/** Idea-card stack: containers at y=344 then y=520 inside the 424pt glass card. */
const CARD_FIRST_Y = 344;
const CARD_STEP = 176;
const MAX_CARDS = 2;

const SHEET_Y = 502;
const SHEET_H = 373;

/* --------------------------- spec colour tokens --------------------------- */
const INK_HEADER = "#1a1a1c";
const INK_CARD = "#2b2240";
const META_INK = "#6b7280";
const TITLE_INK = "#121417";
const BODY_INK = "#6b7582";
const SHEET_TITLE_INK = "#111111";
const PRESET_INK = "#374151";
const DARK_PILL = "#312b28";
const GLASS_70 = "rgba(255,255,255,0.7)";
const GLASS_80 = "rgba(255,255,255,0.8)";
const BORDER_90 = "rgba(255,255,255,0.9)";
const SCRIM = "rgba(181,180,185,0.57)";
const HANDLE = "#e5e5e5";
const DAY_GRADIENT = ["#a2b5f5", "#8dc49d"] as const;

/** Only the selected preset is stroked; the other two boxes render bare. */
const PRESET_BORDER_ON = "#e4e4e4";
const PRESET_BORDER_OFF = "transparent";

/* ------------------------------ date helpers ------------------------------ */
const WEEKDAY_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

/** "Thu, Jun 19" — the preset-row and card-meta date format in the design. */
function fmtDate(d: Date): string {
  return `${WEEKDAY_SHORT[d.getDay()]}, ${MONTH_SHORT[d.getMonth()]} ${d.getDate()}`;
}

function addDays(base: Date, days: number): Date {
  const d = new Date(base.getTime());
  d.setDate(d.getDate() + days);
  return d;
}

/** mm/dd/yyyy typed into the manual field, or null while it is incomplete. */
function parseManual(text: string): Date | null {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(text.trim());
  if (!m) return null;
  const d = new Date(Number(m[3]), Number(m[1]) - 1, Number(m[2]));
  return Number.isNaN(d.getTime()) ? null : d;
}

/* -------------------------------- backdrop -------------------------------- */
/** The frame fill: a warm vertical base plus four soft radial glows. */
function Backdrop() {
  return (
    <Svg width={FRAME_W} height={FRAME_H} style={styles.backdrop}>
      <Defs>
        <SvgLinear id="scd-base" x1="187.5" y1="0" x2="187.5" y2={FRAME_H} gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#F7F0E4" />
          <Stop offset="1" stopColor="#F4EBDD" />
        </SvgLinear>
        <RadialGradient id="scd-pink" cx="285" cy="542.5" rx="1027.5" ry="568.75" gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#F7B7DA" stopOpacity="0.34" />
          <Stop offset="0.26" stopColor="#F7B7DA" stopOpacity="0" />
        </RadialGradient>
        <RadialGradient id="scd-blue" cx="90" cy="367.5" rx="967.5" ry="533.75" gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#BACDF4" stopOpacity="0.36" />
          <Stop offset="0.24" stopColor="#BACDF4" stopOpacity="0" />
        </RadialGradient>
        <RadialGradient id="scd-gold" cx="292.5" cy="157.5" rx="1338.75" ry="735" gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#F6D64A" stopOpacity="0.22" />
          <Stop offset="0.2" stopColor="#F6D64A" stopOpacity="0" />
        </RadialGradient>
        <RadialGradient id="scd-haze" cx="75" cy="87.5" rx="1466.25" ry="805" gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#FFFFFF" stopOpacity="0.72" />
          <Stop offset="0.24" stopColor="#FFFFFF" stopOpacity="0" />
        </RadialGradient>
      </Defs>
      <Rect width={FRAME_W} height={FRAME_H} fill="url(#scd-base)" />
      <Rect width={FRAME_W} height={FRAME_H} fill="url(#scd-pink)" />
      <Rect width={FRAME_W} height={FRAME_H} fill="url(#scd-blue)" />
      <Rect width={FRAME_W} height={FRAME_H} fill="url(#scd-gold)" />
      <Rect width={FRAME_W} height={FRAME_H} fill="url(#scd-haze)" />
    </Svg>
  );
}

/* ----------------------------- calendar strip ----------------------------- */
interface DaySpec {
  x: number;
  w: number;
  /** Only the selected (We / 18) card drops the white hairline border. */
  bordered: boolean;
  day: string;
  dayX: number;
  dayY: number;
  dayW: number;
  dayColor: string;
  date: string;
  dateX: number;
  dateY: number;
  dateW: number;
  dateColor: string;
}

const DAY_WHITE = "rgba(255,255,255,0.8)";

/** Six 69pt day cards; coordinates are strip-relative (frame y minus 111). */
const DAYS: DaySpec[] = [
  { x: 20, w: 57.09, bordered: true, day: "Mo", dayX: 38.55, dayY: 13, dayW: 20, dayColor: DAY_WHITE, date: "16", dateX: 38.05, dateY: 35, dateW: 21, dateColor: "#ffffff" },
  { x: 88, w: 57.77, bordered: true, day: "Tu", dayX: 108.88, dayY: 13, dayW: 16, dayColor: DAY_WHITE, date: "17", dateX: 106.88, dateY: 35, dateW: 20, dateColor: "#ffffff" },
  { x: 156, w: 56, bordered: false, day: "We", dayX: 173.84, dayY: 12, dayW: 20.3, dayColor: DAY_WHITE, date: "18", dateX: 174.25, dateY: 34, dateW: 19.48, dateColor: "#ffffff" },
  { x: 224, w: 57.55, bordered: true, day: "Th", dayX: 244.27, dayY: 13, dayW: 17, dayColor: DAY_WHITE, date: "19", dateX: 242.27, dateY: 35, dateW: 21, dateColor: "#ffffff" },
  { x: 292, w: 56.52, bordered: true, day: "Fr", dayX: 313.75, dayY: 13, dayW: 13, dayColor: DAY_WHITE, date: "20", dateX: 308.25, dateY: 35, dateW: 24, dateColor: "#ffffff" },
  { x: 360, w: 56, bordered: true, day: "Sa", dayX: 380.04, dayY: 13, dayW: 15.92, dayColor: "#5e5e62", date: "21", dateX: 378.44, dateY: 35, dateW: 19.11, dateColor: INK_HEADER },
];

function DayCard({ spec }: { spec: DaySpec }) {
  return (
    <Abs
      x={spec.x}
      y={0}
      w={spec.w}
      h={69}
      radius={20}
      border={spec.bordered ? BORDER_90 : undefined}
      borderWidth={spec.bordered ? 1 : undefined}
      style={[styles.clip, spec.bordered ? styles.dayShadow : styles.daySelectedShadow]}
    >
      <LinearGradient
        colors={[DAY_GRADIENT[0], DAY_GRADIENT[1]]}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={StyleSheet.absoluteFill}
      />
    </Abs>
  );
}

/* ------------------------------- idea cards ------------------------------- */
/** Per-slot chrome the design ships: tint, thumbnail box and text widths. */
const CARD_SLOTS = [
  { bg: "#f5eefb", kind: "Instagram Reel", img: { x: 199, y: 10, w: 95, h: 140 }, titleW: 175, bodyW: 180 },
  { bg: "#f6fbee", kind: "Instagram Carousel", img: { x: 206, y: 14, w: 87, h: 127 }, titleW: 176, bodyW: 188 },
] as const;

/** 16x16 skill-icons:instagram — gradient tile with the white camera glyph. */
function IgGlyph({ x, y }: { x: number; y: number }) {
  return (
    <Abs x={x} y={y} w={16} h={16} radius={5} center style={styles.clip}>
      <LinearGradient
        colors={["#ffdd55", "#ff543e", "#c837ab"]}
        start={{ x: 0, y: 1 }}
        end={{ x: 1, y: 0 }}
        style={StyleSheet.absoluteFill}
      />
      <Feather name="instagram" size={10} color="#ffffff" />
    </Abs>
  );
}

interface IdeaRowProps {
  index: number;
  meta: string;
  title: string;
  body: string;
}

/** 301x160 tinted content block; child offsets are container-relative. */
function IdeaRow({ index, meta, title, body }: IdeaRowProps) {
  const slot = CARD_SLOTS[index];
  return (
    <Abs x={37} y={CARD_FIRST_Y + index * CARD_STEP} w={301} h={160} radius={8} bg={slot.bg}>
      <Abs x={slot.img.x} y={slot.img.y} w={slot.img.w} h={slot.img.h} radius={8} style={styles.clip}>
        <LinearGradient
          colors={[DAY_GRADIENT[0], DAY_GRADIENT[1]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      </Abs>

      <IgGlyph x={10.5} y={14} />
      <Txt x={31.5} y={14} w={123} size={10} weight="regular" font="inter" color={META_INK} lineHeight={16} numberOfLines={1}>
        {meta}
      </Txt>
      <Txt x={12} y={34} w={slot.titleW} size={12} weight="medium" font="inter" color={TITLE_INK} lineHeight={20} numberOfLines={2}>
        {title}
      </Txt>
      <Txt x={11} y={79} w={slot.bodyW} size={10} weight="regular" font="inter" color={BODY_INK} lineHeight={18} numberOfLines={4}>
        {body}
      </Txt>
    </Abs>
  );
}

/* --------------------------------- screen --------------------------------- */
export default function ContentItinerarySetDate() {
  const router = useRouter();
  const { data = [], isLoading } = useCalendar();
  const update = useUpdate<CalendarItem>("calendar");

  const [sheetOpen, setSheetOpen] = useState(true);
  const [presetIndex, setPresetIndex] = useState(0);
  const [manualDate, setManualDate] = useState("");

  /** Today / Tomorrow / Next Week, rendered in the design's "Thu, Jun 19" form. */
  const presets = useMemo(() => {
    const now = new Date();
    return [
      { label: "Today", when: now },
      { label: "Tomorrow", when: addDays(now, 1) },
      { label: "Next Week", when: addDays(now, 7) },
    ].map((p) => ({ label: p.label, date: fmtDate(p.when), when: p.when }));
  }, []);

  const rows = useMemo(
    () =>
      data.slice(0, MAX_CARDS).map((item) => {
        const when = new Date(item.scheduledAt);
        const day = Number.isNaN(when.getTime()) ? "" : `${WEEKDAY_SHORT[when.getDay()]} | `;
        return {
          id: item.id,
          meta: day,
          title: item.title,
          detail: Number.isNaN(when.getTime()) ? item.status : `${item.status} · ${fmtDate(when)}`,
        };
      }),
    [data],
  );

  /** Commit the chosen date onto the itinerary item, then dismiss the sheet. */
  const setContentDate = () => {
    const item = rows[0];
    const when = parseManual(manualDate) ?? presets[presetIndex].when;
    if (item) update.mutate({ id: item.id, data: { scheduledAt: when.toISOString() } });
    setSheetOpen(false);
  };

  return (
    <Screen height={FRAME_H} background="#F7F0E4" scroll>
      <Backdrop />

      {/* ------------------------------ Header ------------------------------ */}
      <Pressable
        onPress={() => router.back()}
        style={({ pressed }) => [styles.glassButton, { left: 15, top: 20 }, pressed && styles.pressed]}
      >
        <Feather name="arrow-left" size={20} color={INK_HEADER} />
      </Pressable>

      <Abs x={115} y={21.5} w={128.88} h={37} radius={20} bg={GLASS_80} border={BORDER_90} borderWidth={1} style={styles.softShadow}>
        <Abs x={13} y={9.5} w={18} h={18} center>
          <Feather name="instagram" size={18} color="#e1306c" />
        </Abs>
        <Txt x={39} y={9} w={72.88} size={15} weight="semibold" font="inter" color={INK_HEADER} lineHeight={18.15} align="center">
          Instagram
        </Txt>
      </Abs>

      <Abs x={303.88} y={20} w={40} h={40} radius={20} bg={GLASS_70} border={BORDER_90} borderWidth={1} center style={styles.softShadow}>
        <Feather name="more-vertical" size={20} color="#000000" />
      </Abs>

      {/* -------------------------- Calendar strip -------------------------- */}
      <Abs x={0} y={STRIP_Y} w={FRAME_W} h={STRIP_H} style={styles.clip}>
        {DAYS.map((d) => (
          <DayCard key={d.date} spec={d} />
        ))}
        {DAYS.map((d) => (
          <Txt
            key={`l-${d.date}`}
            x={d.dayX}
            y={d.dayY}
            w={d.dayW}
            size={13}
            weight="semibold"
            font="inter"
            color={d.dayColor}
            lineHeight={15.73}
          >
            {d.day}
          </Txt>
        ))}
        {DAYS.map((d) => (
          <Txt
            key={`n-${d.date}`}
            x={d.dateX}
            y={d.dateY}
            w={d.dateW}
            size={18}
            weight="bold"
            font="inter"
            color={d.dateColor}
            lineHeight={21.78}
          >
            {d.date}
          </Txt>
        ))}
      </Abs>

      {/* -------------------------- Generate button ------------------------- */}
      <Abs
        x={68.06}
        y={215}
        w={238.88}
        h={44}
        radius={30}
        border="rgba(43,34,64,0.05)"
        borderWidth={1}
        style={[styles.clip, styles.generateShadow]}
      >
        <LinearGradient
          colors={["rgba(230,230,250,0.8)", "rgba(255,228,225,0.8)", "rgba(255,218,185,0.8)"]}
          start={{ x: 0.21, y: 0 }}
          end={{ x: 0.79, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      </Abs>
      <Abs x={97.06} y={228.5} w={16} h={16} center>
        <Feather name="zap" size={16} color="#a48aeb" />
      </Abs>
      {/* Figma measures this label at 156.88pt, but the platform emoji is a few
          points wider, so the box is widened (still well inside the pill's
          306.94pt right edge) and pinned to one line instead of wrapping out. */}
      <Txt
        x={121.06}
        y={228}
        w={172}
        size={14}
        weight="bold"
        font="inter"
        color="#4a3a6b"
        lineHeight={16.94}
        numberOfLines={1}
      >
        ✨ Generate More Ideas
      </Txt>

      {/* --------------------------- Idea card stack ------------------------ */}
      <Abs x={26.8} y={334.91} w={321.39} h={348.19} radius={24} bg="rgba(255,255,255,0.3)" border="rgba(43,34,64,0.04)" borderWidth={1} />
      <Abs x={17.87} y={304.49} w={339.25} h={389.03} radius={24} bg="rgba(255,255,255,0.5)" border="rgba(43,34,64,0.05)" borderWidth={1} style={styles.stackShadow} />
      <Abs x={16} y={277} w={343} h={424} radius={24} bg="rgba(255,255,255,0.55)" border="rgba(43,34,64,0.06)" borderWidth={1} style={styles.cardShadow} />

      <Txt x={37} y={298} w={301} size={20} weight="semibold" font="inter" color={INK_CARD} lineHeight={29.7} letterSpacing={-0.5}>
        Your Content
      </Txt>

      {rows.map((r, i) => (
        <IdeaRow key={r.id} index={i} meta={`${r.meta}${CARD_SLOTS[i].kind}`} title={r.title} body={r.detail} />
      ))}
      {!isLoading && rows.length === 0 ? (
        <Abs x={37} y={CARD_FIRST_Y} w={301} h={160} radius={8} bg={CARD_SLOTS[0].bg}>
          <Txt x={12} y={34} w={175} size={12} weight="medium" font="inter" color={TITLE_INK} lineHeight={20}>
            No content yet
          </Txt>
        </Abs>
      ) : null}

      {/* --------------- Base footer (collapsed to one button) -------------- */}
      <Abs x={0} y={776} w={FRAME_W} h={99} bg="rgba(246,239,233,0.85)" />
      <Pressable
        onPress={() => setSheetOpen(true)}
        style={({ pressed }) => [styles.footerButton, pressed && styles.pressed]}
      >
        <Txt size={14} weight="medium" font="inter" color="#ffffff" lineHeight={16.94} align="center">
          Set content date
        </Txt>
      </Pressable>

      {/* ------------------------- Scrim + bottom sheet --------------------- */}
      {sheetOpen ? (
        <Abs x={0} y={0} w={FRAME_W} h={FRAME_H} bg={SCRIM} style={styles.clip}>
          <Pressable onPress={() => setSheetOpen(false)} style={styles.scrimTap} />

          <Abs x={0} y={SHEET_Y} w={FRAME_W} h={SHEET_H} bg="#ffffff" style={styles.sheet}>
            {/* Grab handle */}
            <Abs x={167.5} y={16} w={40} h={4} radius={2} bg={HANDLE} />

            {/* Title + close */}
            <Txt
              x={24}
              y={44}
              w={280}
              size={24}
              weight="semibold"
              font="inter"
              color={SHEET_TITLE_INK}
              lineHeight={29.05}
              letterSpacing={-0.52}
              numberOfLines={2}
            >
              Select Date For this Content
            </Txt>
            <Pressable
              onPress={() => setSheetOpen(false)}
              style={({ pressed }) => [styles.closeButton, pressed && styles.pressed]}
            >
              <Feather name="x" size={20} color="#555555" />
            </Pressable>

            {/* Presets */}
            {[
              { x: 24, y: 124, w: 108, labelX: 55.34, labelY: 138, labelW: 37.59, dateX: 44, dateY: 163, dateW: 59.85 },
              { x: 137, y: 123, w: 100, labelX: 155, labelY: 137, labelW: 64.68, dateX: 159.34, dateY: 160.67, dateW: 52.92 },
              { x: 242, y: 124, w: 100, labelX: 257, labelY: 139, labelW: 69.49, dateX: 261.25, dateY: 161.67, dateW: 59.85 },
            ].map((box, i) => (
              <View key={presets[i].label}>
                <Pressable
                  onPress={() => setPresetIndex(i)}
                  style={({ pressed }) => [
                    styles.preset,
                    {
                      left: box.x,
                      top: box.y,
                      width: box.w,
                      borderColor: presetIndex === i ? PRESET_BORDER_ON : PRESET_BORDER_OFF,
                    },
                    pressed && styles.pressed,
                  ]}
                />
                <Txt
                  x={box.labelX}
                  y={box.labelY}
                  w={box.labelW}
                  size={11.9}
                  weight="medium"
                  font="inter"
                  color={PRESET_INK}
                  lineHeight={20}
                  align="center"
                >
                  {presets[i].label}
                </Txt>
                <Txt
                  x={box.dateX}
                  y={box.dateY}
                  w={box.dateW}
                  size={10.2}
                  weight="regular"
                  font="inter"
                  color={META_INK}
                  lineHeight={16}
                  align="center"
                  numberOfLines={1}
                >
                  {presets[i].date}
                </Txt>
              </View>
            ))}

            {/* Manual date field */}
            <Abs x={24} y={211} w={327} h={52} radius={20} bg={GLASS_80} border="#e8e8e8" borderWidth={1} style={styles.softShadow} />
            <TextInput
              value={manualDate}
              onChangeText={setManualDate}
              placeholder="mm/dd/yyyy"
              placeholderTextColor="#000000"
              keyboardType="numbers-and-punctuation"
              style={styles.manualInput}
            />
            <Abs x={307} y={225} w={24} h={24} center>
              <Feather name="calendar" size={24} color={META_INK} />
            </Abs>

            {/* Add */}
            <Pressable
              onPress={setContentDate}
              style={({ pressed }) => [styles.addButton, pressed && styles.pressed]}
            >
              <Txt size={16} weight="bold" font="inter" color="#ffffff" lineHeight={19.36} align="center">
                Add
              </Txt>
            </Pressable>
          </Abs>
        </Abs>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  backdrop: { position: "absolute", left: 0, top: 0 },
  clip: { overflow: "hidden" },
  pressed: { opacity: 0.9 },

  glassButton: {
    position: "absolute",
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
  softShadow: {
    shadowColor: "#000000",
    shadowOpacity: 0.04,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },

  dayShadow: {
    shadowColor: "#000000",
    shadowOpacity: 0.02,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  daySelectedShadow: {
    shadowColor: "#90c1ab",
    shadowOpacity: 0.25,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },

  generateShadow: {
    shadowColor: "#e6c8dc",
    shadowOpacity: 0.4,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 12 },
    elevation: 3,
  },
  stackShadow: {
    shadowColor: "#000000",
    shadowOpacity: 0.02,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
  },
  cardShadow: {
    shadowColor: "#1e1432",
    shadowOpacity: 0.06,
    shadowRadius: 40,
    shadowOffset: { width: 0, height: 16 },
    elevation: 2,
  },

  footerButton: {
    position: "absolute",
    left: 106.75,
    top: 792,
    width: 161.5,
    height: 51,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: DARK_PILL,
    shadowColor: "#000000",
    shadowOpacity: 0.1,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },

  scrimTap: { position: "absolute", left: 0, top: 0, width: FRAME_W, height: SHEET_Y },
  sheet: { borderTopLeftRadius: 32, borderTopRightRadius: 32 },

  closeButton: {
    position: "absolute",
    left: 315,
    top: 44,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f8f8f8",
  },

  preset: {
    position: "absolute",
    height: 69,
    borderRadius: 8,
    borderWidth: 1,
  },

  manualInput: {
    position: "absolute",
    left: 45,
    top: 227,
    width: 101,
    height: 20,
    padding: 0,
    fontFamily: "Inter_500Medium",
    fontSize: 14,
    lineHeight: 16,
    textAlign: "center",
    color: "#000000",
  },

  addButton: {
    position: "absolute",
    left: 37,
    top: 290,
    width: 301,
    height: 55,
    borderRadius: 100,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: DARK_PILL,
  },
});
