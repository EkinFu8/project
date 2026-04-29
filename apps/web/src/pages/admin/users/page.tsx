import { HelpPopover } from "@myapp/ui/components/help-popover";
import { Command, Loader2, Pencil, Plus, Search, Trash2, User, Users } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { trpc } from "@/lib/trpc";

type UserRole = "admin" | "underwriter" | "business-analyst";

const ROLE_LABELS: Record<UserRole, string> = {
  admin: "Admin",
  underwriter: "Underwriter",
  "business-analyst": "Business Analyst",
};
const USERS_SEARCH_FOCUS_EVENT = "users-search:focus";

function UsersPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
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

  const focusSearchInput = useCallback(() => {
    window.requestAnimationFrame(() => {
      searchInputRef.current?.focus();
      searchInputRef.current?.select();
    });
  }, []);

  useEffect(() => {
    function handleSearchFocus() {
      focusSearchInput();
    }

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
    <div className="animate-fade-in border-t border-border/60 py-6 sm:py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="flex flex-wrap items-center gap-3 text-3xl font-bold tracking-tight text-foreground">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-hanover-green/10">
                <Users className="h-6 w-6 text-hanover-green" />
              </span>
              User Management
              <HelpPopover title="User management" side="right" align="center">
                Admins can create, edit, and remove application users. Role and directory fields
                control app access and profile metadata.
              </HelpPopover>
            </h1>
            <p className="mt-1 text-muted-foreground">Supabase accounts and directory fields</p>
          </div>
          <Link
            to="/users/new"
            className="group flex shrink-0 items-center justify-center gap-2 rounded-md bg-hanover-green px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-hanover-green/20 transition-all duration-200 hover:-translate-y-0.5 hover:bg-hanover-green/90 hover:shadow-md hover:shadow-hanover-green/30 active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hanover-green/40 focus-visible:ring-offset-2"
          >
            <Plus className="h-4 w-4 transition-transform duration-200 group-hover:rotate-90" />
            Add User
          </Link>
        </div>

        <div className="mb-6">
          <div className="group relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-colors duration-200 group-focus-within:text-hanover-green" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search by email, name, role, or employee code..."
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
        </div>

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
        ) : (
          <div className="animate-fade-in-up overflow-x-auto rounded-lg border border-border bg-card shadow-sm">
            {allUsers.length === 0 ? (
              <div className="py-16 text-center text-muted-foreground">No users found.</div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/80">
                    <th className="w-12 px-4 py-3" />
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Email
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Name
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        Role
                        <HelpPopover title="User role" side="bottom" align="center">
                          Roles determine which app areas and content audiences a user can access.
                        </HelpPopover>
                      </div>
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
                  {allUsers.map((user) => (
                    <tr
                      key={user.id}
                      className="border-b border-border transition-colors duration-150 last:border-b-0 hover:bg-muted/60"
                    >
                      <td className="px-4 py-3">
                        {user.photo_url ? (
                          <img
                            src={user.photo_url}
                            alt={user.name}
                            className="h-8 w-8 rounded-full object-cover ring-1 ring-border transition-transform duration-200 hover:scale-110"
                          />
                        ) : (
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground ring-1 ring-border">
                            <User className="h-4 w-4" />
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{user.email}</td>
                      <td className="px-4 py-3 font-medium text-foreground">{user.name}</td>
                      <td className="px-4 py-3">
                        <RoleBadge role={user.role} />
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                        {user.employee_code ?? "\u2014"}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <Link
                            to={`/users/${user.id}`}
                            className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-hanover-green transition-all duration-150 hover:bg-hanover-green/10 active:scale-95"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                            Edit
                          </Link>
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(user.id)}
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
                                onClick={() => setConfirmDeleteId(null)}
                                className="rounded-md border border-border bg-card px-3 py-1 text-xs font-medium text-foreground transition-colors duration-150 hover:bg-muted/80"
                              >
                                Cancel
                              </button>
                              <button
                                type="button"
                                onClick={() => deleteMutation.mutate({ id: user.id })}
                                disabled={deleteMutation.isPending}
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
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function RoleBadge({ role }: { role: string }) {
  const known = role as UserRole;
  const styles: Record<UserRole, string> = {
    admin: "bg-hanover-deepblue/10 text-hanover-deepblue ring-1 ring-hanover-deepblue/20",
    underwriter: "bg-hanover-green/10 text-hanover-green ring-1 ring-hanover-green/25",
    "business-analyst": "bg-[#C9A84C]/15 text-[#8a6f28] ring-1 ring-[#C9A84C]/40",
  };
  const dots: Record<UserRole, string> = {
    admin: "bg-hanover-deepblue",
    underwriter: "bg-hanover-green",
    "business-analyst": "bg-[#C9A84C]",
  };
  const label = ROLE_LABELS[known as UserRole] ?? role;
  const cls = styles[known] ?? "bg-muted text-muted-foreground ring-1 ring-border";
  const dot = dots[known] ?? "bg-muted-foreground";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${cls}`}
    >
      <span className={`size-1.5 rounded-full ${dot}`} aria-hidden />
      {label}
    </span>
  );
}

export default UsersPage;
