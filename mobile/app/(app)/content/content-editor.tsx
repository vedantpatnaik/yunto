import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, TextInput, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Svg, {
  Defs,
  LinearGradient as SvgLinear,
  RadialGradient,
  Rect,
  Stop,
} from "react-native-svg";
import { Abs, Screen, Txt } from "../../../src/ui/Frame";
import { fonts } from "../../../src/theme";
import { useCreate, useNotes, useUpdate, type Note } from "../../../src/api/hooks";

/**
 * Content Editor — Figma 7358:23402 "editor 2" (375x875).
 *
 * Traced 1:1: warm gradient backdrop, glass header (back / "Editor" / calendar),
 * the platform tag row at y=114, the 335x517 glass editor card holding the title
 * and caption fields, and the 375x164 floating AI assistant bar pinned at y=711
 * with its three action chips and ask-AI input.
 *
 * Coordinates below are raw frame coordinates; <Screen> scales the 375pt canvas.
 */

/* ------------------------------- geometry -------------------------------- */
const FRAME_W = 375;
const FRAME_H = 875;

/** Main Editor Card. */
const CARD_X = 20;
const CARD_Y = 187;
const CARD_W = 335;
const CARD_H = 517;
const TITLE_X = 45;
const TITLE_Y = 211.4;
const TITLE_W = 278.86;
const TITLE_H = 62;
const CAPTION_X = 45;
const CAPTION_Y = 285.59;
const CAPTION_W = 285;
/** Caption fills the rest of the card body: 517 - 24 padding - (285.59 - 187). */
const CAPTION_H = 394.41;

/** Floating AI Assistant Bar. */
const BAR_Y = 711;
const BAR_H = 164;
const CHIPS_X = 20;
const CHIPS_Y = 743;
const CHIPS_W = 335;
const CHIPS_H = 38;
/** Chip row content overruns the 335 viewport by design (Add hooks is clipped). */
const CHIPS_CONTENT_W = 389.89;
const INPUT_X = 20;
const INPUT_Y = 797;
const INPUT_W = 335;
const INPUT_H = 54;

/* --------------------------- spec colour tokens --------------------------- */
const INK = "#1A1A1C";
const HEADER_INK = "#1D1D1F";
const ICON_INK = "#1C1C1E";
const MUTED_INK = "#5E5E62";
const PLACEHOLDER_INK = "#A0A0A5";
const ACCENT = "#C9A7FF";
const SEND_INK = "#565454";
const GLASS_65 = "rgba(255,255,255,0.65)";
const BORDER_90 = "rgba(255,255,255,0.9)";
const GLASS_50 = "rgba(255,255,255,0.5)";
const BORDER_70 = "rgba(255,255,255,0.7)";
const CHIP_BORDER = "rgba(124,58,237,0.15)";

/* ------------------------------- spec copy -------------------------------- */
const TITLE_PLACEHOLDER = "Instagram Post: Behind the\nScenes...";
const CAPTION_PLACEHOLDER = "Write your caption here or let AI draft\nit for you.";
const ASK_PLACEHOLDER = "Ask AI to improve, rewrite, or expand...";

/** Platform tags — geometry and labels from the "Tags" frame at y=114. */
const PLATFORMS = [
  { key: "instagram", label: "Instagram", icon: "instagram", x: 20, w: 124.02, textW: 68.02 },
  { key: "youtube", label: "YouTube", icon: "youtube", x: 152.02, w: 114.8, textW: 58.8 },
  { key: "reels", label: "Reels", icon: "play-circle", x: 274.82, w: 92.88, textW: 36.88 },
] as const;

type PlatformKey = (typeof PLATFORMS)[number]["key"];

/** AI action chips — x is relative to the clipped chip row at x=20. */
const AI_ACTIONS = [
  { label: "Generate ideas", x: 0, w: 149.88, textW: 95.88 },
  { label: "Rewrite", x: 157.88, w: 102.27, textW: 48.27 },
  { label: "Add hooks", x: 268.14, w: 121.75, textW: 67.75 },
] as const;

/* ------------------------------ derivations ------------------------------- */
/**
 * A note body carries both editor fields: the first line is the title, the rest
 * is the caption. Mirrors the split all-ideas uses so a draft round-trips.
 */
function splitBody(body: string): { title: string; caption: string } {
  const nl = body.indexOf("\n");
  if (nl < 0) return { title: body.trim(), caption: "" };
  return { title: body.slice(0, nl).trim(), caption: body.slice(nl + 1).trim() };
}

const joinBody = (title: string, caption: string) =>
  [title.trim(), caption.trim()].filter(Boolean).join("\n");

