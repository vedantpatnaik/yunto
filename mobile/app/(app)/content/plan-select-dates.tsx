import { useMemo, useState } from "react";
import { Pressable, StyleSheet } from "react-native";
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
import { useCalendar } from "../../../src/api/hooks";

/**
 * Select Dates — step 2 of the content plan generator. Figma 7358:23673
 * "select date" (375x875).
 *
 * Traced 1:1: warm gradient backdrop, an 80pt header (glass back button, the
 * platform chip, kebab), the 335x370 glass Calendar Card holding the month
 * stepper and a seven-column month grid, and the 375x108 bottom action band.
 * Coordinates are raw frame coordinates; <Screen> scales the 375pt canvas.
 */

/* ------------------------------- geometry -------------------------------- */
const FRAME_W = 375;
const FRAME_H = 875;

const CARD_X = 20;
const CARD_Y = 111;
const CARD_W = 335;
const CARD_H = 370;

/** Month stepper row: "Container" 41,136 293x32. */
const NAV_Y = 136;
const NAV_X = 41;
const NAV_W = 293;

/** Day grid: "Container" 41,192 293x264. */
const WEEK_Y = 192;
const ROW_Y0 = 228;
const CELL = 36;
const ROW_STEP = 48;
/** 456 (container bottom) - 36 (cell) - 228 (first row) = 192 of travel. */
const GRID_SPAN = 192;

/** Column origins, straight from the seven weekday tracks (step 41.857). */
const COL_X = [41, 82.86, 124.71, 166.57, 208.43, 250.29, 292.14];
const TRACK_W = 41.86;

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/* --------------------------- spec colour tokens --------------------------- */
const INK = "#1a1a1c";
const WEEKDAY_INK = "#a0a0a5";
const DAY_MUTED = "#c0c0c5";
const DAY_INK = "#5e5e62";
const CHEVRON_INK = "#5e5e62";
const GLASS_50 = "rgba(255,255,255,0.5)";
const GLASS_65 = "rgba(255,255,255,0.65)";
const GLASS_70 = "rgba(255,255,255,0.7)";
const GLASS_80 = "rgba(255,255,255,0.8)";
const BORDER_80 = "rgba(255,255,255,0.8)";
const BORDER_90 = "rgba(255,255,255,0.9)";
const SELECT_A = "#a2b5f5";
const SELECT_B = "#8dc49d";
const CTA_A = "#a78bfa";
const CTA_B = "#7c3aed";

/* ------------------------- the month the design ships --------------------- */
const SPEC_YEAR = 2025;
const SPEC_MONTH = 5; // June
const SPEC_SELECTED = [16, 17, 18, 19, 20, 21];

const pad = (n: number) => String(n).padStart(2, "0");
/** "2025-06-16" — the key both the picker and CalendarItem.scheduledAt share. */
const dayKey = (y: number, m: number, d: number) => `${y}-${pad(m + 1)}-${pad(d)}`;

/* -------------------------------- backdrop -------------------------------- */
/** The frame fill: a warm vertical base plus four soft radial glows. */
function Backdrop() {
  return (
    <Svg width={FRAME_W} height={FRAME_H} style={styles.backdrop}>
      <Defs>
        <SvgLinear id="sd-base" x1="187.5" y1="0" x2="187.5" y2={FRAME_H} gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#F7F0E4" />
          <Stop offset="1" stopColor="#F4EBDD" />
        </SvgLinear>
        <RadialGradient id="sd-pink" cx="285" cy="542.5" rx="1027.5" ry="568.75" gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#F7B7DA" stopOpacity="0.34" />
          <Stop offset="0.26" stopColor="#F7B7DA" stopOpacity="0" />
        </RadialGradient>
        <RadialGradient id="sd-blue" cx="90" cy="367.5" rx="967.5" ry="533.75" gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#BACDF4" stopOpacity="0.36" />
          <Stop offset="0.24" stopColor="#BACDF4" stopOpacity="0" />
        </RadialGradient>
        <RadialGradient id="sd-gold" cx="292.5" cy="157.5" rx="1338.75" ry="735" gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#F6D64A" stopOpacity="0.22" />
          <Stop offset="0.2" stopColor="#F6D64A" stopOpacity="0" />
        </RadialGradient>
        <RadialGradient id="sd-haze" cx="75" cy="87.5" rx="1466.25" ry="805" gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#FFFFFF" stopOpacity="0.72" />
          <Stop offset="0.24" stopColor="#FFFFFF" stopOpacity="0" />
        </RadialGradient>
      </Defs>
      <Rect width={FRAME_W} height={FRAME_H} fill="url(#sd-base)" />
      <Rect width={FRAME_W} height={FRAME_H} fill="url(#sd-pink)" />
      <Rect width={FRAME_W} height={FRAME_H} fill="url(#sd-blue)" />
      <Rect width={FRAME_W} height={FRAME_H} fill="url(#sd-gold)" />
      <Rect width={FRAME_W} height={FRAME_H} fill="url(#sd-haze)" />
    </Svg>
  );
}

