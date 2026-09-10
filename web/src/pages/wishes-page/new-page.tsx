import { Calendar, ImagePlus, MapPin, Wallet } from "lucide-react";
import { useId, useRef, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { uploadWishMedia } from "@/api/wish";
import {
  errorMessage,
  useCreateWishMutation,
} from "@/features/wish/queries";
import { PageBody } from "@/components/layout/page-body";
import { Input } from "@/components/ui/input";
import { DatePickerSheet } from "@/pages/days-page/pickers";
import { cx } from "@/lib/cx";
import { dotDateToIso, isoToDotDate, todayIso } from "./types";

const FORM_ID = "wish-new-form";

export function WishNewPage() {
  const navigate = useNavigate();
  const createMutation = useCreateWishMutation();
  const fileInputId = useId();
  const fileRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [cover, setCover] = useState("");
  const [targetDate, setTargetDate] = useState(todayIso());
  const [locationName, setLocationName] = useState("");
  const [budgetText, setBudgetText] = useState("");
  const [dateOpen, setDateOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [localError, setLocalError] = useState("");

  const pending = createMutation.isPending || uploading;

  async function handleCoverChange(file: File | undefined) {
    if (!file) {
      return;
    }
    setLocalError("");
    setUploading(true);
    try {
      const uploaded = await uploadWishMedia(file);
      setCover(uploaded.url);
    } catch (caught) {
      setLocalError(errorMessage(caught, "封面上传失败"));
    } finally {
      setUploading(false);
    }
  }

  function submit() {
    const trimmed = title.trim();
    if (!trimmed) {
      setLocalError("请输入标题");
      return;
    }
    if (!targetDate) {
      setLocalError("请选择目标日");
      return;
    }

    const budgetAmount =
      budgetText.trim() === ""
        ? null
        : Number.parseInt(budgetText.replace(/[^\d]/g, ""), 10);

    if (budgetText.trim() !== "" && !Number.isFinite(budgetAmount)) {
      setLocalError("预算请输入数字");
      return;
    }

    setLocalError("");
    createMutation.mutate(
      {
        title: trimmed,
        description: description.trim(),
        cover,
        targetDate,
        locationName: locationName.trim(),
        latitude: null,
        longitude: null,
        budgetAmount:
          budgetAmount != null && Number.isFinite(budgetAmount)
            ? budgetAmount
            : null,
      },
      {
        onSuccess: (response) => {
          navigate(`/wishes/${response.wish.id}`, { replace: true });
        },
      },
    );
  }

  return (
    <PageBody>
      <form
        id={FORM_ID}
        className="mx-auto flex w-full max-w-[560px] flex-col gap-5 pb-10 pt-1"
        onSubmit={(event) => {
          event.preventDefault();
          submit();
        }}
      >
        <button
          type="button"
          disabled={pending}
          onClick={() => fileRef.current?.click()}
          className={cx(
            "flex h-[220px] w-full flex-col items-center justify-center gap-2 overflow-hidden rounded-surface border border-border bg-surface",
            "transition-transform duration-100 ease-out active:scale-[0.99]",
            "disabled:opacity-60",
          )}
        >
          {cover ? (
            <img src={cover} alt="" className="h-full w-full object-cover" />
          ) : (
            <>
              <ImagePlus className="size-7 text-fg-muted" strokeWidth={1.75} />
              <span className="text-sm text-fg-muted">
                {uploading ? "上传中…" : "添加封面"}
              </span>
            </>
          )}
        </button>
        <input
          id={fileInputId}
          ref={fileRef}
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={(event) => {
            void handleCoverChange(event.target.files?.[0]);
            event.target.value = "";
          }}
        />

        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-fg-muted">标题</span>
          <Input
            value={title}
            disabled={pending}
            placeholder="去北海道看雪"
            onChange={(event) => setTitle(event.target.value)}
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-fg-muted">备注</span>
          <Input
            value={description}
            disabled={pending}
            placeholder="想在初雪那天去，一起堆雪人"
            onChange={(event) => setDescription(event.target.value)}
          />
        </label>

        <div className="overflow-hidden rounded-[12px] bg-surface">
          <FieldButton
            icon={<Calendar className="size-[18px]" strokeWidth={2} />}
            label="时间"
            value={targetDate ? isoToDotDate(targetDate) : "选择日期"}
            disabled={pending}
            onClick={() => setDateOpen(true)}
          />
          <div className="h-px bg-border" />
          <label className="flex h-11 items-center gap-3 px-3.5">
            <MapPin className="size-[18px] shrink-0 text-fg-secondary" strokeWidth={2} />
            <span className="shrink-0 text-[15px] font-medium text-fg-secondary">
              地点
            </span>
            <input
              value={locationName}
              disabled={pending}
              placeholder="选择地点"
              className="min-w-0 flex-1 bg-transparent text-right text-[15px] font-medium text-fg outline-none placeholder:text-fg-muted"
              onChange={(event) => setLocationName(event.target.value)}
            />
          </label>
          <div className="h-px bg-border" />
          <label className="flex h-11 items-center gap-3 px-3.5">
            <Wallet className="size-[18px] shrink-0 text-fg-secondary" strokeWidth={2} />
            <span className="shrink-0 text-[15px] font-medium text-fg-secondary">
              预算
            </span>
            <input
              value={budgetText}
              disabled={pending}
              inputMode="numeric"
              placeholder="¥ 未定"
              className="min-w-0 flex-1 bg-transparent text-right text-[15px] font-medium text-fg outline-none placeholder:text-fg-muted"
              onChange={(event) =>
                setBudgetText(event.target.value.replace(/[^\d]/g, ""))
              }
            />
          </label>
        </div>

        {localError || createMutation.isError ? (
          <p className="text-sm font-medium text-danger" role="alert">
            {localError || errorMessage(createMutation.error)}
          </p>
        ) : null}
      </form>

      {dateOpen ? (
        <DatePickerSheet
          value={isoToDotDate(targetDate)}
          onClose={() => setDateOpen(false)}
          onDone={(dot) => {
            setTargetDate(dotDateToIso(dot));
            setDateOpen(false);
          }}
        />
      ) : null}
    </PageBody>
  );
}

function FieldButton({
  icon,
  label,
  value,
  disabled,
  onClick,
}: {
  icon: ReactNode;
  label: string;
  value: string;
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
      <span className="text-[15px] font-medium text-fg-secondary">{label}</span>
      <span className="ml-auto text-[15px] font-medium text-fg">{value}</span>
    </button>
  );
}
