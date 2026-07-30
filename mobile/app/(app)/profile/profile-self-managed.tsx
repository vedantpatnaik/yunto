import { useMemo } from "react";
import type { ComponentProps } from "react";
import { Image, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Svg, {
  Defs,
  LinearGradient as SvgLinear,
  RadialGradient,
  Rect,
  Stop,
} from "react-native-svg";
import { Abs, Ring, Screen, Txt } from "../../../src/ui/Frame";
import { compact, useAgencies, useCreators } from "../../../src/api/hooks";

/**
 * Profile — self managed — Figma 7502:44174 (375x875).
 *
 * The same profile hub as the agency-managed variant, in the state where the
 * creator has no agency attached: the "Managed by" card reads Self and the
 * public landing page lives on the Socyio domain rather than the agency's.
 *
 * Frame structure, straight from the spec:
 *   Header              y=0   h=80   — back disc + centred "Profile"
 *   Frame 2147223262    y=106 h=706  — clipsContent:true, holds 972pt of stack
 *     Floating Identity y=106 h=309
 *     Management+Contact y=433 h=94
 *     Level System      y=545 h=91
 *     Section:margin    y=654 h=424  — five menu rows, overflows the clip
 *   Logout              y=812 h=42
 *
 * Because the design's own container clips at y=812 while its children run to
 * y=1078, that container is reproduced as a real scroll region: every node keeps
 * its exact frame coordinate and the overflowing menu rows stay reachable.
 */

/* ------------------------------- geometry -------------------------------- */
const FRAME_W = 375;
const FRAME_H = 875;

/** "Frame 2147223262" — the clipping stack. Children are drawn at spec y - IY. */
const IY = 106;
const INNER_H = 706;
/** Section:margin ends at 1078 (h=424 from y=654), so the stack is 972 tall. */
const INNER_CONTENT_H = 972;

/* Level System — 5 markers laid out SPACE_BETWEEN inside a 329pt row. */
const LEVELS = 5;
const DOT_X0 = 23;
const DOT_GAP = 65.25;
const DOT_SM = 12;
const DOT_LG = 20;
const TRACK_X = 29;
const TRACK_W = 317;
const TRACK_Y = 583 - IY;

/* Section rows — 345x83 at y = 654 + i*83; the last one is 82 with no rule. */
const ROW_X = 15;
const ROW_W = 345;
const ROW_Y0 = 654;
const ROW_STEP = 83;
const TILE_OFF_Y = 20;
const TILE_SIZE = 42;
const ROW_LABEL_X = 73 - ROW_X;
const ROW_LABEL_Y = 29;
const ROW_CHEV_X = 344 - ROW_X;
const ROW_CHEV_Y = 33;

/* --------------------------- spec colour tokens --------------------------- */
const INK_TITLE = "#1D1D1F";
const INK_BACK = "#1C1C1E";
const INK_NAME = "#111111";
const INK_MUTED = "#777777";
const INK_URL = "#333333";
const INK_ICON = "#888888";
const INK_LEVEL_LINK = "#666666";
const INK_ROW_LABEL = "#2B2B28";
const INK_ROW_CHEV = "#8A8A86";
const INK_LOGOUT = "#D9534F";

const GLASS_60 = "rgba(255,255,255,0.6)";
const GLASS_65 = "rgba(255,255,255,0.65)";
const HAIRLINE_90 = "rgba(255,255,255,0.9)";
const HAIRLINE_50 = "rgba(255,255,255,0.5)";
const HAIRLINE_40 = "rgba(255,255,255,0.4)";

const CHIP_GREEN = "rgba(220,245,230,0.7)";
const CHIP_GREEN_INK = "#2A7347";
const CHIP_LILAC = "rgba(235,225,250,0.7)";
const CHIP_LILAC_INK = "#6B4C9A";

const LEVEL_DONE = "#A88BEB";
const LEVEL_NOW = "#E6A7CC";
const LEVEL_TODO = "#E0E0E0";
const LEVEL_RING = "#FDFBF7";
const TRACK_BG = "rgba(0,0,0,0.06)";

const AVATAR_PLACEHOLDER = "#C4C4C4";
const ROW_RULE = "rgba(234,234,234,0.4)";

/* -------------------------------- backdrop -------------------------------- */
/** Frame fill: the beige linear base plus four radial tints. */
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

/* ------------------------------- menu rows -------------------------------- */
type IconName = ComponentProps<typeof Ionicons>["name"];

interface MenuSpec {
  key: string;
  /** 42x42 "Overlay" disc fill. */
  tint: string;
  /** Glyph stroke colour. */
  ink: string;
  icon: IconName;
  label: string;
  /** Spec width of the label container. */
  labelW: number;
  /** Rows 1-4 carry a bottom hairline; the last "Container" row does not. */
  rule: boolean;
  h: number;
  href?: string;
}

const MENU: MenuSpec[] = [
  {
    key: "personal",
    tint: "rgba(234,221,255,0.4)",
    ink: "#6B4BA3",
    icon: "person-outline",
    label: "personal information",
    labelW: 185,
    rule: true,
    h: 83,
  },
  {
    key: "landing",
    tint: "rgba(209,244,224,0.4)",
    ink: "#3B8A5A",
    icon: "globe-outline",
    label: "landing page",
    labelW: 95.47,
    rule: true,
    h: 83,
  },
  {
    key: "invoicing",
    tint: "rgba(255,230,213,0.4)",
    ink: "#B36B39",
    icon: "document-text-outline",
    label: "invoicing",
    labelW: 66.94,
    rule: true,
    h: 83,
    href: "/payments/invoice-hub",
  },
  {
    key: "agency",
    tint: "rgba(255,255,193,0.68)",
    ink: "#A0A007",
    icon: "briefcase-outline",
    label: "agency setting",
    labelW: 111.31,
    rule: true,
    h: 83,
  },
  {
    key: "leads",
    tint: "rgba(255,218,214,0.3)",
    ink: "#BA403A",
    icon: "mail-outline",
    label: "leads contact",
    labelW: 103.03,
    rule: false,
    h: 82,
    href: "/leads/leads",
  },
];

function MenuRow({ spec, y, onPress }: { spec: MenuSpec; y: number; onPress?: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        {
          position: "absolute",
          left: ROW_X,
          top: y,
          width: ROW_W,
          height: spec.h,
          opacity: pressed ? 0.75 : 1,
        },
        spec.rule && styles.rowRule,
      ]}
    >
      {/* Overlay — 42x42 fully rounded icon disc. */}
      <Abs x={0} y={TILE_OFF_Y} w={TILE_SIZE} h={TILE_SIZE} radius={TILE_SIZE / 2} bg={spec.tint} center>
        <Ionicons name={spec.icon} size={18} color={spec.ink} />
      </Abs>

      {/* Label — DM Sans 700 16 / 24, -0.4 tracking, lowercased in the design. */}
      <Txt
        x={ROW_LABEL_X}
        y={ROW_LABEL_Y}
        w={spec.labelW}
        size={16}
        weight="bold"
        color={INK_ROW_LABEL}
        lineHeight={24}
        letterSpacing={-0.4}
        numberOfLines={1}
      >
        {spec.label}
      </Txt>

      {/* iconify-icon — 16x16 forward chevron at 50% opacity. */}
      <Abs x={ROW_CHEV_X} y={ROW_CHEV_Y} w={16} h={16} center opacity={0.5}>
        <Ionicons name="chevron-forward" size={16} color={INK_ROW_CHEV} />
      </Abs>
    </Pressable>
  );
}

