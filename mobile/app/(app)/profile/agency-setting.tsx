import { useMemo, useState } from "react";
import { Alert, Image, Pressable, ScrollView, StyleSheet, View } from "react-native";
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
import { Abs, Screen, Txt } from "../../../src/ui/Frame";
import { useAgencies, useCreators, useMe, useUpdate, useUsers } from "../../../src/api/hooks";

/**
 * Agency Setting — Figma frame 7358:30548 (375x875), traced 1:1.
 *
 * Connected-agency management for an agency-managed creator. Three top-level
 * frames in the spec:
 *
 *   Bottom CTA   y=778 h=97   — the destructive "Remove Agency" pill
 *   Main Content y=106 h=655  — clipsContent:true, holds a 731pt stack
 *     Connected Agency Card  y=106 h=334
 *     Assigned Manager       y=460 h=82
 *     Heading 3 Permissions  y=562 h=35
 *     Permission card 1      y=617 h=100
 *     Permission card 2      y=737 h=100   (runs to 837 — past the clip box)
 *   Header       y=0   h=80   — back disc + centred "Agency Setting"
 *
 * The design's own container clips at y=761 while its children run to y=837, so
 * that container is reproduced as a real scroll region: every node keeps its
 * exact frame coordinate and the second permission card stays reachable, with
 * the floating CTA pinned below it exactly where the spec puts it.
 */

/* ------------------------------- geometry -------------------------------- */
const FRAME_W = 375;
const FRAME_H = 875;

/** "Main Content" — the clipping stack. Children are drawn at spec y - BODY_Y. */
const BODY_Y = 106;
const BODY_H = 655;
/** Permission card 2 ends at 737 + 100. */
const CONTENT_BOTTOM = 837;

/* Permission cards: identical internals, only the card origin changes. */
const PERM_TITLE_DY = 23;
const PERM_HELPER_DY = 45;
const PERM_TOGGLE_DY = 36;
const PERM_TEXT_X = 45;
const TOGGLE_X = 282;
const TOGGLE_W = 48;
const TOGGLE_H = 28;

/* --------------------------- spec colour tokens --------------------------- */
const INK_TITLE = "#1d1d1f";
const INK_BACK = "#1c1c1e";
const INK_HEADING = "#27272a";
const INK_MUTED = "#71717a";
const ACCENT = "#9333ea";
const CHIP_DOT = "#10b981";
const CHIP_TEXT = "#047857";
const CTA_FILL = "#312b28";
const AVATAR_PLACEHOLDER = "#c4c4c4";
const GLASS_60 = "rgba(255,255,255,0.6)";
const GLASS_50 = "rgba(255,255,255,0.5)";
const LINE_90 = "rgba(255,255,255,0.9)";
const LINE_80 = "rgba(255,255,255,0.8)";
const LINE_70 = "rgba(255,255,255,0.7)";
/** Contact rows use the heading ink at 70% — spec fill #27272a, opacity 0.7. */
const INK_CONTACT = "rgba(39,39,42,0.7)";
/** Toggle-off track. Not designed; the spec's muted grey, dialled back. */
const TRACK_OFF = "rgba(113,113,122,0.3)";

const CARD_GRAD = ["#e0f2feb2", "#f3e8ffb2"] as const;
const PERM_GRAD_A = ["#fce7f3b2", "#ffe4e680"] as const;
const PERM_GRAD_B = ["#e0f2feb2", "#dbeafe80"] as const;
const TOGGLE_GRAD = ["#a855f7", "#9333ea"] as const;

/* -------------------------------- backdrop -------------------------------- */
/** Frame fill: a warm vertical base under four oversized radial glows. */
function Backdrop() {
  return (
    <Svg width={FRAME_W} height={FRAME_H} style={styles.backdrop}>
      <Defs>
        <SvgLinear id="abase" x1="187.5" y1="0" x2="187.5" y2={FRAME_H} gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#F7F0E4" />
          <Stop offset="1" stopColor="#F4EBDD" />
        </SvgLinear>
        <RadialGradient id="apink" cx="285" cy="542.5" rx="1027.5" ry="568.75" gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#F7B7DA" stopOpacity="0.34" />
          <Stop offset="0.26" stopColor="#F7B7DA" stopOpacity="0" />
        </RadialGradient>
        <RadialGradient id="ablue" cx="90" cy="367.5" rx="967.5" ry="533.75" gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#BACDF4" stopOpacity="0.36" />
          <Stop offset="0.24" stopColor="#BACDF4" stopOpacity="0" />
        </RadialGradient>
        <RadialGradient id="agold" cx="292.5" cy="157.5" rx="1338.75" ry="735" gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#F6D64A" stopOpacity="0.22" />
          <Stop offset="0.2" stopColor="#F6D64A" stopOpacity="0" />
        </RadialGradient>
        <RadialGradient id="ahaze" cx="75" cy="87.5" rx="1466.25" ry="805" gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#FFFFFF" stopOpacity="0.72" />
          <Stop offset="0.24" stopColor="#FFFFFF" stopOpacity="0" />
        </RadialGradient>
      </Defs>
      <Rect width={FRAME_W} height={FRAME_H} fill="url(#abase)" />
      <Rect width={FRAME_W} height={FRAME_H} fill="url(#apink)" />
      <Rect width={FRAME_W} height={FRAME_H} fill="url(#ablue)" />
      <Rect width={FRAME_W} height={FRAME_H} fill="url(#agold)" />
      <Rect width={FRAME_W} height={FRAME_H} fill="url(#ahaze)" />
    </Svg>
  );
}

