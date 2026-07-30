import { useState } from "react";
import { ActivityIndicator, Pressable, TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import { Screen, Txt } from "../src/ui/Frame";
import { login } from "../src/api/client";
import { colors, radius } from "../src/theme";

/** Sign-in. Seeded demo credentials are pre-filled to keep demos frictionless. */
export default function Login() {
  const [email, setEmail] = useState("admin@yunto.com");
  const [password, setPassword] = useState("password123");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const qc = useQueryClient();

  const submit = async () => {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      await login(email.trim(), password);
      // Drop anything cached under a previous session before entering the app.
      qc.clear();
      router.replace("/");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not sign in");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen background="#FAF7FF">
      <View style={{ flex: 1, paddingHorizontal: 28, justifyContent: "center" }}>
        <Txt size={40} weight="regular" color={colors.ink}>
          yunto
        </Txt>
        <Txt size={15} color={colors.muted} style={{ marginTop: 8, marginBottom: 34 }}>
          The operating system for influencer marketing.
        </Txt>

        <Txt size={12} color={colors.ink70} style={{ marginBottom: 6 }}>
          Email
        </Txt>
        <TextInput
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          placeholder="you@agency.com"
          placeholderTextColor={colors.muted}
          style={{
            height: 48, borderRadius: radius.inner, backgroundColor: colors.white,
            paddingHorizontal: 14, fontSize: 15, color: colors.ink,
            borderWidth: 1, borderColor: colors.line,
          }}
        />

        <Txt size={12} color={colors.ink70} style={{ marginTop: 16, marginBottom: 6 }}>
          Password
        </Txt>
        <TextInput
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          onSubmitEditing={submit}
          placeholder="••••••••"
          placeholderTextColor={colors.muted}
          style={{
            height: 48, borderRadius: radius.inner, backgroundColor: colors.white,
            paddingHorizontal: 14, fontSize: 15, color: colors.ink,
            borderWidth: 1, borderColor: colors.line,
          }}
        />

        {error && (
          <Txt size={12} color={colors.danger} style={{ marginTop: 12 }}>
            {error}
          </Txt>
        )}

        <Pressable
          onPress={submit}
          disabled={busy}
          style={({ pressed }) => ({
            marginTop: 26, height: 50, borderRadius: radius.pill,
            backgroundColor: colors.ink, alignItems: "center", justifyContent: "center",
            opacity: busy ? 0.6 : pressed ? 0.85 : 1,
          })}
        >
          {busy ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Txt size={15} weight="medium" color={colors.white}>
              Sign in
            </Txt>
          )}
        </Pressable>
      </View>
    </Screen>
  );
}
