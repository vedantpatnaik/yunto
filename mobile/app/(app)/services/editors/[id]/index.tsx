import { Fragment, useMemo, useState } from "react";
import { Image, Pressable, ScrollView, StyleSheet } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Svg, {
  Defs,
  LinearGradient as SvgLinear,
  RadialGradient,
  Rect,
  Stop,
} from "react-native-svg";
import { Abs, Screen, Txt } from "../../../../../src/ui/Frame";
import { colors } from "../../../../../src/theme";
import { inr, useCalendar, useCampaigns, useCreators } from "../../../../../src/api/hooks";

/**
 * Editor detail — Figma 7348:20078 (375x875, 268 nodes).
 *
 * Same skeleton as the videographer detail (glass header, 335x460 hero with the
 * bottom scrim, overlapping pricing card, quote card, Expertise chips, Rating /
 * Today's Slots / Past Clients stat grid) plus the section this screen exists
 * for: a horizontally paged "Editing Styles" rail of 290x427 package cards with
 * bullet features, turnaround, revision count, per-video price and a
 * Selected / Select Style radio.
 *
 * The design frame is 875 tall but its content column runs to y=1613, so the
 * body scrolls in design space while the header and the action bar stay pinned.
 * All coordinates below are raw frame coordinates; <Screen> scales the 375pt
 * canvas to the device.
 */

/* ------------------------------- geometry -------------------------------- */
const FRAME_W = 375;
const FRAME_H = 875;
/** Tallest content bottom (Section - EDITING STYLES PACKAGES ends at 1613). */
const CONTENT_H = 1733;

/** Editing-styles rail: card origins straight from the spec. */
const RAIL_Y = 1170;
const RAIL_H = 443;
const RAIL_W = 962;
const CARD_X = [20, 322, 652];
const CARD_W = 290;
const CARD_H = 427.38;

/* --------------------------- spec colour tokens --------------------------- */
const INK_TITLE = "#1D1D1F";
const INK_META = "#6E6E73";
const INK_HEAD = "#1A1A1A";
const INK_BODY = "#666666";
const INK_ITEM = "#333333";
const INK_QUOTE = "#444444";
const INK_FOOT = "#777777";
const INK_DIM = "#888888";
const PRICE_PURPLE = "#7E57C2";
const BULLET_PURPLE = "#6A1B9A";
const STAR_AMBER = "#F5A623";
const SLOT_BG = "#E8F5E9";
const SLOT_INK = "#2E7D32";
const CHIP_LINE = "#F0F0F0";
const DARK = "#312B28";
const REJECT_RED = "#FF5252";
const GLASS = "rgba(255,255,255,0.65)";
const GLASS_LINE = "rgba(255,255,255,0.9)";

/* ---------------------------- expertise chips ----------------------------- */
const EXPERTISE = [
  { label: "Reels", x: 20, y: 780, w: 68.23, tx: 37, ty: 789, tw: 34.23, bg: "#E8F5E9", ink: "#2E7D32" },
  { label: "BTS Shoots", x: 98.23, y: 780, w: 105.98, tx: 115.23, ty: 789, tw: 71.98, bg: "#FFF3E0", ink: "#E65100" },
  { label: "Brand Campaigns", x: 20, y: 824, w: 145.5, tx: 37, ty: 833, tw: 111.5, bg: "#F3E5F5", ink: "#6A1B9A" },
  { label: "Color Grading", x: 175.5, y: 824, w: 121.09, tx: 192.5, ty: 833, tw: 87.09, bg: "#E3F2FD", ink: "#1565C0" },
  { label: "Fast Cuts", x: 20, y: 868, w: 93.03, tx: 37, ty: 877, tw: 59.03, bg: "#FCE4EC", ink: "#C2185B" },
];

/** Today's Slots pills — two positions, filled from the live calendar. */
const SLOTS = [
  { x: 210.5, w: 56.66, tx: 222.5, tw: 32.66 },
  { x: 274.72, w: 56.73, tx: 286.72, tw: 32.73 },
];

/** Past Clients chips — three brand pills plus the overflow counter. */
const CLIENT_CHIPS = [
  { x: 37, w: 63.42, tx: 50, tw: 37.42 },
  { x: 108.42, w: 93.31, tx: 121.42, tw: 67.31 },
  { x: 209.73, w: 54.22, tx: 222.73, tw: 28.22 },
];
const OVERFLOW_CHIP = { x: 271.95, w: 46.89, tx: 284.95, tw: 20.89 };

