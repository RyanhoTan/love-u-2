import { cx } from "../../lib/cx";

type AvatarProps = {
  src?: string;
  alt: string;
  size: 28 | 32;
  className?: string;
};

export function Avatar({ src, alt, size, className }: AvatarProps) {
  return (
    <span
      className={cx(
        "block shrink-0 overflow-hidden rounded-full bg-avatar",
        size === 28 ? "size-7" : "size-8",
        className,
      )}
    >
      {src ? (
        <img src={src} alt={alt} className="size-full object-cover" />
      ) : null}
    </span>
  );
}
