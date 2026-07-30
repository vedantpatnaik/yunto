import { useCallback, useState } from "react";
import { Pressable, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useQueryClient } from "@tanstack/react-query";
import Svg, {
  Defs,
  LinearGradient as SvgLinear,
  RadialGradient,
  Rect,
  Stop,
} from "react-native-svg";
import { Abs, Screen, Txt } from "../../../src/ui/Frame";
import { colors } from "../../../src/theme";
import { clearToken } from "../../../src/api/client";

/**
 * Log Out — Figma 7383:31085 (375x875), traced 1:1.
 *
 * A full-screen confirmation rather than a bottom sheet: glass back header, the
 * 140x140 illustration cluster (two blurred backing circles behind a bordered
 * glass tile), the 327-wide confirmation card with its two 277x60 buttons, and
 * the centred secure note. Coordinates below are raw frame coordinates from the
 * spec; <Screen> scales the 375pt canvas to the device.
 *
 * The backend exposes no logout endpoint — auth is register / login / me only —
 * so the session ends entirely on the client: drop the stored JWT, then clear
 * the query cache so the next account cannot read the previous one's
 * notifications, leads or planner out of memory.
 */

/* ------------------------------- geometry -------------------------------- */
const FRAME_W = 375;
const FRAME_H = 875;

/* --------------------------- spec colour tokens --------------------------- */
const INK_TITLE = "#1D1D1F"; // header title 7383:31133
const INK_ICON = "#1C1C1E"; // back chevron 7383:31130
const INK_HEADING = "#2D2A36"; // "Leaving already?" 7383:31192
const INK_BODY = "#787486"; // card body 7383:31194
const INK_SECONDARY = "#4A4559"; // "Stay Logged In" 7383:31199
const INK_NOTE = "#9283B4"; // secure note + lock 7383:31204/31206
const BLUR_PINK = "#FFB1C6"; // Background+Blur 7383:31183
const BLUR_PURPLE = "#B794F4"; // Background+Blur 7383:31184
const ICON_PINK = "#F0829D"; // illustration vector 7383:31187
const BUTTON_INK = "#312B28"; // primary Background+Shadow 7383:31196

