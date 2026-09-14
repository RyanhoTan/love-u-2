import { Link } from "react-router-dom";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cx } from "../../lib/cx";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

const variantClass: Record<ButtonVariant, string> = {
  primary:
    "bg-accent text-inverse hover:bg-accent-pressed",
  secondary:
    "border border-border bg-surface text-fg hover:bg-surface-soft",
  ghost: "text-accent hover:bg-accent-soft",
  danger: "bg-danger text-inverse hover:bg-danger/90",
};

type ButtonProps = {
  variant?: ButtonVariant;
  to?: string;
  children: ReactNode;
  className?: string;
} & ButtonHTMLAttributes<HTMLButtonElement>;

export function Button({
  variant = "primary",
  to,
  children,
  className,
  type = "button",
  ...props
}: ButtonProps) {
  const classes = cx(
    "inline-flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-control text-[13px]",
    "transition-[background-color,transform] duration-100 ease-out",
    "active:scale-[0.97] motion-reduce:transition-colors motion-reduce:active:scale-100",
    variant === "ghost" ? "px-3 font-medium" : "px-4 font-semibold",
    variantClass[variant],
    className,
  );

  if (to) {
    return (
      <Link to={to} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} className={classes} {...props}>
      {children}
    </button>
  );
}

type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  to?: string;
  label: string;
  children: ReactNode;
};

export function IconButton({
  to,
  label,
  children,
  className,
  type = "button",
  ...props
}: IconButtonProps) {
  const classes = cx(
    "inline-flex size-9 shrink-0 items-center justify-center rounded-control border border-border bg-surface text-fg",
    "transition-[background-color,transform] duration-100 ease-out",
    "hover:bg-surface-soft active:scale-[0.97] motion-reduce:transition-colors motion-reduce:active:scale-100",
    className,
  );

  if (to) {
    return (
      <Link to={to} aria-label={label} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} aria-label={label} className={classes} {...props}>
      {children}
    </button>
  );
}
