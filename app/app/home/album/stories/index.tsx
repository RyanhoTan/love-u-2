import { NavBar } from "@/components/common";
import { Column, Row } from "@/components/layout";
import {
  Text,
  Image,
  View,
  StyleSheet,
  TouchableOpacity,
  SectionList,
  ImageBackground,
  useWindowDimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ImagesAuthBackgroundPng } from "@/assets";
import { STORIES, type Story } from "@/data/mock-stories";
import { chunk } from "@/utils/grid";

const COLUMNS = 2;
const GAP = 12;
const PADDING = 16;

const SECTIONS = [{ data: chunk(STORIES, COLUMNS) }];

export default function Stories() {
  const router = useRouter();
  const { width: screenWidth } = useWindowDimensions();
  const cardWidth = (screenWidth - PADDING * 2 - GAP * (COLUMNS - 1)) / COLUMNS;

  const renderRow = ({ item: row }: { item: Story[] }) => (
    <Row gap={GAP}>
      {row.map((story) => (
        <TouchableOpacity
          key={story.id}
          style={[styles.card, { width: cardWidth }]}
          onPress={() => router.push(`/home/album/stories/${story.id}`)}
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
