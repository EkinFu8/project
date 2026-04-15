import { initTRPC } from "@trpc/server";
import type { Context } from "../context";

const t = initTRPC.context<Context>().create();

export const metricsMiddleware = t.middleware(async ({ ctx, path, type, next }) => {
    const start = Date.now();

    const userId = ctx.user?.id ?? null;

    try {
        const result = await next();
        const duration = Date.now() - start;

        await ctx.prisma.metricsEvent.create({
            data: {
                route: path,
                method: type,
                status: "OK",
                durationMs: duration,
                userId,
                userRole: ctx.user?.role ?? null,
            },
        });

        if (userId) {
            await ctx.prisma.userSession.upsert({
                where: { userId },
                update: { lastSeen: new Date() },
                create: { userId },
            });
        }

        return result;
    } catch (err) {
        const duration = Date.now() - start;

        await ctx.prisma.metricsEvent.create({
            data: {
                route: path,
                method: type,
                status: "ERROR",
                durationMs: duration,
                userId,
                userRole: ctx.user?.role ?? null,
            },
        });

        throw err;
    }
});