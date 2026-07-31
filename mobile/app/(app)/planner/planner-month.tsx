import { useMemo, useState } from "react";
import type { ComponentProps } from "react";
import { Pressable, ScrollView, StyleSheet } from "react-native";
import type { ViewStyle } from "react-native";
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
import { useCalendar } from "../../../src/api/hooks";
import type { CalendarItem } from "../../../src/api/hooks";

/**
 * Planner — month overview. Figma frame 7358:25977 "add to calendar" (375x875).
 *
 * The month stepper header, the horizontally scrolling Platform Filter row, the
 * 343x480 glass calendar card and the footer (QR + brief buttons and the
 * "Generate Content" CTA), traced node for node. The Instagram / YouTube /
 * Brand frames (7457:39538, 7457:40092, 7457:40353) are the same screen with a
 * different active chip, so they are folded in here as the `filter` state: the
 * active chip takes position 0, wears its platform colour (#e1306c / #ef4444 /
 * #10b981, #7c3aed for All Platforms) and the rest keep the idle glass style.
 * Their chip widths are the ones the specs measure per state.
 *
 * Coordinates below are raw frame coordinates; <Screen> scales the 375pt canvas.
 * Children of the pressable sub-frames (chips, footer buttons) are rebased by
 * their parent's origin, nothing else is transformed.
 *
 * Figma's BACKGROUND_BLUR and INNER_SHADOW have no React Native equivalent, so
 * the glass surfaces keep their translucent fills and drop shadows without the
 * backdrop blur or the white inner highlight. Everything else — geometry,
 * colour, radius, size, weight, line-height, tracking — is verbatim.
 */

/* ------------------------------- geometry -------------------------------- */
const FRAME_W = 375;
const FRAME_H = 875;

/** Calendar Container: the 343x480 card, its 7 columns and its 402pt grid. */
const CARD = { x: 16, y: 204, w: 343, h: 480 } as const;
const COL_X = [31, 76.57, 122.14, 167.71, 213.29, 258.86, 304.43];
const CELL_W = 39.57;
/** Weekday letters sit on an even 313/7 rhythm, not on the cell grid. */
const DOW_X = [31, 75.71, 120.43, 165.14, 209.86, 254.57, 299.29];
const DOW = ["S", "M", "T", "W", "T", "F", "S"];
const DOW_Y = 225;

const GRID_Y = 257;
const GRID_H = 402;
const ROW_GAP = 6;
/** A plain cell is 70.39 tall; a cell carrying stacked chips grows to 96.41. */
const ROW_H = 70.39;
const ROW_H_TALL = 96.41;

/** Inside a cell: day pill at +7, chips from +33 on a 19pt step, "+n" at +72. */
const DAY_DOT = 7;
const CHIP_X = 5;
const CHIP_Y = 33;
const CHIP_STEP = 19;
const CHIP_W = 29.57;
const CHIP_H = 16;
const MORE_Y = 72;
/** Two chips fit above the fold; the rest collapse into "+n more". */
const MAX_CHIPS = 2;

/* --------------------------- spec colour tokens --------------------------- */
const ACCENT = "#7c3aed";
const ACCENT_15 = "rgba(124,58,237,0.15)";
const ACCENT_50 = "rgba(124,58,237,0.5)";
const INK_HEADER = "#1a1a1c";
const INK_STEP = "#141416";
const INK_DAY = "#141416";
const INK_MUTED = "#5c5c60";
const WHITE = "#ffffff";
const GLASS_40 = "rgba(255,255,255,0.4)";
const GLASS_55 = "rgba(255,255,255,0.55)";
const GLASS_60 = "rgba(255,255,255,0.6)";
const GLASS_70 = "rgba(255,255,255,0.7)";
const GLASS_80 = "rgba(255,255,255,0.8)";
const EDGE_70 = "rgba(255,255,255,0.7)";
const EDGE_80 = "rgba(255,255,255,0.8)";
const EDGE_90 = "rgba(255,255,255,0.9)";
const TINT_04 = "rgba(0,0,0,0.04)";
const GENERATE = ["#a78bfa", "#7c3aed"] as const;
const FOOTER_FADE = [
  "rgba(253,252,254,0.95)",
  "rgba(253,252,254,0.95)",
  "rgba(253,252,254,0)",
] as const;

