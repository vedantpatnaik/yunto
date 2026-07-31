import { useMemo, useState, type ComponentProps } from "react";
import { Pressable, StyleSheet, TextInput, View } from "react-native";
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
import { useAgencies, useLeads, useUsers, type Lead } from "../../../src/api/hooks";

/**
 * Lead History — Figma 7358:27046 (375x875).
 *
 * The archive view over the pipeline: glass header, the "Search & Filters"
 * block at y=106 (search field + All / Contacted / Won / Lost segmented pill)
 * and the stack of three tinted lead cards at y=242 / 408 / 590. This is the
 * only frame in the flow carrying a search field, so the query and the tab both
 * narrow the live `/leads` collection client-side — the CRUD router exposes no
 * `q` parameter today (server/src/lib/crud.ts).
 *
 * Coordinates below are raw frame coordinates; <Screen> scales the 375pt canvas.
 */

/* ------------------------------- geometry -------------------------------- */
const FRAME_W = 375;
const FRAME_H = 875;

const CARD_X = 20;
const CARD_W = 335;
const PAD = 16; // card padding box
const CONTENT_W = 303; // 335 - 16 - 16
/** Left column stops short of the right-anchored money pill (rel x 267.55). */
const NAME_W = 240;

/* --------------------------- spec colour tokens --------------------------- */
const INK = "#1d1d1f";
const META = "#6e6e73";
const PLACEHOLDER = "#9ca3af";
const TAB_ON = "#2d2d30";
const TAB_OFF = "#6b7280";
const BACK_ICON = "#1c1c1e";
const GLASS_70 = "rgba(255,255,255,0.7)";
const GLASS_65 = "rgba(255,255,255,0.65)";
const GLASS_60 = "rgba(255,255,255,0.6)";
const GLASS_40 = "rgba(255,255,255,0.4)";
const BORDER_90 = "rgba(255,255,255,0.9)";
const BORDER_80 = "rgba(255,255,255,0.8)";
const BORDER_60 = "rgba(255,255,255,0.6)";
const BORDER_50 = "rgba(255,255,255,0.5)";

type IconName = ComponentProps<typeof Feather>["name"];

/* --------------------------------- tabs ----------------------------------- */
type TabKey = "all" | "contacted" | "won" | "lost";

interface Tab {
  key: TabKey;
  label: string;
  x: number;
  w: number;
  /** Text offsets, relative to the tab box. */
  tx: number;
  ty: number;
  tw: number;
}

const TABS: readonly Tab[] = [
  { key: "all", label: "All", x: 25, w: 82.75, tx: 32.61, ty: 11, tw: 17.52 },
  { key: "contacted", label: "Contacted", x: 107.75, w: 80.75, tx: 5.16, ty: 10, tw: 70.44 },
  { key: "won", label: "Won", x: 188.5, w: 80.75, tx: 25.04, ty: 10, tw: 30.67 },
  { key: "lost", label: "Lost", x: 269.25, w: 80.75, tx: 25.84, ty: 10, tw: 29.08 },
];

/* ----------------------------- card treatments ---------------------------- */
/**
 * The frame ships three card tints, each paired with a status chip and an
 * action-icon set (contact actions while the lead is live, document actions
 * once it is won). Tint, chip and icons therefore follow the lead's real
 * status rather than its row position.
 */
interface Treatment {
  label: string;
  chipBg: string;
  chipInk: string;
  from: string;
  to: string;
  icons: readonly IconName[];
}

const NEEDS_RESPONSE: Treatment = {
  label: "NEEDS RESPONSE",
  chipBg: "#fee0b8",
  chipInk: "#c07c27",
  from: "#fdf0d5",
  to: "#fef9ef",
  icons: ["phone", "message-circle", "instagram"],
};
const CONTACTED: Treatment = {
  label: "CONTACTED",
  chipBg: "#e1d7fa",
  chipInk: "#7a54b8",
  from: "#f1eafa",
  to: "#f9f6fc",
  icons: ["phone", "message-circle", "more-horizontal"],
};
const WON: Treatment = {
  label: "WON",
  chipBg: "#c4d8fe",
  chipInk: "#2e60d1",
  from: "#e8f0fc",
  to: "#f4f8fe",
  icons: ["file-text", "more-horizontal"],
};

function treatmentOf(status: string): Treatment {
  if (status === "CONTACTED") return CONTACTED;
  if (status === "CONVERTED") return WON;
  // DEAD reads as the tab's "Lost"; the frame ships no fourth tint, so it wears
  // the warm treatment.
  if (status === "DEAD") return { ...NEEDS_RESPONSE, label: "LOST" };
  return NEEDS_RESPONSE;
}

/* ------------------------------- row slots -------------------------------- */
/**
 * Row geometry is fixed by the frame: card one is 154 tall (one-line subtitle),
 * cards two and three 170 (two lines), stacked with a 12pt gap.
 */
