import { useState } from "react";
import { Pressable, TextInput, View } from "react-native";
import Svg, { Path, Rect } from "react-native-svg";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Abs, Screen, Txt } from "../../../src/ui/Frame";
import { colors, fonts } from "../../../src/theme";
import { useMe } from "../../../src/api/hooks";

/**
 * Onboarding — "Enter your Phone Number" (Figma 7489:44001, 375x1024).
 *
 * Second step of the solo-influencer path. Collects the number that the OTP
 * will be sent to; the verify step downstream owns the code entry, so this
 * screen's only job is to produce a well-formed E.164-ish string and hand it on.
 */

/* Spec palette — these hexes exist only on this frame, so they stay local. */
const INK = "#1f1a17";
const ICON_INK = "#1a1820";
const SUBTLE = "#787486";
const PLACEHOLDER = "#a4a4b8";
const CANVAS = "#fbf8ff";
const CARD = "#fffdf9";
const PRIMARY = "#312b28";
const DIVIDER = "#d2c8e6";
const GREEN = "#34d399";

/**
 * Dial codes offered by the country chip. The design draws a single closed
 * chip labelled "+91", so the picker is the chip itself: tapping advances to
 * the next code rather than opening a panel the spec has no geometry for.
 */
const DIAL_CODES = ["+91", "+1", "+44", "+61", "+971"] as const;

/** Digits the mask "(91) 0000-0000-00" accepts, and its 4-4-2 grouping. */
const MAX_DIGITS = 10;
const groupDigits = (d: string) =>
  [d.slice(0, 4), d.slice(4, 8), d.slice(8, 10)].filter(Boolean).join("-");

/**
 * The design's four "Overlay+Blur" circles carry a 50px layer blur. React
 * Native has no layer-blur primitive, so each one is drawn as concentric discs
 * whose stacked alpha sums to the spec opacity — a soft radial falloff with the
 * spec's exact centre, size and colour.
 */
function Blob({
  x, y, size, color, opacity,
}: { x: number; y: number; size: number; color: string; opacity: number }) {
  const rings = 12;
  return (
    <>
      {Array.from({ length: rings }, (_, i) => {
        const s = (size * (i + 1)) / rings;
        const inset = (size - s) / 2;
        return (
          <Abs
            key={i}
            x={x + inset}
            y={y + inset}
            w={s}
            h={s}
            radius={s / 2}
            bg={color}
            opacity={opacity / rings}
          />
        );
      })}
    </>
  );
}

