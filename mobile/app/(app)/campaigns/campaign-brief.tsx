import { Fragment, useState } from "react";
import { Image, Pressable, ScrollView, StyleSheet, TextInput } from "react-native";
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
import { Abs, Screen, Txt } from "../../../src/ui/Frame";
import { colors, fonts, gradients } from "../../../src/theme";
import {
  useCampaignBriefs,
  useCampaigns,
  useChannels,
  useCreate,
  useMessages,
  useSendMessage,
  useUpdate,
  useUsers,
  type CampaignBrief as BriefRecord,
} from "../../../src/api/hooks";

/**
 * Campaign Brief — Figma 7333:16942 "chat" (375x875), traced 1:1.
 *
 * A channel-style thread carrying one structured brief card. The card is a
 * 335x663 glass panel at (20,106) that clips its own content (clipsContent in
 * the spec: the five sections stack to 765pt), so the brief scrolls inside the
 * card while the hash-titled top nav and the composer stay pinned exactly where
 * the frame puts them.
 *
 * Coordinates below are raw frame coordinates from the spec. CX/CY rebase them
 * into the card's scroll content so the numbers in this file stay the numbers in
 * Figma.
 */

/* ------------------------------- geometry -------------------------------- */
const FRAME_W = 375;
const FRAME_H = 875;

const CARD = { x: 20, y: 106, w: 335, h: 663 } as const;
/** Card padding 24 + the section stack (25..847 in frame space) + padding 24. */
const CARD_CONTENT_H = 766;

/** Frame coordinate -> card-scroll coordinate. */
const CX = (n: number) => n - CARD.x;
const CY = (n: number) => n - CARD.y;

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

/* -------------------------- brief section chrome -------------------------- */
/**
 * The five labelled sections. Pill width, icon box and label offsets are the
 * spec's hug-widths; the icons are the iconify glyphs the frame ships, matched
 * by their exported vector bounding boxes.
 */
