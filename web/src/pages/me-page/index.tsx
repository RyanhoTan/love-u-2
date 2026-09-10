import {
  Activity,
  Bell,
  ChevronRight,
  Heart,
  Palette,
  User,
  type LucideIcon,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/features/auth/context";
import { displayName } from "@/features/user/api";
import { PageBody } from "@/components/layout/page-body";
import { Avatar } from "@/components/ui/avatar";

const GROUPS: {
  label: string;
  rows: { to: string; label: string; icon: LucideIcon }[];
}[] = [
  {
    label: "情侣空间",
    rows: [
      { to: "/me/couple", label: "情侣空间", icon: Heart },
      { to: "/me/report", label: "恋爱报告", icon: Activity },
    ],
  },
  {
    label: "账户",
    rows: [
      { to: "/me/profile", label: "个人资料", icon: User },
      { to: "/me/notify", label: "通知", icon: Bell },
      { to: "/me/appearance", label: "外观", icon: Palette },
    ],
  },
];

export function MePage() {
  const { signOut, user } = useAuth();

  const name = user ? displayName(user) : "";
  const signature = user?.signature?.trim() || "";
  const avatarSrc = user?.avatar ?? undefined;

  return (
    <PageBody className="gap-8">
      <section className="flex flex-col items-center gap-3">
        <Avatar src={avatarSrc} alt={name || "avatar"} size={88} />
        <h2 className="text-[28px] font-semibold tracking-[-0.5px] text-fg">
          {name}
        </h2>
        {signature ? (
          <p className="text-sm text-fg-secondary">{signature}</p>
        ) : null}
      </section>

      <div className="flex w-full max-w-140 flex-col gap-5">
        {GROUPS.map((group) => (
          <section key={group.label} className="flex flex-col gap-2">
            <p className="text-xs font-medium tracking-[0.4px] text-fg-muted">
              {group.label}
            </p>
            <div className="overflow-hidden rounded-xl bg-surface">
              {group.rows.map((row, index) => {
                const Icon = row.icon;

                return (
                  <div key={row.to}>
                    {index > 0 ? <div className="h-px bg-border" /> : null}
                    <Link
                      to={row.to}
                      className="flex h-11 items-center gap-3 px-3.5 text-[15px] font-medium text-fg transition-[background-color,transform] duration-100 ease-out hover:bg-surface-soft active:scale-[0.99]"
                    >
                      <Icon
                        className="size-4.5 text-fg-secondary"
                        strokeWidth={2}
                      />
                      <span className="min-w-0 flex-1">{row.label}</span>
                      <ChevronRight
                        className="size-4 text-fg-muted"
                        strokeWidth={2}
                      />
                    </Link>
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>

      <button
        type="button"
        onClick={signOut}
        className="inline-flex h-9 items-center justify-center rounded-control px-3 text-[13px] font-medium text-danger transition-transform duration-100 ease-out active:scale-[0.97]"
      >
        退出登录
      </button>
    </PageBody>
  );
}
