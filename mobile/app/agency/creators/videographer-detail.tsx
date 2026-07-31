import { useMemo, useState } from "react";
import { Image, Pressable, StyleSheet, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Feather, Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Abs, Screen, Txt, getScale } from "../../../src/ui/Frame";
import { colors } from "../../../src/theme";
import { inr, useAgencies, useCalendar, useCreators } from "../../../src/api/hooks";

/**
 * Videographer detail — Figma 7778:18121 (375x876), traced 1:1.
 *
 * The agency-side review card for one videographer on the roster. The frame is
 * authored as fixed chrome — a glass header at y=0..80 and the Skip / reject /
 * confirm bar at y=762..870 — wrapping a "Main" region whose content runs to
 * y=1594.67, so the body scrolls inside the 375pt canvas while both docks stay
 * pinned. Every coordinate below is the raw frame coordinate from the spec;
 * <Screen> scales the canvas to the device and the two docks re-apply the same
 * scale so they line up with it exactly.
 *
 * Data — the record values come off GET /creators, /agencies and /calendar:
 *   hero still            Creator.avatarUrl (the design's IMAGE fill lives in Figma)
 *   name / role / city    name, niche, location
 *   ₹ price               cpv x avgViews — what one deliverable costs
 *   TOP RATED             shown only when stars >= 4.5; the badge is a claim,
 *                         so it is gated on the rating rather than always drawn
 *   Rating                stars, and the count of this creator's bookings
 *   Today's Slots         CalendarContent rows for this creator scheduled today
 *   Past Clients          the brands off those bookings' titles
 *   Expertise             niche + the formats actually shot, then design copy
 * Roster scope follows creators-roster: the agency's own creators, falling back
 * to the directory while that link is still loading. Skip / reject advance
 * through that roster, and the `id` param seeds the cursor.
 *
 * Not modelled, so left as the design's own copy: the "2 Hrs Shoot" package,
 * "5 yrs exp.", the pull-quote bio and the Past Work tiles (Creator has no
 * portfolio-media column — the tiles stay as the placeholder + play badge the
 * spec draws). Confirm returns to the roster with the pick made: no endpoint
 * takes a creator + slot, so the chosen slot is held in local state rather than
 * written to a booking that does not exist.
 */

/* ------------------------------- geometry -------------------------------- */
const FRAME_W = 375;
const HEADER_H = 80; // "Frame 2147223269"
const BAR_H = 108; // bottom "Frame" at y=762
/**
 * The design's "Main" region clips at y=744 (h=644), so at rest the frame shows
 * clean page between the Summary card (bottom y=731) and the dock (y=762) — no
 * Expertise content peeks out. The scrolling build reproduces that clip by
 * extending the dock's fade up to y=731: fully opaque by y=750, transparent at
 * the Summary card's bottom edge, so under-scrolled content fades out before it
 * can collide with the Skip / reject / confirm buttons.
 */
const FADE_LIFT = 762 - 731; // fade box rises above the dock to frame y 731
const FADE_H = BAR_H + (762 - 731); // 139: frame y 731..870
const FADE_SOLID = (870 - 750) / FADE_H; // opaque from the bottom up to y=750
const CONTENT_BOTTOM = 1594.67; // last Past Work tile bottom
const CONTENT_H = CONTENT_BOTTOM + BAR_H; // scroll extent + dock clearance

/* --------------------------- spec colour tokens --------------------------- */
const PAGE = "#F8F5EF"; // frame fill
const INK_TITLE = "#1D1D1F";
const INK_META = "#6E6E73";
const INK_HEADING = "#1A1A1A";
const INK_BODY = "#444444";
const INK_LABEL = "#666666";
const INK_SUB = "#888888";
const INK_CLIENT = "#333333";
const PRICE_INK = "#0D86FF";
const PRICE_CARD = "#E4ECF4";
const DIVIDER = "#E0E0E0";
const PLACEHOLDER = "#EAEAEA";
const SLOT_BG = "#E8F5E9";
const SLOT_INK = "#2E7D32";
const BACK_FILL = "#1F1A17";
const BACK_INK = "#FAF7F2"; // back arrow stroke (7778:18126)
const REJECT_INK = "#FF5252"; // reject ✕ stroke (7778:18137)
const CIRCLE_RING = "#EAEAEA"; // reject circle border (7778:18134)
const DARK = "#312B28";
const GLASS_65 = "rgba(255,255,255,0.65)";
const GLASS_61 = "rgba(255,255,255,0.61)";
const GLASS_60 = "rgba(255,255,255,0.6)";
const GLASS_70 = "rgba(255,255,255,0.7)";
const GLASS_20 = "rgba(255,255,255,0.2)";

