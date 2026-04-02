export interface Employee {
  id: string;
  name: string;
  email: string;
  department: string | null;
  title: string | null;
  phone: string | null;
  hired_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface EmployeeWithContents extends Employee {
  contents: {
    id: string;
    title: string;
    status: string;
  }[];
}
