import { useMemo, useState } from "react";
import type { ComponentProps, ReactNode } from "react";
import { Pressable, ScrollView, TextInput, View } from "react-native";
import type { KeyboardTypeOptions } from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { Abs, Screen, Txt } from "../../../src/ui/Frame";
import { fonts } from "../../../src/theme";
import { compact, useCreate, useCreators, useMe } from "../../../src/api/hooks";
import type { Lead } from "../../../src/api/hooks";

/**
 * Add Lead — Figma frame 7695:7684 (375x876), traced 1:1.
 *
 * The agency's lead-intake form: header (0,0 375x80), a CAMPAIGN TYPE segmented
 * control, PLATFORMS and NICHE chip rows on the page wash, a white brand card
 * (24,379 327 wide, r28) holding the five brand fields + the money block +
 * NO. OF INFLUENCERS + DELIVERABLES PER CREATOR, a second card (24,1234 327x409)
 * holding CITIES / GENDER / LANGUAGE / AGE RANGE, then PRIORITY and the
 * SUBMISSION DEADLINE day strip, and the dark "Add Lead" CTA (327x54.5, r999).
 *
 * CONDITIONAL MONEY BLOCK. Figma ships the two campaign types as sibling frames
 * that differ in exactly one place: 7695:7684 (this one) draws "Barter Vallue" +
 * "agency Fee", 7695:8012 draws a single "CAMPAIGN BUDGET". Both are one screen
 * with one segmented control, so the pair is built here as a 112pt field row
 * that appears under BARTER and folds away under PAID (`extra`).
 *
 * Geometry note: 7695:8012 is the internally consistent frame — 20pt card
 * padding, 20pt field gap, 24pt section gap, every container sized to its
 * content. 7695:7684 carries the same tail 92pt higher while its brand card
 * gained a 112pt row, so the card's declared 739 height is 204 short of its own
 * children and the second card lands on top of them. The one defective number is
 * that height, so the tail rides on the paid frame's coordinates + 112 — which
 * reproduces every y this frame states for the block that actually moved
 * (influencers 1104, deliverables 1216) and puts card two back at 1346, 24pt
 * below a card that now ends where its content does.
 *
 * The frame pins the header at 0-80 and the CTA at y=782 over a scroll region
 * clipped to 617pt. Here the canvas scrolls as one — the convention every other
 * traced screen follows — so the CTA keeps its 24/327/54.5 geometry at the foot
 * of the form instead of floating over the middle of it.
 *
 * Wiring:
 *  - The chip rows are the values this lead is being filed under. Tapping a chip
 *    drops it; "+ Add" appends the next value the data offers — Creator.niche and
 *    Creator.location for NICHE and CITIES (free-text columns, so the roster is
 *    the only source of truth), and the Prisma `Platform` enum for PLATFORMS.
 *    The frame's own chips are the initial selection.
 *  - The day strip is derived from the device clock, five days out, with the
 *    third tile pre-selected as the frame draws it.
 *  - Submit is POST /leads: brandName, contactPerson, dealType, peopleCount,
 *    intent (PRIORITY maps onto the LeadIntent enum), money (the barter value or
 *    the campaign budget, formatted the way the pipeline prints it — "500k") and
 *    channel (the chosen platforms). The lead is owned by whoever files it.
 *  - Website, email, phone, agency fee, deliverables, niches, cities, gender,
 *    language, age range and the deadline have no column on Lead, so they stay
 *    in the form rather than being smuggled into a field that means something
 *    else. They post the day the model carries them.
 *
 * The label reads "Barter Vallue" / "agency Fee" in this frame (the legacy
 * frames 843:3306 and 4100:60575 spell it "Barter value" / "Agency fee"); the
 * spec's characters are reproduced verbatim. Geist is not registered in
 * app/_layout.tsx, so the heading renders in Inter, the frame's body face. The
 * exported vectors carry no fill, so field icons take the frame's muted ink.
 *
 * Coordinates below are raw frame coordinates; <Screen> scales the 375pt canvas.
 */

/* ------------------------------- geometry -------------------------------- */
const FRAME_W = 375;

/** BARTER adds one 112pt field row (Barter Vallue + agency Fee vs one budget). */
const BARTER_EXTRA = 112;

