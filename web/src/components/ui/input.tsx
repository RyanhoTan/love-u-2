import type { InputHTMLAttributes } from "react";
import { cx } from "../../lib/cx";

export function Input({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cx(
        "h-10 w-full rounded-control border border-border bg-surface px-3.5 text-[15px] text-fg outline-none",
        "placeholder:text-fg-muted",
        "transition-[border-color,box-shadow] duration-100 ease-out",
        "focus:border-accent focus:shadow-[0_0_0_3px_var(--color-accent-soft)]",
        className,
      )}
      {...props}
    />
  );
}
