import { Loader2, Plus, Search, Users } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";
import { trpc } from "@/lib/trpc";

function EmployeesPage() {
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("");

  const employees = trpc.employee.list.useQuery({ search, department: department || undefined });
  const departments = trpc.employee.departments.useQuery();

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      <div className="py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="flex items-center gap-3 text-3xl font-bold text-foreground">
                <Users className="h-8 w-8 text-hanover-green" />
                Employees
              </h1>
              <p className="mt-1 text-muted-foreground">Manage your team directory</p>
            </div>
            <Link
              to="/employees/new"
              className="flex items-center gap-2 rounded bg-hanover-green px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-hanover-green/90"
            >
              <Plus className="h-4 w-4" />
              Add Employee
            </Link>
          </div>

          {/* Filters */}
          <div className="mb-6 flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by name, email, or title..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded border border-border bg-white py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-hanover-green"
              />
            </div>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="rounded border border-border bg-white px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-hanover-green"
            >
              <option value="">All Departments</option>
              {departments.data?.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded bg-white shadow-sm">
            {employees.isLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-6 w-6 animate-spin text-hanover-green" />
                <span className="ml-2 text-muted-foreground">Loading employees...</span>
              </div>
            ) : employees.isError ? (
              <div className="py-16 text-center text-red-600">
                Failed to load employees. Is the API running?
              </div>
            ) : employees.data?.length === 0 ? (
              <div className="py-16 text-center text-muted-foreground">No employees found.</div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-[#F9FAFB]">
                    <th className="px-4 py-3 text-left font-semibold text-foreground">Name</th>
                    <th className="px-4 py-3 text-left font-semibold text-foreground">Email</th>
                    <th className="px-4 py-3 text-left font-semibold text-foreground">Title</th>
                    <th className="px-4 py-3 text-left font-semibold text-foreground">
                      Department
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-foreground">Content</th>
                    <th className="px-4 py-3 text-left font-semibold text-foreground">Hired</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.data?.map((emp) => (
                    <EmployeeRow key={emp.id} emp={emp} />
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

interface EmployeeRowProps {
  emp: {
    id: string;
    name: string;
    email: string;
    title: string | null;
    department: string | null;
    hired_at: string | null;
    _count: { contents: number };
  };
}

function EmployeeRow({ emp }: EmployeeRowProps) {
  return (
    <tr className="border-b border-border transition-colors hover:bg-[#F9FAFB]">
      <td className="px-4 py-3 font-medium text-foreground">
        <Link to={`/employees/${emp.id}`} className="text-hanover-green hover:underline">
          {emp.name}
        </Link>
      </td>
      <td className="px-4 py-3 text-muted-foreground">{emp.email}</td>
      <td className="px-4 py-3 text-muted-foreground">{emp.title ?? "—"}</td>
      <td className="px-4 py-3">
        {emp.department ? (
          <span className="rounded bg-hanover-green/10 px-2 py-0.5 text-xs font-medium text-hanover-green">
            {emp.department}
          </span>
        ) : (
          "—"
        )}
      </td>
      <td className="px-4 py-3 text-muted-foreground">
        {emp._count.contents} item{emp._count.contents !== 1 ? "s" : ""}
      </td>
      <td className="px-4 py-3 text-muted-foreground">
        {emp.hired_at ? new Date(emp.hired_at).toLocaleDateString() : "—"}
      </td>
    </tr>
  );
}

export default EmployeesPage;
