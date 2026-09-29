import { ChevronLeft } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { updateUserInfo } from "@/api/user";
import { useAuth } from "@/features/auth/context";
import { displayName } from "@/lib/user";
import { PageBody } from "@/components/layout/page-body";
import { QueryError } from "@/components/query-state";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const FORM_ID = "profile-form";
const MAX_NICKNAME_LENGTH = 30;
const MAX_SIGNATURE_LENGTH = 200;

function todayDateOnly() {
  return new Date().toISOString().slice(0, 10);
}

export function ProfilePage() {
  const navigate = useNavigate();
  const { user, profileStatus, refreshProfile } = useAuth();
  const [initialized, setInitialized] = useState(false);
  const [nickname, setNickname] = useState("");
  const [signature, setSignature] = useState("");
  const [birthday, setBirthday] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (profileStatus !== "ready" || !user || initialized) {
      return;
    }

    setNickname(user.nickname?.trim() || user.username);
    setSignature(user.signature?.trim() || "");
    setBirthday(user.birthday || "");
    setInitialized(true);
  }, [initialized, profileStatus, user]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user || submitting) {
      return;
    }

    const trimmedNickname = nickname.trim();
    const trimmedSignature = signature.trim();

    if (!trimmedNickname) {
      setError("请输入昵称");
      return;
    }

    if (trimmedNickname.length > MAX_NICKNAME_LENGTH) {
      setError(`昵称不能超过 ${MAX_NICKNAME_LENGTH} 个字符`);
      return;
    }

    if (trimmedSignature.length > MAX_SIGNATURE_LENGTH) {
      setError(`个性签名不能超过 ${MAX_SIGNATURE_LENGTH} 个字符`);
      return;
    }

    if (birthday && birthday > todayDateOnly()) {
      setError("生日不能晚于今天");
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      await updateUserInfo({
        nickname: trimmedNickname,
        avatar: user.avatar,
        signature: trimmedSignature,
        birthday: birthday || null,
      });
      await refreshProfile();
      navigate("/me");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "保存失败，请稍后重试");
    } finally {
      setSubmitting(false);
    }
  }

  let body;

  if (profileStatus === "error") {
    body = <QueryError onRetry={() => void refreshProfile()} />;
  } else if (profileStatus !== "ready" || !user || !initialized) {
    body = (
      <div className="flex min-h-0 flex-1 items-center justify-center text-sm text-fg-muted">
        加载中…
      </div>
    );
  } else {
    const name = displayName(user);

    body = (
      <PageBody className="items-center">
        <form
          id={FORM_ID}
          className="flex w-full max-w-[560px] flex-col gap-8"
          onSubmit={(event) => void handleSubmit(event)}
        >
          <section className="flex flex-col items-center gap-3">
            <Avatar
              src={user.avatar ?? undefined}
              alt={name}
              size={88}
            />
            <div className="text-center">
              <p className="text-lg font-semibold text-fg">{name}</p>
              <p className="text-[13px] text-fg-muted">头像暂由移动端更新</p>
            </div>
          </section>

          <div className="flex flex-col gap-5">
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-fg-muted">用户名</span>
              <Input value={user.username} disabled />
              <span className="text-xs text-fg-muted">用户名暂不支持修改</span>
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-fg-muted">昵称</span>
              <Input
                value={nickname}
                maxLength={MAX_NICKNAME_LENGTH}
                disabled={submitting}
                aria-invalid={Boolean(error && !nickname.trim())}
                onChange={(event) => setNickname(event.target.value)}
                placeholder="请输入昵称"
              />
              <span className="text-right text-xs text-fg-muted">
                {nickname.length}/{MAX_NICKNAME_LENGTH}
              </span>
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-fg-muted">个性签名</span>
              <textarea
                value={signature}
                maxLength={MAX_SIGNATURE_LENGTH}
                disabled={submitting}
                onChange={(event) => setSignature(event.target.value)}
                placeholder="写点什么介绍自己"
                className="min-h-28 w-full resize-y rounded-control border border-border bg-surface px-3.5 py-3 text-[15px] text-fg outline-none placeholder:text-fg-muted focus:border-accent focus:shadow-[0_0_0_3px_var(--color-accent-soft)] disabled:opacity-60"
              />
              <span className="text-right text-xs text-fg-muted">
                {signature.length}/{MAX_SIGNATURE_LENGTH}
              </span>
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-fg-muted">生日</span>
              <div className="flex items-center gap-2">
                <Input
                  type="date"
                  value={birthday}
                  max={todayDateOnly()}
                  disabled={submitting}
                  onChange={(event) => setBirthday(event.target.value)}
                />
                {birthday ? (
                  <Button
                    variant="ghost"
                    disabled={submitting}
                    onClick={() => setBirthday("")}
                  >
                    清空
                  </Button>
                ) : null}
              </div>
            </label>
          </div>

          {error ? (
            <p className="text-[13px] font-medium text-danger" role="alert">
              {error}
            </p>
          ) : null}
        </form>
      </PageBody>
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
          <h1 className="text-[22px] font-semibold leading-8 tracking-[-0.4px] text-fg">
            个人资料
          </h1>
        </div>

        {profileStatus === "ready" && user && initialized ? (
          <Button type="submit" form={FORM_ID} disabled={submitting}>
            {submitting ? "保存中…" : "保存"}
          </Button>
        ) : null}
      </header>

      {body}
    </>
  );
}
