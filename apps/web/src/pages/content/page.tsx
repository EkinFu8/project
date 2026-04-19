import { Loader2, Lock, Plus, Search } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import { trpc } from "@/lib/trpc.ts";

const ROLE_TABS = [
  { key: "all", label: "All Users" },
  { key: "underwriter", label: "Underwriter" },
  { key: "business-analyst", label: "Business Analyst" },
];

function getStatusBadge(status: string | null) {
  switch (status) {
    case "Finalized":
      return "bg-hanover-green text-white";
    case "Created":
      return "bg-[#C9A84C] text-white";
    case "in-progress":
      return "bg-blue-500 text-white whitespace-nowrap";
    case "Archived":
      return "bg-gray-400 text-white";
    default:
      return "bg-muted text-muted-foreground";
  }
}

function matchesOwnerRole(owner: { role: string } | null | undefined, role: string) {
  if (role === "all") return true;
  const r = owner?.role ?? "";
  if (role === "underwriter") return r === "underwriter";
  if (role === "business-analyst") return r === "business-analyst";
  return false;
}

export default function ContentPage() {
  const { data: access } = trpc.user.myAccess.useQuery();
  const isAdmin = access?.role === "admin";

  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const [openRole, setOpenRole] = useState(true);
  const [openStatus, setOpenStatus] = useState(true);
  const [openType, setOpenType] = useState(true);

  const utils = trpc.useUtils();

  const toggleFavorite = trpc.content.update.useMutation({
    onSuccess: () => utils.content.list.invalidate(),
  });

  const contents = trpc.content.list.useQuery({
    search,
    document_status: statusFilter || undefined,
    content_type: (typeFilter as "Reference" | "Workflow") || undefined,
  });

  const allItems = contents.data ?? [];

  const filtered = allItems.filter((item) =>
      matchesOwnerRole(item.owner, roleFilter)
  );

  return (
      <div className="border-t border-border/60 py-6 sm:py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">


          <div className="mb-6 flex justify-end">
            <div className="flex w-full max-w-4xl items-center gap-3">


              <div className="relative flex-[2]">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by filename or URL..."
                    className="w-full rounded border border-border bg-background py-2 pl-10 pr-4 text-sm"
                />
              </div>

              <button
                  type="button"
                  onClick={() => setViewMode((v) => (v === "grid" ? "list" : "grid"))}
                  className="rounded border border-border bg-background px-3 py-2 text-sm font-medium hover:bg-muted"
              >
                {viewMode === "grid" ? "List View" : "Card View"}
              </button>

              {/* NEW CONTENT */}
              <Link
                  to="/hero/content/new"
                  className="flex shrink-0 items-center gap-2 rounded bg-hanover-green px-4 py-2 text-sm font-semibold text-white"
              >
                <Plus className="h-4 w-4" />
                New Content
              </Link>

            </div>
          </div>

          <div className="flex gap-6">

            {/* SIDEBAR */}
            <aside className="w-64 shrink-0 rounded border border-border bg-card p-4 h-fit sticky top-4">

              {/* ROLE */}
              {(
                  <div className="mb-4">
                    <button
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
                              const active = roleFilter === tab.key;

                              return (
                                  <button
                                      key={tab.key}
                                      onClick={() => setRoleFilter(tab.key)}
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
              )}

              {/* STATUS */}
              <div className="mb-4">
                <button
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
                          const active = statusFilter === s;

                          const label =
                              s === ""
                                  ? "All"
                                  : s === "in-progress"
                                      ? "In-Progress"
                                      : s;

                          return (
                              <button
                                  key={s || "all"}
                                  onClick={() => setStatusFilter(s)}
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

              {/* TYPE */}
              <div>
                <button
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
                          const active = typeFilter === t;

                          return (
                              <button
                                  key={t || "all"}
                                  onClick={() => setTypeFilter(t)}
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

            {/* Card view */}
            <main className="flex-1">

              {contents.isLoading ? (
                  <div className="flex items-center justify-center py-16">
                    <Loader2 className="h-6 w-6 animate-spin text-hanover-green" />
                  </div>
              ) : (
                  <div
                      className={
                        viewMode === "grid"
                            ? "grid gap-4 md:grid-cols-2 lg:grid-cols-3"
                            : "flex flex-col gap-3"
                      }
                  >

                    {filtered.map((item) => (
                        <Link
                            key={item.fileID}
                            to={`/hero/content/${item.fileID}/edit`}
                            className={`group rounded border border-border bg-card shadow-sm transition-all hover:border-hanover-green hover:shadow-md ${
                                viewMode === "list" ? "p-3 flex items-center gap-4" : "p-5"
                            }`}
                        >
                          <div className="mb-3 flex items-start justify-between gap-2">
                            <h3 className="text-base font-semibold leading-snug text-foreground group-hover:text-hanover-green line-clamp-2 break-words">
                              {item.filename ?? "Untitled"}
                            </h3>

                            <div className="flex shrink-0 items-center gap-1">
                        <span className={`rounded px-2 py-0.5 text-xs font-semibold ${getStatusBadge(item.document_status)}`}>
                          {item.document_status ?? "—"}
                        </span>

                              <button
                                  onClick={(e) => {
                                    e.preventDefault();
                                    toggleFavorite.mutate({
                                      fileID: item.fileID,
                                      is_favorited: !item.is_favorited,
                                    });
                                  }}
                                  className="text-yellow-400"
                              >
                                {item.is_favorited ? "★" : "☆"}
                              </button>
                            </div>
                          </div>

                          <p className="mb-1 text-xs text-muted-foreground">
                            {item.content_type ?? "—"} · {item.job_position ?? "—"}
                          </p>

                          {item.content_tags?.length > 0 && (
                              <div className="mb-2 flex flex-wrap gap-1 max-w-full overflow-hidden">
                                {item.content_tags.map((ct) => (
                                    <span
                                        key={ct.tag.id}
                                        className="inline-flex items-center rounded-full bg-hanover-green/10 px-2 py-0.5 text-xs font-medium text-hanover-green"
                                    >
                            {ct.tag.name}
                          </span>
                                ))}
                              </div>
                          )}

                          {item.is_checked_out && (
                              <div className="mb-2 flex items-center gap-1.5 rounded bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-700">
                                <Lock className="h-3 w-3" />
                                Checked out
                              </div>
                          )}

                          <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                            <span className="truncate max-w-[60%]">
                              {item.owner?.name ?? "Unassigned"}
                            </span>

                            <span className="shrink-0">
                        {item.last_modified
                            ? new Date(item.last_modified).toLocaleDateString()
                            : "—"}
                            </span>
                          </div>

                        </Link>
                    ))}

                  </div>
              )}

            </main>

          </div>
        </div>
      </div>
  );
}