import { cx } from "../../lib/cx";

const sizeClass = {
  28: "size-7",
  32: "size-8",
  88: "size-[88px]",
} as const;

type AvatarProps = {
  src?: string;
  alt: string;
  size: keyof typeof sizeClass;
  className?: string;
};

export function Avatar({ src, alt, size, className }: AvatarProps) {
  return (
    <span
      className={cx(
        "block shrink-0 overflow-hidden rounded-full bg-avatar",
        sizeClass[size],
        className,
      )}
    >
      {src ? (
        <img src={src} alt={alt} className="size-full object-cover" />
      ) : null}
    </span>
  );
}
