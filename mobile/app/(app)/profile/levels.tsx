import { Fragment } from "react";
import type { ComponentProps } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Defs, RadialGradient, Rect, Stop } from "react-native-svg";
import { Abs, Screen, Txt } from "../../../src/ui/Frame";
import { colors } from "../../../src/theme";
import { useCampaigns } from "../../../src/api/hooks";

/**
 * Levels — "Your Growth Path", Figma 7358:26946 (375x875 frame).
 *
 * Reached from "Explore levels" on the profile. The ladder descends L5 -> L1
 * down a masked timeline rail; the creator's own level (3) is the expanded
 * card carrying the perk chips. The frame is authored 875 tall but its cards
 * run to y=1159.5, so the canvas is sized to the content and scrolls.
 *
 * Coordinates below are raw frame coordinates from the spec; <Screen> scales
 * the 375pt canvas to the device.
 */

/* ------------------------------- geometry -------------------------------- */
const FRAME_W = 375;
const CONTENT_H = 1159.5; // Level 1 card bottom — the true scroll extent

const CARD_X = 60;
const CARD_W = 295;
const DOT_X = 31;
const PERK_STEP = 51; // 662.27 -> 713.27 -> 764.27 -> 815.27

/* --------------------------- spec colour tokens --------------------------- */
const INK_TITLE = "#1A1525";
const INK_BODY = "#6B627A";
const INK_MUTED = "#7A7188";
const INK_PERK = "#3A2A5A";
const PERK_ICON = "#8A5A9A";
const DIVIDER = "rgba(150,140,180,0.5)";
const GLASS_75 = "rgba(255,255,255,0.75)";
const BORDER_90 = "rgba(255,255,255,0.9)";
const WHITE_90 = "rgba(255,255,255,0.9)";

type IconName = ComponentProps<typeof Feather>["name"];
type Shadow = { color: string; opacity: number; radius: number; dy: number };
type Grad = {
  from: string;
  to: string;
  start: { x: number; y: number };
  end: { x: number; y: number };
};

/* ------------------------------ the ladder -------------------------------- */
interface StatusChip {
  label: string;
  x: number;
  y: number;
  w: number;
  bg: string;
  ink: string;
  tx: number;
  ty: number;
  tw: number;
  glow?: Shadow;
}

interface LevelRow {
  key: string;
  y: number;
  h: number;
  fill: string | Grad;
  stroke: string;
  shadow: Shadow;
  lock?: boolean;
  title: string;
  titleX: number;
  titleY: number;
  titleW: number;
  titleInk: string;
  status: StatusChip;
  desc: string;
  descY: number;
  descLines: number;
  descInk: string;
  dot: { y: number; fill: string; stroke: string; glow?: Shadow };
}

const SOFT_GLOW = { start: { x: 0.17, y: -0.49 }, end: { x: 0.83, y: 1.49 } };

