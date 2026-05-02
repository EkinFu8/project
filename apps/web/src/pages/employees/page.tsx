import { ChevronDown, ChevronRight, Loader2, Mail, Search, User, Users } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";
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

// ─── Collapsible role group ───────────────────────────────────────────────────

type CoworkerRow = {
  id: string;
  name: string;
  email: string;
  role: string;
  employee_code: string | null;
  job_desc: string | null;
  photo_url?: string | null;
};

function RoleGroup({ role, coworkers }: { role: string; coworkers: CoworkerRow[] }) {
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
          {open ? (
            <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
          )}
          <span aria-hidden className={`h-5 w-1 shrink-0 rounded-full ${accent}`} />
          <span className="truncate text-sm font-semibold text-foreground">{label}</span>
        </span>
        <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground ring-1 ring-inset ring-border">
          {coworkers.length} {coworkers.length === 1 ? "person" : "people"}
        </span>
      </button>

      {open && (
        <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
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
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Job
                </th>
              </tr>
            </thead>
            <tbody>
              {coworkers.map((emp) => (
                <tr
                  key={emp.id}
                  className="border-b border-border transition-colors duration-150 last:border-b-0 hover:bg-muted/60"
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
                    <Link
                      to={`/employees/${emp.id}`}
                      className="text-hanover-green underline-offset-2 transition-colors duration-150 hover:text-hanover-green/80 hover:underline"
                    >
                      {emp.name}
                    </Link>
                  </td>
                  <td className="max-w-[14rem] px-4 py-3">
                    <a
                      href={`mailto:${encodeURIComponent(emp.email)}`}
                      className="group inline-flex items-center gap-1.5 break-all text-hanover-green underline-offset-2 transition-colors duration-150 hover:text-hanover-green/80 hover:underline"
                    >
                      <Mail
                        className="h-3.5 w-3.5 shrink-0 opacity-80 transition-transform duration-200 group-hover:scale-110"
                        aria-hidden
                      />
                      {emp.email}
                    </a>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                    {emp.employee_code ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{emp.job_desc ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

function EmployeesPage() {
  const search = useAppPreferences((state) => state.coworkerSearch);
  const setSearch = useAppPreferences((state) => state.setCoworkerSearch);

  const coworkers = trpc.employee.list.useQuery({ search, coworkersOnly: true });

  const allCoworkers = coworkers.data ?? [];

  // Group by role in defined order; unknown roles fall into "other"
  const grouped = ALL_KNOWN_ROLES.reduce<Record<string, CoworkerRow[]>>(
    (acc, r) => {
      const items = allCoworkers.filter((c) => c.role === r);
      if (items.length) acc[r] = items;
      return acc;
    },
    {} as Record<string, CoworkerRow[]>,
  );
  const unknownRoleUsers = allCoworkers.filter(
    (c) => !(ALL_KNOWN_ROLES as string[]).includes(c.role),
  );
  if (unknownRoleUsers.length) grouped["other"] = unknownRoleUsers;

  return (
    <div className="animate-fade-in border-t border-border/60 py-6 sm:py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="flex flex-wrap items-center gap-3 text-3xl font-bold tracking-tight text-foreground">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-hanover-green/10">
              <Users className="h-6 w-6 text-hanover-green" />
            </span>
            Coworkers
          </h1>
          <p className="mt-1 text-muted-foreground">
            People on the employee portal with you — click a name to view their profile.
          </p>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="group relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-colors duration-200 group-focus-within:text-hanover-green" />
            <input
              type="text"
              placeholder="Search by name, email, code, or job description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-md border border-border bg-background py-2 pl-10 pr-4 text-sm transition-all duration-200 hover:border-foreground/30 focus:border-hanover-green focus:outline-none focus:ring-2 focus:ring-hanover-green/30"
            />
          </div>
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
              {coworkers.error instanceof Error ? coworkers.error.message : String(coworkers.error)}
            </p>
          </div>
        ) : allCoworkers.length === 0 ? (
          <div className="rounded-lg border border-border bg-card py-16 text-center text-muted-foreground shadow-sm">
            No coworkers match your search.
          </div>
        ) : (
          <div className="animate-fade-in-up space-y-3">
            {Object.entries(grouped).map(([role, roleCoworkers]) => (
              <RoleGroup key={role} role={role} coworkers={roleCoworkers} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default EmployeesPage;
