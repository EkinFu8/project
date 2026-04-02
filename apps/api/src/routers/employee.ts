import {
  createEmployeeSchema,
  employeeIdSchema,
  employeeListQuerySchema,
  updateEmployeeSchema,
} from "@myapp/types/schemas";
import { publicProcedure, router } from "../lib/trpc";

export const employeeRouter = router({
  /** List all employees, optionally filtered by department or search term. */
  list: publicProcedure.input(employeeListQuerySchema).query(async ({ ctx, input }) => {
    const where: Record<string, unknown> = {};

    if (input.department) {
      where.department = input.department;
    }

    if (input.search) {
      where.OR = [
        { name: { contains: input.search, mode: "insensitive" } },
        { email: { contains: input.search, mode: "insensitive" } },
        { title: { contains: input.search, mode: "insensitive" } },
      ];
    }

    return ctx.prisma.employee.findMany({
      where,
      orderBy: { name: "asc" },
      include: {
        _count: { select: { contents: true } },
      },
    });
  }),

  /** Get a single employee by ID, including their authored content. */
  getById: publicProcedure.input(employeeIdSchema).query(async ({ ctx, input }) => {
    return ctx.prisma.employee.findUniqueOrThrow({
      where: { id: input.id },
      include: {
        contents: {
          select: {
            id: true,
            title: true,
            status: true,
            created_at: true,
          },
          orderBy: { created_at: "desc" },
        },
      },
    });
  }),

  /** Create a new employee. */
  create: publicProcedure.input(createEmployeeSchema).mutation(async ({ ctx, input }) => {
    return ctx.prisma.employee.create({ data: input });
  }),

  /** Update an existing employee. */
  update: publicProcedure
    .input(employeeIdSchema.merge(updateEmployeeSchema))
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      return ctx.prisma.employee.update({ where: { id }, data });
    }),

  /** Delete an employee. */
  delete: publicProcedure.input(employeeIdSchema).mutation(async ({ ctx, input }) => {
    return ctx.prisma.employee.delete({ where: { id: input.id } });
  }),

  /** List distinct departments for filtering. */
  departments: publicProcedure.query(async ({ ctx }) => {
    const results = await ctx.prisma.employee.findMany({
      where: { department: { not: null } },
      select: { department: true },
      distinct: ["department"],
      orderBy: { department: "asc" },
    });
    return results.map((r) => r.department).filter(Boolean) as string[];
  }),
});
