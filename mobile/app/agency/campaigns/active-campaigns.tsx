import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Abs, Screen, Txt } from "../../../src/ui/Frame";
import { useCampaigns, type Campaign } from "../../../src/api/hooks";

/**
 * Active Campaigns — Figma 7696:11291 (375x876), traced 1:1.
 *
 * Entry point of the agency campaigns flow: the back header (0,0 375x80), the
 * "Floating Segmented Filter" (15,110 345x50) and the "Main - Campaign Cards"
 * list frame (0,188 375x576) holding 335x333 glass cards on a 349pt step, with
 * the "Bottom Floating Browse Button" pinned at (103.5,809 168x52).
 *
 * The filter and the browse button are drawn over the list in the design, so
 * they stay fixed here and the card stack scrolls inside its own 576pt frame —
 * the real roster stays reachable without moving a single coordinate.
 *
 * Geist and Liberation Sans are not loaded (see app/_layout.tsx), so the header
 * and the View button render in Inter, the frame's own body face. expo-blur is
 * not a dependency, so every BACKGROUND_BLUR is drawn as its translucent fill.
 */

/* ------------------------------- geometry -------------------------------- */
const FRAME_W = 375;
const FRAME_H = 876;

/** "Main - Campaign Cards" — 12pt padding, 16pt stack gap, clipped at 764. */
const LIST_Y = 188;
const LIST_H = 576;
const LIST_PAD = 12;
const LIST_GAP = 16;

const CARD_X = 20;
const CARD_W = 335;
const CARD_H = 333;
const CARD_STEP = CARD_H + LIST_GAP;

/** Stats panel — 293x110 at card-relative (21,150), 259pt bars inside. */
const BAR_W = 259;

/** Segmented filter — button rects relative to the 345x50 pill at (15,110). */
const SEG_Y = 7;
const SEG_H = 36;
const SEG_TRACK_W = 393; // 271 + 115 + the pill's 7pt trailing pad

/* --------------------------- spec colour tokens --------------------------- */
const PAGE = "#f8f5ef";
const HEAD_INK = "#141311";
const BACK_FILL = "#1f1a17";
const BACK_ICON = "#faf7f2";
const TITLE_INK = "#1a1a1a";
const META_INK = "#555555";
const META_ICON = "#888888";
const SEG_IDLE_INK = "#777777";
const DARK = "#312b28";
const WHITE = "#ffffff";
const GLASS_60 = "rgba(255,255,255,0.6)";
const GLASS_62 = "rgba(255,255,255,0.62)";
const BORDER_60 = "rgba(255,255,255,0.6)";
const BORDER_80 = "rgba(255,255,255,0.8)";
const TRACK = "rgba(0,0,0,0.05)";
const TRACK_FILL = "#b0bec5";

const CARD_GRAD = ["rgba(255,255,255,0.9)", "rgba(255,255,255,0.5)"] as const;
const CARD_GRAD_START = { x: 0.1, y: -0.07 };
const CARD_GRAD_END = { x: 0.9, y: 1.07 };
const TINT_START = { x: 0, y: 0 };
const TINT_END = { x: 1, y: 1 };
const BAR_START = { x: 0, y: 0.5 };
const BAR_END = { x: 1, y: 0.5 };
const SEG_GRAD = ["#1a1a1a", "#333333"] as const;
const SEG_GRAD_START = { x: 0.14, y: -0.34 };
const SEG_GRAD_END = { x: 0.86, y: 1.34 };

/* ------------------------------ derivations ------------------------------- */
/**
 * The design's three buckets against CampaignStatus, which has three members.
 * DRAFT is a campaign whose roster is still being picked — the Shortlisted
 * bucket. ACTIVE is live work, and an ACTIVE campaign whose progress has run
 * out is work that is finished but not handed over: Pending Delivery. DONE has
 * been delivered and left the active list, which is what this screen lists.
 */
type Bucket = "live" | "pending" | "shortlisted";

/** Progress at which an ACTIVE campaign is treated as awaiting delivery. */
const DELIVERY_AT = 80;

function bucketOf(c: Campaign): Bucket | null {
  if (c.status === "DRAFT") return "shortlisted";
  if (c.status !== "ACTIVE") return null;
  return c.progress >= DELIVERY_AT ? "pending" : "live";
}

/**
 * Per-bucket paints, lifted from the two cards in the spec. Card 1 is the
 * accepted/green variant and card 2 the pending/amber one; Shortlisted reuses
 * the purple pair the frame already carries on its first chip.
 */
const BUCKET: Record<
  Bucket,
  {
    chip: string;
    pill: string;
    ink: string;
    label: string;
    tint: readonly [string, string];
    statLabel: string;
    statInk: string;
    bar: readonly [string, string];
  }
