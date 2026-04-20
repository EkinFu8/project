export type ContentItem = {
  fileID: string;
  filename?: string;
  document_status?: string;
  content_type?: string;
  job_position?: string;
  is_favorited?: boolean;
  is_checked_out?: boolean;
  last_modified?: string;
  owner?: { name?: string };
  content_tags?: { tag: { id: string; name: string } }[];
};
