import { directoryEntryIdSchema, directoryListQuerySchema } from "@myapp/types/schemas";
import type { Prisma } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { protectedProcedure, router } from "../lib/trpc";

function listWhere(
  ctx: { user: { id: string } },
  input: {
    search?: string | undefined;
    coworkersOnly?: boolean | undefined;
    employeePortalOnly?: boolean | undefined;
  },
): Prisma.UserProfileWhereInput | undefined {
  const filters: Prisma.UserProfileWhereInput[] = [];

  if (input.coworkersOnly) {
    filters.push({ portal: "employee", id: { not: ctx.user.id } });
  } else if (input.employeePortalOnly) {
    filters.push({ portal: "employee" });
  }

  if (input.search && input.search.trim() !== "") {
    const s = input.search.trim();
    filters.push({
      OR: [
        { name: { contains: s, mode: "insensitive" as const } },
        { email: { contains: s, mode: "insensitive" as const } },
        { employee_code: { contains: s, mode: "insensitive" as const } },
        { job_desc: { contains: s, mode: "insensitive" as const } },
      ],
    });
  }

  if (filters.length === 0) return undefined;
  if (filters.length === 1) return filters[0];
  return { AND: filters };
}

/** Employee directory — unified `public.users` profiles. */
export const employeeRouter = router({
  list: protectedProcedure.input(directoryListQuerySchema).query(async ({ ctx, input }) => {
    const viewer = await ctx.prisma.userProfile.findUnique({
      where: { id: ctx.user.id },
      select: { portal: true },
    });
    if (!viewer) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Profile not found." });
    }

    const coworkersOnly = input.coworkersOnly;
    let employeePortalOnly = input.employeePortalOnly;

    if (viewer.portal === "employee") {
      if (!coworkersOnly && !employeePortalOnly) {
        employeePortalOnly = true;
      }
    }

    const where = listWhere(ctx, { ...input, coworkersOnly, employeePortalOnly });

    return ctx.prisma.userProfile.findMany({
      where,
      orderBy: { name: "asc" },
      include: {
        _count: { select: { owned_content: true } },
      },
    });
  }),

  getById: protectedProcedure.input(directoryEntryIdSchema).query(async ({ ctx, input }) => {
    const row = await ctx.prisma.userProfile.findUniqueOrThrow({
      where: { id: input.id },
      include: {
        owned_content: {
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

    const viewer = await ctx.prisma.userProfile.findUnique({
      where: { id: ctx.user.id },
      select: { portal: true },
    });
    if (!viewer) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Profile not found." });
    }

    if (viewer.portal === "employee") {
      if (row.portal !== "employee" || row.id === ctx.user.id) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Profile not found." });
      }
    }

    return row;
  }),
});
