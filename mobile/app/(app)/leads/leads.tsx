import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Svg, {
  Circle,
  Defs,
  G,
  LinearGradient as SvgLinear,
  RadialGradient,
  Rect,
  Stop,
} from "react-native-svg";
import { Abs, Screen, Txt } from "../../../src/ui/Frame";
import { useAgencies, useLeads, useUsers, type Lead } from "../../../src/api/hooks";

/**
 * Leads — Figma 7383:34605 (375x875, content overflows to 1057).
 *
 * Pipeline home: glass header, "needs response" banner, a horizontally
 * scrolling Status Filters chip row, the Overview Compact Radial donut and the
 * lead card stack. The four sibling frames in the design are this one screen
 * with a different chip selected, so the chip row is local state rather than
 * four routes. Card 2 in the design is drawn mid-swipe with the green "Contact"
 * action revealed underneath — that is an interaction state here: tapping a
 * card slides it 85pt right, exactly as the spec draws it.
 *
 * Coordinates below are raw frame coordinates; <Screen> scales the 375pt canvas.
 */

/* ------------------------------- geometry -------------------------------- */
const FRAME_W = 375;
const FRAME_H = 875;

const LIST_Y = 373; // "Container" holding the card stack
const CARD_X = 20;
const CARD_W = 335;
const CARD_H = 154;
const CARD_STEP = 166; // 154 card + 12 stack gap
const REVEAL_X = 85; // swipe offset that exposes the Contact action

/* --------------------------- spec colour tokens --------------------------- */
const INK_TITLE = "#1D1D1F";
const INK_MUTED = "#6E6E73";
const INK_LEGEND = "#555555";
const INK_CHIP_IDLE = "#666666";
const INK_CHIP_ACTIVE = "#5A3E75";
const CHIP_ACTIVE_BG = "#F4EEF8";
const CONTACT_INK = "#268C52";
const GLASS_40 = "rgba(255,255,255,0.4)";
const GLASS_60 = "rgba(255,255,255,0.6)";
const GLASS_65 = "rgba(255,255,255,0.65)";
const GLASS_70 = "rgba(255,255,255,0.7)";
const GLASS_80 = "rgba(255,255,255,0.8)";
const BORDER_70 = "rgba(255,255,255,0.7)";

/* ------------------------------ derivations ------------------------------- */
/**
 * The design ships four pipeline buckets. LeadStatus has no UNATTENDED or WON
 * member and no "needs response" flag, so both are derived: CONVERTED is the
 * win, and a NEW lead that has sat untouched for a day is unattended. DEAD
 * leads have left the pipeline and are not counted.
 */
type Bucket = "UNATTENDED" | "NEW" | "CONTACTED" | "WON";

const BUCKETS: Bucket[] = ["UNATTENDED", "NEW", "CONTACTED", "WON"];

const HOUR = 3_600_000;
const STALE = 24 * HOUR;

function bucketOf(lead: Lead, now: number): Bucket | null {
  if (lead.status === "CONVERTED") return "WON";
  if (lead.status === "CONTACTED" || lead.status === "CONNECTED") return "CONTACTED";
  if (lead.status !== "NEW") return null;
  const touched = lead.updatedAt ? new Date(lead.updatedAt).getTime() : now;
  return now - touched > STALE ? "UNATTENDED" : "NEW";
}

/** "2 hrs ago" / "1 day ago" / "3 days ago" — the exact meta format in the card. */
function agoLabel(iso: string | undefined, now: number): string {
  if (!iso) return "just now";
  const hrs = Math.floor((now - new Date(iso).getTime()) / HOUR);
  if (hrs < 1) return "just now";
  if (hrs < 24) return `${hrs} ${hrs === 1 ? "hr" : "hrs"} ago`;
  const days = Math.round(hrs / 24);
  return `${days} ${days === 1 ? "day" : "days"} ago`;
}

/** Lead.money is stored bare ("300k"); the pill in the design is prefixed. */
function moneyLabel(money: string | undefined): string | null {
  if (!money) return null;
  return money.startsWith("₹") ? money : `₹${money}`;
}

