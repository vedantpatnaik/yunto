import { Pressable, StyleSheet, View } from "react-native";
import type { ViewStyle } from "react-native";
import { useRouter } from "expo-router";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
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
 * that node falls back to Outfit, the primary family. Figma's LAYER_BLUR,
 * BACKGROUND_BLUR and INNER_SHADOW have no React Native equivalent: the three
 * mesh blobs are approximated by stacked discs (see Blob), the two glass
 * surfaces keep their translucent fills without the backdrop blur, and the
 * auto card's white inner highlight is dropped. Every other value — geometry,
 * colour, radius, size, weight, line-height, tracking — is verbatim.
 */

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
 * Stand-in for Figma's 90pt LAYER_BLUR: React Native cannot blur a layer, so
 * three concentric discs at a fraction of the target alpha reproduce the soft
 * falloff of the decorative mesh blobs.
 */
function Blob({
  x, y, size, color, opacity,
}: { x: number; y: number; size: number; color: string; opacity: number }) {
  return (
    <>
      {[0, 1, 2].map((i) => {
        const inset = i * 40;
        const s = size - inset * 2;
        return (
          <Abs
            key={i}
            x={x + inset}
            y={y + inset}
            w={s}
            h={s}
            radius={s / 2}
            bg={color}
            opacity={opacity * 0.42}
          />
        );
      })}
    </>
  );
}

export default function PlannerSetupChoice() {
  const router = useRouter();

  return (
    <Screen height={940} background={PAGE_BASE} safeTop={false} scroll style={styles.clip}>
      {/* ------------------------------------------------- frame fill */}
      <LinearGradient
        colors={PAGE}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.page}
      />

      {/* ------------------------------------- Container / mesh blobs */}
      <Blob x={18.75} y={-121.8} size={450} color="#e9d5ff" opacity={0.7} />
      <Blob x={-75} y={521.19} size={500} color="#fbcfe8" opacity={0.7} />
      <Blob x={37.5} y={284.19} size={350} color="#fef08a" opacity={0.35} />

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
        <MaterialCommunityIcons name="auto-fix" size={24} color={INK} />
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
  page: { position: "absolute", left: 0, top: 0, width: 375, height: 940 },
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
