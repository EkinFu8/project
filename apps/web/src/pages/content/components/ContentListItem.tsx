import { Lock } from "lucide-react";
import { Link } from "react-router";
import type { ContentItem } from "@/types/content";
import { renderTag } from "@/utils/tag";

type ToggleFavorite = {
  mutate: (args: { fileID: string; is_favorited: boolean }) => void;
};

type Props = {
  item: ContentItem;
  toggleFavorite: ToggleFavorite;
  getStatusBadge: (status?: string) => string;
};

export function ContentListItem({ item, toggleFavorite, getStatusBadge }: Props) {

  const MAX_VISIBLE_TAGS = 3;
  const tags = item.content_tags ?? [];
  const visibleTags = tags.slice(0, MAX_VISIBLE_TAGS);
  const hiddenCount = tags.length - MAX_VISIBLE_TAGS;

  return (
    <Link
      to={`/hero/content/${item.fileID}/edit`}
      className="group flex items-center justify-between rounded border border-border bg-card p-3 shadow-sm transition-all hover:border-hanover-green hover:shadow-md"
    >
      {/* LEFT SIDE */}
      <div className="flex flex-col gap-1 overflow-hidden">
        <div className="flex items-center gap-2">
          <h3 className="truncate text-sm font-semibold text-foreground group-hover:text-hanover-green">
            {item.filename ?? "Untitled"}
          </h3>

          <span
            className={`shrink-0 rounded px-2 py-0.5 text-xs font-semibold ${getStatusBadge(
              item.document_status,
            )}`}
          >
            {item.document_status ?? "—"}
          </span>
        </div>

        <p className="text-xs text-muted-foreground">
          {item.content_type ?? "—"} · {item.job_position ?? "—"}
        </p>

        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="truncate">{item.owner?.name ?? "Unassigned"}</span>

          <span>
            {item.last_modified ? new Date(item.last_modified).toLocaleDateString() : "—"}
          </span>
        </div>
      </div>



      {/* RIGHT SIDE */}
      <div className="flex items-center gap-2">
        {item.is_checked_out && (
          <div className="flex items-center gap-1 rounded bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-700">
            <Lock className="h-3 w-3" />
            Checked out
          </div>
        )}

        {/* TAGS */}
        {tags.length ? (
            <div className="group/tags flex flex-wrap gap-1">
              {visibleTags.map((ct) => {
                const styles = renderTag(ct.tag);

                return (
                    <span
                        key={ct.tag.id}
                        style={{
                          backgroundColor: styles.bg,
                          color: styles.text,
                        }}
                        className="inline-flex items-center rounded-full px-2 py-.5 text-xs font-medium"
                    >
          {ct.tag.name}
        </span>
                );
              })}

              {hiddenCount > 0 && (
                  <div className="relative">
        <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
          +{hiddenCount}
        </span>

                    <div className="pointer-events-none absolute left-0 top-full z-10 mt-1 hidden max-w-[200px] flex-wrap gap-1 rounded border border-border bg-background p-2 shadow-md group-hover/tags:flex">
                      {tags.slice(MAX_VISIBLE_TAGS).map((ct) => {
                        const styles = renderTag(ct.tag);

                        return (
                            <span
                                key={ct.tag.id}
                                style={{
                                  backgroundColor: styles.bg,
                                  color: styles.text,
                                }}
                                className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
                            >
                {ct.tag.name}
              </span>
                        );
                      })}
                    </div>
                  </div>
              )}
            </div>
        ) : null}

        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            toggleFavorite.mutate({
              fileID: item.fileID,
              is_favorited: !item.is_favorited,
            });
          }}
          className="text-yellow-400"
        >
          {item.is_favorited ? "★" : "☆"}
        </button>
      </div>
    </Link>
  );
}
