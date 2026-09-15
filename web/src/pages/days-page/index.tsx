import { Link } from "react-router-dom";
import type { ReactNode } from "react";
import { useAnniversariesQuery } from "@/features/anniversary/queries";
import { PageBody } from "@/components/layout/page-body";
import { QueryError } from "@/components/query-state";
import { Button } from "@/components/ui/button";
import { isoToDotDate } from "./types";

export function DaysPage() {
  const query = useAnniversariesQuery();
  const items = query.data?.anniversaries ?? [];
  let body: ReactNode;
  let bodyClassName = "gap-10";

  if (query.isPending) {
    bodyClassName = "items-center justify-center";
    body = <p className="text-sm text-fg-muted">加载中…</p>;
  } else if (query.isError) {
    bodyClassName = "items-center justify-center";
    body = <QueryError onRetry={() => void query.refetch()} />;
  } else if (items.length === 0) {
    bodyClassName = "items-center justify-center gap-4";
    body = (
      <>
        <div className="flex max-w-sm flex-col items-center gap-2 text-center">
          <h2 className="text-lg font-semibold tracking-[-0.2px] text-fg">
            还没有纪念日
          </h2>
          <p className="text-sm leading-[1.45] text-fg-secondary">
            添加生日、恋爱日或节日，到日子前会轻轻提醒你们。
          </p>
        </div>
        <Button variant="primary" to="/days/new">
          添加纪念日
        </Button>
      </>
    );
  } else {
    const [next, ...upcoming] = items;

    body = (
      <>
        <Link
          to={`/days/${next.id}`}
          className="flex flex-col gap-2 transition-transform duration-100 ease-out active:scale-[0.99]"
        >
          <p className="text-[13px] font-medium tracking-[0.4px] text-fg-secondary">
            下一个纪念日
          </p>
          <h2 className="text-[28px] font-semibold tracking-[-0.6px] text-fg">
            {next.title}
          </h2>
          <div className="flex items-end gap-2.5">
            <p className="text-[72px] font-bold leading-[0.95] tracking-[-2px] text-accent">
              {next.remainingDays}
            </p>
            <p className="text-xl font-semibold text-accent">天</p>
          </div>
          <p className="text-sm text-fg-muted">
            {isoToDotDate(next.nextOccurrenceDate)}
          </p>
        </Link>

        {upcoming.length > 0 ? (
          <section className="flex flex-col divide-y divide-border">
            {upcoming.map((day) => (
              <Link
                key={day.id}
                to={`/days/${day.id}`}
                className="flex h-16 items-center justify-between transition-[background-color,transform] duration-100 ease-out hover:bg-surface-soft/60 active:scale-[0.99]"
              >
                <div className="flex flex-col gap-0.5">
                  <p className="text-base font-medium text-fg">{day.title}</p>
                  <p className="text-xs text-fg-muted">
                    {isoToDotDate(day.nextOccurrenceDate)}
                  </p>
                </div>
                <div className="flex items-end gap-1">
                  <p className="text-[22px] font-semibold tracking-[-0.4px] text-fg">
                    {day.remainingDays}
                  </p>
                  <p className="pb-0.5 text-[13px] text-fg-muted">天</p>
                </div>
              </Link>
            ))}
          </section>
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
              纪念日
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button to="/days/new">添加</Button>
        </div>
      </header>
      <PageBody className={bodyClassName}>{body}</PageBody>
    </>
  );
}
