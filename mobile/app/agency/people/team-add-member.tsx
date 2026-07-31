import { useMemo, useState } from "react";
import { Image, Pressable, TextInput, View } from "react-native";
import type { KeyboardTypeOptions } from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Abs, Ring, Screen, Txt } from "../../../src/ui/Frame";
import { fonts } from "../../../src/theme";
import { useAgencies, useCreate, useLeads, useMe, useUsers } from "../../../src/api/hooks";
import type { Lead, User } from "../../../src/api/hooks";

/**
 * Team — Add Member — Figma frame 7797:23206 (375x875), traced 1:1.
 *
 * The Team roster with the Add Member bottom sheet on top: a full-bleed
 * #b5b4b9 @57% scrim and a white sheet anchored at y=211 (375x664, 32/32/0/0)
 * carrying the drag handle, the "Add Member" header row, three text fields
 * (Full Name / Email Address / Contact Number), a Permission select defaulting
 * to "Sales", a collapsed "Advance Settings" select and the "Save Permissions"
 * CTA.
 *
 * The EXPANDED Advance Settings state is not drawn in this frame — only in the
 * legacy frame 5279:21945 — so its four toggle rows (Team Lead / Add team
 * members / Delete Leads / Manage Integrations) are lifted from there with
 * their copy intact and redrawn in this frame's newer styling: 15pt Inter 600
 * titles at -0.38 tracking over 12pt #999999 secondaries, inside the same
 * white@80% / r20 field the collapsed row uses. Expanding grows the field by
 * 240pt and pushes the CTA (and the sheet) down by the same amount, which is
 * what the scroll is for. Legacy also carries a "Send Invite" pill beside the
 * heading, but this frame does not — its only submit affordance is the
 * "Save Permissions" CTA, so the pill is not drawn.
 *
 * Wiring notes:
 *  - The roster behind the scrim is the live user list; it is pointer-inert
 *    while the sheet is up, exactly as the frame draws it.
 *  - "5 Active" is the member's own pipeline: leads they own that are neither
 *    CONVERTED nor DEAD. The frame's second variant ("Invite Sent") has no
 *    column behind it — User carries no invite state — so it is not drawn.
 *  - The four Advance Settings switches have no Prisma backing (there is no
 *    permission table). Team Lead is the one that does map onto something real:
 *    it promotes the chosen role to its _MANAGER variant, which is what gets
 *    saved. The other three stay local to the sheet.
 *  - POST /users accepts name/email/role/teamId; phone is sent for the day the
 *    endpoint takes it (User.phone exists) and is dropped server-side today.
 *
 * The frame's Geist and Clash Display text nodes render in Inter and Outfit —
 * neither face is registered in app/_layout.tsx, and those two are the app's.
 *
 * Coordinates below are raw frame coordinates; <Screen> scales the 375pt canvas.
 */

/* -------------------------------- geometry -------------------------------- */
const FRAME_W = 375;
const FRAME_H = 875;

const SHEET_Y = 211;
const SHEET_H = 664;

/** Bottom CTA, collapsed. Shifts down with the Advance Settings panel. */
const CTA_Y = 785.72;

/** Advance Settings field: 52pt collapsed header at y=714. */
const ADV_BOX_Y = 714;
const ADV_BOX_H = 52;
/** Expanded: 12pt gutter, four 48pt rows on a 56pt step, 12pt gutter. */
const ADV_ROW_Y0 = 778;
const ADV_ROW_STEP = 56;
const ADV_EXTRA = 240;

/** Roster rows: first at y=473, 77 tall, 89pt step — three clear the card. */
const ROW_Y0 = 473;
const ROW_STEP = 89;
const ROWS_VISIBLE = 3;