/** Stand-in for a value the record does not carry — same convention as leads. */
const DASH = "—";

/* ------------------------------ spec content ------------------------------ */
/** Expertise chips: label + palette + design width, in spec order. */
const TAGS: { label: string; bg: string; ink: string; w: number }[] = [
  { label: "Reels", bg: "#E8F5E9", ink: "#2E7D32", w: 68.23 },
  { label: "BTS Shoots", bg: "#FFF3E0", ink: "#E65100", w: 105.98 },
  { label: "Brand Campaigns", bg: "#F3E5F5", ink: "#6A1B9A", w: 145.5 },
  { label: "Color Grading", bg: "#E3F2FD", ink: "#1565C0", w: 121.09 },
  { label: "Fast Cuts", bg: "#FCE4EC", ink: "#C2185B", w: 93.03 },
];
/** The three chip rows of the tag cloud and their y, straight off the spec. */
const TAG_ROWS: { y: number; idx: number[] }[] = [
  { y: 786, idx: [0, 1] },
  { y: 830, idx: [2, 3] },
  { y: 874, idx: [4] },
];

/** Design widths for the two slot chips and the four client chips. */
const SLOT_W = [56.66, 56.73];
const CLIENT_W = [63.42, 93.31, 54.22];
const MORE_W = 46.89;

/** 2-col Past Work grid — the four tiles' own boxes from the spec. */
const WORK_TILES = [
  { x: 20, y: 1171, w: 161.5, h: 207.55 },
  { x: 193.5, y: 1171, w: 161.5, h: 201.88 },
  { x: 20, y: 1384.88, w: 161.5, h: 207.55 },
  { x: 193.5, y: 1384.88, w: 161.5, h: 209.79 },
];

/* ------------------------------ derivations ------------------------------- */
const uniq = (a: string[]) => [...new Set(a.filter(Boolean))];

/** Calendar titles read "<Niche> <Format> — <Brand>", same as the web app. */
const formatOf = (title: string) => title.split("—")[0].trim().split(" ").slice(-1)[0] || "";
const brandOf = (title: string) => title.split("—")[1]?.trim() ?? "";

