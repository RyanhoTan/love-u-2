import { Composer } from "../components/layout/composer";
import { ContentPlaceholder } from "../components/layout/content-placeholder";

export function MessagesPage() {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex min-h-0 flex-1 flex-col px-[72px] py-7">
        <ContentPlaceholder />
      </div>
      <Composer />
    </div>
  );
}
