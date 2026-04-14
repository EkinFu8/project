import { initTRPC, TRPCError } from "@trpc/server";
import type { Context } from "../context";
import { metricsMiddleware } from "../middleware/metrics";

const t = initTRPC.context<Context>().create();

export const router = t.router;

/**
 * PUBLIC: metrics only (no auth required)
 */
export const publicProcedure = t.procedure.use(metricsMiddleware);

/**
 * AUTH middleware (runs after metrics)
 */
const authMiddleware = t.middleware(async ({ ctx, next }) => {
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
 * PROTECTED: auth + metrics
 */
export const protectedProcedure = t.procedure
    .use(authMiddleware)
    .use(metricsMiddleware);

/**
 * ADMIN: auth + metrics + role check
 */
export const adminPortalProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  const profile = await ctx.prisma.userProfile.findUnique({
    where: { id: ctx.user!.id },
    select: { id: true, portal: true },
  });

  const role = profile?.portal;

  if (!profile || (role !== "admin" && role !== "employee")) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Admin application access only.",
    });
  }

  return next({
    ctx: {
      ...ctx,
      profile,
    },
  });
});