/* -------------------------------- backdrop -------------------------------- */
/** The frame fill: a warm vertical base plus four soft radial glows. */
function Backdrop() {
  return (
    <Svg width={FRAME_W} height={FRAME_H} style={styles.backdrop}>
      <Defs>
        <SvgLinear id="ed-base" x1="187.5" y1="0" x2="187.5" y2={FRAME_H} gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#F7F0E4" />
          <Stop offset="1" stopColor="#F4EBDD" />
        </SvgLinear>
        <RadialGradient id="ed-pink" cx="285" cy="542.5" rx="1027.5" ry="568.75" gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#F7B7DA" stopOpacity="0.34" />
          <Stop offset="0.26" stopColor="#F7B7DA" stopOpacity="0" />
        </RadialGradient>
        <RadialGradient id="ed-blue" cx="90" cy="367.5" rx="967.5" ry="533.75" gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#BACDF4" stopOpacity="0.36" />
          <Stop offset="0.24" stopColor="#BACDF4" stopOpacity="0" />
        </RadialGradient>
        <RadialGradient id="ed-gold" cx="292.5" cy="157.5" rx="1338.75" ry="735" gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#F6D64A" stopOpacity="0.22" />
          <Stop offset="0.2" stopColor="#F6D64A" stopOpacity="0" />
        </RadialGradient>
        <RadialGradient id="ed-haze" cx="75" cy="87.5" rx="1466.25" ry="805" gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#FFFFFF" stopOpacity="0.72" />
          <Stop offset="0.24" stopColor="#FFFFFF" stopOpacity="0" />
        </RadialGradient>
      </Defs>
      <Rect width={FRAME_W} height={FRAME_H} fill="url(#ed-base)" />
      <Rect width={FRAME_W} height={FRAME_H} fill="url(#ed-pink)" />
      <Rect width={FRAME_W} height={FRAME_H} fill="url(#ed-blue)" />
      <Rect width={FRAME_W} height={FRAME_H} fill="url(#ed-gold)" />
      <Rect width={FRAME_W} height={FRAME_H} fill="url(#ed-haze)" />
    </Svg>
  );
}

/** The 36x36 send button paint: a warm diagonal sweep under three radial glows. */
function SendPaint() {
  return (
    <Svg width={36} height={36} style={styles.backdrop}>
      <Defs>
        <SvgLinear id="ed-send" x1="3.96" y1="-7.56" x2="32.04" y2="43.56" gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#FFE5A4" stopOpacity="0.82" />
          <Stop offset="0.35" stopColor="#FFF5E4" stopOpacity="0.92" />
          <Stop offset="0.72" stopColor="#F4D3EE" stopOpacity="0.88" />
          <Stop offset="1" stopColor="#CAD9FF" stopOpacity="0.76" />
        </SvgLinear>
        <RadialGradient id="ed-send-pink" cx="25.92" cy="31.68" rx="30.96" ry="57.24" gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#F7B7DA" stopOpacity="0.4" />
          <Stop offset="0.22" stopColor="#F7B7DA" stopOpacity="0" />
        </RadialGradient>
        <RadialGradient id="ed-send-gold" cx="29.52" cy="6.48" rx="33.48" ry="61.92" gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#F6D64A" stopOpacity="0.3" />
          <Stop offset="0.18" stopColor="#F6D64A" stopOpacity="0" />
        </RadialGradient>
        <RadialGradient id="ed-send-haze" cx="6.48" cy="7.2" rx="33.48" ry="61.56" gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#FFFFFF" stopOpacity="0.72" />
          <Stop offset="0.2" stopColor="#FFFFFF" stopOpacity="0" />
        </RadialGradient>
      </Defs>
      <Rect width={36} height={36} fill="url(#ed-send)" />
      <Rect width={36} height={36} fill="url(#ed-send-pink)" />
      <Rect width={36} height={36} fill="url(#ed-send-gold)" />
      <Rect width={36} height={36} fill="url(#ed-send-haze)" />
    </Svg>
  );
}

/** The 14x14 glyph for each AI action chip, in chip order. */
function ActionIcon({ index }: { index: number }) {
  if (index === 0) return <Ionicons name="sparkles-outline" size={14} color={ACCENT} />;
  if (index === 1) return <Feather name="edit-3" size={14} color={ACCENT} />;
  return <Feather name="zap" size={14} color={ACCENT} />;
}

