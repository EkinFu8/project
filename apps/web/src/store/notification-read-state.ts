import { create } from "zustand";
import { persist } from "zustand/middleware";

const DEFAULT_SCOPE = "default";
const MAX_STORED_KEYS = 500;
const EMPTY_READ_KEYS: string[] = [];

type NotificationReadState = {
  readKeysByScope: Record<string, string[]>;
  markKeysRead: (scope: string | undefined, keys: string[]) => void;
};

function scopeKey(scope?: string) {
  return scope || DEFAULT_SCOPE;
}

export const useNotificationReadStore = create<NotificationReadState>()(
  persist(
    (set) => ({
      readKeysByScope: {},
      markKeysRead: (scope, keys) => {
        if (keys.length === 0) return;

        set((state) => {
          const key = scopeKey(scope);
          const next = new Set(state.readKeysByScope[key] ?? []);
          for (const readKey of keys) next.add(readKey);

          return {
            readKeysByScope: {
              ...state.readKeysByScope,
              [key]: Array.from(next).slice(-MAX_STORED_KEYS),
            },
          };
        });
      },
    }),
    {
      name: "notification.read-state.v1",
      partialize: ({ readKeysByScope }) => ({ readKeysByScope }),
    },
  ),
);

export function useNotificationReadKeys(scope?: string) {
  return useNotificationReadStore(
    (state) => state.readKeysByScope[scopeKey(scope)] ?? EMPTY_READ_KEYS,
  );
}
