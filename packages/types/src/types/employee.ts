export interface Employee {
  employeeID: string;
  employee_name: string | null;
  job_desc: string | null;
}

export interface EmployeeWithContent extends Employee {
  content_items: {
    fileID: string;
    filename: string | null;
    document_status: string | null;
  }[];
}
