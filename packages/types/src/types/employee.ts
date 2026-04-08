/** Directory entry — same underlying row as `User` / `public.users`. */
export interface DirectoryEntry {
  id: string;
  email: string;
  name: string;
  portal: string;
  role: string;
  employee_code: string | null;
  job_desc: string | null;
}

export interface DirectoryEntryWithContent extends DirectoryEntry {
  content_items: {
    fileID: string;
    filename: string | null;
    document_status: string | null;
  }[];
}
