import { Fragment, useMemo, useState } from "react";
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
import { Abs, Screen, Txt } from "../../../../../../src/ui/Frame";
import { fonts, gradients } from "../../../../../../src/theme";
import { useCreate, useCreators, inr } from "../../../../../../src/api/hooks";
import type { Contract, Creator } from "../../../../../../src/api/hooks";

/**
 * Confirm videographer booking — Figma 7506:45348 (375x875), traced 1:1.
 *
 * The design is a scrolling form: the "Main" frame clips at 375x683 while its
 * content runs to y=1190, with the "Confirm Booking" bar pinned over the fold.
 * Screen's canvas scrolls as a whole (the repo convention — a nested vertical
 * scroller would fight the outer one), so the CTA bar keeps its 375x120
 * geometry and lands flush with the bottom of the taller canvas instead of at
 * its in-frame y=762. Every other coordinate is the raw frame coordinate.
 */

/* ------------------------------- geometry -------------------------------- */
const FRAME_W = 375;
const BACKDROP_H = 882; // "Background" frame — the mesh radials are sized to it
const CONTENT_BOTTOM = 1190; // bottom of "Cost Breakdown"
const CTA_H = 120; // "Frame" — the fading footer bar
const CANVAS_H = CONTENT_BOTTOM + CTA_H;
const CTA_Y = CONTENT_BOTTOM; // spec y=762 inside the 875 viewport

/* ----------------------------- colour tokens ------------------------------ */
const INK = "#1a1a1a";
const INK_MUTED = "#555555";
const INK_META = "#666666";
const ICON_MUTED = "#888888";
const GLASS_60 = "rgba(255,255,255,0.6)";
const GLASS_70 = "rgba(255,255,255,0.7)";
const GLASS_LINE = "rgba(255,255,255,0.9)";
const ROW_LINE = "rgba(0,0,0,0.04)";
const SLOT_ON_BG = "#e8f5e9";
const SLOT_ON_LINE = "#c8e6c9";
const SLOT_ON_INK = "#2e7d32";
const TYPE_ON_BG = "#e3f2fd";
const TYPE_ON_LINE = "#bbdefb";
const TYPE_ON_INK = "#1565c0";
const TOGGLE_ON = "#4caf50";
const TOGGLE_OFF = "#e0e0e0";
const TOTAL_INK = "#7e57c2";
const BUTTON_INK = "#312b28";

/* ------------------------------- form model ------------------------------- */
/** Time-slot chips — x is relative to the clipped 335pt strip at (20, 310). */
const SLOTS = [
  { label: "08:00 AM", x: 0, w: 96.92, tw: 62.92 },
  { label: "10:00 AM", x: 106.92, w: 94.09, tw: 60.09 },
  { label: "12:00 PM", x: 211.02, w: 92.55, tw: 58.55 },
  { label: "02:00 PM", x: 313.56, w: 95.63, tw: 61.63 },
] as const;
const SLOTS_W = 409.19;

/** Project-type chips — relative to the clipped strip at (20, 406). */
const TYPES = [
  { label: "Instagram Reels", x: 0, w: 134.67, tw: 100.67 },
  { label: "Brand Shoot", x: 144.67, w: 111.27, tw: 77.27 },
  { label: "YouTube Vlog", x: 265.94, w: 120.78, tw: 86.78 },
] as const;
const TYPES_W = 386.72;

interface Addon {
  key: string;
  title: string;
  titleW: number;
  price: string;
  priceW: number;
  amount: number;
  titleY: number;
  priceY: number;
  toggleY: number;
  /** y of the row's 1pt bottom hairline; the last row has none. */
  divider: number | null;
  /** The frame ships the first two switched on. */
  initial: boolean;
}

const ADDONS: Addon[] = [
  {
    key: "editor",
    title: "Professional Editor",
    titleW: 127.33,
    price: "+ ₹3,000 / reel",
    priceW: 91.02,
    amount: 3000,
    titleY: 749,
    priceY: 768,
    toggleY: 754.5,
    divider: 797,
    initial: true,
  },
  {
    key: "raw",
    title: "Raw Files Delivery",
    titleW: 123.41,
    price: "+ ₹1,500",
    priceW: 53.13,
    amount: 1500,
    titleY: 809,
    priceY: 828,
    toggleY: 814.5,
    divider: 857,
    initial: true,
  },
  {
    key: "revisions",
    title: "Extra Revisions (x2)",
    titleW: 134.25,
    price: "+ ₹1,000",
    priceW: 53.48,
    amount: 1000,
    titleY: 869,
    priceY: 888,
    toggleY: 874.5,
    divider: null,
    initial: false,
  },
];

