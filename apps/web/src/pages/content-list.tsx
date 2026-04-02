import { FileText, Plus, Search, Loader2 } from "lucide-react";
import { useState } from "react";
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

function ContentListPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"draft" | "published" | "">("");

  const contents = trpc.content.list.useQuery({
    search,
    status: status || undefined,
  });

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      <div className="py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="flex items-center gap-3 text-3xl font-bold text-foreground">
                <FileText className="h-8 w-8 text-hanover-green" />
                Content
              </h1>
              <p className="mt-1 text-muted-foreground">
                Documents, guides, and knowledge base articles
              </p>
            </div>
            <Link
              to="/content/new"
              className="flex items-center gap-2 rounded bg-hanover-green px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-hanover-green/90"
            >
              <Plus className="h-4 w-4" />
              New Content
            </Link>
          </div>

          {/* Filters */}
          <div className="mb-6 flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by title or body..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded border border-border bg-white py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-hanover-green"
              />
            </div>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as typeof status)}
              className="rounded border border-border bg-white px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-hanover-green"
            >
              <option value="">All Statuses</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
          </div>

          {/* Cards */}
          {contents.isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-hanover-green" />
              <span className="ml-2 text-muted-foreground">Loading content...</span>
            </div>
          ) : contents.isError ? (
            <div className="py-16 text-center text-red-600">
              Failed to load content. Is the API running?
            </div>
          ) : contents.data?.length === 0 ? (
            <div className="py-16 text-center text-muted-foreground">
              No content found.
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {contents.data?.map((item) => (
                <Link
                  key={item.id}
                  to={`/content/${item.id}/edit`}
                  className="group rounded border border-border bg-white p-5 shadow-sm transition-all hover:border-hanover-green hover:shadow-md"
                >
                  <div className="mb-3 flex items-start justify-between">
                    <h3 className="text-base font-semibold text-foreground group-hover:text-hanover-green">
                      {item.title}
                    </h3>
                    <span
                      className={`ml-2 shrink-0 rounded px-2 py-0.5 text-xs font-semibold ${getStatusBadge(item.status)}`}
                    >
                      {item.status}
                    </span>
                  </div>
                  <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">
                    {item.body}
                  </p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>
                      {item.employee ? item.employee.name : "Unassigned"}
                    </span>
                    <span>{new Date(item.created_at).toLocaleDateString()}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ContentListPage;
