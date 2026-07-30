import { useMemo, useState } from "react";
import { Pressable, ScrollView, TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Txt } from "../src/ui/Frame";
import { colors, radius } from "../src/theme";
import { useMe, useLeads, useCampaigns, useCreators, compact } from "../src/api/hooks";
import { FLOWS, TOTAL_SCREENS } from "../src/generated/routes";
import { clearToken } from "../src/api/client";

/**
 * App home / screen directory.
 *
 * The influencer designs are full-screen flows with back navigation rather than
 * a tab bar, so there is no single "shell" to hang everything off. This lists
 * every generated screen grouped by flow, which is how the app is demoed and
 * QA'd until the entry flows are finalised. Live counters at the top prove the
 * API session is working before you open anything.
 */
export default function Home() {
  const { data: me } = useMe();
  const { data: leads = [] } = useLeads();
  const { data: campaigns = [] } = useCampaigns();
  const { data: creators = [] } = useCreators();
  const [q, setQ] = useState("");
  const router = useRouter();

  const stats = [
    { label: "Leads", value: leads.filter((l) => l.status !== "CONVERTED").length },
    { label: "Campaigns", value: campaigns.filter((c) => c.status === "ACTIVE").length },
    { label: "Creators", value: creators.length },
  ];

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return FLOWS;
    return FLOWS.map((f) => ({
      ...f,
      screens: f.screens.filter(
        (s) => s.title.toLowerCase().includes(t) || f.title.toLowerCase().includes(t)
      ),
    })).filter((f) => f.screens.length);
  }, [q]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#FAF7FF" }}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <View style={{ flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between" }}>
          <View style={{ flex: 1 }}>
            <Txt size={13} color={colors.muted}>Signed in as</Txt>
            <Txt size={26} style={{ marginTop: 2 }}>{me?.name ?? "…"}</Txt>
          </View>
          <Pressable
            onPress={async () => { await clearToken(); router.replace("/login"); }}
            style={({ pressed }) => ({
              paddingHorizontal: 12, paddingVertical: 7, borderRadius: radius.full,
              backgroundColor: colors.white, opacity: pressed ? 0.7 : 1,
            })}
          >
            <Txt size={12} color={colors.ink70}>Log out</Txt>
          </Pressable>
        </View>

        <View style={{ flexDirection: "row", gap: 10, marginTop: 18 }}>
          {stats.map((s) => (
            <View
              key={s.label}
              style={{ flex: 1, backgroundColor: colors.white, borderRadius: radius.inner, padding: 12 }}
            >
              <Txt size={11} color={colors.muted}>{s.label}</Txt>
              <Txt size={22} weight="medium" style={{ marginTop: 4 }}>{compact(s.value)}</Txt>
            </View>
          ))}
        </View>

        <View style={{ marginTop: 22, marginBottom: 10, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <Txt size={17}>Screens</Txt>
          <Txt size={12} color={colors.muted}>{TOTAL_SCREENS} built</Txt>
        </View>

        <TextInput
          value={q}
          onChangeText={setQ}
          placeholder="Search screens…"
          placeholderTextColor={colors.muted}
          autoCapitalize="none"
          style={{
            height: 42, borderRadius: radius.inner, backgroundColor: colors.white,
            paddingHorizontal: 12, fontSize: 14, color: colors.ink, marginBottom: 14,
          }}
        />

        {!filtered.length && (
          <Txt size={13} color={colors.muted}>No screens match “{q}”.</Txt>
        )}

        {filtered.map((f) => (
          <View key={f.flow} style={{ marginBottom: 20 }}>
            <Txt size={12} weight="medium" color={colors.muted} style={{ marginBottom: 8, letterSpacing: 0.6 }}>
              {f.title.toUpperCase()} · {f.screens.length}
            </Txt>
            {f.screens.map((s) => (
              <Pressable
                key={s.path}
                onPress={() => router.push(s.path as never)}
                style={({ pressed }) => ({
                  backgroundColor: colors.white, borderRadius: radius.inner,
                  paddingVertical: 12, paddingHorizontal: 14, marginBottom: 8,
                  opacity: pressed ? 0.85 : 1,
                })}
              >
                <Txt size={14}>{s.title}</Txt>
                <Txt size={11} color={colors.muted} style={{ marginTop: 2 }}>{s.path}</Txt>
              </Pressable>
            ))}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
