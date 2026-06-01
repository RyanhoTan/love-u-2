import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Image,
  Modal,
  Pressable,
  SectionList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useVideoPlayer, VideoView, type VideoSource } from "expo-video";
import { Play, X } from "lucide-react-native";
import { ImagesCoverPng, TestMp4 } from "@/assets";
import { Column, Row } from "../layout";

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
  const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null);

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
        onPress={() => setSelectedVideo(video)}
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
    [mockThumbnail],
  );

  const itemSeparator = useCallback(() => <View style={{ height: 12 }} />, []);

  const sectionFooter = useCallback(() => <View style={{ height: 30 }} />, []);

  const closePlayer = () => setSelectedVideo(null);

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
      <VideoPlayerModal video={selectedVideo} onClose={closePlayer} />
    </>
  );
}

function VideoPlayerModal({
  video,
  onClose,
}: {
  video: VideoItem | null;
  onClose: () => void;
}) {
  if (!video) return null;

  return <MountedVideoPlayerModal video={video} onClose={onClose} />;
}

function MountedVideoPlayerModal({
  video,
  onClose,
}: {
  video: VideoItem;
  onClose: () => void;
}) {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 100,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const handleClose = useCallback(() => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 100,
      useNativeDriver: true,
    }).start(() => onClose());
  }, [fadeAnim, onClose]);

  const player = useVideoPlayer(video.source, (videoPlayer) => {
    videoPlayer.loop = false;
    videoPlayer.play();
  });

  return (
    <Modal
      visible
      animationType="none"
      presentationStyle="fullScreen"
      onRequestClose={handleClose}
    >
      <View style={styles.modalBackdrop}>
        <Animated.View style={[styles.modal, { opacity: fadeAnim }]}>
          <VideoView
            player={player}
            nativeControls
            contentFit="contain"
            fullscreenOptions={{ enable: true, orientation: "default" }}
            style={styles.fullscreenVideo}
          />
          <View style={styles.modalHeader}>
            <Column flex={1} gap={4}>
              <Text numberOfLines={1} style={styles.modalTitle}>
                {video.title}
              </Text>
              <Text style={styles.modalDate}>{video.date}</Text>
            </Column>
            <Pressable onPress={handleClose} style={styles.closeButton}>
              <X color="#fff" size={22} />
            </Pressable>
          </View>
        </Animated.View>
      </View>
    </Modal>
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
  modalBackdrop: {
    flex: 1,
    backgroundColor: "#000",
  },
  modal: {
    flex: 1,
    backgroundColor: "#000",
  },
  fullscreenVideo: {
    flex: 1,
  },
  modalHeader: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 52,
    paddingBottom: 12,
    backgroundColor: "#00000070",
  },
  modalTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  modalDate: {
    color: "#ffffff99",
    fontSize: 12,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff20",
  },
});
