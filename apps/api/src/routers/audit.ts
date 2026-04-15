import { adminPortalProcedure, router } from "../lib/trpc";

export const auditRouter = router({
  getRecent: adminPortalProcedure.query(async ({ ctx }) => {
    return ctx.prisma.auditEvent.findMany({
      select: {
        id: true,
        action: true,
        fileName: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            name: true,
            employee_code: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
  }),

  getSummary: adminPortalProcedure.query(async ({ ctx }) => {
    const [uploads, downloads, edits, deletes] = await Promise.all([
      ctx.prisma.auditEvent.count({ where: { action: "upload" } }),
      ctx.prisma.auditEvent.count({ where: { action: "download" } }),
      ctx.prisma.auditEvent.count({ where: { action: "edit" } }),
      ctx.prisma.auditEvent.count({ where: { action: "delete" } }),
    ]);

    return { uploads, downloads, edits, deletes };
  }),

  getTopUsers: adminPortalProcedure.query(async ({ ctx }) => {
    const events = await ctx.prisma.auditEvent.findMany({
      select: { userId: true },
    });

    const map = new Map<string, number>();

    for (const e of events) {
      map.set(e.userId, (map.get(e.userId) ?? 0) + 1);
    }

    return Array.from(map.entries()).map(([userId, count]) => ({
      userId,
      count,
    }));
  }),
});
