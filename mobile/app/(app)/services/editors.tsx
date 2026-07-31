import { useMemo, useState } from "react";
import { Image, Pressable, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Svg, {
  Defs,
  LinearGradient as SvgLinear,
  RadialGradient,
  Rect,
  Stop,
} from "react-native-svg";
import { Abs, Screen, Txt } from "../../../src/ui/Frame";
import { gradients } from "../../../src/theme";
import { useCreators } from "../../../src/api/hooks";

/**
 * Services — "Editor" browse deck (Figma 7348:19819, 375x875).
 *
 * The editor variant of the services swipe deck: same three-card fan and glass
 * chrome as the videographer list, but the header reads "Editor", the front
 * card carries a flat per-edit rate (no "N Hrs Shoot" suffix) and the filter
 * taxonomy is the editing category row. Coordinates below are raw frame
 * coordinates from the spec; <Screen> scales the 375pt canvas to the device.
 */

/* ------------------------------- geometry -------------------------------- */
const FRAME_W = 375;
const FRAME_H = 875;

/** The deck lives in a 375x543 container at y=188; card tops are relative to it. */
const DECK_Y = 188;

/** Figma reports rotation in radians (1.57 = pi/2 across the file). */
const deg = (rad: number) => `${((rad * 180) / Math.PI).toFixed(2)}deg`;

/* --------------------------- spec colour tokens --------------------------- */
const INK = "#1d1d1f";
const SUBTLE = "#6e6e73";
const MUTED = "#8a8a8e";
const BACK_INK = "#1c1c1e";
const CTA_BG = "#312b28";

const GLASS_50 = "rgba(255,255,255,0.5)";
const GLASS_65 = "rgba(255,255,255,0.65)";
const GLASS_70 = "rgba(255,255,255,0.7)";
const GLASS_80 = "rgba(255,255,255,0.8)";
const GLASS_85 = "rgba(255,255,255,0.85)";
const BORDER_80 = "rgba(255,255,255,0.8)";
const BORDER_90 = "rgba(255,255,255,0.9)";

/** Price / rate pill fill — #f3ebff to #eaf5ff on every card in the stack. */
const RATE_FROM = "#f3ebff";
const RATE_TO = "#eaf5ff";
/** Active category chip. */
const CHIP_FROM = "#e6d4ff";
const CHIP_TO = "#ffd4e5";
/** Selected edit-type tile. */
const TILE_FROM = "#1d1d1f";
const TILE_TO = "#3a3a3c";

/** Photo placeholder while a creator has no avatar on file. */
const PHOTO_FILL = [gradients.creators[0], gradients.creators[1]] as const;

/* ------------------------------ filter chrome ----------------------------- */
/** Category row — labels and box metrics are the spec's, verbatim. */
const CATEGORIES = [
  { niche: "Fashion", label: "✨ Fashion", x: 20, w: 106.08, tw: 68.08 },
  { niche: "Travel", label: "✈️ Travel", x: 138.08, w: 94.2, tw: 56.2 },
  { niche: "Event", label: "🎉 Event", x: 244.28, w: 90.64, tw: 52.64 },
  { niche: "Beauty", label: "💄 Beauty", x: 346.92, w: 100.16, tw: 62.16 },
] as const;

/** The three 44x44 edit-type tiles under "SELECT YOUR SHOOT TYPE". */
const EDIT_TYPES = [20, 72, 124] as const;

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

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

/* -------------------------------- card art -------------------------------- */
interface PhotoProps {
  x: number;
  y: number;
  w: number;
  h: number;
  radius: number;
  uri?: string;
  opacity?: number;
}

/** The card's IMAGE fill — the creator's avatar, or the brand gradient. */
function Photo({ x, y, w, h, radius, uri, opacity }: PhotoProps) {
  return (
    <Abs x={x} y={y} w={w} h={h} radius={radius} opacity={opacity} style={styles.clip}>
      {uri ? (
        <Image source={{ uri }} style={{ width: w, height: h }} />
      ) : (
        <LinearGradient
          colors={PHOTO_FILL}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ width: w, height: h }}
        />
      )}
    </Abs>
  );
}

interface StackCardProps {
  /** Card box + fan angle, straight from the spec. */
  x: number;
  y: number;
  w: number;
  h: number;
  rotate: number;
  /** Figma fades the stacked cards' contents to 0.5 / 0.3. */
  fade: number;
  photo: { x: number; y: number; w: number; h: number };
  name: { x: number; y: number; w: number; text: string };
  rate: { x: number; y: number; w: number; h: number; tx: number; ty: number; tw: number; text: string };
  uri?: string;
  onPress: () => void;
}

