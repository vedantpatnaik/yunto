import { Pressable, StyleSheet, View } from "react-native";
import type { ViewStyle } from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Circle, Defs, Path, RadialGradient, Rect, Stop } from "react-native-svg";
import { Screen, Abs, Txt } from "../../../src/ui/Frame";

/**
 * "Let's setup your planner" — Figma frame 7287:3994 (375x940), traced 1:1.
 *
 * The entry fork of planner onboarding: one elevated gradient card ("Setup
 * Automatically", carrying the RECOMMENDED badge) over a soft secondary pill
 * ("Setup Manually"). Pure navigation — the frame shows no record data, so
 * every string here is the literal from the design and nothing is wired to the
 * API; the branch itself is the payload (auto -> collab-days-auto-setup,
 * manual -> collab-days-select).
 *
 * Space Grotesk (the 44pt headline) is not a registered face in this app, so
 * that node falls back to Outfit, the primary family. Figma's BACKGROUND_BLUR
 * and INNER_SHADOW have no React Native equivalent: the two glass surfaces keep
 * their translucent fills without the backdrop blur, and the auto card's white
 * inner highlight is dropped. LAYER_BLUR is reproduced analytically (see
 * Backdrop). Every other value — geometry, colour, radius, size, weight,
 * line-height, tracking — is verbatim.
 */

const FRAME_W = 375;
const FRAME_H = 940;

/** Frame fill: #fff6fb over #f5f3ff. */
const PAGE_BASE = "#fff6fb";
const PAGE = ["#fff6fb", "#f5f3ff"] as const;

const INK = "#111827";

/** Button (auto): DROP_SHADOW 0/20 r40 #e9d5ff @80%, spread -10. */
const autoShadow: ViewStyle = {
  shadowColor: "#e9d5ff",
  shadowOpacity: 0.8,
  shadowRadius: 20,
  shadowOffset: { width: 0, height: 20 },
  elevation: 10,
};

/** RECOMMENDED badge: DROP_SHADOW 0/8 r16 #fde047 @40%. */
const badgeShadow: ViewStyle = {
  shadowColor: "#fde047",
  shadowOpacity: 0.4,
  shadowRadius: 8,
  shadowOffset: { width: 0, height: 8 },
  elevation: 6,
};

/** Button (manual): DROP_SHADOW 0/8 r24 #fef08a @30%. */
const manualShadow: ViewStyle = {
  shadowColor: "#fef08a",
  shadowOpacity: 0.3,
  shadowRadius: 12,
  shadowOffset: { width: 0, height: 8 },
  elevation: 4,
};

/** Header back button: DROP_SHADOW 0/8 r24 #000 @4%. */
const backShadow: ViewStyle = {
  shadowColor: "#000000",
  shadowOpacity: 0.04,
  shadowRadius: 12,
  shadowOffset: { width: 0, height: 8 },
  elevation: 2,
};

/**
 * The three decorative mesh discs (Container / Background+Blur), each carrying
 * a 90pt LAYER_BLUR. React Native cannot blur a layer, but blurring a disc only
 * softens its edge into a Gaussian ramp, and that is exactly what a radial
 * gradient can state: alpha holds at the fill's opacity through the middle and
 * rolls off across the edge. SIGMA is the ramp's width, fitted against Figma's
 * own render of this frame (mean error ~1.5/255 across the backdrop).
 */
const SIGMA = 34;

/** Gaussian edge: offset from the disc's edge, in sigma -> surviving alpha. */
const FALLOFF = [
  [-2, 0.977], [-1, 0.841], [-0.5, 0.691], [0, 0.5], [0.5, 0.309],
  [1, 0.159], [1.5, 0.067], [2, 0.023], [3, 0.001],
] as const;

/** x/y/w/h and fills straight from nodes 7287:3996-3998. */
const BLOBS = [
  { id: "blob-violet", cx: 243.75, cy: 103.2, r: 225, color: "#e9d5ff", opacity: 0.7 },
  { id: "blob-pink", cx: 175, cy: 771.19, r: 250, color: "#fbcfe8", opacity: 0.7 },
  { id: "blob-gold", cx: 212.5, cy: 459.19, r: 175, color: "#fef08a", opacity: 0.35 },
] as const;

function Backdrop() {
  return (
    <Svg width={FRAME_W} height={FRAME_H} style={styles.page}>
      <Defs>
        {BLOBS.map((b) => {
          const outer = b.r + 3 * SIGMA;
          const stops: [number, number][] = [[0, b.opacity]];
          for (const [k, a] of FALLOFF) {
            stops.push([(b.r + k * SIGMA) / outer, b.opacity * a]);
          }
          return (
            <RadialGradient
              key={b.id}
              id={b.id}
              cx={b.cx}
              cy={b.cy}
              r={outer}
              gradientUnits="userSpaceOnUse"
            >
              {stops.map(([offset, alpha]) => (
                <Stop key={offset} offset={offset} stopColor={b.color} stopOpacity={alpha} />
              ))}
            </RadialGradient>
          );
        })}
      </Defs>
      {BLOBS.map((b) => (
        <Rect key={b.id} width={FRAME_W} height={FRAME_H} fill={`url(#${b.id})`} />
      ))}
    </Svg>
  );
}

