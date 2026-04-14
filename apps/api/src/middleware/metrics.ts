import { initTRPC } from "@trpc/server";
import type { Context } from "../context";

const t = initTRPC.context<Context>().create();

export const metricsMiddleware = t.middleware(async ({ ctx, path, type, next }) => {
    const start = Date.now();

    try {
        const result = await next();

        const duration = Date.now() - start;

        await ctx.prisma.requestMetric.create({
            data: {
                route: path,
                method: type,
                status: "OK",
                durationMs: duration,
                userId: ctx.user?.id,
            },
        });

        return result;
    } catch (err) {
        const duration = Date.now() - start;

        await ctx.prisma.requestMetric.create({
            data: {
                route: path,
                method: type,
                status: "ERROR",
                durationMs: duration,
                userId: ctx.user?.id,
            },
        });

        throw err;
    }
});