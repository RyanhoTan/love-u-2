import { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useVideoPlayer, VideoView } from "expo-video";
import type { VideoSource } from "expo-video";
import { X } from "lucide-react-native";
import { Column } from "@/components/layout";

export function useVideoViewer() {
  const [visible, setVisible] = useState(false);
  const [source, setSource] = useState<VideoSource | null>(null);
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");

  const openViewer = useCallback(
    (src: VideoSource, videoTitle = "", videoSubtitle = "") => {
      setSource(src);
      setTitle(videoTitle);
      setSubtitle(videoSubtitle);
      setVisible(true);
    },
    [],
  );

  const closeViewer = useCallback(() => setVisible(false), []);

  const Viewer = (
    <VideoPlayerModal
      visible={visible}
      source={source}
      title={title}
      subtitle={subtitle}
      onClose={closeViewer}
    />
  );

  return { openViewer, Viewer };
}

function VideoPlayerModal({
  visible,
  source,
  title,
  subtitle,
  onClose,
}: {
  visible: boolean;
  source: VideoSource | null;
  title: string;
  subtitle: string;
  onClose: () => void;
}) {
  if (!visible || !source) return null;

  return (
    <MountedVideoPlayerModal
      source={source}
      title={title}
      subtitle={subtitle}
      onClose={onClose}
    />
  );
}

function MountedVideoPlayerModal({
  source,
  title,
  subtitle,
  onClose,
}: {
  source: VideoSource;
  title: string;
  subtitle: string;
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

  const player = useVideoPlayer(source, (videoPlayer) => {
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
              {title ? (
                <Text numberOfLines={1} style={styles.modalTitle}>
                  {title}
                </Text>
              ) : null}
              {subtitle ? (
                <Text style={styles.modalSubtitle}>{subtitle}</Text>
              ) : null}
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
  modalSubtitle: {
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
