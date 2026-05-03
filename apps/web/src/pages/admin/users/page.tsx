import { HelpPopover } from "@myapp/ui/components/help-popover";
import {
  ChevronDown,
  Command,
  ExternalLink,
  FileText,
  Loader2,
  Pencil,
  Plus,
  Search,
  Trash2,
  User,
  X,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { trpc } from "@/lib/trpc";
import { useAppPreferences } from "@/store/app-preferences";

// ─── Role config ──────────────────────────────────────────────────────────────

type KnownRole =
  | "admin"
  | "underwriter"
  | "business-analyst"
  | "actuarial-analyst"
  | "exl-operations";

const ROLE_LABELS: Record<KnownRole, string> = {
  admin: "Admin",
  underwriter: "Underwriter",
  "business-analyst": "Business Analyst",
  "actuarial-analyst": "Actuarial Analyst",
  "exl-operations": "EXL Operations",
};

const ROLE_ACCENTS: Record<KnownRole, string> = {
  admin: "bg-hanover-deepblue",
  underwriter: "bg-hanover-green",
  "business-analyst": "bg-[#C9A84C]",
  "actuarial-analyst": "bg-violet-500",
  "exl-operations": "bg-sky-500",
};

const ROLE_BADGE: Record<KnownRole, { wrap: string; dot: string }> = {
  admin: {
    wrap: "bg-hanover-deepblue/10 text-hanover-deepblue ring-1 ring-hanover-deepblue/20",
    dot: "bg-hanover-deepblue",
  },
  underwriter: {
    wrap: "bg-hanover-green/10 text-hanover-green ring-1 ring-hanover-green/25",
    dot: "bg-hanover-green",
  },
  "business-analyst": {
    wrap: "bg-[#C9A84C]/15 text-[#8a6f28] ring-1 ring-[#C9A84C]/40",
    dot: "bg-[#C9A84C]",
  },
  "actuarial-analyst": {
    wrap: "bg-violet-500/10 text-violet-700 ring-1 ring-violet-500/25",
    dot: "bg-violet-500",
  },
  "exl-operations": {
    wrap: "bg-sky-500/10 text-sky-700 ring-1 ring-sky-500/25",
    dot: "bg-sky-500",
  },
};

const ALL_KNOWN_ROLES: KnownRole[] = [
  "admin",
  "underwriter",
  "business-analyst",
  "actuarial-analyst",
  "exl-operations",
];

const USERS_SEARCH_FOCUS_EVENT = "users-search:focus";

// ─── Shared sub-components ────────────────────────────────────────────────────

function RoleBadge({ role }: { role: string }) {
  const known = role as KnownRole;
  const style = ROLE_BADGE[known];
  const label = ROLE_LABELS[known] ?? role;
  const cls = style?.wrap ?? "bg-muted text-muted-foreground ring-1 ring-border";
  const dot = style?.dot ?? "bg-muted-foreground";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${cls}`}
    >
      <span className={`size-1.5 rounded-full ${dot}`} aria-hidden />
      {label}
    </span>
  );
}

function DetailRow({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 px-4 py-2.5">
      <span className="text-muted-foreground">{label}</span>
      <span className={`font-medium text-foreground ${mono ? "font-mono text-xs" : ""}`}>
        {value}
      </span>
    </div>
  );
}

function StatusDot({ status }: { status: string | null }) {
  const cls =
    status === "Finalized"
      ? "bg-hanover-green"
      : status === "Created"
        ? "bg-[#C9A84C]"
        : status === "in-progress"
          ? "bg-blue-500"
          : status === "Archived"
            ? "bg-gray-400"
            : "bg-muted-foreground";
  return (
    <span className="flex items-center gap-1 text-muted-foreground">
      <span className={`inline-block h-1.5 w-1.5 rounded-full ${cls}`} aria-hidden />
      {status ?? "—"}
    </span>
  );
}

// ─── User Detail Drawer ───────────────────────────────────────────────────────
function UserDetailDrawer({ userId, onClose }: { userId: string; onClose: () => void }) {
  const profile = trpc.user.adminGetById.useQuery({ id: userId });

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const user = profile.data;
  const ownedContent = profile.data?.owned_content ?? [];

  // Until the backend exposes checkedOutContent via adminGetById, we detect
  // checkout by document_status. Once the backend is updated, swap this out.
  const checkedOut = profile.data?.checkedOutContent ?? [];
  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
        aria-hidden
      />
      <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l border-border bg-card shadow-2xl overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-card px-5 py-4">
          <h2 className="text-base font-semibold text-foreground">User Overview</h2>
          <div className="flex items-center gap-2">
            {user && (
              <Link
                to={`/users/${user.id}`}
                className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium text-hanover-green transition-all hover:bg-hanover-green/10"
              >
                <Pencil className="h-3.5 w-3.5" />
                Edit
              </Link>
            )}
            <button
              type="button"
              onClick={onClose}
              className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </button>
          </div>
        </div>

        {profile.isLoading ? (
          <div className="flex flex-1 items-center justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-hanover-green" />
          </div>
        ) : profile.isError || !user ? (
          <div className="px-5 py-12 text-center text-sm text-red-600">
            Could not load user data.
          </div>
        ) : (
          <div className="flex-1 px-5 py-6 space-y-6">
            {/* Identity */}
            <div className="flex items-center gap-4">
              {user.photo_url ? (
                <img
                  src={user.photo_url}
                  alt={user.name}
                  className="h-16 w-16 rounded-full object-cover ring-2 ring-border"
                />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted ring-2 ring-border">
                  <User className="h-8 w-8 text-muted-foreground" />
                </div>
              )}
              <div className="min-w-0">
                <p className="truncate text-lg font-semibold text-foreground">{user.name}</p>
                <p className="truncate text-sm text-muted-foreground">{user.email}</p>
                <div className="mt-1">
                  <RoleBadge role={user.role} />
                </div>
              </div>
            </div>

            {/* Profile fields */}
            <div className="rounded-lg border border-border bg-background text-sm divide-y divide-border">
              <DetailRow label="Portal" value={user.portal} />
              <DetailRow label="Employee code" value={user.employee_code ?? "—"} mono />
              <DetailRow label="Job description" value={user.job_desc ?? "—"} />
            </div>

            {/* Checked-out content */}
            <section>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Currently Checked Out
                <span className="ml-2 rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-bold">
                  {checkedOut.length}
                </span>
              </h3>
              {profile.isLoading ? (
                <div className="flex items-center gap-2 py-4 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" /> Loading…
                </div>
              ) : checkedOut.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nothing checked out.</p>
              ) : (
                <ul className="space-y-1.5">
                  {checkedOut.map((c) => (
                    <li
                      key={c.fileID}
                      className="flex items-center justify-between gap-3 rounded-md border border-border bg-muted/40 px-3 py-2 text-xs"
                    >
                      <span className="flex items-center gap-2 font-medium text-foreground truncate">
                        <FileText className="h-3.5 w-3.5 shrink-0 text-hanover-green" />
                        {c.filename ?? c.fileID}
                      </span>
                      <Link
                        to={`/hero/content/${c.fileID}`}
                        className="shrink-0 text-hanover-green hover:text-hanover-green/80"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {/* All owned content */}
            <section>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Owned Content
                <span className="ml-2 rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-bold">
                  {ownedContent.length}
                </span>
              </h3>
              {profile.isLoading ? (
                <div className="flex items-center gap-2 py-4 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" /> Loading…
                </div>
              ) : ownedContent.length === 0 ? (
                <p className="text-sm text-muted-foreground">No owned content.</p>
              ) : (
                <ul className="divide-y divide-border overflow-hidden rounded-lg border border-border bg-card text-xs">
                  {ownedContent.map((c) => (
                    <li
                      key={c.fileID}
                      className="flex items-center justify-between gap-3 px-3 py-2.5 transition-colors hover:bg-muted/50"
                    >
                      <span className="font-medium text-foreground truncate">
                        {c.filename ?? c.fileID}
                      </span>
                      <div className="flex items-center gap-2 shrink-0">
                        <StatusDot status={c.document_status} />
                        <Link
                          to={`/hero/content/${c.fileID}`}
                          className="text-hanover-green hover:text-hanover-green/80"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </Link>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        )}
      </div>
    </>
  );
}

// ─── Collapsible role group ───────────────────────────────────────────────────

type UserRow = {
  id: string;
  email: string;
  name: string;
  role: string;
  employee_code: string | null;
  photo_url?: string | null;
  portal?: string;
};

function RoleGroup({
  role,
  users,
  onSelectUser,
  onDeleteRequest,
  confirmDeleteId,
  onCancelDelete,
  onConfirmDelete,
  isDeleting,
}: {
  role: string;
  users: UserRow[];
  onSelectUser: (id: string) => void;
  onDeleteRequest: (id: string) => void;
  confirmDeleteId: string | null;
  onCancelDelete: () => void;
  onConfirmDelete: (id: string) => void;
  isDeleting: boolean;
}) {
  const [open, setOpen] = useState(true);
  const known = role as KnownRole;
  const accent = ROLE_ACCENTS[known] ?? "bg-muted-foreground";
  const label = ROLE_LABELS[known] ?? role;

  return (
    <section className="pb-1">
      {/* Collapsible header — matches PositionGroup visual language */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="mb-2 flex w-full items-center justify-between gap-3 rounded-lg border border-border bg-card px-3.5 py-2.5 text-left shadow-sm transition-colors hover:bg-muted/40"
      >
        <span className="flex items-center gap-3 min-w-0">
          <ChevronDown
            className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-300 ${open ? "rotate-0" : "-rotate-90"}`}
          />
          <span aria-hidden className={`h-5 w-1 shrink-0 rounded-full ${accent}`} />
          <span className="truncate text-sm font-semibold text-foreground">{label}</span>
        </span>
        <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground ring-1 ring-inset ring-border">
          {users.length} {users.length === 1 ? "user" : "users"}
        </span>
      </button>

      <div
        className={`grid transition-all duration-300 ease-in-out ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
      >
        <div
          className="overflow-hidden rounded-lg border border-border bg-card shadow-sm"
          style={{ minHeight: 0 }}
        >
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/80">
                <th className="w-12 px-4 py-3" />
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Email
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    Code
                    <HelpPopover title="Employee code" side="bottom" align="center">
                      Optional internal identifier used to match users with employee directory
                      records.
                    </HelpPopover>
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr
                  key={user.id}
                  className="border-b border-border transition-colors duration-150 last:border-b-0 hover:bg-muted/60 cursor-pointer"
                  onClick={() => onSelectUser(user.id)}
                >
                  <td className="px-4 py-3">
                    {user.photo_url ? (
                      <img
                        src={user.photo_url}
                        alt={user.name}
                        className="h-8 w-8 rounded-full object-cover ring-1 ring-border"
                      />
                    ) : (
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground ring-1 ring-border">
                        <User className="h-4 w-4" />
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 font-medium text-foreground">
                    <span className="hover:text-hanover-green transition-colors">{user.name}</span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{user.email}</td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                    {user.employee_code ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <Link
                        to={`/users/${user.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-hanover-green transition-all duration-150 hover:bg-hanover-green/10 active:scale-95"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        Edit
                      </Link>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteRequest(user.id);
                        }}
                        className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-red-600 transition-all duration-150 hover:bg-red-50 active:scale-95 dark:hover:bg-red-950/40"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Delete
                      </button>
                    </div>
                    {confirmDeleteId === user.id && (
                      <div className="mt-2 animate-fade-in-down rounded-md border border-red-200 bg-red-50 px-3 py-2 dark:border-red-900/50 dark:bg-red-950/30">
                        <p className="mb-2 text-xs text-red-700 dark:text-red-300">
                          Delete <strong>{user.email}</strong>? This cannot be undone.
                        </p>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={onCancelDelete}
                            className="rounded-md border border-border bg-card px-3 py-1 text-xs font-medium text-foreground transition-colors duration-150 hover:bg-muted/80"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => onConfirmDelete(user.id)}
                            disabled={isDeleting}
                            className="rounded-md bg-red-600 px-3 py-1 text-xs font-medium text-white shadow-sm transition-all duration-150 hover:bg-red-700 hover:shadow active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            Confirm Delete
                          </button>
                        </div>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

function UsersPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const search = useAppPreferences((state) => state.usersSearch);
  const setSearch = useAppPreferences((state) => state.setUsersSearch);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState("all");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const utils = trpc.useUtils();

  const users = trpc.user.adminList.useQuery({ search });
  const deleteMutation = trpc.user.adminDelete.useMutation({
    onSuccess: async () => {
      await utils.user.invalidate();
      setConfirmDeleteId(null);
    },
  });

  const allUsers = users.data ?? [];
  const roleOptions = ALL_KNOWN_ROLES.filter((role) => allUsers.some((user) => user.role === role));

  const filteredUsers =
    selectedRole === "all" ? allUsers : allUsers.filter((user) => user.role === selectedRole);

  // Group by role in defined order; unknown roles fall into "other"
  const grouped = ALL_KNOWN_ROLES.reduce<Record<string, UserRow[]>>(
    (acc, r) => {
      const items = filteredUsers.filter((u) => u.role === r);
      if (items.length) acc[r] = items;
      return acc;
    },
    {} as Record<string, UserRow[]>,
  );
  const unknownRoleUsers = filteredUsers.filter(
    (u) => !(ALL_KNOWN_ROLES as string[]).includes(u.role),
  );
  if (unknownRoleUsers.length) grouped.other = unknownRoleUsers;

  const focusSearchInput = useCallback(() => {
    window.requestAnimationFrame(() => {
      searchInputRef.current?.focus();
      searchInputRef.current?.select();
    });
  }, []);

  useEffect(() => {
    const handleSearchFocus = () => focusSearchInput();
    window.addEventListener(USERS_SEARCH_FOCUS_EVENT, handleSearchFocus);
    return () => window.removeEventListener(USERS_SEARCH_FOCUS_EVENT, handleSearchFocus);
  }, [focusSearchInput]);

  useEffect(() => {
    const state = location.state as { focusUsersSearch?: boolean } | null;
    if (state?.focusUsersSearch) {
      focusSearchInput();
      navigate(
        { pathname: location.pathname, search: location.search },
        { replace: true, state: null },
      );
    }
  }, [focusSearchInput, location.pathname, location.search, location.state, navigate]);

  return (
    <>
      {selectedUserId && (
        <UserDetailDrawer userId={selectedUserId} onClose={() => setSelectedUserId(null)} />
      )}

      <div className="animate-fade-in border-t border-border/60 py-6 sm:py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Search */}
          <div className="mb-6 flex flex-col gap-3 sm:flex-row">
            <div className="group relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-colors duration-200 group-focus-within:text-hanover-green" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search by email, name, role, or employee code."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-md border border-border bg-background py-2 pl-10 pr-24 text-sm transition-all duration-200 hover:border-foreground/30 focus:border-hanover-green focus:outline-none focus:ring-2 focus:ring-hanover-green/30"
              />
              <kbd className="pointer-events-none absolute right-12 top-1/2 hidden -translate-y-1/2 items-center gap-0.5 rounded border border-border bg-muted px-1.5 py-0.5 text-[11px] font-medium leading-none text-muted-foreground sm:inline-flex">
                <Command className="size-3" aria-hidden strokeWidth={2} />
                <span>K</span>
              </kbd>
              <HelpPopover
                title="User search"
                side="bottom"
                align="end"
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                Search by email, display name, assigned role, or employee code.
              </HelpPopover>
            </div>

            <Link
              to="/users/new"
              className="group flex shrink-0 items-center justify-center gap-2 rounded-md bg-hanover-green px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-hanover-green/20 transition-all duration-200 hover:-translate-y-0.5 hover:bg-hanover-green/90 hover:shadow-md hover:shadow-hanover-green/30 active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hanover-green/40 focus-visible:ring-offset-2"
            >
              <Plus className="h-4 w-4 transition-transform duration-200 group-hover:rotate-90" />
              Add User
            </Link>

            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="rounded-md border border-border bg-background px-3 py-2 text-sm transition-all duration-200 hover:border-foreground/30 focus:border-hanover-green focus:outline-none focus:ring-2 focus:ring-hanover-green/30"
            >
              <option value="all">All roles</option>
              {roleOptions.map((role) => (
                <option key={role} value={role}>
                  {ROLE_LABELS[role]}
                </option>
              ))}
            </select>
          </div>

          {/* Content */}
          {users.isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-hanover-green" />
              <span className="ml-2 text-muted-foreground">Loading users...</span>
            </div>
          ) : users.isError ? (
            <div className="mx-auto max-w-lg px-4 py-16 text-center">
              <p className="font-medium text-red-600">Could not load users.</p>
              <p className="mt-2 break-words text-sm text-muted-foreground">
                {users.error instanceof Error ? users.error.message : String(users.error)}
              </p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="rounded-lg border border-border bg-card py-16 text-center text-muted-foreground shadow-sm">
              No users found.
            </div>
          ) : (
            <div className="animate-fade-in-up space-y-3">
              {Object.entries(grouped).map(([role, roleUsers]) => (
                <RoleGroup
                  key={role}
                  role={role}
                  users={roleUsers}
                  onSelectUser={setSelectedUserId}
                  onDeleteRequest={setConfirmDeleteId}
                  confirmDeleteId={confirmDeleteId}
                  onCancelDelete={() => setConfirmDeleteId(null)}
                  onConfirmDelete={(id) => deleteMutation.mutate({ id })}
                  isDeleting={deleteMutation.isPending}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default UsersPage;
