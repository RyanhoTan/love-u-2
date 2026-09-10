import { Link } from "react-router-dom";
import {
  errorMessage,
  useAnniversariesQuery,
} from "@/features/anniversary/queries";
import { PageBody } from "@/components/layout/page-body";
import { Button } from "@/components/ui/button";
import { isoToDotDate } from "./types";

export function DaysPage() {
  const query = useAnniversariesQuery();

  if (query.isPending) {
    return (
      <PageBody className="items-center justify-center">
        <p className="text-sm text-fg-muted">加载中…</p>
      </PageBody>
    );
  }

  if (query.isError) {
    return (
      <PageBody className="items-center justify-center gap-4">
        <p className="text-sm font-medium text-danger" role="alert">
          {errorMessage(query.error)}
        </p>
        <Button variant="secondary" onClick={() => void query.refetch()}>
          重试
        </Button>
      </PageBody>
    );
  }

  const items = query.data.anniversaries;

  if (items.length === 0) {
    return (
      <PageBody className="items-center justify-center gap-4">
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
      </PageBody>
    );
  }

  const [next, ...upcoming] = items;

  return (
    <PageBody className="gap-10">
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
    </PageBody>
  );
}
