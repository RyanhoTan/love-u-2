import { LinearGradient } from "expo-linear-gradient";
import { Camera, Images, X } from "lucide-react-native";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useStyledActionSheet } from "@/hooks/use-styled-action-sheet";
import {
  type PickedMediaItem,
  useMediaPicker,
} from "@/app/features/wish-list/use-media-picker";
import { Column } from "@/components/layout";
import { colors } from "@/styles/colors";

type CoverPickerProps = {
  value: string | null;
  onChange: (value: string) => void;
};

export function CoverPicker({ value, onChange }: CoverPickerProps) {
  const { showStyledActionSheet } = useStyledActionSheet();
  const { pickFromLibrary, takePhoto } = useMediaPicker({
    mediaTypes: "image",
    mode: "single",
    allowsEditing: true,
    aspect: [16, 9],
  });

  const applyPickedMedia = async (
    pickMedia: () => Promise<PickedMediaItem[]>,
  ) => {
    const assets = await pickMedia();

    if (assets[0]) {
      onChange(assets[0].uri);
    }
  };

  const onPress = () => {
    showStyledActionSheet(
      {
        options: ["拍照", "从相册选择", "取消"],
        cancelButtonIndex: 2,
        title: "选择图片来源",
        icons: [
          <Camera key="camera" size={20} color={colors.theme.primary} />,
          <Images key="library" size={20} color={colors.theme.primary} />,
          <X key="cancel" size={20} color={colors.theme.primary} />,
        ],
      },
      (selectedIndex?: number) => {
        switch (selectedIndex) {
          case 0:
            void applyPickedMedia(takePhoto);
            break;
          case 1:
            void applyPickedMedia(pickFromLibrary);
            break;
          default:
            break;
        }
      },
    );
  };

  return (
    <TouchableOpacity
      style={styles.coverTouchable}
      activeOpacity={0.8}
      onPress={onPress}
    >
      <LinearGradient
        colors={[colors.theme.primaryTint, colors.semantic.page]}
        start={[1, 1]}
        end={[1, 0]}
        style={StyleSheet.absoluteFill}
      />
      <LinearGradient
        colors={[colors.theme.primaryGlow, "transparent"]}
        start={[1, 0]}
        end={[0, 0]}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.contentContainer}>
        {value ? (
          <Image source={{ uri: value }} style={StyleSheet.absoluteFill} />
        ) : (
          <Column center>
            <Camera color={colors.theme.primary} height={36} width={36} />
            <Text>添加封面</Text>
          </Column>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  coverTouchable: {
    width: "100%",
    aspectRatio: 16 / 9,
    alignSelf: "center",
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.theme.primaryBorder,
  },
  contentContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    padding: 16,
    backgroundColor: "transparent",
  },
});
