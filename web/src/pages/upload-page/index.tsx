import { Upload, X } from "lucide-react";
import { PageBody } from "@/components/layout/page-body";

const SELECTED_FILES = [
  {
    name: "cafe latte",
    src: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
  },
  {
    name: "pastry plate",
    src: "https://images.unsplash.com/photo-1698899720612-dcbf89481ace?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
  },
  {
    name: "cat window",
    src: "https://images.unsplash.com/photo-1783346063567-7783f728209a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
  },
  {
    name: "sunflower field",
    src: "https://images.unsplash.com/photo-1732858560815-44149671ef07?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
  },
] as const;

export function UploadPage() {
  return (
    <PageBody scroll={false} className="gap-6">
      <button
        type="button"
        className="flex min-h-0 flex-1 flex-col items-center justify-center gap-3 rounded-surface border border-border bg-surface text-center transition-colors hover:border-accent hover:bg-accent-soft/30"
      >
        <Upload className="size-7 text-accent" strokeWidth={1.8} />
        <span className="text-xl font-semibold tracking-[-0.3px] text-fg">
          把照片拖到这里
        </span>
        <span className="text-[13px] text-fg-muted">
          或点击选择文件 · 支持照片和视频
        </span>
      </button>

      <div className="flex shrink-0 gap-2.5">
        {SELECTED_FILES.map((file) => (
          <div
            key={file.name}
            className="group relative size-[120px] overflow-hidden rounded-[10px] bg-avatar"
          >
            <img
              src={file.src}
              alt={file.name}
              className="size-full object-cover"
            />
            <div className="pointer-events-none absolute inset-0 bg-black/60 opacity-0 transition-opacity duration-150 ease-out group-hover:opacity-100 group-focus-within:opacity-100" />
            <button
              type="button"
              aria-label={`移除${file.name}`}
              className="absolute right-2 top-2 grid size-6 place-items-center rounded-full bg-black/80 text-white opacity-0 transition-opacity duration-150 ease-out group-hover:opacity-100 group-focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/90 focus-visible:ring-offset-2 focus-visible:ring-offset-black/20"
            >
              <X className="size-3.5" strokeWidth={2.2} />
            </button>
          </div>
        ))}
      </div>
    </PageBody>
  );
}
