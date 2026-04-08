import { initTRPC, TRPCError } from "@trpc/server";
import type { Context } from "../context";

const t = initTRPC.context<Context>().create();

export const router = t.router;
export const publicProcedure = t.procedure;

export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({ ctx: { ...ctx, user: ctx.user } });
});

/** User-management and other Admin-app procedures (employee + admin portal accounts). */
export const adminPortalProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  const profile = await ctx.prisma.userProfile.findUnique({
    where: { id: ctx.user!.id },
    select: { id: true, portal: true },
  });
  const p = profile?.portal;
  if (!profile || (p !== "admin" && p !== "employee")) {
    throw new TRPCError({ code: "FORBIDDEN", message: "Admin application access only." });
  }
  return next({ ctx: { ...ctx, profile } });
});
