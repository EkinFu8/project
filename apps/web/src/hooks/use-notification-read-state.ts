import { useCallback, useEffect, useMemo, useState } from "react";
import type { RouterOutputs } from "@/lib/trpc";

type NotificationRow = RouterOutputs["notifications"]["myList"][number];

const STORAGE_KEY = "hanover.readNotificationKeys";
const STORAGE_EVENT = "hanover:read-notifications-changed";
const MAX_STORED_KEYS = 500;

function notificationReadKey(row: NotificationRow) {
  return `${row.id}:${row.createdAt}`;
}

function storageKey(scope?: string) {
  return scope ? `${STORAGE_KEY}.${scope}` : STORAGE_KEY;
}

function readStoredKeys(scope?: string) {
  if (typeof window === "undefined") return new Set<string>();

  try {
    const raw = window.localStorage.getItem(storageKey(scope));
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    const keys = Array.isArray(parsed)
      ? parsed.filter((key): key is string => typeof key === "string")
      : [];
    return new Set(keys);
  } catch {
    return new Set<string>();
  }
}

function writeStoredKeys(keys: Set<string>, scope?: string) {
  if (typeof window === "undefined") return;

  const next = Array.from(keys).slice(-MAX_STORED_KEYS);
  window.localStorage.setItem(storageKey(scope), JSON.stringify(next));
  window.dispatchEvent(new Event(STORAGE_EVENT));
}

function rowReadKeys(rows: readonly NotificationRow[] | undefined) {
  return rows?.map(notificationReadKey) ?? [];
}

export function useNotificationReadState(
  rows: readonly NotificationRow[] | undefined,
  scope?: string,
) {
  const [readKeys, setReadKeys] = useState(() => readStoredKeys(scope));

  useEffect(() => {
    function syncReadKeys() {
      setReadKeys(readStoredKeys(scope));
    }

    window.addEventListener("storage", syncReadKeys);
    window.addEventListener(STORAGE_EVENT, syncReadKeys);

    return () => {
      window.removeEventListener("storage", syncReadKeys);
      window.removeEventListener(STORAGE_EVENT, syncReadKeys);
    };
  }, [scope]);

  const unreadCount = useMemo(() => {
    return rowReadKeys(rows).filter((key) => !readKeys.has(key)).length;
  }, [readKeys, rows]);

  const unreadRows = useMemo(() => {
    return rows?.filter((row) => !readKeys.has(notificationReadKey(row))) ?? [];
  }, [readKeys, rows]);

  const markRowsRead = useCallback(
    (items: readonly NotificationRow[] | undefined = rows) => {
      const keys = rowReadKeys(items);
      if (keys.length === 0) return;

      const next = readStoredKeys(scope);
      for (const key of keys) next.add(key);
      writeStoredKeys(next, scope);
      setReadKeys(next);
    },
    [rows, scope],
  );

  return { unreadCount, unreadRows, markRowsRead };
}
