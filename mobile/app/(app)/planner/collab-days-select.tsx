import { useMemo, useState } from "react";
import { Pressable, View } from "react-native";
import Svg, {
  Circle,
  Defs,
  Line,
  LinearGradient as SvgLinearGradient,
  Path,
  RadialGradient,
  Rect,
  Stop,
} from "react-native-svg";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Abs, Screen, Txt } from "../../../src/ui/Frame";
import { colors } from "../../../src/theme";
import { useCalendar } from "../../../src/api/hooks";

/**
 * Planner — "Select your collab days" (Figma 7358:21832, 375x875).
 *
 * The manual branch of the collab-day wizard. Steps 2/4 (7358:22020, LinkedIn)
 * and 3/4 (7358:22300, Youtube) are the same frame with a different platform
 * pill and counter, so the queue below drives all of them from one route rather
 * than three near-identical files.
 *
 * Dates already on the creator's calendar arrive preselected for the first
 * platform in the queue; every later tap is local until "Add" commits the step.
 */

/* ---------------------------------- spec ---------------------------------- */

const INK = "#1c1c1e";
const TITLE_INK = "#1d1d1f";
const MUTED = "#6b6b70";
const FOOT_INK = "#121313";

const BLUE = "#3a82f6";
const BLUE_TEXT = "#1e3a8a";
const BLUE_CARD_BG = "rgba(230,242,255,0.65)";
const BLUE_CARD_LINE = "rgba(58,130,246,0.2)";

const HAIRLINE = "rgba(0,0,0,0.1)";
const CARD_BG = "rgba(255,255,255,0.55)";
const ROUND_BTN_BG = "rgba(255,255,255,0.6)";
const SHEET_BG = "rgba(251,250,255,0.6)";
const STEP_PILL_BG = "rgba(255,255,255,0.7)";
const PLATFORM_PILL_BG = "rgba(255,255,255,0.8)";
const FOOT_BG = "rgba(255,255,255,0.6)";
const FOOT_LINE = "rgba(255,255,255,0.62)";
const BADGE_LINE = "rgba(0,0,0,0.06)";

/** #3a82f614 / 16px / y+6 — the helper card. */
const HELPER_SHADOW = {
  shadowColor: BLUE,
  shadowOpacity: 0.08,
  shadowRadius: 16,
  shadowOffset: { width: 0, height: 6 },
  elevation: 2,
} as const;

/** #0000000a / 32px / y+12 — the calendar card. */
const CARD_SHADOW = {
  shadowColor: colors.ink,
  shadowOpacity: 0.04,
  shadowRadius: 32,
  shadowOffset: { width: 0, height: 12 },
  elevation: 3,
} as const;

/** #0000000f / 40px / y+16 — the bottom sheet. */
const SHEET_SHADOW = {
  shadowColor: colors.ink,
  shadowOpacity: 0.06,
  shadowRadius: 40,
  shadowOffset: { width: 0, height: 16 },
  elevation: 6,
} as const;

/** #00000008 / 12px / y+4 — the header back button. */
const BACK_SHADOW = {
  shadowColor: colors.ink,
  shadowOpacity: 0.03,
  shadowRadius: 12,
  shadowOffset: { width: 0, height: 4 },
  elevation: 2,
} as const;

/** #00000005 / 8px / y+2 — the platform pill. */
const PILL_SHADOW = {
  shadowColor: colors.ink,
  shadowOpacity: 0.02,
  shadowRadius: 8,
  shadowOffset: { width: 0, height: 2 },
  elevation: 1,
} as const;

/** #00000026 / 16px / y+6 — the Add button. */
const ADD_SHADOW = {
  shadowColor: colors.ink,
  shadowOpacity: 0.15,
  shadowRadius: 16,
  shadowOffset: { width: 0, height: 6 },
  elevation: 6,
} as const;

