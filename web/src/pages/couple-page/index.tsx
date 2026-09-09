import {
  useEffect,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import { Calendar, ChevronRight, Heart } from "lucide-react";
import { useAuth } from "../../app/auth";
import {
  bindCoupleSpace,
  createCoupleInvite,
  displayName,
  formatAnniversaryDot,
  formatInviteExpiry,
  getCoupleSpace,
  getUserInfo,
  normalizeInviteCode,
  unbindCoupleSpace,
  updateCoupleSpace,
  type CoupleSpace,
  type UserProfile,
} from "../../app/couple-api";
import { PageBody } from "../../components/layout/page-body";
import { Avatar } from "../../components/ui/avatar";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { cx } from "../../lib/cx";

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
            onSpaceChange={setSpace}
            onBound={async () => {
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

function BoundView({
  space,
  me,
  onEditAnniversary,
  onUnbind,
}: {
  space: CoupleSpace;
  me: UserProfile;
  onEditAnniversary: () => void;
  onUnbind: () => void;
}) {
  const partner = space.partner!;
  const selfName = displayName(me);
  const partnerName = displayName(partner);
  const anniversary = formatAnniversaryDot(
    space.relationship?.anniversaryDate,
  );
  const days = space.daysInLove;

  return (
    <div className="flex w-full max-w-[420px] flex-col items-center gap-9">
      <section className="flex flex-col items-center gap-5">
        <div className="relative h-[140px] w-[280px]">
          <div
            aria-hidden
            className="pointer-events-none absolute left-10 top-2.5 size-[200px] h-[120px] rounded-full bg-[radial-gradient(circle_at_center,#FF6B8B33,transparent_70%)]"
          />
          <Avatar
            src={me.avatar ?? undefined}
            alt={selfName}
            size={88}
            className="absolute left-12 top-[26px] z-10 border-[3px] border-white"
          />
          <Avatar
            src={partner.avatar ?? undefined}
            alt={partnerName}
            size={88}
            className="absolute left-36 top-[26px] z-10 border-[3px] border-white"
          />
          <div className="absolute left-[122px] top-[54px] z-20 flex size-9 items-center justify-center rounded-full bg-white shadow-[0_2px_8px_rgb(28_20_24_/_0.08)]">
            <Heart className="size-4 fill-accent text-accent" strokeWidth={2} />
          </div>
        </div>

        <h2 className="text-[30px] font-semibold tracking-[-0.6px] text-fg">
          {selfName} 与 {partnerName}
        </h2>

        <div className="flex items-end gap-2">
          <p className="text-[64px] font-bold leading-[0.92] tracking-[-2px] text-accent">
            {days ?? "—"}
          </p>
          <p className="pb-1.5 text-xl font-semibold tracking-[-0.2px] text-accent">
            天
          </p>
        </div>

        <p className="text-sm text-fg-secondary">
          {anniversary ? `从 ${anniversary} 开始` : "尚未设置纪念日"}
        </p>
      </section>

      <section className="flex w-full flex-col gap-2">
        <p className="text-xs font-semibold tracking-[0.2px] text-fg-muted">
          关系
        </p>
        <div className="overflow-hidden rounded-surface border border-border bg-surface shadow-[0_1px_2px_rgb(28_20_24_/_0.04)]">
          <button
            type="button"
            onClick={onEditAnniversary}
            className="flex h-11 w-full items-center gap-3 px-3.5 text-left transition-[background-color,transform] duration-100 ease-out hover:bg-surface-soft active:scale-[0.99]"
          >
            <Calendar className="size-[18px] text-fg-secondary" strokeWidth={2} />
            <span className="min-w-0 flex-1 text-[15px] font-medium text-fg">
              纪念日
              <span className="whitespace-pre text-fg">
                {"    "}
                {anniversary ?? "未设置"}
              </span>
            </span>
            <ChevronRight
              className="size-4 text-fg-muted"
              strokeWidth={2}
            />
          </button>
        </div>
      </section>

      <button
        type="button"
        onClick={onUnbind}
        className="inline-flex h-9 items-center justify-center rounded-control px-3 text-[13px] font-medium text-danger transition-transform duration-100 ease-out active:scale-[0.97]"
      >
        解除绑定
      </button>
    </div>
  );
}

function UnboundView({
  space,
  onSpaceChange,
  onBound,
}: {
  space: CoupleSpace;
  onSpaceChange: (space: CoupleSpace) => void;
  onBound: () => Promise<void>;
}) {
  const invite = space.activeInvite;
  const [inviteCode, setInviteCode] = useState("");
  const [bindError, setBindError] = useState("");
  const [copyNotice, setCopyNotice] = useState("");
  const [binding, setBinding] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  async function handleCopy() {
    if (!invite?.code) {
      return;
    }

    try {
      await navigator.clipboard.writeText(invite.code);
      setCopyNotice("已复制");
      window.setTimeout(() => setCopyNotice(""), 1600);
    } catch {
      setCopyNotice("复制失败");
    }
  }

  async function handleRefresh() {
    if (refreshing) {
      return;
    }

    try {
      setRefreshing(true);
      const response = await createCoupleInvite({ regenerate: true });
      onSpaceChange({
        ...space,
        activeInvite: response.invite,
      });
    } catch (caught) {
      setBindError(
        caught instanceof Error ? caught.message : "request failed",
      );
    } finally {
      setRefreshing(false);
    }
  }

  async function handleBind(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (binding) {
      return;
    }

    const code = normalizeInviteCode(inviteCode);
    if (!code) {
      setBindError("请输入对方的邀请码");
      return;
    }

    try {
      setBinding(true);
      setBindError("");
      await bindCoupleSpace({ inviteCode: code });
      await onBound();
    } catch (caught) {
      setBindError(
        caught instanceof Error ? caught.message : "request failed",
      );
    } finally {
      setBinding(false);
    }
  }

  return (
    <div className="flex w-full max-w-[440px] flex-col items-center gap-7">
      <section className="flex flex-col items-center gap-3 text-center">
        <div className="flex size-16 items-center justify-center rounded-[20px] bg-accent-soft">
          <Heart className="size-7 text-accent" strokeWidth={2} />
        </div>
        <h2 className="text-[28px] font-semibold tracking-[-0.5px] text-fg">
          绑定你们的空间
        </h2>
        <p className="max-w-[440px] text-sm leading-[1.45] text-fg-secondary">
          分享邀请码，或输入对方的码。绑定后相册、心愿和纪念日才有归属。
        </p>
      </section>

      <section className="flex w-full flex-col gap-2">
        <p className="text-xs font-semibold tracking-[0.2px] text-fg-muted">
          我的邀请码
        </p>
        <div className="flex flex-col items-center gap-4 rounded-surface border border-border bg-surface p-5 shadow-[0_1px_2px_rgb(28_20_24_/_0.04)]">
          <p className="text-[36px] font-bold tracking-[4px] text-fg">
            {invite?.code ?? "------"}
          </p>
          <p className="text-xs text-fg-muted">
            {formatInviteExpiry(invite?.expiresAt ?? null)}
          </p>
          <div className="flex w-full justify-center gap-2">
            <Button
              onClick={() => void handleCopy()}
              disabled={!invite?.code}
            >
              {copyNotice || "复制邀请码"}
            </Button>
            <Button
              variant="secondary"
              onClick={() => void handleRefresh()}
              disabled={refreshing}
            >
              {refreshing ? "生成中…" : "重新生成"}
            </Button>
          </div>
        </div>
      </section>

      <div className="flex w-full items-center gap-3">
        <div className="h-px flex-1 bg-border" />
        <span className="text-xs font-medium text-fg-muted">或</span>
        <div className="h-px flex-1 bg-border" />
      </div>

      <form
        onSubmit={(event) => void handleBind(event)}
        className="flex w-full flex-col gap-3"
      >
        <p className="text-xs font-semibold tracking-[0.2px] text-fg-muted">
          输入对方邀请码
        </p>
        <Input
          value={inviteCode}
          onChange={(event) => {
            setInviteCode(event.target.value);
            if (bindError) {
              setBindError("");
            }
          }}
          placeholder="例如 LU2-XXXX"
          autoCapitalize="characters"
          spellCheck={false}
          aria-invalid={Boolean(bindError)}
        />
        {bindError ? (
          <p className="-mt-1 text-[13px] font-medium text-danger" role="alert">
            {bindError}
          </p>
        ) : null}
        <Button type="submit" className="h-10 w-full" disabled={binding}>
          {binding ? "绑定中…" : "绑定"}
        </Button>
      </form>
    </div>
  );
}

function UnbindDialog({
  onCancel,
  onConfirm,
}: {
  onCancel: () => void;
  onConfirm: () => Promise<void>;
}) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  return (
    <Overlay onDismiss={submitting ? undefined : onCancel}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="unbind-title"
        className="w-full max-w-[400px] rounded-surface bg-surface p-5 shadow-[0_8px_24px_rgb(0_0_0_/_0.08)]"
      >
        <h2
          id="unbind-title"
          className="text-lg font-semibold tracking-[-0.2px] text-fg"
        >
          解除绑定？
        </h2>
        <p className="mt-3 text-sm leading-[1.45] text-fg-secondary">
          你们将不再共享这个空间。相册、心愿和纪念日会保留，但对方看不到。此操作可重新绑定恢复。
        </p>
        {error ? (
          <p className="mt-3 text-[13px] font-medium text-danger" role="alert">
            {error}
          </p>
        ) : null}
        <div className="mt-5 flex justify-end gap-2">
          <Button
            variant="secondary"
            onClick={onCancel}
            disabled={submitting}
          >
            取消
          </Button>
          <button
            type="button"
            disabled={submitting}
            onClick={() => {
              void (async () => {
                try {
                  setSubmitting(true);
                  setError("");
                  await onConfirm();
                } catch (caught) {
                  setError(
                    caught instanceof Error ? caught.message : "request failed",
                  );
                  setSubmitting(false);
                }
              })();
            }}
            className={cx(
              "inline-flex h-9 items-center justify-center rounded-control bg-danger px-4 text-[13px] font-semibold text-inverse",
              "transition-[background-color,transform] duration-100 ease-out active:scale-[0.97]",
              "disabled:opacity-60",
            )}
          >
            {submitting ? "解除中…" : "解除绑定"}
          </button>
        </div>
      </div>
    </Overlay>
  );
}

function AnniversarySheet({
  initialDate,
  onClose,
  onSave,
}: {
  initialDate: string;
  onClose: () => void;
  onSave: (anniversaryDate: string | null) => Promise<void>;
}) {
  const [date, setDate] = useState(initialDate);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  return (
    <Overlay align="end" onDismiss={submitting ? undefined : onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="anniv-title"
        className="w-full max-w-[480px] rounded-[20px] bg-surface px-5 pb-5 pt-4 shadow-[0_-4px_24px_rgb(0_0_0_/_0.08)]"
      >
        <div className="flex justify-center pb-1 pt-1">
          <div className="h-1.5 w-9 rounded-[3px] bg-border" />
        </div>
        <div className="flex items-center justify-between">
          <h2
            id="anniv-title"
            className="text-[17px] font-semibold tracking-[-0.2px] text-fg"
          >
            恋爱纪念日
          </h2>
          <Button
            variant="ghost"
            disabled={submitting}
            onClick={() => {
              void (async () => {
                try {
                  setSubmitting(true);
                  setError("");
                  await onSave(date.trim() || null);
                } catch (caught) {
                  setError(
                    caught instanceof Error ? caught.message : "request failed",
                  );
                  setSubmitting(false);
                }
              })();
            }}
          >
            {submitting ? "保存中…" : "完成"}
          </Button>
        </div>
        <p className="mt-4 text-[13px] leading-[1.4] text-fg-secondary">
          从这一天起计算在一起的天数。可随时修改。
        </p>
        <label className="mt-4 flex flex-col gap-1.5">
          <span className="text-xs font-medium text-fg-muted">日期</span>
          <Input
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
          />
        </label>
        {error ? (
          <p className="mt-3 text-[13px] font-medium text-danger" role="alert">
            {error}
          </p>
        ) : null}
      </div>
    </Overlay>
  );
}

function Overlay({
  children,
  onDismiss,
  align = "center",
}: {
  children: ReactNode;
  onDismiss?: () => void;
  align?: "center" | "end";
}) {
  return (
    <div
      className={cx(
        "fixed inset-0 z-50 flex bg-[#1C141899] px-6 backdrop-blur-[16px]",
        align === "center" ? "items-center justify-center py-6" : "items-end justify-center pb-6 pt-6",
      )}
      onClick={onDismiss}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          onDismiss?.();
        }
      }}
      role="presentation"
    >
      <div
        className="w-full max-w-[480px]"
        onClick={(event) => event.stopPropagation()}
        onKeyDown={(event) => event.stopPropagation()}
        role="presentation"
      >
        {children}
      </div>
    </div>
  );
}