/* --------------------------------- screen --------------------------------- */
interface Cell {
  day: number;
  key: string;
  x: number;
  y: number;
}

export default function PlanSelectDates() {
  const router = useRouter();
  /** Carried in from step 1 of the generator; the design ships Instagram. */
  const { platform } = useLocalSearchParams<{ platform?: string }>();

  const [year, setYear] = useState(SPEC_YEAR);
  const [month, setMonth] = useState(SPEC_MONTH);
  const [selected, setSelected] = useState<string[]>(
    SPEC_SELECTED.map((d) => dayKey(SPEC_YEAR, SPEC_MONTH, d)),
  );

  /** Days that already carry scheduled content cannot host a new plan entry. */
  const { data: calendar = [] } = useCalendar();
  const booked = useMemo(
    () => new Set(calendar.map((c) => c.scheduledAt.slice(0, 10))),
    [calendar],
  );

  /**
   * The month laid out on the seven weekday tracks. June 2025 opens on a
   * Sunday and needs five rows, which lands every cell on the design's exact
   * coordinates; longer months compress the row step so the grid still ends on
   * the card's 456pt inner edge rather than spilling past the card.
   */
  const cells = useMemo<Cell[]>(() => {
    const first = new Date(year, month, 1).getDay();
    const count = new Date(year, month + 1, 0).getDate();
    const rows = Math.ceil((first + count) / 7);
    const step = Math.min(ROW_STEP, GRID_SPAN / Math.max(rows - 1, 1));
    return Array.from({ length: count }, (_unused, i) => {
      const slot = first + i;
      return {
        day: i + 1,
        key: dayKey(year, month, i + 1),
        x: COL_X[slot % 7],
        y: ROW_Y0 + Math.floor(slot / 7) * step,
      };
    });
  }, [year, month]);

  /** Dates before the plan's start day read as out of range, as in the design. */
  const planStart = useMemo(() => {
    const prefix = `${year}-${pad(month + 1)}-`;
    const days = selected
      .filter((k) => k.startsWith(prefix))
      .map((k) => Number(k.slice(8)));
    return days.length ? Math.min(...days) : null;
  }, [selected, year, month]);

  const shiftMonth = (delta: number) => {
    const next = new Date(year, month + delta, 1);
    setYear(next.getFullYear());
    setMonth(next.getMonth());
  };

  const toggle = (key: string) =>
    setSelected((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key].sort(),
    );

  const generate = () => {
    const query = `platform=${encodeURIComponent(platform ?? "Instagram")}&dates=${selected.join(",")}`;
    router.push(`/content/content-itinerary?${query}` as never);
  };

  return (
    <Screen height={FRAME_H} background="#F7F0E4" scroll>
      <Backdrop />

      {/* ------------------------------ Header ------------------------------ */}
      <Pressable
        onPress={() => router.back()}
        style={({ pressed }) => [styles.headerButton, pressed && styles.pressed]}
      >
        <Feather name="arrow-left" size={20} color={INK} />
      </Pressable>

      <Abs
        x={115}
        y={21.5}
        w={128.88}
        h={37}
        radius={20}
        bg={GLASS_80}
        border={BORDER_90}
        borderWidth={1}
        style={styles.chipShadow}
      />
      <Abs x={128} y={31} w={18} h={18} center>
        <Feather name="instagram" size={18} color="#e1306c" />
      </Abs>
      <Txt
        x={154}
        y={30.5}
        w={72.88}
        size={15}
        weight="semibold"
        font="inter"
        color={INK}
        lineHeight={18.15}
        align="center"
        numberOfLines={1}
      >
        {platform ?? "Instagram"}
      </Txt>

      <Pressable
        onPress={() => router.back()}
        style={({ pressed }) => [styles.headerButton, styles.kebab, pressed && styles.pressed]}
      >
        <Feather name="more-vertical" size={20} color="#000000" />
      </Pressable>

      {/* --------------------------- Calendar Card -------------------------- */}
      <Abs
        x={CARD_X}
        y={CARD_Y}
        w={CARD_W}
        h={CARD_H}
        radius={24}
        bg={GLASS_65}
        border={BORDER_90}
        borderWidth={1}
        style={styles.cardShadow}
      />

      {/* Month stepper */}
      <Pressable
        onPress={() => shiftMonth(-1)}
        style={({ pressed }) => [styles.navButton, { left: 45 }, pressed && styles.pressed]}
      >
        <Feather name="chevron-left" size={20} color={CHEVRON_INK} />
      </Pressable>
      <Txt
        x={NAV_X}
        y={141.5}
        w={NAV_W}
        size={18}
        weight="bold"
        font="inter"
        color={INK}
        lineHeight={21.78}
        letterSpacing={-0.3}
        align="center"
        numberOfLines={1}
      >
        {`${MONTHS[month]} ${year}`}
      </Txt>
      <Pressable
        onPress={() => shiftMonth(1)}
        style={({ pressed }) => [styles.navButton, { left: 297.98 }, pressed && styles.pressed]}
      >
        <Feather name="chevron-right" size={20} color={CHEVRON_INK} />
      </Pressable>

      {/* Weekday header */}
      {WEEKDAYS.map((label, i) => (
        <Txt
          key={label}
          x={COL_X[i]}
          y={WEEK_Y}
          w={TRACK_W}
          size={13}
          weight="semibold"
          font="inter"
          color={WEEKDAY_INK}
          lineHeight={15.73}
          align="center"
        >
          {label}
        </Txt>
      ))}

      {/* Day grid */}
      {cells.map((cell) => {
        const isSelected = selected.includes(cell.key);
        const isBooked = booked.has(cell.key);
        const isMuted =
          !isSelected && (isBooked || (planStart !== null && cell.day < planStart));
        return (
          <Pressable
            key={cell.key}
            disabled={isBooked}
            onPress={() => toggle(cell.key)}
            style={({ pressed }) => [
              styles.cell,
              { left: cell.x, top: cell.y },
              pressed && styles.pressed,
            ]}
          >
            {isSelected ? (
              <LinearGradient
                colors={[SELECT_A, SELECT_B]}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={styles.dayPill}
              />
            ) : null}
            <Txt
              size={15}
              weight={isSelected ? "bold" : "medium"}
              font="inter"
              color={isSelected ? "#FFFFFF" : isMuted ? DAY_MUTED : DAY_INK}
              lineHeight={18.15}
              align="center"
            >
              {cell.day}
            </Txt>
          </Pressable>
        );
      })}

      {/* ---------------------------- Bottom bar ---------------------------- */}
      <LinearGradient
        colors={["rgba(253,252,254,0.949)", "rgba(253,252,254,0)"]}
        locations={[0.4, 1]}
        start={{ x: 0.5, y: 1 }}
        end={{ x: 0.5, y: 0 }}
        style={styles.bottomBar}
      />

      <Pressable
        onPress={() => router.push("/content/all-ideas" as never)}
        style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}
      >
        <Feather name="file-text" size={20} color="#141416" />
      </Pressable>

      <Pressable onPress={generate} style={({ pressed }) => [styles.cta, pressed && styles.pressed]}>
        <LinearGradient
          colors={[CTA_A, CTA_B]}
          start={{ x: 0.18, y: -0.64 }}
          end={{ x: 0.82, y: 1.64 }}
          style={styles.ctaFill}
        />
        <Abs x={56.38} y={19} w={18} h={18} center>
          <Ionicons name="sparkles-outline" size={18} color="#FFFFFF" />
        </Abs>
        <Txt
          x={82.38}
          y={18.5}
          w={128.25}
          size={15}
          weight="semibold"
          font="inter"
          color="#FFFFFF"
          lineHeight={18.15}
          align="center"
        >
          Generate Content
        </Txt>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  backdrop: { position: "absolute", left: 0, top: 0 },
  pressed: { opacity: 0.9 },

  /* Header — 40x40 glass buttons at 15,20 and 303.88,20. */
  headerButton: {
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
    shadowOpacity: 0.031,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  kebab: { left: 303.88 },
  chipShadow: {
    shadowColor: "#000000",
    shadowOpacity: 0.039,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },

  /* Calendar Card — 335x370 glass panel. */
  cardShadow: {
    shadowColor: "#000000",
    shadowOpacity: 0.031,
    shadowRadius: 32,
    shadowOffset: { width: 0, height: 12 },
    elevation: 2,
  },

  /* Month stepper — 32x32 buttons on the card's 136pt row. */
  navButton: {
    position: "absolute",
    top: NAV_Y,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: GLASS_50,
  },

  /* Day cell — 36x36, r18, centred number. */
  cell: {
    position: "absolute",
    width: CELL,
    height: CELL,
    borderRadius: CELL / 2,
    alignItems: "center",
    justifyContent: "center",
  },
  dayPill: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    borderRadius: CELL / 2,
    shadowColor: "#7C3AED",
    shadowOpacity: 0.3,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },

  /* Bottom action band — 375x108 at y=767. */
  bottomBar: {
    position: "absolute",
    left: 0,
    top: 767,
    width: FRAME_W,
    height: 108,
  },
  secondaryButton: {
    position: "absolute",
    left: 20,
    top: 787,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: GLASS_70,
    borderWidth: 1,
    borderColor: BORDER_80,
    shadowColor: "#000000",
    shadowOpacity: 0.039,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
  },
  cta: {
    position: "absolute",
    left: 88,
    top: 787,
    width: 267,
    height: 56,
    borderRadius: 28,
    shadowColor: "#8B5CF6",
    shadowOpacity: 0.3,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },
  ctaFill: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    borderRadius: 28,
  },
});
