import { z } from "zod";

export const employeeIdSchema = z.object({
  id: z.string().uuid(),
});

export const createEmployeeSchema = z.object({
  name: z.string().min(1).max(255),
  email: z.string().email(),
  department: z.string().max(255).nullish(),
  title: z.string().max(255).nullish(),
  phone: z.string().max(50).nullish(),
  hired_at: z.coerce.date().nullish(),
});

export const updateEmployeeSchema = createEmployeeSchema.partial();

export const employeeListQuerySchema = z.object({
  department: z.string().optional(),
  search: z.string().optional(),
});

export type EmployeeId = z.infer<typeof employeeIdSchema>;
export type CreateEmployee = z.infer<typeof createEmployeeSchema>;
export type UpdateEmployee = z.infer<typeof updateEmployeeSchema>;
export type EmployeeListQuery = z.infer<typeof employeeListQuerySchema>;
