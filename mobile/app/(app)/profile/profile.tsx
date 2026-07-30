import type { ComponentProps } from "react";
import { useMemo } from "react";
import { Image, Pressable, ScrollView, StyleSheet } from "react-native";
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
import { colors, gradients } from "../../../src/theme";
import { compact, useAgencies, useCreators, useMe } from "../../../src/api/hooks";

/**
 * Profile — Figma 7358:26594 "profile" (375x875).
 *
 * The creator's agency-managed profile hub. Three top-level frames in the spec,
 * reproduced as three layers here:
 *
 *   1. Header             — 375x80, fixed, never scrolls.
 *   2. Frame 2147223262   — (0,106,375x706, clipsContent) whose children run to
 *                           y=1078. It is a clipped viewport, so it owns the
 *                           vertical ScrollView; children keep raw frame
 *                           coordinates via a single -106 offset on the canvas.
 *   3. Logout             — the 345x42 pinned row at y=812, drawn last so it
 *                           sits above the scrolling body.
 *
 * Every coordinate, colour, size and weight below is lifted from the spec;
 * <Screen> scales the 375pt canvas to the device.
 */

/* ------------------------------- geometry -------------------------------- */
const FRAME_W = 375;
const FRAME_H = 875;

const BODY_Y = 106; // Frame 2147223262 origin — the scroll viewport top
const BODY_H = 706; // …and its clipped height
const CONTENT_BOTTOM = 1078; // lower edge of "Section:margin"

/* --------------------------- spec colour tokens --------------------------- */
const INK = "#111111";
const INK_TITLE = "#1d1d1f";
const INK_ROW = "#2b2b28";
const INK_BADGE = "#1a1a1a";
const MUTED = "#777777";
const URL_INK = "#333333";
const URL_ICON = "#888888";
const LEVEL_INK = "#666666";
const CHEVRON = "#8a8a86";
const ROW_LINE = "rgba(234,234,234,0.4)";
const DANGER = "#d9534f";

const GLASS_W60 = "rgba(255,255,255,0.6)";
const GLASS_W65 = "rgba(255,255,255,0.65)";
const BORDER_W40 = "rgba(255,255,255,0.4)";
const BORDER_W50 = "rgba(255,255,255,0.5)";
const BORDER_W90 = "rgba(255,255,255,0.9)";

const TRACK = "rgba(0,0,0,0.06)";
const LEVEL_DONE = "#a88beb";
const LEVEL_NOW = "#e6a7cc";
const LEVEL_TODO = "#e0e0e0";
const DOT_RING = "#fdfbf7";

/* ------------------------------ level system ------------------------------ */
/**
 * The design ships the 5-dot ladder at level 2 and the schema carries no level
 * field, so the current step stays the spec literal — the dot treatment is
 * derived from it so the badge copy and the ladder cannot drift apart.
 */
const LEVEL = 2;
const LEVEL_DOTS = [
  { x: 23, size: 12 },
  { x: 100.25, size: 20 }, // the "current" dot is 20pt with a 3pt white ring
  { x: 185.5, size: 12 },
  { x: 262.75, size: 12 },
  { x: 340, size: 12 },
];

/* ------------------------------ settings list ----------------------------- */
type FeatherName = ComponentProps<typeof Feather>["name"];

interface SettingRow {
  y: number;
  chip: string;
  ink: string;
  icon: FeatherName;
  label: string;
  labelW: number;
  route: string;
  /** Every row but the last carries a 1pt bottom rule. */
  rule: boolean;
  h: number;
}

const SETTING_ROWS: SettingRow[] = [
  {
    y: 654, chip: "rgba(234,221,255,0.4)", ink: "#6b4ba3", icon: "user",
    label: "personal information", labelW: 185,
    route: "/profile/personal-information", rule: true, h: 83,
  },
  {
    y: 737, chip: "rgba(209,244,224,0.4)", ink: "#3b8a5a", icon: "globe",
    label: "landing page", labelW: 95.47,
    route: "/profile/landing-page", rule: true, h: 83,
  },
  {
    y: 820, chip: "rgba(255,230,213,0.4)", ink: "#b36b39", icon: "file-text",
    label: "invoicing", labelW: 66.94,
    route: "/profile/invoicing", rule: true, h: 83,
  },
  {
    y: 903, chip: "rgba(255,255,193,0.68)", ink: "#a0a007", icon: "briefcase",
    label: "agency setting", labelW: 111.31,
    route: "/profile/agency-setting", rule: true, h: 83,
  },
  {
    y: 986, chip: "rgba(255,218,214,0.3)", ink: "#ba403a", icon: "mail",
    label: "leads contact", labelW: 103.03,
    route: "/profile/leads-contact", rule: false, h: 82,
  },
];

