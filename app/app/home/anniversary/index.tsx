import { useCallback, useState } from "react";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ImagesAnniversaryCalendarPng } from "@/assets";
import {
  getAnniversaries,
  type AnniversaryItem,
} from "@/app/features/anniversary/api";
import { useAuth } from "@/app/features/auth/auth-context";
import { NavBar, PinkButton, toast } from "@/components/common";
import { Row } from "@/components/layout";
import { colors } from "@/styles/colors";

function formatDisplayDate(dateText: string) {
  return dateText.replace(/-/g, ".");
}

function getRepeatLabel(item: AnniversaryItem) {
  return item.repeatType === "yearly" ? "每年" : undefined;
}

function getTypeColors(type: AnniversaryItem["type"]) {
  switch (type) {
    case "love":
      return { iconBackground: "#FFE8F0", iconAccent: "#FF5B93" };
    case "birthday":
      return { iconBackground: "#FFF0E3", iconAccent: "#FF8B3D" };
    case "holiday":
      return { iconBackground: "#FFF2E7", iconAccent: "#FF9A52" };
    case "custom":
    default:
      return { iconBackground: "#EAF5FF", iconAccent: "#5FB4FF" };
  }
}

export default function AnniversaryScreen() {
  const router = useRouter();
  const { token } = useAuth();
  const [anniversaries, setAnniversaries] = useState<AnniversaryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadAnniversaries = useCallback(async () => {
    if (!token) {
      setAnniversaries([]);
      return;
    }

    try {
      setIsLoading(true);
      const response = await getAnniversaries();
      setAnniversaries(response.anniversaries);
    } catch (error) {
      setAnniversaries([]);
      const message = error instanceof Error ? error.message : "获取纪念日失败";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useFocusEffect(
    useCallback(() => {
      void loadAnniversaries();
    }, [loadAnniversaries]),
  );

  const isEmpty = anniversaries.length === 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      <NavBar
        title="纪念日"
        rightContent={
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => toast.info("编辑功能开发中")}
          >
            <Text style={styles.headerAction}>编辑</Text>
          </TouchableOpacity>
        }
      />

      <ScrollView
        contentContainerStyle={[styles.content, isEmpty && styles.emptyContent]}
        showsVerticalScrollIndicator={false}
      >
        {isEmpty ? (
          <View style={styles.emptyState}>
            <Image
              source={ImagesAnniversaryCalendarPng}
              style={styles.emptyImage}
            />
            <Text style={styles.emptyTitle}>
              {isLoading ? "正在加载纪念日" : "还没有纪念日"}
            </Text>
            <Text style={styles.emptySubtitle}>
              {isLoading ? "请稍候..." : "添加你们的重要日子"}
            </Text>
          </View>
        ) : (
          anniversaries.map((item) => {
            const palette = getTypeColors(item.type);
            const repeatLabel = getRepeatLabel(item);

            return (
              <View key={item.id}>
                <TouchableOpacity activeOpacity={0.9} style={styles.card}>
                  <View
                    style={[
                      styles.iconWrap,
                      { backgroundColor: palette.iconBackground },
                    ]}
                  >
                    <View
                      style={[
                        styles.iconPlaceholder,
                        { backgroundColor: palette.iconAccent },
                      ]}
                    />
                  </View>

                  <View style={styles.cardBody}>
                    <Text style={styles.cardTitle}>{item.title}</Text>
                    <Text style={styles.cardDate}>
                      {formatDisplayDate(item.nextOccurrenceDate)}
                      {repeatLabel ? (
                        <Text style={styles.cardDateHint}>
                          （{repeatLabel}）
                        </Text>
                      ) : null}
                    </Text>
                  </View>

                  <Text style={styles.remainingText}>
                    还有{" "}
                    <Text style={styles.remainingNumber}>
                      {item.remainingDays}
                    </Text>{" "}
                    天
                  </Text>
                </TouchableOpacity>
                <Row style={styles.divider} />
              </View>
            );
          })
        )}
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
  emptyContent: {
    flexGrow: 1,
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
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 80,
  },
  emptyImage: {
    width: 220,
    height: 220,
    resizeMode: "contain",
  },
  emptyTitle: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: "700",
    color: colors.semantic.textPrimary,
  },
  emptySubtitle: {
    marginTop: 6,
    fontSize: 14,
    color: colors.semantic.textSecondary,
  },
});
