import { Fragment, useMemo, useState } from "react";
import { Pressable, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
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
import { useCalendar, useCreators } from "../../../src/api/hooks";

/**
 * Add to calendar — pick a date. Figma 7358:23141 (375x875), traced 1:1.
 *
 * The platform-scoped date picker for scheduling a new piece of content, and
 * deliberately not the planner month view: the header carries a platform
 * dropdown ("Instagram" + chevron) and the kebab that opens planner-options-menu,
 * the card holds a plain June 2026 grid, and the bottom band ends in "Generate
 * Content". Days that already hold content for the selected platform swap their
 * plain cell for a tinted one carrying two overhanging badges — the platform
 * logo at (-7,-7) and the dark add chip at (+21.72,+21.72). Tapping any day
 * hands the date to planner-day-editor.
 *
 * Figma's BACKGROUND_BLUR and INNER_SHADOW have no React Native equivalent, so
 * the glass surfaces keep their translucent fills and drop shadows without the
 * backdrop blur. Every other value — geometry, colour, radius, size, weight,
 * line-height — is verbatim from the spec.
 */

/* ------------------------------- geometry -------------------------------- */
const FRAME_W = 375;
const FRAME_H = 875;

/** Calendar card: "Overlay+Border+Shadow+OverlayBlur" 20,111 335x372.59. */
const CARD_X = 20;
const CARD_Y = 111;
const CARD_W = 335;
const CARD_H = 372.59;

/** Month stepper row: "Container" 41,136 293x36. */
const NAV_Y = 136;

/** Weekday header: seven 41.86 tracks at y=196. */
const WEEK_Y = 196;
const WEEK_X = [41, 82.86, 124.71, 166.57, 208.43, 250.29, 292.14];
const TRACK_W = 41.86;

/** Day grid: "Container" 41,227 293x231.59 — 36.71 cells on a 42.715 pitch. */
const COL_X = [41, 83.71, 126.43, 169.14, 211.86, 254.57, 297.29];
const ROW_Y0 = 227;
const CELL = 36.71;
const ROW_STEP = 48.72;
/** 231.59 (grid height) - 36.71 (cell) = 194.88 of vertical travel. */
const GRID_SPAN = 194.88;

/** Badge offsets, identical on all three badged days in the design. */
const LOGO_DX = -7;
const CHIP_DX = 21.72;

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/* --------------------------- spec colour tokens --------------------------- */
const HEADER_INK = "#1a1a1c";
const INK = "#1c1c1e";
const WEEKDAY_INK = "#6b6b70";
const CHEVRON_INK = "#5e5e62";
const CHIP_INK = "#1c1c1e";
const GLASS_55 = "rgba(255,255,255,0.55)";
const GLASS_60 = "rgba(255,255,255,0.6)";
const GLASS_70 = "rgba(255,255,255,0.7)";
const GLASS_80 = "rgba(255,255,255,0.8)";
const BORDER_80 = "rgba(255,255,255,0.8)";
const BORDER_90 = "rgba(255,255,255,0.9)";
const HAIRLINE = "rgba(0,0,0,0.1)";
const BADGE_LINE = "rgba(0,0,0,0.06)";
const CTA_A = "#a78bfa";
const CTA_B = "#7c3aed";

/** Brand marks, from the three logo badges. */
const YOUTUBE = "#fc3d3d";
const INSTAGRAM = "#e1306c";
const LINKEDIN = "#0a66c2";

/**
 * Per-platform day-cell treatment. The three badged days ship YouTube (#fc3d3d),
 * Instagram (#ff8fbc) and LinkedIn (#63a1de); each cell is the tint at 12% with
 * a 1pt tint border and a 0/4 r12 tint-at-20% shadow.
 */
const TINTS: Record<string, { fill: string; line: string; glow: string }> = {
  YouTube: { fill: "rgba(252,61,61,0.12)", line: "#fc3d3d", glow: "#fc3d3d" },
  Instagram: { fill: "rgba(255,143,188,0.12)", line: "#ff8fbc", glow: "#ff8fbc" },
  LinkedIn: { fill: "rgba(99,161,222,0.12)", line: "#63a1de", glow: "#63a1de" },
};
const tintOf = (platform: string) => TINTS[platform] ?? TINTS.Instagram;

/** The month the design ships. */
const SPEC_YEAR = 2026;
const SPEC_MONTH = 5; // June
const SPEC_PLATFORM = "Instagram";

const pad = (n: number) => String(n).padStart(2, "0");
/** "2026-06-15" — the key the grid and CalendarItem.scheduledAt share. */
const dayKey = (y: number, m: number, d: number) => `${y}-${pad(m + 1)}-${pad(d)}`;

/* -------------------------------- backdrop -------------------------------- */
/** The frame fill: a warm vertical base plus four soft radial glows. */
function Backdrop() {
  return (
    <Svg width={FRAME_W} height={FRAME_H} style={styles.backdrop}>
      <Defs>
        <SvgLinear id="ac-base" x1="187.5" y1="0" x2="187.5" y2={FRAME_H} gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#F7F0E4" />
          <Stop offset="1" stopColor="#F4EBDD" />
        </SvgLinear>
        <RadialGradient id="ac-pink" cx="285" cy="542.5" rx="1027.5" ry="568.75" gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#F7B7DA" stopOpacity="0.34" />
          <Stop offset="0.26" stopColor="#F7B7DA" stopOpacity="0" />
        </RadialGradient>
        <RadialGradient id="ac-blue" cx="90" cy="367.5" rx="967.5" ry="533.75" gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#BACDF4" stopOpacity="0.36" />
          <Stop offset="0.24" stopColor="#BACDF4" stopOpacity="0" />
        </RadialGradient>
        <RadialGradient id="ac-gold" cx="292.5" cy="157.5" rx="1338.75" ry="735" gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#F6D64A" stopOpacity="0.22" />
          <Stop offset="0.2" stopColor="#F6D64A" stopOpacity="0" />
        </RadialGradient>
        <RadialGradient id="ac-haze" cx="75" cy="87.5" rx="1466.25" ry="805" gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#FFFFFF" stopOpacity="0.72" />
          <Stop offset="0.24" stopColor="#FFFFFF" stopOpacity="0" />
        </RadialGradient>
      </Defs>
      <Rect width={FRAME_W} height={FRAME_H} fill="url(#ac-base)" />
      <Rect width={FRAME_W} height={FRAME_H} fill="url(#ac-pink)" />
      <Rect width={FRAME_W} height={FRAME_H} fill="url(#ac-blue)" />
      <Rect width={FRAME_W} height={FRAME_H} fill="url(#ac-gold)" />
      <Rect width={FRAME_W} height={FRAME_H} fill="url(#ac-haze)" />
    </Svg>
  );
}

/**
 * The platform mark. The design draws Instagram as a stroked glyph and LinkedIn
 * and YouTube as their brand logos, so each keeps its own family.
 */
function PlatformLogo({ platform, size }: { platform: string; size: number }) {
  if (platform === "YouTube") return <Ionicons name="logo-youtube" size={size} color={YOUTUBE} />;
  if (platform === "LinkedIn") return <Ionicons name="logo-linkedin" size={size} color={LINKEDIN} />;
  return <Feather name="instagram" size={size} color={INSTAGRAM} />;
}

/* --------------------------------- screen --------------------------------- */
interface Cell {
  day: number;
  key: string;
  x: number;
  y: number;
  /** Platform already holding content on this day, when there is one. */
  platform?: string;
}

export default function AddToCalendarDate() {
  const router = useRouter();

  const [platform, setPlatform] = useState(SPEC_PLATFORM);
  const [year, setYear] = useState(SPEC_YEAR);
  const [month, setMonth] = useState(SPEC_MONTH);

  const { data: calendar = [] } = useCalendar();
  const { data: creators = [] } = useCreators();

  /** A scheduled item's platform comes from the creator it belongs to. */
  const platformById = useMemo(
    () => new Map(creators.map((c) => [c.id, c.platform ?? SPEC_PLATFORM])),
    [creators],
  );

  /** The platform dropdown offers whatever the roster actually publishes on. */
  const platforms = useMemo(() => {
    const found = new Set<string>();
    for (const c of creators) if (c.platform) found.add(c.platform);
    return found.size ? Array.from(found) : [SPEC_PLATFORM];
  }, [creators]);

  const cyclePlatform = () => {
    const at = platforms.indexOf(platform);
    setPlatform(platforms[(at + 1) % platforms.length]);
  };

  /** Days already carrying content for the selected platform, keyed by date. */
  const booked = useMemo(() => {
    const map = new Map<string, string>();
    for (const item of calendar) {
      const owner = platformById.get(item.creatorId) ?? SPEC_PLATFORM;
      if (owner !== platform) continue;
      map.set(item.scheduledAt.slice(0, 10), owner);
    }
    return map;
  }, [calendar, platformById, platform]);

  /**
   * The month laid out on the seven weekday tracks. June 2026 needs five rows,
   * which lands every cell on the design's exact coordinates; a six-row month
   * compresses the step so the grid still ends on the card's inner edge.
   */
  const cells = useMemo<Cell[]>(() => {
    const first = new Date(year, month, 1).getDay();
    const count = new Date(year, month + 1, 0).getDate();
    const rows = Math.ceil((first + count) / 7);
    const step = Math.min(ROW_STEP, GRID_SPAN / Math.max(rows - 1, 1));
    return Array.from({ length: count }, (_unused, i) => {
      const slot = first + i;
      const key = dayKey(year, month, i + 1);
      return {
        day: i + 1,
        key,
        x: COL_X[slot % 7],
        y: ROW_Y0 + Math.floor(slot / 7) * step,
        platform: booked.get(key),
      };
    });
  }, [year, month, booked]);

  const shiftMonth = (delta: number) => {
    const next = new Date(year, month + delta, 1);
    setYear(next.getFullYear());
    setMonth(next.getMonth());
  };

  return (
    <Screen height={FRAME_H} background="#F7F0E4" scroll>
      <Backdrop />

      {/* ------------------------------ Header ------------------------------ */}
      <Pressable
        onPress={() => router.back()}
        style={({ pressed }) => [styles.roundButton, pressed && styles.pressed]}
      >
        <Feather name="arrow-left" size={20} color={HEADER_INK} />
      </Pressable>

      {/* Platform dropdown — Button 110,21.5 152.88x37 */}
      <Pressable
        onPress={cyclePlatform}
        style={({ pressed }) => [styles.platformChip, pressed && styles.pressed]}
      >
        <Abs x={13} y={9.5} w={18} h={18} center>
          <PlatformLogo platform={platform} size={18} />
        </Abs>
        <Txt
          x={39}
          y={9}
          w={72.88}
          size={15}
          weight="semibold"
          font="inter"
          color={HEADER_INK}
          lineHeight={18.15}
          align="center"
          numberOfLines={1}
        >
          {platform}
        </Txt>
        <Abs x={119.88} y={10.5} w={16} h={16} center>
          <Feather name="chevron-down" size={16} color={CHEVRON_INK} />
        </Abs>
      </Pressable>

      {/* Kebab — Button 317.88,20 40x40, opens planner-options-menu */}
      <Pressable
        onPress={() => router.push("/planner/planner-options-menu" as never)}
        style={({ pressed }) => [styles.roundButton, styles.kebab, pressed && styles.pressed]}
      >
        <Feather name="more-vertical" size={20} color="#000000" />
      </Pressable>

      {/* --------------------------- Calendar card -------------------------- */}
      <Abs
        x={CARD_X}
        y={CARD_Y}
        w={CARD_W}
        h={CARD_H}
        radius={24}
        bg={GLASS_55}
        border={HAIRLINE}
        borderWidth={1}
        style={styles.cardShadow}
      />

      {/* Month stepper */}
      <Pressable
        onPress={() => shiftMonth(-1)}
        style={({ pressed }) => [styles.navButton, { left: 41 }, pressed && styles.pressed]}
      >
        <Feather name="chevron-left" size={18} color={INK} />
      </Pressable>
      {/*
        The label is a hug-content box at 140.49,143 (94x22) sitting centred
        between the two stepper buttons; spanning the 293pt row and centring
        puts "June 2026" on the same 187.5 axis and keeps longer month names
        centred rather than truncated.
      */}
      <Txt
        x={41}
        y={143}
        w={293}
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
          key={i}
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

      {/* Day grid — plain cells first, so the overhanging badges stack above */}
      {cells.map((cell) => {
        const tint = cell.platform ? tintOf(cell.platform) : null;
        return (
          <Pressable
            key={cell.key}
            onPress={() =>
              router.push(
                `/planner/planner-day-editor?date=${cell.key}&platform=${platform}` as never,
              )
            }
            style={({ pressed }) => [
              styles.cell,
              { left: cell.x, top: cell.y },
              tint
                ? {
                    backgroundColor: tint.fill,
                    borderWidth: 1,
                    borderColor: tint.line,
                    shadowColor: tint.glow,
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
              weight={tint ? "semibold" : "medium"}
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

      {/* Badges for every day that already holds content */}
      {cells
        .filter((cell) => cell.platform)
        .map((cell) => (
          <Fragment key={`badge-${cell.key}`}>
            {/* Background+Border+Shadow — platform logo, 22x22 at (-7,-7) */}
            <Abs
              x={cell.x + LOGO_DX}
              y={cell.y + LOGO_DX}
              w={22}
              h={22}
              radius={11}
              bg="#FFFFFF"
              border={BADGE_LINE}
              borderWidth={1}
              center
              style={styles.logoShadow}
            >
              <PlatformLogo platform={cell.platform ?? SPEC_PLATFORM} size={12} />
            </Abs>
            {/* Background+Border+Shadow — add chip, 20x20 at (+21.72,+21.72) */}
            <Abs
              x={cell.x + CHIP_DX}
              y={cell.y + CHIP_DX}
              w={20}
              h={20}
              radius={10}
              bg={CHIP_INK}
              border="#FFFFFF"
              borderWidth={2}
              center
              style={styles.chipShadow}
            >
              <Feather name="plus" size={12} color="#FFFFFF" />
            </Abs>
          </Fragment>
        ))}

      {/* ---------------------------- Bottom band --------------------------- */}
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
        <Feather name="share" size={20} color="#141416" />
      </Pressable>

      <Pressable
        onPress={() => router.push("/content/plan-generator" as never)}
        style={({ pressed }) => [styles.cta, pressed && styles.pressed]}
      >
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

  /* Header — 40x40 glass buttons at 15,20 and 317.88,20. */
  roundButton: {
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
  kebab: { left: 317.88 },

  /* Platform dropdown — 152.88x37 glass pill at 110,21.5. */
  platformChip: {
    position: "absolute",
    left: 110,
    top: 21.5,
    width: 152.88,
    height: 37,
    borderRadius: 20,
    backgroundColor: GLASS_80,
    borderWidth: 1,
    borderColor: BORDER_90,
    shadowColor: "#000000",
    shadowOpacity: 0.039,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },

  /* Calendar card — 335x372.59 glass panel, 0/12 r32 #0000000a. */
  cardShadow: {
    shadowColor: "#000000",
    shadowOpacity: 0.039,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 12 },
    elevation: 2,
  },

  /* Month stepper — 36x36 buttons on the card's 136pt row. */
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
    borderColor: HAIRLINE,
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
  logoShadow: {
    shadowColor: "#000000",
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  chipShadow: {
    shadowColor: "#000000",
    shadowOpacity: 0.15,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 4 },
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
