import { ChevronLeft, Play, Upload, X } from "lucide-react";
import type {
  ChangeEvent,
  DragEvent,
  PointerEvent as ReactPointerEvent,
  SubmitEvent,
  WheelEvent as ReactWheelEvent,
} from "react";
import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createAlbumMedia } from "@/api/album";
import { uploadMedia } from "@/api/upload";
import { PageBody } from "@/components/layout/page-body";
import { Button } from "@/components/ui/button";
import { errorMessage } from "@/features/album/queries";

const MIN_IMAGE_SCALE = 0.5;
const MAX_IMAGE_SCALE = 3;

type ImageOffset = {
  x: number;
  y: number;
};

type ImageDrag = ImageOffset & {
  startX: number;
  startY: number;
  pointerId: number;
};

type SelectedFile = {
  id: string;
  name: string;
  src: string;
  kind: "image" | "video";
  file: File;
  objectUrl: string;
};

export function UploadPage() {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<SelectedFile[]>([]);
  const [previewFile, setPreviewFile] = useState<SelectedFile | null>(null);
  const [imageScale, setImageScale] = useState(MIN_IMAGE_SCALE);
  const [imageOffset, setImageOffset] = useState<ImageOffset>({ x: 0, y: 0 });
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const imageDragRef = useRef<ImageDrag | null>(null);

  function addFiles(fileList: FileList | null) {
    if (!fileList) return;
    setUploadError("");

    const newFiles = Array.from(fileList).map((file) => {
      const objectUrl = URL.createObjectURL(file);

      return {
        id: objectUrl,
        name: file.name,
        src: objectUrl,
        kind: file.type.startsWith("video/")
          ? ("video" as const)
          : ("image" as const),
        file,
        objectUrl,
      };
    });

    setSelectedFiles((files) => [...files, ...newFiles]);
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    addFiles(event.target.files);
    event.target.value = "";
  }

  function handleDrop(event: DragEvent<HTMLButtonElement>) {
    event.preventDefault();
    addFiles(event.dataTransfer.files);
  }

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (uploading) return;

    const files = selectedFiles.map((selectedFile) => selectedFile.file);

    if (files.length === 0) {
      setUploadError("请选择要上传的照片或视频");
      return;
    }

    setUploadError("");
    setUploading(true);

    try {
      for (const file of files) {
        const uploaded = await uploadMedia(file);

        await createAlbumMedia({
          mediaType: file.type.startsWith("video/") ? "video" : "image",
          url: uploaded.url,
          thumbnailUrl: "",
          locationName: "",
          latitude: null,
          longitude: null,
        });
      }

      navigate("/photos");
    } catch (caught) {
      setUploadError(errorMessage(caught, "上传失败"));
    } finally {
      setUploading(false);
    }
  }

  function handleRemove(fileId: string) {
    const removedFile = selectedFiles.find((file) => file.id === fileId);
    if (removedFile) URL.revokeObjectURL(removedFile.objectUrl);

    setSelectedFiles((files) => files.filter((file) => file.id !== fileId));
  }

  function handlePreview(file: SelectedFile) {
    setPreviewFile(file);
    setImageScale(1);
    setImageOffset({ x: 0, y: 0 });
  }

  function handleClosePreview() {
    setPreviewFile(null);
    setImageScale(MIN_IMAGE_SCALE);
    setImageOffset({ x: 0, y: 0 });
  }

  function handleImageWheel(event: ReactWheelEvent<HTMLDivElement>) {
    event.preventDefault();
    const nextScale = Math.min(
      MAX_IMAGE_SCALE,
      Math.max(MIN_IMAGE_SCALE, imageScale - event.deltaY * 0.001),
    );
    setImageScale(nextScale);

    if (nextScale === MIN_IMAGE_SCALE) {
      setImageOffset({ x: 0, y: 0 });
    }
  }

  function handleImagePointerDown(event: ReactPointerEvent<HTMLImageElement>) {
    if (imageScale === MIN_IMAGE_SCALE) {
      return;
    }

    event.currentTarget.setPointerCapture(event.pointerId);
    imageDragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      x: imageOffset.x,
      y: imageOffset.y,
    };
  }

  function handleImagePointerMove(event: ReactPointerEvent<HTMLImageElement>) {
    const imageDrag = imageDragRef.current;

    if (!imageDrag || imageDrag.pointerId !== event.pointerId) {
      return;
    }

    setImageOffset({
      x: imageDrag.x + event.clientX - imageDrag.startX,
      y: imageDrag.y + event.clientY - imageDrag.startY,
    });
  }

  function handleImagePointerUp(event: ReactPointerEvent<HTMLImageElement>) {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    imageDragRef.current = null;
  }

  return (
    <>
      <header className="flex shrink-0 items-center justify-between bg-surface-soft/80 px-8 pb-3 pt-7 backdrop-blur-[20px]">
        <div className="flex min-w-0 items-center gap-2">
          <Link
            to="/photos"
            aria-label="返回"
            className="inline-flex size-9 shrink-0 items-center justify-center rounded-control text-fg transition-transform duration-100 ease-out active:scale-[0.97]"
          >
            <ChevronLeft className="size-4" strokeWidth={2} />
          </Link>
          <div className="flex min-w-0 flex-col gap-0.5">
            <h1 className="text-[22px] font-semibold leading-8 tracking-[-0.4px] text-fg">
              上传
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button type="submit" form="upload-form">
            上传
          </Button>
        </div>
      </header>
      <PageBody scroll={false} className="gap-6">
        <form
          id="upload-form"
          className="flex min-h-0 flex-1 flex-col gap-6"
          onSubmit={handleSubmit}
        >
        <button
          type="button"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
          onDragOver={(event) => event.preventDefault()} // 还在上面拖
          onDrop={handleDrop} // 松开鼠标
          className="flex min-h-0 flex-1 flex-col items-center justify-center gap-3 rounded-surface border border-border bg-surface text-center transition-colors hover:border-accent hover:bg-accent-soft/30 disabled:opacity-60"
        >
          <Upload className="size-7 text-accent" strokeWidth={1.8} />
          <span className="text-xl font-semibold tracking-[-0.3px] text-fg">
            把照片拖到这里
          </span>
          <span className="text-[13px] text-fg-muted">
            或点击选择文件 · 支持照片和视频
          </span>
        </button>

        <input
          ref={inputRef}
          type="file"
          accept="image/*,video/*"
          multiple
          disabled={uploading}
          className="hidden"
          onChange={handleFileChange}
        />

        <div className="flex shrink-0 gap-2.5">
          {selectedFiles.map((file) => (
            <div
              key={file.id}
              className="group relative size-[120px] overflow-hidden rounded-[10px] bg-avatar"
            >
            {file.kind === "video" ? (
                <video
                  src={file.src}
                  aria-label={file.name}
                  className="size-full object-cover"
                  muted
                  playsInline
                />
              ) : (
                <img
                  src={file.src}
                  alt={file.name}
                  className="size-full object-cover"
                />
              )}
              {file.kind !== "video" && (
                <div className="pointer-events-none absolute inset-0 bg-black/60 opacity-0 transition-opacity duration-150 ease-out group-hover:opacity-100 group-focus-within:opacity-100" />
              )}
              {file.kind === "video" && (
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/40">
                  <Play
                    className="size-5 text-white fill-current"
                    strokeWidth={1.8}
                  />
                </div>
              )}
              {file.kind === "image" || file.kind === "video" ? (
                <button
                  type="button"
                  aria-label={`放大查看${file.kind === "video" ? "视频" : "图片"}${file.name}`}
                  onClick={() => handlePreview(file)}
                  className="absolute inset-0 cursor-zoom-in focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white"
                />
              ) : null}
              <button
                type="button"
                disabled={uploading}
                aria-label={`移除${file.name}`}
                onClick={() => handleRemove(file.id)}
                className="absolute right-2 top-2 z-10 grid size-6 place-items-center rounded-full bg-black/80 text-white opacity-0 transition-opacity duration-150 ease-out group-hover:opacity-100 group-focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/90 focus-visible:ring-offset-2 focus-visible:ring-offset-black/20 disabled:pointer-events-none"
              >
                <X className="size-3.5" strokeWidth={2.2} />
              </button>
            </div>
          ))}
        </div>

        {uploading ? (
          <p className="shrink-0 text-sm text-fg-secondary">正在上传…</p>
        ) : null}
        {uploadError ? (
          <p className="shrink-0 text-sm font-medium text-danger" role="alert">
            {uploadError}
          </p>
        ) : null}
        </form>

      {previewFile && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-6 backdrop-blur-[8px]"
          onClick={handleClosePreview}
          role="dialog"
          aria-modal="true"
          aria-label={`预览${previewFile.name}`}
        >
          <div
            className="flex max-h-full max-w-full items-center justify-center"
            onWheel={previewFile.kind === "image" ? handleImageWheel : undefined}
          >
            {previewFile.kind === "video" && previewFile.objectUrl ? (
              <video
                src={previewFile.src}
                aria-label={previewFile.name}
                className="max-h-[calc(100vh-3rem)] max-w-[calc(100vw-3rem)] object-contain"
                controls
                playsInline
                onClick={(event) => event.stopPropagation()}
              />
            ) : (
              <img
                src={previewFile.src}
                alt={previewFile.name}
                draggable={false}
                onClick={(event) => event.stopPropagation()}
                onPointerDown={handleImagePointerDown}
                onPointerMove={handleImagePointerMove}
                onPointerUp={handleImagePointerUp}
                onPointerCancel={handleImagePointerUp}
                className={`max-h-[calc(100vh-3rem)] max-w-[calc(100vw-3rem)] object-contain ${
                  imageScale > MIN_IMAGE_SCALE
                    ? "cursor-grab touch-none active:cursor-grabbing"
                    : ""
                }`}
                style={{
                  transform: `translate(${imageOffset.x}px, ${imageOffset.y}px) scale(${imageScale})`,
                }}
              />
            )}
          </div>
          <button
            type="button"
            aria-label="关闭预览"
            onClick={handleClosePreview}
            className="absolute right-6 top-6 grid size-9 place-items-center rounded-full bg-black/65 text-white transition-colors hover:bg-black/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            <X className="size-5" strokeWidth={2} />
          </button>
        </div>
      )}
      </PageBody>
    </>
  );
}
