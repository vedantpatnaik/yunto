import { useCallback, useEffect } from "react";
import { Pressable } from "react-native";
import Svg, { Circle, Defs, Path, RadialGradient, Stop } from "react-native-svg";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Abs, Screen, Txt } from "../../../src/ui/Frame";
import { colors } from "../../../src/theme";
import { useAgencies } from "../../../src/api/hooks";

/**
 * Agency code connected — success (Figma 1984:7731, "507", 375x859).
 *
 * The only source for this state is the legacy 859 frame: the enter-agency-code
 * screen with a full-frame scrim (1984:7778) and a 343x224 "verify" card
 * (1984:7725) laid over it. There is no newest-gen equivalent, so the geometry
 * is traced 1:1 from that frame while the surfaces are re-expressed in the
 * 876-gen language — #f8f5ef base, frosted white glass, 32r corners, dark ink
 * CTA — instead of the legacy #b7d0ee button, 12r card and 1px black strokes.
 *
 * The frozen entry layer underneath is inert: only the scrim takes touches, and
 * tapping it skips the auto-advance to the app home.
 */

/* ------------------------------ design tokens ----------------------------- */
const BASE = "#f8f5ef"; // 876-gen page base, replacing the legacy #fdfdfd
const GLASS = "rgba(255,255,255,0.65)";
const GLASS_LINE = "rgba(255,255,255,0.85)";
const CARD = "rgba(255,255,255,0.82)"; // "verify" fill, frosted rather than solid
const HAIRLINE = "rgba(113,113,113,0.25)"; // Container's #717171 bottom stroke, softened
const CTA = "#312b28"; // 876-gen action pill, replacing #b7d0ee + hard shadow
const INK = "#1b1b1c"; // 1984:7747 / the code glyphs
const SUBTLE = "#b6b6b6"; // 1984:7728 body copy

/** Auto-advance to the app home once the joined roster has resolved. */
const ADVANCE_MS = 2400;

/**
 * "Group 35897" / "Group 35898" — blurred ellipses (103.15px LAYER_BLUR). React
 * Native has no layer blur, so each is drawn as a radial falloff at the spec's
 * centre with the blur folded into the radius. Gradient fills take their first
 * stop. Drawn in the spec's paint order; the group at y=1758 never enters the
 * 859 viewport and is skipped.
 */
const BLOBS = [
  { cx: 313.48, cy: 816.32, r: 247, color: "#ff90a9", opacity: 0.7 },
  { cx: 373.58, cy: 654.21, r: 238, color: "#8673b3", opacity: 0.7 },
  { cx: 65.33, cy: 206.03, r: 82, color: "#ccf5fd", opacity: 0.9 },
  { cx: 53.56, cy: 129.39, r: 79, color: "#46b5fc", opacity: 0.5 },
] as const;

/** "Frame 14544" — five code boxes, with the glyph box centred inside each. */
const BOXES = [
  { x: 16, w: 61, glyphX: 35 },
  { x: 86, w: 62, glyphX: 105 },
  { x: 157, w: 61, glyphX: 176 },
  { x: 227, w: 61, glyphX: 246 },
  { x: 297, w: 62, glyphX: 316 },
] as const;
const BOX_Y = 136;
const BOX_H = 70;
const CODE_LENGTH = BOXES.length;

/** The glyphs the frame itself carries, used until the directory resolves. */
const SPEC_CODE = "55621";

/** "Stellar Talents" -> "STELL". Same rule the creator app's entry screen uses. */
const toCode = (name: string) =>
  name.replace(/[^a-zA-Z0-9]/g, "").slice(0, CODE_LENGTH).toUpperCase();

/**
 * "image 14" (1984:7729) is a 75x75 raster celebration graphic; the export only
 * carries its imageRef, so it is drawn as vector in the same box, in the
 * 876-gen mint palette.
 */
function SuccessMark() {
  return (
    <Abs x={150} y={329} w={75} h={75}>
      <Svg width={75} height={75} viewBox="0 0 75 75">
        <Circle cx={37.5} cy={37.5} r={37.5} fill="#d9f2e2" />
        <Circle cx={37.5} cy={37.5} r={26} fill={colors.success} />
        <Path
          d="M26.5 38 L34 45.5 L48.5 30.5"
          stroke={colors.white}
          strokeWidth={4}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </Svg>
    </Abs>
  );
}

