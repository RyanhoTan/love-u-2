import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { ArrowLeft, CheckCircle2, CloudUpload } from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useAlbumUpload } from "@/app/features/album/use-album-upload";
import { useAlbumUploadRecords } from "@/app/features/album/upload-records";
import { Row } from "@/components/layout";
import { colors } from "@/styles/colors";

function formatTime(value: string) {
  const date = new Date(value);

  return `${date.getMonth() + 1}-${date.getDate()} ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

export default function AlbumUploadRecordsPage() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const records = useAlbumUploadRecords();
  const { isUploadingMedia, startUpload } = useAlbumUpload();

  const uploadingRecords = records.filter((record) => record.status === "uploading");
  const successRecords = records.filter((record) => record.status === "success");

  return (
    <SafeAreaView style={styles.page}>
      <LinearGradient
        colors={["#FFF9FB", "#FFFDFE", "#F7FBFF"]}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.haloTop} />
      <View style={styles.haloBottom} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom, 16) + 108 },
        ]}
      >
        <View style={styles.header}>
          <TouchableOpacity
            activeOpacity={0.84}
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <ArrowLeft color={colors.semantic.textPrimary} size={18} />
          </TouchableOpacity>

          <View style={styles.headerText}>
            <Text style={styles.title}>上传记录</Text>
            <Text style={styles.subtitle}>{records.length} 条记录</Text>
          </View>
        </View>

        <Row gap={10} style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{uploadingRecords.length}</Text>
            <Text style={styles.statLabel}>正在上传</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{successRecords.length}</Text>
            <Text style={styles.statLabel}>上传成功</Text>
          </View>
        </Row>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>正在上传</Text>
          {uploadingRecords.length ? (
            <View style={styles.list}>
              {uploadingRecords.map((record) => (
                <View key={record.id} style={styles.item}>
                  <View style={styles.itemIcon}>
                    <ActivityIndicator color={colors.theme.primary} size="small" />
                  </View>
                  <Text style={styles.itemText}>
                    {record.fileCount} 个文件 · {formatTime(record.startedAt)}
                  </Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.emptyHint}>暂无正在上传</Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>上传成功</Text>
          {successRecords.length ? (
            <View style={styles.list}>
              {successRecords.map((record) => (
                <View key={record.id} style={styles.item}>
                  <View style={[styles.itemIcon, styles.successIcon]}>
                    <CheckCircle2 color="#1F8A4C" size={16} />
                  </View>
                  <Text style={styles.itemText}>
                    {record.fileCount} 个文件 · {formatTime(record.completedAt || record.startedAt)}
                  </Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.emptyHint}>暂无上传成功</Text>
          )}
        </View>
      </ScrollView>

      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 16) + 12 }]}>
        <TouchableOpacity
          activeOpacity={0.88}
          onPress={() => {
            void startUpload();
          }}
          style={styles.primaryButton}
        >
          <LinearGradient
            colors={
              isUploadingMedia
                ? ["#F3C9D3", "#E7B6C3"]
                : [colors.theme.primary, "#FF8EA8"]
            }
            style={styles.primaryButtonFill}
          >
            {isUploadingMedia ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <CloudUpload color="#FFFFFF" size={16} />
            )}
            <Text style={styles.primaryButtonText}>
              {isUploadingMedia ? "上传中" : "上传照片 / 视频"}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: colors.semantic.page,
  },
  haloTop: {
    position: "absolute",
    top: -44,
    right: -36,
    width: 168,
    height: 168,
    borderRadius: 84,
    backgroundColor: "rgba(255, 182, 193, 0.18)",
  },
  haloBottom: {
    position: "absolute",
    bottom: 40,
    left: -52,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: "rgba(255, 107, 139, 0.10)",
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 12,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.72)",
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 26,
    lineHeight: 32,
    fontWeight: "700",
    letterSpacing: -0.4,
    color: colors.semantic.textPrimary,
  },
  subtitle: {
    marginTop: 4,
    fontSize: 13,
    color: colors.semantic.textSecondary,
  },
  statsRow: {
    gap: 10,
  },
  statCard: {
    flex: 1,
    borderRadius: 20,
    paddingVertical: 14,
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.76)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.9)",
  },
  statValue: {
    fontSize: 20,
    lineHeight: 24,
    fontWeight: "700",
    letterSpacing: -0.2,
    color: colors.semantic.textPrimary,
  },
  statLabel: {
    marginTop: 4,
    fontSize: 12,
    color: colors.semantic.textSecondary,
  },
  section: {
    gap: 10,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0.2,
    color: colors.semantic.textSecondary,
    textTransform: "uppercase",
  },
  list: {
    gap: 8,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.8)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.86)",
  },
  itemIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.theme.primaryTint,
  },
  successIcon: {
    backgroundColor: "#E7F8EE",
  },
  itemText: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    color: colors.semantic.textPrimary,
  },
  emptyHint: {
    fontSize: 13,
    color: colors.semantic.textSecondary,
  },
  bottomBar: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 0,
  },
  primaryButton: {
    borderRadius: 999,
    overflow: "hidden",
  },
  primaryButtonFill: {
    minHeight: 44,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  primaryButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});
