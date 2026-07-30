import { useMemo, useRef, useState } from "react";
import {
  Animated,
  Image,
  PanResponder,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Svg, {
  Defs,
  LinearGradient as SvgLinear,
  RadialGradient,
  Rect,
  Stop,
} from "react-native-svg";
import { Abs, Screen, Txt } from "../../../../src/ui/Frame";
import { colors } from "../../../../src/theme";
import { useCreators, type Creator } from "../../../../src/api/hooks";

/**
 * Videographers — Figma 7348:19700 (375x875).
 *
 * Traced 1:1: glass header with the "20 Jun" date pill, a horizontally
 * scrolling category chip row at y=106, the 3-card stacked swipe deck between
 * y=188 and y=731, and the fixed bottom bar carrying the three shoot-type tier
 * buttons and the city dropdown. Coordinates below are raw frame coordinates
 * from the spec; <Screen> scales the 375pt canvas to the device.
 */

/* ------------------------------- geometry -------------------------------- */
const FRAME_W = 375;
const FRAME_H = 875;

/* --------------------------- spec colour tokens --------------------------- */
const INK = "#1D1D1F";
const INK_MUTED = "#6E6E73";
const INK_LABEL = "#8A8A8E";
const GLASS_65 = "rgba(255,255,255,0.65)";
const GLASS_50 = "rgba(255,255,255,0.5)";
const GLASS_70 = "rgba(255,255,255,0.7)";
const GLASS_80 = "rgba(255,255,255,0.8)";
const GLASS_85 = "rgba(255,255,255,0.85)";
const RATE_FROM = "#F3EBFF";
const RATE_TO = "#EAF5FF";
const CTA_INK = "#312B28";

/* ------------------------------ chip row --------------------------------- */
/** The four category pills; the last one deliberately runs past the frame. */
const CATEGORIES: { label: string; x: number; w: number }[] = [
  { label: "✨ Fashion", x: 20, w: 106.08 },
  { label: "✈️ Travel", x: 138.08, w: 94.2 },
  { label: "🎉 Event", x: 244.28, w: 90.64 },
  { label: "💄 Beauty", x: 346.92, w: 100.16 },
];
const CHIP_ROW_W = 467.08; // 346.92 + 100.16 + 20 trailing inset

/** The word the chip filters `niche` on, with the emoji prefix stripped. */
const CATEGORY_NICHE = ["Fashion", "Travel", "Event", "Beauty"];

/* ----------------------------- shoot tiers -------------------------------- */
/** Three heat tiers; each fire glyph carries its own palette in the spec. */
const SHOOT_TIERS: { x: number; fire: string }[] = [
  { x: 20, fire: "#F1B31C" },
  { x: 72, fire: "#FF9800" },
  { x: 124, fire: "#FF5141" },
];

/* -------------------------------- the deck -------------------------------- */
/**
 * Slot geometry for the three stacked cards. Slot 0 is the face-up card and is
 * the only one the spec draws in full; slots 1 and 2 peek out behind it at
 * reduced opacity with just a name and a rate chip.
 */
const SLOT_BACK = {
  x: 30.47, y: 266.63, w: 314.02, h: 436.74,
  opacity: 0.3,
  img: { x: 34.3, y: 16.57, w: 263.15, h: 200.97 },
  name: { x: 30.3, y: 213.82, w: 249.89 },
  chip: { x: 16.54, y: 368.46, w: 143.09, h: 42.76 },
  chipText: { x: 14.15, y: 9.24, w: 114.78 },
  rate: "₹7000 | 4 Hrs Shoot",
} as const;

const SLOT_MID = {
  x: 29, y: 246.1, w: 316.97, h: 451.81,
  opacity: 0.5,
  img: { x: 16.97, y: 16.97, w: 271.78, h: 203.46 },
  name: { x: 27.91, y: 236.23, w: 263.38 },
  chip: { x: 36.46, y: 394.76, w: 150.74, h: 40.07 },
  chipText: { x: 14.68, y: 9.29, w: 121.39 },
  rate: "₹6000 | 2 Hrs Shoot",
} as const;

const TOP = { x: 35, y: 222, w: 310, h: 460 };
const TOP_RATE = "₹5000 | 2 Hrs Shoot";
const SWIPE_THRESHOLD = 90;

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

/* ------------------------------- card media -------------------------------- */
/**
 * The showreel still. The spec paints an IMAGE fill whose bytes live in Figma,
 * so a real avatar is used when the record carries one and the card's own
 * lilac→sky gradient stands in when it does not.
 */
function Media({
  x, y, w, h, radius, uri,
}: { x: number; y: number; w: number; h: number; radius: number; uri?: string }) {
  if (uri) {
    return (
      <Image
        source={{ uri }}
        style={{ position: "absolute", left: x, top: y, width: w, height: h, borderRadius: radius }}
        resizeMode="cover"
      />
    );
  }
  return (
    <LinearGradient
      colors={[RATE_FROM, RATE_TO] as const}
      start={{ x: 0.2, y: 0 }}
      end={{ x: 0.8, y: 1 }}
      style={{ position: "absolute", left: x, top: y, width: w, height: h, borderRadius: radius }}
    />
  );
}

/* ------------------------------ rate chip --------------------------------- */
function RateChip({
  x, y, w, h, textX, textY, textW, icon, label,
}: {
  x: number; y: number; w: number; h: number;
  textX: number; textY: number; textW: number; icon?: boolean; label: string;
}) {
  return (
    <LinearGradient
      colors={[RATE_FROM, RATE_TO] as const}
      start={{ x: 0.2, y: -1 }}
      end={{ x: 0.8, y: 2 }}
      style={[styles.rateChip, { left: x, top: y, width: w, height: h }]}
    >
      {icon ? (
        <View style={styles.rateIcon}>
          <Feather name="tag" size={14} color={INK} />
        </View>
      ) : null}
      <Txt
        x={textX}
        y={textY}
        w={textW}
        size={13}
        weight="bold"
        font="inter"
        color={INK}
        lineHeight={15.73}
        numberOfLines={1}
      >
        {label}
      </Txt>
    </LinearGradient>
  );
}

/* ------------------------------- back card -------------------------------- */
type Slot = typeof SLOT_BACK | typeof SLOT_MID;

/** Slots 1 and 2 of the deck: shell, dimmed still, name and rate chip only. */
function BackCard({ slot, creator }: { slot: Slot; creator?: Creator }) {
  return (
    <Abs x={slot.x} y={slot.y} w={slot.w} h={slot.h} radius={32} bg={GLASS_70} style={styles.cardShell}>
      <Abs x={0} y={0} w={slot.w} h={slot.h} opacity={slot.opacity}>
        <Media
          x={slot.img.x}
          y={slot.img.y}
          w={slot.img.w}
          h={slot.img.h}
          radius={20}
          uri={creator?.avatarUrl}
        />
        <Txt
          x={slot.name.x}
          y={slot.name.y}
          w={slot.name.w}
          size={26}
          weight="bold"
          font="inter"
          color={INK}
          lineHeight={31.46}
          letterSpacing={-0.5}
          numberOfLines={1}
        >
          {creator?.name ?? ""}
        </Txt>
        <RateChip
          x={slot.chip.x}
          y={slot.chip.y}
          w={slot.chip.w}
          h={slot.chip.h}
          textX={slot.chipText.x}
          textY={slot.chipText.y}
          textW={slot.chipText.w}
          label={slot.rate}
        />
      </Abs>
    </Abs>
  );
}

/* --------------------------------- screen --------------------------------- */
export default function Videographers() {
  const router = useRouter();
  const { data: creators = [], isLoading } = useCreators();

  const [categoryIdx, setCategoryIdx] = useState(0);
  const [tierIdx, setTierIdx] = useState(1); // the middle tier is lit in the spec
  const [cityIdx, setCityIdx] = useState(0);
  const [cursor, setCursor] = useState(0);

  /** The category chip narrows the roster on `niche`. */
  const byCategory = useMemo(
    () => creators.filter((c) => (c.niche ?? "") === CATEGORY_NICHE[categoryIdx]),
    [creators, categoryIdx],
  );

  /** Distinct cities the category actually covers; the spec's "Delhi" is the fallback. */
  const cities = useMemo(() => {
    const seen: string[] = [];
    for (const c of byCategory) {
      if (c.location && !seen.includes(c.location)) seen.push(c.location);
    }
    return seen;
  }, [byCategory]);
  const city = cities[cityIdx % Math.max(cities.length, 1)] ?? "Delhi";

  /** SELECT CITY deals the chosen city's videographers to the front of the deck. */
  const pool = useMemo(
    () =>
      [...byCategory].sort(
        (a, b) => Number(b.location === city) - Number(a.location === city),
      ),
    [byCategory, city],
  );

  /** Three stacked slots, or fewer when the filters leave fewer candidates. */
  const deck = useMemo(
    () =>
      Array.from(
        { length: Math.min(3, pool.length) },
        (_v, i) => pool[(cursor + i) % pool.length],
      ) as Creator[],
    [pool, cursor],
  );

  const top = deck[0];

  /* Swipe: drag the face-up card, release past the threshold to advance. */
  const pan = useRef(new Animated.Value(0)).current;
  const responder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_e, g) => Math.abs(g.dx) > 8,
        onPanResponderMove: Animated.event([null, { dx: pan }], { useNativeDriver: false }),
        onPanResponderRelease: (_e, g) => {
          if (Math.abs(g.dx) < SWIPE_THRESHOLD) {
            Animated.spring(pan, { toValue: 0, useNativeDriver: false }).start();
            return;
          }
          Animated.timing(pan, {
            toValue: g.dx > 0 ? FRAME_W : -FRAME_W,
            duration: 180,
            useNativeDriver: false,
          }).start(() => {
            pan.setValue(0);
            setCursor((c) => c + 1);
          });
        },
      }),
    [pan],
  );

  const rotate = pan.interpolate({
    inputRange: [-FRAME_W, 0, FRAME_W],
    outputRange: ["-8deg", "0deg", "8deg"],
  });

  const specialism = top?.niche ? `${top.niche} & Lifestyle Videographer` : "";
  const credits = "5 yrs exp. • Works with Nykaa, H&M";
  const emptyLine = isLoading ? "" : "No videographers";

  return (
    <Screen height={FRAME_H} background="#F7F0E4" scroll>
      <Backdrop />

      {/* ------------------------------ Header ------------------------------ */}
      <Pressable
        onPress={() => router.back()}
        style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
      >
        <Feather name="arrow-left" size={20} color={INK} />
      </Pressable>

      <Abs x={85.8} y={19.5} w={174} h={41} radius={24} bg={GLASS_65} style={styles.glassShadow}>
        <Txt
          x={19}
          y={11}
          w={112}
          size={15}
          weight="bold"
          font="inter"
          color={INK}
          lineHeight={18.15}
          align="center"
        >
          Videographers
        </Txt>
        <View style={styles.headerCaret}>
          <Feather name="chevron-down" size={18} color={INK} />
        </View>
      </Abs>

      <Abs x={286.59} y={21} w={73.41} h={38} radius={24} bg={GLASS_65} style={styles.glassShadow}>
        <Txt x={15} y={11} w={43.41} size={13} weight="semibold" font="inter" color={INK_MUTED} lineHeight={15.73}>
          20 Jun
        </Txt>
      </Abs>

      {/* ---------------------------- Category row --------------------------- */}
      <Abs x={0} y={106} w={FRAME_W} h={40}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.chipScroller}
          contentContainerStyle={{ width: CHIP_ROW_W, height: 40 }}
        >
          {CATEGORIES.map((c, i) => {
            const active = i === categoryIdx;
            return (
              <Pressable
                key={c.label}
                onPress={() => {
                  setCategoryIdx(i);
                  setCursor(0);
                }}
                style={[
                  styles.chip,
                  { left: c.x, width: c.w },
                  active ? styles.chipActive : styles.chipIdle,
                ]}
              >
                {active ? (
                  <LinearGradient
                    colors={["#E6D4FF", "#FFD4E5"] as const}
                    start={{ x: 0.16, y: -0.43 }}
                    end={{ x: 0.84, y: 1.43 }}
                    style={StyleSheet.absoluteFill}
                  />
                ) : null}
                <Txt
                  size={14}
                  weight="semibold"
                  font="inter"
                  color={active ? INK : INK_MUTED}
                  lineHeight={16.94}
                  align="center"
                >
                  {c.label}
                </Txt>
              </Pressable>
            );
          })}
        </ScrollView>
      </Abs>

      {/* ------------------------------- Deck -------------------------------- */}
      <Abs x={0} y={188} w={FRAME_W} h={543}>
        <Abs x={0} y={-188} w={FRAME_W} h={FRAME_H}>
          {deck[2] ? <BackCard slot={SLOT_BACK} creator={deck[2]} /> : null}
          {deck[1] ? <BackCard slot={SLOT_MID} creator={deck[1]} /> : null}

          <Animated.View
            {...responder.panHandlers}
            style={[styles.topCard, { transform: [{ translateX: pan }, { rotate }] }]}
          >
            <Abs x={17} y={17} w={276} h={200} radius={20} style={styles.clip}>
              <Media x={0} y={-1.5} w={276} h={203} radius={6.63} uri={top?.avatarUrl} />
            </Abs>

            <Txt
              x={17}
              y={237}
              w={208.2}
              size={26}
              weight="bold"
              font="inter"
              color={INK}
              lineHeight={31.46}
              letterSpacing={-0.5}
              numberOfLines={1}
            >
              {top?.name ?? ""}
            </Txt>

            <Abs x={225.2} y={237} w={67.8} h={27} radius={12} bg={GLASS_80} style={styles.cityPill}>
              <View style={styles.cityPillIcon}>
                <Feather name="map-pin" size={14} color={INK_MUTED} />
              </View>
              <Txt
                x={28}
                y={6}
                w={29.8}
                size={12}
                weight="bold"
                font="inter"
                color={INK_MUTED}
                lineHeight={14.52}
                numberOfLines={1}
              >
                {top?.location ?? "Delhi"}
              </Txt>
            </Abs>

            <Txt
              x={17}
              y={276}
              w={276}
              size={14}
              weight="medium"
              font="inter"
              color={INK_MUTED}
              lineHeight={21}
              numberOfLines={2}
            >
              {top ? `${specialism}\n${credits}` : emptyLine}
            </Txt>

            <RateChip
              x={17}
              y={335}
              w={176.75}
              h={34}
              textX={35}
              textY={9}
              textW={126.75}
              icon
              label={TOP_RATE}
            />

            <Pressable
              onPress={() => {
                if (top) router.push(`/creators/${top.id}` as never);
              }}
              style={({ pressed }) => [styles.cta, pressed && styles.pressed]}
            >
              <Txt
                x={86.5}
                y={16}
                w={103}
                size={16}
                weight="bold"
                font="inter"
                color={colors.white}
                lineHeight={19.36}
                align="center"
              >
                View profile
              </Txt>
            </Pressable>
          </Animated.View>
        </Abs>
      </Abs>

      {/* ----------------------------- Bottom bar ---------------------------- */}
      <Abs x={0} y={757} w={FRAME_W} h={118}>
        <Txt
          x={24}
          y={8}
          w={144}
          size={11}
          weight="bold"
          font="inter"
          color={INK_LABEL}
          lineHeight={13.31}
          letterSpacing={0.5}
        >
          SELECT YOUR SHOOT TYPE
        </Txt>

        {SHOOT_TIERS.map((t, i) => {
          const active = i === tierIdx;
          return (
            <Pressable
              key={t.x}
              onPress={() => setTierIdx(i)}
              style={[styles.tierButton, { left: t.x }, active ? styles.tierActive : styles.tierIdle]}
            >
              {active ? (
                <LinearGradient
                  colors={["#1D1D1F", "#3A3A3C"] as const}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={StyleSheet.absoluteFill}
                />
              ) : null}
              <MaterialCommunityIcons name="fire" size={20} color={t.fire} />
            </Pressable>
          );
        })}

        <Txt
          x={236}
          y={20}
          w={77.08}
          size={11}
          weight="bold"
          font="inter"
          color={INK_LABEL}
          lineHeight={13.31}
          letterSpacing={0.5}
        >
          SELECT CITY
        </Txt>

        <Pressable
          onPress={() => {
            if (cities.length > 1) {
              setCityIdx((n) => (n + 1) % cities.length);
              setCursor(0);
            }
          }}
          style={({ pressed }) => [styles.cityButton, pressed && styles.pressed]}
        >
          <View style={styles.cityButtonIcon}>
            <Feather name="map-pin" size={16} color={INK} />
          </View>
          <Txt
            x={43}
            y={13.5}
            w={34.77}
            size={14}
            weight="bold"
            font="inter"
            color={INK}
            lineHeight={16.94}
            align="center"
            numberOfLines={1}
          >
            {city}
          </Txt>
          <View style={styles.cityButtonCaret}>
            <Feather name="chevron-down" size={18} color={INK} />
          </View>
        </Pressable>
      </Abs>
    </Screen>
  );
}

