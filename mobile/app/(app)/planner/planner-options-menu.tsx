import { useMemo, useState } from "react";
import { Pressable } from "react-native";
import { useRouter } from "expo-router";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Svg, {
  Defs,
  RadialGradient,
  Rect,
  Stop,
  LinearGradient as SvgLinear,
} from "react-native-svg";
import { Abs, Screen, Txt } from "../../../src/ui/Frame";
import { colors } from "../../../src/theme";
import { useCalendar } from "../../../src/api/hooks";

/**
 * Planner — overflow menu (Figma 719:11542 "menu", 375x946).
 *
 * The kebab in the Plan Content header (still shipped in the latest planner
 * frame 7358:23141 at 318,20) opens this two-item sheet over the month grid:
 * "Reset Collab Dates" re-enters the collab-day wizard, "Change Content
 * Delivery Timeline" re-enters the delivery step. There is no 875-generation
 * redraw of this frame, so the geometry below is lifted from the legacy 946
 * frame and only the surface tokens — page wash, Inter type ramp, #1c1c1e ink,
 * hairline borders and glass fills — are swapped for the 875 set.
 *
 * The frame is 946 tall, so <Screen> scrolls it; coordinates stay raw.
 */

/* -------------------------------- geometry ------------------------------- */

const FRAME_W = 375;
const FRAME_H = 946;

/** Calendar card — "Container" 13,122 348x553. */
const CARD_X = 13;
const CARD_Y = 122;
const CARD_W = 348;
const CARD_H = 553;

/**
 * Day grid. Rows 2-5 sit on a clean seven-column track; row 1 is nudged 4px by
 * its auto-layout wrapper, so the uniform track is used throughout.
 */
const COL_X = [15, 64, 113, 162, 211, 260, 309];
const ROW_Y = [214, 299.5, 387, 469.5, 554.5];
const CELL_W = 49;
const CELL_H = 80;

/** Day number: +16.5 in a plain cell, +11.5 once a cell carries a chip. */
const DAY_DY = 16.5;
const DAY_DY_MARKED = 11.5;

/** "post" chip — 40x14 at +4,+61 from the cell, label inset 3.5,1.5. */
const CHIP_DX = 4;
const CHIP_DY = 61;
/** Label box is 33 wide inside a 40 chip, so +3.5 centres it. */
const CHIP_LABEL_DX = 3.5;
const CHIP_LABEL_DY = 1.5;
const CHIP_LABEL_W = 33;
const CHIP_W = 40;
const CHIP_H = 14;

/** Platform glyph — 12x12 at +4,+3 from the cell. */
const ICON_DX = 4;
const ICON_DY = 3;
const ICON_SIZE = 12;

/** "Dot" — 8x8 at +20.5,+50.5 from the cell. */
const DOT_DX = 20.5;
const DOT_DY = 50.5;
const DOT_SIZE = 8;

/**
 * Weekday strip — "Frame 91" 15,182, seven left-aligned labels. The widths are
 * Figma's measured text boxes; RN's Inter sets a hair wider, so "Mon" wrapped
 * to "Mo/n" at 25.26. The labels are left-aligned, so padding the box out is
 * invisible and just keeps every label on one line.
 */
const WEEK_Y = 182;
const WEEK_SLACK = 4;
const WEEKDAYS = [
  { label: "Mon", x: 25, w: 25.26 },
  { label: "Tue", x: 78, w: 22 },
  { label: "Wed", x: 128, w: 26 },
  { label: "Thu", x: 177, w: 23 },
  { label: "Fri", x: 226, w: 17 },
  { label: "Sat", x: 271, w: 20 },
  { label: "Sun", x: 319, w: 25 },
];

/** Overlay — "Frame 1171275376" 29,95 316x74, divider "Line 27" at y=132. */
const MENU_X = 29;
const MENU_Y = 95;
const MENU_W = 316;
const MENU_H = 74;
const MENU_SPLIT = 132;

/* ------------------------------ colour tokens ----------------------------- */

