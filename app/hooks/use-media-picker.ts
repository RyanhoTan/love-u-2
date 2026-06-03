import { useCallback } from "react";
import { Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as VideoThumbnails from "expo-video-thumbnails";

/**
 * @file 媒体选择自定义 Hook
 * @description 属于应用通用组件/工具库部分，用于处理图片和视频的单选、多选、拍照及封面提取
 */

export type MediaPickerType = "image" | "video" | "mixed";
export type MediaPickerMode = "single" | "multiple";

export type PickedMediaItem = {
  id: string;
  uri: string;
  type: "image" | "video";
  thumbnailUri?: string;
  width: number;
  height: number;
  duration?: number | null;
  fileName?: string | null;
  mimeType?: string;
  assetId?: string | null;
  fileSize?: number;
};

type UseMediaPickerOptions = {
  mediaTypes?: MediaPickerType;
  mode?: MediaPickerMode;
  allowsEditing?: boolean;
  aspect?: [number, number];
  selectionLimit?: number;
};

const MEDIA_TYPE_MAP: Record<MediaPickerType, ImagePicker.MediaType[]> = {
  image: ["images"],
  video: ["videos"],
  mixed: ["images", "videos"],
};

async function normalizePickedAssets(
  assets: ImagePicker.ImagePickerAsset[],
): Promise<PickedMediaItem[]> {
  return Promise.all(
    assets.map(async (asset, index) => {
      let thumbnailUri = undefined;

      // 如果选中了视频，提取视频的封面帧
      if (asset.type === "video") {
        try {
          const { uri } = await VideoThumbnails.getThumbnailAsync(asset.uri, {
            time: 10, // 获取0.01秒处的画面，可以自行调节
          });
          thumbnailUri = uri;
        } catch (e) {
          console.warn("生成视频封面失败: ", e);
        }
      }

      return {
        id: asset.assetId ?? asset.fileName ?? `${asset.uri}-${index}`,
        uri: asset.uri,
        type: asset.type === "video" ? "video" : "image",
        thumbnailUri,
        width: asset.width,
        height: asset.height,
        duration: asset.duration,
        fileName: asset.fileName,
        mimeType: asset.mimeType ?? undefined,
        assetId: asset.assetId,
        fileSize: asset.fileSize,
      };
    }),
  );
}

export function useMediaPicker({
  mediaTypes = "image",
  mode = "single",
  allowsEditing,
  aspect,
  selectionLimit = 0,
}: UseMediaPickerOptions = {}) {
  const pickerMediaTypes = MEDIA_TYPE_MAP[mediaTypes];
  const shouldAllowEditing =
    allowsEditing ?? (mode === "single" && mediaTypes === "image");

  const requestCameraPermission = useCallback(async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(
        "Permission Required",
        "Camera permission is needed before taking photos or videos.",
      );
      return false;
    }

    return true;
  }, []);

  const requestLibraryPermission = useCallback(async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(
        "Permission Required",
        "Photo library permission is needed before selecting media.",
      );
      return false;
    }

    return true;
  }, []);

  const pickFromLibrary = useCallback(async () => {
    const hasPermission = await requestLibraryPermission();

    if (!hasPermission) {
      return [];
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: pickerMediaTypes,
      allowsEditing: shouldAllowEditing && mode === "single",
      ...(aspect ? { aspect } : {}),
      ...(mode === "multiple"
        ? {
            allowsMultipleSelection: true,
            selectionLimit,
          }
        : {}),
    });

    if (result.canceled) {
      return [];
    }

    return normalizePickedAssets(result.assets);
  }, [
    aspect,
    mode,
    pickerMediaTypes,
    requestLibraryPermission,
    selectionLimit,
    shouldAllowEditing,
  ]);

  const takePhoto = useCallback(async () => {
    const hasPermission = await requestCameraPermission();

    if (!hasPermission) {
      return [];
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: pickerMediaTypes,
      allowsEditing: shouldAllowEditing && mode === "single",
      ...(aspect ? { aspect } : {}),
    });

    if (result.canceled) {
      return [];
    }

    return normalizePickedAssets(result.assets);
  }, [
    aspect,
    mode,
    pickerMediaTypes,
    requestCameraPermission,
    shouldAllowEditing,
  ]);

  return {
    pickFromLibrary,
    takePhoto,
  };
}
