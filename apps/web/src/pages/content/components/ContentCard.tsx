import { Lock } from "lucide-react";
import { Link } from "react-router";
import type { ContentItem } from "@/types/content";
import { renderTag } from "@/utils/tag";

type Props = {
  item: ContentItem;
  toggleFavorite: {
    mutate: (args: { fileID: string; is_favorited: boolean }) => void;
  };
  getStatusBadge: (status?: string) => string;
};



export function ContentCard({ item, toggleFavorite, getStatusBadge }: Props) {

  const MAX_VISIBLE_TAGS = 3;
  const tags = item.content_tags ?? [];
  const visibleTags = tags.slice(0, MAX_VISIBLE_TAGS);
  const hiddenCount = tags.length - MAX_VISIBLE_TAGS;

  return (
    <Link
      to={`/hero/content/${item.fileID}/edit`}
      className="group rounded border border-border bg-card shadow-sm transition-all hover:border-hanover-green hover:shadow-md p-5"
    >
      {/* HEADER */}
      <div className="mb-3 flex items-start justify-between gap-2">
        <h3 className="text-base font-semibold leading-snug text-foreground group-hover:text-hanover-green line-clamp-2 break-words">
          {item.filename ?? "Untitled"}
        </h3>

        <div className="flex shrink-0 items-center gap-1">
          <span
            className={`rounded px-2 py-0.5 text-xs font-semibold ${getStatusBadge(
              item.document_status,
            )}`}
          >
            {item.document_status ?? "—"}
          </span>

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
      </div>

      {/* META */}
      <p className="mb-1 text-xs text-muted-foreground">
        {item.content_type ?? "—"} · {item.job_position ?? "—"}
      </p>

      {/* TAGS */}
      {tags.length ? (
          <div className="group/tags mb-2 flex flex-wrap gap-x-1 gap-y-1.5">
            {visibleTags.map((ct) => {
              const styles = renderTag(ct.tag);

              return (
                  <span
                      key={ct.tag.id}
                      style={{
                        backgroundColor: styles.bg,
                        color: styles.text,
                      }}
                      className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium transition-all hover:opacity-80"
                  >
          {ct.tag.name}
        </span>
              );
            })}

            {hiddenCount > 0 && (
                <div className="relative">
        <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground cursor-default">
          +{hiddenCount} more
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

      {/* CHECKED OUT */}
      {item.is_checked_out && (
        <div className="mb-2 flex items-center gap-1.5 rounded bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-700">
          <Lock className="h-3 w-3" />
          Checked out
        </div>
      )}

      {/* FOOTER */}
      <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
        <span className="truncate max-w-[60%]">{item.owner?.name ?? "Unassigned"}</span>

        <span className="shrink-0">
          {item.last_modified ? new Date(item.last_modified).toLocaleDateString() : "—"}
        </span>
      </div>
    </Link>
  );
}
