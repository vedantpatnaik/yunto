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
 * Creators — Filter — Figma frame 7786:21143 (375x876), traced 1:1.
 *
 * The Creators list with the filter bottom sheet open on top: a full-bleed
 * #b5b4b9 @57% scrim (0,0 375x876) and a white sheet anchored to the bottom
 * (0,195 375x681, 32/32/0/0) carrying the drag handle, the "Filter" header row
 * and six facet sections. There is no Apply/Reset in this frame — selections
 * commit live, so every toggle re-runs the query filter and the counts behind
 * the scrim ("Total: N Creators", "N results", "N total") move with it. The
 * close button dismisses back to the list.
 *
 * The list underneath is rendered (and clipped) at its design coordinates so
 * the scrim has the same thing to sit on that the frame draws; it is
 * pointer-inert while the sheet is up, which is what "keeps scroll position"
 * means here.
 *
 * Two facets have no Prisma backing and are therefore presentational only,
 * flagged at their sections below: By Tag (no Creator tag field — the chips are
 * sheet state and do not narrow the result set) and By Age (Creator has no
 * date-of-birth/age column, so the "19 - 25" pill is the spec's static value).
 *
 * The frame's Geist text nodes render in Inter — Geist is not one of the two
 * faces registered in app/_layout.tsx, and Inter is the dominant face here.
 *
 * Coordinates below are raw frame coordinates; <Screen> scales the 375pt canvas.
 */

/* -------------------------------- geometry -------------------------------- */
const FRAME_W = 375;
const FRAME_H = 876;

const SHEET_Y = 195;
const SHEET_H = 681;

/** Underlying card stack: first card at y=379, 211.5 tall, 16pt gutter. */
const CARD_X = 16;
const CARD_W = 343;
const CARD_H = 211.5;
const CARD_Y0 = 379;
const CARD_STEP = 227.5;
/** Cards 4+ start at y=1061.5 — outside the 876 frame, so three are drawn. */
const CARDS_VISIBLE = 3;

/** Follower slider track (16,557 339x9) with the traced 47pt filled segment. */
const TRACK_X = 16;
const TRACK_Y = 557;
const TRACK_W = 339;
const TRACK_FILL_TRACED = 47;
const THUMB = 25;

/* ------------------------------ spec colours ------------------------------ */
const PAGE_BG = "#f8f5ef";
const SCRIM = "rgba(181,180,185,0.57)";
const INK = "#141311";
const INK_TITLE = "#111111";
const INK_MUTED = "#8c8a84";
const INK_CHIP = "#212121";
const INK_70 = "rgba(0,0,0,0.7)";
const CHIP_ON = "rgba(0,0,0,0.9)";
const CHIP_OFF = "#e4e9ef";
const TAG_ON = "#5683f5";
const CLOSE_BG = "#f8f8f8";
const CLOSE_INK = "#555555";
const TRACK_BG = "#d2d0d0";
const TRACK_INK = "#2e2e2e";
const FIELD_BG = "#fafafa";
const FIELD_LINE = "#f0eff1";
const FIELD_INK = "#7f7f7f";
const BUTTON_BG = "#fefcff";
const GLASS_80 = "rgba(255,255,255,0.8)";
const GLASS_70 = "rgba(255,255,255,0.7)";
const PERF_INK = "#23c16b";
const DIVIDER = "rgba(20,19,17,0.06)";

/** Card tints cycle through the four variants the frame draws. */
const CARD_TINTS = [
  { from: "#f2edffcc", strip: "#f2edff66" },
  { from: "#ffecf3cc", strip: "#ffecf366" },
  { from: "#e8f3ffcc", strip: "#e8f3ff66" },
  { from: "#e9f6edcc", strip: "#e9f6ed66" },
] as const;
const CARD_TO = "#ffffff80";
const CARD_GRAD_START = { x: 0.23, y: -0.23 };
const CARD_GRAD_END = { x: 0.77, y: 1.23 };

/* ------------------------------ facet taxonomy ---------------------------- */
/**
 * The eight niche chips, at their wrapped positions. Widths, text sizes and
 * baselines are per-chip because the design sizes each pill to its label.
 */
const NICHES = [
  { label: "Travel", x: 16, y: 329, w: 90.21, size: 13, lh: 15.73, ty: 338 },
  { label: "Artists & Films", x: 119.1, y: 329, w: 123.92, size: 12, lh: 14.52, ty: 338 },
  { label: "Finance", x: 250.94, y: 329, w: 108.06, size: 12, lh: 14.52, ty: 337 },
  { label: "Fashion & lifestyle", x: 16, y: 373, w: 144, size: 12, lh: 14.52, ty: 382 },
  { label: "Health & Fitness", x: 165.69, y: 373, w: 126.89, size: 12, lh: 14.52, ty: 382 },
  { label: "beauty & wellness", x: 16, y: 417, w: 159.61, size: 12, lh: 14.52, ty: 425 },
  { label: "Crafts & DIY", x: 16, y: 461, w: 121.93, size: 12, lh: 14.52, ty: 471 },
  { label: "other ", x: 155.94, y: 461, w: 119.95, size: 12, lh: 14.52, ty: 470 },
] as const;

/** The frame draws Travel and Fashion & lifestyle with the near-black stroke. */
const NICHES_ON = ["Travel", "Fashion & lifestyle"];

/** Gender rows, at the x steps the spec lays out (16 / 94 / 155). */
const GENDERS = [
  { label: "Female", box: 16, tx: 34, tw: 42 },
  { label: "Male", box: 94, tx: 112, tw: 28 },
  { label: "Others", box: 155, tx: 173, tw: 39 },
] as const;

/** Agency-defined tag vocabulary — the frame ships exactly one. */
const TAG_VOCAB = ["Couple"];

/** Words a niche chip claims from Creator.niche ("DIY" is too short to match). */
const tokensOf = (label: string) =>
  label.toLowerCase().split(/[^a-z]+/).filter((t) => t.length >= 4);

/** "other" is the residue: a niche no other chip claims. */
function matchesNiche(label: string, niche: string): boolean {
  if (label.trim() === "other") {
    return !NICHES.some(
      (n) => n.label.trim() !== "other" && tokensOf(n.label).some((t) => niche.includes(t)),
    );
  }
  return tokensOf(label).some((t) => niche.includes(t));
}

/**
 * The card's status pill. Creator has no such column, so the design's own four
 * labels are picked from the numbers that do exist rather than invented.
 */
function statusOf(c: Creator): string {
  if (c.stars >= 4.7) return "Top Performer";
  if (c.engagementRate >= 5) return "Rising Fast";
  if ((c.leadsCount ?? 0) >= 300) return "High Priority";
  return "Niche Fit";
}

const platformIcon = (p?: string): "youtube" | "music" | "instagram" =>
  p === "YOUTUBE" ? "youtube" : p === "TIKTOK" ? "music" : "instagram";

/* -------------------------------- primitives ------------------------------ */
/** A 34pt outline pill — every chip in this sheet is one. */
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
        position: "absolute", left: x, top: y, width: w, height: 34, borderRadius: 20,
        borderWidth: 1.5, borderColor: on ? CHIP_ON : CHIP_OFF,
        opacity: pressed ? 0.7 : 1,
      })}
    >
      {children}
    </Pressable>
  );
}