/** Brand card — grows by that row; PAID height straight from 7695:8012. */
const CARD1 = { x: 24, y: 379, w: 327, h: 831 };
/** Targeting card — 1234 under PAID, 1346 under BARTER. */
const CARD2 = { x: 24, y: 1234, w: 327, h: 409 };

/** Field label rows inside the brand card (label y; the box sits 25 below). */
const F_BRAND = 400;
const F_WEBSITE = 496;
const F_EMAIL = 592;
const F_CONTACT = 688;
const F_PHONE = 784;
const F_MONEY = 880;
/** Second money row — BARTER only. */
const F_FEE = 992;
/** Below the money block, so both shift with `extra`. */
const F_INFLUENCERS = 992;
const F_DELIVERABLES = 1104;

/** Targeting card rows (paid base). */
const L_CITIES = 1255;
const R_CITIES = 1284;
const L_GENDER = 1336;
const R_GENDER = 1365;
const L_LANGUAGE = 1425;
const L_AGE = 1521;
const R_AGE = 1550;

const L_PRIORITY = 1667;
const R_PRIORITY = 1696;
const L_DEADLINE = 1760;
const R_DEADLINE = 1789;

/** Foot of the form (deadline strip ends 1853.75) + the frame's 24pt gap. */
const CTA_Y = 1878;
const FRAME_H = 1957;

/* ------------------------------ spec colours ------------------------------ */
const PAGE = "#f8f5ef";
const HEAD_INK = "#141311";
const BACK_BG = "#1f1a17";
const BACK_ICON = "#faf7f2";
const DARK = "#312b28";
const LABEL_INK = "#888888";
const IDLE_INK = "#555555";
const MUTED = "#aaaaaa";
const PLACEHOLDER = "#bbbbbb";
const INPUT_INK = "#141311";
const CARD_BG = "#ffffff";
const CARD_LINE = "rgba(0,0,0,0.03)";
const FIELD_BG = "#f8f9fa";
const FIELD_LINE = "#efefef";
const PILL_LINE = "#eaeaea";
const GHOST_LINE = "#dddddd";
const WHITE = "#ffffff";
const ON_DARK_SOFT = "rgba(255,255,255,0.6)";

/* -------------------------------- shadows --------------------------------- */
const CARD1_SHADOW = {
  shadowColor: "#000000", shadowOpacity: 0.04, shadowRadius: 32,
  shadowOffset: { width: 0, height: 12 }, elevation: 2,
} as const;
const CARD2_SHADOW = {
  shadowColor: "#000000", shadowOpacity: 0.03, shadowRadius: 24,
  shadowOffset: { width: 0, height: 8 }, elevation: 2,
} as const;
/** Unselected pill: 0/2/8 @2%. Selected: 0/4/12 @12%. */
const IDLE_SHADOW = {
  shadowColor: "#000000", shadowOpacity: 0.02, shadowRadius: 8,
  shadowOffset: { width: 0, height: 2 }, elevation: 1,
} as const;
const ON_SHADOW = {
  shadowColor: "#000000", shadowOpacity: 0.12, shadowRadius: 12,
  shadowOffset: { width: 0, height: 4 }, elevation: 3,
} as const;
const CTA_SHADOW = {
  shadowColor: "#000000", shadowOpacity: 0.15, shadowRadius: 24,
  shadowOffset: { width: 0, height: 8 }, elevation: 6,
} as const;
const BACK_SHADOW = {
  shadowColor: "#000000", shadowOpacity: 0.1, shadowRadius: 2.7,
  shadowOffset: { width: 0, height: 0.9 }, elevation: 2,
} as const;

/* -------------------------------- taxonomy -------------------------------- */
type Icon = ComponentProps<typeof Feather>["name"];

/** Chip tints, each a fill + hairline + ink triple lifted from the frame. */
const BLUE = { bg: "#edf2f6", line: "rgba(168,199,244,0.3)", ink: "#3a5c7e" };
const VIOLET = { bg: "#f5f0fa", line: "rgba(197,168,244,0.3)", ink: "#6a3a7e" };
const CREAM = { bg: "#fef9ee", line: "#f4e4bc", ink: "#7e5c2a" };
const GREEN = { bg: "#f0f5f1", line: "#c5dec5", ink: "#3e5c45" };
const PLUM = { bg: "#f5f0fa", line: "#ddd4ef", ink: "#6a3a7e" };
const PLATFORM_TINTS = [BLUE, VIOLET];
const NICHE_TINTS = [CREAM, GREEN, PLUM];
/** Cities chip — fill and ink only, the frame draws no hairline on it. */
const CITY_TINT = { bg: "#edf2f6", line: "", ink: "#3a5c7e" };

