import { useState } from "react";
import { Button } from "@/components/ui/button";

const MAX_BUDGET_AMOUNT = 2_147_483_647;

function parseBudgetAmount(value: string) {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }
  if (!/^\d+$/.test(trimmed)) {
    return undefined;
  }

  const amount = Number(trimmed);
  return Number.isSafeInteger(amount) && amount <= MAX_BUDGET_AMOUNT
    ? amount
    : undefined;
}

export function EditBudgetDialog({
  initialBudgetAmount,
  pending,
  error,
  onCancel,
  onSave,
}: {
  initialBudgetAmount: number | null;
  pending: boolean;
  error?: string;
  onCancel: () => void;
  onSave: (budgetAmount: number | null) => void;
}) {
  const [budgetText, setBudgetText] = useState(
    initialBudgetAmount?.toString() ?? "",
  );
  const budgetAmount = parseBudgetAmount(budgetText);
  const isBudgetValid = budgetAmount !== undefined;
  const hasChanges = isBudgetValid && budgetAmount !== initialBudgetAmount;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-overlay px-6 py-6 backdrop-blur-[20px]"
      onClick={pending ? undefined : onCancel}
      role="presentation"
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="wish-budget-heading"
        className="w-full max-w-[480px] rounded-[20px] bg-surface p-5 shadow-[0_12px_40px_rgb(28_20_24_/_0.1)]"
        onClick={(event) => event.stopPropagation()}
        onKeyDown={(event) => {
          if (event.key === "Escape" && !pending) {
            onCancel();
          }
        }}
      >
        <h2
          id="wish-budget-heading"
          className="mb-4 text-[17px] font-semibold tracking-[-0.2px] text-fg"
        >
          编辑心愿预算
        </h2>

        <label
          htmlFor="wish-budget"
          className="mb-2 block text-sm font-medium text-fg-secondary"
        >
          预算（人民币）
        </label>
        <div className="flex h-12 items-center rounded-[12px] border border-border bg-surface-soft px-3.5 focus-within:border-accent focus-within:shadow-[0_0_0_3px_var(--color-accent-soft)]">
          <span className="mr-2 text-[15px] text-fg-muted">¥</span>
          <input
            autoFocus
            id="wish-budget"
            type="text"
            inputMode="numeric"
            maxLength={10}
            value={budgetText}
            disabled={pending}
            aria-label="心愿预算（人民币整数）"
            placeholder="未设置，留空可清除"
            className="min-w-0 flex-1 bg-transparent text-[15px] text-fg outline-none placeholder:text-fg-muted disabled:opacity-60"
            onChange={(event) => setBudgetText(event.target.value)}
          />
        </div>

        {!isBudgetValid ? (
          <p className="mt-2 text-sm font-medium text-danger" role="alert">
            请输入 0–2,147,483,647 的非负整数
          </p>
        ) : null}
        {error ? (
          <p className="mt-3 text-sm font-medium text-danger" role="alert">
            {error}
          </p>
        ) : null}

        <div className="mt-5 flex justify-end gap-2">
          <Button variant="secondary" disabled={pending} onClick={onCancel}>
            取消
          </Button>
          <Button
            disabled={pending || !isBudgetValid || !hasChanges}
            onClick={() => {
              if (budgetAmount !== undefined) {
                onSave(budgetAmount);
              }
            }}
          >
            {pending ? "保存中…" : "保存"}
          </Button>
        </div>
      </section>
    </div>
  );
}