/** 875 ink ramp, standing in for the legacy #000000 / #1b1b1c. */
const INK = "#1c1c1e";
const TITLE_INK = "#1d1d1f";
/** Spec tokens kept verbatim. */
const WEEKDAY_INK = "#6b7280";
const CELL_LINE = "#aeaeb2";
const HAIRLINE_SOFT = "#f0eff1";
const SCRIM = "rgba(217,217,217,0.8)";
const CTA_INK = "#9258ff";
const LINK_INK = "#111111";
/** 875 glass surfaces, replacing the legacy flat white + 1px #000 strokes. */
const HAIRLINE = "rgba(0,0,0,0.1)";
const CARD_BG = "rgba(255,255,255,0.55)";
const GLASS_65 = "rgba(255,255,255,0.65)";
const GLASS_90 = "rgba(255,255,255,0.9)";

/** #0000000d / 2px / y+1 — the header bar and calendar card. */
const CARD_SHADOW = {
  shadowColor: colors.ink,
  shadowOpacity: 0.05,
  shadowRadius: 2,
  shadowOffset: { width: 0, height: 1 },
  elevation: 2,
} as const;

/** #0000001f / 24px / y+8 — the menu popover, lifted off the scrim. */
const MENU_SHADOW = {
  shadowColor: colors.ink,
  shadowOpacity: 0.12,
  shadowRadius: 24,
  shadowOffset: { width: 0, height: 8 },
  elevation: 12,
} as const;

/* ------------------------------ event marking ----------------------------- */

type Platform = "instagram" | "linkedin" | "youtube";

interface Accent {
  color: string;
  icon: Platform;
}

/** The three marked cells the frame ships, in order. */
const ACCENTS: Accent[] = [
  { color: "#da4086", icon: "instagram" },
  { color: "#0a66c2", icon: "linkedin" },
  { color: "#ff0000", icon: "youtube" },
];

