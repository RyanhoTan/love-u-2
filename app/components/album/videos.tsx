import { useCallback, useMemo } from "react";
import {
  Image,
  SectionList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import type { VideoSource } from "expo-video";
import { Play } from "lucide-react-native";
import { ImagesCoverPng, TestMp4 } from "@/assets";
import { Column, Row } from "../layout";
import { useVideoViewer } from "@/hooks/use-video-viewer";

type VideoItem = {
  id: number;
  title: string;
  date: string;
  duration: string;
  source: VideoSource;
  /** 服务端预生成的缩略图 URL；未就绪时展示暗色占位 */
  thumbnailUrl?: string;
};

type VideoGroup = {
  time: string;
  list: VideoItem[];
};

const mockVideoGroups: VideoGroup[] = (() => {
  const months = [
    "2024年12月",
    "2024年11月",
    "2024年10月",
    "2024年9月",
    "2024年8月",
    "2024年7月",
    "2024年6月",
    "2024年5月",
    "2024年4月",
    "2024年3月",
  ];

  const titleTemplates = [
    "周末散步记录",
    "咖啡店慢镜头",
    "城市夜景片段",
    "午后阳光日常",
    "旅行路上的风景",
    "晚餐前的小确幸",
    "公园慢跑随拍",
    "朋友聚会花絮",
    "海边清晨剪影",
    "居家生活片段",
  ];

  const durations = [
    "00:32",
    "00:45",
    "00:58",
    "01:06",
    "01:14",
    "01:22",
    "01:31",
    "01:39",
    "01:48",
    "02:05",
  ];

  return months.map((time, groupIndex) => ({
    time,
    list: Array.from({ length: 5 }, (_, itemIndex) => {
      const id = groupIndex * 5 + itemIndex + 1;
      const month = String(12 - groupIndex).padStart(2, "0");
      const day = String(itemIndex * 4 + 3).padStart(2, "0");

      return {
        id,
        title: `${titleTemplates[(groupIndex + itemIndex) % titleTemplates.length]} ${id}`,
        date: `2024-${month}-${day}`,
        duration: durations[(groupIndex + itemIndex) % durations.length],
        source: TestMp4,
      };
    }),
  }));
})();

type Section = {
  time: string;
  data: VideoItem[];
};

export function Videos() {
  const { openViewer, Viewer } = useVideoViewer();

  // 后端就绪前，用本地素材作缩略图占位，保证 mock 展示不空
  // TODO: 真正接入后端后，这段逻辑可以删除
  const mockThumbnail = useMemo(
    () => Image.resolveAssetSource(ImagesCoverPng).uri,
    [],
  );

  const sections: Section[] = useMemo(
    () =>
      mockVideoGroups.map((group) => ({
        time: group.time,
        data: group.list,
      })),
    [],
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
    ({ item: video }: { item: VideoItem }) => (
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => openViewer(video.source, video.title, video.date)}
        style={styles.videoRow}
      >
        <View style={styles.videoCover}>
          <Image
            source={{ uri: video.thumbnailUrl ?? mockThumbnail }}
            resizeMode="cover"
            style={styles.videoPoster}
          />
          <View style={styles.playButton}>
            <Play color="#fff" fill="#fff" size={16} />
          </View>
          <Text style={styles.videoDuration}>{video.duration}</Text>
        </View>
        <Column flex={1} content="space-around" style={styles.videoInfo}>
          <Text numberOfLines={2} style={styles.videoTitle}>
            {video.title}
          </Text>
          <Text style={styles.videoDate}>{video.date}</Text>
        </Column>
      </TouchableOpacity>
    ),
    [mockThumbnail, openViewer],
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
  videoDuration: {
    position: "absolute",
    right: 6,
    top: 6,
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
    overflow: "hidden",
    color: "#fff",
    fontSize: 10,
    backgroundColor: "#00000070",
  },
});
