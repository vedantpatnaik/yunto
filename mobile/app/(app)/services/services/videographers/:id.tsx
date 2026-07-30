import { useMemo, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, {
  Defs,
  LinearGradient as SvgLinear,
  RadialGradient,
  Rect,
  Stop,
} from "react-native-svg";
import { Abs, Screen, Txt, getScale } from "../../../../../src/ui/Frame";
import { colors } from "../../../../../src/theme";
import { inr, useCalendar, useCampaigns, useCreators } from "../../../../../src/api/hooks";

/**
 * Videographer detail — Figma 7348:19938 (375x875).
 *
 * Traced 1:1 from the spec. The frame is authored as fixed chrome (a glass
 * header at y=0..80 and the action bar at y=767..875) wrapping a "Main" region
 * whose content runs to y=1605.75, so the body scrolls inside the 375pt canvas
 * while both docks stay pinned. Every coordinate below is the raw frame
 * coordinate from the spec; <Screen> scales the canvas to the device and the
 * two docks re-apply the same scale so they line up with it exactly.
 */

/* ------------------------------- geometry -------------------------------- */
const FRAME_W = 375;
const FRAME_H = 875; // authored frame — the backdrop glows are placed in it
const HEADER_H = 80; // "Header" frame
const BAR_H = 108; // bottom "Frame" at y=767
const CONTENT_BOTTOM = 1613.67; // last Past Work tile bottom
const CONTENT_H = CONTENT_BOTTOM + BAR_H; // scroll extent + dock clearance

/* --------------------------- spec colour tokens --------------------------- */
const INK_TITLE = "#1D1D1F";
const INK_META = "#6E6E73";
const INK_HEADING = "#1A1A1A";
const INK_BODY = "#444444";
const INK_LABEL = "#666666";
const INK_SUB = "#888888";
const INK_CLIENT = "#333333";
const ACCENT_PRICE = "#7E57C2";
const GLASS_65 = "rgba(255,255,255,0.65)";
const GLASS_61 = "rgba(255,255,255,0.61)";
const GLASS_60 = "rgba(255,255,255,0.6)";
const GLASS_70 = "rgba(255,255,255,0.7)";
const GLASS_20 = "rgba(255,255,255,0.2)";
const PLACEHOLDER = "#EAEAEA";
const SLOT_BG = "#E8F5E9";
const SLOT_INK = "#2E7D32";
const DARK = "#312B28";

/* ------------------------------ spec content ------------------------------ */
/** Expertise chips: label + palette + design width, in spec order. */
const TAGS: { label: string; bg: string; ink: string; w: number }[] = [
  { label: "Reels", bg: "#E8F5E9", ink: "#2E7D32", w: 68.23 },
  { label: "BTS Shoots", bg: "#FFF3E0", ink: "#E65100", w: 105.98 },
  { label: "Brand Campaigns", bg: "#F3E5F5", ink: "#6A1B9A", w: 145.5 },
  { label: "Color Grading", bg: "#E3F2FD", ink: "#1565C0", w: 121.09 },
  { label: "Fast Cuts", bg: "#FCE4EC", ink: "#C2185B", w: 93.03 },
];
/** Chip rows and their y, straight off the 3-row tag cloud in the spec. */
const TAG_ROWS: { y: number; idx: number[] }[] = [
  { y: 805, idx: [0, 1] },
  { y: 849, idx: [2, 3] },
  { y: 893, idx: [4] },
];

const SPEC_CLIENTS = [
  { label: "Nykaa", w: 63.42 },
  { label: "Mamaearth", w: 93.31 },
  { label: "H&M", w: 54.22 },
];
const SPEC_SLOTS = [
  { label: "10:00", w: 56.66 },
  { label: "14:00", w: 56.73 },
];

/** 2-col Past Work grid — the four tiles' own boxes from the spec. */
const WORK_TILES = [
  { x: 20, y: 1190, w: 161.5, h: 207.55 },
  { x: 193.5, y: 1190, w: 161.5, h: 201.88 },
  { x: 20, y: 1403.88, w: 161.5, h: 207.55 },
  { x: 193.5, y: 1403.88, w: 161.5, h: 209.79 },
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

/* -------------------------------- backdrop -------------------------------- */
/** Frame fill: a warm vertical base plus four soft radial glows. */
function Backdrop() {
  return (
    <Svg width={FRAME_W} height={CONTENT_H} style={styles.backdrop}>
      <Defs>
        <SvgLinear id="base" x1="187.5" y1="0" x2="187.5" y2={CONTENT_H} gradientUnits="userSpaceOnUse">
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
      <Rect width={FRAME_W} height={CONTENT_H} fill="url(#base)" />
      <Rect width={FRAME_W} height={FRAME_H} fill="url(#pink)" />
      <Rect width={FRAME_W} height={FRAME_H} fill="url(#blue)" />
      <Rect width={FRAME_W} height={FRAME_H} fill="url(#gold)" />
      <Rect width={FRAME_W} height={FRAME_H} fill="url(#haze)" />
    </Svg>
  );
}

/* -------------------------------- chips ---------------------------------- */
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

  const { data: creators = [] } = useCreators();
  const { data: calendar = [] } = useCalendar();
  const { data: campaigns = [] } = useCampaigns();

  // Skip / reject advance through the roster; the id param seeds the cursor.
  const [cursor, setCursor] = useState(0);
  const seed = Math.max(0, creators.findIndex((c) => c.id === params.id));
  const creator = creators.length ? creators[(seed + cursor) % creators.length] : undefined;

  const detail = useMemo(() => {
    const booked = creator
      ? calendar
          .filter((k) => k.creatorId === creator.id)
          .sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt))
      : [];

    const day = new Date().toDateString();
    const slots = booked
      .filter((k) => new Date(k.scheduledAt).toDateString() === day)
      .map((k) => hhmm(k.scheduledAt));

    const agencyBrands = campaigns
      .filter((m) => !!creator?.agencyId && m.agencyId === creator.agencyId)
      .map((m) => m.brandName);
    const clients = uniq([...booked.map((k) => brandOf(k.title)), ...agencyBrands]);

    // niche + the formats this creator has actually shot drive the tag cloud.
    const liveTags = uniq([creator?.niche ?? "", ...booked.map((k) => formatOf(k.title))]);

    return { slots, clients, liveTags };
  }, [creator, calendar, campaigns]);

  const location = creator?.location ?? "Delhi";
  const name = creator?.name ?? "Sarthak";
  const role = creator?.niche ? `${creator.niche} Videographer` : "Fashion & Lifestyle Videographer";
  // cost-per-view x average views = what one deliverable from this creator costs.
  const price = creator ? `₹${inr(Math.round(creator.cpv * creator.avgViews))}` : "₹5000";
  const rating = creator ? `${creator.stars.toFixed(1)} ` : "4.9 ";
  const ratingCount = creator ? `(${creator.leadsCount ?? 0})` : "(124)";

  const clientChips = detail.clients.length
    ? detail.clients.slice(0, 3).map((label, i) => ({ label, w: SPEC_CLIENTS[i].w }))
    : SPEC_CLIENTS;
  const moreClients = detail.clients.length > 3 ? detail.clients.length - 3 : 0;

  const next = () => setCursor((i) => i + 1);

  return (
    <View style={styles.root}>
      <Screen height={CONTENT_H} background="#F7F0E4" scroll>
        <Backdrop />

        {/* ------------------------------ Hero ------------------------------ */}
        <Abs x={20} y={106} w={335} h={460} radius={28} style={styles.heroShadow}>
          <Abs x={0} y={0} w={335} h={460} radius={28} bg={PLACEHOLDER} style={styles.clip}>
            {/* Background — bottom-up scrim over the hero image */}
            <LinearGradient
              colors={["rgba(0,0,0,0.85)", "rgba(0,0,0,0.4)", "rgba(0,0,0,0)"] as const}
              locations={[0, 0.6, 1] as const}
              start={{ x: 0.5, y: 1 }}
              end={{ x: 0.5, y: 0 }}
              style={styles.heroScrim}
            />

            {/* TOP RATED */}
            <Abs x={24} y={290} w={108.58} h={28} radius={14} bg={GLASS_20} />
            <View style={styles.topRatedIcon}>
              <Feather name="award" size={12} color={colors.white} />
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

        {/* --------------- Pricing Card Overlapping Hero --------------- */}
        <Abs x={36} y={526} w={303} h={68} radius={24} style={styles.priceShadow}>
          <LinearGradient
            colors={[
              "rgba(255,229,164,0.82)",
              "rgba(255,245,228,0.92)",
              "rgba(244,211,238,0.88)",
              "rgba(202,217,255,0.76)",
            ] as const}
            locations={[0, 0.35, 0.72, 1] as const}
            start={{ x: 0.11, y: -0.21 }}
            end={{ x: 0.89, y: 1.21 }}
            style={styles.priceFill}
          />
          {/* Container — the price / divider / package group is centred in the
              card, so a longer live rate stays balanced exactly as designed. */}
          <Abs x={0} y={17} w={303} h={21} row gap={9.7} style={styles.centerRow}>
            <Txt
              size={18}
              weight="bold"
              font="inter"
              color={ACCENT_PRICE}
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

        {/* ----------------------------- Summary ---------------------------- */}
        <Abs x={20} y={618} w={335} h={132} radius={24} bg={GLASS_60} style={styles.summaryShadow}>
          <Txt x={21} y={20.25} w={293} size={15} weight="medium" font="inter" color={INK_BODY} lineHeight={22.5}>
            {'"I turn brand vibes into scroll-stopping\nvisuals. Specializing in high-retention\nedits and aesthetic storytelling for\nlifestyle brands."'}
          </Txt>
        </Abs>

        {/* -------------------------- Expertise Tags ------------------------ */}
        <Txt
          x={20}
          y={774}
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
                label={i < detail.liveTags.length ? detail.liveTags[i] : TAGS[i].label}
                bg={TAGS[i].bg}
                ink={TAGS[i].ink}
                w={TAGS[i].w}
              />
            ))}
          </Abs>
        ))}

        {/* ---------------------------- Stats Grid -------------------------- */}
        {/* Rating */}
        <Abs x={20} y={951} w={161.5} h={85} radius={20} bg={GLASS_70}>
          <View style={styles.statIcon}>
            <Feather name="star" size={14} color={INK_LABEL} />
          </View>
          <Txt x={37} y={17} size={13} weight="medium" font="inter" color={INK_LABEL} lineHeight={15.73}>
            Rating
          </Txt>
          <Txt x={17} y={37} size={18} weight="bold" font="inter" color={INK_HEADING} lineHeight={21.78}>
            {rating}
          </Txt>
          <Txt x={50.31} y={41} size={13} weight="medium" font="inter" color={INK_SUB} lineHeight={15.73}>
            {ratingCount}
          </Txt>
        </Abs>

        {/* Availability */}
        <Abs x={193.5} y={951} w={161.5} h={85} radius={20} bg={GLASS_70}>
          <View style={styles.statIcon}>
            <Feather name="clock" size={14} color={INK_LABEL} />
          </View>
          <Txt x={37} y={17} size={13} weight="medium" font="inter" color={INK_LABEL} lineHeight={15.73}>
            Today&apos;s Slots
          </Txt>
          <Abs x={17} y={41} row gap={7.56}>
            {SPEC_SLOTS.map((slot, i) => (
              <View key={slot.label} style={[styles.slot, { width: slot.w }]}>
                <Txt size={12} weight="semibold" font="inter" color={SLOT_INK} lineHeight={14.52}>
                  {i < detail.slots.length ? detail.slots[i] : slot.label}
                </Txt>
              </View>
            ))}
          </Abs>
        </Abs>

        {/* Past Clients */}
        <Abs x={20} y={1048} w={335} h={87} radius={20} bg={GLASS_70}>
          <View style={styles.statIcon}>
            <Feather name="briefcase" size={14} color={INK_LABEL} />
          </View>
          <Txt x={37} y={17} size={13} weight="medium" font="inter" color={INK_LABEL} lineHeight={15.73}>
            Past Clients
          </Txt>
          <Abs x={17} y={41} row gap={8}>
            {clientChips.map((c) => (
              <ClientChip key={c.label} label={c.label} w={c.w} ink={INK_CLIENT} />
            ))}
            {moreClients > 0 ? (
              <ClientChip label={`+${moreClients}`} w={46.89} ink={INK_SUB} />
            ) : detail.clients.length === 0 ? (
              <ClientChip label="+12" w={46.89} ink={INK_SUB} />
            ) : null}
          </Abs>
        </Abs>

        {/* --------------------------- Past Work Grid ----------------------- */}
        <Txt
          x={20}
          y={1159}
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

      {/* ------------------------- fixed Header --------------------------- */}
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
            <Feather name="chevron-left" size={20} color={INK_TITLE} />
          </Pressable>

          <View pointerEvents="none" style={styles.titlePill}>
            <Txt size={15} weight="bold" font="inter" color={INK_TITLE} lineHeight={18.15} align="center">
              Videographers
            </Txt>
          </View>

          <View pointerEvents="none" style={styles.contextPill}>
            <Txt x={15} y={11} size={13} weight="semibold" font="inter" color={INK_META} lineHeight={15.73} numberOfLines={1}>
              {`20 Jun | ${location}`}
            </Txt>
          </View>
        </View>
      </View>

      {/* ---------------------- fixed action bar -------------------------- */}
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
            locations={[0, 0.6, 1] as const}
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
            <Feather name="x" size={22} color={INK_HEADING} />
          </Pressable>

          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => [styles.circle, styles.circleDark, pressed && styles.pressed]}
          >
            <Feather name="check" size={26} color={colors.white} />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#F7F0E4" },
  backdrop: { position: "absolute", left: 0, top: 0 },
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
  heroScrim: { position: "absolute", left: 0, top: 210, width: 335, height: 250 },
  topRatedIcon: { position: "absolute", left: 37, top: 298, width: 12, height: 12, alignItems: "center", justifyContent: "center" },
  heroPin: { position: "absolute", left: 24, top: 400, width: 14, height: 14, alignItems: "center", justifyContent: "center" },

  /* pricing card */
  priceShadow: {
    shadowColor: "#000000",
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 12 },
    elevation: 4,
  },
  priceFill: { position: "absolute", left: 0, top: 0, width: 303, height: 68, borderRadius: 24 },
  centerRow: { justifyContent: "center" },
  priceDivider: { width: 1, height: 16, backgroundColor: "#E0E0E0" },

  /* summary */
  summaryShadow: {
    shadowColor: "#000000",
    shadowOpacity: 0.02,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },

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
  statIcon: { position: "absolute", left: 17, top: 18, width: 14, height: 14, alignItems: "center", justifyContent: "center" },
  slot: {
    height: 27,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: SLOT_BG,
  },
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
  titlePill: {
    position: "absolute",
    left: 78,
    top: 19.5,
    width: 150,
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
    left: 247,
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
  barFade: { position: "absolute", left: 0, top: 0, width: FRAME_W, height: BAR_H },
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
  circleLight: { left: 193, backgroundColor: colors.white },
  circleDark: { left: 298, backgroundColor: DARK },
});
