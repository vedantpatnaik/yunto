import { Fragment, useMemo, useState } from "react";
import { Image, Pressable, ScrollView, StyleSheet } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Abs, Screen, Txt } from "../../../src/ui/Frame";
import { colors } from "../../../src/theme";
import { inr, useCalendar, useCampaigns, useCreators } from "../../../src/api/hooks";

/**
 * Editor Detail — Figma 7778:18262 "editors details" (375x876, 267 nodes).
 *
 * The agency-side view of one add-on editor. It carries the same spine as the
 * videographer sheet — glass header, 335x460 hero with the bottom scrim, the
 * 303x55 pricing card overlapping it at y=520, the quote card, the Expertise
 * chip wrap and the Rating / Today's Slots / Past Clients stat grid — plus the
 * section this screen exists for: the "Editing Styles" rail at y=1095, three
 * 290x427.38 package cards laid out at x = 20 / 322 / 652 so the row runs to
 * x=942 and scrolls sideways inside the 375pt frame.
 *
 * The frame is 876 tall but the content column runs to y=1574, so the body
 * scrolls in design space while the header (y=0..80) and the action bar
 * (y=765..873) stay pinned exactly where Figma parks them. Every coordinate
 * below is a raw frame coordinate; <Screen> scales the 375pt canvas.
 *
 * What the schema can and cannot back:
 *   - the person is a Creator row: name, niche, location, stars, cpv/avgViews,
 *     leadsCount, avatarUrl. There is no `role` column, so this route is simply
 *     the editor presentation of a Creator — nothing is invented to fake one.
 *   - the design's "• 4 yrs exp." / "• 5 yrs exp." suffixes have no experience
 *     column behind them, so they are dropped rather than fabricated.
 *   - "(124)" beside the rating is a review tally the schema does not keep; the
 *     only engagement count on a Creator is leadsCount, so that is what prints,
 *     and the parenthetical is omitted when the record has none.
 *   - CampaignCreator is not exposed as a list endpoint, so Past Clients is the
 *     distinct brand set of the campaigns belonging to this editor's agency.
 *   - there is no Package model at all. The three editing styles are the design
 *     catalogue verbatim — copy, features, turnaround, revisions and price —
 *     with only the selection being real state.
 */

/* ------------------------------- geometry -------------------------------- */
const FRAME_W = 375;
const FRAME_H = 876;
/** Section - EDITING STYLES PACKAGES ends at 1574; the rest is bar clearance. */
const CONTENT_H = 1694;

/** Editing-styles rail: the container at y=1131, card origins from the spec. */
const RAIL_Y = 1131;
const RAIL_H = 443;
const RAIL_W = 962; // 652 + 290 card + the 20pt gutter the frame leaves
const CARD_W = 290;
const CARD_H = 427.38;

