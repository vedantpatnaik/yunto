import type { ComponentProps } from "react";
import { useMemo, useState } from "react";
import { Pressable, StyleSheet, TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Svg, {
  Defs,
  LinearGradient as SvgLinear,
  RadialGradient,
  Rect,
  Stop,
} from "react-native-svg";
import { Abs, Screen, Txt } from "../../../../src/ui/Frame";
import { fonts } from "../../../../src/theme";
import {
  useCreate,
  useCreators,
  useMe,
  useRateCards,
  useUpdate,
  type RateCard,
} from "../../../../src/api/hooks";

/**
 * Personal Information — Barter Commercials (expanded) — Figma 7358:29159.
 *
 * The Edit Profile accordion with the sixth section open. Five collapsed 335x74
 * rows sit above the 335x718 "Barter Commercials" card, which holds a repeatable
 * deal builder — SELECT PLATFORM dropdown, the "＋ Add Another Barter Deal"
 * button, the seven DELIVERABLES chips, the Barter Value rupee field and the
 * "Addd" CTA — and the Bank Details row closes the stack.
 *
 * The frame is 875pt but its "Main" frame stacks 1350pt of accordion behind a
 * clip, so the canvas is sized to the real content bottom (Bank Details row
 * 1350 + Main's 40pt bottom padding) and scrolls. Appending a deal repeats the
 * 602pt block at the card's own 30pt stack gap, growing the card, the Bank
 * Details row and the canvas by one step each. Every coordinate below is a raw
 * frame coordinate from the spec.
 *
 * Persistence: the barter terms live on the creator's RateCard row — one row per
 * creator, shared with the Commercials screen, which owns the rupee rates while
 * this screen owns `acceptsBarter` / `barterValue` / `barterFormats`. The chips
 * and the value field are seeded from that row, and "Addd" writes it back.
 */

/* ------------------------------- geometry -------------------------------- */
const FRAME_W = 375;

const CARD_X = 20;
const CARD_W = 335;

/** Collapsed rows: 74pt card, 12pt stack gap. */
const ROW_H = 74;
const ROW_Y0 = 116;
const ROW_STEP = 86;

/** Expanded "Barter Commercials" card, at one deal block. */
const EXP_Y = 546;
const EXP_H_ONE = 718;

/** First deal block: SELECT PLATFORM label 637 → "Addd" button bottom 1239. */
const BLOCK_Y0 = 637;
const BLOCK_H = 602;
/** Repeat step: the block plus the card's own 30pt vertical stack gap. */
const BLOCK_STEP = BLOCK_H + 30;

/** Bank Details row and the scroll canvas, at one deal block. */
const BANK_Y_ONE = 1276;
const CANVAS_H_ONE = 1390;

/* Section-header offsets, relative to the card's own x/y (spec absolute minus
   the card origin). Identical for the expanded card and the collapsed rows. */
const TILE_OFF = 13; // 33-20, 129-116
const TILE_SIZE = 48;
const LABEL_X = 77; // 97-20
const LABEL_Y = 27.5; // 143.5-116
const LABEL_W = 189;
const DISC_X = 282; // 302-20
const DISC_Y = 19; // 135-116
const DISC_SIZE = 36;

/* Deal-block interior, as offsets from the block's top edge (637). */
const D_PLATFORM_FIELD = 34; // 671
const D_ADD_ANOTHER = 116; // 753
const D_DELIVERABLES_LABEL = 197; // 834
const D_VALUE_LABEL = 435; // 1072
const D_VALUE_FIELD = 469; // 1106
const D_CTA = 551; // 1188

/** Full-width field: 301pt card, 20pt padding + 1pt border → 259pt of value. */
const FIELD_X = 37;
const FIELD_W = 301;
const FIELD_H = 52;
const FIELD_TEXT_X = 58;
const FIELD_INNER_W = 259;

const CHIP_H = 50;

/* --------------------------- spec colour tokens --------------------------- */
const LABEL_INK = "#111827";
const TITLE_INK = "#1D1D1F";
const BACK_INK = "#1C1C1E";
const CHEV_INK = "#6B7280";
const CAPTION_INK = "#6B7280";
const GLASS_42 = "rgba(255,255,255,0.42)";
const GLASS_55 = "rgba(255,255,255,0.55)";
const GLASS_60 = "rgba(255,255,255,0.6)";
const GLASS_65 = "rgba(255,255,255,0.65)";
const GLASS_80 = "rgba(255,255,255,0.8)";
const HAIRLINE_50 = "rgba(255,255,255,0.5)";
const HAIRLINE_62 = "rgba(255,255,255,0.62)";
const HAIRLINE_90 = "rgba(255,255,255,0.9)";

const CHIP_ON_BG = "rgba(240,226,255,0.9)";
const CHIP_ON_INK = "#2B2B2B";
const CHIP_OFF_INK = "#6F6F6F";
const PLATFORM_INK = "#1F1F1F";
const PLATFORM_GLYPH = "#FF4AA1";
const CARET_INK = "#7D7D7D";
const ADD_ANOTHER_INK = "#1F1A17";
const CTA_BG = "#312B28";
/** Not a spec token — the frame paints no error state. Only ever drawn in the
 *  25pt of card padding under the CTA, so the traced layout never moves. */
const ERROR_INK = "#B42318";

/* -------------------------------- backdrop -------------------------------- */
/** Frame fill: the beige linear base plus four radial tints, stretched to the
 *  scroll canvas so the wash covers the whole accordion. */
function Backdrop({ h }: { h: number }) {
  return (
    <Svg width={FRAME_W} height={h} style={styles.backdrop}>
      <Defs>
        <SvgLinear id="base" x1="187.5" y1="0" x2="187.5" y2={h} gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#F7F0E4" />
          <Stop offset="1" stopColor="#F4EBDD" />
        </SvgLinear>
        <RadialGradient
          id="pink"
          cx={0.76 * FRAME_W}
          cy={0.62 * h}
          rx={2.74 * FRAME_W}
          ry={0.65 * h}
          gradientUnits="userSpaceOnUse"
        >
          <Stop offset="0" stopColor="#F7B7DA" stopOpacity="0.34" />
          <Stop offset="0.26" stopColor="#F7B7DA" stopOpacity="0" />
        </RadialGradient>
        <RadialGradient
          id="blue"
          cx={0.24 * FRAME_W}
          cy={0.42 * h}
          rx={2.58 * FRAME_W}
          ry={0.61 * h}
          gradientUnits="userSpaceOnUse"
        >
          <Stop offset="0" stopColor="#BACDF4" stopOpacity="0.36" />
          <Stop offset="0.24" stopColor="#BACDF4" stopOpacity="0" />
        </RadialGradient>
        <RadialGradient
          id="gold"
          cx={0.78 * FRAME_W}
          cy={0.18 * h}
          rx={3.57 * FRAME_W}
          ry={0.84 * h}
          gradientUnits="userSpaceOnUse"
        >
          <Stop offset="0" stopColor="#F6D64A" stopOpacity="0.22" />
          <Stop offset="0.2" stopColor="#F6D64A" stopOpacity="0" />
        </RadialGradient>
        <RadialGradient
          id="haze"
          cx={0.2 * FRAME_W}
          cy={0.1 * h}
          rx={3.91 * FRAME_W}
          ry={0.92 * h}
          gradientUnits="userSpaceOnUse"
        >
          <Stop offset="0" stopColor="#FFFFFF" stopOpacity="0.72" />
          <Stop offset="0.24" stopColor="#FFFFFF" stopOpacity="0" />
        </RadialGradient>
      </Defs>
      <Rect width={FRAME_W} height={h} fill="url(#base)" />
      <Rect width={FRAME_W} height={h} fill="url(#pink)" />
      <Rect width={FRAME_W} height={h} fill="url(#blue)" />
      <Rect width={FRAME_W} height={h} fill="url(#gold)" />
      <Rect width={FRAME_W} height={h} fill="url(#haze)" />
    </Svg>
  );
}

/* ----------------------------- accordion rows ----------------------------- */
type IconName = ComponentProps<typeof Ionicons>["name"];

interface SectionSpec {
  key: string;
  /** Frame-space top edge of the row card, before the deal-block growth. */
  y: number;
  /** "Background+Shadow" tile fill. */
  tile: string;
  /** Tile glyph stroke colour. */
  ink: string;
  icon: IconName;
  label: string;
  /** Sibling route, where one exists. Otherwise the row returns to the list. */
  href?: string;
}

/** The five sections collapsed above the open Barter Commercials card. */
const SECTIONS_ABOVE: SectionSpec[] = [
  {
    key: "basics",
    y: ROW_Y0,
    tile: "#F3E8FF",
    ink: "#9333EA",
    icon: "person-outline",
    label: "Basics",
    href: "/profile/personal-information/basics",
  },
  { key: "language", y: ROW_Y0 + ROW_STEP, tile: "#DBEAFE", ink: "#2563EB", icon: "globe-outline", label: "Language" },
  { key: "address", y: ROW_Y0 + ROW_STEP * 2, tile: "#CCFBF1", ink: "#0D9488", icon: "location-outline", label: "Address" },
  { key: "measurements", y: ROW_Y0 + ROW_STEP * 3, tile: "#FFEDD5", ink: "#EA580C", icon: "resize-outline", label: "Measurements" },
  { key: "commercials", y: ROW_Y0 + ROW_STEP * 4, tile: "#D1FAE5", ink: "#059669", icon: "cash-outline", label: "Commercials" },
];

/** Header strip shared by the collapsed rows and the expanded card. */
function SectionHead({
  tile,
  ink,
  icon,
  label,
  expanded,
}: {
  tile: string;
  ink: string;
  icon: IconName;
  label: string;
  expanded?: boolean;
}) {
  return (
    <>
      {/* Background+Shadow — 48x48 r20 icon tile. */}
      <Abs x={TILE_OFF} y={TILE_OFF} w={TILE_SIZE} h={TILE_SIZE} radius={20} bg={tile} center style={styles.tileShadow}>
        <Ionicons name={icon} size={24} color={ink} />
      </Abs>

      {/* Label — Inter 600 16 / 19.36. */}
      <Txt
        x={LABEL_X}
        y={LABEL_Y}
        w={LABEL_W}
        size={16}
        weight="semibold"
        font="inter"
        color={LABEL_INK}
        lineHeight={19.36}
        numberOfLines={1}
      >
        {label}
      </Txt>

      {/* Overlay+Shadow — 36x36 r18 glass disc holding the 10x5 chevron. */}
      <Abs x={DISC_X} y={DISC_Y} w={DISC_SIZE} h={DISC_SIZE} radius={18} bg={GLASS_60} center style={styles.discShadow}>
        <Ionicons name={expanded ? "chevron-up" : "chevron-down"} size={20} color={CHEV_INK} />
      </Abs>
    </>
  );
}

/** A collapsed 335x74 glass row. */
function CollapsedRow({ y, section, onPress }: { y: number; section: SectionSpec; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        position: "absolute",
        left: CARD_X,
        top: y,
        width: CARD_W,
        height: ROW_H,
        opacity: pressed ? 0.88 : 1,
      })}
    >
      <View style={styles.rowFill} />
      <SectionHead tile={section.tile} ink={section.ink} icon={section.icon} label={section.label} />
    </Pressable>
  );
}

