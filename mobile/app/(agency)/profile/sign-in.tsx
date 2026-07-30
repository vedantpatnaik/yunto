import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Pressable, Text, TextInput } from "react-native";
import { useRouter } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Defs, Path, RadialGradient, Rect, Stop } from "react-native-svg";
import { Abs, Screen, Txt } from "../../../src/ui/Frame";
import { colors, fonts } from "../../../src/theme";
import { ApiError, api, login, setToken } from "../../../src/api/client";
import { useMe } from "../../../src/api/hooks";

/**
 * Agency sign in / create account — Figma frame 7904:12240 "onboarding" (375x876).
 *
 * Four stacked layers, all at raw frame coordinates:
 *
 *   1. Background   — #f8f5ef page fill plus a 375x256 rose wash at the top.
 *   2. Glass card    — 335x596.5 at (20,103), r32, translucent white with two
 *                      radial glows clipped inside it (violet top-right, blue
 *                      bottom-left).
 *   3. Form          — heading pair, three labelled inputs, the right-aligned
 *                      "Forgot password?" link, the gradient Continue CTA, the
 *                      OR rule and the Google button.
 *   4. Footer        — "Don't have an account? Sign up" and the legal line.
 *
 * One combined form serves both entry paths, which is why "Welcome back" sits
 * above a Full Name field: Continue signs in with the real /auth/login, and an
 * unrecognised email with a name filled in falls through to /auth/register.
 * The design's sign-up destination is this same screen, so the footer link
 * focuses Full Name rather than pushing a duplicate route.
 */

/* --------------------------- spec colour tokens --------------------------- */
const PAGE = "#f8f5ef";
const WASH = "249,228,232"; // #f9e4e8 — top gradient, 0.2 -> 0 alpha
const CARD_FILL = "rgba(255,255,255,0.58)";
const CARD_LINE = "rgba(255,255,255,0.9)";
const HEADING = "#111111";
const SUBDUED = "rgba(0,0,0,0.4)"; // subtitle + field labels
const PLACEHOLDER = "rgba(0,0,0,0.28)";
const FIELD_ICON = "#aaaaaa";
const EYE_ICON = "#cccccc";
const LINK = "rgba(85,96,204,0.75)"; // #5560cc @ 75%
const LINK_STRONG = "rgba(85,96,204,0.85)"; // #5560cc @ 85%
const RULE = "rgba(0,0,0,0.07)";
const OR_INK = "rgba(0,0,0,0.3)";
const GOOGLE_FILL = "rgba(255,255,255,0.7)";
const GOOGLE_LINE = "rgba(0,0,0,0.08)";
const GOOGLE_LABEL = "rgba(0,0,0,0.65)";
const FOOTER_INK = "rgba(0,0,0,0.38)";
const LEGAL_INK = "rgba(0,0,0,0.28)";

/** The three input wells each carry their own tint + hairline. */
const FIELDS = {
  name: { fill: "rgba(245,243,255,0.7)", line: "rgba(200,190,240,0.35)" },
  email: { fill: "rgba(243,248,255,0.7)", line: "rgba(180,200,240,0.35)" },
  password: { fill: "rgba(255,244,250,0.7)", line: "rgba(230,175,205,0.3)" },
} as const;

/* -------------------------------- geometry -------------------------------- */
const CARD = { x: 20, y: 103, w: 335, h: 596.5, r: 32 };
const FIELD_W = 285;
const FIELD_H = 51;

/* ------------------------------- sub-layers ------------------------------- */
/**
 * The two radial glows that live inside the card. Kept in their own clipped
 * layer so the card's drop shadow (which iOS will not render through
 * `overflow: hidden`) can stay on a separate, unclipped sibling.
 */
function CardGlow() {
  return (
    <Abs
      x={CARD.x}
      y={CARD.y}
      w={CARD.w}
      h={CARD.h}
      radius={CARD.r}
      style={{ overflow: "hidden" }}
    >
      <Svg width={CARD.w} height={CARD.h}>
        <Defs>
          {/* Rect (162,104) 192x192, centre pinned to its top-right corner. */}
          <RadialGradient id="glowViolet" cx="334" cy="1" rx="270.72" ry="270.72" gradientUnits="userSpaceOnUse">
            <Stop offset="0" stopColor="#d7cdff" stopOpacity="0.4" />
            <Stop offset="0.65" stopColor="#d7cdff" stopOpacity="0" />
          </RadialGradient>
          {/* Rect (21,538.5) 160x160, centre pinned to its bottom-left corner. */}
          <RadialGradient id="glowBlue" cx="1" cy="595.5" rx="225.6" ry="225.6" gradientUnits="userSpaceOnUse">
            <Stop offset="0" stopColor="#d2ebff" stopOpacity="0.35" />
            <Stop offset="0.65" stopColor="#d2ebff" stopOpacity="0" />
          </RadialGradient>
        </Defs>
        <Rect x={142} y={1} width={192} height={192} fill="url(#glowViolet)" />
        <Rect x={1} y={435.5} width={160} height={160} fill="url(#glowBlue)" />
      </Svg>
    </Abs>
  );
}

