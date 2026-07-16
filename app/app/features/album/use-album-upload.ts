import { useState } from "react";
import { createAlbumMedia } from "@/app/features/album/api";
import {
  createAlbumUploadRecord,
  markAlbumUploadRecordFailed,
  markAlbumUploadRecordSuccess,
} from "@/app/features/album/upload-records";
import { toast } from "@/components/common";
import type { PickedMediaItem } from "@/hooks";
import { useMediaPicker } from "@/hooks";

function getThumbnailUri(asset: PickedMediaItem) {
  const source = asset.thumbnailSource;

  if (source && typeof source === "object" && "uri" in source) {
    return typeof source.uri === "string" ? source.uri : "";
  }

  return "";
}

export function useAlbumUpload(options?: { onSuccess?: () => void }) {
  const { pickFromLibrary } = useMediaPicker({
    mediaTypes: "mixed",
    mode: "multiple",
  });
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);

  const startUpload = async () => {
    if (isUploadingMedia) {
      return;
    }

    const assets = await pickFromLibrary();

    if (!assets.length) {
      return;
    }

    const uploadRecordId = createAlbumUploadRecord(assets);

    toast.success(`已选择 ${assets.length} 个照片/视频`);

    try {
      setIsUploadingMedia(true);

      await Promise.all(
        assets.map((asset) =>
          createAlbumMedia({
            mediaType: asset.type,
            url: asset.uri,
            thumbnailUrl: getThumbnailUri(asset),
            latitude: null,
            longitude: null,
          }),
        ),
      );

      markAlbumUploadRecordSuccess(uploadRecordId);
      toast.success(`已上传 ${assets.length} 个照片/视频`);
      options?.onSuccess?.();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "上传照片/视频失败";

      markAlbumUploadRecordFailed(uploadRecordId, message);
      toast.error(message);
    } finally {
      setIsUploadingMedia(false);
    }
  };

  return {
    isUploadingMedia,
    startUpload,
  };
}
