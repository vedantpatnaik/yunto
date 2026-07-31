import { useMemo, useState } from "react";
import { Image, Pressable, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Abs, Screen, Txt } from "../../../src/ui/Frame";
import { gradients } from "../../../src/theme";
import { inr, useAgencies, useCreators, type Creator } from "../../../src/api/hooks";

/**
 * Creators — "Editor" browse deck. Figma 7778:18001 (375x876), traced 1:1.
 *
 * The editor half of the agency's booking deck: structural twin of the
 * videographer list — same dark back button, same "Editor" glass title pill and
 * date chip, same emoji category chips, same three-card fan, same
 * SELECT YOUR SHOOT TYPE / SELECT CITY bar — with the editor copy and, per the
 * design, a flat rate on the card instead of the videographer's
 * "₹N | H Hrs Shoot" duration form.
 *
 * The frame is a flat #f8f5ef page (no radial backdrop, unlike the consumer-app
 * deck) and runs to 876pt, so it scrolls.
 *
 * Data — every record value is live off GET /creators (+ GET /agencies):
 *   card name        creator.name, first name only, as the design draws it
 *   location chip    creator.location (chip is dropped when the row has none)
 *   role line        creator.niche + " Editor"
 *   credential line  the managing agency, resolved through creator.agencyId
 *   rate pill        the creator's package economics, cpv x avgViews
 *   city control     the real cities present in the filtered pool
 *   date chip        today
 * Prisma has no Editor model and no rate card: there is no "years of
 * experience" and no brand-worked-with column, so the design's
 * "5 yrs exp. • Works with Nykaa, H&M" is not reproduced verbatim — the half
 * that has a record behind it (who the creator works with) is rendered and the
 * invented half is dropped rather than faked. The rate is the same cpv x
 * avgViews figure the order summary and the videographer profile already price
 * a creator with; it is shown flat here because editors bill per edit.
 *
 * expo-blur is not a dependency, so the chips' BACKGROUND_BLUR renders as their
 * translucent fill alone — the substitution the other agency frames make.
 */

/* ------------------------------- geometry -------------------------------- */
const FRAME_W = 375;
const FRAME_H = 876;

/** "Container" 7778:18014 — the 375x543 deck box; card tops are relative to it. */
const DECK_Y = 188;

/*
 * Deck rotation. The spec stores each fanned card as its rotated axis-aligned
 * bounding box (x/y/w/h) plus a rotation in radians (Figma CCW-positive). The
 * geometry below is the unrotated card recovered from that: same centre as the
 * bbox, W/H solved from bw = W·cosθ + H·sinθ / bh = W·sinθ + H·cosθ, and the
 * angle negated for RN's clockwise-positive `rotate`. The front card is a child
 * of the mid card, so its +0.05 rad cancels the parent's −0.05 rad: it renders
 * flat, exactly as the design PNG draws it.
 */

/* --------------------------- spec colour tokens --------------------------- */
const PAGE = "#f8f5ef"; // frame fill
const INK = "#1d1d1f";
const SUBTLE = "#6e6e73";
const MUTED = "#8a8a8e";
const BACK_FILL = "#1f1a17"; // Button — the dark back chip
const BACK_INK = "#faf7f2"; // its arrow stroke
const CTA_BG = "#312b28";
const CHIP_ACTIVE = "#d4dcff"; // "✨ Fashion" fill

const GLASS_50 = "rgba(255,255,255,0.5)";
const GLASS_65 = "rgba(255,255,255,0.65)";
const GLASS_70 = "rgba(255,255,255,0.7)";
const GLASS_80 = "rgba(255,255,255,0.8)";
const GLASS_85 = "rgba(255,255,255,0.85)";
const BORDER_80 = "rgba(255,255,255,0.8)";
const BORDER_90 = "rgba(255,255,255,0.9)";

/** Rate pill fill — #f3ebff to #eaf5ff on every card in the stack. */
const RATE_FROM = "#f3ebff";
const RATE_TO = "#eaf5ff";
/** Selected shoot-type tile. */
const TILE_FROM = "#1d1d1f";
const TILE_TO = "#3a3a3c";

/** Photo placeholder while a creator has no avatar on file. */
const PHOTO_FILL = [gradients.creators[0], gradients.creators[1]] as const;

/* ------------------------------ filter chrome ----------------------------- */
/**
 * Category row — labels and pill boxes are the spec's, verbatim. The label is
 * centred inside the fixed-width pill rather than boxed to Figma's measured
 * text width: RN draws emoji wider than Figma does, and a hard text box wraps
 * and clips the single-line label.
 */
const CATEGORIES = [
  { niche: "Fashion", label: "✨ Fashion", x: 20, w: 106.08 },
  { niche: "Travel", label: "✈️ Travel", x: 138.08, w: 94.2 },
  { niche: "Event", label: "🎉 Event", x: 244.28, w: 90.64 },
  { niche: "Beauty", label: "💄 Beauty", x: 346.92, w: 100.16 },
] as const;

