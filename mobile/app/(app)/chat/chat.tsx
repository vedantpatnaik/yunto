import { Fragment, useMemo, useState } from "react";
import { Image, Pressable, ScrollView, StyleSheet, TextInput } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
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
import { fonts, gradients } from "../../../src/theme";
import { useChannels, useMe, useMessages, useSendMessage, useUsers } from "../../../src/api/hooks";

/**
 * Chat — Figma 7333:16942 "chat" (375x875), traced 1:1.
 *
 * One conversation with a brand, agency or collaborator. The thread's current
 * message is a 335x663 glass card at (20,106) that clips its own content — the
 * spec sets clipsContent and stacks five labelled sections down to y=847, past
 * the card's own bottom edge at 769 — so the message scrolls inside the card
 * while the hash-titled top nav and the composer stay pinned where the frame
 * puts them.
 *
 * Coordinates are raw frame coordinates from the spec; CX/CY rebase them into
 * the card's scroll content so the numbers in this file stay the numbers in
 * Figma. <Screen> scales the 375pt canvas.
 */

/* ------------------------------- geometry -------------------------------- */
const FRAME_W = 375;
const FRAME_H = 875;

const CARD = { x: 20, y: 106, w: 335, h: 663 } as const;
/** 24pt card padding + the section stack (131..847.5 in frame space) + 24pt. */
const CARD_CONTENT_H = 766;

/** Frame coordinate -> card-scroll coordinate. */
const CX = (n: number) => n - CARD.x;
const CY = (n: number) => n - CARD.y;

/** Participant stack: two 32pt avatars stepping 22pt (a -10 overlap), then +N. */
const STACK_X = 254;
const STACK_STEP = 22;
const STACK_CAP = 2;

/* --------------------------- spec colour tokens --------------------------- */
const INK_TITLE = "#1a1a1a";
const INK_LABEL = "#333333";
const INK_BODY = "#444444";
const INK_OVERFLOW = "#555555";
const INK_META = "#888888";
const INK_PLACEHOLDER = "#999999";
const NAV_FILL = "rgba(253,253,246,0.75)";
const GLASS_65 = "rgba(255,255,255,0.65)";
const GLASS_85 = "rgba(255,255,255,0.85)";
const GLASS_90 = "rgba(255,255,255,0.9)";
const HAIRLINE = "rgba(255,255,255,0.9)";

/* ------------------------------ message body ------------------------------ */
/**
 * The five labelled sections of the message card. Pill widths, icon boxes and
 * label offsets are the spec's hug-widths; each icon is matched to the iconify
 * glyph the frame exports by its vector bounding box (the back arrow, hash and
 * send glyphs land on Feather exactly, 14/24 and 20/24 of their icon box).
 */
const SECTIONS = [
  {
    key: "key-message",
    label: "Key Message",
    pillY: 203, pillW: 135.19, iconY: 211, labelY: 210, labelW: 85.19,
    icon: <Feather name="message-circle" size={14} color="#f57c00" />,
  },
  {
    key: "target-audience",
    label: "Target Audience",
    pillY: 317, pillW: 154.8, iconY: 325, labelY: 324, labelW: 104.8,
    icon: <Feather name="users" size={14} color="#1976d2" />,
  },
  {
    key: "guidelines",
    label: "Guidelines",
    pillY: 431, pillW: 117.48, iconY: 439, labelY: 438, labelW: 67.48,
    icon: <Feather name="check" size={14} color="#388e3c" />,
  },
  {
    key: "deliverables",
    label: "Deliverables",
    pillY: 606, pillW: 128.89, iconY: 614, labelY: 613, labelW: 78.89,
    icon: <Feather name="video" size={14} color="#7b1fa2" />,
  },
  {
    key: "notes",
    label: "Notes",
    pillY: 727, pillW: 87.55, iconY: 735, labelY: 734, labelW: 37.55,
    icon: <Feather name="alert-circle" size={14} color="#d32f2f" />,
  },
] as const;

