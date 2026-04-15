import { createTagSchema, tagIdSchema } from "@myapp/types/schemas";
import { publicProcedure, router } from "../lib/trpc";

export const tagRouter = router({
  // List all tags in the global pool
  list: publicProcedure.query(async ({ ctx }) => {
    return ctx.prisma.tag.findMany({
      orderBy: { name: "asc" },
    });
  }),

  // Create a new tag — returns existing tag if name already exists
  create: publicProcedure.input(createTagSchema).mutation(async ({ ctx, input }) => {
    return ctx.prisma.tag.upsert({
      where: { name: input.name },
      update: {},
      create: { name: input.name },
    });
  }),

  // Delete a tag only if no content items use it anymore
  deleteIfUnused: publicProcedure.input(tagIdSchema).mutation(async ({ ctx, input }) => {
    const usageCount = await ctx.prisma.contentTag.count({
      where: { tagId: input.id },
    });
    if (usageCount === 0) {
      await ctx.prisma.tag.delete({ where: { id: input.id } });
    }
  }),
});
