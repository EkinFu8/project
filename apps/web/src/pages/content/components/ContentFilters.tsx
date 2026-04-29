import { HelpPopover } from "@myapp/ui/components/help-popover";
import { AnimatePresence, motion } from "framer-motion";
import { type ReactNode, useState } from "react";
import { trpc } from "@/lib/trpc.ts";
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

type Filters = {
  role: string;
  status: string;
  type: string;
  format: string;
  tagIds: number[];
  tagMode: "any" | "all";
  pinnedTagId: number | null;
  setRole: (v: string) => void;
  setStatus: (v: string) => void;
  setType: (v: string) => void;
  setFormat: (v: string) => void;
  setTagIds: (ids: number[]) => void;
  setTagMode: (mode: "any" | "all") => void;
  setPinnedTagId: (id: number | null) => void;
};

type Props = {
  filters: Filters;
  openRole: boolean;
  setOpenRole: (v: boolean) => void;
  openStatus: boolean;
  setOpenStatus: (v: boolean) => void;
  openType: boolean;
  setOpenType: (v: boolean) => void;
  openFormat: boolean;
  setOpenFormat: (v: boolean) => void;
  openTags: boolean;
  setOpenTags: (v: boolean) => void;
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
    <div className="mb-2 flex items-center gap-2">
      <button
        type="button"
        onClick={onToggle}
        className="flex min-w-0 flex-1 items-center justify-between text-left text-sm font-semibold"
      >
        <span className="min-w-0">{label}</span>
        <span className="ml-2 text-muted-foreground">{open ? "−" : "+"}</span>
      </button>
      <HelpPopover title={helpTitle} side="right" align="start" contentClassName="w-64">
        {children}
      </HelpPopover>
    </div>
  );
}

