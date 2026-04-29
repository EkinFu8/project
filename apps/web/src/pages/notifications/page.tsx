import { Bell, Clock3, FilePenLine, Loader2, UserRoundCog } from "lucide-react";
import { useEffect } from "react";
import { Link } from "react-router";
import { useSession } from "@/auth/session-context";
import { useNotificationReadState } from "@/hooks/use-notification-read-state.ts";
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
  const { session } = useSession();
  const list = trpc.notifications.myList.useQuery();
  const markViewed = trpc.notifications.markViewed.useMutation();
  const { markRowsRead, unreadRows } = useNotificationReadState(list.data, session?.user.id);

  useEffect(() => {
    if (unreadRows.length === 0) return;

    markViewed.mutate({
      notifications: unreadRows.map((row) => ({
        id: row.id,
        type: row.type,
        fileID: row.fileID,
        fileName: row.fileName,
        createdAt: new Date(row.createdAt),
      })),
    });
    markRowsRead(unreadRows);
  }, [markRowsRead, markViewed, unreadRows]);

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
      <div className="mx-auto max-w-5xl animate-fade-in-up">
        <h1 className="flex items-center gap-3 text-2xl font-bold tracking-tight text-foreground">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-hanover-green/10">
            <Bell className="h-5 w-5 text-hanover-green" />
          </span>
          Notifications
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Edits, review dates, and owner changes for content that matches your role.
        </p>

        <div className="mt-6 overflow-x-auto rounded-lg border border-border bg-card shadow-sm transition-shadow duration-200 hover:shadow-md">
          {rows.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                <Bell className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">Nothing to show right now.</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Type
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Document
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Message
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-border transition-colors duration-150 last:border-b-0 hover:bg-muted/50"
                  >
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-2 rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-foreground ring-1 ring-border">
                        {typeIcon(item.type)}
                        {typeLabel(item.type)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {item.fileID ? (
                        <Link
                          to={`/hero/content/${item.fileID}/edit`}
                          className="font-medium text-hanover-green underline-offset-2 transition-colors duration-150 hover:text-hanover-green/80 hover:underline"
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
