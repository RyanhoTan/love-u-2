import { Bell, ChevronLeft, Ellipsis, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/app/auth";
import { displayName } from "@/app/user-api";
import { useRouteHandle } from "../../app/use-route-handle";
import { formatToolbarDate } from "../../lib/date";
import { Avatar } from "../ui/avatar";
import { Button, IconButton } from "../ui/button";
import type { ToolbarAction } from "../../app/types";

export function Toolbar() {
  const handle = useRouteHandle();
  const { user, profileStatus } = useAuth();
  const meta =
    handle.meta === "today-date" ? formatToolbarDate() : handle.meta;

  const partner = user?.couple.isBound ? user.couple.partner : null;
  const partnerName = partner ? displayName(partner) : "";

  return (
    <header className="flex shrink-0 items-center justify-between bg-surface-soft/80 px-8 pb-3 pt-7 backdrop-blur-[20px]">
      <div className="flex min-w-0 items-center gap-2">
        {handle.backTo ? (
          <Link
            to={handle.backTo}
            aria-label="返回"
            className="inline-flex size-9 shrink-0 items-center justify-center rounded-control text-fg transition-transform duration-100 ease-out active:scale-[0.97]"
          >
            <ChevronLeft className="size-4" strokeWidth={2} />
          </Link>
        ) : null}

        {handle.peer ? (
          partner ? (
            <div className="flex items-center gap-2.5">
              <Avatar
                src={partner.avatar ?? undefined}
                alt={partnerName}
                size={32}
              />
              <div className="flex flex-col gap-px">
                <p className="text-base font-semibold tracking-[-0.2px] text-fg">
                  {partnerName}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex min-w-0 flex-col gap-0.5">
              <h1 className="text-[22px] font-semibold leading-8 tracking-[-0.4px] text-fg">
                对话
              </h1>
              <p className="text-xs text-fg-muted">
                {profileStatus === "loading"
                  ? "加载中…"
                  : "绑定情侣后即可对话"}
              </p>
            </div>
          )
        ) : (
          <div className="flex min-w-0 flex-col gap-0.5">
            <h1 className="text-[22px] font-semibold leading-8 tracking-[-0.4px] text-fg">
              {handle.title}
            </h1>
            {meta ? (
              <p className="text-xs text-fg-muted">{meta}</p>
            ) : null}
          </div>
        )}
      </div>

      {handle.actions?.length ? (
        <div className="flex items-center gap-2">
          {handle.actions.map((action) => (
            <ToolbarActionButton key={actionKey(action)} action={action} />
          ))}
        </div>
      ) : null}
    </header>
  );
}

function actionKey(action: ToolbarAction) {
  if (action.kind === "primary" || action.kind === "ghost") {
    return `${action.kind}-${action.label}`;
  }
  return action.kind;
}

function ToolbarActionButton({ action }: { action: ToolbarAction }) {
  if (action.kind === "search") {
    return (
      <IconButton label="搜索">
        <Search className="size-4" strokeWidth={2} />
      </IconButton>
    );
  }

  if (action.kind === "notify") {
    return (
      <IconButton label="通知">
        <Bell className="size-4" strokeWidth={2} />
      </IconButton>
    );
  }

  if (action.kind === "info") {
    return (
      <IconButton label="更多">
        <Ellipsis className="size-4" strokeWidth={2} />
      </IconButton>
    );
  }

  if (action.kind === "ghost") {
    return (
      <Button variant="ghost" to={action.to} form={action.form} type={action.form ? "submit" : "button"}>
        {action.label}
      </Button>
    );
  }

  return (
    <Button
      variant="primary"
      to={action.to}
      form={action.form}
      type={action.form ? "submit" : "button"}
    >
      {action.label}
    </Button>
  );
}
