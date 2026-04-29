import { initTRPC } from "@trpc/server";
import type { Context } from "../context";

const t = initTRPC.context<Context>().create();

export const metricsMiddleware = t.middleware(async ({ next }) => {
  return next();
});
