import { useCallback, useMemo, useState } from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { ScrollView } from "react-native-gesture-handler";
import { ChevronRight, ChevronsUpDown, Grid2x2 } from "lucide-react-native";
import { ImagesWishDefaultWishCoverPng } from "@/assets";
import { getAlbumMedia, type AlbumMediaItem } from "@/app/features/album/api";
import { getWishes, type WishItem } from "@/app/features/wish-list/api";
import { toast } from "@/components/common";
import { STORIES } from "@/data/mock-stories";
import { useImageViewer } from "@/hooks/use-image-viewer";
import { Column, Row } from "../layout";
import { TimeLine } from "./time-line";

const COLUMNS = 3;
const IMAGE_GAP = 8;

function formatMonth(value: string) {
  if (!value) {
    return "未记录时间";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value.slice(0, 7);
  }

  return `${date.getFullYear()}年${date.getMonth() + 1}月`;
}

function groupMediaByMonth(media: AlbumMediaItem[]) {
  return media.reduce<{ key: string; title: string; items: AlbumMediaItem[] }[]>(
    (groups, item) => {
      const title = formatMonth(item.uploadedAt || item.createdAt);
      const group = groups.find((current) => current.title === title);

      if (group) {
        group.items.push(item);
      } else {
        groups.push({ key: title, title, items: [item] });
      }

      return groups;
    },
    [],
  );
}

