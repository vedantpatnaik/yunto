import { Fragment, useState } from "react";
import { Pressable, ScrollView, StyleSheet, TextInput } from "react-native";
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
import { Abs, Screen, Txt } from "../../../src/ui/Frame";
import { fonts } from "../../../src/theme";
import { useCreators, useMe } from "../../../src/api/hooks";

/**
 * Plan Generator — Figma 7358:23487 (375x875), traced 1:1.
 *
 * The AI content-plan setup form. Everything lives in one 343x890 glass card at
 * (16,106); its parent "Main" frame is only 651 tall and clipsContent, so the
 * card scrolls inside that window while the header and the "Select Dates"
 * button at (181,769) stay pinned to the frame. ("Floating CTA" at (267,627) is
 * an empty 64x64 frame in Figma — no fill, no stroke, no children — so it draws
 * nothing and is not built.)
 *
 * Coordinates below are raw frame coordinates from the spec. CX/CY rebase them
 * into the card's scroll content so the numbers in this file stay the numbers in
 * Figma.
 */

/* ------------------------------- geometry -------------------------------- */
const FRAME_W = 375;
const FRAME_H = 875;

/** "Main" — the clipping viewport the card scrolls inside. */
const MAIN = { x: 0, y: 106, w: 375, h: 651 } as const;
const CARD = { x: 16, y: 106, w: 343, h: 890 } as const;

/** Frame coordinate -> card-scroll coordinate. */
const CX = (n: number) => n - CARD.x;
const CY = (n: number) => n - CARD.y;

/* --------------------------- spec colour tokens --------------------------- */
const INK_TITLE = "#2b2240";
const INK_LABEL = "#8a819c";
const INK_PLACEHOLDER = "#a098ae";
const INK_CHIP_OFF = "#6b627a";
const INK_RANGE_ON = "#4a3a6b";
const INK_TAG = "#4a3a6b";
const INK_HEADER = "#1d1d1f";
const AI_TINT = "#a48aeb";

const GLASS_50 = "rgba(255,255,255,0.5)";
const GLASS_55 = "rgba(255,255,255,0.55)";
const GLASS_60 = "rgba(255,255,255,0.6)";
const GLASS_65 = "rgba(255,255,255,0.65)";
const GLASS_70 = "rgba(255,255,255,0.7)";
const HAIRLINE_80 = "rgba(255,255,255,0.8)";
const HAIRLINE_90 = "rgba(255,255,255,0.9)";
const LILAC_LINE = "rgba(230,230,250,0.8)";
const LILAC_LINE_90 = "rgba(230,230,250,0.9)";
const CARD_LINE = "rgba(43,34,64,0.06)";

/** The AI badge gradient. */
const AI_GRADIENT = ["#fff0f5", "#e6e6fa"] as const;
/** Selected time-range pill. */
const RANGE_GRADIENT = ["#e6e6fa", "#f3ebff"] as const;

/** Platform chips carry the spec's single "selected" treatment (Instagram). */
const PLATFORM_ON = { bg: "#e0f2ec", line: "#bee3d4", ink: "#1c4030" } as const;
/** Unselected chip treatment, shared by platforms and content types. */
const CHIP_OFF = { bg: GLASS_60, line: HAIRLINE_90, ink: INK_CHIP_OFF } as const;

/* ------------------------------ section data ------------------------------ */
type TimeRange = "1W" | "2W" | "1M" | "custom";

/** Segmented control: four 72.75x41 cells inside the 301x51 track at (37,281). */
const RANGES: { key: TimeRange; label: string; x: number }[] = [
  { key: "1W", label: "1W", x: 42 },
  { key: "2W", label: "2W", x: 114.75 },
  { key: "1M", label: "1M", x: 187.5 },
  { key: "custom", label: "Custom", x: 260.25 },
];

/**
 * Chip labels are hug-width TEXT nodes in Figma, so only their origin is pinned
 * here. Pinning Figma's measured hug width too would clip them: the shipped
 * Inter renders a touch wider than Figma measures, which wrapped "YouTube" onto
 * a second line inside its 39pt chip.
 */
const PLATFORMS = [
  { key: "instagram", label: "Instagram", x: 37, y: 655, w: 122.98, tx: 76, ty: 666 },
  { key: "youtube", label: "YouTube", x: 169.98, y: 655, w: 92, tx: 186.98, ty: 666 },
  { key: "linkedin", label: "LinkedIn", x: 37, y: 704, w: 90.5, tx: 54, ty: 715 },
  { key: "x", label: "X", x: 137.5, y: 704, w: 43.81, tx: 154.5, ty: 715 },
] as const;