/* --------------------------- spec colour tokens --------------------------- */
const PAGE = "#F8F5EF";
const BACK_FILL = "#1F1A17";
const BACK_ICON = "#FAF7F2";
const INK_TITLE = "#1D1D1F";
const INK_META = "#6E6E73";
const INK_HEAD = "#1A1A1A";
const INK_BODY = "#666666";
const INK_ITEM = "#333333";
const INK_QUOTE = "#444444";
const INK_FOOT = "#777777";
const INK_DIM = "#888888";
const PRICE_BLUE = "#0D86FF";
const PRICE_CARD = "#E4ECF4";
const HERO_PLATE = "#EAEAEA";
const BULLET_PURPLE = "#6A1B9A";
const STAR_AMBER = "#F5A623";
const SLOT_BG = "#E8F5E9";
const SLOT_INK = "#2E7D32";
const CHIP_LINE = "#F0F0F0";
const RULE = "rgba(0,0,0,0.06)";
const DARK = "#312B28";
const REJECT_RED = "#FF5252";
const GLASS_65 = "rgba(255,255,255,0.65)";
const GLASS_LINE = "rgba(255,255,255,0.9)";
const HERO_META = "rgba(255,255,255,0.7)";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/* ---------------------------- expertise chips ----------------------------- */
/** The wrap at y=741 — two rows of two and a trailing chip, widths as authored. */
const EXPERTISE = [
  { label: "Reels", x: 20, y: 741, w: 68.23, tx: 37, ty: 750, tw: 34.23, bg: "#E8F5E9", ink: "#2E7D32" },
  { label: "BTS Shoots", x: 98.23, y: 741, w: 105.98, tx: 115.23, ty: 750, tw: 71.98, bg: "#FFF3E0", ink: "#E65100" },
  { label: "Brand Campaigns", x: 20, y: 785, w: 145.5, tx: 37, ty: 794, tw: 111.5, bg: "#F3E5F5", ink: "#6A1B9A" },
  { label: "Color Grading", x: 175.5, y: 785, w: 121.09, tx: 192.5, ty: 794, tw: 87.09, bg: "#E3F2FD", ink: "#1565C0" },
  { label: "Fast Cuts", x: 20, y: 829, w: 93.03, tx: 37, ty: 838, tw: 59.03, bg: "#FCE4EC", ink: "#C2185B" },
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
  /** Rail x of the card, and the card-local x of the nodes that hug their text. */
  x: number;
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
    x: 20,
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
    x: 322,
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
    x: 652,
    revIconX: 88.41,
    revTextX: 106.41,
    price: "₹2500 ",
    priceW: 55.33,
    slashX: 72.33,
  },
];

/* ------------------------------ package card ------------------------------ */
/**
 * 290x427.38 editing-style card; child offsets are card-relative. The selected
 * card swaps in the #F8F5FF→#FFFFFF gradient and its CTA narrows from the 107pt
 * white "Select Style" pill to the 87.48pt dark "Selected" one.
 */
