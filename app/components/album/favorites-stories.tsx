import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  SectionList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import {
  getFavoriteAlbumStories,
  type AlbumStory,
} from "@/app/features/album/api";
import { ImagesImageErrorPng } from "@/assets";
import { toast } from "@/components/common";
import { Column, Row } from "@/components/layout";
import { chunk } from "@/utils/grid";

const COLUMNS = 2;
const GAP = 12;

export function FavoritesStoriesGrid({
  contentWidth,
}: {
  contentWidth: number;
}) {
  const router = useRouter();
  const [stories, setStories] = useState<AlbumStory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const cardWidth =
    contentWidth > 0 ? (contentWidth - GAP * (COLUMNS - 1)) / COLUMNS : 0;
  const sections = useMemo(() => [{ data: chunk(stories, COLUMNS) }], [stories]);

  const refreshStories = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await getFavoriteAlbumStories();
      setStories(response.stories);
    } catch (error) {
      const message = error instanceof Error ? error.message : "加载收藏故事失败";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshStories();
  }, [refreshStories]);

  if (isLoading) {
    return (
      <View style={styles.centerState}>
        <ActivityIndicator />
      </View>
    );
  }

  if (stories.length === 0) {
    return (
      <View style={styles.centerState}>
        <Text style={styles.emptyText}>还没有收藏的故事</Text>
      </View>
    );
  }

  const renderRow = ({ item: row }: { item: AlbumStory[] }) => (
    <Row gap={GAP} style={{ marginBottom: GAP }}>
      {row.map((story) => (
        <TouchableOpacity
          key={story.id}
          style={[styles.card, { width: cardWidth }]}
          onPress={() => router.push(`/home/album/stories/${story.id}`)}
        >
          <Column gap={6}>
            <Image
              source={
                story.coverThumbnailUrl || story.coverUrl
                  ? { uri: story.coverThumbnailUrl || story.coverUrl }
                  : ImagesImageErrorPng
              }
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
  centerState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    color: "#888",
    fontSize: 14,
  },
});
