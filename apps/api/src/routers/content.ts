import {
  contentIdSchema,
  contentListQuerySchema,
  createContentSchema,
  updateContentSchema,
} from "@myapp/types/schemas";
import { publicProcedure, router } from "../lib/trpc";



function assertCanEdit(file: any, userId: string) {
    if (!file) throw new Error("File not found");

    if (file.is_checked_out && file.checked_out_by !== userId) {
        throw new Error("This file is checked out by another user");
    }
}



export const contentRouter = router({
    checkout: publicProcedure
        .input(contentIdSchema)
        .mutation(async ({ ctx, input }) => {
            const userId = ctx.user?.id;
            if (!userId) throw new Error("Not authenticated");

            const result = await ctx.prisma.contentManagement.updateMany({
                where: {
                    fileID: input.fileID,
                    OR: [
                        { is_checked_out: false },
                        { checked_out_by: userId }, // allows re-checkout by same user
                    ],
                },
                data: {
                    is_checked_out: true,
                    checked_out_by: userId,
                    checked_out_at: new Date(),
                },
            });

            if (result.count === 0) {
                throw new Error("File is already checked out by someone else");
            }

            return { success: true };
        }),

    forceUnlock: publicProcedure
        .input(contentIdSchema)
        .mutation(async ({ ctx, input }) => {
            const userId = ctx.user?.id;
            if (!userId) throw new Error("Not authenticated");
            const userRole = ctx.user?.role;
            if (!userRole) throw new Error("Role is required");

            if (userRole !== "admin") {
                throw new Error("Only admins can force unlock files");
            }

            const file = await ctx.prisma.contentManagement.findUnique({
                where: { fileID: input.fileID },
            });

            if (!file) {
                throw new Error("File not found");
            }

            return ctx.prisma.contentManagement.update({
                where: { fileID: input.fileID },
                data: {
                    is_checked_out: false,
                    checked_out_by: null,
                    checked_out_at: null,
                },
            });
        }),

    checkin: publicProcedure
        .input(contentIdSchema)
        .mutation(async ({ ctx, input }) => {
            const userId = ctx.user?.id;
            if (!userId) throw new Error("Not authenticated");

            const result = await ctx.prisma.contentManagement.updateMany({
                where: {
                    fileID: input.fileID,
                    checked_out_by: userId,
                },
                data: {
                    is_checked_out: false,
                    checked_out_by: null,
                    checked_out_at: null,
                },
            });

            if (result.count === 0) {
                throw new Error("You don't own this checkout");
            }

            return { success: true };
        }),


  list: publicProcedure.input(contentListQuerySchema).query(async ({ ctx, input }) => {
    const where: Record<string, unknown> = {};

    if (input.document_status) {
      where.document_status = input.document_status;
    }

    if (input.owner_id) {
      where.owner_id = input.owner_id;
    }

    if (input.search) {
      where.OR = [
        { filename: { contains: input.search, mode: "insensitive" } },
        { url: { contains: input.search, mode: "insensitive" } },
      ];
    }

    return ctx.prisma.contentManagement.findMany({
      where,
      orderBy: { last_modified: "desc" },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            employee_code: true,
            role: true,
          },
        },
      },
    });
  }),

  getById: publicProcedure.input(contentIdSchema).query(async ({ ctx, input }) => {
    return ctx.prisma.contentManagement.findUniqueOrThrow({
      where: { fileID: input.fileID },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            employee_code: true,
            job_desc: true,
          },
        },
      },
    });
  }),

  create: publicProcedure.input(createContentSchema).mutation(async ({ ctx, input }) => {
    return ctx.prisma.contentManagement.create({
      data: input,
      include: {
        owner: {
          select: { id: true, name: true, employee_code: true },
        },
      },
    });
  }),

    update: publicProcedure
        .input(contentIdSchema.merge(updateContentSchema))
        .mutation(async ({ ctx, input }) => {
            const { fileID, ...data } = input;
            const userId = ctx.user?.id;
            if (!userId) throw new Error("Not authenticated");

            const file = await ctx.prisma.contentManagement.findUnique({
                where: { fileID },
            });

            assertCanEdit(file, userId);

            return ctx.prisma.contentManagement.update({
                where: { fileID },
                data,
                include: {
                    owner: {
                        select: { id: true, name: true, employee_code: true },
                    },
                },
            });
        }),

    delete: publicProcedure
        .input(contentIdSchema)
        .mutation(async ({ ctx, input }) => {
            const userId = ctx.user?.id;
            if (!userId) throw new Error("Not authenticated");

            const file = await ctx.prisma.contentManagement.findUnique({
                where: { fileID: input.fileID },
            });
            
            if (!file) throw new Error("File not found");
            assertCanEdit(file, userId);

            return ctx.prisma.contentManagement.delete({
                where: { fileID: input.fileID },
            });
        }),

});