const styles = StyleSheet.create({
  backdrop: { position: "absolute", left: 0, top: 0 },
  clip: { overflow: "hidden" },
  pressed: { opacity: 0.9 },

  /* header */
  backButton: {
    position: "absolute",
    left: 15,
    top: 18,
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: GLASS_65,
    shadowColor: "#000000",
    shadowOpacity: 0.03,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
  },
  glassShadow: {
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.7)",
    shadowColor: "#000000",
    shadowOpacity: 0.03,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
  },
  headerCaret: { position: "absolute", left: 137, top: 11.5 },

  /* category chips */
  chipScroller: { width: FRAME_W, height: 40 },
  chip: {
    position: "absolute",
    top: 0,
    height: 40,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  chipActive: {
    borderWidth: 1,
    borderColor: "#FFFFFF",
    shadowColor: "#000000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
  },
  chipIdle: {
    backgroundColor: GLASS_50,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.4)",
    shadowColor: "#000000",
    shadowOpacity: 0.02,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
  },

  /* deck */
  cardShell: {
    borderWidth: 1,
    borderColor: "#FFFFFF",
    shadowColor: "#000000",
    shadowOpacity: 0.06,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 20 },
    elevation: 2,
  },
  topCard: {
    position: "absolute",
    left: TOP.x,
    top: TOP.y,
    width: TOP.w,
    height: TOP.h,
    borderRadius: 32,
    backgroundColor: GLASS_85,
    borderWidth: 1,
    borderColor: "#FFFFFF",
    shadowColor: "#000000",
    shadowOpacity: 0.06,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 20 },
    elevation: 4,
  },
  cityPill: {
    shadowColor: "#000000",
    shadowOpacity: 0.02,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 2 },
  },
  cityPillIcon: { position: "absolute", left: 10, top: 6.5 },
  rateChip: {
    position: "absolute",
    borderRadius: 16,
    shadowColor: "#000000",
    shadowOpacity: 0.03,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 4 },
  },
  rateIcon: { position: "absolute", left: 15, top: 10 },
  cta: {
    position: "absolute",
    left: 17,
    top: 391,
    width: 276,
    height: 52,
    borderRadius: 24,
    backgroundColor: CTA_INK,
    shadowColor: "#000000",
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },

  /* bottom bar */
  tierButton: {
    position: "absolute",
    top: 42,
    width: 44,
    height: 44,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  tierIdle: {
    backgroundColor: GLASS_65,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.7)",
    shadowColor: "#000000",
    shadowOpacity: 0.03,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
  },
  tierActive: {
    shadowColor: "#000000",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  cityButton: {
    position: "absolute",
    left: 232.23,
    top: 42,
    width: 122.77,
    height: 44,
    borderRadius: 16,
    backgroundColor: GLASS_65,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.7)",
    shadowColor: "#000000",
    shadowOpacity: 0.03,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
  },
  cityButtonIcon: { position: "absolute", left: 19, top: 14 },
  cityButtonCaret: { position: "absolute", left: 85.77, top: 13 },
});
