import { Calendar, MapPin, User, Wallet } from "lucide-react";
import type { ReactNode } from "react";
import type { WishItem } from "@/api/wish";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { displayName } from "@/lib/user";
import { cx } from "@/lib/cx";
import {
  formatBudget,
  formatCreatedAt,
  isoToDotDate,
  WISH_STATUS_LABEL,
} from "./types";

type Creator = {
  id: number;
  username: string;
  nickname: string | null;
  avatar: string | null;
};

export function WishDetailInfo({
  wish,
  creator,
  onMarkDone,
  onAddRecord,
}: {
  wish: WishItem;
  creator: Creator | null;
  onMarkDone: () => void;
  onAddRecord: () => void;
}) {
  const isDone = wish.status === "done";

  return (
    <section className="flex w-full max-w-[480px] shrink-0 flex-col gap-5">
      {wish.cover ? (
        <img
          src={wish.cover}
          alt={wish.title}
          className="h-[300px] w-full rounded-surface object-cover"
        />
      ) : (
        <div className="flex h-[300px] items-center justify-center rounded-surface bg-avatar text-sm text-fg-muted">
          无封面
        </div>
      )}

      <div className="flex items-center gap-2">
        <span
          className={cx(
            "inline-flex h-7 items-center rounded-[8px] px-2.5 text-xs font-semibold",
            isDone ? "bg-track text-fg-secondary" : "bg-accent-soft text-accent",
          )}
        >
          {WISH_STATUS_LABEL[wish.status]}
        </span>
        {formatCreatedAt(wish.createdAt) ? (
          <span className="text-xs text-fg-muted">
            {formatCreatedAt(wish.createdAt)} 提出
          </span>
        ) : null}
      </div>
        {/* TODO: 心愿描述改为可编辑的 */}
      {wish.description ? (
        <p className="text-base leading-[1.45] tracking-[-0.1px] text-fg">
          {wish.description}
        </p>
      ) : null}

      <div className="overflow-hidden rounded-[12px] bg-surface">
        <MetaRow
          icon={<Calendar className="size-[18px]" strokeWidth={2} />}
          label="目标日"
          value={isoToDotDate(wish.targetDate) || "—"}
        />
        <div className="h-px bg-border" />
        <MetaRow
          icon={<MapPin className="size-[18px]" strokeWidth={2} />}
          label="地点"
          value={wish.locationName || "—"}
        />
        <div className="h-px bg-border" />
        <MetaRow
          icon={<Wallet className="size-[18px]" strokeWidth={2} />}
          label="预算"
          value={formatBudget(wish.budgetAmount)}
        />
        <div className="h-px bg-border" />
        <div className="flex h-12 items-center gap-3 px-4">
          <User
            className="size-[18px] shrink-0 text-fg-secondary"
            strokeWidth={2}
          />
          <span className="text-sm font-medium text-fg-secondary">提出</span>
          <span className="ml-auto flex items-center gap-2">
            {creator ? (
              <Avatar
                src={creator.avatar ?? undefined}
                alt={displayName(creator)}
                size={28}
              />
            ) : null}
            <span className="text-sm font-medium text-fg">
              {creator ? displayName(creator) : `#${wish.createdByUserId}`}
            </span>
          </span>
        </div>
      </div>

      <div className="flex gap-2 lg:hidden">
        {!isDone ? (
          <Button className="flex-1" onClick={onMarkDone}>
            标记完成
          </Button>
        ) : null}
        <Button variant="secondary" className="flex-1" onClick={onAddRecord}>
          记一笔
        </Button>
      </div>
    </section>
  );
}

function MetaRow({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex h-12 items-center gap-3 px-4">
      <span className="text-fg-secondary">{icon}</span>
      <span className="text-sm font-medium text-fg-secondary">{label}</span>
      <span className="ml-auto text-sm font-medium text-fg">{value}</span>
    </div>
  );
}
