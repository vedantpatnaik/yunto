import { Pressable, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import Svg, {
  Circle,
  Defs,
  Path,
  RadialGradient,
  Rect,
  Stop,
} from "react-native-svg";
import { Screen, Abs, Txt } from "../../../src/ui/Frame";
import { colors } from "../../../src/theme";
import { useLeads } from "../../../src/api/hooks";

/**
 * Welcome / Auth Entry — Figma 7498:44097 (375 x 900).
 *
 * Traced node-for-node from .figma-cache/specs/influencer/frame__7498-44097.json.
 * Frames carrying a Figma `rotation` report an axis-aligned *bounding box*, so
 * the floating proof cards are placed by their bbox centre at their true
 * unrotated size and rotated back into place — that is what keeps the pills
 * tilted the way the design draws them.
 */

type Stops = readonly [string, string, ...string[]];

/* ------------------------------- palette --------------------------------- */
const PAGE_BASE = "#FFFDF9";
const PINK = "#FFB1C6";
const MINT = "#A7F3D0";
const SKY = "#A3D8F4";
const LILAC = "#B794F4";
const BUTTER = "#FDE68A";
const GREEN = "#34D399";
const PILL_TEXT = "#2D2A36";
const HEADING = "#1F1A17";
const MUTED = "#787486";
const CTA_BG = "#312B28";

/* ------------------------------- gradients ------------------------------- */
const AVATAR_STOPS: Stops = ["rgba(255,177,198,0.8)", "rgba(253,230,138,0.8)"];
const BADGE_STOPS: Stops = [LILAC, PINK];
const SHEEN_STOPS: Stops = ["rgba(255,255,255,0.05)", "rgba(255,255,255,0)"];
const FADE_STOPS: Stops = [
  "rgba(255,255,255,0.9)",
  "rgba(255,255,255,0.6)",
  "rgba(255,255,255,0)",
];
const CHART_STOPS: Stops = ["rgba(255,177,198,0)", "rgba(255,177,198,0.8)"];

/* --------------------------------- icons ---------------------------------- */
/** Figma exports these as bare VECTORs; each sits in a 24-unit box, so the
 *  spec's stroke weight is scaled by 24/boxSize to stay pixel-true. */
const SPARKLE_D =
  "M12 2 13.7 8.6a2 2 0 0 0 1.7 1.7L22 12l-6.6 1.7a2 2 0 0 0-1.7 1.7L12 22l-1.7-6.6a2 2 0 0 0-1.7-1.7L2 12l6.6-1.7a2 2 0 0 0 1.7-1.7z";

function Sparkle({ size, color, weight }: { size: number; color: string; weight: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d={SPARKLE_D}
        stroke={color}
        strokeWidth={(weight * 24) / size}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </Svg>
  );
}

/** Socyio mark: a ring with a satellite node at the lower-left (7498:44156). */
function Mark({ size, color, weight }: { size: number; color: string; weight: number }) {
  const sw = (weight * 24) / size;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx={12} cy={12} r={10} stroke={color} strokeWidth={sw} fill="none" />
      <Circle cx={4} cy={20} r={2} stroke={color} strokeWidth={sw} fill="none" />
    </Svg>
  );
}

function CheckCircle({ size, color, weight }: { size: number; color: string; weight: number }) {
  const sw = (weight * 24) / size;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx={12} cy={12} r={10} stroke={color} strokeWidth={sw} fill="none" />
      <Path
        d="m9 12 2 2 4-4"
        stroke={color}
        strokeWidth={sw}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </Svg>
  );
}

function CalendarIcon({ size, color, weight }: { size: number; color: string; weight: number }) {
  const sw = (weight * 24) / size;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Rect x={3} y={4} width={18} height={18} rx={2} stroke={color} strokeWidth={sw} fill="none" />
      <Path
        d="M16 2v4M8 2v4M3 10h18"
        stroke={color}
        strokeWidth={sw}
        strokeLinecap="round"
        fill="none"
      />
    </Svg>
  );
}

/** LAYER_BLUR is not a thing in React Native — a radial falloff reads the same. */
function Blob({
  x, y, size, color, opacity, id,
}: { x: number; y: number; size: number; color: string; opacity: number; id: string }) {
  return (
    <Abs x={x} y={y} w={size} h={size}>
      <Svg width={size} height={size}>
        <Defs>
          <RadialGradient id={id} cx="50%" cy="50%" r="50%">
            <Stop offset="0" stopColor={color} stopOpacity={opacity} />
            <Stop offset="0.55" stopColor={color} stopOpacity={opacity * 0.45} />
            <Stop offset="1" stopColor={color} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Circle cx={size / 2} cy={size / 2} r={size / 2} fill={`url(#${id})`} />
      </Svg>
    </Abs>
  );
}