const SECTIONS = [
  {
    key: "key-message",
    label: "Key Message",
    pillY: 203, pillW: 135.19, iconY: 211, labelY: 210, labelW: 85.19,
    icon: <MaterialCommunityIcons name="creation-outline" size={14} color="#f57c00" />,
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
    icon: <MaterialCommunityIcons name="format-list-checks" size={14} color="#388e3c" />,
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
 * Brief copy. `CampaignBrief` (one row per campaign) now backs every word of
 * this card — keyMessage / targetAudience are the two paragraphs and the three
 * String[] columns are the bullet lists, in the order drawn here. The literals
 * below are the seed a campaign with no brief row yet opens on, so an unsaved
 * card looks exactly as the design draws it and saving keeps what is on screen.
 *
 * Heights are the design's line count x the 24pt line height, so each field is
 * an input of exactly the box the text already occupied — nothing reflows.
 */
const KEY_MESSAGE = "Celebrating your natural glow and how\nour serum enhances it effortlessly.";
const TARGET_AUDIENCE = "Gen Z & young millennial women\nlooking for minimal, effective skincare.";

/** Which String[] column a bullet row belongs to, and its slot in that array. */
type ListKey = "guidelines" | "deliverables" | "notes";
type BulletSpec = {
  list: ListKey; index: number; y: number; w: number; h: number; text: string;
};

const GUIDELINES: BulletSpec[] = [
  { list: "guidelines", index: 0, y: 473, w: 176.77, h: 24, text: "Morning skincare routine" },
  { list: "guidelines", index: 1, y: 503, w: 204.86, h: 48, text: "Use product naturally in your\nbathroom" },
  { list: "guidelines", index: 2, y: 557.5, w: 216.58, h: 24, text: "Mention the hydration benefits" },
];
const DELIVERABLES: BulletSpec[] = [
  { list: "deliverables", index: 0, y: 648, w: 143.42, h: 24, text: "Duration: 20–40 sec" },
  { list: "deliverables", index: 1, y: 678.5, w: 207.73, h: 24, text: "Format: Instagram Reel (9:16)" },
];
const NOTES: BulletSpec[] = [
  { list: "notes", index: 0, y: 769, w: 179.53, h: 24, text: "Avoid using beauty filters" },
  { list: "notes", index: 1, y: 799, w: 172.44, h: 48, text: "Keep tone authentic and\nconversational" },
];
const BULLETS: BulletSpec[] = [...GUIDELINES, ...DELIVERABLES, ...NOTES];

/* -------------------------------- helpers --------------------------------- */
/** "11:55 AM" — the clock format the card header uses. */
function clockLabel(iso: string): string {
  const d = new Date(iso);
  const h = d.getHours() % 12 || 12;
  const suffix = d.getHours() >= 12 ? "PM" : "AM";
  return `${h}:${String(d.getMinutes()).padStart(2, "0")} ${suffix}`;
}

/* -------------------------------- backdrop -------------------------------- */
/** Frame fill: warm vertical base plus four soft radial glows. */
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

/* -------------------------------- avatars --------------------------------- */
/**
 * White-ringed circular avatar. The spec fills these with images; when a user
 * has no avatarUrl the app's gradient placeholder fills the same circle so the
 * stack keeps its geometry.
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
 * One list item. The spec exports the item text at x=67 inside a list frame at
 * x=45; the 22pt indent is Figma's unordered marker, whose glyph is a bare
 * space in the frame — so the row is indented text with no visible dot.
 *
 * The text is an input rather than a label — same x/y/width, same 15pt Inter at
 * lineHeight 24 in INK_BODY, and a height fixed to the design's line count, so
 * the editable row occupies exactly the box the static row did.
 */
function Bullet({
  spec,
  value,
  onChangeText,
  editable,
}: {
  spec: BulletSpec;
  value: string;
  onChangeText: (next: string) => void;
  editable: boolean;
}) {
  return (
    <TextInput
      value={value}
      onChangeText={onChangeText}
      editable={editable}
      multiline
      style={[
        styles.field,
        { left: CX(67), top: CY(spec.y), width: spec.w, height: spec.h },
      ]}
    />
  );
}

/* --------------------------------- screen --------------------------------- */
export default function CampaignBrief() {
  const router = useRouter();
  /* `id` is the campaign whose brief this card edits — active-campaigns and the
     agency campaign detail both push it. `channelId` still selects the thread. */
  const { channelId, id } = useLocalSearchParams<{ channelId?: string; id?: string }>();

  const { data: channels = [] } = useChannels();
  const channel = channels.find((c) => c.id === channelId) ?? channels[0];
  const channelName = channel?.name ?? "Baseskincare";

  // The brief is the opening message of the thread.
  const { data: messages = [] } = useMessages(channel?.id ?? null);
  const brief = messages[0];

  const { data: users = [] } = useUsers();
  const senderName = brief?.authorName ?? "Dev";
  const sender = users.find((u) => u.name === senderName);
  // The design stacks two avatars and a "+2" overflow chip.
  const participants = users.slice(0, 2);
  const overflow = users.length ? users.length - participants.length : 2;

  /* ------------------------- the brief being edited ---------------------- */
  /* CampaignBrief is unique per campaign, so this card always edits exactly one
     row: PATCH when the campaign already has a brief, POST the first one
     otherwise. A deep link with no id falls back to the first campaign, the same
     way the channel above resolves when no channelId is passed. */
  const { data: campaigns = [] } = useCampaigns();
  const campaign = campaigns.find((c) => c.id === id) ?? campaigns[0];
  const { data: briefs = [] } = useCampaignBriefs();
  const record = briefs.find((b) => b.campaignId === campaign?.id);

  /* Typed edits are held as overrides, so each field adopts its saved value the
     moment /campaign-briefs lands — no effect, and the geometry never moves. A
     failed save leaves this untouched, so the typed brief survives the retry. */
  const [edits, setEdits] = useState<Record<string, string | undefined>>({});
  const setField = (key: string, next: string) =>
    setEdits((e) => ({ ...e, [key]: next }));

  /* Once a row exists its columns are authoritative — a bullet the user cleared
     stays cleared rather than re-seeding from the design's copy. Only a campaign
     with no brief at all opens on the literals. */
  const slotOf = (list: string[], i: number) => (i < list.length ? list[i] : "");
  const paragraph = (key: "keyMessage" | "targetAudience", seed: string) =>
    edits[key] ?? (record ? record[key] ?? "" : seed);
  const bulletValue = (b: BulletSpec) =>
    edits[`${b.list}.${b.index}`] ?? (record ? slotOf(record[b.list], b.index) : b.text);
  const listValue = (list: ListKey) =>
    BULLETS.filter((b) => b.list === list)
      .map((b) => bulletValue(b).trim())
      .filter((s) => s.length > 0);

  const createBrief = useCreate<BriefRecord>("campaign-briefs");
  const updateBrief = useUpdate<BriefRecord>("campaign-briefs");
  const sendMessage = useSendMessage(channel?.id ?? null);

  const [draft, setDraft] = useState("");
  const saving = createBrief.isPending || updateBrief.isPending || sendMessage.isPending;
  const failed = createBrief.isError || updateBrief.isError || sendMessage.isError;

  /* Send is the frame's only action, so it commits both halves of the screen:
     the edited brief card (only when something was actually changed, so merely
     chatting never writes the seed copy into an empty campaign) and the composer
     line, if one was typed. Nothing is cleared unless its write succeeded. */
  const onSendMessage = () => {
    if (saving) return;
    if (campaign && Object.keys(edits).length > 0) {
      const data = {
        keyMessage: paragraph("keyMessage", KEY_MESSAGE).trim() || null,
        targetAudience: paragraph("targetAudience", TARGET_AUDIENCE).trim() || null,
        guidelines: listValue("guidelines"),
        deliverables: listValue("deliverables"),
        notes: listValue("notes"),
      };
      if (record) updateBrief.mutate({ id: record.id, data });
      else createBrief.mutate({ campaignId: campaign.id, ...data });
    }
    const body = draft.trim();
    if (body && channel) sendMessage.mutate(body, { onSuccess: () => setDraft("") });
  };

  return (
    <Screen height={FRAME_H} background="#F7F0E4" scroll>
      <Backdrop />

      {/* ----------------------- Main -> Brief Message Card ------------------ */}
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
          x={CX(101)} y={CY(134.5)} size={16} weight="bold" font="inter"
          color={INK_TITLE} lineHeight={19.36} numberOfLines={1}
        >
          {senderName}
        </Txt>
        <Txt
          x={CX(101)} y={CY(156.5)} size={12} weight="medium" font="inter"
          color={INK_META} lineHeight={14.52}
        >
          {brief ? clockLabel(brief.createdAt) : "11:55 AM"}
        </Txt>

        {participants.map((u, i) => (
          <Avatar
            key={u.id}
            x={CX(254 + i * 22)}
            y={CY(131)}
            size={32}
            uri={u.avatarUrl}
            tint={i === 0 ? gradients.avatarB : gradients.avatarC}
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
        {/* Both paragraphs are inputs at the spec's x/y/width, in the same 15pt
            Inter / lineHeight 24 / INK_BODY ramp, boxed to their two-line height
            (2 x 24) so the editable block occupies the static block's exact box. */}
        <TextInput
          value={paragraph("keyMessage", KEY_MESSAGE)}
          onChangeText={(t) => setField("keyMessage", t)}
          editable={!saving}
          multiline
          style={[styles.field, { left: CX(49), top: CY(245), width: 281, height: 48 }]}
        />
        <TextInput
          value={paragraph("targetAudience", TARGET_AUDIENCE)}
          onChangeText={(t) => setField("targetAudience", t)}
          editable={!saving}
          multiline
          style={[styles.field, { left: CX(49), top: CY(359), width: 281, height: 48 }]}
        />

        {BULLETS.map((b) => (
          <Bullet
            key={`${b.list}.${b.index}`}
            spec={b}
            value={bulletValue(b)}
            onChangeText={(t) => setField(`${b.list}.${b.index}`, t)}
            editable={!saving}
          />
        ))}

        {/* Save failed — the retry is the send button itself and every edit is
            still in state. This sits inside the card's own bottom padding (the
            sections stop at CY(847)=741 of the 766pt content), so nothing above
            it moves and it is absent unless a write actually failed. */}
        {failed ? (
          <Txt
            x={CX(49)} y={748} w={281} size={11} weight="medium" font="inter"
            color={colors.danger} lineHeight={14} numberOfLines={1}
          >
            Could not save the brief. Tap send to try again.
          </Txt>
        ) : null}
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
        x={150} y={30} size={17} weight="bold" font="inter"
        color={INK_TITLE} lineHeight={20.57} letterSpacing={-0.3} numberOfLines={1}
      >
        {channelName}
      </Txt>

      {/* ------------------------------ Input Area -------------------------- */}
      <LinearGradient
        colors={["#fdfdf6", "rgba(253,253,246,0)"]}
        locations={[0.5, 1]}
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
        editable={!saving}
        style={styles.input}
      />
      <Pressable
        onPress={onSendMessage}
        /* Inert while a write is in flight, so a double tap cannot post the
           brief twice or duplicate the message. */
        disabled={saving}
        style={({ pressed }) => [styles.sendButton, (pressed || saving) && styles.pressed]}
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
            <RadialGradient id="btnPink" cx="31.68" cy="38.72" rx="37.84" ry="69.96" gradientUnits="userSpaceOnUse">
              <Stop offset="0" stopColor="#F7B7DA" stopOpacity="0.4" />
              <Stop offset="0.22" stopColor="#F7B7DA" stopOpacity="0" />
            </RadialGradient>
            <RadialGradient id="btnGold" cx="36.08" cy="7.92" rx="40.92" ry="75.68" gradientUnits="userSpaceOnUse">
              <Stop offset="0" stopColor="#F6D64A" stopOpacity="0.3" />
              <Stop offset="0.18" stopColor="#F6D64A" stopOpacity="0" />
            </RadialGradient>
            <RadialGradient id="btnHaze" cx="7.92" cy="8.8" rx="40.92" ry="75.24" gradientUnits="userSpaceOnUse">
              <Stop offset="0" stopColor="#FFFFFF" stopOpacity="0.72" />
              <Stop offset="0.2" stopColor="#FFFFFF" stopOpacity="0" />
            </RadialGradient>
          </Defs>
          <Rect width={44} height={44} fill="url(#btnPink)" />
          <Rect width={44} height={44} fill="url(#btnGold)" />
          <Rect width={44} height={44} fill="url(#btnHaze)" />
        </Svg>
        <Feather name="send" size={18} color="#3a3a3a" />
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  backdrop: { position: "absolute", left: 0, top: 0 },
  pressed: { opacity: 0.85 },

  /* Main -> Brief Message Card (20,106 335x663 r24) */
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
  /* Brief body copy, now editable: the spec's 15pt Inter at lineHeight 24 in
     INK_BODY, with the platform's default input padding zeroed so the glyphs
     land on the same baseline the static text did. Each field supplies its own
     left/top/width/height from the spec. */
  field: {
    position: "absolute",
    padding: 0,
    fontFamily: fonts.inter,
    fontSize: 15,
    lineHeight: 24,
    color: INK_BODY,
    textAlignVertical: "top",
    includeFontPadding: false,
  },

  /* Top Nav */
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
