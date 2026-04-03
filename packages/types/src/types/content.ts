export interface ContentItem {
  fileID: string;
  filename: string | null;
  url: string | null;
  content_owner: string | null;
  job_position: string | null;
  last_modified: string | null;
  expiration_date: string | null;
  content_type: string | null;
  document_status: string | null;
}

export interface ContentWithEmployee extends ContentItem {
  employee: {
    employeeID: string;
    employee_name: string | null;
  } | null;
}
