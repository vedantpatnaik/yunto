import { useMemo, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Svg, {
  Defs,
  LinearGradient as SvgLinear,
  RadialGradient,
  Rect,
  Stop,
} from "react-native-svg";
import { Abs, Screen, Txt } from "../../../src/ui/Frame";
import { colors } from "../../../src/theme";
import { useCampaigns, type Campaign } from "../../../src/api/hooks";

/**
 * Active Campaigns — Figma 7333:16160 (375x875).
 *
 * Traced 1:1: glass header, the floating segmented Live / Pending Delivery /
 * Shortlisted pill, a clipped stack of 335x331 glass campaign cards (each with
 * a role + status chip pair, two meta rows, a two-row funnel block and a View
 * button) and the bottom floating "Browse more" pill. Coordinates below are the
 * raw frame coordinates from the spec; <Screen> scales the 375pt canvas.
 */

/* ------------------------------- geometry -------------------------------- */
const FRAME_W = 375;
const FRAME_H = 875;

const LIST_Y = 194; // "Main - Campaign Cards" frame origin
const LIST_H = 576;
const LIST_PAD = 12; // frame padding-top; first card sits here
const CARD_GAP = 16; // vertical stack gap
/** 12 + 331 + 16 = 359 for row two; row three would land at 708 > 564. */
const MAX_CARDS = 2;

const CARD_W = 335;
const CONTENT_X = 20; // 21 in the spec, less the card's 1pt stroke
const CONTENT_W = 293;
const STAT_H = 110;
const TRACK_W = 259;

/* --------------------------- spec colour tokens --------------------------- */
const INK_TITLE_A = "#1F1A17";
const INK_TITLE_B = "#1A1A1A";
const META_A = "#787486";
const META_B = "#555555";
const ICON_MUTED = "#888888";
const GLASS_60 = "rgba(255,255,255,0.6)";
const BORDER_80 = "rgba(255,255,255,0.8)";
const TRACK_BG = "rgba(0,0,0,0.05)";
const TRACK_FILL = "#B0BEC5";
const BUTTON_INK = "#312B28";

/* --------------------------------- model ---------------------------------- */
type Stage = "live" | "pending_delivery" | "shortlisted";

/**
 * The design ships two card treatments: a green "Accepted" card and a purple
 * card whose funnel counts shortlists. Which one a row wears follows its stage.
 */
interface Variant {
  tint: string;
  titleColor: string;
  titleWeight: "semibold" | "bold";
  roleLabel: string;
  roleBg: string;
  roleInk: string;
  chipH: number;
  chipRadius: number;
  chipBorder?: string;
  statusLabel: string;
  statusBg: string;
  statusInk: string;
  chipY: number;
  metaColor: string;
  metaY: number;
  statY: number;
  valueColor: string;
  convLabel: string;
  convInk: string;
  convBar: readonly [string, string];
  buttonY: number;
  cardH: number;
}

/** Card 1 — 7333:16477. */
const CARD_A = {
  tint: "#E8F5E9",
  titleColor: INK_TITLE_A,
  titleWeight: "semibold",
  roleLabel: "Videographer",
  roleBg: "#E9E1F3",
  roleInk: "#9333EA",
  chipH: 25,
  chipRadius: 24,
  statusBg: "#E8F5EE",
  statusInk: "#2D8A55",
  chipY: 51,
  metaColor: META_A,
  metaY: 92,
  statY: 148,
  valueColor: INK_TITLE_A,
  convLabel: "Accepted",
  convInk: "#2E7D32",
  convBar: ["#4CAF50", "#81C784"],
  buttonY: 274,
  cardH: 331,
} as const;

/** Card 2 — 7333:16527. */
const CARD_B = {
  tint: "#F3E5F5",
  titleColor: INK_TITLE_B,
  titleWeight: "bold",
  roleLabel: "Video Editor",
  roleBg: "rgba(227,242,253,0.8)",
  roleInk: "#1565C0",
  chipH: 27,
  chipRadius: 12,
  chipBorder: BORDER_80,
  statusBg: "rgba(255,248,225,0.8)",
  statusInk: "#F57F17",
  chipY: 51.01,
  metaColor: META_B,
  metaY: 94.01,
  statY: 150.01,
  valueColor: INK_TITLE_B,
  convLabel: "Shortlisted",
  convInk: "#F57F17",
  convBar: ["#FFB74D", "#FFCC80"],
  buttonY: 276.01,
  cardH: 333.01,
} as const;

const VARIANTS: Record<Stage, Variant> = {
  live: { ...CARD_A, statusLabel: "Accepted" },
  pending_delivery: { ...CARD_B, statusLabel: "Pending Delivery" },
  shortlisted: { ...CARD_B, statusLabel: "Shortlisted" },
};

const TABS: { key: Stage; label: string; x: number; w: number }[] = [
  { key: "live", label: "Live", x: 6, w: 93 },
  { key: "pending_delivery", label: "Pending Delivery", x: 106, w: 155 },
  { key: "shortlisted", label: "Shortlisted", x: 270, w: 115 },
];

/* ------------------------------ derivations ------------------------------- */
/** DRAFT reads as a shortlist, DONE as work awaiting delivery, ACTIVE as live. */
function stageOf(status: string): Stage {
  if (status === "DRAFT") return "shortlisted";
  if (status === "DONE") return "pending_delivery";
  return "live";
}

/** Campaign timelines are stored as "10 Jul - 20 Jul"; the deadline is the end. */
function deadlineOf(timeline?: string): string {
  if (!timeline) return "—";
  const parts = timeline.split("-");
  return (parts[parts.length - 1] ?? timeline).trim();
}

const clamp = (n: number) => (n > 1 ? 1 : n < 0 ? 0 : n);

interface Row {
  id: string;
  stage: Stage;
  title: string;
  parent: string;
  deadline: string;
  swiped: number;
  converted: number;
  swipedRatio: number;
  convRatio: number;
  top: number;
}

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

/* ---------------------------------- chip ---------------------------------- */
function Chip({
  label, h, radius, bg, ink, border,
}: { label: string; h: number; radius: number; bg: string; ink: string; border?: string }) {
  return (
    <View
      style={[
        styles.chip,
        { height: h, borderRadius: radius, backgroundColor: bg },
        border ? [styles.chipRing, { borderColor: border }] : null,
      ]}
    >
      <Txt size={12} weight="semibold" font="inter" color={ink} lineHeight={14.52} numberOfLines={1}>
        {label}
      </Txt>
    </View>
  );
}

/* ------------------------------ campaign card ----------------------------- */
/**
 * 335x331 glass card. Child offsets are card-relative and already account for
 * the 1pt stroke, which insets the padding box by a point on each side.
 */
function CampaignCard({ row, onView }: { row: Row; onView: () => void }) {
  const v = VARIANTS[row.stage];
  return (
    <Abs
      x={20}
      y={row.top}
      w={CARD_W}
      h={v.cardH}
      radius={24}
      border={colors.white}
      borderWidth={1}
      style={styles.card}
    >
      <LinearGradient
        colors={["rgba(255,255,255,0.9)", "rgba(255,255,255,0.5)"] as const}
        start={{ x: 0.1, y: -0.07 }}
        end={{ x: 0.9, y: 1.07 }}
        style={StyleSheet.absoluteFill}
      />
      <LinearGradient
        colors={[v.tint, `${v.tint}00`] as const}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[StyleSheet.absoluteFill, styles.tint]}
      />

      <Txt
        x={CONTENT_X}
        y={20}
        w={CONTENT_W}
        size={18}
        weight={v.titleWeight}
        font="inter"
        color={v.titleColor}
        lineHeight={21.6}
        numberOfLines={1}
      >
        {row.title}
      </Txt>

      <Abs x={CONTENT_X} y={v.chipY - 1} row gap={6}>
        <Chip
          label={v.roleLabel}
          h={v.chipH}
          radius={v.chipRadius}
          bg={v.roleBg}
          ink={v.roleInk}
          border={v.chipBorder}
        />
        <Chip
          label={v.statusLabel}
          h={v.chipH}
          radius={v.chipRadius}
          bg={v.statusBg}
          ink={v.statusInk}
          border={v.chipBorder}
        />
      </Abs>

      {/* Campaign / Deadline meta rows — 24pt apart in the spec. */}
      <Abs x={CONTENT_X} y={v.metaY - 0.5} w={15} h={15} center>
        <Feather name="layout" size={15} color={ICON_MUTED} />
      </Abs>
      <Txt
        x={43}
        y={v.metaY - 1}
        w={250}
        size={13}
        weight="medium"
        font="inter"
        color={v.metaColor}
        lineHeight={15.73}
        numberOfLines={1}
      >
        {`Campaign: ${row.parent}`}
      </Txt>
      <Abs x={CONTENT_X} y={v.metaY + 23.5} w={15} h={15} center>
        <Feather name="calendar" size={15} color={ICON_MUTED} />
      </Abs>
      <Txt
        x={43}
        y={v.metaY + 23}
        w={250}
        size={13}
        weight="medium"
        font="inter"
        color={v.metaColor}
        lineHeight={15.73}
        numberOfLines={1}
      >
        {`Deadline: ${row.deadline}`}
      </Txt>

      {/* Funnel block */}
      <Abs
        x={CONTENT_X}
        y={v.statY - 1}
        w={CONTENT_W}
        h={STAT_H}
        radius={16}
        bg={GLASS_60}
        border={BORDER_80}
        borderWidth={1}
      >
        <Txt x={16} y={22} size={13} weight="semibold" font="inter" color={v.metaColor} lineHeight={15.73}>
          Swiped
        </Txt>
        <Txt
          x={16}
          y={22}
          w={TRACK_W}
          size={13}
          weight="bold"
          font="inter"
          color={v.valueColor}
          lineHeight={15.73}
          align="right"
        >
          {row.swiped}
        </Txt>
        <Abs x={16} y={46} w={TRACK_W} h={6} radius={3} bg={TRACK_BG} style={styles.clip}>
          <Abs x={0} y={0} w={TRACK_W * row.swipedRatio} h={6} radius={3} bg={TRACK_FILL} />
        </Abs>

        <Txt x={16} y={64} size={13} weight="semibold" font="inter" color={v.metaColor} lineHeight={15.73}>
          {v.convLabel}
        </Txt>
        <Txt
          x={16}
          y={64}
          w={TRACK_W}
          size={13}
          weight="bold"
          font="inter"
          color={v.convInk}
          lineHeight={15.73}
          align="right"
        >
          {row.converted}
        </Txt>
        <Abs x={16} y={88} w={TRACK_W} h={6} radius={3} bg={TRACK_BG} style={styles.clip}>
          <LinearGradient
            colors={v.convBar}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={[styles.convFill, { width: TRACK_W * row.convRatio }]}
          />
        </Abs>
      </Abs>

      <Pressable
        onPress={onView}
        style={({ pressed }) => [styles.viewButton, { top: v.buttonY - 1 }, pressed && styles.pressed]}
      >
        <Txt size={14} weight="semibold" font="inter" color={colors.white} lineHeight={16.1}>
          View
        </Txt>
        <Feather name="arrow-up-right" size={16} color={colors.white} />
      </Pressable>
    </Abs>
  );
}

