import { useMemo, useState } from "react";
import { Image, Pressable, StyleSheet, View } from "react-native";
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
import { useCampaigns, useCreators } from "../../../src/api/hooks";

/**
 * All Requests — Figma 7333:16578 (375x875).
 *
 * Collaboration-request inbox: creators who have requested or been matched to
 * the influencer's campaigns. Traced 1:1 — glass header, floating segmented
 * Accepted / Pending / History filter, a clipped column of 335x214 glass person
 * cards and the floating "Browse more" pill. Coordinates below are raw frame
 * coordinates from the spec; <Screen> scales the 375pt canvas to the device.
 */

/* ------------------------------- geometry -------------------------------- */
const FRAME_W = 375;
const FRAME_H = 875;

const LIST_Y = 194; // "Main - Campaign Cards" frame origin
const LIST_H = 587;
const CARD_TOP = 12; // frame padding-top
const CARD_STEP = 230; // 214 card + 16 stack gap
const MAX_CARDS = 3; // 12 + 2*230 = 472, the last row the clipped frame holds

/* --------------------------- spec colour tokens --------------------------- */
const INK_TITLE = "#1D1D1F";
const INK_NAME = "#1A1A1A";
const INK_META = "#555555";
const INK_ICON = "#888888";
const INK_TAB_IDLE = "#777777";
const ROLE_CHIP_BG = "#E9E1F3";
const ROLE_CHIP_INK = "#9333EA";
const STATUS_CHIP_BG = "#E8F5EE";
const STATUS_CHIP_INK = "#2D8A55";
const CHAT_BG = "#312B28";

/* --------------------------------- tabs ----------------------------------- */
type Tab = "accepted" | "pending" | "history";

/** Pill-relative x (the container's 1pt stroke insets the padding box by 1). */
const TABS: { key: Tab; label: string; x: number; w: number; tx: number; tw: number }[] = [
  { key: "accepted", label: "Accepted", x: 6, w: 129, tx: 18, tw: 93 },
  { key: "pending", label: "Pending", x: 140, w: 109, tx: 16, tw: 77 },
  { key: "history", label: "History", x: 253, w: 81, tx: -14, tw: 109 },
];

/** Campaign lifecycle -> the inbox bucket the request belongs to. */
const TAB_OF_STATUS: Record<string, Tab> = {
  ACTIVE: "accepted",
  DRAFT: "pending",
  DONE: "history",
};

const STATUS_LABEL: Record<Tab, string> = {
  accepted: "Accepted",
  pending: "Pending",
  history: "History",
};

interface RequestRow {
  id: string;
  name: string;
  avatarUrl?: string;
  role: string;
  status: string;
  campaign: string;
  deadline: string;
  tab: Tab;
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

/* ------------------------------ request card ------------------------------ */
interface CardProps {
  top: number;
  row: RequestRow;
  onPortfolio: () => void;
  onChat: () => void;
}

/**
 * 335x214 glass person card. Child offsets are card-relative and already
 * account for the 1pt stroke, which insets the padding box by a point a side.
 */
function RequestCard({ top, row, onPortfolio, onChat }: CardProps) {
  return (
    <Abs x={20} y={top} w={335} h={214} radius={24} border="#FFFFFF" borderWidth={1} style={styles.card}>
      <LinearGradient
        colors={["rgba(255,255,255,0.9)", "rgba(255,255,255,0.5)"] as const}
        start={{ x: 0.1, y: -0.07 }}
        end={{ x: 0.9, y: 1.07 }}
        style={styles.cardFill}
      />
      <LinearGradient
        colors={["rgba(232,245,233,0.3)", "rgba(232,245,233,0)"] as const}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.cardSheen}
      />

      {/* Avatar */}
      <Abs x={20} y={20} w={64} h={64} radius={32} bg="rgba(196,196,196,0.62)" style={styles.clip}>
        {row.avatarUrl ? <Image source={{ uri: row.avatarUrl }} style={styles.avatar} /> : null}
      </Abs>

      {/* Name + chips */}
      <Txt
        x={100}
        y={24.5}
        w={213}
        size={18}
        weight="bold"
        font="inter"
        color={INK_NAME}
        lineHeight={21.6}
        numberOfLines={1}
      >
        {row.name}
      </Txt>
      <Abs x={100} y={54.5} h={25} row gap={6}>
        <View style={[styles.chip, { backgroundColor: ROLE_CHIP_BG }]}>
          <Txt size={12} weight="semibold" font="inter" color={ROLE_CHIP_INK} lineHeight={14.52}>
            {row.role}
          </Txt>
        </View>
        <View style={[styles.chip, { backgroundColor: STATUS_CHIP_BG }]}>
          <Txt size={12} weight="semibold" font="inter" color={STATUS_CHIP_INK} lineHeight={14.52}>
            {row.status}
          </Txt>
        </View>
      </Abs>

      {/* Meta rows */}
      <Abs x={20} y={100.5}>
        <Feather name="briefcase" size={15} color={INK_ICON} />
      </Abs>
      <Txt
        x={43}
        y={100}
        w={270}
        size={13}
        weight="medium"
        font="inter"
        color={INK_META}
        lineHeight={15.73}
        numberOfLines={1}
      >
        Campaign: {row.campaign}
      </Txt>
      <Abs x={20} y={124.5}>
        <Feather name="calendar" size={15} color={INK_ICON} />
      </Abs>
      <Txt
        x={43}
        y={124}
        w={270}
        size={13}
        weight="medium"
        font="inter"
        color={INK_META}
        lineHeight={15.73}
        numberOfLines={1}
      >
        Deadline: {row.deadline}
      </Txt>

      {/* Footer buttons */}
      <Pressable
        onPress={onPortfolio}
        style={({ pressed }) => [styles.portfolioButton, pressed && styles.pressed]}
      >
        <Txt
          x={24}
          y={10}
          w={77}
          size={14}
          weight="semibold"
          font="inter"
          color={INK_NAME}
          lineHeight={16.94}
          align="center"
        >
          Portfolio
        </Txt>
      </Pressable>
      <Pressable onPress={onChat} style={({ pressed }) => [styles.chatButton, pressed && styles.pressed]}>
        <Txt
          x={24}
          y={10}
          w={77}
          size={14}
          weight="semibold"
          font="inter"
          color={colors.white}
          lineHeight={16.94}
          align="center"
        >
          Open Chat
        </Txt>
      </Pressable>
    </Abs>
  );
}