/** L5, L4, L2 and L1 share one card layout; L3 is the expanded active card. */
const LEVELS: LevelRow[] = [
  {
    key: "5",
    y: 240,
    h: 102,
    fill: "rgba(255,255,255,0.3)",
    stroke: "rgba(255,255,255,0.4)",
    shadow: { color: "#000000", opacity: 0.02, radius: 12, dy: 4 },
    lock: true,
    title: "Level 5",
    titleX: 109,
    titleY: 266.5,
    titleW: 62.7,
    titleInk: INK_MUTED,
    status: {
      label: "LOCKED",
      x: 265.75,
      y: 265,
      w: 64.25,
      bg: "rgba(0,0,0,0.05)",
      ink: INK_MUTED,
      tx: 275.75,
      ty: 271,
      tw: 44.25,
    },
    desc: "Ultimate creator benefits",
    descY: 297,
    descLines: 1,
    descInk: INK_MUTED,
    dot: { y: 271, fill: "rgba(255,255,255,0.6)", stroke: "rgba(154,145,168,0.3)" },
  },
  {
    key: "4",
    y: 366,
    h: 121.29,
    fill: {
      from: "rgba(240,248,255,0.85)",
      to: "rgba(220,240,255,0.7)",
      start: { x: 0.15, y: -0.36 },
      end: { x: 0.85, y: 1.36 },
    },
    stroke: "#B4DCFF",
    shadow: { color: "#B4DCFF", opacity: 0.4, radius: 28, dy: 12 },
    title: "Level 4",
    titleX: 85,
    titleY: 392.5,
    titleW: 63.69,
    titleInk: INK_TITLE,
    status: {
      label: "NEXT UP",
      x: 262.78,
      y: 391,
      w: 67.22,
      bg: colors.white,
      ink: "#3A7ABF",
      tx: 272.78,
      ty: 397,
      tw: 47.22,
      glow: { color: "#B4DCFF", opacity: 0.6, radius: 8, dy: 2 },
    },
    desc: "Advanced brand deals & custom\nanalytics",
    descY: 422.29,
    descLines: 2,
    descInk: INK_BODY,
    dot: {
      y: 397,
      fill: "#E1F0FF",
      stroke: "#80C0FF",
      glow: { color: "#80C0FF", opacity: 0.8, radius: 12, dy: 0 },
    },
  },
  {
    key: "2",
    y: 911.5,
    h: 122,
    fill: {
      from: "rgba(230,250,240,0.8)",
      to: "rgba(210,245,225,0.6)",
      ...SOFT_GLOW,
    },
    stroke: "rgba(190,240,210,0.9)",
    shadow: { color: "#B4E6C8", opacity: 0.3, radius: 24, dy: 8 },
    title: "Level 2",
    titleX: 85,
    titleY: 938,
    titleW: 62.77,
    titleInk: INK_TITLE,
    status: {
      label: "COMPLETED",
      x: 238.53,
      y: 936.5,
      w: 91.47,
      bg: WHITE_90,
      ink: "#2E8B57",
      tx: 252.53,
      ty: 942.5,
      tw: 67.47,
      glow: { color: "#B4E6C8", opacity: 0.4, radius: 8, dy: 2 },
    },
    desc: "Managed Leads & Social Media Strategies",
    descY: 968.5,
    descLines: 2,
    descInk: INK_BODY,
    dot: {
      y: 942.5,
      fill: "#4CAF50",
      stroke: colors.white,
      glow: { color: "#4CAF50", opacity: 0.6, radius: 12, dy: 0 },
    },
  },
  {
    key: "1",
    y: 1057.5,
    h: 102,
    fill: {
      from: "rgba(255,240,230,0.8)",
      to: "rgba(255,225,200,0.6)",
      ...SOFT_GLOW,
    },
    stroke: "rgba(255,210,180,0.9)",
    shadow: { color: "#FFC8A0", opacity: 0.3, radius: 24, dy: 8 },
    title: "Level 1 / Free",
    titleX: 93,
    titleY: 1084,
    titleW: 113.25,
    titleInk: INK_TITLE,
    status: {
      label: "STARTER",
      x: 260.31,
      y: 1082.5,
      w: 69.69,
      bg: WHITE_90,
      ink: "#C06014",
      tx: 270.31,
      ty: 1088.5,
      tw: 49.69,
    },
    desc: "Profile setup & limited connections",
    descY: 1114.5,
    descLines: 1,
    descInk: INK_BODY,
    dot: {
      y: 1088.5,
      fill: "#E57C3C",
      stroke: colors.white,
      glow: { color: "#E57C3C", opacity: 0.6, radius: 12, dy: 0 },
    },
  },
];

/** Perks unlocked at Level 3 — the three chips stacked inside the active card. */
const PERKS: { label: string; y: number; w: number; icon: IconName }[] = [
  { label: "Managed Leads", y: 662.27, w: 161.13, icon: "briefcase" },
  { label: "Social Media Strategies", y: 662.27 + PERK_STEP, w: 209.59, icon: "trending-up" },
  { label: "Collab Video Shoots", y: 662.27 + PERK_STEP * 2, w: 188.57, icon: "video" },
];

/** The brand-logo chip sits one step below the last perk. */
const BRAND_CHIP_Y = 662.27 + PERK_STEP * 3;

