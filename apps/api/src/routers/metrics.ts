import { router, adminPortalProcedure } from "../lib/trpc";

export const metricsRouter = router({
    /**
     * OVERVIEW
     */
    getOverview: adminPortalProcedure.query(async ({ ctx }) => {
        const [totalRequests, errors, activeUsers] = await Promise.all([
            ctx.prisma.metricsEvent.count(),
            ctx.prisma.metricsEvent.count({
                where: { status: "ERROR" },
            }),
            ctx.prisma.metricsEvent.findMany({
                select: { userId: true },
                distinct: ["userId"],
            }),
        ]);

        const errorRate = totalRequests === 0 ? 0 : errors / totalRequests;

        return {
            totalRequests,
            errors,
            activeUsers: activeUsers.length,
            errorRate,
        };
    }),

    /**
     * RECENT ACTIVITY
     */
    getRecent: adminPortalProcedure.query(async ({ ctx }) => {
        return ctx.prisma.metricsEvent.findMany({
            orderBy: { createdAt: "desc" },
            take: 50,
        });
    }),

    /**
     * SLOW ROUTES (optimized grouping)
     */
    getSlowestRoutes: adminPortalProcedure.query(async ({ ctx }) => {
        const data = await ctx.prisma.metricsEvent.findMany({
            select: {
                route: true,
                durationMs: true,
            },
        });

        const grouped = new Map<string, { total: number; count: number }>();

        for (const d of data) {
            if (!grouped.has(d.route)) {
                grouped.set(d.route, { total: 0, count: 0 });
            }

            const entry = grouped.get(d.route)!;
            entry.total += d.durationMs;
            entry.count += 1;
        }

        return Array.from(grouped.entries()).map(([route, v]) => ({
            route,
            avgDuration: v.total / v.count,
        }));
    }),

    getActiveUsers: adminPortalProcedure.query(async ({ ctx }) => {
        const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000);

        return ctx.prisma.userSession.findMany({
            where: {
                lastSeen: { gte: fiveMinAgo },
            },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        name: true,
                        role: true,
                    },
                },
            },
        });
    }),

    getPerformance: adminPortalProcedure.query(async ({ ctx }) => {
        const data = await ctx.prisma.metricsEvent.findMany();

        const grouped = new Map<string, number[]>();

        for (const d of data) {
            if (!grouped.has(d.route)) grouped.set(d.route, []);
            grouped.get(d.route)!.push(d.durationMs);
        }

        return Array.from(grouped.entries()).map(([route, times]) => ({
            route,
            avgDuration:
                times.reduce((a, b) => a + b, 0) / times.length,
        }));
    }),
});