/**
 * One of the two cards fanned behind the front card. They carry the
 * videographer-style "N Hrs Shoot" rate the design still shows on the stack;
 * only the front card uses the flat per-edit price.
 */
function StackCard({ x, y, w, h, rotate, fade, photo, name, rate, uri, onPress }: StackCardProps) {
  return (
    <Pressable onPress={onPress} style={{ position: "absolute", left: x, top: y }}>
      <Abs
        x={0}
        y={0}
        w={w}
        h={h}
        radius={32}
        bg={GLASS_70}
        border={BORDER_90}
        borderWidth={1}
        style={[styles.cardShadow, { transform: [{ rotate: deg(rotate) }] }]}
      >
        <Photo x={photo.x} y={photo.y} w={photo.w} h={photo.h} radius={20} uri={uri} opacity={fade} />

        <Txt
          x={name.x}
          y={name.y}
          w={name.w}
          size={26}
          weight="bold"
          font="inter"
          color={INK}
          lineHeight={31.46}
          letterSpacing={-0.5}
          numberOfLines={1}
          style={{ opacity: fade }}
        >
          {name.text}
        </Txt>

        <Abs x={rate.x} y={rate.y} w={rate.w} h={rate.h} radius={16} opacity={fade} style={styles.clip}>
          <LinearGradient
            colors={[RATE_FROM, RATE_TO] as const}
            start={{ x: 0.2, y: -0.96 }}
            end={{ x: 0.8, y: 1.96 }}
            style={StyleSheet.absoluteFill}
          />
          <Txt
            x={rate.tx}
            y={rate.ty}
            w={rate.tw}
            size={13}
            weight="bold"
            font="inter"
            color={INK}
            lineHeight={15.73}
            numberOfLines={1}
          >
            {rate.text}
          </Txt>
        </Abs>
      </Abs>
    </Pressable>
  );
}

