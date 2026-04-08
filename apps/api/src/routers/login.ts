import { loginSchema } from "@myapp/types/schemas";
import { TRPCError } from "@trpc/server";
import { publicProcedure, router } from "../lib/trpc";

export const loginRouter = router({
  login: publicProcedure.input(loginSchema).mutation(async ({ ctx, input }) => {
    const { data, error } = await ctx.supabase.auth.signInWithPassword(input);
    if (error) throw new TRPCError({ code: "BAD_REQUEST", message: error.message });
    return data.session;
  }),
});
