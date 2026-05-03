// apps/web/src/pages/employees/page.tsx

import { ChevronDown, Loader2, Mail, Search, User, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { trpc } from "@/lib/trpc.ts";
import { useAppPreferences } from "@/store/app-preferences";

// ─── Role config (employee-portal roles only, no admin) ───────────────────────

type KnownRole = "underwriter" | "business-analyst" | "actuarial-analyst" | "exl-operations";

const ROLE_LABELS: Record<KnownRole, string> = {
  underwriter: "Underwriter",
  "business-analyst": "Business Analyst",
  "actuarial-analyst": "Actuarial Analyst",
  "exl-operations": "EXL Operations",
};

const ROLE_ACCENTS: Record<KnownRole, string> = {
  underwriter: "bg-hanover-green",
  "business-analyst": "bg-[#C9A84C]",
  "actuarial-analyst": "bg-violet-500",
  "exl-operations": "bg-sky-500",
};

const ROLE_BADGE: Record<KnownRole, { wrap: string; dot: string }> = {
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
  "underwriter",
  "business-analyst",
  "actuarial-analyst",
  "exl-operations",
];

const COWORKERS_SEARCH_FOCUS_EVENT = "coworkers-search:focus";

// ─── Types ────────────────────────────────────────────────────────────────────

type CoworkerRow = {
  id: string;
  name: string;
  email: string;
  role: string;
  employee_code: string | null;
  photo_url?: string | null;
};

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

// ─── Coworker Detail Drawer ───────────────────────────────────────────────────

function CoworkerDetailDrawer({
  coworkerId,
  onClose,
}: {
  coworkerId: string;
  onClose: () => void;
}) {
  const profile = trpc.employee.getById.useQuery({ id: coworkerId }, { retry: false });

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const person = profile.data;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
        aria-hidden
      />

      {/* Drawer panel */}
      <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l border-border bg-card shadow-2xl overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-card px-5 py-4">
          <h2 className="text-base font-semibold text-foreground">Coworker Profile</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>
        </div>

        {profile.isLoading ? (
          <div className="flex flex-1 items-center justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-hanover-green" />
          </div>
        ) : profile.isError || !person ? (
          <div className="px-5 py-12 text-center text-sm text-red-600">Could not load profile.</div>
        ) : (
          <div className="flex-1 px-5 py-6 space-y-6">
            {/* Identity */}
            <div className="flex items-center gap-4">
              {person.photo_url ? (
                <img
                  src={person.photo_url}
                  alt={person.name}
                  className="h-16 w-16 rounded-full object-cover ring-2 ring-border"
                />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted ring-2 ring-border">
                  <User className="h-8 w-8 text-muted-foreground" />
                </div>
              )}
              <div className="min-w-0">
                <p className="truncate text-lg font-semibold text-foreground">{person.name}</p>
                <p className="truncate text-sm text-muted-foreground">{person.email}</p>
                <div className="mt-1">
                  <RoleBadge role={person.role} />
                </div>
              </div>
            </div>

            {/* Profile fields */}
            <div className="rounded-lg border border-border bg-background text-sm divide-y divide-border">
              <DetailRow label="Employee code" value={person.employee_code ?? "—"} mono />
              <DetailRow label="Job description" value={person.job_desc ?? "—"} />
            </div>

            {/* Contact */}
            <section>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Contact
              </h3>
              <a
                href={`mailto:${person.email}`}
                className="group flex items-center gap-3 rounded-lg border border-border bg-background px-4 py-3 text-sm transition-colors hover:border-hanover-green/40 hover:bg-hanover-green/5"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-hanover-green/10 transition-colors group-hover:bg-hanover-green/20">
                  <Mail className="h-4 w-4 text-hanover-green" />
                </span>
                <span className="min-w-0">
                  <span className="block font-medium text-foreground">Send email</span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {person.email}
                  </span>
                </span>
              </a>
            </section>
          </div>
        )}
      </div>
    </>
  );
}

// ─── Collapsible role group ───────────────────────────────────────────────────

