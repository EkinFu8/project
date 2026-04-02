import { LayoutGrid, Loader2 } from "lucide-react";
import { Link } from "react-router";
import { trpc } from "@/lib/trpc";

function getStatusBadge(status: string) {
  switch (status) {
    case "published":
      return "bg-hanover-green text-white";
    case "draft":
      return "bg-[#C9A84C] text-white";
    default:
      return "bg-muted text-muted-foreground";
  }
}

function DashboardPage() {
  const employees = trpc.employee.list.useQuery({});
  const allContent = trpc.content.list.useQuery({});
  const published = trpc.content.list.useQuery({ status: "published" });
  const drafts = trpc.content.list.useQuery({ status: "draft" });
  const departments = trpc.employee.departments.useQuery();

  const isLoading = employees.isLoading || allContent.isLoading;

  const stats = [
    { label: "Total Employees", value: employees.data?.length ?? "—" },
    { label: "Total Content", value: allContent.data?.length ?? "—" },
    { label: "Published", value: published.data?.length ?? "—" },
    { label: "Drafts", value: drafts.data?.length ?? "—" },
  ];

  // Count employees per department for the bar chart
  const deptCounts = (departments.data ?? []).map((dept) => ({
    dept,
    count: employees.data?.filter((e) => e.department === dept).length ?? 0,
  }));
  const maxCount = Math.max(...deptCounts.map((d) => d.count), 1);

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      <div className="py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="flex items-center gap-3 text-3xl font-bold text-foreground">
              <LayoutGrid className="h-8 w-8 text-hanover-green" />
              Dashboard
            </h1>
            <p className="mt-1 text-muted-foreground">
              Overview of employees and content
            </p>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-hanover-green" />
              <span className="ml-2 text-muted-foreground">Loading dashboard...</span>
            </div>
          ) : (
            <>
              {/* Stats Cards */}
              <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
                {stats.map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded border-t-4 border-t-hanover-green bg-white p-6 shadow-sm"
                  >
                    <div className="text-3xl font-bold text-foreground">{stat.value}</div>
                    <div className="mt-1 text-sm text-muted-foreground">{stat.label}</div>
                  </div>
                ))}
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                {/* Department Bar Chart */}
                <div className="rounded bg-white p-6 shadow-sm">
                  <h2 className="mb-4 text-lg font-semibold text-foreground">
                    Employees by Department
                  </h2>
                  {deptCounts.length === 0 ? (
                    <p className="py-8 text-center text-sm text-muted-foreground">
                      No department data yet.
                    </p>
                  ) : (
                    <div className="flex h-48 items-end justify-around gap-3">
                      {deptCounts.map(({ dept, count }) => (
                        <div key={dept} className="flex flex-col items-center gap-1">
                          <span className="text-xs font-medium text-foreground">{count}</span>
                          <div
                            className="w-14 rounded-t bg-hanover-green transition-all"
                            style={{ height: `${(count / maxCount) * 100}%`, minHeight: 8 }}
                          />
                          <span className="max-w-[60px] truncate text-[11px] text-muted-foreground">
                            {dept}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Recent Content Table */}
                <div className="overflow-x-auto rounded bg-white p-6 shadow-sm">
                  <h2 className="mb-4 text-lg font-semibold text-foreground">
                    Recent Content
                  </h2>
                  {(allContent.data?.length ?? 0) === 0 ? (
                    <p className="py-8 text-center text-sm text-muted-foreground">
                      No content yet.
                    </p>
                  ) : (
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="px-2 py-3 text-left font-semibold text-foreground">
                            Title
                          </th>
                          <th className="px-2 py-3 text-left font-semibold text-foreground">
                            Author
                          </th>
                          <th className="px-2 py-3 text-left font-semibold text-foreground">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {allContent.data?.slice(0, 6).map((item) => (
                          <tr key={item.id} className="border-b border-border">
                            <td className="px-2 py-3">
                              <Link
                                to={`/content/${item.id}/edit`}
                                className="text-hanover-green hover:underline"
                              >
                                {item.title}
                              </Link>
                            </td>
                            <td className="px-2 py-3 text-muted-foreground">
                              {item.employee?.name ?? "Unassigned"}
                            </td>
                            <td className="px-2 py-3">
                              <span
                                className={`rounded px-2 py-0.5 text-xs font-semibold ${getStatusBadge(item.status)}`}
                              >
                                {item.status}
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
          )}
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