/** "Base Price (2 Hrs)" is ₹5,000 in the frame — the 2-hour videographer tier. */
const BASE_PRICE = 5000;
const BASE_LABEL = "Base Price (2 Hrs)";
const SHOOT_HOURS = "2 Hrs Shoot";

/** Breakdown rows start at y=995 and step 29pt; four fit above the subtotal. */
const LINE_Y = 995;
const LINE_STEP = 29;
const MAX_LINES = 4;

/**
 * Total = subtotal + 18% GST, rounded up to the nearest ₹100 — the rule that
 * reproduces the frame's ₹9,500 subtotal → ₹11,300 total exactly.
 */
const totalOf = (subtotal: number) => Math.ceil((subtotal * 1.18) / 100) * 100;

/* -------------------------------- backdrop -------------------------------- */
/** Frame fill: a warm vertical base, four soft radial glows and one mesh blob. */
function Backdrop() {
  return (
    <Svg width={FRAME_W} height={CANVAS_H} style={styles.backdrop}>
      <Defs>
        <SvgLinear id="base" x1="187.5" y1="0" x2="187.5" y2={CANVAS_H} gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#f7f0e4" />
          <Stop offset="1" stopColor="#f4ebdd" />
        </SvgLinear>
        <RadialGradient id="pink" cx="285" cy="546.84" rx="1027.5" ry="573.3" gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#f7b7da" stopOpacity="0.34" />
          <Stop offset="0.26" stopColor="#f7b7da" stopOpacity="0" />
        </RadialGradient>
        <RadialGradient id="blue" cx="90" cy="370.44" rx="967.5" ry="538.02" gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#bacdf4" stopOpacity="0.36" />
          <Stop offset="0.24" stopColor="#bacdf4" stopOpacity="0" />
        </RadialGradient>
        <RadialGradient id="gold" cx="292.5" cy="158.76" rx="1338.75" ry="740.88" gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#f6d64a" stopOpacity="0.22" />
          <Stop offset="0.2" stopColor="#f6d64a" stopOpacity="0" />
        </RadialGradient>
        <RadialGradient id="haze" cx="75" cy="88.2" rx="1466.25" ry="811.44" gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#ffffff" stopOpacity="0.72" />
          <Stop offset="0.24" stopColor="#ffffff" stopOpacity="0" />
        </RadialGradient>
        {/* "Overlay+Blur" — 350pt teal blob at (-108,-113), 60pt layer blur. */}
        <RadialGradient id="mesh" cx="67" cy="62" rx="175" ry="175" gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#d4f0f0" stopOpacity="0.25" />
          <Stop offset="1" stopColor="#d4f0f0" stopOpacity="0" />
        </RadialGradient>
      </Defs>
      <Rect width={FRAME_W} height={CANVAS_H} fill="url(#base)" />
      <Rect width={FRAME_W} height={BACKDROP_H} fill="url(#pink)" />
      <Rect width={FRAME_W} height={BACKDROP_H} fill="url(#blue)" />
      <Rect width={FRAME_W} height={BACKDROP_H} fill="url(#gold)" />
      <Rect width={FRAME_W} height={BACKDROP_H} fill="url(#haze)" />
      <Rect width={FRAME_W} height={300} fill="url(#mesh)" />
    </Svg>
  );
}

/* -------------------------------- sections -------------------------------- */
/** "Date & Time", "Project Type", "Shoot Location", "Brief / Description". */
const Heading = ({ y, children }: { y: number; children: string }) => (
  <Txt x={20} y={y} w={335} size={15} weight="bold" font="inter" color={INK} lineHeight={18.15}>
    {children}
  </Txt>
);

/** A pill chip from the two clipped, horizontally scrolling strips. */
function Chip({
  x, w, tw, label, on, onBg, onLine, onInk, onPress,
}: {
  x: number; w: number; tw: number; label: string; on: boolean;
  onBg: string; onLine: string; onInk: string; onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        {
          left: x,
          width: w,
          backgroundColor: on ? onBg : GLASS_60,
          borderColor: on ? onLine : GLASS_LINE,
          opacity: pressed ? 0.85 : 1,
        },
      ]}
    >
      <Txt
        x={17}
        y={11}
        w={tw}
        size={13}
        weight="semibold"
        font="inter"
        color={on ? onInk : INK_MUTED}
        lineHeight={15.73}
        numberOfLines={1}
      >
        {label}
      </Txt>
    </Pressable>
  );
}

