import { Heart, Calendar, ChevronRight } from "lucide-react";
import type { CoupleSpace } from "./types";
import {
  displayName,
  formatAnniversaryDot,
  type UserProfile,
} from "@/features/user/api";
import { Avatar } from "@/components/ui/avatar";

export function BoundView({
  space,
  me,
  onEditAnniversary,
  onUnbind,
}: {
  space: CoupleSpace;
  me: UserProfile;
  onEditAnniversary: () => void;
  onUnbind: () => void;
}) {
  const partner = space.partner!;
  const selfName = displayName(me);
  const partnerName = displayName(partner);
  const anniversary = formatAnniversaryDot(
    space.relationship?.anniversaryDate,
  );
  const days = space.daysInLove;

  return (
    <div className="flex w-full max-w-[420px] flex-col items-center gap-9">
      <section className="flex flex-col items-center gap-5">
        <div className="relative h-[140px] w-[280px]">
          <div
            aria-hidden
            className="pointer-events-none absolute left-10 top-2.5 size-[200px] h-[120px] rounded-full bg-[radial-gradient(circle_at_center,#FF6B8B33,transparent_70%)]"
          />
          <Avatar
            src={me.avatar ?? undefined}
            alt={selfName}
            size={88}
            className="absolute left-12 top-[26px] z-10 border-[3px] border-white"
          />
          <Avatar
            src={partner.avatar ?? undefined}
            alt={partnerName}
            size={88}
            className="absolute left-36 top-[26px] z-10 border-[3px] border-white"
          />
          <div className="absolute left-[122px] top-[54px] z-20 flex size-9 items-center justify-center rounded-full bg-white shadow-[0_2px_8px_rgb(28_20_24_/_0.08)]">
            <Heart className="size-4 fill-accent text-accent" strokeWidth={2} />
          </div>
        </div>

        <h2 className="text-[30px] font-semibold tracking-[-0.6px] text-fg">
          {selfName} 与 {partnerName}
        </h2>

        <div className="flex items-end gap-2">
          <p className="text-[64px] font-bold leading-[0.92] tracking-[-2px] text-accent">
            {days ?? "—"}
          </p>
          <p className="pb-1.5 text-xl font-semibold tracking-[-0.2px] text-accent">
            天
          </p>
        </div>

        <p className="text-sm text-fg-secondary">
          {anniversary ? `从 ${anniversary} 开始` : "尚未设置纪念日"}
        </p>
      </section>

      <section className="flex w-full flex-col gap-2">
        <p className="text-xs font-semibold tracking-[0.2px] text-fg-muted">
          关系
        </p>
        <div className="overflow-hidden rounded-surface border border-border bg-surface shadow-[0_1px_2px_rgb(28_20_24_/_0.04)]">
          <button
            type="button"
            onClick={onEditAnniversary}
            className="flex h-11 w-full items-center gap-3 px-3.5 text-left transition-[background-color,transform] duration-100 ease-out hover:bg-surface-soft active:scale-[0.99]"
          >
            <Calendar className="size-[18px] text-fg-secondary" strokeWidth={2} />
            <span className="min-w-0 flex-1 text-[15px] font-medium text-fg">
              纪念日
              <span className="whitespace-pre text-fg">
                {"    "}
                {anniversary ?? "未设置"}
              </span>
            </span>
            <ChevronRight
              className="size-4 text-fg-muted"
              strokeWidth={2}
            />
          </button>
        </div>
      </section>

      <button
        type="button"
        onClick={onUnbind}
        className="inline-flex h-9 items-center justify-center rounded-control px-3 text-[13px] font-medium text-danger transition-transform duration-100 ease-out active:scale-[0.97]"
      >
        解除绑定
      </button>
    </div>
  );
}
