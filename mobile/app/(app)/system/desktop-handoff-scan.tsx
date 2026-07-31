import { useEffect, useRef } from "react";
import { Animated, Easing, Linking, Pressable, StyleSheet } from "react-native";
import Svg, { Path, Rect } from "react-native-svg";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Abs, Screen, Txt } from "../../../src/ui/Frame";
import { colors } from "../../../src/theme";
import { useMe } from "../../../src/api/hooks";

/**
 * System — "scan web" (Figma 6499:22308, 375x946), traced 1:1.
 *
 * Entry state of the desktop hand-off pair: the phone points its camera at a QR
 * code the desktop planner is showing, and pairing that code promotes the
 * session to the big screen.
 *
 * Two capabilities the design assumes are not available in this build, so the
 * screen renders the frame's own fallbacks rather than faking them:
 *
 *   ponytail: no camera. expo-camera / react-native-vision-camera is not a
 *   dependency here, so the 320x320 preview shows the frame's "Placeholder for
 *   actual camera feed" gradient (6499:22330) exactly as drawn. Dropping a
 *   <CameraView> into CAMERA_BOX is the whole change; the reticle, brackets and
 *   scan line already sit above it. Denied / restricted permission states are
 *   not drawn by the frame and are deliberately not invented here.
 *
 *   ponytail: no pairing endpoint. POST /api/web-sessions/pair { token } does
 *   not exist yet, so nothing is posted. Once it ships, call it from the
 *   barcode handler and push /system/desktop-handoff-connected on success.
 *
 * PLANNER_ORIGIN below is the frame's placeholder copy and must be swapped for
 * the real deployed web origin before ship — it appears both in the instruction
 * text and in the URL the footer button opens.
 */

/* ------------------------------- geometry -------------------------------- */
const FRAME_H = 946;

/**
 * Figma measures a child's offset from its parent's *outer* edge; React Native
 * lays absolute children out from the parent's padding box, i.e. already inside
 * the stroke. Every offset below therefore has its parent's stroke subtracted,
 * or the whole reticle stack drifts down-right by the borders it sits inside.
 */
const PREVIEW_STROKE = 1;
const RETICLE_STROKE = 3;

/** "Camera Preview Container" — 6499:22329. */
const CAMERA_BOX = { x: 27.5, y: 227.5, size: 320 } as const;
const PREVIEW_INNER = CAMERA_BOX.size - PREVIEW_STROKE * 2; // 318 — "…camera feed"
/** "Scanning Frame" — 6499:22331, spec offset 40.75 inside the preview. */
const RETICLE = {
  x: 40.75 - PREVIEW_STROKE,
  y: 40.75 - PREVIEW_STROKE,
  size: 238.5,
} as const;
const RETICLE_INNER = RETICLE.size - RETICLE_STROKE * 2; // 232.5
/** "SVG" 6499:22336 fills the reticle's inner box; "SVG" 6499:22332 is 71.25 in. */
const GLYPH_OFFSET = 71.25 - RETICLE_STROKE; // 68.25
/**
 * "Scan Line Animation" — 6499:22335 sits at the reticle's vertical middle and
 * sweeps the full inner height, so it travels +/- that middle distance.
 */
const SCAN_H = 2;
const SCAN_Y = (RETICLE_INNER - SCAN_H) / 2; // 115.25
const SCAN_TRAVEL = SCAN_Y;

/* ---------------------------- spec colour tokens -------------------------- */
const BG_ORANGE = "#f2c94c"; // bg / orange
const BG_BLUE = "#8ab2dc"; // bg / Blue
const BG_YELLOW = "#e5e501"; // bg / Yellow
const HEADER_LINE = "#f0eff1";
const INK_TITLE = "#1b1b1c";
const INK_SUBTITLE = "#1e293b";
const INK_LABEL = "#64748b";
const INK_BODY = "#334155";
const INK_EMPHASIS = "#0f172a";
const PREVIEW_FILL = "rgba(15,23,42,0.1)";
const PREVIEW_LINE = "rgba(255,255,255,0.2)";
const RETICLE_LINE = "rgba(255,255,255,0.6)";
const BRACKET_LINE = "rgba(255,255,255,0.4)";
const GLYPH_LINE = "rgba(255,255,255,0.3)";
const CTA_FILL = "#ffbcb8";
const CTA_INK = "#333333";

const FEED_GRADIENT = ["rgba(226,232,240,0.2)", "rgba(148,163,184,0.2)"] as const;
const SCAN_GRADIENT = [
  "rgba(255,255,255,0)",
  "rgba(255,255,255,1)",
  "rgba(255,255,255,0)",
] as const;

/**
 * The frame's placeholder origin. Kept literal because it is design copy the
 * instruction text spells out; replace both uses together when the planner ships.
 */
const PLANNER_ORIGIN = "planner.yourapp.com";
const PLANNER_URL = `https://${PLANNER_ORIGIN}`;