/**
 * Message copy. Message in the schema is a flat `body` string — there is no
 * brief model with key-message/audience/guideline fields — so the structured
 * paragraphs and bullets stay the design's literals, while everything the
 * backend does model (channel, sender, timestamp, participants) is live below.
 */
const KEY_MESSAGE = "Celebrating your natural glow and how\nour serum enhances it effortlessly.";
const TARGET_AUDIENCE = "Gen Z & young millennial women\nlooking for minimal, effective skincare.";

/** Bulleted lists: y/w are the TEXT node's own frame coordinates. */
const BULLETS = [
  // Guidelines
  { y: 473, w: 176.77, text: "Morning skincare routine" },
  { y: 503, w: 204.86, text: "Use product naturally in your\nbathroom" },
  { y: 557.5, w: 216.58, text: "Mention the hydration benefits" },
  // Deliverables
  { y: 648, w: 143.42, text: "Duration: 20–40 sec" },
  { y: 678.5, w: 207.73, text: "Format: Instagram Reel (9:16)" },
  // Notes
  { y: 769, w: 179.53, text: "Avoid using beauty filters" },
  { y: 799, w: 172.44, text: "Keep tone authentic and\nconversational" },
];

/* -------------------------------- helpers --------------------------------- */
/** "11:55 AM" — the clock format the card header uses. */
function clockLabel(iso: string): string {
  const d = new Date(iso);
  const h = d.getHours() % 12 || 12;
  const suffix = d.getHours() >= 12 ? "PM" : "AM";
  return `${h}:${String(d.getMinutes()).padStart(2, "0")} ${suffix}`;
}

/** Placeholder tints for participants with no uploaded avatar. */
const TINTS = [gradients.avatarB, gradients.avatarC] as const;

/* -------------------------------- backdrop -------------------------------- */
/** Frame fill: a warm vertical base plus four soft radial glows. */
function Backdrop() {
  return (
    <Svg width={FRAME_W} height={FRAME_H} style={styles.backdrop}>
      <Defs>
        <SvgLinear id="chatBase" x1="187.5" y1="0" x2="187.5" y2={FRAME_H} gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#F7F0E4" />
          <Stop offset="1" stopColor="#F4EBDD" />
        </SvgLinear>
        <RadialGradient id="chatPink" cx="285" cy="542.5" rx="1027.5" ry="568.75" gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#F7B7DA" stopOpacity="0.34" />
          <Stop offset="0.26" stopColor="#F7B7DA" stopOpacity="0" />
        </RadialGradient>
        <RadialGradient id="chatBlue" cx="90" cy="367.5" rx="967.5" ry="533.75" gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#BACDF4" stopOpacity="0.36" />
          <Stop offset="0.24" stopColor="#BACDF4" stopOpacity="0" />
        </RadialGradient>
        <RadialGradient id="chatGold" cx="292.5" cy="157.5" rx="1338.75" ry="735" gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#F6D64A" stopOpacity="0.22" />
          <Stop offset="0.2" stopColor="#F6D64A" stopOpacity="0" />
        </RadialGradient>
        <RadialGradient id="chatHaze" cx="75" cy="87.5" rx="1466.25" ry="805" gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#FFFFFF" stopOpacity="0.72" />
          <Stop offset="0.24" stopColor="#FFFFFF" stopOpacity="0" />
        </RadialGradient>
      </Defs>
      <Rect width={FRAME_W} height={FRAME_H} fill="url(#chatBase)" />
      <Rect width={FRAME_W} height={FRAME_H} fill="url(#chatPink)" />
      <Rect width={FRAME_W} height={FRAME_H} fill="url(#chatBlue)" />
      <Rect width={FRAME_W} height={FRAME_H} fill="url(#chatGold)" />
      <Rect width={FRAME_W} height={FRAME_H} fill="url(#chatHaze)" />
    </Svg>
  );
}

/* -------------------------------- avatars --------------------------------- */
/**
 * White-ringed circular avatar. The spec fills these with images; when a user
 * has no avatarUrl the app's gradient placeholder fills the same circle so the
 * stack keeps its geometry either way.
 */
