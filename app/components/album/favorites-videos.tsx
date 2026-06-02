import {
  Image,
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  SectionList,
} from "react-native";
import { Play } from "lucide-react-native";
import { Row } from "@/components/layout";
import { chunk } from "@/utils/grid";
import { FAVORITE_VIDEOS, type FavoriteVideo } from "@/data/mock-stories";
import { useVideoViewer } from "@/hooks/use-video-viewer";
import { TestMp4 } from "@/assets";

export function FavoritesVideosGrid({
  contentWidth,
}: {
  contentWidth: number;
}) {
  const size = contentWidth > 0 ? (contentWidth - 4 * 2) / 3 : 0;
  const { openViewer, Viewer } = useVideoViewer();
  const sections = [{ data: chunk(FAVORITE_VIDEOS, 3) }];

  const renderRow = ({ item: row }: { item: FavoriteVideo[] }) => (
    <Row gap={4} style={{ marginBottom: 4 }}>
      {row.map((video) => (
        <TouchableOpacity
          key={video.id}
          onPress={() => openViewer(TestMp4, video.duration)}
        >
          <View>
            <Image
              source={video.source}
              style={{ width: size, height: size, borderRadius: 6 }}
            />
            {/* 播放按钮 */}
            <View style={styles.playButton}>
              <Play color="#fff" fill="#fff" size={16} />
            </View>
            <View style={styles.durationTag}>
              <Text style={styles.durationText}>{video.duration}</Text>
            </View>
          </View>
        </TouchableOpacity>
      ))}
      {row.length < 3 && <View style={{ width: size }} />}
    </Row>
  );

  return (
    <>
      <SectionList
        sections={sections}
        keyExtractor={(row, index) => String(row[0]?.id ?? index)}
        showsVerticalScrollIndicator={false}
        renderItem={renderRow}
      />
      {Viewer}
    </>
  );
}

const styles = StyleSheet.create({
  playButton: {
    position: "absolute",
    left: "50%",
    top: "50%",
    width: 34,
    height: 34,
    marginLeft: -17,
    marginTop: -17,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#00000060",
  },
  durationTag: {
    position: "absolute",
    bottom: 4,
    right: 4,
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  durationText: {
    color: "#fff",
    fontSize: 11,
  },
});
