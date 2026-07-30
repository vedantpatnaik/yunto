import { useMemo, useState } from "react";
import { Image, Pressable, ScrollView, StyleSheet, TextInput } from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import Svg, {
  Defs,
  LinearGradient as SvgLinear,
  RadialGradient,
  Rect,
  Stop,
} from "react-native-svg";
import { Abs, Ring, Screen, Txt } from "../../../src/ui/Frame";
import { fonts } from "../../../src/theme";
import { compact, useAgencies, useCreators, useMe } from "../../../src/api/hooks";

/**
 * Landing Page — Edit Content — Figma frame 7358:27242 (375x875), traced 1:1.
 *
 * The public landing-page editor. Layout, top to bottom:
 *   Header 0..80            back chip + "Landing Page"
 *   Tabs   106..163         glass segmented control, "Edit Content" active
 *   Main Content 191..750   a CLIPPED 375x559 pane (clipsContent on 7358:27413)
 *                           whose column actually runs to y=1059 and reserves
 *                           120pt of bottom padding — hence the inner scroll.
 *   Bottom CTA 766..875     the pinned "Save" button, outside the clip box.
 *
 * Coordinates below are raw frame coordinates; <Screen> scales the 375pt canvas.
 * Nodes inside the pane are shifted by MAIN_Y through oy() so the spec's own
 * y values stay visible at every call site.
 */

/* ------------------------------- geometry -------------------------------- */
const FRAME_W = 375;
const FRAME_H = 875;

/** "Main Content" (7358:27413): clipped pane, and the height of its column. */
const MAIN_Y = 191;
const MAIN_H = 559;
/** 1059 (last chip bottom 1016+43) - 191 + 120 bottom padding. */
const PANE_CONTENT_H = 988;
const oy = (y: number) => y - MAIN_Y;

/* --------------------------- spec colour tokens --------------------------- */
const INK = "#1a1525";
const MUTED = "#8a8199";
const LABEL_INK = "#6b627a";
const HEADER_INK = "#1d1d1f";
const ICON_INK = "#1c1c1e";
const VERIFIED = "#4a90e2";
const AGENCY_INK = "#4b8227";
const AGENCY_BODY = "#5e7a4c";
const AGENCY_FILL = "rgba(235,248,227,0.8)";
const STAT_FILL = "#f8f9fa";
const CARD_FILL = "rgba(255,255,255,0.85)";
const GLASS_50 = "rgba(255,255,255,0.5)";
const GLASS_60 = "rgba(255,255,255,0.6)";
const GLASS_65 = "rgba(255,255,255,0.65)";
const BORDER_80 = "rgba(255,255,255,0.8)";
const BORDER_90 = "rgba(255,255,255,0.9)";
const ADD_BORDER = "#d0c9db";
const CTA_FILL = "#312b28";

/* ------------------------------- spec copy -------------------------------- */
const BIO_PLACEHOLDER =
  "Hi! I'm Sophia, a lifestyle and fashion\ncreator. I love creating\naesthetic vlogs and UGC content for\nbrands I truly believe in. Let's create\nsomething beautiful together! ✨";
const AGENCY_BODY_COPY = "Your agency currently handles all\ninbound brand inquiries.";
/** The frame's own preview values — held until the creator record lands. */
const FALLBACK_NAME = "Sophia Roy";
const FALLBACK_FOLLOWERS = "1.2M Followers";
const FALLBACK_REACH = "2.4M";
const FALLBACK_VIEWS = "1.8M";
const FALLBACK_AGENCY = "Stellar Talent";
/** No response-time column exists on Creator, so this stays the design's value. */
const RESPONSE_TIME = "2h";

/** Stat row (7358:27429): three 90.33x62 tiles, 12pt gutters, at y=312. */
const STATS = [
  { x: 40, label: "REACH" },
  { x: 142.33, label: "VIEWS" },
  { x: 244.67, label: "RESPONSE" },
] as const;

/** Services chip set (7358:27474). tw = the spec's measured text width. */
const SERVICES = [
  { label: "UGC Videos", x: 15, y: 910, w: 117.72, tw: 81.72, bg: "#eaf2ff", fg: "#2c68c6" },
  { label: "Paid Campaigns", x: 144.72, y: 910, w: 145.44, tw: 109.44, bg: "#ffeaee", fg: "#c83b65" },
  { label: "Barter Campaigns", x: 15, y: 963, w: 157.8, tw: 121.8, bg: "#fff4e5", fg: "#b36814" },
  { label: "Tutorials", x: 184.8, y: 963, w: 94.83, tw: 58.83, bg: "#ebf8e3", fg: "#4b8227" },
] as const;

