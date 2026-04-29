export type OcrStatus = "pending" | "processing" | "done" | "failed" | "skipped";

export type ContentItem = {
  fileID: string;
  filename?: string;
  document_status?: string;
  content_type?: string;
  job_position?: string;
  is_favorited?: boolean;
  is_checked_out?: boolean;
  checked_out_by?: string | null;
  checked_out_by_user?: { id: string; name: string } | null;
  checked_out_at?: string | null;
  last_modified?: string;
  owner?: { name?: string };
  content_tags?: { tag: { id: number; name: string } }[];
  url?: string;
  ocr_status?: OcrStatus;
  matched_in_content?: boolean;
  next_review_date?: string | null;
};
