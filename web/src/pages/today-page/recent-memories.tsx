import { Link } from "react-router-dom";
import { useAlbumMediaQuery } from "@/features/album/queries";
import { Button } from "@/components/ui/button";

const RECENT_COUNT = 4;

export function RecentMemories() {
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
        <div className="flex h-37 flex-col justify-center gap-2">
          <p className="text-[15px] font-semibold tracking-[-0.2px] text-fg">
            回忆加载失败
          </p>
          <p className="text-[13px] text-fg-secondary" role="alert">
            请检查网络后重试
          </p>
          <Button
            variant="secondary"
            className="self-start"
            onClick={() => void query.refetch()}
          >
            重试
          </Button>
        </div>
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
    </section>
  );
}
