import { AlertTriangle, Loader2, Lock, Sparkles, Unlock } from "lucide-react";
import { Link } from "react-router";
import { useFavorites } from "@/store/favorites";
import type { ContentItem } from "@/types/content";
import { renderTag } from "@/utils/tag";
import { CONTENT_LIST_GRID } from "./ContentListHeader";

type CheckinMutation = {
  mutate: (args: { fileID: string }) => void;
};

type Props = {
  item: ContentItem;
  currentUserId?: string;
  searchQuery?: string;
  toggleFavorite: { mutate: (args: { fileID: string }) => void };
  checkin: CheckinMutation;
  getStatusBadge: (status?: string) => string;
};

/**
 * Per-role left-edge stripe color. Mirrors the card tints — full-row
 * backgrounds would fight the divide-y separators in list mode, so the
 * stripe is the lightest-touch way to keep the role-color signal.
 */
const ROLE_STRIPE: Record<string, string> = {
  underwriter: "border-l-blue-500",
  "business-analyst": "border-l-amber-500",
  "actuarial-analyst": "border-l-emerald-500",
  "exl-operations": "border-l-violet-500",
};

function checkedOutLabel(isCheckedOutByMe: boolean, name: string | undefined): string {
  if (isCheckedOutByMe) return "Checked out by you";
  if (name) return `Checked out by ${name}`;
  return "Checked out";
}

function isOverdueDate(reviewDate: string | null | undefined): boolean {
  if (!reviewDate) return false;
  const [year, month, day] = reviewDate.split("-").map(Number);
  if (!year || !month || !day) return false;
  const due = new Date(year, month - 1, day);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return due < today;
}

function formatRowDate(item: ContentItem): string {
  if (item.next_review_date) return new Date(item.next_review_date).toLocaleDateString();
  if (item.last_modified) return new Date(item.last_modified).toLocaleDateString();
  return "—";
}

