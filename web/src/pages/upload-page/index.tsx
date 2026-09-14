import { Play, Upload, X } from "lucide-react";
import type {
  ChangeEvent,
  DragEvent,
  PointerEvent as ReactPointerEvent,
  WheelEvent as ReactWheelEvent,
} from "react";
import { useRef, useState } from "react";
import { PageBody } from "@/components/layout/page-body";

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
  objectUrl?: string;
};

const SELECTED_FILES: SelectedFile[] = [
  {
    id: "cafe-latte",
    name: "cafe latte",
    src: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    kind: "image",
  },
  {
    id: "pastry-plate",
    name: "pastry plate",
    src: "https://images.unsplash.com/photo-1698899720612-dcbf89481ace?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    kind: "image",
  },
  {
    id: "cat-window",
    name: "cat window",
    src: "https://images.unsplash.com/photo-1783346063567-7783f728209a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    kind: "image",
  },
  {
    id: "sunflower-field",
    name: "sunflower field",
    src: "https://images.unsplash.com/photo-1732858560815-44149671ef07?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    kind: "image",
  },
  {
    id: "video-preview",
    name: "video preview",
    src: "https://images.unsplash.com/photo-1683993662295-93debc656a21?auto=format&fit=crop&w=240&q=80",
    kind: "video",
  },
];

export function UploadPage() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [selectedFiles, setSelectedFiles] = useState(SELECTED_FILES);
  const [previewFile, setPreviewFile] = useState<SelectedFile | null>(null);
  const [imageScale, setImageScale] = useState(MIN_IMAGE_SCALE);
  const [imageOffset, setImageOffset] = useState<ImageOffset>({ x: 0, y: 0 });
  const imageDragRef = useRef<ImageDrag | null>(null);

  function addFiles(fileList: FileList | null) {
    if (!fileList) return;

    const newFiles = Array.from(fileList).map((file) => {
      const objectUrl = URL.createObjectURL(file);

      return {
        id: objectUrl,
        name: file.name,
        src: objectUrl,
        kind: file.type.startsWith("video/")
          ? ("video" as const)
          : ("image" as const),
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

  function handleRemove(fileId: string) {
    const removedFile = selectedFiles.find((file) => file.id === fileId);
    if (removedFile?.objectUrl) URL.revokeObjectURL(removedFile.objectUrl);

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
    <PageBody scroll={false} className="gap-6">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(event) => event.preventDefault()} // 还在上面拖
        onDrop={handleDrop} // 松开鼠标
        className="flex min-h-0 flex-1 flex-col items-center justify-center gap-3 rounded-surface border border-border bg-surface text-center transition-colors hover:border-accent hover:bg-accent-soft/30"
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
        className="hidden"
        onChange={handleFileChange}
      />

      <div className="flex shrink-0 gap-2.5">
        {selectedFiles.map((file) => (
          <div
            key={file.id}
            className="group relative size-[120px] overflow-hidden rounded-[10px] bg-avatar"
          >
            {file.kind === "video" && file.objectUrl ? (
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
              aria-label={`移除${file.name}`}
              onClick={() => handleRemove(file.id)}
              className="absolute right-2 top-2 z-10 grid size-6 place-items-center rounded-full bg-black/80 text-white opacity-0 transition-opacity duration-150 ease-out group-hover:opacity-100 group-focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/90 focus-visible:ring-offset-2 focus-visible:ring-offset-black/20"
            >
              <X className="size-3.5" strokeWidth={2.2} />
            </button>
          </div>
        ))}
      </div>

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
  );
}