/** Section heading — Niche / Follower Range / By Tag / By Age / Gender. */
const Label = ({ y, w, children }: { y: number; w: number; children: string }) => (
  <Txt x={16} y={y} w={w} size={12} weight="medium" font="inter" color="#000000" lineHeight={24}>
    {children}
  </Txt>
);

/** 12x12 outline checkbox inside its 16x16 icon box. */
const CheckBox = ({ x, y, on }: { x: number; y: number; on: boolean }) => (
  <Abs x={x + 2} y={y + 2} w={12} h={12} radius={3} border="#000000" borderWidth={1} center>
    {on ? <Feather name="check" size={9} color="#000000" /> : null}
  </Abs>
);

/* --------------------------- underlying list card -------------------------- */
function CreatorCard({ c, i, selected }: { c: Creator; i: number; selected: boolean }) {
  const y = CARD_Y0 + i * CARD_STEP;
  const tint = CARD_TINTS[i % CARD_TINTS.length];
  const stats: { label: string; value: string }[] = [
    { label: "FOLLOWERS", value: compact(c.followers).toUpperCase() },
    { label: "VIEWS", value: compact(c.avgViews).toUpperCase() },
    { label: "LEADS", value: `${c.leadsCount ?? 0}` },
  ];

  return (
    <View>
      <LinearGradient
        colors={[tint.from, CARD_TO]}
        start={CARD_GRAD_START}
        end={CARD_GRAD_END}
        style={{
          position: "absolute", left: CARD_X, top: y, width: CARD_W, height: CARD_H,
          borderRadius: 26,
        }}
      />

      {/* avatar + platform badge */}
      {c.avatarUrl ? (
        <Image
          source={{ uri: c.avatarUrl }}
          style={{ position: "absolute", left: 32, top: y + 24, width: 48, height: 48, borderRadius: 24 }}
        />
      ) : (
        <Ring x={32} y={y + 24} size={48} />
      )}
      <Abs x={66} y={y + 58} w={16} h={16} radius={8} bg="#ffffff" center>
        <Feather name={platformIcon(c.platform)} size={8} color={INK} />
      </Abs>

      {/* name / handle + niche / status */}
      <Txt
        x={92} y={y + 16} w={128.44} size={14} weight="bold" font="inter"
        color={INK} lineHeight={17.5} letterSpacing={-0.35} numberOfLines={1}
      >
        {c.name}
      </Txt>
      <Abs x={92} y={y + 36} h={20} row gap={6}>
        <Txt size={10} font="inter" color={INK_MUTED} lineHeight={15}>
          {c.handle}
        </Txt>
        {c.niche ? (
          <View
            style={{
              height: 20, borderRadius: 10, paddingHorizontal: 7,
              backgroundColor: GLASS_80, alignItems: "center", justifyContent: "center",
            }}
          >
            <Txt size={9} weight="bold" font="inter" color={INK_MUTED} lineHeight={13.5}>
              {c.niche}
            </Txt>
          </View>
        ) : null}
      </Abs>
      <Abs
        x={92} y={y + 60} h={20} radius={10} bg={GLASS_70} row gap={4}
        style={{ paddingHorizontal: 9 }}
      >
        <Feather name="star" size={8} color={INK} />
        <Txt size={9} weight="bold" font="inter" color={INK} lineHeight={13.5}>
          {statusOf(c)}
        </Txt>
      </Abs>

      {/* select toggle — filled when the creator is in the selection */}
      {selected ? (
        <Abs x={319} y={y + 18} w={24} h={24} radius={12} bg={INK} center>
          <Feather name="check" size={11} color="#faf7f2" />
        </Abs>
      ) : (
        <Abs x={318} y={y + 17} w={26} h={26} radius={13} bg={GLASS_80} />
      )}

      {/* stat strip */}
      <Abs x={32} y={y + 94} w={311} h={53.5} radius={16} bg={tint.strip} />
      {stats.map((s, k) => (
        <View key={s.label}>
          <Txt
            x={42 + k * 73} y={y + 104} w={72} size={9} font="inter" color={INK_MUTED}
            lineHeight={13.5} letterSpacing={0.45} align="center"
          >
            {s.label}
          </Txt>
          <Txt
            x={42 + k * 73} y={y + 117.5} w={72} size={14} weight="bold" font="inter"
            color={INK} lineHeight={20} align="center"
          >
            {s.value}
          </Txt>
        </View>
      ))}
      {[114, 187, 260].map((dx) => (
        <Abs key={dx} x={dx} y={y + 108.75} w={1} h={24} bg={DIVIDER} />
      ))}
      <Txt
        x={261} y={y + 106} w={72} size={9} font="inter" color={INK_MUTED}
        lineHeight={13.5} letterSpacing={0.45} align="center"
      >
        PERF.
      </Txt>
      <Txt
        x={261} y={y + 119.5} w={72} size={12} weight="bold" font="inter"
        color={PERF_INK} lineHeight={16} align="center"
      >
        {`+${c.engagementRate.toFixed(1)}%`}
      </Txt>

      {/* row actions */}
      {([
        { label: "Profile", x: 32, icon: "user" },
        { label: "Call", x: 138.33, icon: "phone" },
        { label: "Chat", x: 244.67, icon: "message-circle" },
      ] as const).map((b) => (
        <Abs
          key={b.label}
          x={b.x} y={y + 164.5} w={98.33} h={31} radius={12} bg={GLASS_80}
          row center gap={6}
        >
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
export default function CreatorsFilterSheetScreen() {
  const router = useRouter();
  const { data: creators } = useCreators();
  const all = useMemo<Creator[]>(() => creators ?? [], [creators]);

  /* facet state — the frame's own selections are the initial value */
  const [niches, setNiches] = useState<string[]>(NICHES_ON);
  const [followerMax, setFollowerMax] = useState(500_000); // "0 - 500" (thousands)
  const [tags, setTags] = useState<string[]>(["Couple"]);
  const [genders, setGenders] = useState<string[]>(["Female"]);
  const [places, setPlaces] = useState<string[]>(["Delhi"]);

  const toggle = (list: string[], v: string) =>
    list.includes(v) ? list.filter((k) => k !== v) : [...list, v];

  /** Slider domain: the widest audience the roster actually has. */
  const domainMax = useMemo(
    () => all.reduce((m, c) => Math.max(m, c.followers), 0),
    [all],
  );

  /** Location vocabulary comes from the roster, so "Add location" is real. */
  const placeVocab = useMemo(() => {
    const seen: string[] = [];
    for (const c of all) if (c.location && !seen.includes(c.location)) seen.push(c.location);
    return seen.sort();
  }, [all]);

  /** OR within a facet, AND across facets. Tags and age carry no Creator field. */
  const filtered = useMemo(
    () =>
      all.filter((c) => {
        if (niches.length && !niches.some((n) => matchesNiche(n, (c.niche ?? "").toLowerCase())))
          return false;
        if (c.followers > followerMax) return false;
        if (genders.length && !genders.some((g) => g.toLowerCase() === (c.gender ?? "").toLowerCase()))
          return false;
        if (places.length && !places.includes(c.location ?? "")) return false;
        return true;
      }),
    [all, niches, followerMax, genders, places],
  );

  /**
   * Selection carried in from the list. The frame marks the 1st and 4th card
   * with the filled check button and reads "2 creators selected".
   */
  const selectedIds = useMemo(
    () => [filtered[0]?.id, filtered[3]?.id].filter((id): id is string => !!id),
    [filtered],
  );

  const fillW =
    domainMax > 0
      ? Math.max(0, Math.min(TRACK_W, (TRACK_W * followerMax) / domainMax))
      : TRACK_FILL_TRACED;

  const onTrack = (e: GestureResponderEvent) => {
    if (domainMax <= 0) return;
    const frac = Math.max(0, Math.min(1, e.nativeEvent.locationX / TRACK_W));
    setFollowerMax(Math.max(1000, Math.round((domainMax * frac) / 1000) * 1000));
  };

  const addPlace = () => {
    const next = placeVocab.find((p) => !places.includes(p));
    if (next) setPlaces([...places, next]);
  };
  const addTag = () => {
    const next = TAG_VOCAB.find((t) => !tags.includes(t));
    if (next) setTags([...tags, next]);
  };

  return (
    <Screen height={FRAME_H} background={PAGE_BG} scroll>
      {/* =================== Creators list, under the scrim =================== */}
      <View
        pointerEvents="none"
        style={{
          position: "absolute", left: 0, top: 0,
          width: FRAME_W, height: FRAME_H, overflow: "hidden",
        }}
      >
        {/* ------------------------------ header ----------------------------- */}
        <Abs x={16} y={22} w={36} h={36} radius={18} bg="#1f1a17" center>
          <Ionicons name="chevron-back" size={16} color="#faf7f2" />
        </Abs>
        <Txt
          x={72} y={20} w={192} size={20} weight="medium" font="inter"
          color={INK} lineHeight={24} letterSpacing={-0.6}
        >
          Creators
        </Txt>
        <Txt
          x={72} y={49} w={192} size={10} weight="medium" font="inter"
          color={INK_70} lineHeight={10.38}
        >
          {`Total: ${all.length} Creators`}
        </Txt>

        {/* --------------------------- action row ---------------------------- */}
        <Abs x={16} y={107} w={120.89} h={32} radius={16} bg={INK}>
          <Abs x={16} y={10} w={12} h={12} center>
            <Feather name="plus" size={12} color="#faf7f2" />
          </Abs>
          <Txt
            x={34} y={8} w={70.89} size={12} weight="bold" font="inter"
            color="#faf7f2" lineHeight={16} align="center"
          >
            Add Creator
          </Txt>
        </Abs>
        <Abs x={144.89} y={106} w={77.5} h={34} radius={17} bg="#ffffff">
          <Abs x={15} y={11} w={12} h={12} center>
            <Feather name="filter" size={11} color={INK} />
          </Abs>
          <Txt
            x={33} y={9} w={29.5} size={12} weight="semibold" font="inter"
            color={INK} lineHeight={16} align="center"
          >
            Filter
          </Txt>
        </Abs>
        <Abs x={230.39} y={106} w={72.34} h={34} radius={17} bg="#ffffff">
          <Abs x={15} y={11} w={12} h={12} center>
            <Feather name="sliders" size={11} color={INK} />
          </Abs>
          <Txt
            x={33} y={9} w={24.34} size={12} weight="semibold" font="inter"
            color={INK} lineHeight={16} align="center"
          >
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

        {/* ---------------------------- D/W/M tabs --------------------------- */}
        <Abs x={16} y={216} w={343} h={42} radius={16} bg="#ffffff">
          {([
            { k: "D", x: 5, on: true },
            { k: "W", x: 116, on: false },
            { k: "M", x: 227, on: false },
          ] as const).map((t) => (
            <Abs key={t.k} x={t.x} y={5} w={111} h={32} radius={12} bg={t.on ? INK : undefined}>
              <Txt
                x={0} y={8} w={111} size={12} weight={t.on ? "bold" : "semibold"} font="inter"
                color={t.on ? "#faf7f2" : INK_MUTED} lineHeight={16} align="center"
              >
                {t.k}
              </Txt>
            </Abs>
          ))}
        </Abs>

        {/* -------------------------- selection bar -------------------------- */}
        <Abs x={16} y={275} w={343} h={42} radius={16} bg="rgba(242,237,255,0.5)">
          <Abs x={17} y={11} w={20} h={20} radius={10} bg={INK} center>
            <Feather name="check" size={10} color="#ffffff" />
          </Abs>
          <Txt x={45} y={13} w={200} size={12} weight="semibold" font="inter" color={INK} lineHeight={16}>
            {`${selectedIds.length} creators selected`}
          </Txt>
          {/* right-anchored count: the spec's text box ends at x=342 */}
          <Txt
            x={166.19} y={13.5} w={160} size={10} font="inter" color={INK_MUTED}
            lineHeight={15} align="right"
          >
            {`${filtered.length} total`}
          </Txt>
        </Abs>

        {/* ---------------------------- list header -------------------------- */}
        <Txt
          x={16} y={343} w={200} size={14} weight="bold" font="inter"
          color={INK} lineHeight={20} letterSpacing={-0.35}
        >
          All Creators
        </Txt>
        <Txt
          x={249.89} y={345} w={109.11} size={12} font="inter" color={INK_MUTED}
          lineHeight={16} align="right"
        >
          {`${filtered.length} results`}
        </Txt>

        {/* ------------------------------ cards ------------------------------ */}
        {filtered.slice(0, CARDS_VISIBLE).map((c, i) => (
          <CreatorCard key={c.id} c={c} i={i} selected={selectedIds.includes(c.id)} />
        ))}
        {filtered.length === 0 ? (
          <Txt
            x={16} y={CARD_Y0 + 24} w={343} size={12} font="inter"
            color={INK_MUTED} lineHeight={16} align="center"
          >
            No creators match these filters
          </Txt>
        ) : null}

        {/* ------------------------------- CTA ------------------------------- */}
        <Abs x={24} y={784} w={327} h={54.5} radius={27.25} bg="#312b28">
          <Txt
            x={0} y={15} w={327} size={15} weight="semibold" font="inter"
            color="#ffffff" lineHeight={22.5} align="center"
          >
            Share Selected Creators
          </Txt>
        </Abs>
      </View>

      {/* ================================ scrim =============================== */}
      <Pressable
        onPress={() => router.back()}
        style={{
          position: "absolute", left: 0, top: 0,
          width: FRAME_W, height: FRAME_H, backgroundColor: SCRIM,
        }}
      />

      {/* ============================ filter sheet ============================ */}
      <Abs
        x={0} y={SHEET_Y} w={FRAME_W} h={SHEET_H} bg="#ffffff"
        style={{ borderTopLeftRadius: 32, borderTopRightRadius: 32 }}
      />

      {/* drag handle */}
      <Abs x={167.5} y={211} w={40} h={4} radius={2} bg="#e5e5e5" />

      {/* header row */}
      <Txt
        x={24} y={239} w={280} size={24} weight="semibold" font="inter"
        color={INK_TITLE} lineHeight={29.05} letterSpacing={-0.52}
      >
        {"Filter "}
      </Txt>
      <Pressable
        onPress={() => router.back()}
        style={({ pressed }) => ({
          position: "absolute", left: 315, top: 239, width: 36, height: 36,
          borderRadius: 18, backgroundColor: CLOSE_BG,
          alignItems: "center", justifyContent: "center", opacity: pressed ? 0.7 : 1,
        })}
      >
        <Feather name="x" size={14} color={CLOSE_INK} />
      </Pressable>

      {/* ------------------------------- Niche ------------------------------- */}
      <Label y={301} w={343}>Niche</Label>
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
              weight={on ? "medium" : "regular"}
              font="inter" color={INK_CHIP} lineHeight={n.lh} align="center"
            >
              {n.label}
            </Txt>
          </Pill>
        );
      })}

      {/* --------------------------- Follower Range -------------------------- */}
      <Label y={507} w={339}>Follower Range</Label>
      <Txt
        x={16} y={535} w={339} size={10} weight="medium" font="inter"
        color={INK_70} lineHeight={17} align="right"
      >
        {`0 - ${Math.round(followerMax / 1000)}`}
      </Txt>
      <Pressable
        onPress={onTrack}
        style={{ position: "absolute", left: TRACK_X, top: 550, width: TRACK_W, height: THUMB }}
      >
        <Abs x={0} y={7} w={TRACK_W} h={9} radius={9999} bg={TRACK_BG} />
        <Abs x={0} y={7} w={fillW} h={9} radius={9999} bg={TRACK_INK} />
      </Pressable>
      {/* ion:radio-button-on-outline thumb, centred on the filled edge */}
      <Abs x={TRACK_X + fillW - THUMB / 2} y={TRACK_Y - 7} w={THUMB} h={THUMB} center>
        <Abs
          w={17.39} h={17.39} radius={8.7} bg="#ffffff" border="#000000" borderWidth={2} center
          style={{
            position: "relative",
            shadowColor: "#000000", shadowOpacity: 0.2, shadowRadius: 3,
            shadowOffset: { width: 2, height: 2 }, elevation: 3,
          }}
        >
          <Abs w={7} h={7} radius={3.5} bg="#000000" style={{ position: "relative" }} />
        </Abs>
      </Abs>

      {/* ------------------------------- By Tag ------------------------------ */}
      {/* Presentational: Creator has no tag column, so these do not filter. */}
      <Label y={578} w={320}>By Tag</Label>
      <Pressable
        onPress={addTag}
        style={({ pressed }) => ({
          position: "absolute", left: 16, top: 606, width: 91, height: 34,
          borderRadius: 20, backgroundColor: BUTTON_BG, borderWidth: 1.5, borderColor: "#000000",
          flexDirection: "row", alignItems: "center", opacity: pressed ? 0.7 : 1,
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
              height: 34, borderRadius: 20, paddingHorizontal: 16,
              borderWidth: 1.5, borderColor: TAG_ON,
              alignItems: "center", justifyContent: "center", opacity: pressed ? 0.7 : 1,
            })}
          >
            <Txt size={12} weight="medium" font="inter" color="#000000" lineHeight={18} align="center">
              {t}
            </Txt>
          </Pressable>
        ))}
      </Abs>

      {/* ------------------------------- By Age ------------------------------ */}
      {/* Presentational: Creator carries no age/date-of-birth column. */}
      <Label y={652} w={343}>By Age</Label>
      <Abs
        x={16} y={680} w={343} h={34} radius={24} bg={FIELD_BG}
        border={FIELD_LINE} borderWidth={1}
      >
        <Txt x={11} y={8} w={69} size={12} font="inter" color={FIELD_INK} lineHeight={16}>
          19 - 25
        </Txt>
        <Abs x={314} y={6} w={20} h={20} center>
          <Feather name="chevron-down" size={14} color={FIELD_INK} />
        </Abs>
      </Abs>

      {/* ------------------------------- Gender ------------------------------ */}
      <Label y={726} w={320}>Gender</Label>
      {GENDERS.map((g) => {
        const on = genders.includes(g.label);
        return (
          <Pressable
            key={g.label}
            onPress={() => setGenders(toggle(genders, g.label))}
            style={({ pressed }) => ({
              position: "absolute", left: g.box, top: 754,
              width: g.tx - g.box + g.tw, height: 16,
              opacity: pressed ? 0.7 : 1,
            })}
          >
            <CheckBox x={0} y={0} on={on} />
            <Txt
              x={g.tx - g.box} y={0} w={g.tw} size={12} weight={on ? "medium" : "regular"}
              font="inter" color={on ? "#000000" : INK_70} lineHeight={16}
            >
              {g.label}
            </Txt>
          </Pressable>
        );
      })}

      {/* ------------------------------ Location ----------------------------- */}
      <Txt x={16} y={783} w={99} size={13} weight="medium" font="inter" color="#040404" lineHeight={22}>
        Location
      </Txt>
      <Pressable
        onPress={addPlace}
        style={({ pressed }) => ({
          position: "absolute", left: 16, top: 810.5, width: 121, height: 34,
          borderRadius: 20, backgroundColor: BUTTON_BG, borderWidth: 1, borderColor: "#000000",
          flexDirection: "row", alignItems: "center", opacity: pressed ? 0.7 : 1,
        })}
      >
        <Abs x={10} y={6} w={20} h={20} center>
          <Feather name="map-pin" size={14} color="#000000" />
        </Abs>
        <Txt x={30} y={4} w={71} size={12} weight="medium" font="inter" color="#000000" lineHeight={24} align="center">
          Add location
        </Txt>
      </Pressable>
      <Abs x={145} y={810.5} h={34} row gap={8}>
        {places.map((p) => (
          <Pressable
            key={p}
            onPress={() => setPlaces(places.filter((k) => k !== p))}
            style={({ pressed }) => ({
              height: 34, borderRadius: 20, paddingHorizontal: 8, backgroundColor: "#f5f5f5",
              borderWidth: 1, borderColor: "#000000",
              flexDirection: "row", alignItems: "center", gap: 2, opacity: pressed ? 0.7 : 1,
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
