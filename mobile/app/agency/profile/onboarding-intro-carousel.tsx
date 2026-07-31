import { useCallback, useEffect, useRef, useState } from "react";
import { Platform, Pressable, ScrollView, View } from "react-native";
import type { NativeScrollEvent, NativeSyntheticEvent } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as SecureStore from "expo-secure-store";
import Svg, { Circle, Path } from "react-native-svg";
import { Screen, Abs, Txt } from "../../../src/ui/Frame";

/**
 * Intro carousel — Figma frames 495:21519 / 500:22006 / 500:22045 (375x812).
 *
 * Three sibling frames in the design, one paged component here: they are
 * pixel-identical apart from the copy block and the illustration slot, so
 * shipping three routes would triple the chrome for nothing. The frames page
 * horizontally inside the 375pt canvas and the circular next button — the one
 * node whose geometry never changes across the three — is drawn once, on top.
 *
 * The "illustrations" are literal placeholder TEXT nodes in the file; no art
 * was ever drawn. They are reproduced verbatim at their spec coordinates
 * rather than substituted, so the gap stays visible instead of being papered
 * over with invented graphics.
 *
 * Coordinates below are raw frame coordinates; <Screen> scales the canvas.
 */

/* ------------------------------- geometry -------------------------------- */
const FRAME_W = 375;
const FRAME_H = 812;

/** Next button: Frame 21/22 at (147,657) 80x80. */
const BTN_X = 147;
const BTN_Y = 657;
const BTN_SIZE = 80;
/**
 * Progress ring around the button. The rendered frames show a 3.5pt annulus
 * hugging the 80pt outline (stroke centred at r=38.25, so it spans 36.5–40),
 * #cecccc for the remainder and white for the progress arc: 120° per page,
 * anchored at the right edge and sweeping over the top. The 68.58pt inner
 * white disc (Ellipse 27, centre 39.71,39.71 in button-local coords) floats
 * inside with the page background showing through the ~2.2pt gap.
 */
const RING_R = 38.25;
const RING_W = 3.5;
const INNER_R = 68.58 / 2;

/** Arc of `sweepDeg` (<360) ending at the ring's right edge, drawn clockwise over the top. */
function arcPath(sweepDeg: number): string {
  const start = ((360 - sweepDeg) * Math.PI) / 180;
  const sx = 40 + RING_R * Math.cos(start);
  const sy = 40 + RING_R * Math.sin(start);
  const large = sweepDeg > 180 ? 1 : 0;
  return `M ${sx} ${sy} A ${RING_R} ${RING_R} 0 ${large} 1 ${40 + RING_R} 40`;
}

/* --------------------------- spec colour tokens --------------------------- */
const PAGE_BG = "#83BBFF";
const COPY_INK = "#FFFFFF";
const ART_INK = "#000000";

/* -------------------------------- content -------------------------------- */
interface Slide {
  /** Placeholder TEXT node standing in for the illustration that was never drawn. */
  art: {
    x: number; y: number; w: number; h: number;
    size: number; lineHeight: number;
    font: "outfit" | "inter"; weight: "regular" | "medium";
    text: string;
  };
  /** "Frame 2" — the vertical copy stack. Title box is 97 tall, body 48. */
  titleY: number;
  title: string;
  bodyY: number;
  body: string;
}

const SLIDES: Slide[] = [
  {
    art: {
      x: 97, y: 199, w: 219, h: 120,
      size: 15, lineHeight: 40, font: "outfit", weight: "regular",
      text: "Illustration of profile cards, content calendar, or creator avatars in rows",
    },
    titleY: 467,
    title: "Manage Creators Seamlessly",
    bodyY: 574,
    body: "Track, view performance, and assign collaborators — no spreadsheets needed.",
  },
  {
    art: {
      x: 88, y: 201, w: 226, h: 72,
      size: 13.6, lineHeight: 24, font: "inter", weight: "medium",
      text: "Zepto-style payment summary or lead cards showing status (New → Contacted → Converted)",
    },
    titleY: 463,
    title: "Capture, contact & convert leads",
    bodyY: 570,
    body: "Organize brand inquiries, follow up faster, and close deals with a single click.",
  },
  {
    art: {
      x: 88, y: 213, w: 226, h: 48,
      size: 13.6, lineHeight: 24, font: "inter", weight: "medium",
      text: "Revenue dashboard / charts / or a visual “rocket” metaphor",
    },
    titleY: 463,
    title: "Grow your influencer business",
    bodyY: 570,
    body: "From campaign insights to payouts — get clarity, scale faster, and stay in control.",
  },
];

/* ------------------------------- persistence ------------------------------ */
/**
 * Whether the carousel has already been seen. SecureStore is native-only, so
 * web (which is how the screens are render-tested) falls back to localStorage,
 * mirroring the token storage in src/api/client.ts.
 */
const SEEN_KEY = "yunto_seen_onboarding";
const isWeb = Platform.OS === "web";