/** #00000014 / 8px / y+4 — the white platform badge on a picked day. */
const BADGE_SHADOW = {
  shadowColor: colors.ink,
  shadowOpacity: 0.08,
  shadowRadius: 8,
  shadowOffset: { width: 0, height: 4 },
  elevation: 3,
} as const;

/** #00000026 / 8px / y+4 — the dark plus badge on a picked day. */
const TICK_SHADOW = {
  shadowColor: colors.ink,
  shadowOpacity: 0.15,
  shadowRadius: 8,
  shadowOffset: { width: 0, height: 4 },
  elevation: 4,
} as const;

/* Month grid geometry, lifted cell-for-cell from the frame. */
const COL_X = [41, 83.71, 126.43, 169.14, 211.86, 254.57, 297.29];
const ROW_Y = [326, 374.72, 423.44, 472.16, 520.88];
const CELL = 36.71;
/** Day number baseline sits 8.86 below the cell top (326 -> 334.86). */
const DAY_TEXT_DY = 8.86;

/** Weekday strip — seven TEXT nodes at y=295, each centred in a 41.86 column. */
const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];
const WEEKDAY_X = [41, 82.86, 124.71, 166.57, 208.43, 250.29, 292.14];
const WEEKDAY_W = 41.86;

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/** The frame's counter reads "1/4 Steps"; the sheet is step n of four. */
const TOTAL_STEPS = 4;

type PlatformId = "instagram" | "linkedin" | "youtube";

interface Platform {
  id: PlatformId;
  /** Pill label — spec literal on each of the three step frames. */
  label: string;
  /** Picked-cell border. */
  accent: string;
  /** Picked-cell fill (accent at 12%). */
  tint: string;
}

/**
 * The wizard queue. Instagram (7358:21832) -> LinkedIn (7358:22020) ->
 * Youtube (7358:22300); the counter's denominator stays at the spec's four.
 */
const PLATFORMS: Platform[] = [
  { id: "instagram", label: "Instagram", accent: "#ff8fbc", tint: "rgba(255,143,188,0.12)" },
  { id: "linkedin", label: "LinkedIn", accent: "#63a1de", tint: "rgba(99,161,222,0.12)" },
  { id: "youtube", label: "Youtube", accent: "#ff0000", tint: "rgba(255,0,0,0.12)" },
];

/* --------------------------------- glyphs --------------------------------- */

/** Page wash: the frame's linear base plus its four radial bloom fills. */
function Backdrop() {
  return (
    <Svg width={375} height={875} style={{ position: "absolute", left: 0, top: 0 }}>
      <Defs>
        <SvgLinearGradient id="base" x1="187.5" y1="0" x2="187.5" y2="875" gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#f7f0e4" />
          <Stop offset="1" stopColor="#f4ebdd" />
        </SvgLinearGradient>
        <RadialGradient id="pink" cx="285" cy="542.5" rx="1027.5" ry="568.75" gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#f7b7da" stopOpacity={0.34} />
          <Stop offset="0.26" stopColor="#f7b7da" stopOpacity={0} />
        </RadialGradient>
        <RadialGradient id="blue" cx="90" cy="367.5" rx="967.5" ry="533.75" gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#bacdf4" stopOpacity={0.36} />
          <Stop offset="0.24" stopColor="#bacdf4" stopOpacity={0} />
        </RadialGradient>
        <RadialGradient id="gold" cx="292.5" cy="157.5" rx="1338.75" ry="735" gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#f6d64a" stopOpacity={0.22} />
          <Stop offset="0.2" stopColor="#f6d64a" stopOpacity={0} />
        </RadialGradient>
        <RadialGradient id="haze" cx="75" cy="87.5" rx="1466.25" ry="805" gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#ffffff" stopOpacity={0.72} />
          <Stop offset="0.24" stopColor="#ffffff" stopOpacity={0} />
        </RadialGradient>
      </Defs>
      <Rect width={375} height={875} fill="url(#base)" />
      <Rect width={375} height={875} fill="url(#haze)" />
      <Rect width={375} height={875} fill="url(#gold)" />
      <Rect width={375} height={875} fill="url(#blue)" />
      <Rect width={375} height={875} fill="url(#pink)" />
    </Svg>
  );
}

