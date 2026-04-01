import { createUserSchema, userIdSchema } from "@myapp/types/schemas";
import { protectedProcedure, publicProcedure, router } from "../lib/trpc";

export const userRouter = router({
  me: protectedProcedure.query(async ({ ctx }) => {
    return ctx.user;
  }),

  getById: publicProcedure.input(userIdSchema).query(async ({ ctx, input }) => {
    const { data } = await ctx.supabase.from("users").select("*").eq("id", input.id).single();
    return data;
  }),

  create: protectedProcedure.input(createUserSchema).mutation(async ({ ctx, input }) => {
    const { data } = await ctx.supabase.from("users").insert(input).select().single();
    return data;
  }),
});