async function readSeen(): Promise<boolean> {
  try {
    if (isWeb) {
      return typeof localStorage !== "undefined" && localStorage.getItem(SEEN_KEY) === "1";
    }
    return (await SecureStore.getItemAsync(SEEN_KEY)) === "1";
  } catch {
    // Storage unavailable — fail open to "not seen"; showing it twice beats crashing.
    return false;
  }
}

async function writeSeen(): Promise<void> {
  try {
    if (isWeb) {
      if (typeof localStorage !== "undefined") localStorage.setItem(SEEN_KEY, "1");
      return;
    }
    await SecureStore.setItemAsync(SEEN_KEY, "1");
  } catch {
    /* nothing to do — the carousel simply shows again next launch */
  }
}

/* --------------------------------- screen --------------------------------- */
export default function OnboardingIntroCarouselScreen() {
  const router = useRouter();
  const scroller = useRef<ScrollView>(null);
  const [page, setPage] = useState(0);

  // Relaunch skip: nothing else in the tree reads the flag, so the screen
  // dismisses itself when it has already been through once.
  useEffect(() => {
    let alive = true;
    readSeen().then((seen) => {
      if (alive && seen && router.canGoBack()) router.back();
    });
    return () => {
      alive = false;
    };
  }, [router]);

  const onSettle = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    setPage(Math.round(e.nativeEvent.contentOffset.x / FRAME_W));
  }, []);

  const next = useCallback(() => {
    if (page < SLIDES.length - 1) {
      scroller.current?.scrollTo({ x: (page + 1) * FRAME_W, animated: true });
      return;
    }
    void writeSeen();
    if (router.canGoBack()) router.back();
  }, [page, router]);

  return (
    <Screen height={FRAME_H} background={PAGE_BG}>
      {/* Root frame fill — #83bbff, clipped to r=24 */}
      <Abs x={0} y={0} w={FRAME_W} h={FRAME_H} bg={PAGE_BG} radius={24} />

      <ScrollView
        ref={scroller}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onSettle}
        style={{ position: "absolute", left: 0, top: 0, width: FRAME_W, height: FRAME_H }}
        contentContainerStyle={{ width: FRAME_W * SLIDES.length, height: FRAME_H }}
      >
        {SLIDES.map((s) => (
          <View key={s.title} style={{ width: FRAME_W, height: FRAME_H }}>
            {/* Illustration slot — placeholder copy, vertically centred in its box */}
            <Abs
              x={s.art.x} y={s.art.y} w={s.art.w} h={s.art.h}
              style={{ justifyContent: "center" }}
            >
              <Txt
                size={s.art.size} weight={s.art.weight} font={s.art.font}
                color={ART_INK} lineHeight={s.art.lineHeight} w={s.art.w}
              >
                {s.art.text}
              </Txt>
            </Abs>

            {/* Frame 2 — headline */}
            <Abs x={16} y={s.titleY} w={343} h={97} style={{ justifyContent: "center" }}>
              <Txt size={32} weight="bold" color={COPY_INK} lineHeight={40} w={343}>
                {s.title}
              </Txt>
            </Abs>

            {/* Frame 2 — supporting line */}
            <Abs x={16} y={s.bodyY} w={343} h={48} style={{ justifyContent: "center" }}>
              <Txt
                size={13.6} weight="medium" font="inter"
                color={COPY_INK} lineHeight={24} w={343}
              >
                {s.body}
              </Txt>
            </Abs>
          </View>
        ))}
      </ScrollView>

      {/*
        Next button. Ellipse stack per the spec: #cecccc annulus, white
        progress arc (a third of the ring per page — Frame 22's white vector
        covers ~240°, the last frame's ring is fully white), white 68.58pt
        inner disc, chevron on top. The "oui:arrow-up" glyph sits at (177,687)
        20x20; the frame's 180° rotation plus the glyph's -90° leaves it
        pointing forward, which is what the tap does.
      */}
      <Pressable
        onPress={next}
        accessibilityRole="button"
        accessibilityLabel={page < SLIDES.length - 1 ? "Next" : "Get started"}
        style={({ pressed }) => ({
          position: "absolute",
          left: BTN_X,
          top: BTN_Y,
          width: BTN_SIZE,
          height: BTN_SIZE,
          alignItems: "center",
          justifyContent: "center",
          opacity: pressed ? 0.9 : 1,
        })}
      >
        <Svg
          width={BTN_SIZE}
          height={BTN_SIZE}
          viewBox="0 0 80 80"
          style={{ position: "absolute", left: 0, top: 0 }}
        >
          <Circle cx={40} cy={40} r={RING_R} stroke="#CECCCC" strokeWidth={RING_W} fill="none" />
          {page >= SLIDES.length - 1 ? (
            <Circle cx={40} cy={40} r={RING_R} stroke="#FFFFFF" strokeWidth={RING_W} fill="none" />
          ) : (
            <Path
              d={arcPath(120 * (page + 1))}
              stroke="#FFFFFF"
              strokeWidth={RING_W}
              fill="none"
            />
          )}
          <Circle cx={39.71} cy={39.71} r={INNER_R} fill="#FFFFFF" />
        </Svg>
        <Ionicons name="chevron-forward" size={20} color={ART_INK} />
      </Pressable>
    </Screen>
  );
}