/** Header arrow — 11.67 vector, #1c1c1e at 1.67. */
function BackArrow() {
  return (
    <Svg width={20} height={20} viewBox="0 0 20 20">
      <Path
        d="M15.83 10H4.17M9.17 4.17 4.17 10l5 5.83"
        stroke={INK}
        strokeWidth={1.67}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </Svg>
  );
}

/** Month stepper chevron — 4.5x9 vector, #1c1c1e at 1.5. */
function Chevron({ dir }: { dir: "left" | "right" }) {
  return (
    <Svg width={7.5} height={12} viewBox="0 0 7.5 12">
      <Path
        d={dir === "left" ? "M6 1.5 1.5 6 6 10.5" : "M1.5 1.5 6 6 1.5 10.5"}
        stroke={INK}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </Svg>
  );
}

/** Platform-pill caret — 8x4 vector, #6b6b70 at 1.33. */
function CaretDown() {
  return (
    <Svg width={11} height={7} viewBox="0 0 11 7">
      <Path
        d="M1.5 1.5 5.5 5.5 9.5 1.5"
        stroke={MUTED}
        strokeWidth={1.33}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </Svg>
  );
}

/** Helper-card info mark — 11.67 circle + 4.67 stem, white at 1.17. */
function InfoLight() {
  return (
    <Svg width={14} height={14} viewBox="0 0 14 14">
      <Circle cx={7} cy={7} r={5.25} stroke={colors.white} strokeWidth={1.17} fill="none" />
      <Line x1={7} y1={4.67} x2={7} y2={9.34} stroke={colors.white} strokeWidth={1.17} strokeLinecap="round" />
    </Svg>
  );
}

/** Footnote info mark — 11.56 circle, 3.12 stem and 1.56 dot, #121313 at 1.5. */
function InfoDark() {
  return (
    <Svg width={15} height={15} viewBox="0 0 15 15">
      <Circle cx={7.5} cy={7.5} r={5.03} stroke={FOOT_INK} strokeWidth={1.5} fill="none" />
      <Line x1={7.5} y1={7.38} x2={7.5} y2={10.5} stroke={FOOT_INK} strokeWidth={1.5} strokeLinecap="round" />
      <Circle cx={7.5} cy={5.27} r={0.78} fill={FOOT_INK} />
    </Svg>
  );
}

/** Plus inside the dark 20pt badge — 7358:21957, a 7x7 vector, white at 1. */
function Plus() {
  return (
    <Svg width={12} height={12} viewBox="0 0 12 12">
      <Path
        d="M3 6h6M6 3v6"
        stroke={colors.white}
        strokeWidth={1}
        strokeLinecap="round"
        fill="none"
      />
    </Svg>
  );
}

/** Instagram outline — 10 rounded square + 4.73 lens. */
function IgGlyph({ size, color }: { size: number; color: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 12 12">
      <Rect x={1} y={1} width={10} height={10} rx={3} stroke={color} strokeWidth={1} fill="none" />
      <Circle cx={6} cy={6} r={1.87} stroke={color} strokeWidth={1} fill="none" />
    </Svg>
  );
}

/** LinkedIn logo tile — single #0a66c2 vector on a 1.2/2 rounded frame. */
function LiGlyph({ size }: { size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Rect width={24} height={24} rx={2.4} fill="#0a66c2" />
      <Path
        d="M6.94 7.5a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM6.9 10.6H3v10.2h3.9zm6.4 0H9.4v10.2h3.9v-5.35c0-2.98 3.88-3.22 3.88 0v5.35H21v-6.46c0-5.02-5.72-4.84-7.7-2.37z"
        fill={colors.white}
      />
    </Svg>
  );
}