/** Per-bucket paints, lifted from the four card variants in the spec. */
const STYLE: Record<
  Bucket,
  { from: string; to: string; pill: string; ink: string; label: string; dot: string }
> = {
  UNATTENDED: {
    from: "#FDF0D5", to: "#FEF9EF",
    pill: "#FEE0B8", ink: "#C07C27", label: "NEEDS RESPONSE", dot: "#F4D03F",
  },
  NEW: {
    from: "#EFFADC", to: "#F8FDF1",
    pill: "#C4F1D7", ink: "#268C52", label: "NEW", dot: "#82E0AA",
  },
  CONTACTED: {
    from: "#F1EAFA", to: "#F9F6FC",
    pill: "#E1D7FA", ink: "#7A54B8", label: "CONTACTED", dot: "#C39BD3",
  },
  WON: {
    from: "#E8F0FC", to: "#F4F8FE",
    pill: "#C4D8FE", ink: "#2E60D1", label: "WON", dot: "#85C1E9",
  },
};

const CARD_GRAD_START = { x: 0.14, y: -0.29 };
const CARD_GRAD_END = { x: 0.86, y: 1.29 };

type Filter = "all" | Bucket;

const FILTERS: { key: Filter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "UNATTENDED", label: "Unattended" },
  { key: "NEW", label: "New" },
  { key: "CONTACTED", label: "Contacted" },
  { key: "WON", label: "Won" },
];

/** Legend slots — two columns of two, at their exact frame coordinates. */
const LEGEND: { bucket: Bucket; label: string; dotX: number; dotY: number; tx: number; ty: number }[] = [
  { bucket: "UNATTENDED", label: "Unattended", dotX: 130, dotY: 288, tx: 146, ty: 284 },
  { bucket: "NEW", label: "New", dotX: 130, dotY: 314, tx: 146, ty: 310 },
  { bucket: "CONTACTED", label: "Contacted", dotX: 250.67, dotY: 288, tx: 266.67, ty: 284 },
  { bucket: "WON", label: "Won", dotX: 250.67, dotY: 314, tx: 266.67, ty: 310 },
];

/* -------------------------------- backdrop -------------------------------- */
/** The frame fill: a warm vertical base plus four soft radial glows. */
function Backdrop({ height }: { height: number }) {
  return (
    <Svg width={FRAME_W} height={height} style={styles.backdrop}>
      <Defs>
        <SvgLinear id="base" x1="187.5" y1="0" x2="187.5" y2={height} gradientUnits="userSpaceOnUse">
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
      <Rect width={FRAME_W} height={height} fill="url(#base)" />
      <Rect width={FRAME_W} height={height} fill="url(#pink)" />
      <Rect width={FRAME_W} height={height} fill="url(#blue)" />
      <Rect width={FRAME_W} height={height} fill="url(#gold)" />
      <Rect width={FRAME_W} height={height} fill="url(#haze)" />
    </Svg>
  );
}

/* --------------------------------- donut ---------------------------------- */
const RING_R = 28;
const RING_C = 2 * Math.PI * RING_R;

/** The 80x80 "Overview Compact Radial" ring — four arcs on a 64pt circle. */
function Donut({ counts, total }: { counts: Record<Bucket, number>; total: number }) {
  let offset = 0;
  return (
    <Svg width={80} height={80} style={styles.donut}>
      <G rotation={-90} origin="40, 40">
        {BUCKETS.map((b) => {
          const len = total > 0 ? (counts[b] / total) * RING_C : 0;
          const dash = `${len} ${RING_C - len}`;
          const node = (
            <Circle
              key={b}
              cx={40}
              cy={40}
              r={RING_R}
              fill="none"
              stroke={STYLE[b].dot}
              strokeWidth={8}
              strokeDasharray={dash}
              strokeDashoffset={-offset}
            />
          );
          offset += len;
          return node;
        })}
      </G>
    </Svg>
  );
}