export function ContentFilters({
  filters,
  openRole,
  setOpenRole,
  openStatus,
  setOpenStatus,
  openType,
  setOpenType,
  openFormat,
  setOpenFormat,
  openTags,
  setOpenTags,
  ROLE_TABS,
}: Props) {
  const tagsQuery = trpc.tag.list.useQuery();
  const tags = tagsQuery.data ?? [];

  const [formatSearch, setFormatSearch] = useState("");
  const [formatOpen, setFormatOpen] = useState(false);
  const [tagSearch, setTagSearch] = useState("");
  const [tagDropdownOpen, setTagDropdownOpen] = useState(false);

  const visibleFormats = ALL_FORMATS.filter(({ label }) =>
    label.toLowerCase().includes(formatSearch.toLowerCase()),
  );

  const visibleTags = tags.filter((tag) =>
    tag.name.toLowerCase().includes(tagSearch.toLowerCase()),
  );

  function toggleTag(id: number) {
    if (filters.tagIds.includes(id)) {
      filters.setTagIds(filters.tagIds.filter((t) => t !== id));
    } else {
      filters.setTagIds([...filters.tagIds, id]);
    }
  }

  const selectedFormatLabel = ALL_FORMATS.find((f) => f.key === filters.format)?.label;

  return (
    <aside className="sticky top-4 h-fit w-64 shrink-0 rounded border border-border bg-card p-4">
      <p className="mb-2 text-sm font-semibold">Filters</p>
      <hr className="mb-3" />

      {/* ROLE */}
      <div className="mb-4">
        <FilterSectionHeader
          label="Role"
          open={openRole}
          onToggle={() => setOpenRole(!openRole)}
          helpTitle="Role filter"
        >
          Limits results to content intended for a selected audience. All Users shows content across
          every role.
        </FilterSectionHeader>
        <AnimatePresence initial={false}>
          {openRole && (
            <motion.div
              layout
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="flex flex-col overflow-hidden"
            >
              {ROLE_TABS.map((tab) => {
                const active = filters.role === tab.key;
                return (
                  <button
                    type="button"
                    key={tab.key}
                    onClick={() => filters.setRole(tab.key)}
                    className="relative flex items-start rounded px-2 py-1 text-left text-sm hover:bg-muted"
                  >
                    {active && (
                      <span className="absolute left-0 top-1.5 h-5 w-1 rounded bg-hanover-green" />
                    )}
                    <span
                      className={`ml-2 block ${active ? "font-semibold" : "text-muted-foreground"}`}
                      style={{ paddingLeft: "8px", textIndent: "-8px" }}
                    >
                      {tab.label}
                    </span>
                  </button>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <hr />

      {/* STATUS */}
      <div className="mb-4 mt-4">
        <FilterSectionHeader
          label="Status"
          open={openStatus}
          onToggle={() => setOpenStatus(!openStatus)}
          helpTitle="Status filter"
        >
          Narrows content by workflow state, from newly created drafts through finalized or archived
          material.
        </FilterSectionHeader>
        <AnimatePresence initial={false}>
          {openStatus && (
            <motion.div
              layout
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="flex flex-col overflow-hidden"
            >
              {["", "Created", "in-progress", "Finalized", "Archived"].map((s) => {
                const active = filters.status === s;
                const label = s === "" ? "All" : s === "in-progress" ? "In-Progress" : s;
                return (
                  <button
                    type="button"
                    key={s || "all"}
                    onClick={() => filters.setStatus(s)}
                    className="relative flex items-start rounded px-2 py-1 text-left text-sm hover:bg-muted"
                  >
                    {active && (
                      <span className="absolute left-0 top-1.5 h-5 w-1 rounded bg-hanover-green" />
                    )}
                    <span className={`ml-2 ${active ? "font-semibold" : "text-muted-foreground"}`}>
                      {label}
                    </span>
                  </button>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <hr />

      {/* TYPE */}
      <div className="mb-4 mt-4">
        <FilterSectionHeader
          label="Type"
          open={openType}
          onToggle={() => setOpenType(!openType)}
          helpTitle="Content type filter"
        >
          Reference content is informational. Workflow content is tied to a process or task.
        </FilterSectionHeader>
        <AnimatePresence initial={false}>
          {openType && (
            <motion.div
              layout
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="flex flex-col overflow-hidden"
            >
              {["", "Reference", "Workflow"].map((t) => {
                const active = filters.type === t;
                return (
                  <button
                    type="button"
                    key={t || "all"}
                    onClick={() => filters.setType(t)}
                    className="relative flex items-start rounded px-2 py-1 text-left text-sm hover:bg-muted"
                  >
                    {active && (
                      <span className="absolute left-0 top-1.5 h-5 w-1 rounded bg-hanover-green" />
                    )}
                    <span className={`ml-2 ${active ? "font-semibold" : "text-muted-foreground"}`}>
                      {t === "" ? "All" : t}
                    </span>
                  </button>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <hr />

      {/* FORMAT */}
      <div className="mb-4 mt-4">
        <FilterSectionHeader
          label={
            <>
              Format
              {selectedFormatLabel && (
                <span className="ml-1.5 text-xs font-normal text-hanover-green">
                  {selectedFormatLabel}
                </span>
              )}
            </>
          }
          open={openFormat}
          onToggle={() => setOpenFormat(!openFormat)}
          helpTitle="Format filter"
        >
          Filters by the uploaded file's detected format, such as PDF, Word, Excel, or image.
        </FilterSectionHeader>
        <AnimatePresence initial={false}>
          {openFormat && (
            <motion.div
              layout
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
            >
              <div className="relative">
                <input
                  type="text"
                  value={formatSearch}
                  onChange={(e) => setFormatSearch(e.target.value)}
                  onFocus={() => setFormatOpen(true)}
                  onBlur={() => setFormatOpen(false)}
                  placeholder={selectedFormatLabel ?? "Search formats…"}
                  className="w-full rounded border border-border bg-background px-2 py-1 text-xs"
                />
                {formatOpen && (
                  <div className="absolute left-0 right-0 top-full z-20 mt-1 max-h-44 overflow-y-auto rounded border border-border bg-card shadow-md">
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
                              setFormatSearch("");
                              setFormatOpen(false);
                            }}
                            className={`flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm hover:bg-muted ${
                              active ? "font-semibold text-hanover-green" : "text-foreground"
                            }`}
                          >
                            {active && (
                              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-hanover-green" />
                            )}
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
      <hr />

      {/* TAGS */}
      <div className="mt-4">
        <FilterSectionHeader
          label={
            <>
              Tags
              {filters.tagIds.length > 0 && (
                <span className="ml-1.5 text-xs font-normal text-hanover-green">
                  {filters.tagIds.length} selected
                </span>
              )}
            </>
          }
          open={openTags}
          onToggle={() => setOpenTags(!openTags)}
          helpTitle="Tag filters"
        >
          Match any returns content with at least one selected tag. Match all requires every
          selected tag. Pin tag to top prioritizes one tag in the results.
        </FilterSectionHeader>
        <AnimatePresence initial={false}>
          {openTags && (
            <motion.div
              layout
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="flex flex-col gap-2"
            >
              {/* ANY / ALL toggle */}
              <div className="flex items-center gap-1 rounded border border-border p-0.5 text-xs">
                <button
                  type="button"
                  onClick={() => filters.setTagMode("any")}
                  className={`flex-1 rounded px-2 py-1 ${
                    filters.tagMode === "any"
                      ? "bg-hanover-green text-white font-semibold"
                      : "text-muted-foreground hover:bg-muted"
                  }`}
                >
                  Match any
                </button>
                <button
                  type="button"
                  onClick={() => filters.setTagMode("all")}
                  className={`flex-1 rounded px-2 py-1 ${
                    filters.tagMode === "all"
                      ? "bg-hanover-green text-white font-semibold"
                      : "text-muted-foreground hover:bg-muted"
                  }`}
                >
                  Match all
                </button>
              </div>

              {/* Tag search with dropdown */}
              <div className="relative">
                <input
                  type="text"
                  value={tagSearch}
                  onChange={(e) => setTagSearch(e.target.value)}
                  onFocus={() => setTagDropdownOpen(true)}
                  onBlur={() => setTagDropdownOpen(false)}
                  placeholder="Search tags…"
                  className="w-full rounded border border-border bg-background px-2 py-1 text-xs"
                />
                {tagDropdownOpen && (
                  <div className="absolute left-0 right-0 top-full z-20 mt-1 rounded border border-border bg-card shadow-md">
                    <div className="flex max-h-44 flex-wrap gap-1.5 overflow-y-auto p-2">
                      {tagsQuery.isLoading && (
                        <span className="text-xs text-muted-foreground">Loading…</span>
                      )}
                      {!tagsQuery.isLoading && visibleTags.length === 0 && (
                        <span className="text-xs text-muted-foreground">
                          {tagSearch ? "No match" : "No tags yet"}
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
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-all hover:opacity-80 ${
                              checked ? "ring-2 ring-offset-1 ring-hanover-green" : ""
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

              {/* Selected tags shown below input at all times */}
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
                          className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ring-2 ring-offset-1 ring-hanover-green"
                        >
                          {cleanTag.name}
                          <span className="opacity-70">×</span>
                        </button>
                      );
                    })}
                  </div>
                  <button
                    type="button"
                    onClick={() => filters.setTagIds([])}
                    className="self-start text-xs text-muted-foreground hover:underline"
                  >
                    Clear all
                  </button>
                </div>
              )}

              {/* Pin-to-top dropdown */}
              <div className="flex flex-col gap-1 border-t border-border pt-2">
                <label className="flex flex-col gap-1 text-xs font-semibold">
                  Pin tag to top
                  <select
                    value={filters.pinnedTagId ?? ""}
                    onChange={(e) =>
                      filters.setPinnedTagId(e.target.value === "" ? null : Number(e.target.value))
                    }
                    className="rounded border border-border bg-background px-2 py-1 text-xs font-normal"
                  >
                    <option value="">None</option>
                    {tags.map((tag) => (
                      <option key={tag.id} value={tag.id}>
                        {tag.name}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </aside>
  );
}
