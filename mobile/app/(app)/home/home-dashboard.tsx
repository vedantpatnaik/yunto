import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { Image, Pressable, ScrollView, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import {
  Feather,
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Svg, {
  Defs,
  LinearGradient as SvgLinear,
  Path,
  RadialGradient,
  Rect,
  Stop,
} from "react-native-svg";
import { Abs, Screen, Txt } from "../../../src/ui/Frame";
import { colors } from "../../../src/theme";
import {
  compact,
  inr,
  useCampaigns,
  useInvoices,
  useLeads,
  useMe,
  useNotifications,
  useReminders,
  type Invoice,
} from "../../../src/api/hooks";

/**
 * Home — Figma 7321:2901 "screen 1 prototype" (375x875).
 *
 * The creator's landing tab and the design-system anchor for the app. Three
 * top-level frames in the spec, reproduced as three layers here:
 *
 *   1. Header      — 375x80, fixed, never scrolls.
 *   2. Body        — "Frame 2147223252" (0,106,375x659, clipsContent) whose
 *                    children run to y=2033.24. It is a clipped viewport, so it
 *                    owns the vertical ScrollView; children keep raw frame
 *                    coordinates via a single -106 offset on the inner canvas.
 *   3. Tab bar     — the 343x76 floating glass bar at y=776.69 plus its centre
 *                    FAB, drawn last so it sits above the scrolling body.
 *
 * Every coordinate, colour, size and weight below is lifted from the spec;
 * <Screen> scales the 375pt canvas to the device.
 */

/* ------------------------------- geometry -------------------------------- */
const FRAME_W = 375;
const FRAME_H = 875;

const BODY_Y = 106; // Frame 2147223252 origin — the scroll viewport top
const BODY_H = 659; // …and its clipped height
const CONTENT_BOTTOM = 2033.24; // Activity section's lower edge

/* --------------------------- spec colour tokens --------------------------- */
const INK = "#1f1a17";
const INK_ALT = "#1a1a1a";
const MUTED = "#787486";
const META_ALT = "#555555";
const CHEVRON = "#8b7e73";
const CTA_INK = "#312b28";
const ICON_ON_DARK = "#f1eee8";
const GLASS_W46 = "rgba(255,255,255,0.46)";
const GLASS_W56 = "rgba(255,255,255,0.56)";
const GLASS_W60 = "rgba(255,255,255,0.6)";
const GLASS_W62 = "rgba(255,255,255,0.62)";
const GLASS_W70 = "rgba(255,255,255,0.7)";
const GLASS_W80 = "rgba(255,255,255,0.8)";
const GLASS_W90 = "rgba(255,255,255,0.9)";
const CTA_FILL = "rgba(255,254,254,0.6)";
const DARK_PILL = "rgba(31,26,23,0.92)";

/* ------------------------------ derivations ------------------------------- */
type Period = "M" | "W" | "Y";

const DAY = 86_400_000;
const PERIOD_DAYS: Record<Period, number> = { W: 7, M: 30, Y: 365 };
/** The chip in the spec reads "+18% this week"; the suffix follows the pill. */
const PERIOD_SUFFIX: Record<Period, string> = {
  W: "this week",
  M: "this month",
  Y: "this year",
};

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const pad2 = (n: number) => String(n).padStart(2, "0");

/** Header greeting — "Good morning," is the spec literal for the morning case. */
function greetingFor(hour: number): string {
  if (hour < 12) return "Good morning,";
  if (hour < 17) return "Good afternoon,";
  return "Good evening,";
}

/** "2:00 pm" — lower-case meridiem, exactly as the reminder rows are set. */
function clockLabel(d: Date): string {
  const h = d.getHours() % 12 || 12;
  const m = String(d.getMinutes()).padStart(2, "0");
  return `${h}:${m} ${d.getHours() >= 12 ? "pm" : "am"}`;
}

/** "today, 2:00 pm" while it is today, "4 Aug, 2:00 pm" once it is not. */
function whenLabel(iso: string): string {
  const d = new Date(iso);
  const today = new Date();
  const sameDay = d.toDateString() === today.toDateString();
  return sameDay
    ? `today, ${clockLabel(d)}`
    : `${d.getDate()} ${MONTHS[d.getMonth()]}, ${clockLabel(d)}`;
}

/** Indian short money — 120000 -> "₹1.2L", 34000 -> "₹34K". */
/**
 * Compact currency for the fixed-width summary tiles.
 *
 * The tile fits about four glyphs at its 28pt weight — the design's sample is
 * "₹34K". A decimal is only affordable below ten lakh; above that it overflows
 * and the value renders clipped as "₹16…", so the decimal is dropped there.
 */
function inrShort(n: number): string {
  if (n >= 10_000_000) return `₹${Math.round(n / 10_000_000)}Cr`;
  if (n >= 1_000_000) return `₹${Math.round(n / 100_000)}L`;
  if (n >= 100_000) return `₹${(n / 100_000).toFixed(1)}L`;
  if (n >= 1_000) return `₹${Math.round(n / 1_000)}K`;
  return `₹${n}`;
}

function sumPayoutBetween(list: Invoice[], from: number, to: number): number {
  return list.reduce((sum, i) => {
    const t = i.createdAt ? new Date(i.createdAt).getTime() : 0;
    return t >= from && t < to ? sum + i.payout : sum;
  }, 0);
}

/** Campaign timelines are stored as "10 Jul - 20 Jul"; the deadline is the end. */
function deadlineOf(timeline?: string): string {
  if (!timeline) return "—";
  const parts = timeline.split("-");
  return (parts[parts.length - 1] ?? timeline).trim();
}

const clampPct = (n: number) => (n > 100 ? 100 : n < 0 ? 0 : n);

/* -------------------------------- backdrop -------------------------------- */
/**
 * Figma's radial fills are ellipses (separate x/y radii). `rx`/`ry` on
 * <RadialGradient> are honoured only by react-native-svg's native backends —
 * they are not SVG attributes, so the DOM renderer drops them and falls back to
 * r="50%", which collapses every glow to a fraction of its size. The portable
 * spelling is a circular gradient of radius `rx` squashed to `ry` by a
 * gradientTransform, which both backends read.
 */
const ellipse = (cy: number, rx: number, ry: number) =>
  `matrix(1 0 0 ${ry / rx} 0 ${cy * (1 - ry / rx)})`;

/** The frame fill: a warm vertical base plus four soft radial glows. */
function Backdrop() {
  return (
    <Svg width={FRAME_W} height={FRAME_H} style={styles.backdrop}>
      <Defs>
        <SvgLinear id="base" x1="187.5" y1="0" x2="187.5" y2={FRAME_H} gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#F7F0E4" />
          <Stop offset="1" stopColor="#F4EBDD" />
        </SvgLinear>
        <RadialGradient
          id="pink"
          cx={285}
          cy={542.5}
          r={1027.5}
          gradientTransform={ellipse(542.5, 1027.5, 568.75)}
          gradientUnits="userSpaceOnUse"
        >
          <Stop offset="0" stopColor="#F7B7DA" stopOpacity="0.34" />
          <Stop offset="0.26" stopColor="#F7B7DA" stopOpacity="0" />
        </RadialGradient>
        <RadialGradient
          id="blue"
          cx={90}
          cy={367.5}
          r={967.5}
          gradientTransform={ellipse(367.5, 967.5, 533.75)}
          gradientUnits="userSpaceOnUse"
        >
          <Stop offset="0" stopColor="#BACDF4" stopOpacity="0.36" />
          <Stop offset="0.24" stopColor="#BACDF4" stopOpacity="0" />
        </RadialGradient>
        <RadialGradient
          id="gold"
          cx={292.5}
          cy={157.5}
          r={1338.75}
          gradientTransform={ellipse(157.5, 1338.75, 735)}
          gradientUnits="userSpaceOnUse"
        >
          <Stop offset="0" stopColor="#F6D64A" stopOpacity="0.22" />
          <Stop offset="0.2" stopColor="#F6D64A" stopOpacity="0" />
        </RadialGradient>
        <RadialGradient
          id="haze"
          cx={75}
          cy={87.5}
          r={1466.25}
          gradientTransform={ellipse(87.5, 1466.25, 805)}
          gradientUnits="userSpaceOnUse"
        >
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

/**
 * The four-paint "warm glass" fill shared by the PRIORITY NOW banner and the
 * revenue-goal card: a 4-stop diagonal base plus pink, gold and white glows.
 * `p` namespaces the gradient ids so two instances cannot collide.
 */
function WarmGlass({ p, w, h, r }: { p: string; w: number; h: number; r: number }) {
  return (
    <Svg width={w} height={h} style={StyleSheet.absoluteFill}>
      <Defs>
        <SvgLinear
          id={`${p}b`}
          x1={0.11 * w}
          y1={-0.21 * h}
          x2={0.89 * w}
          y2={1.21 * h}
          gradientUnits="userSpaceOnUse"
        >
          <Stop offset="0" stopColor="#FFE5A4" stopOpacity="0.82" />
          <Stop offset="0.35" stopColor="#FFF5E4" stopOpacity="0.92" />
          <Stop offset="0.72" stopColor="#F4D3EE" stopOpacity="0.88" />
          <Stop offset="1" stopColor="#CAD9FF" stopOpacity="0.76" />
        </SvgLinear>
        <RadialGradient
          id={`${p}p`}
          cx={0.72 * w}
          cy={0.88 * h}
          r={0.86 * w}
          gradientTransform={ellipse(0.88 * h, 0.86 * w, 1.59 * h)}
          gradientUnits="userSpaceOnUse"
        >
          <Stop offset="0" stopColor="#F7B7DA" stopOpacity="0.4" />
          <Stop offset="0.22" stopColor="#F7B7DA" stopOpacity="0" />
        </RadialGradient>
        <RadialGradient
          id={`${p}g`}
          cx={0.82 * w}
          cy={0.18 * h}
          r={0.93 * w}
          gradientTransform={ellipse(0.18 * h, 0.93 * w, 1.72 * h)}
          gradientUnits="userSpaceOnUse"
        >
          <Stop offset="0" stopColor="#F6D64A" stopOpacity="0.3" />
          <Stop offset="0.18" stopColor="#F6D64A" stopOpacity="0" />
        </RadialGradient>
        <RadialGradient
          id={`${p}h`}
          cx={0.18 * w}
          cy={0.2 * h}
          r={0.93 * w}
          gradientTransform={ellipse(0.2 * h, 0.93 * w, 1.71 * h)}
          gradientUnits="userSpaceOnUse"
        >
          <Stop offset="0" stopColor="#FFFFFF" stopOpacity="0.72" />
          <Stop offset="0.2" stopColor="#FFFFFF" stopOpacity="0" />
        </RadialGradient>
      </Defs>
      <Rect width={w} height={h} rx={r} fill={`url(#${p}b)`} />
      <Rect width={w} height={h} rx={r} fill={`url(#${p}p)`} />
      <Rect width={w} height={h} rx={r} fill={`url(#${p}g)`} />
      <Rect width={w} height={h} rx={r} fill={`url(#${p}h)`} />
    </Svg>
  );
}

/** "Fluid Graph Mock" — 343x100 area + gradient-stroked line, per the spec node. */
function FluidGraph() {
  const line =
    "M0,78 C24.5,78 24.5,58 49,58 C73.5,58 73.5,80 98,80 C122.5,80 122.5,44 147,44 " +
    "C171.5,44 171.5,62 196,62 C220.5,62 220.5,28 245,28 C269.5,28 269.5,46 294,46 " +
    "C318.5,46 318.5,25 343,25";
  return (
    <Svg width={343} height={100}>
      <Defs>
        <SvgLinear id="graphArea" x1="0" y1="24.75" x2="0" y2="99.75" gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#F48FB1" />
          <Stop offset="1" stopColor="#F48FB1" stopOpacity="0" />
        </SvgLinear>
        <SvgLinear id="graphLine" x1="0" y1="0" x2="343" y2="0" gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#B4B7FF" />
          <Stop offset="0.46" stopColor="#FFE094" />
          <Stop offset="1" stopColor="#F69AD2" />
        </SvgLinear>
      </Defs>
      <Path d={`${line} L343,100 L0,100 Z`} fill="url(#graphArea)" opacity={0.4} />
      <Path
        d={line}
        fill="none"
        stroke="url(#graphLine)"
        strokeWidth={4.22}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/* ------------------------------- stat cards ------------------------------- */
interface StatSpec {
  /** Offset inside the 345-wide track, which starts at x=15 in the frame. */
  x: number;
  from: string;
  to: string;
  border: string;
  valueY: number;
  labelW: number;
  chipW: number;
  chipBg: string;
  chipTextW: number;
  chipInk: string;
}

/** Cards 1-3 of "Top: Today's Overview"; card 3 is clipped by the track. */
const STAT_SPECS: StatSpec[] = [
  {
    x: 5, from: "#e6aaff80", to: "#fff6fadb", border: GLASS_W62,
    valueY: 16.77, labelW: 69.03,
    chipW: 79.05, chipBg: "#fadaff", chipTextW: 47.05, chipInk: "#7b1fa2",
  },
  {
    x: 147, from: "#d5ffd7", to: "#fafbffe0", border: GLASS_W90,
    valueY: 17, labelW: 53.78,
    chipW: 62.16, chipBg: "rgba(223,255,224,0.92)", chipTextW: 30.16, chipInk: "#2e7d32",
  },
  {
    x: 289, from: "#bfd3ff7a", to: "#fafbffe0", border: GLASS_W90,
    valueY: 16.77, labelW: 72.53,
    chipW: 61.97, chipBg: "rgba(236,247,255,0.88)", chipTextW: 29.97, chipInk: "#1565c0",
  },
];

function StatCard({
  spec, value, label, delta,
}: { spec: StatSpec; value: string; label: string; delta: string }) {
  return (
    <Abs
      x={spec.x}
      y={5}
      w={130}
      h={110}
      radius={20}
      border={spec.border}
      borderWidth={1}
      style={styles.statCard}
    >
      <LinearGradient
        colors={[spec.from, spec.to] as const}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      {/* Figma sizes this box to its sample string; live totals are longer, so
          it spans the card's inner width instead of clipping to an ellipsis. */}
      <Txt
        x={17}
        y={spec.valueY}
        w={96}
        size={26}
        weight="bold"
        font="inter"
        color={INK}
        lineHeight={26}
        numberOfLines={1}
      >
        {value}
      </Txt>
      <Txt
        x={17}
        y={47}
        w={spec.labelW}
        size={13}
        weight="medium"
        font="inter"
        color={MUTED}
        lineHeight={15.73}
        numberOfLines={1}
      >
        {label}
      </Txt>
      <Abs x={17} y={71} w={spec.chipW} h={22} radius={100} bg={spec.chipBg}>
        <Abs x={8} y={5} w={12} h={12} center>
          <Feather name="trending-up" size={12} color={spec.chipInk} />
        </Abs>
        <Txt
          x={24}
          y={4}
          w={spec.chipTextW}
          size={11}
          weight="semibold"
          font="inter"
          color={spec.chipInk}
          lineHeight={13.31}
          numberOfLines={1}
        >
          {delta}
        </Txt>
      </Abs>
    </Abs>
  );
}

/* ----------------------------- pipeline cards ----------------------------- */
function PipelineCard({
  x, y, from, to, icon, count, label, sub, onPress,
}: {
  x: number; y: number; from: string; to: string; icon: ReactNode;
  count: string; label: string; sub?: string; onPress: () => void;
}) {
  return (
    <Abs
      x={x}
      y={y}
      w={166.5}
      h={112}
      radius={24}
      border={GLASS_W62}
      borderWidth={1}
      style={styles.pipeCard}
    >
      <LinearGradient
        colors={[from, to] as const}
        start={{ x: 0.08, y: -0.11 }}
        end={{ x: 0.92, y: 1.11 }}
        style={StyleSheet.absoluteFill}
      />
      <Pressable onPress={onPress} style={StyleSheet.absoluteFill}>
        <Abs x={119.5} y={15} w={32} h={32} radius={999} bg={GLASS_W46} center>
          {icon}
        </Abs>
        <Txt
          x={17}
          y={19}
          w={132.5}
          size={24}
          weight="bold"
          font="inter"
          color={INK}
          lineHeight={24}
          letterSpacing={-1.2}
        >
          {count}
        </Txt>
        <Txt x={17} y={52} w={132.5} size={14} weight="semibold" font="inter" color={INK} lineHeight={16.8}>
          {label}
        </Txt>
        {sub ? (
          <Txt
            x={17}
            y={78.8}
            w={123.5}
            size={11}
            weight="medium"
            font="inter"
            color="rgba(230,81,0,0.7)"
            lineHeight={13.31}
          >
            {sub}
          </Txt>
        ) : null}
      </Pressable>
    </Abs>
  );
}

/* ----------------------------- campaign cards ----------------------------- */
type CampaignTone = "IN_PROGRESS" | "PENDING" | "LIVE";

interface CampaignVariant {
  from: string;
  to: string;
  start: { x: number; y: number };
  end: { x: number; y: number };
  chipLabel: string;
  chipW: number;
  chipTextW: number;
  chipBg: string;
  chipInk: string;
  bar: string;
  meta: string;
}

const CAMPAIGN_VARIANTS: Record<CampaignTone, CampaignVariant> = {
  IN_PROGRESS: {
    from: "#bfd3ffb8", to: "#f5f9ffeb",
    start: { x: 0.08, y: -0.11 }, end: { x: 0.92, y: 1.11 },
    chipLabel: "IN PROGRESS", chipW: 95.91, chipTextW: 75.91,
    chipBg: "rgba(100,181,246,0.2)", chipInk: "#1e88e5", bar: "#42a5f5", meta: MUTED,
  },
  PENDING: {
    from: "#fff3e0bf", to: "#ffecb3bf",
    start: { x: 0.12, y: -0.23 }, end: { x: 0.88, y: 1.23 },
    chipLabel: "PENDING", chipW: 71.41, chipTextW: 51.41,
    chipBg: "rgba(255,183,77,0.2)", chipInk: "#f57c00", bar: "#ffa726", meta: META_ALT,
  },
  LIVE: {
    from: "#e8f5e9bf", to: "#e0f2f1bf",
    start: { x: 0.36, y: -0.25 }, end: { x: 0.64, y: 1.25 },
    chipLabel: "LIVE", chipW: 45.09, chipTextW: 25.09,
    chipBg: "rgba(129,199,132,0.2)", chipInk: "#388e3c", bar: "#66bb6a", meta: META_ALT,
  },
};

/** DRAFT is still awaiting sign-off, ACTIVE is running, DONE is published. */
function toneOf(status: string): CampaignTone {
  if (status === "DRAFT") return "PENDING";
  if (status === "DONE") return "LIVE";
  return "IN_PROGRESS";
}

interface CampaignRow {
  id: string;
  x: number;
  tone: CampaignTone;
  title: string;
  meta: string;
  ratio: number;
  detail: string;
}

function CampaignCard({ row, onPress }: { row: CampaignRow; onPress: () => void }) {
  const v = CAMPAIGN_VARIANTS[row.tone];
  const chipX = 274 - v.chipW;
  return (
    <Abs
      x={row.x}
      y={5}
      w={295}
      h={160}
      radius={20}
      border={GLASS_W60}
      borderWidth={1}
      style={styles.campaignCard}
    >
      <LinearGradient
        colors={[v.from, v.to] as const}
        start={v.start}
        end={v.end}
        style={StyleSheet.absoluteFill}
      />
      <Txt
        x={21}
        y={21}
        w={chipX - 27}
        size={16}
        weight="bold"
        font="inter"
        color={INK_ALT}
        lineHeight={19.36}
        letterSpacing={-0.32}
        numberOfLines={1}
      >
        {row.title}
      </Txt>
      <Abs x={chipX} y={21} w={v.chipW} h={22} radius={12} bg={v.chipBg}>
        <Txt
          x={10}
          y={4}
          w={v.chipTextW}
          size={11}
          weight="bold"
          font="inter"
          color={v.chipInk}
          lineHeight={13.31}
          letterSpacing={0.22}
          numberOfLines={1}
        >
          {v.chipLabel}
        </Txt>
      </Abs>

      <Txt
        x={21}
        y={49}
        w={253}
        size={13}
        weight="medium"
        font="inter"
        color={v.meta}
        lineHeight={15.73}
        numberOfLines={1}
      >
        {row.meta}
      </Txt>

      <Abs x={21} y={85} w={253} h={4} radius={2} bg="rgba(0,0,0,0.06)" style={styles.clip}>
        <Abs x={0} y={0} w={253 * row.ratio} h={4} radius={2} bg={v.bar} />
      </Abs>

      <Txt
        x={21}
        y={103.9}
        w={225}
        size={12}
        weight="semibold"
        font="inter"
        color="#444444"
        lineHeight={16.8}
        numberOfLines={2}
      >
        {row.detail}
      </Txt>

      <Pressable onPress={onPress} style={styles.campaignArrow}>
        <Feather name="arrow-up-right" size={14} color={INK_ALT} />
      </Pressable>
    </Abs>
  );
}

/* ------------------------- services / reminder rows ------------------------ */
/** The 345x82 glass row used by both "Explore Services" and "Reminders". */
function InfoCard({
  y, from, mid, to, icon, title, subtitle, onPress,
}: {
  y: number; from: string; mid: string; to: string; icon: ReactNode;
  title: string; subtitle?: string; onPress: () => void;
}) {
  return (
    <Abs
      x={15}
      y={y}
      w={345}
      h={82}
      radius={24}
      border={GLASS_W62}
      borderWidth={1}
      style={styles.infoCard}
    >
      <LinearGradient
        colors={[from, mid, to] as const}
        locations={[0, 0.5, 1] as const}
        start={{ x: 0.19, y: -0.79 }}
        end={{ x: 0.81, y: 1.79 }}
        style={StyleSheet.absoluteFill}
      />
      <Pressable onPress={onPress} style={StyleSheet.absoluteFill}>
        <Abs x={17} y={17} w={48} h={48} radius={16} bg={GLASS_W56} center>
          {icon}
        </Abs>
        <Txt
          x={79}
          y={19.96}
          w={211}
          size={16}
          weight="semibold"
          font="inter"
          color={INK}
          lineHeight={19.2}
          numberOfLines={1}
        >
          {title}
        </Txt>
        {subtitle ? (
          <Txt
            x={79}
            y={44.15}
            w={211}
            size={13}
            weight="regular"
            font="inter"
            color={MUTED}
            lineHeight={16.9}
            numberOfLines={1}
          >
            {subtitle}
          </Txt>
        ) : null}
        <Abs x={304} y={29} w={24} h={24} center>
          <Feather name="chevron-right" size={20} color={CHEVRON} />
        </Abs>
      </Pressable>
    </Abs>
  );
}

/* ------------------------------ section title ----------------------------- */
function Heading({ y, w, children }: { y: number; w: number; children: string }) {
  return (
    <Txt x={15} y={y} w={w} size={18} weight="medium" color={INK} lineHeight={20.4} letterSpacing={-0.51}>
      {children}
    </Txt>
  );
}

/* --------------------------------- screen --------------------------------- */
export default function HomeDashboard() {
  const router = useRouter();
  const [period, setPeriod] = useState<Period>("W");

  const { data: me } = useMe();
  const { data: leads = [] } = useLeads();
  const { data: campaigns = [], isLoading: campaignsLoading } = useCampaigns();
  const { data: invoices = [] } = useInvoices();
  const { data: reminders = [], isLoading: remindersLoading } = useReminders();
  const { data: notifications } = useNotifications();

  /* ---- leads: priority banner, today's summary, pipeline matrix ---- */
  const pipeline = useMemo(() => {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const dayStart = startOfToday.getTime();

    return {
      // Nobody owns them yet, so nobody has replied yet.
      unattended: leads.filter((l) => l.status === "NEW" && !l.ownerId).length,
      fresh: leads.filter((l) => l.status === "NEW").length,
      contacted: leads.filter((l) => l.status === "CONTACTED").length,
      won: leads.filter((l) => l.status === "CONVERTED").length,
      today: leads.filter(
        (l) => l.createdAt !== undefined && new Date(l.createdAt).getTime() >= dayStart,
      ).length,
    };
  }, [leads]);

  /* ---- invoices: revenue tile, performance card, goal ring ---- */
  const money = useMemo(() => {
    const paid = invoices.filter((i) => i.status === "PAID");
    const total = paid.reduce((sum, i) => sum + i.payout, 0);

    const now = Date.now();
    const span = PERIOD_DAYS[period] * DAY;
    const current = sumPayoutBetween(paid, now - span, now);
    const previous = sumPayoutBetween(paid, now - span * 2, now - span);
    const deltaPct =
      previous > 0 ? Math.round(((current - previous) / previous) * 100) : 0;

    const target = me?.targetMonthly ?? 200_000;
    const achieved = total;
    const remaining = Math.max(0, target - achieved);
    const pct = target > 0 ? clampPct(Math.round((achieved / target) * 100)) : 0;

    return { total, current, deltaPct, target, achieved, remaining, pct };
  }, [invoices, period, me]);

  /* ---- campaigns: horizontal carousel ---- */
  const campaignRows = useMemo<CampaignRow[]>(
    () =>
      campaigns.map((c, i) => {
        const deliverables = c.peopleCount ?? 0;
        return {
          id: c.id,
          x: 20 + i * 327,
          tone: toneOf(c.status),
          title: c.name,
          meta: c.contactPerson
            ? `Managed by: ${c.contactPerson}`
            : `${deliverables} creators active`,
          ratio: clampPct(c.progress) / 100,
          detail:
            `${inrShort(c.budget)}  •  ${deliverables} ` +
            `${deliverables === 1 ? "Deliverable" : "Deliverables"}\n${deadlineOf(c.timeline)}`,
        };
      }),
    [campaigns],
  );

  const nextReminder = reminders[0];
  const latestActivity = notifications?.items?.[0];

  const goToLeads = () => router.push("/leads/leads");

  return (
    <Screen height={FRAME_H} background="#F7F0E4" scroll>
      <Backdrop />

      {/* ======================= body — Frame 2147223252 ======================= */}
      <Abs x={0} y={BODY_Y} w={FRAME_W} h={BODY_H} style={styles.clip}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled
          contentContainerStyle={{ height: CONTENT_BOTTOM - BODY_Y }}
        >
          {/* One -106 offset, so everything below keeps raw frame coordinates. */}
          <Abs x={0} y={-BODY_Y} w={FRAME_W} h={CONTENT_BOTTOM}>
            {/* ---------------- 1. PRIORITY NOW banner (106 → 288.23) --------------- */}
            <Abs x={15} y={106} w={345} h={182.23} radius={28} style={styles.priority}>
              <WarmGlass p="pri" w={345} h={182.23} r={28} />
              {/* Blurred orb, clipped by the section as in the design. */}
              <Abs x={241} y={-18} w={120} h={120} radius={999} bg="rgba(255,255,255,0.22)" />

              <Abs x={18} y={45.11} w={46} h={46} radius={999} bg="rgba(255,248,241,0.74)" center>
                <MaterialCommunityIcons name="bell-ring-outline" size={22} color={INK} />
              </Abs>

              <Txt
                x={76}
                y={17}
                w={131}
                size={13}
                weight="semibold"
                font="inter"
                color={MUTED}
                lineHeight={13.2}
                numberOfLines={1}
              >
                PRIORITY NOW
              </Txt>
              <Txt x={76} y={36.23} w={189} size={24} weight="bold" color={INK} lineHeight={28} letterSpacing={-1.62}>
                {`${pipeline.unattended} leads need\nattention`}
              </Txt>
              <Txt
                x={76}
                y={98.34}
                w={156.58}
                size={14}
                weight="regular"
                font="inter"
                color={MUTED}
                lineHeight={18.9}
                numberOfLines={1}
              >
                From your landing page
              </Txt>

              <Pressable onPress={goToLeads} style={styles.priorityArrow}>
                <Feather name="arrow-right" size={20} color={ICON_ON_DARK} />
              </Pressable>

              <Abs x={18} y={132.23} w={94.52} h={32} radius={999} bg="rgba(255,248,241,0.62)" border={GLASS_W60} borderWidth={1}>
                <Txt x={13} y={8.5} w={68.52} size={12} weight="semibold" font="inter" color={INK} lineHeight={14.52} align="center">
                  Warm leads
                </Txt>
              </Abs>
              <Abs x={120.52} y={132.23} w={89.25} h={32} radius={999} bg="rgba(255,248,241,0.62)" border={GLASS_W60} borderWidth={1}>
                <Txt x={13} y={8.5} w={63.25} size={12} weight="semibold" font="inter" color={INK} lineHeight={14.52} align="center">
                  High intent
                </Txt>
              </Abs>
              <Pressable onPress={goToLeads} style={styles.reviewChip}>
                <Txt x={13} y={8.5} w={69.28} size={12} weight="semibold" font="inter" color={INK} lineHeight={14.52} align="center">
                  Review now
                </Txt>
              </Pressable>
            </Abs>

            {/* ------------------- 2. Today's Summary heading (306) ----------------- */}
            <Heading y={314.23} w={345}>
              Today’s Summary
            </Heading>

            {/* ---------------- 3. stat cards (353.23 → 473.23) ---------------------
                "Top: Today's Overview" is 345 wide and clipsContent, so card 3
                is cut off at x=360 rather than running to the frame edge. */}
            <Abs x={15} y={353.23} w={345} h={120} style={styles.clip}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.statTrack}
              >
                <StatCard
                  spec={STAT_SPECS[0]}
                  value={`${pipeline.fresh}`}
                  label="New Leads"
                  delta={`+${pipeline.today} today`}
                />
                <StatCard
                  spec={STAT_SPECS[1]}
                  value={inrShort(money.total)}
                  label="Revenue"
                  delta="+18%"
                />
                <StatCard spec={STAT_SPECS[2]} value="347" label="Page Views" delta="+12%" />
              </ScrollView>
            </Abs>

            {/* -------------- 4. Lead Pipeline matrix (491.23 → 826.24) ------------- */}
            <Heading y={501.24} w={345}>
              Lead Pipeline
            </Heading>

            <PipelineCard
              x={15}
              y={536.24}
              from="#ffe28ab8"
              to="#fff8eceb"
              icon={<Feather name="inbox" size={16} color={INK} />}
              count={pad2(pipeline.unattended)}
              label="Unattended"
              sub="Needs response"
              onPress={goToLeads}
            />
            <PipelineCard
              x={193.5}
              y={536.24}
              from="#dde8b9b8"
              to="#f8fceeeb"
              icon={<Ionicons name="sparkles-outline" size={16} color={INK} />}
              count={pad2(pipeline.fresh)}
              label="New"
              onPress={goToLeads}
            />
            <PipelineCard
              x={15}
              y={660.24}
              from="#e5daefdb"
              to="#f9f4fcf0"
              icon={<MaterialCommunityIcons name="forum-outline" size={16} color={INK} />}
              count={pad2(pipeline.contacted)}
              label="Contacted"
              onPress={goToLeads}
            />
            <PipelineCard
              x={193.5}
              y={660.24}
              from="#bfd3ffb8"
              to="#f5f9ffeb"
              icon={<MaterialCommunityIcons name="check-decagram-outline" size={16} color={INK} />}
              count={pad2(pipeline.won)}
              label="Won"
              onPress={goToLeads}
            />

            <Pressable onPress={goToLeads} style={styles.viewAllLeads}>
              <Txt x={16} y={8} w={86.03} size={13} weight="semibold" font="inter" color={CTA_INK} lineHeight={15.73}>
                View all leads
              </Txt>
              <Abs x={106.04} y={9} w={14} h={14} center>
                <Feather name="arrow-up-right" size={14} color={CTA_INK} />
              </Abs>
            </Pressable>

            {/* ------------ 5. Revenue Goal / PERFORMANCE (844.24 → 1097) ----------- */}
            <Heading y={854.24} w={205}>
              Revenue Goal
            </Heading>

            <Abs
              x={15}
              y={889.24}
              w={345}
              h={208}
              radius={40}
              bg="rgba(255,255,255,0.5)"
              border={GLASS_W80}
              borderWidth={1}
              style={styles.performance}
            >
              <Abs x={1} y={107} w={343} h={100}>
                <FluidGraph />
              </Abs>

              {/* Text node is 106 wide, its container 136; use the container so
                  the tracked-out label cannot wrap on a wider font metric. */}
              <Txt
                x={25}
                y={33}
                w={136}
                size={13}
                weight="semibold"
                font="inter"
                color={MUTED}
                lineHeight={15.73}
                letterSpacing={0.65}
                numberOfLines={1}
              >
                PERFORMANCE
              </Txt>
              <Txt
                x={25}
                y={57}
                w={160}
                size={28}
                weight="bold"
                font="inter"
                color={INK}
                lineHeight={33.89}
                letterSpacing={-0.56}
                numberOfLines={1}
              >
                {`₹${inr(money.current)}`}
              </Txt>

              <Abs x={25} y={95} w={136} h={24} radius={12} bg="rgba(76,175,80,0.15)">
                <Abs x={10} y={5} w={14} h={14} center>
                  <Feather name="trending-up" size={14} color="#2e7d32" />
                </Abs>
                <Txt
                  x={28}
                  y={4}
                  w={98}
                  size={13}
                  weight="semibold"
                  font="inter"
                  color="#2e7d32"
                  lineHeight={15.73}
                  numberOfLines={1}
                >
                  {`${money.deltaPct >= 0 ? "+" : ""}${money.deltaPct}% ${PERIOD_SUFFIX[period]}`}
                </Txt>
              </Abs>

              <Abs
                x={197}
                y={33}
                w={123}
                h={37}
                radius={20}
                bg="rgba(255,255,255,0.4)"
                border={GLASS_W70}
                borderWidth={1}
                style={styles.segment}
              >
                {([
                  { key: "M" as Period, x: 5, w: 35 },
                  { key: "W" as Period, x: 44, w: 37 },
                  { key: "Y" as Period, x: 85, w: 33 },
                ]).map((s) => {
                  const active = s.key === period;
                  return (
                    <Pressable
                      key={s.key}
                      onPress={() => setPeriod(s.key)}
                      style={[
                        styles.segmentItem,
                        { left: s.x, width: s.w },
                        active ? styles.segmentActive : null,
                      ]}
                    >
                      <Txt
                        y={6}
                        w={s.w}
                        size={12}
                        weight="semibold"
                        font="inter"
                        color={active ? colors.white : "#444444"}
                        lineHeight={14.52}
                        align="center"
                      >
                        {s.key}
                      </Txt>
                    </Pressable>
                  );
                })}
              </Abs>
            </Abs>

            {/* ------------- 6. goal progress group (1115.24 → 1312.24) ------------ */}
            <Abs
              x={15}
              y={1125.24}
              w={345}
              h={187}
              radius={20}
              border={GLASS_W60}
              borderWidth={1}
              style={styles.goal}
            >
              <WarmGlass p="goal" w={345} h={187} r={20} />

              <Txt
                x={17}
                y={16}
                w={245.97}
                size={18}
                weight="semibold"
                font="inter"
                color={INK}
                lineHeight={22.5}
                numberOfLines={1}
              >
                {`${compact(money.target)} revenue target`}
              </Txt>
              <Abs x={278} y={17} w={50} h={31} radius={999} bg="rgba(255,255,255,0.61)" border={GLASS_W62} borderWidth={1}>
                <Txt x={12} y={8} w={26} size={12} weight="medium" font="inter" color={INK} lineHeight={14.52}>
                  {`${money.pct}%`}
                </Txt>
              </Abs>

              <Abs
                x={17}
                y={67}
                w={301}
                h={13}
                radius={13.54}
                bg="rgba(255,255,255,0.4)"
                border={GLASS_W70}
                borderWidth={0.75}
                style={styles.clip}
              >
                <Abs
                  x={0.92}
                  y={0.75}
                  w={(299.16 * money.pct) / 100}
                  h={11.04}
                  radius={13.54}
                  style={styles.goalFill}
                >
                  <LinearGradient
                    colors={["#fff8b4eb", "#ffe8add1", "#f7b0eae0", "#a0b8f3c2"] as const}
                    locations={[0.35, 0.4, 0.72, 1] as const}
                    start={{ x: -0.1, y: -0.02 }}
                    end={{ x: 0.89, y: 0.67 }}
                    style={StyleSheet.absoluteFill}
                  />
                </Abs>
              </Abs>

              <Txt x={17} y={94} w={311} size={13} weight="medium" font="inter" color={MUTED} lineHeight={18.2} numberOfLines={1}>
                {`${compact(money.achieved)} achieved · ${compact(money.remaining)} to go`}
              </Txt>

              <Txt x={17} y={129.5} w={131} size={13} weight="medium" font="inter" color={MUTED} lineHeight={18.2}>
                {"Keep nurturing warm\nleads to close faster"}
              </Txt>

              <Pressable
                onPress={() => router.push("/home/set-revenue-target")}
                style={styles.setTarget}
              >
                <Abs x={16} y={9} w={24} h={24} center>
                  <Feather name="target" size={18} color={colors.white} />
                </Abs>
                <Txt x={48} y={12.5} w={68.64} size={14} weight="medium" font="inter" color={colors.white} lineHeight={16.94} align="center">
                  Set Target
                </Txt>
              </Pressable>
            </Abs>

            {/* ------------ 7. Active Campaigns carousel (1330.24 → 1535.24) -------- */}
            <Heading y={1330.24} w={171}>
              Active Campaigns
            </Heading>

            <Abs x={0} y={1365.24} w={FRAME_W} h={170}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{
                  width: campaignRows.length > 0 ? 335 + (campaignRows.length - 1) * 327 : FRAME_W,
                  height: 170,
                }}
              >
                {campaignRows.map((row) => (
                  <CampaignCard
                    key={row.id}
                    row={row}
                    onPress={() => router.push("/campaigns/active-campaigns")}
                  />
                ))}
                {!campaignsLoading && campaignRows.length === 0 ? (
                  <Txt x={20} y={26} w={253} size={13} weight="medium" font="inter" color={MUTED} lineHeight={15.73}>
                    No campaigns
                  </Txt>
                ) : null}
              </ScrollView>
            </Abs>

            {/* -------------- 8. Explore Services (1553.24 → 1734.24) -------------- */}
            <Heading y={1563.24} w={345}>
              Explore Services
            </Heading>

            <InfoCard
              y={1598.24}
              from="#fff8f1e5"
              mid="#f7b7da2e"
              to="#bfd3ff2e"
              icon={<Feather name="video" size={22} color={INK} />}
              title="Videographers & Editors"
              subtitle="Find your creative experts"
              onPress={() => router.push("/services/videographers")}
            />

            <Pressable
              onPress={() => router.push("/campaigns/all-requests")}
              style={styles.viewRequests}
            >
              <Txt x={16} y={8} w={95} size={13} weight="semibold" font="inter" color={CTA_INK} lineHeight={15.73}>
                View Requests
              </Txt>
              <Abs x={115.01} y={9} w={14} h={14} center>
                <Feather name="arrow-up-right" size={14} color={CTA_INK} />
              </Abs>
            </Pressable>

            {/* ----------------- 9a. Reminders (1752.24 → 1879.24) ----------------- */}
            <Heading y={1762.24} w={345}>
              Reminders
            </Heading>

            <InfoCard
              y={1797.24}
              from="#fff8f1e5"
              mid="#b7f7ed2e"
              to="#feffbf2e"
              icon={<Feather name="check-circle" size={22} color={INK} />}
              title={nextReminder ? nextReminder.title : remindersLoading ? "" : "No reminders"}
              subtitle={nextReminder ? whenLabel(nextReminder.dueAt) : undefined}
              onPress={() => router.push("/reminders/reminders")}
            />

            {/* ------------------ 9b. Activity (1897.24 → 2033.24) ----------------- */}
            <Heading y={1907.24} w={345}>
              Activity
            </Heading>

            {/* The stacked card peeking out below the front row. */}
            <Abs
              x={28.08}
              y={1955.6}
              w={318.84}
              h={77.28}
              radius={20}
              bg="rgba(255,255,255,0.45)"
              border={GLASS_W90}
              borderWidth={1}
              opacity={0.6}
              style={styles.activityBack}
            />
            <Abs
              x={15}
              y={1942.24}
              w={345}
              h={84}
              radius={24}
              border={GLASS_W62}
              borderWidth={1}
              style={styles.activityCard}
            >
              <LinearGradient
                colors={["#fff8f1e5", "#d6b7f72e", "#fffdbf2e"] as const}
                locations={[0, 0.5, 1] as const}
                start={{ x: 0.19, y: -0.79 }}
                end={{ x: 0.81, y: 1.79 }}
                style={StyleSheet.absoluteFill}
              />
              <Pressable
                onPress={() => router.push("/system/notifications" as never)}
                style={StyleSheet.absoluteFill}
              >
                <Abs x={17} y={18} w={48} h={48} radius={16} bg={GLASS_W56} center>
                  <Feather name="bell" size={20} color={INK} />
                </Abs>
                <Txt
                  x={81}
                  y={23}
                  w={207}
                  size={15}
                  weight="semibold"
                  font="inter"
                  color={INK}
                  lineHeight={18.15}
                  numberOfLines={1}
                >
                  {latestActivity ? latestActivity.title : "No activity"}
                </Txt>
                {latestActivity ? (
                  <Txt
                    x={81}
                    y={45}
                    w={207}
                    size={13}
                    weight="regular"
                    font="inter"
                    color={MUTED}
                    lineHeight={15.73}
                    numberOfLines={1}
                  >
                    {whenLabel(latestActivity.createdAt)}
                  </Txt>
                ) : null}
                <Abs x={304} y={30} w={24} h={24} center>
                  <Feather name="chevron-right" size={20} color={CHEVRON} />
                </Abs>
              </Pressable>
            </Abs>
          </Abs>
        </ScrollView>
      </Abs>

      {/* ============================== header ============================== */}
      <Abs x={15} y={20} w={56} h={56} radius={999} style={styles.avatarRing}>
        <LinearGradient
          colors={["#f6d64a", "#f7b7da", "#bfd3ff"] as const}
          locations={[0, 0.5, 1] as const}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[StyleSheet.absoluteFill, styles.round]}
        />
        {me?.avatarUrl ? (
          <Image source={{ uri: me.avatarUrl }} style={styles.avatarImage} />
        ) : null}
      </Abs>

      <Txt x={81} y={20} w={167} size={15} weight="medium" font="inter" color={MUTED} lineHeight={19.5}>
        {greetingFor(new Date().getHours())}
      </Txt>
      <Txt
        x={81}
        y={46}
        w={167}
        size={20}
        weight="medium"
        color={INK}
        lineHeight={30.24}
        letterSpacing={-1.4}
        numberOfLines={1}
      >
        {me?.name ?? "Sophia Roy"}
      </Txt>

      <Pressable onPress={() => router.push("/chat/chat" as never)} style={[styles.headerButton, styles.headerChat]}>
        <Feather name="message-circle" size={20} color={ICON_ON_DARK} />
      </Pressable>
      <Pressable
        onPress={() => router.push("/system/notifications" as never)}
        style={[styles.headerButton, styles.headerBell]}
      >
        <Feather name="bell" size={20} color={ICON_ON_DARK} />
      </Pressable>

      {/* ============================= tab bar ============================== */}
      <Abs
        x={16}
        y={776.69}
        w={343}
        h={76}
        radius={30}
        bg="rgba(255,255,255,0.54)"
        border="rgba(248,248,248,0.76)"
        borderWidth={1}
        style={styles.tabBar}
      >
        <Abs x={30.62} y={13.5} w={34} h={34} radius={14} bg="#f8f3ff" center>
          <Feather name="home" size={20} color="#b88bff" />
        </Abs>
        <Txt x={30.12} y={51.5} w={35} size={12} weight="semibold" font="inter" color="#b88bff" lineHeight={11} align="center">
          Home
        </Txt>

        <Pressable onPress={goToLeads} style={[styles.tabItem, { left: 87.88 }]}>
          <Feather name="users" size={20} color="#9a8ea3" />
        </Pressable>
        <Txt x={87.38} y={51.5} w={35} size={12} weight="medium" font="inter" color="#9a8ea3" lineHeight={11} align="center">
          Leads
        </Txt>

        <Pressable onPress={() => router.push("/planner/planner-month" as never)} style={[styles.tabItem, { left: 221.12 }]}>
          <Feather name="calendar" size={20} color="#9a8ea3" />
        </Pressable>
        <Txt x={216.12} y={51.5} w={44} size={12} weight="medium" font="inter" color="#9a8ea3" lineHeight={11} align="center">
          Planner
        </Txt>

        <Pressable
          onPress={() => router.push("/reminders/reminders")}
          style={[styles.tabItem, { left: 278.38 }]}
        >
          <MaterialIcons name="list-alt" size={20} color="#9a8ea3" />
        </Pressable>
        <Txt x={267.88} y={51.5} w={55} size={12} weight="medium" font="inter" color="#9a8ea3" lineHeight={11} align="center">
          Reminder
        </Txt>
      </Abs>

      {/* Centre FAB — overlaps the bar's top edge, so it is drawn as a sibling. */}
      <Pressable onPress={() => router.push("/reminders/add-reminder")} style={styles.fab}>
        <LinearGradient
          colors={["#f7b7da", "#c7b0ff"] as const}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[StyleSheet.absoluteFill, styles.fabFill]}
        />
        <Feather name="plus" size={20} color="#000000" />
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  backdrop: { position: "absolute", left: 0, top: 0 },
  clip: { overflow: "hidden" },
  round: { borderRadius: 999 },

  /* --- body sections --- */
  priority: {
    overflow: "hidden",
    shadowColor: "#583E21",
    shadowOpacity: 0.08,
    shadowRadius: 40,
    shadowOffset: { width: 0, height: 20 },
    elevation: 3,
  },
  priorityArrow: {
    position: "absolute",
    left: 287,
    top: 18,
    width: 40,
    height: 40,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: DARK_PILL,
    shadowColor: "#1F1A17",
    shadowOpacity: 0.16,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 4,
  },
  reviewChip: {
    position: "absolute",
    left: 217.77,
    top: 132.23,
    width: 95.28,
    height: 32,
    borderRadius: 999,
    backgroundColor: "rgba(255,248,241,0.62)",
    borderWidth: 1,
    borderColor: GLASS_W60,
  },

  statTrack: { width: 424, height: 120 },
  statCard: {
    overflow: "hidden",
    shadowColor: "#4A3722",
    shadowOpacity: 0.06,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 2,
  },

  pipeCard: {
    overflow: "hidden",
    shadowColor: "#4A3722",
    shadowOpacity: 0.06,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 2,
  },

  viewAllLeads: {
    position: "absolute",
    left: 119.48,
    top: 794.24,
    width: 136.04,
    height: 32,
    borderRadius: 100,
    backgroundColor: CTA_FILL,
    borderWidth: 1,
    borderColor: GLASS_W60,
  },

  performance: {
    overflow: "hidden",
    shadowColor: "#9B8AF4",
    shadowOpacity: 0.15,
    shadowRadius: 40,
    shadowOffset: { width: 0, height: 12 },
    elevation: 3,
  },
  segment: {
    shadowColor: "#000000",
    shadowOpacity: 0.05,
    shadowRadius: 32,
    shadowOffset: { width: 0, height: 8 },
  },
  segmentItem: {
    position: "absolute",
    top: 5,
    height: 27,
    borderRadius: 16,
  },
  segmentActive: {
    backgroundColor: "#302b27",
    shadowColor: "#000000",
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },

  goal: {
    shadowColor: "#583E21",
    shadowOpacity: 0.06,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 2,
  },
  setTarget: {
    position: "absolute",
    left: 195.36,
    top: 127,
    width: 132.64,
    height: 42,
    borderRadius: 999,
    backgroundColor: CTA_INK,
  },
  goalFill: {
    overflow: "hidden",
    shadowColor: "#F48FB1",
    shadowOpacity: 0.8,
    shadowRadius: 12.04,
    shadowOffset: { width: 0, height: 0 },
  },

  campaignCard: {
    overflow: "hidden",
    shadowColor: "#000000",
    shadowOpacity: 0.04,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
    elevation: 2,
  },
  campaignArrow: {
    position: "absolute",
    left: 246,
    top: 110.59,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: GLASS_W70,
    shadowColor: "#000000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },

  infoCard: {
    overflow: "hidden",
    shadowColor: "#4A3722",
    shadowOpacity: 0.06,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 2,
  },
  viewRequests: {
    position: "absolute",
    left: 115,
    top: 1702.24,
    width: 145.01,
    height: 32,
    borderRadius: 100,
    backgroundColor: CTA_FILL,
    borderWidth: 1,
    borderColor: GLASS_W60,
  },

  activityBack: {
    shadowColor: "#000000",
    shadowOpacity: 0.04,
    shadowRadius: 32,
    shadowOffset: { width: 0, height: 12 },
  },
  activityCard: {
    overflow: "hidden",
    shadowColor: "#000000",
    shadowOpacity: 0.04,
    shadowRadius: 32,
    shadowOffset: { width: 0, height: 12 },
    elevation: 2,
  },

  /* --- header --- */
  avatarRing: {
    overflow: "hidden",
    shadowColor: "#1F1A17",
    shadowOpacity: 0.08,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },
  avatarImage: { position: "absolute", left: 3, top: 3, width: 50, height: 50, borderRadius: 25 },
  headerButton: {
    position: "absolute",
    top: 20,
    width: 40,
    height: 40,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: DARK_PILL,
    shadowColor: "#1F1A17",
    shadowOpacity: 0.16,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 4,
  },
  headerChat: { left: 258 },
  headerBell: { left: 310 },

  /* --- tab bar --- */
  tabBar: {
    shadowColor: "#000000",
    shadowOpacity: 0.1,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 8,
  },
  tabItem: {
    position: "absolute",
    top: 13.5,
    width: 34,
    height: 34,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  fab: {
    position: "absolute",
    left: 156.5,
    top: 770.69,
    width: 62,
    height: 62,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000000",
    shadowOpacity: 0.25,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 10,
  },
  fabFill: { borderRadius: 999 },
});
