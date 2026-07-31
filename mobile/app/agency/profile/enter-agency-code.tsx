import { useState } from "react";
import { Pressable, TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Screen, Abs, Txt } from "../../../src/ui/Frame";
import { colors } from "../../../src/theme";
import { useMe } from "../../../src/api/hooks";
import type { User } from "../../../src/api/hooks";

/**
 * Enter Agency Code — Figma frame 7917:2399 (375x1030), traced 1:1.
 *
 * The join-an-existing-workspace path: a team member types the code their
 * agency handed them and connects their account to that workspace. One glass
 * card (24,347 327x194) holds the label, the code field and the Connect CTA,
 * under a gradient badge + heading pair. The canvas is 1030 tall but every node
 * lives above y=589, so the frame simply ends in empty page.
 *
 * The newest generation of this frame draws the code field as a single 285x50
 * pill. The segmented five-box treatment — the one that actually communicates
 * "5-character code" — only survives in the legacy 859 frames (793:2940 /
 * 1984:7731): five cells 61-62x70 on a 70pt pitch across a 343pt row. That
 * treatment is ported here, rescaled to this card's 285pt content width
 * (k = 285/343 = 0.8309, so 50.7/51.5pt cells on a 58.16pt pitch) and dressed
 * in the new visual language's glass fill and indigo hairline. Row height stays
 * the new frame's 50pt, so no other coordinate on the card moves.
 */

/* ------------------------------ design tokens ----------------------------- */
const INK = "#111111";
const MUTED = "#64748b";
const INDIGO = "#6366f1";
/** Field hairline: #818cf8 @ 20% (spec) — @ 55% marks the caret cell. */
const LINE_IDLE = "rgba(129,140,248,0.2)";
const LINE_ACTIVE = "rgba(129,140,248,0.55)";

/* ------------------------------ code field -------------------------------- */
const CODE_LENGTH = 5;
/** The frame ships the field prefilled; also the seeded User.agencyCode. */
const SPEC_CODE = "55678";

const ROW_X = 45;
const ROW_Y = 394;
const ROW_W = 285;
const CELL_H = 50;
/** Legacy cells x=16/86/157/227/297 (w 61,62,61,61,62) scaled by 285/343. */
const CELLS = [
  { x: 45, w: 50.68 },
  { x: 103.16, w: 51.52 },
  { x: 162.16, w: 50.68 },
  { x: 220.32, w: 50.68 },
  { x: 278.48, w: 51.52 },
] as const;
/** Legacy corner 15 on a 70pt cell, nudged toward this frame's rounder pills. */
const CELL_RADIUS = 18;
/** Legacy glyph 24pt on the same 0.8309 scale. */
const GLYPH_SIZE = 20;

/**
 * No POST agency/join exists on the API, so an unrecognised code is caught
 * client-side against the workspace the account already carries. One message
 * covers both failure modes — too short, and simply wrong.
 */
const INVALID = "That code doesn't match an agency workspace";

/** /auth/me returns the whole User row minus passwordHash, so agencyCode
 *  (User.agencyCode in schema.prisma) rides along even though the shared User
 *  type does not list it. */
type Member = User & { agencyCode?: string | null };

