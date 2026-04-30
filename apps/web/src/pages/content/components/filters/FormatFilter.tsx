import { AnimatePresence, motion } from "framer-motion";
import { Check, Search, X } from "lucide-react";
import { useState } from "react";
import type { ContentFilters as ContentFiltersState } from "@/store/content-filters";
import { FilterSectionHeader } from "./FilterSectionHeader";
import { FORMAT_OPTIONS, SECTION_MOTION } from "./shared";

type Props = {
  filters: ContentFiltersState;
};

export function FormatFilter({ filters }: Props) {
  const [listOpen, setListOpen] = useState(false);

  const visibleFormats = FORMAT_OPTIONS.filter(({ label }) =>
    label.toLowerCase().includes(filters.formatSearch.toLowerCase()),
  );

  function toggleFormat(key: string) {
    if (filters.formats.includes(key)) {
      filters.setFormats(filters.formats.filter((f) => f !== key));
    } else {
      filters.setFormats([...filters.formats, key]);
    }
  }

  return (
    <div className="relative mb-3.5">
      <FilterSectionHeader
        label={
          <span className="inline-flex items-center gap-1.5">
            Format
            {filters.formats.length > 0 && (
              <span className="rounded-full bg-hanover-green/10 px-1.5 py-px text-[10.5px] font-semibold text-hanover-green">
                {filters.formats.length}
              </span>
            )}
          </span>
        }
        open={filters.sections.format}
        onToggle={() => filters.setSectionOpen("format", !filters.sections.format)}
        helpTitle="Format filter"
      >
        Filters by file format. Select multiple to include any of them. Leave empty to show all
        formats.
      </FilterSectionHeader>
      {filters.sections.format && (
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground/70"
            aria-hidden
          />
          <input
            type="text"
            value={filters.formatSearch}
            onChange={(e) => {
              filters.setFormatSearch(e.target.value);
              setListOpen(true);
            }}
            onFocus={() => setListOpen(true)}
            onBlur={() => setListOpen(false)}
            placeholder={filters.formats.length === 0 ? "All formats" : "Search formats..."}
            className="w-full rounded-md border border-border bg-background py-1.5 pl-7 pr-2 text-xs transition-colors placeholder:text-muted-foreground/70 hover:border-foreground/25 focus:border-hanover-green focus:outline-none focus:ring-2 focus:ring-hanover-green/20"
          />
          {listOpen && (
            <div className="absolute left-0 top-full z-30 mt-1 w-full rounded-lg border border-border bg-popover shadow-md">
              <div className="max-h-56 overflow-y-auto p-1">
                {visibleFormats.length === 0 ? (
                  <span className="block px-3 py-2 text-xs text-muted-foreground">No match</span>
                ) : (
                  visibleFormats.map(({ key, label }) => {
                    const checked = filters.formats.includes(key);
                    return (
                      <button
                        type="button"
                        key={key}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => toggleFormat(key)}
                        className={`flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-left text-xs transition-colors hover:bg-muted ${
                          checked
                            ? "bg-hanover-green/[0.06] font-semibold text-hanover-green"
                            : "text-foreground"
                        }`}
                      >
                        <span
                          className={`flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded border transition-colors ${
                            checked
                              ? "border-hanover-green bg-hanover-green text-white"
                              : "border-border bg-background"
                          }`}
                          aria-hidden
                        >
                          {checked && <Check className="h-2.5 w-2.5" strokeWidth={3} />}
                        </span>
                        {label}
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>
      )}

      <AnimatePresence initial={false}>
        {filters.sections.format && filters.formats.length > 0 && (
          <motion.div layout {...SECTION_MOTION} className="flex flex-col gap-1.5 overflow-hidden">
            <div className="flex flex-wrap gap-1">
              {filters.formats.map((key) => {
                const opt = FORMAT_OPTIONS.find((f) => f.key === key);
                if (!opt) return null;
                return (
                  <button
                    type="button"
                    key={key}
                    onClick={() => toggleFormat(key)}
                    className="group/chip inline-flex items-center gap-1 rounded-full bg-hanover-green/10 px-2.5 py-0.5 text-xs font-medium text-hanover-green ring-1 ring-inset ring-hanover-green/20 transition-all hover:bg-hanover-green/15"
                    title={`Remove ${opt.label}`}
                  >
                    {opt.label}
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
              onClick={() => filters.setFormats([])}
              className="self-start text-[11px] text-muted-foreground transition-colors hover:text-foreground hover:underline"
            >
              Clear formats
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
