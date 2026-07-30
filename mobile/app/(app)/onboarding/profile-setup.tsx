import { useState } from "react";
import { Image, Pressable, TextInput } from "react-native";
import Svg, { Circle, Path, Rect } from "react-native-svg";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Abs, Screen, Txt } from "../../../src/ui/Frame";
import { colors, fonts } from "../../../src/theme";
import { useCreators, useMe, useUpdate, type Creator } from "../../../src/api/hooks";

/**
 * Onboarding — "Profile Setup" (Figma 7485:43606, 375x1394).
 *
 * The long form of the creator onboarding flow: preview card, bio, niches,
 * creator type, location + socials, then Save & Continue. Agency-managed
 * creators land here with a record already in the backend, so the identity
 * fields prefill from it and every edit falls back to the design's literal
 * until the user (or the API) supplies something else.
 */

/* Spec palette — these hexes appear only on this frame, so they stay local. */
const INK = "#1f1a17";
const SUBTLE = "#787486";
const HINT = "#a0aec0";
const PURPLE = "#b794f4";
const PURPLE_TEXT = "#805ad5";
const PINK = "#ffb1c6";
const PINK_TEXT = "#d53f8c";
const CANVAS = "#fffdf9";
const BUTTON = "#312b28";
const ARROW_INK = "#1a1820";

const CARD_BG = "rgba(255,255,255,0.55)";
const CARD_LINE = "rgba(255,255,255,0.9)";
const FIELD_BG = "rgba(255,255,255,0.7)";

/** Drop shadow shared by the five glass cards — #b794f40f, 24px, y+8. */
const CARD_SHADOW = {
  shadowColor: PURPLE,
  shadowOpacity: 0.06,
  shadowRadius: 24,
  shadowOffset: { width: 0, height: 8 },
  elevation: 3,
} as const;

/** Drop shadow on the pills and the two creator-type tiles — #00000005, 8px, y+2. */
const PILL_SHADOW = {
  shadowColor: colors.ink,
  shadowOpacity: 0.02,
  shadowRadius: 8,
  shadowOffset: { width: 0, height: 2 },
  elevation: 1,
} as const;

/**
 * The four "Overlay+Blur" circles carry a 60px layer blur. React Native has no
 * layer-blur primitive, so each is drawn as concentric discs whose stacked
 * alpha sums to the spec opacity — a soft falloff at the spec's exact centre,
 * size and colour.
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

/** One of the five glass cards: 24pt radius, translucent white, hairline rim. */
function Card({ x, y, w, h }: { x: number; y: number; w: number; h: number }) {
  return (
    <Abs
      x={x}
      y={y}
      w={w}
      h={h}
      radius={24}
      bg={CARD_BG}
      border={CARD_LINE}
      borderWidth={1}
      style={CARD_SHADOW}
    />
  );
}

/* Niche pills — every pill's box and label geometry is lifted from 7485:43653. */
const NICHES = [
  { label: "Fashion", x: 45, y: 643.09, w: 87.03, tx: 62, tw: 53.03 },
  { label: "Lifestyle", x: 142.03, y: 643.09, w: 92.13, tx: 159.03, tw: 58.13 },
  { label: "Beauty", x: 244.16, y: 643.09, w: 81, tx: 261.16, tw: 47 },
  { label: "Travel", x: 45, y: 688.09, w: 75, tx: 62, tw: 41 },
  { label: "Aesthetic", x: 129.97, y: 688.09, w: 99, tx: 146.97, tw: 65 },
] as const;

/** The design ships Fashion + Lifestyle lit; used until the record says otherwise. */
const DEFAULT_NICHES = ["Fashion", "Lifestyle"];

/* The three DETAILS rows share one geometry, so they're described once. */
const DETAIL_ROWS = [1044.09, 1104.09, 1164.09];