export default function PhoneNumber() {
  const router = useRouter();

  // The signed-in user record already carries a phone for returning creators,
  // so the field opens pre-filled from it until the first keystroke takes over.
  const { data: me } = useMe();
  const [typed, setTyped] = useState<string | null>(null);
  const stored = (me?.phone ?? "").replace(/\D/g, "").slice(-MAX_DIGITS);
  const digits = typed ?? stored;

  const [dialIndex, setDialIndex] = useState(0);
  const dial = DIAL_CODES[dialIndex];
  const valid = digits.length === MAX_DIGITS;

  // No OTP is minted here: the verify step owns the send + resend cooldown, and
  // it needs the number, so the number rides across on the URL.
  const submit = () => {
    if (!valid) return;
    router.push(`/verify-otp?phone=${encodeURIComponent(dial + digits)}`);
  };

  return (
    <Screen height={1024} background={CANVAS} scroll>
      {/* Soft Dreamy Background — 7489:44003 */}
      <Abs x={0} y={0} w={375} h={1024} bg={CARD} style={{ overflow: "hidden" }}>
        <Blob x={-37.5} y={-45} size={250} color="#fde047" opacity={0.25} />
        <Blob x={111.25} y={135} size={320} color="#ffb1c6" opacity={0.4} />
        <Blob x={-75} y={634} size={300} color="#93c5fd" opacity={0.35} />
        <Blob x={132.5} y={789} size={280} color="#b794f4" opacity={0.3} />

        {/* Gradient — 7489:44008 */}
        <LinearGradient
          colors={["rgba(255,255,255,0.05)", "rgba(255,255,255,0)"]}
          start={{ x: -0.35, y: 0.85 }}
          end={{ x: 1.35, y: 0.15 }}
          style={{
            position: "absolute", left: 0, top: 0, width: 375, height: 1024, opacity: 0.6,
          }}
        />
      </Abs>

      {/* Header & Progress — back chip 7489:44086 */}
      <Pressable
        onPress={() => router.back()}
        hitSlop={8}
        style={({ pressed }) => ({
          position: "absolute",
          left: 24,
          top: 20,
          width: 40,
          height: 40,
          borderRadius: 20,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "rgba(255,255,255,0.6)",
          borderWidth: 1,
          borderColor: "rgba(255,255,255,0.8)",
          shadowColor: "#000000",
          shadowOpacity: 0.03,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: 4 },
          elevation: 2,
          opacity: pressed ? 0.7 : 1,
        })}
      >
        {/* iconify-icon → SVG 7489:44087 / Vector 7489:44088 */}
        <View style={{ width: 20, height: 20 }}>
          <Svg width={20} height={20} viewBox="0 0 20 20">
            <Path
              d="M15.833 10H4.167M10 15.833L4.167 10 10 4.167"
              stroke={ICON_INK}
              strokeWidth={1.67}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </Svg>
        </View>
      </Pressable>

      {/* Heading 1 — 7489:44093 */}
      <Txt
        x={24}
        y={100}
        w={335}
        size={28}
        weight="medium"
        color={INK}
        lineHeight={35.73}
        letterSpacing={-0.5}
        align="center"
      >
        Enter your Phone Number
      </Txt>

      {/* Subtext — 7489:44095 */}
      <Txt
        x={44}
        y={148}
        w={295}
        size={15}
        weight="medium"
        font="inter"
        color={SUBTLE}
        lineHeight={22.5}
        align="center"
      >
        We’ll verify your account securely using OTP.
      </Txt>

      {/* Form Card — 7489:43954 */}
      <Abs
        x={20}
        y={284}
        w={335}
        h={142}
        radius={32}
        bg="rgba(255,255,255,0.55)"
        border="rgba(255,255,255,0.85)"
        borderWidth={1}
        style={{
          shadowColor: "#b28dff",
          shadowOpacity: 0.12,
          shadowRadius: 40,
          shadowOffset: { width: 0, height: 16 },
          elevation: 4,
        }}
      />

      {/* Overlay+Border+Shadow — glass field 7489:43955 */}
      <Abs
        x={45}
        y={309}
        w={285}
        h={60}
        radius={20}
        bg="rgba(255,255,255,0.7)"
        border="rgba(255,255,255,0.9)"
        borderWidth={1}
        style={{
          shadowColor: "#ffffff",
          shadowOpacity: 0.6,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 2 },
        }}
      />

      {/* Country chip — Button 7489:43956 */}
      <Pressable
        onPress={() => setDialIndex((i) => (i + 1) % DIAL_CODES.length)}
        hitSlop={14}
        style={({ pressed }) => ({
          position: "absolute",
          left: 62,
          top: 329.5,
          width: 66,
          height: 19,
          flexDirection: "row",
          alignItems: "center",
          opacity: pressed ? 0.6 : 1,
        })}
      >
        {/* +91 — 7489:43960 */}
        <Txt
          w={30}
          size={16}
          weight="bold"
          font="inter"
          color={INK}
          lineHeight={19.36}
          align="center"
          numberOfLines={1}
        >
          {dial}
        </Txt>
        {/* iconify-icon → SVG 7489:43962 / Vector 7489:43963 */}
        <View style={{ width: 18, height: 18, marginLeft: 6 }}>
          <Svg width={18} height={18} viewBox="0 0 18 18">
            <Path
              d="M4.5 6.75L9 11.25l4.5-4.5"
              stroke={PLACEHOLDER}
              strokeWidth={1.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </Svg>
        </View>
      </Pressable>

      {/* Vertical Divider — 7489:43965 */}
      <Abs x={128} y={327} w={1} h={24} bg={DIVIDER} opacity={0.5} />

      {/*
        Input — 7489:43968. The text box is 19pt tall at y=329.5, exactly centred
        in the 60pt field; the TextInput takes the full field height instead so
        the tap target is usable, which leaves the glyphs on the same baseline.
      */}
      <TextInput
        value={groupDigits(digits)}
        onChangeText={(t) => setTyped(t.replace(/\D/g, "").slice(0, MAX_DIGITS))}
        placeholder="(91) 0000-0000-00"
        placeholderTextColor={PLACEHOLDER}
        keyboardType="phone-pad"
        returnKeyType="done"
        onSubmitEditing={submit}
        style={{
          position: "absolute",
          left: 145,
          top: 309,
          width: 168,
          height: 60,
          padding: 0,
          fontFamily: fonts.interMedium,
          fontSize: 16,
          letterSpacing: 0.5,
          color: INK,
        }}
      />

      {/* Helper icon — SVG 7489:43971 / Group 7489:43972 */}
      <View style={{ position: "absolute", left: 47, top: 385, width: 16, height: 16 }}>
        <Svg width={16} height={16} viewBox="0 0 16 16">
          {/* Vector 7489:43973 — lock body */}
          <Rect
            x={2}
            y={7.33}
            width={12}
            height={7.33}
            rx={1.33}
            stroke={GREEN}
            strokeWidth={1.33}
            fill="none"
          />
          {/* Vector 7489:43974 — shackle */}
          <Path
            d="M4.67 7.33V4.67a3.33 3.33 0 0 1 6.66 0v2.66"
            stroke={GREEN}
            strokeWidth={1.33}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </Svg>
      </View>

      {/* Helper line — 7489:43976 */}
      <Txt
        x={71}
        y={385}
        w={257}
        size={13}
        weight="medium"
        font="inter"
        color={SUBTLE}
        lineHeight={15.73}
      >
        A 6-digit code will be sent to this number
      </Txt>

      {/* Bottom CTA — Button 7489:44076 */}
      <Pressable
        onPress={submit}
        disabled={!valid}
        style={({ pressed }) => ({
          position: "absolute",
          left: 20,
          top: 924,
          width: 335,
          height: 58,
          borderRadius: 100,
          backgroundColor: PRIMARY,
          borderWidth: 1,
          borderColor: "rgba(255,255,255,0.4)",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: 10.01,
          // The design draws the CTA solid even with the field empty, so an
          // invalid number never dims it — submit() simply no-ops.
          opacity: pressed ? 0.85 : 1,
        })}
      >
        {/* Continue — 7489:44077. Intrinsic width: the spec's 69pt is a Roboto
            measurement and clips the app font, wrapping the label. */}
        <Txt
          size={17}
          weight="bold"
          color={colors.white}
          lineHeight={19.92}
          numberOfLines={1}
        >
          Continue
        </Txt>
        {/* iconify-icon → SVG 7489:44079 / Vector 7489:44080 */}
        <View style={{ width: 20, height: 20 }}>
          <Svg width={20} height={20} viewBox="0 0 20 20">
            <Path
              d="M4.167 10h11.666M10 4.167L15.833 10 10 15.833"
              stroke={colors.white}
              strokeWidth={1.67}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </Svg>
        </View>
      </Pressable>
    </Screen>
  );
}
