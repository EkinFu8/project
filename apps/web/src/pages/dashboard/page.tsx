import { InfoPopover } from "@myapp/ui/components/info-popover";
import { Activity, LayoutGrid, Loader2 } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { RouterOutputs } from "@/lib/trpc.ts";
import { trpc } from "@/lib/trpc.ts";
import { DashboardReports, MetricsView } from "@/pages/admin/metrics/page.tsx";

type DashboardTab = "overview" | "metrics";

type EmployeeRow = RouterOutputs["employee"]["list"][number];
type ContentRow = RouterOutputs["content"]["list"][number];
type AuditEventRow = RouterOutputs["audit"]["getRecent"][number];

const TOOLTIP_STYLE = {
  backgroundColor: "var(--color-card)",
  border: "1px solid var(--color-border)",
  borderRadius: "0.5rem",
  color: "var(--color-foreground)",
  fontSize: "0.75rem",
  padding: "0.5rem 0.625rem",
} as const;

function getStatusBadge(status: string | null) {
  switch (status) {
    case "Finalized":
      return "bg-hanover-green text-white";
    case "Created":
      return "bg-[#C9A84C] text-white";
    case "in-progress":
      return "bg-blue-500 text-white";
    case "Archived":
      return "bg-gray-400 text-white";
    default:
      return "bg-muted text-muted-foreground";
  }
}

function normalizeRole(value?: string | null) {
  return (value ?? "")
    .toLowerCase()
    .replace(/[\s_]+/g, "-")
    .trim();
}

