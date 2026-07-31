import { useMemo } from "react";
import { Image, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { Feather, Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Path } from "react-native-svg";
import { Abs, Screen, Txt } from "../../../src/ui/Frame";
import { colors, gradients } from "../../../src/theme";
import { useAgencies, useMe, useUsers, type User } from "../../../src/api/hooks";

/**
 * Team — Figma frame 7732:6160 (375x875), traced 1:1.
 *
 * The agency-side single-team roster: dark pill back button + "Team" heading,
 * the 335x254 "Basics (Expanded)" card at y=116 holding the team identity row
 * (icon tile, name + agency, kebab) above the "Create a team" CTA, then the
 * 335x397 members card at y=382 with the "Add Reminder" pill, the member count
 * and 301x77 member rows on an 89pt step.
 *
 * The members card clips (a 22-person roster measures well past its 397pt box),
 * so the rows live in a ScrollView pinned to the card's clip rect rather than a
 * capped stack — the geometry is untouched, the overflow just becomes reachable.
 *
 * The frame's Geist heading renders in Inter, and so does the Clash Display
 * member count: neither face is loaded in app/_layout.tsx, and Inter is the
 * frame's own body face.
 *
 * Base screen for the add-member sheet and the row actions menu — the kebab and
 * "Create a team" are pressable but inert until those sibling routes land, since
 * a push to a path with no file fails silently.
 */

/* ------------------------------- geometry -------------------------------- */
const FRAME_H = 875;

const LIST_X = 33; // member rows: card padding box
const LIST_Y = 473; // first row origin
const LIST_H = 294; // down to the card's bottom padding edge (y=767)
const ROW_W = 301;
const ROW_H = 77;
const ROW_STEP = 89; // 77 row + 12 stack gap

/* --------------------------- spec colour tokens --------------------------- */
const PAGE = "#f8f5ef";
const HEAD_INK = "#141311";
const BACK_FILL = "#1f1a17";
const BACK_ICON = "#faf7f2";
const CARD_INK = "#111827";
const NAME_INK = "#111111";
const SUB_INK = "#999999";
const ICON_TILE = "#f3e8ff";
const ICON_TILE_INK = "#9333ea";
const CHEVRON_INK = "#6b7280";
const AVATAR_INK = "#5560cc";
const EDIT_INK = "#bcbaba";
const KEBAB_INK = "#bbbbbb";
const CTA_FILL = "#312b28";
const GLASS_60 = "rgba(255,255,255,0.6)";
const GLASS_70 = "rgba(255,255,255,0.7)";
const GLASS_55 = "rgba(255,255,255,0.55)";
const BORDER_90 = "rgba(255,255,255,0.9)";
const BORDER_60 = "rgba(255,255,255,0.6)";

/* ------------------------------ derivations ------------------------------- */
type Status = "active" | "invite_sent";

/**
 * Status pill paints, straight off the frame's two row variants. Only the pill
 * and label widths differ — the dot and text offsets are identical.
 */
const STATUS: Record<Status, {
  label: string; w: number; textW: number;
  fill: string; line: string; dot: string; ink: string;
}> = {
  active: {
    label: "Active", w: 68, textW: 39,
    fill: "rgba(240,253,244,0.6)", line: "#7bf1a8", dot: "#05df72", ink: "#00a63e",
  },
  invite_sent: {
    label: "Invite Sent", w: 79, textW: 51,
    fill: "#e5ecff", line: "#6990fd", dot: "#1d4ed8", ink: "#1d4ed8",
  },
};

/**
 * User has no invitation column. POST /users provisions a member from name,
 * email, role and team alone and leaves the sales/ops target unset — a manager
 * fills that in once the person is actually onboarded. So a roster row with no
 * target on record is still a pending invite, and one with a target is Active.
 * Both sides read a real column; nothing is invented.
 */
const statusOf = (u: User): Status =>
  u.targetMonthly != null || u.targetYearly != null ? "active" : "invite_sent";

/** Row subtitle — the member's function, from User.role. */
const roleLabel = (role: string) => (role.startsWith("OPS") ? "Operations" : "Sales");

/* -------------------------------- member row ------------------------------ */
interface RowProps {
  top: number;
  name: string;
  role: string;
  status: Status;
  avatarUrl?: string;
}

/**
 * 301x77 glass row. Child offsets are row-relative and already account for the
 * 1pt stroke, which insets the padding box by a point on each side.
 */
function MemberRow({ top, name, role, status, avatarUrl }: RowProps) {
  const s = STATUS[status];
  return (
    <Abs
      x={0}
      y={top}
      w={ROW_W}
      h={ROW_H}
      radius={24}
      bg={GLASS_70}
      border={colors.white}
      borderWidth={1}
      style={styles.rowShadow}
    >
      {/* image 42x42 — photo fill in the design, gradient placeholder without one */}
      {avatarUrl ? (
        <Image source={{ uri: avatarUrl }} style={styles.memberAvatar} />
      ) : (
        <LinearGradient
          colors={gradients.avatarA}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.memberAvatar}
        />
      )}

      <Txt
        x={78} y={15} w={104} size={15} weight="semibold" font="inter"
        color={NAME_INK} lineHeight={22.5} letterSpacing={-0.38} numberOfLines={1}
      >
        {name}
      </Txt>
      <Txt
        x={78} y={40.5} w={64} size={12} weight="medium" font="inter"
        color={SUB_INK} lineHeight={18} numberOfLines={1}
      >
        {role}
      </Txt>

      {/* Overlay+Border status pill */}
      <Abs
        x={205} y={24.5} w={s.w} h={26} radius={9999}
        bg={s.fill} border={s.line} borderWidth={1}
      >
        <Abs x={9} y={9} w={6} h={6} radius={3} bg={s.dot} />
        <Txt
          x={19} y={4} w={s.textW} size={10} weight="medium" font="inter"
          color={s.ink} lineHeight={16} numberOfLines={1}
        >
          {s.label}
        </Txt>
      </Abs>
    </Abs>
  );
}