function Avatar({
  x, y, size, uri, tint,
}: {
  x: number; y: number; size: number;
  uri?: string; tint: readonly [string, string];
}) {
  const inner = { width: size - 4, height: size - 4, borderRadius: size / 2 };
  return (
    <Abs
      x={x}
      y={y}
      w={size}
      h={size}
      radius={size / 2}
      border="#ffffff"
      borderWidth={2}
      center
      style={[styles.avatar, { shadowRadius: size >= 44 ? 12 : 6 }]}
    >
      {uri ? (
        <Image source={{ uri }} style={inner} />
      ) : (
        <LinearGradient colors={tint} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={inner} />
      )}
    </Abs>
  );
}

/* --------------------------------- bullets -------------------------------- */
/**
 * One list item. The spec exports item text at x=67 inside a list frame at
 * x=45; the 22pt indent is Figma's unordered marker (the empty " " TEXT node
 * paired with every item), redrawn here as the dot.
 */
function Bullet({ y, w, children }: { y: number; w: number; children: string }) {
  return (
    <Fragment>
      <Abs x={CX(55)} y={CY(y) + 10} w={4} h={4} radius={2} bg={INK_BODY} />
      <Txt x={CX(67)} y={CY(y)} w={w} size={15} font="inter" color={INK_BODY} lineHeight={24}>
        {children}
      </Txt>
    </Fragment>
  );
}

