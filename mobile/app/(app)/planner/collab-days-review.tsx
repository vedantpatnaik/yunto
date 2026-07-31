import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { Pressable, StyleSheet } from "react-native";
import type { ViewStyle } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Feather, FontAwesome, MaterialCommunityIcons } from "@expo/vector-icons";
import Svg, {
  Defs,
  LinearGradient as SvgLinear,
  RadialGradient,
  Rect,
  Stop,
} from "react-native-svg";
import { Abs, Screen, Txt } from "../../../src/ui/Frame";
import { useCalendar, useCreators, useMe, useUpdate } from "../../../src/api/hooks";
import type { Creator } from "../../../src/api/hooks";

/**
 * Review collab days & save — Figma frame 7358:22590 "save" (375x875), traced 1:1.
 *
 * The closing state of the collab-day wizard: the platform sheet is gone, the
 * chosen days sit on the month grid as tinted pills carrying a platform badge
 * and a dark plus badge that takes the day back off, and a single dark "Save"
 * button commits the
 * schedule. Coordinates are raw frame coordinates; <Screen> scales the 375pt
 * canvas.
 *
 * Figma's BACKGROUND_BLUR has no React Native equivalent, so the two glass
 * surfaces (info banner, calendar card) keep their translucent fills without
 * the backdrop blur. The design's empty 64x64 "Floating CTA" frame carries no
 * fill or children and renders nothing. Every other value — geometry, colour,
 * radius, size, weight, line-height — is verbatim.
 */

/* ------------------------------- geometry -------------------------------- */
const FRAME_W = 375;
const FRAME_H = 875;

/** Info banner: "Overlay+Border+Shadow+OverlayBlur" 20,114 335x67. */
const BANNER_X = 20;
const BANNER_Y = 114;
const BANNER_W = 335;
const BANNER_H = 67;

/** Calendar card: "Overlay+Border+Shadow+OverlayBlur" 20,210 335x372.59. */
const CARD_X = 20;
const CARD_Y = 210;
const CARD_W = 335;
const CARD_H = 372.59;

/** Month stepper row: "Container" 41,235 293x36. */
const NAV_Y = 235;
const NAV_W = 293;

/** Weekday tracks: "Container" 41,287 293x23, seven 41.86 columns. */
const WEEK_Y = 295;
const WEEK_X = [41, 82.86, 124.71, 166.57, 208.43, 250.29, 292.14];
const TRACK_W = 41.86;

/** Day grid: "Container" 41,326 293x231.59. */
const COL_X = [41, 83.71, 126.43, 169.14, 211.86, 254.57, 297.29];
const ROW_Y0 = 326;
const ROW_STEP = 48.72;
/** 557.59 (grid bottom) - 36.71 (cell) - 326 (first row) = 194.88 of travel. */
const GRID_SPAN = 194.88;
const CELL = 36.71;

/** Badges hang off the pill: platform at (-7,-7), remove at (+21.71,+21.72). */
const PLATFORM_BADGE = 22;
const PLATFORM_OFFSET = -7;
const REMOVE_BADGE = 20;
const REMOVE_DX = 21.71;
const REMOVE_DY = 21.72;

/* --------------------------- spec colour tokens --------------------------- */
const INK = "#1c1c1e";
const TITLE_INK = "#1d1d1f";
const WEEKDAY_INK = "#6b6b70";
const BANNER_FILL = "rgba(230,242,255,0.65)";
const BANNER_BORDER = "rgba(58,130,246,0.2)";
const BANNER_ICON_BG = "#3a82f6";
const BANNER_INK = "#1e3a8a";
const CARD_FILL = "rgba(255,255,255,0.55)";
const CARD_BORDER = "rgba(0,0,0,0.1)";
const GLASS_60 = "rgba(255,255,255,0.6)";
const GLASS_65 = "rgba(255,255,255,0.65)";
const GLASS_BORDER = "rgba(255,255,255,0.9)";
const BADGE_BORDER = "rgba(0,0,0,0.06)";
const SAVE_FILL = "#312b28";

/* ----------------------------- platform pills ----------------------------- */
interface PlatformStyle {
  /** Pill fill is the tint at 12%; stroke and shadow use the tint itself. */
  tint: string;
  fill: string;
  /** The mark the white badge carries, matched to the design's logo art. */
  badge: ReactNode;
}

/**
 * The three platforms the design puts on the grid. The design draws YouTube and
 * LinkedIn as solid brand marks (a filled red play plate, a filled blue "in"
 * square) and Instagram as an outlined camera, so each badge uses the icon set
 * that carries that exact shape at the design's colours.
 */
