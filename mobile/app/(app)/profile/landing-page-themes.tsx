import { useState } from "react";
import { Linking, Pressable, ScrollView, Share, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
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
import { useCreators, useMe } from "../../../src/api/hooks";

/**
 * Landing Page — Themes tab — Figma 7358:27489 (375x875).
 *
 * Second tab of the landing-page editor. Header and the 335x57 glass tab pill
 * stay pinned; "Main Content" (x=1 y=191 w=373 h=574, clipsContent) is a
 * viewport onto a 1072pt column — preview mockup card with its floating
 * Preview pill, the socy.io slug row, the Theme Style strip, Font Style row,
 * Layout pair and the "Hide my insights" toggle — so that column owns an inner
 * ScrollView. The Theme Style strip overruns its own 343pt container by design
 * (Clean White is clipped), so it scrolls horizontally inside it. The 232x55
 * Save pill is pinned at y=782.
 *
 * Coordinates below are raw frame coordinates from the spec; <Screen> scales
 * the 375pt canvas to the device.
 */

/* ------------------------------- geometry -------------------------------- */
const FRAME_W = 375;
const FRAME_H = 875;

/** "Main Content": the 574pt viewport the 1072pt column scrolls inside. */
const MAIN_X = 1;
const MAIN_Y = 191;
const MAIN_W = 373;
const MAIN_H = 574;
/** Column runs from the preview card (y=191) to the toggle card (y=1223) + 40pt pad. */
const COLUMN_BOTTOM = 1263;
const SCROLL_H = COLUMN_BOTTOM - MAIN_Y;

/** Theme Style strip: a 343pt window on a 367pt row of three 110pt cards. */
const STRIP_X = 16;
const STRIP_Y = 552;
const STRIP_W = 343;
const STRIP_H = 218;
const STRIP_CONTENT_W = 367;
/** Card row: first card at x=21, repeating every 126pt. */
const CARD_X = 21;
const CARD_STEP = 126;
const CARD_Y = 564;
const CARD_W = 110;
const CARD_H = 206;
/** The selected-check badge hangs 5pt above the card, 91pt in from its left. */
const BADGE_DX = 91;
const BADGE_DY = -5;

/** Layout pair: two 163.5pt cards at x=16 and x=195.5. */
const LAYOUT_Y = 965;
const LAYOUT_W = 163.5;
const LAYOUT_H = 124;

/* --------------------------- spec colour tokens --------------------------- */
const INK = "#2D2640";
const MUTED = "#8A8199";
const TITLE_INK = "#1D1D1F";
const BACK_INK = "#1C1C1E";
const BUTTON_INK = "#312B28";

const GLASS_55 = "rgba(255,255,255,0.55)";
const GLASS_60 = "rgba(255,255,255,0.6)";
const GLASS_65 = "rgba(255,255,255,0.65)";
const GLASS_70 = "rgba(255,255,255,0.7)";
const GLASS_80 = "rgba(255,255,255,0.8)";
const GLASS_95 = "rgba(255,255,255,0.95)";
const GLASS_40 = "rgba(255,255,255,0.4)";
const WHITE = "#FFFFFF";

const BORDER_60 = "rgba(255,255,255,0.6)";
const BORDER_80 = "rgba(255,255,255,0.8)";
const BORDER_90 = "rgba(255,255,255,0.9)";
const PANEL_BORDER = "rgba(220,215,230,0.4)";

const INK_05 = "rgba(45,38,64,0.05)";
const INK_10 = "rgba(45,38,64,0.1)";
const INK_15 = "rgba(45,38,64,0.15)";
const INK_20 = "rgba(45,38,64,0.2)";
const WHITE_20 = "rgba(255,255,255,0.2)";

const MINT = "#D4F5D8";
const MINT_BORDER = "rgba(167,243,208,0.6)";
const MINT_INK = "#14532D";
const PINK_BORDER = "rgba(255,179,198,0.6)";
const PINK_FILL = "#FFF0F4";
const DARK_PREVIEW = "#2A2438";
const DARK_CHIP = "#403852";

const PREVIEW_FILL = ["#EAE0FF", "#FFE4EB"] as const;

/** The public landing page lives on socy.io; Preview opens the live page. */
const SITE = "https://socy.io";
/** Slug shown while the signed-in creator's record is still loading. */
const FALLBACK_SLUG = "sophiaroy";

type Theme = "modern" | "dark" | "clean";
type Layout = "centered" | "left";

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

/* --------------------------------- screen --------------------------------- */
export default function LandingPageThemes() {
  const router = useRouter();
  const { data: me } = useMe();
  const { data: creators } = useCreators();

  /**
   * The signed-in influencer's own creator record carries the public handle the
   * landing page is published under; fall back to their display name.
   */
  const mine = creators?.find((c) => c.name === me?.name);
  const slug = (mine?.handle ?? me?.name ?? FALLBACK_SLUG)
    .replace(/^@/, "")
    .replace(/\s+/g, "")
    .toLowerCase();
  const url = `${SITE}/${slug}`;

  /**
   * Picker state. The design ships Modern Gradient / Centered selected and the
   * insights toggle on; there is no landing-page write endpoint yet, so Save
   * simply returns to the editor.
   */
  const [theme, setTheme] = useState<Theme>("modern");
  const [layout, setLayout] = useState<Layout>("centered");
  const [hideInsights, setHideInsights] = useState(true);

  const themeX: Record<Theme, number> = {
    modern: CARD_X,
    dark: CARD_X + CARD_STEP,
    clean: CARD_X + CARD_STEP * 2,
  };
  const badgeX = themeX[theme] + BADGE_DX;

  const cardChrome = (active: boolean, activeBorder: string) =>
    active
      ? { bg: GLASS_95, border: activeBorder }
      : { bg: GLASS_55, border: BORDER_80 };

  const modern = cardChrome(theme === "modern", MINT_BORDER);
  const dark = cardChrome(theme === "dark", MINT_BORDER);
  const clean = cardChrome(theme === "clean", MINT_BORDER);
  const centered = cardChrome(layout === "centered", PINK_BORDER);
  const leftAligned = cardChrome(layout === "left", PINK_BORDER);

  return (
    <Screen height={FRAME_H} background="#F7F0E4" scroll>
      <Backdrop />

      {/* ============================ Main Content =========================== */}
      <Abs x={MAIN_X} y={MAIN_Y} w={MAIN_W} h={MAIN_H} style={styles.clip}>
        <ScrollView
          nestedScrollEnabled
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollBody}
        >
          {/* Re-hoists frame coordinates inside the scroll body. */}
          <View style={styles.layer}>
            {/* ---------------------- Preview Mockup Card ------------------- */}
            <Abs
              x={16} y={191} w={343} h={220} radius={32}
              bg={GLASS_55} border={BORDER_80} borderWidth={1}
              style={styles.previewShadow}
            />

            {/* Background — #EAE0FF → #FFE4EB diagonal. */}
            <Abs x={23} y={198} w={329} h={206} radius={26} style={styles.clip}>
              <LinearGradient
                colors={PREVIEW_FILL}
                start={{ x: 0.09, y: -0.14 }}
                end={{ x: 0.91, y: 1.14 }}
                style={StyleSheet.absoluteFill}
              />
            </Abs>

            {/* Mock hero: avatar plate, name bar, handle bar, three link rows. */}
            <Abs x={163.5} y={230} w={48} h={31.5} radius={24} bg={GLASS_80} style={styles.plateShadow} />
            <Abs x={127.5} y={273.5} w={120} h={6.56} radius={100} bg={INK_15} />
            <Abs x={107.5} y={292.06} w={160} h={3.94} radius={100} bg={INK_15} opacity={0.6} />
            <Abs x={75.16} y={316} w={224.69} h={24} radius={12} bg={GLASS_40} border={BORDER_60} borderWidth={1} />
            <Abs x={75.16} y={348} w={224.69} h={24} radius={12} bg={GLASS_40} border={BORDER_60} borderWidth={1} />
            <Abs x={75.16} y={380} w={224.69} h={24} radius={12} bg={GLASS_40} border={BORDER_60} borderWidth={1} />

            {/* Floating Preview Button — 131.85x39 pill, icon + label, 8pt gap. */}
            <Pressable
              onPress={() => void Linking.openURL(url)}
              style={({ pressed }) => [styles.preview, pressed && styles.pressed]}
            >
              <Feather name="eye" size={16} color={INK} />
              <Txt size={14} weight="bold" font="inter" color={INK} lineHeight={16.94}>
                Preview
              </Txt>
            </Pressable>

            {/* --------------------- Shareable Link Section ----------------- */}
            <Abs
              x={16} y={443} w={343} h={58} radius={100}
              bg={GLASS_55} border={BORDER_80} borderWidth={1}
              style={styles.cardShadow}
            />
            <Abs x={37} y={463} w={18} h={18} center>
              <Feather name="link-2" size={18} color={MUTED} />
            </Abs>
            <Txt
              x={67} y={463.5} w={120.73}
              size={14} weight="semibold" font="inter" color={INK} lineHeight={16.94}
              numberOfLines={1}
            >
              {`socy.io/${slug}`}
            </Txt>
            <Pressable
              onPress={() => void Share.share({ message: url })}
              style={({ pressed }) => [styles.copy, pressed && styles.pressed]}
            >
              <Feather name="copy" size={16} color={INK} />
            </Pressable>

            {/* ------------------------ Themes Section ---------------------- */}
            <Txt
              x={20} y={533} w={339}
              size={15} weight="bold" font="inter" color={INK} lineHeight={18.15}
            >
              Theme Style
            </Txt>

            <Abs x={STRIP_X} y={STRIP_Y} w={STRIP_W} h={STRIP_H} style={styles.clip}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.stripBody}
              >
                <View style={styles.stripLayer}>
                  {/* Theme 1 — Modern Gradient. */}
                  <Abs
                    x={themeX.modern} y={CARD_Y} w={CARD_W} h={CARD_H} radius={20}
                    bg={modern.bg} border={modern.border} borderWidth={1}
                    style={theme === "modern" ? styles.mintShadow : undefined}
                  />
                  <Abs x={62} y={605} w={28} h={28} radius={14} bg={GLASS_70} style={styles.chipShadow} />
                  <Abs x={46} y={641} w={60} h={6} radius={10} bg={INK_15} />
                  <Abs x={56} y={655} w={40} h={6} radius={10} bg={INK_15} opacity={0.6} />
                  <Txt
                    x={48.5} y={705} w={55}
                    size={13} weight="semibold" font="inter" color={INK}
                    lineHeight={15.73} align="center"
                  >
                    {"Modern\nGradient"}
                  </Txt>

                  {/* Theme 2 — Dark Professional. */}
                  <Abs
                    x={themeX.dark} y={CARD_Y} w={CARD_W} h={CARD_H} radius={20}
                    bg={dark.bg} border={dark.border} borderWidth={1}
                    style={theme === "dark" ? styles.mintShadow : undefined}
                  />
                  <Abs x={156} y={573} w={92} h={120} radius={14} bg={DARK_PREVIEW} />
                  <Abs x={188} y={605} w={28} h={28} radius={14} bg={DARK_CHIP} />
                  <Abs x={172} y={641} w={60} h={6} radius={10} bg={WHITE_20} />
                  <Abs x={182} y={655} w={40} h={6} radius={10} bg={WHITE_20} opacity={0.6} />
                  <Txt
                    x={162.98} y={705} w={78.04}
                    size={13} weight="semibold" font="inter" color={INK}
                    lineHeight={15.73} align="center"
                  >
                    {"Dark\nProfessional"}
                  </Txt>

                  {/* Theme 3 — Clean White. */}
                  <Abs
                    x={themeX.clean} y={CARD_Y} w={CARD_W} h={CARD_H} radius={20}
                    bg={clean.bg} border={clean.border} borderWidth={1}
                    style={theme === "clean" ? styles.mintShadow : undefined}
                  />
                  <Abs x={282} y={573} w={92} h={120} radius={14} bg={WHITE} border={PANEL_BORDER} borderWidth={1} />
                  <Abs
                    x={314} y={605} w={28} h={28} radius={14}
                    bg={GLASS_70} border={PANEL_BORDER} borderWidth={1}
                    style={styles.chipShadow}
                  />
                  <Abs x={298} y={641} w={60} h={6} radius={10} bg={INK_10} />
                  <Abs x={308} y={655} w={40} h={6} radius={10} bg={INK_10} opacity={0.6} />
                  <Txt
                    x={289.86} y={705} w={76.27}
                    size={13} weight="semibold" font="inter" color={INK}
                    lineHeight={15.73} align="center"
                  >
                    Clean White
                  </Txt>

                  {/* Selected badge — rides the active card. */}
                  <Abs
                    x={badgeX} y={CARD_Y + BADGE_DY} w={24} h={24} radius={12}
                    bg={MINT} border={WHITE} borderWidth={2}
                    center
                    style={styles.cardShadow}
                  >
                    <Feather name="check" size={12} color={MINT_INK} />
                  </Abs>

                  {/* Hit areas sit last so the card art below stays untouched. */}
                  <Pressable
                    onPress={() => setTheme("modern")}
                    style={[styles.themeHit, { left: themeX.modern }]}
                  />
                  <Pressable
                    onPress={() => setTheme("dark")}
                    style={[styles.themeHit, { left: themeX.dark }]}
                  />
                  <Pressable
                    onPress={() => setTheme("clean")}
                    style={[styles.themeHit, { left: themeX.clean }]}
                  />
                </View>
              </ScrollView>
            </Abs>

            {/* ---------------------- Font Style Section -------------------- */}
            <Txt
              x={20} y={797} w={339}
              size={15} weight="bold" font="inter" color={INK} lineHeight={18.15}
            >
              Font Style
            </Txt>
            <Abs
              x={16} y={831} w={343} h={68} radius={20}
              bg={GLASS_55} border={BORDER_80} borderWidth={1}
              style={styles.cardShadow}
            />
            {/* Specimen tile — the design sets "Aa" in a serif face; the app
                only ships Outfit and Inter, so it renders in the label's own. */}
            <Abs x={37} y={848} w={34} h={34} radius={10} bg={GLASS_80} center style={styles.plateShadow}>
              <Txt size={15} weight="bold" font="inter" color={INK} lineHeight={17.25} align="center">
                Aa
              </Txt>
            </Abs>
            <Txt
              x={85} y={856.5} w={133.09}
              size={14} weight="semibold" font="inter" color={INK} lineHeight={16.94}
              numberOfLines={1}
            >
              Inter / Modern Sans
            </Txt>
            <Abs x={318} y={855} w={20} h={20} center>
              <Feather name="chevron-down" size={20} color={MUTED} />
            </Abs>

            {/* ------------------- Layout Alignment Section ----------------- */}
            <Txt
              x={20} y={931} w={339}
              size={15} weight="bold" font="inter" color={INK} lineHeight={18.15}
            >
              Layout
            </Txt>

            {/* Centered — mock bars sit on the card's centre line. */}
            <Abs
              x={16} y={LAYOUT_Y} w={LAYOUT_W} h={LAYOUT_H} radius={20}
              bg={centered.bg} border={centered.border} borderWidth={1}
              style={layout === "centered" ? styles.pinkShadow : undefined}
            />
            <Abs
              x={47.55} y={982} w={100.39} h={60} radius={12}
              bg={layout === "centered" ? PINK_FILL : GLASS_60}
            />
            <Abs x={89.75} y={990} w={16} h={13.5} radius={8} bg={INK_10} />
            <Abs x={79.75} y={1008.5} w={36} h={3.38} radius={4} bg={INK_20} />
            <Abs x={85.75} y={1016.88} w={24} h={3.38} radius={4} bg={INK_20} opacity={0.6} />
            <Abs x={55.55} y={1027.26} w={84.39} h={6.75} radius={4} bg={INK_05} />
            <Txt
              x={68.73} y={1056} w={58.05}
              size={13} weight="semibold" font="inter" color={INK} lineHeight={15.73}
            >
              Centered
            </Txt>

            {/* Left Aligned — same mock bars, flushed to the preview's left. */}
            <Abs
              x={195.5} y={LAYOUT_Y} w={LAYOUT_W} h={LAYOUT_H} radius={20}
              bg={leftAligned.bg} border={leftAligned.border} borderWidth={1}
              style={layout === "left" ? styles.pinkShadow : undefined}
            />
            <Abs
              x={227.05} y={982} w={100.39} h={60} radius={12}
              bg={layout === "left" ? PINK_FILL : GLASS_60}
            />
            <Abs x={235.05} y={990} w={16} h={13.5} radius={8} bg={INK_10} />
            <Abs x={235.05} y={1008.5} w={36} h={3.38} radius={4} bg={INK_20} />
            <Abs x={235.05} y={1016.88} w={24} h={3.38} radius={4} bg={INK_20} opacity={0.6} />
            <Abs x={235.05} y={1027.26} w={84.39} h={6.75} radius={4} bg={INK_05} />
            <Txt
              x={239.43} y={1056} w={75.63}
              size={13} weight="semibold" font="inter" color={INK} lineHeight={15.73}
            >
              Left Aligned
            </Txt>

            <Pressable onPress={() => setLayout("centered")} style={[styles.layoutHit, { left: 16 }]} />
            <Pressable onPress={() => setLayout("left")} style={[styles.layoutHit, { left: 195.5 }]} />

            {/* ------------------------ Settings Toggle --------------------- */}
            <Abs
              x={16} y={1121} w={343} h={102} radius={24}
              bg={GLASS_55} border={BORDER_80} borderWidth={1}
              style={styles.cardShadow}
            />
            <Txt
              x={37} y={1142} w={113.59}
              size={14} weight="bold" font="inter" color={INK} lineHeight={16.94}
            >
              Hide my insights
            </Txt>
            <Txt
              x={37} y={1165} w={220.56}
              size={13} weight="medium" font="inter" color={MUTED} lineHeight={18.2}
            >
              {"Follower count and analytics will be\nhidden from public view."}
            </Txt>
            <Pressable
              onPress={() => setHideInsights((on) => !on)}
              style={[styles.track, { backgroundColor: hideInsights ? MINT : INK_15 }]}
            >
              <View style={[styles.knob, { left: hideInsights ? 24 : 2 }]} />
            </Pressable>
          </View>
        </ScrollView>
      </Abs>

      {/* ============================= Bottom CTA ============================ */}
      <Pressable
        onPress={() => router.back()}
        style={({ pressed }) => [styles.save, pressed && styles.pressed]}
      >
        <Txt
          x={0} y={18} w={232}
          size={16} weight="semibold" font="inter" color={WHITE} lineHeight={19.36} align="center"
        >
          Save
        </Txt>
      </Pressable>

      {/* =============================== Tabs =============================== */}
      <Abs
        x={20} y={106} w={335} h={57} radius={100}
        bg={GLASS_55} border={BORDER_80} borderWidth={1}
      />
      {/* Active tab plate — the Themes half of the 2x160.5 pill. */}
      <Abs x={187.5} y={113} w={160.5} h={43} radius={100} bg={WHITE} style={styles.cardShadow} />
      <Txt
        x={65.58} y={125} w={83.34}
        size={14} weight="semibold" font="inter" color={MUTED} lineHeight={16.94} align="center"
      >
        Edit Content
      </Txt>
      <Txt
        x={240.41} y={125} w={54.67}
        size={14} weight="semibold" font="inter" color={INK} lineHeight={16.94} align="center"
      >
        Themes
      </Txt>
      {/* Hit area last so the label never swallows the tap. */}
      <Pressable onPress={() => router.back()} style={[styles.tabHit, { left: 27 }]} />

      {/* =============================== Header ============================== */}
      <Pressable
        onPress={() => router.back()}
        style={({ pressed }) => [styles.back, pressed && styles.pressed]}
      >
        <Feather name="arrow-left" size={20} color={BACK_INK} />
      </Pressable>
      <Txt
        x={100} y={30} w={154}
        size={16} weight="bold" font="inter" color={TITLE_INK} lineHeight={19.36} align="center"
      >
        Landing Page
      </Txt>
    </Screen>
  );
}

