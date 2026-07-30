import { useMemo, useState } from "react";
import { Image, Pressable, ScrollView, StyleSheet, TextInput } from "react-native";
import { useRouter } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import { Feather, Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Abs, Screen, Txt } from "../../../src/ui/Frame";
import { colors, fonts, gradients } from "../../../src/theme";
import {
  useAgencies,
  useMe,
  useRemove,
  useUpdate,
  useUsers,
  type User,
} from "../../../src/api/hooks";

/**
 * Team — actions menu, Figma frame 5279:22053 "team delete" (375x946).
 *
 * The kebab-menu state of the team roster: tapping the vertical-dots on the team
 * identity card drops a 153x37 white popover with a 12pt radius, a "Delete Team"
 * row and a hairline rule along its bottom edge. 5279:22053 is the only frame in
 * the file that draws the delete affordance at all — none of the 875/876 frames
 * carry it — so the popover geometry is lifted from there while everything under
 * it is the newest-generation roster chrome (7751:7845 / 7732:6160), the same
 * one `people/team-roster.tsx` traces: the 335x254 "Basics (Expanded)" card at
 * y=116 with the identity row and "Create a team" CTA, then the 335x397 members
 * card at y=382 with the "Add Reminder" pill and 301x77 rows on an 89pt step.
 *
 * Anchoring: in 5279:22053 the panel's top sits level with the dots icon
 * (y=271) and its right edge two points past the card's padding box (342 vs
 * 340), i.e. it hangs left and covers the kebab it belongs to. Held against the
 * newest-gen row — kebab at (293,224.25), card right edge 338 — that puts the
 * panel at (187,224.25).
 *
 * Both affordances the design offers on this card are live. The inline
 * `lucide:edit` pencil beside the team name (12x12, present in the old frame at
 * 189,277 and in the newest-gen row at 205,219.5) renames the team in place: the
 * name node is swapped for a TextInput at its own coordinates, so no geometry
 * moves. The popover row deletes it.
 *
 * The frame's Geist heading and Clash Display member count render in Inter —
 * neither face is loaded in app/_layout.tsx, and Inter is the body face of the
 * newest-gen frames.
 */

/* ------------------------------- geometry -------------------------------- */
const FRAME_H = 875;

const LIST_X = 33; // member rows: card padding box
const LIST_Y = 473; // first row origin
const LIST_H = 294; // down to the card's bottom padding edge (y=767)
const ROW_W = 301;
const ROW_H = 77;
const ROW_STEP = 89; // 77 row + 12 stack gap

/**
 * Popover — "Group 1171275272" / "Frame 1171275445" of 5279:22053, 153x37 at
 * r=12. Children keep their frame offsets less the 1pt stroke: the label is
 * (201,278) - (189,271) = +12/+7, the rule (190,308) - (189,271) = +1/+37. The
 * rule lands exactly on the panel's bottom edge in the design, where a 1pt
 * centred stroke is half swallowed by the border; it is drawn a point inside so
 * the separator survives.
 */
const MENU = { x: 187, y: 224.25, w: 153, h: 37, r: 12 };

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

/** Popover paints — 5279:22053: white panel, 1pt stroke, #f0eff1 rule. */
const MENU_FILL = "#ffffff";
const MENU_LINE = "#000000";
const MENU_RULE = "#f0eff1";