const PLATFORMS: Record<string, PlatformStyle> = {
  youtube: {
    tint: "#fc3d3d",
    fill: "rgba(252,61,61,0.12)",
    badge: <MaterialCommunityIcons name="youtube" size={14} color="#ff0000" />,
  },
  instagram: {
    tint: "#ff8fbc",
    fill: "rgba(255,143,188,0.12)",
    badge: <Feather name="instagram" size={12} color="#e1306c" />,
  },
  linkedin: {
    tint: "#63a1de",
    fill: "rgba(99,161,222,0.12)",
    badge: <FontAwesome name="linkedin-square" size={14} color="#0a66c2" />,
  },
};

/** Platform enum values outside the design's three fall back to Instagram. */
const platformStyle = (key: string): PlatformStyle =>
  PLATFORMS[key] ?? PLATFORMS.instagram;

/* ------------------------- the month the design ships --------------------- */
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];

const SPEC_YEAR = 2026;
const SPEC_MONTH = 5; // June — the stepper reads "June 2026".
/**
 * The design's grid opens on a Sunday (the first cell is named "June 2025
 * starts on a Sunday"), which is what puts days 5, 15 and 18 on their traced
 * cells. The traced month keeps that origin; any month stepped to falls back to
 * its real first weekday.
 */
const SPEC_FIRST_SLOT = 0;
const SPEC_PICKS: [number, string][] = [
  [5, "youtube"],
  [15, "instagram"],
  [18, "linkedin"],
];

const pad = (n: number) => String(n).padStart(2, "0");
/** "2026-06-05" — the key the picker and CalendarContent.scheduledAt share. */
const dayKey = (y: number, m: number, d: number) => `${y}-${pad(m + 1)}-${pad(d)}`;

/* -------------------------------- shadows --------------------------------- */
/** Banner: DROP_SHADOW 0/6 r16 #3a82f6 @8%. */
const bannerShadow: ViewStyle = {
  shadowColor: BANNER_ICON_BG,
  shadowOpacity: 0.08,
  shadowRadius: 8,
  shadowOffset: { width: 0, height: 6 },
  elevation: 2,
};

/** Calendar card: DROP_SHADOW 0/12 r32 #000 @4%. */
const cardShadow: ViewStyle = {
  shadowColor: "#000000",
  shadowOpacity: 0.04,
  shadowRadius: 16,
  shadowOffset: { width: 0, height: 12 },
  elevation: 2,
};

/** Header button: DROP_SHADOW 0/4 r12 #000 @3%. */
const headerShadow: ViewStyle = {
  shadowColor: "#000000",
  shadowOpacity: 0.03,
  shadowRadius: 6,
  shadowOffset: { width: 0, height: 4 },
  elevation: 1,
};

/** Platform badge: DROP_SHADOW 0/4 r8 #000 @8%. */
const platformShadow: ViewStyle = {
  shadowColor: "#000000",
  shadowOpacity: 0.08,
  shadowRadius: 4,
  shadowOffset: { width: 0, height: 4 },
  elevation: 3,
};

/** Remove badge: DROP_SHADOW 0/4 r8 #000 @15%. */
const removeShadow: ViewStyle = {
  shadowColor: "#000000",
  shadowOpacity: 0.15,
  shadowRadius: 4,
  shadowOffset: { width: 0, height: 4 },
  elevation: 4,
};

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

/* --------------------------------- screen --------------------------------- */
interface Cell {
  day: number;
  key: string;
  x: number;
  y: number;
}

