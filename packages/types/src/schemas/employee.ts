import { z } from "zod";

export const employeeIdSchema = z.object({
  employeeID: z.string().min(1).max(10),
});

export const createEmployeeSchema = z.object({
  employeeID: z.string().min(1).max(10),
  employee_name: z.string().max(50).nullish(),
  job_desc: z.string().max(200).nullish(),
});

export const updateEmployeeSchema = createEmployeeSchema.omit({ employeeID: true }).partial();

export const employeeListQuerySchema = z.object({
  search: z.string().optional(),
});

export type EmployeeId = z.infer<typeof employeeIdSchema>;
export type CreateEmployee = z.infer<typeof createEmployeeSchema>;
export type UpdateEmployee = z.infer<typeof updateEmployeeSchema>;
export type EmployeeListQuery = z.infer<typeof employeeListQuerySchema>;
