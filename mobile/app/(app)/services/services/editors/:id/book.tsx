import { useMemo, useState } from "react";
import { Image, Pressable, ScrollView, StyleSheet, TextInput, View } from "react-native";
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
import { Abs, getScale, Screen, Txt } from "../../../../../../src/ui/Frame";
import { fonts, gradients } from "../../../../../../src/theme";
import { inr, useCreators } from "../../../../../../src/api/hooks";

/**
 * Services — "Confirm Editor" booking form (Figma 7506:45158).
 *
 * The editor counterpart to the videographer booking sheet: instead of a shoot
 * date/duration it asks for edit requirements (content type, deliverable count,
 * video length, editing style), raw-footage assets and edit-specific add-ons.
 * The design frame is 375x850 but the stacked cards run to y=1768, so the page
 * scrolls in design space while the "Confirm Booking" bar stays pinned to the
 * viewport — exactly the "Frame" node the spec floats at y=765.
 *
 * Coordinates below are raw frame coordinates from the spec; <Screen> scales
 * the 375pt canvas to the device.
 */

/* ------------------------------- geometry -------------------------------- */
const FRAME_W = 375;
/** Design frame height — the backdrop and the pinned CTA are authored on it. */
const FRAME_H = 875;
/** Last content pixel (Cost Breakdown margin ends at 1768) + the CTA bar. */
const CANVAS_H = 1878;
/** The pinned bottom bar: "Frame" x=0 y=765 w=375 h=110. */
const BAR_H = 110;

/* --------------------------- spec colour tokens --------------------------- */
const INK = "#1a1a1a";
const SUB = "#555555";
const BODY = "#666666";
const MUTED = "#888888";
const HEAVY = "#333333";
const BACK_INK = "#1c1c1e";

const BLUE_BG = "#e3f2fd";
const BLUE_BORDER = "#bbdefb";
const BLUE_INK = "#1565c0";
const PLUM_BG = "#f3e5f5";
const PLUM_INK = "#6a1b9a";
const TOTAL_INK = "#7e57c2";

const TOGGLE_ON = "#4caf50";
const TOGGLE_OFF = "#e0e0e0";
const DIVIDER = "#eaeaea";
const CTA_BG = "#312b28";

const GLASS_40 = "rgba(255,255,255,0.4)";
const GLASS_60 = "rgba(255,255,255,0.6)";
const GLASS_65 = "rgba(255,255,255,0.65)";
const GLASS_70 = "rgba(255,255,255,0.7)";
const BORDER_90 = "rgba(255,255,255,0.9)";
const HAIRLINE = "rgba(0,0,0,0.04)";
const BORDER_05 = "rgba(0,0,0,0.05)";
const BORDER_10 = "rgba(0,0,0,0.1)";

/** Avatar stand-in while a creator has no photo on file. */
const AVATAR_FILL = [gradients.creators[0], gradients.creators[1]] as const;

/* ------------------------------ pricing model ----------------------------- */
/** The rate the summary pill quotes: "₹1500 – ₹3000 per edit". */
const BASE_RATE = 1500;
/** "Taxes & Fees (18%)". */
const TAX_RATE = 0.18;

/* --------------------------- form option taxonomy ------------------------- */
interface ChipSpec {
  label: string;
  /** Frame x of the chip box and the width of its text run. */
  x: number;
  w: number;
  tw: number;
}

const CONTENT_TYPES: readonly ChipSpec[] = [
  { label: "Instagram Reel", x: 41, w: 127.53, tw: 93.53 },
  { label: "YouTube Video", x: 178.53, w: 128.45, tw: 94.45 },
  { label: "Ad Creative", x: 316.98, w: 107.45, tw: 73.45 },
];

const VIDEO_LENGTHS: readonly ChipSpec[] = [
  { label: "<30 sec", x: 41, w: 85.28, tw: 51.28 },
  { label: "30–60 sec", x: 136.28, w: 99.92, tw: 65.92 },
  { label: "60+ sec", x: 246.2, w: 85.33, tw: 51.33 },
];

const EDITING_STYLES: readonly ChipSpec[] = [
  { label: "Trendy", x: 41, w: 78.23, tw: 44.23 },
  { label: "Cinematic", x: 129.23, w: 97.36, tw: 63.36 },
  { label: "Minimal", x: 236.59, w: 83.33, tw: 49.33 },
  { label: "High-energy", x: 329.92, w: 113.23, tw: 79.23 },
];

