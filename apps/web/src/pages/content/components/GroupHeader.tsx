import { ChevronDown } from "lucide-react";

type Props = {
  label: string;
  count: number;
  overdueCount?: number;
  /** Tailwind background class for the left-edge accent stripe. */
  accent: string;
  expanded: boolean;
  onToggle: () => void;
};

/**
 * Collapsible section header used by the grouped content view.
 *
 * Visual language is intentionally close to the filter-sidebar collapsibles:
 * a single neutral row with a colored left stripe, a count pill, and a
 * chevron that rotates on expand. The accent stripe matches the role tint
 * already used on cards, so the header reads as the parent of the items
 * below it without repeating their full background tint.
 */
export function GroupHeader({ label, count, overdueCount = 0, accent, expanded, onToggle }: Props) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={expanded}
      className="group flex w-full items-center gap-3 rounded border border-border bg-card px-4 py-2.5 text-left transition-colors hover:bg-muted/50"
    >
      <span aria-hidden="true" className={`h-5 w-1 shrink-0 rounded-full ${accent}`} />

      <span className="text-sm font-semibold tracking-tight text-foreground">{label}</span>

      <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
        {count} {count === 1 ? "document" : "documents"}
      </span>

      {overdueCount > 0 && (
        <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">
          {overdueCount} overdue
        </span>
      )}

      <ChevronDown
        className={`ml-auto h-4 w-4 text-muted-foreground transition-transform duration-200 ${
          expanded ? "rotate-0" : "-rotate-90"
        }`}
      />
    </button>
  );
}
