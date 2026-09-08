import { DAYS } from "../app/mock";
import { PageBody } from "../components/layout/page-body";

export function DaysPage() {
  return (
    <PageBody className="gap-10">
      <section className="flex flex-col gap-2">
        <p className="text-[13px] font-medium tracking-[0.4px] text-fg-secondary">
          下一个纪念日
        </p>
        <h2 className="text-[28px] font-semibold tracking-[-0.6px] text-fg">
          {DAYS.next.title}
        </h2>
        <div className="flex items-end gap-2.5">
          <p className="text-[72px] font-bold leading-[0.95] tracking-[-2px] text-accent">
            {DAYS.next.remain}
          </p>
          <p className="text-xl font-semibold text-accent">天</p>
        </div>
        <p className="text-sm text-fg-muted">{DAYS.next.date}</p>
      </section>

      <section className="flex flex-col divide-y divide-border">
        {DAYS.upcoming.map((day) => (
          <div
            key={day.title}
            className="flex h-16 items-center justify-between"
          >
            <div className="flex flex-col gap-0.5">
              <p className="text-base font-medium text-fg">{day.title}</p>
              <p className="text-xs text-fg-muted">{day.date}</p>
            </div>
            <div className="flex items-end gap-1">
              <p className="text-[22px] font-semibold tracking-[-0.4px] text-fg">
                {day.remain}
              </p>
              <p className="pb-0.5 text-[13px] text-fg-muted">天</p>
            </div>
          </div>
        ))}
      </section>
    </PageBody>
  );
}