/* --------------------------------- screen --------------------------------- */
export default function ActiveCampaigns() {
  const router = useRouter();
  const [stage, setStage] = useState<Stage>("live");
  const { data = [], isLoading } = useCampaigns();

  const { counts, rows } = useMemo(() => {
    const staged: { c: Campaign; stage: Stage }[] = data.map((c) => ({
      c,
      stage: stageOf(c.status),
    }));
    const tally: Record<Stage, number> = {
      live: 0,
      pending_delivery: 0,
      shortlisted: 0,
    };
    for (const s of staged) tally[s.stage] += 1;

    const picked = staged.filter((s) => s.stage === stage);
    // The swiped bar reads against the busiest funnel in the current tab.
    const peak = picked.reduce((m, s) => Math.max(m, s.c.peopleCount ?? 0), 0);

    let top = LIST_PAD;
    const built: Row[] = picked.slice(0, MAX_CARDS).map((s) => {
      const swiped = s.c.peopleCount ?? 0;
      const converted = Math.round((swiped * s.c.progress) / 100);
      const y = top;
      top += VARIANTS[s.stage].cardH + CARD_GAP;
      return {
        id: s.c.id,
        stage: s.stage,
        title: s.c.name,
        parent: s.c.brandName,
        deadline: deadlineOf(s.c.timeline),
        swiped,
        converted,
        swipedRatio: peak > 0 ? clamp(swiped / peak) : 0,
        convRatio: swiped > 0 ? clamp(converted / swiped) : 0,
        top: y,
      };
    });

    return { counts: tally, rows: built };
  }, [data, stage]);

  return (
    <Screen height={FRAME_H} background="#F7F0E4" scroll>
      <Backdrop />

      {/* Header */}
      <Pressable
        onPress={() => router.back()}
        style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
      >
        <Feather name="chevron-left" size={20} color="#1C1C1E" />
      </Pressable>
      <Txt
        x={75}
        y={30}
        w={235}
        size={16}
        weight="semibold"
        font="inter"
        color={INK_TITLE_A}
        lineHeight={19.36}
        align="center"
      >
        Active Campaigns
      </Txt>

      {/* Floating segmented filter — the last pill runs past the edge as designed. */}
      <Abs
        x={15}
        y={116}
        w={345}
        h={50}
        radius={30}
        bg={GLASS_60}
        border={BORDER_80}
        borderWidth={1}
        style={styles.filter}
      >
        {TABS.map((t) => {
          const active = t.key === stage;
          return (
            <Pressable
              key={t.key}
              onPress={() => setStage(t.key)}
              style={[styles.tab, { left: t.x, width: t.w }]}
            >
              {active ? (
                <LinearGradient
                  colors={["#1A1A1A", "#333333"] as const}
                  start={{ x: 0.14, y: -0.34 }}
                  end={{ x: 0.86, y: 1.34 }}
                  style={styles.tabFill}
                />
              ) : null}
              <Txt
                x={-40}
                y={10}
                w={t.w + 80}
                size={14}
                weight="medium"
                font="inter"
                color={active ? "#FFF8F8" : META_A}
                lineHeight={16.94}
                align="center"
                numberOfLines={1}
              >
                {`${t.label} (${counts[t.key]})`}
              </Txt>
            </Pressable>
          );
        })}
      </Abs>

      {/* Main - Campaign Cards */}
      <Abs x={0} y={LIST_Y} w={FRAME_W} h={LIST_H} style={styles.clip}>
        {rows.map((r) => (
          <CampaignCard
            key={r.id}
            row={r}
            onView={() => router.push(`/campaigns/campaign-brief?id=${r.id}` as never)}
          />
        ))}
        {!isLoading && rows.length === 0 ? (
          <Txt
            x={41}
            y={LIST_PAD + 20}
            w={CONTENT_W}
            size={13}
            weight="medium"
            font="inter"
            color={META_A}
            lineHeight={15.73}
          >
            No campaigns
          </Txt>
        ) : null}
      </Abs>

      {/* Bottom floating browse button */}
      <Pressable
        onPress={() => router.push("/services/videographers" as never)}
        style={({ pressed }) => [styles.browse, pressed && styles.pressed]}
      >
        <Txt
          x={20}
          y={16.5}
          w={88}
          size={14}
          weight="medium"
          font="inter"
          color={INK_TITLE_B}
          lineHeight={16.94}
          align="center"
        >
          Browse more
        </Txt>
        <Abs x={122} y={16} w={18} h={18} center>
          <Feather name="search" size={18} color={ICON_MUTED} />
        </Abs>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  backdrop: { position: "absolute", left: 0, top: 0 },
  clip: { overflow: "hidden" },
  pressed: { opacity: 0.9 },

  backButton: {
    position: "absolute",
    left: 15,
    top: 18,
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.65)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.9)",
    shadowColor: "#000000",
    shadowOpacity: 0.03,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
  },

  filter: {
    overflow: "hidden",
    shadowColor: "#000000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  tab: {
    position: "absolute",
    top: 6,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  tabFill: {
    position: "absolute",
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
    borderRadius: 24,
  },

  card: {
    overflow: "hidden",
    shadowColor: "#000000",
    shadowOpacity: 0.03,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 10 },
    elevation: 2,
  },
  tint: { opacity: 0.3 },

  chip: { justifyContent: "center", paddingHorizontal: 12 },
  chipRing: {
    borderWidth: 1,
    shadowColor: "#000000",
    shadowOpacity: 0.02,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 2 },
  },

  convFill: { position: "absolute", left: 0, top: 0, height: 6, borderRadius: 3 },

  viewButton: {
    position: "absolute",
    left: 211.34,
    width: 101.66,
    height: 36,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: BUTTON_INK,
  },

  browse: {
    position: "absolute",
    left: 103.5,
    top: 808,
    width: 168,
    height: 52,
    borderRadius: 28,
    backgroundColor: "rgba(255,255,255,0.62)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.6)",
    shadowColor: "#000000",
    shadowOpacity: 0.06,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 10 },
    elevation: 4,
  },
});