export default function ProfileSetup() {
  const router = useRouter();
  const { data: me } = useMe();
  const { data: creators, isLoading } = useCreators();
  const save = useUpdate<Creator>("creators");

  // Agency-managed creators already exist server-side; match the signed-in user
  // to their creator row so the identity fields arrive pre-populated.
  const profile = creators?.find((c) => c.name === me?.name) ?? creators?.[0];

  const prefillName = profile?.name ?? "Sophia Roy";
  const rawHandle = profile?.handle?.replace(/^@/, "");
  const prefillHandle = rawHandle ? `@${rawHandle}` : "@sophiaroy";
  const prefillCity = profile?.location ?? "Mumbai, India";
  const prefillInstagram = rawHandle
    ? `instagram.com/${rawHandle}`
    : "instagram.com/sophiaroy";
  const recordNiches = NICHES.filter((n) =>
    (profile?.niche ?? "").toLowerCase().includes(n.label.toLowerCase()),
  ).map((n) => n.label);

  // Each field is null until touched, so a late-arriving record still prefills.
  const [nameEdit, setNameEdit] = useState<string | null>(null);
  const [handleEdit, setHandleEdit] = useState<string | null>(null);
  const [cityEdit, setCityEdit] = useState<string | null>(null);
  const [instagramEdit, setInstagramEdit] = useState<string | null>(null);
  const [nicheEdit, setNicheEdit] = useState<string[] | null>(null);
  const [bio, setBio] = useState("");
  const [youtube, setYoutube] = useState("");
  const [creatorType, setCreatorType] = useState<"content" | "ugc">("content");

  const name = nameEdit ?? prefillName;
  const handle = handleEdit ?? prefillHandle;
  const city = cityEdit ?? prefillCity;
  const instagram = instagramEdit ?? prefillInstagram;
  const picked =
    nicheEdit ?? (recordNiches.length > 0 ? recordNiches : DEFAULT_NICHES);

  const toggleNiche = (label: string) =>
    setNicheEdit(
      picked.includes(label) ? picked.filter((n) => n !== label) : [...picked, label],
    );

  const onSave = () => {
    if (profile) {
      save.mutate({
        id: profile.id,
        data: {
          name,
          handle,
          location: city,
          niche: picked.join(", "),
        },
      });
    }
    router.push("/profile-verify-link");
  };

  return (
    <Screen height={1394} background={CANVAS} scroll>
      {/* Soft Dreamy Background — 7485:43714 */}
      <Abs x={0} y={-0.5} w={375} h={1395} bg={CANVAS} style={{ overflow: "hidden" }}>
        <Blob x={162.5} y={-81.19} size={250} color="#fde047" opacity={0.25} />
        <Blob x={-75} y={81.19} size={320} color={PINK} opacity={0.4} />
        <Blob x={37.5} y={871.41} size={280} color={PURPLE} opacity={0.3} />
        <Blob x={131.25} y={1013.81} size={300} color="#93c5fd" opacity={0.35} />

        {/* Gradient — 7485:43719 */}
        <LinearGradient
          colors={["rgba(255,255,255,0.05)", "rgba(255,255,255,0)"]}
          start={{ x: -0.29, y: 0.87 }}
          end={{ x: 1.29, y: 0.13 }}
          style={{
            position: "absolute", left: 0, top: 0, width: 375, height: 1395, opacity: 0.6,
          }}
        />
      </Abs>

      {/* ------------------------------ Top Nav 7485:43609 ---------------------------- */}
      <Pressable
        onPress={() => router.back()}
        hitSlop={8}
        style={({ pressed }) => ({
          position: "absolute",
          left: 24,
          top: 15.5,
          width: 40,
          height: 40,
          borderRadius: 20,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "rgba(255,255,255,0.6)",
          borderWidth: 1,
          borderColor: "rgba(255,255,255,0.8)",
          shadowColor: colors.ink,
          shadowOpacity: 0.03,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: 4 },
          elevation: 2,
          opacity: pressed ? 0.7 : 1,
        })}
      >
        {/* iconify-icon → SVG 7485:43611 / Vector 7485:43612 */}
        <Svg width={20} height={20} viewBox="0 0 20 20">
          <Path
            d="M15.833 10H4.167M10 15.833 4.167 10 10 4.167"
            stroke={ARROW_INK}
            strokeWidth={1.67}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </Svg>
      </Pressable>

      {/* --------------------------- Heading 7485:43616 -------------------------- */}
      <Txt
        x={24}
        y={70.5}
        w={327}
        size={28}
        weight="medium"
        color={INK}
        lineHeight={33.6}
        letterSpacing={-0.5}
        align="center"
      >
        Profile Setup
      </Txt>
      <Txt
        x={24}
        y={113.09}
        w={327}
        size={15}
        weight="medium"
        font="inter"
        color={SUBTLE}
        lineHeight={18.15}
        align="center"
      >
        Customize your creator identity.
      </Txt>

      {/* ---------------------- Profile Preview Card 7485:43621 ------------------ */}
      <Abs
        x={24}
        y={156.09}
        w={327}
        h={245}
        radius={24}
        bg={CARD_BG}
        border={CARD_LINE}
        borderWidth={1}
        style={[CARD_SHADOW, { overflow: "hidden" }]}
      >
        {/* Background band 7485:43622 */}
        <LinearGradient
          colors={["rgba(255,177,198,0.7)", "rgba(183,148,244,0.7)"]}
          start={{ x: 0.17, y: -0.49 }}
          end={{ x: 0.83, y: 1.49 }}
          style={{ position: "absolute", left: 0, top: 0, width: 325, height: 110 }}
        />
      </Abs>

      {/* Creator Avatar 7485:43631 */}
      <Abs
        x={143.5}
        y={223.09}
        w={88}
        h={88}
        radius={44}
        bg={colors.white}
        border={CANVAS}
        borderWidth={4}
        style={{
          overflow: "hidden",
          shadowColor: PURPLE,
          shadowOpacity: 0.15,
          shadowRadius: 16,
          shadowOffset: { width: 0, height: 8 },
          elevation: 4,
        }}
      >
        {profile?.avatarUrl ? (
          <Image
            source={{ uri: profile.avatarUrl }}
            style={{ position: "absolute", left: 0, top: 0, width: 80, height: 80 }}
          />
        ) : null}
      </Abs>

      {/* Camera badge 7485:43632 */}
      <Abs
        x={207.5}
        y={279.09}
        w={28}
        h={28}
        radius={14}
        bg={colors.white}
        border={CANVAS}
        borderWidth={2}
        center
        style={{
          shadowColor: colors.ink,
          shadowOpacity: 0.1,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 4 },
          elevation: 3,
        }}
      >
        {/* iconify-icon → SVG 7485:43633 */}
        <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
          <Path
            d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"
            stroke={PURPLE}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Circle cx={12} cy={13} r={3} stroke={PURPLE} strokeWidth={2} />
        </Svg>
      </Abs>

      {/* Name input 7485:43638 / 7485:43640 — live creator record */}
      <TextInput
        value={name}
        onChangeText={setNameEdit}
        style={{
          position: "absolute",
          left: 45,
          top: 323.09,
          width: 285,
          height: 29,
          padding: 0,
          textAlign: "center",
          fontFamily: fonts.interMedium,
          fontSize: 22,
          color: INK,
          includeFontPadding: false,
        }}
      />

      {/* Handle input 7485:43641 / 7485:43643 — live creator record */}
      <TextInput
        value={handle}
        onChangeText={setHandleEdit}
        autoCapitalize="none"
        style={{
          position: "absolute",
          left: 45,
          top: 356.09,
          width: 285,
          height: 20,
          padding: 0,
          textAlign: "center",
          fontFamily: fonts.interMedium,
          fontSize: 15,
          color: SUBTLE,
          includeFontPadding: false,
        }}
      />

      {/* ------------------------- Bio Card 7485:43644 --------------------------- */}
      <Card x={24} y={417.09} w={327} h={156} />
      <Txt
        x={45}
        y={438.09}
        w={285}
        size={13}
        weight="bold"
        font="inter"
        color={INK}
        lineHeight={15.73}
        letterSpacing={0.5}
      >
        CREATOR BIO
      </Txt>
      {/* Textarea 7485:43647 / placeholder 7485:43649 */}
      <TextInput
        value={bio}
        onChangeText={setBio}
        multiline
        placeholder={"Tell brands about your aesthetic, \naudience, and what makes your \ncontent unique..."}
        placeholderTextColor={SUBTLE}
        textAlignVertical="top"
        style={{
          position: "absolute",
          left: 45,
          top: 468.09,
          width: 285,
          height: 84,
          borderRadius: 16,
          backgroundColor: FIELD_BG,
          borderWidth: 1,
          borderColor: CARD_LINE,
          paddingTop: 14,
          paddingBottom: 14,
          paddingLeft: 16,
          paddingRight: 16,
          fontFamily: fonts.interMedium,
          fontSize: 15,
          color: SUBTLE,
          includeFontPadding: false,
        }}
      />

      {/* ------------------------ Niches Card 7485:43650 ------------------------- */}
      <Card x={24} y={592.09} w={327} h={197} />
      <Txt
        x={45}
        y={613.09}
        w={285}
        size={13}
        weight="bold"
        font="inter"
        color={INK}
        lineHeight={15.73}
        letterSpacing={0.5}
      >
        YOUR NICHES
      </Txt>
      {NICHES.map((n) => {
        const on = picked.includes(n.label);
        return (
          <Pressable
            key={n.label}
            onPress={() => toggleNiche(n.label)}
            style={({ pressed }) => ({
              position: "absolute",
              left: n.x,
              top: n.y,
              width: n.w,
              height: 35,
              borderRadius: 20,
              backgroundColor: on ? "rgba(183,148,244,0.15)" : FIELD_BG,
              borderWidth: 1,
              borderColor: on ? PURPLE : CARD_LINE,
              ...PILL_SHADOW,
              opacity: pressed ? 0.75 : 1,
            })}
          >
            <Txt
              x={16}
              y={8}
              w={n.tw}
              size={14}
              weight={on ? "semibold" : "medium"}
              font="inter"
              color={on ? PURPLE_TEXT : SUBTLE}
              lineHeight={16.94}
              numberOfLines={1}
            >
              {n.label}
            </Txt>
          </Pressable>
        );
      })}
      {/* + Add Tag 7485:43664 */}
      <Abs
        x={45}
        y={733.09}
        w={103}
        h={35}
        radius={20}
        border="rgba(120,116,134,0.4)"
        borderWidth={1}
      />
      <Txt
        x={62}
        y={742.09}
        w={69}
        size={14}
        weight="medium"
        font="inter"
        color={SUBTLE}
        lineHeight={16.94}
      >
        + Add Tag
      </Txt>

      {/* ----------------------- Creator Type 7485:43666 ------------------------- */}
      <Card x={24} y={805.09} w={327} h={172} />
      <Txt
        x={45}
        y={826.09}
        w={285}
        size={13}
        weight="bold"
        font="inter"
        color={INK}
        lineHeight={15.73}
        letterSpacing={0.5}
      >
        CREATOR TYPE
      </Txt>

      {/* Content Creator 7485:43670 */}
      <Pressable
        onPress={() => setCreatorType("content")}
        style={({ pressed }) => ({
          position: "absolute",
          left: 45,
          top: 856.09,
          width: 136.5,
          height: 100,
          borderRadius: 16,
          backgroundColor:
            creatorType === "content" ? "rgba(255,177,198,0.2)" : FIELD_BG,
          borderWidth: 1,
          borderColor: creatorType === "content" ? PINK : CARD_LINE,
          ...PILL_SHADOW,
          opacity: pressed ? 0.8 : 1,
        })}
      />
      {/* iconify-icon → SVG 7485:43671 */}
      <Abs x={101.25} y={873.09} w={24} h={24}>
        <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
          <Path
            d="m22 8-6 4 6 4V8Z"
            stroke={creatorType === "content" ? PINK_TEXT : SUBTLE}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Rect
            x={2}
            y={6}
            width={14}
            height={12}
            rx={2}
            stroke={creatorType === "content" ? PINK_TEXT : SUBTLE}
            strokeWidth={2}
          />
        </Svg>
      </Abs>
      <Txt
        x={58}
        y={905}
        w={103}
        size={14}
        weight="medium"
        font="inter"
        color={creatorType === "content" ? PINK_TEXT : SUBTLE}
        lineHeight={16.94}
        align="center"
      >
        {"Content\nCreator"}
      </Txt>

      {/* UGC Creator 7485:43677 */}
      <Pressable
        onPress={() => setCreatorType("ugc")}
        style={({ pressed }) => ({
          position: "absolute",
          left: 193.5,
          top: 856.09,
          width: 136.5,
          height: 100,
          borderRadius: 16,
          backgroundColor: creatorType === "ugc" ? "rgba(255,177,198,0.2)" : FIELD_BG,
          borderWidth: 1,
          borderColor: creatorType === "ugc" ? PINK : CARD_LINE,
          ...PILL_SHADOW,
          opacity: pressed ? 0.8 : 1,
        })}
      />
      {/* iconify-icon → SVG 7485:43678 */}
      <Abs x={249.75} y={881.59} w={24} h={24}>
        <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
          <Path
            d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"
            stroke={creatorType === "ugc" ? PINK_TEXT : SUBTLE}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Path
            d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v3"
            stroke={creatorType === "ugc" ? PINK_TEXT : SUBTLE}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      </Abs>
      <Txt
        x={218.75}
        y={913.59}
        w={86}
        size={14}
        weight="medium"
        font="inter"
        color={creatorType === "ugc" ? PINK_TEXT : SUBTLE}
        lineHeight={16.94}
        align="center"
      >
        UGC Creator
      </Txt>

      {/* --------------------- Location & Socials 7485:43684 --------------------- */}
      <Card x={24} y={993.09} w={327} h={240} />
      <Txt
        x={45}
        y={1014.09}
        w={285}
        size={13}
        weight="bold"
        font="inter"
        color={INK}
        lineHeight={15.73}
        letterSpacing={0.5}
      >
        DETAILS
      </Txt>

      {/* Mumbai, India 7485:43688 — live creator.location */}
      <TextInput
        value={city}
        onChangeText={setCityEdit}
        placeholder="Mumbai, India"
        placeholderTextColor={HINT}
        style={{
          position: "absolute",
          left: 45,
          top: DETAIL_ROWS[0],
          width: 285,
          height: 48,
          borderRadius: 16,
          backgroundColor: FIELD_BG,
          borderWidth: 1,
          borderColor: CARD_LINE,
          paddingTop: 14,
          paddingBottom: 14,
          paddingLeft: 44,
          paddingRight: 16,
          fontFamily: fonts.interMedium,
          fontSize: 15,
          color: SUBTLE,
          includeFontPadding: false,
        }}
      />
      {/* iconify-icon 7485:43691 */}
      <Abs x={61} y={1059.59} w={18} h={18}>
        <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
          <Path
            d="M20 10c0 5.25-8 12-8 12s-8-6.75-8-12a8 8 0 1 1 16 0z"
            stroke={HINT}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Circle cx={12} cy={10} r={3} stroke={HINT} strokeWidth={2} />
        </Svg>
      </Abs>

      {/* instagram.com/sophiaroy 7485:43697 — derived from live creator.handle */}
      <TextInput
        value={instagram}
        onChangeText={setInstagramEdit}
        autoCapitalize="none"
        placeholder="instagram.com/sophiaroy"
        placeholderTextColor={HINT}
        style={{
          position: "absolute",
          left: 45,
          top: DETAIL_ROWS[1],
          width: 285,
          height: 48,
          borderRadius: 16,
          backgroundColor: FIELD_BG,
          borderWidth: 1,
          borderColor: CARD_LINE,
          paddingTop: 14,
          paddingBottom: 14,
          paddingLeft: 44,
          paddingRight: 16,
          fontFamily: fonts.interMedium,
          fontSize: 15,
          color: SUBTLE,
          includeFontPadding: false,
        }}
      />
      {/* iconify-icon 7485:43700 */}
      <Abs x={61} y={1119.59} w={18} h={18}>
        <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
          <Rect x={2} y={2} width={20} height={20} rx={5} stroke={HINT} strokeWidth={2} />
          <Path
            d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37zM17.5 6.5h.01"
            stroke={HINT}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      </Abs>

      {/* YouTube Link 7485:43706 */}
      <TextInput
        value={youtube}
        onChangeText={setYoutube}
        autoCapitalize="none"
        placeholder="YouTube Link"
        placeholderTextColor={HINT}
        style={{
          position: "absolute",
          left: 45,
          top: DETAIL_ROWS[2],
          width: 285,
          height: 48,
          borderRadius: 16,
          backgroundColor: FIELD_BG,
          borderWidth: 1,
          borderColor: CARD_LINE,
          paddingTop: 14,
          paddingBottom: 14,
          paddingLeft: 44,
          paddingRight: 16,
          fontFamily: fonts.interMedium,
          fontSize: 15,
          color: SUBTLE,
          includeFontPadding: false,
        }}
      />
      {/* iconify-icon 7485:43709 */}
      <Abs x={61} y={1179.59} w={18} h={18}>
        <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
          <Path
            d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17"
            stroke={HINT}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Path
            d="m10 15 5-3-5-3z"
            stroke={HINT}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      </Abs>

      {/* ------------------------ Bottom CTA 7502:44697 -------------------------- */}
      <Pressable
        onPress={onSave}
        disabled={isLoading || save.isPending}
        style={({ pressed }) => ({
          position: "absolute",
          left: 20,
          top: 1286,
          width: 335,
          height: 58,
          borderRadius: 100,
          backgroundColor: BUTTON,
          borderWidth: 1,
          borderColor: "rgba(255,255,255,0.4)",
          opacity: pressed ? 0.85 : 1,
        })}
      >
        <Txt
          x={88.5}
          y={18}
          w={126}
          size={17}
          weight="bold"
          font="inter"
          color={colors.white}
          lineHeight={19.92}
          align="center"
        >
          Save &amp; Continue{" "}
        </Txt>
        <Abs x={224.5} y={18} w={20} h={20}>
          <Svg width={20} height={20} viewBox="0 0 20 20" fill="none">
            <Path
              d="M4.167 10h11.666M10 4.167 15.833 10 10 15.833"
              stroke={colors.white}
              strokeWidth={1.67}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        </Abs>
      </Pressable>
    </Screen>
  );
}
