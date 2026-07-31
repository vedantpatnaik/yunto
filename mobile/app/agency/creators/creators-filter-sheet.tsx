import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { Image, Pressable, View } from "react-native";
import type { GestureResponderEvent } from "react-native";
import { useRouter } from "expo-router";
import { Feather, Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Abs, Ring, Screen, Txt } from "../../../src/ui/Frame";
import { compact, useCreators, type Creator } from "../../../src/api/hooks";

/**
 * Creators — filter sheet — Figma 7786:21143 (375x876), traced 1:1.
 *
 * The agency roster with the facet sheet raised over it: a full-bleed #b5b4b9
 * @57% scrim (0,0 375x876) and an opaque white sheet (0,195 375x681, corners
 * 32/32/0/0) carrying the drag handle, the "Filter" header row and six facet
 * sections — Niche, Follower Range, By Tag, By Age, Gender, Location.
 *
 * The frame ships no apply/reset control, so every toggle commits immediately:
 * the roster underneath re-queries on each change and its counters ("Total: N
 * Creators", "N creators selected", "N total", "N results") move with it. The
 * close button and the scrim both dismiss.
 *
 * Sheet body runs 301 → 849, i.e. inside the 195 → 876 sheet, so it never
 * overflows the frame; <Screen scroll> carries the whole 876pt canvas on
 * handsets shorter than the design rather than nesting a second scroller inside
 * the sheet, which would fight the outer one for the same vertical gesture.
 *
 * Two facets have no column behind them and are marked as such at their
 * sections: By Tag (Creator has no tags field — the chips are sheet state and
 * do not narrow the roster) and By Age (no date-of-birth on Creator, so the
 * "19 - 25" pill is the spec's own value, read-only).
 *
 * The frame's two Geist nodes ("Creators", "Niche") render in Inter — Geist is
 * not one of the faces registered in app/_layout.tsx and Inter is the dominant
 * face in this frame.
 *
 * Coordinates below are raw frame coordinates; <Screen> scales the 375pt canvas.
 */

/* -------------------------------- geometry -------------------------------- */
const FRAME_W = 375;
const FRAME_H = 876;

const SHEET_Y = 195;
const SHEET_H = 681;
const SHEET_RADIUS = 32;

/** Roster card stack. The design's list Container clips at 343 + 384 = 727. */
const LIST_Y = 343;
const LIST_H = 384;
const CARD_X = 16;
const CARD_W = 343;
const CARD_H = 211.5;
const CARD_Y0 = 379;
const CARD_STEP = 227.5; // 211.5 card + 16 stack gap

/** Follower slider: track (16,557 339x9), traced 47pt fill, 25pt radio thumb. */
const TRACK_X = 16;
const TRACK_Y = 557;
const TRACK_W = 339;
const TRACK_FILL_TRACED = 47;
const THUMB = 25;

/* ------------------------------ spec colours ------------------------------ */
const PAGE_BG = "#f8f5ef";
const SCRIM = "rgba(181,180,185,0.57)";
const INK = "#141311";
const INK_SHEET_TITLE = "#111111";
const INK_MUTED = "#8c8a84";
const INK_CHIP = "#212121";
const INK_70 = "rgba(0,0,0,0.7)";
const PAPER = "#faf7f2";

const CHIP_ON = "rgba(0,0,0,0.9)";
const CHIP_OFF = "#e4e9ef";
const TAG_ON = "#5683f5";
const BUTTON_BG = "#fefcff";
const TAG_CHIP_BG = "#f5f5f5";

const CLOSE_BG = "#f8f8f8";
const CLOSE_INK = "#555555";
const HANDLE = "#e5e5e5";

const TRACK_BG = "#d2d0d0";
const TRACK_FILL = "#2e2e2e";

const FIELD_BG = "#fafafa";
const FIELD_LINE = "#f0eff1";
const FIELD_INK = "#7f7f7f";

