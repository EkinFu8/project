import { Loader2, Mail, Search, Users } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";
import { trpc } from "@/lib/trpc.ts";

function EmployeesPage() {
  const [search, setSearch] = useState("");

  const coworkers = trpc.employee.list.useQuery({ search, coworkersOnly: true });

  return (
    <div className="min-h-screen bg-muted">
      <div className="py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="flex items-center gap-3 text-3xl font-bold text-foreground">
              <Users className="h-8 w-8 text-hanover-green" />
              Coworkers
            </h1>
            <p className="mt-1 text-muted-foreground">
              People on the employee portal with you — use email to reach out.
            </p>
          </div>

          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by name, email, code, or job description..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded border border-border bg-background py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-hanover-green"
              />
            </div>
          </div>

          <div className="overflow-x-auto rounded bg-card shadow-sm">
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
            ) : coworkers.data?.length === 0 ? (
              <div className="py-16 text-center text-muted-foreground">
                No coworkers match your search.
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/80">
                    <th className="px-4 py-3 text-left font-semibold text-foreground">Name</th>
                    <th className="px-4 py-3 text-left font-semibold text-foreground">Email</th>
                    <th className="px-4 py-3 text-left font-semibold text-foreground">Code</th>
                    <th className="px-4 py-3 text-left font-semibold text-foreground">Job</th>
                    <th className="px-4 py-3 text-left font-semibold text-foreground">Role</th>
                  </tr>
                </thead>
                <tbody>
                  {coworkers.data?.map((emp) => (
                    <tr
                      key={emp.id}
                      className="border-b border-border transition-colors hover:bg-muted/80"
                    >
                      <td className="px-4 py-3 font-medium text-foreground">
                        <Link
                          to={`/employees/${emp.id}`}
                          className="text-hanover-green hover:underline"
                        >
                          {emp.name}
                        </Link>
                      </td>
                      <td className="max-w-[14rem] px-4 py-3">
                        <a
                          href={`mailto:${encodeURIComponent(emp.email)}`}
                          className="inline-flex items-center gap-1 break-all text-hanover-green hover:underline"
                        >
                          <Mail className="h-3.5 w-3.5 shrink-0 opacity-80" aria-hidden />
                          {emp.email}
                        </a>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                        {emp.employee_code ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{emp.job_desc ?? "—"}</td>
                      <td className="px-4 py-3 text-muted-foreground">{emp.role}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default EmployeesPage;
