import { useCallback, useEffect } from "react";
import { Pressable } from "react-native";
import Svg, { Circle, Path } from "react-native-svg";
import { useRouter } from "expo-router";
import { Abs, Screen, Txt } from "../../../src/ui/Frame";
import { colors } from "../../../src/theme";
import { useMe } from "../../../src/api/hooks";

/**
 * Onboarding — "Authentication Success" (Figma 765:11122 → Frame 1171276421).
 *
 * In the design this success state is a separate 375x812 child laid over the
 * OTP frame: a 70%-black scrim with its own "verify" card. It is built here as
 * its own route rather than a branch inside verify-otp, so the OTP screen stays
 * a single-purpose input screen and this one owns the hand-off to the
 * dashboard. Coordinates are the frame-relative ones from the spec.
 *
 * The screen resolves the session the OTP step created (useMe) and only then
 * auto-advances; a tap anywhere skips the wait.
 */

/* Frame palette — these hexes live only on this frame, so they stay local. */
const SUBTLE = "#b6b6b6"; // 1885:5130 body copy
const CONFETTI_A = "#f2c94c"; // bg / orange
const CONFETTI_B = "#8ab2dc"; // bg / Blue
const CONFETTI_D = "#e5e501"; // bg / Yellow
const SEAL = "#3eb655"; // image 14 — scalloped seal body, sampled from the ref
const SEAL_INNER = "#8bd399"; // image 14 — lighter inner disc

/**
 * "image 14" (1887:3108) is a 75x75 raster; the export only carries its
 * imageRef, so it is redrawn as vector at the exact same box: a green
 * scalloped seal (ten bumps) around a lighter inner disc with a white check,
 * colours sampled from the reference render.
 */
function CelebrationMark() {
  return (
    <Abs x={150} y={312} w={75} h={75}>
      <Svg width={75} height={75} viewBox="0 0 75 75">
        {Array.from({ length: 10 }, (_, i) => {
          const a = (i / 10) * Math.PI * 2 - Math.PI / 2;
          return (
            <Circle
              key={i}
              cx={37.5 + 28.5 * Math.cos(a)}
              cy={37.5 + 28.5 * Math.sin(a)}
              r={8.5}
              fill={SEAL}
            />
          );
        })}
        <Circle cx={37.5} cy={37.5} r={30} fill={SEAL} />
        <Circle cx={37.5} cy={37.5} r={20} fill={SEAL_INNER} />
        <Path
          d="M27.5 36 L33.5 45 L50 27.5"
          stroke={colors.white}
          strokeWidth={6}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </Svg>
    </Abs>
  );
}

export default function SignupSuccess() {
  const router = useRouter();
  // The session minted by OTP verify. Advancing only once it has resolved means
  // the dashboard never mounts against a half-written session.
  const { isLoading } = useMe();

  const go = useCallback(() => router.replace("/home/home-dashboard"), [router]);

  useEffect(() => {
    if (isLoading) return;
    const t = setTimeout(go, 2200);
    return () => clearTimeout(t);
  }, [isLoading, go]);

  return (
    <Screen height={812} background={colors.white} safeTop={false}>
      {/* bg — 765:11125. Four 244px-blurred ellipses; React Native has no layer
          blur, so each is a soft low-opacity wash at the spec box. "Purple"
          (765:11128) starts at y=1307 and never enters the clipped frame. */}
      <Abs x={-58} y={-596} w={477} h={2213} radius={238} bg={CONFETTI_D} opacity={0.25} />
      <Abs x={65} y={599} w={395} h={2050} radius={198} bg={CONFETTI_B} opacity={0.6} />
      <Abs x={21} y={706} w={122} h={661} radius={61} bg={CONFETTI_A} opacity={0.6} />

      {/* mesh-gradient (2) 2 — 765:11130, white wash over the mesh image */}
      <Abs x={-6} y={0} w={381} h={812} bg={colors.white} opacity={0.45} />

      {/* Frame 1171276421 — 765:11122's success child: full-frame 70% scrim.
          Doubles as the tap target that skips the auto-advance. */}
      <Pressable
        onPress={go}
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: 375,
          height: 812,
          backgroundColor: colors.ink,
          opacity: 0.7,
        }}
      />

      {/* verify — 1885:5110 */}
      <Abs
        x={16}
        y={294}
        w={343}
        h={224}
        radius={12}
        bg={colors.white}
        border={colors.ink}
        borderWidth={1}
      />

      {/* image 14 — 1887:3108 */}
      <CelebrationMark />

      {/* Group 1171275244 / Success — 1885:5112 */}
      <Txt
        x={34}
        y={397}
        w={306.96}
        size={24}
        weight="medium"
        color={colors.ink}
        lineHeight={30.24}
        align="center"
      >
        Success
      </Txt>

      {/* 1885:5130 */}
      <Txt
        x={37}
        y={440}
        w={300}
        size={18}
        weight="regular"
        font="inter"
        color={SUBTLE}
        lineHeight={21.78}
        align="center"
      >
        Congratulations! You have been successfully authenticated
      </Txt>
    </Screen>
  );
}
