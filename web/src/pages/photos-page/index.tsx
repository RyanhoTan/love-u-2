import { useState } from "react";
import { PHOTOS } from "../../app/mock";
import { PageBody } from "../../components/layout/page-body";
import { Segmented } from "../../components/ui/segmented";

const TABS = [
  { value: "all", label: "全部" },
  { value: "photos", label: "照片" },
  { value: "videos", label: "视频" },
  { value: "saved", label: "收藏" },
] as const;

type Tab = (typeof TABS)[number]["value"];

export function PhotosPage() {
  const [tab, setTab] = useState<Tab>("all");

  return (
    <PageBody scroll={false} className="gap-4">
      <Segmented value={tab} onChange={setTab} options={[...TABS]} />
      <div className="grid min-h-0 flex-1 grid-cols-4 grid-rows-3 gap-2">
        {PHOTOS.map((photo) => (
          <div
            key={photo.alt}
            className="overflow-hidden rounded-control bg-avatar"
          >
            <img
              src={photo.src}
              alt={photo.alt}
              className="size-full object-cover"
            />
          </div>
        ))}
      </div>
    </PageBody>
  );
}
