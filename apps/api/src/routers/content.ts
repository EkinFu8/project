import {
    contentIdSchema,
    contentListQuerySchema,
    createContentSchema,
    updateContentSchema,
} from "@myapp/types/schemas";
import { publicProcedure, router } from "../lib/trpc";

export const contentRouter = router({
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
        if (!ctx.user) throw new Error("Unauthorized");

        const result = await ctx.prisma.contentManagement.create({
            data: input,
            include: {
                owner: {
                    select: { id: true, name: true, employee_code: true },
                },
            },
        });

        await ctx.prisma.auditEvent.create({
            data: {
                userId: ctx.user.id,
                action: "upload",
                documentId: result.fileID,
                fileName: result.filename,
            },
        });

        return result;
    }),

    update: publicProcedure
        .input(contentIdSchema.merge(updateContentSchema))
        .mutation(async ({ ctx, input }) => {
            if (!ctx.user) throw new Error("Unauthorized");

            const { fileID, ...data } = input;

            const result = await ctx.prisma.contentManagement.update({
                where: { fileID },
                data,
                include: {
                    owner: {
                        select: { id: true, name: true, employee_code: true },
                    },
                },
            });

            await ctx.prisma.auditEvent.create({
                data: {
                    userId: ctx.user.id,
                    action: "edit",
                    documentId: fileID,
                    fileName: result.filename,
                },
            });

            return result;
        }),

    delete: publicProcedure.input(contentIdSchema).mutation(async ({ ctx, input }) => {
        if (!ctx.user) throw new Error("Unauthorized");

        const result = await ctx.prisma.contentManagement.delete({
            where: { fileID: input.fileID },
        });

        await ctx.prisma.auditEvent.create({
            data: {
                userId: ctx.user.id,
                action: "delete",
                documentId: input.fileID,
            },
        });

        return result;
    }),
});