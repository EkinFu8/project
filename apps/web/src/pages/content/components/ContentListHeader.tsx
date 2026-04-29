/**
 * Shared grid template for the list view. Both `ContentListHeader` and
 * `ContentListRow` use this className verbatim so columns line up exactly.
 *
 * Columns: star • filename • type • status • tags • owner • lock • date
 *
 * Every non-Document cell is 6rem (96px) — uniform width that fits each
 * cell's content (REFERENCE pill, status badge, single tag + count, a
 * truncated owner / lock name, the date string) without feeling cramped,
 * while leaving the maximum remaining space for the Document title.
 *
 * Tailwind needs to see literal class strings at build time, so the value
 * is exported as a `const` rather than computed.
 */
export const CONTENT_LIST_GRID =
  "grid grid-cols-[1.5rem_minmax(0,1fr)_6rem_6rem_6rem_6rem_6rem_6rem] items-center gap-3";

/**
 * Subtle column header above the list — uppercase, tracked, and muted so it
 * reads like a column-header strip, not body content. Each label sits in
 * the column its rows write into.
 */
export function ContentListHeader() {
  return (
    <div
      className={`${CONTENT_LIST_GRID} sticky top-0 z-10 border-b border-border/80 bg-muted/40 px-4 py-2.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground/90 backdrop-blur-sm`}
    >
      <span aria-hidden="true" />
      <span>Document</span>
      <span>Type</span>
      <span>Status</span>
      <span>Tags</span>
      <span>Owner</span>
      <span aria-hidden="true" />
      <span className="text-right">Due</span>
    </div>
  );
}
