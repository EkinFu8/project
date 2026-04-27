import { protectedProcedure, router } from "../lib/trpc";

function normalizeRole(role?: string | null) {
  return (role ?? "").toLowerCase().replace(/\s+/g, "-").trim();
}

function roleVariants(role?: string | null) {
  const normalized = normalizeRole(role);
  if (!normalized) return [];
  return [
    normalized,
    normalized.replace(/-/g, " "),
    normalized.charAt(0).toUpperCase() + normalized.slice(1).replace(/-/g, " "),
  ];
}

const REVIEW_LOOKAHEAD_MS = 30 * 24 * 60 * 60 * 1000;

export const notificationsRouter = router({
  myList: protectedProcedure.query(async ({ ctx }) => {
    const profile = await ctx.prisma.userProfile.findUnique({
      where: { id: ctx.user.id },
      select: { role: true },
    });

    const isAdmin = profile?.role === "admin";
    // Only content for this user's job bucket; admins see everything (same spirit as content list by role).
    const where = isAdmin
      ? {}
      : {
          OR: [{ job_position: null }, { job_position: { in: roleVariants(profile?.role) } }],
        };

    const content = await ctx.prisma.contentManagement.findMany({
      where,
      select: {
        fileID: true,
        filename: true,
        expiration_date: true,
      },
      orderBy: { fileID: "asc" },
    });

    const byFileId = new Map(content.map((row) => [row.fileID, row]));
    const ids = content.map((row) => row.fileID);

    const changeEvents =
      ids.length === 0
        ? []
        : await ctx.prisma.auditEvent.findMany({
            where: {
              action: { in: ["upload", "edit"] },
              documentId: { in: ids },
            },
            select: {
              id: true,
              action: true,
              createdAt: true,
              fileName: true,
              documentId: true,
              user: { select: { name: true } },
            },
            orderBy: { createdAt: "desc" },
            take: 100,
          });

    const ownershipEvents =
      ids.length === 0
        ? []
        : await ctx.prisma.auditEvent.findMany({
            where: {
              action: "ownership-update",
              documentId: { in: ids },
            },
            select: {
              id: true,
              createdAt: true,
              fileName: true,
              documentId: true,
              metadata: true,
              user: { select: { name: true } },
            },
            orderBy: { createdAt: "desc" },
            take: 100,
          });

    const now = Date.now();
    const reviewHorizon = now + REVIEW_LOOKAHEAD_MS;

    const rows = [
      ...changeEvents.map((event) => {
        const docId = event.documentId ?? "";
        const fallbackName = docId ? byFileId.get(docId)?.filename : undefined;
        return {
          id: `change-${event.id}`,
          type: "document-change" as const,
          createdAt: event.createdAt,
          fileID: docId,
          fileName: event.fileName ?? fallbackName ?? docId || "Unknown document",
          message:
            event.action === "upload" ? "New content was added." : "This item was updated.",
          actorName: event.user?.name ?? null,
        };
      }),
      ...content
        .filter((row) => {
          if (!row.expiration_date) return false;
          return row.expiration_date.getTime() <= reviewHorizon;
        })
        .map((row) => {
          const t = (row.expiration_date as Date).getTime();
          const overdue = t < now;
          return {
            id: `expiration-${row.fileID}`,
            type: "expiration" as const,
            createdAt: row.expiration_date as Date,
            fileID: row.fileID,
            fileName: row.filename ?? row.fileID,
            message: overdue
              ? "Review date passed — follow up."
              : "Review due in the next 30 days.",
          };
        }),
      ...ownershipEvents.map((event) => {
        const meta = (event.metadata ?? {}) as {
          oldOwnerName?: string | null;
          newOwnerName?: string | null;
        };
        const from = meta.oldOwnerName ?? "Unassigned";
        const to = meta.newOwnerName ?? "Unassigned";
        return {
          id: `ownership-${event.id}`,
          type: "ownership-update" as const,
          createdAt: event.createdAt,
          fileID: event.documentId ?? "",
          fileName: event.fileName ?? event.documentId ?? "Unknown document",
          message: `Owner changed (${from} → ${to}).`,
          actorName: event.user?.name ?? null,
        };
      }),
    ];

    return rows.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).slice(0, 100);
  }),
});
