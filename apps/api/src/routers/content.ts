import {
  contentIdSchema,
  contentListQuerySchema,
  createContentSchema,
  updateContentSchema,
} from "@myapp/types/schemas";
import { publicProcedure, router } from "../lib/trpc";

export const contentRouter = router({
  /** List all content, optionally filtered by status, author, or search term. */
  list: publicProcedure.input(contentListQuerySchema).query(async ({ ctx, input }) => {
    const where: Record<string, unknown> = {};

    if (input.status) {
      where.status = input.status;
    }

    if (input.employee_id) {
      where.employee_id = input.employee_id;
    }

    if (input.search) {
      where.OR = [
        { title: { contains: input.search, mode: "insensitive" } },
        { body: { contains: input.search, mode: "insensitive" } },
      ];
    }

    return ctx.prisma.content.findMany({
      where,
      orderBy: { created_at: "desc" },
      include: {
        employee: {
          select: {
            id: true,
            name: true,
            department: true,
          },
        },
      },
    });
  }),

  /** Get a single content item by ID, including its author. */
  getById: publicProcedure.input(contentIdSchema).query(async ({ ctx, input }) => {
    return ctx.prisma.content.findUniqueOrThrow({
      where: { id: input.id },
      include: {
        employee: {
          select: {
            id: true,
            name: true,
            email: true,
            department: true,
            title: true,
          },
        },
      },
    });
  }),

  /** Create a new content item. */
  create: publicProcedure.input(createContentSchema).mutation(async ({ ctx, input }) => {
    return ctx.prisma.content.create({
      data: input,
      include: {
        employee: {
          select: { id: true, name: true, department: true },
        },
      },
    });
  }),

  /** Update an existing content item. */
  update: publicProcedure
    .input(contentIdSchema.merge(updateContentSchema))
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      return ctx.prisma.content.update({
        where: { id },
        data,
        include: {
          employee: {
            select: { id: true, name: true, department: true },
          },
        },
      });
    }),

  /** Delete a content item. */
  delete: publicProcedure.input(contentIdSchema).mutation(async ({ ctx, input }) => {
    return ctx.prisma.content.delete({ where: { id: input.id } });
  }),
});
