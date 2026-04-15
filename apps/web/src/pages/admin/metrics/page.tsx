import { trpc } from "@/lib/trpc";

function formatAction(action: string) {
  const map: Record<string, string> = {
    upload: "uploaded",
    download: "downloaded",
    edit: "edited",
    delete: "deleted",
  };

  return map[action] ?? action;
}

export default function MetricsPage() {
  const metrics = trpc.metrics.getOverview.useQuery(undefined, {
    refetchInterval: 5000,
  });

  const recentMetrics = trpc.metrics.getRecent.useQuery(undefined, {
    refetchInterval: 5000,
  });

  const auditSummary = trpc.audit.getSummary.useQuery(undefined, {
    refetchInterval: 5000,
  });

  const auditRecent = trpc.audit.getRecent.useQuery(undefined, {
    refetchInterval: 5000,
  });

  if (metrics.isLoading || auditSummary.isLoading) {
    return <div className="p-6 text-foreground">Loading dashboard...</div>;
  }

  if (!metrics.data) {
    return <div className="p-6 text-red-500">Failed to load metrics</div>;
  }

  const errorRate = metrics.data.errorRate ?? 0;

  return (
    <div className="p-6 space-y-10 text-foreground">
      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Metrics + audit tracking for system & document activity
        </p>
      </div>

      {/* METRICS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 border rounded-lg bg-background">
          <p className="text-muted-foreground text-sm">Requests</p>
          <p className="text-xl font-bold">{metrics.data.totalRequests ?? 0}</p>
        </div>

        <div className="p-4 border rounded-lg bg-background">
          <p className="text-muted-foreground text-sm">Errors</p>
          <p className="text-xl font-bold text-red-500">{metrics.data.errors ?? 0}</p>
        </div>

        <div className="p-4 border rounded-lg bg-background">
          <p className="text-muted-foreground text-sm">Active Users</p>
          <p className="text-xl font-bold text-green-600">{metrics.data.activeUsers ?? 0}</p>
        </div>

        <div className="p-4 border rounded-lg bg-background">
          <p className="text-muted-foreground text-sm">Error Rate</p>
          <p className="text-xl font-bold">{(errorRate * 100).toFixed(2)}%</p>
        </div>
      </div>

      {/* AUDIT SUMMARY */}
      <div>
        <h2 className="text-xl font-semibold mb-3">Document Activity</h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 border rounded-lg bg-background">
            <p className="text-sm text-muted-foreground">Uploads</p>
            <p className="text-xl font-bold">{auditSummary.data?.uploads ?? 0}</p>
          </div>

          <div className="p-4 border rounded-lg bg-background">
            <p className="text-sm text-muted-foreground">Downloads</p>
            <p className="text-xl font-bold">{auditSummary.data?.downloads ?? 0}</p>
          </div>

          <div className="p-4 border rounded-lg bg-background">
            <p className="text-sm text-muted-foreground">Edits</p>
            <p className="text-xl font-bold">{auditSummary.data?.edits ?? 0}</p>
          </div>

          <div className="p-4 border rounded-lg bg-background">
            <p className="text-sm text-muted-foreground">Deletes</p>
            <p className="text-xl font-bold">{auditSummary.data?.deletes ?? 0}</p>
          </div>
        </div>
      </div>

      {/* RECENT AUDIT LOG */}
      <div>
        <h2 className="text-xl font-semibold mb-3">Recent Activity</h2>

        <div className="border rounded-lg bg-background divide-y">
          {auditRecent.data?.slice(0, 10).map((a) => (
            <div
              key={a.id}
              className="p-3 text-sm flex flex-col md:flex-row md:justify-between gap-1"
            >
              <div>
                <span className="font-medium">{a.user?.name ?? "Unknown User"}</span>{" "}
                <span className="text-muted-foreground">
                  {a.user?.employee_code ? `(${a.user.employee_code})` : ""}
                </span>{" "}
                {formatAction(a.action)}{" "}
                <span className="text-muted-foreground">{a.fileName ?? "a document"}</span>
              </div>

              <div className="text-xs text-muted-foreground md:text-right">
                {new Date(a.createdAt).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SYSTEM PERFORMANCE */}
      <div>
        <h2 className="text-xl font-semibold mb-3">System Performance</h2>

        <div className="border rounded-lg bg-background divide-y">
          {recentMetrics.data?.slice(0, 10).map((r) => (
            <div key={r.id} className="flex justify-between p-3 text-sm">
              <span className="font-mono">{r.route}</span>

              <span className="text-muted-foreground uppercase">{r.method}</span>

              <span>{r.status}</span>

              <span className="text-muted-foreground">{r.durationMs}ms</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
