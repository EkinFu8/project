import { SlidersHorizontal, X } from "lucide-react";
import type { ContentFilters as ContentFiltersState } from "@/store/content-filters";
import { FormatFilter } from "./filters/FormatFilter";
import { RoleFilter, type RoleTab } from "./filters/RoleFilter";
import { StatusFilter } from "./filters/StatusFilter";
import { TagFilter } from "./filters/TagFilter";
import { TypeFilter } from "./filters/TypeFilter";

type Props = {
  filters: ContentFiltersState;
  ROLE_TABS: RoleTab[];
};

function getActiveFilterCount(filters: ContentFiltersState) {
  return (
    (filters.role !== "all" ? 1 : 0) +
    (filters.status ? 1 : 0) +
    (filters.type ? 1 : 0) +
    filters.formats.length +
    filters.tagIds.length +
    (filters.pinnedTagId ? 1 : 0)
  );
}

function clearAllFilters(filters: ContentFiltersState) {
  filters.setRole("all");
  filters.setStatus("");
  filters.setType("");
  filters.setFormats([]);
  filters.setFormatSearch("");
  filters.setTagIds([]);
  filters.setTagSearch("");
  filters.setPinnedTagId(null);
}

export function ContentFilters({ filters, ROLE_TABS }: Props) {
  const activeFilterCount = getActiveFilterCount(filters);

  return (
    <aside className="sticky top-4 h-fit w-64 shrink-0 rounded-xl border border-border bg-card shadow-sm shadow-black/[0.02]">
      <div className="flex items-center justify-between border-b border-border/70 bg-muted/30 px-4 py-3">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-3.5 w-3.5 text-muted-foreground" aria-hidden />
          <span className="text-[13px] font-semibold tracking-tight text-foreground">Filters</span>
          {activeFilterCount > 0 && (
            <span className="inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-hanover-green/12 px-1.5 text-[10.5px] font-semibold text-hanover-green">
              {activeFilterCount}
            </span>
          )}
        </div>
        {activeFilterCount > 0 && (
          <button
            type="button"
            onClick={() => clearAllFilters(filters)}
            className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            title="Clear all filters"
          >
            <X className="h-3 w-3" aria-hidden />
            Clear
          </button>
        )}
      </div>

      <div className="px-4 py-4">
        <RoleFilter filters={filters} ROLE_TABS={ROLE_TABS} />
        <div className="my-3.5 h-px bg-border/70" />
        <StatusFilter filters={filters} />
        <div className="my-3.5 h-px bg-border/70" />
        <TypeFilter filters={filters} />
        <div className="my-3.5 h-px bg-border/70" />
        <FormatFilter filters={filters} />
        <div className="my-3.5 h-px bg-border/70" />
        <TagFilter filters={filters} />
      </div>
    </aside>
  );
}
