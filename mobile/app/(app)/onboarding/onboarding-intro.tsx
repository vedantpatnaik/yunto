import { Pressable, View } from "react-native";
import type { ViewStyle } from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { Screen, Abs, Txt, Ring } from "../../../src/ui/Frame";
import { colors, gradients } from "../../../src/theme";

/**
 * Value-prop carousel, slide 1 of 4 (Figma 7483:43389).
 *
 * Pure marketing chrome: the phone-mockup dashboard behind the headline is an
 * illustration, so every figure in it — Sophia, 12 leads, ₹34k, the M/T/W/T
 * strip, Adidas Summer — is the literal string from the design and is
 * deliberately NOT wired to the API. Only slide 1 exists in the file, so the
 * pagination row is drawn at a fixed active index rather than paged.
 */

/** Radians, as the Figma cache reports them, rendered as CSS degrees. */
const deg = (rad: number) => `${((rad * 180) / Math.PI).toFixed(4)}deg`;

const cardShadow: ViewStyle = {
  shadowColor: "#b794f4",
  shadowOpacity: 0.12,
  shadowRadius: 24,
  shadowOffset: { width: 0, height: 12 },
  elevation: 8,
};

const floatShadow: ViewStyle = {
  shadowColor: "#b4a0dc",
  shadowOpacity: 0.2,
  shadowRadius: 20,
  shadowOffset: { width: 0, height: 10 },
  elevation: 6,
};

const pillShadow: ViewStyle = {
  shadowColor: "#b4a0dc",
  shadowOpacity: 0.15,
  shadowRadius: 16,
  shadowOffset: { width: 0, height: 8 },
  elevation: 5,
};

const tileShadow = (color: string): ViewStyle => ({
  shadowColor: color,
  shadowOpacity: 0.3,
  shadowRadius: 4,
  shadowOffset: { width: 0, height: 4 },
  elevation: 4,
});

/**
 * Stand-in for Figma's 40pt LAYER_BLUR: React Native cannot blur a layer, so
 * three concentric discs at a third of the target alpha reproduce the soft
 * falloff of the decorative background blobs.
 */
function Blob({
  x, y, size, color, opacity,
}: { x: number; y: number; size: number; color: string; opacity: number }) {
  return (
    <>
      {[0, 1, 2].map((i) => {
        const inset = i * 20;
        const s = size - inset * 2;
        return (
          <Abs
            key={i}
            x={x + inset}
            y={y + inset}
            w={s}
            h={s}
            radius={s / 2}
            bg={color}
            opacity={opacity * 0.42}
          />
        );
      })}
    </>
  );
}

/** One of the four tilted glass cards floating around the dashboard mockup. */
function FloatCard({
  left, top, w, h, rotation, radius, padLeft, gap, children,
}: {
  left: number; top: number; w: number; h: number; rotation: number;
  radius: number; padLeft: number; gap: number; children: React.ReactNode;
}) {
  return (
    <Abs
      x={left}
      y={top}
      w={w}
      h={h}
      radius={radius}
      bg="rgba(255,255,255,0.85)"
      border={colors.white}
      borderWidth={1}
      row
      gap={gap}
      style={[
        floatShadow,
        { paddingLeft: padLeft, transform: [{ rotate: deg(rotation) }] },
      ]}
    >
      {children}
    </Abs>
  );
}

/** Day column in the mockup's M/T/W/T strip. */
function DayCell({
  x, day, dayX, dayW, date, dateX, dateW, active,
}: {
  x: number; day: string; dayX: number; dayW: number;
  date: string; dateX: number; dateW: number; active?: boolean;
}) {
  return (
    <>
      <Abs
        x={x}
        y={294.5}
        w={51}
        h={57}
        radius={14}
        bg={active ? colors.white : "rgba(255,255,255,0.5)"}
        border={active ? "rgba(183,148,244,0.2)" : undefined}
        borderWidth={active ? 1 : undefined}
        style={active ? pillShadow : undefined}
      />
      <Txt x={dayX} y={305.5} w={dayW} size={11} weight="semibold" font="inter" color="#787486" lineHeight={13.31}>
        {day}
      </Txt>
      <Txt x={dateX} y={323.5} w={dateW} size={14} weight="bold" font="inter" color="#1a1820" lineHeight={16.94}>
        {date}
      </Txt>
    </>
  );
}

