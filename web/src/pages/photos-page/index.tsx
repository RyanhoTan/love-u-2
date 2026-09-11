import { Image } from "lucide-react";
import { useMemo, useState } from "react";
import type { AlbumMediaItem } from "@/api/album";
import { useAuth } from "@/features/auth/context";
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
  const { user } = useAuth();
  const bound = Boolean(user?.couple.isBound);
  const query = useAlbumMediaQuery({ enabled: bound });

  const items = useMemo(() => {
    if (!query.data) {
      return [];
    }
    return filterMedia(query.data.media, tab);
  }, [query.data, tab]);

  if (!bound) {
    return (
      <PageBody className="items-center justify-center gap-4">
        <p className="text-sm text-fg-secondary">绑定情侣后即可查看共同相册</p>
        <Button to="/me/couple">去绑定</Button>
      </PageBody>
    );
  }

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
              <img
                src={mediaSrc(media)}
                alt={caption}
                className="size-full object-cover"
              />
            </div>
          );
        })}
      </div>
    </PageBody>
  );
}