const CONTENT_TYPES = [
  { key: "post", label: "Post", x: 37, y: 798, w: 63.66, tx: 54, ty: 807,
    bg: "#f3e8ff", line: "#e6d5f7", ink: "#5b3e85" },
  { key: "reel", label: "Reel", x: 110.66, y: 798, w: 63, tx: 127.66, ty: 807,
    bg: "#ffe8ec", line: "#f5d5dc", ink: "#853e4b" },
  { key: "carousel", label: "Carousel", x: 183.52, y: 798, w: 93.55, tx: 200.52, ty: 807,
    bg: "#fff3cd", line: "#f0dfad", ink: "#7a6014" },
  { key: "image", label: "Image", x: 37, y: 843, w: 75.11, tx: 54, ty: 852,
    bg: "#e0f2ec", line: "#c9e6da", ink: "#1c4030" },
  { key: "story", label: "Story", x: 122.11, y: 843, w: 71, tx: 139.11, ty: 852,
    bg: "#e6f0ff", line: "#d0e1fa", ink: "#224a75" },
] as const;

/** Section labels — 12/600 Inter, letter-spaced, each on the 301pt column. */
const LABELS = [
  { y: 254, text: "TIME RANGE", w: 301 },
  { y: 360, text: "CONTENT DESCRIPTION", w: 301 },
  { y: 525, text: "FOCUS", w: 144.5, x: 37 },
  { y: 525, text: "FREQUENCY", w: 144.5, x: 193.5 },
  { y: 628, text: "TARGET PLATFORMS", w: 301 },
  { y: 771, text: "CONTENT TYPES", w: 301 },
  { y: 906, text: "TAGS", w: 301 },
];

const DESCRIPTION_PLACEHOLDER =
  "Describe your content vibe,\ncampaign goals, or specific themes...";

/**
 * The frame ships exactly one frequency value and no option list, so the field
 * displays the design's literal rather than inventing alternatives.
 */
const FREQUENCY = "Weekly";
/** Fallbacks used until the creator record resolves. */
const FALLBACK_FOCUS = "Lifestyle";
const FALLBACK_TAGS = ["Travel", "Fashion"];

/* -------------------------------- backdrop -------------------------------- */
/** Frame fill: warm vertical base plus four soft radial glows. */
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