/** Pagination: slide 1 of 4 is the only designed slide, so index 0 is fixed. */
const DOTS = [
  { x: 151.5, w: 24, active: true },
  { x: 183.5, w: 8, active: false },
  { x: 199.5, w: 8, active: false },
  { x: 215.5, w: 8, active: false },
];

export default function OnboardingIntro() {
  const router = useRouter();

  return (
    <Screen height={875} background="#fffdf9" scroll style={{ overflow: "hidden" }}>
      {/* ---------------------------------------------------- background */}
      <Blob x={130} y={-45} size={320} color="#ffb1c6" opacity={0.4} />
      <Blob x={-93.75} y={315} size={300} color="#b794f4" opacity={0.35} />
      <Blob x={132.5} y={575} size={280} color="#fde68a" opacity={0.5} />
      <LinearGradient
        colors={["rgba(255,255,255,0.05)", "rgba(255,255,255,0)"]}
        start={{ x: 0, y: 1 }}
        end={{ x: 1, y: 0 }}
        style={{ position: "absolute", left: 0, top: 0, width: 375, height: 900, opacity: 0.5 }}
      />

      {/* ------------------------------------------ decorative sparkles */}
      <Abs x={309.5} y={162.5} w={20} h={20} center>
        <MaterialCommunityIcons name="star-four-points-outline" size={20} color="#ffb1c6" />
      </Abs>
      <Abs x={307.5} y={176.5} w={8} h={8} center>
        <MaterialCommunityIcons name="star-four-points-outline" size={8} color="#ffb1c6" />
      </Abs>
      <Abs x={27.5} y={387.5} w={20} h={20} center>
        <MaterialCommunityIcons name="star-four-points-outline" size={17} color="#b794f4" />
      </Abs>

      {/* --------------------------------------- central dashboard mockup */}
      <Abs
        x={52.5}
        y={134.5}
        w={270}
        h={318}
        radius={28}
        bg="rgba(255,255,255,0.65)"
        border="rgba(255,255,255,0.9)"
        borderWidth={1}
        style={cardShadow}
      />

      {/* header */}
      <Abs
        x={73.5}
        y={155.5}
        w={44}
        h={44}
        radius={22}
        bg="#eeeeee"
        border={colors.white}
        borderWidth={2}
        style={{
          shadowColor: colors.ink,
          shadowOpacity: 0.05,
          shadowRadius: 4,
          shadowOffset: { width: 0, height: 4 },
          elevation: 3,
        }}
      />
      <Ring x={75.5} y={157.5} size={40} colorA={gradients.avatarA[0]} colorB={gradients.avatarA[1]} />
      <Txt
        x={129.5} y={161} w={124}
        size={15} weight="bold" font="inter" color="#1a1820"
        lineHeight={18.15} letterSpacing={-0.2}
      >
        Hi, Sophia 👋
      </Txt>
      <Txt x={129.5} y={179} w={124} size={12} weight="medium" font="inter" color="#787486" lineHeight={14.52}>
        Ready to create?
      </Txt>
      <Abs
        x={265.5} y={159.5} w={36} h={36} radius={18}
        bg="rgba(255,255,255,0.9)"
        center
        style={{
          shadowColor: "#b794f4",
          shadowOpacity: 0.15,
          shadowRadius: 6,
          shadowOffset: { width: 0, height: 4 },
          elevation: 4,
        }}
      >
        <Feather name="bell" size={18} color="#b794f4" />
      </Abs>

      {/* stat pair */}
      <Abs
        x={73.5} y={215.5} w={108} h={63} radius={16}
        bg="rgba(255,255,255,0.7)" border={colors.white} borderWidth={1}
        style={{ shadowColor: colors.ink, shadowOpacity: 0.02, shadowRadius: 6, shadowOffset: { width: 0, height: 4 } }}
      />
      <Txt x={88.5} y={228.5} w={78} size={11} weight="semibold" font="inter" color="#787486" lineHeight={13.31}>
        Leads
      </Txt>
      <Txt
        x={88.5} y={243.5} w={78}
        size={18} weight="bold" font="inter" color="#2d2a36"
        lineHeight={21.78} letterSpacing={-0.5}
      >
        12
      </Txt>
      <Abs
        x={193.5} y={215.5} w={108} h={63} radius={16}
        bg="rgba(255,255,255,0.7)" border={colors.white} borderWidth={1}
        style={{ shadowColor: colors.ink, shadowOpacity: 0.02, shadowRadius: 6, shadowOffset: { width: 0, height: 4 } }}
      />
      <Txt x={208.5} y={228.5} w={78} size={11} weight="semibold" font="inter" color="#787486" lineHeight={13.31}>
        Revenue
      </Txt>
      <Txt
        x={208.5} y={243.5} w={78}
        size={18} weight="bold" font="inter" color="#2d2a36"
        lineHeight={21.78} letterSpacing={-0.5}
      >
        ₹34k
      </Txt>

      {/* day strip */}
      <DayCell x={73.5} day="M" dayX={93.92} dayW={10.16} date="12" dateX={91.45} dateW={15.11} active />
      <DayCell x={132.5} day="T" dayX={154.36} dayW={7.27} date="13" dateX={150.31} dateW={15.38} />
      <DayCell x={191.5} day="W" dayX={211.39} dayW={11.23} date="14" dateX={209.09} dateW={15.83} />
      <DayCell x={250.5} day="T" dayX={272.36} dayW={7.27} date="15" dateX={268.47} dateW={15.06} />

      {/* campaign row */}
      <Abs
        x={73.5} y={367.5} w={228} h={64} radius={18}
        bg="rgba(255,255,255,0.85)" border={colors.white} borderWidth={1}
        style={{ shadowColor: "#b794f4", shadowOpacity: 0.08, shadowRadius: 8, shadowOffset: { width: 0, height: 8 } }}
      />
      <LinearGradient
        colors={["#ffb1c6", "#ffd6a5"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          {
            position: "absolute",
            left: 86.5,
            top: 380.5,
            width: 38,
            height: 38,
            borderRadius: 12,
            alignItems: "center",
            justifyContent: "center",
          },
          tileShadow("#ffb1c6"),
        ]}
      >
        <Feather name="gift" size={18} color={colors.white} />
      </LinearGradient>
      <Txt x={136.5} y={382.5} w={108.34} size={14} weight="bold" font="inter" color="#1a1820" lineHeight={16.94}>
        Adidas Summer
      </Txt>
      <Txt x={136.5} y={401.5} w={92.31} size={12} weight="semibold" font="inter" color="#b794f4" lineHeight={14.52}>
        Pending Review
      </Txt>

      {/* ------------------------------------------------- floating cards */}
      <FloatCard left={127.395} top={72.36} w={175.77} h={60.39} rotation={-0.05} radius={20} padLeft={16} gap={12}>
        <LinearGradient
          colors={["#a7f3d0", "#34d399"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            { width: 35.73, height: 35.73, borderRadius: 12, alignItems: "center", justifyContent: "center" },
            tileShadow("#34d399"),
          ]}
        >
          <Feather name="mail" size={17} color={colors.white} />
        </LinearGradient>
        <View style={{ gap: 2 }}>
          <Txt size={13} weight="bold" font="inter" color="#1a1820" lineHeight={15.73}>
            Collab Request
          </Txt>
          <Txt size={11} weight="medium" font="inter" color="#787486" lineHeight={13.31}>
            Nike • Barter Deal
          </Txt>
        </View>
      </FloatCard>

      <FloatCard left={201.917} top={404.513} w={171.185} h={59.974} rotation={0.07} radius={20} padLeft={16} gap={12}>
        <LinearGradient
          colors={["#d6bcfa", "#b794f4"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            { width: 36.29, height: 36.28, borderRadius: 12, alignItems: "center", justifyContent: "center" },
            tileShadow("#b794f4"),
          ]}
        >
          <MaterialCommunityIcons name="calendar-check-outline" size={18} color={colors.white} />
        </LinearGradient>
        <View style={{ gap: 2 }}>
          <Txt size={13} weight="bold" font="inter" color="#1a1820" lineHeight={15.73}>
            Shoot Review
          </Txt>
          <Txt size={11} weight="medium" font="inter" color="#787486" lineHeight={13.31}>
            Tomorrow, 10 AM
          </Txt>
        </View>
      </FloatCard>

      <FloatCard left={-10.89} top={285.91} w={146.71} h={41.97} rotation={-0.07} radius={100} padLeft={16} gap={8}>
        <View
          style={{
            width: 21.35,
            height: 21.34,
            borderRadius: 10,
            backgroundColor: "rgba(52,211,153,0.15)",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Feather name="trending-up" size={13} color="#34d399" />
        </View>
        <Txt size={13} weight="semibold" font="inter" color="#1a1820" lineHeight={15.73}>
          +18% Growth
        </Txt>
      </FloatCard>

      <FloatCard left={257.677} top={278.666} w={121.807} h={33.678} rotation={0.09} radius={100} padLeft={14} gap={8}>
        <View
          style={[
            { width: 8.67, height: 8.67, borderRadius: 4, backgroundColor: "#34d399" },
            { shadowColor: "#34d399", shadowOpacity: 0.6, shadowRadius: 4, shadowOffset: { width: 0, height: 0 } },
          ]}
        />
        <Txt size={13} weight="semibold" font="inter" color="#1a1820" lineHeight={15.73}>
          Invoice Paid
        </Txt>
      </FloatCard>

      {/* ------------------------------------------------------- copy */}
      <Txt
        x={32} y={546} w={311}
        size={30} weight="medium" color="#1a1820"
        lineHeight={32.5} letterSpacing={-0.5} align="center"
      >
        {"Everything creators need.\nOne workspace."}
      </Txt>
      <Txt
        x={32} y={655} w={311}
        size={15} weight="medium" font="inter" color="#787486"
        lineHeight={22.5} align="center"
      >
        {"Manage leads, campaigns, barter deals,\nreminders & brand collaborations\neffortlessly."}
      </Txt>

      {/* -------------------------------------------- pagination + CTA */}
      {DOTS.map((d) => (
        <Abs
          key={d.x}
          x={d.x}
          y={746}
          w={d.w}
          h={8}
          radius={4}
          bg="#b794f4"
          opacity={d.active ? undefined : 0.3}
        />
      ))}

      <Pressable
        onPress={() => router.push("/onboarding/join-path")}
        style={({ pressed }) => [
          {
            position: "absolute",
            left: 24,
            top: 778,
            width: 327,
            height: 56,
            borderRadius: 100,
            backgroundColor: "#312b28",
            alignItems: "center",
            justifyContent: "center",
            opacity: pressed ? 0.9 : 1,
          },
          {
            shadowColor: colors.ink,
            shadowOpacity: 0.1,
            shadowRadius: 8,
            shadowOffset: { width: 0, height: 4 },
            elevation: 6,
          },
        ]}
      >
        <Txt
          size={16} weight="bold" font="inter" color="#fffcfc"
          lineHeight={19.36} letterSpacing={0.2} align="center"
        >
          Continue
        </Txt>
      </Pressable>
    </Screen>
  );
}
