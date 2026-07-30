import { Fragment, useState } from "react";
import type { ComponentProps } from "react";
import { Pressable, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Svg, {
  Defs,
  LinearGradient as SvgLinear,
  RadialGradient,
  Rect,
  Stop,
} from "react-native-svg";
import { Abs, Ring, Screen, Txt } from "../../../src/ui/Frame";
import { gradients } from "../../../src/theme";
import {
  useAgencies,
  useCampaigns,
  useChannels,
  useMe,
  useMessages,
  useNotifications,
  useUsers,
} from "../../../src/api/hooks";

/**
 * Campaign Brief — Workspace Drawer Open. Figma 7333:17267 (375x875).
 *
 * The brief thread ("# Baseskincare") with the 310x875 workspace switcher slid
 * in over a 57% scrim: workspace header, Agency Notifications, Campaigns,
 * Direct Messages and the signed-in user's profile card. Coordinates below are
 * raw frame coordinates from the spec; <Screen> scales the 375pt canvas.
 */

/* ------------------------------- geometry -------------------------------- */
const FRAME_W = 375;
const FRAME_H = 875;

/** Campaign rows: content steps 56pt; the active row carries the 52pt tint. */
const CAMPAIGN_FIRST_ICON_Y = 275;
const CAMPAIGN_STEP = 56;
const MAX_CAMPAIGNS = 2; // 232..367 section box holds exactly two rows

/** DM rows: avatars step 60pt inside the 285x203 Direct Messages box. */
const DM_FIRST_AVATAR_Y = 434;
const DM_STEP = 60;
const MAX_DMS = 3; // 395..598, the last row the section holds

/* --------------------------- spec colour tokens --------------------------- */
const INK_TITLE = "#1A1A1A";
const INK_LABEL = "#333333";
const INK_BODY = "#444444";
const INK_ROW = "#555555";
const INK_META = "#888888";
const INK_SECTION = "#999999";
const INK_ACTIVE = "#2B2240";
const GLASS_85 = "rgba(255,255,255,0.85)";
const GLASS_90 = "rgba(255,255,255,0.9)";
const WHITE = "#FFFFFF";
const HASH_IDLE = "#90CAF9";
const HASH_ACTIVE = "#BA68C8";
const DOT_ONLINE = "#4CAF50";
const DOT_ANNOUNCE = "#FF8A65";
const DOT_UNREAD = "#4DB6AC";
const BADGE_INK = "#9C27B0";

type FeatherName = ComponentProps<typeof Feather>["name"];

/* ----------------------------- brief content ------------------------------ */
/** Section chips — icon box at (60, y+8), label at (80, y+7). */
const CHIPS: { y: number; w: number; label: string; icon: FeatherName; tint: string }[] = [
  { y: 203, w: 135.19, label: "Key Message", icon: "message-circle", tint: "#F57C00" },
  { y: 317, w: 154.8, label: "Target Audience", icon: "users", tint: "#1976D2" },
  { y: 431, w: 117.48, label: "Guidelines", icon: "check", tint: "#388E3C" },
  { y: 606, w: 128.89, label: "Deliverables", icon: "video", tint: "#7B1FA2" },
  { y: 727, w: 87.55, label: "Notes", icon: "alert-circle", tint: "#D32F2F" },
];

/** Paragraphs and list items — all Inter 400 / 15 / 24 / #444444. */
const LINES: { x: number; y: number; w: number; text: string }[] = [
  { x: 49, y: 245, w: 281, text: "Celebrating your natural glow and how\nour serum enhances it effortlessly." },
  { x: 49, y: 359, w: 281, text: "Gen Z & young millennial women\nlooking for minimal, effective skincare." },
  { x: 67, y: 473, w: 176.77, text: "Morning skincare routine" },
  { x: 67, y: 503, w: 204.86, text: "Use product naturally in your\nbathroom" },
  { x: 67, y: 557.5, w: 216.58, text: "Mention the hydration benefits" },
  { x: 67, y: 648, w: 143.42, text: "Duration: 20–40 sec" },
  { x: 67, y: 678.5, w: 207.73, text: "Format: Instagram Reel (9:16)" },
  { x: 67, y: 769, w: 179.53, text: "Avoid using beauty filters" },
  { x: 67, y: 799, w: 172.44, text: "Keep tone authentic and\nconversational" },
];

/**
 * Presence and unread are UI state the API does not carry, so the three DM
 * variants the design ships (online / plain / online + unread) are applied by
 * row index while the names themselves come from the directory.
 */
const DM_STATE: { online: boolean; unread: boolean }[] = [
  { online: true, unread: false },
  { online: false, unread: false },
  { online: true, unread: true },
];

const AVATAR_PAINTS = [gradients.avatarA, gradients.avatarB, gradients.avatarC];

/* ------------------------------ derivations ------------------------------- */
/** "11:55 AM" — the exact clock format on the brief card header. */
function clockLabel(iso: string): string {
  const d = new Date(iso);
  const h = d.getHours() % 12 || 12;
  const suffix = d.getHours() >= 12 ? "PM" : "AM";
  return `${h}:${String(d.getMinutes()).padStart(2, "0")} ${suffix}`;
}

/** "Sophia Roy" -> "@Sophiaroy", the handle style the profile card uses. */
function handleOf(name: string): string {
  const flat = name.replace(/\s+/g, "");
  return `@${flat.charAt(0).toUpperCase()}${flat.slice(1).toLowerCase()}`;
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

/* -------------------------------- pieces ---------------------------------- */
/** Photo stand-in: the design's image fills become gradient discs. */
function Avatar({
  x, y, size, paint, stroke,
}: { x: number; y: number; size: number; paint: readonly [string, string]; stroke?: number }) {
  return (
    <>
      <Ring x={x} y={y} size={size} colorA={paint[0]} colorB={paint[1]} />
      {stroke ? (
        <Abs x={x} y={y} w={size} h={size} radius={size / 2} border={WHITE} borderWidth={stroke} />
      ) : null}
    </>
  );
}

/** 30pt glass pill that titles each brief section. */
function SectionChip({ y, w, label, icon, tint }: (typeof CHIPS)[number]) {
  return (
    <>
      <Abs x={45} y={y} w={w} h={30} radius={14} bg={GLASS_85} border={WHITE} borderWidth={1} style={styles.chip} />
      <Abs x={60} y={y + 8} w={14} h={14} center>
        <Feather name={icon} size={14} color={tint} />
      </Abs>
      <Txt x={80} y={y + 7} size={13} weight="bold" font="inter" color={INK_LABEL} lineHeight={15.73}>
        {label}
      </Txt>
    </>
  );
}

/* --------------------------------- screen --------------------------------- */
export default function CampaignBriefWorkspaceDrawer() {
  const router = useRouter();

  const { data: agencies = [] } = useAgencies();
  const { data: campaigns = [] } = useCampaigns();
  const { data: users = [] } = useUsers();
  const { data: channels = [] } = useChannels();
  const { data: me } = useMe();
  const { data: notif } = useNotifications();

  // The design opens on the second campaign in the switcher.
  const [pickedId, setPickedId] = useState<string | null>(null);
  const rows = campaigns.slice(0, MAX_CAMPAIGNS);
  const active = rows.find((c) => c.id === pickedId) ?? rows[1] ?? rows[0];

  // The brief thread is the chat channel named after the open campaign.
  const thread =
    channels.find((c) => c.name === active?.name) ??
    channels.find((c) => c.kind === "CAMPAIGN") ??
    channels[0];
  const { data: messages = [] } = useMessages(thread?.id ?? null);
  const opener = messages[0];

  const dms = users.slice(0, MAX_DMS);
  const unread = notif?.unreadCount ?? 0;
  const channelName = active?.name ?? "Baseskincare";
  const extraParticipants = Math.max(0, (active?.peopleCount ?? 0) - 2);

  return (
    <Screen height={FRAME_H} background="#F7F0E4" scroll>
      <Backdrop />

      {/* ------------------------------ Top Nav ----------------------------- */}
      <Abs x={0} y={0} w={FRAME_W} h={80} bg="rgba(253,253,246,0.75)" />
      <Pressable
        onPress={() => router.back()}
        style={({ pressed }) => [styles.navBack, pressed && styles.pressed]}
      >
        <Feather name="arrow-left" size={20} color="#1C1C1E" />
      </Pressable>
      <Abs x={130} y={32} w={16} h={16} center>
        <Feather name="hash" size={16} color={INK_META} />
      </Abs>
      <Txt
        x={150}
        y={30}
        w={108.42}
        size={17}
        weight="bold"
        font="inter"
        color={INK_TITLE}
        lineHeight={20.57}
        letterSpacing={-0.3}
        numberOfLines={1}
      >
        {channelName}
      </Txt>

      {/* -------------------- Main → Brief Message Card ---------------------- */}
      <LinearGradient
        colors={["rgba(255,248,242,0.95)", "rgba(255,252,248,0.95)"] as const}
        start={{ x: -0.2, y: 0.06 }}
        end={{ x: 1.2, y: 0.94 }}
        style={styles.card}
      />

      {/* Card header — author, timestamp, participant stack */}
      <Avatar x={45} y={131} size={44} paint={gradients.avatarA} stroke={2} />
      <Txt x={101} y={134.5} w={30.41} size={16} weight="bold" font="inter" color={INK_TITLE} lineHeight={19.36} numberOfLines={1}>
        {opener?.authorName ?? "Dev"}
      </Txt>
      <Txt x={101} y={156.5} w={50.73} size={12} weight="medium" font="inter" color={INK_META} lineHeight={14.52}>
        {opener ? clockLabel(opener.createdAt) : "11:55 AM"}
      </Txt>
      <Avatar x={254} y={131} size={32} paint={gradients.avatarB} stroke={2} />
      <Avatar x={276} y={131} size={32} paint={gradients.avatarC} stroke={2} />
      {extraParticipants > 0 ? (
        <>
          <Abs x={298} y={131} w={32} h={32} radius={16} bg={GLASS_90} border={WHITE} borderWidth={2} style={styles.stackChip} />
          <Txt x={298} y={140} w={32} size={11} weight="bold" font="inter" color={INK_ROW} lineHeight={13.31} align="center">
            {`+${extraParticipants}`}
          </Txt>
        </>
      ) : null}

      {/* Brief sections */}
      {CHIPS.map((c) => (
        <SectionChip key={c.label} {...c} />
      ))}
      {LINES.map((l) => (
        <Txt key={`${l.x}-${l.y}`} x={l.x} y={l.y} w={l.w} size={15} font="inter" color={INK_BODY} lineHeight={24}>
          {l.text}
        </Txt>
      ))}

      {/* ----------------------------- Input Area --------------------------- */}
      <LinearGradient
        colors={["#FDFDF6", "#FDFDF6", "rgba(253,253,246,0)"] as const}
        locations={[0, 0.5, 1]}
        start={{ x: 0.5, y: 1 }}
        end={{ x: 0.5, y: 0 }}
        style={styles.inputArea}
      />
      <Abs x={20} y={785} w={335} h={58} radius={32} bg={GLASS_90} border="rgba(0,0,0,0.05)" borderWidth={1} style={styles.inputPill} />
      <Txt x={39} y={805} w={255} size={15} font="inter" color="#999999" lineHeight={18.15} numberOfLines={1}>
        {`Message #${channelName}`}
      </Txt>
      <LinearGradient
        colors={[
          "rgba(255,229,164,0.82)",
          "rgba(255,245,228,0.92)",
          "rgba(244,211,238,0.88)",
          "rgba(202,217,255,0.76)",
        ] as const}
        locations={[0, 0.35, 0.72, 1]}
        start={{ x: 0.11, y: -0.21 }}
        end={{ x: 0.89, y: 1.21 }}
        style={styles.sendButton}
      />
      <Abs x={317} y={805} w={18} h={18} center>
        <Feather name="send" size={18} color="#3A3A3A" />
      </Abs>

      {/* ------------------------------- Scrim ------------------------------ */}
      <Abs x={0} y={0} w={FRAME_W} h={FRAME_H} bg="rgba(181,180,185,0.57)" />

      {/* ------------------------ Aside — Sidebar Panel --------------------- */}
      <LinearGradient
        colors={["rgba(255,255,255,0.98)", "rgba(253,253,246,0.98)"] as const}
        start={{ x: -0.01, y: 0 }}
        end={{ x: 1.01, y: 1 }}
        style={styles.panel}
      />

      {/* Panel header */}
      <Abs x={66} y={0} w={309} h={101} style={styles.panelHeader} />
      <LinearGradient
        colors={["#A2B5F5", "#8DC49D"] as const}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={styles.logoTile}
      />
      <Abs x={97} y={43} w={22} h={22} center>
        <Feather name="layers" size={22} color={WHITE} />
      </Abs>
      <Txt x={144} y={33.5} w={161} size={19} weight="bold" font="inter" color={INK_TITLE} lineHeight={22.99} letterSpacing={-0.4} numberOfLines={1}>
        {agencies[0]?.name ?? "Socyio"}
      </Txt>
      <Txt x={144} y={58.5} w={161} size={13} weight="medium" font="inter" color={INK_META} lineHeight={15.73}>
        Workspace
      </Txt>
      <Pressable
        onPress={() => router.back()}
        style={({ pressed }) => [styles.closeButton, pressed && styles.pressed]}
      >
        <Feather name="x" size={20} color="#666666" />
      </Pressable>

      {/* Agency Notifications */}
      <Txt x={83.25} y={125} w={164.27} size={12} weight="bold" font="inter" color={INK_SECTION} lineHeight={14.52} letterSpacing={0.8}>
        AGENCY NOTIFICATIONS
      </Txt>
      <Abs x={78} y={152} w={285} h={52} radius={18} />
      <Abs x={96} y={168} w={20} h={20} center>
        <MaterialCommunityIcons name="bullhorn-outline" size={20} color={DOT_ANNOUNCE} />
      </Abs>
      <Txt x={132} y={169} w={209} size={15} weight="bold" font="inter" color={INK_TITLE} lineHeight={18.15}>
        Announcements
      </Txt>
      {unread > 0 ? <Abs x={341} y={174} w={8} h={8} radius={4} bg={DOT_ANNOUNCE} /> : null}

      {/* Campaigns */}
      <Txt x={83.25} y={232} w={81.02} size={12} weight="bold" font="inter" color={INK_SECTION} lineHeight={14.52} letterSpacing={0.8}>
        CAMPAIGNS
      </Txt>
      {rows.map((c, i) => {
        const step = i * CAMPAIGN_STEP;
        const isActive = c.id === active?.id;
        return (
          <Pressable
            key={c.id}
            onPress={() => setPickedId(c.id)}
            style={({ pressed }) => [
              styles.campaignHit,
              i === 0 ? { top: 251, height: 60 } : { top: 259 + step, height: 52 },
              pressed && styles.pressed,
            ]}
          >
            {isActive ? (
              <LinearGradient
                colors={["rgba(235,228,255,0.7)", "rgba(255,235,242,0.7)"] as const}
                start={{ x: 0.21, y: -1.16 }}
                end={{ x: 0.79, y: 2.16 }}
                style={[styles.campaignTint, { top: i === 0 ? 8 : 0 }]}
              />
            ) : null}
          </Pressable>
        );
      })}
      {rows.map((c, i) => {
        const step = i * CAMPAIGN_STEP;
        const isActive = c.id === active?.id;
        return (
          <Fragment key={`${c.id}-label`}>
            <Abs x={96} y={CAMPAIGN_FIRST_ICON_Y + step} w={20} h={20} center>
              <Feather name="hash" size={20} color={isActive ? HASH_ACTIVE : HASH_IDLE} />
            </Abs>
            <Txt
              x={132}
              y={276 + step}
              w={isActive ? 189.25 : 217}
              size={15}
              weight={isActive ? "bold" : "medium"}
              font="inter"
              color={isActive ? INK_ACTIVE : INK_ROW}
              lineHeight={18.15}
              numberOfLines={1}
            >
              {c.name}
            </Txt>
            {isActive && unread > 0 ? (
              <>
                <Abs x={321.25} y={273.5 + step} w={27.75} h={23} radius={12} bg="rgba(255,255,255,0.8)" style={styles.badge} />
                <Txt x={321.25} y={277.5 + step} w={27.75} size={12} weight="bold" font="inter" color={BADGE_INK} lineHeight={14.52} align="center">
                  {String(unread)}
                </Txt>
              </>
            ) : null}
          </Fragment>
        );
      })}

      {/* Direct Messages */}
      <Txt x={83.25} y={395} w={125.55} size={12} weight="bold" font="inter" color={INK_SECTION} lineHeight={14.52} letterSpacing={0.8}>
        DIRECT MESSAGES
      </Txt>
      {dms.map((u, i) => {
        const step = i * DM_STEP;
        const state = DM_STATE[i] ?? { online: false, unread: false };
        return (
          <Fragment key={u.id}>
            <Abs
              x={78}
              y={i === 0 ? 414 : 422 + step}
              w={285}
              h={i === 0 ? 64 : 56}
              radius={18}
            />
            <Avatar
              x={92}
              y={DM_FIRST_AVATAR_Y + step}
              size={32}
              paint={AVATAR_PAINTS[i % AVATAR_PAINTS.length] ?? gradients.avatarA}
            />
            {state.online ? (
              <Abs x={116} y={458 + step} w={10} h={10} radius={5} bg={DOT_ONLINE} border={WHITE} borderWidth={2} />
            ) : null}
            <Txt
              x={136}
              y={441 + step}
              w={state.unread ? 204.75 : 213}
              size={15}
              weight={state.unread ? "bold" : "medium"}
              font="inter"
              color={state.unread ? INK_TITLE : INK_ROW}
              lineHeight={18.15}
              numberOfLines={1}
            >
              {u.name}
            </Txt>
            {state.unread ? <Abs x={349.75} y={446 + step} w={8} h={8} radius={4} bg={DOT_UNREAD} /> : null}
          </Fragment>
        );
      })}

      {/* Footer / User Profile */}
      <Abs x={86} y={769} w={269} h={74} radius={24} bg="rgba(255,255,255,0.8)" border={WHITE} borderWidth={1} style={styles.profileCard} />
      <Avatar x={101} y={784} size={44} paint={gradients.avatarB} />
      <Txt x={159} y={788} w={181} size={15} weight="bold" font="inter" color={INK_TITLE} lineHeight={18.15} numberOfLines={1}>
        {me?.name ?? "Sophia Roy"}
      </Txt>
      <Txt x={159} y={808} w={181} size={13} weight="medium" font="inter" color={INK_META} lineHeight={15.73} numberOfLines={1}>
        {me ? handleOf(me.name) : "@Sophiaroy"}
      </Txt>
    </Screen>
  );
}

const styles = StyleSheet.create({
  backdrop: { position: "absolute", left: 0, top: 0 },
  pressed: { opacity: 0.9 },

  navBack: {
    position: "absolute",
    left: 20,
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

  card: {
    position: "absolute",
    left: 20,
    top: 106,
    width: 335,
    height: 663,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#FFFFFF",
    shadowColor: "#000000",
    shadowOpacity: 0.04,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 12 },
    elevation: 2,
  },
  stackChip: {
    shadowColor: "#000000",
    shadowOpacity: 0.06,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
  },
  chip: {
    shadowColor: "#000000",
    shadowOpacity: 0.02,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
  },

  inputArea: { position: "absolute", left: 0, top: 769, width: 375, height: 106 },
  inputPill: {
    shadowColor: "#000000",
    shadowOpacity: 0.06,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 10 },
    elevation: 3,
  },
  sendButton: {
    position: "absolute",
    left: 304,
    top: 792,
    width: 44,
    height: 44,
    borderRadius: 22,
    shadowColor: "#F48FB1",
    shadowOpacity: 0.3,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },

  panel: {
    position: "absolute",
    left: 65,
    top: 0,
    width: 310,
    height: 875,
    borderTopLeftRadius: 32,
    borderBottomLeftRadius: 32,
    borderLeftWidth: 1,
    borderLeftColor: "rgba(255,255,255,0.7)",
    shadowColor: "#000000",
    shadowOpacity: 0.06,
    shadowRadius: 20,
    shadowOffset: { width: -12, height: 0 },
    elevation: 8,
  },
  panelHeader: { borderBottomWidth: 1, borderBottomColor: "rgba(0,0,0,0.03)" },
  logoTile: {
    position: "absolute",
    left: 86,
    top: 32,
    width: 44,
    height: 44,
    borderRadius: 14,
    shadowColor: "#F48FB1",
    shadowOpacity: 0.3,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  closeButton: {
    position: "absolute",
    left: 319,
    top: 36,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.03)",
  },

  campaignHit: { position: "absolute", left: 78, width: 285, borderRadius: 18 },
  campaignTint: {
    position: "absolute",
    left: 0,
    width: 285,
    height: 52,
    borderRadius: 18,
    shadowColor: "#000000",
    shadowOpacity: 0.02,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
  },
  badge: {
    shadowColor: "#000000",
    shadowOpacity: 0.03,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
  },
  profileCard: {
    shadowColor: "#000000",
    shadowOpacity: 0.04,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
});
