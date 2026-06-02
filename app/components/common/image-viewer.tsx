import { Modal, Pressable, Image, StyleSheet, View } from "react-native";
import { X } from "lucide-react-native";
import type { ImageSourcePropType } from "react-native";

export interface ImageViewerProps {
  visible: boolean;
  source: ImageSourcePropType;
  onClose: () => void;
}

export function ImageViewer({ visible, source, onClose }: ImageViewerProps) {
  if (!visible) return null;

  return (
    <Modal
      visible
      transparent={false}
      animationType="fade"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <Image source={source} resizeMode="contain" style={styles.image} />
        <Pressable onPress={onClose} style={styles.closeButton}>
          <X color="#fff" size={24} />
        </Pressable>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  closeButton: {
    position: "absolute",
    top: 54,
    right: 20,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
});
