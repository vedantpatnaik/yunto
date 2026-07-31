import type { ReactNode } from "react";
import { Image, Linking, Pressable, Share, View } from "react-native";
import Svg, { Circle, Defs, Path, RadialGradient, Rect, Stop } from "react-native-svg";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Abs, Screen, Txt } from "../../../src/ui/Frame";
import { colors } from "../../../src/theme";
import { useAgencies, useCreators, useMe, useUpdate } from "../../../src/api/hooks";
import type { Creator } from "../../../src/api/hooks";

/**
 * Onboarding — "Link-in-Bio Verification" (Figma 7487:43798, 375x1024).
 *
 * The creator's generated profile link is agency-scoped, so the host comes from
 * the managing agency and the slug from the creator's own name. Verification is
 * a round-trip: the creator leaves for Instagram, pastes the link, comes back
 * and taps Verify — which publishes (lists) their creator record. The design
 * only draws the pre-verification state, so the pending/failed states are
 * layered on without disturbing any of its geometry.
 */

/* Spec palette — these hexes appear only on this frame, so they stay local. */
const INK = "#1f1a17";
const SUBTLE = "#787486";
const CANVAS = "#fbf8ff";
const CARD = "#fffdf9";
const PRIMARY = "#312b28";
const HAIRLINE = "#ede9f5";

/** Row-local accents for the three checklist steps (7487:43737/43747/43755). */
const STEPS = [
  {
    y: 559,
    label: "Open Instagram profile",
    tint: ["rgba(255,183,213,0.2)", "rgba(255,183,213,0.5)"] as const,
    edge: "rgba(255,183,213,0.6)",
    stroke: "#e883b6",
  },
  {
    y: 649,
    label: "Paste creator link in bio",
    tint: ["rgba(167,243,208,0.2)", "rgba(167,243,208,0.5)"] as const,
    edge: "rgba(167,243,208,0.6)",
    stroke: "#34d399",
  },
  {
    y: 739,
    label: "Return and verify profile",
    tint: ["rgba(178,141,255,0.2)", "rgba(178,141,255,0.5)"] as const,
    edge: "rgba(178,141,255,0.6)",
    stroke: "#a78bfa",
  },
];

/** Layer-blur radius shared by the four background discs (7487:43801-43804). */
const BLUR = 50;

/** Gaussian-ish falloff, sampled with smoothstep from core edge to nothing. */
const FALLOFF = [0, 0.25, 0.5, 0.75, 1].map((t) => ({
  t,
  a: 1 - t * t * (3 - 2 * t),
}));

/**
 * The four "Overlay+Blur" circles carry a 50px layer blur. React Native has no
 * layer-blur primitive, so each is drawn as an SVG radial gradient: the blur
 * spreads the disc BLUR outwards and eats BLUR inwards, leaving a solid core
 * that fades smoothly to nothing. Stacking flat discs instead would band.
 */
function Blob({
  x, y, size, color, opacity,
}: { x: number; y: number; size: number; color: string; opacity: number }) {
  const radius = size / 2 + BLUR;
  const core = Math.max(size / 2 - BLUR, 0) / radius;
  const id = `pvlBlob${Math.abs(Math.round(x))}_${Math.abs(Math.round(y))}`;
  return (
    <Svg
      width={radius * 2}
      height={radius * 2}
      style={{
        position: "absolute",
        left: x + size / 2 - radius,
        top: y + size / 2 - radius,
      }}
    >
      <Defs>
        <RadialGradient id={id} cx="50%" cy="50%" r="50%">
          {FALLOFF.map(({ t, a }) => (
            <Stop
              key={t}
              offset={core + (1 - core) * t}
              stopColor={color}
              stopOpacity={opacity * a}
            />
          ))}
        </RadialGradient>
      </Defs>
      <Circle cx={radius} cy={radius} r={radius} fill={`url(#${id})`} />
    </Svg>
  );
}

/** Every icon on this frame is lucide at strokeWidth 2 in a 24 viewBox. */
function Icon({
  size, stroke, children,
}: { size: number; stroke: string; children: ReactNode }) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={stroke}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {children}
    </Svg>
  );
}