> = {
  live: {
    chip: "Live",
    pill: "rgba(232,245,233,0.8)",
    ink: "#2e7d32",
    label: "Accepted",
    tint: ["#e8f5e9", "rgba(232,245,233,0)"],
    statLabel: "Accepted",
    statInk: "#2e7d32",
    bar: ["#4caf50", "#81c784"],
  },
  pending: {
    chip: "Pending Delivery",
    pill: "rgba(255,248,225,0.8)",
    ink: "#f57f17",
    label: "Pending Delivery",
    tint: ["#f3e5f5", "rgba(243,229,245,0)"],
    statLabel: "Shortlisted",
    statInk: "#f57f17",
    bar: ["#ffb74d", "#ffcc80"],
  },
  shortlisted: {
    chip: "Shortlisted",
    pill: "rgba(243,232,255,0.8)",
    ink: "#6a1b9a",
    label: "Shortlisted",
    tint: ["#f3e5f5", "rgba(243,229,245,0)"],
    statLabel: "Shortlisted",
    statInk: "#f57f17",
    bar: ["#ffb74d", "#ffcc80"],
  },
};

/** Segment rects, pill-relative — the row overflows the pill exactly as drawn. */
const SEGMENTS: { key: Bucket; x: number; w: number }[] = [
  { key: "live", x: 7, w: 93 },
  { key: "pending", x: 107, w: 155 },
  { key: "shortlisted", x: 271, w: 115 },
];

/**
 * Campaign.timeline is a range ("12 Jul - 22 Jul"); the deadline the card wants
 * is where that range ends. Anything that is not a range is shown as it stands.
 */
function deadlineOf(timeline?: string): string | null {
  if (!timeline) return null;
  const end = timeline.split(/[-–—]/).pop();
  return end ? end.trim() : null;
}

/** 0..1, guarded — the bars are clipped tracks, not layout. */
const ratio = (n: number, of: number) => (of > 0 ? Math.min(Math.max(n / of, 0), 1) : 0);

/* -------------------------------- campaign card --------------------------- */
interface CardProps {
  top: number;
  bucket: Bucket;
  brand: string;
  name: string;
  deadline: string | null;
  swiped: number;
  swipedRatio: number;
  accepted: number;
  acceptedRatio: number;
  onView: () => void;
}

/**
 * 335x333 glass card. Child offsets are card-relative — the design's frame
 * coordinates less the card origin (20, top).
 */