interface AddonSpec {
  key: string;
  title: string;
  /** The "+ ₹…" caption exactly as the spec prints it. */
  price: string;
  amount: number;
  /** "+ ₹500 / video" multiplies by the deliverable count; the rest are flat. */
  perVideo: boolean;
  titleY: number;
  titleW: number;
  priceY: number;
  priceW: number;
  toggleY: number;
  /** Bottom hairline of the row, or 0 for the last row which has none. */
  ruleY: number;
}

const ADDONS: readonly AddonSpec[] = [
  {
    key: "subtitles", title: "Subtitles / Captions", price: "+ ₹500 / video",
    amount: 500, perVideo: true,
    titleY: 1157, titleW: 132.47, priceY: 1177, priceW: 89.95, toggleY: 1163, ruleY: 1207,
  },
  {
    key: "fast", title: "Fast Delivery (24 hrs)", price: "+ ₹1,000",
    amount: 1000, perVideo: false,
    titleY: 1222, titleW: 145.28, priceY: 1242, priceW: 53.48, toggleY: 1228, ruleY: 1272,
  },
  {
    key: "motion", title: "Motion Graphics", price: "+ ₹1,500",
    amount: 1500, perVideo: false,
    titleY: 1287, titleW: 111.44, priceY: 1307, priceW: 53.13, toggleY: 1293, ruleY: 1337,
  },
  {
    key: "thumbnail", title: "Thumbnail Design", price: "+ ₹800",
    amount: 800, perVideo: false,
    titleY: 1352, titleW: 122.27, priceY: 1372, priceW: 44.28, toggleY: 1358, ruleY: 1402,
  },
  {
    key: "revisions", title: "Extra Revisions", price: "+ ₹500",
    amount: 500, perVideo: false,
    titleY: 1417, titleW: 103.59, priceY: 1437, priceW: 43.94, toggleY: 1423, ruleY: 0,
  },
];

/** Skill / turnaround pills under the creator summary. */
const TAGS = [
  { label: "48 hrs", x: 125, y: 200, w: 67.47, tx: 150, tw: 33.47, clock: true },
  { label: "Reels", x: 198.47, y: 200, w: 46.22, tx: 207.47, tw: 28.22, clock: false },
  { label: "Fast cuts", x: 250.69, y: 200, w: 65, tx: 259.69, tw: 47, clock: false },
  { label: "Color grading", x: 125, y: 230, w: 88.84, tx: 134, tw: 70.84, clock: false },
] as const;

/* -------------------------------- backdrop -------------------------------- */
/**
 * The frame fill: a warm vertical base, four soft radial glows and the two
 * on-screen blobs from "Soft Pastel Mesh Background" (the third sits at
 * x=1262, outside the clipped 375pt container). The 60px layer blurs are
 * approximated with radial falloffs, which React Native can actually paint.
 */
function Backdrop() {
  return (
    <Svg width={FRAME_W} height={CANVAS_H} style={styles.backdrop}>
      <Defs>
        <SvgLinear id="base" x1="187.5" y1="0" x2="187.5" y2={CANVAS_H} gradientUnits="userSpaceOnUse">
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
        <RadialGradient id="mistA" cx="92" cy="-108" r="150" gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#E6E6FA" stopOpacity="0.3" />
          <Stop offset="1" stopColor="#E6E6FA" stopOpacity="0" />
        </RadialGradient>
        <RadialGradient id="mistB" cx="67" cy="62" r="175" gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#D4F0F0" stopOpacity="0.25" />
          <Stop offset="1" stopColor="#D4F0F0" stopOpacity="0" />
        </RadialGradient>
      </Defs>
      <Rect width={FRAME_W} height={CANVAS_H} fill="url(#base)" />
      <Rect width={FRAME_W} height={FRAME_H} fill="url(#pink)" />
      <Rect width={FRAME_W} height={FRAME_H} fill="url(#blue)" />
      <Rect width={FRAME_W} height={FRAME_H} fill="url(#gold)" />
      <Rect width={FRAME_W} height={FRAME_H} fill="url(#haze)" />
      <Rect width={FRAME_W} height={FRAME_H} fill="url(#mistA)" />
      <Rect width={FRAME_W} height={FRAME_H} fill="url(#mistB)" />
    </Svg>
  );
}