/* ------------------------------ deal builder ------------------------------ */
/** The caption above a field — Inter 600 13 / 15.73. */
function Caption({ x, y, w, children }: { x: number; y: number; w: number; children: string }) {
  return (
    <Txt x={x} y={y} w={w} size={13} weight="semibold" font="inter" color={CAPTION_INK} lineHeight={15.73}>
      {children}
    </Txt>
  );
}

interface ChipSpec {
  label: string;
  /** Frame-space x and block-relative y of the 50pt pill. */
  x: number;
  dy: number;
  w: number;
  /** Frame-space x and block-relative y of the pill's TEXT node. */
  tx: number;
  tdy: number;
  tw: number;
}

/** The seven DELIVERABLES pills, laid out exactly as the spec wraps them. */
const DELIVERABLES: ChipSpec[] = [
  { label: "Reel", x: 37, dy: 231, w: 84, tx: 62, tdy: 246, tw: 34 },
  { label: "Story", x: 132.34, dy: 231, w: 92, tx: 157.34, tdy: 246, tw: 42 },
  { label: "Carousel", x: 236, dy: 231, w: 102, tx: 254, tdy: 245, tw: 69 },
  { label: "Static Post", x: 37, dy: 293, w: 134, tx: 62, tdy: 308, tw: 84 },
  { label: "Dedicated Video", x: 182, dy: 293, w: 156, tx: 197, tdy: 308, tw: 129 },
  { label: "Event Appearance", x: 37, dy: 355, w: 172, tx: 52, tdy: 370, tw: 143 },
  { label: "UGC", x: 237.09, dy: 355, w: 86, tx: 262.09, tdy: 370, tw: 36 },
];