function CampaignCard({
  top,
  bucket,
  brand,
  name,
  deadline,
  swiped,
  swipedRatio,
  accepted,
  acceptedRatio,
  onView,
}: CardProps) {
  const b = BUCKET[bucket];
  return (
    <Abs x={CARD_X} y={top} w={CARD_W} h={CARD_H} radius={24} style={styles.card}>
      <LinearGradient
        colors={CARD_GRAD}
        start={CARD_GRAD_START}
        end={CARD_GRAD_END}
        style={styles.fill}
      />
      {/* "Gradient" — the 30% status wash, inset inside the 1pt stroke. */}
      <Abs x={1} y={1} w={333} h={330.59} radius={24} opacity={0.3} style={styles.clip}>
        <LinearGradient
          colors={b.tint}
          start={TINT_START}
          end={TINT_END}
          style={styles.fill}
        />
      </Abs>

      {/* Heading 2 — the brand this campaign runs for. */}
      <Txt
        x={21} y={21} w={293} size={18} weight="bold" font="inter"
        color={TITLE_INK} lineHeight={21.6} numberOfLines={1}
      >
        {brand}
      </Txt>

      {/*
        The design pairs a service-role chip (Videographer / Video Editor) with
        the status pill. Campaign has no service-role column, so only the pill —
        which the status enum does back — is drawn.
      */}
      <Abs x={21} y={51} w={293} h={27} row gap={6}>
        <View style={[styles.chip, { backgroundColor: b.pill }]}>
          <Txt size={12} weight="semibold" font="inter" color={b.ink} lineHeight={14.52}>
            {b.label}
          </Txt>
        </View>
      </Abs>

      {/* Meta rows — 15pt icon at 21, text at 44, rows 24pt apart. The campaign
          glyph is the spec's three stroked panels (7696:11317-19), which no
          Feather name draws — a wide bar over two uneven feet. */}
      <Abs x={21} y={94.5} w={15} h={15}>
        <Abs x={1.88} y={1.88} w={11.25} h={4.38} radius={1.5} border={META_ICON} borderWidth={1.25} />
        <Abs x={1.88} y={8.75} w={5.62} h={4.38} radius={1.5} border={META_ICON} borderWidth={1.25} />
        <Abs x={10} y={8.75} w={3.12} h={4.38} radius={1.5} border={META_ICON} borderWidth={1.25} />
      </Abs>
      <Txt
        x={44} y={94} w={270} size={13} weight="medium" font="inter"
        color={META_INK} lineHeight={15.73} numberOfLines={1}
      >
        {`Campaign: ${name}`}
      </Txt>
      {deadline ? (
        <>
          <Abs x={21} y={118.5} w={15} h={15} center>
            <Feather name="calendar" size={15} color={META_ICON} />
          </Abs>
          <Txt
            x={44} y={118} w={270} size={13} weight="medium" font="inter"
            color={META_INK} lineHeight={15.73} numberOfLines={1}
          >
            {`Deadline: ${deadline}`}
          </Txt>
        </>
      ) : null}

      {/* Overlay+Border — the 293x110 stats panel. */}
      <Abs
        x={21} y={150} w={293} h={110} radius={16}
        bg={GLASS_60} border={BORDER_80} borderWidth={1}
      />
      <Abs x={38} y={173} w={BAR_W} h={16} row style={styles.between}>
        <Txt size={13} weight="semibold" font="inter" color={META_INK} lineHeight={15.73}>
          Swiped
        </Txt>
        <Txt size={13} weight="bold" font="inter" color={TITLE_INK} lineHeight={15.73}>
          {`${swiped}`}
        </Txt>
      </Abs>
      <Abs x={38} y={197} w={BAR_W} h={6} radius={3} bg={TRACK} style={styles.clip}>
        <Abs x={0} y={0} w={BAR_W * swipedRatio} h={6} radius={3} bg={TRACK_FILL} />
      </Abs>
      <Abs x={38} y={215} w={BAR_W} h={16} row style={styles.between}>
        <Txt size={13} weight="semibold" font="inter" color={META_INK} lineHeight={15.73}>
          {b.statLabel}
        </Txt>
        <Txt size={13} weight="bold" font="inter" color={b.statInk} lineHeight={15.73}>
          {`${accepted}`}
        </Txt>
      </Abs>
      <Abs x={38} y={239} w={BAR_W} h={6} radius={3} bg={TRACK} style={styles.clip}>
        <Abs x={0} y={0} w={BAR_W * acceptedRatio} h={6} radius={3} style={styles.clip}>
          <LinearGradient colors={b.bar} start={BAR_START} end={BAR_END} style={styles.fill} />
        </Abs>
      </Abs>

      {/* Button — right-anchored 101.66x36 pill. */}
      <Pressable
        onPress={onView}
        style={({ pressed }) => [styles.viewButton, pressed && styles.pressed]}
      >
        <Txt size={14} weight="semibold" font="inter" color={WHITE} lineHeight={16.1}>
          View
        </Txt>
        <Feather name="arrow-right" size={16} color={WHITE} />
      </Pressable>
    </Abs>
  );
}