/* -------------------------------- shadows --------------------------------- */
/** Figma DROP_SHADOW radii are halved for shadowRadius, as elsewhere in app/. */
const backShadow: ViewStyle = {
  shadowColor: "#000000", shadowOpacity: 0.03, shadowRadius: 6,
  shadowOffset: { width: 0, height: 4 }, elevation: 2,
};
const pillShadow: ViewStyle = {
  shadowColor: "#000000", shadowOpacity: 0.03, shadowRadius: 10,
  shadowOffset: { width: 0, height: 4 }, elevation: 3,
};
const stepShadow: ViewStyle = {
  shadowColor: "#000000", shadowOpacity: 0.04, shadowRadius: 4,
  shadowOffset: { width: 0, height: 2 }, elevation: 2,
};
const cardShadow: ViewStyle = {
  shadowColor: "#000000", shadowOpacity: 0.03, shadowRadius: 20,
  shadowOffset: { width: 0, height: 16 }, elevation: 6,
};
const selCellShadow: ViewStyle = {
  shadowColor: ACCENT, shadowOpacity: 0.12, shadowRadius: 8,
  shadowOffset: { width: 0, height: 6 }, elevation: 4,
};
const selDotShadow: ViewStyle = {
  shadowColor: ACCENT, shadowOpacity: 0.3, shadowRadius: 4,
  shadowOffset: { width: 0, height: 4 }, elevation: 3,
};
const footShadow: ViewStyle = {
  shadowColor: "#000000", shadowOpacity: 0.04, shadowRadius: 8,
  shadowOffset: { width: 0, height: 8 }, elevation: 4,
};
const generateShadow: ViewStyle = {
  shadowColor: "#8b5cf6", shadowOpacity: 0.3, shadowRadius: 12,
  shadowOffset: { width: 0, height: 10 }, elevation: 8,
};
/** Active platform chip: DROP_SHADOW 0/8 r20 in the chip's own tint at 25%. */
const chipGlow = (tint: string): ViewStyle => ({
  shadowColor: tint, shadowOpacity: 0.25, shadowRadius: 10,
  shadowOffset: { width: 0, height: 8 }, elevation: 6,
});

/* ------------------------------ content chips ----------------------------- */
type FeatherName = ComponentProps<typeof Feather>["name"];
type Platform = "instagram" | "youtube" | "brand";
type Filter = "all" | Platform;
type Format = "post" | "reel" | "short" | "vlog" | "video" | "collab" | "spons" | "busy";

/**
 * The eight chips the frame draws, with the gradient, glyph and measured label
 * width Figma gives each. The pill clips (clipsContent), so the label reads as
 * a sliver beside the icon exactly as it does in the design.
 */
const CHIP: Record<
  Format,
  { label: string; from: string; to: string; icon: FeatherName; textW: number }
> = {
  post: { label: "Post", from: "#ec4899", to: "#d946ef", icon: "instagram", textW: 20.14 },
  reel: { label: "Reel", from: "#8b5cf6", to: "#7c3aed", icon: "film", textW: 19.56 },
  short: { label: "Short", from: "#ef4444", to: "#dc2626", icon: "youtube", textW: 24.77 },
  vlog: { label: "Vlog", from: "#ef4444", to: "#dc2626", icon: "youtube", textW: 20.83 },
  video: { label: "Video", from: "#3b82f6", to: "#2563eb", icon: "video", textW: 26.33 },
  collab: { label: "Collab", from: "#10b981", to: "#059669", icon: "briefcase", textW: 28.81 },
  spons: { label: "Spons", from: "#10b981", to: "#059669", icon: "briefcase", textW: 28.41 },
  busy: { label: "Busy", from: "#9ca3af", to: "#6b7280", icon: "lock", textW: 22.48 },
};

/** Which filter a format answers to. "Busy" is a block, so it survives all. */
const PLATFORM_OF: Record<Format, Platform | "any"> = {
  post: "instagram", reel: "instagram", short: "youtube", vlog: "youtube",
  video: "youtube", collab: "brand", spons: "brand", busy: "any",
};