/** The two pills the spec paints in the selected #F0E2FF state. */
const SPEC_SELECTED = ["Reel", "Story"];

/** The DeliverableKind members the seven chips stand for — the values stored in
 *  RateCard.barterFormats. */
type BarterKind =
  | "REEL"
  | "STORY"
  | "CAROUSEL"
  | "STATIC_POST"
  | "DEDICATED_VIDEO"
  | "EVENT_APPEARANCE"
  | "UGC";

/** Undefined for any label that is not one of the seven pills. */
const CHIP_KIND: Record<string, BarterKind | undefined> = {
  Reel: "REEL",
  Story: "STORY",
  Carousel: "CAROUSEL",
  "Static Post": "STATIC_POST",
  "Dedicated Video": "DEDICATED_VIDEO",
  "Event Appearance": "EVENT_APPEARANCE",
  UGC: "UGC",
};

/** Enum member -> chip label. Kinds the chip set cannot express (POST, COLLAB,
 *  INTEGRATED_VIDEO, SHORT) have no pill and read back as undefined. */
const chipLabelOf = (kind: string): string | undefined =>
  DELIVERABLES.find((chip) => CHIP_KIND[chip.label] === kind)?.label;

const digitsOf = (s: string) => s.replace(/[^0-9]/g, "");

