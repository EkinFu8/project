import { useEffect, useRef } from "react";
import { useSearchParams } from "react-router";

/**
 * localStorage key holding the user's content-page preferences. Bumping the
 * version suffix on shape changes prevents reading stale shapes.
 */
const STORAGE_KEY = "content.preferences.v1";

/**
 * Keys we persist to localStorage and sync onto the URL on mount when the
 * URL has none of them. `search` is intentionally excluded — search is a
 * transient session intent, not a saved preference.
 */
const PERSISTED_KEYS = [
  "view",
  "sort",
  "sortDir",
  "group",
  "status",
  "type",
  "format",
  "role",
  "tagIds",
  "tagMode",
  "pinnedTagId",
] as const;

type PersistedKey = (typeof PERSISTED_KEYS)[number];

type StoredPreferences = Partial<Record<PersistedKey, string>>;

export function useContentFilters() {
  const [params, setParams] = useSearchParams();

  /**
   * On first mount: if the URL has none of our persisted keys, restore them
   * from localStorage. After that, the URL is the source of truth and we
   * just mirror its current state back to localStorage on every change.
   */
  const hydratedRef = useRef(false);
  useEffect(() => {
    if (hydratedRef.current) return;
    hydratedRef.current = true;

    const urlHasAny = PERSISTED_KEYS.some((k) => params.has(k));
    if (urlHasAny) return;

    let stored: StoredPreferences | null = null;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      stored = raw ? (JSON.parse(raw) as StoredPreferences) : null;
    } catch {
      stored = null;
    }
    if (!stored) return;

    const next = new URLSearchParams();
    for (const key of PERSISTED_KEYS) {
      const value = stored[key];
      if (value == null || value === "") continue;
      next.set(key, value);
    }
    if (next.toString().length > 0) {
      setParams(next, { replace: true });
    }
  }, [params, setParams]);

  /**
   * Mirror the current URL state to localStorage on every change. The
   * effect depends on `params` directly so a single source of truth (the
   * URL) drives both the rendered state and the persisted preference.
   */
  useEffect(() => {
    const stored: StoredPreferences = {};
    for (const key of PERSISTED_KEYS) {
      const value = params.get(key);
      if (value != null) stored[key] = value;
    }
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
    } catch {
      // ignore quota / privacy-mode errors
    }
  }, [params]);

  const search = params.get("search") ?? "";
  const view = (params.get("view") as "grid" | "list") ?? "grid";
  const status = params.get("status") ?? "";
  const type = params.get("type") ?? "";
  const role = params.get("role") ?? "";

  const tagIdsParam = params.get("tagIds") ?? "";
  const tagIds = tagIdsParam
    ? tagIdsParam
        .split(",")
        .map((s) => Number(s))
        .filter((n) => !Number.isNaN(n))
    : [];

  const format = params.get("format") ?? "";

  const tagModeParam = params.get("tagMode");
  const tagMode: "any" | "all" = tagModeParam === "all" ? "all" : "any";

  const pinnedTagIdParam = params.get("pinnedTagId");
  const pinnedTagId =
    pinnedTagIdParam && !Number.isNaN(Number(pinnedTagIdParam)) ? Number(pinnedTagIdParam) : null;
  const sort = (params.get("sort") as "due" | "name" | "created") ?? "due";
  const sortDir = (params.get("sortDir") as "asc" | "desc") ?? "asc";

  const groupParam = params.get("group");
  const group: "none" | "role" = groupParam === "none" ? "none" : "role";

  function update(key: string, value: string) {
    const next = new URLSearchParams(params);

    if (value === "" || value === "all") {
      next.delete(key);
    } else {
      next.set(key, value);
    }

    setParams(next);
  }

  function setTagIds(ids: number[]) {
    const next = new URLSearchParams(params);
    if (ids.length === 0) {
      next.delete("tagIds");
    } else {
      next.set("tagIds", ids.join(","));
    }
    setParams(next);
  }

  function setTagMode(mode: "any" | "all") {
    const next = new URLSearchParams(params);
    if (mode === "any") {
      next.delete("tagMode");
    } else {
      next.set("tagMode", "all");
    }
    setParams(next);
  }

  function setPinnedTagId(id: number | null) {
    const next = new URLSearchParams(params);
    if (id === null) {
      next.delete("pinnedTagId");
    } else {
      next.set("pinnedTagId", String(id));
    }
    setParams(next);
  }

  return {
    search,
    view,
    status,
    type,
    format,
    role: role || "all",
    tagIds,
    tagMode,
    pinnedTagId,
    sort,
    sortDir,
    group,
    setSort: (v: "due" | "name" | "created") => update("sort", v),
    setSortDir: (v: "asc" | "desc") => update("sortDir", v),

    setSearch: (v: string) => update("search", v),
    setView: (v: "grid" | "list") => update("view", v),
    setStatus: (v: string) => update("status", v),
    setType: (v: string) => update("type", v),
    setFormat: (v: string) => update("format", v),
    setRole: (v: string) => update("role", v),
    setGroup: (v: "none" | "role") => update("group", v === "role" ? "" : v),
    setTagIds,
    setTagMode,
    setPinnedTagId,
  };
}
