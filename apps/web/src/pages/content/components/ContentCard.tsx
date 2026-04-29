import { Lock, Unlock } from "lucide-react";
import { Link } from "react-router";
import { useFavorites } from "@/store/favorites";
import type { ContentItem } from "@/types/content";
import { renderTag } from "@/utils/tag";

type CheckinMutation = {
  mutate: (args: { fileID: string }) => void;
};

type Props = {
  item: ContentItem;
  currentUserId?: string;
  searchQuery?: string;
  toggleFavorite: {
    mutate: (args: { fileID: string }) => void;
  };
  checkin: CheckinMutation;
  getStatusBadge: (status?: string) => string;
};

function checkedOutLabel(isCheckedOutByMe: boolean, name: string | undefined): string {
  if (isCheckedOutByMe) return "Checked out by you";
  if (name) return `Checked out by ${name}`;
  return "Checked out";
}

export function ContentCard({ item, currentUserId, searchQuery, toggleFavorite, checkin }: Props) {
  const MAX_VISIBLE_TAGS = 3;
  const tags = item.content_tags ?? [];
  const visibleTags = tags.slice(0, MAX_VISIBLE_TAGS);
  const hiddenCount = tags.length - MAX_VISIBLE_TAGS;
  const { isFavorited } = useFavorites();
  const isCheckedOutByMe = !!(item.is_checked_out && item.checked_out_by === currentUserId);
  const checkedOutByName = item.checked_out_by_user?.name;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const isOverdue =
    !!item.next_review_date &&
    (() => {
      const [year, month, day] = item.next_review_date!.split("-").map(Number);
      const reviewDate = new Date(year, month - 1, day);
      return reviewDate < today;
    })();

  const detailHref = searchQuery
    ? `/hero/content/${item.fileID}/edit?q=${encodeURIComponent(searchQuery)}`
    : `/hero/content/${item.fileID}/edit`;

  return (
    <Link
      to={detailHref}
      className={`group flex flex-col rounded border bg-card shadow-sm transition-all p-5 ${
        isOverdue
          ? "border-red-800 bg-red-50 hover:border-red-900"
          : "hover:border-hanover-green hover:shadow-md"
      }`}
    >
      {/* HEADER */}
      <div className="mb-3 flex items-start justify-between gap-2">
        <h3 className="text-base font-semibold leading-snug text-foreground group-hover:text-hanover-green line-clamp-2 break-words">
          {item.filename ?? "Untitled"}
        </h3>

        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleFavorite.mutate({ fileID: item.fileID });
          }}
          className="text-yellow-400 transition-transform hover:scale-125"
        >
          {isFavorited(item.fileID) ? "★" : "☆"}
        </button>
      </div>

      {/* META */}
      <p className="mb-1 truncate text-xs text-muted-foreground">{item.url}</p>
      <p className="mb-0.5 text-xs text-muted-foreground">
        {item.content_type ?? "—"} · {item.job_position ?? "—"}
      </p>
      <p className="mb-2 text-xs text-muted-foreground">
        Created: {item.created_at ? new Date(item.created_at).toLocaleDateString() : "—"}
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
        <div className="mb-2 flex items-center justify-between gap-2 rounded bg-amber-50 px-2 py-1">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-700">
            <Lock className="h-3 w-3" />
            {checkedOutLabel(isCheckedOutByMe, checkedOutByName)}
          </div>
          {isCheckedOutByMe && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                checkin.mutate({ fileID: item.fileID });
              }}
              className="inline-flex items-center gap-1 rounded bg-amber-200 px-2 py-0.5 text-xs font-semibold text-amber-900 transition-colors hover:bg-amber-300"
            >
              <Unlock className="h-3 w-3" />
              Check In
            </button>
          )}
        </div>
      )}

      {/* OCR BADGES */}
      <div className="mb-2 flex flex-wrap gap-1">
        {item.matched_in_content && (
          <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
            matched in content
          </span>
        )}
        {(item.ocr_status === "pending" || item.ocr_status === "processing") && (
          <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
            indexing…
          </span>
        )}
        {item.ocr_status === "failed" && (
          <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-600">
            OCR failed
          </span>
        )}
      </div>

      <div className="flex-1" />

      {/* STATUS + DOTS */}
      <div className="mb-3 flex items-center justify-between">
        {(() => {
          const steps = [
            { key: "Created", label: "CREATED", color: "#C9A84C" },
            { key: "in-progress", label: "IN PROGRESS", color: "#4A90D9" },
            { key: "Finalized", label: "FINALIZED", color: "#2D6A4F" },
            { key: "Archived", label: "ARCHIVED", color: "#64748B" },
          ];
          const idx = Math.max(
            0,
            steps.findIndex((s) => s.key === item.document_status),
          );
          const active = steps[idx];
          return (
            <>
              <span
                className="text-xs font-semibold tracking-widest uppercase"
                style={{ color: active.color }}
              >
                {active.label}
              </span>
              <div className="flex items-center gap-1.5">
                {steps.map((s, i) => (
                  <div
                    key={s.key}
                    style={{
                      width: i === idx ? 8 : 7,
                      height: i === idx ? 8 : 7,
                      borderRadius: "50%",
                      backgroundColor: i <= idx ? active.color : "transparent",
                      border: `1.5px solid ${i <= idx ? active.color : "#D1D5DB"}`,
                      opacity: i < idx ? 0.4 : 1,
                    }}
                  />
                ))}
              </div>
            </>
          );
        })()}
      </div>

      {/* FOOTER */}
      <div className="pt-3 border-t border-border flex items-center justify-between gap-2 text-xs text-muted-foreground">
        <span className="truncate max-w-[60%]">{item.owner?.name ?? "Unassigned"}</span>

        <div className="flex items-center gap-1 shrink-0">
          {isOverdue && (
            <div className="relative group/clock">
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#991B1B"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <title>Overdue</title>
                <circle cx="12" cy="12" r="10" />
                <path d="M12 6v6l4 2" />
              </svg>
              <div className="pointer-events-none absolute bottom-5 right-0 hidden group-hover/clock:block bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                Overdue
              </div>
            </div>
          )}
          <span className={isOverdue ? "font-medium text-red-800" : ""}>
            Due:{" "}
            {item.next_review_date ? new Date(item.next_review_date).toLocaleDateString() : "—"}
          </span>
        </div>
      </div>
    </Link>
  );
}
