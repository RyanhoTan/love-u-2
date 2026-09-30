import { Link } from "react-router-dom";
import { useEffect } from "react";
import { useAnniversariesQuery } from "@/features/anniversary/queries";
import { QueryError } from "@/components/query-state";
import { Button } from "@/components/ui/button";
import { getUpcomingAnniversaries, sharedCalendarsMatch } from "@/lib/couple-calendar";

function formatDayDate(iso: string) {
  return iso ? iso.replaceAll("-", ".") : "";
}

export function NextAnniversaryInsight({ timeZone, todayDate, onCalendarMismatch }: {
  timeZone: string | null;
  todayDate: string | null;
  onCalendarMismatch: () => Promise<void>;
}) {
  const query = useAnniversariesQuery();
  const mismatch = Boolean(query.data && !sharedCalendarsMatch(query.data, { timeZone, todayDate }));
  const refetch = query.refetch;
  useEffect(() => {
    if (mismatch) {
      void refetch();
      void onCalendarMismatch();
    }
  }, [mismatch, refetch, onCalendarMismatch]);

  if (query.isPending) {
    return (
      <div className="flex min-w-0 flex-1 flex-col gap-1.5 py-0.5">
        <p className="text-xs font-medium text-fg-muted">下一个纪念日</p>
        <div className="h-[22px] w-[132px] rounded-md bg-border" />
        <div className="h-3 w-[188px] rounded bg-border" />
      </div>
    );
  }

  if (query.isError) {
    return (
      <div className="flex min-w-0 flex-1 flex-col gap-2 py-0.5">
        <p className="text-xs font-medium text-fg-muted">下一个纪念日</p>
        <QueryError
          className="items-start text-left"
          onRetry={() => void query.refetch()}
        />
      </div>
    );
  }

  if (mismatch) {
    return (
      <div className="flex flex-col gap-2" role="status">
        <p className="text-sm text-fg-muted">
          {query.isFetching ? "正在同步共同日期…" : "共同日历尚未同步，请重新加载。"}
        </p>
        {!query.isFetching ? (
          <Button variant="secondary" onClick={() => {
            void refetch();
            void onCalendarMismatch();
          }}>重新加载</Button>
        ) : null}
      </div>
    );
  }

  if (query.data.anniversaries.length && !query.data.todayDate) {
    return <QueryError onRetry={() => void query.refetch()} />;
  }
  const next = getUpcomingAnniversaries(query.data.anniversaries, query.data.todayDate)[0];

  if (!next) {
    return (
      <div className="flex min-w-0 flex-1 flex-col gap-2 py-0.5">
        <p className="text-xs font-medium text-fg-muted">下一个纪念日</p>
        <p className="text-xl font-semibold tracking-[-0.3px] text-fg">
          添加一个纪念日
        </p>
        <p className="text-[13px] text-fg-secondary">
          记录生日或恋爱日，查看下一次还有多久
        </p>
        <Button
          variant="ghost"
          to="/days/new"
          className="self-start px-0 hover:bg-transparent"
        >
          去添加
        </Button>
      </div>
    );
  }

  return (
    <Link
      to={`/days/${next.id}`}
      className="flex min-w-0 flex-1 flex-col gap-1.5 rounded-control py-0.5 transition-transform duration-100 ease-out active:scale-[0.99] motion-reduce:active:scale-100"
    >
      <p className="text-xs font-medium text-fg-muted">下一个纪念日</p>
      <p className="text-xl font-semibold tracking-[-0.3px] text-fg">
        {next.title}
      </p>
      <p className="text-[13px] text-fg-secondary">
        还剩 {next.remainingDays} 天 · {formatDayDate(next.nextOccurrenceDate)}
      </p>
    </Link>
  );
}
