import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ActivityIndicator,
  Image,
  ImageBackground,
  SectionList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import {
  getAlbumStories,
  type AlbumStory,
} from "@/app/features/album/api";
import { ImagesAuthBackgroundPng, ImagesCoverPng } from "@/assets";
import { NavBar, toast } from "@/components/common";
import { Column, Row } from "@/components/layout";
import { chunk } from "@/utils/grid";

const COLUMNS = 2;
const GAP = 12;
const PADDING = 16;

export default function Stories() {
  const router = useRouter();
  const { width: screenWidth } = useWindowDimensions();
  const [stories, setStories] = useState<AlbumStory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const cardWidth = (screenWidth - PADDING * 2 - GAP * (COLUMNS - 1)) / COLUMNS;
  const sections = useMemo(() => [{ data: chunk(stories, COLUMNS) }], [stories]);

  const refreshStories = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await getAlbumStories();
      setStories(response.stories);
    } catch (error) {
      const message = error instanceof Error ? error.message : "加载故事失败";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshStories();
  }, [refreshStories]);

  const renderRow = ({ item: row }: { item: AlbumStory[] }) => (
    <Row gap={GAP}>
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
                  : ImagesCoverPng
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
    <View style={{ flex: 1 }}>
      <ImageBackground source={ImagesAuthBackgroundPng} style={{ flex: 1 }}>
        <SafeAreaView style={{ flex: 1, padding: PADDING }}>
          <NavBar title="全部故事" />
          {isLoading ? (
            <View style={styles.centerState}>
              <ActivityIndicator />
            </View>
          ) : stories.length === 0 ? (
            <View style={styles.centerState}>
              <Text style={styles.emptyText}>还没有时光故事</Text>
            </View>
          ) : (
            <SectionList
              sections={sections}
              keyExtractor={(row, index) => String(row[0]?.id ?? index)}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ gap: GAP }}
              renderItem={renderRow}
            />
          )}
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
  centerState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    fontSize: 14,
    color: "#888",
  },
});
