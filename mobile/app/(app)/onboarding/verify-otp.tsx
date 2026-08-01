import { useEffect, useRef, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import Svg, { Circle, Path } from "react-native-svg";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMutation } from "@tanstack/react-query";
import { Abs, Screen, Txt } from "../../../src/ui/Frame";
import { colors } from "../../../src/theme";
import { api } from "../../../src/api/client";
import { useMe } from "../../../src/api/hooks";
import { resetOnboarding, submitOnboarding } from "../../../src/onboarding/store";

/**
 * OTP Verification — Figma frame 765:11122 (375x812), the only frame in the
 * file that draws OTP entry.
 *
 * Geometry and type come from that frame verbatim: title (14,56), the step
 * card + progress bar (14,109 338x54), the instruction card (16,176 343x78)
 * and the five-box code row (16,274 343x70, boxes 61/62 wide). Two things are
 * deliberately not traced:
 *
 *  - The legacy frame paints its own iOS numeric keyboard (50:1943, 269px of
 *    key art). Native screens get the real keyboard, so a hidden TextInput
 *    sits over the code row instead.
 *  - The frame's surfaces are the pre-875 style — flat white with 1px black
 *    hairlines over a mesh-gradient image. Those *fills* are restyled to the
 *    875-generation glass language of agency-code (7485:43519): the Soft
 *    Dreamy Background blobs, white/60 glass fills with white hairlines and
 *    the #b794f4 accent on the code boxes. Coordinates, corner radii and the
 *    frame's own colours (progress #1a9461, link #60a5fa, the success card)
 *    stay verbatim.
 */

/* --------------------------- 875-generation tokens ------------------------ */
/* All from agency-code 7485:43519 — the frame this screen is restyled onto. */
const CANVAS = "#fbf8ff";
const CARD = "#fffdf9";
const INK = "#1a1820";
const SUBTLE = "#787486";
const ACCENT = "#b794f4";
const GLASS_FILL = "rgba(255,255,255,0.6)";
const GLASS_LINE = "rgba(255,255,255,0.8)";

/* ------------------------------- frame tokens ----------------------------- */
/* From 765:11122 itself. */
const TITLE_INK = "#101010";
const STEP_INK = "#373837";
const TRACK = "#dee3de";
/** Progress fill 765:11138 — the frame's own green, also the success mark. */
const PROGRESS = "#1a9461";
const PHONE_LINK = "#60a5fa";
const SUCCESS_BODY = "#b6b6b6";

/** The five code boxes — 765:11164..765:11168, all y=274 h=70 r=15. */
const BOXES = [
  { x: 16, w: 61 },
  { x: 86, w: 62 },
  { x: 157, w: 61 },
  { x: 227, w: 61 },
  { x: 297, w: 62 },
] as const;

const CODE_LENGTH = BOXES.length;
/** Resend lockout, matching the countdown the flow asks for. */
const RESEND_SECONDS = 30;

/**
 * agency-code's four "Overlay+Blur" circles carry a 50px layer blur. React
 * Native has no layer-blur primitive, so each is drawn as concentric discs
 * whose stacked alpha sums to the spec opacity — same centre, size and colour.
 */
