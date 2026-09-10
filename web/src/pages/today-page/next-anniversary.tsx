import { Link } from "react-router-dom";
import { useAnniversariesQuery } from "@/features/anniversary/queries";
import { Button } from "@/components/ui/button";

function formatDayDate(iso: string) {
  return iso ? iso.replaceAll("-", ".") : "";
}

export function NextAnniversaryInsight() {
  const query = useAnniversariesQuery();

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
        <p className="text-xl font-semibold tracking-[-0.3px] text-fg">
          暂时打不开
        </p>
        <p className="text-[13px] text-fg-secondary">网络有点问题</p>
        <Button
          variant="ghost"
          className="self-start px-0 hover:bg-transparent"
          onClick={() => void query.refetch()}
        >
          重试
        </Button>
      </div>
    );
  }

  const next = query.data.anniversaries[0];

  if (!next) {
    return (
      <div className="flex min-w-0 flex-1 flex-col gap-2 py-0.5">
        <p className="text-xs font-medium text-fg-muted">下一个纪念日</p>
        <p className="text-xl font-semibold tracking-[-0.3px] text-fg">
          添加一个纪念日
        </p>
        <p className="text-[13px] text-fg-secondary">
          生日、恋爱日，到日子前会轻轻提醒
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