interface Slot {
  y: number;
  h: number;
  subLines: number;
  chipY: number;
  btnY: number;
}

const SLOTS: readonly Slot[] = [
  { y: 242, h: 154, subLines: 1, chipY: 66, btnY: 102 },
  { y: 408, h: 170, subLines: 2, chipY: 82, btnY: 118 },
  { y: 590, h: 170, subLines: 2, chipY: 82, btnY: 118 },
];

/* ------------------------------ derivations ------------------------------- */
/** "2 hrs ago" / "1 day ago" / "3 days ago", matching the frame's meta line. */
function ago(iso?: string): string {
  if (!iso) return "";
  const ms = Date.now() - new Date(iso).getTime();
  if (!Number.isFinite(ms)) return "";
  const mins = Math.max(1, Math.round(ms / 60_000));
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs} ${hrs === 1 ? "hr" : "hrs"} ago`;
  const days = Math.round(hrs / 24);
  return `${days} ${days === 1 ? "day" : "days"} ago`;
}

interface Row {
  id: string;
  name: string;
  subtitle: string;
  money: string;
  meta: string;
  treatment: Treatment;
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

/* ------------------------------- lead card -------------------------------- */
function LeadCard({ row, slot }: { row: Row; slot: Slot }) {
  const t = row.treatment;
  return (
    <Abs
      x={CARD_X}
      y={slot.y}
      w={CARD_W}
      h={slot.h}
      radius={20}
      border={BORDER_60}
      borderWidth={1}
      style={styles.card}
    >
      <LinearGradient
        colors={[t.from, t.to] as const}
        start={{ x: 0.14, y: -0.29 }}
        end={{ x: 0.86, y: 1.29 }}
        style={StyleSheet.absoluteFill}
      />

      <Txt
        x={PAD}
        y={PAD}
        w={NAME_W}
        size={16}
        weight="bold"
        font="inter"
        color={INK}
        lineHeight={19.36}
        numberOfLines={1}
      >
        {row.name}
      </Txt>
      <Txt
        x={PAD}
        y={38}
        w={NAME_W}
        size={13}
        weight="medium"
        font="inter"
        color={META}
        lineHeight={15.73}
        numberOfLines={slot.subLines}
      >
        {row.subtitle}
      </Txt>

      {/* Money pill — right-anchored at the padding box edge (rel x 319). */}
      <View style={styles.money}>
        <Txt size={14} weight="bold" font="inter" color={INK} lineHeight={16.94} numberOfLines={1}>
          {row.money}
        </Txt>
      </View>

      {/* Status chip + managed-by meta */}
      <Abs x={PAD} y={slot.chipY} w={CONTENT_W} h={20} row gap={8}>
        <View style={[styles.chip, { backgroundColor: t.chipBg }]}>
          <Txt size={10} weight="bold" font="inter" color={t.chipInk} lineHeight={12.1}>
            {t.label}
          </Txt>
        </View>
        <Txt
          size={12}
          weight="medium"
          font="inter"
          color={META}
          lineHeight={14.52}
          numberOfLines={1}
          style={styles.meta}
        >
          {row.meta}
        </Txt>
      </Abs>

      {/* Action buttons */}
      {t.icons.map((icon, i) => (
        <View key={icon} style={[styles.action, { left: PAD + i * 44, top: slot.btnY }]}>
          <Feather name={icon} size={16} color={INK} />
        </View>
      ))}
    </Abs>
  );
}

/* --------------------------------- screen --------------------------------- */
export default function LeadHistory() {
  const router = useRouter();
  const [tab, setTab] = useState<TabKey>("all");
  const [query, setQuery] = useState("");

  const { data: leads = [], isLoading } = useLeads();
  const { data: users = [] } = useUsers();
  const { data: agencies = [] } = useAgencies();

  const rows = useMemo<Row[]>(() => {
    const userById = new Map(users.map((u) => [u.id, u.name]));
    const agencyById = new Map(agencies.map((a) => [a.id, a.name]));
    const q = query.trim().toLowerCase();

    const matchesTab = (l: Lead) =>
      tab === "all"
        ? true
        : tab === "contacted"
          ? l.status === "CONTACTED"
          : tab === "won"
            ? l.status === "CONVERTED"
            : l.status === "DEAD";

    const matchesQuery = (l: Lead) =>
      q.length === 0 ||
      l.brandName.toLowerCase().includes(q) ||
      (l.contactPerson ?? "").toLowerCase().includes(q);

    return leads
      .filter((l) => matchesTab(l) && matchesQuery(l))
      .slice(0, SLOTS.length)
      .map((l) => {
        const manager =
          (l.ownerId ? userById.get(l.ownerId) : undefined) ??
          (l.agencyId ? agencyById.get(l.agencyId) : undefined);
        const when = ago(l.updatedAt ?? l.createdAt);
        return {
          id: l.id,
          name: l.contactPerson ?? l.brandName,
          subtitle: l.brandName,
          money: l.money ? `₹${l.money}` : "—",
          meta: manager ? (when ? `Managed by ${manager} • ${when}` : `Managed by ${manager}`) : when,
          treatment: treatmentOf(l.status),
        };
      });
  }, [leads, users, agencies, tab, query]);

  return (
    <Screen height={FRAME_H} background="#F7F0E4" scroll>
      <Backdrop />

      {/* Header */}
      <Pressable
        onPress={() => router.back()}
        style={({ pressed }) => [styles.back, pressed && styles.pressed]}
      >
        <Feather name="arrow-left" size={20} color={BACK_ICON} />
      </Pressable>
      <Txt
        x={100}
        y={30}
        w={154}
        size={16}
        weight="bold"
        font="inter"
        color={INK}
        lineHeight={19.36}
        align="center"
      >
        Lead History
      </Txt>

      {/* Search & Filters — search field */}
      <Abs
        x={20}
        y={106}
        w={335}
        h={45}
        radius={20}
        bg={GLASS_70}
        border={BORDER_80}
        borderWidth={1}
        style={styles.search}
      >
        <Abs x={17} y={13.5} w={18} h={18} center>
          <Feather name="search" size={18} color={PLACEHOLDER} />
        </Abs>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search leads, brands..."
          placeholderTextColor={PLACEHOLDER}
          style={styles.input}
        />
      </Abs>

      {/* Search & Filters — segmented tabs */}
      <Abs
        x={20}
        y={167}
        w={335}
        h={49}
        radius={24}
        bg={GLASS_40}
        border={BORDER_50}
        borderWidth={1}
      />
      {TABS.map((t) => {
        const active = t.key === tab;
        return (
          <Pressable
            key={t.key}
            onPress={() => setTab(t.key)}
            style={[
              styles.tab,
              { left: t.x, width: t.w },
              active && styles.tabActive,
            ]}
          >
            {active ? (
              <LinearGradient
                colors={["rgba(255,255,255,0.9)", "rgba(243,232,255,0.9)"] as const}
                start={{ x: 0.14, y: -0.3 }}
                end={{ x: 0.86, y: 1.3 }}
                style={styles.tabFill}
              />
            ) : null}
            <Txt
              x={t.tx}
              y={t.ty}
              w={t.tw}
              size={14}
              weight="semibold"
              font="inter"
              color={active ? TAB_ON : TAB_OFF}
              lineHeight={16.94}
              align="center"
              numberOfLines={1}
            >
              {t.label}
            </Txt>
          </Pressable>
        );
      })}

      {/* Container — lead card stack */}
      {rows.map((row, i) => (
        <LeadCard key={row.id} row={row} slot={SLOTS[i]} />
      ))}
      {!isLoading && rows.length === 0 ? (
        <Txt
          x={CARD_X + PAD}
          y={SLOTS[0].y + PAD}
          w={CONTENT_W}
          size={13}
          weight="medium"
          font="inter"
          color={META}
          lineHeight={15.73}
        >
          No leads
        </Txt>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  backdrop: { position: "absolute", left: 0, top: 0 },
  pressed: { opacity: 0.9 },

  back: {
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
    borderColor: BORDER_90,
    shadowColor: "#000000",
    shadowOpacity: 0.03,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
  },

  search: {
    shadowColor: "#000000",
    shadowOpacity: 0.03,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  input: {
    position: "absolute",
    left: 45,
    top: 13,
    width: 274,
    height: 19,
    padding: 0,
    fontFamily: "Inter_500Medium",
    fontSize: 15,
    color: INK,
  },

  tab: {
    position: "absolute",
    top: 172,
    height: 39,
    borderRadius: 20,
  },
  tabActive: {
    borderWidth: 1,
    borderColor: colors.white,
    shadowColor: "#000000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  tabFill: {
    position: "absolute",
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
    borderRadius: 20,
  },

  card: {
    overflow: "hidden",
    shadowColor: "#000000",
    shadowOpacity: 0.02,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  money: {
    position: "absolute",
    right: PAD,
    top: PAD,
    height: 25,
    borderRadius: 8,
    paddingHorizontal: 8,
    justifyContent: "center",
    backgroundColor: GLASS_60,
  },
  chip: {
    height: 20,
    borderRadius: 12,
    paddingHorizontal: 8,
    justifyContent: "center",
  },
  meta: { flexShrink: 1 },
  action: {
    position: "absolute",
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: GLASS_70,
    shadowColor: "#000000",
    shadowOpacity: 0.02,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
});