/* -------------------------------- backdrop -------------------------------- */
/** The frame fill: a warm vertical base plus four soft radial glows. */
function Backdrop() {
  return (
    <Svg width={FRAME_W} height={FRAME_H} style={styles.backdrop}>
      <Defs>
        <SvgLinear id="pbase" x1="187.5" y1="0" x2="187.5" y2={FRAME_H} gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#F7F0E4" />
          <Stop offset="1" stopColor="#F4EBDD" />
        </SvgLinear>
        <RadialGradient id="ppink" cx="285" cy="542.5" rx="1027.5" ry="568.75" gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#F7B7DA" stopOpacity="0.34" />
          <Stop offset="0.26" stopColor="#F7B7DA" stopOpacity="0" />
        </RadialGradient>
        <RadialGradient id="pblue" cx="90" cy="367.5" rx="967.5" ry="533.75" gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#BACDF4" stopOpacity="0.36" />
          <Stop offset="0.24" stopColor="#BACDF4" stopOpacity="0" />
        </RadialGradient>
        <RadialGradient id="pgold" cx="292.5" cy="157.5" rx="1338.75" ry="735" gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#F6D64A" stopOpacity="0.22" />
          <Stop offset="0.2" stopColor="#F6D64A" stopOpacity="0" />
        </RadialGradient>
        <RadialGradient id="phaze" cx="75" cy="87.5" rx="1466.25" ry="805" gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#FFFFFF" stopOpacity="0.72" />
          <Stop offset="0.24" stopColor="#FFFFFF" stopOpacity="0" />
        </RadialGradient>
      </Defs>
      <Rect width={FRAME_W} height={FRAME_H} fill="url(#pbase)" />
      <Rect width={FRAME_W} height={FRAME_H} fill="url(#ppink)" />
      <Rect width={FRAME_W} height={FRAME_H} fill="url(#pblue)" />
      <Rect width={FRAME_W} height={FRAME_H} fill="url(#pgold)" />
      <Rect width={FRAME_W} height={FRAME_H} fill="url(#phaze)" />
    </Svg>
  );
}

/* ------------------------------- settings row ----------------------------- */
function SettingsRow({ row, onPress }: { row: SettingRow; onPress: () => void }) {
  return (
    <Abs
      x={15}
      y={row.y}
      w={345}
      h={row.h}
      style={row.rule ? { borderBottomWidth: 1, borderBottomColor: ROW_LINE } : null}
    >
      <Pressable onPress={onPress} style={StyleSheet.absoluteFill}>
        <Abs x={0} y={20} w={42} h={42} radius={21} bg={row.chip} center>
          <Feather name={row.icon} size={18} color={row.ink} />
        </Abs>
        <Txt
          x={58}
          y={29}
          w={row.labelW}
          size={16}
          weight="bold"
          color={INK_ROW}
          lineHeight={24}
          letterSpacing={-0.4}
          numberOfLines={1}
        >
          {row.label}
        </Txt>
        <Abs x={329} y={33} w={16} h={16} opacity={0.5} center>
          <Feather name="chevron-right" size={16} color={CHEVRON} />
        </Abs>
      </Pressable>
    </Abs>
  );
}

