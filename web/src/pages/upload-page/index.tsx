import { ChevronLeft, Play, Upload, X } from "lucide-react";
import type {
  ChangeEvent,
  DragEvent,
  SubmitEvent,
  WheelEvent as ReactWheelEvent,
} from "react";
import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createAlbumMedia } from "@/api/album";
import { uploadMedia } from "@/api/upload";
import { PageBody } from "@/components/layout/page-body";
import {
  MediaViewer,
  type MediaViewerItem,
} from "@/components/media/media-viewer";
import { Button } from "@/components/ui/button";
import { errorMessage } from "@/features/album/queries";

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
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

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
  }

  function handleClosePreview() {
    setPreviewFile(null);
  }

  function handleThumbnailWheel(event: ReactWheelEvent<HTMLDivElement>) {
    event.preventDefault();
    event.currentTarget.scrollLeft +=
      event.deltaX !== 0 ? event.deltaX : event.deltaY;
  }

  const previewItems: MediaViewerItem[] = selectedFiles.map((file) => ({
    id: file.id,
    src: file.src,
    thumbnailSrc: file.src,
    kind: file.kind,
    label: file.name,
    alt: file.name,
  }));
  const previewIndex = previewFile
    ? selectedFiles.findIndex((file) => file.id === previewFile.id)
    : -1;

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

          <div
            className="w-full min-w-0 shrink-0 overflow-x-auto pb-1 [scrollbar-width:thin]"
            onWheel={handleThumbnailWheel}
          >
            <div className="flex w-max min-w-full gap-2.5">
              {selectedFiles.map((file) => (
                <div
                  key={file.id}
                  className="group relative size-[120px] shrink-0 overflow-hidden rounded-[10px] bg-avatar"
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
          </div>

          {uploading ? (
            <p className="shrink-0 text-sm text-fg-secondary">正在上传…</p>
          ) : null}
          {uploadError ? (
            <p
              className="shrink-0 text-sm font-medium text-danger"
              role="alert"
            >
              {uploadError}
            </p>
          ) : null}
        </form>

        {previewFile && previewIndex >= 0 ? (
          <MediaViewer
            items={previewItems}
            initialIndex={previewIndex}
            onClose={handleClosePreview}
          />
        ) : null}
      </PageBody>
    </>
  );
}
