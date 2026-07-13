import { useCallback, useMemo, useState } from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { ScrollView } from "react-native-gesture-handler";
import { ChevronRight, ChevronsUpDown, Grid2x2 } from "lucide-react-native";
import { ImagesCoverPng } from "@/assets";
import { toast } from "@/components/common";
import { getWishes, type WishItem } from "@/app/features/wish-list/api";
import { useImageViewer } from "@/hooks/use-image-viewer";
import { STORIES } from "@/data/mock-stories";
import { Column, Row } from "../layout";
import { TimeLine } from "./time-line";

const COLUMNS = 3;
const IMAGE_GAP = 8;
const DEFAULT_WISH_COVER = "https://picsum.photos/seed/love-u/600/800";

export function AllMedias() {
  const router = useRouter();
  const [gridWidth, setGridWidth] = useState(0);
  const [timelineHeights, setTimelineHeights] = useState<
    Record<number, number>
  >({});
  const [wishes, setWishes] = useState<WishItem[]>([]);
  const { openViewer, Viewer } = useImageViewer();

  const imageSize = useMemo(() => {
    if (!gridWidth) return 0;

    return Math.floor((gridWidth - IMAGE_GAP * (COLUMNS - 1)) / COLUMNS);
  }, [gridWidth]);

  const memoryAlbums = STORIES.slice(0, 4);
  const completedWishes = useMemo(
    () => wishes.filter((wish) => wish.status === "done"),
    [wishes],
  );

  const refreshWishes = useCallback(async () => {
    try {
      const response = await getWishes();
      setWishes(response.wishes);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "加载愿望清单失败";
      toast.error(message);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void refreshWishes();
    }, [refreshWishes]),
  );

  const allMedias = [
    { id: 1, time: "2023年1月", source: [ImagesCoverPng, ImagesCoverPng] },
    { id: 2, time: "2023年2月", source: [ImagesCoverPng] },
    {
      id: 3,
      time: "2023年3月",
      source: [
        ImagesCoverPng,
        ImagesCoverPng,
        ImagesCoverPng,
        ImagesCoverPng,
        ImagesCoverPng,
        ImagesCoverPng,
        ImagesCoverPng,
        ImagesCoverPng,
        ImagesCoverPng,
        ImagesCoverPng,
        ImagesCoverPng,
        ImagesCoverPng,
        ImagesCoverPng,
        ImagesCoverPng,
        ImagesCoverPng,
        ImagesCoverPng,
        ImagesCoverPng,
        ImagesCoverPng,
      ],
    },
    { id: 4, time: "2023年4月", source: [ImagesCoverPng] },
    { id: 5, time: "2023年5月", source: [ImagesCoverPng, ImagesCoverPng] },
  ];

  return (
    <ScrollView contentContainerStyle={{ gap: 16 }}>
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
                  source={{ uri: wish.cover || DEFAULT_WISH_COVER }}
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

      <Column>
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
        <Row content="space-between" gap={12}>
          <Column gap={8} style={{ flex: 1 }}>
            {allMedias.map((media) => (
              <Row key={media.id} style={{ alignItems: "stretch" }}>
                <View
                  style={{
                    width: 36,
                    alignItems: "center",
                    alignSelf: "stretch",
                    marginLeft: -8,
                  }}
                >
                  <TimeLine height={timelineHeights[media.id]} />
                </View>
                <Column
                  gap={8}
                  flex={1}
                  onLayout={(event) => {
                    const nextHeight = event.nativeEvent.layout.height;

                    setTimelineHeights((currentHeights) => {
                      if (currentHeights[media.id] === nextHeight) {
                        return currentHeights;
                      }

                      return {
                        ...currentHeights,
                        [media.id]: nextHeight,
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
                      {media.time}
                    </Text>
                    <Text style={{ color: "#aaa", fontSize: 12 }}>
                      128张 · 8个视频
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
                      media.source.map((src, index) => (
                        <TouchableOpacity
                          key={index}
                          onPress={() => openViewer(src)}
                        >
                          <Image
                            source={src}
                            style={{
                              width: imageSize,
                              height: imageSize,
                              borderRadius: 8,
                            }}
                          />
                        </TouchableOpacity>
                      ))}
                  </View>
                </Column>
              </Row>
            ))}
          </Column>
        </Row>
      </Column>
      {Viewer}
    </ScrollView>
  );
}