/** Prisma `Platform` — the closed set the chip row can offer. */
const PLATFORMS: { value: string; label: string; icon: Icon }[] = [
  { value: "INSTAGRAM", label: "Instagram", icon: "instagram" },
  { value: "YOUTUBE", label: "YouTube", icon: "youtube" },
  { value: "TIKTOK", label: "TikTok", icon: "globe" },
];
const platformIcon = (label: string): Icon =>
  PLATFORMS.find((p) => p.label === label)?.icon ?? "globe";

const GENDERS = [
  { label: "Female", x: 45, w: 88.33 },
  { label: "Male", x: 141.33, w: 90.33 },
  { label: "All", x: 239.67, w: 90.33 },
] as const;

const AGES = ["13–17", "18–24", "25–34", "35–44", "45+"] as const;

/**
 * PRIORITY carries its own tint per option; the frame only draws Medium
 * selected, so Low reuses the hairline's paired fill from the NICHE row and
 * High's (#f4bcbc -> #fdf2f2) is derived on the same recipe.
 */
const PRIORITIES = [
  { label: "Low", x: 24, line: "#c5dec5", ink: "#3e5c45", on: "#f0f5f1", value: "LOW" },
  { label: "Medium", x: 135.67, line: "#f4e4bc", ink: "#7e5c2a", on: "#fef9ee", value: "MEDIUM" },
  { label: "High", x: 247.33, line: "#f4bcbc", ink: "#7e3a3a", on: "#fdf2f2", value: "HIGH" },
] as const;

const WEEKDAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

/* -------------------------------- helpers --------------------------------- */
const addDays = (base: Date, n: number) => {
  const d = new Date(base);
  d.setDate(d.getDate() + n);
  return d;
};
const sameDay = (a: Date, b: Date) => a.toDateString() === b.toDateString();

const distinct = (xs: (string | undefined)[]) =>
  Array.from(new Set(xs.filter((x): x is string => !!x && x.length > 0)));

/** "50,000" / "₹50000" -> 50000. */
const amount = (s: string) => Number(s.replace(/[^0-9.]/g, "")) || 0;

/* ------------------------------- primitives ------------------------------- */
/** Section label — 11pt Inter 600 #888888 on 1.1 tracking. */
const Label = ({ x, y, w, children }: { x: number; y: number; w: number; children: string }) => (
  <Txt x={x} y={y} w={w} size={11} weight="semibold" font="inter" color={LABEL_INK} lineHeight={16.5} letterSpacing={1.1}>
    {children}
  </Txt>
);

/** One 51pt input: label, #f8f9fa r18 box, optional 15pt icon, the text itself. */
function Field({
  labelY, label, icon, placeholder, value, onChange, keyboard, caps,
}: {
  labelY: number; label: string; icon?: Icon; placeholder: string;
  value: string; onChange: (v: string) => void;
  keyboard?: KeyboardTypeOptions; caps?: "none" | "words";
}) {
  const boxY = labelY + 25;
  return (
    <View>
      <Label x={45} y={labelY} w={285}>{label}</Label>
      <Abs x={45} y={boxY} w={285} h={51} radius={18} bg={FIELD_BG} border={FIELD_LINE} borderWidth={1} />
      {icon ? (
        <Abs x={62} y={boxY + 18} w={15} h={15} center>
          <Feather name={icon} size={15} color={MUTED} />
        </Abs>
      ) : null}
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={PLACEHOLDER}
        keyboardType={keyboard}
        autoCapitalize={caps}
        style={{
          position: "absolute", left: icon ? 89 : 62, top: boxY + 15,
          width: icon ? 224 : 253, height: 21, padding: 0,
          fontFamily: fonts.interMedium, fontSize: 14, color: INPUT_INK,
        }}
      />
    </View>
  );
}

