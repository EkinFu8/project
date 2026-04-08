export interface ContentItem {
  fileID: string;
  filename: string | null;
  url: string | null;
  owner_id: string | null;
  job_position: string | null;
  last_modified: string | null;
  expiration_date: string | null;
  content_type: string | null;
  document_status: string | null;
}

export interface ContentWithOwner extends ContentItem {
  owner: {
    id: string;
    name: string;
    employee_code: string | null;
  } | null;
}