/**
 * CalendarContent carries no platform/format column yet (see schema.prisma), so
 * the chip is read off the record: a blocked status becomes the grey "Busy"
 * block, otherwise the first format word in the title wins ("Beauty Reel —
 * Nykaa" -> Reel). Falls back to the frame's most common chip, Post.
 */
const BLOCKED = /^(blocked|busy|unavailable|leave|hold)$/i;
const KEYWORDS: [RegExp, Format][] = [
  [/reel/i, "reel"], [/short/i, "short"], [/vlog/i, "vlog"], [/video/i, "video"],
  [/collab/i, "collab"], [/spons/i, "spons"], [/post|story/i, "post"],
];

function formatOf(item: CalendarItem): Format {
  if (BLOCKED.test(item.status)) return "busy";
  for (const [re, format] of KEYWORDS) if (re.test(item.title)) return format;
  return "post";
}

/* ------------------------------ platform row ------------------------------ */
/** Chip width and label width, per spec, in the active and idle states. */
const FILTER: Record<
  Filter,
  { label: string; tint: string; icon: FeatherName | null; on: [number, number]; off: [number, number] }
> = {
  all: { label: "All Platforms", tint: ACCENT, icon: null, on: [123.94, 85.94], off: [125, 87] },
  instagram: { label: "Instagram", tint: "#e1306c", icon: "instagram", on: [127, 69], off: [126.02, 68.02] },
  youtube: { label: "YouTube", tint: "#ef4444", icon: "youtube", on: [117, 59], off: [116.8, 58.8] },
  brand: { label: "Brand", tint: "#10b981", icon: "briefcase", on: [99, 41], off: [98, 40] },
};

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/** The frame's own month, and the cursor's home when nothing is scheduled. */
const SPEC_YEAR = 2026;
const SPEC_MONTH = 5;

/* -------------------------------- backdrop -------------------------------- */
/** Frame fill: #f7f0e4 -> #f4ebdd under four radial washes. */
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

/* ------------------------------- day cell --------------------------------- */
type Entry = { id: string; format: Format };
type Tone = "idle" | "today" | "selected";