/** Money input — the ₹ takes the icon slot, 8pt ahead of the amount. */
function MoneyField({
  labelY, label, value, onChange,
}: {
  labelY: number; label: string; value: string; onChange: (v: string) => void;
}) {
  const boxY = labelY + 25;
  return (
    <View>
      <Label x={45} y={labelY} w={285}>{label}</Label>
      <Abs x={45} y={boxY} w={285} h={51} radius={18} bg={FIELD_BG} border={FIELD_LINE} borderWidth={1} />
      <Txt x={62} y={boxY + 15} w={8} size={14} weight="medium" font="inter" color={value ? INPUT_INK : PLACEHOLDER} lineHeight={21}>
        ₹
      </Txt>
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder="0.00"
        placeholderTextColor={PLACEHOLDER}
        keyboardType="number-pad"
        style={{
          position: "absolute", left: 78, top: boxY + 15, width: 237, height: 21,
          padding: 0, fontFamily: fonts.interMedium, fontSize: 14, color: INPUT_INK,
        }}
      />
    </View>
  );
}

/**
 * A chip in a flow row. Widths come out of the frame's own padding + gap, so a
 * spec label lands on the spec width and a roster value sizes itself.
 */
function Chip({
  label, icon, iconSize, bg, line, ink, px, gap, h, onPress,
}: {
  label: string; icon?: Icon; iconSize?: number; bg?: string; line?: string;
  ink: string; px: number; gap?: number; h: number; onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        flexDirection: "row", alignItems: "center", height: h, borderRadius: 9999,
        paddingHorizontal: px, gap, backgroundColor: bg,
        borderWidth: line ? 1 : 0, borderColor: line || undefined,
        opacity: pressed ? 0.7 : 1,
      })}
    >
      {icon ? <Feather name={icon} size={iconSize ?? 14} color={ink} /> : null}
      <Txt size={12} weight="semibold" font="inter" color={ink} lineHeight={18}>
        {label}
      </Txt>
    </Pressable>
  );
}

/** An absolutely placed selectable pill — segments, gender, priority. */
function Solid({
  x, y, w, h, radius, bg, line, shadow, onPress, children,
}: {
  x: number; y: number; w: number; h: number; radius: number;
  bg: string; line?: string; shadow: typeof IDLE_SHADOW | typeof ON_SHADOW | null;
  onPress: () => void; children: ReactNode;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        position: "absolute", left: x, top: y, width: w, height: h,
        borderRadius: radius, backgroundColor: bg,
        borderWidth: line ? 1 : 0, borderColor: line,
        alignItems: "center", justifyContent: "center",
        opacity: pressed ? 0.85 : 1,
        ...(shadow ?? {}),
      })}
    >
      {children}
    </Pressable>
  );
}