/* ------------------------------ spec colours ------------------------------ */
const PAGE_BG = "#f8f5ef";
const SCRIM = "rgba(181,180,185,0.57)";
const HEAD_INK = "#141311";
const TITLE_INK = "#111111";
const SLATE = "#111827";
const LABEL_INK = "#6b7280";
const MUTED = "#999999";
const CTA_BG = "#312b28";
const BACK_BG = "#1f1a17";
const BACK_INK = "#faf7f2";
const FIELD_BG = "rgba(255,255,255,0.8)";
const FIELD_BORDER = "#e5e5e5";
/** The name field's stroke is a hair lighter than its siblings' in the frame. */
const FIELD_BORDER_NAME = "#e8e8e8";
const GLASS_70 = "rgba(255,255,255,0.7)";
const GLASS_60 = "rgba(255,255,255,0.6)";
const GLASS_55 = "rgba(255,255,255,0.55)";
const CLOSE_BG = "#f8f8f8";
const CLOSE_INK = "#555555";
const TILE_BG = "#f3e8ff";
const TILE_INK = "#9333ea";
const HANDLE = "#e5e5e5";
const TRACK_OFF = "#e1dfdf";
const PILL_BG = "rgba(240,253,244,0.6)";
const PILL_DOT = "#05df72";
const PILL_INK = "#00a63e";
const AVATAR_A = "#c8d2ffcc";
const AVATAR_B = "#dccdffcc";
const INK_70 = "rgba(0,0,0,0.7)";

/** Input chrome: drop 0/4/12 @2% over inner 0/2/4 @2%. */
const FIELD_SHADOW = {
  shadowColor: "#000000",
  shadowOpacity: 0.02,
  shadowRadius: 12,
  shadowOffset: { width: 0, height: 4 },
  elevation: 1,
} as const;

/* ------------------------------ role taxonomy ----------------------------- */
/** The agency-side Role enum, labelled the way the roster prints it. */
const ROLES = [
  { value: "SALES_EMPLOYEE", label: "Sales" },
  { value: "SALES_MANAGER", label: "Sales Manager" },
  { value: "OPS_EMPLOYEE", label: "Operations" },
  { value: "OPS_MANAGER", label: "Operations Manager" },
] as const;
type RoleValue = (typeof ROLES)[number]["value"];

const ROLE_LABEL: Record<string, string> = {
  SUPER_ADMIN: "Admin",
  SALES_MANAGER: "Sales Manager",
  SALES_EMPLOYEE: "Sales",
  OPS_MANAGER: "Operations Manager",
  OPS_EMPLOYEE: "Operations",
};

/** Team Lead is the switch with a column behind it: it is the _MANAGER rank. */
const withRank = (role: RoleValue, lead: boolean): RoleValue =>
  `${role.startsWith("OPS") ? "OPS" : "SALES"}_${lead ? "MANAGER" : "EMPLOYEE"}` as RoleValue;

/* --------------------------- permission presets --------------------------- */
/** Copy lifted from legacy 5279:21945, redrawn in this frame's styling. */
const PERMISSIONS = [
  { key: "teamLead", title: "Team Lead", sub: "Manage team and view team analytics" },
  { key: "addMembers", title: "Add team members", sub: "Add team members & managing" },
  { key: "deleteLeads", title: "Delete Leads", sub: "Allow users to permanently delete leads" },
  { key: "integrations", title: "Manage Integrations", sub: "Connect or disconnect third-party tools" },
] as const;
type PermKey = (typeof PERMISSIONS)[number]["key"];

/** A rank's default switches — managers lead and staff their own team. */
const presetFor = (role: RoleValue): PermKey[] =>
  role.endsWith("MANAGER") ? ["teamLead", "addMembers"] : [];

/** Leads still in play — what the roster's "N Active" pill counts. */
const isActive = (l: Lead) => l.status !== "CONVERTED" && l.status !== "DEAD";

/* -------------------------------- primitives ------------------------------ */
/** Field label — 14pt Inter 500 #6b7280, inset 4pt from the input's box. */
const FieldLabel = ({ y, children }: { y: number; children: string }) => (
  <Txt x={28} y={y} w={323} size={14} weight="medium" font="inter" color={LABEL_INK} lineHeight={16.94}>
    {children}
  </Txt>
);