/** The three 44x44 shoot-type tiles under "SELECT YOUR SHOOT TYPE". */
const SHOOT_TYPES = [20, 72, 124] as const;

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

/* ------------------------------ derivations ------------------------------- */
/**
 * The flat editor rate. Creator carries no rate card, so the card prices the
 * record's real economics — cost per view across the creator's average reach —
 * the same figure the order summary and the videographer profile already use.
 */
const rateLabel = (c: Creator) => `₹${inr(Math.round(c.cpv * c.avgViews))}`;

/** The design draws first names only ("Karan"), and the box is sized for one. */
const firstName = (full: string) => full.split(" ")[0];

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
  /** Unrotated card box (see the deck-rotation note above) + RN fan angle in degrees. */
  x: number;
  y: number;
  w: number;
  h: number;
  rotate: number;
  /** Figma fades the stacked cards' contents to 0.5 / 0.3. */
  fade: number;
  photo: { x: number; y: number; w: number; h: number };
  name: { x: number; y: number; w: number };
  rate: { x: number; y: number; w: number; h: number; tx: number; ty: number; tw: number };
  creator: Creator;
  onPress: () => void;
}

/** One of the two cards fanned behind the front card. */
function StackCard({ x, y, w, h, rotate, fade, photo, name, rate, creator, onPress }: StackCardProps) {
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
        style={[styles.cardShadow, { transform: [{ rotate: `${rotate}deg` }] }]}
      >
        <Photo x={photo.x} y={photo.y} w={photo.w} h={photo.h} radius={20} uri={creator.avatarUrl} opacity={fade} />

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
          {firstName(creator.name)}
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
            {rateLabel(creator)}
          </Txt>
        </Abs>
      </Abs>
    </Pressable>
  );
}

