import { Link } from "react-router";
import { Lock } from "lucide-react";

export function ContentListItem({
                                    item,
                                    toggleFavorite,
                                    getStatusBadge,
                                }: any) {
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
                            item.document_status
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
            {item.last_modified
                ? new Date(item.last_modified).toLocaleDateString()
                : "—"}
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

                <button
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