/* -------------------------------- backdrop -------------------------------- */
/** Frame fill: a lilac base washed with four soft corner glows. */
function Backdrop() {
  return (
    <Svg width={FRAME_W} height={CONTENT_H} style={styles.backdrop}>
      <Defs>
        <RadialGradient id="glowBlue" cx="300" cy="875" rx="382.5" ry="1417.5" gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#DCEBFF" stopOpacity="0.7" />
          <Stop offset="0.6" stopColor="#DCEBFF" stopOpacity="0" />
        </RadialGradient>
        <RadialGradient id="glowMint" cx="0" cy="612.5" rx="408.75" ry="1531.25" gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#D2F5EB" stopOpacity="0.6" />
          <Stop offset="0.5" stopColor="#D2F5EB" stopOpacity="0" />
        </RadialGradient>
        <RadialGradient id="glowRose" cx="375" cy="262.5" rx="408.75" ry="1531.25" gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#FFDAE0" stopOpacity="0.6" />
          <Stop offset="0.5" stopColor="#FFDAE0" stopOpacity="0" />
        </RadialGradient>
        <RadialGradient id="glowLilac" cx="187.5" cy="0" rx="300" ry="1120" gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#E6E6FA" stopOpacity="0.8" />
          <Stop offset="0.6" stopColor="#E6E6FA" stopOpacity="0" />
        </RadialGradient>
      </Defs>
      <Rect width={FRAME_W} height={CONTENT_H} fill="#FAF8FC" />
      <Rect width={FRAME_W} height={CONTENT_H} fill="url(#glowBlue)" />
      <Rect width={FRAME_W} height={CONTENT_H} fill="url(#glowMint)" />
      <Rect width={FRAME_W} height={CONTENT_H} fill="url(#glowRose)" />
      <Rect width={FRAME_W} height={CONTENT_H} fill="url(#glowLilac)" />
    </Svg>
  );
}

/* ------------------------------- level card ------------------------------- */
function LevelCard({ row }: { row: LevelRow }) {
  const grad = typeof row.fill === "string" ? null : row.fill;
  const { status, dot } = row;

  return (
    <>
      <Abs
        x={CARD_X}
        y={row.y}
        w={CARD_W}
        h={row.h}
        radius={28}
        bg={grad ? undefined : (row.fill as string)}
        border={row.stroke}
        borderWidth={1}
        style={[
          styles.card,
          {
            shadowColor: row.shadow.color,
            shadowOpacity: row.shadow.opacity,
            shadowRadius: row.shadow.radius,
            shadowOffset: { width: 0, height: row.shadow.dy },
          },
        ]}
      >
        {grad ? (
          <LinearGradient
            colors={[grad.from, grad.to] as const}
            start={grad.start}
            end={grad.end}
            style={styles.fillAll}
          />
        ) : null}
      </Abs>

      {row.lock ? (
        <Abs x={85} y={269} w={16} h={16} center>
          <Feather name="lock" size={16} color={INK_MUTED} />
        </Abs>
      ) : null}

      <Txt
        x={row.titleX}
        y={row.titleY}
        w={row.titleW}
        size={18}
        weight="bold"
        font="inter"
        color={row.titleInk}
        lineHeight={21.78}
        numberOfLines={1}
      >
        {row.title}
      </Txt>

      <Abs
        x={status.x}
        y={status.y}
        w={status.w}
        h={24}
        radius={12}
        bg={status.bg}
        style={
          status.glow
            ? {
                shadowColor: status.glow.color,
                shadowOpacity: status.glow.opacity,
                shadowRadius: status.glow.radius,
                shadowOffset: { width: 0, height: status.glow.dy },
              }
            : undefined
        }
      />
      <Txt
        x={status.tx}
        y={status.ty}
        w={status.tw}
        size={10}
        weight="bold"
        font="inter"
        color={status.ink}
        lineHeight={12.1}
        letterSpacing={0.5}
      >
        {status.label}
      </Txt>

      <Txt
        x={85}
        y={row.descY}
        w={245}
        size={14}
        weight="medium"
        font="inter"
        color={row.descInk}
        lineHeight={19.6}
        numberOfLines={row.descLines}
      >
        {row.desc}
      </Txt>

      <Abs
        x={DOT_X}
        y={dot.y}
        w={10}
        h={10}
        radius={5}
        bg={dot.fill}
        border={dot.stroke}
        borderWidth={2}
        style={
          dot.glow
            ? {
                shadowColor: dot.glow.color,
                shadowOpacity: dot.glow.opacity,
                shadowRadius: dot.glow.radius,
                shadowOffset: { width: 0, height: dot.glow.dy },
              }
            : undefined
        }
      />
    </>
  );
}