interface BarterDeal {
  /** null until the creator overrides the platform their record already reports. */
  platform: string | null;
  /** null until edited — the block shows the saved rate card until then. */
  deliverables: string[] | null;
  valueInr: string | null;
}

function DealBlock({
  top,
  platform,
  deliverables,
  valueInr,
  busy,
  error,
  onCyclePlatform,
  onToggle,
  onChangeValue,
  onAddAnother,
  onSubmit,
  onRemove,
}: {
  top: number;
  platform: string;
  deliverables: string[];
  valueInr: string;
  /** A save is in flight — the CTA is inert until it settles. */
  busy: boolean;
  /** Why the last save of this block failed, if it did. */
  error?: string;
  onCyclePlatform: () => void;
  onToggle: (label: string) => void;
  onChangeValue: (next: string) => void;
  onAddAnother: () => void;
  onSubmit: () => void;
  onRemove: () => void;
}) {
  return (
    <>
      {/* --------------------------- SELECT PLATFORM --------------------------
          Display-only: RateCard stores one barter offer per creator and has no
          platform column, so cycling this re-labels the field but is deliberately
          not persisted. The value shown is the creator's own platform. */}
      <Caption x={41} y={top} w={297}>
        SELECT PLATFORM
      </Caption>
      <Pressable
        onPress={onCyclePlatform}
        style={({ pressed }) => [styles.field, { top: top + D_PLATFORM_FIELD }, pressed && styles.pressed]}
      >
        {/* Background+Shadow — 38x38 r12.67 white tile behind the ◎ glyph. */}
        <Abs x={11} y={7} w={38} h={38} radius={12.67} bg="#FFFFFF" style={styles.glyphShadow} />
        <Txt
          x={21.5}
          y={14.1}
          w={17}
          size={19}
          weight="bold"
          font="inter"
          color={PLATFORM_GLYPH}
          lineHeight={22.99}
          align="center"
        >
          ◎
        </Txt>
        <Txt
          x={65}
          y={16.5}
          w={78}
          size={16}
          weight="semibold"
          font="inter"
          color={PLATFORM_INK}
          lineHeight={19.36}
          numberOfLines={1}
        >
          {platform}
        </Txt>
        <Txt x={267} y={7} w={13} size={24} weight="regular" font="inter" color={CARET_INK} lineHeight={29.05}>
          ⌄
        </Txt>
      </Pressable>

      {/* ----------------------- ＋ Add Another Barter Deal --------------------- */}
      <Pressable
        onPress={onAddAnother}
        style={({ pressed }) => [styles.addAnother, { top: top + D_ADD_ANOTHER }, pressed && styles.pressed]}
      >
        <Txt
          x={24}
          y={17}
          w={182}
          size={14}
          weight="medium"
          font="inter"
          color={ADD_ANOTHER_INK}
          lineHeight={16.94}
          align="center"
        >
          ＋ Add Another Barter Deal
        </Txt>
      </Pressable>

      {/* ----------------------------- DELIVERABLES --------------------------- */}
      <Caption x={41} y={top + D_DELIVERABLES_LABEL} w={297}>
        DELIVERABLES
      </Caption>
      {DELIVERABLES.map((chip) => {
        const on = deliverables.includes(chip.label);
        return (
          <Pressable
            key={chip.label}
            onPress={() => onToggle(chip.label)}
            style={({ pressed }) => ({
              position: "absolute",
              left: chip.x,
              top: top + chip.dy,
              width: chip.w,
              height: CHIP_H,
              borderRadius: 999,
              backgroundColor: on ? CHIP_ON_BG : GLASS_42,
              borderWidth: 1,
              borderColor: HAIRLINE_50,
              opacity: pressed ? 0.88 : 1,
            })}
          >
            <Txt
              x={chip.tx - chip.x}
              y={chip.tdy - chip.dy}
              w={chip.tw}
              size={16}
              weight="semibold"
              font="inter"
              color={on ? CHIP_ON_INK : CHIP_OFF_INK}
              lineHeight={19.36}
              numberOfLines={1}
            >
              {chip.label}
            </Txt>
          </Pressable>
        );
      })}

      {/* ----------------------------- Barter Value --------------------------- */}
      <Caption x={41} y={top + D_VALUE_LABEL} w={297}>
        Barter Value
      </Caption>
      <Abs
        x={FIELD_X}
        y={top + D_VALUE_FIELD}
        w={FIELD_W}
        h={FIELD_H}
        radius={20}
        bg={GLASS_80}
        border={HAIRLINE_90}
        borderWidth={1}
        style={styles.fieldShadow}
      />
      <TextInput
        value={valueInr}
        onChangeText={onChangeValue}
        placeholder="₹  e.g. 5000"
        placeholderTextColor={LABEL_INK}
        keyboardType="number-pad"
        selectionColor={LABEL_INK}
        style={[styles.input, { left: FIELD_TEXT_X, top: top + D_VALUE_FIELD + 1, width: FIELD_INNER_W, height: FIELD_H - 2 }]}
      />

      {/* -------------------------------- Addd -------------------------------- */}
      {/* Long-press removes this deal — removeBarterDeal — when more than one
          block is open; the spec draws no dedicated delete affordance. */}
      <Pressable
        onPress={onSubmit}
        onLongPress={onRemove}
        disabled={busy}
        style={({ pressed }) => [styles.cta, { top: top + D_CTA }, (pressed || busy) && styles.pressed]}
      >
        <Txt x={63.25} y={17} w={36} size={14} weight="medium" font="inter" color="#FFFFFF" lineHeight={16.94} align="center">
          Addd
        </Txt>
      </Pressable>

      {/* Failure notice — drawn only when a save fails, in the card padding
          below the CTA. Nothing typed is cleared; "Addd" retries. */}
      {error ? (
        <Txt
          x={41}
          y={top + D_CTA + 54}
          w={297}
          size={12}
          weight="medium"
          font="inter"
          color={ERROR_INK}
          lineHeight={14.52}
          numberOfLines={2}
        >
          {error}
        </Txt>
      ) : null}
    </>
  );
}

