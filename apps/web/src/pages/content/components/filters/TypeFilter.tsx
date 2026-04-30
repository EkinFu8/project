import { AnimatePresence, motion } from "framer-motion";
import type { ContentFilters as ContentFiltersState } from "@/store/content-filters";
import { FilterSectionHeader } from "./FilterSectionHeader";
import { SECTION_MOTION } from "./shared";

const TYPE_OPTIONS = ["", "Reference", "Workflow"] as const;

type Props = {
  filters: ContentFiltersState;
};

export function TypeFilter({ filters }: Props) {
  return (
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
            {TYPE_OPTIONS.map((t) => {
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
  );
}
