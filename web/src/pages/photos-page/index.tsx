import {
  Check,
  ChevronLeft,
  Image,
  Info,
  Play,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import type { AlbumMediaItem } from "@/api/album";
import { errorMessage, useAlbumMediaQuery } from "@/features/album/queries";
import { PageBody } from "@/components/layout/page-body";
import { Button, IconButton } from "@/components/ui/button";
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
  let body: ReactNode;
  const scroll = query.isError || (!query.isPending && items.length === 0);

  if (query.isPending) {
    body = (
      <>
        <Segmented value={tab} onChange={setTab} options={[...TABS]} />
        <div className="grid min-h-0 flex-1 auto-rows-fr grid-cols-4 gap-2">
          {Array.from({ length: 12 }, (_, index) => (
            <div
              key={index}
              className="aspect-square overflow-hidden rounded-control bg-border"
            />
          ))}
        </div>
      </>
    );
  } else if (query.isError) {
    body = (
      <>
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
      </>
    );
  } else if (items.length === 0) {
    const copy = emptyCopy(tab);
    const showUpload = tab !== "saved";

    body = (
      <>
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
      </>
    );
  } else {
    body = (
      <>
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
      </>
    );
  }

  return (
    <>
      <header className="flex shrink-0 items-center justify-between bg-surface-soft/80 px-8 pb-3 pt-7 backdrop-blur-[20px]">
        <div className="flex min-w-0 items-center gap-2">
          <div className="flex min-w-0 flex-col gap-0.5">
            <h1 className="text-[22px] font-semibold leading-8 tracking-[-0.4px] text-fg">
              相册
            </h1>
            <p className="text-xs text-fg-muted">共同相册</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <IconButton label="搜索">
            <Search className="size-4" strokeWidth={2} />
          </IconButton>
          <Button variant="ghost" to="/photos/edit">
            编辑
          </Button>
          <Button to="/photos/upload">上传</Button>
        </div>
      </header>
      <PageBody scroll={scroll} className="gap-4">
        {body}
      </PageBody>
    </>
  );
}

