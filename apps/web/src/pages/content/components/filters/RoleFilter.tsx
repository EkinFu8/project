import { AnimatePresence, motion } from "framer-motion";
import type { ContentFilters as ContentFiltersState } from "@/store/content-filters";
import { FilterSectionHeader } from "./FilterSectionHeader";
import { SECTION_MOTION } from "./shared";

export type RoleTab = {
  key: string;
  label: string;
};

type Props = {
  filters: ContentFiltersState;
  ROLE_TABS: RoleTab[];
};

export function RoleFilter({ filters, ROLE_TABS }: Props) {
  return (
    <div className="mb-3.5">
      <FilterSectionHeader
        label="Role"
        open={filters.sections.role}
        onToggle={() => filters.setSectionOpen("role", !filters.sections.role)}
        helpTitle="Role filter"
      >
        Limits results to content intended for a selected audience. All Users shows content across
        every role.
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
  );
}
