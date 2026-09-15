import { ChevronLeft } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
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
import { Button } from "@/components/ui/button";
import { BoundView } from "./bound-view";
import { AnniversarySheet, UnbindDialog } from "./dialogs";
import type { CoupleSpace } from "./types";
import { UnboundView } from "./unbound-view";

type Panel = "none" | "unbind" | "anniversary";

export function CouplePage() {
  const { user, refreshProfile } = useAuth();
  const [space, setSpace] = useState<CoupleSpace | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [panel, setPanel] = useState<Panel>("none");

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
    bodyClassName = "items-center justify-center gap-4";
    body = (
      <>
        <p className="text-sm font-medium text-danger" role="alert">
          {loadError || "request failed"}
        </p>
        <Button
          variant="secondary"
          onClick={() => {
            setLoading(true);
            void loadSpace()
              .catch((caught) =>
                setLoadError(
                  caught instanceof Error ? caught.message : "request failed",
                ),
              )
              .finally(() => setLoading(false));
          }}
        >
          重试
        </Button>
      </>
    );
  } else {
    const selfProfile: UserProfile =
      user ?? emptyAuthUser({ id: 0, username: "" });

    body = space.isBound && space.partner ? (
      <BoundView
        space={space}
        me={selfProfile}
        onEditAnniversary={() => setPanel("anniversary")}
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

      {!loading && !loadError && space && panel === "unbind" ? (
        <UnbindDialog
          onCancel={() => setPanel("none")}
          onConfirm={async () => {
            await unbindCoupleSpace();
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
