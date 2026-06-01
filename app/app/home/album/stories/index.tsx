import { NavBar } from "@/components/common";
import { Column, Row } from "@/components/layout";
import {
  Text,
  Image,
  ImageSourcePropType,
  View,
  StyleSheet,
  TouchableOpacity,
  SectionList,
  ImageBackground,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ImagesAuthBackgroundPng, ImagesCoverPng } from "@/assets";

const COLUMNS = 2;
const GAP = 12;
const PADDING = 16;

interface Story {
  id: number;
  title: string;
  cover: ImageSourcePropType;
  photos: number;
  videos: number;
}

const STORIES: Story[] = [
  { id: 1, title: "2023年夏天的回忆", cover: ImagesCoverPng, photos: 32, videos: 2 },
  { id: 2, title: "2023年海边之旅",     cover: ImagesCoverPng, photos: 18, videos: 1 },
  { id: 3, title: "2022年冬天的回忆",   cover: ImagesCoverPng, photos: 28, videos: 1 },
  { id: 4, title: "2022年圣诞派对",     cover: ImagesCoverPng, photos: 40, videos: 3 },
  { id: 5, title: "2021年春天的回忆",   cover: ImagesCoverPng, photos: 45, videos: 3 },
  { id: 6, title: "2021年毕业旅行",     cover: ImagesCoverPng, photos: 55, videos: 5 },
  { id: 7, title: "2020年秋天的回忆",   cover: ImagesCoverPng, photos: 19, videos: 0 },
  { id: 8, title: "2020年生日惊喜",     cover: ImagesCoverPng, photos: 23, videos: 2 },
];

/** 配合 SectionList 实现两列网格 */
function chunk<T>(arr: T[], col: number): T[][] {
  const rows: T[][] = [];
  for (let i = 0; i < arr.length; i += col) {
    rows.push(arr.slice(i, i + col));
  }
  return rows;
}

const SECTIONS = [{ data: chunk(STORIES, COLUMNS) }];

export default function Stories() {
  const { width: screenWidth } = useWindowDimensions();
  const cardWidth = (screenWidth - PADDING * 2 - GAP * (COLUMNS - 1)) / COLUMNS;

  const renderRow = ({ item: row }: { item: Story[] }) => (
    <Row gap={GAP}>
      {row.map((story) => (
        <TouchableOpacity
          key={story.id}
          style={[styles.card, { width: cardWidth }]}
        >
          <Column gap={6}>
            <Image
              source={story.cover}
              style={{
                width: "100%",
                height: cardWidth * 0.75,
                borderRadius: 8,
              }}
            />
            <Text style={styles.cardTitle} numberOfLines={2}>
              {story.title}
            </Text>
            <Text style={styles.cardMeta}>
              {story.photos}张 · {story.videos}个视频
            </Text>
          </Column>
        </TouchableOpacity>
      ))}
      {row.length < COLUMNS && <View style={{ width: cardWidth }} />}
    </Row>
  );

  return (
    <View style={{ flex: 1 }}>
      <ImageBackground source={ImagesAuthBackgroundPng} style={{ flex: 1 }}>
        <SafeAreaView style={{ flex: 1, padding: PADDING }}>
          <NavBar title="全部故事" />
          <SectionList
            sections={SECTIONS}
            keyExtractor={(row, index) => String(row[0]?.id ?? index)}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ gap: GAP }}
            renderItem={renderRow}
          />
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 8,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "bold",
  },
  cardMeta: {
    color: "#aaa",
    fontSize: 12,
  },
});
