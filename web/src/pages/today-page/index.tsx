import { Link } from "react-router-dom";
import { useAuth } from "@/features/auth/context";
import { formatAnniversaryDot } from "@/lib/user";
import { TODAY } from "@/mocks";
import { PageBody } from "../../components/layout/page-body";
import { Button } from "../../components/ui/button";
import { NextAnniversaryInsight } from "./next-anniversary";
import { RecentMemories } from "./recent-memories";

export function TodayPage() {
  const { user, profileStatus } = useAuth();
  const couple = user?.couple;
  const bound = Boolean(couple?.isBound);
  const days = couple?.daysInLove;
  const since = formatAnniversaryDot(couple?.anniversaryDate);

  return (
    <PageBody scroll={false} className="gap-9">
      <section className="flex min-h-0 min-w-0 flex-1 items-end justify-between gap-14">
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          {profileStatus === "loading" ? (
            <p className="text-sm text-fg-muted">加载中…</p>
          ) : bound ? (
            <>
              <p className="text-[13px] font-medium tracking-[0.4px] text-fg-secondary">
                我们在一起
              </p>
              <div className="flex items-end gap-2.5">
                <p className="text-[88px] font-bold leading-[0.95] tracking-[-2.4px] text-accent">
                  {days ?? "—"}
                </p>
                <p className="text-[22px] font-semibold tracking-[-0.3px] text-accent">
                  天
                </p>
              </div>
              <p className="text-sm text-fg-muted">
                {since ? `从 ${since} 开始` : "尚未设置纪念日"}
              </p>
            </>
          ) : (
            <>
              <p className="text-[13px] font-medium tracking-[0.4px] text-fg-secondary">
                情侣空间
              </p>
              <p className="max-w-[320px] text-[28px] font-semibold leading-[1.2] tracking-[-0.6px] text-fg">
                绑定后开始记录在一起的天数
              </p>
              <div className="pt-2">
                <Button to="/me/couple">去绑定</Button>
              </div>
            </>
          )}
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
        <NextAnniversaryInsight />
        {TODAY.insights.map((insight) => (
          <Link
            key={insight.kicker}
            to={insight.to}
            className="flex min-w-0 flex-1 flex-col gap-1.5 rounded-control py-0.5 transition-transform duration-100 ease-out active:scale-[0.99] motion-reduce:active:scale-100"
          >
            <p className="text-xs font-medium text-fg-muted">{insight.kicker}</p>
            <p className="text-xl font-semibold tracking-[-0.3px] text-fg">
              {insight.title}
            </p>
            <p className="text-[13px] text-fg-secondary">{insight.detail}</p>
          </Link>
        ))}
      </section>

      <RecentMemories />
    </PageBody>
  );
}