/** One 52pt text input: label above, white@80% r20 stroked box + shadow pair. */
function Field({
  labelY, boxY, label, placeholder, value, onChange, keyboard, caps,
  border = FIELD_BORDER,
}: {
  labelY: number; boxY: number; label: string; placeholder: string;
  value: string; onChange: (v: string) => void;
  keyboard?: KeyboardTypeOptions; caps?: "none" | "words"; border?: string;
}) {
  return (
    <View>
      <FieldLabel y={labelY}>{label}</FieldLabel>
      <Abs x={24} y={boxY} w={327} h={52} radius={20} bg={FIELD_BG} border={border} style={FIELD_SHADOW}>
        {/* insets are 1pt shy of the frame's 21/16 — the border eats the rest */}
        <TextInput
          value={value}
          onChangeText={onChange}
          placeholder={placeholder}
          placeholderTextColor={SLATE}
          keyboardType={keyboard}
          autoCapitalize={caps}
          style={{
            position: "absolute", left: 20, top: 15, width: 268, height: 20,
            padding: 0, fontFamily: fonts.interMedium, fontSize: 15, color: SLATE,
          }}
        />
      </Abs>
    </View>
  );
}

/** 51x26 switch — legacy geometry, this frame's ink for the on state. */
function Switch({ x, y, on, onPress }: { x: number; y: number; on: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        position: "absolute", left: x, top: y, width: 51, height: 26,
        borderRadius: 15.5, backgroundColor: on ? CTA_BG : TRACK_OFF,
        opacity: pressed ? 0.8 : 1,
      })}
    >
      <View
        style={{
          position: "absolute", left: on ? 25 : 2, top: 2, width: 24, height: 22,
          borderRadius: 13.5, backgroundColor: "#ffffff",
          shadowColor: "#000000", shadowOpacity: 0.15, shadowRadius: 8,
          shadowOffset: { width: 0, height: 3 }, elevation: 3,
        }}
      />
    </Pressable>
  );
}

/* --------------------------- roster row (backdrop) ------------------------- */
function MemberRow({ u, i, active }: { u: User; i: number; active: number }) {
  const y = ROW_Y0 + i * ROW_STEP;
  return (
    <View>
      <Abs x={33} y={y} w={301} h={77} radius={24} bg={GLASS_70} />
      {u.avatarUrl ? (
        <Image
          source={{ uri: u.avatarUrl }}
          style={{ position: "absolute", left: 54, top: y + 17.5, width: 42, height: 42, borderRadius: 21 }}
        />
      ) : (
        <Ring x={54} y={y + 17.5} size={42} />
      )}
      <Txt
        x={112} y={y + 16} w={104} size={15} weight="semibold" font="inter"
        color={TITLE_INK} lineHeight={22.5} letterSpacing={-0.38} numberOfLines={1}
      >
        {u.name}
      </Txt>
      <Txt
        x={112} y={y + 41.5} w={111} size={12} weight="medium" font="inter"
        color={MUTED} lineHeight={18} numberOfLines={1}
      >
        {ROLE_LABEL[u.role] ?? u.role}
      </Txt>
      {/* Pill hugs its label: 10pt dot inset, 4pt gap, 9pt tail (spec 68x26). */}
      <Abs
        x={239} y={y + 25.5} h={26} radius={9999} bg={PILL_BG} row gap={4}
        style={{ paddingLeft: 10, paddingRight: 9 }}
      >
        <Abs w={6} h={6} radius={9999} bg={PILL_DOT} style={{ position: "relative" }} />
        <Txt size={10} weight="medium" font="inter" color={PILL_INK} lineHeight={16}>
          {`${active} Active`}
        </Txt>
      </Abs>
    </View>
  );
}

