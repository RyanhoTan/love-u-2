import { useRouter } from "expo-router";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NavBar, PinkButton } from "@/components/common";
import { colors } from "@/styles/colors";
import { Row } from "@/components/layout";

type AnniversaryItem = {
  id: string;
  title: string;
  date: string;
  repeatLabel?: string;
  remainingDays: number;
  iconBackground: string;
  iconAccent: string;
};

const ANNIVERSARY_LIST: AnniversaryItem[] = [
  {
    id: "love",
    title: "恋爱纪念日",
    date: "2024.06.01",
    repeatLabel: "每年",
    remainingDays: 45,
    iconBackground: "#FFE8F0",
    iconAccent: "#FF5B93",
  },
  {
    id: "partner-birthday",
    title: "对方生日",
    date: "2000.05.20",
    repeatLabel: "每年",
    remainingDays: 125,
    iconBackground: "#FFF0E3",
    iconAccent: "#FF8B3D",
  },
  {
    id: "my-birthday",
    title: "我生日",
    date: "2000.08.15",
    repeatLabel: "每年",
    remainingDays: 212,
    iconBackground: "#FFF2E7",
    iconAccent: "#FF9A52",
  },
  {
    id: "trip",
    title: "第一次旅行",
    date: "2024.10.03",
    remainingDays: 322,
    iconBackground: "#EAF5FF",
    iconAccent: "#5FB4FF",
  },
];

export default function AnniversaryScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      <NavBar
        title="纪念日"
        rightContent={
          <TouchableOpacity activeOpacity={0.85}>
            <Text style={styles.headerAction}>编辑</Text>
          </TouchableOpacity>
        }
      />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {ANNIVERSARY_LIST.map((item) => (
          <>
            <TouchableOpacity
              key={item.id}
              activeOpacity={0.9}
              style={styles.card}
            >
              <View
                style={[
                  styles.iconWrap,
                  { backgroundColor: item.iconBackground },
                ]}
              >
                <View
                  style={[
                    styles.iconPlaceholder,
                    { backgroundColor: item.iconAccent },
                  ]}
                />
              </View>

              <View style={styles.cardBody}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.cardDate}>
                  {item.date}
                  {item.repeatLabel ? (
                    <Text style={styles.cardDateHint}>
                      （{item.repeatLabel}）
                    </Text>
                  ) : null}
                </Text>
              </View>

              <Text style={styles.remainingText}>
                还有{" "}
                <Text style={styles.remainingNumber}>{item.remainingDays}</Text>{" "}
                天
              </Text>
            </TouchableOpacity>
            <Row style={styles.divider} />
          </>
        ))}
      </ScrollView>

      <PinkButton
        text="添加纪念日"
        onPress={() => router.push("/home/anniversary/create")}
        style={styles.buttonShell}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 16,
  },
  headerAction: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.semantic.textPrimary,
  },
  content: {
    paddingTop: 18,
    paddingBottom: 24,
    gap: 14,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 16,
    borderRadius: 18,
    backgroundColor: colors.semantic.page,
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  iconPlaceholder: {
    width: 18,
    height: 18,
    borderRadius: 6,
    opacity: 0.95,
  },
  cardBody: {
    flex: 1,
    marginLeft: 12,
    gap: 6,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.semantic.textPrimary,
  },
  cardDate: {
    fontSize: 13,
    fontWeight: "500",
    color: colors.semantic.textSecondary,
  },
  cardDateHint: {
    fontSize: 12,
    color: colors.semantic.textMuted,
  },
  remainingText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.semantic.textSecondary,
  },
  remainingNumber: {
    fontSize: 20,
    fontWeight: "800",
    color: colors.semantic.textPrimary,
  },
  buttonShell: {
    marginTop: "auto",
    marginBottom: 12,
  },
  divider: {
    height: 1,
    backgroundColor: "#eee",
    width: "80%",
    alignSelf: "center",
  },
});