/* --------------------------------- glyphs --------------------------------- */
/**
 * "SVG" 6499:22336 — four 23.25pt corner brackets on a 232.5pt board, inset
 * 23.25 from each edge. Coordinates are the spec boxes rebased on the board.
 */
function CornerBrackets() {
  return (
    <Svg width={RETICLE_INNER} height={RETICLE_INNER} style={styles.bracketBoard}>
      {[
        "M23.25,46.5 L23.25,23.25 L46.5,23.25",
        "M186,23.25 L209.25,23.25 L209.25,46.5",
        "M23.25,186 L23.25,209.25 L46.5,209.25",
        "M209.25,186 L209.25,209.25 L186,209.25",
      ].map((d) => (
        <Path
          key={d}
          d={d}
          stroke={BRACKET_LINE}
          strokeWidth={4.65}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      ))}
    </Svg>
  );
}

/**
 * "SVG" 6499:22332 — the QR mark on a 96pt board. Figma reports the two vectors
 * only by their 66pt / 54pt bounding boxes; the paths themselves are a QR glyph:
 * three 27pt rounded finder squares on a 12pt gutter, each holding a centre dot,
 * plus the five-dot data cluster filling the free quadrant. All at the spec's
 * 4pt weight, which paints the 3pt dots as 7pt blobs.
 */
const FINDERS = [
  [15, 15],
  [54, 15],
  [15, 54],
] as const;
const FINDER = 27;
const DOT = 7;
const DOTS = [
  [28.5, 28.5], // finder centres
  [67.5, 28.5],
  [28.5, 67.5],
  [55.5, 55.5], // data cluster, 67.5 +/- 12
  [79.5, 55.5],
  [67.5, 67.5],
  [55.5, 79.5],
  [79.5, 79.5],
] as const;

function QrGlyph() {
  return (
    <Svg width={96} height={96} style={styles.glyphBoard}>
      {FINDERS.map(([x, y]) => (
        <Rect
          key={`f${x}-${y}`}
          x={x}
          y={y}
          width={FINDER}
          height={FINDER}
          rx={5}
          stroke={GLYPH_LINE}
          strokeWidth={4}
          fill="none"
        />
      ))}
      {DOTS.map(([cx, cy]) => (
        <Rect
          key={`d${cx}-${cy}`}
          x={cx - DOT / 2}
          y={cy - DOT / 2}
          width={DOT}
          height={DOT}
          rx={2}
          fill={GLYPH_LINE}
        />
      ))}
    </Svg>
  );
}

