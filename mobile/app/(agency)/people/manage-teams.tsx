import { useMemo } from "react";
import { Pressable, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Abs, Screen, Txt } from "../../../src/ui/Frame";
import { useList, useUsers } from "../../../src/api/hooks";

/**
 * Manage Teams — Figma frame 7732:6326 "team management" (375x876), traced 1:1.
 *
 * A single glass panel (20,116 335x682) holds the disclosure header
 * ("Manage Teams" + collapse caret), a hairline rule, then the team card stack
 * and the "Create a team" CTA. The panel is a vertical auto-layout with a 16pt
 * gap, so the CTA sits directly under the last card: card i at
 * CARD_Y + i*CARD_STEP, CTA at CARD_Y + n*CARD_STEP — which reproduces the
 * design's 475.5 exactly at the three cards it draws.
 *
 * The three cards in the spec (Operations / Sales / Sales + Operation) are the
 * real Team rows. Team has no member or "active" column, so both numbers are
 * derived: members are the Users whose team relation points at the row, and
 * "active" is those members marked present on the most recent recorded
 * attendance day. Per-card paints cycle through the three palettes the design
 * uses, in the order it draws them.
 */

/* ------------------------------- geometry -------------------------------- */
const FRAME_H = 876;

const PANEL = { x: 20, y: 116, w: 335, h: 682 };
const CARD_X = 37;
const CARD_W = 301;
const CARD_H = 76.5;
const CARD_Y = 198; // first card, after the panel header + 1px rule + 16 pad
const CARD_STEP = 92.5; // 76.5 card + 16 gap
/** The panel clips at 786 (798 bottom - 12 pad); 5 cards + the CTA is the fit. */
const MAX_ROWS = 5;

/* --------------------------- spec colour tokens --------------------------- */
const INK_TITLE = "#141311";
const INK_SECTION = "#111827";
const INK_TEAM = "#111111";
const INK_META = "#999999";
const INK_EDIT = "#bcbaba";
const INK_CARET = "#cccccc";
const GLASS_60 = "rgba(255,255,255,0.6)";
const GLASS_70 = "rgba(255,255,255,0.7)";
const GLASS_90 = "rgba(255,255,255,0.9)";
const PILL_BG = "rgba(240,253,244,0.6)";
const PILL_LINE = "#7bf1a8";
const PILL_DOT = "#05df72";
const PILL_INK = "#00a63e";

/** Avatar paints, in the order the spec draws its three cards. */
const PALETTES = [
  { from: "#c8d2ffcc", to: "#dccdffcc", ring: "rgba(160,170,255,0.3)", ink: "#5560cc" },
  { from: "#e15e4447", to: "#e15e443b", ring: "rgba(255,181,160,0.3)", ink: "#e15e44" },
  { from: "#deffc8cc", to: "#e4f7db", ring: "#d0ffb7", ink: "#79cb4c" },
] as const;

/* --------------------------------- data ----------------------------------- */
/** GET /teams — the Prisma Team model, no relations eager-loaded. */
interface Team {
  id: string;
  name: string;
  kind: string;
  createdAt?: string;
}

/** GET /attendance — one row per user per day. */
interface AttendanceDay {
  id: string;
  userId: string;
  date: string;
  present: boolean;
}

/* ------------------------------- team card -------------------------------- */
interface CardProps {
  top: number;
  palette: (typeof PALETTES)[number];
  name: string;
  members: number;
  active: number;
  onPress: () => void;
}

/** 301x76.5 glass row. Child offsets below are card-relative. */
function TeamCard({ top, palette, name, members, active, onPress }: CardProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, { top }, pressed && styles.pressed]}
    >
      {/* Background+Border — 40pt gradient disc with the team glyph */}
      <Abs
        x={21} y={18.25} w={40} h={40} radius={20}
        border={palette.ring} borderWidth={1} center style={styles.clip}
      >
        <LinearGradient
          colors={[palette.from, palette.to] as const}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.fill}
        />
        <Feather name="briefcase" size={18} color={palette.ink} />
      </Abs>

      {/* Name + inline edit affordance */}
      <Abs x={77} y={16} w={111} h={23} row gap={7}>
        <Txt
          size={15} weight="semibold" font="inter" color={INK_TEAM}
          lineHeight={22.5} letterSpacing={-0.38}
          numberOfLines={1} style={styles.shrink}
        >
          {name}
        </Txt>
        <Feather name="edit" size={12} color={INK_EDIT} />
      </Abs>

      <Txt
        x={77} y={42} w={111}
        size={12} weight="medium" font="inter" color={INK_META} lineHeight={18}
        numberOfLines={1}
      >
        {`${members} ${members === 1 ? "Member" : "Members"}`}
      </Txt>

      {/* Overlay+Border — the active-count pill */}
      <Abs
        x={188} y={34} w={68} h={26} radius={13}
        bg={PILL_BG} border={PILL_LINE} borderWidth={1}
      >
        <Abs x={10} y={10} w={6} h={6} radius={3} bg={PILL_DOT} />
        <Txt
          x={20} y={5} w={42}
          size={10} weight="medium" font="inter" color={PILL_INK} lineHeight={16}
          numberOfLines={1}
        >
          {`${active} Active`}
        </Txt>
      </Abs>

      <Abs x={264} y={30.25} w={16} h={16} center>
        <Feather name="chevron-right" size={16} color={INK_CARET} />
      </Abs>
    </Pressable>
  );
}

