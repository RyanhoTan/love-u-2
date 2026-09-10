import { Calendar, ImagePlus, MapPin, Smile, Wallet, X } from "lucide-react";
import { useRef, useState, type ReactNode } from "react";
import { uploadWishMedia } from "@/api/wish";
import {
  errorMessage,
  useCreateWishRecordMutation,
} from "@/features/wish/queries";
import { Button } from "@/components/ui/button";
import { DatePickerSheet } from "@/pages/days-page/pickers";
import { cx } from "@/lib/cx";
import {
  dotDateToIso,
  isoToDotDate,
  todayIso,
  WISH_MOODS,
} from "./types";

type DraftMedia = {
  url: string;
  mediaType: "image";
  thumbnailUrl: string;
};

type Picker = "date" | "mood" | "location" | "budget" | null;

export function RecordSheet({
  wishId,
  onClose,
}: {
  wishId: number;
  onClose: () => void;
}) {
  const createMutation = useCreateWishRecordMutation(wishId);
  const fileRef = useRef<HTMLInputElement>(null);

  const [content, setContent] = useState("");
  const [recordDate, setRecordDate] = useState(todayIso());
  const [mood, setMood] = useState<string>("期待");
  const [locationName, setLocationName] = useState("");
  const [budgetText, setBudgetText] = useState("");
  const [media, setMedia] = useState<DraftMedia[]>([]);
  const [picker, setPicker] = useState<Picker>(null);
  const [uploading, setUploading] = useState(false);
  const [localError, setLocalError] = useState("");

  const pending = createMutation.isPending || uploading;

  async function addPhotos(files: FileList | null) {
    if (!files?.length) {
      return;
    }
    setLocalError("");
    setUploading(true);
    try {
      const uploaded: DraftMedia[] = [];
      for (const file of Array.from(files)) {
        const result = await uploadWishMedia(file);
        uploaded.push({
          url: result.url,
          mediaType: "image",
          thumbnailUrl: result.url,
        });
      }
      setMedia((current) => [...current, ...uploaded]);
    } catch (caught) {
      setLocalError(errorMessage(caught, "照片上传失败"));
    } finally {
      setUploading(false);
    }
  }

  function submit() {
    const budgetAmount =
      budgetText.trim() === ""
        ? null
        : Number.parseInt(budgetText.replace(/[^\d]/g, ""), 10);

    if (budgetText.trim() !== "" && !Number.isFinite(budgetAmount)) {
      setLocalError("花费请输入数字");
      return;
    }

    setLocalError("");
    createMutation.mutate(
      {
        content: content.trim(),
        recordDate,
        mood,
        locationName: locationName.trim(),
        latitude: null,
        longitude: null,
        budgetAmount:
          budgetAmount != null && Number.isFinite(budgetAmount)
            ? budgetAmount
            : null,
        media,
      },
      {
        onSuccess: () => onClose(),
      },
    );
  }

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-overlay px-6 py-6 backdrop-blur-[20px]"
        onClick={pending ? undefined : onClose}
        onKeyDown={(event) => {
          if (event.key === "Escape" && !pending) {
            onClose();
          }
        }}
        role="presentation"
      >
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="wish-record-title"
          className="w-full max-w-[480px] overflow-hidden rounded-[20px] bg-surface shadow-[0_12px_40px_rgb(28_20_24_/_0.1)]"
          onClick={(event) => event.stopPropagation()}
          onKeyDown={(event) => event.stopPropagation()}
        >
          <div className="flex h-14 items-center justify-between px-5">
            <Button variant="ghost" disabled={pending} onClick={onClose}>
              取消
            </Button>
            <h2
              id="wish-record-title"
              className="text-[17px] font-semibold tracking-[-0.2px] text-fg"
            >
              记一笔
            </h2>
            <Button disabled={pending} onClick={submit}>
              {pending ? "…" : "记下"}
            </Button>
          </div>
          <div className="h-px bg-border" />

          <div className="flex flex-col gap-4 px-5 pb-6 pt-5">
            <textarea
              value={content}
              disabled={pending}
              rows={4}
              placeholder="船票出了，四月一起走。"
              className="min-h-[100px] w-full resize-none rounded-[12px] bg-surface-soft px-3.5 py-3.5 text-[15px] leading-[1.45] text-fg outline-none placeholder:text-fg-muted disabled:opacity-60"
              onChange={(event) => setContent(event.target.value)}
            />

            <div className="flex flex-col gap-2.5">
              <p className="text-xs font-medium text-fg-muted">照片</p>
              <div className="flex flex-wrap gap-2">
                {media.map((item) => (
                  <div
                    key={item.url}
                    className="relative size-[72px] overflow-hidden rounded-[10px]"
                  >
                    <img
                      src={item.thumbnailUrl || item.url}
                      alt=""
                      className="size-full object-cover"
                    />
                    <button
                      type="button"
                      aria-label="移除照片"
                      disabled={pending}
                      onClick={() =>
                        setMedia((current) =>
                          current.filter((entry) => entry.url !== item.url),
                        )
                      }
                      className="absolute right-1 top-1 flex size-[18px] items-center justify-center rounded-full bg-[rgb(28_20_24_/_0.8)] text-inverse"
                    >
                      <X className="size-2.5" strokeWidth={2.5} />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => fileRef.current?.click()}
                  className={cx(
                    "flex size-[72px] flex-col items-center justify-center gap-1 rounded-[10px] border border-border bg-surface-soft",
                    "text-fg-secondary transition-transform duration-100 ease-out active:scale-[0.97]",
                    "disabled:opacity-60",
                  )}
                >
                  <ImagePlus className="size-5" strokeWidth={1.75} />
                  <span className="text-[11px] font-medium">
                    {uploading ? "…" : "添加"}
                  </span>
                </button>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="sr-only"
                  onChange={(event) => {
                    void addPhotos(event.target.files);
                    event.target.value = "";
                  }}
                />
              </div>
            </div>

            <div className="overflow-hidden rounded-[12px] bg-surface-soft">
              <MetaRow
                icon={<Calendar className="size-4" strokeWidth={2} />}
                label="日期"
                value={isoToDotDate(recordDate)}
                disabled={pending}
                onClick={() => setPicker("date")}
              />
              <div className="h-px bg-border" />
              <MetaRow
                icon={<Smile className="size-4" strokeWidth={2} />}
                label="心情"
                value={mood || "选择心情"}
                disabled={pending}
                onClick={() => setPicker("mood")}
              />
              <div className="h-px bg-border" />
              <MetaRow
                icon={<MapPin className="size-4" strokeWidth={2} />}
                label="地点"
                value={locationName || "选择地点"}
                muted={!locationName}
                disabled={pending}
                onClick={() => setPicker("location")}
              />
              <div className="h-px bg-border" />
              <MetaRow
                icon={<Wallet className="size-4" strokeWidth={2} />}
                label="花费"
                value={
                  budgetText
                    ? `¥ ${Number(budgetText).toLocaleString("zh-CN")}`
                    : "¥ 未填"
                }
                muted={!budgetText}
                disabled={pending}
                onClick={() => setPicker("budget")}
              />
            </div>

            {localError || createMutation.isError ? (
              <p className="text-sm font-medium text-danger" role="alert">
                {localError || errorMessage(createMutation.error)}
              </p>
            ) : null}
          </div>
        </div>
      </div>

      {picker === "date" ? (
        <DatePickerSheet
          value={isoToDotDate(recordDate)}
          onClose={() => setPicker(null)}
          onDone={(dot) => {
            setRecordDate(dotDateToIso(dot));
            setPicker(null);
          }}
        />
      ) : null}

      {picker === "mood" ? (
        <ChoiceSheet
          title="心情"
          hint="选一个最贴近此刻的心情。"
          onClose={() => setPicker(null)}
        >
          <div className="mt-4 grid grid-cols-3 gap-2.5">
            {WISH_MOODS.map((option) => {
              const active = option === mood;
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => {
                    setMood(option);
                    setPicker(null);
                  }}
                  className={cx(
                    "flex h-14 items-center justify-center rounded-[12px] text-[15px]",
                    "transition-transform duration-100 ease-out active:scale-[0.98]",
                    active
                      ? "bg-accent-soft font-semibold text-accent"
                      : "border border-border bg-surface-soft font-medium text-fg",
                  )}
                >
                  {option}
                </button>
              );
            })}
          </div>
        </ChoiceSheet>
      ) : null}

      {picker === "location" ? (
        <ChoiceSheet
          title="地点"
          hint="写下地点名即可。"
          onClose={() => setPicker(null)}
        >
          <input
            autoFocus
            value={locationName}
            placeholder="例如 祇园"
            className="mt-4 h-11 w-full rounded-[12px] bg-surface-soft px-3.5 text-[15px] text-fg outline-none placeholder:text-fg-muted"
            onChange={(event) => setLocationName(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                setPicker(null);
              }
            }}
          />
          <div className="mt-3 flex justify-end">
            <Button variant="ghost" onClick={() => setPicker(null)}>
              完成
            </Button>
          </div>
        </ChoiceSheet>
      ) : null}

      {picker === "budget" ? (
        <ChoiceSheet
          title="花费"
          hint="记这笔开销。也可以先不填。"
          onClose={() => setPicker(null)}
        >
          <div className="mt-4 flex h-[88px] items-center justify-center gap-2 rounded-surface bg-surface-soft">
            <span className="text-[28px] font-semibold tracking-[-0.4px] text-fg-secondary">
              ¥
            </span>
            <input
              autoFocus
              inputMode="numeric"
              value={budgetText}
              placeholder="0"
              className="w-40 bg-transparent text-center text-[40px] font-semibold tracking-[-1px] text-fg outline-none placeholder:text-fg-muted"
              onChange={(event) =>
                setBudgetText(event.target.value.replace(/[^\d]/g, ""))
              }
            />
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {[100, 500, 1000, 2400].map((amount) => (
              <button
                key={amount}
                type="button"
                onClick={() => setBudgetText(String(amount))}
                className={cx(
                  "inline-flex h-9 items-center rounded-control border px-3.5 text-[13px] font-medium",
                  budgetText === String(amount)
                    ? "border-transparent bg-accent-soft text-accent"
                    : "border-border bg-surface-soft text-fg",
                )}
              >
                ¥{amount.toLocaleString("zh-CN")}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setBudgetText("")}
              className="inline-flex h-9 items-center rounded-control border border-border bg-surface-soft px-3.5 text-[13px] font-medium text-fg"
            >
              不填
            </button>
          </div>
          <div className="mt-3 flex justify-end">
            <Button variant="ghost" onClick={() => setPicker(null)}>
              完成
            </Button>
          </div>
        </ChoiceSheet>
      ) : null}
    </>
  );
}