/* --------------------------------- screen --------------------------------- */
export default function AddLeadScreen() {
  const router = useRouter();

  const { data: creators = [] } = useCreators();
  const { data: me } = useMe();
  const create = useCreate<Lead & { channel?: string }>("leads");

  /* The frame's own selections are the form's initial state. */
  const [dealType, setDealType] = useState<"BARTER" | "PAID">("BARTER");
  const [platforms, setPlatforms] = useState<string[]>(["Instagram", "YouTube"]);
  const [niches, setNiches] = useState<string[]>(["Lifestyle", "Fitness", "Fashion"]);
  const [brandName, setBrandName] = useState("");
  const [website, setWebsite] = useState("");
  const [email, setEmail] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [phone, setPhone] = useState("");
  const [barterValue, setBarterValue] = useState("");
  const [agencyFee, setAgencyFee] = useState("");
  const [budget, setBudget] = useState("");
  const [influencers, setInfluencers] = useState("");
  const [deliverables, setDeliverables] = useState("");
  const [cities, setCities] = useState<string[]>(["Delhi"]);
  const [gender, setGender] = useState<string>("Female");
  const [language, setLanguage] = useState("");
  const [age, setAge] = useState<string>("18–24");
  const [priority, setPriority] = useState<string>("MEDIUM");

  // Frozen at mount so the strip cannot renumber itself mid-edit.
  const today = useMemo(() => new Date(), []);
  const strip = useMemo(() => [0, 1, 2, 3, 4].map((i) => addDays(today, i)), [today]);
  const [deadline, setDeadline] = useState<Date>(() => addDays(new Date(), 2));

  /** Chip pools: the roster's own vocabulary for niche and city. */
  const nichePool = useMemo(() => distinct(creators.map((c) => c.niche)), [creators]);
  const cityPool = useMemo(() => distinct(creators.map((c) => c.location)), [creators]);
  const platformPool = useMemo(() => PLATFORMS.map((p) => p.label), []);

  const barter = dealType === "BARTER";
  const extra = barter ? BARTER_EXTRA : 0;
  /** Everything below the money block rides on the extra barter row. */
  const s = (y: number) => y + extra;

  const addNext = (pool: string[], chosen: string[], set: (v: string[]) => void) => {
    const next = pool.find((v) => !chosen.includes(v));
    if (next) set([...chosen, next]);
  };
  const drop = (chosen: string[], v: string, set: (n: string[]) => void) =>
    set(chosen.filter((x) => x !== v));

  const money = barter ? amount(barterValue) : amount(budget);
  const canSubmit = brandName.trim().length > 0 && !create.isPending;

  const submit = () => {
    if (!canSubmit) return;
    create.mutate(
      {
        brandName: brandName.trim(),
        dealType,
        intent: priority,
        ...(contactPerson.trim() ? { contactPerson: contactPerson.trim() } : null),
        ...(money > 0 ? { money: compact(money) } : null),
        ...(amount(influencers) > 0 ? { peopleCount: amount(influencers) } : null),
        ...(platforms.length ? { channel: platforms.join(", ") } : null),
        ...(me?.id ? { ownerId: me.id } : null),
      },
      { onSuccess: () => router.back() },
    );
  };

  /* Segmented control: the selected half is 158.5x45.5, the idle one 160.5x46. */
  const leftW = barter ? 158.5 : 160.5;
  const rightW = barter ? 160.5 : 158.5;

  return (
    <Screen height={FRAME_H + extra} background={PAGE} scroll>
      {/* =============================== Header ============================== */}
      <Pressable
        onPress={() => router.back()}
        style={({ pressed }) => ({
          position: "absolute", left: 16, top: 22, width: 36, height: 36,
          borderRadius: 18, backgroundColor: BACK_BG,
          alignItems: "center", justifyContent: "center",
          opacity: pressed ? 0.8 : 1, ...BACK_SHADOW,
        })}
      >
        <Feather name="arrow-left" size={16} color={BACK_ICON} />
      </Pressable>
      <Txt x={72} y={28} w={192} size={20} weight="medium" font="inter" color={HEAD_INK} lineHeight={24} letterSpacing={-0.6}>
        Add Lead
      </Txt>

      {/* ============================ Campaign type =========================== */}
      <Label x={24} y={106} w={327}>CAMPAIGN TYPE</Label>
      <Solid
        x={24} y={135} w={leftW} h={barter ? 45.5 : 46} radius={9999}
        bg={barter ? DARK : WHITE} line={barter ? undefined : PILL_LINE}
        shadow={barter ? ON_SHADOW : IDLE_SHADOW}
        onPress={() => setDealType("BARTER")}
      >
        <Txt size={13} weight="semibold" font="inter" color={barter ? WHITE : IDLE_INK} lineHeight={19.5} align="center">
          Barter
        </Txt>
      </Solid>
      <Solid
        x={24 + leftW + 8} y={135} w={rightW} h={barter ? 46 : 45.5} radius={9999}
        bg={barter ? WHITE : DARK} line={barter ? PILL_LINE : undefined}
        shadow={barter ? IDLE_SHADOW : ON_SHADOW}
        onPress={() => setDealType("PAID")}
      >
        <Txt size={13} weight="semibold" font="inter" color={barter ? IDLE_INK : WHITE} lineHeight={19.5} align="center">
          Paid
        </Txt>
      </Solid>

      {/* ============================== Platforms ============================= */}
      <Label x={24} y={205} w={327}>PLATFORMS</Label>
      <Abs x={24} y={234} w={327} h={36} row gap={8}>
        {platforms.map((p, i) => {
          const t = PLATFORM_TINTS[i % PLATFORM_TINTS.length];
          return (
            <Chip
              key={p} label={p} icon={platformIcon(p)} iconSize={14}
              bg={t.bg} line={t.line} ink={t.ink} px={14} gap={8} h={36}
              onPress={() => drop(platforms, p, setPlatforms)}
            />
          );
        })}
        <Chip
          label="Add" icon="plus" iconSize={13} bg={WHITE} line={GHOST_LINE}
          ink={MUTED} px={14} gap={6} h={36}
          onPress={() => addNext(platformPool, platforms, setPlatforms)}
        />
      </Abs>

      {/* ================================ Niche =============================== */}
      <Label x={24} y={294} w={327}>NICHE</Label>
      <Abs x={24} y={323} w={327} h={32} row gap={8}>
        {niches.map((n, i) => {
          const t = NICHE_TINTS[i % NICHE_TINTS.length];
          return (
            <Chip
              key={n} label={n} bg={t.bg} line={t.line} ink={t.ink} px={12} h={32}
              onPress={() => drop(niches, n, setNiches)}
            />
          );
        })}
        <Chip
          label="Add" icon="plus" iconSize={11} line={GHOST_LINE}
          ink={MUTED} px={12} gap={4} h={32}
          onPress={() => addNext(nichePool, niches, setNiches)}
        />
      </Abs>

      {/* ============================= Brand card ============================= */}
      <Abs
        x={CARD1.x} y={CARD1.y} w={CARD1.w} h={CARD1.h + extra} radius={28}
        bg={CARD_BG} border={CARD_LINE} borderWidth={1} style={CARD1_SHADOW}
      />

      <Field
        labelY={F_BRAND} label="BRAND NAME" icon="briefcase"
        placeholder="e.g. Lumina Skin" value={brandName} onChange={setBrandName} caps="words"
      />
      <Field
        labelY={F_WEBSITE} label="BRAND WEBSITE" icon="globe"
        placeholder="https://" value={website} onChange={setWebsite} keyboard="url" caps="none"
      />
      <Field
        labelY={F_EMAIL} label="EMAIL ADDRESS" icon="mail"
        placeholder="brand@example.com" value={email} onChange={setEmail}
        keyboard="email-address" caps="none"
      />
      <Field
        labelY={F_CONTACT} label="CONTACT PERSON" icon="user"
        placeholder="Full name" value={contactPerson} onChange={setContactPerson} caps="words"
      />
      <Field
        labelY={F_PHONE} label="PHONE NUMBER" icon="phone"
        placeholder="+91 (000) 000-0000" value={phone} onChange={setPhone} keyboard="phone-pad"
      />

      {/* ---- money block: the one thing the two source frames disagree on ---- */}
      {barter ? (
        <View>
          <MoneyField labelY={F_MONEY} label="Barter Vallue" value={barterValue} onChange={setBarterValue} />
          <MoneyField labelY={F_FEE} label="agency Fee" value={agencyFee} onChange={setAgencyFee} />
        </View>
      ) : (
        <MoneyField labelY={F_MONEY} label="CAMPAIGN BUDGET" value={budget} onChange={setBudget} />
      )}

      <Field
        labelY={s(F_INFLUENCERS)} label="NO. OF INFLUENCERS"
        placeholder="e.g. 5" value={influencers} onChange={setInfluencers} keyboard="number-pad"
      />
      <Field
        labelY={s(F_DELIVERABLES)} label="DELIVERABLES PER CREATOR" icon="file-text"
        placeholder="e.g. 2 Reels + 1 Story" value={deliverables} onChange={setDeliverables}
      />

      {/* =========================== Targeting card =========================== */}
      <Abs
        x={CARD2.x} y={s(CARD2.y)} w={CARD2.w} h={CARD2.h} radius={28}
        bg={CARD_BG} border={CARD_LINE} borderWidth={1} style={CARD2_SHADOW}
      />

      {/* -------------------------------- Cities ------------------------------ */}
      <Label x={45} y={s(L_CITIES)} w={285}>CITIES</Label>
      <Abs x={45} y={s(R_CITIES)} w={285} h={32} row gap={8}>
        {cities.map((c) => (
          <Chip
            key={c} label={c} icon="map-pin" iconSize={10}
            bg={CITY_TINT.bg} ink={CITY_TINT.ink} px={12} gap={6} h={32}
            onPress={() => drop(cities, c, setCities)}
          />
        ))}
        <Chip
          label="Add Location" icon="plus" iconSize={11} line={GHOST_LINE}
          ink={MUTED} px={12} gap={4} h={32}
          onPress={() => addNext(cityPool, cities, setCities)}
        />
      </Abs>

      {/* -------------------------------- Gender ------------------------------ */}
      <Label x={45} y={s(L_GENDER)} w={285}>GENDER</Label>
      {GENDERS.map((g) => {
        const on = gender === g.label;
        return (
          <Solid
            key={g.label}
            x={g.x} y={s(R_GENDER)} w={g.w} h={40} radius={9999}
            bg={on ? DARK : WHITE} line={on ? undefined : PILL_LINE} shadow={null}
            onPress={() => setGender(g.label)}
          >
            <Txt size={12} weight="semibold" font="inter" color={on ? WHITE : IDLE_INK} lineHeight={18} align="center">
              {g.label}
            </Txt>
          </Solid>
        );
      })}

      {/* ------------------------------- Language ----------------------------- */}
      <Field
        labelY={s(L_LANGUAGE)} label="LANGUAGE" icon="globe"
        placeholder="e.g. English, Hindi" value={language} onChange={setLanguage}
      />

      {/* ------------------------------ Age range ----------------------------- */}
      <Label x={45} y={s(L_AGE)} w={285}>AGE RANGE</Label>
      <Abs
        x={45} y={s(R_AGE)} w={285} h={72} row gap={8}
        style={{ flexWrap: "wrap", alignContent: "flex-start" }}
      >
        {AGES.map((a) => {
          const on = age === a;
          return (
            <Chip
              key={a} label={a} bg={on ? DARK : WHITE} line={on ? undefined : PILL_LINE}
              ink={on ? WHITE : IDLE_INK} px={12} h={32}
              onPress={() => setAge(a)}
            />
          );
        })}
      </Abs>

      {/* =============================== Priority ============================= */}
      <Label x={24} y={s(L_PRIORITY)} w={327}>PRIORITY</Label>
      {PRIORITIES.map((p) => {
        const on = priority === p.value;
        return (
          <Solid
            key={p.value}
            x={p.x} y={s(R_PRIORITY)} w={103.67} h={40} radius={9999}
            bg={on ? p.on : WHITE} line={p.line} shadow={on ? null : IDLE_SHADOW}
            onPress={() => setPriority(p.value)}
          >
            <Txt size={12} weight="semibold" font="inter" color={p.ink} lineHeight={18} align="center">
              {p.label}
            </Txt>
          </Solid>
        );
      })}

      {/* ========================= Submission deadline ======================== */}
      <Label x={24} y={s(L_DEADLINE)} w={327}>SUBMISSION DEADLINE</Label>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ position: "absolute", left: 0, top: s(R_DEADLINE), width: FRAME_W, height: 64.75 }}
        contentContainerStyle={{ paddingHorizontal: 24, gap: 8, alignItems: "flex-start" }}
      >
        {strip.map((d) => {
          const on = sameDay(deadline, d);
          return (
            <Pressable
              key={d.toDateString()}
              onPress={() => setDeadline(d)}
              style={({ pressed }) => ({
                alignItems: "center", paddingHorizontal: 16, paddingVertical: 12,
                gap: 3.75, borderRadius: 18, backgroundColor: on ? DARK : WHITE,
                borderWidth: on ? 0 : 1, borderColor: PILL_LINE,
                opacity: pressed ? 0.85 : 1, ...(on ? ON_SHADOW : IDLE_SHADOW),
              })}
            >
              <Txt
                size={9} weight="bold" font="inter" lineHeight={13.5} letterSpacing={0.9}
                align="center" color={on ? ON_DARK_SOFT : MUTED}
              >
                {WEEKDAYS[d.getDay()]}
              </Txt>
              <Txt size={17} weight="semibold" font="inter" lineHeight={17} align="center" color={on ? WHITE : IDLE_INK}>
                {`${d.getDate()}`}
              </Txt>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* ================================= CTA ================================ */}
      <Pressable
        onPress={submit}
        disabled={!canSubmit}
        style={({ pressed }) => ({
          position: "absolute", left: 24, top: s(CTA_Y), width: 327, height: 54.5,
          borderRadius: 9999, backgroundColor: DARK,
          alignItems: "center", justifyContent: "center",
          opacity: canSubmit ? (pressed ? 0.9 : 1) : 0.5, ...CTA_SHADOW,
        })}
      >
        <Txt size={15} weight="semibold" font="inter" color={WHITE} lineHeight={22.5} align="center">
          {create.isPending ? "Adding..." : "Add Lead"}
        </Txt>
      </Pressable>
    </Screen>
  );
}
