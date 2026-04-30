import {
  contentIdSchema,
  contentListQuerySchema,
  createContentSchema,
  FORMAT_GROUPS,
  NAMED_EXTENSIONS,
  updateContentSchema,
} from "@myapp/types/schemas";
import type { Prisma } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { protectedProcedure, router } from "../lib/trpc";
import { enqueueOcr } from "../services/ocr-queue";

const ownerSelect = {
  id: true,
  name: true,
  employee_code: true,
  role: true,
} as const;

const checkedOutByUserSelect = {
  id: true,
  name: true,
} as const;

const tagsInclude = {
  content_tags: {
    include: {
      tag: true,
    },
  },
} as const;

function assertCanEdit(
  file: { is_checked_out: boolean; checked_out_by: string | null } | null,
  userId: string,
  userRole?: string | null,
) {
  if (!file) throw new Error("File not found");
  if (userRole === "admin") return;
  if (!file.is_checked_out || file.checked_out_by !== userId) {
    throw new Error("You must check out this item before modifying or deleting it");
  }
}

function extractFormat(filename: string | null | undefined): string | null {
  if (!filename) return null;
  const ext = filename.split(".").pop()?.toLowerCase() ?? "";
  if (!ext) return null;
  return NAMED_EXTENSIONS.includes(ext as never) ? ext : "other";
}

function normalizeRole(role?: string | null) {
  return (role ?? "").toLowerCase().replace(/\s+/g, "-").trim();
}

function canEditForRole(
  userRole: string | null | undefined,
  jobPosition: string | null | undefined,
): boolean {
  if (!userRole) return false;
  if (userRole === "admin") return true;
  if (!jobPosition?.trim()) return true;
  return normalizeRole(userRole) === normalizeRole(jobPosition);
}

function isAdminRole(userRole: string | null | undefined): boolean {
  return normalizeRole(userRole) === "admin";
}

function roleVariants(role: string) {
  const normalized = normalizeRole(role);
  const spaced = normalized.replace(/-/g, " ");
  return [
    normalized,
    spaced,
    normalized.charAt(0).toUpperCase() + normalized.slice(1).replace(/-/g, " "),
  ];
}