const GLASS_80 = "rgba(255,255,255,0.8)";
const GLASS_70 = "rgba(255,255,255,0.7)";
const GLASS_30 = "rgba(255,255,255,0.3)";
const SELECT_LINE = "rgba(232,229,223,0.3)";
const DIVIDER = "rgba(20,19,17,0.06)";
const SELECTBAR_BG = "rgba(242,237,255,0.5)";
const PERF_INK = "#23c16b";

/** The four card tints the stack cycles through, with their stat-strip wash. */
const CARD_TINTS = [
  { from: "#f2edffcc", strip: "rgba(242,237,255,0.4)" },
  { from: "#ffecf3cc", strip: "rgba(255,236,243,0.4)" },
  { from: "#e8f3ffcc", strip: "rgba(232,243,255,0.4)" },
  { from: "#e9f6edcc", strip: "rgba(233,246,237,0.4)" },
] as const;
const CARD_TO = "#ffffff80";
const CARD_GRAD_START = { x: 0.23, y: -0.23 };
const CARD_GRAD_END = { x: 0.77, y: 1.23 };

/* ----------------------------- facet taxonomy ----------------------------- */
/**
 * The eight niche chips at their wrapped positions. Each pill is sized to its
 * own label in the design, so width, text size and baseline are per chip.
 */
const NICHES = [
  { label: "Travel", x: 16, y: 329, w: 90.21, size: 13, lh: 15.73, ty: 338 },
  { label: "Artists & Films", x: 119.1, y: 329, w: 123.92, size: 12, lh: 14.52, ty: 338 },
  { label: "Finance", x: 250.94, y: 329, w: 108.06, size: 12, lh: 14.52, ty: 337 },
  { label: "Fashion & Lifestyle", x: 16, y: 373, w: 144, size: 12, lh: 14.52, ty: 382 },
  { label: "Health & Fitness", x: 165.69, y: 373, w: 126.89, size: 12, lh: 14.52, ty: 382 },
  { label: "Beauty & Wellness", x: 16, y: 417, w: 159.61, size: 12, lh: 14.52, ty: 425 },
  { label: "Crafts & DIY", x: 16, y: 461, w: 121.93, size: 12, lh: 14.52, ty: 471 },
  { label: "Other ", x: 155.94, y: 461, w: 119.95, size: 12, lh: 14.52, ty: 470 },
] as const;

/** Two chips carry the near-black selected stroke in the frame. */
const NICHES_ON: string[] = ["Travel", "Fashion & Lifestyle"];

/** Gender rows at the x steps the spec lays out (checkbox 16 / 94 / 155). */
const GENDERS = [
  { label: "Female", box: 16, tx: 34, tw: 42 },
  { label: "Male", box: 94, tx: 112, tw: 28 },
  { label: "Others", box: 155, tx: 173, tw: 39 },
] as const;

/** Agency tag vocabulary. The frame ships exactly one tag. */
const TAG_VOCAB: string[] = ["Couple"];

/* ------------------------------ derivations ------------------------------- */
/** Words a niche chip claims from Creator.niche; "DIY"/"&" are too short. */
const tokensOf = (label: string) =>
  label.toLowerCase().split(/[^a-z]+/).filter((t) => t.length >= 4);

/** "Other" is the residue bucket: a niche no other chip claims. */
function matchesNiche(label: string, niche: string): boolean {
  if (label.trim() === "Other") {
    return !NICHES.some(
      (n) => n.label.trim() !== "Other" && tokensOf(n.label).some((t) => niche.includes(t)),
    );
  }
  return tokensOf(label).some((t) => niche.includes(t));
}

/**
 * The card's badge. Creator has no status column, so the design's own four
 * labels are chosen from the numbers that do exist rather than invented.
 */
function badgeOf(c: Creator): string {
  if (c.stars >= 4.7) return "Top Performer";
  if (c.engagementRate >= 5) return "Rising Fast";
  if ((c.leadsCount ?? 0) >= 10) return "High Priority";
  return "Niche Fit";
}

