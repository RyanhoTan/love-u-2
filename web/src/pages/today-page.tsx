import { Link } from "react-router-dom";
import { TODAY } from "../app/mock";
import { PageBody } from "../components/layout/page-body";
import { Button } from "../components/ui/button";

export function TodayPage() {
  return (
    <PageBody scroll={false} className="gap-9">
      <section className="flex min-h-0 min-w-0 flex-1 items-end justify-between gap-14">
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <p className="text-[13px] font-medium tracking-[0.4px] text-fg-secondary">
            我们在一起
          </p>
          <div className="flex items-end gap-2.5">
            <p className="text-[88px] font-bold leading-[0.95] tracking-[-2.4px] text-accent">
              {TODAY.days}
            </p>
            <p className="text-[22px] font-semibold tracking-[-0.3px] text-accent">
              天
            </p>
          </div>
          <p className="text-sm text-fg-muted">从 {TODAY.since} 开始</p>
        </div>
        <div className="aspect-[280/360] h-full shrink-0 overflow-hidden rounded-surface bg-avatar">
          <img
            src={TODAY.hero}
            alt="我们"
            className="size-full object-cover"
          />
        </div>
      </section>

      <section className="flex shrink-0 gap-8">
        {TODAY.insights.map((insight) => (
          <Link
            key={insight.kicker}
            to={insight.to}
            className="flex min-w-0 flex-1 flex-col gap-1.5 rounded-control py-0.5 transition-transform duration-100 ease-out active:scale-[0.99]"
          >
            <p className="text-xs font-medium text-fg-muted">{insight.kicker}</p>
            <p className="text-xl font-semibold tracking-[-0.3px] text-fg">
              {insight.title}
            </p>
            <p className="text-[13px] text-fg-secondary">{insight.detail}</p>
          </Link>
        ))}
      </section>

      <section className="flex shrink-0 flex-col gap-3.5">
        <div className="flex items-center justify-between">
          <h2 className="text-[15px] font-semibold text-fg">最近的回忆</h2>
          <Button variant="ghost" to="/photos">
            查看全部
          </Button>
        </div>
        <div className="grid grid-cols-4 gap-2.5">
          {TODAY.memories.map((photo) => (
            <img
              key={photo.alt}
              src={photo.src}
              alt={photo.alt}
              className="h-37 w-full rounded-xl object-cover"
            />
          ))}
        </div>
      </section>
    </PageBody>
  );
}