/* -------------------------------- backdrop -------------------------------- */
/** The frame fill: a warm vertical base under four soft radial glows. */
function Backdrop() {
  return (
    <Svg width={FRAME_W} height={FRAME_H} style={styles.backdrop}>
      <Defs>
        <SvgLinear id="lp-base" x1="187.5" y1="0" x2="187.5" y2={FRAME_H} gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#F7F0E4" />
          <Stop offset="1" stopColor="#F4EBDD" />
        </SvgLinear>
        <RadialGradient id="lp-pink" cx="285" cy="542.5" rx="1027.5" ry="568.75" gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#F7B7DA" stopOpacity="0.34" />
          <Stop offset="0.26" stopColor="#F7B7DA" stopOpacity="0" />
        </RadialGradient>
        <RadialGradient id="lp-blue" cx="90" cy="367.5" rx="967.5" ry="533.75" gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#BACDF4" stopOpacity="0.36" />
          <Stop offset="0.24" stopColor="#BACDF4" stopOpacity="0" />
        </RadialGradient>
        <RadialGradient id="lp-gold" cx="292.5" cy="157.5" rx="1338.75" ry="735" gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#F6D64A" stopOpacity="0.22" />
          <Stop offset="0.2" stopColor="#F6D64A" stopOpacity="0" />
        </RadialGradient>
        <RadialGradient id="lp-haze" cx="75" cy="87.5" rx="1466.25" ry="805" gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#FFFFFF" stopOpacity="0.72" />
          <Stop offset="0.24" stopColor="#FFFFFF" stopOpacity="0" />
        </RadialGradient>
      </Defs>
      <Rect width={FRAME_W} height={FRAME_H} fill="url(#lp-base)" />
      <Rect width={FRAME_W} height={FRAME_H} fill="url(#lp-pink)" />
      <Rect width={FRAME_W} height={FRAME_H} fill="url(#lp-blue)" />
      <Rect width={FRAME_W} height={FRAME_H} fill="url(#lp-gold)" />
      <Rect width={FRAME_W} height={FRAME_H} fill="url(#lp-haze)" />
    </Svg>
  );
}

