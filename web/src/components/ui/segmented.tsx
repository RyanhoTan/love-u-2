import { cx } from "../../lib/cx";

export function Segmented<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (value: T) => void;
  options: { value: T; label: string }[];
}) {
  return (
    <div className="inline-flex h-[38px] shrink-0 items-center gap-0.5 self-start rounded-control bg-track p-[3px]">
      {options.map((option) => {
        const active = option.value === value;

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={cx(
              "inline-flex h-8 items-center justify-center rounded-[8px] px-3.5 text-[13px]",
              "transition-[background-color,transform,color] duration-100 ease-out",
              "active:scale-[0.98]",
              active
                ? "bg-surface font-semibold text-fg"
                : "font-medium text-fg-secondary",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