/* --------------------------------- toggle --------------------------------- */
/** 48x28 pill, 22pt knob. On = knob right over the purple gradient track. */
function Toggle({ y, on, onPress }: { y: number; on: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={8}
      style={({ pressed }) => ({
        position: "absolute",
        left: TOGGLE_X,
        top: y,
        width: TOGGLE_W,
        height: TOGGLE_H,
        opacity: pressed ? 0.85 : 1,
      })}
    >
      {on ? (
        <LinearGradient
          colors={TOGGLE_GRAD}
          start={{ x: 0.11, y: 0 }}
          end={{ x: 0.89, y: 1 }}
          style={styles.track}
        />
      ) : (
        <View style={[styles.track, styles.trackOff]} />
      )}
      <Abs x={on ? 23 : 3} y={3} w={22} h={22} radius={11} bg="#ffffff" style={styles.knob} />
    </Pressable>
  );
}

/* ----------------------------- permission card ---------------------------- */
function PermissionCard({
  y,
  gradient,
  title,
  helper,
  textW,
  on,
  onToggle,
}: {
  y: number;
  gradient: readonly [string, string];
  title: string;
  helper: string;
  textW: number;
  on: boolean;
  onToggle: () => void;
}) {
  return (
    <>
      <LinearGradient
        colors={gradient}
        start={{ x: 0.17, y: 0 }}
        end={{ x: 0.83, y: 1 }}
        style={[styles.permCard, { top: y }]}
      />
      <Txt
        x={PERM_TEXT_X}
        y={y + PERM_TITLE_DY}
        w={textW}
        size={15}
        weight="semibold"
        font="inter"
        color={INK_HEADING}
        lineHeight={18.15}
        numberOfLines={1}
      >
        {title}
      </Txt>
      <Txt
        x={PERM_TEXT_X}
        y={y + PERM_HELPER_DY}
        w={textW}
        size={13}
        weight="medium"
        font="inter"
        color={INK_MUTED}
        lineHeight={15.73}
      >
        {helper}
      </Txt>
      <Toggle y={y + PERM_TOGGLE_DY} on={on} onPress={onToggle} />
    </>
  );
}

