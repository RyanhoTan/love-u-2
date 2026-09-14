import { Play, Upload, X } from "lucide-react";
import type { ChangeEvent, DragEvent } from "react";
import { useRef, useState } from "react";
import { PageBody } from "@/components/layout/page-body";

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
            <button
              type="button"
              aria-label={`移除${file.name}`}
              onClick={() => handleRemove(file.id)}
              className="absolute right-2 top-2 grid size-6 place-items-center rounded-full bg-black/80 text-white opacity-0 transition-opacity duration-150 ease-out group-hover:opacity-100 group-focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/90 focus-visible:ring-offset-2 focus-visible:ring-offset-black/20"
            >
              <X className="size-3.5" strokeWidth={2.2} />
            </button>
          </div>
        ))}
      </div>
    </PageBody>
  );
}