/* --------------------------------- screen --------------------------------- */
export default function TeamRoster() {
  const router = useRouter();

  const { data: me } = useMe();
  const { data: users = [], isLoading } = useUsers();
  const { data: agencies = [] } = useAgencies();

  /**
   * The team this roster is about: the signed-in operator's own, falling back to
   * the first team any staff member is on. /auth/me returns the bare user row,
   * so the team relation is read off their entry in the sanitized users list.
   */
  const team = useMemo(() => {
    const mine = users.find((u) => u.id === me?.id)?.team;
    return mine ?? users.find((u) => u.team)?.team;
  }, [users, me]);

  /** Roster = everyone assigned to that team, in the order the API returns. */
  const members = useMemo(
    () => (team ? users.filter((u) => u.team?.id === team.id) : []),
    [users, team],
  );

  /** The workspace this team belongs to — the identity card's second line. */
  const agency = agencies[0];

  return (
    <Screen height={FRAME_H} background={PAGE} scroll>
      {/* -------------------------------- Header ----------------------------- */}
      <Pressable
        onPress={() => router.back()}
        style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
      >
        <Feather name="arrow-left" size={16} color={BACK_ICON} />
      </Pressable>
      <Txt
        x={72} y={28} w={222} size={20} weight="medium" font="inter"
        color={HEAD_INK} lineHeight={24} letterSpacing={-0.6}
      >
        Team
      </Txt>

      {/* ------------------------ Basics (Expanded) card --------------------- */}
      <Abs
        x={20} y={116} w={335} h={254} radius={28}
        bg={GLASS_60} border={BORDER_90} borderWidth={1}
        style={styles.cardShadowLg}
      />

      {/* Section head: icon tile + "Team" + disclosure chevron */}
      <Abs x={33} y={129} w={48} h={48} radius={20} bg={ICON_TILE} center style={styles.tileShadow}>
        {/* arcticons:vk-teams — the frame's four-loop knot, 24px box with the
            18.5px glyph and a 1.5pt stroke (3 units in the 48-unit viewBox). */}
        <Svg width={24} height={24} viewBox="0 0 48 48">
          <Path
            d="M36.5 5.5a6 6 0 0 0-4.242 1.758l-5 5a6 6 0 0 0 0 8.484a6 6 0 0 0 8.484 0l5-5a6 6 0 0 0 0-8.484A6 6 0 0 0 36.5 5.5m-25.001 0a6 6 0 0 1 4.242 1.758l5 5a6 6 0 0 1 0 8.484a6 6 0 0 1-8.484 0l-5-5a6 6 0 0 1 0-8.484A6 6 0 0 1 11.499 5.5m25.002 37a6 6 0 0 1-4.242-1.758l-5-5a6 6 0 0 1 0-8.484a6 6 0 0 1 8.484 0l5 5a6 6 0 0 1 0 8.484a6 6 0 0 1-4.242 1.758m-25.001 0a6 6 0 0 0 4.242-1.758l5-5a6 6 0 0 0 0-8.484a6 6 0 0 0-8.484 0l-5 5a6 6 0 0 0 0 8.484A6 6 0 0 0 11.5 42.5"
            fill="none"
            stroke={ICON_TILE_INK}
            strokeWidth={3}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      </Abs>
      <Txt
        x={97} y={143.5} w={189} size={16} weight="semibold" font="inter"
        color={CARD_INK} lineHeight={19.36}
      >
        Team
      </Txt>
      <Abs x={302} y={135} w={36} h={36} radius={18} bg={GLASS_60} center style={styles.chipShadow}>
        {/* Card is the "Basics (Expanded)" variant — the disclosure points up. */}
        <Feather name="chevron-up" size={20} color={CHEVRON_INK} />
      </Abs>

      {/* HorizontalBorder — 1pt top rule above the team row */}
      <Abs x={33} y={181} w={309} h={1} bg={BORDER_60} />

      {/* ----------------------------- Team identity ------------------------- */}
      <Abs
        x={37} y={198} w={301} h={76.5} radius={24}
        bg={GLASS_70} border={colors.white} borderWidth={1}
        style={styles.rowShadow}
      >
        <LinearGradient
          colors={["rgba(200,210,255,0.8)", "rgba(220,205,255,0.8)"] as const}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.teamAvatar}
        >
          <Feather name="briefcase" size={18} color={AVATAR_INK} />
        </LinearGradient>

        <Txt
          x={76} y={15} w={78} size={15} weight="semibold" font="inter"
          color={NAME_INK} lineHeight={22.5} letterSpacing={-0.38} numberOfLines={1}
        >
          {team?.name ?? (isLoading ? "Loading…" : "No team")}
        </Txt>
        <View style={styles.editIcon}>
          <Feather name="edit" size={12} color={EDIT_INK} />
        </View>
        {/* w = the frame's 163pt subtitle Container, not the sample's 84pt text
            box: a real workspace name ("Bloom Media House") needs the room. */}
        <Txt
          x={76} y={40.5} w={163} size={12} weight="medium" font="inter"
          color={SUB_INK} lineHeight={18} numberOfLines={1}
        >
          {agency?.name ?? ""}
        </Txt>

        {/* Kebab — opens the row actions menu */}
        <Pressable style={({ pressed }) => [styles.kebab, pressed && styles.pressed]}>
          <Feather name="more-vertical" size={14} color={KEBAB_INK} />
        </Pressable>
      </Abs>

      {/* ------------------------------ Create a team ------------------------ */}
      <Pressable style={({ pressed }) => [styles.createTeam, pressed && styles.pressed]}>
        <Txt
          x={96} y={18} w={109} size={16} weight="semibold" font="inter"
          color={colors.white} lineHeight={19.36} align="center"
        >
          Create a team
        </Txt>
      </Pressable>

      {/* --------------------------- Team Members card ----------------------- */}
      <Abs
        x={20} y={382} w={335} h={397} radius={28}
        bg={GLASS_55} border={BORDER_90} borderWidth={1}
        style={styles.cardShadowMd}
      />

      <Txt
        x={33} y={402.5} w={163} size={16} weight="semibold" font="inter"
        color={CARD_INK} lineHeight={19.36}
      >
        Team Members
      </Txt>
      <Pressable
        onPress={() => router.push("/agency/profile/add-reminder")}
        style={({ pressed }) => [styles.addReminder, pressed && styles.pressed]}
      >
        <Feather name="plus" size={20} color="#fffefe" />
        <Txt
          w={83} size={12} weight="semibold" font="inter"
          color={colors.white} lineHeight={14.52} align="center"
        >
          Add Reminder
        </Txt>
      </Pressable>

      {/* Member count */}
      <Abs x={33} y={443} w={16} h={16} center>
        <Ionicons name="people" size={16} color={colors.ink} />
      </Abs>
      <Txt
        x={54} y={441} w={110} size={10} weight="medium" font="inter"
        color={colors.ink70} lineHeight={24}
      >
        {`${members.length} Members`}
      </Txt>

      {/* ------------------------------ Member rows -------------------------- */}
      <ScrollView
        nestedScrollEnabled
        showsVerticalScrollIndicator={false}
        style={styles.list}
        contentContainerStyle={{
          height: Math.max(LIST_H, members.length * ROW_STEP - (ROW_STEP - ROW_H)),
        }}
      >
        {members.map((u, i) => (
          <MemberRow
            key={u.id}
            top={i * ROW_STEP}
            name={u.name}
            role={roleLabel(u.role)}
            status={statusOf(u)}
            avatarUrl={u.avatarUrl}
          />
        ))}
        {members.length === 0 ? (
          <Txt x={21} y={26} w={260} size={15} font="inter" color={SUB_INK} lineHeight={22.5}>
            {isLoading ? "Loading members…" : "No members yet"}
          </Txt>
        ) : null}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  pressed: { opacity: 0.9 },

  backButton: {
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
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },

  cardShadowLg: {
    shadowColor: "#000000",
    shadowOpacity: 0.08,
    shadowRadius: 40,
    shadowOffset: { width: 0, height: 16 },
    elevation: 2,
  },
  cardShadowMd: {
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
  chipShadow: {
    shadowColor: "#000000",
    shadowOpacity: 0.03,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  rowShadow: {
    shadowColor: "#000000",
    shadowOpacity: 0.04,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 4 },
    elevation: 1,
  },

  teamAvatar: {
    position: "absolute",
    left: 20,
    top: 17.25,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(160,170,255,0.3)",
  },
  editIcon: { position: "absolute", left: 167, top: 20.5, width: 12, height: 12 },
  kebab: {
    position: "absolute",
    left: 255,
    top: 25.25,
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },

  createTeam: {
    position: "absolute",
    left: 37,
    top: 290.5,
    width: 301,
    height: 55,
    borderRadius: 100,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: CTA_FILL,
  },

  addReminder: {
    position: "absolute",
    left: 212,
    top: 395,
    width: 130,
    height: 34,
    borderRadius: 36,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
    backgroundColor: CTA_FILL,
  },

  list: {
    position: "absolute",
    left: LIST_X,
    top: LIST_Y,
    width: ROW_W,
    height: LIST_H,
  },
  memberAvatar: { position: "absolute", left: 20, top: 16.5, width: 42, height: 42, borderRadius: 21 },
});
