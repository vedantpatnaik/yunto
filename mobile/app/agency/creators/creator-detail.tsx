import type { ComponentProps } from "react";
import { useMemo, useState } from "react";
import {
  Alert,
  Clipboard,
  Image,
  Linking,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Feather, Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Defs, RadialGradient, Rect, Stop } from "react-native-svg";
import { Abs, Screen, Txt, getScale } from "../../../src/ui/Frame";
import { fonts, gradients } from "../../../src/theme";
import {
  compact,
  inr,
  useAgencies,
  useContacts,
  useCreators,
  useRemove,
  useUpdate,
  type Creator,
} from "../../../src/api/hooks";

/**
 * Creator Detail — Figma 7786:21624 "creators" (375x876), traced 1:1.
 *
 * One creator seen from the agency side. The 335x415 hero card at y=106 carries
 * the avatar, name, handle, the WhatsApp | Call pair, the niche chip, the two
 * insight chips, the shareable-link row and the Followers / Views / Leads
 * triple; below it two 335x142.5 platform cards (Instagram at 537, YouTube at
 * 695.5 — the same layout on a 158.5 step) and the 335x314 Commercials card at
 * 854.
 *
 * Two frame quirks drive the layout:
 *   - the Commercials card runs to y=1168, past the 876pt frame (Figma clips
 *     it), so the canvas is sized to the real content and scrolls.
 *   - the Save Changes / Remove profile pair is authored at y=718 *underneath*
 *     the card stack — it is an overlay, so it lives outside the scroller in a
 *     dock that re-applies the canvas scale and sits on the device bottom inset.
 * Every other coordinate below is the raw frame coordinate from the spec.
 *
 * Geist is not one of the two faces registered in app/_layout.tsx, so the
 * heading renders in Inter — the frame's own body face; every other node is
 * already authored in Inter.
 *
 * What the schema cannot back, and how it is handled:
 *   - Creator holds ONE `platform` enum, so only the card matching it carries
 *     real counts; the other platform prints "—" rather than a borrowed number.
 *   - there are no per-post like/comment columns at all, so those two cells of
 *     each triple print "—" in every case.
 *   - there is no rate-card table either. The prices are the record's own
 *     economics — cpv x avgViews weighted per format, the same derivation
 *     app/(app)/profile/personal-information/commercials.tsx uses — which makes
 *     them invertible: an edited price maps back to `cpv`, the one column that
 *     really stores this creator's price. That is what Save Changes writes.
 *   - Creator has no phone column, so the two contact buttons dial the Contact
 *     record of the same name and are disabled when there is none.
 */

/* ------------------------------- geometry -------------------------------- */
const FRAME_W = 375;
const CONTENT_BOTTOM = 1168; // Commercials card — 854 + 314
const DOCK_H = 158; // action pair (123) + the 35pt the frame leaves under it
const CANVAS_H = CONTENT_BOTTOM + DOCK_H;

const CARD_X = 20;
const CARD_W = 335;

const PLATFORM_H = 142.5;
const INSTAGRAM_Y = 537;
const YOUTUBE_Y = 695.5;

/** Commercials rows: plate +14, glyph +22, label +17.25, price +17.5 from the row top. */
const RATE_ROW_H = 57;

/* --------------------------- spec colour tokens --------------------------- */
const PAGE = "#f8f5ef";
const HEAD_INK = "#141311";
const BACK_FILL = "#1f1a17";
const BACK_ICON = "#faf7f2";

const NAME_INK = "#111111";
const HANDLE_INK = "rgba(0,0,0,0.4)";
const LABEL_INK = "#aaaaaa";
const LINK_INK = "#555555";
const RATE_INK = "#333333";
const CHEV_INK = "#bbbbbb";

const GLASS_52 = "rgba(255,255,255,0.52)";
const GLASS_55 = "rgba(255,255,255,0.55)";
const GLASS_70 = "rgba(255,255,255,0.7)";
const CARD_LINE = "rgba(0,0,0,0.07)";
const LINE_05 = "rgba(0,0,0,0.05)";
const LINE_04 = "rgba(0,0,0,0.04)";
const LINK_LINE = "rgba(255,255,255,0.9)";

