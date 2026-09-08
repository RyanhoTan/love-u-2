import { ArrowUp, Plus } from "lucide-react";
import { IconButton } from "../ui/button";

export function Composer() {
  return (
    <div className="flex h-[72px] shrink-0 items-center gap-2.5 bg-surface-soft/85 px-6 py-3 backdrop-blur-[20px]">
      <IconButton label="添加附件">
        <Plus className="size-4" strokeWidth={2} />
      </IconButton>
      <input
        type="text"
        placeholder="发消息…"
        className="h-10 min-w-0 flex-1 rounded-[20px] bg-surface px-4 text-sm text-fg outline-none placeholder:text-fg-muted"
      />
      <button
        type="button"
        aria-label="发送"
        className="inline-flex size-9 shrink-0 items-center justify-center rounded-[18px] bg-accent text-inverse transition-[background-color,transform] duration-100 ease-out hover:bg-accent-pressed active:scale-[0.97]"
      >
        <ArrowUp className="size-4" strokeWidth={2.5} />
      </button>
    </div>
  );
}
