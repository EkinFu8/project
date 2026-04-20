import { useSearchParams } from "react-router";

export function useContentFilters() {
  const [params, setParams] = useSearchParams();

  const search = params.get("search") ?? "";
  const view = (params.get("view") as "grid" | "list") ?? "grid";
  const status = params.get("status") ?? "";
  const type = params.get("type") ?? "";
  const role = params.get("role") ?? "";

  function update(key: string, value: string) {
    const next = new URLSearchParams(params);

    if (value === "" || value === "all") {
      next.delete(key);
    } else {
      next.set(key, value);
    }

    setParams(next);
  }

  return {
    search,
    view,
    status,
    type,
    role: role || "all",

    setSearch: (v: string) => update("search", v),
    setView: (v: "grid" | "list") => update("view", v),
    setStatus: (v: string) => update("status", v),
    setType: (v: string) => update("type", v),
    setRole: (v: string) => update("role", v),
  };
}
