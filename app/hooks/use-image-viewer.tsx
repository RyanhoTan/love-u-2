import { useState } from "react";
import type { ImageSourcePropType } from "react-native";
import { ImageViewer } from "@/components/common";

export function useImageViewer() {
  const [visible, setVisible] = useState(false);
  const [source, setSource] = useState<ImageSourcePropType | null>(null);

  const openViewer = (src: ImageSourcePropType) => {
    setSource(src);
    setVisible(true);
  };

  const Viewer = (
    <ImageViewer
      visible={visible}
      source={source!}
      onClose={() => setVisible(false)}
    />
  );

  return { openViewer, Viewer };
}