/** iconify-icon 7287:4006 — lucide sparkles, strokeWidth 2 in a 24 viewBox. */
function Sparkles() {
  return (
    <Svg
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill="none"
      stroke={INK}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <Path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
      <Path d="M20 2v4M22 4h-4" />
      <Circle cx={4} cy={20} r={2} />
    </Svg>
  );
}

export default function PlannerSetupChoice() {
  const router = useRouter();

  return (
    <Screen height={FRAME_H} background={PAGE_BASE} safeTop={false} scroll style={styles.clip}>
      {/* ------------------------------------------------- frame fill */}
      <LinearGradient
        colors={PAGE}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.page}
      />

      {/* ------------------------------------- Container / mesh blobs */}
      <Backdrop />

      {/* ------------------------------------------ Main / Heading 1 */}
      <Txt
        x={59.5}
        y={235.61}
        w={256}
        size={44}
        weight="bold"
        color={INK}
        lineHeight={48.4}
        letterSpacing={-1.5}
        align="center"
      >
        {"Let's setup\nyour planner"}
      </Txt>

      {/* ------------------------------- Main / Container / Button (auto) */}
      <View style={[styles.autoCard, autoShadow]}>
        <LinearGradient
          colors={["#fbcfe8", "#e9d5ff"]}
          start={{ x: 0.385, y: 0 }}
          end={{ x: 0.615, y: 1 }}
          style={styles.autoFill}
        />
      </View>

      {/* iconify-icon */}
      <Abs x={80.32} y={421.61} w={24} h={24} center>
        <Sparkles />
      </Abs>

      <Txt
        x={116.32}
        y={423.11}
        w={178.36}
        size={18}
        weight="bold"
        font="inter"
        color={INK}
        lineHeight={21.78}
        align="center"
      >
        Setup Automatically
      </Txt>

      {/* Background+Border+Shadow — RECOMMENDED badge */}
      <View style={[styles.badge, badgeShadow]}>
        <LinearGradient
          colors={["#fef08a", "#fde047"]}
          start={{ x: 0.4, y: 0 }}
          end={{ x: 0.6, y: 1 }}
          style={styles.badgeFill}
        />
      </View>
      <Txt
        x={211.33}
        y={391.61}
        w={94.67}
        size={11}
        weight="bold"
        font="inter"
        color="#713f12"
        lineHeight={13.31}
        letterSpacing={0.5}
        align="center"
      >
        RECOMMENDED
      </Txt>

      {/* ----------------------------- Main / Container / Button (manual) */}
      <Abs
        x={28}
        y={494.61}
        w={319}
        h={62}
        radius={100}
        bg="rgba(254,249,195,0.6)"
        border="rgba(253,224,71,0.5)"
        borderWidth={1}
        style={manualShadow}
      />
      <Txt
        x={123.77}
        y={515.61}
        w={127.47}
        size={17}
        weight="semibold"
        font="inter"
        color={INK}
        lineHeight={20.57}
        align="center"
      >
        Setup Manually
      </Txt>

      {/* ------------------------------------------ Header / back button */}
      <Abs
        x={24}
        y={60}
        w={48}
        h={48}
        radius={24}
        bg="rgba(255,255,255,0.6)"
        border="rgba(255,255,255,0.8)"
        borderWidth={1}
        style={backShadow}
      />
      <Abs x={36} y={72} w={24} h={24} center>
        <Feather name="arrow-left" size={24} color={INK} />
      </Abs>

      {/* -------------------------------------------------- hit targets */}
      <Pressable onPress={() => router.back()} style={styles.backHit} />
      <Pressable
        onPress={() => router.push("/planner/collab-days-auto-setup")}
        style={styles.autoHit}
      />
      <Pressable
        onPress={() => router.push("/planner/collab-days-select")}
        style={styles.manualHit}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  clip: { overflow: "hidden" },
  page: { position: "absolute", left: 0, top: 0, width: FRAME_W, height: FRAME_H },
  autoCard: {
    position: "absolute",
    left: 28,
    top: 396.61,
    width: 319,
    height: 74,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.4)",
    overflow: "hidden",
  },
  autoFill: { flex: 1 },
  badge: {
    position: "absolute",
    left: 195.33,
    top: 383.61,
    width: 126.67,
    height: 30,
    borderRadius: 100,
    borderWidth: 2,
    borderColor: "#ffffff",
    overflow: "hidden",
  },
  badgeFill: { flex: 1 },
  backHit: { position: "absolute", left: 24, top: 60, width: 48, height: 48, borderRadius: 24 },
  autoHit: { position: "absolute", left: 28, top: 396.61, width: 319, height: 74, borderRadius: 24 },
  manualHit: { position: "absolute", left: 28, top: 494.61, width: 319, height: 62, borderRadius: 100 },
});