/* --------------------------------- screen --------------------------------- */
export default function AllRequests() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("accepted");
  const { data: creators = [], isLoading } = useCreators();
  const { data: campaigns = [] } = useCampaigns();

  const { counts, rows } = useMemo(() => {
    // A request pairs the creator who asked to collaborate with the campaign
    // they were matched to; the campaign's lifecycle drives the inbox bucket.
    const all: RequestRow[] = creators.map((c, i) => {
      const campaign = campaigns.length ? campaigns[i % campaigns.length] : undefined;
      const bucket = TAB_OF_STATUS[campaign?.status ?? "ACTIVE"] ?? "accepted";
      return {
        id: c.id,
        name: c.name,
        avatarUrl: c.avatarUrl,
        role: c.niche ?? "Videographer",
        status: STATUS_LABEL[bucket],
        campaign: campaign?.name ?? "",
        deadline: campaign?.timeline ?? "",
        tab: bucket,
      };
    });

    return {
      counts: {
        accepted: all.filter((r) => r.tab === "accepted").length,
        pending: all.filter((r) => r.tab === "pending").length,
        history: all.filter((r) => r.tab === "history").length,
      } as Record<Tab, number>,
      rows: all.filter((r) => r.tab === tab).slice(0, MAX_CARDS),
    };
  }, [creators, campaigns, tab]);

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
        weight="bold"
        font="inter"
        color={INK_TITLE}
        lineHeight={19.36}
        align="center"
      >
        All Requests
      </Txt>

      {/* Floating Segmented Filter */}
      <Abs
        x={15}
        y={116}
        w={345}
        h={50}
        radius={30}
        bg="rgba(255,255,255,0.6)"
        border="rgba(255,255,255,0.8)"
        borderWidth={1}
        style={[styles.clip, styles.filterShadow]}
      >
        {TABS.map((t) => {
          const active = t.key === tab;
          return (
            <Pressable
              key={t.key}
              onPress={() => setTab(t.key)}
              style={[styles.tab, { left: t.x, width: t.w }, active && styles.tabActive]}
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
                x={t.tx}
                y={10}
                w={t.tw}
                size={14}
                weight="medium"
                font="inter"
                color={active ? colors.white : INK_TAB_IDLE}
                lineHeight={16.94}
                align="center"
              >
                {active ? `${t.label}  (${counts[t.key]})` : t.label}
              </Txt>
            </Pressable>
          );
        })}
      </Abs>

      {/* Main - Campaign Cards */}
      <Abs x={0} y={LIST_Y} w={FRAME_W} h={LIST_H} style={styles.clip}>
        {rows.map((r, i) => (
          <RequestCard
            key={r.id}
            top={CARD_TOP + i * CARD_STEP}
            row={r}
            onPortfolio={() => router.push(`/creators/${r.id}` as never)}
            onChat={() => router.push(`/chat/${r.id}` as never)}
          />
        ))}
        {!isLoading && rows.length === 0 ? (
          <Txt x={40} y={32} w={293} size={13} weight="medium" font="inter" color={INK_META} lineHeight={15.73}>
            No requests
          </Txt>
        ) : null}
      </Abs>

      {/* Bottom Floating Browse Button */}
      <Pressable
        onPress={() => router.push("/creators" as never)}
        style={({ pressed }) => [styles.browseButton, pressed && styles.pressed]}
      >
        <Txt
          x={20}
          y={16.5}
          w={88}
          size={14}
          weight="medium"
          font="inter"
          color={INK_NAME}
          lineHeight={16.94}
          align="center"
        >
          Browse more
        </Txt>
        <Abs x={122} y={16}>
          <Feather name="search" size={18} color={INK_ICON} />
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

  filterShadow: {
    shadowColor: "#000000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  tab: {
    position: "absolute",
    top: 6,
    height: 36,
    borderRadius: 24,
    overflow: "hidden",
  },
  tabActive: {
    shadowColor: "#000000",
    shadowOpacity: 0.12,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  tabFill: { position: "absolute", left: 0, top: 0, right: 0, bottom: 0 },

  card: {
    overflow: "hidden",
    shadowColor: "#000000",
    shadowOpacity: 0.03,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 10 },
    elevation: 2,
  },
  cardFill: { position: "absolute", left: 0, top: 0, width: 333, height: 212, borderRadius: 24 },
  cardSheen: { position: "absolute", left: 0, top: 0, width: 333, height: 211.59, borderRadius: 24 },
  avatar: { width: 64, height: 64, borderRadius: 32 },
  chip: {
    height: 25,
    borderRadius: 24,
    justifyContent: "center",
    paddingHorizontal: 12,
  },

  portfolioButton: {
    position: "absolute",
    left: 20,
    top: 156,
    width: 137,
    height: 36,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.6)",
    borderWidth: 1,
    borderColor: "rgba(232,232,232,0.62)",
  },
  chatButton: {
    position: "absolute",
    left: 176,
    top: 156,
    width: 137,
    height: 36,
    borderRadius: 20,
    backgroundColor: CHAT_BG,
  },

  browseButton: {
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
