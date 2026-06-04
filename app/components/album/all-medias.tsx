import { useMemo, useState } from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { useRouter } from "expo-router";
// 能够在自身滑动时自动且完美地锁住外层容器（如 TabView）的手势。
import { ScrollView } from "react-native-gesture-handler";
import { Column, Row } from "../layout";
import { ChevronRight, ChevronsUpDown, Grid2x2 } from "lucide-react-native";
import { ImagesCoverPng } from "@/assets";
import { STORIES } from "@/data/mock-stories";
import { MOCK_WISH_CATEGORIES } from "@/data/mock-media";
import { TimeLine } from "./time-line";
import { useImageViewer } from "@/hooks/use-image-viewer";

const COLUMNS = 3;
const IMAGE_GAP = 8;

export function AllMedias() {
  const router = useRouter();
  const [gridWidth, setGridWidth] = useState(0);
  const [timelineHeights, setTimelineHeights] = useState<
    Record<number, number>
  >({});
  const { openViewer, Viewer } = useImageViewer();
  const imageSize = useMemo(() => {
    if (!gridWidth) return 0;

    return Math.floor((gridWidth - IMAGE_GAP * (COLUMNS - 1)) / COLUMNS);
  }, [gridWidth]);

  const memoryAlbums = STORIES.slice(0, 4);

  const allMedias = [
    { id: 1, time: "2023年8月", source: [ImagesCoverPng, ImagesCoverPng] },
    { id: 2, time: "2023年7月", source: [ImagesCoverPng] },
    {
      id: 3,
      time: "2023年6月",
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
    { id: 4, time: "2023年8月", source: [ImagesCoverPng] },
    { id: 5, time: "2023年7月", source: [ImagesCoverPng, ImagesCoverPng] },
  ];

  return (
    <ScrollView contentContainerStyle={{ gap: 16 }}>
      {/* 愿望达成 */}
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
          {MOCK_WISH_CATEGORIES[2].wishList.map((wish) => (
            <TouchableOpacity
              key={wish.id}
              style={{ borderRadius: 12, overflow: "hidden" }}
              onPress={() => router.push(`/home/wish-list/${wish.id}`)}
            >
              <Column>
                <Image
                  source={{ uri: wish.cover }}
                  style={{ width: 120, height: 120 }}
                />
                <Column bg="#ffffff80" style={{ width: 120, padding: 6 }}>
                  <Text numberOfLines={1}>{wish.title}</Text>
                  <Text style={{ color: "#aaa", fontSize: 12 }}>
                    {wish.time}
                  </Text>
                </Column>
              </Column>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </Column>
      {/* 时光故事 */}
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

      {/* 全部照片 */}
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
                    width: 55,
                    alignItems: "center",
                    alignSelf: "stretch",
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