function Blob({
  x, y, size, color, opacity,
}: { x: number; y: number; size: number; color: string; opacity: number }) {
  const rings = 6;
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

export default function VerifyOtp() {
  const router = useRouter();
  const params = useLocalSearchParams<{ otpToken?: string; phone?: string }>();
  const me = useMe();
  const input = useRef<TextInput>(null);

  const [code, setCode] = useState("");
  const [seconds, setSeconds] = useState(RESEND_SECONDS);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [wrong, setWrong] = useState(false);

  /**
   * The number the code went to. The phone step hands it over as a param; on a
   * resumed session it is the signed-in user's own number. The frame's literal
   * stands in until one of those resolves, so the line never reflows.
   */
  const phone = params.phone || me.data?.phone || "+91 9230985934";

  const resend = useMutation({
    mutationFn: () =>
      api<{ otpToken?: string }>("/auth/resend-otp", {
        method: "POST",
        body: JSON.stringify({ otpToken: params.otpToken }),
      }),
    onSuccess: () => setSeconds(RESEND_SECONDS),
  });

  // One timeout per tick rather than an interval, so a resend that resets the
  // counter cannot leave a second timer running.
  useEffect(() => {
    if (seconds <= 0) return;
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [seconds]);

  // The success card (1885:5109) is the last thing the frame shows; the flow
  // then continues to the signup-success screen.
  useEffect(() => {
    if (!done) return;
    const t = setTimeout(() => router.replace("/onboarding/signup-success"), 1400);
    return () => clearTimeout(t);
  }, [done, router]);

  // No real OTP service backs this final step, so any complete code is
  // accepted. Filling the row is the confirm action: it creates the real
  // account (submitOnboarding stores the token), clears the accumulator and
  // only then advances. A failure keeps the user here to retry.
  const submit = async () => {
    if (submitting || done) return;
    setWrong(false);
    setSubmitting(true);
    try {
      await submitOnboarding();
      resetOnboarding();
      setDone(true);
    } catch {
      setWrong(true);
      setSubmitting(false);
    }
  };

  const onChangeCode = (raw: string) => {
    const digits = raw.replace(/[^0-9]/g, "").slice(0, CODE_LENGTH);
    setCode(digits);
    if (wrong) setWrong(false);
    if (digits.length === CODE_LENGTH) submit();
  };

  const canResend = seconds <= 0 && !resend.isPending;

  return (
    <Screen height={812} background={CANVAS}>
      {/* ---- Soft Dreamy Background — agency-code 7485:43521..43526 -------- */}
      <Abs x={0} y={0} w={375} h={900} bg={CARD} style={{ overflow: "hidden" }}>
        <Blob x={-37.5} y={-45} size={250} color="#fde047" opacity={0.25} />
        <Blob x={111.25} y={135} size={320} color="#ffb1c6" opacity={0.4} />
        <Blob x={-75} y={510} size={300} color="#93c5fd" opacity={0.35} />
        <Blob x={132.5} y={665} size={280} color={ACCENT} opacity={0.3} />
        <LinearGradient
          colors={["rgba(255,255,255,0.05)", "rgba(255,255,255,0)"]}
          start={{ x: -0.35, y: 0.85 }}
          end={{ x: 1.35, y: 0.15 }}
          style={{
            position: "absolute", left: 0, top: 0, width: 375, height: 900, opacity: 0.6,
          }}
        />
      </Abs>

      {/* ---- Back chip — agency-code 7485:43530 ---------------------------- */}
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
          borderColor: GLASS_LINE,
          shadowColor: "#000000",
          shadowOpacity: 0.03,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: 4 },
          elevation: 2,
          opacity: pressed ? 0.7 : 1,
        })}
      >
        <View style={{ width: 20, height: 20 }}>
          <Svg width={20} height={20} viewBox="0 0 20 20">
            <Path
              d="M15.833 10H4.167M10 15.833L4.167 10 10 4.167"
              stroke={INK}
              strokeWidth={1.67}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </Svg>
        </View>
      </Pressable>

      {/* ---- Title — 765:11132 (y 56 + centred in its 53pt box) ------------ */}
      <Txt x={14} y={64} w={338} size={24} weight="medium" color={TITLE_INK} lineHeight={37}>
        Enter your Phone Number
      </Txt>

      {/* ---- Step card — 765:11133 ---------------------------------------- */}
      <Abs
        x={14} y={109} w={338} h={54} radius={8}
        bg={GLASS_FILL} border={GLASS_LINE} borderWidth={1}
        style={{
          shadowColor: ACCENT, shadowOpacity: 0.12, shadowRadius: 24,
          shadowOffset: { width: 0, height: 8 }, elevation: 2,
        }}
      />
      {/* Step 4 of 4 — 765:11136 */}
      <Txt x={31} y={113} w={67} size={14} weight="medium" color={STEP_INK} lineHeight={24}>
        Step 4 of 4
      </Txt>
      {/* Progress track 765:11137 + fill 765:11138 (step 4 of 4 → full) */}
      <Abs x={31} y={142} w={309} h={8} radius={4} bg={TRACK} />
      <Abs x={31} y={142} w={309} h={8} radius={4} bg={PROGRESS} />

      {/* ---- Instruction card — 765:11139 --------------------------------- */}
      <Abs
        x={16} y={176} w={343} h={78} radius={12}
        bg={GLASS_FILL} border={GLASS_LINE} borderWidth={1}
        style={{
          shadowColor: ACCENT, shadowOpacity: 0.12, shadowRadius: 24,
          shadowOffset: { width: 0, height: 8 }, elevation: 2,
        }}
      />
      {/* 765:11141 — the number is its own style run (#60a5fa) */}
      <Txt
        x={29} y={196} w={306.96} size={16} font="inter"
        color={colors.ink} lineHeight={19.36}
      >
        Enter the One-time-password sent to the number{" "}
        <Text style={{ color: PHONE_LINK }}>{phone}</Text>
      </Txt>

      {/* ---- Code row — 765:11163, boxes 765:11164..765:11168 -------------- */}
      {BOXES.map((box, i) => {
        const filled = i < code.length;
        const active = i === code.length;
        const outlined = wrong || filled || active;
        return (
          <Abs
            key={box.x}
            x={box.x}
            y={274}
            w={box.w}
            h={70}
            radius={15}
            bg={filled ? colors.white : "rgba(255,255,255,0.8)"}
            border={
              wrong
                ? colors.danger
                : outlined
                  ? ACCENT
                  : "rgba(183,148,244,0.2)"
            }
            borderWidth={outlined ? 2 : 1}
            style={{
              shadowColor: wrong ? colors.danger : ACCENT,
              shadowOpacity: active || wrong ? 0.25 : 0.05,
              shadowRadius: active || wrong ? 8 : 12,
              shadowOffset: { width: 0, height: active || wrong ? 0 : 4 },
              elevation: 1,
            }}
          />
        );
      })}
      {BOXES.map((box, i) =>
        i < code.length ? (
          <Txt
            key={`d${box.x}`}
            x={box.x}
            y={295}
            w={box.w}
            size={22}
            weight="semibold"
            font="inter"
            color={wrong ? colors.danger : colors.ink}
            lineHeight={26.62}
            align="center"
          >
            {code[i]}
          </Txt>
        ) : null,
      )}
      {/* The real keyboard drives entry; this input is the frame's code row. */}
      <TextInput
        ref={input}
        value={code}
        onChangeText={onChangeCode}
        keyboardType="number-pad"
        maxLength={CODE_LENGTH}
        autoFocus
        caretHidden
        textContentType="oneTimeCode"
        autoComplete="sms-otp"
        editable={!submitting && !done}
        style={{ position: "absolute", left: 16, top: 274, width: 343, height: 70, opacity: 0 }}
      />

      {/* ---- Resend pill — agency-code 7485:43561, 28pt under the row ------ */}
      <Pressable
        onPress={() => {
          if (!canResend) return;
          setCode("");
          setWrong(false);
          resend.mutate();
          input.current?.focus();
        }}
        style={({ pressed }) => ({
          position: "absolute",
          left: 55.5,
          top: 372,
          width: 264,
          height: 46,
          borderRadius: 100,
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 20,
          backgroundColor: "rgba(255,255,255,0.7)",
          borderWidth: 1,
          borderColor: colors.white,
          shadowColor: ACCENT,
          shadowOpacity: 0.1,
          shadowRadius: 24,
          shadowOffset: { width: 0, height: 8 },
          elevation: 2,
          opacity: canResend ? (pressed ? 0.85 : 1) : 0.6,
        })}
      >
        {/* Overlay 7485:43562 + mail glyph 7485:43563 */}
        <View
          style={{
            width: 24, height: 24, borderRadius: 12,
            backgroundColor: "rgba(183,148,244,0.15)",
            alignItems: "center", justifyContent: "center",
          }}
        >
          <Svg width={14} height={14} viewBox="0 0 14 14">
            <Path
              d="M1.17 2.33h11.66v9.34H1.17z"
              stroke={ACCENT}
              strokeWidth={1.17}
              strokeLinejoin="round"
              fill="none"
            />
            <Path
              d="M1.17 3.08 7 7l5.83-3.92"
              stroke={ACCENT}
              strokeWidth={1.17}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </Svg>
        </View>
        {/* 7485:43568 */}
        <Txt
          w={190}
          size={13}
          weight="semibold"
          font="inter"
          color={SUBTLE}
          lineHeight={15.73}
          style={{ marginLeft: 8 }}
        >
          {canResend ? "Didn't receive it? Resend code" : `Resend code in ${seconds}s`}
        </Txt>
      </Pressable>

      {/* ---- Success — 1885:5109 ------------------------------------------ */}
      {done ? (
        <Abs x={0} y={0} w={375} h={812} bg="rgba(0,0,0,0.7)">
          {/* verify card 1885:5110 */}
          <Abs
            x={16} y={294} w={343} h={224} radius={12}
            bg={colors.white} border={colors.ink} borderWidth={1}
          />
          {/* image 14 1887:3108 — a raster badge in the export, so it is drawn
              at the same box in the frame's green with a white tick. */}
          <Abs x={150} y={312} w={75} h={75}>
            <Svg width={75} height={75} viewBox="0 0 75 75">
              <Circle cx={37.5} cy={40} r={24} fill={PROGRESS} />
              <Path
                d="M27 40.5 34.5 48 48.5 33"
                stroke={colors.white}
                strokeWidth={4}
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            </Svg>
          </Abs>
          {/* Success 1885:5112 */}
          <Txt
            x={34} y={397} w={306.96} size={24} weight="medium"
            color={colors.ink} lineHeight={30.24} align="center"
          >
            Success
          </Txt>
          {/* 1885:5130 */}
          <Txt
            x={37} y={440} w={300} size={18} font="inter"
            color={SUCCESS_BODY} lineHeight={21.78} align="center"
          >
            Congratulations! You have been successfully authenticated
          </Txt>
        </Abs>
      ) : null}
    </Screen>
  );
}
