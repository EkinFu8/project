import { useCallback, useEffect, useState } from "react";

/**
 * useState that mirrors its value to localStorage under `key`.
 *
 * Defaults to `initial` when the key is missing or unparseable. SSR-safe:
 * reads only happen inside `useState`'s lazy initializer, and writes are
 * wrapped in try/catch so a privacy mode that throws on `setItem` doesn't
 * crash the component.
 */
export function usePersistedState<T>(
  key: string,
  initial: T,
): [T, (next: T | ((prev: T) => T)) => void] {
  const [value, setValue] = useState<T>(() => {
    if (typeof window === "undefined") return initial;
    try {
      const raw = window.localStorage.getItem(key);
      if (raw == null) return initial;
      return JSON.parse(raw) as T;
    } catch {
      return initial;
    }
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // ignore quota / privacy-mode errors
    }
  }, [key, value]);

  const update = useCallback((next: T | ((prev: T) => T)) => {
    setValue(next);
  }, []);

  return [value, update];
}
