import { Pressable, View } from "react-native";
import Svg, { Circle, Defs, Path, RadialGradient, Stop } from "react-native-svg";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Abs, Screen, Txt } from "../../../src/ui/Frame";
import { colors } from "../../../src/theme";

/**
 * Onboarding — "How do you want to Join?" (Figma 8249:2326, 375x875).
 *
 * Path chooser. Agency-managed creators are handed off to the agency-code step;
 * solo influencers skip straight to phone verification. The chosen path rides
 * along as a query param so the downstream steps know which flow they are in
 * without this screen owning any shared state.
 */

/* Spec palette — these hexes exist only on this frame, so they stay local. */
const INK = "#1a1820";
const SUBTLE = "#787486";
const CANVAS = "#fbf8ff";
const CARD = "#fffdf9";
const PRIMARY = "#312b28";

/**
 * The design's four "Overlay+Blur" circles carry a 50px layer blur. React
 * Native has no layer-blur primitive, so each one is drawn as an SVG radial
 * gradient whose alpha traces the Gaussian falloff Figma produces: the fill
 * sits at its full spec opacity through the core, passes 50% exactly at the
 * circle's own radius and fades to nothing ~60px beyond it. Stacking translucent
 * discs instead — the obvious substitute — both bands into visible rings and
 * lands well short of the spec opacity across the mid-radius.
 */

/** Logistic scale fitted to the exported frame's 50px layer blur (σ ≈ 21). */
const BLUR_FALLOFF = 12.3;
/** Alpha is under 1% of nominal past 3σ, so the gradient can stop there. */
const BLUR_REACH = 63;
const BLUR_STOPS = 28;

function Blob({
  id, x, y, size, color, opacity,
}: {
  id: string; x: number; y: number; size: number; color: string; opacity: number;
}) {
  const r = size / 2;
  const outer = r + BLUR_REACH;
  return (
    <Svg
      width={outer * 2}
      height={outer * 2}
      style={{ position: "absolute", left: x + r - outer, top: y + r - outer }}
    >
      <Defs>
        <RadialGradient id={id} cx="50%" cy="50%" r="50%">
          {Array.from({ length: BLUR_STOPS + 1 }, (_, i) => {
            const t = i / BLUR_STOPS;
            return (
              <Stop
                key={i}
                offset={t}
                stopColor={color}
                stopOpacity={opacity / (1 + Math.exp((t * outer - r) / BLUR_FALLOFF))}
              />
            );
          })}
        </RadialGradient>
      </Defs>
      <Circle cx={outer} cy={outer} r={outer} fill={`url(#${id})`} />
    </Svg>
  );
}

export default function JoinPath() {
  const router = useRouter();

  // Recording the chosen path in the URL keeps this screen stateless: the
  // agency-code step reads "agency", phone-number reads "solo".
  const choose = (path: "agency" | "solo") =>
    router.push(
      path === "agency" ? "/agency-code?joinPath=agency" : "/phone-number?joinPath=solo",
    );

  return (
    <Screen height={875} background={CANVAS} scroll>
      {/* Soft Dreamy Background — 8249:2328 */}
      <Abs x={0} y={0} w={375} h={900} bg={CARD} style={{ overflow: "hidden" }}>
        <Blob id="jpBlobA" x={-37.5} y={-45} size={250} color="#fde047" opacity={0.25} />
        <Blob id="jpBlobB" x={111.25} y={135} size={320} color="#ffb1c6" opacity={0.4} />
        <Blob id="jpBlobC" x={-75} y={510} size={300} color="#93c5fd" opacity={0.35} />
        <Blob id="jpBlobD" x={132.5} y={665} size={280} color="#b794f4" opacity={0.3} />

        {/* Gradient — 8249:2333 */}
        <LinearGradient
          colors={["rgba(255,255,255,0.05)", "rgba(255,255,255,0)"]}
          start={{ x: -0.35, y: 0.85 }}
          end={{ x: 1.35, y: 0.15 }}
          style={{
            position: "absolute", left: 0, top: 0, width: 375, height: 900, opacity: 0.6,
          }}
        />
      </Abs>

      {/* Header & Progress — back chip 8249:2337 */}
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
        {/* iconify-icon → SVG 8249:2338 / Vector 8249:2339 */}
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

      {/* Heading — 8249:2415 */}
      <Txt
        x={32}
        y={550}
        w={319}
        size={30}
        weight="medium"
        color={INK}
        lineHeight={32.5}
        letterSpacing={-0.5}
        align="center"
      >
        How do you want to Join?
      </Txt>

      {/* Subcopy container 8249:2416 / text 8249:2417 */}
      <Abs x={32} y={626} w={311} h={68}>
        <Txt
          x={-8.86}
          y={23}
          w={328}
          size={15}
          weight="medium"
          font="inter"
          color={SUBTLE}
          lineHeight={22.5}
          align="center"
        >
          Choose the path that fits your creator journey
        </Txt>
      </Abs>

      {/* Primary — Agency Managed 8249:2420 */}
      <Pressable
        onPress={() => choose("agency")}
        style={({ pressed }) => ({
          position: "absolute",
          left: 24,
          top: 703,
          width: 327,
          height: 56,
          borderRadius: 100,
          backgroundColor: PRIMARY,
          alignItems: "center",
          justifyContent: "center",
          opacity: pressed ? 0.85 : 1,
        })}
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
          Agency Managed
        </Txt>
      </Pressable>

      {/* Secondary — Solo-Influencer 8249:2422 */}
      <Pressable
        onPress={() => choose("solo")}
        style={({ pressed }) => ({
          position: "absolute",
          left: 24,
          top: 775,
          width: 327,
          height: 56,
          borderRadius: 100,
          backgroundColor: colors.white,
          alignItems: "center",
          justifyContent: "center",
          opacity: pressed ? 0.85 : 1,
        })}
      >
        <Txt
          size={16}
          weight="medium"
          font="inter"
          color={SUBTLE}
          lineHeight={19.36}
          letterSpacing={0.3}
          align="center"
        >
          Solo-Influencer
        </Txt>
      </Pressable>
    </Screen>
  );
}
