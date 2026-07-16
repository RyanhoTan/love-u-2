import { useCallback, useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "expo-router";
import { RotateCcw, Trash2 } from "lucide-react-native";
import { ImagesWishDefaultWishCoverPng } from "@/assets";
import { NavBar, toast } from "@/components/common";
import { Column, Row } from "@/components/layout";
import {
  getDeletedWishes,
  permanentlyDeleteWish,
  restoreWish,
  type WishItem,
} from "@/app/features/wish-list/api";
import { colors } from "@/styles/colors";

function formatDateLabel(value: string | null) {
  if (!value) {
    return "--";
  }

  return value.slice(0, 10);
}

export default function WishRecycleBin() {
  const [wishes, setWishes] = useState<WishItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [pendingWishId, setPendingWishId] = useState<number | null>(null);

  const refreshWishes = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getDeletedWishes();
      setWishes(response.wishes);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "加载回收站失败";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void refreshWishes();
    }, [refreshWishes]),
  );

  const handleRestore = useCallback(
    (wish: WishItem) => {
      if (pendingWishId !== null) {
        return;
      }

      Alert.alert("恢复愿望", `恢复“${wish.title}”到愿望列表？`, [
        {
          text: "取消",
          style: "cancel",
        },
        {
          text: "恢复",
          onPress: () => {
            void (async () => {
              try {
                setPendingWishId(wish.id);
                await restoreWish(wish.id);
                toast.success("愿望已恢复");
                await refreshWishes();
              } catch (error) {
                const message =
                  error instanceof Error ? error.message : "恢复愿望失败";
                toast.error(message);
              } finally {
                setPendingWishId(null);
              }
            })();
          },
        },
      ]);
    },
    [pendingWishId, refreshWishes],
  );

  const handlePermanentDelete = useCallback(
    (wish: WishItem) => {
      if (pendingWishId !== null) {
        return;
      }

      Alert.alert(
        "永久删除",
        `“${wish.title}”会被彻底删除，无法恢复。`,
        [
          {
            text: "取消",
            style: "cancel",
          },
          {
            text: "删除",
            style: "destructive",
            onPress: () => {
              void (async () => {
                try {
                  setPendingWishId(wish.id);
                  await permanentlyDeleteWish(wish.id);
                  toast.success("愿望已永久删除");
                  await refreshWishes();
                } catch (error) {
                  const message =
                    error instanceof Error ? error.message : "永久删除失败";
                  toast.error(message);
                } finally {
                  setPendingWishId(null);
                }
              })();
            },
          },
        ],
      );
    },
    [pendingWishId, refreshWishes],
  );

  return (
    <SafeAreaView style={styles.page}>
      <NavBar title="回收站" />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Column gap={8}>
          <Text style={styles.sectionTitle}>最近删除</Text>
          <Text style={styles.sectionSubTitle}>
            删除后的愿望会保留 30 天，到期后系统会自动清理。
          </Text>
        </Column>

        {!loading && wishes.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>回收站还是空的</Text>
            <Text style={styles.emptyText}>删除的愿望会先来到这里。</Text>
          </View>
        ) : null}

        {wishes.map((wish) => {
          const isPending = pendingWishId === wish.id;

          return (
            <Row
              key={wish.id}
              gap={12}
              items="center"
              content="space-between"
              style={styles.wishItem}
            >
              <Row gap={12} items="center" style={styles.wishInfo}>
                <Image
                  source={
                    wish.cover
                      ? { uri: wish.cover }
                      : ImagesWishDefaultWishCoverPng
                  }
                  style={styles.cover}
                />
                <Column gap={8} style={styles.wishText}>
                  <Text numberOfLines={1} style={styles.wishTitle}>
                    {wish.title}
                  </Text>
                  <Text numberOfLines={1} style={styles.wishMeta}>
                    预计时间：{wish.targetDate}
                  </Text>
                  <Text numberOfLines={1} style={styles.wishMeta}>
                    删除时间：{formatDateLabel(wish.deletedAt)}
                  </Text>
                  <Text numberOfLines={1} style={styles.wishMeta}>
                    清理时间：{formatDateLabel(wish.deleteExpiresAt)}
                  </Text>
                </Column>
              </Row>

              <Row gap={8}>
                <TouchableOpacity
                  style={[
                    styles.actionButton,
                    isPending && styles.actionButtonDisabled,
                  ]}
                  disabled={isPending}
                  onPress={() => handleRestore(wish)}
                >
                  <RotateCcw
                    color={colors.theme.primary}
                    height={18}
                    width={18}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.actionButton,
                    styles.dangerButton,
                    isPending && styles.actionButtonDisabled,
                  ]}
                  disabled={isPending}
                  onPress={() => handlePermanentDelete(wish)}
                >
                  <Trash2 color="#ff6b81" height={18} width={18} />
                </TouchableOpacity>
              </Row>
            </Row>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    padding: 16,
    backgroundColor: colors.semantic.page,
  },
  content: {
    gap: 16,
    paddingBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.semantic.textPrimary,
  },
  sectionSubTitle: {
    color: colors.semantic.textSecondary,
    lineHeight: 20,
  },
  emptyState: {
    padding: 24,
    borderRadius: 12,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: colors.semantic.border,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.semantic.textPrimary,
  },
  emptyText: {
    color: colors.semantic.textSecondary,
    lineHeight: 20,
  },
  wishItem: {
    padding: 14,
    borderRadius: 12,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: colors.semantic.border,
  },
  wishInfo: {
    flex: 1,
  },
  cover: {
    width: 64,
    height: 64,
    borderRadius: 8,
  },
  wishText: {
    flex: 1,
  },
  wishTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: colors.semantic.textPrimary,
  },
  wishMeta: {
    fontSize: 12,
    color: colors.semantic.textSecondary,
  },
  actionButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.theme.primarySoftBg,
    alignItems: "center",
    justifyContent: "center",
  },
  dangerButton: {
    backgroundColor: "rgba(255, 107, 129, 0.14)",
  },
  actionButtonDisabled: {
    opacity: 0.45,
  },
});
