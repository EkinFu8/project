import type { CreateHTTPContextOptions } from "@trpc/server/adapters/standalone";
import { createAudit } from "./lib/audit";
import { prisma } from "./lib/prisma";
import { createSupabaseClient } from "./lib/supabase";

/**
 * Inner context builder — adapter-agnostic. Takes an auth token directly.
 */
async function createContextInner(authToken: string | null) {
  const supabase = createSupabaseClient();
  const audit = createAudit(prisma);

  let user = null;
  let profile: any = null;

  if (authToken) {
    try {
      const { data, error } = await supabase.auth.getUser(authToken);
      if (error) {
        console.warn("[context] auth.getUser:", error.message);
      } else {
        user = data.user;

        profile = await prisma.userProfile.findUnique({
          where: { id: data.user.id },
          select: {
            id: true,
            email: true,
            role: true,
            portal: true,
          },
        });
      }
    } catch (err) {
      console.warn("[context] auth.getUser failed:", err);
    }
  }

  return {
    supabase,
    prisma,
    audit,
    user,
    profile,
  };
}

/**
 * Extract Bearer token from an authorization header value.
 */
function extractBearerToken(authHeader: string | null | undefined): string | null {
  if (!authHeader?.startsWith("Bearer ")) return null;
  return authHeader.slice(7);
}

/**
 * Context for the standalone Node.js dev server (IncomingMessage).
 */
export async function createContext({ req }: CreateHTTPContextOptions) {
  const authHeader = req.headers.authorization;
  return createContextInner(extractBearerToken(authHeader));
}

export type Context = Awaited<ReturnType<typeof createContextInner>>;
