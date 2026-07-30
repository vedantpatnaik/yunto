import { useMemo, useState } from "react";
import { Pressable, TextInput } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Circle, Defs, RadialGradient, Stop } from "react-native-svg";
import { Screen, Abs, Txt } from "../../../src/ui/Frame";
import { useAgencies } from "../../../src/api/hooks";

/**
 * Enter Agency Code — Figma frame 7485:43519 (375x875), traced 1:1.
 *
 * The agency-managed branch of onboarding. A glass "Main Onboarding Card" holds
 * the heading, a six-box code field and a floating "resend" pill; a decorative
 * AGENCY/CREATOR pair joined by a link badge floats above it.
 *
 * The frame is captured mid-typing: four boxes filled, the fourth carrying the
 * focused treatment (2px stroke + purple glyph + glow ring), the last two empty.
 * Those are the field's three states and all three are built from this one frame
 * — which box wears which state follows the caret, not the design's snapshot.
 */

/* ------------------------------ design tokens ----------------------------- */
const PURPLE = "#b794f4";
const MUTED = "#787486";
const INK = "#1a1820";

/** Soft Dreamy Background blobs. Figma blurs each by 50px; RN has no layer blur,
 *  so each is drawn as a radial falloff whose extra radius is that blur value. */
const BLOBS = [
  { cx: 87.5, cy: 80, r: 125, color: "#fde047", opacity: 0.25 },
  { cx: 271.25, cy: 295, r: 160, color: "#ffb1c6", opacity: 0.4 },
  { cx: 75, cy: 660, r: 150, color: "#93c5fd", opacity: 0.35 },
  { cx: 272.5, cy: 805, r: 140, color: PURPLE, opacity: 0.3 },
] as const;

/** OTP Inputs — six boxes on an 8pt rhythm. Box 4 is 2pt wider: Figma's focused
 *  state carries a 2px stroke, so its bounds grow by 1pt on each side. */
const BOXES = [
  { x: 48.99, w: 39.17 },
  { x: 96.16, w: 39.17 },
  { x: 143.33, w: 39.17 },
  { x: 190.5, w: 41.17 },
  { x: 239.67, w: 39.17 },
  { x: 286.84, w: 39.17 },
] as const;
const BOX_Y = 576;
const BOX_H = 56;
const CODE_LENGTH = BOXES.length;

/** The frame shows four of the six boxes typed. */
const TYPED_IN_FRAME = 4;
/** Fallback glyphs, straight from the frame, for when the directory is loading. */
const SPEC_CODE = "STEL";

/** "Stellar Talents" -> "STELLA". Agency codes are 6 alphanumeric characters. */
const toCode = (name: string) =>
  name.replace(/[^a-zA-Z0-9]/g, "").slice(0, CODE_LENGTH).toUpperCase();

const SHADOW_BOX = {
  shadowColor: "#000000",
  shadowOpacity: 0.02,
  shadowRadius: 12,
  shadowOffset: { width: 0, height: 4 },
  elevation: 1,
} as const;
const SHADOW_CIRCLE = {
  shadowColor: "#93c5fd",
  shadowOpacity: 0.2,
  shadowRadius: 48,
  shadowOffset: { width: 0, height: 24 },
  elevation: 3,
} as const;

