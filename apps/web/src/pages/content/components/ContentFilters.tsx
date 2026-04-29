import { HelpPopover } from "@myapp/ui/components/help-popover";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Filter, Search, SlidersHorizontal, X } from "lucide-react";
import { type ReactNode, useState } from "react";
import { trpc } from "@/lib/trpc.ts";
import type { ContentFilters as ContentFiltersState } from "@/store/content-filters";
import { normalizeTag, renderTag } from "@/utils/tag";

type RoleTab = {
  key: string;
  label: string;
};

const FORMAT_OPTIONS = [
  { key: "pdf", label: "PDF" },
  { key: "word", label: "Word" },
  { key: "excel", label: "Excel" },
  { key: "powerpoint", label: "PowerPoint" },
  { key: "text", label: "Text" },
  { key: "csv", label: "CSV" },
  { key: "png", label: "PNG" },
  { key: "jpeg", label: "JPEG" },
  { key: "gif", label: "GIF" },
  { key: "svg", label: "SVG" },
  { key: "other", label: "Other" },
] as const;

const ALL_FORMATS = [{ key: "", label: "All" }, ...FORMAT_OPTIONS];

type Props = {
  filters: ContentFiltersState;
  ROLE_TABS: RoleTab[];
};

function FilterSectionHeader({
  label,
  open,
  onToggle,
  helpTitle,
  children,
}: {
  label: ReactNode;
  open: boolean;
  onToggle: () => void;
  helpTitle: string;
  children: ReactNode;
}) {
  return (
    <div className="mb-2 flex items-center gap-1">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="group flex min-w-0 flex-1 items-center justify-between rounded-md px-1.5 py-1 text-left text-[13px] font-semibold text-foreground transition-colors hover:bg-muted/60"
      >
        <span className="min-w-0 tracking-tight">{label}</span>
        <ChevronDown
          className={`ml-2 h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform duration-200 ${open ? "rotate-0" : "-rotate-90"}`}
          aria-hidden
        />
      </button>
      <HelpPopover title={helpTitle} side="right" align="start" contentClassName="w-64">
        {children}
      </HelpPopover>
    </div>
  );
}

const SECTION_MOTION = {
  initial: { opacity: 0, height: 0 },
  animate: { opacity: 1, height: "auto" as const },
  exit: { opacity: 0, height: 0 },
  transition: { duration: 0.2, ease: "easeInOut" as const },
};

