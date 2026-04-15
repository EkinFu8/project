import { Loader2 } from "lucide-react";
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

export function MetricsView() {
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
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-hanover-green" />
        <span className="ml-2 text-muted-foreground">Loading metrics...</span>
      </div>
    );
  }

  if (!metrics.data) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <p className="font-medium text-red-600">Failed to load metrics.</p>
      </div>
    );
  }

  const errorRate = metrics.data.errorRate ?? 0;

  return (
    <>
      {/* METRICS */}
      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="rounded border border-border bg-card p-4 shadow-sm">
          <p className="text-sm text-muted-foreground">Requests</p>
          <p className="text-xl font-bold text-foreground">{metrics.data.totalRequests ?? 0}</p>
        </div>

        <div className="rounded border border-border bg-card p-4 shadow-sm">
          <p className="text-sm text-muted-foreground">Errors</p>
          <p className="text-xl font-bold text-red-600">{metrics.data.errors ?? 0}</p>
        </div>

        <div className="rounded border border-border bg-card p-4 shadow-sm">
          <p className="text-sm text-muted-foreground">Active Users</p>
          <p className="text-xl font-bold text-hanover-green">{metrics.data.activeUsers ?? 0}</p>
        </div>

        <div className="rounded border border-border bg-card p-4 shadow-sm">
          <p className="text-sm text-muted-foreground">Error Rate</p>
          <p className="text-xl font-bold text-foreground">{(errorRate * 100).toFixed(2)}%</p>
        </div>
      </div>

      {/* AUDIT SUMMARY */}
      <div className="mb-8">
        <h2 className="mb-3 text-xl font-semibold text-foreground">Document Activity</h2>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="rounded border border-border bg-card p-4 shadow-sm">
            <p className="text-sm text-muted-foreground">Uploads</p>
            <p className="text-xl font-bold text-foreground">{auditSummary.data?.uploads ?? 0}</p>
          </div>

          <div className="rounded border border-border bg-card p-4 shadow-sm">
            <p className="text-sm text-muted-foreground">Downloads</p>
            <p className="text-xl font-bold text-foreground">{auditSummary.data?.downloads ?? 0}</p>
          </div>

          <div className="rounded border border-border bg-card p-4 shadow-sm">
            <p className="text-sm text-muted-foreground">Edits</p>
            <p className="text-xl font-bold text-foreground">{auditSummary.data?.edits ?? 0}</p>
          </div>

          <div className="rounded border border-border bg-card p-4 shadow-sm">
            <p className="text-sm text-muted-foreground">Deletes</p>
            <p className="text-xl font-bold text-foreground">{auditSummary.data?.deletes ?? 0}</p>
          </div>
        </div>
      </div>

      {/* RECENT AUDIT LOG */}
      <div className="mb-8">
        <h2 className="mb-3 text-xl font-semibold text-foreground">Recent Activity</h2>

        <div className="divide-y divide-border rounded border border-border bg-card shadow-sm">
          {auditRecent.data?.slice(0, 10).map((a) => (
            <div
              key={a.id}
              className="flex flex-col gap-1 p-3 text-sm md:flex-row md:justify-between"
            >
              <div>
                <span className="font-medium text-foreground">
                  {a.user?.name ?? "Unknown User"}
                </span>{" "}
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
        <h2 className="mb-3 text-xl font-semibold text-foreground">System Performance</h2>

        <div className="divide-y divide-border rounded border border-border bg-card shadow-sm">
          <div className="grid grid-cols-[1fr_80px_80px_100px] gap-4 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            <span>Route</span>
            <span>Method</span>
            <span className="text-right">Status</span>
            <span className="text-right">Duration</span>
          </div>
          {recentMetrics.data?.slice(0, 10).map((r) => (
            <div
              key={r.id}
              className="grid grid-cols-[1fr_80px_80px_100px] items-center gap-4 p-3 text-sm"
            >
              <span className="truncate font-mono text-foreground">{r.route}</span>
              <span className="uppercase text-muted-foreground">{r.method}</span>
              <span
                className={`text-right font-medium ${
                  r.status === "OK" ? "text-hanover-green" : "text-red-600"
                }`}
              >
                {r.status}
              </span>
              <span className="text-right text-muted-foreground">{r.durationMs}ms</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