/* --------------------------------- screen --------------------------------- */
export default function AgencyCodeConnectedSuccess() {
  const router = useRouter();
  const { agencyId } = useLocalSearchParams<{ agencyId?: string }>();
  const { data: agencies = [], isLoading } = useAgencies();

  // The agency this join landed on — passed through from the code step, or the
  // first of the live directory when the screen is opened on its own. Its code
  // is what the frozen entry field underneath still shows.
  const joined = agencies.find((a) => a.id === agencyId) ?? agencies[0];
  const code = joined ? toCode(joined.name) : SPEC_CODE;

  const go = useCallback(() => router.replace("/"), [router]);

  // Advancing only once the roster has resolved means the home screen never
  // mounts against a directory that has not seen the new membership.
  useEffect(() => {
    if (isLoading) return;
    const t = setTimeout(go, ADVANCE_MS);
    return () => clearTimeout(t);
  }, [isLoading, go]);

  return (
    <Screen height={859} background={BASE} scroll>
      {/* ------------------------- Frame "2" background ------------------------ */}
      <Abs x={0} y={0} w={375} h={859} bg={BASE} style={{ overflow: "hidden" }}>
        <Svg width={375} height={859} style={{ position: "absolute", left: 0, top: 0 }}>
          <Defs>
            {BLOBS.map((b, i) => (
              <RadialGradient key={b.color} id={`blob${i}`}>
                <Stop offset="0" stopColor={b.color} stopOpacity={b.opacity} />
                <Stop offset="0.45" stopColor={b.color} stopOpacity={b.opacity * 0.6} />
                <Stop offset="1" stopColor={b.color} stopOpacity={0} />
              </RadialGradient>
            ))}
          </Defs>
          {BLOBS.map((b, i) => (
            <Circle key={b.color} cx={b.cx} cy={b.cy} r={b.r} fill={`url(#blob${i})`} />
          ))}
        </Svg>
      </Abs>

      {/* ==================== frozen enter-agency-code layer ==================== */}
      {/* Container — 1984:7746, transparent with a bottom hairline */}
      <Abs
        x={0}
        y={70}
        w={375}
        h={54}
        style={{ borderBottomWidth: 1, borderBottomColor: HAIRLINE }}
      />
      {/* 1984:7747 */}
      <Txt x={16} y={82} w={343} size={24} weight="medium" color={INK} lineHeight={37}>
        Enter Agency Code
      </Txt>

      {/* Frame 14544 — 1984:7748. Legacy 15r + 1px black becomes 876-gen glass. */}
      {BOXES.map((box) => (
        <Abs
          key={box.x}
          x={box.x}
          y={BOX_Y}
          w={box.w}
          h={BOX_H}
          radius={20}
          bg={GLASS}
          border={GLASS_LINE}
          borderWidth={1}
        />
      ))}
      {BOXES.map((box, i) => (
        <Txt
          key={box.glyphX}
          x={box.glyphX}
          y={156}
          w={24}
          size={24}
          weight="medium"
          color={INK}
          lineHeight={37}
          align="center"
        >
          {code[i] ?? ""}
        </Txt>
      ))}

      {/* Frame 14536 — 1984:7759. Inert behind the scrim; the connect already ran. */}
      <Abs x={20} y={262} w={335} h={50} radius={16} bg={CTA} />
      <Txt
        x={102.5}
        y={278}
        w={170}
        size={15}
        weight="semibold"
        color={colors.white}
        lineHeight={18.45}
        align="center"
      >
        Connect
      </Txt>

      {/* ============================ success overlay =========================== */}
      {/* Group 1171275281 — 1984:7779 (#000000 @18%) + 1984:7780 (@80% wash, warm
          here rather than #d9d9d9). Both run past the frame and are clipped to
          it. Doubles as the tap target that skips the auto-advance. */}
      <Pressable
        onPress={go}
        style={{ position: "absolute", left: 0, top: 0, width: 375, height: 859 }}
      >
        <Abs x={0} y={0} w={375} h={859} bg={colors.ink} opacity={0.18} />
        <Abs x={0} y={0} w={375} h={859} bg={BASE} opacity={0.8} />
      </Pressable>

      {/* verify — 1984:7725. 12r + black stroke restyled to the 32r frosted card. */}
      <Abs
        x={16}
        y={311}
        w={343}
        h={224}
        radius={32}
        bg={CARD}
        border={GLASS_LINE}
        borderWidth={1}
        style={{
          shadowColor: "#1e1432",
          shadowOpacity: 0.08,
          shadowRadius: 40,
          shadowOffset: { width: 0, height: 16 },
          elevation: 3,
        }}
      />

      {/* image 14 — 1984:7729 */}
      <SuccessMark />

      {/* Group 1171275244 / Success — 1984:7727 */}
      <Txt
        x={34}
        y={414}
        w={306.96}
        size={24}
        weight="medium"
        color={colors.ink}
        lineHeight={29.52}
        align="center"
      >
        Success
      </Txt>

      {/* 1984:7728 */}
      <Txt
        x={37}
        y={457}
        w={300}
        size={18}
        weight="regular"
        color={SUBTLE}
        lineHeight={22.14}
        align="center"
      >
        Congratulations! You have been successfully connected
      </Txt>
    </Screen>
  );
}
