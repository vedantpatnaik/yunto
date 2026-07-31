import { useState } from "react";
import { Image, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Constants from "expo-constants";
import Svg, { Defs, Ellipse, Polygon, RadialGradient, Rect, Stop } from "react-native-svg";
import { Abs, Ring, Screen, Txt } from "../../../src/ui/Frame";
import { logout } from "../../../src/api/client";
import { useMe } from "../../../src/api/hooks";
import type { User } from "../../../src/api/hooks";

/**
 * Log out confirmation — Figma frame 7810:26051 "logout" (375x876), traced 1:1.
 *
 * A full-screen confirmation rather than a sheet: the #f8f5ef page carries the
 * 876-gen decorative layer (full-frame wash + two blobs) and one 335x651.5
 * frosted card at (20,76) holds the whole dialog — door medallion, "Log Out?",
 * the body copy, the signed-in identity row, the reassurance strip and the two
 * actions. The build stamp sits outside the card at y=751.5.
 *
 * Data: the identity row is the live session — /auth/me supplies name, role and
 * avatar, and the code chip shows that row's agencyCode. There is no server
 * session to revoke (the API is stateless JWT and /auth exposes no sign-out),
 * so "Log Out" drops the stored token, clears every cached record and resets to
 * /login — which is exactly what the suggested POST would have had to do.
 */

/* --------------------------- spec colour tokens --------------------------- */
const PAGE = "#f8f5ef";
const CARD_FILL = "rgba(255,255,255,0.58)";
const CARD_LINE = "rgba(0,0,0,0.07)";
const HEADING = "#111111";
const BODY_INK = "rgba(0,0,0,0.45)";
const ROLE_INK = "rgba(0,0,0,0.4)";
const IDENTITY_FILL = "rgba(255,255,255,0.6)";
const IDENTITY_LINE = "rgba(255,255,255,0.9)";
const CHIP_FILL = "rgba(200,210,255,0.3)";
const CHIP_LINE = "rgba(160,170,255,0.35)";
const CHIP_DOT = "#7a8ae8";
const CHIP_INK = "#5560cc";
const SAFE_FILL = "rgba(210,240,220,0.45)";
const SAFE_LINE = "rgba(140,190,155,0.35)";
const SAFE_ICON = "#3e7d52";
const SAFE_INK = "#3e5c45";
const GHOST_FILL = "rgba(255,255,255,0.65)";
const GHOST_LINE = "rgba(0,0,0,0.08)";
const GHOST_INK = "rgba(0,0,0,0.65)";
const STAMP_INK = "rgba(0,0,0,0.3)";

/** Door medallion palette — #c8bef0 / #a096dc / #f0ecff / #8c78c8 / #a08cdc. */
const DOOR_FILL = "rgba(200,190,240,0.5)";
const DOOR_LINE = "rgba(160,150,220,0.5)";
const DOOR_INNER = "rgba(240,236,255,0.8)";
const ARROW = "rgba(140,120,200,0.7)";
const FIGURE_HEAD = "rgba(160,140,220,0.6)";
const FIGURE_BODY = "rgba(160,140,220,0.45)";

/* -------------------------------- geometry -------------------------------- */
const CARD = { x: 20, y: 76, w: 335, h: 651.5, r: 36 };

/** The four hard-wrapped lines the TEXT node carries, kept verbatim. */
const BODY_COPY =
  "You're about to sign out of your agency\naccount. You can sign back in anytime to\ncontinue managing campaigns, creators,\nleads, and team activities.";
const SAFE_COPY =
  "Your data, campaigns, and creator\nrecords will remain securely saved.";

/** SUPER_ADMIN -> "Super Admin", the label the frame shows for this row. */
const prettyRole = (role: string) =>
  role
    .split("_")
    .map((w) => w.charAt(0) + w.slice(1).toLowerCase())
    .join(" ");

/* ------------------------------- sub-layers ------------------------------- */
/**
 * Page decoration — 7810:26052 (375x876), 7810:26053 (262.5x350.4 at 112.5,525.6)
 * and 7810:26054, the -37.5,481.79 blurred capsule. The export carries their
 * geometry but not their paints: they are the shared 876-gen background layer,
 * identical across every agency frame. Each is therefore drawn with the two
 * decorative stops this frame does declare for the card's own glows — violet
 * #d7cdff and rose #ffd2e1 — so the page reads as one palette. The capsule's
 * blur becomes a radial falloff, and the Svg's own bounds do the frame's clip.
 */
function PageDecor() {
  return (
    <>
      <LinearGradient
        colors={["rgba(215,205,255,0.18)", "rgba(215,205,255,0)", "rgba(255,210,225,0.16)"]}
        locations={[0, 0.5, 1]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={{ position: "absolute", left: 0, top: 0, width: 375, height: 876 }}
      />
      <Svg width={375} height={876} style={{ position: "absolute", left: 0, top: 0 }}>
        <Defs>
          {/* Inscribed in 7810:26053's own bounds so the wash reaches zero on
              every edge of the rect — a larger radius leaves the fill still
              opaque where the rectangle stops and draws a hard vertical seam
              down the page at x=112.5, which the frame does not have. */}
          <RadialGradient
            id="pageViolet"
            cx="243.75"
            cy="700.8"
            rx="131.25"
            ry="175.2"
            gradientUnits="userSpaceOnUse"
          >
            <Stop offset="0" stopColor="#d7cdff" stopOpacity="0.4" />
            <Stop offset="1" stopColor="#d7cdff" stopOpacity="0" />
          </RadialGradient>
          <RadialGradient
            id="pageRose"
            cx="46.88"
            cy="604.43"
            rx="84.38"
            ry="122.64"
            gradientUnits="userSpaceOnUse"
          >
            <Stop offset="0" stopColor="#ffd2e1" stopOpacity="0.45" />
            <Stop offset="1" stopColor="#ffd2e1" stopOpacity="0" />
          </RadialGradient>
        </Defs>
        <Rect x={112.5} y={525.6} width={262.5} height={350.4} fill="url(#pageViolet)" />
        <Ellipse cx={46.88} cy={604.43} rx={84.38} ry={122.64} fill="url(#pageRose)" />
      </Svg>
    </>
  );
}

/**
 * The card's two clipped radial glows — 7810:26121 (violet, centre pinned to its
 * top-right corner) and 7810:26122 (rose, centre on its bottom-left corner).
 * Kept on their own clipped layer so the card's drop shadows, which iOS will not
 * render through `overflow: hidden`, can stay on an unclipped sibling.
 */
function CardGlow() {
  return (
    <Abs x={CARD.x} y={CARD.y} w={CARD.w} h={CARD.h} radius={CARD.r} style={{ overflow: "hidden" }}>
      <Svg width={CARD.w} height={CARD.h}>
        <Defs>
          <RadialGradient
            id="cardViolet"
            cx="334"
            cy="1"
            rx="293.28"
            ry="293.28"
            gradientUnits="userSpaceOnUse"
          >
            <Stop offset="0" stopColor="#d7cdff" stopOpacity="0.45" />
            <Stop offset="0.65" stopColor="#d7cdff" stopOpacity="0" />
          </RadialGradient>
          <RadialGradient
            id="cardRose"
            cx="1"
            cy="650.5"
            rx="270.72"
            ry="270.72"
            gradientUnits="userSpaceOnUse"
          >
            <Stop offset="0" stopColor="#ffd2e1" stopOpacity="0.3" />
            <Stop offset="0.65" stopColor="#ffd2e1" stopOpacity="0" />
          </RadialGradient>
        </Defs>
        <Rect x={126} y={1} width={208} height={208} fill="url(#cardViolet)" />
        <Rect x={1} y={458.5} width={192} height={192} fill="url(#cardRose)" />
      </Svg>
    </Abs>
  );
}

/**
 * Door medallion — 7810:26124 and the five shapes inside it: the door panel and
 * its inner face, the arrow leaving through it (shaft 7810:26129 + the diamond-
 * stroked head 7810:26130, drawn as the triangle it renders as) and the figure
 * stepping out (head 7810:26132, body 7810:26133). All at raw frame coordinates.
 */
function DoorMark() {
  return (
    <>
      <Abs
        x={132.5}
        y={109}
        w={110}
        h={110}
        radius={30}
        border="rgba(200,190,240,0.4)"
        borderWidth={1}
        style={{
          overflow: "hidden",
          shadowColor: "#8c78c8",
          shadowOpacity: 0.12,
          shadowRadius: 24,
          shadowOffset: { width: 0, height: 8 },
          elevation: 3,
        }}
      >
        <LinearGradient
          colors={["rgba(235,230,255,0.8)", "rgba(255,220,235,0.6)"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ position: "absolute", left: 0, top: 0, right: 0, bottom: 0 }}
        />
      </Abs>

      {/* Door panel — 46x58, 8/8/4/4 corners */}
      <Abs
        x={164.5}
        y={135}
        w={46}
        h={58}
        bg={DOOR_FILL}
        border={DOOR_LINE}
        borderWidth={1}
        style={{
          borderTopLeftRadius: 8,
          borderTopRightRadius: 8,
          borderBottomLeftRadius: 4,
          borderBottomRightRadius: 4,
        }}
      />
      {/* Inner face — 36.68x50, 6/6/3/3 corners */}
      <Abs
        x={171.5}
        y={140}
        w={36.68}
        h={50}
        bg={DOOR_INNER}
        border={DOOR_LINE}
        borderWidth={1}
        style={{
          borderTopLeftRadius: 6,
          borderTopRightRadius: 6,
          borderBottomLeftRadius: 3,
          borderBottomRightRadius: 3,
        }}
      />
      {/* Arrow shaft + head */}
      <Abs x={182.5} y={158} w={32} h={2} radius={1} bg={ARROW} />
      <Abs x={216.5} y={154} w={7} h={10}>
        <Svg width={7} height={10}>
          <Polygon points="0,0 7,5 0,10" fill={ARROW} />
        </Svg>
      </Abs>
      {/* Figure stepping out */}
      <Abs x={207.5} y={132} w={20} h={20} radius={10} bg={FIGURE_HEAD} />
      <Abs x={211.5} y={154} w={12} h={20} radius={6} bg={FIGURE_BODY} />
    </>
  );
}

/* --------------------------------- screen --------------------------------- */
/** /auth/me returns the whole sanitized User row; agencyCode rides along on it. */
type Identity = User & { agencyCode?: string | null };

export default function LogoutConfirmScreen() {
  const router = useRouter();
  const qc = useQueryClient();
  const me = useMe().data as Identity | undefined;
  const [busy, setBusy] = useState(false);

  // Until /auth/me resolves the identity row renders empty rather than showing
  // a placeholder name — nothing moves, the fields simply fill in.
  const name = me?.name ?? "";
  const role = me ? prettyRole(me.role) : "";
  const agencyCode = me?.agencyCode ?? null;
  const avatarUrl = me?.avatarUrl;

  // The frame stamps v2.4.1; the real number comes from the build config.
  const version = Constants.expoConfig?.version ?? "2.4.1";

  const signOut = async () => {
    if (busy) return;
    setBusy(true);
    await logout(); // drops the stored token — the JWT is the whole session
    qc.clear(); // no cached record survives into the next sign-in
    router.replace("/login");
  };

  const stay = () => {
    if (router.canGoBack()) router.back();
    else router.replace("/");
  };

  return (
    <Screen height={876} background={PAGE} scroll>
      <PageDecor />

      {/* ---------------------------- Frosted card --------------------------- */}
      <Abs
        x={CARD.x}
        y={CARD.y}
        w={CARD.w}
        h={CARD.h}
        radius={CARD.r}
        bg={CARD_FILL}
        border={CARD_LINE}
        borderWidth={1}
        style={{
          shadowColor: "#826ec8",
          shadowOpacity: 0.12,
          shadowRadius: 64,
          shadowOffset: { width: 0, height: 24 },
          elevation: 3,
        }}
      />
      <CardGlow />

      {/* ---------------------------- Door medallion ------------------------- */}
      <DoorMark />

      {/* -------------------------------- Heading ---------------------------- */}
      <Txt
        x={129.69}
        y={239}
        w={118}
        size={28}
        weight="semibold"
        font="inter"
        color={HEADING}
        lineHeight={35}
        letterSpacing={-0.7}
        align="center"
      >
        Log Out?
      </Txt>

      {/* --------------------------------- Body ------------------------------
          Laid out on the copy's parent container (7810:26137, 45 -> 284.92)
          rather than the TEXT node's own 254, which is the exact ink width of
          the longest line in Figma: RN measures that line a hair wider and
          soft-wraps "to" onto a fifth line, pushing the block into the identity
          row. Same centre (187.5), same four hard-wrapped lines. */}
      <Txt
        x={45}
        y={293.19}
        w={284.92}
        size={13}
        weight="medium"
        font="inter"
        color={BODY_INK}
        lineHeight={21.13}
        align="center"
      >
        {BODY_COPY}
      </Txt>

      {/* ----------------------------- Identity row -------------------------- */}
      <Abs
        x={45}
        y={398.5}
        w={285}
        h={80}
        radius={22}
        bg={IDENTITY_FILL}
        border={IDENTITY_LINE}
        borderWidth={1}
        style={{
          shadowColor: "#000000",
          shadowOpacity: 0.04,
          shadowRadius: 16,
          shadowOffset: { width: 0, height: 4 },
          elevation: 1,
        }}
      />
      {avatarUrl ? (
        <Abs
          x={63}
          y={414.5}
          w={48}
          h={48}
          radius={24}
          border="#eeeeee"
          borderWidth={1}
          style={{ overflow: "hidden" }}
        >
          <Image
            source={{ uri: avatarUrl }}
            style={{ position: "absolute", left: 0, top: 0, width: "100%", height: "100%" }}
          />
        </Abs>
      ) : (
        // No photo on the record — the app's gradient placeholder fills the same
        // 48pt circle rather than a stand-in face.
        <Ring x={63} y={414.5} size={48} />
      )}
      {/* Name and role take the 106.88 container width rather than the design's
          text widths (85 / 74), which are just where "Rohit Kumar" and "Super
          Admin" happen to end — a longer real name gets the full column. */}
      <Txt
        x={124}
        y={417.25}
        w={107}
        size={15}
        weight="semibold"
        font="inter"
        color={HEADING}
        lineHeight={22.5}
        letterSpacing={-0.38}
        numberOfLines={1}
      >
        {name}
      </Txt>
      <Txt
        x={124}
        y={440.75}
        w={107}
        size={12}
        weight="medium"
        font="inter"
        color={ROLE_INK}
        lineHeight={18}
        numberOfLines={1}
      >
        {role}
      </Txt>
      {/* Agency code chip — omitted entirely when the row carries no code, so
          nothing invented ever appears where a real code would. */}
      {agencyCode ? (
        <Abs
          x={243}
          y={424}
          w={70}
          h={29}
          radius={14.5}
          bg={CHIP_FILL}
          border={CHIP_LINE}
          borderWidth={1}
        >
          <Abs x={13} y={11.5} w={6} h={6} radius={3} bg={CHIP_DOT} />
          <Txt
            x={25}
            y={7}
            w={32}
            size={10}
            weight="bold"
            font="inter"
            color={CHIP_INK}
            lineHeight={15}
            numberOfLines={1}
          >
            {agencyCode}
          </Txt>
        </Abs>
      ) : null}

      {/* --------------------------- Reassurance strip ----------------------- */}
      <Abs
        x={45}
        y={492.5}
        w={285}
        h={59}
        radius={18}
        bg={SAFE_FILL}
        border={SAFE_LINE}
        borderWidth={1}
      />
      <Abs x={62} y={510} w={24} h={24} radius={12} bg="rgba(62,125,82,0.12)" center>
        <Feather name="lock" size={12} color={SAFE_ICON} />
      </Abs>
      <Txt
        x={96}
        y={504.75}
        w={204}
        size={12}
        weight="semibold"
        font="inter"
        color={SAFE_INK}
        lineHeight={16.5}
      >
        {SAFE_COPY}
      </Txt>

      {/* ------------------------------ Log Out CTA -------------------------- */}
      <Pressable
        onPress={signOut}
        disabled={busy}
        style={({ pressed }) => ({
          position: "absolute",
          left: 45,
          top: 575.5,
          width: 285,
          height: 54.5,
          borderRadius: 27.25,
          opacity: busy ? 0.6 : pressed ? 0.9 : 1,
          shadowColor: "#d85070",
          shadowOpacity: 0.22,
          shadowRadius: 24,
          shadowOffset: { width: 0, height: 8 },
          elevation: 6,
        })}
      >
        <LinearGradient
          colors={["#f4a0b0", "#e87090", "#d85070"]}
          locations={[0, 0.5, 1]}
          start={{ x: 0.2, y: 0 }}
          end={{ x: 0.8, y: 1 }}
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            right: 0,
            bottom: 0,
            borderRadius: 27.25,
          }}
        />
        {/* 7810:26158 is the door-and-arrow mark, not a power symbol — its lone
            13.5x13.5 vector inside an 18x18 box is Feather's "log-out". */}
        <Feather
          name="log-out"
          size={18}
          color="#ffffff"
          style={{ position: "absolute", left: 100.1, top: 18.25 }}
        />
        <Txt
          x={128.1}
          y={15}
          w={58.16}
          size={15}
          weight="semibold"
          font="inter"
          color="#ffffff"
          lineHeight={22.5}
          align="center"
        >
          Log Out
        </Txt>
      </Pressable>

      {/* --------------------------- Stay Logged In -------------------------- */}
      <Pressable
        onPress={stay}
        style={({ pressed }) => ({
          position: "absolute",
          left: 45,
          top: 642,
          width: 285,
          height: 56.5,
          borderRadius: 28.25,
          backgroundColor: GHOST_FILL,
          borderWidth: 1,
          borderColor: GHOST_LINE,
          opacity: pressed ? 0.9 : 1,
          shadowColor: "#000000",
          shadowOpacity: 0.04,
          shadowRadius: 16,
          shadowOffset: { width: 0, height: 4 },
          elevation: 1,
        })}
      >
        {/* 7810:26162 — a 10.5x10.5 vector in an 18x18 box: Feather "arrow-left",
            the "go back" mark the frame shows, not a dismiss cross. */}
        <Feather
          name="arrow-left"
          size={18}
          color={GHOST_INK}
          style={{ position: "absolute", left: 74.58, top: 19.25 }}
        />
        <Txt
          x={102.58}
          y={16}
          w={108.17}
          size={15}
          weight="semibold"
          font="inter"
          color={GHOST_INK}
          lineHeight={22.5}
          align="center"
        >
          Stay Logged In
        </Txt>
      </Pressable>

      {/* ------------------------------ Build stamp --------------------------
          Sized to the stamp's container (7810:26165, 20 -> 335) rather than the
          TEXT node's 119, which only fits the frame's own "v2.4.1"; a real
          version string is longer and was being ellipsised. Centre is 187.5
          either way. */}
      <Txt
        x={20}
        y={751.5}
        w={335}
        size={11}
        weight="medium"
        font="inter"
        color={STAMP_INK}
        lineHeight={16.5}
        align="center"
        numberOfLines={1}
      >
        {`Stelllar Agency · v${version}`}
      </Txt>
    </Screen>
  );
}
