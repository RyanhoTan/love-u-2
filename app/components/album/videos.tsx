import { useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useVideoPlayer, VideoView, type VideoSource } from "expo-video";
import { Play, X } from "lucide-react-native";
import { TestMp4 } from "@/assets";
import { Column, Row } from "../layout";

const PAGE_PADDING = 12;

type VideoItem = {
  id: number;
  title: string;
  date: string;
  duration: string;
  source: VideoSource;
};

type VideoGroup = {
  time: string;
  list: VideoItem[];
};

const mockVideoGroups: VideoGroup[] = [
  {
    time: "2024年5月",
    list: [
      {
        id: 1,
        title: "三亚旅行日记",
        date: "2024-05-12",
        duration: "01:24",
        source: TestMp4,
      },
      {
        id: 2,
        title: "椰风海韵海滩漫步",
        date: "2024-05-15",
        duration: "00:48",
        source: TestMp4,
      },
    ],
  },
  {
    time: "2024年4月",
    list: [
      {
        id: 3,
        title: "周末露营 VLOG",
        date: "2024-04-20",
        duration: "02:10",
        source: TestMp4,
      },
    ],
  },
  {
    time: "2023年12月",
    list: [
      {
        id: 4,
        title: "跨年烟花秀",
        date: "2023-12-31",
        duration: "01:36",
        source: TestMp4,
      },
      {
        id: 5,
        title: "冬季热咖啡测评",
        date: "2023-12-18",
        duration: "00:57",
        source: TestMp4,
      },
    ],
  },
];

export function Videos() {
  const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null);

  const closePlayer = () => {
    setSelectedVideo(null);
  };

  return (
    <>
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: PAGE_PADDING,
          paddingVertical: 16,
        }}
      >
        {mockVideoGroups.map((group) => (
          <Column key={group.time}>
            <Row
              items="center"
              content="space-between"
              style={{ marginBottom: 16 }}
            >
              <Text style={{ fontWeight: "bold", fontSize: 16 }}>
                {group.time}
              </Text>
              <Text style={{ fontSize: 14, color: "#aaa" }}>
                {group.list.length}个视频
              </Text>
            </Row>
            <Column gap={12} style={{ paddingBottom: 30 }}>
              {group.list.map((video) => (
                <TouchableOpacity
                  key={video.id}
                  activeOpacity={0.85}
                  onPress={() => setSelectedVideo(video)}
                  style={styles.videoRow}
                >
                  <View style={styles.videoCover}>
                    <View style={styles.posterGlow} />
                    <View style={styles.videoOverlay} />
                    <View style={styles.playButton}>
                      <Play color="#fff" fill="#fff" size={16} />
                    </View>
                    <Text style={styles.videoDuration}>{video.duration}</Text>
                  </View>
                  <Column
                    flex={1}
                    content="space-between"
                    style={styles.videoInfo}
                  >
                    <Text numberOfLines={2} style={styles.videoTitle}>
                      {video.title}
                    </Text>
                    <Text style={styles.videoDate}>{video.date}</Text>
                  </Column>
                </TouchableOpacity>
              ))}
            </Column>
          </Column>
        ))}
      </ScrollView>

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
  const player = useVideoPlayer(video?.source ?? null, (videoPlayer) => {
    videoPlayer.loop = false;
    videoPlayer.play();
  });

  if (!video) return null;

  return (
    <Modal
      visible
      animationType="fade"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <StatusBar hidden />
      <View style={styles.modal}>
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
          <Pressable onPress={onClose} style={styles.closeButton}>
            <X color="#fff" size={22} />
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  videoRow: {
    flexDirection: "row",
    alignItems: "stretch",
    height: 92,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#fff",
  },
  videoCover: {
    width: 132,
    height: 92,
    overflow: "hidden",
    borderRadius: 8,
    backgroundColor: "#32343a",
  },
  posterGlow: {
    position: "absolute",
    left: 10,
    right: 10,
    top: 10,
    bottom: 10,
    borderRadius: 6,
    backgroundColor: "#ff275e35",
  },
  videoOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#00000020",
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