const WHATSAPP = { fill: "rgba(62,125,82,0.09)", line: "rgba(62,125,82,0.22)", ink: "#3e7d52" };
const CALL = { fill: "rgba(58,92,126,0.08)", line: "rgba(58,92,126,0.22)", ink: "#3a5c7e" };
const COPY = { fill: "rgba(58,92,126,0.08)", line: "rgba(58,92,126,0.2)", ink: "#3a5c7e" };

const NICHE_CHIP = { fill: "rgba(230,225,249,0.7)", line: "rgba(160,150,230,0.25)", ink: "#5560cc" };
const ENGAGE_CHIP = { fill: "rgba(255,240,235,0.8)", line: "rgba(230,140,100,0.25)", ink: "#e05c28" };
const ADVICE_CHIP = { fill: "rgba(240,235,255,0.8)", line: "rgba(140,130,220,0.25)", ink: "#5560cc" };

const STRIP_FILL = "rgba(240,245,250,0.7)";
const STATUS_DOT = "#3e7d52";

/** The two platform plates and their glyph inks. */
const IG_PLATE = { fill: "rgba(230,215,245,0.7)", line: "rgba(200,170,220,0.3)", ink: "#6a3a7e" };
const YT_PLATE = { fill: "rgba(255,225,220,0.7)", line: "rgba(220,160,150,0.3)", ink: "#cc3a3a" };

const SAVE_FILL = "#312b28";
const REMOVE_INK = "#222222";

/* --------------------------------- glow ----------------------------------- */
/**
 * The 160x160 "Gradient" rectangle each glass card carries in its top-right
 * corner — a radial fading to nothing at 65%, centred on the corner itself.
 */
function Glow({ id, y, color, alpha }: { id: string; y: number; color: string; alpha: number }) {
  return (
    <Abs x={194} y={y} w={160} h={160} radius={28} style={styles.clip}>
      <Svg width={160} height={160}>
        <Defs>
          <RadialGradient id={id} cx="160" cy="0" r="225.6" gradientUnits="userSpaceOnUse">
            <Stop offset="0" stopColor={color} stopOpacity={alpha} />
            <Stop offset="0.65" stopColor={color} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Rect width={160} height={160} fill={`url(#${id})`} />
      </Svg>
    </Abs>
  );
}

/* ------------------------------ hero pieces ------------------------------- */
/** A pill whose width hugs its label, exactly as the auto-layout chips do. */
function Chip({
  x, y, h, paint, icon, label,
}: {
  x: number; y: number; h: number;
  paint: { fill: string; line: string; ink: string };
  icon?: ComponentProps<typeof Feather>["name"];
  label: string;
}) {
  return (
    <Abs
      x={x} y={y} h={h} radius={9999}
      bg={paint.fill} border={paint.line} borderWidth={1}
      row gap={6} style={styles.chipPad}
    >
      {icon ? <Feather name={icon} size={11} color={paint.ink} /> : null}
      <Txt size={11} weight="bold" font="inter" color={paint.ink} lineHeight={16.5}>
        {label}
      </Txt>
    </Abs>
  );
}

/** One cell of a labelled counter strip — caption over value, centred. */
function Stat({
  x, y, w, label, value, valueSize, valueInk, valueSpacing,
}: {
  x: number; y: number; w: number; label: string; value: string;
  valueSize: number; valueInk: string; valueSpacing: number;
}) {
  const small = valueSize < 18;
  return (
    <>
      <Txt
        x={x} y={y} w={w} align="center"
        size={small ? 10 : 11} weight="bold" font="inter"
        color={LABEL_INK} lineHeight={small ? 15 : 16.5} letterSpacing={small ? 1 : 1.1}
      >
        {label.toUpperCase()}
      </Txt>
      <Txt
        x={x} y={y + (small ? 19 : 21)} w={w} align="center" numberOfLines={1}
        size={valueSize} weight="semibold" font="inter"
        color={valueInk} lineHeight={small ? 24 : 27} letterSpacing={valueSpacing}
      >
        {value}
      </Txt>
    </>
  );
}

/* ----------------------------- platform card ------------------------------ */
interface PlatformProps {
  y: number;
  glowId: string;
  glowColor: string;
  glowAlpha: number;
  plate: { fill: string; line: string; ink: string };
  glyph: ComponentProps<typeof Feather>["name"];
  name: string;
  /** "1.2M Followers" / "500K Subscribers", or "—" when this platform is not the record's. */
  reach: string;
  engagement: string;
  engagementInk: string;
}

