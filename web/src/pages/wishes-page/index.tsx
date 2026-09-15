import { Gift } from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import {
  errorMessage,
  useWishesQuery,
} from "@/features/wish/queries";
import { PageBody } from "@/components/layout/page-body";
import { Button } from "@/components/ui/button";
import { Segmented } from "@/components/ui/segmented";
import { cx } from "@/lib/cx";
import {
  filterWishes,
  WISH_STATUS_LABEL,
  WISH_TABS,
  type WishTab,
} from "./types";

export function WishesPage() {
  const [tab, setTab] = useState<WishTab>("todo");
  const query = useWishesQuery();

  const items = useMemo(() => {
    if (!query.data) {
      return [];
    }
    return filterWishes(query.data.wishes, tab);
  }, [query.data, tab]);
  let body: ReactNode;

  // 骨架屏加载
  if (query.isPending) {
    body = (
      <>
        <Segmented value={tab} onChange={setTab} options={[...WISH_TABS]} />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 9 }, (_, index) => (
            <div
              key={index}
              className="overflow-hidden rounded-surface bg-surface"
            >
              <div className="h-50 bg-border" />
              <div className="flex flex-col gap-2.5 px-4 pb-4 pt-3.5">
                <div className="h-4 w-28 rounded-md bg-border" />
                <div className="flex justify-between">
                  <div className="h-3 w-12 rounded bg-border" />
                  <div className="h-3 w-10 rounded bg-border" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </>
    );
  } else if (query.isError) {
    body = (
      <>
        <Segmented value={tab} onChange={setTab} options={[...WISH_TABS]} />
        <div className="flex flex-col items-start gap-3 py-10">
          <h2 className="text-[17px] font-semibold tracking-[-0.2px] text-fg">
            心愿加载失败
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
    body = (
      <>
        <Segmented value={tab} onChange={setTab} options={[...WISH_TABS]} />
        <div className="flex flex-col items-center justify-center gap-3 py-16">
          <div className="flex size-14 items-center justify-center rounded-[16px] bg-accent-soft">
            <Gift className="size-[26px] text-accent" strokeWidth={2} />
          </div>
          <h2 className="text-[17px] font-semibold tracking-[-0.2px] text-fg">
            还没有心愿
          </h2>
          <p className="text-sm text-fg-secondary">
            写下想一起做的事，两个人都能看到
          </p>
          <Button variant="primary" to="/wishes/new" className="mt-1">
            添加心愿
          </Button>
        </div>
      </>
    );
  } else {
    body = (
      <>
        <Segmented value={tab} onChange={setTab} options={[...WISH_TABS]} />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((wish) => (
            <Link
              key={wish.id}
              to={`/wishes/${wish.id}`}
              className={cx(
                "overflow-hidden rounded-surface bg-surface",
                "shadow-[0_1px_3px_rgba(0,0,0,0.03),0_4px_12px_rgba(0,0,0,0.04)]",
                "transition-transform duration-100 ease-out active:scale-[0.99]",
                "motion-reduce:active:scale-100",
              )}
            >
              {wish.cover ? (
                <img
                  src={wish.cover}
                  alt={wish.title}
                  className="h-50 w-full object-cover"
                />
              ) : (
                <div className="flex h-50 items-center justify-center bg-avatar text-sm text-fg-muted">
                  无封面
                </div>
              )}
              <div className="flex flex-col gap-2 px-4 pb-4 pt-3.5">
                <h2 className="text-base font-semibold tracking-[-0.2px] text-fg">
                  {wish.title}
                </h2>
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-xs text-fg-secondary">
                    {wish.locationName || "未定地点"}
                  </p>
                  <p
                    className={cx(
                      "shrink-0 text-xs font-medium",
                      wish.status === "done"
                        ? "text-fg-muted"
                        : "text-accent",
                    )}
                  >
                    {WISH_STATUS_LABEL[wish.status]}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </>
    );
  }

  return (
    <>
      <header className="flex shrink-0 items-center justify-between bg-surface-soft/80 px-8 pb-3 pt-7 backdrop-blur-[20px]">
        <div className="flex min-w-0 items-center gap-2">
          <div className="flex min-w-0 flex-col gap-0.5">
            <h1 className="text-[22px] font-semibold leading-8 tracking-[-0.4px] text-fg">
              心愿
            </h1>
            <p className="text-xs text-fg-muted">你们的心愿</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button to="/wishes/new">添加心愿</Button>
        </div>
      </header>
      <PageBody className="gap-6">{body}</PageBody>
    </>
  );
}
