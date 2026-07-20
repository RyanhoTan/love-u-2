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
import { Play } from "lucide-react-native";
import {
  getFavoriteAlbumMedia,
  type AlbumMediaItem,
} from "@/app/features/album/api";
import { ImagesImageErrorPng } from "@/assets";
import { toast } from "@/components/common";
import { Row } from "@/components/layout";
import { chunk } from "@/utils/grid";
import { useVideoViewer } from "@/hooks/use-video-viewer";

export function FavoritesVideosGrid({
  contentWidth,
}: {
  contentWidth: number;
}) {
  const size = contentWidth > 0 ? (contentWidth - 4 * 2) / 3 : 0;
  const [videos, setVideos] = useState<AlbumMediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { openViewer, Viewer } = useVideoViewer();
  const sections = useMemo(() => [{ data: chunk(videos, 3) }], [videos]);

  const refreshVideos = useCallback(async () => {
    try {
      setIsLoading(true);
      const media = await getFavoriteAlbumMedia();
      setVideos(media.filter((item) => item.mediaType === "video"));
    } catch (error) {
      const message = error instanceof Error ? error.message : "加载收藏视频失败";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshVideos();
  }, [refreshVideos]);

  if (isLoading) {
    return (
      <View style={styles.centerState}>
        <ActivityIndicator />
      </View>
    );
  }

  if (videos.length === 0) {
    return (
      <View style={styles.centerState}>
        <Text style={styles.emptyText}>收藏故事里还没有视频</Text>
      </View>
    );
  }

  const renderRow = ({ item: row }: { item: AlbumMediaItem[] }) => (
    <Row gap={4} style={{ marginBottom: 4 }}>
      {row.map((video) => (
        <TouchableOpacity
          key={video.id}
          onPress={() =>
            openViewer(
              { uri: video.url },
              video.locationName || "故事视频",
              video.takenAt || video.uploadedAt,
            )
          }
        >
          <View>
            <Image
              source={
                video.thumbnailUrl || video.url
                  ? { uri: video.thumbnailUrl || video.url }
                  : ImagesImageErrorPng
              }
              style={{ width: size, height: size, borderRadius: 6 }}
            />
            <View style={styles.playButton}>
              <Play color="#fff" fill="#fff" size={16} />
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
  centerState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    color: "#888",
    fontSize: 14,
  },
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
});
