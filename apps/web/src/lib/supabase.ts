import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

/** Supabase anon / service keys are compact JWS (header.payload.signature). */
function isCompactJws(value: string): boolean {
  const parts = value.split(".");
  return parts.length === 3 && parts.every((part) => part.length > 0);
}

if (import.meta.env.DEV) {
  if (!url || !anonKey) {
    console.error(
      "[supabase] Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in repo-root .env (Vite envDir). Storage uploads will fail.",
    );
  } else if (!isCompactJws(anonKey)) {
    console.error(
      "[supabase] VITE_SUPABASE_ANON_KEY must be the full JWT from `supabase status` or Project Settings → API. Placeholder text causes “Invalid Compact JWS” on uploads.",
    );
  }
}

export const supabase = createClient(url ?? "", anonKey ?? "");