/* --------------------------------- screen --------------------------------- */
export default function PlanGenerator() {
  const router = useRouter();

  // The plan is authored for the signed-in creator, so the fields the schema
  // actually models — niche, platform, location — seed the form.
  const { data: me } = useMe();
  const { data: creators = [] } = useCreators();
  const creator = creators.find((c) => c.name === me?.name);

  const niches = Array.from(
    new Set(creators.map((c) => c.niche).filter((n): n is string => !!n)),
  );
  const focusOptions = niches.length ? niches : [FALLBACK_FOCUS];

  const [timeRange, setTimeRange] = useState<TimeRange>("2W");
  const [description, setDescription] = useState("");
  const [focus, setFocus] = useState<string | null>(null);
  const [platforms, setPlatforms] = useState<string[] | null>(null);
  const [contentTypes, setContentTypes] = useState<string[]>(
    CONTENT_TYPES.map((t) => t.key),
  );
  const [tags, setTags] = useState<string[] | null>(null);
  const [draftTag, setDraftTag] = useState<string | null>(null);

  const focusValue = focus ?? creator?.niche ?? focusOptions[0];
  const cycleFocus = () => {
    const i = focusOptions.indexOf(focusValue);
    setFocus(focusOptions[(i + 1) % focusOptions.length]);
  };

  const defaultPlatform =
    PLATFORMS.find((p) => p.key === (creator?.platform ?? "").toLowerCase())?.key ??
    "instagram";
  const selectedPlatforms: string[] = platforms ?? [defaultPlatform];
  const togglePlatform = (key: string) =>
    setPlatforms(
      selectedPlatforms.includes(key)
        ? selectedPlatforms.filter((p) => p !== key)
        : [...selectedPlatforms, key],
    );

  const toggleType = (key: string) =>
    setContentTypes(
      contentTypes.includes(key)
        ? contentTypes.filter((t) => t !== key)
        : [...contentTypes, key],
    );

  const seedTags = [creator?.niche, creator?.location].filter(
    (t): t is string => !!t,
  );
  const tagList = tags ?? (seedTags.length ? seedTags : FALLBACK_TAGS);
  const addTag = () => {
    const value = (draftTag ?? "").trim();
    if (value && !tagList.includes(value)) setTags([...tagList, value]);
    setDraftTag(null);
  };

  const submit = () =>
    router.push({
      pathname: "/content/plan-select-dates",
      params: {
        range: timeRange,
        description,
        focus: focusValue,
        frequency: FREQUENCY,
        platforms: selectedPlatforms.join(","),
        types: contentTypes.join(","),
        tags: tagList.join(","),
      },
    });

  return (
    <Screen height={FRAME_H} background="#F7F0E4" scroll>
      <Backdrop />

      {/* ------------------------- Main (clips the card) -------------------- */}
      <Abs x={MAIN.x} y={MAIN.y} w={MAIN.w} h={MAIN.h} style={styles.mainClip}>
        {/* Card surface. The 890pt panel outruns the 651pt window, so the two
            lower corners and the bottom edge are cut away by the clip. */}
        <Abs
          x={CARD.x}
          y={0}
          w={CARD.w}
          h={MAIN.h}
          radius={24}
          bg={GLASS_55}
          border={CARD_LINE}
          borderWidth={1}
          style={styles.cardSurface}
        />

        <ScrollView
          style={styles.cardScroll}
          contentContainerStyle={styles.cardContent}
          nestedScrollEnabled
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* ----------------------------- AI Intro ------------------------- */}
          <Abs
            x={CX(163.5)}
            y={CY(135)}
            w={48}
            h={48}
            radius={24}
            border={HAIRLINE_80}
            borderWidth={1}
            center
            style={styles.aiBadge}
          >
            <LinearGradient
              colors={AI_GRADIENT}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.aiBadgeFill}
            />
            <MaterialCommunityIcons name="creation-outline" size={24} color={AI_TINT} />
          </Abs>
          <Txt
            x={CX(110)}
            y={CY(195)}
            w={155}
            size={22}
            weight="bold"
            font="inter"
            color={INK_TITLE}
            lineHeight={26.62}
            letterSpacing={-0.5}
            align="center"
          >
            Plan Generator
          </Txt>

          {/* --------------------------- Section labels --------------------- */}
          {LABELS.map((l) => (
            <Txt
              key={l.text}
              x={CX(l.x ?? 37)}
              y={CY(l.y)}
              w={l.w}
              size={12}
              weight="semibold"
              font="inter"
              color={INK_LABEL}
              lineHeight={14.52}
              letterSpacing={0.8}
            >
              {l.text}
            </Txt>
          ))}

          {/* ---------------------------- Time Range ------------------------ */}
          <Abs
            x={CX(37)}
            y={CY(281)}
            w={301}
            h={51}
            radius={16}
            bg={GLASS_50}
            border={HAIRLINE_80}
            borderWidth={1}
          />
          {RANGES.map((r) => {
            const on = timeRange === r.key;
            return (
              <Pressable
                key={r.key}
                onPress={() => setTimeRange(r.key)}
                style={[styles.rangeCell, { left: CX(r.x), top: CY(286) }, on && styles.rangeCellOn]}
              >
                {on ? (
                  <LinearGradient
                    colors={RANGE_GRADIENT}
                    start={{ x: 0.11, y: -0.19 }}
                    end={{ x: 0.89, y: 1.19 }}
                    style={styles.rangeFill}
                  />
                ) : null}
                <Txt
                  size={14}
                  weight="semibold"
                  font="inter"
                  color={on ? INK_RANGE_ON : INK_LABEL}
                  lineHeight={16.94}
                  align="center"
                >
                  {r.label}
                </Txt>
              </Pressable>
            );
          })}

          {/* --------------------------- Description ------------------------ */}
          <Abs
            x={CX(37)}
            y={CY(387)}
            w={301}
            h={110}
            radius={16}
            bg={GLASS_60}
            border={LILAC_LINE}
            borderWidth={1}
          />
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder={DESCRIPTION_PLACEHOLDER}
            placeholderTextColor={INK_PLACEHOLDER}
            multiline
            textAlignVertical="top"
            style={styles.descInput}
          />

          {/* ---------------------------- Dropdowns ------------------------- */}
          {/* Both values run from the 16pt inset to the chevron container at
              x=109.5, so 92.5 is the field's content box. Figma's hug widths
              (57.06 / 49) sit right on the glyph advance and clipped here. */}
          <Pressable onPress={cycleFocus} style={[styles.dropdown, { left: CX(37), top: CY(552) }]}>
            <Txt
              x={17}
              y={15.5}
              w={92.5}
              size={14}
              weight="medium"
              font="inter"
              color={INK_TITLE}
              lineHeight={16.94}
              numberOfLines={1}
            >
              {focusValue}
            </Txt>
            <Abs x={109.5} y={15} w={18} h={18} center>
              <Feather name="chevron-down" size={18} color={INK_PLACEHOLDER} />
            </Abs>
          </Pressable>

          <Abs
            x={CX(193.5)}
            y={CY(552)}
            w={144.5}
            h={48}
            radius={14}
            bg={GLASS_60}
            border={LILAC_LINE}
            borderWidth={1}
            style={styles.dropdownShadow}
          >
            <Txt
              x={17}
              y={15.5}
              w={92.5}
              size={14}
              weight="medium"
              font="inter"
              color={INK_TITLE}
              lineHeight={16.94}
              numberOfLines={1}
            >
              {FREQUENCY}
            </Txt>
            <Abs x={109.5} y={15} w={18} h={18} center>
              <Feather name="chevron-down" size={18} color={INK_PLACEHOLDER} />
            </Abs>
          </Abs>

          {/* ------------------------ Platform Selector --------------------- */}
          {PLATFORMS.map((p) => {
            const on = selectedPlatforms.includes(p.key);
            const skin = on ? PLATFORM_ON : CHIP_OFF;
            return (
              <Fragment key={p.key}>
                <Pressable
                  onPress={() => togglePlatform(p.key)}
                  style={[
                    styles.chip,
                    {
                      left: CX(p.x),
                      top: CY(p.y),
                      width: p.w,
                      height: 39,
                      borderRadius: 20,
                      backgroundColor: skin.bg,
                      borderColor: skin.line,
                    },
                  ]}
                />
                {/* The 16x16 glyph on the Instagram chip is a 10.67x7.33 tick,
                    not a brand mark — it is the chip's "selected" marker. */}
                {p.key === "instagram" ? (
                  <Abs x={CX(54)} y={CY(666.5)} w={16} h={16} center>
                    <Feather name="check" size={16} color={skin.ink} />
                  </Abs>
                ) : null}
                <Txt
                  x={CX(p.tx)}
                  y={CY(p.ty)}
                  size={14}
                  weight="medium"
                  font="inter"
                  color={skin.ink}
                  lineHeight={16.94}
                >
                  {p.label}
                </Txt>
              </Fragment>
            );
          })}

          {/* -------------------------- Content Types ----------------------- */}
          {CONTENT_TYPES.map((t) => {
            const on = contentTypes.includes(t.key);
            return (
              <Fragment key={t.key}>
                <Pressable
                  onPress={() => toggleType(t.key)}
                  style={[
                    styles.chip,
                    {
                      left: CX(t.x),
                      top: CY(t.y),
                      width: t.w,
                      height: 35,
                      borderRadius: 14,
                      backgroundColor: on ? t.bg : CHIP_OFF.bg,
                      borderColor: on ? t.line : CHIP_OFF.line,
                    },
                  ]}
                />
                <Txt
                  x={CX(t.tx)}
                  y={CY(t.ty)}
                  size={14}
                  weight="medium"
                  font="inter"
                  color={on ? t.ink : CHIP_OFF.ink}
                  lineHeight={16.94}
                >
                  {t.label}
                </Txt>
              </Fragment>
            );
          })}

          {/* ----------------------------- Tags ----------------------------- */}
          {/* Figma lays this row out horizontally with a 10pt gap and hug-width
              chips, so the row hugs here too and stays correct for live tags. */}
          <Abs x={CX(37)} y={CY(933)} w={301} row gap={10} style={styles.tagRow}>
            {tagList.map((t) => (
              <Pressable key={t} onPress={() => setTags(tagList.filter((x) => x !== t))} style={styles.tagChip}>
                <Txt size={13} weight="medium" font="inter" color={INK_TAG} lineHeight={15.73}>
                  {t}
                </Txt>
              </Pressable>
            ))}
            {draftTag === null ? (
              <Pressable onPress={() => setDraftTag("")} style={styles.addTagChip}>
                <Feather name="plus" size={14} color={INK_LABEL} />
                <Txt size={13} weight="medium" font="inter" color={INK_LABEL} lineHeight={15.73}>
                  Add Tag
                </Txt>
              </Pressable>
            ) : (
              <Abs w={101.64} h={34} radius={10} border="#b8b0c8" borderWidth={1} style={styles.addTagBox}>
                <TextInput
                  value={draftTag}
                  onChangeText={setDraftTag}
                  onSubmitEditing={addTag}
                  onBlur={addTag}
                  autoFocus
                  returnKeyType="done"
                  style={styles.tagInput}
                />
              </Abs>
            )}
          </Abs>
        </ScrollView>
      </Abs>

      {/* -------------------------------- Header ---------------------------- */}
      <Pressable onPress={() => router.back()} style={styles.backButton}>
        <Feather name="arrow-left" size={20} color="#1c1c1e" />
      </Pressable>
      <Txt
        x={103.5}
        y={30}
        w={190}
        size={16}
        weight="bold"
        font="inter"
        color={INK_HEADER}
        lineHeight={19.36}
        align="center"
      >
        Planner
      </Txt>

      {/* ---------------------------- Select Dates -------------------------- */}
      <Pressable onPress={submit} style={styles.cta}>
        <Txt
          x={24}
          y={18.5}
          w={98}
          size={16}
          weight="semibold"
          font="inter"
          color="#ffffff"
          lineHeight={19.36}
          align="center"
        >
          Select Dates
        </Txt>
        <Abs x={134} y={18} w={20} h={20} center>
          <Feather name="arrow-right" size={20} color="#ffffff" />
        </Abs>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  backdrop: { position: "absolute", left: 0, top: 0 },

  /* ------------------------------ card shell ------------------------------ */
  mainClip: { overflow: "hidden" },
  cardSurface: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    borderBottomWidth: 0,
    shadowColor: "#1e1432",
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 12 },
    shadowRadius: 24,
    elevation: 6,
  },
  cardScroll: { position: "absolute", left: CARD.x, top: 0, width: CARD.w, height: MAIN.h },
  cardContent: { width: CARD.w, height: CARD.h },

  /* -------------------------------- AI intro ------------------------------ */
  aiBadge: {
    overflow: "hidden",
    shadowColor: "#e6e6fa",
    shadowOpacity: 0.6,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 8,
    elevation: 4,
  },
  aiBadgeFill: { position: "absolute", left: 0, top: 0, right: 0, bottom: 0 },

  /* ------------------------------ time range ------------------------------ */
  rangeCell: {
    position: "absolute",
    width: 72.75,
    height: 41,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  rangeCellOn: {
    shadowColor: "#e6e6fa",
    shadowOpacity: 0.6,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 3,
  },
  rangeFill: { position: "absolute", left: 0, top: 0, right: 0, bottom: 0 },

  /* ------------------------------ description ----------------------------- */
  descInput: {
    position: "absolute",
    left: CX(54),
    top: CY(403.25),
    // 269 = the 301pt field minus its 16pt insets. Figma's TEXT node hugs to
    // 263 because the placeholder happens to end there; holding the text to
    // that measurement pushed "themes..." onto a third line here.
    width: 269,
    height: 77.5,
    padding: 0,
    fontFamily: fonts.inter,
    fontSize: 15,
    lineHeight: 22.5,
    color: INK_TITLE,
  },

  /* ------------------------------- dropdowns ------------------------------ */
  dropdown: {
    position: "absolute",
    width: 144.5,
    height: 48,
    borderRadius: 14,
    backgroundColor: GLASS_60,
    borderWidth: 1,
    borderColor: LILAC_LINE,
    shadowColor: "#000000",
    shadowOpacity: 0.012,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3,
    elevation: 1,
  },
  dropdownShadow: {
    shadowColor: "#000000",
    shadowOpacity: 0.012,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3,
    elevation: 1,
  },

  /* --------------------------------- chips -------------------------------- */
  chip: {
    position: "absolute",
    borderWidth: 1,
    shadowColor: "#000000",
    shadowOpacity: 0.02,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3,
    elevation: 1,
  },

  /* --------------------------------- tags --------------------------------- */
  tagRow: { flexWrap: "wrap" },
  tagChip: {
    height: 34,
    borderRadius: 10,
    backgroundColor: GLASS_70,
    borderWidth: 1,
    borderColor: LILAC_LINE_90,
    paddingHorizontal: 15,
    justifyContent: "center",
  },
  addTagChip: {
    height: 34,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#b8b0c8",
    paddingHorizontal: 15,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  addTagBox: { position: "relative", paddingHorizontal: 15, justifyContent: "center" },
  tagInput: {
    padding: 0,
    height: 20,
    fontFamily: fonts.interMedium,
    fontSize: 13,
    color: INK_TAG,
  },

  /* --------------------------------- header ------------------------------- */
  backButton: {
    position: "absolute",
    left: 15,
    top: 18,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: GLASS_65,
    borderWidth: 1,
    borderColor: HAIRLINE_90,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000000",
    shadowOpacity: 0.03,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 2,
  },

  /* ----------------------------- Select Dates ----------------------------- */
  cta: {
    position: "absolute",
    left: 181,
    top: 769,
    width: 178,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#312b28",
  },
});