/* -------------------------------- controls -------------------------------- */
interface ChipRowProps {
  /** Frame y of the 297x42 clipping container the chips live in. */
  top: number;
  items: readonly ChipSpec[];
  active: number;
  onPick: (i: number) => void;
}

/**
 * One horizontal option row. The design lets the last chip run past the card
 * edge inside a clipped 297pt box, so the row is a horizontal ScrollView: it
 * renders identically at rest and the overflow stays reachable.
 */
function ChipRow({ top, items, active, onPick }: ChipRowProps) {
  const last = items[items.length - 1];
  const contentW = Math.max(297, last.x + last.w - 37 + 4);
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={[styles.chipRow, { top }]}
      contentContainerStyle={{ width: contentW, height: 42 }}
    >
      {items.map((c, i) => {
        const on = i === active;
        return (
          <Pressable
            key={c.label}
            onPress={() => onPick(i)}
            style={[styles.chip, { left: c.x - 37, width: c.w }, on ? styles.chipOn : styles.chipOff]}
          >
            <Txt
              x={17}
              y={11}
              w={c.tw}
              size={13}
              weight="semibold"
              font="inter"
              color={on ? BLUE_INK : SUB}
              lineHeight={15.73}
              numberOfLines={1}
            >
              {c.label}
            </Txt>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

/** The 44x24 add-on switch; the knob slides 2 -> 22 within the track. */
function Toggle({ top, on, onPress }: { top: number; on: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.track, { top, backgroundColor: on ? TOGGLE_ON : TOGGLE_OFF }]}
    >
      <View style={[styles.knob, { left: on ? 22 : 2 }]} />
    </Pressable>
  );
}

/** A right-aligned money cell; every value column in the spec ends at x=335. */
function Money({
  y, text, weight = "regular", color = SUB, size = 14, lineHeight = 16.94,
}: {
  y: number; text: string; weight?: "regular" | "semibold" | "bold";
  color?: string; size?: number; lineHeight?: number;
}) {
  return (
    <Txt
      x={200}
      y={y}
      w={135}
      size={size}
      weight={weight}
      font="inter"
      color={color}
      lineHeight={lineHeight}
      align="right"
      numberOfLines={1}
    >
      {text}
    </Txt>
  );
}

/* --------------------------------- screen --------------------------------- */
export default function ConfirmEditorBooking() {
  const router = useRouter();
  const scale = getScale();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { data = [] } = useCreators();

  /** The editor being booked; falls back to the first record while routing. */
  const creator = useMemo(() => data.find((c) => c.id === id) ?? data[0], [data, id]);

  const [contentType, setContentType] = useState(0);
  const [qty, setQty] = useState(3);
  const [videoLength, setVideoLength] = useState(1);
  const [editingStyle, setEditingStyle] = useState(0);
  const [driveLink, setDriveLink] = useState("");
  const [brief, setBrief] = useState("");
  const [picked, setPicked] = useState<Record<string, boolean>>({ subtitles: true });

  /** Line items, subtotal, tax and total all follow the deliverable count. */
  const lines = useMemo(() => {
    const rows = [
      { key: "base", label: `Base Editing (x${qty} videos)`, amount: BASE_RATE * qty },
    ];
    for (const a of ADDONS) {
      if (!picked[a.key]) continue;
      rows.push({
        key: a.key,
        label: a.perVideo ? `${a.title} (x${qty})` : a.title,
        amount: a.perVideo ? a.amount * qty : a.amount,
      });
    }
    return rows;
  }, [qty, picked]);

  const subtotal = lines.reduce((sum, l) => sum + l.amount, 0);
  const tax = Math.round(subtotal * TAX_RATE);
  const total = subtotal + tax;

  const toggle = (key: string) => setPicked((p) => ({ ...p, [key]: !p[key] }));

  const firstName = creator ? creator.name.split(" ")[0] : "";

  return (
    <View style={styles.root}>
      <Screen height={CANVAS_H} background="#F7F0E4" scroll>
        <Backdrop />

        {/* ------------------------------ Top Nav ----------------------------- */}
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
        >
          <Feather name="arrow-left" size={20} color={BACK_INK} />
        </Pressable>

        <Txt x={130.67} y={30} w={113.64} size={16} weight="bold" font="inter" color={INK} lineHeight={19.36}>
          Confirm Editor
        </Txt>

        {/* -------------------------- Creator Summary ------------------------- */}
        <Abs x={20} y={100} w={335} h={171} radius={24} bg={GLASS_70} border={BORDER_90} borderWidth={1} style={styles.cardShadow} />

        <Abs x={37} y={117} w={72} h={72} radius={16} style={styles.clip}>
          {creator?.avatarUrl ? (
            <Image source={{ uri: creator.avatarUrl }} style={styles.avatar} />
          ) : (
            <LinearGradient colors={AVATAR_FILL} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.avatar} />
          )}
        </Abs>

        <Txt x={125} y={117} w={184} size={16} weight="bold" font="inter" color={INK} lineHeight={19.36} numberOfLines={1}>
          {firstName}
        </Txt>
        <Txt x={240} y={119.5} w={98} size={12} font="inter" color={MUTED} lineHeight={14.52} align="right" numberOfLines={1}>
          {creator?.location ?? ""}
        </Txt>

        <Txt x={125} y={141} w={213} size={13} font="inter" color={BODY} lineHeight={15.73} numberOfLines={1}>
          Video Editor • 4 yrs exp.
        </Txt>

        <Abs x={125} y={165} w={171.89} h={23} radius={10} bg={PLUM_BG} />
        <Abs x={135} y={170.5} w={12} h={12} center>
          <Feather name="tag" size={12} color={PLUM_INK} />
        </Abs>
        <Txt x={153} y={169} w={133.89} size={12} weight="bold" font="inter" color={PLUM_INK} lineHeight={14.52} numberOfLines={1}>
          ₹1500 – ₹3000 per edit
        </Txt>

        {TAGS.map((t) => (
          <Abs key={t.label} x={t.x} y={t.y} w={t.w} h={24} radius={8} bg="#ffffff" border={BORDER_05} borderWidth={1} />
        ))}
        <Abs x={134} y={206} w={12} h={12} center>
          <Feather name="clock" size={12} color={SUB} />
        </Abs>
        {TAGS.map((t) => (
          <Txt
            key={`${t.label}-label`}
            x={t.tx}
            y={t.y + 5}
            w={t.tw}
            size={11}
            font="inter"
            color={SUB}
            lineHeight={13.31}
            numberOfLines={1}
          >
            {t.label}
          </Txt>
        ))}

        {/* -------------------------- Edit Requirements ----------------------- */}
        <Abs x={20} y={291} w={335} h={387} radius={24} bg={GLASS_70} border={BORDER_90} borderWidth={1} style={styles.cardShadow} />

        <Txt x={41} y={312} w={293} size={16} weight="bold" font="inter" color={INK} lineHeight={19.36}>
          Edit Requirements
        </Txt>

        <Txt x={41} y={347} w={293} size={13} weight="semibold" font="inter" color={SUB} lineHeight={15.73}>
          Content Type
        </Txt>
        <ChipRow top={373} items={CONTENT_TYPES} active={contentType} onPick={setContentType} />

        <Txt x={41} y={450} w={77.81} size={13} weight="semibold" font="inter" color={SUB} lineHeight={15.73}>
          Deliverables
        </Txt>
        <Abs x={196} y={435} w={138} h={46} radius={20} bg={GLASS_60} border={BORDER_90} borderWidth={1} />
        <Pressable
          onPress={() => setQty((n) => Math.max(1, n - 1))}
          style={({ pressed }) => [styles.stepBtn, { left: 209 }, pressed && styles.pressed]}
        >
          <Feather name="minus" size={16} color={INK} />
        </Pressable>
        <Txt x={257} y={448.5} w={16} size={15} weight="bold" font="inter" color={INK} lineHeight={18.15} align="center">
          {`${qty}`}
        </Txt>
        <Pressable
          onPress={() => setQty((n) => n + 1)}
          style={({ pressed }) => [styles.stepBtn, { left: 289 }, pressed && styles.pressed]}
        >
          <Feather name="plus" size={16} color={INK} />
        </Pressable>

        <Txt x={41} y={501} w={293} size={13} weight="semibold" font="inter" color={SUB} lineHeight={15.73}>
          Video Length
        </Txt>
        <ChipRow top={527} items={VIDEO_LENGTHS} active={videoLength} onPick={setVideoLength} />

        <Txt x={41} y={589} w={293} size={13} weight="semibold" font="inter" color={SUB} lineHeight={15.73}>
          Editing Style
        </Txt>
        <ChipRow top={615} items={EDITING_STYLES} active={editingStyle} onPick={setEditingStyle} />

        {/* ---------------------------- Assets & Input ------------------------ */}
        <Abs x={20} y={698} w={335} h={391} radius={24} bg={GLASS_70} border={BORDER_90} borderWidth={1} style={styles.cardShadow} />

        <Txt x={41} y={719} w={293} size={16} weight="bold" font="inter" color={INK} lineHeight={19.36}>
          Assets & Input
        </Txt>

        <Abs x={41} y={754} w={293} h={153} radius={16} bg={GLASS_40} border={BORDER_10} borderWidth={1} />
        <Abs x={165.5} y={779} w={44} h={44} radius={22} bg={BLUE_BG} center>
          <Feather name="upload-cloud" size={20} color={BLUE_INK} />
        </Abs>
        <Txt x={121.45} y={839} w={132.09} size={16} weight="semibold" font="inter" color={HEAVY} lineHeight={19.36} align="center">
          Upload Raw Files
        </Txt>
        <Txt x={118.5} y={867} w={138} size={12} font="inter" color={BODY} lineHeight={14.52} align="center">
          or Add Google Drive link
        </Txt>

        <Abs x={41} y={919} w={293} h={47} radius={16} bg={GLASS_60} border={BORDER_90} borderWidth={1}>
          <TextInput
            value={driveLink}
            onChangeText={setDriveLink}
            placeholder="Paste drive or reference links..."
            placeholderTextColor={MUTED}
            style={styles.linkInput}
          />
        </Abs>

        <Abs x={41} y={978} w={293} h={90} radius={16} bg={GLASS_60} border={BORDER_90} borderWidth={1}>
          <TextInput
            value={brief}
            onChangeText={setBrief}
            placeholder={"Describe your edit (e.g. fast pacing,\nspecific music vibes, keep out\nbloopers)..."}
            placeholderTextColor={MUTED}
            multiline
            style={styles.briefInput}
          />
        </Abs>

        {/* -------------------------------- Add-ons --------------------------- */}
        <Abs x={20} y={1109} w={335} h={365} radius={24} bg={GLASS_70} border={BORDER_90} borderWidth={1} style={styles.cardShadow} />

        <Txt x={41} y={1130} w={293} size={16} weight="bold" font="inter" color={INK} lineHeight={19.36}>
          Add-ons
        </Txt>

        {ADDONS.map((a) => (
          <Txt
            key={`${a.key}-title`}
            x={41}
            y={a.titleY}
            w={a.titleW}
            size={14}
            weight="semibold"
            font="inter"
            color={INK}
            lineHeight={16.94}
            numberOfLines={1}
          >
            {a.title}
          </Txt>
        ))}
        {ADDONS.map((a) => (
          <Txt
            key={`${a.key}-price`}
            x={41}
            y={a.priceY}
            w={a.priceW}
            size={13}
            weight="medium"
            font="inter"
            color={BODY}
            lineHeight={15.73}
            numberOfLines={1}
          >
            {a.price}
          </Txt>
        ))}
        {ADDONS.map((a) =>
          a.ruleY ? <Abs key={`${a.key}-rule`} x={41} y={a.ruleY} w={293} h={1} bg={HAIRLINE} /> : null,
        )}
        {ADDONS.map((a) => (
          <Toggle key={`${a.key}-switch`} top={a.toggleY} on={!!picked[a.key]} onPress={() => toggle(a.key)} />
        ))}

        {/* ----------------------------- Cost Breakdown ----------------------- */}
        <Txt x={20} y={1494} w={335} size={16} weight="bold" font="inter" color={INK} lineHeight={19.36}>
          Cost Breakdown
        </Txt>

        <Abs x={20} y={1529} w={335} h={219} radius={20} bg="#ffffff" style={styles.costShadow} />

        {/* Line items step by 29pt; three slots fit above the subtotal row. */}
        <Abs x={40} y={1549} w={295} h={75} style={styles.clip}>
          {lines.slice(0, 3).map((l, i) => (
            <Txt
              key={l.key}
              x={0}
              y={i * 29}
              w={200}
              size={14}
              font="inter"
              color={SUB}
              lineHeight={16.94}
              numberOfLines={1}
            >
              {l.label}
            </Txt>
          ))}
          {lines.slice(0, 3).map((l, i) => (
            <Txt
              key={`${l.key}-amt`}
              x={160}
              y={i * 29}
              w={135}
              size={14}
              font="inter"
              color={SUB}
              lineHeight={16.94}
              align="right"
              numberOfLines={1}
            >
              {`₹${inr(l.amount)}`}
            </Txt>
          ))}
        </Abs>

        <Txt x={40} y={1628} w={54.58} size={14} font="inter" color={SUB} lineHeight={16.94}>
          Subtotal
        </Txt>
        <Money y={1628} text={`₹${inr(subtotal)}`} weight="semibold" color={INK} />

        <Txt x={40} y={1657} w={129.33} size={14} font="inter" color={SUB} lineHeight={16.94}>
          Taxes & Fees (18%)
        </Txt>
        <Money y={1657} text={`₹${inr(tax)}`} />

        <Abs x={40} y={1690} w={295} h={1} bg={DIVIDER} />

        <Txt x={40} y={1707} w={44.58} size={18} weight="bold" font="inter" color={INK} lineHeight={21.78}>
          Total
        </Txt>
        <Money y={1707} text={`₹${inr(total)}`} weight="bold" color={TOTAL_INK} size={18} lineHeight={21.78} />
      </Screen>

      {/* --------------------------- Pinned CTA bar -------------------------- */}
      <View style={[styles.barWrap, { width: FRAME_W * scale, height: BAR_H * scale }]} pointerEvents="box-none">
        <View style={[styles.barCanvas, { transform: [{ scale }] }]} pointerEvents="box-none">
          <LinearGradient
            colors={["#faf9f600", "#faf9f6", "#faf9f6"] as const}
            locations={[0, 0.4, 1]}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => [styles.cta, pressed && styles.pressed]}
          >
            <Txt x={98.5} y={16} w={138} size={16} weight="bold" font="inter" color="#ffffff" lineHeight={19.36} align="center">
              Confirm Booking
            </Txt>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#F7F0E4" },
  backdrop: { position: "absolute", left: 0, top: 0 },
  clip: { overflow: "hidden" },
  pressed: { opacity: 0.9 },
  avatar: { width: 72, height: 72 },

  backButton: {
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
    borderColor: BORDER_90,
    shadowColor: "#000000",
    shadowOpacity: 0.03,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },

  cardShadow: {
    shadowColor: "#000000",
    shadowOpacity: 0.03,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  costShadow: {
    shadowColor: "#000000",
    shadowOpacity: 0.04,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },

  chipRow: { position: "absolute", left: 37, width: 297, height: 42 },
  chip: {
    position: "absolute",
    top: 0,
    height: 38,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipOn: {
    backgroundColor: BLUE_BG,
    borderColor: BLUE_BORDER,
    shadowColor: "#1565c0",
    shadowOpacity: 0.1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  chipOff: {
    backgroundColor: GLASS_60,
    borderColor: BORDER_90,
    shadowColor: "#000000",
    shadowOpacity: 0.02,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },

  stepBtn: {
    position: "absolute",
    top: 442,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff",
    shadowColor: "#000000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },

  linkInput: {
    position: "absolute",
    left: 16,
    top: 0,
    width: 261,
    height: 45,
    fontFamily: fonts.inter,
    fontSize: 14,
    color: INK,
    padding: 0,
  },
  briefInput: {
    position: "absolute",
    left: 16,
    top: 14,
    width: 261,
    height: 60,
    fontFamily: fonts.inter,
    fontSize: 14,
    lineHeight: 16.94,
    color: INK,
    padding: 0,
    textAlignVertical: "top",
  },

  track: {
    position: "absolute",
    left: 290,
    width: 44,
    height: 24,
    borderRadius: 12,
  },
  knob: {
    position: "absolute",
    top: 2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#ffffff",
    shadowColor: "#000000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },

  barWrap: { position: "absolute", left: 0, bottom: 0, overflow: "hidden" },
  barCanvas: { width: FRAME_W, height: BAR_H, transformOrigin: "top left" },
  cta: {
    position: "absolute",
    left: 20,
    top: 16,
    width: 335,
    height: 52,
    borderRadius: 24,
    backgroundColor: CTA_BG,
    shadowColor: "#000000",
    shadowOpacity: 0.15,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
});