function RoleGroup({
  role,
  coworkers,
  onSelectCoworker,
}: {
  role: string;
  coworkers: CoworkerRow[];
  onSelectCoworker: (id: string) => void;
}) {
  const [open, setOpen] = useState(true);
  const known = role as KnownRole;
  const accent = ROLE_ACCENTS[known] ?? "bg-muted-foreground";
  const label = ROLE_LABELS[known] ?? role;

  return (
    <section className="pb-1">
      {/* Collapsible header */}
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
          {coworkers.length} {coworkers.length === 1 ? "person" : "people"}
        </span>
      </button>

      {/* Animated collapse */}
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
                  Code
                </th>
              </tr>
            </thead>
            <tbody>
              {coworkers.map((emp) => (
                <tr
                  key={emp.id}
                  className="border-b border-border transition-colors duration-150 last:border-b-0 hover:bg-muted/60 cursor-pointer"
                  onClick={() => onSelectCoworker(emp.id)}
                >
                  <td className="px-4 py-3">
                    {emp.photo_url ? (
                      <img
                        src={emp.photo_url}
                        alt={emp.name}
                        className="h-8 w-8 rounded-full object-cover ring-1 ring-border"
                      />
                    ) : (
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground ring-1 ring-border">
                        <User className="h-4 w-4" />
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 font-medium text-foreground">
                    <span className="hover:text-hanover-green transition-colors">{emp.name}</span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    <a
                      href={`mailto:${emp.email}`}
                      onClick={(e) => e.stopPropagation()}
                      className="group inline-flex items-center gap-1.5 transition-colors hover:text-hanover-green"
                    >
                      <Mail
                        className="h-3.5 w-3.5 shrink-0 opacity-60 transition-transform group-hover:scale-110"
                        aria-hidden
                      />
                      {emp.email}
                    </a>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                    {emp.employee_code ?? "—"}
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

function EmployeesPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const search = useAppPreferences((state) => state.coworkerSearch);
  const setSearch = useAppPreferences((state) => state.setCoworkerSearch);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [selectedCoworkerId, setSelectedCoworkerId] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState("all");

  const coworkers = trpc.employee.list.useQuery({ search, coworkersOnly: true });

  const allCoworkers = coworkers.data ?? [];

  const roleOptions = ALL_KNOWN_ROLES.filter((role) =>
    allCoworkers.some((coworker) => coworker.role === role),
  );

  const filteredCoworkers =
    selectedRole === "all"
      ? allCoworkers
      : allCoworkers.filter((coworker) => coworker.role === selectedRole);

  // Group by role in defined order; unknown roles fall into "other"
  const grouped = ALL_KNOWN_ROLES.reduce<Record<string, CoworkerRow[]>>(
    (acc, r) => {
      const items = filteredCoworkers.filter((c) => c.role === r);
      if (items.length) acc[r] = items;
      return acc;
    },
    {} as Record<string, CoworkerRow[]>,
  );
  const unknownRoleUsers = filteredCoworkers.filter(
    (c) => !(ALL_KNOWN_ROLES as string[]).includes(c.role),
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
    window.addEventListener(COWORKERS_SEARCH_FOCUS_EVENT, handleSearchFocus);
    return () => window.removeEventListener(COWORKERS_SEARCH_FOCUS_EVENT, handleSearchFocus);
  }, [focusSearchInput]);

  useEffect(() => {
    const state = location.state as { focusCoworkersSearch?: boolean } | null;
    if (state?.focusCoworkersSearch) {
      focusSearchInput();
      navigate(
        { pathname: location.pathname, search: location.search },
        { replace: true, state: null },
      );
    }
  }, [focusSearchInput, location.pathname, location.search, location.state, navigate]);

  return (
    <>
      {selectedCoworkerId && (
        <CoworkerDetailDrawer
          coworkerId={selectedCoworkerId}
          onClose={() => setSelectedCoworkerId(null)}
        />
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
                placeholder="Search by name, email, or employee code."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-md border border-border bg-background py-2 pl-10 pr-4 text-sm transition-all duration-200 hover:border-foreground/30 focus:border-hanover-green focus:outline-none focus:ring-2 focus:ring-hanover-green/30"
              />
            </div>

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
          {coworkers.isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-hanover-green" />
              <span className="ml-2 text-muted-foreground">Loading coworkers...</span>
            </div>
          ) : coworkers.isError ? (
            <div className="mx-auto max-w-lg px-4 py-16 text-center">
              <p className="font-medium text-red-600">Could not load coworkers.</p>
              <p className="mt-2 break-words text-sm text-muted-foreground">
                {coworkers.error instanceof Error
                  ? coworkers.error.message
                  : String(coworkers.error)}
              </p>
            </div>
          ) : filteredCoworkers.length === 0 ? (
            <div className="rounded-lg border border-border bg-card py-16 text-center text-muted-foreground shadow-sm">
              No coworkers match your search.
            </div>
          ) : (
            <div className="animate-fade-in-up space-y-3">
              {Object.entries(grouped).map(([role, roleCoworkers]) => (
                <RoleGroup
                  key={role}
                  role={role}
                  coworkers={roleCoworkers}
                  onSelectCoworker={setSelectedCoworkerId}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default EmployeesPage;
