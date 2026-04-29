import { cn } from "@myapp/ui/lib/utils";
import { Clock, FileText, Loader2, Lock, Sparkles, Star, Unlock, User } from "lucide-react";
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

/**
 * Per-role left-edge accent stripe. The card already carries a soft tinted
 * background; the stripe gives it one more deliberate piece of role signal
 * without changing palette decisions.
 */
const ROLE_ACCENT: Record<string, string> = {
  underwriter: "bg-blue-500",
  "business-analyst": "bg-amber-500",
  "actuarial-analyst": "bg-emerald-500",
  "exl-operations": "bg-violet-500",
};

export function ContentCard({ item, currentUserId, searchQuery, toggleFavorite, checkin }: Props) {
  const MAX_VISIBLE_TAGS = 3;
  const tags = item.content_tags ?? [];
  const visibleTags = tags.slice(0, MAX_VISIBLE_TAGS);
  const hiddenCount = tags.length - MAX_VISIBLE_TAGS;
  const { isFavorited } = useFavorites();
  const favorited = isFavorited(item.fileID);
  const isCheckedOutByMe = !!(item.is_checked_out && item.checked_out_by === currentUserId);
  const checkedOutByName = item.checked_out_by_user?.name;

  const roleBG: Record<string, string> = {
    underwriter: "bg-blue-50/60 dark:bg-blue-950/30",
    "business-analyst": "bg-amber-50/60 dark:bg-amber-950/30",
    "actuarial-analyst": "bg-emerald-50/60 dark:bg-emerald-950/30",
    "exl-operations": "bg-violet-50/60 dark:bg-violet-950/30",
  };
  const accent = ROLE_ACCENT[item.job_position ?? ""] ?? "bg-zinc-300";

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
      className={`group relative flex flex-col overflow-hidden rounded-xl border ${cn(
        roleBG[item.job_position ?? ""] ?? "bg-card",
      )} p-5 pl-[1.375rem] shadow-sm shadow-black/[0.025] transition-all duration-200 hover:-translate-y-0.5 ${
        isOverdue
          ? "border-red-300 bg-red-50/70 hover:border-red-400 hover:shadow-md hover:shadow-red-100"
          : "border-border/80 hover:border-hanover-green/50 hover:shadow-md"
      }`}
    >
      {/* Left-edge role accent */}
      <span
        aria-hidden
        className={`absolute left-0 top-0 h-full w-[3px] ${
          isOverdue ? "bg-red-500" : accent
        } opacity-80`}
      />

      {/* HEADER */}
      <div className="mb-2.5 flex items-start justify-between gap-2">
        <h3 className="line-clamp-2 break-words text-[15px] font-semibold leading-snug tracking-tight text-foreground transition-colors group-hover:text-hanover-green">
          {item.filename ?? "Untitled"}
        </h3>

        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleFavorite.mutate({ fileID: item.fileID });
          }}
          aria-label={favorited ? "Remove from favorites" : "Add to favorites"}
          aria-pressed={favorited}
          className="-mr-1 -mt-1 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-amber-400 transition-all hover:scale-110 hover:bg-amber-50 active:scale-95 dark:hover:bg-amber-950/40"
        >
          <Star
            className={`h-4 w-4 transition-all ${
              favorited
                ? "fill-amber-400 text-amber-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.35)]"
                : "fill-transparent text-muted-foreground/60 group-hover:text-amber-400"
            }`}
          />
        </button>
      </div>

      {/* META */}
      <div className="mb-2.5 flex flex-col gap-0.5 text-[11.5px] text-muted-foreground">
        {item.url && (
          <p className="flex items-center gap-1 truncate">
            <FileText className="h-3 w-3 shrink-0 text-muted-foreground/70" aria-hidden />
            <span className="truncate">{item.url}</span>
          </p>
        )}
        <p className="text-muted-foreground/90">
          <span className="font-medium text-foreground/80">{item.content_type ?? "—"}</span>
          <span className="mx-1.5 text-muted-foreground/40">·</span>
          <span>{item.job_position ?? "—"}</span>
        </p>
        <p>Created {item.created_at ? new Date(item.created_at).toLocaleDateString() : "—"}</p>
      </div>

      {/* TAGS */}
      {tags.length ? (
        <div className="group/tags mb-2.5 flex flex-wrap gap-1">
          {visibleTags.map((ct) => {
            const styles = renderTag(ct.tag);

            return (
              <span
                key={ct.tag.id}
                style={{
                  backgroundColor: styles.bg,
                  color: styles.text,
                }}
                className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset ring-black/[0.04] transition-all hover:opacity-90"
              >
                {ct.tag.name}
              </span>
            );
          })}

          {hiddenCount > 0 && (
            <div className="relative">
              <span className="inline-flex cursor-default items-center rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground ring-1 ring-inset ring-border">
                +{hiddenCount} more
              </span>

              <div className="pointer-events-none absolute left-0 top-full z-10 mt-1.5 hidden max-w-[220px] origin-top-left animate-pop flex-wrap gap-1 rounded-lg border border-border bg-popover p-2 shadow-lg shadow-black/10 ring-1 ring-black/[0.02] group-hover/tags:flex">
                {tags.slice(MAX_VISIBLE_TAGS).map((ct) => {
                  const styles = renderTag(ct.tag);

                  return (
                    <span
                      key={ct.tag.id}
                      style={{
                        backgroundColor: styles.bg,
                        color: styles.text,
                      }}
                      className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium"
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
        <div className="mb-2.5 flex items-center justify-between gap-2 rounded-lg border border-amber-200/70 bg-amber-50/80 px-2.5 py-1 dark:border-amber-800/40 dark:bg-amber-950/30">
          <div className="flex min-w-0 items-center gap-1.5 text-[11.5px] font-semibold text-amber-800 dark:text-amber-200">
            <Lock className="h-3 w-3 shrink-0" aria-hidden />
            <span className="truncate">{checkedOutLabel(isCheckedOutByMe, checkedOutByName)}</span>
          </div>
          {isCheckedOutByMe && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                checkin.mutate({ fileID: item.fileID });
              }}
              className="inline-flex shrink-0 items-center gap-1 rounded-md bg-amber-200/80 px-2 py-0.5 text-[11px] font-semibold text-amber-900 transition-all hover:bg-amber-300 active:scale-95 dark:bg-amber-900/40 dark:text-amber-100 dark:hover:bg-amber-900/60"
            >
              <Unlock className="h-3 w-3" />
              Check in
            </button>
          )}
        </div>
      )}

      {/* OCR BADGES */}
      {(item.matched_in_content ||
        item.ocr_status === "pending" ||
        item.ocr_status === "processing" ||
        item.ocr_status === "failed") && (
        <div className="mb-2.5 flex flex-wrap gap-1">
          {item.matched_in_content && (
            <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-700 ring-1 ring-inset ring-blue-200/70 dark:bg-blue-950/40 dark:text-blue-300 dark:ring-blue-900/50">
              <Sparkles className="h-3 w-3" aria-hidden />
              Match in document
            </span>
          )}
          {(item.ocr_status === "pending" || item.ocr_status === "processing") && (
            <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
              <Loader2 className="h-3 w-3 animate-spin" aria-hidden />
              Indexing…
            </span>
          )}
          {item.ocr_status === "failed" && (
            <span className="inline-flex items-center rounded-full bg-red-50 px-2 py-0.5 text-[11px] font-medium text-red-600 ring-1 ring-inset ring-red-200 dark:bg-red-950/40 dark:text-red-300 dark:ring-red-900/50">
              OCR failed
            </span>
          )}
        </div>
      )}

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
                className="inline-flex items-center gap-1.5 text-[10.5px] font-bold uppercase tracking-[0.08em]"
                style={{ color: active.color }}
              >
                <span
                  aria-hidden
                  className="inline-block h-1.5 w-1.5 rounded-full"
                  style={{ backgroundColor: active.color }}
                />
                {active.label}
              </span>
              <div className="flex items-center gap-1">
                {steps.map((s, i) => (
                  <div
                    key={s.key}
                    aria-hidden
                    style={{
                      width: i === idx ? 7 : 6,
                      height: i === idx ? 7 : 6,
                      borderRadius: "50%",
                      backgroundColor: i <= idx ? active.color : "transparent",
                      border: `1.5px solid ${i <= idx ? active.color : "rgba(0,0,0,0.18)"}`,
                      opacity: i < idx ? 0.4 : 1,
                      transition: "all 200ms ease",
                    }}
                  />
                ))}
              </div>
            </>
          );
        })()}
      </div>

      {/* FOOTER */}
      <div className="flex items-center justify-between gap-2 border-t border-border/70 pt-3 text-[11.5px]">
        <span className="flex min-w-0 items-center gap-1 text-muted-foreground">
          <User className="h-3 w-3 shrink-0 text-muted-foreground/70" aria-hidden />
          <span className="truncate">{item.owner?.name ?? "Unassigned"}</span>
        </span>

        <div
          className={`flex shrink-0 items-center gap-1 ${
            isOverdue ? "font-semibold text-red-700" : "text-muted-foreground"
          }`}
        >
          <Clock
            className={`h-3 w-3 ${isOverdue ? "text-red-700" : "text-muted-foreground/70"}`}
            aria-hidden
          />
          <span>
            {isOverdue ? "Overdue · " : ""}
            {item.next_review_date ? new Date(item.next_review_date).toLocaleDateString() : "—"}
          </span>
        </div>
      </div>
    </Link>
  );
}
