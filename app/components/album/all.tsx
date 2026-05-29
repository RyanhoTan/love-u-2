import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { Column, Row } from "../layout";
import { ChevronRight, ChevronsUpDown, Grid2x2 } from "lucide-react-native";
import { ImagesCoverPng } from "@/assets";
import { TimeLine } from "./time-line";

export function AllAlbums() {
  const memoryAlbums = [
    { id: 1, title: "2023年夏天的回忆", cover: ImagesCoverPng },
    { id: 2, title: "2022年冬天的回忆", cover: ImagesCoverPng },
    { id: 3, title: "2021年春天的回忆", cover: ImagesCoverPng },
    { id: 4, title: "2020年秋天的回忆", cover: ImagesCoverPng },
  ];

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
      {/* 时光故事 */}
      <Column>
        <Row items="center" content="space-between">
          <Text style={{ fontWeight: "bold" }}>时光故事</Text>
          <TouchableOpacity>
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
              <Row key={media.id}>
                <View style={{ width: 55, alignItems: "center" }}>
                  <TimeLine />
                </View>
                <Column gap={8} flex={1}>
                  <Row
                    items="center"
                    flex={1}
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
                    style={{
                      flexWrap: "wrap",
                      flex: 1,
                      flexDirection: "row",
                      paddingBottom: 30,
                      gap: 8,
                    }}
                  >
                    {media.source.map((src, index) => (
                      <Image
                        key={index}
                        source={src}
                        style={{ width: 100, height: 100, borderRadius: 8 }}
                      />
                    ))}
                  </View>
                </Column>
              </Row>
            ))}
          </Column>
        </Row>
      </Column>
    </ScrollView>
  );
}
