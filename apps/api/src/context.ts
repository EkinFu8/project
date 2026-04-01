import { createClient } from "@supabase/supabase-js";
import type { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import type { CreateHTTPContextOptions } from "@trpc/server/adapters/standalone";

/**
 * Inner context builder — adapter-agnostic. Takes an auth token directly.
 */
async function createContextInner(authToken: string | null) {
  const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!);

  let user = null;

  if (authToken) {
    const {
      data: { user: supabaseUser },
    } = await supabase.auth.getUser(authToken);
    user = supabaseUser;
  }

  return { supabase, user };
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

/**
 * Context for the Vercel Serverless fetch handler (Fetch Request).
 */
export async function createFetchContext({ req }: FetchCreateContextFnOptions) {
  const authHeader = req.headers.get("authorization");
  return createContextInner(extractBearerToken(authHeader));
}

export type Context = Awaited<ReturnType<typeof createContextInner>>;
