import { Plus, Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { useSession } from "@/auth/session-context";
import { trpc } from "@/lib/trpc.ts";
import { useFavorites } from "@/store/favorites";
import { normalizeContent } from "@/utils/normalizeContent.ts";
import { ContentFilters } from "./components/ContentFilters";
import { ContentGrid } from "./components/ContentGrid";
import { useContentFilters } from "./hooks/useContentFilters";
import { useDebouncedValue } from "./hooks/useDebouncedValue";

const ROLE_TABS = [
  { key: "all", label: "All Users" },
  { key: "underwriter", label: "Underwriter" },
  { key: "business-analyst", label: "Business Analyst" },
  { key: "actuarial-analyst", label: "Actuarial Analyst" },
  { key: "exl-operations", label: "EXL Operations" },
];

function getStatusBadge(status?: string | null) {
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
export default function ContentPage() {
  trpc.user.myAccess.useQuery();
  const filters = useContentFilters();
  const debouncedSearch = useDebouncedValue(filters.search, 300);
  const { session } = useSession();
  const currentUserId = session?.user?.id;

  const [openRole, setOpenRole] = useState(true);
  const [openStatus, setOpenStatus] = useState(true);
  const [openType, setOpenType] = useState(true);
  const [openFormat, setOpenFormat] = useState(true);
  const [openTags, setOpenTags] = useState(true);

  const utils = trpc.useUtils();

  const { toggle } = useFavorites();

  const toggleFavorite = trpc.content.toggleFavorite.useMutation({
    onMutate: async ({ fileID }) => {
      toggle(fileID); // instant UI update
    },
    onError: (_err, { fileID }) => {
      toggle(fileID); // rollback
    },
    onSuccess: () => {
      utils.content.list.invalidate();
    },
  });

  const checkin = trpc.content.checkin.useMutation({
    onSuccess: () => utils.content.list.invalidate(),
  });

  const contents = trpc.content.list.useQuery({
    search: debouncedSearch,
    document_status: filters.status || undefined,
    content_type: (filters.type as "Reference" | "Workflow") || undefined,
    format: filters.format || undefined,
    role: filters.role === "all" ? undefined : filters.role,
    tagIds: filters.tagIds.length > 0 ? filters.tagIds : undefined,
    tagMatchMode: filters.tagIds.length > 0 ? filters.tagMode : undefined,
    pinnedTagId: filters.pinnedTagId ?? undefined,
  });

  const { setAll, isFavorited } = useFavorites();

  useEffect(() => {
    if (!contents.data) return;

    const favIds = contents.data.filter((c) => c.is_favorited).map((c) => c.fileID);

    setAll(favIds);
  }, [contents.data, setAll]);

  const allItems = contents.data?.map(normalizeContent) ?? [];

  const SORT_OPTIONS: { key: "due" | "name" | "created"; label: string }[] = [
    { key: "due", label: "Due date" },
    { key: "name", label: "Alphabetical" },
    { key: "created", label: "Created" },
  ];

  const filtered = [...allItems].sort((a, b) => {
    const aFav = isFavorited(a.fileID) ? 1 : 0;
    const bFav = isFavorited(b.fileID) ? 1 : 0;
    if (bFav !== aFav) return bFav - aFav;

    const dir = filters.sortDir === "asc" ? 1 : -1;

    if (filters.sort === "name") {
      return dir * (a.filename ?? "").localeCompare(b.filename ?? "");
    }
    if (filters.sort === "created") {
      return (
        dir * (new Date(a.last_modified ?? 0).getTime() - new Date(b.last_modified ?? 0).getTime())
      );
    }
    const aDate = a.next_review_date ? new Date(a.next_review_date).getTime() : Infinity;
    const bDate = b.next_review_date ? new Date(b.next_review_date).getTime() : Infinity;
    return dir * (aDate - bDate);
  });

  const [sortOpen, setSortOpen] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);
  const [viewOpen, setViewOpen] = useState(false);
  const viewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!viewOpen) return;
    function handleClick(e: MouseEvent) {
      if (viewRef.current && !viewRef.current.contains(e.target as Node)) {
        setViewOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [viewOpen]);

  const currentSortLabel = SORT_OPTIONS.find((o) => o.key === filters.sort)?.label ?? "Due date";

  return (
    <div className="border-t border-border/60 py-6 sm:py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex justify-end">
          <div className="flex w-full max-w-4xl items-center gap-3">
            {/* SEARCH */}
            <div className="relative flex-[2]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={filters.search}
                onChange={(e) => filters.setSearch(e.target.value)}
                placeholder="Search by filename or document content..."
                className="w-full rounded border border-border bg-background py-2 pl-10 pr-4 text-sm"
              />
            </div>

            {/* SORT DROPDOWN + DIRECTION */}
            <div className="relative flex items-center" ref={sortRef}>
              <button
                type="button"
                onClick={() => setSortOpen((o) => !o)}
                className="flex items-center gap-1.5 rounded-l border border-border bg-background px-3 py-2 text-sm font-medium hover:bg-muted"
              >
                <span>{currentSortLabel}</span>
                <svg
                  width="10"
                  height="6"
                  viewBox="0 0 10 6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-muted-foreground"
                >
                  <path d="M1 1l4 4 4-4" />
                </svg>
              </button>

              <button
                type="button"
                onClick={() => filters.setSortDir(filters.sortDir === "asc" ? "desc" : "asc")}
                className="flex h-[37px] w-8 items-center justify-center rounded-r border border-l-0 border-border bg-background text-sm hover:bg-muted"
              >
                {filters.sortDir === "asc" ? "↑" : "↓"}
              </button>

              {sortOpen && (
                <div className="absolute left-0 top-full z-20 mt-1 w-44 rounded border border-border bg-background shadow-md">
                  {SORT_OPTIONS.map((opt) => (
                    <button
                      key={opt.key}
                      type="button"
                      onClick={() => {
                        filters.setSort(opt.key);
                        setSortOpen(false);
                      }}
                      className="flex w-full items-center justify-between px-3 py-2 text-sm hover:bg-muted"
                    >
                      <span>{opt.label}</span>
                      {filters.sort === opt.key && (
                        <span className="font-bold text-hanover-green">✓</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* VIEW TOGGLE DROPDOWN */}
            <div className="relative" ref={viewRef}>
              <button
                type="button"
                onClick={() => setViewOpen((o) => !o)}
                className="flex items-center gap-2 rounded border border-border bg-background px-3 py-2 text-sm font-medium hover:bg-muted"
              >
                {filters.view === "grid" ? (
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 14 14"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1"
                  >
                    <rect x="0.5" y="0.5" width="5" height="5" rx="1" />
                    <rect x="8.5" y="0.5" width="5" height="5" rx="1" />
                    <rect x="0.5" y="8.5" width="5" height="5" rx="1" />
                    <rect x="8.5" y="8.5" width="5" height="5" rx="1" />
                  </svg>
                ) : (
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 14 14"
                    fill="currentColor"
                    className="text-foreground"
                  >
                    <circle cx="1.5" cy="2.5" r="1.5" />
                    <rect x="4" y="1.5" width="10" height="2" rx="1" />
                    <circle cx="1.5" cy="7" r="1.5" />
                    <rect x="4" y="6" width="10" height="2" rx="1" />
                    <circle cx="1.5" cy="11.5" r="1.5" />
                    <rect x="4" y="10.5" width="10" height="2" rx="1" />
                  </svg>
                )}
                <span>{filters.view === "grid" ? "Card view" : "List view"}</span>
                <svg
                  width="10"
                  height="6"
                  viewBox="0 0 10 6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-muted-foreground"
                >
                  <path d="M1 1l4 4 4-4" />
                </svg>
              </button>

              {viewOpen && (
                <div className="absolute right-0 top-full z-20 mt-1 w-36 rounded border border-border bg-background shadow-md">
                  <button
                    type="button"
                    onClick={() => {
                      filters.setView("grid");
                      setViewOpen(false);
                    }}
                    className="flex w-full items-center justify-between px-3 py-2 text-sm hover:bg-muted"
                  >
                    <div className="flex items-center gap-2">
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 14 14"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1"
                      >
                        <rect x="0.5" y="0.5" width="5" height="5" rx="1" />
                        <rect x="8.5" y="0.5" width="5" height="5" rx="1" />
                        <rect x="0.5" y="8.5" width="5" height="5" rx="1" />
                        <rect x="8.5" y="8.5" width="5" height="5" rx="1" />
                      </svg>
                      <span>Card view</span>
                    </div>
                    {filters.view === "grid" && (
                      <span className="font-bold text-hanover-green">✓</span>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      filters.setView("list");
                      setViewOpen(false);
                    }}
                    className="flex w-full items-center justify-between px-3 py-2 text-sm hover:bg-muted"
                  >
                    <div className="flex items-center gap-2">
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
                        <circle cx="1.5" cy="2.5" r="1.5" />
                        <rect x="4" y="1.5" width="10" height="2" rx="1" />
                        <circle cx="1.5" cy="7" r="1.5" />
                        <rect x="4" y="6" width="10" height="2" rx="1" />
                        <circle cx="1.5" cy="11.5" r="1.5" />
                        <rect x="4" y="10.5" width="10" height="2" rx="1" />
                      </svg>
                      <span>List view</span>
                    </div>
                    {filters.view === "list" && (
                      <span className="font-bold text-hanover-green">✓</span>
                    )}
                  </button>
                </div>
              )}
            </div>

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
          <ContentFilters
            filters={filters}
            openRole={openRole}
            setOpenRole={setOpenRole}
            openStatus={openStatus}
            setOpenStatus={setOpenStatus}
            openType={openType}
            setOpenType={setOpenType}
            openFormat={openFormat}
            setOpenFormat={setOpenFormat}
            openTags={openTags}
            setOpenTags={setOpenTags}
            ROLE_TABS={ROLE_TABS}
          />

          {/* Grid view */}
          <ContentGrid
            contents={contents}
            filtered={filtered}
            filters={filters}
            currentUserId={currentUserId}
            searchQuery={debouncedSearch}
            toggleFavorite={toggleFavorite}
            checkin={checkin}
            getStatusBadge={getStatusBadge}
          />
        </div>
      </div>
    </div>
  );
}