/** Youtube logo tile — the frame ships it as a 20x14 image. */
function YtGlyph({ width }: { width: number }) {
  return (
    <Svg width={width} height={(width * 14) / 20} viewBox="0 0 20 14">
      <Rect width={20} height={14} rx={3.5} fill="#ff0000" />
      <Path d="M8 4.2 13.2 7 8 9.8z" fill={colors.white} />
    </Svg>
  );
}

/* --------------------------------- screen --------------------------------- */

const isoOf = (y: number, m: number, d: number) =>
  `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

export default function CollabDaysSelect() {
  const router = useRouter();
  const { data: calendar } = useCalendar();

  const [step, setStep] = useState(0);
  /** Spec month — "June 2026". Prev/next move the cursor, not the geometry. */
  const [cursor, setCursor] = useState({ y: 2026, m: 5 });
  const [picked, setPicked] = useState<Record<string, string[]>>({});

  const active = PLATFORMS[step];
  const monthKey = `${cursor.y}-${String(cursor.m + 1).padStart(2, "0")}`;
  const dayCount = new Date(cursor.y, cursor.m + 1, 0).getDate();
  const days = useMemo(
    () => Array.from({ length: dayCount }, (_, i) => i + 1),
    [dayCount],
  );

  /** Days already on the creator's calendar, preselected for the first step. */
  const scheduled = useMemo(
    () =>
      (calendar ?? [])
        .map((item) => item.scheduledAt.slice(0, 10))
        .filter((iso) => iso.startsWith(monthKey)),
    [calendar, monthKey],
  );

  const daysFor = (id: PlatformId) =>
    picked[id] ?? (id === PLATFORMS[0].id ? scheduled : []);

  const toggle = (iso: string) => {
    const current = daysFor(active.id);
    setPicked({
      ...picked,
      [active.id]: current.includes(iso)
        ? current.filter((d) => d !== iso)
        : [...current, iso],
    });
  };

  const shiftMonth = (delta: number) => {
    const next = new Date(cursor.y, cursor.m + delta, 1);
    setCursor({ y: next.getFullYear(), m: next.getMonth() });
  };

  const onAdd = () => {
    setPicked({ ...picked, [active.id]: daysFor(active.id) });
    if (step < PLATFORMS.length - 1) setStep(step + 1);
    else router.back();
  };

  /** Which platform claimed a given date, if any — drives the cell's colour. */
  const ownerOf = (iso: string) => PLATFORMS.find((p) => daysFor(p.id).includes(iso));

  const cellAt = (day: number) => ({
    x: COL_X[(day - 1) % 7],
    y: ROW_Y[Math.floor((day - 1) / 7)],
  });

  return (
    <Screen height={875} background="#f7f0e4" scroll>
      <Backdrop />

      {/* Header — 7358:21833 */}
      <Pressable onPress={() => router.back()} style={{ position: "absolute", left: 15, top: 18 }}>
        <View
          style={[
            {
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: "rgba(255,255,255,0.65)",
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.9)",
              alignItems: "center",
              justifyContent: "center",
            },
            BACK_SHADOW,
          ]}
        >
          <BackArrow />
        </View>
      </Pressable>
      <Txt
        x={105.5}
        y={30}
        w={190}
        size={16}
        weight="bold"
        font="inter"
        color={TITLE_INK}
        lineHeight={19.36}
        align="center"
      >
        Select your collab days
      </Txt>

      {/* Helper card — 7358:21877 */}
      <Abs
        x={20}
        y={114}
        w={335}
        h={67}
        radius={16}
        bg={BLUE_CARD_BG}
        border={BLUE_CARD_LINE}
        borderWidth={1}
        style={HELPER_SHADOW}
      />
      <Abs x={37} y={131} w={24} h={24} radius={12} bg={BLUE} center>
        <InfoLight />
      </Abs>
      <Txt
        x={73}
        y={129}
        w={235.56}
        size={13}
        weight="medium"
        font="inter"
        color={BLUE_TEXT}
        lineHeight={18.2}
      >
        {"This day will be preselected in your\ncalendar as your preferred collab day."}
      </Txt>

      {/* Calendar card — 7358:21889 */}
      <Abs
        x={20}
        y={210}
        w={335}
        h={372.59}
        radius={24}
        bg={CARD_BG}
        border={HAIRLINE}
        borderWidth={1}
        style={CARD_SHADOW}
      />

      <Pressable onPress={() => shiftMonth(-1)} style={{ position: "absolute", left: 41, top: 235 }}>
        <View
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: ROUND_BTN_BG,
            borderWidth: 1,
            borderColor: HAIRLINE,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Chevron dir="left" />
        </View>
      </Pressable>
      <Txt
        x={140.49}
        y={242}
        w={94}
        size={18}
        weight="semibold"
        font="inter"
        color={INK}
        lineHeight={21.78}
      >
        {`${MONTH_NAMES[cursor.m]} ${cursor.y}`}
      </Txt>
      <Pressable onPress={() => shiftMonth(1)} style={{ position: "absolute", left: 297.98, top: 235 }}>
        <View
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: ROUND_BTN_BG,
            borderWidth: 1,
            borderColor: HAIRLINE,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Chevron dir="right" />
        </View>
      </Pressable>

      {WEEKDAYS.map((letter, i) => (
        <Txt
          key={`wd-${i}`}
          x={WEEKDAY_X[i]}
          y={295}
          w={WEEKDAY_W}
          size={12}
          weight="semibold"
          font="inter"
          color={MUTED}
          lineHeight={14.52}
          align="center"
        >
          {letter}
        </Txt>
      ))}

      {/* Day cells — 7358:21916. Day 1 sits in the first column, as authored. */}
      {days.map((day) => {
        const iso = isoOf(cursor.y, cursor.m, day);
        const owner = ownerOf(iso);
        const { x, y } = cellAt(day);
        return (
          <Pressable key={`d-${day}`} onPress={() => toggle(iso)} style={{ position: "absolute", left: x, top: y }}>
            <View
              style={[
                { width: CELL, height: CELL, borderRadius: 12 },
                owner
                  ? {
                      backgroundColor: owner.tint,
                      borderWidth: 1,
                      borderColor: owner.accent,
                      shadowColor: owner.accent,
                      shadowOpacity: 0.2,
                      shadowRadius: 12,
                      shadowOffset: { width: 0, height: 4 },
                      elevation: 3,
                    }
                  : null,
              ]}
            >
              <Txt
                x={0}
                y={DAY_TEXT_DY}
                w={CELL}
                size={15}
                weight={owner ? "semibold" : "medium"}
                font="inter"
                color={INK}
                lineHeight={18.15}
                align="center"
              >
                {String(day)}
              </Txt>
            </View>
          </Pressable>
        );
      })}

      {/* Badges ride above the grid — 7358:21948 (-7,-7) and 7358:21954 (+21.72). */}
      {days.map((day) => {
        const iso = isoOf(cursor.y, cursor.m, day);
        const owner = ownerOf(iso);
        if (!owner) return null;
        const { x, y } = cellAt(day);
        return (
          <View key={`b-${day}`} pointerEvents="none">
            <Abs
              x={x - 7}
              y={y - 7}
              w={22}
              h={22}
              radius={11}
              bg={colors.white}
              border={BADGE_LINE}
              borderWidth={1}
              center
              style={BADGE_SHADOW}
            >
              {owner.id === "linkedin" ? (
                <LiGlyph size={12} />
              ) : owner.id === "youtube" ? (
                <YtGlyph width={12} />
              ) : (
                <IgGlyph size={12} color="#e1306c" />
              )}
            </Abs>
            <Abs
              x={x + 21.72}
              y={y + 21.72}
              w={20}
              h={20}
              radius={10}
              bg={INK}
              border={colors.white}
              borderWidth={2}
              center
              style={TICK_SHADOW}
            >
              <Plus />
            </Abs>
          </View>
        );
      })}

      {/* Bottom sheet — 7358:21988 */}
      <Abs
        x={20}
        y={598}
        w={335}
        h={147}
        radius={24}
        bg={SHEET_BG}
        border={HAIRLINE}
        borderWidth={1}
        style={SHEET_SHADOW}
      />
      <Txt
        x={41}
        y={627.5}
        w={144.31}
        size={16}
        weight="semibold"
        font="inter"
        color={INK}
        lineHeight={19.36}
      >
        Select Collab Days
      </Txt>
      <Abs
        x={254.25}
        y={623}
        w={79.75}
        h={29}
        radius={12}
        bg={STEP_PILL_BG}
        border={HAIRLINE}
        borderWidth={1}
      />
      <Txt
        x={267.25}
        y={630}
        w={53.75}
        size={12}
        weight="semibold"
        font="inter"
        color={MUTED}
        lineHeight={14.52}
      >
        {`${step + 1}/${TOTAL_STEPS} Steps`}
      </Txt>

      {/* Platform pill — 7358:21995. Tapping it walks the queue. */}
      <Pressable
        onPress={() => setStep((step + 1) % PLATFORMS.length)}
        style={{ position: "absolute", left: 41, top: 672 }}
      >
        <View
          style={[
            {
              width: 203.59,
              height: 48,
              borderRadius: 16,
              backgroundColor: PLATFORM_PILL_BG,
              borderWidth: 1,
              borderColor: HAIRLINE,
            },
            PILL_SHADOW,
          ]}
        />
      </Pressable>
      {active.id === "instagram" ? (
        <Abs x={58} y={686} w={20} h={20}>
          <LinearGradient
            colors={["#f09433", "#e6683c", "#dc2743", "#cc2366", "#bc1888"] as const}
            locations={[0, 0.25, 0.5, 0.75, 1] as const}
            start={{ x: 0, y: 1 }}
            end={{ x: 1, y: 0 }}
            style={{ width: 20, height: 20, borderRadius: 6, alignItems: "center", justifyContent: "center" }}
          >
            <IgGlyph size={12} color={colors.white} />
          </LinearGradient>
        </Abs>
      ) : active.id === "linkedin" ? (
        <Abs x={58} y={686} w={20} h={20}>
          <LiGlyph size={20} />
        </Abs>
      ) : (
        <Abs x={58} y={689} w={20} h={14}>
          <YtGlyph width={20} />
        </Abs>
      )}
      <Txt
        x={88}
        y={687.5}
        w={113.59}
        size={14}
        weight="medium"
        font="inter"
        color={INK}
        lineHeight={16.94}
      >
        {active.label}
      </Txt>
      <Abs x={214.09} y={692.5} w={11} h={7}>
        <CaretDown />
      </Abs>

      {/* Add — 7358:22007 */}
      <Pressable onPress={onAdd} style={{ position: "absolute", left: 256.59, top: 672 }}>
        <View
          style={[
            {
              width: 77.41,
              height: 48,
              borderRadius: 16,
              backgroundColor: INK,
              alignItems: "center",
              justifyContent: "center",
            },
            ADD_SHADOW,
          ]}
        >
          <Txt size={15} weight="semibold" font="inter" color={colors.white} lineHeight={18.15} align="center">
            Add
          </Txt>
        </View>
      </Pressable>

      {/* Footnote — 7358:22009 */}
      <Abs
        x={20}
        y={759}
        w={335}
        h={44}
        radius={16}
        bg={FOOT_BG}
        border={FOOT_LINE}
        borderWidth={1}
      />
      <Abs x={32} y={774} w={15} h={15}>
        <InfoDark />
      </Abs>
      <Txt
        x={52.5}
        y={770}
        /* Spec box is 255 wide and the line measures 252.5 in Figma; RN's Inter
           runs a hair wider and wrapped "future." onto a second line, spilling
           out of the 44pt card. Widen to the parent row's right edge (324). */
        w={271.5}
        size={12}
        weight="regular"
        font="inter"
        color={MUTED}
        lineHeight={24}
      >
        You can make changes anytime in the future.
      </Txt>
    </Screen>
  );
}
