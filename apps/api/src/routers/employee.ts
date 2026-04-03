import {
  createEmployeeSchema,
  employeeIdSchema,
  employeeListQuerySchema,
  updateEmployeeSchema,
} from "@myapp/types/schemas";
import { publicProcedure, router } from "../lib/trpc";

export const employeeRouter = router({
  list: publicProcedure.input(employeeListQuerySchema).query(async ({ ctx, input }) => {
    const where: Record<string, unknown> = {};

    if (input.search) {
      where.OR = [
        { employee_name: { contains: input.search, mode: "insensitive" } },
        { employeeID: { contains: input.search, mode: "insensitive" } },
        { job_desc: { contains: input.search, mode: "insensitive" } },
      ];
    }

    return ctx.prisma.employee.findMany({
      where,
      orderBy: { employee_name: "asc" },
      include: {
        _count: { select: { content_items: true } },
      },
    });
  }),

  getById: publicProcedure.input(employeeIdSchema).query(async ({ ctx, input }) => {
    return ctx.prisma.employee.findUniqueOrThrow({
      where: { employeeID: input.employeeID },
      include: {
        content_items: {
          select: {
            fileID: true,
            filename: true,
            document_status: true,
            last_modified: true,
          },
          orderBy: { last_modified: "desc" },
        },
      },
    });
  }),

  create: publicProcedure.input(createEmployeeSchema).mutation(async ({ ctx, input }) => {
    return ctx.prisma.employee.create({ data: input });
  }),

  update: publicProcedure
    .input(employeeIdSchema.merge(updateEmployeeSchema))
    .mutation(async ({ ctx, input }) => {
      const { employeeID, ...data } = input;
      return ctx.prisma.employee.update({ where: { employeeID }, data });
    }),

  delete: publicProcedure.input(employeeIdSchema).mutation(async ({ ctx, input }) => {
    return ctx.prisma.employee.delete({ where: { employeeID: input.employeeID } });
  }),
});
