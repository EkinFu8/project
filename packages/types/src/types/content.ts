export interface Content {
  id: string;
  title: string;
  body: string;
  status: string;
  employee_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface ContentWithAuthor extends Content {
  employee: {
    id: string;
    name: string;
    department: string | null;
  } | null;
}
