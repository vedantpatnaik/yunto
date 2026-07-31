import { Fragment, useMemo, useState } from "react";
import { Image, Pressable, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Abs, Ring, Screen, Txt } from "../../../src/ui/Frame";
import { compact, useCreators, type Creator } from "../../../src/api/hooks";

/**
 * Creators — All Creators tab. Figma 7882:13945 (375x876), traced 1:1.
 *
 * Same chrome as the roster screen (header, Add Creator / Filter / Sort row,
 * search field, two-up tab switch, selection banner, Share CTA), with the
 * marketplace tab selected: the dark pill sits on "All Creators".
 *
 * The card here is the discovery variant, and it is genuinely a different card
 * rather than a different screen. It drops the AI insight chip that the My
 * Creators card carries under the handle, so the body closes up: the stat strip
 * moves from card-relative 94 to 78 and the Profile / Call / Chat row from
 * 164.5 to 148.5, taking the card from 211.5 to 195.5 and the stack step from
 * 227.5 to 211.5. Everything else — 48pt avatar with its platform badge, name,
 * handle, niche chip, the FOLLOWERS / VIEWS / LEADS / PERF. strip and the three
 * actions — is shared with the roster card.
 *
 * One quirk is reproduced verbatim: the design's first card is drawn 16pt
 * taller than the three below it because it kept the 64pt header container from
 * the roster variant (the insight chip is gone, so the name and handle sit
 * centred in it, 8pt lower). That is FIRST_GROW — without it every card after
 * the first would land 16pt above its spec y.
 *
 * Data — the tab switch is local state, exactly as the design's two frames
 * differ only by which pool is drawn:
 *   All Creators = creators with listed = true — the marketplace pool
 *   My Creators  = creators with an agencyId — the managed roster
 * Neither User nor Agency carries the other's id (User has agencyCode, Agency
 * has no code), so "agencyId != me" cannot be evaluated on this client; the
 * public listing flag is the honest stand-in, and it is the same derivation
 * Assign Creators uses for its assigned/unassigned split.
 *
 * expo-blur is not a dependency, so the strip's OverlayBlur renders as its
 * translucent fill alone. Header type is Geist in the file; only Outfit and
 * Inter are loaded, so it renders in Inter.
 *
 * Coordinates are raw frame coordinates; <Screen> scales the 375pt canvas.
 */

/* ------------------------------- geometry -------------------------------- */
const FRAME_H = 876;

/** Card stack: 16,379 343 wide, 195.5 tall, on a 211.5 step (195.5 + 16 gap). */
const CARD_X = 16;
const CARD_W = 343;
const CARD_H = 195.5;
const CARD_FIRST_Y = 379;
const CARD_STEP = 211.5;
/** The first card's leftover 64pt header container — see the note above. */
const FIRST_GROW = 16;

const topOf = (i: number) => CARD_FIRST_Y + (i === 0 ? 0 : FIRST_GROW + i * CARD_STEP);
/** Cards whose top clears the 876pt frame — the rest are cropped away. */
const MAX_CARDS = Math.ceil((FRAME_H - CARD_FIRST_Y - FIRST_GROW) / CARD_STEP);

/* --------------------------- spec colour tokens --------------------------- */
const PAGE = "#f8f5ef";
const INK = "#141311";
const INK_INVERT = "#faf7f2";
const INK_MUTED = "#8c8a84";
const WHITE = "#ffffff";
const GLASS_80 = "rgba(255,255,255,0.8)";
const DIVIDER = "rgba(20,19,17,0.06)";
const PERF_INK = "#23c16b";
const CTA = "#312b28";
const BANNER = "rgba(242,237,255,0.5)";

/** Per-card tints: card gradient stop 0 and the stat-strip wash at 40%. */
const CARD_TINTS: { grad: readonly [string, string]; strip: string }[] = [
  { grad: ["#f2edffcc", "#ffffff80"], strip: "#f2edff66" },
  { grad: ["#ffecf3cc", "#ffffff80"], strip: "#ffecf366" },
  { grad: ["#e8f3ffcc", "#ffffff80"], strip: "#e8f3ff66" },
  { grad: ["#e9f6edcc", "#ffffff80"], strip: "#e9f6ed66" },
];

/* ------------------------------ derivations ------------------------------- */
/** "1.2M" / "840K" — the design's casing for the compact formatter. */
const big = (n: number) => compact(n).toUpperCase();

type Tab = "my" | "all";

