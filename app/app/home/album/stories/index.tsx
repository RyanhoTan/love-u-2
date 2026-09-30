import { useCallback, useMemo, useRef, useState } from "react";
import { useFocusEffect, useRouter } from "expo-router";
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
import { NavBar } from "@/components/common";
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
  const [loadError, setLoadError] = useState("");
  const requestId = useRef(0);

  const cardWidth = (screenWidth - PADDING * 2 - GAP * (COLUMNS - 1)) / COLUMNS;
  const sections = useMemo(() => [{ data: chunk(stories, COLUMNS) }], [stories]);

  const refreshStories = useCallback(async () => {
    const currentRequestId = requestId.current + 1;
    requestId.current = currentRequestId;
    setStories([]);
    setLoadError("");
    setIsLoading(true);

    try {
      const response = await getAlbumStories();
      if (requestId.current !== currentRequestId) {
        return;
      }

      setStories(response.stories);
    } catch (error) {
      if (requestId.current !== currentRequestId) {
        return;
      }

      setLoadError(error instanceof Error ? error.message : "加载故事失败");
    } finally {
      if (requestId.current === currentRequestId) {
        setIsLoading(false);
      }
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void refreshStories();
      return () => {
        requestId.current += 1;
      };
    }, [refreshStories]),
  );

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
                story.coverMediaType !== "video" &&
                (story.coverThumbnailUrl || story.coverUrl)
                  ? {
                      uri: story.coverThumbnailUrl || story.coverUrl,
                    }
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
              <ActivityIndicator color="#FF4F7A" />
            </View>
          ) : loadError ? (
            <View style={styles.centerState}>
              <Text accessibilityRole="alert" style={styles.errorText}>
                {loadError}
              </Text>
              <TouchableOpacity
                accessibilityRole="button"
                onPress={() => void refreshStories()}
                style={styles.retryButton}
              >
                <Text style={styles.retryText}>重新加载</Text>
              </TouchableOpacity>
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
  errorText: {
    color: "#B42318",
    textAlign: "center",
  },
  retryButton: {
    borderRadius: 20,
    backgroundColor: "#FF4F7A",
    paddingHorizontal: 24,
    paddingVertical: 10,
  },
  retryText: {
    color: "#fff",
    fontWeight: "700",
  },
});