/* --------------------------------- screen --------------------------------- */
export default function Editors() {
  const router = useRouter();
  const { data = [], isLoading } = useCreators();

  const [cat, setCat] = useState(0);
  const [editType, setEditType] = useState(1);
  const [pickedCity, setPickedCity] = useState("Delhi");
  const [deck, setDeck] = useState(0);

  /** Category chips drive the pool; the city control narrows it further. */
  const pool = useMemo(
    () => data.filter((c) => c.niche === CATEGORIES[cat].niche),
    [data, cat],
  );
  const cities = useMemo(
    () =>
      Array.from(new Set(pool.map((c) => c.location ?? "")))
        .filter((s) => s.length > 0)
        .sort(),
    [pool],
  );
  const city = cities.includes(pickedCity) ? pickedCity : (cities[0] ?? "Delhi");
  const rows = useMemo(
    () => pool.filter((c) => (c.location ?? "") === city),
    [pool, city],
  );

  /** Wrapping keeps all three slots filled, so the fan never loses a card. */
  const at = (offset: number) =>
    rows.length > 0 ? rows[(deck + offset) % rows.length] : undefined;
  const front = at(0);
  const mid = at(1);
  const back = at(2);

  const advance = () => setDeck((d) => d + 1);
  const nextCity = () => {
    if (cities.length === 0) return;
    setPickedCity(cities[(cities.indexOf(city) + 1) % cities.length]);
  };

  const today = new Date();
  const dateLabel = `${today.getDate()} ${MONTHS[today.getMonth()]}`;

  const firstName = (full: string) => full.split(" ")[0];

  return (
    <Screen height={FRAME_H} background="#F7F0E4" scroll>
      <Backdrop />

      {/* ------------------------------- Header ------------------------------ */}
      <Pressable
        onPress={() => router.back()}
        style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
      >
        <Feather name="arrow-left" size={20} color={BACK_INK} />
      </Pressable>

      <Abs
        x={85.8}
        y={19.5}
        w={174}
        h={41}
        radius={24}
        bg={GLASS_65}
        border={BORDER_90}
        borderWidth={1}
        style={styles.glassShadow}
      >
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
          Editor
        </Txt>
        <Abs x={137} y={11.5} w={18} h={18} center>
          <Feather name="chevron-down" size={18} color={MUTED} />
        </Abs>
      </Abs>

      <Abs
        x={286.59}
        y={21}
        w={73.41}
        h={38}
        radius={24}
        bg={GLASS_65}
        border={BORDER_90}
        borderWidth={1}
        style={styles.glassShadow}
      >
        <Txt x={15} y={11} w={43.41} size={13} weight="semibold" font="inter" color={SUBTLE} lineHeight={15.73}>
          {dateLabel}
        </Txt>
      </Abs>

      {/* --------------------------- Category chips -------------------------- */}
      {/* The "Beauty" pill runs past the frame edge exactly as designed. */}
      <Abs x={0} y={106} w={375} h={56} style={styles.clip}>
        {CATEGORIES.map((c, i) => {
          const active = i === cat;
          return (
            <Pressable
              key={c.niche}
              onPress={() => {
                setCat(i);
                setDeck(0);
              }}
              style={[
                styles.chip,
                { left: c.x, width: c.w },
                active ? styles.chipActive : styles.chipIdle,
              ]}
            >
              {active ? (
                <LinearGradient
                  colors={[CHIP_FROM, CHIP_TO] as const}
                  start={{ x: 0.16, y: -0.43 }}
                  end={{ x: 0.84, y: 1.43 }}
                  style={StyleSheet.absoluteFill}
                />
              ) : null}
              <Txt
                x={19}
                y={11}
                w={c.tw}
                size={14}
                weight="semibold"
                font="inter"
                color={active ? INK : SUBTLE}
                lineHeight={16.94}
                align="center"
              >
                {c.label}
              </Txt>
            </Pressable>
          );
        })}
      </Abs>

      {/* ------------------------------ Card deck ---------------------------- */}
      <Abs x={0} y={DECK_Y} w={375} h={543}>
        {back ? (
          <StackCard
            x={30.47}
            y={78.63}
            w={314.02}
            h={436.74}
            rotate={0.09}
            fade={0.3}
            photo={{ x: 34.3, y: 16.57, w: 263.15, h: 200.97 }}
            name={{ x: 30.3, y: 213.82, w: 68.72, text: firstName(back.name) }}
            rate={{
              x: 16.54, y: 368.46, w: 143.09, h: 42.76,
              tx: 14.15, ty: 9.24, tw: 114.78, text: "₹7000 | 4 Hrs Shoot",
            }}
            uri={back.avatarUrl}
            onPress={advance}
          />
        ) : null}

        {mid ? (
          <StackCard
            x={29}
            y={58.1}
            w={316.97}
            h={451.81}
            rotate={-0.05}
            fade={0.5}
            photo={{ x: 16.97, y: 16.97, w: 271.78, h: 203.46 }}
            name={{ x: 27.91, y: 236.23, w: 62.12, text: firstName(mid.name) }}
            rate={{
              x: 36.46, y: 394.76, w: 150.74, h: 40.07,
              tx: 14.68, ty: 9.29, tw: 121.39, text: "₹6000 | 2 Hrs Shoot",
            }}
            uri={mid.avatarUrl}
            onPress={advance}
          />
        ) : null}

        {front ? (
          <Abs
            x={35}
            y={34}
            w={310}
            h={460}
            radius={32}
            bg={GLASS_85}
            border={BORDER_90}
            borderWidth={1}
            style={[styles.cardShadow, { transform: [{ rotate: deg(0.05) }] }]}
          >
            <Abs x={17} y={17} w={276} h={200} radius={20} style={styles.clip}>
              <Photo x={0} y={-1.5} w={276} h={203} radius={6.63} uri={front.avatarUrl} />
            </Abs>

            <Txt
              x={17}
              y={237}
              w={97.69}
              size={26}
              weight="bold"
              font="inter"
              color={INK}
              lineHeight={31.47}
              letterSpacing={-0.5}
              numberOfLines={1}
            >
              {firstName(front.name)}
            </Txt>

            <Abs x={225.2} y={237} w={67.8} h={27} radius={12} bg={GLASS_80} style={styles.locationChip}>
              <Abs x={10} y={6.5} w={14} h={14} center>
                <Feather name="map-pin" size={14} color={SUBTLE} />
              </Abs>
              <Txt
                x={28}
                y={6}
                w={29.8}
                size={12}
                weight="bold"
                font="inter"
                color={SUBTLE}
                lineHeight={14.52}
                numberOfLines={1}
              >
                {front.location ?? "Delhi"}
              </Txt>
            </Abs>

            <Txt
              x={17}
              y={276}
              w={276}
              size={14}
              weight="medium"
              font="inter"
              color={SUBTLE}
              lineHeight={21}
              numberOfLines={2}
            >
              {`${front.niche ?? "Fashion & Lifestyle"} Editor\n5 yrs exp. • Works with Nykaa, H&M`}
            </Txt>

            {/* Per-edit rate — no "Hrs Shoot" suffix, unlike the videographer deck. */}
            <Abs x={17} y={335} w={108} h={34} radius={16} style={[styles.clip, styles.ratePill]}>
              <LinearGradient
                colors={[RATE_FROM, RATE_TO] as const}
                start={{ x: 0.2, y: -1.12 }}
                end={{ x: 0.8, y: 2.12 }}
                style={StyleSheet.absoluteFill}
              />
              <Abs x={15} y={10} w={14} h={14} center>
                <Feather name="image" size={14} color={INK} />
              </Abs>
              <Txt x={35} y={9} w={58} size={13} weight="bold" font="inter" color={INK} lineHeight={15.73}>
                {"₹3000"}
              </Txt>
            </Abs>

            <Pressable
              onPress={() => router.push(`/services/editors/${front.id}` as never)}
              style={({ pressed }) => [styles.cta, pressed && styles.pressed]}
            >
              <Txt
                x={81.5}
                y={16}
                w={113}
                size={16}
                weight="bold"
                font="inter"
                color="#ffffff"
                lineHeight={19.36}
                align="center"
              >
                View profile
              </Txt>
            </Pressable>
          </Abs>
        ) : (
          <Txt
            x={52}
            y={310}
            w={276}
            size={14}
            weight="medium"
            font="inter"
            color={SUBTLE}
            lineHeight={21}
            align="center"
          >
            {isLoading ? "" : "No editors"}
          </Txt>
        )}
      </Abs>

      {/* ---------------------------- Bottom filters ------------------------- */}
      <Txt
        x={24}
        y={765}
        w={144}
        size={11}
        weight="bold"
        font="inter"
        color={MUTED}
        lineHeight={13.31}
        letterSpacing={0.5}
      >
        SELECT YOUR SHOOT TYPE
      </Txt>

      {EDIT_TYPES.map((x, i) => {
        const active = i === editType;
        return (
          <Pressable
            key={x}
            onPress={() => setEditType(i)}
            style={[styles.tile, { left: x }, active ? styles.tileActive : styles.tileIdle]}
          >
            {active ? (
              <LinearGradient
                colors={[TILE_FROM, TILE_TO] as const}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
              />
            ) : null}
            <Txt size={20} font="inter" lineHeight={24}>
              {"🔥"}
            </Txt>
          </Pressable>
        );
      })}

      <Txt
        x={236}
        y={777}
        w={77.08}
        size={11}
        weight="bold"
        font="inter"
        color={MUTED}
        lineHeight={13.31}
        letterSpacing={0.5}
      >
        SELECT CITY
      </Txt>

      <Pressable onPress={nextCity} style={({ pressed }) => [styles.cityButton, pressed && styles.pressed]}>
        <Abs x={19} y={14} w={16} h={16} center>
          <Feather name="map-pin" size={16} color={MUTED} />
        </Abs>
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
        <Abs x={85.77} y={13} w={18} h={18} center>
          <Feather name="chevron-down" size={18} color={MUTED} />
        </Abs>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  backdrop: { position: "absolute", left: 0, top: 0 },
  clip: { overflow: "hidden" },
  pressed: { opacity: 0.9 },

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
    borderWidth: 1,
    borderColor: BORDER_90,
    shadowColor: "#000000",
    shadowOpacity: 0.03,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  glassShadow: {
    shadowColor: "#000000",
    shadowOpacity: 0.03,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 1,
  },

  chip: {
    position: "absolute",
    top: 0,
    height: 40,
    borderRadius: 24,
    borderWidth: 1,
    overflow: "hidden",
  },
  chipActive: {
    borderColor: BORDER_80,
    shadowColor: "#000000",
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  chipIdle: {
    backgroundColor: GLASS_50,
    borderColor: BORDER_80,
    shadowColor: "#000000",
    shadowOpacity: 0.02,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },

  cardShadow: {
    shadowColor: "#000000",
    shadowOpacity: 0.06,
    shadowRadius: 40,
    shadowOffset: { width: 0, height: 20 },
    elevation: 8,
  },
  locationChip: {
    shadowColor: "#000000",
    shadowOpacity: 0.02,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  ratePill: {
    borderWidth: 1,
    borderColor: "#ffffff",
    shadowColor: "#000000",
    shadowOpacity: 0.03,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  cta: {
    position: "absolute",
    left: 17,
    top: 391,
    width: 276,
    height: 52,
    borderRadius: 24,
    backgroundColor: CTA_BG,
    shadowColor: "#000000",
    shadowOpacity: 0.15,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },

  tile: {
    position: "absolute",
    top: 799,
    width: 44,
    height: 44,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  tileActive: {
    shadowColor: "#000000",
    shadowOpacity: 0.15,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  tileIdle: {
    backgroundColor: GLASS_65,
    borderWidth: 1,
    borderColor: BORDER_90,
    shadowColor: "#000000",
    shadowOpacity: 0.03,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },

  cityButton: {
    position: "absolute",
    left: 232.23,
    top: 799,
    width: 122.77,
    height: 44,
    borderRadius: 16,
    backgroundColor: GLASS_65,
    borderWidth: 1,
    borderColor: BORDER_90,
    shadowColor: "#000000",
    shadowOpacity: 0.03,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 1,
  },
});
