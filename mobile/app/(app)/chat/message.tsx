import { Fragment, useMemo, useState } from "react";
import type { ComponentProps } from "react";
import { Pressable, StyleSheet, TextInput } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
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
import { fonts, gradients } from "../../../src/theme";
import { useChannels, useMe, useMessages, useSendMessage, type Channel } from "../../../src/api/hooks";

/**
 * Message thread — Figma 7333:17267 (375x875).
 *
 * One conversation: the glass top nav, the campaign brief that opens the
 * thread, and the composer pinned to the bottom. The frame also draws the
 * 310x875 workspace panel slid in over a 57% scrim — that panel is this
 * screen's channel switcher, so it is local state here: closed by default so
 * the thread reads, opened by tapping the channel name, dismissed by the
 * scrim, the close button, or by picking a row (which pushes this same route
 * with the new channel id).
 *
 * Coordinates below are raw frame coordinates; <Screen> scales the 375pt canvas.
 */

/* ------------------------------- geometry -------------------------------- */
const FRAME_W = 375;
const FRAME_H = 875;

/**
 * The brief card is 335x663 at (20, 106) and clips its content, which runs
 * 101.5pt past the bottom edge — so card children below use CARD-RELATIVE
 * coordinates (spec x - 20, spec y - 106) and the last two Notes lines are
 * clipped exactly as the design draws them.
 */
const CARD_X = 20;
const CARD_Y = 106;
const CARD_W = 335;
const CARD_H = 663;

/**
 * Sidebar rows. Everything steps 56pt (campaigns) / 60pt (DMs), but the first
 * row of each list is drawn taller — the design pads it against the section
 * heading — so each slot carries its own box straight from the spec.
 */
const ROOM_SLOTS: { rowY: number; rowH: number; tintY: number; iconY: number; textY: number }[] = [
  { rowY: 251, rowH: 60, tintY: 259, iconY: 275, textY: 276 },
  { rowY: 315, rowH: 52, tintY: 315, iconY: 331, textY: 332 },
];

/* --------------------------- spec colour tokens --------------------------- */
const INK_TITLE = "#1A1A1A";
const INK_LABEL = "#333333";
const INK_BODY = "#444444";
const INK_ROW = "#555555";
const INK_META = "#888888";
const INK_SECTION = "#999999";
const INK_ACTIVE = "#2B2240";
const INK_NAV = "#1C1C1E";
const WHITE = "#FFFFFF";
const GLASS_80 = "rgba(255,255,255,0.8)";
const GLASS_85 = "rgba(255,255,255,0.85)";
const GLASS_90 = "rgba(255,255,255,0.9)";
const HASH_IDLE = "#90CAF9";
const HASH_ACTIVE = "#BA68C8";
const DOT_ONLINE = "#4CAF50";
const DOT_ANNOUNCE = "#FF8A65";
const DOT_UNREAD = "#4DB6AC";
const BADGE_INK = "#9C27B0";
const PLACEHOLDER = "#999999";
const CLOSE_INK = "#666666";
const SEND_INK = "#3A3A3A";

type FeatherName = ComponentProps<typeof Feather>["name"];

/* ------------------------------ brief content ----------------------------- */
/** Section chips — 30pt glass pill, icon at (40, y+8), label at (60, y+7). */
const CHIPS: { y: number; w: number; label: string; icon: FeatherName; tint: string }[] = [
  { y: 97, w: 135.19, label: "Key Message", icon: "message-circle", tint: "#F57C00" },
  { y: 211, w: 154.8, label: "Target Audience", icon: "users", tint: "#1976D2" },
  { y: 325, w: 117.48, label: "Guidelines", icon: "check", tint: "#388E3C" },
  { y: 500, w: 128.89, label: "Deliverables", icon: "video", tint: "#7B1FA2" },
  { y: 621, w: 87.55, label: "Notes", icon: "alert-circle", tint: "#D32F2F" },
];

/** Paragraphs (x 29) and list items (x 47) — all Inter 400 / 15 / 24 / #444444. */
const LINES: { x: number; y: number; w: number; text: string }[] = [
  { x: 29, y: 139, w: 281, text: "Celebrating your natural glow and how\nour serum enhances it effortlessly." },
  { x: 29, y: 253, w: 281, text: "Gen Z & young millennial women\nlooking for minimal, effective skincare." },
  { x: 47, y: 367, w: 176.77, text: "Morning skincare routine" },
  { x: 47, y: 397, w: 204.86, text: "Use product naturally in your\nbathroom" },
  { x: 47, y: 451.5, w: 216.58, text: "Mention the hydration benefits" },
  { x: 47, y: 542, w: 143.42, text: "Duration: 20–40 sec" },
  { x: 47, y: 572.5, w: 207.73, text: "Format: Instagram Reel (9:16)" },
  { x: 47, y: 663, w: 179.53, text: "Avoid using beauty filters" },
  { x: 47, y: 693, w: 172.44, text: "Keep tone authentic and\nconversational" },
];