const platformIcon = (p?: string): "youtube" | "music" | "instagram" =>
  p === "YOUTUBE" ? "youtube" : p === "TIKTOK" ? "music" : "instagram";

/* ------------------------------- primitives ------------------------------- */
/** A 34pt outline pill — every niche chip in this sheet is one. */
function Pill({
  x, y, w, on, onPress, children,
}: {
  x: number; y: number; w: number; on: boolean;
  onPress: () => void; children: ReactNode;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        position: "absolute", left: x, top: y, width: w, height: 34,
        borderRadius: 20, borderWidth: 1.5, borderColor: on ? CHIP_ON : CHIP_OFF,
        opacity: pressed ? 0.7 : 1,
      })}
    >
      {children}
    </Pressable>
  );
}

/** Section heading: Niche / Follower Range / By Tag / By Age / Gender. */
const Section = ({ y, w, children }: { y: number; w: number; children: string }) => (
  <Txt x={16} y={y} w={w} size={12} weight="medium" font="inter" color="#000000" lineHeight={24}>
    {children}
  </Txt>
);

/** famicons:checkbox-outline — a 12x12 outline box inside its 16x16 slot. */
const CheckBox = ({ on }: { on: boolean }) => (
  <Abs x={2} y={2} w={12} h={12} radius={3} border="#000000" borderWidth={1} center>
    {on ? <Feather name="check" size={9} color="#000000" /> : null}
  </Abs>
);