/* --------------------------------- screen --------------------------------- */
export default function ActiveCampaigns() {
  const router = useRouter();
  const [filter, setFilter] = useState<Bucket>("live");

  const { data: campaigns = [], isLoading } = useCampaigns();

  const { counts, rows, peak } = useMemo(() => {
    const tally: Record<Bucket, number> = { live: 0, pending: 0, shortlisted: 0 };
    const active: { campaign: Campaign; bucket: Bucket }[] = [];

    for (const campaign of campaigns) {
      const bucket = bucketOf(campaign);
      if (!bucket) continue;
      tally[bucket] += 1;
      active.push({ campaign, bucket });
    }

    return {
      counts: tally,
      rows: active.filter((a) => a.bucket === filter),
      // The Swiped bar is a share of the busiest roster on the board.
      peak: active.reduce((m, a) => Math.max(m, a.campaign.peopleCount ?? 0), 0),
    };
  }, [campaigns, filter]);

  const contentH = Math.max(
    LIST_H,
    LIST_PAD + Math.max(rows.length - 1, 0) * CARD_STEP + CARD_H + LIST_PAD,
  );

  return (
    <Screen height={FRAME_H} background={PAGE} scroll>
      {/* ------------------------- Frame 2147223269 -------------------------- */}
      <Pressable
        onPress={() => router.back()}
        style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
      >
        <Feather name="arrow-left" size={16} color={BACK_ICON} />
      </Pressable>
      <Txt
        x={72} y={28} w={192} size={20} weight="medium" font="inter"
        color={HEAD_INK} lineHeight={24} letterSpacing={-0.6}
      >
        Active Campaigns
      </Txt>

      {/* --------------------- Main - Campaign Cards -------------------------- */}
      <ScrollView
        style={styles.list}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ height: contentH }}
      >
        {rows.map(({ campaign, bucket }, i) => {
          const swiped = campaign.peopleCount ?? 0;
          // Campaign has no accepted-creator count; progress is how far the
          // roster has been signed off, so the accepted head count is that
          // share of the creators swiped for this campaign.
          const accepted = Math.round((swiped * campaign.progress) / 100);
          return (
            <CampaignCard
              key={campaign.id}
              top={LIST_PAD + i * CARD_STEP}
              bucket={bucket}
              brand={campaign.brandName}
              name={campaign.name}
              deadline={deadlineOf(campaign.timeline)}
              swiped={swiped}
              swipedRatio={ratio(swiped, peak)}
              accepted={accepted}
              acceptedRatio={ratio(campaign.progress, 100)}
              onView={() =>
                router.push({
                  pathname: "/campaigns/all-requests",
                  params: { id: campaign.id },
                })
              }
            />
          );
        })}
        {rows.length === 0 ? (
          <Txt
            x={CARD_X + 21} y={LIST_PAD + 21} w={293} size={18} weight="bold"
            font="inter" color={TITLE_INK} lineHeight={21.6}
          >
            {isLoading ? "Loading campaigns…" : "No campaigns"}
          </Txt>
        ) : null}
      </ScrollView>

      {/* -------------------- Floating Segmented Filter ---------------------- */}
      <Abs
        x={15} y={110} w={345} h={50} radius={30}
        bg={GLASS_60} border={BORDER_80} borderWidth={1}
        style={styles.filterPill}
      >
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.segmentScroll}
          contentContainerStyle={styles.segments}
        >
          {SEGMENTS.map((seg) => {
            const active = seg.key === filter;
            return (
              <Pressable
                key={seg.key}
                onPress={() => setFilter(seg.key)}
                style={[styles.segment, { left: seg.x, width: seg.w }]}
              >
                {active ? (
                  <LinearGradient
                    colors={SEG_GRAD}
                    start={SEG_GRAD_START}
                    end={SEG_GRAD_END}
                    style={styles.segmentFill}
                  />
                ) : null}
                <Txt
                  w={seg.w} align="center" size={14} weight="medium" font="inter"
                  lineHeight={16.94} numberOfLines={1}
                  color={active ? WHITE : SEG_IDLE_INK}
                >
                  {`${BUCKET[seg.key].chip} (${counts[seg.key]})`}
                </Txt>
              </Pressable>
            );
          })}
        </ScrollView>
      </Abs>

      {/* ----------------- Bottom Floating Browse Button --------------------- */}
      <Pressable
        onPress={() => router.push("/agency/campaigns/campaign-requests")}
        style={({ pressed }) => [styles.browse, pressed && styles.pressed]}
      >
        <Txt
          x={21} y={17.5} w={88} size={14} weight="medium" font="inter"
          color={TITLE_INK} lineHeight={16.94} align="center"
        >
          Browse more
        </Txt>
        <Abs x={123} y={17} w={18} h={18} center>
          <Feather name="search" size={18} color={META_ICON} />
        </Abs>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  fill: { position: "absolute", left: 0, top: 0, right: 0, bottom: 0 },
  clip: { overflow: "hidden" },
  between: { justifyContent: "space-between" },
  pressed: { opacity: 0.9 },

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

  list: { position: "absolute", left: 0, top: LIST_Y, width: FRAME_W, height: LIST_H },

  card: {
    overflow: "hidden",
    borderWidth: 1,
    borderColor: WHITE,
    shadowColor: "#000000",
    shadowOpacity: 0.03,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 10 },
    elevation: 2,
  },
  chip: {
    height: 27,
    borderRadius: 12,
    justifyContent: "center",
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: BORDER_80,
  },
  viewButton: {
    position: "absolute",
    left: 212.34,
    top: 276,
    width: 101.66,
    height: 36,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: DARK,
  },

  filterPill: {
    overflow: "hidden",
    shadowColor: "#000000",
    shadowOpacity: 0.04,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  segmentScroll: { width: 343, height: 48 },
  segments: { width: SEG_TRACK_W, height: 48 },
  segment: {
    position: "absolute",
    top: SEG_Y,
    height: SEG_H,
    borderRadius: 24,
    justifyContent: "center",
    overflow: "hidden",
  },
  segmentFill: { position: "absolute", left: 0, top: 0, right: 0, bottom: 0, borderRadius: 24 },

  browse: {
    position: "absolute",
    left: 103.5,
    top: 809,
    width: 168,
    height: 52,
    borderRadius: 28,
    backgroundColor: GLASS_62,
    borderWidth: 1,
    borderColor: BORDER_60,
    shadowColor: "#000000",
    shadowOpacity: 0.06,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 10 },
    elevation: 4,
  },
});