/**
 * Presence and unread are not in the schema, so the three DM variants the
 * design ships (online / plain / online + unread) are applied by row index,
 * along with the label width each variant is drawn at.
 */
const DM_SLOTS: {
  rowY: number; rowH: number; avatarY: number; textY: number; textW: number;
  online: boolean; unread: boolean;
}[] = [
  { rowY: 414, rowH: 64, avatarY: 434, textY: 441, textW: 213, online: true, unread: false },
  { rowY: 482, rowH: 56, avatarY: 494, textY: 501, textW: 213, online: false, unread: false },
  { rowY: 542, rowH: 56, avatarY: 554, textY: 560.5, textW: 204.75, online: true, unread: true },
];

const AVATAR_PAINTS = [gradients.avatarA, gradients.avatarB, gradients.avatarC];

/* ------------------------------ derivations ------------------------------- */
/** "11:55 AM" — the clock format on the brief card header. */
function clockLabel(iso: string): string {
  const d = new Date(iso);
  const h = d.getHours() % 12 || 12;
  const suffix = d.getHours() >= 12 ? "PM" : "AM";
  return `${h}:${String(d.getMinutes()).padStart(2, "0")} ${suffix}`;
}

/** "Sophia Roy" -> "@Sophiaroy", the handle style on the profile card. */
function handleOf(name: string): string {
  const flat = name.replace(/\s+/g, "");
  return `@${flat.charAt(0).toUpperCase()}${flat.slice(1).toLowerCase()}`;
}

/**
 * ChannelKind is TEAM | INFLUENCER | BRAND | CAMPAIGN. The sidebar's two lists
 * are group threads (everything else) and person-to-person threads.
 */
const isDirect = (c: Channel) => c.kind === "INFLUENCER";

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

/* --------------------------------- pieces --------------------------------- */
/** Photo stand-in: the design's image fills become gradient discs. */
function Avatar({
  x, y, size, paint, stroke,
}: {
  x: number;
  y: number;
  size: number;
  paint: readonly [string, string];
  stroke?: number;
}) {
  return (
    <>
      <Ring x={x} y={y} size={size} colorA={paint[0]} colorB={paint[1]} />
      {stroke ? (
        <Abs x={x} y={y} w={size} h={size} radius={size / 2} border={WHITE} borderWidth={stroke} />
      ) : null}
    </>
  );
}

/** One titled section of the brief, card-relative. */
function SectionChip({ y, w, label, icon, tint }: (typeof CHIPS)[number]) {
  return (
    <>
      <Abs x={25} y={y} w={w} h={30} radius={14} bg={GLASS_85} border={WHITE} borderWidth={1} style={styles.chip} />
      <Abs x={40} y={y + 8} w={14} h={14} center>
        <Feather name={icon} size={14} color={tint} />
      </Abs>
      <Txt x={60} y={y + 7} size={13} weight="bold" font="inter" color={INK_LABEL} lineHeight={15.73}>
        {label}
      </Txt>
    </>
  );
}

