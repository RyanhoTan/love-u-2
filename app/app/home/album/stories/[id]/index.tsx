import { useMemo, useState } from "react";
import { NavBar } from "@/components/common";
import { Column, Row } from "@/components/layout";
import {
  Text,
  Image,
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";
import { ImagesCoverPng } from "@/assets";

const COLUMNS = 3;
const GAP = 4;
const PADDING = 16;

/** 不同故事相册的 mock 数据 */
function getMediasByStoryId(storyId: string) {
  const count = (parseInt(storyId) % 3) + 4; // 4~6 组，不同相册数量不同
  const base = new Date(2023, 7, 20 + parseInt(storyId)); // 不同故事起点日期不同
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(base);
    d.setDate(d.getDate() - i);
    const time = `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
    return {
      id: i,
      time,
      photos: 8 + i * 3,
      videos: i % 2,
      sources: Array.from({ length: 4 + i * 2 }, () => ImagesCoverPng),
    };
  });
}

const STORY_TITLES: Record<string, string> = {
  "1": "2023年夏天的回忆",
  "2": "2023年海边之旅",
  "3": "2022年冬天的回忆",
  "4": "2022年圣诞派对",
  "5": "2021年春天的回忆",
  "6": "2021年毕业旅行",
  "7": "2020年秋天的回忆",
  "8": "2020年生日惊喜",
};

export default function StoryDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [gridWidth, setGridWidth] = useState(0);
  const imageSize = useMemo(() => {
    if (!gridWidth) return 0;
    return Math.floor((gridWidth - GAP * (COLUMNS - 1)) / COLUMNS);
  }, [gridWidth]);

  const medias = getMediasByStoryId(id ?? "1");
  const title = STORY_TITLES[id ?? "1"] ?? "故事详情";

  return (
    <SafeAreaView style={{ flex: 1, paddingHorizontal: PADDING }}>
      <NavBar title={title} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ gap: 20, paddingBottom: 32 }}
      >
        {medias.map((group) => (
          <Column key={group.id} gap={8}>
            <Row items="center" content="space-between">
              <Text style={styles.timeTitle}>{group.time}</Text>
              <Text style={styles.mediaCount}>
                {group.photos}张 · {group.videos}个视频
              </Text>
            </Row>
            <View
              onLayout={(e) => setGridWidth(e.nativeEvent.layout.width)}
              style={styles.grid}
            >
              {imageSize > 0 &&
                group.sources.map((src, idx) => (
                  <TouchableOpacity key={idx}>
                    <Image
                      source={src}
                      style={{
                        width: imageSize,
                        height: imageSize,
                        borderRadius: 6,
                      }}
                    />
                  </TouchableOpacity>
                ))}
            </View>
          </Column>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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
});
