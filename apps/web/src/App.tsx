import { Button } from "@myapp/ui/components/button";
import { capitalize, formatDate } from "@myapp/utils";
import { useState } from "react";
import { trpc } from "./lib/trpc";

function App() {
  const [count, setCount] = useState(0);

  // tRPC health check — will show connection status
  const health = trpc.health.check.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
  });

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border px-6 py-4">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <h1 className="text-xl font-bold tracking-tight">myapp</h1>
          <span className="text-sm text-muted-foreground">user app</span>
        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto max-w-4xl px-6 py-12">
        <div className="space-y-12">
          {/* Hero */}
          <section className="text-center space-y-4">
            <h2 className="text-4xl font-bold tracking-tight">{capitalize("welcome")} to myapp</h2>
            <p className="text-lg text-muted-foreground">{formatDate(new Date())}</p>
          </section>

          {/* Stack status */}
          <section className="rounded-xl border border-border p-6 space-y-4">
            <h3 className="text-lg font-semibold">Stack Status</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <StatusCard label="Vite + React" status="ok" detail="Frontend running" />
              <StatusCard label="Tailwind v4" status="ok" detail="Styles loaded" />
              <StatusCard label="@myapp/ui" status="ok" detail="Shared components" />
              <StatusCard label="@myapp/utils" status="ok" detail="Shared utilities" />
              <StatusCard
                label="tRPC API"
                status={health.isLoading ? "loading" : health.isSuccess ? "ok" : "error"}
                detail={
                  health.isLoading
                    ? "Connecting..."
                    : health.isSuccess
                      ? `Connected — ${health.data.timestamp}`
                      : "Not connected (start API with pnpm dev)"
                }
              />
              <StatusCard label="Supabase" status="pending" detail="Requires supabase start" />
            </div>
          </section>

          {/* Interactive demo */}
          <section className="rounded-xl border border-border p-6 space-y-4">
            <h3 className="text-lg font-semibold">Interactive Demo</h3>
            <p className="text-muted-foreground">
              Shared Button component from{" "}
              <code className="rounded bg-muted px-1.5 py-0.5 text-sm">@myapp/ui</code>
            </p>
            <div className="flex flex-wrap gap-3">
              <Button onClick={() => setCount((c) => c + 1)}>Count: {count}</Button>
              <Button variant="secondary" onClick={() => setCount(0)}>
                Reset
              </Button>
              <Button variant="outline">Outline</Button>
              <Button variant="destructive">Destructive</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="link">Link</Button>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border px-6 py-4 text-center text-sm text-muted-foreground">
        myapp &middot; Vite + React + tRPC + Supabase + Tailwind v4
      </footer>
    </div>
  );
}

function StatusCard({
  label,
  status,
  detail,
}: {
  label: string;
  status: "ok" | "error" | "loading" | "pending";
  detail: string;
}) {
  const statusColors = {
    ok: "bg-green-500",
    error: "bg-red-500",
    loading: "bg-yellow-500 animate-pulse",
    pending: "bg-gray-400",
  };

  return (
    <div className="flex items-start gap-3 rounded-lg border border-border p-3">
      <div className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${statusColors[status]}`} />
      <div className="min-w-0">
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground truncate">{detail}</p>
      </div>
    </div>
  );
}

export default App;