/* -------------------------------- lead card ------------------------------- */
interface CardProps {
  top: number;
  bucket: Bucket;
  name: string;
  brand: string;
  money: string | null;
  meta: string;
  open: boolean;
  onToggle: () => void;
}

/**
 * 335x154 lead card. Child offsets are card-relative. The card body slides
 * REVEAL_X right when open, uncovering the Contact action drawn beneath it.
 */
function LeadCard({ top, bucket, name, brand, money, meta, open, onToggle }: CardProps) {
  const s = STYLE[bucket];
  return (
    <Abs x={CARD_X} y={top} w={CARD_W} h={CARD_H} radius={20} style={styles.card}>
      {/* Swipe reveal — the green Contact action underneath the card. */}
      <LinearGradient
        colors={["#E6F8ED", "#D4F2E1"] as const}
        start={CARD_GRAD_START}
        end={CARD_GRAD_END}
        style={styles.fill}
      />
      <Pressable onPress={onToggle} style={styles.contactRow}>
        <View style={styles.contactButton}>
          <Feather name="phone" size={16} color={CONTACT_INK} />
        </View>
        <Txt size={13} weight="semibold" font="inter" color={CONTACT_INK} lineHeight={15.73}>
          Contact
        </Txt>
      </Pressable>

      {/* Card body */}
      <Pressable onPress={onToggle} style={[styles.body, { left: open ? REVEAL_X : 0 }]}>
        <LinearGradient
          colors={[s.from, s.to] as const}
          start={CARD_GRAD_START}
          end={CARD_GRAD_END}
          style={styles.fill}
        />

        <Txt
          x={16} y={16} w={230}
          size={16} weight="bold" font="inter" color={INK_TITLE} lineHeight={19.36}
          numberOfLines={1}
        >
          {name}
        </Txt>
        <Txt
          x={16} y={38} w={230}
          size={13} weight="medium" font="inter" color={INK_MUTED} lineHeight={15.73}
          numberOfLines={1}
        >
          {brand}
        </Txt>

        {money ? (
          <Abs x={16} y={16} w={303} h={25} style={styles.right}>
            <View style={styles.moneyPill}>
              <Txt size={14} weight="bold" font="inter" color={INK_TITLE} lineHeight={16.94}>
                {money}
              </Txt>
            </View>
          </Abs>
        ) : null}

        <Abs x={16} y={66} w={303} h={20} row gap={8}>
          <View style={[styles.statusPill, { backgroundColor: s.pill }]}>
            <Txt size={10} weight="bold" font="inter" color={s.ink} lineHeight={12.1}>
              {s.label}
            </Txt>
          </View>
          <Txt
            size={12} weight="medium" font="inter" color={INK_MUTED} lineHeight={14.52}
            numberOfLines={1} style={styles.shrink}
          >
            {meta}
          </Txt>
        </Abs>

        <Abs x={16} y={102} w={303} h={36} row gap={8}>
          <View style={styles.iconButton}>
            <Feather name="phone" size={16} color={INK_TITLE} />
          </View>
          <View style={styles.iconButton}>
            <Feather name="message-circle" size={16} color={INK_TITLE} />
          </View>
          <View style={styles.iconButton}>
            <Feather name="instagram" size={16} color={INK_TITLE} />
          </View>
        </Abs>
      </Pressable>
    </Abs>
  );
}