/* --------------------------------- screen --------------------------------- */
export default function Profile() {
  const router = useRouter();

  const { data: me } = useMe();
  const { data: creators = [] } = useCreators();
  const { data: agencies = [] } = useAgencies();

  /** The signed-in creator's own row in the roster. */
  const creator = useMemo(
    () => creators.find((c) => c.name === me?.name) ?? creators[0],
    [creators, me],
  );

  const agency = useMemo(
    () => agencies.find((a) => a.id === creator?.agencyId),
    [agencies, creator],
  );

  /** "+35% above avg" — this creator's engagement measured against the roster. */
  const growthPct = useMemo(() => {
    if (!creator || creators.length === 0) return null;
    const avg =
      creators.reduce((sum, c) => sum + c.engagementRate, 0) / creators.length;
    if (avg <= 0) return null;
    return Math.round((creator.engagementRate / avg - 1) * 100);
  }, [creators, creator]);

  const displayName = me?.name ?? creator?.name ?? "Sophia Roy";
  const avatarUrl = me?.avatarUrl ?? creator?.avatarUrl;
  const agencyName = agency?.name ?? "Socyio Agency";

  /** The public landing page: the agency's host plus the creator's slug. */
  const landingUrl = `${agency?.website ?? "Stellartalent.com"}/${displayName
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")}`;

  return (
    <Screen height={FRAME_H} background="#F7F0E4" scroll>
      <Backdrop />

      {/* ==================== body — Frame 2147223262 ==================== */}
      <Abs x={0} y={BODY_Y} w={FRAME_W} h={BODY_H} style={styles.clip}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled
          contentContainerStyle={{ height: CONTENT_BOTTOM - BODY_Y }}
        >
          {/* One -106 offset, so everything below keeps raw frame coordinates. */}
          <Abs x={0} y={-BODY_Y} w={FRAME_W} h={CONTENT_BOTTOM}>
            {/* ------------- 1. Floating Identity Block (106 → 415) ------------- */}
            <Abs x={15} y={116} w={105} h={105} radius={52.5} style={styles.clip}>
              <LinearGradient
                colors={gradients.avatarA}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
              />
              {avatarUrl ? (
                <Image source={{ uri: avatarUrl }} style={styles.avatar} />
              ) : null}
            </Abs>

            {/* streak badge */}
            <Abs x={94} y={193} w={34} h={34} radius={17} bg={colors.white} center style={styles.badge}>
              <Txt size={16} color={INK_BADGE} lineHeight={19.2} align="center">
                🔥
              </Txt>
            </Abs>

            <Txt
              x={15}
              y={241}
              w={163}
              size={28}
              weight="bold"
              color={INK}
              lineHeight={35.73}
              letterSpacing={-0.5}
              numberOfLines={1}
            >
              {displayName}
            </Txt>

            <Txt
              x={15}
              y={279}
              w={108}
              size={15}
              weight="medium"
              font="inter"
              color={MUTED}
              lineHeight={18.15}
              numberOfLines={1}
            >
              {creator ? `${compact(creator.followers).toUpperCase()} Followers` : "Followers"}
            </Txt>

            {/* growth pills */}
            <Abs x={15} y={318} w={137.61} h={32} radius={20} bg="rgba(220,245,230,0.7)">
              <Txt
                x={16}
                y={8}
                w={105.61}
                size={13}
                weight="semibold"
                font="inter"
                color="#2a7347"
                lineHeight={15.73}
                numberOfLines={1}
              >
                {growthPct === null
                  ? "above avg"
                  : `${growthPct >= 0 ? "+" : ""}${growthPct}% above avg`}
              </Txt>
            </Abs>
            <Abs x={160.61} y={318} w={164.91} h={32} radius={20} bg="rgba(235,225,250,0.7)">
              <Txt
                x={16}
                y={8}
                w={132.91}
                size={13}
                weight="semibold"
                font="inter"
                color="#6b4c9a"
                lineHeight={15.73}
                numberOfLines={1}
              >
                Suggestion: Increase
              </Txt>
            </Abs>

            {/* landing-page URL button */}
            <Pressable
              onPress={() => router.push("/profile/landing-page")}
              style={styles.urlButton}
            >
              <Abs x={17} y={11.5} w={16} h={16} center>
                <Feather name="link" size={16} color={URL_ICON} />
              </Abs>
              <Txt
                x={41}
                y={11}
                w={231}
                size={14}
                weight="semibold"
                font="inter"
                color={URL_INK}
                lineHeight={16.94}
                numberOfLines={1}
              >
                {landingUrl}
              </Txt>
              <Abs x={282} y={11.5} w={16} h={16} center>
                <Feather name="copy" size={16} color={URL_ICON} />
              </Abs>
            </Pressable>

            {/* ------------ 2. Management + Contact (433 → 527) ------------- */}
            <Abs
              x={15}
              y={457}
              w={269}
              h={70}
              radius={24}
              bg={GLASS_W60}
              border={BORDER_W40}
              borderWidth={1}
              style={styles.manageCard}
            >
              <Abs x={17} y={13} w={44} h={44} radius={22} bg="#c4c4c4" style={styles.clip} />
              <Txt
                x={73}
                y={17}
                w={109.63}
                size={12}
                weight="medium"
                font="inter"
                color={MUTED}
                lineHeight={14.52}
                numberOfLines={1}
              >
                Managed by
              </Txt>
              <Txt
                x={73}
                y={34}
                w={109.63}
                size={15}
                weight="bold"
                font="inter"
                color={INK}
                lineHeight={18.15}
                numberOfLines={1}
              >
                {agencyName}
              </Txt>
            </Abs>

            <Pressable
              onPress={() => router.push("/profile/agency-setting")}
              style={styles.contactButton}
            >
              <Feather name="phone" size={24} color={colors.white} />
            </Pressable>

            {/* ---------------- 3. Level System (545 → 636) ----------------- */}
            <Abs x={29} y={583} w={317} h={4} radius={2} bg={TRACK} style={styles.clip}>
              <Abs x={0} y={0} w={79.25} h={4} radius={2} style={styles.clip}>
                <LinearGradient
                  colors={[LEVEL_DONE, LEVEL_NOW] as const}
                  start={{ x: 0, y: 0.5 }}
                  end={{ x: 1, y: 0.5 }}
                  style={StyleSheet.absoluteFill}
                />
              </Abs>
            </Abs>

            {LEVEL_DOTS.map((dot, i) =>
              i === LEVEL - 1 ? (
                <Abs
                  key={dot.x}
                  x={dot.x}
                  y={575}
                  w={dot.size}
                  h={dot.size}
                  radius={dot.size / 2}
                  bg={LEVEL_NOW}
                  border={colors.white}
                  borderWidth={3}
                  style={styles.dotGlow}
                />
              ) : (
                <Abs
                  key={dot.x}
                  x={dot.x}
                  y={579}
                  w={dot.size}
                  h={dot.size}
                  radius={dot.size / 2}
                  bg={i < LEVEL - 1 ? LEVEL_DONE : LEVEL_TODO}
                  border={DOT_RING}
                  borderWidth={2}
                />
              ),
            )}

            <Txt
              x={23}
              y={617}
              w={125.14}
              size={15}
              weight="bold"
              font="inter"
              color={INK}
              lineHeight={18.15}
              numberOfLines={1}
            >
              {`You're on Level ${LEVEL}`}
            </Txt>

            <Pressable onPress={() => router.push("/profile/levels")} style={styles.exploreLevels}>
              <Txt
                y={0}
                w={93.7}
                size={14}
                weight="semibold"
                font="inter"
                color={LEVEL_INK}
                lineHeight={16.94}
                numberOfLines={1}
              >
                Explore levels
              </Txt>
              <Abs x={99.7} y={0.5} w={16} h={16} center>
                <Feather name="chevron-right" size={16} color={LEVEL_INK} />
              </Abs>
            </Pressable>

            {/* ------------- 4. Section — settings list (654 → 1068) -------- */}
            {SETTING_ROWS.map((row) => (
              <SettingsRow key={row.label} row={row} onPress={() => router.push(row.route)} />
            ))}
          </Abs>
        </ScrollView>
      </Abs>

      {/* ============================== header ============================== */}
      <Pressable onPress={() => router.back()} style={styles.backButton}>
        <Feather name="chevron-left" size={20} color="#1c1c1e" />
      </Pressable>
      <Txt
        x={100}
        y={30}
        w={187}
        size={16}
        weight="bold"
        font="inter"
        color={INK_TITLE}
        lineHeight={19.36}
        align="center"
        numberOfLines={1}
      >
        Profile
      </Txt>

      {/* ============================== logout ============================== */}
      <Pressable onPress={() => router.push("/profile/log-out")} style={styles.logout}>
        <Txt
          y={8}
          w={50.63}
          size={15}
          weight="semibold"
          font="inter"
          color={DANGER}
          lineHeight={18.15}
          align="center"
        >
          Logout
        </Txt>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  backdrop: { position: "absolute", left: 0, top: 0 },
  clip: { overflow: "hidden" },

  /* --- identity block --- */
  avatar: { position: "absolute", left: 0, top: 0, width: 105, height: 105, borderRadius: 52.5 },
  badge: {
    shadowColor: "#000000",
    shadowOpacity: 0.1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  urlButton: {
    position: "absolute",
    left: 15,
    top: 366,
    width: 311,
    height: 39,
    borderRadius: 24,
    backgroundColor: GLASS_W60,
    borderWidth: 1,
    borderColor: BORDER_W50,
    shadowColor: "#000000",
    shadowOpacity: 0.03,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },

  /* --- management + contact --- */
  manageCard: {
    shadowColor: "#000000",
    shadowOpacity: 0.03,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
    elevation: 2,
  },
  contactButton: {
    position: "absolute",
    left: 300,
    top: 462,
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#111111",
    shadowColor: "#111111",
    shadowOpacity: 0.2,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 6,
  },

  /* --- level system --- */
  dotGlow: {
    shadowColor: LEVEL_NOW,
    shadowOpacity: 0.8,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 0 },
    elevation: 2,
  },
  exploreLevels: {
    position: "absolute",
    left: 236.3,
    top: 618,
    width: 115.7,
    height: 17,
  },

  /* --- header --- */
  backButton: {
    position: "absolute",
    left: 15,
    top: 18,
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: GLASS_W65,
    borderWidth: 1,
    borderColor: BORDER_W90,
    shadowColor: "#000000",
    shadowOpacity: 0.03,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },

  /* --- pinned logout --- */
  logout: {
    position: "absolute",
    left: 27,
    top: 824,
    width: 50.63,
    height: 35,
    opacity: 0.9,
  },
});