/* --------------------------------- screen --------------------------------- */
/** "INSTAGRAM" -> "Instagram" — the Platform enum as the dropdown renders it. */
const titleCase = (s: string) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();

export default function PersonalInformationBarterCommercials() {
  const router = useRouter();

  const { data: me } = useMe();
  const { data: creators = [] } = useCreators();
  const { data: rateCards = [], isPending: cardsLoading } = useRateCards();

  const createRateCard = useCreate<RateCard>("rate-cards");
  const updateRateCard = useUpdate<RateCard>("rate-cards");
  const saving = createRateCard.isPending || updateRateCard.isPending;

  /** Which block's save failed, and why. Cleared on the next attempt. */
  const [error, setError] = useState<{ index: number; text: string } | null>(null);

  /** The signed-in creator's own row in the roster. */
  const creator = useMemo(
    () => creators.find((c) => c.name === me?.name) ?? creators[0],
    [creators, me],
  );

  /** The creator's rate card — `creatorId` is unique server-side, so at most one. */
  const card = useMemo(
    () => rateCards.find((rc) => rc.creatorId === creator?.id),
    [rateCards, creator],
  );

  /* What the record already holds. Until /rate-cards lands — or if the creator
     has no row yet — the chips keep the spec's Reel + Story pair, so nothing
     moves on load and the frame renders exactly as traced. */
  const savedDeliverables = useMemo(
    () =>
      card
        ? (card.barterFormats ?? [])
            .map(chipLabelOf)
            .filter((label): label is string => label !== undefined)
        : SPEC_SELECTED,
    [card],
  );
  const savedValue = card?.barterValue != null ? String(card.barterValue) : "";

  /** The platform the creator's record already reports — the dropdown's value. */
  const livePlatform = creator?.platform ? titleCase(creator.platform) : "Instagram";

  /** platforms.catalog — the distinct platforms the roster actually uses. */
  const platforms = useMemo(() => {
    const seen = creators
      .map((c) => c.platform)
      .filter((p): p is string => typeof p === "string" && p.length > 0)
      .map(titleCase);
    const uniq = Array.from(new Set(seen));
    return uniq.length > 0 ? uniq : [livePlatform];
  }, [creators, livePlatform]);

  /* One deal is open in the spec. Every field of it starts null — "not edited"
     — so the block shows the saved rate card (and the spec literals while the
     fetches are in flight), adopts the live record the moment it lands, and
     never moves any geometry. The first keystroke on a field materialises it. */
  const [deals, setDeals] = useState<BarterDeal[]>([
    { platform: null, deliverables: null, valueInr: null },
  ]);

  const patch = (index: number, next: Partial<BarterDeal>) =>
    setDeals((list) => list.map((deal, i) => (i === index ? { ...deal, ...next } : deal)));

  /* An appended deal is a fresh draft, not another copy of the saved record. */
  const addBarterDeal = () =>
    setDeals((list) => [...list, { platform: null, deliverables: [], valueInr: "" }]);

  const removeBarterDeal = (index: number) =>
    setDeals((list) => (list.length > 1 ? list.filter((_, i) => i !== index) : list));

  const cyclePlatform = (index: number, current: string) => {
    const next = platforms[(platforms.indexOf(current) + 1) % platforms.length];
    patch(index, { platform: next });
  };

  const toggleDeliverable = (index: number, label: string) =>
    setDeals((list) =>
      list.map((deal, i) => {
        if (i !== index) return deal;
        /* The first toggle materialises the saved set into the draft. */
        const current = deal.deliverables ?? savedDeliverables;
        return {
          ...deal,
          deliverables: current.includes(label)
            ? current.filter((d) => d !== label)
            : [...current, label],
        };
      }),
    );

  /* The RateCard row carries ONE barter offer — a rupee value and a format list
     — so "Addd" publishes the block it sits under as the creator's barter terms:
     PATCH when the row exists, POST the first time. Blocks appended with
     "＋ Add Another Barter Deal" stay drafts until one of them is submitted. */
  const submitDeal = (index: number) => {
    if (saving) return;
    const deal = deals[index];
    /* Without the creator and their existing row, a POST here would try to
       create a second rate card and hit the unique creatorId — so wait. */
    if (!creator || cardsLoading) {
      setError({ index, text: "Couldn't save — your profile is still loading. Try again in a moment." });
      return;
    }
    setError(null);

    const labels = deal.deliverables ?? savedDeliverables;
    const digits = digitsOf(deal.valueInr ?? savedValue);
    const barter = {
      acceptsBarter: true,
      barterValue: digits ? Number(digits) : null,
      barterFormats: labels
        .map((label) => CHIP_KIND[label])
        .filter((kind): kind is BarterKind => kind !== undefined),
    };

    const done = {
      onSuccess: () => router.back(),
      /* Stay on the screen and keep every keystroke — "Addd" retries. */
      onError: (e: Error) => setError({ index, text: `Couldn't save — ${e.message}` }),
    };

    if (card) updateRateCard.mutate({ id: card.id, data: barter }, done);
    else createRateCard.mutate({ creatorId: creator.id, ...barter }, done);
  };

  /* The card, the Bank Details row and the canvas each grow by one block step
     per extra deal — the accordion below simply shifts down. */
  const extra = (deals.length - 1) * BLOCK_STEP;
  const expandedH = EXP_H_ONE + extra;
  const bankY = BANK_Y_ONE + extra;
  const canvasH = CANVAS_H_ONE + extra;

  return (
    <Screen height={canvasH} background="#F7F0E4" scroll>
      <Backdrop h={canvasH} />

      {/* =============================== Header ============================== */}
      <Pressable
        onPress={() => router.back()}
        style={({ pressed }) => [styles.back, pressed && styles.pressed]}
      >
        <Ionicons name="chevron-back" size={20} color={BACK_INK} />
      </Pressable>
      <Txt
        x={79.5}
        y={30}
        w={236}
        size={16}
        weight="bold"
        font="inter"
        color={TITLE_INK}
        lineHeight={19.36}
        align="center"
      >
        Personal Information
      </Txt>

      {/* ==================== Main — the five rows above ====================== */}
      {SECTIONS_ABOVE.map((section) => (
        <CollapsedRow
          key={section.key}
          y={section.y}
          section={section}
          onPress={() => (section.href ? router.push(section.href) : router.back())}
        />
      ))}

      {/* ================ Barter Commercials (expanded, 718pt) =============== */}
      <Abs
        x={CARD_X}
        y={EXP_Y}
        w={CARD_W}
        h={expandedH}
        radius={28}
        bg={GLASS_60}
        border={HAIRLINE_90}
        borderWidth={1}
        style={styles.expandedShadow}
      />
      <Pressable
        onPress={() => router.back()}
        style={({ pressed }) => [styles.expandedHead, pressed && styles.pressed]}
      >
        <SectionHead tile="#FCE7F3" ink="#DB2777" icon="gift-outline" label="Barter Commercials" expanded />
      </Pressable>

      {/* barterDeals[] — the repeatable deal block, at 637 + i * 632. */}
      {deals.map((deal, i) => {
        const platform = deal.platform ?? livePlatform;
        return (
          <DealBlock
            key={i}
            top={BLOCK_Y0 + i * BLOCK_STEP}
            platform={platform}
            deliverables={deal.deliverables ?? savedDeliverables}
            valueInr={deal.valueInr ?? savedValue}
            busy={saving}
            error={error?.index === i ? error.text : undefined}
            onCyclePlatform={() => cyclePlatform(i, platform)}
            onToggle={(label) => toggleDeliverable(i, label)}
            onChangeValue={(next) => patch(i, { valueInr: digitsOf(next) })}
            onAddAnother={addBarterDeal}
            onSubmit={() => submitDeal(i)}
            onRemove={() => removeBarterDeal(i)}
          />
        );
      })}

      {/* ========================= Bank Details row =========================== */}
      <CollapsedRow
        y={bankY}
        section={{
          key: "bank",
          y: bankY,
          tile: "#E0E7FF",
          ink: "#4F46E5",
          icon: "business-outline",
          label: "Bank Details",
        }}
        onPress={() => router.push("/payments/payout-bank-details")}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  backdrop: { position: "absolute", left: 0, top: 0 },
  pressed: { opacity: 0.88 },

  back: {
    position: "absolute",
    left: 15,
    top: 18,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: GLASS_65,
    borderWidth: 1,
    borderColor: HAIRLINE_90,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000000",
    shadowOpacity: 0.03,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 1,
  },

  /* Collapsed row card — #FFFFFF @55%, 1pt #FFFFFF @90% hairline, r28. */
  rowFill: {
    position: "absolute",
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
    borderRadius: 28,
    backgroundColor: GLASS_55,
    borderWidth: 1,
    borderColor: HAIRLINE_90,
    shadowColor: "#000000",
    shadowOpacity: 0.04,
    shadowRadius: 32,
    shadowOffset: { width: 0, height: 12 },
    elevation: 2,
  },
  tileShadow: {
    shadowColor: "#000000",
    shadowOpacity: 0.03,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 1,
  },
  discShadow: {
    shadowColor: "#000000",
    shadowOpacity: 0.03,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },

  expandedShadow: {
    shadowColor: "#000000",
    shadowOpacity: 0.08,
    shadowRadius: 40,
    shadowOffset: { width: 0, height: 16 },
    elevation: 3,
  },
  /* Tap target over the expanded card's own 309x48 header container. */
  expandedHead: {
    position: "absolute",
    left: CARD_X,
    top: EXP_Y,
    width: CARD_W,
    height: ROW_H,
  },

  /* Overlay+Border+Shadow — the drop shadow plus the 2pt inner shadow the spec
     paints inside each field, approximated with a single soft shadow. */
  field: {
    position: "absolute",
    left: FIELD_X,
    width: FIELD_W,
    height: FIELD_H,
    borderRadius: 20,
    backgroundColor: GLASS_80,
    borderWidth: 1,
    borderColor: HAIRLINE_90,
    shadowColor: "#000000",
    shadowOpacity: 0.02,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 1,
  },
  fieldShadow: {
    shadowColor: "#000000",
    shadowOpacity: 0.02,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 1,
  },
  glyphShadow: {
    shadowColor: "#000000",
    shadowOpacity: 0.08,
    shadowRadius: 14.25,
    shadowOffset: { width: 0, height: 6.33 },
    elevation: 2,
  },

  /* ＋ Add Another Barter Deal — 229x51 r24 glass button. */
  addAnother: {
    position: "absolute",
    left: 73,
    width: 229,
    height: 51,
    borderRadius: 24,
    backgroundColor: GLASS_60,
    borderWidth: 1,
    borderColor: HAIRLINE_62,
    shadowColor: "#000000",
    shadowOpacity: 0.1,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },

  /* Addd — 161.5x51 r24 ink button. */
  cta: {
    position: "absolute",
    left: 106.75,
    width: 161.5,
    height: 51,
    borderRadius: 24,
    backgroundColor: CTA_BG,
    shadowColor: "#000000",
    shadowOpacity: 0.1,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },

  /* Field value — Inter 500 15, #111827. Absolute so the input sits exactly
     where the spec's TEXT node does. */
  input: {
    position: "absolute",
    padding: 0,
    paddingHorizontal: 0,
    fontFamily: fonts.interMedium,
    fontSize: 15,
    lineHeight: 18.15,
    color: LABEL_INK,
    textAlignVertical: "center",
    includeFontPadding: false,
  },
});
