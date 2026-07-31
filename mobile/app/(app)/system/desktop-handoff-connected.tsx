import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Animated, Clipboard, Platform, Pressable } from "react-native";
import Svg, { Defs, LinearGradient, Path, RadialGradient, Rect, Stop } from "react-native-svg";
import { useRouter } from "expo-router";
import { Abs, Screen, Txt } from "../../../src/ui/Frame";
import { useList, useRemove } from "../../../src/api/hooks";

/**
 * Web Planner — connected session (Figma frame 6503:22406 "scan web", 375x946).
 *
 * The success half of the desktop hand-off: once the phone has paired with the
 * browser this frame replaces the scanner with a session-management screen —
 * status tile, the device that claimed the pairing, the session link, and the
 * kill switch.
 *
 * Session data comes from GET /web-sessions (the collection the pairing flow
 * writes to). That route is not built on the server yet, so every field falls
 * back to the literal the design ships with and the geometry never moves —
 * loading, empty and error all render the same boxes.
 */

/* -------------------------------- session --------------------------------- */
/** Active browser session; shape of a /web-sessions row. */
interface WebSession {
  id: string;
  device?: string;
  browser?: string;
  ip?: string;
  region?: string;
  country?: string;
  url?: string;
  status?: string;
  connectedAt?: string;
  lastHeartbeatAt?: string;
}

/** A heartbeat older than this is no longer a live desktop. */
const HEARTBEAT_STALE_MS = 60_000;

/* ------------------------------ frame palette ----------------------------- */
const HEADLINE = "#161616"; // 6503:22432
const SUBTLE = "#6b7280"; // 6503:22434 / 22444 / 22456
const TITLE_INK = "#1b1b1c"; // 6503:22423
const DEVICE_INK = "#262525"; // 6503:22442
const AVATAR_BG = "#ececec"; // 6503:22438
const AVATAR_INK = "#9f9f9f"; // 6503:22439
const GREEN = "#22c55e"; // status ring, check, live dot
const YELLOW = "#eab308"; // 6503:22453
const HAIRLINE = "#f0eff1"; // 6503:22415 bottom stroke
const CARD_LINE = "#000000"; // 6503:22435 / 22450 stroke
const CARD_SHADOW = "#333333"; // 6503:22435 / 22450 drop shadow
const COPY_INK = "#151522"; // 6503:22458
const DANGER = "#ef4444"; // 6503:22463
const PILL_FILL = "rgba(225,255,238,0.4)"; // #e1ffee @ 40%
const PILL_LINE = "rgba(34,197,94,0.2)"; // #22c55e @ 20%
const COPY_FILL = "rgba(106,106,106,0.1)"; // #6a6a6a @ 10%
const FOOTER_LINE = "rgba(255,255,255,0.1)"; // #ffffff @ 10%

/** bg 6503:22409 + mesh 6503:22414 — the 244px layer-blurred ellipses over the
 *  mesh image flatten to a smooth four-corner wash. RN has no layer blur, so
 *  the sheet is redrawn from the hues the rendered frame actually shows:
 *  blue top-left, peach top-right, mint mid-left, cream mid-right, and a
 *  yellow-green floor. */
const BG_TOP = "#ecefef";
const BG_FLOOR = "#f6ffd2";
const BG_FLOOR_DEEP = "#fdffc7";
const BG_BLUE = "#dbf3ff";
const BG_PEACH = "#ffeadb";
const BG_MINT = "#e0f9f0";
const BG_CREAM = "#fff3cf";

/** Liberation Mono (6503:22456) — the platform monospace face stands in. */
const MONO = Platform.OS === "ios" ? "Menlo" : "monospace";

/** Hard 3px offset shadow both cards carry (radius 0, #333333). */
const CARD_LIFT = {
  shadowColor: CARD_SHADOW,
  shadowOffset: { width: 3, height: 3 },
  shadowOpacity: 1,
  shadowRadius: 0,
  elevation: 3,
} as const;

/* --------------------------------- glyphs --------------------------------- */
/** meteor-icons:arrow-up rotated -90° (6503:22421) — 14x14 stroke at 2. */
const BackArrow = () => (
  <Svg width={14} height={14} viewBox="0 0 14 14">
    <Path
      d="M13 7H1M6 2L1 7l5 5"
      stroke={CARD_LINE}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </Svg>
);

