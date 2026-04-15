import { initTRPC, TRPCError } from "@trpc/server";
import type { Context } from "../context";
import { metricsMiddleware } from "../middleware/metrics";

const t = initTRPC.context<Context>().create();

export const router = t.router;

/**
 * Always track metrics FIRST
 */
const baseProcedure = t.procedure.use(metricsMiddleware);

/**
 * PUBLIC (tracked)
 */
export const publicProcedure = baseProcedure;

/**
 * AUTH middleware
 */
const authMiddleware = t.middleware(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  });
});

/**
 * PROTECTED = metrics + auth
 */
export const protectedProcedure = baseProcedure.use(authMiddleware);

/**
 * ADMIN = metrics + auth + role check
 */
export const adminPortalProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  const profile = await ctx.prisma.userProfile.findUnique({
    where: { id: ctx.user.id },
    select: { id: true, portal: true },
  });

  if (!profile || !["admin", "employee"].includes(profile.portal)) {
    throw new TRPCError({ code: "FORBIDDEN" });
  }

  return next({
    ctx: {
      ...ctx,
      profile,
    },
  });
});