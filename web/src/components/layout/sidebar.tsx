import { Heart } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/features/auth/context";
import { displayName } from "@/features/user/api";
import { NAV_ITEMS } from "@/routes/nav";
import { useRouteHandle } from "@/routes/use-route-handle";
import { cx } from "../../lib/cx";
import { Avatar } from "../ui/avatar";

export function Sidebar() {
  const { navId } = useRouteHandle();
  const { user, profileStatus } = useAuth();

  const couple = user?.couple;
  const bound = Boolean(couple?.isBound && couple.partner && user);
  const partner = couple?.partner;
  const selfName = user ? displayName(user) : "";
  const partnerName = partner ? displayName(partner) : "";
  const days = couple?.daysInLove;

  return (
    <aside className="flex h-full w-[232px] shrink-0 flex-col justify-between border-r border-border bg-sidebar px-3.5 pb-[18px] pt-7 backdrop-blur-[24px]">
      <div className="flex flex-col gap-8">
        <Link to="/" className="flex items-center gap-2.5 px-0.5">
          <span className="flex size-7 items-center justify-center rounded-lg bg-accent">
            <Heart className="size-3.5 fill-inverse text-inverse" strokeWidth={2} />
          </span>
          <span className="text-[15px] font-semibold tracking-[-0.3px] text-fg">
            Love U 2
          </span>
        </Link>

        <nav className="flex flex-col gap-0.5">
          {NAV_ITEMS.map((item) => {
            const active = item.id === navId;
            const Icon = item.icon;

            return (
              <Link
                key={item.id}
                to={item.to}
                className={cx(
                  "flex h-9 items-center gap-2.5 rounded-control px-3 text-[13px] transition-colors duration-100",
                  "active:scale-[0.99]",
                  active
                    ? "bg-accent-soft font-semibold text-accent"
                    : "font-medium text-fg-secondary hover:bg-surface/70",
                )}
              >
                <Icon
                  className="size-[18px]"
                  strokeWidth={active ? 2.25 : 2}
                />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <Link
        to="/me/couple"
        className="flex items-center gap-2.5 rounded-xl bg-surface p-2.5 transition-transform duration-100 ease-out active:scale-[0.99]"
      >
        {bound && partner && user ? (
          <>
            <div className="flex items-center">
              <Avatar
                src={user.avatar ?? undefined}
                alt={selfName}
                size={28}
              />
              <Avatar
                src={partner.avatar ?? undefined}
                alt={partnerName}
                size={28}
                className="-ml-2"
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-fg">
                {selfName} 与 {partnerName}
              </p>
              <p className="text-[11px] text-fg-muted">
                {days != null ? `${days} 天` : "未设置纪念日"}
              </p>
            </div>
          </>
        ) : (
          <>
            <span className="flex size-7 items-center justify-center rounded-full bg-accent-soft">
              <Heart className="size-3.5 text-accent" strokeWidth={2} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-fg">
                {profileStatus === "loading" ? "加载中…" : "情侣空间"}
              </p>
              <p className="text-[11px] text-fg-muted">
                {profileStatus === "error" ? "加载失败" : "去绑定"}
              </p>
            </div>
          </>
        )}
      </Link>
    </aside>
  );
}
