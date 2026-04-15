import { trpc } from "@/lib/trpc";

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
                <h1 className="text-2xl font-bold">
                    Admin Dashboard
                </h1>
                <p className="text-muted-foreground">
                    Metrics + audit tracking for system & document activity
                </p>
            </div>

            {/* METRICS */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

                <div className="p-4 border rounded-lg bg-background">
                    <p className="text-muted-foreground text-sm">Requests</p>
                    <p className="text-xl font-bold">
                        {metrics.data.totalRequests ?? 0}
                    </p>
                </div>

                <div className="p-4 border rounded-lg bg-background">
                    <p className="text-muted-foreground text-sm">Errors</p>
                    <p className="text-xl font-bold text-red-500">
                        {metrics.data.errors ?? 0}
                    </p>
                </div>

                <div className="p-4 border rounded-lg bg-background">
                    <p className="text-muted-foreground text-sm">Active Users</p>
                    <p className="text-xl font-bold text-green-600">
                        {metrics.data.activeUsers ?? 0}
                    </p>
                </div>

                <div className="p-4 border rounded-lg bg-background">
                    <p className="text-muted-foreground text-sm">Error Rate</p>
                    <p className="text-xl font-bold">
                        {(errorRate * 100).toFixed(2)}%
                    </p>
                </div>
            </div>

            {/* AUDIT SUMMARY */}
            <div>
                <h2 className="text-xl font-semibold mb-3">
                    Document Activity
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

                    <div className="p-4 border rounded-lg bg-background">
                        <p className="text-sm text-muted-foreground">Uploads</p>
                        <p className="text-xl font-bold">
                            {auditSummary.data?.uploads ?? 0}
                        </p>
                    </div>

                    <div className="p-4 border rounded-lg bg-background">
                        <p className="text-sm text-muted-foreground">Downloads</p>
                        <p className="text-xl font-bold">
                            {auditSummary.data?.downloads ?? 0}
                        </p>
                    </div>

                    <div className="p-4 border rounded-lg bg-background">
                        <p className="text-sm text-muted-foreground">Edits</p>
                        <p className="text-xl font-bold">
                            {auditSummary.data?.edits ?? 0}
                        </p>
                    </div>

                    <div className="p-4 border rounded-lg bg-background">
                        <p className="text-sm text-muted-foreground">Deletes</p>
                        <p className="text-xl font-bold">
                            {auditSummary.data?.deletes ?? 0}
                        </p>
                    </div>
                </div>
            </div>

            {/* RECENT AUDIT LOG */}
            <div>
                <h2 className="text-xl font-semibold mb-3">
                    Recent Activity
                </h2>

                <div className="border rounded-lg bg-background">
                    {auditRecent.data?.slice(0, 10).map((a) => (
                        <div
                            key={a.id}
                            className="flex justify-between p-3 border-b text-sm"
                        >
                            <span>{a.action}</span>
                            <span className="text-muted-foreground">
                {a.fileName ?? "N/A"}
              </span>
                            <span className="text-muted-foreground">
                {new Date(a.createdAt).toLocaleString()}
              </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* SYSTEM PERFORMANCE */}
            <div>
                <h2 className="text-xl font-semibold mb-3">
                    System Performance
                </h2>

                <div className="border rounded-lg bg-background">
                    {recentMetrics.data?.slice(0, 10).map((r) => (
                        <div
                            key={r.id}
                            className="flex justify-between p-3 border-b text-sm"
                        >
                            <span>{r.route}</span>
                            <span className="text-muted-foreground">
                {r.method}
              </span>
                            <span>{r.status}</span>
                            <span className="text-muted-foreground">
                {r.durationMs}ms
              </span>
                        </div>
                    ))}
                </div>
            </div>

        </div>
    );
}