function formatRoleLabel(value?: string | null) {
  const role = normalizeRole(value);
  if (!role) return "Unassigned";
  return role
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function DashboardLoaded({
  employees,
  allContent,
  auditEvents,
  isAdmin,
  userRole,
}: {
  employees: EmployeeRow[];
  allContent: ContentRow[];
  auditEvents: AuditEventRow[];
  isAdmin: boolean;
  userRole?: string | null;
}) {
  const roleKey = normalizeRole(userRole);
  const dashboardContent = isAdmin
    ? allContent
    : allContent.filter((item) => {
        const itemRole = normalizeRole(item.job_position);
        return !itemRole || itemRole === roleKey;
      });

  const roleEmployees = isAdmin
    ? employees
    : employees.filter((employee) => normalizeRole(employee.role) === roleKey);

  const finalized = dashboardContent.filter((c) => c.document_status === "Finalized");
  const inProgress = dashboardContent.filter((c) => c.document_status === "in-progress");
  const reviewDue = dashboardContent.filter((c) => {
    if (!c.next_review_date) return false;
    const review = new Date(c.next_review_date);
    review.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return review < today;
  });

  const stats = [
    {
      label: isAdmin ? "Total Employees" : "Role Coworkers",
      value: roleEmployees.length,
      info: isAdmin
        ? "Count of employee records currently available in the system."
        : "Employees assigned to the same role as your account.",
    },
    {
      label: isAdmin ? "Total Content" : "Role Content",
      value: dashboardContent.length,
      info: isAdmin
        ? "Count of content records included in the dashboard data set."
        : "Content records assigned to your role, plus unassigned shared content.",
    },
    {
      label: "Finalized",
      value: finalized.length,
      info: "Content records with a document status of Finalized.",
    },
    {
      label: isAdmin ? "In Progress" : "Review Due",
      value: isAdmin ? inProgress.length : reviewDue.length,
      info: isAdmin
        ? "Content records currently marked with the in-progress document status."
        : "Role content whose next review date has already passed.",
    },
  ];

  const contentByStatus = [
    {
      name: "Created",
      value: dashboardContent.filter((c) => c.document_status === "Created").length,
    },
    { name: "In Progress", value: inProgress.length },
    { name: "Finalized", value: finalized.length },
    {
      name: "Archived",
      value: dashboardContent.filter((c) => c.document_status === "Archived").length,
    },
  ];

  const roleCounts = new Map<string, number>();
  for (const item of dashboardContent) {
    const role = item.job_position?.trim() || "unassigned";
    roleCounts.set(role, (roleCounts.get(role) ?? 0) + 1);
  }

  const contentByRole = Array.from(roleCounts.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);

  const pieColors = ["#497728", "#1B2A4A", "#C9A84C", "#9CA3AF"];

  return (
    <>
      {!isAdmin ? (
        <div className="mb-6 animate-fade-in-down rounded-lg border-l-4 border-l-hanover-green border-y border-r border-border bg-card px-5 py-4 shadow-sm">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-foreground">
              {formatRoleLabel(userRole)} Dashboard View
            </h2>
            <InfoPopover title="Role dashboard">
              This view is customized to content assigned to your role and unassigned shared
              content.
            </InfoPopover>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Showing {dashboardContent.length} content records relevant to your role.
          </p>
        </div>
      ) : null}

      <div className="mb-8 grid grid-cols-2 gap-4 stagger-children md:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="hover-lift rounded-lg border border-border border-t-4 border-t-hanover-green bg-card p-4 shadow-sm hover:shadow-md hover:border-t-hanover-green/90 sm:p-5"
          >
            <div className="text-3xl font-bold tracking-tight text-foreground">{stat.value}</div>
            <div className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
              <span>{stat.label}</span>
              <InfoPopover title={stat.label}>{stat.info}</InfoPopover>
            </div>
          </div>
        ))}
      </div>

      <div className="mb-6 grid gap-5 lg:grid-cols-2">
        <div className="hover-lift rounded-lg border border-border bg-card p-6 shadow-sm hover:shadow-md">
          <div className="mb-4 flex items-center gap-2">
            <h2 className="text-lg font-semibold text-foreground">Content By Status</h2>
            <InfoPopover title="Content By Status">
              Distribution of content records across Created, In Progress, Finalized, and Archived
              document statuses.
            </InfoPopover>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={contentByStatus}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={3}
                >
                  {contentByStatus.map((entry, index) => (
                    <Cell key={entry.name} fill={pieColors[index % pieColors.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={TOOLTIP_STYLE} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 flex flex-wrap gap-3 text-xs">
            {contentByStatus.map((entry, index) => (
              <div key={entry.name} className="flex items-center gap-2 text-muted-foreground">
                <span
                  className="inline-block h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: pieColors[index % pieColors.length] }}
                />
                <span>
                  {entry.name}: {entry.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="hover-lift rounded-lg border border-border bg-card p-6 shadow-sm hover:shadow-md">
          <div className="mb-4 flex items-center gap-2">
            <h2 className="text-lg font-semibold text-foreground">Top Roles By Content</h2>
            <InfoPopover title="Top Roles By Content">
              The six job positions with the most associated content records. Records without a job
              position are grouped as unassigned.
            </InfoPopover>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={contentByRole} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
                <CartesianGrid vertical={false} stroke="var(--color-border)" />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }}
                />
                <YAxis
                  allowDecimals={false}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }}
                />
                <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: "var(--color-muted)" }} />
                <Bar dataKey="value" fill="#1B2A4A" radius={[4, 4, 0, 0]} barSize={42} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <DashboardReports content={dashboardContent} auditEvents={auditEvents} />

      <div className="grid gap-6 md:grid-cols-2">
        <div className="hover-lift overflow-x-auto rounded-lg border border-border bg-card p-6 shadow-sm hover:shadow-md">
          <h2 className="mb-4 text-lg font-semibold text-foreground">Employees</h2>
          {employees.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">No employees yet.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-2 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Code
                  </th>
                  <th className="px-2 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Name
                  </th>
                  <th className="px-2 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Job
                  </th>
                </tr>
              </thead>
              <tbody>
                {employees.slice(0, 6).map((emp) => (
                  <tr
                    key={emp.id}
                    className="border-b border-border transition-colors duration-150 last:border-b-0 hover:bg-muted/50"
                  >
                    <td className="px-2 py-3 font-mono text-xs text-muted-foreground">
                      {emp.employee_code ?? "—"}
                    </td>
                    <td className="px-2 py-3">
                      <Link
                        to={`/employees/${emp.id}`}
                        className="font-medium text-hanover-green transition-colors duration-150 hover:text-hanover-green/80 hover:underline underline-offset-2"
                      >
                        {emp.name}
                      </Link>
                    </td>
                    <td className="px-2 py-3 text-muted-foreground">{emp.job_desc ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="hover-lift overflow-x-auto rounded-lg border border-border bg-card p-6 shadow-sm hover:shadow-md">
          <h2 className="mb-4 text-lg font-semibold text-foreground">Recent Content</h2>
          {dashboardContent.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">No content yet.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-2 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    File
                  </th>
                  <th className="px-2 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Owner
                  </th>
                  <th className="px-2 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Tags
                  </th>
                  <th className="px-2 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {dashboardContent.slice(0, 6).map((item) => (
                  <tr
                    key={item.fileID}
                    className="border-b border-border transition-colors duration-150 last:border-b-0 hover:bg-muted/50"
                  >
                    <td className="px-2 py-3">
                      <Link
                        to={`/hero/content/${item.fileID}/edit`}
                        className="font-medium text-hanover-green transition-colors duration-150 hover:text-hanover-green/80 hover:underline underline-offset-2"
                      >
                        {item.filename ?? item.fileID}
                      </Link>
                    </td>
                    <td className="px-2 py-3 text-muted-foreground">
                      {item.owner?.name ?? "Unassigned"}
                    </td>
                    <td className="px-2 py-3">
                      {item.content_tags && item.content_tags.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {item.content_tags.map((ct) => (
                            <span
                              key={ct.tag.id}
                              className="inline-flex items-center rounded-full bg-hanover-green/10 px-2 py-0.5 text-xs font-medium text-hanover-green ring-1 ring-hanover-green/30 transition-colors hover:bg-hanover-green/15"
                            >
                              {ct.tag.name}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-2 py-3">
                      <span
                        className={`inline-block rounded px-2 py-0.5 text-xs font-semibold transition-colors ${getStatusBadge(item.document_status)}`}
                      >
                        {item.document_status ?? "—"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
}

function DashboardPage() {
  const [tab, setTab] = useState<DashboardTab>("overview");

  const access = trpc.user.myAccess.useQuery();
  const isAdmin = access.data?.role === "admin";
  const activeTab: DashboardTab = tab === "metrics" && !isAdmin ? "overview" : tab;

  const employees = trpc.employee.list.useQuery({}, { enabled: activeTab === "overview" });
  const allContent = trpc.content.list.useQuery({}, { enabled: activeTab === "overview" });

  const isLoading = activeTab === "overview" && (employees.isLoading || allContent.isLoading);
  const loadError = activeTab === "overview" ? (employees.error ?? allContent.error) : null;

  const auditRecent = trpc.audit.getRecent.useQuery(undefined, {
    enabled: activeTab === "overview" && isAdmin,
    refetchInterval: 30000,
  });

  const tabs: { key: DashboardTab; label: string; icon: typeof LayoutGrid }[] = [
    { key: "overview", label: "Overview", icon: LayoutGrid },
    ...(isAdmin ? [{ key: "metrics" as const, label: "Metrics", icon: Activity }] : []),
  ];

  return (
    <div className="min-h-screen bg-muted">
      <div className="py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-6 animate-fade-in-down">
            <h1 className="flex items-center gap-3 text-3xl font-bold tracking-tight text-foreground">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-hanover-green/10">
                <LayoutGrid className="h-6 w-6 text-hanover-green" />
              </span>
              Dashboard
            </h1>
            <p className="mt-1 text-muted-foreground">
              {activeTab === "metrics"
                ? "System and document activity metrics"
                : "Overview of employees, content, and activity trends"}
            </p>
          </div>

          {tabs.length > 1 && (
            <div className="mb-6 flex flex-wrap items-center gap-2">
              {tabs.map((t) => {
                const Icon = t.icon;
                const isActive = activeTab === t.key;
                return (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => setTab(t.key)}
                    className={`flex items-center gap-2 rounded-md px-4 py-1.5 text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hanover-green/40 focus-visible:ring-offset-2 ${
                      isActive
                        ? "bg-hanover-deepblue text-white shadow-sm shadow-hanover-deepblue/20"
                        : "border border-border bg-card text-muted-foreground hover:text-foreground hover:border-foreground/25 hover:bg-muted/50"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {t.label}
                  </button>
                );
              })}
            </div>
          )}

          {activeTab === "metrics" ? (
            <div className="animate-fade-in">
              <MetricsView />
            </div>
          ) : isLoading ? (
            <div className="flex animate-fade-in items-center justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-hanover-green" />
              <span className="ml-2 text-muted-foreground">Loading dashboard...</span>
            </div>
          ) : loadError ? (
            <div className="mx-auto max-w-lg animate-fade-in-up py-16 text-center">
              <p className="font-medium text-red-600">Could not load dashboard data.</p>
              <p className="mt-2 break-words text-sm text-muted-foreground">
                {loadError instanceof Error ? loadError.message : String(loadError)}
              </p>
            </div>
          ) : (
            <div className="animate-fade-in">
              <DashboardLoaded
                employees={employees.data ?? []}
                allContent={allContent.data ?? []}
                auditEvents={auditRecent.data ?? []}
                isAdmin={isAdmin}
                userRole={access.data?.role}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
