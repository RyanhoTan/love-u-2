import { Heart } from "lucide-react";
import { Link } from "react-router-dom";
import { COUPLE } from "../../app/couple";
import { NAV_ITEMS } from "../../app/nav";
import { useRouteHandle } from "../../app/use-route-handle";
import { cx } from "../../lib/cx";
import { Avatar } from "../ui/avatar";

export function Sidebar() {
  const { navId } = useRouteHandle();

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

      <div className="flex items-center gap-2.5 rounded-xl bg-surface p-2.5">
        <div className="flex items-center">
          <Avatar src={COUPLE.ryan.src} alt={COUPLE.ryan.name} size={28} />
          <Avatar
            src={COUPLE.lin.src}
            alt={COUPLE.lin.name}
            size={28}
            className="-ml-2"
          />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-semibold text-fg">{COUPLE.names}</p>
          <p className="text-[11px] text-fg-muted">{COUPLE.days}</p>
        </div>
      </div>
    </aside>
  );
}