/** The four-colour Google mark, 12x12, drawn from the brand's 48pt geometry. */
function GoogleMark() {
  return (
    <Svg width={12} height={12} viewBox="0 0 48 48">
      <Path
        fill="#4285f4"
        d="M45.12 24.5c0-1.56-.14-3.06-.4-4.5H24v8.51h11.84c-.51 2.75-2.06 5.08-4.39 6.64v5.52h7.11c4.16-3.83 6.56-9.47 6.56-16.17z"
      />
      <Path
        fill="#34a853"
        d="M24 46c5.94 0 10.92-1.97 14.56-5.33l-7.11-5.52c-1.97 1.32-4.49 2.1-7.45 2.1-5.73 0-10.58-3.87-12.31-9.07H4.34v5.7C7.96 41.07 15.4 46 24 46z"
      />
      <Path
        fill="#fbbc05"
        d="M11.69 28.18C11.25 26.86 11 25.45 11 24s.25-2.86.69-4.18v-5.7H4.34C2.85 17.09 2 20.45 2 24s.85 6.91 2.34 9.88l7.35-5.7z"
      />
      <Path
        fill="#ea4335"
        d="M24 10.75c3.23 0 6.13 1.11 8.41 3.29l6.31-6.31C34.91 4.18 29.93 2 24 2 15.4 2 7.96 6.93 4.34 14.12l7.35 5.7c1.73-5.2 6.58-9.07 12.31-9.07z"
      />
    </Svg>
  );
}

/** Uppercase field caption — 11/16.5 Inter Bold, 1.1 tracking. */
const FieldLabel = ({ y, children }: { y: number; children: string }) => (
  <Txt
    x={45}
    y={y}
    w={FIELD_W}
    size={11}
    weight="bold"
    font="inter"
    color={SUBDUED}
    lineHeight={16.5}
    letterSpacing={1.1}
  >
    {children}
  </Txt>
);