/* ----------------------------- style packages ----------------------------- */
interface StylePackage {
  name: string;
  blurb: string;
  features: string[];
  turnaround: string;
  revisions: string;
  /** Card-local x of the revisions icon / label — the row is a 16pt-gap flow. */
  revIconX: number;
  revTextX: number;
  price: string;
  priceW: number;
  slashX: number;
}

const PACKAGES: StylePackage[] = [
  {
    name: "Reel Growth Pack",
    blurb: "Designed for high retention and viral\nreach.",
    features: ["Fast cuts & transitions", "Color grading", "Trend-matched music"],
    turnaround: "48 hrs",
    revisions: "2 Revisions",
    revIconX: 88.41,
    revTextX: 106.41,
    price: "₹2000 ",
    priceW: 56.25,
    slashX: 73.25,
  },
  {
    name: "Cinematic Story Edit",
    blurb: "Premium storytelling with a film-like\naesthetic.",
    features: ["Advanced grading", "Sound design & SFX", "Smooth pacing"],
    turnaround: "72 hrs",
    revisions: "3 Revisions",
    revIconX: 87.13,
    revTextX: 105.13,
    price: "₹3000 ",
    priceW: 56.56,
    slashX: 73.56,
  },
  {
    name: "High-Energy Cuts",
    blurb: "Perfect for ads, fitness, and dynamic\ncontent.",
    features: ["Rapid pacing", "Kinetic typography", "Upbeat audio mix"],
    turnaround: "48 hrs",
    revisions: "2 Revisions",
    revIconX: 88.41,
    revTextX: 106.41,
    price: "₹2500 ",
    priceW: 55.33,
    slashX: 72.33,
  },
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

/* ------------------------------ package card ------------------------------ */
interface PackageCardProps {
  x: number;
  pkg: StylePackage;
  selected: boolean;
  onSelect: () => void;
}

/**
 * 290x427.38 editing-style card. Child offsets are card-relative. The selected
 * card swaps its lilac gradient + #D1C4E9 stroke in and its CTA narrows from
 * the 107pt "Select Style" outline to the 87.48pt dark "Selected" pill.
 */
function PackageCard({ x, pkg, selected, onSelect }: PackageCardProps) {
  return (
    <Abs
      x={x}
      y={0}
      w={CARD_W}
      h={CARD_H}
      radius={20}
      bg={selected ? undefined : "rgba(255,255,255,0.7)"}
      border={selected ? "#D1C4E9" : GLASS_LINE}
      borderWidth={1}
      style={selected ? styles.packShadowActive : styles.packShadow}
    >
      {selected ? (
        <LinearGradient
          colors={["#F8F5FF", "#FFFFFF"] as const}
          start={{ x: -0.19, y: 0.19 }}
          end={{ x: 1.19, y: 0.81 }}
          style={styles.packFill}
        />
      ) : null}

      {/* Style preview */}
      <Abs x={17} y={17} w={256} h={140} radius={14} bg="#EEEEEE" style={styles.clip}>
        <Abs x={110} y={52} w={36} h={36} radius={18} bg="rgba(0,0,0,0.3)" center>
          <Feather name="play" size={18} color={colors.white} />
        </Abs>
      </Abs>

      {/* Heading + blurb */}
      <Txt x={17} y={171} w={256} size={16} weight="bold" font="inter" color={INK_HEAD} lineHeight={19.36}>
        {pkg.name}
      </Txt>
      <Txt x={17} y={194} w={256} size={13} font="inter" color={INK_BODY} lineHeight={18.2}>
        {pkg.blurb}
      </Txt>

      {/* Feature list */}
      {pkg.features.map((f, i) => (
        <Fragment key={f}>
          <Abs x={17} y={242 + i * 24}>
            <Feather name="check" size={14} color={BULLET_PURPLE} />
          </Abs>
          <Txt
            x={39}
            y={241 + i * 24}
            size={13}
            weight="medium"
            font="inter"
            color={INK_ITEM}
            lineHeight={15.73}
            numberOfLines={1}
          >
            {f}
          </Txt>
        </Fragment>
      ))}

      {/* Turnaround + revisions, above a hairline rule */}
      <Abs x={17} y={319} w={256} h={1} bg="rgba(0,0,0,0.06)" />
      <Abs x={17} y={334.5}>
        <Feather name="clock" size={14} color={INK_FOOT} />
      </Abs>
      <Txt x={35} y={334} size={12} weight="semibold" font="inter" color={INK_FOOT} lineHeight={14.52}>
        {pkg.turnaround}
      </Txt>
      <Abs x={pkg.revIconX} y={334.5}>
        <Feather name="refresh-cw" size={14} color={INK_FOOT} />
      </Abs>
      <Txt x={pkg.revTextX} y={334} size={12} weight="semibold" font="inter" color={INK_FOOT} lineHeight={14.52}>
        {pkg.revisions}
      </Txt>

      {/* Price + radio CTA */}
      <Txt
        x={17}
        y={383.88}
        w={pkg.priceW}
        size={16}
        weight="bold"
        font="inter"
        color={INK_HEAD}
        lineHeight={19.36}
      >
        {pkg.price}
      </Txt>
      <Txt x={pkg.slashX} y={386.88} w={42.95} size={13} weight="semibold" font="inter" color={INK_BODY} lineHeight={15.73}>
        / video
      </Txt>
      <Pressable
        onPress={onSelect}
        style={({ pressed }) => [
          styles.styleCta,
          selected ? styles.styleCtaOn : styles.styleCtaOff,
          pressed && styles.pressed,
        ]}
      >
        <Txt
          x={17}
          y={9}
          w={selected ? 53.48 : 73}
          size={13}
          weight="bold"
          font="inter"
          color={selected ? colors.white : INK_HEAD}
          lineHeight={14.95}
          align="center"
        >
          {selected ? "Selected" : "Select Style"}
        </Txt>
      </Pressable>
    </Abs>
  );
}

/* --------------------------------- screen --------------------------------- */
export default function EditorDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [styleIdx, setStyleIdx] = useState(0);

  const { data: creators = [] } = useCreators();
  const { data: calendar = [] } = useCalendar();
  const { data: campaigns = [] } = useCampaigns();

  const editor = useMemo(
    () => creators.find((c) => c.id === id) ?? creators[0],
    [creators, id],
  );

  /** Today's Slots — the editor's own calendar entries, earliest first. */
  const slots = useMemo(() => {
    if (!editor) return [];
    return calendar
      .filter((c) => c.creatorId === editor.id)
      .map((c) => c.scheduledAt)
      .sort()
      .slice(0, SLOTS.length)
      .map((iso) => {
        const d = new Date(iso);
        return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
      });
  }, [calendar, editor]);

  /** Past Clients — the distinct brands this app has run campaigns for. */
  const clients = useMemo(() => {
    const names: string[] = [];
    for (const c of campaigns) {
      if (c.brandName && !names.includes(c.brandName)) names.push(c.brandName);
    }
    return names;
  }, [campaigns]);

  const overflow = Math.max(clients.length - CLIENT_CHIPS.length, 0);

  return (
    <Screen height={FRAME_H} background="#F7F0E4">
      <Backdrop />

      {/* ----------------------------- body ------------------------------ */}
      <ScrollView
        style={styles.scroller}
        contentContainerStyle={styles.scrollBody}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <Abs x={20} y={106} w={335} h={460} radius={28} bg="#EAEAEA" style={[styles.clip, styles.heroShadow]}>
          {editor?.avatarUrl ? (
            <Image source={{ uri: editor.avatarUrl }} style={styles.heroImage} resizeMode="cover" />
          ) : null}
          <LinearGradient
            colors={["rgba(0,0,0,0.85)", "rgba(0,0,0,0.4)", "rgba(0,0,0,0)"] as const}
            locations={[0, 0.6, 1]}
            start={{ x: 0.5, y: 1 }}
            end={{ x: 0.5, y: 0 }}
            style={styles.heroScrim}
          />
        </Abs>
        <Txt x={44} y={404} w={287} size={32} weight="bold" font="inter" color={colors.white} lineHeight={35.2} numberOfLines={1}>
          {editor?.name ?? ""}
        </Txt>
        <Txt
          x={44}
          y={444}
          w={287}
          size={15}
          weight="medium"
          font="inter"
          color={colors.white}
          lineHeight={18.15}
          numberOfLines={1}
          style={styles.roleLine}
        >
          {editor?.niche ? `${editor.niche} Video Editor • 4 yrs exp.` : ""}
        </Txt>
        <Abs x={44} y={473}>
          <Feather name="map-pin" size={14} color="rgba(255,255,255,0.7)" />
        </Abs>
        <Txt
          x={64}
          y={472}
          w={106.11}
          size={13}
          weight="medium"
          font="inter"
          color="rgba(255,255,255,0.7)"
          lineHeight={15.73}
          numberOfLines={1}
        >
          {editor?.location ? `${editor.location} • 5 yrs exp.` : ""}
        </Txt>

        {/* Pricing Card Overlapping Hero */}
        <Abs
          x={36}
          y={526}
          w={303}
          h={88}
          radius={24}
          border={colors.white}
          borderWidth={1}
          style={[styles.clip, styles.priceShadow]}
        >
          <LinearGradient
            colors={[
              "rgba(255,229,164,0.82)",
              "rgba(255,245,228,0.92)",
              "rgba(244,211,238,0.88)",
              "rgba(202,217,255,0.76)",
            ] as const}
            locations={[0, 0.35, 0.72, 1]}
            start={{ x: 0.11, y: -0.21 }}
            end={{ x: 0.89, y: 1.21 }}
            style={styles.priceFill}
          />
          <Txt x={114.5} y={17} w={74} size={18} weight="bold" font="inter" color={PRICE_PURPLE} lineHeight={21.78} align="center">
            {editor ? `₹${inr(editor.cpv)}` : ""}
          </Txt>
          <Txt x={51.7} y={42} w={199.59} size={13} weight="medium" font="inter" color={INK_BODY} lineHeight={15.73} align="center">
            Flexible project pricing available
          </Txt>
        </Abs>

        {/* Summary */}
        <Abs x={20} y={638} w={335} h={87} radius={24} bg="rgba(255,255,255,0.6)" border={GLASS_LINE} borderWidth={1} style={styles.softShadow} />
        <Txt x={41} y={658.25} w={293} size={15} weight="medium" font="inter" color={INK_QUOTE} lineHeight={22.5}>
          &quot;Snappy edits that elevate your reels game.&quot;
        </Txt>

        {/* Expertise Tags */}
        <Txt x={20} y={749} w={335} size={16} weight="bold" font="inter" color={INK_HEAD} lineHeight={19.36} letterSpacing={-0.16}>
          Expertise
        </Txt>
        {EXPERTISE.map((t) => (
          <Fragment key={t.label}>
            <Abs
              x={t.x}
              y={t.y}
              w={t.w}
              h={34}
              radius={20}
              bg={t.bg}
              border="rgba(255,255,255,0.6)"
              borderWidth={1}
              style={styles.chipShadow}
            />
            <Txt x={t.tx} y={t.ty} w={t.tw} size={13} weight="semibold" font="inter" color={t.ink} lineHeight={15.73}>
              {t.label}
            </Txt>
          </Fragment>
        ))}

        {/* Stats Grid — Rating */}
        <Abs x={20} y={926} w={161.5} h={85} radius={20} bg="rgba(255,255,255,0.7)" border="rgba(255,255,255,0.8)" borderWidth={1} />
        <Abs x={37} y={944}>
          <Feather name="star" size={14} color={STAR_AMBER} />
        </Abs>
        <Txt x={57} y={943} w={39.33} size={13} weight="medium" font="inter" color={INK_BODY} lineHeight={15.73}>
          Rating
        </Txt>
        <Txt x={37} y={963} w={33.31} size={18} weight="bold" font="inter" color={INK_HEAD} lineHeight={21.78}>
          {editor ? `${editor.stars.toFixed(1)} ` : ""}
        </Txt>
        <Txt x={70.31} y={967} w={31.33} size={13} weight="medium" font="inter" color={INK_DIM} lineHeight={15.73}>
          {editor ? `(${editor.leadsCount ?? 0})` : ""}
        </Txt>

        {/* Stats Grid — Availability */}
        <Abs x={193.5} y={926} w={161.5} h={85} radius={20} bg="rgba(255,255,255,0.7)" border="rgba(255,255,255,0.8)" borderWidth={1} />
        <Abs x={210.5} y={944}>
          <Feather name="clock" size={14} color={INK_BODY} />
        </Abs>
        <Txt x={230.5} y={943} w={83.36} size={13} weight="medium" font="inter" color={INK_BODY} lineHeight={15.73}>
          Today&apos;s Slots
        </Txt>
        {slots.map((time, i) => (
          <Fragment key={`${time}-${i}`}>
            <Abs x={SLOTS[i].x} y={967} w={SLOTS[i].w} h={27} radius={12} bg={SLOT_BG} />
            <Txt x={SLOTS[i].tx} y={973} w={SLOTS[i].tw} size={12} weight="semibold" font="inter" color={SLOT_INK} lineHeight={14.52}>
              {time}
            </Txt>
          </Fragment>
        ))}

        {/* Stats Grid — Past Clients */}
        <Abs x={20} y={1023} w={335} h={87} radius={20} bg="rgba(255,255,255,0.7)" border="rgba(255,255,255,0.8)" borderWidth={1} />
        <Abs x={37} y={1041}>
          <Feather name="briefcase" size={14} color={INK_BODY} />
        </Abs>
        <Txt x={57} y={1040} w={73.42} size={13} weight="medium" font="inter" color={INK_BODY} lineHeight={15.73}>
          Past Clients
        </Txt>
        {clients.slice(0, CLIENT_CHIPS.length).map((brand, i) => (
          <Fragment key={brand}>
            <Abs
              x={CLIENT_CHIPS[i].x}
              y={1064}
              w={CLIENT_CHIPS[i].w}
              h={29}
              radius={12}
              bg={colors.white}
              border={CHIP_LINE}
              borderWidth={1}
              style={styles.chipShadow}
            />
            <Txt
              x={CLIENT_CHIPS[i].tx}
              y={1071}
              w={CLIENT_CHIPS[i].tw}
              size={12}
              weight="bold"
              font="inter"
              color={INK_ITEM}
              lineHeight={14.52}
              numberOfLines={1}
            >
              {brand}
            </Txt>
          </Fragment>
        ))}
        {overflow > 0 ? (
          <Fragment>
            <Abs
              x={OVERFLOW_CHIP.x}
              y={1064}
              w={OVERFLOW_CHIP.w}
              h={29}
              radius={12}
              bg={colors.white}
              border={CHIP_LINE}
              borderWidth={1}
              style={styles.chipShadow}
            />
            <Txt x={OVERFLOW_CHIP.tx} y={1071} w={OVERFLOW_CHIP.tw} size={12} weight="bold" font="inter" color={INK_DIM} lineHeight={14.52}>
              +{overflow}
            </Txt>
          </Fragment>
        ) : null}

        {/* Section - EDITING STYLES PACKAGES */}
        <Txt x={20} y={1134} size={17} weight="bold" font="inter" color={INK_HEAD} lineHeight={20.57}>
          Editing Styles
        </Txt>
        <Abs x={0} y={RAIL_Y} w={FRAME_W} h={RAIL_H}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.rail}>
            {PACKAGES.map((pkg, i) => (
              <PackageCard
                key={pkg.name}
                x={CARD_X[i]}
                pkg={pkg}
                selected={i === styleIdx}
                onSelect={() => setStyleIdx(i)}
              />
            ))}
          </ScrollView>
        </Abs>
      </ScrollView>

      {/* ---------------------------- header ----------------------------- */}
      <Pressable onPress={() => router.back()} style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}>
        <Feather name="chevron-left" size={20} color="#1C1C1E" />
      </Pressable>
      <Abs x={78} y={19.5} w={150} h={41} radius={24} bg={GLASS} border={GLASS_LINE} borderWidth={1} style={styles.glassShadow} />
      <Txt x={97} y={30.5} w={112} size={15} weight="bold" font="inter" color={INK_TITLE} lineHeight={18.15} align="center">
        Editor
      </Txt>
      <Abs x={247} y={21} w={113} h={38} radius={24} bg={GLASS} border={GLASS_LINE} borderWidth={1} style={styles.glassShadow} />
      <Txt x={262} y={32} w={94} size={13} weight="semibold" font="inter" color={INK_META} lineHeight={15.73} numberOfLines={1}>
        20 Jun | {editor?.location ?? ""}
      </Txt>

      {/* -------------------------- action bar --------------------------- */}
      <LinearGradient
        colors={["#FAF9F6", "#FAF9F6", "rgba(250,249,246,0)"] as const}
        locations={[0, 0.6, 1]}
        start={{ x: 0.5, y: 1 }}
        end={{ x: 0.5, y: 0 }}
        style={styles.actionBar}
        pointerEvents="none"
      />
      <Pressable onPress={() => router.back()} style={({ pressed }) => [styles.skipButton, pressed && styles.pressed]}>
        <Txt x={49.5} y={21} w={29} size={14} weight="medium" font="inter" color={INK_HEAD} lineHeight={16.94} align="center">
          Skip
        </Txt>
      </Pressable>
      <Pressable
        onPress={() => router.back()}
        style={({ pressed }) => [styles.rejectButton, pressed && styles.pressed]}
      >
        <Feather name="x" size={28} color={REJECT_RED} />
      </Pressable>
      <Pressable
        onPress={() => router.push(`/services/editors/${editor?.id ?? ""}/book` as never)}
        style={({ pressed }) => [styles.confirmButton, pressed && styles.pressed]}
      >
        <Feather name="check" size={28} color={colors.white} />
      </Pressable>
    </Screen>
  );
}

