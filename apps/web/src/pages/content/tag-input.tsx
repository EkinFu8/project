import { Plus, Tag, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { trpc } from "@/lib/trpc.ts";
import {normalizeTag, renderTag } from "@/utils/tag";

type TagShape = { id: number; name: string; color?: string };

type TagInputProps = {
  selectedTags: TagShape[];
  onChange: (tags: TagShape[]) => void;
};

export function TagInput({ selectedTags, onChange }: TagInputProps) {
  const [newTagName, setNewTagName] = useState("");

  const [showDropdown, setShowDropdown] = useState(false);
  const [dropdownQuery, setDropdownQuery] = useState("");

  const [colorOpen, setColorOpen] = useState(false);
  const [selectedColor, setSelectedColor] = useState("#22c55e");

  const dropdownRef = useRef<HTMLDivElement>(null);
  const colorRef = useRef<HTMLDivElement>(null);

  const presetColors = [
    "#7f1d1d", "#b91c1c", "#ef4444",
    "#7c2d12", "#c2410c", "#f97316",
    "#713f12", "#a16207", "#eab308",
    "#14532d", "#15803d", "#22c55e",
    "#1e3a8a", "#1d4ed8", "#3b82f6",
    "#312e81", "#4338ca", "#6366f1",
  ];

  const tagsQuery = trpc.tag.list.useQuery();
  const rawTags = tagsQuery.data ?? [];
  const normalizedTags = rawTags.map(normalizeTag) as TagShape[];
  const createTag = trpc.tag.create.useMutation({
    onSuccess: () => tagsQuery.refetch(),
  });

  // close dropdowns on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const target = e.target as Node;

      if (dropdownRef.current && !dropdownRef.current.contains(target)) {
        setShowDropdown(false);
        setDropdownQuery("");
      }

      if (colorRef.current && !colorRef.current.contains(target)) {
        setColorOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const selectedIds = new Set(selectedTags.map((t) => t.id));

  const availableTags = (tagsQuery.data ?? []).map(normalizeTag).filter(
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

    const existing = normalizedTags.find(
        (t) => t.name.toLowerCase() === trimmed.toLowerCase(),
    );

    if (existing) {
      if (!selectedIds.has(existing.id)) {
        onChange([...selectedTags, existing]);
      }
    } else {
      const created = await createTag.mutateAsync({
        name: trimmed,
        color: selectedColor,
      });

      const normalizedCreated = normalizeTag(created);

      onChange([...selectedTags, normalizedCreated]);
    }

    setNewTagName("");
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddNewTag();
    }
  }

  return (
      <div>
      <span className="mb-2 block text-sm font-semibold text-foreground flex items-center gap-1.5">
        <Tag className="h-3.5 w-3.5" />
        Meta Tags
      </span>

        {/* Selected tags */}
        {selectedTags.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-2">
              {selectedTags.map((tag) => {
                const styles = renderTag(tag);

                return (
                    <span
                        key={tag.id}
                        style={{
                          backgroundColor: styles.bg,
                          color: styles.text,
                        }}
                        className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium transition-all hover:opacity-80"
                    >
                {tag.name}
                      <button
                          type="button"
                          onClick={() => removeTag(tag.id)}
                          className="ml-0.5 rounded-full p-0.5 hover:bg-black/10"
                      >
                  <X className="h-3 w-3" />
                </button>
              </span>
                );
              })}
            </div>
        )}

        <div className="flex flex-col gap-2 sm:flex-row">

          {/* Existing tags dropdown */}
          <div className="relative flex-1" ref={dropdownRef}>
            <button
                type="button"
                onClick={() => setShowDropdown((v) => !v)}
                className="w-full rounded border px-4 py-2 text-left text-sm"
            >
              {showDropdown ? "Search tags..." : "Add existing tag"}
            </button>

            {showDropdown && (
                <div className="absolute z-20 mt-2 w-full rounded border bg-background shadow-lg">
                  <input
                      className="w-full border-b px-3 py-2 text-sm"
                      placeholder="Search..."
                      value={dropdownQuery}
                      onChange={(e) => setDropdownQuery(e.target.value)}
                  />

                  <div className="max-h-48 overflow-y-auto">
                    {availableTags.map((tag) => (
                        <button
                            key={tag.id}
                            type="button"
                            onClick={() => addExistingTag(tag)}
                            className="w-full px-3 py-2 text-left text-sm hover:bg-muted"
                        >
                          {tag.name}
                        </button>
                    ))}
                  </div>
                </div>
            )}
          </div>

          {/* New tag input */}
          <input
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="New tag..."
              className="flex-1 rounded border px-3 py-2 text-sm"
          />

          <button
              type="button"
              onClick={handleAddNewTag}
              disabled={!newTagName.trim() || createTag.isPending}
              className="rounded bg-hanover-green px-3 py-2 text-sm text-white"
          >
            <Plus className="h-4 w-4" />
          </button>

          {/* Color popover */}
          <div className="relative" ref={colorRef}>
            <button
                type="button"
                onClick={() => setColorOpen((v) => !v)}
                className="rounded border px-3 py-2 text-sm"
            >
              Color
              <span
                  className="ml-2 inline-block h-3 w-3 rounded"
                  style={{ backgroundColor: selectedColor }}
              />
            </button>

            {colorOpen && (
                <div className="absolute right-0 z-30 mt-2 w-16 rounded border bg-background p-2 shadow-lg">
                  <div className="grid grid-cols-3 gap-1">
                    {presetColors.map((color) => (
                        <button
                            key={color}
                            type="button"
                            onClick={() => {
                              setSelectedColor(color);
                              setColorOpen(false);
                            }}
                            className="h-4 w-4 rounded-sm border hover:scale-110 transition"
                            style={{ backgroundColor: color }}
                        />
                    ))}
                  </div>
                </div>
            )}
          </div>
        </div>
      </div>
  );
}