import { Loader2 } from "lucide-react";
import { ContentCard } from "./ContentCard";
import { ContentListItem } from "./ContentListItem";

export function ContentGrid({
                                contents,
                                filtered,
                                filters,
                                toggleFavorite,
                                getStatusBadge,
                            }: any) {
    return (
        <main className="flex-1">
            {contents.isLoading ? (
                <div className="flex items-center justify-center py-16">
                    <Loader2 className="h-6 w-6 animate-spin text-hanover-green" />
                </div>
            ) : (
                <div
                    className={
                        filters.view === "grid"
                            ? "grid gap-4 md:grid-cols-2 lg:grid-cols-3"
                            : "flex flex-col gap-3"
                    }
                >
                    {filtered.map((item: any) =>
                        filters.view === "grid" ? (
                            <ContentCard
                                key={item.fileID}
                                item={item}
                                toggleFavorite={toggleFavorite}
                                getStatusBadge={getStatusBadge}
                            />
                        ) : (
                            <ContentListItem
                                key={item.fileID}
                                item={item}
                                toggleFavorite={toggleFavorite}
                                getStatusBadge={getStatusBadge}
                            />
                        )
                    )}
                </div>
            )}
        </main>
    );
}