/* -------------------------------- the card -------------------------------- */
/** The three per-card action buttons: 98.33x31 chips on a 106.33 step. */
const ACTIONS = [
  { x: 32, label: "Profile" },
  { x: 138.33, label: "Call" },
  { x: 244.67, label: "Chat" },
] as const;

/** Stat columns 1..3; PERF. sits 2pt lower and is drawn separately. */
const STATS = [
  { x: 42, label: "FOLLOWERS" },
  { x: 115, label: "VIEWS" },
  { x: 188, label: "LEADS" },
] as const;

function CreatorCard({
  creator,
  index,
  selected,
  onToggle,
}: {
  creator: Creator;
  index: number;
  selected: boolean;
  onToggle: () => void;
}) {
  const top = topOf(index);
  /** Extra height the first card carries; its header centres in it (+g/2). */
  const g = index === 0 ? FIRST_GROW : 0;
  const tint = CARD_TINTS[index % CARD_TINTS.length];
  const stats = [big(creator.followers), big(creator.avgViews), `${creator.leadsCount ?? 0}`];

  return (
    <Fragment>
      {/* Background+Shadow — 26pt radius, tinted linear wash */}
      <LinearGradient
        colors={tint.grad}
        start={{ x: 0.23, y: -0.23 }}
        end={{ x: 0.77, y: 1.23 }}
        style={{
          position: "absolute",
          left: CARD_X,
          top,
          width: CARD_W,
          height: CARD_H + g,
          borderRadius: 26,
        }}
      />

      {/* Avatar 48x48 + platform badge */}
      {creator.avatarUrl ? (
        <Image
          source={{ uri: creator.avatarUrl }}
          style={{
            position: "absolute",
            left: 32,
            top: top + 16 + g / 2,
            width: 48,
            height: 48,
            borderRadius: 24,
          }}
        />
      ) : (
        <Ring x={32} y={top + 16 + g / 2} size={48} />
      )}
      <Abs x={66} y={top + 50 + g / 2} w={16} h={16} radius={8} bg={WHITE} center>
        <Feather
          name={creator.platform === "YOUTUBE" ? "youtube" : "instagram"}
          size={8}
          color={INK}
        />
      </Abs>

      {/* Name / handle + niche chip — no insight chip on the discovery card */}
      <Txt
        x={92} y={top + 19 + g / 2} w={215} size={14} weight="bold" font="inter"
        color={INK} lineHeight={17.5} letterSpacing={-0.35} numberOfLines={1}
      >
        {creator.name}
      </Txt>
      <Abs x={92} y={top + 39 + g / 2} h={22} row gap={6}>
        <Txt size={10} font="inter" color={INK_MUTED} lineHeight={15}>
          {creator.handle}
        </Txt>
        {creator.niche ? (
          <View style={styles.nicheChip}>
            <Txt size={9} weight="bold" font="inter" color={INK_MUTED} lineHeight={13.5}>
              {creator.niche}
            </Txt>
          </View>
        ) : null}
      </Abs>

      {/* Multi-select toggle — 24pt filled disc when the creator is in the
          selection, 26pt glass disc when it is not. */}
      <Pressable
        onPress={onToggle}
        hitSlop={8}
        style={[
          styles.toggle,
          selected
            ? { left: 319, top: top + 18, width: 24, height: 24, borderRadius: 12, backgroundColor: INK }
            : { left: 318, top: top + 17, width: 26, height: 26, borderRadius: 13, backgroundColor: GLASS_80 },
        ]}
      >
        {selected ? <Feather name="check" size={12} color={INK_INVERT} /> : null}
      </Pressable>

      {/* Stat strip 311x53.5 */}
      <Abs x={32} y={top + 78 + g} w={311} h={53.5} radius={16} bg={tint.strip} />
      {STATS.map((s, i) => (
        <Fragment key={s.label}>
          <Txt
            x={s.x} y={top + 88 + g} w={72} size={9} font="inter"
            color={INK_MUTED} lineHeight={13.5} letterSpacing={0.45} align="center"
          >
            {s.label}
          </Txt>
          <Txt
            x={s.x} y={top + 101.5 + g} w={72} size={14} weight="bold" font="inter"
            color={INK} lineHeight={20} align="center"
          >
            {stats[i]}
          </Txt>
        </Fragment>
      ))}
      {[114, 187, 260].map((x) => (
        <Abs key={x} x={x} y={top + 92.75 + g} w={1} h={24} bg={DIVIDER} />
      ))}
      <Txt
        x={261} y={top + 90 + g} w={72} size={9} font="inter"
        color={INK_MUTED} lineHeight={13.5} letterSpacing={0.45} align="center"
      >
        PERF.
      </Txt>
      {/* Engagement rate is the only performance percentage on the record. */}
      <Txt
        x={261} y={top + 103.5 + g} w={72} size={12} weight="bold" font="inter"
        color={PERF_INK} lineHeight={16} align="center"
      >
        {`+${creator.engagementRate.toFixed(1)}%`}
      </Txt>

      {/* HorizontalBorder — Profile / Call / Chat */}
      {ACTIONS.map((a) => (
        <Abs
          key={a.label}
          x={a.x} y={top + 148.5 + g} w={98.33} h={31} radius={12} bg={GLASS_80}
          center row gap={5}
        >
          {a.label === "Call" ? (
            <Ionicons name="call" size={11} color="#000000" />
          ) : (
            <Feather name={a.label === "Profile" ? "eye" : "message-square"} size={11} color={INK} />
          )}
          <Txt size={10} weight="semibold" font="inter" color={INK} lineHeight={15}>
            {a.label}
          </Txt>
        </Abs>
      ))}
    </Fragment>
  );
}

