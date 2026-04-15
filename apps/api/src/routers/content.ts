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
  checkout: publicProcedure.input(contentIdSchema).mutation(async ({ ctx, input }) => {
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

  forceUnlock: publicProcedure.input(contentIdSchema).mutation(async ({ ctx, input }) => {
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

  checkin: publicProcedure.input(contentIdSchema).mutation(async ({ ctx, input }) => {
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
    const { tagIds, owner_id, ...rest } = input;
    return ctx.prisma.contentManagement.create({
      data: {
        ...rest,
        owner_id,
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
      const { fileID, tagIds, owner_id, ...data } = input;
      const userId = ctx.user?.id;
      if (!userId) throw new Error("Not authenticated");

      const file = await ctx.prisma.contentManagement.findUnique({
        where: { fileID },
      });

      assertCanEdit(file, userId);

      // If tagIds is provided, replace all tags for this content item.
      // After replacing, clean up any tags that are now orphaned.
      if (tagIds !== undefined) {
        const result = await ctx.prisma.contentManagement.update({
          where: { fileID },
          data: {
            ...data,
            owner_id,
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
        data: { ...data, owner_id },
        include: {
          owner: { select: ownerSelect },
          ...tagsInclude,
        },
      });
    }),

  delete: publicProcedure.input(contentIdSchema).mutation(async ({ ctx, input }) => {
    const userId = ctx.user?.id;
    if (!userId) throw new Error("Not authenticated");

    const file = await ctx.prisma.contentManagement.findUnique({
      where: { fileID: input.fileID },
    });

    if (!file) throw new Error("File not found");
    assertCanEdit(file, userId);

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
