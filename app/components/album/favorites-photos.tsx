import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  SectionList,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { getFavoriteAlbumMedia, type AlbumMediaItem } from "@/app/features/album/api";
import { toast } from "@/components/common";
import { Row } from "@/components/layout";
import { chunk } from "@/utils/grid";
import { useImageViewer } from "@/hooks/use-image-viewer";

export function FavoritesPhotosGrid({
  contentWidth,
}: {
  contentWidth: number;
}) {
  const size = contentWidth > 0 ? (contentWidth - 4 * 2) / 3 : 0;
  const [photos, setPhotos] = useState<AlbumMediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { openViewer, Viewer } = useImageViewer();
  const sections = useMemo(() => [{ data: chunk(photos, 3) }], [photos]);

  const refreshPhotos = useCallback(async () => {
    try {
      setIsLoading(true);
      const media = await getFavoriteAlbumMedia();
      setPhotos(media.filter((item) => item.mediaType === "image"));
    } catch (error) {
      const message = error instanceof Error ? error.message : "加载收藏照片失败";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshPhotos();
  }, [refreshPhotos]);

  if (isLoading) {
    return (
      <View style={styles.centerState}>
        <ActivityIndicator />
      </View>
    );
  }

  if (photos.length === 0) {
    return (
      <View style={styles.centerState}>
        <Text style={styles.emptyText}>收藏故事里还没有照片</Text>
      </View>
    );
  }

  const renderRow = ({ item: row }: { item: AlbumMediaItem[] }) => (
    <Row gap={4} style={{ marginBottom: 4 }}>
      {row.map((photo) => (
        <TouchableOpacity
          key={photo.id}
          onPress={() => openViewer({ uri: photo.url })}
        >
          <Image
            source={{ uri: photo.thumbnailUrl || photo.url }}
            style={{ width: size, height: size, borderRadius: 6 }}
          />
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

const styles = {
  centerState: {
    flex: 1,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  emptyText: {
    color: "#888",
    fontSize: 14,
  },
};