const styles = StyleSheet.create({
  backdrop: { position: "absolute", left: 0, top: 0 },
  clip: { overflow: "hidden" },
  pressed: { opacity: 0.85 },

  /** Scroll extent in Main-space; the layer re-hoists frame coordinates. */
  scrollBody: { height: SCROLL_H },
  layer: {
    position: "absolute",
    left: -MAIN_X,
    top: -MAIN_Y,
    width: FRAME_W,
    height: COLUMN_BOTTOM,
  },

  /** Theme strip: 367pt of cards behind a 343pt window. */
  stripBody: { width: STRIP_CONTENT_W },
  stripLayer: {
    position: "absolute",
    left: -STRIP_X,
    top: -STRIP_Y,
    width: FRAME_W + 8,
    height: CARD_Y + CARD_H,
  },

  back: {
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

  /** Inactive "Edit Content" half of the tab pill. */
  tabHit: { position: "absolute", top: 113, width: 160.5, height: 43 },

  /** 0/8/24 @25% #C8C3DC — the file's default card lift. */
  cardShadow: {
    shadowColor: "#C8C3DC",
    shadowOpacity: 0.25,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
    elevation: 2,
  },
  previewShadow: {
    shadowColor: "#C8C3DC",
    shadowOpacity: 0.35,
    shadowRadius: 40,
    shadowOffset: { width: 0, height: 16 },
    elevation: 3,
  },
  plateShadow: {
    shadowColor: "#000000",
    shadowOpacity: 0.03,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  chipShadow: {
    shadowColor: "#000000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  mintShadow: {
    shadowColor: "#A7F3D0",
    shadowOpacity: 0.25,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 2,
  },
  pinkShadow: {
    shadowColor: "#FFB3C6",
    shadowOpacity: 0.2,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 2,
  },

  preview: {
    position: "absolute",
    left: 121.58,
    top: 347,
    width: 131.85,
    height: 39,
    borderRadius: 100,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: GLASS_95,
    borderWidth: 1,
    borderColor: WHITE,
    shadowColor: "#C8C3DC",
    shadowOpacity: 0.25,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
    elevation: 2,
  },

  copy: {
    position: "absolute",
    left: 310,
    top: 452,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: GLASS_80,
    shadowColor: "#000000",
    shadowOpacity: 0.03,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },

  themeHit: { position: "absolute", top: CARD_Y, width: CARD_W, height: CARD_H },
  layoutHit: { position: "absolute", top: LAYOUT_Y, width: LAYOUT_W, height: LAYOUT_H },

  track: {
    position: "absolute",
    left: 286,
    top: 1157,
    width: 52,
    height: 30,
    borderRadius: 15,
  },
  knob: {
    position: "absolute",
    top: 2,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: WHITE,
    shadowColor: "#C8C3DC",
    shadowOpacity: 0.25,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
    elevation: 2,
  },

  save: {
    position: "absolute",
    left: 71.5,
    top: 782,
    width: 232,
    height: 55,
    borderRadius: 36,
    backgroundColor: BUTTON_INK,
  },
});