interface Mark {
  accent: string;
  icon: Platform;
  /** Chip copy — both literals are on the frame. */
  label: string;
  /** Event=Event cells show a bare dot instead of a chip. */
  dot: boolean;
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/** The frame reads "June" / "2025"; used until the calendar answers. */
const SPEC_MONTH = { y: 2025, m: 5 };

/* --------------------------------- glyphs --------------------------------- */

/** 875 page wash — a warm linear base under four radial blooms. */
function Backdrop() {
  return (
    <Svg
      width={FRAME_W}
      height={FRAME_H}
      style={{ position: "absolute", left: 0, top: 0 }}
    >
      <Defs>
        <SvgLinear id="base" x1="187.5" y1="0" x2="187.5" y2={FRAME_H} gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#f7f0e4" />
          <Stop offset="1" stopColor="#f4ebdd" />
        </SvgLinear>
        <RadialGradient id="haze" cx="75" cy="95" rx="1466" ry="805" gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#ffffff" stopOpacity={0.72} />
          <Stop offset="0.24" stopColor="#ffffff" stopOpacity={0} />
        </RadialGradient>
        <RadialGradient id="gold" cx="292" cy="170" rx="1338" ry="735" gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#f6d64a" stopOpacity={0.22} />
          <Stop offset="0.2" stopColor="#f6d64a" stopOpacity={0} />
        </RadialGradient>
        <RadialGradient id="blue" cx="90" cy="397" rx="967" ry="533" gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#bacdf4" stopOpacity={0.36} />
          <Stop offset="0.24" stopColor="#bacdf4" stopOpacity={0} />
        </RadialGradient>
        <RadialGradient id="pink" cx="285" cy="586" rx="1027" ry="568" gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#f7b7da" stopOpacity={0.34} />
          <Stop offset="0.26" stopColor="#f7b7da" stopOpacity={0} />
        </RadialGradient>
      </Defs>
      <Rect width={FRAME_W} height={FRAME_H} fill="url(#base)" />
      <Rect width={FRAME_W} height={FRAME_H} fill="url(#haze)" />
      <Rect width={FRAME_W} height={FRAME_H} fill="url(#gold)" />
      <Rect width={FRAME_W} height={FRAME_H} fill="url(#blue)" />
      <Rect width={FRAME_W} height={FRAME_H} fill="url(#pink)" />
    </Svg>
  );
}

/** charm:menu-kebab — three 1.5 vectors at 350.25, stepping 5.5 down. */
function Kebab() {
  return (
    <Svg width={16} height={16} viewBox="0 0 16 16">
      <Rect x={7.25} y={1.75} width={1.5} height={1.5} rx={0.75} fill={INK} />
      <Rect x={7.25} y={7.25} width={1.5} height={1.5} rx={0.75} fill={INK} />
      <Rect x={7.25} y={12.75} width={1.5} height={1.5} rx={0.75} fill={INK} />
    </Svg>
  );
}

/* --------------------------------- screen --------------------------------- */

export default function PlannerOptionsMenu() {
  const router = useRouter();
  const { data: calendar, isLoading } = useCalendar();

  /**
   * Month on show. It starts on the month of the creator's earliest scheduled
   * item so the grid behind the menu is never blank, and falls back to the
   * frame's June 2025 while the calendar is still loading.
   */
  const [shift, setShift] = useState(0);

  const anchor = useMemo(() => {
    const first = (calendar ?? [])
      .map((item) => item.scheduledAt)
      .sort()[0];
    if (!first) return SPEC_MONTH;
    return { y: Number(first.slice(0, 4)), m: Number(first.slice(5, 7)) - 1 };
  }, [calendar]);

  const cursor = useMemo(() => {
    const d = new Date(anchor.y, anchor.m + shift, 1);
    return { y: d.getFullYear(), m: d.getMonth() };
  }, [anchor, shift]);

  const monthKey = `${cursor.y}-${String(cursor.m + 1).padStart(2, "0")}`;

  /** Real scheduled content for the month on show. */
  const marks = useMemo(() => {
    const out = new Map<number, Mark>();
    (calendar ?? [])
      .filter((item) => item.scheduledAt.slice(0, 7) === monthKey)
      .sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt))
      .forEach((item, i) => {
        const accent = ACCENTS[i % ACCENTS.length];
        out.set(Number(item.scheduledAt.slice(8, 10)), {
          accent: accent.color,
          icon: accent.icon,
          label: item.title.includes("Reel") ? "Reel" : "Collab",
          dot: item.status === "scheduled",
        });
      });
    return out;
  }, [calendar, monthKey]);

  /** Monday-first cells, capped to the five rows the frame draws. */
  const cells = useMemo(() => {
    const firstDow = (new Date(cursor.y, cursor.m, 1).getDay() + 6) % 7;
    const total = new Date(cursor.y, cursor.m + 1, 0).getDate();
    const out: { day: number; x: number; y: number }[] = [];
    for (let day = 1; day <= total; day += 1) {
      const slot = firstDow + day - 1;
      const row = Math.floor(slot / 7);
      if (row >= ROW_Y.length) break;
      out.push({ day, x: COL_X[slot % 7], y: ROW_Y[row] });
    }
    return out;
  }, [cursor]);

  return (
    <Screen height={FRAME_H} background="#f7f0e4" scroll>
      <Backdrop />

      {/* Calendar card — "Container" 719:11543 */}
      <Abs
        x={CARD_X}
        y={CARD_Y}
        w={CARD_W}
        h={CARD_H}
        radius={12}
        bg={CARD_BG}
        border={HAIRLINE}
        borderWidth={1}
        style={CARD_SHADOW}
      />

      {/* Month header — "Frame 1171275430" 15,125 343x45 */}
      <Pressable
        onPress={() => setShift(shift - 1)}
        style={{ position: "absolute", left: 26, top: 139.5 }}
      >
        <Feather name="chevron-left" size={16} color={INK} />
      </Pressable>
      <Txt
        x={46}
        y={135}
        w={42}
        size={16}
        weight="medium"
        font="inter"
        color={INK}
        lineHeight={25}
        letterSpacing={0.38}
        align="center"
      >
        {String(cursor.y)}
      </Txt>
      <Txt
        x={162}
        y={135}
        w={49}
        size={20}
        weight="semibold"
        font="inter"
        color={INK}
        lineHeight={25}
        letterSpacing={0.38}
        align="center"
      >
        {MONTHS[cursor.m]}
      </Txt>

      {/* Weekday strip — "Frame 91" 15,182 342x16 */}
      {WEEKDAYS.map((d) => (
        <Txt
          key={d.label}
          x={d.x}
          y={WEEK_Y}
          w={d.w + WEEK_SLACK}
          size={12}
          weight="medium"
          font="inter"
          color={WEEKDAY_INK}
          lineHeight={16}
        >
          {d.label}
        </Txt>
      ))}

      {/* Day cells — Calendar/Normal/Day, 49x80 on the seven-column track. */}
      {cells.map((cell) => {
        const mark = marks.get(cell.day);
        const chip = mark && !mark.dot;
        return (
          <Abs
            key={`cell-${cell.day}`}
            x={cell.x}
            y={cell.y}
            w={CELL_W}
            h={CELL_H}
            radius={chip ? 4 : undefined}
            style={
              chip
                ? {
                    backgroundColor: GLASS_65,
                    borderWidth: 1,
                    borderColor: mark.accent,
                    shadowColor: mark.accent,
                    shadowOpacity: 1,
                    shadowRadius: 0,
                    shadowOffset: { width: 1, height: 1 },
                    elevation: 0,
                  }
                : { borderTopWidth: 0.3, borderTopColor: CELL_LINE }
            }
          >
            <Txt
              x={0}
              y={chip ? DAY_DY_MARKED : DAY_DY}
              w={CELL_W}
              size={18}
              weight="regular"
              font="inter"
              color={INK}
              lineHeight={22}
              letterSpacing={-0.41}
              align="center"
            >
              {String(cell.day)}
            </Txt>
          </Abs>
        );
      })}

      {/* Event decoration rides above the grid, as it does in the frame. */}
      {cells.map((cell) => {
        const mark = marks.get(cell.day);
        if (!mark) return null;
        if (mark.dot) {
          return (
            <Abs
              key={`dot-${cell.day}`}
              x={cell.x + DOT_DX}
              y={cell.y + DOT_DY}
              w={DOT_SIZE}
              h={DOT_SIZE}
              radius={100}
              bg={mark.accent}
            />
          );
        }
        return (
          <Abs
            key={`chip-${cell.day}`}
            x={cell.x + CHIP_DX}
            y={cell.y + CHIP_DY}
            w={CHIP_W}
            h={CHIP_H}
            radius={4}
            bg={mark.accent}
          >
            <Txt
              x={CHIP_LABEL_DX}
              y={CHIP_LABEL_DY}
              w={CHIP_LABEL_W}
              size={10}
              weight="semibold"
              font="inter"
              color={colors.white}
              lineHeight={11}
              align="center"
            >
              {mark.label}
            </Txt>
          </Abs>
        );
      })}
      {cells.map((cell) => {
        const mark = marks.get(cell.day);
        if (!mark || mark.dot) return null;
        return (
          <Abs
            key={`icon-${cell.day}`}
            x={cell.x + ICON_DX}
            y={cell.y + ICON_DY}
            w={ICON_SIZE}
            h={ICON_SIZE}
          >
            <MaterialCommunityIcons name={mark.icon} size={ICON_SIZE} color={mark.accent} />
          </Abs>
        );
      })}

      {/* Empty month keeps the card geometry and just says so. */}
      {!isLoading && marks.size === 0 ? (
        <Txt
          x={CARD_X}
          y={CARD_Y + CARD_H - 34}
          w={CARD_W}
          size={12}
          weight="medium"
          font="inter"
          color={WEEKDAY_INK}
          lineHeight={16}
          align="center"
        >
          {`No content scheduled in ${MONTHS[cursor.m]}`}
        </Txt>
      ) : null}

      {/* Header bar — "Container" 719:11617, 0,44 375x54 */}
      <Abs
        x={0}
        y={44}
        w={FRAME_W}
        h={54}
        style={[
          { borderBottomWidth: 1, borderBottomColor: HAIRLINE_SOFT },
          CARD_SHADOW,
        ]}
      />
      <Pressable
        onPress={() => router.back()}
        style={{ position: "absolute", left: 16, top: 52 }}
      >
        <Abs
          x={0}
          y={0}
          w={36}
          h={36}
          radius={18}
          bg={GLASS_65}
          border={GLASS_90}
          borderWidth={1}
          center
        >
          <Feather name="arrow-left" size={24} color={INK} />
        </Abs>
      </Pressable>
      {/*
        Figma's box is 118 — its own Outfit measurement of "Plan Content". The
        875 ramp sets this in Inter, which runs wider, so 118 wrapped and hid
        "Content" behind the popover. Left-aligned, so a roomier box is inert.
      */}
      <Txt
        x={62}
        y={52}
        w={160}
        size={20}
        weight="semibold"
        font="inter"
        color={TITLE_INK}
        lineHeight={37}
      >
        Plan Content
      </Txt>
      {/* The kebab that opened this menu — tapping it again dismisses. */}
      <Pressable
        onPress={() => router.back()}
        style={{ position: "absolute", left: 343, top: 63 }}
      >
        <Kebab />
      </Pressable>

      {/* Footer — "Frame 1171275416" 13,795 349x53 */}
      <Abs
        x={13}
        y={795}
        w={207}
        h={53}
        radius={28}
        bg={GLASS_65}
        border={HAIRLINE}
        borderWidth={1}
      />
      <Abs x={20} y={801} w={40} h={40} radius={20}>
        <LinearGradient
          colors={["#4a25e1", "#7b5aff"] as const}
          locations={[0, 0.93] as const}
          start={{ x: 0.6, y: 0.83 }}
          end={{ x: 0.81, y: 0.06 }}
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* "Vector" 719:11852 — a 16x16.5 four-point sparkle, not a wand. */}
          <MaterialCommunityIcons name="star-four-points" size={16} color={colors.white} />
        </LinearGradient>
      </Abs>
      <Txt
        x={70}
        y={811}
        w={139}
        size={16}
        weight="semibold"
        font="inter"
        color={CTA_INK}
        lineHeight={18}
        align="center"
      >
        Generate Conetnt
      </Txt>
      <Abs
        x={314}
        y={797.5}
        w={48}
        h={48}
        radius={24}
        bg={GLASS_65}
        border={HAIRLINE}
        borderWidth={1}
        center
      >
        <Feather name="link-2" size={20} color={LINK_INK} />
      </Abs>

      {/* Overlay — "Frame 1171275378" 719:11872, the menu itself */}
      <Pressable
        onPress={() => router.back()}
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: FRAME_W,
          height: FRAME_H,
          backgroundColor: SCRIM,
        }}
      />
      <Abs
        x={MENU_X}
        y={MENU_Y}
        w={MENU_W}
        h={MENU_H}
        radius={12}
        bg={colors.white}
        border={HAIRLINE}
        borderWidth={1}
        style={MENU_SHADOW}
      />
      <Pressable
        onPress={() => router.push("/planner/collab-days-select")}
        style={{
          position: "absolute",
          left: MENU_X,
          top: MENU_Y,
          width: MENU_W,
          height: MENU_SPLIT - MENU_Y,
        }}
      >
        <Txt
          x={11}
          y={7}
          w={295}
          size={13}
          weight="regular"
          font="inter"
          color={INK}
          lineHeight={24}
        >
          Reset Collab Dates
        </Txt>
      </Pressable>
      <Abs x={30} y={MENU_SPLIT} w={315} h={1} bg={HAIRLINE_SOFT} />
      <Pressable
        onPress={() => router.push("/planner/content-delivery-timeline")}
        style={{
          position: "absolute",
          left: MENU_X,
          top: MENU_SPLIT,
          width: MENU_W,
          height: MENU_Y + MENU_H - MENU_SPLIT,
        }}
      >
        <Txt
          x={11}
          y={6}
          w={295}
          size={13}
          weight="regular"
          font="inter"
          color={INK}
          lineHeight={24}
        >
          Change Content Delivery Timeline
        </Txt>
      </Pressable>
    </Screen>
  );
}
