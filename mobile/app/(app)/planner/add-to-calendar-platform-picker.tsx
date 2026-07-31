import { Fragment, useMemo, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import type { ViewStyle } from "react-native";
import { useRouter } from "expo-router";
import { Feather, FontAwesome, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Screen, Abs, Txt } from "../../../src/ui/Frame";
import { useCalendar, useCreators } from "../../../src/api/hooks";

/**
 * "Add to calendar" with the platform picker open — Figma frame 7450:39100
 * (375x875), traced 1:1.
 *
 * The dropdown is the *same* overlay the day editor shows (7450:38814 and
 * 7450:38940 are the identical 214x182 panel over a different backdrop), so it
 * lives here as one <PlatformPopover> mounted from the header button rather
 * than as three near-duplicate routes. Opening/closing is local state; the
 * frame captures the open state, so `open` starts true.
 *
 * Live data: the month grid's marked days come from useCalendar() — one badge
 * per scheduled item, keyed on the real scheduledAt day-of-month. useCreators()
 * supplies Creator.platform so the grid narrows to the picked platform whenever
 * the records actually carry one; when none do (the field is optional) every
 * scheduled day is shown rather than blanking the month. The grid itself stays
 * literal: June 2026 starts on a Sunday and runs 1..30, exactly the 35 cells the
 * design draws, so nothing moves when the data changes.
 *
 * Figma BACKGROUND_BLUR and INNER_SHADOW have no React Native equivalent: the
 * glass surfaces keep their translucent fills without the backdrop blur, and the
 * header buttons' white inner highlight is dropped. The frame's four radial
 * mesh glows are approximated by stacked discs (see Glow). Every other value —
 * geometry, colour, radius, size, weight, line-height — is verbatim.
 */

/* ------------------------------------------------------------------ frame */

const FRAME_H = 875;

/** Frame fill: linear #f7f0e4 -> #f4ebdd. */
const PAGE_BASE = "#f7f0e4";
const PAGE = ["#f7f0e4", "#f4ebdd"] as const;

/* ------------------------------------------------------------------ tokens */

const INK = "#1c1c1e";
const INK_HEADER = "#1a1a1c";
const MUTED = "#6b6b70";

/** Button (header glass): DROP_SHADOW 0/4 r12 #000 @3%. */
const glassShadow: ViewStyle = {
  shadowColor: "#000000",
  shadowOpacity: 0.03,
  shadowRadius: 6,
  shadowOffset: { width: 0, height: 4 },
  elevation: 2,
};

/** Overlay+Border+Shadow (calendar card): DROP_SHADOW 0/12 r32 #000 @4%. */
const cardShadow: ViewStyle = {
  shadowColor: "#000000",
  shadowOpacity: 0.04,
  shadowRadius: 16,
  shadowOffset: { width: 0, height: 12 },
  elevation: 4,
};

/** Day badge (white 22pt disc): DROP_SHADOW 0/4 r8 #000 @8%. */
const badgeShadow: ViewStyle = {
  shadowColor: "#000000",
  shadowOpacity: 0.08,
  shadowRadius: 4,
  shadowOffset: { width: 0, height: 4 },
  elevation: 3,
};

/** Day marker (dark 20pt disc): DROP_SHADOW 0/4 r8 #000 @15%. */
const markShadow: ViewStyle = {
  shadowColor: "#000000",
  shadowOpacity: 0.15,
  shadowRadius: 4,
  shadowOffset: { width: 0, height: 4 },
  elevation: 4,
};

/** Button (bottom fab): DROP_SHADOW 0/8 r16 #000 @4%. */
const fabShadow: ViewStyle = {
  shadowColor: "#000000",
  shadowOpacity: 0.04,
  shadowRadius: 8,
  shadowOffset: { width: 0, height: 8 },
  elevation: 3,
};

/** Button (Generate Content): DROP_SHADOW 0/10 r24 #8b5cf6 @30%. */
const ctaShadow: ViewStyle = {
  shadowColor: "#8b5cf6",
  shadowOpacity: 0.3,
  shadowRadius: 12,
  shadowOffset: { width: 0, height: 10 },
  elevation: 8,
};

/* --------------------------------------------------------------- platforms */

type PlatformKey = "instagram" | "youtube" | "linkedin";

interface Platform {
  key: PlatformKey;
  /** Row label — literal from the popover's TEXT nodes. */
  label: string;
  /** Popover row top (196x52 at x=89). */
  rowY: number;
  /** Popover label node y/width. */
  labelY: number;
  labelW: number;
  /** Popover 16pt glyph colour. */
  glyph: string;
  /** Day-cell tint on the month grid. */
  tint: string;
  tintFill: string;
  /** 12pt logo colour inside the white day badge. */
  badge: string;
}

/**
 * The three connected accounts the panel lists. Brand identity — labels,
 * glyph colours and the per-platform day tints — is chrome from the spec; the
 * API exposes no platforms resource, only Creator.platform as a free string.
 */
const PLATFORMS: Platform[] = [
  {
    key: "instagram",
    label: "Instagram",
    rowY: 97,
    labelY: 113.5,
    labelW: 72.88,
    glyph: "#be185d",
    tint: "#ff8fbc",
    tintFill: "rgba(255,143,188,0.12)",
    badge: "#e1306c",
  },
  {
    key: "youtube",
    label: "YouTube",
    rowY: 153,
    labelY: 169.5,
    labelW: 63,
    glyph: "#e11d48",
    tint: "#fc3d3d",
    tintFill: "rgba(252,61,61,0.12)",
    badge: "#e11d48",
  },
  {
    key: "linkedin",
    label: "LinkedIn",
    rowY: 209,
    labelY: 226,
    labelW: 62,
    glyph: "#0076b2",
    tint: "#63a1de",
    tintFill: "rgba(99,161,222,0.12)",
    badge: "#0a66c2",
  },
];

function PlatformGlyph({
  platform, size, color,
}: { platform: PlatformKey; size: number; color: string }) {
  if (platform === "instagram") return <Feather name="instagram" size={size} color={color} />;
  if (platform === "youtube") return <Feather name="youtube" size={size} color={color} />;
  return <FontAwesome name="linkedin-square" size={size} color={color} />;
}

/* ------------------------------------------------------------------- grid */

/** June 2026 starts on a Sunday — column/row origins of the 36.71pt cells. */
const COLS = [41, 83.71, 126.43, 169.14, 211.86, 254.57, 297.29];
const ROWS = [227, 275.72, 324.44, 373.16, 421.88];
const CELL = 36.71;
const DAYS = Array.from({ length: 30 }, (_, i) => i + 1);

/** Weekday header: 41.86pt columns at y=196. */
const WEEKDAY_X = [41, 82.86, 124.71, 166.57, 208.43, 250.29, 292.14];
const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];

