import { ChevronLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { PageBody } from "../../components/layout/page-body";
import { ContentPlaceholder } from "../../components/layout/content-placeholder";
import { Button } from "../../components/ui/button";
import { useRouteHandle } from "@/routes/use-route-handle";

export function PlaceholderPage() {
  const handle = useRouteHandle();

  return (
    <>
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
          <div className="flex min-w-0 flex-col gap-0.5">
            <h1 className="text-[22px] font-semibold leading-8 tracking-[-0.4px] text-fg">
              {handle.title ?? handle.placeholder}
            </h1>
          </div>
        </div>
        {handle.actions?.length ? (
          <div className="flex items-center gap-2">
            {handle.actions.map((action) => {
              if (
                action.kind !== "primary" &&
                action.kind !== "ghost" &&
                action.kind !== "danger"
              ) {
                return null;
              }

              return (
                <Button
                  key={`${action.kind}-${action.label}`}
                  variant={action.kind}
                  to={action.to}
                  form={action.form}
                  type={action.form ? "submit" : "button"}
                >
                  {action.label}
                </Button>
              );
            })}
          </div>
        ) : null}
      </header>
      <PageBody>
        <ContentPlaceholder />
      </PageBody>
    </>
  );
}