export function ContentFilters({ filters, ROLE_TABS }: Props) {
  const tagsQuery = trpc.tag.list.useQuery();
  const tags = tagsQuery.data ?? [];

  const [formatOpen, setFormatOpen] = useState(false);
  const [tagDropdownOpen, setTagDropdownOpen] = useState(false);

  const visibleFormats = ALL_FORMATS.filter(({ label }) =>
    label.toLowerCase().includes(filters.formatSearch.toLowerCase()),
  );

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

  const selectedFormatLabel = ALL_FORMATS.find((f) => f.key === filters.format)?.label;
  const activeFilterCount =
    (filters.role !== "all" ? 1 : 0) +
    (filters.status ? 1 : 0) +
    (filters.type ? 1 : 0) +
    (filters.format ? 1 : 0) +
    filters.tagIds.length +
    (filters.pinnedTagId ? 1 : 0);

  function clearAllFilters() {
    filters.setRole("all");
    filters.setStatus("");
    filters.setType("");
    filters.setFormat("");
    filters.setFormatSearch("");
    filters.setTagIds([]);
    filters.setTagSearch("");
    filters.setPinnedTagId(null);
  }

  return (
    <aside className="sticky top-4 h-fit w-64 shrink-0 overflow-hidden rounded-xl border border-border bg-card shadow-sm shadow-black/[0.02]">
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
            onClick={clearAllFilters}
            className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            title="Clear all filters"
          >
            <X className="h-3 w-3" aria-hidden />
            Clear
          </button>
        )}
      </div>

      <div className="px-4 py-4">
        <div className="mb-3.5">
          <FilterSectionHeader
            label="Role"
            open={filters.sections.role}
            onToggle={() => filters.setSectionOpen("role", !filters.sections.role)}
            helpTitle="Role filter"
          >
            Limits results to content intended for a selected audience. All Users shows content
            across every role.
          </FilterSectionHeader>
          <AnimatePresence initial={false}>
            {filters.sections.role && (
              <motion.div layout {...SECTION_MOTION} className="flex flex-col overflow-hidden">
                {ROLE_TABS.map((tab) => {
                  const active = filters.role === tab.key;
                  return (
                    <button
                      type="button"
                      key={tab.key}
                      onClick={() => filters.setRole(tab.key)}
                      className={`group/row relative flex items-center rounded-md py-1 pl-3 pr-2 text-left text-sm transition-colors ${
                        active
                          ? "bg-hanover-green/[0.06] font-semibold text-foreground"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      }`}
                    >
                      <span
                        aria-hidden
                        className={`absolute left-0 h-5 w-[3px] rounded-r transition-colors ${
                          active ? "bg-hanover-green" : "bg-transparent"
                        }`}
                      />
                      <span className="block truncate">{tab.label}</span>
                    </button>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <div className="my-3.5 h-px bg-border/70" />

        <div className="mb-3.5">
          <FilterSectionHeader
            label="Status"
            open={filters.sections.status}
            onToggle={() => filters.setSectionOpen("status", !filters.sections.status)}
            helpTitle="Status filter"
          >
            Narrows content by workflow state, from newly created drafts through finalized or
            archived material.
          </FilterSectionHeader>
          <AnimatePresence initial={false}>
            {filters.sections.status && (
              <motion.div layout {...SECTION_MOTION} className="flex flex-col overflow-hidden">
                {["", "Created", "in-progress", "Finalized", "Archived"].map((s) => {
                  const active = filters.status === s;
                  const label = s === "" ? "All" : s === "in-progress" ? "In-Progress" : s;
                  return (
                    <button
                      type="button"
                      key={s || "all"}
                      onClick={() => filters.setStatus(s)}
                      className={`group/row relative flex items-center rounded-md py-1 pl-3 pr-2 text-left text-sm transition-colors ${
                        active
                          ? "bg-hanover-green/[0.06] font-semibold text-foreground"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      }`}
                    >
                      <span
                        aria-hidden
                        className={`absolute left-0 h-5 w-[3px] rounded-r transition-colors ${
                          active ? "bg-hanover-green" : "bg-transparent"
                        }`}
                      />
                      <span>{label}</span>
                    </button>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <div className="my-3.5 h-px bg-border/70" />

        <div className="mb-3.5">
          <FilterSectionHeader
            label="Type"
            open={filters.sections.type}
            onToggle={() => filters.setSectionOpen("type", !filters.sections.type)}
            helpTitle="Content type filter"
          >
            Reference content is informational. Workflow content is tied to a process or task.
          </FilterSectionHeader>
          <AnimatePresence initial={false}>
            {filters.sections.type && (
              <motion.div layout {...SECTION_MOTION} className="flex flex-col overflow-hidden">
                {["", "Reference", "Workflow"].map((t) => {
                  const active = filters.type === t;
                  return (
                    <button
                      type="button"
                      key={t || "all"}
                      onClick={() => filters.setType(t)}
                      className={`group/row relative flex items-center rounded-md py-1 pl-3 pr-2 text-left text-sm transition-colors ${
                        active
                          ? "bg-hanover-green/[0.06] font-semibold text-foreground"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      }`}
                    >
                      <span
                        aria-hidden
                        className={`absolute left-0 h-5 w-[3px] rounded-r transition-colors ${
                          active ? "bg-hanover-green" : "bg-transparent"
                        }`}
                      />
                      <span>{t === "" ? "All" : t}</span>
                    </button>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <div className="my-3.5 h-px bg-border/70" />

        <div className="mb-3.5">
          <FilterSectionHeader
            label={
              <span className="inline-flex items-center gap-1.5">
                Format
                {selectedFormatLabel && (
                  <span className="rounded-full bg-hanover-green/10 px-1.5 py-px text-[10.5px] font-semibold text-hanover-green">
                    {selectedFormatLabel}
                  </span>
                )}
              </span>
            }
            open={filters.sections.format}
            onToggle={() => filters.setSectionOpen("format", !filters.sections.format)}
            helpTitle="Format filter"
          >
            Filters by the uploaded file's detected format, such as PDF, Word, Excel, or image.
          </FilterSectionHeader>
          <AnimatePresence initial={false}>
            {filters.sections.format && (
              <motion.div layout {...SECTION_MOTION} className="overflow-hidden">
                <div className="relative">
                  <Search
                    className="pointer-events-none absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground/70"
                    aria-hidden
                  />
                  <input
                    type="text"
                    value={filters.formatSearch}
                    onChange={(e) => filters.setFormatSearch(e.target.value)}
                    onFocus={() => setFormatOpen(true)}
                    onBlur={() => setFormatOpen(false)}
                    placeholder={selectedFormatLabel ?? "Search formats..."}
                    className="w-full rounded-md border border-border bg-background py-1.5 pl-7 pr-2 text-xs transition-colors placeholder:text-muted-foreground/70 hover:border-foreground/25 focus:border-hanover-green focus:outline-none focus:ring-2 focus:ring-hanover-green/20"
                  />
                  {formatOpen && (
                    <div className="absolute left-0 right-0 top-full z-20 mt-1.5 max-h-44 origin-top animate-pop overflow-y-auto rounded-lg border border-border bg-popover p-1 shadow-lg shadow-black/10 ring-1 ring-black/[0.02]">
                      {visibleFormats.length === 0 ? (
                        <span className="block px-3 py-2 text-xs text-muted-foreground">
                          No match
                        </span>
                      ) : (
                        visibleFormats.map(({ key, label }) => {
                          const active = filters.format === key;
                          return (
                            <button
                              type="button"
                              key={key || "all"}
                              onMouseDown={(e) => e.preventDefault()}
                              onClick={() => {
                                filters.setFormat(key);
                                filters.setFormatSearch("");
                                setFormatOpen(false);
                              }}
                              className={`flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-left text-xs transition-colors hover:bg-muted ${
                                active
                                  ? "bg-hanover-green/[0.06] font-semibold text-hanover-green"
                                  : "text-foreground"
                              }`}
                            >
                              <span
                                className={`h-1.5 w-1.5 shrink-0 rounded-full transition-colors ${
                                  active ? "bg-hanover-green" : "bg-transparent"
                                }`}
                              />
                              {label}
                            </button>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <div className="my-3.5 h-px bg-border/70" />

        <div>
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
            Match any returns content with at least one selected tag. Match all requires every
            selected tag. Pin tag to top prioritizes one tag in the results.
          </FilterSectionHeader>
          <AnimatePresence initial={false}>
            {filters.sections.tags && (
              <motion.div
                layout
                {...SECTION_MOTION}
                className="flex flex-col gap-2.5 overflow-hidden"
              >
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

                <div className="relative">
                  <Search
                    className="pointer-events-none absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground/70"
                    aria-hidden
                  />
                  <input
                    type="text"
                    value={filters.tagSearch}
                    onChange={(e) => filters.setTagSearch(e.target.value)}
                    onFocus={() => setTagDropdownOpen(true)}
                    onBlur={() => setTagDropdownOpen(false)}
                    placeholder="Search tags..."
                    className="w-full rounded-md border border-border bg-background py-1.5 pl-7 pr-2 text-xs transition-colors placeholder:text-muted-foreground/70 hover:border-foreground/25 focus:border-hanover-green focus:outline-none focus:ring-2 focus:ring-hanover-green/20"
                  />
                  {tagDropdownOpen && (
                    <div className="absolute left-0 right-0 top-full z-20 mt-1.5 origin-top animate-pop rounded-lg border border-border bg-popover shadow-lg shadow-black/10 ring-1 ring-black/[0.02]">
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
                                checked
                                  ? "ring-2 ring-hanover-green ring-offset-1 ring-offset-popover"
                                  : ""
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
                        filters.setPinnedTagId(
                          e.target.value === "" ? null : Number(e.target.value),
                        )
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
      </div>
    </aside>
  );
}