function ContentChip({ x, y, format }: { x: number; y: number; format: Format }) {
  const chip = CHIP[format];
  return (
    <Abs x={x} y={y} w={CHIP_W} h={CHIP_H} radius={5} style={styles.clip}>
      <LinearGradient
        colors={[chip.from, chip.to] as [string, string]}
        start={{ x: 0.15, y: 0 }}
        end={{ x: 0.85, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <Feather name={chip.icon} size={10} color={WHITE} style={styles.chipIcon} />
      <Txt
        x={17}
        y={2.5}
        w={chip.textW}
        size={9}
        weight="semibold"
        font="inter"
        color={WHITE}
        lineHeight={10.89}
        letterSpacing={0.2}
        numberOfLines={1}
      >
        {chip.label}
      </Txt>
    </Abs>
  );
}

function DayCell({
  x, y, h, day, entries, tone, canAdd, onPress, onAdd,
}: {
  x: number; y: number; h: number; day: number; entries: Entry[];
  tone: Tone; canAdd: boolean; onPress: () => void; onAdd: () => void;
}) {
  const shown = entries.slice(0, MAX_CHIPS);
  const extra = entries.length - shown.length;

  return (
    <>
      <Pressable
        onPress={onPress}
        style={[
          styles.cell,
          { left: x, top: y, height: h },
          tone === "selected" ? styles.cellSelected : styles.cellIdle,
        ]}
      />

      {tone === "selected" ? (
        <Abs x={x + DAY_DOT} y={y + DAY_DOT} w={22} h={22} radius={11} bg={ACCENT} style={selDotShadow} />
      ) : tone === "today" ? (
        <Abs x={x + DAY_DOT} y={y + DAY_DOT} w={22} h={22} radius={11} bg={ACCENT_15} />
      ) : null}

      <Txt
        x={x + DAY_DOT}
        y={y + 9.5}
        w={22}
        align="center"
        size={14}
        font="inter"
        weight={tone === "idle" ? "medium" : tone === "today" ? "bold" : "semibold"}
        color={tone === "selected" ? WHITE : tone === "today" ? ACCENT : INK_DAY}
        lineHeight={16.94}
      >
        {day}
      </Txt>

      {shown.map((entry, i) => (
        <ContentChip key={entry.id} x={x + CHIP_X} y={y + CHIP_Y + i * CHIP_STEP} format={entry.format} />
      ))}

      {extra > 0 ? (
        <>
          <Abs x={x + CHIP_X} y={y + MORE_Y} w={CHIP_W} h={15} radius={5} bg={TINT_04} />
          <Txt
            x={x + 2.58}
            y={y + MORE_Y + 2}
            w={34.42}
            align="center"
            size={9}
            weight="semibold"
            font="inter"
            color={INK_MUTED}
            lineHeight={10.89}
          >
            {`+${extra} more`}
          </Txt>
        </>
      ) : null}

      {canAdd ? (
        <Pressable onPress={onAdd} style={[styles.addButton, { left: x + 8.86, top: y + 37 }]}>
          <Feather name="plus" size={12} color={INK_MUTED} />
        </Pressable>
      ) : null}
    </>
  );
}

/* --------------------------------- screen --------------------------------- */
export default function PlannerMonth() {
  const router = useRouter();
  const { data = [] } = useCalendar();

  const [filter, setFilter] = useState<Filter>("all");
  const [monthStep, setMonthStep] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);

  /** Home month: where the schedule actually starts, else the frame's June 2026. */
  const home = useMemo(() => {
    let earliest = Number.POSITIVE_INFINITY;
    for (const item of data) {
      const at = Date.parse(item.scheduledAt);
      if (!Number.isNaN(at) && at < earliest) earliest = at;
    }
    if (!Number.isFinite(earliest)) return new Date(SPEC_YEAR, SPEC_MONTH, 1);
    const first = new Date(earliest);
    return new Date(first.getFullYear(), first.getMonth(), 1);
  }, [data]);

  const cursor = useMemo(
    () => new Date(home.getFullYear(), home.getMonth() + monthStep, 1),
    [home, monthStep],
  );

  /** Scheduled content for the cursor month, grouped by day and filtered. */
  const byDay = useMemo(() => {
    const map = new Map<number, Entry[]>();
    for (const item of data) {
      const at = new Date(item.scheduledAt);
      if (Number.isNaN(at.getTime())) continue;
      if (at.getFullYear() !== cursor.getFullYear() || at.getMonth() !== cursor.getMonth()) continue;
      const format = formatOf(item);
      const owner = PLATFORM_OF[format];
      if (filter !== "all" && owner !== "any" && owner !== filter) continue;
      const day = at.getDate();
      const list = map.get(day);
      if (list) list.push({ id: item.id, format });
      else map.set(day, [{ id: item.id, format }]);
    }
    return map;
  }, [data, cursor, filter]);

  /**
   * Row rhythm. Rows keep the frame's 70.39 height and 6pt gap; a row holding a
   * day with stacked chips grows to 96.41 while the card's 402pt grid can pay
   * for it — which is exactly how the traced month spends its budget (five
   * rows, one tall). Months needing a sixth row share the 402 evenly instead of
   * spilling out of the card.
   */
  const grid = useMemo(() => {
    const lead = new Date(cursor.getFullYear(), cursor.getMonth(), 1).getDay();
    const days = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate();
    const rows = Math.ceil((lead + days) / 7);
    const base = Math.min(ROW_H, (GRID_H - (rows - 1) * ROW_GAP) / rows);

    let budget = GRID_H - (rows * base + (rows - 1) * ROW_GAP);
    const heights: number[] = [];
    for (let r = 0; r < rows; r++) {
      let stacked = false;
      for (let c = 0; c < 7; c++) {
        const day = r * 7 + c - lead + 1;
        if (day >= 1 && day <= days && (byDay.get(day)?.length ?? 0) >= 2) stacked = true;
      }
      if (stacked && budget >= ROW_H_TALL - base) {
        heights.push(ROW_H_TALL);
        budget -= ROW_H_TALL - base;
      } else heights.push(base);
    }

    const tops: number[] = [];
    let top = GRID_Y;
    for (const h of heights) {
      tops.push(top);
      top += h + ROW_GAP;
    }
    return { lead, days, rows, heights, tops };
  }, [cursor, byDay]);

  const now = new Date();
  const today =
    now.getFullYear() === cursor.getFullYear() && now.getMonth() === cursor.getMonth()
      ? now.getDate()
      : null;

  /** The frame elevates one day; default to the first day that carries content. */
  const firstBusy = useMemo(() => {
    let min: number | null = null;
    for (const day of byDay.keys()) if (min === null || day < min) min = day;
    return min;
  }, [byDay]);
  const selected = picked ?? firstBusy ?? today;

  const order: Filter[] =
    filter === "all"
      ? ["all", "instagram", "youtube", "brand"]
      : [filter, "all", ...(["instagram", "youtube", "brand"] as Platform[]).filter((p) => p !== filter)];

  const stepMonth = (delta: number) => {
    setMonthStep(monthStep + delta);
    setPicked(null);
  };

  return (
    <Screen height={FRAME_H} background="#F7F0E4" scroll>
      <Backdrop />

      {/* -------------------------------- Header -------------------------- */}
      <Pressable onPress={() => router.back()} style={[styles.backButton, backShadow]}>
        <Feather name="arrow-left" size={20} color={INK_HEADER} />
      </Pressable>

      <Abs
        x={108}
        y={17}
        w={193}
        h={46}
        radius={28}
        bg={GLASS_60}
        border={EDGE_70}
        borderWidth={1}
        style={pillShadow}
      />
      <Pressable onPress={() => stepMonth(-1)} style={[styles.stepButton, { left: 115 }, stepShadow]}>
        <Feather name="chevron-left" size={18} color={INK_STEP} />
      </Pressable>
      <Txt
        x={159}
        y={30.5}
        w={91}
        align="center"
        size={16}
        weight="bold"
        font="inter"
        color={INK_STEP}
        lineHeight={19.36}
        letterSpacing={-0.2}
      >
        {`${MONTHS[cursor.getMonth()]} ${cursor.getFullYear()}`}
      </Txt>
      <Pressable onPress={() => stepMonth(1)} style={[styles.stepButton, { left: 258 }, stepShadow]}>
        <Feather name="chevron-right" size={18} color={INK_STEP} />
      </Pressable>

      {/* ---------------------------- Platform Filter --------------------- */}
      <Abs x={0} y={111} w={FRAME_W} h={39}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterRow}
          contentContainerStyle={styles.filterContent}
        >
          {order.map((key) => {
            const meta = FILTER[key];
            const on = key === filter;
            const [chipW, textW] = on ? meta.on : meta.off;
            return (
              <Pressable
                key={key}
                onPress={() => setFilter(key)}
                style={[
                  styles.filterChip,
                  { width: chipW },
                  on
                    ? { backgroundColor: meta.tint, borderColor: meta.tint, ...chipGlow(meta.tint) }
                    : styles.filterChipIdle,
                ]}
              >
                {meta.icon ? (
                  <Feather name={meta.icon} size={14} color={on ? WHITE : meta.tint} />
                ) : null}
                <Txt
                  w={textW}
                  size={14}
                  weight="semibold"
                  font="inter"
                  color={on ? WHITE : INK_MUTED}
                  lineHeight={16.94}
                  numberOfLines={1}
                >
                  {meta.label}
                </Txt>
              </Pressable>
            );
          })}
        </ScrollView>
      </Abs>

      {/* -------------------------- Calendar Container -------------------- */}
      <Abs
        x={CARD.x}
        y={CARD.y}
        w={CARD.w}
        h={CARD.h}
        radius={28}
        bg={GLASS_55}
        border={EDGE_70}
        borderWidth={1}
        style={cardShadow}
      />

      {DOW.map((letter, i) => (
        <Txt
          key={`dow-${i}`}
          x={DOW_X[i]}
          y={DOW_Y}
          w={44.71}
          align="center"
          size={13}
          weight="semibold"
          font="inter"
          color={INK_MUTED}
          lineHeight={15.73}
          letterSpacing={0.5}
        >
          {letter}
        </Txt>
      ))}

      {Array.from({ length: grid.rows * 7 }, (_, slot) => {
        const day = slot - grid.lead + 1;
        // Empty slots carry a transparent stroke in the frame: nothing to draw.
        if (day < 1 || day > grid.days) return null;
        const row = Math.floor(slot / 7);
        const entries = byDay.get(day) ?? [];
        const tone: Tone = day === selected ? "selected" : day === today ? "today" : "idle";
        return (
          <DayCell
            key={day}
            x={COL_X[slot % 7]}
            y={grid.tops[row]}
            h={grid.heights[row]}
            day={day}
            entries={entries}
            tone={tone}
            canAdd={day === today && entries.length === 0}
            onPress={() => setPicked(day)}
            onAdd={() => router.push("/content/content-itinerary-set-date")}
          />
        );
      })}

      {/* ------------------------------- Footer --------------------------- */}
      <LinearGradient
        colors={FOOTER_FADE}
        locations={[0, 0.4, 1]}
        start={{ x: 0.5, y: 1 }}
        end={{ x: 0.5, y: 0 }}
        style={styles.footerFade}
      />

      <Pressable
        onPress={() => router.push("/system/desktop-handoff-scan")}
        style={[styles.footerButton, { left: 20 }, footShadow]}
      >
        <MaterialCommunityIcons name="qrcode-scan" size={20} color={INK_STEP} />
      </Pressable>

      <Pressable
        onPress={() => router.push("/content/content-itinerary")}
        style={[styles.footerButton, { left: 88 }, footShadow]}
      >
        <Feather name="share" size={20} color={INK_STEP} />
      </Pressable>

      <Pressable
        onPress={() => router.push("/content/plan-generator")}
        style={[styles.generate, generateShadow]}
      >
        <LinearGradient
          colors={GENERATE}
          start={{ x: 0.18, y: 0 }}
          end={{ x: 0.82, y: 1 }}
          style={styles.generateFill}
        />
        <MaterialCommunityIcons
          name="star-four-points-outline"
          size={15}
          color={WHITE}
          style={styles.sparkleBig}
        />
        <MaterialCommunityIcons
          name="star-four-points-outline"
          size={3}
          color={WHITE}
          style={styles.sparkleSmall}
        />
        <Txt
          x={48.38}
          y={18.5}
          w={128.25}
          align="center"
          size={15}
          weight="semibold"
          font="inter"
          color={WHITE}
          lineHeight={18.15}
        >
          Generate Content
        </Txt>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  backdrop: { position: "absolute", left: 0, top: 0 },
  clip: { overflow: "hidden" },

  /* header */
  backButton: {
    position: "absolute",
    left: 15,
    top: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: EDGE_90,
    backgroundColor: GLASS_70,
    alignItems: "center",
    justifyContent: "center",
  },
  stepButton: {
    position: "absolute",
    top: 22,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: WHITE,
    alignItems: "center",
    justifyContent: "center",
  },

  /* platform filter */
  filterRow: { width: FRAME_W, height: 39 },
  filterContent: { paddingHorizontal: 20, height: 39, alignItems: "center", gap: 10 },
  filterChip: {
    height: 39,
    borderRadius: 24,
    borderWidth: 1,
    paddingLeft: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  filterChipIdle: { backgroundColor: GLASS_80, borderColor: EDGE_90 },

  /* calendar cells */
  cell: { position: "absolute", width: CELL_W, borderRadius: 14, borderWidth: 1 },
  cellIdle: { backgroundColor: GLASS_40, borderColor: EDGE_80 },
  cellSelected: { backgroundColor: WHITE, borderColor: ACCENT_50, ...selCellShadow },
  chipIcon: { position: "absolute", left: 4, top: 3 },
  addButton: {
    position: "absolute",
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: TINT_04,
    alignItems: "center",
    justifyContent: "center",
  },

  /* footer */
  footerFade: { position: "absolute", left: 0, top: 767, width: FRAME_W, height: 108 },
  footerButton: {
    position: "absolute",
    top: 787,
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: EDGE_80,
    backgroundColor: GLASS_70,
    alignItems: "center",
    justifyContent: "center",
  },
  generate: {
    position: "absolute",
    left: 156,
    top: 787,
    width: 199,
    height: 56,
    borderRadius: 28,
    overflow: "hidden",
  },
  generateFill: { position: "absolute", left: 0, top: 0, right: 0, bottom: 0 },
  sparkleBig: { position: "absolute", left: 23.88, top: 20.5 },
  sparkleSmall: { position: "absolute", left: 23.88, top: 32.5 },
});
