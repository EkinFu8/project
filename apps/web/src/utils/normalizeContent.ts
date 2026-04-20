import type { ContentItem } from "@/types/content";

export function normalizeContent(item: any): ContentItem {
    return {
        ...item,

        filename: item.filename ?? undefined,
        url: item.url ?? undefined,
        job_position: item.job_position ?? undefined,
        last_modified: item.last_modified ?? undefined,
        expiration_date: item.expiration_date ?? undefined,
        content_type: item.content_type ?? undefined,
        document_status: item.document_status ?? undefined,
    };
}