/* --------------------------------- screen --------------------------------- */
export default function Chat() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();

  // Conversations with brands, agencies and collaborators are ChatChannels;
  // ?id= selects one, otherwise the first channel opens.
  const { data: channels = [] } = useChannels();
  const channel = channels.find((c) => c.id === id) ?? channels[0];
  const channelName = channel?.name ?? "Baseskincare";

  const { data: messages = [], isLoading: threadLoading } = useMessages(channel?.id ?? null);
  const { data: users = [] } = useUsers();
  const { data: me } = useMe();

  // The card shows the thread's most recent message; its header is that
  // message's author and time.
  const latest = messages.length ? messages[messages.length - 1] : undefined;
  const senderName = latest?.authorName;
  const sender = users.find((u) => u.name === senderName);

  /**
   * The right-hand stack is everyone else in the conversation: distinct authors
   * in the thread, most recent first, minus the sender already shown on the
   * left and minus yourself. Two fit the design; the rest become the "+N" chip.
   */
  const others = useMemo(() => {
    const seen = new Set<string>();
    if (senderName) seen.add(senderName);
    if (me?.name) seen.add(me.name);
    const out: string[] = [];
    for (let i = messages.length - 1; i >= 0; i--) {
      const name = messages[i].authorName;
      if (!name || seen.has(name)) continue;
      seen.add(name);
      out.push(name);
    }
    return out;
  }, [messages, senderName, me]);

  const stack = others.slice(0, STACK_CAP);
  const overflow = others.length - stack.length;

  // Composer: posts to POST /channels/:id/messages. The draft is restored if
  // the request fails, so a dropped connection never silently eats what was typed.
  const [draft, setDraft] = useState("");
  const send = useSendMessage(channel?.id ?? null);
  const onSendMessage = () => {
    const body = draft.trim();
    if (!body || !channel?.id || send.isPending) return;
    setDraft("");
    send.mutateAsync(body).catch(() => setDraft(body));
  };

  return (
    <Screen height={FRAME_H} background="#F7F0E4" scroll>
      <Backdrop />

      {/* ------------------------ Main -> Message Card ----------------------- */}
      <LinearGradient
        colors={["rgba(255,248,242,0.95)", "rgba(255,252,248,0.95)"]}
        start={{ x: -0.2, y: 0.06 }}
        end={{ x: 1.2, y: 0.94 }}
        style={styles.card}
      />
      <ScrollView
        style={styles.cardScroll}
        contentContainerStyle={styles.cardContent}
        nestedScrollEnabled
        showsVerticalScrollIndicator={false}
      >
        {/* ----------------------------- Card Header ------------------------ */}
        <Avatar
          x={CX(45)}
          y={CY(131)}
          size={44}
          uri={sender?.avatarUrl}
          tint={gradients.avatarA}
        />
        <Txt
          x={CX(101)} y={CY(134.5)} w={220} size={16} weight="bold" font="inter"
          color={INK_TITLE} lineHeight={19.36} numberOfLines={1}
        >
          {senderName ?? (threadLoading ? "Loading…" : channelName)}
        </Txt>
        <Txt
          x={CX(101)} y={CY(156.5)} w={120} size={12} weight="medium" font="inter"
          color={INK_META} lineHeight={14.52} numberOfLines={1}
        >
          {latest ? clockLabel(latest.createdAt) : ""}
        </Txt>

        {stack.map((name, i) => (
          <Avatar
            key={name}
            x={CX(STACK_X + i * STACK_STEP)}
            y={CY(131)}
            size={32}
            uri={users.find((u) => u.name === name)?.avatarUrl}
            tint={TINTS[i % TINTS.length]}
          />
        ))}
        {overflow > 0 ? (
          <Abs
            x={CX(298)} y={CY(131)} w={32} h={32} radius={16}
            bg={GLASS_90} border="#ffffff" borderWidth={2} center
            style={styles.overflowChip}
          >
            <Txt size={11} weight="bold" font="inter" color={INK_OVERFLOW} lineHeight={13.31}>
              {`+${overflow}`}
            </Txt>
          </Abs>
        ) : null}

        {/* --------------------------- Section pills ------------------------ */}
        {SECTIONS.map((s) => (
          <Fragment key={s.key}>
            <Abs
              x={CX(45)} y={CY(s.pillY)} w={s.pillW} h={30} radius={14}
              bg={GLASS_85} border="#ffffff" borderWidth={1} style={styles.pill}
            />
            <Abs x={CX(60)} y={CY(s.iconY)} w={14} h={14} center>
              {s.icon}
            </Abs>
            <Txt
              x={CX(80)} y={CY(s.labelY)} w={s.labelW} size={13} weight="bold"
              font="inter" color={INK_LABEL} lineHeight={15.73}
            >
              {s.label}
            </Txt>
          </Fragment>
        ))}

        {/* ------------------------- Section bodies ------------------------- */}
        <Txt
          x={CX(49)} y={CY(245)} w={281} size={15} font="inter"
          color={INK_BODY} lineHeight={24}
        >
          {KEY_MESSAGE}
        </Txt>
        <Txt
          x={CX(49)} y={CY(359)} w={281} size={15} font="inter"
          color={INK_BODY} lineHeight={24}
        >
          {TARGET_AUDIENCE}
        </Txt>

        {BULLETS.map((b) => (
          <Bullet key={b.text} y={b.y} w={b.w}>
            {b.text}
          </Bullet>
        ))}
      </ScrollView>

      {/* -------------------------------- Top Nav --------------------------- */}
      <Abs x={0} y={0} w={FRAME_W} h={80} bg={NAV_FILL} />
      <Pressable
        onPress={() => router.back()}
        style={({ pressed }) => [styles.navButton, pressed && styles.pressed]}
      >
        <Feather name="arrow-left" size={20} color="#1c1c1e" />
      </Pressable>
      <Abs x={130} y={32} w={16} h={16} center>
        <Feather name="hash" size={16} color={INK_META} />
      </Abs>
      <Txt
        x={150} y={30} w={108.42} size={17} weight="bold" font="inter"
        color={INK_TITLE} lineHeight={20.57} letterSpacing={-0.3} numberOfLines={1}
      >
        {channelName}
      </Txt>

      {/* ------------------------------ Input Area -------------------------- */}
      <LinearGradient
        colors={["#fdfdf6", "#fdfdf6", "rgba(253,253,246,0)"]}
        locations={[0, 0.5, 1]}
        start={{ x: 0.5, y: 1 }}
        end={{ x: 0.5, y: 0 }}
        style={styles.inputArea}
      />
      <Abs
        x={20} y={785} w={335} h={58} radius={32}
        bg={GLASS_90} border="rgba(0,0,0,0.05)" borderWidth={1}
        style={styles.composer}
      />
      <TextInput
        value={draft}
        onChangeText={setDraft}
        onSubmitEditing={onSendMessage}
        placeholder={`Message #${channelName}`}
        placeholderTextColor={INK_PLACEHOLDER}
        returnKeyType="send"
        style={styles.input}
      />
      <Pressable
        onPress={onSendMessage}
        style={({ pressed }) => [styles.sendButton, pressed && styles.pressed]}
      >
        <LinearGradient
          colors={[
            "rgba(255,229,164,0.82)",
            "rgba(255,245,228,0.92)",
            "rgba(244,211,238,0.88)",
            "rgba(202,217,255,0.76)",
          ]}
          locations={[0, 0.35, 0.72, 1]}
          start={{ x: 0.11, y: -0.21 }}
          end={{ x: 0.89, y: 1.21 }}
          style={StyleSheet.absoluteFill}
        />
        <Svg width={44} height={44} style={StyleSheet.absoluteFill}>
          <Defs>
            <RadialGradient id="chatSendPink" cx="31.68" cy="38.72" rx="37.84" ry="69.96" gradientUnits="userSpaceOnUse">
              <Stop offset="0" stopColor="#F7B7DA" stopOpacity="0.4" />
              <Stop offset="0.22" stopColor="#F7B7DA" stopOpacity="0" />
            </RadialGradient>
            <RadialGradient id="chatSendGold" cx="36.08" cy="7.92" rx="40.92" ry="75.68" gradientUnits="userSpaceOnUse">
              <Stop offset="0" stopColor="#F6D64A" stopOpacity="0.3" />
              <Stop offset="0.18" stopColor="#F6D64A" stopOpacity="0" />
            </RadialGradient>
            <RadialGradient id="chatSendHaze" cx="7.92" cy="8.8" rx="40.92" ry="75.24" gradientUnits="userSpaceOnUse">
              <Stop offset="0" stopColor="#FFFFFF" stopOpacity="0.72" />
              <Stop offset="0.2" stopColor="#FFFFFF" stopOpacity="0" />
            </RadialGradient>
          </Defs>
          <Rect width={44} height={44} fill="url(#chatSendPink)" />
          <Rect width={44} height={44} fill="url(#chatSendGold)" />
          <Rect width={44} height={44} fill="url(#chatSendHaze)" />
        </Svg>
        <Feather name="send" size={18} color="#3a3a3a" />
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  backdrop: { position: "absolute", left: 0, top: 0 },
  pressed: { opacity: 0.85 },

  /* Main -> Message Card (20,106 335x663 r24) */
  card: {
    position: "absolute",
    left: CARD.x,
    top: CARD.y,
    width: CARD.w,
    height: CARD.h,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#ffffff",
    shadowColor: "#000000",
    shadowOpacity: 0.04,
    shadowRadius: 40,
    shadowOffset: { width: 0, height: 12 },
    elevation: 2,
  },
  cardScroll: {
    position: "absolute",
    left: CARD.x,
    top: CARD.y,
    width: CARD.w,
    height: CARD.h,
    borderRadius: 24,
    overflow: "hidden",
  },
  cardContent: { width: CARD.w, height: CARD_CONTENT_H },

  avatar: {
    overflow: "hidden",
    shadowColor: "#000000",
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  overflowChip: {
    shadowColor: "#000000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  pill: {
    shadowColor: "#000000",
    shadowOpacity: 0.02,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },

  /* Top Nav (0,0 375x80) */
  navButton: {
    position: "absolute",
    left: 20,
    top: 18,
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: GLASS_65,
    borderWidth: 1,
    borderColor: HAIRLINE,
    shadowColor: "#000000",
    shadowOpacity: 0.03,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },

  /* Input Area (0,769 375x106) */
  inputArea: {
    position: "absolute",
    left: 0,
    top: 769,
    width: FRAME_W,
    height: 106,
  },
  composer: {
    shadowColor: "#000000",
    shadowOpacity: 0.06,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 10 },
    elevation: 4,
  },
  input: {
    position: "absolute",
    left: 39,
    top: 805,
    width: 255,
    height: 18,
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
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    shadowColor: "#f48fb1",
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
});