/* --------------------------------- screen --------------------------------- */
export default function ManageTeams() {
  const router = useRouter();

  const { data: teams = [], isLoading } = useList<Team>("teams");
  const { data: users = [] } = useUsers();
  const { data: attendance = [] } = useList<AttendanceDay>("attendance");

  const members = useMemo(() => {
    const byTeam = new Map<string, number>();
    for (const u of users) {
      const t = u.team?.id;
      if (t) byTeam.set(t, (byTeam.get(t) ?? 0) + 1);
    }
    return byTeam;
  }, [users]);

  /**
   * "N Active" — members present on the latest attendance day on file. There is
   * no active/inactive flag on User, so this is the honest reading of the pill.
   */
  const active = useMemo(() => {
    const teamOf = new Map<string, string | undefined>(users.map((u) => [u.id, u.team?.id]));
    let latest = "";
    for (const a of attendance) if (a.date > latest) latest = a.date;

    const byTeam = new Map<string, number>();
    for (const a of attendance) {
      if (!a.present || a.date !== latest) continue;
      const t = teamOf.get(a.userId);
      if (t) byTeam.set(t, (byTeam.get(t) ?? 0) + 1);
    }
    return byTeam;
  }, [users, attendance]);

  const rows = teams.slice(0, MAX_ROWS);
  // Empty and loading both occupy the first row slot, so the CTA never rides up
  // over the message.
  const ctaY = CARD_Y + Math.max(rows.length, 1) * CARD_STEP;

  return (
    <Screen height={FRAME_H} background="#f8f5ef" scroll>
      {/* ------------------------------ Header ------------------------------- */}
      <Pressable
        onPress={() => router.back()}
        style={({ pressed }) => [styles.back, pressed && styles.pressed]}
      >
        <Feather name="chevron-left" size={16} color="#faf7f2" />
      </Pressable>
      <Txt
        x={72} y={28} w={222}
        size={20} weight="medium" font="inter" color={INK_TITLE}
        lineHeight={24} letterSpacing={-0.6}
      >
        Team
      </Txt>

      {/* --------------------------- Basics (Expanded) ----------------------- */}
      <Abs
        x={PANEL.x} y={PANEL.y} w={PANEL.w} h={PANEL.h} radius={28}
        bg={GLASS_60} border={GLASS_90} borderWidth={1} style={styles.panel}
      />

      {/* Panel header: icon tile, label, collapse caret */}
      <Abs x={33} y={129} w={48} h={48} radius={20} bg="#dbeafe" center style={styles.tileShadow}>
        <Feather name="users" size={24} color="#2563eb" />
      </Abs>
      <Txt
        x={97} y={143.5} w={189}
        size={16} weight="semibold" font="inter" color={INK_SECTION} lineHeight={19.36}
      >
        Manage Teams
      </Txt>
      <Abs x={302} y={135} w={36} h={36} radius={18} bg={GLASS_60} center style={styles.caretShadow}>
        <Feather name="chevron-up" size={20} color="#6b7280" />
      </Abs>

      {/* HorizontalBorder — 1px top rule above the card stack */}
      <Abs x={33} y={181} w={309} h={1} bg={GLASS_60} />

      {/* ------------------------------ Team cards --------------------------- */}
      {rows.map((t, i) => (
        <TeamCard
          key={t.id}
          top={CARD_Y + i * CARD_STEP}
          palette={PALETTES[i % PALETTES.length]}
          name={t.name}
          members={members.get(t.id) ?? 0}
          active={active.get(t.id) ?? 0}
          onPress={() => router.push({ pathname: "/people/team-detail", params: { id: t.id } })}
        />
      ))}
      {rows.length === 0 ? (
        <Txt
          x={CARD_X + 20} y={CARD_Y + 29} w={CARD_W - 40}
          size={13} weight="medium" font="inter" color={INK_META} lineHeight={18}
        >
          {isLoading ? "Loading teams…" : "No teams yet"}
        </Txt>
      ) : null}

      {/* ------------------------------- CTA --------------------------------- */}
      <Pressable
        onPress={() => router.push("/people/create-team")}
        style={({ pressed }) => [styles.cta, { top: ctaY }, pressed && styles.pressed]}
      >
        <Txt
          x={0} y={18} w={CARD_W}
          size={16} weight="semibold" font="inter" color="#ffffff"
          lineHeight={19.36} align="center"
        >
          Create a team
        </Txt>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  fill: { position: "absolute", left: 0, top: 0, right: 0, bottom: 0 },
  clip: { overflow: "hidden" },
  shrink: { flexShrink: 1 },
  pressed: { opacity: 0.9 },

  back: {
    position: "absolute",
    left: 16,
    top: 22,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1f1a17",
    shadowColor: "#000000",
    shadowOpacity: 0.1,
    shadowRadius: 2.7,
    shadowOffset: { width: 0, height: 0.9 },
    elevation: 2,
  },

  panel: {
    shadowColor: "#000000",
    shadowOpacity: 0.08,
    shadowRadius: 40,
    shadowOffset: { width: 0, height: 16 },
    elevation: 3,
  },
  tileShadow: {
    shadowColor: "#000000",
    shadowOpacity: 0.03,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 1,
  },
  caretShadow: {
    shadowColor: "#000000",
    shadowOpacity: 0.03,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },

  card: {
    position: "absolute",
    left: CARD_X,
    width: CARD_W,
    height: CARD_H,
    borderRadius: 24,
    backgroundColor: GLASS_70,
    borderWidth: 1,
    borderColor: "#ffffff",
    shadowColor: "#000000",
    shadowOpacity: 0.04,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },

  cta: {
    position: "absolute",
    left: CARD_X,
    width: CARD_W,
    height: 55,
    borderRadius: 27.5,
    backgroundColor: "#312b28",
  },
});
