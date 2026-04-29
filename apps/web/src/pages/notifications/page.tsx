import { Bell, Clock3, FilePenLine, Loader2, UserRoundCog } from "lucide-react";
import { Link } from "react-router";
import type { RouterOutputs } from "@/lib/trpc.ts";
import { trpc } from "@/lib/trpc.ts";

type NotificationRow = RouterOutputs["notifications"]["myList"][number];

function formatDate(value: string | Date) {
  const date = value instanceof Date ? value : new Date(value);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function typeIcon(type: NotificationRow["type"]) {
  switch (type) {
    case "document-change":
      return <FilePenLine className="h-4 w-4 text-hanover-green" />;
    case "expiration":
      return <Clock3 className="h-4 w-4 text-[#C9A84C]" />;
    case "ownership-update":
      return <UserRoundCog className="h-4 w-4 text-hanover-deepblue" />;
    default:
      return <Bell className="h-4 w-4 text-muted-foreground" />;
  }
}

function typeLabel(type: NotificationRow["type"]) {
  switch (type) {
    case "document-change":
      return "Update";
    case "expiration":
      return "Review";
    case "ownership-update":
      return "Owner";
    default:
      return "Other";
  }
}

function NotificationsPage() {
  const list = trpc.notifications.myList.useQuery();

  if (list.isLoading) {
    return (
      <div className="flex min-h-[calc(100vh-2.75rem)] items-center justify-center bg-muted">
        <Loader2 className="h-8 w-8 animate-spin text-hanover-green" />
      </div>
    );
  }

  if (list.isError) {
    return (
      <div className="min-h-[calc(100vh-2.75rem)] bg-muted px-4 py-10">
        <div className="mx-auto max-w-5xl rounded border border-border bg-card p-6 text-card-foreground shadow-sm">
          <h1 className="text-xl font-semibold text-foreground">Notifications</h1>
          <p className="mt-3 font-medium text-red-600">Could not load notification data.</p>
          <p className="mt-2 break-words text-sm text-muted-foreground">
            {list.error instanceof Error ? list.error.message : String(list.error)}
          </p>
        </div>
      </div>
    );
  }

  const rows = list.data ?? [];

  return (
    <div className="min-h-[calc(100vh-2.75rem)] bg-muted px-4 py-10">
      <div className="mx-auto max-w-5xl">
        <h1 className="flex items-center gap-2 text-2xl font-bold text-foreground">
          <Bell className="h-6 w-6 text-hanover-green" />
          Notifications
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Edits, review dates, and owner changes for content that matches your role.
        </p>

        <div className="mt-6 overflow-x-auto rounded border border-border bg-card shadow-sm">
          {rows.length === 0 ? (
            <p className="px-6 py-10 text-center text-sm text-muted-foreground">
              Nothing to show right now.
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-4 py-3 text-left font-semibold text-foreground">Type</th>
                  <th className="px-4 py-3 text-left font-semibold text-foreground">Document</th>
                  <th className="px-4 py-3 text-left font-semibold text-foreground">Message</th>
                  <th className="px-4 py-3 text-left font-semibold text-foreground">Date</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((item) => (
                  <tr key={item.id} className="border-b border-border">
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-2 rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-foreground">
                        {typeIcon(item.type)}
                        {typeLabel(item.type)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {item.fileID ? (
                        <Link
                          to={`/hero/content/${item.fileID}/edit`}
                          className="text-hanover-green hover:underline"
                        >
                          {item.fileName}
                        </Link>
                      ) : (
                        <span className="text-muted-foreground">{item.fileName}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {item.message}
                      {item.actorName ? (
                        <span className="text-foreground"> — {item.actorName}</span>
                      ) : null}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                      {formatDate(item.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

export default NotificationsPage;