/* --------------------------------- screen --------------------------------- */
export default function EnterAgencyCodeScreen() {
  const router = useRouter();
  const me = useMe();
  const known = (me.data as Member | undefined)?.agencyCode ?? null;

  // The field opens on the workspace code the account already holds; while /me
  // is in flight it falls back to the frame's own characters, so the geometry
  // never waits on the request.
  const [typed, setTyped] = useState<string | null>(null);
  const [invalid, setInvalid] = useState(false);
  const value = (typed ?? known ?? SPEC_CODE).slice(0, CODE_LENGTH);

  // Figma's glyphs sit still; the caret cell is the one just filled.
  const caret = Math.min(value.length, CODE_LENGTH - 1);

  const connect = () => {
    if (value.length < CODE_LENGTH || (known !== null && value !== known)) {
      setInvalid(true);
      return;
    }
    setInvalid(false);
    router.back();
  };

  return (
    <Screen height={1030} background="#f8f5ef" scroll>
      {/* ------------------------------ Background --------------------------- */}
      <Abs x={0} y={0} w={375} h={836} bg="#f8f5ef" style={{ overflow: "hidden" }}>
        {/* Gradient — #f9e4e8 @20% fading to nothing over the top 256pt. */}
        <LinearGradient
          colors={["rgba(249,228,232,0.2)", "rgba(249,228,232,0)"]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={{ position: "absolute", left: 0, top: 0, width: 375, height: 256 }}
        />
      </Abs>

      {/* ------------------------------ Icon badge --------------------------- */}
      <Abs
        x={155.5} y={183} w={64} h={64} radius={40} center
        style={{
          shadowColor: "#000000", shadowOpacity: 0.1, shadowRadius: 6,
          shadowOffset: { width: 0, height: 4 }, elevation: 2,
        }}
      >
        <LinearGradient
          colors={["rgba(129,140,248,0.25)", "rgba(196,181,253,0.18)"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            position: "absolute", left: 0, top: 0, width: 64, height: 64,
            borderRadius: 40, borderWidth: 1, borderColor: "rgba(129,140,248,0.3)",
          }}
        />
        {/* SVG 28x28 — three 2pt #6366f1 strokes forming the workspace mark. */}
        <Ionicons name="business-outline" size={28} color={INDIGO} />
      </Abs>

      {/* -------------------------------- Heading ---------------------------- */}
      <Txt
        x={80} y={259} w={215} size={24} weight="semibold" font="inter"
        color={INK} lineHeight={32} letterSpacing={-0.6} align="center"
      >
        Enter Agency Code
      </Txt>
      <Txt
        x={70.5} y={295} w={234} size={14} font="inter"
        color={MUTED} lineHeight={20} align="center"
      >
        Enter your agency workspace code
      </Txt>

      {/* ------------------------------ Glass card --------------------------- */}
      <Abs
        x={24} y={347} w={327} h={194} radius={28}
        bg="rgba(255,255,255,0.45)" border="rgba(255,255,255,0.7)" borderWidth={1}
        style={{
          shadowColor: "#8264ff", shadowOpacity: 0.07, shadowRadius: 32,
          shadowOffset: { width: 0, height: 4 }, elevation: 2,
        }}
      />

      {/* Label — "Agency CODE" carries textCase UPPER. */}
      <Txt
        x={49} y={372} w={277} size={12} weight="semibold" font="inter"
        color={MUTED} lineHeight={16} letterSpacing={0.3}
      >
        AGENCY CODE
      </Txt>

      {/* --------------------------- Segmented code field -------------------- */}
      {CELLS.map((cell, i) => {
        const char = value[i];
        const active = !invalid && i === caret;
        return (
          <Abs
            key={cell.x}
            x={cell.x} y={ROW_Y} w={cell.w} h={CELL_H} radius={CELL_RADIUS} center
            bg="rgba(255,255,255,0.6)"
            border={invalid ? colors.danger : active ? LINE_ACTIVE : LINE_IDLE}
            borderWidth={1}
            style={{
              shadowColor: "#000000", shadowOpacity: 0.04, shadowRadius: 3,
              shadowOffset: { width: 0, height: 1 }, elevation: 1,
            }}
          >
            <Txt size={GLYPH_SIZE} font="inter" color={MUTED} lineHeight={26} align="center">
              {char ?? ""}
            </Txt>
          </Abs>
        );
      })}

      {/* Invisible capture field spanning the row: tapping any cell focuses it. */}
      <TextInput
        value={value}
        onChangeText={(t) => {
          setTyped(t.replace(/[^0-9]/g, "").slice(0, CODE_LENGTH));
          setInvalid(false);
        }}
        maxLength={CODE_LENGTH}
        keyboardType="number-pad"
        autoCorrect={false}
        style={{
          position: "absolute", left: ROW_X, top: ROW_Y,
          width: ROW_W, height: CELL_H, opacity: 0,
        }}
      />

      {/* Validation line — fits the 16pt gap between field and CTA, so nothing
          below it shifts when it appears. */}
      {invalid ? (
        <Txt
          x={49} y={446} w={277} size={11} weight="semibold" font="inter"
          color={colors.danger} lineHeight={14}
        >
          {INVALID}
        </Txt>
      ) : null}

      {/* --------------------------------- CTA ------------------------------- */}
      <Pressable
        onPress={connect}
        style={({ pressed }) => ({
          position: "absolute", left: 45, top: 464, width: 285, height: 52,
          opacity: pressed ? 0.9 : 1,
          shadowColor: INDIGO, shadowOpacity: 0.35, shadowRadius: 20,
          shadowOffset: { width: 0, height: 6 }, elevation: 6,
        })}
      >
        <LinearGradient
          colors={[INDIGO, "#8b5cf6"]}
          start={{ x: 0.2, y: 0 }}
          end={{ x: 0.8, y: 1 }}
          style={{
            position: "absolute", left: 0, top: 0, right: 0, bottom: 0,
            borderRadius: 40,
          }}
        />
        {/* Inner top highlight — #ffffff @15%, 1pt. */}
        <View
          style={{
            position: "absolute", left: 1, right: 1, top: 1, height: 1,
            backgroundColor: "rgba(255,255,255,0.15)",
          }}
        />
        <Txt
          x={113.5} y={16} w={58} size={14} weight="semibold" font="inter"
          color="#ffffff" lineHeight={20} align="center"
        >
          Connect
        </Txt>
      </Pressable>
    </Screen>
  );
}