export const contentRouter = router({
  toggleFavorite: protectedProcedure.input(contentIdSchema).mutation(async ({ ctx, input }) => {
    const userId = ctx.user.id;

    const file = await ctx.prisma.contentManagement.findUnique({
      where: { fileID: input.fileID },
      select: { job_position: true },
    });
    if (!file) throw new TRPCError({ code: "NOT_FOUND", message: "File not found" });

    const existing = await ctx.prisma.favorite.findUnique({
      where: {
        userId_fileID: {
          userId,
          fileID: input.fileID,
        },
      },
    });

    if (existing) {
      await ctx.prisma.favorite.deleteMany({
        where: {
          userId,
          fileID: input.fileID,
        },
      });

      return { favorited: false };
    }

    await ctx.prisma.favorite.create({
      data: {
        userId,
        fileID: input.fileID,
      },
    });
    return { favorited: true };
  }),

  trackDownload: protectedProcedure.input(contentIdSchema).mutation(async ({ ctx, input }) => {
    const userId = ctx.user.id;

    const file = await ctx.prisma.contentManagement.findUnique({
      where: { fileID: input.fileID },
      select: { filename: true, job_position: true },
    });
    if (!file) throw new TRPCError({ code: "NOT_FOUND", message: "File not found" });

    await ctx.prisma.auditEvent.create({
      data: {
        userId,
        action: "download",
        documentId: input.fileID,
        fileName: file?.filename ?? null,
      },
    });

    return { success: true };
  }),

  trackView: protectedProcedure.input(contentIdSchema).mutation(async ({ ctx, input }) => {
    const userId = ctx.user.id;
    const currentFile = await ctx.prisma.contentManagement.findUnique({
      where: { fileID: input.fileID },
      select: { job_position: true },
    });
    if (!currentFile) throw new TRPCError({ code: "NOT_FOUND", message: "File not found" });

    const viewedAt = new Date();
    const file = await ctx.prisma.contentManagement.update({
      where: { fileID: input.fileID },
      data: {
        view_count: { increment: 1 },
        last_viewed_at: viewedAt,
      },
      select: {
        filename: true,
        view_count: true,
        last_viewed_at: true,
      },
    });

    await ctx.prisma.auditEvent.create({
      data: {
        userId,
        action: "view",
        documentId: input.fileID,
        fileName: file.filename,
        metadata: {
          viewCount: file.view_count,
          viewedAt: (file.last_viewed_at ?? viewedAt).toISOString(),
        },
      },
    });

    return { success: true, viewCount: file.view_count };
  }),

  checkout: protectedProcedure.input(contentIdSchema).mutation(async ({ ctx, input }) => {
    const userId = ctx.user.id;
    const userRole = ctx.profile?.role;

    const file = await ctx.prisma.contentManagement.findUnique({
      where: { fileID: input.fileID },
      select: { is_checked_out: true, checked_out_by: true, job_position: true },
    });
    if (!file) throw new Error("File not found");

    if (!canEditForRole(userRole, file.job_position)) {
      throw new Error("You do not have permission to edit this content");
    }

    const result = await ctx.prisma.contentManagement.updateMany({
      where: {
        fileID: input.fileID,
        OR: [{ is_checked_out: false }, { checked_out_by: userId }],
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

  checkoutOverdue: protectedProcedure.mutation(async ({ ctx }) => {
    const userId = ctx.user.id;
    const userRole = ctx.profile?.role;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const roleWhere = isAdminRole(userRole)
      ? {}
      : {
          job_position: {
            in: roleVariants(userRole ?? ""),
          },
        };

    const overdueFiles = await ctx.prisma.contentManagement.findMany({
      where: {
        ...roleWhere,
        OR: [{ expiration_date: { lt: today } }, { next_review_date: { lt: today } }],
      },
      select: {
        fileID: true,
        filename: true,
        job_position: true,
        is_checked_out: true,
        checked_out_by: true,
        checked_out_by_user: { select: checkedOutByUserSelect },
      },
      orderBy: [{ next_review_date: "asc" }, { expiration_date: "asc" }],
    });

    const checkedOut: { fileID: string; filename: string | null }[] = [];
    const skipped: { fileID: string; filename: string | null; reason: string }[] = [];

    for (const file of overdueFiles) {
      if (!canEditForRole(userRole, file.job_position)) {
        skipped.push({
          fileID: file.fileID,
          filename: file.filename,
          reason: "You do not have permission to edit this file.",
        });
        continue;
      }

      if (file.is_checked_out && file.checked_out_by && file.checked_out_by !== userId) {
        skipped.push({
          fileID: file.fileID,
          filename: file.filename,
          reason: `Already checked out by ${file.checked_out_by_user?.name ?? "another user"}.`,
        });
        continue;
      }

      const result = await ctx.prisma.contentManagement.updateMany({
        where: {
          fileID: file.fileID,
          OR: [{ is_checked_out: false }, { checked_out_by: userId }],
        },
        data: {
          is_checked_out: true,
          checked_out_by: userId,
          checked_out_at: new Date(),
        },
      });

      if (result.count === 0) {
        skipped.push({
          fileID: file.fileID,
          filename: file.filename,
          reason: "Could not check out this file.",
        });
        continue;
      }

      checkedOut.push({ fileID: file.fileID, filename: file.filename });
    }

    return {
      success: true,
      checkedOut,
      skipped,
      totalOverdue: overdueFiles.length,
    };
  }),

  forceUnlock: protectedProcedure.input(contentIdSchema).mutation(async ({ ctx, input }) => {
    const userRole = ctx.profile?.role;
    if (!isAdminRole(userRole)) {
      throw new TRPCError({ code: "FORBIDDEN", message: "Only admins can force unlock files" });
    }

    const file = await ctx.prisma.contentManagement.findUnique({
      where: { fileID: input.fileID },
    });

    if (!file) throw new Error("File not found");

    return ctx.prisma.contentManagement.update({
      where: { fileID: input.fileID },
      data: {
        is_checked_out: false,
        checked_out_by: null,
        checked_out_at: null,
      },
    });
  }),

  checkin: protectedProcedure.input(contentIdSchema).mutation(async ({ ctx, input }) => {
    const userId = ctx.user.id;

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

  list: protectedProcedure.input(contentListQuerySchema).query(async ({ ctx, input }) => {
    const where: Record<string, unknown> = {};
    const userId = ctx.user.id;

    if (input.document_status) {
      where.document_status = input.document_status;
    }

    if (input.content_type) {
      where.content_type = input.content_type;
    }

    if (input.owner_id) {
      where.owner_id = input.owner_id;
    }

    const requestedRole = input.role && input.role !== "all" ? input.role : undefined;
    if (requestedRole) {
      where.job_position = {
        in: roleVariants(requestedRole.toLowerCase()),
      };
    }

    // Map of fileID → matchedInContent (true when hit came from body, not title)
    const matchedInContentMap = new Map<string, boolean>();

    if (input.search) {
      type FtsRow = { fileid: string; matched_in_content: boolean };
      const ftsRows = await ctx.prisma.$queryRaw<FtsRow[]>`
        SELECT
          fileid,
          (
            to_tsvector('english', coalesce(extracted_text, ''))
              @@ plainto_tsquery('english', ${input.search})
            AND NOT
            to_tsvector('english', coalesce(filename, ''))
              @@ plainto_tsquery('english', ${input.search})
          ) AS matched_in_content
        FROM content_management
        WHERE search_vector @@ plainto_tsquery('english', ${input.search})
      `;

      if (ftsRows.length === 0) {
        return [];
      }

      for (const row of ftsRows) {
        matchedInContentMap.set(row.fileid.trim(), row.matched_in_content);
      }

      where.fileID = { in: [...matchedInContentMap.keys()] };
    }

    if (input.formats && input.formats.length > 0) {
      const exts = input.formats.flatMap((f) =>
        f in FORMAT_GROUPS ? [...FORMAT_GROUPS[f as keyof typeof FORMAT_GROUPS]] : [],
      );
      if (exts.length > 0) {
        where.format = { in: exts };
      }
    }

    if (input.tagIds && input.tagIds.length > 0) {
      const mode = input.tagMatchMode ?? "any";
      if (mode === "all") {
        where.AND = input.tagIds.map((id) => ({
          content_tags: { some: { tagId: id } },
        }));
      } else {
        where.content_tags = { some: { tagId: { in: input.tagIds } } };
      }
    }

    const results = await ctx.prisma.contentManagement.findMany({
      where,
      orderBy: [
        {
          job_position: { sort: "asc", nulls: "last" },
        },
        {
          favoritedBy: {
            _count: "desc",
          },
        },
        {
          last_modified: "desc",
        },
      ],
      include: {
        owner: { select: ownerSelect },
        checked_out_by_user: { select: checkedOutByUserSelect },
        ...tagsInclude,
        favoritedBy: userId
          ? {
              where: { userId },
              select: { fileID: true },
            }
          : false,
      },
    });

    const base =
      input.pinnedTagId !== undefined
        ? (() => {
            const pinnedId = input.pinnedTagId;

            const pinned = results.filter((r) =>
              r.content_tags.some((ct) => ct.tagId === pinnedId),
            );

            const unpinned = results.filter(
              (r) => !r.content_tags.some((ct) => ct.tagId === pinnedId),
            );

            return [...pinned, ...unpinned];
          })()
        : results;

    return base
      .map((r) => ({
        ...r,
        is_favorited: (r.favoritedBy?.length ?? 0) > 0,
        matched_in_content: matchedInContentMap.get(r.fileID) ?? false,
      }))
      .sort((a, b) => {
        // 1. favorites first
        const favDiff = Number(b.is_favorited) - Number(a.is_favorited);
        if (favDiff !== 0) return favDiff;

        const aPos = a.job_position ?? "\uffff"; // nulls go to the end
        const bPos = b.job_position ?? "\uffff";
        if (aPos !== bPos) return aPos.localeCompare(bPos);

        // 2. pinned tags (optional enhancement)
        const pinnedId = input.pinnedTagId;

        if (pinnedId !== undefined) {
          const aPinned = a.content_tags.some((t) => t.tagId === pinnedId);
          const bPinned = b.content_tags.some((t) => t.tagId === pinnedId);

          const pinnedDiff = Number(bPinned) - Number(aPinned);
          if (pinnedDiff !== 0) return pinnedDiff;
        }

        // 4. fallback: last modified
        return new Date(b.last_modified ?? 0).getTime() - new Date(a.last_modified ?? 0).getTime();
      });
  }),

  getById: protectedProcedure.input(contentIdSchema).query(async ({ ctx, input }) => {
    const row = await ctx.prisma.contentManagement.findUniqueOrThrow({
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
        checked_out_by_user: { select: checkedOutByUserSelect },
        ...tagsInclude,
      },
      // extracted_text and ocr_status are plain scalar fields — included by default.
    });
    return row;
  }),

  create: protectedProcedure.input(createContentSchema).mutation(async ({ ctx, input }) => {
    const userId = ctx.user.id;
    const userRole = ctx.profile?.role;
    if (!canEditForRole(userRole, input.job_position)) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "You cannot create content for this role",
      });
    }

    const { tagIds, owner_id, ...rest } = input;

    const format = extractFormat(input.filename);

    const data: Prisma.ContentManagementCreateInput = {
      ...rest,
      format,
      owner: owner_id
        ? {
            connect: { id: owner_id },
          }
        : undefined,
    };

    const result = await ctx.prisma.contentManagement.create({
      data:
        tagIds && tagIds.length > 0
          ? {
              ...data,
              content_tags: {
                create: tagIds.map((id) => ({ tagId: id })),
              },
            }
          : data,
      include: {
        owner: { select: ownerSelect },
        checked_out_by_user: { select: checkedOutByUserSelect },
        ...tagsInclude,
      },
    });

    await ctx.prisma.auditEvent.create({
      data: {
        userId,
        action: "upload",
        documentId: result.fileID,
        fileName: result.filename,
      },
    });

    // Kick off background OCR — fire-and-forget, does not block the response.
    enqueueOcr(result.fileID);

    return result;
  }),

  update: protectedProcedure
    .input(contentIdSchema.merge(updateContentSchema))
    .mutation(async ({ ctx, input }) => {
      const { fileID, tagIds, owner_id, ...data } = input;

      const userId = ctx.user.id;

      if (data.filename !== undefined) {
        (data as typeof data & { format?: string | null }).format = extractFormat(data.filename);
      }

      const userRole = ctx.profile?.role;

      const file = await ctx.prisma.contentManagement.findUnique({
        where: { fileID },
      });

      if (!file) throw new Error("File not found");
      assertCanEdit(file, userId, userRole);

      if (!canEditForRole(userRole, file?.job_position)) {
        throw new Error("You do not have permission to edit this content");
      }

      const urlChanged = data.url !== undefined && data.url !== file?.url;

      // If the file URL changed, reset OCR so the new file gets re-extracted.
      if (urlChanged) {
        (
          data as typeof data & { extracted_text?: null; ocr_status?: string; ocr_error?: null }
        ).extracted_text = null;
        (data as typeof data & { ocr_status?: string }).ocr_status = "pending";
        (data as typeof data & { ocr_error?: null }).ocr_error = null;
      }

      const result =
        tagIds !== undefined
          ? await ctx.prisma.contentManagement.update({
              where: { fileID },
              data: {
                ...data,
                owner_id,
                content_tags: {
                  deleteMany: {},
                  create: tagIds.map((id) => ({ tagId: id })),
                },
              } as Prisma.ContentManagementUpdateInput,
              include: {
                owner: { select: ownerSelect },
                checked_out_by_user: { select: checkedOutByUserSelect },
                ...tagsInclude,
              },
            })
          : await ctx.prisma.contentManagement.update({
              where: { fileID },
              data: {
                ...data,
                owner_id,
              } as Prisma.ContentManagementUncheckedUpdateInput,
              include: {
                owner: { select: ownerSelect },
                checked_out_by_user: { select: checkedOutByUserSelect },
                ...tagsInclude,
              },
            });

      await ctx.prisma.auditEvent.create({
        data: {
          userId,
          action: "edit",
          documentId: fileID,
          fileName: result.filename,
        },
      });

      if (input.owner_id !== undefined && file.owner_id !== input.owner_id) {
        const [oldOwner, newOwner] = await Promise.all([
          file.owner_id
            ? ctx.prisma.userProfile.findUnique({
                where: { id: file.owner_id },
                select: { name: true },
              })
            : Promise.resolve(null),
          input.owner_id
            ? ctx.prisma.userProfile.findUnique({
                where: { id: input.owner_id },
                select: { name: true },
              })
            : Promise.resolve(null),
        ]);

        await ctx.prisma.auditEvent.create({
          data: {
            userId,
            action: "ownership-update",
            documentId: fileID,
            fileName: result.filename,
            metadata: {
              oldOwnerId: file.owner_id,
              newOwnerId: input.owner_id,
              oldOwnerName: oldOwner?.name ?? null,
              newOwnerName: newOwner?.name ?? null,
            },
          },
        });
      }
      // Re-run OCR if the file URL changed.
      if (urlChanged) enqueueOcr(fileID);

      return result;
    }),

  delete: protectedProcedure.input(contentIdSchema).mutation(async ({ ctx, input }) => {
    const userId = ctx.user.id;
    const userRole = ctx.profile?.role;

    const file = await ctx.prisma.contentManagement.findUnique({
      where: { fileID: input.fileID },
    });

    if (!file) throw new Error("File not found");
    assertCanEdit(file, userId, userRole);

    const result = await ctx.prisma.contentManagement.delete({
      where: { fileID: input.fileID },
    });

    await ctx.prisma.tag.deleteMany({
      where: { content_tags: { none: {} } },
    });

    await ctx.prisma.auditEvent.create({
      data: {
        userId,
        action: "delete",
        documentId: input.fileID,
      },
    });

    return result;
  }),
});
