import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Filter, Search, X } from "lucide-react";
import { useState } from "react";
import { trpc } from "@/lib/trpc.ts";
import type { ContentFilters as ContentFiltersState } from "@/store/content-filters";
import { normalizeTag, renderTag } from "@/utils/tag";
import { FilterSectionHeader } from "./FilterSectionHeader";
import { SECTION_MOTION } from "./shared";

type Props = {
  filters: ContentFiltersState;
};

export function TagFilter({ filters }: Props) {
  const tagsQuery = trpc.tag.list.useQuery();
  const tags = tagsQuery.data ?? [];
  const [listOpen, setListOpen] = useState(false);

  const visibleTags = tags.filter((tag) =>
    tag.name.toLowerCase().includes(filters.tagSearch.toLowerCase()),
  );

  function toggleTag(id: number) {
    if (filters.tagIds.includes(id)) {
      filters.setTagIds(filters.tagIds.filter((t) => t !== id));
    } else {
      filters.setTagIds([...filters.tagIds, id]);
    }
  }

  return (
    <div className="relative">
      <FilterSectionHeader
        label={
          <span className="inline-flex items-center gap-1.5">
            Tags
            {filters.tagIds.length > 0 && (
              <span className="rounded-full bg-hanover-green/10 px-1.5 py-px text-[10.5px] font-semibold text-hanover-green">
                {filters.tagIds.length}
              </span>
            )}
          </span>
        }
        open={filters.sections.tags}
        onToggle={() => filters.setSectionOpen("tags", !filters.sections.tags)}
        helpTitle="Tag filters"
      >
        Match any returns content with at least one selected tag. Match all requires every selected
        tag. Pin tag to top prioritizes one tag in the results.
      </FilterSectionHeader>
      <AnimatePresence initial={false}>
        {filters.sections.tags && (
          <motion.div layout {...SECTION_MOTION} className="flex flex-col gap-2.5 overflow-hidden">
            <div className="relative flex items-center rounded-md bg-muted/70 p-0.5 text-xs ring-1 ring-inset ring-border/70">
              <button
                type="button"
                onClick={() => filters.setTagMode("any")}
                className={`flex-1 rounded px-2 py-1 transition-all ${
                  filters.tagMode === "any"
                    ? "bg-background text-foreground font-semibold shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Match any
              </button>
              <button
                type="button"
                onClick={() => filters.setTagMode("all")}
                className={`flex-1 rounded px-2 py-1 transition-all ${
                  filters.tagMode === "all"
                    ? "bg-background text-foreground font-semibold shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Match all
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {filters.sections.tags && (
        <div className="relative mt-2.5">
          <Search
            className="pointer-events-none absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground/70"
            aria-hidden
          />
          <input
            type="text"
            value={filters.tagSearch}
            onChange={(e) => {
              filters.setTagSearch(e.target.value);
              setListOpen(true);
            }}
            onFocus={() => setListOpen(true)}
            onBlur={() => setListOpen(false)}
            placeholder="Search tags..."
            className="w-full rounded-md border border-border bg-background py-1.5 pl-7 pr-2 text-xs transition-colors placeholder:text-muted-foreground/70 hover:border-foreground/25 focus:border-hanover-green focus:outline-none focus:ring-2 focus:ring-hanover-green/20"
          />
          {listOpen && (
            <div className="absolute left-0 top-full z-30 mt-1 w-full rounded-lg border border-border bg-popover shadow-md">
              <div className="flex max-h-44 flex-wrap gap-1.5 overflow-y-auto p-2">
                {tagsQuery.isLoading && (
                  <span className="text-xs text-muted-foreground">Loading...</span>
                )}
                {!tagsQuery.isLoading && visibleTags.length === 0 && (
                  <span className="text-xs text-muted-foreground">
                    {filters.tagSearch ? "No match" : "No tags yet"}
                  </span>
                )}
                {visibleTags.map((tag) => {
                  const cleanTag = normalizeTag(tag);
                  const checked = filters.tagIds.includes(cleanTag.id);
                  const styles = renderTag(cleanTag);
                  return (
                    <button
                      type="button"
                      key={cleanTag.id}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => toggleTag(cleanTag.id)}
                      style={{
                        backgroundColor: styles.bg,
                        color: styles.text,
                        opacity: checked ? 1 : 0.55,
                      }}
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-all hover:opacity-90 ${
                        checked ? "ring-2 ring-hanover-green ring-offset-1 ring-offset-popover" : ""
                      }`}
                    >
                      {cleanTag.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      <AnimatePresence initial={false}>
        {filters.sections.tags && (
          <motion.div layout {...SECTION_MOTION} className="flex flex-col gap-2.5 overflow-hidden">
            {filters.tagIds.length > 0 && (
              <div className="flex flex-col gap-1.5">
                <div className="flex flex-wrap gap-1">
                  {filters.tagIds.map((id) => {
                    const tag = tags.find((t) => t.id === id);
                    if (!tag) return null;
                    const cleanTag = normalizeTag(tag);
                    const styles = renderTag(cleanTag);
                    return (
                      <button
                        type="button"
                        key={id}
                        onClick={() => toggleTag(id)}
                        style={{ backgroundColor: styles.bg, color: styles.text }}
                        className="group/chip inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ring-black/[0.06] transition-all hover:shadow-sm"
                        title={`Remove ${cleanTag.name}`}
                      >
                        {cleanTag.name}
                        <X
                          className="h-3 w-3 opacity-60 transition-opacity group-hover/chip:opacity-100"
                          aria-hidden
                        />
                      </button>
                    );
                  })}
                </div>
                <button
                  type="button"
                  onClick={() => filters.setTagIds([])}
                  className="self-start text-[11px] text-muted-foreground transition-colors hover:text-foreground hover:underline"
                >
                  Clear selected tags
                </button>
              </div>
            )}

            <div className="flex flex-col gap-1.5 border-t border-border/70 pt-2.5">
              <label
                htmlFor="pin-tag-select"
                className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground"
              >
                <Filter className="h-3 w-3" aria-hidden />
                Pin tag to top
              </label>
              <div className="relative">
                <select
                  id="pin-tag-select"
                  value={filters.pinnedTagId ?? ""}
                  onChange={(e) =>
                    filters.setPinnedTagId(e.target.value === "" ? null : Number(e.target.value))
                  }
                  className="w-full appearance-none rounded-md border border-border bg-background py-1.5 pl-2 pr-7 text-xs text-foreground transition-colors hover:border-foreground/25 focus:border-hanover-green focus:outline-none focus:ring-2 focus:ring-hanover-green/20"
                >
                  <option value="">None</option>
                  {tags.map((tag) => (
                    <option key={tag.id} value={tag.id}>
                      {tag.name}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  className="pointer-events-none absolute right-2 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground"
                  aria-hidden
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