/** 335x142.5 glass card: platform header over the Eng. / Likes / Comments triple. */
function PlatformCard({
  y, glowId, glowColor, glowAlpha, plate, glyph, name, reach, engagement, engagementInk,
}: PlatformProps) {
  return (
    <>
      <Abs
        x={CARD_X} y={y} w={CARD_W} h={PLATFORM_H} radius={28}
        bg={GLASS_52} border={CARD_LINE} borderWidth={1} style={styles.cardShadow}
      />
      <Glow id={glowId} y={y + 1} color={glowColor} alpha={glowAlpha} />

      {/* HorizontalBorder — header row, ruled off at +74.5 */}
      <Abs
        x={41} y={y + 19.25} w={36} h={36} radius={9999}
        bg={plate.fill} border={plate.line} borderWidth={1} center
      >
        <Feather name={glyph} size={16} color={plate.ink} />
      </Abs>
      <Txt
        x={89} y={y + 16} w={217} numberOfLines={1}
        size={15} weight="semibold" font="inter" color={NAME_INK}
        lineHeight={22.5} letterSpacing={-0.38}
      >
        {name}
      </Txt>
      <Txt
        x={89} y={y + 39.5} w={217} numberOfLines={1}
        size={12} weight="medium" font="inter" color={HANDLE_INK} lineHeight={18}
      >
        {reach}
      </Txt>
      <Abs x={318} y={y + 29.25} w={16} h={16} center>
        <Feather name="chevron-down" size={16} color={CHEV_INK} />
      </Abs>
      <Abs x={21} y={y + 74.5} w={333} h={1} bg={LINE_05} />

      {/* Eng. / Likes / Comments */}
      <Abs x={132.33} y={y + 74.5} w={1} h={67} bg={LINE_04} />
      <Abs x={243.66} y={y + 74.5} w={1} h={67} bg={LINE_04} />
      <Stat
        x={37} y={y + 86.5} w={78.33} label="Eng." value={engagement}
        valueSize={16} valueInk={engagementInk} valueSpacing={0}
      />
      <Stat
        x={148.33} y={y + 86.5} w={78.33} label="Likes" value="—"
        valueSize={16} valueInk={NAME_INK} valueSpacing={0}
      />
      <Stat
        x={259.67} y={y + 86.5} w={78.33} label="Comments" value="—"
        valueSize={16} valueInk={NAME_INK} valueSpacing={0}
      />
    </>
  );
}

/* ------------------------------- rate card -------------------------------- */
interface Format {
  key: string;
  /** Spec label of the row. */
  label: string;
  y: number;
  plate: string;
  ink: string;
  glyph: ComponentProps<typeof Feather>["name"];
  /** Share of the creator's base rate this format carries — see `priceFor`. */
  weight: number;
  /** The last row is the card's floor, so it carries no rule. */
  ruled: boolean;
}

const FORMATS: Format[] = [
  { key: "reels", label: "Reels", y: 981, plate: "#f5f0fa", ink: "#6a3a7e", glyph: "film", weight: 1, ruled: true },
  { key: "story", label: "Story", y: 1038, plate: "#fef9ee", ink: "#7e5c2a", glyph: "image", weight: 0.4, ruled: true },
  { key: "post", label: "Post", y: 1095, plate: "#f0f5f1", ink: "#3e5c45", glyph: "layout", weight: 0.7, ruled: false },
];

/* ------------------------------ derivations ------------------------------- */
/** compact() lowercases the thousands suffix; the frame prints "900K", "12.1K". */
const short = (n: number) => compact(n).toUpperCase();

/** engagementRate is a Float — "3.9%", not "3.9000000000000004%". */
const pct = (n: number) => `${Number(n.toFixed(1))}%`;

const mean = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);

const digitsOf = (s: string) => s.replace(/[^0-9]/g, "");

