import { useState, type FormEvent } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../app/auth";
import { TODAY } from "../app/mock";
import { Button } from "../components/ui/button";

function loginErrorMessage(error: unknown) {
  if (error instanceof Error) {
    if (error.message === "username or password is incorrect") {
      return "用户名或密码错误";
    }

    return error.message;
  }

  return "登录失败，请稍后重试";
}

export function LoginPage() {
  const { isAuthenticated, signIn } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
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

    try {
      setSubmitting(true);
      setError("");
      await signIn(trimmedUsername, password);
    } catch (caught) {
      setError(loginErrorMessage(caught));
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
                autoComplete="current-password"
                placeholder="请输入密码"
                value={password}
                aria-invalid={Boolean(error)}
                onChange={(event) => setPassword(event.target.value)}
                className="h-7 bg-transparent text-[15px] font-medium text-fg outline-none placeholder:text-fg-secondary"
              />
            </label>
          </div>

          {error ? (
            <p className="-mt-2 text-[13px] font-medium text-danger" role="alert">
              {error}
            </p>
          ) : null}

          <Button type="submit" className="h-10 w-full">
            {submitting ? "登录中..." : "登录"}
          </Button>

          <p className="-mt-2 text-center text-xs font-medium tracking-[0.3px] text-fg-secondary">
            仅你们两人可见
          </p>
        </form>
      </div>
    </div>
  );
}
