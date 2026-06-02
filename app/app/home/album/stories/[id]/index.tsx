import { useMemo, useState } from "react";
import { NavBar } from "@/components/common";
import { useImageViewer } from "@/hooks/use-image-viewer";
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
import { getStoryMedias, getStoryTitle } from "@/data/mock-stories";

const COLUMNS = 3;
const GAP = 4;
const PADDING = 16;

export default function StoryDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [gridWidth, setGridWidth] = useState(0);
  const { openViewer, Viewer } = useImageViewer();
  const imageSize = useMemo(() => {
    if (!gridWidth) return 0;
    return Math.floor((gridWidth - GAP * (COLUMNS - 1)) / COLUMNS);
  }, [gridWidth]);

  const storyId = parseInt(id ?? "1");
  const medias = getStoryMedias(storyId);
  const title = getStoryTitle(storyId);

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
                  <TouchableOpacity key={idx} onPress={() => openViewer(src)}>
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
      {Viewer}
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