/* --------------------------------- screen --------------------------------- */
export default function Leads() {
  const router = useRouter();
  const [filter, setFilter] = useState<Filter>("all");
  const [openId, setOpenId] = useState<string | null>(null);

  const { data: leads = [], isLoading } = useLeads();
  const { data: users = [] } = useUsers();
  const { data: agencies = [] } = useAgencies();

  const owners = useMemo(() => new Map(users.map((u) => [u.id, u.name])), [users]);
  const agencyNames = useMemo(() => new Map(agencies.map((a) => [a.id, a.name])), [agencies]);

  const { counts, total, rows } = useMemo(() => {
    const now = Date.now();
    const tally: Record<Bucket, number> = { UNATTENDED: 0, NEW: 0, CONTACTED: 0, WON: 0 };

    const pipeline: { lead: Lead; bucket: Bucket }[] = [];
    for (const lead of leads) {
      const bucket = bucketOf(lead, now);
      if (!bucket) continue;
      tally[bucket] += 1;
      pipeline.push({ lead, bucket });
    }

    // Same order the design stacks them: needs-response first, won last, then
    // most recently touched inside each bucket.
    pipeline.sort((a, b) => {
      const d = BUCKETS.indexOf(a.bucket) - BUCKETS.indexOf(b.bucket);
      if (d !== 0) return d;
      return new Date(b.lead.updatedAt ?? 0).getTime() - new Date(a.lead.updatedAt ?? 0).getTime();
    });

    return {
      counts: tally,
      total: pipeline.length,
      rows: filter === "all" ? pipeline : pipeline.filter((p) => p.bucket === filter),
    };
  }, [leads, filter]);

  const now = Date.now();
  const needsResponse = counts.UNATTENDED;
  const canvasH = Math.max(FRAME_H, LIST_Y + rows.length * CARD_STEP + 20);
  const chipCount = (key: Filter) => (key === "all" ? total : counts[key]);

  return (
    <Screen height={canvasH} background="#F7F0E4" scroll>
      <Backdrop height={canvasH} />

      {/* Header */}
      <Pressable
        onPress={() => router.back()}
        style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
      >
        <Feather name="chevron-left" size={20} color={INK_TITLE} />
      </Pressable>
      <Txt
        x={165.96} y={21.5} w={47.08}
        size={16} weight="bold" font="inter" color={INK_TITLE} lineHeight={19.36}
      >
        Leads
      </Txt>
      <Txt
        x={152.07} y={43.5} w={74.86} align="center"
        size={12} weight="medium" font="inter" color={INK_MUTED} lineHeight={14.52}
      >
        {`${total} total leads`}
      </Txt>

      {/* Action-needed banner */}
      <Abs x={15} y={106} w={345} h={64} radius={16} style={styles.banner}>
        <LinearGradient
          colors={["#FFE5A4D1", "#FFF5E4EB", "#F4D3EEE0", "#CAD9FFC2"] as const}
          locations={[0, 0.35, 0.72, 1] as const}
          start={{ x: 0.11, y: -0.21 }}
          end={{ x: 0.89, y: 1.21 }}
          style={styles.fill}
        />
      </Abs>
      <Txt
        x={35} y={129.5}
        size={14} weight="bold" font="inter" color={INK_TITLE} lineHeight={16.94}
      >
        {`${needsResponse} ${needsResponse === 1 ? "lead needs" : "leads need"} response`}
      </Txt>
      <Pressable
        onPress={() => setFilter("UNATTENDED")}
        style={({ pressed }) => [styles.reviewPill, pressed && styles.pressed]}
      >
        <Txt size={12} weight="semibold" font="inter" color="#1F1A17" lineHeight={14.52}>
          Review now
        </Txt>
      </Pressable>

      {/* Status Filters — the row runs past the frame edge exactly as designed. */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filters}
        contentContainerStyle={styles.filtersContent}
      >
        {FILTERS.map((f) => {
          const active = f.key === filter;
          return (
            <Pressable
              key={f.key}
              onPress={() => setFilter(f.key)}
              style={[styles.chip, active ? styles.chipActive : styles.chipIdle]}
            >
              <Txt
                size={14} weight="semibold" font="inter" lineHeight={16.94}
                color={active ? INK_CHIP_ACTIVE : INK_CHIP_IDLE}
              >
                {`${f.label} (${chipCount(f.key)})`}
              </Txt>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Overview Compact Radial */}
      <Abs x={15} y={255} w={345} h={100} radius={24} bg={GLASS_60} />
      <Donut counts={counts} total={total} />
      <Txt
        x={36} y={293} w={80} align="center"
        size={20} weight="bold" font="inter" color="#222222" lineHeight={24.2}
      >
        {total}
      </Txt>
      {LEGEND.map((l) => (
        <Abs key={l.bucket} x={l.dotX} y={l.dotY} w={8} h={8} radius={4} bg={STYLE[l.bucket].dot} />
      ))}
      {LEGEND.map((l) => (
        <Txt
          key={l.bucket}
          x={l.tx} y={l.ty}
          size={13} weight="medium" font="inter" color={INK_LEGEND} lineHeight={15.73}
        >
          {`${counts[l.bucket]} ${l.label}`}
        </Txt>
      ))}

      {/* Lead cards */}
      {rows.map(({ lead, bucket }, i) => {
        const who = (lead.ownerId && owners.get(lead.ownerId)) || (lead.agencyId && agencyNames.get(lead.agencyId));
        const when = agoLabel(lead.updatedAt, now);
        return (
          <LeadCard
            key={lead.id}
            top={LIST_Y + i * CARD_STEP}
            bucket={bucket}
            name={lead.contactPerson ?? lead.brandName}
            brand={lead.brandName}
            money={moneyLabel(lead.money)}
            meta={who ? `Managed by ${who} • ${when}` : when}
            open={openId === lead.id}
            onToggle={() => setOpenId(openId === lead.id ? null : lead.id)}
          />
        );
      })}
      {rows.length === 0 ? (
        <Txt
          x={36} y={LIST_Y + 16} w={303}
          size={13} weight="medium" font="inter" color={INK_MUTED} lineHeight={15.73}
        >
          {isLoading ? "Loading leads…" : "No leads"}
        </Txt>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  backdrop: { position: "absolute", left: 0, top: 0 },
  fill: { position: "absolute", left: 0, top: 0, right: 0, bottom: 0 },
  pressed: { opacity: 0.9 },
  right: { alignItems: "flex-end" },
  shrink: { flexShrink: 1 },

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
    borderWidth: 1,
    borderColor: BORDER_70,
    shadowColor: "#000000",
    shadowOpacity: 0.03,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
  },

  banner: {
    overflow: "hidden",
    shadowColor: "#1E1432",
    shadowOpacity: 0.04,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 12 },
    elevation: 2,
  },
  reviewPill: {
    position: "absolute",
    left: 244.72,
    top: 122,
    width: 95.28,
    height: 32,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,253,251,0.62)",
    borderWidth: 1,
    borderColor: BORDER_70,
  },

  filters: { position: "absolute", left: 0, top: 188, width: FRAME_W, height: 49 },
  filtersContent: { alignItems: "center", paddingHorizontal: 20, gap: 10 },
  chip: {
    height: 39,
    borderRadius: 20,
    justifyContent: "center",
    paddingHorizontal: 19,
    borderWidth: 1,
  },
  chipActive: {
    backgroundColor: CHIP_ACTIVE_BG,
    borderColor: BORDER_70,
    shadowColor: "#5A3E75",
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
  },
  chipIdle: {
    backgroundColor: GLASS_40,
    borderColor: BORDER_70,
    shadowColor: "#000000",
    shadowOpacity: 0.02,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
  },

  donut: { position: "absolute", left: 36, top: 265 },

  card: {
    overflow: "hidden",
    shadowColor: "#1E1432",
    shadowOpacity: 0.04,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 16 },
    elevation: 2,
  },
  contactRow: {
    position: "absolute",
    left: 20,
    top: 59,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  contactButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: GLASS_80,
  },
  body: {
    position: "absolute",
    top: 0,
    width: CARD_W,
    height: CARD_H,
    borderRadius: 20,
    overflow: "hidden",
  },
  moneyPill: {
    height: 25,
    borderRadius: 8,
    justifyContent: "center",
    paddingHorizontal: 8,
    backgroundColor: GLASS_60,
  },
  statusPill: {
    height: 20,
    borderRadius: 12,
    justifyContent: "center",
    paddingHorizontal: 8,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: GLASS_70,
  },
});
