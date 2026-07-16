import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  CheckCircle2,
  CircleAlert,
  CloudUpload,
  FileImage,
  FileVideo,
} from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAlbumUpload } from "@/app/features/album/use-album-upload";
import {
  type AlbumUploadRecord,
  useAlbumUploadRecords,
} from "@/app/features/album/upload-records";
import { NavBar, PinkButton } from "@/components/common";
import { Column, Row } from "@/components/layout";
import { colors } from "@/styles/colors";

function formatTime(value: string) {
  const date = new Date(value);

  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")} ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

function getStatusMeta(record: AlbumUploadRecord) {
  switch (record.status) {
    case "success":
      return {
        label: "上传成功",
        color: "#2F9E44",
        bgColor: "#EAF8EE",
        icon: <CheckCircle2 color="#2F9E44" size={18} />,
      };
    case "failed":
      return {
        label: "上传失败",
        color: "#E03131",
        bgColor: "#FFF0F0",
        icon: <CircleAlert color="#E03131" size={18} />,
      };
    default:
      return {
        label: "上传中",
        color: colors.theme.primary,
        bgColor: colors.theme.primaryTint,
        icon: <ActivityIndicator color={colors.theme.primary} size="small" />,
      };
  }
}

export default function AlbumUploadRecordsPage() {
  const records = useAlbumUploadRecords();
  const { isUploadingMedia, startUpload } = useAlbumUpload();

  return (
    <SafeAreaView style={styles.page}>
      <NavBar title="上传记录" />

      <View style={styles.content}>
        <PinkButton
          text={isUploadingMedia ? "上传中..." : "上传照片/视频"}
          onPress={() => {
            void startUpload();
          }}
        />

        <ScrollView
          style={styles.list}
          contentContainerStyle={
            records.length ? styles.listContent : styles.emptyContent
          }
          showsVerticalScrollIndicator={false}
        >
          {records.length ? (
            <Column gap={12}>
              {records.map((record) => {
                const statusMeta = getStatusMeta(record);

                return (
                  <View key={record.id} style={styles.card}>
                    <Row items="center" content="space-between" gap={12}>
                      <Row items="center" gap={10}>
                        <View
                          style={[
                            styles.statusIcon,
                            { backgroundColor: statusMeta.bgColor },
                          ]}
                        >
                          {statusMeta.icon}
                        </View>
                        <Column gap={4}>
                          <Text style={styles.cardTitle}>
                            {record.fileCount} 个文件
                          </Text>
                          <Text style={styles.cardTime}>
                            开始时间 {formatTime(record.startedAt)}
                          </Text>
                        </Column>
                      </Row>

                      <View
                        style={[
                          styles.statusBadge,
                          { backgroundColor: statusMeta.bgColor },
                        ]}
                      >
                        <Text
                          style={[
                            styles.statusText,
                            { color: statusMeta.color },
                          ]}
                        >
                          {statusMeta.label}
                        </Text>
                      </View>
                    </Row>

                    <View style={styles.divider} />

                    <Text style={styles.detailText}>
                      {record.status === "uploading"
                        ? "文件正在上传中，完成后会自动更新为成功记录。"
                        : record.status === "failed"
                          ? record.errorMessage || "上传失败，请稍后重试。"
                          : `完成时间 ${formatTime(record.completedAt || record.startedAt)}`}
                    </Text>

                    <View style={styles.fileList}>
                      {record.files.map((file) => (
                        <View key={file.id} style={styles.fileItem}>
                          <View style={styles.fileIcon}>
                            {file.type === "image" ? (
                              <FileImage
                                color={colors.theme.primary}
                                size={16}
                              />
                            ) : (
                              <FileVideo
                                color={colors.theme.primary}
                                size={16}
                              />
                            )}
                          </View>

                          <Column flex={1} gap={2}>
                            <Text numberOfLines={1} style={styles.fileName}>
                              {file.name}
                            </Text>
                            <Text numberOfLines={1} style={styles.fileMeta}>
                              {file.type === "image" ? "图片" : "视频"}
                            </Text>
                          </Column>
                        </View>
                      ))}
                    </View>
                  </View>
                );
              })}
            </Column>
          ) : (
            <Column center gap={12} style={styles.emptyState}>
              <View style={styles.emptyIcon}>
                <CloudUpload color={colors.theme.primary} size={28} />
              </View>
              <Text style={styles.emptyTitle}>还没有上传记录</Text>
              <Text style={styles.emptyText}>
                点击上方按钮后，这里会显示上传中的任务和对应文件列表。
              </Text>
            </Column>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: colors.semantic.page,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
    gap: 16,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 12,
  },
  emptyContent: {
    flexGrow: 1,
    justifyContent: "center",
  },
  card: {
    backgroundColor: colors.semantic.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#F6E4E8",
    gap: 14,
  },
  statusIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.semantic.textPrimary,
  },
  cardTime: {
    fontSize: 12,
    color: colors.semantic.textSecondary,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "700",
  },
  divider: {
    height: 1,
    backgroundColor: "#F7E7EB",
  },
  detailText: {
    fontSize: 13,
    lineHeight: 20,
    color: colors.semantic.textSecondary,
  },
  fileList: {
    gap: 8,
  },
  fileItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: "#FFF7F9",
  },
  fileIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.theme.primaryTint,
  },
  fileName: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.semantic.textPrimary,
  },
  fileMeta: {
    fontSize: 12,
    color: colors.semantic.textSecondary,
  },
  emptyState: {
    paddingHorizontal: 24,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.theme.primaryTint,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.semantic.textPrimary,
  },
  emptyText: {
    textAlign: "center",
    fontSize: 13,
    lineHeight: 20,
    color: colors.semantic.textSecondary,
  },
});