/** 6503:22429 — the 37.33x26.67 check inside the 64px status tile, stroke 8. */
const CheckMark = () => (
  <Svg width={64} height={64} viewBox="0 0 64 64">
    <Path
      d="M13.33 33.33 L24 45.33 L50.67 18.67"
      stroke={GREEN}
      strokeWidth={8}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </Svg>
);

/** 6503:22453 — 13.75x17.5 gold padlock in the 20px session-link icon box:
 *  stroked shackle over a filled, rounded body. */
const Padlock = () => (
  <Svg width={20} height={20} viewBox="0 0 20 20">
    <Path
      d="M6.9 9 V5.6 a3.1 3.1 0 0 1 6.2 0 V9"
      stroke={YELLOW}
      strokeWidth={2}
      fill="none"
    />
    <Rect x={3.13} y={8.4} width={13.75} height={10.35} rx={2.5} fill={YELLOW} />
  </Svg>
);

/* --------------------------------- helpers -------------------------------- */
/** The link row shows a truncated URL, as the design does. */
function shortLink(url: string): string {
  const bare = url.replace(/^https?:\/\//, "");
  return bare.length > 18 ? `${bare.slice(0, 17)}…` : bare;
}

/* --------------------------------- screen --------------------------------- */
export default function DesktopHandoffConnected() {
  const router = useRouter();
  const { data, isLoading } = useList<WebSession>("web-sessions");
  const disconnect = useRemove("web-sessions");

  /** The paired browser. Absent while loading, or until the route exists. */
  const session = data?.[0];

  // Heartbeat freshness has to decay on its own, otherwise "Live" is just a
  // green dot that never goes out.
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 5_000);
    return () => clearInterval(t);
  }, []);

  const live = useMemo(() => {
    // No session row yet (route unbuilt, loading, error) — fall back to the
    // design's connected state, exactly as every text field does.
    if (!session) return true;
    if (session.lastHeartbeatAt) {
      const beat = Date.parse(session.lastHeartbeatAt);
      return Number.isFinite(beat) && now - beat < HEARTBEAT_STALE_MS;
    }
    return session.status === "connected";
  }, [session, now]);

  // Pulse runs only while the socket is actually alive.
  const pulse = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!live) {
      pulse.setValue(0);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 900, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 900, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [live, pulse]);

  /* ------------------------------ field values ---------------------------- */
  const device = session?.device ?? "MacBook";
  const browser = session?.browser ?? "Chrome";
  const ip = session?.ip ?? "127.0.0.1";
  const region = session?.region ?? session?.country ?? "India";
  const letter = device.trim().charAt(0).toUpperCase() || "M";
  const link = session?.url ?? "planner.app/web?s…";

  /* -------------------------------- actions ------------------------------- */
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 1600);
    return () => clearTimeout(t);
  }, [copied]);

  const copy = useCallback(() => {
    Clipboard.setString(link);
    setCopied(true);
  }, [link]);

  /** Killing the session returns to the scanner it was paired from. */
  const leave = useCallback(() => {
    if (router.canGoBack()) router.back();
    else router.replace("/system/desktop-handoff-scan" as never);
  }, [router]);

  const kill = useCallback(() => {
    if (disconnect.isPending) return;
    if (!session) {
      leave();
      return;
    }
    disconnect.mutate(session.id, { onSuccess: leave, onError: leave });
  }, [disconnect, session, leave]);

  return (
    <Screen height={946} background="#ffffff" safeTop={false} scroll>
      {/* bg 6503:22409 + mesh-gradient 6503:22414 — one gradient sheet. The
          blurred-ellipse mesh has no hard edges anywhere, so it is redrawn as
          radial washes over a vertical base ("Purple" 6503:22412 starts at
          y=1307 and never enters the 946pt frame). */}
      <Abs x={0} y={0} w={375} h={946}>
        <Svg width={375} height={946}>
          <Defs>
            <LinearGradient id="bgBase" gradientUnits="userSpaceOnUse" x1={0} y1={0} x2={0} y2={946}>
              <Stop offset={0} stopColor={BG_TOP} />
              <Stop offset={0.55} stopColor={BG_FLOOR} />
              <Stop offset={1} stopColor={BG_FLOOR_DEEP} />
            </LinearGradient>
            <RadialGradient id="bgBlue" gradientUnits="userSpaceOnUse" cx={0} cy={70} r={430}>
              <Stop offset={0} stopColor={BG_BLUE} stopOpacity={1} />
              <Stop offset={1} stopColor={BG_BLUE} stopOpacity={0} />
            </RadialGradient>
            <RadialGradient id="bgPeach" gradientUnits="userSpaceOnUse" cx={375} cy={110} r={470}>
              <Stop offset={0} stopColor={BG_PEACH} stopOpacity={1} />
              <Stop offset={1} stopColor={BG_PEACH} stopOpacity={0} />
            </RadialGradient>
            <RadialGradient id="bgMint" gradientUnits="userSpaceOnUse" cx={0} cy={470} r={300}>
              <Stop offset={0} stopColor={BG_MINT} stopOpacity={1} />
              <Stop offset={1} stopColor={BG_MINT} stopOpacity={0} />
            </RadialGradient>
            <RadialGradient id="bgCream" gradientUnits="userSpaceOnUse" cx={375} cy={430} r={300}>
              <Stop offset={0} stopColor={BG_CREAM} stopOpacity={1} />
              <Stop offset={1} stopColor={BG_CREAM} stopOpacity={0} />
            </RadialGradient>
          </Defs>
          <Rect x={0} y={0} width={375} height={946} fill="url(#bgBase)" />
          <Rect x={0} y={0} width={375} height={946} fill="url(#bgCream)" />
          <Rect x={0} y={0} width={375} height={946} fill="url(#bgMint)" />
          <Rect x={0} y={0} width={375} height={946} fill="url(#bgPeach)" />
          <Rect x={0} y={0} width={375} height={946} fill="url(#bgBlue)" />
        </Svg>
      </Abs>

      {/* ------------------------------ Header ------------------------------ */}
      {/* Container 6503:22415 — transparent fill, 1px bottom hairline */}
      <Abs
        x={0}
        y={44}
        w={375}
        h={54}
        style={{
          borderBottomWidth: 1,
          borderBottomColor: HAIRLINE,
          shadowColor: CARD_LINE,
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.05,
          shadowRadius: 2,
          elevation: 1,
        }}
      />
      {/* Group 1171275259 — 36pt white disc + back arrow */}
      <Pressable
        onPress={() => router.back()}
        style={({ pressed }) => ({
          position: "absolute",
          left: 16,
          top: 52,
          width: 36,
          height: 36,
          borderRadius: 18,
          backgroundColor: "#ffffff",
          alignItems: "center",
          justifyContent: "center",
          opacity: pressed ? 0.85 : 1,
        })}
      >
        <BackArrow />
      </Pressable>
      {/* 6503:22423 */}
      <Txt x={62} y={52} w={116} size={20} weight="semibold" color={TITLE_INK} lineHeight={37}>
        Web Planner
      </Txt>

      {/* -------------------------- Status Icon Section ---------------------- */}
      {/* Border 6503:22427 — 128x128 ring, 4pt #22c55e */}
      <Abs x={124} y={122} w={128} h={128} radius={64} border={GREEN} borderWidth={4} />
      {/* SVG 6503:22428 */}
      <Abs x={156} y={154} w={64} h={64}>
        <CheckMark />
      </Abs>

      {/* Heading 1 — 6503:22432 */}
      <Txt
        x={71.32}
        y={290}
        w={233.36}
        size={30}
        weight="bold"
        font="inter"
        color={HEADLINE}
        lineHeight={37.5}
        align="center"
      >
        {"Planner is live\non your desktop"}
      </Txt>

      {/* Container 6503:22434 — the device/browser it opened on are the
          session's, and collapse to the design's copy when there is none.
          Box is wider than the spec's 251.14 (same centre) because the app
          face runs wider than Liberation Sans and line 2 must not rewrap. */}
      <Txt
        x={24.5}
        y={380.25}
        w={327}
        size={18}
        font="inter"
        color={SUBTLE}
        lineHeight={29.25}
        align="center"
      >
        {`Your calendar is now open in\n${browser} on ${device}. Changes\nsync in real time.`}
      </Txt>

      {/* ----------------------- Connected device card ----------------------- */}
      {/* Frame 1171276927 — 6503:22435 */}
      <Abs
        x={24}
        y={555}
        w={324}
        h={90}
        radius={16}
        bg="#ffffff"
        border={CARD_LINE}
        borderWidth={1}
        style={CARD_LIFT}
      />
      {/* Device Icon Avatar 6503:22438 + letter 6503:22439 */}
      <Abs x={39.96} y={572} w={34.16} h={34} radius={16} bg={AVATAR_BG} />
      <Txt
        x={47.04}
        y={572.5}
        w={20}
        size={16}
        weight="light"
        color={AVATAR_INK}
        lineHeight={32}
        align="center"
      >
        {letter}
      </Txt>
      {/* Heading 2 — 6503:22442 */}
      <Txt
        x={90.12}
        y={568.5}
        w={163}
        size={18}
        color={DEVICE_INK}
        lineHeight={22.5}
        numberOfLines={1}
      >
        {`${device} · ${browser}`}
      </Txt>
      {/* Container 6503:22444 */}
      <Txt
        x={90.12}
        y={591.5}
        w={163}
        size={14}
        font="inter"
        color={SUBTLE}
        lineHeight={20}
        numberOfLines={2}
      >
        {`Connected · ${ip} · ${region}`}
      </Txt>
      {/* Live Indicator 6503:22445 */}
      <Abs
        x={260.96}
        y={587}
        w={71.08}
        h={26}
        radius={13}
        bg={PILL_FILL}
        border={PILL_LINE}
        borderWidth={1}
      />
      {/* Background 6503:22447 — the dot itself carries the heartbeat */}
      <Animated.View
        style={{
          position: "absolute",
          left: 273.96,
          top: 596,
          width: 8,
          height: 8,
          borderRadius: 4,
          backgroundColor: live ? GREEN : AVATAR_INK,
          opacity: live
            ? pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 0.35] })
            : 0.5,
          transform: [
            { scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.4] }) },
          ],
        }}
      />
      {/* Text 6503:22449 */}
      <Txt
        x={289.96}
        y={592}
        w={29.08}
        size={12}
        weight="bold"
        font="inter"
        color={live ? GREEN : AVATAR_INK}
        lineHeight={16}
        letterSpacing={0.6}
        style={{ textTransform: "uppercase" }}
      >
        Live
      </Txt>

      {/* -------------------------- Session link row ------------------------- */}
      {/* Frame 14537 — 6503:22450 */}
      <Abs
        x={24}
        y={669}
        w={324}
        h={64}
        radius={16}
        bg="#ffffff"
        border={CARD_LINE}
        borderWidth={1}
        style={CARD_LIFT}
      />
      {/* SVG 6503:22452 */}
      <Abs x={49} y={691} w={20} h={20}>
        <Padlock />
      </Abs>
      {/* Text 6503:22456 — the live session URL, truncated as the design shows */}
      <Txt
        x={81}
        y={691}
        w={151.23}
        size={14}
        color={SUBTLE}
        lineHeight={20}
        numberOfLines={1}
        style={{ fontFamily: MONO }}
      >
        {isLoading ? "…" : shortLink(link)}
      </Txt>
      {/* Button 6503:22457 — writes the full URL to the clipboard; the label
          doubles as the confirmation so no geometry moves. */}
      <Pressable
        onPress={copy}
        style={({ pressed }) => ({
          position: "absolute",
          left: 256,
          top: 685,
          width: 67,
          height: 32,
          borderRadius: 12,
          backgroundColor: COPY_FILL,
          opacity: pressed ? 0.7 : 1,
        })}
      >
        <Txt x={16} y={6} w={35} size={14} font="inter" color={COPY_INK} lineHeight={20} align="center">
          {copied ? "Copied" : "Copy"}
        </Txt>
      </Pressable>

      {/* ----------------------------- Action Footer ------------------------- */}
      {/* Button 6503:22462 — DELETE /web-sessions/:id, then back to the scanner */}
      <Pressable
        onPress={kill}
        disabled={disconnect.isPending}
        style={({ pressed }) => ({
          position: "absolute",
          left: 41,
          top: 812,
          width: 292,
          height: 70,
          borderRadius: 24,
          borderWidth: 1,
          borderColor: FOOTER_LINE,
          opacity: disconnect.isPending ? 0.5 : pressed ? 0.7 : 1,
        })}
      >
        <Txt
          x={42.97}
          y={21}
          w={206.06}
          size={16}
          weight="medium"
          color={DANGER}
          lineHeight={28}
          align="center"
        >
          Disconnect this session
        </Txt>
      </Pressable>
    </Screen>
  );
}
