import { Fragment, useState } from "react";
import { Pressable, StyleSheet, TextInput, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Svg, {
  Defs,
  LinearGradient as SvgLinear,
  RadialGradient,
  Rect,
  Stop,
} from "react-native-svg";
import { Abs, Ring, Screen, Txt } from "../../../src/ui/Frame";
import { colors } from "../../../src/theme";
import {
  inr,
  useContacts,
  useCreate,
  useLeadDeliverables,
  useLeads,
  useUpdate,
  useUsers,
} from "../../../src/api/hooks";
import type {
  DeliverableKind,
  DeliverablePlatform,
  LeadDeliverable,
} from "../../../src/api/hooks";

/**
 * Lead Detail — Select Deliverables. Figma 7348:19301 (375x875).
 *
 * The lead-detail base layer with the "Select your deliverables" bottom sheet
 * open over a 57% scrim: Select Platform, Choose Number of visits, three post
 * types each with a 01 stepper, and the Add CTA. The back chevron is dropped
 * from the header while the sheet is up — only the delete action remains.
 *
 * Platform switching follows legacy frame 633:11083, where YouTube swaps the
 * post-type column to Integrated Video / Dedicated Video / Shots.
 *
 * Coordinates are raw frame coordinates; <Screen> scales the 375pt canvas.
 */

/* ------------------------------- geometry -------------------------------- */
const FRAME_W = 375;
const FRAME_H = 875;

/** Frame 2147223255 — the scrolling body, clipped to 106..773. */
const BODY_Y = 106;
const BODY_H = 667;

/** Deliverable rows: icon at 857, next at 922 — a uniform 65pt step. */
const DELIVERABLE_FIRST_Y = 845;
const DELIVERABLE_STEP = 65;
const MAX_DELIVERABLES = 2; // the 305x117 List holds exactly two rows

/** Post-type / stepper rows inside the sheet step 68pt. */
const POST_STEP = 68;

/** Costs are not modelled server-side; the design's estimate is the literal. */
const COST_ESTIMATE = 15_000;

/* --------------------------- spec colour tokens --------------------------- */
const INK_TITLE = "#1D1D1F";
const INK_SUB = "#6E6E73";
const INK_META = "#8A8A8E";
const INK_SHEET_TITLE = "#111111";
const INK_FIELD = "#111827";
const INK_LABEL = "#6B7280";
const WHITE = "#FFFFFF";
const DARK = "#312B28";
const PAID_TINT = "rgba(193,63,186,0.1)";
const PAID_INK = "#C13FBA";
const STATUS_TINT = "rgba(55,118,242,0.1)";
const STATUS_INK = "#3776F2";
const CARD_WHITE = "#FFFFFF";
const SCRIM = "rgba(181,180,185,0.57)";
const REEL_TINT = "#FFF0F5";
const STORY_TINT = "#F3EBFF";
const STORY_INK = "#8A5AFE";
const PAYOUT_INK = "#2B9A57";

/* ------------------------------- platforms -------------------------------- */
type PlatformName = "Instagram" | "YouTube";

const PLATFORMS: Record<
  PlatformName,
  {
    icon: "instagram" | "youtube";
    posts: readonly [string, string, string];
    /** The server Platform enum member this column writes as. */
    value: DeliverablePlatform;
    /** The DeliverableKind behind each of the three post columns, in order. */
    kinds: readonly [DeliverableKind, DeliverableKind, DeliverableKind];
  }
> = {
  Instagram: {
    icon: "instagram",
    posts: ["Reel", "Post", "Story"],
    value: "INSTAGRAM",
    kinds: ["REEL", "POST", "STORY"],
  },
  YouTube: {
    icon: "youtube",
    posts: ["Integrated Video", "Dedicated Video", "Shots"],
    value: "YOUTUBE",
    kinds: ["INTEGRATED_VIDEO", "DEDICATED_VIDEO", "SHORT"],
  },
};

/* ------------------------------ derivations ------------------------------- */
/** Lead.money is authored as "300k" / "1.2L"; the design renders rupees. */
function parseMoney(raw?: string): number {
  const m = raw ? /^([\d.]+)\s*([kmlKML])?/.exec(raw) : null;
  if (!m) return 0;
  const n = Number(m[1]);
  const unit = (m[2] ?? "").toLowerCase();
  if (unit === "k") return n * 1_000;
  if (unit === "l") return n * 100_000;
  if (unit === "m") return n * 1_000_000;
  return n;
}

/** "₹1.2L" — the lakh shorthand on the hero card. */
const lakh = (n: number) => `₹${(n / 100_000).toFixed(1)}L`;

/** "CONTACTED" -> "Contacted", matching the design's chip casing. */
const title = (s: string) => s.charAt(0) + s.slice(1).toLowerCase();

/* ------------------------------ deliverables ------------------------------ */
interface DeliverableRow {
  label: string;
  note: string;
  tint: string;
  ink: string;
  icon: "video" | "instagram";
}

/**
 * The two rows the design ships. They stand in only while the lead has no saved
 * deliverables — the empty state exactly as Figma authored it. As soon as
 * /lead-deliverables returns rows for this lead, those replace them.
 */
const SEED_DELIVERABLES: DeliverableRow[] = [
  { label: "1 Reel", note: "Needs script", tint: REEL_TINT, ink: PAID_INK, icon: "video" },
  { label: "2 Stories", note: "Pending shoot", tint: STORY_TINT, ink: STORY_INK, icon: "instagram" },
];

/**
 * Kind -> the sheet column it was chosen from. A saved row is therefore drawn
 * with the same label and the same index-parity swatch the sheet's own Add
 * produced, so nothing about the list's appearance changes.
 */
const KIND_COLUMN: Partial<Record<DeliverableKind, { name: string; slot: number }>> = {
  REEL: { name: "Reel", slot: 0 },
  POST: { name: "Post", slot: 1 },
  STORY: { name: "Story", slot: 2 },
  INTEGRATED_VIDEO: { name: "Integrated Video", slot: 0 },
  DEDICATED_VIDEO: { name: "Dedicated Video", slot: 1 },
  SHORT: { name: "Shots", slot: 2 },
};

/** The alternating swatch the design gives consecutive deliverable rows. */
const styleOf = (slot: number) => ({
  tint: slot % 2 === 0 ? REEL_TINT : STORY_TINT,
  ink: slot % 2 === 0 ? PAID_INK : STORY_INK,
  icon: (slot % 2 === 0 ? "video" : "instagram") as DeliverableRow["icon"],
});

/* -------------------------------- backdrop -------------------------------- */
/** The frame fill: a warm vertical base plus four soft radial glows. */
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

/* --------------------------------- pieces --------------------------------- */
/** 44x44 white disc holding one of the hero card's contact actions. */
function ActionDisc({ x, icon }: { x: number; icon: "phone" | "message-circle" | "mail" }) {
  return (
    <>
      <Abs x={x} y={248} w={44} h={44} radius={22} bg={WHITE} style={styles.disc} />
      <Abs x={x + 12} y={260} w={20} h={20} center>
        <Feather name={icon} size={20} color={INK_TITLE} />
      </Abs>
    </>
  );
}

/** The 20x20 dropdown caret every sheet field carries (rotated 180° in Figma). */
function Caret({ x, y }: { x: number; y: number }) {
  return (
    <Abs x={x} y={y} w={20} h={20} center>
      <Feather name="chevron-down" size={20} color={INK_LABEL} />
    </Abs>
  );
}

/** 36x36 stepper key. The design puts plus on the left, minus on the right. */
function StepKey({
  x, y, sign, onPress,
}: { x: number; y: number; sign: "plus" | "minus"; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.stepKey, { left: x, top: y }, pressed && styles.pressed]}
    >
      <Feather name={sign} size={15} color={INK_LABEL} />
    </Pressable>
  );
}