/* ---------------------------------- data ---------------------------------- */
/** PATCH /teams/:id — the writable half of the Prisma Team model. */
interface TeamPatch {
  name: string;
  kind: string;
}

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
export default function TeamActionsMenu() {
  const router = useRouter();
  const qc = useQueryClient();

  const { data: me } = useMe();
  const { data: users = [], isLoading } = useUsers();
  const { data: agencies = [] } = useAgencies();

  const deleteTeam = useRemove("teams");
  const editTeam = useUpdate<TeamPatch>("teams");

  /** This route IS the opened menu, so the popover starts up. */
  const [menuOpen, setMenuOpen] = useState(true);
  /** Non-null while the name is being edited; doubles as the draft value. */
  const [draft, setDraft] = useState<string | null>(null);

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

  /** Both mutations invalidate /teams; the roster reads the team off /users. */
  const refreshRoster = () => qc.invalidateQueries({ queryKey: ["users"] });

  const commitRename = () => {
    const next = (draft ?? "").trim();
    setDraft(null);
    if (!team || !next || next === team.name) return;
    editTeam.mutate({ id: team.id, data: { name: next } }, { onSuccess: refreshRoster });
  };

  const onDelete = () => {
    if (!team) return;
    setMenuOpen(false);
    deleteTeam.mutate(team.id, {
      onSuccess: () => {
        refreshRoster();
        router.back();
      },
    });
  };

  return (
    <Screen height={FRAME_H} background={PAGE} scroll>
      {/* -------------------------------- Header ----------------------------- */}
      <Pressable
        onPress={() => router.back()}
        style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
      >
        <Feather name="chevron-left" size={16} color={BACK_ICON} />
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
        <Feather name="users" size={20} color={ICON_TILE_INK} />
      </Abs>
      <Txt
        x={97} y={143.5} w={189} size={16} weight="semibold" font="inter"
        color={CARD_INK} lineHeight={19.36}
      >
        Team
      </Txt>
      <Abs x={302} y={135} w={36} h={36} radius={18} bg={GLASS_60} center style={styles.chipShadow}>
        <Feather name="chevron-down" size={20} color={CHEVRON_INK} />
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
          <Feather name="users" size={18} color={AVATAR_INK} />
        </LinearGradient>

        {draft === null ? (
          <Txt
            x={76} y={15} w={78} size={15} weight="semibold" font="inter"
            color={NAME_INK} lineHeight={22.5} letterSpacing={-0.38} numberOfLines={1}
          >
            {team?.name ?? (isLoading ? "Loading…" : "No team")}
          </Txt>
        ) : (
          <TextInput
            value={draft}
            onChangeText={setDraft}
            onSubmitEditing={commitRename}
            onBlur={commitRename}
            autoFocus
            selectTextOnFocus
            returnKeyType="done"
            style={styles.nameInput}
          />
        )}

        {/* lucide:edit — renames the team in place */}
        <Pressable
          onPress={() => setDraft(team?.name ?? "")}
          disabled={!team}
          accessibilityRole="button"
          accessibilityLabel="Edit team name"
          style={({ pressed }) => [styles.editIcon, pressed && styles.pressed]}
        >
          <Feather name="edit-2" size={12} color={EDIT_INK} />
        </Pressable>

        <Txt
          x={76} y={40.5} w={84} size={12} weight="medium" font="inter"
          color={SUB_INK} lineHeight={18} numberOfLines={1}
        >
          {agency?.name ?? ""}
        </Txt>

        {/* Kebab — toggles the actions popover */}
        <Pressable
          onPress={() => setMenuOpen((open) => !open)}
          accessibilityRole="button"
          accessibilityLabel="Team actions"
          style={({ pressed }) => [styles.kebab, pressed && styles.pressed]}
        >
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
        onPress={() => router.push("/profile/add-reminder")}
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

      {/* ----------------------------- Actions popover ----------------------- */}
      {menuOpen ? (
        <>
          {/* Tap-away layer — the design draws no scrim, so it stays invisible */}
          <Pressable
            accessibilityLabel="Dismiss menu"
            onPress={() => setMenuOpen(false)}
            style={StyleSheet.absoluteFill}
          />

          <Pressable
            onPress={onDelete}
            disabled={!team || deleteTeam.isPending}
            accessibilityRole="button"
            style={({ pressed }) => [styles.menu, pressed && styles.pressed]}
          >
            <Txt
              x={11} y={6} w={124} size={13} weight="regular" font="inter"
              color={colors.ink} lineHeight={24} numberOfLines={1}
            >
              Delete Team
            </Txt>
            {/* Line 27 */}
            <Abs x={0} y={34} w={151} h={1} bg={MENU_RULE} />
          </Pressable>
        </>
      ) : null}
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
  /** Same box as the name Txt, so renaming never shifts the row. */
  nameInput: {
    position: "absolute",
    left: 76,
    top: 15,
    width: 78,
    height: 22.5,
    padding: 0,
    fontFamily: fonts.interMedium,
    fontSize: 15,
    letterSpacing: -0.38,
    color: NAME_INK,
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

  /** Frame 1171275445 — floats over the identity row it belongs to. */
  menu: {
    position: "absolute",
    left: MENU.x,
    top: MENU.y,
    width: MENU.w,
    height: MENU.h,
    borderRadius: MENU.r,
    backgroundColor: MENU_FILL,
    borderWidth: 1,
    borderColor: MENU_LINE,
    shadowColor: "#000000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
});