export default function Welcome() {
  const router = useRouter();
  const { data: leads = [] } = useLeads();

  const newLeads = leads.filter((l) => l.status === "NEW").length;

  return (
    <Screen height={900} background={PAGE_BASE} safeTop={false} scroll style={styles.clip}>
      {/* 7498:44099 Background+Blur */}
      <Abs x={0} y={0} w={375} h={900} bg={PAGE_BASE} />

      {/* 7498:44100 / 44101 / 44102 Overlay+Blur */}
      <Blob id="blobPink" x={145} y={90} size={280} color={PINK} opacity={0.4} />
      <Blob id="blobMint" x={-60} y={390} size={240} color={MINT} opacity={0.4} />
      <Blob id="blobSky" x={100} y={450} size={200} color={SKY} opacity={0.5} />

      {/* 7498:44103 Gradient sheen */}
      <LinearGradient
        colors={SHEEN_STOPS}
        start={{ x: 0, y: 0.85 }}
        end={{ x: 1, y: 0.15 }}
        style={[styles.layer, { left: 0, top: 0, width: 375, height: 900, opacity: 0.5 }]}
      />

      {/* ------------------- 7498:44106 glass preview card -------------------- */}
      <Abs
        x={67.13}
        y={262.43}
        w={240.76}
        h={171.13}
        radius={24}
        bg="rgba(255,255,255,0.65)"
        border="rgba(255,255,255,0.9)"
        borderWidth={1}
        style={[styles.cardShadow, { transform: [{ rotate: "1.72deg" }] }]}
      >
        {/* 7498:44108 avatar */}
        <LinearGradient
          colors={AVATAR_STOPS}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.layer, { left: 20, top: 20, width: 44.2, height: 44.2, borderRadius: 22 }]}
        />
        {/* 7498:44110 / 44111 text placeholders */}
        <Abs x={77.5} y={28.3} w={99.4} h={8.5} radius={4} bg="rgba(183,148,244,0.2)" />
        <Abs x={77.5} y={44.8} w={56.8} h={8.3} radius={4} bg="rgba(183,148,244,0.2)" />

        {/* 7498:44113 tile one */}
        <Abs
          x={20}
          y={84.2}
          w={93.3}
          h={64.45}
          radius={12}
          bg="rgba(255,255,255,0.5)"
          border="rgba(255,255,255,0.5)"
          borderWidth={1}
        />
        {/* 7498:44115 mint ring */}
        <Abs
          x={54.65}
          y={99.4}
          w={24}
          h={24}
          radius={12}
          border="rgba(167,243,208,0.8)"
          borderWidth={3}
        />
        {/* 7498:44116 caption bar */}
        <Abs x={54.6} y={129.35} w={24.12} h={4.12} radius={2} bg="rgba(183,148,244,0.3)" />

        {/* 7498:44117 tile two */}
        <Abs
          x={124.9}
          y={84.2}
          w={93.3}
          h={64.45}
          radius={12}
          bg="rgba(255,255,255,0.5)"
          border="rgba(255,255,255,0.5)"
          borderWidth={1}
        />
        {/* 7498:44118 chart axes */}
        <Abs x={155.5} y={104.34} w={32.11} h={24.16} style={styles.axes} />
        {/* 7498:44119 chart area */}
        <LinearGradient
          colors={CHART_STOPS}
          locations={[0.45, 0.55]}
          start={{ x: 0.3, y: 1 }}
          end={{ x: 0.7, y: 0 }}
          style={[styles.layer, { left: 157.5, top: 112.4, width: 32.07, height: 16.16 }]}
        />
      </Abs>

      {/* ---------------------- 7498:44120 "Deal Closed" ---------------------- */}
      <Abs
        x={223.03}
        y={210.6}
        w={133.25}
        h={37.58}
        radius={18.79}
        bg="rgba(255,255,255,0.85)"
        border="#FFFFFF"
        borderWidth={1}
        row
        gap={8}
        style={[styles.pillShadow, styles.pillPad, { transform: [{ rotate: "5.73deg" }] }]}
      >
        <CheckCircle size={17.58} color={GREEN} weight={1.33} />
        <Txt font="inter" weight="semibold" size={13} lineHeight={15.73} color={PILL_TEXT} numberOfLines={1}>
          Deal Closed
        </Txt>
      </Abs>

      {/* --------------------- 7498:44128 "Campaign Set" ---------------------- */}
      <Abs
        x={199.05}
        y={440.74}
        w={145.96}
        h={37.99}
        radius={19}
        bg="rgba(255,255,255,0.85)"
        border="#FFFFFF"
        borderWidth={1}
        row
        gap={8}
        style={[styles.pillShadow, styles.pillPad, { transform: [{ rotate: "-4.01deg" }] }]}
      >
        <CalendarIcon size={17.08} color={LILAC} weight={1.33} />
        <Txt font="inter" weight="semibold" size={13} lineHeight={15.73} color={PILL_TEXT} numberOfLines={1}>
          Campaign Set
        </Txt>
      </Abs>

      {/* ---------------------- 7498:44137 "2 New Leads" ---------------------- */}
      <Abs
        x={15.01}
        y={330.82}
        w={138.8}
        h={37.96}
        radius={18.98}
        bg="rgba(255,255,255,0.85)"
        border="#FFFFFF"
        borderWidth={1}
        row
        gap={8}
        style={[styles.pillShadow, styles.pillPad, { transform: [{ rotate: "-8.02deg" }] }]}
      >
        <Sparkle size={18.07} color={PINK} weight={1.33} />
        <Txt font="inter" weight="semibold" size={13} lineHeight={15.73} color={PILL_TEXT} numberOfLines={1}>
          {newLeads} New Leads
        </Txt>
      </Abs>

      {/* 7498:44145 + 7498:44149 floating marks */}
      <Abs x={56.25} y={262} w={24} h={24} center>
        <Sparkle size={24} color={BUTTER} weight={2} />
      </Abs>
      <Abs x={261.25} y={431.2} w={20} h={20} center>
        <Mark size={20} color={PINK} weight={1.67} />
      </Abs>

      {/* ------------------------ 7498:44154 logo badge ----------------------- */}
      <LinearGradient
        colors={BADGE_STOPS}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.layer, styles.badge]}
      >
        <Mark size={28} color={colors.white} weight={2.33} />
      </LinearGradient>

      {/* 7498:44160 wordmark */}
      <Txt
        x={155.5}
        y={132}
        w={64}
        font="inter"
        weight="semibold"
        size={20}
        lineHeight={24.2}
        letterSpacing={-0.5}
        align="center"
        color={colors.ink}
      >
        Socyio
      </Txt>

      {/* 7498:44162 white fade behind the copy block */}
      <LinearGradient
        colors={FADE_STOPS}
        locations={[0, 0.4, 1]}
        start={{ x: 0.5, y: 1 }}
        end={{ x: 0.5, y: 0 }}
        style={[styles.layer, { left: 0, top: 444, width: 375, height: 456 }]}
      />

      {/* 7498:44165 headline */}
      <Txt
        x={24}
        y={559.25}
        w={327}
        size={30}
        weight="medium"
        lineHeight={37.5}
        letterSpacing={-0.5}
        align="center"
        color={HEADING}
      >
        {"Your creator world,\norganized."}
      </Txt>

      {/* 7498:44167 subcopy */}
      <Txt
        x={24}
        y={646.25}
        w={327}
        font="inter"
        weight="medium"
        size={15}
        lineHeight={22.5}
        align="center"
        color={MUTED}
      >
        {"Manage collaborations, leads, and plans\nall in one beautiful workspace."}
      </Txt>

      {/* 7498:44169 primary CTA */}
      <Pressable
        onPress={() => router.push("/onboarding/onboarding-intro" as never)}
        style={({ pressed }) => [
          styles.layer,
          styles.primary,
          pressed ? styles.pressed : null,
        ]}
      >
        <Txt
          font="inter"
          weight="semibold"
          size={16}
          lineHeight={19.36}
          letterSpacing={0.3}
          align="center"
          color={colors.white}
          numberOfLines={1}
        >
          Start Exploring
        </Txt>
      </Pressable>

      {/* 7498:44171 secondary link */}
      <Pressable
        onPress={() => router.push("/login" as never)}
        style={({ pressed }) => [
          styles.layer,
          styles.secondary,
          pressed ? styles.pressed : null,
        ]}
      >
        <Txt
          font="inter"
          weight="medium"
          size={16}
          lineHeight={19.36}
          letterSpacing={0.3}
          align="center"
          color={MUTED}
          numberOfLines={1}
        >
          Log in to your account
        </Txt>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  clip: { overflow: "hidden" },
  layer: { position: "absolute" },
  pillPad: { paddingHorizontal: 16 },
  pressed: { opacity: 0.85 },

  // DROP_SHADOW r40 #b4a0dc26 y20 (7498:44106)
  cardShadow: {
    shadowColor: "#B4A0DC",
    shadowOpacity: 0.15,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
  },
  // DROP_SHADOW r24 #b4a0dc26 y12 (the three pills)
  pillShadow: {
    shadowColor: "#B4A0DC",
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  // 7498:44118 — stroke weights bottom 2 / left 2 only.
  axes: {
    borderLeftWidth: 2,
    borderBottomWidth: 2,
    borderColor: "rgba(163,216,244,0.5)",
  },
  badge: {
    left: 159.5,
    top: 64,
    width: 56,
    height: 56,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.8)",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: LILAC,
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  primary: {
    left: 24,
    top: 724,
    width: 327,
    height: 56,
    borderRadius: 28,
    backgroundColor: CTA_BG,
    alignItems: "center",
    justifyContent: "center",
  },
  secondary: {
    left: 24,
    top: 796,
    width: 327,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
});
