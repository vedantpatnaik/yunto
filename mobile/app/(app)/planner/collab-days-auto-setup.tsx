import { useMemo, useState } from "react";
import { Pressable, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import Svg, {
  Defs,
  LinearGradient as SvgLinear,
  RadialGradient,
  Rect,
  Stop,
} from "react-native-svg";
import { Abs, Screen, Txt } from "../../../src/ui/Frame";
import { useCalendar, useCreate, useCreators } from "../../../src/api/hooks";
import type { CalendarItem } from "../../../src/api/hooks";

/**
 * Automatic collab-day setup — Figma frame 719:11249 "random collab day"
 * (375x946), traced 1:1 and restyled onto the 875-frame token set (cream
 * #f7f0e4 -> #f4ebdd backdrop, Inter, #7c3aed accent) so the automatic branch
 * matches the rest of the planner flow.
 *
 * Two layers: the month grid with its per-day platform chips and the two
 * bottom actions ("Select Randomly" / "Save"), and over them the scrimmed
 * "Setup your collab days" sheet whose four rows set how many collab days the
 * generator should place on each platform.
 *
 * Coordinates are raw frame coordinates; <Screen> scales the 375pt canvas.
 */

/* ------------------------------ frame geometry ---------------------------- */
const FRAME_W = 375;
const FRAME_H = 946;

/** The two stacked white "Container" cards behind the calendar. */
const CARD_OUTER = { x: 13, y: 122, w: 348, h: 488 };
const CARD_INNER = { x: 15, y: 125, w: 348, h: 553 };

/** Seven 49x80 day tracks; rows step ~85pt down the card. */
const COL_X = [17, 66, 115, 164, 213, 262, 311];
const CELL_W = 49;
const CELL_H = 80;
const ROW_Y = [217, 302.5, 390, 472.5, 557.5];
/** 557.5 - 217: the travel a six-row month has to compress into. */
const ROW_SPAN = 340.5;

/** Offsets inside a day cell, lifted from the design's day instances. */
const DAY_TEXT_DY = 16.5;
const ICON_DX = 4;
const ICON_DY = 3;
const CHIP_DX = 4;
const CHIP_DY = 61;
const CHIP_W = 40;
const CHIP_H = 14;
const DOT_DX = 20.5;
const DOT_DY = 50.5;
const DOT_SIZE = 8;

/** Weekday header "Frame 91" at y=185 — Monday-first, left aligned. */
const WEEKDAYS = [
  { label: "Mon", x: 27, w: 25.26 },
  { label: "Tue", x: 80, w: 22 },
  { label: "Wed", x: 130, w: 26 },
  { label: "Thu", x: 179, w: 23 },
  { label: "Fri", x: 228, w: 17 },
  { label: "Sat", x: 273, w: 20 },
  { label: "Sun", x: 321, w: 25 },
] as const;

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/* ------------------------------- spec colours ----------------------------- */
const INK = "#000000";
const TITLE_INK = "#1b1b1c";
const DAY_MUTED = "#8e8e93";
const WEEKDAY_INK = "#6b7280";
const SHEET_FILL = "#f8ebf2";
const SCRIM = "rgba(213,213,213,0.8)";
const ADD_FILL = "#f2c4dd";
const RANDOM_FILL = "#ffbcb8";
const BUTTON_INK = "#333333";
const HEADING_INK = "#111827";
const QUESTION_INK = "#040404";
const INFO_INK = "#191919";
const FIELD_INK = "rgba(0,0,0,0.5)";
const GLASS_65 = "rgba(255,255,255,0.65)";
const GLASS_75 = "rgba(255,255,255,0.75)";
const GLASS_90 = "rgba(255,255,255,0.9)";
/** 875-token accent, used for the platform the design never chips. */
const ACCENT = "#7c3aed";

/* ------------------------------ platform table ---------------------------- */
type PlatformKey = "instagram" | "youtube" | "linkedin" | "x";

/**
 * The sheet's four "Input" rows. Labels and row/label coordinates are the
 * spec's; `color` is the brand fill the design uses on that platform's chip
 * (#da4086 / #ff0000 / #0a66c2), with the accent standing in for X.
 */
const PLATFORMS = [
  {
    key: "instagram", label: "On Instagram", name: "Instagram",
    rowY: 476, textY: 483, color: "#da4086", icon: "instagram",
  },
  {
    key: "youtube", label: "On YouTube", name: "YouTube",
    rowY: 523, textY: 530, color: "#ff0000", icon: "youtube",
  },
  {
    key: "linkedin", label: "On LinkedIn", name: "LinkedIn",
    rowY: 571, textY: 578, color: "#0a66c2", icon: "linkedin",
  },
  {
    key: "x", label: "On X", name: "X",
    rowY: 618, textY: 625, color: ACCENT, icon: "twitter",
  },
] as const;

const FIELD_X = 33;
const FIELD_W = 316.5;
const FIELD_H = 38;
const LABEL_X = 45;
const LABEL_W = 106;
/** Stepper module on the row's right edge; "+" sits on the design's caret x. */
const MINUS_X = 270;
const VALUE_X = 286;
const VALUE_W = 32;
const PLUS_X = 318;
const CONTROL = 16;

const byPlatform = (p: string | undefined): PlatformKey =>
  p === "YOUTUBE" ? "youtube" : p === "INSTAGRAM" ? "instagram" : "x";

const pad = (n: number) => String(n).padStart(2, "0");

/* -------------------------------- backdrop -------------------------------- */
/** Cream base plus the soft glows the 875 frames use, stretched to 946pt. */
function Backdrop() {
  return (
    <Svg width={FRAME_W} height={FRAME_H} style={styles.backdrop}>
      <Defs>
        <SvgLinear id="cd-base" x1="187.5" y1="0" x2="187.5" y2={FRAME_H} gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#F7F0E4" />
          <Stop offset="1" stopColor="#F4EBDD" />
        </SvgLinear>
        <RadialGradient id="cd-pink" cx="285" cy="586.5" rx="1027.5" ry="614.9" gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#F7B7DA" stopOpacity="0.34" />
          <Stop offset="0.26" stopColor="#F7B7DA" stopOpacity="0" />
        </RadialGradient>
        <RadialGradient id="cd-blue" cx="90" cy="397.3" rx="967.5" ry="577.2" gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#BACDF4" stopOpacity="0.36" />
          <Stop offset="0.24" stopColor="#BACDF4" stopOpacity="0" />
        </RadialGradient>
        <RadialGradient id="cd-gold" cx="292.5" cy="170.3" rx="1338.75" ry="794.7" gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#F6D64A" stopOpacity="0.22" />
          <Stop offset="0.2" stopColor="#F6D64A" stopOpacity="0" />
        </RadialGradient>
        <RadialGradient id="cd-haze" cx="75" cy="94.6" rx="1466.25" ry="870.4" gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#FFFFFF" stopOpacity="0.72" />
          <Stop offset="0.24" stopColor="#FFFFFF" stopOpacity="0" />
        </RadialGradient>
      </Defs>
      <Rect width={FRAME_W} height={FRAME_H} fill="url(#cd-base)" />
      <Rect width={FRAME_W} height={FRAME_H} fill="url(#cd-pink)" />
      <Rect width={FRAME_W} height={FRAME_H} fill="url(#cd-blue)" />
      <Rect width={FRAME_W} height={FRAME_H} fill="url(#cd-gold)" />
      <Rect width={FRAME_W} height={FRAME_H} fill="url(#cd-haze)" />
    </Svg>
  );
}

/* --------------------------------- screen --------------------------------- */
interface Mark {
  platform: PlatformKey;
  /** "Reel" / "Collab" chip, or null when the day only carries a dot. */
  chip: string | null;
}

export default function CollabDaysAutoSetup() {
  const router = useRouter();

  const { data: calendar = [], isLoading } = useCalendar();
  const { data: creators = [] } = useCreators();
  const create = useCreate<CalendarItem>("calendar");

  const today = useMemo(() => new Date(), []);
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());

  /** How many collab days the generator should place, per platform. */
  const [counts, setCounts] = useState<Record<PlatformKey, number>>({
    instagram: 0, youtube: 0, linkedin: 0, x: 0,
  });
  /** Day-of-month -> platform, for the days this session assigns. */
  const [assigned, setAssigned] = useState<Record<number, PlatformKey>>({});
  const [sheetOpen, setSheetOpen] = useState(true);

  /* ------------------------------ month layout ---------------------------- */
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstSlot = (new Date(year, month, 1).getDay() + 6) % 7; // Monday-first
  const rowCount = Math.ceil((firstSlot + daysInMonth) / 7);

  /**
   * A six-row month would run past the card, so rows only keep the design's
   * exact tops while five of them fit; beyond that the step compresses to land
   * the last row on the same 557.5 baseline.
   */
  const cells = useMemo(() => {
    const rowTop = (row: number) =>
      rowCount <= ROW_Y.length ? ROW_Y[row] : ROW_Y[0] + (row * ROW_SPAN) / (rowCount - 1);
    return Array.from({ length: daysInMonth }, (_unused, i) => {
      const slot = firstSlot + i;
      const col = slot % 7;
      return {
        day: i + 1,
        x: COL_X[col],
        y: rowTop(Math.floor(slot / 7)),
        weekend: col >= 5,
      };
    });
  }, [daysInMonth, firstSlot, rowCount]);

  /* ------------------------------- live marks ----------------------------- */
  const platformById = useMemo(() => {
    const m = new Map<string, PlatformKey>();
    for (const c of creators) m.set(c.id, byPlatform(c.platform));
    return m;
  }, [creators]);

  /** Scheduled content already sitting in the month being shown. */
  const monthEntries = useMemo(() => {
    const prefix = `${year}-${pad(month + 1)}-`;
    return calendar.filter((c) => c.scheduledAt.slice(0, 10).startsWith(prefix));
  }, [calendar, year, month]);

  const marks = useMemo(() => {
    const m = new Map<number, Mark>();
    for (const e of monthEntries) {
      m.set(Number(e.scheduledAt.slice(8, 10)), {
        platform: platformById.get(e.creatorId) ?? "instagram",
        chip: e.title.includes("Reel") ? "Reel" : null,
      });
    }
    for (const [day, key] of Object.entries(assigned)) {
      m.set(Number(day), { platform: key, chip: "Collab" });
    }
    return m;
  }, [monthEntries, platformById, assigned]);

  /* -------------------------------- actions ------------------------------- */
  const defaultPlatform: PlatformKey =
    PLATFORMS.find((p) => counts[p.key] > 0)?.key ?? "instagram";

  const bump = (key: PlatformKey, delta: number) =>
    setCounts((prev) => ({ ...prev, [key]: Math.max(0, prev[key] + delta) }));

  /** The round "+" adds one collab day across every platform at once. */
  const bumpAll = () =>
    setCounts((prev) => ({
      instagram: prev.instagram + 1, youtube: prev.youtube + 1,
      linkedin: prev.linkedin + 1, x: prev.x + 1,
    }));

  const toggleDay = (day: number) =>
    setAssigned((prev) => {
      const next = { ...prev };
      if (next[day]) delete next[day];
      else next[day] = defaultPlatform;
      return next;
    });

  /** Scatter each platform's requested count over the free days of the month. */
  const selectRandomly = () => {
    const taken = new Set(monthEntries.map((e) => Number(e.scheduledAt.slice(8, 10))));
    const next: Record<number, PlatformKey> = {};
    for (const p of PLATFORMS) {
      let left = Math.min(counts[p.key], daysInMonth - taken.size);
      let guard = 0;
      while (left > 0 && guard++ < 500) {
        const d = 1 + Math.floor(Math.random() * daysInMonth);
        if (taken.has(d)) continue;
        taken.add(d);
        next[d] = p.key;
        left -= 1;
      }
    }
    setAssigned(next);
    setSheetOpen(false);
  };

  const save = () => {
    const creatorId = creators[0]?.id;
    if (creatorId) {
      for (const [day, key] of Object.entries(assigned)) {
        const p = PLATFORMS.find((q) => q.key === key);
        create.mutate({
          creatorId,
          title: `Collab — ${p ? p.name : ""}`,
          scheduledAt: new Date(Date.UTC(year, month, Number(day))).toISOString(),
        });
      }
    }
    router.back();
  };

  const shiftMonth = () => {
    const next = new Date(year, month + 1, 1);
    setYear(next.getFullYear());
    setMonth(next.getMonth());
    setAssigned({});
  };

  return (
    <Screen height={FRAME_H} background="#F7F0E4" scroll>
      <Backdrop />

      {/* -------------------------------- Header ----------------------------- */}
      <Pressable
        onPress={() => router.back()}
        style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
      >
        <Feather name="arrow-left" size={18} color={TITLE_INK} />
      </Pressable>
      <Txt
        x={62} y={52} w={205} size={20} weight="semibold" font="outfit"
        color={TITLE_INK} lineHeight={37}
      >
        Select your collab days
      </Txt>

      {/* ----------------------------- Calendar card ------------------------- */}
      <Abs
        x={CARD_OUTER.x} y={CARD_OUTER.y} w={CARD_OUTER.w} h={CARD_OUTER.h}
        radius={12} bg="rgba(255,255,255,0.35)"
      />
      <Abs
        x={CARD_INNER.x} y={CARD_INNER.y} w={CARD_INNER.w} h={CARD_INNER.h}
        radius={12} bg={GLASS_65} border={GLASS_90} borderWidth={1}
        style={styles.cardShadow}
      />

      {/* Year stepper — "ep:arrow-up-bold" + the year, at 28,138. */}
      <Pressable
        onPress={() => setYear((y) => y + 1)}
        style={({ pressed }) => [styles.yearButton, pressed && styles.pressed]}
      />
      <Abs x={28} y={142.5} w={16} h={16} center>
        <Feather name="chevron-up" size={14} color={INK} />
      </Abs>
      <Txt
        x={48} y={138} w={42} size={16} weight="medium" font="inter"
        color={INK} lineHeight={25} letterSpacing={0.38} align="center"
      >
        {`${year}`}
      </Txt>

      {/* Month title */}
      <Pressable
        onPress={shiftMonth}
        style={({ pressed }) => [styles.monthButton, pressed && styles.pressed]}
      />
      <Txt
        x={164} y={138} w={49} size={20} weight="semibold" font="inter"
        color={INK} lineHeight={25} letterSpacing={0.38} align="center"
        numberOfLines={1}
      >
        {MONTHS[month]}
      </Txt>

      {/* Weekday header */}
      {WEEKDAYS.map((d) => (
        <Txt
          key={d.label}
          x={d.x} y={185} w={d.w} size={12} weight="medium" font="inter"
          color={WEEKDAY_INK} lineHeight={16}
        >
          {d.label}
        </Txt>
      ))}

      {/* ------------------------------- Day grid ---------------------------- */}
      {cells.map((cell) => {
        const mark = marks.get(cell.day);
        const platform = mark ? PLATFORMS.find((p) => p.key === mark.platform) : undefined;
        return (
          <Pressable
            key={cell.day}
            onPress={() => toggleDay(cell.day)}
            style={({ pressed }) => [
              styles.cell,
              { left: cell.x, top: cell.y },
              pressed && styles.pressed,
            ]}
          >
            {mark && mark.chip ? (
              <Abs x={0} y={0} w={CELL_W} h={CELL_H} radius={4} bg={GLASS_75} />
            ) : null}

            <Txt
              x={0} y={DAY_TEXT_DY} w={CELL_W} size={18} weight="regular" font="inter"
              color={cell.weekend ? DAY_MUTED : INK} lineHeight={22}
              letterSpacing={-0.41} align="center"
            >
              {cell.day}
            </Txt>

            {mark && platform && mark.chip ? (
              <>
                <Abs x={ICON_DX} y={ICON_DY} w={12} h={12} center>
                  <Feather name={platform.icon} size={12} color={platform.color} />
                </Abs>
                <Abs
                  x={CHIP_DX} y={CHIP_DY} w={CHIP_W} h={CHIP_H}
                  radius={4} bg={platform.color}
                />
                <Txt
                  x={CHIP_DX + 3.5} y={CHIP_DY + 1.5} w={33} size={10}
                  weight="semibold" font="inter" color="#ffffff"
                  lineHeight={11} align="center"
                >
                  {mark.chip}
                </Txt>
              </>
            ) : null}

            {mark && platform && !mark.chip ? (
              <Abs
                x={DOT_DX} y={DOT_DY} w={DOT_SIZE} h={DOT_SIZE}
                radius={DOT_SIZE / 2} bg={platform.color}
              />
            ) : null}
          </Pressable>
        );
      })}

      {/* Empty state keeps the grid geometry — only the marks are missing. */}
      {isLoading ? (
        <Txt
          x={17} y={645} w={343} size={12} weight="medium" font="inter"
          color={WEEKDAY_INK} lineHeight={16} align="center"
        >
          Loading your calendar…
        </Txt>
      ) : null}

      {/* ---------------------------- Bottom actions ------------------------- */}
      <Pressable
        onPress={selectRandomly}
        style={({ pressed }) => [styles.randomButton, pressed && styles.pressed]}
      >
        <Abs x={114 - 27} y={716 - 700} w={20} h={20} center>
          <MaterialCommunityIcons name="dice-multiple" size={20} color="#ffffff" />
        </Abs>
        <Txt
          x={146 - 27} y={717 - 700} w={114} size={15} weight="semibold" font="outfit"
          color={BUTTON_INK} lineHeight={18.9} align="center"
        >
          Select Randomly
        </Txt>
      </Pressable>

      <Pressable
        onPress={save}
        style={({ pressed }) => [styles.saveButton, pressed && styles.pressed]}
      >
        <Txt
          x={102 - 27} y={779 - 763} w={170} size={15} weight="semibold" font="outfit"
          color={BUTTON_INK} lineHeight={18.9} align="center"
        >
          Save
        </Txt>
      </Pressable>

      {/* ------------------------------- Sheet ------------------------------- */}
      {sheetOpen ? (
        <>
          <Pressable onPress={() => setSheetOpen(false)} style={styles.scrim} />

          <Abs x={17} y={271} w={341} h={404} radius={16} bg={SHEET_FILL} style={styles.sheetShadow} />
          <Abs x={18} y={273} w={339} h={402} radius={15} bg="#ffffff" opacity={0.02} />

          <Txt
            x={33} y={298} w={181} size={15} weight="semibold" font="outfit"
            color={HEADING_INK} lineHeight={24}
          >
            Setup your collab days
          </Txt>

          {/* "Add" pill — applies the counts and drops back to the grid. */}
          <Pressable
            onPress={() => setSheetOpen(false)}
            style={({ pressed }) => [styles.addPill, pressed && styles.pressed]}
          >
            <Txt
              x={257 - 249} y={301 - 295} w={22} size={12} weight="regular" font="outfit"
              color={INK} lineHeight={16}
            >
              Add
            </Txt>
            <Abs x={282 - 249} y={301 - 295} w={16} h={16} center>
              <Feather name="arrow-up" size={13} color={INK} />
            </Abs>
          </Pressable>

          <Pressable
            onPress={bumpAll}
            style={({ pressed }) => [styles.plusButton, pressed && styles.pressed]}
          >
            <Feather name="plus" size={17} color="rgba(0,0,0,0.7)" />
          </Pressable>

          {/* Info card */}
          <Abs x={33} y={340} w={316} h={92} radius={16} bg="#ffffff" />
          <Abs x={46} y={354} w={15} h={15} center>
            <Feather name="info" size={14} color="#121313" />
          </Abs>
          <Txt
            x={68} y={354} w={274} size={12} weight="regular" font="inter"
            color={INFO_INK} lineHeight={24}
          >
            This day sets your official content deadline. Delays may impact your partnership with
            the brand.
          </Txt>

          <Txt
            x={33} y={449} w={303} size={13.6} weight="medium" font="inter"
            color={QUESTION_INK} lineHeight={24}
          >
            How many collab days you want per month?
          </Txt>

          {/* Per-platform steppers */}
          {PLATFORMS.map((p) => (
            <Abs
              key={p.key}
              x={FIELD_X} y={p.rowY} w={FIELD_W} h={FIELD_H} radius={8} bg="#ffffff"
            >
              <Txt
                x={LABEL_X - FIELD_X} y={p.textY - p.rowY} w={LABEL_W} size={13}
                weight="regular" font="inter" color={FIELD_INK} lineHeight={24}
              >
                {p.label}
              </Txt>
              <Pressable
                onPress={() => bump(p.key, -1)}
                style={({ pressed }) => [
                  styles.control,
                  { left: MINUS_X - FIELD_X, top: p.textY - p.rowY + 4 },
                  pressed && styles.pressed,
                ]}
              >
                <Feather name="minus" size={14} color={FIELD_INK} />
              </Pressable>
              <Txt
                x={VALUE_X - FIELD_X} y={p.textY - p.rowY} w={VALUE_W} size={13}
                weight="medium" font="inter" color={QUESTION_INK} lineHeight={24}
                align="center"
              >
                {counts[p.key]}
              </Txt>
              <Pressable
                onPress={() => bump(p.key, 1)}
                style={({ pressed }) => [
                  styles.control,
                  { left: PLUS_X - FIELD_X, top: p.textY - p.rowY + 4 },
                  pressed && styles.pressed,
                ]}
              >
                <Feather name="plus" size={14} color={FIELD_INK} />
              </Pressable>
            </Abs>
          ))}
        </>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  backdrop: { position: "absolute", left: 0, top: 0 },
  pressed: { opacity: 0.85 },

  /* Header — "Ellipse 1391" 36x36 at 16,52. */
  backButton: {
    position: "absolute",
    left: 16,
    top: 52,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.7)",
    borderWidth: 1,
    borderColor: GLASS_90,
  },

  cardShadow: {
    shadowColor: "#000000",
    shadowOpacity: 0.031,
    shadowRadius: 32,
    shadowOffset: { width: 0, height: 12 },
    elevation: 2,
  },

  /* Month stepper hit areas — "Frame 1171275429" and "Frame 92". */
  yearButton: { position: "absolute", left: 28, top: 138, width: 64, height: 25 },
  monthButton: { position: "absolute", left: 164, top: 138, width: 49, height: 25 },

  /* Day cell — "Calendar/Normal/Day" 49x80. */
  cell: { position: "absolute", width: CELL_W, height: CELL_H },

  /* "Frame 14536" 320x52 r16 at 27,700. */
  randomButton: {
    position: "absolute",
    left: 27,
    top: 700,
    width: 320,
    height: 52,
    borderRadius: 16,
    backgroundColor: RANDOM_FILL,
    shadowColor: ACCENT,
    shadowOpacity: 0.18,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  /* "Frame 14537" 320x51 r16 at 27,763. */
  saveButton: {
    position: "absolute",
    left: 27,
    top: 763,
    width: 320,
    height: 51,
    borderRadius: 16,
    backgroundColor: "#ffffff",
    shadowColor: "#000000",
    shadowOpacity: 0.06,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },

  /* "Frame 1171275378" 375x946 scrim. */
  scrim: {
    position: "absolute",
    left: 0,
    top: 0,
    width: FRAME_W,
    height: FRAME_H,
    backgroundColor: SCRIM,
  },
  sheetShadow: {
    shadowColor: "#1e1432",
    shadowOpacity: 0.12,
    shadowRadius: 40,
    shadowOffset: { width: 0, height: 16 },
    elevation: 8,
  },

  /* "Frame 14546" 56x28 r24 at 249,295. */
  addPill: {
    position: "absolute",
    left: 249,
    top: 295,
    width: 56,
    height: 28,
    borderRadius: 24,
    backgroundColor: ADD_FILL,
  },
  /* "Button" 30x30 r9999 at 310,294. */
  plusButton: {
    position: "absolute",
    left: 310,
    top: 294,
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff",
  },

  /* Stepper controls on the right edge of each 316.5x38 input row. */
  control: {
    position: "absolute",
    width: CONTROL,
    height: CONTROL,
    alignItems: "center",
    justifyContent: "center",
  },
});
