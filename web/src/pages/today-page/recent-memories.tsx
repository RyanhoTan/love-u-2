import { Play, X } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import type { AlbumMediaItem } from "@/api/album";
import { useAlbumMediaQuery } from "@/features/album/queries";
import { QueryError } from "@/components/query-state";
import { Button } from "@/components/ui/button";

const RECENT_COUNT = 4;

export function RecentMemories() {
  const [previewVideo, setPreviewVideo] = useState<AlbumMediaItem | null>(null);
  const query = useAlbumMediaQuery();

  if (query.isPending) {
    return (
      <section className="flex shrink-0 flex-col gap-3.5">
        <h2 className="text-[15px] font-semibold text-fg">最近的回忆</h2>
        <div className="grid grid-cols-4 gap-2.5">
          {Array.from({ length: RECENT_COUNT }, (_, index) => (
            <div
              key={index}
              className="h-37 w-full rounded-xl bg-border"
            />
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

  return (
    <section className="flex shrink-0 flex-col gap-3.5">
      <div className="flex h-9 items-center justify-between">
        <h2 className="text-[15px] font-semibold text-fg">最近的回忆</h2>
        <Button variant="ghost" to="/photos">
          查看全部
        </Button>
      </div>
      <div className="grid grid-cols-4 gap-2.5">
        {memories.map((media) => {
          const src = media.thumbnailUrl || media.url;

          if (media.mediaType === "video") {
            return (
              <button
                key={media.id}
                type="button"
                className="relative block h-37 w-full cursor-pointer border-0 bg-transparent p-0 text-left"
                onClick={() => setPreviewVideo(media)}
                aria-label="播放视频"
              >
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
              </button>
            );
          }

          return (
            <Link
              key={media.id}
              to="/photos"
              className="block overflow-hidden rounded-xl transition-transform duration-100 ease-out active:scale-[0.99] motion-reduce:active:scale-100"
            >
              <img
                src={src}
                alt=""
                className="h-37 w-full object-cover"
              />
            </Link>
          );
        })}
      </div>
      {previewVideo ? (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-6 backdrop-blur-[8px]"
          onClick={() => setPreviewVideo(null)}
          role="dialog"
          aria-modal="true"
          aria-label="预览视频"
        >
          <video
            src={previewVideo.url}
            className="max-h-[calc(100vh-3rem)] max-w-[calc(100vw-3rem)] object-contain"
            controls
            playsInline
            onClick={(event) => event.stopPropagation()}
          />
          <button
            type="button"
            aria-label="关闭预览"
            onClick={() => setPreviewVideo(null)}
            className="absolute right-6 top-6 grid size-9 place-items-center rounded-full bg-black/65 text-white transition-colors hover:bg-black/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            <X className="size-5" strokeWidth={2} />
          </button>
        </div>
      ) : null}
    </section>
  );
}
