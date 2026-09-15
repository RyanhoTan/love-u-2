import { Play } from "lucide-react";
import { useState } from "react";
// import type { AlbumMediaItem } from "@/api/album";
import {
  MediaViewer,
  type MediaViewerItem,
} from "@/components/media/media-viewer";
import { useAlbumMediaQuery } from "@/features/album/queries";
import { QueryError } from "@/components/query-state";
import { Button } from "@/components/ui/button";

const RECENT_COUNT = 4;

export function RecentMemories() {
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);
  const query = useAlbumMediaQuery();

  if (query.isPending) {
    return (
      <section className="flex shrink-0 flex-col gap-3.5">
        <h2 className="text-[15px] font-semibold text-fg">最近的回忆</h2>
        <div className="grid grid-cols-4 gap-2.5">
          {Array.from({ length: RECENT_COUNT }, (_, index) => (
            <div key={index} className="h-37 w-full rounded-xl bg-border" />
          ))}
        </div>
      </section>
    );
  }

  if (query.isError) {
    return (
      <section className="flex shrink-0 flex-col gap-3.5">
        <h2 className="text-[15px] font-semibold text-fg">最近的回忆</h2>
        <QueryError
          className="h-37 items-start text-left"
          onRetry={() => void query.refetch()}
        />
      </section>
    );
  }

  const memories = query.data.media.slice(0, RECENT_COUNT);

  if (memories.length === 0) {
    return (
      <section className="flex shrink-0 flex-col gap-3.5">
        <h2 className="text-[15px] font-semibold text-fg">最近的回忆</h2>
        <div className="flex h-37 flex-col justify-center gap-2">
          <p className="text-[15px] font-semibold tracking-[-0.2px] text-fg">
            还没有照片
          </p>
          <p className="text-[13px] text-fg-secondary">
            把你们的第一张回忆存进来
          </p>
          <Button to="/photos/upload" className="self-start">
            上传照片
          </Button>
        </div>
      </section>
    );
  }

  const viewerItems: MediaViewerItem[] = memories.map((media) => ({
    id: media.id,
    src: media.url,
    thumbnailSrc: media.thumbnailUrl || media.url,
    kind: media.mediaType,
    label: media.mediaType === "video" ? "视频" : "照片",
  }));

  return (
    <section className="flex shrink-0 flex-col gap-3.5">
      <div className="flex h-9 items-center justify-between">
        <h2 className="text-[15px] font-semibold text-fg">最近的回忆</h2>
        <Button variant="ghost" to="/photos">
          查看全部
        </Button>
      </div>
      <div className="grid grid-cols-4 gap-2.5">
        {memories.map((media, index) => {
          const src = media.thumbnailUrl || media.url;

          return (
            <button
              key={media.id}
              type="button"
              className="group relative block h-37 w-full overflow-hidden rounded-xl border-0 bg-transparent p-0 text-left transition-transform duration-100 ease-out active:scale-[0.99] motion-reduce:active:scale-100"
              onClick={() => setPreviewIndex(index)}
              aria-label={`查看${media.mediaType === "video" ? "视频" : "照片"}`}
            >
              {media.mediaType === "video" ? (
                <span className="relative block size-full">
                  <video
                    src={media.url}
                    aria-hidden="true"
                    className="size-full object-cover"
                    muted
                    playsInline
                    preload="auto"
                  />
                  <span className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/20">
                    <Play
                      className="size-8 fill-white text-white drop-shadow"
                      strokeWidth={1.8}
                    />
                  </span>
                </span>
              ) : (
                <img src={src} alt="" className="h-37 w-full object-cover" />
              )}
            </button>
          );
        })}
      </div>
      {previewIndex !== null ? (
        <MediaViewer
          items={viewerItems}
          initialIndex={previewIndex}
          onClose={() => setPreviewIndex(null)}
        />
      ) : null}
    </section>
  );
}