/* ---------------------------- roster card (under) -------------------------- */
/** One 343x211.5 creator card, drawn at its stack slot inside the clipped list. */
function CreatorCard({ c, i, selected }: { c: Creator; i: number; selected: boolean }) {
  // List container clips from y=343, so card offsets are container-relative.
  const t = CARD_Y0 - LIST_Y + i * CARD_STEP;
  const tint = CARD_TINTS[i % CARD_TINTS.length];
  const stats = [
    { label: "FOLLOWERS", value: compact(c.followers).toUpperCase() },
    { label: "VIEWS", value: compact(c.avgViews).toUpperCase() },
    { label: "LEADS", value: `${c.leadsCount ?? 0}` },
  ];

  return (
    <View>
      <LinearGradient
        colors={[tint.from, CARD_TO] as const}
        start={CARD_GRAD_START}
        end={CARD_GRAD_END}
        style={{
          position: "absolute", left: CARD_X, top: t,
          width: CARD_W, height: CARD_H, borderRadius: 26,
        }}
      />

      {/* avatar + platform badge */}
      {c.avatarUrl ? (
        <Image
          source={{ uri: c.avatarUrl }}
          style={{
            position: "absolute", left: 32, top: t + 24, width: 48, height: 48,
            borderRadius: 24, borderWidth: 2, borderColor: "#ffffff",
          }}
        />
      ) : (
        <Ring x={32} y={t + 24} size={48} />
      )}
      <Abs x={66} y={t + 58} w={16} h={16} radius={8} bg="#ffffff" center>
        <Feather name={platformIcon(c.platform)} size={8} color={INK} />
      </Abs>

      {/* name, handle + niche, badge */}
      <Txt
        x={92} y={t + 16} w={128.44} size={14} weight="bold" font="inter"
        color={INK} lineHeight={17.5} letterSpacing={-0.35} numberOfLines={1}
      >
        {c.name}
      </Txt>
      <Abs x={92} y={t + 36} h={20} row gap={6}>
        <Txt size={10} font="inter" color={INK_MUTED} lineHeight={15}>
          {c.handle}
        </Txt>
        {c.niche ? (
          <Abs
            h={20} radius={10} bg={GLASS_80} center
            style={{ position: "relative", paddingHorizontal: 6 }}
          >
            <Txt size={9} weight="bold" font="inter" color={INK_MUTED} lineHeight={13.5}>
              {c.niche}
            </Txt>
          </Abs>
        ) : null}
      </Abs>
      <Abs x={92} y={t + 60} h={20} radius={10} bg={GLASS_70} row gap={4} style={{ paddingHorizontal: 9 }}>
        <Feather name="star" size={8} color={INK} />
        <Txt size={9} weight="bold" font="inter" color={INK} lineHeight={13.5}>
          {badgeOf(c)}
        </Txt>
      </Abs>

      {/* select toggle — filled for the creators carried into the selection */}
      {selected ? (
        <Abs x={319} y={t + 18} w={24} h={24} radius={12} bg={INK} center>
          <Feather name="check" size={11} color={PAPER} />
        </Abs>
      ) : (
        <Abs
          x={318} y={t + 17} w={26} h={26} radius={13} bg={GLASS_80}
          border={SELECT_LINE} borderWidth={1}
        />
      )}

      {/* stat strip */}
      <Abs x={32} y={t + 94} w={311} h={53.5} radius={16} bg={tint.strip} />
      {stats.map((s, k) => (
        <View key={s.label}>
          <Txt
            x={42 + k * 73} y={t + 104} w={72} size={9} font="inter" color={INK_MUTED}
            lineHeight={13.5} letterSpacing={0.45} align="center"
          >
            {s.label}
          </Txt>
          <Txt
            x={42 + k * 73} y={t + 117.5} w={72} size={14} weight="bold" font="inter"
            color={INK} lineHeight={20} align="center"
          >
            {s.value}
          </Txt>
        </View>
      ))}
      {[114, 187, 260].map((dx) => (
        <Abs key={dx} x={dx} y={t + 108.75} w={1} h={24} bg={DIVIDER} />
      ))}
      <Txt
        x={261} y={t + 106} w={72} size={9} font="inter" color={INK_MUTED}
        lineHeight={13.5} letterSpacing={0.45} align="center"
      >
        PERF.
      </Txt>
      <Txt
        x={261} y={t + 119.5} w={72} size={12} weight="bold" font="inter"
        color={PERF_INK} lineHeight={16} align="center"
      >
        {`+${c.engagementRate.toFixed(1)}%`}
      </Txt>

      {/* row actions, above the 1pt white hairline */}
      <Abs x={32} y={t + 161.5} w={311} h={1} bg={GLASS_30} />
      {([
        { label: "Profile", x: 32, icon: "user" },
        { label: "Call", x: 138.33, icon: "phone" },
        { label: "Chat", x: 244.67, icon: "message-circle" },
      ] as const).map((b) => (
        <Abs key={b.label} x={b.x} y={t + 164.5} w={98.33} h={31} radius={12} bg={GLASS_80} row center gap={6}>
          <Feather name={b.icon} size={11} color={INK} />
          <Txt size={10} weight="semibold" font="inter" color={INK} lineHeight={15}>
            {b.label}
          </Txt>
        </Abs>
      ))}
    </View>
  );
}

