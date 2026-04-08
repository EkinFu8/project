import { LayoutGrid, Loader2 } from "lucide-react";
import { Link } from "react-router";
import type { RouterOutputs } from "@/lib/trpc.ts";
import { trpc } from "@/lib/trpc.ts";

type EmployeeRow = RouterOutputs["employee"]["list"][number];
type ContentRow = RouterOutputs["content"]["list"][number];

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

function DashboardLoaded({
  employees,
  allContent,
}: {
  employees: EmployeeRow[];
  allContent: ContentRow[];
}) {
  const finalized = allContent.filter((c) => c.document_status === "Finalized");
  const inProgress = allContent.filter((c) => c.document_status === "in-progress");

  const stats = [
    { label: "Total Employees", value: employees.length },
    { label: "Total Content", value: allContent.length },
    { label: "Finalized", value: finalized.length },
    { label: "In Progress", value: inProgress.length },
  ];

  return (
    <>
      <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded border-t-4 border-t-hanover-green bg-card p-6 shadow-sm"
          >
            <div className="text-3xl font-bold text-foreground">{stat.value}</div>
            <div className="mt-1 text-sm text-muted-foreground">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="overflow-x-auto rounded bg-card p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-foreground">Employees</h2>
          {employees.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">No employees yet.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-2 py-3 text-left font-semibold text-foreground">Code</th>
                  <th className="px-2 py-3 text-left font-semibold text-foreground">Name</th>
                  <th className="px-2 py-3 text-left font-semibold text-foreground">Job</th>
                </tr>
              </thead>
              <tbody>
                {employees.slice(0, 6).map((emp) => (
                  <tr key={emp.id} className="border-b border-border">
                    <td className="px-2 py-3 font-mono text-xs text-muted-foreground">
                      {emp.employee_code ?? "—"}
                    </td>
                    <td className="px-2 py-3">
                      <Link to={`/employees/${emp.id}`} className="text-hanover-green hover:underline">
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

        <div className="overflow-x-auto rounded bg-card p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-foreground">Recent Content</h2>
          {allContent.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">No content yet.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-2 py-3 text-left font-semibold text-foreground">File</th>
                  <th className="px-2 py-3 text-left font-semibold text-foreground">Owner</th>
                  <th className="px-2 py-3 text-left font-semibold text-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {allContent.slice(0, 6).map((item) => (
                  <tr key={item.fileID} className="border-b border-border">
                    <td className="px-2 py-3">
                      <Link
                        to={`/hero/content/${item.fileID}/edit`}
                        className="text-hanover-green hover:underline"
                      >
                        {item.filename ?? item.fileID}
                      </Link>
                    </td>
                    <td className="px-2 py-3 text-muted-foreground">
                      {item.owner?.name ?? "Unassigned"}
                    </td>
                    <td className="px-2 py-3">
                      <span
                        className={`rounded px-2 py-0.5 text-xs font-semibold ${getStatusBadge(item.document_status)}`}
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
  const employees = trpc.employee.list.useQuery({});
  const allContent = trpc.content.list.useQuery({});

  const isLoading = employees.isLoading || allContent.isLoading;
  const loadError = employees.error ?? allContent.error;

  return (
    <div className="min-h-screen bg-muted">
      <div className="py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="flex items-center gap-3 text-3xl font-bold text-foreground">
              <LayoutGrid className="h-8 w-8 text-hanover-green" />
              Dashboard
            </h1>
            <p className="mt-1 text-muted-foreground">Overview of employees and content</p>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-hanover-green" />
              <span className="ml-2 text-muted-foreground">Loading dashboard...</span>
            </div>
          ) : loadError ? (
            <div className="mx-auto max-w-lg py-16 text-center">
              <p className="font-medium text-red-600">Could not load dashboard data.</p>
              <p className="mt-2 break-words text-sm text-muted-foreground">
                {loadError instanceof Error ? loadError.message : String(loadError)}
              </p>
            </div>
          ) : (
            <DashboardLoaded employees={employees.data ?? []} allContent={allContent.data ?? []} />
          )}
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