/* --------------------------------- screen --------------------------------- */
export default function LandingPageEditContentScreen() {
  const router = useRouter();
  const { data: creators } = useCreators();
  const { data: agencies } = useAgencies();
  const { data: me } = useMe();

  /** The signed-in creator's own record — the profile this page publishes. */
  const creator = useMemo(() => {
    if (!creators?.length) return undefined;
    return creators.find((c) => c.name === me?.name) ?? creators[0];
  }, [creators, me]);

  const agency = agencies?.find((a) => a.id === creator?.agencyId);

  // Creator carries no bio / contact-time / services columns, so the editor
  // holds its edits locally and Save closes the sheet. Nothing is fabricated
  // into the record: only the three figures below come off the API.
  const [bio, setBio] = useState("");

  const name = creator?.name ?? FALLBACK_NAME;
  const followers = creator ? `${compact(creator.followers)} Followers` : FALLBACK_FOLLOWERS;
  const statValues = [
    // No reach column exists; the audience size is the true figure behind it.
    creator ? compact(creator.followers) : FALLBACK_REACH,
    creator ? compact(creator.avgViews) : FALLBACK_VIEWS,
    RESPONSE_TIME,
  ];
  const agencyName = agency?.name ?? FALLBACK_AGENCY;
  const avatarUrl = creator?.avatarUrl;

  return (
    <Screen height={FRAME_H} background="#F7F0E4" scroll>
      <Backdrop />

      {/* ------------------------------- Header ------------------------------ */}
      <Pressable
        onPress={() => router.back()}
        style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
      >
        <Feather name="chevron-left" size={20} color={ICON_INK} />
      </Pressable>
      <Txt
        x={100} y={30} w={154} size={16} weight="bold" font="inter"
        color={HEADER_INK} lineHeight={19.36} align="center"
      >
        Landing Page
      </Txt>

      {/* -------------------------------- Tabs ------------------------------- */}
      <Abs
        x={20} y={106} w={335} h={57} radius={28}
        bg={GLASS_50} border={GLASS_60} borderWidth={1}
      />
      <Abs x={27} y={113} w={160.5} h={43} radius={24} bg="#ffffff" style={styles.tabShadow} />
      <Txt
        x={27} y={125} w={160.5} size={15} weight="semibold" font="inter"
        color={INK} lineHeight={18.15} align="center"
      >
        Edit Content
      </Txt>
      <Txt
        x={187.5} y={125} w={160.5} size={15} weight="semibold" font="inter"
        color={MUTED} lineHeight={18.15} align="center"
      >
        Themes
      </Txt>

      {/* ---------------------------- Main Content --------------------------- */}
      <ScrollView
        style={styles.pane}
        contentContainerStyle={styles.paneContent}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled
      >
        {/* ------------------ Creator Profile Preview Card ------------------ */}
        <Abs
          x={15} y={oy(191)} w={345} h={208} radius={28}
          bg={CARD_FILL} border="#ffffff" borderWidth={1} style={styles.cardShadow}
        />

        <Abs x={40} y={oy(216)} w={72} h={72} radius={34} bg="#ffffff" style={styles.avatarShadow}>
          {avatarUrl ? (
            <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
          ) : (
            <Ring x={0} y={0} size={72} />
          )}
        </Abs>

        <Txt
          x={128} y={oy(228.5)} w={114.94} size={22} weight="bold" font="inter"
          color={INK} lineHeight={26.62} letterSpacing={-0.5} numberOfLines={1}
        >
          {name}
        </Txt>
        <Abs x={248.94} y={oy(232.5)} w={18} h={18} center>
          <Feather name="check-circle" size={18} color={VERIFIED} />
        </Abs>
        <Txt
          x={128} y={oy(258.5)} w={138.94} size={14} weight="medium" font="inter"
          color={MUTED} lineHeight={16.94} numberOfLines={1}
        >
          {followers}
        </Txt>

        {STATS.map((stat, i) => (
          <Abs key={stat.label} x={stat.x} y={oy(312)} w={90.33} h={62} radius={16} bg={STAT_FILL}>
            <Txt
              x={0} y={12} w={90.33} size={16} weight="bold" font="inter"
              color={INK} lineHeight={19.36} align="center" numberOfLines={1}
            >
              {statValues[i]}
            </Txt>
            <Txt
              x={0} y={36} w={90.33} size={11} weight="semibold" font="inter"
              color={MUTED} lineHeight={13.31} letterSpacing={0.5} align="center"
            >
              {stat.label}
            </Txt>
          </Abs>
        ))}

        {/* ------------------------ Agency Status Card ---------------------- */}
        <Abs
          x={15} y={oy(417)} w={345} h={112} radius={28}
          bg={AGENCY_FILL} border="#ffffff" borderWidth={1} style={styles.cardShadow}
        />
        <Abs x={40} y={oy(442)} w={40} h={40} radius={14} bg="#ffffff" center style={styles.agencyIconShadow}>
          <Feather name="briefcase" size={18} color={AGENCY_INK} />
        </Abs>
        <Txt
          x={96} y={oy(442)} w={207.05} size={15} weight="bold" font="inter"
          color={INK} lineHeight={18.15} numberOfLines={1}
        >
          {`Managed by ${agencyName}`}
        </Txt>
        <Txt
          x={96} y={oy(467)} w={207.05} size={13} weight="medium" font="inter"
          color={AGENCY_BODY} lineHeight={18.2}
        >
          {AGENCY_BODY_COPY}
        </Txt>

        {/* ------------------------------ Bio Input ------------------------- */}
        <Txt
          x={21} y={oy(547)} w={339} size={14} weight="semibold" font="inter"
          color={LABEL_INK} lineHeight={16.94}
        >
          Add your bio
        </Txt>
        <Abs
          x={15} y={oy(576)} w={335} h={162} radius={24}
          bg="#ffffff" border={BORDER_80} borderWidth={1} style={styles.fieldShadow}
        >
          <TextInput
            value={bio}
            onChangeText={setBio}
            placeholder={BIO_PLACEHOLDER}
            placeholderTextColor={INK}
            multiline
            textAlignVertical="top"
            style={styles.bioInput}
          />
        </Abs>

        {/* -------------------------- Contact Time Input -------------------- */}
        <Txt
          x={21} y={oy(766)} w={339} size={14} weight="semibold" font="inter"
          color={LABEL_INK} lineHeight={16.94}
        >
          Preferred contact time
        </Txt>
        <Abs
          x={15} y={oy(795)} w={345} h={58} radius={20}
          bg="#ffffff" border={BORDER_80} borderWidth={1} style={styles.fieldShadow}
        >
          <Txt
            x={21} y={19.5} w={176} size={15} weight="medium" font="inter"
            color={INK} lineHeight={18.15}
          >
            10:00 AM - 2:00 PM EST
          </Txt>
          <Abs x={304} y={19} w={20} h={20} center>
            <Feather name="chevron-down" size={20} color={LABEL_INK} />
          </Abs>
        </Abs>

        {/* --------------------------- Services Provided -------------------- */}
        <Txt
          x={21} y={oy(881)} w={339} size={14} weight="semibold" font="inter"
          color={LABEL_INK} lineHeight={16.94}
        >
          Services provided
        </Txt>
        {SERVICES.map((chip) => (
          <Abs key={chip.label} x={chip.x} y={oy(chip.y)} w={chip.w} h={41} radius={100} bg={chip.bg}>
            <Txt
              x={18} y={12} w={chip.tw} size={14} weight="semibold" font="inter"
              color={chip.fg} lineHeight={16.94} numberOfLines={1}
            >
              {chip.label}
            </Txt>
          </Abs>
        ))}
        <Abs
          x={15} y={oy(1016)} w={125.47} h={43} radius={100}
          bg="#ffffff" border={ADD_BORDER} borderWidth={1}
        >
          <Abs x={19} y={13.5} w={16} h={16} center>
            <Feather name="plus" size={16} color={MUTED} />
          </Abs>
          <Txt
            x={41} y={13} w={65.47} size={14} weight="medium" font="inter"
            color={MUTED} lineHeight={16.94}
          >
            Add More
          </Txt>
        </Abs>
      </ScrollView>

      {/* ------------------------------ Bottom CTA --------------------------- */}
      <Pressable
        onPress={() => router.back()}
        style={({ pressed }) => [styles.cta, pressed && styles.pressed]}
      >
        <Txt
          x={0} y={18} w={232} size={16} weight="semibold" font="inter"
          color="#ffffff" lineHeight={19.36} align="center"
        >
          Save
        </Txt>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  backdrop: { position: "absolute", left: 0, top: 0 },
  pressed: { opacity: 0.85 },

  backButton: {
    position: "absolute",
    left: 15,
    top: 18,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: GLASS_65,
    borderWidth: 1,
    borderColor: BORDER_90,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000000",
    shadowOpacity: 0.03,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 1,
  },

  tabShadow: {
    shadowColor: "#000000",
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },

  /** The clipped 375x559 content pane; its column overflows by design. */
  pane: { position: "absolute", left: 0, top: MAIN_Y, width: FRAME_W, height: MAIN_H },
  paneContent: { height: PANE_CONTENT_H },

  cardShadow: {
    shadowColor: "#000000",
    shadowOpacity: 0.03,
    shadowRadius: 40,
    shadowOffset: { width: 0, height: 10 },
    elevation: 2,
  },

  avatarShadow: {
    shadowColor: "#000000",
    shadowOpacity: 0.08,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },
  avatarImage: { position: "absolute", left: 0, top: 0, width: 72, height: 72, borderRadius: 34 },

  agencyIconShadow: {
    shadowColor: AGENCY_INK,
    shadowOpacity: 0.1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },

  fieldShadow: {
    shadowColor: "#000000",
    shadowOpacity: 0.02,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 4 },
    elevation: 1,
  },

  bioInput: {
    position: "absolute",
    left: 21,
    top: 21,
    width: 259,
    height: 120,
    padding: 0,
    fontFamily: fonts.inter,
    fontSize: 15,
    lineHeight: 24,
    color: INK,
  },

  cta: {
    position: "absolute",
    left: 71.5,
    top: 782,
    width: 232,
    height: 55,
    borderRadius: 36,
    backgroundColor: CTA_FILL,
  },
});
