import {
  contentIdSchema,
  contentListQuerySchema,
  createContentSchema,
  updateContentSchema,
} from "@myapp/types/schemas";
import { publicProcedure, router } from "../lib/trpc";

const ownerSelect = {
  id: true,
  name: true,
  employee_code: true,
  role: true,
} as const;

const tagsInclude = {
  content_tags: {
    include: {
      tag: true,
    },
  },
} as const;

export const contentRouter = router({
  list: publicProcedure.input(contentListQuerySchema).query(async ({ ctx, input }) => {
    const where: Record<string, unknown> = {};

    if (input.document_status) {
      where.document_status = input.document_status;
    }

    if (input.content_type) where.content_type = input.content_type;

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
      orderBy: [{ is_favorited: "desc" }, { last_modified: "desc" }],
      include: {
        owner: { select: ownerSelect },
        ...tagsInclude,
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
        ...tagsInclude,
      },
    });
  }),

  create: publicProcedure.input(createContentSchema).mutation(async ({ ctx, input }) => {
    const { tagIds, ...rest } = input;
    return ctx.prisma.contentManagement.create({
      data: {
        ...rest,
        ...(tagIds && tagIds.length > 0
          ? { content_tags: { create: tagIds.map((id) => ({ tagId: id })) } }
          : {}),
      },
      include: {
        owner: { select: ownerSelect },
        ...tagsInclude,
      },
    });
  }),

  update: publicProcedure
    .input(contentIdSchema.merge(updateContentSchema))
    .mutation(async ({ ctx, input }) => {
      const { fileID, tagIds, ...data } = input;

      // If tagIds is provided, replace all tags for this content item.
      // After replacing, clean up any tags that are now orphaned.
      if (tagIds !== undefined) {
        const result = await ctx.prisma.contentManagement.update({
          where: { fileID },
          data: {
            ...data,
            content_tags: {
              deleteMany: {},
              create: tagIds.map((id) => ({ tagId: id })),
            },
          },
          include: {
            owner: { select: ownerSelect },
            ...tagsInclude,
          },
        });

        // Clean up orphaned tags (tags with no content items)
        await ctx.prisma.tag.deleteMany({
          where: { content_tags: { none: {} } },
        });

        return result;
      }

      return ctx.prisma.contentManagement.update({
        where: { fileID },
        data,
        include: {
          owner: { select: ownerSelect },
          ...tagsInclude,
        },
      });
    }),

  delete: publicProcedure.input(contentIdSchema).mutation(async ({ ctx, input }) => {
    const result = await ctx.prisma.contentManagement.delete({
      where: { fileID: input.fileID },
    });

    // Clean up orphaned tags after content deletion
    await ctx.prisma.tag.deleteMany({
      where: { content_tags: { none: {} } },
    });

    return result;
  }),
});
