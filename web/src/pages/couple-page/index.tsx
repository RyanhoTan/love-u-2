import { useEffect, useState } from "react";
import { useAuth } from "@/app/auth";
import { getUserInfo, type UserProfile } from "@/app/user-api";
import { PageBody } from "@/components/layout/page-body";
import { Button } from "@/components/ui/button";
import { requestWithAuth } from "@/lib/api";
import { BoundView } from "./bound-view";
import { AnniversarySheet, UnbindDialog } from "./dialogs";
import type { CoupleInvite, CoupleSpace } from "./types";
import { UnboundView } from "./unbound-view";

type CoupleSpaceResponse = {
  message: string;
  coupleSpace: CoupleSpace;
};

type CoupleInviteResponse = {
  message: string;
  invite: CoupleInvite | null;
};

function getCoupleSpace() {
  return requestWithAuth<CoupleSpaceResponse>("/couple-space", {
    method: "GET",
  });
}

function createCoupleInvite(options?: { regenerate?: boolean }) {
  return requestWithAuth<CoupleInviteResponse>("/couple-space/invite", {
    method: "POST",
    body: JSON.stringify({ regenerate: Boolean(options?.regenerate) }),
  });
}

function bindCoupleSpace(payload: { inviteCode: string }) {
  return requestWithAuth<CoupleSpaceResponse>("/couple-space/bind", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

function updateCoupleSpace(payload: { anniversaryDate: string | null }) {
  return requestWithAuth<CoupleSpaceResponse>("/couple-space", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

function unbindCoupleSpace() {
  return requestWithAuth<{ message: string }>("/couple-space/bind", {
    method: "DELETE",
  });
}

type Panel = "none" | "unbind" | "anniversary";

export function CouplePage() {
  const { user } = useAuth();
  const [space, setSpace] = useState<CoupleSpace | null>(null);
  const [me, setMe] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [panel, setPanel] = useState<Panel>("none");

  async function reload(): Promise<CoupleSpace> {
    const [spaceResponse, userResponse] = await Promise.all([
      getCoupleSpace(),
      getUserInfo(),
    ]);

    let nextSpace = spaceResponse.coupleSpace;
    setMe(userResponse.user);

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
        const [spaceResponse, userResponse] = await Promise.all([
          getCoupleSpace(),
          getUserInfo(),
        ]);

        if (!active) {
          return;
        }

        let nextSpace = spaceResponse.coupleSpace;
        setMe(userResponse.user);

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
            void reload()
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

  const selfProfile: UserProfile = me ?? {
    id: user?.id ?? 0,
    username: user?.username ?? "",
    nickname: null,
    avatar: null,
    signature: null,
  };

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
              await reload();
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
            await reload();
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
          }}
        />
      ) : null}
    </>
  );
}
