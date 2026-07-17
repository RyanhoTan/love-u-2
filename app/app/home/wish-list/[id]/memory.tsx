import { useCallback, useEffect, useState } from "react";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import type { ImageSourcePropType } from "react-native";
import {
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ellipsis, Play, Share } from "lucide-react-native";
import { ImagesCoverPng } from "@/assets";
import {
  getWishRecords,
  type WishItem,
  type WishRecordItem,
} from "@/app/features/wish-list/api";
import { NavBar, toast } from "@/components/common";
import { Column, Row } from "@/components/layout";
import { Tag, VerticalDashedLine } from "@/components/wish-list";
import { useImageViewer } from "@/hooks/use-image-viewer";
import { useVideoViewer } from "@/hooks/use-video-viewer";

const { width: screenWidth } = Dimensions.get("window");

function formatMonthDay(dateText: string) {
  const parts = dateText.split("-");
  if (parts.length !== 3) {
    return dateText;
  }

  return `${parts[1]}/${parts[2]}`;
}

function formatDisplayDate(dateText: string) {
  const parts = dateText.split("-");
  if (parts.length !== 3) {
    return dateText;
  }

  return `${parts[0]}.${parts[1]}.${parts[2]}`;
}

export default function Memory() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const [imageHeight, setImageHeight] = useState(150);
  const [wish, setWish] = useState<WishItem | null>(null);
  const [records, setRecords] = useState<WishRecordItem[]>([]);
  const { openViewer, Viewer } = useImageViewer();
  const { openViewer: openVideoViewer, Viewer: VideoViewer } = useVideoViewer();

  const loadData = useCallback(async () => {
    const parsedWishId = Number(id);

    if (!Number.isInteger(parsedWishId) || parsedWishId <= 0) {
      toast.error("愿望不存在");
      router.back();
      return;
    }

    try {
      const response = await getWishRecords(parsedWishId);
      setWish(response.wish);
      setRecords(response.records);
    } catch (error) {
      const message = error instanceof Error ? error.message : "加载回忆失败";
      toast.error(message);
    }
  }, [id]);

  useEffect(() => {
    if (wish?.cover) {
      Image.getSize(
        wish.cover,
        (width, height) => {
          const calculatedHeight = screenWidth * (height / width);
          setImageHeight(calculatedHeight);
        },
        () => {
          const asset = Image.resolveAssetSource(ImagesCoverPng);
          if (asset?.width && asset?.height) {
            setImageHeight(screenWidth * (asset.height / asset.width));
          }
        },
      );
      return;
    }

    const asset = Image.resolveAssetSource(ImagesCoverPng);
    if (asset?.width && asset?.height) {
      const calculatedHeight = screenWidth * (asset.height / asset.width);
      setImageHeight(calculatedHeight);
    }
  }, [wish?.cover]);

  useFocusEffect(
    useCallback(() => {
      void loadData();
    }, [loadData]),
  );

  const coverSource: ImageSourcePropType = wish?.cover
    ? { uri: wish.cover }
    : ImagesCoverPng;

  const photoCount = records.reduce(
    (count, record) =>
      count + record.media.filter((item) => item.mediaType === "image").length,
    0,
  );
  const videoCount = records.reduce(
    (count, record) =>
      count + record.media.filter((item) => item.mediaType === "video").length,
    0,
  );
  const summaryStats = [
    { label: "照片", value: String(photoCount) },
    { label: "视频", value: String(videoCount) },
    { label: "记录", value: String(records.length) },
  ];

  const latestRecordDate =
    records[records.length - 1]?.recordDate ||
    wish?.updatedAt.slice(0, 10) ||
    "";

  return (
    <SafeAreaView style={styles.page}>
      <NavBar
        rightContent={
          <Row gap={12} items="center">
            <TouchableOpacity onPress={() => toast.info("敬请期待")}>
              <Share size={22} color="#222" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => toast.info("敬请期待")}>
              <Ellipsis size={22} color="#222" />
            </TouchableOpacity>
          </Row>
        }
      />
      <ScrollView showsVerticalScrollIndicator={false}>
        <TouchableOpacity onPress={() => openViewer(coverSource)}>
          <Image
            source={coverSource}
            style={[styles.coverImage, { height: imageHeight }]}
          />
        </TouchableOpacity>

        <Column gap={24} style={styles.container}>
          <Column gap={12}>
            <Row gap={12} items="center">
              <Text style={styles.title}>{wish?.title || "回忆相册"}</Text>
              <Tag status="done" />
              <Text>{wish?.id}</Text>
            </Row>
            <Column gap={16} style={styles.summaryCard}>
              <Column gap={4}>
                <Text style={styles.summaryDate}>
                  {wish?.targetDate ? formatDisplayDate(wish.targetDate) : "--"}
                </Text>
                <Text style={styles.summaryDuration}>
                  {latestRecordDate
                    ? `最近一次记录：${formatDisplayDate(latestRecordDate)}`
                    : "还没有回忆记录"}
                </Text>
              </Column>
              <Row content="space-between">
                {summaryStats.map((item) => (
                  <Column
                    key={item.label}
                    center
                    gap={4}
                    style={styles.statItem}
                  >
                    <Text style={styles.statValue}>{item.value}</Text>
                    <Text style={styles.statLabel}>{item.label}</Text>
                  </Column>
                ))}
              </Row>
            </Column>
          </Column>

          <Text style={styles.sectionTitle}>我们的旅程</Text>
          <Row style={styles.divider} />

          {!!records.length ? (
            records.map((item, index) => {
              const isLastItem = index === records.length - 1;

              return (
                <Row key={item.id}>
                  <View style={styles.axisContainer}>
                    <Text style={styles.dateText}>
                      {formatMonthDay(item.recordDate)}
                    </Text>
                    {!isLastItem && <VerticalDashedLine />}
                  </View>

                  <View style={styles.contentContainer}>
                    <Text style={styles.contentTitle}>
                      {item.content || ""}
                    </Text>

                    {item.media.length > 0 && (
                      <Row style={styles.imageGrid}>
                        {item.media.map((mediaItem, idx) => {
                          if (mediaItem.mediaType === "video") {
                            return (
                              <TouchableOpacity
                                key={`${item.id}-${idx}`}
                                activeOpacity={0.9}
                                onPress={() =>
                                  openVideoViewer(
                                    { uri: mediaItem.url },
                                    wish?.title || "回忆视频",
                                    formatDisplayDate(item.recordDate),
                                  )
                                }
                              >
                                <View
                                  style={[styles.gridImage, styles.videoCard]}
                                >
                                  {!!mediaItem.thumbnailUrl && (
                                    <Image
                                      source={{ uri: mediaItem.thumbnailUrl }}
                                      style={styles.gridImage}
                                    />
                                  )}
                                  <View style={styles.videoOverlay} />
                                  <Play
                                    color="#fff"
                                    size={24}
                                    fill="#fff"
                                    style={styles.playIcon}
                                  />
                                </View>
                              </TouchableOpacity>
                            );
                          }

                          return (
                            <TouchableOpacity
                              key={`${item.id}-${idx}`}
                              onPress={() => openViewer({ uri: mediaItem.url })}
                            >
                              <Image
                                source={{ uri: mediaItem.url }}
                                style={styles.gridImage}
                              />
                            </TouchableOpacity>
                          );
                        })}
                      </Row>
                    )}
                  </View>
                </Row>
              );
            })
          ) : (
            <Text style={styles.emptyText}>暂无记录</Text>
          )}
        </Column>
      </ScrollView>
      {Viewer}
      {VideoViewer}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    padding: 16,
  },
  coverImage: {
    width: screenWidth,
    resizeMode: "contain",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
  },
  summaryCard: {
    paddingVertical: 16,
  },
  summaryDate: {
    fontSize: 16,
    fontWeight: "bold",
  },
  summaryDuration: {
    color: "#666",
  },
  statItem: {
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#222",
  },
  statLabel: {
    color: "#666",
  },
  sectionTitle: {
    fontWeight: "bold",
  },
  divider: {
    height: 1,
    backgroundColor: "#eee",
    width: "100%",
  },
  axisContainer: {
    width: 55,
    alignItems: "center",
  },
  dateText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  contentContainer: {
    flex: 1,
    paddingLeft: 12,
    paddingBottom: 30,
  },
  contentTitle: {
    fontSize: 14,
    color: "#333",
    lineHeight: 20,
  },
  imageGrid: {
    flexWrap: "wrap",
    gap: 8,
    marginTop: 8,
  },
  gridImage: {
    width: 90,
    height: 90,
    borderRadius: 8,
    resizeMode: "cover",
  },
  videoCard: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#222",
  },
  videoOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(0,0,0,0.24)",
    borderRadius: 8,
  },
  playIcon: {
    zIndex: 1,
  },
  emptyText: {
    color: "#666",
    textAlign: "center",
  },
});