/** 44x24 add-on switch; the knob sits at x=2 off and x=22 on. */
const Toggle = ({ y, on, onPress }: { y: number; on: boolean; onPress: () => void }) => (
  <Pressable
    onPress={onPress}
    style={({ pressed }) => [
      styles.toggle,
      { top: y, backgroundColor: on ? TOGGLE_ON : TOGGLE_OFF, opacity: pressed ? 0.85 : 1 },
    ]}
  >
    <View style={[styles.knob, { left: on ? 22 : 2 }]} />
  </Pressable>
);

/* --------------------------------- screen --------------------------------- */
export default function ConfirmVideographerBooking() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: creators = [] } = useCreators();
  const createContract = useCreate<Contract>("contracts");

  const creator: Creator | undefined = useMemo(
    () => creators.find((c) => c.id === id) ?? creators[0],
    [creators, id],
  );

  const [slot, setSlot] = useState(1); // frame ships 10:00 AM selected
  const [type, setType] = useState(0); // ...and Instagram Reels
  const [location, setLocation] = useState("Hauz Khas Village, Delhi");
  const [brief, setBrief] = useState("");
  const [addons, setAddons] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(ADDONS.map((a) => [a.key, a.initial] as const)),
  );

  const { lines, subtotal, total } = useMemo(() => {
    const rows = [{ label: BASE_LABEL, amount: BASE_PRICE }].concat(
      ADDONS.filter((a) => addons[a.key]).map((a) => ({ label: a.title, amount: a.amount })),
    );
    const sum = rows.reduce((n, r) => n + r.amount, 0);
    return { lines: rows.slice(0, MAX_LINES), subtotal: sum, total: totalOf(sum) };
  }, [addons]);

  const submit = () => {
    if (!creator || createContract.isPending) return;
    createContract.mutate(
      {
        kind: "CREATOR",
        title: `${TYPES[type].label} shoot — ${creator.name}`,
        amount: total,
        status: "pending",
      },
      { onSuccess: () => router.back() },
    );
  };

  return (
    <Screen height={CANVAS_H} background="#f7f0e4" scroll>
      <Backdrop />

      {/* -------------------------------- Top Nav ------------------------------ */}
      <Pressable
        onPress={() => router.back()}
        style={({ pressed }) => [styles.back, pressed && styles.pressed]}
      >
        <Feather name="chevron-left" size={20} color="#1c1c1e" />
      </Pressable>
      <Txt x={114} y={30.5} w={175} size={16} weight="bold" font="inter" color={INK} lineHeight={19.36}>
        Confirm Videographer
      </Txt>

      {/* ---------------------------- Creator Summary -------------------------- */}
      <Abs
        x={20}
        y={100}
        w={335}
        h={106}
        radius={24}
        bg={GLASS_70}
        border={GLASS_LINE}
        borderWidth={1}
        style={styles.cardShadow}
      />
      <View style={styles.photo}>
        {creator?.avatarUrl ? (
          <Image source={{ uri: creator.avatarUrl }} style={styles.photoFill} resizeMode="cover" />
        ) : (
          <LinearGradient
            colors={gradients.avatarA}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.photoFill}
          />
        )}
      </View>
      <Txt x={125} y={118} w={213} size={16} weight="bold" font="inter" color={INK} lineHeight={19.36} numberOfLines={1}>
        {creator?.name ?? "—"}
      </Txt>
      <Txt x={125} y={141} w={213} size={13} weight="regular" font="inter" color={INK_META} lineHeight={15.73} numberOfLines={1}>
        {`Videographer | ${creator?.location ?? "Delhi"}`}
      </Txt>
      <Abs x={125} y={165} w={155} h={23} radius={10} bg="#f3e5f5" />
      <Abs x={135} y={170.5} w={12} h={12} center>
        <Feather name="video" size={12} color="#6a1b9a" />
      </Abs>
      <Txt x={153} y={169} w={117} size={12} weight="bold" font="inter" color="#6a1b9a" lineHeight={14.52} numberOfLines={1}>
        {`₹${inr(BASE_PRICE)} | ${SHOOT_HOURS}`}
      </Txt>

      {/* ------------------------------ Date & Time ---------------------------- */}
      <Heading y={230}>Date &amp; Time</Heading>
      <Abs
        x={20}
        y={260}
        w={335}
        h={38}
        radius={20}
        bg={GLASS_60}
        border={GLASS_LINE}
        borderWidth={1}
        style={styles.fieldShadow}
      />
      <Abs x={37} y={271} w={16} h={16} center>
        <Feather name="calendar" size={16} color={INK} />
      </Abs>
      <Txt x={63} y={271} w={146} size={13} weight="semibold" font="inter" color={INK} lineHeight={15.73} numberOfLines={1}>
        Thursday, 20 Jun 2026
      </Txt>
      <Abs x={323.23} y={271} w={16} h={16} center>
        <Feather name="chevron-down" size={16} color={ICON_MUTED} />
      </Abs>

      {/* Time slots — the strip clips at 335pt and scrolls, as in the frame. */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.slotStrip}
        contentContainerStyle={{ width: SLOTS_W, height: 42 }}
      >
        {SLOTS.map((s, i) => (
          <Chip
            key={s.label}
            x={s.x}
            w={s.w}
            tw={s.tw}
            label={s.label}
            on={i === slot}
            onBg={SLOT_ON_BG}
            onLine={SLOT_ON_LINE}
            onInk={SLOT_ON_INK}
            onPress={() => setSlot(i)}
          />
        ))}
      </ScrollView>

      {/* ------------------------------ Project Type --------------------------- */}
      <Heading y={376}>Project Type</Heading>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.typeStrip}
        contentContainerStyle={{ width: TYPES_W, height: 42 }}
      >
        {TYPES.map((t, i) => (
          <Chip
            key={t.label}
            x={t.x}
            w={t.w}
            tw={t.tw}
            label={t.label}
            on={i === type}
            onBg={TYPE_ON_BG}
            onLine={TYPE_ON_LINE}
            onInk={TYPE_ON_INK}
            onPress={() => setType(i)}
          />
        ))}
      </ScrollView>

      {/* ----------------------------- Shoot Location -------------------------- */}
      <Heading y={472}>Shoot Location</Heading>
      <Abs
        x={20}
        y={502}
        w={335}
        h={38}
        radius={20}
        bg={GLASS_60}
        border={GLASS_LINE}
        borderWidth={1}
        style={styles.fieldShadow}
      />
      <Abs x={37} y={513} w={16} h={16} center>
        <Feather name="map-pin" size={16} color={INK} />
      </Abs>
      <TextInput
        value={location}
        onChangeText={setLocation}
        placeholder="Hauz Khas Village, Delhi"
        placeholderTextColor={ICON_MUTED}
        style={styles.locationInput}
      />
      <Abs x={324} y={514} w={14} h={14} center>
        <Feather name="crosshair" size={14} color={ICON_MUTED} />
      </Abs>

      {/* --------------------------- Brief / Description ----------------------- */}
      <Heading y={564}>Brief / Description</Heading>
      <Abs x={20} y={594} w={335} h={80} radius={16} bg={GLASS_60} border={GLASS_LINE} borderWidth={1} />
      <TextInput
        value={brief}
        onChangeText={setBrief}
        placeholder={"Describe your requirement, moodboard link,\nor any specific details..."}
        placeholderTextColor="#888888"
        multiline
        textAlignVertical="top"
        style={styles.briefInput}
      />

      {/* --------------------------------- Add-ons ----------------------------- */}
      <Abs
        x={20}
        y={698}
        w={335}
        h={223}
        radius={24}
        bg={GLASS_70}
        border={GLASS_LINE}
        borderWidth={1}
        style={styles.cardShadow}
      />
      <Txt x={37} y={715} w={301} size={15} weight="bold" font="inter" color={INK} lineHeight={18.15}>
        Add-ons
      </Txt>
      {ADDONS.map((a) => (
        <Fragment key={a.key}>
          <Txt
            x={37}
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
          <Txt
            x={37}
            y={a.priceY}
            w={a.priceW}
            size={13}
            weight="medium"
            font="inter"
            color={INK_META}
            lineHeight={15.73}
            numberOfLines={1}
          >
            {a.price}
          </Txt>
          <Toggle
            y={a.toggleY}
            on={!!addons[a.key]}
            onPress={() => setAddons((prev) => ({ ...prev, [a.key]: !prev[a.key] }))}
          />
          {a.divider !== null ? <Abs x={37} y={a.divider} w={301} h={1} bg={ROW_LINE} /> : null}
        </Fragment>
      ))}

      {/* ----------------------------- Cost Breakdown -------------------------- */}
      <Heading y={945}>Cost Breakdown</Heading>
      {/* "Gradient" — the 315x6 white sliver peeking above the card. */}
      <Abs x={30} y={969} w={315} h={6} radius={3} bg="#ffffff" />
      <Abs x={20} y={975} w={335} h={215} radius={20} bg="#ffffff" style={styles.breakdownShadow} />
      {lines.map((l, i) => (
        <Fragment key={l.label}>
          <Txt
            x={40}
            y={LINE_Y + i * LINE_STEP}
            w={200}
            size={14}
            weight="regular"
            font="inter"
            color={INK_MUTED}
            lineHeight={16.94}
            numberOfLines={1}
          >
            {l.label}
          </Txt>
          <Txt
            x={40}
            y={LINE_Y + i * LINE_STEP}
            w={295}
            size={14}
            weight="regular"
            font="inter"
            color={INK_MUTED}
            lineHeight={16.94}
            align="right"
          >
            {`₹${inr(l.amount)}`}
          </Txt>
        </Fragment>
      ))}
      <Txt x={40} y={1103} w={120} size={14} weight="regular" font="inter" color={INK_MUTED} lineHeight={16.94}>
        Subtotal
      </Txt>
      <Txt x={40} y={1103} w={295} size={14} weight="semibold" font="inter" color={INK} lineHeight={16.94} align="right">
        {`₹${inr(subtotal)}`}
      </Txt>
      <Abs x={40} y={1132} w={295} h={1} bg="#eaeaea" />
      <Txt x={40} y={1149} w={120} size={18} weight="bold" font="inter" color={INK} lineHeight={21.78}>
        Total
      </Txt>
      <Txt x={40} y={1149} w={295} size={18} weight="bold" font="inter" color={TOTAL_INK} lineHeight={21.78} align="right">
        {`₹${inr(total)}`}
      </Txt>

      {/* ------------------------------- Footer CTA ---------------------------- */}
      <LinearGradient
        colors={["#faf9f6", "#faf9f6", "rgba(250,249,246,0)"]}
        locations={[0, 0.6, 1]}
        start={{ x: 0.5, y: 1 }}
        end={{ x: 0.5, y: 0 }}
        style={[styles.ctaBar, { top: CTA_Y }]}
      />
      <Pressable
        onPress={submit}
        disabled={!creator || createContract.isPending}
        style={({ pressed }) => [
          styles.ctaButton,
          { top: CTA_Y + 16, opacity: !creator || createContract.isPending ? 0.5 : pressed ? 0.9 : 1 },
        ]}
      >
        <Txt x={98.5} y={16} w={138} size={16} weight="bold" font="inter" color="#ffffff" lineHeight={19.36} align="center">
          Confirm Booking
        </Txt>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  backdrop: { position: "absolute", left: 0, top: 0 },
  pressed: { opacity: 0.85 },

  back: {
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
    borderColor: GLASS_LINE,
    shadowColor: "#000000",
    shadowOpacity: 0.03,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },

  cardShadow: {
    shadowColor: "#000000",
    shadowOpacity: 0.03,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  fieldShadow: {
    shadowColor: "#000000",
    shadowOpacity: 0.02,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  breakdownShadow: {
    shadowColor: "#000000",
    shadowOpacity: 0.04,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },

  /* 72x72 photo, cornerRadius 2.38, rotated -3.14deg in the frame. */
  photo: {
    position: "absolute",
    left: 37,
    top: 117,
    width: 72,
    height: 72,
    borderRadius: 2.38,
    overflow: "hidden",
    transform: [{ rotate: "-3.14deg" }],
  },
  photoFill: { width: 72, height: 72 },

  slotStrip: { position: "absolute", left: 20, top: 310, width: 335, height: 42 },
  typeStrip: { position: "absolute", left: 20, top: 406, width: 335, height: 42 },
  chip: {
    position: "absolute",
    top: 0,
    height: 38,
    borderRadius: 20,
    borderWidth: 1,
    shadowColor: "#000000",
    shadowOpacity: 0.02,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },

  locationInput: {
    position: "absolute",
    left: 63,
    top: 511,
    width: 152.69,
    height: 20,
    padding: 0,
    fontFamily: fonts.interMedium,
    fontSize: 13,
    color: INK,
  },
  briefInput: {
    position: "absolute",
    left: 37,
    top: 609,
    width: 291.41,
    height: 50,
    padding: 0,
    fontFamily: fonts.inter,
    fontSize: 14,
    lineHeight: 16.94,
    color: INK,
  },

  toggle: {
    position: "absolute",
    left: 294,
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

  ctaBar: { position: "absolute", left: 0, width: FRAME_W, height: CTA_H },
  ctaButton: {
    position: "absolute",
    left: 20,
    width: 335,
    height: 52,
    borderRadius: 24,
    backgroundColor: BUTTON_INK,
    shadowColor: "#000000",
    shadowOpacity: 0.15,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
});
