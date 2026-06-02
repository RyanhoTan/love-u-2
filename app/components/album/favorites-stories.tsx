import {
  Text,
  Image,
  View,
  StyleSheet,
  TouchableOpacity,
  SectionList,
} from "react-native";
import { useRouter } from "expo-router";
import { Column, Row } from "@/components/layout";
import { chunk } from "@/utils/grid";
import { STORIES, type Story } from "@/data/mock-stories";

const COLUMNS = 2;
const GAP = 12;

export function FavoritesStoriesGrid({
  contentWidth,
}: {
  contentWidth: number;
}) {
  const router = useRouter();
  const cardWidth =
    contentWidth > 0 ? (contentWidth - GAP * (COLUMNS - 1)) / COLUMNS : 0;

  const sections = [{ data: chunk(STORIES, COLUMNS) }];

  const renderRow = ({ item: row }: { item: Story[] }) => (
    <Row gap={GAP} style={{ marginBottom: GAP }}>
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
    <SectionList
      sections={sections}
      keyExtractor={(row, index) => String(row[0]?.id ?? index)}
      showsVerticalScrollIndicator={false}
      renderItem={renderRow}
    />
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