/* -------------------------------- helpers --------------------------------- */
/** "Sophia Roy" -> "sophia-roy" for the public Socyio landing page. */
function slugify(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/* --------------------------------- screen --------------------------------- */
export default function ProfileSelfManaged() {
  const router = useRouter();
  const { data: creators = [] } = useCreators();
  const { data: agencies = [] } = useAgencies();

  /** This route is the un-agencied state, so prefer a creator with no agency. */
  const profile = useMemo(
    () => creators.find((c) => !c.agencyId) ?? creators[0],
    [creators],
  );
  const agency = useMemo(
    () => (profile?.agencyId ? agencies.find((a) => a.id === profile.agencyId) : undefined),
    [agencies, profile],
  );

  const name = profile?.name ?? "Sophia Roy";
  const followers = profile ? `${compact(profile.followers).toUpperCase()} Followers` : "124K Followers";
  const landingUrl = `Socyio.com/${slugify(name)}`;
  const managedBy = agency?.name ?? "Self";

  /** Five-step ladder driven by the creator's star rating. */
  const level = profile ? Math.min(LEVELS, Math.max(1, Math.round(profile.stars))) : 2;
  const activeIdx = level - 1;
  const fillW = (TRACK_W * activeIdx) / (LEVELS - 1);

  /** SPACE_BETWEEN run: the active marker is 20 wide, the rest 12, gap 65.25. */
  const dots = useMemo(() => {
    const out: { i: number; x: number; size: number }[] = [];
    let x = DOT_X0;
    for (let i = 0; i < LEVELS; i += 1) {
      const size = i === activeIdx ? DOT_LG : DOT_SM;
      out.push({ i, x, size });
      x += size + DOT_GAP;
    }
    return out;
  }, [activeIdx]);

  const go = (href?: string) => (href ? () => router.push(href as never) : undefined);

  return (
    <Screen height={FRAME_H} background="#F7F0E4" scroll>
      <Backdrop />

      {/* =============================== Header ============================== */}
      <Pressable
        onPress={() => router.back()}
        style={({ pressed }) => [styles.back, pressed && styles.pressed]}
      >
        <Ionicons name="chevron-back" size={20} color={INK_BACK} />
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
      >
        Profile
      </Txt>

      {/* ====================== Frame 2147223262 (clipped) =================== */}
      <Abs x={0} y={IY} w={FRAME_W} h={INNER_H} style={styles.clip}>
        <ScrollView
          nestedScrollEnabled
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.stack}
        >
          <View style={styles.stackCanvas}>
            {/* ---------------------- Floating Identity ---------------------- */}
            {/* image — 105x105 avatar, fully rounded. */}
            {profile?.avatarUrl ? (
              <Abs x={15} y={116 - IY} w={105} h={105} radius={52.5} style={styles.clip}>
                <Image source={{ uri: profile.avatarUrl }} style={styles.avatarLg} />
              </Abs>
            ) : (
              <Ring x={15} y={116 - IY} size={105} />
            )}

            {/* Background+Shadow — 34x34 streak badge overlapping the avatar. */}
            <Abs
              x={94}
              y={193 - IY}
              w={34}
              h={34}
              radius={17}
              bg="#FFFFFF"
              center
              style={styles.badgeShadow}
            >
              <Txt size={16} color="#1A1A1A" lineHeight={19.2} align="center">
                🔥
              </Txt>
            </Abs>

            {/* Heading 1 — 28/35.73, -0.5 tracking. */}
            <Txt
              x={15}
              y={241 - IY}
              w={163}
              size={28}
              weight="bold"
              color={INK_NAME}
              lineHeight={35.73}
              letterSpacing={-0.5}
              numberOfLines={1}
            >
              {name}
            </Txt>

            <Txt
              x={15}
              y={279 - IY}
              w={108}
              size={15}
              weight="medium"
              font="inter"
              color={INK_MUTED}
              lineHeight={18.15}
            >
              {followers}
            </Txt>

            {/* Two advisory pills — 32pt tall, r20, 8pt apart. */}
            <Abs x={15} y={318 - IY} w={137.61} h={32} radius={20} bg={CHIP_GREEN}>
              <Txt
                x={16}
                y={8}
                w={105.61}
                size={13}
                weight="semibold"
                font="inter"
                color={CHIP_GREEN_INK}
                lineHeight={15.73}
              >
                +35% above avg
              </Txt>
            </Abs>
            <Abs x={160.61} y={318 - IY} w={164.91} h={32} radius={20} bg={CHIP_LILAC}>
              <Txt
                x={16}
                y={8}
                w={132.91}
                size={13}
                weight="semibold"
                font="inter"
                color={CHIP_LILAC_INK}
                lineHeight={15.73}
              >
                Suggestion: Increase
              </Txt>
            </Abs>

            {/* Public landing-page chip — Socyio domain in the self-managed state. */}
            <Pressable
              onPress={() => router.push("/onboarding/profile-verify-link" as never)}
              style={({ pressed }) => [styles.urlButton, { top: 366 - IY }, pressed && styles.pressed]}
            >
              <Abs x={32 - 15} y={377.5 - 366} w={16} h={16} center>
                <Ionicons name="link-outline" size={16} color={INK_ICON} />
              </Abs>
              <Txt
                x={56 - 15}
                y={377 - 366}
                w={231}
                size={14}
                weight="semibold"
                font="inter"
                color={INK_URL}
                lineHeight={16.94}
                numberOfLines={1}
              >
                {landingUrl}
              </Txt>
              <Abs x={297 - 15} y={377.5 - 366} w={16} h={16} center>
                <Ionicons name="copy-outline" size={16} color={INK_ICON} />
              </Abs>
            </Pressable>

            {/* --------------------- Management + Contact --------------------- */}
            <Abs
              x={15}
              y={457 - IY}
              w={269}
              h={70}
              radius={24}
              bg={GLASS_60}
              border={HAIRLINE_40}
              borderWidth={1}
              style={styles.cardShadow}
            >
              {/* 44x44 avatar; with no agency attached this is the creator's own. */}
              <Abs x={32 - 15} y={470 - 457} w={44} h={44} radius={22} bg={AVATAR_PLACEHOLDER} style={styles.clip}>
                {profile?.avatarUrl ? (
                  <Image source={{ uri: profile.avatarUrl }} style={styles.avatarSm} />
                ) : null}
              </Abs>
              <Txt
                x={88 - 15}
                y={474 - 457}
                w={109.63}
                size={12}
                weight="medium"
                font="inter"
                color={INK_MUTED}
                lineHeight={14.52}
              >
                Managed by
              </Txt>
              <Txt
                x={88 - 15}
                y={491 - 457}
                w={109.63}
                size={15}
                weight="bold"
                font="inter"
                color={INK_NAME}
                lineHeight={18.15}
                numberOfLines={1}
              >
                {managedBy}
              </Txt>
            </Abs>

            {/* Contact CTA — with no agency in the middle this opens leads. */}
            <Pressable
              onPress={() => router.push("/leads/leads" as never)}
              style={({ pressed }) => [styles.contact, { top: 462 - IY }, pressed && styles.pressed]}
            >
              <Ionicons name="chatbubble-outline" size={24} color="#FFFFFF" />
            </Pressable>

            {/* ------------------------- Level System ------------------------- */}
            <Abs x={TRACK_X} y={TRACK_Y} w={TRACK_W} h={4} radius={2} bg={TRACK_BG} />
            {fillW > 0 ? (
              <LinearGradient
                colors={[LEVEL_DONE, LEVEL_NOW]}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={[styles.trackFill, { top: TRACK_Y, width: fillW }]}
              />
            ) : null}
            {dots.map((d) =>
              d.i === activeIdx ? (
                <View key={d.i}>
                  {/* Background+Blur halo, then the bordered marker on top. */}
                  <Abs
                    x={d.x + 3}
                    y={578 - IY}
                    w={14}
                    h={14}
                    radius={7}
                    bg={LEVEL_NOW}
                    opacity={0.8}
                  />
                  <Abs
                    x={d.x}
                    y={575 - IY}
                    w={DOT_LG}
                    h={DOT_LG}
                    radius={10}
                    bg={LEVEL_NOW}
                    border="#FFFFFF"
                    borderWidth={3}
                  />
                </View>
              ) : (
                <Abs
                  key={d.i}
                  x={d.x}
                  y={579 - IY}
                  w={DOT_SM}
                  h={DOT_SM}
                  radius={6}
                  bg={d.i < activeIdx ? LEVEL_DONE : LEVEL_TODO}
                  border={LEVEL_RING}
                  borderWidth={2}
                />
              ),
            )}
            <Txt
              x={23}
              y={617 - IY}
              w={125.14}
              size={15}
              weight="bold"
              font="inter"
              color={INK_NAME}
              lineHeight={18.15}
            >
              {`You're on Level ${level}`}
            </Txt>
            <Txt
              x={236.3}
              y={618 - IY}
              w={93.7}
              size={14}
              weight="semibold"
              font="inter"
              color={INK_LEVEL_LINK}
              lineHeight={16.94}
            >
              Explore levels
            </Txt>
            <Abs x={336} y={618.5 - IY} w={16} h={16} center>
              <Ionicons name="chevron-forward" size={16} color={INK_LEVEL_LINK} />
            </Abs>

            {/* --------------------------- Section ---------------------------- */}
            {MENU.map((spec, i) => (
              <MenuRow
                key={spec.key}
                spec={spec}
                y={ROW_Y0 + i * ROW_STEP - IY}
                onPress={go(spec.href)}
              />
            ))}
          </View>
        </ScrollView>
      </Abs>

      {/* =============================== Logout ============================== */}
      <Pressable
        onPress={() => router.push("/system/log-out" as never)}
        style={({ pressed }) => [styles.logout, pressed && styles.pressed]}
      >
        <Txt
          size={15}
          weight="semibold"
          font="inter"
          color={INK_LOGOUT}
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
  pressed: { opacity: 0.85 },
  clip: { overflow: "hidden" },

  back: {
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
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 1,
  },

  stack: { height: INNER_CONTENT_H, width: FRAME_W },
  stackCanvas: { width: FRAME_W, height: INNER_CONTENT_H },

  avatarLg: { width: 105, height: 105 },
  avatarSm: { width: 44, height: 44 },
  badgeShadow: {
    shadowColor: "#000000",
    shadowOpacity: 0.1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },

  urlButton: {
    position: "absolute",
    left: 15,
    width: 311,
    height: 39,
    borderRadius: 24,
    backgroundColor: GLASS_60,
    borderWidth: 1,
    borderColor: HAIRLINE_50,
    shadowColor: "#000000",
    shadowOpacity: 0.03,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 1,
  },

  cardShadow: {
    shadowColor: "#000000",
    shadowOpacity: 0.03,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
    elevation: 2,
  },

  contact: {
    position: "absolute",
    left: 300,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#111111",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#111111",
    shadowOpacity: 0.2,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 6,
  },

  trackFill: { position: "absolute", left: TRACK_X, height: 4, borderRadius: 2 },

  rowRule: { borderBottomWidth: 1, borderBottomColor: ROW_RULE },

  logout: {
    position: "absolute",
    left: 27,
    top: 824,
    width: 50.63,
    height: 35,
    opacity: 0.9,
    alignItems: "center",
    justifyContent: "center",
  },
});