/**
 * Stand-in for Figma's radial mesh glows: React Native cannot paint a radial
 * gradient, so three concentric discs at a fraction of the target alpha
 * reproduce the soft falloff.
 */
function Glow({
  cx, cy, r, color, opacity,
}: { cx: number; cy: number; r: number; color: string; opacity: number }) {
  return (
    <>
      {[0, 1, 2].map((i) => {
        const s = r * 2 * (1 - i * 0.28);
        return (
          <Abs
            key={i}
            x={cx - s / 2}
            y={cy - s / 2}
            w={s}
            h={s}
            radius={s / 2}
            bg={color}
            opacity={opacity * 0.3}
          />
        );
      })}
    </>
  );
}

export default function AddToCalendarPlatformPicker() {
  const router = useRouter();

  // The frame captures the dropdown's open state.
  const [open, setOpen] = useState(true);
  const [selected, setSelected] = useState<PlatformKey>("instagram");

  const active = PLATFORMS.find((p) => p.key === selected) ?? PLATFORMS[0];

  const { data: calendar } = useCalendar();
  const { data: creators } = useCreators();

  /** creatorId -> normalised platform, for the items that declare one. */
  const platformOf = useMemo(() => {
    const map = new Map<string, string>();
    for (const c of creators ?? []) {
      if (c.platform) map.set(c.id, c.platform.toLowerCase());
    }
    return map;
  }, [creators]);

  /**
   * Scheduled days of the month. Narrow to the picked platform only when the
   * creator records carry one, otherwise every scheduled day stays marked —
   * loading and empty both collapse to "no badges", which leaves the grid's
   * geometry untouched.
   */
  const markedDays = useMemo(() => {
    const items = calendar ?? [];
    const tagged = items.filter((it) => platformOf.has(it.creatorId));
    const scoped = tagged.length
      ? tagged.filter((it) => platformOf.get(it.creatorId) === selected)
      : items;
    const days = new Set<number>();
    for (const it of scoped) {
      const d = new Date(it.scheduledAt).getDate();
      // The frame draws 1..30; anything past the last cell is dropped.
      if (d >= 1 && d <= 30) days.add(d);
    }
    return days;
  }, [calendar, platformOf, selected]);

  /** Day cell tint shadow — DROP_SHADOW 0/4 r12 tint @20%. */
  const dayShadow: ViewStyle = {
    shadowColor: active.tint,
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  };

  return (
    <Screen height={FRAME_H} background={PAGE_BASE} scroll style={styles.clip}>
      {/* --------------------------------------------------- frame fill */}
      <LinearGradient
        colors={PAGE}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.page}
      />
      <Glow cx={75} cy={87.5} r={352} color="#ffffff" opacity={0.72} />
      <Glow cx={292.5} cy={157.5} r={268} color="#f6d64a" opacity={0.22} />
      <Glow cx={90} cy={367.5} r={232} color="#bacdf4" opacity={0.36} />
      <Glow cx={285} cy={542.5} r={267} color="#f7b7da" opacity={0.34} />

      {/* ============================================== Header (0,0,375,80) */}

      {/* Button — back */}
      <Abs
        x={15}
        y={20}
        w={40}
        h={40}
        radius={20}
        bg="rgba(255,255,255,0.7)"
        border="rgba(255,255,255,0.9)"
        borderWidth={1}
        style={glassShadow}
      />
      <Abs x={25} y={30} w={20} h={20} center>
        <Feather name="arrow-left" size={20} color={INK_HEADER} />
      </Abs>

      {/* Button — platform picker trigger */}
      <Abs
        x={110}
        y={21.5}
        w={152.88}
        h={37}
        radius={20}
        bg="rgba(255,255,255,0.8)"
        border="rgba(255,255,255,0.9)"
        borderWidth={1}
        style={glassShadow}
      />
      <Abs x={123} y={31} w={18} h={18} center>
        <PlatformGlyph platform={active.key} size={18} color={active.badge} />
      </Abs>
      <Txt
        x={149}
        y={30.5}
        w={72.88}
        size={15}
        weight="semibold"
        font="inter"
        color={INK_HEADER}
        lineHeight={18.15}
        align="center"
      >
        {active.label}
      </Txt>
      <Abs x={229.88} y={32} w={16} h={16} center>
        <Feather name="chevron-down" size={16} color="#5e5e62" />
      </Abs>

      {/* Button — overflow menu */}
      <Abs
        x={317.88}
        y={20}
        w={40}
        h={40}
        radius={20}
        bg="rgba(255,255,255,0.7)"
        border="rgba(255,255,255,0.9)"
        borderWidth={1}
        style={glassShadow}
      />
      <Abs x={327.88} y={30} w={20} h={20} center>
        <MaterialCommunityIcons name="dots-vertical" size={20} color="#000000" />
      </Abs>

      {/* ================================ Main / Margin / calendar card */}

      <Abs
        x={20}
        y={111}
        w={335}
        h={372.59}
        radius={24}
        bg="rgba(255,255,255,0.55)"
        border="rgba(0,0,0,0.1)"
        borderWidth={1}
        style={cardShadow}
      />

      {/* Container — month stepper */}
      <Abs
        x={41}
        y={136}
        w={36}
        h={36}
        radius={18}
        bg="rgba(255,255,255,0.6)"
        border="rgba(0,0,0,0.1)"
        borderWidth={1}
      />
      <Abs x={50} y={145} w={18} h={18} center>
        <Feather name="chevron-left" size={18} color={INK} />
      </Abs>

      <Txt
        x={140.49}
        y={143}
        w={94}
        size={18}
        weight="semibold"
        font="inter"
        color={INK}
        lineHeight={21.78}
      >
        June 2026
      </Txt>

      <Abs
        x={297.98}
        y={136}
        w={36}
        h={36}
        radius={18}
        bg="rgba(255,255,255,0.6)"
        border="rgba(0,0,0,0.1)"
        borderWidth={1}
      />
      <Abs x={306.98} y={145} w={18} h={18} center>
        <Feather name="chevron-right" size={18} color={INK} />
      </Abs>

      {/* Container — weekday header */}
      {WEEKDAYS.map((letter, i) => (
        <Txt
          key={`wd-${i}`}
          x={WEEKDAY_X[i]}
          y={196}
          w={41.86}
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

      {/* Container — day grid */}
      {DAYS.map((day) => {
        const i = day - 1;
        const x = COLS[i % 7];
        const y = ROWS[Math.floor(i / 7)];
        const on = markedDays.has(day);
        return (
          <Fragment key={day}>
            <Abs
              x={x}
              y={y}
              w={CELL}
              h={CELL}
              radius={12}
              center
              bg={on ? active.tintFill : undefined}
              border={on ? active.tint : undefined}
              borderWidth={on ? 1 : undefined}
              style={on ? dayShadow : undefined}
            >
              <Txt
                size={15}
                weight={on ? "semibold" : "medium"}
                font="inter"
                color={INK}
                lineHeight={18.15}
                align="center"
              >
                {String(day)}
              </Txt>
            </Abs>

            {on ? (
              <>
                {/* Background+Border+Shadow — platform badge */}
                <Abs
                  x={x - 7}
                  y={y - 7}
                  w={22}
                  h={22}
                  radius={11}
                  bg="#ffffff"
                  border="rgba(0,0,0,0.06)"
                  borderWidth={1}
                  center
                  style={badgeShadow}
                >
                  <PlatformGlyph platform={active.key} size={12} color={active.badge} />
                </Abs>

                {/* Background+Border+Shadow — add marker */}
                <Abs
                  x={x + 21.71}
                  y={y + 21.72}
                  w={20}
                  h={20}
                  radius={10}
                  bg={INK}
                  border="#ffffff"
                  borderWidth={2}
                  center
                  style={markShadow}
                >
                  <Feather name="plus" size={12} color="#ffffff" />
                </Abs>
              </>
            ) : null}
          </Fragment>
        );
      })}

      {/* ======================================= Main / Background — action bar */}

      <LinearGradient
        colors={["rgba(253,252,254,0.95)", "rgba(253,252,254,0)"]}
        locations={[0.4, 1]}
        start={{ x: 0.5, y: 1 }}
        end={{ x: 0.5, y: 0 }}
        style={styles.actionBar}
      />

      <Abs
        x={20}
        y={787}
        w={56}
        h={56}
        radius={28}
        bg="rgba(255,255,255,0.7)"
        border="rgba(255,255,255,0.8)"
        borderWidth={1}
        style={fabShadow}
      />
      {/* iconify-icon 7450:39239 — share/export glyph (vector 13.33x16.67
          at 41.33/806.67 inside the 20pt box = Feather "share"). */}
      <Abs x={38} y={805} w={20} h={20} center>
        <Feather name="share" size={20} color="#141416" />
      </Abs>

      <View style={[styles.cta, ctaShadow]}>
        <LinearGradient
          colors={["#a78bfa", "#7c3aed"]}
          start={{ x: 0.18, y: 0 }}
          end={{ x: 0.82, y: 1 }}
          style={styles.fill}
        />
      </View>
      <Abs x={144.38} y={806} w={18} h={18} center>
        <Ionicons name="sparkles-outline" size={18} color="#ffffff" />
      </Abs>
      <Txt
        x={170.38}
        y={805.5}
        w={128.25}
        size={15}
        weight="semibold"
        font="inter"
        color="#ffffff"
        lineHeight={18.15}
        align="center"
      >
        Generate Content
      </Txt>

      {/* ------------------------------------------------- base hit targets */}
      <Pressable onPress={() => router.back()} style={styles.backHit} />
      <Pressable onPress={() => setOpen(true)} style={styles.triggerHit} />
      <Pressable
        onPress={() => router.push("/content/plan-generator")}
        style={styles.ctaHit}
      />

      {/* ================================= Frame 2147223240 — platform popover */}

      {open ? (
        <>
          <Pressable onPress={() => setOpen(false)} style={styles.scrim} />

          {/* Frame — 214x182 floating panel */}
          <Abs
            x={80}
            y={88}
            w={214}
            h={182}
            radius={24}
            bg="#ffffff"
            border="rgba(255,255,255,0.8)"
            borderWidth={1}
          />

          {PLATFORMS.map((p) => {
            const on = p.key === selected;
            return (
              <Fragment key={p.key}>
                {/* Background+Shadow — selected row */}
                {on ? (
                  <View style={[styles.rowFill, { top: p.rowY }]}>
                    <LinearGradient
                      colors={["rgba(251,207,232,0.35)", "rgba(233,213,255,0.15)"]}
                      start={{ x: 0, y: 0.5 }}
                      end={{ x: 1, y: 0.5 }}
                      style={styles.fill}
                    />
                  </View>
                ) : null}

                {/* Background+Shadow — 32pt logo tile */}
                <Abs x={99} y={p.rowY + 10} w={32} h={32} radius={16} center>
                  <PlatformGlyph platform={p.key} size={16} color={p.glyph} />
                </Abs>

                <Txt
                  x={143}
                  y={p.labelY}
                  w={p.labelW}
                  size={15}
                  weight="semibold"
                  font="inter"
                  color={on ? "#1a1a1c" : "#27272a"}
                  lineHeight={18.15}
                >
                  {p.label}
                </Txt>

                {on ? (
                  <Abs x={245} y={p.rowY + 14} w={24} h={24} center>
                    <Feather name="check" size={18} color={p.glyph} />
                  </Abs>
                ) : null}

                <Pressable
                  onPress={() => {
                    setSelected(p.key);
                    setOpen(false);
                  }}
                  style={[styles.rowHit, { top: p.rowY }]}
                />
              </Fragment>
            );
          })}
        </>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  clip: { overflow: "hidden" },
  page: { position: "absolute", left: 0, top: 0, width: 375, height: FRAME_H },
  fill: { flex: 1 },

  actionBar: { position: "absolute", left: 0, top: 767, width: 375, height: 108 },
  cta: {
    position: "absolute",
    left: 88,
    top: 787,
    width: 267,
    height: 56,
    borderRadius: 28,
    overflow: "hidden",
  },

  backHit: { position: "absolute", left: 15, top: 20, width: 40, height: 40, borderRadius: 20 },
  triggerHit: {
    position: "absolute", left: 110, top: 21.5, width: 152.88, height: 37, borderRadius: 20,
  },
  ctaHit: { position: "absolute", left: 88, top: 787, width: 267, height: 56, borderRadius: 28 },

  scrim: {
    position: "absolute",
    left: 0,
    top: -1,
    width: 375,
    height: 876,
    backgroundColor: "rgba(181,180,185,0.57)",
  },
  rowFill: {
    position: "absolute", left: 89, width: 196, height: 52, borderRadius: 16, overflow: "hidden",
  },
  rowHit: { position: "absolute", left: 89, width: 196, height: 52, borderRadius: 16 },
});
