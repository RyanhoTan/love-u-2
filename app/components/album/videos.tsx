import { useCallback, useEffect, useState } from "react";
import {
  Image,
  SectionList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useFocusEffect } from "expo-router";
import { Play } from "lucide-react-native";
import { getAlbumMedia, type AlbumMediaItem } from "@/app/features/album/api";
import { ImagesImageErrorPng } from "@/assets";
import { toast } from "@/components/common";
import { useVideoViewer } from "@/hooks/use-video-viewer";
import { Column, Row } from "../layout";

type VideoItem = AlbumMediaItem;
type Section = {
  key: string;
  time: string;
  data: VideoItem[];
};

interface VideosProps {
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

function formatDate(value: string) {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value.slice(0, 10);
  }

  return date.toISOString().slice(0, 10);
}

function groupVideosByMonth(media: AlbumMediaItem[]) {
  return media.reduce<Section[]>((groups, item) => {
    const time = formatMonth(item.takenAt || item.uploadedAt || item.createdAt);
    const group = groups.find((current) => current.time === time);

    if (group) {
      group.data.push(item);
    } else {
      groups.push({ key: time, time, data: [item] });
    }

    return groups;
  }, []);
}

export function Videos({ refreshKey = 0 }: VideosProps) {
  const { openViewer, Viewer } = useVideoViewer();
  const [sections, setSections] = useState<Section[]>([]);

  const refreshVideos = useCallback(async () => {
    try {
      const response = await getAlbumMedia();
      const videoMedia = response.media.filter(
        (item) => item.mediaType === "video",
      );

      setSections(groupVideosByMonth(videoMedia));
    } catch (error) {
      const message = error instanceof Error ? error.message : "加载视频失败";
      toast.error(message);
    }
  }, []);

  useEffect(() => {
    if (refreshKey > 0) {
      void refreshVideos();
    }
  }, [refreshKey, refreshVideos]);

  useFocusEffect(
    useCallback(() => {
      void refreshVideos();
    }, [refreshVideos]),
  );

  const renderSectionHeader = useCallback(
    ({ section }: { section: Section }) => (
      <Row items="center" content="space-between" style={styles.sectionHeader}>
        <Text style={styles.sectionTime}>{section.time}</Text>
        <Text style={styles.sectionCount}>{section.data.length}个视频</Text>
      </Row>
    ),
    [],
  );

  const renderItem = useCallback(
    ({ item: video }: { item: VideoItem }) => {
      const videoDate = formatDate(
        video.takenAt || video.uploadedAt || video.createdAt,
      );

      return (
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => openViewer({ uri: video.url }, "", videoDate)}
          style={styles.videoRow}
        >
          <View style={styles.videoCover}>
            <Image
              source={
                video.thumbnailUrl
                  ? { uri: video.thumbnailUrl }
                  : ImagesImageErrorPng
              }
              resizeMode="cover"
              style={styles.videoPoster}
            />
            <View style={styles.playButton}>
              <Play color="#fff" fill="#fff" size={16} />
            </View>
          </View>
          <Column flex={1} content="space-around" style={styles.videoInfo}>
            <Text numberOfLines={2} style={styles.videoTitle}>
              {video.locationName || "视频"}
            </Text>
            <Text style={styles.videoDate}>{videoDate}</Text>
          </Column>
        </TouchableOpacity>
      );
    },
    [openViewer],
  );

  const itemSeparator = useCallback(() => <View style={{ height: 12 }} />, []);
  const sectionFooter = useCallback(() => <View style={{ height: 30 }} />, []);

  return (
    <>
      <SectionList
        sections={sections}
        keyExtractor={(item) => String(item.id)}
        renderSectionHeader={renderSectionHeader}
        renderItem={renderItem}
        ItemSeparatorComponent={itemSeparator}
        renderSectionFooter={sectionFooter}
        ListEmptyComponent={<Text style={{ color: "#aaa" }}>还没有视频</Text>}
        stickySectionHeadersEnabled={false}
        removeClippedSubviews
        maxToRenderPerBatch={8}
        windowSize={5}
        initialNumToRender={6}
        contentContainerStyle={{
          paddingVertical: 16,
        }}
      />
      {Viewer}
    </>
  );
}

const styles = StyleSheet.create({
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTime: {
    fontWeight: "bold",
    fontSize: 16,
  },
  sectionCount: {
    fontSize: 14,
    color: "#aaa",
  },
  videoRow: {
    flexDirection: "row",
    alignItems: "stretch",
    minHeight: 92,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#fff",
  },
  videoCover: {
    width: 132,
    alignSelf: "stretch",
    overflow: "hidden",
    borderRadius: 8,
    backgroundColor: "#32343a",
  },
  videoPoster: {
    ...StyleSheet.absoluteFill,
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
  videoInfo: {
    paddingLeft: 12,
    paddingVertical: 6,
  },
  videoTitle: {
    color: "#222",
    fontSize: 15,
    fontWeight: "700",
    lineHeight: 20,
  },
  videoDate: {
    color: "#999",
    fontSize: 13,
  },
});
