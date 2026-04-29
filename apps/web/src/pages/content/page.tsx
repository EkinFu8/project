import { HelpPopover } from "@myapp/ui/components/help-popover";
import {
  ArrowDownNarrowWide,
  ArrowUpNarrowWide,
  Check,
  ChevronDown,
  Command,
  LayoutGrid,
  List,
  Loader2,
  Plus,
  Search,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { useSession } from "@/auth/session-context";
import { trpc } from "@/lib/trpc.ts";
import { useFavorites } from "@/store/favorites";
import type { ContentItem } from "@/types/content";
import { normalizeContent } from "@/utils/normalizeContent.ts";
import { ContentFilters } from "./components/ContentFilters";
import { PositionGroup } from "./components/PositionGroup";
import { useContentFilters } from "./hooks/useContentFilters";
import { useDebouncedValue } from "./hooks/useDebouncedValue";

const ROLE_TABS = [
  { key: "all", label: "All Users" },
  { key: "underwriter", label: "Underwriter" },
  { key: "business-analyst", label: "Business Analyst" },
  { key: "actuarial-analyst", label: "Actuarial Analyst" },
  { key: "exl-operations", label: "EXL Operations" },
];

const ROLE_LABEL_BY_KEY = new Map(ROLE_TABS.map((role) => [role.key, role.label]));
const ROLE_ORDER_BY_KEY = new Map(ROLE_TABS.slice(1).map((role, index) => [role.key, index]));
const CONTENT_SEARCH_FOCUS_EVENT = "content-search:focus";

function getPositionKey(position?: string): string {
  const trimmed = position?.trim();

  if (!trimmed) return "unassigned";

  return trimmed.toLowerCase().replace(/[\s_]+/g, "-");
}

function getPositionLabel(position?: string): string {
  const trimmed = position?.trim();

  if (!trimmed) return "Unassigned";

  const key = getPositionKey(trimmed);
  const knownLabel = ROLE_LABEL_BY_KEY.get(key);

  if (knownLabel) return knownLabel;

  return trimmed
    .replace(/[-_]+/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function getPositionRank(key: string): number {
  if (key === "unassigned") return Number.MAX_SAFE_INTEGER;

  return ROLE_ORDER_BY_KEY.get(key) ?? ROLE_ORDER_BY_KEY.size + 1;
}

function groupContentByPosition(items: ContentItem[]) {
  const groups = new Map<
    string,
    { key: string; label: string; rank: number; items: ContentItem[] }
  >();

  for (const item of items) {
    const key = getPositionKey(item.job_position);
    const existing = groups.get(key);

    if (existing) {
      existing.items.push(item);
    } else {
      groups.set(key, {
        key,
        label: getPositionLabel(item.job_position),
        rank: getPositionRank(key),
        items: [item],
      });
    }
  }

  return Array.from(groups.values()).sort(
    (a, b) => a.rank - b.rank || a.label.localeCompare(b.label),
  );
}

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
  const location = useLocation();
  const navigate = useNavigate();
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
  const positionGroups = groupContentByPosition(filtered);

  const [sortOpen, setSortOpen] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);
  const [viewOpen, setViewOpen] = useState(false);
  const viewRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const focusSearchInput = useCallback(() => {
    window.requestAnimationFrame(() => {
      searchInputRef.current?.focus();
      searchInputRef.current?.select();
    });
  }, []);

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

  useEffect(() => {
    function handleSearchFocus() {
      focusSearchInput();
    }

    window.addEventListener(CONTENT_SEARCH_FOCUS_EVENT, handleSearchFocus);
    return () => window.removeEventListener(CONTENT_SEARCH_FOCUS_EVENT, handleSearchFocus);
  }, [focusSearchInput]);

  useEffect(() => {
    const state = location.state as { focusContentSearch?: boolean } | null;
    if (state?.focusContentSearch) {
      focusSearchInput();
      navigate(
        { pathname: location.pathname, search: location.search },
        { replace: true, state: null },
      );
    }
  }, [focusSearchInput, location.pathname, location.search, location.state, navigate]);

  const currentSortLabel = SORT_OPTIONS.find((o) => o.key === filters.sort)?.label ?? "Due date";

  return (
    <div className="animate-fade-in border-t border-border/60 py-6 sm:py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex justify-end">
          <div className="flex w-full max-w-4xl flex-wrap items-center gap-3">
            {/* SEARCH */}
            <div className="group relative min-w-64 flex-[2]">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-colors duration-200 group-focus-within:text-hanover-green" />
              <input
                ref={searchInputRef}
                value={filters.search}
                onChange={(e) => filters.setSearch(e.target.value)}
                placeholder="Search by filename or document content..."
                className="w-full rounded-md border border-border bg-background py-2 pl-10 pr-16 text-sm transition-all duration-200 hover:border-foreground/30 focus:border-hanover-green focus:outline-none focus:ring-2 focus:ring-hanover-green/30"
              />
              <kbd className="pointer-events-none absolute right-2 top-1/2 hidden -translate-y-1/2 items-center gap-0.5 rounded border border-border bg-muted px-1.5 py-0.5 text-[11px] font-medium leading-none text-muted-foreground sm:inline-flex">
                <Command className="size-3" aria-hidden strokeWidth={2} />
                <span>K</span>
              </kbd>
            </div>
            <HelpPopover title="Content search" side="bottom" align="start">
              Search looks across filenames and extracted document text when OCR content is
              available.
            </HelpPopover>

            {/* SORT DROPDOWN + DIRECTION (unified control) */}
            <div className="relative flex items-center gap-1.5" ref={sortRef}>
              <div className="inline-flex overflow-hidden rounded-md border border-border bg-background shadow-sm transition-colors duration-150 hover:border-foreground/25 focus-within:border-hanover-green focus-within:ring-2 focus-within:ring-hanover-green/30">
                <button
                  type="button"
                  onClick={() => setSortOpen((o) => !o)}
                  aria-expanded={sortOpen}
                  className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium outline-none transition-colors duration-150 hover:bg-muted"
                >
                  <span>{currentSortLabel}</span>
                  <ChevronDown
                    className={`h-3.5 w-3.5 text-muted-foreground transition-transform duration-200 ${sortOpen ? "rotate-180" : ""}`}
                    aria-hidden
                  />
                </button>

                <span className="my-1 w-px bg-border" aria-hidden />

                <button
                  type="button"
                  onClick={() => filters.setSortDir(filters.sortDir === "asc" ? "desc" : "asc")}
                  className="flex h-[37px] w-9 items-center justify-center text-muted-foreground outline-none transition-colors duration-150 hover:bg-muted hover:text-foreground"
                  aria-label={`Sort direction: ${filters.sortDir === "asc" ? "ascending" : "descending"}. Click to toggle.`}
                  title={filters.sortDir === "asc" ? "Ascending" : "Descending"}
                >
                  <span key={filters.sortDir} className="inline-flex animate-scale-in">
                    {filters.sortDir === "asc" ? (
                      <ArrowUpNarrowWide className="h-4 w-4" aria-hidden />
                    ) : (
                      <ArrowDownNarrowWide className="h-4 w-4" aria-hidden />
                    )}
                  </span>
                </button>
              </div>
              <HelpPopover title="Sorting" side="bottom" align="start" contentClassName="w-64">
                Favorites stay at the top. The sort menu orders the remaining content by due date,
                name, or created date.
              </HelpPopover>

              {sortOpen && (
                <div className="absolute left-7 top-full z-20 mt-1.5 w-44 origin-top-left animate-pop overflow-hidden rounded-md border border-border bg-background shadow-lg shadow-black/10">
                  {SORT_OPTIONS.map((opt) => {
                    const active = filters.sort === opt.key;
                    return (
                      <button
                        key={opt.key}
                        type="button"
                        onClick={() => {
                          filters.setSort(opt.key);
                          setSortOpen(false);
                        }}
                        className={`flex w-full items-center justify-between px-3 py-2 text-sm transition-colors duration-150 hover:bg-muted ${active ? "text-hanover-green" : ""}`}
                      >
                        <span className={active ? "font-medium" : ""}>{opt.label}</span>
                        {active && <Check className="h-4 w-4 text-hanover-green" aria-hidden />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* VIEW TOGGLE DROPDOWN */}
            <div className="relative" ref={viewRef}>
              <button
                type="button"
                onClick={() => setViewOpen((o) => !o)}
                aria-expanded={viewOpen}
                className="flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-sm font-medium shadow-sm outline-none transition-colors duration-150 hover:bg-muted hover:border-foreground/25 focus-visible:border-hanover-green focus-visible:ring-2 focus-visible:ring-hanover-green/30"
              >
                <span key={filters.view} className="inline-flex animate-scale-in">
                  {filters.view === "grid" ? (
                    <LayoutGrid className="h-4 w-4 text-foreground" aria-hidden />
                  ) : (
                    <List className="h-4 w-4 text-foreground" aria-hidden />
                  )}
                </span>
                <span>{filters.view === "grid" ? "Card view" : "List view"}</span>
                <ChevronDown
                  className={`h-3.5 w-3.5 text-muted-foreground transition-transform duration-200 ${viewOpen ? "rotate-180" : ""}`}
                  aria-hidden
                />
              </button>

              {viewOpen && (
                <div className="absolute right-0 top-full z-20 mt-1.5 w-40 origin-top-right animate-pop overflow-hidden rounded-md border border-border bg-background shadow-lg shadow-black/10">
                  {[
                    { key: "grid" as const, label: "Card view", icon: LayoutGrid },
                    { key: "list" as const, label: "List view", icon: List },
                  ].map(({ key, label, icon: Icon }) => {
                    const active = filters.view === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => {
                          filters.setView(key);
                          setViewOpen(false);
                        }}
                        className={`flex w-full items-center justify-between px-3 py-2 text-sm transition-colors duration-150 hover:bg-muted ${active ? "text-hanover-green" : ""}`}
                      >
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4" aria-hidden />
                          <span className={active ? "font-medium" : ""}>{label}</span>
                        </div>
                        {active && <Check className="h-4 w-4 text-hanover-green" aria-hidden />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* NEW CONTENT */}
            <Link
              to="/hero/content/new"
              className="group flex shrink-0 items-center gap-2 rounded-md bg-hanover-green px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-hanover-green/20 transition-all duration-200 hover:-translate-y-0.5 hover:bg-hanover-green/90 hover:shadow-md hover:shadow-hanover-green/30 active:translate-y-0 active:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hanover-green/40 focus-visible:ring-offset-2"
            >
              <Plus className="h-4 w-4 transition-transform duration-200 group-hover:rotate-90" />
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

          <main className="min-w-0 flex-1">
            {contents.isLoading ? (
              <div className="flex animate-fade-in items-center justify-center py-16">
                <Loader2 className="h-6 w-6 animate-spin text-hanover-green" />
              </div>
            ) : positionGroups.length > 0 ? (
              <div className="animate-fade-in-up space-y-4">
                {positionGroups.map((group) => (
                  <PositionGroup
                    key={group.key}
                    label={group.label}
                    items={group.items}
                    view={filters.view}
                    currentUserId={currentUserId}
                    searchQuery={debouncedSearch}
                    toggleFavorite={toggleFavorite}
                    checkin={checkin}
                    getStatusBadge={getStatusBadge}
                  />
                ))}
              </div>
            ) : (
              <div className="animate-fade-in-up rounded-lg border border-dashed border-border bg-card px-4 py-10 text-center text-sm text-muted-foreground">
                No content found.
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
