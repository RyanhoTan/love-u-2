import { useState } from "react";
import { WISHES } from "../../app/mock";
import { PageBody } from "../../components/layout/page-body";
import { Segmented } from "../../components/ui/segmented";

const TABS = [
  { value: "want", label: "想去" },
  { value: "doing", label: "进行中" },
  { value: "done", label: "已完成" },
] as const;

type Tab = (typeof TABS)[number]["value"];

export function WishesPage() {
  const [tab, setTab] = useState<Tab>("doing");

  return (
    <PageBody className="gap-6">
      <Segmented value={tab} onChange={setTab} options={[...TABS]} />
      <div className="grid grid-cols-3 gap-4">
        {WISHES.map((wish) => (
          <article
            key={wish.title}
            className="overflow-hidden rounded-surface bg-surface shadow-[0_1px_3px_rgba(0,0,0,0.03),0_4px_12px_rgba(0,0,0,0.04)]"
          >
            <img
              src={wish.src}
              alt={wish.title}
              className="h-50 w-full object-cover"
            />
            <div className="flex flex-col gap-2 px-4 pb-4 pt-3.5">
              <h2 className="text-base font-semibold tracking-[-0.2px] text-fg">
                {wish.title}
              </h2>
              <div className="flex items-center justify-between">
                <p className="text-xs text-fg-secondary">{wish.place}</p>
                <p className="text-xs font-medium text-accent">{wish.status}</p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </PageBody>
  );
}