/* --------------------------------- screen --------------------------------- */
export default function TeamAddMemberScreen() {
  const router = useRouter();

  const { data: me } = useMe();
  const { data: users = [] } = useUsers();
  const { data: leads = [] } = useLeads();
  const { data: agencies = [] } = useAgencies();
  const create = useCreate<User & { teamId?: string }>("users");

  /* form state — the frame's own values are the initial ones */
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<RoleValue>("SALES_EMPLOYEE"); // spec: "Sales"
  const [advOpen, setAdvOpen] = useState(false);
  const [perms, setPerms] = useState<PermKey[]>(presetFor("SALES_EMPLOYEE"));

  /** The inviter's own team — the one a new member joins. */
  const myTeam = useMemo(
    () => users.find((u) => u.id === me?.id)?.team ?? users.find((u) => u.team)?.team,
    [users, me],
  );
  const agencyName = agencies[0]?.name ?? "Stellar Agency";

  /** Active pipeline per member, for the roster pill. */
  const activeByOwner = useMemo(() => {
    const acc: Record<string, number> = {};
    for (const l of leads) {
      if (l.ownerId && isActive(l)) acc[l.ownerId] = (acc[l.ownerId] ?? 0) + 1;
    }
    return acc;
  }, [leads]);

  const advExtra = advOpen ? ADV_EXTRA : 0;
  const frameH = FRAME_H + advExtra;
  const sheetH = SHEET_H + advExtra;
  const ctaY = CTA_Y + advExtra;

  const roleLabel = ROLES.find((r) => r.value === role)?.label ?? "Sales";

  /** The select has no dropdown geometry in the frame, so it steps its options. */
  const nextRole = () => {
    const i = ROLES.findIndex((r) => r.value === role);
    const next = ROLES[(i + 1) % ROLES.length].value;
    setRole(next);
    setPerms(presetFor(next));
  };

  const togglePerm = (key: PermKey) => {
    const on = perms.includes(key);
    const next = on ? perms.filter((k) => k !== key) : [...perms, key];
    setPerms(next);
    // Team Lead is the rank, so the Permission field moves with it.
    if (key === "teamLead") setRole(withRank(role, !on));
  };

  const canSubmit =
    name.trim().length > 0 && /\S+@\S+\.\S+/.test(email.trim()) && !create.isPending;

  const submit = () => {
    if (!canSubmit) return;
    create.mutate(
      {
        name: name.trim(),
        email: email.trim(),
        role: withRank(role, perms.includes("teamLead")),
        ...(phone.trim() ? { phone: phone.trim() } : null),
        ...(myTeam?.id ? { teamId: myTeam.id } : null),
      },
      { onSuccess: () => router.back() },
    );
  };

  return (
    <Screen height={frameH} background={PAGE_BG} scroll>
      {/* ==================== Team roster, under the scrim ==================== */}
      <View
        pointerEvents="none"
        style={{ position: "absolute", left: 0, top: 0, width: FRAME_W, height: FRAME_H, overflow: "hidden" }}
      >
        {/* ------------------------------ header ----------------------------- */}
        <Abs x={16} y={22} w={36} h={36} radius={18} bg={BACK_BG} center>
          <Feather name="arrow-left" size={16} color={BACK_INK} />
        </Abs>
        <Txt
          x={72} y={28} w={222} size={20} weight="medium" font="inter"
          color={HEAD_INK} lineHeight={24} letterSpacing={-0.6}
        >
          Team
        </Txt>

        {/* --------------------- Basics (Expanded) card ---------------------- */}
        <Abs
          x={20} y={116} w={335} h={254} radius={28} bg={GLASS_60}
          style={{
            shadowColor: "#000000", shadowOpacity: 0.08, shadowRadius: 40,
            shadowOffset: { width: 0, height: 16 }, elevation: 3,
          }}
        />
        <Abs x={33} y={129} w={48} h={48} radius={20} bg={TILE_BG} center>
          {/* spec draws arcticons:vk-teams, a 24pt #9333ea stroke — nearest glyph */}
          <Feather name="users" size={24} color={TILE_INK} />
        </Abs>
        <Txt x={97} y={143.5} w={189} size={16} weight="semibold" font="inter" color={SLATE} lineHeight={19.36}>
          Team
        </Txt>
        <Abs x={302} y={135} w={36} h={36} radius={18} bg={GLASS_60} center>
          <Feather name="chevron-up" size={14} color={SLATE} />
        </Abs>

        {/* team row */}
        <Abs x={37} y={198} w={301} h={76.5} radius={24} bg={GLASS_70} />
        <LinearGradient
          colors={[AVATAR_A, AVATAR_B]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ position: "absolute", left: 58, top: 216.25, width: 40, height: 40, borderRadius: 20 }}
        />
        <Abs x={69} y={227.25} w={18} h={18} center>
          <Feather name="briefcase" size={15} color={TITLE_INK} />
        </Abs>
        <Txt
          x={114} y={214} w={84} size={15} weight="semibold" font="inter"
          color={TITLE_INK} lineHeight={22.5} letterSpacing={-0.38} numberOfLines={1}
        >
          {myTeam?.name ?? "Operations"}
        </Txt>
        <Abs x={205} y={219.5} w={12} h={12} center>
          <Feather name="edit-2" size={10} color={MUTED} />
        </Abs>
        <Txt x={114} y={239.5} w={110} size={12} weight="medium" font="inter" color={MUTED} lineHeight={18} numberOfLines={1}>
          {agencyName}
        </Txt>
        <Abs x={293} y={224.25} w={24} h={24} center>
          <Feather name="more-vertical" size={14} color={MUTED} />
        </Abs>

        <Abs x={37} y={290.5} w={301} h={55} radius={100} bg={CTA_BG}>
          <Txt x={96} y={18} w={109} size={16} weight="semibold" font="inter" color="#ffffff" lineHeight={19.36} align="center">
            Create a team
          </Txt>
        </Abs>

        {/* -------------------------- members card --------------------------- */}
        <Abs
          x={20} y={382} w={335} h={397} radius={28} bg={GLASS_55}
          style={{
            shadowColor: "#000000", shadowOpacity: 0.04, shadowRadius: 32,
            shadowOffset: { width: 0, height: 12 }, elevation: 2,
          }}
        />
        <Txt x={33} y={402.5} w={163} size={16} weight="semibold" font="inter" color={SLATE} lineHeight={19.36}>
          Team Members
        </Txt>
        <Abs x={212} y={395} w={130} h={34} radius={36} bg={CTA_BG}>
          <Abs x={13.5} y={7} w={20} h={20} center>
            <Feather name="plus" size={12} color="#ffffff" />
          </Abs>
          <Txt x={33.5} y={9.5} w={83} size={12} weight="semibold" font="inter" color="#ffffff" lineHeight={14.52} align="center">
            Add Reminder
          </Txt>
        </Abs>
        <Abs x={33} y={443} w={16} h={16} center>
          <Feather name="users" size={13} color="#000000" />
        </Abs>
        <Txt x={54} y={441} w={110} size={10} weight="medium" color={INK_70} lineHeight={24}>
          {`${users.length} Members`}
        </Txt>

        {users.slice(0, ROWS_VISIBLE).map((u, i) => (
          <MemberRow key={u.id} u={u} i={i} active={activeByOwner[u.id] ?? 0} />
        ))}
        {users.length === 0 ? (
          <Txt
            x={33} y={ROW_Y0 + 30} w={301} size={12} weight="medium" font="inter"
            color={MUTED} lineHeight={18} align="center"
          >
            No team members yet
          </Txt>
        ) : null}
      </View>

      {/* ================================ scrim =============================== */}
      <Pressable
        onPress={() => router.back()}
        style={{ position: "absolute", left: 0, top: 0, width: FRAME_W, height: frameH, backgroundColor: SCRIM }}
      />

      {/* ============================ Add Member sheet ========================= */}
      <Abs
        x={0} y={SHEET_Y} w={FRAME_W} h={sheetH} bg="#ffffff"
        style={{ borderTopLeftRadius: 32, borderTopRightRadius: 32 }}
      />
      <Abs x={167.5} y={227} w={40} h={4} radius={2} bg={HANDLE} />

      {/* ------------------------------- header ------------------------------ */}
      <Txt
        x={24} y={255} w={280} size={24} weight="semibold" font="inter"
        color={TITLE_INK} lineHeight={29.05} letterSpacing={-0.52}
      >
        Add Member
      </Txt>

      <Pressable
        onPress={() => router.back()}
        style={({ pressed }) => ({
          position: "absolute", left: 315, top: 255, width: 36, height: 36,
          borderRadius: 18, backgroundColor: CLOSE_BG,
          alignItems: "center", justifyContent: "center", opacity: pressed ? 0.7 : 1,
        })}
      >
        <Feather name="x" size={14} color={CLOSE_INK} />
      </Pressable>

      {/* ------------------------------- fields ------------------------------ */}
      <Field
        labelY={317} boxY={342}
        label="Enter name" placeholder="Full Name"
        value={name} onChange={setName} caps="words" border={FIELD_BORDER_NAME}
      />
      <Field
        labelY={404} boxY={431}
        label="Enter email address" placeholder="Email Address"
        value={email} onChange={setEmail} keyboard="email-address" caps="none"
      />
      <Field
        labelY={493} boxY={518}
        label="Enter Contact Number" placeholder="Contact Number"
        value={phone} onChange={setPhone} keyboard="phone-pad"
      />

      {/* ----------------------------- Permission ---------------------------- */}
      <FieldLabel y={591}>Permission</FieldLabel>
      <Pressable
        onPress={nextRole}
        style={({ pressed }) => ({
          position: "absolute", left: 24, top: 616, width: 327, height: 52,
          borderRadius: 20, backgroundColor: FIELD_BG, opacity: pressed ? 0.85 : 1,
          borderWidth: 1, borderColor: FIELD_BORDER,
          ...FIELD_SHADOW,
        })}
      >
        {/* children sit inside the 1pt border, hence the 20/16 insets */}
        <Txt x={20} y={16} w={268} size={15} weight="medium" font="inter" color={SLATE} lineHeight={18.15}>
          {roleLabel}
        </Txt>
        <Abs x={288} y={15} w={20} h={20} center>
          <Feather name="chevron-down" size={14} color={SLATE} />
        </Abs>
      </Pressable>

      {/* -------------------------- Advance Settings ------------------------- */}
      <FieldLabel y={689}>Advance Settings</FieldLabel>
      <Abs x={24} y={ADV_BOX_Y} w={327} h={ADV_BOX_H + advExtra} radius={20} bg={FIELD_BG} border={FIELD_BORDER} style={FIELD_SHADOW} />
      <Pressable
        onPress={() => setAdvOpen(!advOpen)}
        style={({ pressed }) => ({
          position: "absolute", left: 24, top: ADV_BOX_Y, width: 327, height: ADV_BOX_H,
          opacity: pressed ? 0.85 : 1,
        })}
      >
        <Txt x={21} y={17} w={268} size={15} weight="medium" font="inter" color={SLATE} lineHeight={18.15}>
          select
        </Txt>
        <Abs x={289} y={16} w={20} h={20} center>
          <Feather name={advOpen ? "chevron-up" : "chevron-down"} size={14} color={SLATE} />
        </Abs>
      </Pressable>

      {advOpen
        ? PERMISSIONS.map((p, i) => {
            const y = ADV_ROW_Y0 + i * ADV_ROW_STEP;
            const on = perms.includes(p.key);
            return (
              <View key={p.key}>
                <Txt
                  x={45} y={y} w={229} size={15} weight="semibold" font="inter"
                  color={TITLE_INK} lineHeight={22.5} letterSpacing={-0.38} numberOfLines={1}
                >
                  {p.title}
                </Txt>
                <Txt
                  x={45} y={y + 24} w={229} size={12} weight="medium" font="inter"
                  color={MUTED} lineHeight={18} numberOfLines={1}
                >
                  {p.sub}
                </Txt>
                <Switch x={282} y={y + 11} on={on} onPress={() => togglePerm(p.key)} />
              </View>
            );
          })
        : null}

      {/* ------------------------------- CTA --------------------------------- */}
      {/* The frame paints the CTA solid #312b28 even at rest — no disabled dim. */}
      <Pressable
        onPress={submit}
        disabled={!canSubmit}
        style={({ pressed }) => ({
          position: "absolute", left: 37, top: ctaY, width: 301, height: 55,
          borderRadius: 100, backgroundColor: CTA_BG,
          opacity: pressed ? 0.9 : 1,
        })}
      >
        <Txt x={82} y={18} w={137} size={16} weight="semibold" font="inter" color="#ffffff" lineHeight={19.36} align="center">
          {create.isPending ? "Saving..." : "Save Permissions"}
        </Txt>
      </Pressable>
    </Screen>
  );
}
