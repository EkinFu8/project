import { motion, AnimatePresence } from "framer-motion";

type RoleTab = {
  key: string;
  label: string;
};

type Filters = {
  role: string;
  status: string;
  type: string;
  setRole: (v: string) => void;
  setStatus: (v: string) => void;
  setType: (v: string) => void;
};

type Props = {
  filters: Filters;
  openRole: boolean;
  setOpenRole: (v: boolean) => void;
  openStatus: boolean;
  setOpenStatus: (v: boolean) => void;
  openType: boolean;
  setOpenType: (v: boolean) => void;
  ROLE_TABS: RoleTab[];
};

export function ContentFilters({
  filters,
  openRole,
  setOpenRole,
  openStatus,
  setOpenStatus,
  openType,
  setOpenType,
  ROLE_TABS,
}: Props) {
  return (
    <aside className="w-64 shrink-0 rounded border border-border bg-card p-4 h-fit sticky top-4">
      Filters
      <hr />
      {/* ROLE */}
      <div className="mb-4">
        <button
          type="button"
          onClick={() => setOpenRole(!openRole)}
          className="mb-2 flex w-full justify-between text-sm font-semibold"
        >
          Role
          <span className="text-muted-foreground">{openRole ? "−" : "+"}</span>
        </button>

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
                    className="relative flex items-center rounded px-2 py-1 text-sm hover:bg-muted"
                  >
                    {active && (
                      <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded bg-hanover-green" />
                    )}
                    <span className={`ml-2 ${active ? "font-semibold" : "text-muted-foreground"}`}>
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
      <div className="mb-4">
        <button
          type="button"
          onClick={() => setOpenStatus(!openStatus)}
          className="mb-2 flex w-full justify-between text-sm font-semibold"
        >
          Status
          <span className="text-muted-foreground">{openStatus ? "−" : "+"}</span>
        </button>

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
                    className="relative flex items-center rounded px-2 py-1 text-sm hover:bg-muted"
                  >
                    {active && (
                      <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded bg-hanover-green" />
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
      <div>
        <button
          type="button"
          onClick={() => setOpenType(!openType)}
          className="mb-2 flex w-full justify-between text-sm font-semibold"
        >
          Type
          <span className="text-muted-foreground">{openType ? "−" : "+"}</span>
        </button>

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
                    className="relative flex items-center rounded px-2 py-1 text-sm hover:bg-muted"
                  >
                    {active && (
                      <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded bg-hanover-green" />
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
    </aside>
  );
}
