import { Image, ScrollView, StyleSheet, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { RotateCcw, Trash2 } from "lucide-react-native";
import { ImagesWishDefaultWishCoverPng } from "@/assets";
import { NavBar } from "@/components/common";
import { Column, Row } from "@/components/layout";
import { colors } from "@/styles/colors";

const recycledWishes = [
  {
    id: 1,
    title: "一起去海边看日出",
    deletedAt: "2026-07-10",
    targetDate: "2026-08-18",
  },
  {
    id: 2,
    title: "周末做一顿烛光晚餐",
    deletedAt: "2026-07-08",
    targetDate: "2026-07-26",
  },
  {
    id: 3,
    title: "补拍一组夏天合照",
    deletedAt: "2026-07-02",
    targetDate: "2026-08-03",
  },
];

export default function WishRecycleBin() {
  return (
    <SafeAreaView style={styles.page}>
      <NavBar title="回收站" />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Column gap={8}>
          <Text style={styles.sectionTitle}>已删除愿望</Text>
          <Text style={styles.sectionSubTitle}>这里先展示静态数据，后续接入恢复和彻底删除。</Text>
        </Column>

        {recycledWishes.map((wish) => (
          <Row
            key={wish.id}
            gap={12}
            items="center"
            content="space-between"
            style={styles.wishItem}
          >
            <Row gap={12} items="center" style={styles.wishInfo}>
              <Image source={ImagesWishDefaultWishCoverPng} style={styles.cover} />
              <Column gap={8} style={styles.wishText}>
                <Text numberOfLines={1} style={styles.wishTitle}>
                  {wish.title}
                </Text>
                <Text numberOfLines={1} style={styles.wishMeta}>
                  预计时间：{wish.targetDate}
                </Text>
                <Text numberOfLines={1} style={styles.wishMeta}>
                  删除时间：{wish.deletedAt}
                </Text>
              </Column>
            </Row>

            <Row gap={8}>
              <TouchableOpacity style={styles.actionButton}>
                <RotateCcw
                  color={colors.theme.primary}
                  height={18}
                  width={18}
                />
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton}>
                <Trash2 color="#ff6b81" height={18} width={18} />
              </TouchableOpacity>
            </Row>
          </Row>
        ))}
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
});
