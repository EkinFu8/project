import { ArrowLeft, Loader2, Mail } from "lucide-react";
import { Link, useParams } from "react-router";
import { trpc } from "@/lib/trpc.ts";

function EmployeeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const q = trpc.employee.getById.useQuery({ id: id! }, { enabled: Boolean(id) });

  if (q.isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted">
        <Loader2 className="h-6 w-6 animate-spin text-hanover-green" />
        <span className="ml-2 text-muted-foreground">Loading profile...</span>
      </div>
    );
  }

  if (q.isError || !q.data) {
    return (
      <div className="min-h-screen bg-muted py-12">
        <div className="mx-auto max-w-[640px] px-4">
          <Link
            to="/employees"
            className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to coworkers
          </Link>
          <div className="rounded border border-red-200 bg-red-50 py-12 text-center text-sm text-red-700">
            Coworker not found.
          </div>
        </div>
      </div>
    );
  }

  const e = q.data;
  const mailHref = `mailto:${encodeURIComponent(e.email)}?subject=${encodeURIComponent("Hello from Hanover")}`;

  return (
    <div className="min-h-screen bg-muted">
      <div className="py-12">
        <div className="mx-auto max-w-[640px] px-4">
          <Link
            to="/employees"
            className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to coworkers
          </Link>

          <h1 className="mb-2 text-2xl font-bold text-foreground">{e.name}</h1>
          <p className="mb-4 text-sm text-muted-foreground">{e.job_desc ?? "—"}</p>

          <div className="mb-6 rounded-lg border border-hanover-green/30 bg-hanover-green/5 p-5">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Reach out
            </p>
            <a
              href={mailHref}
              className="inline-flex items-center gap-2 break-all text-base font-medium text-hanover-green hover:underline"
            >
              <Mail className="h-5 w-5 shrink-0" aria-hidden />
              {e.email}
            </a>
          </div>

          <div className="space-y-4 rounded bg-card p-8 shadow-md text-sm">
            <div className="flex justify-between gap-4 border-b border-border pb-3">
              <span className="text-muted-foreground">Employee code</span>
              <span className="font-medium text-foreground">{e.employee_code ?? "—"}</span>
            </div>
            <div className="flex justify-between gap-4 border-b border-border pb-3">
              <span className="text-muted-foreground">Job role</span>
              <span className="font-medium text-foreground">{e.role}</span>
            </div>
          </div>

          {e.owned_content.length > 0 ? (
            <div className="mt-8">
              <h2 className="mb-3 text-lg font-semibold text-foreground">Content they own</h2>
              <ul className="divide-y divide-border rounded border border-border bg-card text-sm">
                {e.owned_content.map((c) => (
                  <li key={c.fileID} className="flex justify-between gap-3 px-4 py-3">
                    <span className="font-medium text-foreground">{c.filename ?? c.fileID}</span>
                    <span className="text-muted-foreground">{c.document_status ?? "—"}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default EmployeeDetailPage;