/** "10:00" / "14:00" — the 24h slot chips the design ships. */
function hhmm(iso: string): string {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

/** Design chip widths are the floor; grow only when the real string is longer. */
const chipW = (base: number, text: string, per: number, pad: number) =>
  Math.max(base, Math.round(text.length * per) + pad);

/* --------------------------------- chips ---------------------------------- */
function Tag({ label, bg, ink, w }: { label: string; bg: string; ink: string; w: number }) {
  return (
    <View style={[styles.tag, { width: chipW(w, label, 6.6, 33), backgroundColor: bg }]}>
      <Txt size={13} weight="semibold" font="inter" color={ink} lineHeight={15.73} numberOfLines={1}>
        {label}
      </Txt>
    </View>
  );
}

function ClientChip({ label, w, ink }: { label: string; w: number; ink: string }) {
  return (
    <View style={[styles.clientChip, { width: chipW(w, label, 6.2, 26) }]}>
      <Txt size={12} weight="bold" font="inter" color={ink} lineHeight={14.52} numberOfLines={1}>
        {label}
      </Txt>
    </View>
  );
}

/* --------------------------------- screen --------------------------------- */
export default function VideographerDetail() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const scale = getScale();
  const params = useLocalSearchParams<{ id?: string }>();

  const { data: creators = [], isLoading } = useCreators();
  const { data: agencies = [] } = useAgencies();
  const { data: calendar = [] } = useCalendar();

  // Skip / reject advance through the roster; the id param seeds the cursor.
  const [cursor, setCursor] = useState(0);
  const [slotPick, setSlotPick] = useState<string | null>(null);

  /** The workspace this roster belongs to — /auth/me returns no agency link. */
  const agency = agencies[0];
  const pool = useMemo(() => {
    const roster = agency ? creators.filter((c) => c.agencyId === agency.id) : [];
    return roster.length ? roster : creators;
  }, [creators, agency]);

  const seed = Math.max(0, pool.findIndex((c) => c.id === params.id));
  const creator = pool.length ? pool[(seed + cursor) % pool.length] : undefined;

  const detail = useMemo(() => {
    const bookings = creator
      ? calendar
          .filter((k) => k.creatorId === creator.id)
          .sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt))
      : [];

    const day = new Date().toDateString();
    const slots = bookings
      .filter((k) => new Date(k.scheduledAt).toDateString() === day)
      .map((k) => hhmm(k.scheduledAt));

    return {
      // Creator carries `stars` but no review column, so the parenthetical
      // counts the bookings that rating stands on rather than inventing a tally.
      bookings: bookings.length,
      slots: slots.slice(0, SLOT_W.length),
      clients: uniq(bookings.map((k) => brandOf(k.title))),
      // niche + the formats this creator has actually shot drive the tag cloud.
      tags: uniq([creator?.niche ?? "", ...bookings.map((k) => formatOf(k.title))]),
    };
  }, [creator, calendar]);

  const location = creator?.location ?? "Delhi";
  const name = creator?.name ?? (isLoading ? "" : DASH);
  const role = creator?.niche ? `${creator.niche} Videographer` : "Fashion & Lifestyle Videographer";
  // cost-per-view x average views = what one deliverable from this creator costs.
  const price = creator ? `₹${inr(Math.round(creator.cpv * creator.avgViews))}` : DASH;
  const topRated = (creator?.stars ?? 0) >= 4.5;

  const clientChips = detail.clients.slice(0, CLIENT_W.length);
  const moreClients = detail.clients.length - clientChips.length;

  const next = () => {
    setSlotPick(null);
    setCursor((i) => i + 1);
  };

  return (
    <View style={styles.root}>
      <Screen height={CONTENT_H} background={PAGE} scroll>
        {/* ------------------------------- Hero ----------------------------- */}
        <Abs x={20} y={100} w={335} h={460} radius={28} style={styles.heroShadow}>
          <Abs x={0} y={0} w={335} h={460} radius={28} bg={PLACEHOLDER} style={styles.clip}>
            {/* Frame 1171275351 — the portfolio still, drawn 4pt above the card. */}
            {creator?.avatarUrl ? (
              <Image source={{ uri: creator.avatarUrl }} style={styles.heroImage} resizeMode="cover" />
            ) : null}

            {/* Background — bottom-up scrim over the hero image */}
            <LinearGradient
              colors={["rgba(0,0,0,0.85)", "rgba(0,0,0,0.4)", "rgba(0,0,0,0)"] as const}
              locations={[0, 0.6, 1] as const}
              start={{ x: 0.5, y: 1 }}
              end={{ x: 0.5, y: 0 }}
              style={styles.heroScrim}
            />

            {/* TOP RATED */}
            {topRated ? (
              <>
                <Abs x={24} y={290} w={108.58} h={28} radius={14} bg={GLASS_20} style={styles.badgeRing} />
                <View style={styles.topRatedIcon}>
                  <Ionicons name="sparkles-outline" size={12} color={colors.white} />
                </View>
                <Txt
                  x={53}
                  y={297}
                  size={11}
                  weight="bold"
                  font="inter"
                  color={colors.white}
                  lineHeight={13.31}
                  letterSpacing={0.55}
                >
                  TOP RATED
                </Txt>
              </>
            ) : null}

            <Txt
              x={24}
              y={330}
              w={287}
              size={32}
              weight="bold"
              font="inter"
              color={colors.white}
              lineHeight={35.2}
              numberOfLines={1}
            >
              {name}
            </Txt>
            <Txt
              x={24}
              y={370}
              w={287}
              size={15}
              weight="medium"
              font="inter"
              color="rgba(255,255,255,0.9)"
              lineHeight={21}
              numberOfLines={1}
            >
              {role}
            </Txt>
            <View style={styles.heroPin}>
              <Feather name="map-pin" size={14} color="rgba(255,255,255,0.7)" />
            </View>
            <Txt
              x={44}
              y={399}
              size={13}
              weight="medium"
              font="inter"
              color="rgba(255,255,255,0.7)"
              lineHeight={15.73}
              numberOfLines={1}
            >
              {`${location} • 5 yrs exp.`}
            </Txt>
          </Abs>
        </Abs>

        {/* ---------------- Pricing Card Overlapping Hero ------------------- */}
        <Abs x={36} y={520} w={303} h={55} radius={28} bg={PRICE_CARD} style={styles.priceShadow}>
          {/* Container — the price / divider / package group is centred in the
              card, so a longer live rate stays balanced exactly as designed. */}
          <Abs x={0} y={17} w={303} h={21} row gap={9.7} style={styles.centerRow}>
            <Txt
              size={18}
              weight="bold"
              font="inter"
              color={PRICE_INK}
              lineHeight={21.78}
              align="center"
              numberOfLines={1}
            >
              {price}
            </Txt>
            <View style={styles.priceDivider} />
            <Txt size={18} weight="bold" font="inter" color={INK_HEADING} lineHeight={21.78} align="center">
              2 Hrs Shoot
            </Txt>
          </Abs>
        </Abs>

        {/* ------------------------------ Summary --------------------------- */}
        <Abs x={20} y={599} w={335} h={132} radius={24} bg={GLASS_60}>
          <Txt x={21} y={20.25} w={293} size={15} weight="medium" font="inter" color={INK_BODY} lineHeight={22.5}>
            {'"I turn brand vibes into scroll-stopping\nvisuals. Specializing in high-retention\nedits and aesthetic storytelling for\nlifestyle brands."'}
          </Txt>
        </Abs>

        {/* --------------------------- Expertise Tags ----------------------- */}
        <Txt
          x={20}
          y={755}
          w={335}
          size={16}
          weight="bold"
          font="inter"
          color={INK_HEADING}
          lineHeight={19.36}
          letterSpacing={-0.16}
        >
          Expertise
        </Txt>
        {TAG_ROWS.map((row) => (
          <Abs key={row.y} x={20} y={row.y} row gap={10}>
            {row.idx.map((i) => (
              <Tag
                key={i}
                label={i < detail.tags.length ? detail.tags[i] : TAGS[i].label}
                bg={TAGS[i].bg}
                ink={TAGS[i].ink}
                w={TAGS[i].w}
              />
            ))}
          </Abs>
        ))}

        {/* ----------------------------- Stats Grid ------------------------- */}
        {/* Rating */}
        <Abs x={20} y={932} w={161.5} h={85} radius={20} bg={GLASS_70}>
          <View style={styles.statIcon}>
            <Feather name="star" size={14} color={INK_LABEL} />
          </View>
          <Txt x={37} y={17} size={13} weight="medium" font="inter" color={INK_LABEL} lineHeight={15.73}>
            Rating
          </Txt>
          <Txt x={17} y={37} size={18} weight="bold" font="inter" color={INK_HEADING} lineHeight={21.78}>
            {creator ? creator.stars.toFixed(1) : DASH}
          </Txt>
          <Txt x={50.31} y={41} size={13} weight="medium" font="inter" color={INK_SUB} lineHeight={15.73}>
            {`(${detail.bookings})`}
          </Txt>
        </Abs>

        {/* Availability — the chips are the booking picker */}
        <Abs x={193.5} y={932} w={161.5} h={85} radius={20} bg={GLASS_70}>
          <View style={styles.statIcon}>
            <Feather name="clock" size={14} color={INK_LABEL} />
          </View>
          <Txt x={37} y={17} size={13} weight="medium" font="inter" color={INK_LABEL} lineHeight={15.73}>
            {"Today's Slots"}
          </Txt>
          <Abs x={17} y={41} row gap={7.56}>
            {detail.slots.length === 0 ? (
              <View style={[styles.slot, { width: SLOT_W[0] }]}>
                <Txt size={12} weight="semibold" font="inter" color={SLOT_INK} lineHeight={14.52}>
                  {DASH}
                </Txt>
              </View>
            ) : (
              detail.slots.map((slot, i) => {
                const on = slotPick === slot;
                return (
                  <Pressable
                    key={slot}
                    onPress={() => setSlotPick(on ? null : slot)}
                    style={({ pressed }) => [
                      styles.slot,
                      { width: SLOT_W[i] },
                      on && styles.slotOn,
                      pressed && styles.pressed,
                    ]}
                  >
                    <Txt
                      size={12}
                      weight="semibold"
                      font="inter"
                      color={on ? colors.white : SLOT_INK}
                      lineHeight={14.52}
                    >
                      {slot}
                    </Txt>
                  </Pressable>
                );
              })
            )}
          </Abs>
        </Abs>

        {/* Past Clients */}
        <Abs x={20} y={1029} w={335} h={87} radius={20} bg={GLASS_70}>
          <View style={styles.statIcon}>
            <Feather name="briefcase" size={14} color={INK_LABEL} />
          </View>
          <Txt x={37} y={17} size={13} weight="medium" font="inter" color={INK_LABEL} lineHeight={15.73}>
            Past Clients
          </Txt>
          <Abs x={17} y={41} row gap={8}>
            {clientChips.length === 0 ? (
              <ClientChip label={DASH} w={CLIENT_W[0]} ink={INK_SUB} />
            ) : (
              clientChips.map((label, i) => (
                <ClientChip key={label} label={label} w={CLIENT_W[i]} ink={INK_CLIENT} />
              ))
            )}
            {moreClients > 0 ? <ClientChip label={`+${moreClients}`} w={MORE_W} ink={INK_SUB} /> : null}
          </Abs>
        </Abs>

        {/* ---------------------------- Past Work Grid ---------------------- */}
        <Txt
          x={20}
          y={1140}
          w={335}
          size={16}
          weight="bold"
          font="inter"
          color={INK_HEADING}
          lineHeight={19.36}
          letterSpacing={-0.16}
        >
          Past Work
        </Txt>
        {WORK_TILES.map((t) => (
          <Abs key={`${t.x}-${t.y}`} x={t.x} y={t.y} w={t.w} h={t.h} radius={16} bg={PLACEHOLDER} center>
            <View style={styles.playBadge}>
              <Feather name="play" size={18} color={colors.white} />
            </View>
          </Abs>
        ))}
      </Screen>

      {/* --------------------------- fixed Header ------------------------- */}
      <View
        pointerEvents="box-none"
        style={[styles.dock, { top: insets.top, width: FRAME_W * scale, height: HEADER_H * scale }]}
      >
        <View
          pointerEvents="box-none"
          style={[styles.dockCanvas, { width: FRAME_W, height: HEADER_H, transform: [{ scale }] }]}
        >
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
          >
            <Feather name="arrow-left" size={16} color={BACK_INK} />
          </Pressable>

          <View pointerEvents="none" style={styles.titlePill}>
            <Txt size={15} weight="bold" font="inter" color={INK_TITLE} lineHeight={18.15} align="center">
              Videographers
            </Txt>
          </View>

          <View pointerEvents="none" style={styles.contextPill}>
            <Txt
              x={15}
              y={11}
              size={13}
              weight="semibold"
              font="inter"
              color={INK_META}
              lineHeight={15.73}
              numberOfLines={1}
            >
              {`20 Jun | ${location}`}
            </Txt>
          </View>
        </View>
      </View>

      {/* ------------------------ fixed action bar ------------------------ */}
      <View
        pointerEvents="box-none"
        style={[styles.dock, { bottom: insets.bottom, width: FRAME_W * scale, height: BAR_H * scale }]}
      >
        <View
          pointerEvents="box-none"
          style={[styles.dockCanvas, { width: FRAME_W, height: BAR_H, transform: [{ scale }] }]}
        >
          <LinearGradient
            colors={["#FAF9F6", "#FAF9F6", "rgba(250,249,246,0)"] as const}
            locations={[0, FADE_SOLID, 1] as const}
            start={{ x: 0.5, y: 1 }}
            end={{ x: 0.5, y: 0 }}
            style={styles.barFade}
            pointerEvents="none"
          />

          <Pressable onPress={next} style={({ pressed }) => [styles.skip, pressed && styles.pressed]}>
            <Txt size={14} weight="medium" font="inter" color={INK_HEADING} lineHeight={16.94} align="center">
              Skip
            </Txt>
          </Pressable>

          <Pressable
            onPress={next}
            style={({ pressed }) => [styles.circle, styles.circleLight, pressed && styles.pressed]}
          >
            <Feather name="x" size={28} color={REJECT_INK} />
          </Pressable>

          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => [styles.circle, styles.circleDark, pressed && styles.pressed]}
          >
            <Feather name="check" size={28} color={colors.white} />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: PAGE },
  clip: { overflow: "hidden" },
  pressed: { opacity: 0.9 },

  /* fixed chrome — re-applies the canvas scale so it aligns with the body */
  dock: { position: "absolute", left: 0 },
  dockCanvas: { position: "relative", transformOrigin: "top left" },

  /* hero */
  heroShadow: {
    shadowColor: "#000000",
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 16 },
    elevation: 6,
  },
  heroImage: { position: "absolute", left: 0, top: -4, width: 335, height: 468 },
  heroScrim: { position: "absolute", left: 0, top: 210, width: 335, height: 250 },
  topRatedIcon: {
    position: "absolute",
    left: 37,
    top: 298,
    width: 12,
    height: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeRing: { borderWidth: 1, borderColor: "rgba(255,255,255,0.3)" },
  heroPin: {
    position: "absolute",
    left: 24,
    top: 400,
    width: 14,
    height: 14,
    alignItems: "center",
    justifyContent: "center",
  },

  /* pricing card */
  priceShadow: {
    shadowColor: "#000000",
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 12 },
    elevation: 4,
  },
  centerRow: { justifyContent: "center" },
  priceDivider: { width: 1, height: 16, backgroundColor: DIVIDER },

  /* expertise chips */
  tag: {
    height: 34,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000000",
    shadowOpacity: 0.03,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },

  /* stats */
  statIcon: {
    position: "absolute",
    left: 17,
    top: 18,
    width: 14,
    height: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  slot: {
    height: 27,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: SLOT_BG,
  },
  slotOn: { backgroundColor: SLOT_INK },
  clientChip: {
    height: 29,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.white,
    shadowColor: "#000000",
    shadowOpacity: 0.02,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },

  /* past work */
  playBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.4)",
  },

  /* header */
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
  titlePill: {
    position: "absolute",
    left: 72.5,
    top: 19.5,
    width: 153,
    height: 41,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: GLASS_65,
    shadowColor: "#000000",
    shadowOpacity: 0.03,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
  },
  contextPill: {
    position: "absolute",
    left: 246,
    top: 21,
    width: 113,
    height: 38,
    borderRadius: 24,
    backgroundColor: GLASS_65,
    shadowColor: "#000000",
    shadowOpacity: 0.03,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
  },

  /* action bar */
  barFade: { position: "absolute", left: 0, top: -FADE_LIFT, width: FRAME_W, height: FADE_H },
  skip: {
    position: "absolute",
    left: 20,
    top: 16,
    width: 128,
    height: 59,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: GLASS_61,
    shadowColor: "#1A1A1A",
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 12 },
    elevation: 6,
  },
  circle: {
    position: "absolute",
    top: 16,
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  circleLight: { left: 193, backgroundColor: colors.white, borderWidth: 1, borderColor: CIRCLE_RING },
  circleDark: { left: 298, backgroundColor: DARK },
});
