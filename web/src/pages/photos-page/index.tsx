import { Check, Image, Info, Play, X } from "lucide-react";
import { useMemo, useState } from "react";
import type { AlbumMediaItem } from "@/api/album";
import {
  errorMessage,
  useAlbumMediaQuery,
} from "@/features/album/queries";
import { PageBody } from "@/components/layout/page-body";
import { Button } from "@/components/ui/button";
import { Segmented } from "@/components/ui/segmented";

const TABS = [
  { value: "all", label: "全部" },
  { value: "photos", label: "照片" },
  { value: "videos", label: "视频" },
  { value: "saved", label: "收藏" },
] as const;

type Tab = (typeof TABS)[number]["value"];

function formatMediaDate(value: string) {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, "0")}.${String(date.getDate()).padStart(2, "0")}`;
}

function mediaCaption(media: AlbumMediaItem) {
  const time = formatMediaDate(
    media.takenAt || media.uploadedAt || media.createdAt,
  );
  const location = media.locationName.trim();

  if (time && location) {
    return `${time} · ${location}`;
  }

  return location || time;
}

function mediaSrc(media: AlbumMediaItem) {
  return media.thumbnailUrl || media.url;
}

function filterMedia(media: AlbumMediaItem[], tab: Tab) {
  if (tab === "photos") {
    return media.filter((item) => item.mediaType === "image");
  }

  if (tab === "videos") {
    return media.filter((item) => item.mediaType === "video");
  }

  if (tab === "saved") {
    return [];
  }

  return media;
}

function emptyCopy(tab: Tab) {
  if (tab === "photos") {
    return {
      title: "还没有照片",
      detail: "上传第一张照片，留住这一刻",
    };
  }

  if (tab === "videos") {
    return {
      title: "还没有视频",
      detail: "拍下日常，之后都能在这里找到",
    };
  }

  if (tab === "saved") {
    return {
      title: "还没有收藏",
      detail: "收藏的内容会出现在这里",
    };
  }

  return {
    title: "还没有照片",
    detail: "把你们的第一张回忆存进来",
  };
}

export function PhotosPage() {
  const [tab, setTab] = useState<Tab>("all");
  const [previewVideo, setPreviewVideo] = useState<AlbumMediaItem | null>(null);
  const query = useAlbumMediaQuery();

  const items = useMemo(() => {
    if (!query.data) {
      return [];
    }
    return filterMedia(query.data.media, tab);
  }, [query.data, tab]);

  if (query.isPending) {
    return (
      <PageBody scroll={false} className="gap-4">
        <Segmented value={tab} onChange={setTab} options={[...TABS]} />
        <div className="grid min-h-0 flex-1 auto-rows-fr grid-cols-4 gap-2">
          {Array.from({ length: 12 }, (_, index) => (
            <div
              key={index}
              className="aspect-square overflow-hidden rounded-control bg-border"
            />
          ))}
        </div>
      </PageBody>
    );
  }

  if (query.isError) {
    return (
      <PageBody className="gap-4">
        <Segmented value={tab} onChange={setTab} options={[...TABS]} />
        <div className="flex flex-col items-start gap-3 py-10">
          <h2 className="text-[17px] font-semibold tracking-[-0.2px] text-fg">
            相册加载失败
          </h2>
          <p className="text-sm text-fg-secondary" role="alert">
            {errorMessage(query.error)}
          </p>
          <Button variant="ghost" onClick={() => void query.refetch()}>
            重试
          </Button>
        </div>
      </PageBody>
    );
  }

  if (items.length === 0) {
    const copy = emptyCopy(tab);
    const showUpload = tab !== "saved";

    return (
      <PageBody className="gap-4">
        <Segmented value={tab} onChange={setTab} options={[...TABS]} />
        <div className="flex flex-1 flex-col items-center justify-center gap-3 py-16">
          <div className="flex size-14 items-center justify-center rounded-[16px] bg-accent-soft">
            <Image className="size-[26px] text-accent" strokeWidth={2} />
          </div>
          <h2 className="text-[17px] font-semibold tracking-[-0.2px] text-fg">
            {copy.title}
          </h2>
          <p className="text-sm text-fg-secondary">{copy.detail}</p>
          {showUpload ? (
            <Button variant="primary" to="/photos/upload" className="mt-1">
              上传照片
            </Button>
          ) : null}
        </div>
      </PageBody>
    );
  }

  return (
    <PageBody scroll={false} className="gap-4">
      <Segmented value={tab} onChange={setTab} options={[...TABS]} />
      <div className="grid min-h-0 flex-1 auto-rows-max grid-cols-4 content-start gap-2 overflow-y-auto">
        {items.map((media) => {
          const caption = mediaCaption(media);

          return (
            <div
              key={media.id}
              className="aspect-square overflow-hidden rounded-control bg-avatar"
              title={caption || undefined}
            >
              {media.mediaType === "video" ? (
                <button
                  type="button"
                  className="relative size-full cursor-pointer"
                  onClick={() => setPreviewVideo(media)}
                  aria-label={`播放${caption || "视频"}`}
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
              ) : (
                <img
                  src={mediaSrc(media)}
                  alt={caption}
                  className="size-full object-cover"
                />
              )}
            </div>
          );
        })}
      </div>
      {previewVideo ? (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-6 backdrop-blur-[8px]"
          onClick={() => setPreviewVideo(null)}
          role="dialog"
          aria-modal="true"
          aria-label={`预览${mediaCaption(previewVideo) || "视频"}`}
        >
          <video
            src={previewVideo.url}
            className="max-h-[calc(100vh-3rem)] max-w-[calc(100vw-3rem)] object-contain"
            controls
            autoPlay
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
    </PageBody>
  );
}

export function PhotosEditPage() {
  const query = useAlbumMediaQuery();

  if (query.isPending) {
    return (
      <PageBody scroll={false} className="gap-4">
        <div className="grid min-h-0 flex-1 auto-rows-fr grid-cols-4 gap-2">
          {Array.from({ length: 12 }, (_, index) => (
            <div
              key={index}
              className="aspect-square overflow-hidden rounded-control bg-border"
            />
          ))}
        </div>
      </PageBody>
    );
  }

  if (query.isError) {
    return (
      <PageBody className="gap-4">
        <div className="flex flex-col items-start gap-3 py-10">
          <h2 className="text-[17px] font-semibold tracking-[-0.2px] text-fg">
            相册加载失败
          </h2>
          <p className="text-sm text-fg-secondary" role="alert">
            {errorMessage(query.error)}
          </p>
        </div>
      </PageBody>
    );
  }

  const items = (query.data?.media ?? []).filter(
    (media) => media.mediaType === "image",
  );
  const selectedIds = new Set(items.slice(0, 2).map((media) => media.id));

  if (items.length === 0) {
    return (
      <PageBody className="items-center justify-center gap-3 text-center">
        <div className="flex size-14 items-center justify-center rounded-[16px] bg-accent-soft">
          <Image className="size-[26px] text-accent" />
        </div>
        <h2 className="text-[17px] font-semibold tracking-[-0.2px] text-fg">
          还没有可编辑的照片
        </h2>
        <p className="text-sm text-fg-secondary">先上传照片，再回来管理</p>
      </PageBody>
    );
  }

  return (
    <PageBody scroll={false} className="gap-4">
      <div className="flex shrink-0 items-center gap-2 rounded-control bg-accent-soft px-3 py-2 text-xs font-medium text-fg-secondary">
        <Info className="size-4 shrink-0 text-accent" strokeWidth={2} />
        <span>
          已选择 {selectedIds.size} 张照片，可以删除或继续选择
        </span>
      </div>

      <div className="grid min-h-0 flex-1 auto-rows-max grid-cols-4 content-start gap-2 overflow-y-auto">
        {items.map((media) => {
          const caption = mediaCaption(media);
          const selected = selectedIds.has(media.id);

          return (
            <div
              key={media.id}
              className={`group relative aspect-square overflow-hidden rounded-control bg-avatar ${
                selected ? "ring-2 ring-inset ring-accent" : ""
              }`}
              title={caption || undefined}
            >
              <img
                src={mediaSrc(media)}
                alt={caption}
                className="size-full object-cover"
              />
              {selected ? (
                <span className="pointer-events-none absolute inset-0 bg-black/30" />
              ) : null}
              <span
                className={`pointer-events-none absolute left-3 top-3 grid size-6 place-items-center rounded-full ${
                  selected
                    ? "bg-accent text-inverse"
                    : "bg-black/40 text-transparent ring-1 ring-inset ring-white/75"
                }`}
                aria-hidden="true"
              >
                {selected ? <Check className="size-3.5" strokeWidth={2.5} /> : null}
              </span>
            </div>
          );
        })}
      </div>
    </PageBody>
  );
}