/* --------------------------------- screen --------------------------------- */
export default function AgencySetting() {
  const router = useRouter();

  const { data: me } = useMe();
  const { data: creators = [] } = useCreators();
  const { data: agencies = [] } = useAgencies();
  const { data: users = [] } = useUsers();

  /** Detach the creator from the agency — the "Remove Agency" action. */
  const detach = useUpdate<{ agencyId: string | null }>("creators");

  /** The signed-in creator's own row in the roster. */
  const creator = useMemo(
    () => creators.find((c) => c.name === me?.name) ?? creators[0],
    [creators, me],
  );

  /** The agency that manages them. */
  const agency = useMemo(
    () => agencies.find((a) => a.id === creator?.agencyId) ?? agencies[0],
    [agencies, creator],
  );

  /**
   * Assigned manager — the agency's sales manager, falling back to ops. They are
   * also the agency's point of contact, so the card's email/phone are theirs;
   * Agency itself carries no contact columns.
   */
  const manager = useMemo(
    () =>
      users.find((u) => u.role === "SALES_MANAGER") ??
      users.find((u) => u.role === "OPS_MANAGER") ??
      users[0],
    [users],
  );

  // Permission grants are a client-side switch: the API exposes no field for
  // them yet, so the frame's state (both granted) is the initial state.
  const [canViewAnalytics, setCanViewAnalytics] = useState(true);
  const [canRespondToLeads, setCanRespondToLeads] = useState(true);

  const agencyName = agency?.name ?? "Stellar Talent";
  const agencyEmail = manager?.email ?? "hello@stellartalent.co";
  const agencyPhone = manager?.phone ?? "+91 98765 43210";
  const managerName = manager?.name ?? "Diya";
  const managerAvatar = manager?.avatarUrl;

  /** Destructive and undesigned, so it goes through the platform confirm. */
  const confirmRemove = () => {
    if (!creator || detach.isPending) return;
    Alert.alert("Remove Agency", `Disconnect ${agencyName} from your account?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove Agency",
        style: "destructive",
        onPress: () =>
          detach.mutate(
            { id: creator.id, data: { agencyId: null } },
            { onSuccess: () => router.back() },
          ),
      },
    ]);
  };

  return (
    <Screen height={FRAME_H} background="#F7F0E4" scroll>
      <Backdrop />

      {/* ===================== Main Content — y=106 h=655 ===================== */}
      <Abs x={0} y={BODY_Y} w={FRAME_W} h={BODY_H} style={styles.clip}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled
          contentContainerStyle={{ height: CONTENT_BOTTOM - BODY_Y }}
        >
          {/* One -106 offset, so everything below keeps raw frame coordinates. */}
          <Abs x={0} y={-BODY_Y} w={FRAME_W} h={CONTENT_BOTTOM}>
            {/* ------------ Connected Agency Card — 24,106 327x334 ------------ */}
            <LinearGradient
              colors={CARD_GRAD}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.agencyCard}
            />

            {/* Logo tile — 147.5,135 80x80 */}
            <Abs
              x={147.5}
              y={135}
              w={80}
              h={80}
              radius={24}
              bg="#ffffff"
              border={LINE_90}
              borderWidth={1}
              center
              style={styles.softShadow}
            >
              <Ionicons name="business-outline" size={36} color={ACCENT} />
            </Abs>

            {/*
              Agency name — spec text box is 101.07..272.07 (centre 186.57). Kept
              on that centre but widened to the card so long names do not clip.
            */}
            <Txt
              x={24}
              y={227}
              w={325.14}
              size={24}
              weight="medium"
              font="inter"
              color={INK_HEADING}
              lineHeight={29.05}
              letterSpacing={-0.5}
              align="center"
              numberOfLines={1}
            >
              {agencyName}
            </Txt>

            {/* "MANAGED BY AGENCY" pill — 101.07,259 171x27 */}
            <Abs x={101.07} y={259} w={171} h={27} radius={100} bg={GLASS_60} style={styles.softShadow} />
            <Txt
              x={101.07}
              y={265}
              w={171}
              size={12}
              weight="semibold"
              font="inter"
              color={ACCENT}
              lineHeight={14.52}
              letterSpacing={0.5}
              align="center"
              numberOfLines={1}
            >
              MANAGED BY AGENCY
            </Txt>

            {/* Email row — 49,299 277x50 */}
            <Abs
              x={49}
              y={299}
              w={277}
              h={50}
              radius={20}
              bg={GLASS_50}
              border={LINE_70}
              borderWidth={1}
              style={styles.softShadow}
            />
            <Abs x={66} y={314} w={20} h={20} center>
              <Ionicons name="mail-outline" size={20} color={ACCENT} />
            </Abs>
            <Txt
              x={98}
              y={315.5}
              w={212}
              size={14}
              weight="medium"
              font="inter"
              color={INK_CONTACT}
              lineHeight={16.94}
              numberOfLines={1}
            >
              {agencyEmail}
            </Txt>

            {/* Phone row — 49,361 277x50 */}
            <Abs
              x={49}
              y={361}
              w={277}
              h={50}
              radius={20}
              bg={GLASS_50}
              border={LINE_70}
              borderWidth={1}
              style={styles.softShadow}
            />
            <Abs x={66} y={376} w={20} h={20} center>
              <Ionicons name="call-outline" size={20} color={ACCENT} />
            </Abs>
            <Txt
              x={98}
              y={377.5}
              w={212}
              size={14}
              weight="medium"
              font="inter"
              color={INK_CONTACT}
              lineHeight={16.94}
              numberOfLines={1}
            >
              {agencyPhone}
            </Txt>

            {/* -------------- Assigned Manager — 24,460 327x82 -------------- */}
            <Abs
              x={24}
              y={460}
              w={327}
              h={82}
              radius={20}
              bg={GLASS_60}
              border={LINE_80}
              borderWidth={1}
              style={styles.softShadow}
            />

            {/* Avatar — 2pt white ring at 45,477 over a 44pt tile */}
            <Abs
              x={45}
              y={477}
              w={48}
              h={48}
              radius={24}
              border="#ffffff"
              borderWidth={2}
              style={[styles.softShadow, styles.clip]}
            >
              <Abs x={0} y={0} w={44} h={44} radius={22} bg={AVATAR_PLACEHOLDER}>
                {managerAvatar ? (
                  <Image source={{ uri: managerAvatar }} style={styles.avatar} />
                ) : null}
              </Abs>
            </Abs>

            <Txt
              x={107}
              y={484}
              w={123}
              size={11}
              weight="semibold"
              font="inter"
              color={INK_MUTED}
              lineHeight={13.31}
              letterSpacing={0.5}
            >
              ASSIGNED MANAGER
            </Txt>
            <Txt
              x={107}
              y={499}
              w={123}
              size={16}
              weight="semibold"
              font="inter"
              color={INK_HEADING}
              lineHeight={19.36}
              numberOfLines={1}
            >
              {managerName}
            </Txt>

            {/* Status chip — 250.47,484.5 79.53x33 */}
            <Abs
              x={250.47}
              y={484.5}
              w={79.53}
              h={33}
              radius={100}
              bg="rgba(204,251,241,0.8)"
              border={LINE_90}
              borderWidth={1}
              style={styles.softShadow}
            />
            <Abs x={265.47} y={498} w={6} h={6} radius={3} bg={CHIP_DOT} />
            <Txt
              x={277.47}
              y={493.5}
              w={37.53}
              size={12}
              weight="bold"
              font="inter"
              color={CHIP_TEXT}
              lineHeight={14.52}
            >
              Active
            </Txt>

            {/* ------------- Heading 3 — Permissions — 28,574 ------------- */}
            <Txt
              x={28}
              y={574}
              w={319}
              size={16}
              weight="semibold"
              font="inter"
              color={INK_HEADING}
              lineHeight={19.36}
            >
              Permissions
            </Txt>

            {/* ---------------- Permission cards — 617 / 737 ---------------- */}
            <PermissionCard
              y={617}
              gradient={PERM_GRAD_A}
              title="Can view my analytics"
              helper={"Allow agency to track your\nperformance stats"}
              textW={165.31}
              on={canViewAnalytics}
              onToggle={() => setCanViewAnalytics((v) => !v)}
            />
            <PermissionCard
              y={737}
              gradient={PERM_GRAD_B}
              title="Can respond to leads"
              helper={"Allow agency to negotiate on your\nbehalf"}
              textW={211.28}
              on={canRespondToLeads}
              onToggle={() => setCanRespondToLeads((v) => !v)}
            />
          </Abs>
        </ScrollView>
      </Abs>

      {/* ================= Bottom CTA — 71.5,794 232x55 ================= */}
      <Pressable
        onPress={confirmRemove}
        style={({ pressed }) => ({
          position: "absolute",
          left: 71.5,
          top: 794,
          width: 232,
          height: 55,
          borderRadius: 36,
          backgroundColor: CTA_FILL,
          alignItems: "center",
          justifyContent: "center",
          opacity: pressed || detach.isPending ? 0.85 : 1,
        })}
      >
        <Txt size={16} weight="semibold" font="inter" color="#ffffff" lineHeight={19.36} align="center">
          Remove Agency
        </Txt>
      </Pressable>

      {/* ======================= Header — y=0 h=80 ======================= */}
      <Pressable
        onPress={() => router.back()}
        style={({ pressed }) => ({
          position: "absolute",
          left: 15,
          top: 18,
          width: 44,
          height: 44,
          borderRadius: 22,
          borderWidth: 1,
          borderColor: LINE_90,
          backgroundColor: "rgba(255,255,255,0.65)",
          alignItems: "center",
          justifyContent: "center",
          opacity: pressed ? 0.85 : 1,
        })}
      >
        <Ionicons name="chevron-back" size={20} color={INK_BACK} />
      </Pressable>
      <Txt
        x={79.5}
        y={30}
        w={236}
        size={16}
        weight="bold"
        font="inter"
        color={INK_TITLE}
        lineHeight={19.36}
        align="center"
      >
        Agency Setting
      </Txt>
    </Screen>
  );
}

const styles = StyleSheet.create({
  backdrop: { position: "absolute", left: 0, top: 0 },
  clip: { overflow: "hidden" },
  avatar: { width: 44, height: 44, borderRadius: 22 },
  agencyCard: {
    position: "absolute",
    left: 24,
    top: 106,
    width: 327,
    height: 334,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: LINE_80,
  },
  permCard: {
    position: "absolute",
    left: 24,
    width: 327,
    height: 100,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: LINE_90,
  },
  track: {
    position: "absolute",
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.4)",
  },
  trackOff: { backgroundColor: TRACK_OFF },
  knob: {
    shadowColor: "#000000",
    shadowOpacity: 0.15,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  softShadow: {
    shadowColor: "#000000",
    shadowOpacity: 0.02,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
});
