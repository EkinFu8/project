import { Check, Command, Pencil, Search, Trash2, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { trpc } from "@/lib/trpc";
import { ColorPicker } from "@/pages/tags/components/ColorPicker.tsx";
import { normalizeTag, renderTag } from "@/utils/tag";

type EditState = {
  id: number;
  name: string;
  color: string;
} | null;
const TAGS_SEARCH_FOCUS_EVENT = "tags-search:focus";

export default function TagsPage() {
  const utils = trpc.useUtils();
  const searchInputRef = useRef<HTMLInputElement>(null);

  const tagsQuery = trpc.tag.list.useQuery();

  const deleteTag = trpc.tag.delete.useMutation({
    onSuccess: () => utils.tag.list.invalidate(),
  });

  const updateTag = trpc.tag.update.useMutation({
    onSuccess: () => utils.tag.list.invalidate(),
  });

  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [errorMap, setErrorMap] = useState<Record<number, string>>({});
  const [edit, setEdit] = useState<EditState>(null);
  const [search, setSearch] = useState("");

  const focusSearchInput = useCallback(() => {
    window.requestAnimationFrame(() => {
      searchInputRef.current?.focus();
      searchInputRef.current?.select();
    });
  }, []);

  useEffect(() => {
    function handleSearchFocus() {
      focusSearchInput();
    }

    window.addEventListener(TAGS_SEARCH_FOCUS_EVENT, handleSearchFocus);
    return () => window.removeEventListener(TAGS_SEARCH_FOCUS_EVENT, handleSearchFocus);
  }, [focusSearchInput]);

  if (tagsQuery.isPending) {
    return <div className="p-6 text-sm text-muted-foreground">Loading tags...</div>;
  }

  const tags = (tagsQuery.data ?? [])
    .map(normalizeTag)
    .filter((tag) => tag.name.toLowerCase().includes(search.toLowerCase()));

  function toggleTag(id: number) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  async function handleSaveEdit() {
    if (!edit) return;

    const trimmedName = edit.name.trim();

    const nameTaken = tags.some(
      (t) => t.id !== edit.id && t.name.toLowerCase() === trimmedName.toLowerCase(),
    );

    const colorTaken = tags.some((t) => t.id !== edit.id && (t.color ?? "") === edit.color);

    if (nameTaken || colorTaken) {
      const message = nameTaken ? "Name already in use" : "Color already in use";

      setErrorMap((prev) => ({
        ...prev,
        [edit.id]: message,
      }));

      // auto-remove after 3s
      setTimeout(() => {
        setErrorMap((prev) => {
          const next = { ...prev };
          delete next[edit.id];
          return next;
        });
      }, 3000);

      return;
    }

    await updateTag.mutateAsync({
      id: edit.id,
      name: trimmedName,
      color: edit.color,
    });

    setEdit(null);
    setErrorMap({});
  }

  async function handleBulkDelete() {
    if (selectedIds.size === 0) return;

    if (!confirm(`Delete ${selectedIds.size} selected tag(s)?`)) return;

    const errors: Record<number, string> = {};

    for (const id of selectedIds) {
      try {
        await deleteTag.mutateAsync({ id });
      } catch (err: unknown) {
        errors[id] = err instanceof Error ? err.message : "Failed to delete";
      }
    }

    setErrorMap(errors);

    // auto-clear each error after 3s
    Object.keys(errors).forEach((id) => {
      setTimeout(() => {
        setErrorMap((prev) => {
          const next = { ...prev };
          delete next[Number(id)];
          return next;
        });
      }, 3000);
    });
    setSelectedIds(new Set());
    utils.tag.list.invalidate();
  }

  return (
    <div className="mx-auto max-w-4xl animate-fade-in-up p-6">
      <h1 className="mb-1 text-2xl font-bold tracking-tight text-foreground">Tag Management</h1>
      <p className="mb-5 text-sm text-muted-foreground">
        Organize content with consistent labels and colors.
      </p>

      {/* SEARCH */}
      <div className="group relative mb-4">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-colors duration-200 group-focus-within:text-hanover-green" />
        <input
          ref={searchInputRef}
          type="text"
          placeholder="Search tags..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-md border border-border bg-background py-2 pl-10 pr-16 text-sm transition-all duration-200 hover:border-foreground/30 focus:border-hanover-green focus:outline-none focus:ring-2 focus:ring-hanover-green/30"
        />
        <kbd className="pointer-events-none absolute right-2 top-1/2 hidden -translate-y-1/2 items-center gap-0.5 rounded border border-border bg-muted px-1.5 py-0.5 text-[11px] font-medium leading-none text-muted-foreground sm:inline-flex">
          <Command className="size-3" aria-hidden strokeWidth={2} />
          <span>K</span>
        </kbd>
      </div>

      {/* BULK BAR */}
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">{selectedIds.size}</span> selected
        </p>

        <button
          type="button"
          onClick={handleBulkDelete}
          disabled={selectedIds.size === 0}
          className="rounded-md bg-red-500 px-4 py-2 text-xs font-semibold text-white shadow-sm transition-all duration-200 hover:bg-red-600 hover:shadow active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-red-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/40 focus-visible:ring-offset-2"
        >
          <Trash2 className="mr-1 inline h-3.5 w-3.5" />
          Delete Selected
        </button>
      </div>

      {/* TAG LIST */}
      <div className="grid gap-3 stagger-children">
        {tags.map((tag) => {
          const styles = renderTag(tag);
          const isEditing = edit?.id === tag.id;

          return (
            <div
              key={tag.id}
              className="flex items-center justify-between rounded-lg border border-border bg-card p-3 shadow-sm transition-all duration-200 hover:border-foreground/20 hover:shadow-md"
            >
              <div className="flex items-center gap-3">
                {/* checkbox */}
                <input
                  type="checkbox"
                  checked={selectedIds.has(tag.id)}
                  onChange={() => toggleTag(tag.id)}
                  className="h-4 w-4 cursor-pointer rounded border-border accent-hanover-green transition-transform duration-150 hover:scale-110"
                />

                {/* TAG / EDIT */}
                {!isEditing ? (
                  <span
                    style={{
                      backgroundColor: styles.bg,
                      color: styles.text,
                    }}
                    className="rounded-full px-3 py-1 text-xs font-medium shadow-sm transition-transform duration-200 hover:scale-105"
                  >
                    {tag.name}
                  </span>
                ) : (
                  <div className="flex items-center gap-2 animate-fade-in">
                    <input
                      value={edit.name}
                      onChange={(e) => setEdit({ ...edit, name: e.target.value })}
                      className="rounded-md border border-border bg-background px-2 py-1 text-xs transition-all duration-200 focus:border-hanover-green focus:outline-none focus:ring-2 focus:ring-hanover-green/30"
                    />

                    <ColorPicker
                      value={edit.color}
                      onChange={(color) => setEdit((prev) => (prev ? { ...prev, color } : prev))}
                    />
                  </div>
                )}

                <span className="text-xs font-mono text-muted-foreground">#{tag.id}</span>

                {errorMap[tag.id] && (
                  <span className="animate-fade-in-down text-xs text-red-500">
                    {errorMap[tag.id]}
                  </span>
                )}
              </div>

              {/* ACTIONS */}
              <div className="flex items-center gap-1.5">
                {!isEditing ? (
                  <button
                    type="button"
                    onClick={() =>
                      setEdit({
                        id: tag.id,
                        name: tag.name,
                        color: tag.color ?? "#22c55e",
                      })
                    }
                    className="rounded-md border border-border bg-background p-1.5 text-foreground transition-all duration-150 hover:border-hanover-green/40 hover:bg-hanover-green/10 hover:text-hanover-green active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hanover-green/40"
                    aria-label={`Edit ${tag.name}`}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={handleSaveEdit}
                      className="rounded-md p-1.5 transition-all duration-150 hover:bg-green-50 active:scale-95 dark:hover:bg-green-950/40"
                      aria-label="Save changes"
                    >
                      <Check className="h-4 w-4 text-green-600" />
                    </button>

                    <button
                      type="button"
                      onClick={() => setEdit(null)}
                      className="rounded-md p-1.5 transition-all duration-150 hover:bg-red-50 active:scale-95 dark:hover:bg-red-950/40"
                      aria-label="Cancel edit"
                    >
                      <X className="h-4 w-4 text-red-500" />
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* EMPTY STATE */}
      {tags.length === 0 && (
        <div className="mt-6 rounded-lg border border-dashed border-border bg-card/50 px-4 py-10 text-center">
          <p className="text-sm text-muted-foreground">No tags found.</p>
        </div>
      )}
    </div>
  );
}
