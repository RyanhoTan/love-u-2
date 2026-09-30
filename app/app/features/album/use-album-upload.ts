import { useState } from "react";
import {
  createAlbumMedia,
  uploadAlbumFile,
} from "@/app/features/album/api";
import {
  createAlbumUploadRecord,
  markAlbumUploadRecordFailed,
  markAlbumUploadRecordSuccess,
} from "@/app/features/album/upload-records";
import { toast } from "@/components/common";
import { useMediaPicker } from "@/hooks";

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
        assets.map(async (asset) => {
          const fileName =
            asset.fileName ||
            `${asset.id}.${asset.type === "image" ? "jpg" : "mp4"}`;
          const uploaded = await uploadAlbumFile(
            asset.uri,
            fileName,
            asset.mimeType ||
              (asset.type === "image" ? "image/jpeg" : "video/mp4"),
            "album",
          );

          return createAlbumMedia({
            mediaType: asset.type,
            objectKey: uploaded.key,
            latitude: null,
            longitude: null,
          });
        }),
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