/* --------------------------------- screen --------------------------------- */
export default function DesktopHandoffScan() {
  const router = useRouter();

  // The hand-off promotes *this* session to the desktop, so the CTA stays inert
  // until the signed-in user has resolved — otherwise the browser would be sent
  // to a planner with nothing to pair against.
  const { data: me, isLoading } = useMe();
  const ready = !isLoading && !!me;

  const scan = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(scan, {
          toValue: 1,
          duration: 1800,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(scan, {
          toValue: 0,
          duration: 1800,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [scan]);

  const scanY = scan.interpolate({
    inputRange: [0, 1],
    outputRange: [-SCAN_TRAVEL, SCAN_TRAVEL],
  });

  /** Hand the planner to the browser, then show the connected state. */
  const openDesktopPlanner = () => {
    if (!ready) return;
    Linking.openURL(PLANNER_URL).catch(() => undefined);
    router.push("/system/desktop-handoff-connected");
  };

  return (
    <Screen height={FRAME_H} background={colors.white} safeTop={false} scroll>
      {/* bg — 6499:22311. Four 244px-blurred ellipses; React Native has no layer
          blur, so each is a soft low-opacity wash at its spec box. "Purple"
          (6499:22314) starts at y=1307 and never enters the clipped frame. */}
      <Abs x={20.88} y={705.73} w={122.26} h={660.83} radius={61} bg={BG_ORANGE} opacity={0.6} />
      <Abs x={64.93} y={599.19} w={395.15} h={2049.67} radius={198} bg={BG_BLUE} opacity={0.6} />
      <Abs x={-58.45} y={-595.98} w={476.66} h={2212.77} radius={238} bg={BG_YELLOW} opacity={0.25} />

      {/* mesh-gradient (2) 2 — 6499:22316, white wash over the mesh image */}
      <Abs x={0} y={0} w={375} h={946} bg={colors.white} opacity={0.45} />

      {/* ------------------------------- header ---------------------------- */}
      {/* Container — 6499:22317 */}
      <Abs x={0} y={44} w={375} h={54} style={styles.headerBar} />

      {/* Ellipse 1391 + meteor-icons:arrow-up — 6499:22322 / 6499:22323 */}
      <Pressable onPress={() => router.back()} style={styles.backButton}>
        <Feather name="arrow-left" size={20} color={colors.ink} />
      </Pressable>

      {/* Open planner on desktop — 6499:22325 */}
      <Txt x={62} y={52} w={227} size={20} weight="semibold" color={INK_TITLE} lineHeight={37}>
        Open planner on desktop
      </Txt>

      {/* Container — 6499:22326, 80% opacity subtitle block */}
      <Abs x={8} y={135} w={358} h={46} opacity={0.8}>
        <Txt
          x={16}
          y={0}
          w={326}
          size={14}
          font="inter"
          color={INK_SUBTITLE}
          lineHeight={22.75}
          align="center"
        >
          {"Scan the QR code from your desktop to continue\nplanning your content on a larger screen."}
        </Txt>
      </Abs>

      {/* ------------------- Main - CameraPreviewSection -------------------- */}
      {/* Camera Preview Container — 6499:22329 */}
      <Abs
        x={CAMERA_BOX.x}
        y={CAMERA_BOX.y}
        w={CAMERA_BOX.size}
        h={CAMERA_BOX.size}
        radius={32}
        bg={PREVIEW_FILL}
        border={PREVIEW_LINE}
        borderWidth={PREVIEW_STROKE}
        style={styles.previewClip}
      >
        {/* Placeholder for actual camera feed — 6499:22330 */}
        <LinearGradient
          colors={FEED_GRADIENT}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.feed}
        />

        {/* Scanning Frame — 6499:22331 */}
        <Abs
          x={RETICLE.x}
          y={RETICLE.y}
          w={RETICLE.size}
          h={RETICLE.size}
          radius={28}
          border={RETICLE_LINE}
          borderWidth={RETICLE_STROKE}
        >
          <CornerBrackets />
          <QrGlyph />

          {/* Scan Line Animation — 6499:22335 */}
          <Animated.View style={[styles.scanLine, { transform: [{ translateY: scanY }] }]}>
            <LinearGradient
              colors={SCAN_GRADIENT}
              locations={[0, 0.5, 1]}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={styles.scanFill}
            />
          </Animated.View>
        </Abs>
      </Abs>

      {/* Instructions — 6499:22344. The spec box is 136 x 103, which the system
          face overruns by a hair, wrapping the trailing "S" onto its own line and
          into the sentence below; the box is widened about its own centre (187.5)
          so the centred label lands exactly where the design puts it. */}
      <Txt
        x={112.5}
        y={579.5}
        w={150}
        size={12}
        font="inter"
        color={INK_LABEL}
        lineHeight={16}
        letterSpacing={1.2}
        align="center"
        style={styles.upper}
      >
        Instructions
      </Txt>

      {/* 6499:22346 — the origin runs at Inter 600 / #0f172a inside the sentence */}
      <Txt
        x={61}
        y={602.88}
        w={253}
        size={14}
        font="inter"
        color={INK_BODY}
        lineHeight={22.75}
        align="center"
      >
        {"Go to "}
        <Txt size={14} weight="semibold" font="inter" color={INK_EMPHASIS}>
          {PLANNER_ORIGIN}
        </Txt>
        {" on your\ncomputer and scan the QR code."}
      </Txt>

      {/* --------------------- Footer - ActionControls ---------------------- */}
      {/* Frame 14536 — 6505:22487 */}
      <Pressable onPress={openDesktopPlanner} disabled={!ready} style={styles.cta}>
        {/* Open Desktop Planner — 6505:22488 */}
        <Txt
          x={75}
          y={16}
          w={170}
          size={15}
          weight="semibold"
          color={CTA_INK}
          lineHeight={18.9}
          align="center"
        >
          Open Desktop Planner
        </Txt>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  /* --------------------------------- header ------------------------------- */
  headerBar: {
    borderBottomWidth: 1,
    borderBottomColor: HEADER_LINE,
    shadowColor: "#000000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
    elevation: 1,
  },
  backButton: {
    position: "absolute",
    left: 16,
    top: 52,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
  },

  /* ----------------------------- camera preview --------------------------- */
  previewClip: { overflow: "hidden" },
  feed: { position: "absolute", left: 0, top: 0, width: PREVIEW_INNER, height: PREVIEW_INNER },

  /* -------------------------------- reticle ------------------------------- */
  bracketBoard: { position: "absolute", left: 0, top: 0 },
  glyphBoard: { position: "absolute", left: GLYPH_OFFSET, top: GLYPH_OFFSET },
  scanLine: {
    position: "absolute",
    left: 0,
    top: SCAN_Y,
    width: RETICLE_INNER,
    height: SCAN_H,
  },
  scanFill: { flex: 1 },

  /* ------------------------------ helper text ----------------------------- */
  upper: { textTransform: "uppercase" },

  /* --------------------------------- footer ------------------------------- */
  cta: {
    position: "absolute",
    left: 32,
    top: 740,
    width: 320,
    height: 51,
    borderRadius: 16,
    backgroundColor: CTA_FILL,
    borderWidth: 1,
    borderColor: colors.ink,
    shadowColor: CTA_INK,
    shadowOpacity: 1,
    shadowRadius: 0,
    shadowOffset: { width: 3, height: 3 },
    elevation: 3,
  },
});
