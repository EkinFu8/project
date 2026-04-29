import { useCallback, useMemo } from "react";
import type { RouterOutputs } from "@/lib/trpc";
import { useNotificationReadKeys, useNotificationReadStore } from "@/store/notification-read-state";

type NotificationRow = RouterOutputs["notifications"]["myList"][number];

function notificationReadKey(row: NotificationRow) {
  return `${row.id}:${row.createdAt}`;
}

function rowReadKeys(rows: readonly NotificationRow[] | undefined) {
  return rows?.map(notificationReadKey) ?? [];
}

export function useNotificationReadState(
  rows: readonly NotificationRow[] | undefined,
  scope?: string,
) {
  const readKeys = useNotificationReadKeys(scope);
  const readKeySet = useMemo(() => new Set(readKeys), [readKeys]);
  const markKeysRead = useNotificationReadStore((state) => state.markKeysRead);

  const unreadCount = useMemo(() => {
    return rowReadKeys(rows).filter((key) => !readKeySet.has(key)).length;
  }, [readKeySet, rows]);

  const unreadRows = useMemo(() => {
    return rows?.filter((row) => !readKeySet.has(notificationReadKey(row))) ?? [];
  }, [readKeySet, rows]);

  const markRowsRead = useCallback(
    (items: readonly NotificationRow[] | undefined = rows) => {
      const keys = rowReadKeys(items);
      markKeysRead(scope, keys);
    },
    [markKeysRead, rows, scope],
  );

  return { unreadCount, unreadRows, markRowsRead };
}