function MetaRow({
  icon,
  label,
  value,
  muted,
  disabled,
  onClick,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  muted?: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="flex h-11 w-full items-center gap-3 px-3.5 text-left transition-transform duration-100 ease-out active:scale-[0.99] disabled:opacity-60"
    >
      <span className="text-fg-secondary">{icon}</span>
      <span className="text-sm font-medium text-fg-secondary">{label}</span>
      <span
        className={cx(
          "ml-auto text-sm font-medium",
          muted ? "text-fg-muted" : "text-fg",
        )}
      >
        {value}
      </span>
    </button>
  );
}

function ChoiceSheet({
  title,
  hint,
  onClose,
  children,
}: {
  title: string;
  hint: string;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-overlay px-6 pb-6 pt-6 backdrop-blur-[16px] sm:items-center"
      onClick={onClose}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          onClose();
        }
      }}
      role="presentation"
    >
      <div
        className="w-full max-w-[480px] rounded-[20px] bg-surface px-5 pb-5 pt-4 shadow-[0_-4px_24px_rgb(0_0_0_/_0.08)]"
        onClick={(event) => event.stopPropagation()}
        onKeyDown={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex justify-center pb-1 pt-1">
          <div className="h-1.5 w-9 rounded-[3px] bg-border" />
        </div>
        <div className="flex items-center justify-between">
          <h2 className="text-[17px] font-semibold tracking-[-0.2px] text-fg">
            {title}
          </h2>
          <Button variant="ghost" onClick={onClose}>
            完成
          </Button>
        </div>
        <p className="mt-2 text-[13px] leading-[1.4] text-fg-secondary">
          {hint}
        </p>
        {children}
      </div>
    </div>
  );
}
