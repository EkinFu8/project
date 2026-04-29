import type { User } from "@supabase/supabase-js";
import type { CreateHTTPContextOptions } from "@trpc/server/adapters/standalone";
import { createAudit } from "./lib/audit";
import { prisma } from "./lib/prisma";
import { createSupabaseClient } from "./lib/supabase";

type AuthProfile = {
  id: string;
  email: string;
  role: string;
  portal: string;
};

type AuthLookupResult = {
  user: User | null;
  profile: AuthProfile | null;
};

type SupabaseClient = ReturnType<typeof createSupabaseClient>;

const AUTH_LOOKUP_CACHE_MS = 10_000;
const AUTH_WARNING_CACHE_MS = 30_000;

const authLookupCache = new Map<string, { expiresAt: number; result: AuthLookupResult }>();
const authLookupInflight = new Map<string, Promise<AuthLookupResult>>();
const authWarningCache = new Map<string, number>();

function authCacheKey(authToken: string) {
  return authToken;
}

function warnAuthLookup(message: string, err?: unknown) {
  const now = Date.now();
  const lastWarnedAt = authWarningCache.get(message) ?? 0;
  if (now - lastWarnedAt < AUTH_WARNING_CACHE_MS) return;

  authWarningCache.set(message, now);
  if (err) {
    console.warn(message, err);
  } else {
    console.warn(message);
  }
}

async function resolveAuthContext(
  authToken: string,
  supabase: SupabaseClient,
): Promise<AuthLookupResult> {
  const cacheKey = authCacheKey(authToken);
  const cached = authLookupCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.result;
  }

  const inflight = authLookupInflight.get(cacheKey);
  if (inflight) {
    return inflight;
  }

  const lookup = (async () => {
    let result: AuthLookupResult = { user: null, profile: null };

    try {
      const { data, error } = await supabase.auth.getUser(authToken);
      if (error) {
        warnAuthLookup(`[context] auth.getUser: ${error.message}`);
      } else {
        result = {
          user: data.user,
          profile: await prisma.userProfile.findUnique({
            where: { id: data.user.id },
            select: {
              id: true,
              email: true,
              role: true,
              portal: true,
            },
          }),
        };
      }
    } catch (err) {
      warnAuthLookup("[context] auth.getUser failed:", err);
    }

    authLookupCache.set(cacheKey, {
      expiresAt: Date.now() + AUTH_LOOKUP_CACHE_MS,
      result,
    });

    return result;
  })();

  authLookupInflight.set(cacheKey, lookup);

  try {
    return await lookup;
  } finally {
    authLookupInflight.delete(cacheKey);
  }
}

/**
 * Inner context builder — adapter-agnostic. Takes an auth token directly.
 */
async function createContextInner(authToken: string | null) {
  const supabase = createSupabaseClient();
  const audit = createAudit(prisma);

  const { user, profile } = authToken
    ? await resolveAuthContext(authToken, supabase)
    : { user: null, profile: null };

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
