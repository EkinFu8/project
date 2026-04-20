import { Link } from "react-router";
import { Lock } from "lucide-react";
import type { ContentItem } from "@/types/content";

type Props = {
  item: ContentItem;
  toggleFavorite: {
    mutate: (args: { fileID: string; is_favorited: boolean }) => void;
  };
  getStatusBadge: (status?: string) => string;
};

export function ContentCard({ item, toggleFavorite, getStatusBadge }: Props) {
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
      {item.content_tags?.length ? (
        <div className="mb-2 flex flex-wrap gap-1 max-w-full overflow-hidden">
          {item.content_tags.map((ct) => (
            <span
              key={ct.tag.id}
              className="inline-flex items-center rounded-full bg-hanover-green/10 px-2 py-0.5 text-xs font-medium text-hanover-green"
            >
              {ct.tag.name}
            </span>
          ))}
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
