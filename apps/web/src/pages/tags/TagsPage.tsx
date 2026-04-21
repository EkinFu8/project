import { useState } from "react";
import { Trash2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { renderTag, normalizeTag } from "@/utils/tag";

export default function TagsPage() {
    const utils = trpc.useUtils();

    const tagsQuery = trpc.tag.list.useQuery();

    const deleteTag = trpc.tag.delete.useMutation({
        onSuccess: () => {
            utils.tag.list.invalidate();
        },
    });

    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
    const [errorMap, setErrorMap] = useState<Record<number, string>>({});

    if (tagsQuery.isPending) {
        return (
            <div className="p-6 text-sm text-muted-foreground">
                Loading tags...
            </div>
        );
    }

    const tags = (tagsQuery.data ?? []).map(normalizeTag);

    function toggleTag(id: number) {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    }

    async function handleBulkDelete() {
        if (selectedIds.size === 0) return;

        const confirmed = confirm(
            `Delete ${selectedIds.size} selected tag(s)?`,
        );

        if (!confirmed) return;

        const errors: Record<number, string> = {};

        for (const id of selectedIds) {
            try {
                await deleteTag.mutateAsync({ id });
            } catch (err: any) {
                errors[id] = err.message ?? "Failed to delete";
            }
        }

        setErrorMap(errors);
        setSelectedIds(new Set());

        utils.tag.list.invalidate();
    }

    return (
        <div className="mx-auto max-w-4xl p-6">
            <h1 className="mb-6 text-2xl font-bold">Tag Management</h1>

            {/* BULK ACTION BAR */}
            <div className="mb-4 flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                    {selectedIds.size} selected
                </p>

                <button
                    type="button"
                    onClick={handleBulkDelete}
                    disabled={selectedIds.size === 0 || deleteTag.isPending}
                    className="rounded-md bg-red-500 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-red-600 disabled:opacity-50"
                >
                    <div className="flex items-center gap-1">
                        <Trash2 className="h-3.5 w-3.5" />
                        Delete Selected
                    </div>
                </button>
            </div>

            {tags.length === 0 ? (
                <p className="text-sm text-muted-foreground">No tags found.</p>
            ) : (
                <div className="grid gap-3">
                    {tags.map((tag) => {
                        const styles = renderTag(tag);

                        return (
                            <div
                                key={tag.id}
                                className="flex items-center justify-between rounded-lg border border-border bg-card p-3"
                            >
                                {/* LEFT SIDE */}
                                <div className="flex items-center gap-3">
                                    {/* checkbox */}
                                    <input
                                        type="checkbox"
                                        checked={selectedIds.has(tag.id)}
                                        onChange={() => toggleTag(tag.id)}
                                        className="h-4 w-4"
                                    />

                                    {/* tag pill */}
                                    <span
                                        style={{
                                            backgroundColor: styles.bg,
                                            color: styles.text,
                                        }}
                                        className="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium"
                                    >
                    {tag.name}
                  </span>

                                    <span className="text-xs text-muted-foreground">
                    #{tag.id}
                  </span>
                                </div>

                                {/* RIGHT SIDE ERROR */}
                                {errorMap[tag.id] && (
                                    <span className="text-xs text-red-500">
                    {errorMap[tag.id]}
                  </span>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}