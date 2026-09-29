import { Heart } from "lucide-react";
import { useAuth } from "@/features/auth/context";
import { formatTodayDate } from "@/lib/date";
import { displayName, formatAnniversaryDot } from "@/lib/user";
import { PageBody } from "../../components/layout/page-body";
import { Avatar } from "../../components/ui/avatar";
import { Button } from "../../components/ui/button";
import { NextAnniversaryInsight } from "./next-anniversary";
import { RecentMemories } from "./recent-memories";

export function TodayPage() {
  const { user, profileStatus } = useAuth();
  const couple = user?.couple;
  const bound = Boolean(couple?.isBound && couple.partner);
  const days = couple?.daysInLove;
  const since = formatAnniversaryDot(couple?.anniversaryDate);
  const ownName = user ? displayName(user) : "我";
  const partner = couple?.partner;
  const partnerName = partner ? displayName(partner) : "伴侣";

  return (
    <>
      <header className="flex shrink-0 items-center justify-between bg-surface-soft/80 px-8 pb-3 pt-7 backdrop-blur-[20px]">
        <div className="flex min-w-0 items-center gap-2">
          <div className="flex min-w-0 flex-col gap-0.5">
            <h1 className="text-[22px] font-semibold leading-8 tracking-[-0.4px] text-fg">
              今天
            </h1>
            <p className="text-xs text-fg-muted">{formatTodayDate()}</p>
          </div>
        </div>
      </header>

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

          <div className="flex aspect-[280/360] h-full shrink-0 flex-col items-center justify-center gap-6 rounded-surface bg-surface px-8 text-center">
            {bound && user && partner ? (
              <>
                <div className="flex -space-x-5">
                  <Avatar
                    src={user.avatar ?? undefined}
                    alt={ownName}
                    size={88}
                    className="ring-4 ring-surface"
                  />
                  <Avatar
                    src={partner.avatar ?? undefined}
                    alt={partnerName}
                    size={88}
                    className="ring-4 ring-surface"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <p className="text-lg font-semibold text-fg">
                    {ownName} 与 {partnerName}
                  </p>
                  <p className="text-[13px] leading-5 text-fg-secondary">
                    这里展示你们真实记录下来的共同生活
                  </p>
                </div>
              </>
            ) : (
              <>
                <span className="flex size-20 items-center justify-center rounded-full bg-accent/10 text-accent">
                  <Heart className="size-9" strokeWidth={1.8} />
                </span>
                <div className="flex flex-col gap-1.5">
                  <p className="text-lg font-semibold text-fg">
                    等待两个人一起开始
                  </p>
                  <p className="text-[13px] leading-5 text-fg-secondary">
                    绑定情侣后，共同的日期与回忆会出现在这里
                  </p>
                </div>
              </>
            )}
          </div>
        </section>

        {bound ? (
          <section className="flex shrink-0 gap-8">
            <NextAnniversaryInsight />
          </section>
        ) : null}

        {bound ? <RecentMemories /> : null}
      </PageBody>
    </>
  );
}