/* --------------------------------- styles --------------------------------- */
const styles = StyleSheet.create({
  backdrop: { position: "absolute", left: 0, top: 0 },
  clip: { overflow: "hidden" },
  pressed: { opacity: 0.85 },

  scroller: { position: "absolute", left: 0, top: 0, width: FRAME_W, height: FRAME_H },
  scrollBody: { height: CONTENT_H },

  /* hero */
  heroImage: { position: "absolute", left: 0, top: 0, width: 335, height: 460 },
  heroScrim: { position: "absolute", left: 0, right: 0, bottom: 0, height: 250 },
  heroShadow: {
    shadowColor: "#000000",
    shadowOpacity: 0.08,
    shadowRadius: 32,
    shadowOffset: { width: 0, height: 16 },
    elevation: 8,
  },
  roleLine: { opacity: 0.95 },

  /* pricing card */
  priceFill: { position: "absolute", left: 0, top: 0, right: 0, bottom: 0 },
  priceShadow: {
    shadowColor: "#000000",
    shadowOpacity: 0.06,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 6,
  },
  softShadow: {
    shadowColor: "#000000",
    shadowOpacity: 0.02,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  chipShadow: {
    shadowColor: "#000000",
    shadowOpacity: 0.03,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },

  /* editing styles rail */
  rail: { width: RAIL_W, height: RAIL_H },
  packFill: { position: "absolute", left: 0, top: 0, right: 0, bottom: 0, borderRadius: 20 },
  packShadow: {
    shadowColor: "#000000",
    shadowOpacity: 0.03,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  packShadowActive: {
    shadowColor: "#6A1B9A",
    shadowOpacity: 0.06,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  styleCta: {
    position: "absolute",
    top: 377.38,
    height: 33,
    borderRadius: 16,
    justifyContent: "center",
  },
  styleCtaOn: { left: 185.52, width: 87.48, backgroundColor: DARK },
  styleCtaOff: { left: 166, width: 107, backgroundColor: "#FFFFFF" },

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
    backgroundColor: GLASS,
    borderWidth: 1,
    borderColor: GLASS_LINE,
    shadowColor: "#000000",
    shadowOpacity: 0.03,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  glassShadow: {
    shadowColor: "#000000",
    shadowOpacity: 0.03,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },

  /* action bar */
  actionBar: { position: "absolute", left: 0, top: 771, width: FRAME_W, height: 108 },
  skipButton: {
    position: "absolute",
    left: 20,
    top: 787,
    width: 128,
    height: 59,
    borderRadius: 30,
    backgroundColor: "rgba(255,255,255,0.61)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.62)",
    shadowColor: "#1A1A1A",
    shadowOpacity: 0.2,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 8,
  },
  rejectButton: {
    position: "absolute",
    left: 193,
    top: 787,
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#EAEAEA",
    shadowColor: "#000000",
    shadowOpacity: 0.04,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  confirmButton: {
    position: "absolute",
    left: 298,
    top: 787,
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: DARK,
    shadowColor: "#000000",
    shadowOpacity: 0.04,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
});