/* --------------------------------- screen --------------------------------- */
export default function CreatorDetail() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const scale = getScale();
  const { id } = useLocalSearchParams<{ id?: string }>();

  const { data: creators = [], isLoading } = useCreators();
  const { data: agencies = [] } = useAgencies();
  const { data: contacts = [] } = useContacts();
  const update = useUpdate<Creator>("creators");
  const remove = useRemove("creators");

  /** Rate edits are held as overrides so the card shows the live derivation until touched. */
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [editing, setEditing] = useState(false);

  const creator = useMemo(
    () => creators.find((c) => c.id === id) ?? creators[0],
    [creators, id],
  );
  const agency = useMemo(
    () => agencies.find((a) => a.id === creator?.agencyId),
    [agencies, creator],
  );

  /**
   * The frame's "+35% Above Average" is this creator's engagement measured
   * against the roster's, and its "Suggestion: Increase" is the advice that
   * follows when they are also priced under the roster's average cpv. Neither
   * chip is drawn when the record does not earn it — the design ships no
   * "Below Average" or "Decrease" wording to fall back to.
   */
  const { engagementDelta, suggestIncrease } = useMemo(() => {
    const rates = creators.filter((c) => c.engagementRate > 0).map((c) => c.engagementRate);
    const cpvs = creators.filter((c) => c.cpv > 0).map((c) => c.cpv);
    const avgRate = mean(rates);
    const avgCpv = mean(cpvs);
    return {
      engagementDelta:
        creator && avgRate > 0 ? Math.round((creator.engagementRate / avgRate - 1) * 100) : 0,
      suggestIncrease: !!creator && creator.cpv > 0 && avgCpv > 0 && creator.cpv < avgCpv,
    };
  }, [creators, creator]);

  /** Shareable profile link: the managing agency's domain over the creator's slug. */
  const link = useMemo(() => {
    const host = (
      agency?.website
        ? agency.website.replace(/^https?:\/\//, "").replace(/\/+$/, "")
        : `${(agency?.name ?? "Stellartalent").replace(/\s+/g, "")}.com`
    ).toLowerCase();
    const slug = (creator?.name ?? "").trim().toLowerCase().replace(/\s+/g, "-");
    return slug ? `${host}/${slug}` : host;
  }, [agency, creator]);

  /** Creator carries no phone column; the Contact of the same name is the only number on file. */
  const phone = useMemo(
    () => (creator ? contacts.find((c) => c.name === creator.name)?.phone : undefined),
    [contacts, creator],
  );
  const dialable = phone ? digitsOf(phone) : "";

  /* Rate card — cpv x avgViews weighted per format, rounded to the nearest 500. */
  const base = creator ? creator.cpv * creator.avgViews : 0;
  const priceFor = (weight: number) =>
    base > 0 ? Math.max(0, Math.round((base * weight) / 500) * 500) : 0;
  const priceText = (f: Format) => {
    const override = draft[f.key];
    if (override !== undefined) return override;
    const live = priceFor(f.weight);
    return live > 0 ? inr(live) : "";
  };

  const platform = creator?.platform ?? "";
  const onInstagram = platform === "INSTAGRAM";
  const onYouTube = platform === "YOUTUBE";

  const open = (url: string) => {
    Linking.openURL(url).catch(() => undefined);
  };

  const copyLink = () => {
    Clipboard.setString(link);
  };

  /**
   * Save Changes. Every edited price implies a base rate (price / weight); the
   * mean of them divided by avgViews is the cpv the record can actually hold.
   */
  const save = () => {
    if (!creator) return;
    const implied = FORMATS.flatMap((f) => {
      const typed = draft[f.key];
      if (typed === undefined) return [];
      const n = Number(digitsOf(typed));
      return n > 0 ? [n / f.weight] : [];
    });
    if (implied.length > 0 && creator.avgViews > 0) {
      update.mutate(
        { id: creator.id, data: { cpv: mean(implied) / creator.avgViews } },
        { onSuccess: () => router.back() },
      );
      return;
    }
    router.back();
  };

  const removeProfile = () => {
    if (!creator) return;
    Alert.alert("Remove profile", `Remove ${creator.name} from the roster?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: () => remove.mutate(creator.id, { onSuccess: () => router.back() }),
      },
    ]);
  };

  return (
    <View style={styles.root}>
      <Screen height={CANVAS_H} background={PAGE} scroll>
        {/* -------------------------------- Header ----------------------------- */}
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [styles.back, pressed && styles.pressed]}
        >
          <Feather name="arrow-left" size={16} color={BACK_ICON} />
        </Pressable>
        <Txt
          x={72} y={28} w={222}
          size={20} weight="medium" font="inter"
          color={HEAD_INK} lineHeight={24} letterSpacing={-0.6}
        >
          Creator Detail
        </Txt>

        {/* ================================ Hero ============================== */}
        <Abs
          x={CARD_X} y={106} w={CARD_W} h={415} radius={28}
          bg={GLASS_52} border={CARD_LINE} borderWidth={1} style={styles.cardShadow}
        />
        <Glow id="glow-hero" y={107} color="#d7cdff" alpha={0.42} />

        {/* Avatar — IMAGE fill in the design, gradient placeholder without one */}
        {creator?.avatarUrl ? (
          <Image source={{ uri: creator.avatarUrl }} style={styles.avatar} />
        ) : (
          <LinearGradient
            colors={gradients.creators}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.avatar}
          />
        )}
        <Abs x={99} y={185} w={20} h={20} radius={9999} bg={STATUS_DOT} border="#ffffff" borderWidth={2} center>
          <Abs x={4} y={4} w={8} h={8} radius={4} bg="#ffffff" />
        </Abs>

        <Txt
          x={129} y={127} w={205} numberOfLines={1}
          size={20} weight="semibold" font="inter"
          color={NAME_INK} lineHeight={25} letterSpacing={-0.5}
        >
          {creator?.name ?? (isLoading ? "Loading…" : "No creator")}
        </Txt>
        <Txt
          x={129} y={153} w={205} numberOfLines={1}
          size={13} weight="medium" font="inter" color={HANDLE_INK} lineHeight={19.5}
        >
          {creator ? `@${creator.handle.replace(/^@/, "")}` : ""}
        </Txt>

        {/* WhatsApp | Call — dead without a number on file, so disabled then */}
        <Pressable
          onPress={() => open(`whatsapp://send?phone=${dialable}`)}
          disabled={!dialable}
          style={({ pressed }) => [styles.whatsapp, pressed && styles.pressed]}
        >
          <Ionicons name="logo-whatsapp" size={12} color={WHATSAPP.ink} />
          <Txt size={12} weight="semibold" font="inter" color={WHATSAPP.ink} lineHeight={18}>
            WhatsApp
          </Txt>
        </Pressable>
        <Pressable
          onPress={() => open(`tel:${dialable}`)}
          disabled={!dialable}
          style={({ pressed }) => [styles.call, pressed && styles.pressed]}
        >
          <Feather name="phone" size={12} color={CALL.ink} />
          <Txt size={12} weight="semibold" font="inter" color={CALL.ink} lineHeight={18}>
            Call
          </Txt>
        </Pressable>

        {/* Niche — Creator holds a single niche, so the frame's second chip has no source */}
        {creator?.niche ? (
          <Chip x={41} y={233} h={31} paint={NICHE_CHIP} label={creator.niche} />
        ) : null}

        {/* Insight chips */}
        {engagementDelta > 0 ? (
          <Chip
            x={41} y={276} h={30.5} paint={ENGAGE_CHIP}
            icon="trending-up" label={`+${engagementDelta}% Above Average`}
          />
        ) : null}
        {suggestIncrease ? (
          <Chip
            x={41} y={314.5} h={30.5} paint={ADVICE_CHIP}
            icon="hash" label="Suggestion: Increase"
          />
        ) : null}

        {/* Shareable link */}
        <Abs
          x={41} y={357} w={293} h={57} radius={18}
          bg={GLASS_55} border={LINK_LINE} borderWidth={1} style={styles.linkShadow}
        />
        <Abs x={58} y={380.5} w={14} h={14} center>
          <Feather name="link" size={14} color={LABEL_INK} />
        </Abs>
        <Txt
          x={84} y={376.75} w={155} numberOfLines={1}
          size={13} weight="semibold" font="inter" color={LINK_INK} lineHeight={19.5}
        >
          {link}
        </Txt>
        <Pressable onPress={copyLink} style={({ pressed }) => [styles.copy, pressed && styles.pressed]}>
          <Feather name="copy" size={15} color={COPY.ink} />
          <Txt size={11} weight="bold" font="inter" color={COPY.ink} lineHeight={16.5}>
            Copy
          </Txt>
        </Pressable>

        {/* Followers | Views | Leads */}
        <Abs
          x={37} y={430} w={301} h={74} radius={18}
          bg={STRIP_FILL} border={LINE_05} borderWidth={1}
        />
        <Abs x={138} y={431} w={1} h={72} bg={LINE_05} />
        <Abs x={238} y={431} w={1} h={72} bg={LINE_05} />
        <Stat
          x={38} y={443} w={99} label="Followers"
          value={creator ? short(creator.followers) : "—"}
          valueSize={18} valueInk={NAME_INK} valueSpacing={-0.45}
        />
        <Stat
          x={138} y={443} w={99} label="Views"
          value={creator ? short(creator.avgViews) : "—"}
          valueSize={18} valueInk={NAME_INK} valueSpacing={-0.45}
        />
        <Stat
          x={238} y={443} w={99} label="Leads"
          value={creator ? `${creator.leadsCount ?? 0}` : "—"}
          valueSize={18} valueInk={NAME_INK} valueSpacing={-0.45}
        />

        {/* ============================ Platform cards ========================= */}
        <PlatformCard
          y={INSTAGRAM_Y}
          glowId="glow-ig"
          glowColor="#ffcde1"
          glowAlpha={0.35}
          plate={IG_PLATE}
          glyph="instagram"
          name="Instagram"
          reach={creator && onInstagram ? `${short(creator.followers)} Followers` : "—"}
          engagement={creator && onInstagram ? pct(creator.engagementRate) : "—"}
          engagementInk={IG_PLATE.ink}
        />
        <PlatformCard
          y={YOUTUBE_Y}
          glowId="glow-yt"
          glowColor="#ffd2d2"
          glowAlpha={0.35}
          plate={YT_PLATE}
          glyph="youtube"
          name="YouTube"
          reach={creator && onYouTube ? `${short(creator.followers)} Subscribers` : "—"}
          engagement={creator && onYouTube ? pct(creator.engagementRate) : "—"}
          engagementInk={YT_PLATE.ink}
        />

        {/* ============================= Commercials ========================== */}
        <Abs
          x={CARD_X} y={854} w={CARD_W} h={314} radius={28}
          bg={GLASS_52} border={CARD_LINE} borderWidth={1} style={styles.cardShadow}
        />
        <Glow id="glow-rates" y={855} color="#cddcff" alpha={0.38} />
        <Txt
          x={41} y={874.75} w={200}
          size={15} weight="semibold" font="inter"
          color={NAME_INK} lineHeight={22.5} letterSpacing={-0.38}
        >
          Commercials
        </Txt>
        <Pressable
          onPress={() => setEditing((v) => !v)}
          style={({ pressed }) => [styles.rateEdit, pressed && styles.pressed]}
        >
          <Feather name={editing ? "check" : "edit-2"} size={13} color={LINK_INK} />
        </Pressable>
        <Abs x={21} y={920} w={333} h={1} bg={LINE_05} />

        {/* platform group header */}
        <Abs
          x={41} y={934} w={32} h={32} radius={9999}
          bg={IG_PLATE.fill} border={IG_PLATE.line} borderWidth={1} center
        >
          <Feather name="instagram" size={15} color={IG_PLATE.ink} />
        </Abs>
        <Txt
          x={85} y={939.5} w={222} numberOfLines={1}
          size={14} weight="semibold" font="inter" color={NAME_INK} lineHeight={21}
        >
          Instagram
        </Txt>
        <Abs x={319} y={942.5} w={15} h={15} center>
          <Feather name="chevron-down" size={15} color={CHEV_INK} />
        </Abs>
        <Abs x={41} y={981} w={293} h={1} bg={LINE_05} />

        {FORMATS.map((f) => {
          const value = priceText(f);
          return (
            <View key={f.key}>
              <Abs x={41} y={f.y + 14} w={28} h={28} radius={9999} bg={f.plate} center>
                <Feather name={f.glyph} size={12} color={f.ink} />
              </Abs>
              <Txt
                x={81} y={f.y + 17.25} w={140} numberOfLines={1}
                size={13} weight="semibold" font="inter" color={RATE_INK} lineHeight={19.5}
              >
                {f.label}
              </Txt>
              {editing ? (
                <TextInput
                  value={value}
                  onChangeText={(t) => setDraft((d) => ({ ...d, [f.key]: t }))}
                  keyboardType="number-pad"
                  style={[styles.rateInput, { top: f.y + 17.5 }]}
                />
              ) : (
                <Txt
                  x={234.44} y={f.y + 17.5} w={100} align="right" numberOfLines={1}
                  size={14} weight="semibold" font="inter" color={NAME_INK} lineHeight={21}
                >
                  {value ? `₹${value}` : "—"}
                </Txt>
              )}
              {f.ruled ? <Abs x={41} y={f.y + RATE_ROW_H} w={293} h={1} bg={LINE_05} /> : null}
            </View>
          );
        })}
      </Screen>

      {/* ====================== Action pair — pinned overlay ================== */}
      <View
        pointerEvents="box-none"
        style={[styles.dock, { bottom: insets.bottom, width: FRAME_W * scale, height: DOCK_H * scale }]}
      >
        <View
          pointerEvents="box-none"
          style={[styles.dockCanvas, { width: FRAME_W, height: DOCK_H, transform: [{ scale }] }]}
        >
          <Pressable
            onPress={save}
            disabled={!creator || update.isPending}
            style={({ pressed }) => [styles.save, pressed && styles.pressed]}
          >
            <Txt
              x={0} y={15} w={327} align="center"
              size={15} weight="semibold" font="inter" color="#ffffff" lineHeight={22.5}
            >
              Save Changes
            </Txt>
          </Pressable>
          <Pressable
            onPress={removeProfile}
            disabled={!creator || remove.isPending}
            style={({ pressed }) => [styles.remove, pressed && styles.pressed]}
          >
            <Txt
              x={0} y={16} w={335} align="center"
              size={15} weight="semibold" font="inter" color={REMOVE_INK} lineHeight={22.5}
            >
              Remove profile
            </Txt>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: PAGE },
  pressed: { opacity: 0.9 },
  clip: { overflow: "hidden" },
  chipPad: { paddingHorizontal: 13 },

  back: {
    position: "absolute",
    left: 16,
    top: 22,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: BACK_FILL,
    shadowColor: "#000000",
    shadowOpacity: 0.1,
    shadowRadius: 2.7,
    shadowOffset: { width: 0, height: 0.9 },
    elevation: 2,
  },

  cardShadow: {
    shadowColor: "#826ec8",
    shadowOpacity: 0.09,
    shadowRadius: 40,
    shadowOffset: { width: 0, height: 12 },
    elevation: 2,
  },
  linkShadow: {
    shadowColor: "#000000",
    shadowOpacity: 0.03,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },

  avatar: {
    position: "absolute",
    left: 41,
    top: 127,
    width: 72,
    height: 72,
    borderRadius: 20,
    shadowColor: "#000000",
    shadowOpacity: 0.1,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },

  whatsapp: {
    position: "absolute",
    left: 129,
    top: 185,
    width: 106,
    height: 32,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: WHATSAPP.fill,
    borderWidth: 1,
    borderColor: WHATSAPP.line,
  },
  call: {
    position: "absolute",
    left: 243,
    top: 185,
    width: 67,
    height: 32,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: CALL.fill,
    borderWidth: 1,
    borderColor: CALL.line,
  },
  copy: {
    position: "absolute",
    left: 243.19,
    top: 374,
    width: 73.81,
    height: 27,
    borderRadius: 13.5,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: COPY.fill,
    borderWidth: 1,
    borderColor: COPY.line,
  },

  rateEdit: {
    position: "absolute",
    left: 302,
    top: 871,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.04)",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.06)",
  },
  rateInput: {
    position: "absolute",
    left: 234.44,
    width: 100,
    height: 21,
    padding: 0,
    textAlign: "right",
    fontFamily: fonts.interMedium,
    fontSize: 14,
    color: NAME_INK,
  },

  dock: { position: "absolute", left: 0 },
  dockCanvas: { position: "relative", transformOrigin: "top left" },
  save: {
    position: "absolute",
    left: 20,
    top: 0,
    width: 327,
    height: 54.5,
    borderRadius: 9999,
    backgroundColor: SAVE_FILL,
    shadowColor: "#000000",
    shadowOpacity: 0.15,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  remove: {
    position: "absolute",
    left: 20,
    top: 66.5,
    width: 335,
    height: 56.5,
    borderRadius: 9999,
    backgroundColor: GLASS_70,
    borderWidth: 1,
    borderColor: "#ffffff",
    shadowColor: "#000000",
    shadowOpacity: 0.04,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
});
