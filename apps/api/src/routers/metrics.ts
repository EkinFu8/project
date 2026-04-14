import { router, adminPortalProcedure } from "../lib/trpc";

export const metricsRouter = router({
    getSummary: adminPortalProcedure.query(async ({ ctx }) => {
        const total = await ctx.prisma.requestMetric.count();

        const errors = await ctx.prisma.requestMetric.count({
            where: { status: "ERROR" },
        });

        const avgDuration = await ctx.prisma.requestMetric.aggregate({
            _avg: { durationMs: true },
        });

        const byRoute = await ctx.prisma.requestMetric.groupBy({
            by: ["route"],
            _count: true,
        });

        return {
            total,
            errors,
            avgDuration: avgDuration._avg.durationMs,
            byRoute,
        };
    }),
});