export function ContentListRow({
  item,
  currentUserId,
  searchQuery,
  toggleFavorite,
  checkin,
  getStatusBadge,
}: Props) {
  const { isFavorited } = useFavorites();
  const tags = item.content_tags ?? [];
  const firstTag = tags[0]?.tag;
  const hiddenCount = Math.max(0, tags.length - 1);
  const firstTagStyles = firstTag ? renderTag(firstTag) : null;

  const isCheckedOutByMe = !!(item.is_checked_out && item.checked_out_by === currentUserId);
  const checkedOutByName = item.checked_out_by_user?.name;

  const overdue = isOverdueDate(item.next_review_date);
  const dateString = formatRowDate(item);

  const detailHref = searchQuery
    ? `/hero/content/${item.fileID}/edit?q=${encodeURIComponent(searchQuery)}`
    : `/hero/content/${item.fileID}/edit`;

  const stripeClass = ROLE_STRIPE[item.job_position ?? ""] ?? "border-l-zinc-300";

  return (
    <Link
      to={detailHref}
      className={`${CONTENT_LIST_GRID} border-l-2 ${stripeClass} px-4 py-2.5 text-sm transition-colors hover:bg-muted/50 ${
        overdue ? "bg-red-50/40" : ""
      }`}
    >
      {/* 1 — STAR */}
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          toggleFavorite.mutate({ fileID: item.fileID });
        }}
        title={isFavorited(item.fileID) ? "Remove from favorites" : "Add to favorites"}
        aria-label={isFavorited(item.fileID) ? "Remove from favorites" : "Add to favorites"}
        className="leading-none text-base text-yellow-400"
      >
        {isFavorited(item.fileID) ? "★" : "☆"}
      </button>

      {/* 2 — DOCUMENT (filename + small inline status icons) */}
      <div className="flex min-w-0 items-center gap-2">
        {/* Filename + fast custom tooltip on truncation hover */}
        <div className="group/filename relative min-w-0 flex-1">
          <span className="block truncate font-medium text-foreground">
            {item.filename ?? "Untitled"}
          </span>
          <div className="invisible absolute left-0 top-full z-30 mt-1 max-w-xs rounded border border-border bg-popover px-2.5 py-1.5 text-xs font-medium text-popover-foreground opacity-0 shadow-md transition-opacity duration-75 group-hover/filename:visible group-hover/filename:opacity-100">
            {item.filename ?? "Untitled"}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          {item.matched_in_content && (
            <span
              role="img"
              aria-label="matched"
              title="Search matched the contents of this document"
            >
              <Sparkles className="h-3.5 w-3.5 text-blue-600" />
            </span>
          )}
          {(item.ocr_status === "pending" || item.ocr_status === "processing") && (
            <span role="img" aria-label="indexing" title="Document is being indexed">
              <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
            </span>
          )}
          {item.ocr_status === "failed" && (
            <span role="img" aria-label="indexing failed" title="Indexing failed">
              <AlertTriangle className="h-3.5 w-3.5 text-red-500" />
            </span>
          )}
        </div>
      </div>

      {/* 3 — TYPE */}
      <div className="min-w-0">
        {item.content_type ? (
          <span className="inline-flex max-w-full items-center truncate rounded border border-border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
            {item.content_type}
          </span>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        )}
      </div>

      {/* 4 — STATUS */}
      <div className="min-w-0">
        <span
          className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-semibold ${getStatusBadge(
            item.document_status,
          )}`}
        >
          {item.document_status ?? "—"}
        </span>
      </div>

      {/* 5 — TAGS (single visible + hover popover) */}
      <div className="group/tags relative flex min-w-0 items-center gap-1">
        {firstTag && firstTagStyles ? (
          <>
            <span
              style={{ backgroundColor: firstTagStyles.bg, color: firstTagStyles.text }}
              className="inline-flex min-w-0 max-w-full items-center truncate rounded-full px-2 py-0.5 text-xs font-medium"
            >
              {firstTag.name}
            </span>
            {hiddenCount > 0 && (
              <span className="inline-flex shrink-0 items-center rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                +{hiddenCount}
              </span>
            )}
            {hiddenCount > 0 && (
              <div className="invisible absolute left-0 top-full z-20 mt-1 flex max-w-[260px] flex-wrap gap-1 rounded border border-border bg-background p-2 opacity-0 shadow-md transition-opacity duration-150 group-hover/tags:visible group-hover/tags:opacity-100">
                {tags.map((ct) => {
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
              </div>
            )}
          </>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        )}
      </div>

      {/* 6 — OWNER */}
      <span className="min-w-0 truncate text-xs text-muted-foreground">
        {item.owner?.name ?? "Unassigned"}
      </span>

      {/* 7 — LOCK / CHECK-IN (between owner and date) */}
      <div className="flex min-w-0 items-center justify-start">
        {item.is_checked_out && !isCheckedOutByMe && (
          <span
            title={checkedOutLabel(false, checkedOutByName)}
            className="inline-flex min-w-0 max-w-full items-center gap-1 rounded bg-amber-50 px-1 py-px text-[11px] font-medium text-amber-700"
          >
            <Lock className="h-3 w-3 shrink-0" aria-hidden="true" />
            <span className="truncate">{checkedOutByName ?? "in use"}</span>
          </span>
        )}
        {isCheckedOutByMe && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              checkin.mutate({ fileID: item.fileID });
            }}
            className="inline-flex items-center gap-1 rounded bg-amber-200 px-2 py-0.5 text-[11px] font-semibold text-amber-900 hover:bg-amber-300"
            title="Click to check this document back in"
          >
            <Unlock className="h-3 w-3" />
            Check In
          </button>
        )}
      </div>

      {/* 8 — DATE (overdue ⚠ + red tint absorbs the standalone overdue chip) */}
      {overdue ? (
        <span className="flex items-center justify-end gap-1 text-xs font-semibold text-red-700">
          <span aria-hidden="true">⚠</span>
          <span>{dateString}</span>
        </span>
      ) : (
        <span className="text-right text-xs text-muted-foreground">{dateString}</span>
      )}
    </Link>
  );
}
