import { Fragment, useMemo, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
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
import { useCalendar, useCreators, useMe, useUpdate, type Creator } from "../../../src/api/hooks";

/**
 * Delivery Timeline — Figma 7358:22922 "content delivery" (375x875).
 *
 * The collab-days review screen with the final planner sheet open over a 57%
 * scrim: "Delivery Timeline", the "You will deliver content in?" picker
 * (default 2 Days), the blue deadline advisory and the Add CTA.
 *
 * The layer underneath is the month grid the previous step leaves behind, so it
 * keeps rendering the creator's real collab days. Coordinates are raw frame
 * coordinates; <Screen> scales the 375pt canvas.
 */

/* ------------------------------- geometry -------------------------------- */
const FRAME_W = 375;
const FRAME_H = 875;

/** Calendar card — "Overlay+Border+Shadow+OverlayBlur" 20,210 335x372.59. */
const CARD_X = 20;
const CARD_Y = 210;
const CARD_W = 335;
const CARD_H = 372.59;

/** Weekday header tracks — 41.857 apart, labels centred in each track. */
const WEEK_Y = 295;
const TRACK_X = [41, 82.86, 124.71, 166.57, 208.43, 250.29, 292.14];
const TRACK_W = 41.86;

/** Day grid — seven 36.71 cells stepping 42.714 across, 48.72 down. */
const COL_X = [41, 83.71, 126.43, 169.14, 211.86, 254.57, 297.29];
const ROW_Y0 = 326;
const ROW_STEP = 48.72;
const CELL = 36.71;
/** 520.88 (last row) - 326 (first row): the travel a five-row month uses. */
const GRID_SPAN = 194.88;

/** Platform badge offsets from the marked cell's top-left. */
const BADGE_DX = -7;
const BADGE_DY = -7;
const ACTION_DX = 21.71;
const ACTION_DY = 21.72;

/** The sheet — "Frame" 0,467 375x409, top corners 32. */
const SHEET_Y = 467;
const SHEET_H = 409;

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/* --------------------------- spec colour tokens --------------------------- */
const INK = "#1c1c1e";
const HEADER_INK = "#1d1d1f";
const WEEKDAY_INK = "#6b6b70";
const WHITE = "#ffffff";
const DARK = "#312b28";
const GLASS_65 = "rgba(255,255,255,0.65)";
const GLASS_90 = "rgba(255,255,255,0.9)";
const CARD_BG = "rgba(255,255,255,0.55)";
const CARD_BORDER = "rgba(0,0,0,0.1)";
const NAV_BG = "rgba(255,255,255,0.6)";
const TIP_BG = "rgba(230,242,255,0.65)";
const TIP_BORDER = "rgba(58,130,246,0.2)";
const TIP_INK = "#1e3a8a";
const BLUE = "#3a82f6";
const SCRIM = "rgba(181,180,185,0.57)";
const SHEET_TITLE_INK = "#111111";
const CLOSE_BG = "#f8f8f8";
const CLOSE_INK = "#555555";
const HANDLE = "#e5e5e5";
const LABEL_INK = "#6b7280";
const FIELD_INK = "#111827";
const FIELD_BG = "rgba(255,255,255,0.8)";
const FIELD_BORDER = "#e5e5e5";

/* --------------------------- marked collab days --------------------------- */
interface MarkStyle {
  tint: string;
  stroke: string;
  shadow: string;
  icon: "youtube" | "instagram" | "linkedin";
  iconColor: string;
}

/** The three marked cells the design ships, in order. */
const MARK_STYLES: MarkStyle[] = [
  {
    tint: "rgba(252,61,61,0.12)",
    stroke: "#fc3d3d",
    shadow: "rgba(99,161,222,0.2)",
    icon: "youtube",
    iconColor: "#ff0000",
  },
  {
    tint: "rgba(255,143,188,0.12)",
    stroke: "#ff8fbc",
    shadow: "rgba(255,143,188,0.2)",
    icon: "instagram",
    iconColor: "#e1306c",
  },
  {
    tint: "rgba(99,161,222,0.12)",
    stroke: "#63a1de",
    shadow: "rgba(99,161,222,0.2)",
    icon: "linkedin",
    iconColor: "#0a66c2",
  },
];

/* ------------------------- the month the design ships --------------------- */
const SPEC_YEAR = 2026;
const SPEC_MONTH = 5; // June

/** The picker opens on the design's default and walks a one-week range. */
const SPEC_DELIVERY_DAYS = 2;
const MAX_DELIVERY_DAYS = 7;

const pad = (n: number) => String(n).padStart(2, "0");

/* -------------------------------- backdrop -------------------------------- */
/** The frame fill: a warm vertical base plus four soft radial glows. */
function Backdrop() {
  return (
    <Svg width={FRAME_W} height={FRAME_H} style={styles.backdrop}>
      <Defs>
        <SvgLinear id="cd-base" x1="187.5" y1="0" x2="187.5" y2={FRAME_H} gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#F7F0E4" />
          <Stop offset="1" stopColor="#F4EBDD" />
        </SvgLinear>
        <RadialGradient id="cd-pink" cx="285" cy="542.5" rx="1027.5" ry="568.75" gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#F7B7DA" stopOpacity="0.34" />
          <Stop offset="0.26" stopColor="#F7B7DA" stopOpacity="0" />
        </RadialGradient>
        <RadialGradient id="cd-blue" cx="90" cy="367.5" rx="967.5" ry="533.75" gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#BACDF4" stopOpacity="0.36" />
          <Stop offset="0.24" stopColor="#BACDF4" stopOpacity="0" />
        </RadialGradient>
        <RadialGradient id="cd-gold" cx="292.5" cy="157.5" rx="1338.75" ry="735" gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#F6D64A" stopOpacity="0.22" />
          <Stop offset="0.2" stopColor="#F6D64A" stopOpacity="0" />
        </RadialGradient>
        <RadialGradient id="cd-haze" cx="75" cy="87.5" rx="1466.25" ry="805" gradientUnits="userSpaceOnUse">
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

/* --------------------------------- pieces --------------------------------- */
/** The blue advisory card the tip and the deadline warning share. */
function Advisory({
  y, h, textW, textH, children,
}: { y: number; h: number; textW: number; textH: number; children: string }) {
  return (
    <>
      <Abs x={20} y={y} w={335} h={h} radius={16} bg={TIP_BG} border={TIP_BORDER} borderWidth={1} style={styles.tipShadow} />
      <Abs x={37} y={y + 17} w={24} h={24} radius={12} bg={BLUE} center>
        <Feather name="info" size={14} color={WHITE} />
      </Abs>
      <Txt
        x={73}
        y={y + 15}
        w={textW}
        size={13}
        weight="medium"
        font="inter"
        color={TIP_INK}
        lineHeight={18.2}
        style={{ height: textH }}
      >
        {children}
      </Txt>
    </>
  );
}

interface Cell {
  day: number;
  x: number;
  y: number;
}

/* --------------------------------- screen --------------------------------- */
export default function ContentDeliveryTimeline() {
  const router = useRouter();

  const { data: calendar = [] } = useCalendar();
  const { data: creators = [] } = useCreators();
  const { data: me } = useMe();
  const save = useUpdate<Creator & { contentDeliveryDays: number }>("creators");

  const creator = creators.find((c) => c.name === me?.name) ?? creators[0];

  /** The month the review step leaves on screen; the chevrons still walk it. */
  const [year, setYear] = useState(SPEC_YEAR);
  const [month, setMonth] = useState(SPEC_MONTH);

  /** The sheet's only field — the offset written back as the content deadline. */
  const [deliveryDays, setDeliveryDays] = useState(SPEC_DELIVERY_DAYS);

  /**
   * The month laid out on the seven weekday tracks. A five-row month lands
   * every cell on the design's exact coordinates; a six-row month compresses
   * the step so the grid still ends on the card's inner edge.
   */
  const cells = useMemo<Cell[]>(() => {
    const first = new Date(year, month, 1).getDay();
    const count = new Date(year, month + 1, 0).getDate();
    const rows = Math.ceil((first + count) / 7);
    const step = Math.min(ROW_STEP, GRID_SPAN / Math.max(rows - 1, 1));
    return Array.from({ length: count }, (_unused, i) => {
      const slot = first + i;
      return { day: i + 1, x: COL_X[slot % 7], y: ROW_Y0 + Math.floor(slot / 7) * step };
    });
  }, [year, month]);

  /**
   * Collab days already booked in the shown month. The design marks three
   * cells, so the first three carry the three badge styles it ships; an empty
   * calendar simply leaves the grid unmarked and moves no geometry.
   */
  const marks = useMemo(() => {
    const prefix = `${year}-${pad(month + 1)}-`;
    const days = calendar
      .filter((c) => c.scheduledAt.startsWith(prefix))
      .map((c) => Number(c.scheduledAt.slice(8, 10)))
      .filter((d) => d > 0);
    const ordered = Array.from(new Set(days)).sort((a, b) => a - b);
    return new Map(ordered.slice(0, MARK_STYLES.length).map((d, i) => [d, MARK_STYLES[i]]));
  }, [calendar, year, month]);

  const shiftMonth = (delta: number) => {
    const next = new Date(year, month + delta, 1);
    setYear(next.getFullYear());
    setMonth(next.getMonth());
  };

  /** Commit the offset as the creator's official content deadline. */
  const add = () => {
    if (creator) save.mutate({ id: creator.id, data: { contentDeliveryDays: deliveryDays } });
    router.back();
  };

  return (
    <Screen height={FRAME_H} background="#F7F0E4" scroll>
      <Backdrop />

      {/* ------------------------------ Header ------------------------------ */}
      <Pressable
        onPress={() => router.back()}
        style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
      >
        <Feather name="arrow-left" size={20} color={INK} />
      </Pressable>
      <Txt
        x={105.5}
        y={30}
        w={190}
        size={16}
        weight="bold"
        font="inter"
        color={HEADER_INK}
        lineHeight={19.36}
        align="center"
      >
        Select your collab days
      </Txt>

      {/* ------------------------------- Tip -------------------------------- */}
      <Advisory y={114} h={67} textW={235.56} textH={37}>
        {"This day will be preselected in your\ncalendar as your preferred collab day."}
      </Advisory>

      {/* -------------------------- Calendar card --------------------------- */}
      <Abs
        x={CARD_X}
        y={CARD_Y}
        w={CARD_W}
        h={CARD_H}
        radius={24}
        bg={CARD_BG}
        border={CARD_BORDER}
        borderWidth={1}
        style={styles.cardShadow}
      />

      <Pressable
        onPress={() => shiftMonth(-1)}
        style={({ pressed }) => [styles.navButton, { left: 41 }, pressed && styles.pressed]}
      >
        <Feather name="chevron-left" size={18} color={INK} />
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
        numberOfLines={1}
      >
        {`${MONTHS[month]} ${year}`}
      </Txt>
      <Pressable
        onPress={() => shiftMonth(1)}
        style={({ pressed }) => [styles.navButton, { left: 297.98 }, pressed && styles.pressed]}
      >
        <Feather name="chevron-right" size={18} color={INK} />
      </Pressable>

      {WEEKDAYS.map((label, i) => (
        <Txt
          key={`${label}-${i}`}
          x={TRACK_X[i]}
          y={WEEK_Y}
          w={TRACK_W}
          size={12}
          weight="semibold"
          font="inter"
          color={WEEKDAY_INK}
          lineHeight={14.52}
          align="center"
        >
          {label}
        </Txt>
      ))}

      {cells.map((cell) => {
        const mark = marks.get(cell.day);
        return (
          <Fragment key={cell.day}>
            <Abs
              x={cell.x}
              y={cell.y}
              w={CELL}
              h={CELL}
              radius={12}
              bg={mark?.tint}
              border={mark?.stroke}
              borderWidth={mark ? 1 : undefined}
              center
              style={mark ? [styles.markShadow, { shadowColor: mark.shadow }] : undefined}
            >
              <Txt
                size={15}
                weight={mark ? "semibold" : "medium"}
                font="inter"
                color={INK}
                lineHeight={18.15}
                align="center"
              >
                {cell.day}
              </Txt>
            </Abs>

            {mark ? (
              <Fragment>
                <View style={[styles.platformBadge, { left: cell.x + BADGE_DX, top: cell.y + BADGE_DY }]}>
                  {mark.icon === "youtube" ? (
                    <MaterialCommunityIcons name="youtube" size={12} color={mark.iconColor} />
                  ) : mark.icon === "instagram" ? (
                    <Feather name="instagram" size={12} color={mark.iconColor} />
                  ) : (
                    <MaterialCommunityIcons name="linkedin" size={12} color={mark.iconColor} />
                  )}
                </View>
                <View style={[styles.actionBadge, { left: cell.x + ACTION_DX, top: cell.y + ACTION_DY }]}>
                  <Feather name="plus" size={12} color={WHITE} />
                </View>
              </Fragment>
            ) : null}
          </Fragment>
        );
      })}

      {/* ------------------------------- Save ------------------------------- */}
      <Abs x={237} y={689} w={118} h={56} radius={28} bg={DARK} />
      <Txt
        x={261}
        y={707.5}
        w={38}
        size={16}
        weight="semibold"
        font="inter"
        color={WHITE}
        lineHeight={19.36}
        align="center"
      >
        Save
      </Txt>
      <Abs x={311} y={707} w={20} h={20} center>
        <Feather name="arrow-right" size={20} color={WHITE} />
      </Abs>

      {/* ------------------------------- Scrim ------------------------------ */}
      <Pressable onPress={() => router.back()} style={styles.scrim} />

      {/* -------------------------- Delivery Timeline ----------------------- */}
      {/* Absorbs taps so only the exposed scrim dismisses. */}
      <View style={styles.sheet} onStartShouldSetResponder={() => true} />
      <Abs x={167.5} y={483} w={40} h={4} radius={2} bg={HANDLE} />
      <Txt
        x={24}
        y={511}
        w={280}
        size={24}
        weight="semibold"
        font="inter"
        color={SHEET_TITLE_INK}
        lineHeight={29.05}
        letterSpacing={-0.52}
      >
        Delivery Timeline
      </Txt>
      <Pressable
        onPress={() => router.back()}
        style={({ pressed }) => [styles.close, pressed && styles.pressed]}
      >
        <Feather name="x" size={20} color={CLOSE_INK} />
      </Pressable>

      <Advisory y={571} h={85} textW={266} textH={55}>
        This deadline will be treated as your official content deadline. Delays may impact your
        partnership with the brand.
      </Advisory>

      <Txt
        x={28}
        y={680}
        w={323}
        size={14}
        weight="medium"
        font="inter"
        color={LABEL_INK}
        lineHeight={16.94}
      >
        You will deliver content in?
      </Txt>
      <Pressable
        onPress={() => setDeliveryDays((d) => (d >= MAX_DELIVERY_DAYS ? 1 : d + 1))}
        style={({ pressed }) => [styles.field, pressed && styles.pressed]}
      >
        <Txt
          x={21}
          y={17}
          w={268}
          size={15}
          weight="medium"
          font="inter"
          color={FIELD_INK}
          lineHeight={18.15}
        >
          {`${deliveryDays} ${deliveryDays === 1 ? "Day" : "Days"}`}
        </Txt>
        <Abs x={289} y={16} w={20} h={20} center>
          <Feather name="chevron-down" size={20} color={LABEL_INK} />
        </Abs>
      </Pressable>

      <Pressable onPress={add} style={({ pressed }) => [styles.addButton, pressed && styles.pressed]}>
        <Txt size={16} weight="bold" font="inter" color={WHITE} lineHeight={19.36} align="center">
          Add
        </Txt>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  backdrop: { position: "absolute", left: 0, top: 0 },
  pressed: { opacity: 0.9 },

  /* Header — 44x44 glass disc at 15,18. */
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
    borderColor: GLASS_90,
    shadowColor: "#000000",
    shadowOpacity: 0.031,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },

  /* Advisory card — 1pt blue border, soft blue drop shadow. */
  tipShadow: {
    shadowColor: "#3a82f6",
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 1,
  },

  /* Calendar card — 335x372.59 glass panel. */
  cardShadow: {
    shadowColor: "#000000",
    shadowOpacity: 0.039,
    shadowRadius: 32,
    shadowOffset: { width: 0, height: 12 },
    elevation: 2,
  },
  navButton: {
    position: "absolute",
    top: 235,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: NAV_BG,
    borderWidth: 1,
    borderColor: CARD_BORDER,
  },

  /* Marked collab day — tinted cell, 22pt platform disc, 20pt action disc. */
  markShadow: {
    shadowOpacity: 1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  platformBadge: {
    position: "absolute",
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: WHITE,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.06)",
    shadowColor: "#000000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  actionBadge: {
    position: "absolute",
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: INK,
    borderWidth: 2,
    borderColor: WHITE,
    shadowColor: "#000000",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },

  /* Sheet — 375x409 at y=467, top corners 32. */
  scrim: {
    position: "absolute",
    left: 0,
    top: 0,
    width: FRAME_W,
    height: 876,
    backgroundColor: SCRIM,
  },
  sheet: {
    position: "absolute",
    left: 0,
    top: SHEET_Y,
    width: FRAME_W,
    height: SHEET_H,
    backgroundColor: WHITE,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    shadowColor: "#000000",
    shadowOpacity: 0.08,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: -8 },
    elevation: 12,
  },
  close: {
    position: "absolute",
    left: 315,
    top: 511,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: CLOSE_BG,
  },

  /* Picker — 327x52 field at 24,705. */
  field: {
    position: "absolute",
    left: 24,
    top: 705,
    width: 327,
    height: 52,
    borderRadius: 20,
    backgroundColor: FIELD_BG,
    borderWidth: 1,
    borderColor: FIELD_BORDER,
    shadowColor: "#000000",
    shadowOpacity: 0.02,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 1,
  },

  /* Add — 301x55 pill at 37,793. */
  addButton: {
    position: "absolute",
    left: 37,
    top: 793,
    width: 301,
    height: 55,
    borderRadius: 100,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: DARK,
  },
});