function PackageCard({
  pkg, selected, onSelect,
}: { pkg: StylePackage; selected: boolean; onSelect: () => void }) {
  return (
    <Abs
      x={pkg.x}
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

      {/* Style Preview — IMAGE fill in the design, its grey plate without one */}
      <Abs x={17} y={17} w={256} h={140} radius={14} bg="#EEEEEE" style={styles.clip}>
        <Abs x={110} y={52} w={36} h={36} radius={18} bg="rgba(0,0,0,0.3)" center>
          <Feather name="play" size={18} color={colors.white} />
        </Abs>
      </Abs>

      {/* Heading 4 + blurb */}
      <Txt x={17} y={171} w={256} size={16} weight="bold" font="inter" color={INK_HEAD} lineHeight={19.36}>
        {pkg.name}
      </Txt>
      <Txt x={17} y={194} w={256} size={13} font="inter" color={INK_BODY} lineHeight={18.2}>
        {pkg.blurb}
      </Txt>

      {/* List — three items on a 24pt step */}
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

      {/* HorizontalBorder — turnaround + revisions under a hairline */}
      <Abs x={17} y={319} w={256} h={1} bg={RULE} />
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

      {/* Price + CTA */}
      <Txt x={17} y={383.88} w={pkg.priceW} size={16} weight="bold" font="inter" color={INK_HEAD} lineHeight={19.36}>
        {pkg.price}
      </Txt>
      <Txt
        x={pkg.slashX}
        y={386.88}
        w={42.95}
        size={13}
        weight="semibold"
        font="inter"
        color={INK_BODY}
        lineHeight={15.73}
      >
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
  const { id } = useLocalSearchParams<{ id?: string }>();
  const [styleIdx, setStyleIdx] = useState(0);

  const { data: creators = [], isLoading } = useCreators();
  const { data: calendar = [] } = useCalendar();
  const { data: campaigns = [] } = useCampaigns();

  const editor = useMemo(
    () => creators.find((c) => c.id === id) ?? creators[0],
    [creators, id],
  );

  /** Today's Slots — this editor's calendar entries dated today, earliest first. */
  const slots = useMemo(() => {
    if (!editor) return [];
    const now = new Date();
    return calendar
      .filter((c) => {
        if (c.creatorId !== editor.id) return false;
        const d = new Date(c.scheduledAt);
        return (
          d.getFullYear() === now.getFullYear() &&
          d.getMonth() === now.getMonth() &&
          d.getDate() === now.getDate()
        );
      })
      .map((c) => new Date(c.scheduledAt))
      .sort((a, b) => a.getTime() - b.getTime())
      .slice(0, SLOTS.length)
      .map((d) => `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`);
  }, [calendar, editor]);

  /** Past Clients — the distinct brands the managing agency has run campaigns for. */
  const clients = useMemo(() => {
    const names: string[] = [];
    for (const c of campaigns) {
      if (editor?.agencyId && c.agencyId !== editor.agencyId) continue;
      if (c.brandName && !names.includes(c.brandName)) names.push(c.brandName);
    }
    return names;
  }, [campaigns, editor]);

  const overflow = Math.max(clients.length - CLIENT_CHIPS.length, 0);

  /**
   * The hero price. cpv is a per-view float, so the figure a booking is actually
   * quoted at is cpv x avgViews — the same derivation the Commercials card on
   * creator-detail uses — rounded to the nearest 500.
   */
  const rate = useMemo(() => {
    if (!editor || editor.cpv <= 0 || editor.avgViews <= 0) return 0;
    return Math.round((editor.cpv * editor.avgViews) / 500) * 500;
  }, [editor]);

  const today = new Date();
  const dateLabel = `${today.getDate()} ${MONTHS[today.getMonth()]}`;

  return (
    <Screen height={FRAME_H} background={PAGE}>
      {/* ------------------------------- body ------------------------------- */}
      <ScrollView
        style={styles.scroller}
        contentContainerStyle={styles.scrollBody}
        showsVerticalScrollIndicator={false}
      >
        {/* ============================== Hero =============================== */}
        <Abs
          x={20}
          y={100}
          w={335}
          h={460}
          radius={28}
          bg={HERO_PLATE}
          style={[styles.clip, styles.heroShadow]}
        >
          {editor?.avatarUrl ? (
            <Image source={{ uri: editor.avatarUrl }} style={styles.heroImage} resizeMode="cover" />
          ) : null}
          {/* Background — the 250pt scrim rising off the card floor */}
          <LinearGradient
            colors={["rgba(0,0,0,0.85)", "rgba(0,0,0,0.4)", "rgba(0,0,0,0)"] as const}
            locations={[0, 0.6, 1]}
            start={{ x: 0.5, y: 1 }}
            end={{ x: 0.5, y: 0 }}
            style={styles.heroScrim}
          />
        </Abs>
        <Txt
          x={44}
          y={398}
          w={287}
          size={32}
          weight="bold"
          font="inter"
          color={colors.white}
          lineHeight={35.2}
          numberOfLines={1}
        >
          {editor?.name ?? (isLoading ? "Loading…" : "No editor")}
        </Txt>
        <Txt
          x={44}
          y={438}
          w={287}
          size={15}
          weight="medium"
          font="inter"
          color={colors.white}
          lineHeight={18.15}
          numberOfLines={1}
          style={styles.roleLine}
        >
          {editor?.niche ? `${editor.niche} Video Editor` : "Video Editor"}
        </Txt>
        {editor?.location ? (
          <Fragment>
            <Abs x={44} y={467}>
              <Feather name="map-pin" size={14} color={HERO_META} />
            </Abs>
            <Txt
              x={64}
              y={466}
              w={106.11}
              size={13}
              weight="medium"
              font="inter"
              color={HERO_META}
              lineHeight={15.73}
              numberOfLines={1}
            >
              {editor.location}
            </Txt>
          </Fragment>
        ) : null}

        {/* Pricing Card Overlapping Hero */}
        <Abs x={36} y={520} w={303} h={55} radius={28} bg={PRICE_CARD} style={styles.priceShadow} />
        <Txt
          x={136}
          y={537}
          w={103}
          size={18}
          weight="bold"
          font="inter"
          color={PRICE_BLUE}
          lineHeight={21.78}
          align="center"
          numberOfLines={1}
        >
          {rate > 0 ? `₹${inr(rate)}` : "—"}
        </Txt>

        {/* ============================= Summary ============================= */}
        <Abs
          x={20}
          y={599}
          w={335}
          h={87}
          radius={24}
          bg="rgba(255,255,255,0.6)"
          border={GLASS_LINE}
          borderWidth={1}
          style={styles.softShadow}
        />
        <Txt x={41} y={619.25} w={293} size={15} weight="medium" font="inter" color={INK_QUOTE} lineHeight={22.5}>
          &quot;Snappy edits that elevate your reels game.&quot;
        </Txt>

        {/* ========================== Expertise Tags ========================= */}
        <Txt
          x={20}
          y={710}
          w={335}
          size={16}
          weight="bold"
          font="inter"
          color={INK_HEAD}
          lineHeight={19.36}
          letterSpacing={-0.16}
        >
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

        {/* ====================== Stats Grid — Rating ======================= */}
        <Abs
          x={20}
          y={887}
          w={161.5}
          h={85}
          radius={20}
          bg="rgba(255,255,255,0.7)"
          border="rgba(255,255,255,0.8)"
          borderWidth={1}
        />
        <Abs x={37} y={905}>
          <Feather name="star" size={14} color={STAR_AMBER} />
        </Abs>
        <Txt x={57} y={904} w={39.33} size={13} weight="medium" font="inter" color={INK_BODY} lineHeight={15.73}>
          Rating
        </Txt>
        <Txt x={37} y={924} w={33.31} size={18} weight="bold" font="inter" color={INK_HEAD} lineHeight={21.78}>
          {editor ? `${editor.stars.toFixed(1)} ` : "—"}
        </Txt>
        {editor && (editor.leadsCount ?? 0) > 0 ? (
          <Txt x={70.31} y={928} w={31.33} size={13} weight="medium" font="inter" color={INK_DIM} lineHeight={15.73}>
            {`(${editor.leadsCount})`}
          </Txt>
        ) : null}

        {/* ==================== Stats Grid — Availability =================== */}
        <Abs
          x={193.5}
          y={887}
          w={161.5}
          h={85}
          radius={20}
          bg="rgba(255,255,255,0.7)"
          border="rgba(255,255,255,0.8)"
          borderWidth={1}
        />
        <Abs x={210.5} y={905}>
          <Feather name="clock" size={14} color={INK_BODY} />
        </Abs>
        <Txt x={230.5} y={904} w={83.36} size={13} weight="medium" font="inter" color={INK_BODY} lineHeight={15.73}>
          Today&apos;s Slots
        </Txt>
        {slots.map((time, i) => (
          <Fragment key={`${time}-${i}`}>
            <Abs x={SLOTS[i].x} y={928} w={SLOTS[i].w} h={27} radius={12} bg={SLOT_BG} />
            <Txt
              x={SLOTS[i].tx}
              y={934}
              w={SLOTS[i].tw}
              size={12}
              weight="semibold"
              font="inter"
              color={SLOT_INK}
              lineHeight={14.52}
            >
              {time}
            </Txt>
          </Fragment>
        ))}

        {/* ==================== Stats Grid — Past Clients =================== */}
        <Abs
          x={20}
          y={984}
          w={335}
          h={87}
          radius={20}
          bg="rgba(255,255,255,0.7)"
          border="rgba(255,255,255,0.8)"
          borderWidth={1}
        />
        <Abs x={37} y={1002}>
          <Feather name="briefcase" size={14} color={INK_BODY} />
        </Abs>
        <Txt x={57} y={1001} w={73.42} size={13} weight="medium" font="inter" color={INK_BODY} lineHeight={15.73}>
          Past Clients
        </Txt>
        {clients.slice(0, CLIENT_CHIPS.length).map((brand, i) => (
          <Fragment key={brand}>
            <Abs
              x={CLIENT_CHIPS[i].x}
              y={1025}
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
              y={1032}
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
              y={1025}
              w={OVERFLOW_CHIP.w}
              h={29}
              radius={12}
              bg={colors.white}
              border={CHIP_LINE}
              borderWidth={1}
              style={styles.chipShadow}
            />
            <Txt
              x={OVERFLOW_CHIP.tx}
              y={1032}
              w={OVERFLOW_CHIP.tw}
              size={12}
              weight="bold"
              font="inter"
              color={INK_DIM}
              lineHeight={14.52}
            >
              {`+${overflow}`}
            </Txt>
          </Fragment>
        ) : null}

        {/* ================ Section — EDITING STYLES PACKAGES =============== */}
        <Txt x={20} y={1095} w={114.11} size={17} weight="bold" font="inter" color={INK_HEAD} lineHeight={20.57}>
          Editing Styles
        </Txt>
        <Abs x={0} y={RAIL_Y} w={FRAME_W} h={RAIL_H}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.rail}>
            {PACKAGES.map((pkg, i) => (
              <PackageCard
                key={pkg.name}
                pkg={pkg}
                selected={i === styleIdx}
                onSelect={() => setStyleIdx(i)}
              />
            ))}
          </ScrollView>
        </Abs>
      </ScrollView>

      {/* ------------------------------ header ------------------------------ */}
      <Pressable onPress={() => router.back()} style={({ pressed }) => [styles.back, pressed && styles.pressed]}>
        <Feather name="arrow-left" size={16} color={BACK_ICON} />
      </Pressable>
      <Abs x={72} y={19.5} w={150} h={41} radius={24} bg={GLASS_65} style={styles.glassShadow} />
      <Txt x={91} y={30.5} w={112} size={15} weight="bold" font="inter" color={INK_TITLE} lineHeight={18.15} align="center">
        Editor
      </Txt>
      <Abs x={242} y={21} w={113} h={38} radius={24} bg={GLASS_65} style={styles.glassShadow} />
      <Txt
        x={257}
        y={32}
        w={94}
        size={13}
        weight="semibold"
        font="inter"
        color={INK_META}
        lineHeight={15.73}
        numberOfLines={1}
      >
        {editor?.location ? `${dateLabel} | ${editor.location}` : dateLabel}
      </Txt>

      {/* ---------------------------- action bar ---------------------------- */}
      <LinearGradient
        colors={["#FAF9F6", "#FAF9F6", "rgba(250,249,246,0)"] as const}
        locations={[0, 0.6, 1]}
        start={{ x: 0.5, y: 1 }}
        end={{ x: 0.5, y: 0 }}
        style={styles.actionBar}
        pointerEvents="none"
      />
      <Pressable onPress={() => router.back()} style={({ pressed }) => [styles.skip, pressed && styles.pressed]}>
        <Txt x={49.5} y={21} w={29} size={14} weight="medium" font="inter" color={INK_HEAD} lineHeight={16.94} align="center">
          Skip
        </Txt>
      </Pressable>
      <Pressable onPress={() => router.back()} style={({ pressed }) => [styles.reject, pressed && styles.pressed]}>
        <Feather name="x" size={28} color={REJECT_RED} />
      </Pressable>
      <Pressable
        onPress={() => router.push("/agency/creators/creators-selected-view")}
        style={({ pressed }) => [styles.confirm, pressed && styles.pressed]}
      >
        <Feather name="check" size={28} color={colors.white} />
      </Pressable>
    </Screen>
  );
}

/* --------------------------------- styles --------------------------------- */
const styles = StyleSheet.create({
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

  /* cards */
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
  back: {
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
    elevation: 2,
  },

  /* action bar */
  actionBar: { position: "absolute", left: 0, top: 765, width: FRAME_W, height: 108 },
  skip: {
    position: "absolute",
    left: 20,
    top: 781,
    width: 128,
    height: 59,
    borderRadius: 30,
    backgroundColor: "rgba(255,255,255,0.61)",
    shadowColor: "#1A1A1A",
    shadowOpacity: 0.2,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 8,
  },
  reject: {
    position: "absolute",
    left: 193,
    top: 781,
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    shadowColor: "#000000",
    shadowOpacity: 0.04,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  confirm: {
    position: "absolute",
    left: 298,
    top: 781,
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