/* --------------------------------- screen --------------------------------- */
export default function LeadDetailDeliverablesSheet() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();

  const { data: leads = [], isLoading } = useLeads();
  const { data: users = [] } = useUsers();
  const { data: contacts = [] } = useContacts();
  const { data: allDeliverables = [] } = useLeadDeliverables();

  const lead = leads.find((l) => l.id === id) ?? leads[0];
  const owner = users.find((u) => u.id === lead?.ownerId);
  const contact = contacts.find(
    (c) => c.name === lead?.contactPerson || c.company === lead?.brandName,
  );

  const budget = parseMoney(lead?.money);
  const email = contact?.email;
  const website = email?.split("@")[1];

  const createDeliverable = useCreate<LeadDeliverable>("lead-deliverables");
  const updateDeliverable = useUpdate<LeadDeliverable>("lead-deliverables");

  /* Everything already agreed on this lead. The list endpoint sorts createdAt
     desc, so `newest` is the row the last Add wrote. This is what seeds the
     whole sheet. */
  const saved = allDeliverables.filter((d) => d.leadId === lead?.id);
  const newest = saved[0];

  /* Sheet state. Every field is a draft laid over the saved row rather than a
     copy made by an effect: it shows the stored value the moment
     /lead-deliverables lands, and a failed save leaves the draft untouched so
     nothing the user chose is thrown away. */
  const [platformDraft, setPlatformDraft] = useState<PlatformName | null>(null);
  const [visitsDraft, setVisitsDraft] = useState<number | null>(null);
  const [countDraft, setCountDraft] = useState<Partial<Record<DeliverableKind, number>>>({});
  const [linkDraft, setLinkDraft] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [failed, setFailed] = useState(false);

  const platform: PlatformName =
    platformDraft ?? (newest?.platform === "YOUTUBE" ? "YouTube" : "Instagram");
  const visits = visitsDraft ?? newest?.visits ?? 1;

  const { posts, kinds } = PLATFORMS[platform];

  /** The lead's saved row for one of the three post columns, if it has one. */
  const rowFor = (kind: DeliverableKind) => saved.find((d) => d.kind === kind);

  /** The stored quantity where there is one, else the 01 the design opens on. */
  const countAt = (i: number) => countDraft[kinds[i]] ?? rowFor(kinds[i])?.quantity ?? 1;
  const counts: [number, number, number] = [countAt(0), countAt(1), countAt(2)];

  const link = linkDraft ?? newest?.link ?? "";

  const bump = (i: number, by: number) => {
    const kind = kinds[i];
    const current = counts[i];
    setCountDraft((d) => ({ ...d, [kind]: Math.max(0, (d[kind] ?? current) + by) }));
  };

  /**
   * Writes the sheet onto the lead. Each post column with a count is PATCHed
   * onto the lead's existing row of that kind, or POSTed as a new one — so
   * re-opening the sheet and confirming again edits rather than duplicates. A
   * column left at zero is simply not part of the deal; the sheet ships no
   * remove affordance, so nothing is ever deleted. On failure the sheet stays
   * up with every value intact and the message above the CTA explains why.
   */
  const save = async () => {
    if (!lead || saving) return;
    setSaving(true);
    setFailed(false);
    try {
      for (let i = 0; i < kinds.length; i += 1) {
        const kind = kinds[i];
        const quantity = counts[i];
        if (quantity <= 0) continue;
        const existing = rowFor(kind);
        if (existing) {
          await updateDeliverable.mutateAsync({
            id: existing.id,
            data: { platform: PLATFORMS[platform].value, quantity, visits },
          });
        } else {
          await createDeliverable.mutateAsync({
            leadId: lead.id,
            platform: PLATFORMS[platform].value,
            kind,
            quantity,
            visits,
            note: "Pending shoot",
          });
        }
      }
      router.back();
    } catch {
      setFailed(true);
    } finally {
      setSaving(false);
    }
  };

  /**
   * The deliverable link on the card behind the sheet. LeadDeliverable.link is
   * the only column that holds it, so it hangs off the most recent row — until
   * the lead has one there is nothing to attach it to and Submit is inert.
   */
  const submitLink = async () => {
    if (!newest || saving) return;
    setSaving(true);
    setFailed(false);
    try {
      await updateDeliverable.mutateAsync({ id: newest.id, data: { link } });
      setLinkDraft(null); // adopt the stored value now that it round-tripped
    } catch {
      setFailed(true);
    } finally {
      setSaving(false);
    }
  };

  /* Rows come from the lead's saved deliverables, oldest first so the list
     reads in the order it was agreed. */
  const savedRows = saved
    .slice()
    .reverse()
    .flatMap<DeliverableRow>((d) => {
      const column = KIND_COLUMN[d.kind];
      return column
        ? [{ label: `${d.quantity} ${column.name}`, note: d.note ?? "Pending shoot", ...styleOf(column.slot) }]
        : [];
    });
  const rows = savedRows.length > 0 ? savedRows : SEED_DELIVERABLES;

  /* The List is a fixed 117pt box: show the two most recent rows. */
  const visible = rows.slice(-MAX_DELIVERABLES);

  return (
    <Screen height={FRAME_H} background="#F7F0E4" scroll>
      <Backdrop />

      {/* ------------------------------- Header ------------------------------ */}
      <Txt
        x={15}
        y={30}
        w={235}
        size={16}
        weight="bold"
        font="inter"
        color={INK_TITLE}
        lineHeight={19.36}
        align="center"
      >
        {"Lead Detail "}
      </Txt>
      <Pressable
        onPress={() => router.back()}
        style={({ pressed }) => [styles.headerAction, pressed && styles.pressed]}
      >
        <Feather name="trash-2" size={20} color="#E74C3C" />
      </Pressable>

      {/* ------------------- Body (Frame 2147223255, clipped) ---------------- */}
      <Abs x={0} y={BODY_Y} w={FRAME_W} h={BODY_H} style={styles.clip}>
        <View style={styles.bodyCanvas}>
          {/* ---------------------------- Hero card -------------------------- */}
          <LinearGradient
            colors={[
              "rgba(255,229,164,0.82)",
              "rgba(255,245,228,0.92)",
              "rgba(244,211,238,0.88)",
              "rgba(202,217,255,0.76)",
            ] as const}
            locations={[0, 0.35, 0.72, 1]}
            start={{ x: 0.11, y: -0.21 }}
            end={{ x: 0.89, y: 1.21 }}
            style={styles.heroCard}
          />
          <Txt
            x={39}
            y={135}
            w={156.14}
            size={24}
            weight="bold"
            font="inter"
            color={INK_TITLE}
            lineHeight={29.04}
            numberOfLines={1}
          >
            {lead?.contactPerson ?? lead?.brandName ?? (isLoading ? "" : "Priya Sharma")}
          </Txt>
          <Txt
            x={39}
            y={168}
            w={156.14}
            size={14}
            weight="medium"
            font="inter"
            color={INK_SUB}
            lineHeight={16.94}
            numberOfLines={1}
          >
            {lead?.brandName ?? (isLoading ? "" : "Zostel Trip")}
          </Txt>
          {/* The design's row is SPACE_BETWEEN inside 39..336, so the amount is
              anchored to its right edge rather than to the 45.58pt "₹1.2L" hugs
              — a wider live figure grows leftwards instead of ellipsing. */}
          <Txt
            x={200}
            y={135}
            w={136}
            size={18}
            weight="bold"
            font="inter"
            color={INK_TITLE}
            lineHeight={21.78}
            align="right"
            numberOfLines={1}
          >
            {budget ? lakh(budget) : "₹1.2L"}
          </Txt>

          {/* Both chips hug their label — 12pt of padding either side and an 8pt
              gap, which reproduces the spec's 49.17 / 84.38 boxes for "Paid" and
              "Contacted" while letting any other deal type or status fit. */}
          <Abs x={39} y={197} h={27} row gap={8}>
            <View style={[styles.chip, { backgroundColor: PAID_TINT }]}>
              <Txt size={12} weight="semibold" font="inter" color={PAID_INK} lineHeight={14.52}>
                {lead ? title(lead.dealType ?? "PAID") : "Paid"}
              </Txt>
            </View>
            <View style={[styles.chip, { backgroundColor: STATUS_TINT }]}>
              <Txt size={12} weight="semibold" font="inter" color={STATUS_INK} lineHeight={14.52}>
                {lead ? title(lead.status) : "Contacted"}
              </Txt>
            </View>
          </Abs>

          <ActionDisc x={39} icon="phone" />
          <ActionDisc x={95} icon="message-circle" />
          <ActionDisc x={151} icon="mail" />

          {/* ----------------------------- Tab pill -------------------------- */}
          <Abs
            x={15}
            y={331}
            w={345}
            h={51}
            radius={999}
            bg="rgba(255,255,255,0.65)"
            border="rgba(255,255,255,0.9)"
            borderWidth={1}
          />
          <Abs x={20} y={336} w={167.5} h={41} radius={999} bg="rgba(255,255,255,0.9)" style={styles.tabActive} />
          <Txt
            x={72.39}
            y={348}
            w={62.72}
            size={14}
            weight="semibold"
            font="inter"
            color="#1C1C1E"
            lineHeight={16.94}
            align="center"
          >
            Lead Info
          </Txt>
          <Txt
            x={217.07}
            y={348}
            w={108.36}
            size={14}
            weight="semibold"
            font="inter"
            color="#6C6C70"
            lineHeight={16.94}
            align="center"
          >
            Notes & Activity
          </Txt>

          {/* --------------------------- Managed by -------------------------- */}
          <Abs
            x={15}
            y={397}
            w={345}
            h={60}
            radius={20}
            bg="rgba(255,255,255,0.6)"
            border="rgba(255,255,255,0.61)"
            borderWidth={1}
          />
          <Txt
            x={35}
            y={418.5}
            w={82.83}
            size={14}
            weight="medium"
            font="inter"
            color={INK_META}
            lineHeight={16.94}
          >
            Managed by
          </Txt>
          <Ring x={138.29} y={415} size={24} colorA="#F2F2F7" colorB="#C4C4C4" />
          <Txt
            x={170.29}
            y={418.5}
            w={81.25}
            size={14}
            weight="semibold"
            font="inter"
            color={INK_TITLE}
            lineHeight={16.94}
            numberOfLines={1}
          >
            {owner?.name ?? (isLoading ? "" : "Sunil Kumar")}
          </Txt>
          <Abs x={263.54} y={413} w={28} h={28} radius={14} bg="#F4F4F6" />
          <Abs x={270.54} y={420} w={14} h={14} center>
            <Feather name="phone" size={14} color={INK_TITLE} />
          </Abs>
          <Abs x={312} y={413} w={28} h={28} center>
            <MaterialCommunityIcons name="whatsapp" size={28} color="#25D366" />
          </Abs>

          {/* -------------------------- Contact chips ------------------------ */}
          <Abs x={15} y={473} w={166} h={32} radius={16} bg={WHITE} />
          <Abs x={31} y={481} w={16} h={16} center>
            <Feather name="mail" size={16} color={INK_META} />
          </Abs>
          <Txt
            x={53}
            y={481}
            w={111.95}
            size={13}
            weight="medium"
            font="inter"
            color={INK_TITLE}
            lineHeight={15.73}
            align="center"
            numberOfLines={1}
          >
            {email ?? (isLoading ? "" : "priya@zostel.com")}
          </Txt>
          <Abs x={203} y={473} w={157} h={32} radius={16} bg={WHITE} />
          <Abs x={219} y={481} w={16} h={16} center>
            <Feather name="globe" size={16} color={INK_META} />
          </Abs>
          <Txt
            x={241}
            y={481}
            w={67.97}
            size={13}
            weight="medium"
            font="inter"
            color={INK_TITLE}
            lineHeight={15.73}
            align="center"
            numberOfLines={1}
          >
            {website ?? (isLoading ? "" : "zostel.com")}
          </Txt>

          {/* -------------------------- Brand Message ------------------------ */}
          <Abs x={15} y={517} w={345} h={168} radius={20} bg={CARD_WHITE} />
          <Txt
            x={35}
            y={549}
            w={120.2}
            size={16}
            weight="semibold"
            font="inter"
            color={INK_TITLE}
            lineHeight={19.36}
          >
            Brand Message
          </Txt>
          <Abs x={320} y={549} w={20} h={20} center>
            <Feather name="chevron-up" size={20} color={INK_META} />
          </Abs>
          <Txt x={35} y={581} w={305} size={14} font="inter" color={INK_SUB} lineHeight={21}>
            {
              '"Hi Sophia! We\'re planning a winter\ncampaign for our new Manali property and\nwould love to collaborate. We are looking for\nauthentic experiences..."'
            }
          </Txt>

          {/* ------------------------ Script & References -------------------- */}
          <Abs x={15} y={697} w={345} h={64} radius={20} bg={CARD_WHITE} />
          <Txt
            x={35}
            y={721}
            w={152.48}
            size={16}
            weight="semibold"
            font="inter"
            color={INK_TITLE}
            lineHeight={19.36}
          >
            Script & References
          </Txt>
          <Abs x={320} y={721} w={20} h={20} center>
            <Feather name="chevron-right" size={20} color={INK_META} />
          </Abs>

          {/* --------------------------- Deliverables ------------------------ */}
          <Abs x={15} y={773} w={345} h={277} radius={20} bg={CARD_WHITE} />
          <Txt
            x={35}
            y={803}
            w={95.77}
            size={16}
            weight="semibold"
            font="inter"
            color={INK_TITLE}
            lineHeight={19.36}
          >
            Deliverables
          </Txt>
          <Abs x={308} y={797} w={32} h={32} radius={16} bg="#F4F4F6" />
          <Abs x={317.34} y={806.34} w={13.33} h={13.33} center>
            <Feather name="plus" size={13} color={INK_TITLE} />
          </Abs>

          {visible.map((d, i) => {
            const step = i * DELIVERABLE_STEP;
            return (
              <Fragment key={`${d.label}-${i}`}>
                {i < visible.length - 1 ? (
                  <Abs
                    x={35}
                    y={DELIVERABLE_FIRST_Y + step + 64}
                    w={305}
                    h={1}
                    bg="#F2F2F7"
                  />
                ) : null}
                <Abs x={35} y={857 + step} w={40} h={40} radius={12} bg={d.tint} />
                <Abs x={45} y={867 + step} w={20} h={20} center>
                  <Feather name={d.icon} size={20} color={d.ink} />
                </Abs>
                <Txt
                  x={87}
                  y={859 + step}
                  w={253}
                  size={15}
                  weight="semibold"
                  font="inter"
                  color={INK_TITLE}
                  lineHeight={18.15}
                  numberOfLines={1}
                >
                  {d.label}
                </Txt>
                <Txt
                  x={87}
                  y={879 + step}
                  w={253}
                  size={13}
                  font="inter"
                  color={INK_META}
                  lineHeight={15.73}
                  numberOfLines={1}
                >
                  {d.note}
                </Txt>
              </Fragment>
            );
          })}

          <Abs x={35} y={978} w={305} h={52} radius={16} bg="#F9F9F9" />
          <TextInput
            value={link}
            onChangeText={setLinkDraft}
            placeholder="Add deliverable link..."
            placeholderTextColor="#757575"
            style={styles.linkInput}
          />
          <Pressable
            onPress={() => void submitLink()}
            disabled={saving || !newest}
            style={({ pressed }) => [styles.submit, pressed && styles.pressed, saving && styles.busy]}
          >
            <Txt size={13} weight="semibold" font="inter" color={WHITE} lineHeight={15.73} align="center">
              Submit
            </Txt>
          </Pressable>

          {/* ----------------------------- Add-ons --------------------------- */}
          <Txt
            x={35}
            y={1066}
            w={325}
            size={14}
            weight="semibold"
            font="inter"
            color={INK_META}
            lineHeight={16.94}
            letterSpacing={0.5}
          >
            ADD-ONS
          </Txt>

          <Abs x={30} y={1095} w={151.5} h={101} radius={20} bg={CARD_WHITE} />
          <Abs x={46} y={1111} w={40} h={40} radius={12} bg="#F4F4F6" />
          <Abs x={56} y={1121} w={20} h={20} center>
            <Feather name="video" size={20} color={INK_TITLE} />
          </Abs>
          <Abs x={145.5} y={1111} w={20} h={20} center>
            <Feather name="plus-circle" size={20} color={INK_META} />
          </Abs>
          <Txt
            x={46}
            y={1163}
            w={119.5}
            size={14}
            weight="semibold"
            font="inter"
            color={INK_TITLE}
            lineHeight={16.94}
          >
            Videographer
          </Txt>

          <Abs x={193.5} y={1095} w={151.5} h={101} radius={20} bg={CARD_WHITE} />
          <Abs x={209.5} y={1111} w={40} h={40} radius={12} bg="#F4F4F6" />
          <Abs x={219.5} y={1121} w={20} h={20} center>
            <Feather name="scissors" size={20} color={INK_TITLE} />
          </Abs>
          <Abs x={309} y={1111} w={20} h={20} center>
            <Feather name="plus-circle" size={20} color={INK_META} />
          </Abs>
          <Txt
            x={209.5}
            y={1163}
            w={119.5}
            size={14}
            weight="semibold"
            font="inter"
            color={INK_TITLE}
            lineHeight={16.94}
          >
            Editor
          </Txt>

          {/* ------------------------- Payment Summary ----------------------- */}
          <Abs x={15} y={1208} w={345} h={202} radius={20} bg={CARD_WHITE} />
          <Txt
            x={35}
            y={1240}
            w={305}
            size={16}
            weight="semibold"
            font="inter"
            color={INK_TITLE}
            lineHeight={19.36}
          >
            Payment Summary
          </Txt>
          <Txt
            x={35}
            y={1279}
            w={91.25}
            size={14}
            weight="medium"
            font="inter"
            color={INK_TITLE}
            lineHeight={16.94}
          >
            Brand Budget
          </Txt>
          <Txt
            x={273.94}
            y={1279}
            w={66.06}
            size={14}
            weight="medium"
            font="inter"
            color={INK_TITLE}
            lineHeight={16.94}
            numberOfLines={1}
          >
            {`₹${inr(budget)}`}
          </Txt>
          <Txt
            x={35}
            y={1312}
            w={77.5}
            size={14}
            weight="medium"
            font="inter"
            color={INK_SUB}
            lineHeight={21}
          >
            Costs (Est.)
          </Txt>
          <Txt
            x={280.92}
            y={1312}
            w={59.08}
            size={14}
            weight="medium"
            font="inter"
            color={INK_SUB}
            lineHeight={21}
            numberOfLines={1}
          >
            {`-₹${inr(COST_ESTIMATE)}`}
          </Txt>
          <Abs x={35} y={1349} w={305} h={1} bg="#F2F2F7" />
          <Txt
            x={35}
            y={1368}
            w={94.2}
            size={16}
            weight="semibold"
            font="inter"
            color={INK_TITLE}
            lineHeight={19.36}
          >
            Final Payout
          </Txt>
          <Txt
            x={241.81}
            y={1366}
            w={98.19}
            size={20}
            weight="bold"
            font="inter"
            color={PAYOUT_INK}
            lineHeight={24.2}
            numberOfLines={1}
          >
            {`₹${inr(Math.max(0, budget - COST_ESTIMATE))}`}
          </Txt>
        </View>
      </Abs>

      {/* --------------------------- Bottom actions -------------------------- */}
      <Abs x={0} y={776} w={FRAME_W} h={99} bg="rgba(246,239,233,0.85)" />
      <Abs
        x={20}
        y={792}
        w={161.5}
        h={51}
        radius={24}
        bg="rgba(255,255,255,0.6)"
        border="rgba(255,255,255,0.62)"
        borderWidth={1}
        style={styles.actionButton}
      />
      <Txt
        x={68.25}
        y={809}
        w={66}
        size={14}
        weight="medium"
        font="inter"
        color="#1F1A17"
        lineHeight={16.94}
        align="center"
      >
        Follow Up
      </Txt>
      <Abs x={193.5} y={792} w={161.5} h={51} radius={24} bg={DARK} style={styles.actionButton} />
      <Txt
        x={220.25}
        y={809}
        w={109}
        size={14}
        weight="medium"
        font="inter"
        color={WHITE}
        lineHeight={16.94}
        align="center"
      >
        Mark Converted
      </Txt>

      {/* ------------------------------- Scrim ------------------------------- */}
      <Pressable onPress={() => router.back()} style={styles.scrim} />

      {/* ---------------------- Select your deliverables --------------------- */}
      {/* Absorbs taps so only the exposed scrim dismisses. */}
      <View style={styles.sheet} onStartShouldSetResponder={() => true} />
      <Abs x={167.5} y={267} w={40} h={4} radius={2} bg="#E5E5E5" />
      <Txt
        x={24}
        y={295}
        w={280}
        size={24}
        weight="semibold"
        font="inter"
        color={INK_SHEET_TITLE}
        lineHeight={29.05}
        letterSpacing={-0.52}
      >
        Select your deliverables
      </Txt>
      <Pressable
        onPress={() => router.back()}
        style={({ pressed }) => [styles.sheetClose, pressed && styles.pressed]}
      >
        <Feather name="x" size={20} color="#555555" />
      </Pressable>

      {/* Select Platform */}
      <Txt
        x={28}
        y={357}
        w={323}
        size={14}
        weight="medium"
        font="inter"
        color={INK_LABEL}
        lineHeight={16.94}
      >
        Select Platform
      </Txt>
      <Pressable
        onPress={() => setPlatformDraft(platform === "Instagram" ? "YouTube" : "Instagram")}
        style={({ pressed }) => [styles.field, styles.platformField, pressed && styles.pressed]}
      >
        <View style={[styles.fieldFill, styles.platformBorder]} />
      </Pressable>
      <Abs x={45} y={398} w={20} h={20} center>
        <MaterialCommunityIcons name={PLATFORMS[platform].icon} size={20} color="#000000" />
      </Abs>
      {/* The spec centres the platform name in its 78pt slot, which is what puts
          the gap between it and the 20pt mark at 45. */}
      <Txt
        x={65}
        y={400}
        w={78}
        size={14}
        weight="medium"
        font="inter"
        color="#000000"
        lineHeight={16}
        align="center"
      >
        {platform}
      </Txt>
      <Caret x={311} y={398} />

      {/* Choose Number of visits */}
      <Txt
        x={28}
        y={452}
        w={323}
        size={14}
        weight="medium"
        font="inter"
        color={INK_LABEL}
        lineHeight={16.94}
      >
        Choose Number of visits
      </Txt>
      <Pressable
        onPress={() => setVisitsDraft(visits >= 9 ? 1 : visits + 1)}
        style={({ pressed }) => [styles.field, styles.visitsField, pressed && styles.pressed]}
      >
        <View style={styles.fieldFill} />
      </Pressable>
      <Txt x={45} y={494} w={268} size={15} weight="medium" font="inter" color={INK_FIELD} lineHeight={18.15}>
        {String(visits)}
      </Txt>
      <Caret x={313} y={493} />

      {/* Choose Post / Select Number */}
      <Txt
        x={28}
        y={547}
        w={150}
        size={14}
        weight="medium"
        font="inter"
        color={INK_LABEL}
        lineHeight={16.94}
      >
        Choose Post
      </Txt>
      <Txt
        x={201}
        y={547}
        w={150}
        size={14}
        weight="medium"
        font="inter"
        color={INK_LABEL}
        lineHeight={16.94}
      >
        Select Number
      </Txt>
      {posts.map((name, i) => {
        const step = i * POST_STEP;
        return (
          <Fragment key={name}>
            <Abs x={24} y={572 + step} w={154} h={52} radius={20} style={styles.fieldBox} />
            <Txt
              x={45}
              y={589 + step}
              w={99}
              size={15}
              weight="medium"
              font="inter"
              color={INK_FIELD}
              lineHeight={18.15}
              numberOfLines={1}
            >
              {name}
            </Txt>
            <Caret x={144} y={588 + step} />

            <Abs x={197} y={572 + step} w={154} h={52} radius={20} style={styles.fieldBox} />
            <StepKey x={208} y={580 + step} sign="plus" onPress={() => bump(i, 1)} />
            <Txt
              x={253}
              y={589 + step}
              w={43}
              size={15}
              weight="medium"
              font="inter"
              color={INK_FIELD}
              lineHeight={18.15}
            >
              {String(counts[i]).padStart(2, "0")}
            </Txt>
            <StepKey x={305} y={580 + step} sign="minus" onPress={() => bump(i, -1)} />
          </Fragment>
        );
      })}

      {/* Save failed — the retry is the CTA itself and every chosen value is
          still in state, so this sits in the 32.72pt gap the spec leaves between
          the last post row (bottom 760) and the Add button (top 792.72).
          Nothing moves, and it is absent unless a write actually failed. */}
      {failed ? (
        <Txt
          x={37}
          y={768}
          w={301}
          size={12}
          weight="medium"
          font="inter"
          color={colors.danger}
          lineHeight={15}
          numberOfLines={1}
          align="center"
        >
          Could not save these deliverables. Tap Add to try again.
        </Txt>
      ) : null}

      {/* Add */}
      <Pressable
        onPress={() => void save()}
        disabled={saving}
        style={({ pressed }) => [styles.addButton, pressed && styles.pressed, saving && styles.busy]}
      >
        <Txt size={16} weight="bold" font="inter" color={WHITE} lineHeight={19.36} align="center">
          Add
        </Txt>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  backdrop: { position: "absolute", left: 0, top: 0 },
  pressed: { opacity: 0.9 },
  /** In-flight only — the design's own opacity is restored the moment it lands. */
  busy: { opacity: 0.5 },

  headerAction: {
    position: "absolute",
    left: 320,
    top: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.65)",
    borderWidth: 0.91,
    borderColor: "rgba(255,255,255,0.9)",
    shadowColor: "#000000",
    shadowOpacity: 0.03,
    shadowRadius: 10.91,
    shadowOffset: { width: 0, height: 3.64 },
  },

  clip: { overflow: "hidden" },
  /** Sits at -BODY_Y inside the clip so children keep raw frame coordinates. */
  bodyCanvas: { position: "absolute", left: 0, top: -BODY_Y, width: FRAME_W, height: 1410 },

  heroCard: {
    position: "absolute",
    left: 15,
    top: 111,
    width: 345,
    height: 205,
    borderRadius: 24,
    shadowColor: "#000000",
    shadowOpacity: 0.02,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 4 },
    elevation: 1,
  },
  /** Deal-type / status pill: 12pt padding either side of a 27pt-tall label. */
  chip: {
    height: 27,
    borderRadius: 12,
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  disc: {
    shadowColor: "#000000",
    shadowOpacity: 0.04,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  tabActive: {
    shadowColor: "#000000",
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },

  linkInput: {
    position: "absolute",
    left: 51,
    top: 988,
    width: 185,
    height: 36,
    padding: 0,
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: "#1D1D1F",
  },
  submit: {
    position: "absolute",
    left: 246,
    top: 988,
    width: 84.23,
    height: 36,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#312B28",
  },

  actionButton: {
    shadowColor: "#000000",
    shadowOpacity: 0.1,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },

  scrim: {
    position: "absolute",
    left: 0,
    top: -1,
    width: FRAME_W,
    height: 876,
    backgroundColor: SCRIM,
  },
  sheet: {
    position: "absolute",
    left: 0,
    top: 251,
    width: FRAME_W,
    height: 624,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    shadowColor: "#000000",
    shadowOpacity: 0.08,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: -8 },
    elevation: 12,
  },
  sheetClose: {
    position: "absolute",
    left: 315,
    top: 295,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F8F8F8",
  },

  /** The 52pt select box every sheet field shares. */
  fieldBox: {
    backgroundColor: "rgba(255,255,255,0.8)",
    borderWidth: 1,
    borderColor: "#E5E5E5",
    shadowColor: "#000000",
    shadowOpacity: 0.02,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 1,
  },
  field: { position: "absolute", height: 52 },
  fieldFill: {
    width: "100%",
    height: "100%",
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.8)",
    borderWidth: 1,
    borderColor: "#E5E5E5",
  },
  platformField: { left: 24, top: 382, width: 327 },
  platformBorder: { borderColor: "#E8E8E8" },
  visitsField: { left: 24, top: 477, width: 327 },

  stepKey: {
    position: "absolute",
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E3E3E3",
    shadowColor: "#000000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },

  addButton: {
    position: "absolute",
    left: 37,
    top: 792.72,
    width: 301,
    height: 55,
    borderRadius: 100,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#312B28",
  },
});