/* --------------------------------- screen --------------------------------- */
export default function EditorsList() {
  const router = useRouter();
  const { data: creators = [], isLoading } = useCreators();
  const { data: agencies = [] } = useAgencies();

  const [cat, setCat] = useState(0);
  const [shootType, setShootType] = useState(1);
  const [pickedCity, setPickedCity] = useState("Delhi");
  const [deck, setDeck] = useState(0);

  /** Category chips drive the pool; the city control narrows it further. */
  const pool = useMemo(
    () => creators.filter((c) => c.niche === CATEGORIES[cat].niche),
    [creators, cat],
  );
  const cities = useMemo(
    () =>
      Array.from(new Set(pool.map((c) => c.location ?? "")))
        .filter((s) => s.length > 0)
        .sort(),
    [pool],
  );
  const city = cities.includes(pickedCity) ? pickedCity : (cities[0] ?? "Delhi");
  const rows = useMemo(() => pool.filter((c) => (c.location ?? "") === city), [pool, city]);

  /** Wrapping keeps all three slots filled, so the fan never loses a card. */
  const at = (offset: number) =>
    rows.length > 0 ? rows[(deck + offset) % rows.length] : undefined;
  const front = at(0);
  const mid = at(1);
  const back = at(2);

  /** "Works with …" — the design's credential line, resolved to a real record. */
  const agencyNames = useMemo(() => new Map(agencies.map((a) => [a.id, a.name])), [agencies]);
  const worksWith = front?.agencyId ? agencyNames.get(front.agencyId) : undefined;
  const bio = front
    ? `${front.niche ?? ""} Editor${worksWith ? `\nWorks with ${worksWith}` : ""}`
    : "";

  const advance = () => setDeck((d) => d + 1);
  const nextCity = () => {
    if (cities.length === 0) return;
    setPickedCity(cities[(cities.indexOf(city) + 1) % cities.length]);
  };

  const today = new Date();
  const dateLabel = `${today.getDate()} ${MONTHS[today.getMonth()]}`;

  return (
    <Screen height={FRAME_H} background={PAGE} scroll>
      {/* ------------------------------- Header ------------------------------ */}
      <Pressable
        onPress={() => router.back()}
        style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
      >
        <Feather name="arrow-left" size={16} color={BACK_INK} />
      </Pressable>

      <Abs
        x={72}
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
        x={266}
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
      <Abs x={0} y={106} w={FRAME_W} h={56} style={styles.clip}>
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
              <Txt
                size={14}
                weight="semibold"
                font="inter"
                color={active ? INK : SUBTLE}
                lineHeight={16.94}
                align="center"
                numberOfLines={1}
              >
                {c.label}
              </Txt>
            </Pressable>
          );
        })}
      </Abs>

      {/* ------------------------------ Card deck ---------------------------- */}
      <Abs x={0} y={DECK_Y} w={FRAME_W} h={543}>
        {back ? (
          <StackCard
            x={48.49}
            y={90.29}
            w={277.99}
            h={413.43}
            rotate={-5.16}
            fade={0.3}
            photo={{ x: 32.91, y: 16.9, w: 248.03, h: 179.4 }}
            name={{ x: 12.67, y: 196.75, w: 66.5 }}
            rate={{
              x: -15.54, y: 356.19, w: 140.94, h: 30.21,
              tx: 13.48, ty: 8.06, tw: 113.98,
            }}
            creator={back}
            onPress={advance}
          />
        ) : null}

        {mid ? (
          <StackCard
            x={39.75}
            y={65.21}
            w={295.47}
            h={437.59}
            rotate={2.86}
            fade={0.5}
            photo={{ x: 5.47, y: 16.72, w: 262.58, h: 190.57 }}
            name={{ x: 19.32, y: 235.56, w: 60.72 }}
            rate={{
              x: 35.93, y: 393.46, w: 149.29, h: 32.65,
              tx: 14.27, ty: 8.58, tw: 120.77,
            }}
            creator={mid}
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
            style={styles.cardShadow}
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

            {/* Location chip — omitted when the record carries no city. Figma
                hugs the pill to its content (padding 10, gap 4) with the right
                edge on the card's 17pt content margin, so it grows leftward
                when the live city outruns the sample "Delhi". */}
            {front.location ? (
              <Abs y={237} h={27} radius={12} bg={GLASS_80} row gap={4} style={[styles.locationChip, styles.hugRight]}>
                <Feather name="map-pin" size={14} color={SUBTLE} />
                <Txt size={12} weight="bold" font="inter" color={SUBTLE} lineHeight={14.52} numberOfLines={1}>
                  {front.location}
                </Txt>
              </Abs>
            ) : null}

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
              {bio}
            </Txt>

            {/* Flat per-edit rate — no "Hrs Shoot" suffix, unlike the videographer
                deck. Figma hugs the pill (padding 14, gap 6): the spec's 108pt is
                just what "₹3000" produced, so the box widens for the live rate. */}
            <Abs x={17} y={335} h={34} radius={16} row gap={6} style={[styles.clip, styles.ratePill]}>
              <LinearGradient
                colors={[RATE_FROM, RATE_TO] as const}
                start={{ x: 0.2, y: -1.12 }}
                end={{ x: 0.8, y: 2.12 }}
                style={StyleSheet.absoluteFill}
              />
              <Feather name="image" size={14} color={INK} />
              <Txt size={13} weight="bold" font="inter" color={INK} lineHeight={15.73} numberOfLines={1}>
                {rateLabel(front)}
              </Txt>
            </Abs>

            <Pressable
              onPress={() => router.push(`/agency/creators/editor-detail?id=${front.id}` as never)}
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
          /* Loading / empty sit where the front card's role line sits, so the
             deck box keeps its geometry either way. */
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

      {SHOOT_TYPES.map((x, i) => {
        const active = i === shootType;
        return (
          <Pressable
            key={x}
            onPress={() => setShootType(i)}
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

      {/* Figma hugs the control (padding 18, gap 8); anchored to the frame's
          20pt right margin it grows leftward when the live city is long. */}
      <Pressable onPress={nextCity} style={({ pressed }) => [styles.cityButton, pressed && styles.pressed]}>
        <Feather name="map-pin" size={16} color={MUTED} />
        <Txt size={14} weight="bold" font="inter" color={INK} lineHeight={16.94} numberOfLines={1}>
          {city}
        </Txt>
        <Feather name="chevron-down" size={18} color={MUTED} />
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  clip: { overflow: "hidden" },
  pressed: { opacity: 0.9 },

  /* Header */
  backButton: {
    position: "absolute",
    left: 16,
    top: 22,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: BACK_FILL,
    shadowColor: "#000000",
    shadowOpacity: 0.1,
    shadowRadius: 2.7,
    shadowOffset: { width: 0, height: 0.9 },
    elevation: 2,
  },
  glassShadow: {
    shadowColor: "#000000",
    shadowOpacity: 0.03,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 1,
  },

  /* Category chips */
  chip: {
    position: "absolute",
    top: 0,
    height: 40,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: BORDER_80,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  chipActive: {
    backgroundColor: CHIP_ACTIVE,
    shadowColor: "#000000",
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  chipIdle: {
    backgroundColor: GLASS_50,
    shadowColor: "#000000",
    shadowOpacity: 0.02,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },

  /* Deck */
  cardShadow: {
    shadowColor: "#000000",
    shadowOpacity: 0.06,
    shadowRadius: 40,
    shadowOffset: { width: 0, height: 20 },
    elevation: 8,
  },
  locationChip: {
    paddingHorizontal: 10,
    shadowColor: "#000000",
    shadowOpacity: 0.02,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  /** Content-hugging pill pinned to the card's right content edge (293 = 310 − 17). */
  hugRight: { left: "auto", right: 17 },
  ratePill: {
    paddingHorizontal: 14,
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

  /* Bottom filters */
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
    right: 20,
    top: 799,
    height: 44,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 18,
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
