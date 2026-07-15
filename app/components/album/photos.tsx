import { useCallback, useEffect, useMemo, useState } from "react";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useFocusEffect } from "expo-router";
import { getAlbumMedia, type AlbumMediaItem } from "@/app/features/album/api";
import { toast } from "@/components/common";
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
  const { openViewer, Viewer } = useImageViewer();

  const imageSize = useMemo(() => {
    if (!gridWidth) return 0;

    return Math.floor((gridWidth - IMAGE_GAP * (COLUMNS - 1)) / COLUMNS);
  }, [gridWidth]);

  const refreshPhotos = useCallback(async () => {
    try {
      const response = await getAlbumMedia();
      const imageMedia = response.media.filter(
        (item) => item.mediaType === "image",
      );

      setPhotos(groupPhotosByMonth(imageMedia));
    } catch (error) {
      const message = error instanceof Error ? error.message : "加载照片失败";
      toast.error(message);
    }
  }, []);

  useEffect(() => {
    if (refreshKey > 0) {
      void refreshPhotos();
    }
  }, [refreshPhotos, refreshKey]);

  useFocusEffect(
    useCallback(() => {
      void refreshPhotos();
    }, [refreshPhotos]),
  );

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
                    source={{ uri: src.thumbnailUrl || src.url }}
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