/* --------------------------------- screen --------------------------------- */
export default function CreatorsRosterAllTabScreen() {
  const router = useRouter();
  const { data, isLoading } = useCreators();
  const [tab, setTab] = useState<Tab>("all");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const all = useMemo(() => data ?? [], [data]);

  /** Tab counts: the marketplace pool and the agency's own roster. */
  const { listed, mine } = useMemo(
    () => ({
      listed: all.filter((c) => c.listed),
      mine: all.filter((c) => !!c.agencyId),
    }),
    [all],
  );

  const rows = tab === "all" ? listed : mine;

  const toggle = (id: string) =>
    setSelectedIds((ids) => (ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]));

  return (
    <Screen height={FRAME_H} background={PAGE} scroll>
      {/* Frame 2147223266 — header */}
      <Pressable
        onPress={() => router.back()}
        style={({ pressed }) => [styles.back, pressed && styles.pressed]}
      >
        <Feather name="chevron-left" size={18} color={INK_INVERT} />
      </Pressable>
      <Txt
        x={72} y={20} w={192} size={20} weight="medium" font="inter"
        color={INK} lineHeight={24} letterSpacing={-0.6}
      >
        Creators
      </Txt>
      <Txt
        x={72} y={49} w={192} size={10} weight="medium" font="inter"
        color="rgba(0,0,0,0.7)" lineHeight={10.38}
      >
        {`Total: ${all.length} Creators`}
      </Txt>

      {/* Action row — Add Creator / Filter / Sort */}
      <Abs x={16} y={107} w={120.89} h={32} radius={16} bg={INK} />
      <Abs x={32} y={117} w={12} h={12} center>
        <Feather name="plus" size={12} color={INK_INVERT} />
      </Abs>
      <Txt
        x={50} y={115} w={70.89} size={12} weight="bold" font="inter"
        color={INK_INVERT} lineHeight={16} align="center"
      >
        Add Creator
      </Txt>
      <Abs x={144.89} y={106} w={77.5} h={34} radius={17} bg={WHITE} />
      <Abs x={159.89} y={117} w={12} h={12} center>
        <Feather name="sliders" size={12} color={INK} />
      </Abs>
      <Txt
        x={177.89} y={115} w={29.5} size={12} weight="semibold" font="inter"
        color={INK} lineHeight={16} align="center"
      >
        Filter
      </Txt>
      <Pressable onPress={() => router.push("/agency/filters/creators-filter-sheet")} style={styles.filter} />

      <Abs x={230.39} y={106} w={72.34} h={34} radius={17} bg={WHITE} />
      <Abs x={245.39} y={117} w={12} h={12} center>
        <MaterialCommunityIcons name="sort-variant" size={12} color={INK} />
      </Abs>
      <Txt
        x={263.39} y={115} w={24.34} size={12} weight="semibold" font="inter"
        color={INK} lineHeight={16} align="center"
      >
        Sort
      </Txt>
      <Pressable onPress={() => router.push("/agency/filters/creators-sort-sheet")} style={styles.sort} />

      {/* Search field */}
      <Abs x={16} y={160} w={343} h={46} radius={20} bg={WHITE} />
      <Abs x={33} y={175.5} w={15} h={15} center>
        <Feather name="search" size={15} color={INK_MUTED} />
      </Abs>
      <Txt x={60} y={173} w={282} size={14} font="inter" color={INK_MUTED} lineHeight={20}>
        Search creators, niches...
      </Txt>

      {/* Tab switch — My Creators / All Creators, the dark pill on the active one.
          Captions run the full 166.5pt button width (their spec boxes are centred
          in it) so a four-digit roster cannot wrap. */}
      <Abs x={16} y={216} w={343} h={59} radius={16} bg={WHITE} />
      <Abs x={21} y={221} w={166.5} h={49} radius={12} bg={tab === "my" ? INK : undefined} />
      <Txt
        x={21} y={229} w={166.5} size={12} weight={tab === "my" ? "bold" : "semibold"} font="inter"
        color={tab === "my" ? INK_INVERT : INK_MUTED} lineHeight={16} align="center"
      >
        {`My Creators\n${mine.length} Creators`}
      </Txt>
      <Pressable onPress={() => setTab("my")} style={styles.tabMy} />
      <Abs x={187.5} y={221} w={166.5} h={49} radius={12} bg={tab === "all" ? INK : undefined} />
      <Txt
        x={187.5} y={229} w={166.5} size={12} weight={tab === "all" ? "bold" : "semibold"} font="inter"
        color={tab === "all" ? INK_INVERT : INK_MUTED} lineHeight={16} align="center"
      >
        {`All Creators\n${listed.length} Creators`}
      </Txt>
      <Pressable onPress={() => setTab("all")} style={styles.tabAll} />

      {/* Selection banner */}
      <Abs x={16} y={284} w={343} h={42} radius={16} bg={BANNER} />
      <Abs x={33} y={295} w={20} h={20} radius={10} bg={INK} center>
        <Feather name="check" size={10} color={INK_INVERT} />
      </Abs>
      <Txt
        x={61} y={297} w={200} size={12} weight="semibold" font="inter"
        color={INK} lineHeight={16} numberOfLines={1}
      >
        {`${selectedIds.length} creators selected`}
      </Txt>
      <Txt x={277} y={297.5} w={82} size={10} font="inter" color={INK_MUTED} lineHeight={15}>
        View creators
      </Txt>

      {/* List heading */}
      <Txt
        x={16} y={343} w={200} size={14} weight="bold" font="inter"
        color={INK} lineHeight={20} letterSpacing={-0.35}
      >
        {tab === "all" ? "All Creators" : "My Creators"}
      </Txt>
      <Txt
        x={279} y={345} w={80} size={12} font="inter"
        color={INK_MUTED} lineHeight={16} align="right"
      >
        {`${rows.length} results`}
      </Txt>

      {/* Card stack — the live marketplace pool */}
      {rows.slice(0, MAX_CARDS).map((c, i) => (
        <CreatorCard
          key={c.id}
          creator={c}
          index={i}
          selected={selectedIds.includes(c.id)}
          onToggle={() => toggle(c.id)}
        />
      ))}
      {rows.length === 0 ? (
        <Txt
          x={32} y={CARD_FIRST_Y + 16} w={311} size={12} font="inter"
          color={INK_MUTED} lineHeight={16}
        >
          {isLoading ? "Loading creators…" : "No creators"}
        </Txt>
      ) : null}

      {/* Share CTA */}
      <Abs x={24} y={784} w={327} h={54.5} radius={27.25} bg={CTA} />
      <Txt
        x={24} y={799} w={327} size={15} weight="semibold" font="inter"
        color={WHITE} lineHeight={22.5} align="center"
      >
        Share Selected Creators
      </Txt>
    </Screen>
  );
}

const styles = StyleSheet.create({
  pressed: { opacity: 0.85 },
  toggle: { position: "absolute", alignItems: "center", justifyContent: "center" },
  back: {
    position: "absolute",
    left: 16,
    top: 22,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#1f1a17",
    alignItems: "center",
    justifyContent: "center",
  },
  /** Transparent hit targets, laid over the pills they drive. */
  filter: { position: "absolute", left: 144.89, top: 106, width: 77.5, height: 34 },
  sort: { position: "absolute", left: 230.39, top: 106, width: 72.34, height: 34 },
  /** Button — 166.5x49 at 21,221 and 187.5,221. */
  tabMy: { position: "absolute", left: 21, top: 221, width: 166.5, height: 49 },
  tabAll: { position: "absolute", left: 187.5, top: 221, width: 166.5, height: 49 },
  nicheChip: {
    height: 20,
    borderRadius: 10,
    paddingHorizontal: 7,
    justifyContent: "center",
    backgroundColor: GLASS_80,
  },
});