export function PhotosEditPage() {
  const query = useAlbumMediaQuery();
  const queryItems = (query.data?.media ?? []).filter(
    (media) => media.mediaType === "image",
  );
  const [editedItems, setEditedItems] = useState<AlbumMediaItem[] | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(() => new Set());
  const [confirmDelete, setConfirmDelete] = useState(false);
  const items = editedItems ?? queryItems;
  const allSelected = items.length > 0 && selectedIds.size === items.length;

  function toggleSelected(id: number) {
    setSelectedIds((current) => {
      const next = new Set(current);

      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }

      return next;
    });
  }

  function toggleAll() {
    setSelectedIds(
      allSelected ? new Set() : new Set(items.map((media) => media.id)),
    );
  }

  function deleteSelected() {
    setEditedItems(items.filter((media) => !selectedIds.has(media.id)));
    setSelectedIds(new Set());
    setConfirmDelete(false);
  }

  const showEditActions = !query.isPending && !query.isError && items.length > 0;
  let body: ReactNode;
  const scroll = query.isError || (!query.isPending && items.length === 0);

  if (query.isPending) {
    body = (
      <div className="grid min-h-0 flex-1 auto-rows-fr grid-cols-4 gap-2">
        {Array.from({ length: 12 }, (_, index) => (
          <div
            key={index}
            className="aspect-square overflow-hidden rounded-control bg-border"
          />
        ))}
      </div>
    );
  } else if (query.isError) {
    body = (
      <div className="flex flex-col items-start gap-3 py-10">
        <h2 className="text-[17px] font-semibold tracking-[-0.2px] text-fg">
          相册加载失败
        </h2>
        <p className="text-sm text-fg-secondary" role="alert">
          {errorMessage(query.error)}
        </p>
      </div>
    );
  } else if (items.length === 0) {
    body = (
      <div className="flex flex-col items-center justify-center gap-3 text-center">
        <div className="flex size-14 items-center justify-center rounded-[16px] bg-accent-soft">
          <Image className="size-[26px] text-accent" />
        </div>
        <h2 className="text-[17px] font-semibold tracking-[-0.2px] text-fg">
          还没有可编辑的照片
        </h2>
        <p className="text-sm text-fg-secondary">先上传照片，再回来管理</p>
      </div>
    );
  } else {
    body = (
      <>
        <div className="flex shrink-0 items-center gap-2 rounded-control bg-accent-soft px-3 py-2 text-xs font-medium text-fg-secondary">
          <Info className="size-4 shrink-0 text-accent" strokeWidth={2} />
          <span>
            {selectedIds.size > 0
              ? `已选择 ${selectedIds.size} 张照片，可以删除或继续选择`
              : "请选择照片后进行删除"}
          </span>
        </div>

        <div className="grid min-h-0 flex-1 auto-rows-max grid-cols-4 content-start gap-2 overflow-y-auto">
          {items.map((media) => {
            const caption = mediaCaption(media);
            const selected = selectedIds.has(media.id);

            return (
              <button
                key={media.id}
                type="button"
                className={`group relative aspect-square overflow-hidden rounded-control bg-avatar text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                  selected ? "ring-2 ring-inset ring-accent" : ""
                }`}
                title={caption || undefined}
                aria-label={`${selected ? "取消选择" : "选择"}${caption || "照片"}`}
                aria-pressed={selected}
                onClick={() => toggleSelected(media.id)}
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
                  {selected ? (
                    <Check className="size-3.5" strokeWidth={2.5} />
                  ) : null}
                </span>
              </button>
            );
          })}
        </div>
      </>
    );
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
              编辑照片
            </h1>
          </div>
        </div>
        {showEditActions ? (
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={toggleAll}>
              {allSelected ? "取消全选" : "全选"}
            </Button>
            <Button
              variant="danger"
              className="disabled:opacity-60"
              disabled={selectedIds.size === 0}
              onClick={() => setConfirmDelete(true)}
            >
              <Trash2 className="size-4" strokeWidth={2} />
              删除 {selectedIds.size} 张
            </Button>
          </div>
        ) : null}
    </header>
      <PageBody scroll={scroll} className="gap-4">
        {body}
      </PageBody>

      {confirmDelete ? (
        <PhotoDeleteDialog
          count={selectedIds.size}
          onCancel={() => setConfirmDelete(false)}
          onConfirm={deleteSelected}
        />
      ) : null}
    </>
  );
}

function PhotoDeleteDialog({
  count,
  onCancel,
  onConfirm,
}: {
  count: number;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-overlay px-6 py-6 backdrop-blur-[16px]"
      onClick={onCancel}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          onCancel();
        }
      }}
      role="presentation"
    >
      <div
        className="w-full max-w-[400px] overflow-hidden rounded-[20px] bg-surface shadow-[0_12px_40px_rgb(28_20_24_/_0.1)]"
        onClick={(event) => event.stopPropagation()}
        role="presentation"
      >
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-photos-title"
          className="flex flex-col items-center gap-2 px-6 pb-6 pt-7 text-center"
        >
          <div className="mb-1 flex size-11 items-center justify-center rounded-full bg-danger/8">
            <Trash2 className="size-5 text-danger" strokeWidth={2} />
          </div>
          <h2
            id="delete-photos-title"
            className="text-lg font-semibold tracking-[-0.3px] text-fg"
          >
            删除所选照片？
          </h2>
          <p className="text-sm leading-[1.45] tracking-[-0.1px] text-fg-secondary">
            将从当前编辑视图移除 {count} 张照片。
          </p>
        </div>

        <div className="h-px bg-border" />

        <div className="flex h-[52px] items-stretch">
          <button
            type="button"
            onClick={onCancel}
            className="flex flex-1 items-center justify-center text-base font-medium tracking-[-0.2px] text-fg transition-colors duration-100 ease-out hover:bg-surface-soft active:scale-[0.99]"
          >
            取消
          </button>
          <div className="w-px bg-border" />
          <button
            type="button"
            onClick={onConfirm}
            className="flex flex-1 items-center justify-center text-base font-semibold tracking-[-0.2px] text-danger transition-colors duration-100 ease-out hover:bg-surface-soft active:scale-[0.99]"
          >
            删除
          </button>
        </div>
      </div>
    </div>
  );
}
