import { ScrollView, View, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { Screen, Txt } from "../src/ui/Frame";
import { colors, radius } from "../src/theme";
import { useMe, useLeads, useCampaigns, useCreators, compact } from "../src/api/hooks";

/**
 * Influencer home. This is a working shell against live data — the
 * pixel-traced Figma screens land under app/(influencer)/ and app/(agency)/.
 */
export default function Home() {
  const { data: me } = useMe();
  const { data: leads = [] } = useLeads();
  const { data: campaigns = [] } = useCampaigns();
  const { data: creators = [] } = useCreators();
  const router = useRouter();

  const stats = [
    { label: "Active Leads", value: leads.filter((l) => l.status !== "CONVERTED").length, to: "/leads" },
    { label: "Campaigns", value: campaigns.filter((c) => c.status === "ACTIVE").length, to: "/campaigns" },
    { label: "Creators", value: creators.length, to: "/creators" },
  ];

  return (
    <Screen background="#FAF7FF">
      <ScrollView contentContainerStyle={{ padding: 20 }} showsVerticalScrollIndicator={false}>
        <Txt size={13} color={colors.muted}>Welcome back</Txt>
        <Txt size={30} weight="regular" style={{ marginTop: 2 }}>
          {me?.name ?? "there"}
        </Txt>

        <View style={{ marginTop: 24, gap: 12 }}>
          {stats.map((s) => (
            <Pressable
              key={s.label}
              onPress={() => router.push(s.to as never)}
              style={({ pressed }) => ({
                backgroundColor: colors.white,
                borderRadius: radius.inner,
                padding: 16,
                opacity: pressed ? 0.9 : 1,
              })}
            >
              <Txt size={13} color={colors.muted}>{s.label}</Txt>
              <Txt size={28} weight="medium" style={{ marginTop: 6 }}>
                {compact(s.value)}
              </Txt>
            </Pressable>
          ))}
        </View>

        <Txt size={18} style={{ marginTop: 30, marginBottom: 10 }}>Recent leads</Txt>
        {leads.slice(0, 6).map((l) => (
          <View
            key={l.id}
            style={{
              backgroundColor: colors.white, borderRadius: radius.inner,
              padding: 14, marginBottom: 10,
            }}
          >
            <Txt size={15} weight="medium">{l.brandName}</Txt>
            <Txt size={12} color={colors.muted} style={{ marginTop: 3 }}>
              {l.contactPerson ?? "—"} · {l.status}
            </Txt>
          </View>
        ))}
        {!leads.length && (
          <Txt size={13} color={colors.muted}>No leads yet.</Txt>
        )}
      </ScrollView>
    </Screen>
  );
}
