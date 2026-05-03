import { cn } from "@myapp/ui/lib/utils";
import type { FilterKey } from "../types";

interface FilterTabsProps {
  activeFilter: FilterKey;
  onFilter: (key: FilterKey) => void;
  counts: Record<FilterKey, number>;
}

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "unread", label: "Unread" },
  { key: "pinned", label: "Pinned" },
  { key: "ownership", label: "Ownership" },
];

export function FilterTabs({ activeFilter, onFilter, counts }: FilterTabsProps) {
  return (
    <div
      role="tablist"
      aria-label="Notification filters"
      className="flex shrink-0 items-stretch border-b border-border bg-card"
    >
      {FILTERS.map((f) => {
        const count = counts[f.key];
        const isActive = activeFilter === f.key;
        return (
          <button
            key={f.key}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onFilter(f.key)}
            className={cn(
              "group relative flex flex-1 items-baseline justify-center gap-1.5 px-3 py-3 text-sm transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-hanover-green/40",
              isActive
                ? "bg-hanover-green/[0.06] font-semibold text-hanover-green"
                : "font-medium text-muted-foreground hover:bg-muted/50 hover:text-foreground",
            )}
          >
            <span>{f.label}</span>
            {count > 0 && (
              <span
                className={cn(
                  "text-xs tabular-nums",
                  isActive ? "text-hanover-green/80" : "text-muted-foreground/70",
                )}
              >
                {count}
              </span>
            )}
            <span
              aria-hidden="true"
              className={cn(
                "absolute inset-x-4 -bottom-px h-[2.5px] rounded-t-full transition-colors",
                isActive ? "bg-hanover-green" : "bg-transparent group-hover:bg-border",
              )}
            />
          </button>
        );
      })}
    </div>
  );
}
