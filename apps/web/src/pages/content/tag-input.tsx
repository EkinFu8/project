import { X, Plus, Tag } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { trpc } from "@/lib/trpc.ts";

type TagShape = { id: number; name: string };

type TagInputProps = {
  selectedTags: TagShape[];
  onChange: (tags: TagShape[]) => void;
};

export function TagInput({ selectedTags, onChange }: TagInputProps) {
  const [newTagName, setNewTagName] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [dropdownQuery, setDropdownQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const allTags = trpc.tag.list.useQuery();
  const createTag = trpc.tag.create.useMutation({
    onSuccess: () => allTags.refetch(),
  });

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
        setDropdownQuery("");
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const selectedIds = new Set(selectedTags.map((t) => t.id));

  const availableTags = (allTags.data ?? []).filter(
    (t) =>
      !selectedIds.has(t.id) &&
      (dropdownQuery === "" || t.name.toLowerCase().includes(dropdownQuery.toLowerCase())),
  );

  function addExistingTag(tag: TagShape) {
    onChange([...selectedTags, tag]);
    setShowDropdown(false);
    setDropdownQuery("");
  }

  function removeTag(id: number) {
    onChange(selectedTags.filter((t) => t.id !== id));
  }

  async function handleAddNewTag() {
    const trimmed = newTagName.trim();
    if (!trimmed) return;

    // Check if tag already exists in the pool
    const existing = (allTags.data ?? []).find(
      (t) => t.name.toLowerCase() === trimmed.toLowerCase(),
    );

    if (existing) {
      if (!selectedIds.has(existing.id)) {
        onChange([...selectedTags, existing]);
      }
    } else {
      const created = await createTag.mutateAsync({ name: trimmed });
      onChange([...selectedTags, created]);
    }

    setNewTagName("");
  }

  function handleNewTagKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddNewTag();
    }
  }

  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-foreground">
        <span className="inline-flex items-center gap-1.5">
          <Tag className="h-3.5 w-3.5" />
          Meta Tags
        </span>
      </label>

      {/* Selected tag pills */}
      {selectedTags.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {selectedTags.map((tag) => (
            <span
              key={tag.id}
              className="inline-flex items-center gap-1 rounded-full bg-hanover-green/10 px-3 py-1 text-xs font-medium text-hanover-green ring-1 ring-hanover-green/30"
            >
              {tag.name}
              <button
                type="button"
                onClick={() => removeTag(tag.id)}
                className="ml-0.5 rounded-full p-0.5 hover:bg-hanover-green/20 focus:outline-none"
                aria-label={`Remove tag ${tag.name}`}
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="flex flex-col gap-2 sm:flex-row">
        {/* Add existing tag dropdown */}
        <div className="relative flex-1" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setShowDropdown((v) => !v)}
            className="w-full rounded border border-border bg-background px-4 py-2 text-left text-sm text-muted-foreground transition-colors hover:border-hanover-green hover:text-foreground focus:outline-none focus:ring-2 focus:ring-hanover-green"
          >
            {showDropdown ? "Search existing tags..." : "Add existing tag"}
          </button>

          {showDropdown && (
            <div className="absolute z-10 mt-1 w-full rounded border border-border bg-background shadow-lg">
              <div className="border-b border-border p-2">
                <input
                  autoFocus
                  type="text"
                  placeholder="Search tags..."
                  value={dropdownQuery}
                  onChange={(e) => setDropdownQuery(e.target.value)}
                  className="w-full rounded border border-border px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-hanover-green"
                />
              </div>
              <ul className="max-h-48 overflow-y-auto py-1">
                {allTags.isLoading ? (
                  <li className="px-4 py-2 text-xs text-muted-foreground">Loading...</li>
                ) : availableTags.length === 0 ? (
                  <li className="px-4 py-2 text-xs text-muted-foreground">
                    {dropdownQuery ? "No matching tags" : "No more tags available"}
                  </li>
                ) : (
                  availableTags.map((tag) => (
                    <li key={tag.id}>
                      <button
                        type="button"
                        onClick={() => addExistingTag(tag)}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-muted focus:outline-none"
                      >
                        {tag.name}
                      </button>
                    </li>
                  ))
                )}
              </ul>
            </div>
          )}
        </div>

        {/* Add new tag input */}
        <div className="flex flex-1 gap-2">
          <input
            type="text"
            placeholder="New tag name..."
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
            onKeyDown={handleNewTagKeyDown}
            maxLength={100}
            className="flex-1 rounded border border-border bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-hanover-green"
          />
          <button
            type="button"
            onClick={handleAddNewTag}
            disabled={!newTagName.trim() || createTag.isPending}
            className="inline-flex items-center gap-1 rounded bg-hanover-green px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-hanover-green/90 disabled:opacity-50"
          >
            <Plus className="h-4 w-4" />
            Add
          </button>
        </div>
      </div>
    </div>
  );
}