/* --------------------------------- screen --------------------------------- */
export default function MessageThread() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();

  const [menuOpen, setMenuOpen] = useState(false);
  const [draft, setDraft] = useState("");

  const { data: channels = [] } = useChannels();
  const { data: me } = useMe();

  // ?id= names the thread; with no parameter the first channel is the one open.
  const channelId = id ?? channels[0]?.id ?? null;

  const send = useSendMessage(channelId ?? null);
  const onSendMessage = () => {
    const body = draft.trim();
    if (!body || !channelId || send.isPending) return;
    setDraft("");
    send.mutateAsync(body).catch(() => setDraft(body));
  };

  const channel = channels.find((c) => c.id === channelId);
  const channelName = channel?.name ?? "Baseskincare";

  const { data: messages = [] } = useMessages(channelId);
  const opener = messages[0];

  /**
   * The participant stack is everyone in the thread who is not the signed-in
   * user — two discs, then a "+N" chip for the rest, exactly as drawn.
   */
  const others = useMemo(() => {
    const names: string[] = [];
    for (const m of messages) {
      const who = m.authorName;
      if (!who || who === me?.name || names.includes(who)) continue;
      names.push(who);
    }
    return names;
  }, [messages, me]);
  const extra = Math.max(0, others.length - 2);

  const rooms = channels.filter((c) => !isDirect(c)).slice(0, ROOM_SLOTS.length);
  const dms = channels.filter(isDirect).slice(0, DM_SLOTS.length);

  return (
    <Screen height={FRAME_H} background="#F7F0E4" scroll>
      <Backdrop />

      {/* ------------------------------ Top Nav ----------------------------- */}
      <Abs x={0} y={0} w={FRAME_W} h={80} bg="rgba(253,253,246,0.75)" />
      <Pressable
        onPress={() => router.back()}
        style={({ pressed }) => [styles.navBack, pressed && styles.pressed]}
      >
        <Feather name="arrow-left" size={20} color={INK_NAV} />
      </Pressable>
      {/* Heading 1 — also the handle for the workspace/channel switcher. */}
      <Pressable
        onPress={() => setMenuOpen(true)}
        style={({ pressed }) => [styles.navHeading, pressed && styles.pressed]}
      >
        <Abs x={0} y={2} w={16} h={16} center>
          <Feather name="hash" size={16} color={INK_META} />
        </Abs>
        <Txt
          x={20} y={0} w={108.42}
          size={17} weight="bold" font="inter" color={INK_TITLE}
          lineHeight={20.57} letterSpacing={-0.3} numberOfLines={1}
        >
          {channelName}
        </Txt>
      </Pressable>

      {/* -------------------- Main → Brief Message Card ---------------------- */}
      <Abs x={CARD_X} y={CARD_Y} w={CARD_W} h={CARD_H} radius={24} style={styles.card}>
        <LinearGradient
          colors={["rgba(255,248,242,0.95)", "rgba(255,252,248,0.95)"] as const}
          start={{ x: -0.2, y: 0.06 }}
          end={{ x: 1.2, y: 0.94 }}
          style={styles.cardFill}
        />

        {/* Card header — the message that opened the thread and who else is in it. */}
        <Avatar x={25} y={25} size={44} paint={gradients.avatarA} stroke={2} />
        <Txt
          x={81} y={28.5} w={30.41}
          size={16} weight="bold" font="inter" color={INK_TITLE} lineHeight={19.36}
          numberOfLines={1}
        >
          {opener?.authorName ?? "Dev"}
        </Txt>
        <Txt
          x={81} y={50.5} w={50.73}
          size={12} weight="medium" font="inter" color={INK_META} lineHeight={14.52}
        >
          {opener ? clockLabel(opener.createdAt) : "11:55 AM"}
        </Txt>
        {others.slice(0, 2).map((name, i) => (
          <Avatar
            key={name}
            x={i === 0 ? 234 : 256}
            y={25}
            size={32}
            paint={AVATAR_PAINTS[i] ?? gradients.avatarB}
            stroke={2}
          />
        ))}
        {extra > 0 ? (
          <>
            <Abs x={278} y={25} w={32} h={32} radius={16} bg={GLASS_90} border={WHITE} borderWidth={2} style={styles.stackChip} />
            <Txt x={278} y={34} w={32} align="center" size={11} weight="bold" font="inter" color={INK_ROW} lineHeight={13.31}>
              {`+${extra}`}
            </Txt>
          </>
        ) : null}

        {/* Brief body — the design's five sections, clipped by the card. */}
        {CHIPS.map((c) => (
          <SectionChip key={c.label} {...c} />
        ))}
        {LINES.map((l) => (
          <Txt key={`${l.x}-${l.y}`} x={l.x} y={l.y} w={l.w} size={15} font="inter" color={INK_BODY} lineHeight={24}>
            {l.text}
          </Txt>
        ))}
      </Abs>

      {/* ----------------------------- Input Area --------------------------- */}
      <LinearGradient
        colors={["#FDFDF6", "#FDFDF6", "rgba(253,253,246,0)"] as const}
        locations={[0, 0.5, 1] as const}
        start={{ x: 0.5, y: 1 }}
        end={{ x: 0.5, y: 0 }}
        style={styles.inputArea}
      />
      <Abs
        x={20} y={785} w={335} h={58} radius={32}
        bg={GLASS_90} border="rgba(0,0,0,0.05)" borderWidth={1}
        style={styles.inputPill}
      />
      {/*
       * Posts to POST /channels/:id/messages; the author comes from the token,
       * never from here. On failure the draft is restored rather than lost.
       */}
      <TextInput
        value={draft}
        onChangeText={setDraft}
        onSubmitEditing={onSendMessage}
        placeholder={`Message #${channelName}`}
        placeholderTextColor={PLACEHOLDER}
        style={styles.input}
      />
      <LinearGradient
        colors={[
          "rgba(255,229,164,0.82)",
          "rgba(255,245,228,0.92)",
          "rgba(244,211,238,0.88)",
          "rgba(202,217,255,0.76)",
        ] as const}
        locations={[0, 0.35, 0.72, 1] as const}
        start={{ x: 0.11, y: -0.21 }}
        end={{ x: 0.89, y: 1.21 }}
        style={styles.sendButton}
      />
      <Abs x={317} y={805} w={18} h={18} center>
        <Feather name="send" size={18} color={SEND_INK} />
      </Abs>

      {/* --------------- Aside — Sidebar Panel (channel switcher) ------------ */}
      {menuOpen ? (
        <>
          <Pressable onPress={() => setMenuOpen(false)} style={styles.scrim} />
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
          <Txt
            x={144} y={33.5} w={161}
            size={19} weight="bold" font="inter" color={INK_TITLE}
            lineHeight={22.99} letterSpacing={-0.4} numberOfLines={1}
          >
            Socyio
          </Txt>
          <Txt x={144} y={58.5} w={161} size={13} weight="medium" font="inter" color={INK_META} lineHeight={15.73}>
            Workspace
          </Txt>
          <Pressable
            onPress={() => setMenuOpen(false)}
            style={({ pressed }) => [styles.panelClose, pressed && styles.pressed]}
          >
            <Feather name="x" size={20} color={CLOSE_INK} />
          </Pressable>

          {/* Agency Notifications */}
          <Txt
            x={83.25} y={125} w={164.27}
            size={12} weight="bold" font="inter" color={INK_SECTION}
            lineHeight={14.52} letterSpacing={0.8}
          >
            AGENCY NOTIFICATIONS
          </Txt>
          <Abs x={78} y={152} w={285} h={52} radius={18} />
          <Abs x={96} y={168} w={20} h={20} center>
            <MaterialCommunityIcons name="bullhorn-outline" size={20} color={DOT_ANNOUNCE} />
          </Abs>
          <Txt x={132} y={169} w={209} size={15} weight="bold" font="inter" color={INK_TITLE} lineHeight={18.15}>
            Announcements
          </Txt>
          <Abs x={341} y={174} w={8} h={8} radius={4} bg={DOT_ANNOUNCE} />

          {/* Campaigns — group threads; the open one carries the tint. */}
          <Txt
            x={83.25} y={232} w={81.02}
            size={12} weight="bold" font="inter" color={INK_SECTION}
            lineHeight={14.52} letterSpacing={0.8}
          >
            CAMPAIGNS
          </Txt>
          {rooms.map((c, i) => {
            const slot = ROOM_SLOTS[i];
            if (!slot) return null;
            const active = c.id === channelId;
            return (
              <Fragment key={c.id}>
                <Pressable
                  onPress={() => {
                    setMenuOpen(false);
                    router.push(`/chat/message?id=${c.id}`);
                  }}
                  style={({ pressed }) => [
                    styles.panelRow,
                    { top: slot.rowY, height: slot.rowH },
                    pressed && styles.pressed,
                  ]}
                >
                  {active ? (
                    <LinearGradient
                      colors={["rgba(235,228,255,0.7)", "rgba(255,235,242,0.7)"] as const}
                      start={{ x: 0.21, y: -1.16 }}
                      end={{ x: 0.79, y: 2.16 }}
                      style={[styles.rowTint, { top: slot.tintY - slot.rowY }]}
                    />
                  ) : null}
                </Pressable>
                <Abs x={96} y={slot.iconY} w={20} h={20} center>
                  <Feather name="hash" size={20} color={active ? HASH_ACTIVE : HASH_IDLE} />
                </Abs>
                <Txt
                  x={132} y={slot.textY} w={active ? 189.25 : 217}
                  size={15} weight={active ? "bold" : "medium"} font="inter"
                  color={active ? INK_ACTIVE : INK_ROW}
                  lineHeight={18.15} numberOfLines={1}
                >
                  {c.name}
                </Txt>
                {/*
                 * The badge counts the thread that is actually loaded. There is
                 * no per-channel unread counter in the schema, so only the open
                 * row can carry a real number.
                 */}
                {active && messages.length > 0 ? (
                  <>
                    <Abs x={321.25} y={slot.textY - 2.5} w={27.75} h={23} radius={12} bg={GLASS_80} style={styles.badge} />
                    <Txt
                      x={321.25} y={slot.textY + 1.5} w={27.75} align="center"
                      size={12} weight="bold" font="inter" color={BADGE_INK} lineHeight={14.52}
                    >
                      {String(messages.length)}
                    </Txt>
                  </>
                ) : null}
              </Fragment>
            );
          })}

          {/* Direct Messages */}
          <Txt
            x={83.25} y={395} w={125.55}
            size={12} weight="bold" font="inter" color={INK_SECTION}
            lineHeight={14.52} letterSpacing={0.8}
          >
            DIRECT MESSAGES
          </Txt>
          {dms.map((c, i) => {
            const slot = DM_SLOTS[i];
            if (!slot) return null;
            return (
              <Fragment key={c.id}>
                <Pressable
                  onPress={() => {
                    setMenuOpen(false);
                    router.push(`/chat/message?id=${c.id}`);
                  }}
                  style={({ pressed }) => [
                    styles.panelRow,
                    { top: slot.rowY, height: slot.rowH },
                    pressed && styles.pressed,
                  ]}
                />
                <Avatar
                  x={92}
                  y={slot.avatarY}
                  size={32}
                  paint={AVATAR_PAINTS[i % AVATAR_PAINTS.length] ?? gradients.avatarA}
                />
                {slot.online ? (
                  <Abs x={116} y={slot.avatarY + 24} w={10} h={10} radius={5} bg={DOT_ONLINE} border={WHITE} borderWidth={2} />
                ) : null}
                <Txt
                  x={136} y={slot.textY} w={slot.textW}
                  size={15} weight={slot.unread ? "bold" : "medium"} font="inter"
                  color={slot.unread ? INK_TITLE : INK_ROW}
                  lineHeight={18.15} numberOfLines={1}
                >
                  {c.name}
                </Txt>
                {slot.unread ? <Abs x={349.75} y={slot.textY + 5.5} w={8} h={8} radius={4} bg={DOT_UNREAD} /> : null}
              </Fragment>
            );
          })}

          {/* Footer / User Profile */}
          <Abs x={86} y={769} w={269} h={74} radius={24} bg={GLASS_80} border={WHITE} borderWidth={1} style={styles.profileCard} />
          <Avatar x={101} y={784} size={44} paint={gradients.avatarB} />
          <Txt
            x={159} y={788} w={181}
            size={15} weight="bold" font="inter" color={INK_TITLE}
            lineHeight={18.15} numberOfLines={1}
          >
            {me?.name ?? "Sophia Roy"}
          </Txt>
          <Txt
            x={159} y={808} w={181}
            size={13} weight="medium" font="inter" color={INK_META}
            lineHeight={15.73} numberOfLines={1}
          >
            {me ? handleOf(me.name) : "@Sophiaroy"}
          </Txt>
        </>
      ) : null}
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
  navHeading: { position: "absolute", left: 130, top: 30, width: 128.42, height: 20 },

  card: {
    overflow: "hidden",
    shadowColor: "#000000",
    shadowOpacity: 0.04,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 12 },
    elevation: 2,
  },
  // Border lives on the fill so the card's absolute children keep spec offsets.
  cardFill: {
    position: "absolute",
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: WHITE,
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

  inputArea: { position: "absolute", left: 0, top: 769, width: FRAME_W, height: 106 },
  inputPill: {
    shadowColor: "#000000",
    shadowOpacity: 0.06,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 10 },
    elevation: 3,
  },
  input: {
    position: "absolute",
    left: 37,
    top: 804,
    width: 259,
    height: 20,
    padding: 0,
    fontFamily: fonts.inter,
    fontSize: 15,
    color: INK_TITLE,
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

  scrim: {
    position: "absolute",
    left: 0,
    top: 0,
    width: FRAME_W,
    height: FRAME_H,
    backgroundColor: "rgba(181,180,185,0.57)",
  },
  panel: {
    position: "absolute",
    left: 65,
    top: 0,
    width: 310,
    height: FRAME_H,
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
  },
  panelClose: {
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
  panelRow: { position: "absolute", left: 78, width: 285, borderRadius: 18 },
  rowTint: {
    position: "absolute",
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
    borderRadius: 18,
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
