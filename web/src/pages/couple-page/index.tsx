import { ChevronLeft } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/features/auth/context";
import {
  bindCoupleSpace,
  createCoupleInvite,
  getCoupleSpace,
  updateCoupleSpace,
  unbindCoupleSpace,
} from "@/api/couple";
import type { UserProfile } from "@/api/user";
import { emptyAuthUser } from "@/features/auth/session-user";
import { PageBody } from "@/components/layout/page-body";
import { QueryError } from "@/components/query-state";
import { BoundView } from "./bound-view";
import { AnniversarySheet, TimeZoneSheet, UnbindDialog } from "./dialogs";
import { daysKeys } from "@/features/anniversary/queries";
import { useCalendarRefresh } from "@/features/anniversary/calendar-refresh";
import type { CoupleSpace } from "./types";
import { UnboundView } from "./unbound-view";

type Panel = "none" | "unbind" | "anniversary" | "timezone";

export function CouplePage() {
  const { user, refreshProfile } = useAuth();
  const queryClient = useQueryClient();
  const [space, setSpace] = useState<CoupleSpace | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [panel, setPanel] = useState<Panel>("none");
  const [savedNotice, setSavedNotice] = useState("");

  useCalendarRefresh(space?.relationship?.timeZone, space?.todayDate, async (isCurrent) => {
    try {
      const response = await getCoupleSpace();
      if (isCurrent()) {
        setSpace(response.coupleSpace);
        setLoadError("");
      }
    } catch (caught) {
      if (isCurrent()) setLoadError(caught instanceof Error ? caught.message : "request failed");
    }
  });

  async function loadSpace(): Promise<CoupleSpace> {
    const response = await getCoupleSpace();
    let nextSpace = response.coupleSpace;

    if (!nextSpace.isBound && !nextSpace.activeInvite) {
      const inviteResponse = await createCoupleInvite();
      nextSpace = {
        ...nextSpace,
        activeInvite: inviteResponse.invite,
      };
    }

    setSpace(nextSpace);
    setLoadError("");
    return nextSpace;
  }

  useEffect(() => {
    let active = true;

    void (async () => {
      try {
        setLoading(true);
        setLoadError("");
        const response = await getCoupleSpace();
        if (!active) {
          return;
        }

        let nextSpace = response.coupleSpace;
        if (!nextSpace.isBound && !nextSpace.activeInvite) {
          const inviteResponse = await createCoupleInvite();
          if (!active) {
            return;
          }
          nextSpace = {
            ...nextSpace,
            activeInvite: inviteResponse.invite,
          };
        }

        setSpace(nextSpace);
      } catch (caught) {
        if (!active) {
          return;
        }
        setLoadError(
          caught instanceof Error ? caught.message : "request failed",
        );
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  let body: ReactNode;
  let bodyClassName = "items-center justify-center";

  if (loading) {
    body = <p className="text-sm text-fg-muted">加载中…</p>;
  } else if (loadError || !space) {
    bodyClassName = "items-center justify-center";
    body = (
      <QueryError
        onRetry={() => {
          setLoading(true);
          void loadSpace()
            .catch((caught) =>
              setLoadError(
                caught instanceof Error ? caught.message : "request failed",
              ),
            )
            .finally(() => setLoading(false));
        }}
      />
    );
  } else {
    const selfProfile: UserProfile =
      user ?? emptyAuthUser({ id: 0, username: "" });

    body = space.isBound && space.partner ? (
      <BoundView
        space={space}
        me={selfProfile}
        onEditAnniversary={() => setPanel("anniversary")}
        onEditTimeZone={() => { setSavedNotice(""); setPanel("timezone"); }}
        onUnbind={() => setPanel("unbind")}
      />
    ) : (
      <UnboundView
        space={space}
        onRefreshInvite={async () => {
          const response = await createCoupleInvite({ regenerate: true });
          setSpace({
            ...space,
            activeInvite: response.invite,
          });
          return response.invite;
        }}
        onBind={async (inviteCode) => {
          await bindCoupleSpace({ inviteCode });
          void queryClient.invalidateQueries({ queryKey: daysKeys.all });
          await loadSpace();
          await refreshProfile();
        }}
      />
    );
  }

  return (
    <>
      <header className="flex shrink-0 items-center justify-between bg-surface-soft/80 px-8 pb-3 pt-7 backdrop-blur-[20px]">
        <div className="flex min-w-0 items-center gap-2">
          <Link
            to="/me"
            aria-label="返回"
            className="inline-flex size-9 shrink-0 items-center justify-center rounded-control text-fg transition-transform duration-100 ease-out active:scale-[0.97]"
          >
            <ChevronLeft className="size-4" strokeWidth={2} />
          </Link>
          <div className="flex min-w-0 flex-col gap-0.5">
            <h1 className="text-[22px] font-semibold leading-8 tracking-[-0.4px] text-fg">
              情侣空间
            </h1>
          </div>
        </div>
      </header>
      <PageBody className={bodyClassName}>{body}</PageBody>
      {savedNotice ? <p className="px-8 pb-3 text-sm text-fg-secondary" role="status">{savedNotice}</p> : null}

      {!loading && !loadError && space?.isBound && panel === "timezone" ? (
        <TimeZoneSheet
          initialTimeZone={space.relationship?.timeZone ?? ""}
          onClose={() => setPanel("none")}
          onSave={async (timeZone) => {
            const response = await updateCoupleSpace({ timeZone });
            setSpace(response.coupleSpace);
            setPanel("none");
            void queryClient.invalidateQueries({ queryKey: daysKeys.all });
            try {
              await refreshProfile();
              setSavedNotice("共同时区已保存");
            } catch {
              setSavedNotice("共同时区已保存；首页资料刷新失败，请在首页重新加载。");
            }
          }}
        />
      ) : null}

      {!loading && !loadError && space && panel === "unbind" ? (
        <UnbindDialog
          onCancel={() => setPanel("none")}
          onConfirm={async () => {
            await unbindCoupleSpace();
            void queryClient.invalidateQueries({ queryKey: daysKeys.all });
            setPanel("none");
            await loadSpace();
            await refreshProfile();
          }}
        />
      ) : null}

      {!loading && !loadError && space && panel === "anniversary" ? (
        <AnniversarySheet
          initialDate={space.relationship?.anniversaryDate ?? ""}
          onClose={() => setPanel("none")}
          onSave={async (anniversaryDate) => {
            const response = await updateCoupleSpace({ anniversaryDate });
            setSpace(response.coupleSpace);
            setPanel("none");
            await refreshProfile();
          }}
        />
      ) : null}
    </>
  );
}
