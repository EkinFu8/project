import { Loader2 } from "lucide-react";
import type { ContentItem } from "@/types/content";
import { renderTag } from "@/utils/tag";
import { ContentCard } from "./ContentCard";

type CheckinMutation = {
  mutate: (args: { fileID: string }) => void;
};

type StatusFn = (status?: string) => string;

type Filters = {
  view: "grid" | "list";
};

type Props = {
  contents: {
    isLoading: boolean;
  };
  filtered: ContentItem[];
  filters: Filters;
  currentUserId?: string;
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
  searchQuery,
  toggleFavorite,
  checkin,
  getStatusBadge,
}: Props) {
  return (
    <main className="flex-1 min-w-0">
      {contents.isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-hanover-green" />
        </div>
      ) : filters.view === "grid" ? (
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
        <div className="flex flex-col divide-y divide-border rounded border border-border bg-card">
          {filtered.map((item) => {
            const tags = item.content_tags ?? [];
            const visibleTags = tags.slice(0, 2);
            const hiddenCount = tags.length - 2;
            const isOverdue =
              !!item.next_review_date &&
              new Date(item.next_review_date) < new Date(new Date().toDateString());

            return (
              <div
                key={item.fileID}
                className={`flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-muted/50 transition-colors ${
                  isOverdue ? "bg-red-50/40" : ""
                }`}
              >
                <span className="min-w-0 flex-[2] truncate font-medium text-foreground">
                  {item.filename ?? "Untitled"}
                </span>

                <span
                  className={`shrink-0 rounded px-2 py-0.5 text-xs font-semibold ${getStatusBadge(
                    item.document_status,
                  )}`}
                >
                  {item.document_status ?? "—"}
                </span>

                <div className="flex shrink-0 items-center gap-1">
                  {visibleTags.map((ct) => {
                    const styles = renderTag(ct.tag);
                    return (
                      <span
                        key={ct.tag.id}
                        style={{ backgroundColor: styles.bg, color: styles.text }}
                        className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
                      >
                        {ct.tag.name}
                      </span>
                    );
                  })}
                  {hiddenCount > 0 && (
                    <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                      +{hiddenCount}
                    </span>
                  )}
                </div>

                {isOverdue && (
                  <span className="shrink-0 text-xs font-semibold text-red-600">⚠ Overdue</span>
                )}

                <span className="w-28 shrink-0 truncate text-xs text-muted-foreground">
                  {item.owner?.name ?? "Unassigned"}
                </span>

                <span className="w-20 shrink-0 text-right text-xs text-muted-foreground">
                  {item.next_review_date
                    ? new Date(item.next_review_date).toLocaleDateString()
                    : item.last_modified
                      ? new Date(item.last_modified).toLocaleDateString()
                      : "—"}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
