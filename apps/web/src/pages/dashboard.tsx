const stats = [
  { label: "Total Documents", value: 128 },
  { label: "Expiring Soon (30 days)", value: 14 },
  { label: "Active Users", value: 47 },
  { label: "Pending Reviews", value: 9 },
];

const barHeights = ["40%", "65%", "50%", "80%", "60%", "75%"];

const tableData = [
  {
    name: "Underwriting Manual v3.2",
    owner: "John Smith",
    role: "Underwriter",
    expiration: "2026-04-15",
    status: "Expiring Soon",
  },
  {
    name: "Claims Processing Guide",
    owner: "Sarah Johnson",
    role: "Business Analyst",
    expiration: "2026-06-30",
    status: "Active",
  },
  {
    name: "Risk Assessment Template",
    owner: "Mike Chen",
    role: "Underwriter",
    expiration: "2026-03-01",
    status: "Expired",
  },
  {
    name: "Policy Renewal Checklist",
    owner: "Emily Davis",
    role: "Admin",
    expiration: "2026-08-15",
    status: "Active",
  },
  {
    name: "Compliance Audit Report",
    owner: "Tom Wilson",
    role: "Business Analyst",
    expiration: "2026-05-20",
    status: "Expiring Soon",
  },
];

function getStatusBadgeClasses(status: string): string {
  switch (status) {
    case "Active":
      return "bg-[#4a6741] text-white";
    case "Expiring Soon":
      return "bg-[#C9A84C] text-white";
    case "Expired":
      return "bg-red-600 text-white";
    default:
      return "bg-muted text-muted-foreground";
  }
}

function DashboardPage() {
  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      <div className="py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Stats Cards */}
          <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded border-t-4 border-t-[#4a6741] bg-white p-6 shadow-sm"
              >
                <div className="text-3xl font-bold text-foreground">{stat.value}</div>
                <div className="mt-1 text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Chart and Table Section */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Bar Chart */}
            <div className="rounded bg-white p-6 shadow-sm">
              <div className="flex h-48 items-end justify-around gap-2">
                {barHeights.map((height, index) => (
                  <div
                    key={index}
                    className="w-12 rounded-t bg-[#4a6741]"
                    style={{ height }}
                  />
                ))}
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded bg-white p-6 shadow-sm">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="py-3 px-2 text-left font-semibold text-foreground">
                      Document Name
                    </th>
                    <th className="py-3 px-2 text-left font-semibold text-foreground">
                      Owner
                    </th>
                    <th className="py-3 px-2 text-left font-semibold text-foreground">
                      Role
                    </th>
                    <th className="py-3 px-2 text-left font-semibold text-foreground">
                      Expiration Date
                    </th>
                    <th className="py-3 px-2 text-left font-semibold text-foreground">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {tableData.map((row, index) => (
                    <tr key={index} className="border-b border-border">
                      <td className="py-3 px-2 text-foreground">{row.name}</td>
                      <td className="py-3 px-2 text-muted-foreground">{row.owner}</td>
                      <td className="py-3 px-2 text-muted-foreground">{row.role}</td>
                      <td className="py-3 px-2 text-muted-foreground">{row.expiration}</td>
                      <td className="py-3 px-2">
                        <span
                          className={`rounded px-2 py-1 text-xs font-semibold ${getStatusBadgeClasses(row.status)}`}
                        >
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
