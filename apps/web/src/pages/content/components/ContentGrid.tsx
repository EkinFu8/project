import { Loader2 } from "lucide-react";
import type { ContentItem } from "@/types/content";
import { ContentCard } from "./ContentCard";
import { ContentGroupedView } from "./ContentGroupedView";
import { ContentListHeader } from "./ContentListHeader";
import { ContentListRow } from "./ContentListRow";

type CheckinMutation = {
  mutate: (args: { fileID: string }) => void;
};

type StatusFn = (status?: string) => string;

type Filters = {
  view: "grid" | "list";
  group: "none" | "role";
};

type Props = {
  contents: {
    isLoading: boolean;
  };
  filtered: ContentItem[];
  filters: Filters;
  currentUserId?: string;
  currentUserRole?: string | null;
  searchQuery?: string;
  toggleFavorite: {
    mutate: (args: { fileID: string }) => void;
  };
  checkin: CheckinMutation;
  getStatusBadge: StatusFn;
};

export function ContentGrid({
  contents,
  filtered,
  filters,
  currentUserId,
  currentUserRole,
  searchQuery,
  toggleFavorite,
  checkin,
  getStatusBadge,
}: Props) {
  if (contents.isLoading) {
    return (
      <main className="flex-1 min-w-0">
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-hanover-green" />
        </div>
      </main>
    );
  }

  if (filters.group === "role") {
    return (
      <main className="flex-1 min-w-0">
        <ContentGroupedView
          items={filtered}
          view={filters.view}
          currentUserId={currentUserId}
          currentUserRole={currentUserRole}
          searchQuery={searchQuery}
          toggleFavorite={toggleFavorite}
          checkin={checkin}
          getStatusBadge={getStatusBadge}
        />
      </main>
    );
  }

  return (
    <main className="flex-1 min-w-0">
      {filters.view === "grid" ? (
        <div
          style={{
            display: "grid",
            gap: "1rem",
            gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
          }}
        >
          {filtered.map((item) => (
            <ContentCard
              key={item.fileID}
              item={item}
              currentUserId={currentUserId}
              searchQuery={searchQuery}
              toggleFavorite={toggleFavorite}
              checkin={checkin}
              getStatusBadge={getStatusBadge}
            />
          ))}
        </div>
      ) : (
        <div className="rounded border border-border bg-card">
          <ContentListHeader />
          <div className="flex flex-col divide-y divide-border">
            {filtered.map((item) => (
              <ContentListRow
                key={item.fileID}
                item={item}
                currentUserId={currentUserId}
                searchQuery={searchQuery}
                toggleFavorite={toggleFavorite}
                checkin={checkin}
                getStatusBadge={getStatusBadge}
              />
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