/* --------------------------------- screen --------------------------------- */
export default function AgencySignInScreen() {
  const router = useRouter();
  const qc = useQueryClient();
  const me = useMe();

  const nameRef = useRef<TextInput | null>(null);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [reveal, setReveal] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  // A stored session still resolves /auth/me, so a returning operator gets
  // their own record back in the form rather than an empty one.
  useEffect(() => {
    const u = me.data;
    if (!u) return;
    setFullName((v) => v || u.name);
    setEmail((v) => v || u.email);
  }, [me.data]);

  const submit = async () => {
    const mail = email.trim();
    const name = fullName.trim();
    if (busy || !mail || !password) return;

    setBusy(true);
    setNotice(null);
    try {
      try {
        await login(mail, password);
      } catch (e) {
        // Combined form: an unknown credential plus a name is a create-account.
        const unknown = e instanceof ApiError && (e.status === 401 || e.status === 404);
        if (!unknown || !name) throw e;
        const r = await api<{ token: string }>("/auth/register", {
          method: "POST",
          body: JSON.stringify({ email: mail, password, name }),
        });
        await setToken(r.token);
      }
      qc.clear();
      router.replace("/");
    } catch (e) {
      setNotice(e instanceof Error ? e.message : "Could not sign in");
    } finally {
      setBusy(false);
    }
  };

  const canSubmit = email.trim().length > 0 && password.length > 0 && !busy;

  return (
    <Screen height={876} background={PAGE} scroll>
      {/* ------------------------------ Background --------------------------- */}
      {/* Gradient 375x256, #f9e4e8 20% -> 0%, top to bottom. */}
      <LinearGradient
        colors={[`rgba(${WASH},0.2)`, `rgba(${WASH},0)`]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={{ position: "absolute", left: 0, top: 0, width: 375, height: 256 }}
      />

      {/* ------------------------------ Glass card --------------------------- */}
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
          shadowOpacity: 0.11,
          shadowRadius: 60,
          shadowOffset: { width: 0, height: 20 },
          elevation: 2,
        }}
      />
      <CardGlow />

      {/* -------------------------------- Heading ---------------------------- */}
      <Txt
        x={45}
        y={131}
        w={285}
        size={26}
        weight="semibold"
        font="inter"
        color={HEADING}
        lineHeight={32.5}
        letterSpacing={-0.65}
      >
        Welcome back
      </Txt>
      <Txt
        x={45}
        y={167}
        w={285}
        size={13}
        weight="medium"
        font="inter"
        color={SUBDUED}
        lineHeight={19.5}
      >
        Sign in to your agency account
      </Txt>

      {/* ------------------------------- Full Name --------------------------- */}
      <FieldLabel y={211}>FULL NAME</FieldLabel>
      <Abs
        x={45}
        y={234}
        w={FIELD_W}
        h={FIELD_H}
        radius={18}
        bg={FIELDS.name.fill}
        border={FIELDS.name.line}
        borderWidth={1}
      >
        <Ionicons
          name="person-outline"
          size={16}
          color={FIELD_ICON}
          style={{ position: "absolute", left: 17, top: 17.5 }}
        />
        <TextInput
          ref={nameRef}
          value={fullName}
          onChangeText={setFullName}
          placeholder="Enter your full name"
          placeholderTextColor={PLACEHOLDER}
          autoCapitalize="words"
          autoComplete="name"
          style={{
            position: "absolute", left: 45, top: 15, width: 223, height: 21,
            padding: 0, fontFamily: fonts.interMedium, fontSize: 14, color: "#111111",
          }}
        />
      </Abs>

      {/* ------------------------------ Work Email --------------------------- */}
      <FieldLabel y={297}>WORK EMAIL</FieldLabel>
      <Abs
        x={45}
        y={320}
        w={FIELD_W}
        h={FIELD_H}
        radius={18}
        bg={FIELDS.email.fill}
        border={FIELDS.email.line}
        borderWidth={1}
      >
        <Ionicons
          name="mail-outline"
          size={16}
          color={FIELD_ICON}
          style={{ position: "absolute", left: 17, top: 17.5 }}
        />
        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="you@agency.com"
          placeholderTextColor={PLACEHOLDER}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          autoComplete="email"
          style={{
            position: "absolute", left: 45, top: 15, width: 223, height: 21,
            padding: 0, fontFamily: fonts.interMedium, fontSize: 14, color: "#111111",
          }}
        />
      </Abs>

      {/* ------------------------------- Password ---------------------------- */}
      <FieldLabel y={383}>PASSWORD</FieldLabel>
      <Abs
        x={45}
        y={406}
        w={FIELD_W}
        h={FIELD_H}
        radius={18}
        bg={FIELDS.password.fill}
        border={FIELDS.password.line}
        borderWidth={1}
      >
        <Ionicons
          name="lock-closed-outline"
          size={16}
          color={FIELD_ICON}
          style={{ position: "absolute", left: 17, top: 17.5 }}
        />
        <TextInput
          value={password}
          onChangeText={setPassword}
          onSubmitEditing={submit}
          placeholder="Enter your password"
          placeholderTextColor={PLACEHOLDER}
          secureTextEntry={!reveal}
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="password"
          style={{
            position: "absolute", left: 45, top: 15, width: 196, height: 21,
            padding: 0, fontFamily: fonts.interMedium, fontSize: 14, color: "#111111",
          }}
        />
        <Pressable
          onPress={() => setReveal((v) => !v)}
          hitSlop={10}
          style={{ position: "absolute", left: 253, top: 18, width: 15, height: 15 }}
        >
          <Ionicons name={reveal ? "eye-off-outline" : "eye-outline"} size={15} color={EYE_ICON} />
        </Pressable>
      </Abs>

      {/* --------------------- Status + Forgot password row ------------------ */}
      {/*
        The 285x18 row at y=469 holds only the right-aligned link in the design;
        its empty left half is where API failures and the two unbuilt-flow
        notices surface, so nothing below has to move.
      */}
      {notice ? (
        <Txt
          x={45}
          y={469}
          w={175}
          size={12}
          weight="medium"
          font="inter"
          color={colors.danger}
          lineHeight={18}
          numberOfLines={1}
        >
          {notice}
        </Txt>
      ) : null}
      <Pressable
        // No forgot-password frame exists in the design and the API has no
        // reset endpoint, so this is a stub that says so rather than a dead tap.
        onPress={() => setNotice("Password reset is not available yet")}
        hitSlop={8}
        style={{ position: "absolute", left: 226, top: 469, width: 104, height: 18 }}
      >
        <Txt size={12} weight="semibold" font="inter" color={LINK} lineHeight={18}>
          Forgot password?
        </Txt>
      </Pressable>

      {/* ------------------------------ Continue CTA ------------------------- */}
      <Pressable
        onPress={submit}
        disabled={!canSubmit}
        style={({ pressed }) => ({
          position: "absolute", left: 45, top: 507, width: FIELD_W, height: 54.5,
          borderRadius: 27.25,
          opacity: canSubmit ? (pressed ? 0.9 : 1) : 0.55,
          shadowColor: "#6558cc",
          shadowOpacity: 0.28,
          shadowRadius: 24,
          shadowOffset: { width: 0, height: 8 },
          elevation: 6,
        })}
      >
        <LinearGradient
          colors={["#9b8fff", "#7b6ee8", "#6558cc"]}
          locations={[0, 0.5, 1]}
          start={{ x: 0.2, y: 0 }}
          end={{ x: 0.8, y: 1 }}
          style={{
            position: "absolute", left: 0, top: 0, right: 0, bottom: 0,
            borderRadius: 27.25,
          }}
        />
        {busy ? (
          <ActivityIndicator color="#ffffff" style={{ position: "absolute", left: 133, top: 19 }} />
        ) : (
          <>
            <Txt
              x={97.08}
              y={15}
              w={67.19}
              size={15}
              weight="semibold"
              font="inter"
              color="#ffffff"
              lineHeight={22.5}
              align="center"
            >
              Continue
            </Txt>
            <Ionicons
              name="arrow-forward"
              size={17}
              color="#ffffff"
              style={{ position: "absolute", left: 170.92, top: 18.75 }}
            />
          </>
        )}
      </Pressable>

      {/* -------------------------------- OR rule ---------------------------- */}
      <Abs x={45} y={590} w={120.77} h={1} bg={RULE} />
      <Txt
        x={177.77}
        y={581.5}
        w={19}
        size={12}
        weight="semibold"
        font="inter"
        color={OR_INK}
        lineHeight={18}
        letterSpacing={1.2}
      >
        OR
      </Txt>
      <Abs x={208.77} y={590} w={120.78} h={1} bg={RULE} />

      {/* --------------------------- Continue with Google -------------------- */}
      <Pressable
        // No OAuth provider is wired on the backend yet — stubbed, not linked.
        onPress={() => setNotice("Google sign-in is not available yet")}
        style={({ pressed }) => ({
          position: "absolute", left: 45, top: 619.5, width: FIELD_W, height: 51,
          borderRadius: 25.5, backgroundColor: GOOGLE_FILL,
          borderWidth: 1, borderColor: GOOGLE_LINE,
          opacity: pressed ? 0.9 : 1,
          shadowColor: "#000000",
          shadowOpacity: 0.04,
          shadowRadius: 16,
          shadowOffset: { width: 0, height: 4 },
          elevation: 1,
        })}
      >
        <Abs
          x={53}
          y={15.5}
          w={20}
          h={20}
          radius={10}
          bg="#ffffff"
          center
          style={{
            shadowColor: "#000000",
            shadowOpacity: 0.1,
            shadowRadius: 4,
            shadowOffset: { width: 0, height: 1 },
            elevation: 2,
          }}
        >
          <GoogleMark />
        </Abs>
        <Txt
          x={85}
          y={15}
          w={147}
          size={14}
          weight="semibold"
          font="inter"
          color={GOOGLE_LABEL}
          lineHeight={21}
          align="center"
        >
          Continue with Google
        </Txt>
      </Pressable>

      {/* --------------------------------- Footer ---------------------------- */}
      <Txt
        x={87.6}
        y={722.5}
        w={146.11}
        size={13}
        weight="medium"
        font="inter"
        color={FOOTER_INK}
        lineHeight={19.5}
        align="center"
      >
        {"Don't have an account?"}
      </Txt>
      <Pressable
        // Sign-up resolves to this same combined form, so the link jumps to the
        // one field that only account creation needs.
        onPress={() => nameRef.current?.focus()}
        hitSlop={8}
        style={{ position: "absolute", left: 239.68, top: 722.5, width: 48.14, height: 20 }}
      >
        <Txt
          w={48.14}
          size={13}
          weight="bold"
          font="inter"
          color={LINK_STRONG}
          lineHeight={19.5}
          align="center"
        >
          Sign up
        </Txt>
      </Pressable>

      {/* --------------------------------- Legal ----------------------------- */}
      <Txt
        x={40}
        y={754}
        w={295}
        size={11}
        weight="medium"
        font="inter"
        color={LEGAL_INK}
        lineHeight={17.88}
        align="center"
      >
        By continuing you agree to our <Text style={{ color: "#000000" }}>Terms</Text> and{" "}
        <Text style={{ color: "#000000" }}>Privacy Policy</Text>
      </Txt>
    </Screen>
  );
}