/* -------------------------------- backdrop -------------------------------- */
/** The frame fill: a warm vertical base plus four soft radial glows. */
function Backdrop() {
  return (
    <Svg width={FRAME_W} height={FRAME_H} style={styles.backdrop}>
      <Defs>
        <SvgLinear id="base" x1="187.5" y1="0" x2="187.5" y2={FRAME_H} gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#F7F0E4" />
          <Stop offset="1" stopColor="#F4EBDD" />
        </SvgLinear>
        <RadialGradient id="pink" cx="285" cy="542.5" rx="1027.5" ry="568.75" gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#F7B7DA" stopOpacity="0.34" />
          <Stop offset="0.26" stopColor="#F7B7DA" stopOpacity="0" />
        </RadialGradient>
        <RadialGradient id="blue" cx="90" cy="367.5" rx="967.5" ry="533.75" gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#BACDF4" stopOpacity="0.36" />
          <Stop offset="0.24" stopColor="#BACDF4" stopOpacity="0" />
        </RadialGradient>
        <RadialGradient id="gold" cx="292.5" cy="157.5" rx="1338.75" ry="735" gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#F6D64A" stopOpacity="0.22" />
          <Stop offset="0.2" stopColor="#F6D64A" stopOpacity="0" />
        </RadialGradient>
        <RadialGradient id="haze" cx="75" cy="87.5" rx="1466.25" ry="805" gradientUnits="userSpaceOnUse">
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

/* --------------------------------- screen --------------------------------- */
export default function LogOut() {
  const router = useRouter();
  const qc = useQueryClient();
  const [busy, setBusy] = useState(false);

  /** Confirm: end the session client-side, then hand back to the auth stack. */
  const confirm = useCallback(async () => {
    if (busy) return;
    setBusy(true);
    await clearToken();
    // Purge every cached collection (notifications, leads, planner, ...) so the
    // next sign-in starts from the server, not from this account's residue.
    qc.clear();
    router.replace("/login");
  }, [busy, qc, router]);

  /** Both "Stay Logged In" and the header back arrow pop with no side effects. */
  const dismiss = useCallback(() => router.back(), [router]);

  return (
    <Screen height={FRAME_H} background="#F7F0E4" scroll>
      <Backdrop />

      {/* Header — 7383:31127 */}
      {/* Overlay+Border+Shadow+OverlayBlur — 7383:31128 */}
      <Pressable
        onPress={dismiss}
        style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
      >
        {/* SVG / Vector — 7383:31129 / 7383:31130 */}
        <Feather name="arrow-left" size={20} color={INK_ICON} />
      </Pressable>

      {/* Container / Container / "Log Out" — 7383:31131 → 7383:31133 */}
      <Txt
        x={79.5}
        y={30}
        w={236}
        size={16}
        weight="bold"
        font="inter"
        color={INK_TITLE}
        lineHeight={19.36}
        align="center"
      >
        Log Out
      </Txt>

      {/* Main Content Area — 7383:31180 (layout-only; children keep frame coords) */}

      {/* Illustration Section — 7383:31182. The two backing squares carry a 24pt
          layer blur in Figma; React Native has no layer blur, so each is drawn
          as the spec's 100x100 radius-50 wash at its spec opacity. */}
      <Abs x={167.5} y={169.47} w={100} h={100} radius={50} bg={BLUR_PINK} opacity={0.7} />
      <Abs x={107.5} y={229.47} w={100} h={100} radius={50} bg={BLUR_PURPLE} opacity={0.7} />

      {/* Overlay+Border+Shadow+OverlayBlur — 7383:31185, with the 44x44 icon
          frame 7383:31186 centred inside it exactly as the spec boxes it. */}
      <Abs
        x={137.5}
        y={199.47}
        w={100}
        h={100}
        radius={50}
        bg="rgba(255,255,255,0.7)"
        border="rgba(255,255,255,0.8)"
        borderWidth={1}
        center
        style={styles.tileShadow}
      >
        <Feather name="log-out" size={44} color={ICON_PINK} />
      </Abs>

      {/* Confirmation Card — 7383:31189 */}
      <Abs
        x={24}
        y={367.47}
        w={327}
        h={342.05}
        radius={36}
        bg="rgba(255,255,255,0.65)"
        border="rgba(255,255,255,0.6)"
        borderWidth={1}
        style={styles.cardShadow}
      />

      {/* Heading 2 / Text — 7383:31191 / 7383:31192 */}
      <Txt
        x={82.55}
        y={408.47}
        w={209.89}
        size={26}
        weight="bold"
        font="inter"
        color={INK_HEADING}
        lineHeight={31.46}
        letterSpacing={-0.4}
        align="center"
      >
        Leaving already?
      </Txt>

      {/* Container / Text — 7383:31193 / 7383:31194 */}
      <Txt
        x={74.66}
        y={450.77}
        w={225.67}
        size={15}
        weight="regular"
        font="inter"
        color={INK_BODY}
        lineHeight={22.5}
        align="center"
      >
        {"You'll still receive updates and\ncampaign notifications anytime."}
      </Txt>

      {/* Container — 7383:31195 (the two stacked actions) */}
      {/* Background+Shadow / Text — 7383:31196 / 7383:31197 */}
      <Pressable
        onPress={confirm}
        disabled={busy}
        style={({ pressed }) => [
          styles.primary,
          (pressed || busy) && styles.pressed,
        ]}
      >
        <Txt
          size={16}
          weight="semibold"
          font="inter"
          color={colors.white}
          lineHeight={19.36}
          letterSpacing={0.3}
          align="center"
        >
          Log Out
        </Txt>
      </Pressable>

      {/* Overlay+Border+Shadow / Text — 7383:31198 / 7383:31199 */}
      <Pressable
        onPress={dismiss}
        style={({ pressed }) => [styles.secondary, pressed && styles.pressed]}
      >
        <Txt
          size={16}
          weight="semibold"
          font="inter"
          color={INK_SECONDARY}
          lineHeight={19.36}
          letterSpacing={0.3}
          align="center"
        >
          Stay Logged In
        </Txt>
      </Pressable>

      {/* Secure Note — 7383:31200 */}
      <Abs x={84.57} y={741.53} w={205.86} h={20} opacity={0.8}>
        {/* Overlay + iconify lock — 7383:31201 → 7383:31205 */}
        <Abs w={20} h={20} radius={10} bg="rgba(255,255,255,0.5)" center>
          <Feather name="lock" size={14} color={INK_NOTE} />
        </Abs>
        {/* Text — 7383:31206 */}
        <Txt
          x={28}
          y={2}
          w={177.86}
          size={13}
          weight="medium"
          font="inter"
          color={INK_NOTE}
          lineHeight={15.73}
          align="left"
        >
          You can log back in anytime.
        </Txt>
      </Abs>
    </Screen>
  );
}

const styles = StyleSheet.create({
  backdrop: { position: "absolute", left: 0, top: 0 },
  pressed: { opacity: 0.9 },

  /* 7383:31128 — drop shadow #00000008, blur 12, offset 0/4 */
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
    borderColor: "rgba(255,255,255,0.9)",
    shadowColor: "#000000",
    shadowOpacity: 0.03,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
  },

  /* 7383:31185 — drop shadow #b4a0dc33, blur 32, offset 0/12 */
  tileShadow: {
    shadowColor: "#B4A0DC",
    shadowOpacity: 0.2,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 12 },
  },

  /* 7383:31189 — drop shadow #b496dc26, blur 48, offset 0/24 */
  cardShadow: {
    shadowColor: "#B496DC",
    shadowOpacity: 0.15,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 24 },
  },

  /* 7383:31196 — 277x60 pill, #312b28, drop shadow #f0829d4d blur 24 offset 0/12 */
  primary: {
    position: "absolute",
    left: 49,
    top: 532.52,
    width: 277,
    height: 60,
    borderRadius: 100,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: BUTTON_INK,
    shadowColor: ICON_PINK,
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 12 },
    elevation: 4,
  },

  /* 7383:31198 — 277x60 pill, white @80%, drop shadow #b4a0dc1a blur 16 offset 0/6 */
  secondary: {
    position: "absolute",
    left: 49,
    top: 608.52,
    width: 277,
    height: 60,
    borderRadius: 100,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.8)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.8)",
    shadowColor: "#B4A0DC",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
});