export function AllMedias() {
  const router = useRouter();
  const [gridWidth, setGridWidth] = useState(0);
  const [timelineHeights, setTimelineHeights] = useState<
    Record<string, number>
  >({});
  const [wishes, setWishes] = useState<WishItem[]>([]);
  const [media, setMedia] = useState<AlbumMediaItem[]>([]);
  const { openViewer, Viewer } = useImageViewer();

  const imageSize = useMemo(() => {
    if (!gridWidth) return 0;

    return Math.floor((gridWidth - IMAGE_GAP * (COLUMNS - 1)) / COLUMNS);
  }, [gridWidth]);

  const completedWishes = useMemo(
    () => wishes.filter((wish) => wish.status === "done"),
    [wishes],
  );
  const memoryAlbums = STORIES.slice(0, 4);
  const mediaGroups = useMemo(() => groupMediaByMonth(media), [media]);

  const refreshAlbum = useCallback(async () => {
    try {
      const [wishResponse, mediaResponse] = await Promise.all([
        getWishes(),
        getAlbumMedia(),
      ]);

      setWishes(wishResponse.wishes);
      setMedia(mediaResponse.media);
    } catch (error) {
      const message = error instanceof Error ? error.message : "加载相册失败";
      toast.error(message);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void refreshAlbum();
    }, [refreshAlbum]),
  );

  return (
    <ScrollView contentContainerStyle={{ gap: 20, paddingBottom: 24 }}>
      <Column>
        <Row items="center" content="space-between">
          <Text style={{ fontWeight: "bold" }}>愿望达成</Text>
          <TouchableOpacity
            onPress={() => router.push("/home/wish-list?tab=done")}
          >
            <Row center gap={6}>
              <Text style={{ color: "#aaa" }}>全部愿望</Text>
              <ChevronRight size={16} color="#aaa" />
            </Row>
          </TouchableOpacity>
        </Row>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 12, paddingVertical: 12 }}
        >
          {completedWishes.map((wish) => (
            <TouchableOpacity
              key={wish.id}
              style={{ borderRadius: 12, overflow: "hidden" }}
              onPress={() => router.push(`/home/wish-list/${wish.id}/memory`)}
            >
              <Column>
                <Image
                  source={
                    wish.cover
                      ? { uri: wish.cover }
                      : ImagesWishDefaultWishCoverPng
                  }
                  style={{ width: 120, height: 120 }}
                />
                <Column bg="#ffffff80" style={{ width: 120, padding: 6 }}>
                  <Text numberOfLines={1}>{wish.title}</Text>
                  <Text style={{ color: "#aaa", fontSize: 12 }}>
                    {wish.targetDate}
                  </Text>
                </Column>
              </Column>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </Column>

      <Column gap={12}>
        <Row items="center" content="space-between">
          <Text style={{ fontWeight: "bold" }}>时光故事</Text>
          <TouchableOpacity onPress={() => router.push("/home/album/stories")}>
            <Row center gap={6}>
              <Text style={{ color: "#aaa" }}>全部故事</Text>
              <ChevronRight size={16} color="#aaa" />
            </Row>
          </TouchableOpacity>
        </Row>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 12, paddingVertical: 12 }}
        >
          {memoryAlbums.map((album) => (
            <TouchableOpacity
              key={album.id}
              style={{ borderRadius: 12, overflow: "hidden" }}
              onPress={() => router.push(`/home/album/stories/${album.id}`)}
            >
              <Column>
                <Image
                  source={album.cover}
                  style={{ width: 120, height: 120 }}
                />
                <Column bg="#ffffff80" style={{ width: 120, padding: 6 }}>
                  <Text numberOfLines={1}>{album.title}</Text>
                  <Text style={{ color: "#aaa", fontSize: 12 }}>
                    32张 · 2个视频
                  </Text>
                </Column>
              </Column>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </Column>

      <Column gap={12}>
        <Row content="space-between" items="center">
          <Row gap={32}>
            <Text style={{ fontWeight: "bold" }}>全部照片</Text>
            <TouchableOpacity>
              <Row center gap={6}>
                <Text>最新</Text>
                <ChevronsUpDown size={16} />
              </Row>
            </TouchableOpacity>
          </Row>
          <TouchableOpacity>
            <Grid2x2 size={20} />
          </TouchableOpacity>
        </Row>
        {mediaGroups.length === 0 ? (
          <Text style={{ color: "#aaa" }}>还没有照片或视频</Text>
        ) : (
          <Row content="space-between" gap={12}>
            <Column gap={8} style={{ flex: 1 }}>
              {mediaGroups.map((group) => (
                <Row key={group.key} style={{ alignItems: "stretch" }}>
                  <View
                    style={{
                      width: 36,
                      alignItems: "center",
                      alignSelf: "stretch",
                      marginLeft: -8,
                    }}
                  >
                    <TimeLine height={timelineHeights[group.key]} />
                  </View>
                  <Column
                    gap={8}
                    flex={1}
                    onLayout={(event) => {
                      const nextHeight = event.nativeEvent.layout.height;

                      setTimelineHeights((currentHeights) => {
                        if (currentHeights[group.key] === nextHeight) {
                          return currentHeights;
                        }

                        return {
                          ...currentHeights,
                          [group.key]: nextHeight,
                        };
                      });
                    }}
                  >
                    <Row
                      items="center"
                      content="space-between"
                      style={{ marginTop: 4 }}
                    >
                      <Text style={{ fontWeight: "bold", fontSize: 16 }}>
                        {group.title}
                      </Text>
                      <Text style={{ color: "#aaa", fontSize: 12 }}>
                        {group.items.length} 个媒体
                      </Text>
                    </Row>
                    <View
                      onLayout={(event) =>
                        setGridWidth(event.nativeEvent.layout.width)
                      }
                      style={{
                        flexWrap: "wrap",
                        flexDirection: "row",
                        paddingBottom: 30,
                        gap: IMAGE_GAP,
                      }}
                    >
                      {imageSize > 0 &&
                        group.items.map((item) => {
                          const uri = item.thumbnailUrl || item.url;

                          return (
                            <TouchableOpacity
                              key={item.id}
                              onPress={() => openViewer({ uri })}
                            >
                              <Image
                                source={{ uri }}
                                style={{
                                  width: imageSize,
                                  height: imageSize,
                                  borderRadius: 8,
                                }}
                              />
                            </TouchableOpacity>
                          );
                        })}
                    </View>
                  </Column>
                </Row>
              ))}
            </Column>
          </Row>
        )}
      </Column>
      {Viewer}
    </ScrollView>
  );
}