/* --------------------------------- screen --------------------------------- */
export default function Levels() {
  const router = useRouter();
  const { data: campaigns = [] } = useCampaigns();

  // The perk row's brand chip carries a real collab brand; the card only has
  // room for one, so the design's single chip renders the first live brand and
  // falls back to the spec literal while the list is loading or empty.
  const brand = campaigns.find((c) => !!c.brandName)?.brandName ?? "Fitelo";

  return (
    <Screen height={CONTENT_H} background="#FAF8FC" scroll>
      <Backdrop />

      {/* Header */}
      <Pressable
        onPress={() => router.back()}
        style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
      >
        <Feather name="arrow-left" size={20} color="#1C1C1E" />
      </Pressable>
      <Txt
        x={119}
        y={30}
        w={148}
        size={16}
        weight="bold"
        font="inter"
        color="#1D1D1F"
        lineHeight={19.36}
        align="center"
      >
        Levels
      </Txt>

      {/* Heading */}
      <Txt
        x={47.7}
        y={115}
        w={261}
        size={32}
        weight="bold"
        color={INK_TITLE}
        lineHeight={40.83}
        letterSpacing={-0.5}
        align="center"
      >
        Your Growth Path{" "}
      </Txt>
      <Txt x={315.03} y={122} w={19.27} size={24} weight="bold" lineHeight={28.8} letterSpacing={-0.5} align="center">
        ✨
      </Txt>
      <Txt
        x={50.64}
        y={167}
        w={273.73}
        size={16}
        weight="medium"
        font="inter"
        color={INK_BODY}
        lineHeight={22.4}
        align="center"
      >
        {"Level up to unlock exclusive creator\nsuperpowers"}
      </Txt>

      {/* Timeline rail — masked so it fades out at both ends */}
      <Abs x={36} y={276} w={2} h={545.75}>
        <LinearGradient
          colors={["rgba(150,140,180,0)", DIVIDER, DIVIDER, "rgba(150,140,180,0)"] as const}
          locations={[0, 0.1, 0.9, 1] as const}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={styles.fillAll}
        />
      </Abs>

      {/* Level 5 sits above the active card, Levels 2 and 1 below it */}
      {LEVELS.map((row) => (
        <LevelCard key={row.key} row={row} />
      ))}

      {/* Level 3 — the creator's current level, expanded */}
      <Abs
        x={57.05}
        y={515.18}
        w={300.9}
        h={368.42}
        radius={28}
        border="#FFC4D0"
        borderWidth={1}
        style={styles.activeCard}
      >
        <LinearGradient
          colors={["rgba(255,230,245,0.949)", "rgba(240,220,255,0.898)"] as const}
          start={{ x: -0.1, y: 0.07 }}
          end={{ x: 1.1, y: 0.93 }}
          style={styles.fillAll}
        />
      </Abs>

      <Txt
        x={82.55}
        y={541.7}
        w={78.68}
        size={22}
        weight="bold"
        font="inter"
        color={INK_TITLE}
        lineHeight={26.62}
      >
        Level 3
      </Txt>
      <LinearGradient
        colors={["#FFC4D0", "#FF9EBB"] as const}
        start={{ x: 0.11, y: -0.21 }}
        end={{ x: 0.89, y: 1.21 }}
        style={styles.proBadge}
      />
      <Txt
        x={177.03}
        y={547.82}
        w={24.96}
        size={11}
        weight="bold"
        font="inter"
        color="#5A1A28"
        lineHeight={13.31}
        letterSpacing={0.5}
      >
        PRO
      </Txt>
      <Abs
        x={227.23}
        y={540.68}
        w={105.22}
        h={28.56}
        radius={12}
        bg={INK_TITLE}
        style={styles.hereChip}
      />
      <Txt
        x={239.47}
        y={548.84}
        w={80.74}
        size={10}
        weight="bold"
        font="inter"
        color={colors.white}
        lineHeight={12.1}
        letterSpacing={0.5}
      >
        YOU ARE HERE
      </Txt>

      <Txt x={82.55} y={581.48} w={241.66} size={14} weight="medium" font="inter" color={INK_PERK} lineHeight={19.6}>
        Unlock powerful tools to accelerate
      </Txt>
      <Txt x={82.55} y={601.48} w={200.03} size={14} weight="medium" font="inter" color={INK_PERK} lineHeight={19.6}>
        your brand deals and content
      </Txt>
      <Txt x={82.55} y={621.47} w={58.16} size={14} weight="medium" font="inter" color={INK_PERK} lineHeight={19.6}>
        pipeline.
      </Txt>

      {/* Perk chips */}
      {PERKS.map((perk) => (
        <Fragment key={perk.label}>
          <Abs
            x={82.55}
            y={perk.y}
            w={perk.w}
            h={42.84}
            radius={20}
            bg={GLASS_75}
            border={BORDER_90}
            borderWidth={1}
            style={styles.perkChip}
          />
          <Abs
            x={95.81}
            y={perk.y + 9.18}
            w={24.48}
            h={24.48}
            radius={12.24}
            bg={colors.white}
            center
            style={styles.perkIcon}
          >
            <Feather name={perk.icon} size={12.24} color={PERK_ICON} />
          </Abs>
          <Txt
            x={128.45}
            y={perk.y + 13.26}
            size={13}
            weight="semibold"
            font="inter"
            color={INK_PERK}
            lineHeight={15.73}
          >
            {perk.label}
          </Txt>
        </Fragment>
      ))}

      {/* Brand collab chip — hugs its label exactly as the Figma frame does */}
      <Abs
        x={82.55}
        y={BRAND_CHIP_Y}
        h={42.84}
        radius={20}
        bg={GLASS_75}
        border={BORDER_90}
        borderWidth={1}
        row
        gap={8}
        style={styles.brandChip}
      >
        <View style={styles.brandLogo} />
        <Txt size={13} weight="semibold" font="inter" color={INK_PERK} lineHeight={15.73} numberOfLines={1}>
          {brand}
        </Txt>
      </Abs>

      {/* Active-level marker on the rail */}
      <Abs
        x={26}
        y={537.29}
        w={20}
        h={20}
        radius={8}
        bg="#FF9EBB"
        border={colors.white}
        borderWidth={2}
        style={styles.activeDot}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  backdrop: { position: "absolute", left: 0, top: 0 },
  pressed: { opacity: 0.9 },
  fillAll: { position: "absolute", left: 0, top: 0, right: 0, bottom: 0, borderRadius: 27 },

  backButton: {
    position: "absolute",
    left: 15,
    top: 18,
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.65)",
    borderWidth: 1,
    borderColor: BORDER_90,
    shadowColor: "#000000",
    shadowOpacity: 0.03,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },

  card: { overflow: "hidden", elevation: 2 },

  activeCard: {
    overflow: "hidden",
    shadowColor: "#E6B4FF",
    shadowOpacity: 0.5,
    shadowRadius: 48,
    shadowOffset: { width: 0, height: 20 },
    elevation: 4,
  },
  activeDot: {
    shadowColor: "#FF9EBB",
    shadowOpacity: 0.7,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 0 },
    elevation: 3,
  },

  proBadge: {
    position: "absolute",
    left: 168.87,
    top: 543.74,
    width: 41.28,
    height: 22.44,
    borderRadius: 8,
  },
  hereChip: {
    shadowColor: INK_TITLE,
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },

  perkChip: {
    shadowColor: "#000000",
    shadowOpacity: 0.03,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  perkIcon: {
    shadowColor: PERK_ICON,
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },

  brandChip: {
    maxWidth: 249.9,
    paddingLeft: 12,
    paddingRight: 12,
    shadowColor: "#000000",
    shadowOpacity: 0.03,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  brandLogo: {
    width: 24.48,
    height: 24.48,
    borderRadius: 12.24,
    backgroundColor: "#FFFFFF",
    shadowColor: PERK_ICON,
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
});