/* --------------------------------- screen --------------------------------- */
export default function ContentEditor() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();

  const { data: notes = [] } = useNotes();
  const update = useUpdate<Note>("notes");
  const create = useCreate<Note>("notes");

  /** Set once a blank draft is first persisted, so later saves patch it. */
  const [createdId, setCreatedId] = useState<string | undefined>();
  const noteId = id ?? createdId;

  const stored = useMemo(() => {
    const note = notes.find((n) => n.id === noteId);
    return splitBody(note?.body ?? "");
  }, [notes, noteId]);

  /** Local edits win once the user types; until then the record drives both fields. */
  const [edited, setEdited] = useState<{ title: string; caption: string } | null>(null);
  const draft = edited ?? stored;

  const [platform, setPlatform] = useState<PlatformKey>("instagram");
  const [titleFocused, setTitleFocused] = useState(false);
  const [prompt, setPrompt] = useState("");

  const setField = (patch: Partial<{ title: string; caption: string }>) =>
    setEdited({ ...draft, ...patch });

  /** Persist the draft as a note body. Called when either field loses focus. */
  const save = () => {
    const body = joinBody(draft.title, draft.caption);
    if (!body || body === joinBody(stored.title, stored.caption)) return;
    if (noteId) update.mutate({ id: noteId, data: { body } });
    else create.mutate({ body }, { onSuccess: (n) => setCreatedId(n.id) });
  };

  /**
   * The AI assistant bar composes a prompt locally: the action chips prefill it
   * and the send button clears it. The backend exposes no generation endpoint
   * yet, so nothing is fabricated into the draft — only the user's own text
   * ever reaches the caption.
   */
  const ask = () => {
    if (prompt.trim()) setPrompt("");
  };

  return (
    <Screen height={FRAME_H} background="#F7F0E4" scroll>
      <Backdrop />

      {/* ------------------------------ Header ------------------------------ */}
      <Pressable
        onPress={() => router.back()}
        style={({ pressed }) => [styles.headerButton, { left: 15 }, pressed && styles.pressed]}
      >
        <Feather name="arrow-left" size={20} color={ICON_INK} />
      </Pressable>

      <Txt
        x={114}
        y={30}
        w={154}
        size={16}
        weight="bold"
        font="inter"
        color={HEADER_INK}
        lineHeight={19.36}
        align="center"
      >
        {"Editor "}
      </Txt>

      <Pressable
        onPress={() => router.push("/content/content-itinerary-set-date" as never)}
        style={({ pressed }) => [styles.headerButton, { left: 306 }, pressed && styles.pressed]}
      >
        <Feather name="calendar" size={20} color={ICON_INK} />
      </Pressable>

      {/* ------------------------------- Tags ------------------------------- */}
      {PLATFORMS.map((p) => {
        const active = platform === p.key;
        return (
          <Pressable
            key={p.key}
            onPress={() => setPlatform(p.key)}
            style={({ pressed }) => [
              styles.tag,
              {
                left: p.x,
                width: p.w,
                backgroundColor: active ? "#FFFFFF" : GLASS_50,
                borderColor: active ? "#FFFFFF" : BORDER_70,
              },
              active && styles.tagActiveShadow,
              pressed && styles.pressed,
            ]}
          >
            <Abs x={17} y={9.5} w={16} h={16} center>
              <Feather name={p.icon} size={16} color={active ? INK : MUTED_INK} />
            </Abs>
            <Txt
              x={39}
              y={9}
              w={p.textW}
              size={14}
              weight="semibold"
              font="inter"
              color={active ? INK : MUTED_INK}
              lineHeight={16.94}
              align="center"
              numberOfLines={1}
            >
              {p.label}
            </Txt>
          </Pressable>
        );
      })}

      {/* -------------------------- Main Editor Card ------------------------- */}
      <Abs
        x={CARD_X}
        y={CARD_Y}
        w={CARD_W}
        h={CARD_H}
        radius={24}
        bg={GLASS_65}
        border={BORDER_90}
        borderWidth={1}
        style={styles.cardShadow}
      >
        <TextInput
          value={draft.title}
          onChangeText={(t) => setField({ title: t })}
          onFocus={() => setTitleFocused(true)}
          onBlur={() => {
            setTitleFocused(false);
            save();
          }}
          placeholder={TITLE_PLACEHOLDER}
          placeholderTextColor={PLACEHOLDER_INK}
          selectionColor={ACCENT}
          multiline
          textAlignVertical="top"
          style={[
            styles.field,
            {
              left: TITLE_X - CARD_X,
              top: TITLE_Y - CARD_Y,
              width: TITLE_W,
              height: TITLE_H,
              fontSize: 22,
              lineHeight: 30.8,
              letterSpacing: -0.4,
              color: INK,
            },
          ]}
        />

        {/* Vertical Divider — the resting caret the design parks after the title. */}
        {titleFocused ? null : (
          <Abs
            x={145.03 - CARD_X}
            y={248.8 - CARD_Y}
            w={2}
            h={22}
            bg={ACCENT}
          />
        )}

        <TextInput
          value={draft.caption}
          onChangeText={(t) => setField({ caption: t })}
          onBlur={save}
          placeholder={CAPTION_PLACEHOLDER}
          placeholderTextColor={PLACEHOLDER_INK}
          selectionColor={ACCENT}
          multiline
          textAlignVertical="top"
          style={[
            styles.field,
            {
              left: CAPTION_X - CARD_X,
              top: CAPTION_Y - CARD_Y,
              width: CAPTION_W,
              height: CAPTION_H,
              fontSize: 16,
              lineHeight: 24,
              color: INK,
            },
          ]}
        />
      </Abs>

      {/* --------------------- Floating AI Assistant Bar --------------------- */}
      <LinearGradient
        colors={[
          "#F6F5FC",
          "#F6F5FC",
          "rgba(246,245,252,0.9)",
          "rgba(246,245,252,0)",
        ]}
        locations={[0, 0.4, 0.7, 1]}
        start={{ x: 0.5, y: 1 }}
        end={{ x: 0.5, y: 0 }}
        style={[styles.bar, { top: BAR_Y, width: FRAME_W, height: BAR_H }]}
      />

      {/* Action chips — the row overflows its 335 viewport exactly as designed. */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={[styles.chipRow, { left: CHIPS_X, top: CHIPS_Y, width: CHIPS_W, height: CHIPS_H }]}
        contentContainerStyle={{ width: CHIPS_CONTENT_W, height: CHIPS_H }}
      >
        {AI_ACTIONS.map((a, i) => (
          <Pressable
            key={a.label}
            onPress={() => setPrompt(a.label)}
            style={({ pressed }) => [
              styles.chip,
              { left: a.x, width: a.w },
              pressed && styles.pressed,
            ]}
          >
            <Abs x={17} y={12} w={14} h={14} center>
              <ActionIcon index={i} />
            </Abs>
            <Txt
              x={37}
              y={11}
              w={a.textW}
              size={13}
              weight="bold"
              font="inter"
              color={ACCENT}
              lineHeight={15.73}
              align="center"
              numberOfLines={1}
            >
              {a.label}
            </Txt>
          </Pressable>
        ))}
      </ScrollView>

      {/* Ask-AI input */}
      <Abs
        x={INPUT_X}
        y={INPUT_Y}
        w={INPUT_W}
        h={INPUT_H}
        radius={24}
        bg="#FFFFFF"
        border="#FFFFFF"
        borderWidth={1}
        style={styles.inputShadow}
      >
        <LinearGradient
          colors={["#9333EA", "#7C3AED"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.assistant}
        >
          <MaterialCommunityIcons name="robot-outline" size={16} color="#FFFFFF" />
        </LinearGradient>

        <TextInput
          value={prompt}
          onChangeText={setPrompt}
          onSubmitEditing={ask}
          returnKeyType="send"
          placeholder={ASK_PLACEHOLDER}
          placeholderTextColor={MUTED_INK}
          selectionColor={ACCENT}
          style={[
            styles.field,
            {
              left: 77 - INPUT_X,
              top: 806 - INPUT_Y,
              width: 221,
              height: 36,
              fontSize: 15,
              lineHeight: 18.15,
              color: MUTED_INK,
            },
          ]}
        />

        <Pressable
          onPress={ask}
          style={({ pressed }) => [styles.send, pressed && styles.pressed]}
        >
          <View style={styles.sendFill}>
            <SendPaint />
          </View>
          <Feather name="arrow-up" size={18} color={SEND_INK} />
        </Pressable>
      </Abs>
    </Screen>
  );
}

const styles = StyleSheet.create({
  backdrop: { position: "absolute", left: 0, top: 0 },
  pressed: { opacity: 0.9 },

  headerButton: {
    position: "absolute",
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

  tag: {
    position: "absolute",
    top: 114,
    height: 35,
    borderRadius: 20,
    borderWidth: 1,
  },
  tagActiveShadow: {
    shadowColor: "#000000",
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
    elevation: 1,
  },

  cardShadow: {
    shadowColor: "#000000",
    shadowOpacity: 0.03,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 12 },
    elevation: 2,
  },

  /** Shared TextInput reset — every field is Inter Medium, absolutely placed. */
  field: {
    position: "absolute",
    fontFamily: fonts.interMedium,
    padding: 0,
  },

  bar: { position: "absolute", left: 0 },

  chipRow: { position: "absolute" },
  chip: {
    position: "absolute",
    top: 0,
    height: 38,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: CHIP_BORDER,
    shadowColor: "#7C3AED",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
    elevation: 1,
  },

  inputShadow: {
    shadowColor: "#000000",
    shadowOpacity: 0.06,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  assistant: {
    position: "absolute",
    left: 17,
    top: 13,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  send: {
    position: "absolute",
    left: 290,
    top: 9,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#7C3AED",
    shadowOpacity: 0.3,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  /** Clips the gradient paint without masking the button's own shadow. */
  sendFill: {
    position: "absolute",
    left: 0,
    top: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    overflow: "hidden",
  },
});