/** Checklist glyphs, keyed by row index — instagram, link-2, circle-check. */
function StepIcon({ index }: { index: number }) {
  const stroke = STEPS[index].stroke;
  if (index === 0) {
    return (
      <Icon size={22} stroke={stroke}>
        <Rect x={2} y={2} width={20} height={20} rx={5} />
        <Path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
        <Path d="M17.5 6.5h.01" />
      </Icon>
    );
  }
  if (index === 1) {
    return (
      <Icon size={22} stroke={stroke}>
        <Path d="M9 17H7A5 5 0 0 1 7 7h2" />
        <Path d="M15 7h2a5 5 0 1 1 0 10h-2" />
        <Path d="M8 12h8" />
      </Icon>
    );
  }
  return (
    <Icon size={22} stroke={stroke}>
      <Circle cx={12} cy={12} r={10} />
      <Path d="m9 12 2 2 4-4" />
    </Icon>
  );
}

export default function ProfileVerifyLink() {
  const router = useRouter();
  const me = useMe();
  const creators = useCreators();
  const agencies = useAgencies();
  const verify = useUpdate<Creator>("creators");

  // The onboarding creator is the signed-in user's own creator record; fall
  // back to the first row so the screen still renders against a seeded API.
  const list = creators.data ?? [];
  const creator = list.find((c) => c.name === me.data?.name) ?? list[0];
  const agency = agencies.data?.find((a) => a.id === creator?.agencyId);

  const handle = (creator?.handle ?? "sophiaroy").replace(/^@/, "");
  const niches = (creator?.niche ?? "Fashion/Lifestyle")
    .split(/[,/]/)
    .map((n) => n.trim())
    .filter(Boolean)
    .slice(0, 2);

  // Agency-scoped link: the managing agency owns the host, the creator the slug.
  const host = agency?.website
    ? agency.website.replace(/^https?:\/\//, "").replace(/\/+$/, "")
    : `${(agency?.name ?? "Stellartalent").replace(/\s+/g, "")}.com`;
  const slug = (creator?.name ?? "Sophia Roy").trim().toLowerCase().replace(/\s+/g, "-");
  const link = `${host}/${slug}`;

  const openInstagram = () => {
    const app = `instagram://user?username=${handle}`;
    Linking.canOpenURL(app)
      .then((ok) => Linking.openURL(ok ? app : `https://instagram.com/${handle}`))
      .catch(() => undefined);
  };

  // No clipboard module ships with this app; the spec's affordance is a lucide
  // share glyph, and the OS share sheet offers "Copy" natively.
  const shareLink = () => {
    Share.share({ message: link }).catch(() => undefined);
  };

  const onVerify = () => {
    if (!creator || verify.isPending) return;
    verify.mutate(
      { id: creator.id, data: { listed: true } },
      { onSuccess: () => router.push("/onboarding/phone-number") },
    );
  };

  return (
    <Screen height={1024} background={CANVAS} scroll>
      {/* Soft Dreamy Background — 7487:43800 */}
      <Abs x={0} y={0} w={375} h={1024} bg={CARD} style={{ overflow: "hidden" }}>
        <Blob x={-37.5} y={-45} size={250} color="#fde047" opacity={0.25} />
        <Blob x={111.25} y={135} size={320} color="#ffb1c6" opacity={0.4} />
        <Blob x={-75} y={634} size={300} color="#93c5fd" opacity={0.35} />
        <Blob x={132.5} y={789} size={280} color="#b794f4" opacity={0.3} />

        {/* Gradient — 7487:43805 */}
        <LinearGradient
          colors={["rgba(255,255,255,0.05)", "rgba(255,255,255,0)"]}
          start={{ x: -0.35, y: 0.85 }}
          end={{ x: 1.35, y: 0.15 }}
          style={{
            position: "absolute", left: 0, top: 0, width: 375, height: 1024, opacity: 0.6,
          }}
        />
      </Abs>

      {/* Header back chip — 7489:44082 */}
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
        {/* iconify-icon → Vector 7489:44084 (arrow-left) */}
        <Icon size={20} stroke="#1a1820">
          <Path d="M19 12H5" />
          <Path d="m12 19-7-7 7-7" />
        </Icon>
      </Pressable>

      {/* Headline — 7487:43735 */}
      <Txt
        x={24}
        y={100}
        w={327}
        size={28}
        weight="medium"
        color={INK}
        lineHeight={36.8}
        letterSpacing={-0.5}
        align="center"
      >
        {"Your creator profile\nis almost ready ✨"}
      </Txt>

      {/* Profile Card — 7487:43772 */}
      <Abs
        x={20}
        y={216}
        w={335}
        h={335}
        radius={32}
        bg="rgba(255,255,255,0.55)"
        border="rgba(255,255,255,0.85)"
        borderWidth={1}
        style={{
          shadowColor: "#b28dff",
          shadowOpacity: 0.12,
          shadowRadius: 40,
          shadowOffset: { width: 0, height: 16 },
          elevation: 6,
        }}
      />

      {/* Avatar ring — Background+Shadow 7487:43787 */}
      <LinearGradient
        colors={["#ffb7d5", "#b28dff", "#a7f3d0"]}
        locations={[0, 0.5, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          position: "absolute",
          left: 139.5,
          top: 245,
          width: 96,
          height: 96,
          borderRadius: 48,
          shadowColor: "#b28dff",
          shadowOpacity: 0.4,
          shadowRadius: 32,
          shadowOffset: { width: 0, height: 12 },
          elevation: 8,
        }}
      />

      {/* Avatar photo — 7487:43788 */}
      <Abs
        x={143.5}
        y={249}
        w={88}
        h={88}
        radius={44}
        border={colors.white}
        borderWidth={3}
        style={{ overflow: "hidden" }}
      >
        {creator?.avatarUrl ? (
          <Image
            source={{ uri: creator.avatarUrl }}
            style={{ width: 82, height: 82, borderRadius: 41 }}
          />
        ) : null}
      </Abs>

      {/* iconify-icon 7487:43789 (sparkles) */}
      <Abs x={223.5} y={241} w={20} h={20}>
        <Icon size={20} stroke="#ffb7d5">
          <Path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
          <Path d="M4 17v2" />
          <Path d="M6 18H4" />
        </Icon>
      </Abs>

      {/* iconify-icon 7487:43794 (star) */}
      <Abs x={127.5} y={317} w={16} h={16}>
        <Icon size={16} stroke="#b28dff">
          <Path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.11a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z" />
        </Icon>
      </Abs>

      {/* Handle — 7487:43774 (centred across the card, as the spec frame is) */}
      <Txt
        x={20}
        y={350}
        w={335}
        size={22}
        weight="semibold"
        font="inter"
        color={INK}
        lineHeight={26.62}
        letterSpacing={-0.3}
        align="center"
        numberOfLines={1}
      >
        @{handle}
      </Txt>

      {/* Niche chips — Container 7487:43776 */}
      <Abs
        x={20}
        y={389}
        w={335}
        h={28}
        row
        gap={7.99}
        style={{ justifyContent: "center" }}
      >
        {niches.map((n) => (
          <View
            key={n}
            style={{
              height: 28,
              borderRadius: 100,
              paddingHorizontal: 14,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "rgba(255,255,255,0.6)",
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.9)",
              shadowColor: "#000000",
              shadowOpacity: 0.03,
              shadowRadius: 12,
              shadowOffset: { width: 0, height: 4 },
              elevation: 2,
            }}
          >
            <Txt size={12} weight="semibold" color={SUBTLE} lineHeight={14.06}>
              {n}
            </Txt>
          </View>
        ))}
      </Abs>

      {/* "Your Link is Ready!" — 7489:43922 */}
      <Txt
        x={41}
        y={453}
        w={293}
        size={18}
        weight="medium"
        font="inter"
        color={INK}
        lineHeight={23}
      >
        Your Link is Ready!
      </Txt>

      {/* Link row — Overlay+Border+Shadow 7487:43781 */}
      <Abs
        x={41}
        y={488}
        w={293}
        h={50}
        radius={16}
        bg="rgba(255,255,255,0.4)"
        border={HAIRLINE}
        borderWidth={1}
        style={{
          shadowColor: "#000000",
          shadowOpacity: 0.02,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: 4 },
          elevation: 1,
        }}
      />

      {/* 7489:43918 — the generated, agency-scoped creator link */}
      <Txt
        x={58}
        y={504}
        w={192}
        size={14}
        weight="medium"
        font="inter"
        color={SUBTLE}
        lineHeight={17.5}
        numberOfLines={1}
      >
        {link}
      </Txt>

      {/* Share/copy button — 7487:43783 */}
      <Pressable
        onPress={shareLink}
        hitSlop={8}
        style={({ pressed }) => ({
          position: "absolute",
          left: 291,
          top: 495,
          width: 36,
          height: 36,
          borderRadius: 12,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: colors.white,
          borderWidth: 1,
          borderColor: "rgba(210,200,230,0.4)",
          shadowColor: "#000000",
          shadowOpacity: 0.04,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 4 },
          elevation: 2,
          opacity: pressed ? 0.7 : 1,
        })}
      >
        {/* lucide:share 7489:43916 */}
        <Icon size={20} stroke="rgba(0,0,0,0.8)">
          <Path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
          <Path d="m16 6-4-4-4 4" />
          <Path d="M12 2v13" />
        </Icon>
      </Pressable>

      {/* Checklist Steps — 7487:43736, rows at 559 / 649 / 739 (step 90) */}
      {STEPS.map((step, i) => (
        <Pressable
          key={step.label}
          onPress={i === 0 ? openInstagram : undefined}
          disabled={i !== 0}
          style={({ pressed }) => ({
            position: "absolute",
            left: 20,
            top: step.y,
            width: 335,
            height: 78,
            borderRadius: 20,
            backgroundColor: "rgba(255,255,255,0.6)",
            borderWidth: 1,
            borderColor: "rgba(255,255,255,0.85)",
            shadowColor: "#d2c8e6",
            shadowOpacity: 0.15,
            shadowRadius: 24,
            shadowOffset: { width: 0, height: 8 },
            elevation: 3,
            opacity: pressed ? 0.85 : 1,
          })}
        >
          {/* Background+Border+Shadow icon tile — 44x44 at +17 */}
          <LinearGradient
            colors={step.tint}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              position: "absolute",
              left: 16,
              top: 16,
              width: 44,
              height: 44,
              borderRadius: 14,
              alignItems: "center",
              justifyContent: "center",
              borderWidth: 1,
              borderColor: step.edge,
              shadowColor: "#000000",
              shadowOpacity: 0.05,
              shadowRadius: 12,
              shadowOffset: { width: 0, height: 4 },
              elevation: 2,
            }}
          >
            <StepIcon index={i} />
          </LinearGradient>

          {/* Step label — 7487:43746 / 43754 / 43764 */}
          <Txt
            x={76}
            y={29}
            size={15}
            weight="semibold"
            font="inter"
            color={INK}
            lineHeight={18.15}
            letterSpacing={-0.2}
          >
            {step.label}
          </Txt>
        </Pressable>
      ))}

      {/* Bottom CTA — Button 7487:43766 */}
      <Pressable
        onPress={onVerify}
        style={({ pressed }) => ({
          position: "absolute",
          left: 20,
          top: 924,
          width: 335,
          height: 58,
          borderRadius: 100,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: 10.01,
          backgroundColor: PRIMARY,
          borderWidth: 1,
          borderColor: "rgba(255,255,255,0.4)",
          opacity: pressed || verify.isPending ? 0.85 : 1,
        })}
      >
        <Txt
          size={17}
          weight="bold"
          color={colors.white}
          lineHeight={19.92}
          align="center"
        >
          Verify Profile
        </Txt>
        {/* iconify-icon 7487:43770 (arrow-right) */}
        <Icon size={20} stroke={colors.white}>
          <Path d="M5 12h14" />
          <Path d="m12 5 7 7-7 7" />
        </Icon>
      </Pressable>

      {/* Verification failed — retry is the CTA itself, so nothing above moves. */}
      {verify.isError ? (
        <Txt
          x={20}
          y={990}
          w={335}
          size={14}
          weight="medium"
          font="inter"
          color={colors.danger}
          lineHeight={17.5}
          align="center"
        >
          We could not find your link yet. Tap Verify Profile to try again.
        </Txt>
      ) : null}
    </Screen>
  );
}