/* --------------------------------- screen --------------------------------- */
export default function AgencyCodeScreen() {
  const router = useRouter();
  const { data: agencies, refetch } = useAgencies();

  // Real agency records are the code directory: a typed code is only valid when
  // it resolves to one of them.
  const codes = useMemo(
    () => (agencies ?? []).map((a) => ({ id: a.id, code: toCode(a.name) })),
    [agencies],
  );

  // First render reproduces the frame's partially-typed field. The glyphs come
  // from the first live agency; while the directory loads they fall back to the
  // frame's own characters, so the geometry never depends on the request.
  const seeded = (codes[0]?.code ?? SPEC_CODE).slice(0, TYPED_IN_FRAME);
  const [typed, setTyped] = useState<string | null>(null);
  const value = typed ?? seeded;

  const match = codes.find((c) => c.code === value);
  // Figma highlights the box holding the most recently typed character.
  const active = Math.min(Math.max(value.length - 1, 0), CODE_LENGTH - 1);

  const submit = () => {
    if (!match) return;
    router.push({ pathname: "/profile-setup", params: { agencyId: match.id } });
  };

  return (
    <Screen height={875} background="#fbf8ff" scroll>
      {/* -------------------- Soft Dreamy Background ------------------- */}
      <Abs x={0} y={0} w={375} h={875} bg="#fffdf9" style={{ overflow: "hidden" }}>
        <Svg width={375} height={875} style={{ position: "absolute", left: 0, top: 0 }}>
          <Defs>
            {BLOBS.map((b, i) => (
              <RadialGradient key={b.color} id={`blob${i}`}>
                <Stop offset="0" stopColor={b.color} stopOpacity={b.opacity} />
                <Stop offset="0.45" stopColor={b.color} stopOpacity={b.opacity} />
                <Stop offset="1" stopColor={b.color} stopOpacity={0} />
              </RadialGradient>
            ))}
          </Defs>
          {BLOBS.map((b, i) => (
            <Circle key={b.color} cx={b.cx} cy={b.cy} r={b.r + 50} fill={`url(#blob${i})`} />
          ))}
        </Svg>
        <LinearGradient
          colors={["rgba(255,255,255,0.05)", "rgba(255,255,255,0)"]}
          start={{ x: 0, y: 1 }}
          end={{ x: 1, y: 0 }}
          style={{ position: "absolute", left: 0, top: 0, width: 375, height: 875, opacity: 0.6 }}
        />
      </Abs>

      {/* ------------------------ Header & Progress -------------------- */}
      <Pressable
        onPress={() => router.back()}
        style={({ pressed }) => ({
          position: "absolute", left: 24, top: 20, width: 40, height: 40,
          borderRadius: 20, backgroundColor: "rgba(255,255,255,0.6)",
          borderWidth: 1, borderColor: "rgba(255,255,255,0.8)",
          alignItems: "center", justifyContent: "center",
          shadowColor: "#000000", shadowOpacity: 0.03, shadowRadius: 12,
          shadowOffset: { width: 0, height: 4 }, elevation: 1,
          opacity: pressed ? 0.85 : 1,
        })}
      >
        <Ionicons name="arrow-back" size={20} color={INK} />
      </Pressable>

      {/* --------------------- Floating Illustration ------------------- */}
      <Abs x={56.69} y={120.39} w={24} h={24} center>
        <Ionicons name="sparkles-outline" size={24} color="#ffb1c6" />
      </Abs>
      <Abs x={318.66} y={377.41} w={16} h={16} center>
        <Ionicons name="star-outline" size={16} color="#fde047" />
      </Abs>

      {/* Agency Circle */}
      <Abs
        x={99.5} y={216} w={100} h={100} radius={50}
        bg="rgba(255,255,255,0.7)" border="rgba(255,255,255,0.9)" borderWidth={1}
        style={SHADOW_CIRCLE}
      />
      <Abs x={133.5} y={241} w={32} h={32} center>
        <Ionicons name="briefcase-outline" size={32} color={INK} />
      </Abs>
      <Txt
        x={99.5} y={277} w={100} size={11} weight="bold" font="inter"
        color={MUTED} lineHeight={13.31} letterSpacing={0.5} align="center"
      >
        AGENCY
      </Txt>

      {/* Creator Circle */}
      <Abs x={175.5} y={216} w={100} h={100} style={SHADOW_CIRCLE}>
        <LinearGradient
          colors={["rgba(255,255,255,0.9)", "rgba(219,234,254,0.5)"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            position: "absolute", left: 0, top: 0, width: 100, height: 100,
            borderRadius: 50, borderWidth: 1, borderColor: "rgba(255,255,255,0.9)",
          }}
        />
      </Abs>
      <Abs x={209.5} y={241} w={32} h={32} center>
        <Ionicons name="person-outline" size={32} color={INK} />
      </Abs>
      <Txt
        x={175.5} y={277} w={100} size={11} weight="bold" font="inter"
        color={MUTED} lineHeight={13.31} letterSpacing={0.5} align="center"
      >
        CREATOR
      </Txt>

      {/* Connect Badge — decorative join between the two circles */}
      <Abs
        x={163.5} y={242} w={48} h={48} radius={24} center
        bg="#ffffff" border="#f3e8ff" borderWidth={2}
        style={{
          shadowColor: PURPLE, shadowOpacity: 0.25, shadowRadius: 24,
          shadowOffset: { width: 0, height: 8 }, elevation: 4,
        }}
      >
        <Ionicons name="link-outline" size={20} color={PURPLE} />
      </Abs>

      {/* ---------------------- Main Onboarding Card ------------------- */}
      <Abs
        x={24} y={435} w={327} h={304} radius={32}
        bg="rgba(255,255,255,0.65)" border="rgba(255,255,255,0.9)" borderWidth={1}
        style={{
          shadowColor: PURPLE, shadowOpacity: 0.12, shadowRadius: 48,
          shadowOffset: { width: 0, height: 24 }, elevation: 4,
        }}
      />

      <Txt
        x={52} y={468} w={271} size={24} weight="medium"
        color="#1f1a17" lineHeight={30} letterSpacing={-0.4} align="center"
      >
        Enter your agency code
      </Txt>
      <Txt
        x={52} y={506} w={271} size={14} weight="medium" font="inter"
        color={MUTED} lineHeight={21} align="center"
      >
        {"Enter your agency code sent to your\nemail."}
      </Txt>

      {/* ------------------------- OTP Inputs -------------------------- */}
      {BOXES.map((box, i) => {
        const char = value[i];
        const isActive = i === active;

        // Focused box: Figma's 4pt #b794f426 spread shadow, drawn as a ring.
        if (isActive) {
          return (
            <Abs key={box.x} x={box.x - 4} y={BOX_Y - 4} w={box.w + 8} h={BOX_H + 8}
              radius={18} bg="rgba(183,148,244,0.15)">
              <Abs
                x={4} y={4} w={box.w} h={BOX_H} radius={14} center
                bg="#ffffff" border={PURPLE} borderWidth={2}
              >
                <Txt
                  size={22} weight="semibold" font="inter"
                  color={PURPLE} lineHeight={26.62} align="center"
                >
                  {char ?? ""}
                </Txt>
              </Abs>
            </Abs>
          );
        }

        return (
          <Abs
            key={box.x} x={box.x} y={BOX_Y} w={box.w} h={BOX_H} radius={14} center
            bg={char ? "#ffffff" : "rgba(255,255,255,0.8)"}
            border={char ? "rgba(183,148,244,0.4)" : "rgba(183,148,244,0.2)"}
            borderWidth={1}
            style={SHADOW_BOX}
          >
            <Txt size={22} weight="semibold" font="inter" lineHeight={26.62} align="center">
              {char ?? ""}
            </Txt>
          </Abs>
        );
      })}

      {/* Invisible capture field spanning the whole row: tapping any box focuses it. */}
      <TextInput
        value={value}
        onChangeText={(t) =>
          setTyped(t.replace(/[^a-zA-Z0-9]/g, "").toUpperCase().slice(0, CODE_LENGTH))
        }
        maxLength={CODE_LENGTH}
        autoCapitalize="characters"
        autoCorrect={false}
        style={{ position: "absolute", left: 49, top: BOX_Y, width: 277, height: BOX_H, opacity: 0 }}
      />

      {/* --------------------- Floating Helper Card -------------------- */}
      <Pressable
        onPress={() => void refetch()}
        style={({ pressed }) => ({
          position: "absolute", left: 55.5, top: 660, width: 264, height: 46,
          borderRadius: 100, backgroundColor: "rgba(255,255,255,0.7)",
          borderWidth: 1, borderColor: "#ffffff",
          shadowColor: PURPLE, shadowOpacity: 0.1, shadowRadius: 24,
          shadowOffset: { width: 0, height: 8 }, elevation: 3,
          opacity: pressed ? 0.85 : 1,
        })}
      >
        <Abs x={20} y={10} w={24} h={24} radius={12} center bg="rgba(183,148,244,0.15)">
          <Ionicons name="mail-outline" size={14} color={PURPLE} />
        </Abs>
        <Txt
          x={52} y={14} w={190} size={13} weight="semibold" font="inter"
          color={MUTED} lineHeight={15.73}
        >
          Didn&apos;t receive it? Resend code
        </Txt>
      </Pressable>

      {/* ------------------------- Bottom Action ----------------------- */}
      <Pressable
        onPress={submit}
        style={({ pressed }) => ({
          position: "absolute", left: 24, top: 771, width: 327, height: 60,
          borderRadius: 100, backgroundColor: "#312b28",
          alignItems: "center", justifyContent: "center",
          opacity: pressed ? 0.9 : 1,
        })}
      >
        <Txt
          x={0} y={20} w={327} size={16} weight="bold" font="inter"
          color="#ffffff" lineHeight={19.36} letterSpacing={0.2} align="center"
        >
          Connect Agency
        </Txt>
      </Pressable>
    </Screen>
  );
}
