import { useState, type FormEvent } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/features/auth/context";
import { register } from "@/api/auth";
import { TODAY } from "@/mocks";
import { Button } from "@/components/ui/button";

type AuthMode = "login" | "register";

export function LoginPage() {
  const { isAuthenticated, signIn } = useAuth();
  const [mode, setMode] = useState<AuthMode>("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  function switchMode(next: AuthMode) {
    setMode(next);
    setError("");
    setNotice("");
    setConfirmPassword("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) {
      return;
    }

    const trimmedUsername = username.trim();
    if (!trimmedUsername || !password) {
      setError("请输入用户名和密码");
      return;
    }

    if (mode === "register") {
      if (!confirmPassword) {
        setError("请再次输入密码");
        return;
      }

      if (password !== confirmPassword) {
        setError("两次输入的密码不一致");
        return;
      }
    }

    try {
      setSubmitting(true);
      setError("");
      setNotice("");

      if (mode === "register") {
        await register(trimmedUsername, password);
        setMode("login");
        setConfirmPassword("");
        setNotice("注册成功，请登录");
        return;
      }

      await signIn(trimmedUsername, password);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "request failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="relative h-full bg-app">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <img
          src={TODAY.hero}
          alt=""
          className="size-full object-cover"
        />
        <div className="absolute inset-0 bg-[#1a1418]/16" />
      </div>

      <div className="relative flex h-full items-center justify-center px-6">
        <form
          onSubmit={(event) => void handleSubmit(event)}
          className="login-material relative flex w-full max-w-90 flex-col gap-6 rounded-xl p-6"
        >
          <h1 className="text-center text-[15px] font-semibold tracking-[-0.3px] text-fg">
            Love U 2
          </h1>

          <div className="flex flex-col">
            <label className="flex flex-col gap-1 py-2.5">
              <span className="text-xs font-semibold tracking-[0.3px] text-fg">
                用户名
              </span>
              <input
                name="username"
                autoComplete="username"
                autoCapitalize="none"
                autoFocus
                spellCheck={false}
                placeholder="请输入用户名"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                className="h-7 bg-transparent text-[15px] font-medium text-fg outline-none placeholder:text-fg-secondary"
              />
            </label>
            <div className="h-px bg-fg/15" />
            <label className="flex flex-col gap-1 py-2.5">
              <span className="text-xs font-semibold tracking-[0.3px] text-fg">
                密码
              </span>
              <input
                name="password"
                type="password"
                autoComplete={
                  mode === "register" ? "new-password" : "current-password"
                }
                placeholder="请输入密码"
                value={password}
                aria-invalid={Boolean(error)}
                onChange={(event) => setPassword(event.target.value)}
                className="h-7 bg-transparent text-[15px] font-medium text-fg outline-none placeholder:text-fg-secondary"
              />
            </label>
            {mode === "register" ? (
              <>
                <div className="h-px bg-fg/15" />
                <label className="flex flex-col gap-1 py-2.5">
                  <span className="text-xs font-semibold tracking-[0.3px] text-fg">
                    确认密码
                  </span>
                  <input
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    placeholder="请再次输入密码"
                    value={confirmPassword}
                    aria-invalid={Boolean(error)}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    className="h-7 bg-transparent text-[15px] font-medium text-fg outline-none placeholder:text-fg-secondary"
                  />
                </label>
              </>
            ) : null}
          </div>

          {error ? (
            <p className="-mt-2 text-[13px] font-medium text-danger" role="alert">
              {error}
            </p>
          ) : notice ? (
            <p className="-mt-2 text-[13px] font-medium text-fg" role="status">
              {notice}
            </p>
          ) : null}

          <Button type="submit" className="h-10 w-full">
            {submitting
              ? mode === "register"
                ? "注册中..."
                : "登录中..."
              : mode === "register"
                ? "注册"
                : "登录"}
          </Button>

          <p className="-mt-2 text-center text-[13px] font-medium">
            <span className="text-fg-secondary">
              {mode === "register" ? "已有账号？" : "还没有账号？"}
            </span>
            <button
              type="button"
              className="font-semibold text-accent"
              onClick={() =>
                switchMode(mode === "register" ? "login" : "register")
              }
            >
              {mode === "register" ? "登录" : "注册"}
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}
