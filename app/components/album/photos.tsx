import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useFocusEffect } from "expo-router";
import { getAlbumMedia, type AlbumMediaItem } from "@/app/features/album/api";
import { ImagesImageErrorPng } from "@/assets";
import { useImageViewer } from "@/hooks/use-image-viewer";
import { Column, Row } from "../layout";

const COLUMNS = 3;
const IMAGE_GAP = 8;

type PhotoGroup = {
  key: string;
  time: string;
  source: AlbumMediaItem[];
};

interface PhotosProps {
  refreshKey?: number;
}

function formatMonth(value: string) {
  if (!value) {
    return "未记录时间";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value.slice(0, 7);
  }

  return `${date.getFullYear()}年${date.getMonth() + 1}月`;
}

function groupPhotosByMonth(media: AlbumMediaItem[]) {
  return media.reduce<PhotoGroup[]>((groups, item) => {
    const time = formatMonth(item.takenAt || item.uploadedAt || item.createdAt);
    const group = groups.find((current) => current.time === time);

    if (group) {
      group.source.push(item);
    } else {
      groups.push({ key: time, time, source: [item] });
    }

    return groups;
  }, []);
}

export function Photos({ refreshKey = 0 }: PhotosProps) {
  const [gridWidth, setGridWidth] = useState(0);
  const [photos, setPhotos] = useState<PhotoGroup[]>([]);
  const [loadState, setLoadState] = useState<"loading" | "ready" | "error">(
    "loading",
  );
  const [loadError, setLoadError] = useState("");
  const requestId = useRef(0);
  const isFocused = useRef(false);
  const lastRefreshKey = useRef(refreshKey);
  const { openViewer, Viewer } = useImageViewer();

  const imageSize = useMemo(() => {
    if (!gridWidth) return 0;

    return Math.floor((gridWidth - IMAGE_GAP * (COLUMNS - 1)) / COLUMNS);
  }, [gridWidth]);

  const refreshPhotos = useCallback(async () => {
    const currentRequestId = requestId.current + 1;
    requestId.current = currentRequestId;
    setPhotos([]);
    setLoadError("");
    setLoadState("loading");

    try {
      const response = await getAlbumMedia();
      if (requestId.current !== currentRequestId) {
        return;
      }

      const imageMedia = response.media.filter(
        (item) => item.mediaType === "image",
      );

      setPhotos(groupPhotosByMonth(imageMedia));
      setLoadState("ready");
    } catch (error) {
      if (requestId.current !== currentRequestId) {
        return;
      }

      setLoadError(
        error instanceof Error ? error.message : "加载照片失败，请重试",
      );
      setLoadState("error");
    }
  }, []);

  useEffect(() => {
    if (lastRefreshKey.current === refreshKey) {
      return;
    }

    lastRefreshKey.current = refreshKey;
    if (isFocused.current) {
      void refreshPhotos();
    }
  }, [refreshKey, refreshPhotos]);

  useFocusEffect(
    useCallback(() => {
      isFocused.current = true;
      void refreshPhotos();
      return () => {
        isFocused.current = false;
        requestId.current += 1;
      };
    }, [refreshPhotos]),
  );

  if (loadState !== "ready") {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          gap: 12,
          padding: 24,
        }}
      >
        {loadState === "loading" ? (
          <>
            <ActivityIndicator color="#FF4F7A" />
            <Text style={{ color: "#666" }}>正在加载照片…</Text>
          </>
        ) : (
          <>
            <Text accessibilityRole="alert" style={{ color: "#b42318" }}>
              {loadError || "加载照片失败，请重试"}
            </Text>
            <TouchableOpacity
              accessibilityRole="button"
              onPress={() => void refreshPhotos()}
              style={{ minHeight: 44, justifyContent: "center", padding: 8 }}
            >
              <Text style={{ color: "#FF4F7A", fontWeight: "600" }}>
                重新加载
              </Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={{
        paddingVertical: 16,
      }}
    >
      {photos.length === 0 ? (
        <Text style={{ color: "#aaa" }}>还没有照片</Text>
      ) : null}
      {photos.map((photo) => (
        <Column key={photo.key}>
          <Row
            items="center"
            content="space-between"
            style={{ marginBottom: 16 }}
          >
            <Text style={{ fontWeight: "bold", fontSize: 16 }}>
              {photo.time}
            </Text>
            <Text style={{ fontSize: 14, color: "#aaa" }}>
              {photo.source.length}张
            </Text>
          </Row>
          <View
            onLayout={(event) => setGridWidth(event.nativeEvent.layout.width)}
            style={{
              flexWrap: "wrap",
              flex: 1,
              flexDirection: "row",
              paddingBottom: 30,
              gap: IMAGE_GAP,
            }}
          >
            {imageSize > 0 &&
              photo.source.map((src) => (
                <TouchableOpacity
                  key={src.id}
                  onPress={() => {
                    openViewer({ uri: src.url });
                  }}
                >
                  <Image
                    source={
                      src.thumbnailUrl || src.url
                        ? { uri: src.thumbnailUrl || src.url }
                        : ImagesImageErrorPng
                    }
                    style={{
                      width: imageSize,
                      height: imageSize,
                      borderRadius: 8,
                    }}
                  />
                </TouchableOpacity>
              ))}
          </View>
        </Column>
      ))}
      {Viewer}
    </ScrollView>
  );
}