export default function CollabDaysReview() {
  const router = useRouter();

  /**
   * The wizard hands its aggregate over as parallel lists — "5,15,18" and
   * "youtube,instagram,linkedin". Entering the route cold falls back to the
   * days the design ships.
   */
  const { days, platforms } = useLocalSearchParams<{ days?: string; platforms?: string }>();

  const [year, setYear] = useState(SPEC_YEAR);
  const [month, setMonth] = useState(SPEC_MONTH);

  /** day key -> platform, or null where a day has been taken back off. */
  const [manual, setManual] = useState<Record<string, string | null>>(() => {
    const picks: [number, string][] = days
      ? days
          .split(",")
          .map((d) => Number(d))
          .filter((d) => d > 0)
          .map((d, i) => [d, (platforms?.split(",")[i] ?? "instagram").toLowerCase()])
      : SPEC_PICKS;
    const seed: Record<string, string | null> = {};
    for (const [day, platform] of picks) {
      seed[dayKey(SPEC_YEAR, SPEC_MONTH, day)] = platform;
    }
    return seed;
  });

  /** The signed-in creator owns the schedule this screen persists. */
  const { data: me } = useMe();
  const { data: creators = [] } = useCreators();
  const creator = creators.find((c) => c.name === me?.name);
  const ownPlatform = (creator?.platform ?? "instagram").toLowerCase();

  /** Days already carrying scheduled content are collab days on the record. */
  const { data: calendar = [], isLoading } = useCalendar();
  const update = useUpdate<Creator & { collabDays: string[] }>("creators");

  /**
   * The month laid out on the seven weekday tracks. Longer months compress the
   * row step so the grid still ends on the card's 557.59pt inner edge rather
   * than spilling past the card.
   */
  const cells = useMemo<Cell[]>(() => {
    const first =
      year === SPEC_YEAR && month === SPEC_MONTH
        ? SPEC_FIRST_SLOT
        : new Date(year, month, 1).getDay();
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

  /**
   * Selected days for the displayed month: every scheduled calendar entry,
   * tinted by the platform of the creator that owns it, with the wizard's own
   * picks layered on top so an explicit choice always wins.
   */
  const selected = useMemo(() => {
    const map = new Map<number, string>();
    const byId = new Map(creators.map((c) => [c.id, (c.platform ?? "").toLowerCase()]));
    for (const item of calendar) {
      const at = new Date(item.scheduledAt);
      if (at.getFullYear() !== year || at.getMonth() !== month) continue;
      map.set(at.getDate(), byId.get(item.creatorId) ?? "instagram");
    }
    const prefix = `${year}-${pad(month + 1)}-`;
    for (const [key, platform] of Object.entries(manual)) {
      if (!key.startsWith(prefix)) continue;
      const day = Number(key.slice(8));
      if (platform === null) map.delete(day);
      else map.set(day, platform);
    }
    return map;
  }, [calendar, creators, manual, year, month]);

  const shiftMonth = (delta: number) => {
    const next = new Date(year, month + delta, 1);
    setYear(next.getFullYear());
    setMonth(next.getMonth());
  };

  const toggle = (cell: Cell) =>
    setManual((prev) => ({
      ...prev,
      [cell.key]: selected.has(cell.day) ? null : ownPlatform,
    }));

  /** Persist the aggregate as the creator's collab-day schedule. */
  const save = () => {
    if (creator) {
      const collabDays = Array.from(selected.keys())
        .sort((a, b) => a - b)
        .map((d) => dayKey(year, month, d));
      update.mutate({ id: creator.id, data: { collabDays } });
    }
    router.back();
  };

  return (
    <Screen height={FRAME_H} background="#F7F0E4" scroll>
      <Backdrop />

      {/* ------------------------------ Header ------------------------------ */}
      <Pressable
        onPress={() => router.back()}
        style={({ pressed }) => [styles.backButton, headerShadow, pressed && styles.pressed]}
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
        color={TITLE_INK}
        lineHeight={19.36}
        align="center"
        numberOfLines={1}
      >
        Select your collab days
      </Txt>

      {/* --------------------------- Info banner ---------------------------- */}
      <Abs
        x={BANNER_X}
        y={BANNER_Y}
        w={BANNER_W}
        h={BANNER_H}
        radius={16}
        bg={BANNER_FILL}
        border={BANNER_BORDER}
        borderWidth={1}
        style={bannerShadow}
      />
      <Abs x={37} y={131} w={24} h={24} radius={12} bg={BANNER_ICON_BG} center>
        <Feather name="info" size={14} color="#FFFFFF" />
      </Abs>
      <Txt
        x={73}
        y={129}
        w={235.56}
        size={13}
        weight="medium"
        font="inter"
        color={BANNER_INK}
        lineHeight={18.2}
      >
        {"This day will be preselected in your\ncalendar as your preferred collab day."}
      </Txt>

      {/* --------------------------- Calendar card -------------------------- */}
      <Abs
        x={CARD_X}
        y={CARD_Y}
        w={CARD_W}
        h={CARD_H}
        radius={24}
        bg={CARD_FILL}
        border={CARD_BORDER}
        borderWidth={1}
        style={cardShadow}
      />

      {/* Month stepper */}
      <Pressable
        onPress={() => shiftMonth(-1)}
        style={({ pressed }) => [styles.navButton, { left: 41 }, pressed && styles.pressed]}
      >
        <Feather name="chevron-left" size={18} color={INK} />
      </Pressable>
      <Txt
        x={41}
        y={242}
        w={NAV_W}
        size={18}
        weight="semibold"
        font="inter"
        color={INK}
        lineHeight={21.78}
        align="center"
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

      {/* Weekday header */}
      {WEEKDAYS.map((label, i) => (
        <Txt
          key={`${label}-${i}`}
          x={WEEK_X[i]}
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

      {/* Day grid — plain cells and selected pills share one geometry. */}
      {cells.map((cell) => {
        const platform = selected.get(cell.day);
        const style = platform ? platformStyle(platform) : null;
        return (
          <Pressable
            key={cell.key}
            onPress={() => toggle(cell)}
            style={({ pressed }) => [
              styles.cell,
              { left: cell.x, top: cell.y },
              style
                ? {
                    backgroundColor: style.fill,
                    borderWidth: 1,
                    borderColor: style.tint,
                    shadowColor: style.tint,
                    shadowOpacity: 0.2,
                    shadowRadius: 6,
                    shadowOffset: { width: 0, height: 4 },
                    elevation: 2,
                  }
                : null,
              pressed && styles.pressed,
            ]}
          >
            <Txt
              size={15}
              weight={style ? "semibold" : "medium"}
              font="inter"
              color={INK}
              lineHeight={18.15}
              align="center"
            >
              {cell.day}
            </Txt>
          </Pressable>
        );
      })}

      {/* Badges ride outside the pill, so they sit above the grid. */}
      {cells.map((cell) => {
        const platform = selected.get(cell.day);
        if (!platform) return null;
        const style = platformStyle(platform);
        return (
          <Abs
            key={`badge-${cell.key}`}
            x={cell.x + PLATFORM_OFFSET}
            y={cell.y + PLATFORM_OFFSET}
            w={PLATFORM_BADGE}
            h={PLATFORM_BADGE}
            radius={PLATFORM_BADGE / 2}
            bg="#FFFFFF"
            border={BADGE_BORDER}
            borderWidth={1}
            center
            style={platformShadow}
          >
            {style.badge}
          </Abs>
        );
      })}
      {cells.map((cell) => {
        if (!selected.has(cell.day)) return null;
        return (
          <Pressable
            key={`remove-${cell.key}`}
            onPress={() => toggle(cell)}
            style={({ pressed }) => [
              styles.removeBadge,
              { left: cell.x + REMOVE_DX, top: cell.y + REMOVE_DY },
              removeShadow,
              pressed && styles.pressed,
            ]}
          >
            <Feather name="plus" size={12} color="#FFFFFF" />
          </Pressable>
        );
      })}

      {/* ------------------------------- Save ------------------------------- */}
      <Pressable
        onPress={save}
        disabled={isLoading || update.isPending}
        style={({ pressed }) => [styles.save, pressed && styles.pressed]}
      >
        <Txt
          x={24}
          y={18.5}
          w={38}
          size={16}
          weight="semibold"
          font="inter"
          color="#FFFFFF"
          lineHeight={19.36}
          align="center"
        >
          Save
        </Txt>
        <Abs x={74} y={18} w={20} h={20} center>
          <Feather name="arrow-right" size={20} color="#FFFFFF" />
        </Abs>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  backdrop: { position: "absolute", left: 0, top: 0 },
  pressed: { opacity: 0.9 },

  /* Header — 44x44 glass button at 15,18. */
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
    borderColor: GLASS_BORDER,
  },

  /* Month stepper — 36x36 buttons on the card's 235pt row. */
  navButton: {
    position: "absolute",
    top: NAV_Y,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: GLASS_60,
    borderWidth: 1,
    borderColor: CARD_BORDER,
  },

  /* Day cell — 36.71 square, r12, centred number. */
  cell: {
    position: "absolute",
    width: CELL,
    height: CELL,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  /* Remove badge — 20x20 r10 #1c1c1e with a 2pt white ring, plus glyph. */
  removeBadge: {
    position: "absolute",
    width: REMOVE_BADGE,
    height: REMOVE_BADGE,
    borderRadius: REMOVE_BADGE / 2,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: INK,
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },

  /* Save — "Button" 237,689 118x56 r28. */
  save: {
    position: "absolute",
    left: 237,
    top: 689,
    width: 118,
    height: 56,
    borderRadius: 28,
    backgroundColor: SAVE_FILL,
  },
});
