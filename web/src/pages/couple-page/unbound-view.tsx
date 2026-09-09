import { useState, type FormEvent } from "react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { CoupleInvite, CoupleSpace } from "./types";

function formatInviteExpiry(expiresAt: string | null) {
  if (!expiresAt) {
    return "邀请码有效";
  }

  const remainingMs = new Date(expiresAt).getTime() - Date.now();
  if (remainingMs <= 0) {
    return "已过期，请重新生成";
  }

  const minutes = Math.ceil(remainingMs / (1000 * 60));
  if (minutes < 60) {
    return `${minutes} 分钟内有效`;
  }

  const hours = Math.ceil(minutes / 60);
  return `${hours} 小时内有效`;
}

function normalizeInviteCode(value: string) {
  return value.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
}

export function UnboundView({
  space,
  onRefreshInvite,
  onBind,
}: {
  space: CoupleSpace;
  onRefreshInvite: () => Promise<CoupleInvite | null>;
  onBind: (inviteCode: string) => Promise<void>;
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
      setBindError("");
      await onRefreshInvite();
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
      await onBind(code);
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
