import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Heart, Play } from "lucide-react-native";
import {
  getAlbumStory,
  updateAlbumStoryFavorite,
  type AlbumMediaItem,
  type AlbumStory,
} from "@/app/features/album/api";
import { NavBar, toast } from "@/components/common";
import { Column, Row } from "@/components/layout";
import { useImageViewer } from "@/hooks/use-image-viewer";
import { useVideoViewer } from "@/hooks/use-video-viewer";

const COLUMNS = 3;
const GAP = 4;
const PADDING = 16;

type StoryMediaGroup = {
  key: string;
  title: string;
  items: AlbumMediaItem[];
};

function formatDateText(value: string) {
  if (!value) {
    return "未记录时间";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value.slice(0, 10);
  }

  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
}

function groupMediaByDay(media: AlbumMediaItem[]) {
  return media.reduce<StoryMediaGroup[]>((groups, item) => {
    const title = formatDateText(item.takenAt || item.uploadedAt || item.createdAt);
    const group = groups.find((current) => current.title === title);

    if (group) {
      group.items.push(item);
    } else {
      groups.push({
        key: `${title}-${groups.length}`,
        title,
        items: [item],
      });
    }

    return groups;
  }, []);
}

export default function StoryDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [gridWidth, setGridWidth] = useState(0);
  const [story, setStory] = useState<AlbumStory | null>(null);
  const [media, setMedia] = useState<AlbumMediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdatingFavorite, setIsUpdatingFavorite] = useState(false);
  const { openViewer: openImageViewer, Viewer: ImageViewer } = useImageViewer();
  const { openViewer: openVideoViewer, Viewer: VideoViewer } = useVideoViewer();

  const imageSize = useMemo(() => {
    if (!gridWidth) {
      return 0;
    }

    return Math.floor((gridWidth - GAP * (COLUMNS - 1)) / COLUMNS);
  }, [gridWidth]);

  const mediaGroups = useMemo(() => groupMediaByDay(media), [media]);

  const refreshStory = useCallback(async () => {
    const storyId = Number(id);

    if (!Number.isInteger(storyId) || storyId <= 0) {
      toast.error("故事不存在");
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const response = await getAlbumStory(storyId);
      setStory(response.story);
      setMedia(response.media);
    } catch (error) {
      const message = error instanceof Error ? error.message : "加载故事失败";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void refreshStory();
  }, [refreshStory]);

  const handleToggleFavorite = async () => {
    if (!story || isUpdatingFavorite) {
      return;
    }

    const nextIsFavorite = !story.isFavorite;

    try {
      setIsUpdatingFavorite(true);
      const response = await updateAlbumStoryFavorite(
        story.id,
        nextIsFavorite,
      );
      setStory(response.story);
    } catch (error) {
      const message = error instanceof Error ? error.message : "更新收藏失败";
      toast.error(message);
    } finally {
      setIsUpdatingFavorite(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, paddingHorizontal: PADDING }}>
      <NavBar
        title={story?.title || "故事详情"}
        rightContent={
          <TouchableOpacity
            accessibilityLabel={story?.isFavorite ? "取消收藏" : "收藏故事"}
            disabled={!story || isUpdatingFavorite}
            onPress={() => void handleToggleFavorite()}
            style={styles.favoriteButton}
          >
            <Heart
              color={story?.isFavorite ? "#ff2a54" : "#666"}
              fill={story?.isFavorite ? "#ff2a54" : "transparent"}
              size={22}
            />
          </TouchableOpacity>
        }
      />
      {isLoading ? (
        <View style={styles.centerState}>
          <ActivityIndicator />
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ gap: 20, paddingBottom: 32 }}
        >
          {story?.description ? (
            <Text style={styles.description}>{story.description}</Text>
          ) : null}

          {mediaGroups.length === 0 ? (
            <Text style={styles.emptyText}>这个故事里还没有媒体</Text>
          ) : null}

          {mediaGroups.map((group) => {
            const photos = group.items.filter((item) => item.mediaType === "image").length;
            const videos = group.items.length - photos;

            return (
              <Column key={group.key} gap={8}>
                <Row items="center" content="space-between">
                  <Text style={styles.timeTitle}>{group.title}</Text>
                  <Text style={styles.mediaCount}>
                    {photos}张 · {videos}个视频
                  </Text>
                </Row>
                <View
                  onLayout={(event) => setGridWidth(event.nativeEvent.layout.width)}
                  style={styles.grid}
                >
                  {imageSize > 0 &&
                    group.items.map((item) => {
                      const uri = item.thumbnailUrl || item.url;
                      const isVideo = item.mediaType === "video";

                      return (
                        <TouchableOpacity
                          key={item.id}
                          onPress={() => {
                            if (isVideo) {
                              openVideoViewer({ uri: item.url }, story?.title || "", group.title);
                              return;
                            }

                            openImageViewer({ uri });
                          }}
                        >
                          <View>
                            <Image
                              source={{ uri }}
                              style={{
                                width: imageSize,
                                height: imageSize,
                                borderRadius: 6,
                              }}
                            />
                            {isVideo ? (
                              <View style={styles.videoOverlay}>
                                <Play color="#fff" fill="#fff" size={16} />
                              </View>
                            ) : null}
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                </View>
              </Column>
            );
          })}
        </ScrollView>
      )}
      {ImageViewer}
      {VideoViewer}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  centerState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  description: {
    color: "#666",
    fontSize: 14,
    lineHeight: 22,
  },
  emptyText: {
    color: "#aaa",
    fontSize: 14,
  },
  timeTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  mediaCount: {
    color: "#aaa",
    fontSize: 12,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: GAP,
  },
  videoOverlay: {
    position: "absolute",
    left: "50%",
    top: "50%",
    width: 32,
    height: 32,
    marginLeft: -16,
    marginTop: -16,
    borderRadius: 16,
    backgroundColor: "#00000066",
    alignItems: "center",
    justifyContent: "center",
  },
  favoriteButton: {
    padding: 6,
  },
});
