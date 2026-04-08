export type AccountPortal = "employee" | "admin";

/** Reads `portal` from Supabase Auth `user_metadata` (default `employee`). */
export function accountPortalFromUserMetadata(
  meta: Record<string, unknown> | undefined | null,
): AccountPortal {
  return meta?.portal === "admin" ? "admin" : "employee";
}