/* --------------------------------- screen --------------------------------- */
export default function CreatorsFilterSheet() {
  const router = useRouter();
  const { data: creators, isLoading } = useCreators();
  const all = useMemo<Creator[]>(() => creators ?? [], [creators]);

  /* Facet state. The frame's own selections are the initial value. */
  const [niches, setNiches] = useState<string[]>(NICHES_ON);
  const [followersMax, setFollowersMax] = useState(500_000); // "0 - 500" (thousands)
  const [tags, setTags] = useState<string[]>(["Couple"]);
  const [genders, setGenders] = useState<string[]>(["Female"]);
  const [places, setPlaces] = useState<string[]>(["Delhi"]);

  const toggle = (list: string[], v: string) =>
    list.includes(v) ? list.filter((k) => k !== v) : [...list, v];

  /** Slider domain: the widest audience the roster actually carries. */
  const domainMax = useMemo(() => all.reduce((m, c) => Math.max(m, c.followers), 0), [all]);

  /** Location vocabulary is a Creator.location facet, so "Add location" is real. */
  const placeVocab = useMemo(() => {
    const seen: string[] = [];
    for (const c of all) if (c.location && !seen.includes(c.location)) seen.push(c.location);
    return seen.sort();
  }, [all]);

  /** OR inside a facet, AND across facets. Tag and age carry no Creator field. */
  const filtered = useMemo(
    () =>
      all.filter((c) => {
        if (niches.length && !niches.some((n) => matchesNiche(n, (c.niche ?? "").toLowerCase())))
          return false;
        if (c.followers > followersMax) return false;
        if (genders.length && !genders.some((g) => g.toLowerCase() === (c.gender ?? "").toLowerCase()))
          return false;
        if (places.length && !places.includes(c.location ?? "")) return false;
        return true;
      }),
    [all, niches, followersMax, genders, places],
  );

  /**
   * Selection carried in from the list: the frame draws the filled check on the
   * 1st and 4th card and reads "2 creators selected".
   */
  const selectedIds = useMemo(
    () => [filtered[0]?.id, filtered[3]?.id].filter((id): id is string => !!id),
    [filtered],
  );

  const fillW =
    domainMax > 0
      ? Math.max(0, Math.min(TRACK_W, (TRACK_W * followersMax) / domainMax))
      : TRACK_FILL_TRACED;

  const onTrack = (e: GestureResponderEvent) => {
    if (domainMax <= 0) return;
    const frac = Math.max(0, Math.min(1, e.nativeEvent.locationX / TRACK_W));
    setFollowersMax(Math.max(1000, Math.round((domainMax * frac) / 1000) * 1000));
  };

  const addTag = () => {
    const next = TAG_VOCAB.find((t) => !tags.includes(t));
    if (next) setTags([...tags, next]);
  };
  const addPlace = () => {
    const next = placeVocab.find((p) => !places.includes(p));
    if (next) setPlaces([...places, next]);
  };

  return (
    <Screen height={FRAME_H} background={PAGE_BG} scroll>
      {/* ================== roster, live under the scrim =================== */}
      <View pointerEvents="none" style={{ position: "absolute", left: 0, top: 0, width: FRAME_W, height: FRAME_H }}>
        {/* ------------------------- Frame 2147223266 ------------------------ */}
        <Abs x={16} y={22} w={36} h={36} radius={18} bg="#1f1a17" center>
          <Feather name="arrow-left" size={16} color={PAPER} />
        </Abs>
        <Txt
          x={72} y={20} w={192} size={20} weight="medium" font="inter"
          color={INK} lineHeight={24} letterSpacing={-0.6}
        >
          Creators
        </Txt>
        <Txt x={72} y={49} w={192} size={10} weight="medium" font="inter" color={INK_70} lineHeight={10.38}>
          {`Total: ${all.length} Creators`}
        </Txt>

        {/* --------------------------- action row ---------------------------- */}
        <Abs x={16} y={107} w={120.89} h={32} radius={16} bg={INK}>
          <Abs x={16} y={10} w={12} h={12} center>
            <Feather name="plus" size={11} color={PAPER} />
          </Abs>
          <Txt x={34} y={8} w={70.89} size={12} weight="bold" font="inter" color={PAPER} lineHeight={16} align="center">
            Add Creator
          </Txt>
        </Abs>
        <Abs x={144.89} y={106} w={77.5} h={34} radius={17} bg="#ffffff">
          <Abs x={15} y={11} w={12} h={12} center>
            <Ionicons name="options-outline" size={13} color={INK} />
          </Abs>
          <Txt x={33} y={9} w={29.5} size={12} weight="semibold" font="inter" color={INK} lineHeight={16} align="center">
            Filter
          </Txt>
        </Abs>
        <Abs x={230.39} y={106} w={72.34} h={34} radius={17} bg="#ffffff">
          <Abs x={15} y={11} w={12} h={12} center>
            <Ionicons name="swap-vertical" size={12} color={INK} />
          </Abs>
          <Txt x={33} y={9} w={24.34} size={12} weight="semibold" font="inter" color={INK} lineHeight={16} align="center">
            Sort
          </Txt>
        </Abs>

        {/* ----------------------------- search ------------------------------ */}
        <Abs x={16} y={160} w={343} h={46} radius={20} bg="#ffffff">
          <Abs x={17} y={15.5} w={15} h={15} center>
            <Feather name="search" size={14} color={INK_MUTED} />
          </Abs>
          <Txt x={44} y={13} w={282} size={14} font="inter" color={INK_MUTED} lineHeight={20}>
            Search creators, niches...
          </Txt>
        </Abs>

        {/* --------------------------- D / W / M ----------------------------- */}
        <Abs x={16} y={216} w={343} h={42} radius={16} bg="#ffffff">
          {([
            { k: "D", x: 5, on: true },
            { k: "W", x: 116, on: false },
            { k: "M", x: 227, on: false },
          ] as const).map((tab) => (
            <Abs key={tab.k} x={tab.x} y={5} w={111} h={32} radius={12} bg={tab.on ? INK : undefined}>
              <Txt
                x={0} y={8} w={111} size={12} weight={tab.on ? "bold" : "semibold"} font="inter"
                color={tab.on ? PAPER : INK_MUTED} lineHeight={16} align="center"
              >
                {tab.k}
              </Txt>
            </Abs>
          ))}
        </Abs>

        {/* ------------------------- selection bar --------------------------- */}
        <Abs x={16} y={275} w={343} h={42} radius={16} bg={SELECTBAR_BG} border="#f2edff" borderWidth={1}>
          <Abs x={16} y={10} w={20} h={20} radius={10} bg={INK} center>
            <Feather name="check" size={10} color={PAPER} />
          </Abs>
          <Txt x={44} y={12} w={200} size={12} weight="semibold" font="inter" color={INK} lineHeight={16}>
            {`${selectedIds.length} creators selected`}
          </Txt>
          {/* right-anchored count — the spec's text box ends at x=342 */}
          <Txt x={166} y={12.5} w={160} size={10} font="inter" color={INK_MUTED} lineHeight={15} align="right">
            {`${filtered.length} total`}
          </Txt>
        </Abs>

        {/* --------------------------- list header --------------------------- */}
        <Txt
          x={16} y={343} w={200} size={14} weight="bold" font="inter"
          color={INK} lineHeight={20} letterSpacing={-0.35}
        >
          All Creators
        </Txt>
        <Txt x={249.89} y={345} w={109.11} size={12} font="inter" color={INK_MUTED} lineHeight={16} align="right">
          {`${filtered.length} results`}
        </Txt>

        {/* ------------------ card stack, clipped as designed ---------------- */}
        <View
          style={{
            position: "absolute", left: 0, top: LIST_Y,
            width: FRAME_W, height: LIST_H, overflow: "hidden",
          }}
        >
          {filtered.map((c, i) => (
            <CreatorCard key={c.id} c={c} i={i} selected={selectedIds.includes(c.id)} />
          ))}
          {filtered.length === 0 ? (
            <Txt
              x={16} y={CARD_Y0 - LIST_Y + 24} w={343} size={12} font="inter"
              color={INK_MUTED} lineHeight={16} align="center"
            >
              {isLoading ? "Loading creators…" : "No creators match these filters"}
            </Txt>
          ) : null}
        </View>

        {/* ------------------------------ CTA -------------------------------- */}
        <Abs x={24} y={784} w={327} h={54.5} radius={27.25} bg="#312b28">
          <Txt
            x={0} y={15} w={327} size={15} weight="semibold" font="inter"
            color="#ffffff" lineHeight={22.5} align="center"
          >
            Share Selected Creators
          </Txt>
        </Abs>
      </View>

      {/* ================== scrim (Frame 2147223240 fill) ================== */}
      <Pressable
        onPress={() => router.back()}
        style={{ position: "absolute", left: 0, top: 0, width: FRAME_W, height: FRAME_H, backgroundColor: SCRIM }}
      />

      {/* ========================== filter sheet =========================== */}
      <Abs
        x={0} y={SHEET_Y} w={FRAME_W} h={SHEET_H} bg="#ffffff"
        style={{ borderTopLeftRadius: SHEET_RADIUS, borderTopRightRadius: SHEET_RADIUS }}
      />
      <Abs x={167.5} y={211} w={40} h={4} radius={2} bg={HANDLE} />

      <Txt
        x={24} y={239} w={280} size={24} weight="semibold" font="inter"
        color={INK_SHEET_TITLE} lineHeight={29.05} letterSpacing={-0.52}
      >
        {"Filter "}
      </Txt>
      <Pressable
        onPress={() => router.back()}
        style={({ pressed }) => ({
          position: "absolute", left: 315, top: 239, width: 36, height: 36, borderRadius: 18,
          backgroundColor: CLOSE_BG, alignItems: "center", justifyContent: "center",
          opacity: pressed ? 0.7 : 1,
        })}
      >
        <Feather name="x" size={14} color={CLOSE_INK} />
      </Pressable>

      {/* ------------------------------ Niche ------------------------------ */}
      <Section y={301} w={343}>Niche</Section>
      {NICHES.map((n) => {
        const on = niches.includes(n.label);
        return (
          <Pill
            key={n.label}
            x={n.x} y={n.y} w={n.w} on={on}
            onPress={() => setNiches(toggle(niches, n.label))}
          >
            {/* absolute children sit inside the 1.5pt stroke — offset by it */}
            <Txt
              x={0} y={n.ty - n.y - 1.5} w={n.w - 3} size={n.size}
              weight={on ? "medium" : "regular"} font="inter" color={INK_CHIP}
              lineHeight={n.lh} align="center"
            >
              {n.label}
            </Txt>
          </Pill>
        );
      })}

      {/* -------------------------- Follower Range -------------------------- */}
      <Section y={507} w={339}>Follower Range</Section>
      <Txt x={16} y={535} w={339} size={10} weight="medium" font="inter" color={INK_70} lineHeight={17} align="right">
        {`0 - ${Math.round(followersMax / 1000)}`}
      </Txt>
      <Pressable
        onPress={onTrack}
        style={{ position: "absolute", left: TRACK_X, top: 550, width: TRACK_W, height: THUMB }}
      >
        <Abs x={0} y={7} w={TRACK_W} h={9} radius={9999} bg={TRACK_BG} />
        <Abs x={0} y={7} w={fillW} h={9} radius={9999} bg={TRACK_FILL} />
      </Pressable>
      {/* ion:radio-button-on-outline flattened to a solid #000 fill in the frame */}
      <Abs x={TRACK_X + fillW - THUMB / 2} y={TRACK_Y - 7} w={THUMB} h={THUMB} center>
        <Abs
          w={17.39} h={17.39} radius={8.7} bg="#000000"
          style={{
            position: "relative",
            shadowColor: "#000000", shadowOpacity: 0.2, shadowRadius: 3,
            shadowOffset: { width: 2, height: 2 }, elevation: 3,
          }}
        />
      </Abs>

      {/* ------------------------------ By Tag ------------------------------ */}
      {/* Sheet state only: Creator has no tags column, so tags do not filter. */}
      <Section y={578} w={320}>By Tag</Section>
      <Pressable
        onPress={addTag}
        style={({ pressed }) => ({
          position: "absolute", left: 16, top: 606, width: 91, height: 34, borderRadius: 20,
          backgroundColor: BUTTON_BG, borderWidth: 1.5, borderColor: "#000000",
          opacity: pressed ? 0.7 : 1,
        })}
      >
        <Abs x={7.5} y={5.5} w={20} h={20} center>
          <Feather name="plus-circle" size={17} color="#1c1b1b" />
        </Abs>
        <Txt x={27.5} y={3.5} w={54} size={12} weight="medium" font="inter" color="#000000" lineHeight={24} align="center">
          Add Tag
        </Txt>
      </Pressable>
      <Abs x={115} y={606} h={34} row gap={8}>
        {tags.map((t) => (
          <Pressable
            key={t}
            onPress={() => setTags(tags.filter((k) => k !== t))}
            style={({ pressed }) => ({
              height: 34, borderRadius: 20, paddingHorizontal: 16, borderWidth: 1.5,
              borderColor: TAG_ON, alignItems: "center", justifyContent: "center",
              opacity: pressed ? 0.7 : 1,
            })}
          >
            <Txt size={12} weight="medium" font="inter" color="#000000" lineHeight={18} align="center">
              {t}
            </Txt>
          </Pressable>
        ))}
      </Abs>

      {/* ------------------------------ By Age ------------------------------ */}
      {/* Read-only: Creator carries no age or date-of-birth column to bind to. */}
      <Section y={652} w={343}>By Age</Section>
      <Abs x={16} y={680} w={343} h={34} radius={24} bg={FIELD_BG} border={FIELD_LINE} borderWidth={1}>
        <Txt x={11} y={8} w={69} size={12} font="inter" color={FIELD_INK} lineHeight={16}>
          19 - 25
        </Txt>
        <Abs x={314} y={6} w={20} h={20} center>
          <Ionicons name="chevron-expand" size={14} color={FIELD_INK} />
        </Abs>
      </Abs>

      {/* ------------------------------ Gender ------------------------------ */}
      <Section y={726} w={320}>Gender</Section>
      {GENDERS.map((g) => {
        const on = genders.includes(g.label);
        return (
          <Pressable
            key={g.label}
            onPress={() => setGenders(toggle(genders, g.label))}
            style={({ pressed }) => ({
              position: "absolute", left: g.box, top: 754,
              width: g.tx - g.box + g.tw, height: 16, opacity: pressed ? 0.7 : 1,
            })}
          >
            <CheckBox on={on} />
            <Txt
              x={g.tx - g.box} y={0} w={g.tw} size={12} weight={on ? "medium" : "regular"}
              font="inter" color={on ? "#000000" : INK_70} lineHeight={16}
            >
              {g.label}
            </Txt>
          </Pressable>
        );
      })}

      {/* ----------------------------- Location ----------------------------- */}
      <Txt x={16} y={783} w={99} size={13} weight="medium" font="inter" color="#040404" lineHeight={22}>
        Location
      </Txt>
      <Pressable
        onPress={addPlace}
        style={({ pressed }) => ({
          position: "absolute", left: 16, top: 810.5, width: 121, height: 34, borderRadius: 20,
          backgroundColor: BUTTON_BG, borderWidth: 1, borderColor: "#000000",
          opacity: pressed ? 0.7 : 1,
        })}
      >
        {/* iconamoon:location-light — a navigation-arrow glyph, not a map pin */}
        <Abs x={10} y={6} w={20} h={20} center>
          <Feather name="navigation" size={14} color="#000000" />
        </Abs>
        <Txt
          x={26.5} y={4} w={80} size={12} weight="medium" font="inter"
          color="#000000" lineHeight={24} align="center" numberOfLines={1}
        >
          Add location
        </Txt>
      </Pressable>
      <Abs x={145} y={810.5} h={34} row gap={8}>
        {places.map((p) => (
          <Pressable
            key={p}
            onPress={() => setPlaces(places.filter((k) => k !== p))}
            style={({ pressed }) => ({
              height: 34, borderRadius: 20, paddingHorizontal: 12, backgroundColor: TAG_CHIP_BG,
              borderWidth: 1, borderColor: "#000000", flexDirection: "row", alignItems: "center",
              gap: 8, opacity: pressed ? 0.7 : 1,
            })}
          >
            <Txt size={12} font="inter" color={INK_70} lineHeight={24} align="center">
              {p}
            </Txt>
            <Feather name="x" size={11} color="#000000" />
          </Pressable>
        ))}
      </Abs>
    </Screen>
  );
}
