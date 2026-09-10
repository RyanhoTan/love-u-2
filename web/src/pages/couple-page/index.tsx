import { useEffect, useState } from "react";
import { useAuth } from "@/app/auth";
import {
  bindCoupleSpace,
  createCoupleInvite,
  getCoupleSpace,
  updateCoupleSpace,
  unbindCoupleSpace,
} from "@/app/couple-api";
import type { UserProfile } from "@/app/user-api";
import { emptyAuthUser } from "@/lib/api";
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

  if (loading) {
    return (
      <PageBody className="items-center justify-center">
        <p className="text-sm text-fg-muted">加载中…</p>
      </PageBody>
    );
  }

  if (loadError || !space) {
    return (
      <PageBody className="items-center justify-center gap-4">
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
      </PageBody>
    );
  }

  const selfProfile: UserProfile =
    user ?? emptyAuthUser({ id: 0, username: "" });

  return (
    <>
      <PageBody className="items-center justify-center">
        {space.isBound && space.partner ? (
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
        )}
      </PageBody>

      {panel === "unbind" ? (
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

      {panel === "anniversary" ? (
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
