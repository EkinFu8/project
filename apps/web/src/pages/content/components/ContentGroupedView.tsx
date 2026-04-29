import { AnimatePresence, motion } from "framer-motion";
import type { ContentItem } from "@/types/content";
import { usePersistedState } from "../hooks/usePersistedState";
import { ContentCard } from "./ContentCard";
import { ContentListHeader } from "./ContentListHeader";
import { ContentListRow } from "./ContentListRow";
import { GroupHeader } from "./GroupHeader";

type CheckinMutation = {
  mutate: (args: { fileID: string }) => void;
};

type Props = {
  items: ContentItem[];
  view: "grid" | "list";
  currentUserId?: string;
  /** Current viewer's role — used to float their own role to the top of the list. */
  currentUserRole?: string | null;
  searchQuery?: string;
  toggleFavorite: { mutate: (args: { fileID: string }) => void };
  checkin: CheckinMutation;
  getStatusBadge: (status?: string) => string;
};

type RoleKey =
  | "underwriter"
  | "business-analyst"
  | "actuarial-analyst"
  | "exl-operations"
  | "_other";

const ROLE_LABEL: Record<RoleKey, string> = {
  underwriter: "Underwriter",
  "business-analyst": "Business Analyst",
  "actuarial-analyst": "Actuarial Analyst",
  "exl-operations": "EXL Operations",
  _other: "Other",
};

/** Accent stripe — matches the soft role tint already on the cards. */
const ROLE_ACCENT: Record<RoleKey, string> = {
  underwriter: "bg-blue-500",
  "business-analyst": "bg-amber-500",
  "actuarial-analyst": "bg-emerald-500",
  "exl-operations": "bg-violet-500",
  _other: "bg-zinc-400",
};

function bucketKey(item: ContentItem): RoleKey {
  const raw = (item.job_position ?? "").trim().toLowerCase();
  if (
    raw === "underwriter" ||
    raw === "business-analyst" ||
    raw === "actuarial-analyst" ||
    raw === "exl-operations"
  ) {
    return raw as RoleKey;
  }
  return "_other";
}

/** Map a UserProfile.role string to a known bucket key, or null if not one of the four personas. */
function roleToBucket(role?: string | null): RoleKey | null {
  const normalized = (role ?? "").trim().toLowerCase();
  if (
    normalized === "underwriter" ||
    normalized === "business-analyst" ||
    normalized === "actuarial-analyst" ||
    normalized === "exl-operations"
  ) {
    return normalized as RoleKey;
  }
  return null;
}

/**
 * Build the section render order: the viewer's own role floats to the top
 * (so the docs they actually need are right there), and the rest follow
 * alphabetically by display label. "Other" stays at the very end so unknown
 * roles never push above named roles.
 */
function buildSectionOrder(viewerRole: string | null | undefined): RoleKey[] {
  const ownRole = roleToBucket(viewerRole);
  const named: RoleKey[] = [
    "underwriter",
    "business-analyst",
    "actuarial-analyst",
    "exl-operations",
  ];

  const rest = named
    .filter((k) => k !== ownRole)
    .sort((a, b) => ROLE_LABEL[a].localeCompare(ROLE_LABEL[b]));

  return [...(ownRole ? [ownRole] : []), ...rest, "_other"];
}

function isOverdue(item: ContentItem): boolean {
  if (!item.next_review_date) return false;
  const [year, month, day] = item.next_review_date.split("-").map(Number);
  if (!year || !month || !day) return false;
  const reviewDate = new Date(year, month - 1, day);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return reviewDate < today;
}

export function ContentGroupedView({
  items,
  view,
  currentUserId,
  currentUserRole,
  searchQuery,
  toggleFavorite,
  checkin,
  getStatusBadge,
}: Props) {
  // Persisted across navigation so closing a section doesn't reset every time.
  const [collapsed, setCollapsed] = usePersistedState<Record<string, boolean>>(
    "content.groups.collapsed",
    {},
  );

  // Bucket while preserving the upstream sort order within each group.
  const buckets = new Map<RoleKey, ContentItem[]>();
  for (const item of items) {
    const key = bucketKey(item);
    const list = buckets.get(key);
    if (list) {
      list.push(item);
    } else {
      buckets.set(key, [item]);
    }
  }

  const sectionOrder = buildSectionOrder(currentUserRole);
  const visibleGroups = sectionOrder.filter((key) => (buckets.get(key)?.length ?? 0) > 0);

  if (visibleGroups.length === 0) {
    return (
      <p className="rounded border border-dashed border-border bg-card p-10 text-center text-sm text-muted-foreground">
        No content matches the current filters.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {visibleGroups.map((key) => {
        const groupItems = buckets.get(key) ?? [];
        const isCollapsed = !!collapsed[key];
        const overdueCount = groupItems.filter(isOverdue).length;

        return (
          <section key={key} className="flex flex-col gap-3">
            <GroupHeader
              label={ROLE_LABEL[key]}
              count={groupItems.length}
              overdueCount={overdueCount}
              accent={ROLE_ACCENT[key]}
              expanded={!isCollapsed}
              onToggle={() => setCollapsed((prev) => ({ ...prev, [key]: !prev[key] }))}
            />

            <AnimatePresence initial={false}>
              {!isCollapsed && (
                <motion.div
                  key="content"
                  layout
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.18, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  {/* Indent the group body so it visually nests under the header */}
                  <div className="pl-3">
                    {view === "grid" ? (
                      <div
                        style={{
                          display: "grid",
                          gap: "1rem",
                          gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
                        }}
                      >
                        {groupItems.map((item) => (
                          <ContentCard
                            key={item.fileID}
                            item={item}
                            currentUserId={currentUserId}
                            searchQuery={searchQuery}
                            toggleFavorite={toggleFavorite}
                            checkin={checkin}
                            getStatusBadge={getStatusBadge}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="rounded border border-border bg-card">
                        <ContentListHeader />
                        <div className="flex flex-col divide-y divide-border">
                          {groupItems.map((item) => (
                            <ContentListRow
                              key={item.fileID}
                              item={item}
                              currentUserId={currentUserId}
                              searchQuery={searchQuery}
                              toggleFavorite={toggleFavorite}
                              checkin={checkin}
                              getStatusBadge={getStatusBadge}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </section>
        );
      })}
    </div>
  );
}
