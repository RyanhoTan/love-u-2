import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Image,
  SectionList,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { getFavoriteAlbumMedia, type AlbumMediaItem } from "@/app/features/album/api";
import { ImagesImageErrorPng } from "@/assets";
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
  const [loadState, setLoadState] = useState<"loading" | "ready" | "error">(
    "loading",
  );
  const [loadError, setLoadError] = useState("");
  const requestId = useRef(0);
  const { openViewer, Viewer } = useImageViewer();
  const sections = useMemo(() => [{ data: chunk(photos, 3) }], [photos]);

  const refreshPhotos = useCallback(async () => {
    const currentRequestId = requestId.current + 1;
    requestId.current = currentRequestId;
    setPhotos([]);
    setLoadError("");
    setLoadState("loading");

    try {
      const media = await getFavoriteAlbumMedia();
      if (requestId.current !== currentRequestId) {
        return;
      }

      setPhotos(media.filter((item) => item.mediaType === "image"));
      setLoadState("ready");
    } catch (error) {
      if (requestId.current !== currentRequestId) {
        return;
      }

      setLoadError(
        error instanceof Error ? error.message : "加载收藏照片失败，请重试",
      );
      setLoadState("error");
    }
  }, []);

  useEffect(() => {
    void refreshPhotos();
    return () => {
      requestId.current += 1;
    };
  }, [refreshPhotos]);

  const isLoading = loadState === "loading";

  if (isLoading) {
    return (
      <View style={styles.centerState}>
        <ActivityIndicator />
      </View>
    );
  }

  if (loadState === "error") {
    return (
      <View style={styles.centerState}>
        <Text accessibilityRole="alert" style={styles.errorText}>
          {loadError || "加载收藏照片失败，请重试"}
        </Text>
        <TouchableOpacity
          accessibilityRole="button"
          onPress={() => void refreshPhotos()}
          style={styles.retryButton}
        >
          <Text style={styles.retryText}>重新加载</Text>
        </TouchableOpacity>
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
            source={
              photo.thumbnailUrl || photo.url
                ? { uri: photo.thumbnailUrl || photo.url }
                : ImagesImageErrorPng
            }
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
  errorText: {
    color: "#b42318",
    fontSize: 14,
    textAlign: "center" as const,
  },
  retryButton: {
    minHeight: 44,
    justifyContent: "center" as const,
    paddingHorizontal: 16,
  },
  retryText: {
    color: "#FF4F7A",
    fontWeight: "600" as const,
  },
};
